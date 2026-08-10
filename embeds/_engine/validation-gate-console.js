/* validation-gate-console 엔진 — AT SELECTION-SCREEN 검증을 시나리오별로 실행해 MESSAGE(타입·클래스·&1&2),
   sy-msg* 시스템 필드, START-OF-SELECTION 잠금 여부를 보여 준다. E 메시지면 START가 잠긴다.
   시나리오의 on(검증을 건 필드)에 따라 오류 시 화면 잠금이 달라지는 것도 보여 준다:
   전체 AT SELECTION-SCREEN = 모든 필드 재입력 대기 · ON <필드> = 그 필드만 열리고 나머지는 읽기 전용.
   골격 계약: .vgc-scen · .vgc-field[data-f] · #vgcFrom·#vgcTo·#vgcConc · #vgcLock · [data-run] · #vgcMsg · #vgcSys · .vgc-start.
   config: window.VGC_CFG = { msgClass, fields:[name], scenarios:[{label, from,to,conc, on:<필드|null>, msg:{no,text,v1,v2}|null}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.VGC_CFG || { scenarios: [] };
  var MSGCLASS = CFG.msgClass || 'zmsg';
  var idx = 0, ran = false;
  var scenEl = document.querySelector('.vgc-scen');
  var fromEl = document.getElementById('vgcFrom');
  var toEl = document.getElementById('vgcTo');
  var concEl = document.getElementById('vgcConc');
  var lockEl = document.getElementById('vgcLock');
  var msgEl = document.getElementById('vgcMsg');
  var sysEl = document.getElementById('vgcSys');
  var startEl = document.querySelector('.vgc-start');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function cur() { return CFG.scenarios[idx]; }
  function fillText(t, v1, v2) { return String(t).replace('&1', v1 == null ? '' : v1).replace('&2', v2 == null ? '' : v2); }

  function renderScen() {
    scenEl.querySelector('.vgc-chips') || null;
    var chips = CFG.scenarios.map(function (s, i) {
      return '<button class="vgc-chip" type="button" data-i="' + i + '" aria-pressed="' + (i === idx ? 'true' : 'false') + '">' + esc(s.label) + '</button>';
    }).join('');
    scenEl.innerHTML = '<span class="lbl">시나리오:</span>' + chips;
  }
  function renderScreen() {
    var s = cur();
    function set(el, v) { el.textContent = v === '' ? '(비어 있음)' : v; el.classList.toggle('empty', v === ''); }
    set(fromEl, s.from); set(toEl, s.to); set(concEl, s.conc);
    renderLock();
  }
  // 오류 시 화면이 어떻게 잠기는가 — 전체 검증이면 전부 열리고, ON <필드>면 그 필드만 열린다
  function renderLock() {
    var s = cur();
    var fail = ran && !!s.msg;
    var rows = document.querySelectorAll('.vgc-field');
    Array.prototype.forEach.call(rows, function (el) {
      var f = el.getAttribute('data-f');
      var open = !fail || !s.on || s.on === f;
      el.classList.toggle('locked', fail && !open);
      el.classList.toggle('open', fail && open);
      var mark = el.querySelector('.lockmark');
      if (mark) mark.textContent = !fail ? '' : (open ? '✏ 입력 대기' : '🔒 읽기 전용');
    });
    if (!ran) { lockEl.className = 'vgc-lock'; lockEl.innerHTML = '검증을 실행하면 <b>어느 필드가 다시 열리는지</b>가 여기 표시됩니다.'; return; }
    if (!s.msg) { lockEl.className = 'vgc-lock ok'; lockEl.innerHTML = '통과 — 화면을 떠나 <code>START-OF-SELECTION</code>으로 갑니다.'; return; }
    lockEl.className = 'vgc-lock err';
    lockEl.innerHTML = s.on
      ? '🔎 <code>AT SELECTION-SCREEN ON ' + esc(s.on) + '</code> — <b>' + esc(s.on) + '만 다시 입력 대기</b>가 되고 나머지 필드는 <b>읽기 전용으로 잠깁니다.</b> 고칠 칸으로 시선이 모입니다.'
      : '🔎 필드 지정 없는 <code>AT SELECTION-SCREEN</code> — 오류 시 <b>모든 필드가 다시 입력 대기</b>가 됩니다(멀쩡한 칸까지 열림).';
  }
  function renderResult() {
    var s = cur();
    if (!ran) {
      msgEl.className = 'vgc-msg'; msgEl.innerHTML = '▶ <b>검증 실행</b>을 눌러 AT SELECTION-SCREEN 결과를 보세요.';
      sysEl.innerHTML = ''; sysEl.style.display = 'none';
      startEl.className = 'vgc-start'; startEl.textContent = 'START-OF-SELECTION (대기)';
      return;
    }
    sysEl.style.display = '';
    if (!s.msg) {
      msgEl.className = 'vgc-msg ok'; msgEl.innerHTML = '<span class="tag">OK</span>검증 통과 — 막는 메시지가 없습니다.';
      sysEl.innerHTML = '<tr><th>sy-subrc</th><td>0</td></tr>';
      startEl.className = 'vgc-start open'; startEl.textContent = '✅ START-OF-SELECTION 진행 (조회 시작)';
      return;
    }
    var text = fillText(s.msg.text, s.msg.v1, s.msg.v2);
    msgEl.className = 'vgc-msg err';
    msgEl.innerHTML = '<span class="tag">E · ' + esc(MSGCLASS) + ' ' + esc(s.msg.no) + '</span>' + esc(text);
    sysEl.innerHTML =
      '<tr><th>sy-msgid</th><td>' + esc(MSGCLASS.toUpperCase()) + '</td><th>sy-msgty</th><td>E</td></tr>' +
      '<tr><th>sy-msgno</th><td>' + esc(s.msg.no) + '</td><th>sy-msgv1</th><td>' + esc(s.msg.v1 || '') + '</td></tr>' +
      (s.msg.v2 ? '<tr><th>sy-msgv2</th><td>' + esc(s.msg.v2) + '</td><th></th><td></td></tr>' : '');
    startEl.className = 'vgc-start locked'; startEl.textContent = '🔒 START-OF-SELECTION 잠김 — 화면으로 복귀(E)';
  }
  function render() { renderScen(); renderScreen(); renderResult(); }

  scenEl.addEventListener('click', function (e) { var b = e.target.closest('.vgc-chip'); if (!b) return; idx = +b.getAttribute('data-i'); ran = false; render(); });
  document.querySelector('[data-run]').addEventListener('click', function () { ran = true; renderResult(); renderLock(); });

  render();
})();
