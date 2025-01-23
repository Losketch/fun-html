const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const input = document.getElementById('text');
const counter =
  input
    .shadowRoot
    .querySelector('md-filled-field')
    .shadowRoot
    .querySelector('.counter');
const textarea = input.shadowRoot.querySelector('textarea');
const clear = document.getElementById('clear');

const fontWeightSlider = document.getElementById('font-weight-slider');
const italic = document.getElementById('italic');
let italicOn = false;
const fontSizeSlider = document.getElementById('font-size-slider');
let pressedFontSizeSliderTop = 0;

const addFontFeatureSettingsButton = document.getElementById(
  'add-font-feature-settings-button'
);
const addFontFeatureSettingsDialog = document.getElementById(
  'add-font-feature-settings-dialog'
);
const addedFontFeatureSettingsContainer = document.getElementById(
  'added-font-feature-settings-container'
);
const addFontFeatureSettingsName =
  addFontFeatureSettingsDialog.querySelector('#name');
const addFontFeatureSettingsAvailability =
  addFontFeatureSettingsDialog.querySelector('#availability-switch');
const addFontFeatureSettingsClose =
  addFontFeatureSettingsDialog.querySelector('#close');
const addFontFeatureSettingsSubmit =
  addFontFeatureSettingsDialog.querySelector('#submit');
const addedFontFeatureSettings = new Set();
const addedFontFeatureSettingsName = new Set();

const container = document.getElementById('sortable-list-container');
const fontUploadInput = document.getElementById('font-upload');
const uploadButton = document.getElementById('upload-button');
let itemsOrder = [];

counter.innerText = '0';

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
  configurable: false
});

document.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => changeUrl(a.textContent));
});

fontWeightSlider.addEventListener('input', () => {
  input.style.setProperty(
    '--md-filled-text-field-input-text-weight',
    fontWeightSlider.value
  );
});

italic.addEventListener('change', () => {
  italicOn = italicOn ? false : true;
  textarea.style.fontStyle = italicOn ? 'italic' : 'normal';
});

fontSizeSlider.addEventListener('input', () => {
  input.style.setProperty(
    '--md-filled-text-field-input-text-size',
    fontSizeSlider.value + 'rem'
  );
  input.style.setProperty(
    '--md-filled-text-field-input-text-line-height',
    (+fontSizeSlider.value) * 1.65 + 'rem'
  );

  const fontSizeSliderTop = fontSizeSlider.getBoundingClientRect().top;
  window.scrollTo({
    top: window.scrollY + fontSizeSliderTop - pressedFontSizeSliderTop,
    behavior: 'instant'
  });
});

function onFontSizeSliderDragStart() {
  pressedFontSizeSliderTop = fontSizeSlider.getBoundingClientRect().top;
  setTimeout(() => {
    const fontSizeSliderTop = fontSizeSlider.getBoundingClientRect().top;
    window.scrollTo({
      top: window.scrollY + fontSizeSliderTop - pressedFontSizeSliderTop,
      behavior: 'instant'
    });
  }, 0);
}

fontSizeSlider.addEventListener('mousedown', onFontSizeSliderDragStart);
fontSizeSlider.addEventListener('touchstart', onFontSizeSliderDragStart);

clear.addEventListener('click', () => {
  input.value = '';
  input.dispatchEvent(new Event('input'));
});

input.addEventListener('input', () => {
  textarea.removeAttribute('maxlength');
  counter.innerText = input.value.codePointLength;
});

function changeUrl(url) {
  window.parent.postMessage({ type: 'changeUrl', url }, '*');
}

function add(ele, content) {
  const div = document.createElement('div');
  div.innerHTML = content;
  ele.appendChild(div);
  ele.style.display = 'flex';
  return div;
}

function remove(ele) {
  if (!(ele.parentNode.children.length - 1)) {
    ele.parentNode.style.display = null;
  }
  ele.remove();
}

