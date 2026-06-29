/* salv-layout-lab 엔진 — SALV의 표시 설정을 바꿔 가며 화면이 어떻게 달라지는지 본다.
   줄무늬(set_striped_pattern)·폭 최적화(set_optimize)·컬럼 텍스트(set_short/medium/long_text)·variant(get_layout) 개념을 체험한다.
   특히 long_text만 바꾸면 헤더가 안 바뀔 수 있고(셋 다 맞춰야 함), 컬럼명을 틀리면 cx_salv_not_found가 난다.
   골격 계약: .sll-ctrl(토글 버튼) · .sll-text(세그) · #sllCode · #sllTable · #sllStatus.
   config: window.SLL_CFG = { cols:[{f,label}], rows, capCol, badCol, clipCol }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SLL_CFG || { cols: [], rows: [], capCol: 'CAPACITY', badCol: 'CAP', clipCol: 'CONCERT_ID' };
  var st = { striped: false, opt: false, text: 'none', bad: false };  // text: none | long | all

  var ctrlEl = document.querySelector('.sll-ctrl');
  var textEl = document.querySelector('.sll-text');
  var codeEl = document.getElementById('sllCode');
  var tblEl = document.getElementById('sllTable');
  var statusEl = document.getElementById('sllStatus');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function renderCtrl() {
    ctrlEl.innerHTML =
      '<button type="button" data-k="striped" aria-pressed="' + (st.striped ? 'true' : 'false') + '">줄무늬</button>' +
      '<button type="button" data-k="opt" aria-pressed="' + (st.opt ? 'true' : 'false') + '">폭 최적화</button>' +
      '<span class="sll-grp"><span class="clbl">CAPACITY 텍스트</span><span class="sll-seg sll-text"></span></span>' +
      '<button type="button" class="bad" data-k="bad" aria-pressed="' + (st.bad ? 'true' : 'false') + '">컬럼명 오타</button>';
    textEl = document.querySelector('.sll-text');
    textEl.innerHTML = [['none', '기본'], ['long', 'long만'], ['all', '셋 다']].map(function (it) {
      return '<button type="button" data-t="' + it[0] + '" aria-pressed="' + (st.text === it[0] ? 'true' : 'false') + '">' + it[1] + '</button>';
    }).join('');
  }

  function capHeader() { return st.text === 'all' ? '정원' : CFG.capCol; }

  function renderCode() {
    function ln(on, html) { return '<span class="' + (on ? 'on' : 'off') + '">' + html + '</span>'; }
    var txt;
    if (st.text === 'all') txt = 'lo_col-&gt;<span class="fn">set_short_text</span>( \'정원\' ).  \" + medium + long 모두';
    else if (st.text === 'long') txt = 'lo_col-&gt;<span class="fn">set_long_text</span>( \'정원\' ).         \" long만';
    else txt = 'lo_col-&gt;set_long_text( ... ).';
    var getCol = st.bad
      ? 'DATA(lo_col) = lo_cols-&gt;<span class="fn">get_column</span>( \'<span style="color:#8a1538;font-weight:700">' + CFG.badCol + '</span>\' ).'
      : 'DATA(lo_col) = lo_cols-&gt;<span class="fn">get_column</span>( \'' + CFG.capCol + '\' ).';
    codeEl.innerHTML =
      ln(st.striped, 'lo-&gt;<span class="fn">get_display_settings</span>( )-&gt;set_striped_pattern( abap_true ).') + '\n' +
      ln(st.opt, 'lo_cols-&gt;<span class="fn">set_optimize</span>( abap_true ).') + '\n' +
      ln(st.text !== 'none', getCol) + '\n' +
      ln(st.text !== 'none', txt) + '\n' +
      'lo-&gt;<span class="fn">get_layout</span>( )-&gt;set_key( <span class="fn">VALUE</span> salv_s_layout_key( report = sy-repid ) ).\n' +
      'lo-&gt;display( ).';
  }

  function renderTable() {
    var head = '<tr>' + CFG.cols.map(function (c) {
      var renamed = c.f === CFG.capCol && st.text === 'all';
      return '<th class="' + (renamed ? 'renamed' : '') + '">' + h(c.f === CFG.capCol ? capHeader() : c.f) + '</th>';
    }).join('') + '</tr>';
    var body = CFG.rows.map(function (r) {
      return '<tr>' + CFG.cols.map(function (c) {
        var clip = c.f === CFG.clipCol ? ' class="clip"' : '';
        return '<td' + clip + '>' + h(r[c.f]) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    tblEl.innerHTML = '<table class="sll-tbl' + (st.striped ? ' striped' : '') + (st.opt ? ' opt' : '') + '"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }

  function renderStatus() {
    if (st.bad) {
      statusEl.className = 'bad';
      statusEl.innerHTML = '🚫 <code>cx_salv_not_found</code> — 컬럼 <code>' + CFG.badCol + '</code>를 찾을 수 없습니다. <code>get_column</code>은 화면 제목이 아니라 <b>내부 필드명 <code>' + CFG.capCol + '</code></b>로 접근합니다.';
      return;
    }
    if (st.text === 'long') {
      statusEl.className = 'warn';
      statusEl.innerHTML = '⚠️ <b><code>long_text</code>만 바꿈</b> — SALV는 폭에 따라 short/medium/long 중 하나를 고릅니다. 헤더가 그대로일 수 있으니 <b>세 텍스트를 함께</b> 맞추세요(\'셋 다\').';
      return;
    }
    var parts = [];
    parts.push(st.striped ? '줄무늬 <b>ON</b>' : '줄무늬 off');
    parts.push(st.opt ? '폭 최적화(긴 <code>' + CFG.clipCol + '</code> 안 잘림)' : '폭 최적화 off');
    parts.push(st.text === 'all' ? 'CAPACITY 헤더 <b>"정원"</b>' : 'CAPACITY 헤더 기본');
    statusEl.className = (st.striped || st.opt || st.text === 'all') ? 'ok' : '';
    statusEl.innerHTML = parts.join(' · ') + '. variant는 <b>사용자별 보기</b>(컬럼 순서·숨김·폭)일 뿐 데이터 변경이 아닙니다.';
  }

  function render() { renderCtrl(); renderCode(); renderTable(); renderStatus(); }

  ctrlEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = b.getAttribute('data-k'), t = b.getAttribute('data-t');
    if (t) { st.text = t; st.bad = false; }
    else if (k === 'bad') { st.bad = !st.bad; }
    else if (k) { st[k] = !st[k]; }
    render();
  });

  render();
})();
