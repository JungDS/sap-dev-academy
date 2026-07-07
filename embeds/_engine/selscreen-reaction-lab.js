/* selscreen-reaction-lab 엔진 — 선택화면 4대 고급 이벤트를 직접 일으켜 본다.
   ON BLOCK(날짜 조합 검증) · ON RADIOBUTTON GROUP(그룹 선택) · ON HELP-REQUEST(F1) · ON VALUE-REQUEST(F4 목록→화면필드 운반).
   콘솔에 dynpro event · ABAP event · 반응 · 필드 운반을 보여 주고, F4는 선택값만 운반되고 다른 필드는 자동 운반 안 됨을 안내한다.
   골격 계약: .srl-tabs · #srlPanel · #srlConsole.
   config: window.SRL_CFG = { scarr:[{carrid,carrname}], concertId }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SRL_CFG || { scarr: [], concertId: 'C001' };
  var TABS = [
    { key: 'block', label: 'ON BLOCK' },
    { key: 'radio', label: 'ON RADIO' },
    { key: 'f1', label: 'F1 도움말' },
    { key: 'f4', label: 'F4 입력도움' }
  ];
  var tab = 0;
  var st = { from: '20250101', to: '20251231', radio: 'sum', f4open: false, carr: '' };
  var log = null;

  var tabsEl = document.querySelector('.srl-tabs');
  var panelEl = document.getElementById('srlPanel');
  var consoleEl = document.getElementById('srlConsole');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function renderTabs() {
    tabsEl.innerHTML = TABS.map(function (t, i) {
      return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === tab ? 'true' : 'false') + '">' + esc(t.label) + '</button>';
    }).join('');
  }

  function renderPanel() {
    var k = TABS[tab].key, h = '';
    if (k === 'block') {
      h = '<div class="srl-screen">' +
        '<div class="srl-fld"><label>pa_from</label><input type="text" data-f="from" value="' + esc(st.from) + '" maxlength="8"><span class="srl-hint">YYYYMMDD</span></div>' +
        '<div class="srl-fld"><label>pa_to</label><input type="text" data-f="to" value="' + esc(st.to) + '" maxlength="8"><span class="srl-hint">YYYYMMDD</span></div>' +
        '</div><button class="srl-act" data-run>▶ 블록 실행 (검증)</button>' +
        '<p class="srl-hint" style="margin:9px 0 0">날짜 하나를 비우거나 from &gt; to로 바꿔 실행해 보세요.</p>';
    } else if (k === 'radio') {
      h = '<div class="srl-screen"><div class="srl-radio">' +
        '<label><input type="radio" name="srlr" data-r="sum"' + (st.radio === 'sum' ? ' checked' : '') + '> 요약 (pa_sum)</label>' +
        '<label><input type="radio" name="srlr" data-r="det"' + (st.radio === 'det' ? ' checked' : '') + '> 상세 (pa_det)</label>' +
        '</div></div><button class="srl-act" data-run>▶ Enter (그룹 검증)</button>';
    } else if (k === 'f1') {
      h = '<div class="srl-screen"><div class="srl-fld"><label>pa_conc</label>' +
        '<input type="text" value="' + esc(CFG.concertId) + '" readonly></div></div>' +
        '<button class="srl-act" data-run>F1 누르기 (도움말)</button>';
    } else if (k === 'f4') {
      h = '<div class="srl-screen"><div class="srl-fld"><label>pa_carr</label>' +
        '<input type="text" value="' + esc(st.carr) + '" placeholder="(F4로 선택)" readonly></div></div>' +
        '<button class="srl-act" data-run>F4 누르기 (입력 도움)</button>';
      if (st.f4open) {
        h += '<div class="srl-f4list"><div class="f4hd">SCARR — carrid / carrname (행을 클릭해 선택)</div>' +
          CFG.scarr.map(function (r) {
            return '<div class="srl-f4row" data-carr="' + esc(r.carrid) + '"><span class="cc">' + esc(r.carrid) + '</span><span>' + esc(r.carrname) + '</span></div>';
          }).join('') + '</div>';
      }
    }
    panelEl.innerHTML = h;
  }

  function renderConsole() {
    if (!log) { consoleEl.innerHTML = '<div class="srl-empty">위에서 이벤트를 일으키면 발생한 dynpro/ABAP 이벤트와 반응이 여기 나옵니다.</div>'; return; }
    function row(k, v, cls) { return '<div class="srl-crow"><span class="srl-ck">' + k + '</span><span class="srl-cv ' + (cls || '') + '">' + v + '</span></div>'; }
    var h = row('Dynpro 이벤트', log.dynpro, 'mono') +
      row('ABAP 이벤트', esc(log.abap), 'mono') +
      row('반응', log.result, log.level);
    if (log.transport) h += row('필드 운반', log.transport);
    consoleEl.innerHTML = h;
  }

  function render() { renderTabs(); renderPanel(); renderConsole(); }

  // --- 이벤트 핸들러 ---
  tabsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    tab = +b.getAttribute('data-i'); st.f4open = false; log = null; render();
  });

  panelEl.addEventListener('input', function (e) {
    var f = e.target.getAttribute && e.target.getAttribute('data-f');
    if (f) st[f] = e.target.value;
  });
  panelEl.addEventListener('change', function (e) {
    var r = e.target.getAttribute && e.target.getAttribute('data-r');
    if (r) st.radio = r;
  });
  panelEl.addEventListener('click', function (e) {
    var carrRow = e.target.closest('.srl-f4row');
    if (carrRow) {
      st.carr = carrRow.getAttribute('data-carr'); st.f4open = false;
      log = { dynpro: 'POV (Process On Value-Request)', abap: "AT SELECTION-SCREEN ON VALUE-REQUEST FOR pa_carr",
        result: 'PA_CARR ← ' + esc(st.carr) + ' 선택됨', level: 'ok',
        transport: 'PA_CARR 한 필드만 운반 · 다른 필드(pa_from 등)는 자동 운반 안 됨' };
      render(); return;
    }
    if (!e.target.closest('[data-run]')) return;
    var k = TABS[tab].key;
    if (k === 'block') {
      if (!st.from || !st.to) log = { dynpro: 'PAI', abap: 'AT SELECTION-SCREEN ON BLOCK b_date', result: '✗ MESSAGE E "기간을 모두 입력하세요" → 화면 복귀', level: 'err' };
      else if (st.from > st.to) log = { dynpro: 'PAI', abap: 'AT SELECTION-SCREEN ON BLOCK b_date', result: '✗ MESSAGE E "시작일이 종료일보다 늦습니다" → 화면 복귀', level: 'err' };
      else log = { dynpro: 'PAI', abap: 'AT SELECTION-SCREEN ON BLOCK b_date', result: '✓ 블록 검증 통과 (조합 OK)', level: 'ok' };
    } else if (k === 'radio') {
      log = { dynpro: 'PAI', abap: 'AT SELECTION-SCREEN ON RADIOBUTTON GROUP g1', result: '✓ 그룹 이벤트 발생 · 선택: ' + (st.radio === 'sum' ? '요약(pa_sum)' : '상세(pa_det)'), level: 'ok' };
    } else if (k === 'f1') {
      log = { dynpro: 'POH (Process On Help-Request)', abap: 'AT SELECTION-SCREEN ON HELP-REQUEST FOR pa_conc', result: 'ℹ MESSAGE I "공연 코드는 ZCONCERT에 등록된 CONCERT_ID입니다"', level: 'info' };
    } else if (k === 'f4') {
      st.f4open = !st.f4open;
      if (!st.f4open) { render(); return; }
      log = { dynpro: 'POV (Process On Value-Request)', abap: 'AT SELECTION-SCREEN ON VALUE-REQUEST FOR pa_carr', result: 'SCARR 목록을 팝업으로 표시 — 행을 클릭해 선택하세요', level: 'info' };
    }
    render();
  });

  render();
})();
