/* excel-upload — 엑셀/파일 업로드 체험 (CH33-L04).
   탭 구분 원본(헤더+데이터+오류행) → 업로드 시 헤더 건너뛰고 SPLIT 파싱·검증 → 유효행은 내부 테이블, 오류행은 따로. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var RAW = [
    { h: true, c: 'CONCERT', p: 'PAX', s: 'SEATS' },
    { c: 'C-NOVA', p: '정훈영', s: '2' },
    { c: 'C-AURA', p: '아이유', s: '4' },
    { c: 'C-NOVA', p: '손흥민', s: 'abc' }   // 잘못된 좌석
  ];
  function renderFile() {
    $('file').innerHTML = RAW.map(function (r) {
      var line = r.c + '\t' + r.p + '\t' + r.s;
      var html = line.replace(/\t/g, '<span class="tab">⇥</span>');
      return r.h ? '<div class="hdr">' + html + '   ← 헤더(건너뜀)</div>' : '<div>' + html + '</div>';
    }).join('');
  }
  $('run').addEventListener('click', function () {
    var good = [], bad = [];
    RAW.forEach(function (r, i) {
      if (r.h) return;                         // 헤더 skip
      if (/^\d+$/.test(r.s)) good.push(r); else bad.push({ r: r, line: i + 1 });
    });
    $('okPanel').style.display = ''; $('errPanel').style.display = '';
    $('okBody').innerHTML = good.length ? '<table><thead><tr><th>CONCERT</th><th>PAX</th><th>SEATS</th></tr></thead><tbody>' +
      good.map(function (g) { return '<tr><td>' + g.c + '</td><td>' + g.p + '</td><td>' + g.s + '</td></tr>'; }).join('') + '</tbody></table>'
      : '<div class="ph">유효 행 없음.</div>';
    $('okHead').textContent = '✓ 내부 테이블 (검증 통과 ' + good.length + '행)';
    $('errHead').textContent = bad.length ? '✕ 오류 ' + bad.length + '행 (등록 제외)' : '✓ 오류 없음';
    $('errBody').innerHTML = bad.length ? '<ul>' + bad.map(function (b) { return '<li>' + (b.line) + '행: SEATS=\'' + b.r.s + '\' — 숫자가 아님(검증 실패)</li>'; }).join('') + '</ul>' : '<div class="ph">모두 통과.</div>';
    post();
  });
  $('reset').addEventListener('click', function () { $('okPanel').style.display = 'none'; $('errPanel').style.display = 'none'; post(); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  renderFile(); post();
})();
