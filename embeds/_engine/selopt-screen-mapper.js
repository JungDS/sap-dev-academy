/* selopt-screen-mapper 엔진 — 선택화면 From/To 입력 + 다중선택 → Range Table 행 → LOOP AT 출력.
   골격 계약: .ssm-from · .ssm-to · [data-multi](팝업 토글) · .ssm-pop(+.ssm-chip[data-add]) · #ssmBody(tbody) · #ssmOut.
   config: window.SSM_CFG = { name:'so_conc', field:'zbooking-concert_id', multi:[{label, row:{sign,opt,low,high}}] }.
   높이: _autoheight.js가 처리. */
(function () {
  var CFG = window.SSM_CFG || { name: 'so_xxx', field: '', multi: [] };
  var extra = [];                       // 다중선택으로 추가된 행
  var fromEl = document.querySelector('.ssm-from');
  var toEl = document.querySelector('.ssm-to');
  var popEl = document.querySelector('.ssm-pop');
  var bodyEl = document.getElementById('ssmBody');
  var outEl = document.getElementById('ssmOut');

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }
  function pad(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }

  // From/To 입력 → 한 행으로 해석(From만=EQ, From+To=BT, 비면 없음)
  function fromToRow() {
    var lo = (fromEl.value || '').trim(), hi = (toEl.value || '').trim();
    if (!lo && !hi) return null;
    if (lo && hi) return { sign: 'I', opt: 'BT', low: lo, high: hi, src: 'From~To' };
    return { sign: 'I', opt: 'EQ', low: lo || hi, high: '', src: 'From' };
  }
  function allRows() {
    var ft = fromToRow();
    return (ft ? [ft] : []).concat(extra);
  }

  function renderTable() {
    var rows = allRows();
    if (!rows.length) {
      bodyEl.innerHTML = '<tr><td colspan="6" class="ssm-none">From/To에 값을 넣거나 다중 선택으로 조건을 더해 보세요. (비우면 행 없음 = 전체 통과)</td></tr>';
    } else {
      bodyEl.innerHTML = rows.map(function (r, i) {
        var sc = r.sign === 'I' ? 'sign-i' : 'sign-e';
        var high = r.high ? esc(r.high) : '<span class="empty">—</span>';
        var rm = r.src === 'From' || r.src === 'From~To'
          ? '<span class="empty">화면</span>'
          : '<button class="ssm-rm" type="button" data-i="' + (i - (fromToRow() ? 1 : 0)) + '" title="삭제">×</button>';
        return '<tr>' +
          '<td class="' + sc + '">' + r.sign + '</td>' +
          '<td>' + r.opt + '</td>' +
          '<td>' + esc(r.low) + '</td>' +
          '<td>' + high + '</td>' +
          '<td class="ssm-src">' + esc(r.src || '다중') + '</td>' +
          '<td>' + rm + '</td>' +
          '</tr>';
      }).join('');
    }
    renderOut();
  }

  // LOOP AT so_conc INTO ls. WRITE: / sign option low high.
  function renderOut() {
    var rows = allRows();
    if (!rows.length) { outEl.textContent = '* ' + CFG.name + ' 가 비어 있음 → LOOP 0회 (조건 없음 = 전체 통과)'; return; }
    var lines = rows.map(function (r) {
      return pad(r.sign, 5) + pad(r.opt, 6) + pad(r.low, 8) + (r.high || '');
    });
    outEl.textContent = lines.join('\n');
  }

  // 다중 선택 팝업 토글
  var multiBtn = document.querySelector('[data-multi]');
  if (multiBtn) multiBtn.addEventListener('click', function () { popEl.classList.toggle('open'); });

  // 팝업 칩 → 행 추가
  if (popEl) popEl.addEventListener('click', function (e) {
    var chip = e.target.closest('.ssm-chip'); if (!chip) return;
    var m = CFG.multi[+chip.getAttribute('data-add')]; if (!m) return;
    extra.push(Object.assign({ src: '다중' }, m.row));
    renderTable();
  });
  // 추가 행 삭제
  bodyEl.addEventListener('click', function (e) {
    var rm = e.target.closest('.ssm-rm'); if (!rm) return;
    extra.splice(+rm.getAttribute('data-i'), 1);
    renderTable();
  });
  // From/To 입력 → 실시간 갱신
  if (fromEl) fromEl.addEventListener('input', renderTable);
  if (toEl) toEl.addEventListener('input', renderTable);

  // 팝업 칩 렌더(config 주도)
  if (popEl) {
    var chipsHost = popEl.querySelector('.ssm-chips');
    if (chipsHost) chipsHost.innerHTML = (CFG.multi || []).map(function (m, i) {
      return '<button class="ssm-chip" type="button" data-add="' + i + '">' + esc(m.label) + '</button>';
    }).join('');
  }

  renderTable();
})();
