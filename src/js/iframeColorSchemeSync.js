'use strict';
window.addEventListener('message', event => {
  if (event.data.type === 'outterColorSchemeChange') {
    if (event.data.colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (event.data.colorScheme === 'light') {
      document.documentElement.classList.remove('dark');
    }
  }
});
