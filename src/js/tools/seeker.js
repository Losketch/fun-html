import '../../css/mainStyles.css';
import '../../css/mainStyles.css';
import '../../css/tools/seeker.css';

import '../changeHeader.js';
import '../m3ui.js';

import { dt, vt } from '../../data/handata_uni.js';
import { parts } from '../../data/parts.js';

import $ from 'jquery';

function _(id) {
  return document.getElementById(id);
}
const $_ = _('input');

let time;
let popup;
let q;

function pop(ch) {
  time = 0;
  const btnValue = document.querySelector('.set-v2-popup-symbol');
  btnValue.innerHTML = ch;
  popup = document.getElementsByClassName('set-v2-popup')[0];
  clearInterval(q);
  q = setInterval(() => {
    opa();
  }, 50);
}

function opa() {
  let op;
  if (time < 0.5) {
    op = -4 * time * time + 4 * time;
  } else if (time > 1) {
    op = -4 * time * time + 8 * time - 3;
  } else {
    op = 1;
  }
  popup.style = 'display: block;opacity: ' + op + ';';
  if (op < 0) {
    op = 0;
    time = -0.05;
    popup.style = 'display: none;';
    clearInterval(q);
  }
  time += 0.05;
}

const Config = {
  // $CHR$ 表示未经编码的汉字变量
  // $ENC$ 表示经URI编码的汉字变量
  // $UCD$ 表示汉字的10进制Unicode变量
  // $UCh$ 表示汉字的16进制小写Unicode变量
  // $UCH$ 表示汉字的16进制大写Unicode变量
  url: 'https://zi.tools/zi/$ENC$',

  // GlyphWiki网站的图片网址，默认输出uxxxxx.svg
  glyphwiki: 'https://seeki.vistudium.top/SVG/',

  // 指定哪个Range要采用图片显示 (true=图片显示，false=文本显示)
  useImage: {
    '-2': false,
    '-1': false,
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false
  },
  resultStep1: 299,
  resultStep2: 1999
};

