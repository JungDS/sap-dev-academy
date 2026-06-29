/* option-compare-lab 엔진 — 단일 Range 조건의 SIGN·OPTION·LOW·HIGH를 바꿔 후보 통과를 실시간 비교.
   골격 계약: [data-sign="I"]/[data-sign="E"] · #oclOpt · #oclLow · .ocl-high(>#oclHigh) · .ocl-chips · #oclRead · #oclBody.
   config: window.OCL_CFG = { candidates:[..], init:{sign,opt,low,high}, presets:[{label,cond:{sign,opt,low,high}}] }.
   높이: _autoheight.js가 처리. */
(function () {
  var CFG = window.OCL_CFG || { candidates: [], init: { sign: 'I', opt: 'EQ', low: '', high: '' }, presets: [] };
  var cond = Object.assign({ sign: 'I', opt: 'EQ', low: '', high: '' }, CFG.init || {});

  var optEl = document.getElementById('oclOpt');
  var lowEl = document.getElementById('oclLow');
  var highEl = document.getElementById('oclHigh');
  var highWrap = document.querySelector('.ocl-high');
  var readEl = document.getElementById('oclRead');
  var bodyEl = document.getElementById('oclBody');
  var chipsEl = document.querySelector('.ocl-chips');
  var signBtns = Array.prototype.slice.call(document.querySelectorAll('[data-sign]'));

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function cmp(a, b) { a = String(a); b = String(b); return a < b ? -1 : (a > b ? 1 : 0); }
  function cpMatch(val, pat) {
    var rx = '^' + String(pat).replace(/[.^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\+/g, '.') + '$';
    return new RegExp(rx, 'i').test(String(val));
  }
  function matchOpt(val) {
    var r = cond;
    switch (r.opt) {
      case 'EQ': return cmp(val, r.low) === 0;
      case 'NE': return cmp(val, r.low) !== 0;
      case 'GT': return cmp(val, r.low) > 0;
      case 'LT': return cmp(val, r.low) < 0;
      case 'GE': return cmp(val, r.low) >= 0;
      case 'LE': return cmp(val, r.low) <= 0;
      case 'BT': return cmp(val, r.low) >= 0 && cmp(val, r.high) <= 0;
      case 'NB': return !(cmp(val, r.low) >= 0 && cmp(val, r.high) <= 0);
      case 'CP': return cpMatch(val, r.low);
      case 'NP': return !cpMatch(val, r.low);
    }
    return false;
  }
  var OPT_SAY = { EQ: '와 같음', NE: '와 다름', GT: ' 초과', GE: ' 이상', LT: ' 미만', LE: ' 이하', BT: ' 사이', NB: ' 사이 밖', CP: ' 패턴에 맞음', NP: ' 패턴에 안 맞음' };

  function isHighOpt() { return cond.opt === 'BT' || cond.opt === 'NB'; }

  function readSentence() {
    var rng = cond.opt === 'BT' || cond.opt === 'NB'
      ? esc(cond.low) + '~' + esc(cond.high)
      : esc(cond.low);
    var verb = cond.sign === 'I' ? '포함' : '제외';
    var say = (cond.opt === 'BT' ? esc(cond.low) + '부터 ' + esc(cond.high) + '까지'
      : cond.opt === 'CP' ? esc(cond.low) + ' 패턴'
        : esc(cond.low) + (OPT_SAY[cond.opt] || ''));
    return '<b>' + cond.sign + ' ' + cond.opt + ' ' + rng + '</b> → ' + say + '인 값을 <b>' + verb + '</b>';
  }

  function render() {
    // SIGN 토글 상태
    signBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-sign') === cond.sign ? 'true' : 'false'); });
    if (optEl) optEl.value = cond.opt;
    if (lowEl) lowEl.value = cond.low;
    if (highEl) highEl.value = cond.high || '';
    if (highWrap) highWrap.classList.toggle('hide', !isHighOpt());
    readEl.innerHTML = readSentence();
    bodyEl.innerHTML = CFG.candidates.map(function (v) {
      var m = matchOpt(v);
      var pass = cond.sign === 'I' ? m : !m;   // I: 매칭=통과 · E: 매칭=제외(탈락)
      return '<tr class="' + (pass ? 'pass' : 'drop') + '">' +
        '<td class="val">' + esc(v) + '</td>' +
        '<td>' + (m ? '<span class="yes">예</span>' : '<span class="no">아니오</span>') + '</td>' +
        '<td>' + (pass ? '<span class="fin-pass">통과</span>' : '<span class="fin-drop">탈락</span>') + '</td>' +
        '</tr>';
    }).join('');
  }

  // SIGN 토글
  signBtns.forEach(function (b) {
    b.addEventListener('click', function () { cond.sign = b.getAttribute('data-sign'); render(); });
  });
  // OPTION / LOW / HIGH 변경
  if (optEl) optEl.addEventListener('change', function () { cond.opt = optEl.value; render(); });
  if (lowEl) lowEl.addEventListener('input', function () { cond.low = lowEl.value; render(); });
  if (highEl) highEl.addEventListener('input', function () { cond.high = highEl.value; render(); });

  // 프리셋 칩
  if (chipsEl) {
    chipsEl.innerHTML = (CFG.presets || []).map(function (p, i) {
      return '<button class="ocl-chip" type="button" data-i="' + i + '">' + esc(p.label) + '</button>';
    }).join('');
    chipsEl.addEventListener('click', function (e) {
      var chip = e.target.closest('.ocl-chip'); if (!chip) return;
      var p = CFG.presets[+chip.getAttribute('data-i')]; if (!p) return;
      cond = Object.assign({ sign: 'I', opt: 'EQ', low: '', high: '' }, p.cond);
      render();
    });
  }

  render();
})();
