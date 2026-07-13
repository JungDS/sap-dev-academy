/* field-mapping-board 엔진 — CORRESPONDING의 매핑 규칙을 원본/대상 필드로 시연한다.
   같은 이름은 자동, 이름이 다른 필드는 MAPPING(대상=원본), 대상-only 필드는 EXCEPT 또는 초기값, 원본-only 필드는 버려진다.
   토글로 MAPPING/EXCEPT를 켜고 끄면 매핑 표와 생성된 CORRESPONDING 코드가 바뀐다.
   골격 계약: .fmb-toggles · #fmbSource · #fmbMap · #fmbCode.
   config: window.FMB_CFG = { targetType, source:[{name,val}], target:[{name}], mapName, mapFrom, exceptName, dropped }. 높이: _autoheight.js. */
(function () {
  var CFG = window.FMB_CFG || { source: [], target: [], mapName: '', mapFrom: '', exceptName: '', dropped: '' };
  var mapped = false, excepted = false;

  var togEl = document.querySelector('.fmb-toggles');
  var srcEl = document.getElementById('fmbSource');
  var mapEl = document.getElementById('fmbMap');
  var codeEl = document.getElementById('fmbCode');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function srcHas(n) { return CFG.source.some(function (s) { return s.name === n; }); }
  function srcVal(n) { var s = CFG.source.filter(function (x) { return x.name === n; })[0]; return s ? s.val : ''; }

  function renderToggles() {
    togEl.innerHTML =
      '<button type="button" data-t="map" aria-pressed="' + (mapped ? 'true' : 'false') + '">MAPPING ' + esc(CFG.mapName) + ' = ' + esc(CFG.mapFrom) + '</button>' +
      '<button type="button" data-t="exc" aria-pressed="' + (excepted ? 'true' : 'false') + '">EXCEPT ' + esc(CFG.exceptName) + '</button>';
  }
  function renderSource() {
    srcEl.innerHTML = '<span class="st">원본 ls_booking</span>' + CFG.source.map(function (s) {
      var drop = (s.name === CFG.dropped) ? ' drop' : '';
      return '<span class="sf' + drop + '">' + esc(s.name) + '=<span class="v">' + esc(s.val) + '</span></span>';
    }).join('');
  }
  function rowFor(tname) {
    // 같은 이름 자동
    if (srcHas(tname)) return { src: '원본 ' + tname, bd: 'auto', txt: "'" + srcVal(tname) + "' 복사", badge: '자동(같은 이름)' };
    // MAPPING 대상
    if (tname === CFG.mapName) {
      if (mapped) return { src: 'MAPPING ' + CFG.mapName + ' = ' + CFG.mapFrom, bd: 'map', txt: "원본 " + CFG.mapFrom + " '" + srcVal(CFG.mapFrom) + "'", badge: 'MAPPING' };
      return { src: '(이름 달라 자동 못 찾음)', bd: 'warn', txt: '(빈 값)', badge: '⚠ 미연결' };
    }
    // 대상-only (EXCEPT 또는 초기값)
    if (tname === CFG.exceptName) {
      if (excepted) return { src: 'EXCEPT ' + CFG.exceptName, bd: 'except', txt: '채우지 않음', badge: 'EXCEPT' };
      return { src: '(원본에 없음)', bd: 'muted', txt: '(초기값)', badge: '초기값' };
    }
    return { src: '—', bd: 'muted', txt: '(초기값)', badge: '초기값' };
  }
  function renderMap() {
    mapEl.innerHTML = CFG.target.map(function (t) {
      var r = rowFor(t.name);
      return '<div class="fmb-row"><span class="fmb-tf">' + esc(t.name) + '</span><span class="fmb-arr">←</span>' +
        '<span class="fmb-src">' + esc(r.txt) + '</span><span class="fmb-bd ' + r.bd + '">' + esc(r.badge) + '</span></div>';
    }).join('');
  }
  function renderCode() {
    var parts = ['DATA(ls_ui) = CORRESPONDING ts_booking_ui(', '  ls_booking'];
    if (mapped) parts.push('  MAPPING ' + CFG.mapName + ' = ' + CFG.mapFrom);
    if (excepted) parts.push('  EXCEPT  ' + CFG.exceptName);
    var code = parts.join('\n') + ' ).';
    codeEl.innerHTML = esc(code) +
      (CFG.dropped ? '<div class="fmb-drop">⤵ 원본 <code>' + esc(CFG.dropped) + '</code>는 대상 타입에 없어 <b>조용히 버려집니다.</b></div>' : '');
  }
  function render() { renderToggles(); renderSource(); renderMap(); renderCode(); }

  togEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var t = b.getAttribute('data-t'); if (t === 'map') mapped = !mapped; else excepted = !excepted; render(); });

  render();
})();
