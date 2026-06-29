// ===== select-options-filter-sim 엔진 JS — SELECT-OPTIONS Range Table 필터 시뮬 (config 주도) =====
// 위젯의 window.SO_CFG로 주입:
//   SO_CFG = { table, cols[{key,label,num}], data[{}], selopts[{name,field,label,num}], presets[{label, ranges:{name:[{sign,opt,low,high}]}}] }
// SELECT-OPTIONS = Range Table(SIGN I/E · OPTION EQ/NE/GT/LT/GE/LE/BT/CP · LOW/HIGH). classic `field IN s_xxx`.
(function(){
  var cfg = window.SO_CFG || {};
  var COLS = cfg.cols || [];
  var DATA = cfg.data || [];
  var TBL  = cfg.table || 'ztab';
  var SOPTS = cfg.selopts || [];
  var PRESETS = cfg.presets || [];
  var OPTS = ['EQ','NE','GT','LT','GE','LE','BT','CP'];
  var $ = function(id){return document.getElementById(id);};

  // 상태: { s_conc:[{sign,opt,low,high}], s_stat:[...] }
  var st = {};
  SOPTS.forEach(function(s){ st[s.name] = []; });

  function num(v){ return Number(v); }
  function cmp(a,b,isNum){ if(isNum){ a=num(a); b=num(b); } else { a=String(a); b=String(b); } return a<b?-1:(a>b?1:0); }
  function cpMatch(val, pat){
    var rx = '^'+String(pat).replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\+/g,'.')+'$';
    return new RegExp(rx,'i').test(String(val));
  }
  function matchOpt(val, r, isNum){
    var low=r.low, high=r.high;
    switch(r.opt){
      case 'EQ': return cmp(val,low,isNum)===0;
      case 'NE': return cmp(val,low,isNum)!==0;
      case 'GT': return cmp(val,low,isNum)>0;
      case 'LT': return cmp(val,low,isNum)<0;
      case 'GE': return cmp(val,low,isNum)>=0;
      case 'LE': return cmp(val,low,isNum)<=0;
      case 'BT': return cmp(val,low,isNum)>=0 && cmp(val,high,isNum)<=0;
      case 'CP': return cpMatch(val, low);
    }
    return false;
  }
  // ABAP range 의미: include 있으면 ≥1 만족, 그다음 어떤 exclude도 불만족
  function inRange(val, rows, isNum){
    if(!rows.length) return true;                       // 빈 범위 = 전체 통과
    var inc = rows.filter(function(r){return r.sign==='I';});
    var exc = rows.filter(function(r){return r.sign==='E';});
    var passInc = inc.length===0 ? true : inc.some(function(r){return matchOpt(val,r,isNum);});
    var passExc = exc.every(function(r){return !matchOpt(val,r,isNum);});
    return passInc && passExc;
  }
  function rowPasses(row){
    return SOPTS.every(function(s){ return inRange(row[s.field], st[s.name], s.num); });
  }

  /* ── 선택화면(범위 빌더) 렌더 ── */
  function rangeRowHtml(s, r, i){
    var showHigh = (r.opt==='BT');
    var signOpts = ['I','E'].map(function(g){return '<option value="'+g+'"'+(r.sign===g?' selected':'')+'>'+(g==='I'?'I · 포함':'E · 제외')+'</option>';}).join('');
    var optOpts = OPTS.map(function(o){return '<option value="'+o+'"'+(r.opt===o?' selected':'')+'>'+o+'</option>';}).join('');
    return '<div class="so-row" data-so="'+s.name+'" data-i="'+i+'">'+
      '<select class="sign">'+signOpts+'</select>'+
      '<select class="opt">'+optOpts+'</select>'+
      '<input class="v low" placeholder="값" value="'+(r.low||'')+'">'+
      (showHigh?'<span class="tilde">~</span><input class="v high" placeholder="끝값" value="'+(r.high||'')+'">':'')+
      '<button class="rm" type="button" title="행 삭제">×</button>'+
    '</div>';
  }
  function renderBuilders(){
    SOPTS.forEach(function(s){
      var host = $('rows-'+s.name);
      var rows = st[s.name];
      host.innerHTML = rows.length ? rows.map(function(r,i){return rangeRowHtml(s,r,i);}).join('')
        : '<div class="so-empty">범위가 비어 있음 → 이 조건은 <b>전체 통과</b>(IN 조건 무시).</div>';
    });
  }

  /* ── 코드 생성 ── */
  function renderCode(){
    var where = SOPTS.map(function(s,i){ return (i===0?'  WHERE ':'    AND ')+s.field+' IN '+s.name; });
    var lines = [ 'SELECT * FROM '+TBL+' INTO TABLE lt_book' ].concat(where);
    lines[lines.length-1]+='.';
    var KW=new Set(['SELECT','FROM','INTO','TABLE','WHERE','AND','IN']);
    var html = lines.map(function(ln){
      return ln.replace(/[A-Za-z_][A-Za-z0-9_]*/g,function(w){ return KW.has(w.toUpperCase())?'<span class="tok-kw">'+w+'</span>':w; });
    }).join('\n');
    $('soCode').innerHTML = html;
  }

  /* ── 결과 ── */
  function renderResult(){
    var passed = DATA.filter(rowPasses);
    var thead='<thead><tr>'+COLS.map(function(c){return '<th>'+c.label+'</th>';}).join('')+'</tr></thead>';
    var body='<tbody>'+DATA.map(function(r){
      var ok=rowPasses(r);
      return '<tr class="'+(ok?'pass':'drop')+'">'+COLS.map(function(c){return '<td class="'+(c.num?'num':'')+'">'+r[c.key]+'</td>';}).join('')+'</tr>';
    }).join('')+'</tbody>';
    $('soGrid').innerHTML=thead+body;
    $('soCnt').textContent = passed.length+' / '+DATA.length+' 행 통과 (lt_book = '+passed.length+'행)';
    var sysEl=$('soSys');                                  // (옵션) 레슨 HTML이 #soSys를 두면 시스템 필드 표시
    if(sysEl){ var subrc = passed.length>0 ? 0 : 4;        // SELECT INTO TABLE: 1행↑ → 0, 0행 → 4
      sysEl.innerHTML='<code>sy-subrc</code> = <b>'+subrc+'</b> &nbsp;·&nbsp; <code>sy-dbcnt</code> = <b>'+passed.length+'</b>'; }
    postHeight();
  }
  function refresh(){ renderBuilders(); renderCode(); renderResult(); }

  /* ── 이벤트(위임) ── */
  document.addEventListener('click', function(e){
    var add=e.target.closest('[data-add]');
    if(add){ var nm=add.dataset.add; st[nm].push({sign:'I',opt:'EQ',low:'',high:''}); refresh(); return; }
    var rm=e.target.closest('.rm');
    if(rm){ var row=rm.closest('.so-row'); st[row.dataset.so].splice(+row.dataset.i,1); refresh(); return; }
    var chip=e.target.closest('.so-presets .chip');
    if(chip){
      var p=PRESETS[+chip.dataset.ex]||{ranges:{}};
      SOPTS.forEach(function(s){ st[s.name] = (p.ranges[s.name]||[]).map(function(r){return {sign:r.sign||'I',opt:r.opt||'EQ',low:r.low||'',high:r.high||''};}); });
      document.querySelectorAll('.so-presets .chip').forEach(function(x){x.classList.toggle('on',x===chip);});
      refresh(); return;
    }
  });
  document.addEventListener('change', function(e){
    var row=e.target.closest('.so-row'); if(!row) return;
    var r=st[row.dataset.so][+row.dataset.i]; if(!r) return;
    if(e.target.classList.contains('sign')) r.sign=e.target.value;
    else if(e.target.classList.contains('opt')) r.opt=e.target.value;
    if(e.target.classList.contains('opt')) renderBuilders();   // BT면 끝값 칸 노출
    renderCode(); renderResult();
  });
  document.addEventListener('input', function(e){
    var row=e.target.closest('.so-row'); if(!row) return;
    var r=st[row.dataset.so][+row.dataset.i]; if(!r) return;
    if(e.target.classList.contains('low')) r.low=e.target.value;
    else if(e.target.classList.contains('high')) r.high=e.target.value;
    renderResult();
  });
  var runBtn=$('soRun'); if(runBtn) runBtn.addEventListener('click', renderResult);

  /* iframe 자동 높이 */
  function postHeight(){
    try{ var el=document.querySelector('.wrap');
      var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6;
      parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){}
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  /* 초기: 첫 프리셋 */
  if(PRESETS.length){ var p=PRESETS[0]; SOPTS.forEach(function(s){ st[s.name]=(p.ranges[s.name]||[]).map(function(r){return {sign:r.sign||'I',opt:r.opt||'EQ',low:r.low||'',high:r.high||''};}); });
    var f=document.querySelector('.so-presets .chip[data-ex="0"]'); if(f) f.classList.add('on'); }
  refresh();
})();
