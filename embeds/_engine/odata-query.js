/* odata-query — OData $filter/$top/$skip → EntitySet 결과 체험 (CH34-L05).
   venue 필터 + top/skip → 결과 미리보기 + OData URL + 대응 SELECT 줄.
   사고 데모 2종: #nosort(정렬 끄기 → 페이지 이동마다 순서 셔플=중복/누락 위험),
   #nofilter(filter 미반영 → 조건 바꿔도 결과 불변). 정본: concert_id C001~·아티스트 이름 풀. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var DATA = [
    { id: 'C001', artist: '아이유', venue: '서울', cap: 5000 },
    { id: 'C002', artist: '수지', venue: '부산', cap: 3000 },
    { id: 'C003', artist: '유재석', venue: '대구', cap: 4000 },
    { id: 'C004', artist: '김연아', venue: '인천', cap: 6000 },
    { id: 'C005', artist: '차은우', venue: '서울', cap: 2000 }
  ];
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function run() {
    var venue = $('venue').value, top = Math.max(0, parseInt($('top').value, 10) || 0), skip = Math.max(0, parseInt($('skip').value, 10) || 0);
    var noSort = $('nosort') && $('nosort').checked;
    var noFilter = $('nofilter') && $('nofilter').checked;
    var rows = DATA.slice();
    if (noSort) shuffle(rows);                              // 정렬 없음 = 순서 미보장
    else rows.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    if (venue && !noFilter) rows = rows.filter(function (r) { return r.venue === venue; });
    var total = rows.length;
    rows = rows.slice(skip, top ? skip + top : undefined);
    var kw = function (s) { return '<span class="k">' + s + '</span>'; };
    var q = [];
    if (venue) q.push(kw('$filter') + "=Venue eq '" + venue + "'");
    if (top) q.push(kw('$top') + '=' + top);
    if (skip) q.push(kw('$skip') + '=' + skip);
    if (!noSort) q.push(kw('$orderby') + '=ConcertId');
    $('url').innerHTML = 'GET /sap/opu/odata/sap/ZCONCERT_SRV/ConcertSet?' + q.join('&amp;');
    if ($('sel')) {
      var lines = [];
      lines.push('SELECT concert_id, artist, venue, capacity FROM zconcert');
      lines.push((venue && !noFilter) ? '  WHERE venue IN @lr_venue        " ← $filter' : '  " (조건 없음' + (venue && noFilter ? ' — $filter를 매핑하지 않았다!' : '') + ')');
      lines.push(noSort ? '  " ORDER BY 없음 → 순서 미보장!' : '  ORDER BY concert_id             " ← $orderby(페이징 전제)');
      lines.push('  UP TO ' + (top || '(상한)') + ' ROWS OFFSET ' + skip + '.   " ← $top/$skip');
      $('sel').textContent = lines.join('\n');
    }
    var warn = [];
    if (noSort && skip) warn.push('정렬 없는 페이징 — 페이지마다 순서가 흔들려 중복/누락 위험!');
    if (venue && noFilter) warn.push('조건을 바꿔도 결과가 그대로 — filter를 WHERE로 매핑하지 않았다.');
    $('cnt').innerHTML = '결과 ' + rows.length + '건 (필터 후 ' + total + '건 중)' +
      (warn.length ? ' <span class="warn">⚠ ' + warn.join(' · ') + '</span>' : '');
    $('body').innerHTML = rows.length ? '<table><thead><tr><th>concert_id</th><th>artist</th><th>venue</th><th>capacity</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><td>' + r.id + '</td><td>' + r.artist + '</td><td>' + r.venue + '</td><td>' + r.cap + '</td></tr>'; }).join('') + '</tbody></table>'
      : '<div class="empty">조건에 맞는 행 없음.</div>';
    post();
  }
  ['venue', 'top', 'skip'].forEach(function (id) { $(id).addEventListener('input', run); });
  ['nosort', 'nofilter'].forEach(function (id) { if ($(id)) $(id).addEventListener('change', run); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  run();
})();
