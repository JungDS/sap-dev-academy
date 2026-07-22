/* enqueue-2session — 두 세션 ENQUEUE/DEQUEUE 동시성 체험 (CH26-L02).
   같은 예매(1001)에 대해 한쪽이 E 잠금을 잡으면 다른 쪽 ENQUEUE는 foreign_lock(거절).
   DEQUEUE 또는 COMMIT WORK(자동 해제)로 풀리면 상대가 잠글 수 있다. SM12풍 잠금 목록 표시. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var KEY = '1001';
  var lock = null;   // null | {owner:'A'|'B'}
  var NM = { A: 'User A (정훈영)', B: 'User B (손흥민)' };

  function log(u, cls, html) { $('log' + u).innerHTML = '<span class="' + cls + '">' + html + '</span>'; }

  function render() {
    // 소유 배지
    $('ownA').style.display = (lock && lock.owner === 'A') ? '' : 'none';
    $('ownB').style.display = (lock && lock.owner === 'B') ? '' : 'none';
    // SM12
    if (!lock) $('sm12b').innerHTML = '<span class="empty">잠금 없음 — 누구든 ENQUEUE 가능.</span>';
    else $('sm12b').innerHTML = '<div class="lockrow ' + lock.owner.toLowerCase() + '"><span>EZ_BOOKING</span><span>booking_id=' + KEY + '</span><span class="m">E</span><span class="ownr">' + NM[lock.owner] + '</span></div>';
    $('sm12n').textContent = lock ? '1건' : '0건';
    post();
  }

  function enqueue(u) {
    if (!lock) { lock = { owner: u }; log(u, 'ok', '✓ ENQUEUE 성공 — <code>' + KEY + '</code>을(를) 잠갔습니다. 이제 편집 가능.'); }
    else if (lock.owner === u) { log(u, 'ok', '✓ 이미 내가 잠근 상태(누적). 그대로 편집.'); }
    else { log(u, 'no', '✕ foreign_lock — <b>' + NM[lock.owner] + '</b>가 편집 중입니다. <code>sy-subrc=1</code> → "편집 중" 안내 후 거절.'); }
    render();
  }
  function dequeue(u) {
    if (lock && lock.owner === u) { lock = null; log(u, 'ok', '✓ DEQUEUE — 잠금을 풀었습니다. 이제 상대도 잠글 수 있어요.'); }
    else log(u, '', '내가 가진 잠금이 없습니다(DEQUEUE 무효).');
    render();
  }
  function commit(u) {
    if (lock && lock.owner === u) { lock = null; log(u, 'ok', '✓ COMMIT WORK — 변경 확정과 함께 잠금이 <b>자동 해제</b>됐습니다.'); }
    else log(u, '', 'COMMIT WORK 실행(확정). 내 잠금은 없었습니다.');
    render();
  }

  ['A', 'B'].forEach(function (u) {
    $('enq' + u).addEventListener('click', function () { enqueue(u); });
    $('deq' + u).addEventListener('click', function () { dequeue(u); });
    $('com' + u).addEventListener('click', function () { commit(u); });
  });
  $('reset').addEventListener('click', function () { lock = null; log('A', '', '버튼으로 같은 예매를 잠가 보세요.'); log('B', '', '먼저 A가 잠그면 B의 ENQUEUE는 거절됩니다.'); render(); });

  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  $('reset').click();
})();
