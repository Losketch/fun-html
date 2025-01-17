const input = document.getElementById('text');

const bold = document.getElementById('bold');
const italic = document.getElementById('italic');
let boldOn = false;
let italicOn = false;

const addFontFeatureSettingsButton = document.getElementById('add-font-feature-settings-button');
const addFontFeatureSettingsDialog = document.getElementById('add-font-feature-settings-dialog');
const addedFontFeatureSettingsContainer = document.getElementById('added-font-feature-settings-container');
const addFontFeatureSettingsName = addFontFeatureSettingsDialog.querySelector('#name');
const addFontFeatureSettingsAvailability = addFontFeatureSettingsDialog.querySelector('#availability-input');
const addFontFeatureSettingsSubmit = addFontFeatureSettingsDialog.querySelector('#submit');
const addedFontFeatureSettings = new Set();
const addedFontFeatureSettingsName = new Set();

const container = document.getElementById('sortable-list-container');
const fontUploadInput = document.getElementById('font-upload');
const uploadButton = document.getElementById('upload-button');
let itemsOrder = [];


bold.addEventListener('click', () => {
  boldOn = boldOn ? false : true;
  input.style.fontWeight = boldOn ? 'bold' : 'normal';
});

italic.addEventListener('click', () => {
  italicOn = italicOn ? false : true;
  input.style.fontStyle = italicOn ? 'italic' : 'normal';
});

function clearText() {
  input.value = '';
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(new Event('blur'));
  window.parent.postMessage({ type: 'clearMainContentHeight'}, '*');
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
  if (addedFontFeatureSettingsName.has(name)) {
    alert('该字体特征设置已添加过了，不可再次添加。');
    return;
  }
  if (!validFontFeatureSettings.has(name)) {
    alert('该字体特征设置无效，请参见 https://learn.microsoft.com/zh-cn/typography/opentype/spec/featurelist 中定义的有效字体特征设置。');
    return;
  }

  const fontFeatureSetting = { name, availability };

  addedFontFeatureSettings.add(fontFeatureSetting);
  addedFontFeatureSettingsName.add(name);
  updateEleFontFeatureSettings();

  const fontFeatureSettingEle = add(addedFontFeatureSettingsContainer, `
    ${name}
    <label class="md-switch"><input type="checkbox" ${availability ? 'checked' : ''}><span class="track"><span class="thumb"></span></span></label>
    <button class="rem-button nf nf-cod-remove"></button>
  `)
  
  const fontFeatureSettingAvailabilityEle = fontFeatureSettingEle.querySelector('input');
  fontFeatureSettingAvailabilityEle.addEventListener('change', () => {
    fontFeatureSetting.availability = fontFeatureSettingAvailabilityEle.checked;
    updateEleFontFeatureSettings();
  });

  const remButton = fontFeatureSettingEle.querySelector('button');
  remButton.addEventListener('click', () => {
    addedFontFeatureSettings.delete(fontFeatureSetting);
    addedFontFeatureSettingsName.delete(fontFeatureSetting.name);
    updateEleFontFeatureSettings();
    remove(fontFeatureSettingEle);
  });
}

function updateEleFontFeatureSettings() {
  input.style.fontFeatureSettings = [...addedFontFeatureSettings].map((fontFeatureSetting) => {
    const { name, availability } = fontFeatureSetting;
    return `"${name}" ${availability ? 'on' : 'off'}`
  }).join(', ');
}

addFontFeatureSettingsButton.addEventListener('click', () => {
  function preventScroll(event) {
    event.preventDefault();
  }
  document.body.addEventListener('wheel', preventScroll, { passive: false });
  document.body.addEventListener('touchmove', preventScroll, { passive: false });
  addFontFeatureSettingsDialog.addEventListener('close', () => {
    document.body.removeEventListener('wheel', preventScroll);
    document.body.removeEventListener('touchmove', preventScroll);
  });

  addFontFeatureSettingsName.value = '';
  addFontFeatureSettingsName.dispatchEvent(new Event('input'));
  addFontFeatureSettingsName.dispatchEvent(new Event('blur'));
  addFontFeatureSettingsAvailability.checked = true;

  addFontFeatureSettingsDialog.showModal();
});

addFontFeatureSettingsSubmit.addEventListener('click', () => {
  const name = addFontFeatureSettingsName.value;
  const availability = addFontFeatureSettingsAvailability.checked;
  addFontFeatureSetting(name, availability);
  addFontFeatureSettingsDialog.close();
});

updateListVisibility();

