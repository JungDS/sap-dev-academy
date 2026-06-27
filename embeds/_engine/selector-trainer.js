/* selector-trainer 엔진 — 호출 한 줄을 "왼쪽(클래스명/참조변수) + 선택자(=>/->) + 멤버(정적/인스턴스)"로 조립해 보고 맞는지 판정한다.
   공식 규칙: => 왼쪽엔 클래스명, -> 왼쪽엔 참조변수. class=>static OK, class=>instance 오류, ref->instance OK, ref->static 허용(단 Clean ABAP은 class=> 권장).
   골격 계약: .st-left · .st-mem · .st-sel(세그) · #stCode · #stVerdict.
   config: window.ST_CFG = { className, refName, staticName, instanceName }. 높이: _autoheight.js. */
(function () {
  var CFG = window.ST_CFG || { className: 'zcl_booking_manager', refName: 'lo_mgr', staticName: 'normalize_concert_id( )', instanceName: 'remaining( )' };
  var left = 'class', mem = 'static', sel = 'arrow2';   // arrow2 = '=>', arrow1 = '->'

  var leftEl = document.querySelector('.st-left');
  var memEl = document.querySelector('.st-mem');
  var selEl = document.querySelector('.st-sel');
  var codeEl = document.getElementById('stCode');
  var verEl = document.getElementById('stVerdict');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function renderSeg(host, items, active) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + h(it.l) + '</button>';
    }).join('');
  }

  function leftTxt() { return left === 'class' ? CFG.className : CFG.refName; }
  function selTxt() { return sel === 'arrow2' ? '=>' : '->'; }
  function memTxt() { return mem === 'static' ? CFG.staticName : CFG.instanceName; }

  function renderCode() {
    codeEl.innerHTML = '<span class="lft">' + h(leftTxt()) + '</span><span class="sel">' + h(selTxt()) + '</span><span class="mem">' + h(memTxt()) + '</span>';
  }

  function renderVerdict() {
    // 1) 선택자-왼쪽 문법: => 는 클래스명만, -> 는 참조변수만
    var selOkForLeft = (sel === 'arrow2' && left === 'class') || (sel === 'arrow1' && left === 'ref');
    if (!selOkForLeft) {
      verEl.className = 'bad';
      if (sel === 'arrow2') verEl.innerHTML = '🚫 <b>참조 변수 뒤엔 <code>=&gt;</code>를 못 씁니다.</b> <code>=&gt;</code>(class component selector)의 왼쪽엔 <b>클래스명</b>이 와야 합니다. 참조 변수면 <code>-&gt;</code>.';
      else verEl.innerHTML = '🚫 <b>클래스명 뒤엔 <code>-&gt;</code>를 못 붙입니다.</b> <code>-&gt;</code>(object component selector)의 왼쪽엔 <b>참조 변수</b>가 와야 합니다. 클래스명이면 <code>=&gt;</code>.';
      return;
    }
    // 2) 의미: class=>instance 는 객체가 없어 불가
    if (left === 'class' && mem === 'instance') {
      verEl.className = 'bad';
      verEl.innerHTML = '🚫 <b>인스턴스 멤버를 클래스명으로 호출할 수 없습니다.</b> <code>' + h(CFG.instanceName) + '</code>은(는) 객체별 상태가 필요하니, 먼저 <code>NEW</code>로 객체를 만들고 <code>' + h(CFG.refName) + '-&gt;</code>로 부릅니다.';
      return;
    }
    // 3) ref->static: 동작하지만 Clean ABAP 권장 아님
    if (left === 'ref' && mem === 'static') {
      verEl.className = 'warn';
      verEl.innerHTML = '⚠️ <b>동작은 합니다</b>(인스턴스가 있으면 참조 변수로 정적 멤버 접근 가능). 다만 정적 멤버는 <b>클래스명 + <code>=&gt;</code></b>(<code>' + h(CFG.className) + '=&gt;' + h(CFG.staticName) + '</code>)로 부르는 편이 의도가 분명합니다.';
      return;
    }
    // 4) 정답: class=>static, ref->instance
    verEl.className = 'ok';
    if (left === 'class') verEl.innerHTML = '✅ <b>클래스명 + <code>=&gt;</code> + 정적 멤버</b> — 객체 없이 클래스로 직접 호출. <code>' + h(CFG.staticName) + '</code>은(는) 객체 상태가 필요 없는 유틸리티라 정적이 자연스럽습니다.';
    else verEl.innerHTML = '✅ <b>참조 변수 + <code>-&gt;</code> + 인스턴스 멤버</b> — 객체로 호출. <code>' + h(CFG.instanceName) + '</code>은(는) 그 객체의 공연·회차 상태로 잔여석을 계산합니다.';
  }

  function render() {
    renderSeg(leftEl, [{ v: 'class', l: CFG.className + ' (클래스)' }, { v: 'ref', l: CFG.refName + ' (참조변수)' }], left);
    renderSeg(memEl, [{ v: 'static', l: '정적 ' + CFG.staticName }, { v: 'instance', l: '인스턴스 ' + CFG.instanceName }], mem);
    renderSeg(selEl, [{ v: 'arrow2', l: '=>' }, { v: 'arrow1', l: '->' }], sel);
    renderCode(); renderVerdict();
  }

  leftEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; left = b.getAttribute('data-v'); render(); });
  memEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; mem = b.getAttribute('data-v'); render(); });
  selEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sel = b.getAttribute('data-v'); render(); });

  render();
})();
