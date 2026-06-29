/* dml-playground — DML 4종을 ZBOOKING 미니 테이블에 실행해 보는 체험 (CH24-L01).
   INSERT(단건 중복키=sy-subrc 4·삽입 안 됨)·UPDATE(WHERE 생략=전체)·MODIFY(upsert)·DELETE(WHERE 생략=전체삭제).
   실행 시 생성 ABAP 문 + 결과(sy-subrc) + 행 변화 애니메이션을 보여 준다.
   감사필드(created_by=sy-uname·created_on=sy-datum)는 INSERT/MODIFY 신규행에 자동 stamp. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var UNAME = 'JHY', TODAY = '20260625';          // 로그온 사용자(정훈영)·오늘
  var SEED = [
    { id: '1001', pax: '정훈영', seats: '2', st: 'O', by: 'JHY', on: '20260601' },
    { id: '1002', pax: '손흥민', seats: '4', st: 'O', by: 'MSON', on: '20260603' }
  ];
  var rows = [], op = 'INSERT';

  function clone(a) { return a.map(function (r) { return Object.assign({}, r); }); }
  function reset() { rows = clone(SEED); render(); setMsg('info', '연산을 고르고 값을 넣어 <b>실행</b>해 보세요. 같은 키로 <b>INSERT</b>를 두 번 하면? <b>DELETE</b>에서 WHERE를 빼면?'); echo(); }

  function setOp(o) {
    op = o;
    [].forEach.call(document.querySelectorAll('.op'), function (b) { b.classList.toggle('on', b.dataset.op === o); });
    // DELETE=키만 / 나머지=값도. UPDATE·DELETE만 WHERE 생략 체크 노출.
    var needVals = (o === 'INSERT' || o === 'UPDATE' || o === 'MODIFY');
    $('pax').disabled = !needVals; $('seats').disabled = !needVals; $('st').disabled = !needVals;
    var canSkip = (o === 'UPDATE' || o === 'DELETE');
    $('skipWrap').style.display = canSkip ? '' : 'none';
    if (!canSkip) $('skip').checked = false;
    $('keyFld').style.opacity = $('skip').checked && canSkip ? '.4' : '1';
    echo();
  }

  function curVals() {
    return { id: $('key').value.trim(), pax: $('pax').value.trim(), seats: $('seats').value.trim(), st: ($('st').value || 'O') };
  }
  function find(id) { for (var i = 0; i < rows.length; i++) if (rows[i].id === id) return i; return -1; }

  function echo() {
    var v = curVals(), skip = $('skip').checked, e = '';
    var kw = function (s) { return '<span class="kw">' + s + '</span>'; };
    if (op === 'INSERT') e = kw('INSERT') + ' zbooking ' + kw('FROM') + ' @ls_booking.';
    else if (op === 'MODIFY') e = kw('MODIFY') + ' zbooking ' + kw('FROM') + ' @ls_booking.';
    else if (op === 'UPDATE') e = kw('UPDATE') + ' zbooking ' + kw('SET') + " status = '" + (v.st || 'O') + "'" + (skip ? '.' : ' ' + kw('WHERE') + ' booking_id = @\'' + (v.id || '?') + '\'.');
    else if (op === 'DELETE') e = kw('DELETE') + ' ' + kw('FROM') + ' zbooking' + (skip ? '.' : ' ' + kw('WHERE') + ' booking_id = @\'' + (v.id || '?') + '\'.');
    $('echo').innerHTML = e;
  }

  function render(mark) {
    if (!rows.length) { $('tbody').innerHTML = '<tr><td colspan="6" class="empty">(빈 테이블 — 행이 없습니다)</td></tr>'; post(); return; }
    $('tbody').innerHTML = rows.map(function (r) {
      var cls = mark && mark.ids && mark.ids.indexOf(r.id) >= 0 ? mark.cls : '';
      return '<tr class="' + cls + '"><td class="key">' + r.id + '</td><td>' + r.pax + '</td><td>' + r.seats + '</td><td>' + r.st + '</td><td>' + r.by + '</td><td>' + r.on + '</td></tr>';
    }).join('');
    post();
  }
  function setMsg(c, h) { var m = $('msg'); m.className = 'msg ' + c; m.innerHTML = h; post(); }

  function run() {
    var v = curVals(), skip = $('skip').checked;
    echo();
    if (op !== 'DELETE' || !skip) {
      if (!skip && !v.id) return setMsg('bad', 'booking_id(키)를 입력하세요.');
    }
    if (op === 'INSERT') {
      if (find(v.id) >= 0) return setMsg('bad', '✕ <b>INSERT 중복키</b> — booking_id <code>' + v.id + '</code>가 이미 있어 <b>삽입되지 않았습니다</b> (sy-subrc=<b>4</b>, 덤프 아님). 중복은 성공이 아니므로 실패로 분기하고, 있으면 갱신하려면 <b>MODIFY</b>(upsert). ※대량 <code>INSERT FROM TABLE</code> 중복은 런타임 오류.');
      rows.push({ id: v.id, pax: v.pax || '신규승객', seats: v.seats || '1', st: v.st, by: UNAME, on: TODAY });
      render({ ids: [v.id], cls: 'ins' });
      return setMsg('ok', '✓ <b>INSERT</b> 1행 추가 (sy-subrc=0). 감사필드 <code>created_by=' + UNAME + '</code>·<code>created_on=' + TODAY + '</code> 자동 stamp.');
    }
    if (op === 'MODIFY') {
      var i = find(v.id);
      if (i >= 0) { rows[i].pax = v.pax || rows[i].pax; rows[i].seats = v.seats || rows[i].seats; rows[i].st = v.st; render({ ids: [v.id], cls: 'upd' }); return setMsg('ok', '✓ <b>MODIFY</b> — 키가 <b>있어</b> 기존 행을 <b>수정</b>(upsert)했습니다 (sy-subrc=0).'); }
      rows.push({ id: v.id, pax: v.pax || '신규승객', seats: v.seats || '1', st: v.st, by: UNAME, on: TODAY });
      render({ ids: [v.id], cls: 'ins' });
      return setMsg('ok', '✓ <b>MODIFY</b> — 키가 <b>없어</b> 새 행을 <b>추가</b>(upsert)했습니다. INSERT는 중복키면 sy-subrc=4로 실패하지만, MODIFY는 조용히 덮어씁니다.');
    }
    if (op === 'UPDATE') {
      if (skip) { rows.forEach(function (r) { r.st = v.st; }); render({ ids: rows.map(function (r) { return r.id; }), cls: 'upd' }); return setMsg('bad', '⚠ <b>WHERE 없는 UPDATE</b> — <b>전체 ' + rows.length + '행</b>의 status가 \'' + v.st + '\'로 바뀌었습니다! 실무에서 사고의 단골. 조건을 반드시.'); }
      var j = find(v.id);
      if (j < 0) return setMsg('info', 'UPDATE 대상 없음 — booking_id <code>' + v.id + '</code> 행이 없습니다 (sy-subrc=4, 아무것도 안 바뀜).');
      rows[j].st = v.st; render({ ids: [v.id], cls: 'upd' });
      return setMsg('ok', '✓ <b>UPDATE</b> — booking_id <code>' + v.id + '</code> 1행의 status=\'' + v.st + '\' (sy-subrc=0).');
    }
    if (op === 'DELETE') {
      if (skip) { var n = rows.length; rows = []; render(); return setMsg('bad', '⚠ <b>WHERE 없는 DELETE</b> — <b>전체 ' + n + '행</b>이 삭제됐습니다! 한 줄로 테이블을 비웠습니다. 조건을 반드시.'); }
      var k = find(v.id);
      if (k < 0) return setMsg('info', 'DELETE 대상 없음 — booking_id <code>' + v.id + '</code> 행이 없습니다 (sy-subrc=4).');
      var gone = rows[k]; rows.splice(k, 1);
      render(); setMsg('ok', '✓ <b>DELETE</b> — booking_id <code>' + gone.id + '</code> 1행 삭제 (sy-subrc=0).');
      return;
    }
  }

  // 배선
  [].forEach.call(document.querySelectorAll('.op'), function (b) { b.addEventListener('click', function () { setOp(b.dataset.op); }); });
  ['key', 'pax', 'seats', 'st'].forEach(function (id) { $(id).addEventListener('input', echo); });
  $('skip').addEventListener('change', function () { $('keyFld').style.opacity = $('skip').checked ? '.4' : '1'; echo(); });
  $('run').addEventListener('click', run);
  $('reset').addEventListener('click', reset);

  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);

  setOp('INSERT'); reset();
})();
