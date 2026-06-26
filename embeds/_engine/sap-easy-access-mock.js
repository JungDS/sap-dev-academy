// ===== sap-easy-access-mock 엔진 JS — SAP Easy Access 첫 화면 + 명령창 직행 데모 (CH01-L02) =====
// 명령창에 T-code를 입력하고 Enter(또는 Enter 버튼)를 누르면, Easy Access 화면이 그 트랜잭션 화면으로
// "직행"하는 걸 보여 준다(↩로 복귀). 정적 일러스트가 아니라 최소 인터랙션. 데이터=window.EAM_CFG.
(function(){
  var $=function(s){return document.querySelector(s);};
  var SCREENS = {
    SE38:{ic:'📝', name:'ABAP Editor',      desc:'실행형 프로그램(Report)을 작성·활성화·실행하는 화면입니다.'},
    SE11:{ic:'🗄️', name:'ABAP Dictionary',  desc:'테이블·데이터 타입 같은 데이터의 설계도를 만드는 화면입니다.'},
    SE80:{ic:'🧭', name:'Object Navigator', desc:'여러 개발 오브젝트를 트리로 묶어 오가는 화면입니다.'}
  };

  function navigate(code){
    code=(code||'').trim().toUpperCase();
    if(!code){ reset(); return; }
    var s=SCREENS[code];
    var tb=$('#tcodeBody');
    tb.innerHTML='<div class="eam-screen">'
      +'<span class="ic">'+(s?s.ic:'▶️')+'</span>'
      +'<div class="ttl">'+code+'<small>'+(s?s.name:'화면')+'</small></div>'
      +'<div class="desc">명령창에 <b>'+code+'</b> 입력 → 메뉴를 거치지 않고 이 화면으로 <b>직행</b>했습니다.'+(s?' '+s.desc:'')+'</div>'
      +'<button class="eam-back" id="back" type="button">↩ 처음 화면(Easy Access)으로</button>'
      +'</div>';
    $('#easyBody').style.display='none';
    tb.style.display='block';
    var b=tb.querySelector('#back'); if(b) b.addEventListener('click', reset);
    postHeight();
  }
  function reset(){
    var tb=$('#tcodeBody'); tb.style.display='none'; tb.innerHTML='';
    $('#easyBody').style.display='grid';
    postHeight();
  }

  var input=$('#cmd');
  if(input){
    input.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); navigate(input.value); } });
  }
  var ent=$('#enter'); if(ent) ent.addEventListener('click', function(){ navigate(input?input.value:''); });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  postHeight();
})();
