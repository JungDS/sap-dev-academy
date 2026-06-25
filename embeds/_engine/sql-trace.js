/* sql-trace — SQL Trace/Monitor 결과 분석 체험 (CH32 L01·L03).
   위젯 <script id="trace-cfg">: { header, cols:[{k,label,num?}], rows:[...], worstKey, callout }.
   컬럼 헤더 클릭 → 그 컬럼 내림차순 정렬. worstKey 최대 행 강조. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cfg; try { cfg = JSON.parse($('trace-cfg').textContent); } catch (e) { cfg = { cols: [], rows: [] }; }
  var rows = cfg.rows.slice(), sortKey = cfg.worstKey, desc = true;
  var worstVal = Math.max.apply(null, cfg.rows.map(function (r) { return +r[cfg.worstKey] || 0; }));
  function render() {
    $('thead').innerHTML = '<tr>' + cfg.cols.map(function (c) {
      var ar = (c.k === sortKey) ? ' <span class="ar">' + (desc ? '▼' : '▲') + '</span>' : '';
      return '<th class="' + (c.num ? 'num' : '') + '" data-k="' + c.k + '">' + c.label + ar + '</th>';
    }).join('') + '</tr>';
    var sorted = rows.slice().sort(function (a, b) {
      var x = a[sortKey], y = b[sortKey];
      if (typeof x === 'number' || /^\d/.test(x)) { x = +x; y = +y; }
      return (x < y ? -1 : x > y ? 1 : 0) * (desc ? -1 : 1);
    });
    $('tbody').innerHTML = sorted.map(function (r) {
      var worst = (+r[cfg.worstKey] === worstVal);
      return '<tr class="' + (worst ? 'worst' : '') + '">' + cfg.cols.map(function (c) {
        var v = r[c.k]; if (c.num && typeof v === 'number') v = v.toLocaleString('en-US');
        return '<td class="' + (c.num ? 'num' : c.k === 'stmt' ? 'stmt' : '') + '">' + v + '</td>';
      }).join('') + '</tr>';
    }).join('');
    [].forEach.call($('thead').querySelectorAll('th'), function (th) {
      th.addEventListener('click', function () { var k = th.dataset.k; if (k === sortKey) desc = !desc; else { sortKey = k; desc = true; } render(); });
    });
    post();
  }
  if (cfg.callout) $('callout').innerHTML = cfg.callout;
  if (cfg.header) $('phead').textContent = cfg.header;
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
