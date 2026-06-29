/* screen-extension-designer 엔진 — Dynpro 화면 확장요소 4종을 탭으로 설계한다.
   Custom Control(container_name 이름 일치/오타→경고) · Subscreen(자체 OK field 없음→main으로) · Tabstrip(activetab·subscreen) · Status Icon(상태→아이콘).
   골격 계약: .sed-tabs · #sedPanel.
   config: window.SED_CFG = { container, subArea, subDynp, tabs:[{fc,label,sub}], statuses:[{key,icon,text}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SED_CFG || {};
  var TABS = [
    { key: 'cc', label: 'Custom Control' },
    { key: 'sub', label: 'Subscreen' },
    { key: 'tab', label: 'Tabstrip' },
    { key: 'icon', label: 'Status Icon' }
  ];
  var tab = 0;
  var st = { ccName: CFG.container, tabSel: (CFG.tabs && CFG.tabs[0] ? CFG.tabs[0].fc : ''), statSel: (CFG.statuses && CFG.statuses[0] ? CFG.statuses[0].key : '') };

  var tabsEl = document.querySelector('.sed-tabs');
  var panelEl = document.getElementById('sedPanel');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function renderTabs() {
    tabsEl.innerHTML = TABS.map(function (t, i) {
      return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === tab ? 'true' : 'false') + '">' + esc(t.label) + '</button>';
    }).join('');
  }
  function seg(host, items, active, bad) {
    return '<div class="sed-seg ' + (bad ? 'warnsel' : '') + '" data-host="' + host + '">' + items.map(function (it) {
      return '<button type="button" data-v="' + esc(it.v) + '"' + (bad && it.v === bad ? ' data-bad="1"' : '') + ' aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + esc(it.l) + '</button>';
    }).join('') + '</div>';
  }

  function panelCC() {
    var match = st.ccName === CFG.container;
    var h = '<p class="sed-h">화면 영역 이름 ↔ container_name</p>' +
      seg('cc', [{ v: CFG.container, l: '일치 (' + CFG.container + ')' }, { v: CFG.container.slice(0, -1), l: '오타 (' + CFG.container.slice(0, -1) + ')' }], st.ccName, CFG.container.slice(0, -1)) +
      '<div class="sed-map"><div class="sed-box area"><div class="bk">Screen Painter 영역</div><div class="bv">' + esc(CFG.container) + '</div></div>' +
      '<span class="sed-link ' + (match ? '' : 'bad') + '">' + (match ? '🔗' : '✕') + '</span>' +
      '<div class="sed-box ' + (match ? '' : 'bad') + '"><div class="bk">ABAP container_name</div><div class="bv">' + esc(st.ccName) + '</div></div></div>' +
      (match
        ? '<div class="sed-status ok">✅ container 객체가 화면 영역 <code>' + esc(CFG.container) + '</code>에 연결됨. (CH17 ALV를 이 자리에 얹는다)</div>'
        : '<div class="sed-status bad">🚫 컨테이너가 붙을 화면 영역 <code>' + esc(st.ccName) + '</code>을 찾지 못함 — 이름이 화면 영역과 같아야 합니다.</div>') +
      '<div class="note" style="margin-top:11px"><code>IF go_cont IS INITIAL</code>로 <b>한 번만</b> 생성합니다 — PBO마다 새로 만들면 안 됩니다.</div>';
    return h;
  }
  function panelSub() {
    return '<p class="sed-h">화면 안에 다른 화면 끼우기</p>' +
      '<div class="sed-screen"><span class="stt">main 화면 ' + '0100' + '</span>' +
      '<div style="font-family:var(--mono);font-size:.78rem;color:var(--ink-soft)">입력칸 · 버튼…</div>' +
      '<div class="sed-sub"><div class="subt">Subscreen Area: ' + esc(CFG.subArea) + ' → CALL SUBSCREEN ' + esc(CFG.subDynp) + '</div>' +
      '<div style="font-family:var(--mono);font-size:.76rem;color:#9a5b08">공통 머리말 화면 ' + esc(CFG.subDynp) + ' (버튼 있음)</div></div>' +
      '<div class="sed-okflow"><span class="sed-chip">subscreen 버튼 (OK field 없음)</span><span class="sed-link">▶</span><span class="sed-chip main">main OK_CODE</span></div>' +
      '</div>' +
      '<div class="sed-status">📌 <b>Subscreen은 자체 OK field가 없습니다</b>(공식문서). 사용자 명령의 function code는 <b>main 화면의 <code>OK_CODE</code></b>로 모여, main의 PAI에서 처리합니다.</div>';
  }
  function panelTab() {
    var cur = CFG.tabs.filter(function (t) { return t.fc === st.tabSel; })[0] || CFG.tabs[0];
    return '<p class="sed-h">탭 선택 (title = function code)</p>' +
      seg('tab', CFG.tabs.map(function (t) { return { v: t.fc, l: t.label + ' (' + t.fc + ')' }; }), st.tabSel) +
      '<div class="sed-map"><div class="sed-box"><div class="bk">tab_main-activetab</div><div class="bv">' + esc(cur.fc) + '</div></div>' +
      '<span class="sed-link">🔗</span>' +
      '<div class="sed-box area"><div class="bk">포함 subscreen</div><div class="bv">' + esc(cur.sub) + '</div></div></div>' +
      '<div class="sed-status">탭 <b>' + esc(cur.label) + '</b> 선택 → <code>tab_main-activetab = \'' + esc(cur.fc) + '\'</code>, 그 탭의 subscreen area에 화면 <code>' + esc(cur.sub) + '</code>을 표시합니다.</div>' +
      '<div class="note" style="margin-top:11px">탭은 <code>CONTROLS tab_main TYPE TABSTRIP.</code>으로 선언하고, 탭 title의 function code·subscreen area가 모두 맞아야 동작합니다.</div>';
  }
  function panelIcon() {
    var cur = CFG.statuses.filter(function (s) { return s.key === st.statSel; })[0] || CFG.statuses[0];
    return '<p class="sed-h">상태 → 아이콘·텍스트</p>' +
      seg('icon', CFG.statuses.map(function (s) { return { v: s.key, l: s.text }; }), st.statSel) +
      '<div class="sed-stat"><span class="ic">' + cur.icon + '</span><span class="tx">' + esc(cur.text) + '</span></div>' +
      '<div class="sed-status">Status Icon은 상태를 <b>아이콘·텍스트·툴팁</b>으로 보여 줍니다 — 좌석이 매진인지 가능한지 한눈에. 표 형태 목록은 <b>Grid ALV</b>로 따로 다룹니다(Table Control 제외).</div>';
  }

  function renderPanel() {
    var k = TABS[tab].key;
    panelEl.innerHTML = k === 'cc' ? panelCC() : k === 'sub' ? panelSub() : k === 'tab' ? panelTab() : panelIcon();
  }
  function render() { renderTabs(); renderPanel(); }

  tabsEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; tab = +b.getAttribute('data-i'); render(); });
  panelEl.addEventListener('click', function (e) {
    var b = e.target.closest('.sed-seg button'); if (!b) return;
    var host = b.parentNode.getAttribute('data-host'), v = b.getAttribute('data-v');
    if (host === 'cc') st.ccName = v; else if (host === 'tab') st.tabSel = v; else if (host === 'icon') st.statSel = v;
    renderPanel();
  });

  render();
})();
