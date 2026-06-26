// ===== tcode-prefix-cards 엔진 JS — 접두어 카드(펼침) + 함정 한 컷 (CH01-L02) =====
// 숫자 요약 카드를 클릭/호버하면 의미·핵심포인트가 펼쳐진다(progressive disclosure). 데이터=window.TPC_CFG.
(function(){
  var cfg = window.TPC_CFG || {};
  var CARDS = cfg.cards || [];
  var TRAP = cfg.trap || null;
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  function render(){
    $('cards').innerHTML = CARDS.map(function(c,i){
      return '<div class="tpc-card c'+(i+1)+(c.open?' open':'')+'" data-i="'+i+'">'
        +'<div class="tpc-head">'
          +'<span class="tpc-num">'+(i+1)+'</span>'
          +'<span class="tpc-code">'+esc(c.code)+'</span>'
          +'<span class="tpc-sum">'+esc(c.summary||'')+'</span>'
          +'<span class="tpc-chev">▼</span>'
        +'</div>'
        +'<div class="tpc-detail">'
          +'<div class="tpc-row"><div class="k">의미</div><div class="v">'+esc(c.meaning||'')+'</div></div>'
          +'<div class="tpc-row"><div class="k">핵심 포인트</div><div class="v">'+(c.point||'')+'</div></div>'
        +'</div>'
      +'</div>';
    }).join('');
    if(TRAP){
      $('trap').style.display='block';
      $('trap').innerHTML='<div class="tpc-trap__hd">⚠️ 한 컷으로 보는 함정 — '+esc(TRAP.context)+'</div>'
        +'<div class="tpc-trap__b">'
        +'<div class="tpc-case bad"><div class="ctx">'+esc(TRAP.context)+'</div><div class="cmd">'+esc(TRAP.bad.cmd)+' <span>→</span> ✕</div><div class="res"><b class="no">'+esc(TRAP.bad.res)+'</b></div></div>'
        +'<div class="tpc-case good"><div class="ctx">'+esc(TRAP.context)+'</div><div class="cmd">'+esc(TRAP.good.cmd)+' <span>→</span> ✓</div><div class="res"><b class="ok">'+esc(TRAP.good.res)+'</b></div></div>'
        +'</div>';
    }
    postHeight();
  }

  $('cards').addEventListener('click',function(e){
    var card=e.target.closest('.tpc-card'); if(!card) return;
    var i=+card.dataset.i; CARDS[i].open=!CARDS[i].open; render();
  });
  // 호버로도 살짝 미리보기(데스크톱) — 클릭이 고정
  $('cards').addEventListener('mouseover',function(e){
    var head=e.target.closest('.tpc-head'); if(!head) return;
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
