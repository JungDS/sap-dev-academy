(function(){
  /* ===== ABAP 문법 하이라이터 (tok-* / code-copy-block 색) ===== */
  var KW = new Set(("REPORT PARAMETERS DATA TYPE TYPES VALUE CONSTANTS INITIALIZATION LOAD-OF-PROGRAM " +
    "START-OF-SELECTION END-OF-SELECTION AT SELECTION-SCREEN OUTPUT WRITE IF ELSEIF ELSE ENDIF " +
    "LOOP ENDLOOP MODIFY SCREEN MESSAGE CLEAR").split(/\s+/));
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function hl(line){
    if(/^\s*\*/.test(line)) return '<span class="tok-com">'+esc(line)+'</span>';
    var out='', re=/('[^']*'?)|(`[^`]*`?)|(".*$)|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_\-]*)|([^A-Za-z0-9_'`"\-]+)/g, m;
    while((m=re.exec(line))!==null){
      if(m[1]||m[2]) out+='<span class="tok-str">'+esc(m[1]||m[2])+'</span>';
      else if(m[3]) out+='<span class="tok-com">'+esc(m[3])+'</span>';
      else if(m[4]) out+='<span class="tok-num">'+esc(m[4])+'</span>';
      else if(m[5]) out+= KW.has(m[5].toUpperCase()) ? '<span class="tok-kw">'+esc(m[5])+'</span>' : esc(m[5]);
      else out+=esc(m[0]);
    }
    return out;
  }

  /* ===== 노드 ↔ 코드 연결(hover) ===== */
  var NODE2EV={LOAD:'load',INIT:'init',PBO:'pbo',SC:'screen',ASS:'ass',SOS:'sos',EOS:'eos'};
  var EVCOLOR={load:'#ede9fe',init:'#fef3c7',pbo:'#dbeafe',screen:'#dbeafe',ass:'#ffe4e6',sos:'#d1fae5',eos:'#ffedd5'};
  function tagEv(lines, implicit){            // 각 코드 줄에 이벤트 키(ev) 부여
    var cur=null;
    lines.forEach(function(ln){
      var s=ln.t.trim(), ev;
      if(/^REPORT\b/i.test(s)) ev='decl';
      else if(/^PARAMETERS\b/i.test(s)) ev='screen';
      else if(/^LOAD-OF-PROGRAM\b/i.test(s)){ cur='load'; ev='load'; }
      else if(/^INITIALIZATION\b/i.test(s)){ cur='init'; ev='init'; }
      else if(/^AT SELECTION-SCREEN OUTPUT\b/i.test(s)){ cur='pbo'; ev='pbo'; }
      else if(/^AT SELECTION-SCREEN\b/i.test(s)){ cur='ass'; ev='ass'; }
      else if(/^START-OF-SELECTION\b/i.test(s)){ cur='sos'; ev='sos'; }
      else if(/^END-OF-SELECTION\b/i.test(s)){ cur='eos'; ev='eos'; }
      else if(s==='') ev=null;
      else ev = cur || implicit || null;     // 연속 줄은 현재 블록(또는 암묵적 SOS) 상속
      ln.ev = ev || '';
    });
    return lines;
  }
  function parseNodeId(g){ var m=(g.id||'').match(/-([A-Za-z]+)-\d+$/); return m?m[1]:''; }
  function linkHL(panel, evNodes, ev, on){
    if(!ev) return;
    panel.querySelectorAll('[data-ev="'+ev+'"]').forEach(function(el){ el.style.background = on?EVCOLOR[ev]:''; });
    var node=evNodes[ev]; if(node) node.classList.toggle('lk', on);
  }
  function wirePanel(idx){                    // 렌더 후 노드/코드에 hover 연결
    var panel=panelsEl.querySelectorAll('.panel')[idx]; if(!panel || panel._wired) return; panel._wired=true;
    var fp=panel.querySelector('.flowpane'), evNodes={};
    fp.querySelectorAll('g.node').forEach(function(g){
      var ev=NODE2EV[parseNodeId(g)]; if(!ev) return; evNodes[ev]=g; g.style.cursor='pointer';
      g.addEventListener('mouseenter',function(){ linkHL(panel,evNodes,ev,true); });
      g.addEventListener('mouseleave',function(){ linkHL(panel,evNodes,ev,false); });
    });
    panel.querySelectorAll('.gn[data-ev],.ln[data-ev]').forEach(function(el){
      var ev=el.getAttribute('data-ev'); if(!ev) return; el.style.cursor='pointer';
      el.addEventListener('mouseenter',function(){ linkHL(panel,evNodes,ev,true); });
      el.addEventListener('mouseleave',function(){ linkHL(panel,evNodes,ev,false); });
    });
  }

  /* ===== 노드 라벨 헬퍼 ===== */
  function N(role, badge, title, desc){ return '"<div class=\'nw\'><span class=\'nb r-'+role+'\'>'+badge+'</span><b>'+title+'</b><span class=\'nd\'>'+desc+'</span></div>"'; }
  var START = 'S(["<span class=\'tnode\'>▶ Program Starts</span>"]):::term';
  var END   = 'E(["<span class=\'tnode\'>■ Program Ends</span>"]):::term';
  var CLASSDEF = [
    'classDef term fill:#eef2ff,stroke:#94a3b8,stroke-width:2px,color:#1c2233;',
    'classDef load fill:#ffffff,stroke:#7c3aed,stroke-width:2px;',
    'classDef prep fill:#ffffff,stroke:#f59e0b,stroke-width:2px;',
    'classDef screen fill:#ffffff,stroke:#3b5bdb,stroke-width:2.5px;',
    'classDef check fill:#ffffff,stroke:#e11d48,stroke-width:2px;',
    'classDef main fill:#ffffff,stroke:#10b981,stroke-width:2px;',
    'classDef out fill:#ffffff,stroke:#fb923c,stroke-width:2px;'
  ].join('\n');

  /* 노드 정의(재사용) */
  var nLOAD = 'LOAD['+N('load','로드','LOAD-OF-PROGRAM','메모리 적재 1회')+']:::load';
  var nINIT = 'INIT['+N('prep','준비','INITIALIZATION','화면 기본값 세팅')+']:::prep';
  var nPBO  = 'PBO['+N('screen','화면','AT SELECTION-SCREEN OUTPUT','(PBO) 화면 그리기 직전')+']:::screen';
  var nSC   = 'SC['+N('screen','화면','Selection Screen','⏳ 사용자 입력 대기')+']:::screen';
  var nASS  = 'ASS['+N('check','검증','AT SELECTION-SCREEN','(PAI) 입력값 유효성 검사')+']:::check';
  var nSOS  = 'SOS['+N('main','메인','START-OF-SELECTION','DB 조회·메인 로직')+']:::main';
  var nSOS1 = 'SOS['+N('main','메인','START-OF-SELECTION','(암묵적) WRITE 등 본문')+']:::main';
  var nEOS  = 'EOS['+N('out','출력','END-OF-SELECTION','결과 출력·마감')+']:::out';

  /* 검증 게이트(엄격): 사용자 입력 → 검증, 에러/ F8 외 입력 → 복귀, 에러없음+F8 → 진행 */
  function gate(backTo){
    return [
      '  SC -->|"사용자 입력 발생"| ASS',
      '  ASS -.->|"에러 발생 시 (복귀)"| '+backTo,
      '  ASS -.->|"에러 없음·F8 외 입력"| '+backTo,
      '  ASS -->|"에러 없음 + F8 실행"| SOS'
    ].join('\n');
  }

  /* ===== 5단계 데이터 ===== */
  var L = function(t,add){ return {t:t, add:!!add}; };
  var STAGES = [
    { label:'이벤트 구문 생략 (암묵적 실행)', implicit:'sos',
      graph:['flowchart TD','  '+START,'  '+nSOS1,'  '+END,'  S --> SOS --> E'].join('\n'),
      code:[ L('REPORT zdemo_events.'), L(''),
        L('" 이벤트 키워드가 없으면 모든 문장은',true),
        L('" 자동으로 START-OF-SELECTION 에 묶인다.',true),
        L('DATA lv_msg TYPE string.',true),
        L("lv_msg = 'Hello ABAP'.",true),
        L('WRITE: / lv_msg.',true) ],
      note:'이벤트 블록을 <b>꼭 써야 하는 게 아니다.</b> 한 줄짜리 프로그램은 이렇게 키워드 없이 끝난다.' },

    { label:'화면 초기화 추가 (INITIALIZATION)',
      graph:['flowchart TD','  '+START,'  '+nINIT,'  '+nSC,'  '+nSOS,'  '+END,
        '  S --> INIT --> SC -->|"F8 실행"| SOS --> E'].join('\n'),
      code:[ L('REPORT zdemo_events.'), L('PARAMETERS pa_date TYPE d.',true), L(''),
        L('INITIALIZATION.            " 화면 뜨기 전 1회',true),
        L('  pa_date = sy-datum.       " 기본값',true), L(''),
        L('START-OF-SELECTION.        " 이제 명시적으로',true),
        L('  WRITE: / pa_date.') ],
      note:'화면 기본값이 필요해지면 <b>INITIALIZATION</b> 을 추가한다. 아직 검증이 없어 F8을 누르면 바로 메인 로직로 간다.' },

    { label:'자동 로드 & 마감 추가 (메모리/출력)',
      graph:['flowchart TD','  '+START,'  '+nLOAD,'  '+nINIT,'  '+nSC,'  '+nSOS,'  '+nEOS,'  '+END,
        '  S --> LOAD --> INIT --> SC -->|"F8 실행"| SOS --> EOS --> E'].join('\n'),
      code:[ L('REPORT zdemo_events.'), L('PARAMETERS pa_date TYPE d.'), L(''),
        L('LOAD-OF-PROGRAM.           " 적재 직후 1회',true),
        L('  " (전역 상수 초기화 등)',true), L(''),
        L('INITIALIZATION.'),
        L('  pa_date = sy-datum.'), L(''),
        L('START-OF-SELECTION.'),
        L("  WRITE: / '조회/가공 중...'."), L(''),
        L('END-OF-SELECTION.          " 메인 로직 후 마감',true),
        L("  WRITE: / '완료'.",true) ],
      note:'메모리 준비(<b>LOAD-OF-PROGRAM</b>)와 마감/출력(<b>END-OF-SELECTION</b>)이 흐름의 양 끝에 붙는다. (아직 검증 없음)' },

    { label:'선택 화면 & 입력 검증 추가',
      graph:['flowchart TD','  '+START,'  '+nLOAD,'  '+nINIT,'  '+nSC,'  '+nASS,'  '+nSOS,'  '+nEOS,'  '+END,
        '  S --> LOAD --> INIT --> SC',
        gate('SC'),
        '  SOS --> EOS --> E'].join('\n'),
      code:[ L('REPORT zdemo_events.'), L('PARAMETERS pa_date TYPE d.'), L(''),
        L('LOAD-OF-PROGRAM.'),
        L('INITIALIZATION.'),
        L('  pa_date = sy-datum.'), L(''),
        L('AT SELECTION-SCREEN.       " 입력 검증 (PAI)',true),
        L('  IF pa_date > sy-datum.',true),
        L("    MESSAGE '미래 날짜는 안 됩니다' TYPE 'E'.",true),
        L('  ENDIF.',true), L(''),
        L('START-OF-SELECTION.'),
        L("  WRITE: / '조회/가공 중...'."), L(''),
        L('END-OF-SELECTION.'),
        L("  WRITE: / '완료'.") ],
      note:'<b>AT SELECTION-SCREEN</b> 추가. 이제 화면에서 <b>F8(실행)</b> 하고 <b>에러가 없을 때만</b> 메인 로직로 넘어간다. 에러가 나거나 F8이 아닌 입력(Enter·F4 등)이면 <b>화면으로 되돌아간다.</b>' },

    { label:'전체 생명주기 완성 (최종 구조)',
      graph:['flowchart TD','  '+START,'  '+nLOAD,'  '+nINIT,'  '+nPBO,'  '+nSC,'  '+nASS,'  '+nSOS,'  '+nEOS,'  '+END,
        '  S --> LOAD --> INIT --> PBO --> SC',
        '  SC -->|"사용자 입력 (Enter·F8 등)"| ASS',
        '  ASS -.->|"에러 시 (PBO 없이 재표시)"| SC',
        '  ASS -.->|"에러 없음·F8 외(Enter 등) → PBO 재실행"| PBO',
        '  ASS -->|"에러 없음 + F8 실행"| SOS',
        '  SOS --> EOS --> E'].join('\n'),
      code:[ L('REPORT zdemo_events.'), L('PARAMETERS: pa_date TYPE d, pa_hide TYPE c.',true), L(''),
        L('LOAD-OF-PROGRAM.'),
        L('INITIALIZATION.'),
        L('  pa_date = sy-datum.'), L(''),
        L('AT SELECTION-SCREEN OUTPUT. " 화면 그리기 직전(PBO)',true),
        L('  DATA gs_screen TYPE screen.',true),
        L('  LOOP AT SCREEN INTO gs_screen.',true),
        L("    IF gs_screen-name = 'PA_HIDE'.",true),
        L("      gs_screen-active = '0'. MODIFY SCREEN FROM gs_screen.",true),
        L('    ENDIF.',true),
        L('  ENDLOOP.',true), L(''),
        L('AT SELECTION-SCREEN.'),
        L('  IF pa_date > sy-datum.'),
        L("    MESSAGE '미래 날짜는 안 됩니다' TYPE 'E'."),
        L('  ENDIF.'), L(''),
        L('START-OF-SELECTION.'),
        L("  WRITE: / '조회/가공 중...'."), L(''),
        L('END-OF-SELECTION.'),
        L("  WRITE: / '완료'.") ],
      note:'검증(AT SELECTION-SCREEN) 후 세 갈래로 갈린다. ① <b>에러</b> → PBO를 건너뛰고 화면만 재표시(Selection Screen 입력 대기). ② <b>에러 없음 + F8 외(Enter·기타 명령)</b> → 정상 라운드트립이라 <b>AT SELECTION-SCREEN OUTPUT(PBO)이 다시 실행</b>된 뒤 화면. ③ <b>에러 없음 + F8(실행)</b> → START-OF-SELECTION. — 즉 PBO 재실행 여부가 ①②를 가른다. <b>AT SELECTION-SCREEN ON</b> <i>필드</i>를 쓰면 에러 시 그 필드만 입력 대기, 나머지는 읽기 전용.' }
  ];

  /* ===== 빌드 ===== */
  var tabsEl=document.getElementById('tabs'), panelsEl=document.getElementById('panels');
  STAGES.forEach(function(st,i){
    var tab=document.createElement('button');
    tab.className='tab'+(i===0?' on':''); tab.dataset.idx=i;
    tab.innerHTML='<span class="tab__n">'+(i+1)+'</span>'+st.label;
    tabsEl.appendChild(tab);

    tagEv(st.code, st.implicit);
    var gut='', src='';
    st.code.forEach(function(ln,k){
      gut+='<span class="gn'+(ln.add?' add':'')+'" data-ev="'+ln.ev+'">'+(k+1)+'</span>';
      src+='<span class="ln'+(ln.add?' add':'')+'" data-ev="'+ln.ev+'">'+(ln.t===''?' ':hl(ln.t))+'</span>';
    });
    var panel=document.createElement('div');
    panel.className='panel'+(i===0?' on':''); panel.dataset.idx=i;
    panel.innerHTML=
      '<div class="split">'+
        '<div class="pane"><div class="pane__hd"><span class="dot"></span>실행 흐름도</div>'+
          '<div class="flowpane" data-graph="'+i+'"><span class="loading">흐름도 그리는 중…</span></div></div>'+
        '<div class="pane"><div class="ed">'+
          '<div class="ed__hd"><span class="ed__dots"><i class="r"></i><i class="y"></i><i class="g"></i></span><span class="ed__lang">ABAP</span>'+
            '<span class="ed__title">ZDEMO_EVENTS</span><button class="copy-btn" type="button">⧉ 복사</button></div>'+
          '<div class="ed__body"><div class="gut">'+gut+'</div><div class="src">'+src+'</div></div>'+
        '</div></div>'+
      '</div>';
    panelsEl.appendChild(panel);
  });

  document.getElementById('legend').innerHTML=
    '<span><span class="sw" style="background:#ede9fe;border-color:#7c3aed"></span>로드</span>'+
    '<span><span class="sw" style="background:#fef3c7;border-color:#f59e0b"></span>준비</span>'+
    '<span><span class="sw" style="background:#dbeafe;border-color:#3b5bdb"></span>화면</span>'+
    '<span><span class="sw" style="background:#ffe4e6;border-color:#e11d48"></span>검증</span>'+
    '<span><span class="sw" style="background:#d1fae5;border-color:#10b981"></span>메인 로직</span>'+
    '<span><span class="sw" style="background:#ffedd5;border-color:#fb923c"></span>출력·마감</span>'+
    '<span style="color:#0ca678">초록 줄 = 이 단계에서 추가된 코드</span>';
  function setNote(i){ document.getElementById('note').innerHTML=STAGES[i].note; }
  setNote(0);

  /* 복사 */
  panelsEl.addEventListener('click',function(e){
    var btn=e.target.closest('.copy-btn'); if(!btn) return;
    var text=btn.closest('.ed').querySelector('.src').innerText;
    var done=function(){ var o=btn.dataset.o||btn.textContent; btn.dataset.o=o; btn.textContent='✓ 복사됨'; btn.classList.add('is-copied');
      setTimeout(function(){ btn.textContent=o; btn.classList.remove('is-copied'); },1600); };
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(done); else done();
  });

  /* ===== 부모에 높이 전송(iframe 자동 높이) ===== */
  function postHeight(){
    // 콘텐츠 래퍼(.wrap) 높이로 측정 — iframe 높이에 종속되지 않아 짧은 탭에서도 정확히 줄어듦
    try{ var el=document.querySelector('.wrap');
      var h=Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6;
      parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){}
  }

  /* ===== Mermaid 지연 렌더 ===== */
  var rendered={};
  function renderFlow(i, cb){
    if(!window.mermaid || rendered[i]){ if(cb)cb(); return; }
    var pane=panelsEl.querySelector('.flowpane[data-graph="'+i+'"]'); if(!pane) return;
    rendered[i]=true;
    window.mermaid.render('mmd'+i, STAGES[i].graph+'\n'+CLASSDEF).then(function(r){
      pane.innerHTML=r.svg;
      pane.querySelectorAll('.edgeLabel').forEach(function(el){ if(!el.textContent.trim()) el.style.display='none'; });
      if(cb)cb();
    }).catch(function(){ pane.innerHTML='<span class="loading">흐름도를 표시할 수 없습니다.</span>'; rendered[i]=false; if(cb)cb(); });
  }
  if(window.mermaid){
    window.mermaid.initialize({ startOnLoad:false, securityLevel:'loose', theme:'base',
      themeVariables:{fontFamily:'inherit'}, flowchart:{curve:'basis', htmlLabels:true, nodeSpacing:40, rankSpacing:38, padding:8} });
  }
  renderFlow(0, function(){ wirePanel(0); postHeight(); });

  tabsEl.addEventListener('click',function(e){
    var b=e.target.closest('.tab'); if(!b) return;
    var i=+b.dataset.idx;
    tabsEl.querySelectorAll('.tab').forEach(function(x){ x.classList.toggle('on', x===b); });
    panelsEl.querySelectorAll('.panel').forEach(function(p){ p.classList.toggle('on', +p.dataset.idx===i); });
    setNote(i);
    renderFlow(i, function(){ wirePanel(i); postHeight(); });
    postHeight();
  });
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
})();
