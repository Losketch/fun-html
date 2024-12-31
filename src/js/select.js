(function() {
  const selectContainers = document.querySelectorAll('.select-container');
  let isComposing = false;
  
  document.addEventListener('compositionstart', () => {
    isComposing = true;
  });
  
  document.addEventListener('compositionend', () => {
    isComposing = false;
  });
  
  for (let selectContainer of selectContainers) {
    const select = selectContainer.querySelector('.select');
    const optionsList = selectContainer.querySelector('.opts-list');
    const curSelect = selectContainer.querySelector('.cur-select');
    const options = selectContainer.querySelectorAll('.opt');
    const selectContent = selectContainer.querySelector('.select-content');
    const filter = selectContainer.querySelector('.filter');
  
    select.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter')) return;
      optionsList.classList.toggle('active');
      updateOptionsListHeightAndFilterDisplay();
    });
  
    options.forEach((option) => {
      option.addEventListener('click', () => {
        options.forEach((option) => option.classList.remove('selected'));
        curSelect.innerHTML = option.innerHTML;
        selectContainer.dispatchEvent(
          new CustomEvent('select', {
            detail: { select: option.dataset.select },
          })
        );
        option.classList.add('selected');
        optionsList.classList.toggle('active');
        updateOptionsListHeightAndFilterDisplay();
      });
      option.dataset.visibleSelect = option.innerText;
    });
  
    function updateOptionsListHeightAndFilterDisplay() {
      if (!optionsList.classList.contains('active')) {
        filter.style.display = 'none';
        selectContent.style.display = null;
        optionsList.style.height = '0';
        return;
      }
      filter.style.display = 'initial';
      selectContent.style.display = 'none';
      const prevHeight = optionsList.style.height;
      optionsList.style.height = 'auto';
      const rects = optionsList.getBoundingClientRect();
      const height = rects.bottom - rects.top;
      optionsList.style.height = prevHeight;
      optionsList.clientTop;
      optionsList.style.height = `${height}px`;
    }
  
    filter.addEventListener('input', () => {
      if (isComposing) return;
      if (!filter.value) {
        optionsList
          .querySelectorAll('.opt')
          .forEach((ele) => (ele.style.display = 'block'));
        updateOptionsListHeightAndFilterDisplay();
        return;
      }
      optionsList
        .querySelectorAll(`.opt:not([data-visible-select*="${filter.value}"])`)
        .forEach((ele) => (ele.style.display = 'none'));
      optionsList
        .querySelectorAll(`.opt[data-visible-select*="${filter.value}"]`)
        .forEach((ele) => (ele.style.display = 'block'));
      updateOptionsListHeightAndFilterDisplay();
    });
  
    filter.addEventListener('compositionend', () => {
      setTimeout(() => filter.dispatchEvent(new Event('input')), 0);
    });
  }
})();
