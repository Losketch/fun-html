const input = document.getElementById('text');
const bold = document.getElementById('bold');
const italic = document.getElementById('italic');

bold.addEventListener('change', () => {
  input.style.fontWeight = bold.checked ? 'bold' : 'normal';
});

italic.addEventListener('change', () => {
  input.style.fontStyle = italic.checked ? 'italic' : 'normal';
});