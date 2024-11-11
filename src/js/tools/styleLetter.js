const input = document.getElementById('input');
input.addEventListener('input', () => {
  const str = input.value;
  bold.value = toStyleLetter(str, 'bold');
  italic.value = toStyleLetter(str, 'italic');
  boldItalic.value = toStyleLetter(str, 'boldItalic');
  script.value = toStyleLetter(str, 'script');
  boldScript.value = toStyleLetter(str, 'boldScript');
  fraktur.value = toStyleLetter(str, 'fraktur');
  doubleStruck.value = toStyleLetter(str, 'doubleStruck');
  boldFraktur.value = toStyleLetter(str, 'boldFraktur');
  sansSerif.value = toStyleLetter(str, 'sansSerif');
  sansSerifBold.value = toStyleLetter(str, 'sansSerifBold');
  sansSerifItalic.value = toStyleLetter(str, 'sansSerifItalic');
  sansSerifBoldItalic.value = toStyleLetter(str, 'sansSerifBoldItalic');
  monospace.value = toStyleLetter(str, 'monospace');
})

const bold = document.getElementById('bold');
const italic = document.getElementById('italic');
const boldItalic = document.getElementById('boldItalic');
const script = document.getElementById('script');
const boldScript = document.getElementById('boldScript');
const fraktur = document.getElementById('fraktur');
const doubleStruck = document.getElementById('doubleStruck');
const boldFraktur = document.getElementById('boldFraktur');
const sansSerif = document.getElementById('sansSerif');
const sansSerifBold = document.getElementById('sansSerifBold');
const sansSerifItalic = document.getElementById('sansSerifItalic');
const sansSerifBoldItalic = document.getElementById('sansSerifBoldItalic');
const monospace = document.getElementById('monospace');

