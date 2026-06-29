/* string-template-composer 엔진 — CONCATENATE와 String Template을 나란히 비교하고, DATE/NUMBER 서식·substring 범위를 시연한다.
   mode(concat/template) · fmt(raw/user) 토글로 코드와 결과 문자열이 바뀌고, substring(val,off,len)은 범위를 벗어나면 오류를 보여 준다.
   골격 계약: .stc-mode · .stc-fmt · #stcCode · #stcResult · #stcSub · #stcSubOut.
   config: window.STC_CFG = { name, total, dan, mul, result, date }. 높이: _autoheight.js. */
(function () {
  var CFG = window.STC_CFG || { name: '정훈영', total: 120000, dan: 2, mul: 3, result: 6, date: '20260627' };
  var mode = 'template', fmt = 'raw';
  var subVal = 'CONCERT', subOff = 0, subLen = 3;

  var modeEl = document.querySelector('.stc-mode');
  var fmtEl = document.querySelector('.stc-fmt');
  var codeEl = document.getElementById('stcCode');
  var resEl = document.getElementById('stcResult');
  var subEl = document.getElementById('stcSub');
  var subOutEl = document.getElementById('stcSubOut');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function fmtDate() { var d = CFG.date; return fmt === 'user' ? d.slice(0, 4) + '.' + d.slice(4, 6) + '.' + d.slice(6, 8) : d; }
  function fmtNum() { return fmt === 'user' ? String(CFG.total).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : String(CFG.total); }

  function renderSeg(host, items, active, key) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + esc(it.l) + '</button>';
    }).join('');
  }
  function renderCode() {
    if (mode === 'concat') {
      codeEl.className = '';
      codeEl.textContent =
        "CONCATENATE lv_name '님 환영합니다' INTO lv_msg.\n" +
        "DATA lv_d TYPE c LENGTH 10. WRITE sy-datum TO lv_d" + (fmt === 'user' ? '' : '') + ".\n" +
        "\" 숫자는 WRITE ... TO 로 따로 변환해 이어붙여야…";
    } else {
      codeEl.className = 'tmpl';
      var dopt = fmt === 'user' ? ' DATE = USER' : '';
      var nopt = fmt === 'user' ? ' NUMBER = USER' : '';
      codeEl.textContent =
        "DATA(lv_msg) = |{ lv_name }님 환영합니다|.\n" +
        "DATA(lv_eq)  = |{ ls-dan } x { ls-mul } = { ls-result }|.\n" +
        "DATA(lv_ln)  = |오늘은 { sy-datum" + dopt + " }, 합계 { lv_total" + nopt + " }원입니다.|.";
    }
  }
  function renderResult() {
    var fmtCls = fmt === 'user' ? ' fmt' : '';
    resEl.innerHTML =
      '<span class="ln">' + esc(CFG.name) + '님 환영합니다</span>' +
      '<span class="ln">' + CFG.dan + ' x ' + CFG.mul + ' = ' + CFG.result + '</span>' +
      '<span class="ln">오늘은 <span class="' + (fmtCls ? 'fmt' : '') + '">' + esc(fmtDate()) + '</span>, 합계 <span class="' + (fmtCls ? 'fmt' : '') + '">' + esc(fmtNum()) + '</span>원입니다.</span>';
  }
  function renderSub() {
    subEl.innerHTML =
      '<label>val<input class="val" data-s="val" value="' + esc(subVal) + '"></label>' +
      '<label>off<input class="num" data-s="off" type="number" value="' + subOff + '" min="0"></label>' +
      '<label>len<input class="num" data-s="len" type="number" value="' + subLen + '" min="0"></label>';
  }
  function renderSubOut() {
    var L = subVal.length;
    if (subOff < 0 || subLen < 0 || subOff + subLen > L) {
      subOutEl.className = 'bad';
      subOutEl.innerHTML = "🚫 범위 초과 — strlen('" + esc(subVal) + "') = " + L + "인데 off " + subOff + " + len " + subLen + " = " + (subOff + subLen) + " > " + L + ". 입력 길이를 확인하세요.";
      return;
    }
    var part = subVal.slice(subOff, subOff + subLen);
    var pre = subVal.slice(0, subOff), post = subVal.slice(subOff + subLen);
    subOutEl.className = 'ok';
    subOutEl.innerHTML = "substring( val='" + esc(subVal) + "' off=" + subOff + " len=" + subLen + " ) → '<span class='hl'>" + esc(part) + "</span>'  (" + esc(pre) + "<b>" + esc(part) + "</b>" + esc(post) + ")";
  }
  function render() {
    renderSeg(modeEl, [{ v: 'concat', l: 'CONCATENATE' }, { v: 'template', l: 'String Template' }], mode);
    renderSeg(fmtEl, [{ v: 'raw', l: 'raw' }, { v: 'user', l: 'DATE/NUMBER = USER' }], fmt);
    renderCode(); renderResult(); renderSub(); renderSubOut();
  }

  modeEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; mode = b.getAttribute('data-v'); render(); });
  fmtEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; fmt = b.getAttribute('data-v'); render(); });
  subEl.addEventListener('input', function (e) {
    var s = e.target.getAttribute && e.target.getAttribute('data-s'); if (!s) return;
    if (s === 'val') subVal = e.target.value; else if (s === 'off') subOff = +e.target.value || 0; else subLen = +e.target.value || 0;
    renderSubOut();
  });

  render();
})();
