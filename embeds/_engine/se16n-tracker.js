/* se16n-tracker 엔진 — SM30으로 H03을 저장한 뒤 SE16N으로 확인. 조건(전체/Key/오타)과
   대상(원본 테이블 vs Database View)에 따라 결과가 어떻게 달라지는지 보여 준다.
   골격 계약: [data-save] · .se16-tbl-seg · .se16-cond-seg · #se16Head · #se16Body · #se16Status · .se16-saved.
   config: window.SE16_CFG = { zhall:[..], zvconcert:[..], newRow:{}, cols:{ZHALL:[],ZV_CONCERT:[]} }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SE16_CFG || {};
  var saved = false, table = 'ZHALL', cond = 'all';
  var saveBtn = document.querySelector('[data-save]');
  var savedEl = document.querySelector('.se16-saved');
  var tblSeg = document.querySelector('.se16-tbl-seg');
  var condSeg = document.querySelector('.se16-cond-seg');
  var headEl = document.getElementById('se16Head');
  var bodyEl = document.getElementById('se16Body');
  var statusEl = document.getElementById('se16Status');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function sourceRows() {
    if (table === 'ZHALL') {
      var rows = CFG.zhall.slice();
      if (saved) rows = rows.concat([CFG.newRow]);
      return rows;
    }
    return CFG.zvconcert.slice();   // View는 H03 참조 공연이 없어 변동 없음
  }
  function filtered() {
    var rows = sourceRows();
    if (cond === 'H03') rows = rows.filter(function (r) { return r.hall_id === 'H03'; });
    else if (cond === 'H30') rows = rows.filter(function (r) { return r.hall_id === 'H30'; });
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
    savedEl.textContent = saved ? '✓ ZHALL에 H03(레드홀) 저장됨' : '';
    renderSeg(tblSeg, [{ v: 'ZHALL', l: 'ZHALL (원본)' }, { v: 'ZV_CONCERT', l: 'ZV_CONCERT (View)' }], table);
    renderSeg(condSeg, [{ v: 'all', l: '전체' }, { v: 'H03', l: 'hall_id=H03' }, { v: 'H30', l: 'hall_id=H30 (오타)' }], cond);
    var cs = cols(), rows = filtered();
    headEl.innerHTML = cs.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('');
    bodyEl.innerHTML = rows.length
      ? rows.map(function (r) {
        var isNew = saved && r.hall_id === 'H03' && table === 'ZHALL';
        return '<tr class="' + (isNew ? 'new' : '') + '">' + cs.map(function (c) { return '<td>' + esc(r[c.key]) + '</td>'; }).join('') + '</tr>';
      }).join('')
      : '<tr><td colspan="' + cs.length + '" class="se16-empty">0건</td></tr>';
    renderStatus(rows.length);
  }
  function renderStatus(n) {
    if (cond === 'H30') { statusEl.className = 'se16-status warn'; statusEl.innerHTML = '0건 — 조건 <b>H30</b>은 오타입니다. 0건을 보고 바로 "저장 실패"라 단정하지 마세요(오타·클라이언트·권한도 원인일 수 있음).'; return; }
    if (table === 'ZV_CONCERT' && cond === 'H03') { statusEl.className = 'se16-status warn'; statusEl.innerHTML = '⚠️ View에는 <b>H03</b>이 안 보입니다 — H03을 참조하는 공연이 없어 <b>inner join</b>에서 빠졌기 때문. 원본 테이블 확인 ≠ View 확인.'; return; }
    if (table === 'ZHALL' && cond === 'H03') {
      if (saved) { statusEl.className = 'se16-status ok'; statusEl.innerHTML = '✅ 원본 <b>ZHALL</b>에서 H03 저장을 확인했습니다. SM30 저장은 반드시 SE16N으로 재확인하세요.'; }
      else { statusEl.className = 'se16-status'; statusEl.innerHTML = '먼저 위에서 <b>SM30에서 H03 저장</b>을 눌러 보세요. 저장 전이라 0건입니다.'; }
      return;
    }
    statusEl.className = 'se16-status'; statusEl.innerHTML = n + '건. 실무에서는 전체 조회보다 key·날짜 조건으로 좁히는 습관이 좋습니다.';
  }

  saveBtn.addEventListener('click', function () { saved = true; render(); });
  tblSeg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; table = b.getAttribute('data-v'); render(); });
  condSeg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; cond = b.getAttribute('data-v'); render(); });

  render();
})();
