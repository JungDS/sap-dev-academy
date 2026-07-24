/* txn-atomicity — COMMIT/ROLLBACK 원자성 체험 (CH25-L02).
   ① 예매 처리 = 금·토 두 회차 ZBOOKING INSERT를 '미확정(메모리)'에 쌓는다('둘째 실패' 토글 시 토 회차 sy-subrc=4).
   ② COMMIT WORK = 미확정 → DB 확정(단, 둘째 실패인데 COMMIT하면 금 회차만 남는 '반쪽 저장' 사고를 보여 준다).
   ③ ROLLBACK WORK = 미확정 전부 폐기(DB 그대로). 핵심 = 문장마다 실패 누적(lv_failed)→업무 단위 전체 성공일 때만 COMMIT, 아니면 ROLLBACK. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var pending = null;   // {headOk, itemOk}
  var db = { head: false, items: false };

  function recHTML(kind, label, ok) {
    return '<div class="rec ' + kind + (ok ? ' ok' : ' fail') + '"><span class="tag">' + (kind === 'head' ? 'HEADER' : 'ITEM') + '</span>' +
      '<span>' + label + '</span><span class="st">' + (ok ? '✓ sy-subrc=0' : '✕ sy-subrc=4') + '</span></div>';
  }
  function render() {
    // 메모리(미확정)
    if (!pending) $('mem').innerHTML = '<span class="ph">아직 처리 전 — ① 예매 처리를 눌러 INSERT하세요.</span>';
    else $('mem').innerHTML = recHTML('head', '금 회차 예매(정훈영)', pending.headOk) + recHTML('item', '토 회차 예매(정훈영)', pending.itemOk);
    // DB(확정)
    var d = [];
    if (db.head) d.push(recHTML('head', '금 회차 예매(정훈영)', true));
    if (db.items) d.push(recHTML('item', '토 회차 예매(정훈영)', true));
    $('db').innerHTML = d.length ? d.join('') : '<span class="ph">확정된 데이터 없음.</span>';
    // 버튼 상태
    var has = !!pending;
    $('commit').disabled = !has; $('rollback').disabled = !has;
    $('commit').classList.toggle('on', has); $('rollback').classList.toggle('on', has);
    post();
  }
  function setMsg(c, h) { var m = $('msg'); m.className = 'msg ' + c; m.innerHTML = h; post(); }

  $('process').addEventListener('click', function () {
    var fail = $('failItem').checked;
    pending = { headOk: true, itemOk: !fail };
    render();
    if (fail) setMsg('bad', '둘째(토) INSERT가 <b>실패</b>했습니다(sy-subrc=4). 지금 <b>COMMIT</b>하면 금 회차만 남는 <b>반쪽 저장</b> 사고가 납니다. 올바른 선택은? → 아래 두 버튼으로 직접.');
    else setMsg('info', '금·토 INSERT 모두 <b>성공</b>(미확정 상태). 아직 DB엔 안 들어갔습니다 — <b>COMMIT</b>해야 확정됩니다.');
  });

  $('commit').addEventListener('click', function () {
    if (!pending) return;
    db.head = db.head || pending.headOk;
    db.items = db.items || pending.itemOk;     // 실패한 둘째(토) 회차는 안 들어감 → 금 회차만 확정될 수 있음
    var halfway = pending.headOk && !pending.itemOk;
    pending = null; render();
    if (halfway) setMsg('bad', '⚠ <b>반쪽 저장 발생!</b> 금 회차는 확정됐는데 토 회차는 빠졌습니다 — 반쪽짜리 <b>묶음 예매</b>. 실패를 확인했다면 COMMIT이 아니라 <b>ROLLBACK</b>했어야 합니다.');
    else setMsg('ok', '✓ <b>COMMIT WORK</b> — 금·토가 <b>함께</b> DB에 확정됐습니다(원자성 OK).');
  });

  $('rollback').addEventListener('click', function () {
    if (!pending) return;
    var wasFail = !pending.itemOk;
    pending = null; render();
    if (wasFail) setMsg('ok', '✓ <b>ROLLBACK WORK</b> — 실패를 확인하고 되돌렸습니다. 미확정 변경이 <b>전부</b> 폐기돼 DB는 깨끗합니다(반쪽 저장 방지 = 올바른 선택).');
    else setMsg('info', '↩ <b>ROLLBACK WORK</b> — 성공한 변경도 취소돼 전부 사라졌습니다. "전부 아니면 전무"의 \'전무\' 쪽.');
  });

  $('reset').addEventListener('click', function () { pending = null; db = { head: false, items: false }; $('failItem').checked = false; render(); setMsg('info', '금·토 두 회차를 한 묶음으로 예매하는 시나리오. ① 처리 → ②/③ 으로 확정/취소.'); });

  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);

  $('reset').click();
})();
