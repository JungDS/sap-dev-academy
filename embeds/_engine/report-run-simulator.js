/* report-run-simulator 엔진 — CH15 캡스톤. 시나리오를 골라 ▶ 실행하면 4개 report event가 차례로 흐른다:
   ① INITIALIZATION(기본값) ② AT SELECTION-SCREEN OUTPUT(화면 제어·p_note 활성여부) ③ AT SELECTION-SCREEN ON p_conc(입력/존재/권한 검증)
   ④ START-OF-SELECTION(검증 통과 시 zbooking 조회·SALV 표시·0건이면 S 메시지). 막힌 단계와 메시지, 결과 테이블을 보여 준다.
   골격 계약: .rrs-scen · .rrs-stat · #rrsScreen · [data-run] · .rrs-timeline · #rrsResult.
   config: window.RRS_CFG = { concerts, bookings, scenarios }. 높이: _autoheight.js. */
(function () {
  var CFG = window.RRS_CFG || { concerts: {}, bookings: [], scenarios: [] };
  var idx = 0, stat = 'R', ran = false;

  var scenEl = document.querySelector('.rrs-scen');
  var statEl = document.querySelector('.rrs-stat');
  var screenEl = document.getElementById('rrsScreen');
  var runBtn = document.querySelector('[data-run]');
  var timeEl = document.querySelector('.rrs-timeline');
  var resultEl = document.getElementById('rrsResult');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function cur() { return CFG.scenarios[idx]; }

  function evalRun() {
    var sc = cur(), conc = sc.conc, c = CFG.concerts[conc];
    var r = { noteActive: sc.mode === 'adv', gate: null, msg: '', rows: [] };
    if (!conc) { r.gate = 'empty'; r.msg = "MESSAGE E \"공연 코드를 입력하세요\""; return r; }
    if (!c || !c.exists) { r.gate = 'notexist'; r.msg = 'MESSAGE E "없는 공연 코드입니다" (' + conc + ')'; return r; }
    if (!c.auth) { r.gate = 'auth'; r.msg = 'MESSAGE E "이 공연을 볼 권한이 없습니다" (' + conc + ')'; return r; }
    r.gate = 'pass';
    r.rows = CFG.bookings.filter(function (b) { return b.concert === conc && b.status === stat; });
    return r;
  }

  function renderScen() {
    scenEl.innerHTML = CFG.scenarios.map(function (s, i) {
      return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === idx ? 'true' : 'false') + '">' + esc(s.label) + '</button>';
    }).join('');
  }
  function renderStat() {
    statEl.innerHTML = ['R', 'C'].map(function (v) {
      return '<button type="button" data-v="' + v + '" aria-pressed="' + (v === stat ? 'true' : 'false') + '">' + v + (v === 'R' ? ' 예약' : ' 취소') + '</button>';
    }).join('');
  }
  function renderScreen() {
    var sc = cur(), noteActive = sc.mode === 'adv';
    screenEl.innerHTML = '<div class="snum">표준 선택화면 (1000)</div>' +
      '<div class="rrs-srow"><span class="k">p_conc</span><span class="v ' + (sc.conc ? '' : 'empty') + '">' + (sc.conc ? esc(sc.conc) : '(공백)') + '</span></div>' +
      '<div class="rrs-srow"><span class="k">p_mode</span><span class="v">' + (sc.mode === 'adv' ? 'A (고급)' : "' ' (일반)") + '</span></div>' +
      '<div class="rrs-srow"><span class="k">p_note</span><span class="v ' + (noteActive ? '' : 'off') + '">' + (noteActive ? '입력 가능' : '비활성(숨김)') + '</span></div>' +
      '<div class="rrs-srow"><span class="k">s_stat</span><span class="v">I EQ ' + esc(stat) + '</span></div>';
  }
  function stage(state, evt, msg) {
    var icon = state === 'pass' ? '✓' : state === 'fail' ? '✗' : (state === 'lock' ? '·' : '');
    return '<div class="rrs-stage ' + state + '"><span class="rrs-sdot">' + icon + '</span>' +
      '<div class="rrs-sbody"><div class="rrs-sevt">' + esc(evt) + '</div>' + (msg ? '<div class="rrs-smsg">' + msg + '</div>' : '') + '</div></div>';
  }
  function renderTimeline() {
    if (!ran) {
      timeEl.innerHTML = stage('', 'INITIALIZATION', '기본값 제안') + stage('', 'AT SELECTION-SCREEN OUTPUT', '화면 제어') +
        stage('', 'AT SELECTION-SCREEN ON p_conc', '입력·존재·권한 검증') + stage('', 'START-OF-SELECTION', '조회·표시');
      return;
    }
    var r = evalRun();
    var h = stage('pass', 'INITIALIZATION', 'p_conc=' + (cur().conc || '(공백)') + ' · s_stat=I EQ ' + stat);
    h += stage('pass', 'AT SELECTION-SCREEN OUTPUT', 'p_note ' + (r.noteActive ? '활성' : '비활성(숨김)'));
    if (r.gate === 'pass') {
      h += stage('pass', 'AT SELECTION-SCREEN ON p_conc', '입력·존재·권한 통과');
      var label = r.rows.length ? 'SELECT zbooking → ' + r.rows.length + '건' : 'SELECT → 0건 → MESSAGE S';
      h += stage('pass', 'START-OF-SELECTION', label);
    } else {
      h += stage('fail', 'AT SELECTION-SCREEN ON p_conc', r.msg);
      h += stage('lock', 'START-OF-SELECTION', '🔒 검증 실패로 실행 안 됨');
    }
    timeEl.innerHTML = h;
  }
  function renderResult() {
    if (!ran) { resultEl.innerHTML = '<div class="rrs-msg lock">▶ 실행을 누르면 결과가 여기 나옵니다.</div>'; return; }
    var r = evalRun();
    if (r.gate !== 'pass') { resultEl.innerHTML = '<div class="rrs-msg lock">검증에서 막혀 조회가 실행되지 않았습니다 (화면 복귀).</div>'; return; }
    if (!r.rows.length) { resultEl.innerHTML = '<div class="rrs-msg s">📭 sy-subrc=4 · MESSAGE S "조회된 예매가 없습니다" — 흐름은 안 막고 안내</div>'; return; }
    resultEl.innerHTML = '<div class="rrs-alv">ALV 표시 (cl_salv_table) — ' + r.rows.length + '건</div>' +
      '<table class="rrs-tbl"><thead><tr><th>booking_id</th><th>customer</th><th>status</th><th>amount</th></tr></thead><tbody>' +
      r.rows.map(function (b) { return '<tr><td>' + esc(b.id) + '</td><td>' + esc(b.cust) + '</td><td>' + esc(b.status) + '</td><td>' + esc(b.amount) + '</td></tr>'; }).join('') +
      '</tbody></table>';
  }
  function render() { renderScen(); renderStat(); renderScreen(); renderTimeline(); renderResult(); }

  scenEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; idx = +b.getAttribute('data-i'); ran = false; render(); });
  statEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; stat = b.getAttribute('data-v'); ran = false; render(); });
  runBtn.addEventListener('click', function () { ran = true; render(); });

  render();
})();
