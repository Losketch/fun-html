const input = document.getElementById('text');

const bold = document.getElementById('bold');
const italic = document.getElementById('italic');
let boldOn = false;
let italicOn = false;

const selectFeatureSettings = document.getElementById('select-feature-settings');
const customSelectFeatureSettings = document.getElementById('custom-select-feature-settings');
let selectFeatureSettingsList = [];
let customSelectFeatureSettingsList = [];
let activeFeatureSettings = [];

bold.addEventListener('click', () => {
  boldOn = boldOn ? false : true;
  input.style.fontWeight = boldOn ? 'bold' : 'normal';
});

italic.addEventListener('click', () => {
  italicOn = italicOn ? false : true;
  input.style.fontStyle = italicOn ? 'italic' : 'normal';
});

function clearText() {
  input.value = '';
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(new Event('blur'));
  window.parent.postMessage({ type: 'clearMainContentHeight'}, '*');
}

const validFontFeatureSettings = new Set([
    "aalt",
    "abvf",
    "abvm",
    "abvs",
    "afrc",
    "akhn",
    "apkn",
    "blwf",
    "blwm",
    "blws",
    "calt",
    "case",
    "ccmp",
    "cfar",
    "chws",
    "cjct",
    "clig",
    "cpct",
    "cpsp",
    "cswh",
    "curs",
    ...new Array(99).fill().map((_, i) => `cv${(i + 1).toString().padStart(2, '0')}`),
    "c2pc",
    "c2sc",
    "dist",
    "dlig",
    "dnom",
    "dtls",
    "expt",
    "falt",
    "fin2",
    "fin3",
    "fina",
    "flac",
    "frac",
    "fwid",
    "half",
    "haln",
    "halt",
    "hist",
    "hkna",
    "hlig",
    "hngl",
    "hojo",
    "hwid",
    "init",
    "isol",
    "ital",
    "jalt",
    "jp78",
    "jp83",
    "jp90",
    "jp04",
    "kern",
    "lfbd",
    "liga",
    "ljmo",
    "lnum",
    "locl",
    "ltra",
    "ltrm",
    "mark",
    "med2",
    "medi",
    "mgrk",
    "mkmk",
    "mset",
    "nalt",
    "nlck",
    "nukt",
    "numr",
    "onum",
    "opbd",
    "ordn",
    "ornm",
    "palt",
    "pcap",
    "pkna",
    "pnum",
    "pref",
    "pres",
    "pstf",
    "psts",
    "pwid",
    "qwid",
    "rand",
    "rclt",
    "rkrf",
    "rlig",
    "rphf",
    "rtbd",
    "rtla",
    "rtlm",
    "ruby",
    "rvrn",
    "salt",
    "sinf",
    "size",
    "smcp",
    "smpl",
    ...new Array(20).fill().map((_, i) => `ss${(i + 1).toString().padStart(2, '0')}`),
    "ssty",
    "stch",
    "subs",
    "sups",
    "swsh",
    "titl",
    "tjmo",
    "tnam",
    "tnum",
    "trad",
    "twid",
    "unic",
    "valt",
    "vapk",
    "vatu",
    "vchw",
    "vert",
    "vhal",
    "vjmo",
    "vkna",
    "vkrn",
    "vpal",
    "vrt2",
    "vrtr",
    "zero"
]);

function updateFeatureSettings() {
  activeFeatureSettings = [...new Set([...selectFeatureSettingsList, ...customSelectFeatureSettingsList])].filter((featureSetting) => featureSetting.length);
  const activeValidFontFeatureSettings = activeFeatureSettings.filter((featureSetting) => validFontFeatureSettings.has(featureSetting));
  const activeInvalidFontFeatureSettings = activeFeatureSettings.filter((featureSetting) => !validFontFeatureSettings.has(featureSetting));
  if (activeInvalidFontFeatureSettings.length) {
    alert(`已忽略以下字体特征设置：${activeInvalidFontFeatureSettings.join('、')}，因为它们不是 https://learn.microsoft.com/zh-cn/typography/opentype/spec/featurelist 中定义的有效字体特征设置。`)
  }

  input.style.fontFeatureSettings = activeValidFontFeatureSettings.map((i) => `"${i}"`).join(',');
}


selectFeatureSettings.addEventListener('select', (e) => {
  selectFeatureSettingsList = e.detail.select;
  updateFeatureSettings();
});

customSelectFeatureSettings.addEventListener('blur', () => {
  customSelectFeatureSettingsList = customSelectFeatureSettings.value.split(',');
  updateFeatureSettings();
});
