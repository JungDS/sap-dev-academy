/* where-having-pipeline 엔진 — 원본→WHERE→GROUP BY→HAVING 4단계를 한 단계씩 진행하며
   "WHERE는 행 하나, HAVING은 그룹 하나"를 보여 준다.
   골격 계약: [data-code] · .whp-stages · #whpData · #whpFb · [data-next] · [data-reset] · [data-progress].
   config: window.WHP_CFG = { people:[{dept_id,age,salary}], code:[lines], hlMap:{where,group,having},
            whereField,whereVal, groupKey, havingVal }. 높이: _autoheight.js. */
(function () {
  var CFG = window.WHP_CFG || {};
  var KW = new Set('SELECT FROM INTO TABLE WHERE GROUP BY HAVING COUNT AS CORRESPONDING FIELDS OF'.split(' '));
  var STAGES = ['원본', 'WHERE 후', 'GROUP BY 후', 'HAVING 후'];
  var codeBox = document.querySelector('[data-code]');
  var stagesBox = document.querySelector('.whp-stages');
  var dataEl = document.getElementById('whpData');
  var fbEl = document.getElementById('whpFb');
  var nextBtn = document.querySelector('[data-next]');
  var resetBtn = document.querySelector('[data-reset]');
  var progEl = document.querySelector('[data-progress]');
  var stage = 0;

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function hl(line) {
    if (/^\s*"/.test(line)) return '<span class="tok-com">' + esc(line) + '</span>';
    var out = '', re = /(\b\d+\b)|([A-Za-z_][A-Za-z0-9_*]*)|([^A-Za-z0-9_]+)/g, m;
    while ((m = re.exec(line)) !== null) {
      if (m[1]) out += '<span class="tok-num">' + esc(m[1]) + '</span>';
      else if (m[2]) out += KW.has(m[2].toUpperCase()) ? '<span class="tok-kw">' + esc(m[2]) + '</span>' : esc(m[2]);
      else out += esc(m[0]);
    }
    return out;
  }
  // 계산
  function passWhere(p) { return p[CFG.whereField] >= CFG.whereVal; }
  function groups() {
    var g = {}, order = [];
    CFG.people.filter(passWhere).forEach(function (p) {
      var k = p[CFG.groupKey];
      if (!g[k]) { g[k] = { key: k, cnt: 0, sum: 0 }; order.push(k); }
      g[k].cnt++; g[k].sum += Number(p.salary) || 0;
    });
    return order.map(function (k) { return g[k]; });
  }

  if (codeBox) codeBox.innerHTML = '<ol>' + CFG.code.map(function (l) { return '<li>' + (l ? hl(l) : '&nbsp;') + '</li>'; }).join('') + '</ol>';
  var lines = codeBox ? codeBox.querySelectorAll('li') : [];

  function renderStages() {
    stagesBox.innerHTML = STAGES.map(function (s, i) {
      var cls = i === stage ? 'on' : (i < stage ? 'done' : '');
      return '<div class="whp-stage ' + cls + '">' + (i + 1) + '. ' + s + '</div>';
    }).join('');
  }
  function hlCode() {
    var hlLine = -1;
    if (stage === 1) hlLine = CFG.hlMap.where;
    else if (stage === 2) hlLine = CFG.hlMap.group;
    else if (stage === 3) hlLine = CFG.hlMap.having;
    lines.forEach(function (li, i) { li.classList.toggle('on', i === hlLine); });
  }

  function renderData() {
    if (stage <= 1) {
      // 사람 행 (stage1이면 WHERE 실패 행 cut)
      var head = '<tr><th>dept_id</th><th>age</th><th>salary</th><th>판정</th></tr>';
      var body = CFG.people.map(function (p) {
        var cut = stage === 1 && !passWhere(p);
        var tag = stage === 1 ? (cut ? '<span class="whp-tag cut">제외(age&lt;' + CFG.whereVal + ')</span>' : '<span class="whp-tag keep">유지</span>') : '';
        return '<tr class="' + (cut ? 'cut' : '') + '"><td>' + p.dept_id + '</td><td class="num">' + p.age + '</td><td class="num">' + p.salary + '</td><td>' + tag + '</td></tr>';
      }).join('');
      dataEl.innerHTML = '<table class="whp-tbl"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
    } else {
      // 그룹 행 (stage3이면 HAVING 실패 그룹 cut)
      var gs = groups();
      var head2 = '<tr><th>dept_id</th><th>COUNT(*)</th><th>SUM(salary)</th><th>판정</th></tr>';
      var body2 = gs.map(function (g) {
        var cut = stage === 3 && g.cnt < CFG.havingVal;
        var tag = stage === 3
          ? (cut ? '<span class="whp-tag cut">제외(cnt&lt;' + CFG.havingVal + ')</span>' : '<span class="whp-tag keep">유지</span>')
          : '';
        return '<tr class="' + (cut ? 'cut' : 'grp') + '"><td>' + esc(g.key) + '</td><td class="num">' + g.cnt + '</td><td class="num">' + g.sum + '</td><td>' + tag + '</td></tr>';
      }).join('');
      dataEl.innerHTML = '<table class="whp-tbl"><thead>' + head2 + '</thead><tbody>' + body2 + '</tbody></table>';
    }
  }

  var FB = [
    '원본 사람 ' + (CFG.people ? CFG.people.length : 0) + '명. ▶로 단계를 진행하세요.',
    'WHERE ' + CFG.whereField + ' >= ' + CFG.whereVal + ' — 개별 <b>행</b> 필터. 조건 미달 행이 빠집니다.',
    'GROUP BY ' + CFG.groupKey + ' — 남은 행을 부서별로 묶어 COUNT·SUM 계산.',
    'HAVING COUNT(*) >= ' + CFG.havingVal + ' — <b>그룹</b> 필터. 집계 미달 그룹 전체가 빠집니다.'
  ];

  function render() {
    renderStages(); hlCode(); renderData();
    fbEl.innerHTML = FB[stage];
    progEl.textContent = (stage + 1) + ' / ' + STAGES.length;
    nextBtn.disabled = stage >= STAGES.length - 1;
  }

  if (nextBtn) nextBtn.addEventListener('click', function () { if (stage < STAGES.length - 1) { stage++; render(); } });
  if (resetBtn) resetBtn.addEventListener('click', function () { stage = 0; render(); });

  render();
})();
