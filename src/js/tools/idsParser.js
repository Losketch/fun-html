const idc = new Set(['⿾', '⿿', '⿰', '⿱', '⿴', '⿵', '⿶', '⿷', '⿸', '⿹', '⿺', '⿻', '⿼', '⿽', '㇯', '⿲', '⿳', '🔄']);
const surroundIdc = new Set(['⿴', '⿵', '⿶', '⿷', '⿸', '⿹', '⿺', '⿼', '⿽']);

const unaryIdc = new Set(['⿾', '⿿']);
const binaryIdc = new Set(['⿰', '⿱', '⿴', '⿵', '⿶', '⿷', '⿸', '⿹', '⿺', '⿻', '⿼', '⿽', '㇯']);
const ternaryIdc = new Set(['⿲', '⿳', '🔄']);
const number = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

const strokes = new Set([
  'D', 'H', 'J', 'N', 'P', 'Q', 'S', 'T', 'W', 'Z', 'g', 'w',
  '◜', '◝', '◞', '◟', '⺄', '㇀', '㇂', '㇄', '㇅', '㇇',
  '㇈', '㇉', '㇊', '㇋', '㇌', '㇍', '㇎', '㇝', '一',
  '丨', '丶', '丿', '乀', '乁', '乙', '乚', '乛', '亅',
  '𠃊', '𠃋', '𠃌', '𠃍', '𠃑', '𠄌', '𠄎']);

const glyphFormSelectorChar = new Set([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.',
  'B', 'G', 'H', 'J', 'K', 'M', 'P', 'Q', 'S', 'T', 'U', 'V',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'l', 'm',
  'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']);

const abstractStructureReg =
  /\{(?:\?|\?[0-3])?[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73a}\u{2b740}-\u{2b81d}\u{2b820}-\u{2cea1}\u{2ceb0}-\u{2ebe0}\u{30000}-\u{3134a}\u{31350}-\u{323af}\u{2ebf0}-\u{2ee5d}\u{323b0}-\u{3347b}][BGHJKMPQSTUV]?\}/u;
const glyphFormSelectorReg =
  /\((?:(?:([jq\d]?)(?:[a-dghlnpr-z]+|[a-dghlnpr-z.]{2,}),)+\1(?:[a-dghlnpr-z]+|[a-dghlnpr-z.]{2,})|[jq\d]?(?:[a-dghlnpr-z]+|[a-dghlnpr-z.]{2,})|(?:[BGHJKMPQS-V.],)*[BGHJKMPQS-V.]|(?:[qpxy]\d{3}[a-z]?\d{1,2}[a-z.]?,)*(?:[qpxy]\d{3}[a-z]?\d{1,2}[a-z.]?|\.)|(?:qq(?:\d{3}[a-z]?)+,)*qq(?:\d{3}[a-z]?)+|y[2-9]|e|m|,)\)/;
const singleZiGlyphFormSelectorReg =
  /^(?:(?:([jq\d]?)(?:[a-dghlnpr-z]+|[a-dghlnpr-z.]{2,}),)+\1(?:[a-dghlnpr-z]+|[a-dghlnpr-z.]{2,})|[jq\d]?(?:[a-dghlnpr-z]+|[a-dghlnpr-z.]{2,})|(?:[BGHJKMPQS-V.],)*[BGHJKMPQS-V.]|(?:[qpxy]\d{3}[a-z]?\d{1,2}[a-z.]?,)*(?:[qpxy]\d{3}[a-z]?\d{1,2}[a-z.]?|\.)|(?:qq(?:\d{3}[a-z]?)+,)*qq(?:\d{3}[a-z]?)+|y[2-9]|e|m|,)$/;
const overlapTagReg =
  /\[(?:\d:(?:(?:-|\|)(?:\d|b))?|\d?:(?:-|\|)(?:\d|b)|(?:(?:[bclr]|[xbc_.]{2,}|\.|[xbc_|]{2,})?,)*(?:[bclr]|[xbc_.]{2,}|\.|[xbc_|]{2,})|(?:(?:[bclr]|[xbc_.]{2,}|\.|[xbc_|]{2,})?,)+)\]/;
const numberTagReg = /\[[1-9]\d*\]/;

