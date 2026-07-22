/* exists-vs-join 엔진 — 같은 데이터(zconcert·zbooking)에 INNER JOIN과 EXISTS를 각각 적용해
   '행 중복' 차이를 보여 준다. JOIN은 zbooking 행을 붙여 공연이 예약 건수만큼 늘고(중복),
   EXISTS는 '예약이 하나라도 있나'만 확인해 공연을 한 번씩만 돌려준다.
   '취소 조건 제거' 토글로 status<>'C' 필터를 켜고 꺼서 결과 변화를 관찰.
   골격 계약(HTML): .evj-src(원본 두 표) · .evj-modes(모드 버튼) · .evj-toggle(취소 토글)
     · .evj-query(SQL) · .evj-badges(상태 배지) · .evj-result(결과 표) · .evj-fb(피드백).
   config: window.EVJ_CFG = { concerts:[{id,title}], bookings:[{b,c,status}] }. 높이: 자체 post(). */
(function () {
  var CFG = window.EVJ_CFG || { concerts: [], bookings: [] };
  var concerts = CFG.concerts || [];
  var bookings = CFG.bookings || [];

  var mode = 'join';        // 'join' | 'exists'
  var removeCancel = false; // 토글: true면 status<>'C' 필터 제거

  var srcEl = document.querySelector('.evj-src');
  var modesEl = document.querySelector('.evj-modes');
  var toggleEl = document.querySelector('.evj-toggle');
  var queryEl = document.querySelector('.evj-query');
  var badgesEl = document.querySelector('.evj-badges');
  var resultEl = document.querySelector('.evj-result');
  var fbEl = document.querySelector('.evj-fb');

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }
  function titleOf(id) {
    for (var i = 0; i < concerts.length; i++) if (concerts[i].id === id) return concerts[i].title;
    return id;
  }
  // status<>'C' 필터를 반영해 특정 공연의 '살아있는' 예약만
  function liveBookings(cid) {
    return bookings.filter(function (b) {
      return b.c === cid && (removeCancel || b.status !== 'C');
    });
  }

  /* ---------- 원본 두 표(정적, cfg 주도) ---------- */
  function renderSrc() {
    var ch = '<table class="evj-t"><caption>zconcert (공연)</caption><thead><tr><th>concert_id</th><th>title</th></tr></thead><tbody>' +
      concerts.map(function (c) {
        return '<tr><td class="mono">' + esc(c.id) + '</td><td>' + esc(c.title) + '</td></tr>';
      }).join('') + '</tbody></table>';
    var bh = '<table class="evj-t"><caption>zbooking (예약)</caption><thead><tr><th>booking_id</th><th>concert_id</th><th>status</th></tr></thead><tbody>' +
      bookings.map(function (b) {
        var cancelled = b.status === 'C';
        return '<tr class="' + (cancelled ? 'cx' : '') + '"><td class="mono">' + esc(b.b) + '</td><td class="mono">' + esc(b.c) +
          '</td><td>' + (cancelled ? '<span class="tag bad">C 취소</span>' : '<span class="tag ok">N 정상</span>') + '</td></tr>';
      }).join('') + '</tbody></table>';
    srcEl.innerHTML = ch + bh;
  }

  /* ---------- 컨트롤 ---------- */
  function renderControls() {
    modesEl.innerHTML =
      '<button type="button" data-mode="join" aria-pressed="' + (mode === 'join') + '">JOIN 으로 조회</button>' +
      '<button type="button" data-mode="exists" aria-pressed="' + (mode === 'exists') + '">EXISTS 로 조회</button>';
    toggleEl.innerHTML =
      '<button type="button" data-toggle aria-pressed="' + removeCancel + '">' +
      '<span class="dot"></span>취소 조건 제거 <small>(status &lt;&gt; \'C\' 빼기)</small></button>';
  }

  /* ---------- SQL 표시 ---------- */
  function renderQuery() {
    var filter = removeCancel ? '' : true;
    var h;
    if (mode === 'join') {
      h = 'SELECT c~concert_id, c~title, b~booking_id\n' +
        '  FROM zconcert AS c\n' +
        '  INNER JOIN zbooking AS b\n' +
        '    ON b~concert_id = c~concert_id\n' +
        (filter ? '<em> WHERE b~status &lt;&gt; \'C\'</em>\n' : '') +
        '  INTO TABLE @gt_result.';
    } else {
      h = 'SELECT c~concert_id, c~title\n' +
        '  FROM zconcert AS c\n' +
        ' WHERE EXISTS ( SELECT * FROM zbooking\n' +
        '                 WHERE concert_id = c~concert_id' + (filter ? '\n<em>                   AND status &lt;&gt; \'C\'</em>' : '') + ' )\n' +
        '  INTO TABLE @gt_result.';
    }
    queryEl.innerHTML = '<span class="lbl">' + (mode === 'join' ? 'INNER JOIN' : 'EXISTS 서브쿼리') + '</span>' + h;
  }

  /* ---------- 결과 계산 ---------- */
  function joinRows() {
    var rows = [];
    concerts.forEach(function (c) {
      liveBookings(c.id).forEach(function (b) {
        rows.push({ id: c.id, title: c.title, booking: b.b, status: b.status });
      });
    });
    return rows;
  }
  function existsRows() {
    return concerts.filter(function (c) {
      return liveBookings(c.id).length > 0;
    }).map(function (c) { return { id: c.id, title: c.title }; });
  }

  function renderResult() {
    var rows, distinct = {}, dupCount = 0;
    if (mode === 'join') {
      rows = joinRows();
      rows.forEach(function (r) { distinct[r.id] = (distinct[r.id] || 0) + 1; });
      var keys = Object.keys(distinct);
      dupCount = rows.length - keys.length; // 공연 종류를 넘어선 추가 행 = 중복
      var body = rows.length ? rows.map(function (r) {
        var dup = distinct[r.id] > 1;
        return '<tr class="' + (dup ? 'dup' : '') + '"><td class="mono">' + esc(r.id) + '</td><td>' + esc(r.title) +
          '</td><td class="mono">' + esc(r.booking) + '</td></tr>';
      }).join('') : '<tr><td colspan="3" class="empty">조건에 맞는 행이 없습니다.</td></tr>';
      resultEl.innerHTML = '<table class="evj-t res"><caption>gt_result — JOIN 결과</caption>' +
        '<thead><tr><th>concert_id</th><th>title</th><th>booking_id</th></tr></thead><tbody>' + body + '</tbody></table>';
      renderBadges(keys.length, rows.length, dupCount);
      renderFb('join', keys.length, rows.length, dupCount);
    } else {
      rows = existsRows();
      var body2 = rows.length ? rows.map(function (r) {
        return '<tr class="keep"><td class="mono">' + esc(r.id) + '</td><td>' + esc(r.title) + '</td></tr>';
      }).join('') : '<tr><td colspan="2" class="empty">조건에 맞는 공연이 없습니다.</td></tr>';
      resultEl.innerHTML = '<table class="evj-t res"><caption>gt_result — EXISTS 결과</caption>' +
        '<thead><tr><th>concert_id</th><th>title</th></tr></thead><tbody>' + body2 + '</tbody></table>';
      renderBadges(rows.length, rows.length, 0);
      renderFb('exists', rows.length, rows.length, 0);
    }
  }

  function renderBadges(outerRows, totalRows, dup) {
    badgesEl.innerHTML =
      '<span class="badge"><b>' + outerRows + '</b> 공연 행 수</span>' +
      '<span class="badge"><b>' + totalRows + '</b> 전체 결과 행</span>' +
      '<span class="badge ' + (dup > 0 ? 'warn' : 'good') + '"><b>' + dup + '</b> 중복 행</span>';
  }

  function renderFb(kind, outer, total, dup) {
    var h = '';
    if (kind === 'join') {
      if (dup > 0) {
        h = '<div class="fb amber"><b>JOIN은 행을 "붙입니다".</b> zbooking의 예약 한 건마다 공연 행이 하나씩 더 생겨서, ' +
          '<b>' + esc(titleOf(dupOwner())) + '</b>이(가) 예약 건수만큼 <b>' + total + '행</b>으로 늘었습니다. ' +
          '공연 종류는 ' + outer + '개인데 결과는 ' + total + '행 — 이 차이(' + dup + '행)가 바로 <b>중복</b>입니다.</div>';
      } else {
        h = '<div class="fb amber">지금은 각 공연에 살아있는 예약이 최대 1건이라 중복이 안 보이지만, ' +
          'JOIN은 예약이 여러 건이면 그만큼 공연 행이 늘어나는 구조입니다.</div>';
      }
    } else {
      h = '<div class="fb good"><b>EXISTS는 "예약이 하나라도 있나?"만 확인합니다.</b> 조건이 맞으면 공연을 ' +
        '<b>딱 한 번</b>만 돌려주고, 예약이 없으면 탈락시켜요. 행을 붙이지 않으니 <b>중복이 0</b>입니다. ' +
        '지금 통과한 공연은 ' + outer + '개.</div>';
    }
    // 취소 토글의 효과를 한 줄 덧붙임
    h += '<div class="fb-sub">' + (removeCancel
      ? '취소 조건을 <b>뺐기</b> 때문에, 취소(C)만 있는 <b>ABAP Trio</b>도 "예약이 있는" 공연으로 잡힙니다.'
      : '취소 조건(<code>status &lt;&gt; \'C\'</code>)이 살아 있어서, 취소(C)만 있는 <b>ABAP Trio</b>는 결과에서 빠집니다.') + '</div>';
    fbEl.innerHTML = h;
  }
  // 중복을 만든 대표 공연 id (가장 많이 반복된 공연)
  function dupOwner() {
    var cnt = {}, best = concerts.length ? concerts[0].id : '', bestN = 0;
    joinRows().forEach(function (r) { cnt[r.id] = (cnt[r.id] || 0) + 1; if (cnt[r.id] > bestN) { bestN = cnt[r.id]; best = r.id; } });
    return best;
  }

  function render() {
    renderControls();
    renderQuery();
    renderResult();
    post();
  }

  modesEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]'); if (!b) return;
    mode = b.getAttribute('data-mode'); render();
  });
  toggleEl.addEventListener('click', function (e) {
    if (!e.target.closest('[data-toggle]')) return;
    removeCancel = !removeCancel; render();
  });

  function post() {
    try {
      var el = document.querySelector('.wrap');
      var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6;
      parent.postMessage({ sda: 'embed-height', h: h }, '*');
    } catch (e) {}
  }
  window.addEventListener('load', post);
  window.addEventListener('resize', post);

  renderSrc();
  render();
})();
