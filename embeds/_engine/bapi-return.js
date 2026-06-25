/* bapi-return — BAPI 호출·RETURN 처리 체험 (CH30-L01).
   시나리오(정상/오류) → BAPI 호출 → BAPIRET2 메시지 → type에 E/A 있으면 ROLLBACK, 없으면 COMMIT.
   BAPI는 스스로 COMMIT 안 함 → BAPI_TRANSACTION_COMMIT 필요를 강조. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var SC = {
    ok: [ { t: 'S', m: '판매오더 0000012345 생성됨' }, { t: 'S', m: '항목 10개 등록 완료' } ],
    err: [ { t: 'E', m: '고객 0001999는 존재하지 않습니다' }, { t: 'E', m: '필수 항목(납기일) 누락' }, { t: 'W', m: '신용 한도 점검 권고' } ]
  };
  var cur = 'ok';
  function render() {
    [].forEach.call(document.querySelectorAll('.sc'), function (b) { b.classList.toggle('on', b.dataset.s === cur); });
    $('ret').innerHTML = '<span class="ph">▶ BAPI 호출을 눌러 RETURN을 확인하세요.</span>';
    $('decision').className = 'decision';
    post();
  }
  $('run').addEventListener('click', function () {
    var rows = SC[cur];
    $('ret').innerHTML = rows.map(function (r) { return '<div class="ret ' + r.t + '"><span class="ty">' + r.t + '</span><span>' + r.m + '</span></div>'; }).join('');
    var hasErr = rows.some(function (r) { return r.t === 'E' || r.t === 'A'; });
    var d = $('decision'); d.className = 'decision show ' + (hasErr ? 'no' : 'ok');
    if (hasErr) d.innerHTML = '✕ RETURN에 type=E 있음 → <b>BAPI_TRANSACTION_ROLLBACK</b><span class="sub">오류를 무시하고 COMMIT하면 깨진 데이터가 남습니다.</span>';
    else d.innerHTML = '✓ 오류(E/A) 없음 → <b>BAPI_TRANSACTION_COMMIT</b> (wait=X)<span class="sub">BAPI는 스스로 COMMIT하지 않으므로 직접 호출해야 확정됩니다.</span>';
    post();
  });
  [].forEach.call(document.querySelectorAll('.sc'), function (b) { b.addEventListener('click', function () { cur = b.dataset.s; render(); }); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
