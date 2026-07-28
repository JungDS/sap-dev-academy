/* bapi-return — BAPI 호출·RETURN 처리 체험 (CH33-L01).
   시나리오(정상/오류/경고) → BAPI 호출 → BAPIRET2 메시지 → 판정(E/A=실패, W=정책 스위치에 따라).
   '경고도 실패 처리' 정책 토글(#pol)이 같은 입력의 COMMIT/ROLLBACK을 가르는 걸 보여 준다.
   BAPI는 스스로 COMMIT 안 함 → BAPI_TRANSACTION_COMMIT 필요 강조. 도메인 = 예매 생성 요청(표준 예매 솔루션 가정·C001/정훈영). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var SC = {
    ok:   [ { t: 'S', m: '예매 문서 0000000009 생성됨 (C001·정훈영·2석)' } ],
    err:  [ { t: 'E', m: '고객 마스터가 존재하지 않습니다' },
            { t: 'E', m: '필수 항목(공연 회차) 누락' } ],
    warn: [ { t: 'S', m: '예매 문서 0000000010 생성됨 (C001·정훈영·8석)' },
            { t: 'W', m: '대량 예매 — 좌석 등급 정책 확인 권고' } ]
  };
  var cur = 'ok';
  function logLine(txt, cls) {
    var b = $('blog'); if (!b) return;
    if (b.querySelector('.ph')) b.innerHTML = '';
    b.innerHTML += '<div class="ln ' + (cls || '') + '">' + txt + '</div>';
    b.scrollTop = b.scrollHeight;
  }
  function render() {
    [].forEach.call(document.querySelectorAll('.sc'), function (b) { b.classList.toggle('on', b.dataset.s === cur); });
    $('ret').innerHTML = '<span class="ph">▶ BAPI 호출을 눌러 RETURN을 확인하세요.</span>';
    $('decision').className = 'decision';
    post();
  }
  $('run').addEventListener('click', function () {
    var rows = SC[cur];
    var strict = $('pol') && $('pol').checked;
    $('ret').innerHTML = rows.map(function (r) { return '<div class="ret ' + r.t + '"><span class="ty">' + r.t + '</span><span>' + r.m + '</span></div>'; }).join('');
    var hasErr  = rows.some(function (r) { return r.t === 'E' || r.t === 'A'; });
    var hasWarn = rows.some(function (r) { return r.t === 'W'; });
    var fail = hasErr || (strict && hasWarn);
    var d = $('decision'); d.className = 'decision show ' + (fail ? 'no' : 'ok');
    logLine('CALL FUNCTION BAPI_..._CREATE → RETURN ' + rows.length + '건 (E ' +
      rows.filter(function (r) { return r.t === 'E'; }).length + ' · W ' +
      rows.filter(function (r) { return r.t === 'W'; }).length + ')');
    if (fail) {
      d.innerHTML = (hasErr ? '✕ RETURN에 type=E 있음' : '✕ 경고(W) + 정책 "경고도 실패"') +
        ' → <b>BAPI_TRANSACTION_ROLLBACK</b><span class="sub">' +
        (hasErr ? '오류를 무시하고 COMMIT하면 깨진 데이터가 남습니다.' : '같은 W라도 정책 스위치에 따라 운명이 갈립니다 — 정책은 문서로 정해 둡니다.') + '</span>';
      logLine('판정: 실패 → BAPI_TRANSACTION_ROLLBACK', 'no2');
    } else {
      d.innerHTML = '✓ 실패 아님' + (hasWarn ? ' (W는 정책상 통과)' : '') +
        ' → <b>BAPI_TRANSACTION_COMMIT</b> (wait=X)<span class="sub">BAPI는 스스로 COMMIT하지 않으므로 직접 호출해야 확정됩니다.</span>';
      logLine('판정: 통과 → BAPI_TRANSACTION_COMMIT (wait=X)' + (hasWarn ? ' · W는 정책상 통과' : ''), 'ok2');
    }
    post();
  });
  if ($('pol')) $('pol').addEventListener('change', function () {
    logLine('경고 정책 변경: ' + ($('pol').checked ? '"경고도 실패 처리" ON' : 'OFF (경고는 통과)'));
    post();
  });
  [].forEach.call(document.querySelectorAll('.sc'), function (b) { b.addEventListener('click', function () { cur = b.dataset.s; render(); }); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
