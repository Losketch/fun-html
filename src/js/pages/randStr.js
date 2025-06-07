import '@css/mainStyles.css';
import '@css/fontFallback.css';
import '@css/nerd-fonts-generated.min.css';
import '@css/select.css';
import '@css/pages/randStr.css';

import '@js/m3ui.js';
import '@js/iframeColorSchemeSync.js';
import '@js/changeHeader.js';
import '@js/select.js';
import processLigaturesPromise from '@js/processLigatures.js';
import filterDefinedCharacters from '@js/filterDefinedCharacters.js';

(async () => {
  const { processLigatures } = await processLigaturesPromise;
  String.prototype.toArray = function () {
    const arr = [];
    for (let i = 0; i < this.length; ) {
      const codePoint = this.codePointAt(i);
      i += codePoint > 0xffff ? 2 : 1;
      arr.push(codePoint);
    }
    return arr;
  };

  Array.prototype.removeAll = function (value) {
    const extraEqualFunc = Array.isArray(value) ? areArraysEqual : () => false;
    for (let i = 0; i < this.length; i++) {
      if (this[i] === value || extraEqualFunc(this[i], value)) {
        this.splice(i, 1);
        i--;
      }
    }
    return this;
  };

  function areArraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }

    return true;
  }

  const validCode = /^([0-9a-fA-F]|10)?[0-9a-fA-F]{0,4}$/;
  const resultEle = document.getElementById('resultEle');
  const customCharEle = document.getElementById('customChar');
  const slider = document.getElementById('countSlider');
  const countInput = document.getElementById('countInput');
  const copyBtn = document.getElementById('copyButton');
  const clearTextBtn = document.getElementById('clearText');
  const genBtn = document.getElementById('gen');
  const addCustomInterval = document.getElementById('addCustomInterval');
  const customIntervalContainer = document.getElementById(
    'customIntervalContainer'
  );
  const customBlocksContainer = document.getElementById(
    'customBlocksContainer'
  );
  const selectBlocks = document.getElementById('selectBlocks');
  let selectedBlocks = [];

  const characterSets = {
    includeDigits: '0123456789'.toArray(),
    includeLowercase: 'abcdefghijklmnopqrstuvwxyz'.toArray(),
    includeUppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toArray(),
    includeSpecialSymbols: "!'#$%&'()*+,-./:;<=>?@[]^_`{|}~".toArray(),
    includeBsc: rangeArr(0x4e00, 0x9fff),
    includeExtA: rangeArr(0x3400, 0x4dbf),
    includeExtB: rangeArr(0x20000, 0x2a6df),
    includeExtC: rangeArr(0x2a700, 0x2b739),
    includeExtD: rangeArr(0x2b740, 0x2b81d),
    includeExtE: rangeArr(0x2b820, 0x2cea1),
    includeExtF: rangeArr(0x2ceb0, 0x2ebe0),
    includeExtG: rangeArr(0x30000, 0x3134a),
    includeExtH: rangeArr(0x31350, 0x323af),
    includeExtI: rangeArr(0x2ebf0, 0x2ee5d),
    includeExtJ: rangeArr(0x323b0, 0x3347b),
    includeCmp: [...rangeArr(0xf900, 0xfa6d), ...rangeArr(0xfa70, 0xfad9)],
    includeSupCmp: rangeArr(0x2f800, 0x2fa1d)
  };
  const dom = {};

  [
    'includeDigits',
    'includeLowercase',
    'includeUppercase',
    'includeSpecialSymbols',
    'includeBsc',
    'includeExtA',
    'includeExtB',
    'includeExtC',
    'includeExtD',
    'includeExtE',
    'includeExtF',
    'includeExtG',
    'includeExtH',
    'includeExtI',
    'includeCmp',
    'includeSupCmp',
    'includeCustomChar',
    'includeCustomInterval',
    'includeCustomUnicodeBlocks',
    'noRepeat',
    'containsNoUndefinedCharacters'
  ].forEach(name => (dom[name] = document.getElementById(name)));

  function add(ele, content) {
    const addedEle = document.createElement('md-list-item');
    addedEle.innerHTML = content;
    ele.appendChild(addedEle);
    ele.style.display = 'block';

    return addedEle;
  }

  function remove(ele) {
    if (!(ele.parentNode.children.length - 1)) {
      ele.parentNode.style.display = null;
    }
    ele.remove();
  }

  function updateInputValue() {
    countInput.value = slider.value;
  }

  function updateSliderValue() {
    if (+countInput.value > 1000) countInput.value = 1000;
    if (+countInput.value <= 0) countInput.value = 1;
    slider.value = countInput.value;
  }

  function cancelSelect(targetSelect, targetSelectVisible) {
    selectBlocks.dispatchEvent(
      new CustomEvent('cancelSelect', {
        detail: {
          targetSelect: targetSelect,
          targetSelectVisible: targetSelectVisible
        }
      })
    );
  }

  async function generateRandomCharacters() {
    let count = +countInput.value;
    if (count > 1000) count = 1000;
    const options = {};

    for (const key in dom) {
      options[key] = dom[key].checked;
    }

    let characters = [];
    characterSets.includeCustomChar = await processLigatures(
      customCharEle.value.toArray()
    );
    for (const option in options) {
      if (options[option] && characterSets[option]) {
        characters.push(...characterSets[option]);
      }
    }

    if (options.includeCustomInterval) {
      [...customIntervalContainer.children].forEach(chi => {
        const [inpu, inpu2] = chi.getElementsByTagName(
          'md-outlined-text-field'
        );
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
      characters = await filterDefinedCharacters(characters);
    }

    let result = '';

    if (!characters.length) {
      result = '';
    } else if (!options.noRepeat) {
      for (let i = 0; i < count; i++) {
        const code = characters[getRandomNumber(0, characters.length - 1)];
        if (Array.isArray(code)) {
          result += code.map(c => String.fromCodePoint(c)).join('');
        } else {
          result += String.fromCodePoint(code);
        }
      }
    } else {
      for (let i = 0; i < count && characters.length; i++) {
        const code = characters[getRandomNumber(0, characters.length - 1)];
        if (Array.isArray(code)) {
          result += code.map(c => String.fromCodePoint(c)).join('');
        } else {
          result += String.fromCodePoint(code);
        }
        characters.removeAll(code);
      }
    }

    return result;
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
  }

  selectBlocks.addEventListener('select', e => {
    const selections = e.detail.select;
    const visibleSelections = e.detail.selectVisible;
    selectedBlocks = selections.map(selection =>
      selection.split(',').map(e => parseInt(e, 16))
    );

    customBlocksContainer.innerHTML = '';
    customBlocksContainer.style.display = null;

    selections.forEach((selection, i) => {
      const customBlockEle = add(
        customBlocksContainer,
        `
        ${visibleSelections[i]}
        <md-filled-tonal-icon-button
          class="rem-button"
          slot="end">
          <md-icon class="nf nf-fa-times"></md-icon>
        </md-filled-tonal-icon-button>
      `
      );
      customBlockEle
        .querySelector('md-filled-tonal-icon-button')
        .addEventListener('click', () =>
          cancelSelect(selection, visibleSelections[i])
        );
    });
  });

  addCustomInterval.addEventListener('click', () => {
    const customIntervalEle = add(
      customIntervalContainer,
      `
      <md-outlined-text-field
        label="起始码位"
        prefix-text="U+">
      </md-outlined-text-field>
      <md-outlined-text-field
        label="结束码位"
        prefix-text="U+">
      </md-outlined-text-field>
      <md-filled-tonal-icon-button
        class="rem-button"
        slot="end">
        <md-icon class="nf nf-fa-times"></md-icon>
      </md-filled-tonal-icon-button>
    `
    );
    customIntervalEle
      .querySelectorAll('md-outlined-text-field')
      .forEach(inputEle => {
        let lastValidValue = '';
        inputEle.addEventListener('input', () => {
          if (!validCode.test(inputEle.value)) {
            inputEle.value = lastValidValue;
          } else {
            lastValidValue = inputEle.value;
          }
        });
      });

    customIntervalEle
      .querySelector('md-filled-tonal-icon-button')
      .addEventListener('click', () => remove(customIntervalEle));
  });

  countInput.addEventListener('input', updateSliderValue);
  slider.addEventListener('input', updateInputValue);
  copyBtn.addEventListener('click', () => copy(resultEle.innerText));
  clearTextBtn.addEventListener('click', clearText);
  genBtn.addEventListener('click', async () => {
    resultEle.innerHTML = await generateRandomCharacters();
    resultEle.dispatchEvent(new Event('input'));
  });
})();
