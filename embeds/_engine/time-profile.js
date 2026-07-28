/* time-profile — SAT Hit List 판독 체험 (CH35-L02).
   코드 블록별 ABAP+DB 시간을 막대로(총시간 내림차순). 행 클릭 → '다음 행동' 3버튼
   (ST05로 / Internal Table 점검 / 외부 호출 확인) → 정답이면 이유, 오답이면 왜 아닌지 피드백.
   판독→분기 판단(DB 크면 ST05·ABAP 크면 루프/내부 테이블·외부 크면 RFC/HTTP)이 이 위젯의 전부. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var ROWS = [
    { nm: 'LOOP AT gt_book (집계)', abap: 1850, db: 40, ans: 'it',
      why: 'ABAP 시간이 압도적 — 루프·내부 테이블 접근(정렬·탐색 방식)을 점검할 차례.' },
    { nm: 'SELECT zconcert (반복)', abap: 60, db: 920, ans: 'st05',
      why: 'DB 시간이 큼 — ST05로 이 SQL의 시간·횟수·건수를 정밀 검사한다.' },
    { nm: 'SORT gt_result', abap: 210, db: 0, ans: 'it',
      why: '순수 ABAP 처리 — 정렬 횟수·시점(루프 안 반복 정렬?)을 점검한다.' },
    { nm: 'RFC Z_GET_STOCK 호출', abap: 30, db: 0, ext: 380, ans: 'ext',
      why: '외부(External) 시간 — 원격 호출 왕복이라 RFC/네트워크 쪽을 본다.' }
  ];
  var LBL = { st05: 'ST05로 이동', it: 'Internal Table·루프 점검', ext: '외부 호출 확인' };
  var max = Math.max.apply(null, ROWS.map(function (r) { return r.abap + r.db + (r.ext || 0); }));
  ROWS.sort(function (a, b) { return (b.abap + b.db + (b.ext || 0)) - (a.abap + a.db + (a.ext || 0)); });
  var sel = -1;
  function render() {
    $('rows').innerHTML = ROWS.map(function (r, i) {
      var tot = r.abap + r.db + (r.ext || 0), w = tot / max * 100;
      var abapW = r.abap / tot * 100, dbW = r.db / tot * 100, extW = (r.ext || 0) / tot * 100;
      return '<div class="row ' + (i === 0 ? 'hot' : '') + (sel === i ? ' sel' : '') + '" data-i="' + i + '"><div class="top"><span class="nm">' + r.nm +
        ' <span class="net">ABAP ' + r.abap + ' · DB ' + r.db + (r.ext ? ' · 외부 ' + r.ext : '') + '</span></span><span class="tot">' + tot.toLocaleString() + ' µs</span></div>' +
        '<div class="track" style="width:' + w.toFixed(1) + '%"><div class="ab" style="width:' + abapW + '%"></div><div class="db" style="width:' + dbW + '%"></div>' + (r.ext ? '<div class="ex" style="width:' + extW + '%"></div>' : '') + '</div></div>';
    }).join('');
    [].forEach.call(document.querySelectorAll('.row'), function (el) {
      el.addEventListener('click', function () { sel = +el.dataset.i; renderActs(); render(); });
    });
    post();
  }
  function renderActs() {
    var box = $('acts'); if (!box) return;
    if (sel < 0) { box.innerHTML = '<span class="ph">막대(행)를 클릭하면 다음 행동을 고를 수 있습니다.</span>'; return; }
    var r = ROWS[sel];
    box.innerHTML = '<div class="q"><b>' + r.nm + '</b> — 다음 행동은?</div>' +
      Object.keys(LBL).map(function (k) { return '<button type="button" class="act" data-a="' + k + '">' + LBL[k] + '</button>'; }).join('') +
      '<div class="vd" id="vd"></div>';
    [].forEach.call(box.querySelectorAll('.act'), function (b) {
      b.addEventListener('click', function () {
        var ok = b.dataset.a === r.ans;
        $('vd').className = 'vd show ' + (ok ? 'ok' : 'no');
        $('vd').innerHTML = ok ? '✓ 정답 — ' + r.why
          : '✕ 시간의 성격을 다시 보세요. 이 행은 ' + (r.ans === 'st05' ? 'DB' : r.ans === 'it' ? 'ABAP' : '외부') + ' 시간이 지배적입니다. ' + r.why;
        post();
      });
    });
    post();
  }
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render(); renderActs();
})();
