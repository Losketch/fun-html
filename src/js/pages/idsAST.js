import '@css/hljsTheme.css';
import '@css/mainStyles.css';
import '@css/fontFallback.css';
import '@css/nerd-fonts-generated.min.css';
import '@css/pages/idsAST.css';

import '@js/m3ui.js';
import '@js/changeHeader.js';
import '@js/iframeColorSchemeSync.js';

import hljs from 'highlight.js';
import ids from '@js/IDS.js';

const input = document.getElementById('input');
const generateSvgCheckbox = document.getElementById('generateSvg');
const parseButton = document.getElementById('parse');
const copyButton = document.getElementById('copyButton');
const codeBlock = document.getElementById('jsonCode');
const inputerContainer = document.getElementById('inputerContainer');
const errorRes = document.getElementById('error');
const idsSvgContainer = document.getElementById('idsSvgContainer');
const parser = new ids.IdsParser();

String.prototype.toCharArray = function () {
  let arr = [];
  for (let i = 0; i < this.length; ) {
    const codePoint = this.codePointAt(i);
    i += codePoint > 0xffff ? 2 : 1;
    arr.push(String.fromCodePoint(codePoint));
  }
  return arr;
};

document.addEventListener('DOMContentLoaded', () => {
  const iconButtons = document.querySelectorAll('md-filled-tonal-icon-button');
  for (let iconButton of iconButtons) {
    iconButton.shadowRoot.querySelector('md-ripple').style.display = 'none';
  }
});

function handleInput(e) {
  if (e.target.id === 'inputer-container') return;
  if (e.target.classList.contains('placeholder')) return;
  if (e.type === 'touchend') {
    e.preventDefault();
  }

  const charToInsert = e.target.innerText;
  const startPos = input.selectionStart;
  const endPos = input.selectionEnd;
  const cursorPosition = input.selectionStart;
  const beforeInput = input.value.substring(0, startPos);
  const afterInput = input.value.substring(endPos);

  input.value = `${beforeInput}${charToInsert}${afterInput}`;

  const newPosition = cursorPosition + charToInsert.length;
  input.setSelectionRange(newPosition, newPosition);

  input.focus();
}

inputerContainer.addEventListener('click', handleInput);
inputerContainer.addEventListener('touchend', handleInput);

copyButton.addEventListener('click', () => {
  const code = document.getElementById('json-code').textContent;
  navigator.clipboard.writeText(code);
});

parseButton.addEventListener('click', () => {
  const inputValue = input.value;

  if (generateSvgCheckbox.checked) {
    idsSvgContainer.style.display = 'flex';
    idsSvgContainer.innerHTML = '正在生成 SVG……';

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://zu.zi.tools/${inputValue}.svg`, true);
    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const data = xhr.responseText;
        idsSvgContainer.innerHTML = data;
      } else if (xhr.readyState === 4 && xhr.status !== 200) {
        idsSvgContainer.innerHTML = `请求失败，状态码：${xhr.status}。`;
      }
    });
    xhr.send();
  } else {
    idsSvgContainer.style.display = 'none';
  }

  errorRes.style.display = 'none';
  let jsonObject;
  try {
    jsonObject = parser.parse(input.value).serializeNode();
  } catch (e) {
    if (!(e instanceof ids.IdsParseError)) throw e;

    const idsString = input.value.toCharArray();
    idsString[e.position] =
      `<span class="error">${idsString[e.position] ?? ' '}</span>`;

    errorRes.innerHTML = e.message + '<br>' + idsString.join('');
    errorRes.style.display = 'block';
    return;
  }

  const jsonString = JSON.stringify(jsonObject, null, 2);

  const highlightedJson = hljs.highlight(jsonString, { language: 'json' });
  codeBlock.innerHTML = highlightedJson.value;
  codeBlock.classList.add('hljs');
  codeBlock.classList.add('language-json');
});
