/* salv-control-panel 엔진 — display( ) 전에 SALV 하위 객체로 표준기능·기본정렬·기본필터를 지정하면 첫 화면이 어떻게 달라지는지 보여 준다.
   정렬을 켜면 행이 PERF_DATE 순으로, 필터를 켜면 취소(STATUS=C) 행이 빠진다. 필드명을 틀리면 SALV가 컬럼을 못 찾는다.
   골격 계약: .scp-ctrl(토글 버튼) · #scpCode · #scpTable · #scpStatus.
   config: window.SCP_CFG = { rows, sortCol, filterCol, badCol }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SCP_CFG || { rows: [], sortCol: 'PERF_DATE', filterCol: 'STATUS', badCol: 'PERFDATE' };
  var st = { func: false, sort: false, filter: false, bad: false };

  var ctrlEl = document.querySelector('.scp-ctrl');
  var codeEl = document.getElementById('scpCode');
  var tblEl = document.getElementById('scpTable');
  var statusEl = document.getElementById('scpStatus');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function renderCtrl() {
    var items = [
      { k: 'func', l: '표준 기능 켜기' }, { k: 'sort', l: 'PERF_DATE 정렬' },
      { k: 'filter', l: '취소 제외 필터' }, { k: 'bad', l: '필드명 오타 실행', cls: 'bad' }
    ];
    ctrlEl.innerHTML = items.map(function (it) {
      return '<button type="button" data-k="' + it.k + '" class="' + (it.cls || '') + '" aria-pressed="' + (st[it.k] ? 'true' : 'false') + '">' + h(it.l) + '</button>';
    }).join('') + '<button type="button" class="reset" data-k="reset">리셋</button>';
  }

  function renderCode() {
    var sortName = st.bad ? '<span class="bad">\'' + CFG.badCol + '\'</span>' : '\'' + CFG.sortCol + '\'';
    function ln(on, html) { return '<span class="' + (on ? 'on' : 'off') + '">' + html + '</span>'; }
    codeEl.innerHTML =
      '<span class="fn">cl_salv_table=&gt;factory</span>( IMPORTING r_salv_table = DATA(lo) CHANGING t_table = lt_perf ).\n' +
      ln(st.func, 'lo-&gt;<span class="fn">get_functions</span>( )-&gt;set_all( abap_true ).') + '\n' +
      ln(st.sort || st.bad, 'lo-&gt;<span class="fn">get_sorts</span>( )-&gt;add_sort( ' + sortName + ' ).') + '\n' +
      ln(st.filter, 'lo-&gt;<span class="fn">get_filters</span>( )-&gt;add_filter( \'STATUS\' sign=\'I\' option=\'NE\' low=\'C\' ).') + '\n' +
      'lo-&gt;<span class="fn">display</span>( ).';
  }

  function statusClass(s) { return s === 'C' ? ' class="stat-c"' : (s === 'F' ? ' class="stat-f"' : ''); }

  function renderTable() {
    var rows = CFG.rows.slice();
    if (st.sort && !st.bad) rows.sort(function (a, b) { return a.perf_date < b.perf_date ? -1 : a.perf_date > b.perf_date ? 1 : 0; });
    var visible = 0;
    var body = rows.map(function (r) {
      var hide = st.filter && r.status === 'C';
      if (!hide) visible++;
      return '<tr class="' + (hide ? 'hidden' : '') + '"><td>' + h(r.perf_date) + '</td><td' + statusClass(r.status) + '>' + h(r.status) + '</td><td>' + r.capacity + '</td><td>' + r.seatsocc + '</td></tr>';
    }).join('');
    var sortedCls = (st.sort && !st.bad) ? ' class="sorted"' : '';
    tblEl.innerHTML = '<table class="scp-tbl"><thead><tr><th' + sortedCls + '>PERF_DATE</th><th>STATUS</th><th>CAPACITY</th><th>SEATSOCC</th></tr></thead><tbody>' + body + '</tbody></table>';
    return visible;
  }

  function renderStatus(visible) {
    if (st.bad) {
      statusEl.className = 'bad';
      statusEl.innerHTML = '🚫 <b>컬럼 <code>' + CFG.badCol + '</code>를 찾을 수 없습니다.</b> <code>add_sort</code>의 컬럼명은 화면 제목이 아니라 <b>내부 테이블 필드명</b>(<code>' + CFG.sortCol + '</code>)이어야 합니다.';
      return;
    }
    var parts = [];
    parts.push(st.func ? '표준 기능 <b>ON</b>(정렬·합계·엑셀 보임)' : '표준 기능 off');
    parts.push(st.sort ? 'PERF_DATE <b>정렬됨</b>' : '정렬 off');
    parts.push(st.filter ? '취소(C) <b>제외</b>' : '필터 off');
    statusEl.className = (st.func || st.sort || st.filter) ? 'ok' : '';
    statusEl.innerHTML = parts.join(' · ') + ' — 보이는 행 <b>' + visible + ' / ' + CFG.rows.length + '</b>. 이 모든 게 <code>display( )</code> <b>전에</b> 지정됩니다.';
  }

  function render() { renderCtrl(); renderCode(); renderStatus(renderTable()); }

  ctrlEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = b.getAttribute('data-k');
    if (k === 'reset') { st = { func: false, sort: false, filter: false, bad: false }; }
    else if (k === 'bad') { st.bad = !st.bad; }
    else { st[k] = !st[k]; if (st.bad && (k === 'sort')) st.bad = false; }
    render();
  });

  render();
})();
