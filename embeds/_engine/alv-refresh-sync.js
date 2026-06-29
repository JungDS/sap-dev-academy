/* alv-refresh-sync 엔진 — 내부 테이블(lt_booking) 변경과 화면 Grid 갱신을 분리해 보여 준다.
   '상태 변경'은 내부만 바꾼다(화면 stale). '일반 Refresh'는 화면을 맞추지만 스크롤이 맨 위로 튄다.
   'Stable Refresh'는 화면을 맞추면서 보던 위치를 유지한다. 데이터변경/화면갱신/위치보존 3체크.
   골격 계약: [data-act] · #arsInternal · #arsScreen · #arsChecks.
   config: window.ARS_CFG = { cols:[{key,label}], rows:[{}], flipRow, flipCol, midRow }. 높이: _autoheight.js. */
(function () {
  var CFG = window.ARS_CFG || { cols: [], rows: [], flipRow: 1, flipCol: 'status', midRow: 0 };
  function clone(a) { return a.map(function (r) { var o = {}; for (var k in r) o[k] = r[k]; return o; }); }
  var internal = clone(CFG.rows);
  var screen = clone(CFG.rows);
  var viewRow = 0;
  var lastRefresh = null;   // 'plain' | 'stable' | null

  var intEl = document.getElementById('arsInternal');
  var scrEl = document.getElementById('arsScreen');
  var checksEl = document.getElementById('arsChecks');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function stale() { return JSON.stringify(internal) !== JSON.stringify(screen); }
  function fmtStatus(v) { return '<span class="c' + esc(v) + '">' + esc(v) + (v === 'N' ? ' 예약' : ' 취소') + '</span>'; }

  function tableHTML(title, data, opts) {
    opts = opts || {};
    var head = '<div class="ars-gtt"><span>' + title + '</span>' + (opts.stale ? '<span class="stale">화면 미반영</span>' : '') + '</div>';
    var body = '<table class="ars-tbl"><thead><tr>' + CFG.cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      data.map(function (r, i) {
        var cls = '';
        if (opts.chgIdx && opts.chgIdx.indexOf(i) >= 0) cls = 'chg';
        if (opts.view === i) cls = 'view';
        return '<tr class="' + cls + '">' + CFG.cols.map(function (c) {
          var v = c.key === CFG.flipCol ? fmtStatus(r[c.key]) : esc(r[c.key]);
          if (opts.view === i && c.key === CFG.cols[0].key) v = '<span class="eye">👁</span> ' + v;
          return '<td>' + v + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table>';
    return head + body;
  }
  function changedIdx() {
    var idx = [];
    internal.forEach(function (r, i) { if (JSON.stringify(r) !== JSON.stringify(screen[i])) idx.push(i); });
    return idx;
  }
  function renderTables() {
    intEl.innerHTML = tableHTML('내부 lt_booking', internal, { chgIdx: changedIdx() });
    scrEl.innerHTML = tableHTML('화면 Grid', screen, { view: viewRow, stale: stale() });
  }
  function renderChecks() {
    var dataChanged = stale();                      // 내부만 바뀐 상태?
    var synced = !stale();                          // 화면이 내부와 같은가
    var posKept = lastRefresh === 'stable';         // 마지막 refresh가 위치 유지?
    function chk(on, label, sub) {
      var cls = on === true ? 'on' : (on === false ? 'off' : '');
      var mark = on === true ? '✓' : (on === false ? '✗' : '–');
      return '<div class="ars-chk ' + cls + '"><span class="ci">' + mark + '</span><span class="ck">' + label + '<small>' + sub + '</small></span></div>';
    }
    checksEl.innerHTML =
      chk(dataChanged ? true : null, '데이터 변경', dataChanged ? '내부만 바뀜(미반영)' : '변경 없음') +
      chk(synced, '화면 갱신', synced ? '내부와 동일' : 'refresh 필요') +
      chk(lastRefresh ? posKept : null, '위치 보존', lastRefresh === 'stable' ? 'stable로 유지' : (lastRefresh === 'plain' ? '맨 위로 튐' : '아직 refresh 안 함'));
  }
  function render() { renderTables(); renderChecks(); }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'change') { var r = internal[CFG.flipRow]; r[CFG.flipCol] = r[CFG.flipCol] === 'N' ? 'C' : 'N'; }
    else if (act === 'scroll') { viewRow = CFG.midRow; }
    else if (act === 'refresh') { screen = clone(internal); viewRow = 0; lastRefresh = 'plain'; }
    else if (act === 'stable') { screen = clone(internal); lastRefresh = 'stable'; }
    render();
  });

  render();
})();
