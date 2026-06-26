/* fae-safety-sim 엔진 — FOR ALL ENTRIES의 빈 기준 테이블 함정을 시뮬레이션.
   기준 목록(lt_dept) × 안전장치(IS NOT INITIAL) 조합으로 실행 → 제한 조회 / 빈 목록 보호 / 전체 조회 위험.
   골격 계약: .fae-dept(버튼) · [data-safety] · #faeList · [data-run] · #faeCode · #faeStatus · #faeBody.
   config: window.FAE_CFG = { people:[{persid,name,dept_id}], deptSets:[{label,ids:[..]}], cols:[{key,label}] }.
   높이: _autoheight.js. */
(function () {
  var CFG = window.FAE_CFG || { people: [], deptSets: [], cols: [] };
  var setIdx = 0;          // deptSets 인덱스(기준 목록)
  var safety = true;
  var lastRun = null;      // {mode, rows}

  var deptEl = document.querySelector('.fae-dept');
  var safetyBtn = document.querySelector('[data-safety]');
  var listEl = document.getElementById('faeList');
  var runBtn = document.querySelector('[data-run]');
  var codeEl = document.getElementById('faeCode');
  var statusEl = document.getElementById('faeStatus');
  var bodyEl = document.getElementById('faeBody');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function ids() { return CFG.deptSets[setIdx].ids; }
  function distinctIds() { var s = {}, o = []; ids().forEach(function (d) { if (!(d in s)) { s[d] = 1; o.push(d); } }); return o; }

  function renderDeptBtns() {
    deptEl.innerHTML = CFG.deptSets.map(function (s, i) {
      return '<button class="fae-btn" type="button" data-i="' + i + '" aria-pressed="' + (i === setIdx ? 'true' : 'false') + '">' + esc(s.label) + '</button>';
    }).join('');
  }
  function renderList() {
    var v = ids();
    listEl.innerHTML = 'lt_dept = ' + (v.length ? '[ ' + v.join(', ') + ' ]' : '<span class="empty">[ ] (빈 테이블)</span>');
  }
  function renderCode() {
    var guardOn = safety;
    var lines = [];
    if (guardOn) lines.push('<span class="gd">IF lt_dept IS NOT INITIAL.</span>');
    var ind = guardOn ? '  ' : '';
    lines.push(ind + '<span class="kw">SELECT</span> persid name dept_id');
    lines.push(ind + '  <span class="kw">FROM</span> ztperson');
    lines.push(ind + '  <span class="kw">INTO CORRESPONDING FIELDS OF TABLE</span> lt_person');
    lines.push(ind + '  <span class="kw">FOR ALL ENTRIES IN</span> lt_dept');
    lines.push(ind + '  <span class="kw">WHERE</span> dept_id = lt_dept-dept_id.');
    if (guardOn) lines.push('<span class="gd">ENDIF.</span>');
    else lines.push('<span class="dim">" ⚠️ IS NOT INITIAL 보호 없음</span>');
    codeEl.innerHTML = lines.join('\n');
  }

  function run() {
    var empty = ids().length === 0;
    if (empty && safety) {
      lastRun = { mode: 'safe', rows: [] };
      statusEl.className = 'fae-status safe';
      statusEl.innerHTML = '🛡️ <b>lt_dept</b>가 비어 <b>IS NOT INITIAL</b>이 막았습니다 → SELECT 실행 안 함. (sy-dbcnt는 갱신되지 않으니 이전 값에 의존 금지)';
      bodyEl.innerHTML = '<tr><td colspan="' + CFG.cols.length + '" class="fae-empty">SELECT 실행 안 함 — lt_person 변화 없음.</td></tr>';
      return;
    }
    if (empty && !safety) {
      lastRun = { mode: 'danger', rows: CFG.people.slice() };
      statusEl.className = 'fae-status danger';
      statusEl.innerHTML = '⚠️ <b>위험!</b> 빈 lt_dept라 WHERE가 통째로 무시됨 → <b>전체 ' + CFG.people.length + '명</b> 조회(운영이면 사고). 이래서 IS NOT INITIAL은 필수입니다.';
      renderRows(CFG.people, true);
      return;
    }
    // 정상: distinct dept로 필터(중복 제거된 사람 결과)
    var di = distinctIds();
    var rows = CFG.people.filter(function (p) { return di.indexOf(p.dept_id) >= 0; });
    lastRun = { mode: 'ok', rows: rows };
    statusEl.className = 'fae-status ok';
    var dupNote = ids().length !== di.length ? ' (입력에 중복 부서 있었지만 결과는 사람 기준 — 입력 개수와 결과 행수를 단순 비교 금지)' : '';
    statusEl.innerHTML = '✅ 기준 부서 ' + di.length + '개로 제한 조회 → <b>' + rows.length + '명</b> · sy-dbcnt = ' + rows.length + dupNote;
    renderRows(rows, false);
  }
  function renderRows(rows, over) {
    if (!rows.length) { bodyEl.innerHTML = '<tr><td colspan="' + CFG.cols.length + '" class="fae-empty">0명</td></tr>'; return; }
    bodyEl.innerHTML = rows.map(function (p) {
      return '<tr class="' + (over ? 'over' : '') + '">' + CFG.cols.map(function (c) { return '<td>' + esc(p[c.key]) + '</td>'; }).join('') + '</tr>';
    }).join('');
  }

  function render() {
    renderDeptBtns(); renderList(); renderCode();
    safetyBtn.setAttribute('aria-pressed', safety ? 'true' : 'false');
    safetyBtn.textContent = safety ? 'IS NOT INITIAL: ON 🛡️' : 'IS NOT INITIAL: OFF ⚠️';
  }

  deptEl.addEventListener('click', function (e) { var b = e.target.closest('.fae-btn'); if (!b) return; setIdx = +b.getAttribute('data-i'); render(); });
  safetyBtn.addEventListener('click', function () { safety = !safety; render(); });
  runBtn.addEventListener('click', run);

  render();
  // 초기 안내
  statusEl.className = 'fae-status';
  statusEl.innerHTML = '기준 목록과 안전장치를 고르고 <b>▶ 실행</b>을 눌러 결과를 보세요.';
  bodyEl.innerHTML = '<tr><td colspan="' + CFG.cols.length + '" class="fae-empty">▶ 실행 전</td></tr>';
})();
