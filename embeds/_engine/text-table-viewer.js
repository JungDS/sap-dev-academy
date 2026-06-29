// ===== text-table-viewer 엔진 JS — Text Table 언어별 이름표 (CH09-L03) =====
// 로그인 언어(KO/EN)에 따라 F4 목록 이름이 바뀌는 흐름. SPRAS 누락 시 다국어 불가 경고.
// 데이터=window.TTV_CFG = { master:[{id,venue,cap}], texts:[{id,spras,name}] }
(function(){
  var cfg = window.TTV_CFG || {};
  var MASTER = cfg.master || [];
  var TEXTS = cfg.texts || [];
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var lang='KO', sprasMissing=false;

  function renderMaster(){
    $('master').innerHTML='<table class="dt"><thead><tr><th>CONCERT_ID</th><th>VENUE</th><th>CAP</th></tr></thead><tbody>'
      + MASTER.map(function(r){ return '<tr><td class="id">'+esc(r.id)+'</td><td>'+esc(r.venue)+'</td><td>'+esc(r.cap)+'</td></tr>'; }).join('')
      + '</tbody></table>';
  }
  function renderText(){
    if(sprasMissing){
      // SPRAS 없는 잘못된 구조: 코드당 한 이름만(언어 구분 불가) — 마지막 언어가 덮음
      var collapsed={}; TEXTS.forEach(function(t){ collapsed[t.id]=t.name; });
      $('textHd').textContent='ZCONCERT_T (SPRAS 누락 — 잘못된 구조)';
      $('text').innerHTML='<table class="dt"><thead><tr><th>CONCERT_ID</th><th>NAME</th></tr></thead><tbody>'
        + Object.keys(collapsed).map(function(id){ return '<tr><td class="id">'+esc(id)+'</td><td>'+esc(collapsed[id])+' ⚠</td></tr>'; }).join('')
        + '</tbody></table>';
    } else {
      $('textHd').textContent='Text Table · ZCONCERT_T';
      $('text').innerHTML='<table class="dt"><thead><tr><th>CONCERT_ID</th><th>SPRAS</th><th>NAME</th></tr></thead><tbody>'
        + TEXTS.map(function(t){ var on=t.spras===lang;
            return '<tr class="'+(on?'shown':'dim')+'"><td class="id">'+esc(t.id)+'</td><td><span class="spras">'+esc(t.spras)+'</span></td><td>'+esc(t.name)+'</td></tr>'; }).join('')
        + '</tbody></table>';
    }
  }
  function renderF4(){
    if(sprasMissing){
      $('f4').innerHTML='<div class="warnbox">⚠ <b>SPRAS(언어 키)가 없으면</b> 같은 코드의 한국어·영어 이름을 함께 담을 수 없습니다. F4 목록이 로그인 언어에 맞춰 바뀌지 못합니다.</div>';
      return;
    }
    var byCode={}; TEXTS.forEach(function(t){ if(t.spras===lang) byCode[t.id]=t.name; });
    $('f4').innerHTML='<div class="f4list">'+ MASTER.map(function(m){
      var nm=byCode[m.id]||'(이름 없음)';
      return '<div class="f4item"><span class="id">'+esc(m.id)+'</span><span>'+esc(nm)+'</span></div>';
    }).join('')+'</div>';
  }
  function render(){ renderMaster(); renderText(); renderF4(); postHeight(); }

  $('langSeg').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return; lang=b.dataset.l;
    $('langSeg').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});
    render();
  });
  $('missBtn').addEventListener('click',function(){
    sprasMissing=!sprasMissing; $('missBtn').classList.toggle('on',sprasMissing);
    $('langSeg').style.opacity = sprasMissing?'.4':'1';
    $('langSeg').style.pointerEvents = sprasMissing?'none':'auto';
    render();
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
