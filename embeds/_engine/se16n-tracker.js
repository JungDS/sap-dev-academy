/* se16n-tracker 엔진 — SM30 저장 → SE16N 확인. 저장 버튼이 대상별 newRows를 추가하고,
   대상(원본 테이블 vs Database View)·조건 세그에 따라 조회 결과와 상태 메시지가 달라진다.
   골격 계약: [data-save] · .se16-tbl-seg · .se16-cond-seg · #se16Head · #se16Body · #se16Status · .se16-saved.
   config: window.SE16_CFG = {
     cols:{T:[{key,label}]}, tables:[{v,l}], rows:{T:[..]}, newRows:{T:{..}|없음},
     saveLabel(버튼), savedLabel(저장 후 표기), condField, conds:[{v,l,match|null}],
     status:[{table:'*'|T, cond:'*'|v, saved:'*'|bool, cls, html}] — 첫 일치 승, html의 {n}=건수 치환 }.
   레슨 데이터·문구는 전부 config에(엔진 하드코딩 없음). 높이: _autoheight.js. */
(function () {
  var CFG = window.SE16_CFG || {};
  var saved = false, table = CFG.tables[0].v, cond = CFG.conds[0].v;
  var saveBtn = document.querySelector('[data-save]');
  var savedEl = document.querySelector('.se16-saved');
  var tblSeg = document.querySelector('.se16-tbl-seg');
  var condSeg = document.querySelector('.se16-cond-seg');
  var headEl = document.getElementById('se16Head');
  var bodyEl = document.getElementById('se16Body');
  var statusEl = document.getElementById('se16Status');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function sourceRows() {
    var rows = (CFG.rows[table] || []).slice();
    if (saved && CFG.newRows && CFG.newRows[table]) rows.push(CFG.newRows[table]);
    return rows;
  }
  function condObj() {
    for (var i = 0; i < CFG.conds.length; i++) if (CFG.conds[i].v === cond) return CFG.conds[i];
    return null;
  }
  function filtered() {
    var rows = sourceRows(), co = condObj();
    if (co && co.match != null) rows = rows.filter(function (r) { return r[CFG.condField] === co.match; });
    return rows;
  }
  function cols() { return CFG.cols[table]; }
  function isNewRow(r) { return !!(saved && CFG.newRows && r === CFG.newRows[table]); }
  function statusFor(n) {
    var list = CFG.status || [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if ((s.table === '*' || s.table === table) && (s.cond === '*' || s.cond === cond) && (s.saved === '*' || s.saved === saved)) {
        return { cls: s.cls || '', html: String(s.html).replace(/\{n\}/g, n) };
      }
    }
    return { cls: '', html: n + '건.' };
  }

  function renderSeg(host, items, active) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + esc(it.l) + '</button>';
    }).join('');
  }
  function render() {
    saveBtn.disabled = saved;
    savedEl.textContent = saved ? (CFG.savedLabel || '') : '';
    renderSeg(tblSeg, CFG.tables, table);
    renderSeg(condSeg, CFG.conds, cond);
    var cs = cols(), rows = filtered();
    headEl.innerHTML = cs.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('');
    bodyEl.innerHTML = rows.length
      ? rows.map(function (r) {
        return '<tr class="' + (isNewRow(r) ? 'new' : '') + '">' + cs.map(function (c) { return '<td>' + esc(r[c.key]) + '</td>'; }).join('') + '</tr>';
      }).join('')
      : '<tr><td colspan="' + cs.length + '" class="se16-empty">0건</td></tr>';
    var st = statusFor(rows.length);
    statusEl.className = 'se16-status' + (st.cls ? ' ' + st.cls : '');
    statusEl.innerHTML = st.html;
  }

  saveBtn.addEventListener('click', function () { saved = true; render(); });
  tblSeg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; table = b.getAttribute('data-v'); render(); });
  condSeg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; cond = b.getAttribute('data-v'); render(); });

  render();
})();
