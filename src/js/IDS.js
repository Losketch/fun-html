String.prototype.toCharArray = function () {
  let arr = [];
  for (let i = 0; i < this.length; ) {
    const codePoint = this.codePointAt(i);
    i += codePoint > 0xffff ? 2 : 1;
    arr.push(String.fromCodePoint(codePoint));
  }
  return arr;
};

function isZi(char) {
  const code = char.codePointAt();
  return (
    (0x4e00 <= code && code <= 0x9fff) ||
    (0x3400 <= code && code <= 0x4dbf) ||
    (0x20000 <= code && code <= 0x2a6df) ||
    (0x2a700 <= code && code <= 0x2b73f) ||
    (0x2b740 <= code && code <= 0x2b81d) ||
    (0x2b820 <= code && code <= 0x2cead) ||
    (0x2ceb0 <= code && code <= 0x2ebe0) ||
    (0x30000 <= code && code <= 0x3134a) ||
    (0x31350 <= code && code <= 0x323af) ||
    (0x2ebf0 <= code && code <= 0x2ee5d) ||
    (0x323b0 <= code && code <= 0x33479) ||
    (0x31c0 <= code && code <= 0x31e5) ||
    (0x2e80 <= code && code <= 0x2ef3) ||
    code === 0x31c8 ||
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

// IDC 字符集
const UNARY_IDC_SET = new Set(['⿾', '⿿']);
const BINARY_IDC_SET = new Set([
  '⿰',
  '⿱',
  '⿴',
  '⿵',
  '⿶',
  '⿷',
  '⿸',
  '⿹',
  '⿺',
  '⿻',
  '⿼',
  '⿽',
  '㇯'
]);
const TERNARY_IDC_SET = new Set(['⿲', '⿳', '🔄']);
const SURROUND_IDC_SET = new Set([
  '⿴',
  '⿵',
  '⿶',
  '⿷',
  '⿸',
  '⿹',
  '⿺',
  '⿼',
  '⿽'
]);
const ALL_IDC_SET = new Set([
  ...UNARY_IDC_SET,
  ...BINARY_IDC_SET,
  ...TERNARY_IDC_SET
]);

// 笔画字符集
const STROKE_SET = new Set([
  'D',
  'H',
  'J',
  'N',
  'P',
  'Q',
  'S',
  'T',
  'W',
  'Z',
  'g',
  'w',
  '◜',
  '◝',
  '◞',
  '◟',
  '⺄',
  '㇀',
  '㇂',
  '㇄',
  '㇅',
  '㇇',
  '㇈',
  '㇉',
  '㇊',
  '㇋',
  '㇌',
  '㇍',
  '㇎',
  '㇝',
  '一',
  '丨',
  '丶',
  '丿',
  '乀',
  '乁',
  '乙',
  '乚',
  '乛',
  '亅',
  '𠃊',
  '𠃋',
  '𠃌',
  '𠃍',
  '𠃑',
  '𠄌',
  '𠄎'
]);

// GFS 正则表达式与字符集
const GFS_REGEX =
  /^(?:(?:([jq\d]?)(?:[a-dghlnpr-z]+|[a-dghlnpr-z.]{2,}),)+\1(?:[a-dghlnpr-z]+|[a-dghlnpr-z.]{2,})|[jq\d]?(?:[a-dghlnpr-z]+|[a-dghlnpr-z.]{2,})|(?:[BGHJKMPQS-V.],)*[BGHJKMPQS-V.]|(?:[qpxy]\d{3,4}[a-z]?(?:\d{1,2}[a-z.]?)?,)*(?:[qpxy]\d{3,4}[a-z]?(?:\d{1,2}[a-z.]?)?|\.)|(?:qq(?:\d{3}[a-z]?)+,)*qq(?:\d{3}[a-z]?)+|y[2-9]|e|m|,)$/;
const GFS_CHAR_SET = new Set([
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '.',
  ',',
  'B',
  'G',
  'H',
  'J',
  'K',
  'M',
  'P',
  'Q',
  'S',
  'T',
  'U',
  'V',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'l',
  'm',
  'n',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z'
]);

// 标记正则表达式
const SURROUND_TAG_REGEX = /^\[\d+\]$/;
const SUBTRACTION_REPLACEMENT_TAG_REGEX = /^\[\d+\]$/;
const OVERLAP_TAG_REGEX =
  /^\[(?:\d:(?:(?:-|\|)(?:\d|b))?|\d?:(?:-|\|)(?:\d|b)|(?:(?:[bclr]|[xbc_.]{2,}|\.|[xbc_|]{2,})?,)*(?:[bclr]|[xbc_.]{2,}|\.|[xbc_|]{2,})|(?:(?:[bclr]|[xbc_.]{2,}|\.|[xbc_|]{2,})?,)+)\]$/;
const ABSTRACT_STRUCTURE_REGEX =
  /^\{\??[0-3]?[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81d}\u{2b820}-\u{2cead}\u{2ceb0}-\u{2ebe0}\u{30000}-\u{3134a}\u{31350}-\u{323af}\u{2ebf0}-\u{2ee5d}\u{323b0}-\u{33479}\ufa0e\ufa24\ufa27\u3007\u30ea\u30b9\u3023\u3022\u30b3\u30e6\u31c8](?:(?:([jq\d]?)(?:[a-dghlnpr-z]+|[a-dghlnpr-z.]{2,}),)+\1(?:[a-dghlnpr-z]+|[a-dghlnpr-z.]{2,})|[jq\d]?(?:[a-dghlnpr-z]+|[a-dghlnpr-z.]{2,})|(?:[BGHJKMPQS-V.],)*[BGHJKMPQS-V.]|(?:[qpxy]\d{3}[a-z]?\d{1,2}[a-z.]?,)*(?:[qpxy]\d{3}[a-z]?\d{1,2}[a-z.]?|\.)|(?:qq(?:\d{3}[a-z]?)+,)*qq(?:\d{3}[a-z]?)+|y[2-9]|e|m|,)?\}$/u;

// 错误类
class IdsParseError extends Error {
  constructor(message, position) {
    super(`${message}。（位置：${position}）`);
    this.name = 'IdsParseError';
    this.position = position;
  }
}

// AST 节点基类
class IdsNode {
  constructor(type, position) {
    this.type = type;
    this.position = position;
  }

  serializeNode() {
    throw new Error('子类必须实现 serializeNode 方法');
  }
}

// 叶子节点 - 汉字
class ZiNode extends IdsNode {
  constructor(zi, position, gfs = null) {
    super('ziNode', position);
    this.zi = zi;
    this.gfs = gfs;
  }

  serializeNode() {
    return {
      type: this.type,
      zi: this.zi,
      gfs: this.gfs,
      position: this.position
    };
  }
}

// 叶子节点 - 笔画序列
class StrokeSequenceNode extends IdsNode {
  constructor(strokes, close, position) {
    super('strokeSequenceNode', position);
    this.strokes = strokes;
    this.close = close;
  }

  serializeNode() {
    return {
      type: this.type,
      strokes: this.strokes,
      close: this.close,
      position: this.position
    };
  }
}

// 一元 IDC 节点
class UnaryIdcNode extends IdsNode {
  constructor(idc, operand, position) {
    super('unaryIdcNode', position);
    this.idc = idc;
    this.operand = operand;
  }

  serializeNode() {
    return {
      type: this.type,
      idc: this.idc,
      operand: this.operand.serializeNode(),
      position: this.position
    };
  }
}

// 二元 IDC 节点
class BinaryIdcNode extends IdsNode {
  constructor(idc, left, right, position, tag = null) {
    super('binaryIdcNode', position);
    this.idc = idc;
    this.left = left;
    this.right = right;
    this.tag = tag;
  }

  serializeNode() {
    return {
      type: this.type,
      idc: this.idc,
      left: this.left.serializeNode(),
      right: this.right.serializeNode(),
      tag: this.tag,
      position: this.position
    };
  }
}

// 三元 IDC 节点
class TernaryIdcNode extends IdsNode {
  constructor(idc, left, middle, right, position, tag = null) {
    super('ternaryIdcNode', position);
    this.idc = idc;
    this.left = left;
    this.middle = middle;
    this.right = right;
    this.tag = tag;
  }

  serializeNode() {
    return {
      type: this.type,
      idc: this.idc,
      left: this.left.serializeNode(),
      middle: this.middle.serializeNode(),
      right: this.right.serializeNode(),
      tag: this.tag,
      position: this.position
    };
  }
}

// 顶层 IDS 类
class Ids {
  constructor(structureBody, abstractStructure = null, topGfs = null) {
    this.structureBody = structureBody;
    this.abstractStructure = abstractStructure;
    this.topGfs = topGfs;
  }

  serializeNode() {
    return {
      structureBody: this.structureBody.serializeNode(),
      abstractStructure: this.abstractStructure,
      topGfs: this.topGfs
    };
  }
}

// IDS 解析器
class IdsParser {
  constructor() {
    this.chars = [];
    this.index = 0;
    this.length = 0;
  }

  // 获取当前位置
  getPosition() {
    return this.index;
  }

  // 查看当前字符
  peek() {
    return this.index < this.length ? this.chars[this.index] : null;
  }

  // 消费当前字符
  consume() {
    return this.index < this.length ? this.chars[this.index++] : null;
  }

  // 检查是否还有更多字符
  hasMore() {
    return this.index < this.length;
  }

  // 检查字符是否是 GFS 有效字符
  isGfsChar(char) {
    return GFS_CHAR_SET.has(char);
  }

  // 预处理 - 替换曲线符号
  preprocessCurveSymbols(input) {
    return input
      .replace(/Qa/g, '◜')
      .replace(/Qb/g, '◝')
      .replace(/Qc/g, '◞')
      .replace(/Qd/g, '◟');
  }

  // 解析标记
  parseTag(regex) {
    if (this.peek() !== '[') {
      return null;
    }

    const startPos = this.index;
    let tagString = '[';
    this.consume();

    while (this.hasMore() && this.peek() !== ']') {
      tagString += this.consume();
    }

    if (this.peek() !== ']') {
      this.index = startPos;
      return null;
    }

    tagString += this.consume();

    if (regex.test(tagString)) {
      return tagString;
    } else {
      this.index = startPos;
      return null;
    }
  }

  // 尝试匹配 GFS
  tryParseGfs() {
    const startPos = this.index;
    let gfsString = '';

    while (this.hasMore()) {
      const char = this.peek();
      if (this.isGfsChar(char)) {
        gfsString += this.consume();
      } else {
        break;
      }
    }

    if (gfsString && GFS_REGEX.test(gfsString)) {
      return gfsString;
    } else {
      this.index = startPos;
      return null;
    }
  }

  // 解析顶层 GFS
  parseTopGfs() {
    if (this.peek() !== '(') {
      return null;
    }

    const startPos = this.index;
    this.consume();

    const gfs = this.tryParseGfs();
    if (!gfs || this.peek() !== ')') {
      this.index = startPos;
      return null;
    }

    this.consume();
    return gfs;
  }

  // 解析抽象构形
  parseAbstractStructure() {
    if (this.peek() !== '{') {
      return null;
    }

    const startPos = this.index;
    let abstractString = '{';
    this.consume();

    // 解析变体标记
    if (this.peek() === '?') {
      abstractString += this.consume();
      if (this.hasMore() && /[0-3]/.test(this.peek())) {
        abstractString += this.consume();
      }
    }

    // 解析汉字
    if (!this.hasMore() || !isZi(this.peek())) {
      this.index = startPos;
      return null;
    }

    const ziChar = this.consume();
    abstractString += ziChar;

    // 解析 GFS
    let gfs = null;
    if (this.hasMore()) {
      gfs = this.tryParseGfs();
    }

    if (this.peek() !== '}') {
      this.index = startPos;
      return null;
    }

    abstractString += this.consume();

    if (ABSTRACT_STRUCTURE_REGEX.test(abstractString)) {
      const variant = abstractString.slice(1, -1).replace(ziChar, '');
      return {
        zi: ziChar,
        variant: variant || null,
        gfs: gfs
      };
    } else {
      this.index = startPos;
      return null;
    }
  }

  // 解析笔画序列
  parseStrokeSequence() {
    if (
      this.peek() !== '#' ||
      this.index + 1 >= this.length ||
      this.chars[this.index + 1] !== '('
    ) {
      return null;
    }

    const startPos = this.index;
    this.consume();
    this.consume();

    const strokes = [];
    let close = false;

    while (this.hasMore() && this.peek() !== ')') {
      if (this.peek() === 'z') {
        close = true;
        this.consume();
        break;
      }

      const strokeData = this.parseSingleStroke();
      if (!strokeData) {
        throw new IdsParseError('笔画序列中的无效笔画', this.getPosition());
      }

      strokes.push(strokeData);
    }

    if (this.peek() !== ')') {
      throw new IdsParseError(
        '笔画序列缺少结束括号或闭合标记后有笔画',
        this.getPosition()
      );
    }

    this.consume();

    // 验证交叉标记的索引
    for (let i = 0; i < strokes.length; i++) {
      const stroke = strokes[i];
      if (stroke.tags.cross) {
        const crossIndex = parseInt(stroke.tags.cross.substring(1));
        if (crossIndex < 0 || crossIndex >= strokes.length) {
          throw new IdsParseError(
            '交叉标记引用不存在的笔画索引',
            this.getPosition()
          );
        }
      }
    }

    return new StrokeSequenceNode(strokes, close, startPos);
  }

  // 解析单个笔画及其标记
  parseSingleStroke() {
    const tags = {};
    let strokeChar = null;

    if (this.peek() === '-') {
      tags.reverse = true;
      this.consume();
    }

    if (!this.hasMore() || !STROKE_SET.has(this.peek())) {
      return null;
    }

    strokeChar = this.consume();

    while (
      this.hasMore() &&
      this.peek() !== ')' &&
      this.peek() !== '-' &&
      !STROKE_SET.has(this.peek())
    ) {
      const char = this.peek();

      if (char === 'x') {
        if (tags.cross) {
          throw new IdsParseError(
            '单个笔画不能有多个交叉标记',
            this.getPosition()
          );
        }

        this.consume();
        let numberStr = '';
        while (this.hasMore() && /\d/.test(this.peek())) {
          numberStr += this.consume();
        }

        if (numberStr === '') {
          throw new IdsParseError('交叉标记缺少数字索引', this.getPosition());
        }

        tags.cross = 'x' + numberStr;
      } else if (char === 'b') {
        if (tags.break) {
          throw new IdsParseError(
            '单个笔画不能有多个撕开标记',
            this.getPosition()
          );
        }

        tags.break = true;
        this.consume();
      } else {
        break;
      }
    }

    return {
      stroke: strokeChar,
      tags: tags
    };
  }

  // 解析入口函数
  parse(idsString) {
    const processedString = this.preprocessCurveSymbols(idsString);
    this.chars = processedString.toCharArray();
    this.index = 0;
    this.length = this.chars.length;

    if (this.length === 0) {
      throw new IdsParseError('IDS 字符串不能为空', 0);
    }

    // 检查不能只有抽象构形
    if (this.chars[this.chars.length - 1] === '}') {
      throw new IdsParseError('IDS 不能只有抽象构形', 0);
    }

    // 检查抽象构形
    const abstractStructure = this.parseAbstractStructure();

    // 解析结构体
    const structureBody = this.parseExpression();

    // 解析顶层 GFS
    let topGfs = null;
    if (this.hasMore()) {
      topGfs = this.parseTopGfs();
      if (!topGfs) {
        const gfsStartPos = this.index;
        topGfs = this.tryParseGfs();
        if (topGfs) {
          const afterGfsPos = this.index;
          const remainingGfs = this.tryParseGfs();
          if (remainingGfs) {
            this.index = gfsStartPos;
            topGfs = null;
          } else {
            this.index = afterGfsPos;
          }
        }
      }
    }

    if (this.hasMore()) {
      throw new IdsParseError('多余的字符', this.getPosition());
    }

    return new Ids(structureBody, abstractStructure, topGfs);
  }

  // 解析表达式
  parseExpression() {
    const currentChar = this.peek();
    const position = this.getPosition();

    const strokeSeq = this.parseStrokeSequence();
    if (strokeSeq) {
      return strokeSeq;
    }

    if (isZi(currentChar)) {
      const ziNode = new ZiNode(this.consume(), position);

      // 汉字后面可以跟GFS
      if (this.hasMore()) {
        const gfsStartPos = this.index;
        const gfs = this.tryParseGfs();
        if (gfs) {
          const afterGfsPos = this.index;
          const remainingGfs = this.tryParseGfs();
          if (remainingGfs) {
            this.index = gfsStartPos;
            return ziNode;
          } else {
            this.index = afterGfsPos;
            return new ZiNode(ziNode.zi, position, gfs);
          }
        }
      }

      return ziNode;
    }

    if (ALL_IDC_SET.has(currentChar)) {
      return this.parseIdcExpression();
    }

    throw new IdsParseError('遇到无效字符', position);
  }

  // 解析 IDC 表达式
  parseIdcExpression() {
    const idc = this.consume();
    const position = this.getPosition() - 1;

    // 解析标记（在操作数之前）
    let tag = null;
    if (SURROUND_IDC_SET.has(idc)) {
      tag = this.parseTag(SURROUND_TAG_REGEX);
    } else if (idc === '⿻') {
      tag = this.parseTag(OVERLAP_TAG_REGEX);
    } else if (idc === '㇯') {
      tag = this.parseTag(SUBTRACTION_REPLACEMENT_TAG_REGEX);
    } else if (idc === '🔄') {
      tag = this.parseTag(SUBTRACTION_REPLACEMENT_TAG_REGEX);
    }

    if (UNARY_IDC_SET.has(idc)) {
      return this.parseUnary(idc, position);
    } else if (BINARY_IDC_SET.has(idc)) {
      return this.parseBinary(idc, position, tag);
    } else if (TERNARY_IDC_SET.has(idc)) {
      return this.parseTernary(idc, position, tag);
    }

    throw new IdsParseError('遇到未知的 IDC 字符', position);
  }

  // 解析一元 IDC
  parseUnary(idc, position) {
    if (!this.hasMore()) {
      throw new IdsParseError('一元 IDC 缺少操作数', this.getPosition());
    }

    const operand = this.parseExpression();
    return new UnaryIdcNode(idc, operand, position);
  }

  // 解析二元 IDC
  parseBinary(idc, position, tag = null) {
    if (!this.hasMore()) {
      throw new IdsParseError('二元 IDC 缺少左操作数', this.getPosition());
    }

    const left = this.parseExpression();

    if (!this.hasMore()) {
      throw new IdsParseError('二元 IDC 缺少右操作数', this.getPosition());
    }

    const right = this.parseExpression();
    return new BinaryIdcNode(idc, left, right, position, tag);
  }

  // 解析三元 IDC
  parseTernary(idc, position, tag = null) {
    if (!this.hasMore()) {
      throw new IdsParseError('三元 IDC 缺少左操作数', this.getPosition());
    }

    const left = this.parseExpression();

    if (!this.hasMore()) {
      throw new IdsParseError('三元 IDC 缺少中间操作数', this.getPosition());
    }

    const middle = this.parseExpression();

    if (!this.hasMore()) {
      throw new IdsParseError('三元 IDC 缺少右操作数', this.getPosition());
    }

    const right = this.parseExpression();
    return new TernaryIdcNode(idc, left, middle, right, position, tag);
  }
}

export default { IdsParser, IdsParseError };
