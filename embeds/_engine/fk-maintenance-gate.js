/* fk-maintenance-gate 엔진 — Foreign Key를 켜고 끄며 유지보수 화면에서 input check가 잘못된 코드를 막는 걸 시연.
   FK ON: zhall에 없는 hall_id 거부(input check) · FK OFF: 무엇이든 통과(orphan 위험).
   골격 계약: [data-fk] · .fkm-line · .fkm-halls · #fkmBody · #fkmStatus.
   config: window.FKM_CFG = { halls:{H01:'블루홀',...}, options:['H01','H02','H99'] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.FKM_CFG || { halls: {}, options: [] };
  var fk = true, rows = [], seq = 0;
  var fkBtn = document.querySelector('[data-fk]');
  var lineEl = document.querySelector('.fkm-line');
  var hallsEl = document.querySelector('.fkm-halls');
  var bodyEl = document.getElementById('fkmBody');
  var statusEl = document.getElementById('fkmStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function valid(h) { return Object.prototype.hasOwnProperty.call(CFG.halls, h); }

  function renderHalls() {
    var btns = CFG.options.map(function (h) {
      return '<button class="fkm-hall' + (valid(h) ? '' : ' bad') + '" type="button" data-h="' + h + '">' + esc(h) + (valid(h) ? '' : ' (없음)') + '</button>';
    }).join('');
    hallsEl.innerHTML = '<span class="lbl">유지보수: hall_id 입력 →</span>' + btns;
  }
  function renderRows() {
    if (!rows.length) { bodyEl.innerHTML = '<tr><td colspan="3" class="fkm-empty">아직 추가된 행이 없습니다.</td></tr>'; return; }
    bodyEl.innerHTML = rows.map(function (r) {
      var name = CFG.halls[r.hall_id];
      var orphan = !name;
      return '<tr class="' + (orphan ? 'orphan' : '') + '"><td>' + esc(r.concert_id) + '</td>' +
        '<td class="' + (orphan ? 'bad' : '') + '">' + esc(r.hall_id) + '</td>' +
        '<td>' + (name ? esc(name) : '<span class="bad">⚠ 참조 없음(orphan)</span>') + '</td></tr>';
    }).join('');
  }
  function setStatus(cls, html) { statusEl.className = 'fkm-status' + (cls ? ' ' + cls : ''); statusEl.innerHTML = html; }

  function addHall(h) {
    if (fk && !valid(h)) {
      setStatus('err', '✗ <b>input check 거부</b> — <b>' + esc(h) + '</b>은(는) zhall(Check Table)에 없는 코드입니다. Foreign Key가 잘못된 입력을 막았습니다.');
      return;
    }
    seq++; rows.push({ concert_id: 'C' + ('00' + seq).slice(-3), hall_id: h });
    renderRows();
    if (valid(h)) setStatus('ok', '✅ <b>' + esc(h) + '</b>(' + esc(CFG.halls[h]) + ') 저장. Foreign Key가 있으면 존재하는 코드만 통과합니다.');
    else setStatus('warn', '⚠️ FK가 꺼져 <b>' + esc(h) + '</b>가 그대로 저장됐습니다 — zhall에 없는 <b>orphan</b>(참조 무결성 깨짐). 그래서 Foreign Key가 설계의 기준입니다.');
  }

  function render() {
    fkBtn.setAttribute('aria-pressed', fk ? 'true' : 'false');
    fkBtn.textContent = fk ? 'Foreign Key: ON 🔗' : 'Foreign Key: OFF ✂';
    lineEl.classList.toggle('on', fk);
    lineEl.innerHTML = fk ? '──FK──▶<span class="lab">check</span>' : '·· 끊김 ··<span class="lab">no check</span>';
    renderHalls(); renderRows();
  }

  hallsEl.addEventListener('click', function (e) { var b = e.target.closest('.fkm-hall'); if (!b) return; addHall(b.getAttribute('data-h')); });
  fkBtn.addEventListener('click', function () { fk = !fk; render(); setStatus('', fk ? 'Foreign Key를 켰습니다 — 이제 zhall에 없는 코드는 input check가 막습니다.' : 'Foreign Key를 껐습니다 — 이제 어떤 코드든 통과합니다(orphan 위험).'); });

  render();
  setStatus('', '<b>Foreign Key</b>를 켠 채 <b>H99(없음)</b>를 입력해 보세요. input check가 막습니다. FK를 끄면 통과합니다.');
})();
