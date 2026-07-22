/* luw-timeline — SAP LUW / Update Task 타이밍 체험 (CH25-L03).
   단계 진행: 화면입력 → IN UPDATE TASK 등록(큐에만!) → 추가 처리 → COMMIT WORK(이때 DB 기록).
   핵심 학습: 함수를 '호출'해도 IN UPDATE TASK면 즉시 실행 안 됨 → COMMIT 시점에 update work process가 실행. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var kw = function (s) { return '<span class="kw">' + s + '</span>'; };
  var cmt = function (s) { return '<span class="cmt">' + s + '</span>'; };

  var STEPS = [
    { name: '화면 입력', echo: cmt('" 사용자가 예매 화면에서 입력 (SAP LUW 시작)'), q: [], db: [],
      narr: '사용자가 여러 화면을 거치며 작업합니다. 이 전체 업무 묶음이 <span class="hot">SAP LUW</span>예요. 아직 DB엔 아무것도 없습니다.' },
    { name: 'IN UPDATE TASK 등록', echo: kw('CALL FUNCTION') + " 'Z_SAVE_BOOKING' " + kw('IN UPDATE TASK') + '\n  ' + kw('EXPORTING') + ' is_booking = ls_booking.', q: ['Z_SAVE_BOOKING (등록됨, 대기)'], db: [],
      narr: '함수를 <b>호출</b>했지만 <span class="hot">IN UPDATE TASK</span>라서 <b>지금 실행되지 않습니다</b>. "COMMIT 때 실행해 줘"라고 <b>예약</b>만 한 것 — 큐에 등록됐고 <b>DB는 여전히 비어 있습니다</b>.' },
    { name: '추가 처리', echo: cmt('" 다른 검증·계산 … (여전히 COMMIT 전)'), q: ['Z_SAVE_BOOKING (등록됨, 대기)'], db: [],
      narr: '중간에 다른 처리를 더 해도 등록된 태스크는 <b>여전히 대기</b>입니다. "방금 호출했으니 DB에 있겠지"라고 기대하면 틀려요 — 아직 없습니다.' },
    { name: 'COMMIT WORK', echo: kw('COMMIT WORK') + '.   ' + cmt('" 이 순간 등록된 update task 실행 → DB 기록'), q: [], db: ['ZBOOKING 1건', 'ZBOOKING_ITEM 2석'],
      narr: '<span class="hot">COMMIT WORK</span>로 SAP LUW가 끝나는 순간, 등록돼 있던 update task가 <b>Update Work Process</b>에서 실행되어 <b>비로소 DB에 기록</b>됩니다. 이 실제 쓰기 한 묶음이 <span class="hot">DB LUW</span>예요.' }
  ];
  var i = 0;

  function render() {
    var st = STEPS[i];
    [].forEach.call(document.querySelectorAll('.steps .s'), function (el, k) { el.className = 's' + (k < i ? ' done' : k === i ? ' on' : ''); });
    $('echo').innerHTML = st.echo;
    $('q').innerHTML = st.q.length ? st.q.map(function (r) { return '<div class="rec q">' + r + '</div>'; }).join('') : '<span class="ph">대기 중인 update task 없음.</span>';
    $('db').innerHTML = st.db.length ? st.db.map(function (r) { return '<div class="rec db">' + r + '</div>'; }).join('') : '<span class="ph">확정된 데이터 없음.</span>';
    $('qPill').textContent = st.q.length + '건 대기';
    $('dbPill').textContent = st.db.length + '건 확정';
    $('narr').innerHTML = st.narr;
    $('next').disabled = (i >= STEPS.length - 1);
    $('next').textContent = (i >= STEPS.length - 1) ? '끝 — COMMIT 완료' : '다음 단계 ▶';
    post();
  }
  $('next').addEventListener('click', function () { if (i < STEPS.length - 1) { i++; render(); } });
  $('reset').addEventListener('click', function () { i = 0; render(); });

  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);

  render();
})();
