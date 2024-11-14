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
  "𠃊", "𠃋", "𠃌", "𠃍", "𠃑", "𠄌", "𠄎"
]);

const glyphFormSelectorChar = new Set([
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", 
  "B", "G", "H", "J", "K", "M", "P", "Q", "S", "T", "U", "V", 
  "a", "b", "c", "d", "e", "f", "g", "h", "j", "l", "m", 
  "n", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
]);

function idsToObj(string) {
  const res = {};
  const indexes = [];
  const idcArity = [];

  let thisIdcHaveBeenPassedParametersCount = 0;
  let thisIdcArity = 0;
  let inAbstractStructure = false;
  let inSurroundTag = false;
  let inOverlapTag = false;
  let inStrokeSequence = false;
  let inGlyphFormSelector = false;
  let inSingleZiGlyphFormSelector = false;

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
        curStructure = curStructure.structure[thisIdcHaveBeenPassedParametersCount];
        thisIdcHaveBeenPassedParametersCount = 0;
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

      if (!curStructure.structure) {
        curStructure.structure = Array.from({ length: thisIdcArity }, () => ({}));
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

      curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].type = "zi";
      curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1].zi = char;
      inSingleZiGlyphFormSelector = true;
    }
  }

  return moveStructureToEnd(res);
}

function strokeSequenceToObj(strokeSequence) {
  const res = { structure: [] };
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

  for (let char of strokeSequence) {
    if (inCrossingTag && number.has(char)) {
      curUnit.crossing += char;
    } else if (inCurve) {
      curUnit.stroke += char;
      inCurve = false;
    } else if (strokes.has(char)) {
      if (curUnit !== null) {
        if ("crossing" in curUnit) {
          curUnit.crossing = parseInt(curUnit.crossing, 10);
        }
        structure.push(curUnit);
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
      inCrossingTag = true;
      curUnit.crossing = "";
    } else if (char === "b") {
      curUnit.break = true;
    } else if (char === "-") {
      nextIsReverseStroke = true;
    }
  }

  if (curUnit !== null) {
    structure.push(curUnit);
  }

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

const input = document.getElementById('input');
const convertButton = document.getElementById('convert');
const copyButton = document.getElementById('copy-button');
const codeBlock = document.getElementById('json-code');

copyButton.addEventListener('click', () => {
  const code = document.getElementById('json-code').textContent;
  navigator.clipboard.writeText(code)
});

convertButton.addEventListener('click', () => {
  let jsonObject;
  try {
    jsonObject = idsToObj(input.value);
  } catch (e) {
    alert('IDS语法不正确！\n错误信息：\n' + e.stack);
    return;
  }
  
  const jsonString = JSON.stringify(jsonObject, null, 2);

  delete codeBlock.dataset.highlighted;
  codeBlock.textContent = jsonString;
  hljs.highlightElement(codeBlock);
});
