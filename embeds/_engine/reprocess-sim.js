/* reprocess-sim — 오류 로그·재처리 체험 (CH25-L04).
   ① 처리: 배치 5건 INSERT 루프 → 성공은 DB, 실패(중복키 2건)는 오류 테이블에 적재(sy-subrc 점검).
   ② 원인 해결: 실패 건의 원인을 고친다(INSERT→MODIFY upsert로 멱등 처리 결정).
   ③ 재처리: 오류 테이블만 다시 처리 → 성공 → DB로. 처음부터 다시 안 돌리고 실패분만. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  // 2002·2004 = 이미 DB에 있는 키(중복) → INSERT 실패
  var BATCH = [
    { id: '2001', pax: '아이유' }, { id: '2002', pax: '유재석', dup: true },
    { id: '2003', pax: '손흥민' }, { id: '2004', pax: '김연아', dup: true }, { id: '2005', pax: '차은우' }
  ];
  var state;
  function reset() {
    state = { phase: 0, inbox: BATCH.map(function (r) { return Object.assign({}, r); }), db: [], err: [], fixed: false };
    render(); setMsg('info', '예매 5건을 일괄 INSERT합니다. 2건은 이미 있는 키(중복)라 실패할 거예요. <b>① 처리</b>부터.');
  }
  function recHTML(r, cls, why) { return '<div class="rec ' + cls + ' move"><span>' + r.id + ' · ' + r.pax + '</span>' + (why ? '<span class="why">' + why + '</span>' : '') + '</div>'; }
  function render() {
    $('inbox').innerHTML = state.inbox.length ? state.inbox.map(function (r) { return recHTML(r, '', r.dup ? '중복키' : ''); }).join('') : '<span class="ph">처리 완료(빈 배치).</span>';
    $('db').innerHTML = state.db.length ? state.db.map(function (r) { return recHTML(r, 'done', '✓'); }).join('') : '<span class="ph">없음.</span>';
    $('err').innerHTML = state.err.length ? state.err.map(function (r) { return recHTML(r, state.fixed ? 'fixed' : 'bad', state.fixed ? '해결됨' : 'sy-subrc=4'); }).join('') : '<span class="ph">없음.</span>';
    $('nIn').textContent = state.inbox.length; $('nDb').textContent = state.db.length; $('nErr').textContent = state.err.length;
    $('process').disabled = state.phase !== 0;
    $('fix').disabled = state.phase !== 1;
    $('retry').disabled = state.phase !== 2;
    post();
  }
  function setMsg(c, h) { var m = $('msg'); m.className = 'msg ' + c; m.innerHTML = h; post(); }

  $('process').addEventListener('click', function () {
    state.inbox.forEach(function (r) { if (r.dup) state.err.push(r); else state.db.push(r); });
    state.inbox = []; state.phase = 1; render();
    setMsg('bad', '처리 완료 — <b>5건 중 3건 성공</b>(DB), <b>2건 실패</b>(중복키)는 <code>sy-subrc&lt;&gt;0</code>이라 <b>오류 테이블</b>에 모았습니다. 실패를 무시하지 않고 남긴 게 핵심. <b>② 원인 해결</b>로.');
  });
  $('fix').addEventListener('click', function () {
    state.fixed = true; state.phase = 2; render();
    setMsg('info', '원인 해결 — 실패 건은 "이미 있으면 갱신"이 맞으니 INSERT 대신 <b>MODIFY</b>(upsert)로 재처리하기로. 같은 걸 두 번 처리해도 안전한 <b>멱등성</b>. <b>③ 재처리</b>로.');
  });
  $('retry').addEventListener('click', function () {
    state.db = state.db.concat(state.err); state.err = []; state.phase = 3; render();
    setMsg('ok', '✓ <b>재처리 완료</b> — 오류 테이블 2건을 <b>MODIFY</b>로 다시 처리해 모두 DB에 반영. 처음부터 다시 돌리지 않고 <b>실패분만</b> 재처리했습니다(재시작점 = 오류 테이블).');
  });
  $('reset').addEventListener('click', reset);

  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  reset();
})();
