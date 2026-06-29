/* join-match-board 엔진 — 두 표(사람·부서)를 ON 조건으로 짝지어 INNER JOIN 결과를 보여 준다.
   부서를 숨겨 가며 "짝 없는 행이 INNER에서 빠진다"를 확인. sy-subrc/sy-dbcnt 표시.
   골격 계약: #jmbLeft · #jmbRight · .jmb-hide(칩 호스트) · #jmbBody · #jmbCnt.
   config: window.JMB_CFG = { people:[{persid,name,dept_id}], depts:[{dept_id,deptname}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.JMB_CFG || { people: [], depts: [] };
  var hidden = {};   // dept_id -> true(숨김)
  var leftEl = document.getElementById('jmbLeft');
  var rightEl = document.getElementById('jmbRight');
  var hideEl = document.querySelector('.jmb-hide');
  var bodyEl = document.getElementById('jmbBody');
  var cntEl = document.getElementById('jmbCnt');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function dotClass(id) { return ({ 10: 'k10', 20: 'k20', 30: 'k30' })[id] || 'knone'; }
  function deptOf(id) { return CFG.depts.filter(function (d) { return !hidden[d.dept_id]; }).find(function (d) { return d.dept_id === id; }); }

  function renderCards() {
    leftEl.innerHTML = CFG.people.map(function (p) {
      return '<div class="jmb-card"><span>' + p.persid + '</span><span class="nm">' + esc(p.name) + '</span>' +
        '<span class="jmb-key"><span class="jmb-dot ' + dotClass(p.dept_id) + '"></span>dept ' + p.dept_id + '</span></div>';
    }).join('');
    rightEl.innerHTML = CFG.depts.map(function (d) {
      return '<div class="jmb-card' + (hidden[d.dept_id] ? ' dim' : '') + '"><span class="jmb-key"><span class="jmb-dot ' + dotClass(d.dept_id) + '"></span>dept ' + d.dept_id + '</span>' +
        '<span class="nm">' + esc(d.deptname) + '</span></div>';
    }).join('');
  }

  function renderResult() {
    var keep = 0;
    bodyEl.innerHTML = CFG.people.map(function (p) {
      var d = deptOf(p.dept_id);
      if (d) {
        keep++;
        return '<tr class="keep"><td>' + p.persid + '</td><td class="l">' + esc(p.name) + '</td><td>' + esc(d.deptname) + '</td><td><span class="badge-keep">매칭 ✔</span></td></tr>';
      }
      return '<tr class="drop"><td>' + p.persid + '</td><td class="l">' + esc(p.name) + '</td><td>—</td><td><span class="badge-drop">INNER 제외</span></td></tr>';
    }).join('');
    var subrc = keep > 0 ? 0 : 4;
    cntEl.innerHTML = 'INNER JOIN 결과 = <b>' + keep + '행</b> &nbsp;(사람 ' + CFG.people.length + '명 중 ' + keep + '명 매칭) &nbsp;·&nbsp; sy-dbcnt = ' + keep + ' &nbsp;·&nbsp; sy-subrc = ' + subrc;
  }

  function renderHideChips() {
    hideEl.innerHTML = CFG.depts.map(function (d) {
      return '<button class="jmb-chip" type="button" data-d="' + d.dept_id + '" aria-pressed="false">부서 ' + d.dept_id + '(' + esc(d.deptname) + ') 숨김</button>';
    }).join('');
  }

  if (hideEl) hideEl.addEventListener('click', function (e) {
    var chip = e.target.closest('.jmb-chip'); if (!chip) return;
    var id = +chip.getAttribute('data-d');
    hidden[id] = !hidden[id];
    chip.setAttribute('aria-pressed', hidden[id] ? 'true' : 'false');
    renderCards(); renderResult();
  });

  renderHideChips();
  renderCards();
  renderResult();
})();
