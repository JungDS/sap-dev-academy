/* range-append-stepper 엔진 — ABAP 코드를 한 줄씩 실행하며 work area→APPEND→Range Table→SELECT 결과를 보여 준다.
   골격 계약: [data-code] · #rasLs · #rasLr · #rasResult · [data-next] · [data-reset] · #rasFb · [data-progress]
             · (선택) [data-skipclear] = 'CLEAR 생략' 체크박스.
   config: window.RAS_CFG = { code:[lines], steps:[{hl,ls,lr,result,fb, ls2?,lr2?,fb2?}], data:[rows],
                              resultCols:[{key,label,num}], field, itab?, range?, skipLine? }.
     ls2/lr2/fb2 = [data-skipclear]가 켜졌을 때(=CLEAR를 건너뛴 흐름)의 work area·Range Table·설명.
                   주지 않으면 기본값(ls/lr/fb)을 그대로 쓴다 → 토글이 없는 위젯은 동작 변화 없음.
     skipLine    = 토글이 켜졌을 때 취소선 처리할 코드 줄 인덱스(0-based, 보통 CLEAR 줄).
     itab/range  = 결과 캡션에 쓰는 Internal Table·Range Table 이름(기본 gt_book/gr_stat).
   높이: _autoheight.js가 처리. */
