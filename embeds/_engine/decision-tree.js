/* decision-tree — 범용 의사결정 트리 엔진. Track2 공통.
   위젯 <script id="dt-cfg">: { start, nodes:{ id:{ q, opts:[{label, ic?, to?|result?}] } }, results:{ id:{ rank, title, desc, last? } } }.
   질문→선택→다음 노드 or 결과(추천). 경로(breadcrumb) 표시 + 처음부터. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cfg; try { cfg = JSON.parse($('dt-cfg').textContent); } catch (e) { cfg = { start: '', nodes: {}, results: {} }; }
  var cur = cfg.start, path = [];

  function renderPath() {
    $('path').innerHTML = path.map(function (p) { return '<span class="step">' + p + '</span>'; }).join('<span class="sep">›</span>');
  }
  function showNode(id) {
    cur = id; var n = cfg.nodes[id];
    renderPath();
    $('card').className = 'card';
    $('card').innerHTML = '<div class="q"><span class="n">Q.</span> ' + n.q + '</div><div class="opts">' +
      n.opts.map(function (o, i) { return '<button class="opt" data-i="' + i + '" type="button"><span class="ic">' + (o.ic || '▸') + '</span>' + o.label + '</button>'; }).join('') + '</div>';
    [].forEach.call($('card').querySelectorAll('.opt'), function (b) {
      b.addEventListener('click', function () {
        var o = n.opts[+b.dataset.i];
        path.push(o.label);
        if (o.result) showResult(o.result); else showNode(o.to);
      });
    });
    post();
  }
  function showResult(rid) {
    var r = cfg.results[rid];
    renderPath();
    $('card').className = 'dt-result';
    $('card').innerHTML = '<span class="rank' + (r.last ? ' last' : '') + '">' + r.rank + '</span>' +
      '<div class="rt' + (r.last ? ' last' : '') + '">' + r.title + '</div><div class="rd">' + r.desc + '</div>' +
      '<div class="btns"><button class="btn restart" id="restart" type="button">↺ 처음부터</button></div>';
    $('restart').addEventListener('click', start);
    post();
  }
  function start() { path = []; showNode(cfg.start); }
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  start();
})();