function addFontFeatureSetting(name, availability) {
  if (addedFontFeatureSettingsName.has(name) ||
        !validFontFeatureSettings.has(name))
    return false;

  const fontFeatureSetting = { name, availability };

  addedFontFeatureSettings.add(fontFeatureSetting);
  addedFontFeatureSettingsName.add(name);
  updateEleFontFeatureSettings();

  const fontFeatureSettingEle = add(
    addedFontFeatureSettingsContainer,
    `
    ${name}
    <md-switch ${availability ? 'selected' : ''}></md-switch>
    <md-filled-tonal-icon-button class="rem-button">
      <md-icon class="nf nf-fa-times"></md-icon>
    </md-filled-tonal-icon-button>
  `
  );

  const fontFeatureSettingAvailabilityEle =
    fontFeatureSettingEle.querySelector('md-switch');
  fontFeatureSettingAvailabilityEle.addEventListener('change', () => {
    fontFeatureSetting.availability = fontFeatureSettingAvailabilityEle.selected;
    updateEleFontFeatureSettings();
  });

  const remButton = fontFeatureSettingEle.querySelector('md-filled-tonal-icon-button');
  remButton.addEventListener('click', () => {
    addedFontFeatureSettings.delete(fontFeatureSetting);
    addedFontFeatureSettingsName.delete(fontFeatureSetting.name);
    updateEleFontFeatureSettings();
    remove(fontFeatureSettingEle);
  });

  return true;
}

function updateEleFontFeatureSettings() {
  textarea.style.fontFeatureSettings = [...addedFontFeatureSettings]
    .map(fontFeatureSetting => {
      const { name, availability } = fontFeatureSetting;
      return `"${name}" ${availability ? 'on' : 'off'}`;
    })
    .join(', ');
}

function isFontFile(file) {
  const fontMimeTypes = [
    'font/ttf',
    'font/otf',
    'font/woff',
    'font/woff2',
    'application/vnd.ms-fontobject',
    'font/collection'
  ];

  return fontMimeTypes.includes(file.type);
}

function checkFontFeatureSettingsName() {
  const name = addFontFeatureSettingsName.value;
  if (!name ||
        addedFontFeatureSettingsName.has(name) ||
        !validFontFeatureSettings.has(name)) {
    if (!addFontFeatureSettingsName.children.length) {
      const errorIcon = document.createElement('md-icon');
      errorIcon.setAttribute('slot', 'trailing-icon');
      errorIcon.className = 'nf nf-fa-circle_exclamation';
      addFontFeatureSettingsName.appendChild(errorIcon);
    }
    addFontFeatureSettingsName.error = true;
    addFontFeatureSettingsName.errorText = !name ? '字体特性设置名称不能为空。' :
      addedFontFeatureSettingsName.has(name) ? '该字体特征设置已添加过了，不可再次添加。' :
      '该字体特征设置无效，请参见 https://learn.microsoft.com/zh-cn/typography/opentype/spec/featurelist 中定义的有效字体特征设置。'
  } else {
    if (addFontFeatureSettingsName.children.length)
      addFontFeatureSettingsName.children[0].remove();
    addFontFeatureSettingsName.error = false;
  }
}

addFontFeatureSettingsClose.addEventListener('click', () => {
  addFontFeatureSettingsDialog.close();
});

addFontFeatureSettingsName.addEventListener('input', checkFontFeatureSettingsName);

addFontFeatureSettingsButton.addEventListener('click', () => {
  function preventScroll(event) {
    event.preventDefault();
  }
  document.body.addEventListener('wheel', preventScroll, { passive: false });
  document.body.addEventListener('touchmove', preventScroll, {
    passive: false
  });
  addFontFeatureSettingsDialog.addEventListener('close', () => {
    document.body.removeEventListener('wheel', preventScroll);
    document.body.removeEventListener('touchmove', preventScroll);
  });

  addFontFeatureSettingsName.value = '';
  addFontFeatureSettingsAvailability.selected = true;
  checkFontFeatureSettingsName();

  addFontFeatureSettingsDialog.show();
});

addFontFeatureSettingsSubmit.addEventListener('click', () => {
  const name = addFontFeatureSettingsName.value;
  const availability = addFontFeatureSettingsAvailability.selected;
  const success = addFontFeatureSetting(name, availability);
  if (success) {
    addFontFeatureSettingsDialog.close();
  }
});

updateListVisibility();

container.addEventListener('click', event => {
  const button = event.target;
  const item = button.closest('.sortable-item');

  if (button.classList.contains('move-up')) {
    const prevItem = item.previousElementSibling;
    if (prevItem) {
      if (item.dataset.animating || prevItem.dataset.animating) return;
      flipAnimation(item, prevItem, 'up');
      updateOrderArray(item, prevItem);
      updateButtonStates();
      updateInputFont();
    }
  } else if (button.classList.contains('move-down')) {
    const nextItem = item.nextElementSibling;
    if (nextItem) {
      if (item.dataset.animating || nextItem.dataset.animating) return;
      flipAnimation(item, nextItem, 'down');
      updateOrderArray(item, nextItem);
      updateButtonStates();
      updateInputFont();
    }
  } else if (button.classList.contains('rem-button')) {
    deleteItem(item);
    updateInputFont();
    updateListVisibility();
  }
});

