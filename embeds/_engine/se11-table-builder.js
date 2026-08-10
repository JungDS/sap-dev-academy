/* se11-table-builder — SE11 Transparent Table 생성 시뮬 엔진.
   config = window.STB_CFG { table, fields:[{name, fixed?, key, type?(고정), de, builtin, note?}],
            tech?:{label?, wantNote?, fields:[{key,label,sub?,want?,options:[{v,t}]}]} }.
   필드 key 토글 + 타입(Data Element/Built-In) 토글 (+ tech 있으면 Technical Settings 선택)
   → Check(검사) / Activate(활성화).
   검증: 키 최소 1개 · 키 연속성(맨 앞에 연속, 사이에 non-key 금지) · Data Element 권장(경고)
        · Technical Settings 미지정이면 활성화 거부(bad) · want와 다르면 안내(warn).
   활성화 성공 시 오른쪽 '물리 DB 테이블' 패널이 회색→생성. 상태배지 신규/비활성/활성.
   showMsg(list, headOk): headOk면 목록이 비어도(경고 0건) 완료 문구를 남긴다 — 잘했을 때만
   완료 문구가 사라지던 역전 방지. list도 headOk도 없을 때만 초기 안내(idle).
   섹션: 상태/렌더(renderGrid·renderTech·renderDesign·renderDb) · 검증(validate) · 메시지(showMsg)
        · 액션(onCheck·onActivate·reset). tech 블록은 cfg.tech가 있을 때만 렌더(없으면 종전과 동일). */
