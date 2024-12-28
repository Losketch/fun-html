(function() {
  const buttons = document.querySelectorAll('button:not(.no-ripple)');

  for (let button of buttons) {
    button.addEventListener('click', function (e) {
      const button = e.currentTarget;
  
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
  
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      ripple.classList.add('ripple');
      ripple.classList.add('no-invert');
  
      button.appendChild(ripple);
  
      ripple.addEventListener('animationend', () => {
          ripple.remove();
      });
    });
  }
})();