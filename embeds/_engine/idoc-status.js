/* idoc-status — IDoc 상태 생애주기·재처리 체험 (CH34-L03).
   01 생성 → 03 전송 → 64 수신 대기 → 51 오류 / 53 성공. '오류 주입' 체크 시 51.
   핵심 게이트: '원인 수정' 없이 재처리(BD87)하면 51이 반복된다(재처리≠오류 수정).
   상태 코드는 대표값 프레이밍(본문 표와 동일 세트). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var ALL = [
    { code: '01', t: 'IDoc 생성(접수)', cls: 'mid' },
    { code: '03', t: '통로로 전송(발송)', cls: 'mid' },
    { code: '64', t: '수신 대기(도착)', cls: 'mid' },
    { code: '51', t: 'Inbound 오류 — 데이터/매핑 문제(수취 거부)', cls: 'err' },
    { code: '53', t: 'Inbound 처리 완료(배달 완료)', cls: 'ok' }
  ];
  var reached = [], phase = 0, fixed = false, retryCnt = 0;
  function log(txt, cls) {
    var b = $('slog'); if (!b) return;
    if (b.querySelector('.ph')) b.innerHTML = '';
    b.innerHTML += '<div class="ln ' + (cls || '') + '">' + txt + '</div>';
    b.scrollTop = b.scrollHeight;
  }
  function render() {
    $('track').innerHTML = ALL.map(function (s) {
      var on = reached.indexOf(s.code) >= 0;
      var cur = reached.length && reached[reached.length - 1] === s.code;
      return '<div class="st ' + s.cls + (on ? ' reached' : '') + (cur ? ' cur' : '') + '"><span class="code">' + s.code + '</span><span>' + s.t + '</span></div>';
    }).join('');
    $('send').disabled = phase !== 0;
    $('recv').disabled = phase !== 1;
    var is51 = reached[reached.length - 1] === '51';
    $('re').disabled = !is51;
    if ($('fix')) $('fix').disabled = !is51 || fixed;
    post();
  }
  $('send').addEventListener('click', function () {
    reached = ['01', '03', '64']; phase = 1; fixed = false; retryCnt = 0; render();
    log('발송: 01 생성 → 03 전송 → 64 수신 대기');
  });
  $('recv').addEventListener('click', function () {
    var err = $('err').checked;
    reached = ['01', '03', '64', err ? '51' : '53']; phase = 2; render();
    log(err ? '수신 처리: 51 — 상태 메시지 "고객 마스터 없음" · 원인 값은 파트너 Segment에' : '수신 처리: 53 — 업무 문서 생성', err ? 'no2' : 'ok2');
  });
  if ($('fix')) $('fix').addEventListener('click', function () {
    fixed = true; render();
    log('원인 수정: 고객 마스터 보완(데이터를 고쳤다 — IDoc이 아니라!)', 'ok2');
  });
  $('re').addEventListener('click', function () {
    retryCnt++;
    if (!fixed) {
      reached = ['01', '03', '64', '51']; render();
      log('BD87 재처리 ' + retryCnt + '회 → 다시 51. 원인이 그대로면 재처리는 같은 실패를 반복한다!', 'no2');
    } else {
      reached = ['01', '03', '64', '53']; $('err').checked = false; render();
      log('BD87 재처리 → 53 성공 (원인 수정 후에만). 재처리 이력 기록.', 'ok2');
    }
  });
  $('reset').addEventListener('click', function () {
    reached = []; phase = 0; fixed = false; retryCnt = 0;
    if ($('slog')) $('slog').innerHTML = '<div class="ph">이력이 여기 쌓입니다.</div>';
    render();
  });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
