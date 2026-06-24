/* judge-quiz — 범용 2지선다 판별 퀴즈 엔진. Track2 공통.
   위젯의 <script type="application/json" id="quiz">에서 {labels:[A,B], items:[{q, a:0|1, why}]}를 읽는다.
   각 문항: 두 선택지 → 즉시 정/오 표시 + 해설, 상단 점수바 갱신, 끝나면 결과. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cfg; try { cfg = JSON.parse($('quiz').textContent); } catch (e) { cfg = { labels: ['O', 'X'], items: [] }; }
  var items = cfg.items || [], labels = cfg.labels || ['O', 'X'];
  var answered = 0, correct = 0;

  function build() {
    answered = 0; correct = 0;
    $('list').innerHTML = items.map(function (it, i) {
      return '<div class="q" id="q' + i + '"><div class="txt"><span class="n">Q' + (i + 1) + '</span> ' + it.q + '</div>' +
        '<div class="choices">' +
          '<button class="ch" data-q="' + i + '" data-c="0" type="button">' + labels[0] + '</button>' +
          '<button class="ch" data-q="' + i + '" data-c="1" type="button">' + labels[1] + '</button>' +
        '</div><div class="why" id="why' + i + '"></div></div>';
    }).join('');
    [].forEach.call(document.querySelectorAll('.ch'), function (b) { b.addEventListener('click', pick); });
    $('result').className = 'result';
    updateScore();
  }
  function pick(e) {
    var b = e.currentTarget, qi = +b.dataset.q, c = +b.dataset.c, it = items[qi];
    var box = $('q' + qi); if (box.classList.contains('done')) return;
    box.classList.add('done');
    var btns = box.querySelectorAll('.ch');
    btns.forEach(function (x) { x.disabled = true; });
    var ok = (c === it.a);
    b.classList.add(ok ? 'correct' : 'wrong');
    if (!ok) btns[it.a].classList.add('miss');
    var why = $('why' + qi); why.innerHTML = (ok ? '✓ 정답 — ' : '✕ 오답 — ') + it.why; why.classList.add('show');
    answered++; if (ok) correct++;
    updateScore();
    if (answered === items.length) finish();
  }
  function updateScore() {
    $('sv').textContent = correct + ' / ' + items.length;
    $('sbar').style.width = (items.length ? (answered / items.length * 100) : 0) + '%';
  }
  function finish() {
    var r = $('result'), pass = correct >= Math.ceil(items.length * 0.7);
    r.className = 'result show ' + (pass ? 'good' : 'mid');
    r.innerHTML = (pass ? '🎉 ' : '💪 ') + '<span>' + correct + '/' + items.length + ' 정답 — ' + (pass ? '잘 이해했어요!' : '해설을 다시 보고 복습해 보세요.') + '</span>' +
      '<button class="retry" id="retry" type="button">↺ 다시 풀기</button>';
    $('retry').addEventListener('click', build);
    post();
  }
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  new ResizeObserver(post).observe(document.body);
  build();
})();
