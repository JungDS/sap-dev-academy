/* package-commit — 대량 변경 패키지 단위 COMMIT 시각화 (CH25-L05).
   총 TOTAL건을 패키지 크기 P마다 COMMIT → COMMIT 횟수 = ceil(TOTAL/P), 최대 미커밋 버퍼 = P.
   단일(전체) COMMIT은 버퍼가 TOTAL까지 차올라 메모리·잠금·롤백세그먼트 폭발.
   sawtooth 그래프(버퍼 over 진행)로 fill-flush 패턴을 보여 준다. */
(function () {
  var TOTAL = 20000, W = 600, H = 120, PAD = 6;
  var size = 5000;
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return n.toLocaleString('en-US'); };

  function commits(p) { return Math.ceil(TOTAL / p); }

  // 버퍼(미커밋 누적) over 진행건수의 sawtooth 좌표
  function sawPoints(p) {
    var pts = [], yMax = TOTAL;                      // y 스케일 기준 = TOTAL(단일이 천장)
    var sx = function (x) { return PAD + x / TOTAL * (W - 2 * PAD); };
    var sy = function (y) { return H - PAD - y / yMax * (H - 2 * PAD); };
    pts.push([sx(0), sy(0)]);
    var done = 0;
    while (done < TOTAL) {
      var chunk = Math.min(p, TOTAL - done);
      done += chunk;
      pts.push([sx(done), sy(chunk)]);               // 버퍼 차오름
      if (done < TOTAL || p < TOTAL) pts.push([sx(done), sy(0)]); // COMMIT → 버퍼 0
    }
    return pts;
  }

  function render() {
    var single = size >= TOTAL;
    var c = commits(size), maxBuf = single ? TOTAL : size;
    $('cCommit').textContent = single ? '1' : fmt(c);
    $('cBuf').textContent = fmt(maxBuf);
    $('cBuf').className = 'v' + (single ? ' warn' : '');
    [].forEach.call(document.querySelectorAll('.psz'), function (b) { b.classList.toggle('on', +b.dataset.p === size); });

    var pts = sawPoints(size);
    var line = pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ');
    var area = PAD + ',' + (H - PAD) + ' ' + line + ' ' + (W - PAD) + ',' + (H - PAD);
    var dy = H - PAD - (H - 2 * PAD);                 // 천장(=TOTAL) y
    $('svg').innerHTML =
      '<line class="axis" x1="' + PAD + '" y1="' + (H - PAD) + '" x2="' + (W - PAD) + '" y2="' + (H - PAD) + '"/>' +
      '<line class="danger" x1="' + PAD + '" y1="' + dy + '" x2="' + (W - PAD) + '" y2="' + dy + '"/>' +
      '<text class="dangerTxt" x="' + (W - PAD) + '" y="' + (dy + 11) + '" text-anchor="end">전체(' + fmt(TOTAL) + ') = 위험</text>' +
      '<polyline class="fillArea' + (single ? ' single' : '') + '" points="' + area + '"/>' +
      '<polyline class="saw' + (single ? ' single' : '') + '" points="' + line + '"/>';

    if (single) $('msg').className = 'msg warn', $('msg').innerHTML = '⚠ <b>단일(전체) COMMIT</b> — 미커밋 버퍼가 <b>' + fmt(TOTAL) + '건</b>까지 차오릅니다. 메모리·DB 잠금·롤백 세그먼트가 <b>폭발</b>하고, 중간 실패 시 전부 롤백. 대량에선 금물.';
    else $('msg').className = 'msg ok', $('msg').innerHTML = '✓ 패키지 <b>' + fmt(size) + '건</b>마다 COMMIT → 총 <b>' + fmt(c) + '회</b> COMMIT. 미커밋 버퍼는 최대 <b>' + fmt(size) + '건</b>으로 유지(톱니처럼 차고 비움) → 자원 안정. 작을수록 안전하지만 COMMIT 횟수↑(오버헤드) → 보통 1천~1만에서 절충.';
    post();
  }

  [].forEach.call(document.querySelectorAll('.psz'), function (b) { b.addEventListener('click', function () { size = +b.dataset.p; render(); }); });

  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