(function () {
  var CFG = window.RAS_CFG || { code: [], steps: [], data: [], resultCols: [], field: '' };
  var KW = new Set('DATA TYPE TYPES TABLE OF LIKE LINE RANGE CLEAR APPEND TO SELECT FROM INTO WHERE IN AND'.split(' '));
  var codeBox = document.querySelector('[data-code]');
  var lsEl = document.getElementById('rasLs');
  var lrEl = document.getElementById('rasLr');
  var resultEl = document.getElementById('rasResult');
  var nextBtn = document.querySelector('[data-next]');
  var resetBtn = document.querySelector('[data-reset]');
  var fbEl = document.getElementById('rasFb');
  var progEl = document.querySelector('[data-progress]');
  var skipEl = document.querySelector('[data-skipclear]');
  var cur = -1;   // 실행한 마지막 step 인덱스(-1=시작 전)
  function skipOn() { return !!(skipEl && skipEl.checked); }

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function hl(line) {
    if (/^\s*\*/.test(line)) return '<span class="tok-com">' + esc(line) + '</span>';
    var out = '', re = /('[^']*'?)|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_]*)|([^A-Za-z0-9_']+)/g, m;
    while ((m = re.exec(line)) !== null) {
      if (m[1]) out += '<span class="tok-str">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="tok-num">' + esc(m[2]) + '</span>';
      else if (m[3]) out += KW.has(m[3].toUpperCase()) ? '<span class="tok-kw">' + esc(m[3]) + '</span>' : esc(m[3]);
      else out += esc(m[0]);
    }
    return out;
  }

  // 코드 렌더(1회)
  if (codeBox) {
    codeBox.innerHTML = '<ol>' + CFG.code.map(function (ln) { return '<li>' + (ln ? hl(ln) : '&nbsp;') + '</li>'; }).join('') + '</ol>';
  }
  var lines = codeBox ? codeBox.querySelectorAll('li') : [];

  function cmp(a, b) { a = String(a); b = String(b); return a < b ? -1 : (a > b ? 1 : 0); }
  function cpMatch(v, p) { return new RegExp('^' + String(p).replace(/[.^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\+/g, '.') + '$', 'i').test(String(v)); }
  function matchOpt(v, r) {
    switch (r.option) {
      case 'EQ': return cmp(v, r.low) === 0; case 'NE': return cmp(v, r.low) !== 0;
      case 'GT': return cmp(v, r.low) > 0; case 'GE': return cmp(v, r.low) >= 0;
      case 'LT': return cmp(v, r.low) < 0; case 'LE': return cmp(v, r.low) <= 0;
      case 'BT': return cmp(v, r.low) >= 0 && cmp(v, r.high) <= 0;
      case 'CP': return cpMatch(v, r.low);
    }
    return false;
  }
  function inRange(v, rows) {
    if (!rows.length) return true;
    var inc = rows.filter(function (r) { return r.sign === 'I'; });
    var exc = rows.filter(function (r) { return r.sign === 'E'; });
    return (inc.length === 0 ? true : inc.some(function (r) { return matchOpt(v, r); })) &&
      exc.every(function (r) { return !matchOpt(v, r); });
  }

  function cell(k, val) {
    var empty = (val === undefined || val === '' || val === null);
    return '<div class="cell"><span class="k">' + k + '</span><span class="v' + (empty ? ' empty' : '') + '">' + (empty ? '—' : esc(val)) + '</span></div>';
  }
  function renderLs(ls) {
    ls = ls || {};
    lsEl.innerHTML = cell('SIGN', ls.sign) + cell('OPTION', ls.option) + cell('LOW', ls.low) + cell('HIGH', ls.high);
  }
  function renderLr(rows) {
    rows = rows || [];
    if (!rows.length) { lrEl.innerHTML = '<tr><td colspan="4" class="ras-empty">(빈 Range Table)</td></tr>'; return; }
    lrEl.innerHTML = rows.map(function (r) {
      return '<tr><td class="' + (r.sign === 'I' ? 'sign-i' : '') + '">' + r.sign + '</td><td>' + r.option + '</td><td>' + esc(r.low) + '</td><td>' + (r.high ? esc(r.high) : '—') + '</td></tr>';
    }).join('');
  }
  function renderResult(rows) {
    var passed = CFG.data.filter(function (d) { return inRange(d[CFG.field], rows); });
    var cols = CFG.resultCols;
    var thead = '<tr>' + cols.map(function (c) { return '<th>' + c.label + '</th>'; }).join('') + '</tr>';
    var body = passed.map(function (d) {
      return '<tr>' + cols.map(function (c) { return '<td class="' + (c.num ? 'num' : '') + '">' + esc(d[c.key]) + '</td>'; }).join('') + '</tr>';
    }).join('');
    resultEl.querySelector('table').innerHTML = thead + body;
    resultEl.querySelector('.ras-cap').textContent =
      (CFG.itab || 'gt_book') + ' = ' + passed.length + '행 (' + CFG.field + ' IN ' + (CFG.range || 'gr_stat') + ')';
  }

  function render() {
    var st = cur >= 0 ? CFG.steps[cur] : null;
    var skip = skipOn();
    // CLEAR를 건너뛴 흐름이면 ls2/lr2/fb2를 쓴다(없으면 기본값 그대로).
    var ls = st ? ((skip && st.ls2) ? st.ls2 : st.ls) : {};
    var lr = st ? ((skip && st.lr2) ? st.lr2 : st.lr) : [];
    lines.forEach(function (li, i) {
      li.classList.toggle('on', st && i === st.hl);
      li.classList.toggle('done', st && i < st.hl);
      li.classList.toggle('skipped', skip && CFG.skipLine === i);
    });
    renderLs(ls);
    renderLr(lr);
    var showResult = st && st.result;
    resultEl.classList.toggle('hide', !showResult);
    if (showResult) renderResult(lr);
    fbEl.textContent = st ? ((skip && st.fb2) ? st.fb2 : st.fb) : '▶ 다음 단계를 눌러 한 줄씩 실행하세요.';
    progEl.textContent = (cur + 1) + ' / ' + CFG.steps.length;
    nextBtn.disabled = cur >= CFG.steps.length - 1;
  }

  if (nextBtn) nextBtn.addEventListener('click', function () { if (cur < CFG.steps.length - 1) { cur++; render(); } });
  if (resetBtn) resetBtn.addEventListener('click', function () { cur = -1; render(); });
  if (skipEl) skipEl.addEventListener('change', render);   // 현재 단계 그대로 두 흐름을 갈아 끼운다

  render();
})();
