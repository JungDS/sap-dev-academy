/* toolbar-fcode-map 엔진 — GUI status(ST100) 툴바 버튼을 눌러 function code가 OK_CODE로 전달되고 PAI CASE에서 처리되는지 본다.
   잠금이면 SET PF-STATUS ... EXCLUDING으로 SAVE 비활성. CASE에 없는 버튼(HELP)을 누르면 "처리 branch 없음" 경고.
   골격 계약: .tfm-lock · #tfmTitle · .tfm-toolbar · #tfmStatus.
   config: window.TFM_CFG = { status, titleTemplate, titleArg, buttons:[{fct,label,handled,action,excludable}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.TFM_CFG || { buttons: [] };
  var locked = false;
  var clicked = null;   // {fct,handled,action}

  var lockEl = document.querySelector('.tfm-lock');
  var titleEl = document.getElementById('tfmTitle');
  var toolbarEl = document.querySelector('.tfm-toolbar');
  var statusEl = document.getElementById('tfmStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function excluded(b) { return locked && b.excludable; }
  function titleText() { return CFG.titleTemplate.replace('&1', CFG.titleArg); }

  function renderLock() {
    lockEl.innerHTML = [{ v: 0, l: "p_locked ' '" }, { v: 1, l: "p_locked 'X'" }].map(function (o) {
      return '<button type="button" data-v="' + o.v + '" aria-pressed="' + ((o.v === 1) === locked ? 'true' : 'false') + '">' + esc(o.l) + '</button>';
    }).join('');
  }
  function renderTitle() {
    titleEl.innerHTML = '<span>' + esc(titleText()) + '</span><small>TITLEBAR ' + esc(CFG.titleArg ? "'TB100' WITH p_conc" : "'TB100'") + '</small>';
  }
  function renderToolbar() {
    toolbarEl.innerHTML = CFG.buttons.map(function (b) {
      var cls = 'tfm-tbtn' + (excluded(b) ? ' excluded' : '') + (!b.handled ? ' unhandled' : '');
      return '<button type="button" class="' + cls + '" data-fct="' + esc(b.fct) + '"' + (excluded(b) ? ' disabled' : '') + '>' +
        esc(b.label) + '<span class="fc">' + esc(b.fct) + '</span></button>';
    }).join('');
  }
  function renderStatus() {
    function row(k, v, cls) { return '<div class="tfm-srow"><span class="tfm-sk">' + k + '</span><span class="tfm-sv ' + (cls || '') + '">' + v + '</span></div>'; }
    var okc, caseRes, caseCls;
    if (!clicked) { okc = "''"; caseRes = '버튼을 눌러 보세요'; caseCls = 'muted'; }
    else {
      okc = "'" + esc(clicked.fct) + "'";
      if (clicked.handled) { caseRes = "WHEN '" + esc(clicked.fct) + "' → " + esc(clicked.action); caseCls = 'ok'; }
      else { caseRes = '⚠ 버튼은 눌렸지만 CASE에 ' + esc(clicked.fct) + " branch 없음 — 처리 누락"; caseCls = 'warn'; }
    }
    statusEl.innerHTML =
      row('sy-pfkey', "'" + esc(CFG.status) + "'") +
      row('sy-title', "'" + esc(titleText()) + "'") +
      row('OK_CODE', okc) +
      row('PAI CASE', caseRes, caseCls);
  }
  function render() { renderLock(); renderTitle(); renderToolbar(); renderStatus(); }

  lockEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; locked = b.getAttribute('data-v') === '1'; if (clicked && excluded(byFct(clicked.fct))) clicked = null; render(); });
  function byFct(f) { return CFG.buttons.filter(function (x) { return x.fct === f; })[0] || {}; }
  toolbarEl.addEventListener('click', function (e) {
    var el = e.target.closest('.tfm-tbtn'); if (!el || el.disabled) return;
    var b = byFct(el.getAttribute('data-fct'));
    clicked = { fct: b.fct, handled: b.handled, action: b.action };
    render();
  });

  render();
})();
