const idc = new Set(["⿾", "⿿", "⿰", "⿱", "⿴", "⿵", "⿶", "⿷", "⿸", "⿹", "⿺", "⿻", "⿼", "⿽", "⿲", "⿳"]);
const surroundIdc = new Set(["⿴", "⿵", "⿶", "⿷", "⿸", "⿹", "⿺", "⿼", "⿽"]);

const unaryIdc = new Set(["⿾", "⿿"]);
const binaryIdc = new Set(["⿰", "⿱", "⿴", "⿵", "⿶", "⿷", "⿸", "⿹", "⿺", "⿻", "⿼", "⿽"]);
const ternaryIdc = new Set(["⿲", "⿳"]);
const number = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);

const strokes = new Set([
  "D", "H", "J", "N", "P", "Q", "S", "T", "W", "Z", "g", "w",
  "◜", "◝", "◞", "◟", "⺄", "㇀", "㇂", "㇄", "㇅", "㇇",
  "㇈", "㇉", "㇊", "㇋", "㇌", "㇍", "㇎", "㇝", "一",
  "丨", "丶", "丿", "乀", "乁", "乙", "乚", "乛", "亅",
  "𠃊", "𠃋", "𠃌", "𠃍", "𠃑", "𠄌", "𠄎"]);

const glyphFormSelectorChar = new Set([
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".",
  "B", "G", "H", "J", "K", "M", "P", "Q", "S", "T", "U", "V",
  "a", "b", "c", "d", "e", "f", "g", "h", "j", "l", "m",
  "n", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]);

String.prototype.toArray = function() {
  var arr = [];
  for (let i = 0; i < this.length;) {
    const codePoint = this.codePointAt(i);
    i += codePoint > 0xffff ? 2 : 1;
    arr.push(String.fromCodePoint(codePoint));
  }
  return arr
}

Object.defineProperty(String.prototype, 'codePointLength', {
  get() {
    let len = 0;
    for (let i = 0; i < this.length;) {
      const codePoint = this.codePointAt(i);
      i += codePoint > 0xffff ? 2 : 1;
      len++;
    }
    return len;
  },
  enumerable: false,
  configurable: false
});

class IdsError extends Error {
  constructor(message, errorCharIndex, errorCharLength=1, extraCharIndex=0, extraCharLength=0) {
    super(message);
    this.name = this.constructor.name;
    this.errorCharIndex = errorCharIndex;
    this.errorCharLength = errorCharLength;
    this.extraCharIndex = extraCharIndex;
    this.extraCharLength = extraCharLength;
  }

  show(target) {
    let ids = input.value;
    ids = ids.toArray();

    let errorChar = ids.splice(this.errorCharIndex, this.errorCharLength);
    errorChar = `<span style="background-color: red;">${errorChar.join('')}</span>`;
    ids.splice(this.errorCharIndex, 0, errorChar);

    if (this.extraCharLength) {
      let extraChar = ids.splice(this.extraCharIndex, this.extraCharLength);
      extraChar = `<span style="background-color: green;">${extraChar.join('')}</span>`;
      ids.splice(this.extraCharIndex, 0, extraChar);
    }
    target.innerHTML = '错误：' + this.message + '<br>' + ids.join('');
  }
}

