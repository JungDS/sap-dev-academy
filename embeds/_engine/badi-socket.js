/* badi-socket — BAdI 플러그인 체험 (CH32-L03).
   표준이 BAdI 인터페이스(소켓)를 호출 → 구현(플러그)이 활성화돼 있으면 내 메서드 실행, 아니면 표준 기본.
   구현 on/off 토글 + '표준 실행'으로 호출 경로를 로그로 보여 준다. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var on = false;
  function render() {
    $('toggle').classList.toggle('on', on);
    $('swtxt').textContent = on ? '구현 활성화(SE19): ON' : '구현 활성화(SE19): OFF';
    var impl = $('implBox'); impl.classList.toggle('off', !on);
    $('implNm').textContent = on ? 'ZCL_MY_BADI_IMPL' : '(구현 없음)';
    $('ar2').classList.toggle('dim', !on);
    post();
  }
  function log(rows) { $('log').innerHTML = rows.map(function (r) { return '<div class="ln"><span class="ev">' + r[0] + '</span> <span class="' + (r[2] || 'dim2') + '">' + r[1] + '</span></div>'; }).join(''); post(); }
  $('toggle').addEventListener('click', function () { on = !on; render(); });
  $('run').addEventListener('click', function () {
    if (on) log([
      ['GET BADI', 'lo_badi  (구현 ZCL_MY_BADI_IMPL 발견)', 'dim2'],
      ['CALL BADI', 'lo_badi->check_booking( is_booking )', 'dim2'],
      ['→ 내 구현 실행', '정원 검증: 잔여석 < 요청 → 예매 거부', 'ok2']
    ]);
    else log([
      ['GET BADI', 'lo_badi  (활성 구현 없음)', 'dim2'],
      ['CALL BADI', 'check_booking — 호출되지만 빈 동작', 'dim2'],
      ['→ 표준 기본', '추가 검증 없이 그대로 통과', 'dim2']
    ]);
  });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
