/* option-switchboard 엔진 — SELECT-OPTIONS 한 필드(so_name)에 옵션을 켜고 끄며 화면 모양·내부 selection table 첫 행·복수선택 변화를 본다.
   OBLIGATORY(필수 배지) · LOWER CASE(대문자 변환 여부) · NO-EXTENSION(다중선택 버튼 숨김) · NO INTERVALS(To 칸 숨김).
   '⇔ 다중 선택' 버튼은 실제로 다중 선택 창을 열어 조건 행을 더 넣을 수 있고,
   NO INTERVALS만 켠 상태에서도 그 창에서는 interval(To) 입력이 살아 있다는 걸 직접 보여 준다.
   골격 계약: .osb-opts · #osbField · #osbMulti · #osbRow · #osbStatus.
   config: window.OSB_CFG = { fieldName, fromDefault, toDefault }. 높이: _autoheight.js. */
(function () {
  var CFG = window.OSB_CFG || { fieldName: 'so_name', fromDefault: 'aida', toDefault: 'opera' };
  var opt = { oblig: false, lower: false, noext: false, noint: false };
  var fromVal = CFG.fromDefault, toVal = CFG.toDefault;
  var multiOpen = false;          // 다중 선택 창 열림 여부
  var extra = [];                 // 다중 선택 창에서 추가한 조건 행 [{low, high}]
  var draft = { low: '', high: '' };

  var optsEl = document.querySelector('.osb-opts');
  var fieldEl = document.getElementById('osbField');
  var multiEl = document.getElementById('osbMulti');
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
    if (!opt.noext) h += '<button type="button" class="osb-multi" data-multi aria-expanded="' + (multiOpen ? 'true' : 'false') + '">⇔ 다중 선택</button>';
    else h += '<span class="osb-hidden-tag">(다중선택 버튼 숨김 — NO-EXTENSION)</span>';
    h += badge + '</div>';
    fieldEl.innerHTML = h;
  }
  function renderMulti() {
    if (!multiOpen || opt.noext) { multiEl.innerHTML = ''; return; }
    var list = extra.length
      ? extra.map(function (r, i) {
          return '<div class="osb-mrow"><span class="mopt">' + (r.high ? 'BT' : 'EQ') + '</span>' +
            '<span class="mval">' + esc(disp(r.low)) + (r.high ? ' ~ ' + esc(disp(r.high)) : '') + '</span>' +
            '<button type="button" class="osb-mdel" data-del="' + i + '">✕</button></div>';
        }).join('')
      : '<div class="osb-mempty">아직 추가한 줄이 없습니다 — 아래에서 한 줄 넣어 보세요.</div>';
    multiEl.innerHTML =
      '<div class="osb-modal"><div class="osb-mbar">다중 선택 (Multiple Selection) — ' + esc(CFG.fieldName) +
        '<button type="button" class="osb-mclose" data-mclose>닫기</button></div>' +
      '<div class="osb-mbody">' +
        '<p class="osb-mh">선택 항목 (Select Single Values / Ranges)</p>' + list +
        '<div class="osb-madd">' +
          '<input class="osb-in" data-m="low" placeholder="Low" value="' + esc(draft.low) + '">' +
          '<span class="osb-sep">~</span>' +
          '<input class="osb-in" data-m="high" placeholder="High (선택)" value="' + esc(draft.high) + '">' +
          '<button type="button" class="osb-madd-btn" data-add>+ 줄 추가</button>' +
        '</div>' +
        (opt.noint
          ? '<p class="osb-mwarn">⚠ 화면 본 칸에는 <code>NO INTERVALS</code>로 To가 숨겨져 있지만, <b>이 창의 High 칸은 그대로 살아 있습니다</b> — 범위 조건이 여전히 들어갈 수 있습니다.</p>'
          : '<p class="osb-mnote">여기서 넣은 줄은 아래 selection table에 조건 행으로 쌓입니다(<code>APPEND</code>와 같은 자리).</p>') +
      '</div></div>';
  }
  function renderRow() {
    var option = opt.noint ? 'EQ' : 'BT';
    var low = disp(fromVal), high = opt.noint ? '' : disp(toVal);
    var rows = '<div class="osb-rbd"><span>I</span><span>' + option + '</span><span class="lo">' + esc(low) + '</span><span>' + esc(high || '—') + '</span></div>';
    rows += extra.map(function (r) {
      return '<div class="osb-rbd extra"><span>I</span><span>' + (r.high ? 'BT' : 'EQ') + '</span>' +
        '<span class="lo">' + esc(disp(r.low)) + '</span><span>' + esc(r.high ? disp(r.high) : '—') + '</span></div>';
    }).join('');
    rowEl.innerHTML =
      '<div class="osb-rhd"><span>SIGN</span><span>OPTION</span><span>LOW</span><span>HIGH</span></div>' + rows;
  }
  function renderStatus() {
    var lines = [];
    lines.push('<b>화면 모양</b> — ' + (opt.oblig ? '필수(*) · ' : '') + (opt.noint ? 'To 칸 없음(단일값) · ' : 'From~To 범위 · ') + (opt.noext ? '화면에서 복수 조건 못 넣음' : '복수 조건 가능(⇔)') +
      ' · 조건 행 ' + (1 + extra.length) + '건');
    lines.push('<b>대소문자</b> — ' + (opt.lower ? '입력 그대로 보존(LOWER CASE)' : '대문자로 변환(기본)') + ' → 내부 LOW = <code>' + esc(disp(fromVal)) + '</code>');
    if (opt.oblig) lines.push('<span class="warn">OBLIGATORY: 비우면 report event 코드 없이도 Execute가 막힙니다.</span>');
    if (opt.noint && !opt.noext) lines.push('<span class="warn">⚠ NO INTERVALS만 켠 상태 — 화면 본 칸엔 To가 없지만, <code>⇔ 다중 선택</code> 창을 열면 High(범위) 칸이 그대로 있습니다. 직접 열어 확인해 보세요.</span>');
    statusEl.innerHTML = lines.map(function (l) { return '<span class="si">' + l + '</span>'; }).join('');
  }
  function render() { renderOpts(); renderField(); renderMulti(); renderRow(); renderStatus(); }

  optsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = b.getAttribute('data-k'); opt[k] = !opt[k];
    if (opt.noext) multiOpen = false;      // 버튼이 사라지면 창도 닫힌다
    render();
  });
  fieldEl.addEventListener('input', function (e) {
    var f = e.target.getAttribute && e.target.getAttribute('data-f');
    if (!f) return;
    // 입력은 원문 그대로 저장하고, LOWER CASE 여부에 따라 표시/내부값을 계산
    if (f === 'from') fromVal = e.target.value; else toVal = e.target.value;
    renderRow(); renderStatus();
  });
  fieldEl.addEventListener('click', function (e) {
    if (!e.target.closest('[data-multi]')) return;
    multiOpen = !multiOpen; render();
  });
  multiEl.addEventListener('input', function (e) {
    var m = e.target.getAttribute && e.target.getAttribute('data-m');
    if (m) draft[m] = e.target.value;
  });
  multiEl.addEventListener('click', function (e) {
    if (e.target.closest('[data-mclose]')) { multiOpen = false; render(); return; }
    var del = e.target.closest('[data-del]');
    if (del) { extra.splice(+del.getAttribute('data-del'), 1); render(); return; }
    if (e.target.closest('[data-add]')) {
      if (!draft.low) return;
      extra.push({ low: draft.low, high: draft.high });
      draft = { low: '', high: '' };
      render();
    }
  });

  render();
})();
