// ===== perform-call-map 엔진 JS — PERFORM/FORM 호출 점프와 스코프 (CH10-L01) =====
// PERFORM에서 FORM으로 들어갔다 돌아오는 흐름과 전역/로컬 변수 수명을 스크립트로 한 단계씩 보여 준다.
// 코드/스텝은 엔진에 내장(이 레슨 고유). "정의 누락" 토글로 미정의 subroutine 오류 체험.
(function(){
  var $=function(id){return document.getElementById(id);};
  // 코드 = 본문 CH10-L01 '전역 변수와 로컬 변수' 절의 프로그램 한 벌(z_form_scope)과 문장 단위로 일치.
  var MAIN=[
    {t:'<span class="tok-kw">REPORT</span> z_form_scope.'},
    {t:''},
    {t:'<span class="tok-kw">DATA</span> gv_total_calls <span class="tok-kw">TYPE</span> i.'},
    {t:''},
    {t:'<span class="tok-kw">START-OF-SELECTION</span>.'},
    {t:'  <span class="tok-kw">PERFORM</span> count_call.   <span class="tok-com">" 1번째</span>'},
    {t:'  <span class="tok-kw">PERFORM</span> count_call.   <span class="tok-com">" 2번째</span>'},
    {t:'  <span class="tok-kw">WRITE</span>: / <span class="tok-str">\'전역 누적:\'</span>, gv_total_calls.'}
  ];
  var FORM=[
    {t:'<span class="tok-kw">FORM</span> count_call.'},
    {t:'  <span class="tok-kw">DATA</span> lv_local_calls <span class="tok-kw">TYPE</span> i.'},
    {t:'  gv_total_calls = gv_total_calls + 1.'},
    {t:'  lv_local_calls = lv_local_calls + 1.'},
    {t:'  <span class="tok-kw">WRITE</span>: / <span class="tok-str">\'이번 호출 로컬:\'</span>, lv_local_calls.'},
    {t:'<span class="tok-kw">ENDFORM</span>.'}
  ];
  // 스텝: loc('main'|'form'), line, gv, lv(null=로컬없음), stack(0|1), note, kind
  // ※ FORM 안 실행줄(0·2·3·4·5)을 하나도 건너뛰지 않는다 — 줄과 스텝이 1:1.
  var STEPS=[
    {loc:'main',line:5, gv:0, lv:null, stack:0, note:'PERFORM count_call (1번째) — 호출 준비', kind:''},
    {loc:'form',line:0, gv:0, lv:0,    stack:1, note:'호출: count_call 블록으로 이동', kind:'jump'},
    {loc:'form',line:1, gv:0, lv:0,    stack:1, note:'DATA — 로컬 lv_local_calls가 이 호출용으로 새로 생성(0)', kind:''},
    {loc:'form',line:2, gv:1, lv:0,    stack:1, note:'gv_total_calls = 1 (전역, 누적)', kind:''},
    {loc:'form',line:3, gv:1, lv:1,    stack:1, note:'lv_local_calls = 1 (로컬)', kind:''},
    {loc:'form',line:4, gv:1, lv:1,    stack:1, note:"WRITE — '이번 호출 로컬: 1' 출력", kind:''},
    {loc:'form',line:5, gv:1, lv:1,    stack:1, note:'ENDFORM — 복귀: 호출 다음 줄로 (로컬 변수는 여기서 사라진다)', kind:'ret'},
    {loc:'main',line:6, gv:1, lv:null, stack:0, note:'PERFORM count_call (2번째) — 호출 준비', kind:''},
    {loc:'form',line:0, gv:1, lv:0,    stack:1, note:'호출: 다시 count_call 블록으로 이동', kind:'jump'},
    {loc:'form',line:1, gv:1, lv:0,    stack:1, note:'DATA — 지난 호출 값은 사라졌다. 또 0으로 새로 생성', kind:''},
    {loc:'form',line:2, gv:2, lv:0,    stack:1, note:'gv_total_calls = 2 (계속 누적)', kind:''},
    {loc:'form',line:3, gv:2, lv:1,    stack:1, note:'lv_local_calls = 1 (또 1 — 매번 새로 생겨서)', kind:''},
    {loc:'form',line:4, gv:2, lv:1,    stack:1, note:"WRITE — 또 '이번 호출 로컬: 1' (2가 아니다)", kind:''},
    {loc:'form',line:5, gv:2, lv:1,    stack:1, note:'ENDFORM — 복귀', kind:'ret'},
    {loc:'main',line:7, gv:2, lv:null, stack:0, note:'전역 누적: 2 (로컬은 매번 1) — 스코프 차이!', kind:'ret'}
  ];
  var idx=-1, missing=false;

  function renderCode(){
    $('mainBlk').innerHTML = MAIN.map(function(l,i){
      var cur=(idx>=0 && STEPS[idx].loc==='main' && STEPS[idx].line===i);
      return '<div class="cline'+(cur?' cur':'')+'"><span class="ln">'+(i+1)+'</span><span class="tx">'+l.t+'</span></div>';
    }).join('');
    $('formBlk').style.display = missing?'none':'block';
    $('formMissing').style.display = missing?'block':'none';
    if(!missing){
      $('formLines').innerHTML = FORM.map(function(l,i){
        var cur=(idx>=0 && STEPS[idx].loc==='form' && STEPS[idx].line===i);
        return '<div class="cline'+(cur?' cur':'')+'"><span class="ln">'+(i+1)+'</span><span class="tx">'+l.t+'</span></div>';
      }).join('');
    }
  }
  function renderSide(){
    var s = idx>=0 ? STEPS[idx] : {gv:0, lv:null, stack:0, note:'▶ 시작을 눌러 한 단계씩 따라가 보세요.', kind:''};
    $('gv').innerHTML='<div class="var"><span>gv_total_calls</span><b>'+s.gv+'</b></div>';
    $('lv').innerHTML = s.lv==null
      ? '<div class="gone">(FORM 밖 — 로컬 변수 없음)</div>'
      : '<div class="var local"><span>lv_local_calls</span><b>'+s.lv+'</b></div>';
    $('stack').innerHTML = s.stack>0
      ? '<div class="stkitem">count_call</div><div class="stkitem" style="opacity:.6">(main)</div>'
      : '<div class="stkitem" style="opacity:.6">(main)</div>';
    $('noteStep').className='note-step '+(s.kind||'');
    $('noteStep').textContent=s.note;
  }
  function render(){ renderCode(); renderSide(); postHeight(); }

  function start(){ if(missing){ showErr(); return; } idx=0; render(); upd(); }
  function next(){ if(missing){ showErr(); return; } if(idx<STEPS.length-1){ idx++; render(); } upd(); }
  function reset(){ idx=-1; render(); upd(); }
  function upd(){ $('btnNext').disabled = missing || idx>=STEPS.length-1; }
  function showErr(){
    $('noteStep').className='note-step err';
    $('noteStep').textContent='런타임 오류: 정의되지 않은 subroutine "count_call"을 호출했습니다. (FORM 정의가 없음)';
    postHeight();
  }

  $('btnStart').addEventListener('click', start);
  $('btnNext').addEventListener('click', next);
  $('btnReset').addEventListener('click', reset);
  $('missChk').addEventListener('change',function(e){ missing=e.target.checked; idx=-1; render(); upd(); if(missing) showErr(); });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render(); upd();
})();
