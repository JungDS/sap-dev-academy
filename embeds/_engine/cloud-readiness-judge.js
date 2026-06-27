// ===== cloud-readiness-judge 엔진 JS — ABAP Cloud 준비도 판정 카드 (CH23-L08) =====
// 개발 시나리오를 Cloud-ready/제한됨으로 판정 + 제한 시 대안. released API·restricted scope·Clean Core.
// classic은 온프레미스 유지보수에 필요·cloud-ready 신규는 RAP/CDS/released API. 데이터 내장. 교훈3: 피드백 ok/bad.
(function(){
  var $=function(id){return document.getElementById(id);};
  var CARDS=[
    {id:'c1', text:'표준 테이블 <code>ZBOOKING</code>을 SQL로 직접 UPDATE', ready:false,
      why:'비released 테이블 직접 수정은 Clean Core 위반입니다.', alt:'RAP BO나 released API를 통해 변경을 처리하세요.'},
    {id:'c2', text:'released CDS view(<code>I_*</code>)를 SELECT로 소비', ready:true,
      why:'release된 객체만 ABAP Cloud에서 접근할 수 있습니다.'},
    {id:'c3', text:'Dynpro(SAP GUI) 화면을 새로 개발', ready:false,
      why:'SAP GUI 전용 흐름은 ABAP Cloud에서 제한됩니다.', alt:'Fiori Elements + RAP service로 화면을 만드세요.'},
    {id:'c4', text:'RAP service를 OData로 노출', ready:true,
      why:'RAP는 ABAP Cloud의 트랜잭션 프로그래밍 모델입니다.'},
    {id:'c5', text:'익숙한 <code>CL_*</code> 클래스를 release 확인 없이 호출', ready:false,
      why:'이름이 익숙해도 released가 아니면 cloud에서 못 씁니다.', alt:'시스템의 API release 정보를 확인하고 released API를 쓰세요.'}
  ];
  var st={ picks:{} };   // id → true(cloud-ready) / false(제한됨)

  function renderCards(){
    $('crjCards').innerHTML=CARDS.map(function(c){
      var pick=st.picks[c.id];
      function opt(val,label){
        var vb=(val==='true');
        var cls=''; if(pick!==undefined && pick===vb) cls=(vb===c.ready?'sel-ok':'sel-bad');
        return '<button class="crj-opt '+cls+'" data-c="'+c.id+'" data-v="'+val+'">'+label+'</button>';
      }
      var fb='';
      if(pick!==undefined){
        var ok=(pick===c.ready);
        fb='<div class="crj-fb '+(ok?'ok':'bad')+'">'+(ok?'✓ ':'✕ ')+(c.ready?'Cloud-ready':'제한됨')+' — '+c.why+'</div>';
        if(!c.ready) fb+='<span class="crj-alt">↳ 대안: '+c.alt+'</span>';
      }
      return '<div class="crj-card"><p class="crj-card__t">'+c.text+'</p><div class="crj-opts">'+opt('true','Cloud-ready ✓')+opt('false','제한됨 ✗')+'</div>'+fb+'</div>';
    }).join('');
  }
  function renderScore(){
    var done=Object.keys(st.picks).length, correct=CARDS.filter(function(c){return st.picks[c.id]===c.ready;}).length;
    var s=$('crjScore');
    if(done<CARDS.length){ s.className='crj-score'; s.innerHTML='각 시나리오가 ABAP Cloud에서 되는지 판정해 보세요 ('+done+'/'+CARDS.length+'). released 여부는 <b>이름으로 추측하면 안 됩니다.</b>'; return; }
    if(correct===CARDS.length){ s.className='crj-score ok'; s.innerHTML='<b>전부 정답 🎉</b> 핵심은 서버 위치가 아니라 <b>released API·restricted scope·RAP 중심</b> 개발입니다.'; }
    else { s.className='crj-score warn'; s.innerHTML='<b>'+correct+'/'+CARDS.length+' 정답.</b> 틀린 카드의 대안을 다시 보세요 — Clean Core는 "확장 금지"가 아니라 "표준을 안 깨고 확장"입니다.'; }
  }
  function render(){ renderCards(); renderScore(); }

  $('crjCards').addEventListener('click',function(e){
    var b=e.target.closest('.crj-opt'); if(!b) return;
    st.picks[b.dataset.c]=(b.dataset.v==='true'); render();
  });

  render();
})();
