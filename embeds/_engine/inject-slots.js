/* inject-slots — 표준 코드의 확장 자리에 내 코드를 끼우는 체험 (CH29 L01·L02).
   위젯 <script id="is-cfg">: { progName, lines:[{t:'std',x}|{t:'slot'}], slotLabel, my:[...], emptyMsg }.
   토글로 확장 ON/OFF → slot이 내 코드(초록) ↔ 비어 있음(주황). 표준 라인은 항상 그대로(변경 0). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cfg; try { cfg = JSON.parse($('is-cfg').textContent); } catch (e) { cfg = { lines: [], my: [] }; }
  var on = false;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function render() {
    $('prog').innerHTML = '<div class="prog__h">' + esc(cfg.progName || 'Standard Program') + '  <span style="opacity:.7">(표준 — 직접 수정 안 함)</span></div><div class="code" id="code"></div>';
    var html = '';
    cfg.lines.forEach(function (l) {
      if (l.t === 'std') { html += '<div class="ln std">' + esc(l.x) + '</div>'; return; }
      // slot
      html += '<div class="ln slotlbl">  * ↓ ' + esc(cfg.slotLabel || '확장 자리') + '</div>';
      if (on) cfg.my.forEach(function (m) { html += '<div class="ln my">' + esc(m) + '</div>'; });
      else html += '<div class="ln empty">  ' + esc(cfg.emptyMsg || '(비어 있음 — 표준 기본 동작)') + '</div>';
    });
    $('code').innerHTML = html;
    $('toggle').classList.toggle('on', on);
    $('swtxt').textContent = on ? '확장 적용: ON' : '확장 적용: OFF';
    post();
  }
  $('toggle').addEventListener('click', function () { on = !on; render(); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
