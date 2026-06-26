/* concert-register-console 엔진 — CH14 캡스톤: F4로 공연(perf) 선택 → SM30 저장(ZCONCERT) →
   원본 테이블과 ZV_CONCERT(View, inner join) 결과 비교. 기준(ZPERF) 삭제 시 View에서 행이 빠지는 것 관찰.
   골격 계약: [data-f4] · .crc-pop · #crcPopBody · #crcSel · [data-save] · [data-del] · #crcSrc · #crcView · #crcStatus.
   config: window.CRC_CFG = { perf:{P001:'..'}, delId, seedDate, seedHall }. 높이: _autoheight.js. */
(function () {
  var CFG = window.CRC_CFG || { perf: {} };
  var sel = null, concerts = [], seq = 0, del = false;
  var popEl = document.querySelector('.crc-pop');
  var popBody = document.getElementById('crcPopBody');
  var selEl = document.getElementById('crcSel');
  var saveBtn = document.querySelector('[data-save]');
  var delBtn = document.querySelector('[data-del]');
  var srcEl = document.getElementById('crcSrc');
  var viewEl = document.getElementById('crcView');
  var statusEl = document.getElementById('crcStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function perfName(id) { return (del && id === CFG.delId) ? null : CFG.perf[id]; }

  function renderSel() {
    selEl.textContent = sel ? sel + ' · ' + CFG.perf[sel] : '(F4로 선택)';
    selEl.classList.toggle('empty', !sel);
    saveBtn.disabled = !sel;
  }
  function renderPop() {
    popBody.innerHTML = Object.keys(CFG.perf).map(function (id) {
      return '<tr data-id="' + id + '"><td>' + esc(id) + '</td><td>' + esc(CFG.perf[id]) + '</td></tr>';
    }).join('');
  }
  function renderSrc() {
    srcEl.innerHTML = concerts.length
      ? '<table class="crc-tbl"><thead><tr><th>concert_id</th><th>perf_id</th><th>date</th><th>hall_id</th></tr></thead><tbody>' +
        concerts.map(function (c) { return '<tr><td>' + esc(c.concert_id) + '</td><td>' + esc(c.perf_id) + '</td><td>' + esc(c.date) + '</td><td>' + esc(c.hall_id) + '</td></tr>'; }).join('') +
        '</tbody></table>'
      : '<div class="crc-empty">아직 등록된 공연이 없습니다. F4로 골라 저장하세요.</div>';
  }
  function renderView() {
    if (!concerts.length) { viewEl.innerHTML = '<div class="crc-empty">—</div>'; return; }
    viewEl.innerHTML = '<table class="crc-tbl crc-view"><thead><tr><th>concert_id</th><th>perf_id</th><th>perf_name</th><th>date</th></tr></thead><tbody>' +
      concerts.map(function (c) {
        var name = perfName(c.perf_id);
        if (name == null) return '<tr class="dropped"><td>' + esc(c.concert_id) + '</td><td>' + esc(c.perf_id) + '</td><td>(기준 없음)</td><td>' + esc(c.date) + '</td></tr>';
        return '<tr><td>' + esc(c.concert_id) + '</td><td>' + esc(c.perf_id) + '</td><td>' + esc(name) + '</td><td>' + esc(c.date) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }
  function setStatus(cls, html) { statusEl.className = 'crc-status' + (cls ? ' ' + cls : ''); statusEl.innerHTML = html; }
  function render() { renderSel(); renderSrc(); renderView(); }

  document.querySelector('[data-f4]').addEventListener('click', function () { renderPop(); popEl.classList.add('open'); });
  popEl.addEventListener('click', function (e) {
    if (e.target.closest('.x')) { popEl.classList.remove('open'); return; }
    var tr = e.target.closest('tr[data-id]'); if (!tr) return;
    sel = tr.getAttribute('data-id'); popEl.classList.remove('open'); renderSel();
    setStatus('', 'F4로 <b>' + esc(sel) + '</b>(' + esc(CFG.perf[sel]) + ')을 골랐습니다. 코드를 직접 타이핑하지 않아 입력 실수가 줄어듭니다. 이제 저장하세요.');
  });
  saveBtn.addEventListener('click', function () {
    if (!sel) return;
    seq++; concerts.push({ concert_id: 'C' + ('00' + seq).slice(-3), perf_id: sel, date: CFG.seedDate, hall_id: CFG.seedHall });
    sel = null; render();
    setStatus('ok', '✅ SM30 저장 완료 → 원본 ZCONCERT에 행이 생기고, ZV_CONCERT(View)에서 <b>perf_name</b>이 붙어 함께 보입니다.');
  });
  delBtn.addEventListener('click', function () {
    del = !del; delBtn.setAttribute('aria-pressed', del ? 'true' : 'false'); renderView();
    if (del) setStatus('warn', '⚠️ ZPERF에서 <b>' + esc(CFG.delId) + '</b> 기준을 지웠습니다 — 원본 ZCONCERT 행은 남지만, <b>inner join</b>인 ZV_CONCERT에서는 그 공연이 빠집니다. 원본 확인 ≠ View 확인.');
    else setStatus('', 'ZPERF 기준을 복구했습니다 — View에 다시 보입니다.');
  });

  render();
  setStatus('', '① <b>F4</b>로 공연 선택 → ② <b>저장</b> → ③ 원본/View 비교. ④ 기준 삭제로 inner join 누락도 확인하세요.');
})();
