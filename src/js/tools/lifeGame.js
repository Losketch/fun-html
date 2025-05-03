import '../../css/mainStyles.css';
import '../../css/nerd-fonts-generated.min.css';
import '../../css/tools/lifeGame.css';

import '../m3ui.js';
import '../dialogs.js';
import '../changeHeader.js';
import '../iframeColorSchemeSync.js';

let birth = [3];
let star = [2, 3];
let typeCount = 2;

const container = document.getElementById('container');
const [
  exportBtn,
  importInp,
  importBtn,
  generationsInp,
  jumpBtn,
  ruleSpan,
  stateBtn,
  stateShow,
  gridSizeBtn,
  gridSizeShow,
  gapBtn,
  gapShow,
  startBtn,
  pauseBtn,
  prevBtn,
  nextBtn,
  saveBtn,
  clearGenerationsBtn,
  resetBtn,
  setRuleBtn
] =
  'export import importBtn generations jump rule state stateShow gridSize gridSizeShow gap gapShow start pause prev next save clear-generations reset set-rule'
    .split(' ')
    .map(n => document.getElementById(n));
let size = 20;
let count;
let timerId;
let generationsCount = 0;
let maxGenerationsCount = 0;
let generations = [];
let generationsMap = {};
let fillState = -1;
let style = null;
let cells = [];
let gap = 50;

let bitLen = BigInt(Math.floor(Math.log2(typeCount - 1)) + 1);

function toggle(e) {
  const cell = e.target;
  if (cell.tagName !== 'CELL') return;
  if (fillState === -1) {
    let state = +cell.dataset.life;
    state++;
    cell.dataset.life = state > typeCount - 1 ? 0 : state;
  } else {
    cell.dataset.life = fillState;
  }
}

function resetGrid(size) {
  container.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  count = size ** 2;

  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const cell = document.createElement('cell');
    cell.dataset.life = '0';
    cells.push(cell);
    container.appendChild(cell);
  }
}

function resetStyle(typeCount) {
  style?.remove();
  style = document.createElement('style');
  const unit = 1 / (typeCount - 1);
  for (let i = 1; i < typeCount; i++) {
    style.innerHTML += `
      cell[data-life='${i}'] {
        background-color: rgb(${getComputedStyle(document.documentElement).getPropertyValue('--md-sys-color-cell-life-max')}, ${(typeCount - i) * unit});
      }
    `;
  }
  document.head.appendChild(style);
}

function loop(id) {
  return id < 0 ? id + size : id > count - 1 ? id - size : id;
}

function prevCell(id) {
  let id_ = id - 1;
  if (Math.floor(id_ / size) !== Math.floor(id / size)) id_ += size;
  return loop(id_);
}

function nextCell(id) {
  let id_ = id + 1;
  if (Math.floor(id_ / size) !== Math.floor(id / size)) id_ -= size;
  return loop(id_);
}

function getRoundCellsCount(id) {
  let prevRow = id - size;
  let nextRow = id + size;
  prevRow += prevRow < 0 ? count : 0;
  nextRow -= nextRow > count - 1 ? count : 0;
  return [
    cells[prevCell(prevRow)],
    cells[prevRow],
    cells[nextCell(prevRow)],
    cells[prevCell(id)],
    cells[nextCell(id)],
    cells[prevCell(nextRow)],
    cells[nextRow],
    cells[nextCell(nextRow)]
  ].filter(v => v.dataset.life === '1').length;
}

function getNextState(state, roundCellsCount) {
  if (state === 1) {
    if (star.includes(roundCellsCount)) {
      return 1;
    } else {
      state++;
      return state > typeCount - 1 ? 0 : state;
    }
  } else if (state > 1) {
    state++;
    return state > typeCount - 1 ? 0 : state;
  } else if (birth.includes(roundCellsCount)) {
    return 1;
  }
  return 0;
}

function nextGeneration() {
  if (generations.length === 0) saveGeneration();
  generationsCount++;
  updateCount();
  maxGenerationsCount = generationsCount;
  updateCount();
  for (let i = 0; i < count; i++) {
    const cell = cells[i];
    const roundCellsCount = getRoundCellsCount(i);
    cell.dataset.lifeTemp = getNextState(+cell.dataset.life, roundCellsCount);
  }
  cells.forEach(v => (v.dataset.life = v.dataset.lifeTemp));
  saveGeneration();
}

function saveGeneration() {
  let _t = 0n;
  for (let i = 0; i < count; i++) {
    _t <<= bitLen;
    _t += BigInt(cells[i].dataset.life);
  }
  generations.push(_t);
  generationsMap[generationsCount] = generations.length - 1;
}

function toGeneration(generation) {
  for (let i = count - 1; i >= 0; i--) {
    cells[i].dataset.life = generation & (2n ** bitLen - 1n);
    generation >>= bitLen;
  }
}

