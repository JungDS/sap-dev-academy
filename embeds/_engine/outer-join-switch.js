/* outer-join-switch 엔진 — INNER↔LEFT OUTER 토글로 기준 행 보존 차이를 보고, WHERE 오른쪽필터 함정을 확인.
   골격 계약: [data-mode="INNER"]/[data-mode="LEFT"] · [data-where] · #ojsBody · #ojsCheck · #ojsSql.
   config: window.OJS_CFG = { concerts:[{concert_id,artist}], bookings:[{booking_id,concert_id,seats,status}], whereField, whereVal }.
   높이: _autoheight.js. */
(function () {
  var CFG = window.OJS_CFG || { concerts: [], bookings: [], whereField: 'status', whereVal: 'N' };
  var mode = 'LEFT';
  var whereOn = false;
  var bodyEl = document.getElementById('ojsBody');
  var checkEl = document.getElementById('ojsCheck');
  var sqlEl = document.getElementById('ojsSql');
  var modeBtns = Array.prototype.slice.call(document.querySelectorAll('[data-mode]'));
  var whereBtn = document.querySelector('[data-where]');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function buildRows() {
    var rows = [];
    CFG.concerts.forEach(function (c) {
      var ms = CFG.bookings.filter(function (b) { return b.concert_id === c.concert_id; });
      if (ms.length) ms.forEach(function (b) {
        rows.push({ concert_id: c.concert_id, artist: c.artist, booking_id: b.booking_id, seats: b.seats, status: b.status, kind: 'match' });
      });
      else if (mode === 'LEFT') rows.push({ concert_id: c.concert_id, artist: c.artist, booking_id: '', seats: '', status: '', kind: 'left' });
    });
    if (whereOn) rows = rows.filter(function (r) { return r[CFG.whereField] === CFG.whereVal; });  // WHERE는 오른쪽 필드를 최종 결과에서 거른다
    return rows;
  }

  function renderSql() {
    var lj = mode === 'LEFT' ? '<span class="lj">LEFT OUTER JOIN</span>' : '<span class="kw">INNER JOIN</span>';
    var where = whereOn ? '\n  <span class="wh">WHERE</span> b~' + CFG.whereField + " = '" + CFG.whereVal + "'" : '';
    sqlEl.innerHTML =
      '<span class="kw">SELECT</span> c~concert_id c~artist b~booking_id b~seats\n' +
      '  <span class="kw">FROM</span> zconcert <span class="kw">AS</span> c\n' +
      '  ' + lj + ' zbooking <span class="kw">AS</span> b\n' +
      '    <span class="kw">ON</span> c~concert_id = b~concert_id' + where + '.';
  }

  function renderTable(rows) {
    bodyEl.innerHTML = rows.map(function (r) {
      var initCls = r.kind === 'left' ? ' init' : '';
      var bid = r.booking_id === '' ? '<span class="init">—</span>' : esc(r.booking_id);
      var seats = r.seats === '' ? '<span class="init">—</span>' : esc(r.seats);
      var reason = r.kind === 'left' ? 'LEFT 보존 (오른쪽 초기값)' : '매칭';
      return '<tr class="' + (r.kind === 'left' ? 'left' : '') + '">' +
        '<td>' + esc(r.concert_id) + '</td><td class="l">' + esc(r.artist) + '</td>' +
        '<td class="' + initCls.trim() + '">' + bid + '</td><td class="' + initCls.trim() + '">' + seats + '</td>' +
        '<td class="ojs-reason">' + reason + '</td></tr>';
    }).join('');
  }

  function renderCheck(rows) {
    var present = {};
    rows.forEach(function (r) { present[r.concert_id] = true; });
    var all = CFG.concerts.map(function (c) { return c.concert_id; });
    var missing = all.filter(function (id) { return !present[id]; });
    var c003 = all[all.length - 1];
    checkEl.className = 'ojs-check';
    if (mode === 'LEFT' && whereOn && missing.indexOf(c003) >= 0) {
      checkEl.classList.add('warn');
      checkEl.innerHTML = '⚠️ <b>LEFT인데도 ' + c003 + '이(가) 빠졌습니다.</b> WHERE <b>b~' + CFG.whereField + "='" + CFG.whereVal + "'</b>가 예매 없는 공연의 오른쪽 초기값(빈 " + CFG.whereField + ')을 걸러냈기 때문입니다. 오른쪽 조건은 ON에 두는 편이 안전합니다.';
    } else if (mode === 'LEFT') {
      checkEl.classList.add('ok');
      checkEl.innerHTML = '✅ <b>' + c003 + '도 결과에 남았습니다</b> — 왼쪽(기준) 공연을 보존했습니다. 오른쪽 값은 초기값(—)으로 보입니다.';
    } else {
      checkEl.innerHTML = 'ℹ️ INNER JOIN — 예매가 없는 ' + (missing.length ? missing.join(', ') : '공연') + '은(는) 짝이 없어 결과에서 빠집니다.';
    }
  }

  function render() {
    modeBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mode') === mode ? 'true' : 'false'); });
    if (whereBtn) whereBtn.setAttribute('aria-pressed', whereOn ? 'true' : 'false');
    var rows = buildRows();
    renderSql(); renderTable(rows); renderCheck(rows);
  }

  modeBtns.forEach(function (b) { b.addEventListener('click', function () { mode = b.getAttribute('data-mode'); render(); }); });
  if (whereBtn) whereBtn.addEventListener('click', function () { whereOn = !whereOn; render(); });

  render();
})();
