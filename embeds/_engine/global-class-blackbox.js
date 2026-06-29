// ===== global-class-blackbox 엔진 JS — Global Class 정적 메서드 블랙박스 호출 (CH10-L05) =====
// 이미 만들어진 ZCL_BOOKING_CALC=>GET_REMAINING을 내부 안 열고 입력/출력 계약만 보고 호출. (로직 내장)
(function(){
  var $=function(id){return document.getElementById(id);};
  var showContract=false;

  function render(){
    $('contract').className='contract'+(showContract?' show':'');
    $('btnContract').classList.toggle('on',showContract);
    postHeight();
  }
  function setResult(val, idle){
    $('resVal').className='resval'+(idle?' idle':'');
    $('resVal').textContent = idle? '(미호출)' : val;
  }

  $('btnContract').addEventListener('click',function(){ showContract=!showContract; render(); });
  $('btnNormal').addEventListener('click',function(){
    setResult('4');
    $('msg').className='msg ok';
    $('msg').innerHTML='정상 호출 — 내부 구현을 몰라도 공개 계약(IMPORTING + RETURNING)이 맞으면 <code>lv_left = 4</code>를 받습니다.';
  });
  $('btnMissing').addEventListener('click',function(){
    setResult('—', true);
    $('msg').className='msg err';
    $('msg').innerHTML='호출 오류 — 필수 IMPORTING <code>iv_perf</code>가 빠졌습니다. 계약에 명시된 입력은 모두 채워야 합니다.';
  });
  $('btnStatic').addEventListener('click',function(){
    $('msg').className='msg ok';
    $('msg').innerHTML='<code>GET_REMAINING</code>은 <b>CLASS-METHODS</b>(static) → 객체 생성 없이 <code>=&gt;</code>로 호출합니다. 인스턴스 메서드라면 <code>-&gt;</code>가 필요(→ CH20).';
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  setResult('—', true); render();
})();
