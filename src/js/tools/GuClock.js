let time = [0, 0, 0];
let prevTime = Date.now();
let isStop = false;
const setAsCurrentTimeBtn = document.getElementById('set-as-current-time');

const setTime = (hour, min, sec) => {
  time = [hour, min, sec];
  document.body.style.setProperty(
    '--hour',
    ((hour + min / 60 + sec / 3600) % 12) * 30 + 90 + 'deg'
  );
  document.body.style.setProperty(
    '--min',
    ((min + sec / 60) % 60) * 6 + 90 + 'deg'
  );
  document.body.style.setProperty('--sec', (sec % 60) * 6 + 90 + 'deg');
};

setAsCurrentTimeBtn.addEventListener('click', () => {
  isStop = true;
  const now = new Date();
  const hour = now.getHours();
  const min = now.getMinutes();
  const sec = now.getSeconds();
  setTime(hour, min, sec);
  start();
});

const refreshTime = () => {
  const step = (Date.now() - prevTime) / 1000;
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
  setTime(...time);
};

const start = () => {
  isStop = false;
  refreshTime();
};

start();

const timeEle = document.getElementById('time');
timeEle.addEventListener('change', () => {
  isStop = true;
  setTime(...timeEle.value.split(':').map((e) => +e));
  start();
});

const originalFramePath =
  'M147 763V421h406l1 148c0 155 0 159-4 170-6 13-22 20-48 23-22 3-86 2-86 2l-10-33-5-10h43c46 0 52 0 56-5 3-5 2-48 2-63H196l-1 111zm356-206H197l-1 53 307 1Zm0-92H197l-1 51 307 1Zm-447 1V332l97-1 1-331h392l1 331 97 1v134h-50v-88H104v88zM494 43H205l-1 288h290Z';
const newFramePath =
  'm515 1-30 22H214L155 6v328H91c-2-12-5-26-10-40H67c5 45-16 91-40 110-17 10-27 25-19 42 10 17 37 15 54 1 19-15 34-46 31-91h515c-6 24-15 53-21 71l10 5c22-18 53-47 70-68 15-1 23-2 30-7l-59-54-33 31h-62V52c15-3 28-8 33-14zM204 44h289l1 290-288-1zm306 351-26 30H209l-54-24v378h8c22 0 42-12 42-18V637h286v68c0 11-4 16-18 16-17 0-98-6-98-6v12c36 4 56 11 68 17 10 9 15 20 17 35 73-6 82-31 82-69V456c16-2 28-8 33-14zm-305 52h286v71H205Zm0 93h286v74H205Z';
const originalHandPath = 'M 0,0 H 500 V 500 H 0 Z';
const newHandPath = 'M 184,500 262,197 H 500 V 2 H 245 L 0,0 Z';

const togglePathButton = document.getElementById('togglePathButton');
const framePath = document.getElementById('framePath');
const hands = document.querySelectorAll('.hand');
const handPaths = document.querySelectorAll('.handPath');

let isNewPath = false;

togglePathButton.addEventListener('click', () => {
  framePath.setAttribute('d', isNewPath ? originalFramePath : newFramePath);
  handPaths.forEach((handPath) => {
    handPath.setAttribute('d', isNewPath ? originalHandPath : newHandPath);
  });
  hands.forEach((hand) => {
    hand.style.height = isNewPath ? '19px' : '13px';
    hand.style.top = isNewPath ? '84px' : '87px';
  });
  isNewPath = !isNewPath;
});
