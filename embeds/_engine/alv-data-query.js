/* alv-data-query 엔진 — ALV 출력용 lt_booking을 SELECT INTO TABLE로 채우고 sy-subrc/sy-dbcnt/행수를 본다.
   C001=결과 있음, C999=0건(sy-subrc=4, 빈 표가 정상), 조건 없이 조회=전체(많은 데이터 → 화면 느려짐 경고).
   골격 계약: .adq-scen · #adqResult · #adqGrid · #adqMsg.
   config: window.ADQ_CFG = { cols:[{key,label}], rows:[{concert_id,...}], scenarios:[{key,label,conc}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.ADQ_CFG || { cols: [], rows: [], scenarios: [] };
  var sel = null;   // 선택된 시나리오 key

  var scenEl = document.querySelector('.adq-scen');
  var resultEl = document.getElementById('adqResult');
  var gridEl = document.getElementById('adqGrid');
  var msgEl = document.getElementById('adqMsg');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function cur() { return CFG.scenarios.filter(function (s) { return s.key === sel; })[0]; }
  function rowsFor(sc) { return sc.conc === '*' ? CFG.rows.slice() : CFG.rows.filter(function (r) { return r.concert_id === sc.conc; }); }

  function renderScen() {
    scenEl.innerHTML = CFG.scenarios.map(function (s) {
      return '<button type="button" data-k="' + esc(s.key) + '" aria-pressed="' + (s.key === sel ? 'true' : 'false') + '">' + esc(s.label) + '<span class="fc">' + (s.conc === '*' ? 'WHERE 없음' : "WHERE concert_id = '" + esc(s.conc) + "'") + '</span></button>';
    }).join('');
  }
  function renderResult() {
    if (!sel) { resultEl.innerHTML = ''; gridEl.innerHTML = ''; msgEl.className = ''; msgEl.innerHTML = '시나리오를 골라 <code>SELECT</code>를 실행하세요.'; return; }
    var sc = cur(), rows = rowsFor(sc), n = rows.length, subrc = n ? 0 : 4;
    resultEl.innerHTML =
      '<div class="adq-box ' + (subrc ? 'zero' : '') + '"><div class="k">sy-subrc</div><div class="v">' + subrc + '</div></div>' +
      '<div class="adq-box ' + (n ? '' : 'zero') + '"><div class="k">sy-dbcnt</div><div class="v">' + n + '</div></div>' +
      '<div class="adq-box ' + (n ? '' : 'zero') + '"><div class="k">lt_booking 행</div><div class="v">' + n + '</div></div>';
    // grid
    if (!n) gridEl.innerHTML = '<div class="adq-gtt">lt_booking (출력용)</div><div class="adq-empty">0건 — 빈 internal table</div>';
    else gridEl.innerHTML = '<div class="adq-gtt">lt_booking (' + n + '행)</div><table class="adq-tbl"><thead><tr>' +
      CFG.cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + CFG.cols.map(function (c) { return '<td>' + esc(r[c.key]) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
    // message
    if (!n) { msgEl.className = 's'; msgEl.innerHTML = '📭 0건 · <code>sy-subrc = 4</code> — <code>MESSAGE S</code>로 안내. <b>빈 표가 정상</b>입니다(없는 공연). 기술 오류 아님.'; }
    else if (sc.conc === '*') { msgEl.className = 'warn'; msgEl.innerHTML = '⚠ 전체 ' + n + '건 — <b>조건 없이 조회</b>하면 데이터가 한꺼번에 들어와 화면이 느려질 수 있습니다. 보통 <code>WHERE</code>로 좁힙니다.'; }
    else { msgEl.className = 'ok'; msgEl.innerHTML = '✅ ' + n + '건 조회 · <code>sy-subrc = 0</code> — 이 데이터를 ALV가 행·열로 그립니다.'; }
  }
  function render() { renderScen(); renderResult(); }

  scenEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sel = b.getAttribute('data-k'); render(); });

  render();
})();
