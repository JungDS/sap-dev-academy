/* visibility-gate-sim 엔진 — 클래스 멤버를 PUBLIC/PROTECTED/PRIVATE 중 어디에 두느냐와, 누가(외부/자기/자식) 접근하느냐에 따라
   접근이 허용되는지 컴파일 단계에서 막히는지 보여 준다. 멤버 종류(데이터/메서드)에 맞는 캡슐화 설계 조언도 준다.
   골격 계약: .vgs-mem · .vgs-vis · .vgs-caller(세그) · #vgsCode · #vgsVerdict · #vgsAdvice · #vgsMatrix.
   config: window.VGS_CFG = { members:[{v,label,kind,name}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.VGS_CFG || {
    members: [
      { v: 'cap', label: 'mv_cap (데이터)', kind: 'data', name: 'mv_cap' },
      { v: 'rem', label: 'remaining( ) (행동)', kind: 'method', name: 'remaining( )' }
    ]
  };
  var mem = CFG.members[0].v, vis = 'private', caller = 'ext';

  var memEl = document.querySelector('.vgs-mem');
  var visEl = document.querySelector('.vgs-vis');
  var callEl = document.querySelector('.vgs-caller');
  var codeEl = document.getElementById('vgsCode');
  var verEl = document.getElementById('vgsVerdict');
  var advEl = document.getElementById('vgsAdvice');
  var mxEl = document.getElementById('vgsMatrix');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function curMem() { for (var i = 0; i < CFG.members.length; i++) if (CFG.members[i].v === mem) return CFG.members[i]; }
  // 접근 허용표: vis × caller
  var ALLOW = {
    public: { ext: true, self: true, child: true },
    protected: { ext: false, self: true, child: true },
    private: { ext: false, self: true, child: false }
  };

  function renderSeg(host, items, active) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + h(it.l) + '</button>';
    }).join('');
  }

  var SEC = { public: 'PUBLIC SECTION', protected: 'PROTECTED SECTION', private: 'PRIVATE SECTION' };
  var CALLER_LBL = { ext: '외부 리포트', self: '자기 클래스 메서드', child: '상속 자식 클래스' };

  function accessLine() {
    var m = curMem();
    var expr = m.kind === 'method' ? m.name : m.name + ' = 100';
    if (caller === 'ext') return 'DATA(lo) = NEW zcl_booking_manager( ).\nlo->' + expr + '.';
    if (caller === 'self') return '" zcl_booking_manager 안에서\nme->' + expr + '.';
    return '" 자식 클래스(상속) 메서드 안에서\nme->' + expr + '.';
  }

  function renderCode() {
    var m = curMem();
    var decl = m.kind === 'method'
      ? '    <span class="fn">METHODS</span> ' + m.name.replace('( )', '')
      : '    <span class="fn">DATA</span> ' + m.name + ' <span class="fn">TYPE</span> i';
    codeEl.innerHTML =
      '<span class="fn">CLASS</span> zcl_booking_manager <span class="fn">DEFINITION</span>.\n' +
      '  <span class="sec">' + SEC[vis] + '</span>.\n' +
      decl + '.\n' +
      '<span class="fn">ENDCLASS</span>.\n\n' +
      '" 호출자: ' + CALLER_LBL[caller] + '\n' +
      accessLine().replace(/(lo->|me->)([^\n.]+)/g, '$1<span class="try">$2</span>');
  }

  function renderVerdict() {
    var ok = ALLOW[vis][caller];
    var m = curMem();
    verEl.className = ok ? '' : 'bad';
    if (ok) {
      verEl.innerHTML = '✓ <b>접근 가능</b> — <code>' + SEC[vis] + '</code>의 <code>' + h(m.name) + '</code>은(는) <b>' + CALLER_LBL[caller] + '</b>에서 접근할 수 있습니다.';
    } else {
      var why = vis === 'private' ? 'private은 <b>클래스 자신만</b>' : 'protected는 <b>자신·자식만</b>';
      verEl.innerHTML = '🚫 <b>차단 — syntax check 단계에서 오류</b>. ' + why + ' 접근합니다. <b>' + CALLER_LBL[caller] + '</b>은(는) 안 됩니다. (런타임이 아니라 <b>컴파일 시점</b>에 막힙니다.)';
    }
  }

  function renderAdvice() {
    var m = curMem();
    if (m.kind === 'data' && vis === 'public') {
      advEl.className = 'warn';
      advEl.innerHTML = '⚠️ <b>내부 상태를 공개하지 마세요.</b> <code>mv_cap</code>을 public으로 열면 외부가 정원을 마음대로 바꿔 <code>book( )</code>·<code>remaining( )</code>의 규칙을 우회합니다. <b>데이터는 private, 접근은 메서드로.</b>';
    } else if (m.kind === 'data' && vis === 'private') {
      advEl.className = 'ok';
      advEl.innerHTML = '✅ <b>좋은 캡슐화.</b> 내부 상태 <code>mv_cap</code>을 private으로 보호하면 잘못된 상태 변경을 컴파일 단계에서 막습니다.';
    } else if (m.kind === 'method' && vis === 'private') {
      advEl.className = 'warn';
      advEl.innerHTML = '⚠️ <b>행동이 무의미해집니다.</b> 외부가 부를 일이 있는 <code>remaining( )</code>을 private으로 닫으면 아무도 못 씁니다. <b>호출돼야 할 메서드는 public.</b>';
    } else if (m.kind === 'method' && vis === 'public') {
      advEl.className = 'ok';
      advEl.innerHTML = '✅ <b>적절합니다.</b> 외부가 호출할 행동 <code>remaining( )</code>을 public으로 공개. 캡슐화는 숨기는 기술이 아니라 <b>공개할 것과 숨길 것을 나누는</b> 설계입니다.';
    } else {
      advEl.className = '';
      advEl.innerHTML = 'ℹ️ <b>protected</b>는 "나중에 상속받은 자식이 이 내부 계약에 의존해도 된다"는 뜻입니다. 확장 의도가 분명하지 않으면 <b>private으로 시작</b>하는 편이 안전합니다.';
    }
  }

  function renderMatrix() {
    var visList = ['public', 'protected', 'private'];
    var callList = [['ext', '외부'], ['self', '자기'], ['child', '자식']];
    var head = '<tr><th>visibility \\ 호출자</th>' + callList.map(function (c) { return '<th>' + c[1] + '</th>'; }).join('') + '</tr>';
    var body = visList.map(function (vv) {
      return '<tr><td class="rl">' + SEC[vv] + '</td>' + callList.map(function (c) {
        var ok = ALLOW[vv][c[0]];
        var cur = (vv === vis && c[0] === caller) ? ' cur' : '';
        return '<td class="' + (ok ? 'y' : 'n') + cur + '">' + (ok ? '✓' : '✗') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    mxEl.innerHTML = '<table class="vgs-matrix"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }

  function render() {
    renderSeg(memEl, CFG.members.map(function (m) { return { v: m.v, l: m.label }; }), mem);
    renderSeg(visEl, [{ v: 'public', l: 'PUBLIC' }, { v: 'protected', l: 'PROTECTED' }, { v: 'private', l: 'PRIVATE' }], vis);
    renderSeg(callEl, [{ v: 'ext', l: '외부 리포트' }, { v: 'self', l: '자기 클래스' }, { v: 'child', l: '상속 자식' }], caller);
    renderCode(); renderVerdict(); renderAdvice(); renderMatrix();
  }

  memEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; mem = b.getAttribute('data-v'); render(); });
  visEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; vis = b.getAttribute('data-v'); render(); });
  callEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; caller = b.getAttribute('data-v'); render(); });

  render();
})();
