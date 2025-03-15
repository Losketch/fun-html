import '../../css/mainStyles.css';
import '../../css/tools/nitpickTypo.css';

import '../changeHeader.js';
import '../iframeColorSchemeSync.js';
import '../m3ui.js';
import '../dialogs.js';

const textsArr = [
  '四维空间，[故]{顾}名思[意]{义}，它是由四个[纬]{维}度构成的。因此，它通常很难被生活在三[谁]{维}空间中的人类理解[：]{。}当然，我们可以用一些方法来简单[的]{地}理解它，比如线架投影[，]{、}[忠]{中}心投影[等]{}……四维空间中的正多胞体的种类是有限的，和三维空间中的正多面[休]{体}一样，只不过多了一种，共有六种，它们的数量将不会继续[増]{增}加。[他]{它}们分别是——正五胞体（四维单纯形）、正八胞体（超立方体）（四维超方形）、正十六胞体（四维[征]{正}轴形）[，]{、}正二十四[包]{胞}体、正一百二十胞体和正六百胞体。我们可以使用施莱格尔[头]{投}影（即四维[倒]{到}三维的透视投影）来较直观[得]{地}观察[他]{它}们[，]{。}'
];

const typoalTexts = document.getElementById('typoalTexts');
const remain = document.getElementById('remain');
const start = document.getElementById('start');
let remainingCount = 0;

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function processTypos(inputStr) {
  return inputStr.replace(
    /\[(.*?)\]\{(.*?)\}/g,
    '<span class="typo" data-correct="$2">$1</span>'
  );
}

function updateTypo() {
  const typos = typoalTexts.getElementsByClassName('typo');
  remainingCount = typos.length;
  remain.innerText = `剩余数量：${remainingCount}`;

  for (const typo of typos) {
    typo.addEventListener(
      'click',
      () => {
        const correctEle = document.createElement('span');
        correctEle.className = 'typo correct';
        correctEle.innerText = typo.dataset.correct;

        typo.after(correctEle);
        typo.classList.add('found');

        remainingCount--;
        remain.innerText = `剩余数量：${remainingCount}`;
      },
      { once: true }
    );
  }
}

typoalTexts.addEventListener('click', e => {
  if (e.target.classList.contains('typo')) return;

  alert('点击的字符是正确的，游戏已重置。');

  typoalTexts.innerHTML = processTypos(getRandomElement(textsArr));
  updateTypo();
});

updateTypo();

start.addEventListener('click', () => {
  typoalTexts.innerHTML = processTypos(getRandomElement(textsArr));
  updateTypo();
});
