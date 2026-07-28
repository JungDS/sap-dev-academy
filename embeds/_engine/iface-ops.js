/* iface-ops — File Interface 운영 흐름 체험 (CH33-L05).
   단계 버튼: 파일 수신 → OPEN DATASET(권한 오류 토글) → 행 검증 → 처리 실행 → 오류 파일 생성
   → 재처리 → 중복 파일 재수신. 상태 배지·행 표·운영 로그·재처리 큐·멱등성(처리 이력 key)을 한 화면에.
   데이터: 서버 파일 5행(정상 3·타입오류 1·이미 처리된 key 1). 정본: C001~/정훈영 외 풀. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var ROWS = [
    { key: 'EXT-101', c: 'C001', p: '정훈영', s: '2' },
    { key: 'EXT-102', c: 'C002', p: '아이유', s: '4' },
    { key: 'EXT-103', c: 'C001', p: '손흥민', s: '2' },
    { key: 'EXT-104', c: 'C002', p: '수지',   s: 'x' },   // 타입 오류
    { key: 'EXT-105', c: 'C001', p: '유재석', s: '3' }    // 이미 처리된 key
  ];
  var HIST = { 'EXT-105': true };                          // 처리 이력(멱등성 근거)
  var st = null;
  function reset() {
    st = { received: false, opened: false, validated: false, posted: false, errfile: false,
           status: {}, retry: {}, fixed: {} };
    $('phase').textContent = '대기';
    $('rows').innerHTML = '<div class="ph">① 파일 수신부터 시작하세요.</div>';
    $('olog').innerHTML = '<div class="ph">운영 로그가 여기 쌓입니다.</div>';
    $('rqueue').innerHTML = '<div class="ph">재처리 큐 비어 있음.</div>';
    $('ikeys').textContent = Object.keys(HIST).join(' · ');
    post();
  }
  function log(txt, cls) {
    var b = $('olog');
    if (b.querySelector('.ph')) b.innerHTML = '';
    b.innerHTML += '<div class="ln ' + (cls || '') + '">' + txt + '</div>';
    b.scrollTop = b.scrollHeight;
  }
  function phase(t) { $('phase').textContent = t; }
  function renderRows() {
    $('rows').innerHTML = '<table><thead><tr><th>ext key</th><th>공연</th><th>고객</th><th>SEATS</th><th>상태</th></tr></thead><tbody>' +
      ROWS.map(function (r) {
        var s = st.status[r.key] || '—';
        var cls = /Posted/.test(s) ? 'ok' : /ERROR|blocked|Open/.test(s) ? 'no' : '';
        var seats = st.fixed[r.key] || r.s;
        return '<tr><td>' + r.key + '</td><td>' + r.c + '</td><td>' + r.p + '</td><td>' + seats + '</td><td class="' + cls + '">' + s + '</td></tr>';
      }).join('') + '</tbody></table>';
  }
  function queueRender() {
    var q = $('rqueue'); var keys = Object.keys(st.retry);
    q.innerHTML = keys.length ? keys.map(function (k) {
      return '<div class="qrow">' + k + ' · 마지막 오류: 좌석 수가 숫자가 아님 · retry ' + st.retry[k] + '회</div>';
    }).join('') : '<div class="ph">재처리 큐 비어 있음.</div>';
  }
  $('bRecv').addEventListener('click', function () {
    st.received = true; phase('Received');
    ROWS.forEach(function (r) { st.status[r.key] = '수신됨'; });
    renderRows();
    log('수신: /usr/sap/interfaces/in/BOOKING_20260729.TXT · 5행');
    post();
  });
  $('bOpen').addEventListener('click', function () {
    if (!st.received) { log('⚠ 파일 수신 전에는 열 수 없습니다.', 'no2'); post(); return; }
    if ($('perm').checked) {
      phase('Open failed');
      log('OPEN DATASET ... MESSAGE gv_msg → sy-subrc=8 · gv_msg="Permission denied" — OS 원인을 로그로!', 'no2');
    } else {
      st.opened = true; phase('Opened');
      log('OPEN DATASET FOR INPUT IN TEXT MODE ENCODING UTF-8 → sy-subrc=0', 'ok2');
    }
    post();
  });
  $('bValid').addEventListener('click', function () {
    if (!st.opened) { log('⚠ 파일을 먼저 여세요(OPEN DATASET).', 'no2'); post(); return; }
    st.validated = true; phase('Validated');
    ROWS.forEach(function (r) {
      var seats = st.fixed[r.key] || r.s;
      if (HIST[r.key]) st.status[r.key] = 'Duplicate blocked(이력 존재)';
      else if (!/^\d+$/.test(seats)) st.status[r.key] = 'ERROR: 좌석 숫자 아님';
      else st.status[r.key] = 'OK(검증 통과)';
    });
    renderRows();
    log('행 검증: OK ' + ROWS.filter(function (r) { return /OK/.test(st.status[r.key]); }).length +
        ' · ERROR 1 · 멱등성 차단 ' + ROWS.filter(function (r) { return /blocked/.test(st.status[r.key]); }).length);
    post();
  });
  $('bPost').addEventListener('click', function () {
    if (!st.validated) { log('⚠ 검증이 먼저입니다.', 'no2'); post(); return; }
    var n = 0;
    ROWS.forEach(function (r) { if (/OK/.test(st.status[r.key])) { st.status[r.key] = 'Posted'; HIST[r.key] = true; n++; } });
    st.posted = true; phase('Posted');
    renderRows(); $('ikeys').textContent = Object.keys(HIST).join(' · ');
    log('처리 실행: ' + n + '행 등록 → COMMIT · 처리 이력 key 기록(멱등성 근거)', 'ok2');
    post();
  });
  $('bErrf').addEventListener('click', function () {
    if (!st.validated) { log('⚠ 검증이 먼저입니다.', 'no2'); post(); return; }
    var bad = ROWS.filter(function (r) { return /ERROR/.test(st.status[r.key]); });
    if (!bad.length) { log('오류 행 없음 — 오류 파일을 만들 필요가 없습니다.'); post(); return; }
    st.errfile = true;
    bad.forEach(function (r) { if (!(r.key in st.retry)) st.retry[r.key] = 0; });
    queueRender();
    log('TRANSFER → /usr/sap/interfaces/err/BOOKING_20260729.ERR (' + bad.length + '행) · 재처리 큐 적재', 'ok2');
    post();
  });
  $('bRetry').addEventListener('click', function () {
    var keys = Object.keys(st.retry);
    if (!keys.length) { log('재처리할 건이 없습니다.'); post(); return; }
    keys.forEach(function (k) {
      st.retry[k]++; st.fixed[k] = '2';                    // 수정본 도착 가정
      st.status[k] = 'Posted(재처리)'; HIST[k] = true; delete st.retry[k];
    });
    phase('Retried');
    renderRows(); queueRender(); $('ikeys').textContent = Object.keys(HIST).join(' · ');
    log('재처리: 수정본(SEATS=2)으로 재검증 → 등록 · retry 1회 기록', 'ok2');
    post();
  });
  $('bDup').addEventListener('click', function () {
    if (!st.posted) { log('⚠ 먼저 한 바퀴(처리 실행까지) 돌려 보세요.', 'no2'); post(); return; }
    phase('Duplicate blocked');
    ROWS.forEach(function (r) { st.status[r.key] = HIST[r.key] ? 'Duplicate blocked(이력 존재)' : st.status[r.key]; });
    renderRows();
    log('같은 파일 재수신 → 멱등성 체크: 전 행 처리 이력 존재 → 중복 등록 0건 차단', 'ok2');
    post();
  });
  $('bReset').addEventListener('click', function () {
    delete HIST['EXT-101']; delete HIST['EXT-102']; delete HIST['EXT-103']; delete HIST['EXT-104'];
    reset();
  });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  reset();
})();
