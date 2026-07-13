/* dict-transport-tunnel 엔진 — CH16-L04 전용.
   TABLES work area(DDIC 필드)와 직접 선언 gv_ 필드가 화면↔프로그램으로 값을 나르는 걸 시연.
   TABLES 선언을 껐다 켜며, 이름이 맞아야 운반이 일어남을 보여 준다.
   골격 계약(HTML): [data-dtt] · #dttTables(체크박스) · #dttProg · #dttScreen · #dttMsg · [data-act].
   높이: _autoheight.js. */
(function () {
  var root = document.querySelector('[data-dtt]'); if (!root) return;
  var st = { tables: true, prog: { conc: '', seats: '' }, screen: { conc: '', seats: '' } };

  var progEl = root.querySelector('#dttProg');
  var scrEl = root.querySelector('#dttScreen');
  var msgEl = root.querySelector('#dttMsg');
  var chk = root.querySelector('#dttTables');

  function renderProg() {
    var off = !st.tables;
    progEl.innerHTML =
      '<div class="dtt-ptt">ABAP 프로그램 (전역 선언)</div>' +
      '<div class="dtt-code' + (off ? ' dtt-off' : '') + '">' +
        (off
          ? '<span class="dtt-cmt">* TABLES zconcert. (선언 안 됨)</span>'
          : 'TABLES zconcert.') +
      '</div>' +
      '<div class="dtt-wa' + (off ? ' dtt-off' : '') + '">' +
        '<div class="dtt-wal">work area <b>zconcert</b>' + (off ? ' <span class="dtt-x">없음</span>' : '') + '</div>' +
        '<div class="dtt-f"><span class="k">zconcert-concert_id</span><span class="v">' + val(st.prog.conc) + '</span></div>' +
      '</div>' +
      '<div class="dtt-code">DATA gv_seats TYPE i.</div>' +
      '<div class="dtt-wa">' +
        '<div class="dtt-f"><span class="k">gv_seats</span><span class="v">' + val(st.prog.seats) + '</span></div>' +
      '</div>';
  }

  function renderScreen() {
    scrEl.innerHTML =
      '<div class="dtt-stt">🖥 화면 0100</div>' +
      '<div class="dtt-srow">' +
        '<span class="dtt-lbl">공연 ID</span>' +
        '<input type="text" data-s="conc" maxlength="4" placeholder="C001" value="' + esc(st.screen.conc) + '">' +
        '<span class="dtt-el">ZCONCERT-CONCERT_ID</span>' +
      '</div>' +
      '<div class="dtt-srow">' +
        '<span class="dtt-lbl">좌석 수</span>' +
        '<input type="number" data-s="seats" min="1" placeholder="2" value="' + esc(st.screen.seats) + '">' +
        '<span class="dtt-el">GV_SEATS</span>' +
      '</div>';
  }

  function val(v) { return (v === '' || v == null) ? '<i class="dtt-empty">( 공백 )</i>' : esc(v); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function say(kind, html) { msgEl.className = 'dtt-msg ' + kind; msgEl.innerHTML = html; }

  function pbo() {
    // 프로그램이 값을 채우고 → 화면으로 (PBO 끝)
    st.prog.conc = 'C001'; st.prog.seats = '2';
    st.screen.seats = '2';                         // gv_seats 는 항상 운반
    if (st.tables) {
      st.screen.conc = 'C001';
      say('ok', '▶ <b>PBO</b>: 프로그램 → 화면. <code>zconcert-concert_id</code>와 <code>gv_seats</code> 값이 같은 이름의 화면 필드로 전달됐습니다.');
    } else {
      st.screen.conc = '';
      say('err', '⚠ <b>PBO</b>: <code>gv_seats</code>는 전달됐지만 <code>ZCONCERT-CONCERT_ID</code>는 <b>운반 안 됨</b> — <code>TABLES zconcert</code> work area가 없어 짝이 없습니다.');
    }
    renderAll();
  }

  function pai() {
    // 화면 값을 읽어 → 프로그램으로 (PAI 시작)
    readScreen();
    st.prog.seats = st.screen.seats;               // gv_seats 는 항상 운반
    if (st.tables) {
      st.prog.conc = st.screen.conc;
      say('ok', '▶ <b>PAI</b>: 화면 → 프로그램. 사용자가 고친 값이 <code>zconcert-concert_id</code>·<code>gv_seats</code>로 들어왔습니다.');
    } else {
      say('err', '⚠ <b>PAI</b>: <code>gv_seats</code>만 들어오고 <code>ZCONCERT-CONCERT_ID</code>는 <b>버려집니다</b> — work area가 없으니 받을 그릇이 없습니다.');
    }
    renderAll();
  }

  function readScreen() {
    var i1 = scrEl.querySelector('[data-s="conc"]'); if (i1) st.screen.conc = i1.value;
    var i2 = scrEl.querySelector('[data-s="seats"]'); if (i2) st.screen.seats = i2.value;
  }

  function renderAll() { renderProg(); renderScreen(); }

  root.addEventListener('input', function (e) {
    if (e.target.getAttribute && e.target.getAttribute('data-s')) {
      st.screen[e.target.getAttribute('data-s')] = e.target.value;
    }
  });
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    if (b.getAttribute('data-act') === 'pbo') pbo();
    else if (b.getAttribute('data-act') === 'pai') pai();
  });
  chk.addEventListener('change', function () {
    st.tables = chk.checked;
    if (!st.tables) { st.prog.conc = st.prog.conc; }
    say('', st.tables
      ? '<code>TABLES zconcert</code> 선언됨 — 화면의 <code>ZCONCERT-CONCERT_ID</code>가 work area와 이름으로 연결됩니다.'
      : '<code>TABLES zconcert</code>를 껐습니다 — 화면 필드 <code>ZCONCERT-CONCERT_ID</code>를 받을 work area가 사라집니다. PBO/PAI를 눌러 보세요.');
    renderAll();
  });

  say('', '<code>TABLES zconcert</code> 선언됨 — <b>PBO</b>·<b>PAI</b>를 눌러 값이 어느 방향으로 흐르는지 보세요. 위 스위치로 <code>TABLES</code>를 끄면 어떻게 되는지도 확인하세요.');
  renderAll();
})();
