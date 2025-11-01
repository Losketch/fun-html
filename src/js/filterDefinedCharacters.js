import filterDefinedCharactersWorker from '@js/workers/filterDefinedCharacters.worker.js';
import definedCharacterList_ from '@data/mp.zlib/DefinedCharacterList.mp.zlib';

const definedCharacterList = new Set(definedCharacterList_);
async function runWorker(worker, data) {
  return new Promise((resolve, reject) => {
    worker.addEventListener('message', event => {
      resolve(event.data);
    });

    worker.addEventListener('error', error => {
      reject(error);
    });

    worker.postMessage(data);
  });
}

async function filterDefinedCharacters(characters) {
  const worker = new filterDefinedCharactersWorker();
  const res = await runWorker(worker, { characters, definedCharacterList });

  return res;
}

export default filterDefinedCharacters;
