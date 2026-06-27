/* inline-target-viewer 엔진 — SELECT list와 target 선언 형태를 바꾸며 결과 internal table의 행 구조를 본다.
   @DATA( )가 만드는 표는 standard table·empty key이고, 계산 컬럼엔 AS 별칭이 있어야 행 구조가 또렷해진다.
   골격 계약: .itv-list(세그) · .itv-tgt(세그) · #itvCode · #itvShape · #itvVerdict.
   config: window.ITV_CFG = { table, lists:[{v,label,sql,cols,alias}], targets:[{v,label,form,verdict}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.ITV_CFG;
  var list = CFG.lists[0].v, tgt = CFG.targets[0].v;

  var listEl = document.querySelector('.itv-list');
  var tgtEl = document.querySelector('.itv-tgt');
  var codeEl = document.getElementById('itvCode');
  var shapeEl = document.getElementById('itvShape');
  var verEl = document.getElementById('itvVerdict');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function curList() { for (var i = 0; i < CFG.lists.length; i++) if (CFG.lists[i].v === list) return CFG.lists[i]; }
  function curTgt() { for (var i = 0; i < CFG.targets.length; i++) if (CFG.targets[i].v === tgt) return CFG.targets[i]; }

  function renderSeg(host, items, active) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + h(it.l) + '</button>';
    }).join('');
  }

  function tgtHtml(t) {
    if (t.verdict === 'badEscape') return '<span class="bad">' + h(t.form) + '</span>';
    return '<span class="esc">' + h(t.form) + '</span>';
  }
  function listSqlHtml(l) {
    // AS 별칭 강조
    return h(l.sql).replace(/AS\s+\w+/g, function (m) { return '<span class="as">' + m + '</span>'; });
  }

  function renderCode() {
    var l = curList(), t = curTgt();
    codeEl.innerHTML =
      'SELECT ' + listSqlHtml(l) + '\n' +
      '  FROM ' + CFG.table + '\n' +
      '  WHERE carrid = @lv_carr\n' +
      '  INTO TABLE ' + tgtHtml(t) + '.';
  }

  function renderShape() {
    var l = curList();
    var chips = l.cols.map(function (c) {
      var noname = c.indexOf('?') >= 0 || c.indexOf('이름') >= 0;
      return '<span class="itv-chip' + (noname ? ' noname' : '') + '">' + h(c) + '</span>';
    }).join('');
    shapeEl.innerHTML =
      '<div class="cap">결과 <code>lt_flight</code> 한 행의 컴포넌트</div>' +
      '<div class="itv-chips">' + chips + '</div>' +
      '<div class="itv-kind">표 종류 — <b>Standard Table · Empty Key</b> (인라인 target은 항상 이 형태). 키로 자주 읽어야 하면 타입을 직접 선언하세요.</div>';
  }

  function renderVerdict() {
    var l = curList(), t = curTgt();
    // 1순위: target 형태 오류(@DATA vs DATA)
    if (t.verdict === 'badEscape') {
      verEl.className = 'bad';
      verEl.innerHTML = '🚫 <b>SQL 안에선 <code>@DATA( )</code></b> — <code>DATA( )</code>는 ABAP 문장용(지난 챕터). SELECT의 target은 host 자리라 <code>@</code>가 붙습니다.';
      return;
    }
    if (t.verdict === 'existing') {
      verEl.className = 'info';
      verEl.innerHTML = 'ℹ️ <b>기존 변수 재사용</b> — 이미 선언된 <code>lt_flight</code>에 받을 땐 <code>@DATA( )</code>가 아니라 <code>@lt_flight</code>. <code>@DATA( )</code>는 <b>새로 선언</b>할 때만.';
      return;
    }
    // target ok(@DATA 새 선언) → list 별칭 점검
    if (l.alias === 'missing') {
      verEl.className = 'bad';
      verEl.innerHTML = '🚫 <b>계산 컬럼에 이름이 없음</b> — <code>seatsmax - seatsocc</code> 결과 컬럼에 이름이 없어 행 구조가 흐릿합니다. <code>AS seats_free</code>처럼 <b>별칭</b>을 붙이세요.';
      return;
    }
    verEl.className = 'ok';
    if (l.alias === 'ok') verEl.innerHTML = '✅ <b>별칭으로 또렷한 행 구조</b> — 계산 컬럼 <code>seats_free</code>까지 이름이 있어, <code>@DATA( )</code>가 만든 표의 컴포넌트가 분명합니다.';
    else verEl.innerHTML = '✅ <b>새 결과 표를 SELECT 자리에서 선언</b> — 고른 컬럼 구조에 맞는 standard table이 자동으로 만들어집니다.';
  }

  function render() {
    renderSeg(listEl, CFG.lists.map(function (l) { return { v: l.v, l: l.label }; }), list);
    renderSeg(tgtEl, CFG.targets.map(function (t) { return { v: t.v, l: t.label }; }), tgt);
    renderCode(); renderShape(); renderVerdict();
  }

  listEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; list = b.getAttribute('data-v'); render(); });
  tgtEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; tgt = b.getAttribute('data-v'); render(); });

  render();
})();
