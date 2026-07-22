/* cell-style-board 엔진 — 셀의 모양/동작(비활성·편집 가능·버튼)을 LVC_T_STYL(cellstyles) deep로 주고 stylefname으로 연결한다.
   색(L04 ctab_fname)과 같은 2단계지만 layout 속성은 stylefname이고, 컬럼명 필드는 fname이 아니라 fieldname이다.
   버튼 스타일은 모양만 — 클릭 처리는 이후 ALV 이벤트 장(CH30) 경계로 둔다.
   골격 계약: .csb-act(버튼) · #csbTable · #csbStyl · #csbStatus.
   config: window.CSB_CFG = { rows:[{concert,perf,booked,style,label}], styleCol }. 높이: _autoheight.js. */
(function () {
  var CFG = window.CSB_CFG || { rows: [], styleCol: 'BOOKED' };
  var st = { applied: false, connected: false, lastInfo: '' };
  var STYLE_CONST = { disabled: 'mc_style_disabled', enabled: 'mc_style_enabled', button: 'mc_style_button' };

  var actEl = document.querySelector('.csb-act');
  var tblEl = document.getElementById('csbTable');
  var stylEl = document.getElementById('csbStyl');
  var statusEl = document.getElementById('csbStatus');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function renderActs() {
    actEl.innerHTML =
      '<button type="button" class="prim" data-a="apply" aria-pressed="' + (st.applied ? 'true' : 'false') + '">① 스타일 적용</button>' +
      '<button type="button" class="prim" data-a="connect" aria-pressed="' + (st.connected ? 'true' : 'false') + '">② stylefname 연결</button>' +
      '<button type="button" class="reset" data-a="reset">리셋</button>';
  }

  function cellClass(r) {
    if (!st.applied || !st.connected || !r.style) return '';
    return 'cell-' + r.style;
  }

  function renderTable() {
    var head = '<tr><th>CONCERT_ID</th><th>PERF_NO</th><th>BOOKED</th><th>상태</th></tr>';
    var body = CFG.rows.map(function (r, i) {
      var armed = st.applied && !st.connected && r.style;
      var cls = cellClass(r) + (armed ? ' armed' : '');
      var inner = (st.applied && st.connected && r.style === 'button')
        ? '<span class="btn" data-row="' + i + '">' + r.booked + ' 상세</span>'
        : r.booked;
      return '<tr><td>' + h(r.concert) + '</td><td>' + h(r.perf) + '</td>' +
        '<td class="' + cls.trim() + '">' + inner + '</td><td>' + h(r.label) + '</td></tr>';
    }).join('');
    tblEl.innerHTML = '<table class="csb-tbl"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }

  function renderStyl() {
    if (!st.applied) { stylEl.innerHTML = ''; return; }
    var styled = CFG.rows.filter(function (r) { return r.style; });
    var rows = styled.map(function (r) {
      return '<div class="csb-styl-row">' + h(r.concert) + '/' + h(r.perf) + ' → cellstyles[1]: fieldname = \'' + CFG.styleCol + '\', style = <b>' + STYLE_CONST[r.style] + '</b></div>';
    }).join('');
    stylEl.innerHTML = '<div class="cap"><code>cellstyles</code>(LVC_T_STYL) 내용 — 컬럼명 필드는 <code>fieldname</code>(색의 <code>fname</code>과 다름)</div>' + rows;
  }

  function renderStatus() {
    if (st.lastInfo) { statusEl.className = 'info'; statusEl.innerHTML = st.lastInfo; return; }
    if (!st.applied) { statusEl.className = ''; statusEl.innerHTML = '<b>① 스타일 적용</b>으로 행마다 <code>cellstyles</code>에 스타일 줄을 채워 보세요(매진=비활성·관리자=편집·상세=버튼).'; return; }
    if (!st.connected) { statusEl.className = 'warn'; statusEl.innerHTML = '⚠️ <b>아직 화면은 기본 모양</b> — <code>cellstyles</code>는 채웠지만 <code>ls_layout-stylefname = \'CELLSTYLES\'</code>로 <b>연결해야</b> 적용됩니다. (색은 <code>ctab_fname</code>, 모양은 <code>stylefname</code>.)'; return; }
    statusEl.className = 'ok';
    statusEl.innerHTML = '✅ <b>연결됨</b> — 매진 셀은 <b>비활성(🔒)</b>, 관리자 셀은 <b>편집 모양</b>, 상세 셀은 <b>버튼</b>으로 보입니다. 모양만일 뿐, 실제 입력·검증·저장은 이후 편집 챕터의 일입니다.';
  }

  function render() { renderActs(); renderTable(); renderStyl(); renderStatus(); }

  actEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.getAttribute('data-a'); st.lastInfo = '';
    if (a === 'reset') st = { applied: false, connected: false, lastInfo: '' };
    else if (a === 'apply') st.applied = !st.applied;
    else if (a === 'connect') { if (!st.applied) st.applied = true; st.connected = !st.connected; }
    render();
  });
  tblEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn'); if (!btn) return;
    st.lastInfo = 'ℹ️ <b>버튼 모양일 뿐</b> — 클릭 이벤트(상세 목록 열기 등) 처리는 <b>이후 ALV 이벤트 챕터</b>에서 구현합니다. 이 장은 표시·모양까지가 경계입니다.';
    renderStatus();
  });

  render();
})();
