import mp3EncoderWorker from './workers/mp3Encoder.worker.js';

class AudioNodeRecorder {
  constructor(audioNode, nextNode, options = {}) {
    this.audioNode = audioNode;
    this.nextNode = nextNode;
    this.context = audioNode.context;
    this.options = options;
    this.worker = new mp3EncoderWorker();
    this.worker.addEventListener(
      'message',
      this.handleWorkerMessage.bind(this)
    );

    const inputSampleRate = this.context.sampleRate;
    const outputSampleRate = options.sampleRate || inputSampleRate;
    const bitRate = options.bitRate || 128;
    const numChannels = options.numChannels || 1;

    this.worker.postMessage({
      cmd: 'init',
      data: { numChannels, inputSampleRate, outputSampleRate, bitRate }
    });

    this.processor = this.context.createScriptProcessor(
      4096,
      numChannels,
      numChannels
    );
    this.processor.addEventListener('audioprocess', e => {
      if (!this.isRecording) return;
      const data = [];
      for (let i = 0; i < numChannels; i++) {
        data.push(e.inputBuffer.getChannelData(i));
      }
      this.worker.postMessage({ cmd: 'encode', data });
    });

    audioNode.connect(this.processor);
    this.processor.connect(nextNode);
    this.isRecording = false;
    this.onComplete = options.onComplete;
  }

  handleWorkerMessage(e) {
    if (e.data.cmd === 'complete') {
      const blob = new Blob(e.data.data, { type: 'audio/mp3' });
      this.onComplete?.(blob);
    }
  }

  startRecording() {
    this.isRecording = true;
  }

  stopRecording() {
    this.isRecording = false;
    this.worker.postMessage({ cmd: 'stop' });
  }

  destruction() {
    if (this.audioNode && this.processor) {
      this.audioNode.disconnect(this.processor);
    }
    if (this.processor && this.nextNode) {
      this.processor.disconnect(this.nextNode);
    }

    if (this.processor) {
      this.processor.addEventListener('audioprocess', null);
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.worker) {
      this.worker.addEventListener('message', null);
      this.worker.terminate();
      this.worker = null;
    }

    this.isRecording = false;

    this.audioNode = null;
    this.nextNode = null;
    this.context = null;
    this.options = null;
    this.onComplete = null;
  }
}

export default AudioNodeRecorder;
