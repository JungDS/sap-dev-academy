/* odata-tree — SEGW 5부품 트리 + 오류 상태 전환 체험 (CH34-L04).
   기존 <details> 프로젝트 트리는 정적 마크업(인스턴스)에 두고, 이 엔진은
   시나리오 버튼(정상/미등록/모델 불일치/주방 미구현) → URL·HTTP 상태·로그 힌트 패널을 담당.
   "URL 하나가 열리려면 모델→runtime→등록→테스트가 다 이어져야 한다" 체험. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var SC = {
    ok: {
      http: '200 OK', cls: 'ok',
      body: '✓ <code>GET /sap/opu/odata/sap/ZCONCERT_SRV/ConcertSet</code> → 목록 응답. <code>$metadata</code>에도 Concert/ConcertSet이 보입니다.',
      hint: '다섯 부품이 모두 이어진 상태 — 이제 조회 로직(다음 레슨)이 결과를 채웁니다.'
    },
    noreg: {
      http: '404 Not Found', cls: 'no',
      body: '✕ 프로젝트도 클래스도 있는데 URL이 없다? — <b>카운터(서비스) 미등록</b>. "코드 완성"과 "URL 열림"은 다른 사건입니다.',
      hint: '로그 힌트: 서비스 등록·활성화 화면(/IWFND/MAINT_SERVICE)부터 확인.'
    },
    model: {
      http: '400 Bad Request', cls: 'no',
      body: '✕ 요청한 필드가 <code>$metadata</code>(메뉴판)에 없습니다 — <b>모델 불일치</b>. 데이터 코드를 보기 전에 모델부터.',
      hint: '로그 힌트: $metadata와 요청 필드 이름을 대조 — 바깥 이름은 모델이 정합니다.'
    },
    nodpc: {
      http: '200 OK (0건)', cls: 'warn',
      body: '△ URL은 열리는데 목록이 <b>항상 비어</b> 있습니다 — <b>주방(DPC_EXT) 미구현</b>. 다음 레슨에서 채웁니다.',
      hint: '로그 힌트: 오류가 아니라 "구현 없음"일 수 있다 — _EXT 클래스의 재정의 메서드 확인.'
    }
  };
  var cur = 'ok';
  function render() {
    [].forEach.call(document.querySelectorAll('.sc'), function (b) { b.classList.toggle('on', b.dataset.s === cur); });
    var s = SC[cur];
    $('httpBadge').textContent = s.http;
    $('httpBadge').className = 'httpb ' + s.cls;
    $('scBody').innerHTML = s.body;
    $('scHint').textContent = s.hint;
    post();
  }
  [].forEach.call(document.querySelectorAll('.sc'), function (b) {
    b.addEventListener('click', function () { cur = b.dataset.s; render(); });
  });
  [].forEach.call(document.querySelectorAll('details'), function (d) {
    d.addEventListener('toggle', post);
  });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
