/* screen-painter-wiring 엔진 — Dynpro 화면 0100의 네 조각(Layout·Element List·Flow Logic·ABAP Source)이 어떻게 연결되는지 보여 주고,
   시나리오로 연결을 깨뜨려 활성화 결과를 관찰한다: MODULE 정의 누락 / 요소-변수 이름 불일치 / OK field 누락.
   골격 계약: .spw-scen · #spwGrid · #spwConsole.
   config: window.SPW_CFG = { screen, scenarios:[{key,label,break}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SPW_CFG || { screen: '0100', scenarios: [] };
  var idx = 0;
  var scenEl = document.querySelector('.spw-scen');
  var gridEl = document.getElementById('spwGrid');
  var consoleEl = document.getElementById('spwConsole');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function brk() { return CFG.scenarios[idx] ? CFG.scenarios[idx].break : null; }

  function row(cls, content) { return '<div class="spw-row ' + (cls || '') + '">' + content + '</div>'; }
  function panel(title, sub, rows) {
    return '<div class="spw-panel"><div class="spw-ptitle">' + title + (sub ? ' <small>' + sub + '</small>' : '') + '</div><div class="spw-pbody">' + rows + '</div></div>';
  }

  function renderScen() {
    scenEl.innerHTML = CFG.scenarios.map(function (s, i) {
      return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === idx ? 'true' : 'false') + '">' + esc(s.label) + '</button>';
    }).join('');
  }

  function renderGrid() {
    var b = brk();
    var seatName = b === 'name' ? 'P_SEAT' : 'P_SEATS';
    // ① Layout
    var layout = panel('① Layout', '화면 0100',
      row('', '<span class="tag">입력칸</span>P_CONC') +
      row(b === 'name' ? 'bad' : '', '<span class="tag">입력칸</span>' + seatName) +
      row('', '<span class="tag">버튼</span><span class="spw-btn-el">예매</span> FctCode SAVE'));
    // ② Element List
    var elist = panel('② Element List', '이름·타입·OK field',
      row('', 'P_CONC <span class="tag">CHAR</span>') +
      row(b === 'name' ? 'bad' : '', seatName + ' <span class="tag">NUMC</span>') +
      row(b === 'okfield' ? 'bad' : '', 'OK field: ' + (b === 'okfield' ? '(미지정)' : 'OK_CODE')));
    // ③ Flow Logic
    var flow = panel('③ Flow Logic', 'PBO/PAI → MODULE 호출',
      row('', 'PROCESS BEFORE OUTPUT.') +
      row(b === 'module' ? 'bad' : '', '&nbsp;&nbsp;MODULE status_0100.') +
      row('', 'PROCESS AFTER INPUT.') +
      row('', '&nbsp;&nbsp;MODULE user_command_0100.'));
    // ④ ABAP Source
    var src = panel('④ ABAP Source', 'MODULE 정의·DATA',
      row('', 'DATA p_conc.') +
      row(b === 'name' ? 'bad' : '', 'DATA p_seats.' + (b === 'name' ? '  <span class="spw-cmt">≠ ' + seatName + '</span>' : '')) +
      (b === 'module'
        ? row('bad', 'MODULE status_0100 OUTPUT. <span class="spw-cmt">(정의 없음)</span>')
        : row('', 'MODULE status_0100 OUTPUT. ... ENDMODULE.')) +
      row('', 'MODULE user_command_0100 INPUT. ... ENDMODULE.'));
    gridEl.innerHTML = layout + elist + flow + src;
  }

  function renderConsole() {
    var b = brk();
    if (!b) {
      consoleEl.className = 'ok';
      consoleEl.innerHTML = '✅ 활성화 성공 — 네 조각의 이름이 모두 맞습니다.<small>Flow Logic의 <code>MODULE status_0100.</code> ↔ ABAP <code>MODULE status_0100 OUTPUT.</code> 연결, 화면 요소 ↔ 변수 이름 일치, OK field 지정 OK.</small>';
      return;
    }
    consoleEl.className = 'err';
    if (b === 'module') consoleEl.innerHTML = '🚫 활성화 오류 — 호출 대상 없음<small>Flow Logic이 <code>MODULE status_0100.</code>을 부르는데 ABAP에 <code>MODULE status_0100 OUTPUT.</code> 정의가 없습니다. 같은 이름으로 정의해야 연결됩니다.</small>';
    else if (b === 'name') consoleEl.innerHTML = '🚫 data transport 안 됨 — 이름 불일치<small>화면 요소 <code>P_SEAT</code>와 변수 <code>p_seats</code> 이름이 달라 값이 자동 운반되지 않습니다. 같은 이름으로 맞추세요.</small>';
    else if (b === 'okfield') consoleEl.innerHTML = '🚫 function code 못 읽음 — OK field 미지정<small>Element List에서 OK field(<code>OK_CODE</code>)를 지정해야 버튼의 function code를 안정적으로 읽습니다.</small>';
  }

  function render() { renderScen(); renderGrid(); renderConsole(); }
  scenEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; idx = +b.getAttribute('data-i'); render(); });
  render();
})();
