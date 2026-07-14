/* concert-adv-sql-lab 엔진 — CH20 Advanced SQL 통합 실습(캡스톤).
   네 모드(CTE 잔여석 / EXISTS 예약공연 / EXCEPT 미예약공연 / Window 상세)의 SQL·결과표를 보여 주고,
   '조건 제거 실험'(status<>'C' 제거) 토글로 취소 예약이 결과를 어떻게 오염시키는지 비교한다.
   검증 패널: 예상 행 수 · 실제 행 수 · 업무 규칙 통과/실패.
   골격 계약(HTML 제공): #cslModes · #cslExp · #cslReset · #cslSql · #cslResult · #cslVerify · #cslFeedback.
   config: JSON <script id="concert-adv-sql-lab-cfg"> = { concerts, bookings, cancelStatus, modes:[{key,label,desc,cols,sql,explain,failMsg}] }.
   높이: 자체 post()(_autoheight 미사용). 색: 오직 var(--token). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cfg;
  try { cfg = JSON.parse($('concert-adv-sql-lab-cfg').textContent); }
  catch (e) { cfg = { concerts: [], bookings: [], cancelStatus: 'C', modes: [] }; }

  var CANCEL = cfg.cancelStatus || 'C';
  var state = { mode: 0, cancelExcluded: true, expectedRows: 0, actualRows: 0, rulePass: true };

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; });
  }
  function curMode() { return cfg.modes[state.mode]; }
  function nameOf(id) {
    for (var i = 0; i < cfg.concerts.length; i++) if (cfg.concerts[i].id === id) return cfg.concerts[i].name;
    return id;
  }

  /* ---- 예약 필터: 실험 OFF(기본)면 취소 예약 제외 ---- */
  function bookingsFor(excludeCancel) {
    return cfg.bookings.filter(function (b) { return excludeCancel ? b.status !== CANCEL : true; });
  }

  /* ---- 모드별 계산 (SQL이 하는 일을 자바스크립트로 재현) ---- */
  function compute(key, bks) {
    if (key === 'cte') {
      return cfg.concerts.map(function (c) {
        var booked = 0;
        bks.forEach(function (b) { if (b.concert === c.id) booked += b.qty; });
        return { id: c.id, seats: c.seats, booked: booked, remaining: c.seats - booked };
      });
    }
    if (key === 'exists') {
      return cfg.concerts.filter(function (c) {
        return bks.some(function (b) { return b.concert === c.id; });
      }).map(function (c) { return { id: c.id, name: c.name }; });
    }
    if (key === 'except') {
      var bookedIds = {};
      bks.forEach(function (b) { bookedIds[b.concert] = 1; });
      return cfg.concerts.filter(function (c) { return !bookedIds[c.id]; })
        .map(function (c) { return { id: c.id, name: c.name }; });
    }
    if (key === 'window') {
      var totals = {}, rn = {};
      bks.forEach(function (b) { totals[b.concert] = (totals[b.concert] || 0) + b.qty; });
      var byC = {};
      bks.forEach(function (b) { (byC[b.concert] = byC[b.concert] || []).push(b); });
      Object.keys(byC).forEach(function (c) {
        byC[c].sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
        byC[c].forEach(function (b, i) { rn[b.id] = i + 1; });
      });
      return bks.slice().sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; })
        .map(function (b) { return { id: b.id, concert: b.concert, qty: b.qty, total: totals[b.concert], rn: rn[b.id] }; });
    }
    return [];
  }

  /* ---- 실제 vs 예상 비교 ---- */
  function keyOf(key, row) { return key === 'window' ? row.id : row.id; }

  function diffInfo(key, actual, expected) {
    var expMap = {}, i;
    for (i = 0; i < expected.length; i++) expMap[keyOf(key, expected[i])] = expected[i];
    var actMap = {};
    for (i = 0; i < actual.length; i++) actMap[keyOf(key, actual[i])] = actual[i];

    var extra = [], missing = [], pass = true;
    // 추가된 행(실제엔 있는데 예상엔 없음)
    for (i = 0; i < actual.length; i++) {
      var k = keyOf(key, actual[i]);
      if (!expMap[k]) { extra.push(k); pass = false; }
    }
    // 누락된 행(예상엔 있는데 실제엔 없음)
    for (i = 0; i < expected.length; i++) {
      var ek = keyOf(key, expected[i]);
      if (!actMap[ek]) { missing.push(ek); pass = false; }
    }
    // CTE는 행 수가 늘 같으므로 값(예약/잔여) 오염을 따로 표시
    var valDiff = {};
    if (key === 'cte') {
      for (i = 0; i < actual.length; i++) {
        var a = actual[i], e = expMap[a.id];
        if (e && (a.booked !== e.booked || a.remaining !== e.remaining)) { valDiff[a.id] = 1; pass = false; }
      }
    }
    return { extra: extra, missing: missing, valDiff: valDiff, pass: pass };
  }

  /* ---- 렌더: 모드 버튼 ---- */
  function renderModes() {
    $('cslModes').innerHTML = cfg.modes.map(function (m, i) {
      return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === state.mode ? 'true' : 'false') + '">' +
        esc(m.label) + '</button>';
    }).join('');
  }

  /* ---- 렌더: SQL 요약 ---- */
  function renderSql() {
    var m = curMode();
    var html = m.sql.map(function (ln) {
      var cls = 'ln';
      var extra = '';
      if (ln.cond) {
        if (state.cancelExcluded) { cls += ' cond'; }
        else { cls += ' cond off'; extra = '  <span class="tag">← 실험: 이 조건 제거됨</span>'; }
      }
      return '<div class="' + cls + '">' + esc(ln.t) + extra + '</div>';
    }).join('');
    $('cslSql').innerHTML = '<div class="csl-cap">실행 SQL <small>' + esc(m.desc) + '</small></div>' +
      '<div class="csl-code">' + html + '</div>';
  }

  /* ---- 렌더: 결과 표 ---- */
  function renderResult(actual, dif) {
    var m = curMode();
    var head = '<tr>' + m.cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') + '</tr>';
    var body;
    if (!actual.length) {
      body = '<tr><td class="empty" colspan="' + m.cols.length + '">결과 행 없음</td></tr>';
    } else {
      body = actual.map(function (row) {
        var isExtra = dif.extra.indexOf(keyOf(m.key, row)) >= 0;
        var cells = m.cols.map(function (c) {
          var v = row[c.key];
          var cellCls = '';
          if (m.key === 'cte' && dif.valDiff[row.id] && (c.key === 'booked' || c.key === 'remaining')) cellCls = ' class="diff"';
          return '<td' + cellCls + '>' + esc(v) + '</td>';
        }).join('');
        return '<tr' + (isExtra ? ' class="extra"' : '') + '>' + cells + '</tr>';
      }).join('');
    }
    // 누락 행 안내(EXCEPT 등에서 사라진 공연)
    var missNote = '';
    if (dif.missing.length) {
      missNote = '<div class="csl-miss">빠진 행: ' +
        dif.missing.map(function (k) { return '<b>' + esc(k) + '</b>(' + esc(nameOf(k)) + ')'; }).join(', ') + '</div>';
    }
    $('cslResult').innerHTML = '<div class="csl-cap">결과 <small>' + actual.length + '행</small></div>' +
      '<div class="csl-tw"><table class="csl-table">' + head + body + '</table></div>' + missNote;
  }

  /* ---- 렌더: 검증 패널 ---- */
  function renderVerify() {
    var pass = state.rulePass;
    $('cslVerify').innerHTML =
      '<div class="stat"><span class="k">예상 행 수</span><span class="v">' + state.expectedRows + '</span></div>' +
      '<div class="stat"><span class="k">실제 행 수</span><span class="v">' + state.actualRows + '</span></div>' +
      '<div class="rule ' + (pass ? 'pass' : 'fail') + '">' + (pass ? '✓ 업무 규칙 통과' : '✕ 업무 규칙 실패') + '</div>';
  }

  /* ---- 렌더: 피드백 ---- */
  function renderFeedback(dif) {
    var m = curMode();
    if (state.cancelExcluded) {
      $('cslFeedback').className = 'csl-feedback ok';
      $('cslFeedback').innerHTML = '<b>정확합니다.</b> ' + esc(m.explain);
    } else {
      var same = (state.expectedRows === state.actualRows);
      var head = same
        ? '행 수(' + state.actualRows + ')는 그대로지만 <b>값이 취소 예약으로 오염</b>됐어요. '
        : '취소 예약이 섞여 결과 행이 <b>' + state.expectedRows + '행 → ' + state.actualRows + '행</b>으로 달라졌어요. ';
      $('cslFeedback').className = 'csl-feedback warn';
      $('cslFeedback').innerHTML = head + esc(m.failMsg);
    }
  }

  /* ---- 전체 렌더 ---- */
  function render() {
    var m = curMode();
    var actual = compute(m.key, bookingsFor(state.cancelExcluded));
    var expected = compute(m.key, bookingsFor(true));
    var dif = diffInfo(m.key, actual, expected);

    state.expectedRows = expected.length;
    state.actualRows = actual.length;
    state.rulePass = dif.pass;

    renderModes();
    renderSql();
    renderResult(actual, dif);
    renderVerify();
    renderFeedback(dif);

    $('cslExp').setAttribute('aria-pressed', state.cancelExcluded ? 'false' : 'true');
    $('cslExp').textContent = state.cancelExcluded ? "조건 제거 실험 (status <> 'C')" : "조건 복원 (status <> 'C')";
    post();
  }

  /* ---- 이벤트 ---- */
  $('cslModes').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    state.mode = +b.getAttribute('data-i'); render();
  });
  $('cslExp').addEventListener('click', function () { state.cancelExcluded = !state.cancelExcluded; render(); });
  $('cslReset').addEventListener('click', function () { state.mode = 0; state.cancelExcluded = true; render(); });

  /* ---- 높이 전달 ---- */
  function post() {
    try {
      if (document.documentElement.clientWidth < 60) return;
      var el = document.querySelector('.wrap');
      var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6;
      parent.postMessage({ sda: 'embed-height', h: h }, '*');
    } catch (e) {}
  }
  window.addEventListener('load', post);
  window.addEventListener('resize', post);

  render();
})();
