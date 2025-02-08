import properties from 'regenerate-unicode-properties';

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

  const ligatures = [];
  for (let i of properties.get('Property_of_Strings')) {
    const { strings } = await import(
      `regenerate-unicode-properties/Property_of_Strings/${i}.js`
    );
    ligatures.push(...strings.map(s => s.toArray()));
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
