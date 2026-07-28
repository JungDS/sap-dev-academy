/* idoc-structure — IDoc 3층 구조 체험 (CH34-L01).
   Control/Data/Status 레이어 클릭 → 상세 표시. '오류 IDoc 보기' 모드(#modeErr)에서는
   Status 51 + 원인 메시지와, 원인 값이 든 파트너 Segment 하이라이트를 연결해
   "상태와 내용물을 함께 읽는" 습관을 만든다. 상태 코드는 대표값 프레이밍. */
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
      '<div class="st"><span class="code">01</span> IDoc 생성(접수)</div>' +
      '<div class="st"><span class="code">03</span> 통로로 전송(발송)</div>' +
      '<div class="st"><span class="code">53</span> 수신측 처리 완료(배달 완료)</div>' }
  };
  var DERR = {
    control: D.control,
    data: { h: 'Data Records (EDIDD) — 내용물 · 원인 Segment를 찾아라', body:
      '<div class="seg"><span class="nm">E1EDK01</span> — 주문 헤더(통화·금액)</div>' +
      '<div class="seg bad"><span class="nm">E1EDKA1</span> — 파트너 · <b>고객 10000001</b> ← 상태 메시지의 원인 값이 여기에</div>' +
      '<div class="seg"><span class="nm">E1EDP01</span> — 품목(자재·수량) ×N</div>' },
    status: { h: 'Status Records (EDIDS) — 실패한 배송 이력', body:
      '<div class="st"><span class="code">01</span> IDoc 생성(접수)</div>' +
      '<div class="st"><span class="code">03</span> 통로로 전송(발송)</div>' +
      '<div class="st"><span class="code">64</span> 수신 대기(도착)</div>' +
      '<div class="st bad"><span class="code">51</span> 처리 오류 — "고객 10000001이 존재하지 않음"</div>' +
      '<div class="hint">51만 보면 "실패"뿐 — 메시지의 원인 값(고객 10000001)을 들고 <b>Data의 파트너 Segment</b>를 열어야 원인이 보인다.</div>' }
  };
  var cur = 'control', errMode = false;
  function render() {
    var SET = errMode ? DERR : D;
    [].forEach.call(document.querySelectorAll('.layer'), function (l) { l.classList.toggle('on', l.dataset.l === cur); });
    if ($('modeOk')) { $('modeOk').classList.toggle('on', !errMode); $('modeErr').classList.toggle('on', errMode); }
    $('detail').innerHTML = '<div class="detail__h">' + SET[cur].h + '</div><div class="detail__b">' + SET[cur].body + '</div>';
    post();
  }
  [].forEach.call(document.querySelectorAll('.layer'), function (l) { l.addEventListener('click', function () { cur = l.dataset.l; render(); }); });
  if ($('modeOk')) {
    $('modeOk').addEventListener('click', function () { errMode = false; render(); });
    $('modeErr').addEventListener('click', function () { errMode = true; cur = 'status'; render(); });
  }
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
