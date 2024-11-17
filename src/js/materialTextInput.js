(function () {
  const textInputContainers = document.querySelectorAll('.text-input-container');
  for (let textInputContainer of textInputContainers) {
    const label = textInputContainer.querySelector('label');
    const input = textInputContainer.querySelector('input');
    const bar = textInputContainer.querySelector('span');
    const inputRect = input.getBoundingClientRect();
    if (label !== null) {
      const labelRect = label.getBoundingClientRect();
      label.style.left = inputRect.left - labelRect.left + 5 + 'px';
    }
    bar.style.width = inputRect.right - inputRect.left + 'px';
    input.required = "required";
  }
  
  const textareaContainers = document.querySelectorAll('.textarea-container');
  for (let textareaContainer of textareaContainers) {
    const label = textareaContainer.querySelector('label');
    const textarea = textareaContainer.querySelector('textarea');
    const bar = textareaContainer.querySelector('span');
    const textareaRect = textarea.getBoundingClientRect();
    if (label !== null) {
      const labelRect = label.getBoundingClientRect();
      label.style.left = textareaRect.left - labelRect.left + 5 + 'px';
    }
    bar.style.width = textareaRect.right - textareaRect.left + 'px';
    textarea.required = "required";
  }
})()