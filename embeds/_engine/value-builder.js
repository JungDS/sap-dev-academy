/* value-builder 엔진 — VALUE constructor expression으로 테이블을 만든다.
   테이블 만들기(3행) · BASE로 추가(기존 유지) · BASE 없이 대입(기존 대체) · FOR로 2단(9행) · 중복 key 시도(unique key면 오류).
   생성된 VALUE 코드·결과 테이블(새 행 강조)·경고를 보여 준다.
   골격 계약: .vb-key · .vb-acts · #vbExpr · #vbTable · #vbMsg.
   config: window.VB_CFG(미사용 가능). 높이: _autoheight.js. */
(function () {
  var keyMode = 'empty';   // 'empty' | 'unique'
  var rows = [];           // [{dan,mul,result,isNew}]
  var expr = '';

  var keyEl = document.querySelector('.vb-key');
  var actsEl = document.querySelector('.vb-acts');
  var exprEl = document.getElementById('vbExpr');
  var tableEl = document.getElementById('vbTable');
  var msgEl = document.getElementById('vbMsg');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function clearNew() { rows.forEach(function (r) { r.isNew = false; }); }
  function isDup(dan, mul) { return rows.some(function (r) { return r.dan === dan && r.mul === mul; }); }
  function setMsg(cls, html) { msgEl.className = cls || ''; msgEl.innerHTML = html; }

  function renderKey() {
    keyEl.innerHTML = [{ v: 'empty', l: 'EMPTY KEY' }, { v: 'unique', l: 'UNIQUE KEY dan mul' }].map(function (o) {
      return '<button type="button" data-v="' + o.v + '" aria-pressed="' + (o.v === keyMode ? 'true' : 'false') + '">' + esc(o.l) + '</button>';
    }).join('');
  }
  function renderExpr() { exprEl.innerHTML = expr ? esc(expr) : '<span class="ph">버튼을 눌러 VALUE 식을 만들어 보세요.</span>'; }
  function renderTable() {
    if (!rows.length) { tableEl.innerHTML = '<div class="vb-gtt"><span>lt_gugu</span><span>0행</span></div><div class="vb-empty">빈 테이블</div>'; return; }
    tableEl.innerHTML = '<div class="vb-gtt"><span>lt_gugu</span><span>' + rows.length + '행</span></div>' +
      '<table class="vb-tbl"><thead><tr><th>dan</th><th>mul</th><th>result</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr class="' + (r.isNew ? 'new' : '') + '"><td>' + r.dan + '</td><td>' + r.mul + '</td><td>' + r.result + '</td></tr>'; }).join('') +
      '</tbody></table>';
  }
  function render() { renderKey(); renderExpr(); renderTable(); }

  var ACTS = {
    make: function () {
      rows = [{ dan: 2, mul: 1, result: 2, isNew: true }, { dan: 2, mul: 2, result: 4, isNew: true }, { dan: 2, mul: 3, result: 6, isNew: true }];
      expr = 'DATA(lt_gugu) = VALUE ty_line_tab(\n  ( dan = 2 mul = 1 result = 2 )\n  ( dan = 2 mul = 2 result = 4 )\n  ( dan = 2 mul = 3 result = 6 ) ).';
      setMsg('ok', '✅ 3행 테이블 생성 — 각 <code>( )</code>가 한 행입니다.');
    },
    base: function () {
      if (keyMode === 'unique' && isDup(3, 1)) { setMsg('bad', '🚫 중복 key (dan=3, mul=1) — unique key 테이블이라 런타임 오류.'); return; }
      clearNew();
      rows.push({ dan: 3, mul: 1, result: 3, isNew: true });
      expr = 'lt_gugu = VALUE #( BASE lt_gugu\n  ( dan = 3 mul = 1 result = 3 ) ).';
      setMsg('ok', '✅ <code>BASE</code>로 기존 행을 유지하고 1행 추가 — 이제 ' + rows.length + '행.');
    },
    replace: function () {
      rows = [{ dan: 3, mul: 1, result: 3, isNew: true }];
      expr = 'lt_gugu = VALUE #(\n  ( dan = 3 mul = 1 result = 3 ) ).   \" BASE 없음';
      setMsg('warn', '⚠ <code>BASE</code>가 없어 기존 행이 <b>사라지고 새 값으로 대체</b>됐습니다 — VALUE는 새 값을 만듭니다.');
    },
    forgen: function () {
      rows = [];
      for (var i = 1; i <= 9; i++) rows.push({ dan: 2, mul: i, result: 2 * i, isNew: true });
      expr = 'DATA(lt_gugu) = VALUE ty_line_tab(\n  FOR i = 1 WHILE i <= 9\n  ( dan = 2 mul = i result = 2 * i ) ).';
      setMsg('ok', '✅ <code>FOR i = 1 WHILE i <= 9</code> → 9행. <code>i</code>는 이 식 안에서만 삽니다.');
    },
    dup: function () {
      if (keyMode === 'unique' && isDup(2, 1)) { setMsg('bad', '🚫 중복 key (dan=2, mul=1) — unique key 테이블에 같은 key 행은 런타임 오류. <b>key 규칙은 VALUE에서도 그대로</b> 적용됩니다.'); return; }
      clearNew();
      rows.push({ dan: 2, mul: 1, result: 2, isNew: true });
      expr = 'lt_gugu = VALUE #( BASE lt_gugu\n  ( dan = 2 mul = 1 result = 2 ) ).';
      setMsg('warn', 'EMPTY KEY라 중복 행도 허용됩니다(현재 ' + rows.length + '행). unique key였다면 오류였습니다.');
    },
    reset: function () { rows = []; expr = ''; setMsg('', '버튼을 눌러 VALUE 식을 만들어 보세요.'); }
  };

  keyEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; keyMode = b.getAttribute('data-v'); render(); });
  actsEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-act'); if (ACTS[a]) { ACTS[a](); render(); } });

  render();
})();
