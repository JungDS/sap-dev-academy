/* color-unit-comparator 엔진 — 같은 회차 표에 '행 색 / 컬럼 색 / 셀 색 / 색 없음'을 실제로 칠해 세 단위의 차이를 눈으로 비교한다(CH22-L06).
   행 색(info_fname): 상태가 같은 줄 전체 · 컬럼 색(emphasize): 늘 중요한 컬럼 전체 · 셀 색(ctab_fname+LVC_T_SCOL): 조건 맞는 한 칸만.
   골격 계약: .cuc-unit(단위 버튼) · #cucTable · #cucCode · #cucWhy.
   config: window.CUC_CFG = { rows:[{concert_id,perf_no,capacity,booked,past}] }. 색은 CSS 클래스(토큰). 높이: _autoheight.js. */
(function () {
  var CFG = window.CUC_CFG || { rows: [] };
  var unit = 'none';   // none | row | col | cell

  var unitEl = document.querySelector('.cuc-unit');
  var tblEl = document.getElementById('cucTable');
  var codeEl = document.getElementById('cucCode');
  var whyEl = document.getElementById('cucWhy');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function left(r) { return r.capacity - r.booked; }

  var UNITS = [
    { k: 'row', l: '행 색 (info_fname)' },
    { k: 'col', l: '컬럼 색 (emphasize)' },
    { k: 'cell', l: '셀 색 (ctab_fname)' },
    { k: 'none', l: '색 없음' }
  ];

  var CODE = {
    row: '" 행 색 — 지난 회차 줄 전체를 회색으로\nls_layout-info_fname = \'LINE_COLOR\'.',
    col: '" 컬럼 색 — SEATS_LEFT 컬럼을 늘 강조\n<fc>-fieldname = \'SEATS_LEFT\'. <fc>-emphasize = \'C500\'.',
    cell: '" 셀 색 — 잔여 0인 그 칸만 빨강\nAPPEND VALUE lvc_s_scol( fname = \'SEATS_LEFT\'\n  color-col = col_negative color-int = 1 ) TO <r>-cellcolors.\nls_layout-ctab_fname = \'CELLCOLORS\'.',
    none: '" 색 없음 — 기본 표시(모든 수치가 정상일 때)'
  };
  var WHY = {
    row: '<b>행 색</b>은 <b>줄 전체가 같은 의미</b>일 때. 지난 회차는 줄 전체가 "무효"라 <code>info_fname</code>으로 행을 통째로 칠합니다.',
    col: '<b>컬럼 색</b>은 <b>특정 컬럼이 늘 중요</b>할 때. 잔여석은 항상 눈여겨볼 값이라 field catalog <code>emphasize</code>로 그 컬럼 전체를 강조합니다.',
    cell: '<b>셀 색</b>은 <b>행마다 달라지는 한 칸 조건</b>일 때. 매진(잔여 0)인 그 칸만 <code>LVC_T_SCOL</code>+<code>ctab_fname</code>으로 빨갛게 — 가장 세밀하지만 deep 구조라 비용도 큽니다.',
    none: '<b>색 없음</b>이 기본입니다. 다 칠하면 강조가 무의미해지니, 정말 중요한 것만 색을 줍니다. 색은 의미가 일관돼야 하고, 색만으로 전달하지 말고 텍스트·아이콘을 함께.'
  };

  function renderUnit() {
    unitEl.innerHTML = UNITS.map(function (u) {
      return '<button type="button" data-u="' + u.k + '" aria-pressed="' + (u.k === unit ? 'true' : 'false') + '">' + h(u.l) + '</button>';
    }).join('');
  }

  function cellClass(r, field) {
    if (unit === 'row' && r.past) return 'cuc-row-past';
    if (unit === 'col' && field === 'left') return 'cuc-col-emph';
    if (unit === 'cell' && field === 'left' && left(r) === 0) return 'cuc-cell-danger';
    return '';
  }
  function rowClass(r) { return (unit === 'row' && r.past) ? 'cuc-row-past' : ''; }

  function td(r, field, val) {
    var c = cellClass(r, field);
    return '<td' + (c ? ' class="' + c + '"' : '') + '>' + h(val) + '</td>';
  }

  function renderTable() {
    var head = '<tr><th>CONCERT_ID</th><th>PERF_NO</th><th>CAPACITY</th><th>BOOKED</th>' +
      '<th class="' + (unit === 'col' ? 'cuc-col-emph' : '') + '">SEATS_LEFT</th></tr>';
    var body = CFG.rows.map(function (r) {
      var l = left(r);
      var tag = r.past ? ' <span class="cuc-tag">지난</span>' : (l === 0 ? ' <span class="cuc-tag danger">매진</span>' : '');
      return '<tr class="' + rowClass(r) + '"><td>' + h(r.concert_id) + '</td><td>' + h(r.perf_no) + tag + '</td>' +
        '<td>' + r.capacity + '</td><td>' + r.booked + '</td>' + td(r, 'left', l) + '</tr>';
    }).join('');
    tblEl.innerHTML = '<table class="cuc-tbl"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }

  function renderCode() { codeEl.textContent = CODE[unit]; }
  function renderWhy() { whyEl.className = 'cuc-why' + (unit === 'none' ? '' : ' on'); whyEl.innerHTML = WHY[unit]; }

  function render() { renderUnit(); renderTable(); renderCode(); renderWhy(); }

  unitEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    unit = b.getAttribute('data-u'); render();
  });

  render();
})();
