/* inline-decl-judge 엔진 — 문장 카드를 골라 DATA() 인라인 선언이 허용되는지(문맥이 타입 제공) / 보류인지(modern SQL 경계) 판정한다.
   계산 카드는 DATA()/FINAL() 토글이 있고, FINAL()로 두면 '재대입 시도' 시 읽기 전용 오류를 보여 준다.
   골격 계약: .idj-cards · #idjDetail.
   config: window.IDJ_CFG = { cards:[{key,label,classic,modern,allowed,reason,final}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.IDJ_CFG || { cards: [] };
  var sel = 0, finalMode = false, reassign = null;

  var cardsEl = document.querySelector('.idj-cards');
  var detailEl = document.getElementById('idjDetail');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function cur() { return CFG.cards[sel]; }

  function renderCards() {
    cardsEl.innerHTML = CFG.cards.map(function (c, i) {
      return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === sel ? 'true' : 'false') + '">' +
        '<span class="cl">' + esc(c.label) + '</span><span class="vb ' + (c.allowed ? 'ok' : 'no') + '">' + (c.allowed ? '인라인 허용' : '이 챕터 보류') + '</span></button>';
    }).join('');
  }
  function renderDetail() {
    var c = cur(), h = '';
    h += '<div class="idj-code classic"><span class="lbl">classic</span>' + esc(c.classic) + '</div>';
    if (c.allowed) {
      var modern = (c.final && finalMode) ? 'FINAL(lv_max) = 100.' : c.modern;
      h += '<div class="idj-code modern"><span class="lbl">modern (inline)</span>' + esc(modern) + '</div>';
      h += '<div class="idj-verdict ok">✅ 인라인 허용 — ' + esc(c.reason) + '</div>';
    } else {
      h += '<div class="idj-code blocked"><span class="lbl">modern</span>' + esc(c.modern) + '</div>';
      h += '<div class="idj-verdict no">⏸ 이 챕터 보류 — ' + esc(c.reason) + '</div>';
    }
    // FINAL 데모(계산 카드)
    if (c.final) {
      h += '<div class="idj-final"><p class="idj-h" style="margin:0 0 7px">선언 방식</p>' +
        '<span class="idj-seg">' +
        '<button type="button" data-mode="0" aria-pressed="' + (!finalMode ? 'true' : 'false') + '">DATA() 재대입 가능</button>' +
        '<button type="button" data-mode="1" aria-pressed="' + (finalMode ? 'true' : 'false') + '">FINAL() 읽기전용</button>' +
        '</span>' +
        '<button type="button" class="idj-reassign" data-reassign>재대입 시도 (= 200)</button>';
      if (reassign !== null) {
        if (reassign === 'final') h += '<div class="idj-err bad">🚫 <code>FINAL()</code>로 선언된 변수는 <b>재대입 불가</b> — 한 번 받은 값의 의미를 보호합니다.</div>';
        else h += '<div class="idj-err ok">✅ <code>DATA()</code> 변수는 재대입 가능 — <code>lv_total = 200</code> 정상.</div>';
      }
      h += '</div>';
    }
    detailEl.innerHTML = h;
  }
  function render() { renderCards(); renderDetail(); }

  cardsEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sel = +b.getAttribute('data-i'); reassign = null; render(); });
  detailEl.addEventListener('click', function (e) {
    var m = e.target.closest('[data-mode]');
    if (m) { finalMode = m.getAttribute('data-mode') === '1'; reassign = null; render(); return; }
    if (e.target.closest('[data-reassign]')) { reassign = finalMode ? 'final' : 'data'; render(); }
  });

  render();
})();
