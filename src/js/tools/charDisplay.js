const input = document.getElementById('text');
const bold = document.getElementById('bold');
const italic = document.getElementById('italic');
let boldOn = false;
let italicOn = false;

bold.addEventListener('click', () => {
  boldOn = boldOn ? false : true;
  input.style.fontWeight = boldOn ? 'bold' : 'normal';
});

italic.addEventListener('click', () => {
  italicOn = italicOn ? false : true;
  input.style.fontStyle = italicOn ? 'italic' : 'normal';
});

function clearText() {
  input.value = '';
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(new Event('blur'));
  window.parent.postMessage({ type: 'clearMainContentHeight'}, '*');
}
