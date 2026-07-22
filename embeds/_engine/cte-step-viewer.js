/* cte-step-viewer 엔진 — CTE(WITH …)를 4단계로 진행하며 각 단계의 중간 표를 렌더한다.
   ① 원본 zbooking → ② +booked CTE(공연별 예약 합계, 취소 status='C' 제외) → ③ zconcert LEFT OUTER JOIN +booked → ④ 잔여석 = capacity - coalesce(booked,0).
   토글: '취소 예약 포함'(합계가 틀어지며 경고) · '예약 없는 공연 강조'(C003). 배지: cteRows·joinRows·cancelIncluded.
   골격 계약(HTML 제공): #cteBadges · #cteToggles · #cteSteps · #cteNav · #cteBody.
   config = <script id="cte-step-viewer-cfg"> { zbooking:[{booking_id,concert_id,seats,status}], zconcert:[{concert_id,title,capacity}] }.
   엔진에 레슨 데이터 하드코딩 없음(전부 cfg에서 계산). 높이: 자체 post(). 게이팅: CH20 Advanced SQL(CTE/JOIN/COALESCE)만. */
(function () {
  var cfg;
  try { cfg = JSON.parse(document.getElementById('cte-step-viewer-cfg').textContent); }
  catch (e) { cfg = { zbooking: [], zconcert: [] }; }
  var zbk = cfg.zbooking || [], zct = cfg.zconcert || [];

  var step = 1;               // 1..4
  var cancelIncluded = false; // 취소(status='C') 예약을 합계에 포함할지
  var showEmpty = false;      // 예약 없는 공연(C003) 강조

  var badgesEl = document.getElementById('cteBadges');
  var togglesEl = document.getElementById('cteToggles');
  var stepsEl = document.getElementById('cteSteps');
  var navEl = document.getElementById('cteNav');
  var bodyEl = document.getElementById('cteBody');

  var STEP_META = [
    { n: 1, label: '① 원본' },
    { n: 2, label: '② 예약 합계' },
    { n: 3, label: '③ 공연과 조인' },
    { n: 4, label: '④ 잔여석' }
  ];

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; });
  }

  // 취소가 하나라도 있는 공연 집합
  var cancelSet = {};
  zbk.forEach(function (b) { if (b.status === 'C') cancelSet[b.concert_id] = true; });

  // 공연별 예약 합계(취소 제외/포함은 cancelIncluded에 따라)
  function bookedMap() {
    var m = {};
    zbk.forEach(function (b) {
      if (!cancelIncluded && b.status === 'C') return;
      m[b.concert_id] = (m[b.concert_id] || 0) + b.seats;
    });
    return m;
  }
  function cteRowsData() {
    var m = bookedMap();
    return Object.keys(m).map(function (k) { return { concert_id: k, booked: m[k] }; });
  }
  function joinRowsData() {
    var m = bookedMap();
    return zct.map(function (c) {
      var has = Object.prototype.hasOwnProperty.call(m, c.concert_id);
      return { concert_id: c.concert_id, title: c.title, capacity: c.capacity, booked: has ? m[c.concert_id] : null };
    });
  }

  // ---- 표 렌더 ----
  function tableHtml(cols, rows, rowClass) {
    var h = '<table class="cte-tbl"><thead><tr>';
    cols.forEach(function (c) { h += '<th>' + esc(c.label) + '</th>'; });
    h += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      var rc = rowClass ? rowClass(r) : '';
      h += '<tr' + (rc ? ' class="' + rc + '"' : '') + '>';
      cols.forEach(function (c) {
        var v = c.render ? c.render(r) : esc(r[c.key]);
        var cc = c.cellClass ? c.cellClass(r) : (c.cls || '');
        h += '<td' + (cc ? ' class="' + cc + '"' : '') + '>' + v + '</td>';
      });
      h += '</tr>';
    });
    return h + '</tbody></table>';
  }

  // ---- SQL 렌더 (줄 배열: {t, cls?}) ----
  function sqlHtml(lines) {
    return '<pre class="cte-sql"><code>' + lines.map(function (l) {
      var t = esc(l.t);
      if (l.cls === 'strike') return '<span class="sl-strike">' + t + '</span>';
      if (l.cls === 'hi') return '<span class="sl-hi">' + t + '</span>';
      return t;
    }).join('\n') + '</code></pre>';
  }

  function warnHtml() {
    if (!cancelIncluded || step < 2) return '';
    return '<div class="cte-warn">⚠️ <b>업무 조건이 합계 단계에서 빠졌습니다.</b> 취소된 예약(1석)이 <code>+booked</code> 합계에 들어갔어요. <code>WHERE status &lt;&gt; \'C\'</code>는 반드시 CTE 정의 안에서 걸러야 합니다.</div>';
  }

  // ---- 단계별 본문 ----
  function bodyStep1() {
    var cols = [
      { key: 'booking_id', label: '예약번호' },
      { key: 'concert_id', label: '공연' },
      { key: 'seats', label: '좌석' },
      { key: 'status', label: '상태', render: function (r) { return r.status === 'C' ? '취소 (C)' : '정상 (N)'; } }
    ];
    var sql = sqlHtml([
      { t: 'SELECT booking_id, concert_id,' },
      { t: '       seats, status' },
      { t: '  FROM zbooking' },
      { t: '  INTO TABLE @DATA(lt_book).' }
    ]);
    var tbl = tableHtml(cols, zbk, function (r) { return r.status === 'C' ? 'cancel' : ''; });
    var fb = '<div class="cte-fb">출발점은 예약 원본 <b>4건</b>입니다. <b>B003</b>은 <b>취소(status = \'C\')</b>예요(빨간 줄). 이 취소 좌석을 합계에서 빼는 게 이번 CTE의 핵심입니다.</div>';
    return sql + '<p class="cte-cap">중간 결과 · zbooking</p>' + tbl + fb;
  }

  function bodyStep2() {
    var rows = cteRowsData();
    var cols = [
      { key: 'concert_id', label: '공연' },
      { key: 'booked', label: 'booked (합계)', cellClass: function () { return 'num-good'; } }
    ];
    var sql = sqlHtml([
      { t: 'WITH' },
      { t: '  +booked AS (' },
      { t: '    SELECT concert_id,' },
      { t: '           SUM( seats ) AS booked' },
      { t: '      FROM zbooking' },
      { t: "      WHERE status <> 'C'", cls: cancelIncluded ? 'strike' : 'hi' },
      { t: '      GROUP BY concert_id )' }
    ]);
    var tbl = tableHtml(cols, rows, function (r) { return (cancelIncluded && cancelSet[r.concert_id]) ? 'warn' : ''; });
    var fb;
    if (cancelIncluded) {
      fb = '<div class="cte-fb">취소 필터가 빠지자 <b>C001 = 2 + 3 + 1 = 6석</b>이 됐어요. 취소한 1석까지 더해진 <b>잘못된 합계</b>입니다(주황 줄). 합계 단계에서 조건을 놓치면 이후 모든 계산이 틀어집니다.</div>';
    } else {
      fb = '<div class="cte-fb good"><code>+booked</code>는 <b>이름 붙인 중간 표</b>예요. 취소를 뺀 좌석 합계: <b>C001 = 2 + 3 = 5</b>, <b>C002 = 4</b>. 예약이 하나도 없는 <b>C003은 이 표에 아예 없습니다</b>(합계 낼 예약이 없으니까). 이 빈자리는 ③에서 다룹니다.</div>';
    }
    return sql + '<p class="cte-cap">중간 결과 · +booked (CTE)</p>' + tbl + fb;
  }

  function bodyStep3() {
    var rows = joinRowsData();
    var cols = [
      { key: 'concert_id', label: '공연' },
      { key: 'title', label: '제목', cls: 'txt' },
      { key: 'capacity', label: '정원' },
      { key: 'booked', label: 'booked', render: function (r) { return r.booked === null ? '∅ NULL' : esc(r.booked); }, cellClass: function (r) { return r.booked === null ? 'nullv' : ''; } }
    ];
    var sql = sqlHtml([
      { t: 'SELECT c~concert_id, c~title,' },
      { t: '       c~capacity, b~booked' },
      { t: '  FROM zconcert AS c' },
      { t: '  LEFT OUTER JOIN +booked AS b' },
      { t: '    ON c~concert_id = b~concert_id' }
    ]);
    var tbl = tableHtml(cols, rows, function (r) { return (showEmpty && r.booked === null) ? 'empty' : ''; });
    var fb = '<div class="cte-fb"><b>LEFT OUTER JOIN</b>이라 왼쪽 <code>zconcert</code>의 공연 <b>3개가 모두 남습니다</b>. 예약이 없는 <b>C003</b>은 짝이 없어 <code>booked</code>가 <b>NULL(빈 값)</b>이에요. 만약 <code>INNER JOIN</code>이었다면 C003은 결과에서 사라졌을 겁니다.</div>';
    if (showEmpty) fb += '<div class="cte-fb good" style="margin-top:6px">강조된 <b>C003</b>이 바로 "예약 없이도 살아남은" 행입니다.</div>';
    return sql + '<p class="cte-cap">중간 결과 · LEFT OUTER JOIN</p>' + tbl + fb;
  }

  function bodyStep4() {
    var rows = joinRowsData().map(function (r) {
      var bk = r.booked === null ? 0 : r.booked;
      return { concert_id: r.concert_id, title: r.title, capacity: r.capacity, booked: bk, wasNull: r.booked === null, seats_left: r.capacity - bk };
    });
    var cols = [
      { key: 'title', label: '공연', cls: 'txt' },
      { key: 'capacity', label: '정원' },
      { key: 'booked', label: 'coalesce(booked,0)', cellClass: function (r) { return r.wasNull ? 'nullv' : ''; } },
      { key: 'seats_left', label: '잔여석', cellClass: function () { return 'num-good'; } }
    ];
    var sql = sqlHtml([
      { t: 'SELECT c~title, c~capacity,' },
      { t: '       coalesce( b~booked, 0 ) AS booked,', cls: 'hi' },
      { t: '       c~capacity -' },
      { t: '         coalesce( b~booked, 0 ) AS seats_left' },
      { t: '  FROM zconcert AS c' },
      { t: '  LEFT OUTER JOIN +booked AS b' },
      { t: '    ON c~concert_id = b~concert_id' }
    ]);
    var tbl = tableHtml(cols, rows, function (r) { return (showEmpty && r.wasNull) ? 'empty' : ''; });
    var fb = '<div class="cte-fb good"><code>coalesce( b~booked, 0 )</code>가 <b>NULL을 0으로</b> 바꿔 줍니다. 그래서 <b>C003의 잔여석 = 50 - 0 = 50</b>. NULL을 그대로 빼면 결과도 NULL이 돼서 좌석 수가 통째로 사라져요. 최종 잔여석은 <b>C001 = ' + rows[0].seats_left + '</b>, <b>C002 = ' + rows[1].seats_left + '</b>, <b>C003 = ' + rows[2].seats_left + '</b>.</div>';
    return sql + '<p class="cte-cap">최종 결과 · 잔여석</p>' + tbl + fb;
  }

  var BODY = { 1: bodyStep1, 2: bodyStep2, 3: bodyStep3, 4: bodyStep4 };

  // ---- 렌더 ----
  function renderBadges() {
    var cteRows = cteRowsData().length;
    var joinRows = joinRowsData().length;
    badgesEl.innerHTML =
      '<span class="cte-badge">cteRows<b>' + cteRows + '</b></span>' +
      '<span class="cte-badge">joinRows<b>' + joinRows + '</b></span>' +
      '<span class="cte-badge ' + (cancelIncluded ? 'bad' : 'good') + '">cancelIncluded<b>' + (cancelIncluded ? 'true' : 'false') + '</b></span>';
  }
  function renderToggles() {
    togglesEl.innerHTML =
      '<button type="button" class="warnable" data-tog="cancel" aria-pressed="' + (cancelIncluded ? 'true' : 'false') + '"><span class="dot"></span>취소 예약 포함</button>' +
      '<button type="button" data-tog="empty" aria-pressed="' + (showEmpty ? 'true' : 'false') + '"><span class="dot"></span>예약 없는 공연 강조</button>';
  }
  function renderSteps() {
    var h = '';
    STEP_META.forEach(function (s, i) {
      if (i) h += '<span class="arrow">›</span>';
      h += '<button type="button" class="st" data-step="' + s.n + '" aria-pressed="' + (s.n === step ? 'true' : 'false') + '">' + s.label + '</button>';
    });
    stepsEl.innerHTML = h;
  }
  function renderNav() {
    navEl.innerHTML =
      '<button type="button" data-nav="-1"' + (step === 1 ? ' disabled' : '') + '>◀ 이전</button>' +
      '<button type="button" data-nav="1"' + (step === 4 ? ' disabled' : '') + '>다음 단계 ▶</button>';
  }
  function renderBody() {
    bodyEl.innerHTML = warnHtml() + BODY[step]();
  }
  function render() {
    renderBadges(); renderToggles(); renderSteps(); renderNav(); renderBody(); post();
  }

  // ---- 이벤트 ----
  togglesEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tog]'); if (!b) return;
    if (b.getAttribute('data-tog') === 'cancel') cancelIncluded = !cancelIncluded;
    else showEmpty = !showEmpty;
    render();
  });
  stepsEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-step]'); if (!b) return;
    step = +b.getAttribute('data-step'); render();
  });
  navEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-nav]'); if (!b) return;
    step = Math.min(4, Math.max(1, step + (+b.getAttribute('data-nav')))); render();
  });

  // ---- 높이 ----
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
