/* view-cluster-tree 엔진 — View Cluster의 계층 유지보수: 상위(공연장)를 고르면 하위(좌석등급)가 그 key로 좁혀지고,
   하위 추가는 상위 선택(부모 key 맥락)을 필요로 한다.
   골격 계약: #vctTree · #vctPanelHd · #vctGrid · [data-add] · #vctStatus.
   config: window.VCT_CFG = { halls:[{id,name,grades:[{grade,name,price}]}], presets:[{grade,name,price}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.VCT_CFG || { halls: [], presets: [] };
  var sel = null, pi = 0;
  var treeEl = document.getElementById('vctTree');
  var hdEl = document.getElementById('vctPanelHd');
  var gridEl = document.getElementById('vctGrid');
  var statusEl = document.getElementById('vctStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function hall(id) { return CFG.halls.filter(function (h) { return h.id === id; })[0]; }

  function renderTree() {
    treeEl.innerHTML = CFG.halls.map(function (h) {
      return '<div class="vct-node' + (sel === h.id ? ' sel' : '') + '" data-id="' + h.id + '">' +
        '<span class="ic">▸</span><span>' + esc(h.id) + '</span><span class="nm">' + esc(h.name) + '</span>' +
        '<span class="cnt">등급 ' + h.grades.length + '</span></div>' +
        '<div class="vct-child-hint">└ 좌석등급 (hall_id=' + esc(h.id) + ')</div>';
    }).join('');
  }
  function renderPanel() {
    if (!sel) {
      hdEl.textContent = '좌석등급 (상위 미선택)';
      gridEl.innerHTML = '<div class="vct-empty">← 왼쪽에서 공연장을 먼저 선택하세요.</div>';
      return;
    }
    var h = hall(sel);
    hdEl.innerHTML = '좌석등급 — <b>' + esc(h.id) + ' ' + esc(h.name) + '</b> 아래';
    var rows = h.grades.length
      ? '<table class="vct-tbl"><thead><tr><th>grade</th><th>grade_name</th><th>price</th></tr></thead><tbody>' +
        h.grades.map(function (g) { return '<tr><td>' + esc(g.grade) + '</td><td>' + esc(g.name) + '</td><td>' + esc(g.price) + '</td></tr>'; }).join('') +
        '</tbody></table>'
      : '<div class="vct-empty">아직 등급이 없습니다. 아래에서 추가하세요.</div>';
    gridEl.innerHTML = rows + '<button class="vct-add" type="button" data-add>+ 좌석등급 추가</button>';
  }
  function setStatus(cls, html) { statusEl.className = 'vct-status' + (cls ? ' ' + cls : ''); statusEl.innerHTML = html; }

  treeEl.addEventListener('click', function (e) {
    var n = e.target.closest('.vct-node'); if (!n) return;
    sel = n.getAttribute('data-id'); renderTree(); renderPanel();
    setStatus('ok', '현재 선택: <b>' + esc(sel) + ' ' + esc(hall(sel).name) + '</b> → 하위 좌석등급은 자동으로 <b>hall_id = ' + esc(sel) + '</b> 조건으로 좁혀집니다.');
  });
  gridEl.addEventListener('click', function (e) {
    if (!e.target.closest('[data-add]')) return;
    if (!sel) { setStatus('err', '✗ 상위 공연장을 먼저 고르세요 — 하위 데이터는 부모 key 맥락이 필요합니다.'); return; }
    var p = CFG.presets[pi % CFG.presets.length]; pi++;
    hall(sel).grades.push({ grade: p.grade, name: p.name, price: p.price });
    renderTree(); renderPanel();
    setStatus('ok', '✅ <b>' + esc(sel) + '</b> 아래에 좌석등급 <b>' + esc(p.grade) + '</b>를 추가했습니다(hall_id가 자동으로 채워짐). View Cluster가 부모 맥락을 이어 줍니다.');
  });

  renderTree(); renderPanel();
  setStatus('', '왼쪽 트리에서 공연장을 고르면 그 아래 좌석등급만 보입니다. 상위를 안 고르고 추가하면 어떻게 되는지도 확인하세요.');
})();
