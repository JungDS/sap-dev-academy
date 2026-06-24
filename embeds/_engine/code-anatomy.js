/* code-anatomy — 코드의 주요 부분(.mk[data-a])을 클릭해 설명을 보는 체험(범용).
   위젯 <script id="anno-cfg"> = { id: { t:제목, d:설명 } }. 같은 data-a는 함께 강조. */
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
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  post();
})();
