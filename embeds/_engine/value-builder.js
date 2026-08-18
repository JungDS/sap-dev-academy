/* value-builder 엔진 — VALUE constructor expression으로 테이블을 만든다.
   테이블 만들기(3행) · BASE로 추가(기존 유지) · BASE 없이 대입(기존 대체) · FOR로 2단(9행) ·
   중복 key 시도(모드별 분기: unique=중복 실재 시 오류/없으면 행 추가 안내, empty=허용 안내) · unique 전환 시 중복 보유 테이블은 비우고 안내.
   생성된 VALUE 코드·결과 테이블(새 행 강조)·경고를 보여 준다.
   골격 계약: .vb-key · .vb-acts · #vbExpr · #vbTable · #vbMsg.
   config: window.VB_CFG(미사용 가능). 높이: _autoheight.js. */
(function () {
  var keyMode = 'empty';   // 'empty' | 'unique'
  var rows = [];           // [{concert_id,perf_no,seats,isNew}]
  var expr = '';

  var keyEl = document.querySelector('.vb-key');
  var actsEl = document.querySelector('.vb-acts');
  var exprEl = document.getElementById('vbExpr');
  var tableEl = document.getElementById('vbTable');
  var msgEl = document.getElementById('vbMsg');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function clearNew() { rows.forEach(function (r) { r.isNew = false; }); }
  function isDup(cid, pno) { return rows.some(function (r) { return r.concert_id === cid && r.perf_no === pno; }); }
  function hasDup() { var seen = {}; return rows.some(function (r) { var k = r.concert_id + '|' + r.perf_no; if (seen[k]) return true; seen[k] = 1; return false; }); }
  function setMsg(cls, html) { msgEl.className = cls || ''; msgEl.innerHTML = html; }

  function renderKey() {
    keyEl.innerHTML = [{ v: 'empty', l: 'EMPTY KEY' }, { v: 'unique', l: 'UNIQUE KEY concert_id perf_no' }].map(function (o) {
      return '<button type="button" data-v="' + o.v + '" aria-pressed="' + (o.v === keyMode ? 'true' : 'false') + '">' + esc(o.l) + '</button>';
    }).join('');
  }
  function renderExpr() { exprEl.innerHTML = expr ? esc(expr) : '<span class="ph">버튼을 눌러 VALUE 식을 만들어 보세요.</span>'; }
  function renderTable() {
    if (!rows.length) { tableEl.innerHTML = '<div class="vb-gtt"><span>lt_book</span><span>0행</span></div><div class="vb-empty">빈 테이블</div>'; return; }
    tableEl.innerHTML = '<div class="vb-gtt"><span>lt_book</span><span>' + rows.length + '행</span></div>' +
      '<table class="vb-tbl"><thead><tr><th>concert_id</th><th>perf_no</th><th>seats</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr class="' + (r.isNew ? 'new' : '') + '"><td>' + r.concert_id + '</td><td>' + r.perf_no + '</td><td>' + r.seats + '</td></tr>'; }).join('') +
      '</tbody></table>';
  }
  function render() { renderKey(); renderExpr(); renderTable(); }

  var ACTS = {
    make: function () {
      rows = [{ concert_id: 'C001', perf_no: '001', seats: 2, isNew: true }, { concert_id: 'C001', perf_no: '002', seats: 3, isNew: true }, { concert_id: 'C002', perf_no: '001', seats: 4, isNew: true }];
      expr = 'DATA(lt_book) = VALUE tt_book(\n  ( concert_id = \'C001\' perf_no = \'001\' seats = 2 )\n  ( concert_id = \'C001\' perf_no = \'002\' seats = 3 )\n  ( concert_id = \'C002\' perf_no = \'001\' seats = 4 ) ).';
      setMsg('ok', '✅ 3행 테이블 생성 — 각 <code>( )</code>가 한 행입니다.');
    },
    base: function () {
      if (keyMode === 'unique' && isDup('C003', '001')) { setMsg('bad', '🚫 중복 key (C003, 001) — unique key 테이블이라 런타임 오류.'); return; }
      clearNew();
      rows.push({ concert_id: 'C003', perf_no: '001', seats: 1, isNew: true });
      expr = 'lt_book = VALUE #( BASE lt_book\n  ( concert_id = \'C003\' perf_no = \'001\' seats = 1 ) ).';
      setMsg('ok', '✅ <code>BASE</code>로 기존 행을 유지하고 1행 추가 — 이제 ' + rows.length + '행.');
    },
    replace: function () {
      rows = [{ concert_id: 'C003', perf_no: '001', seats: 1, isNew: true }];
      expr = 'lt_book = VALUE #(\n  ( concert_id = \'C003\' perf_no = \'001\' seats = 1 ) ).   \" BASE 없음';
      setMsg('warn', '⚠ <code>BASE</code>가 없어 기존 행이 <b>사라지고 새 값으로 대체</b>됐습니다 — VALUE는 새 값을 만듭니다.');
    },
    forgen: function () {
      rows = [];
      for (var i = 1; i <= 9; i++) rows.push({ concert_id: 'C001', perf_no: ('00' + i).slice(-3), seats: 2, isNew: true });
      expr = 'DATA(lt_book) = VALUE tt_book(\n  FOR i = 1 WHILE i <= 9\n  ( concert_id = \'C001\' perf_no = i seats = 2 ) ).';
      setMsg('ok', '✅ <code>FOR i = 1 WHILE i <= 9</code> → 9행. <code>i</code>는 이 식 안에서만 삽니다.');
    },
    dup: function () {
      /* 모드별 정직한 안내: unique = 중복 실재 시에만 오류 체험, empty = 그 모드에서만 허용 안내. */
      if (keyMode === 'unique') {
        if (isDup('C001', '001')) { setMsg('bad', '🚫 중복 key (C001, 001) — unique key 테이블에 같은 key 행은 런타임 오류. <b>key 규칙은 VALUE에서도 그대로</b> 적용됩니다.'); return; }
        setMsg('', '아직 (C001, 001) 행이 없어 중복이 아닙니다 — 먼저 <b>[테이블 만들기]</b>로 행을 추가한 뒤 다시 시도하세요.');
        return;
      }
      clearNew();
      rows.push({ concert_id: 'C001', perf_no: '001', seats: 2, isNew: true });
      expr = 'lt_book = VALUE #( BASE lt_book\n  ( concert_id = \'C001\' perf_no = \'001\' seats = 2 ) ).';
      setMsg('warn', 'EMPTY KEY라 중복 행도 허용됩니다(현재 ' + rows.length + '행). unique key였다면 오류였습니다.');
    },
    reset: function () { rows = []; expr = ''; setMsg('', '버튼을 눌러 VALUE 식을 만들어 보세요.'); }
  };

  keyEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var next = b.getAttribute('data-v');
    if (next === 'unique' && next !== keyMode && hasDup()) {
      /* 중복 행이 있는 상태는 unique key 테이블에서 성립 자체가 불가능 — 테이블을 비우고 이유를 안내. */
      rows = []; expr = '';
      setMsg('warn', '⚠ 중복 key 행이 있던 테이블은 <b>unique key 테이블로는 성립할 수 없어</b> 비웠습니다. 이 모드에서 다시 만들어 중복 오류를 체험해 보세요.');
    }
    keyMode = next; render();
  });
  actsEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-act'); if (ACTS[a]) { ACTS[a](); render(); } });

  render();
})();
