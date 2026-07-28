/* rfc-call — RFC 원격 호출 체험 (CH33-L02).
   시나리오 4종: 정상 / DESTINATION 누락(빈 값 사전 검증) / 통신 실패(communication_failure=1)
   / 원격 덤프(system_failure=2). sy-subrc·gv_msg 카드 + 운영 로그 누적으로
   "원격 호출은 연결·예외·로그까지가 설계"임을 보여 준다. 정본: Z_GET_BOOKINGS·iv_concert='C001'. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cur = 'ok';
  var SC = {
    ok:       { subrc: '0', msg: '(없음)', conn: '', cls: 'ok',
      html: '✓ <code>CALL FUNCTION \'Z_GET_BOOKINGS\' DESTINATION \'TARGET_SYS\'</code> 성공 → <b>et_booking 3건 수신</b> (iv_concert = \'C001\').',
      log: 'TARGET_SYS · Z_GET_BOOKINGS · sy-subrc=0 · 3건 수신' },
    nodest:   { subrc: '—', msg: '(호출 전 차단)', conn: 'bad', cls: 'no',
      html: '✕ <b>DESTINATION이 빈 값</b> — 공식 규칙상 빈 destination은 부가어가 무시돼 <b>로컬 호출처럼</b> 동작할 수 있습니다. 사전 검증으로 호출 자체를 막고 설정 누락을 알립니다.',
      log: '(빈 destination) · Z_GET_BOOKINGS · 사전 검증 실패 → 호출 차단' },
    commfail: { subrc: '1', msg: 'TARGET_SYS 연결 불가(네트워크)', conn: 'bad', cls: 'no',
      html: '✕ <b>communication_failure = 1</b> → 통신 계층 실패. 인프라·네트워크·대상 시스템 기동 여부부터 봅니다.',
      log: 'TARGET_SYS · Z_GET_BOOKINGS · sy-subrc=1 · gv_msg="연결 불가(네트워크)"' },
    dump:     { subrc: '2', msg: '원격 시스템 런타임 오류(덤프)', conn: 'bad', cls: 'no',
      html: '✕ <b>system_failure = 2</b> → 원격 시스템 <b>안</b>에서 실행 중 오류. 대상 시스템의 덤프·메시지·로직부터 봅니다(통신 실패와 대응이 다릅니다).',
      log: 'TARGET_SYS · Z_GET_BOOKINGS · sy-subrc=2 · gv_msg="원격 런타임 오류"' }
  };
  function render() { [].forEach.call(document.querySelectorAll('.sc'), function (b) { b.classList.toggle('on', b.dataset.s === cur); }); }
  function logLine(txt, cls) {
    var b = $('rlog'); if (!b) return;
    if (b.querySelector('.ph')) b.innerHTML = '';
    b.innerHTML += '<div class="ln ' + (cls || '') + '">' + txt + '</div>';
    b.scrollTop = b.scrollHeight;
  }
  $('run').addEventListener('click', function () {
    var s = SC[cur], r = $('result'), conn = $('conn');
    r.className = 'rfc-result ' + s.cls; r.innerHTML = s.html;
    conn.className = 'conn' + (s.conn ? ' ' + s.conn : '');
    if ($('subrc')) $('subrc').textContent = s.subrc;
    if ($('gvmsg')) $('gvmsg').textContent = s.msg;
    logLine(s.log, s.cls === 'ok' ? 'ok2' : 'no2');
    post();
  });
  [].forEach.call(document.querySelectorAll('.sc'), function (b) { b.addEventListener('click', function () { cur = b.dataset.s; render(); }); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render(); post();
})();
