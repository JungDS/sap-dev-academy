/* booking-manager-lab 엔진 — CH21 캡스톤. ZCL_BOOKING_MANAGER의 동작을 그대로 재현해 본다.
   remaining( ) = mv_cap - SUM(seats WHERE status <> 'C')  → 취소 예약이 합계에서 빠지는 것을 눈으로 확인.
   book( ) 분기: 좌석<=0 또는 >잔여석 → RAISE EXCEPTION(zcx_fully_booked) / 좌석=잔여석 → RAISE EVENT sold_out / 그 외 → 검증 통과.
   SET HANDLER 토글로 handler 미등록 시 이벤트가 나도 아무도 안 듣는 것(L09 흔한 실수)까지 보여 준다.
   저장(INSERT)은 이 챕터 밖(이후 DML 챕터) — 랩에서도 저장하지 않는다.
   골격 계약: #bmlSeats(좌석 세그) · #bmlBtns(동작) · #bmlState(상태) · #bmlLog(피드백).
   config: window.BML_CFG = { concert, perf, cap, bookings:[{id,seats,status}], seatChoices:[] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.BML_CFG || {};
  var CONCERT = CFG.concert || 'C001';
  var PERF = CFG.perf || '01';
  var CAP = typeof CFG.cap === 'number' ? CFG.cap : 100;
  var BOOKINGS = CFG.bookings || [];
  var CHOICES = CFG.seatChoices || [0, 1, 2, 3];
  var CANCEL = 'C';

  var seatsEl = document.getElementById('bmlSeats');
  var btnsEl = document.getElementById('bmlBtns');
  var stateEl = document.getElementById('bmlState');
  var logEl = document.getElementById('bmlLog');

  var seats = CHOICES.length > 1 ? CHOICES[1] : 0;
  var handlerOn = true;
  var last = null;   // null | 'ok' | 'event' | 'exception'

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function bookedSeats() {
    var n = 0;
    BOOKINGS.forEach(function (b) { if (b.status !== CANCEL) n += b.seats; });
    return n;
  }
  function cancelledSeats() {
    var n = 0;
    BOOKINGS.forEach(function (b) { if (b.status === CANCEL) n += b.seats; });
    return n;
  }
  function remaining() { return CAP - bookedSeats(); }
  function canBook() { return seats > 0 && seats <= remaining(); }

  function renderSeats() {
    seatsEl.innerHTML = CHOICES.map(function (v) {
      return '<button type="button" data-s="' + v + '" aria-pressed="' + (v === seats ? 'true' : 'false') + '">iv_seats = ' + v + '</button>';
    }).join('');
  }

  function renderBtns() {
    btnsEl.innerHTML =
      '<button type="button" data-a="book">' + 'lo_mgr-&gt;book( ) 실행</button>' +
      '<button type="button" data-a="handler" aria-pressed="' + (handlerOn ? 'true' : 'false') + '">SET HANDLER ' + (handlerOn ? '등록됨' : '해제됨') + '</button>' +
      '<button type="button" data-a="reset">리셋</button>';
  }

  function renderState() {
    var lastTxt = '—', lastCls = '';
    if (last === 'ok') { lastTxt = '검증 통과'; lastCls = 'ok'; }
    else if (last === 'event') { lastTxt = 'sold_out 이벤트'; lastCls = 'ok'; }
    else if (last === 'exception') { lastTxt = 'ZCX_FULLY_BOOKED'; lastCls = 'bad'; }
    stateEl.innerHTML =
      '<div><span class="k">정원 mv_cap</span><span class="v">' + CAP + '</span></div>' +
      '<div><span class="k">예약 합계 (취소 제외)</span><span class="v">' + bookedSeats() + '</span></div>' +
      '<div><span class="k">잔여석 remaining( )</span><span class="v ok">' + remaining() + '</span></div>' +
      '<div><span class="k">can_book( ' + seats + ' )</span><span class="v ' + (canBook() ? 'ok' : 'bad') + '">' + (canBook() ? 'abap_true' : 'abap_false') + '</span></div>' +
      '<div><span class="k">마지막 book( ) 결과</span><span class="v ' + lastCls + '">' + lastTxt + '</span></div>';
  }

  function log(cls, html) { logEl.className = 'cd-log' + (cls ? ' ' + cls : ''); logEl.innerHTML = html; }

  function doBook() {
    var rem = remaining();
    if (seats <= 0 || seats > rem) {
      last = 'exception';
      var why = seats <= 0
        ? '좌석 수가 <code>0</code> 이하라 업무적으로 말이 안 됩니다'
        : '요청 <code>' + seats + '</code>석이 잔여석 <code>' + rem + '</code>석을 넘습니다';
      log('bad', '<code>RAISE EXCEPTION TYPE zcx_fully_booked</code> — ' + why +
        '. 실패는 화면 메시지가 아니라 <b>예외 객체</b>로 호출자에게 전달되고, 바깥 <code>TRY/CATCH</code>가 <code>get_text( )</code>로 사용자 메시지를 만듭니다.');
    } else if (seats === rem) {
      last = 'event';
      var tail = handlerOn
        ? ' 등록된 handler <code>on_sold_out</code>이 호출돼 매진 알림이 돕니다.'
        : ' 그런데 <b>SET HANDLER가 해제</b>돼 있어 이벤트가 나도 <b>아무도 듣지 않습니다</b>. 선언만으로는 연결되지 않습니다.';
      log(handlerOn ? 'ok' : 'bad', '검증 통과 + <code>RAISE EVENT sold_out</code> — 요청 <code>' + seats +
        '</code>석이 잔여석과 정확히 같아 이 회차가 매진됩니다.' + tail);
    } else {
      last = 'ok';
      log('ok', '검증 통과 — 요청 <code>' + seats + '</code>석은 잔여석 <code>' + rem +
        '</code>석 안입니다. 예외도 이벤트도 없습니다. (실제 <code>INSERT</code> 저장은 이 챕터 밖, 이후 DML 챕터의 몫입니다.)');
    }
    render();
  }

  function doReset() {
    seats = CHOICES.length > 1 ? CHOICES[1] : 0;
    handlerOn = true; last = null;
    log('', '공연 <code>' + h(CONCERT) + '</code> 회차 <code>' + h(PERF) + '</code> · 정원 <code>' + CAP +
      '</code>석. 예약 원본에는 취소(<code>status = \'C\'</code>) <b>' + cancelledSeats() +
      '석</b>이 섞여 있는데, <code>remaining( )</code>이 이를 빼서 잔여석 <b>' + remaining() + '석</b>을 냅니다. 좌석 수를 바꿔 가며 <code>book( )</code>을 실행해 보세요.');
    render();
  }

  function render() { renderSeats(); renderBtns(); renderState(); }

  seatsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    seats = parseInt(b.getAttribute('data-s'), 10); last = null; render();
  });
  btnsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.getAttribute('data-a');
    if (a === 'book') doBook();
    else if (a === 'handler') { handlerOn = !handlerOn; render(); }
    else doReset();
  });

  doReset();
})();
