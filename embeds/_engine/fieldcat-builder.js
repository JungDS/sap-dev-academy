/* fieldcat-builder 엔진 — LVC_T_FCAT(field catalog)의 각 행 속성을 바꾸면 화면이 어떻게 달라지는지 보여 준다.
   field catalog는 DB 구조가 아니라 "ALV에게 주는 화면 표시 지시서"다. no_out(숨김)·do_sum(합계)·just(정렬)·key(고정강조)를 켜면
   카탈로그 행이 먼저 바뀌고, 그 결과가 표 화면에 반영된다. 문자 컬럼 합계는 의미가 없고, fieldname은 내부 필드명이라야 한다.
   골격 계약: .fcb-act(버튼) · #fcbCatalog · #fcbPreview · #fcbStatus.
   config: window.FCB_CFG = { cols:[{f,numeric}], rows }. 높이: _autoheight.js. */
(function () {
  var CFG = window.FCB_CFG || { cols: [], rows: [] };
  // 각 컬럼의 fcat 속성
  var attr = {}; CFG.cols.forEach(function (c) { attr[c.f] = { no_out: false, do_sum: false, just: '', key: false }; });
  var lastMsg = { cls: '', html: '' };

  var actEl = document.querySelector('.fcb-act');
  var catEl = document.getElementById('fcbCatalog');
  var prevEl = document.getElementById('fcbPreview');
  var statusEl = document.getElementById('fcbStatus');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function colDef(f) { for (var i = 0; i < CFG.cols.length; i++) if (CFG.cols[i].f === f) return CFG.cols[i]; }

  function renderActs() {
    var btns = [
      { k: 'MANDT|no_out', l: 'MANDT 숨김' }, { k: 'SEATS|do_sum', l: 'SEATS 합계' },
      { k: 'STATUS|just', l: 'STATUS 가운데' }, { k: 'PERF_NO|key', l: 'PERF_NO 키' },
      { k: 'charsum', l: '문자 컬럼 합계 시도', cls: 'warn' }, { k: 'typo', l: 'fieldname 오타', cls: 'bad' }
    ];
    actEl.innerHTML = btns.map(function (b) {
      var on = false;
      if (b.k.indexOf('|') >= 0) { var p = b.k.split('|'); on = p[1] === 'just' ? attr[p[0]].just === 'C' : attr[p[0]][p[1]]; }
      return '<button type="button" data-k="' + b.k + '" class="' + (b.cls || '') + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + h(b.l) + '</button>';
    }).join('') + '<button type="button" class="reset" data-k="reset">리셋</button>';
  }

  function renderCatalog() {
    var head = '<tr><th>fieldname</th><th>no_out</th><th>do_sum</th><th>just</th><th>key</th></tr>';
    var body = CFG.cols.map(function (c) {
      var a = attr[c.f];
      function cell(v, txt) { return v ? '<td class="set">' + (txt || 'X') + '</td>' : '<td></td>'; }
      return '<tr><td class="fn">' + h(c.f) + '</td>' +
        cell(a.no_out) + cell(a.do_sum) + (a.just ? '<td class="set">' + a.just + '</td>' : '<td></td>') + cell(a.key) + '</tr>';
    }).join('');
    catEl.innerHTML = '<table class="fcb-cat"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }

  function visibleCols() { return CFG.cols.filter(function (c) { return !attr[c.f].no_out; }); }

  function renderPreview() {
    var cols = visibleCols();
    var head = '<tr>' + cols.map(function (c) {
      return '<th class="' + (attr[c.f].key ? 'key' : '') + '">' + h(c.f) + '</th>';
    }).join('') + '</tr>';
    var body = CFG.rows.map(function (r) {
      return '<tr>' + cols.map(function (c) {
        var a = attr[c.f]; var cls = (a.just ? 'al-' + a.just : '') + (a.key ? ' key' : '');
        return '<td class="' + cls.trim() + '">' + h(r[c.f]) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    // 합계 행: do_sum 켜진 숫자 컬럼
    var sumCols = cols.filter(function (c) { return attr[c.f].do_sum && colDef(c.f).numeric; });
    var sumRow = '';
    if (sumCols.length) {
      sumRow = '<tr class="sum">' + cols.map(function (c) {
        if (attr[c.f].do_sum && colDef(c.f).numeric) {
          var tot = CFG.rows.reduce(function (s, r) { return s + (+r[c.f] || 0); }, 0);
          return '<td class="' + (attr[c.f].just ? 'al-' + attr[c.f].just : '') + '">Σ ' + tot + '</td>';
        }
        return '<td></td>';
      }).join('') + '</tr>';
    }
    prevEl.innerHTML = '<table class="fcb-prev"><thead>' + head + '</thead><tbody>' + body + sumRow + '</tbody></table>';
  }

  function renderStatus() {
    if (lastMsg.html) { statusEl.className = lastMsg.cls; statusEl.innerHTML = lastMsg.html; return; }
    var on = CFG.cols.filter(function (c) { var a = attr[c.f]; return a.no_out || a.do_sum || a.just || a.key; });
    if (!on.length) { statusEl.className = ''; statusEl.innerHTML = '버튼을 눌러 field catalog 행 속성을 바꿔 보세요. <b>카탈로그가 먼저 바뀌고</b>, 그 지시대로 화면이 구성됩니다.'; return; }
    statusEl.className = 'ok';
    statusEl.innerHTML = '✅ field catalog 변경 반영 — <code>lt_fcat</code>를 바꿨을 뿐 <b>DB 테이블 구조·데이터는 그대로</b>입니다. <code>no_out</code>으로 숨겨도 내부 테이블엔 값이 남아 있어요.';
  }

  function render() { renderActs(); renderCatalog(); renderPreview(); renderStatus(); }

  actEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = b.getAttribute('data-k');
    lastMsg = { cls: '', html: '' };
    if (k === 'reset') { CFG.cols.forEach(function (c) { attr[c.f] = { no_out: false, do_sum: false, just: '', key: false }; }); }
    else if (k === 'charsum') { attr['STATUS'].do_sum = !attr['STATUS'].do_sum; lastMsg = { cls: 'warn', html: '⚠️ 카탈로그엔 <code>STATUS</code>의 <code>do_sum</code>이 켜졌지만, STATUS는 <b>숫자 컬럼이 아니라</b> 화면엔 합계(Σ)가 안 나옵니다. <b><code>do_sum</code>은 숫자 컬럼에만.</b>' }; }
    else if (k === 'typo') { lastMsg = { cls: 'bad', html: '🚫 <code>fieldname</code>이 output table component와 안 맞습니다(예: <code>SEAT</code> ≠ <code>SEATS</code>). DDIC 설명·화면 제목이 아니라 <b>내부 필드명</b>이라야 적용됩니다.' }; }
    else if (k.indexOf('|') >= 0) {
      var p = k.split('|'), a = attr[p[0]];
      if (p[1] === 'just') a.just = a.just === 'C' ? '' : 'C';
      else a[p[1]] = !a[p[1]];
    }
    render();
  });

  render();
})();
