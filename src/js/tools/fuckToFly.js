import '../../css/mainStyles.css';
import '../../css/tools/fuckToFly.css';

import '../m3ui.js';
import '../changeHeader.js';
import '../iframeColorSchemeSync.js';

import fuckToFlyImg from '../../../assets/images/fuckToFly.jpg';

const bg = document.getElementById('bg');
bg.src = fuckToFlyImg;

const fontSizeSlider = document.getElementById('font-size-slider');
const lrPaddingSlider = document.getElementById('lr-padding-slider');
const topSlider = document.getElementById('top-slider');
const input = document.getElementById('input');
const text = document.getElementById('text');
const text2 = document.getElementById('text2');

input.addEventListener('input', () => {
  text.innerText = input.value;
  text2.innerText = input.value;
});

lrPaddingSlider.addEventListener('input', () => {
  text.style.padding = '0 ' + lrPaddingSlider.value + 'em';
  text2.style.padding = '0 ' + lrPaddingSlider.value + 'em';
});

topSlider.addEventListener('input', () => {
  text.style.top = topSlider.value + 'em';
  text2.style.top = topSlider.value + 'em';
});

fontSizeSlider.addEventListener('input', () => {
  text.style.fontSize = fontSizeSlider.value + 'rem';
  text2.style.fontSize = fontSizeSlider.value + 'rem';
});
