import { ziSrcDatabaseUrl } from './data.js';

export default class ZiSrcClient {
  constructor() {
    this.worker = new Worker(new URL('./engine.js', import.meta.url));
    this.requestId = 0;
    this.pending = new Map();
    this.closed = false;

    this.ready = new Promise((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });

    this.worker.addEventListener('message', event => {
      const message = event.data ?? {};
      if (message.type === 'ready') {
        this.resolveReady(message.stats);
        return;
      }
      if (message.type === 'init-error') {
        this.rejectReady(new Error(message.error || 'ziSrc initialization failed'));
        return;
      }
      if (message.type !== 'response') return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error));
      else pending.resolve(message.result);
    });

    this.worker.addEventListener('error', error => {
      this.rejectReady(error);
      for (const { reject } of this.pending.values()) reject(error);
      this.pending.clear();
    });

    this.worker.postMessage({
      type: 'init',
      payload: { databaseUrl: ziSrcDatabaseUrl }
    });
  }

  async request(type, payload = {}) {
    if (this.closed) throw new Error('ziSrc worker has been terminated');
    await this.ready;
    const id = ++this.requestId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ type, id, payload });
    });
  }

  queryChars(chars) {
    return this.request('query-chars', { chars });
  }

  querySources(sources) {
    return this.request('query-sources', { sources });
  }

  terminate() {
    if (this.closed) return;
    this.closed = true;
    this.worker.terminate();
    for (const { reject } of this.pending.values()) {
      reject(new Error('ziSrc worker has been terminated'));
    }
    this.pending.clear();
  }
}
