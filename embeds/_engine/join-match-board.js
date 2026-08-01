/* join-match-board 엔진 — 두 표(왼쪽=명세 행 · 오른쪽=마스터)를 ON 조건으로 짝지어 INNER JOIN 결과를 보여 준다.
   오른쪽(마스터) 행을 숨겨 가며 "짝 없는 왼쪽 행은 INNER에서 빠진다"를 확인. sy-subrc/sy-dbcnt 표시.
   골격 계약: #jmbLeft · #jmbRight · .jmb-hide(칩 호스트) · #jmbBody · #jmbCnt.
   config: window.JMB_CFG = { joinKey, keyLabel, leftNoun, rightNoun, unit,
            left:{ rows:[..], fields:[{key,label,name}] }, right:{ rows:[..], fields:[..] },
            resultCols:[{key, from:'left'|'right', l}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.JMB_CFG || {};
  var L = CFG.left || { rows: [], fields: [] };
  var R = CFG.right || { rows: [], fields: [] };
  var KEY = CFG.joinKey;                  // 조인 키 필드명(양쪽 공통)
  var KLB = CFG.keyLabel || KEY;          // 카드 키 칩에 붙일 라벨
  var UNIT = CFG.unit || '행';
  var SLOTS = ['k10', 'k20', 'k30'];      // 엔진 CSS의 색 슬롯 — 키 값 등장 순서대로 배정
  var hidden = {};   // 키 값 -> true(숨김)
  var leftEl = document.getElementById('jmbLeft');
  var rightEl = document.getElementById('jmbRight');
  var hideEl = document.querySelector('.jmb-hide');
  var bodyEl = document.getElementById('jmbBody');
  var cntEl = document.getElementById('jmbCnt');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  var colorMap = {};
  (function () {
    var n = 0;
    L.rows.concat(R.rows).forEach(function (r) {
      if (!(r[KEY] in colorMap)) { colorMap[r[KEY]] = SLOTS[n] || 'knone'; n++; }
    });
  })();
  function dotClass(v) { return colorMap[v] || 'knone'; }
  function matchOf(v) {
    return R.rows.filter(function (r) { return !hidden[r[KEY]]; })
      .find(function (r) { return r[KEY] === v; });
  }

  function fieldsHtml(row, fields) {
    return (fields || []).map(function (f) {
      var txt = (f.label ? esc(f.label) + ' ' : '') + esc(row[f.key]);
      return '<span class="' + (f.name ? 'nm' : '') + '">' + txt + '</span>';
    }).join('');
  }
  function keyHtml(v) {
    return '<span class="jmb-key"><span class="jmb-dot ' + dotClass(v) + '"></span>' + esc(KLB) + ' ' + esc(v) + '</span>';
  }

  function renderCards() {
    leftEl.innerHTML = L.rows.map(function (r) {
      return '<div class="jmb-card">' + fieldsHtml(r, L.fields) + keyHtml(r[KEY]) + '</div>';
    }).join('');
    rightEl.innerHTML = R.rows.map(function (r) {
      return '<div class="jmb-card' + (hidden[r[KEY]] ? ' dim' : '') + '">' + keyHtml(r[KEY]) + fieldsHtml(r, R.fields) + '</div>';
    }).join('');
  }

  function renderResult() {
    var keep = 0;
    bodyEl.innerHTML = L.rows.map(function (r) {
      var m = matchOf(r[KEY]);
      if (m) keep++;
      var tds = (CFG.resultCols || []).map(function (c) {
        var v = (c.from === 'right') ? (m ? m[c.key] : '—') : r[c.key];
        return '<td class="' + (c.l ? 'l' : '') + '">' + esc(v) + '</td>';
      }).join('');
      var badge = m ? '<span class="badge-keep">매칭 ✔</span>' : '<span class="badge-drop">INNER 제외</span>';
      return '<tr class="' + (m ? 'keep' : 'drop') + '">' + tds + '<td>' + badge + '</td></tr>';
    }).join('');
    var subrc = keep > 0 ? 0 : 4;
    cntEl.innerHTML = 'INNER JOIN 결과 = <b>' + keep + '행</b> &nbsp;(' + esc(CFG.leftNoun || '왼쪽') + ' ' +
      L.rows.length + UNIT + ' 중 ' + keep + UNIT + ' 매칭) &nbsp;·&nbsp; sy-dbcnt = ' + keep + ' &nbsp;·&nbsp; sy-subrc = ' + subrc;
  }

  function renderHideChips() {
    var lbl = (R.fields && R.fields[0]) ? R.fields[0].key : null;
    hideEl.innerHTML = R.rows.map(function (r) {
      var nm = lbl ? '(' + esc(r[lbl]) + ')' : '';
      return '<button class="jmb-chip" type="button" data-k="' + esc(r[KEY]) + '" aria-pressed="false">' +
        esc(CFG.rightNoun || '') + ' ' + esc(r[KEY]) + nm + ' 숨김</button>';
    }).join('');
  }

  if (hideEl) hideEl.addEventListener('click', function (e) {
    var chip = e.target.closest('.jmb-chip'); if (!chip) return;
    var k = chip.getAttribute('data-k');
    hidden[k] = !hidden[k];
    chip.setAttribute('aria-pressed', hidden[k] ? 'true' : 'false');
    renderCards(); renderResult();
  });

  renderHideChips();
  renderCards();
  renderResult();
})();
