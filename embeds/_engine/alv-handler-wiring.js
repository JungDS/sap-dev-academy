/* alv-handler-wiring — ALV 이벤트 → 핸들러 메서드 SET HANDLER 배선 (CH30-L05).
   이벤트(왼쪽) 클릭 → 짝이 되는 핸들러 메서드(오른쪽) 강조 + 라우팅 메시지. 모든 배선은 생성자 SET HANDLER 한 번에. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var MAP = {
    double_click: { m: 'on_double_click', act: '클릭한 행을 READ해 상세 화면 호출' },
    hotspot_click: { m: 'on_hotspot', act: '링크 셀의 키로 관련 화면 이동' },
    toolbar: { m: 'on_toolbar', act: '커스텀 버튼(ZCANCEL)을 툴바에 추가' },
    user_command: { m: 'on_user_command', act: '선택 행을 취소 처리 후 refresh' }
  };
  function sel(ev) {
    [].forEach.call(document.querySelectorAll('.col.ev .item'), function (e) { e.classList.toggle('on', e.dataset.ev === ev); });
    [].forEach.call(document.querySelectorAll('.col.hd2 .item'), function (e) { e.classList.toggle('on', e.dataset.m === MAP[ev].m); });
    var f = $('fired'); f.className = 'fired';
    f.innerHTML = '⚡ <b>' + ev + '</b> 발생 → 핸들러 <b>' + MAP[ev].m + '( )</b> 실행 — ' + MAP[ev].act;
    post();
  }
  [].forEach.call(document.querySelectorAll('.col.ev .item'), function (e) { e.addEventListener('click', function () { sel(e.dataset.ev); }); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  post();
})();
