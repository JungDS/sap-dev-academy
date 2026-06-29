/* concert-alv-color-lab 엔진 — CH21 capstone. ZCL_BOOKING_MANAGER->remaining()으로 구한 잔여석(seats_left)을 조건에 따라 색칠한다.
   seats_left <= 0 → 빨강(col_negative), <= 5 → 노랑(col_total). cellcolors deep를 ctab_fname으로 ALV에 연결해야 보인다.
   예매를 추가하면 잔여석이 줄어 셀 색이 노랑→빨강으로 바뀐다. ctab_fname을 끄면 색 데이터는 남아도 화면 색은 사라진다.
   골격 계약: .cacl-sel(세그) · .cacl-act(버튼) · #caclTable · #caclStatus.
   config: window.CACL_CFG = { rows:[{concert,perf,capacity,booked}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.CACL_CFG || { rows: [] };
  var added = CFG.rows.map(function () { return 0; });   // 추가 예매 수
  var sel = 0, ctabOff = false, bumped = -1;

  var selEl = document.querySelector('.cacl-sel');
  var actEl = document.querySelector('.cacl-act');
  var tblEl = document.getElementById('caclTable');
  var statusEl = document.getElementById('caclStatus');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function bookedOf(i) { return CFG.rows[i].booked + added[i]; }
  function leftOf(i) { return CFG.rows[i].capacity - bookedOf(i); }
  function colorOf(i) { var l = leftOf(i); return l <= 0 ? 'red' : (l <= 5 ? 'yellow' : ''); }

  function renderSel() {
    selEl.innerHTML = CFG.rows.map(function (r, i) {
      return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === sel ? 'true' : 'false') + '">' + h(r.concert) + '/' + h(r.perf) + '</button>';
    }).join('');
  }

  function renderActs() {
    actEl.innerHTML =
      '<button type="button" class="prim" data-a="add1">+1 예매</button>' +
      '<button type="button" class="prim" data-a="add5">+5 예매</button>' +
      '<button type="button" data-a="ctab" aria-pressed="' + (ctabOff ? 'true' : 'false') + '">ctab_fname 끄기</button>' +
      '<button type="button" data-a="reset">리셋</button>';
  }

  function renderTable() {
    var head = '<tr><th>CONCERT</th><th>PERF</th><th>CAPACITY</th><th>BOOKED</th><th>SEATS_LEFT</th></tr>';
    var body = CFG.rows.map(function (r, i) {
      var l = leftOf(i), c = ctabOff ? '' : colorOf(i);
      var cls = c ? 'left-' + c : '';
      var rowCls = (i === sel ? 'sel ' : '') + (i === bumped ? 'bumped' : '');
      return '<tr class="' + rowCls.trim() + '"><td>' + h(r.concert) + '</td><td>' + h(r.perf) + '</td><td>' + r.capacity + '</td><td>' + bookedOf(i) + '</td>' +
        '<td class="' + cls + '">' + l + '</td></tr>';
    }).join('');
    tblEl.innerHTML = '<table class="cacl-tbl"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }

  function renderStatus() {
    if (ctabOff) {
      statusEl.className = 'warn';
      statusEl.innerHTML = '⚠️ <code>ctab_fname</code> <b>끔</b> — <code>cellcolors</code> 데이터는 각 행에 그대로 있지만, layout에 연결을 끊으니 <b>화면 색이 사라집니다</b>. 색은 연결돼야 보입니다(L04).';
      return;
    }
    var reds = CFG.rows.filter(function (r, i) { return colorOf(i) === 'red'; }).length;
    var yel = CFG.rows.filter(function (r, i) { return colorOf(i) === 'yellow'; }).length;
    var s = CFG.rows[sel];
    statusEl.className = 'ok';
    statusEl.innerHTML = '✅ <code>' + h(s.concert) + '/' + h(s.perf) + '</code> 잔여석 <b>' + leftOf(sel) + '</b> → ' +
      (colorOf(sel) === 'red' ? '<b>빨강(매진)</b>' : colorOf(sel) === 'yellow' ? '<b>노랑(임박)</b>' : '색 없음(정상)') +
      '. 전체 매진 ' + reds + '·임박 ' + yel + '. 예매를 더하면 <code>remaining( )</code>이 줄어 색이 바뀝니다.';
  }

  function render() { renderSel(); renderActs(); renderTable(); renderStatus(); }

  selEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sel = +b.getAttribute('data-i'); bumped = -1; render(); });
  actEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.getAttribute('data-a');
    if (a === 'add1') { added[sel] += 1; bumped = sel; }
    else if (a === 'add5') { added[sel] += 5; bumped = sel; }
    else if (a === 'ctab') { ctabOff = !ctabOff; }
    else if (a === 'reset') { added = CFG.rows.map(function () { return 0; }); ctabOff = false; sel = 0; bumped = -1; }
    render();
  });

  render();
})();
