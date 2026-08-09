/* range-row-builder 엔진 — 조건 카드 클릭 → Range Table 4칸 행(SIGN/OPTION/LOW/HIGH) 추가 + 사람말 해석.
   골격 계약: .rrb-cards(빈 컨테이너) · #rrbFb · #rrbBody(tbody) · #rrbSay · [data-clear].
   config: window.RRB_CFG = { cards:[{label, ic?, so?, fld?, row:{sign,opt,low,high}, fb}] }.
     so  = 이 조건이 붙는 대상(필드 이름 또는 Range Table 이름) · fld = 괄호 부연(선택).
     so를 주면 '대상' 열이 켜지고 해석도 **대상별로 나눠** 보여 준다 — 서로 다른 필드 조건을
     한 표에 섞어 OR로 읽는 오개념 방지. (게이팅에 따라 so에 필드 이름만 넣어도 된다.)
   높이: _autoheight.js가 MutationObserver로 처리(이 엔진은 postHeight 안 함). */
(function () {
  var CFG = window.RRB_CFG || { cards: [] };
  var rows = [];
  var cardsEl = document.querySelector('.rrb-cards');
  var bodyEl = document.getElementById('rrbBody');
  var fbEl = document.getElementById('rrbFb');
  var sayEl = document.getElementById('rrbSay');

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  function optSay(r) {
    if (r.opt === 'EQ') return esc(r.low) + '과(와) 같음';
    if (r.opt === 'BT') return esc(r.low) + '부터 ' + esc(r.high) + '까지';
    if (r.opt === 'CP') return esc(r.low) + ' 패턴과 일치';
    return esc(r.low);
  }
  function rowSay(r) {
    return (r.sign === 'I' ? '포함' : '제외') + ' · ' + optSay(r);
  }

  function renderCards() {
    if (!cardsEl) return;
    cardsEl.innerHTML = CFG.cards.map(function (c, i) {
      return '<button class="rrb-card" type="button" data-i="' + i + '">' +
        (c.ic ? '<span class="ic">' + c.ic + '</span>' : '') +
        '<span>' + esc(c.label) + '</span></button>';
    }).join('');
  }

  var useSo = (CFG.cards || []).some(function (c) { return c.so; });

  function renderTable() {
    if (!rows.length) {
      bodyEl.innerHTML = '<tr><td colspan="' + (useSo ? 7 : 6) + '" class="rrb-none">← 카드를 눌러 조건 행을 쌓아 보세요.</td></tr>';
    } else {
      bodyEl.innerHTML = rows.map(function (r, i) {
        var sc = r.sign === 'I' ? 'sign-i' : 'sign-e';
        var high = r.high ? esc(r.high) : '<span class="empty">—</span>';
        return '<tr>' +
          (useSo ? '<td class="rrb-so"><code>' + esc(r.so || '—') + '</code></td>' : '') +
          '<td class="' + sc + '">' + r.sign + '</td>' +
          '<td>' + r.opt + '</td>' +
          '<td>' + esc(r.low) + '</td>' +
          '<td>' + high + '</td>' +
          '<td class="say">' + rowSay(r) + '</td>' +
          '<td><button class="rrb-rm" type="button" data-i="' + i + '" title="삭제">×</button></td>' +
          '</tr>';
      }).join('');
    }
    renderSay();
  }

  function renderSay() {
    if (!rows.length) {
      sayEl.innerHTML = '<b>해석</b> — 아직 조건이 없습니다. 빈 Range Table은 "조건을 걸지 않음"으로 동작합니다(전체 통과).';
      return;
    }
    // 필드(=Range Table)별로 나눠 읽는다. 서로 다른 필드 조건을 한 덩어리로 읽으면
    // "공연 C001 또는 고객명 정*" 같은 성립하지 않는 OR가 만들어진다.
    var order = [], groups = {};
    rows.forEach(function (r) {
      var k = r.so || '조건';
      if (!groups[k]) { groups[k] = []; order.push(k); }
      groups[k].push(r);
    });
    var body = order.map(function (k) {
      var g = groups[k];
      var inc = g.filter(function (r) { return r.sign === 'I'; });
      var exc = g.filter(function (r) { return r.sign === 'E'; });
      var parts = [];
      if (inc.length) parts.push('<span class="inc">포함</span>: ' + inc.map(optSay).join(', '));
      if (exc.length) parts.push('<span class="exc">제외</span>: ' + exc.map(optSay).join(', '));
      var rule = inc.length > 1 ? ' 포함 조건이 여러 개라 <b>하나라도</b> 맞으면 후보(OR).' : '';
      if (exc.length) rule += ' 제외 조건에 걸리면 후보에서 빠집니다.';
      var head = useSo ? '<code>' + esc(k) + '</code>' + (g[0].fld ? ' <small>(' + esc(g[0].fld) + ')</small>' : '') + ' — ' : '';
      return '<div class="rrb-say__g">' + head + parts.join(' &nbsp;/&nbsp; ') + '.' + rule + '</div>';
    }).join('');
    var multi = order.length > 1
      ? '<div class="rrb-say__multi">⚠️ 지금 <b>' + order.length + '개 필드</b>의 조건이 쌓였다. 필드마다 <b>Range Table이 따로</b> 있고, ' +
        '서로 다른 필드끼리는 OR가 아니라 <b>둘 다 만족(AND)</b>으로 묶인다. 위 표는 한자리에 모아 보여 줄 뿐이다.</div>'
      : '';
    sayEl.innerHTML = '<b>해석</b>' + body + multi;
  }

  function flash(msg) { fbEl.textContent = msg || ''; }

  if (cardsEl) cardsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.rrb-card'); if (!btn) return;
    var c = CFG.cards[+btn.getAttribute('data-i')]; if (!c) return;
    rows.push(Object.assign({ so: c.so, fld: c.fld }, c.row));
    flash(c.fb);
    renderTable();
  });
  bodyEl.addEventListener('click', function (e) {
    var rm = e.target.closest('.rrb-rm'); if (!rm) return;
    rows.splice(+rm.getAttribute('data-i'), 1);
    flash('');
    renderTable();
  });
  var clr = document.querySelector('[data-clear]');
  if (clr) clr.addEventListener('click', function () { rows = []; flash(''); renderTable(); });

  renderCards();
  renderTable();
})();
