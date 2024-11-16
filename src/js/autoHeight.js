(function() {
  const viewport = document.querySelector('meta[name="viewport"]');
  let originalViewportContent;
  let originalScrollTop;
  let isKeyboardVisible = false;
  
  function autoHeight(textarea) {
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
      adjustViewport(this);
    });
    
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      originalViewportContent = viewport ? viewport.getAttribute('content') : '';
      
      textarea.addEventListener('focus', function() {
        originalScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        isKeyboardVisible = true;
        adjustViewport(this);
      });
    
      textarea.addEventListener('blur', function() {
        isKeyboardVisible = false;
        if (viewport) {
          viewport.setAttribute('content', originalViewportContent);
        }
        setTimeout(() => {
          window.scrollTo(0, originalScrollTop);
        }, 100);
      });
    
      window.addEventListener('resize', () => adjustViewport(textarea));
    }
  }
  
  function adjustViewport(textarea) {
    if (!isKeyboardVisible) return;
  
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    }
  
    const rect = textarea.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      const targetScrollTop = scrollTop + rect.top - window.innerHeight / 2 + rect.height / 2;
      window.scrollTo(0, targetScrollTop);
    }
  
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'adjustIframeHeight',
        height: document.body.scrollHeight
      }, '*');
    }
  }
  
  document.querySelectorAll('.auto-height').forEach(ele => autoHeight(ele))
})();