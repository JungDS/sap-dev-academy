/* dual-gate-auth-check 엔진 — 공연 코드를 존재 검증(SELECT SINGLE) → 권한 검증(AUTHORITY-CHECK) 두 관문에 통과시킨다.
   어디서 막히는지·어떤 sy-subrc·어떤 메시지가 나가는지 보여 주고, '없는 코드'와 '권한 없음'을 다른 색·문구로 구분한다.
   골격 계약: .dga-cases · .dga-pipe · #dgaDetail · #dgaMsg.
   config: window.DGA_CFG = { authObject,authField,actvt, cases:[{code,name,exists,auth,authSubrc}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.DGA_CFG || { cases: [] };
  var idx = 0;
  var casesEl = document.querySelector('.dga-cases');
  var pipeEl = document.querySelector('.dga-pipe');
  var detailEl = document.getElementById('dgaDetail');
  var msgEl = document.getElementById('dgaMsg');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function cur() { return CFG.cases[idx]; }
  function evalCase(c) {
    var pass1 = !!c.exists, subrc1 = pass1 ? 0 : 4;
    var pass2 = pass1 && !!c.auth, subrc2 = !pass1 ? null : (c.auth ? 0 : (c.authSubrc || 12));
    return { pass1: pass1, subrc1: subrc1, pass2: pass2, subrc2: subrc2, ok: pass1 && pass2 };
  }

  function renderCases() {
    casesEl.innerHTML = CFG.cases.map(function (c, i) {
      var tag = !c.exists ? '없는 코드' : (c.auth ? '있음·권한O' : '있음·권한X');
      return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === idx ? 'true' : 'false') + '">' +
        '<b>' + esc(c.code) + '</b><small>' + esc(c.name) + ' · ' + tag + '</small></button>';
    }).join('');
  }
  function node(lbl, code, cls, verd) {
    return '<div class="dga-node ' + cls + '"><div class="nlbl">' + lbl + '</div><div class="ncode">' + code + '</div><div class="nverd">' + verd + '</div></div>';
  }
  function renderPipe() {
    var c = cur(), e = evalCase(c);
    var n1 = node('① 존재 검증', 'SELECT SINGLE', e.pass1 ? 'pass' : 'exist',
      e.pass1 ? '✓ 통과' : '✗ 없는 코드');
    var n2cls = !e.pass1 ? 'lock' : (e.pass2 ? 'pass' : 'auth');
    var n2v = !e.pass1 ? '🔒 건너뜀' : (e.pass2 ? '✓ 통과' : '✗ 권한 없음');
    var n2 = node('② 권한 검증', 'AUTHORITY-CHECK', n2cls, n2v);
    var n3 = node('본 처리', 'START-OF-SELECTION', e.ok ? 'pass' : 'lock', e.ok ? '✓ 진입' : '🔒 잠김');
    pipeEl.innerHTML = n1 + '<span class="dga-arrow">▸</span>' + n2 + '<span class="dga-arrow">▸</span>' + n3;
  }
  function renderDetail() {
    var c = cur(), e = evalCase(c);
    var hit = e.pass1 ? '<span class="y">Y (1건)</span>' : '<span class="n">N (0건)</span>';
    var authLine = !e.pass1 ? '— (존재 검증에서 멈춤)' :
      "OBJECT '" + esc(CFG.authObject) + "' ID '" + esc(CFG.authField) + "' FIELD '" + esc(c.code) + "' ID 'ACTVT' FIELD '" + esc(CFG.actvt) + "'";
    var subrc2 = e.subrc2 === null ? '—' : e.subrc2;
    detailEl.innerHTML =
      '<div class="drow"><div class="dk">① DB hit</div><div class="dv">' + hit + ' · sy-subrc = ' + e.subrc1 + '</div></div>' +
      '<div class="drow"><div class="dk">② AUTHORITY-CHECK</div><div class="dv">' + authLine + '</div></div>' +
      '<div class="drow"><div class="dk">② sy-subrc</div><div class="dv">' + subrc2 +
        (subrc2 === 12 ? ' (권한 객체 자체 없음)' : (subrc2 === 0 && e.pass1 ? ' (통과)' : '')) + '</div></div>';
  }
  function renderMsg() {
    var c = cur(), e = evalCase(c);
    if (!e.pass1) {
      msgEl.className = 'exist';
      msgEl.innerHTML = '🟠 없는 공연 코드입니다: <code>' + esc(c.code) + '</code><small>존재(data) 문제 — DB에 그 공연이 없음. MESSAGE e003(zmsg)로 안내.</small>';
      return;
    }
    if (!e.pass2) {
      msgEl.className = 'auth';
      msgEl.innerHTML = '🔴 이 공연을 볼 권한이 없습니다: <code>' + esc(c.code) + '</code><small>보안 문제 — 공연은 있지만 접근 권한 없음. MESSAGE e004(zmsg)로 안내. (없는 코드와 다른 문제!)</small>';
      return;
    }
    msgEl.className = 'ok';
    msgEl.innerHTML = '✅ 통과 — <code>START-OF-SELECTION</code>으로 진입<small>존재 O · 권한 O. 두 관문을 모두 지나야 조회가 시작된다.</small>';
  }
  function render() { renderCases(); renderPipe(); renderDetail(); renderMsg(); }

  casesEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    idx = +b.getAttribute('data-i'); render();
  });

  render();
})();
