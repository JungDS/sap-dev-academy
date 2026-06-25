/* odata-query — OData $filter/$top/$skip → EntitySet 결과 체험 (CH31-L05).
   venue 필터 + top/skip → 결과 미리보기 + OData URL. GET_ENTITYSET이 이 쿼리를 SELECT로 매핑함을 보여 준다. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var DATA = [
    { id: 'C-AURA', artist: '손흥민토크', venue: '부산', cap: 3000 },
    { id: 'C-ECHO', artist: '유재석쇼', venue: '대구', cap: 4000 },
    { id: 'C-GLOW', artist: '아이유', venue: '인천', cap: 6000 },
    { id: 'C-NOVA', artist: '아이유', venue: '서울', cap: 5000 },
    { id: 'C-WAVE', artist: '정훈영밴드', venue: '서울', cap: 2000 }
  ];
  function run() {
    var venue = $('venue').value, top = Math.max(0, parseInt($('top').value, 10) || 0), skip = Math.max(0, parseInt($('skip').value, 10) || 0);
    var rows = DATA.slice().sort(function (a, b) { return a.id < b.id ? -1 : 1; });   // $orderby id
    if (venue) rows = rows.filter(function (r) { return r.venue === venue; });
    var total = rows.length;
    rows = rows.slice(skip, top ? skip + top : undefined);
    var kw = function (s) { return '<span class="k">' + s + '</span>'; };
    var q = [];
    if (venue) q.push(kw('$filter') + "=venue eq '" + venue + "'");
    if (top) q.push(kw('$top') + '=' + top);
    if (skip) q.push(kw('$skip') + '=' + skip);
    q.push(kw('$orderby') + '=concert_id');
    $('url').innerHTML = 'GET /sap/opu/odata/sap/ZCONCERT_SRV/ConcertSet?' + q.join('&amp;');
    $('cnt').textContent = '결과 ' + rows.length + '건 (필터 후 ' + total + '건 중)';
    $('body').innerHTML = rows.length ? '<table><thead><tr><th>concert_id</th><th>artist</th><th>venue</th><th>capacity</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><td>' + r.id + '</td><td>' + r.artist + '</td><td>' + r.venue + '</td><td>' + r.cap + '</td></tr>'; }).join('') + '</tbody></table>'
      : '<div class="empty">조건에 맞는 행 없음.</div>';
    post();
  }
  ['venue', 'top', 'skip'].forEach(function (id) { $(id).addEventListener('input', run); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  run();
})();
