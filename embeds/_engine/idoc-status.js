/* idoc-status — IDoc 상태코드 생애주기·재처리 체험 (CH31-L03).
   30 생성 → 03 전송 → (수신 처리) 53 성공 또는 51 오류 → BD87 재처리 → 53. '오류 주입' 토글. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  // id, code, text, cls
  var ALL = [
    { id: 'c30', code: '30', t: 'IDoc 생성 — 전송 준비', cls: 'mid' },
    { id: 'c03', code: '03', t: 'Outbound 포트로 전송됨', cls: 'mid' },
    { id: 'c51', code: '51', t: 'Inbound 오류(애플리케이션) — 데이터/매핑 문제', cls: 'err' },
    { id: 'c53', code: '53', t: 'Inbound 처리 완료(성공)', cls: 'ok' }
  ];
  var reached = [], phase = 0;   // 0 생성, 1 전송, 2 처리
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
    post();
  }
  $('send').addEventListener('click', function () { reached = ['30', '03']; phase = 1; render(); });
  $('recv').addEventListener('click', function () {
    reached = ['30', '03', $('err').checked ? '51' : '53']; phase = 2; render();
  });
  $('re').addEventListener('click', function () { $('err').checked = false; reached = ['30', '03', '53']; render(); });
  $('reset').addEventListener('click', function () { reached = []; phase = 0; render(); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
