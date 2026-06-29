/* alv-layout-toggles 엔진 — LVC_S_LAYO 옵션을 토글하면 미리보기 표가 즉시 바뀐다.
   zebra(줄무늬) · cwidth_opt(끄면 긴 고객명 잘림) · grid_title(제목 바) · sel_mode(단일/다중 선택 컬럼).
   바뀌는 건 데이터가 아니라 표 전체 보기 설정임을 강조한다.
   골격 계약: .alt-opts · .alt-sel · #altPreview · #altMsg.
   config: window.ALT_CFG = { cols:[{key,label}], rows:[{}], longKey, title }. 높이: _autoheight.js. */
(function () {
  var CFG = window.ALT_CFG || { cols: [], rows: [], longKey: '', title: '' };
  var st = { zebra: true, cwidth: true, gtitle: true, selMulti: false };

  var optsEl = document.querySelector('.alt-opts');
  var selEl = document.querySelector('.alt-sel');
  var previewEl = document.getElementById('altPreview');
  var msgEl = document.getElementById('altMsg');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  var OPTS = [{ k: 'zebra', l: 'zebra' }, { k: 'cwidth', l: 'cwidth_opt' }, { k: 'gtitle', l: 'grid_title' }];
  function renderOpts() {
    optsEl.innerHTML = OPTS.map(function (o) {
      return '<button type="button" data-k="' + o.k + '" aria-pressed="' + (st[o.k] ? 'true' : 'false') + '">' + esc(o.l) + '</button>';
    }).join('');
  }
  function renderSel() {
    selEl.innerHTML = [{ v: 0, l: 'single' }, { v: 1, l: 'multi (A)' }].map(function (o) {
      return '<button type="button" data-v="' + o.v + '" aria-pressed="' + ((o.v === 1) === st.selMulti ? 'true' : 'false') + '">' + esc(o.l) + '</button>';
    }).join('');
  }
  function renderPreview() {
    var h = '';
    if (st.gtitle) h += '<div class="alt-title">📋 ' + esc(CFG.title) + '</div>';
    var selHead = '<th class="selcol">' + (st.selMulti ? '☑' : '○') + '</th>';
    h += '<table class="alt-tbl"><thead><tr>' + selHead +
      CFG.cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      CFG.rows.map(function (r, i) {
        var sel = '<td class="selcol">' + (st.selMulti ? '☐' : '◯') + '</td>';
        return '<tr class="' + (st.zebra && i % 2 ? 'zb' : '') + '">' + sel +
          CFG.cols.map(function (c) {
            var clip = (c.key === CFG.longKey && !st.cwidth) ? ' class="clip"' : '';
            return '<td' + clip + '>' + esc(r[c.key]) + '</td>';
          }).join('') + '</tr>';
      }).join('') + '</tbody></table>';
    previewEl.innerHTML = h;
  }
  function renderMsg() {
    var on = [];
    if (st.zebra) on.push('zebra'); if (st.cwidth) on.push('cwidth_opt'); if (st.gtitle) on.push('grid_title');
    on.push("sel_mode='" + (st.selMulti ? 'A' : ' ') + "'");
    msgEl.innerHTML = '<b>지금 바뀐 건 데이터가 아니라 표 전체 보기 설정</b>입니다. 켜진 옵션: <code>' + esc(on.join(' · ')) + '</code>' +
      (st.cwidth ? '' : ' · <b>cwidth_opt 꺼짐</b> → 긴 고객명이 잘립니다(…).');
  }
  function render() { renderOpts(); renderSel(); renderPreview(); renderMsg(); }

  optsEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var k = b.getAttribute('data-k'); st[k] = !st[k]; render(); });
  selEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.selMulti = b.getAttribute('data-v') === '1'; render(); });

  render();
})();
