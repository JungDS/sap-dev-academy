// ===== module-choice-cards 엔진 JS — 상황별 모듈화 도구 선택(N지선다) (CH10-L06) =====
// 상황 카드를 여러 도구 중 하나로 분류하면 정답·이유를 보여 준다. 데이터=window.MCC_CFG.
//   MCC_CFG = { choices:[{key,label}], cards:[{q, ans(key), why}] }
(function(){
  var cfg = window.MCC_CFG || {};
  var CHOICES = cfg.choices || [];
  var CARDS = cfg.cards || [];
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function label(key){ var c=CHOICES.filter(function(x){return x.key===key;})[0]; return c?c.label:key; }

  var answered={};

  function render(){
    $('cards').innerHTML = CARDS.map(function(c,i){
      var chosen=answered[i], done=chosen!=null, correct=done&&chosen===c.ans;
      var btns=CHOICES.map(function(ch){
        var cls='cbtn'; if(chosen===ch.key) cls+=' chosen';
        if(done){ if(ch.key===c.ans) cls+=' right'; else if(chosen===ch.key) cls+=' wrong'; }
        return '<button class="'+cls+'" data-i="'+i+'" data-k="'+ch.key+'" '+(done?'disabled':'')+'>'+esc(ch.label)+'</button>';
      }).join('');
      var fb = done ? '<div class="fb '+(correct?'ok':'no')+'">'+(correct?'✓ 정답':'✕ 정답: '+esc(label(c.ans)))+' — '+esc(c.why)+'</div>' : '';
      return '<div class="card'+(done?' done':'')+'"><div class="card__q">'+esc(c.q)+'</div><div class="choices">'+btns+'</div>'+fb+'</div>';
    }).join('');
    var ans=Object.keys(answered).length;
    var ok=CARDS.filter(function(c,i){return answered[i]===c.ans;}).length;
    $('score').textContent='정답 '+ok+' / '+CARDS.length+(ans<CARDS.length?'  (푼 문제 '+ans+')':'');
    postHeight();
  }

  $('cards').addEventListener('click',function(e){
    var b=e.target.closest('.cbtn'); if(!b||b.disabled) return;
    var i=+b.dataset.i; if(answered[i]!=null) return;
    answered[i]=b.dataset.k; render();
  });
  $('reset').addEventListener('click',function(){ answered={}; render(); });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