uploadButton.addEventListener('click', () => {
  fontUploadInput.click();
});

fontUploadInput.addEventListener('change', event => {
  const file = event.target.files[0];
  if (file) {
    const isFont = isFontFile(file);
    if (!isFont) {
      alert('仅支持上传字体文件。');
      return;
    }

    const fontObjectURL = URL.createObjectURL(file);

    const fileName = file.name;

    insertItem(fileName, -1, fontObjectURL);
    updateInputFont();
    updateListVisibility();

    event.target.value = '';
  }
});

function updateListVisibility() {
  if (itemsOrder.length === 0) {
    container.style.display = 'none';
  } else {
    container.style.display = 'flex';
  }
}

function insertItem(text, index, fontObjectURL) {
  if (index < 0) {
    index = container.children.length + index + 1;
  }

  const newItem = document.createElement('div');
  newItem.className = 'sortable-item';

  const newItemText = document.createElement('span');
  newItemText.textContent = text;
  newItem.appendChild(newItemText);

  const moveUpButton = document.createElement('md-filled-tonal-icon-button');
  moveUpButton.className = 'move-up';

  const moveUpIcon = document.createElement('md-icon');
  moveUpIcon.className = 'nf nf-cod-arrow_up';

  moveUpButton.appendChild(moveUpIcon);
  newItem.appendChild(moveUpButton);

  const moveDownButton = document.createElement('md-filled-tonal-icon-button');
  moveDownButton.className = 'move-down';

  const moveDownIcon = document.createElement('md-icon');
  moveDownIcon.className = 'nf nf-cod-arrow_down';

  moveDownButton.appendChild(moveDownIcon);
  newItem.appendChild(moveDownButton);

  const deleteButton = document.createElement('md-filled-tonal-icon-button');
  deleteButton.className = 'rem-button';

  const deleteIcon = document.createElement('md-icon');
  deleteIcon.className = 'nf nf-fa-times';
  
  deleteButton.appendChild(deleteIcon);
  newItem.appendChild(deleteButton);

  if (fontObjectURL) {
    newItem.dataset.fontUrl = fontObjectURL;
  }

  if (index >= container.children.length) {
    container.appendChild(newItem);
  } else {
    container.insertBefore(newItem, container.children[index]);
  }

  itemsOrder.splice(index, 0, text);

  updateButtonStates();
}

function deleteItem(item) {
  const itemText = item.querySelector('span').textContent;
  const itemIndex = itemsOrder.indexOf(itemText);
  if (itemIndex !== -1) {
    itemsOrder.splice(itemIndex, 1);
  }

  item.remove();

  updateButtonStates();
}

function updateInputFont() {
  const items = Array.from(container.children);

  const existingFontFaces = document.querySelectorAll('style[data-font-faces]');
  existingFontFaces.forEach(style => style.remove());

  const fontFaceRules = items
    .map(item => {
      const fontUrl = item.dataset.fontUrl;
      const fontName = item.querySelector('span').textContent;

      if (fontUrl) {
        return `
        @font-face {
          font-family: '${fontName}';
          src: url('${fontUrl}');
        }
      `;
      }
      return '';
    })
    .join('');

  const styleElement = document.createElement('style');
  styleElement.dataset.fontFaces = 'true';
  styleElement.textContent = fontFaceRules;
  document.head.appendChild(styleElement);

  const fontFamilyList = items
    .map(item => `'${item.querySelector('span').textContent}'`)
    .join(', ');
  input.style.setProperty('--md-filled-text-field-input-text-font', fontFamilyList);
}

