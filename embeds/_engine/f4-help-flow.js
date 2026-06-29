/* f4-help-flow 엔진 — 입력 필드에 F4 → Help View 결과 팝업 → 행 선택 시 key가 화면으로 복귀.
   토글: 설명 누락(보조 테이블 outer → primary 유지·설명 빈칸), Export OFF(선택해도 복귀 안 함).
   골격 계약: #f4Input · [data-f4] · .f4-pop · #f4PopBody · [data-miss] · [data-exp] · #f4Status.
   config: window.F4_CFG = { field, cols:[{key,label}], rows:[{perf_id,perf_name,genre,description}], missId }. 높이: _autoheight.js. */
(function () {
  var CFG = window.F4_CFG || { rows: [], cols: [] };
  var val = '', miss = false, exp = false;
  var inputEl = document.getElementById('f4Input');
  var popEl = document.querySelector('.f4-pop');
  var popBody = document.getElementById('f4PopBody');
  var statusEl = document.getElementById('f4Status');
  var missBtn = document.querySelector('[data-miss]');
  var expBtn = document.querySelector('[data-exp]');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function descOf(r) { return (miss && r.perf_id === CFG.missId) ? '' : r.description; }

  function renderInput() {
    inputEl.textContent = val || '(비어 있음)';
    inputEl.classList.toggle('empty', !val);
  }
  function renderPop() {
    popBody.innerHTML = CFG.rows.map(function (r) {
      var d = descOf(r);
      return '<tr data-id="' + r.perf_id + '"><td>' + esc(r.perf_id) + '</td><td>' + esc(r.perf_name) + '</td><td>' + esc(r.genre) + '</td>' +
        '<td class="' + (d ? '' : 'blank') + '">' + (d ? esc(d) : '(설명 없음)') + '</td></tr>';
    }).join('');
  }
  function setStatus(cls, html) { statusEl.className = 'f4-status' + (cls ? ' ' + cls : ''); statusEl.innerHTML = html; }

  document.querySelector('[data-f4]').addEventListener('click', function () {
    renderPop(); popEl.classList.add('open');
    setStatus('', '🔍 Help View <b>ZHV_PERF</b>가 코드·공연명·장르·설명을 보여 줍니다. 한 행을 고르세요.');
  });
  popEl.addEventListener('click', function (e) {
    if (e.target.closest('.x')) { popEl.classList.remove('open'); return; }
    var tr = e.target.closest('tr[data-id]'); if (!tr) return;
    var id = tr.getAttribute('data-id');
    popEl.classList.remove('open');
    if (exp) {
      setStatus('warn', '⚠️ <b>' + id + '</b>을(를) 골랐지만 화면 필드가 그대로입니다 — Export Parameter가 없으면 선택값이 안 돌아옵니다. (F4 목록 표시와 값 복귀는 별도 설정)');
      return;
    }
    val = id; renderInput();
    setStatus('ok', '✅ 사용자는 <b>설명</b>을 보고 골랐지만, 화면 필드에는 <b>key(' + id + ')</b>가 돌아왔습니다. F4 = DDIC↔화면 데이터 흐름.');
  });
  if (missBtn) missBtn.addEventListener('click', function () {
    miss = !miss; missBtn.setAttribute('aria-pressed', miss ? 'true' : 'false');
    if (popEl.classList.contains('open')) renderPop();
    if (miss) setStatus('', 'ℹ️ 보조 설명 테이블에서 <b>' + CFG.missId + '</b>행을 뺐습니다. Help View는 <b>primary table 보존(outer)</b>이라 ' + CFG.missId + '는 목록에 남고 <b>설명만 비어</b> 보입니다. (F4 다시 눌러 확인)');
  });
  if (expBtn) expBtn.addEventListener('click', function () {
    exp = !exp; expBtn.setAttribute('aria-pressed', exp ? 'true' : 'false');
    setStatus('', exp ? 'Export Parameter를 <b>껐습니다</b>. 이제 행을 골라도 화면에 값이 안 돌아옵니다 — F4 다시 눌러 확인.' : 'Export Parameter를 켰습니다. 선택한 key가 화면으로 돌아옵니다.');
  });

  renderInput();
  setStatus('', '입력 필드 옆 <b>F4</b>를 눌러 공연을 검색해 보세요.');
})();
