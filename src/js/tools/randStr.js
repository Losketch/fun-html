String.prototype.toArray = function () {
  var arr = [];
  for (let i = 0; i < this.length; ) {
    const codePoint = this.codePointAt(i);
    i += codePoint > 0xffff ? 2 : 1;
    arr.push(codePoint);
  }
  return arr;
};

Object.defineProperty(String.prototype, 'codePointLength', {
  get() {
    let len = 0;
    for (let i = 0; i < this.length; ) {
      const codePoint = this.codePointAt(i);
      i += codePoint > 0xffff ? 2 : 1;
      len++;
    }
    return len;
  },
  enumerable: false,
  configurable: false,
});

Array.prototype.removeAll = function (value) {
  for (let i = 0; i < this.length; i++) {
    if (this[i] === value) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

const validCode = /^([0-9a-fA-F]|10)?[0-9a-fA-F]{0,4}$/;
const resultEle = document.getElementById('result-ele');
const customCharEle = document.getElementById('custom-char');
const slider = document.getElementById('count-slider');
const countInput = document.getElementById('count-input');
const customIntervalContainer = document.getElementById(
  'custom-interval-container'
);
const customBlocksContainer = document.getElementById(
  'custom-blocks-container'
);
const selectBlocks = document.getElementById('select-blocks');
let selectedBlocks = [];

let id = 0;
const getAddEle = () => {
  id++;
  return `
    U+
    <div class="material-input-container" style="margin-top: 5px;">
      <input id="${id}-1" type="text" class="uni" oninput="inspect(this)">
      <label for="${id}-1" class="placeholder">起始码位</label>
      <span></span>
    </div>
    ~U+
    <div class="material-input-container" style="margin-top: 5px;">
      <input id="${id}-2" type="text" class="uni" oninput="inspect(this)">
      <label for="${id}-2" class="placeholder">结束码位</label>
      <span></span>
    </div>
    <button onclick="remove(this.parentNode)" class="rem-button nf nf-cod-remove"></button>
  `;
};

const characterSets = {
  includeDigits: '0123456789'.toArray(),
  includeLowercase: 'abcdefghijklmnopqrstuvwxyz'.toArray(),
  includeUppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toArray(),
  includeSpecialSymbols: "!'#$%&'()*+,-./:;<=>?@[]^_`{|}~".toArray(),
  includeBasicChinese: rangeArr(0x4e00, 0x9fff),
  includeExtendedAChinese: rangeArr(0x3400, 0x4dbf),
  includeExtendedBChinese: rangeArr(0x20000, 0x2a6df),
  includeExtendedCChinese: rangeArr(0x2a700, 0x2b73a),
  includeExtendedDChinese: rangeArr(0x2b740, 0x2b81d),
  includeExtendedEChinese: rangeArr(0x2b820, 0x2cea1),
  includeExtendedFChinese: rangeArr(0x2ceb0, 0x2ebe0),
  includeExtendedGChinese: rangeArr(0x30000, 0x3134a),
  includeExtendedHChinese: rangeArr(0x31350, 0x323af),
  includeExtendedIChinese: rangeArr(0x2ebf0, 0x2ee5d),
  includeExtendedJChinese: rangeArr(0x323b0, 0x3347b),
  includeCompatibleChinese: [
    ...rangeArr(0xf900, 0xfa6d),
    ...rangeArr(0xfa70, 0xfad9),
  ],
  includeCompatibleSupplementChinese: rangeArr(0x2f800, 0x2fa1d),
};
const dom = {};

[
  'include-digits',
  'include-lowercase',
  'include-uppercase',
  'include-special-symbols',
  'include-basic-chinese',
  'include-extended-a-chinese',
  'include-extended-b-chinese',
  'include-extended-c-chinese',
  'include-extended-d-chinese',
  'include-extended-e-chinese',
  'include-extended-f-chinese',
  'include-extended-g-chinese',
  'include-extended-h-chinese',
  'include-extended-i-chinese',
  'include-compatible-chinese',
  'include-compatible-supplement-chinese',
  'include-custom-char',
  'include-custom-interval',
  'include-custom-unicode-blocks',
  'no-repeat',
  'contains-no-undefined-characters',
].forEach((name) => (dom[name] = document.getElementById(name)));

function inspect(ele) {
  const inputValue = ele.value;

  if (!validCode.test(inputValue)) {
    ele.value = '';
  }
}

function add(ele, content) {
  const div = document.createElement('div');
  div.innerHTML = content;
  ele.appendChild(div);
  ele.style.display = 'flex';
}

function remove(ele) {
  if (!(ele.parentNode.children.length - 1)) {
    ele.parentNode.style.display = null;
  }
  ele.remove();
}

function updateInputValue() {
  countInput.value = slider.value;
  countInput.dispatchEvent(new Event('focus'));
}

function updateSliderValue() {
  if (+countInput.value > 1000) countInput.value = 1000;
  slider.value = countInput.value;
}

function cancelSelect(targetSelect, targetSelectVisible) {
  selectBlocks.dispatchEvent(
    new CustomEvent('cancelSelect', {
      detail: {
        targetSelect: targetSelect,
        targetSelectVisible: targetSelectVisible,
      },
    })
  );
}

function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, function (_, letter) {
    return letter.toUpperCase();
  });
}

