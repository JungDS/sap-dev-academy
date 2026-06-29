/* rfc-call — RFC 원격 호출 체험 (CH30-L02).
   시나리오: 정상 / DESTINATION 누락 / 통신 실패 → 호출 결과와 예외 메시지를 보여 준다. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cur = 'ok';
  function render() { [].forEach.call(document.querySelectorAll('.sc'), function (b) { b.classList.toggle('on', b.dataset.s === cur); }); }
  $('run').addEventListener('click', function () {
    var r = $('result'), conn = $('conn');
    if (cur === 'ok') { r.className = 'rfc-result ok'; r.innerHTML = '✓ <code>CALL FUNCTION \'Z_GET_BOOKINGS\' DESTINATION \'TARGET_SYS\'</code> 성공 → <b>et_booking 3건 수신</b>.'; conn.className = 'conn'; }
    else if (cur === 'nodest') { r.className = 'rfc-result no'; r.innerHTML = '✕ <b>DESTINATION 누락</b> — 어느 시스템을 부를지 알 수 없습니다. 원격 호출엔 <code>SM59</code>에 등록한 대상 연결이 필요합니다.'; conn.className = 'conn bad'; }
    else { r.className = 'rfc-result no'; r.innerHTML = '✕ <b>communication_failure = 1</b> → <code>MESSAGE lv_msg</code>: "TARGET_SYS 연결 불가(네트워크)". 통신 예외를 잡아 원인 텍스트를 로그에 남깁니다.'; conn.className = 'conn bad'; }
    post();
  });
  [].forEach.call(document.querySelectorAll('.sc'), function (b) { b.addEventListener('click', function () { cur = b.dataset.s; render(); }); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render(); post();
})();