const Seeker = {
  dataIndex: null,
  seg: 1000,
  interval: 50,
  totalmsec: 0,
  segcnt: 0,
  worker: null,
  result: null,
  groups: null,
  blockFlagMap: {
    '%': 1 << 30,
    $: 1 << 29,
    '&': 1 << 28,
    '#': 1 << 0,
    A: 1 << 1,
    B: 1 << 2,
    C: 1 << 3,
    D: 1 << 4,
    E: 1 << 5,
    F: 1 << 6,
    G: 1 << 7,
    H: 1 << 8,
    I: 1 << 9
  },
  blockMap: {
    '-2': 1 << 30,
    '-1': 1 << 29,
    0: 1 << 28,
    1: 1 << 0,
    2: 1 << 1,
    3: 1 << 2,
    4: 1 << 3,
    5: 1 << 4,
    6: 1 << 5,
    7: 1 << 6,
    8: 1 << 7,
    9: 1 << 8,
    10: 1 << 9
  },
  parts,
  getVersion() {
    return '1.1.0.0   (2021年11月)';
  },
  variant(w, v) {
    return v && vt[w] ? vt[w] : w;
  },
  arraylize(s, v, a) {
    let blockFlag = 0;
    for (let i = 0; i < s.length; i++) {
      const w = s.charPointAt(i);
      if (w.length > 1) i++;
      if (Seeker.blockFlagMap[w]) {
        blockFlag |= Seeker.blockFlagMap[w];
      } else {
        if (w.length == 1) {
          const c = w.charCodeAt(0);
          if (c >= 0x2ff0 && c <= 0x2fff) break; // CJK description
        }
        a.push(Seeker.variant(w, v));
      }
    }
    return blockFlag || Seeker.blockFlagAll;
  },
  getCJKBlock(c) {
    if (c >= 0x4e00 && c <= 0x9fff) return 1;
    if (c >= 0x3400 && c <= 0x4dbf) return 2;
    if (c >= 0x20000 && c <= 0x2a6df) return 3;
    if (c >= 0x2a700 && c <= 0x2b739) return 4;
    if (c >= 0x2b740 && c <= 0x2b81d) return 5;
    if (c >= 0x2b820 && c <= 0x2cea1) return 6;
    if (c >= 0x2ceb0 && c <= 0x2ebe0) return 7;
    if (c >= 0x30000 && c <= 0x3134a) return 8;
    if (c >= 0x31350 && c <= 0x323af) return 9;
    if (c >= 0x2ebf0 && c <= 0x2ee5d) return 10;
    if (c >= 0xf900 && c <= 0xfad9) return -1;
    if (c >= 0x2f800 && c <= 0x2fa1d) return -1;
    if (c >= 0xf0270 && c <= 0xfae7a) return -2;
    return 0;
  },
  getData(c) {
    if (Seeker.dataIndex == null) {
      Seeker.dataIndex = {};
      for (let i in dt) {
        const chr = dt[i].codePointAt(0);
        if (typeof chr != 'number') continue;
        Seeker.dataIndex[chr] = dt[i].substring(chr > 0xffff ? 2 : 1);
      }
    }
    return Seeker.dataIndex[c];
  },
  eliminate(query, str, groups, ignore, divide, variant) {
    // query: 搜尋字串的陣列(已排序)
    // str: 正要媒合的樹枝
    // divide: 硬拆
    // variant: 包容異體
    if (str == '@') return null; // 如果此字已無法再分解

    const backup = query.concat(); // b: 備份搜尋陣列a
    let res = false;
    for (let i = 0; i < str.length; i++) {
      // 針對拆分序列中的每個字
      const w = str.charPointAt(i);
      if (w.length > 1) i++;
      if (ignore && ignore.indexOf(w) >= 0) {
        continue;
      }

      if (w == '!' && !divide) break; // 若此字是無理拆分且非無理拆分模式
      if (w == '@' || w == '!') {
        // 某種拆分方式的起始
        if (!query.length) break;
        query.length = 0; // 從備份重建搜尋陣列
        for (let j = 0; j < backup.length; j++) query.push(backup[j]);
      } else if (query.length) {
        // 搜尋陣列還有值
        const pos = query.indexOf(Seeker.variant(w, variant)); // 在搜尋陣列中尋找這個字的位置
        if (pos >= 0) {
          query.splice(pos, 1); // 找到了：從搜尋陣列刪除這個字
          res |= true;
        }
      }
    }
    return res;
  },
  stopMatch() {
    clearTimeout(Seeker.worker);
  },
  getMatch(s, ignore, variant, divide, force) {
    // string, variant?, divide?, max, href
    clearTimeout(Seeker.worker);

    const x = [];
    const blockFlag = Seeker.arraylize(s, variant, x);
    x.sort();
    s = x.join('');
    if (s == '') return;

    const found = [];
    function work(j) {
      if (j + Seeker.seg < dt.length)
        Seeker.worker = setTimeout(
          () => {
            work(j + Seeker.seg);
          },
          Seeker.segcnt > 10
            ? Math.floor(Seeker.totalmsec / Seeker.segcnt + 5)
            : Seeker.interval
        );
      const st = new Date();
      let i;
      for (i = j; i < j + Seeker.seg && i < dt.length; i++) {
        const query = x.concat(); // 複製陣列 (因為eliminate函式內會直接操作，故用concat的副作用進行複製)
        const w = dt[i].charPointAt(0); // 目前測試的字
        const c = w.codePointAt(0); //            的unicode
        const block = Seeker.getCJKBlock(c);
        if (ignore && ignore.indexOf(w) >= 0) continue;

        if (blockFlag) {
          // 篩選要包含的Unicode分區
          const f = Seeker.blockMap[block];
          if (!(blockFlag & f)) continue;
        }

        const groups = [];
        if (Seeker.variant(w, variant) != s) {
          Seeker.eliminate(
            query,
            dt[i].slice(w.length),
            groups,
            ignore,
            divide,
            variant
          );
          if (query.length) continue; // 沒命中
          groups.unshift(w);
        }

        const hitData = {
          char: w,
          unicode: c,
          groups: groups,
          order: found.length
        };
        if (force || block == 1) found.push(hitData);
        if (!force && block != 1) {
          clearTimeout(Seeker.worker);
          UI.finished(found);
          break; // 新增超過m+1時break掉，雖然可能因此喪失精確命中結果，但可以明顯加速運算
        }
      }
      UI.setResult(found, i, force);
      Seeker.totalmsec += new Date() - st;
      Seeker.segcnt++;

      if (j + Seeker.seg >= dt.length) UI.finished(found);
    }
    Seeker.worker = setTimeout(() => {
      work(0);
    }, 10);
  },
  exhaust(s, divide, recursive) {
    let res = '';
    if (s.length) {
      let w = s.charPointAt(0);
      const c = w.codePointAt(0);
      const def = Seeker.getData(c); //.substring(w.length);
      let k = 0;
      for (let i = 0; i < def.length; i++) {
        w = def.charPointAt(i);
        if (w.length > 1) i++;
        if (w == '!' && !divide) break;
        if (w == '@' || w == '!') {
          if (k) res += recursive == -1 ? '┇' : '‖';
          k++;
        } else {
          res += w;
          if (recursive) {
            const subRes = Seeker.exhaust(w, divide, -1);
            if (subRes.length) res += '(' + subRes + ')';
          }
        }
      }
    }
    return res;
  },
  getTree(str, divide) {
    let html = '';
    if (str.length) {
      const w = str.charPointAt(0);
      const c = w.codePointAt(0);
      const p = Seeker.exhaust(w, divide, true)
        .replace(
          /([\ud800-\udbff][\udc00-\udfff]|[^\ud800-\udfff])\(/g,
          '<span class="line">$1(<span class="sub">'
        )
        .replace(/\)/g, '</span>)</span>');

      if (p == '') {
        html += UI.addCell({ char: w, unicode: c, text: '(无法再分解)' });
      } else {
        const strs = p.split('‖');
        for (let i in strs) {
          html += UI.addCell({
            char: w,
            unicode: c,
            text: strs[i].length ? strs[i] : '(无法再分解)'
          });
        }
      }
    }
    return html;
  }
};

