/* code-anatomy — 코드의 주요 부분(.mk[data-a])을 클릭해 설명을 보는 체험(범용).
   위젯 <script id="anno-cfg"> = { id: { t:제목, d:설명 } }. 같은 data-a는 함께 강조.
   확장: #bug-cfg JSON { bugs:[{c:코드조각, t:제목, d:왜 깨지나}] } — 오류 카드 클릭 → 해설(#bugOut). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var anno; try { anno = JSON.parse($('anno-cfg').textContent); } catch (e) { anno = {}; }
  function sel(id) {
    [].forEach.call(document.querySelectorAll('.mk'), function (m) { m.classList.toggle('on', m.dataset.a === id); });
    var a = anno[id], box = $('anno');
    box.className = 'anno show';
    box.innerHTML = '<div class="t">' + (a ? a.t : id) + '</div>' + (a ? a.d : '');
    post();
  }
  [].forEach.call(document.querySelectorAll('.mk'), function (m) { m.addEventListener('click', function () { sel(m.dataset.a); }); });
  // 오류 카드(선택 기능)
  (function () {
    var el = $('bug-cfg'); if (!el || !$('bugs')) return;
    var cfg; try { cfg = JSON.parse(el.textContent); } catch (e) { return; }
    var bugs = cfg.bugs || [];
    $('bugs').innerHTML = bugs.map(function (b, i) {
      return '<button class="bug" type="button" data-i="' + i + '"><code>' + b.c + '</code></button>';
    }).join('');
    [].forEach.call($('bugs').querySelectorAll('.bug'), function (btn) {
      btn.addEventListener('click', function () {
        [].forEach.call($('bugs').querySelectorAll('.bug'), function (x) { x.classList.toggle('on', x === btn); });
        var b = bugs[+btn.dataset.i], out = $('bugOut');
        out.className = 'anno show bad';
        out.innerHTML = '<div class="t">' + b.t + '</div>' + b.d;
        post();
      });
    });
  })();
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  post();
})();
