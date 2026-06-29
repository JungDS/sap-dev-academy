// ===== rap-layer-assembler 엔진 JS — RAP 계층 조립 보드 (CH23-L01) =====
// 6계층 토글(root/proj/bdef/pool/svcdef/svcbind)→스택 채움. 빠진 계층마다 "어떤 사용자 행동이 불가능한가" 표시.
// 다 채우면 RAP BO 완성(ok). 아니면 누락 결과(warn). 데이터 내장. 교훈3: verdict base 중립 rgba.
(function(){
  var $=function(id){return document.getElementById(id);};
  // 스택 표시 순서(위→아래)
  var LAYERS=[
    {k:'svcbind', nm:'Service Binding', role:'OData protocol 연결', miss:'OData URL이 없어 Fiori가 호출할 수 없습니다.'},
    {k:'svcdef',  nm:'Service Definition', role:'노출할 entity 선언', miss:'무엇을 서비스로 노출할지 정의가 없습니다.'},
    {k:'proj',    nm:'ZC_Booking (Projection)', role:'외부 소비 모델', miss:'외부에 보여 줄 소비 모델이 없습니다.'},
    {k:'bdef',    nm:'BDEF (Behavior Definition)', role:'허용 operation 선언', miss:'create/update/delete 선언이 없어 예매 생성·수정·취소가 불가합니다.'},
    {k:'pool',    nm:'Behavior Pool', role:'동작 코드 구현', miss:'validation/action 코드를 둘 곳이 없어 정원 검증·취소 액션을 구현할 수 없습니다.'},
    {k:'root',    nm:'ZI_Booking (Root View)', role:'업무 객체의 뿌리', miss:'업무 객체의 뿌리가 없어 RAP BO 자체가 성립하지 않습니다.'}
  ];
  // 토글 버튼은 build 순서(아래→위)
  var ORDER=[
    {k:'root', label:'① Root View'},
    {k:'proj', label:'② Projection'},
    {k:'bdef', label:'③ BDEF'},
    {k:'pool', label:'④ Behavior Pool'},
    {k:'svcdef', label:'⑤ Service Def'},
    {k:'svcbind', label:'⑥ Service Binding'}
  ];
  var st={ root:false, proj:false, bdef:false, pool:false, svcdef:false, svcbind:false };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function renderCtrl(){
    $('ralCtrl').innerHTML=ORDER.map(function(o){
      return '<button class="ral-tog'+(st[o.k]?' on':'')+'" data-k="'+o.k+'">'+esc(o.label)+(st[o.k]?' ✓':'')+'</button>';
    }).join('')+'<button class="ral-reset" id="ralReset">↺ 리셋</button>';
  }
  function renderStack(){
    var html='<p class="ral-cap">▲ Fiori Elements / OData Client</p>';
    html+=LAYERS.map(function(l){
      var on=st[l.k];
      return '<div class="ral-layer '+(on?'present':'missing')+'">'+
        '<span class="ral-layer__ic">'+(on?'●':'○')+'</span>'+
        '<span class="ral-layer__nm">'+esc(l.nm)+(on?'':' (빠짐)')+'</span>'+
        '<span class="ral-layer__role">'+esc(l.role)+'</span></div>';
    }).join('');
    html+='<div class="ral-layer db"><span class="ral-layer__ic">▦</span><span class="ral-layer__nm">DB Table (ZBOOKING)</span><span class="ral-layer__role">지속 데이터</span></div>';
    $('ralStack').innerHTML=html;
  }
  function renderVerdict(){
    var missing=LAYERS.filter(function(l){ return !st[l.k]; });
    var v=$('ralVerdict');
    if(!missing.length){
      v.className='ral-verdict ok';
      v.innerHTML='<b>RAP BO 완성 🎉</b> 6계층이 모두 이어졌습니다 — Fiori Elements/OData 클라이언트가 예매를 <b>생성·수정·취소·검증</b>할 수 있습니다.';
      return;
    }
    v.className='ral-verdict warn';
    v.innerHTML='<b>빠진 계층이 '+missing.length+'개</b> — 각각이 없으면 이런 사용자 행동이 막힙니다:'+
      '<ul>'+missing.map(function(l){ return '<li><code>'+esc(l.nm.split(' ')[0])+'</code> — '+esc(l.miss)+'</li>'; }).join('')+'</ul>';
  }
  function render(){ renderCtrl(); renderStack(); renderVerdict(); }

  $('ralCtrl').addEventListener('click',function(e){
    var r=e.target.closest('#ralReset');
    if(r){ st={root:false,proj:false,bdef:false,pool:false,svcdef:false,svcbind:false}; render(); return; }
    var b=e.target.closest('.ral-tog'); if(!b) return;
    st[b.dataset.k]=!st[b.dataset.k]; render();
  });

  render();
})();
