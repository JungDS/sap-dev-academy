/* screen-modify-panel 엔진 — AT SELECTION-SCREEN OUTPUT에서 LOOP AT SCREEN으로 필드 속성을 바꾸고
   MODIFY SCREEN으로 화면에 반영하는 흐름. pa_mode를 바꿔도 '화면 그리기(OUTPUT 실행)' 전에는 미반영.
   골격 계약: .smp-mode · [data-draw] · #smpPreview · #smpAttr · #smpStatus.
   config: window.SMP_CFG = { secretField } (기본 PA_SECRET, mode 'A'면 보임). 높이: _autoheight.js. */
(function () {
  var CFG = window.SMP_CFG || { secretField: 'PA_SECRET' };
  var pMode = '';          // '' 기본 | 'A' 고급
  var drawn = null;        // PA_SECRET active 반영값(null=아직 안 그림)
  var stale = false;       // mode 바꾼 뒤 화면 미반영
  var modeEl = document.querySelector('.smp-mode');
  var previewEl = document.getElementById('smpPreview');
  var attrEl = document.getElementById('smpAttr');
  var statusEl = document.getElementById('smpStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function setStatus(cls, html) { statusEl.className = 'smp-status' + (cls ? ' ' + cls : ''); statusEl.innerHTML = html; }

  function renderPreview() {
    var secretGone = (drawn === 0) || (drawn === null);
    previewEl.innerHTML =
      '<div class="smp-srow"><span class="nm">PA_MODE</span><input type="text" value="' + esc(pMode) + '" readonly></div>' +
      '<div class="smp-srow' + (secretGone ? ' gone' : '') + '"><span class="nm">PA_SECRET</span><input type="text" placeholder="(고급 전용)" readonly></div>' +
      (stale ? '<div class="smp-stale">⚠ pa_mode를 바꿨습니다 — ▶ 화면 그리기를 눌러야 반영됩니다(MODIFY SCREEN).</div>'
        : (drawn === null ? '<div class="smp-stale">▶ 화면 그리기를 눌러 OUTPUT을 실행하세요.</div>' : ''));
  }
  function renderAttr() {
    var act = drawn === null ? '?' : drawn;
    var cls = drawn === 1 ? 'on' : (drawn === 0 ? 'off' : '');
    attrEl.innerHTML = '<thead><tr><th>name</th><th>active</th><th>의미</th></tr></thead><tbody>' +
      '<tr><td>PA_MODE</td><td class="on">1</td><td>항상 표시</td></tr>' +
      '<tr><td>PA_SECRET</td><td class="' + cls + '">' + act + '</td><td>' + (drawn === 1 ? '표시' : (drawn === 0 ? '숨김(active 0)' : '미반영')) + '</td></tr></tbody>';
  }
  function renderMode() { modeEl.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === pMode ? 'true' : 'false'); }); }
  function render() { renderMode(); renderPreview(); renderAttr(); }

  modeEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    pMode = b.getAttribute('data-v'); stale = (drawn !== null); render();
    setStatus('', 'pa_mode = <b>' + (pMode || "''") + '</b>로 바꿨습니다. 변수만 바뀌었을 뿐 — <b>화면 그리기</b>를 눌러 OUTPUT을 실행해야 화면이 바뀝니다.');
  });
  document.querySelector('[data-draw]').addEventListener('click', function () {
    drawn = (pMode === 'A') ? 1 : 0; stale = false; render();
    if (drawn === 1) setStatus('ok', '✅ OUTPUT 실행 — pa_mode=A라 <code>PA_SECRET</code>가 그대로 보입니다(active=1).');
    else setStatus('ok', '✅ OUTPUT 실행 — <code>LOOP AT SCREEN</code>이 <code>PA_SECRET</code>의 <code>active=0</code>으로 바꾸고 <code>MODIFY SCREEN</code>으로 반영 → 필드가 숨겨졌습니다.');
  });

  render();
  setStatus('', 'pa_mode를 고르고 <b>▶ 화면 그리기</b>를 눌러, OUTPUT이 화면 속성을 어떻게 바꾸는지 보세요.');
})();
