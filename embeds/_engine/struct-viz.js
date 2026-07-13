// ===== struct-viz 엔진 JS — 구조체(Work Area) 컴포넌트 트리 / 스트립 =====
// 루트 변수 → 컴포넌트(하이픈 접근) · TYPE(+LENGTH/DECIMALS) · 값(있으면)을 트리로 렌더.
// 설정 = window.SV_CFG { root, kind, comps[{name,type,value?}], reuse?, assign?, note?, layout? }
//   assign:{comp,value,stmt} → "선언 직후 ↔ 값 전달 후" 인터랙션(버튼으로 그 컴포넌트에 값 기록).
//   layout:'strip' → CS 표준 표기(구조체=라벨 붙은 칸들의 가로 한 줄): 루트=TYPES 헤더 스트립(값 없음·메모리 0)
//     + reuse.instances = 같은 칼럼에 정렬된 변수 행들(한 줄 여러 칸 — Work Area=한 행, CH06 예고 모양).
//     타입은 값을 가지지 않으므로 미지정 칸의 초기값은 "변수로 선언되는 순간 갖게 될 값"으로만 표기.
(function(){
  var cfg = window.SV_CFG; if(!cfg) return;
  var root = document.querySelector('[data-structviz]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  // 컴포넌트는 이름만 표기 — 하이픈(-)은 접근 연산자지 이름의 일부가 아니다(트리 가지선이 루트→컴포넌트를 나타냄).
  // 선언만 해도 컴포넌트는 타입별 "초기값"을 가진다(미지정 아님). 명시 값이 없으면 타입에서 초기값을 유도.
  function initialFor(type){
    var t = String(type || '').toLowerCase().trim();
    var dec = (String(type).match(/decimals\s+(\d+)/i) || [])[1];
    if(dec == null){ var pm = String(type).match(/^p[^,]*,\s*(\d+)/i); if(pm) dec = pm[1]; }  // 'p 8,2' 축약 표기
    if(/string/.test(t)) return "''";
    if(/^c\b|^n\b|char|clnt/.test(t)) return "''";
    if(/^d\b|datum/.test(t)) return "'00000000'";
    if(/^t\b|uzeit/.test(t)) return "'000000'";
    if(dec) return '0.' + new Array(+dec + 1).join('0');
    return '0';
  }
  // 숫자 타입(i·int8·p·f·decfloat)만 true — "숫자 = 우측 정렬" 관례를 모든 값 표시에 일관 적용(피드백 2026-07-03).
  // N·D·T는 ABAP 분류상 문자형이라 제외(좌측 유지).
  function isNumType(t){ return /^(i|int8|p|f|decfloat16|decfloat34)($|[^a-z0-9_])/i.test(String(t||'').trim()); }
  function valChip(cls, v, type, cname){
    var attr = cname ? ' data-c="'+esc(cname)+'"' : '';
    var num = isNumType(type) ? ' num' : '';
    if(v != null && v !== '') return '<span class="'+cls+num+'"'+attr+'>'+esc(v)+'</span>';
    return '<span class="'+cls+num+' init"'+attr+' title="선언 시 자동 초기값">'+esc(initialFor(type))+'</span>';
  }

  var assigned = false;
  var pickedField = null;   // accessPick(포인팅 데모)에서 선택된 필드
  // assign 대상이고 "실행됨"이면 기록된 값, 아니면 원래 값(보통 미설정→초기값)
  function effVal(c){
    if(cfg.assign && cfg.assign.comp === c.name && assigned) return cfg.assign.value;
    return c.value;
  }

  // ── strip 레이아웃: 타입 헤더 스트립 + 정렬된 변수 행들(CS 표준 '칸 한 줄' 표기) ──
  // reuse 없으면 "브래킷 스트립"(단일 변수): 위=필드별 타입 브래킷 · 가운데=칸 한 줄 · 아래=전체를 묶는 루트 브래킷
  //   → "변수 하나 = 연속된 칸들의 한 덩어리"(교재 통용 표기, 사용자 참고자료 2026-07-03).
  // 칼럼 폭 가중치(comps[].w) — 필드 길이를 폭으로 인코딩(SAP BC400 표준 이미지 표기)
  function colTemplate(labPx){
    return 'grid-template-columns:'+labPx+'px '+(cfg.comps||[]).map(function(c){ return (c.w||1)+'fr'; }).join(' ')+';';
  }
  function renderStrip(){
    var n = (cfg.comps||[]).length;
    if(!(cfg.reuse && cfg.reuse.instances)){ renderBracketStrip(n); return; }
    var gridStyle = colTemplate(96);
    var h = '<div class="svs">';
    // 타입 카드 — 값 칸 "없음" = 모양만(설계도)
    h += '<div class="svs__typecard">'
       + '<div class="svs__grid" style="'+gridStyle+'">'
       + '<div class="svs__lab type"><b>'+esc(cfg.root)+'</b><small>TYPES</small></div>';
    (cfg.comps||[]).forEach(function(c){
      // 칸 표기 = 단일 스트립(fhead)과 동일: 이름 좌(주인공)·타입 우(부제) 한 줄 — 표기 통일(피드백 2026-07-03)
      h += '<div class="svs__col"><span class="svs__fname">'+esc(c.name)+'</span>'
         + '<small class="svs__ftype">TYPE '+esc(c.type)+'</small></div>';
    });
    h += '</div>'
       + '<div class="svs__grid" style="'+gridStyle+'">'
       + '<div class="svs__lab type dim">값 칸?</div>';
    (cfg.comps||[]).forEach(function(){ h += '<div class="svs__cell none" title="타입은 값을 가지지 않는다 — 모양(설계도)일 뿐">없음 — 모양만</div>'; });
    h += '</div>'
       + '<div class="svs__typebadge">📐 TYPES — 값 없음 · 메모리 0바이트(설계도)</div>'
       + '</div>';
    // 변수 행들 — 같은 칼럼에 정렬(한 줄 여러 칸). 칸 = 단일 스트립과 동일한 fcell(fhead: 이름 좌·타입 우 + 값).
    if(cfg.reuse && cfg.reuse.instances){
      h += '<div class="svs__stamp">▼ <code>TYPE '+esc(cfg.root)+'</code> 으로 찍어낸 <b>변수</b>들 — <b>모양(타입)까지 물려받고, 값을 담는다</b></div>';
      cfg.reuse.instances.forEach(function(inst){
        h += '<div class="svs__grid row" style="'+gridStyle+'">'
           + '<div class="svs__lab var"><b>'+esc(inst.root)+'</b><small>변수 = 모양+값</small></div>';
        (cfg.comps||[]).forEach(function(c){
          var v = inst.vals && inst.vals[c.name];
          var has = v != null && v !== '';
          h += '<div class="svs__fcell'+(has?'':' init')+'"'
             + (has?'':' title="변수로 선언되는 순간 갖게 되는 타입 초기값"')+'>'
             + '<span class="svs__fhead"><span class="svs__fname">'+esc(c.name)+'</span>'
             + '<small class="svs__ftype">TYPE '+esc(c.type)+'</small></span>'
             + '<span class="svs__fval'+(isNumType(c.type)?' num':'')+'">'+(has?esc(v):esc(initialFor(c.type)))+'</span></div>';
        });
        h += '</div>';
      });
      h += '<div class="svs__legend"><b>TYPES = 모양만 · DATA = 모양+값.</b> 변수 칸마다 이름 오른쪽에 타입 라벨이 붙어 있다. '
         + '모양을 그대로 물려받았다는 뜻이다. 점선 칸은 아직 값을 안 넣은 곳으로, <b>변수이기에</b> 타입 초기값을 갖는다. '
         + '(타입 <code>'+esc(cfg.root)+'</code> 자체는 값을 가지지 않는다.)</div>';
    }
    if(cfg.note) h += '<div class="sv__note">'+cfg.note+'</div>';  // note는 신뢰된 HTML(레슨 작성자)
    h += '</div>';
    root.innerHTML = h;
  }

  // 단일 변수 스트립 — 읽기 동선(좌→우) 준수: 좌측 첫 칸 = 변수 이름, 이어서 필드 칸들.
  // 전체를 하나의 "변수 박스"로 감싸 '한 덩어리'를 외곽이 말한다(브래킷 이중선 제거 — 직관성 피드백 2026-07-03).
  // 필드 칸 = 필드명(주인공·크게) + 타입(부제·작게) + 값/초기값. altTree=true면 기존 트리 표현을 접기로 병행.
  function renderBracketStrip(n){
    var gridStyle = colTemplate(110);
    var h = '<div class="svs'+(cfg.accessPick ? ' haspick' : '')
          + (cfg.accessPick && pickedField ? ' picking' : '')
          + (pickedField === '__ALL__' ? ' all' : '')+'">';
    h += '<div class="svs__one">'
       + '<div class="svs__grid single" style="'+gridStyle+'">'
       + '<div class="svs__lab var big"><b>'+esc(cfg.root)+'</b><small>'+esc(cfg.kind || '변수')+'</small></div>';
    (cfg.comps||[]).forEach(function(c){
      var has = c.value != null && c.value !== '';
      var picked = cfg.accessPick && (pickedField === c.name || pickedField === '__ALL__');
      h += '<div class="svs__fcell'+(has?'':' init')+(picked?' picked':'')+'" data-fcell="'+esc(c.name)+'"'
         + (has?'':' title="선언만 해도 갖는 타입 초기값"')+'>'
         + '<span class="svs__fhead"><span class="svs__fname">'+esc(c.name)+'</span>'
         + '<small class="svs__ftype">TYPE '+esc(c.type)+'</small></span>'
         + '<span class="svs__fval'+(isNumType(c.type)?' num':'')+'">'+(has?esc(c.value):esc(initialFor(c.type)))+'</span></div>';
    });
    h += '</div></div>';
    // 캡션은 박스 "밖" 바로 아래 — 라벨 구분 수직선이 박스 위아래 테두리에 끊김 없이 닿게(피드백 2026-07-03).
    // 섹션 주제에 맞게 인스턴스가 지정(문자열=대체·false=숨김·미지정=기본) — 신뢰된 HTML(레슨 작성자)
    var cap = (cfg.caption === false) ? ''
            : (cfg.caption != null ? cfg.caption
               : '↑ Structure 변수는 <b>1개 이상의 Component</b>를 하나의 변수로 묶어둔 변수다');
    if(cap) h += '<div class="svs__onecap">'+cap+'</div>';
    // 접근 예시(정적 칩 — 레거시 옵션)
    if(cfg.accessDemo){
      h += '<div class="svs__accessrow">';
      cfg.accessDemo.forEach(function(a){ h += '<code class="svs__access">'+esc(a)+'</code>'; });
      h += '</div>';
    }
    // 포인팅 데모(accessPick) — 표현식 칩을 누르면 그 칸을 화살표로 가리킨다(코드 반복 대신 "짚기" 체험).
    // 칩은 해부 색분리: 변수(gs_line)·하이픈(-)·필드(dan) — 문법 조각이 그림의 어디인지 연결.
    if(cfg.accessPick){
      h += '<div class="svs__pickrow">';
      // 통짜 칩 — 구조체 변수 단위: 모든 칸이 한 번에 선택("한 몸으로 움직인다")
      h += '<button type="button" class="svs__pickbtn whole'+(pickedField==='__ALL__'?' on':'')+'" data-pick="__ALL__">'
         + '<span class="pv">'+esc(cfg.root)+'</span><span class="pw">전체</span></button>';
      (cfg.comps||[]).forEach(function(c){
        h += '<button type="button" class="svs__pickbtn'+(pickedField===c.name?' on':'')+'" data-pick="'+esc(c.name)+'">'
           + '<span class="pv">'+esc(cfg.root)+'</span><span class="ph">-</span><span class="pf">'+esc(c.name)+'</span></button>';
      });
      h += '</div>';
      h += '<div class="svs__nudgerow"><span class="svs__nudge">👆 눌러서 어느 칸인지 확인</span></div>';
      h += '<svg class="svs__psvg" aria-hidden="true"></svg>';
      if(pickedField === '__ALL__'){
        h += '<div class="svs__pickout"><code>'+esc(cfg.root)+'</code> → 하이픈 없이 변수 이름만 쓰면 <b>Structure 전체</b>. '
           + '필드 '+(cfg.comps||[]).length+'개가 <b>한 몸으로</b> 움직인다(한꺼번에 복사·초기화하는 법은 이 챕터 뒤에서).</div>';
      } else if(pickedField){
        var pc = (cfg.comps||[]).filter(function(c){ return c.name===pickedField; })[0];
        var pv = (pc.value != null && pc.value !== '') ? pc.value : initialFor(pc.type);
        h += '<div class="svs__pickout"><code>'+esc(cfg.root)+'-'+esc(pickedField)+'</code> → '
           + '<b>'+esc(pickedField)+'</b> 칸을 가리킨다 · 지금 그 칸의 값: <b>'+esc(pv)+'</b></div>';
      }
    }
    // 같은 구조를 트리로도 — 학습자마다 맞는 그림이 다르다(병행 표기)
    if(cfg.altTree){
      h += '<details class="svs__alt"><summary>🌳 같은 Structure를 트리로도 보기</summary>'
         + '<div class="sv" style="margin-top:8px">'
         + '<div class="sv__root"><span class="sv__rootname">'+esc(cfg.root)+'</span>'
         + (cfg.kind ? '<span class="sv__kind">'+esc(cfg.kind)+'</span>' : '')+'</div>'
         + '<div class="sv__tree">';
      (cfg.comps||[]).forEach(function(c){
        h += '<div class="sv__comp"><span class="sv__name">'+esc(c.name)+'</span>'
           + '<span class="sv__type">TYPE '+esc(c.type)+'</span><span class="sv__lead"></span>'
           + valChip('sv__val', c.value, c.type, c.name)+'</div>';
      });
      h += '</div></div></details>';
    }
    if(cfg.note) h += '<div class="sv__note">'+cfg.note+'</div>';  // note는 신뢰된 HTML(레슨 작성자)
    h += '</div>';
    root.innerHTML = h;
    drawPickCurves();
  }

  // 칩→칸 곡선 커넥터 — 화살촉 없이 부드러운 베지어 + 끝점 도트(미감 피드백 2026-07-03).
  // 통짜(__ALL__)는 곡선 3가닥이 모든 칸으로 — "한 번에 전부"를 선으로도 표현.
  function drawPickCurves(){
    var svg = root.querySelector('.svs__psvg'); if(!svg) return;
    var box = root.querySelector('.svs'); if(!box) return;
    var br = box.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 '+br.width+' '+br.height);
    if(!pickedField){ svg.innerHTML = ''; return; }
    var chip = root.querySelector('.svs__pickbtn.on'); if(!chip){ svg.innerHTML=''; return; }
    var cr = chip.getBoundingClientRect();
    var x1 = cr.left - br.left + cr.width/2, y1 = cr.top - br.top - 2;
    // 끝점: 전체 선택이면 gs_line 박스 "자체"(변수명 라벨 아래 테두리) 한 곳 — 칸이 아니라 박스를 가리킨다.
    var ends = [];
    if(pickedField === '__ALL__'){
      var lab = root.querySelector('.svs__lab.big'), one = root.querySelector('.svs__one');
      if(lab && one){
        var lr = lab.getBoundingClientRect(), or = one.getBoundingClientRect();
        ends.push({ x: lr.left - br.left + lr.width/2, y: or.bottom - br.top + 2 });
      }
    } else {
      var cell = root.querySelector('.svs__fcell[data-fcell="'+pickedField+'"]');
      if(cell){
        var fr = cell.getBoundingClientRect();
        ends.push({ x: fr.left - br.left + fr.width/2, y: fr.bottom - br.top + 2 });
      }
    }
    var inner = '';
    ends.forEach(function(e2){
      var k = Math.max(22, Math.min(60, (y1 - e2.y) * 0.45));
      inner += '<path class="svs__pline" d="M'+x1+','+y1+' C '+x1+','+(y1-k)+' '+e2.x+','+(e2.y+k)+' '+e2.x+','+e2.y+'"/>'
             + '<circle class="svs__pdot" cx="'+e2.x+'" cy="'+e2.y+'" r="3.5"/>';
    });
    svg.innerHTML = inner;
  }
  window.addEventListener('resize', drawPickCurves);

  function render(){
    if(cfg.layout === 'strip'){ renderStrip(); return; }
    var stateKind = cfg.assign ? (assigned ? '값 전달 후' : '선언 직후') : cfg.kind;
    var h = '<div class="sv">';
    h += '<div class="sv__root"><span class="sv__rootname">'+esc(cfg.root)+'</span>'
       + (stateKind ? '<span class="sv__kind">'+esc(stateKind)+'</span>' : '') + '</div>';
    h += '<div class="sv__tree">';
    (cfg.comps || []).forEach(function(c){
      h += '<div class="sv__comp">'
         + '<span class="sv__name">'+esc(c.name)+'</span>'
         + '<span class="sv__type">TYPE '+esc(c.type)+'</span>'
         + '<span class="sv__lead"></span>'
         + valChip('sv__val', effVal(c), c.type, c.name)
         + '</div>';
    });
    h += '</div>';   // /sv__tree

    // 재사용 — 같은 타입(모양)으로 변수 인스턴스 여러 개. 컴포넌트 모양은 cfg.comps 공유, 값만 각자.
    if(cfg.reuse && cfg.reuse.instances){
      h += '<div class="sv-reuse">';
      if(cfg.reuse.label) h += '<div class="sv-reuse__label">'+esc(cfg.reuse.label)+'</div>';
      h += '<div class="sv-insts">';
      cfg.reuse.instances.forEach(function(inst){
        h += '<div class="sv-inst"><div class="sv-inst__hd"><span class="sv-inst__var">'+esc(inst.root)+'</span>'
           + '<span class="sv-inst__type">TYPE '+esc(cfg.root)+'</span></div>';
        (cfg.comps || []).forEach(function(c){
          var v = inst.vals && inst.vals[c.name];
          h += '<div class="sv-inst__row"><span class="sv-inst__k">'+esc(c.name)+'</span>'
             + valChip('sv-inst__v', v, c.type) + '</div>';
        });
        h += '</div>';
      });
      h += '</div></div>';
    }

    // 값 전달 인터랙션 — 선언 직후(초기값) ↔ 값 전달 후
    if(cfg.assign){
      h += '<div class="sv-assign">'
         + '<code class="sv-assign__stmt">'+esc(cfg.assign.stmt)+'</code>'
         + '<button type="button" class="sv-assign__btn" data-assign>'
         + (assigned ? '↺ 선언 직후로' : '▶ 값 전달 실행') + '</button></div>';
    }

    if(cfg.note) h += '<div class="sv__note">'+cfg.note+'</div>';  // note는 신뢰된 HTML(레슨 작성자)
    h += '</div>';
    root.innerHTML = h;
  }

  root.addEventListener('click', function(e){
    var pk = e.target.closest('[data-pick]');
    if(pk){
      var f = pk.getAttribute('data-pick');
      pickedField = (pickedField === f) ? null : f;   // 같은 칩 재클릭 = 해제
      render();
      return;
    }
    if(!e.target.closest('[data-assign]')) return;
    assigned = !assigned;
    render();
    if(assigned){   // 방금 기록된 컴포넌트 값에 플래시
      var leaf = root.querySelector('.sv__val[data-c="'+cfg.assign.comp+'"]');
      if(leaf) leaf.classList.add('flash');
    }
  });
  render();
})();