String.prototype.toArray = function () {
  var arr = [];
  for (let i = 0; i < this.length; ) {
    const codePoint = this.codePointAt(i);
    i += codePoint > 0xffff ? 2 : 1;
    arr.push(String.fromCodePoint(codePoint));
  }
  return arr;
};

Object.defineProperty(String.prototype, 'codePointLength', {
  get() {
    let len = 0;
    for (let i = 0; i < this.length; ) {
      const codePoint = this.codePointAt(i);
      i += codePoint > 0xffff ? 2 : 1;
      len++;
    }
    return len;
  },
  enumerable: false,
  configurable: false,
});

class IdsError extends Error {
  constructor(
    message,
    errorCharIndex,
    errorCharLength = 1,
    extraCharIndex = 0,
    extraCharLength = 0
  ) {
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
    errorChar = `<span class="error">${errorChar.join('')}</span>`;
    ids.splice(this.errorCharIndex, 0, errorChar);

    if (this.extraCharIndex > this.errorCharIndex + this.errorCharLength) {
      this.extraCharIndex -= this.errorCharLength - 1;
    }

    if (this.extraCharLength) {
      let extraChar = ids.splice(this.extraCharIndex, this.extraCharLength);
      extraChar = `<span class="extra">${extraChar.join('')}</span>`;
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

  let thisIdcHaveBeenPassedParametersCount = 0;
  let thisIdcArity = 0;
  let inAbstractStructure = false;
  let inSurroundTag = false;
  let lastSurroundTagIndex;
  let inOverlapTag = false;
  let lastOverlapTagIndex;
  let inSubtractionTag = false;
  let lastSubtractionTagIndex;
  let inReplacementTag = false;
  let lastReplacementTagIndex;
  let inStrokeSequence = false;
  let lastStrokeSequenceIndex;
  let inGlyphFormSelector = false;
  let lastGlyphFormSelectorIndex;
  let inSingleZiGlyphFormSelector = false;

  for (let charIndex = 0; charIndex < string.length; charIndex++) {
    const char = string[charIndex];

    if (inSingleZiGlyphFormSelector) {
      let curStructure = res;
      for (const i of indexes) {
        curStructure = curStructure.structure[i];
      }

      const targetStructure =
        curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1];

      if (glyphFormSelectorChar.has(char)) {
        if (!targetStructure.singleZiGlyphFormSelector) {
          targetStructure.singleZiGlyphFormSelector = '';
        }
        targetStructure.singleZiGlyphFormSelector += char;
        targetStructure.endIndex++;
        if (
          charIndex === string.length - 1 &&
          !singleZiGlyphFormSelectorReg.test(
            targetStructure.singleZiGlyphFormSelector
          )
        )
          throw new IdsError(
            `非法的单字字形样式选择器“${targetStructure.singleZiGlyphFormSelector}”。`,
            targetStructure.index + 1,
            charIndex - targetStructure.index
          );
        continue;
      } else {
        if (
          targetStructure.singleZiGlyphFormSelector &&
          !singleZiGlyphFormSelectorReg.test(
            targetStructure.singleZiGlyphFormSelector
          )
        )
          throw new IdsError(
            `非法的单字字形样式选择器“${targetStructure.singleZiGlyphFormSelector}”。`,
            targetStructure.index + 1,
            charIndex - targetStructure.index - 1
          );
        inSingleZiGlyphFormSelector = false;
      }
    }

    if (inGlyphFormSelector) {
      res.glyphFormSelector += char;
      if (char === ')') {
        if (charIndex != string.length - 1)
          throw new IdsError(
            '字形样式选择器出现在非结尾。',
            lastGlyphFormSelectorIndex,
            charIndex - lastGlyphFormSelectorIndex + 1
          );
        if (!glyphFormSelectorReg.test(res.glyphFormSelector))
          throw new IdsError(
            `非法的字形样式选择器“${res.glyphFormSelector}”。`,
            lastGlyphFormSelectorIndex,
            charIndex - lastGlyphFormSelectorIndex + 1
          );
        inGlyphFormSelector = false;
      }
      continue;
    }

    while (
      !inStrokeSequence &&
      indexes.length &&
      thisIdcArity !== 0 &&
      thisIdcArity - thisIdcHaveBeenPassedParametersCount === 0
    ) {
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
      if (char === ']') {
        if (!numberTagReg.test(curStructure.surroundTag))
          throw new IdsError(
            `非法的包围标记“${curStructure.surroundTag}”`,
            lastSurroundTagIndex,
            charIndex - lastSurroundTagIndex + 1
          );
        inSurroundTag = false;
      }
    } else if (inSubtractionTag) {
      curStructure.subtractionTag += char;
      if (char === ']') {
        if (!numberTagReg.test(curStructure.subtractionTag))
          throw new IdsError(
            `非法的删减标记“${curStructure.subtractionTag}”`,
            lastSubtractionTagIndex,
            charIndex - lastSubtractionTagIndex + 1
          );
        inSubtractionTag = false;
      }
    } else if (inReplacementTag) {
      curStructure.replacementTag += char;
      if (char === ']') {
        if (!numberTagReg.test(curStructure.replacementTag))
          throw new IdsError(
            `非法的替换标记“${curStructure.replacementTag}”`,
            lastReplacementTagIndex,
            charIndex - lastReplacementTagIndex + 1
          );
        inReplacementTag = false;
      }
    } else if (inOverlapTag) {
      curStructure.overlapTag += char;
      if (char === ']') {
        if (!overlapTagReg.test(curStructure.overlapTag))
          throw new IdsError(
            `非法的重叠标记“${curStructure.overlapTag}”`,
            lastOverlapTagIndex,
            charIndex - lastOverlapTagIndex + 1
          );
        inOverlapTag = false;
      }
    } else if (inAbstractStructure) {
      res.abstractStructure += char;
      if (char === '}') {
        if (!abstractStructureReg.test(res.abstractStructure))
          throw new IdsError(
            `非法的抽象构形“${res.abstractStructure}”`,
            0,
            charIndex + 1
          );
        inAbstractStructure = false;
      }
    } else if (inStrokeSequence) {
      if (!curStructure.structure) {
        curStructure.strokeSequence += char;
        curStructure.endIndex++;
        if (char === ')') {
          inStrokeSequence = false;
          curStructure.strokeSequence = strokeSequenceToObj(
            curStructure.strokeSequence,
            curStructure.index
          );
        }
      } else {
        const targetStructure =
          curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1];
        targetStructure.strokeSequence += char;
        targetStructure.endIndex++;
        if (char === ')') {
          inStrokeSequence = false;
          targetStructure.strokeSequence = strokeSequenceToObj(
            targetStructure.strokeSequence,
            targetStructure.index
          );
        }
      }
    } else if (char === '{') {
      if (charIndex != 0)
        throw new IdsError('抽象构形出现在非开头。', charIndex);
      inAbstractStructure = true;
      res.abstractStructure = '{';
    } else if (char === '(') {
      inGlyphFormSelector = true;
      lastGlyphFormSelectorIndex = charIndex;
      res.glyphFormSelector = '(';
    } else if (idc.has(char)) {
      if (thisIdcArity - thisIdcHaveBeenPassedParametersCount > 0) {
        indexes.push(thisIdcHaveBeenPassedParametersCount);
        idcArity.push(thisIdcArity);
        curStructure =
          curStructure.structure[thisIdcHaveBeenPassedParametersCount];
        thisIdcHaveBeenPassedParametersCount = 0;
      }
      if (thisIdcArity === thisIdcHaveBeenPassedParametersCount && thisIdcArity)
        throw new IdsError(
          `非法字符“${char}”。（IDC“${curStructure.idc}”期望传递${getIdcArity(
            curStructure.idc
          )}个参数）`,
          charIndex,
          1,
          curStructure.index,
          1
        );
      curStructure.type = 'IDS';
      curStructure.idc = char;
      curStructure.index = charIndex;

      if (unaryIdc.has(char)) {
        thisIdcArity = 1;
      } else if (binaryIdc.has(char)) {
        thisIdcArity = 2;
      } else if (ternaryIdc.has(char)) {
        thisIdcArity = 3;
      }

      if (!curStructure.structure) {
        curStructure.structure = Array.from(
          {
            length: thisIdcArity,
          },
          () => ({})
        );
      }

      if (surroundIdc.has(char) && string[charIndex + 1] === '[') {
        inSurroundTag = true;
        lastSurroundTagIndex = charIndex + 1;
        curStructure.surroundTag = '';
      }

      if (char === '⿻' && string[charIndex + 1] === '[') {
        inOverlapTag = true;
        lastOverlapTagIndex = charIndex + 1;
        curStructure.overlapTag = '';
      }

      if (char === '㇯' && string[charIndex + 1] === '[') {
        inSubtractionTag = true;
        lastSubtractionTagIndex = charIndex + 1;
        curStructure.subtractionTag = '';
      }

      if (char === '🔄' && string[charIndex + 1] === '[') {
        inReplacementTag = true;
        lastReplacementTagIndex = charIndex + 1;
        curStructure.replacementTag = '';
      }
    } else {
      thisIdcHaveBeenPassedParametersCount++;

      if (char === '#') {
        if (thisIdcHaveBeenPassedParametersCount > thisIdcArity && thisIdcArity)
          throw new IdsError(
            `非法字符“${char}”。（IDC“${curStructure.idc}”期望传递${getIdcArity(
              curStructure.idc
            )}个参数）`,
            charIndex,
            1,
            curStructure.index,
            1
          );
        if (string[charIndex + 1] !== '(')
          throw new IdsError(
            `非法字符“${char}”。（“#”的下一个字符必须为“(”）`,
            charIndex
          );
        inStrokeSequence = true;
        lastStrokeSequenceIndex = charIndex;
        if (!curStructure.structure) {
          curStructure.type = 'strokeSequence';
          curStructure.index = charIndex;
          curStructure.endIndex = charIndex;
          curStructure.strokeSequence = '#';
          continue;
        }
        const targetStructure =
          curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1];
        targetStructure.type = 'strokeSequence';
        targetStructure.index = charIndex;
        targetStructure.endIndex = charIndex;
        targetStructure.strokeSequence = '#';
        continue;
      }

      if (!isZi(char) || !curStructure.structure)
        throw new IdsError(`非法字符“${char}”。`, charIndex);
      if (thisIdcHaveBeenPassedParametersCount > thisIdcArity && thisIdcArity)
        throw new IdsError(
          `非法字符“${char}”。（IDC“${curStructure.idc}”期望传递${getIdcArity(
            curStructure.idc
          )}个参数）`,
          charIndex,
          1,
          curStructure.index,
          1
        );

      const targetStructure =
        curStructure.structure[thisIdcHaveBeenPassedParametersCount - 1];
      targetStructure.type = 'zi';
      targetStructure.index = charIndex;
      targetStructure.endIndex = charIndex;
      targetStructure.zi = char;
      inSingleZiGlyphFormSelector = true;
    }
  }

  if (!Object.keys(res).length) throw new IdsError(`IDS为空。`, 0, 0);
  if (inAbstractStructure) throw new IdsError(`抽象构形未闭合。`, 0);
  if (inSurroundTag)
    throw new IdsError(`包围标记未闭合。`, lastSurroundTagIndex);
  if (inSubtractionTag)
    throw new IdsError(`删减标记未闭合。`, lastSubtractionTagIndex);
  if (inReplacementTag)
    throw new IdsError(`替换标记未闭合。`, lastReplacementTagIndex);
  if (inOverlapTag) throw new IdsError(`重叠标记未闭合。`, lastOverlapTagIndex);
  if (inStrokeSequence)
    throw new IdsError(`笔画序列未闭合。`, lastStrokeSequenceIndex, 2);
  if (inGlyphFormSelector)
    throw new IdsError(`字形样式选择器未闭合。`, lastGlyphFormSelectorIndex);
  checkObj(null, res);

  return moveStructureToEnd(res);
}

