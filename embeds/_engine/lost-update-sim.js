/* lost-update-sim — Lost Update와 낙관/비관 잠금 체험 (CH26-L04).
   같은 예매 seats를 A·B가 동시에 만지는 시나리오. 전략별로 결과가 달라진다.
   none = B가 옛 값 기준으로 덮어써 A의 변경 소실 / pessimistic = 잠금 대기 후 최신값 재작업 /
   optimistic = changed_at 비교로 B 저장 거절 → 재조회. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var A = '<span class="who">A 정훈영</span>', B = '<span class="who">B 손흥민</span>', S = '<span class="who">DB</span>';

  var SC = {
    none: {
      rows: [
        ['t1', 'a', A + '<span class="d">READ seats=2</span>', '2', ''],
        ['t2', 'b', B + '<span class="d">READ seats=2</span>', '2', ''],
        ['t3', 'a', A + '<span class="d">UPDATE→4, COMMIT</span>', '4', 'chg'],
        ['t4', 'b', B + '<span class="d">UPDATE→6 (옛 값 2 기준), COMMIT</span>', '6', 'lost', 'warn']
      ],
      out: ['bad', '⚠ Lost Update 발생', 'A가 만든 4가 사라지고 B의 6만 남았습니다. B는 A의 변경을 못 본 채 옛 값으로 덮어썼어요.']
    },
    pessimistic: {
      rows: [
        ['t1', 'a', A + '<span class="d">ENQUEUE + READ seats=2</span>', '2🔒', ''],
        ['t2', 'b', B + '<span class="d">ENQUEUE → foreign_lock, 대기</span>', '2🔒', '', 'block'],
        ['t3', 'a', A + '<span class="d">UPDATE→4, COMMIT (잠금 해제)</span>', '4', 'chg'],
        ['t4', 'b', B + '<span class="d">잠금 획득→재READ=4→올바르게 변경</span>', '4→', 'chg']
      ],
      out: ['ok', '✓ 비관적 잠금 — 소실 없음', 'B가 잠금 대기 후 A의 최신값(4)을 다시 읽고 작업 → 덮어쓰기 없음. 충돌이 잦거나 편집이 길 때 적합.']
    },
    optimistic: {
      rows: [
        ['t1', 'a', A + '<span class="d">READ seats=2 (changed_at=t0)</span>', '2', ''],
        ['t2', 'b', B + '<span class="d">READ seats=2 (changed_at=t0)</span>', '2', ''],
        ['t3', 'a', A + '<span class="d">UPDATE→4, COMMIT (changed_at=t3)</span>', '4', 'chg'],
        ['t4', 'b', B + '<span class="d">저장 직전 비교 t0≠t3 → 거절!</span>', '4', '', 'warn'],
        ['t5', 'b', B + '<span class="d">재READ=4 → 그 위에 올바르게 반영</span>', '4→', 'chg']
      ],
      out: ['ok', '✓ 낙관적 잠금 — 소실 없음', '안 잠그고 저장 직전 changed_at을 비교 → 그 사이 A가 바꿨으면 거절·재조회. 충돌이 드물고 읽기 위주일 때 적합.']
    }
  };
  var cur = 'none';

  function render() {
    var sc = SC[cur];
    [].forEach.call(document.querySelectorAll('.st'), function (b) { b.classList.toggle('on', b.dataset.s === cur); });
    $('tl').innerHTML = sc.rows.map(function (r) {
      return '<div class="row ' + r[1] + (r[5] ? ' ' + r[5] : '') + '"><span class="t">' + r[0] + '</span>' +
        '<span class="act">' + r[2] + '</span>' +
        '<span class="db ' + (r[4] || '') + '">' + r[3] + '</span></div>';
    }).join('');
    var o = $('out'); o.className = 'out ' + sc.out[0];
    o.innerHTML = sc.out[1] + '<span class="sub">' + sc.out[2] + '</span>';
    post();
  }
  [].forEach.call(document.querySelectorAll('.st'), function (b) { b.addEventListener('click', function () { cur = b.dataset.s; render(); }); });

  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
