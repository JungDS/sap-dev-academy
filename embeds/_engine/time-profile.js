/* time-profile — SAT Hit List 시각 (CH32-L02). 코드 블록별 ABAP+DB 시간을 막대로, 총시간 내림차순. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var ROWS = [
    { nm: 'LOOP AT lt_book (집계)', abap: 1850, db: 40 },
    { nm: 'SELECT zconcert (반복)', abap: 60, db: 920 },
    { nm: 'SORT lt_result', abap: 210, db: 0 },
    { nm: 'cl_salv display', abap: 70, db: 10 }
  ];
  var max = Math.max.apply(null, ROWS.map(function (r) { return r.abap + r.db; }));
  ROWS.sort(function (a, b) { return (b.abap + b.db) - (a.abap + a.db); });
  function render() {
    $('rows').innerHTML = ROWS.map(function (r, i) {
      var tot = r.abap + r.db, w = tot / max * 100, abapW = r.abap / tot * 100, dbW = r.db / tot * 100;
      return '<div class="row ' + (i === 0 ? 'hot' : '') + '"><div class="top"><span class="nm">' + r.nm +
        ' <span class="net">ABAP ' + r.abap + ' · DB ' + r.db + '</span></span><span class="tot">' + tot.toLocaleString() + ' µs</span></div>' +
        '<div class="track" style="width:' + w.toFixed(1) + '%"><div class="ab" style="width:' + abapW + '%"></div><div class="db" style="width:' + dbW + '%"></div></div></div>';
    }).join('');
    post();
  }
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
