/* lock-mode-matrix — 잠금 모드 호환 체험 (CH25-L01).
   User A 보유 모드(E/S/X) × User B 요청 모드(E/S) → 허용/거절.
   호환 규칙: S+S만 동시 허용. E/X는 다른 어떤 잠금과도 충돌(다른 사용자 기준). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  // compat[held][req] = true(허용)/false(거절) — '다른 사용자'의 요청 기준
  var compat = { E: { E: false, S: false }, S: { E: false, S: true }, X: { E: false, S: false } };
  var NAME = { E: 'Exclusive(쓰기)', S: 'Shared(읽기)', X: 'eXclusive 비누적' };
  var held = 'E', req = 'E';

  function render() {
    [].forEach.call(document.querySelectorAll('.mode'), function (b) {
      b.classList.toggle('on', (b.dataset.grp === 'held' && b.dataset.m === held) || (b.dataset.grp === 'req' && b.dataset.m === req));
    });
    var ok = compat[held][req];
    var v = $('verdict');
    v.className = 'verdict ' + (ok ? 'ok' : 'no');
    v.innerHTML = (ok ? '✓ 허용' : '✕ 거절(foreign_lock)') +
      '<span class="sub">A가 <b>' + held + '</b>(' + NAME[held] + ') 보유 중 · B가 <b>' + req + '</b>(' + NAME[req] + ') 요청 → ' +
      (ok ? '둘 다 읽기(S)라 동시 OK.' : (held === 'S' ? 'S 보유 중엔 쓰기(E) 차단.' : (held === 'X' ? 'X는 같은 사용자도 중첩 불가 — 무조건 차단.' : '쓰기 잠금(E)이 잡혀 있어 차단.')) ) + '</span>';
    // 매트릭스 하이라이트
    [].forEach.call(document.querySelectorAll('#mtx td[data-cell]'), function (td) {
      td.classList.toggle('hi', td.dataset.cell === held + req);
    });
    post();
  }
  [].forEach.call(document.querySelectorAll('.mode'), function (b) {
    b.addEventListener('click', function () { if (b.dataset.grp === 'held') held = b.dataset.m; else req = b.dataset.m; render(); });
  });

  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
