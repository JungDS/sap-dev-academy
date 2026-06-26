/* selscreen-layout-builder 엔진 — 가짜 선택화면 미리보기에서 본문 PUSHBUTTON·툴바 FUNCTION KEY를 눌러
   SSCRFIELDS-UCOMM에 어떤 코드(REF/FC01)가 들어오는지 본다. 두 판단 토글로 흔한 실수를 경고한다:
   (1) 버튼 처리 SY-UCOMM 선택 → 선택화면에선 안 잡힘 경고, (2) COMMENT에 FOR FIELD 없음 → 도움말 연결 약함 경고.
   골격 계약: #slbPreview · .slb-handle · .slb-comment · #slbConsole.
   config: window.SLB_CFG = { concertId }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SLB_CFG || { concertId: 'C001' };
  var handle = 'sscr';   // 'sscr' | 'sy'
  var comment = 'on';    // 'on' | 'off'
  var radio = 'sum';     // 'sum' | 'det'
  var last = null;       // {code,label,msg}

  var previewEl = document.getElementById('slbPreview');
  var handleEl = document.querySelector('.slb-handle');
  var commentEl = document.querySelector('.slb-comment');
  var consoleEl = document.getElementById('slbConsole');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function renderPreview() {
    var cmt = comment === 'on'
      ? '<span class="slb-comment-txt linked">※ 공연 코드를 입력하세요 (FOR FIELD p_conc 연결됨)</span>'
      : '<span class="slb-comment-txt weak">※ 공연 코드를 입력하세요 (FOR FIELD 없음 — 연결 약함)</span>';
    previewEl.innerHTML =
      '<div class="slb-toolbar"><span class="tlabel">application toolbar</span>' +
        '<button class="slb-fkey" data-uc="FC01" data-label="도움말">도움말 (FC01)</button></div>' +
      '<div class="slb-frame"><span class="ftitle">기본 조건</span>' +
        '<div class="slb-line"><span class="flbl">p_conc</span><input type="text" value="' + esc(CFG.concertId) + '" readonly></div>' +
        '<div class="slb-line">' + cmt + '</div>' +
        '<div class="slb-line"><span class="slb-chk"><input type="checkbox"> p_all (전체 포함)</span></div>' +
        '<div class="slb-line"><span class="slb-radio">' +
          '<span><i class="slb-dot ' + (radio === 'sum' ? 'on' : '') + '" data-r="sum"></i> 요약(p_sum)</span>' +
          '<span><i class="slb-dot ' + (radio === 'det' ? 'on' : '') + '" data-r="det"></i> 상세(p_det)</span>' +
        '</span></div>' +
        '<button class="slb-pushbtn" data-uc="REF" data-label="조건 새로고침">조건 새로고침 (REF)</button>' +
      '</div>';
  }
  function renderSeg(host, items, active, bad) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '"' + (bad && it.v === bad ? ' data-bad="1"' : '') +
        ' aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + esc(it.l) + '</button>';
    }).join('');
  }
  function renderConsole() {
    var h = '';
    if (handle === 'sy') h += '<div class="slb-warn err">⚠ SY-UCOMM 사용 — 선택화면 버튼은 <b>SSCRFIELDS-UCOMM</b>으로 받아야 합니다. SY-UCOMM으로는 버튼이 잡히지 않습니다.</div>';
    if (comment === 'off') h += '<div class="slb-warn amber">⚠ COMMENT에 <b>FOR FIELD</b>가 없습니다 — 설명이 입력칸과 연결되지 않아 F1 도움말 사용성이 약합니다.</div>';

    if (last) {
      if (handle === 'sscr') {
        h += '<div class="slb-crow"><span class="slb-ck">SSCRFIELDS-UCOMM</span><span class="slb-cv mono">\'' + esc(last.code) + '\'</span></div>' +
          '<div class="slb-crow"><span class="slb-ck">반응</span><span class="slb-cv">' + last.msg + '</span></div>';
      } else {
        h += '<div class="slb-crow"><span class="slb-ck">버튼: ' + esc(last.label) + '</span><span class="slb-cv" style="color:var(--bad);font-weight:700">눌렀지만 SY-UCOMM으로는 잡히지 않음 — 처리 누락</span></div>';
      }
    } else if (!h) {
      h = '<div class="slb-empty">미리보기의 버튼(조건 새로고침 / 도움말)을 눌러 보세요.</div>';
    }
    consoleEl.innerHTML = h;
  }
  function render() {
    renderPreview();
    renderSeg(handleEl, [{ v: 'sscr', l: 'SSCRFIELDS-UCOMM' }, { v: 'sy', l: 'SY-UCOMM' }], handle, 'sy');
    renderSeg(commentEl, [{ v: 'on', l: 'FOR FIELD 있음' }, { v: 'off', l: '없음' }], comment, 'off');
    renderConsole();
  }

  previewEl.addEventListener('click', function (e) {
    var dot = e.target.closest('.slb-dot');
    if (dot) { radio = dot.getAttribute('data-r'); render(); return; }
    var b = e.target.closest('[data-uc]'); if (!b) return;
    var code = b.getAttribute('data-uc'), label = b.getAttribute('data-label');
    var msg = code === 'REF' ? 'MESSAGE S "조건을 다시 계산했습니다"' : 'MESSAGE I "이 리포트는 공연 예매 조회용입니다"';
    last = { code: code, label: label, msg: msg };
    render();
  });
  handleEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; handle = b.getAttribute('data-v'); render(); });
  commentEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; comment = b.getAttribute('data-v'); render(); });

  render();
})();
