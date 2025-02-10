import properties from 'regenerate-unicode-properties';

import decompositions from '../data/decompositions.json';
import variations from '../data/variations.json';
import namedSequences from '../data/named_sequences.json';

export default (async () => {
  String.prototype.toArray = function () {
    const arr = [];
    for (let i = 0; i < this.length; ) {
      const codePoint = this.codePointAt(i);
      i += codePoint > 0xffff ? 2 : 1;
      arr.push(codePoint);
    }
    return arr;
  };
  const isEqual = (arr1, arr2) =>
    arr1.length === arr2.length &&
    arr1.every((val, index) => val === arr2[index]);

  const ligatures = [];
  for (let i of properties.get('Property_of_Strings')) {
    const { strings } = await import(
      `regenerate-unicode-properties/Property_of_Strings/${i}.js`
    );
    ligatures.push(...strings.map(s => s.toArray()));
  }
  ligatures.push(...decompositions);
  ligatures.push(...variations);
  ligatures.push(...namedSequences);

  for (let i = 0; i < ligatures.length; i++) {
    for (let j = i + 1; j < ligatures.length; j++) {
      if (isEqual(ligatures[i], ligatures[j])) {
        ligatures.splice(j, 1);
        j--;
      }
    }
  }

  ligatures.sort((a, b) => b.length - a.length);
  const ligatureStrings = ligatures.map(ligature =>
    ligature.map(code => String.fromCodePoint(code))
  );

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

  function processLigatures(codeArr) {
    return mergeSubArrays(codeArr, ligatures);
  }

  function processLigaturesString(charArr) {
    return mergeSubArrays(charArr, ligatureStrings).map(i =>
      Array.isArray(i) ? i.join('') : i
    );
  }

  return { processLigatures, processLigaturesString };
})();
