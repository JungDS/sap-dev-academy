/* se16n-tracker 엔진 — SM30으로 새 회차(C999)를 저장한 뒤 SE16N으로 확인. 조건(전체/Key/오타)과
   대상(원본 테이블 vs Database View)에 따라 결과가 어떻게 달라지는지 보여 준다.
   골격 계약: [data-save] · .se16-tbl-seg · .se16-cond-seg · #se16Head · #se16Body · #se16Status · .se16-saved.
   config: window.SE16_CFG = { zperf:[..], zvperf:[..], newRow:{}, cols:{ZPERF:[],ZV_PERF:[]} }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SE16_CFG || {};
  var saved = false, table = 'ZPERF', cond = 'all';
  var saveBtn = document.querySelector('[data-save]');
  var savedEl = document.querySelector('.se16-saved');
  var tblSeg = document.querySelector('.se16-tbl-seg');
  var condSeg = document.querySelector('.se16-cond-seg');
  var headEl = document.getElementById('se16Head');
  var bodyEl = document.getElementById('se16Body');
  var statusEl = document.getElementById('se16Status');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function sourceRows() {
    if (table === 'ZPERF') {
      var rows = CFG.zperf.slice();
      if (saved) rows = rows.concat([CFG.newRow]);
      return rows;
    }
    return CFG.zvperf.slice();      // View는 C999 마스터가 없어 변동 없음
  }
  function filtered() {
    var rows = sourceRows();
    if (cond === 'C999') rows = rows.filter(function (r) { return r.concert_id === 'C999'; });
    else if (cond === 'C99') rows = rows.filter(function (r) { return r.concert_id === 'C99'; });
    return rows;
  }
  function cols() { return CFG.cols[table]; }

  function renderSeg(host, items, active, attr) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + esc(it.l) + '</button>';
    }).join('');
  }
  function render() {
    saveBtn.disabled = saved;
    savedEl.textContent = saved ? '✓ ZPERF에 C999 001회차 저장됨' : '';
    renderSeg(tblSeg, [{ v: 'ZPERF', l: 'ZPERF (원본)' }, { v: 'ZV_PERF', l: 'ZV_PERF (View)' }], table);
    renderSeg(condSeg, [{ v: 'all', l: '전체' }, { v: 'C999', l: 'concert_id=C999' }, { v: 'C99', l: 'concert_id=C99 (오타)' }], cond);
    var cs = cols(), rows = filtered();
    headEl.innerHTML = cs.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('');
    bodyEl.innerHTML = rows.length
      ? rows.map(function (r) {
        var isNew = saved && r.concert_id === 'C999' && table === 'ZPERF';
        return '<tr class="' + (isNew ? 'new' : '') + '">' + cs.map(function (c) { return '<td>' + esc(r[c.key]) + '</td>'; }).join('') + '</tr>';
      }).join('')
      : '<tr><td colspan="' + cs.length + '" class="se16-empty">0건</td></tr>';
    renderStatus(rows.length);
  }
  function renderStatus(n) {
    if (cond === 'C99') { statusEl.className = 'se16-status warn'; statusEl.innerHTML = '0건 — 조건 <b>C99</b>는 오타입니다. 0건을 보고 바로 "저장 실패"라 단정하지 마세요(오타·클라이언트·권한도 원인일 수 있음).'; return; }
    if (table === 'ZV_PERF' && cond === 'C999') { statusEl.className = 'se16-status warn'; statusEl.innerHTML = '⚠️ View에는 <b>C999</b> 회차가 안 보입니다 — zconcert에 C999 마스터가 없어 <b>inner join</b>에서 빠졌기 때문. 원본 테이블 확인 ≠ View 확인.'; return; }
    if (table === 'ZPERF' && cond === 'C999') {
      if (saved) { statusEl.className = 'se16-status ok'; statusEl.innerHTML = '✅ 원본 <b>ZPERF</b>에서 C999 회차 저장을 확인했습니다. SM30 저장은 반드시 SE16N으로 재확인하세요.'; }
      else { statusEl.className = 'se16-status'; statusEl.innerHTML = '먼저 위에서 <b>SM30에서 저장</b>을 눌러 보세요. 저장 전이라 0건입니다.'; }
      return;
    }
    statusEl.className = 'se16-status'; statusEl.innerHTML = n + '건. 실무에서는 전체 조회보다 key·날짜 조건으로 좁히는 습관이 좋습니다.';
  }

  saveBtn.addEventListener('click', function () { saved = true; render(); });
  tblSeg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; table = b.getAttribute('data-v'); render(); });
  condSeg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; cond = b.getAttribute('data-v'); render(); });

  render();
})();
