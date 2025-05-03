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

self.addEventListener('message', async event => {
  const { properties, data } = event.data;

  let ligatures = [];
  for (let i of properties.get('Property_of_Strings')) {
    const { strings } = await import(
      `regenerate-unicode-properties/Property_of_Strings/${i}.js`
    );
    ligatures.push(...strings.map(s => s.toArray()));
  }
  ligatures = ligatures.concat(data);

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

  self.postMessage({ ligatures, ligatureStrings });
});
