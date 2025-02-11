import properties from 'regenerate-unicode-properties';

import loadLigaturesDataWorker from './workers/loadLigaturesData.worker.js';
import getLigaturesWorker from './workers/getLigatures.worker.js';
import processLigaturesWorker from './workers/processLigatures.worker.js';

const loadData = async () => {
  return new Promise((resolve, reject) => {
    const worker = new loadLigaturesDataWorker();

    worker.postMessage('load');

    worker.addEventListener('message', event => {
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data);
      }
      worker.terminate();
    });

    worker.addEventListener('error', error => {
      reject(error);
      worker.terminate();
    });
  });
};

const getLigatures = async () => {
  const data = await loadData();
  return new Promise((resolve, reject) => {
    const worker = new getLigaturesWorker();

    worker.addEventListener('message', event => {
      const { ligatures, ligatureStrings } = event.data;
      resolve({ ligatures, ligatureStrings });
      worker.terminate();
    });

    worker.addEventListener('error', error => {
      reject(error);
      worker.terminate();
    });

    worker.postMessage({ properties, data });
  });
};

export default (async () => {
  const { ligatures, ligatureStrings } = await getLigatures();

  const worker1 = new processLigaturesWorker();
  const worker2 = new processLigaturesWorker();

  worker1.postMessage({ type: 'init', data: { ligatures, ligatureStrings } });
  worker2.postMessage({ type: 'init', data: { ligatures, ligatureStrings } });

  async function processLigatures(codeArr) {
    return new Promise(resolve => {
      worker1.addEventListener('message', event => {
        resolve(event.data);
      });
      worker1.postMessage({ type: 'processLigatures', data: codeArr });
    });
  }

  async function processLigaturesString(charArr) {
    return new Promise(resolve => {
      worker2.addEventListener('message', event => {
        resolve(event.data);
      });
      worker2.postMessage({ type: 'processLigaturesString', data: charArr });
    });
  }

  return { processLigatures, processLigaturesString };
})();
