var time = [0, 0, 0];
var prevTime = Date.now();
var isStop = false;

const start = () => {
  isStop = false;
  refreshTime();
}

const setTime = (hour, min, sec) => {
  time = [hour, min, sec];
  document.body.style.setProperty('--hour', (hour + min / 60 + sec / 3600) % 12 * 30 + 90 + 'deg');
  document.body.style.setProperty('--min', (min + sec / 60) % 60 * 6 + 90 +  'deg');
  document.body.style.setProperty('--sec', sec % 60 * 6 + 90 +  'deg');
}

const setAsCurrentTime = () => {
  isStop = true;
  const now = new Date();
  const hour = now.getHours();
  const min = now.getMinutes();
  const sec = now.getSeconds();
  setTime(hour, min, sec);
  start();
}

const refreshTime = () => {
  step = (Date.now() - prevTime) / 1000;
  prevTime = Date.now();
  time[2] += step;
  if (time[2] >= 60) {
    time[2] -= 60;
    time[1]++;
  }
  if (time[1] >= 60) {
    time[1] -= 60;
    time[0]++;
  }
  if (time[0] >= 24) {
    time[0] = 0;
  }
  if (!isStop) {
    requestAnimationFrame(refreshTime);
  }
  setTime(...time)
}

const timeEle = document.getElementById('time');
timeEle.addEventListener('change', () => {
  isStop = true;
  setTime(...timeEle.value.split(':').map(e => +e));
  start();
})

start();