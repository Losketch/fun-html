(function() {
  const textareas = document.querySelectorAll('.auto-height');
  for (textarea of textareas) {
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = (textarea.scrollHeight) + 'px';
    });
  }
})();