(function () {
  var cfg;
  try { cfg = JSON.parse(document.getElementById('stb-cfg').textContent); }
  catch (e) { cfg = { table: 'ZTABLE', fields: [] }; }
  // 작업 상태: 고정 필드는 그대로, 나머지는 key/typeMode 토글 가능
  var F = cfg.fields.map(function (f) {
    return { name: f.name, fixed: !!f.fixed, key: !!f.key,
      type: f.type || null, de: f.de || null, builtin: f.builtin || null,
      note: f.note || '', mode: f.de ? 'de' : 'builtin' };
  });
  var active = false;
  // Technical Settings(선택) — cfg.tech가 있을 때만. T[key]='' = 미지정(활성화 거부 조건)
  var TECH = (cfg.tech && cfg.tech.fields) ? cfg.tech.fields : [];
  var T = {};
  TECH.forEach(function (f) { T[f.key] = f.init || ''; });

  var $ = function (id) { return document.getElementById(id); };
  var elGrid = $('stb-grid'), elBadge = $('stb-badge'), elDb = $('stb-db'), elMsg = $('stb-msg');

  function typeOf(f) {
    if (f.type) return f.type;                 // 고정 타입(MANDT=CLNT)
    return f.mode === 'de' ? f.de : f.builtin; // 토글
  }

  function renderGrid() {
    var rows = F.map(function (f, i) {
      var keyCell, typeCell;
      if (f.fixed) {
        keyCell = '<span class="keychip">Key</span>';
        typeCell = '<span class="fixed">' + typeOf(f) + '</span>' + (f.note ? ' <span class="tyval">' + f.note + '</span>' : '');
      } else {
        keyCell = '<label class="keybox"><input type="checkbox" data-key="' + i + '"' + (f.key ? ' checked' : '') + '/>Key</label>';
        if (f.de && f.builtin) {
          typeCell = '<span class="tytog">' +
            '<button data-mode="' + i + '" data-m="de"' + (f.mode === 'de' ? ' class="on"' : '') + '>Data Element</button>' +
            '<button data-mode="' + i + '" data-m="builtin"' + (f.mode === 'builtin' ? ' class="on"' : '') + '>Built-In</button>' +
            '</span><span class="tyval">' + typeOf(f) + '</span>';
        } else {
          typeCell = '<span class="fixed">' + typeOf(f) + '</span>';
        }
      }
      return '<tr><td class="fn">' + f.name + '</td><td>' + keyCell + '</td><td>' + typeCell + '</td></tr>';
    }).join('');
    elGrid.innerHTML = '<thead><tr><th>필드</th><th>키</th><th>타입</th></tr></thead><tbody>' + rows + '</tbody>';
    elGrid.querySelectorAll('input[data-key]').forEach(function (cb) {
      cb.addEventListener('change', function () { F[+cb.dataset.key].key = cb.checked; invalidate(); });
    });
    elGrid.querySelectorAll('button[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () { F[+b.dataset.mode].mode = b.dataset.m; invalidate(); renderGrid(); });
    });
  }

  // Technical Settings — 저장 방식(Data Class·Size Category) 선택. 초기값 = ( 미지정 )
  function renderTech() {
    var box = $('stb-tech'); if (!box) return;
    if (!TECH.length) { box.innerHTML = ''; return; }
    box.className = 'stb__tech';
    box.innerHTML = '<div class="stb__ph">⚙️ ' + (cfg.tech.label || 'Technical Settings') + '</div>' +
      '<div class="stb__techrow">' + TECH.map(function (f) {
        var opts = '<option value="">( 미지정 )</option>' + f.options.map(function (o) {
          return '<option value="' + o.v + '"' + (T[f.key] === o.v ? ' selected' : '') + '>' + o.t + '</option>';
        }).join('');
        return '<label class="tech"><span class="tech__l">' + f.label + '</span>' +
          '<select class="tech__sel' + (T[f.key] ? '' : ' unset') + '" data-tech="' + f.key + '">' + opts + '</select>' +
          (f.sub ? '<span class="tech__s">' + f.sub + '</span>' : '') + '</label>';
      }).join('') + '</div>';
    box.querySelectorAll('select[data-tech]').forEach(function (s) {
      s.addEventListener('change', function () {
        T[s.dataset.tech] = s.value; s.classList.toggle('unset', !s.value); invalidate();
      });
    });
  }
  // 설계도 pre에 붙는 Technical Settings 줄(미지정도 그대로 보여 준다)
  function techLines() {
    if (!TECH.length) return '';
    return '\n  ─ Technical Settings\n' + TECH.map(function (f) {
      return '  ' + (f.label + '                ').slice(0, 16) + (T[f.key] || '( 미지정 )');
    }).join('\n');
  }

  function setBadge(kind, text) {
    elBadge.className = 'stb__badge ' + kind;
    elBadge.innerHTML = '<span class="d"></span>' + text;
  }

  function renderDb() {
    var panel = $('stb-db-panel');
    if (!active) {
      panel.classList.add('off');
      elDb.innerHTML = '<div class="stb__db-empty">아직 활성화 전 — 설계도일 뿐, DB에 실제 테이블은 없습니다.</div>';
      return;
    }
    panel.classList.remove('off');
    var lines = F.map(function (f) {
      var pad = (f.name + '        ').slice(0, 8);
      var k = f.key ? 'PK ' : '   ';
      return '  ' + pad + k + typeOf(f);
    }).join('\n');
    elDb.innerHTML = '<pre class="stb__pre">✔ DB 테이블 생성됨\nTABLE ' + cfg.table + '\n' + lines + '</pre>';
  }

  function renderDesign() {
    var lines = F.map(function (f) {
      var pad = (f.name + '        ').slice(0, 8);
      var k = f.key ? '(Key)' : '     ';
      return '  ' + pad + k + ' ' + typeOf(f);
    }).join('\n');
    $('stb-design').innerHTML = '<pre class="stb__pre">TABLE ' + cfg.table + '\n' + lines + techLines() + '</pre>';
  }

  // 검증: [{level:'ok'|'warn'|'bad', text}]
  function validate() {
    var out = [];
    var keys = F.filter(function (f) { return f.key; });
    if (keys.length === 0) {
      out.push({ level: 'bad', text: '키 필드가 하나도 없습니다 — 행을 유일하게 식별할 기준이 필요합니다.' });
    }
    // 연속성: 첫 non-key 이후에 key가 또 나오면 gap
    var seenNonKey = false, gap = false;
    F.forEach(function (f) {
      if (!f.key) seenNonKey = true;
      else if (seenNonKey) gap = true;
    });
    if (gap) out.push({ level: 'bad', text: '키 필드는 맨 앞에 연속으로 모여야 합니다 — 키 사이에 일반 필드가 끼면 활성화가 막힙니다.' });
    // Technical Settings — 비워 두면 활성화 거부. 다 골랐는데 권장값과 다르면 안내(활성화는 됨)
    if (TECH.length) {
      var miss = TECH.filter(function (f) { return !T[f.key]; });
      if (miss.length) {
        out.push({ level: 'bad', text: 'Technical Settings 미지정(' + miss.map(function (f) { return f.label; }).join(' · ') +
          ') — 저장 방식을 정하지 않으면 활성화가 거부됩니다.' });
      } else if (TECH.some(function (f) { return f.want && T[f.key] !== f.want; }) && cfg.tech.wantNote) {
        out.push({ level: 'warn', text: cfg.tech.wantNote });
      }
    }
    // 첫 필드가 key가 아니면(=MANDT를 key에서 뺐다면) 경고
    if (!F[0].key) out.push({ level: 'warn', text: '첫 필드가 키가 아닙니다 — 업무 테이블은 보통 MANDT를 첫 키로 둡니다.' });
    // Data Element 권장
    var builtinBiz = F.filter(function (f) { return !f.fixed && f.de && f.mode === 'builtin'; });
    if (builtinBiz.length) {
      out.push({ level: 'warn', text: 'Built-In 타입(' + builtinBiz.map(function (f) { return f.name; }).join(', ') + ')은 라벨·F4·도움말이 없습니다 — 업무 테이블은 Data Element 권장.' });
    }
    return out;
  }

  // headOk=활성화 성공. 목록이 비어도(=경고 0건, 가장 잘한 구성) 완료 문구는 반드시 남긴다.
  function showMsg(list, headOk) {
    if (!list.length && !headOk) { elMsg.innerHTML = '<div class="ln idle">필드·키·타입을 정한 뒤 <b>검사</b> 또는 <b>활성화</b>를 눌러 보세요.</div>'; return; }
    var html = (headOk ? '<div class="ln ok"><span class="ico">✔</span><span>활성화 완료 — DB에 물리 테이블이 생성됐습니다.</span></div>' : '');
    html += list.map(function (m) {
      var ico = m.level === 'bad' ? '✕' : (m.level === 'warn' ? '⚠' : '✔');
      return '<div class="ln ' + m.level + '"><span class="ico">' + ico + '</span><span>' + m.text + '</span></div>';
    }).join('');
    elMsg.innerHTML = html;
  }

  function invalidate() {
    if (active) { active = false; renderDb(); }
    setBadge('b-new', '신규(미검사)');
    renderDesign();
    showMsg([]);
    post();
  }

  function onCheck() {
    var v = validate();
    renderDesign();
    if (v.some(function (m) { return m.level === 'bad'; })) { setBadge('b-inactive', '검사 실패'); }
    else { setBadge('b-inactive', '검사 통과 — 활성화 가능'); if (!v.length) v = [{ level: 'ok', text: '문제 없음 — 이제 활성화할 수 있습니다.' }]; }
    showMsg(v); post();
  }

  function onActivate() {
    var v = validate();
    if (v.some(function (m) { return m.level === 'bad'; })) {
      active = false; renderDb(); setBadge('b-inactive', '활성화 막힘');
      showMsg(v); post(); return;
    }
    active = true; renderDb(); renderDesign();
    setBadge('b-active', '활성 (Active)');
    showMsg(v.filter(function (m) { return m.level === 'warn'; }), true);
    post();
  }

  function reset() {
    F = cfg.fields.map(function (f) {
      return { name: f.name, fixed: !!f.fixed, key: !!f.key, type: f.type || null,
        de: f.de || null, builtin: f.builtin || null, note: f.note || '', mode: f.de ? 'de' : 'builtin' };
    });
    TECH.forEach(function (f) { T[f.key] = f.init || ''; });
    active = false; renderGrid(); renderTech(); renderDesign(); renderDb(); setBadge('b-new', '신규(미검사)'); showMsg([]); post();
  }

  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }

  $('stb-check').addEventListener('click', onCheck);
  $('stb-activate').addEventListener('click', onActivate);
  var rb = $('stb-reset'); if (rb) rb.addEventListener('click', reset);
  renderGrid(); renderTech(); renderDesign(); renderDb(); setBadge('b-new', '신규(미검사)'); showMsg([]);
  window.addEventListener('load', post); window.addEventListener('resize', post); post();
})();
