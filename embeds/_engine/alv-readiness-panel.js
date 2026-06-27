/* alv-readiness-panel 엔진 — 컨테이너→그리드를 단계로 만들고, "표가 아직 안 보이는 이유"를 준비 체크리스트로 보여 준다.
   go_cont / go_grid는 단계 진행으로 ready, lt_booking·lt_fcat·display는 이 레슨에선 계속 비어 있음(pending) → 그래서 표가 안 보이는 게 정상.
   i_parent를 비우면 그리드 생성이 fail(연결 깨짐).
   골격 계약: .arp-parent · [data-next] · [data-reset] · .arp-steps · #arpCheck · #arpMsg.
   config: window.ARP_CFG = { steps:[{evt,detail}], checks:[{key,label,readyAt,pending}], gridAt }. 높이: _autoheight.js. */
(function () {
  var CFG = window.ARP_CFG || { steps: [], checks: [], gridAt: 1 };
  var step = -1;
  var parentOk = true;   // i_parent = go_cont (true) vs 비움(false)

  var parentEl = document.querySelector('.arp-parent');
  var nextBtn = document.querySelector('[data-next]');
  var resetBtn = document.querySelector('[data-reset]');
  var stepsEl = document.querySelector('.arp-steps');
  var checkEl = document.getElementById('arpCheck');
  var msgEl = document.getElementById('arpMsg');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function reached(i) { return step >= i; }
  function gridFail() { return reached(CFG.gridAt) && !parentOk; }

  function renderParent() {
    parentEl.innerHTML = [{ v: 1, l: 'i_parent = go_cont', bad: 0 }, { v: 0, l: 'i_parent 비움', bad: 1 }].map(function (o) {
      return '<button type="button" data-v="' + o.v + '"' + (o.bad ? ' data-bad="1"' : '') + ' aria-pressed="' + ((o.v === 1) === parentOk ? 'true' : 'false') + '">' + esc(o.l) + '</button>';
    }).join('');
  }
  function renderSteps() {
    stepsEl.innerHTML = CFG.steps.map(function (s, i) {
      var fail = i === CFG.gridAt && gridFail();
      var cls = fail ? 'fail' : (i < step ? 'done' : (i === step ? 'cur' : 'pending'));
      var icon = fail ? '✕' : (i < step ? '✓' : (i + 1));
      var detail = s.detail;
      if (i === CFG.gridAt && reached(CFG.gridAt)) detail = parentOk ? 'go_grid: initial → ready' : '실패 — i_parent가 initial(연결 깨짐)';
      return '<div class="arp-step ' + cls + '"><span class="arp-sdot">' + icon + '</span>' +
        '<div class="arp-sbody"><div class="se">' + esc(s.evt) + '</div><div class="sd">' + esc(detail) + '</div></div></div>';
    }).join('');
  }
  function renderCheck() {
    checkEl.innerHTML = CFG.checks.map(function (c) {
      var st, cls, mark;
      if (c.pending) { st = '비어 있음'; cls = 'pending'; mark = '⬚'; }
      else if (c.key === 'go_grid' && gridFail()) { st = '실패'; cls = 'fail'; mark = '✕'; }
      else if (reached(c.readyAt)) { st = 'ready'; cls = 'ready'; mark = '✓'; }
      else { st = '미생성'; cls = ''; mark = ''; }
      return '<div class="arp-cr ' + cls + '"><span class="arp-ci">' + mark + '</span><span class="ck">' + esc(c.label) + '</span><span class="cs">' + st + '</span></div>';
    }).join('');
  }
  function renderMsg() {
    if (!reached(CFG.gridAt)) { msgEl.className = ''; msgEl.innerHTML = '<b>▶ 다음 단계</b>로 컨테이너와 그리드를 만들어 보세요.'; return; }
    if (gridFail()) { msgEl.className = 'bad'; msgEl.innerHTML = '🚫 <code>i_parent</code>가 initial — 그리드를 화면 영역에 붙일 수 없습니다. <code>go_cont</code>를 넘기세요.'; return; }
    msgEl.className = 'ok';
    msgEl.innerHTML = '✅ 그리드 생성됨 — 하지만 <b>표는 아직 안 보입니다.</b> <code>lt_booking</code>(데이터)·<code>lt_fcat</code>(Field Catalog)·<code>display</code>가 비어 있어서입니다. <b>실패가 아니라 정상</b> — 다음 레슨들에서 채웁니다.';
  }
  function render() {
    renderParent(); renderSteps(); renderCheck(); renderMsg();
    nextBtn.disabled = step >= CFG.steps.length - 1;
    nextBtn.textContent = step < 0 ? '▶ 시작' : (step >= CFG.steps.length - 1 ? '완료' : '▶ 다음 단계');
  }

  parentEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; parentOk = b.getAttribute('data-v') === '1'; render(); });
  nextBtn.addEventListener('click', function () { if (step < CFG.steps.length - 1) step++; render(); });
  resetBtn.addEventListener('click', function () { step = -1; render(); });

  render();
})();
