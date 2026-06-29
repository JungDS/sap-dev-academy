// ===== call-function-box 엔진 JS — CALL FUNCTION 계약 상자 (CH10-L03) =====
// 호출자 기준 EXPORTING/IMPORTING/CHANGING/EXCEPTIONS 방향과 sy-subrc 분기를 보여 준다.
// "함수 내부 기준" 관점은 흔한 실수로 경고. EXCEPTIONS 제거 실험 포함. (이 레슨 고유 — 로직 내장)
(function(){
  var $=function(id){return document.getElementById(id);};
  var persp='caller';     // caller | fm
  var noExc=false;        // EXCEPTIONS 매핑 제거
  var scenario='normal';  // normal | negative

  // 방향 라벨(관점별)
  function params(){
    var caller = (persp==='caller');
    return [
      {cls:'exp', kw:'EXPORTING', arr:caller?'→':'←', dir:'iv_amount', desc:caller?'호출자가 FM으로 내보내는 값':'(잘못된 읽기) FM이 받는 값'},
      {cls:'imp', kw:'IMPORTING', arr:caller?'←':'→', dir:'ev_result', desc:caller?'호출자가 FM에서 받아오는 값':'(잘못된 읽기) FM이 내보내는 값'},
      {cls:'chg', kw:'CHANGING',  arr:'↔', dir:'cv_log', desc:'넘겨서 바뀐 뒤 돌아오는 값'},
      {cls:'exc', kw:'EXCEPTIONS', arr:'!', dir: noExc?'(제거됨)':'invalid_amount=1 · OTHERS=2', desc: noExc?'매핑 없음 — 분기 불가':'classic 예외를 sy-subrc로 매핑'}
    ];
  }

  function renderIface(){
    $('iface').innerHTML = params().map(function(p){
      return '<div class="param '+p.cls+'"><div class="dir"><span class="arr">'+p.arr+'</span>'+p.kw+'</div>'
        +'<div class="desc"><code style="font-family:var(--mono)">'+p.dir+'</code> — '+p.desc+'</div></div>';
    }).join('');
    $('perspWarn').className='perspwarn'+(persp==='fm'?' show':'');
    $('perspWarn').innerHTML='⚠ 가장 흔한 실수 — EXPORTING/IMPORTING을 <b>함수 내부 기준</b>으로 읽는 것. 항상 <b>호출자 기준</b>으로 읽으세요.';
  }

  function run(){
    var amount = scenario==='normal' ? 1000 : -1;
    var result, log, subrc, msgCls, msg;
    if(scenario==='normal'){
      result=Math.round(amount*1.1); log='OK'; subrc=0; msgCls='ok';
      msg='정상 — <code>sy-subrc = 0</code>, 세금 포함 금액 <code>'+result+'</code>.';
    } else {
      // 음수: invalid_amount
      result=0; log='ERR';
      if(noExc){ subrc=0; msgCls='no'; msg='⚠ EXCEPTIONS를 매핑하지 않아 예외를 <b>sy-subrc로 분기하지 못합니다</b> — 잘못된 결과로 흐름이 계속될 수 있습니다.'; }
      else { subrc=1; msgCls='no'; msg='예외 발생 — <code>invalid_amount</code> → <code>sy-subrc = 1</code>. 결과는 채워지지 않음.'; }
    }
    $('vAmount').innerHTML='iv_amount → <b>'+amount+'</b>';
    $('vResult').innerHTML='ev_result ← <b>'+(scenario==='normal'?result:'(미변경)')+'</b>';
    $('vLog').innerHTML='cv_log ↔ <b>'+log+'</b>';
    $('subrc').innerHTML='sy-subrc = <span class="'+(subrc===0?'ok':'no')+'">'+subrc+'</span>';
    $('msg').className='msg '+msgCls; $('msg').innerHTML=msg;
    postHeight();
  }

  $('btnNormal').addEventListener('click',function(){ scenario='normal'; mark(); run(); });
  $('btnNeg').addEventListener('click',function(){ scenario='negative'; mark(); run(); });
  $('excChk').addEventListener('change',function(e){ noExc=e.target.checked; renderIface(); run(); });
  $('persp').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; persp=b.dataset.p;
    $('persp').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);}); renderIface(); postHeight(); });
  function mark(){ $('btnNormal').classList.toggle('on',scenario==='normal'); $('btnNeg').classList.toggle('on',scenario==='negative'); }

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  renderIface(); mark(); run();
})();
