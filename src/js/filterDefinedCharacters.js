import filterDefinedCharactersWorker from './workers/filterDefinedCharacters.worker.js';
import definedCharacterList from '../data/DefinedCharacterList.js';

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
