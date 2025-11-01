import source from '@data/mp.zlib/source.mp.zlib';

self.addEventListener('message', () => {
  const { sourceDict, sourceComments } = source;
  const reverseDict = buildReverse(sourceDict);

  function buildReverse(sourceDict) {
    const result = {};
    for (const [key, sources] of Object.entries(sourceDict)) {
      sources.forEach(source => {
        if (source) {
          if (source in result) {
            result[source] += key;
          } else {
            result[source] = key;
          }
          let big = source.split('-');
          if (big[0] !== source) {
            big = big[0];
            if (big in result) {
              result[big] += key;
            } else {
              result[big] = key;
            }
          }
        }
      });
    }
    return result;
  }

  String.prototype.toCharArray = function () {
    const arr = [];
    for (let i = 0; i < this.length; ) {
      const codePoint = this.codePointAt(i);
      i += codePoint > 0xffff ? 2 : 1;
      arr.push(String.fromCodePoint(codePoint));
    }
    return arr;
  };

  self.postMessage({ sourceDict, sourceComments, reverseDict });
});