container.addEventListener('click', function (event) {
  const button = event.target;
  const item = button.closest('.sortable-item');

  if (button.classList.contains('move-up')) {
    const prevItem = item.previousElementSibling;
    if (prevItem) {
      flipAnimation(item, prevItem, 'up');
      updateOrderArray(item, prevItem);
      updateButtonStates();
      updateInputFont();
    }
  } else if (button.classList.contains('move-down')) {
    const nextItem = item.nextElementSibling;
    if (nextItem) {
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

uploadButton.addEventListener('click', function () {
  fontUploadInput.click();
});

fontUploadInput.addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const allowedExtensions = ['.otf', '.ttf', '.woff', '.woff2'];
    const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      alert('仅支持上传 .otf、.ttf、.woff、.woff2 格式的字体文件');
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

  const moveUpButton = document.createElement('button');
  moveUpButton.className = 'move-up';
  moveUpButton.textContent = '↑';
  newItem.appendChild(moveUpButton);

  const moveDownButton = document.createElement('button');
  moveDownButton.className = 'move-down';
  moveDownButton.textContent = '↓';
  newItem.appendChild(moveDownButton);
  
  const deleteButton = document.createElement('button');
  deleteButton.className = 'rem-button nf nf-cod-remove';
  newItem.appendChild(deleteButton);

  if (fontObjectURL) {
    newItem.setAttribute('data-font-url', fontObjectURL);
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

  const fontFaceRules = items.map((item, index) => {
    const fontUrl = item.getAttribute('data-font-url');
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
  }).join('');

  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-font-faces', 'true');
  styleElement.textContent = fontFaceRules;
  document.head.appendChild(styleElement);

  const fontFamilyList = items.map(item => `'${item.querySelector('span').textContent}'`).join(', ');
  input.style.fontFamily = fontFamilyList;
}

function flipAnimation(item, targetItem, direction) {
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
}

function applyFlipAnimation(element, deltaX, deltaY) {
  element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  element.style.transition = 'transform 0s';

  requestAnimationFrame(() => {
    element.style.transform = '';
    element.style.transition = 'transform 0.3s ease';
  });
}

function updateOrderArray(item, targetItem) {
  const itemIndex = itemsOrder.indexOf(item.querySelector('span').textContent);
  const targetIndex = itemsOrder.indexOf(targetItem.querySelector('span').textContent);

  [itemsOrder[itemIndex], itemsOrder[targetIndex]] = [itemsOrder[targetIndex], itemsOrder[itemIndex]];
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
    "aalt",
    "abvf",
    "abvm",
    "abvs",
    "afrc",
    "akhn",
    "apkn",
    "blwf",
    "blwm",
    "blws",
    "calt",
    "case",
    "ccmp",
    "cfar",
    "chws",
    "cjct",
    "clig",
    "cpct",
    "cpsp",
    "cswh",
    "curs",
    ...new Array(99).fill().map((_, i) => `cv${(i + 1).toString().padStart(2, '0')}`),
    "c2pc",
    "c2sc",
    "dist",
    "dlig",
    "dnom",
    "dtls",
    "expt",
    "falt",
    "fin2",
    "fin3",
    "fina",
    "flac",
    "frac",
    "fwid",
    "half",
    "haln",
    "halt",
    "hist",
    "hkna",
    "hlig",
    "hngl",
    "hojo",
    "hwid",
    "init",
    "isol",
    "ital",
    "jalt",
    "jp78",
    "jp83",
    "jp90",
    "jp04",
    "kern",
    "lfbd",
    "liga",
    "ljmo",
    "lnum",
    "locl",
    "ltra",
    "ltrm",
    "mark",
    "med2",
    "medi",
    "mgrk",
    "mkmk",
    "mset",
    "nalt",
    "nlck",
    "nukt",
    "numr",
    "onum",
    "opbd",
    "ordn",
    "ornm",
    "palt",
    "pcap",
    "pkna",
    "pnum",
    "pref",
    "pres",
    "pstf",
    "psts",
    "pwid",
    "qwid",
    "rand",
    "rclt",
    "rkrf",
    "rlig",
    "rphf",
    "rtbd",
    "rtla",
    "rtlm",
    "ruby",
    "rvrn",
    "salt",
    "sinf",
    "size",
    "smcp",
    "smpl",
    ...new Array(20).fill().map((_, i) => `ss${(i + 1).toString().padStart(2, '0')}`),
    "ssty",
    "stch",
    "subs",
    "sups",
    "swsh",
    "titl",
    "tjmo",
    "tnam",
    "tnum",
    "trad",
    "twid",
    "unic",
    "valt",
    "vapk",
    "vatu",
    "vchw",
    "vert",
    "vhal",
    "vjmo",
    "vkna",
    "vkrn",
    "vpal",
    "vrt2",
    "vrtr",
    "zero"
]);
