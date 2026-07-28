/* badi-socket — BAdI 플러그인 체험 (CH32-L03).
   표준이 BAdI 인터페이스(소켓)를 호출 → 구현(플러그)이 활성화돼 있으면 내 메서드 실행, 아니면 표준 기본.
   구현 on/off 토글 + '표준 실행'으로 호출 경로를 로그로 보여 준다.
   (선택) #fKR/#fUS 버튼이 있으면 filter 데모: 표준은 country='KR'로 호출 — 구현 filter가 US면 선택 자체가 안 됨. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var on = false, flt = 'KR';
  function render() {
    $('toggle').classList.toggle('on', on);
    $('swtxt').textContent = on ? '구현 활성화(SE19): ON' : '구현 활성화(SE19): OFF';
    var impl = $('implBox'); impl.classList.toggle('off', !on);
    $('implNm').textContent = on ? 'ZCL_MY_BADI_IMPL' + ($('fKR') ? ' [filter ' + flt + ']' : '') : '(구현 없음)';
    $('ar2').classList.toggle('dim', !on || (!!$('fKR') && flt !== 'KR'));
    if ($('fKR')) { $('fKR').classList.toggle('on', flt === 'KR'); $('fUS').classList.toggle('on', flt === 'US'); }
    post();
  }
  function log(rows) { $('log').innerHTML = rows.map(function (r) { return '<div class="ln"><span class="ev">' + r[0] + '</span> <span class="' + (r[2] || 'dim2') + '">' + r[1] + '</span></div>'; }).join(''); post(); }
  $('toggle').addEventListener('click', function () { on = !on; render(); });
  if ($('fKR')) {
    $('fKR').addEventListener('click', function () { flt = 'KR'; render(); });
    $('fUS').addEventListener('click', function () { flt = 'US'; render(); });
  }
  $('run').addEventListener('click', function () {
    var hasFlt = !!$('fKR');
    if (on && (!hasFlt || flt === 'KR')) log([
      ['GET BADI', 'lo_badi' + (hasFlt ? ' FILTERS country = \'KR\' (구현 filter 일치)' : '  (구현 ZCL_MY_BADI_IMPL 발견)'), 'dim2'],
      ['CALL BADI', 'lo_badi->check_booking( is_booking )', 'dim2'],
      ['→ 내 구현 실행', '대량 예매 검증: seats >= 8 → 추가 확인 요구', 'ok2']
    ]);
    else if (on) log([
      ['GET BADI', 'lo_badi FILTERS country = \'KR\'', 'dim2'],
      ['→ 구현 선택 안 됨', '구현은 켜져 있지만 filter가 US — 로직이 완벽해도 호출되지 않음!', 'no2'],
      ['→ 표준 기본', '추가 검증 없이 그대로 통과', 'dim2']
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
