const input = document.getElementById('text');
const bold = document.getElementById('bold');
const italic = document.getElementById('italic');
const boldstatus = document.getElementById("boldstatus")
const italicstatus = document.getElementById("italicstatus");
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
  input.style.height = 'auto';
  window.parent.postMessage({type: 'clearMainContentHeight'}, '*');
}
