// ===== metadata-extension-lab 엔진 JS — 본문(DDL)과 메타데이터(DDLX) 분리 실험실 (CH22-L05) =====
// uiLoc: UI 주석을 본문(inline)에 둘지 별도 DDLX(ext)로 뺄지. allow: @Metadata.allowExtensions. sep: DDLX 구분자 ;/, .
// ext + !allow → 활성화 실패(bad). ext + sep=',' → 세미콜론 아님 실패(bad). ext + allow + ';' → 분리 완료(ok). 데이터=window.MXL_CFG.
(function(){
  var $=function(id){return document.getElementById(id);};
  var cfg=window.MXL_CFG||{};
  var ENT=cfg.entity||'ZC_Concert', BASE=cfg.base||'ZI_Concert';
  var F=cfg.fields||[];
  var st={ uiLoc:'inline', allow:true, sep:';' };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function lineItem(pos){ return '<span class="anno">@UI.lineItem: [{ position: '+pos+' }]</span>'; }

  function ddlCode(){
    var lines=[];
    lines.push('<span class="anno">@AccessControl.authorizationCheck: #NOT_REQUIRED</span>');
    lines.push(st.allow
      ? '<span class="allow">@Metadata.allowExtensions: true</span>'
      : '<span class="miss">// @Metadata.allowExtensions 없음</span>');
    lines.push('<span class="k">define view entity</span> <span class="ent">'+esc(ENT)+'</span>');
    lines.push('  <span class="k">as projection on</span> <span class="base">'+esc(BASE)+'</span>');
    lines.push('{');
    F.forEach(function(f,i){
      if(st.uiLoc==='inline') lines.push('  '+lineItem(f.pos));
      var pre=f.key?'  <span class="k">key</span> ':'      ';
      lines.push(pre+esc(f.name)+(i===F.length-1?'':','));
    });
    lines.push('}');
    return lines.join('\n');
  }

  function ddlxCode(){
    if(st.uiLoc!=='ext') return null;
    var sepBad=(st.sep===',');
    var sep = sepBad ? '<span class="sep-bad">,</span>' : ';';
    var lines=[];
    lines.push('<span class="layer">@Metadata.layer: #CORE</span>');
    lines.push('<span class="k">annotate entity</span> <span class="ent">'+esc(ENT)+'</span> <span class="k">with</span>');
    lines.push('{');
    F.forEach(function(f){
      lines.push('  '+lineItem(f.pos));
      lines.push('  '+esc(f.name)+sep);
    });
    lines.push('}');
    return lines.join('\n');
  }

  function setStatus(badge,t,cls){ $('mxlStatus').className='mxl-status '+cls; $('mxlStatus').innerHTML=badge+t; }

  function render(){
    // toggles
    $('mxlLoc').className='mxl-toggle '+(st.uiLoc==='ext'?'on':'warnstate');
    $('mxlLoc').textContent=(st.uiLoc==='ext'?'UI 주석: DDLX로 분리됨':'UI 주석: 본문에 섞임');
    $('mxlAllow').className='mxl-toggle '+(st.allow?'on':'warnstate');
    $('mxlAllow').textContent='@Metadata.allowExtensions: '+(st.allow?'true':'(없음)');
    $('mxlSep').className='mxl-toggle '+(st.sep===';'?'on':'warnstate');
    $('mxlSep').textContent='DDLX 구분자: '+(st.sep===';'?'세미콜론 ;':'쉼표 , (틀림)');
    $('mxlSep').disabled=false;

    // files
    $('mxlDdl').innerHTML='<pre class="mxl-code">'+ddlCode()+'</pre>';
    var dx=ddlxCode();
    $('mxlDdlx').innerHTML = dx ? '<pre class="mxl-code">'+dx+'</pre>'
      : '<div class="mxl-empty">(비어 있음 — UI 주석이 본문에 있습니다)</div>';

    // status
    if(st.uiLoc==='inline'){
      setStatus('', 'UI 주석이 <b>본문에 섞여</b> 데이터 구조가 묻힙니다. 늘어나면 <b>DDLX로 분리</b>하세요(본문은 필드, extension은 UI).', '');
      return;
    }
    if(!st.allow){ setStatus('<span class="mxl-badge fail">활성화 실패</span>', '대상 entity <b>'+esc(ENT)+'</b>가 <b>@Metadata.allowExtensions: true</b>를 허용하지 않습니다. extension은 아무 CDS에나 붙는 게 아니에요.', 'bad'); return; }
    if(st.sep===','){ setStatus('<span class="mxl-badge fail">활성화 실패</span>', '<b>annotate entity</b> 블록은 요소 뒤에 <b>세미콜론(;)</b>을 씁니다 — DDL select list의 쉼표(,)와 다릅니다.', 'bad'); return; }
    setStatus('<span class="mxl-badge act">활성화 OK</span>', '<b>분리 완료.</b> 본문 DDL은 데이터 구조, DDLX는 UI 주석. 필드를 새로 만든 게 아니라 <b>annotation만</b> 덧붙였습니다.', 'ok');
  }

  $('mxlLoc').addEventListener('click',function(){ st.uiLoc=(st.uiLoc==='ext'?'inline':'ext'); render(); });
  $('mxlAllow').addEventListener('click',function(){ st.allow=!st.allow; render(); });
  $('mxlSep').addEventListener('click',function(){ st.sep=(st.sep===';'?',':';'); render(); });

  render();
})();
