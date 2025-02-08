import '../../css/mainStyles.css';
import '../../css/fontFallback.css';
import '../../css/tools/ziSrc.css';

import '../changeHeader.js';
import '../iframeColorSchemeSync.js';
import '../m3ui.js';

import source from '../../data/source.json.txt';

const { sourceDict, sourceComments } = JSON.parse(source);
const reverseDict = buildReverse(sourceDict);

function buildReverse(sourceDict) {
  const result = {};
  for (const [key, sources] of Object.entries(sourceDict)) {
    sources.forEach(source => {
      if (source) {
        if (source in result) {
          result[source] += key;
        } else {
          result[source] = key;
        }
        let big = source.split('-');
        if (big[0] !== source) {
          big = big[0];
          if (big in result) {
            result[big] += key;
          } else {
            result[big] = key;
          }
        }
      }
    });
  }
  return result;
}

String.prototype.toCharArray = function () {
  const arr = [];
  for (let i = 0; i < this.length; ) {
    const codePoint = this.codePointAt(i);
    i += codePoint > 0xffff ? 2 : 1;
    arr.push(String.fromCodePoint(codePoint));
  }
  return arr;
};

const input = document.getElementById('input');
const searchBtn = document.getElementById('search-btn');
const peggingBtn = document.getElementById('pegging-btn');
const resultEle = document.getElementById('result');
const sourceCommentsEle = document.getElementById('source-comments');

for (const [source, comment] of Object.entries(sourceComments)) {
  const li = document.createElement('li');
  li.innerHTML = `${source}：${comment}`;
  sourceCommentsEle.appendChild(li);
}

searchBtn.addEventListener('click', () => {
  resultEle.innerHTML = '';
  const queryArr = input.value.toCharArray();

  for (const char of queryArr) {
    let sources = sourceDict[char];
    if (Array.isArray(sources)) {
      sources = sources.filter(Boolean);
      const li = document.createElement('li');

      li.innerHTML = `<span class="font-without-ctrlctrl">${char}</span>：${sources.join('，')}`;
      resultEle.appendChild(li);
    }
  }
});

peggingBtn.addEventListener('click', () => {
  const queryArr = input.value.split(',');
  resultEle.innerHTML = '';
  for (const query of queryArr) {
    let chars = reverseDict[query];
    if (typeof chars === 'string') {
      const li = document.createElement('li');

      li.innerHTML = `${query}：<span class="font-without-ctrlctrl">${chars}</span>`;
      resultEle.appendChild(li);
    }
  }
});
