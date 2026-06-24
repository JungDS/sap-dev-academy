/* alv-events — ALV 이벤트 시뮬 엔진 (CH27 L01~L04 공통).
   위젯의 <script type="application/json" id="alv-cfg">에서 { mode } 를 읽는다.
   mode: 'double'(더블클릭) | 'hotspot'(링크 셀) | 'toolbar'(커스텀 버튼 추가) | 'ucommand'(선택+버튼→취소).
   상호작용 → 이벤트 로그(핸들러 메서드 + e_* 파라미터)로 보여 준다. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cfg; try { cfg = JSON.parse($('alv-cfg').textContent); } catch (e) { cfg = { mode: 'double' }; }
  var mode = cfg.mode;
  var ROWS = [
    { id: '1001', concert: 'C-NOVA', pax: '정훈영', seats: 2, st: 'O' },
    { id: '1002', concert: 'C-AURA', pax: '아이유', seats: 4, st: 'O' },
    { id: '1003', concert: 'C-NOVA', pax: '손흥민', seats: 2, st: 'O' }
  ];
  var sel = {};

  function log(ev, params) {
    var ln = document.createElement('div'); ln.className = 'ln';
    ln.innerHTML = '<span class="ev">' + ev + '</span>' + (params ? ' <span class="p">' + params + '</span>' : '');
    var box = $('log'); if (box.querySelector('.ph')) box.innerHTML = '';
    box.appendChild(ln); box.scrollTop = box.scrollHeight; post();
  }

  function render() {
    // 툴바
    var bar = '<span class="tb std">🔍 찾기</span><span class="tb std">⤓ 엑셀</span><span class="tb std">▲▼ 정렬</span>';
    if (mode === 'toolbar' || mode === 'ucommand') bar += '<span class="sep"></span><span class="tb cust" id="btnCancel">🗑 예매 취소 <small>(ZCANCEL)</small></span>';
    $('bar').innerHTML = bar;
    // 헤더
    var selCol = (mode === 'ucommand') ? '<th class="sel">☐</th>' : '';
    $('thead').innerHTML = '<tr>' + selCol + '<th>booking_id</th><th>concert_id</th><th>승객</th><th>좌석</th><th>상태</th></tr>';
    // 바디
    $('tbody').innerHTML = ROWS.map(function (r, i) {
      var sc = (mode === 'ucommand') ? '<td class="sel"><input type="checkbox" data-i="' + i + '" ' + (sel[i] ? 'checked' : '') + '></td>' : '';
      var concert = (mode === 'hotspot') ? '<td class="hot" data-i="' + i + '">' + r.concert + '</td>' : '<td>' + r.concert + '</td>';
      var cls = (mode === 'double') ? 'click' : '';
      if (r.st === 'X') cls += ' cancelled';
      return '<tr class="' + cls + '" data-i="' + i + '">' + sc + '<td>' + r.id + '</td>' + concert + '<td>' + r.pax + '</td><td>' + r.seats + '</td><td>' + r.st + '</td></tr>';
    }).join('');
    bind();
    post();
  }

  function bind() {
    if (mode === 'double') {
      [].forEach.call($('tbody').querySelectorAll('tr'), function (tr) {
        tr.addEventListener('dblclick', function () {
          var r = ROWS[+tr.dataset.i];
          log('on_double_click', 'e_row-index=' + (+tr.dataset.i + 1) + '  e_column=BOOKING_ID  → 예매 ' + r.id + ' 상세');
        });
      });
    }
    if (mode === 'hotspot') {
      [].forEach.call($('tbody').querySelectorAll('td.hot'), function (td) {
        td.addEventListener('click', function () {
          var r = ROWS[+td.dataset.i];
          log('on_hotspot_click', 'e_row_id-index=' + (+td.dataset.i + 1) + '  e_column_id=CONCERT_ID  → 공연 ' + r.concert + ' 상세');
        });
      });
    }
    if (mode === 'ucommand') {
      [].forEach.call($('tbody').querySelectorAll('input[type=checkbox]'), function (cb) {
        cb.addEventListener('change', function () { sel[+cb.dataset.i] = cb.checked; });
      });
    }
    if (mode === 'toolbar' || mode === 'ucommand') {
      var btn = $('btnCancel');
      if (btn) btn.addEventListener('click', function () {
        if (mode === 'toolbar') { log('toolbar', '버튼 추가됨 → function=ZCANCEL (눌리면 user_command로 — 다음 레슨)'); return; }
        var picked = Object.keys(sel).filter(function (k) { return sel[k]; }).map(Number);
        if (!picked.length) { log('on_user_command', 'e_ucomm=ZCANCEL  ⚠ 선택된 행 없음 — 안내 후 종료'); return; }
        log('on_user_command', 'e_ucomm=ZCANCEL  선택 행=' + picked.map(function (i) { return ROWS[i].id; }).join(',') + '  → 취소 처리(DML+잠금: CH24/25)');
        picked.forEach(function (i) { ROWS[i].st = 'X'; sel[i] = false; });
        render(); log('refresh_table_display', '취소 반영 후 갱신');
      });
    }
  }

  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
