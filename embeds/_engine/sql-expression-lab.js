/* sql-expression-lab 엔진 — CASE/CAST/COALESCE를 SELECT 안에서 계산하고, 같은 결과를 ABAP LOOP로도 만들어 본다.
   "계산 위치"(DB vs ABAP)만 다르고 결과는 같다는 점, 계산 컬럼엔 AS 별칭이 필요하다는 점을 보여 준다.
   골격 계약: .sel-mode(세그) · .sel-impl(세그) · #selCode · #selLoc · #selTable · #selNote.
   config: window.SEL_CFG = { modes:[{v,label,col,base,sqlExpr,abapLoop,rows,note}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SEL_CFG;
  var mode = CFG.modes[0].v, impl = 'db';

  var modeEl = document.querySelector('.sel-mode');
  var implEl = document.querySelector('.sel-impl');
  var locEl = document.getElementById('selLoc');
  var codeEl = document.getElementById('selCode');
  var tblEl = document.getElementById('selTable');
  var noteEl = document.getElementById('selNote');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function cur() { for (var i = 0; i < CFG.modes.length; i++) if (CFG.modes[i].v === mode) return CFG.modes[i]; }

  function renderSeg(host, items, active) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + h(it.l) + '</button>';
    }).join('');
  }

  function fmtSql(s) {
    return h(s).replace(/AS\s+\w+/g, function (m) { return '<span class="as">' + m + '</span>'; })
      .replace(/\b(CASE|WHEN|THEN|ELSE|END|CAST|COALESCE|CONCAT|SUBSTRING|UPPER)\b/g, function (m) { return '<span class="fn">' + m + '</span>'; });
  }

  function renderCode() {
    var m = cur();
    if (impl === 'db') {
      locEl.className = 'sel-loc db'; locEl.textContent = '계산 위치: 데이터베이스';
      codeEl.innerHTML = fmtSql(m.sqlExpr);
    } else {
      locEl.className = 'sel-loc abap'; locEl.textContent = '계산 위치: ABAP (LOOP)';
      codeEl.innerHTML = h(m.abapLoop);
    }
  }

  function renderTable() {
    var m = cur();
    var head = '<tr>' + m.base.map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') +
      '<th class="out">' + h(m.col) + '</th></tr>';
    var body = m.rows.map(function (r) {
      var cells = m.base.map(function (c) {
        var v = r[c];
        var isNull = v === null;
        return '<td' + (isNull ? ' class="nul"' : '') + '>' + (isNull ? 'NULL' : h(v)) + '</td>';
      }).join('');
      var outCls = 'out' + (r.repl ? ' repl' : '');
      return '<tr>' + cells + '<td class="' + outCls + '">' + h(r.out) + '</td></tr>';
    }).join('');
    tblEl.innerHTML = '<table class="sel-tbl"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }

  function renderNote() { noteEl.innerHTML = cur().note; }

  function render() {
    renderSeg(modeEl, CFG.modes.map(function (m) { return { v: m.v, l: m.label }; }), mode);
    renderSeg(implEl, [{ v: 'db', l: 'SQL 식 (DB)' }, { v: 'abap', l: 'ABAP LOOP' }], impl);
    renderCode(); renderTable(); renderNote();
  }

  modeEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; mode = b.getAttribute('data-v'); render(); });
  implEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; impl = b.getAttribute('data-v'); render(); });

  render();
})();
