/* dynpro-form-simulator 엔진 — CH16 캡스톤. 예매 입력 화면 0100을 PBO 준비→입력→PAI(OK_CODE/검증/종료)로 한 번에 따라간다.
   SAVE: can_book(p_seats<=잔여) 검증 → S/E 메시지(E면 화면 유지). BACK/CANCEL: LEAVE TO SCREEN 0. EXIT: LEAVE PROGRAM.
   OK_CODE는 save_ok로 복사 후 CLEAR하므로 SAVE 뒤 Enter는 재실행되지 않는다.
   골격 계약: #dfsScreen · #dfsEvent · #dfsMsg.
   config: window.DFS_CFG = { conc, perf, avail, statuses:[{key,text}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.DFS_CFG || { conc: 'C001', perf: '001', avail: 5, statuses: [] };
  var seats = '2';
  var stat = (CFG.statuses[0] || {}).key || 'R';
  var act = null;   // {btn, okc, saveok, msg, level, seatsBad, terminated}

  var screenEl = document.getElementById('dfsScreen');
  var eventEl = document.getElementById('dfsEvent');
  var msgEl = document.getElementById('dfsMsg');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function renderScreen() {
    var seatsBad = act && act.seatsBad;
    var opts = CFG.statuses.map(function (s) { return '<option value="' + esc(s.key) + '"' + (s.key === stat ? ' selected' : '') + '>' + esc(s.text) + ' (' + esc(s.key) + ')</option>'; }).join('');
    screenEl.innerHTML =
      '<div class="dfs-title">공연 ' + esc(CFG.conc) + ' 예매 · 화면 0100</div>' +
      '<div class="dfs-toolbar">' +
        '<button class="dfs-tb" data-fct="SAVE">저장 (SAVE)</button>' +
        '<button class="dfs-tb" data-fct="BACK">뒤로 (BACK)</button>' +
        '<button class="dfs-tb" data-fct="EXIT">종료 (EXIT)</button>' +
        '<button class="dfs-tb enter" data-fct="ENTER">Enter</button>' +
      '</div>' +
      '<div class="dfs-form">' +
        '<div class="dfs-fld"><span class="l">P_CONC</span><span class="ro">' + esc(CFG.conc) + '</span></div>' +
        '<div class="dfs-fld"><span class="l">P_PERF</span><span class="ro">' + esc(CFG.perf) + '</span></div>' +
        '<div class="dfs-fld"><span class="l">P_SEATS</span><input class="seats ' + (seatsBad ? 'bad' : '') + '" data-seats type="number" value="' + esc(seats) + '" min="1"><span class="avail">잔여 ' + CFG.avail + '석</span></div>' +
        '<div class="dfs-fld"><span class="l">P_STAT</span><select data-stat>' + opts + '</select></div>' +
      '</div>';
  }
  function renderEvent() {
    function row(k, v, cls) { return '<div class="dfs-ev"><span class="dfs-ek">' + k + '</span><span class="ev ' + (cls || '') + '">' + v + '</span></div>'; }
    var h = row('PBO', 'SET PF-STATUS · TITLEBAR · 드롭다운 채움');
    if (!act) { h += row('PAI', '버튼을 누르면 처리됩니다', 'muted'); eventEl.innerHTML = h; return; }
    h += row('OK_CODE', act.okc ? "'" + esc(act.okc) + "' → save_ok 복사 → CLEAR" : "'' (Enter·남은 값 없음)");
    h += row('CASE', act.branch || '(분기 없음)');
    eventEl.innerHTML = h;
  }
  function renderMsg() {
    if (!act) { msgEl.className = ''; msgEl.innerHTML = '화면이 준비되었습니다. 좌석 수를 바꾸고 <b>저장(SAVE)</b>을 눌러 보세요.'; return; }
    msgEl.className = act.level || '';
    msgEl.innerHTML = act.msg;
  }
  function render() { renderScreen(); renderEvent(); renderMsg(); }

  function pai(fct) {
    var okc = fct === 'ENTER' ? '' : fct;     // Enter는 OK field가 비어 있음(직전 CLEAR됨)
    if (fct === 'ENTER') {
      act = { okc: '', branch: 'save_ok = \'\' → 처리 없음', msg: '↩ Enter — 직전 <code>CLEAR ok_code</code> 덕분에 이전 SAVE가 <b>재실행되지 않습니다.</b>', level: 'leave' };
      render(); return;
    }
    if (fct === 'SAVE') {
      var n = parseInt(seats, 10);
      var ok = n > 0 && n <= CFG.avail;
      if (ok) act = { okc: okc, branch: "WHEN 'SAVE' → PERFORM can_book → lv_ok = abap_true", msg: '✅ 예매 가능 — <code>MESSAGE S</code> <span class="badge">저장은 이후 단계(DML)</span>', level: 's' };
      else act = { okc: okc, branch: "WHEN 'SAVE' → can_book → lv_ok = abap_false", msg: '⛔ 좌석이 부족합니다 (요청 ' + esc(seats) + ' > 잔여 ' + CFG.avail + ') — <code>MESSAGE E</code> · 화면 유지', level: 'e', seatsBad: true };
      render(); return;
    }
    if (fct === 'BACK' || fct === 'CANCEL') {
      act = { okc: okc, branch: "WHEN 'BACK' → LEAVE TO SCREEN 0", msg: '◀ 화면 종료 — <code>LEAVE TO SCREEN 0</code> (호출자로 복귀)', level: 'leave' };
      render(); return;
    }
    if (fct === 'EXIT') {
      act = { okc: okc, branch: "WHEN 'EXIT' → LEAVE PROGRAM", msg: '⏻ 프로그램 종료 — <code>LEAVE PROGRAM</code> (트랜잭션 전체 종료)', level: 'leave' };
      render(); return;
    }
  }

  screenEl.addEventListener('click', function (e) { var b = e.target.closest('[data-fct]'); if (!b) return; pai(b.getAttribute('data-fct')); });
  screenEl.addEventListener('input', function (e) { if (e.target.hasAttribute && e.target.hasAttribute('data-seats')) { seats = e.target.value; } });
  screenEl.addEventListener('change', function (e) { if (e.target.hasAttribute && e.target.hasAttribute('data-stat')) { stat = e.target.value; } });

  render();
})();