function flipAnimation(item, targetItem, direction) {
  item.style.zIndex = '1';
  item.dataset.animating = 'true';
  targetItem.dataset.animating = 'true';

  const firstRectItem = item.getBoundingClientRect();
  const firstRectTarget = targetItem.getBoundingClientRect();

  if (direction === 'up') {
    container.insertBefore(item, targetItem);
  } else if (direction === 'down') {
    container.insertBefore(targetItem, item);
  }

  const lastRectItem = item.getBoundingClientRect();
  const lastRectTarget = targetItem.getBoundingClientRect();

  const deltaXItem = firstRectItem.left - lastRectItem.left;
  const deltaYItem = firstRectItem.top - lastRectItem.top;
  const deltaXTarget = firstRectTarget.left - lastRectTarget.left;
  const deltaYTarget = firstRectTarget.top - lastRectTarget.top;

  applyFlipAnimation(item, deltaXItem, deltaYItem);
  applyFlipAnimation(targetItem, deltaXTarget, deltaYTarget);

  item.addEventListener(
    'transitionend',
    e => {
      if (e.srcElement !== item) return;
      item.style.zIndex = null;
      delete item.dataset.animating;
      delete targetItem.dataset.animating;
    },
    { once: true }
  );
}

function applyFlipAnimation(element, deltaX, deltaY) {
  const animation = element.animate(
    [
      {
        transform: `translate(${deltaX}px, ${deltaY}px)`
      },
      {
        transform: ''
      }
    ],
    { duration: 500, easing: 'ease' }
  );
  animation.addEventListener('finish', () => {
    element.style.zIndex = null;
    delete element.dataset.animating;
  });
}

function updateOrderArray(item, targetItem) {
  const itemIndex = itemsOrder.indexOf(item.querySelector('span').textContent);
  const targetIndex = itemsOrder.indexOf(
    targetItem.querySelector('span').textContent
  );

  [itemsOrder[itemIndex], itemsOrder[targetIndex]] = [
    itemsOrder[targetIndex],
    itemsOrder[itemIndex]
  ];
}

function updateButtonStates() {
  const items = Array.from(container.children);

  items.forEach((item, index) => {
    const moveUpButton = item.querySelector('.move-up');
    const moveDownButton = item.querySelector('.move-down');

    if (index === 0) {
      moveUpButton.disabled = true;
    } else {
      moveUpButton.disabled = false;
    }

    if (index === items.length - 1) {
      moveDownButton.disabled = true;
    } else {
      moveDownButton.disabled = false;
    }
  });
}

const validFontFeatureSettings = new Set([
  'aalt',
  'abvf',
  'abvm',
  'abvs',
  'afrc',
  'akhn',
  'apkn',
  'blwf',
  'blwm',
  'blws',
  'calt',
  'case',
  'ccmp',
  'cfar',
  'chws',
  'cjct',
  'clig',
  'cpct',
  'cpsp',
  'cswh',
  'curs',
  ...new Array(99)
    .fill()
    .map((_, i) => `cv${(i + 1).toString().padStart(2, '0')}`),
  'c2pc',
  'c2sc',
  'dist',
  'dlig',
  'dnom',
  'dtls',
  'expt',
  'falt',
  'fin2',
  'fin3',
  'fina',
  'flac',
  'frac',
  'fwid',
  'half',
  'haln',
  'halt',
  'hist',
  'hkna',
  'hlig',
  'hngl',
  'hojo',
  'hwid',
  'init',
  'isol',
  'ital',
  'jalt',
  'jp78',
  'jp83',
  'jp90',
  'jp04',
  'kern',
  'lfbd',
  'liga',
  'ljmo',
  'lnum',
  'locl',
  'ltra',
  'ltrm',
  'mark',
  'med2',
  'medi',
  'mgrk',
  'mkmk',
  'mset',
  'nalt',
  'nlck',
  'nukt',
  'numr',
  'onum',
  'opbd',
  'ordn',
  'ornm',
  'palt',
  'pcap',
  'pkna',
  'pnum',
  'pref',
  'pres',
  'pstf',
  'psts',
  'pwid',
  'qwid',
  'rand',
  'rclt',
  'rkrf',
  'rlig',
  'rphf',
  'rtbd',
  'rtla',
  'rtlm',
  'ruby',
  'rvrn',
  'salt',
  'sinf',
  'size',
  'smcp',
  'smpl',
  ...new Array(20)
    .fill()
    .map((_, i) => `ss${(i + 1).toString().padStart(2, '0')}`),
  'ssty',
  'stch',
  'subs',
  'sups',
  'swsh',
  'titl',
  'tjmo',
  'tnam',
  'tnum',
  'trad',
  'twid',
  'unic',
  'valt',
  'vapk',
  'vatu',
  'vchw',
  'vert',
  'vhal',
  'vjmo',
  'vkna',
  'vkrn',
  'vpal',
  'vrt2',
  'vrtr',
  'zero'
]);
