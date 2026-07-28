/* excel-upload — 엑셀/파일 업로드 체험 (CH33-L04).
   탭 구분 원본(헤더+정상3+숫자오류+필수누락+중복) → '검증만 실행'(dry run)으로 행별
   OK/ERROR/DUP 판정·오류 목록 → '성공 행 등록'은 통과 행만. 정본: C001·고객(정훈영 외 풀). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var RAW = [
    { h: true, c: 'CONCERT', p: '고객', s: 'SEATS' },
    { c: 'C001', p: '정훈영', s: '2' },
    { c: 'C002', p: '아이유', s: '4' },
    { c: 'C001', p: '손흥민', s: 'abc' },   // 숫자 오류
    { c: 'C002', p: '',       s: '3' },     // 필수(고객) 누락
    { c: 'C001', p: '정훈영', s: '2' }      // 중복(1행과 같은 key)
  ];
  var validated = null;
  function renderFile() {
    $('file').innerHTML = RAW.map(function (r) {
      var line = r.c + '\t' + (r.p || '') + '\t' + r.s;
      var html = line.replace(/\t/g, '<span class="tab">⇥</span>');
      return r.h ? '<div class="hdr">' + html + '   ← 헤더(건너뜀)</div>' : '<div>' + html + '</div>';
    }).join('');
  }
  function validate() {
    var seen = {}, good = [], bad = [];
    RAW.forEach(function (r, i) {
      if (r.h) return;
      var line = i + 1;
      if (!r.p) { bad.push({ line: line, why: '고객명 누락(필수값)' }); return; }
      if (!/^\d+$/.test(r.s)) { bad.push({ line: line, why: "SEATS='" + r.s + "' — 숫자가 아님" }); return; }
      var key = r.c + '|' + r.p;
      if (seen[key]) { bad.push({ line: line, why: '중복 — ' + seen[key] + '행과 같은 예매(공연+고객)' }); return; }
      seen[key] = line; good.push(r);
    });
    return { good: good, bad: bad };
  }
  $('run').addEventListener('click', function () {
    validated = validate();
    $('okPanel').style.display = ''; $('errPanel').style.display = '';
    $('okHead').textContent = '✓ 검증 통과 ' + validated.good.length + '행 (아직 등록 전 — dry run)';
    $('okBody').innerHTML = validated.good.length ? '<table><thead><tr><th>CONCERT</th><th>고객</th><th>SEATS</th></tr></thead><tbody>' +
      validated.good.map(function (g) { return '<tr><td>' + g.c + '</td><td>' + g.p + '</td><td>' + g.s + '</td></tr>'; }).join('') + '</tbody></table>'
      : '<div class="ph">유효 행 없음.</div>';
    $('errHead').textContent = validated.bad.length ? '✕ 오류 ' + validated.bad.length + '행 — 행 번호+사유로 돌려준다' : '✓ 오류 없음';
    $('errBody').innerHTML = validated.bad.length ? '<ul>' + validated.bad.map(function (b) { return '<li>' + b.line + '행: ' + b.why + '</li>'; }).join('') + '</ul>' : '<div class="ph">모두 통과.</div>';
    if ($('post')) $('post').disabled = !validated.good.length;
    post();
  });
  if ($('post')) $('post').addEventListener('click', function () {
    if (!validated) return;
    $('okHead').textContent = '✓ 등록 완료 ' + validated.good.length + '행 (BAPI/DML → COMMIT) · 오류 ' + validated.bad.length + '행은 제외';
    $('post').disabled = true;
    post();
  });
  $('reset').addEventListener('click', function () {
    validated = null;
    $('okPanel').style.display = 'none'; $('errPanel').style.display = 'none';
    if ($('post')) $('post').disabled = true;
    post();
  });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  renderFile(); post();
})();
