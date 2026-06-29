/* legacy-event-reader 엔진 — 기존 리포트 3종(LDB연결 / 일반SELECT / END분리)을 골라 END-OF-SELECTION의
   호출 위치·출력 위치·공식문서 경고 배지를 비교 독해한다. 비-LDB 신규 리포트에서 END를 '필수'로 보면 경고.
   골격 계약: .ler-scen · #lerBadge · .ler-timeline · #lerMap · #lerVerdict · .ler-judge input · #lerStatus.
   config: window.LER_CFG = { scenarios:[{key,label,ldb,timeline:[{t,d,fire,ldb}],selectAt,displayAt,badge,desc}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.LER_CFG || { scenarios: [] };
  var idx = 0;
  var scenEl = document.querySelector('.ler-scen');
  var badgeEl = document.getElementById('lerBadge');
  var timeEl = document.querySelector('.ler-timeline');
  var mapEl = document.getElementById('lerMap');
  var verdictEl = document.getElementById('lerVerdict');
  var judgeEl = document.querySelector('.ler-judge input');
  var statusEl = document.getElementById('lerStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function cur() { return CFG.scenarios[idx]; }

  function renderScen() {
    scenEl.innerHTML = CFG.scenarios.map(function (s, i) {
      return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === idx ? 'true' : 'false') + '">' + esc(s.label) + '</button>';
    }).join('');
  }
  function renderBadge() {
    var s = cur();
    if (s.badge) { badgeEl.className = 'warn'; badgeEl.innerHTML = esc(s.badge); }
    else { badgeEl.className = 'ok'; badgeEl.innerHTML = '✔ 공식 경고 없음 — Logical Database 없이 직접 SELECT하는 일반 리포트'; }
  }
  function renderTimeline() {
    var s = cur();
    timeEl.innerHTML = s.timeline.map(function (st) {
      var cls = 'ler-step' + (st.fire ? ' fire' : '') + (st.ldb ? ' ldb' : '');
      return '<div class="' + cls + '"><span class="ler-dot"></span><span class="ler-evt">' + esc(st.t) +
        (st.fire ? '<span class="ler-fire-tag">표시</span>' : '') +
        '<small>' + esc(st.d) + '</small></span></div>';
    }).join('');
  }
  function renderMap() {
    var s = cur();
    mapEl.innerHTML =
      '<div class="ler-card"><div class="k">조회(SELECT) 위치</div><div class="v">' + esc(s.selectAt) + '</div></div>' +
      '<div class="ler-card"><div class="k">표시(ALV) 위치</div><div class="v">' + esc(s.displayAt) + '</div></div>';
  }
  function renderVerdict() {
    var s = cur();
    verdictEl.innerHTML = '신규 단순 리포트의 <b>필수</b> 이벤트인가? → <b>' +
      (s.ldb ? '아니오 — LDB(legacy) 전용 패턴' : '아니오 — START 직후 그냥 지나가도 됨') + '</b>';
  }
  function renderStatus() {
    var s = cur();
    if (judgeEl.checked) {
      statusEl.className = 'warn';
      statusEl.innerHTML = '🚫 필수 아님 — 공식문서: <code>LDB가 없으면 END-OF-SELECTION을 구현할 필요가 없다</code>. ' +
        '신규(비-LDB) 리포트에서 표준처럼 강요하지 말고, <b>기존 코드 독해용</b>으로만 유지하세요.';
      return;
    }
    statusEl.className = 'read';
    statusEl.innerHTML = '📖 독해 결론 — ' + esc(s.desc);
  }
  function render() { renderScen(); renderBadge(); renderTimeline(); renderMap(); renderVerdict(); renderStatus(); }

  scenEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    idx = +b.getAttribute('data-i'); render();
  });
  judgeEl.addEventListener('change', renderStatus);

  render();
})();
