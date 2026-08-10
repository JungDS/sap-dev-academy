/* init-default-injector 엔진 — INITIALIZATION(화면 전 1회)과 AT SELECTION-SCREEN OUTPUT(매번)에서
   기본값을 넣을 때의 차이를 시연. INITIALIZATION은 사용자 입력 보존, OUTPUT 매번 대입은 입력을 덮어쓴다.
   소재는 본문 정본과 같은 so_conc(공연 코드, 기본 'C001')·pa_date이며,
   header line을 채우고 APPEND로 selection table에 조건 1건이 들어가는 흐름까지 보여 준다.
   골격 계약: .idi-mode · #idiConc · #idiDate · #idiSelTab · [data-run] · [data-user] · [data-redraw] · #idiStatus.
   config: window.IDI_CFG = { defaultConc, userConc, today }. 높이: _autoheight.js. */
(function () {
  var CFG = window.IDI_CFG || { defaultConc: 'C001', userConc: 'C002', today: '2026-07-01' };
  var mode = 'init';          // init | output
  var ran = false, conc = null, changed = false, appended = false;
  var modeEl = document.querySelector('.idi-mode');
  var concEl = document.getElementById('idiConc');
  var dateEl = document.getElementById('idiDate');
  var tabEl = document.getElementById('idiSelTab');
  var runBtn = document.querySelector('[data-run]');
  var userBtn = document.querySelector('[data-user]');
  var redrawBtn = document.querySelector('[data-redraw]');
  var statusEl = document.getElementById('idiStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function setStatus(cls, html) { statusEl.className = 'idi-status' + (cls ? ' ' + cls : ''); statusEl.innerHTML = html; }

  function renderSelTab() {
    if (!appended) {
      tabEl.innerHTML = '<div class="idi-tab"><div class="idi-thd"><span>SIGN</span><span>OPTION</span><span>LOW</span><span>HIGH</span></div>' +
        '<div class="idi-tempty">( 아직 조건 행이 없습니다 — <code>APPEND</code> 전 )</div></div>';
      return;
    }
    tabEl.innerHTML = '<div class="idi-tab"><div class="idi-thd"><span>SIGN</span><span>OPTION</span><span>LOW</span><span>HIGH</span></div>' +
      '<div class="idi-trow' + (changed ? ' changed' : '') + '"><span>I</span><span>EQ</span><span class="lo">' + esc(conc) + '</span><span>—</span></div></div>' +
      '<p class="idi-tnote"><code>so_conc-low</code>에 값을 채우고 <code>APPEND so_conc.</code> 한 줄이 이 표에 조건 1건을 밀어 넣습니다. 화면의 첫 줄이 곧 이 행입니다.</p>';
  }

  function render() {
    modeEl.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === mode ? 'true' : 'false'); });
    concEl.textContent = conc == null ? '(비어 있음)' : conc;
    concEl.className = 'idi-val' + (conc == null ? ' empty' : (changed ? ' changed' : ''));
    dateEl.textContent = ran ? CFG.today : '(비어 있음)';
    dateEl.className = 'idi-val' + (ran ? '' : ' empty');
    userBtn.disabled = !ran;
    redrawBtn.disabled = !ran;
    renderSelTab();
  }

  modeEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; mode = b.getAttribute('data-v');
    ran = false; conc = null; changed = false; appended = false; render();
    setStatus('', mode === 'init'
      ? '기본값을 <b>INITIALIZATION</b>(화면 전 1회)에 둔 경우입니다. ① 최초 실행부터 눌러 보세요.'
      : '기본값을 <b>AT SELECTION-SCREEN OUTPUT</b>(매 화면)에 대입하는 경우입니다. ① 최초 실행부터 눌러 보세요.');
  });
  runBtn.addEventListener('click', function () {
    ran = true; conc = CFG.defaultConc; changed = false; appended = true; render();
    if (mode === 'init') {
      setStatus('', '▶ 최초 실행 — 화면 전 <b>1회</b> 도는 <b>INITIALIZATION</b>이 <code>pa_date=오늘</code>을 넣고, ' +
        '<code>so_conc-low=' + esc(CFG.defaultConc) + '</code>로 header line을 채운 뒤 <code>APPEND</code>로 조건표에 1건을 넣었습니다.');
    } else {
      setStatus('', '▶ 최초 실행 — 이 모드에는 <b>INITIALIZATION이 없습니다.</b> 화면을 그리기 직전 도는 ' +
        '<b>AT SELECTION-SCREEN OUTPUT</b>이 <code>so_conc-low=' + esc(CFG.defaultConc) + '</code>를 대입했습니다(화면마다 반복됩니다).');
    }
  });
  userBtn.addEventListener('click', function () {
    if (!ran) return; conc = CFG.userConc; changed = true; render();
    setStatus('', '사용자가 공연 코드를 <b>' + esc(CFG.userConc) + '</b>로 직접 바꿨습니다. 이제 화면을 다시 그려 보세요.');
  });
  redrawBtn.addEventListener('click', function () {
    if (!ran) return;
    if (mode === 'init') {
      // INITIALIZATION은 1회 → 다시 안 돈다 → 사용자 값 유지
      render();
      setStatus('ok', '✅ <b>INITIALIZATION</b>은 1회뿐이라 다시 돌지 않습니다 → 사용자 값 <b>' + esc(conc) + '</b>가 그대로 유지됩니다.');
    } else {
      // OUTPUT은 매 화면 → 기본값 다시 대입 → 사용자 입력 덮어씀
      conc = CFG.defaultConc; changed = false; render();
      setStatus('warn', '⚠️ <b>OUTPUT</b>은 매 화면마다 도므로 <code>so_conc-low=' + esc(CFG.defaultConc) + '</code>를 <b>다시 대입</b> → 사용자가 넣은 ' + esc(CFG.userConc) + '가 사라졌습니다. 그래서 기본값은 INITIALIZATION에 둡니다.');
    }
  });

  render();
  setStatus('', '<b>최초 실행</b> → <b>사용자 값 변경</b> → <b>화면 다시 그리기</b> 순서로 눌러, 두 모드의 차이를 보세요.');
})();
