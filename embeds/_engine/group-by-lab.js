/* group-by-lab 엔진 — 그룹 키와 모드(GROUP BY / DISTINCT)를 바꿔 원본 행을 요약하고 색으로 묶는다.
   골격 계약: .gbl-keys(세그) · .gbl-mode(세그) · #gblSrc(원본 tbody) · #gblRes · #gblNote.
   config: window.GBL_CFG = { rows:[..], cols:[{key,label,num}], groupOptions:[{label,keys:[..]}], sumField }.
   높이: _autoheight.js. */
(function () {
  var CFG = window.GBL_CFG || { rows: [], cols: [], groupOptions: [], sumField: '' };
  var keyIdx = 0;          // groupOptions 인덱스
  var mode = 'GROUP';      // GROUP | DISTINCT
  var keysEl = document.querySelector('.gbl-keys');
  var modeEl = document.querySelector('.gbl-mode');
  var srcEl = document.getElementById('gblSrc');
  var resHost = document.getElementById('gblRes');
  var noteEl = document.getElementById('gblNote');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function curKeys() { return CFG.groupOptions[keyIdx].keys; }
  function keyOf(r) { return curKeys().map(function (k) { return r[k]; }).join(' · '); }

  // 그룹 순서(첫 등장순)와 인덱스
  function groupOrder() {
    var seen = {}, order = [];
    CFG.rows.forEach(function (r) { var k = keyOf(r); if (!(k in seen)) { seen[k] = order.length; order.push(k); } });
    return { seen: seen, order: order };
  }

  function renderSrc() {
    var go = groupOrder();
    var head = '<tr>' + CFG.cols.map(function (c) { return '<th>' + c.label + '</th>'; }).join('') + '</tr>';
    var body = CFG.rows.map(function (r) {
      var gi = go.seen[keyOf(r)] % 4;
      return '<tr class="g' + gi + '">' + CFG.cols.map(function (c) {
        return '<td class="' + (c.num ? 'num' : '') + '">' + esc(r[c.key]) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    srcEl.innerHTML = head + body;
  }

  function aggregate() {
    var go = groupOrder(), groups = {};
    CFG.rows.forEach(function (r) {
      var k = keyOf(r);
      if (!groups[k]) groups[k] = { key: r, cnt: 0, sum: 0, max: -Infinity };
      groups[k].cnt++;
      var v = Number(r[CFG.sumField]) || 0;
      groups[k].sum += v; if (v > groups[k].max) groups[k].max = v;
    });
    return go.order.map(function (k) { return groups[k]; });
  }

  function renderResult() {
    if (mode === 'DISTINCT') {
      var go = groupOrder();
      var head = '<tr>' + curKeys().map(function (k) { return '<th>' + k + '</th>'; }).join('') + '</tr>';
      var body = go.order.map(function (k) {
        return '<tr>' + k.split(' · ').map(function (v) { return '<td>' + esc(v) + '</td>'; }).join('') + '</tr>';
      }).join('');
      resHost.innerHTML = '<table class="gbl-tbl gbl-res"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
      noteEl.innerHTML = '<b>SELECT DISTINCT ' + curKeys().join(' ') + '</b> — 중복만 제거한 <b>' + go.order.length + '행</b>. 집계(건수·합계)는 없습니다.';
      return;
    }
    var aggs = aggregate();
    var sf = CFG.sumField;
    var head = '<tr>' + curKeys().map(function (k) { return '<th>' + k + '</th>'; }).join('') +
      '<th>COUNT(*)</th><th>SUM(' + sf + ')</th><th>MAX(' + sf + ')</th></tr>';
    var body = aggs.map(function (g) {
      var keyCells = curKeys().map(function (k) { return '<td>' + esc(g.key[k]) + '</td>'; }).join('');
      return '<tr>' + keyCells + '<td class="num">' + g.cnt + '</td><td class="num">' + g.sum + '</td><td class="num">' + g.max + '</td></tr>';
    }).join('');
    resHost.innerHTML = '<table class="gbl-tbl gbl-res"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
    noteEl.innerHTML = '원본 <b>' + CFG.rows.length + '행</b> → <b>GROUP BY ' + curKeys().join(' ') + '</b> → <b>' + aggs.length + '행</b>으로 접힘. 그룹 키가 아닌 평컬럼(예: 고객)은 한 그룹에 여러 값이라 그대로 못 고릅니다.';
  }

  function renderSeg(host, items, activeI, attr) {
    host.innerHTML = items.map(function (it, i) {
      return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === activeI ? 'true' : 'false') + '">' + esc(it) + '</button>';
    }).join('');
  }

  function render() {
    renderSeg(keysEl, CFG.groupOptions.map(function (o) { return o.label; }), keyIdx);
    renderSeg(modeEl, ['GROUP BY', 'DISTINCT'], mode === 'GROUP' ? 0 : 1);
    renderSrc(); renderResult();
  }

  keysEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; keyIdx = +b.getAttribute('data-i'); render(); });
  modeEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; mode = (+b.getAttribute('data-i') === 0) ? 'GROUP' : 'DISTINCT'; render(); });

  render();
})();