function prevGeneration() {
  generationsCount--;
  generationsCount >= 0
    ? toGeneration(generations[generationsMap[generationsCount]])
    : (generationsCount = 0);
  updateCount();
}

function bigintToArray(bigInt) {
  let bytes = [];
  let temp = bigInt;

  while (temp > 0n) {
    bytes.unshift(Number(temp & 0xffn));
    temp = temp >> 8n;
  }

  return bytes;
}

function intToArray(int) {
  const result = [];

  while (int > 0) {
    result.push(Number(int & 0xff));
    int >>= 8;
  }

  return result.reverse();
}

function uint8ArrayToHexString(uint8Array) {
  return Array.from(uint8Array)
    .map(i => {
      let hex = i.toString(16);
      hex = (hex.length === 2 ? '' : '0') + hex;
      return hex;
    })
    .join('');
}

function toggleDisable(dis, ...btns) {
  btns.forEach(btn => (btn.disabled = dis ? '1' : ''));
}

function reset() {
  cells.forEach(v => (v.dataset.life = '0'));
  toggleDisable(false, prevBtn, nextBtn, startBtn, jumpBtn);
  clearInterval(timerId);
  generationsCount = 0;
  maxGenerationsCount = 0;
  updateCount();
  generations = [];
  generationsMap = {};
}

function parseRule(rule) {
  const BSC = rule.split('/');
  const obj = {};
  BSC.forEach(v => {
    switch (v[0]) {
      case 'B':
        obj.birth = v
          .substring(1)
          .split('')
          .map(v2 => parseInt(v2, 10));
        break;
      case 'S':
        obj.star = v
          .substring(1)
          .split('')
          .map(v2 => parseInt(v2, 10));
        break;
      case 'C':
        obj.typeCount = +v.substring(1);
        break;
    }
  });
  return obj;
}

function resetRule(rule) {
  const obj = parseRule(rule);
  birth = obj.birth;
  star = obj.star;
  typeCount = obj.typeCount;
  updateRule();
}

async function setRule() {
  const ruleReg = /B\d+\/S\d+\/C\d+/;
  const rule = await prompt(
    '输入规则（格式（正则）：B\\d+/S\\d+/C\\d+）\n默认B3/S23/C2'
  );
  if (rule === null) return;
  if (!ruleReg.test(rule)) {
    alert('非法规则');
    return;
  }
  if (await confirm('警告：这将会重置网格，是否设置规则？')) {
    reset();
    resetRule(rule);
    bitLen = BigInt(Math.floor(Math.log2(typeCount - 1)) + 1);
    resetStyle(typeCount);
  }
}

function updateRule() {
  ruleSpan.textContent = `\u2001当前规则：B${birth.join('')}/S${star.join(
    ''
  )}/C${typeCount}`;
}

function updateFillState() {
  stateShow.textContent =
    '当前填充状态：' + (fillState === -1 ? '无(切换模式)' : fillState);
}

function updateGridSize() {
  gridSizeShow.textContent = '当前网格大小：' + size;
}

function updateGap() {
  gapShow.textContent = '当前最小迭代间隔：' + gap + 'ms';
}

function updateCount() {
  if (generationsCount > maxGenerationsCount)
    maxGenerationsCount = generationsCount;
  generationsInp.valueLabel = `${generationsCount}/${maxGenerationsCount}`;
  generationsInp.max = maxGenerationsCount;
  generationsInp.value = generationsCount;
}

exportBtn.addEventListener('click', async () => {
  if (generations.length === 0) {
    alert('现在还没有代，无法导出，请点击「保存为一代」按钮后重试。');
    return;
  }
  const data = new Uint8Array([
    Math.ceil((+birth.join('')).toString(16).length / 2),
    ...intToArray(+birth.join('')),
    Math.ceil((+star.join('')).toString(16).length / 2),
    ...intToArray(+star.join('')),
    Math.ceil(typeCount.toString(16).length / 2),
    ...intToArray(typeCount),
    Math.ceil(size.toString(16).length / 2),
    ...intToArray(size),
    ...bigintToArray(generations[generationsMap[generationsCount]])
  ]);
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fileName = await prompt(
    '请输入文件名（无后缀名）（点击取消则使用默认文件名）'
  );
  a.href = url;
  a.download = fileName === null || fileName === '' ? 'data.bin' : fileName + '.bin';
  a.click();
});

