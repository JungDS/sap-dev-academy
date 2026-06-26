// ===== collective-search-help 엔진 JS — Collective Search Help 탭 시뮬 (CH09-L05) =====
// 여러 Elementary(ID/아티스트/장소 검색)를 탭으로 묶고, 어느 탭에서 골라도 같은 반환 필드(CONCERT_ID)로
// 돌아오는 흐름. "매핑 끊기" 시 선택해도 입력칸으로 안 돌아오는 실패 상태. 데이터=window.CSH_CFG.
(function(){
  var cfg = window.CSH_CFG || {};
  var TABS = cfg.tabs || [];        // [{key,label,searchCol,listCols}]
  var ROWS = cfg.rows || [];
  var RET = cfg.returnCol || 'CONCERT_ID';
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var cur=0, broken=false;

  function renderTabs(){
    $('tabs').innerHTML = TABS.map(function(t,i){ return '<button class="tab'+(i===cur?' on':'')+'" data-i="'+i+'">'+esc(t.label)+'</button>'; }).join('');
  }
  function renderBody(){
    var t=TABS[cur];
    var head='<thead><tr>'+t.listCols.map(function(c){return '<th>'+esc(c)+'</th>';}).join('')+'</tr></thead>';
    var body=ROWS.map(function(row,i){
      return '<tr data-i="'+i+'">'+t.listCols.map(function(c){return '<td class="'+(c===RET?'id':'')+'">'+esc(row[c])+'</td>';}).join('')+'</tr>';
    }).join('');
    $('tabbody').innerHTML='<div class="search">'+esc(t.searchCol)+' <input type="text" placeholder="검색"> <span style="color:var(--soon)">검색 방식이 달라도 →</span></div>'
      +'<table class="dt">'+head+'<tbody>'+body+'</tbody></table>';
    $('tabbody').querySelectorAll('tbody tr').forEach(function(tr){
      tr.addEventListener('click',function(){ pick(ROWS[+tr.dataset.i]); });
    });
  }
  function pick(row){
    if(broken){ $('inbox').className='inbox no'; $('inbox').textContent='—';
      $('retmsg').className='retmsg no'; $('retmsg').innerHTML='⚠ parameter 매핑이 끊겨 선택값이 입력칸으로 돌아오지 않습니다.'; postHeight(); return; }
    $('inbox').className='inbox ok'; $('inbox').textContent=row[RET];
    $('retmsg').className='retmsg'; $('retmsg').innerHTML='어느 탭에서 골라도 동일하게 <code>'+esc(RET)+'</code>가 반환됩니다.'; postHeight();
  }
  function render(){ renderTabs(); renderBody(); postHeight(); }

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