function strokeSequenceToObj(strokeSequence, index = 0) {
  const res = {
    structure: [],
  };
  strokeSequence = strokeSequence.toArray();
  strokeSequence = strokeSequence.slice(2, -1);
  if (!strokeSequence.length) throw new IdsError(`笔画序列为空。`, index, 3);

  if (strokeSequence[strokeSequence.length - 1] === 'z') {
    res.endToEnd = true;
    strokeSequence = strokeSequence.slice(0, -1);
  }

  const structure = res.structure;
  let curUnit = null;
  let inCrossingTag = false;
  let nextIsReverseStroke = false;
  let inCurve = false;

  for (let charIndex = 0; charIndex < strokeSequence.length; charIndex++) {
    const char = strokeSequence[charIndex];

    if (inCrossingTag && number.has(char)) {
      curUnit.crossing += char;
    } else if (inCurve) {
      if (char !== 'a' && char !== 'b' && char !== 'c' && char !== 'd')
        throw new IdsError(
          `非法<ruby>曲<rp>（</rp><rt>qū</rt><rp>）</rp></ruby>线方向字符“${char}”。（<ruby>曲<rp>（</rp><rt>qū</rt><rp>）</rp></ruby>线方向字符只能是abcd中的一个）`,
          index + charIndex + 2,
          1,
          index + charIndex + 1,
          1
        );
      curUnit.stroke += char;
      inCurve = false;
    } else if (strokes.has(char)) {
      if (curUnit !== null) {
        if ('crossing' in curUnit) {
          if (!curUnit.crossing)
            throw new IdsError(
              `笔画交叉标记未指定交叉索引。`,
              index + charIndex + 1
            );
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
      if (char === 'Q') {
        inCurve = true;
        curUnit.stroke = 'Q';
      } else {
        curUnit.stroke = char;
      }
    } else if (char === 'x') {
      if (curUnit === null)
        throw new IdsError(
          `笔画交叉标记未指定交叉主笔画。`,
          index + charIndex + 2
        );
      if (inCrossingTag)
        throw new IdsError(`笔画交叉标记重复使用。`, index + charIndex + 2);
      inCrossingTag = true;
      curUnit.crossing = '';
    } else if (char === 'b') {
      if (curUnit === null)
        throw new IdsError(`笔画撕开标记未指定目标。`, index + charIndex + 2);
      if (curUnit.break)
        throw new IdsError(`笔画撕开标记重复使用。`, index + charIndex + 2);
      curUnit.break = true;
    } else if (char === '-') {
      if (nextIsReverseStroke)
        throw new IdsError(`逆运笔标记重复使用。`, index + charIndex + 2);
      nextIsReverseStroke = true;
    } else {
      throw new IdsError(`非法笔画序列字符“${char}”。`, index + charIndex + 2);
    }
  }
  if (curUnit !== null) {
    if ('crossing' in curUnit) {
      if (!curUnit.crossing)
        throw new IdsError(
          `笔画交叉标记未指定交叉索引。`,
          index + strokeSequence.length + 1
        );
      curUnit.crossing = parseInt(curUnit.crossing, 10);
    }
    structure.push(curUnit);
    inCrossingTag = false;
  }

  if (nextIsReverseStroke)
    throw new IdsError(
      `逆运笔标记未指定目标笔画。`,
      index + strokeSequence.length + 1
    );
  if (inCurve)
    throw new IdsError(
      `<ruby>曲<rp>（</rp><rt>qū</rt><rp>）</rp></ruby>线未指定方向。`,
      index + strokeSequence.length + 1
    );

  return res;
}

function checkObj(prevObj, data) {
  if (Array.isArray(data)) {
    data.forEach((item) => checkObj(prevObj, item));
  } else if (typeof data === 'object' && data !== null) {
    if (Object.keys(data).length === 0) {
      const idc = prevObj.idc;
      const index = prevObj.index;
      const endIndex = getEndIndex(prevObj);
      throw new IdsError(
        `“${idc}”期望传递${getIdcArity(
          idc
        )}个参数，但实际上只传递了${countNonemptyObjects(
          prevObj.structure
        )}个。`,
        index,
        1,
        index + 1,
        endIndex - index
      );
    }
    for (let key in data) {
      checkObj(data, data[key]);
    }
  }
}

function countNonemptyObjects(arr) {
  return arr.filter((obj) => Object.keys(obj).length !== 0).length;
}

function getEndIndex(obj, result = []) {
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      getEndIndex(obj[key], result);
    }
    if (key === 'index' || key === 'endIndex') {
      result.push(obj[key]);
    }
  }
  return Math.max(...result);
}

