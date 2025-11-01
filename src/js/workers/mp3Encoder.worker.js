import lamejs from '@js/lame.all.js';

let encoder,
  dataBuffers = [];
let numChannels, outputSampleRate;

self.addEventListener('message', e => {
  const { cmd, data } = e.data;
  switch (cmd) {
    case 'init':
      init(data);
      break;
    case 'encode':
      encode(data);
      break;
    case 'stop':
      stop();
      break;
  }
});

function init(config) {
  numChannels = config.numChannels;
  outputSampleRate = config.outputSampleRate;
  dataBuffers = [];

  encoder = new lamejs.Mp3Encoder(
    numChannels,
    outputSampleRate,
    config.bitRate
  );
}

function encode(audioData) {
  const left = convert(audioData[0]);
  const right = numChannels > 1 ? convert(audioData[1]) : undefined;

  for (let i = 0; i < left.length; i += 1152) {
    const leftChunk = left.subarray(i, i + 1152);
    const rightChunk = right?.subarray(i, i + 1152);
    const mp3Buffer = encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3Buffer.length > 0) dataBuffers.push(mp3Buffer);
  }
}

function convert(input) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    output[i] =
      Math.max(-1, Math.min(1, input[i])) * (input[i] < 0 ? 0x8000 : 0x7fff);
  }
  return output;
}

function stop() {
  const lastChunk = encoder.flush();
  if (lastChunk.length > 0) dataBuffers.push(lastChunk);
  self.postMessage({ cmd: 'complete', data: dataBuffers });
  dataBuffers = [];
}
