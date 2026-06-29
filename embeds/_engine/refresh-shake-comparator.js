/* refresh-shake-comparator 엔진 — 데이터 갱신 후 refresh_table_display를 호출할 때 is_stable을 켜면 보던 스크롤 위치가 유지되고,
   끄면 첫 줄로 튀는 차이를 실제 스크롤로 보여 준다. 컬럼 구조 변경은 soft refresh만으로 부족(재초기화)임도 보여 준다.
   골격 계약: .rsc-opt(토글) · .rsc-act(버튼) · #rscCode · #rscScroll · #rscStatus.
   config: window.RSC_CFG = { rowCount, jumpRow }. 높이: _autoheight.js. */
(function () {
  var CFG = window.RSC_CFG || { rowCount: 40, jumpRow: 28 };
  var opt = { row: false, col: false, soft: false };
  var extraCol = false, markRow = 0;

  var optEl = document.querySelector('.rsc-opt');
  var actEl = document.querySelector('.rsc-act');
  var codeEl = document.getElementById('rscCode');
  var scrollEl = document.getElementById('rscScroll');
  var statusEl = document.getElementById('rscStatus');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function renderOpts() {
    optEl.innerHTML = [['row', 'is_stable-row'], ['col', 'is_stable-col'], ['soft', 'i_soft_refresh']].map(function (it) {
      return '<button type="button" data-o="' + it[0] + '" aria-pressed="' + (opt[it[0]] ? 'true' : 'false') + '">' + it[1] + '</button>';
    }).join('');
  }

  function renderCode() {
    function v(b) { return b ? 'abap_true' : 'abap_false'; }
    codeEl.innerHTML =
      '" 1) 먼저 내부 테이블 값을 갱신(refresh는 DB 재조회 아님)\n' +
      '<span class="fn">go_grid</span>->refresh_table_display(\n' +
      '  EXPORTING\n' +
      '    is_stable = <span class="fn">VALUE</span> lvc_s_stbl( row = <span class="' + (opt.row ? 'on' : 'off') + '">' + v(opt.row) + '</span> col = <span class="' + (opt.col ? 'on' : 'off') + '">' + v(opt.col) + '</span> )\n' +
      '    i_soft_refresh = <span class="' + (opt.soft ? 'on' : 'off') + '">' + v(opt.soft) + '</span> ).';
  }

  function renderTable() {
    var head = '<tr><th>#</th><th>CONCERT</th><th>SEATS_LEFT</th>' + (extraCol ? '<th class="extra">STATUS(신규)</th>' : '') + '</tr>';
    var body = '';
    for (var i = 1; i <= CFG.rowCount; i++) {
      var cls = (i === markRow ? 'mark ' : '') + (i === CFG.jumpRow ? 'target' : '');
      body += '<tr class="' + cls.trim() + '"><td>' + i + '</td><td>C' + (1000 + i) + '</td><td>' + ((i * 7) % 50) + '</td>' +
        (extraCol ? '<td class="extra">' + (i % 2 ? 'A' : 'F') + '</td>' : '') + '</tr>';
    }
    scrollEl.innerHTML = '<table class="rsc-tbl"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }

  function scrollToTarget() {
    var tr = scrollEl.querySelector('.rsc-tbl tbody tr.target');
    if (tr) scrollEl.scrollTop = tr.offsetTop - 60;
  }

  // 데이터 갱신 후 refresh — stable이면 위치 유지, 아니면 0으로 튐
  function doRefresh() {
    var keep = scrollEl.scrollTop;
    markRow = CFG.jumpRow;                 // 그 줄의 값이 바뀌었다고 표시
    renderTable();
    if (opt.row) { scrollEl.scrollTop = keep;
      statusEl.className = 'ok';
      statusEl.innerHTML = '✅ <b>is_stable-row 켜짐</b> — 데이터가 바뀌어도 보던 <b>' + CFG.jumpRow + '행 위치가 유지</b>됩니다. 사용자가 흐름을 잃지 않아요.';
    } else { scrollEl.scrollTop = 0;
      statusEl.className = 'warn';
      statusEl.innerHTML = '⚠️ <b>첫 줄로 튐</b> — is_stable 없이 refresh하면 보던 위치가 풀립니다. <code>is_stable-row</code>를 켜고 다시 갱신해 보세요.';
    }
  }

  function doStructChange() {
    extraCol = !extraCol;
    markRow = 0; renderTable(); scrollEl.scrollTop = 0;
    statusEl.className = 'bad';
    statusEl.innerHTML = '🔻 <b>컬럼 구조 변경</b> — field catalog/layout이 바뀌면 <code>i_soft_refresh</code>만으론 부족해 <b>초기 표시를 다시 구성</b>해야 합니다(위치 유지 한계). 값 변경과 구조 변경을 구분하세요.';
  }

  function reset() {
    opt = { row: false, col: false, soft: false }; extraCol = false; markRow = 0;
    renderTable(); scrollEl.scrollTop = 0;
    statusEl.className = '';
    statusEl.innerHTML = '<b>① 28행으로 스크롤</b> → <b>② 데이터 갱신 + refresh</b> 순서로, <code>is_stable-row</code> on/off에 따라 위치가 어떻게 달라지는지 보세요.';
    render();
  }

  function render() { renderOpts(); renderCode(); }

  optEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; opt[b.getAttribute('data-o')] = !opt[b.getAttribute('data-o')]; render(); });
  actEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.getAttribute('data-a');
    if (a === 'scroll') scrollToTarget();
    else if (a === 'refresh') doRefresh();
    else if (a === 'struct') doStructChange();
    else if (a === 'reset') reset();
  });

  renderTable(); reset();
})();
