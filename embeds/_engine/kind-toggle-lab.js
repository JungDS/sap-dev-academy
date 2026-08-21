// ===== kind-toggle-lab 엔진 JS — 같은 코드, 테이블 종류만 토글 (CH06-L07) =====
// 종류 탭(STANDARD/HASHED…) → 선언이 바뀌고, 그릇 시각화(번호 선반 vs 번호 없는 사물함)·
// [LOOP 돌려 보기] 순회 출력(sy-tabix 대비)·[SORT 실행 → 다시 LOOP] 순회 순서 변화(선택)·
// [READ INDEX 시도] 판정 카드(구문 오류 포함)를 관찰.
// 데이터 = window.KTL_CFG(인스턴스 주입 — 엔진에 레슨 데이터 없음).
// KTL_CFG = { commonCode:[줄..], kinds:[{ id, tab, decl:[줄..], binCap,
//              rows:[{k,vals:[..]}..], numbered:true|false,
//              loop:[{tabix,label}..], loopCap,
//              (선택) sort:{ btn(버튼 라벨 HTML), rows?(정렬 후 그릇 — 생략=그대로),
//                           loop, cap(정렬 후 순회·캡션), readTry?(정렬 후 카드 — 생략=기존) },
//              readTry:{ ok, title, body } }..], idle }
// sort 미지정 인스턴스는 종전과 동일 동작(버튼 자체가 안 생김).
(function () {
  var cfg = window.KTL_CFG; if (!cfg) return;
  var root = document.querySelector('[data-ktl]'); if (!root) return;
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  var ki = 0, looped = false, readTried = false, sorted = false;
  function kind() { return cfg.kinds[ki]; }

  function binsHTML() {
    var k = kind();
    var rows = (sorted && k.sort && k.sort.rows) ? k.sort.rows : k.rows;
    var h = '<div class="ktl-bins' + (k.numbered ? '' : ' nolab') + '">';
    rows.forEach(function (r, i) {
      h += '<div class="ktl-bin">' +
        '<span class="ktl-bin__no">' + (k.numbered ? (i + 1) + '번' : '번호 없음') + '</span>' +
        '<span class="ktl-bin__key">🔑 ' + esc(r.k) + '</span>' +
        '<span class="ktl-bin__val">' + esc(r.vals.join(' · ')) + '</span></div>';
    });
    return h + '</div><div class="ktl-cap">' + k.binCap + '</div>';
  }

  function codeHTML() {
    var k = kind();
    return '<div class="ktl-code"><div class="ktl-code__hd"><span class="ktl-dots"><i></i><i></i><i></i></span><span>같은 코드 — 선언만 다르다 (ABAP)</span></div>' +
      '<pre><span class="ktl-decl">' + k.decl.map(esc).join('\n') + '</span>\n' +
      cfg.commonCode.map(esc).join('\n') + '</pre></div>';
  }

  function loopHTML() {
    var k = kind();
    if (!looped) return '<div class="ktl-out idle">▶ LOOP 돌려 보기를 누르면 순회 결과가 여기 나옵니다.</div>';
    var srt = sorted && k.sort;
    var lines = (srt ? k.sort.loop : k.loop).map(function (l) {
      return '<div class="ktl-out__ln"><span class="tb' + (String(l.tabix) === '0' ? ' zero' : '') + '">sy-tabix ' + l.tabix + '</span>' + esc(l.label) + '</div>';
    }).join('');
    return '<div class="ktl-out">' + lines + '<div class="ktl-out__cap">' + (srt ? k.sort.cap : k.loopCap) + '</div></div>';
  }

  function readHTML() {
    var k = kind();
    if (!readTried) return '';
    var r = (sorted && k.sort && k.sort.readTry) ? k.sort.readTry : k.readTry;
    return '<div class="ktl-read ' + (r.ok ? 'ok' : 'bad') + '"><div class="t">' + r.title + '</div>' + r.body + '</div>';
  }

  function render() {
    var tabs = cfg.kinds.map(function (x, i) {
      return '<button type="button" class="ktl-tab' + (i === ki ? ' on' : '') + '" data-k="' + i + '">' + esc(x.tab) + '</button>';
    }).join('');
    var btns = '<div class="ktl-btns">' +
      '<button type="button" class="ktl-btn primary" data-loop>▶ LOOP 돌려 보기</button>' +
      (kind().sort ? '<button type="button" class="ktl-btn" data-sortbtn' + (sorted ? ' disabled' : '') + '>' + kind().sort.btn + '</button>' : '') +
      '<button type="button" class="ktl-btn" data-read><code>READ … INDEX 2</code> 시도</button></div>';
    root.innerHTML = '<div class="ktl-tabs">' + tabs + '</div>' +
      '<div class="ktl-grid"><div>' + codeHTML() + '</div><div>' + binsHTML() + '</div></div>' +
      btns + loopHTML() + readHTML();
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('.ktl-tab');
    if (t) { ki = +t.dataset.k; looped = false; readTried = false; sorted = false; render(); return; }
    if (e.target.closest('[data-loop]')) { looped = true; render(); return; }
    if (e.target.closest('[data-sortbtn]')) { sorted = true; looped = true; render(); return; }
    if (e.target.closest('[data-read]')) { readTried = true; render(); }
  });

  render();
})();
