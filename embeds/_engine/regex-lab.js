/* regex-lab — PCRE 정규식 체험 엔진 (CH29 L01~L08 공통).
   위젯의 <script type="application/json" id="rx-cfg">에서 { mode } 를 읽는다.
   mode: 'compare'(L01 substring vs PCRE vs anchor) | 'tokens'(L02 토큰 조립+greedy)
       | 'inspect'(L03 COUNT/OFFSET/LENGTH/RESULTS·택일) | 'groups'(L04 SUBMATCHES/optional/(?:)/RESULTS메타)
       | 'replace'(L05 치환·$1·VERBATIM·COUNT) | 'matcher'(L06 CREATE_PCRE→matcher→match/find_next)
       | 'functions'(L07 contains/matches/count/find/match/replace) | 'gate'(L08 캡스톤 게이트).
   공통: #rxStage(본문 UI) · #rxMsg(피드백) · JS RegExp('d' 플래그)로 PCRE 부분집합을 실행.
   주의: JS \w는 ASCII 전용(ABAP PCRE는 유니코드) — 한글 \w 데모는 본문 텍스트로만, 위젯 입력엔 미사용.
   데이터: 파트너 접수번호 B-YYYY-NNNN(외부 표기·ZBOOKING booking_id '0001'과 구분) · 로그 E100/W210/E404
         · 정훈영/HUNYOUNG/hunyoung@example.com · 상태 N/C. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cfg; try { cfg = JSON.parse($('rx-cfg').textContent); } catch (e) { cfg = { mode: 'compare' }; }
  var mode = cfg.mode, stage = $('rxStage'), msgEl = $('rxMsg');
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function msg(c, h) { msgEl.className = 'msg ' + c; msgEl.innerHTML = h; post(); }
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }

  /* ── 공통: 정규식 실행(JS RegExp, 'd' 플래그로 그룹 위치까지) ── */
  function runRx(pat, text, o) {
    o = o || {};
    var re;
    try { re = new RegExp(pat, 'd' + (o.all ? 'g' : '') + (o.icase ? 'i' : '')); }
    catch (e) { return { err: String(e.message || e), ms: [] }; }
    function mk(m) {
      var g = [], i;
      for (i = 1; i < m.length; i++) {
        if (m[i] === undefined) { g.push(null); continue; }
        var ind = (m.indices && m.indices[i]) || null;
        g.push({ s: ind ? ind[0] : -1, e: ind ? ind[1] : -1, v: m[i] });
      }
      return { s: m.index, e: m.index + m[0].length, v: m[0], g: g };
    }
    var ms = [], m;
    if (o.all) {
      while ((m = re.exec(text)) !== null) {
        ms.push(mk(m));
        if (m.index === re.lastIndex) re.lastIndex++;
        if (ms.length > 60) break;
      }
    } else { m = re.exec(text); if (m) ms.push(mk(m)); }
    return { ms: ms };
  }
  /* 매치·그룹 하이라이트(그룹은 rx-g1~g3 순환) */
  function hl(text, ms, opt) {
    opt = opt || {};
    var out = '', pos = 0;
    ms.forEach(function (m, mi) {
      out += esc(text.slice(pos, m.s));
      var inner = '', p = m.s;
      (m.g || []).forEach(function (g, gi) {
        if (!g || g.s < 0) return;
        if (g.s >= p) {
          inner += esc(text.slice(p, g.s)) +
            '<span class="rx-g rx-g' + ((gi % 3) + 1) + '">' + esc(text.slice(g.s, g.e)) + '</span>';
          p = g.e;
        }
      });
      inner += esc(text.slice(p, m.e));
      out += '<mark class="rx-m">' + (opt.badge ? '<span class="rx-badge">' + (mi + 1) + '</span>' : '') + inner + '</mark>';
      pos = m.e;
    });
    out += esc(text.slice(pos));
    return out;
  }
  function textBox(html, cls) { return '<div class="rx-text' + (cls ? ' ' + cls : '') + '">' + html + '</div>'; }
  function patLine(pat, extra) { return '<div class="rx-pat">PCRE <code>' + esc(pat) + '</code>' + (extra || '') + '</div>'; }
  function seg(items, cur, attr) {
    return '<div class="rx-seg">' + items.map(function (it) {
      return '<button type="button" class="rx-seg__b' + (it.k === cur ? ' on' : '') + '" data-' + attr + '="' + it.k + '">' + it.nm + '</button>';
    }).join('') + '</div>';
  }

  /* ══ L01 compare: substring vs PCRE vs anchor ══ */
  if (mode === 'compare') {
    var ROWS1 = [
      { t: 'B-2026-0007', exp: true }, { t: 'B-2026-1234', exp: true },
      { t: 'B-26-0007', exp: false }, { t: 'X-2026-0007', exp: false },
      { t: 'B-2026-ABCD', exp: false }, { t: '안내: B-2026-0007 접수됨', exp: false }
    ];
    var st1 = { method: null, anchors: false };
    var r1 = function () {
      var pat = st1.anchors ? '^B-\\d{4}-\\d{4}$' : 'B-\\d{4}-\\d{4}';
      var head = st1.method === 'sub' ? '<div class="rx-pat">FIND <code>\'B-\'</code> (substring — 글자 그대로)</div>'
        : st1.method === 'pcre' ? patLine(pat, st1.anchors ? ' <span class="rx-tag">^$ anchor ON</span>' : '')
        : '<div class="rx-pat dim">버튼으로 검색 방식을 선택하세요.</div>';
      var rows = ROWS1.map(function (r) {
        var hit = false, body = esc(r.t);
        if (st1.method === 'sub') {
          var i = r.t.indexOf('B-');
          hit = i >= 0;
          if (hit) body = esc(r.t.slice(0, i)) + '<mark class="rx-m">B-</mark>' + esc(r.t.slice(i + 2));
        } else if (st1.method === 'pcre') {
          var res = runRx(pat, r.t, {});
          hit = res.ms.length > 0;
          if (hit) body = hl(r.t, res.ms);
        }
        var verdict = st1.method ? (hit ? 'sy-subrc = 0' : 'sy-subrc = 4') : '—';
        var okCls = st1.method ? (hit === r.exp ? 'ok' : 'bad') : '';
        return '<tr><td class="rx-mono">' + body + '</td><td>' + verdict + '</td>' +
          '<td class="' + okCls + '">' + (st1.method ? (hit === r.exp ? '기대대로' : (hit ? '잘못 통과!' : '잘못 반려!')) : '기대: ' + (r.exp ? '통과' : '반려')) + '</td></tr>';
      }).join('');
      stage.innerHTML = head +
        '<table class="rx-tbl"><thead><tr><th>입력</th><th>판정</th><th>기대 대비</th></tr></thead><tbody>' + rows + '</tbody></table>';
      post();
    };
    $('rxBtns').innerHTML =
      '<button type="button" data-a="sub">FIND \'B-\' (substring)</button>' +
      '<button type="button" data-a="pcre" class="prim">FIND PCRE B-\\d{4}-\\d{4}</button>' +
      '<button type="button" data-a="anc">^$ anchor 토글</button>' +
      '<button type="button" data-a="rs">Reset</button>';
    $('rxBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
      if (a === 'sub') { st1.method = 'sub'; r1(); msg('bad', '✕ <b>B-26-0007</b>·<b>B-2026-ABCD</b>까지 통과 — substring은 "B-가 들어 있나"만 봅니다. <b>형식</b>은 못 물어요.'); }
      if (a === 'pcre') { st1.method = 'pcre'; r1(); msg(st1.anchors ? 'ok' : 'info', st1.anchors ? '✓ 여섯 줄 모두 기대대로 — 전체 형식 검증 완성.' : '패턴 덕에 형식은 걸러졌습니다. 그런데 마지막 줄(문장 속 포함)이 아직 통과 — <b>^$ anchor</b>를 켜 보세요.'); }
      if (a === 'anc') { st1.anchors = !st1.anchors; if (st1.method !== 'pcre') st1.method = 'pcre'; r1(); msg(st1.anchors ? 'ok' : 'info', st1.anchors ? '✓ <code>^…$</code> — 시작부터 끝까지 전체가 형식이어야 통과. "포함"이 아니라 "전체 형식" 검증이 됐습니다.' : 'anchor OFF — 다시 "포함 검사"로 돌아갔습니다(마지막 줄이 통과해 버림).'); }
      if (a === 'rs') { st1 = { method: null, anchors: false }; r1(); msg('info', '어떤 검색이 어떤 줄을 잘못 통과/반려시키는지 비교해 보세요.'); }
    });
    r1(); msg('info', '같은 여섯 줄을 substring → PCRE → anchor 순서로 검사해 차이를 확인하세요.');
  }

  /* ══ L02 tokens: 토큰 조립 + greedy ══ */
  if (mode === 'tokens') {
    var TGT = [
      { k: 'bk', nm: '접수번호', t: 'B-2026-0007' },
      { k: 'dt', nm: '날짜', t: '2026-07-06' },
      { k: 'tag', nm: '태그', t: '<i>ABAP</i><i>UI5</i>' }
    ];
    var TOK = ['B-', '\\d', '\\w', '\\s', '{4}', '{2}', '-', '(', ')', '^', '$', '.', '*', '+', '?', '|'];
    var st2 = { tgt: 'bk', pat: [] };
    var tgt2 = function () { for (var i = 0; i < TGT.length; i++) if (TGT[i].k === st2.tgt) return TGT[i]; };
    var r2 = function (resHtml) {
      var pat = st2.pat.join('');
      stage.innerHTML = seg(TGT, st2.tgt, 'k') +
        '<div class="rx-chips">' + (st2.pat.length ? st2.pat.map(function (t) { return '<span class="rx-chip">' + esc(t) + '</span>'; }).join('') : '<span class="dim">토큰 버튼으로 패턴을 조립하세요</span>') + '</div>' +
        patLine(pat || '(빈 패턴)') +
        textBox(esc(tgt2().t), 'rx-mono') +
        '<div id="rxOut">' + (resHtml || '') + '</div>' +
        '<div class="rx-toks">' + TOK.map(function (t) { return '<button type="button" class="rx-tok" data-t="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>';
      stage.querySelectorAll('.rx-seg__b').forEach(function (b) {
        b.addEventListener('click', function () { st2.tgt = b.dataset.k; r2(); msg('info', '대상 텍스트 = <code>' + esc(tgt2().t) + '</code>'); });
      });
      stage.querySelectorAll('.rx-tok').forEach(function (b) {
        b.addEventListener('click', function () { st2.pat.push(b.dataset.t); r2(); post(); });
      });
      post();
    };
    var run2 = function () {
      var pat = st2.pat.join('');
      if (!pat) { msg('bad', '✕ 빈 패턴은 ABAP에서 예외(<code>CX_SY_INVALID_REGEX</code>)입니다. 토큰을 먼저 조립하세요.'); return; }
      var t = tgt2().t, res = runRx(pat, t, { all: true });
      if (res.err) { msg('bad', '✕ 패턴 문법 오류: <code>' + esc(res.err) + '</code>'); return; }
      var groups = res.ms.length && res.ms[0].g.length
        ? '<div class="rx-cards">' + res.ms[0].g.map(function (g, i) { return '<div class="rx-card rx-b' + ((i % 3) + 1) + '"><small>그룹 ' + (i + 1) + '</small><b>' + (g ? esc(g.v) : '(불참)') + '</b></div>'; }).join('') + '</div>'
        : '';
      r2(textBox(hl(t, res.ms, { badge: res.ms.length > 1 }), 'rx-mono') + groups);
      var warn = [];
      if (pat.indexOf(' ') >= 0) warn.push('패턴에 맨 공백 — ABAP PCRE는 <b>extended mode 기본</b>이라 무시됩니다. 공백은 <code>\\s</code>로.');
      if (pat.indexOf('.*') === 0) warn.push('<code>.*</code> 선두 — 너무 넓게 잡힐 수 있어요. 구체적 클래스 우선.');
      if (!res.ms.length) msg('bad', '✕ 매치 0건 (sy-subrc = 4). 토큰을 다시 살펴보세요.');
      else msg(warn.length ? 'info' : 'ok', (warn.length ? '⚠ ' + warn.join(' ') : '✓ 매치 ' + res.ms.length + '건') + (res.ms.length && !/^\^/.test(pat) ? ' · anchor 없음 = "포함" 검사라는 점 기억!' : ''));
    };
    $('rxBtns').innerHTML =
      '<button type="button" class="prim" data-a="run">▶ FIND PCRE 실행</button>' +
      '<button type="button" data-a="bs">← 한 칸 지우기</button>' +
      '<button type="button" data-a="clr">모두 지우기</button>' +
      '<button type="button" data-a="ex">예시: ^B-\\d{4}-\\d{4}$</button>' +
      '<button type="button" data-a="greedy">greedy 비교</button>';
    $('rxBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
      if (a === 'run') run2();
      if (a === 'bs') { st2.pat.pop(); r2(); }
      if (a === 'clr') { st2.pat = []; r2(); msg('info', '패턴을 비웠습니다.'); }
      if (a === 'ex') { st2.tgt = 'bk'; st2.pat = ['^', 'B-', '\\d', '{4}', '-', '\\d', '{4}', '$']; r2(); run2(); }
      if (a === 'greedy') {
        st2.tgt = 'tag';
        var t = tgt2().t;
        var g1 = runRx('<i>(.*)</i>', t, {}), g2 = runRx('<i>(.*?)</i>', t, {});
        r2('<div class="rx-cmp"><div><div class="rx-pat"><code>&lt;i&gt;(.*)&lt;/i&gt;</code> greedy</div>' + textBox(hl(t, g1.ms), 'rx-mono') + '<small>MATCH LENGTH = ' + (g1.ms[0].e - g1.ms[0].s) + '</small></div>' +
          '<div><div class="rx-pat"><code>&lt;i&gt;(.*?)&lt;/i&gt;</code> non-greedy</div>' + textBox(hl(t, g2.ms), 'rx-mono') + '<small>MATCH LENGTH = ' + (g2.ms[0].e - g2.ms[0].s) + '</small></div></div>');
        msg('info', '<b>greedy</b>는 마지막 <code>&lt;/i&gt;</code>까지 삼키고(길이 ' + (g1.ms[0].e - g1.ms[0].s) + '), <b>*?</b>는 첫 태그에서 멈춥니다(길이 ' + (g2.ms[0].e - g2.ms[0].s) + ').');
      }
    });
    r2(); msg('info', '토큰을 눌러 패턴을 조립하고 ▶ 실행. greedy 비교 버튼도 눌러 보세요.');
  }

  /* ══ L03 inspect: COUNT/OFFSET/LENGTH vs RESULTS(택일) ══ */
  if (mode === 'inspect') {
    var TXT3 = 'E100: booking failed, W210: retry scheduled, E404: concert missing';
    var PATS3 = [{ k: 'e', nm: 'E\\d{3}' }, { k: 'ew', nm: 'E\\d{3}|W\\d{3}' }, { k: 'n', nm: '\\d+' }];
    var st3 = { pat: 'e', view: null };
    var pat3 = function () { for (var i = 0; i < PATS3.length; i++) if (PATS3[i].k === st3.pat) return PATS3[i].nm; };
    var r3 = function () {
      var p = pat3(), body = '', res;
      if (st3.view === 'first') {
        res = runRx(p, TXT3, {});
        var m = res.ms[0];
        body = textBox(hl(TXT3, res.ms), 'rx-mono') +
          '<div class="rx-cards">' +
          '<div class="rx-card"><small>sy-subrc</small><b>' + (m ? 0 : 4) + '</b></div>' +
          '<div class="rx-card"><small>MATCH OFFSET</small><b>' + (m ? m.s : '—') + '</b></div>' +
          '<div class="rx-card"><small>MATCH LENGTH</small><b>' + (m ? m.e - m.s : '—') + '</b></div>' +
          (m ? '<div class="rx-card"><small>substring 재확인</small><b>' + esc(TXT3.substr(m.s, m.e - m.s)) + '</b></div>' : '') + '</div>';
      } else if (st3.view === 'allcnt' || st3.view === 'alloff') {
        res = runRx(p, TXT3, { all: true });
        var last = res.ms[res.ms.length - 1];
        body = textBox(hl(TXT3, res.ms, { badge: true }), 'rx-mono') +
          '<div class="rx-cards"><div class="rx-card"><small>MATCH COUNT</small><b>' + res.ms.length + '</b></div>' +
          (st3.view === 'alloff' && last ? '<div class="rx-card rx-warn"><small>MATCH OFFSET</small><b>' + last.s + '</b></div><div class="rx-card rx-warn"><small>MATCH LENGTH</small><b>' + (last.e - last.s) + '</b></div>' : '') + '</div>';
      } else if (st3.view === 'results') {
        res = runRx(p, TXT3, { all: true });
        body = textBox(hl(TXT3, res.ms, { badge: true }), 'rx-mono') +
          '<table class="rx-tbl"><thead><tr><th>#</th><th>offset</th><th>length</th><th>잘라낸 값</th></tr></thead><tbody>' +
          res.ms.map(function (m, i) { return '<tr><td>' + (i + 1) + '</td><td>' + m.s + '</td><td>' + (m.e - m.s) + '</td><td class="rx-mono">' + esc(m.v) + '</td></tr>'; }).join('') +
          '</tbody></table>';
      } else body = textBox(esc(TXT3), 'rx-mono');
      stage.innerHTML = seg(PATS3, st3.pat, 'k') + patLine(p) + body;
      stage.querySelectorAll('.rx-seg__b').forEach(function (b) {
        b.addEventListener('click', function () { st3.pat = b.dataset.k; r3(); msg('info', '패턴 = <code>' + esc(pat3()) + '</code> — 같은 버튼들을 다시 눌러 보세요.'); });
      });
      post();
    };
    $('rxBtns').innerHTML =
      '<button type="button" data-a="first" class="prim">FIRST + OFFSET/LENGTH</button>' +
      '<button type="button" data-a="allcnt">ALL + MATCH COUNT</button>' +
      '<button type="button" data-a="alloff">ALL + OFFSET?</button>' +
      '<button type="button" data-a="results">ALL + RESULTS 표</button>';
    $('rxBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
      st3.view = a; r3();
      if (a === 'first') msg('ok', '✓ 첫 발견의 위치·길이. offset으로 원문을 다시 잘라(substring) 눈으로 확인하는 습관!');
      if (a === 'allcnt') msg('ok', '✓ <code>ALL OCCURRENCES</code> + <code>MATCH COUNT</code> = 발견 개수.');
      if (a === 'alloff') msg('bad', '⚠ offset이 <b>마지막 발견</b>을 가리킵니다! ALL + OFFSET은 마지막 기준 — 전체 위치가 필요하면 RESULTS.');
      if (a === 'results') msg('ok', '✓ 발견마다 offset/length가 한 줄씩. 참고: <b>RESULTS와 MATCH OFFSET/LENGTH는 같은 FIND 문장에서 택일</b>이라 이 화면도 따로 보여 줍니다.');
    });
    r3(); msg('info', '같은 로그에 결과 옵션을 바꿔 실행해 보세요. "ALL + OFFSET?"이 함정 포인트.');
  }

  /* ══ L04 groups: SUBMATCHES / optional / (?:) / RESULTS 메타 ══ */
  if (mode === 'groups') {
    var T4 = 'Booking B-2026-0007 failed for user HUNYOUNG';
    var P4 = 'B-(\\d{4})-(\\d{4}).*user\\s+(\\w+)';
    var V4 = ['gv_year', 'gv_serial', 'gv_user'];
    var T4o = ['Booking B-2026-0007 seats=2', 'Booking B-2026-0008'];
    var st4 = { view: 'sub', optTxt: 0, noncap: true };
    var r4 = function () {
      var body = '';
      if (st4.view === 'sub') {
        var res = runRx(P4, T4, {});
        body = patLine(P4) + textBox(hl(T4, res.ms), 'rx-mono') +
          '<div class="rx-cards">' + res.ms[0].g.map(function (g, i) {
            return '<div class="rx-card rx-b' + (i + 1) + '"><small>SUBMATCHES → ' + V4[i] + '</small><b>' + esc(g.v) + '</b></div>';
          }).join('') + '</div>';
      } else if (st4.view === 'opt') {
        var pat = st4.noncap ? 'Booking\\s+(B-\\d{4}-\\d{4})(?:\\s+seats=(\\d+))?' : 'Booking\\s+(B-\\d{4}-\\d{4})(\\s+seats=(\\d+))?';
        var t = T4o[st4.optTxt], res4 = runRx(pat, t, {});
        var names = st4.noncap ? ['gv_booking_id', 'gv_seats'] : ['gv_booking_id', '(묶음 전체가 번호 차지)', 'gv_seats'];
        body = seg([{ k: 0, nm: 'seats 있음' }, { k: 1, nm: 'seats 없음' }], st4.optTxt, 'o') +
          patLine(pat, st4.noncap ? ' <span class="rx-tag">(?: ) 비캡처</span>' : ' <span class="rx-tag warn">전부 캡처 괄호</span>') +
          textBox(hl(t, res4.ms), 'rx-mono') +
          '<div class="rx-cards">' + res4.ms[0].g.map(function (g, i) {
            return '<div class="rx-card' + (g ? ' rx-b' + ((i % 3) + 1) : ' rx-init') + '"><small>그룹 ' + (i + 1) + ' → ' + esc(names[i] || '?') + '</small><b>' + (g ? esc(g.v) : '초기값 (불참)') + '</b></div>';
          }).join('') + '</div>';
      } else if (st4.view === 'meta') {
        var tL = 'B-2026-0007 B-2026-0008';
        var resL = runRx('B-(\\d{4})-(\\d{4})', tL, { all: true });
        body = patLine('B-(\\d{4})-(\\d{4})') + textBox(hl(tL, resL.ms, { badge: true }), 'rx-mono') +
          '<table class="rx-tbl"><thead><tr><th>발견</th><th>offset·length</th><th>submatches (위치 정보!)</th></tr></thead><tbody>' +
          resL.ms.map(function (m, i) {
            return '<tr><td>' + (i + 1) + '</td><td>' + m.s + ' · ' + (m.e - m.s) + '</td><td>' +
              m.g.map(function (g, gi) { return '그룹' + (gi + 1) + ': off ' + g.s + ', len ' + (g.e - g.s); }).join(' / ') + '</td></tr>';
          }).join('') + '</tbody></table>';
      }
      stage.innerHTML = body;
      stage.querySelectorAll('[data-o]').forEach(function (b) {
        b.addEventListener('click', function () { st4.optTxt = +b.dataset.o; r4(); msg('info', st4.optTxt ? 'seats가 없는 줄 — optional 그룹이 <b>불참</b>하면 변수는 초기값.' : 'seats가 있는 줄 — 두 변수 모두 값이 담깁니다.'); });
      });
      post();
    };
    $('rxBtns').innerHTML =
      '<button type="button" class="prim" data-a="sub">SUBMATCHES 실행</button>' +
      '<button type="button" data-a="opt">optional 그룹 데모</button>' +
      '<button type="button" data-a="nc">(?:) 켜기/끄기</button>' +
      '<button type="button" data-a="meta">RESULTS 메타데이터</button>';
    $('rxBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
      if (a === 'sub') { st4.view = 'sub'; r4(); msg('ok', '✓ 여는 괄호 순서대로 그룹 1·2·3 → 변수 3개. 원문 색과 카드 색이 짝입니다.'); }
      if (a === 'opt') { st4.view = 'opt'; r4(); msg('info', '<code>( … )?</code> — 있을 수도 없을 수도. "seats 없음"으로 바꿔 보세요.'); }
      if (a === 'nc') {
        st4.noncap = !st4.noncap; st4.view = 'opt'; r4();
        msg(st4.noncap ? 'ok' : 'bad', st4.noncap ? '✓ <code>(?: )</code> 비캡처 — 묶기만 하고 번호는 안 차지. 변수 2개면 충분.' : '⚠ 전부 캡처 괄호로 바꾸면 <b>묶음 전체가 그룹 2</b>가 되어 seats는 그룹 3으로 밀립니다. SUBMATCHES 순서 사고의 정체.');
      }
      if (a === 'meta') { st4.view = 'meta'; r4(); msg('bad', '⚠ RESULTS의 submatches에는 <b>값이 아니라 offset/length</b>가 들어 있습니다. 값이 필요하면 substring으로 잘라야!'); }
    });
    r4(); msg('info', '그룹→변수 연결부터 확인하고, optional·(?:)·RESULTS 메타까지 눌러 보세요.');
  }

  /* ══ L05 replace: 치환·$1·VERBATIM·COUNT ══ */
  if (mode === 'replace') {
    var PRE5 = [
      { k: 'amt', nm: '금액 정리', t: 'KRW 120,000', p: '\\D', w: '' },
      { k: 'date', nm: '날짜 표준화', t: '2026/07/06', p: '^(\\d{4})/(\\d{2})/(\\d{2})$', w: '$1-$2-$3' },
      { k: 'sp', nm: '공백 정리', t: '정훈영    ABAP     Academy', p: '\\s+', w: ' ' },
      { k: 'vb', nm: 'VERBATIM', t: 'A123', p: 'A(\\d+)', w: '$1' }
    ];
    var st5 = { k: 'amt', verbatim: false, out: null, count: 0, all: true };
    var pre5 = function () { for (var i = 0; i < PRE5.length; i++) if (PRE5[i].k === st5.k) return PRE5[i]; };
    var r5 = function () {
      var p = pre5();
      var wDisp = p.w === '' ? '``(빈 문자열)' : '`' + p.w + '`';
      stage.innerHTML = seg(PRE5, st5.k, 'k') +
        patLine(p.p, ' → WITH <code>' + esc(wDisp) + '</code>' + (st5.verbatim ? ' <span class="rx-tag">VERBATIM</span>' : '')) +
        '<div class="rx-cmp"><div><small class="dim">치환 전</small>' + textBox(esc(p.t), 'rx-mono') + '</div>' +
        '<div><small class="dim">치환 후</small>' + textBox(st5.out === null ? '<span class="dim">(실행 전)</span>' : esc(st5.out), 'rx-mono') + '</div></div>' +
        (st5.out !== null ? '<div class="rx-cards"><div class="rx-card"><small>REPLACEMENT COUNT</small><b>' + st5.count + '</b></div></div>' : '');
      stage.querySelectorAll('.rx-seg__b').forEach(function (b) {
        b.addEventListener('click', function () { st5.k = b.dataset.k; st5.out = null; st5.verbatim = false; r5(); msg('info', '원문 = <code>' + esc(pre5().t) + '</code>'); });
      });
      post();
    };
    var run5 = function (all) {
      var p = pre5(), n = 0;
      var counter; try { counter = new RegExp(p.p, all ? 'g' : ''); } catch (e) { msg('bad', '패턴 오류'); return; }
      var mm; while ((mm = counter.exec(p.t)) !== null) { n++; if (mm.index === counter.lastIndex) counter.lastIndex++; if (!all) break; }
      /* VERBATIM = 치환문 특수문자 해석 OFF → $를 JS literal($$)로 escape */
      st5.out = p.t.replace(new RegExp(p.p, all ? 'g' : ''), st5.verbatim ? p.w.replace(/\$/g, '$$$$') : p.w);
      st5.count = n; st5.all = all; r5();
      if (p.k === 'vb') msg(st5.verbatim ? 'ok' : 'info', st5.verbatim ? '✓ VERBATIM — <code>$1</code>이 <b>문자 그대로</b> 들어갔습니다.' : '<code>$1</code>이 그룹 값(123)으로 풀렸습니다. VERBATIM을 켜고 다시 실행해 보세요.');
      else if (n === 0) msg('bad', '⚠ REPLACEMENT COUNT = 0 — 패턴이 아무것도 못 잡았다는 경고 신호!');
      else msg('ok', '✓ ' + n + '건 치환. 원본 변수 자체가 바뀌는 문장이라는 점 기억(원본 보존은 복사 먼저).');
    };
    $('rxBtns').innerHTML =
      '<button type="button" data-a="one">첫 1건 치환</button>' +
      '<button type="button" class="prim" data-a="all">ALL 치환</button>' +
      '<button type="button" data-a="vb">VERBATIM 토글</button>' +
      '<button type="button" data-a="rs">원래대로</button>';
    $('rxBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
      if (a === 'one') run5(false);
      if (a === 'all') run5(true);
      if (a === 'vb') { st5.verbatim = !st5.verbatim; r5(); msg('info', 'VERBATIM ' + (st5.verbatim ? 'ON — 치환문 특수문자 해석 OFF' : 'OFF — $1은 그룹 값') + '. 다시 실행해 비교하세요.'); }
      if (a === 'rs') { st5.out = null; r5(); msg('info', '원문으로 되돌렸습니다.'); }
    });
    r5(); msg('info', '네 가지 원문을 골라 치환 전/후와 REPLACEMENT COUNT를 확인하세요.');
  }

  /* ══ L06 matcher: CREATE_PCRE → matcher → match/find_next ══ */
  if (mode === 'matcher') {
    var TX6 = [
      { k: 'a', nm: '`E404`', t: 'E404' },
      { k: 'b', nm: '`E404 concert missing`', t: 'E404 concert missing' },
      { k: 'c', nm: '로그 한 줄(3건 포함)', t: 'E100 booking failed, W210 retry, E404 concert missing' }
    ];
    var st6 = { regex: false, txt: null, pos: 0, cur: null, found: [] };
    var tx6 = function () { for (var i = 0; i < TX6.length; i++) if (TX6[i].k === st6.txt) return TX6[i]; };
    var r6 = function () {
      var flow = '<div class="rx-flow">' +
        '<div class="rx-fnode' + (st6.regex ? ' on' : '') + '">CL_ABAP_REGEX<span>도장 — create_pcre( `E(\\d{3})` )</span></div>' +
        '<span class="rx-arrow">→</span>' +
        '<div class="rx-fnode' + (st6.txt ? ' on' : '') + '">CL_ABAP_MATCHER<span>' + (st6.txt ? 'text = ' + esc(tx6().t.length > 24 ? tx6().t.slice(0, 24) + '…' : tx6().t) : '손 — create_matcher( text )') + '</span></div></div>';
      var body = '';
      if (st6.txt) {
        var t = tx6().t;
        var marks = st6.found.map(function (f) { return { s: f.s, e: f.e, v: f.v, g: f.g }; });
        body = seg(TX6, st6.txt, 't') + textBox(hl(t, marks, { badge: marks.length > 1 }), 'rx-mono') +
          (st6.cur ? '<div class="rx-cards"><div class="rx-card rx-b1"><small>get_submatch( 1 )</small><b>' + esc(st6.cur.g[0] ? st6.cur.g[0].v : '') + '</b></div></div>' : '');
      } else body = seg(TX6, st6.txt, 't');
      stage.innerHTML = flow + body;
      stage.querySelectorAll('[data-t]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (!st6.regex) { msg('bad', '✕ 먼저 ① CREATE_PCRE로 도장부터 만드세요.'); return; }
          st6.txt = b.dataset.t; st6.pos = 0; st6.cur = null; st6.found = []; r6();
          msg('ok', '✓ matcher 생성 — 같은 도장(regex)을 다른 텍스트에 다시 대는 것도 이 구조라 쉽습니다.');
        });
      });
      post();
    };
    $('rxBtns').innerHTML =
      '<button type="button" class="prim" data-a="mk">① CREATE_PCRE</button>' +
      '<button type="button" data-a="match">② match( )</button>' +
      '<button type="button" data-a="next">③ find_next( )</button>' +
      '<button type="button" data-a="sub2">get_submatch( 2 )?</button>' +
      '<button type="button" data-a="rs">Reset</button>';
    $('rxBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
      if (a === 'mk') { st6.regex = true; r6(); msg('ok', '✓ 패턴 <code>E(\\d{3})</code>를 한 번 컴파일해 객체로 — 이제 텍스트를 골라 matcher를 만드세요.'); }
      if (a === 'match') {
        if (!st6.txt) { msg('bad', '✕ 텍스트를 골라 matcher부터 만드세요.'); return; }
        var t = tx6().t, whole = runRx('^(?:E(\\d{3}))$', t, {});
        if (whole.ms.length) { st6.found = [{ s: 0, e: t.length, v: t, g: whole.ms[0].g }]; st6.cur = st6.found[0]; r6(); msg('ok', '✓ match( ) = abap_true — <b>텍스트 전체</b>가 패턴과 일치합니다.'); }
        else { st6.found = []; st6.cur = null; r6(); msg('bad', '✕ match( ) = abap_false — 안에 E404가 <i>있어도</i> 전체 일치가 아니면 false! "안에서 찾기"는 find_next( ).'); }
      }
      if (a === 'next') {
        if (!st6.txt) { msg('bad', '✕ 텍스트를 골라 matcher부터 만드세요.'); return; }
        var t2 = tx6().t, all = runRx('E(\\d{3})', t2, { all: true }).ms;
        if (st6.pos >= all.length) { st6.cur = null; r6(); msg('info', 'find_next( ) = abap_false — 더 이상 발견이 없어 루프 종료. (matcher의 현재 위치가 끝까지 전진)'); st6.pos = 0; st6.found = []; return; }
        st6.cur = all[st6.pos]; st6.found = all.slice(0, st6.pos + 1); st6.pos++; r6();
        msg('ok', '✓ find_next( ) = abap_true — ' + st6.pos + '번째 발견(offset ' + st6.cur.s + '). 다시 누르면 <b>다음으로 전진</b>합니다.');
      }
      if (a === 'sub2') {
        if (!st6.cur) { msg('bad', '✕ 현재 발견이 없습니다 — match( ) 성공 또는 find_next( ) 후에.'); return; }
        msg('bad', '💥 <code>cx_sy_invalid_submatch</code> — 그룹은 1개뿐인데 2번을 요청했습니다. 번호를 돌려 읽을 땐 TRY…CATCH로.');
      }
      if (a === 'rs') { st6 = { regex: false, txt: null, pos: 0, cur: null, found: [] }; r6(); msg('info', '처음부터: ① 도장 → 텍스트 선택 → ② 전체 일치 or ③ 순차 검색.'); }
    });
    r6(); msg('info', '① 도장(regex) → 텍스트 선택(matcher) → ② match vs ③ find_next의 의미 차이를 확인하세요.');
  }

  /* ══ L07 functions: contains/matches/count/find/match/replace ══ */
  if (mode === 'functions') {
    var IN7 = [
      { k: 'em', nm: '이메일', t: 'hunyoung@example.com' },
      { k: 'log', nm: '로그', t: 'E100 W210 E404' },
      { k: 'sp', nm: '공백', t: 'A   B    C' }
    ];
    var FN7 = [
      { k: 'contains', p: { em: '\\w+@\\w+', log: 'E\\d{3}', sp: '\\s{2,}' } },
      { k: 'matches', p: { em: '[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}', log: 'E\\d{3}', sp: '\\s+' } },
      { k: 'count', p: { em: '\\w+', log: 'E\\d{3}', sp: '\\s+' } },
      { k: 'find', p: { em: '@', log: 'W\\d{3}', sp: '\\s+' } },
      { k: 'match', p: { em: '[A-Za-z]{2,}$', log: 'E\\d{3}', sp: '\\s+' } },
      { k: 'replace', p: { em: '@.*$', log: 'E(\\d{3})', sp: '\\s+' }, w: { em: '@(마스킹)', log: 'E-$1', sp: ' ' } }
    ];
    var st7 = { fn: 'contains', inp: 'em' };
    var in7 = function () { for (var i = 0; i < IN7.length; i++) if (IN7[i].k === st7.inp) return IN7[i]; };
    var fn7 = function () { for (var i = 0; i < FN7.length; i++) if (FN7[i].k === st7.fn) return FN7[i]; };
    var r7 = function (extra) {
      var f = fn7(), t = in7().t, p = f.p[st7.inp], out, exprArgs = 'val = `' + t + '` pcre = `' + p + '`';
      var all = runRx(p, t, { all: true }).ms;
      var full = runRx('^(?:' + p + ')$', t, {}).ms.length > 0;
      var retType = '';
      if (st7.fn === 'contains') { out = all.length > 0 ? 'abap_true' : 'abap_false'; retType = '포함 여부'; }
      if (st7.fn === 'matches') { out = full ? 'abap_true' : 'abap_false'; retType = '전체 일치 여부'; }
      if (st7.fn === 'count') { out = String(all.length); retType = '개수'; }
      if (st7.fn === 'find') { out = all.length ? String(all[0].s) : '-1'; retType = 'offset (실패 -1)'; }
      if (st7.fn === 'match') { out = all.length ? '`' + all[0].v + '`' : '``(빈)'; retType = '매치 문자열'; }
      if (st7.fn === 'replace') {
        exprArgs += ' with = `' + f.w[st7.inp] + '` occ = 0';
        out = '`' + t.replace(new RegExp(p, 'g'), f.w[st7.inp]) + '`';
        retType = '바뀐 결과(원본 불변)';
      }
      stage.innerHTML = seg(FN7.map(function (f2) { return { k: f2.k, nm: f2.k }; }), st7.fn, 'f') +
        seg(IN7, st7.inp, 'i') +
        '<div class="rx-expr"><code>' + esc(st7.fn + '( ' + exprArgs + ' )') + '</code></div>' +
        textBox(hl(t, st7.fn === 'matches' ? (full ? [{ s: 0, e: t.length, v: t, g: [] }] : []) : all, { badge: all.length > 1 && st7.fn !== 'matches' }), 'rx-mono') +
        '<div class="rx-cards"><div class="rx-card"><small>' + retType + '</small><b>' + esc(out) + '</b></div></div>' +
        (extra || '');
      stage.querySelectorAll('[data-f]').forEach(function (b) { b.addEventListener('click', function () { st7.fn = b.dataset.f; r7(); hint7(); }); });
      stage.querySelectorAll('[data-i]').forEach(function (b) { b.addEventListener('click', function () { st7.inp = b.dataset.i; r7(); hint7(); }); });
      post();
    };
    var hint7 = function () {
      var m = {
        contains: '<b>contains</b> = 어딘가에 포함되면 true. 전체 형식 검증엔 부족할 수 있어요.',
        matches: '<b>matches</b> = <b>전체</b>가 패턴과 일치해야 true — anchor 없이도 전체 검증(정본 도구).',
        count: '<b>count</b> = 발견 개수를 값으로. 문장형 <code>MATCH COUNT</code>의 함수판.',
        find: '<b>find</b> = 첫 발견 offset. <b>실패하면 -1</b>(sy-subrc가 아니라 반환값으로!).',
        match: '<b>match</b> = 매치된 문자열 자체를 반환.',
        replace: '<b>replace</b> = 바뀐 결과를 <b>반환</b>. 원본은 그대로! <code>occ = 0</code> = 전부.'
      };
      msg('info', m[st7.fn]);
    };
    $('rxBtns').innerHTML =
      '<button type="button" class="prim" data-a="cmp">contains vs matches 비교</button>';
    $('rxBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.a === 'cmp') {
        st7.inp = 'em';
        var t = in7().t, pPart = '\\w+@\\w+', pFull = '[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}';
        var row = function (fn, p, v) { return '<tr><td><code>' + fn + '</code></td><td class="rx-mono">' + esc(p) + '</td><td class="' + (v ? 'ok' : 'bad') + '">' + (v ? 'abap_true' : 'abap_false') + '</td></tr>'; };
        var html = '<table class="rx-tbl"><thead><tr><th>함수</th><th>pcre</th><th>결과</th></tr></thead><tbody>' +
          row('contains', pPart, true) + row('matches', pPart, false) +
          row('contains', pFull, true) + row('matches', pFull, true) +
          '</tbody></table>';
        r7(html);
        msg('bad', '⚠ 같은 입력·같은 패턴 <code>\\w+@\\w+</code>인데 contains=true, matches=<b>false</b> — matches는 "전체"를 묻기 때문. 전체 검증은 matches가 정본.');
      }
    });
    r7(); hint7();
  }

  /* ══ L08 gate: 캡스톤 — 로그/이메일/obsolete 게이트 ══ */
  if (mode === 'gate') {
    var LINES8 = [
      'E100 booking failed for hunyoung@example.com',
      'W210 retry scheduled',
      'E404 concert missing',
      "search gv_text FOR 'ABAP'.",
      'RESEARCH 계획 검토'
    ];
    var CK8 = [
      { k: 'log', nm: '로그 오류코드', p: 'E\\d{3}' },
      { k: 'em', nm: '이메일 1차', p: '[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}' },
      { k: 'code', nm: 'obsolete SEARCH', p: '\\bSEARCH\\b' }
    ];
    var st8 = { ck: 'log', icase: false, rows: [], masked: null };
    var ck8 = function () { for (var i = 0; i < CK8.length; i++) if (CK8[i].k === st8.ck) return CK8[i]; };
    var r8 = function () {
      var c = ck8();
      var lineHtml = LINES8.map(function (l, i) {
        var res = runRx(c.p, l, { all: true, icase: st8.ck === 'code' && st8.icase });
        return '<div class="rx-line"><span class="rx-lno">' + (i + 1) + '</span>' +
          (st8.masked && i === 0 ? esc(st8.masked) : hl(l, res.ms)) + '</div>';
      }).join('');
      var tbl = st8.rows.length
        ? '<table class="rx-tbl"><thead><tr><th>category</th><th>판정</th><th>message</th></tr></thead><tbody>' +
          st8.rows.map(function (r) { return '<tr><td>' + r.cat + '</td><td class="' + (r.ok ? 'ok' : 'bad') + '">' + (r.ok ? '✔' : '✘') + '</td><td>' + esc(r.m) + '</td></tr>'; }).join('') +
          '</tbody></table>'
        : '<div class="dim" style="margin-top:8px">결과 없음 — 검사를 실행하세요.</div>';
      stage.innerHTML = seg(CK8, st8.ck, 'c') + patLine(c.p, st8.ck === 'code' ? (st8.icase ? ' <span class="rx-tag">IGNORING CASE</span>' : ' <span class="rx-tag warn">RESPECTING CASE(기본)</span>') : '') +
        '<div class="rx-lines">' + lineHtml + '</div>' + tbl;
      stage.querySelectorAll('[data-c]').forEach(function (b) {
        b.addEventListener('click', function () { st8.ck = b.dataset.c; st8.masked = null; r8(); msg('info', '검사 = <b>' + esc(ck8().nm) + '</b> · 패턴 <code>' + esc(ck8().p) + '</code>'); });
      });
      post();
    };
    var run8 = function () {
      var c = ck8(); st8.rows = [];
      if (c.k === 'log') {
        LINES8.forEach(function (l, i) {
          runRx(c.p, l, { all: true }).ms.forEach(function (m) {
            st8.rows.push({ cat: 'LOG', ok: false, m: m.v + ' — ' + (i + 1) + '행 offset ' + m.s });
          });
        });
        msg(st8.rows.length ? 'bad' : 'ok', st8.rows.length ? '✘ 오류 코드 ' + st8.rows.length + '건 — RESULTS 감각: 발견마다 위치가 한 줄씩.' : '통과');
      }
      if (c.k === 'em') {
        LINES8.forEach(function (l) {
          runRx(c.p, l, { all: true }).ms.forEach(function (m) {
            st8.rows.push({ cat: 'EMAIL', ok: true, m: m.v + ' — 1차 형식 통과(표준 전체 검증 아님)' });
          });
        });
        msg('ok', '✓ 이메일처럼 보이는 문자열 ' + st8.rows.length + '건. "1차 검사"라는 급간을 잊지 마세요.');
      }
      if (c.k === 'code') {
        LINES8.forEach(function (l, i) {
          runRx(c.p, l, { all: true, icase: st8.icase }).ms.forEach(function (m) {
            st8.rows.push({ cat: 'CODE', ok: false, m: 'obsolete SEARCH — ' + (i + 1) + '행 offset ' + m.s + ' → FIND로 교체' });
          });
        });
        if (!st8.rows.length) msg('bad', '✘ 적발 0건?! 4행의 <code>search</code>는 소문자 — <b>IGNORING CASE</b>를 켜고 다시.');
        else msg('ok', '✓ ' + st8.rows.length + '건 적발. 5행 RESEARCH는 <code>\\b</code>(word boundary) 덕에 오탐 없음!');
      }
      r8();
    };
    $('rxBtns').innerHTML =
      '<button type="button" class="prim" data-a="run">▶ 게이트 실행</button>' +
      '<button type="button" data-a="ic">IGNORING CASE 토글</button>' +
      '<button type="button" data-a="mask">이메일 마스킹 미리보기</button>' +
      '<button type="button" data-a="rs">Reset</button>';
    $('rxBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
      if (a === 'run') run8();
      if (a === 'ic') { st8.icase = !st8.icase; st8.ck = 'code'; r8(); msg('info', 'IGNORING CASE ' + (st8.icase ? 'ON' : 'OFF') + ' — obsolete 검사에서 ▶ 실행으로 차이를 보세요.'); }
      if (a === 'mask') {
        st8.masked = LINES8[0].replace(/([\w.+-]{2})[\w.+-]*(@)/, '$1***$2');
        st8.ck = 'em'; r8();
        msg('ok', '✓ 함수형 replace 감각의 미리보기 — <code>([\\w.+-]{2})[\\w.+-]*(@)</code> → <code>$1***$2</code>. 원본은 바꾸지 않았습니다.');
      }
      if (a === 'rs') { st8 = { ck: 'log', icase: false, rows: [], masked: null }; r8(); msg('info', '검사 종류를 바꿔 가며 실행해 보세요.'); }
    });
    r8(); msg('info', '로그→이메일→obsolete 순서로 실행해 보세요. 소문자 search와 RESEARCH가 함정 포인트.');
  }

  window.addEventListener('load', post);
  window.addEventListener('resize', post);
})();
