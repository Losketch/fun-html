const input = document.getElementById('text');
const bold = document.getElementById('bold');
const italic = document.getElementById('italic');
const boldstatus = document.getElementById('boldstatus')
const italicstatus = document.getElementById('italicstatus');
let boldOn = false;
let italicOn = false;

bold.addEventListener('click', () => {
  boldOn = boldOn ? false : true;
  input.style.fontWeight = boldOn ? 'bold' : 'normal';
  boldstatus.innerHTML = boldOn ? '开' : '关';
});

italic.addEventListener('click', () => {
  italicOn = italicOn ? false : true;
  input.style.fontStyle = italicOn ? 'italic' : 'normal';
  italicstatus.innerHTML = italicOn ? '开' : '关';
});

function clearText() {
  input.value = '';
  input.dispatchEvent(new Event('blur'));
  input.dispatchEvent(new Event('input'));;
  window.parent.postMessage('clearMainContentHeight', '*');
}

function clearText() {
  const textarea = document.getElementById('text');
  if (textarea) {
    textarea.value = '';
    textarea.style.height = 'auto';
  }
  window.parent.postMessage('clearMainContentHeight', '*');
}

document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('text');
  const viewport = document.querySelector('meta[name="viewport"]');
  let originalViewportContent;
  let originalScrollTop;
  let isKeyboardVisible = false;
  
  if (textarea) {
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
      adjustViewport();
    });

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      originalViewportContent = viewport ? viewport.getAttribute('content') : '';
      
      textarea.addEventListener('focus', function() {
        originalScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        isKeyboardVisible = true;
        adjustViewport();
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

      window.addEventListener('resize', adjustViewport);
    }
  } else {
    console.error('Textarea element with id "text" not found');
  }

  function adjustViewport() {
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
});
