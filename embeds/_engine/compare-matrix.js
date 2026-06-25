/* compare-matrix — 기법 비교 매트릭스(범용). 위젯 <script id="cm-cfg">: { cols:[..], rows:[{name, cells:[{v,r}], detail}] }.
   cells.r = hi|mid|lo 등급색. 행 이름 클릭 → 상세("언제 쓰나"). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cfg; try { cfg = JSON.parse($('cm-cfg').textContent); } catch (e) { cfg = { cols: [], rows: [] }; }
  function render() {
    $('thead').innerHTML = '<tr><th>기법</th>' + cfg.cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr>';
    $('tbody').innerHTML = cfg.rows.map(function (r, i) {
      return '<tr data-i="' + i + '"><td class="name">' + r.name + '</td>' + r.cells.map(function (c) {
        return '<td>' + (c.r ? '<span class="rate ' + c.r + '">' + c.v + '</span>' : c.v) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    [].forEach.call($('tbody').querySelectorAll('tr'), function (tr) {
      tr.querySelector('.name').addEventListener('click', function () { showDetail(+tr.dataset.i); });
    });
    post();
  }
  function showDetail(i) {
    [].forEach.call($('tbody').querySelectorAll('tr'), function (tr) { tr.classList.toggle('on', +tr.dataset.i === i); });
    var r = cfg.rows[i], box = $('detail');
    box.className = 'detail show';
    box.innerHTML = '<div class="t">' + r.name + ' — 언제?</div>' + r.detail;
    post();
  }
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
