// ===== gui-alv-grid-simulator 엔진 JS — CL_GUI_ALV_GRID 단계 빌드업 + 그리드 (config 주도) =====
// window.ALVG_CFG = { itab, cols[{key,label,num}], data[{}], sumKey, dataSets?{key:[{}]},
//   steps[{n,nm,sub,code:[lines], showGrid?, data?, state?}] }  — '다음 단계'로 코드 누적·강조.
// showGrid:true인 단계 완료 후부터 그리드 표시(이후 단계에서도 유지 — refresh 분기 시연용).
// step.data='key'면 그 단계 완료 시 그리드 행을 dataSets[key]로 교체(화면 갱신 시점 체험).
// step.state(신뢰 HTML)는 #alvgState가 HTML에 있을 때만 상태줄로 표시(없으면 무시 — L07 하위호환).
(function(){
  var cfg = window.ALVG_CFG || {};
  var COLS = cfg.cols || [];
  var DATA = cfg.data || [];
  var STEPS = cfg.steps || [];
  var SUMKEY = cfg.sumKey || null;
  var $=function(id){return document.getElementById(id);};
  var cur=0, sumOn=false, sortCol=-1, sortAsc=true, rows=DATA.slice();

  var KW=new Set(('DATA REF TO CREATE OBJECT EXPORTING CHANGING CALL FUNCTION SELECT FROM INTO TABLE WHERE MODULE OUTPUT INPUT ENDMODULE FORM ENDFORM PERFORM IF ELSEIF ELSE ENDIF IS INITIAL TYPE CASE WHEN ENDCASE CLEAR LEAVE SCREEN STANDARD OF RETURN EXCEPTIONS OTHERS').split(' '));
  var CLS=new Set(['cl_gui_custom_container','cl_gui_alv_grid','lvc_t_fcat','lvc_s_layo']);
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function hl(line){
    if(/^\s*"/.test(line)) return '<span class="tok-com">'+esc(line)+'</span>';
    // 숫자 대안(\d+) 필수 · 캐치올에서 "를 제외해야 미드라인 주석/숫자가 안 사라진다.
    var out='', re=/('[^']*'?)|("[^\n]*$)|([A-Za-z_][A-Za-z0-9_]*)|(\d+)|([^A-Za-z0-9_'"]+)/g, m;
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

  function renderSteps(){
    $('alvgSteps').innerHTML = STEPS.map(function(s,i){
      var cl = i<cur ? 'done' : (i===cur-1?'on':'');   // cur = 실행 완료한 단계 수
      return '<div class="alvg-step '+(i<cur?'done':'')+(i===cur-1?' on':'')+'">'+
        '<span class="alvg-step__n">'+s.n+'</span><span class="alvg-step__nm">'+s.nm+'</span>'+
        '<div class="alvg-step__sub">'+(s.sub||'')+'</div></div>';
    }).join('');
  }
  function renderCode(){
    var gut='', src='';
    var ln=0;
    STEPS.slice(0,cur).forEach(function(s,si){
      var add = (si===cur-1);
      s.code.forEach(function(t){
        ln++;
        gut+='<span>'+ln+'</span>\n';
        src+='<span class="ln'+(add?' add':'')+'">'+(t===''?' ':hl(t))+'</span>';
      });
    });
    if(cur===0){ src='<span class="ln"> </span>'; gut='<span>1</span>'; }
    $('alvgGut').innerHTML=gut; $('alvgSrc').innerHTML=src;
  }
  function renderGrid(){
    // showGrid:true 단계를 완료한 뒤부터 계속 표시(뒤 단계 = PAI/refresh 분기 시연)
    var show = STEPS.slice(0,cur).some(function(s){ return s.showGrid; });
    var cont=$('alvgCont');
    if(!show){ cont.classList.add('hidden'); cont.querySelector('[data-grid]').innerHTML=''; return; }
    cont.classList.remove('hidden');
    var thead='<thead><tr>'+COLS.map(function(c,i){
      var ar=i===sortCol?(sortAsc?'▲':'▼'):'↕';
      return '<th data-col="'+i+'">'+c.label+'<span class="ar">'+ar+'</span></th>';
    }).join('')+'</tr></thead>';
    var body='<tbody>'+rows.map(function(r){
      return '<tr>'+COLS.map(function(c){return '<td class="'+(c.num?'num':'')+'">'+esc(r[c.key])+'</td>';}).join('')+'</tr>';
    }).join('')+'</tbody>';
    var foot='';
    if(sumOn&&SUMKEY){ var tot=rows.reduce(function(s,r){return s+(Number(r[SUMKEY])||0);},0);
      foot='<tfoot><tr>'+COLS.map(function(c,i){ if(i===0)return '<td class="lbl">합계 ('+rows.length+'행)</td>'; if(c.key===SUMKEY)return '<td class="num">'+tot+'</td>'; return '<td></td>';}).join('')+'</tr></tfoot>'; }
    cont.querySelector('[data-grid]').innerHTML=thead+body+foot;
  }
  function renderState(){
    var el=$('alvgState'); if(!el) return;
    var st = cur>0 ? STEPS[cur-1] : null;
    if(st && st.state){ el.classList.remove('hidden'); el.innerHTML=st.state; }  // state = cfg 작성 신뢰 HTML
    else { el.classList.add('hidden'); el.innerHTML=''; }
  }
  function render(){ renderSteps(); renderCode(); renderGrid(); renderState();
    $('alvgNext').disabled = cur>=STEPS.length;
    postHeight();
  }
  $('alvgNext').addEventListener('click',function(){
    if(cur<STEPS.length){
      cur++;
      var st=STEPS[cur-1];
      if(st && st.data && cfg.dataSets && cfg.dataSets[st.data]){ rows=cfg.dataSets[st.data].slice(); sortCol=-1; }
      render();
    }
  });
  $('alvgReset').addEventListener('click',function(){ cur=0; sumOn=false; sortCol=-1; rows=DATA.slice(); render(); });

  // 그리드 상호작용
  $('alvgCont').addEventListener('click',function(e){
    var th=e.target.closest('th');
    if(th){ var col=+th.dataset.col, key=COLS[col].key, num=COLS[col].num;
      if(col===sortCol) sortAsc=!sortAsc; else {sortCol=col; sortAsc=true;}
      rows.sort(function(a,b){var x=a[key],y=b[key]; if(num)return sortAsc?x-y:y-x; return sortAsc?String(x).localeCompare(y,'ko'):String(y).localeCompare(x,'ko');});
      renderGrid(); return;
    }
    var b=e.target.closest('[data-bar]'); if(b){ var act=b.dataset.bar;
      if(act==='sort'){ var t=$('alvgCont').querySelector('th[data-col="0"]'); if(t)t.click(); }
      else if(act==='sum'){ sumOn=!sumOn; renderGrid(); }
      return;
    }
    var tr=e.target.closest('tbody tr'); if(tr){ var trs=[].slice.call($('alvgCont').querySelectorAll('tbody tr'));
      trs.forEach(function(x){x.classList.remove('cur');}); tr.classList.add('cur'); }
  });

  function postHeight(){
    try{ var el=document.querySelector('.wrap');
      var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6;
      parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){}
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  render();
})();
