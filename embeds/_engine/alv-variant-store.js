/* alv-variant-store 엔진 — Display Variant로 사용자별 컬럼 순서(표시 방식)를 저장/복원한다.
   사용자 A·B의 저장된 Variant 카드를 열면 미리보기 컬럼 순서가 그 순서로 복원된다(데이터가 아니라 표시 방식).
   report(sy-repid)를 비우면 어느 프로그램의 Variant인지 기준이 약해진다는 경고를 띄운다.
   골격 계약: .avs-report · #avsPreview · .avs-variants · #avsMsg · [data-reset].
   config: window.AVS_CFG = { cols:[{key,label}], rows:[{}], variants:[{name,order}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.AVS_CFG || { cols: [], rows: [], variants: [] };
  var ORIG = CFG.cols.map(function (c) { return c.key; });
  var order = ORIG.slice();   // 현재 컬럼 순서
  var report = true;          // report = sy-repid 설정 여부
  var activeVar = null;       // 열린 variant name

  var reportEl = document.querySelector('.avs-report');
  var previewEl = document.getElementById('avsPreview');
  var varsEl = document.querySelector('.avs-variants');
  var msgEl = document.getElementById('avsMsg');
  var resetBtn = document.querySelector('[data-reset]');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function labelOf(k) { var c = CFG.cols.filter(function (x) { return x.key === k; })[0]; return c ? c.label : k; }

  function renderReport() {
    reportEl.innerHTML = [{ v: 1, l: 'report = sy-repid', bad: 0 }, { v: 0, l: 'report 비움', bad: 1 }].map(function (o) {
      return '<button type="button" data-v="' + o.v + '"' + (o.bad ? ' data-bad="1"' : '') + ' aria-pressed="' + ((o.v === 1) === report ? 'true' : 'false') + '">' + esc(o.l) + '</button>';
    }).join('');
  }
  function renderPreview() {
    var changed = order.join() !== ORIG.join();
    previewEl.innerHTML = '<div class="avs-gtt">미리보기 — 컬럼 순서' + (changed ? ' (Variant 적용됨)' : ' (원래)') + '</div>' +
      '<table class="avs-tbl"><thead><tr>' +
      order.map(function (k, i) { return '<th class="' + (changed && ORIG[i] !== k ? 'moved' : '') + '">' + esc(labelOf(k)) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      CFG.rows.map(function (r) { return '<tr>' + order.map(function (k) { return '<td>' + esc(r[k]) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table>';
  }
  function renderVariants() {
    varsEl.innerHTML = CFG.variants.map(function (v) {
      return '<div class="avs-card ' + (activeVar === v.name ? 'active' : '') + '"><div class="cn">💾 ' + esc(v.name) + '</div>' +
        '<div class="avs-order">' + v.order.map(function (k) { return '<span class="avs-chip">' + esc(labelOf(k)) + '</span>'; }).join('') + '</div>' +
        '<button type="button" class="avs-open" data-var="' + esc(v.name) + '"' + (report ? '' : ' disabled') + '>이 보기로 열기</button></div>';
    }).join('');
  }
  function renderMsg() {
    if (!report) { msgEl.className = 'warn'; msgEl.innerHTML = '🚫 <code>report</code>가 비어 있음 — 어느 프로그램의 Variant인지 기준이 약해 저장/조회가 꼬일 수 있습니다. <code>ls_variant-report = sy-repid</code>를 넣으세요.'; return; }
    if (activeVar) { msgEl.className = 'ok'; msgEl.innerHTML = '✅ <b>' + esc(activeVar) + '</b>의 Variant를 열어 <b>컬럼 순서</b>를 복원했습니다. 저장된 건 데이터가 아니라 <b>표시 방식</b>입니다.'; return; }
    msgEl.className = ''; msgEl.innerHTML = '저장된 Variant를 <b>열기</b>하면 그 사용자의 컬럼 순서로 바뀝니다.';
  }
  function render() { renderReport(); renderPreview(); renderVariants(); renderMsg(); }

  reportEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; report = b.getAttribute('data-v') === '1'; render(); });
  varsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.avs-open'); if (!b || b.disabled) return;
    var v = CFG.variants.filter(function (x) { return x.name === b.getAttribute('data-var'); })[0];
    if (v) { order = v.order.slice(); activeVar = v.name; render(); }
  });
  resetBtn.addEventListener('click', function () { order = ORIG.slice(); activeVar = null; render(); });

  render();
})();