function idsToObj(string) {
  string = string.toArray();
  const res = {};
  const indexes = [];
  const idcArity = [];
  const idcs = [];

  let thisIdcHaveBeenPassedParametersCount = 0;
  let thisIdcArity = 0;
  let inAbstractStructure = false;
  let inSurroundTag = false;
  let lastSurroundTagIndex;
  let inOverlapTag = false;
  let lastOverlapTagIndex;
  let inStrokeSequence = false;
  let lastStrokeSequenceIndex;
  let inGlyphFormSelector = false;
  let lastGlyphFormSelectorIndex;
  let inSingleZiGlyphFormSelector = false;
  let thisIdc;
  let thisIdcIndex;

  for (let charIndex = 0; charIndex < string.length; charIndex++) {
    const char = string[charIndex];

    if (inSingleZiGlyphFormSelector) {
      if (glyphFormSelectorChar.has(char)) {
        let curStructure = res;
        for (const i of indexes) {
          curStructure = curStructure.structure[i];
        }

        if (!curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].singleZiGlyphFormSelector) {
          curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].singleZiGlyphFormSelector = "";
        }
        curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].singleZiGlyphFormSelector += char;
        continue;
      } else {
        inSingleZiGlyphFormSelector = false;
      }
    }

    if (inGlyphFormSelector) {
      res.glyphFormSelector += char;
      if (char === ")") {
        inGlyphFormSelector = false;
      }
      continue;
    }

    while (!inStrokeSequence && indexes.length && thisIdcArity !== 0 && thisIdcArity - thisIdcHaveBeenPassedParametersCount === 0) {
      const prevIdcZiCount = indexes.pop() + 1;
      thisIdcHaveBeenPassedParametersCount = prevIdcZiCount;
      thisIdcArity = idcArity.pop();
      [thisIdc, thisIdcIndex] = idcs.pop();
    }

    let curStructure = res;
    for (const i of indexes) {
      curStructure = curStructure.structure[i];
    }

    if (inSurroundTag) {
      if (!number.has(char) && char !== "[" && char !== "]") throw new IdsError(`非法的包围标记字符“${char}”。`, charIndex);
      curStructure.surroundTag += char;
      if (char === "]") {
        inSurroundTag = false;
      }
    } else if (inOverlapTag) {
      curStructure.overlapTag += char;
      if (char === "]") {
        inOverlapTag = false;
      }
    } else if (inAbstractStructure) {
      res.abstractStructure += char;
      if (char === "}") {
        inAbstractStructure = false;
      }
    } else if (inStrokeSequence) {
      if (!curStructure.structure) {
        curStructure.strokeSequence += char;
        if (char === ")") {
          inStrokeSequence = false;
          curStructure.strokeSequence = strokeSequenceToObj(curStructure.strokeSequence, charIndex - curStructure.strokeSequence.length + 1);
        }
      } else {
        curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].strokeSequence += char;
        if (char === ")") {
          inStrokeSequence = false;
          curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].strokeSequence = strokeSequenceToObj(curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].strokeSequence, charIndex - curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].strokeSequence.length + 1);
        }
      }
    } else if (char === "{") {
      inAbstractStructure = true;
      res.abstractStructure = "{";
    } else if (char === "(") {
      inGlyphFormSelector = true;
      lastGlyphFormSelectorIndex = charIndex;
      res.glyphFormSelector = "(";
    } else if (idc.has(char)) {
      if (thisIdcArity - thisIdcHaveBeenPassedParametersCount > 0) {
        indexes.push(thisIdcHaveBeenPassedParametersCount);
        idcArity.push(thisIdcArity);
        idcs.push([char, charIndex]);
        curStructure = curStructure.structure[thisIdcHaveBeenPassedParametersCount];
        thisIdcHaveBeenPassedParametersCount = 0;
      }
      if (!idcs.length) {
        idcs.push([char, charIndex]);
      }
      curStructure.type = "IDS";
      curStructure.idc = char;

      if (unaryIdc.has(char)) {
        thisIdcArity = 1;
      } else if (binaryIdc.has(char)) {
        thisIdcArity = 2;
      } else if (ternaryIdc.has(char)) {
        thisIdcArity = 3;
      }
      thisIdc = char;

      if (!curStructure.structure) {
        curStructure.structure = Array.from({
          length: thisIdcArity
        }, () => ({}));
      }

      if (surroundIdc.has(char) && string[charIndex + 1] === "[") {
        inSurroundTag = true;
        lastSurroundTagIndex = charIndex + 1;
        curStructure.surroundTag = "";
      }

      if (char === "⿻" && string[charIndex + 1] === "[") {
        inOverlapTag = true;
        lastOverlapTagIndex = charIndex + 1;
        curStructure.overlapTag = "";
      }
    } else {
      thisIdcHaveBeenPassedParametersCount++;

      if (char === "#") {
        if (string[charIndex + 1] !== "(") throw new IdsError(`非法字符“${char}”。（“#”的下一个字符必须为“(”）`, charIndex);
        inStrokeSequence = true;
        lastStrokeSequenceIndex = charIndex;
        if (!curStructure.structure) {
          curStructure.type = "strokeSequence";
          curStructure.strokeSequence = "#";
          continue;
        }
        curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].type = "strokeSequence";
        curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].strokeSequence = "#";
        continue;
      }

      if (!isZi(char)) throw new IdsError(`非法字符“${char}”。`, charIndex);
      if (thisIdcHaveBeenPassedParametersCount > thisIdcArity) throw new IdsError(`非法字符“${char}”。（IDC'${curStructure.idc}'期望传递${getIdcArity(curStructure.idc)}个参数）`, charIndex);

      curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].type = "zi";
      curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].zi = char;
      inSingleZiGlyphFormSelector = true;
    }
  }

  if (idcs.length) {
    [thisIdc, thisIdcIndex] = idcs.pop();
    if (thisIdcHaveBeenPassedParametersCount < thisIdcArity) throw new IdsError(`“${thisIdc}”期望传递${getIdcArity(thisIdc)}个参数，但实际上只传递了${thisIdcHaveBeenPassedParametersCount}个。`, thisIdcIndex, 1, thisIdcIndex + 1, string.join('').replace(/\([0123456789.BGHJKMPQSTUVabcdefghjlmnpqrstuvwxyz]+\)$/g, '').codePointLength - thisIdcIndex - 1);
    while (!inStrokeSequence && indexes.length && thisIdcArity !== 0 && thisIdcArity - thisIdcHaveBeenPassedParametersCount === 0) {
      const prevIdcZiCount = indexes.pop() + 1;
      thisIdcHaveBeenPassedParametersCount = prevIdcZiCount;
      thisIdcArity = idcArity.pop();
      [thisIdc, thisIdcIndex] = idcs.pop();
      if (thisIdcHaveBeenPassedParametersCount < thisIdcArity) throw new IdsError(`“${thisIdc}”期望传递${getIdcArity(thisIdc)}个参数，但实际上只传递了${thisIdcHaveBeenPassedParametersCount}个。`, thisIdcIndex, 1, thisIdcIndex + 1, string.join('').replace(/\([0123456789.BGHJKMPQSTUVabcdefghjlmnpqrstuvwxyz]+\)$/g, '').codePointLength - thisIdcIndex - 1);
    }
  }

  if (inAbstractStructure) throw new IdsError(`抽象构形未闭合。`, 0);
  if (inSurroundTag) throw new IdsError(`包围标记未闭合。`, lastSurroundTagIndex);
  if (inOverlapTag) throw new IdsError(`重叠标记未闭合。`, lastOverlapTagIndex);
  if (inStrokeSequence) throw new IdsError(`笔画序列未闭合。`, lastStrokeSequenceIndex, 2)
  if (inGlyphFormSelector) throw new IdsError(`字形样式选择器未闭合。`, lastGlyphFormSelectorIndex);

  return moveStructureToEnd(res);
}

