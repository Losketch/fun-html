import '@css/mainStyles.css';
import '@css/pages/nitpickTypo.css';

import '@js/changeHeader.js';
import '@js/iframeColorSchemeSync.js';
import '@js/m3ui.js';
import '@js/dialogs.js';

const textsArr = [
  '四维空间，[故]{顾}名思[意]{义}，它是由四个[纬]{维}度构成的。因此，它通常很难被生活在三[谁]{维}空间中的人类理解[：]{。}当然，我们可以用一些方法来简单[的]{地}理解它，比如线架投影[，]{、}[忠]{中}心投影<1%等>{}<1%……>{}四维空间中的正多胞体的种类是有限的，和三维空间中的正多面[休]{体}一样，只不过多了一种，共有六种，它们的数量将不会继续[増]{增}加。[他]{它}们分别是——正五胞体（四维单纯形）、正八胞体（超立方体[）（]{／}四维超方形）、正十六胞体（四维[征]{正}轴形）[，]{、}正二十四[包]{胞}体、正一百二十胞体和正六百胞体。我们可以使用施莱格尔[头]{投}影（即四维[倒]{到}三维的透视投影）来较直观[得]{地}观察[他]{它}们[，]{。}',
  '桃树、[杳]{杏}树、梨树，你不让我[、]{，}我不让你，都开满了花赶趟儿。红[得]{的}像火，粉[得]{的}像霞，白[得]{的}像[雷]{雪}。花里带着甜[昧]{味}，闭了眼，树上仿佛[己]{已}经满是桃儿、杏儿、梨儿[，]{。}花下成千成百的蜜蜂嗡嗡[的]{地}闹着，大小的[胡]{蝴}蝶飞来飞去。野花遍地是[。]{：}杂[祥]{样}儿，有名字的，没名字的，散在草[从]{丛}[哩]{里}，像眼[晴]{睛}，像星星，还眨呀眨[地]{的}。',
  '蒜[苔]{薹}，又称蒜[亳]{毫}，蒜苗，为[末]{未}开花的大蒜花[廷]{莛}，是常吃的蔬菜之一。蒜[苔]{薹}是蔬菜冷藏业中[伫]{贮}量最大[，]{、}[伫]{贮}期最长的蔬菜品类之一，用于生长蒜[苔]{薹}的大蒜在中[囯]{国}南北各地均有种植。<br>蒜[苔]{薹}产地主要有山东[仓]{苍}山、江苏射阳、河北永年、黑[尤]{龙}江阿城、陕西[歧]{岐}山、甘肃泾川等地[、]{，}以山东苍山品质最佳。[苔]{薹}条适于长期[伫]{贮}[臧]{藏}，在常温下可[伫]{贮}存20~30天，在冷藏气调下则可[伫]{贮}藏7~10个月。'
];

const typoalTexts = document.getElementById('typoalTexts');
const remain = document.getElementById('remain');
const start = document.getElementById('start');
let remainingCount = 0;

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function processTypos(inputStr) {
  const singleReplaced = inputStr.replace(
    /\[(.*?)\]\{(.*?)\}/g,
    '<span class="typo" data-correct="$2">$1</span>'
  );

  const multiReplaced = singleReplaced.replace(
    /<(\d+)%(.*?)>\{(.*?)\}/g,
    '<span class="multitypo" data-group="$1" data-correct="$3">$2</span>'
  );

  return multiReplaced;
}

function updateTypo() {
  const typos = typoalTexts.getElementsByClassName('typo');
  const multitypos = typoalTexts.getElementsByClassName('multitypo');

  const groupedMultitypos = {};
  for (const multitypo of multitypos) {
    const group = multitypo.dataset.group;

    if (!groupedMultitypos[group]) {
      groupedMultitypos[group] = [];
    }

    groupedMultitypos[group].push(multitypo);
  }

  remainingCount = typos.length + Object.keys(groupedMultitypos).length;
  remain.innerText = `剩余数量：${remainingCount}`;

  function clickTypo(e) {
    const typo = e.target;
    const correctEle = document.createElement('span');
    correctEle.className = 'typo correct';
    correctEle.innerText = typo.dataset.correct;

    typo.after(correctEle);
    typo.classList.add('found');

    remainingCount--;
    remain.innerText = `剩余数量：${remainingCount}`;
  }

  function clickMultitypo(e) {
    clickTypo(e);
    for (const multitypo of groupedMultitypos[e.target.dataset.group]) {
      multitypo.removeEventListener('click', clickMultitypo);
    }
  }

  for (const typo of typos) {
    typo.addEventListener('click', clickTypo, { once: true });
  }

  for (const group in groupedMultitypos) {
    for (const multitypo of groupedMultitypos[group]) {
      multitypo.addEventListener('click', clickMultitypo, { once: true });
    }
  }
}

typoalTexts.addEventListener('click', e => {
  if (
    e.target.classList.contains('typo') ||
    e.target.classList.contains('multitypo')
  )
    return;

  alert('点击的字符是正确的，游戏已重置。');

  typoalTexts.innerHTML = processTypos(getRandomElement(textsArr));
  updateTypo();
});

updateTypo();

start.addEventListener('click', () => {
  typoalTexts.innerHTML = processTypos(getRandomElement(textsArr));
  updateTypo();
});
