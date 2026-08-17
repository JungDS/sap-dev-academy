/* alv-row-color-lab 엔진 — 매진 판정으로 색 코드(C610)를 채우고 layout info_fname에 '필드명'을 연결하면 매진 행에 색이 입혀진다.
   booked를 바꿔 상태(여유/임박/매진)를 만들고, ① 색 코드 쓰기 ② info_fname 연결 ③ 표시 순서로 색이 보이게 한다.
   info_fname을 틀린 필드명(ROW_COLOR)으로 두면 색이 안 보인다. 4체크(본문 '네 가지'와 짝): 색코드 컬럼 / 코드 값 / 필드명 일치 / 화면 갱신.
   데이터 변경 ≠ 화면 갱신: 색 코드(rc)는 ①을 누른 시점에만 계산되고, 화면 색은 ③을 누른 시점의 스냅샷(screen).
   ③ 이후 점유·색코드·필드명을 바꿔도 ③을 다시 누르기 전엔 화면 색이 안 바뀐다(스테일이면 체크 ✗).
   골격 계약: [data-act] · .arc-fname · #arcTable · #arcChecks.
   config: window.ARC_CFG = { rows:[{concert_id,perf_no,perf_date,capacity,booked}], color, goodFname, badFname }. 높이: _autoheight.js. */
(function () {
  var CFG = window.ARC_CFG || { rows: [], color: 'C610', goodFname: 'ROWCOLOR', badFname: 'ROW_COLOR' };
  var occ = CFG.rows.map(function (r) { return r.booked; });
  var fname = CFG.goodFname, displayed = false;
  var rc = CFG.rows.map(function () { return ''; });        // 데이터의 색 코드 컬럼(① 시점에만 기록)
  var screen = CFG.rows.map(function () { return false; }); // 화면에 실제 입혀진 색(③ 시점 스냅샷)

  var fnameEl = document.querySelector('.arc-fname');
  var tableEl = document.getElementById('arcTable');
  var checksEl = document.getElementById('arcChecks');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function status(i) { var r = CFG.rows[i], o = occ[i]; if (o >= r.capacity) return 'full'; if (o / r.capacity >= 0.8) return 'near'; return 'ok'; }
  // ③을 지금 누르면 색이 입혀질 행(= 화면이 최신이라면 보일 모습)
  function wouldColor(i) { return fname === CFG.goodFname && rc[i] === CFG.color; }
  function stale() { return displayed && CFG.rows.some(function (r, i) { return wouldColor(i) !== screen[i]; }); }

  function renderFname() {
    fnameEl.innerHTML = [{ v: CFG.goodFname, bad: 0 }, { v: CFG.badFname, bad: 1 }].map(function (o) {
      return '<button type="button" data-v="' + esc(o.v) + '"' + (o.bad ? ' data-bad="1"' : '') + ' aria-pressed="' + (o.v === fname ? 'true' : 'false') + '">' + esc(o.v) + '</button>';
    }).join('');
  }
  function renderTable() {
    var STT = { full: '매진', near: '임박', ok: '여유' };
    tableEl.innerHTML = '<table class="arc-tbl"><thead><tr><th>공연</th><th>회차</th><th>일자</th><th>점유/정원</th><th>상태</th><th>ROWCOLOR</th></tr></thead><tbody>' +
      CFG.rows.map(function (r, i) {
        return '<tr class="' + (screen[i] ? 'colored' : '') + '">' +
          '<td>' + esc(r.concert_id) + '</td><td>' + esc(r.perf_no) + '</td><td>' + esc(r.perf_date) + '</td>' +
          '<td><input class="occ" type="number" data-i="' + i + '" value="' + esc(occ[i]) + '" min="0"> / ' + esc(r.capacity) + '</td>' +
          '<td><span class="arc-badge ' + status(i) + '">' + STT[status(i)] + '</span></td>' +
          '<td><span class="arc-rc ' + (rc[i] ? '' : 'empty') + '">' + (rc[i] || '(빈칸)') + '</span></td></tr>';
      }).join('') + '</tbody></table>';
  }
  function renderChecks() {
    var c1 = true;                                          // ① 색 코드 컬럼 존재 — 이 표의 행 타입엔 ROWCOLOR 컬럼이 이미 있음
    var c2 = rc.some(function (c) { return c !== ''; });    // ② 코드 값 기록(①을 누른 시점의 데이터)
    var c3 = fname === CFG.goodFname;                       // ③ 필드명 일치
    var c4 = displayed && !stale();                         // ④ 화면 갱신(최신) — 데이터만 바꾸면 ✗
    function chk(on, label) { return '<div class="arc-chk ' + (on ? 'on' : 'off') + '"><span class="ci">' + (on ? '✓' : '✗') + '</span><span class="ck">' + label + '</span></div>'; }
    checksEl.innerHTML = chk(c1, '① 색 코드 컬럼(ROWCOLOR) — 표에 이미 있음') + chk(c2, '② 색 코드 값 기록(C610)') +
      chk(c3, '③ info_fname 필드명 일치') +
      chk(c4, '④ 화면 갱신(표시)' + (stale() ? ' — 데이터가 바뀌었어요. ③ 표시를 다시 누르세요' : ''));
  }
  function render() { renderFname(); renderTable(); renderChecks(); }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'code') { rc = CFG.rows.map(function (r, i) { return status(i) === 'full' ? CFG.color : ''; }); }
    else if (act === 'display') { displayed = true; screen = CFG.rows.map(function (r, i) { return wouldColor(i); }); }
    else if (act === 'reset') { fname = CFG.goodFname; displayed = false; occ = CFG.rows.map(function (r) { return r.booked; }); rc = CFG.rows.map(function () { return ''; }); screen = CFG.rows.map(function () { return false; }); }
    render();
  });
  fnameEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; fname = b.getAttribute('data-v'); render(); });
  tableEl.addEventListener('input', function (e) { var i = e.target.getAttribute && e.target.getAttribute('data-i'); if (i !== null && i !== undefined) { occ[+i] = +e.target.value; renderTable(); renderChecks(); } });

  render();
})();
