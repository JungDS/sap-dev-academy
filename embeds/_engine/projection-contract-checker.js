// ===== projection-contract-checker 엔진 JS — RAP Transactional Projection 계약 검사기 (CH23-L03) =====
// ZI_Booking(기반 root) → ZC_Booking(소비). 토글: contract(provider contract transactional_query)·projRoot·allowExt·노출 필드.
// !projRoot(기반이 root인데 projection 아님)=bad · !contract=warn · 정상=ok. 숨김=계약 제외(삭제 아님). 데이터 내장.
(function(){
  var $=function(id){return document.getElementById(id);};
  var FIELDS=[
    {f:'booking_id', key:true},
    {f:'concert_id'},{f:'perf_no'},{f:'customer'},{f:'seats'},{f:'status'},
    {f:'created_by', audit:true}
  ];
  var st={ contract:true, projRoot:true, allowExt:true, exposed:{} };
  FIELDS.forEach(function(x){ st.exposed[x.f] = x.key ? true : !x.audit; });   // 감사필드 기본 숨김

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function exposedList(){ return FIELDS.filter(function(x){ return st.exposed[x.f]; }); }

  function renderCtrl(){
    $('pccContract').className='pcc-tog '+(st.contract?'on':'off');
    $('pccContract').textContent='provider contract: '+(st.contract?'transactional_query':'(없음)');
    $('pccRoot').className='pcc-tog '+(st.projRoot?'on':'off');
    $('pccRoot').textContent='ZC_Booking: '+(st.projRoot?'define root view':'define view (root 아님)');
    $('pccAllow').className='pcc-tog '+(st.allowExt?'on':'off');
    $('pccAllow').textContent='@Metadata.allowExtensions: '+(st.allowExt?'true':'(없음)');
  }
  function renderFields(){
    $('pccFields').innerHTML=FIELDS.map(function(x){
      if(x.key) return '<span class="pcc-fld keyf" data-f="'+x.f+'">'+esc(x.f)+' (key)</span>';
      var on=st.exposed[x.f];
      return '<button class="pcc-fld '+(on?'shown':'hidden')+'" data-f="'+x.f+'">'+esc(x.f)+(x.audit?' ·감사':'')+(on?' ✓':'')+'</button>';
    }).join('');
  }
  function renderCards(){
    var zi='<pre class="pcc-code"><span class="k">define root view entity</span> <span class="ent">ZI_Booking</span>\n{\n'+
      FIELDS.map(function(x){ return (x.key?'  <span class="kw">key</span> ':'      ')+esc(x.f)+','; }).join('\n')+'\n}</pre>';
    $('pccZi').innerHTML=zi;

    var ex=exposedList();
    var lines=['<span class="anno">@AccessControl.authorizationCheck: #NOT_REQUIRED</span>'];
    if(st.allowExt) lines.push('<span class="anno">@Metadata.allowExtensions: true</span>');
    lines.push((st.projRoot?'<span class="k">define root view entity</span>':'<span class="k">define view entity</span>')+' <span class="ent">ZC_Booking</span>');
    lines.push(st.contract
      ? '  <span class="contract">provider contract transactional_query</span>'
      : '  <span class="miss">// provider contract 없음</span>');
    lines.push('  <span class="k">as projection on</span> ZI_Booking');
    lines.push('{');
    ex.forEach(function(x,i){ lines.push((x.key?'  <span class="kw">key</span> ':'      ')+esc(x.f)+(i===ex.length-1?'':',')); });
    lines.push('}');
    $('pccZc').innerHTML='<pre class="pcc-code">'+lines.join('\n')+'</pre>';

    $('pccPayload').innerHTML=ex.map(function(x){ return '<span class="pcc-chip">'+esc(x.f)+'</span>'; }).join('');
  }
  function renderVerdict(){
    var v=$('pccVerdict');
    if(!st.projRoot){ v.className='pcc-verdict bad'; v.innerHTML='<b>root 위치 불일치.</b> 기반 <code>ZI_Booking</code>이 root인데 projection이 root가 아닙니다 — projected entity 위치를 반영해 <code>define root view entity</code>로 맞춰야 합니다.'; return; }
    if(!st.contract){ v.className='pcc-verdict warn'; v.innerHTML='<b>provider contract 없음.</b> <code>transactional_query</code>가 빠지면 transactional projection 시나리오의 runtime 점검이 약해집니다 — 장식이 아니라 *계약*입니다.'; return; }
    var hidden=FIELDS.filter(function(x){ return !st.exposed[x.f]; }).map(function(x){return x.f;});
    v.className='pcc-verdict ok';
    v.innerHTML='<b>transactional projection 계약 완성 🎉</b> 기반은 안정적으로, 소비는 명확하게 분리됐습니다.'+
      (hidden.length?(' 숨긴 <code>'+esc(hidden.join(', '))+'</code>는 <b>지운 게 아니라</b> 외부 소비 계약에서 제외 — 기반 ZI_Booking엔 그대로 있습니다.'):'');
  }
  function render(){ renderCtrl(); renderFields(); renderCards(); renderVerdict(); }

  $('pccContract').addEventListener('click',function(){ st.contract=!st.contract; render(); });
  $('pccRoot').addEventListener('click',function(){ st.projRoot=!st.projRoot; render(); });
  $('pccAllow').addEventListener('click',function(){ st.allowExt=!st.allowExt; render(); });
  $('pccFields').addEventListener('click',function(e){ var b=e.target.closest('.pcc-fld'); if(!b||b.classList.contains('keyf')) return; var f=b.dataset.f; st.exposed[f]=!st.exposed[f]; render(); });

  render();
})();
