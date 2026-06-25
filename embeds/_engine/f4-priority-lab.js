// ===== f4-priority-lab 엔진 JS — Input Help 우선순위 토글 실험 (CH09-L07, S02) =====
// 도움말 후보를 켜고 F4를 누르면 "위가 있으면 아래는 안 본다" 규칙으로 가장 높은 하나만 뜬다.
// 데이터=window.FPL_CFG = { levels:[{key,name,desc,popupTitle,popupRows:[]}] } (위에서부터 우선순위 높음)
(function(){
  var cfg = window.FPL_CFG || {};
  var LEVELS = cfg.levels || [];
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var active={};  // key->bool

  function renderLadder(winnerIdx){
    $('ladder').innerHTML = LEVELS.map(function(l,i){
      var on=!!active[l.key];
      var cls='lvl'+(on?' active':'');
      var badge='';
      if(winnerIdx!=null){
        if(i===winnerIdx){ cls+=' winner'; badge='<span class="badge">▶ 표시됨</span>'; }
        else if(on && i>winnerIdx){ cls+=' suppressed'; badge='<span class="badge">평가 안 함</span>'; }
      }
      return '<div class="'+cls+'" data-k="'+l.key+'"><div class="rank">'+(i+1)+'</div>'
        +'<div class="info"><div class="name">'+esc(l.name)+'</div><div class="desc">'+esc(l.desc)+'</div></div>'
        +'<div style="display:flex;align-items:center;gap:8px">'+badge+'<div class="knob"></div></div></div>';
    }).join('');
  }

  function run(){
    var winnerIdx=null;
    for(var i=0;i<LEVELS.length;i++){ if(active[LEVELS[i].key]){ winnerIdx=i; break; } }
    renderLadder(winnerIdx);
    if(winnerIdx==null){
      $('popup').style.display='none';
      $('statusmsg').className='statusmsg none'; $('statusmsg').textContent='켜진 도움말이 없습니다 — 토글을 하나 이상 켜고 F4를 눌러 보세요.';
      postHeight(); return;
    }
    var w=LEVELS[winnerIdx];
    $('popup').style.display='block';
    $('popup').innerHTML='<div class="popup__hd">'+esc(w.popupTitle||w.name)+'</div><div class="popup__body">'
      + (w.popupRows||[]).map(function(r){return '<div class="row">'+esc(r)+'</div>';}).join('') + '</div>';
    // status
    var higherSuppressed = LEVELS.filter(function(l,i){return i>winnerIdx && active[l.key];});
    if(winnerIdx===0 && Object.keys(active).filter(function(k){return active[k];}).length<=1){
      $('statusmsg').className='statusmsg'; $('statusmsg').innerHTML='<b>'+(winnerIdx+1)+'단계 '+esc(w.name)+'</b>가 표시됩니다.';
    } else if(higherSuppressed.length){
      $('statusmsg').className='statusmsg'; $('statusmsg').innerHTML='<b>'+(winnerIdx+1)+'단계 '+esc(w.name)+'</b>가 존재하므로 더 아래 단계('+higherSuppressed.map(function(l){return esc(l.name);}).join(', ')+')는 평가하지 않습니다.';
    } else {
      $('statusmsg').className='statusmsg'; $('statusmsg').innerHTML='상위 도움말이 없어 <b>'+(winnerIdx+1)+'단계 '+esc(w.name)+'</b>로 내려왔습니다.';
    }
    postHeight();
  }

  $('ladder').addEventListener('click',function(e){
    var l=e.target.closest('.lvl'); if(!l) return;
    var k=l.dataset.k; active[k]=!active[k]; renderLadder(null);
    $('popup').style.display='none'; $('statusmsg').className='statusmsg none'; $('statusmsg').textContent='F4를 눌러 어떤 도움말이 뜨는지 확인하세요.';
    postHeight();
  });
  $('run').addEventListener('click', run);
  document.addEventListener('keydown',function(e){ if(e.key==='F4'){ e.preventDefault(); run(); } });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  // 초기: Search Help + DDIC 둘 다 켜서 우선순위 효과 보이게
  if(LEVELS[1]) active[LEVELS[1].key]=true;
  if(LEVELS[2]) active[LEVELS[2].key]=true;
  renderLadder(null);
  $('statusmsg').className='statusmsg none'; $('statusmsg').textContent='F4를 눌러 어떤 도움말이 뜨는지 확인하세요.';
})();
