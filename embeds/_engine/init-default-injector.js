/* init-default-injector 엔진 — INITIALIZATION(화면 전 1회)과 AT SELECTION-SCREEN OUTPUT(매번)에서
   기본값을 넣을 때의 차이를 시연. INITIALIZATION은 사용자 입력 보존, OUTPUT 매번 대입은 입력을 덮어쓴다.
   골격 계약: .idi-mode · #idiDept · #idiDate · [data-run] · [data-user] · [data-redraw] · #idiStatus.
   config: window.IDI_CFG = { defaultDept, userDept, today }. 높이: _autoheight.js. */
(function () {
  var CFG = window.IDI_CFG || { defaultDept: '1000', userDept: '2000', today: '2026-07-01' };
  var mode = 'init';          // init | output
  var ran = false, dept = null, changed = false;
  var modeEl = document.querySelector('.idi-mode');
  var deptEl = document.getElementById('idiDept');
  var dateEl = document.getElementById('idiDate');
  var runBtn = document.querySelector('[data-run]');
  var userBtn = document.querySelector('[data-user]');
  var redrawBtn = document.querySelector('[data-redraw]');
  var statusEl = document.getElementById('idiStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function setStatus(cls, html) { statusEl.className = 'idi-status' + (cls ? ' ' + cls : ''); statusEl.innerHTML = html; }

  function render() {
    modeEl.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === mode ? 'true' : 'false'); });
    deptEl.textContent = dept == null ? '(비어 있음)' : dept;
    deptEl.className = 'idi-val' + (dept == null ? ' empty' : (changed ? ' changed' : ''));
    dateEl.textContent = ran ? CFG.today : '(비어 있음)';
    dateEl.className = 'idi-val' + (ran ? '' : ' empty');
    userBtn.disabled = !ran;
    redrawBtn.disabled = !ran;
  }

  modeEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; mode = b.getAttribute('data-v');
    render(); setStatus('', mode === 'init' ? '기본값을 <b>INITIALIZATION</b>(화면 전 1회)에 둔 경우입니다.' : '기본값을 <b>AT SELECTION-SCREEN OUTPUT</b>(매 화면)에 대입하는 경우입니다.');
  });
  runBtn.addEventListener('click', function () {
    ran = true; dept = CFG.defaultDept; changed = false; render();
    setStatus('', '▶ 최초 실행 — 화면 전 1회 <b>INITIALIZATION</b>이 <code>s_dept-low=' + esc(CFG.defaultDept) + '</code>, <code>pa_date=오늘</code>을 넣었습니다.');
  });
  userBtn.addEventListener('click', function () {
    if (!ran) return; dept = CFG.userDept; changed = true; render();
    setStatus('', '사용자가 부서를 <b>' + esc(CFG.userDept) + '</b>로 직접 바꿨습니다. 이제 화면을 다시 그려 보세요.');
  });
  redrawBtn.addEventListener('click', function () {
    if (!ran) return;
    if (mode === 'init') {
      // INITIALIZATION은 1회 → 다시 안 돈다 → 사용자 값 유지
      render();
      setStatus('ok', '✅ <b>INITIALIZATION</b>은 1회뿐이라 다시 돌지 않습니다 → 사용자 값 <b>' + esc(dept) + '</b>가 그대로 유지됩니다.');
    } else {
      // OUTPUT은 매 화면 → 기본값 다시 대입 → 사용자 입력 덮어씀
      dept = CFG.defaultDept; changed = false; render();
      setStatus('warn', '⚠️ <b>OUTPUT</b>은 매 화면마다 도므로 <code>s_dept-low=' + esc(CFG.defaultDept) + '</code>를 <b>다시 대입</b> → 사용자가 넣은 ' + esc(CFG.userDept) + '가 사라졌습니다. 그래서 기본값은 INITIALIZATION에 둡니다.');
    }
  });

  render();
  setStatus('', '<b>최초 실행</b> → <b>사용자 값 변경</b> → <b>화면 다시 그리기</b> 순서로 눌러, 두 모드의 차이를 보세요.');
})();
