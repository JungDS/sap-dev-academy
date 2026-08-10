/* selscreen-call-variant 엔진 — 표준 화면(1000)에서 '고급조건'을 눌러 보조 화면(1100)을 CALL SELECTION-SCREEN modal로 연다.
   Execute로 닫으면 sy-subrc=0이고 값이 적용, Cancel로 닫으면 sy-subrc=4이고 적용 안 됨. Variant 저장/불러오기로 입력값 세트를 복원한다.
   Variant는 미리 만든 것을 불러올 수도, 지금 화면 값(pa_conc + 적용된 고급조건)을 새 이름으로 저장했다가
   다시 불러올 수도 있다(런타임 보관 — 새로고침하면 사라짐).
   골격 계약: #scvMain · #scvModal · #scvVarName · [data-save] · .scv-variants · #scvConsole.
   config: window.SCV_CFG = { mainConc, variants:[{id,label,conc,max,log}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SCV_CFG || { mainConc: 'C001', variants: [] };
  var st = { conc: CFG.mainConc, modal: false, pmax: '100', plog: false, applied: null, subrc: null, vmsg: null };
  var saved = [];   // 사용자가 저장한 Variant

  var mainEl = document.getElementById('scvMain');
  var modalEl = document.getElementById('scvModal');
  var nameEl = document.getElementById('scvVarName');
  var saveBtn = document.querySelector('[data-save]');
  var varsEl = document.querySelector('.scv-variants');
  var consoleEl = document.getElementById('scvConsole');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function renderMain() {
    var applied = st.applied
      ? '<div class="scv-applied">적용된 고급조건: pa_max=' + esc(st.applied.pmax) + ' · pa_log=' + (st.applied.plog ? "'X'" : "' '") + '</div>'
      : '';
    mainEl.innerHTML = '<div class="snum">표준 선택화면 (1000)</div>' +
      '<div class="scv-fld"><label>pa_conc</label><input type="text" value="' + esc(st.conc) + '" readonly></div>' +
      applied +
      '<button class="scv-openbtn" data-act="open">🔼 고급조건 열기 (FC01)</button>';
  }
  function renderModal() {
    if (!st.modal) { modalEl.innerHTML = ''; return; }
    modalEl.innerHTML = '<div class="scv-modal"><div class="mbar">보조 선택화면 (1100) <small>CALL SELECTION-SCREEN 1100 STARTING AT 10 5</small></div>' +
      '<div class="mbody">' +
        '<div class="scv-fld"><label>pa_max</label><input type="number" data-m="pmax" value="' + esc(st.pmax) + '"></div>' +
        '<div class="scv-fld"><span class="scv-chk"><input type="checkbox" data-m="plog"' + (st.plog ? ' checked' : '') + '> pa_log (로그 남기기)</span></div>' +
      '</div>' +
      '<div class="scv-mbtns"><button class="scv-exec" data-act="exec">▶ Execute</button><button class="scv-cancel" data-act="cancel">✖ Cancel</button></div>' +
    '</div>';
  }
  function allVariants() { return CFG.variants.concat(saved); }
  function renderVariants() {
    varsEl.innerHTML = allVariants().map(function (v) {
      var cls = v.bad ? ' class="bad"' : (v.mine ? ' class="mine"' : '');
      return '<button type="button" data-v="' + esc(v.id) + '"' + cls + '><span class="vid">' + esc(v.id) + '</span>' + esc(v.label) + '</button>';
    }).join('');
  }
  function renderConsole() {
    function row(k, v, cls) { return '<div class="scv-crow"><span class="scv-ck">' + k + '</span><span class="scv-cv ' + (cls || '') + '">' + v + '</span></div>'; }
    var h = row('현재 화면', st.modal ? '1100 (modal 열림)' : '1000', 'mono');
    if (st.subrc !== null) {
      h += row('sy-subrc', st.subrc + (st.subrc === 0 ? ' (Execute)' : ' (Back/Exit/Cancel)'), st.subrc === 0 ? 'ok' : 'bad');
      h += row('고급조건 적용', st.subrc === 0 ? '적용됨 — pa_max·pa_log 반영' : '적용 안 함 — 취소', st.subrc === 0 ? 'ok' : 'bad');
    }
    if (st.vmsg) h += row('Variant', st.vmsg.text, st.vmsg.cls);
    consoleEl.innerHTML = h;
  }
  function render() { renderMain(); renderModal(); renderVariants(); renderConsole(); }

  mainEl.addEventListener('click', function (e) {
    if (e.target.closest('[data-act="open"]')) { st.modal = true; st.subrc = null; render(); }
  });
  modalEl.addEventListener('input', function (e) {
    var m = e.target.getAttribute && e.target.getAttribute('data-m');
    if (m === 'pmax') st.pmax = e.target.value;
  });
  modalEl.addEventListener('change', function (e) {
    var m = e.target.getAttribute && e.target.getAttribute('data-m');
    if (m === 'plog') st.plog = e.target.checked;
  });
  modalEl.addEventListener('click', function (e) {
    if (e.target.closest('[data-act="exec"]')) { st.applied = { pmax: st.pmax, plog: st.plog }; st.subrc = 0; st.modal = false; render(); }
    else if (e.target.closest('[data-act="cancel"]')) { st.subrc = 4; st.modal = false; render(); }
  });
  varsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var id = b.getAttribute('data-v');
    var v = allVariants().filter(function (x) { return x.id === id; })[0];
    if (!v || v.bad) { st.vmsg = { text: '\'' + esc(id) + '\' 변형이 없습니다 — 무시됨 (값 복원 안 함)', cls: 'warn' }; render(); return; }
    st.conc = v.conc;
    var extra = '';
    if (v.applied) {                       // 저장해 둔 고급조건까지 함께 복원
      st.applied = { pmax: v.applied.pmax, plog: v.applied.plog };
      st.pmax = v.applied.pmax; st.plog = v.applied.plog;
      extra = ' · 고급조건 pa_max=' + esc(v.applied.pmax) + '·pa_log=' + (v.applied.plog ? "'X'" : "' '");
    }
    st.vmsg = { text: '변형 \'' + esc(v.id) + '\' 불러오기 — pa_conc ← ' + esc(v.conc) + extra, cls: 'ok' };
    render();
  });
  // 지금 화면 값을 새 Variant로 저장 (SE38 → Save as Variant 자리)
  saveBtn.addEventListener('click', function () {
    var raw = (nameEl.value || '').trim().toUpperCase().replace(/\s+/g, '_');
    var id = raw || ('MY_' + st.conc);
    var entry = {
      id: id, label: '내가 저장한 값 (pa_conc=' + st.conc + ')', conc: st.conc, mine: true,
      applied: st.applied ? { pmax: st.applied.pmax, plog: st.applied.plog } : null
    };
    var i = saved.map(function (x) { return x.id; }).indexOf(id);
    var over = i >= 0;
    if (over) saved[i] = entry; else saved.push(entry);
    nameEl.value = '';
    st.vmsg = { text: '변형 \'' + esc(id) + '\'' + (over ? ' 덮어쓰기' : ' 저장') + ' 완료 — 아래에서 눌러 불러올 수 있습니다.', cls: 'ok' };
    render();
  });

  render();
})();
