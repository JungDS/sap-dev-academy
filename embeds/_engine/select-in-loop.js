/* select-in-loop — SELECT in LOOP 안티패턴 vs 사전 조회 체험 (CH32-L04).
   N(예매 건수) 슬라이더 → ❌ LOOP 안 SELECT = 1+N회 왕복 / ✅ FAE·JOIN = 2회. DB 왕복·예상 시간 대비. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var STEPS = [10, 50, 100, 500, 1000, 5000, 10000];
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
    var ratio = Math.round(before / after);
    $('verdict').innerHTML = '같은 결과인데 DB 왕복이 <b>' + before.toLocaleString() + '회 → 2회</b> — 약 <b>' + ratio.toLocaleString() + '배</b> 적은 왕복!';
    post();
  }
  $('n').addEventListener('input', render);
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
