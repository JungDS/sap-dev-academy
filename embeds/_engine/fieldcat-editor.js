/* fieldcat-editor 엔진 — lt_fcat의 coltext/outputlen을 편집하면 lt_booking 미리보기 헤더가 즉시 바뀐다.
   LOOP의 IF ls_fcat-fieldname = 'SEATS'(대문자)면 SEATS 컬럼 수정이 적용되고, 'seats'(소문자)면 DDIC 필드명과 안 맞아 적용 안 됨.
   골격 계약: .fce-case · #fceEditor · #fcePreview · #fceMsg.
   config: window.FCE_CFG = { cols:[{fieldname,default,len}], rows:[{}], caseField }. 높이: _autoheight.js. */
(function () {
  var CFG = window.FCE_CFG || { cols: [], rows: [], caseField: 'SEATS' };
  var coltext = {}, outlen = {};
  CFG.cols.forEach(function (c) { coltext[c.fieldname] = c.default || ''; outlen[c.fieldname] = c.len || 10; });
  var caseUpper = true;   // LOOP IF의 fieldname 대소문자

  var caseEl = document.querySelector('.fce-case');
  var editorEl = document.getElementById('fceEditor');
  var previewEl = document.getElementById('fcePreview');
  var msgEl = document.getElementById('fceMsg');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  // caseField(SEATS) 수정 적용 여부: 대문자일 때만 적용
  function applies(fn) { return fn !== CFG.caseField || caseUpper; }
  function headerOf(fn) {
    if (!applies(fn)) return fn;            // 소문자 매칭 실패 → 기본(기술 필드명)
    return coltext[fn] || fn;
  }

  function renderCase() {
    caseEl.innerHTML = [{ v: 1, l: "fieldname = '" + CFG.caseField + "'", bad: 0 }, { v: 0, l: "= '" + CFG.caseField.toLowerCase() + "'", bad: 1 }].map(function (o) {
      return '<button type="button" data-v="' + o.v + '"' + (o.bad ? ' data-bad="1"' : '') + ' aria-pressed="' + ((o.v === 1) === caseUpper ? 'true' : 'false') + '">' + esc(o.l) + '</button>';
    }).join('');
  }
  function renderPreview() {
    previewEl.innerHTML = '<div class="fce-gtt">lt_booking 미리보기</div><table class="fce-tbl"><thead><tr>' +
      CFG.cols.map(function (c) { return '<th>' + esc(headerOf(c.fieldname)) + '<span class="fn">' + esc(c.fieldname) + '</span></th>'; }).join('') + '</tr></thead><tbody>' +
      CFG.rows.map(function (r) { return '<tr>' + CFG.cols.map(function (c) { return '<td>' + esc(r[c.fieldname]) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table>';
  }
  function renderEditor() {
    editorEl.innerHTML = CFG.cols.map(function (c) {
      var fn = c.fieldname, warn = !applies(fn);
      return '<div class="fce-row ' + (warn ? 'warn' : '') + '"><span class="fld">' + esc(fn) + '<small>fieldname</small></span>' +
        '<input class="col" data-col="' + esc(fn) + '" value="' + esc(coltext[fn]) + '" placeholder="coltext(제목)">' +
        '<input class="len" type="number" data-len="' + esc(fn) + '" value="' + esc(outlen[fn]) + '">' +
        (warn ? '<span class="lk">✕ 불일치</span>' : '') + '</div>';
    }).join('');
  }
  function renderMsg() {
    if (!caseUpper) { msgEl.className = 'warn'; msgEl.innerHTML = "🚫 <code>IF ls_fcat-fieldname = '" + esc(CFG.caseField.toLowerCase()) + "'</code> — DDIC 필드명은 대문자 <code>'" + esc(CFG.caseField) + "'</code>라 <b>이 조건이 한 번도 참이 안 되어</b> " + esc(CFG.caseField) + " 컬럼 수정이 적용되지 않습니다."; return; }
    msgEl.className = 'ok';
    msgEl.innerHTML = '✅ <code>coltext</code>를 바꾸면 헤더가, <code>outputlen</code>은 너비가 바뀝니다. <code>fieldname</code>이 데이터 필드명과 정확히 같아야 적용됩니다.';
  }
  function render() { renderCase(); renderPreview(); renderEditor(); renderMsg(); }

  caseEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; caseUpper = b.getAttribute('data-v') === '1'; render(); });
  editorEl.addEventListener('input', function (e) {
    var col = e.target.getAttribute && e.target.getAttribute('data-col');
    var len = e.target.getAttribute && e.target.getAttribute('data-len');
    if (col) { coltext[col] = e.target.value; renderPreview(); }
    else if (len) { outlen[len] = e.target.value; }
  });

  render();
})();
