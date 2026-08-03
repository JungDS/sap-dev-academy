// ===== const-lock-lab 엔진 JS — "상수는 다시 대입할 수 없다"를 눌러서 확인하는 실험 =====
// 선언 블록(변수 1 + 상수 1)을 보여 주고, 문장 카드를 눌러 실행을 시도한다.
//   ok  → 변수 값이 바뀌고 성공 판정(상수는 오른쪽에서 "읽기"만 하므로 언제나 OK)
//   bad → 문법 오류 판정 + 값은 그대로(컴파일 단계에서 걸려 아예 실행되지 않으므로)
// 설정 = window.CL_CFG {
//   decl  : ['DATA …', 'CONSTANTS …']              선언 블록(코드 줄 배열)
//   state : [{ name, value, locked? }]             값 표시 칩(locked=상수 🔒)
//   tries : [{ code, ok, msg, set?:{이름:값} }]     시도해 볼 문장 카드(msg는 신뢰된 HTML)
//   hint  : '…'                                    시도 전 안내 문구(생략 가능)
// }
// 골격 계약: 루트 [data-cl] 하나. 높이는 _autoheight.js(주 엔진과 공용).
(function () {
  var cfg = window.CL_CFG; if (!cfg) return;
  var root = document.querySelector('[data-cl]'); if (!root) return;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var init = {}; (cfg.state || []).forEach(function (s) { init[s.name] = s.value; });
  var cur = Object.assign({}, init);
  var sel = null;   // 마지막으로 시도한 카드 index

  function render() {
    var h = '<pre class="cl-decl">' + esc((cfg.decl || []).join('\n')) + '</pre>';

    h += '<div class="cl-state">';
    (cfg.state || []).forEach(function (s) {
      h += '<span class="cl-chip' + (s.locked ? ' lock' : '') + '">' + (s.locked ? '🔒 ' : '') +
           '<code>' + esc(s.name) + '</code><b>' + esc(cur[s.name]) + '</b></span>';
    });
    h += '<button type="button" class="cl-reset" data-reset>↺ 처음으로</button></div>';

    h += '<div class="cl-tries">';
    (cfg.tries || []).forEach(function (t, i) {
      h += '<button type="button" class="cl-try' + (sel === i ? ' on' : '') + '" data-try="' + i + '">' + esc(t.code) + '</button>';
    });
    h += '</div>';

    var t = sel === null ? null : (cfg.tries || [])[sel];
    if (!t) {
      h += '<div class="cl-verdict">' + (cfg.hint || '문장을 하나 눌러 실행해 보자 — 어떤 줄이 거부되는지 확인한다.') + '</div>';
    } else if (t.ok) {
      h += '<div class="cl-verdict ok"><b>실행 성공</b> — ' + t.msg + '</div>';
    } else {
      h += '<div class="cl-verdict bad"><b>문법 오류</b> — ' + t.msg +
           '<span class="cl-side">값은 그대로다. 실행 자체가 안 됐으니까.</span></div>';
    }
    root.innerHTML = h;
  }

  root.addEventListener('click', function (e) {
    if (e.target.closest('[data-reset]')) { cur = Object.assign({}, init); sel = null; render(); return; }
    var b = e.target.closest('[data-try]'); if (!b) return;
    var i = +b.getAttribute('data-try'), t = (cfg.tries || [])[i]; if (!t) return;
    if (t.ok && t.set) { Object.keys(t.set).forEach(function (k) { cur[k] = t.set[k]; }); }
    sel = i; render();
  });

  render();
})();
