/* tf-link-map — CDS Table Function 연결 지도 체험 (CH36-L05).
   세 카드(DDL·AMDP 클래스·소비 SELECT)를 단계 버튼으로 잇는다.
   단계: ddl(계약 보기) → link(implemented by ↔ FOR TABLE FUNCTION 연결) →
         run(DB 안 SQLScript 실행) → consume(SELECT가 결과 수신) → client(점검).
   상태 칩(#chips)·연결선 강조·피드백(#fb). 수치·코드는 교육용 예시. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var STEPS = ['ddl', 'link', 'run', 'consume', 'client'];
  var FB = {
    ddl: '<b>① 계약(DDL)</b> — <code>define table function</code>이 파라미터와 returns 구조를 선언합니다. 이 구조가 곧 약속입니다.',
    link: '<b>② 연결</b> — DDL의 <code>implemented by method</code>와 클래스의 <code>FOR TABLE FUNCTION</code>이 서로를 가리킵니다. 한쪽이 없으면 활성화 실패.',
    run: '<b>③ 실행</b> — 구현부(<code>BY DATABASE FUNCTION … SQLSCRIPT</code>)가 DB 안에서 돌아 결과 집합을 만듭니다. ABAP 서버로는 아직 아무것도 안 옵니다.',
    consume: '<b>④ 소비</b> — <code>SELECT FROM ztf_…( )</code>가 함수를 데이터 소스처럼 읽습니다. 클래스 메서드를 직접 호출하는 구조가 아닙니다.',
    client: '<b>⑤ client 점검</b> — 자동 client 조건이 없습니다. <code>p_client</code> 파라미터와 <code>WHERE mandt = :p_client</code>, 그리고 <code>USING</code> 목록을 확인하세요.'
  };
  var CHIP = { ddl: 'DDL 활성', link: '연결 완료', run: 'DB에서 실행', consume: 'SELECT 소비', client: 'client 확인' };
  var done = {};
  function setStep(s) {
    STEPS.forEach(function (k) {
      var b = $('st-' + k); if (b) b.classList.toggle('on', k === s);
    });
    // 카드 강조
    $('cDdl').className = 'tcard' + (s === 'ddl' || s === 'link' ? ' hot' : '');
    $('cCls').className = 'tcard' + (s === 'link' || s === 'run' ? ' hot' : '');
    $('cSel').className = 'tcard' + (s === 'consume' ? ' hot' : '');
    // 연결선
    $('lnk1').className = 'lnk' + (s === 'link' ? ' hot' : '');
    $('lnk2').className = 'lnk' + (s === 'consume' || s === 'run' ? ' hot' : '');
    // client 경고 배지
    $('cliBadge').style.display = (s === 'client') ? 'inline-block' : 'none';
    var fb = $('fb'); fb.className = 'fb show' + (s === 'client' ? ' warn' : '');
    fb.innerHTML = FB[s];
    done[s] = true;
    $('chips').innerHTML = STEPS.filter(function (k) { return done[k]; })
      .map(function (k) { return '<span class="chip">✓ ' + CHIP[k] + '</span>'; }).join('');
    post();
  }
  STEPS.forEach(function (k) {
    var b = $('st-' + k); if (b) b.addEventListener('click', function () { setStep(k); });
  });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  setStep('ddl');
})();
