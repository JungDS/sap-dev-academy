// ===== concert-model-checklist 엔진 JS — 콘서트 모델(DDIC) 제작 체크리스트 (CH09-L09) =====
// 제작 단계를 클릭으로 진행(미작성→작성→활성화→검증완료)하고, 관계 미리보기·테스트 결과가
// 선행 단계 완료에 **실제로** 의존한다. 데이터=window.CMC_CFG.
//   CMC_CFG = {
//     steps: [{key, n, sub}],                       // 왼쪽 단계 카드(본문 제작 순서와 1:1)
//     boxes: [{el, needs:[stepKey..]}],             // 미리보기 테이블 상자 — needs가 '작성'(>=1) 이상이면 점등
//     rels:  [{el, needs:[stepKey..]}],             // 관계 화살표 — needs가 '활성화'(>=2) 이상이면 점등(관계당 단계 하나)
//     tests: [{t, core:[..], extra:[..], ok, partial, none}]
//   }
// 판정 규칙(C010): core 중 하나라도 활성화 안 됐으면 실패 + **빠진 단계 이름을 그대로** 알려 준다.
//   core는 됐는데 extra가 빠지면 중간 결과(△) — "되긴 되는데 반쪽"을 구분해 보여 준다.
//   즉 테이블이 전부 미작성인 상태에서 성공하는 테스트는 하나도 없다.
(function(){
  var cfg = window.CMC_CFG || {};
  var STATS=['미작성','작성','활성화','검증완료'];
  var STEPS = cfg.steps || [];
  var BOXES = cfg.boxes || [];
  var RELS  = cfg.rels  || [];
  var TESTS = cfg.tests || [];
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var st={}; STEPS.forEach(function(s){ st[s.key]=0; });

  function renderSteps(){
    $('steps').innerHTML = STEPS.map(function(s){
      var v=st[s.key];
      return '<div class="step" data-k="'+s.key+'"><div><div class="step__n">'+s.n+'</div><div class="step__sub">'+s.sub+'</div></div>'
        +'<div class="stat s'+v+'">'+STATS[v]+'</div></div>';
    }).join('');
  }
  function renderProg(){
    var total=STEPS.length*3, sum=STEPS.reduce(function(a,s){return a+st[s.key];},0);
    $('prog').style.width=(total? Math.round(sum/total*100):0)+'%';
  }
  function on(k){ return st[k]>=2; }                       // 활성화 이상이면 동작
  function drawn(k){ return st[k]>=1; }                    // 작성만 해도 그림엔 나온다
  function stepName(k){ var s=STEPS.filter(function(x){return x.key===k;})[0]; return s?s.n:k; }
  function missing(keys, fn){ return (keys||[]).filter(function(k){ return !fn(k); }); }

  function renderPreview(){
    BOXES.forEach(function(b){
      var el=$(b.el); if(!el) return;
      el.classList.toggle('on', missing(b.needs, drawn).length===0);
    });
    RELS.forEach(function(r){
      var el=$(r.el); if(!el) return;
      el.classList.toggle('on', missing(r.needs, on).length===0);
    });
  }
  function render(){ renderSteps(); renderProg(); renderPreview(); postHeight(); }

  $('steps').addEventListener('click',function(e){
    var s=e.target.closest('.step'); if(!s) return;
    var k=s.dataset.k; st[k]=(st[k]+1)%4; render();
  });
  $('fillAll').addEventListener('click',function(){ STEPS.forEach(function(s){ st[s.key]=3; }); render(); });
  $('clearAll').addEventListener('click',function(){ STEPS.forEach(function(s){ st[s.key]=0; }); $('tout').className='tout'; $('tout').textContent=''; render(); });

  function names(keys){ return keys.map(function(k){ return '<b>'+esc(stepName(k))+'</b>'; }).join(' · '); }
  function test(kind){
    var o=$('tout');
    var t=TESTS.filter(function(x){return x.t===kind;})[0];
    if(!t){ o.className='tout'; o.textContent=''; postHeight(); return; }
    var lackCore=missing(t.core, on);
    if(lackCore.length){
      o.className='tout no';
      o.innerHTML=(t.none||'아직 확인할 수 없습니다')+' — '+names(lackCore)+' 단계가 활성화되지 않았습니다.';
    } else {
      var lackExtra=missing(t.extra, on);
      if(lackExtra.length){
        o.className='tout mid';
        o.innerHTML=t.partial+' <span class="lack">빠진 단계: '+names(lackExtra)+'</span>';
      } else {
        o.className='tout ok'; o.innerHTML=t.ok;
      }
    }
    postHeight();
  }
  $('tbtns').addEventListener('click',function(e){ var b=e.target.closest('.tbtn'); if(b) test(b.dataset.t); });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