function strokeSequenceToObj(strokeSequence, index=0) {
  const res = {
    structure: []
  };
  strokeSequence = strokeSequence.toArray();
  strokeSequence = strokeSequence.slice(2, -1);
  if (!strokeSequence.length) throw new IdsError(`笔画序列为空。`, index, 3);

  if (strokeSequence[strokeSequence.length - 1] === "z") {
    res.endToEnd = true;
    strokeSequence = strokeSequence.slice(0, -1);
  }

  const structure = res.structure;
  let curUnit = null;
  let inCrossingTag = false;
  let nextIsReverseStroke = false;
  let inCurve = false;

  for (let charIndex = 0; charIndex < strokeSequence.length; charIndex++) {
    const char = strokeSequence[charIndex]
    
    if (inCrossingTag && number.has(char)) {
      curUnit.crossing += char;
    } else if (inCurve) {
      if (char !== 'a' && char !== 'b' && char !== 'c' && char !== 'd') throw new IdsError(`非法曲线方向字符“${char}”。（曲线方向字符只能是abcd中的一个）`, index + charIndex + 2, 1, index + charIndex + 1, 1);
      curUnit.stroke += char;
      inCurve = false;
    } else if (strokes.has(char)) {
      if (curUnit !== null) {
        if ("crossing" in curUnit) {
          if (!curUnit.crossing) throw new IdsError(`笔画交叉标记未指定交叉索引。`, index + charIndex + 1);
          curUnit.crossing = parseInt(curUnit.crossing, 10);
        }
        structure.push(curUnit);
        inCrossingTag = false;
      }
      curUnit = {};
      if (nextIsReverseStroke) {
        curUnit.reverseStroke = true;
        nextIsReverseStroke = false;
      }
      if (char === "Q") {
        inCurve = true;
        curUnit.stroke = "Q";
      } else {
        curUnit.stroke = char;
      }
    } else if (char === "x") {
      if (curUnit === null) throw new IdsError(`笔画交叉标记未指定交叉主笔画。`, index + charIndex + 2);
      if (inCrossingTag) throw new IdsError(`笔画交叉标记重复使用。`, index + charIndex + 2);
      inCrossingTag = true;
      curUnit.crossing = "";
    } else if (char === "b") {
      if (curUnit === null) throw new IdsError(`笔画撕开标记未指定目标。`, index + charIndex + 2);
      if (curUnit.break) throw new IdsError(`笔画撕开标记重复使用。`, index + charIndex + 2);
      curUnit.break = true;
    } else if (char === "-") {
      if (nextIsReverseStroke) throw new IdsError(`逆运笔标记重复使用。`, index + charIndex + 2);
      nextIsReverseStroke = true;
    } else {
      throw new IdsError(`非法笔画序列字符“${char}”。`, index + charIndex + 2);
    }
  }

  if (curUnit !== null) {
    if ("crossing" in curUnit) {
      if (!curUnit.crossing) throw new IdsError(`笔画交叉标记未指定交叉索引。`, index + strokeSequence.length + 1);
      curUnit.crossing = parseInt(curUnit.crossing, 10);
    }
    structure.push(curUnit);
    inCrossingTag = false;
  }

  if (nextIsReverseStroke) throw new IdsError(`逆运笔标记未指定目标笔画。`, index + strokeSequence.length + 1);
  if (inCurve) throw new IdsError(`曲线未指定方向。`, index + strokeSequence.length + 1);

  return res;
}

