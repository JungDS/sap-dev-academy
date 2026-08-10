/* view-cluster-tree 엔진 — View Cluster의 계층 유지보수: 상위를 고르면 하위가 그 key로 좁혀지고,
   하위 추가는 상위 선택(부모 key 맥락)을 필요로 한다. 계층 이름은 cfg(parentNoun·childNoun)에서 받는다
   — 엔진에 특정 시나리오 레이블을 하드코딩하면 데이터와 다른 말을 하게 된다.
   골격 계약: #vctTree · #vctPanelHd · #vctGrid · [data-add] · #vctStatus.
   config: window.VCT_CFG = { concerts:[{id,name,perfs:[{no,date}]}], presets:[{no,date}], parentNoun, childNoun }.
   높이: _autoheight.js. */
(function () {
  var CFG = window.VCT_CFG || { concerts: [], presets: [] };
  var PN = CFG.parentNoun || '상위', CN = CFG.childNoun || '하위';
  var sel = null, pi = 0;
  var treeEl = document.getElementById('vctTree');
  var hdEl = document.getElementById('vctPanelHd');
  var gridEl = document.getElementById('vctGrid');
  var statusEl = document.getElementById('vctStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function parentOf(id) { return CFG.concerts.filter(function (h) { return h.id === id; })[0]; }
  // 받침 유무로 조사 선택 — cfg 명사가 바뀌어도 문장이 자연스럽게
  function jo(w, withB, noB) {
    var s = String(w), c = s.charCodeAt(s.length - 1);
    var has = (c >= 0xAC00 && c <= 0xD7A3) ? ((c - 0xAC00) % 28 !== 0) : true;
    return s + (has ? withB : noB);
  }

  function renderTree() {
    treeEl.innerHTML = CFG.concerts.map(function (h) {
      return '<div class="vct-node' + (sel === h.id ? ' sel' : '') + '" data-id="' + h.id + '">' +
        '<span class="ic">▸</span><span>' + esc(h.id) + '</span><span class="nm">' + esc(h.name) + '</span>' +
        '<span class="cnt">' + esc(CN) + ' ' + h.perfs.length + '</span></div>' +
        '<div class="vct-child-hint">└ ' + esc(CN) + ' (concert_id=' + esc(h.id) + ')</div>';
    }).join('');
  }
  function addBtn() { return '<button class="vct-add" type="button" data-add>+ ' + esc(CN) + ' 추가</button>'; }
  function renderPanel() {
    if (!sel) {
      hdEl.textContent = CN + ' (' + PN + ' 미선택)';
      // 미선택 상태에서도 추가 버튼을 둔다 — 안내가 "상위를 안 고르고 추가해 보라"고 시키는데
      // 버튼이 없으면 그 실습(오류 안내)에 도달할 수 없다.
      gridEl.innerHTML = '<div class="vct-empty">← 왼쪽에서 ' + esc(jo(PN, '을', '를')) + ' 먼저 선택하세요.</div>' + addBtn();
      return;
    }
    var h = parentOf(sel);
    hdEl.innerHTML = esc(CN) + ' — <b>' + esc(h.id) + ' ' + esc(h.name) + '</b> 아래';
    var rows = h.perfs.length
      ? '<table class="vct-tbl"><thead><tr><th>perf_no</th><th>perf_date</th></tr></thead><tbody>' +
        h.perfs.map(function (g) { return '<tr><td>' + esc(g.no) + '</td><td>' + esc(g.date) + '</td></tr>'; }).join('') +
        '</tbody></table>'
      : '<div class="vct-empty">아직 ' + esc(jo(CN, '이', '가')) + ' 없습니다. 아래에서 추가하세요.</div>';
    gridEl.innerHTML = rows + addBtn();
  }
  function setStatus(cls, html) { statusEl.className = 'vct-status' + (cls ? ' ' + cls : ''); statusEl.innerHTML = html; }

  treeEl.addEventListener('click', function (e) {
    var n = e.target.closest('.vct-node'); if (!n) return;
    sel = n.getAttribute('data-id'); renderTree(); renderPanel();
    setStatus('ok', '현재 선택: <b>' + esc(sel) + ' ' + esc(parentOf(sel).name) + '</b> → 하위 ' + esc(jo(CN, '은', '는')) + ' 자동으로 <b>concert_id = ' + esc(sel) + '</b> 조건으로 좁혀집니다.');
  });
  gridEl.addEventListener('click', function (e) {
    if (!e.target.closest('[data-add]')) return;
    if (!sel) { setStatus('err', '✗ 상위 ' + esc(jo(PN, '을', '를')) + ' 먼저 고르세요 — 하위 데이터는 부모 key 맥락이 필요합니다.'); return; }
    var p = CFG.presets[pi % CFG.presets.length]; pi++;
    parentOf(sel).perfs.push({ no: p.no, date: p.date });
    renderTree(); renderPanel();
    setStatus('ok', '✅ <b>' + esc(sel) + '</b> 아래에 ' + esc(CN) + ' <b>' + esc(p.no) + '</b>를 추가했습니다(concert_id가 자동으로 채워짐). View Cluster가 부모 맥락을 이어 줍니다.');
  });

  renderTree(); renderPanel();
  setStatus('', '왼쪽 트리에서 ' + esc(jo(PN, '을', '를')) + ' 고르면 그 아래 ' + esc(CN) + '만 보입니다. 상위를 안 고르고 추가하면 어떻게 되는지도 확인하세요.');
})();
