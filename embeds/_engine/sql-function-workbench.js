/* sql-function-workbench 엔진 — SQL 문자열·날짜 함수를 골라 결과를 본다.
   SUBSTRING은 pos(1-기반)/len을 바꿔 결과를 보고, 같은 자리를 ABAP substring(off=0-기반)으로 쓰면 어떻게 다른지 비교한다.
   DATS_ADD_DAYS는 더할 일수를 바꾼다. 골격 계약: .sfw-fn(세그) · #sfwCode · #sfwInputs · #sfwResult · #sfwCompare · #sfwNote.
   config: window.SFW_CFG = { carrid, connid, cityfrom, fldate, sysdate }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SFW_CFG || { carrid: 'LH', connid: '0400', cityfrom: 'Frankfurt', fldate: '20260626', sysdate: '20260627' };
  var fn = 'concat';
  var subPos = 1, subLen = 2, addDays = 7;

  var fnEl = document.querySelector('.sfw-fn');
  var codeEl = document.getElementById('sfwCode');
  var inEl = document.getElementById('sfwInputs');
  var resEl = document.getElementById('sfwResult');
  var cmpEl = document.getElementById('sfwCompare');
  var noteEl = document.getElementById('sfwNote');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function fnTag(code) { return h(code).replace(/\b(CONCAT|SUBSTRING|UPPER|LOWER|LENGTH|DATS_ADD_DAYS|DATS_DAYS_BETWEEN)\b/g, function (m) { return '<span class="fn">' + m + '</span>'; }).replace(/AS\s+\w+/g, function (m) { return '<span class="as">' + m + '</span>'; }); }

  // YYYYMMDD <-> Date
  function toDate(s) { return new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)); }
  function fromDate(d) { var y = d.getFullYear(), m = d.getMonth() + 1, dd = d.getDate(); return '' + y + (m < 10 ? '0' : '') + m + (dd < 10 ? '0' : '') + dd; }
  function addD(s, n) { var d = toDate(s); d.setDate(d.getDate() + n); return fromDate(d); }
  function diffD(a, b) { return Math.round((toDate(b) - toDate(a)) / 86400000); }

  var DEFS = {
    concat: {
      label: 'CONCAT', input: 'none',
      code: function () { return "SELECT carrid, connid,\n       CONCAT( carrid, connid ) AS route\n  FROM spfli ..."; },
      result: function () { return { ok: true, lbl: 'route', val: CFG.carrid + CFG.connid }; },
      note: '두 문자열을 잇습니다. 인자 중 하나라도 <b>null이면 결과가 null</b>이 될 수 있어, outer join과 함께면 <code>COALESCE</code>와 같이 생각합니다.'
    },
    substring: {
      label: 'SUBSTRING', input: 'sub',
      code: function () { return "SELECT connid,\n       SUBSTRING( connid, " + subPos + ", " + subLen + " ) AS part\n  FROM spfli ..."; },
      result: function () {
        var L = CFG.connid.length;
        if (subPos < 1 || subLen < 0 || subPos - 1 + subLen > L) return { ok: false, lbl: 'part', val: "🚫 범위 밖 — SQL pos는 1부터 " + L + "까지" };
        var part = CFG.connid.slice(subPos - 1, subPos - 1 + subLen);
        return { ok: true, lbl: 'part', val: "'" + part + "'", hl: true };
      },
      compare: function () {
        return [
          { who: 'SQL (1-기반)', code: 'SUBSTRING( connid, ' + subPos + ', ' + subLen + ' )' },
          { who: 'ABAP (0-기반)', code: 'substring( val = connid off = ' + (subPos - 1) + ' len = ' + subLen + ' )' }
        ];
      },
      note: '⚠️ <b>SQL <code>SUBSTRING</code>의 시작 위치는 1부터</b>입니다. 지난 챕터 ABAP <code>substring( off = 0 … )</code>는 0부터예요 — 같은 글자를 집으려면 <b>SQL pos = ABAP off + 1</b>.'
    },
    upper: {
      label: 'UPPER', input: 'none',
      code: function () { return "SELECT UPPER( cityfrom ) AS city_up\n  FROM spfli ..."; },
      result: function () { return { ok: true, lbl: 'city_up', val: CFG.cityfrom.toUpperCase() }; },
      note: '도시명을 대문자로. <code>LOWER</code>는 반대로 소문자로 만듭니다.'
    },
    lower: {
      label: 'LOWER', input: 'none',
      code: function () { return "SELECT LOWER( cityfrom ) AS city_low\n  FROM spfli ..."; },
      result: function () { return { ok: true, lbl: 'city_low', val: CFG.cityfrom.toLowerCase() }; },
      note: '도시명을 소문자로. 표시용 다국어 문구는 SQL이 아니라 Text Symbol/메시지 설계로 다루는 편이 낫습니다.'
    },
    length: {
      label: 'LENGTH', input: 'none',
      code: function () { return "SELECT LENGTH( carrid ) AS len\n  FROM spfli ..."; },
      result: function () { return { ok: true, lbl: 'len', val: String(CFG.carrid.length) }; },
      note: '문자열 길이를 정수로 돌려줍니다(예: <code>' + CFG.carrid + '</code> → ' + CFG.carrid.length + ').'
    },
    add: {
      label: 'DATS_ADD_DAYS', input: 'days',
      code: function () { return "SELECT fldate,\n       DATS_ADD_DAYS( fldate, " + addDays + " ) AS due\n  FROM sflight ..."; },
      result: function () { return { ok: true, lbl: 'due (fldate=' + CFG.fldate + ')', val: addD(CFG.fldate, addDays) }; },
      note: '날짜에 일수를 더합니다. ABAP SQL에서는 <b>인자 두 개</b>(<code>date, days</code>)로 씁니다. <code>fldate</code>는 <code>YYYYMMDD</code> 유효 날짜여야 합니다.'
    },
    between: {
      label: 'DATS_DAYS_BETWEEN', input: 'none',
      code: function () { return "SELECT fldate,\n       DATS_DAYS_BETWEEN( @sy-datum, fldate ) AS gap\n  FROM sflight ..."; },
      result: function () { return { ok: true, lbl: 'gap (sy-datum=' + CFG.sysdate + ' → fldate=' + CFG.fldate + ')', val: String(diffD(CFG.sysdate, CFG.fldate)) + '일' }; },
      note: '두 날짜의 차이를 정수(일)로 돌려줍니다. <code>@sy-datum</code>은 ABAP 시스템 날짜를 host variable로 넘긴 것입니다.'
    }
  };

  function renderSeg() {
    var items = [
      { v: 'concat', l: 'CONCAT' }, { v: 'substring', l: 'SUBSTRING' }, { v: 'upper', l: 'UPPER' },
      { v: 'lower', l: 'LOWER' }, { v: 'length', l: 'LENGTH' }, { v: 'add', l: 'DATS_ADD_DAYS' }, { v: 'between', l: 'DATS_DAYS_BETWEEN' }
    ];
    fnEl.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === fn ? 'true' : 'false') + '">' + h(it.l) + '</button>';
    }).join('');
  }

  function renderInputs(def) {
    if (def.input === 'sub') {
      inEl.innerHTML =
        '<label>pos (1부터)<input data-k="pos" type="number" min="1" value="' + subPos + '"></label>' +
        '<label>len<input data-k="len" type="number" min="0" value="' + subLen + '"></label>';
    } else if (def.input === 'days') {
      inEl.innerHTML = '<label>days<input data-k="days" type="number" value="' + addDays + '"></label>';
    } else { inEl.innerHTML = ''; }
  }

  function render() {
    renderSeg();
    var def = DEFS[fn];
    codeEl.innerHTML = fnTag(def.code());
    renderInputs(def);
    var r = def.result();
    resEl.className = r.ok ? '' : 'bad';
    resEl.innerHTML = '<span class="lbl">' + h(r.lbl) + '</span><span class="val">' + (r.hl ? '<span class="hl">' + h(r.val) + '</span>' : h(r.val)) + '</span>';
    cmpEl.innerHTML = def.compare ? def.compare().map(function (c) {
      var cls = c.who.indexOf('SQL') >= 0 ? 'sql' : 'abap';
      return '<div class="sfw-cmp-row ' + cls + '"><div class="who">' + h(c.who) + '</div><div class="code">' + h(c.code) + '</div></div>';
    }).join('') : '';
    noteEl.innerHTML = def.note;
  }

  fnEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; fn = b.getAttribute('data-v'); render(); });
  inEl.addEventListener('input', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-k'); if (!k) return;
    var v = +e.target.value; if (isNaN(v)) v = 0;
    if (k === 'pos') subPos = v; else if (k === 'len') subLen = v; else if (k === 'days') addDays = v;
    // 입력 중엔 세그/입력 재생성 없이 결과만 갱신
    var def = DEFS[fn];
    codeEl.innerHTML = fnTag(def.code());
    var r = def.result();
    resEl.className = r.ok ? '' : 'bad';
    resEl.innerHTML = '<span class="lbl">' + h(r.lbl) + '</span><span class="val">' + (r.hl ? '<span class="hl">' + h(r.val) + '</span>' : h(r.val)) + '</span>';
    cmpEl.innerHTML = def.compare ? def.compare().map(function (c) {
      var cls = c.who.indexOf('SQL') >= 0 ? 'sql' : 'abap';
      return '<div class="sfw-cmp-row ' + cls + '"><div class="who">' + h(c.who) + '</div><div class="code">' + h(c.code) + '</div></div>';
    }).join('') : '';
  });

  render();
})();
