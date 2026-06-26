/* sort-priority-lab 엔진 — ORDER BY 정렬 기준을 바꿔 결과 재정렬·동률 2차기준·"정렬 없으면 순서 보장 없음"을 보여 준다.
   골격 계약: .spl-chips · #splHead(thead tr) · #splBody · #splFb.
   config: window.SPL_CFG = { people:[..], cols:[{key,label,num}], presets:[{label, keys:[{field,dir}]}] }.
   높이: _autoheight.js. */
(function () {
  var CFG = window.SPL_CFG || { people: [], cols: [], presets: [] };
  var idx = 0;
  var chipsEl = document.querySelector('.spl-chips');
  var headEl = document.getElementById('splHead');
  var bodyEl = document.getElementById('splBody');
  var fbEl = document.getElementById('splFb');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function keys() { return CFG.presets[idx].keys; }

  function sorted() {
    var ks = keys();
    var arr = CFG.people.map(function (p, i) { return { p: p, i: i }; });  // i = 원본 순서(안정정렬 tie-break)
    if (!ks.length) return arr;       // 정렬 없음 → 원본 순서
    arr.sort(function (a, b) {
      for (var j = 0; j < ks.length; j++) {
        var k = ks[j], va = a.p[k.field], vb = b.p[k.field];
        var c = (va < vb) ? -1 : (va > vb ? 1 : 0);
        if (k.dir === 'DESC') c = -c;
        if (c !== 0) return c;
      }
      return a.i - b.i;               // 완전 동률 → 원본 순서 유지(stable)
    });
    return arr;
  }

  function primaryField() { return keys().length ? keys()[0].field : null; }

  function renderHead() {
    var ks = keys();
    headEl.innerHTML = CFG.cols.map(function (c) {
      var ki = -1; for (var j = 0; j < ks.length; j++) if (ks[j].field === c.key) { ki = j; break; }
      var sortCls = ki >= 0 ? ' sortcol' : '';
      var deco = '';
      if (ki >= 0) {
        deco = '<span class="spl-arrow">' + (ks[ki].dir === 'DESC' ? '▼' : '▲') + '</span>';
        if (ks.length > 1) deco += '<span class="spl-prio">' + (ki + 1) + '</span>';
      }
      return '<th class="' + (c.num ? 'num' : '') + sortCls + '">' + esc(c.label) + deco + '</th>';
    }).join('');
  }

  function renderBody() {
    var rows = sorted();
    var pf = primaryField();
    bodyEl.innerHTML = rows.map(function (r, ri) {
      // 동률(첫 기준 값이 위/아래와 같음) 표시
      var tie = false;
      if (pf) {
        var prev = ri > 0 ? rows[ri - 1].p[pf] : null, next = ri < rows.length - 1 ? rows[ri + 1].p[pf] : null;
        tie = (r.p[pf] === prev) || (r.p[pf] === next);
      }
      return '<tr class="' + (tie ? 'tie' : '') + '">' + CFG.cols.map(function (c) {
        return '<td class="' + (c.num ? 'num' : '') + '">' + esc(r.p[c.key]) + '</td>';
      }).join('') + '</tr>';
    }).join('');
  }

  function renderFb() {
    var ks = keys();
    if (!ks.length) {
      fbEl.className = 'spl-fb warn';
      fbEl.innerHTML = '⚠️ <b>ORDER BY 없음</b> — 지금 보이는 순서는 업무 규칙이 아닙니다. DB가 어떤 순서로 줄지 보장하지 않습니다.';
      return;
    }
    fbEl.className = 'spl-fb';
    var clause = ks.map(function (k) { return k.field + ' ' + (k.dir === 'DESC' ? 'DESCENDING' : 'ASCENDING'); }).join(' ');
    var extra = ks.length > 1 ? ' 첫 기준이 같은(동률) 행 안에서 두 번째 기준이 순서를 정합니다.' : '';
    fbEl.innerHTML = '<b>ORDER BY ' + clause + '</b> — 앞 기준이 우선.' + extra + ' 행 수(sy-dbcnt)는 그대로, 순서만 바뀝니다.';
  }

  function render() {
    Array.prototype.forEach.call(chipsEl.querySelectorAll('.spl-chip'), function (b, i) {
      b.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
    });
    renderHead(); renderBody(); renderFb();
  }

  chipsEl.insertAdjacentHTML('beforeend', CFG.presets.map(function (p, i) {
    return '<button class="spl-chip" type="button" data-i="' + i + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' + esc(p.label) + '</button>';
  }).join(''));
  chipsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.spl-chip'); if (!b) return;
    idx = +b.getAttribute('data-i'); render();
  });

  render();
})();
