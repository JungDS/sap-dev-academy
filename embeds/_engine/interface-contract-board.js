/* interface-contract-board 엔진 — 하나의 interface(zif_printable)를 여러 클래스가 각자 구현하고,
   interface 참조 변수(TYPE REF TO zif_printable)로 같은 print( ) 호출이 클래스마다 다르게 실행되는 다형성을 보여 준다.
   구현을 빼면 활성화가 실패하고, interface 참조로는 구체 클래스 전용 메서드가 보이지 않는다.
   골격 계약: #icbBoard · .icb-cls(세그) · .icb-impl(세그) · #icbCode · #icbOut.
   config: window.ICB_CFG = { intf, method, classes:[{v,name,out,extra}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.ICB_CFG || {
    intf: 'zif_printable', method: 'print',
    classes: [
      { v: 'booking', name: 'zcl_booking', out: '예매 내역 출력', extra: 'vip_only( )' },
      { v: 'concert', name: 'zcl_concert_info', out: '공연 정보 출력' },
      { v: 'errlog', name: 'zcl_error_log', out: '오류 로그 출력' }
    ]
  };
  var sel = CFG.classes[0].v;
  var implemented = true;   // 선택 클래스가 print를 구현했는가

  var boardEl = document.getElementById('icbBoard');
  var clsEl = document.querySelector('.icb-cls');
  var implEl = document.querySelector('.icb-impl');
  var codeEl = document.getElementById('icbCode');
  var outEl = document.getElementById('icbOut');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function cur() { for (var i = 0; i < CFG.classes.length; i++) if (CFG.classes[i].v === sel) return CFG.classes[i]; }

  function renderSeg(host, items, active) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + h(it.l) + '</button>';
    }).join('');
  }

  function renderBoard() {
    var cards = CFG.classes.map(function (c) {
      var isSel = c.v === sel, miss = isSel && !implemented;
      var cls = 'icb-card' + (isSel ? ' sel' : '') + (miss ? ' miss' : '');
      var impl = miss
        ? '🚫 ' + CFG.intf + '~' + CFG.method + ' 미구현'
        : '✓ ' + CFG.intf + '~' + CFG.method;
      return '<div class="' + cls + '"><div class="nm">' + h(c.name) + '</div><div class="impl">' + h(impl) + '</div></div>';
    }).join('');
    boardEl.innerHTML =
      '<div class="icb-intf"><div class="t">INTERFACE ' + h(CFG.intf) + '</div><div class="m">METHODS ' + h(CFG.method) + '.</div></div>' +
      '<div class="icb-conn">▲ 같은 규약을 구현 ▲</div>' +
      '<div class="icb-cards">' + cards + '</div>';
  }

  function renderCode() {
    var c = cur();
    codeEl.innerHTML =
      '<span class="fn">DATA</span> lo_printable <span class="fn">TYPE REF TO</span> <span class="intf">' + h(CFG.intf) + '</span>.\n' +
      'lo_printable = <span class="fn">NEW</span> ' + h(c.name) + '( ).\n' +
      'lo_printable-&gt;<span class="intf">' + h(CFG.method) + '</span>( ).';
  }

  function renderOut() {
    var c = cur();
    if (!implemented) {
      outEl.className = 'bad';
      outEl.innerHTML = '🚫 <b>활성화 실패</b> — <code>' + h(c.name) + '</code>이 <code>INTERFACES ' + h(CFG.intf) + '</code>를 선언했으면 <code>' + h(CFG.intf) + '~' + h(CFG.method) + '</code>을 <b>반드시 구현</b>해야 합니다. 규약을 받았으면 약속을 지켜야 해요.';
      return;
    }
    outEl.className = 'ok';
    outEl.innerHTML = '✅ 출력: <b>' + h(c.out) + '</b> — 같은 <code>lo_printable-&gt;' + h(CFG.method) + '( )</code> 호출인데, 담긴 객체(<code>' + h(c.name) + '</code>)에 따라 <b>다르게</b> 실행됩니다. 이게 <b>다형성</b>입니다.';
  }

  function render() {
    renderSeg(clsEl, CFG.classes.map(function (c) { return { v: c.v, l: c.name }; }), sel);
    renderSeg(implEl, [{ v: 'yes', l: '구현됨' }, { v: 'no', l: 'print 구현 누락' }], implemented ? 'yes' : 'no');
    renderBoard(); renderCode(); renderOut();
  }

  clsEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sel = b.getAttribute('data-v'); render(); });
  implEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; implemented = b.getAttribute('data-v') === 'yes'; render(); });

  render();
})();
