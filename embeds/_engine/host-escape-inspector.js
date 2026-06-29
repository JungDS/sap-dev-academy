/* host-escape-inspector 엔진 — WHERE 오른쪽 operand를 고르고 @ escape를 켜고 끄며 정오를 판정한다.
   ABAP 값(변수·식)엔 @가 필요하고, DB 컬럼·SQL 리터럴엔 @를 붙이지 않는다는 경계를 직접 체험한다.
   골격 계약: .hei-op(세그) · .hei-esc(세그) · #heiCode · #heiVerdict.
   config: window.HEI_CFG = { operands:[{v,kind,left,op,bare,label}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.HEI_CFG || {
    operands: [
      { v: 'var', kind: 'var', left: 'carrid', op: '=', bare: 'lv_carr', label: 'ABAP 변수' },
      { v: 'expr', kind: 'expr', left: 'seatsmax', op: '>', bare: 'lv_base + 100', label: 'ABAP 식' },
      { v: 'col', kind: 'col', left: 'seatsmax', op: '>', bare: 'seatsocc', label: 'DB 컬럼' },
      { v: 'lit', kind: 'lit', left: 'carrid', op: '=', bare: "'LH'", label: 'SQL 리터럴' }
    ]
  };
  var sel = CFG.operands[0].v;
  var esc = true;   // @ escape on/off

  var opEl = document.querySelector('.hei-op');
  var escEl = document.querySelector('.hei-esc');
  var codeEl = document.getElementById('heiCode');
  var verEl = document.getElementById('heiVerdict');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function cur() { for (var i = 0; i < CFG.operands.length; i++) if (CFG.operands[i].v === sel) return CFG.operands[i]; return CFG.operands[0]; }
  function correctOn(kind) { return kind === 'var' || kind === 'expr'; }  // ABAP 값만 @ 필요

  function renderSeg(host, items, active) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + h(it.l) + '</button>';
    }).join('');
  }

  function rightHtml(o) {
    var wrap = o.kind === 'expr';
    var body = wrap ? '( ' + o.bare + ' )' : o.bare;
    var ok = esc === correctOn(o.kind);
    if (esc) {
      // @ 붙임
      var inner = '@' + body;
      return ok ? '<span class="esc">' + h(inner) + '</span>' : '<span class="bad">' + h(inner) + '</span>';
    }
    // @ 없음
    if (o.kind === 'col') return '<span class="col">' + h(body) + '</span>' + (ok ? '' : '');
    return ok ? h(body) : '<span class="bad">' + h(body) + '</span>';
  }

  function renderCode() {
    var o = cur();
    codeEl.innerHTML =
      'SELECT carrid, connid, seatsmax\n' +
      '  FROM sflight\n' +
      '  WHERE <span class="col">' + h(o.left) + '</span> ' + h(o.op) + ' ' + rightHtml(o) + '\n' +
      '  INTO TABLE @DATA(lt_flight).';
  }

  function renderVerdict() {
    var o = cur(), ok = esc === correctOn(o.kind);
    var isAbap = o.kind === 'var' || o.kind === 'expr';
    var tag = isAbap ? '<span class="hei-tag abap">ABAP 값</span>' : '<span class="hei-tag dbc">DB 쪽</span>';
    var msg;
    if (ok) {
      if (o.kind === 'var') msg = '✅ <b>ABAP 변수엔 <code>@</code></b> — <code>@' + o.bare + '</code>로 "이건 ABAP 값"이 분명합니다.';
      else if (o.kind === 'expr') msg = '✅ <b>ABAP 식은 <code>@( … )</code></b> — <code>@( ' + h(o.bare) + ' )</code>. 식 결과는 SQL operand 타입으로 <b>lossless 변환</b>되어야 합니다.';
      else if (o.kind === 'col') msg = '✅ <b>DB 컬럼엔 <code>@</code> 없이</b> — 양쪽이 모두 컬럼이면(<code>' + o.left + ' > ' + o.bare + '</code>) 둘 다 escape하지 않습니다.';
      else msg = '✅ <b>SQL 리터럴은 <code>@</code> 없이</b> — <code>' + h(o.bare) + '</code>는 SQL 문장 안의 값입니다.';
      verEl.className = 'ok';
    } else {
      if (o.kind === 'var') msg = '🚫 <b>escape 누락</b> — ABAP 변수 <code>' + o.bare + '</code>에 <code>@</code>가 없습니다. strict mode에서 오류입니다.';
      else if (o.kind === 'expr') msg = '🚫 <b><code>@( … )</code> 누락</b> — ABAP 식은 반드시 <code>@( ' + h(o.bare) + ' )</code>로 감싸야 SQL에 넘어갑니다.';
      else if (o.kind === 'col') msg = '🚫 <b>불필요한 <code>@</code></b> — <code>' + o.bare + '</code>는 DB 컬럼입니다. <code>@</code>는 ABAP 값에만 붙입니다.';
      else msg = '🚫 <b>리터럴엔 <code>@</code> 불가</b> — <code>' + h(o.bare) + '</code>는 SQL 리터럴이라 escape하지 않습니다.';
      verEl.className = 'bad';
    }
    verEl.innerHTML = tag + ' ' + msg;
  }

  function render() {
    renderSeg(opEl, CFG.operands.map(function (o) { return { v: o.v, l: o.label }; }), sel);
    renderSeg(escEl, [{ v: 'on', l: '@ 붙임' }, { v: 'off', l: '@ 없음' }], esc ? 'on' : 'off');
    renderCode(); renderVerdict();
  }

  opEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sel = b.getAttribute('data-v'); render(); });
  escEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; esc = b.getAttribute('data-v') === 'on'; render(); });

  render();
})();
