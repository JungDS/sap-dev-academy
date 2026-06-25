/* bdc-recorder — BDC/Batch Input 체험 (CH30-L03).
   '다음 동작'을 누를 때마다 화면 입력 과정을 BDCDATA 한 줄씩 채운다(SHDB 녹화 느낌).
   모든 동작을 채우면 CALL TRANSACTION으로 실행 → 결과. MODE N(무화면) 강조. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var STEPS = [
    { screen: 1, program: 'SAPMZBOOK', dynpro: '0100', label: '화면 0100 진입' },
    { fnam: 'ZBOOK-CONCERT', fval: 'C-NOVA', label: '공연 입력' },
    { fnam: 'BDC_OKCODE', fval: '/00', label: 'Enter(다음 화면)' },
    { screen: 1, program: 'SAPMZBOOK', dynpro: '0200', label: '화면 0200 진입' },
    { fnam: 'ZBOOK-SEATS', fval: '2', label: '좌석 수 입력' },
    { fnam: 'BDC_OKCODE', fval: '=SAVE', label: '저장' }
  ];
  var i = 0, rows = [];
  function render(markNew) {
    if (!rows.length) $('tbody').innerHTML = '<tr><td colspan="4" class="ph">"다음 동작"을 눌러 화면 입력을 BDCDATA에 녹화하세요.</td></tr>';
    else $('tbody').innerHTML = rows.map(function (r, k) {
      var nw = (markNew && k === rows.length - 1) ? ' new' : '';
      if (r.screen) return '<tr class="screen' + nw + '"><td>' + r.program + '</td><td>' + r.dynpro + '</td><td>X</td><td>· ' + r.label + '</td></tr>';
      return '<tr class="' + nw.trim() + '"><td></td><td></td><td></td><td>' + r.fnam + ' = ' + r.fval + '  · ' + r.label + '</td></tr>';
    }).join('');
    $('next').disabled = i >= STEPS.length;
    $('next').textContent = i >= STEPS.length ? '녹화 완료' : '다음 동작 ▶ (' + (i + 1) + '/' + STEPS.length + ')';
    $('exec').disabled = i < STEPS.length;
    post();
  }
  $('next').addEventListener('click', function () { if (i < STEPS.length) { rows.push(STEPS[i]); i++; render(true); } });
  $('exec').addEventListener('click', function () {
    var r = $('result'); r.className = 'result show ok';
    r.innerHTML = '✓ <code>CALL TRANSACTION \'XX01\' USING lt_bdc MODE \'N\' UPDATE \'S\'</code> 실행 → 예매 등록 성공. MODE <b>N</b>=무화면(배치), <b>A</b>=전체화면(디버깅), <b>E</b>=오류만.';
    post();
  });
  $('reset').addEventListener('click', function () { i = 0; rows = []; $('result').className = 'result'; render(); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