function moveStructureToEnd(data) {
  if (Array.isArray(data)) {
    return data.map((item) => moveStructureToEnd(item));
  } else if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    if (keys.includes('structure')) {
      keys.splice(keys.indexOf('structure'), 1);
      keys.push('structure');
    }
    if (keys.includes('index')) keys.splice(keys.indexOf('index'), 1);
    if (keys.includes('endIndex')) keys.splice(keys.indexOf('endIndex'), 1);

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
  return (
    (0x4e00 <= code && code <= 0x9fff) ||
    (0x3400 <= code && code <= 0x4dbf) ||
    (0x20000 <= code && code <= 0x2a6df) ||
    (0x2a700 <= code && code <= 0x2b73a) ||
    (0x2b740 <= code && code <= 0x2b81d) ||
    (0x2b820 <= code && code <= 0x2cea1) ||
    (0x2ceb0 <= code && code <= 0x2ebe0) ||
    (0x30000 <= code && code <= 0x3134a) ||
    (0x31350 <= code && code <= 0x323af) ||
    (0x2ebf0 <= code && code <= 0x2ee5d) ||
    (0x323b0 <= code && code <= 0x3347b) ||
    (0x31c0 <= code && code <= 0x31e5) ||
    (0x2e80 <= code && code <= 0x2ef3) ||
    code === 0x30e6 ||
    code === 0x30b3 ||
    code === 0x3022 ||
    code === 0x3023 ||
    code === 0x30b9 ||
    code === 0x30ea ||
    code === 0x3007 ||
    code === 0xfa27 ||
    code === 0xfa24 ||
    code === 0xfa0e
  );
}

