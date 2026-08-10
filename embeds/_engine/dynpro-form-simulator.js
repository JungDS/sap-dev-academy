/* dynpro-form-simulator 엔진 — CH16 캡스톤. 예매 입력 화면 0100을 PBO 준비→입력→PAI(OK_CODE/검증/종료)로 한 번에 따라간다.
   화면 필드(GV_CONC·GV_PERF·GV_SEATS·GV_CUST·GV_STAT)는 같은 이름의 전역 변수로 운반되어 오른쪽 패널에 실시간 표시된다.
   SAVE: can_book 검증 → 좌석 1 이상인지 / 잔여석 이내인지를 나눠 판정하고 S/E 메시지(E면 화면 유지).
   BACK/CANCEL: LEAVE TO SCREEN 0. EXIT: LEAVE PROGRAM.
   OK_CODE는 save_ok로 복사 후 CLEAR하므로 SAVE 뒤 Enter는 재실행되지 않는다(직전에 SAVE가 있었을 때만 그렇게 안내).
   골격 계약: #dfsScreen · #dfsVars · #dfsEvent · #dfsMsg.
   config: window.DFS_CFG = { conc, perf, avail, cust, statuses:[{key,text}] } — statuses는 시드 정본 N/C. 높이: _autoheight.js. */
(function () {
  var CFG = window.DFS_CFG || { conc: 'C001', perf: '001', avail: 5, cust: '', statuses: [] };
  var seats = '2';
  var cust = CFG.cust || '';
  var stat = (CFG.statuses[0] || {}).key || 'N';
  var act = null;      // {okc, branch, msg, level, seatsBad}
  var sawSave = false; // 직전에 SAVE를 눌렀는가 (Enter 안내 분기용)

  var screenEl = document.getElementById('dfsScreen');
  var varsEl = document.getElementById('dfsVars');
  var eventEl = document.getElementById('dfsEvent');
  var msgEl = document.getElementById('dfsMsg');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function statText(k) { var f = CFG.statuses.filter(function (s) { return s.key === k; })[0]; return f ? f.text : ''; }

  function renderScreen() {
    var seatsBad = act && act.seatsBad;
    var opts = CFG.statuses.map(function (s) { return '<option value="' + esc(s.key) + '"' + (s.key === stat ? ' selected' : '') + '>' + esc(s.text) + ' (' + esc(s.key) + ')</option>'; }).join('');
    screenEl.innerHTML =
      '<div class="dfs-title">공연 ' + esc(CFG.conc) + ' 예매 · 화면 0100</div>' +
      '<div class="dfs-toolbar">' +
        '<button class="dfs-tb" data-fct="SAVE">예매 (SAVE)</button>' +
        '<button class="dfs-tb" data-fct="BACK">뒤로 (BACK)</button>' +
        '<button class="dfs-tb" data-fct="EXIT">종료 (EXIT)</button>' +
        '<button class="dfs-tb enter" data-fct="ENTER">Enter</button>' +
      '</div>' +
      '<div class="dfs-form">' +
        '<div class="dfs-fld"><span class="l">GV_CONC</span><span class="ro">' + esc(CFG.conc) + '</span></div>' +
        '<div class="dfs-fld"><span class="l">GV_PERF</span><span class="ro">' + esc(CFG.perf) + '</span></div>' +
        '<div class="dfs-fld"><span class="l">GV_SEATS</span><input class="seats ' + (seatsBad ? 'bad' : '') + '" data-seats type="number" value="' + esc(seats) + '" min="1"><span class="avail">잔여 ' + CFG.avail + '석</span></div>' +
        '<div class="dfs-fld"><span class="l">GV_CUST</span><input class="cust" data-cust type="text" value="' + esc(cust) + '" maxlength="20" placeholder="고객명"></div>' +
        '<div class="dfs-fld"><span class="l">GV_STAT</span><select data-stat>' + opts + '</select></div>' +
      '</div>';
  }
  function renderVars() {
    function row(k, v, note) {
      return '<div class="dfs-var"><span class="vk">' + k + '</span><span class="vv">' +
        (v === '' ? '<i class="empty">( 공백 )</i>' : esc(v)) + '</span>' +
        (note ? '<span class="vn">' + note + '</span>' : '') + '</div>';
    }
    varsEl.innerHTML =
      row('gv_conc', CFG.conc) +
      row('gv_perf', CFG.perf) +
      row('gv_seats', seats, '검증에 사용') +
      row('gv_cust', cust, '저장 때 사용') +
      row('gv_stat', stat, statText(stat)) +
      row('ok_code', act && act.okc ? act.okc : '', act ? 'save_ok로 옮기고 CLEAR' : '');
  }
  function renderEvent() {
    function row(k, v, cls) { return '<div class="dfs-ev"><span class="dfs-ek">' + k + '</span><span class="ev ' + (cls || '') + '">' + v + '</span></div>'; }
    var h = row('PBO', 'SET PF-STATUS · TITLEBAR · 드롭다운 채움(N/C)');
    if (!act) { h += row('PAI', '버튼을 누르면 처리됩니다', 'muted'); eventEl.innerHTML = h; return; }
    h += row('OK_CODE', act.okc ? "'" + esc(act.okc) + "' → save_ok 복사 → CLEAR" : "'' (Enter·남은 값 없음)");
    h += row('CASE', act.branch || '(분기 없음)');
    eventEl.innerHTML = h;
  }
  function renderMsg() {
    if (!act) { msgEl.className = ''; msgEl.innerHTML = '화면이 준비되었습니다. 값을 바꾸고 <b>예매(SAVE)</b>를 눌러 보세요.'; return; }
    msgEl.className = act.level || '';
    msgEl.innerHTML = act.msg;
  }
  function render() { renderScreen(); renderVars(); renderEvent(); renderMsg(); }

  function pai(fct) {
    var okc = fct === 'ENTER' ? '' : fct;     // Enter는 OK field가 비어 있음(직전 CLEAR됨)
    if (fct === 'ENTER') {
      act = {
        okc: '', branch: "save_ok = '' → CASE 어디에도 안 걸림 → 처리 없음",
        msg: sawSave
          ? '↩ Enter — 직전 <code>CLEAR ok_code</code> 덕분에 방금 누른 <b>SAVE가 다시 실행되지 않습니다.</b>'
          : '↩ Enter — <code>OK_CODE</code>가 비어 있어 아무 분기도 타지 않습니다(아직 SAVE를 누른 적이 없습니다). <b>예매(SAVE) → Enter</b> 순서로 눌러 반복 방지도 확인해 보세요.',
        level: 'leave'
      };
      sawSave = false;
      render(); return;
    }
    if (fct === 'SAVE') {
      var n = parseInt(seats, 10);
      if (!(n > 0)) {                          // 0·음수·빈값은 '부족'이 아니라 잘못된 입력
        act = { okc: okc, branch: "WHEN 'SAVE' → 좌석 수 확인 → 유효하지 않음",
          msg: '⛔ 좌석 수는 <b>1 이상</b>이어야 합니다 (입력 ' + esc(seats === '' ? '(공백)' : seats) + ') — <code>MESSAGE E</code> · 화면 유지', level: 'e', seatsBad: true };
      } else if (n > CFG.avail) {
        act = { okc: okc, branch: "WHEN 'SAVE' → PERFORM can_book → gv_ok = abap_false",
          msg: '⛔ 좌석이 부족합니다 (요청 ' + n + ' &gt; 잔여 ' + CFG.avail + ') — <code>MESSAGE E</code> · 화면 유지', level: 'e', seatsBad: true };
      } else {
        act = { okc: okc, branch: "WHEN 'SAVE' → PERFORM can_book → gv_ok = abap_true",
          msg: '✅ 예매 가능 — <code>MESSAGE S</code> <span class="badge">저장은 이후 단계(DML)</span><br><small>gv_cust=' +
            (cust ? esc(cust) : '(공백)') + ' · gv_stat=' + esc(stat) + '는 화면에서 받아 뒀지만 <code>can_book</code> 검증에는 쓰이지 않습니다.</small>', level: 's' };
      }
      sawSave = true;
      render(); return;
    }
    if (fct === 'BACK' || fct === 'CANCEL') {
      act = { okc: okc, branch: "WHEN 'BACK' → LEAVE TO SCREEN 0", msg: '◀ 화면 종료 — <code>LEAVE TO SCREEN 0</code> (호출자로 복귀)', level: 'leave' };
      sawSave = false;
      render(); return;
    }
    if (fct === 'EXIT') {
      act = { okc: okc, branch: "WHEN 'EXIT' → LEAVE PROGRAM", msg: '⏻ 프로그램 종료 — <code>LEAVE PROGRAM</code> (트랜잭션 전체 종료)', level: 'leave' };
      sawSave = false;
      render(); return;
    }
  }

  screenEl.addEventListener('click', function (e) { var b = e.target.closest('[data-fct]'); if (!b) return; pai(b.getAttribute('data-fct')); });
  screenEl.addEventListener('input', function (e) {
    if (e.target.hasAttribute && e.target.hasAttribute('data-seats')) { seats = e.target.value; renderVars(); }
    else if (e.target.hasAttribute && e.target.hasAttribute('data-cust')) { cust = e.target.value; renderVars(); }
  });
  screenEl.addEventListener('change', function (e) { if (e.target.hasAttribute && e.target.hasAttribute('data-stat')) { stat = e.target.value; renderVars(); } });

  render();
})();
