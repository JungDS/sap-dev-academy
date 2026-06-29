/* select-start-gate 엔진 — 검증(AT SELECTION-SCREEN)을 통과해야 START-OF-SELECTION이 열리고 SELECT가 실행된다.
   조건에 따라 결과·sy-subrc·sy-dbcnt가 달라지고, 0건이면 S 메시지로 안내한다(흐름 안 막음).
   골격 계약: .ssg-valid · .ssg-cond · [data-run] · .ssg-timeline · #ssgResult · #ssgStatus.
   config: window.SSG_CFG = { rows:[{}], conds:[{label,conc,stat}], cols:[{key,label}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SSG_CFG || { rows: [], conds: [], cols: [] };
  var valid = true, condIdx = 0, ran = false;
  var validEl = document.querySelector('.ssg-valid');
  var condEl = document.querySelector('.ssg-cond');
  var runBtn = document.querySelector('[data-run]');
  var timeEl = document.querySelector('.ssg-timeline');
  var resultEl = document.getElementById('ssgResult');
  var statusEl = document.getElementById('ssgStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function cur() { return CFG.conds[condIdx]; }
  function matched() {
    var c = cur();
    return CFG.rows.filter(function (r) { return r.concert_id === c.conc && (c.stat === '*' || r.status === c.stat); });
  }

  function renderSeg(host, items, active, key) {
    host.innerHTML = items.map(function (it, i) {
      var v = key === 'valid' ? it.v : i;
      return '<button type="button" data-v="' + v + '" aria-pressed="' + ((key === 'valid' ? (it.v == (valid ? 1 : 0)) : i === condIdx) ? 'true' : 'false') + '">' + esc(it.l) + '</button>';
    }).join('');
  }
  function renderTimeline() {
    var passCls = valid ? 'pass' : 'lock';
    var startCls = !valid ? 'lock' : (ran ? 'run' : '');
    timeEl.innerHTML = '<span class="step ' + passCls + '">AT SELECTION-SCREEN ' + (valid ? '✓ 통과' : '✗ 실패') + '</span>' +
      '<span class="arr">▸</span><span class="step ' + startCls + '">START-OF-SELECTION ' + (!valid ? '🔒' : (ran ? '실행' : '대기')) + '</span>';
  }
  function renderResult() {
    if (!ran || !valid) { resultEl.innerHTML = ''; return; }
    var rows = matched(), cols = CFG.cols;
    resultEl.innerHTML = '<table class="ssg-tbl"><thead><tr>' + cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (rows.length ? rows.map(function (r) { return '<tr>' + cols.map(function (c) { return '<td>' + esc(r[c.key]) + '</td>'; }).join('') + '</tr>'; }).join('')
        : '<tr><td colspan="' + cols.length + '" class="ssg-empty">0건</td></tr>') + '</tbody></table>';
  }
  function renderStatus() {
    if (!valid) { statusEl.className = 'ssg-status lock'; statusEl.innerHTML = '🔒 검증 실패 — <b>START-OF-SELECTION</b>이 열리지 않습니다. AT SELECTION-SCREEN을 통과해야 본 처리가 시작됩니다.'; return; }
    if (!ran) { statusEl.className = 'ssg-status'; statusEl.innerHTML = '검증 통과. <b>▶ SELECT 실행</b>을 눌러 START-OF-SELECTION에서 조회를 시작하세요.'; return; }
    var n = matched().length;
    if (n === 0) { statusEl.className = 'ssg-status warn'; statusEl.innerHTML = '0건 — <b>sy-subrc = 4</b>. 정상 조건인데 결과가 없어 <code>MESSAGE ... TYPE \'S\'</code>로 안내(흐름은 안 막음).'; return; }
    statusEl.className = 'ssg-status ok'; statusEl.innerHTML = '✅ <b>' + n + '건</b> 조회 · sy-subrc = 0 · sy-dbcnt = ' + n + '. 검증 통과 후 START-OF-SELECTION이 본 처리를 수행했습니다.';
  }
  function render() {
    renderSeg(validEl, [{ v: 1, l: '통과' }, { v: 0, l: '실패' }], null, 'valid');
    renderSeg(condEl, CFG.conds.map(function (c) { return { l: c.label }; }), null, 'cond');
    runBtn.disabled = !valid;
    renderTimeline(); renderResult(); renderStatus();
  }

  validEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; valid = b.getAttribute('data-v') === '1'; ran = false; render(); });
  condEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; condIdx = +b.getAttribute('data-v'); ran = false; render(); });
  runBtn.addEventListener('click', function () { if (!valid) return; ran = true; render(); });

  render();
})();
