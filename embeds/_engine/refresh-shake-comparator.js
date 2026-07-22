/* refresh-shake-comparator 엔진 — 값 갱신 후 refresh_table_display를 호출할 때 세 옵션의 효과를 실제로 관찰한다.
   is_stable-row=보던 세로 위치 유지 · is_stable-col=가로 스크롤 위치 유지 · i_soft_refresh=사용자가 건 정렬/필터 유지(끄면 초기 순서로 되돌아감).
   컬럼 구조가 바뀌면 refresh_table_display로는 부족 — field catalog를 다시 만들어 set_table_for_first_display로 재초기화해야 한다(옵션과 무관).
   골격 계약: .rsc-opt(토글) · .rsc-act(버튼) · #rscCode · #rscScroll · #rscStatus.
   config: window.RSC_CFG = { rowCount, jumpRow }. 스키마: 회차 표시행(concert_id·perf_no·capacity·booked·seats_left). 높이: _autoheight.js. */
(function () {
  var CFG = window.RSC_CFG || { rowCount: 40, jumpRow: 28 };
  var opt = { row: false, col: false, soft: false };
  var extraCol = false, markRow = 0, userSorted = false;

  var optEl = document.querySelector('.rsc-opt');
  var actEl = document.querySelector('.rsc-act');
  var codeEl = document.getElementById('rscCode');
  var scrollEl = document.getElementById('rscScroll');
  var statusEl = document.getElementById('rscStatus');
  scrollEl.style.overflow = 'auto';   // 세로(CSS) + 가로(is_stable-col 관찰용)

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  // 고정 시드 데이터(회차 표시행) — 스키마: capacity=공연 정원, booked=예약 합계, seats_left=잔여석
  var rows = [];
  for (var i = 1; i <= CFG.rowCount; i++) {
    var cap = 50 + (i % 5) * 20;
    var booked = (i * 13) % (cap + 1);
    rows.push({ n: i, concert: 'C' + (1000 + ((i - 1) % 6 + 1)), perf: ('0' + ((i % 3) + 1)).slice(-2), capacity: cap, booked: booked, left: cap - booked });
  }

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

  function orderedRows() {
    if (!userSorted) return rows;
    return rows.slice().sort(function (a, b) { return a.left - b.left; });
  }

  function renderTable() {
    var ord = orderedRows();
    var head = '<tr><th>#</th><th>CONCERT_ID</th><th>PERF_NO</th><th>CAPACITY</th><th>BOOKED</th><th class="' + (userSorted ? 'sortedcol' : '') + '">SEATS_LEFT</th>' + (extraCol ? '<th class="extra">정원대비</th>' : '') + '</tr>';
    var body = ord.map(function (r) {
      var cls = (r.n === markRow ? 'mark ' : '') + (r.n === CFG.jumpRow ? 'target' : '');
      return '<tr class="' + cls.trim() + '"><td>' + r.n + '</td><td>' + r.concert + '</td><td>' + r.perf + '</td><td>' + r.capacity + '</td><td>' + r.booked + '</td><td>' + r.left + '</td>' +
        (extraCol ? '<td class="extra">' + Math.round(r.booked / r.capacity * 100) + '%</td>' : '') + '</tr>';
    }).join('');
    scrollEl.innerHTML = '<table class="rsc-tbl" style="min-width:600px">' + '<thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }

  function targetTr() { return scrollEl.querySelector('.rsc-tbl tbody tr.target'); }
  function scrollToTarget() { var tr = targetTr(); if (tr) { scrollEl.scrollTop = tr.offsetTop - 60; scrollEl.scrollLeft = 120; } }

  function doSort() {
    userSorted = true; renderTable();
    statusEl.className = '';
    statusEl.innerHTML = '↕ <b>SEATS_LEFT 오름차순으로 정렬</b>했습니다(사용자가 화면에서 건 정렬). 이 상태로 <b>값 갱신 + refresh</b>를 눌러 <code>i_soft_refresh</code> on/off가 정렬을 어떻게 다루는지 보세요.';
  }

  function doRefresh() {
    var keepTop = scrollEl.scrollTop, keepLeft = scrollEl.scrollLeft;
    markRow = CFG.jumpRow;                       // 그 회차의 예약이 바뀌었다고 표시
    var lostSort = userSorted && !opt.soft;
    if (lostSort) userSorted = false;            // soft 아니면 정렬이 풀려 초기 순서로
    renderTable();
    scrollEl.scrollTop = opt.row ? keepTop : 0;
    scrollEl.scrollLeft = opt.col ? keepLeft : 0;

    var parts = [];
    parts.push(opt.row ? '세로 위치 <b>유지</b>' : '세로 <b>첫 줄로 튐</b>');
    parts.push(opt.col ? '가로 위치 <b>유지</b>' : '가로 <b>왼쪽으로 튐</b>');
    if (opt.soft) parts.push('정렬 <b>유지</b>(soft)');
    else if (lostSort) parts.push('정렬 <b>풀림</b>(soft off)');
    var good = opt.row && opt.col && (!lostSort);
    statusEl.className = good ? 'ok' : 'warn';
    statusEl.innerHTML = (good ? '✅ ' : '⚠️ ') + parts.join(' · ') + '. <code>is_stable</code>는 스크롤 위치를, <code>i_soft_refresh</code>는 사용자가 건 정렬·필터를 지킵니다.';
  }

  function doStructChange() {
    extraCol = !extraCol; markRow = 0; renderTable();
    scrollEl.scrollTop = 0; scrollEl.scrollLeft = 0;
    statusEl.className = 'bad';
    statusEl.innerHTML = '🔻 <b>컬럼 구조 변경</b>은 <code>refresh_table_display</code>로 안 됩니다. field catalog를 다시 만들어 <code>set_table_for_first_display</code>로 <b>재초기화</b>했습니다(그래서 위치·정렬이 처음으로 돌아갑니다). <code>is_stable</code>·<code>i_soft_refresh</code>는 <b>값 변경</b>용입니다.';
  }

  function reset() {
    opt = { row: false, col: false, soft: false }; extraCol = false; markRow = 0; userSorted = false;
    renderTable(); scrollEl.scrollTop = 0; scrollEl.scrollLeft = 0;
    statusEl.className = '';
    statusEl.innerHTML = '<b>① 28행으로 스크롤</b> → (선택) <b>SEATS_LEFT 정렬</b> → <b>값 갱신 + refresh</b> 순서로, 세 옵션 on/off에 따라 위치와 정렬이 어떻게 달라지는지 보세요.';
    render();
  }

  function render() { renderOpts(); renderCode(); }

  optEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; opt[b.getAttribute('data-o')] = !opt[b.getAttribute('data-o')]; render(); });
  actEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.getAttribute('data-a');
    if (a === 'scroll') scrollToTarget();
    else if (a === 'sort') doSort();
    else if (a === 'refresh') doRefresh();
    else if (a === 'struct') doStructChange();
    else if (a === 'reset') reset();
  });

  renderTable(); reset();
})();
