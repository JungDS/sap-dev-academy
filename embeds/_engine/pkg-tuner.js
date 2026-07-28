/* pkg-tuner — Package 크기 트레이드오프 체험 (CH35-L05-S02).
   총 1,000,000건 가정. 크기 슬라이더(1천/1만/10만) → commit 횟수·피크 메모리·실패 시
   재처리 범위 막대가 맞바뀐다. 양극단 경고(작으면 commit 폭증·크면 메모리/재처리 범위).
   수치는 감각용 가상 예시(본문 프레이밍과 동일). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var TOTAL = 1000000;
  var SIZES = [1000, 10000, 100000];
  var KB_PER_ROW = 0.5;                      // 건당 0.5KB 가정(가상)
  function fmt(n) { return n.toLocaleString('en-US'); }
  function bar(id, ratio, label) {
    $(id).style.width = Math.max(2, ratio * 100).toFixed(1) + '%';
    $(id + 'v').textContent = label;
  }
  function render() {
    var size = SIZES[+$('sz').value];
    $('szv').textContent = fmt(size) + ' 건/패키지';
    var commits = Math.ceil(TOTAL / size);
    var memMB = size * KB_PER_ROW / 1024;
    var redo = size;                          // 실패 시 최대 재처리 범위 = 마지막 패키지
    bar('bCommit', Math.log10(commits) / Math.log10(1000), 'COMMIT ' + fmt(commits) + '회');
    bar('bMem', memMB / (SIZES[SIZES.length - 1] * KB_PER_ROW / 1024), '피크 메모리 ≈ ' + memMB.toFixed(1) + ' MB');
    bar('bRedo', redo / SIZES[SIZES.length - 1], '실패 시 재처리 ≤ ' + fmt(redo) + '건');
    var v = $('verdict');
    if (size === SIZES[0]) {
      v.className = 'vd warn';
      v.innerHTML = '⚠ 패키지가 작다 — 재처리 범위는 작지만 <b>COMMIT ' + fmt(commits) + '회</b>. commit·왕복 overhead가 쌓입니다.';
    } else if (size === SIZES[SIZES.length - 1]) {
      v.className = 'vd warn';
      v.innerHTML = '⚠ 패키지가 크다 — commit은 ' + fmt(commits) + '회뿐이지만 <b>메모리·잠금 유지·실패 시 재처리 범위</b>가 커집니다.';
    } else {
      v.className = 'vd ok';
      v.innerHTML = '✓ 가운데 어딘가 — 정답 수치는 없습니다. <b>운영 최대 건수를 알고 실측으로</b> 정하는 것이 설계입니다.';
    }
    post();
  }
  $('sz').addEventListener('input', render);
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
