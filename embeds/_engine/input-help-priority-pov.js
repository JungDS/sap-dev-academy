/* input-help-priority-pov 엔진 — CH16-L05 전용.
   ① 입력 도움 우선순위 미니 결정기(DDIC 우선, 직접 POV는 최후수단).
   ② POV 실험실: 공연ID를 고르고 회차 F4를 누르면 DYNP_VALUES_READ가 그 값을 읽어
      해당 공연의 회차만 후보로 좁혀 F4IF_INT_TABLE_VALUE_REQUEST로 띄우는 흐름을 시연.
   골격 계약(HTML): [data-ihp] · [data-tier] · #ihpTier · #ihpConc · [data-act=f4] · #ihpSteps · #ihpPopup.
   높이: _autoheight.js. */
(function () {
  var root = document.querySelector('[data-ihp]'); if (!root) return;

  var PERF = {
    'C001': [{ no: '001', t: '1회차 19:00' }, { no: '002', t: '2회차 21:00' }],
    'C002': [{ no: '001', t: '1회차 18:00' }, { no: '002', t: '2회차 20:30' }, { no: '003', t: '3회차 22:00' }]
  };
  var TIER = {
    '1': { cls: 'ok', h: '✅ <b>DDIC로 충분</b> — Data Element에 Search Help만 붙이면 F4가 <b>코드 0줄</b>로 동작합니다. <code>PROCESS ON VALUE-REQUEST</code>를 만들 필요가 없습니다.' },
    '2': { cls: 'brand', h: '🛠 <b>직접 POV 필요</b> — 다른 칸(공연ID) 값에 따라 후보가 달라지므로 표준 도움만으로는 부족합니다. 아래 실험실에서 만들어 보세요(최후수단).' },
    '3': { cls: 'warn', h: '⚠️ <b>다시 생각</b> — DDIC Search Help로 되는 칸을 직접 만들면 <b>유지보수 부담</b>이 커집니다. 1번으로 되는지 먼저 확인하세요.' }
  };
  var tierEl = root.querySelector('#ihpTier');
  var concEl = root.querySelector('#ihpConc');
  var stepsEl = root.querySelector('#ihpSteps');
  var popEl = root.querySelector('#ihpPopup');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-tier]');
    if (t) {
      root.querySelectorAll('[data-tier]').forEach(function (b) { b.setAttribute('aria-pressed', b === t ? 'true' : 'false'); });
      var d = TIER[t.getAttribute('data-tier')];
      tierEl.className = 'ihp-tier ' + d.cls; tierEl.innerHTML = d.h;
      return;
    }
    var f = e.target.closest('[data-act="f4"]');
    if (f) runF4();
  });

  function runF4() {
    var conc = concEl.value;
    popEl.innerHTML = ''; popEl.className = 'ihp-pop';
    if (!conc) {
      stepsEl.innerHTML = step('bad', '공연을 먼저 고르세요', 'DYNP_VALUES_READ로 읽을 <code>ZCONCERT-CONCERT_ID</code> 값이 비어 있어 후보를 만들 수 없습니다.');
      return;
    }
    var list = PERF[conc] || [];
    stepsEl.innerHTML =
      step('go', '① DYNP_VALUES_READ', '회차 칸에서 F4 → 화면의 <code>ZCONCERT-CONCERT_ID</code> 현재값을 읽음: <b>' + esc(conc) + '</b>') +
      step('go', '② 후보 구성', '<code>' + esc(conc) + '</code>의 회차만 <code>gt_perf</code>로 모음 (' + list.length + '건)') +
      step('go', '③ F4IF_INT_TABLE_VALUE_REQUEST', '모은 목록을 F4 창으로 띄우고, 고른 값을 <code>GV_PERF</code>로 돌려줌');
    popEl.innerHTML =
      '<div class="ihp-poptt">F4 — ' + esc(conc) + ' 회차</div>' +
      list.map(function (r) {
        return '<button type="button" class="ihp-cand" data-pick="' + esc(r.no) + '">' + esc(r.no) + ' · ' + esc(r.t) + '</button>';
      }).join('');
  }

  root.addEventListener('click', function (e) {
    var c = e.target.closest('[data-pick]'); if (!c) return;
    root.querySelectorAll('.ihp-cand').forEach(function (b) { b.classList.remove('sel'); });
    c.classList.add('sel');
    stepsEl.innerHTML += step('ok', '선택 완료', '<code>GV_PERF = \'' + esc(c.getAttribute('data-pick')) + '\'</code> — 고른 값이 화면 회차 칸으로 들어갔습니다.');
  });

  function step(cls, t, d) {
    return '<div class="ihp-step ' + cls + '"><b>' + t + '</b><span>' + d + '</span></div>';
  }

  // 초기
  tierEl.className = 'ihp-tier'; tierEl.innerHTML = '위 상황 중 하나를 골라 어떤 방법이 맞는지 확인하세요.';
  stepsEl.innerHTML = step('idle', '준비', '공연을 고르고 <b>회차 F4</b>를 눌러 보세요.');
})();
