/* cell-color-microscope 엔진 — 셀 단위 색은 행에 LVC_T_SCOL(cellcolors)을 품는 deep structure로 만든다.
   핵심은 2단계다: ① 색 계산으로 cellcolors 내부 테이블을 채워도 ② ls_layout-ctab_fname으로 연결해야 화면이 칠해진다.
   fname을 틀리면 색 정보는 있어도 적용되지 않는다.
   골격 계약: .ccm-act(버튼) · #ccmTable · #ccmScol · #ccmStatus.
   config: window.CCM_CFG = { rows, colorCol, badName }. 높이: _autoheight.js. */
(function () {
  var CFG = window.CCM_CFG || { rows: [], colorCol: 'SEATSOCC', badName: 'SEATS_OCC' };
  var st = { computed: false, connected: false, typo: false };

  var actEl = document.querySelector('.ccm-act');
  var tblEl = document.getElementById('ccmTable');
  var scolEl = document.getElementById('ccmScol');
  var statusEl = document.getElementById('ccmStatus');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function isFull(r) { return r.seatsocc >= r.capacity; }
  function fnameUsed() { return st.typo ? CFG.badName : CFG.colorCol; }

  function renderActs() {
    actEl.innerHTML =
      '<button type="button" class="prim" data-a="compute" aria-pressed="' + (st.computed ? 'true' : 'false') + '">① 색 계산</button>' +
      '<button type="button" class="prim" data-a="connect" aria-pressed="' + (st.connected ? 'true' : 'false') + '">② ctab_fname 연결</button>' +
      '<button type="button" class="bad" data-a="typo" aria-pressed="' + (st.typo ? 'true' : 'false') + '">fname 오타</button>' +
      '<button type="button" class="reset" data-a="reset">리셋</button>';
  }

  function painted(r) { return st.computed && st.connected && !st.typo && isFull(r); }

  function renderTable() {
    var head = '<tr><th>CONCERT_ID</th><th>PERF_NO</th><th>SEATSOCC</th><th>CAPACITY</th></tr>';
    var body = CFG.rows.map(function (r) {
      var full = isFull(r);
      // 색 계산은 됐지만 아직 연결 전이면 armed(테두리만), 연결되면 painted(칠)
      var seatCls = painted(r) ? 'painted' : ((st.computed && full && st.connected === false) ? 'armed' : '');
      return '<tr class="' + (full ? 'full' : '') + '"><td>' + h(r.concert) + '</td><td>' + h(r.perf) + '</td>' +
        '<td class="' + seatCls + '">' + r.seatsocc + '</td><td>' + r.capacity + '</td></tr>';
    }).join('');
    tblEl.innerHTML = '<table class="ccm-tbl"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }

  function renderScol() {
    if (!st.computed) { scolEl.innerHTML = ''; return; }
    var fulls = CFG.rows.filter(isFull);
    var rows = fulls.map(function (r) {
      var fn = fnameUsed();
      var fnHtml = st.typo ? '<span class="bad">\'' + fn + '\'</span>' : '\'' + fn + '\'';
      return '<div class="ccm-scol-row">' + h(r.concert) + '/' + h(r.perf) + ' → cellcolors[1]: fname = ' + fnHtml + ', color-col = <b>COL_NEGATIVE</b></div>';
    }).join('');
    scolEl.innerHTML = '<div class="cap">매진 행의 <code>cellcolors</code>(LVC_T_SCOL) 내용</div>' + rows;
  }

  function renderStatus() {
    if (!st.computed) {
      statusEl.className = '';
      statusEl.innerHTML = '<b>① 색 계산</b>을 눌러, 매진 행의 <code>cellcolors</code> 내부 테이블에 색 줄을 채워 보세요.';
      return;
    }
    if (st.typo) {
      statusEl.className = st.connected ? 'bad' : 'warn';
      statusEl.innerHTML = '🚫 <b>fname 오타</b> — <code>' + CFG.badName + '</code>는 화면 컬럼 <code>' + CFG.colorCol + '</code>과 다릅니다. <b>색 정보는 있으나 해당 컬럼이 없어</b> 칠해지지 않습니다(<code>fname</code>은 컬럼 제목이 아니라 component 이름).';
      return;
    }
    if (!st.connected) {
      statusEl.className = 'warn';
      statusEl.innerHTML = '⚠️ <b>아직 화면은 그대로</b> — <code>cellcolors</code>에 색 줄은 생겼지만, <code>ls_layout-ctab_fname = \'CELLCOLORS\'</code>로 <b>연결해야</b> ALV가 색을 읽습니다. <b>② ctab_fname 연결</b>을 누르세요.';
      return;
    }
    statusEl.className = 'ok';
    statusEl.innerHTML = '✅ <b>연결됨</b> — 매진 행의 <code>' + CFG.colorCol + '</code> 셀만 빨강(<code>COL_NEGATIVE</code>). 행 전체가 아니라 <b>그 셀 하나</b>만 칠해집니다.';
  }

  function render() { renderActs(); renderTable(); renderScol(); renderStatus(); }

  actEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.getAttribute('data-a');
    if (a === 'reset') st = { computed: false, connected: false, typo: false };
    else if (a === 'compute') st.computed = !st.computed;
    else if (a === 'connect') { if (!st.computed) st.computed = true; st.connected = !st.connected; }
    else if (a === 'typo') { st.typo = !st.typo; if (st.typo && !st.computed) st.computed = true; }
    render();
  });

  render();
})();
