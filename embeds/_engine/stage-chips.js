/* stage-chips — 단계/층 신호등 판별 체험(범용 · CH37 계열).
   cfg(#sc-cfg JSON): { chips:[이름들], scenarios:[{label, states:[ok|warn|bad|off ...], verdict, warn?}] }
   시나리오 버튼 클릭 → 칩들이 상태색으로 켜지고 판정문(#verdict)이 나온다.
   states 길이 = chips 길이. bad 칩이 "멈춘 단계". 사례·상태는 교육용 가상 예시. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cfg; try { cfg = JSON.parse($('sc-cfg').textContent); } catch (e) { cfg = { chips: [], scenarios: [] }; }
  var ICON = { ok: '✓', warn: '⚠', bad: '✕', off: '·' };
  // 칩 렌더
  $('chips').innerHTML = cfg.chips.map(function (c, i) {
    return '<span class="chip off" id="ch' + i + '"><i class="ic"></i>' + c + '</span>' +
           (i < cfg.chips.length - 1 ? '<span class="arrow">→</span>' : '');
  }).join('');
  // 시나리오 버튼
  $('cases').innerHTML = cfg.scenarios.map(function (s, i) {
    return '<button type="button" data-i="' + i + '">' + s.label + '</button>';
  }).join('');
  function show(i) {
    var s = cfg.scenarios[i];
    [].forEach.call($('cases').querySelectorAll('button'), function (b) { b.classList.toggle('on', +b.dataset.i === i); });
    s.states.forEach(function (st, k) {
      var el = $('ch' + k);
      el.className = 'chip ' + st;
      el.querySelector('.ic').textContent = ICON[st] || '';
    });
    var v = $('verdict');
    v.className = 'verdict show' + (s.warn ? ' warn' : '');
    v.innerHTML = s.verdict;
    post();
  }
  [].forEach.call($('cases').querySelectorAll('button'), function (b) {
    b.addEventListener('click', function () { show(+b.dataset.i); });
  });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  show(0);
})();
