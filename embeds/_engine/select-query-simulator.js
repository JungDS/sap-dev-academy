// ===== select-query-simulator 엔진 JS — classic Open SQL 조회 시뮬 (config 주도) =====
// 데이터·컬럼·테이블명·예제는 위젯의 window.SQL_CFG로 주입(레슨별 재사용).
//   SQL_CFG = { datasets:[ DS, DS, … ] }   ← 여러 테이블을 칩으로 갈아 끼움
//   SQL_CFG = DS                            ← 단일 테이블(구버전 config 그대로 동작)
//   DS = { key, label, dbTable, itab, cols[], numeric{}, data[{}],
//          presets[{label,selAll,cols{},whereOn,c1{f,op,v},c2On,conn}] }
// 코드는 classic만 생성(필드 공백 구분 · @ 없음 · 콤마 없음). modern(@·콤마)은 CH19.
//
// ★ 생성 규약 — "화면의 코드 = 실제로 도는 문장"을 깨지 않는다:
//   1) INTO 짝은 **만들어진 필드 목록**을 따른다. 목록이 `*`면 INTO TABLE,
//      고른 컬럼이면 INTO CORRESPONDING FIELDS OF TABLE.
//      (컬럼 선택 모드에서 하나도 안 고르면 `*`로 간주하므로 짝도 INTO TABLE이 된다.)
//   2) **자격 미달 조건은 문장에 넣지 않고 판정에서도 뺀다** — 값이 비었거나, 숫자 컬럼에
//      숫자가 아닌 값이 들어온 경우. 코드엔 `?`를 보여 주고 판정은 통과시키던 모순을 없앤다.
//      대신 빠졌다는 사실을 주석 한 줄로 알린다(잘못된 ABAP을 화면에 띄우지 않는다).
//   3) **LIKE는 문자 컬럼 전용**(Open SQL) → 숫자 컬럼을 고르면 연산자 목록에서 빠진다.
//
// 섹션: 데이터셋 적용 · 빌더(컬럼·조건·예제) · 코드 생성 · 조건 평가 · 렌더 · 이벤트
(function(){
  var cfg = window.SQL_CFG || {};
  var DSETS = (cfg.datasets && cfg.datasets.length) ? cfg.datasets : [cfg];
  var $=function(id){return document.getElementById(id);};

  var DS, COLS, NUMERIC, DATA, TBL, ITAB, PRESETS, st, dsIdx=0;

  var ALLOPS=['=','<>','>=','<=','>','<','LIKE'];
  function opsFor(f){ return NUMERIC[f] ? ALLOPS.filter(function(o){return o!=='LIKE';}) : ALLOPS.slice(); }

  /* ── 데이터셋 적용 — 상태·빌더·표를 통째로 다시 세운다 ── */
  function useDataset(i){
    dsIdx=i; DS=DSETS[i]||{};
    COLS   = DS.cols || ['persid','name','age','city'];
    NUMERIC= DS.numeric || {};
    DATA   = DS.data || [];
    TBL    = DS.dbTable || 'ztable';
    ITAB   = DS.itab || 'lt_tab';
    PRESETS= DS.presets || [];
    st={ selAll:true, cols:{}, whereOn:false,
         c1:{f:COLS[0],op:'=',v:''}, c2On:false, conn:'AND', c2:{f:COLS[COLS.length-1],op:'=',v:''} };
    COLS.forEach(function(c){ st.cols[c]=false; });

    if($('srcName')) $('srcName').textContent=TBL.toUpperCase();
    if($('resName')) $('resName').textContent=ITAB.toUpperCase();

    buildCols(); buildConds(); buildPresets();
    $('segSel').querySelectorAll('button').forEach(function(b){ b.classList.toggle('on', b.dataset.sel==='all'); });
    $('cols').classList.add('dim');
    $('whereOn').checked=false; $('cond1').classList.add('dim');
    $('and2wrap').style.display='none';
    $('cond2On').checked=false; $('conn').style.display='none'; $('cond2').style.display='none';

    if(PRESETS.length){ applyPreset(PRESETS[0]); markPreset(0); }
    refresh(); run();
  }

  /* ── 컬럼 체크박스 ── */
  function buildCols(){
    var host=$('cols'); host.innerHTML='';
    COLS.forEach(function(c){
      var lab=document.createElement('label'); lab.className='colchk'; lab.dataset.col=c;
      lab.innerHTML='<input type="checkbox">'+c;
      lab.querySelector('input').addEventListener('change',function(e){
        st.cols[c]=e.target.checked; lab.classList.toggle('on',e.target.checked); clearPreset(); refresh();
      });
      host.appendChild(lab);
    });
  }

  /* ── 조건 행 빌더 (연산자 목록은 고른 컬럼 종류에 따라 달라진다) ── */
  function buildCond(host, cobj){
    host.innerHTML='';
    var fsel=document.createElement('select');
    COLS.forEach(function(c){ var o=document.createElement('option'); o.value=c; o.textContent=c; fsel.appendChild(o); });
    fsel.value=cobj.f;
    var osel=document.createElement('select');
    var val=document.createElement('input'); val.type='text'; val.className='val'; val.placeholder='값'; val.value=cobj.v;
    function fillOps(){
      var ops=opsFor(cobj.f);
      if(ops.indexOf(cobj.op)<0) cobj.op='=';        // 숫자 컬럼으로 바꾸면 LIKE는 = 로 되돌림
      osel.innerHTML='';
      ops.forEach(function(o){ var op=document.createElement('option'); op.value=o; op.textContent=o; osel.appendChild(op); });
      osel.value=cobj.op;
    }
    fillOps();
    // 컬럼을 바꾸면 값은 비운다 — 앞 컬럼용 값이 남아 엉뚱한 리터럴이 만들어지는 것을 막는다.
    fsel.addEventListener('change',function(){ cobj.f=fsel.value; cobj.v=''; val.value=''; fillOps(); clearPreset(); refresh(); });
    osel.addEventListener('change',function(){ cobj.op=osel.value; clearPreset(); refresh(); });
    val.addEventListener('input',function(){ cobj.v=val.value; clearPreset(); refresh(); });
    host.appendChild(fsel); host.appendChild(osel); host.appendChild(val);
  }
  function buildConds(){ buildCond($('cond1'), st.c1); buildCond($('cond2'), st.c2); }

  /* ── 코드 하이라이트 ── */
  var KW=new Set(('DATA TYPE TABLE OF SELECT FROM INTO CORRESPONDING FIELDS WHERE AND OR LIKE').split(' '));
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function hl(line){
    if(/^\s*"/.test(line)||/^\s*\*/.test(line)) return '<span class="tok-com">'+esc(line)+'</span>';
    var out='', re=/('[^']*'?)|("[^\n]*$)|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_]*)|([^A-Za-z0-9_']+)/g, m;
    while((m=re.exec(line))!==null){
      if(m[1]) out+='<span class="tok-str">'+esc(m[1])+'</span>';
      else if(m[2]) out+='<span class="tok-com">'+esc(m[2])+'</span>';
      else if(m[3]) out+='<span class="tok-num">'+esc(m[3])+'</span>';
      else if(m[4]) out+= KW.has(m[4].toUpperCase()) ? '<span class="tok-kw">'+esc(m[4])+'</span>' : esc(m[4]);
      else out+=esc(m[0]);
    }
    return out;
  }

  /* ── 필드 목록 / 조건 목록 (코드 생성과 평가가 같은 함수를 쓴다) ── */
  function chosenCols(){ return COLS.filter(function(x){ return st.cols[x]; }); }
  function isStar(){ return st.selAll || chosenCols().length===0; }   // 하나도 안 고르면 전체로 간주
  function selectedCols(){ return isStar() ? COLS.slice() : chosenCols(); }
  function fieldList(){ return isStar() ? '*' : chosenCols().join(' '); }   // classic: 공백 구분

  // 조건이 문장에 실릴 자격 — 값이 있고, 숫자 컬럼이면 숫자여야 한다.
  // 자격 미달은 코드에도 넣지 않고 판정에서도 뺀다(잘못된 ABAP을 화면에 띄우지 않기 위해).
  function condState(c){
    var v=c.v.trim();
    if(v==='') return 'empty';
    if(NUMERIC[c.f] && isNaN(Number(v))) return 'nan';
    return 'ok';
  }
  function turnedOn(){                                  // 켜 놓은 조건(자격 무관)
    if(!st.whereOn) return [];
    return st.c2On ? [st.c1, st.c2] : [st.c1];
  }
  function condList(){ return turnedOn().filter(function(c){ return condState(c)==='ok'; }); }
  function countState(s){ return turnedOn().filter(function(c){ return condState(c)===s; }).length; }
  function condSql(c){
    var v=c.v.trim();
    return c.f+' '+c.op+' '+(NUMERIC[c.f] ? v : "'"+v+"'");
  }

  /* ── 코드 생성 (classic) ── */
  function genCode(){
    var into = isStar() ? 'INTO TABLE '+ITAB : 'INTO CORRESPONDING FIELDS OF TABLE '+ITAB;
    var lines=[ 'DATA '+ITAB+' TYPE TABLE OF '+TBL+'.', '' ];
    var miss=countState('empty'), nan=countState('nan');
    if(miss) lines.push('" 값이 비어 있는 조건 '+miss+'개는 문장에서 빠졌습니다 (값을 넣어 보세요)');
    if(nan)  lines.push('" 숫자 컬럼에 숫자가 아닌 값이 들어와 조건 '+nan+'개가 빠졌습니다');
    lines.push('SELECT '+fieldList());
    lines.push('  FROM '+TBL);
    lines.push('  '+into);
    var cs=condList();
    if(cs.length){
      var w='  WHERE '+condSql(cs[0]);
      if(cs.length>1) w+=' '+st.conn+' '+condSql(cs[1]);
      lines.push(w);
    }
    lines[lines.length-1]+='.';
    return lines.join('\n');
  }

  /* ── 조건 평가 (코드에 실린 조건과 정확히 같은 집합) ── */
  function evalCond(row,c){
    var v=c.v.trim(), cell=row[c.f];
    if(c.op==='LIKE'){
      var rx=new RegExp('^'+v.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/%/g,'.*').replace(/_/g,'.')+'$','i');
      return rx.test(String(cell));
    }
    var a=cell, b=v;
    if(NUMERIC[c.f]){ a=Number(cell); b=Number(v); }   // condList가 이미 숫자만 통과시킴
    else { a=String(cell); b=String(v); }
    switch(c.op){
      case '=':  return a===b;
      case '<>': return a!==b;
      case '>=': return a>=b;
      case '<=': return a<=b;
      case '>':  return a>b;
      case '<':  return a<b;
    }
    return true;
  }
  function matches(row){
    var cs=condList();
    if(!cs.length) return true;
    if(cs.length===1) return evalCond(row,cs[0]);
    var r1=evalCond(row,cs[0]), r2=evalCond(row,cs[1]);
    return st.conn==='AND' ? (r1&&r2) : (r1||r2);
  }

  /* ── 렌더: 코드 + 원본 표(빌드 시 전체, 실행 시 강조) ── */
  function renderCode(){ var src=genCode().split('\n'); $('code').innerHTML = src.map(hl).join('\n'); $('codeGut').textContent = src.map(function(_,i){return i+1;}).join('\n'); }
  function thRow(cols){ return '<thead><tr>'+cols.map(function(c){return '<th>'+c.toUpperCase()+'</th>';}).join('')+'</tr></thead>'; }
  function tdRow(row,cols){ return '<tr>'+cols.map(function(c){ return '<td class="'+(NUMERIC[c]?'num':'')+'">'+esc(row[c])+'</td>'; }).join('')+'</tr>'; }

  function renderSource(highlight){
    var html=thRow(COLS)+'<tbody>'+DATA.map(function(r){
      var m=highlight?matches(r):null;
      var cls=highlight?(m?'matched':'dimmed'):'';
      return '<tr class="'+cls+'">'+COLS.map(function(c){return '<td class="'+(NUMERIC[c]?'num':'')+'">'+esc(r[c])+'</td>';}).join('')+'</tr>';
    }).join('')+'</tbody>';
    $('srcTbl').innerHTML=html; $('srcCnt').textContent=DATA.length+'행';
  }

  function refresh(){   // 빌더 변경 시: 코드 갱신 + 결과 초기화
    renderCode(); renderSource(false);
    $('resTbl').innerHTML='<tbody><tr><td class="empty">▶ 실행을 누르면 결과가 채워집니다.</td></tr></tbody>';
    $('resCnt').textContent=''; $('subrc').innerHTML='';
    postHeight();
  }

  function run(){
    var cols=selectedCols();
    var matched=DATA.filter(matches);
    renderSource(true);
    if(matched.length===0){
      $('resTbl').innerHTML='<tbody><tr><td class="empty">조회 결과 없음 (0행)</td></tr></tbody>';
      $('resCnt').textContent='0행';
      $('subrc').innerHTML='<span class="no">sy-subrc = 4</span> · sy-dbcnt = 0';
    } else {
      $('resTbl').innerHTML=thRow(cols)+'<tbody>'+matched.map(function(r){return tdRow(r,cols);}).join('')+'</tbody>';
      $('resCnt').textContent=matched.length+'행';
      $('subrc').innerHTML='<span class="ok">sy-subrc = 0</span> · sy-dbcnt = '+matched.length;
    }
    postHeight();
  }

  /* ── 예제(프리셋) ── */
  function set(selAll,cols,whereOn,c1,c2On){
    st.selAll=selAll;
    COLS.forEach(function(c){ st.cols[c]=!!cols[c]; });
    st.whereOn=whereOn; if(c1){ st.c1.f=c1.f; st.c1.op=c1.op; st.c1.v=c1.v; } st.c2On=!!c2On;
    $('segSel').querySelectorAll('button').forEach(function(b){ b.classList.toggle('on', (b.dataset.sel==='all')===selAll); });
    $('cols').classList.toggle('dim', selAll);
    $('cols').querySelectorAll('.colchk').forEach(function(l){ var c=l.dataset.col; l.querySelector('input').checked=st.cols[c]; l.classList.toggle('on',st.cols[c]); });
    $('whereOn').checked=whereOn; $('cond1').classList.toggle('dim',!whereOn);
    $('and2wrap').style.display=whereOn?'flex':'none';
    $('cond2On').checked=false; $('conn').style.display='none'; $('cond2').style.display='none'; $('cond2').classList.add('dim');
    buildCond($('cond1'), st.c1);                       // 값·연산자 목록을 UI에 반영
  }
  function applyPreset(p){ set(p.selAll, p.cols||{}, !!p.whereOn, p.c1||null, !!p.c2On); }
  function markPreset(i){ $('presets').querySelectorAll('.chip').forEach(function(x){ x.classList.toggle('on', +x.dataset.ex===i); }); }
  function clearPreset(){ $('presets').querySelectorAll('.chip').forEach(function(x){ x.classList.remove('on'); }); }

  function buildPresets(){
    var pwrap=$('presets');
    pwrap.innerHTML='<span class="presets__lbl">예제:</span>';
    PRESETS.forEach(function(p,i){
      var b=document.createElement('button'); b.className='chip'; b.type='button'; b.dataset.ex=i; b.textContent=p.label;
      pwrap.appendChild(b);
    });
  }

  /* ── 데이터셋 칩 ── */
  function buildDsets(){
    var host=$('dsets'); if(!host || DSETS.length<2) return;
    host.innerHTML='<span class="presets__lbl">테이블:</span>';
    DSETS.forEach(function(d,i){
      var b=document.createElement('button'); b.className='chip'+(i===0?' on':''); b.type='button'; b.dataset.ds=i;
      b.textContent=d.label || (d.dbTable||'').toUpperCase();
      host.appendChild(b);
    });
    host.addEventListener('click',function(e){
      var c=e.target.closest('.chip'); if(!c) return;
      host.querySelectorAll('.chip').forEach(function(x){ x.classList.toggle('on', x===c); });
      useDataset(+c.dataset.ds);
    });
  }

  /* ── 이벤트(고정 UI) ── */
  $('segSel').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    st.selAll = b.dataset.sel==='all';
    $('segSel').querySelectorAll('button').forEach(function(x){ x.classList.toggle('on', x===b); });
    $('cols').classList.toggle('dim', st.selAll);
    clearPreset(); refresh();
  });
  $('whereOn').addEventListener('change',function(e){
    st.whereOn=e.target.checked;
    $('cond1').classList.toggle('dim', !st.whereOn);
    $('and2wrap').style.display = st.whereOn?'flex':'none';
    clearPreset(); refresh();
  });
  $('cond2On').addEventListener('change',function(e){
    st.c2On=e.target.checked;
    $('conn').style.display = st.c2On?'inline-block':'none';
    $('cond2').style.display = st.c2On?'flex':'none';
    $('cond2').classList.toggle('dim', !st.c2On);
    clearPreset(); refresh();
  });
  $('conn').addEventListener('change',function(e){ st.conn=e.target.value; clearPreset(); refresh(); });
  $('presets').addEventListener('click',function(e){
    var c=e.target.closest('.chip'); if(!c) return;
    var i=+c.dataset.ex; applyPreset(PRESETS[i]); markPreset(i);
    refresh(); run();
  });
  $('run').addEventListener('click',function(){ run(); });
  document.addEventListener('keydown',function(e){ if(e.key==='F8'){ e.preventDefault(); run(); } });

  /* iframe 자동 높이 */
  function postHeight(){
    try{ var el=document.querySelector('.wrap');
      var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6;
      parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){}
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  buildDsets();
  useDataset(0);
})();
