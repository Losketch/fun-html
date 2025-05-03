import '../../css/mainStyles.css';
import '../../css/refuse.css';
import '../../css/tools/HuAccelerometer.css';

import '../m3ui.js';
import '../changeHeader.js';
import '../iframeColorSchemeSync.js';

const hand = document.getElementById('hand');
const framePath = document.getElementById('framePath');
const handPath = document.getElementById('handPath');
const togglePathButton = document.getElementById('togglePathButton');
const scaleInput = document.getElementById('scale');
const accelerationText = document.getElementById('acceleration');

let scale = 1;
const min = +scaleInput.min;
const max = +scaleInput.max;

function mapLogScale(value) {
  return Math.exp(Math.log(max / min) * ((value - min) / (max - min))) * min;
}

window.addEventListener('devicemotion', event => {
  const acceleration = event.acceleration;
  const accelerationValue = Math.sqrt(
    acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
  );
  const accelerationValueScale = accelerationValue * scale;
  document.body.style.setProperty(
    '--deg',
    (accelerationValueScale <= 180 ? accelerationValueScale : 180) + 'deg'
  );
  accelerationText.innerText = accelerationValue.toFixed(3) + 'm/s²';
});

scaleInput.addEventListener('input', () => {
  scaleInput.valueLabel = scale = mapLogScale(scaleInput.value).toFixed(4);
});

let isNewPath = false;

const originalFramePath =
  'M18 0v40c0 21-2 49-18 69l9 6c16-20 19-47 19-71h85V0Zm10 10h74v24H28Z';
const newFramePath =
  'm102 0-4 5H27L17 1v38c0 26-2 53-16 75l2 1c20-21 22-51 22-74h74v8h1c3 0 7-2 7-3V11l6-3zM25 9h74v28H25Z';
const originalHandPath = 'M 0,0 H 500 V 500 H 0 Z';
const newHandPath = 'M 184,500 262,197 H 500 V 2 H 245 L 0,0 Z';

togglePathButton.addEventListener('click', () => {
  framePath.setAttribute('d', isNewPath ? originalFramePath : newFramePath);
  handPath.setAttribute('d', isNewPath ? originalHandPath : newHandPath);

  hand.style.height = isNewPath ? '25px' : '13px';
  hand.style.width = isNewPath ? '114.514px' : '100px';
  hand.style.left = isNewPath ? '87px' : '92px';
  hand.style.top = isNewPath ? '6px' : '35px';

  isNewPath = !isNewPath;
});
