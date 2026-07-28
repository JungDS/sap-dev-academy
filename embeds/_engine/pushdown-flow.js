/* pushdown-flow — Data-to-Code vs Code-to-Data 데이터 이동량 체험 (CH36-L01).
   끌어오기: DB가 100만 행을 ABAP으로 전송 → ABAP이 LOOP 집계 (전송 폭발).
   내려보내기: DB가 집계 → 결과 행만 전송 (가볍고 빠름).
   확장: #pf-cfg JSON { cards:[{label, rec, why}] } — 상황 카드 클릭 → 추천 수단(#cardOut). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var ROWS = 1000000, RESULT = 18;
  var mode = 'down';
  function render() {
    var down = (mode === 'down');
    $('bDown').classList.toggle('on', down); $('bUp').classList.toggle('on', !down);
    // 계산 위치
    $('dbCalc').className = 'calc ' + (down ? 'here' : 'idle');
    $('dbCalc').textContent = down ? '✓ 여기서 집계(GROUP BY)' : '행 전달만';
    $('abCalc').className = 'calc ' + (down ? 'idle' : 'here');
    $('abCalc').textContent = down ? '결과만 받음' : '✓ 여기서 LOOP 집계';
    // 전송량
    var sent = down ? RESULT : ROWS;
    var pipe = $('pipe'); pipe.className = 'pipe' + (down ? '' : ' heavy');
    $('pipeBar').style.width = (down ? (RESULT / ROWS * 100) : 100).toFixed(3) + '%';
    $('pipeLbl').textContent = 'DB → ABAP 전송: ' + sent.toLocaleString() + '행';
    var m = $('metric'); m.className = 'metric ' + (down ? 'good' : 'bad');
    if (down) m.innerHTML = '✓ <b>Code-to-Data</b> — DB가 집계해 결과 <b>' + RESULT + '행</b>만 전송. 네트워크·메모리 가볍고 빠름.';
    else m.innerHTML = '⚠ <b>Data-to-Code</b> — 원본 <b>' + ROWS.toLocaleString() + '행</b>을 전부 끌어와 ABAP에서 LOOP 집계. 전송·메모리 폭발.';
    post();
  }
  $('bDown').addEventListener('click', function () { mode = 'down'; render(); });
  $('bUp').addEventListener('click', function () { mode = 'up'; render(); });
  // 상황 카드(선택 기능): 카드 클릭 → 추천 수단·이유
  (function () {
    var el = $('pf-cfg'); if (!el || !$('cards')) return;
    var cfg; try { cfg = JSON.parse(el.textContent); } catch (e) { return; }
    var cards = cfg.cards || [];
    $('cards').innerHTML = cards.map(function (c, i) {
      return '<button class="card" type="button" data-i="' + i + '">' + c.label + '</button>';
    }).join('');
    [].forEach.call($('cards').querySelectorAll('.card'), function (b) {
      b.addEventListener('click', function () {
        [].forEach.call($('cards').querySelectorAll('.card'), function (x) { x.classList.toggle('on', x === b); });
        var c = cards[+b.dataset.i], out = $('cardOut');
        out.className = 'card-out show';
        out.innerHTML = '<b>추천: ' + c.rec + '</b> — ' + c.why;
        post();
      });
    });
  })();
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
