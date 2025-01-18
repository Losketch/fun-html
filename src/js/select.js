(function () {
  const selectContainers = document.querySelectorAll('.select-container');
  let isComposing = false;

  document.addEventListener('compositionstart', () => {
    isComposing = true;
  });

  document.addEventListener('compositionend', () => {
    isComposing = false;
  });

  for (let selectContainer of selectContainers) {
    const multi = selectContainer.classList.contains('multi');
    const select = selectContainer.querySelector('.select');
    const optionsList = selectContainer.querySelector('.opts-list');
    const curSelect = selectContainer.querySelector('.cur-select');
    const options = selectContainer.querySelectorAll('.opt');
    const selectContent = selectContainer.querySelector('.select-content');
    const filter = selectContainer.querySelector('.filter');

    select.addEventListener('click', e => {
      if (
        e.target.classList.contains('filter') ||
        optionsList.classList.contains('active')
      )
        return;
      optionsList.classList.add('active');
      const backdrop = document.createElement('div');
      backdrop.className = 'backdrop';
      backdrop.addEventListener('click', () => {
        optionsList.close();
        backdrop.remove();
      });
      document.body.appendChild(backdrop);
      updateOptionsListHeightAndFilterDisplay();
    });

    if (multi) {
      selectContainer.dataset.selected = '[]';
      selectContainer.dataset.selectedVisible = '[]';

      optionsList.close = () => {
        optionsList.classList.remove('active');
        if (!selectContainer.dataset.selected) return;
        const selected = JSON.parse(selectContainer.dataset.selected);
        if (selected.length) {
          curSelect.innerHTML = `已选择 ${selected.length} 个`;
        } else {
          curSelect.innerHTML = curSelect.dataset.defaultText;
        }
        selectContainer.dispatchEvent(
          new CustomEvent('select', {
            detail: {
              select: selected,
              selectVisible: JSON.parse(selectContainer.dataset.selectedVisible)
            }
          })
        );
        updateOptionsListHeightAndFilterDisplay();
      };

      options.forEach(option => {
        option.dataset.visibleSelect = option.innerText;
        option.addEventListener('click', () => {
          option.classList.toggle('selected');
          if (option.classList.contains('selected')) {
            const selected = new Set(
              JSON.parse(selectContainer.dataset.selected)
            );
            selected.add(option.dataset.select);
            selectContainer.dataset.selected = JSON.stringify([...selected]);
            const selectedVisible = new Set(
              JSON.parse(selectContainer.dataset.selectedVisible)
            );
            selectedVisible.add(option.dataset.visibleSelect);
            selectContainer.dataset.selectedVisible = JSON.stringify([
              ...selectedVisible
            ]);
          } else {
            const selected = new Set(
              JSON.parse(selectContainer.dataset.selected)
            );
            selected.delete(option.dataset.select);
            selectContainer.dataset.selected = JSON.stringify([...selected]);
            const selectedVisible = new Set(
              JSON.parse(selectContainer.dataset.selectedVisible)
            );
            selectedVisible.delete(option.dataset.visibleSelect);
            selectContainer.dataset.selectedVisible = JSON.stringify([
              ...selectedVisible
            ]);
          }
        });
      });

      selectContainer.addEventListener('cancelSelect', e => {
        const targetSelect = e.detail.targetSelect;
        const targetSelectVisible = e.detail.targetSelectVisible;

        const selected = new Set(JSON.parse(selectContainer.dataset.selected));
        selected.delete(targetSelect);
        selectContainer.dataset.selected = JSON.stringify([...selected]);
        const selectedVisible = new Set(
          JSON.parse(selectContainer.dataset.selectedVisible)
        );
        selectedVisible.delete(targetSelectVisible);
        selectContainer.dataset.selectedVisible = JSON.stringify([
          ...selectedVisible
        ]);

        options.forEach(option => {
          if (option.dataset.select == targetSelect)
            option.classList.remove('selected');
        });

        if ([...selected].length) {
          curSelect.innerHTML = `已选择 ${[...selected].length} 个`;
        } else {
          curSelect.innerHTML = curSelect.dataset.defaultText;
        }

        selectContainer.dispatchEvent(
          new CustomEvent('select', {
            detail: {
              select: JSON.parse(selectContainer.dataset.selected),
              selectVisible: JSON.parse(selectContainer.dataset.selectedVisible)
            }
          })
        );
      });
    } else {
      optionsList.close = () => {
        optionsList.classList.remove('active');
        updateOptionsListHeightAndFilterDisplay();
      };

      options.forEach(option => {
        option.dataset.visibleSelect = option.innerText;
        option.addEventListener('click', () => {
          options.forEach(option => option.classList.remove('selected'));
          curSelect.innerHTML = option.dataset.visibleSelect;
          selectContainer.dispatchEvent(
            new CustomEvent('select', {
              detail: { select: option.dataset.select }
            })
          );
          option.classList.add('selected');
          document.querySelector('.backdrop').remove();
          optionsList.close();
        });
      });
    }

    function updateOptionsListHeightAndFilterDisplay() {
      if (!optionsList.classList.contains('active')) {
        optionsList.style.transition = 'height 0.2s ease';
        filter.style.display = 'none';
        selectContent.style.display = null;
        optionsList.style.height = '0';
        return;
      }
      optionsList.style.transition = 'height 0.1s ease';
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
          .forEach(ele => (ele.style.display = 'block'));
        updateOptionsListHeightAndFilterDisplay();
        return;
      }
      optionsList
        .querySelectorAll(`.opt:not([data-visible-select*="${filter.value}"])`)
        .forEach(ele => (ele.style.display = 'none'));
      optionsList
        .querySelectorAll(`.opt[data-visible-select*="${filter.value}"]`)
        .forEach(ele => (ele.style.display = 'block'));
      updateOptionsListHeightAndFilterDisplay();
    });

    filter.addEventListener('compositionend', () => {
      setTimeout(() => filter.dispatchEvent(new Event('input')), 0);
    });
  }
})();
