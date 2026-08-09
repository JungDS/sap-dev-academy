// ===== param-passing-board 엔진 JS — USING/CHANGING·VALUE 파라미터 이동 (CH10-L02) =====
// 전달 방식별로 호출자 원본이 보호되는지/바뀌는지 비교하고, RETURN·STATICS를 데모로 보여 준다.
// (이 레슨 고유 — 코드/로직 내장)
(function(){
  var $=function(id){return document.getElementById(id);};
  var ORIG=1000;
  // 모드별: kw, valuePass, changesOriginal, expl
  var MODES={
    uref:{label:'USING (ref)', changes:true, code:'USING iv_amount',
      expl:'<b>USING reference</b> — 원본과 연결된 채 넘어갑니다. FORM이 값을 바꾸면 <b>원본도 바뀝니다</b>(입력 의도라도 위험).'},
    uval:{label:'USING VALUE', changes:false, code:'USING VALUE(iv_amount)',
      expl:'<b>USING VALUE</b> — 복사본을 넘기므로 <b>원본이 보호</b>됩니다. 입력만 받는 값에 권장.'},
    cref:{label:'CHANGING (ref)', changes:true, code:'CHANGING cv_result',
      expl:'<b>CHANGING reference</b> — 결과를 돌려주려는 의도. 원본이 <b>바뀐 채</b> 돌아옵니다(정상).'},
    cval:{label:'CHANGING VALUE', changes:true, code:'CHANGING VALUE(cv_result)',
      expl:'<b>CHANGING VALUE</b> — 복사해 처리하고 <b>정상 종료 시</b> 원본으로 되돌립니다(중간 오류 땐 안 돌려줌).'}
  };
  var cur='uref';

  function render(){
    $('modes').querySelectorAll('.mbtn').forEach(function(b){ b.classList.toggle('on', b.dataset.m===cur); });
    var m=MODES[cur];
    var innerVal=Math.round(ORIG*1.1);   // FORM 내부에서 *1.1
    var afterVal=m.changes?innerVal:ORIG;
    $('vCaller').innerHTML='<span class="lbl">gv_amount (전)</span>'+ORIG;
    $('iface').innerHTML='<div style="font-family:var(--mono);font-size:.78rem;color:var(--brand);text-align:center;font-weight:700">'+m.code+'</div>'
      +'<div style="font-size:.7rem;color:var(--ink-soft);text-align:center;margin-top:5px">FORM 안: × 1.1</div>';
    $('vInner').innerHTML='<span class="lbl">FORM 내부</span>'+innerVal;
    var box=$('vAfter');
    box.className='vbox '+(m.changes?'changed':'safe');
    box.innerHTML='<span class="lbl">gv_amount (복귀 후)</span>'+afterVal;
    $('expl').className='expl '+(m.changes?'warn':'safe');
    $('expl').innerHTML=m.expl;
    postHeight();
  }
  $('modes').addEventListener('click',function(e){ var b=e.target.closest('.mbtn'); if(b){ cur=b.dataset.m; render(); } });

  // RETURN 데모 — 본문 FORM divide_safe(USING iv_a iv_b / CHANGING cv_r)를 PERFORM 문법 그대로 호출
  $('retDiv').addEventListener('click',function(){
    $('retOut').innerHTML='PERFORM divide_safe USING 10 0 CHANGING gv_r.\n'
      +'<span class="hot">  IF iv_b = 0. → 참이라 RETURN — 여기서 끝</span>\n'
      +'<span class="skip">  cv_r = iv_a / iv_b.   (실행 안 됨)</span>\n'
      +'결과 gv_r = 0  (cv_r을 건드리지 않아 처음 값 그대로)';
    postHeight();
  });
  $('retOk').addEventListener('click',function(){
    $('retOut').innerHTML='PERFORM divide_safe USING 10 2 CHANGING gv_r.\n'
      +'  IF iv_b = 0. → 거짓이라 RETURN 안 함\n'
      +'<span class="hot">  cv_r = 10 / 2 = 5</span>\n'
      +'결과 gv_r = 5';
    postHeight();
  });
  // STATICS 데모 — 본문 FORM count_visit / STATICS lv_count TYPE i
  var sv=0;
  $('stCall').addEventListener('click',function(){ sv++; $('stOut').innerHTML='PERFORM count_visit.  → <span class="hot">lv_count = '+sv+'</span>\n(STATICS라 호출이 끝나도 값이 남는다 — DATA였다면 매번 1)'; postHeight(); });
  $('stReset').addEventListener('click',function(){ sv=0; $('stOut').textContent='STATICS lv_count = 0 (초기)'; postHeight(); });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
