/* itab-sql-console 엔진 — 내부 테이블 lt_flight를 SQL data source(@lt_flight AS f)로 두고 WHERE/ORDER BY/GROUP BY를 적용한다.
   같은 결과를 LOOP/SORT/COLLECT로도 만들어 비교한다. internal table도 host variable이라 @가 필요하고, DB 대량 처리의 대체재는 아니다.
   골격 계약: .ics-op(세그) · .ics-impl(세그) · #icsSource · #icsLoc · #icsCode · #icsResult · #icsNote.
   config: window.ICS_CFG = { source:{cols,rows}, ops:[{v,label,resultCols,resultRows,sql,loop,note,agg}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.ICS_CFG;
  var op = CFG.ops[0].v, impl = 'sql';

  var opEl = document.querySelector('.ics-op');
  var implEl = document.querySelector('.ics-impl');
  var srcEl = document.getElementById('icsSource');
  var locEl = document.getElementById('icsLoc');
  var codeEl = document.getElementById('icsCode');
  var resEl = document.getElementById('icsResult');
  var noteEl = document.getElementById('icsNote');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function cur() { for (var i = 0; i < CFG.ops.length; i++) if (CFG.ops[i].v === op) return CFG.ops[i]; }
  function fmtCode(s) {
    return h(s).replace(/\b(SELECT|FROM|WHERE|ORDER BY|GROUP BY|INTO TABLE|SUM|LOOP AT|INTO|APPEND|SORT|BY|COLLECT|ENDLOOP)\b/g, function (m) { return '<span class="fn">' + m + '</span>'; })
      .replace(/@\w+/g, function (m) { return '<span class="esc">' + m + '</span>'; })
      .replace(/AS\s+\w+/g, function (m) { return '<span class="as">' + m + '</span>'; });
  }

  function renderSeg(host, items, active) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + h(it.l) + '</button>';
    }).join('');
  }

  function table(cls, cols, rows, aggCol) {
    var head = '<tr>' + cols.map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr>';
    var body = rows.map(function (r) {
      return '<tr>' + cols.map(function (c) {
        var isAgg = aggCol && c === aggCol;
        return '<td' + (isAgg ? ' class="agg"' : '') + '>' + h(r[c]) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return '<table class="ics-tbl ' + cls + '"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }

  function render() {
    renderSeg(opEl, CFG.ops.map(function (o) { return { v: o.v, l: o.label }; }), op);
    renderSeg(implEl, [{ v: 'sql', l: 'SELECT FROM @itab' }, { v: 'abap', l: 'LOOP / SORT' }], impl);
    srcEl.innerHTML = table('', CFG.source.cols, CFG.source.rows);
    var o = cur();
    if (impl === 'sql') { locEl.className = 'ics-loc sql'; locEl.textContent = 'SQL — 내부 테이블을 source로'; codeEl.innerHTML = fmtCode(o.sql); }
    else { locEl.className = 'ics-loc abap'; locEl.textContent = 'ABAP — 같은 결과를 직접'; codeEl.innerHTML = fmtCode(o.loop); }
    resEl.innerHTML = table('res', o.resultCols, o.resultRows, o.agg);
    noteEl.innerHTML = o.note;
  }

  opEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; op = b.getAttribute('data-v'); render(); });
  implEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; impl = b.getAttribute('data-v'); render(); });

  render();
})();
