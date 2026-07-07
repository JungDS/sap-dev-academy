/* pbo-prep-stepper 엔진 — Dynpro PBO를 한 단계씩 진행한다: PBO 시작 → SET PF-STATUS → SET TITLEBAR →
   LOOP AT SCREEN(GV_SEATS 발견, 잠금이면 input='0' 대기) → MODIFY SCREEN(반영) → 화면 표시.
   핵심: MODIFY SCREEN 단계 전에는 gs_screen-input을 바꿔도 미리보기가 읽기 전용이 되지 않는다(대기 vs 반영).
   골격 계약: .pps-lock · [data-next] · [data-reset] · .pps-steps · #ppsStatus · #ppsPreview.
   config: window.PPS_CFG = { steps:[{evt,detail}], modifyAt }. 높이: _autoheight.js. */
(function () {
  var CFG = window.PPS_CFG || { steps: [], modifyAt: 4 };
  var STEPS = CFG.steps;
  var locked = false;   // gv_locked
  var step = -1;        // -1=시작 전, 0..STEPS.length-1

  var lockEl = document.querySelector('.pps-lock');
  var nextBtn = document.querySelector('[data-next]');
  var resetBtn = document.querySelector('[data-reset]');
  var stepsEl = document.querySelector('.pps-steps');
  var statusEl = document.getElementById('ppsStatus');
  var previewEl = document.getElementById('ppsPreview');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  // 단계 인덱스 도달 여부
  function reached(i) { return step >= i; }

  function renderLock() {
    lockEl.innerHTML = [{ v: 0, l: "gv_locked ' '" }, { v: 1, l: "gv_locked 'X'" }].map(function (o) {
      return '<button type="button" data-v="' + o.v + '" aria-pressed="' + ((o.v === 1) === locked ? 'true' : 'false') + '">' + esc(o.l) + '</button>';
    }).join('');
  }
  function renderSteps() {
    stepsEl.innerHTML = STEPS.map(function (s, i) {
      var cls = i < step ? 'done' : (i === step ? 'cur' : 'pending');
      var icon = i < step ? '✓' : (i + 1);
      var detail = s.detail;
      if (i === CFG.loopAt && locked && reached(CFG.loopAt)) detail = "GV_SEATS 발견 → gs_screen-input='0' (대기)";
      return '<div class="pps-step ' + cls + '"><span class="pps-sdot">' + icon + '</span>' +
        '<div class="pps-sbody"><div class="se">' + esc(s.evt) + '</div><div class="sd">' + esc(detail) + '</div></div></div>';
    }).join('');
  }
  function renderStatus() {
    var dynnr = reached(0) ? '0100' : '—';
    var pfkey = reached(1) ? 'ST100' : '—';
    var title = reached(2) ? '예매 입력' : '—';
    var inputVal;
    if (!locked) inputVal = "1 (입력 가능)";
    else if (!reached(CFG.loopAt)) inputVal = "1 (기본)";
    else if (step < CFG.modifyAt) inputVal = "<span class='pend'>0 (대기 · 미반영)</span>";
    else inputVal = "<span class='appl'>0 (반영 · 읽기전용)</span>";
    statusEl.innerHTML =
      '<div class="pps-srow"><span class="pps-sk">sy-dynnr</span><span class="pps-sv">' + dynnr + '</span></div>' +
      '<div class="pps-srow"><span class="pps-sk">sy-pfkey</span><span class="pps-sv">' + pfkey + '</span></div>' +
      '<div class="pps-srow"><span class="pps-sk">sy-title</span><span class="pps-sv">' + title + '</span></div>' +
      '<div class="pps-srow"><span class="pps-sk">GV_SEATS input</span><span class="pps-sv">' + inputVal + '</span></div>';
  }
  function renderPreview() {
    var ro = locked && reached(CFG.modifyAt);   // MODIFY SCREEN 반영 후에만 읽기전용
    var phase = reached(CFG.showAt) ? '표시됨' : 'PBO 처리 중';
    previewEl.innerHTML = '<div class="ptitle">화면 0100 · 예매 입력 <small style="font-weight:600;color:#64748b">(' + phase + ')</small></div>' +
      '<div class="pps-pfld"><span class="pl">공연ID</span><span class="pps-pin">C001</span></div>' +
      '<div class="pps-pfld"><span class="pl">좌석수</span><span class="pps-pin ' + (ro ? 'ro' : '') + '">' + (ro ? '2 (읽기전용)' : '2') + '</span></div>' +
      '<div class="pps-pfld"><span class="pps-pbtn">예매</span></div>';
  }
  function render() {
    renderLock(); renderSteps(); renderStatus(); renderPreview();
    nextBtn.disabled = step >= STEPS.length - 1;
    nextBtn.textContent = step < 0 ? '▶ PBO 시작' : (step >= STEPS.length - 1 ? '완료' : '▶ 다음 단계');
  }

  lockEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; locked = b.getAttribute('data-v') === '1'; step = -1; render(); });
  nextBtn.addEventListener('click', function () { if (step < STEPS.length - 1) step++; render(); });
  resetBtn.addEventListener('click', function () { step = -1; render(); });

  render();
})();
