/* ===== type-borrow-lab 엔진 JS — 선언 2축 실험(모양을 어디서 빌려 오나 × 몇 건을 담나) =====
   ① 모양 출처 세그(로컬 타입 ↔ DB 테이블) → 필드 구성이 바뀐다(딸려 오는 필드는 .extra로 표시)
   ② 개수 세그(TYPE ↔ TYPE TABLE OF) → 한 건 ↔ 여러 건으로 갈린다(변수 이름도 함께)
   고른 조합으로 DATA 선언 한 줄을 만들고, 그 변수가 메모리에 잡히는 모양을 그린다. 판정은 항상 표시.
   설정 = window.TBLAB_CFG {
     hd, lead, srcLabel, cntLabel,
     sources:[{key, btn, type, fields:[{n, extra?}], note?}],
     counts:[{key, btn, kw, varName, rows, cmt, shapeCap}],
     verdict, caution:{<sourceKey>: html}   // caution = 그 출처를 골랐을 때만 덧붙는 주의(신뢰된 HTML)
   }
   ⚠️ 조각 엔진 — .wrap/.hd/.lead/.note는 주 엔진 CSS 몫(호스트 위젯의 data-eng는 주 엔진 유지). */
(function () {
  var cfg = window.TBLAB_CFG; if (!cfg) return;
  var root = document.querySelector('[data-tb]'); if (!root) return;
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var sources = cfg.sources || [], counts = cfg.counts || [];
  var srcKey = sources.length ? sources[0].key : '', cntKey = counts.length ? counts[0].key : '';
  function pick(list, key) { for (var i = 0; i < list.length; i++) { if (list[i].key === key) return list[i]; } return list[0]; }

  function seg(axisLabel, list, curKey, attr) {
    var h = '<div class="tb-axis"><span class="tb-axis__lab">' + esc(axisLabel) + '</span><div class="tb-seg">';
    list.forEach(function (o) {
      h += '<button type="button" class="tb-seg__b' + (o.key === curKey ? ' on' : '') + '" '
        + attr + '="' + esc(o.key) + '">' + esc(o.btn) + '</button>';
    });
    return h + '</div></div>';
  }

  function render() {
    var s = pick(sources, srcKey), c = pick(counts, cntKey);
    var h = '';
    if (cfg.hd) h += '<p class="tb-hd">' + cfg.hd + '</p>';
    if (cfg.lead) h += '<p class="tb-lead">' + cfg.lead + '</p>';
    h += seg(cfg.srcLabel || '모양 출처', sources, srcKey, 'data-src');
    h += seg(cfg.cntLabel || '담는 개수', counts, cntKey, 'data-cnt');

    // 만들어진 선언 한 줄
    h += '<code class="tb-decl">DATA <b>' + esc(c.varName) + '</b> ' + esc(c.kw) + ' <b>' + esc(s.type) +
         '</b>.' + (c.cmt ? '   <span class="cmt">" ' + esc(c.cmt) + '</span>' : '') + '</code>';

    // 메모리에 잡히는 모양
    var fields = s.fields || [];
    h += '<div class="tb-shape"><div class="tb-shape__cap">' + esc(c.shapeCap || '메모리에 잡히는 모양') +
         ' — 필드 <span class="n">' + fields.length + '개</span></div><div class="tb-rows">';
    var many = (c.rows || 1) > 1, draw = Math.min(c.rows || 1, 3);
    for (var i = 0; i < draw; i++) {
      // 여러 건일 때 라벨은 '1행·2행…' — gt[ ] 같은 표기는 뒤 챕터 문법이라 쓰지 않는다(R6 게이팅)
      h += '<div class="tb-row"><span class="tb-row__n">' + (many ? (i + 1) + '행' : esc(c.varName)) +
           '</span><span class="tb-cells">';
      fields.forEach(function (f) { h += '<i' + (f.extra ? ' class="extra"' : '') + '>' + esc(f.n) + '</i>'; });
      h += '</span></div>';
    }
    if ((c.rows || 1) > draw) h += '<div class="tb-etc">⋮ 같은 모양으로 계속 쌓인다</div>';
    h += '</div></div>';

    // 판정 — 어느 조합이든 메모리라는 사실 + 출처별 주의
    h += '<div class="tb-verdict">' + (cfg.verdict || '');
    var caution = (cfg.caution || {})[s.key];
    if (caution) h += '<span class="caution">' + caution + '</span>';
    h += '</div>';
    root.innerHTML = h;
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-src]');
    if (b) { srcKey = b.getAttribute('data-src'); render(); return; }
    b = e.target.closest('[data-cnt]');
    if (b) { cntKey = b.getAttribute('data-cnt'); render(); }
  });
  render();
})();
