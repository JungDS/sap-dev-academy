/* sm30-gate-checklist 엔진 — SM30 유지보수 화면이 열리려면 모든 조건(게이트)이 맞아야 함을 시연.
   게이트: 테이블 활성화 → 유지보수 허용 → TMG 생성 → 권한 OK. SM30 실행 시 하나라도 빠지면 막힌다.
   골격 계약: #sgcGates · .sgc-pipe · [data-run] · #sgcStatus · #sgcGrid(.sgc-tbl).
   config: window.SGC_CFG = { gates:[{key,label,sub}], gridCols:[{key,label}], gridRows:[{}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SGC_CFG || { gates: [], gridCols: [], gridRows: [] };
  var on = {};
  CFG.gates.forEach(function (g) { on[g.key] = false; });
  var gatesEl = document.getElementById('sgcGates');
  var pipeEl = document.querySelector('.sgc-pipe');
  var statusEl = document.getElementById('sgcStatus');
  var gridEl = document.getElementById('sgcGrid');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function firstOff() { for (var i = 0; i < CFG.gates.length; i++) if (!on[CFG.gates[i].key]) return CFG.gates[i]; return null; }

  function renderGates() {
    gatesEl.innerHTML = CFG.gates.map(function (g) {
      return '<label class="sgc-gate' + (on[g.key] ? ' on' : '') + '"><input type="checkbox" data-k="' + g.key + '"' + (on[g.key] ? ' checked' : '') + '>' +
        '<span class="g-name">' + esc(g.label) + '</span><span class="g-sub">' + esc(g.sub || '') + '</span></label>';
    }).join('');
  }
  function renderPipe() {
    var steps = CFG.gates.map(function (g) { return '<span class="step' + (on[g.key] ? ' on' : '') + '">' + (on[g.key] ? '✓ ' : '') + esc(g.short || g.label) + '</span>'; });
    var allOn = CFG.gates.every(function (g) { return on[g.key]; });
    steps.push('<span class="step final' + (allOn ? ' on' : '') + '">SM30 OPEN</span>');
    pipeEl.innerHTML = steps.join('<span class="arr">▸</span>');
  }
  function renderGrid(show) {
    gridEl.classList.toggle('hide', !show);
    if (!show) return;
    var t = gridEl.querySelector('.sgc-tbl');
    t.innerHTML = '<thead><tr>' + CFG.gridCols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + CFG.gridRows.map(function (r) { return '<tr>' + CFG.gridCols.map(function (c) { return '<td>' + esc(r[c.key]) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>';
  }
  function setStatus(cls, html) { statusEl.className = 'sgc-status' + (cls ? ' ' + cls : ''); statusEl.innerHTML = html; }

  function run() {
    var miss = firstOff();
    if (miss) {
      renderGrid(false);
      setStatus('err', '✗ SM30이 안 열립니다 — <b>' + esc(miss.label) + '</b> 단계가 빠졌습니다. SM30은 마법 주소가 아니라 모든 조건이 맞아야 열리는 표준 통로입니다.');
    } else {
      renderGrid(true);
      setStatus('ok', '✅ SM30 유지보수 그리드가 열렸습니다. 업무 담당자가 ABAP 프로그램 없이 표준 화면에서 기준 데이터를 관리합니다.');
    }
  }

  gatesEl.addEventListener('change', function (e) {
    var cb = e.target.closest('input[data-k]'); if (!cb) return;
    on[cb.getAttribute('data-k')] = cb.checked; renderGates(); renderPipe();
    renderGrid(false); setStatus('', '게이트를 모두 켠 뒤 <b>▶ SM30 실행</b>을 눌러 보세요.');
  });
  document.querySelector('[data-run]').addEventListener('click', run);

  renderGates(); renderPipe(); renderGrid(false);
  setStatus('', '게이트가 모두 꺼져 있습니다. 하나씩 켜고 <b>▶ SM30 실행</b>으로 무엇이 막는지 확인하세요.');
})();
