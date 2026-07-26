/* dyn-lab — Dynamic ABAP 체험 엔진 (CH28 L01~L08 공통).
   위젯의 <script type="application/json" id="dyn-cfg">에서 { mode } 를 읽는다.
   mode: 'pointer'(L01 typed/generic 이름표) | 'gate'(L02 generic 파라미터) | 'state'(L03 ASSIGN 상태기계)
       | 'picker'(L04 ASSIGN COMPONENT+whitelist) | 'lookup'(L05 ASSIGN (name) 검색사다리)
       | 'factory'(L06 CREATE DATA 3단계) | 'lens'(L07 RTTS describe/CAST) | 'inspector'(L08 캡스톤 파이프라인).
   공통: #dynStage(본문 UI) · #dynMsg(피드백) · 데이터 정본 = ZBOOKING 부분집합(0001/C001/정훈영/2/N — 정본 표기), status N/C. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cfg; try { cfg = JSON.parse($('dyn-cfg').textContent); } catch (e) { cfg = { mode: 'pointer' }; }
  var mode = cfg.mode, stage = $('dynStage'), msgEl = $('dynMsg');
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function msg(c, h) { msgEl.className = 'msg ' + c; msgEl.innerHTML = h; post(); }
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }

  /* ── L01 pointer: 메모리 상자 + 이름표 ── */
  if (mode === 'pointer') {
    var st1 = { typed: false, generic: false, status: 'N' };
    var r1 = function () {
      stage.innerHTML =
        '<div class="dl-cols"><div class="dl-box"><div class="dl-box__h">메모리 상자 gs_booking</div>' +
        '<table class="dl-t"><tr><td>BOOKING_ID</td><td>0001</td></tr><tr><td>STATUS</td><td class="hl">' + st1.status + '</td></tr><tr><td>SEATS</td><td>2</td></tr></table></div>' +
        '<div class="dl-tags">' +
        '<div class="dl-tag' + (st1.typed ? ' on' : '') + '">&lt;ls_typed&gt; TYPE ts_booking<span>' + (st1.typed ? '→ gs_booking' : '(미할당)') + '</span></div>' +
        '<div class="dl-tag' + (st1.generic ? ' on' : '') + '">&lt;ls_generic&gt; TYPE any<span>' + (st1.generic ? '→ gs_booking' : '(미할당)') + '</span></div>' +
        '</div></div>';
      post();
    };
    $('dynBtns').innerHTML =
      '<button data-a="at" type="button">ASSIGN typed</button>' +
      '<button data-a="ct" type="button">typed로 status 변경</button>' +
      '<button data-a="ag" type="button">ASSIGN generic</button>' +
      '<button data-a="cg" type="button">generic-status 직접 접근</button>' +
      '<button data-a="un" type="button">UNASSIGN 둘 다</button>';
    $('dynBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
      if (a === 'at') { st1.typed = true; r1(); msg('ok', '✓ <b>&lt;ls_typed&gt;</b>가 gs_booking을 가리킵니다. 모양을 아니 <code>-status</code>를 바로 쓸 수 있어요.'); }
      if (a === 'ct') { if (!st1.typed) { msg('bad', '✕ 아직 아무것도 가리키지 않습니다 — Field Symbol은 <b>ASSIGN 전 사용 불가</b>.'); return; } st1.status = 'C'; r1(); msg('ok', '✓ <code>&lt;ls_typed&gt;-status = \'C\'</code> — 바뀐 건 이름표가 아니라 <b>원본 상자</b>입니다.'); }
      if (a === 'ag') { st1.generic = true; r1(); msg('ok', '✓ <b>&lt;ls_generic&gt;</b>(TYPE any)도 같은 상자를 가리킵니다. 단, 컴파일러는 이 상자의 <b>모양을 모릅니다</b>.'); }
      if (a === 'cg') { if (!st1.generic) { msg('bad', '✕ 먼저 ASSIGN generic부터.'); return; } msg('bad', '✕ <code>&lt;ls_generic&gt;-status</code>는 <b>syntax 오류</b> — TYPE any는 필드를 바로 알 수 없습니다. 실행 중 확인(ASSIGN COMPONENT, L04)이 필요해요.'); }
      if (a === 'un') { st1.typed = st1.generic = false; r1(); msg('info', 'UNASSIGN — 두 이름표 모두 아무것도 가리키지 않습니다. 원본 상자 값은 그대로.'); }
    });
    r1(); msg('info', '이름표를 붙이기 전엔 아무것도 가리키지 않습니다. 버튼으로 typed↔generic 차이를 확인하세요.');
  }

  /* ── L02 gate: 입력 종류 → 허용 작업 ── */
  if (mode === 'gate') {
    var KINDS = {
      struct: { nm: 'gs_booking (구조)', ops: [['lines( ) 행 수 세기', 0, '테이블이 아닙니다'], ['WRITE로 통값 출력', 1, ''], ['-booking_id 필드 직접 접근', 0, '컴파일 시점에 필드를 모릅니다'], ['ASSIGN COMPONENT 경유 접근', 1, '']] },
      table: { nm: 'gt_booking (내부 테이블)', ops: [['lines( ) 행 수 세기', 1, ''], ['WRITE로 통값 출력', 0, '테이블은 통째로 못 씁니다'], ['-booking_id 필드 직접 접근', 0, '줄 타입을 모릅니다'], ['LOOP + ASSIGN COMPONENT', 1, '']] },
      elem: { nm: 'gv_text (낱값)', ops: [['lines( ) 행 수 세기', 0, '테이블이 아닙니다'], ['WRITE로 값 출력', 1, ''], ['필드 접근', 0, '낱값엔 필드가 없습니다'], ['RTTS로 정체 확인', 1, '']] }
    };
    var cur2 = 'struct';
    var r2 = function () {
      var k = KINDS[cur2];
      stage.innerHTML = '<div class="dl-seg">' + Object.keys(KINDS).map(function (key) {
        return '<button class="dl-seg__b' + (key === cur2 ? ' on' : '') + '" data-k="' + key + '" type="button">' + esc(KINDS[key].nm) + '</button>';
      }).join('') + '</div><div class="dl-ops">' + k.ops.map(function (o) {
        return '<div class="dl-op ' + (o[1] ? 'ok' : 'no') + '">' + (o[1] ? '✓ ' : '✕ ') + esc(o[0]) + (o[2] ? '<span>' + esc(o[2]) + '</span>' : '') + '</div>';
      }).join('') + '</div>';
      [].forEach.call(stage.querySelectorAll('.dl-seg__b'), function (b) {
        b.addEventListener('click', function () { cur2 = b.dataset.k; r2(); msg('info', '<b>TYPE any / ANY TABLE</b> 파라미터로 <b>' + esc(KINDS[cur2].nm) + '</b>가 들어왔습니다 — 허용 작업이 바뀝니다.'); });
      });
      post();
    };
    r2(); msg('info', '입력 종류를 바꿔 보세요 — generic 파라미터는 "무엇이든 받기"이지 "무엇이든 같은 방식으로 쓰기"가 아닙니다.');
  }

  /* ── L03 state: ASSIGN 상태 기계 ── */
  if (mode === 'state') {
    var st3 = { points: null, subrc: '-', orig: 'N' };   // points: null|'STATUS'
    var r3 = function () {
      stage.innerHTML =
        '<div class="dl-state"><span class="dl-chip ' + (st3.points ? 'on' : '') + '">&lt;lv_field&gt; ' + (st3.points ? '→ STATUS' : '미할당') + '</span>' +
        '<span class="dl-chip">sy-subrc = ' + st3.subrc + '</span>' +
        '<span class="dl-chip">IS ASSIGNED = ' + (st3.points ? 'X(참)' : '공백(거짓)') + '</span></div>' +
        '<div class="dl-box"><div class="dl-box__h">원본 gs_booking-STATUS</div><div class="dl-orig">' + (st3.orig === '' ? '(초기화됨)' : st3.orig) + '</div></div>';
      post();
    };
    $('dynBtns').innerHTML =
      '<button data-a="ok" type="button">ASSIGN STATUS</button>' +
      '<button data-a="failkeep" type="button">ASSIGN UNKNOWN (ELSE 없이)</button>' +
      '<button data-a="failun" type="button">ASSIGN UNKNOWN + ELSE UNASSIGN</button>' +
      '<button data-a="clear" type="button">CLEAR &lt;lv_field&gt;</button>' +
      '<button data-a="unassign" type="button">UNASSIGN &lt;lv_field&gt;</button>';
    $('dynBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
      if (a === 'ok') { st3.points = 'STATUS'; st3.subrc = '0'; r3(); msg('ok', '✓ 성공 — sy-subrc=0, STATUS를 가리킵니다.'); }
      if (a === 'failkeep') { st3.subrc = '4'; r3(); msg('bad', '⚠ <b>실패(sy-subrc=4)했는데</b> ELSE UNASSIGN이 없어 ' + (st3.points ? '<b>여전히 이전 STATUS를 가리킵니다</b> — IS ASSIGNED만 보면 성공으로 착각!' : '(이전 할당도 없어 미할당 그대로)') + ''); }
      if (a === 'failun') { st3.subrc = '4'; st3.points = null; r3(); msg('info', '실패(sy-subrc=4) + <b>ELSE UNASSIGN</b> — 연결이 끊겨 이전 할당 착각이 원천 차단됩니다.'); }
      if (a === 'clear') { if (!st3.points) { msg('bad', '✕ 미할당 상태의 CLEAR — 가리키는 곳이 없습니다.'); return; } st3.orig = ''; r3(); msg('bad', '⚠ <b>CLEAR는 연결 해제가 아닙니다</b> — 가리키던 <b>원본 STATUS 값이 초기화</b>됐습니다!'); }
      if (a === 'unassign') { st3.points = null; r3(); msg('info', 'UNASSIGN — <b>연결만</b> 끊겼습니다. 원본 값은 그대로: ' + (st3.orig === '' ? '(앞서 CLEAR로 지워짐)' : st3.orig)); }
    });
    r3(); msg('info', '핵심: sy-subrc(방금 성공했나)와 IS ASSIGNED(지금 가리키나)는 <b>다른 질문</b>입니다.');
  }

  /* ── L04 picker: 필드 선택 + whitelist ── */
  if (mode === 'picker') {
    var FLD = [['BOOKING_ID', '0001', true], ['CONCERT_ID', 'C001', false], ['CUSTOMER', '정훈영', true], ['SEATS', '2', false], ['STATUS', 'N', true]];
    var st4 = { sel: null };
    var r4 = function () {
      stage.innerHTML =
        '<div class="dl-cols"><table class="dl-t dl-t--pick">' + FLD.map(function (f, i) {
          return '<tr class="' + (st4.sel === i ? 'sel' : '') + '"><td>' + f[0] + '</td><td>' + f[1] + '</td></tr>';
        }).join('') + '</table>' +
        '<div class="dl-wl"><div class="dl-box__h">whitelist(허용 필드)</div>' + FLD.map(function (f) {
          return '<div>' + (f[2] ? '☑' : '☐') + ' ' + f[0] + '</div>';
        }).join('') + '</div></div>' +
        '<div class="dl-inp"><input id="dynName" placeholder="필드 이름 (예: STATUS·UNKNOWN)" autocomplete="off" /><button id="dynGo" type="button">ASSIGN COMPONENT</button></div>';
      $('dynGo').addEventListener('click', function () {
        var nm = ($('dynName').value || '').trim().toUpperCase();
        if (!nm) { msg('info', '필드 이름을 입력하세요.'); return; }
        var i = FLD.findIndex(function (f) { return f[0] === nm; });
        if (i < 0) { st4.sel = null; r4(); msg('bad', '✕ <b>' + esc(nm) + '</b> — 구조에 없는 필드(sy-subrc=4). ELSE UNASSIGN으로 이전 할당도 끊었습니다.'); return; }
        if (!FLD[i][2]) { st4.sel = null; r4(); msg('bad', '⚠ <b>' + esc(nm) + '</b>는 구조에는 있지만 <b>whitelist에 없습니다</b> — "구조에 있다 ≠ 보여 줘도 된다".'); return; }
        st4.sel = i; r4(); msg('ok', '✓ <code>ASSIGN COMPONENT \'' + esc(nm) + '\'</code> 성공(sy-subrc=0) — &lt;lv_value&gt;가 그 칸을 가리킵니다. 값 = <b>' + esc(FLD[i][1]) + '</b>');
      });
      post();
    };
    r4(); msg('info', 'STATUS·CONCERT_ID·UNKNOWN을 각각 넣어 보세요 — 성공/whitelist 거절/미존재 실패가 다 다릅니다.');
  }

  /* ── L05 lookup: 이름 검색 사다리 ── */
  if (mode === 'lookup') {
    var NAMES = {
      'LV_STATUS': { scope: 0, ok: true, note: '메서드의 로컬 변수에서 찾았습니다.' },
      'GV_STATUS': { scope: 2, ok: true, note: '프로그램 전역에서 찾았습니다.' },
      'SY-DATUM': { scope: 2, ok: true, note: '시스템 필드 — 진단 도구의 대표 허용 이름.' },
      'GS_BOOKING-STATUS': { scope: 2, ok: true, note: '찾아지긴 하지만 — 구조 필드는 <b>ASSIGN COMPONENT</b>(L04)가 더 안전하고 선명합니다.' },
      'UNKNOWN': { scope: -1, ok: false, note: '어느 범위에도 없음 — sy-subrc=4 (오타는 컴파일이 못 잡습니다).' }
    };
    var LADDER = ['① 로컬 변수', '② 보이는 속성', '③ 프로그램 전역·TABLES'];
    var wl5 = false;
    var r5 = function (hit) {
      stage.innerHTML =
        '<div class="dl-seg">' + Object.keys(NAMES).map(function (n) {
          return '<button class="dl-seg__b" data-n="' + n + '" type="button">' + n + '</button>';
        }).join('') + '</div>' +
        '<label class="dl-wl5"><input type="checkbox" id="dynWl"' + (wl5 ? ' checked' : '') + ' /> whitelist 적용(SY-* 만 허용)</label>' +
        '<div class="dl-ladder">' + LADDER.map(function (s, i) {
          return '<div class="dl-rung' + (hit === i ? ' on' : '') + '">' + s + '</div>';
        }).join('') + '</div>';
      $('dynWl').addEventListener('change', function () { wl5 = this.checked; msg('info', wl5 ? 'whitelist ON — SY-* 이외 이름은 검사에서 거절됩니다.' : 'whitelist OFF — 문자열이 곧장 이름 검색으로 갑니다(위험).'); });
      [].forEach.call(stage.querySelectorAll('.dl-seg__b'), function (b) {
        b.addEventListener('click', function () {
          var n = b.dataset.n, d = NAMES[n];
          if (wl5 && n.indexOf('SY-') !== 0) { r5(-1); msg('bad', '⛔ whitelist 거절 — <b>' + n + '</b>은(는) 허용 목록에 없습니다. ASSIGN까지 가지도 않습니다.'); return; }
          r5(d.scope);
          msg(d.ok ? 'ok' : 'bad', (d.ok ? '✓ ' : '✕ ') + '<b>' + n + '</b> — ' + d.note);
        });
      });
      post();
    };
    r5(-1); msg('info', '이름을 눌러 검색 사다리의 어느 칸에서 찾히는지 보세요. whitelist를 켜면 어떻게 달라질까요?');
  }

  /* ── L06 factory: CREATE DATA 3단계 ── */
  if (mode === 'factory') {
    var st6 = { type: 'TS_BOOKING', created: false, deref: false };
    var r6 = function () {
      stage.innerHTML =
        '<div class="dl-seg">' + ['TS_BOOKING', 'SYST', 'UNKNOWN_TYPE'].map(function (t) {
          return '<button class="dl-seg__b' + (st6.type === t ? ' on' : '') + '" data-t="' + t + '" type="button">' + t + '</button>';
        }).join('') + '</div>' +
        '<div class="dl-flow">' +
        '<div class="dl-fnode' + (st6.created ? ' on' : '') + '">gr_data<span>REF TO data</span></div><div class="dl-arrow">' + (st6.created ? '→' : '·') + '</div>' +
        '<div class="dl-fnode' + (st6.created ? ' on' : '') + '">(이름 없는 데이터)<span>' + (st6.created ? st6.type : '아직 없음') + '</span></div><div class="dl-arrow">' + (st6.deref ? '←' : '·') + '</div>' +
        '<div class="dl-fnode' + (st6.deref ? ' on' : '') + '">&lt;ls_data&gt;<span>' + (st6.deref ? 'dref->* 역참조' : '미할당') + '</span></div></div>';
      [].forEach.call(stage.querySelectorAll('.dl-seg__b'), function (b) {
        b.addEventListener('click', function () { st6 = { type: b.dataset.t, created: false, deref: false }; r6(); msg('info', '타입 = ' + b.dataset.t + '. CREATE DATA부터 순서대로.'); });
      });
      post();
    };
    $('dynBtns').innerHTML =
      '<button data-a="create" type="button">① CREATE DATA</button>' +
      '<button data-a="deref" type="button">② ASSIGN gr_data-&gt;*</button>' +
      '<button data-a="comp" type="button">③ ASSIGN COMPONENT</button>';
    $('dynBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
      if (a === 'create') {
        if (st6.type === 'UNKNOWN_TYPE') { msg('bad', '✕ <b>예외 cx_sy_create_data_error</b> — 없는 타입 이름. CREATE DATA 실패는 sy-subrc가 아니라 <b>예외</b>로 받습니다(TRY/CATCH).'); return; }
        st6.created = true; r6(); msg('ok', '✓ 실행 중에 <b>이름 없는 데이터</b>가 생겼고 gr_data가 잡고 있습니다.');
      }
      if (a === 'deref') { if (!st6.created) { msg('bad', '✕ reference가 initial — 역참조 실패(sy-subrc=4). CREATE DATA 먼저.'); return; } st6.deref = true; r6(); msg('ok', '✓ <code>gr_data-&gt;*</code>(내용물)를 &lt;ls_data&gt;가 가리킵니다.'); }
      if (a === 'comp') {
        if (!st6.deref) { msg('bad', '✕ 아직 내용물을 가리키지 않습니다 — ② 먼저.'); return; }
        if (st6.type === 'TS_BOOKING') { msg('ok', '✓ <code>ASSIGN COMPONENT \'BOOKING_ID\'</code> → 값 설정 가능. 세 단계가 완성됐습니다.'); }
        else { msg('info', 'SYST 구조의 필드(UNAME 등)에 접근합니다 — 흐름은 동일해요.'); }
      }
    });
    r6(); msg('info', '타입을 고르고 ①→②→③. UNKNOWN_TYPE의 ①에서 무슨 일이 나는지 꼭 보세요.');
  }

  /* ── L07 lens: RTTS describe/CAST ── */
  if (mode === 'lens') {
    var CARDS = {
      elem: { nm: 'gv_seats (낱값 i)', kind: 'E (elementary)', comps: null },
      struct: { nm: 'gs_booking (구조)', kind: 'S (structure)', comps: ['BOOKING_ID', 'CONCERT_ID', 'SEATS', 'STATUS'] },
      table: { nm: 'gt_booking (내부 테이블)', kind: 'T (table)', comps: null }
    };
    var cur7 = null;
    var r7 = function () {
      stage.innerHTML = '<div class="dl-seg">' + Object.keys(CARDS).map(function (k) {
        return '<button class="dl-seg__b' + (cur7 === k ? ' on' : '') + '" data-k="' + k + '" type="button">' + esc(CARDS[k].nm) + '</button>';
      }).join('') + '</div><div id="dynLens" class="dl-lens">' + (cur7 ?
        '<div><b>type_kind</b> = ' + CARDS[cur7].kind + '</div>' +
        (CARDS[cur7].comps ? '<div class="dl-comps"><b>components</b>(metadata — 값 아님!): ' + CARDS[cur7].comps.join(' · ') + '</div>' : '<div class="dl-comps dim">components 없음(구조가 아님)</div>')
        : '<span class="dim">카드를 골라 describe_by_data를 실행하세요.</span>') + '</div>';
      [].forEach.call(stage.querySelectorAll('.dl-seg__b'), function (b) {
        b.addEventListener('click', function () { cur7 = b.dataset.k; r7(); msg('ok', '✓ describe_by_data — 타입 설명서 객체를 받았습니다. type_kind = <b>' + CARDS[cur7].kind + '</b>'); });
      });
      post();
    };
    $('dynBtns').innerHTML = '<button data-a="cast" type="button">cl_abap_structdescr로 CAST</button>';
    $('dynBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (!cur7) { msg('info', '먼저 카드를 골라 describe부터.'); return; }
      if (cur7 === 'struct') { msg('ok', '✓ CAST 성공 — 이제 <code>components</code>로 필드 목록을 읽을 수 있습니다(값은 여전히 ASSIGN COMPONENT).'); }
      else { msg('bad', '✕ <b>예외 cx_sy_move_cast_error</b> — 구조 설명서가 아닙니다. type_kind 확인 없이 CAST하면 이렇게 터집니다.'); }
    });
    r7(); msg('info', '같은 렌즈(describe)로 세 종류를 비춰 보세요 — 구조일 때만 components가 열립니다.');
  }

  /* ── L08 inspector: 캡스톤 파이프라인 ── */
  if (mode === 'inspector') {
    var REQ = [['BOOKING_ID', true], ['CUSTOMER', true], ['STATUS', true], ['UNKNOWN', true], ['SEATS', false]];
    var VAL = { BOOKING_ID: '0001', CONCERT_ID: 'C001', CUSTOMER: '정훈영', SEATS: '2', STATUS: 'N' };
    var input8 = 'struct';
    var r8 = function (results, failStep) {
      stage.innerHTML =
        '<div class="dl-seg"><button class="dl-seg__b' + (input8 === 'struct' ? ' on' : '') + '" data-i="struct" type="button">gs_booking (구조)</button>' +
        '<button class="dl-seg__b' + (input8 === 'elem' ? ' on' : '') + '" data-i="elem" type="button">gv_number (낱값)</button></div>' +
        '<div class="dl-req">' + REQ.map(function (r, i) {
          return '<button class="dl-chip' + (r[1] ? ' on' : '') + '" data-r="' + i + '" type="button">' + r[0] + '</button>';
        }).join('') + ' <span class="dim">← 요청 필드(토글)</span></div>' +
        '<div class="dl-flow dl-flow--pipe">' + ['① describe', '② metadata 대조', '③ ASSIGN', '④ 결과'].map(function (s, i) {
          return '<div class="dl-fnode' + (failStep === i ? ' bad' : (failStep === -1 || i < failStep ? ' on' : '')) + '">' + s + '</div>';
        }).join('<div class="dl-arrow">→</div>') + '</div>' +
        (results ? '<table class="dl-t dl-t--res"><tr><th>필드</th><th>found</th><th>값</th><th>메시지</th></tr>' + results.map(function (r) {
          return '<tr><td>' + r[0] + '</td><td>' + (r[1] ? 'X' : '') + '</td><td>' + (r[2] || '') + '</td><td>' + r[3] + '</td></tr>';
        }).join('') + '</table>' : '');
      [].forEach.call(stage.querySelectorAll('[data-i]'), function (b) {
        b.addEventListener('click', function () { input8 = b.dataset.i; r8(null, null); msg('info', '입력 = ' + (input8 === 'struct' ? '구조' : '낱값') + '. ▶ 검사 실행을 눌러 보세요.'); });
      });
      [].forEach.call(stage.querySelectorAll('[data-r]'), function (b) {
        b.addEventListener('click', function () { var i = +b.dataset.r; REQ[i][1] = !REQ[i][1]; r8(null, null); });
      });
      post();
    };
    $('dynBtns').innerHTML = '<button data-a="run" class="prim" type="button">▶ 검사 실행</button>';
    $('dynBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (input8 === 'elem') { r8(null, 0); msg('bad', '✕ ① describe→CAST 단계에서 거절 — "입력이 구조가 아닙니다". 파이프라인이 데이터 사고 없이 멈춥니다.'); return; }
      var res = REQ.filter(function (r) { return r[1]; }).map(function (r) {
        var nm = r[0];
        if (!(nm in VAL)) { return [nm, false, '', '구조에 없는 필드입니다']; }
        return [nm, true, VAL[nm], 'OK'];
      });
      r8(res, -1);
      msg(res.some(function (r) { return !r[1]; }) ? 'info' : 'ok', res.length ? '완료 — 실패 행도 <b>안내 메시지</b>로 남습니다(조용한 무시 없음).' : '요청 필드가 없어 결과 0행(오류 아님).');
    });
    r8(null, null); msg('info', '요청 필드를 토글하고 실행하세요. 낱값 입력·UNKNOWN 필드가 각각 어느 단계에서 걸리는지 보세요.');
  }
})();
