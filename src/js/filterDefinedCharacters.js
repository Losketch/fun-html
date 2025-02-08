import definedCharacterList from '../data/DefinedCharacterList.js';

const workerScript = `
  self.onmessage = function(event) {
    const { characters, definedCharacterList } = event.data;
    const definedSet = definedCharacterList;
    const filteredCharacters = characters.filter(i => definedSet.has(i) || Array.isArray(i));
    self.postMessage(filteredCharacters);
  };
`;

const workerBlob = new Blob([workerScript], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(workerBlob);

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function runWorker(worker, data) {
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

async function filterDefinedCharacters(characters, numWorkers) {
  const chunkSize = Math.ceil(characters.length / numWorkers);
  const chunks = chunkArray(characters, chunkSize);

  const workers = [];
  const promises = [];

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(workerUrl);
    workers.push(worker);

    const promise = runWorker(worker, {
      characters: chunks[i],
      definedCharacterList
    });
    promises.push(promise);
  }

  try {
    const results = await Promise.all(promises);

    const filteredCharacters = results.flat();
    return filteredCharacters;
  } catch (error) {
    console.error('Error in Web Worker:', error);
    throw error;
  } finally {
    workers.forEach(worker => worker.terminate());
  }
}

export default filterDefinedCharacters;
