import '@css/mainStyles.css';
import '@css/fontFallback.css';
import '@css/pages/zalog.css';

import '@js/m3ui.js';
import '@js/changeHeader.js';
import '@js/iframeColorSchemeSync.js';

const countRange = document.getElementById('countRange');
const input = document.getElementById('input');
const output = document.getElementById('output');
const genButton = document.getElementById('genButton');
const copyButton = document.getElementById('copyButton');

String.prototype.toArray = function () {
  const arr = [];
  for (let i = 0; i < this.length; ) {
    const codePoint = this.codePointAt(i);
    i += codePoint > 0xffff ? 2 : 1;
    arr.push(codePoint);
  }
  return arr;
};

const chars = Array.from({ length: 111 }, (_, i) =>
  String.fromCodePoint(i + 0x300 < 0x34f ? i + 0x300 : i + 0x301)
);

function zalog(s, minimum = 5, maximum = 10) {
  return s
    .toArray()
    .map(
      c =>
        String.fromCodePoint(c) +
        Array.from(
          {
            length:
              Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
          },
          () => chars[Math.floor(Math.random() * chars.length)]
        ).join('')
    )
    .join('');
}

genButton.addEventListener('click', () => {
  output.value = zalog(
    input.value,
    +countRange.valueStart,
    +countRange.valueEnd
  );
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
