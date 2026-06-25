/* bal-log — Application Log(BAL) 뷰어 체험 (CH35-L05). 타입(S/W/E) 필터로 SLG1처럼 조회. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var LOG = [
    { t: 'S', m: '야간 예매 정산 시작 (1,240건)', c: 'JHY 02:00:01' },
    { t: 'S', m: '공연 C-NOVA 정산 완료 (320건)', c: 'JHY 02:00:14' },
    { t: 'W', m: '공연 C-AURA — 환불 대기 5건 보류', c: 'JHY 02:00:31' },
    { t: 'E', m: '공연 C-WAVE — 좌석 합계 불일치(검증 실패)', c: 'JHY 02:00:47' },
    { t: 'S', m: '공연 C-ECHO 정산 완료 (210건)', c: 'JHY 02:01:02' },
    { t: 'E', m: '예매 1099 — 결제 정보 없음(재처리 대상)', c: 'JHY 02:01:09' },
    { t: 'S', m: '정산 종료 — 성공 1180 · 경고 5 · 오류 2', c: 'JHY 02:01:15' }
  ];
  var ICON = { S: '✓', W: '⚠', E: '✕' };
  var filter = 'ALL';
  function counts() { var c = { S: 0, W: 0, E: 0 }; LOG.forEach(function (l) { c[l.t]++; }); return c; }
  function render() {
    var c = counts();
    [].forEach.call(document.querySelectorAll('.fb'), function (b) {
      b.classList.toggle('on', b.dataset.f === filter);
      if (b.dataset.f !== 'ALL') b.querySelector('.n').textContent = '(' + c[b.dataset.f] + ')';
    });
    var rows = LOG.filter(function (l) { return filter === 'ALL' || l.t === filter; });
    $('logn').textContent = rows.length + ' / ' + LOG.length + '건';
    $('log').innerHTML = rows.length ? rows.map(function (l) {
      return '<div class="msg ' + l.t + '"><span class="ic">' + ICON[l.t] + '</span><span>' + l.m + '</span><span class="ctx">' + l.c + '</span></div>';
    }).join('') : '<div class="empty">해당 타입 메시지 없음.</div>';
    post();
  }
  [].forEach.call(document.querySelectorAll('.fb'), function (b) { b.addEventListener('click', function () { filter = b.dataset.f; render(); }); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
