/* option-switchboard 엔진 — SELECT-OPTIONS 한 필드(s_name)에 옵션을 켜고 끄며 화면 모양·내부 selection table 첫 행·복수선택 변화를 본다.
   OBLIGATORY(필수 배지) · LOWER CASE(대문자 변환 여부) · NO-EXTENSION(다중선택 버튼 숨김) · NO INTERVALS(To 칸 숨김).
   NO INTERVALS만 켠 상태의 다중선택 dialog interval 주의도 안내한다.
   골격 계약: .osb-opts · #osbField · #osbRow · #osbStatus.
   config: window.OSB_CFG = { fieldName, fromDefault, toDefault }. 높이: _autoheight.js. */
(function () {
  var CFG = window.OSB_CFG || { fieldName: 's_name', fromDefault: 'aida', toDefault: 'opera' };
  var opt = { oblig: false, lower: false, noext: false, noint: false };
  var fromVal = CFG.fromDefault, toVal = CFG.toDefault;

  var optsEl = document.querySelector('.osb-opts');
  var fieldEl = document.getElementById('osbField');
  var rowEl = document.getElementById('osbRow');
  var statusEl = document.getElementById('osbStatus');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function disp(v) { return opt.lower ? v : String(v).toUpperCase(); }

  var OPTS = [
    { k: 'oblig', l: 'OBLIGATORY' },
    { k: 'lower', l: 'LOWER CASE' },
    { k: 'noext', l: 'NO-EXTENSION' },
    { k: 'noint', l: 'NO INTERVALS' }
  ];

  function renderOpts() {
    optsEl.innerHTML = OPTS.map(function (o) {
      return '<button type="button" data-k="' + o.k + '" aria-pressed="' + (opt[o.k] ? 'true' : 'false') + '">' + esc(o.l) + '</button>';
    }).join('');
  }
  function renderField() {
    var req = opt.oblig ? '<span class="osb-req">*</span>' : '';
    var badge = opt.oblig ? ' <span class="osb-reqbadge">필수</span>' : '';
    var h = '<div class="osb-field"><span class="osb-flbl">' + esc(CFG.fieldName) + req + '</span>' +
      '<input class="osb-in" data-f="from" value="' + esc(disp(fromVal)) + '">';
    if (!opt.noint) {
      h += '<span class="osb-sep">~</span><input class="osb-in" data-f="to" value="' + esc(disp(toVal)) + '">';
    } else {
      h += '<span class="osb-hidden-tag">(To 칸 숨김 — NO INTERVALS)</span>';
    }
    if (!opt.noext) h += '<span class="osb-multi">⇔ 다중 선택</span>';
    else h += '<span class="osb-hidden-tag">(다중선택 버튼 숨김 — NO-EXTENSION)</span>';
    h += badge + '</div>';
    fieldEl.innerHTML = h;
  }
  function renderRow() {
    var option = opt.noint ? 'EQ' : 'BT';
    var low = disp(fromVal), high = opt.noint ? '' : disp(toVal);
    rowEl.innerHTML =
      '<div class="osb-rhd"><span>SIGN</span><span>OPTION</span><span>LOW</span><span>HIGH</span></div>' +
      '<div class="osb-rbd"><span>I</span><span>' + option + '</span><span class="lo">' + esc(low) + '</span><span>' + esc(high || '—') + '</span></div>';
  }
  function renderStatus() {
    var lines = [];
    lines.push('<b>화면 모양</b> — ' + (opt.oblig ? '필수(*) · ' : '') + (opt.noint ? 'To 칸 없음(단일값) · ' : 'From~To 범위 · ') + (opt.noext ? '복수 조건 불가' : '복수 조건 가능(⇔)'));
    lines.push('<b>대소문자</b> — ' + (opt.lower ? '입력 그대로 보존(LOWER CASE)' : '대문자로 변환(기본)') + ' → 내부 LOW = <code>' + esc(disp(fromVal)) + '</code>');
    if (opt.oblig) lines.push('<span class="warn">OBLIGATORY: 비우면 report event 코드 없이도 Execute가 막힙니다.</span>');
    if (opt.noint && !opt.noext) lines.push('<span class="warn">⚠ NO INTERVALS만 켠 상태 — 화면 본 칸엔 To가 없지만, <code>⇔ 다중 선택</code> 창에서는 interval(범위) 입력이 여전히 가능할 수 있습니다.</span>');
    statusEl.innerHTML = lines.map(function (l) { return '<span class="si">' + l + '</span>'; }).join('');
  }
  function render() { renderOpts(); renderField(); renderRow(); renderStatus(); }

  optsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = b.getAttribute('data-k'); opt[k] = !opt[k]; render();
  });
  fieldEl.addEventListener('input', function (e) {
    var f = e.target.getAttribute && e.target.getAttribute('data-f');
    if (!f) return;
    // 입력은 원문 그대로 저장하고, LOWER CASE 여부에 따라 표시/내부값을 계산
    if (f === 'from') fromVal = e.target.value; else toVal = e.target.value;
    renderRow(); renderStatus();
  });

  render();
})();
