/* alv-row-color-lab 엔진 — 매진 판정으로 색 코드(C610)를 채우고 layout info_fname에 '필드명'을 연결하면 매진 행에 색이 입혀진다.
   booked를 바꿔 상태(여유/임박/매진)를 만들고, ① 색 코드 쓰기 ② info_fname 연결 ③ 표시 순서로 색이 보이게 한다.
   info_fname을 틀린 필드명(ROW_COLOR)으로 두면 색이 안 보인다. 3체크: 색코드 존재 / 필드명 일치 / 화면 갱신.
   골격 계약: [data-act] · .arc-fname · #arcTable · #arcChecks.
   config: window.ARC_CFG = { rows, color, goodFname, badFname }. 높이: _autoheight.js. */
(function () {
  var CFG = window.ARC_CFG || { rows: [], color: 'C610', goodFname: 'ROWCOLOR', badFname: 'ROW_COLOR' };
  var occ = CFG.rows.map(function (r) { return r.booked; });
  var codeWritten = false, fname = CFG.goodFname, displayed = false;

  var fnameEl = document.querySelector('.arc-fname');
  var tableEl = document.getElementById('arcTable');
  var checksEl = document.getElementById('arcChecks');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function status(i) { var r = CFG.rows[i], o = occ[i]; if (o >= r.capacity) return 'full'; if (o / r.capacity >= 0.8) return 'near'; return 'ok'; }
  function rowcolor(i) { return (codeWritten && status(i) === 'full') ? CFG.color : ''; }
  function applied(i) { return displayed && fname === CFG.goodFname && rowcolor(i) === CFG.color; }
  function anyFull() { return CFG.rows.some(function (r, i) { return status(i) === 'full'; }); }

  function renderFname() {
    fnameEl.innerHTML = [{ v: CFG.goodFname, bad: 0 }, { v: CFG.badFname, bad: 1 }].map(function (o) {
      return '<button type="button" data-v="' + esc(o.v) + '"' + (o.bad ? ' data-bad="1"' : '') + ' aria-pressed="' + (o.v === fname ? 'true' : 'false') + '">' + esc(o.v) + '</button>';
    }).join('');
  }
  function renderTable() {
    var STT = { full: '매진', near: '임박', ok: '여유' };
    tableEl.innerHTML = '<table class="arc-tbl"><thead><tr><th>회차</th><th>일자</th><th>점유/정원</th><th>상태</th><th>ROWCOLOR</th></tr></thead><tbody>' +
      CFG.rows.map(function (r, i) {
        var st = status(i), rc = rowcolor(i);
        return '<tr class="' + (applied(i) ? 'colored' : '') + '">' +
          '<td>' + esc(r.concert_id) + '</td><td>' + esc(r.perf_date) + '</td>' +
          '<td><input class="occ" type="number" data-i="' + i + '" value="' + esc(occ[i]) + '" min="0"> / ' + esc(r.capacity) + '</td>' +
          '<td><span class="arc-badge ' + st + '">' + STT[st] + '</span></td>' +
          '<td><span class="arc-rc ' + (rc ? '' : 'empty') + '">' + (rc || '(빈칸)') + '</span></td></tr>';
      }).join('') + '</tbody></table>';
  }
  function renderChecks() {
    var c1 = codeWritten && anyFull();          // 색코드 존재(매진 행에 C610)
    var c2 = fname === CFG.goodFname;            // 필드명 일치
    var c3 = displayed;                          // 화면 갱신
    function chk(on, label) { return '<div class="arc-chk ' + (on ? 'on' : 'off') + '"><span class="ci">' + (on ? '✓' : '✗') + '</span><span class="ck">' + label + '</span></div>'; }
    checksEl.innerHTML = chk(c1, '색 코드 존재') + chk(c2, 'info_fname 필드명 일치') + chk(c3, '화면 갱신(표시)');
  }
  function render() { renderFname(); renderTable(); renderChecks(); }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'code') codeWritten = true;
    else if (act === 'display') displayed = true;
    else if (act === 'reset') { codeWritten = false; fname = CFG.goodFname; displayed = false; occ = CFG.rows.map(function (r) { return r.booked; }); }
    render();
  });
  fnameEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; fname = b.getAttribute('data-v'); render(); });
  tableEl.addEventListener('input', function (e) { var i = e.target.getAttribute && e.target.getAttribute('data-i'); if (i !== null && i !== undefined) { occ[+i] = +e.target.value; renderTable(); renderChecks(); } });

  render();
})();
