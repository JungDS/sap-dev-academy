/* event-wiring-panel 엔진 — 발생 객체(lo_mgr)의 이벤트 sold_out에 handler를 SET HANDLER로 연결하고, RAISE EVENT 시 등록된 handler만 동기 호출되는 걸 보여 준다.
   등록 없이 이벤트가 나면 아무 반응이 없고, handler가 둘 이상이면 호출 순서는 보장되지 않는다.
   골격 계약: #ewpWiring · .ewp-act(버튼) · #ewpLog · #ewpNote.
   config: window.EWP_CFG = { publisher, event, concert, perf, handlers:[{v,name,action}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.EWP_CFG || {
    publisher: 'lo_mgr', event: 'sold_out', concert: 'C001', perf: '01',
    handlers: [
      { v: 'monitor', name: 'lo_monitor', action: '매진 메시지 표시' },
      { v: 'logger', name: 'lo_logger', action: '로그 기록' }
    ]
  };
  var reg = {};   // handler v -> registered?
  var log = [];

  var wireEl = document.getElementById('ewpWiring');
  var actEl = document.querySelector('.ewp-act');
  var logEl = document.getElementById('ewpLog');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function regCount() { var n = 0; for (var i = 0; i < CFG.handlers.length; i++) if (reg[CFG.handlers[i].v]) n++; return n; }

  function renderWiring() {
    var boxes = CFG.handlers.map(function (hd) {
      var on = !!reg[hd.v];
      return '<div class="ewp-hbox' + (on ? ' on' : '') + '">' +
        '<div class="nm">' + h(hd.name) + '</div>' +
        '<div class="st">' + (on ? '✓ SET HANDLER 등록됨' : '미등록') + '</div>' +
        '<button type="button" data-h="' + hd.v + '">' + (on ? '해제' : 'SET HANDLER') + '</button>' +
        '</div>';
    }).join('');
    wireEl.innerHTML =
      '<div class="ewp-pub"><div class="nm">' + h(CFG.publisher) + '</div><div class="ev">EVENTS ' + h(CFG.event) + '</div></div>' +
      '<div class="ewp-conn">⇢</div>' +
      '<div class="ewp-handlers">' + boxes + '</div>';
  }

  function renderLog() {
    logEl.innerHTML = log.map(function (e) {
      return '<li class="' + e.cls + '">' + e.t + '</li>';
    }).join('');
  }

  function raise() {
    log.push({ cls: 'raise', t: 'RAISE EVENT ' + CFG.event + ' ( ' + CFG.concert + ' / ' + CFG.perf + ' )' });
    var fired = CFG.handlers.filter(function (hd) { return reg[hd.v]; });
    if (fired.length === 0) {
      log.push({ cls: 'none', t: '→ 등록된 handler 없음 — 이벤트는 발생했지만 반응 없음' });
    } else {
      fired.forEach(function (hd) {
        log.push({ cls: 'call', t: '→ ' + hd.name + '->on_' + CFG.event + '( ) 실행: ' + hd.action });
      });
      if (fired.length > 1) {
        log.push({ cls: 'warn', t: '⚠ handler가 ' + fired.length + '개 — 호출 순서는 보장되지 않음' });
      }
    }
    renderLog();
  }

  function reset() { reg = {}; log = []; renderWiring(); renderLog(); }

  wireEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var v = b.getAttribute('data-h'); if (!v) return;
    reg[v] = !reg[v]; renderWiring();
  });
  actEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.getAttribute('data-a');
    if (a === 'raise') raise(); else if (a === 'reset') reset();
  });

  reset();
})();
