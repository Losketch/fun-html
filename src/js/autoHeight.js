(function() {
  const textareas = document.querySelectorAll('.auto-height');
  const viewport = document.querySelector('meta[name="viewport"]');
  let originalScrollTop;
  let isKeyboardVisible = false;

  for (const textarea of textareas) {
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });

    textarea.addEventListener('focus', () => {
      originalScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      isKeyboardVisible = true;
      adjustViewport(textarea);
    });

    textarea.addEventListener('blur', () => {
      isKeyboardVisible = false;
      setTimeout(() => {
        window.scrollTo(0, originalScrollTop);
      }, 100);
    });

    window.addEventListener('resize', () => adjustViewport(textarea));
  }
  
  function adjustViewport(textarea) {
    if (!isKeyboardVisible) return;

    const rect = textarea.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      const targetScrollTop = scrollTop + rect.top - window.innerHeight / 2 + rect.height / 2;
      window.scrollTo(0, targetScrollTop);
    }

    window.parent.postMessage({
      type: 'adjustIframeHeight',
      height: document.body.scrollHeight
    }, '*');
  }
})();
