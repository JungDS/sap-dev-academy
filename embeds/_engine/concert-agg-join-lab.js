/* concert-agg-join-lab 엔진 — zconcert LEFT OUTER JOIN zbooking + GROUP BY 집계.
   취소(status='C') 제외 조건을 JOIN의 ON에 둘지 WHERE에 둘지에 따라, 예매가 없는 공연(C003)이 살아남는지 사라지는지가 달라진다.
   COALESCE 토글로 예매 없는 공연의 합계를 null↔0으로 본다.
   골격 계약: .cajl-cond(세그) · .cajl-coal(세그) · #cajlConcert · #cajlBook · #cajlCode · #cajlResult · #cajlNote.
   config: window.CAJL_CFG = { concerts:[{id,artist,cap}], bookings:[{id,concert,customer,seats,status}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.CAJL_CFG;
  var cond = 'on';   // 취소 제외 조건 위치: on | where
  var coal = true;   // COALESCE 사용

  var condEl = document.querySelector('.cajl-cond');
  var coalEl = document.querySelector('.cajl-coal');
  var concEl = document.getElementById('cajlConcert');
  var bookEl = document.getElementById('cajlBook');
  var codeEl = document.getElementById('cajlCode');
  var resEl = document.getElementById('cajlResult');
  var noteEl = document.getElementById('cajlNote');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function renderSeg(host, items, active) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + h(it.l) + '</button>';
    }).join('');
  }

  function srcTables() {
    concEl.innerHTML = '<p class="cajl-h">zconcert</p><table class="cajl-tbl"><thead><tr><th>concert_id</th><th>artist</th><th>cap</th></tr></thead><tbody>' +
      CFG.concerts.map(function (c) { return '<tr><td>' + h(c.id) + '</td><td>' + h(c.artist) + '</td><td>' + c.cap + '</td></tr>'; }).join('') + '</tbody></table>';
    bookEl.innerHTML = '<p class="cajl-h">zbooking</p><table class="cajl-tbl"><thead><tr><th>concert</th><th>customer</th><th>seats</th><th>status</th></tr></thead><tbody>' +
      CFG.bookings.map(function (b) {
        var cx = b.status === 'C' ? ' class="cancel"' : '';
        return '<tr><td>' + h(b.concert) + '</td><td>' + h(b.customer) + '</td><td' + cx + '>' + b.seats + '</td><td' + cx + '>' + h(b.status) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  // 각 공연의 (취소 제외) 좌석 합계와 활성 예매 수
  function aggregate() {
    return CFG.concerts.map(function (c) {
      var active = CFG.bookings.filter(function (b) { return b.concert === c.id && b.status !== 'C'; });
      var sum = active.reduce(function (a, b) { return a + b.seats; }, 0);
      return { id: c.id, artist: c.artist, cap: c.cap, hasActive: active.length > 0, sum: sum };
    });
  }

  function renderResult() {
    var rows = aggregate();
    // WHERE 위치 → 활성 예매 없는 공연은 outer join 후 WHERE에 걸려 사라진다
    var visible = rows.filter(function (r) { return cond === 'on' ? true : r.hasActive; });
    var body = visible.map(function (r) {
      var bookedRaw = r.hasActive ? r.sum : null;          // 예매 없으면 SUM = null
      var bookedDisp, bookedCls = '';
      if (bookedRaw === null) {
        if (coal) { bookedDisp = '0'; } else { bookedDisp = 'null'; bookedCls = ' class="nul"'; }
      } else { bookedDisp = String(bookedRaw); }
      var bookedVal = bookedRaw === null ? (coal ? 0 : 0) : bookedRaw;   // 상태 계산은 COALESCE 기준 0
      var status = bookedVal >= r.cap ? 'FULL' : 'OPEN';
      var stCls = status === 'FULL' ? 'full' : 'open';
      var keep = (cond === 'on' && !r.hasActive) ? ' class="kept"' : '';
      return '<tr' + keep + '><td>' + h(r.id) + '</td><td>' + h(r.artist) + '</td><td' + bookedCls + '>' + bookedDisp + '</td><td>' + r.cap + '</td><td class="' + stCls + '">' + status + '</td></tr>';
    }).join('');
    resEl.innerHTML = '<table class="cajl-tbl res"><thead><tr><th>concert_id</th><th>artist</th><th>booked</th><th>cap</th><th>seat_status</th></tr></thead><tbody>' + body + '</tbody></table>';

    // note
    var lost = rows.filter(function (r) { return !r.hasActive; });
    if (cond === 'on') {
      noteEl.className = 'good';
      noteEl.innerHTML = '✅ <b>조건을 <code>ON</code>에</b> — 취소 제외를 join 조건에 두니, 예매가 없는 <code>' + (lost[0] ? lost[0].id : 'C003') + '</code>도 <b>목록에 남습니다</b>(' + (coal ? 'COALESCE로 0' : 'SUM은 null') + ').';
    } else {
      noteEl.className = '';
      noteEl.innerHTML = '⚠️ <b>조건을 <code>WHERE</code>에</b> — outer join 뒤 <code>WHERE b~status &lt;&gt; \'C\'</code>가 <b>오른쪽 null 행을 지워</b>, 예매 없는 <code>' + (lost[0] ? lost[0].id : 'C003') + '</code>가 <b>사라집니다</b>. 보존이 목적이면 조건은 <code>ON</code>에.';
    }
  }

  function renderCode() {
    var onCls = cond === 'on' ? 'hot' : '';
    var whCls = cond === 'where' ? 'hot' : '';
    var sumExpr = coal ? '<span class="fn">COALESCE</span>( <span class="fn">SUM</span>( b~seats ), 0 )' : '<span class="fn">SUM</span>( b~seats )';
    var onLine = '    <span class="fn">AND</span> ' + (cond === 'on' ? '<span class="hot">b~status &lt;&gt; \'C\'</span>' : 'b~status &lt;&gt; \'C\'');
    var whLine = cond === 'where' ? '\n  <span class="fn">WHERE</span> <span class="hot">b~status &lt;&gt; \'C\'</span>' : '';
    codeEl.innerHTML =
      '<span class="fn">SELECT</span> c~concert_id, c~artist, c~capacity,\n' +
      '       ' + sumExpr + ' <span class="as">AS booked</span>\n' +
      '  <span class="fn">FROM</span> zconcert <span class="fn">AS</span> c\n' +
      '  <span class="fn">LEFT OUTER JOIN</span> zbooking <span class="fn">AS</span> b\n' +
      '    <span class="fn">ON</span>  b~concert_id = c~concert_id\n' +
      onLine + whLine + '\n' +
      '  <span class="fn">WHERE</span> c~concert_id <span class="fn">IN</span> <span class="esc">@s_conc</span>\n' +
      '  <span class="fn">GROUP BY</span> c~concert_id, c~artist, c~capacity\n' +
      '  <span class="fn">INTO TABLE</span> <span class="esc">@DATA(lt_stat)</span>.';
  }

  function render() {
    renderSeg(condEl, [{ v: 'on', l: '취소 제외 → ON' }, { v: 'where', l: '취소 제외 → WHERE' }], cond);
    renderSeg(coalEl, [{ v: 'y', l: 'COALESCE 0' }, { v: 'n', l: 'SUM 그대로' }], coal ? 'y' : 'n');
    srcTables(); renderCode(); renderResult();
  }

  condEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; cond = b.getAttribute('data-v'); render(); });
  coalEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; coal = b.getAttribute('data-v') === 'y'; render(); });

  render();
})();
