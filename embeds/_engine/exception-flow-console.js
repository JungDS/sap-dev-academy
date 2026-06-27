/* exception-flow-console 엔진 — 좌석 수(정상/정원 초과)와 CATCH 순서에 따라 TRY/CATCH 실행 흐름이 어떻게 흐르는지 단계로 보여 준다.
   정원 초과면 RAISE EXCEPTION → CATCH로 점프하고, CATCH를 cx_root 먼저 두면 구체 handler가 도달 불가가 된다.
   골격 계약: .efc-seats · .efc-order(세그) · #efcCode · #efcFlow · #efcVerdict.
   config: window.EFC_CFG = { remaining, normalSeats, overSeats }. 높이: _autoheight.js. */
(function () {
  var CFG = window.EFC_CFG || { remaining: 40, normalSeats: 2, overSeats: 100 };
  var seats = 'normal';   // normal | over
  var order = 'specific'; // specific(구체 먼저) | root(cx_root 먼저)

  var seatsEl = document.querySelector('.efc-seats');
  var orderEl = document.querySelector('.efc-order');
  var codeEl = document.getElementById('efcCode');
  var flowEl = document.getElementById('efcFlow');
  var verEl = document.getElementById('efcVerdict');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function seatVal() { return seats === 'over' ? CFG.overSeats : CFG.normalSeats; }
  function isOver() { return seatVal() > CFG.remaining; }

  function renderSeg(host, items, active) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + h(it.l) + '</button>';
    }).join('');
  }

  function renderCode() {
    // CATCH 순서에 따라 두 핸들러 배치, root 먼저면 구체 handler dead
    var specific = '  <span class="fn">CATCH</span> <span class="cx">zcx_fully_booked</span> <span class="fn">INTO</span> DATA(lx).';
    var root = '  <span class="fn">CATCH</span> <span class="cx">cx_root</span>.';
    var lines;
    if (order === 'specific') {
      lines = specific + '\n' + root;
    } else {
      // cx_root 먼저 → 구체 handler 도달 불가(dead)
      lines = root + '\n  <span class="dead">CATCH zcx_fully_booked INTO DATA(lx).  \" 도달 불가</span>';
    }
    codeEl.innerHTML =
      '<span class="fn">TRY</span>.\n' +
      '    lo_mgr-&gt;book( iv_seats = ' + seatVal() + ' ).\n' +
      '    <span class="fn">WRITE</span>: / \'예약 가능\'.\n' +
      lines + '\n' +
      '<span class="fn">ENDTRY</span>.';
  }

  function renderFlow() {
    var steps = [];
    steps.push({ ic: '①', cls: 'ran', t: '<code>TRY</code> 진입' });
    steps.push({ ic: '②', cls: 'ran', t: '<code>book( iv_seats = ' + seatVal() + ' )</code> 호출 — 잔여석 ' + CFG.remaining });
    if (isOver()) {
      steps.push({ ic: '③', cls: 'raise', t: '<code>' + seatVal() + ' &gt; ' + CFG.remaining + '</code> → <code>RAISE EXCEPTION zcx_fully_booked</code>' });
      if (order === 'specific') {
        steps.push({ ic: '④', cls: 'caught', t: '<code>CATCH zcx_fully_booked</code>가 잡음 → <code>get_text( )</code>로 메시지' });
      } else {
        steps.push({ ic: '④', cls: 'caught', t: '<code>CATCH cx_root</code>가 <b>먼저</b> 잡음 — 구체 handler까지 가지 못함' });
      }
      steps.push({ ic: '·', cls: 'skip', t: '<code>WRITE \'예약 가능\'</code>은 실행되지 않음(예외로 건너뜀)' });
    } else {
      steps.push({ ic: '③', cls: 'ran', t: '<code>' + seatVal() + ' ≤ ' + CFG.remaining + '</code> → 예외 없음, 정상 복귀' });
      steps.push({ ic: '④', cls: 'ran', t: '<code>WRITE \'예약 가능\'</code> 실행' });
      steps.push({ ic: '·', cls: 'skip', t: 'CATCH 블록은 실행되지 않음' });
    }
    flowEl.innerHTML = steps.map(function (s) {
      return '<li class="' + s.cls + '"><span class="ic">' + s.ic + '</span><span>' + s.t + '</span></li>';
    }).join('');
  }

  function renderVerdict() {
    if (!isOver()) {
      verEl.className = 'ok';
      verEl.innerHTML = '✅ <b>정상 흐름</b> — 잔여석 안이라 예외가 없고, <code>TRY</code> 블록이 끝까지 실행됩니다. <code>CATCH</code>는 건너뜁니다.';
      return;
    }
    if (order === 'root') {
      verEl.className = 'warn';
      verEl.innerHTML = '⚠️ <b>CATCH 순서 문제</b> — <code>cx_root</code>가 먼저라 모든 예외를 가로채, 구체 <code>zcx_fully_booked</code> handler는 <b>도달 불가</b>가 됩니다. <b>구체 예외부터, 일반 예외는 뒤로.</b>';
      return;
    }
    verEl.className = 'bad';
    verEl.innerHTML = '🔻 <b>실패 흐름(정상 처리됨)</b> — <code>RAISE EXCEPTION</code>이 발생해 <code>CATCH zcx_fully_booked</code>로 점프. 오류를 <b>객체</b>로 받아 메시지로 바꿉니다(클래스는 던지고, 호출자가 처리).';
  }

  function render() {
    renderSeg(seatsEl, [{ v: 'normal', l: 'iv_seats = ' + CFG.normalSeats + ' (정상)' }, { v: 'over', l: 'iv_seats = ' + CFG.overSeats + ' (정원 초과)' }], seats);
    renderSeg(orderEl, [{ v: 'specific', l: '구체 먼저' }, { v: 'root', l: 'cx_root 먼저' }], order);
    renderCode(); renderFlow(); renderVerdict();
  }

  seatsEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; seats = b.getAttribute('data-v'); render(); });
  orderEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; order = b.getAttribute('data-v'); render(); });

  render();
})();
