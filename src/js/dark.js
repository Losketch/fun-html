(function () {
  'use strict';
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
    enableDarkMode() {
      document.documentElement.classList.add('dark');
      this.mainContent.contentWindow.postMessage(
        {
          type: 'outterColorSchemeChange',
          colorScheme: 'dark'
        },
        '*'
      );
    },
    disableDarkMode() {
      document.documentElement.classList.remove('dark');
      this.mainContent.contentWindow.postMessage(
        {
          type: 'outterColorSchemeChange',
          colorScheme: 'light'
        },
        '*'
      );
    },
    toggleDarkMode() {
      this.darkModeToggle.addEventListener('change', () => {
        if (this.darkModeToggle.selected) {
          util.setValue('dark_mode', 'dark');
          this.enableDarkMode();
        } else {
          util.setValue('dark_mode', 'light');
          this.disableDarkMode();
        }
      });

      this.mainContent.addEventListener('load', function () {
        this.contentWindow.postMessage(
          {
            type: 'outterColorSchemeChange',
            colorScheme: util.getValue('dark_mode')
          },
          '*'
        );
      });

      if (util.getValue('dark_mode') === 'dark') {
        this.darkModeToggle.selected = true;
        this.enableDarkMode();
      } else {
        this.darkModeToggle.selected = false;
        this.disableDarkMode();
      }
    },
    init() {
      this.toggleDarkMode();
    }
  };
  main.init();
})();
