import '@css/mainStyles.css';
import '@css/pages/ogham.css';

import '@js/m3ui.js';
import '@js/changeHeader.js';
import '@js/iframeColorSchemeSync.js';

const original = document.getElementById('original');
const ogham = document.getElementById('ogham');
const featherMarks = document.getElementById('featherMarks');
const convertButton = document.getElementById('convertButton');
const missingCharDialog = document.getElementById('missingCharDialog');
const missingCharDialogText = missingCharDialog.querySelector('#text');
const missingCharDialogClose = missingCharDialog.querySelector('#close');

const oghamLettersMap = {
  'ᚊ': /(\(k\))|q/ig,
  'ᚕ': /(\(ea\))|k|x/ig,
  'ᚖ': /\(oi\)/ig,
  'ᚗ': /\(ui\)/ig,
  'ᚘ': /\(io\)/ig,
  'ᚙ': /\(ae\)/ig,
  'ᚍ': /\(ng\)/ig,
  'ᚁ': /b/ig,
  'ᚂ': /l/ig,
  'ᚃ': /v|f/ig,
  'ᚄ': /s/ig,
  'ᚅ': /n/ig,
  'ᚆ': /h/ig,
  'ᚇ': /d/ig,
  'ᚈ': /t/ig,
  'ᚉ': /c/ig,
  'ᚋ': /m/ig,
  'ᚌ': /g/ig,
  'ᚎ': /z/ig,
  'ᚎ': /r/ig,
  'ᚐ': /a|á/ig,
  'ᚑ': /o|ó/ig,
  'ᚒ': /u|ú/ig,
  'ᚓ': /e|é/ig,
  'ᚔ': /i|í/ig,
  ' ': / /g
}

convertButton.addEventListener('click', () => {
  let text = original.value;
  
  for (const oghamLetter in oghamLettersMap) {
    const regex = oghamLettersMap[oghamLetter];
    text = text.replace(regex, oghamLetter);
  }
  
  for (const char of text) {
    if (Object.hasOwnProperty.call(oghamLettersMap, char)) continue;
    missingCharDialogText.innerText = `欧甘文字中没有字符 “${char}” 的对应。`
    missingCharDialog.show();
    
    return;
  }
  
  if (featherMarks.checked) text = `᚛${text}᚜`
  
  ogham.value = text
})

missingCharDialogClose.addEventListener('click', () => missingCharDialog.close());
