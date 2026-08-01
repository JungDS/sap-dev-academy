/* fae-safety-sim 엔진 — FOR ALL ENTRIES의 빈 기준 테이블 함정을 시뮬레이션.
   기준 목록(driver 내부 테이블) × 안전장치(IS NOT INITIAL) 조합으로 실행 → 제한 조회 / 빈 목록 보호 / 전체 조회 위험.
   골격 계약: .fae-keys(기준목록 버튼) · [data-safety] · #faeList · [data-run] · #faeCode · #faeStatus · #faeBody.
   config: window.FAE_CFG = { rows:[..], cols:[{key,label}], keySets:[{label,ids:[..]}],
            keyField, driver, into, table, selFields, quote, keyNoun, rowNoun, unit }.
   높이: _autoheight.js. */
(function () {
  var CFG = window.FAE_CFG || { rows: [], keySets: [], cols: [] };
  var ROWS = CFG.rows || [];
  var KEY = CFG.keyField;                    // 기준 목록과 맞출 필드명
  var DRV = CFG.driver || 'lt_key';          // 기준 내부 테이블 이름
  var INTO = CFG.into || 'lt_data';          // 결과 내부 테이블 이름
  var TBL = CFG.table || 'ztable';           // 조회 대상 DB 테이블
  var SEL = CFG.selFields || '*';            // SELECT 필드 목록
  var KEYN = CFG.keyNoun || '키';
  var ROWN = CFG.rowNoun || '행';
  var UNIT = CFG.unit || '행';
  var setIdx = 0;          // keySets 인덱스(기준 목록)
  var safety = true;
  var lastRun = null;      // {mode, rows}

  var keysEl = document.querySelector('.fae-keys');
  var safetyBtn = document.querySelector('[data-safety]');
  var listEl = document.getElementById('faeList');
  var runBtn = document.querySelector('[data-run]');
  var codeEl = document.getElementById('faeCode');
  var statusEl = document.getElementById('faeStatus');
  var bodyEl = document.getElementById('faeBody');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function ids() { return CFG.keySets[setIdx].ids; }
  function distinctIds() { var s = {}, o = []; ids().forEach(function (d) { if (!(d in s)) { s[d] = 1; o.push(d); } }); return o; }
  function disp(v) { return CFG.quote ? "'" + v + "'" : String(v); }

  function renderKeyBtns() {
    keysEl.innerHTML = CFG.keySets.map(function (s, i) {
      return '<button class="fae-btn" type="button" data-i="' + i + '" aria-pressed="' + (i === setIdx ? 'true' : 'false') + '">' + esc(s.label) + '</button>';
    }).join('');
  }
  function renderList() {
    var v = ids();
    listEl.innerHTML = DRV + ' = ' + (v.length
      ? '[ ' + esc(v.map(disp).join(', ')) + ' ]'
      : '<span class="empty">[ ] (빈 테이블)</span>');
  }
  function renderCode() {
    var guardOn = safety;
    var lines = [];
    if (guardOn) lines.push('<span class="gd">IF ' + DRV + ' IS NOT INITIAL.</span>');
    var ind = guardOn ? '  ' : '';
    lines.push(ind + '<span class="kw">SELECT</span> ' + SEL);
    lines.push(ind + '  <span class="kw">FROM</span> ' + TBL);
    lines.push(ind + '  <span class="kw">INTO CORRESPONDING FIELDS OF TABLE</span> ' + INTO);
    lines.push(ind + '  <span class="kw">FOR ALL ENTRIES IN</span> ' + DRV);
    lines.push(ind + '  <span class="kw">WHERE</span> ' + KEY + ' = ' + DRV + '-' + KEY + '.');
    if (guardOn) lines.push('<span class="gd">ENDIF.</span>');
    else lines.push('<span class="dim">" ⚠️ IS NOT INITIAL 보호 없음</span>');
    codeEl.innerHTML = lines.join('\n');
  }

  function run() {
    var empty = ids().length === 0;
    if (empty && safety) {
      lastRun = { mode: 'safe', rows: [] };
      statusEl.className = 'fae-status safe';
      statusEl.innerHTML = '🛡️ <b>' + DRV + '</b>가 비어 <b>IS NOT INITIAL</b>이 막았습니다 → SELECT 실행 안 함. (sy-dbcnt는 갱신되지 않으니 이전 값에 의존 금지)';
      bodyEl.innerHTML = '<tr><td colspan="' + CFG.cols.length + '" class="fae-empty">SELECT 실행 안 함 — ' + INTO + ' 변화 없음.</td></tr>';
      return;
    }
    if (empty && !safety) {
      lastRun = { mode: 'danger', rows: ROWS.slice() };
      statusEl.className = 'fae-status danger';
      statusEl.innerHTML = '⚠️ <b>위험!</b> 빈 ' + DRV + '라 WHERE가 통째로 무시됨 → <b>전체 ' + ROWS.length + UNIT + '</b> 조회(운영이면 사고). 이래서 IS NOT INITIAL은 필수입니다.';
      renderRows(ROWS, true);
      return;
    }
    // 정상: distinct 키로 필터(중복 제거된 결과)
    var di = distinctIds();
    var rows = ROWS.filter(function (r) { return di.indexOf(r[KEY]) >= 0; });
    lastRun = { mode: 'ok', rows: rows };
    statusEl.className = 'fae-status ok';
    var dupNote = ids().length !== di.length
      ? ' (입력에 중복 ' + KEYN + '가 있었지만 결과는 ' + ROWN + ' 기준 — 입력 개수와 결과 행수를 단순 비교 금지)'
      : '';
    statusEl.innerHTML = '✅ 기준 ' + KEYN + ' ' + di.length + '개로 제한 조회 → <b>' + rows.length + UNIT + '</b> · sy-dbcnt = ' + rows.length + dupNote;
    renderRows(rows, false);
  }
  function renderRows(rows, over) {
    if (!rows.length) { bodyEl.innerHTML = '<tr><td colspan="' + CFG.cols.length + '" class="fae-empty">0' + UNIT + '</td></tr>'; return; }
    bodyEl.innerHTML = rows.map(function (r) {
      return '<tr class="' + (over ? 'over' : '') + '">' + CFG.cols.map(function (c) { return '<td>' + esc(r[c.key]) + '</td>'; }).join('') + '</tr>';
    }).join('');
  }

  function render() {
    renderKeyBtns(); renderList(); renderCode();
    safetyBtn.setAttribute('aria-pressed', safety ? 'true' : 'false');
    safetyBtn.textContent = safety ? 'IS NOT INITIAL: ON 🛡️' : 'IS NOT INITIAL: OFF ⚠️';
  }

  keysEl.addEventListener('click', function (e) { var b = e.target.closest('.fae-btn'); if (!b) return; setIdx = +b.getAttribute('data-i'); render(); });
  safetyBtn.addEventListener('click', function () { safety = !safety; render(); });
  runBtn.addEventListener('click', run);

  render();
  // 초기 안내
  statusEl.className = 'fae-status';
  statusEl.innerHTML = '기준 목록과 안전장치를 고르고 <b>▶ 실행</b>을 눌러 결과를 보세요.';
  bodyEl.innerHTML = '<tr><td colspan="' + CFG.cols.length + '" class="fae-empty">▶ 실행 전</td></tr>';
})();
