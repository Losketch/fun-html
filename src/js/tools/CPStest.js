import '../../css/mainStyles.css';
import '../../css/tools/CPStest.css';

import '../m3ui.js';
import '../changeHeader.js';
import '../iframeColorSchemeSync.js';

let countdown = 30;
let timer;
let startTime;
const timeElement = document.getElementById('time');
const clicksElement = document.getElementById('clicks');
const startButton = document.getElementById('start');
const clickButton = document.getElementById('click');
const recoverButton = document.getElementById('recover');
const result = document.getElementById('result');
let counter = 0;

function updateCountdown() {
  timer = requestAnimationFrame(updateCountdown);
  timeElement.innerHTML = countdown.toFixed(2);
  if (countdown <= 0) {
    cancelAnimationFrame(timer);
    clickButton.disabled = true;
    recoverButton.disabled = false;
    result.innerText = 'CPS: ' + counter / 30;
  }
  clicksElement.innerHTML = '点击数：' + counter;
  countdown = 30 - (Date.now() - startTime) / 1000;
}

clickButton.addEventListener('click', () => counter++);

startButton.addEventListener('click', () => {
  startTime = Date.now();
  updateCountdown();
  clickButton.disabled = false;
  startButton.disabled = true;
});

recoverButton.addEventListener('click', () => {
  location.reload();
  recoverButton.disabled = true;
});
