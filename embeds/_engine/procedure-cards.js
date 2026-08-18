// ===== procedure-cards 엔진 JS — 트랜잭션 절차 따라 하기 스텝 카드 (범용) =====
// SE11 객체 생성처럼 "화면 절차"를 단계 카드로 밟아 보는 체험. 칩(단계) 클릭/이전·다음 이동,
// 지나간 단계는 done 표시. 데이터 = window.PC_CFG(인스턴스 주입 — 엔진에 레슨 데이터 없음).
// PC_CFG = { steps:[{ k(칩 라벨), t(제목), d(설명 html), mock(화면 흉내 html·선택) }..], done(완주 html·선택) }
(function () {
  var cfg = window.PC_CFG; if (!cfg) return;
  var root = document.querySelector('[data-pc]'); if (!root) return;
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  var cur = 0, seen = 0; // seen = 지금까지 도달한 최대 단계
  var n = cfg.steps.length;

  function render() {
    if (cur > seen) seen = cur;
    var chips = cfg.steps.map(function (s, i) {
      var cls = i === cur ? 'on' : (i < seen || i < cur ? 'done' : '');
      return '<button type="button" class="pc-chip ' + cls + '" data-i="' + i + '"><span class="n">' + (i + 1) + '</span>' + esc(s.k) + '</button>';
    }).join('<span class="pc-arrow">→</span>');
    var s = cfg.steps[cur];
    var panel = '<div class="pc-panel"><div class="pc-panel__no">STEP ' + (cur + 1) + ' / ' + n + '</div>' +
      '<div class="pc-panel__t">' + esc(s.t) + '</div><div class="pc-panel__d">' + s.d + '</div>' +
      (s.mock ? '<div class="pc-mock">' + s.mock + '</div>' : '') + '</div>';
    var doneBox = (cur === n - 1 && cfg.done) ? '<div class="pc-done">' + cfg.done + '</div>' : '';
    var nav = '<div class="pc-nav">' +
      '<button type="button" class="pc-btn" data-prev' + (cur === 0 ? ' disabled' : '') + '>← 이전</button>' +
      '<button type="button" class="pc-btn primary" data-next' + (cur === n - 1 ? ' disabled' : '') + '>다음 단계 →</button></div>';
    root.innerHTML = '<div class="pc-chips">' + chips + '</div>' + panel + doneBox + nav;
  }

  root.addEventListener('click', function (e) {
    var c = e.target.closest('.pc-chip');
    if (c) { cur = +c.dataset.i; render(); return; }
    if (e.target.closest('[data-prev]') && cur > 0) { cur--; render(); return; }
    if (e.target.closest('[data-next]') && cur < n - 1) { cur++; render(); }
  });

  render();
})();
