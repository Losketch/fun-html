import '@css/mainStyles.css';
import '@css/pages/rot180deg.css';

import '@js/m3ui.js';
import '@js/changeHeader.js';
import '@js/iframeColorSchemeSync.js';

const input = document.getElementById('input');
const output = document.getElementById('output');
const genButton = document.getElementById('gen-button');
const copyButton = document.getElementById('copy-button');

String.prototype.toCharArray = function () {
  const arr = [];
  for (let i = 0; i < this.length; ) {
    const codePoint = this.codePointAt(i);
    i += codePoint > 0xffff ? 2 : 1;
    arr.push(String.fromCodePoint(codePoint));
  }
  return arr;
};

function zip(...arrays) {
  const minLength = Math.min(...arrays.map(arr => arr.length));
  return Array.from({ length: minLength }, (_, i) => arrays.map(arr => arr[i]));
}

const rot180DegMapping = Object.fromEntries(
  zip(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.toCharArray(),
    'ɐqɔpǝɟᵷɥᴉſʞɿɯuodbɹsʇnʌʍxʎzⱯꓭƆꓷƎℲ⅁HIꓩꞰꞀꟽNOԀꝹꓤSꞱꓵΛMX⅄Z'.toCharArray()
  )
);

genButton.addEventListener('click', () => {
  const original = input.value;
  const rotated = original
    .toCharArray()
    .map(c => rot180DegMapping[c] ?? c)
    .reverse();
  output.value = rotated.join('');
});

copyButton.addEventListener('click', () => {
  copy(output.value);
});

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
