/* amdp-steps — SQLScript 체이닝 단계 실행 체험 (CH36-L02).
   cfg(#as-cfg JSON): { code:[줄들], steps:[{from,to,label,desc,tname,cols,rows,ref?}] }
   단계 버튼 → 해당 코드 줄 하이라이트 + 중간 테이블 변수 내용 표시.
   ref=true면 "재계산 없이 :변수 재사용" 배지. 수치는 교육용 가상 예시. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cfg; try { cfg = JSON.parse($('as-cfg').textContent); } catch (e) { cfg = { code: [], steps: [] }; }
  var done = {};
  // 코드 렌더
  $('code').innerHTML = cfg.code.map(function (l, i) {
    return '<span class="ln" data-l="' + i + '">' + l + '</span>';
  }).join('\n');
  // 단계 버튼
  $('steps').innerHTML = cfg.steps.map(function (s, i) {
    return '<button type="button" data-i="' + i + '">' + s.label + '</button>';
  }).join('');
  function show(i) {
    var s = cfg.steps[i];
    [].forEach.call($('steps').querySelectorAll('button'), function (b) { b.classList.toggle('on', +b.dataset.i === i); });
    [].forEach.call($('code').querySelectorAll('.ln'), function (el) {
      var l = +el.dataset.l; el.classList.toggle('hot', l >= s.from && l <= s.to);
    });
    done[i] = true;
    var badge = s.ref ? '<span class="reuse">↺ 재계산 없음 — :변수 재사용</span>' : '';
    $('out').innerHTML =
      '<div class="t">' + s.tname + badge + '</div>' +
      '<table><thead><tr>' + s.cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + s.rows.map(function (r) {
        return '<tr>' + r.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table>' +
      '<div class="d">' + s.desc + '</div>';
    $('out').className = 'out show';
    if (Object.keys(done).length === cfg.steps.length && $('final')) $('final').classList.add('show');
    post();
  }
  [].forEach.call($('steps').querySelectorAll('button'), function (b) {
    b.addEventListener('click', function () { show(+b.dataset.i); });
  });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  show(0);
})();
