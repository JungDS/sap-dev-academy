/* timeline-boundary 엔진 — 커리큘럼 타임라인으로 '지금 배울 것(클래식 DDIC View)'과 '나중에 배울 것(CDS·RAP)'의 경계를 보여 준다.
   필터로 지금/나중을 강조하고, 나중 카드를 누르면 어느 챕터에서 배우는지 안내(경계 위반 방지).
   골격 계약: .tb-filter · #tbCards · #tbStatus.
   config: window.TB_CFG = { stages:[{ch,title,when:'done'|'now'|'later',desc}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.TB_CFG || { stages: [] };
  var filter = 'now';   // now | later
  var cardsEl = document.getElementById('tbCards');
  var filterEl = document.querySelector('.tb-filter');
  var statusEl = document.getElementById('tbStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  var BADGE = { done: '배움', now: '지금', later: '나중' };

  function renderCards() {
    var firstLater = CFG.stages.findIndex(function (s) { return s.when === 'later'; });
    var html = '';
    CFG.stages.forEach(function (s, i) {
      if (i === firstLater) html += '<div class="tb-gate"><span>경계</span></div>';
      else if (i > 0) html += '<div class="tb-arrow">▸</div>';
      var dim = (filter === 'now' && s.when === 'later') || (filter === 'later' && s.when !== 'later');
      html += '<div class="tb-card ' + s.when + (dim ? ' dim' : '') + '" data-i="' + i + '">' +
        '<span class="badge">' + BADGE[s.when] + '</span>' +
        '<div class="ch">' + esc(s.ch) + '</div><div class="ti">' + esc(s.title) + '</div><div class="ds">' + esc(s.desc) + '</div></div>';
    });
    cardsEl.innerHTML = html;
  }
  function renderFilter() {
    filterEl.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === filter ? 'true' : 'false'); });
  }
  function render() { renderFilter(); renderCards(); }

  filterEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    filter = b.getAttribute('data-v'); render();
    statusEl.className = 'tb-status';
    statusEl.innerHTML = filter === 'now'
      ? '<b>지금</b>은 클래식 DDIC View와 표준 유지보수 흐름이 목표입니다. 이 기초 감각은 CDS를 배울 때도 그대로 쓰입니다.'
      : '<b>나중</b> 카드는 이름과 방향만 예고합니다. 코드와 실습은 해당 챕터에서 다룹니다(학습 부하 줄이기).';
  });
  cardsEl.addEventListener('click', function (e) {
    var c = e.target.closest('.tb-card'); if (!c) return;
    var s = CFG.stages[+c.getAttribute('data-i')];
    if (s.when === 'later') { statusEl.className = 'tb-status later'; statusEl.innerHTML = '🔒 <b>' + esc(s.title) + '</b>은 <b>' + esc(s.ch) + '</b>에서 배웁니다. 지금 끌어오면 핵심을 놓칩니다 — 미래 개념은 한 문장 예고까지만.'; }
    else if (s.when === 'now') { statusEl.className = 'tb-status'; statusEl.innerHTML = '✅ <b>' + esc(s.title) + '</b> — 지금 이 챕터의 학습 대상입니다. (' + esc(s.desc) + ')'; }
    else { statusEl.className = 'tb-status'; statusEl.innerHTML = '✔ <b>' + esc(s.title) + '</b> — 이미 배운 단계입니다. (' + esc(s.desc) + ')'; }
  });

  render();
  statusEl.innerHTML = '카드를 눌러 무엇을 <b>지금</b> 배우고 무엇을 <b>나중</b>에 배우는지 확인하세요.';
})();
