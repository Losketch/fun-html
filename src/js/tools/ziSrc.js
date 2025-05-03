import '../../css/mainStyles.css';
import '../../css/fontFallback.css';
import '../../css/tools/ziSrc.css';

import '../changeHeader.js';
import '../iframeColorSchemeSync.js';
import '../m3ui.js';

import loadZiSrcWorker from '../workers/loadZiSrc.worker.js';

function loadZiSrc() {
  return new Promise((resolve, reject) => {
    const worker = new loadZiSrcWorker();

    worker.postMessage({});

    worker.addEventListener('message', event => {
      const { sourceDict, sourceComments, reverseDict } = event.data;
      resolve({ sourceDict, sourceComments, reverseDict });
    });

    worker.addEventListener('error', error => {
      reject(error);
    });
  });
}

(async () => {
  const { sourceDict, sourceComments, reverseDict } = await loadZiSrc();

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
})();
