/* okcode-branch-lab 엔진 — PAI에서 ok_code를 save_ok로 복사→CLEAR→CASE 분기하는 패턴을 추적한다.
   OK field(okReg)는 PAI 호출 사이에 값이 남는다: CLEAR를 생략한 채 SAVE 뒤 Enter를 누르면 이전 'SAVE'가 재실행된다(위험).
   골격 계약: .obl-btns · .obl-clear · [data-enter] · [data-reset] · #oblReg · #oblTrace.
   config: window.OBL_CFG = { buttons:[{fct,label,action}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.OBL_CFG || { buttons: [] };
  var okReg = '';        // OK field에 남아 있는 값(PAI 사이 유지)
  var clearOn = true;    // CLEAR ok_code 수행 여부
  var trace = [];        // 최근 PAI 실행 기록(최신이 위)

  var btnsEl = document.querySelector('.obl-btns');
  var clearEl = document.querySelector('.obl-clear');
  var regEl = document.getElementById('oblReg');
  var traceEl = document.getElementById('oblTrace');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function actionOf(fct) {
    var b = CFG.buttons.filter(function (x) { return x.fct === fct; })[0];
    return b ? b.action : (fct ? "(CASE에 없음 — 무시)" : "(분기 없음)");
  }

  function runPAI(isEnter) {
    var saveOk = okReg;                 // save_ok = ok_code
    var cleared = clearOn;
    if (clearOn) okReg = '';            // CLEAR ok_code
    var action = actionOf(saveOk);
    var reexec = isEnter && saveOk !== '';   // Enter가 남은 명령을 재실행
    trace.unshift({ isEnter: isEnter, inCode: saveOk, saveOk: saveOk, cleared: cleared, action: action, reexec: reexec });
    if (trace.length > 6) trace.pop();
    render();
  }

  function renderClear() {
    clearEl.innerHTML = [{ v: 1, l: 'CLEAR 정상' }, { v: 0, l: 'CLEAR 생략' }].map(function (o) {
      return '<button type="button" data-v="' + o.v + '" aria-pressed="' + ((o.v === 1) === clearOn ? 'true' : 'false') + '">' + esc(o.l) + '</button>';
    }).join('');
  }
  function renderBtns() {
    btnsEl.innerHTML = CFG.buttons.map(function (b) {
      return '<button type="button" data-fct="' + esc(b.fct) + '">' + esc(b.label) + ' <span class="fc">' + esc(b.fct) + '</span></button>';
    }).join('') +
      '<button type="button" class="enter" data-enter>Enter</button>' +
      '<button type="button" class="reset" data-reset>↺ 초기화</button>';
  }
  function renderReg() {
    regEl.innerHTML = '현재 OK field <code>ok_code</code> = ' + (okReg ? '<b>\'' + esc(okReg) + '\'</b> (다음 Enter가 이 값을 봄)' : '<span class="empty">\'\' (비어 있음)</span>');
  }
  function renderTrace() {
    if (!trace.length) { traceEl.innerHTML = '<div class="obl-empty">버튼을 눌러 PAI 분기를 추적하세요. (CLEAR 생략 후 SAVE→Enter 순서를 해 보세요)</div>'; return; }
    traceEl.innerHTML = trace.map(function (t) {
      var badge = t.reexec ? '<span class="badge danger">⚠ 이전 명령 재실행</span>' : (t.isEnter ? '<span class="badge enter">Enter</span>' : '');
      return '<div class="obl-tr ' + (t.reexec ? 'reexec' : '') + '"><div class="trh"><span>' + (t.isEnter ? 'Enter 입력' : '버튼: ' + (t.inCode || '?')) + '</span>' + badge + '</div>' +
        '<div class="trbody"><span>ok_code 진입=<b>' + (t.inCode ? "'" + esc(t.inCode) + "'" : "''") + '</b></span>' +
        '<span>save_ok=<b>' + (t.saveOk ? "'" + esc(t.saveOk) + "'" : "''") + '</b></span>' +
        '<span>CLEAR ' + (t.cleared ? '수행' : '<b style="color:var(--bad)">생략</b>') + '</span>' +
        '<span>CASE → <span class="act">' + esc(t.action) + '</span></span></div></div>';
    }).join('');
  }
  function render() { renderClear(); renderBtns(); renderReg(); renderTrace(); }

  btnsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-reset')) { okReg = ''; trace = []; render(); return; }
    if (b.hasAttribute('data-enter')) { runPAI(true); return; }
    var fct = b.getAttribute('data-fct');
    if (fct === null) return;
    okReg = fct;          // 실제 버튼은 OK field에 자기 function code를 넣는다
    runPAI(false);
  });
  clearEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; clearOn = b.getAttribute('data-v') === '1'; render(); });

  render();
})();
