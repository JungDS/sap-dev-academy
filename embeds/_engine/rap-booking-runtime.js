// ===== rap-booking-runtime 엔진 JS — 예매 RAP 런타임 시뮬레이터 (CH24-L09 capstone) =====
// create→determination(status='N')→validation(seats vs 잔여)→save/reject, cancel=action(status='C'). V/D/A를 한 흐름에서.
// 정원 초과는 failed/reported로 거부, 취소는 명시 action(중복 취소=no-op). 데이터 내장. 교훈3: msg base 중립·ok/warn/bad 명시.
(function(){
  var $=function(id){return document.getElementById(id);};
  var CAP=10;
  var st={ bookings:[], seq:0, last:null };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function remaining(){ var used=0; st.bookings.forEach(function(b){ if(b.status!=='C') used+=b.seats; }); return CAP-used; }

  function create(seats){
    var rem=remaining();                       // validation 기준(이번 건 추가 전 잔여)
    if(seats<=rem){
      st.seq++; var id='B'+('00'+st.seq).slice(-3);
      st.bookings.push({id:id, seats:seats, status:'N'});   // determination: status='N'
      st.last={kind:'create', seats:seats, rem:rem, ok:true, id:id};
    } else {
      st.last={kind:'create', seats:seats, rem:rem, ok:false};
    }
    render();
  }
  function cancel(id){
    var b=null; st.bookings.forEach(function(x){ if(x.id===id) b=x; });
    if(!b) return;
    if(b.status==='N'){ b.status='C'; st.last={kind:'cancel', id:id, ok:true}; }
    else { st.last={kind:'cancel', id:id, ok:false, dup:true}; }
    render();
  }

  function renderPerf(){
    var rem=remaining();
    $('rbrPerf').innerHTML='회차 <b>C001 / 01</b> · 정원 <b>'+CAP+'</b> · 잔여 <span class="rbr-rem'+(rem<=2?' low':'')+'">'+rem+'</span>석';
  }
  function renderTable(){
    if(!st.bookings.length){ $('rbrTable').innerHTML='<div class="rbr-empty">아직 예매가 없습니다. 위에서 예매를 생성해 보세요.</div>'; return; }
    var head='<thead><tr><th>booking_id</th><th>seats</th><th>status</th><th></th></tr></thead>';
    var body=st.bookings.map(function(b){
      var c=(b.status==='C');
      return '<tr'+(c?' class="cancelled"':'')+'><td>'+esc(b.id)+'</td><td>'+b.seats+'</td>'+
        '<td><span class="rbr-st '+(c?'c':'n')+'">'+b.status+(c?' 취소':' 신규')+'</span></td>'+
        '<td><button class="rbr-cancel" data-id="'+b.id+'"'+(c?' disabled':'')+'>취소(action)</button></td></tr>';
    }).join('');
    $('rbrTable').innerHTML='<table class="dt">'+head+'<tbody>'+body+'</tbody></table>';
  }
  function renderTimeline(){
    var L=st.last;
    if(!L || L.kind!=='create'){ $('rbrTl').style.display='none'; return; }
    $('rbrTl').style.display='';
    var valCls=L.ok?'pass':'fail';
    var lastNode=L.ok?'<div class="rbr-node pass">save<small>저장 성공</small></div>':'<div class="rbr-node fail">reject<small>buffer 거부</small></div>';
    $('rbrTl').innerHTML='<p class="rbr-tl__c">실행 타임라인 — 마지막 create (seats '+L.seats+')</p>'+
      '<div class="rbr-flow">'+
        '<div class="rbr-node on">create<small>요청</small></div><span class="rbr-arrow">▶</span>'+
        '<div class="rbr-node on">determination<small>status=\'N\'</small></div><span class="rbr-arrow">▶</span>'+
        '<div class="rbr-node '+valCls+'">validation<small>'+L.seats+' vs 잔여 '+L.rem+'</small></div><span class="rbr-arrow">▶</span>'+
        lastNode+
      '</div>';
  }
  function renderResp(){
    var L=st.last;
    if(L && L.kind==='create' && !L.ok){
      $('rbrResp').style.display='';
      $('rbrResp').innerHTML='<p class="rbr-resp__c">RAP runtime 응답</p><pre>'+
        '<span class="k">failed</span>-booking  = [ (이 create 인스턴스) ]\n'+
        '<span class="k">reported</span>-booking = "정원을 초과했습니다 ('+L.seats+' > 잔여 '+L.rem+')"</pre>';
    } else { $('rbrResp').style.display='none'; }
  }
  function setMsg(t,cls){ var m=$('rbrMsg'); m.className='rbr-msg '+cls; m.innerHTML=t; }
  function renderMsg(){
    var L=st.last;
    if(!L){ setMsg('<b>정상 예매</b>는 determination이 상태를 채우고 validation을 통과해 저장됩니다. <b>정원 초과</b>는 validation이 막고, <b>취소</b>는 action으로 실행돼요.',''); return; }
    if(L.kind==='create' && L.ok){ setMsg('<b>저장 성공.</b> create → determination(<code>status=\'N\'</code>) → validation(<code>'+L.seats+' ≤ 잔여 '+L.rem+'</code>) 통과 → 저장(<code>'+esc(L.id)+'</code>).','ok'); return; }
    if(L.kind==='create' && !L.ok){ setMsg('<b>validation 실패.</b> <code>'+L.seats+' &gt; 잔여 '+L.rem+'</code> — <code>failed/reported</code>에 기록하고 저장을 <b>거부</b>합니다(오류 메시지만 띄우고 저장이 아님).','bad'); return; }
    if(L.kind==='cancel' && L.ok){ setMsg('<b>action cancel 실행.</b> <code>'+esc(L.id)+'</code>의 status를 <code>\'C\'</code>로 바꿨습니다 — 사용자가 명시적으로 실행하는 동작입니다.','ok'); return; }
    setMsg('<b>이미 취소된 예매</b>입니다 (<code>'+esc(L.id)+'</code>) — 중복 취소는 no-op/실패 정책으로 처리합니다.','warn');
  }
  function render(){ renderPerf(); renderTable(); renderTimeline(); renderResp(); renderMsg(); }

  $('rbrCreateOk').addEventListener('click',function(){ create(2); });
  $('rbrCreateOver').addEventListener('click',function(){ create(12); });
  $('rbrTable').addEventListener('click',function(e){ var b=e.target.closest('.rbr-cancel'); if(!b||b.disabled) return; cancel(b.dataset.id); });
  $('rbrReset').addEventListener('click',function(){ st={bookings:[],seq:0,last:null}; render(); });

  render();
})();
