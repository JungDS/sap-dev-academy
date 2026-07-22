/* constructor-timeline 엔진 — 객체를 만들거나 정적 메서드를 호출할 때 constructor와 class_constructor가 언제 몇 번 실행되는지 보여 준다.
   객체를 만들 때마다 constructor가 실행되고(객체별), class_constructor는 클래스 최초 사용 시 딱 한 번만 실행된다.
   골격 계약: .ctl-act(버튼) · #ctlCounters · #ctlTimeline · #ctlObjects.
   config: window.CTL_CFG = { presets:[{concert,perf,cap}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.CTL_CFG || { presets: [{ concert: 'C001', perf: '01', cap: 100 }, { concert: 'C002', perf: '02', cap: 50 }] };
  var ctorCount = 0, classCtorCount = 0, classInit = false;
  var objects = [];   // {name, concert, perf, cap}

  var actEl = document.querySelector('.ctl-act');
  var cntEl = document.getElementById('ctlCounters');
  var tlEl = document.getElementById('ctlTimeline');
  var objEl = document.getElementById('ctlObjects');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function timeline(steps) {
    tlEl.innerHTML = steps.map(function (s) {
      return '<li class="' + (s.cls || '') + '"><span class="ic">' + s.ic + '</span><span>' + s.t + '</span></li>';
    }).join('');
  }

  function createObject(i) {
    var p = CFG.presets[i % CFG.presets.length];
    var name = 'lo_mgr' + (objects.length === 0 ? '' : '_' + (objects.length + 1));
    var steps = [];
    steps.push({ ic: '①', t: '<code>NEW zcl_booking_manager( iv_concert=\'' + p.concert + '\' iv_perf=\'' + p.perf + '\' )</code>' });
    if (!classInit) {
      classInit = true; classCtorCount++;
      steps.push({ ic: '②', cls: 'stat', t: '<b>class_constructor</b> 실행 — 클래스 <b>최초 사용</b>이라 딱 한 번. <code>gv_version=\'1.0\'</code>' });
    } else {
      steps.push({ ic: '②', cls: 'skip', t: 'class_constructor — 이미 1회 실행됨, 다시 실행하지 않음' });
    }
    ctorCount++;
    steps.push({ ic: '③', cls: 'inst', t: '<b>constructor</b> 실행 — 이번 객체를 위해(객체마다 실행)' });
    steps.push({ ic: '④', cls: 'state', t: '<code>SELECT capacity</code> → <code>mv_cap=' + p.cap + '</code>, <code>mv_concert=\'' + p.concert + '\'</code>, <code>mv_perf=\'' + p.perf + '\'</code> 대입' });
    steps.push({ ic: '⑤', t: '참조 변수 <code>' + name + '</code>에 객체 연결 — <b>바로 사용 가능</b>' });
    objects.push({ name: name, concert: p.concert, perf: p.perf, cap: p.cap });
    timeline(steps);
    render();
  }

  function callStatic() {
    var steps = [];
    steps.push({ ic: '①', t: '<code>zcl_booking_manager</code>를 <b>객체 없이</b> 처음 사용(아직 <code>NEW</code>를 안 했다)' });
    if (!classInit) {
      classInit = true; classCtorCount++;
      steps.push({ ic: '②', cls: 'stat', t: '<b>class_constructor</b> 실행 — 클래스 최초 사용이라 한 번' });
    } else {
      steps.push({ ic: '②', cls: 'skip', t: 'class_constructor — 이미 실행됨, 다시 안 함' });
    }
    steps.push({ ic: '③', t: '클래스 공용 초기화만 끝남 — <b>constructor는 실행되지 않음</b>(객체를 안 만들었으니까)' });
    timeline(steps);
    render();
  }

  function reset() {
    ctorCount = 0; classCtorCount = 0; classInit = false; objects = [];
    tlEl.innerHTML = '<li class="skip"><span class="ic">·</span><span>버튼을 눌러 실행 순서를 확인하세요.</span></li>';
    render();
  }

  function render() {
    cntEl.innerHTML =
      '<div class="ctl-cnt inst"><div class="k">constructor 실행</div><div class="v">' + ctorCount + '</div><div class="sub">객체마다 1번</div></div>' +
      '<div class="ctl-cnt stat"><div class="k">class_constructor 실행</div><div class="v">' + classCtorCount + '</div><div class="sub">클래스 전체에 1번</div></div>' +
      '<div class="ctl-cnt"><div class="k">만든 객체</div><div class="v">' + objects.length + '</div><div class="sub">각자 다른 상태</div></div>';
    objEl.innerHTML = objects.map(function (o) {
      return '<div class="ctl-obj"><div class="nm">' + h(o.name) + '</div>' +
        '<div class="row">mv_concert = <b>' + h(o.concert) + '</b></div>' +
        '<div class="row">mv_perf = <b>' + h(o.perf) + '</b></div>' +
        '<div class="row">mv_cap = <b>' + o.cap + '</b></div></div>';
    }).join('');
  }

  actEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.getAttribute('data-a');
    if (a === 'obj1') createObject(0);
    else if (a === 'obj2') createObject(1);
    else if (a === 'static') callStatic();
    else if (a === 'reset') reset();
  });

  reset();
})();
