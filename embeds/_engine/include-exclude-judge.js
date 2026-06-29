/* include-exclude-judge 엔진 — 포함(I)/제외(E) 조건을 쌓아 후보별 통과·탈락을 이유와 함께 판정.
   골격 계약: .iej-chips(프리셋 호스트) · #iejRows(조건 행) · #iejBody(판정 tbody) · [data-clear].
   config: window.IEJ_CFG = { field, candidates:[..], presets:[{label, sign?, rows:[{sign,opt,low,high}]}] }.
   높이: _autoheight.js가 처리. */
(function () {
  var CFG = window.IEJ_CFG || { field: 'val', candidates: [], presets: [] };
  var rows = [];
  var chipsEl = document.querySelector('.iej-chips');
  var rowsEl = document.getElementById('iejRows');
  var bodyEl = document.getElementById('iejBody');

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; });
  }
  function cmp(a, b) { a = String(a); b = String(b); return a < b ? -1 : (a > b ? 1 : 0); }
  function cpMatch(val, pat) {
    var rx = '^' + String(pat).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\+/g, '.') + '$';
    return new RegExp(rx, 'i').test(String(val));
  }
  function matchOpt(val, r) {
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
  function rowDesc(r) {
    var s = (r.sign === 'I' ? '포함' : '제외') + ' · ';
    if (r.opt === 'EQ') return s + r.low + ' 와 같음';
    if (r.opt === 'BT') return s + r.low + '~' + r.high;
    if (r.opt === 'CP') return s + r.low + ' 패턴';
    return s + r.opt + ' ' + r.low + (r.high ? ' ' + r.high : '');
  }

  function renderRows() {
    if (!rows.length) {
      rowsEl.innerHTML = '<span class="iej-empty">위 다중 선택 버튼으로 포함·제외 조건을 쌓아 보세요. (조건이 없으면 전체 통과)</span>';
      return;
    }
    rowsEl.innerHTML = rows.map(function (r, i) {
      var b = r.sign === 'I' ? 'i' : 'e';
      return '<div class="iej-row">' +
        '<span class="iej-badge ' + b + '">' + (r.sign === 'I' ? 'I 포함' : 'E 제외') + '</span>' +
        '<span>' + r.opt + ' ' + esc(r.low) + (r.high ? '~' + esc(r.high) : '') + '</span>' +
        '<span class="desc">' + esc(rowDesc(r)) + '</span>' +
        '<button class="rm" type="button" data-i="' + i + '" title="삭제">×</button>' +
        '</div>';
    }).join('');
  }

  function judge(v) {
    var inc = rows.filter(function (r) { return r.sign === 'I'; });
    var exc = rows.filter(function (r) { return r.sign === 'E'; });
    var passInc = inc.length === 0 ? true : inc.some(function (r) { return matchOpt(v, r); });
    var excHit = exc.some(function (r) { return matchOpt(v, r); });
    var pass = passInc && !excHit;
    var reason;
    if (!passInc) reason = esc(v) + ': 포함 조건에 들어오지 않았습니다.';
    else if (excHit) reason = esc(v) + ': 포함되지만 제외 조건에 걸려 탈락합니다.';
    else if (inc.length === 0 && exc.length === 0) reason = esc(v) + ': 조건이 없어 전체 통과합니다.';
    else if (inc.length === 0) reason = esc(v) + ': (포함 조건 없음) 제외에 걸리지 않아 통과합니다.';
    else reason = esc(v) + ': 포함 범위에 있고 제외에는 없어 통과합니다.';
    return { passInc: passInc, excHit: excHit, pass: pass, reason: reason };
  }

  function renderTable() {
    bodyEl.innerHTML = CFG.candidates.map(function (v) {
      var j = judge(v);
      return '<tr class="' + (j.pass ? 'pass' : 'drop') + '">' +
        '<td class="val">' + esc(v) + '</td>' +
        '<td>' + (j.passInc ? '<span class="yes">예</span>' : '<span class="no">아니오</span>') + '</td>' +
        '<td>' + (j.excHit ? '<span class="yes">예</span>' : '<span class="no">아니오</span>') + '</td>' +
        '<td>' + (j.pass ? '<span class="fin-pass">통과</span>' : '<span class="fin-drop">탈락</span>') + '</td>' +
        '<td class="reason">' + j.reason + '</td>' +
        '</tr>';
    }).join('');
  }

  function refresh() { renderRows(); renderTable(); }

  // 프리셋 칩 렌더
  if (chipsEl) chipsEl.innerHTML = (CFG.presets || []).map(function (p, i) {
    var sign = p.sign || (p.rows && p.rows[0] && p.rows[0].sign) || 'I';
    return '<button class="iej-chip" type="button" data-i="' + i + '" data-sign="' + sign + '">' + esc(p.label) + '</button>';
  }).join('');

  // 프리셋 클릭 → 행 추가(누적)
  if (chipsEl) chipsEl.addEventListener('click', function (e) {
    var chip = e.target.closest('.iej-chip'); if (!chip) return;
    var p = CFG.presets[+chip.getAttribute('data-i')]; if (!p) return;
    (p.rows || []).forEach(function (r) { rows.push(Object.assign({}, r)); });
    refresh();
  });
  // 조건 행 삭제
  rowsEl.addEventListener('click', function (e) {
    var rm = e.target.closest('.rm'); if (!rm) return;
    rows.splice(+rm.getAttribute('data-i'), 1); refresh();
  });
  // 비우기
  var clr = document.querySelector('[data-clear]');
  if (clr) clr.addEventListener('click', function () { rows = []; refresh(); });

  refresh();
})();
