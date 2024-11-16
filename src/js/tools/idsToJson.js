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
  let inOverlapTag = false;
  let inStrokeSequence = false;
  let inGlyphFormSelector = false;
  let inSingleZiGlyphFormSelector = false;
  let thisIdc = undefined;
  let thisIdcIndex = undefined;

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
          curStructure.strokeSequence = strokeSequenceToObj(curStructure.strokeSequence);
        }
      } else {
        curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].strokeSequence += char;
        if (char === ")") {
          inStrokeSequence = false;
          curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].strokeSequence = strokeSequenceToObj(curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].strokeSequence);
        }
      }
    } else if (char === "{") {
      inAbstractStructure = true;
      res.abstractStructure = "{";
    } else if (char === "(") {
      inGlyphFormSelector = true;
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
        curStructure.surroundTag = "";
      }

      if (char === "⿻" && string[charIndex + 1] === "[") {
        inOverlapTag = true;
        curStructure.overlapTag = "";
      }
    } else {
      thisIdcHaveBeenPassedParametersCount++;

      if (char === "#") {
        if (string[charIndex + 1] !== "(") throw new Error(`非法字符'${char}'在第${charIndex + 1}个字符处。（'#'的下一个字符必须为'('）`);
        inStrokeSequence = true;
        if (!curStructure.structure) {
          curStructure.type = "strokeSequence";
          curStructure.strokeSequence = "#";
          continue;
        }
        curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].type = "strokeSequence";
        curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].strokeSequence = "#";
        continue;
      }

      if (!isZi(char)) throw new Error(`非法字符'${char}'在第${charIndex + 1}个字符处。`);
      if (thisIdcHaveBeenPassedParametersCount > thisIdcArity) throw new Error(`非法字符'${char}'在第${charIndex + 1}个字符处。（IDC'${curStructure.idc}'期望传递${getIdcArity(curStructure.idc)}个参数）`);

      curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].type = "zi";
      curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].zi = char;
      inSingleZiGlyphFormSelector = true;
    }
  }

  if (idcs.length) {
    [thisIdc, thisIdcIndex] = idcs.pop();
    if (thisIdcHaveBeenPassedParametersCount < thisIdcArity) throw new Error(`在第${thisIdcIndex + 1}个字符处的IDC'${thisIdc}'期望传递${getIdcArity(thisIdc)}个参数，但实际上只传递了${thisIdcHaveBeenPassedParametersCount}个。`);
  }

  if (inAbstractStructure) throw new Error(`抽象构形未闭合。`);
  if (inSurroundTag) throw new Error(`包围标记未闭合。`);
  if (inOverlapTag) throw new Error(`重叠标记未闭合。`);
  if (inStrokeSequence) throw new Error(`笔画序列未闭合。`);
  if (inGlyphFormSelector) throw new Error(`字形样式选择器未闭合。`);

  return moveStructureToEnd(res);
}

function strokeSequenceToObj(strokeSequence) {
  const res = {
    structure: []
  };
  const originalStrokeSequence = strokeSequence;
  strokeSequence = strokeSequence.toArray();
  strokeSequence = strokeSequence.slice(2, -1);

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
      if (char !== 'a' && char !== 'b' && char !== 'c' && char !== 'd') throw new Error(`非法曲线方向字符'${char}'。（曲线方向字符只能是abcd中的一个）（在笔画序列'${originalStrokeSequence}'的第${charIndex + 3}个字符处）`);
      curUnit.stroke += char;
      inCurve = false;
    } else if (strokes.has(char)) {
      if (curUnit !== null) {
        if ("crossing" in curUnit) {
          if (!curUnit.crossing) throw new Error(`笔画交叉标记未指定交叉索引。（在笔画序列'${originalStrokeSequence}'的第${charIndex + 2}个字符处）`);
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
      if (curUnit === null) throw new Error(`笔画交叉标记用在开头。（在笔画序列'${originalStrokeSequence}'的第${charIndex + 3}个字符处）`);
      if (inCrossingTag) throw new Error(`笔画交叉标记重复使用。（在笔画序列'${originalStrokeSequence}'的第${charIndex + 3}个字符处）`);
      inCrossingTag = true;
      curUnit.crossing = "";
    } else if (char === "b") {
      if (curUnit === null) throw new Error(`笔画撕开标记用在开头。（在笔画序列'${originalStrokeSequence}'的第${charIndex + 3}个字符处）`);
      if (curUnit.break) throw new Error(`笔画撕开标记重复使用。（在笔画序列'${originalStrokeSequence}'的第${charIndex + 3}个字符处）`);
      curUnit.break = true;
    } else if (char === "-") {
      if (nextIsReverseStroke) throw new Error(`逆运笔标记重复使用。（在笔画序列'${originalStrokeSequence}'的第${charIndex + 3}个字符处）`);
      nextIsReverseStroke = true;
    } else {
      throw new Error(`非法笔画序列字符'${char}'在笔画序列'${originalStrokeSequence}'的第${charIndex + 3}个字符处。`);
    }
  }

  if (curUnit !== null) {
    if ("crossing" in curUnit) {
      if (!curUnit.crossing) throw new Error(`笔画交叉标记未指定交叉索引。（在笔画序列'${originalStrokeSequence}'的末尾）`);
      curUnit.crossing = parseInt(curUnit.crossing, 10);
    }
    structure.push(curUnit);
    inCrossingTag = false;
  }

  if (nextIsReverseStroke) throw new Error(`逆运笔标记未指定目标笔画。（在笔画序列'${originalStrokeSequence}'的末尾）`);
  if (inCurve) throw new Error(`曲线未指定方向。（在笔画序列'${originalStrokeSequence}'的末尾）`);

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

copyButton.addEventListener('click', () => {
  const code = document.getElementById('json-code')
    .textContent;
  navigator.clipboard.writeText(code);
});

convertButton.addEventListener('click', () => {
  let jsonObject;
  try {
    jsonObject = idsToObj(input.value);
  } catch (e) {
    alert('IDS语法不正确！\n错误信息：\n' + e.toString());
    return;
  }

  const jsonString = JSON.stringify(jsonObject, null, 2);

  delete codeBlock.dataset.highlighted;
  codeBlock.textContent = jsonString;
  hljs.highlightElement(codeBlock);
});