importInp.addEventListener('change', event => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    let reader = new FileReader();

    reader.addEventListener('load', async () => {
      try {
        if (await confirm('警告：这将会重置网格，是否导入？')) {
          const data = new Uint8Array(reader.result);
          let mainInfo = [];
          let generation;

          let inInfo = false;
          let infoLen = 0;
          for (let i = 0; i < data.length; i++) {
            if (inInfo) {
              mainInfo.push(
                parseInt(uint8ArrayToHexString(data.slice(i, i + infoLen)), 16)
              );
              i += infoLen - 1;
              inInfo = false;
            } else if (mainInfo.length < 4) {
              infoLen = data[i];
              inInfo = true;
            } else {
              generation = BigInt('0x' + uint8ArrayToHexString(data.slice(i)));
              break;
            }
          }
          alert(
            `规则：B${mainInfo[0]}/S${mainInfo[1]}/C${mainInfo[2]} 网格大小：${mainInfo[3]}`
          );

          resetRule(`B${mainInfo[0]}/S${mainInfo[1]}/C${mainInfo[2]}`);
          size = mainInfo[3];
          bitLen = BigInt(Math.floor(Math.log2(typeCount - 1)) + 1);
          count = size ** 2;
          cells = [];
          resetGrid(size);
          resetStyle(typeCount);
          reset();
          updateGridSize();
          toGeneration(generation);
          event.target.value = '';
        }
      } catch (e) {
        alert(`导入时发生错误：\n${e.stack}`);
        return;
      }
    });

    reader.readAsArrayBuffer(selectedFile);
  }
});

generationsInp.addEventListener('input', e => {
  generationsCount = e.target.value;
  toGeneration(generations[generationsMap[generationsCount]]);
  updateCount();
});

jumpBtn.addEventListener('click', async () => {
  const _generationsCount = await prompt('输入要跳转的代的编号');
  if (_generationsCount === null) return;
  if (isNaN(_generationsCount) || _generationsCount === '') {
    alert('代的编号必须是数字');
    return;
  }
  if (_generationsCount < 0 || _generationsCount > maxGenerationsCount) {
    alert('指定的代不存在');
    return;
  }
  generationsCount = _generationsCount;
  toGeneration(generations[generationsMap[generationsCount]]);
  updateCount();
});

stateBtn.addEventListener('click', async () => {
  const sta = await prompt(
    '点击细胞时后胞变成的状态\n输入状态（留空则使用切换模式，0为擦除模式）'
  );
  if (sta === null) return;
  if (sta === '') {
    fillState = -1;
  } else {
    if (isNaN(sta)) {
      alert('填充状态必须为数字');
      return;
    }
    if (+sta > typeCount - 1) {
      alert('填充状态不能超过C规则的值减一');
      return;
    }
    if (+sta < 0) {
      alert('填充状态不能小于0');
      return;
    }
    fillState = Math.floor(+sta);
  }
  updateFillState();
});

gridSizeBtn.addEventListener('click', async () => {
  const sz = await prompt('输入网格大小');
  if (sz === null) return;
  if (isNaN(sz)) {
    alert('网格大小必须为数字');
    return;
  }
  if (+sz <= 0) {
    alert('网格大小必须大于0');
    return;
  }
  if (+sz > 100) {
    alert('网格大小不能超过100');
    return;
  }
  if (await confirm('警告：这将会重置网格，是否重设网格大小？')) {
    size = +sz;
    count = size ** 2;
    cells = [];
    resetGrid(sz);
    updateGridSize();
    reset();
  }
});

gapBtn.addEventListener('click', async () => {
  let gp = await prompt('输入迭代间隔(ms)');
  if (isNaN(gp)) {
    alert('迭代间隔必须为数字');
    return;
  }
  if (+gp < 3) {
    alert('迭代间隔不能小于3ms');
    return;
  }
  if (+gp > 5000) {
    alert('迭代间隔不能超过5000ms');
    return;
  }
  gap = gp;
  updateGap();
});

prevBtn.addEventListener('click', prevGeneration);
nextBtn.addEventListener('click', nextGeneration);

resetBtn.addEventListener('click', reset);
setRuleBtn.addEventListener('click', setRule);

startBtn.addEventListener('click', () => {
  clearInterval(timerId);
  timerId = setInterval(nextGeneration, gap);
  toggleDisable(true, prevBtn, nextBtn, jumpBtn, startBtn);
});

pauseBtn.addEventListener('click', () => {
  clearInterval(timerId);
  toggleDisable(false, prevBtn, nextBtn, startBtn, jumpBtn);
});

saveBtn.addEventListener('click', () => {
  generationsCount++;
  updateCount();
  saveGeneration();
});

clearGenerationsBtn.addEventListener('click', () => {
  generations = [];
  generationsMap = {};
  generationsCount = 0;
  maxGenerationsCount = 0;
  updateCount();
});

window.addEventListener('message', event => {
  if (event.data.type === 'outterColorSchemeChange') {
    resetStyle(typeCount);
  }
});

container.addEventListener('click', toggle);
importBtn.addEventListener('click', () => {
  importInp.click();
});

resetGrid(size);
resetStyle(typeCount);
updateRule();
updateFillState();
updateGridSize();
updateGap();
