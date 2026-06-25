// ===== validation-router 엔진 JS — 검증 책임(DDIC vs 프로그램) 분류 (CH09-L08) =====
// 상황 카드를 DDIC/프로그램으로 분류하면 정답·해설을 보여 준다. 데이터=window.VR_CFG.
//   VR_CFG = { cards:[{q, ans:'DDIC'|'PROG', why}] }
(function(){
  var cfg = window.VR_CFG || {};
  var CARDS = cfg.cards || [];
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var answered={};   // idx -> chosen

  function render(){
    $('cards').innerHTML = CARDS.map(function(c,i){
      var chosen=answered[i];
      var done = chosen!=null;
      var correct = done && chosen===c.ans;
      function btn(val,label){
        var cls='cbtn'; if(chosen===val) cls+=' chosen';
        if(done){ if(val===c.ans) cls+=' right'; else if(chosen===val) cls+=' wrong'; }
        return '<button class="'+cls+'" data-i="'+i+'" data-c="'+val+'" '+(done?'disabled':'')+'>'+label+'</button>';
      }
      var fb = done
        ? '<div class="fb '+(correct?'ok':'no')+'">'+(correct?'✓ 정답':'✕ 정답은 '+(c.ans==='DDIC'?'DDIC':'프로그램'))+' — '+esc(c.why)+'</div>'
        : '';
      return '<div class="card'+(done?' done':'')+'"><div class="card__q">'+esc(c.q)+'</div>'
        +'<div class="choices">'+btn('DDIC','DDIC가 검증')+btn('PROG','프로그램이 검증')+'</div>'+fb+'</div>';
    }).join('');
    var ans=Object.keys(answered).length;
    var ok=CARDS.filter(function(c,i){return answered[i]===c.ans;}).length;
    $('score').textContent='정답 '+ok+' / '+CARDS.length+(ans<CARDS.length?'  (푼 문제 '+ans+')':'');
    postHeight();
  }

  $('cards').addEventListener('click',function(e){
    var b=e.target.closest('.cbtn'); if(!b||b.disabled) return;
    var i=+b.dataset.i; if(answered[i]!=null) return;
    answered[i]=b.dataset.c; render();
  });
  $('reset').addEventListener('click',function(){ answered={}; render(); });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
