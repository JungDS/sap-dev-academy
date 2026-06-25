/* idoc-structure — IDoc 3층 구조 체험 (CH31-L01). Control/Data/Status 레이어 클릭 → 상세 표시. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var D = {
    control: { h: 'Control Record (EDIDC) — 봉투', body:
      '<div class="kv"><span class="k">메시지 타입</span><span class="v">ORDERS (주문)</span></div>' +
      '<div class="kv"><span class="k">Basic Type</span><span class="v">ORDERS05</span></div>' +
      '<div class="kv"><span class="k">방향</span><span class="v">1 = Outbound (발신)</span></div>' +
      '<div class="kv"><span class="k">발신/수신</span><span class="v">SENDER_SYS → RECEIVER_SYS</span></div>' },
    data: { h: 'Data Records (EDIDD) — 내용물(Segment 묶음)', body:
      '<div class="seg"><span class="nm">E1EDK01</span> — 주문 헤더(통화·금액)</div>' +
      '<div class="seg"><span class="nm">E1EDKA1</span> — 파트너(판매처·납품처)</div>' +
      '<div class="seg"><span class="nm">E1EDP01</span> — 품목(자재·수량) ×N</div>' },
    status: { h: 'Status Records (EDIDS) — 처리 이력', body:
      '<div class="st"><span class="code">30</span> IDoc 생성, 전송 준비</div>' +
      '<div class="st"><span class="code">03</span> 포트로 전송됨</div>' +
      '<div class="st"><span class="code">53</span> 수신측 처리 완료(성공)</div>' }
  };
  var cur = 'control';
  function render() {
    [].forEach.call(document.querySelectorAll('.layer'), function (l) { l.classList.toggle('on', l.dataset.l === cur); });
    $('detail').innerHTML = '<div class="detail__h">' + D[cur].h + '</div><div class="detail__b">' + D[cur].body + '</div>';
    post();
  }
  [].forEach.call(document.querySelectorAll('.layer'), function (l) { l.addEventListener('click', function () { cur = l.dataset.l; render(); }); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
