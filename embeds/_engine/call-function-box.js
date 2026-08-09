// ===== call-function-box 엔진 JS — CALL FUNCTION 계약 상자 (CH10-L03) =====
// 호출자 기준 EXPORTING/IMPORTING/EXCEPTIONS 방향과 sy-subrc 분기를 보여 준다.
// "함수 내부 기준" 관점은 흔한 실수로 경고. EXCEPTIONS 제거 실험 포함(= 미매핑 예외는 덤프).
// FM 이름·예외 이름·수신 변수는 본문 CH10-L03의 CALL FUNCTION 'Z_ADD_TAX' 예제와 동일. (이 레슨 고유 — 로직 내장)
(function(){
  var $=function(id){return document.getElementById(id);};
  var persp='caller';     // caller | fm
  var noExc=false;        // EXCEPTIONS 매핑 제거
  var scenario='normal';  // normal | negative

  // 방향 라벨(관점별) — 본문 예제에 있는 절만(EXPORTING·IMPORTING·EXCEPTIONS)
  function params(){
    var caller = (persp==='caller');
    return [
      {cls:'exp', kw:'EXPORTING', arr:caller?'→':'←', dir:'iv_amount', desc:caller?'호출자가 FM으로 내보내는 값':'(잘못된 읽기) FM이 받는 값'},
      {cls:'imp', kw:'IMPORTING', arr:caller?'←':'→', dir:'ev_result = gv_out', desc:caller?'호출자가 FM에서 받아오는 값(gv_out에 담긴다)':'(잘못된 읽기) FM이 내보내는 값'},
      {cls:'exc', kw:'EXCEPTIONS', arr:'!', dir: noExc?'(한 줄도 안 적음)':'invalid = 1 · OTHERS = 2', desc: noExc?'매핑 없음 — 예외가 나면 sy-subrc가 아니라 덤프':'classic 예외를 sy-subrc 번호로 매핑'}
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
    var result, subrc, msgCls, msg, dumped=false;
    if(scenario==='normal'){
      // 정상 경로에선 예외가 아예 발생하지 않으므로 EXCEPTIONS 유무와 무관하게 같은 결과.
      result=Math.round(amount*1.1); subrc=0; msgCls='ok';
      msg='정상 — <code>sy-subrc = 0</code>, 세금 포함 금액 <code>'+result+'</code>.';
    } else {
      result=0;
      if(noExc){
        // 미매핑 예외 = sy-subrc로 오지 않고 그 자리에서 런타임 오류(덤프)
        dumped=true; msgCls='no';
        msg='💥 <b>런타임 오류(덤프)</b> — <code>EXCEPTIONS</code>에 한 줄도 적지 않아 함수가 일으킨 '
          +'<code>invalid</code>가 <b><code>sy-subrc</code>로 돌아오지 못합니다</b>. 프로그램은 이 줄에서 즉시 멈추고, '
          +'다음 줄의 <code>IF sy-subrc &lt;&gt; 0</code>까지 <b>가지도 못합니다</b>.';
      }
      else { subrc=1; msgCls='no'; msg='예외 발생 — <code>invalid</code> → <code>sy-subrc = 1</code>. 결과는 채워지지 않고, 다음 줄에서 분기할 수 있습니다.'; }
    }
    $('vAmount').innerHTML='iv_amount → <b>'+amount+'</b>';
    $('vResult').innerHTML='gv_out ← <b>'+(dumped?'(도달 못 함)':(scenario==='normal'?result:'(미변경)'))+'</b>';
    $('subrc').innerHTML= dumped
      ? 'sy-subrc = <span class="no">(설정 안 됨 — 덤프)</span>'
      : 'sy-subrc = <span class="'+(subrc===0?'ok':'no')+'">'+subrc+'</span>';
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
