// ===== vda-classifier 엔진 JS — RAP Validation/Determination/Action 분류 + 실행 타임라인 (CH23-L07) =====
// 상황 카드를 V/D/A로 분류(목적·실행 시점). 타임라인: 요청→modify(determination)→save(validation)→커밋, action은 별도 lane.
// 입문자는 문법보다 실행 시점에서 자주 틀림. 데이터 내장. 교훈3: 카드 피드백 ok/bad·score base 중립.
(function(){
  var $=function(id){return document.getElementById(id);};
  var TYPE={V:'Validation',D:'Determination',A:'Action'};
  var CARDS=[
    {id:'s1', text:'예매 좌석 수가 회차 정원을 넘는다', ans:'V', why:'저장해도 되는지 검사 — 저장 전에 막아야 합니다(save sequence).'},
    {id:'s2', text:"생성 시 status를 'N'(신규)으로 기본값 설정", ans:'D', why:'값을 자동으로 채우는 로직 — on modify에서 실행됩니다.'},
    {id:'s3', text:"사용자가 '예매 취소' 버튼을 누른다", ans:'A', why:'사용자가 명시적으로 실행하는 업무 동작입니다.'},
    {id:'s4', text:'감사 필드 created_by를 자동으로 채운다', ans:'D', why:'값 자동 결정 — determination입니다.'}
  ];
  var st={ picks:{} };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function renderCards(){
    $('vdaCards').innerHTML=CARDS.map(function(c){
      var pick=st.picks[c.id];
      var opts=['V','D','A'].map(function(t){
        var cls=''; if(pick===t) cls=(t===c.ans?'sel-ok':'sel-bad');
        return '<button class="vda-opt '+cls+'" data-c="'+c.id+'" data-t="'+t+'">'+esc(TYPE[t])+'</button>';
      }).join('');
      var fb='';
      if(pick){ var ok=(pick===c.ans); fb='<div class="vda-fb '+(ok?'ok':'bad')+'">'+(ok?'✓ ':'✕ '+esc(TYPE[c.ans])+' — ')+esc(c.why)+'</div>'; }
      return '<div class="vda-card"><p class="vda-card__t">'+esc(c.text)+'</p><div class="vda-opts">'+opts+'</div>'+fb+'</div>';
    }).join('');
  }
  function renderScore(){
    var done=Object.keys(st.picks).length, correct=CARDS.filter(function(c){return st.picks[c.id]===c.ans;}).length;
    var s=$('vdaScore');
    if(done<CARDS.length){ s.className='vda-score'; s.innerHTML='상황을 V/D/A로 분류해 보세요 ('+done+'/'+CARDS.length+'). 입문자는 문법보다 <b>실행 시점</b>에서 자주 틀립니다.'; return; }
    if(correct===CARDS.length){ s.className='vda-score ok'; s.innerHTML='<b>전부 정답 🎉</b> 검사=Validation · 자동 채움=Determination · 사용자 실행=Action. 이 구분이 잡혀야 BDEF와 behavior pool을 읽을 수 있어요.'; }
    else { s.className='vda-score warn'; s.innerHTML='<b>'+correct+'/'+CARDS.length+' 정답.</b> 틀린 카드의 설명을 다시 보세요 — 핵심은 "언제·왜 실행되나"입니다.'; }
  }
  function renderTimeline(){
    $('vdaTl').innerHTML=
      '<div class="vda-flow">'+
        '<div class="vda-node req">요청<small>create / update</small></div>'+
        '<span class="vda-arrow">▶</span>'+
        '<div class="vda-node det">modify phase<small>determination (값 채움)</small></div>'+
        '<span class="vda-arrow">▶</span>'+
        '<div class="vda-node val">save phase<small>validation (검사)</small></div>'+
        '<span class="vda-arrow">▶</span>'+
        '<div class="vda-node commit">커밋 / 거부<small>실패 시 buffer 거부</small></div>'+
      '</div>'+
      '<div class="vda-act"><b>action (예: cancel)</b> — 위 저장 흐름과 <b>별도로</b>, 사용자가 버튼/API로 명시 실행 (<code>result [1] $self</code>).</div>'+
      '<div class="vda-legend"><span><i class="d"></i>Determination</span><span><i class="v"></i>Validation</span><span><i class="a"></i>Action</span></div>';
  }
  function render(){ renderCards(); renderScore(); renderTimeline(); }

  $('vdaCards').addEventListener('click',function(e){
    var b=e.target.closest('.vda-opt'); if(!b) return;
    st.picks[b.dataset.c]=b.dataset.t; render();
  });

  render();
})();