function generateRandomCharacters() {
  let count = parseInt(countInput.value);
  if (count > 1000) count = 1000;
  const options = {};

  for (const key in dom) {
    if (Object.hasOwnProperty.call(dom, key)) {
      options[kebabToCamel(key)] = dom[key].checked;
    }
  }

  var characters = [];
  characterSets.includeCustomChar = customCharEle.value.toArray();
  for (const option in options) {
    if (options[option] && characterSets[option]) {
      characters.push(...characterSets[option]);
    }
  }

  if (options.includeCustomInterval) {
    [...customIntervalContainer.children].forEach((chi) => {
      const [inpu, inpu2] = chi.getElementsByTagName('input');
      if (inpu.value && inpu2.value)
        characters = characters.concat(
          rangeArr(parseInt(inpu.value, 16), parseInt(inpu2.value, 16))
        );
    });
  }

  if (options.includeCustomUnicodeBlocks) {
    for (let selectedBlock of selectedBlocks) {
      characters = characters.concat(rangeArr(...selectedBlock));
    }
  }

  if (options.containsNoUndefinedCharacters) {
    characters = characters.filter((i) => window.definedCharacterList.has(i));
  }

  let result = '';

  if (!characters.length) {
    result = '';
  } else if (!options.noRepeat) {
    for (let i = 0; i < count; i++) {
      const chart = String.fromCodePoint(
        characters[getRandomNumber(0, characters.length - 1)]
      );
      result += chart;
    }
  } else {
    for (let i = 0; i < count && characters.length; i++) {
      const index = characters[getRandomNumber(0, characters.length - 1)];
      const chart = String.fromCodePoint(index);
      result += chart;
      characters.removeAll(index);
    }
  }
  resultEle.innerHTML = result;
  resultEle.dispatchEvent(new Event('input'));
}

function rangeArr(start, end) {
  return new Array(end - start + 1).fill(0).map((_, i) => i + start);
}

function getRandomNumber(min, max) {
  if (min > max) return;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function copy(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }
}

function clearText() {
  resultEle.innerHTML = '';
  resultEle.dispatchEvent(new Event('input'));
}

selectBlocks.addEventListener('select', (e) => {
  const selections = e.detail.select;
  const visibleSelections = e.detail.selectVisible;
  selectedBlocks = selections.map((selection) =>
    selection.split(',').map((e) => parseInt(e, 16))
  );

  customBlocksContainer.innerHTML = '';
  customBlocksContainer.style.display = null;

  selections.forEach((selection, i) => {
    add(
      customBlocksContainer,
      `
      ${visibleSelections[i]}<button onclick="cancelSelect('${selection}', '${visibleSelections[i]}')" class="rem-button nf nf-cod-remove"></button>
    `
    );
  });
});
