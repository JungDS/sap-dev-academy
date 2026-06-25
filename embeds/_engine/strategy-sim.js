/* strategy-sim — Strategy 패턴 체험 (CH26-L03).
   요금 전략(일반/VIP/조기) 선택 + 좌석수 → 가격 계산. 호출부(checkout)는 전략을 주입받아 그대로 호출 → 동일.
   새 정책 = 새 클래스 추가(기존 코드 불변, OCP). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var BASE = 50000;
  var S = {
    std: { cls: 'zcl_price_standard', per: BASE, desc: '정가 — 좌석당 50,000원.' },
    vip: { cls: 'zcl_price_vip', per: BASE * 1.5, desc: 'VIP — 정가의 1.5배(라운지·우선석).' },
    early: { cls: 'zcl_price_early', per: BASE * 0.8, desc: '조기예매 — 정가의 20% 할인.' }
  };
  var cur = 'std';
  function calc() {
    var seats = Math.max(1, parseInt($('seats').value, 10) || 1);
    [].forEach.call(document.querySelectorAll('.str'), function (b) { b.classList.toggle('on', b.dataset.s === cur); });
    var s = S[cur], total = s.per * seats;
    $('client').innerHTML = '<span class="kw">DATA</span>(lv_price) = mo_strategy->calc( iv_seats = <span class="lit">' + seats + '</span> ).';
    $('scls').textContent = s.cls;
    $('sdesc').textContent = s.desc;
    $('price').innerHTML = total.toLocaleString('ko-KR') + '원<small>' + seats + '석 × ' + s.per.toLocaleString('ko-KR') + '원</small>';
    post();
  }
  [].forEach.call(document.querySelectorAll('.str'), function (b) { b.addEventListener('click', function () { cur = b.dataset.s; calc(); }); });
  $('seats').addEventListener('input', calc);
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  calc();
})();
