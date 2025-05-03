import '../../css/mainStyles.css';
import '../../css/tools/morse.css';

import '../m3ui.js';
import '../changeHeader.js';
import '../iframeColorSchemeSync.js';

import AudioNodeRecorder from '../audioNodeRecorder.js';

const wpmSlider = document.getElementById('wpm-slider');
const wordIntervalSlider = document.getElementById('wi-slider');
const dashDotLenRatioSlider = document.getElementById('ddr-slider');
const freqSlider = document.getElementById('freq-slider');
const input = document.getElementById('input');
const encodeButton = document.getElementById('encode-button');
const downloadButton = document.getElementById('download-button');
const stopButton = document.getElementById('stop-button');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();

oscillator.type = 'square';
oscillator.frequency.setValueAtTime(790, audioContext.currentTime);
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);
gainNode.gain.setValueAtTime(0, audioContext.currentTime);

oscillator.start(audioContext.currentTime);

function playSound(soundSequence, onComplete = null) {
  let playerTimer = undefined;

  function _play(soundSequence) {
    const sound = soundSequence.shift();
    if (sound === undefined) {
      if (onComplete) onComplete();
      return;
    }

    const { interval, duration } = sound;

    function start() {
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      playerTimer = setTimeout(end, duration);
    }

    function end() {
      playerTimer = undefined;
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime);
      _play(soundSequence);
    }

    if (interval === 0) {
      start();
    } else {
      playerTimer = setTimeout(start, interval);
    }
  }

  _play(soundSequence);

  return () => {
    clearTimeout(playerTimer);
    playerTimer = undefined;
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime);
  };
}

String.prototype.toArray = function () {
  const arr = [];
  for (let i = 0; i < this.length; ) {
    const codePoint = this.codePointAt(i);
    i += codePoint > 0xffff ? 2 : 1;
    arr.push(codePoint);
  }
  return arr;
};

function logBase(x, base) {
  if (x <= 0 || base <= 0 || base === 1) return NaN;
  return Math.log(x) / Math.log(base);
}

function encodeMorse(text, wpm = 20, wordInterval = 3, dashDotLenRatio = 3) {
  const unitTime = 1.2 / wpm;
  const soundSequence = [];
  let isWordStart;
  let isFirstLetter = true;
  for (const i of text.toArray()) {
    for (let j = Math.floor(logBase(i, 2)); j >= 0; j--) {
      const interval =
        unitTime *
        (isWordStart ? wordInterval : 1) *
        (isFirstLetter ? 0 : 1) *
        1000;
      const duration =
        (((i >> j) & 1) * (dashDotLenRatio - 1) + 1) * unitTime * 1000;
      soundSequence.push({ interval, duration });
      isFirstLetter = false;
      isWordStart = false;
    }
    isWordStart = true;
  }

  return soundSequence;
}

let stopper;

encodeButton.addEventListener('click', () => {
  if (stopper) stopper();

  oscillator.frequency.setValueAtTime(
    +freqSlider.value,
    audioContext.currentTime
  );
  const soundSequence = encodeMorse(
    input.value,
    +wpmSlider.value,
    +wordIntervalSlider.value,
    +dashDotLenRatioSlider.value
  );
  stopper = playSound(soundSequence);
});

downloadButton.addEventListener('click', () => {
  if (stopper) stopper();

  oscillator.frequency.setValueAtTime(
    +freqSlider.value,
    audioContext.currentTime
  );
  const soundSequence = encodeMorse(
    input.value,
    +wpmSlider.value,
    +wordIntervalSlider.value,
    +dashDotLenRatioSlider.value
  );
  const recorder = new AudioNodeRecorder(gainNode, audioContext.destination, {
    bitRate: 128,
    onComplete: blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `telegram_${Date.now()}.mp3`;
      a.click();
    }
  });
  recorder.startRecording();
  stopper = playSound(soundSequence, () => recorder.stopRecording());
});

stopButton.addEventListener('click', () => {
  if (stopper) stopper();
});
