/* sql-modernize-stepper 엔진 — 같은 SELECT를 classic→콤마→@→INTO-뒤로 순으로 한 단계씩 modern화한다.
   문법(표기)만 바뀌고 결과(행수·sy-subrc·sy-dbcnt)는 항공사 코드에 따라 똑같이 나온다는 걸 보여 준다.
   골격 계약: .sms-stage(세그) · .sms-carr(세그) · #smsCode · #smsResult · #smsWarn.
   config: window.SMS_CFG = { table, cols:[..], varName, target, carrs:[{v,n}] }. 높이: _autoheight.js. */
(function () {
  var CFG = window.SMS_CFG || {
    table: 'sflight', cols: ['carrid', 'connid', 'seatsmax'],
    varName: 'lv_carr', target: 'lt_flight',
    carrs: [{ v: 'LH', n: 5 }, { v: 'AA', n: 3 }, { v: 'ZZ', n: 0 }]
  };
  var stage = 0;            // 0 classic · 1 comma · 2 host(@) · 3 modern(INTO 뒤로)
  var carr = CFG.carrs[0].v;

  var stageEl = document.querySelector('.sms-stage');
  var carrEl = document.querySelector('.sms-carr');
  var codeEl = document.getElementById('smsCode');
  var resEl = document.getElementById('smsResult');
  var warnEl = document.getElementById('smsWarn');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function hl(s) { return '<span class="hl">' + esc(s) + '</span>'; }
  function escp(s) { return '<span class="esc">' + esc(s) + '</span>'; }

  function renderSeg(host, items, active) {
    host.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (it.v === active ? 'true' : 'false') + '">' + esc(it.l) + '</button>';
    }).join('');
  }

  function renderCode() {
    var T = CFG.table, V = CFG.varName, G = CFG.target;
    // SELECT list: 공백(0) vs 콤마(>=1)
    var list = stage >= 1
      ? CFG.cols[0] + hl(',') + ' ' + CFG.cols[1] + hl(',') + ' ' + CFG.cols[2]
      : CFG.cols.join(' ');
    // WHERE 변수: @(>=2)
    var whereVar = stage >= 2 ? escp('@' + V) : V;
    // target: @(>=2)
    var tgt = stage >= 2 ? escp('@' + G) : G;
    var lines;
    if (stage < 3) {
      // classic 흐름: INTO 가 WHERE 앞 (아직 마지막 아님)
      lines =
        'SELECT ' + list + '\n' +
        '  FROM ' + T + '\n' +
        '  INTO TABLE ' + tgt + '\n' +
        '  WHERE carrid = ' + whereVar + '.';
    } else {
      // modern 완성: INTO 를 맨 뒤로
      lines =
        'SELECT ' + list + '\n' +
        '  FROM ' + T + '\n' +
        '  WHERE carrid = ' + whereVar + '\n' +
        '  INTO TABLE ' + escp('@' + G) + hl(' ◂ 마지막') + '.';
    }
    codeEl.className = stage >= 3 ? 'done' : '';
    codeEl.innerHTML = lines;
  }

  function curN() {
    for (var i = 0; i < CFG.carrs.length; i++) if (CFG.carrs[i].v === carr) return CFG.carrs[i].n;
    return 0;
  }
  function renderResult() {
    var n = curN(), found = n > 0;
    var subrc = found ? 0 : 4;
    resEl.innerHTML =
      '<div class="sms-card ' + (found ? 'ok' : 'empty') + '"><div class="k">결과 행 수</div><div class="v">' + n + '</div></div>' +
      '<div class="sms-card ' + (found ? 'ok' : 'empty') + '"><div class="k">sy-subrc</div><div class="v">' + subrc + '</div></div>' +
      '<div class="sms-card ' + (found ? 'ok' : 'empty') + '"><div class="k">sy-dbcnt</div><div class="v">' + n + '</div></div>';
  }

  function renderWarn() {
    var n = curN();
    var msg, cls;
    if (stage === 0) {
      cls = 'warn';
      msg = '<b>classic</b> — 공백으로 필드를 나누고 ABAP 변수도 그냥 이름으로 씁니다. 작은 코드엔 괜찮지만, 커지면 <code>' + CFG.varName + '</code>가 DB 컬럼인지 ABAP 변수인지 한눈에 안 보입니다.';
    } else if (stage === 1) {
      cls = 'warn';
      msg = '<b>콤마</b>만 적용 — 필드 목록은 modern인데, ABAP 변수 경계(<code>@</code>)는 아직 없습니다. 다음 단계에서 <code>@</code>를 붙이세요.';
    } else if (stage === 2) {
      cls = 'warn';
      msg = '<b>@</b> 적용 — 이제 <code>@' + CFG.varName + '</code>·<code>@' + CFG.target + '</code>로 "이건 ABAP 값"이 분명합니다. 마지막으로 <code>INTO</code>를 문장 <b>맨 뒤</b>로 옮기면 strict mode 완성입니다.';
    } else {
      cls = 'good';
      msg = '✅ <b>Modern ABAP SQL 완성</b> — 콤마 · <code>@</code> escape · 마지막 <code>INTO</code>. 표기만 바뀌었고 <b>결과는 그대로</b>입니다.';
    }
    if (n === 0) {
      msg += ' <br>🔎 <code>' + carr + '</code>는 데이터가 없어 <b>0행</b> — modern이어도 실패 확인은 <code>sy-subrc = 4</code>, <code>sy-dbcnt = 0</code>으로 합니다.';
    }
    warnEl.className = cls;
    warnEl.innerHTML = msg;
  }

  function render() {
    renderSeg(stageEl, [
      { v: '0', l: 'classic' }, { v: '1', l: '콤마' }, { v: '2', l: '@ escape' }, { v: '3', l: 'INTO 뒤로' }
    ], String(stage));
    renderSeg(carrEl, CFG.carrs.map(function (c) { return { v: c.v, l: c.v }; }), carr);
    renderCode(); renderResult(); renderWarn();
  }

  stageEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; stage = +b.getAttribute('data-v'); render(); });
  carrEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; carr = b.getAttribute('data-v'); render(); });

  render();
})();
