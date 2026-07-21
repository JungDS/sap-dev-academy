/* class-object-builder 엔진 — 클래스(설계도)에서 NEW로 객체를 만들어 보고,
   참조 변수가 initial일 때 인스턴스 메서드 호출이 왜 실패하는지 체험한다(CH21-L01 핵심 오해 해소).
   버튼: NEW 생성 / 메서드 호출 / 참조 비우기(CLEAR) / 리셋.
   상태: 참조(initial↔bound) · 만든 객체 수 · 객체 카드(누가 가리키는지).
   골격 계약: #cobObjs(객체 카드) · #cobBtns(버튼) · #cobState(상태) · #cobLog(피드백).
   config: window.COB_CFG = { className, refName, methodName, methodCall }. 높이: _autoheight.js. */
(function () {
  var CFG = window.COB_CFG || {};
  var CLS = CFG.className || 'zcl_booking_manager';
  var REF = CFG.refName || 'lo_mgr';
  var MNAME = CFG.methodName || 'book';
  var MCALL = CFG.methodCall || 'book( )';

  var objsEl = document.getElementById('cobObjs');
  var btnsEl = document.getElementById('cobBtns');
  var stateEl = document.getElementById('cobState');
  var logEl = document.getElementById('cobLog');

  var objects = [];    // 만들어진 객체들
  var boundIdx = -1;   // REF가 가리키는 객체 index (-1 = initial)

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function isBound() { return boundIdx >= 0; }

  function renderObjs() {
    if (!objects.length) {
      objsEl.innerHTML = '<div class="cd-obj"><b>(아직 객체 없음)</b><small>NEW로 만들어 보세요</small></div>';
      return;
    }
    objsEl.innerHTML = objects.map(function (o, i) {
      var tail = (i === boundIdx)
        ? '<small>◀ ' + h(REF) + ' 가 지금 가리키는 객체</small>'
        : '<small>같은 설계도에서 나온 다른 인스턴스</small>';
      return '<div class="cd-obj"><b>객체 #' + (i + 1) + '</b>' + tail + '</div>';
    }).join('');
  }

  function renderState() {
    stateEl.innerHTML =
      '<div><span class="k">참조 ' + h(REF) + '</span><span class="v ' + (isBound() ? 'ok' : 'bad') + '">' +
      (isBound() ? 'bound (객체를 가리킴)' : 'initial (빈 참조)') + '</span></div>' +
      '<div><span class="k">만든 객체 수</span><span class="v">' + objects.length + '</span></div>';
  }

  function log(cls, html) { logEl.className = 'cd-log' + (cls ? ' ' + cls : ''); logEl.innerHTML = html; }

  function doNew() {
    objects.push({});
    boundIdx = objects.length - 1;
    log('ok', '<code>DATA(' + h(REF) + ') = NEW ' + h(CLS) + '( ).</code> 객체가 새로 하나 생기고, 참조 변수 <code>' +
      h(REF) + '</code>가 그 객체를 가리킵니다. 설계도(클래스)는 그대로 하나입니다.');
    render();
  }

  function doCall() {
    if (isBound()) {
      log('ok', '<code>' + h(REF) + '-&gt;' + h(MCALL) + '</code> 실행 — 가리키는 객체가 있으니 인스턴스 메서드가 그 객체의 상태로 동작합니다.');
    } else {
      log('bad', '<code>' + h(REF) + '-&gt;' + h(MCALL) + '</code> 실패 — <b>참조 변수는 있는데 가리킬 객체가 없습니다</b>(initial). 변수를 선언했다고 객체가 저절로 생기지는 않습니다.');
    }
    render();
  }

  function doClear() {
    if (!isBound()) {
      log('bad', '이미 <b>initial</b>입니다. 지금 메서드를 부르면 실패합니다.');
      render();
      return;
    }
    boundIdx = -1;
    log('bad', '<code>CLEAR ' + h(REF) + '.</code> 참조가 <b>initial</b>로 돌아갔습니다. 객체 자체가 사라진 게 아니라, <b>가리키던 손을 놓은 것</b>입니다.');
    render();
  }

  function doReset() {
    objects = []; boundIdx = -1;
    log('', '처음 상태입니다. <code>NEW</code>로 객체를 만들고, 참조를 비운 뒤 호출하면 어떻게 되는지도 확인해 보세요.');
    render();
  }

  function render() { renderObjs(); renderState(); }

  btnsEl.innerHTML =
    '<button type="button" data-a="new">NEW로 객체 생성</button>' +
    '<button type="button" data-a="call">' + h(REF) + '-&gt;' + h(MNAME) + '( ) 호출</button>' +
    '<button type="button" data-a="clear">참조 비우기 (CLEAR)</button>' +
    '<button type="button" data-a="reset">리셋</button>';

  btnsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.getAttribute('data-a');
    if (a === 'new') doNew();
    else if (a === 'call') doCall();
    else if (a === 'clear') doClear();
    else doReset();
  });

  doReset();
})();
