// ===== salv-grid-simulator 엔진 JS — cl_salv_table factory→display 시뮬 (config 주도) =====
// 컬럼·데이터·테이블명·합계컬럼·코드는 위젯의 window.SALV_CFG로 주입(레슨별 재사용).
//   SALV_CFG = { itab, sumKey, cols[{key,label,num}], data[{}], code[{t,g}] }   g ∈ 'factory'|'display'|''
(function(){
  var cfg = window.SALV_CFG || {};
  var COLS = cfg.cols || [];
  var FULL = cfg.data || [];
  var ITAB = cfg.itab || 'lt_tab';
  var SUMKEY = cfg.sumKey || null;
  var CODE = cfg.code || [];
  var $=function(id){return document.getElementById(id);};
  var rows=FULL.slice(), step=0, sumOn=false, sortCol=-1, sortAsc=true;

  /* ── 테이블명 반영(ALV 제목·데이터 토글) ── */
  var ITABU = ITAB.toUpperCase();
  (function(){
    var tt=document.querySelector('.alv__tt'); if(tt) tt.textContent='📊 ALV · '+ITABU;
    var tg=$('ltToggle'); if(tg) tg.textContent='▾ '+ITAB+' 데이터 보기';
  })();

  /* ── 코드 하이라이트 ── */
  var KW=new Set(('DATA REF TO TRY CATCH ENDTRY IMPORTING CHANGING SELECT FROM INTO TABLE').split(' '));
  var CLS=new Set(['cl_salv_table','cx_salv_msg']);
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function hl(line){
    if(/^\s*"/.test(line)) return '<span class="tok-com">'+esc(line)+'</span>';
    var out='', re=/('[^']*'?)|("[^\n]*$)|([A-Za-z_][A-Za-z0-9_]*)|([^A-Za-z0-9_']+)/g, m;
    while((m=re.exec(line))!==null){
      if(m[1]) out+='<span class="tok-str">'+esc(m[1])+'</span>';
      else if(m[2]) out+='<span class="tok-com">'+esc(m[2])+'</span>';
      else if(m[3]){ var w=m[3];
        if(CLS.has(w.toLowerCase())) out+='<span class="tok-cls">'+esc(w)+'</span>';
        else if(KW.has(w.toUpperCase())) out+='<span class="tok-kw">'+esc(w)+'</span>';
        else out+=esc(w);
      } else out+=esc(m[0]);
    }
    return out;
  }
  function renderCode(lit){
    $('code').innerHTML=CODE.map(function(l){
      var c='ln'+(lit&&l.g===lit?' lit':'');
      return '<span class="'+c+'" data-g="'+l.g+'">'+(l.t===''?' ':hl(l.t))+'</span>';
    }).join('');
    $('codeGut').textContent=CODE.map(function(_,i){return i+1;}).join('\n');
  }

  /* ── 그리드 렌더 ── */
  function renderGrid(){
    if(rows.length===0){
      $('grid').innerHTML='<tbody><tr><td class="empty">빈 테이블 — 표시할 행이 없습니다 (오류는 아님)</td></tr></tbody>';
      $('readout').innerHTML='행이 없습니다. (빈 테이블도 factory/display는 정상 동작)'; return;
    }
    var thead='<thead><tr>'+COLS.map(function(c,i){
      var ar = i===sortCol ? (sortAsc?'▲':'▼') : '↕';
      return '<th data-col="'+i+'">'+c.label+'<span class="ar">'+ar+'</span></th>';
    }).join('')+'</tr></thead>';
    var body='<tbody>'+rows.map(function(r){
      return '<tr>'+COLS.map(function(c){return '<td class="'+(c.num?'num':'')+'">'+r[c.key]+'</td>';}).join('')+'</tr>';
    }).join('')+'</tbody>';
    var foot='';
    if(sumOn && SUMKEY){
      var total=rows.reduce(function(s,r){return s+(Number(r[SUMKEY])||0);},0);
      foot='<tfoot><tr>'+COLS.map(function(c,i){
        if(i===0) return '<td class="lbl">합계 ('+rows.length+'행)</td>';
        if(c.key===SUMKEY) return '<td class="num">'+total.toLocaleString()+'</td>';
        return '<td></td>';
      }).join('')+'</tr></tfoot>';
    }
    $('grid').innerHTML=thead+body+foot;
  }

  /* ── 단계 ── */
  function setStat(cls,html){ $('stat').className='stat '+cls; $('stat').innerHTML=html; }
  function doFactory(){
    step=1; renderCode('factory');
    $('bFactory').classList.remove('ready'); $('bFactory').classList.add('done');
    $('bDisplay').disabled=false; $('bDisplay').classList.add('ready');
    setStat('ok','✓ <b>factory( )</b> 성공 — ALV 객체 <code>lo_alv</code>가 메모리에 생성됐습니다. <b>하지만 아직 화면엔 안 보입니다.</b> 이제 ② display( )!');
    $('alv').classList.add('hidden'); postHeight();
  }
  function doDisplay(){
    if(step<1){ setStat('bad','⛔ 먼저 ① factory( )로 객체를 만드세요.'); return; }
    step=2; renderCode('display');
    $('bDisplay').classList.remove('ready'); $('bDisplay').classList.add('done');
    renderGrid(); $('alv').classList.remove('hidden');
    setStat('ok','✓ <b>display( )</b> — ALV 그리드가 화면에 떴습니다. 헤더를 클릭해 <b>정렬</b>, <b>Σ 합계</b>로 합을 켜 보세요.');
    postHeight();
  }
  function reset(){
    step=0; sumOn=false; sortCol=-1; sortAsc=true; renderCode(null);
    $('bFactory').className='sbtn ready'; $('bDisplay').className='sbtn'; $('bDisplay').disabled=true;
    $('alv').classList.add('hidden');
    setStat('info','먼저 <b>① factory( )</b> 를 눌러 ALV 객체를 만드세요.');
    if(ltData && !ltData.hasAttribute('hidden')) renderLt();   // 예제 전환 시 열려있는 데이터 보기 갱신
    postHeight();
  }
  $('bFactory').addEventListener('click',doFactory);
  $('bDisplay').addEventListener('click',doDisplay);
  $('bReset').addEventListener('click',reset);

  /* ── 그리드 상호작용 ── */
  function readoutCols(){
    // sy-tabix + 첫 컬럼 + 둘째 컬럼 + 합계컬럼(중복 제외)
    var idxs=[0]; if(COLS.length>1) idxs.push(1);
    if(SUMKEY){ var si=COLS.map(function(c){return c.key;}).indexOf(SUMKEY); if(si>=0 && idxs.indexOf(si)<0) idxs.push(si); }
    return idxs;
  }
  $('grid').addEventListener('click',function(e){
    var th=e.target.closest('th');
    if(th){ var col=+th.dataset.col;
      if(col===sortCol) sortAsc=!sortAsc; else { sortCol=col; sortAsc=true; }
      var key=COLS[col].key, num=COLS[col].num;
      rows.sort(function(a,b){ var x=a[key],y=b[key]; if(num) return sortAsc?x-y:y-x; return sortAsc?String(x).localeCompare(y,'ko'):String(y).localeCompare(x,'ko'); });
      renderGrid(); return;
    }
    var tr=e.target.closest('tbody tr'); if(!tr||tr.querySelector('.empty')) return;
    var trs=[].slice.call($('grid').querySelectorAll('tbody tr'));
    trs.forEach(function(r){r.classList.remove('cur');}); tr.classList.add('cur');
    var idx=trs.indexOf(tr)+1, cells=[].map.call(tr.children,function(td){return td.textContent;});
    var parts=readoutCols().map(function(i){return COLS[i].label+'=<b>'+cells[i]+'</b>';});
    $('readout').innerHTML='현재 행 <b>sy-tabix = '+idx+'</b> · '+parts.join(' · ');
  });
  $('alv').querySelector('.alv__bar').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return; var act=b.dataset.bar;
    if(act==='sort'){ var th=$('grid').querySelector('th[data-col="0"]'); if(th) th.click(); }
    else if(act==='sum'){ sumOn=!sumOn; renderGrid(); }
    else { $('readout').innerHTML='ℹ️ <b>'+b.textContent.trim()+'</b>는 ALV 표준 기능 — 실제 SALV에선 공짜로 동작합니다(이 시뮬에선 생략).'; }
  });

  /* ── 예제(정상/빈) ── */
  $('presets').addEventListener('click',function(e){
    var c=e.target.closest('.chip'); if(!c) return;
    rows = (+c.dataset.ex===1) ? [] : FULL.slice();
    $('presets').querySelectorAll('.chip').forEach(function(x){x.classList.toggle('on',x===c);});
    reset();
  });

  /* ── 데이터 보기 토글 ── */
  var ltToggle=$('ltToggle'), ltData=$('ltData');
  function renderLt(){
    if(!rows.length){ ltData.innerHTML='<p class="lt-empty">'+ITAB+'이 비어 있습니다 (0행).</p>'; return; }
    var th='<tr>'+COLS.map(function(c){return '<th>'+c.label+'</th>';}).join('')+'</tr>';
    var bd=rows.map(function(r){return '<tr>'+COLS.map(function(c){return '<td class="'+(c.num?'num':'')+'">'+r[c.key]+'</td>';}).join('')+'</tr>';}).join('');
    ltData.innerHTML='<table class="dt">'+th+bd+'</table>';
  }
  ltToggle.addEventListener('click',function(){
    if(ltData.hasAttribute('hidden')){ renderLt(); ltData.removeAttribute('hidden'); ltToggle.textContent='▴ '+ITAB+' 데이터 숨기기'; }
    else { ltData.setAttribute('hidden',''); ltToggle.textContent='▾ '+ITAB+' 데이터 보기'; }
    postHeight();
  });

  /* ── iframe 자동 높이 ── */
  function postHeight(){
    try{ var el=document.querySelector('.wrap');
      var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6;
      parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){}
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  renderCode(null); postHeight();
})();
