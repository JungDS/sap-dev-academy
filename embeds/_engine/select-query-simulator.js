// ===== select-query-simulator 엔진 JS — classic Open SQL 조회 시뮬 (config 주도) =====
// 데이터·컬럼·테이블명·예제는 위젯의 window.SQL_CFG로 주입(레슨별 재사용).
//   SQL_CFG = { dbTable, itab, cols[], numeric{}, data[{}], presets[{label,selAll,cols{},whereOn,c1{f,op,v},c2On,conn}] }
// 코드는 classic만 생성(필드 공백 구분 · @ 없음 · 콤마 없음). modern(@·콤마)은 CH19.
(function(){
  var cfg = window.SQL_CFG || {};
  var COLS = cfg.cols || ['persid','name','age','city'];
  var NUMERIC = cfg.numeric || {persid:true, age:true};
  var DATA = cfg.data || [];
  var TBL = cfg.dbTable || 'ztable';
  var ITAB = cfg.itab || 'lt_tab';
  var PRESETS = cfg.presets || [];
  var OPS=['=','<>','>=','<=','>','<','LIKE'];
  var $=function(id){return document.getElementById(id);};

  /* 상태 */
  var st={ selAll:true, cols:{}, whereOn:false,
           c1:{f:COLS[0],op:'>=',v:''}, c2On:false, conn:'AND', c2:{f:COLS[COLS.length-1],op:'=',v:''} };
  COLS.forEach(function(c){ st.cols[c]=false; });

  /* ── 컬럼 체크박스 ── */
  COLS.forEach(function(c){
    var lab=document.createElement('label'); lab.className='colchk'; lab.dataset.col=c;
    lab.innerHTML='<input type="checkbox">'+c;
    lab.querySelector('input').addEventListener('change',function(e){
      st.cols[c]=e.target.checked; lab.classList.toggle('on',e.target.checked); refresh();
    });
    $('cols').appendChild(lab);
  });

  /* ── 조건 행 빌더 ── */
  function buildCond(host, cobj){
    var fsel=document.createElement('select');
    COLS.forEach(function(c){ var o=document.createElement('option'); o.value=c; o.textContent=c; fsel.appendChild(o); });
    fsel.value=cobj.f;
    var osel=document.createElement('select');
    OPS.forEach(function(o){ var op=document.createElement('option'); op.value=o; op.textContent=o; osel.appendChild(op); });
    osel.value=cobj.op;
    var val=document.createElement('input'); val.type='text'; val.className='val'; val.placeholder='값'; val.value=cobj.v;
    fsel.addEventListener('change',function(){ cobj.f=fsel.value; refresh(); });
    osel.addEventListener('change',function(){ cobj.op=osel.value; refresh(); });
    val.addEventListener('input',function(){ cobj.v=val.value; refresh(); });
    host.appendChild(fsel); host.appendChild(osel); host.appendChild(val);
  }
  buildCond($('cond1'), st.c1);
  buildCond($('cond2'), st.c2);

  /* ── SELECT 세그먼트 ── */
  $('segSel').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    st.selAll = b.dataset.sel==='all';
    $('segSel').querySelectorAll('button').forEach(function(x){ x.classList.toggle('on', x===b); });
    $('cols').classList.toggle('dim', st.selAll);
    refresh();
  });
  /* ── WHERE 토글 ── */
  $('whereOn').addEventListener('change',function(e){
    st.whereOn=e.target.checked;
    $('cond1').classList.toggle('dim', !st.whereOn);
    $('and2wrap').style.display = st.whereOn?'flex':'none';
    refresh();
  });
  $('cond2On').addEventListener('change',function(e){
    st.c2On=e.target.checked;
    $('conn').style.display = st.c2On?'inline-block':'none';
    $('cond2').style.display = st.c2On?'flex':'none';
    $('cond2').classList.toggle('dim', !st.c2On);
    refresh();
  });
  $('conn').addEventListener('change',function(e){ st.conn=e.target.value; refresh(); });

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

  function selectedCols(){
    if(st.selAll) return COLS.slice();
    var c=COLS.filter(function(x){ return st.cols[x]; });
    return c.length?c:COLS.slice();   // 아무것도 안 고르면 전체로 간주
  }
  function fieldList(){
    if(st.selAll) return '*';
    var c=COLS.filter(function(x){ return st.cols[x]; });
    return c.length? c.join(' ') : '*';   // classic: 공백 구분
  }
  function condSql(c){
    var v=c.v.trim(); if(v==='') v='?';
    var lit = NUMERIC[c.f] && c.op!=='LIKE' ? v : "'"+v+"'";
    return c.f+' '+c.op+' '+lit;
  }

  /* ── 코드 생성 (classic) ── */
  function genCode(){
    var into = st.selAll ? 'INTO TABLE '+ITAB : 'INTO CORRESPONDING FIELDS OF TABLE '+ITAB;
    var lines=[ 'DATA '+ITAB+' TYPE TABLE OF '+TBL+'.', '',
                'SELECT '+fieldList(),
                '  FROM '+TBL,
                '  '+into ];
    if(st.whereOn){
      var w='  WHERE '+condSql(st.c1);
      if(st.c2On) w+=' '+st.conn+' '+condSql(st.c2);
      lines.push(w);
    }
    lines[lines.length-1]+='.';
    return lines.join('\n');
  }

  /* ── 조건 평가 ── */
  function evalCond(row,c){
    var v=c.v.trim(); if(v==='') return true;   // 미입력 조건은 무시
    var cell=row[c.f];
    if(c.op==='LIKE'){
      var rx=new RegExp('^'+v.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/%/g,'.*').replace(/_/g,'.')+'$','i');
      return rx.test(String(cell));
    }
    var a=cell, b=v;
    if(NUMERIC[c.f]){ a=Number(cell); b=Number(v); if(isNaN(b)) return false; }
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
    if(!st.whereOn) return true;
    var r1=evalCond(row,st.c1);
    if(!st.c2On) return r1;
    var r2=evalCond(row,st.c2);
    return st.conn==='AND' ? (r1&&r2) : (r1||r2);
  }

  /* ── 렌더: 코드 + 원본 표(빌드 시 전체, 실행 시 강조) ── */
  function renderCode(){ var src=genCode().split('\n'); $('code').innerHTML = src.map(hl).join('\n'); $('codeGut').textContent = src.map(function(_,i){return i+1;}).join('\n'); }
  function thRow(cols){ return '<thead><tr>'+cols.map(function(c){return '<th>'+c.toUpperCase()+'</th>';}).join('')+'</tr></thead>'; }
  function tdRow(row,cols){ return '<tr>'+cols.map(function(c){ return '<td class="'+(NUMERIC[c]?'num':'')+'">'+row[c]+'</td>'; }).join('')+'</tr>'; }

  function renderSource(highlight){
    var html=thRow(COLS)+'<tbody>'+DATA.map(function(r){
      var m=highlight?matches(r):null;
      var cls=highlight?(m?'matched':'dimmed'):'';
      return '<tr class="'+cls+'">'+COLS.map(function(c){return '<td class="'+(NUMERIC[c]?'num':'')+'">'+r[c]+'</td>';}).join('')+'</tr>';
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

  /* ── 예제(프리셋) — config에서 칩 동적 생성 ── */
  function set(selAll,cols,whereOn,c1,c2On){
    st.selAll=selAll;
    COLS.forEach(function(c){ st.cols[c]=!!cols[c]; });
    st.whereOn=whereOn; if(c1){ st.c1.f=c1.f; st.c1.op=c1.op; st.c1.v=c1.v; } st.c2On=!!c2On;
    // reflect to UI
    $('segSel').querySelectorAll('button').forEach(function(b){ b.classList.toggle('on', (b.dataset.sel==='all')===selAll); });
    $('cols').classList.toggle('dim', selAll);
    $('cols').querySelectorAll('.colchk').forEach(function(l){ var c=l.dataset.col; l.querySelector('input').checked=st.cols[c]; l.classList.toggle('on',st.cols[c]); });
    $('whereOn').checked=whereOn; $('cond1').classList.toggle('dim',!whereOn);
    $('and2wrap').style.display=whereOn?'flex':'none';
    $('cond2On').checked=false; $('conn').style.display='none'; $('cond2').style.display='none'; $('cond2').classList.add('dim');
    // rebuild cond1 inputs to reflect values
    $('cond1').innerHTML=''; buildCond($('cond1'), st.c1);
  }
  function applyPreset(p){ set(p.selAll, p.cols||{}, !!p.whereOn, p.c1||null, !!p.c2On); }

  var pwrap=$('presets');
  PRESETS.forEach(function(p,i){
    var b=document.createElement('button'); b.className='chip'; b.type='button'; b.dataset.ex=i; b.textContent=p.label;
    pwrap.appendChild(b);
  });
  pwrap.addEventListener('click',function(e){
    var c=e.target.closest('.chip'); if(!c) return;
    var i=+c.dataset.ex; applyPreset(PRESETS[i]);
    pwrap.querySelectorAll('.chip').forEach(function(x){ x.classList.toggle('on', x===c); });
    refresh(); run();
  });

  $('run').addEventListener('click',function(){
    pwrap.querySelectorAll('.chip').forEach(function(x){ x.classList.remove('on'); });
    run();
  });
  document.addEventListener('keydown',function(e){ if(e.key==='F8'){ e.preventDefault(); run(); } });

  /* iframe 자동 높이 */
  function postHeight(){
    try{ var el=document.querySelector('.wrap');
      var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6;
      parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){}
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  /* 초기: 첫 예제 */
  if(PRESETS.length){ applyPreset(PRESETS[0]); var f=pwrap.querySelector('.chip[data-ex="0"]'); if(f) f.classList.add('on'); }
  refresh(); run();
})();
