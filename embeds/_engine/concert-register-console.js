/* concert-register-console 엔진 — CH14 캡스톤: F4로 공연(zconcert) 선택 → SM30으로 회차 저장(ZPERF) →
   원본 테이블과 ZV_PERF(View, inner join) 결과 비교. 공연 마스터(ZCONCERT) 삭제 시 View에서 행이 빠지는 것 관찰.
   골격 계약: [data-f4] · .crc-pop · #crcPopBody · #crcSel · [data-save] · [data-del] · #crcSrc · #crcView · #crcStatus.
   config: window.CRC_CFG = { master:{C001:'..'}, delId, seedDate }. 높이: _autoheight.js. */
(function () {
  var CFG = window.CRC_CFG || { master: {} };
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
  function artistOf(id) { return (del && id === CFG.delId) ? null : CFG.master[id]; }

  function renderSel() {
    selEl.textContent = sel ? sel + ' · ' + CFG.master[sel] : '(F4로 선택)';
    selEl.classList.toggle('empty', !sel);
    saveBtn.disabled = !sel;
  }
  function renderPop() {
    popBody.innerHTML = Object.keys(CFG.master).map(function (id) {
      return '<tr data-id="' + id + '"><td>' + esc(id) + '</td><td>' + esc(CFG.master[id]) + '</td></tr>';
    }).join('');
  }
  function renderSrc() {
    srcEl.innerHTML = concerts.length
      ? '<table class="crc-tbl"><thead><tr><th>concert_id</th><th>perf_no</th><th>perf_date</th></tr></thead><tbody>' +
        concerts.map(function (c) { return '<tr><td>' + esc(c.concert_id) + '</td><td>' + esc(c.perf_no) + '</td><td>' + esc(c.perf_date) + '</td></tr>'; }).join('') +
        '</tbody></table>'
      : '<div class="crc-empty">아직 등록된 회차가 없습니다. F4로 공연을 골라 저장하세요.</div>';
  }
  function renderView() {
    if (!concerts.length) { viewEl.innerHTML = '<div class="crc-empty">—</div>'; return; }
    viewEl.innerHTML = '<table class="crc-tbl crc-view"><thead><tr><th>concert_id</th><th>perf_no</th><th>artist</th><th>perf_date</th></tr></thead><tbody>' +
      concerts.map(function (c) {
        var name = artistOf(c.concert_id);
        if (name == null) return '<tr class="dropped"><td>' + esc(c.concert_id) + '</td><td>' + esc(c.perf_no) + '</td><td>(마스터 없음)</td><td>' + esc(c.perf_date) + '</td></tr>';
        return '<tr><td>' + esc(c.concert_id) + '</td><td>' + esc(c.perf_no) + '</td><td>' + esc(name) + '</td><td>' + esc(c.perf_date) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }
  function setStatus(cls, html) { statusEl.className = 'crc-status' + (cls ? ' ' + cls : ''); statusEl.innerHTML = html; }
  function render() { renderSel(); renderSrc(); renderView(); }

  document.querySelector('[data-f4]').addEventListener('click', function () { renderPop(); popEl.classList.add('open'); });
  popEl.addEventListener('click', function (e) {
    if (e.target.closest('.x')) { popEl.classList.remove('open'); return; }
    var tr = e.target.closest('tr[data-id]'); if (!tr) return;
    sel = tr.getAttribute('data-id'); popEl.classList.remove('open'); renderSel();
    setStatus('', 'F4로 <b>' + esc(sel) + '</b>(' + esc(CFG.master[sel]) + ')을 골랐습니다. 코드를 직접 타이핑하지 않아 입력 실수가 줄어듭니다. 이제 저장하세요.');
  });
  saveBtn.addEventListener('click', function () {
    if (!sel) return;
    seq++; concerts.push({ concert_id: sel, perf_no: ('00' + seq).slice(-3), perf_date: CFG.seedDate });
    sel = null; render();
    setStatus('ok', '✅ SM30 저장 완료 → 원본 ZPERF에 회차 행이 생기고, ZV_PERF(View)에서 <b>artist</b>가 붙어 함께 보입니다.');
  });
  delBtn.addEventListener('click', function () {
    del = !del; delBtn.setAttribute('aria-pressed', del ? 'true' : 'false'); renderView();
    if (del) setStatus('warn', '⚠️ ZCONCERT에서 <b>' + esc(CFG.delId) + '</b> 마스터를 지웠습니다 — 원본 ZPERF의 회차 행은 남지만, <b>inner join</b>인 ZV_PERF에서는 그 회차들이 빠집니다. 원본 확인 ≠ View 확인.');
    else setStatus('', 'ZCONCERT 마스터를 복구했습니다 — View에 다시 보입니다.');
  });

  render();
  setStatus('', '① <b>F4</b>로 공연 선택 → ② 회차 <b>저장</b> → ③ 원본/View 비교. ④ 마스터 삭제로 inner join 누락도 확인하세요.');
})();