const toStyleLetter = (str, style) => {
  const styleMap = {
    bold: char => {
      if (0x41 <= char && char <= 0x5A) {
        return String.fromCodePoint(char + 0x1D400 - 0x41);
      } else if (0x61 <= char && char <= 0x7A) {
        return String.fromCodePoint(char + 0x1D41A - 0x61);
      } else if (0x30 <= char && char <= 0x39) {
        return String.fromCodePoint(char + 0x1D7CE - 0x30);
      } else if (0x391 <= char && char <= 0x3A1) {
        return String.fromCodePoint(char + 0x1D6A8 - 0x391);
      } else if (0x3A3 <= char && char <= 0x3A9) {
        return String.fromCodePoint(char + 0x1D6BA - 0x3A3);
      } else if (0x3B1 <= char && char <= 0x3C9) {
        return String.fromCodePoint(char + 0x1D6C2 - 0x3B1);
      }
      return char === 0x3F4 ? '𝚹' :
        char === 0x2202 ? '𝛛' :
        char === 0x3F5 ? '𝛜' :
        char === 0x3D1 ? '𝛝' :
        char === 0x3F0 ? '𝛞' :
        char === 0x3D5 ? '𝛟' :
        char === 0x3F1 ? '𝛠' :
        char === 0x3D6 ? '𝛡' :
        char === 0x2207 ? '𝛁' :
        char === 0x3DC ? '𝟊' :
        char === 0x3DD ? '𝟋' :
        String.fromCodePoint(char);
    },
    italic: char => {
      if (0x41 <= char && char <= 0x5A) {
        return String.fromCodePoint(char + 0x1D434 - 0x41);
      } else if (0x61 <= char && char <= 0x7A) {
        return String.fromCodePoint(char === 0x68 ? 0x210E : char + 0x1D44E - 0x61);
      } else if (0x391 <= char && char <= 0x3A1) {
        return String.fromCodePoint(char + 0x1D6E2 - 0x391);
      } else if (0x3A3 <= char && char <= 0x3A9) {
        return String.fromCodePoint(char + 0x1D6F4 - 0x3A3);
      } else if (0x3B1 <= char && char <= 0x3C9) {
        return String.fromCodePoint(char + 0x1D6FC - 0x3B1);
      }
      return char === 0x3F4 ? '𝛳' :
        char === 0x2202 ? '𝜕' :
        char === 0x3F5 ? '𝜖' :
        char === 0x3D1 ? '𝜗' :
        char === 0x3F0 ? '𝜘' :
        char === 0x3D5 ? '𝜙' :
        char === 0x3F1 ? '𝜚' :
        char === 0x3D6 ? '𝜛' :
        char === 0x2207 ? '𝛻' :
        char === 0x131 ? '𝚤' :
        char === 0x237 ? '𝚥' :
        String.fromCodePoint(char);
    },
    boldItalic: char => {
      if (0x41 <= char && char <= 0x5A) {
        return String.fromCodePoint(char + 0x1D468 - 0x41);
      } else if (0x61 <= char && char <= 0x7A) {
        return String.fromCodePoint(char + 0x1D482 - 0x61);
      } else if (0x391 <= char && char <= 0x3A1) {
        return String.fromCodePoint(char + 0x1D71C - 0x391);
      } else if (0x3A3 <= char && char <= 0x3A9) {
        return String.fromCodePoint(char + 0x1D72E - 0x3A3);
      } else if (0x3B1 <= char && char <= 0x3C9) {
        return String.fromCodePoint(char + 0x1D736 - 0x3B1);
      }
      return char === 0x3F4 ? '𝜭' :
        char === 0x2202 ? '𝝏' :
        char === 0x3F5 ? '𝝐' :
        char === 0x3D1 ? '𝝑' :
        char === 0x3F0 ? '𝝒' :
        char === 0x3D5 ? '𝝓' :
        char === 0x3F1 ? '𝝔' :
        char === 0x3D6 ? '𝝕' :
        char === 0x2207 ? '𝜵' :
        String.fromCodePoint(char);
    },
    script: char => {
      if (0x41 <= char && char <= 0x5A) {
        return String.fromCodePoint(
          char === 0x42 ? 0x212C :
          char === 0x45 ? 0x2130 :
          char === 0x46 ? 0x2131 :
          char === 0x48 ? 0x210B :
          char === 0x49 ? 0x2110 :
          char === 0x4C ? 0x2112 :
          char === 0x4D ? 0x2133 :
          char === 0x52 ? 0x211B :
          char + 0x1D49C - 0x41
        );
      } else if (0x61 <= char && char <= 0x7A) {
        return String.fromCodePoint(
          char === 0x65 ? 0x212F :
          char === 0x67 ? 0x210A :
          char === 0x6F ? 0x2134 :
          char + 0x1D4B6 - 0x61
        );
      }
      return String.fromCodePoint(char);
    },
    boldScript: char => {
      if (0x41 <= char && char <= 0x5A) {
        return String.fromCodePoint(char + 0x1D4D0 - 0x41);
      } else if (0x61 <= char && char <= 0x7A) {
        return String.fromCodePoint(char + 0x1D4EA - 0x61);
      }
      return String.fromCodePoint(char);
    },
    fraktur: char => {
      if (0x41 <= char && char <= 0x5A) {
        return String.fromCodePoint(
          char === 0x43 ? 0x212D :
          char === 0x48 ? 0x210C :
          char === 0x49 ? 0x2111 :
          char === 0x52 ? 0x211C :
          char === 0x5A ? 0x2128 :
          char + 0x1D504 - 0x41
        );
      } else if (0x61 <= char && char <= 0x7A) {
        return String.fromCodePoint(char + 0x1D51E - 0x61);
      }
      return String.fromCodePoint(char);
    },
    doubleStruck: char => {
      if (0x41 <= char && char <= 0x5A) {
        return String.fromCodePoint(
          char === 0x43 ? 0x2102 :
          char === 0x48 ? 0x210D :
          char === 0x4E ? 0x2115 :
          char === 0x50 ? 0x2119 :
          char === 0x51 ? 0x211A :
          char === 0x52 ? 0x211D :
          char === 0x5A ? 0x2124 :
          char + 0x1D538 - 0x41
        );
      } else if (0x61 <= char && char <= 0x7A) {
        return String.fromCodePoint(char + 0x1D552 - 0x61);
      } else if (0x30 <= char && char <= 0x39) {
        return String.fromCodePoint(char + 0x1D7D8 - 0x30);
      }
      return String.fromCodePoint(char);
    },
    boldFraktur: char => {
      if (0x41 <= char && char <= 0x5A) {
        return String.fromCodePoint(char + 0x1D56C - 0x41);
      } else if (0x61 <= char && char <= 0x7A) {
        return String.fromCodePoint(char + 0x1D586 - 0x61);
      }
      return String.fromCodePoint(char);
    },
    sansSerif: char => {
      if (0x41 <= char && char <= 0x5A) {
        return String.fromCodePoint(char + 0x1D5A0 - 0x41);
      } else if (0x61 <= char && char <= 0x7A) {
        return String.fromCodePoint(char + 0x1D5BA - 0x61);
      } else if (0x30 <= char && char <= 0x39) {
        return String.fromCodePoint(char + 0x1D7E2 - 0x30);
      }
      return String.fromCodePoint(char);
    },
    sansSerifBold: char => {
      if (0x41 <= char && char <= 0x5A) {
        return String.fromCodePoint(char + 0x1D5D4 - 0x41);
      } else if (0x61 <= char && char <= 0x7A) {
        return String.fromCodePoint(char + 0x1D5EE - 0x61);
      } else if (0x30 <= char && char <= 0x39) {
        return String.fromCodePoint(char + 0x1D7EC - 0x30);
      } else if (0x391 <= char && char <= 0x3A1) {
        return String.fromCodePoint(char + 0x1D756 - 0x391);
      } else if (0x3A3 <= char && char <= 0x3A9) {
        return String.fromCodePoint(char + 0x1D768 - 0x3A3);
      } else if (0x3B1 <= char && char <= 0x3C9) {
        return String.fromCodePoint(char + 0x1D770 - 0x3B1);
      }
      return char === 0x3F4 ? '𝝧' :
        char === 0x2202 ? '𝞉' :
        char === 0x3F5 ? '𝞊' :
        char === 0x3D1 ? '𝞋' :
        char === 0x3F0 ? '𝞌' :
        char === 0x3D5 ? '𝞍' :
        char === 0x3F1 ? '𝞎' :
        char === 0x3D6 ? '𝞏' :
        char === 0x2207 ? '𝝯' :
        String.fromCodePoint(char);
    },
    sansSerifItalic: char => {
      if (0x41 <= char && char <= 0x5A) {
        return String.fromCodePoint(char + 0x1D608 - 0x41);
      } else if (0x61 <= char && char <= 0x7A) {
        return String.fromCodePoint(char + 0x1D622 - 0x61);
      }
      return String.fromCodePoint(char);
    },
    sansSerifBoldItalic: char => {
      if (0x41 <= char && char <= 0x5A) {
        return String.fromCodePoint(char + 0x1D63C - 0x41);
      } else if (0x61 <= char && char <= 0x7A) {
        return String.fromCodePoint(char + 0x1D656 - 0x61);
      } else if (0x391 <= char && char <= 0x3A1) {
        return String.fromCodePoint(char + 0x1D790 - 0x391);
      } else if (0x3A3 <= char && char <= 0x3A9) {
        return String.fromCodePoint(char + 0x1D7A2 - 0x3A3);
      } else if (0x3B1 <= char && char <= 0x3C9) {
        return String.fromCodePoint(char + 0x1D7AA - 0x3B1);
      }
      return char === 0x3F4 ? '𝞡' :
        char === 0x2202 ? '𝟃' :
        char === 0x3F5 ? '𝟄' :
        char === 0x3D1 ? '𝟅' :
        char === 0x3F0 ? '𝟆' :
        char === 0x3D5 ? '𝟇' :
        char === 0x3F1 ? '𝟈' :
        char === 0x3D6 ? '𝟉' :
        char === 0x2207 ? '𝞩' :
        String.fromCodePoint(char);
    },
    monospace: char => {
      if (0x41 <= char && char <= 0x5A) {
        return String.fromCodePoint(char + 0x1D670 - 0x41);
      } else if (0x61 <= char && char <= 0x7A) {
        return String.fromCodePoint(char + 0x1D68A - 0x61);
      } else if (0x30 <= char && char <= 0x39) {
        return String.fromCodePoint(char + 0x1D7F6 - 0x30);
      }
      return String.fromCodePoint(char);
    }
  }
  return str.toArray().map(char => {
    return styleMap[style](char)
  }).join('')
}

String.prototype.toArray = function() {
  var arr = [];
  for (let i = 0; i < this.length;) {
    const codePoint = this.codePointAt(i);
    i += codePoint > 0xffff ? 2 : 1;
    arr.push(codePoint);
  }
  return arr
}