function getIdcArity(idc) {
  if (unaryIdc.has(idc)) return 1;
  if (binaryIdc.has(idc)) return 2;
  if (ternaryIdc.has(idc)) return 3;
}

const input = document.getElementById('input');
const parseButton = document.getElementById('parse');
const copyButton = document.getElementById('copy-button');
const codeBlock = document.getElementById('json-code');
const inputerContainer = document.querySelector('.inputer-container');
const errorRes = document.getElementById('error');
const idsSvgContainer = document.getElementById('ids-svg-container');

inputerContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('inputer-container')) return;
  if (e.target.classList.contains('placeholder')) return;
  e.preventDefault();

  const charToInsert = e.target.innerText;
  const startPos = input.selectionStart;
  const endPos = input.selectionEnd;
  const beforeInput = input.value.substring(0, startPos);
  const afterInput = input.value.substring(endPos);

  input.value = `${beforeInput}${charToInsert}${afterInput}`;
  input.setSelectionRange(
    startPos + charToInsert.length,
    startPos + charToInsert.length
  );
  setTimeout(() => {
    input.focus();
  }, 0);
});

copyButton.addEventListener('click', () => {
  const code = document.getElementById('json-code').textContent;
  navigator.clipboard.writeText(code);
});

parseButton.addEventListener('click', () => {
  const inputValue = input.value;

  errorRes.style.display = 'none';
  let jsonObject;
  try {
    jsonObject = idsToObj(input.value);
  } catch (e) {
    try {
      e.show(errorRes);
    } catch (err) {
      alert(e.stack);
    }
    errorRes.style.display = 'block';
    return;
  }

  window.parent.postMessage(
    {
      type: 'fetchUrl',
      url: `http://zu.zi.tools/${inputValue}.svg`,
    },
    '*'
  );
  idsSvgContainer.style.display = 'flex';
  idsSvgContainer.innerHTML = '正在生成 SVG……';

  window.addEventListener('message', function messageHandler(event) {
    if (!event.data.type.startsWith('fetch')) return;
    console.log(event.data);

    switch (event.data.type) {
      case 'fetchRes':
        idsSvgContainer.innerHTML = event.data.data;
        break;
      case 'featchResponseErrorState':
        idsSvgContainer.innerHTML = `请求失败，状态码：${event.data.state}`;
        break;
      case 'fetchError':
        idsSvgContainer.innerHTML = `Fetch API 报错：${event.data.error}`;
        break;
    }

    window.removeEventListener('message', messageHandler);
  });

  const jsonString = JSON.stringify(jsonObject, null, 2);

  delete codeBlock.dataset.highlighted;
  codeBlock.textContent = jsonString;
  hljs.highlightElement(codeBlock);
});
