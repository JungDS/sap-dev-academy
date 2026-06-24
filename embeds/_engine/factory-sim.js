/* factory-sim — Factory 패턴 체험 (CH26-L01).
   type 선택 → 팩토리가 그에 맞는 구체 클래스를 만들어 zif_booking으로 반환.
   호출부(client) 코드는 type만 다를 뿐 '구조가 늘 같다'는 점을 강조. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var P = {
    V: { cls: 'zcl_vip_booking', desc: 'VIP 전용 예매 — 라운지·우선 좌석 로직 포함.' },
    G: { cls: 'zcl_booking_manager', desc: '일반 예매 — 기본 예약/취소 로직.' },
    Z: { cls: 'zcl_booking_manager', desc: '알 수 없는 타입 → OTHERS 분기로 일반 예매(기본값).' }
  };
  var cur = 'V';
  function render() {
    [].forEach.call(document.querySelectorAll('.ty'), function (b) { b.classList.toggle('on', b.dataset.t === cur); });
    $('client').innerHTML = '<span class="kw">DATA</span>(lo) = zcl_booking_factory=>create( <span class="lit">\'' + cur + '\'</span> ).\n' +
      'lo->book( iv_seats = <span class="lit">2</span> ).   <span style="color:#9aa4bf">" 호출부는 늘 동일</span>';
    var p = P[cur];
    $('product').innerHTML = '<div class="cls">' + p.cls + '</div><div class="impl">implements <b>zif_booking</b> (인터페이스 반환)</div><div class="desc">' + p.desc + '</div>';
    post();
  }
  [].forEach.call(document.querySelectorAll('.ty'), function (b) { b.addEventListener('click', function () { cur = b.dataset.t; render(); }); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