function moveStructureToEnd(data) {
  if (Array.isArray(data)) {
    return data.map(item => moveStructureToEnd(item));
  } else if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    if (keys.includes('structure')) {
      keys.splice(keys.indexOf('structure'), 1);
      keys.push('structure');
    }

    const newObject = {};
    for (let key of keys) {
      newObject[key] = moveStructureToEnd(data[key]);
    }
    return newObject;

  }

  return data;
}

function isZi(char) {
  const code = char.codePointAt();

  if (0x4E00 <= code && code <= 0x9FFF) return true;
  if (0x3400 <= code && code <= 0x4DBF) return true;
  if (0x20000 <= code && code <= 0x2A6DF) return true;
  if (0x2A700 <= code && code <= 0x2B73A) return true;
  if (0x2B740 <= code && code <= 0x2B81D) return true;
  if (0x2B820 <= code && code <= 0x2CEA1) return true;
  if (0x2CEB0 <= code && code <= 0x2EBE0) return true;
  if (0x30000 <= code && code <= 0x3134A) return true;
  if (0x31350 <= code && code <= 0x323AF) return true;
  if (0x2EBF0 <= code && code <= 0x2EE5D) return true;
  if (0x2EBF0 <= code && code <= 0x3347B) return true;

  return false;
}

function getIdcArity(idc) {
  if (unaryIdc.has(idc)) return 1;
  if (binaryIdc.has(idc)) return 2;
  if (ternaryIdc.has(idc)) return 3;
}

const input = document.getElementById('input');
const convertButton = document.getElementById('convert');
const copyButton = document.getElementById('copy-button');
const codeBlock = document.getElementById('json-code');
const errorRes = document.getElementById('errorRes');

copyButton.addEventListener('click', () => {
  const code = document.getElementById('json-code')
    .textContent;
  navigator.clipboard.writeText(code);
});

convertButton.addEventListener('click', () => {
  errorRes.innerHTML = '';
  let jsonObject;
  try {
    jsonObject = idsToObj(input.value);
  } catch (e) {
    e.show(errorRes);
    return;
  }

  const jsonString = JSON.stringify(jsonObject, null, 2);

  delete codeBlock.dataset.highlighted;
  codeBlock.textContent = jsonString;
  hljs.highlightElement(codeBlock);
});
