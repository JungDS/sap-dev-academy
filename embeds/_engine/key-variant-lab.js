// ===== key-variant-lab 엔진 JS — 같은 데이터, 키 선언만 바꿔 넣어 보기 (CH06-L03) =====
// 변형(키 생략/NON-UNIQUE/UNIQUE) 탭 → 선언 코드 + 키 구성 칩 + [다음 사람 넣기]로
// 한 명씩 넣으며 허용/거부를 관찰. 데이터 = window.KVL_CFG(인스턴스 주입 — 엔진에 레슨 데이터 없음).
// KVL_CFG = { cols:[..], num:[..], people:[[..],..],
//             variants:[{ id, tab, decl:[줄..], keyChip, keyCols:[..],
//                         rows:[{ok,dup?,msg}..], done }..], idle }
(function () {
  var cfg = window.KVL_CFG; if (!cfg) return;
  var root = document.querySelector('[data-kvl]'); if (!root) return;
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  var vi = 0;      // 현재 변형 인덱스
  var put = 0;     // 넣기 완료한 사람 수(대기열 소비 수)
  var inRows = []; // 실제 들어간 행 인덱스(people 기준)

  function variant() { return cfg.variants[vi]; }

  function declHTML() {
    var v = variant();
    return '<div class="kvl-code"><div class="kvl-code__hd"><span class="kvl-dots"><i></i><i></i><i></i></span><span>선언 (ABAP)</span></div><pre>' +
      v.decl.map(esc).join('\n') + '</pre></div>' +
      '<div class="kvl-key">🔑 이 선언의 키: <b>' + v.keyChip + '</b></div>';
  }

  function tableHTML() {
    var v = variant(), cols = cfg.cols, num = cfg.num || [];
    var h = '<table class="kvl-t"><thead><tr><th class="ix">#</th>';
    cols.forEach(function (c) {
      var isKey = v.keyCols.indexOf(c) >= 0;
      h += '<th' + (isKey ? ' class="key"' : '') + '>' + esc(c) + (isKey ? ' <span class="kb">키</span>' : '') + '</th>';
    });
    h += '</tr></thead><tbody>';
    if (!inRows.length) h += '<tr class="empty"><td colspan="' + (cols.length + 1) + '">비어 있음 · 0행</td></tr>';
    inRows.forEach(function (pIdx, i) {
      var r = cfg.people[pIdx], res = v.rows[pIdx] || {};
      var cls = [];
      if (i === inRows.length - 1 && lastAct === 'in') cls.push('new');
      if (res.dup) cls.push('dup');
      h += '<tr' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '><td class="ix">' + (i + 1) + '</td>';
      r.forEach(function (cVal, j) {
        var isKey = v.keyCols.indexOf(cols[j]) >= 0;
        h += '<td class="' + (num[j] ? 'n ' : '') + (isKey ? 'key' : '') + '">' + esc(String(cVal)) + '</td>';
      });
      h += '</tr>';
    });
    return h + '</tbody></table>';
  }

  function queueHTML() {
    var h = '<div class="kvl-q"><span class="kvl-q__lab">넣을 사람</span>';
    cfg.people.forEach(function (p, i) {
      var st = i < put ? (variant().rows[i].ok ? 'done' : 'rej') : (i === put ? 'next' : '');
      h += '<span class="kvl-chip ' + st + '">' + esc(p.join(' · ')) +
        (st === 'done' ? ' ✓' : st === 'rej' ? ' ✕' : '') + '</span>';
    });
    return h + '</div>';
  }

  var lastAct = ''; // 'in' | 'rej' | ''
  function render() {
    var v = variant();
    var tabs = cfg.variants.map(function (x, i) {
      return '<button type="button" class="kvl-tab' + (i === vi ? ' on' : '') + '" data-v="' + i + '">' + esc(x.tab) + '</button>';
    }).join('');
    var doneAll = put >= cfg.people.length;
    var btns = '<div class="kvl-btns">' +
      '<button type="button" class="kvl-btn primary" data-put' + (doneAll ? ' disabled' : '') + '>⏭ 다음 사람 넣기</button>' +
      '<button type="button" class="kvl-btn" data-reset>↻ 처음부터</button></div>';
    var msg;
    if (!put) msg = '<div class="kvl-msg idle">' + (cfg.idle || '⏭ 버튼으로 한 명씩 넣어 보세요.') + '</div>';
    else {
      var res = v.rows[put - 1];
      msg = '<div class="kvl-msg ' + (res.ok ? (res.dup ? 'warn' : 'ok') : 'bad') + '">' + res.msg + '</div>';
    }
    if (doneAll) msg += '<div class="kvl-done">' + v.done + '</div>';
    root.innerHTML = '<div class="kvl-tabs">' + tabs + '</div>' + declHTML() + queueHTML() + btns + tableHTML() + msg;
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('.kvl-tab');
    if (t) { vi = +t.dataset.v; put = 0; inRows = []; lastAct = ''; render(); return; }
    if (e.target.closest('[data-put]')) {
      if (put >= cfg.people.length) return;
      var res = variant().rows[put];
      if (res.ok) { inRows.push(put); lastAct = 'in'; } else lastAct = 'rej';
      put++; render(); return;
    }
    if (e.target.closest('[data-reset]')) { put = 0; inRows = []; lastAct = ''; render(); }
  });

  render();
})();
