// ===== global-class-blackbox 엔진 JS — Global Class 정적 메서드 블랙박스 호출 (CH10-L05) =====
// 이미 만들어진 ZCL_BOOKING_CALC=>GET_REMAINING을 내부 안 열고 입력/출력 계약만 보고 호출. (로직 내장)
// 호출문을 실제 ABAP 코드로 렌더한다 — 이 레슨의 핵심 문법(클래스=>메서드 · 이름 붙여 넘기기 ·
// RETURNING은 대입으로 받기)을 시나리오마다 눈으로 확인할 수 있게. 결과 변수는 전역 위치라 gv_(R11).
(function(){
  var $=function(id){return document.getElementById(id);};
  var showContract=false;
  var mode='idle';   // idle | normal | missing | static

  var K=function(s){return '<span class="k">'+s+'</span>';};
  var S=function(s){return '<span class="s">'+s+'</span>';};
  var C=function(s){return '<span class="c">'+s+'</span>';};

  function codeHTML(){
    var arrow = (mode==='static') ? '<span class="hot">=&gt;</span>' : '=&gt;';
    var head = K('DATA') + ' gv_left ' + K('TYPE') + ' i.\n\n'
             + 'gv_left = zcl_booking_calc' + arrow + 'get_remaining(';
    if(mode==='missing'){
      return head + '\n'
        + '            iv_concert = ' + S("'C001'") + ' ).'
        + '<span class="bad">   ✕ 필수 입력 iv_perf가 빠진 채 닫혔다 → 호출 오류</span>';
    }
    return head + '\n'
      + '            iv_concert = ' + S("'C001'") + '\n'
      + '            iv_perf    = ' + S("'001'") + ' ).'
      + (mode==='normal' ? C('   " 돌려받은 값이 gv_left에 담긴다') : '');
  }

  function render(){
    $('contract').className='contract'+(showContract?' show':'');
    $('btnContract').classList.toggle('on',showContract);
    $('callCode').innerHTML=codeHTML();
    postHeight();
  }
  function setResult(val, idle){
    $('resVal').className='resval'+(idle?' idle':'');
    $('resVal').textContent = idle? '(미호출)' : val;
  }

  $('btnContract').addEventListener('click',function(){ showContract=!showContract; render(); });
  $('btnNormal').addEventListener('click',function(){
    mode='normal'; setResult('4');
    $('msg').className='msg ok';
    $('msg').innerHTML='정상 호출 — 내부 구현을 몰라도 공개 계약(IMPORTING + RETURNING)이 맞으면 <code>gv_left = 4</code>를 받습니다.';
    render();
  });
  $('btnMissing').addEventListener('click',function(){
    mode='missing'; setResult('—', true);
    $('msg').className='msg err';
    $('msg').innerHTML='호출 오류 — 필수 IMPORTING <code>iv_perf</code>가 빠졌습니다. 계약에 명시된 입력은 모두 채워야 합니다.';
    render();
  });
  $('btnStatic').addEventListener('click',function(){
    mode='static';
    $('msg').className='msg ok';
    $('msg').innerHTML='<code>GET_REMAINING</code>은 <b>CLASS-METHODS</b>(static) → 객체 생성 없이 <code>=&gt;</code>로 호출합니다(위 코드에서 강조된 자리). 인스턴스 메서드라면 객체를 먼저 만들고 <code>-&gt;</code>로 불러야 하는데, 그건 <a href="../../docs/abap/pages/CH21-L01.html" target="_top">Chapter 21 · OO 기초</a>에서 배웁니다.';
    render();
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  setResult('—', true); render();
})();
