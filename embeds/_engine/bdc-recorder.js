/* bdc-recorder — BDC/Batch Input 체험 (CH33-L03).
   '다음 동작'마다 화면 입력을 BDCDATA 한 줄씩 녹화(SHDB 감각) → CALL TRANSACTION 실행.
   '오류 만들기'(필수 SEATS 행 제거) → 실행 시 BDCMSGCOLL에 E 메시지 수집(MESSAGES INTO 강조).
   'Session으로 보내기' → SM35 큐 패널에 적재(재처리 감각). 정본: ZBK01·SAPMZBOOK·C001. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var STEPS = [
    { screen: 1, program: 'SAPMZBOOK', dynpro: '0100', label: '화면 0100 진입' },
    { fnam: 'ZBOOK-CONCERT', fval: 'C001', label: '공연 입력' },
    { fnam: 'BDC_OKCODE', fval: '/00', label: 'Enter(다음 화면)' },
    { screen: 1, program: 'SAPMZBOOK', dynpro: '0200', label: '화면 0200 진입' },
    { fnam: 'ZBOOK-SEATS', fval: '2', label: '좌석 수 입력(필수)' },
    { fnam: 'BDC_OKCODE', fval: '=SAVE', label: '저장' }
  ];
  var i = 0, rows = [], broken = false;
  function render(markNew) {
    if (!rows.length) $('tbody').innerHTML = '<tr><td colspan="4" class="ph">"다음 동작"을 눌러 화면 입력을 BDCDATA에 녹화하세요.</td></tr>';
    else $('tbody').innerHTML = rows.map(function (r, k) {
      var nw = (markNew && k === rows.length - 1) ? ' new' : '';
      if (r.screen) return '<tr class="screen' + nw + '"><td>' + r.program + '</td><td>' + r.dynpro + '</td><td>X</td><td>· ' + r.label + '</td></tr>';
      return '<tr class="' + nw.trim() + '"><td></td><td></td><td></td><td>' + r.fnam + ' = ' + r.fval + '  · ' + r.label + '</td></tr>';
    }).join('');
    var done = i >= STEPS.length;
    $('next').disabled = done;
    $('next').textContent = done ? '녹화 완료' : '다음 동작 ▶ (' + (i + 1) + '/' + STEPS.length + ')';
    $('exec').disabled = !done;
    if ($('breakBtn')) $('breakBtn').disabled = !done || broken;
    if ($('toSession')) $('toSession').disabled = !done;
    post();
  }
  $('next').addEventListener('click', function () { if (i < STEPS.length) { rows.push(STEPS[i]); i++; render(true); } });
  if ($('breakBtn')) $('breakBtn').addEventListener('click', function () {
    rows = rows.filter(function (r) { return r.fnam !== 'ZBOOK-SEATS'; });
    broken = true; render();
    $('result').className = 'result show no';
    $('result').innerHTML = '⚠ 필수 필드 행(ZBOOK-SEATS)을 제거했습니다 — 이제 실행하면 화면 검증에 걸립니다.';
    post();
  });
  $('exec').addEventListener('click', function () {
    var r = $('result'); r.className = 'result show ' + (broken ? 'no' : 'ok');
    if (broken) {
      r.innerHTML = '✕ <code>CALL TRANSACTION \'ZBK01\' USING gt_bdc OPTIONS FROM gs_opt MESSAGES INTO gt_msg</code>' +
        '<div class="msgs"><b>gt_msg (BDCMSGCOLL)</b><div class="mrow">E · ZBK 001 · 좌석 수를 입력하세요 (화면 0200 · ZBOOK-SEATS)</div></div>' +
        '<span class="sub">실패 원인은 <b>화면 메시지</b>에 있다 — MESSAGES INTO가 없으면 이 단서가 사라집니다.</span>';
    } else {
      r.innerHTML = '✓ <code>CALL TRANSACTION \'ZBK01\' USING gt_bdc OPTIONS FROM gs_opt MESSAGES INTO gt_msg</code> → 예매 등록 성공.' +
        '<span class="sub">dismode <b>N</b>=무화면(배치) · <b>A</b>=전체 화면(개발 확인) · <b>E</b>=오류 때만 화면. updmode <b>S</b>=동기 update(결과 확인 확실).</span>';
    }
    post();
  });
  if ($('toSession')) $('toSession').addEventListener('click', function () {
    var q = $('queue');
    if (q.querySelector('.ph')) q.innerHTML = '';
    q.innerHTML += '<div class="qrow">세션 <b>ZBOOK</b> · tcode ZBK01 · ' + rows.length + '행 · 상태: <b>대기</b> → SM35에서 실행/재처리</div>';
    $('result').className = 'result show ok';
    $('result').innerHTML = '✓ <code>BDC_OPEN_GROUP → BDC_INSERT → BDC_CLOSE_GROUP</code> — 즉시 실행 대신 <b>세션 큐</b>에 쌓았습니다. 실패 건은 SM35에서 화면 모드로 재처리합니다.';
    post();
  });
  $('reset').addEventListener('click', function () {
    i = 0; rows = []; broken = false;
    $('result').className = 'result';
    if ($('queue')) $('queue').innerHTML = '<div class="ph">Session으로 보내면 여기(SM35 큐)에 쌓입니다.</div>';
    render();
  });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
