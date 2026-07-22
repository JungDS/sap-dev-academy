/* atc-findings — ATC/Code Inspector 점검 체험 (CH35-L01).
   findings(P1 에러·P2 경고·P3 정보) → '수정 후 재검사'로 에러(P1) 해결 → 에러 0이면 이송 게이트 통과. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var F = [
    { p: 1, cat: '성능', m: 'SELECT in LOOP (ZBOOK_RPT) — FAE/JOIN으로(성능 분석과 튜닝 장)' },
    { p: 1, cat: '보안', m: '문자열 연결 SQL — SQL injection 위험(파라미터 바인딩으로)' },
    { p: 2, cat: '표준', m: 'Released API 외 비공개 객체 접근(RAP·ABAP Cloud 장)' },
    { p: 2, cat: '성능', m: '비키 조건 — 인덱스 검토(SQLM)' },
    { p: 3, cat: '문법', m: '미사용 변수 lv_tmp' }
  ];
  var fixed = false;
  function render() {
    var shown = F.map(function (f) { return { f: f, gone: fixed && f.p === 1 }; });
    $('list').innerHTML = shown.map(function (s) {
      return '<div class="f p' + s.f.p + (s.gone ? ' gone' : '') + '"><span class="p">P' + s.f.p + (s.f.p === 1 ? ' 에러' : s.f.p === 2 ? ' 경고' : ' 정보') + '</span><span class="cat">' + s.f.cat + '</span><span class="msg">' + s.f.m + (s.gone ? ' ✓ 해결' : '') + '</span></div>';
    }).join('');
    var errs = fixed ? 0 : F.filter(function (f) { return f.p === 1; }).length;
    var g = $('gate');
    if (errs > 0) { g.className = 'gate block'; g.textContent = '⛔ 이송 차단 (에러 ' + errs + ')'; }
    else { g.className = 'gate pass'; g.textContent = '✓ 게이트 통과 (에러 0)'; }
    post();
  }
  $('recheck').addEventListener('click', function () { fixed = true; render(); });
  $('reset').addEventListener('click', function () { fixed = false; render(); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