Seeker.blockFlagAll = Object.values(Seeker.blockFlagMap).reduce(
  (acc, curr) => acc | curr,
  0
);

const UI = {
  shortcuts: [],
  keypadMode: null,
  strokeKeyboard: {
    vertical: true,
    className: 'strokeKB',
    groups: {
      '01畫': '一丨丶丿乙亅乚㇄㇁㇂𠄌𠃊𠃋𡿨乛㇇𠃍㇏乀⺄𠃌㇆㇉𠃑㇊㇒㇣㇀',
      '02畫':
        '二亠人儿入八冂冖冫几凵刀力勹匕匚匸十卜卩厂厶又亻𠆢丷刂⺈㔾讠𢎘𠂉〢𠂊𠂇㐅乂𠘧𠘨⺆丂𠀁龴𠂆𠄎㇋㇌⺀𠂈丩⺊丄丅丆𠃎𠄟𠄠𠄐𠃏乁𠙴七𠤎九',
      '03畫':
        '口囗土士夂夊夕大女子宀寸小尢尸屮山巛工己巾干幺广廴廾弋弓彐彡彳川⺌𡭔䶹彑忄扌氵犭⺾阝⻖⻏⺕⻌丬纟飞饣䒑卄𭕄𠀆𠔼𠫓𣥂𡳾𠂎乇𫝀㐄𡕒乡𠚤习亼三丈也于上下兀丌卂亇万刄',
      '04畫':
        '心戈戶手支攴文斗斤方无日曰月木欠止歹殳毋比毛氏气水火爪父爻爿片牙牛犬⺗攵朩毌灬爫爫牜𠂒尣⺩礻龰罓冈㓁⺼艹辶⻍耂⺳𦉪𠔿⺝艹卝龷廿丰丯𧘇𣎳𥘅龶⺜厃𠃜肀旡冘夬兂龵𦉫𠬝㸦𤓰𠃛夨仌王五六卅不丐及丑丹刅井开𠬛尺巨巴𣎴冃冄𠬞𠬜丮巿𠃚',
      '05畫':
        '玄玉瓜瓦甘生用田疋疒癶白皮皿目矛矢石示禸禾穴立𤴓𤴔罒𦉰歺母氺衤⺬钅𢆉𦍍业𠀎㠯𠕁𡗗圥𠮠犮𢎨𦘒⺻龸𣦵丱𤕫𥝌𦫳𣎵屵𫇦四卌夗㐱乍乎冉册史央戉戊冋本民永北',
      '06畫':
        '竹米糸缶网羊羽老而耒耳聿肉臣自至臼舌舛舟艮色艸虍虫血行衣襾𥫗糹𦍌⺶西覀齐冎龹𠂤𧰨乑𢦏产巩𦈢𠂭𠂢𠦃䇂㐆甶囟幵厽𠃨𠬪朿亙兆州年曲曳朱关',
      '07畫':
        '見角言谷豆豕豸貝赤走足身車辛辰辵邑酉釆里訁𧮫𧾷𦥑镸⺸𦍋夋𦉶㒳㐬𠦒𦣞𦣝丣戼𠃬㕯㫃囧𦣻囱囪㡀严𠦑㳄我巠甹皀夆亜来',
      '08畫': '金長門阜隶隹雨青非釒⻗靑飠叀亝𣏟㣇甾幷𨸏𣶒罙忝匋奄東疌黾靣',
      '09畫': '面革韋韭音頁風飛食首香𩙿叚壴复亲枼昜亯𡿺𠧪県𥄉㲋𢑚㢴𢏚咢奐禺南',
      其他: {
        '10畫': '馬骨高髟鬥鬯鬲鬼𤇾丵𠂹𣆪𩠐𡸁隺尃𧴪𥁕臽䍃芻皋',
        '11畫': '魚鳥鹵鹿麥麻㒼𦰩𠦬𠁁桼啇袞翏啚悤粛',
        '12畫': '黃黍黑黹菐巽粦尌朁尞厤肅𤔔𠥓',
        '13畫': '黽鼎鼓鼠𦥯𦝠𢊁廌𠌶亶嗇睘',
        '14畫': '鼻齊𨛜㥯熏',
        '15畫': '齒嘼廛巤',
        '16畫': '龍龜',
        '17畫': '龠𩫖毚韱'
      }
    }
  },
  blockClasses: {
    '-2': 'SUP',
    '-1': 'CMP',
    0: 'OTH',
    1: 'BSC',
    2: 'ExA',
    3: 'ExB',
    4: 'ExC',
    5: 'ExD',
    6: 'ExE',
    7: 'ExF',
    8: 'ExG',
    9: 'ExH',
    10: 'ExI'
  },
  isMobile() {
    if (navigator.userAgentData) {
      return navigator.userAgentData.mobile;
    }
    const userAgent = navigator.userAgent;
    const mobileKeywords = [
      'iPhone',
      'Android',
      'Windows Phone',
      'BlackBerry',
      'Opera Mini',
      'Mobile'
    ];
    return mobileKeywords.some(keyword => userAgent.includes(keyword));
  },
  initKeyboard(kbType) {
    let html = '<table class="' + kbType.className + '">';
    if (!kbType.vertical) {
      html += '<tr>';
      for (let g in kbType.groups) html += '<th>' + g + '</th>';
      html += '</tr><tr>';
    }
    for (let g in kbType.groups) {
      if (kbType.vertical) html += '<tr><th>' + g + '</th>';
      html += '<td>';
      if (typeof kbType.groups[g] == 'string') {
        for (let i = 0; i < kbType.groups[g].length; i++) {
          const w = kbType.groups[g].charPointAt(i);
          if (w.length > 1) i++;
          if (w == ',') {
            html += '<br>';
            continue;
          }
          const z = Seeker.parts[w];
          if (z)
            html +=
              '<button class="han K' +
              z +
              '" data-char="' +
              w +
              '">' +
              w +
              '</button>';
        }
      } else {
        for (let gg in kbType.groups[g]) {
          html += '<span class="sub"><span class="tag">' + gg + '</span>';
          for (let i = 0; i < kbType.groups[g][gg].length; i++) {
            const w = kbType.groups[g][gg].charPointAt(i);
            if (w.length > 1) i++;
            if (w == ',') {
              html += '<br>';
              continue;
            }
            const z = Seeker.parts[w];
            if (z)
              html +=
                '<button class="han K' +
                z +
                '" data-char="' +
                w +
                '">' +
                w +
                '</button>';
          }
          html += '</span> ';
        }
      }
      html += '</td>';
      if (kbType.vertical) html += '</tr>';
    }
    html += '</table>';
    $('#keypad').html(html);
  },
  setClipboard(s) {
    s = decodeURI(s);
    if (window.clipboardData) {
      window.clipboardData.clearData();
      window.clipboardData.setData('Text', s);
    } else {
      const t = document.createElement('textarea');
      t.textContent = s;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      document.body.removeChild(t);
      pop(s);
    }
  },
  getPos() {
    $_.focus();
    return $_.selectionStart;
  },
  setPos(n) {
    $_.setSelectionRange(n, n);
  },
  getSel() {
    return $_.value.substring($_.selectionStart, $_.selectionEnd);
  },
  delSel() {
    const m = $_.selectionStart;
    const n = $_.selectionEnd;
    if (m != n) {
      $_.value = $_.value.substring(0, m) + $_.value.substring(n);
      $_.setSelectionRange(m, m);
    }
  },
  key(w) {
    UI.delSel();
    const n = UI.getPos();
    const s = $_.value;
    $_.value = s.slice(0, n) + w + s.slice(n);
    UI.setPos(w.length > 1 ? n + 2 : n + 1);
    UI.go();
  },
  clearFind() {
    $_.value = '';
    $_.focus();
    UI.go(true);
  },
  decompose() {
    const n = UI.getPos();
    if (n > 0) {
      const s = $_.value;
      let m = n - 1;
      let w = s.charPointAt(m);
      if (w == '\\') {
        m--;
        w = s.charPointAt(m);
      }
      if (w.length > 1) m--;

      const d = _('subdivide').selected;
      const t = Seeker.exhaust(w, d, false);
      if (t.length) {
        $_.value = s.slice(0, m) + t + s.slice(n).replace(/\\/g, '');
        UI.setPos(m + t.length);
        UI.go();
      }
    }
  },
  go(force) {
    if (UI.ime) return;
    $_.focus();
    //if (!force && !_('onthefly').checked) return;
    UI.hidePop(true);
    Seeker.groups = null;
    $('#groups').html('').hide();
    Seeker.result = null;
    let s = (UI.getSel() || $_.value).replace(/\s/g, '');
    Seeker.stopMatch();
    if (!s) {
      $('#counter').text('');
      $('[id^="output"]').text('');
    } else {
      const divide = _('subdivide').selected;
      const variant = _('variant').selected;
      if (s.charAt(0) == ':') {
        $('[id^="output"]').html(Seeker.getTree(s.slice(1), divide));
      } else {
        let ignore = null;
        const tmp = s.split('-');
        if (tmp.length == 2) {
          s = tmp[0];
          ignore = tmp[1];
        }
        Seeker.getMatch(s, ignore, variant, divide, force);
      }
    }
  },
  setMode(chk, key) {
    setTimeout(() => {
      localStorage.setItem(key, chk.selected ? '1' : '0');
      UI.go();
    }, 0);
  },
  updatePad() {
    setTimeout(() => {
      const showkeypad = !!+UI.getItem('showkeypad');
      UI.keypadMode = showkeypad;
      localStorage.setItem('keypad', UI.keypadMode ? '1' : '0');
      if (UI.keypadMode) {
        UI.initKeyboard(UI.strokeKeyboard);
        $('#keypad').show();
      } else {
        $('#keypad').hide();
      }
      $_.focus();
    }, 0);
  },
  replaceFind(s) {
    if (!UI.getSel()) $_.value = '';
    UI.key(s);
  },
  addShortcut(w, d) {
    if (w) {
      let ex = false;
      for (let i in UI.shortcuts) {
        if (UI.shortcuts[i] == w) {
          ex = true;
          if (d) UI.shortcuts.splice(i, 1);
        }
      }
      if (!ex) {
        if (UI.shortcuts.length >= 20) UI.shortcuts.splice(0, 1);
        UI.shortcuts.push(w);
      }
      localStorage.setItem('shortcuts', UI.shortcuts.join(' '));
    } else {
      const s = UI.getItem('shortcuts');
      if (s) UI.shortcuts = s.split(/ /);
    }
    let html = '快捷栏：';
    for (let i in UI.shortcuts)
      html += UI.createTag(UI.shortcuts[i], 'button', 'han', null, true);
    $('#scKey').html(html);
  },
  showPop(e) {
    const c = e.target;
    if (c.tagName.toUpperCase() != 'BUTTON' && c.tagName.toUpperCase() != 'A')
      return;
    function change() {
      const maxX = document.body.scrollWidth - 70;
      const rect = c.getBoundingClientRect();
      const x =
        rect.left < 150
          ? 10
          : Math.floor(rect.left < maxX ? rect.left - 140 : maxX - 140);
      $('#popview')
        .css({ left: x, top: Math.floor(window.scrollY + rect.bottom - 2) })
        .show();
      const chr = $(c).attr('data-char') || c.innerText;
      const u = chr.codePointAt(0);
      const k = Seeker.getCJKBlock(u);
      $('#codetag').text('U+' + u.toString(16).toUpperCase());
      $('#bigchar').text(chr).attr({ class: 'han', style: '' });
      if (Config.useImage[k])
        $('#bigchar')
          .addClass('img')
          .css({
            'background-image':
              'url(' + Config.glyphwiki + u.toString(16) + '.svg)'
          });
      UI.popTrigger = c;
      $('#menu_key').toggle(c.tagName.toUpperCase() == 'BUTTON');
      $('#menu_go')
        .toggle(c.tagName.toUpperCase() == 'A')
        .attr('href', c.href);
      if (c.tagName.toUpperCase() == 'A') $('#menu_go').attr('href', c.href);
      const inScKey = c.parentElement && c.parentElement.id == 'scKey'; // 因為動態呈現時，c.parentElement可能經常消失
      $('#menu_add').toggle(!inScKey);
      $('#menu_del').toggle(inScKey);
    }
    UI.popTimer = setTimeout(change, UI.popTrigger == null ? 0 : 100);
  },
  hidePop(e) {
    if (e !== true && e.target != UI.popTrigger) return;
    UI.popTimer = setTimeout(() => {
      $('#popview').hide();
      UI.popTrigger = null;
    }, 100);
  },
  setSkipChar(chr) {
    if ($_.value.indexOf('-') < 0) $_.value += '-';
    $_.value += chr;
    UI.go();
  },
  eventMoniter() {
    $_.addEventListener('keydown', e => {
      if (e.isComposing) return;
      if (e.code == 'Enter' || e.keyCode == 13) UI.go(true);
      if (e.code == 'Escape' || e.keyCode == 27) UI.clearFind();
    });

    $_.addEventListener('keyup', e => {
      if (e.isComposing) return;
      if (e.code == 'Backslash' || e.keyCode == 0x5c) UI.decompose();
    });

    $_.addEventListener('compositionstart', () => {
      UI.ime = true;
    });
    $_.addEventListener('compositionend', () => {
      setTimeout(() => {
        UI.ime = false;
        UI.go();
      }, 1);
    });

    $($_).on('input', () => {
      UI.go(false);
    });
    $('#buttClear').click(UI.clearFind);
    $('#buttDecompose').click(UI.decompose);
    $('#buttGo').click(() => {
      UI.go(true);
    });

    $('#popview').on('mouseenter', e => {
      clearTimeout(UI.popTimer);
      e.stopPropagation();
    });

    $('#popview').on('mouseleave', e => {
      e.stopPropagation();
      $('#popview').hide();
      UI.popTrigger = null;
    });

    // mouse in/out
    $('#keypad')
      .on('mouseover', 'button', UI.showPop)
      .on('mouseout', 'button', UI.hidePop);
    $('#scKey')
      .on('mouseover', 'button', UI.showPop)
      .on('mouseout', 'button', UI.hidePop);
    $('#groups')
      .on('mouseover', 'a', UI.showPop)
      .on('mouseout', 'a', UI.hidePop);
    $('[id^="output"]')
      .on('mouseover', 'a', UI.showPop)
      .on('mouseout', 'a', UI.hidePop);
    //_('output').addEventListener('click', function(e) { if (e.target.tagName == 'A') e.preventDefault() }, false);

    // click events
    $('#scKey, #keypad').on('click', 'button', e => {
      UI.key(e.target.innerText);
      e.preventDefault();
    });
    $('#groups').on('click', 'a.grp', function () {
      $(this).toggleClass('on');
      UI.showOutput();
    });
    $('[id^="output"]').on('click', 'a', e => {
      e.preventDefault();
    });

    $('[id^="output"]').on('mouseover', '> span .line', function (e) {
      $(this).attr('class', 'line hover');
      e.stopPropagation();
    });
    $('[id^="output"]').on('mouseout', '> span .line', () => {
      $(this).attr('class', 'line');
    });

    $('#menu_go').click(() => {
      UI.popTrigger.click();
    });
    $('#menu_key').click(() => {
      UI.key($(UI.popTrigger).data('char'));
    });
    $('#menu_copy').click(() => {
      UI.setClipboard($(UI.popTrigger).data('char'));
    });
    $('#menu_query').click(() => {
      UI.replaceFind($(UI.popTrigger).data('char'));
    });
    $('#menu_skip').click(() => {
      UI.setSkipChar($(UI.popTrigger).data('char'));
    });
    $('#menu_add').click(() => {
      UI.addShortcut($(UI.popTrigger).data('char'));
    });
    $('#menu_del').click(() => {
      UI.addShortcut($(UI.popTrigger).data('char'), true);
    });
  },
  createTag(c, tag, cls, extra, hideChar, running) {
    const code = c.codePointAt(0);
    const tagBody =
      Config.useImage[Seeker.getCJKBlock(code)] && !running
        ? ' img" data-char="' +
          c +
          '" style="background-image: url(' +
          Config.glyphwiki +
          code.toString(16) +
          '.svg)">' +
          (hideChar ? '&nbsp;' : c)
        : '" data-char="' + c + '">' + c;
    return `<${tag} ${extra || ''} class="${cls || ''}"${tagBody}</${tag}>`;
  },
  addCell(entry, running) {
    const block = Seeker.getCJKBlock(entry.unicode);
    const cls = UI.blockClasses[block];

    const url = Config.url
      .replace('$CHR$', entry.char)
      .replace('$ENC$', encodeURI(entry.char))
      .replace('$UCD$', entry.unicode.toString())
      .replace('$UCh$', entry.unicode.toString(16))
      .replace('$UCH$', entry.unicode.toString(16).toUpperCase());

    if (entry.text) {
      return '<span class="' + cls + '">' + entry.text + '</span>';
    } else {
      return UI.createTag(
        entry.char,
        'a',
        cls,
        'target="_blank" href="' + url + '"',
        false,
        running
      );
    }
  },
  setResult(founds, i, force) {
    Seeker.result = founds;
    const msg = force
      ? `找到 ${founds.length} 字 ${Math.floor((i * 100) / dt.length)}%`
      : `<span style="color:red">（基本区）</span>找到 ${founds.length} 字`;
    $('#counter').html(msg);
    UI.showOutput();
  },
  showOutput() {
    let sBSC = '',
      sA = '',
      sB = '',
      sC = '',
      sD = '',
      sE = '',
      sF = '',
      sG = '',
      sH = '',
      sI = '',
      sCMP = '',
      sSUP = '',
      sOTH = '',
      blk;
    for (let j in Seeker.result) Seeker.result[j].gflag = false;

    const glist = $('#groups a.on');
    $(glist.get().reverse()).each((i, gx) => {
      const g = $(gx).data('char');
      for (let j in Seeker.result) {
        if (Seeker.result[j].gflag) continue;
        for (let gi in Seeker.result[j].groups) {
          if (Seeker.result[j].groups[gi] == g) {
            Seeker.result[j].gflag = true;
            break;
          }
        }
      }
    });

    for (let j in Seeker.result) {
      if (Seeker.result[j].gflag) continue;
      blk = Seeker.getCJKBlock(Seeker.result[j].unicode);

      const willAddStr = UI.addCell(Seeker.result[j], Seeker.groups == null);
      if (blk === 1) sBSC += willAddStr;
      if (blk === 2) sA += willAddStr;
      if (blk === 3) sB += willAddStr;
      if (blk === 4) sC += willAddStr;
      if (blk === 5) sD += willAddStr;
      if (blk === 6) sE += willAddStr;
      if (blk === 7) sF += willAddStr;
      if (blk === 8) sG += willAddStr;
      if (blk === 9) sH += willAddStr;
      if (blk === 10) sI += willAddStr;
      if (blk === -1) sCMP += willAddStr;
      if (blk === -2) sSUP += willAddStr;
      if (blk === 0) sOTH += willAddStr;
    }
    $('#outputBSC').html(sBSC);
    $('#outputA').html(sA);
    $('#outputB').html(sB);
    $('#outputC').html(sC);
    $('#outputD').html(sD);
    $('#outputE').html(sE);
    $('#outputF').html(sF);
    $('#outputG').html(sG);
    $('#outputH').html(sH);
    $('#outputI').html(sI);
    $('#outputCMP').html(sCMP);
    $('#outputSUP').html(sSUP);
    $('#outputOTH').html(sOTH);
    $('[id^="output"] a').on('click', function () {
      UI.setClipboard($(this).data('char'));
    });
  },
  finished(founds) {
    Seeker.result = founds;
    const groups = {};
    for (let j in founds) {
      if (founds[j].groups) {
        //if (!founds[j].groups.length) continue;
        for (let gi in founds[j].groups) {
          const g = founds[j].groups[gi];
          if (!groups[g]) groups[g] = 0;
          groups[g]++;
        }
      }
    }
    Seeker.groups = [];
    for (let g in groups)
      if (groups[g] >= 3)
        Seeker.groups.push({
          char: g,
          unicode: g.codePointAt(0),
          count: groups[g]
        });
    Seeker.groups.sort((a, b) => {
      return b.count - a.count;
    });
    UI.showOutput();

    let str = '',
      g;
    for (let i in Seeker.groups) {
      g = Seeker.groups[i];
      str += UI.createTag(
        g.char,
        'a',
        'grp',
        'href="javascript:void(0)" data-count="' + g.count + '"',
        true
      );
    }
    if (str != '') $('#groups').html(str).slideDown();
  },
  getItem(k, defaultValue = '0') {
    const v = localStorage.getItem(k);
    return v !== null ? v : defaultValue;
  },
  init() {
    $(document).ready(() => {
      $('[id^="output"]').each(function () {
        if ($(this).text().trim() === '') {
          $(this).hide();
        }
      });

      $('[id^="output"]').each(function () {
        const observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            const target = $(mutation.target);
            if (target.text().trim() !== '') {
              target.show();
            } else {
              target.hide();
            }
          });
        });

        const config = { childList: true, subtree: true, characterData: true };
        observer.observe(this, config);
      });
    });

    $('#version').html(Seeker.getVersion());

    const validCharacterCount = dt.filter(entry => !entry.endsWith('╳')).length;
    $('#datasize').text(validCharacterCount);

    // Status
    $('#variant').prop('selected', UI.getItem('variant') == '1');
    $('#subdivide').prop('selected', UI.getItem('subdivide') == '1');
    $('#showkeypad').prop('selected', UI.getItem('showkeypad') == '1');
    UI.addShortcut();

    // Events
    UI.eventMoniter();
    UI.updatePad();

    document.querySelector('.BSC').addEventListener('click', () => UI.key('#'));
    document.querySelector('.CMP').addEventListener('click', () => UI.key('$'));
    document.querySelector('.SUP').addEventListener('click', () => UI.key('%'));
    document.querySelector('.OTH').addEventListener('click', () => UI.key('&'));

    const extKeyBtns = document.querySelectorAll('[class^="Ex"]');
    for (let extKeyBtn of extKeyBtns) {
      extKeyBtn.addEventListener('click', () => UI.key(extKeyBtn.className[2]));
    }

    _('variant').addEventListener('click', () =>
      UI.setMode(_('variant'), 'variant')
    );
    _('subdivide').addEventListener('click', () =>
      UI.setMode(_('subdivide'), 'subdivide')
    );
    _('showkeypad').addEventListener('click', () => {
      UI.setMode(_('showkeypad'), 'showkeypad');
      UI.updatePad();
    });
  }
};

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (o, f) {
    const l = this.length;
    if (f == null) f = 0;
    if (f < 0) f = Math.max(0, l + f);
    for (let i = f; i < l; i++) {
      if (this[i] === o) return i;
    }
    return -1;
  };
}

if (!String.prototype.codePointAt) {
  String.prototype.codePointAt = function (i) {
    const c = this.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff)
      return (
        (((c & 0x03ff) << 10) | (this.charCodeAt(i + 1) & 0x03ff)) + 0x10000
      );
    return c;
  };
}

String.prototype.charPointAt = function (i) {
  const c = this.charCodeAt(i);
  if (c >= 0xd800 && c <= 0xdbff) return this.charAt(i) + this.charAt(i + 1);
  if (c >= 0xdc00 && c <= 0xdfff) return this.charAt(i - 1) + this.charAt(i);
  return this.charAt(i);
};

window.addEventListener('load', UI.init);
