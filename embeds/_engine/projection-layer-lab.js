// ===== projection-layer-lab 엔진 JS — Interface(ZI_) vs Projection(ZC_) 계층 분리 (CH23-L02) =====
// 비대칭이 핵심: ZC_에서 필드를 숨겨도 ZI_은 불변(비파괴) / ZI_에서 필드를 제거하면 ZC_도 노출 불가(연쇄).
// 각 필드: inBase(ZI_ 존재) · inProj(ZC_ 노출). key는 항상 잠금. DDL·SELECT 라이브. 데이터=window.PLL_CFG.
(function(){
  var $=function(id){return document.getElementById(id);};
  var cfg=window.PLL_CFG||{};
  var BASE=cfg.base||'ZI_Concert', PROJ=cfg.proj||'ZC_ConcertList';
  var F=(cfg.fields||[]).map(function(f){ return {name:f.name, key:!!f.key, inBase:true, inProj:true}; });

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function exposed(){ return F.filter(function(f){ return f.inBase && f.inProj; }); }   // ZC_ 실제 노출
  function inBaseList(){ return F.filter(function(f){ return f.inBase; }); }             // ZI_ 존재

  function rowsHtml(){
    return F.map(function(f,i){
      var ziBtn = f.key
        ? '<span class="pll-lock">🔒 key (항상 포함)</span>'
        : '<button class="pll-toggle '+(f.inBase?'on':'off')+'" data-a="base" data-i="'+i+'">'+(f.inBase?'포함':'제거됨')+'</button>';
      var zcBtn;
      if(f.key){ zcBtn='<span class="pll-lock">🔒 key</span>'; }
      else if(!f.inBase){ zcBtn='<button class="pll-toggle proj-off" data-a="proj" data-i="'+i+'" disabled>노출 불가</button>'; }
      else { zcBtn='<button class="pll-toggle '+(f.inProj?'proj-on':'proj-off')+'" data-a="proj" data-i="'+i+'">'+(f.inProj?'노출':'숨김')+'</button>'; }
      return '<tr><td><span class="pll-fname">'+esc(f.name)+'</span>'+(f.key?'<span class="pll-key">KEY</span>':'')+'</td>'+
             '<td>'+ziBtn+'</td><td>'+zcBtn+'</td></tr>';
    }).join('');
  }

  function chips(list,keyClass){
    if(!list.length) return '<span class="pll-empty">(노출 필드 없음)</span>';
    return list.map(function(f){ return '<span class="pll-chip'+(f.key?' key':'')+'">'+esc(f.name)+'</span>'; }).join('');
  }

  function ddlHtml(){
    var ex=exposed();
    var lines=[];
    lines.push('<span class="k">define view entity</span> <span class="ent">'+esc(PROJ)+'</span>');
    lines.push('  <span class="k">as select from</span> <span class="base">'+esc(BASE)+'</span>');
    lines.push('{');
    ex.forEach(function(f,i){
      var pre=f.key?'  <span class="kw">key</span> ':'      ';
      lines.push(pre+esc(f.name)+(i===ex.length-1?'':','));
    });
    lines.push('}');
    return '<pre class="pll-code">'+lines.join('\n')+'</pre>';
  }
  function sqlHtml(){
    var names=exposed().map(function(f){return f.name;});
    return '<pre class="pll-code"><span class="k">SELECT</span> '+esc(names.join(', '))+'\n'+
      '  <span class="k">FROM</span> <span class="ent">'+esc(PROJ)+'</span>\n'+
      '  <span class="k">INTO TABLE</span> <span class="host">@DATA(gt_list)</span>.</pre>';
  }

  function setMsg(t,warn){ var m=$('pllMsg'); m.className='pll-msg'+(warn?' warn':''); m.innerHTML=t; }

  function render(){
    $('pllRows').innerHTML=rowsHtml();
    $('pllZi').innerHTML=chips(inBaseList());
    $('pllZc').innerHTML=chips(exposed());
    $('pllDdl').innerHTML=ddlHtml();
    $('pllSql').innerHTML=sqlHtml();
  }

  $('pllRows').addEventListener('click',function(e){
    var b=e.target.closest('.pll-toggle'); if(!b||b.disabled) return;
    var f=F[+b.dataset.i];
    if(b.dataset.a==='base'){
      f.inBase=!f.inBase;
      if(f.inBase){ setMsg('<b>'+esc(f.name)+'</b>를 기반 <b>'+esc(BASE)+'</b>에 복원했습니다. 이제 projection이 다시 노출할 수 있습니다.'); }
      else { setMsg('<b>'+esc(BASE)+'</b>에서 <b>'+esc(f.name)+'</b>를 제거했습니다 → projection <b>'+esc(PROJ)+'</b>도 더는 노출할 수 없습니다(기반에 없으니까). 기반 변경은 <b>연쇄</b>됩니다.', true); }
    }else{
      f.inProj=!f.inProj;
      if(f.inProj){ setMsg('<b>'+esc(f.name)+'</b>를 다시 노출합니다.'); }
      else { setMsg('<b>'+esc(f.name)+'</b>는 <b>'+esc(PROJ)+'</b>에서 숨겼지만 기반 <b>'+esc(BASE)+'</b>에는 그대로 있습니다 — 삭제가 아니라 <b>안 보일 뿐</b>(비파괴).'); }
    }
    render();
  });

  render();
  setMsg('필드를 <b>ZC_에서 숨겨</b> 보세요(기반은 그대로) — 그다음 <b>ZI_에서 제거</b>해 차이를 보세요(연쇄).');
})();
