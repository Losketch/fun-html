String.prototype.toArray = function () {
  var arr = [];
  for (let i = 0; i < this.length; ) {
    const codePoint = this.codePointAt(i);
    i += codePoint > 0xffff ? 2 : 1;
    arr.push(codePoint);
  }
  return arr;
};

String.prototype.toCharArray = function () {
  var arr = [];
  for (let i = 0; i < this.length; ) {
    const codePoint = this.codePointAt(i);
    i += codePoint > 0xffff ? 2 : 1;
    arr.push(String.fromCodePoint(codePoint));
  }
  return arr;
};

const toStyleLetter = (str, style) => {
  const styleMap = {
    bold: (char) => {
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(char + 0x1d400 - 0x41);
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(char + 0x1d41a - 0x61);
      }
      if (0x30 <= char && char <= 0x39) {
        return String.fromCodePoint(char + 0x1d7ce - 0x30);
      }
      if (0x391 <= char && char <= 0x3a1) {
        return String.fromCodePoint(char + 0x1d6a8 - 0x391);
      }
      if (0x3a3 <= char && char <= 0x3a9) {
        return String.fromCodePoint(char + 0x1d6ba - 0x3a3);
      }
      if (0x3b1 <= char && char <= 0x3c9) {
        return String.fromCodePoint(char + 0x1d6c2 - 0x3b1);
      }
      return char === 0x3f4
        ? '𝚹'
        : char === 0x2202
          ? '𝛛'
          : char === 0x3f5
            ? '𝛜'
            : char === 0x3d1
              ? '𝛝'
              : char === 0x3f0
                ? '𝛞'
                : char === 0x3d5
                  ? '𝛟'
                  : char === 0x3f1
                    ? '𝛠'
                    : char === 0x3d6
                      ? '𝛡'
                      : char === 0x2207
                        ? '𝛁'
                        : char === 0x3dc
                          ? '𝟊'
                          : char === 0x3dd
                            ? '𝟋'
                            : String.fromCodePoint(char);
    },
    italic: (char) => {
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(char + 0x1d434 - 0x41);
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(
          char === 0x68 ? 0x210e : char + 0x1d44e - 0x61
        );
      }
      if (0x391 <= char && char <= 0x3a1) {
        return String.fromCodePoint(char + 0x1d6e2 - 0x391);
      }
      if (0x3a3 <= char && char <= 0x3a9) {
        return String.fromCodePoint(char + 0x1d6f4 - 0x3a3);
      }
      if (0x3b1 <= char && char <= 0x3c9) {
        return String.fromCodePoint(char + 0x1d6fc - 0x3b1);
      }
      return char === 0x3f4
        ? '𝛳'
        : char === 0x2202
          ? '𝜕'
          : char === 0x3f5
            ? '𝜖'
            : char === 0x3d1
              ? '𝜗'
              : char === 0x3f0
                ? '𝜘'
                : char === 0x3d5
                  ? '𝜙'
                  : char === 0x3f1
                    ? '𝜚'
                    : char === 0x3d6
                      ? '𝜛'
                      : char === 0x2207
                        ? '𝛻'
                        : char === 0x131
                          ? '𝚤'
                          : char === 0x237
                            ? '𝚥'
                            : String.fromCodePoint(char);
    },
    boldItalic: (char) => {
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(char + 0x1d468 - 0x41);
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(char + 0x1d482 - 0x61);
      }
      if (0x391 <= char && char <= 0x3a1) {
        return String.fromCodePoint(char + 0x1d71c - 0x391);
      }
      if (0x3a3 <= char && char <= 0x3a9) {
        return String.fromCodePoint(char + 0x1d72e - 0x3a3);
      }
      if (0x3b1 <= char && char <= 0x3c9) {
        return String.fromCodePoint(char + 0x1d736 - 0x3b1);
      }
      return char === 0x3f4
        ? '𝜭'
        : char === 0x2202
          ? '𝝏'
          : char === 0x3f5
            ? '𝝐'
            : char === 0x3d1
              ? '𝝑'
              : char === 0x3f0
                ? '𝝒'
                : char === 0x3d5
                  ? '𝝓'
                  : char === 0x3f1
                    ? '𝝔'
                    : char === 0x3d6
                      ? '𝝕'
                      : char === 0x2207
                        ? '𝜵'
                        : String.fromCodePoint(char);
    },
    script: (char) => {
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(
          char === 0x42
            ? 0x212c
            : char === 0x45
              ? 0x2130
              : char === 0x46
                ? 0x2131
                : char === 0x48
                  ? 0x210b
                  : char === 0x49
                    ? 0x2110
                    : char === 0x4c
                      ? 0x2112
                      : char === 0x4d
                        ? 0x2133
                        : char === 0x52
                          ? 0x211b
                          : char + 0x1d49c - 0x41
        );
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(
          char === 0x65
            ? 0x212f
            : char === 0x67
              ? 0x210a
              : char === 0x6f
                ? 0x2134
                : char + 0x1d4b6 - 0x61
        );
      }
      return String.fromCodePoint(char);
    },
    boldScript: (char) => {
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(char + 0x1d4d0 - 0x41);
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(char + 0x1d4ea - 0x61);
      }
      return String.fromCodePoint(char);
    },
    fraktur: (char) => {
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(
          char === 0x43
            ? 0x212d
            : char === 0x48
              ? 0x210c
              : char === 0x49
                ? 0x2111
                : char === 0x52
                  ? 0x211c
                  : char === 0x5a
                    ? 0x2128
                    : char + 0x1d504 - 0x41
        );
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(char + 0x1d51e - 0x61);
      }
      return String.fromCodePoint(char);
    },
    doubleStruck: (char) => {
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(
          char === 0x43
            ? 0x2102
            : char === 0x48
              ? 0x210d
              : char === 0x4e
                ? 0x2115
                : char === 0x50
                  ? 0x2119
                  : char === 0x51
                    ? 0x211a
                    : char === 0x52
                      ? 0x211d
                      : char === 0x5a
                        ? 0x2124
                        : char + 0x1d538 - 0x41
        );
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(char + 0x1d552 - 0x61);
      }
      if (0x30 <= char && char <= 0x39) {
        return String.fromCodePoint(char + 0x1d7d8 - 0x30);
      }
      return String.fromCodePoint(char);
    },
    boldFraktur: (char) => {
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(char + 0x1d56c - 0x41);
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(char + 0x1d586 - 0x61);
      }
      return String.fromCodePoint(char);
    },
    sansSerif: (char) => {
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(char + 0x1d5a0 - 0x41);
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(char + 0x1d5ba - 0x61);
      }
      if (0x30 <= char && char <= 0x39) {
        return String.fromCodePoint(char + 0x1d7e2 - 0x30);
      }
      return String.fromCodePoint(char);
    },
    sansSerifBold: (char) => {
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(char + 0x1d5d4 - 0x41);
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(char + 0x1d5ee - 0x61);
      }
      if (0x30 <= char && char <= 0x39) {
        return String.fromCodePoint(char + 0x1d7ec - 0x30);
      }
      if (0x391 <= char && char <= 0x3a1) {
        return String.fromCodePoint(char + 0x1d756 - 0x391);
      }
      if (0x3a3 <= char && char <= 0x3a9) {
        return String.fromCodePoint(char + 0x1d768 - 0x3a3);
      }
      if (0x3b1 <= char && char <= 0x3c9) {
        return String.fromCodePoint(char + 0x1d770 - 0x3b1);
      }
      return char === 0x3f4
        ? '𝝧'
        : char === 0x2202
          ? '𝞉'
          : char === 0x3f5
            ? '𝞊'
            : char === 0x3d1
              ? '𝞋'
              : char === 0x3f0
                ? '𝞌'
                : char === 0x3d5
                  ? '𝞍'
                  : char === 0x3f1
                    ? '𝞎'
                    : char === 0x3d6
                      ? '𝞏'
                      : char === 0x2207
                        ? '𝝯'
                        : String.fromCodePoint(char);
    },
    sansSerifItalic: (char) => {
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(char + 0x1d608 - 0x41);
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(char + 0x1d622 - 0x61);
      }
      return String.fromCodePoint(char);
    },
    sansSerifBoldItalic: (char) => {
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(char + 0x1d63c - 0x41);
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(char + 0x1d656 - 0x61);
      }
      if (0x391 <= char && char <= 0x3a1) {
        return String.fromCodePoint(char + 0x1d790 - 0x391);
      }
      if (0x3a3 <= char && char <= 0x3a9) {
        return String.fromCodePoint(char + 0x1d7a2 - 0x3a3);
      }
      if (0x3b1 <= char && char <= 0x3c9) {
        return String.fromCodePoint(char + 0x1d7aa - 0x3b1);
      }
      return char === 0x3f4
        ? '𝞡'
        : char === 0x2202
          ? '𝟃'
          : char === 0x3f5
            ? '𝟄'
            : char === 0x3d1
              ? '𝟅'
              : char === 0x3f0
                ? '𝟆'
                : char === 0x3d5
                  ? '𝟇'
                  : char === 0x3f1
                    ? '𝟈'
                    : char === 0x3d6
                      ? '𝟉'
                      : char === 0x2207
                        ? '𝞩'
                        : String.fromCodePoint(char);
    },
    monospace: (char) => {
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(char + 0x1d670 - 0x41);
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(char + 0x1d68a - 0x61);
      }
      if (0x30 <= char && char <= 0x39) {
        return String.fromCodePoint(char + 0x1d7f6 - 0x30);
      }
      return String.fromCodePoint(char);
    },
    circle: (char) => {
      if (0x31 <= char && char <= 0x39) {
        return String.fromCodePoint(char + 0x242f);
      }
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(char + 0x2475);
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(char + 0x246f);
      }
      return char == 0x30 ? '⓪' : String.fromCodePoint(char);
    },
    negativeCircle: (char) => {
      if (0x31 <= char && char <= 0x39) {
        return String.fromCodePoint(char + 0x2745);
      }
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(char + 0x1f10f);
      }
      return char == 0x30 ? '⓿' : String.fromCodePoint(char);
    },
    parenthesized: (char) => {
      if (0x31 <= char && char <= 0x39) {
        return String.fromCodePoint(char + 0x2443);
      }
      if (0x41 <= char && char <= 0x5a) {
        return String.fromCodePoint(char + 0x1f0cf);
      }
      if (0x61 <= char && char <= 0x7a) {
        return String.fromCodePoint(char + 0x243b);
      }
      return String.fromCodePoint(char);
    },
    square: (char) =>
      0x41 <= char && char <= 0x5a
        ? String.fromCodePoint(char + 0x1f0ef)
        : String.fromCodePoint(char),
    superscript: (char) => {
      if (0x30 <= char && char <= 0x39) {
        return '⁰¹²³⁴⁵⁶⁷⁸⁹'[char - 0x30];
      }
      if (0x41 <= char && char <= 0x5a) {
        return 'ᴬᴮꟲᴰᴱꟳᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾꟴᴿˢᵀᵁⱽᵂˣʸᶻ'[char - 0x41];
      }
      if (0x61 <= char && char <= 0x7a) {
        return 'ᵃᵇᶜᵈᵉᶠᶢʰⁱʲᵏˡᵐⁿᵒᵖ𐞥ʳˢᵗᵘᵛʷˣʸᶻ'.toCharArray()[char - 0x61];
      }
      return char == 0x2b
        ? '⁺'
        : char == 0x2d
          ? '⁻'
          : char == 0x3d
            ? '⁼'
            : char == 0x28
              ? '⁽'
              : char == 0x29
                ? '⁾'
                : String.fromCodePoint(char);
    },
    subscript: (char) => {
      if (0x30 <= char && char <= 0x39) {
        return '₀₁₂₃₄₅₆₇₈₉'[char - 0x30];
      }
      if (0x61 <= char && char <= 0x7a) {
        return 'ₐbcdₑfgₕᵢⱼₖₗₘₙₒₚqᵣₛₜᵤᵥw᙮yz'[char - 0x61];
      }
      return char == 0x2b
        ? '₊'
        : char == 0x2d
          ? '₋'
          : char == 0x3d
            ? '₌'
            : char == 0x28
              ? '₍'
              : char == 0x29
                ? '₎'
                : String.fromCodePoint(char);
    }
  };
  return str
    .toArray()
    .map((char) => styleMap[style](char))
    .join('');
};

const input = document.getElementById('input');
const output = document.getElementById('output');
const selectFont = document.getElementById('select-font');
const cnvButton = document.getElementById('cnv-button');
let font;

selectFont.addEventListener('select', (e) => {
  font = e.detail.select;
});

cnvButton.addEventListener('click', () => {
  output.value = toStyleLetter(input.value, font);
  output.dispatchEvent(new Event('input'));
  output.dispatchEvent(new Event('blur'));
});
