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
  ᚊ: /(\(k\))|q/gi,
  ᚕ: /(\(ea\))|k|x/gi,
  ᚖ: /\(oi\)/gi,
  ᚗ: /\(ui\)/gi,
  ᚘ: /\(io\)/gi,
  ᚙ: /\(ae\)/gi,
  ᚍ: /\(ng\)/gi,
  ᚚ: /p/gi,
  ᚁ: /b/gi,
  ᚂ: /l/gi,
  ᚃ: /v|f/gi,
  ᚄ: /s/gi,
  ᚅ: /n/gi,
  ᚆ: /h/gi,
  ᚇ: /d/gi,
  ᚈ: /t/gi,
  ᚉ: /c/gi,
  ᚋ: /m/gi,
  ᚌ: /g/gi,
  ᚎ: /z/gi,
  ᚏ: /r/gi,
  ᚐ: /a|á/gi,
  ᚑ: /o|ó/gi,
  ᚒ: /u|ú/gi,
  ᚓ: /e|é/gi,
  ᚔ: /i|í/gi,
  ' ': / /g
};

convertButton.addEventListener('click', () => {
  let text = original.value;

  for (const oghamLetter in oghamLettersMap) {
    const regex = oghamLettersMap[oghamLetter];
    text = text.replace(regex, oghamLetter);
  }

  for (const char of text) {
    if (Object.hasOwnProperty.call(oghamLettersMap, char)) continue;
    missingCharDialogText.innerText = `欧甘文字中没有字符 “${char}” 的对应。`;
    missingCharDialog.show();

    return;
  }

  if (featherMarks.checked) text = `᚛${text}᚜`;

  ogham.value = text;
});

missingCharDialogClose.addEventListener('click', () =>
  missingCharDialog.close()
);
