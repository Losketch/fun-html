(function () {
  'use strict';
  const MODE_LIGHT = 'light';
  const MODE_DARK = 'dark';
  const MODE_AUTO = 'auto';
  
  let util = {
    getValue(name) {
      return localStorage.getItem(name);
    },
    setValue(name, value) {
      localStorage.setItem(name, value);
    }
  };
  
  let main = {
    mainContent: document.getElementById('main-content'),
    darkModeToggle: document.getElementById('toggle-dark-button'),
    currentMode: MODE_LIGHT,
    
    isSystemDarkMode() {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },
    
    applyDarkMode(enabled) {
      if (enabled) {
        document.documentElement.classList.add('dark');
        this.mainContent.contentWindow.postMessage(
          { type: 'outterColorSchemeChange', colorScheme: 'dark' },
          '*'
        );
      } else {
        document.documentElement.classList.remove('dark');
        this.mainContent.contentWindow.postMessage(
          { type: 'outterColorSchemeChange', colorScheme: 'light' },
          '*'
        );
      }
    },
    
    updateIcon() {
      this.darkModeToggle.setAttribute('data-mode', this.currentMode);
    },
    
    handleModeChange() {
      if (this.currentMode === MODE_AUTO) {
        const systemIsDark = this.isSystemDarkMode();
        this.applyDarkMode(systemIsDark);
      } else if (this.currentMode === MODE_DARK) {
        this.applyDarkMode(true);
      } else {
        this.applyDarkMode(false);
      }
      
      this.updateIcon();
      util.setValue('dark_mode', this.currentMode);
    },
    
    toggleDarkMode() {
      this.darkModeToggle.addEventListener('click', () => {
        if (this.currentMode === MODE_LIGHT) {
          this.currentMode = MODE_DARK;
        } else if (this.currentMode === MODE_DARK) {
          this.currentMode = MODE_AUTO;
        } else {
          this.currentMode = MODE_LIGHT;
        }
        
        this.handleModeChange();
      });

      this.mainContent.addEventListener('load', () => {
        let modeToApply = this.currentMode;
        
        if (modeToApply === MODE_AUTO) {
          modeToApply = this.isSystemDarkMode() ? MODE_DARK : MODE_LIGHT;
        }
        
        this.mainContent.contentWindow.postMessage(
          { type: 'outterColorSchemeChange', colorScheme: modeToApply },
          '*'
        );
      });

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.currentMode === MODE_AUTO) {
          this.applyDarkMode(e.matches);
        }
      });
      
      const savedMode = util.getValue('dark_mode');
      if (savedMode && [MODE_LIGHT, MODE_DARK, MODE_AUTO].includes(savedMode)) {
        this.currentMode = savedMode;
      } else {
        this.currentMode = this.isSystemDarkMode() ? MODE_DARK : MODE_LIGHT;
      }
      
      this.updateIcon();
      
      if (this.currentMode === MODE_AUTO) {
        this.applyDarkMode(this.isSystemDarkMode());
      } else if (this.currentMode === MODE_DARK) {
        this.applyDarkMode(true);
      } else {
        this.applyDarkMode(false);
      }
    },
    
    init() {
      this.toggleDarkMode();
    }
  };
  main.init();
})();
