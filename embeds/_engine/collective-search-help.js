// ===== collective-search-help 엔진 JS — Collective Search Help 탭 시뮬 (CH09-L05) =====
// 여러 Elementary(ID/아티스트/장소 검색)를 탭으로 묶고, 어느 탭에서 골라도 같은 반환 필드(CONCERT_ID)로
// 돌아오는 흐름. "매핑 끊기" 시 선택해도 입력칸으로 안 돌아오는 실패 상태. 데이터=window.CSH_CFG.
// 탭마다 있는 검색칸은 실제로 동작한다 — 그 탭의 searchCol을 부분 일치로 걸러 목록을 좁힌다(탭별 입력값 보존).
(function(){
  var cfg = window.CSH_CFG || {};
  var TABS = cfg.tabs || [];        // [{key,label,searchCol,listCols}]
  var ROWS = cfg.rows || [];
  var RET = cfg.returnCol || 'CONCERT_ID';
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var cur=0, broken=false, filters={};   // filters: 탭 key -> 검색어

  function renderTabs(){
    $('tabs').innerHTML = TABS.map(function(t,i){ return '<button class="tab'+(i===cur?' on':'')+'" data-i="'+i+'">'+esc(t.label)+'</button>'; }).join('');
  }
  /* 현재 탭의 검색어로 걸러진 행 목록 */
  function hits(){
    var t=TABS[cur], f=(filters[t.key]||'').trim().toLowerCase();
    return ROWS.map(function(row,i){ return {row:row, i:i}; }).filter(function(o){
      if(!f) return true;
      return String(o.row[t.searchCol]==null?'':o.row[t.searchCol]).toLowerCase().indexOf(f)>=0;
    });
  }
  /* 목록만 다시 그린다 — 검색칸을 살려 둬야 타이핑 중 포커스가 안 끊긴다. */
  function renderRows(){
    var t=TABS[cur], tb=$('cshRows'), cnt=$('cshCnt'); if(!tb) return;
    var list=hits();
    tb.innerHTML = list.length
      ? list.map(function(o){
          return '<tr data-i="'+o.i+'">'+t.listCols.map(function(c){return '<td class="'+(c===RET?'id':'')+'">'+esc(o.row[c])+'</td>';}).join('')+'</tr>';
        }).join('')
      : '<tr class="none"><td colspan="'+t.listCols.length+'">'+esc(t.searchCol)+'에 그런 값이 없습니다.</td></tr>';
    if(cnt) cnt.textContent=list.length+'건 / 전체 '+ROWS.length+'건';
  }
  function renderBody(){
    var t=TABS[cur];
    var head='<thead><tr>'+t.listCols.map(function(c){return '<th>'+esc(c)+'</th>';}).join('')+'</tr></thead>';
    $('tabbody').innerHTML='<div class="search">'+esc(t.searchCol)+' <input type="text" id="cshIn" placeholder="검색" value="'+esc(filters[t.key]||'')+'">'
      +' <span style="color:var(--soon)">검색 방식이 달라도 →</span><span class="cnt" id="cshCnt"></span></div>'
      +'<table class="dt">'+head+'<tbody id="cshRows"></tbody></table>';
    $('cshIn').addEventListener('input',function(){ filters[t.key]=this.value; renderRows(); postHeight(); });
    renderRows();
  }
  function pick(row){
    if(broken){ $('inbox').className='inbox no'; $('inbox').textContent='—';
      $('retmsg').className='retmsg no'; $('retmsg').innerHTML='⚠ parameter 매핑이 끊겨 선택값이 입력칸으로 돌아오지 않습니다.'; postHeight(); return; }
    $('inbox').className='inbox ok'; $('inbox').textContent=row[RET];
    $('retmsg').className='retmsg'; $('retmsg').innerHTML='어느 탭에서 골라도 동일하게 <code>'+esc(RET)+'</code>가 반환됩니다.'; postHeight();
  }
  function render(){ renderTabs(); renderBody(); postHeight(); }

  /* 행 선택 = 위임 등록 1회(renderBody가 innerHTML을 갈아 끼워도 유지) */
  $('tabbody').addEventListener('click',function(e){
    var tr=e.target.closest('tbody tr'); if(!tr||tr.classList.contains('none')) return;
    var row=ROWS[+tr.dataset.i]; if(row) pick(row);
  });
  $('tabs').addEventListener('click',function(e){ var b=e.target.closest('.tab'); if(!b) return; cur=+b.dataset.i; render(); });
  $('brk').addEventListener('click',function(){ broken=!broken; $('brk').classList.toggle('on',broken);
    $('inbox').className='inbox'; $('inbox').textContent='—'; $('retmsg').className='retmsg'; $('retmsg').textContent=broken?'매핑 끊김 상태 — 행을 골라 보세요.':'행을 고르면 CONCERT_ID가 반환됩니다.'; postHeight(); });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
