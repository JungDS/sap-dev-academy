/* ale-config — ALE 설정 완성도 진단판 (CH34-L02-S02).
   다섯 부품 토글(주소록/배포 규칙/모델 배포/파트너 계약/통로·접속) → 'IDoc 발행' 시
   봉투가 어느 지점에서 멈추는지 단계 트랙+피드백으로 표시. "코드가 아니라 설정이 흐름을 끊는다" 체험.
   재수신(Inbound) 검사까지 포함. 정본: 예매 확정 통지 시나리오. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var PARTS = [
    { id: 'pLS',   nm: '주소록(Logical System)',        fail: '시스템 논리 이름이 없거나 client에 안 붙어 있음 — 봉투에 쓸 주소 자체가 없다', stopAt: 0 },
    { id: 'pBD64', nm: '배포 규칙표(Distribution Model)', fail: '누가→누구에게 이 메시지를 보낸다는 규칙이 없음 — 발송 대상이 결정되지 않는다', stopAt: 0 },
    { id: 'pDist', nm: '모델 배포(distribute)',           fail: '규칙표를 만들었지만 상대에게 배포 안 함 — 양쪽의 약속이 어긋난 상태', stopAt: 0 },
    { id: 'pWE20', nm: '파트너 계약서(Partner Profile)',  fail: 'IDoc은 생성됐지만 이 상대와의 처리 계약이 없음 — "생성됐는데 처리가 안 돼요"의 1순위', stopAt: 0 },
    { id: 'pPort', nm: '통로·접속(Port/Destination)',     fail: '통로가 없거나 접속이 죽어 있음 — 발송 단계에서 전송 오류', stopAt: 1 }
  ];
  var STEPS = ['① 봉투 생성', '② 발송 준비(계약·대상 확정)', '③ 통로로 전송', '④ 상대 수신·처리'];
  function render(stopIdx, doneAll) {
    $('track').innerHTML = STEPS.map(function (s, i) {
      var cls = 'stp';
      if (stopIdx === null) cls += doneAll ? ' ok' : '';
      else if (i < stopIdx) cls += ' ok';
      else if (i === stopIdx) cls += ' bad';
      return '<div class="' + cls + '">' + s + '</div>';
    }).join('<span class="arr">→</span>');
    post();
  }
  function diagnose() {
    for (var i = 0; i < PARTS.length; i++) {
      if (!$(PARTS[i].id).checked) return PARTS[i];
    }
    return null;
  }
  $('publish').addEventListener('click', function () {
    var miss = diagnose();
    if (!miss) {
      render(null, true);
      $('fb').className = 'fb ok';
      $('fb').innerHTML = '✓ 다섯 부품이 모두 이어졌습니다 — 봉투가 상대 시스템까지 도착해 처리됩니다. 마지막 확인은 <b>실제 한 건의 이력(Status)</b>으로!';
    } else {
      render(miss.stopAt + 1, false);
      $('fb').className = 'fb bad';
      $('fb').innerHTML = '✕ <b>' + miss.nm + '</b> 누락 — ' + miss.fail + '.';
    }
    post();
  });
  $('diag').addEventListener('click', function () {
    var missing = PARTS.filter(function (p) { return !$(p.id).checked; });
    $('fb').className = 'fb ' + (missing.length ? 'bad' : 'ok');
    $('fb').innerHTML = missing.length
      ? '진단: 누락 ' + missing.length + '건 — ' + missing.map(function (p) { return '<b>' + p.nm + '</b>'; }).join(' · ')
      : '진단: 누락 없음 — 발행해 보세요.';
    post();
  });
  $('reset').addEventListener('click', function () {
    PARTS.forEach(function (p) { $(p.id).checked = true; });
    render(null, false);
    $('fb').className = 'fb';
    $('fb').innerHTML = '부품을 끄고 발행해 보세요 — 멈추는 지점이 달라집니다.';
    post();
  });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render(null, false);
})();
