/* dynamic-type-inspector 엔진 — 부모 타입 참조(lo_mgr)에 담긴 실제 객체(일반/VIP)에 대해 CAST와 CASE TYPE OF가 어떻게 다른지 보여 준다.
   CAST는 실제 타입이 안 맞으면 CX_SY_MOVE_CAST_ERROR로 실패하고, CASE TYPE OF는 예외 없이 타입에 맞는 분기로 안전하게 들어간다.
   골격 계약: .dti-obj · .dti-op(세그) · #dtiTypes · #dtiCode · #dtiVerdict.
   config: window.DTI_CFG = { baseClass, vipClass, vipMethod }. 높이: _autoheight.js. */
(function () {
  var CFG = window.DTI_CFG || { baseClass: 'zcl_booking_manager', vipClass: 'zcl_vip_booking', vipMethod: 'apply_vip_coupon( )' };
  var obj = 'vip';   // base | vip — 실제(동적) 타입
  var op = 'cast';   // cast | casetype

  var objEl = document.querySelector('.dti-obj');
  var opEl = document.querySelector('.dti-op');
  var typesEl = document.getElementById('dtiTypes');
  var codeEl = document.getElementById('dtiCode');
  var verEl = document.getElementById('dtiVerdict');

  function h(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function dynClass() { return obj === 'vip' ? CFG.vipClass : CFG.baseClass; }
  function isVip() { return obj === 'vip'; }

  function renderSeg(host, items, active) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + h(it.l) + '</button>';
    }).join('');
  }

  function renderTypes() {
    typesEl.innerHTML =
      '<div class="dti-type"><div class="k">정적 타입 (변수)</div><div class="v">' + h(CFG.baseClass) + '</div></div>' +
      '<div class="dti-type dyn"><div class="k">동적 타입 (실제 객체)</div><div class="v">' + h(dynClass()) + '</div></div>';
  }

  function renderCode() {
    if (op === 'cast') {
      codeEl.innerHTML =
        '<span class="fn">TRY</span>.\n' +
        '    DATA(lo_vip) = <span class="fn">CAST</span> ' + h(CFG.vipClass) + '( lo_mgr ).\n' +
        '    lo_vip-&gt;' + h(CFG.vipMethod) + '.\n' +
        '  <span class="fn">CATCH</span> <span class="cx">cx_sy_move_cast_error</span>.\n' +
        '    <span class="fn">MESSAGE</span> \'VIP 객체가 아닙니다\' <span class="fn">TYPE</span> \'I\'.\n' +
        '<span class="fn">ENDTRY</span>.';
    } else {
      var vipHit = isVip() ? ' hit' : '';
      var baseHit = !isVip() ? ' hit' : '';
      codeEl.innerHTML =
        '<span class="fn">CASE TYPE OF</span> lo_mgr.\n' +
        '  <span class="fn">WHEN TYPE</span> <span class="' + (vipHit ? 'hit' : '') + '">' + h(CFG.vipClass) + ' INTO DATA(lo_v)</span>.\n' +
        '    lo_v-&gt;' + h(CFG.vipMethod) + '.\n' +
        '  <span class="fn">WHEN TYPE</span> <span class="' + (baseHit ? 'hit' : '') + '">' + h(CFG.baseClass) + ' INTO DATA(lo_b)</span>.\n' +
        '    lo_b-&gt;book( iv_seats = 1 ).\n' +
        '<span class="fn">ENDCASE</span>.';
    }
  }

  function renderVerdict() {
    if (op === 'cast') {
      if (isVip()) {
        verEl.className = 'ok';
        verEl.innerHTML = '✅ <b>downcast 성공</b> — 실제 객체가 <code>' + h(CFG.vipClass) + '</code>라 <code>CAST</code>가 통하고, VIP 전용 <code>' + h(CFG.vipMethod) + '</code>을 호출할 수 있습니다.';
      } else {
        verEl.className = 'bad';
        verEl.innerHTML = '🚫 <b><code>CX_SY_MOVE_CAST_ERROR</code></b> — 실제 객체는 <code>' + h(CFG.baseClass) + '</code>(VIP 아님)이라 downcast 실패. <code>TRY/CATCH</code>로 잡아 처리했습니다. <b>무조건 CAST하지 말 것.</b>';
      }
      return;
    }
    // CASE TYPE OF — 예외 없이 안전 분기
    verEl.className = 'ok';
    if (isVip()) verEl.innerHTML = '✅ <b><code>WHEN TYPE ' + h(CFG.vipClass) + '</code> 분기</b> — 타입이 맞아 <code>INTO DATA(lo_v)</code>로 안전한 참조를 얻고 <code>' + h(CFG.vipMethod) + '</code> 실행. <b>예외 없이</b> 타입 검사+참조 확보를 한 번에.';
    else verEl.innerHTML = '✅ <b><code>WHEN TYPE ' + h(CFG.baseClass) + '</code> 분기</b> — 일반 객체라 기본 분기로. <code>CASE TYPE OF</code>는 <code>CAST</code>와 달리 <b>예외를 던지지 않고</b> 타입에 맞는 가지로 안전하게 들어갑니다.';
  }

  function render() {
    renderSeg(objEl, [{ v: 'base', l: '일반 ' + CFG.baseClass }, { v: 'vip', l: 'VIP ' + CFG.vipClass }], obj);
    renderSeg(opEl, [{ v: 'cast', l: 'CAST (다운캐스트)' }, { v: 'casetype', l: 'CASE TYPE OF' }], op);
    renderTypes(); renderCode(); renderVerdict();
  }

  objEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; obj = b.getAttribute('data-v'); render(); });
  opEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; op = b.getAttribute('data-v'); render(); });

  render();
})();
