import decompress from '@js/mpZlibDecompresser.js';
import filterDefinedCharactersWorker from '@js/workers/filterDefinedCharacters.worker.js';
import definedCharacterListData from '@data/mp.zlib/DefinedCharacterList.mp.zlib';

const definedCharacterList = new Set(decompress(definedCharacterListData));
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
