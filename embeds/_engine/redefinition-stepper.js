/* redefinition-stepper 엔진 — 부모 타입 변수에 부모/자식 객체를 담아 메서드를 실행해,
   정적 타입은 그대로인데 동적 타입에 따라 자식 REDEFINITION이 실행되는 것(동적 디스패치)을 체험한다.
   super-> 토글로 부모 공통 검증을 건너뛰면 무엇을 잃는지도 보여 준다(CH21-L07 흔한 실수).
   골격 계약: #rdsBtns(버튼) · #rdsState(상태) · #rdsLog(피드백).
   config: window.RDS_CFG = { refName, parentClass, childClass, method }. 높이: _autoheight.js. */
(function () {
  var CFG = window.RDS_CFG || {};
  var REF = CFG.refName || 'lo_mgr';
  var PARENT = CFG.parentClass || 'zcl_booking_manager';
  var CHILD = CFG.childClass || 'zcl_vip_booking';
  var M = CFG.method || 'book';

  var btnsEl = document.getElementById('rdsBtns');
  var stateEl = document.getElementById('rdsState');
  var logEl = document.getElementById('rdsLog');

  var held = 'parent';   // parent | child — 변수에 담긴 실제 객체
  var superOn = true;    // 자식 재정의가 super->를 부르는가
  var executed = null;   // null | 'parent' | 'child'

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function isChild() { return held === 'child'; }

  function renderBtns() {
    btnsEl.innerHTML =
      '<button type="button" data-a="hold-parent" aria-pressed="' + (held === 'parent') + '">부모 객체 담기</button>' +
      '<button type="button" data-a="hold-child" aria-pressed="' + (held === 'child') + '">자식(VIP) 객체 담기</button>' +
      '<button type="button" data-a="super" aria-pressed="' + (superOn ? 'true' : 'false') + '">super-&gt; ' + (superOn ? '켜짐' : '꺼짐') + '</button>' +
      '<button type="button" data-a="run">' + h(REF) + '-&gt;' + h(M) + '( ) 실행</button>' +
      '<button type="button" data-a="reset">리셋</button>';
  }

  function renderState() {
    var execTxt = executed ? (executed === 'child' ? '자식 REDEFINITION' : '부모 원본 구현') : '—';
    var superTxt = '—', superCls = '';
    if (executed === 'child') {
      superTxt = superOn ? '실행함' : '건너뜀';
      superCls = superOn ? 'ok' : 'bad';
    } else if (executed === 'parent') {
      superTxt = '해당 없음';
    }
    stateEl.innerHTML =
      '<div><span class="k">정적 타입 (변수 선언)</span><span class="v">' + h(PARENT) + '</span></div>' +
      '<div><span class="k">동적 타입 (담긴 객체)</span><span class="v ' + (isChild() ? 'ok' : '') + '">' + h(isChild() ? CHILD : PARENT) + '</span></div>' +
      '<div><span class="k">실행된 ' + h(M) + ' 구현</span><span class="v">' + execTxt + '</span></div>' +
      '<div><span class="k">부모 공통 검증(super-&gt;)</span><span class="v ' + superCls + '">' + superTxt + '</span></div>';
  }

  function log(cls, html) { logEl.className = 'cd-log' + (cls ? ' ' + cls : ''); logEl.innerHTML = html; }

  function doRun() {
    executed = isChild() ? 'child' : 'parent';
    if (!isChild()) {
      log('ok', '담긴 객체가 부모라 <code>' + h(PARENT) + '</code>의 <code>' + h(M) +
        '</code>이 그대로 실행됩니다. 재정의된 구현이 없으니 고를 것도 없습니다.');
    } else if (superOn) {
      log('ok', '변수의 <b>정적 타입은 ' + h(PARENT) + '</b>인데 담긴 객체의 <b>동적 타입이 ' + h(CHILD) +
        '</b>라, 호출은 <b>자식의 REDEFINITION</b>으로 들어갑니다. 자식은 VIP 사전 처리를 한 뒤 <code>super-&gt;' +
        h(M) + '( )</code>로 부모의 공통 검증을 이어갑니다.');
    } else {
      log('bad', '자식 REDEFINITION은 실행되지만 <code>super-&gt;' + h(M) +
        '( )</code>를 부르지 않았습니다. VIP 처리만 하고 <b>부모의 정원·잔여석 공통 검증이 통째로 빠집니다</b>. 재정의할 때 부모 동작을 <b>대체할지 이어갈지</b>는 의도적으로 정해야 합니다.');
    }
    render();
  }

  function doReset() {
    held = 'parent'; superOn = true; executed = null;
    log('', '부모 타입 변수 <code>' + h(REF) + '</code>에 어떤 객체를 담을지 고르고 실행해 보세요. 같은 호출이 담긴 객체에 따라 어디로 가는지 확인할 수 있습니다.');
    render();
  }

  function render() { renderBtns(); renderState(); }

  btnsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.getAttribute('data-a');
    if (a === 'hold-parent') { held = 'parent'; executed = null; render(); }
    else if (a === 'hold-child') { held = 'child'; executed = null; render(); }
    else if (a === 'super') { superOn = !superOn; executed = null; render(); }
    else if (a === 'run') doRun();
    else doReset();
  });

  doReset();
})();
