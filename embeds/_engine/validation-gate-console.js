/* validation-gate-console 엔진 — AT SELECTION-SCREEN 검증을 시나리오별로 실행해 MESSAGE(타입·클래스·&1&2),
   sy-msg* 시스템 필드, START-OF-SELECTION 잠금 여부를 보여 준다. E 메시지면 START가 잠긴다.
   골격 계약: .vgc-scen · #vgcFrom·#vgcTo·#vgcConc · [data-run] · #vgcMsg · #vgcSys · .vgc-start.
   config: window.VGC_CFG = { scenarios:[{label, from,to,conc, msg:{no,text,v1,v2}|null}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.VGC_CFG || { scenarios: [] };
  var idx = 0, ran = false;
  var scenEl = document.querySelector('.vgc-scen');
  var fromEl = document.getElementById('vgcFrom');
  var toEl = document.getElementById('vgcTo');
  var concEl = document.getElementById('vgcConc');
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
    msgEl.innerHTML = '<span class="tag">E · ZMC_CONCERT ' + esc(s.msg.no) + '</span>' + esc(text);
    sysEl.innerHTML =
      '<tr><th>sy-msgid</th><td>ZMC_CONCERT</td><th>sy-msgty</th><td>E</td></tr>' +
      '<tr><th>sy-msgno</th><td>' + esc(s.msg.no) + '</td><th>sy-msgv1</th><td>' + esc(s.msg.v1 || '') + '</td></tr>' +
      (s.msg.v2 ? '<tr><th>sy-msgv2</th><td>' + esc(s.msg.v2) + '</td><th></th><td></td></tr>' : '');
    startEl.className = 'vgc-start locked'; startEl.textContent = '🔒 START-OF-SELECTION 잠김 — 화면으로 복귀(E)';
  }
  function render() { renderScen(); renderScreen(); renderResult(); }

  scenEl.addEventListener('click', function (e) { var b = e.target.closest('.vgc-chip'); if (!b) return; idx = +b.getAttribute('data-i'); ran = false; render(); });
  document.querySelector('[data-run]').addEventListener('click', function () { ran = true; renderResult(); });

  render();
})();
