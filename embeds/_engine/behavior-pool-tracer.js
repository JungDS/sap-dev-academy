// ===== behavior-pool-tracer 엔진 JS — RAP Behavior Pool 호출 추적기 (CH24-L05) =====
// 4단계: ①저장 요청(keys 3행 internal table) ②READ ENTITIES(집합 read) ③정원 검사(seats vs remaining) ④failed/reported 기록.
// 순서 의존. loop 안 EML 토글=anti-pattern warn. handler는 단건 함수가 아니라 집합 지향 runtime callback. 데이터 내장.
(function(){
  var $=function(id){return document.getElementById(id);};
  var BK=[
    { id:'B001', perf:'C001/01', seats:2, remaining:5 },
    { id:'B002', perf:'C001/01', seats:8, remaining:5 },
    { id:'B003', perf:'C002/01', seats:1, remaining:0 }
  ];
  function fail(b){ return b.seats>b.remaining; }
  var STEPS=[
    {id:'request', label:'저장 요청'},
    {id:'read',    label:'READ ENTITIES'},
    {id:'check',   label:'정원 검사'},
    {id:'record',  label:'failed/reported 기록'}
  ];
  var st={ step:0, eml:false };   // step = 완료한 단계 수(0~4)

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function renderSteps(){
    $('bptSteps').innerHTML=STEPS.map(function(s,i){
      return '<button class="bpt-step'+(i<st.step?' done':'')+'" data-i="'+i+'"><span class="n">'+(i+1)+'.</span>'+esc(s.label)+(i<st.step?' ✓':'')+'</button>';
    }).join('');
    $('bptEml').className='bpt-eml'+(st.eml?' on':'');
    $('bptEml').textContent=(st.eml?'✓ ':'')+'loop 안 EML';
  }
  function panelKeys(){
    return '<table class="dt"><thead><tr><th>booking_id</th></tr></thead><tbody>'+
      BK.map(function(b){return '<tr><td>'+esc(b.id)+'</td></tr>';}).join('')+'</tbody></table>';
  }
  function panelRead(){
    return '<table class="dt"><thead><tr><th>booking_id</th><th>회차</th><th>seats</th><th>remaining</th></tr></thead><tbody>'+
      BK.map(function(b){return '<tr><td>'+esc(b.id)+'</td><td>'+esc(b.perf)+'</td><td>'+b.seats+'</td><td>'+b.remaining+'</td></tr>';}).join('')+'</tbody></table>';
  }
  function panelCheck(){
    return '<table class="dt"><thead><tr><th>booking_id</th><th>seats vs remaining</th><th>판정</th></tr></thead><tbody>'+
      BK.map(function(b){var f=fail(b);return '<tr'+(f?' class="fail"':'')+'><td>'+esc(b.id)+'</td><td>'+b.seats+' / '+b.remaining+'</td><td><span class="bpt-badge '+(f?'fail':'ok')+'">'+(f?'정원 초과':'OK')+'</span></td></tr>';}).join('')+'</tbody></table>';
  }
  function panelRecord(){
    var fails=BK.filter(fail);
    var lines=['<span class="k">failed</span>-booking = [ '+fails.map(function(b){return '<span class="bad">'+esc(b.id)+'</span>';}).join(', ')+' ]'];
    fails.forEach(function(b){ lines.push('<span class="k">reported</span>: '+esc(b.id)+' → "정원을 초과했습니다 ('+b.seats+'>'+b.remaining+')"'); });
    return '<pre class="bpt-rsp">'+lines.join('\n')+'</pre>';
  }

  function setMsg(t,cls){ var m=$('bptMsg'); m.className='bpt-msg '+cls; m.innerHTML=t; }

  function renderBody(){
    var html='';
    if(st.step>=1) html+='<div class="bpt-panel"><p class="bpt-cap"><code>keys</code> — IMPORTING keys (internal table)</p>'+panelKeys()+'</div>';
    if(st.step>=2) html+='<div class="bpt-panel"><p class="bpt-cap"><code>READ ENTITIES … WITH CORRESPONDING #( keys )</code> — 집합 read</p>'+panelRead()+'</div>';
    if(st.step>=3) html+='<div class="bpt-panel"><p class="bpt-cap">정원 검사 (LOOP AT result)</p>'+panelCheck()+'</div>';
    if(st.step>=4) html+='<div class="bpt-panel"><p class="bpt-cap"><code>failed</code> / <code>reported</code> — RAP runtime 응답</p>'+panelRecord()+'</div>';
    if(!html) html='<div class="bpt-empty">①부터 순서대로 눌러 handler 호출 흐름을 따라가 보세요.</div>';
    $('bptBody').innerHTML=html;
  }

  function evalMsg(){
    if(st.eml){ setMsg('<b>loop 안 EML 경고.</b> <code>READ/MODIFY ENTITIES</code>를 LOOP 안에서 반복 호출하면 비효율입니다 — 먼저 <b>한 번에 READ</b>하고, 그 결과를 LOOP로 처리하세요(집합 지향).','warn'); return; }
    if(st.step===0){ setMsg('handler는 버튼 한 번을 처리하는 함수가 아니라, <b>여러 instance를 한 번에</b> 처리하는 runtime callback입니다. ①부터 눌러 보세요.','ok'); return; }
    if(st.step===1){ setMsg('<b>keys는 단건이 아닙니다.</b> 예매 3건의 key가 internal table 3행으로 들어왔습니다 — 단건이라고 가정하면 안 됩니다.','ok'); return; }
    if(st.step===2){ setMsg('<b>READ ENTITIES … IN LOCAL MODE</b>로 3건을 <b>한 번에</b> 읽습니다(loop 안 SELECT 아님·현재 transactional buffer 반영).','ok'); return; }
    if(st.step===3){ setMsg('각 booking의 seats를 remaining과 비교합니다. <b>B002·B003</b>이 정원 초과 — 실패 후보입니다(검증은 *실패를 알리는* 역할, 값 수정 X).','ok'); return; }
    setMsg('<b>failed/reported에 기록.</b> 실패 key와 메시지를 RAP runtime에 돌려줘야 사용자가 왜 저장이 막혔는지 압니다 — 안 채우면 침묵 실패가 됩니다.','ok');
  }

  function render(){ renderSteps(); renderBody(); evalMsg(); }

  $('bptSteps').addEventListener('click',function(e){
    var b=e.target.closest('.bpt-step'); if(!b) return;
    var i=+b.dataset.i;
    if(i>st.step){ setMsg('순서대로 진행하세요 — 먼저 ‘'+esc(STEPS[st.step].label)+'’을(를) 실행해야 합니다.','warn'); return; }
    st.step=i+1; st.eml=false; render();
  });
  $('bptEml').addEventListener('click',function(){ st.eml=!st.eml; render(); });

  render();
})();
