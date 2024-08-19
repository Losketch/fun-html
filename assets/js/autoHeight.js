const autoHeight = (e) => {
  const textarea = e.target;
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

document.querySelectorAll('.auto-height').forEach(ele => ele.addEventListener('input', autoHeight))