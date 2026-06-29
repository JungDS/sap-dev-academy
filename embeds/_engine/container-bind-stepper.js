/* container-bind-stepper 엔진 — CL_GUI_CUSTOM_CONTAINER가 화면 Custom Control 영역(CONT100)을 붙잡는 과정을 단계별로 보여 준다.
   단계: ① Screen Painter 확인(영역 강조) ② PBO 실행 ③ CREATE OBJECT(go_cont initial→bound). 이름이 틀리면(CONT001) 붙지 못하고 fail.
   골격 계약: .cbs-name · [data-next] · [data-reset] · #cbsScreen · .cbs-steps · #cbsStatus.
   config: window.CBS_CFG = { area, goodName, badName, steps:[{evt,detail}], createAt }. 높이: _autoheight.js. */
(function () {
  var CFG = window.CBS_CFG || { area: 'CONT100', goodName: 'CONT100', badName: 'CONT001', steps: [], createAt: 2 };
  var name = CFG.goodName;   // 코드의 container_name
  var step = -1;             // -1=시작 전

  var nameEl = document.querySelector('.cbs-name');
  var nextBtn = document.querySelector('[data-next]');
  var resetBtn = document.querySelector('[data-reset]');
  var screenEl = document.getElementById('cbsScreen');
  var stepsEl = document.querySelector('.cbs-steps');
  var statusEl = document.getElementById('cbsStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function matched() { return name === CFG.area; }
  function reached(i) { return step >= i; }
  function created() { return reached(CFG.createAt); }

  function renderName() {
    nameEl.innerHTML = [{ v: CFG.goodName, bad: 0 }, { v: CFG.badName, bad: 1 }].map(function (o) {
      return '<button type="button" data-v="' + esc(o.v) + '"' + (o.bad ? ' data-bad="1"' : '') + ' aria-pressed="' + (o.v === name ? 'true' : 'false') + '">' + esc(o.v) + (o.bad ? ' (오타)' : '') + '</button>';
    }).join('');
  }
  function renderScreen() {
    var cls = 'cbs-rect', txt = '(빈 Custom Control 영역)';
    if (created()) {
      if (matched()) { cls += ' bound'; txt = '📊 container 연결됨 (go_cont → ' + esc(CFG.area) + ')'; }
      else { cls += ' fail'; txt = '✕ 코드가 찾는 \'' + esc(name) + '\' 없음'; }
    } else if (reached(0)) { cls += ' hl'; txt = 'Custom Control: ' + esc(CFG.area); }
    screenEl.innerHTML = '<span class="stt">화면 0100</span><div class="' + cls + '">' + txt + '</div>';
  }
  function renderSteps() {
    stepsEl.innerHTML = CFG.steps.map(function (s, i) {
      var cls = i < step ? 'done' : (i === step ? 'cur' : 'pending');
      var icon = i < step ? '✓' : (i + 1);
      var detail = s.detail;
      if (i === CFG.createAt && created()) detail = matched() ? "go_cont: initial → bound" : "실패 — 화면에 '" + name + "' 없음";
      return '<div class="cbs-step ' + cls + '"><span class="cbs-sdot">' + icon + '</span>' +
        '<div class="cbs-sbody"><div class="se">' + esc(s.evt) + '</div><div class="sd">' + esc(detail) + '</div></div></div>';
    }).join('');
  }
  function renderStatus() {
    function row(k, v, cls) { return '<div class="cbs-srow"><span class="cbs-sk">' + k + '</span><span class="cbs-sv ' + (cls || '') + '">' + v + '</span></div>'; }
    var goState;
    if (!reached(0)) goState = '<span class="muted">미선언</span>';
    else if (!created()) goState = 'initial (아직 미연결)';
    else goState = matched() ? '<span class="bound">bound ✓</span>' : '<span class="fail">실패(미연결)</span>';
    statusEl.innerHTML =
      row('화면 영역', "'" + esc(CFG.area) + "'") +
      row('container_name', "'" + esc(name) + "'" + (name === CFG.area ? '' : ' ✕'), name === CFG.area ? '' : 'fail') +
      row('go_cont', goState);
  }
  function render() {
    renderName(); renderScreen(); renderSteps(); renderStatus();
    nextBtn.disabled = step >= CFG.steps.length - 1;
    nextBtn.textContent = step < 0 ? '▶ 시작' : (step >= CFG.steps.length - 1 ? '완료' : '▶ 다음 단계');
  }

  nameEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; name = b.getAttribute('data-v'); step = -1; render(); });
  nextBtn.addEventListener('click', function () { if (step < CFG.steps.length - 1) step++; render(); });
  resetBtn.addEventListener('click', function () { step = -1; render(); });

  render();
})();
