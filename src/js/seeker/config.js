const makeBlock = ({ key, marker, bit, label, shortLabel, ranges = [] }) =>
  Object.freeze({
    key,
    marker,
    bit,
    label,
    shortLabel,
    colorVar: `--md-sys-color-seeker-${key}`,
    foregroundVar:
      key === 'BSC' || key === 'OTH'
        ? '--md-sys-color-on-surface'
        : '--md-sys-color-on-primary',
    ranges: Object.freeze(ranges.map(range => Object.freeze(range)))
  });

export const TANGUT_CHARACTER_RANGES = Object.freeze([
  Object.freeze([0x17000, 0x187ff]),
  Object.freeze([0x18d00, 0x18d1e])
]);

export const TANGUT_COMPONENT_RANGES = Object.freeze([
  Object.freeze([0x18800, 0x18aff]),
  Object.freeze([0x18d80, 0x18df2])
]);

const blocks = [
  makeBlock({ key: 'BSC', marker: '#', bit: 1 << 0, label: '基本区', shortLabel: '基', ranges: [[0x4e00, 0x9fff]] }),
  makeBlock({ key: 'ExA', marker: 'A', bit: 1 << 1, label: '扩展 A 区', shortLabel: 'A', ranges: [[0x3400, 0x4dbf]] }),
  makeBlock({ key: 'ExB', marker: 'B', bit: 1 << 2, label: '扩展 B 区', shortLabel: 'B', ranges: [[0x20000, 0x2a6df]] }),
  makeBlock({ key: 'ExC', marker: 'C', bit: 1 << 3, label: '扩展 C 区', shortLabel: 'C', ranges: [[0x2a700, 0x2b73f]] }),
  makeBlock({ key: 'ExD', marker: 'D', bit: 1 << 4, label: '扩展 D 区', shortLabel: 'D', ranges: [[0x2b740, 0x2b81e]] }),
  makeBlock({ key: 'ExE', marker: 'E', bit: 1 << 5, label: '扩展 E 区', shortLabel: 'E', ranges: [[0x2b820, 0x2cead]] }),
  makeBlock({ key: 'ExF', marker: 'F', bit: 1 << 6, label: '扩展 F 区', shortLabel: 'F', ranges: [[0x2ceb0, 0x2ebe0]] }),
  makeBlock({ key: 'ExG', marker: 'G', bit: 1 << 7, label: '扩展 G 区', shortLabel: 'G', ranges: [[0x30000, 0x3134a]] }),
  makeBlock({ key: 'ExH', marker: 'H', bit: 1 << 8, label: '扩展 H 区', shortLabel: 'H', ranges: [[0x31350, 0x323af]] }),
  makeBlock({ key: 'ExI', marker: 'I', bit: 1 << 9, label: '扩展 I 区', shortLabel: 'I', ranges: [[0x2ebf0, 0x2ee5d]] }),
  makeBlock({ key: 'ExJ', marker: 'J', bit: 1 << 10, label: '扩展 J 区', shortLabel: 'J', ranges: [[0x323b0, 0x3347f]] }),
  makeBlock({
    key: 'TAN',
    marker: '~',
    bit: 1 << 30,
    label: '西夏文',
    shortLabel: '夏',
    ranges: TANGUT_CHARACTER_RANGES
  }),
  makeBlock({
    key: 'CMP',
    marker: '$',
    bit: 1 << 28,
    label: '兼容表意文字',
    shortLabel: '兼',
    ranges: [[0xf900, 0xfaff], [0x2f800, 0x2fa1f]]
  }),
  makeBlock({ key: 'OTH', marker: '&', bit: 1 << 27, label: '其它 IDS 字符', shortLabel: '它' })
];

export const SEEKER_CONFIG = Object.freeze({
  version: Object.freeze({
    id: '5.3.0',
    label: '版本：5.3.0 (2026 年 10 月)'
  }),

  database: Object.freeze({
    schema: 4,
    source: 'yi-bai/ids + JLHwung/TangutIDS',
    unicode: '18.0',
    tangutUnicode: '17.0'
  }),

  urls: Object.freeze({
    character: 'https://zi.tools/zi/$ENC$',
    glyph: 'https://seeki.vistudium.top/SVG/'
  }),

  search: Object.freeze({
    inputDebounceMs: 80,
    cooperativeYieldEvery: 8192,
    maxTreeDepth: 48,
    defaultLiveBlockKey: 'BSC'
  }),

  syntax: Object.freeze({
    treePrefix: ':',
    ignoreSeparator: '-',
    idcStart: 0x2ff0,
    idcEnd: 0x2fff
  }),

  storage: Object.freeze({
    standardOnly: 'seeker.standardOnly',
    subdivide: 'seeker.subdivide',
    variant: 'seeker.variant',
    showKeypad: 'seeker.showKeypad',
    shortcuts: 'seeker.shortcuts'
  }),

  ui: Object.freeze({
    shortcutLimit: 20,
    hideMenuDelayMs: 100,
    toastDurationMs: 1000,
    resultPageSize: 400
  }),

  blocks: Object.freeze(blocks)
});

export const BLOCK_BY_KEY = new Map(SEEKER_CONFIG.blocks.map(block => [block.key, block]));
export const BLOCK_BY_MARKER = new Map(SEEKER_CONFIG.blocks.map(block => [block.marker, block]));
export const ALL_BLOCK_MASK = SEEKER_CONFIG.blocks.reduce((mask, block) => mask | block.bit, 0);

export function isTangutSearchCodePoint(codePoint) {
  return [...TANGUT_CHARACTER_RANGES, ...TANGUT_COMPONENT_RANGES].some(
    ([start, end]) => codePoint >= start && codePoint <= end
  );
}

export function getBlockByCodePoint(codePoint) {
  for (const block of SEEKER_CONFIG.blocks) {
    if (block.key === 'OTH') continue;
    for (const [start, end] of block.ranges) {
      if (codePoint >= start && codePoint <= end) return block;
    }
  }
  return BLOCK_BY_KEY.get('OTH');
}

export function getBlockByKey(key) {
  return BLOCK_BY_KEY.get(key) ?? BLOCK_BY_KEY.get('OTH');
}

export function getCharacterUrlTemplate() {
  return SEEKER_CONFIG.urls.character;
}

export default SEEKER_CONFIG;
