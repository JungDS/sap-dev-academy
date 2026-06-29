/* read-vs-tabexpr 엔진 — 같은 검색 키로 네 가지 접근을 비교한다.
   READ TABLE(sy-subrc만 세팅, 계속 진행) · Table Expression tab[ ](없으면 CX_SY_ITAB_LINE_NOT_FOUND 예외) ·
   line_exists(있을 때만 읽어 안전) · line_index(위치 또는 0).
   골격 계약: .rvt-ids · #rvtData · #rvtMethods.
   config: window.RVT_CFG = { cols:[{key,label}], rows:[{}], keyField, ids:[] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.RVT_CFG || { cols: [], rows: [], keyField: 'booking_id', ids: [] };
  var sel = CFG.ids[0];

  var idsEl = document.querySelector('.rvt-ids');
  var dataEl = document.getElementById('rvtData');
  var methodsEl = document.getElementById('rvtMethods');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function findIdx() { for (var i = 0; i < CFG.rows.length; i++) if (CFG.rows[i][CFG.keyField] === sel) return i; return -1; }

  function renderIds() {
    idsEl.innerHTML = CFG.ids.map(function (id) {
      return '<button type="button" data-id="' + esc(id) + '" aria-pressed="' + (id === sel ? 'true' : 'false') + '">' + esc(id) + '</button>';
    }).join('');
  }
  function renderData() {
    var idx = findIdx();
    dataEl.innerHTML = '<div class="rvt-gtt">lt_booking</div><table class="rvt-tbl"><thead><tr>' +
      CFG.cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      CFG.rows.map(function (r, i) { return '<tr class="' + (i === idx ? 'hit' : '') + '">' + CFG.cols.map(function (c) { return '<td>' + esc(r[c.key]) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table>';
  }
  function method(title, code, cls, result) {
    return '<div class="rvt-m"><div class="mt">' + title + '</div><div class="mc">' + esc(code) + '</div><div class="mr ' + cls + '">' + result + '</div></div>';
  }
  function renderMethods() {
    var idx = findIdx(), found = idx >= 0, row = found ? CFG.rows[idx] : null;
    var disp = found ? row.customer + ' · ' + row.seats + '석' : '';
    var h = '';
    h += method('① READ TABLE … INTO',
      'READ TABLE lt_booking INTO ls_book WITH KEY booking_id = \'' + esc(sel) + '\'.',
      found ? 'ok' : 'warn',
      found ? '✅ <code>sy-subrc = 0</code> · ls_book = ' + esc(disp) : '📭 <code>sy-subrc = 4</code> — 못 찾았지만 프로그램은 <b>계속 진행</b>.');
    h += method('② Table Expression  lt[ ]',
      'DATA(ls_book) = lt_booking[ booking_id = \'' + esc(sel) + '\' ].',
      found ? 'ok' : 'bad',
      found ? '✅ ls_book = ' + esc(disp) : '💥 <code>CX_SY_ITAB_LINE_NOT_FOUND</code> 예외 — 없는 행을 값처럼 읽으면 런타임 오류!');
    h += method('③ line_exists( ) 보호',
      'IF line_exists( lt_booking[ booking_id = \'' + esc(sel) + '\' ] ). … ENDIF.',
      'ok',
      found ? '✅ 존재 → 안전하게 읽음 (' + esc(disp) + ')' : '✅ 없음 → 예외 없이 <b>\'없음\'</b> 분기 (이 챕터 권장 보호)');
    h += method('④ line_index( )',
      'DATA(lv_idx) = line_index( lt_booking[ booking_id = \'' + esc(sel) + '\' ] ).',
      found ? 'ok' : 'warn',
      found ? '✅ lv_idx = <code>' + (idx + 1) + '</code> (위치)' : '📍 lv_idx = <code>0</code> — 못 찾으면 0을 돌려줌(예외 아님).');
    methodsEl.innerHTML = h;
  }
  function render() { renderIds(); renderData(); renderMethods(); }

  idsEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sel = b.getAttribute('data-id'); render(); });

  render();
})();
