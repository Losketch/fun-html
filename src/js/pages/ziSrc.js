import '@css/mainStyles.css';
import '@css/fontFallback.css';
import '@css/pages/ziSrc.css';

import '@js/changeHeader.js';
import '@js/iframeColorSchemeSync.js';
import '@js/m3ui.js';

import ZiSrcClient from '@js/zisrc/client.js';

const elements = {
  input: document.getElementById('queryInput'),
  charSearchButton: document.getElementById('charSearchButton'),
  sourceSearchButton: document.getElementById('sourceSearchButton'),
  datasetStatus: document.getElementById('datasetStatus'),
  result: document.getElementById('result'),
  sourceComments: document.getElementById('sourceComments')
};

const client = new ZiSrcClient();

function clearResults() {
  elements.result.replaceChildren();
}

function makeEmptyResult(text = '没有匹配结果。') {
  const li = document.createElement('li');
  li.className = 'empty-result';
  li.textContent = text;
  return li;
}

function renderSourceComments(comments) {
  const fragment = document.createDocumentFragment();
  for (const [source, comment] of Object.entries(comments ?? {})) {
    const li = document.createElement('li');
    const code = document.createElement('strong');
    code.textContent = source;
    li.append(code, `：${comment}`);
    fragment.appendChild(li);
  }
  elements.sourceComments.replaceChildren(fragment);
}

function renderCharacterResults(rows) {
  clearResults();
  if (!rows.length) {
    elements.result.appendChild(makeEmptyResult());
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const row of rows) {
    const li = document.createElement('li');
    const char = document.createElement('span');
    char.className = 'result-char font-without-ctrlctrl';
    char.textContent = row.char;
    li.append(char, '：');

    if (!row.sources.length) {
      li.append('无 IRG Source');
    } else {
      row.sources.forEach((source, index) => {
        if (index) li.append('，');
        const value = document.createElement('span');
        value.textContent = source.value;
        value.title = source.field;
        li.appendChild(value);
      });
    }
    fragment.appendChild(li);
  }
  elements.result.appendChild(fragment);
}

function renderSourceResults(rows) {
  clearResults();
  if (!rows.length) {
    elements.result.appendChild(makeEmptyResult());
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const row of rows) {
    const li = document.createElement('li');
    const label = document.createElement('strong');
    label.textContent = `${row.query}：`;
    li.appendChild(label);

    if (!row.chars.length) {
      li.append('无匹配字符');
    } else {
      const chars = document.createElement('span');
      chars.className = 'reverse-chars font-without-ctrlctrl';
      chars.textContent = row.chars.join('');
      li.appendChild(chars);
    }
    fragment.appendChild(li);
  }
  elements.result.appendChild(fragment);
}

async function searchCharacters() {
  const chars = Array.from(elements.input.value.replace(/\s/g, ''));
  if (!chars.length) {
    clearResults();
    return;
  }
  try {
    renderCharacterResults(await client.queryChars(chars));
  } catch (error) {
    clearResults();
    elements.result.appendChild(makeEmptyResult(`查询失败：${error.message}`));
    console.error(error);
  }
}

async function searchSources() {
  const sources = elements.input.value
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  if (!sources.length) {
    clearResults();
    return;
  }
  try {
    renderSourceResults(await client.querySources(sources));
  } catch (error) {
    clearResults();
    elements.result.appendChild(makeEmptyResult(`反查失败：${error.message}`));
    console.error(error);
  }
}

function bindEvents() {
  elements.charSearchButton.addEventListener('click', searchCharacters);
  elements.sourceSearchButton.addEventListener('click', searchSources);
  elements.input.addEventListener('keydown', event => {
    if (event.isComposing || event.code !== 'Enter') return;
    event.preventDefault();
    searchCharacters();
  });
  window.addEventListener('beforeunload', () => client.terminate());
}

function init() {
  bindEvents();
  client.ready
    .then(stats => {
      elements.datasetStatus.dataset.state = 'ready';
      elements.datasetStatus.textContent =
        `Unicode ${stats.unicode} · 收录 ${stats.characterCount.toLocaleString()} 字`;
      renderSourceComments(stats.sourceComments);
      elements.charSearchButton.disabled = false;
      elements.sourceSearchButton.disabled = false;
    })
    .catch(error => {
      elements.datasetStatus.dataset.state = 'error';
      elements.datasetStatus.textContent = '字源数据加载失败';
      console.error(error);
    });
}

init();
