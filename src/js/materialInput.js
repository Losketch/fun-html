(function () {
  function initializeMaterialInputs() {
    const materialInputContainers = document.querySelectorAll('.material-input-container');
    for (let materialInputContainer of materialInputContainers) {
      const label = materialInputContainer.querySelector('label');
      const input = materialInputContainer.querySelector('input') ||
        materialInputContainer.querySelector('textarea');
      if (label !== null) {
        if (input.value) label.classList.add('focus-label');
        input.addEventListener('focus', () => {
          if (!input.readOnly || input.value) label.classList.add('focus-label');
        });
        input.addEventListener('blur', () => {
          if (input.value) return;
          label.classList.remove('focus-label');
        });
        input.addEventListener("input", () => {
          if (input.value) label.classList.add('focus-label');
        })
      }
    }
  }
  initializeMaterialInputs();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        initializeMaterialInputs();
      }
    });
  });
  const config = { childList: true, subtree: true };
  observer.observe(document.body, config);
})();
