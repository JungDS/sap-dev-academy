/* select-in-loop — SELECT in LOOP 안티패턴 vs 사전 조회 체험 (CH35-L04).
   N 슬라이더(0 포함) → ❌ 1+N회 왕복 / ✅ FAE·JOIN = 2회. distinct key 수 표시.
   #guard 체크박스: N=0에서 guard OFF면 "빈 driver 전체 조회" 사고 경고(공식 FAE 함정). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var STEPS = [0, 10, 50, 100, 500, 1000, 5000, 10000];
  var PER = 0.8;   // 왕복 1회당 ms(개념값)
  function render() {
    var n = STEPS[+$('n').value];
    $('nv').textContent = n.toLocaleString() + ' 건';
    var before = 1 + n, after = 2;
    var tb = before * PER, ta = after * PER;
    $('bCalls').textContent = before.toLocaleString() + '회';
    $('aCalls').textContent = after.toLocaleString() + '회';
    $('bTime').textContent = '≈ ' + Math.round(tb).toLocaleString() + ' ms';
    $('aTime').textContent = '≈ ' + Math.round(ta).toLocaleString() + ' ms';
    $('bBar').style.width = '100%';
    $('aBar').style.width = Math.max(1, after / before * 100).toFixed(2) + '%';
    var distinct = Math.max(1, Math.round(n / 4));
    if ($('dk')) $('dk').textContent = n ? ('중복 제거 후 key ' + distinct.toLocaleString() + '개 (예매 ' + n.toLocaleString() + '건이 공연 몇 개에 몰림)') : '';
    var guardOn = !$('guard') || $('guard').checked;
    if (n === 0 && !guardOn) {
      $('verdict').innerHTML = '🚨 <b>빈 driver 테이블 + guard 없음</b> — FAE의 WHERE가 통째로 무시되어 <b>zconcert 전 행</b>을 읽습니다(공식 문서의 경고). <code>IF ... IS NOT INITIAL</code>이 필수인 이유!';
    } else if (n === 0) {
      $('verdict').innerHTML = '✓ 빈 driver — guard가 SELECT 자체를 건너뜁니다(왕복 0회). 안전.';
    } else {
      var ratio = Math.round(before / after);
      $('verdict').innerHTML = '같은 결과인데 DB 왕복이 <b>' + before.toLocaleString() + '회 → 2회</b> — 약 <b>' + ratio.toLocaleString() + '배</b> 적은 왕복!';
    }
    post();
  }
  $('n').addEventListener('input', render);
  if ($('guard')) $('guard').addEventListener('change', render);
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
