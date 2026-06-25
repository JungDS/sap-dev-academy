// ===== search-help-builder 엔진 JS — Elementary Search Help 조립 (CH09-L04) =====
// Selection Method + parameter 역할(검색조건/목록표시/반환EXP)을 조립해 F4 팝업을 미리본다.
// EXP 누락·빈 Selection Method 같은 실패도 체험. 데이터=window.SHB_CFG.
(function(){
  var cfg = window.SHB_CFG || {};
  var SOURCES = cfg.sources || {};   // {ZCONCERT:{cols:[..], rows:[..]}, ...}
  var EMPTY = cfg.emptyName || '빈 테이블';
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var sel = cfg.defaultSource || 'ZCONCERT';
  var roles = {};   // col -> {search,list,exp}
  function initRoles(){
    roles={};
    var cols=(SOURCES[sel]&&SOURCES[sel].cols)||[];
    cols.forEach(function(c){ roles[c]={search:false, list:true, exp:false}; });
    if(roles[cols[0]]){ roles[cols[0]].exp=true; }
    if(cols[1]&&roles[cols[1]]) roles[cols[1]].search=true;
  }

  function renderSM(){
    $('smbtns').querySelectorAll('.smbtn').forEach(function(b){ b.classList.toggle('on', b.dataset.s===sel); });
  }
  function renderParams(){
    var cols=(SOURCES[sel]&&SOURCES[sel].cols)||[];
    if(!cols.length){ $('params').innerHTML='<div style="color:var(--soon);font-style:italic;font-size:.82rem">선택한 Selection Method에 필드가 없습니다.</div>'; return; }
    $('params').innerHTML = cols.map(function(c){
      var r=roles[c];
      return '<div class="prow"><span class="pn">'+esc(c)+'</span><div class="roles" data-col="'+c+'">'
        +'<button class="rchip search'+(r.search?' on':'')+'" data-r="search">검색조건</button>'
        +'<button class="rchip list'+(r.list?' on':'')+'" data-r="list">목록표시</button>'
        +'<button class="rchip exp'+(r.exp?' on':'')+'" data-r="exp">반환(EXP)</button>'
        +'</div></div>';
    }).join('');
  }
  function renderF4(){
    var src=SOURCES[sel];
    if(!src || !src.cols.length){
      $('f4').innerHTML='<div class="f4__hd">🔍 F4 미리보기</div><div style="padding:14px;color:var(--bad);font-size:.84rem">목록의 원천이 없습니다 — Selection Method를 먼저 지정하세요.</div>';
      $('retbox').className='retbox no'; $('retbox').textContent='Selection Method가 비어 결과 목록을 만들 수 없습니다.';
      return;
    }
    var cols=src.cols;
    var searchCols=cols.filter(function(c){return roles[c].search;});
    var listCols=cols.filter(function(c){return roles[c].list;});
    if(!listCols.length) listCols=cols.slice();
    var expCol=cols.filter(function(c){return roles[c].exp;})[0];
    var searchHtml = searchCols.length
      ? searchCols.map(function(c){return '<div class="sf">'+esc(c)+' <input type="text" placeholder="검색"></div>';}).join('')
      : '<span class="none">검색 조건 필드가 없습니다(목록만 표시).</span>';
    var head='<thead><tr>'+listCols.map(function(c){return '<th>'+esc(c)+'</th>';}).join('')+'</tr></thead>';
    var body=src.rows.map(function(row,i){
      return '<tr data-i="'+i+'">'+listCols.map(function(c){return '<td class="'+(c===cols[0]?'id':'')+'">'+esc(row[c])+'</td>';}).join('')+'</tr>';
    }).join('');
    $('f4').innerHTML='<div class="f4__hd">🔍 F4 — '+sel+' 검색</div>'
      +'<div class="f4__search">'+searchHtml+'</div>'
      +'<table class="dt">'+head+'<tbody>'+body+'</tbody></table>';
    $('f4').querySelectorAll('tbody tr').forEach(function(tr){
      tr.addEventListener('click',function(){
        var row=src.rows[+tr.dataset.i];
        if(!expCol){ $('retbox').className='retbox no'; $('retbox').innerHTML='행을 선택했지만 <b>EXP(반환)로 지정된 필드가 없어</b> 입력칸으로 돌아갈 값이 없습니다.'; postHeight(); return; }
        $('retbox').className='retbox ok'; $('retbox').innerHTML='선택 → 입력칸에 <code>'+esc(expCol)+' = '+esc(row[expCol])+'</code> 반환됨.'; postHeight();
      });
    });
    // 초기 안내
    if(!expCol){ $('retbox').className='retbox no'; $('retbox').innerHTML='⚠ <b>EXP(반환) 필드가 없습니다.</b> 행을 선택해도 입력칸으로 값이 돌아오지 않습니다.'; }
    else { $('retbox').className='retbox idle'; $('retbox').innerHTML='목록에서 행을 클릭하면 <code>'+esc(expCol)+'</code> 값이 입력칸으로 반환됩니다.'; }
  }
  function render(){ renderSM(); renderParams(); renderF4(); postHeight(); }

  $('smbtns').addEventListener('click',function(e){
    var b=e.target.closest('.smbtn'); if(!b) return; sel=b.dataset.s; initRoles(); render();
  });
  $('params').addEventListener('click',function(e){
    var b=e.target.closest('.rchip'); if(!b) return;
    var col=b.closest('.roles').dataset.col, r=b.dataset.r;
    roles[col][r]=!roles[col][r];
    if(r==='exp' && roles[col].exp){ // EXP는 하나만
      Object.keys(roles).forEach(function(c){ if(c!==col) roles[c].exp=false; });
    }
    render();
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  initRoles(); render();
})();
