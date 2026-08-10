/* db-view-vs-join 엔진 — 코드 JOIN과 Database View가 같은 결과를 내는 걸 보이고,
   마스터 누락 시 inner join이 행을 떨어뜨리는 것, View Field 축소가 구조 계약임을 시연.
   골격 계약: .dvj-seg(상태 토글) · #dvjFields · #dvjBody · #dvjHead · #dvjStatus.
   config: window.DVJ_CFG = { perfRows:[{concert_id,perf_no,perf_date}],
            master:{C001:{artist,venue,...}} (마스터에서 붙는 필드 맵 · 문자열이면 artist 하나로 취급),
            extraRow:{...}(마스터 누락 상태에서 추가), baseFields:[{key,label}], narrowDrop:'artist' }.
   높이: _autoheight.js. */
(function () {
  var CFG = window.DVJ_CFG || {};
  var state = 'normal';   // normal | missing | narrow
  var segEl = document.querySelector('.dvj-seg');
  var fieldsEl = document.getElementById('dvjFields');
  var headEl = document.getElementById('dvjHead');
  var bodyEl = document.getElementById('dvjBody');
  var statusEl = document.getElementById('dvjStatus');
  var STATES = [{ k: 'normal', l: '정상' }, { k: 'missing', l: '마스터 누락(C999)' }, { k: 'narrow', l: '필드 축소' }];

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function fields() {
    return CFG.baseFields.filter(function (f) { return !(state === 'narrow' && f.key === CFG.narrowDrop); });
  }
  function sourceRows() {
    var rows = CFG.perfRows.slice();
    if (state === 'missing' && CFG.extraRow) rows = rows.concat([CFG.extraRow]);
    return rows;
  }
  // inner join: zconcert 마스터가 있는 행만 결과로 남는다.
  // 짝 없는 행을 빈칸으로 남겨 두면 outer join 화면처럼 보이므로 결과에서 실제로 제거하고,
  // 무엇이 빠졌는지는 표 밖(상태문)에서 밝힌다.
  // 마스터에서 붙는 필드는 cfg가 정한다(문자열이면 artist 하나로 취급 — 구버전 cfg 호환)
  function masterOf(id) {
    var m = CFG.master[id];
    if (m == null) return null;
    return (typeof m === 'string') ? { artist: m } : m;
  }
  function joinRows() {
    var kept = [], dropped = [];
    sourceRows().forEach(function (c) {
      var m = masterOf(c.concert_id);
      var row = { concert_id: c.concert_id, perf_no: c.perf_no, perf_date: c.perf_date };
      CFG.baseFields.forEach(function (f) {
        if (!(f.key in row)) row[f.key] = (m && m[f.key] != null) ? m[f.key] : '';
      });
      if (m) kept.push(row); else dropped.push(row);
    });
    return { kept: kept, dropped: dropped };
  }

  function renderSeg() {
    segEl.innerHTML = STATES.map(function (s) {
      return '<button type="button" data-k="' + s.k + '" aria-pressed="' + (s.k === state ? 'true' : 'false') + '">' + esc(s.l) + '</button>';
    }).join('');
  }
  function renderFields() {
    fieldsEl.innerHTML = CFG.baseFields.map(function (f) {
      var gone = state === 'narrow' && f.key === CFG.narrowDrop;
      return '<span class="dvj-field' + (gone ? ' gone' : '') + '">' + esc(f.key) + '</span>';
    }).join('');
  }
  function renderResult() {
    var fs = fields();
    headEl.innerHTML = fs.map(function (f) { return '<th>' + esc(f.label) + '</th>'; }).join('');
    bodyEl.innerHTML = joinRows().kept.map(function (r) {
      return '<tr>' + fs.map(function (f) {
        return '<td>' + esc(r[f.key]) + '</td>';
      }).join('') + '</tr>';
    }).join('');
  }
  function renderStatus() {
    var jr = joinRows(), kept = jr.kept.length;
    if (state === 'missing') {
      var lost = jr.dropped.map(function (r) { return esc(r.concert_id + ' · ' + r.perf_no + ' · ' + r.perf_date); }).join(', ');
      statusEl.className = 'dvj-status warn';
      statusEl.innerHTML = '⚠️ 원본 zperf에는 <b>' + (lost || '마스터 없는 회차') + '</b> 행이 있지만 zconcert에 그 공연이 없어 <b>inner join에서 빠집니다</b>' +
        ' — 위 표에 그 행은 아예 없습니다(결과 <b>' + kept + '행</b>). 빠진 행까지 보려면 코드의 LEFT OUTER JOIN.';
    } else if (state === 'narrow') {
      statusEl.className = 'dvj-status';
      statusEl.innerHTML = 'View Field에서 <b>artist</b>를 빼면 결과 컬럼이 줄어듭니다. View Field는 외부 프로그램의 <b>구조 계약</b> — 함부로 빼면 쓰던 프로그램이 깨집니다.';
    } else {
      statusEl.className = 'dvj-status';
      statusEl.innerHTML = '✅ 코드 JOIN과 Database View가 <b>같은 ' + kept + '행</b>을 냅니다. 결과는 같고 <b>정의 위치</b>만 다릅니다(코드 vs DDIC).';
    }
  }
  function render() { renderSeg(); renderFields(); renderResult(); renderStatus(); }

  segEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; state = b.getAttribute('data-k'); render(); });
  render();
})();
