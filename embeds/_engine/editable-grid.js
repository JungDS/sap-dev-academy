/* editable-grid — 편집 가능 ALV 시뮬 엔진 (CH31 공통).
   위젯의 <script type="application/json" id="eg-cfg">에서 { mode, max } 를 읽는다.
   mode: editcols | datachanged | finished | cellstyle | validate | save.
   seats 컬럼이 편집 대상. 유효값 = 1~max 정수. 입력 시 전체 rebuild 없이 셀만 패치(포커스 보존). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cfg; try { cfg = JSON.parse($('eg-cfg').textContent); } catch (e) { cfg = { mode: 'editcols', max: 10 }; }
  var mode = cfg.mode, MAX = cfg.max || 10;
  var ROWS = [
    { id: '1001', concert: 'C-NOVA', pax: '정훈영', seats: '2', sold: false },
    { id: '1002', concert: 'C-AURA', pax: '아이유', seats: '4', sold: false },
    { id: '1003', concert: 'C-NOVA', pax: '손흥민', seats: '2', sold: false }
  ];
  var editOn = (mode !== 'editcols');   // editcols만 토글로 시작

  function validNum(v) { return /^\d+$/.test(String(v).trim()) && +v >= 1 && +v <= MAX; }
  function logLine(ev, txt, cls) {
    var box = $('log'); if (!box) return;
    if (box.querySelector('.ph')) box.innerHTML = '';
    var ln = document.createElement('div'); ln.className = 'ln';
    ln.innerHTML = '<span class="ev">' + ev + '</span> <span class="' + (cls || '') + '">' + txt + '</span>';
    box.appendChild(ln); box.scrollTop = box.scrollHeight;
  }
  function sumSeats() { return ROWS.reduce(function (a, r) { return a + (validNum(r.seats) ? +r.seats : 0); }, 0); }

  function seatsCell(r, i) {
    var disabled = (mode === 'cellstyle' && r.sold);
    if (!editOn) return '<td>' + r.seats + '</td>';
    var bad = !validNum(r.seats) ? ' bad' : '';
    return '<td class="ed' + bad + (disabled ? ' disabled' : '') + '" id="cell' + i + '">' +
      '<input type="text" data-i="' + i + '" value="' + r.seats + '"' + (disabled ? ' disabled' : '') + '></td>';
  }
  function paint() {
    var soldCol = (mode === 'cellstyle');
    $('thead').innerHTML = '<tr><th>booking_id</th><th>concert</th><th>승객</th><th>seats</th>' + (soldCol ? '<th>매진?</th>' : '') + '</tr>';
    $('tbody').innerHTML = ROWS.map(function (r, i) {
      var sold = soldCol ? '<td><button class="soldbtn' + (r.sold ? ' on' : '') + '" data-sold="' + i + '" type="button">' + (r.sold ? '매진' : '여석') + '</button></td>' : '';
      return '<tr class="' + (r.sold ? 'sold' : '') + '"><td>' + r.id + '</td><td>' + r.concert + '</td><td>' + r.pax + '</td>' + seatsCell(r, i) + sold + '</tr>';
    }).join('');
    bind();
    if ($('sum')) $('sum').textContent = '총 좌석: ' + sumSeats();
    if (mode === 'validate') renderErr();
    post();
  }
  function bind() {
    [].forEach.call($('tbody').querySelectorAll('input[data-i]'), function (inp) {
      inp.addEventListener('input', function () { onInput(+inp.dataset.i, inp); });
      if (mode === 'finished') inp.addEventListener('change', function () { onFinished(+inp.dataset.i); });
    });
    [].forEach.call($('tbody').querySelectorAll('[data-sold]'), function (b) {
      b.addEventListener('click', function () { var i = +b.dataset.sold; ROWS[i].sold = !ROWS[i].sold; paint(); });
    });
  }
  function onInput(i, inp) {
    ROWS[i].seats = inp.value;
    var cell = $('cell' + i), ok = validNum(inp.value);
    if (cell) cell.classList.toggle('bad', !ok);
    if (mode === 'datachanged') {
      if (!ok) logLine('on_data_changed', 'add_protocol_entry( 행' + (i + 1) + ' SEATS=' + inp.value + ' → 오류: 1~' + MAX + ' )', 'no2');
      else logLine('on_data_changed', '행' + (i + 1) + ' SEATS=' + inp.value + ' OK', 'ok2');
    }
    if (mode === 'validate') renderErr();
  }
  function onFinished(i) {
    $('sum').textContent = '총 좌석: ' + sumSeats();
    logLine('on_data_changed_finished', 'e_modified=X → 합계 재계산 = ' + sumSeats() + ' (refresh stable)', 'ok2');
  }
  function renderErr() {
    var bad = ROWS.map(function (r, i) { return { r: r, i: i }; }).filter(function (x) { return !validNum(x.r.seats); });
    var p = $('errpanel'); if (!p) return;
    if (!bad.length) { $('errhead').innerHTML = '<span class="ok">✓ 오류 0건 — 모든 입력이 유효합니다.</span>'; $('errbody').innerHTML = '<div class="clean">검증 통과.</div>'; }
    else {
      $('errhead').innerHTML = '<span class="no">✕ 오류 ' + bad.length + '건 (add_protocol_entry)</span>';
      $('errbody').innerHTML = '<ul>' + bad.map(function (x) { return '<li>행 ' + (x.i + 1) + ' (' + x.r.id + ') SEATS=\'' + x.r.seats + '\' — 1~' + MAX + ' 정수만 허용</li>'; }).join('') + '</ul>';
    }
  }

  // 모드별 컨트롤
  if ($('editToggle')) $('editToggle').addEventListener('click', function () { editOn = !editOn; $('editToggle').firstChild.textContent = editOn ? '✏ 편집 모드: ON' : '🔒 편집 모드: OFF'; paint(); });
  if ($('saveBtn')) $('saveBtn').addEventListener('click', function () {
    logLine('check_changed_data', '편집 값을 내부 테이블에 반영', 'ok2');
    var bad = ROWS.filter(function (r) { return !validNum(r.seats); });
    if (bad.length) { logLine('저장 거부', '최종 검증 실패 ' + bad.length + '건 — DML 중단(무결성 방어선)', 'no2'); renderErr(); return; }
    logLine('MODIFY zbooking FROM TABLE', '검증 통과 → COMMIT WORK (확정)', 'ok2');
    renderErr();
  });

  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  paint();
})();
