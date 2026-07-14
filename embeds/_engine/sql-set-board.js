/* sql-set-board 엔진 — 두 결과 집합(A=전체 공연, B=예약 있는 공연)에 집합 연산자를 적용하고 벤다이어그램으로 A만/교집합/B만을 색으로 강조한다.
   버튼: UNION(중복 제거) · UNION ALL(중복 유지) · INTERSECT · EXCEPT · 좌우 바꾸기(EXCEPT 방향 전환).
   골격 계약(HTML 제공): .ssb(컨테이너, 엔진이 내부를 렌더).
   config: window.SQL_SET_BOARD_CFG = { left, right:{code,title,select,rows:[{id,name}]}, ops:[{key,label,badge,kind:union|intersect|except,dedup,msg,msgSwap}], swapWarn }.
   상태: opKey · swapped · leftSet · rightSet · duplicatePolicy(distinct/all) · resultRows. 높이: 자체 post(). */
(function () {
  var CFG = window.SQL_SET_BOARD_CFG || { left: { rows: [] }, right: { rows: [] }, ops: [] };
  var root = document.querySelector('.ssb');
  if (!root) return;

  var A = CFG.left, B = CFG.right;
  var Aids = A.rows.map(function (r) { return r.id; });
  var Bids = B.rows.map(function (r) { return r.id; });
  var inA = {}, inB = {};
  A.rows.forEach(function (r) { inA[r.id] = 1; });
  B.rows.forEach(function (r) { inB[r.id] = 1; });

  var state = {
    opKey: (CFG.ops[0] || {}).key,
    swapped: false,
    leftSet: 'left',
    rightSet: 'right',
    duplicatePolicy: 'distinct',
    resultRows: []
  };

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function opDef() { for (var i = 0; i < CFG.ops.length; i++) if (CFG.ops[i].key === state.opKey) return CFG.ops[i]; return CFG.ops[0] || {}; }
  function catOf(id) { if (inA[id] && inB[id]) return 'i'; if (inA[id]) return 'a'; return 'b'; }
  function dedup(arr) { var seen = {}, out = []; arr.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } }); return out; }

  // 현재 왼/오른쪽 피연산자(좌우 바꾸기 반영)
  function sides() {
    return state.swapped
      ? { L: B, R: A, Lids: Bids, Rids: Aids, Lside: 'b', Rside: 'a' }
      : { L: A, R: B, Lids: Aids, Rids: Bids, Lside: 'a', Rside: 'b' };
  }

  function compute() {
    var op = opDef(), s = sides(), res;
    if (op.kind === 'union') {
      var all = s.Lids.concat(s.Rids);
      res = op.dedup ? dedup(all) : all.slice();
    } else if (op.kind === 'intersect') {
      var rs = {}; s.Rids.forEach(function (id) { rs[id] = 1; });
      res = dedup(s.Lids.filter(function (id) { return rs[id]; }));
    } else { // except
      var rs2 = {}; s.Rids.forEach(function (id) { rs2[id] = 1; });
      res = dedup(s.Lids.filter(function (id) { return !rs2[id]; }));
    }
    state.resultRows = res;
    state.duplicatePolicy = (op.kind === 'union' && !op.dedup) ? 'all' : 'distinct';
    return res;
  }

  function setCard(def, side) {
    var rows = def.rows.map(function (r) {
      return '<span class="ssb-row cat-' + catOf(r.id) + '">' + esc(r.id) + '<small>' + esc(r.name) + '</small></span>';
    }).join('');
    return '<div class="ssb-set side-' + side + '">' +
      '<div class="st"><span class="tt">' + esc(def.title) + '</span><span class="tag">' + esc(def.code) + '</span></div>' +
      '<div class="sql">' + esc(def.select) + '</div>' +
      '<div class="ssb-rows">' + rows + '</div></div>';
  }

  function opsBar() {
    var h = CFG.ops.map(function (o) {
      return '<button type="button" data-op="' + o.key + '" aria-pressed="' + (o.key === state.opKey ? 'true' : 'false') + '">' +
        '<span>' + esc(o.label) + '</span><span class="bdg">' + esc(o.badge) + '</span></button>';
    }).join('');
    h += '<button type="button" class="ssb-swap" data-swap aria-pressed="' + (state.swapped ? 'true' : 'false') + '">' +
      '<span aria-hidden="true">⇄</span> 좌우 바꾸기</button>';
    return h;
  }

  function sqlText() {
    var op = opDef(), s = sides();
    var operator = op.kind === 'union' ? (op.dedup ? 'UNION' : 'UNION ALL')
      : op.kind === 'intersect' ? 'INTERSECT' : 'EXCEPT';
    return esc(s.L.select) + '\n<b>' + operator + '</b>\n' + esc(s.R.select) + '.';
  }

  function venn() {
    var cats = {}; state.resultRows.forEach(function (id) { cats[catOf(id)] = 1; });
    var aOn = cats.a ? 'on' : 'off', iOn = cats.i ? 'on' : 'off', bOn = cats.b ? 'on' : 'off';
    var aCount = Aids.filter(function (id) { return catOf(id) === 'a'; }).length;
    var iCount = Aids.filter(function (id) { return catOf(id) === 'i'; }).length;
    var bCount = Bids.filter(function (id) { return catOf(id) === 'b'; }).length;
    return '<svg class="ssb-venn" viewBox="0 0 300 168" role="img" aria-label="두 집합의 벤다이어그램">' +
      '<circle class="ssb-rg cat-a ' + aOn + '" cx="110" cy="92" r="60"/>' +
      '<circle class="ssb-rg cat-b ' + bOn + '" cx="190" cy="92" r="60"/>' +
      '<clipPath id="ssbClipA"><circle cx="110" cy="92" r="60"/></clipPath>' +
      '<circle class="ssb-rg cat-i ' + iOn + '" cx="190" cy="92" r="60" clip-path="url(#ssbClipA)"/>' +
      '<circle class="ol" cx="110" cy="92" r="60"/><circle class="ol" cx="190" cy="92" r="60"/>' +
      '<text class="cap cap-a" x="74" y="22" text-anchor="middle">A · ' + esc(A.code) + '</text>' +
      '<text class="cap cap-b" x="226" y="22" text-anchor="middle">B · ' + esc(B.code) + '</text>' +
      '<text class="rc" x="74" y="96" text-anchor="middle">' + aCount + '</text>' +
      '<text class="rl" x="74" y="110" text-anchor="middle">A만</text>' +
      '<text class="rc" x="150" y="96" text-anchor="middle">' + iCount + '</text>' +
      '<text class="rl" x="150" y="110" text-anchor="middle">교집합</text>' +
      '<text class="rc" x="226" y="96" text-anchor="middle">' + bCount + '</text>' +
      '<text class="rl" x="226" y="110" text-anchor="middle">B만</text>' +
      '</svg>';
  }

  function outRows() {
    var counts = {};
    var chips = state.resultRows.map(function (id) {
      counts[id] = (counts[id] || 0) + 1;
      var dup = counts[id] > 1;
      return '<span class="ssb-chip cat-' + catOf(id) + (dup ? ' dup' : '') + '">' + esc(id) +
        (dup ? '<span class="dm">중복</span>' : '') + '</span>';
    }).join('');
    return '<div class="ssb-out"><span class="ssb-count">결과 ' + state.resultRows.length + '행</span>' + chips + '</div>';
  }

  function feedbackHtml() {
    var op = opDef();
    var msg = (op.kind === 'except' && state.swapped && op.msgSwap) ? op.msgSwap : op.msg;
    var h = '<div class="ssb-fb">' + (msg || '') + '</div>';
    if (op.kind === 'except' && state.swapped && CFG.swapWarn) {
      h += '<div class="ssb-warn"><span aria-hidden="true">⚠️</span><span>' + CFG.swapWarn + '</span></div>';
    }
    return h;
  }

  function render() {
    compute();
    var s = sides();
    root.innerHTML =
      '<div class="ssb-sets">' + setCard(s.L, s.Lside) + setCard(s.R, s.Rside) + '</div>' +
      '<div class="ssb-ops">' + opsBar() + '</div>' +
      '<div class="ssb-result">' +
        venn() +
        '<div class="ssb-legend"><span><i class="sa"></i>A만</span><span><i class="si"></i>교집합</span><span><i class="sb"></i>B만</span></div>' +
        '<p class="ssb-title">실행 SQL</p>' +
        '<div class="ssb-sql">' + sqlText() + '</div>' +
        outRows() +
        feedbackHtml() +
      '</div>';
    post();
  }

  root.addEventListener('click', function (e) {
    var op = e.target.closest('[data-op]');
    if (op) { state.opKey = op.getAttribute('data-op'); render(); return; }
    if (e.target.closest('[data-swap]')) {
      state.swapped = !state.swapped;
      state.leftSet = state.swapped ? 'right' : 'left';
      state.rightSet = state.swapped ? 'left' : 'right';
      render();
    }
  });

  function post() {
    try {
      if (document.documentElement.clientWidth < 60) return;
      var el = document.querySelector('.wrap');
      var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6;
      parent.postMessage({ sda: 'embed-height', h: h }, '*');
    } catch (e) {}
  }
  window.addEventListener('load', post);
  window.addEventListener('resize', post);

  render();
})();
