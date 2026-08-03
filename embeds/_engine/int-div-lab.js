// ===== int-div-lab 엔진 JS — 정수 나눗셈 반올림 실험실 =====
// 같은 나눗셈(a / b)을 서로 다른 타입 변수에 담아 결과를 대조한다.
//   ① I(정수) 변수 → 소수점 이하가 "반올림"돼 사라진다(7 / 2 = 4, 버림 아님)
//   ② 소수 타입 변수(P DECIMALS n) → 소수 자리를 그대로 지킨다(3.50)
//   ③ 제수 0 → 실행 중 그 자리에서 멈춘다(bad 판정)
// 반올림은 ABAP 상용 반올림(0.5는 0에서 먼 쪽) — 음수도 부호 기준으로 처리.
// 설정 = window.IDL_CFG {
//   a, b        : 초기 피제수·제수
//   intVar      : { name, type }                    I 결과 변수
//   decVar      : { name, type, dec, badge? }       소수 결과 변수(badge = [선행 사용] 등 표시)
//   presets     : [{ a, b, label? }]                빠른 실험 칩
//   otherLang   : '…{trunc}…{round}…'               버림 언어 대조 한 줄(생략 가능).
//                 {trunc}=버림 결과·{round}=ABAP 반올림 결과로 치환되고, 둘이 같으면 줄 자체를 감춘다.
//   note        : 하단 안내(HTML — 레슨 작성자 신뢰)
// }
// 골격 계약: 루트 [data-idl] 하나. 높이는 _autoheight.js.
(function () {
  var cfg = window.IDL_CFG; if (!cfg) return;
  var root = document.querySelector('[data-idl]'); if (!root) return;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var iv = cfg.intVar || { name: 'gv_r', type: 'i' };
  var dv = cfg.decVar || { name: 'gv_amt', type: 'p LENGTH 8 DECIMALS 2', dec: 2 };
  var DEC = dv.dec == null ? 2 : dv.dec;

  /* 0에서 먼 쪽으로 반올림(ABAP 상용 반올림) */
  function roundAway(x, dec) {
    var f = Math.pow(10, dec || 0), s = x < 0 ? -1 : 1;
    return s * Math.round(Math.abs(x) * f + 1e-9) / f;
  }
  /* 수학적 몫 — 안 떨어지면 … 을 붙여 "잘린 표시"임을 알린다 */
  function exactStr(q) {
    var s = q.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    return Math.abs(parseFloat(s) - q) > 1e-12 ? s + '…' : s;
  }

  /* ---- 골격은 한 번만 그린다(입력 포커스 유지) ---- */
  var chips = (cfg.presets || []).map(function (p, i) {
    return '<button type="button" class="idl-chip" data-p="' + i + '">' + esc(p.label || (p.a + ' ÷ ' + p.b)) + '</button>';
  }).join('');

  root.innerHTML =
    '<div class="idl-ctl">' +
      '<label class="idl-f"><span>피제수(나눠지는 수)</span><input type="number" data-a value="' + esc(cfg.a) + '" step="1" /></label>' +
      '<span class="idl-op">÷</span>' +
      '<label class="idl-f"><span>제수(나누는 수)</span><input type="number" data-b value="' + esc(cfg.b) + '" step="1" /></label>' +
    '</div>' +
    (chips ? '<div class="idl-chips">' + chips + '</div>' : '') +
    '<pre class="idl-code" data-code></pre>' +
    '<div class="idl-cards">' +
      '<div class="idl-card" data-card-i>' +
        '<div class="idl-card__hd"><code>' + esc(iv.name) + '</code> <span class="idl-tag">TYPE ' + esc(iv.type) + '</span></div>' +
        '<div class="idl-card__val" data-val-i>-</div>' +
        '<div class="idl-card__why" data-why-i></div>' +
      '</div>' +
      '<div class="idl-card" data-card-d>' +
        '<div class="idl-card__hd"><code>' + esc(dv.name) + '</code> <span class="idl-tag">TYPE ' + esc(dv.type) + '</span>' +
          (dv.badge ? '<span class="idl-badge">' + esc(dv.badge) + '</span>' : '') + '</div>' +
        '<div class="idl-card__val" data-val-d>-</div>' +
        '<div class="idl-card__why" data-why-d></div>' +
      '</div>' +
    '</div>' +
    '<div class="idl-verdict" data-verdict></div>' +
    (cfg.note ? '<div class="note">' + cfg.note + '</div>' : '');   // note는 신뢰된 HTML(레슨 작성자)

  var inA = root.querySelector('[data-a]'), inB = root.querySelector('[data-b]');
  var elCode = root.querySelector('[data-code]');
  var elValI = root.querySelector('[data-val-i]'), elValD = root.querySelector('[data-val-d]');
  var elWhyI = root.querySelector('[data-why-i]'), elWhyD = root.querySelector('[data-why-d]');
  var cardI = root.querySelector('[data-card-i]'), cardD = root.querySelector('[data-card-d]');
  var elVer = root.querySelector('[data-verdict]');

  function num(el) { var v = el.value.trim(); return v === '' ? null : Number(v); }

  function update() {
    var a = num(inA), b = num(inB);
    var bad = (a === null || b === null || !isFinite(a) || !isFinite(b) || a !== Math.trunc(a) || b !== Math.trunc(b));

    elCode.textContent =
      'DATA ' + iv.name + ' TYPE ' + iv.type + '.\n' +
      'DATA ' + dv.name + ' TYPE ' + dv.type + '.\n\n' +
      iv.name + ' = ' + (bad ? '?' : a) + ' / ' + (bad ? '?' : b) + '.\n' +
      dv.name + ' = ' + (bad ? '?' : a) + ' / ' + (bad ? '?' : b) + '.';

    cardI.className = 'idl-card'; cardD.className = 'idl-card';
    elVer.className = 'idl-verdict';

    if (bad) {
      elValI.textContent = '?'; elValD.textContent = '?';
      elWhyI.textContent = ''; elWhyD.textContent = '';
      elVer.innerHTML = '두 칸에 <b>정수</b>를 넣어 보세요 — 정수끼리 나눴을 때 무슨 일이 생기는지 보는 실험입니다.';
      return;
    }
    if (b === 0) {
      elValI.textContent = '—'; elValD.textContent = '—';
      elWhyI.textContent = ''; elWhyD.textContent = '';
      cardI.className = 'idl-card bad'; cardD.className = 'idl-card bad';
      elVer.className = 'idl-verdict bad';
      elVer.innerHTML = '<b>0으로는 나눌 수 없다.</b> 이 줄에서 프로그램이 <b>그 자리에서 멈춘다</b>(실행 중 오류). 나누기 전에 제수가 0인지 확인하는 습관이 필요하다.';
      return;
    }

    var q = a / b;
    var ri = roundAway(q, 0);
    var rd = roundAway(q, DEC);
    var isWhole = Math.abs(q - Math.trunc(q)) < 1e-12;

    elValI.textContent = String(ri);
    elValD.textContent = rd.toFixed(DEC);
    elWhyI.textContent = isWhole ? '딱 떨어져서 그대로' : '소수점 이하가 반올림돼 사라짐';
    elWhyD.textContent = isWhole ? '딱 떨어져서 그대로' : '소수 ' + DEC + '자리까지 지킴';

    if (isWhole) {
      elVer.className = 'idl-verdict ok';
      elVer.innerHTML = '<b>' + a + ' / ' + b + ' = ' + exactStr(q) + '</b> — 딱 떨어지는 나눗셈이라 어느 타입에 담아도 결과가 같다. 안 떨어지는 값(예: <b>7 ÷ 2</b>)으로 바꿔 보자.';
    } else {
      var h = '몫은 <b>' + exactStr(q) + '</b>. 그런데 <code>' + esc(iv.name) + '</code>(정수 박스)에 담기는 값은 <b>' + ri + '</b> — 소수점 이하가 <b>반올림</b>돼 사라졌다. ' +
              '같은 나눗셈이라도 <code>' + esc(dv.name) + '</code>에 담으면 <b>' + rd.toFixed(DEC) + '</b> 그대로 남는다.';
      var tr = Math.trunc(q);                      // 다른 언어의 정수 나눗셈(버림)
      // 음수 몫은 언어마다 버림 방향이 갈린다(Java·C#=0 쪽 / 파이썬 //=아래쪽) → 대조 줄은 양수 몫에서만.
      if (cfg.otherLang && tr !== ri && q > 0) {
        h += '<span class="idl-other">' + cfg.otherLang.replace(/\{trunc\}/g, tr).replace(/\{round\}/g, ri) + '</span>';
      }
      elVer.innerHTML = h;
      cardI.className = 'idl-card warn';
      cardD.className = 'idl-card keep';
    }
  }

  root.addEventListener('click', function (e) {
    var c = e.target.closest('[data-p]'); if (!c) return;
    var p = (cfg.presets || [])[+c.getAttribute('data-p')]; if (!p) return;
    inA.value = p.a; inB.value = p.b; update();
  });
  root.addEventListener('input', function (e) { if (e.target === inA || e.target === inB) update(); });

  update();
})();
