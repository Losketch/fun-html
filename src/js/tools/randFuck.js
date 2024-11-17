const startBtn = document.getElementById('start');
const countInput = document.getElementById('count');
const targetInput = document.getElementById('target');
const output = document.getElementById('res');

startBtn.addEventListener('click', () => {
  output.innerHTML = '';
  const count = +countInput.value;
  const targets = targetInput.value.split(';');
  const res = {};
  if (count > 10000) {
    output.innerHTML = '草人次数最大为一万';
    return;
  }
  if (count <= 0) {
    output.innerHTML = '草人次数最小为一';
    return;
  }
  for (let target of targets) {
    res[target] = 0;
  }
  for (let i = 0; i < count; i++) {
    res[targets[Math.floor(Math.random() * targets.length)]]++; 
  }
  for (let k in res) {
    output.innerHTML += `<span>${k}被草了${res[k]}次</span>`
  }
})
