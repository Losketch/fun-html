import '../../css/mainStyles.css';
import '../../css/tools/fuckToFly.css';

import '../m3ui.js';
import '../changeHeader.js';
import '../iframeColorSchemeSync.js';

import fuckToFlyImg from '../../../assets/images/fuckToFly.jpg';
import sarasaMonoSCBoldFont from '../../../assets/fonts/fuckToFly/SarasaMonoSC-Bold.woff2';

const dpr = window.devicePixelRatio ?? 1;

const fontSizeSlider = document.getElementById('fontSizeSlider');
const xPosSlider = document.getElementById('xPosSlider');
const yPosSlider = document.getElementById('yPosSlider');
const xSkewSlider = document.getElementById('xSkewSlider');
const ySkewSlider = document.getElementById('ySkewSlider');
const input = document.getElementById('input');
const saveBtn = document.getElementById('save');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 加载字体
async function loadFont() {
  const font = new FontFace(
    'SarasaMonoSC-Bold',
    `url(${sarasaMonoSCBoldFont})`,
    { weight: 'bold' }
  );
  await font.load();
  document.fonts.add(font);
  await document.fonts.ready;

  return;
}

// 加载图片
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = src;
  });
}

function drawText(text, fontSize, skewX, skewY, x, y) {
  ctx.save();
  ctx.font = `${fontSize}px "SarasaMonoSC-Bold"`;

  // 应用倾斜变换
  const skewXRadian = (skewX * Math.PI) / 180;
  const skewYRadian = (skewY * Math.PI) / 180;
  ctx.transform(1, Math.tan(skewYRadian), Math.tan(skewXRadian), 1, 0, 0);

  // 设置样式
  const emToPx = em => em * fontSize;

  ctx.fillStyle = '#5972ff';
  ctx.strokeStyle = '#6f87fe';
  ctx.lineWidth = emToPx(0.07);

  // 绘制描边和填充
  ctx.shadowOffsetX = emToPx(0.08);
  ctx.shadowOffsetY = emToPx(0.08);
  ctx.shadowColor = '#00000088';
  ctx.shadowBlur = emToPx(0.06);
  ctx.strokeText(text, x, y);
  ctx.shadowOffsetX = emToPx(0.16);
  ctx.shadowOffsetY = emToPx(0.16);
  ctx.shadowColor = '#00000055';
  ctx.shadowBlur = emToPx(0.12);
  ctx.strokeText(text, x, y);
  ctx.shadowOffsetX = emToPx(-0.03);
  ctx.shadowOffsetY = emToPx(-0.03);
  ctx.shadowColor = '#00000044';
  ctx.shadowBlur = emToPx(0.1);
  ctx.strokeText(text, x, y);

  ctx.shadowColor = 'transparent';
  ctx.fillText(text, x, y);

  ctx.restore();
}

// 初始化 Canvas
function initCanvas() {
  const computedStyle = getComputedStyle(canvas);

  // 设置物理尺寸
  canvas.width = Math.floor(parseFloat(computedStyle.width) * dpr);
  canvas.height = Math.floor(parseFloat(computedStyle.height) * dpr);

  // 缩放上下文
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

function saveCanvasToPNG(canvas, fileName) {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, 'image/png');
}

(async function () {
  const bgImage = await loadImage(fuckToFlyImg);
  await loadFont();

  function updateText() {
    ctx.drawImage(bgImage, 0, 0, canvas.width / dpr, canvas.height / dpr);
    drawText(
      input.value,
      +fontSizeSlider.value,
      +xSkewSlider.value,
      +ySkewSlider.value,
      +xPosSlider.value,
      +yPosSlider.value
    );
  }

  initCanvas();
  updateText();

  window.addEventListener('resize', () => {
    initCanvas();
    updateText();
  });

  input.addEventListener('input', () => updateText());
  fontSizeSlider.addEventListener('input', () => updateText());
  xPosSlider.addEventListener('input', () => updateText());
  yPosSlider.addEventListener('input', () => updateText());
  xSkewSlider.addEventListener('input', () => updateText());
  ySkewSlider.addEventListener('input', () => updateText());

  xPosSlider.setAttribute('max', canvas.width / dpr);
  yPosSlider.setAttribute('max', canvas.height / dpr);

  saveBtn.addEventListener('click', () =>
    saveCanvasToPNG(canvas, input.value + '.png')
  );
})();
