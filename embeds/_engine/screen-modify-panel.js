/* screen-modify-panel 엔진 — AT SELECTION-SCREEN OUTPUT에서 LOOP AT SCREEN으로 필드 속성을 바꾸고
   MODIFY SCREEN으로 화면에 반영하는 흐름. pa_mode를 바꿔도 '화면 그리기(OUTPUT 실행)' 전에는 미반영이고,
   MODIFY SCREEN을 '생략'으로 두고 그리면 work area의 active만 0이 되고 화면은 그대로임을 보여 준다(최다 실수).
   골격 계약: .smp-mode · .smp-modify · [data-draw] · #smpPreview · #smpAttr · #smpStatus.
   config: window.SMP_CFG = { advField } (기본 PA_ADV, mode 'A'면 보임). 높이: _autoheight.js. */
(function () {
  var CFG = window.SMP_CFG || { advField: 'PA_ADV' };
  var FIELD = CFG.advField || 'PA_ADV';
  var pMode = '';          // '' 기본 | 'A' 고급
  var modify = true;       // MODIFY SCREEN 실행 여부
  var waActive = null;     // work area(gs_screen-active) 값 — null=아직 안 그림
  var scrActive = null;    // 화면에 실제 반영된 active 값
  var stale = false;       // mode/토글 바꾼 뒤 화면 미반영
  var modeEl = document.querySelector('.smp-mode');
  var modifyEl = document.querySelector('.smp-modify');
  var previewEl = document.getElementById('smpPreview');
  var attrEl = document.getElementById('smpAttr');
  var statusEl = document.getElementById('smpStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function setStatus(cls, html) { statusEl.className = 'smp-status' + (cls ? ' ' + cls : ''); statusEl.innerHTML = html; }

  function renderPreview() {
    var hidden = (scrActive === 0) || (scrActive === null);
    previewEl.innerHTML =
      '<div class="smp-srow"><span class="nm">PA_MODE</span><input type="text" value="' + esc(pMode) + '" readonly></div>' +
      '<div class="smp-srow' + (hidden ? ' gone' : '') + '"><span class="nm">' + esc(FIELD) + '</span><input type="text" placeholder="(고급 전용)" readonly></div>' +
      (stale ? '<div class="smp-stale">⚠ 설정을 바꿨습니다 — ▶ 화면 그리기를 눌러야 OUTPUT이 다시 돕니다.</div>'
        : (scrActive === null ? '<div class="smp-stale">▶ 화면 그리기를 눌러 OUTPUT을 실행하세요.</div>' : ''));
  }
  function renderAttr() {
    function cell(v) {
      var cls = v === 1 ? 'on' : (v === 0 ? 'off' : '');
      return '<td class="' + cls + '">' + (v === null ? '?' : v) + '</td>';
    }
    var mean = scrActive === null ? '미반영'
      : (scrActive === 1 ? (waActive === 0 ? '표시 — work area만 바뀜(MODIFY 생략)' : '표시') : '숨김(active 0)');
    attrEl.innerHTML = '<thead><tr><th>name</th><th>gs_screen-active<br><small>work area</small></th><th>screen active<br><small>화면 반영</small></th><th>의미</th></tr></thead><tbody>' +
      '<tr><td>PA_MODE</td><td class="on">1</td><td class="on">1</td><td>항상 표시</td></tr>' +
      '<tr><td>' + esc(FIELD) + '</td>' + cell(waActive) + cell(scrActive) + '<td>' + mean + '</td></tr></tbody>';
  }
  function renderMode() {
    modeEl.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === pMode ? 'true' : 'false'); });
    modifyEl.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-m') === (modify ? 'on' : 'off') ? 'true' : 'false'); });
  }
  function render() { renderMode(); renderPreview(); renderAttr(); }

  modeEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    pMode = b.getAttribute('data-v'); stale = (scrActive !== null); render();
    setStatus('', 'pa_mode = <b>' + (pMode || "''") + '</b>로 바꿨습니다. 변수만 바뀌었을 뿐 — <b>화면 그리기</b>를 눌러 OUTPUT을 실행해야 화면이 바뀝니다.');
  });
  modifyEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    modify = b.getAttribute('data-m') === 'on'; stale = (scrActive !== null); render();
    setStatus('', modify
      ? '<code>MODIFY SCREEN FROM gs_screen</code>을 <b>실행</b>합니다 — 바꾼 work area를 화면에 반영합니다.'
      : '<code>MODIFY SCREEN FROM gs_screen</code>을 <b>생략</b>합니다 — 이 상태로 그려 보세요.');
  });
  document.querySelector('[data-draw]').addEventListener('click', function () {
    stale = false;
    if (pMode === 'A') {
      // IF 조건이 거짓 → 속성을 아예 건드리지 않는다
      waActive = 1; scrActive = 1; render();
      setStatus('ok', '✅ OUTPUT 실행 — <code>pa_mode = \'A\'</code>라 <code>IF</code> 조건이 거짓 → 속성을 건드리지 않아 <code>' + esc(FIELD) + '</code>가 그대로 보입니다(active=1).');
      return;
    }
    waActive = 0;                       // LOOP AT SCREEN INTO gs_screen → gs_screen-active = '0'
    scrActive = modify ? 0 : 1;         // MODIFY SCREEN 을 해야 화면에 반영된다
    render();
    if (modify) setStatus('ok', '✅ OUTPUT 실행 — <code>LOOP AT SCREEN</code>이 work area의 <code>active=0</code>으로 바꾸고 <code>MODIFY SCREEN</code>으로 반영 → 필드가 숨겨졌습니다.');
    else setStatus('warn', '⚠️ <code>MODIFY SCREEN</code> 생략 — work area의 <code>gs_screen-active</code>는 <b>0</b>인데 화면은 여전히 <b>1</b>이라 <code>' + esc(FIELD) + '</code>가 그대로 보입니다. 이 레슨에서 가장 흔한 실수입니다.');
  });

  render();
  setStatus('', 'pa_mode와 <code>MODIFY SCREEN</code>을 고르고 <b>▶ 화면 그리기</b>를 눌러, OUTPUT이 화면 속성을 어떻게 바꾸는지 보세요.');
})();
