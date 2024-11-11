(function() {
  'use strict';
  let util = {
    getValue(name) {
      return localStorage.getItem(name);
    },
    setValue(name, value) {
      localStorage.setItem(name, value);
    },
    addStyle(id, tag, css) {
      tag = tag || 'style';
      let doc = document,
        styleDom = doc.getElementById(id);
      if (styleDom) return;
      let style = doc.createElement(tag);
      style.rel = 'stylesheet';
      style.id = id;
      tag === 'style' ? style.innerHTML = css : style.href = css;
      doc.head.appendChild(style);
    },
    addThemeColor(color) {
      let doc = document,
        meta = doc.getElementsByName('theme-color')[0];
      if (meta) return meta.setAttribute('content', color);
      let metaEle = doc.createElement('meta');
      metaEle.name = 'theme-color';
      metaEle.content = color;
      doc.head.appendChild(metaEle);
    },
    getThemeColor() {
      let meta = document.getElementsByName('theme-color')[0];
      if (meta) {
        return meta.content;
      }
      return '#ffffff';
    },
    removeElementById(eleId) {
      let ele = document.getElementById(eleId);
      ele && ele.parentNode.removeChild(ele);
    }
  };
  let main = {
    enableDarkMode() {
      this.createDarkStyle();
      util.addThemeColor('#131313');
    },
    disableDarkMode() {
      util.removeElementById('dark-mode-style');
      util.addThemeColor(util.getValue('origin_theme_color'));
    },
    createDarkStyle() {
      util.addStyle('dark-mode-style', 'style', `
        html {
            filter: invert(1) hue-rotate(180deg);
            scrollbar-color: #454a4d #202324;
        }
        img, video, canvas, svg {
            filter: invert(1) hue-rotate(180deg);
            fill: unset;
        }
        ::-webkit-scrollbar {
            display: none;
        }
      `);
    },
    toggleDarkMode() {
      const darkModeToggle = document.getElementById('darkmode-toggle');
      darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
          util.setValue('dark_mode', 'dark');
          this.enableDarkMode();
        } else {
          util.setValue('dark_mode', 'light');
          this.disableDarkMode();
        }
      });
      if (util.getValue('dark_mode') === 'dark') {
        darkModeToggle.checked = true;
        this.enableDarkMode();
      } else {
        darkModeToggle.checked = false;
      }
    },
    init() {
      util.setValue('origin_theme_color', util.getThemeColor());
      this.toggleDarkMode();
    }
  };
  main.init();
})();
