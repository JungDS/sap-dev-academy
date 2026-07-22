/* mvc-diagram — MVC 구조 시각+체험 (CH27-L04).
   시나리오(화면 교체/로직 변경/흐름 추가) 선택 → 바뀌는 계층(빨강)과 안 바뀌는 계층(초록) 하이라이트.
   관심사 분리(separation of concerns)의 효과를 눈으로. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  // 시나리오: 어떤 계층이 changed인지
  var SC = {
    view: { changed: 'view', msg: '화면을 <b>ALV → Dynpro</b>로 바꿔도 <span class="hot">View만</span> 손보면 됩니다. <span class="ok">Model·Controller는 그대로</span> — 조회·계산 로직은 화면을 몰라요.' },
    model: { changed: 'model', msg: '요금 <b>계산 로직</b>을 바꿔도 <span class="hot">Model만</span> 수정. <span class="ok">View·Controller는 그대로</span> — 표시·흐름은 계산 방식을 몰라요.' },
    ctrl: { changed: 'ctrl', msg: '<b>이벤트 흐름</b>(예: 더블클릭→상세)을 추가해도 <span class="hot">Controller만</span> 손봅니다. <span class="ok">Model·View는 그대로</span>.' }
  };
  var cur = 'view';
  var LYR = ['model', 'view', 'ctrl'];
  function render() {
    var sc = SC[cur];
    [].forEach.call(document.querySelectorAll('.sc'), function (b) { b.classList.toggle('on', b.dataset.s === cur); });
    LYR.forEach(function (l) {
      var g = $('lyr-' + l); g.classList.remove('changed', 'safe', 'idle');
      g.classList.add(l === sc.changed ? 'changed' : 'safe');
      $('bdg-' + l).textContent = (l === sc.changed ? '✎ 변경' : '✓ 그대로');
      $('bdg-' + l).setAttribute('class', 'badge ' + (l === sc.changed ? 'c' : 's'));
    });
    $('msg').innerHTML = sc.msg;
    post();
  }
  [].forEach.call(document.querySelectorAll('.sc'), function (b) { b.addEventListener('click', function () { cur = b.dataset.s; render(); }); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
