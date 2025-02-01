import '../../css/mainStyles.css';
import '../../css/tools/typewriter.css';

import '../changeHeader.js';
import '../iframeColorSchemeSync.js';
import '../m3ui.js';
import '../dialogs.js';

String.prototype.toCharArray = function () {
  const arr = [];
  for (let i = 0; i < this.length; ) {
    const codePoint = this.codePointAt(i);
    i += codePoint > 0xffff ? 2 : 1;
    arr.push(String.fromCodePoint(codePoint));
  }
  return arr;
};

const typewriter = document.getElementById("typewriter");
const contentDiv = document.getElementById("content");
const cursor = document.getElementById("cursor");
const cursorPlaceholder = document.getElementById("cursorPlaceholder");
const showButton = document.getElementById("showButton");
const textInput = document.getElementById("text");
const timingFunctionInput = document.getElementById("timingFunction");
const durationInput = document.getElementById("duration");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");

const defaultTimingFunction = (t) => {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * (t - 1), 2) / 2;
};

let animationFrameId = null;
let isPaused = false;
let startTime = null;
let pauseTime = null;
let totalTime = 0;
let textArray = [];
let timingFunction = defaultTimingFunction;

function animate(currentTime) {
  if (isPaused) {
    return;
  }

  const elapsedTime = (pauseTime !== null ? pauseTime : currentTime) - startTime;
  const progress = Math.min(elapsedTime / totalTime, 1);

  let p;
  try {
    const result = timingFunction(progress);
    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error('时间函数返回值不是有效的数字。');
    }
    p = Math.max(0, Math.min(1, result));
  } catch (e) {
    alert("时间函数执行出错，使用默认函数。\n错误信息：" + e.message);
    timingFunction = defaultTimingFunction;
    p = Math.max(0, Math.min(1, timingFunction(progress)));
  }

  const currentLength = Math.floor(p * textArray.length);

  contentDiv.textContent = textArray.slice(0, currentLength).join("");
  typewriter.style.display = typewriter.textContent ? 'block' : null;

  updateCursorPosition();

  if (progress < 1) {
    animationFrameId = requestAnimationFrame(animate);
  } else {
    cursor.style.display = null;
    animationFrameId = null;
  }
}

function updateCursorPosition() {
  const rect = cursorPlaceholder.getBoundingClientRect();
  const typewriterRect = typewriter.getBoundingClientRect();

  cursor.style.left = rect.left - typewriterRect.left + 'px';
  cursor.style.top = rect.top - typewriterRect.top + 'px';
  cursor.style.height = rect.height + 'px';
  cursor.style.width = rect.height / 2 + 'px';
}

showButton.addEventListener("click", () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  const text = textInput.value || "你好，世界 🌏！这是一个打字机效果 😊🎉🚀。"

  let userTimingFunction;
  try {
    userTimingFunction = new Function("t", `return (${timingFunctionInput.value})(t);`);
  } catch (e) {
    alert("自定义时间函数无效，使用默认函数。\n错误信息：" + e.message);
    userTimingFunction = defaultTimingFunction;
  }

  timingFunction = userTimingFunction;

  totalTime = durationInput.value;
  textArray = text.toCharArray();
  startTime = performance.now();
  isPaused = false;
  pauseTime = null;

  cursor.style.display = 'block';

  animationFrameId = requestAnimationFrame(animate);
});

pauseButton.addEventListener("click", () => {
  if (animationFrameId !== null) {
    if (isPaused) {
      isPaused = false;
      startTime += performance.now() - pauseTime;
      pauseTime = null;
      animationFrameId = requestAnimationFrame(animate);
    } else {
      isPaused = true;
      pauseTime = performance.now();
    }
  }
});

resetButton.addEventListener("click", () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  isPaused = false;
  startTime = null;
  pauseTime = null;

  contentDiv.textContent = "";
  cursor.style.display = null;
});
