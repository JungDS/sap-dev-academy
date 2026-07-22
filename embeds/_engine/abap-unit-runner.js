/* abap-unit-runner — ABAP Unit 테스트 러너 체험 (CH27-L05).
   Run → 각 테스트 메서드의 assert_equals(act/exp) 결과를 ✓/✗로. '버그 주입' 시 한 메서드가 잘못된 값을 반환 → red.
   Mock으로 DB 없이 로직만 검증한다는 점을 강조. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  // act는 버그 주입 시 달라지는 값
  var TESTS = [
    { nm: 'remaining_calc', exp: 50, ok: 50, bug: 48 },
    { nm: 'vip_price_2seats', exp: 150000, ok: 150000, bug: 150000 },
    { nm: 'sold_out_guard', exp: 'X', ok: 'X', bug: 'X' }
  ];
  var ran = false;
  function render() {
    var bug = $('bug').checked, pass = 0, fail = 0;
    $('list').innerHTML = TESTS.map(function (t) {
      if (!ran) return '<div class="t idle"><span class="st">•</span><span class="nm">' + t.nm + '</span><span class="as">미실행</span></div>';
      var act = bug ? t.bug : t.ok, ok = (act === t.exp); if (ok) pass++; else fail++;
      return '<div class="t ' + (ok ? 'pass' : 'fail') + '"><span class="st">' + (ok ? '✓' : '✗') + '</span><span class="nm">' + t.nm + '</span>' +
        '<span class="as">assert_equals( act = ' + act + ' exp = ' + t.exp + ' )</span></div>';
    }).join('');
    if (!ran) $('summary').innerHTML = '<span style="color:#94a0b8">▶ 실행 대기</span>';
    else $('summary').innerHTML = '<span class="p">' + pass + ' passed</span>' + (fail ? ' · <span class="f">' + fail + ' failed</span>' : '');
    post();
  }
  $('run').addEventListener('click', function () { ran = true; render(); });
  $('bug').addEventListener('change', function () { if (ran) render(); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
