/* field-curtain 엔진 — Projection View 필드 선택을 켜고 끄면 결과 컬럼이 바뀐다. key 필드 경고·기술필드 일괄 숨김·ABAP 구조 미리보기.
   골격 계약: #fcFields · [data-tech] · [data-all] · #fcHead · #fcBody · #fcStruct · #fcFb.
   config: window.FC_CFG = { table, structName, fields:[{key,label,tech,isKey}], rows:[{}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.FC_CFG || { fields: [], rows: [] };
  var sel = {};
  CFG.fields.forEach(function (f) { sel[f.key] = true; });   // 초기: 전체 노출

  var fieldsEl = document.getElementById('fcFields');
  var headEl = document.getElementById('fcHead');
  var bodyEl = document.getElementById('fcBody');
  var structEl = document.getElementById('fcStruct');
  var fbEl = document.getElementById('fcFb');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function selected() { return CFG.fields.filter(function (f) { return sel[f.key]; }); }

  function renderFields() {
    fieldsEl.innerHTML = CFG.fields.map(function (f) {
      var tag = f.isKey ? '<span class="tag key">KEY</span>' : (f.tech ? '<span class="tag tech">기술</span>' : '');
      return '<label class="fc-field' + (sel[f.key] ? '' : ' off') + '"><input type="checkbox" data-k="' + f.key + '"' + (sel[f.key] ? ' checked' : '') + '>' +
        '<span>' + esc(f.key) + '</span>' + tag + '</label>';
    }).join('');
  }
  function renderResult() {
    var fs = selected();
    headEl.innerHTML = fs.map(function (f) { return '<th>' + esc(f.key) + '</th>'; }).join('');
    bodyEl.innerHTML = CFG.rows.map(function (r) {
      return '<tr>' + fs.map(function (f) { return '<td>' + esc(r[f.key]) + '</td>'; }).join('') + '</tr>';
    }).join('');
  }
  function renderStruct() {
    var fs = selected();
    var lines = fs.map(function (f, i) { return '         ' + f.key + (i < fs.length - 1 ? ',' : ''); });
    structEl.querySelector('pre').innerHTML =
      '<span class="kw">TYPES</span>: <span class="kw">BEGIN OF</span> ' + (CFG.structName || 'ty_basic') + ',\n' +
      (fs.length ? fs.map(function (f) { return '         ' + esc(f.key); }).join(',\n') + ',\n' : '') +
      '       <span class="kw">END OF</span> ' + (CFG.structName || 'ty_basic') + '.';
  }
  function renderFb() {
    var fs = selected();
    var keyMissing = CFG.fields.some(function (f) { return f.isKey && !sel[f.key]; });
    var techShown = CFG.fields.filter(function (f) { return f.tech && sel[f.key]; }).length;
    if (!fs.length) { fbEl.className = 'fc-fb warn'; fbEl.innerHTML = '필드를 하나 이상 노출해야 합니다.'; return; }
    if (keyMissing) { fbEl.className = 'fc-fb warn'; fbEl.innerHTML = '⚠️ 업무 화면에서 행을 식별할 <b>key 필드(concert_id)</b>는 남겨야 합니다.'; return; }
    fbEl.className = 'fc-fb';
    fbEl.innerHTML = '노출 ' + fs.length + ' / ' + CFG.fields.length + '개. ' +
      (techShown ? '기술 필드(' + techShown + '개)가 아직 노출 중 — Projection View는 안 봐도 되는 컬럼을 줄이는 데 유용합니다.' : '✅ 기술 필드를 모두 가렸습니다 — 업무에 필요한 컬럼만 깔끔하게 노출됩니다.');
  }
  function render() { renderFields(); renderResult(); renderStruct(); renderFb(); }

  fieldsEl.addEventListener('change', function (e) {
    var cb = e.target.closest('input[data-k]'); if (!cb) return;
    sel[cb.getAttribute('data-k')] = cb.checked; render();
  });
  var techBtn = document.querySelector('[data-tech]');
  if (techBtn) techBtn.addEventListener('click', function () { CFG.fields.forEach(function (f) { if (f.tech) sel[f.key] = false; }); render(); });
  var allBtn = document.querySelector('[data-all]');
  if (allBtn) allBtn.addEventListener('click', function () { CFG.fields.forEach(function (f) { sel[f.key] = true; }); render(); });

  render();
})();
