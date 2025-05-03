let ligatures = [];
let ligatureStrings = [];

function mergeSubArrays(mainArray, subArrays) {
  if (subArrays.length === 0) return mainArray;

  const result = [];
  let i = 0;

  while (i < mainArray.length) {
    let matched = false;
    for (const subArray of subArrays) {
      let isMatch = true;
      for (let j = 0; j < subArray.length; j++) {
        if (mainArray[i + j] !== subArray[j]) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        result.push(subArray);
        i += subArray.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      result.push(mainArray[i]);
      i++;
    }
  }

  return result;
}

self.addEventListener('message', event => {
  const { type, data } = event.data;

  if (type === 'init') {
    ligatures = data.ligatures;
    ligatureStrings = data.ligatureStrings;
  } else if (type === 'processLigatures') {
    const result = mergeSubArrays(data, ligatures);
    self.postMessage(result);
  } else if (type === 'processLigaturesString') {
    const result = mergeSubArrays(data, ligatureStrings).map(i =>
      Array.isArray(i) ? i.join('') : i
    );
    self.postMessage(result);
  }
});
