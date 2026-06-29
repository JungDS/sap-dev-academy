// ===== bdef-contract-editor 엔진 JS — RAP BDEF 계약 편집기 (CH23-L04) =====
// operation(create/update/delete) 체크→소비자 행동 활성/비활성. persistent table 일치·lock master·key readonly 검사.
// table 불일치=bad · lock off=warn · key 수정가능=warn · else ok(BDEF는 동작 선언이지 ABAP 코드 아님). 데이터 내장.
(function(){
  var $=function(id){return document.getElementById(id);};
  var OPS=[{k:'create',label:'create',act:'예매 생성'},{k:'update',label:'update',act:'예매 수정'},{k:'delete',label:'delete',act:'예매 삭제'}];
  var st={ create:true, update:true, del:true, table:'zbooking', lock:true, keyRO:true };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function opOn(k){ return k==='delete' ? st.del : st[k]; }

  function renderOps(){
    $('bceOps').innerHTML=OPS.map(function(o){
      return '<button class="bce-op '+(opOn(o.k)?'on':'off')+'" data-k="'+o.k+'">'+esc(o.label)+(opOn(o.k)?' ✓':'')+'</button>';
    }).join('');
    $('bceActs').innerHTML=OPS.map(function(o){
      var able=opOn(o.k);
      return '<span class="bce-act '+(able?'able':'unable')+'">'+esc(o.act)+(able?'':' 불가')+'</span>';
    }).join('');
  }
  function renderTogs(){
    $('bceTable').className='bce-tog '+(st.table==='zbooking'?'ok':'badstate');
    $('bceTable').textContent='persistent table '+st.table;
    $('bceLock').className='bce-tog '+(st.lock?'ok':'warnstate');
    $('bceLock').textContent='lock master '+(st.lock?'(on)':'(없음)');
    $('bceKey').className='bce-tog '+(st.keyRO?'ok':'warnstate');
    $('bceKey').textContent='booking_id '+(st.keyRO?'readonly':'수정 가능');
  }
  function renderCode(){
    var lines=['<span class="cls">managed implementation in class zbp_i_booking unique</span>;','',
      '<span class="k">define behavior for</span> <span class="ent">ZI_Booking</span> <span class="k">alias</span> Booking'];
    lines.push(st.table==='zbooking'
      ? '<span class="k">persistent table</span> zbooking'
      : '<span class="k">persistent table</span> <span class="badtok">'+esc(st.table)+'</span>');
    lines.push(st.lock ? '<span class="k">lock master</span>' : '<span class="miss">// lock master 없음</span>');
    lines.push('{');
    OPS.forEach(function(o){ if(opOn(o.k)) lines.push('  '+o.k+';'); });
    lines.push('');
    lines.push(st.keyRO
      ? '  <span class="k">field</span> ( readonly:update ) booking_id;'
      : '  <span class="miss">// booking_id readonly 없음</span>');
    lines.push('  <span class="k">mapping for</span> zbooking { ... }');
    lines.push('}');
    $('bceCode').innerHTML='<pre class="bce-code">'+lines.join('\n')+'</pre>';
  }
  function renderVerdict(){
    var v=$('bceVerdict');
    if(st.table!=='zbooking'){ v.className='bce-verdict bad'; v.innerHTML='<b>저장 테이블 불일치.</b> root view <code>ZI_Booking</code>은 <code>zbooking</code> 기반인데 BDEF가 <code>'+esc(st.table)+'</code>를 가리킵니다 — 저장 모델이 어긋납니다.'; return; }
    if(!st.lock){ v.className='bce-verdict warn'; v.innerHTML='<b>lock master 없음.</b> 동시 수정 보호가 빠졌습니다 — managed에서는 root에 <code>lock master</code>를 두어 framework가 잠금을 처리하게 합니다.'; return; }
    if(!st.keyRO){ v.className='bce-verdict warn'; v.innerHTML='<b>key 수정 가능 위험.</b> <code>booking_id</code>가 update 중 바뀌면 어떤 예매를 수정하는지 기준이 흔들립니다 — 보통 key는 <code>readonly:update</code>로 둡니다.'; return; }
    var ops=OPS.filter(function(o){return opOn(o.k);}).map(function(o){return o.k;});
    v.className='bce-verdict ok';
    v.innerHTML='<b>BDEF 계약 OK.</b> 허용 operation: <code>'+(ops.length?esc(ops.join(', ')):'(없음 — 읽기 전용 BO)')+'</code>. 단, 이건 <b>동작 선언</b>이지 ABAP 코드가 아닙니다 — 실제 구현은 behavior pool <code>zbp_i_booking</code>에 들어갑니다.';
  }
  function render(){ renderOps(); renderTogs(); renderCode(); renderVerdict(); }

  $('bceOps').addEventListener('click',function(e){ var b=e.target.closest('.bce-op'); if(!b) return; var k=b.dataset.k; if(k==='delete') st.del=!st.del; else st[k]=!st[k]; render(); });
  $('bceTable').addEventListener('click',function(){ st.table=(st.table==='zbooking'?'zconcert':'zbooking'); render(); });
  $('bceLock').addEventListener('click',function(){ st.lock=!st.lock; render(); });
  $('bceKey').addEventListener('click',function(){ st.keyRO=!st.keyRO; render(); });

  render();
})();
