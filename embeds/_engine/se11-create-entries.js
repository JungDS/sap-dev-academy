/* se11-create-entries — SE11 Create Entries 손입력 훈련기 엔진.
   config = window.CE_CFG { table, key:['DAN','MUL'], clients:['100','200'], seed:[{client,dan,mul,result}] }.
   저장: 키(현재 client+DAN+MUL) 중복이면 거부. RESULT != DAN*MUL 이면 저장은 되나 경고(값 미검증).
   클라이언트 칩 전환 → 그 client 행만 보임(MANDT 분리). Table Contents 표시. */
(function () {
  var cfg;
  try { cfg = JSON.parse(document.getElementById('ce-cfg').textContent); }
  catch (e) { cfg = { table: 'ZTABLE', clients: ['100', '200'], seed: [] }; }
  var clients = cfg.clients || ['100', '200'];
  var cur = clients[0];
  var rows = (cfg.seed || []).map(function (r) { return { client: String(r.client), dan: +r.dan, mul: +r.mul, result: +r.result }; });

  var $ = function (id) { return document.getElementById(id); };
  var iDan = $('ce-dan'), iMul = $('ce-mul'), iRes = $('ce-res'),
      elMsg = $('ce-msg'), elTbl = $('ce-tbl'), elCnt = $('ce-cnt'), elChips = $('ce-clients');

  function renderChips() {
    elChips.innerHTML = clients.map(function (c) {
      return '<button class="ce__cchip' + (c === cur ? ' on' : '') + '" data-c="' + c + '">MANDT ' + c + '</button>';
    }).join('');
    elChips.querySelectorAll('.ce__cchip').forEach(function (b) {
      b.addEventListener('click', function () { cur = b.dataset.c; renderChips(); renderTable(); msg('idle', '클라이언트 ' + cur + '로 전환 — 이 방(client)에 넣은 행만 보입니다.'); });
    });
  }

  function curRows() { return rows.filter(function (r) { return r.client === cur; }); }

  function renderTable(newKey) {
    var rs = curRows();
    elCnt.textContent = rs.length + '행';
    if (!rs.length) { elTbl.innerHTML = ''; $('ce-empty').style.display = 'block'; return; }
    $('ce-empty').style.display = 'none';
    var body = rs.map(function (r) {
      var wrong = r.result !== r.dan * r.mul;
      var isNew = newKey && (r.dan + 'x' + r.mul) === newKey;
      return '<tr class="' + (wrong ? 'bad-calc ' : '') + (isNew ? 'new' : '') + '">' +
        '<td class="mandt">' + r.client + '</td><td>' + r.dan + '</td><td>' + r.mul + '</td>' +
        '<td class="res">' + r.result + '</td></tr>';
    }).join('');
    elTbl.innerHTML = '<thead><tr><th>MANDT</th><th>DAN</th><th>MUL</th><th>RESULT</th></tr></thead><tbody>' + body + '</tbody>';
  }

  function msg(level, text) {
    elMsg.innerHTML = '<span class="' + level + '"><span class="ico">' +
      (level === 'bad' ? '✕' : level === 'warn' ? '⚠' : level === 'ok' ? '✔' : '·') + '</span>' + text + '</span>';
  }

  function save() {
    var d = parseInt(iDan.value, 10), m = parseInt(iMul.value, 10), r = parseInt(iRes.value, 10);
    if (isNaN(d) || isNaN(m) || isNaN(r)) { msg('bad', 'DAN·MUL·RESULT를 모두 숫자로 입력하세요.'); return; }
    var dup = rows.some(function (x) { return x.client === cur && x.dan === d && x.mul === m; });
    if (dup) { msg('bad', '저장 실패: 같은 키 조합(MANDT ' + cur + ' + DAN ' + d + ' + MUL ' + m + ')이 이미 있습니다. 키는 중복될 수 없습니다.'); return; }
    rows.push({ client: cur, dan: d, mul: m, result: r });
    renderTable(d + 'x' + m);
    if (r !== d * m) {
      msg('warn', '저장됨 — 하지만 ' + d + '×' + m + ' = ' + (d * m) + '인데 RESULT=' + r + '. 키는 중복만 막을 뿐, 계산이 맞는지는 검증하지 않습니다(빨간 행).');
    } else {
      msg('ok', '저장됨: ' + d + ' × ' + m + ' = ' + r + ' (MANDT ' + cur + ').');
    }
    iDan.value = ''; iMul.value = ''; iRes.value = ''; iDan.focus();
    post();
  }

  function fill2and3() {
    // 2단·3단을 현재 client에 자동 채움(이미 있으면 건너뜀)
    var added = 0;
    [2, 3].forEach(function (dan) {
      for (var mul = 1; mul <= 9; mul++) {
        if (!rows.some(function (x) { return x.client === cur && x.dan === dan && x.mul === mul; })) {
          rows.push({ client: cur, dan: dan, mul: mul, result: dan * mul }); added++;
        }
      }
    });
    renderTable();
    msg(added ? 'ok' : 'idle', added ? ('2단·3단 ' + added + '행을 한 번에 채웠습니다(총 18행). 손으로 하면 지치죠?') : '이미 다 채워져 있습니다.');
    post();
  }

  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }

  $('ce-save').addEventListener('click', save);
  var fb = $('ce-fill'); if (fb) fb.addEventListener('click', fill2and3);
  [iDan, iMul, iRes].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') save(); }); });
  renderChips(); renderTable(); msg('idle', 'DAN·MUL·RESULT를 넣고 저장해 보세요. 같은 키를 두 번 넣거나, 계산이 틀린 값을 넣어 보세요.');
  window.addEventListener('load', post); window.addEventListener('resize', post); post();
})();
