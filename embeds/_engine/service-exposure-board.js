// ===== service-exposure-board 엔진 JS — RAP Service 노출 점검판 (CH23-L06) =====
// Service Definition(expose ZC_Booking) + Service Binding(type·activate). expose 없으면 metadata 비고·binding inactive면 URL 없음.
// 두 오류 구분: expose+!active=warn(Activate 필요) · !expose+active=warn(metadata 비어 있음) · expose+active=ok. UI vs Web API. 데이터 내장.
(function(){
  var $=function(id){return document.getElementById(id);};
  var TYPES=[{k:'v4ui',l:'OData V4 · UI',ui:true},{k:'v4web',l:'OData V4 · Web API',ui:false},{k:'v2ui',l:'OData V2 · UI',ui:true}];
  var st={ expose:false, active:false, type:'v4ui' };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function curType(){ return TYPES.filter(function(t){return t.k===st.type;})[0]; }

  function renderCtrl(){
    $('sebExpose').className='seb-tog '+(st.expose?'on':'off');
    $('sebExpose').textContent='expose ZC_Booking: '+(st.expose?'있음':'(없음)');
    $('sebTypes').innerHTML=TYPES.map(function(t){
      return '<button class="seb-seg'+(t.k===st.type?' on':'')+'" data-k="'+t.k+'">'+esc(t.l)+'</button>';
    }).join('');
    $('sebActive').className='seb-tog '+(st.active?'on':'off');
    $('sebActive').textContent='Binding: '+(st.active?'Active':'Inactive');
  }
  function renderCards(){
    var def = st.expose
      ? '<pre class="seb-code"><span class="k">define service</span> <span class="ent">ZUI_Booking</span> {\n  <span class="k">expose</span> <span class="ent">ZC_Booking</span> <span class="k">as</span> Booking;\n}</pre>'
      : '<pre class="seb-code"><span class="k">define service</span> <span class="ent">ZUI_Booking</span> {\n  <span class="miss">// expose 없음 — 노출할 entity가 없습니다</span>\n}</pre>';
    $('sebDef').innerHTML=def;
    $('sebDefSt').className='seb-status '+(st.expose?'act':'inact');
    $('sebDefSt').textContent=st.expose?'expose 1':'expose 0';

    var t=curType();
    $('sebBind').innerHTML='<div class="seb-kv">binding type: <b>'+esc(t.l)+'</b><br>service definition: <b>ZUI_Booking</b><br>kind: <b>'+(t.ui?'UI (control info 포함)':'Web API (data-only)')+'</b></div>';
    $('sebBindSt').className='seb-status '+(st.active?'act':'inact');
    $('sebBindSt').textContent=st.active?'Active':'Inactive';
  }
  function renderMeta(){
    var live = st.expose && st.active;
    $('sebMeta').innerHTML='<p class="seb-meta__cap">$metadata — 노출 entity</p>'+
      (live ? '<span class="seb-chip">Booking</span>' : '<span class="seb-empty">(비어 있음 — '+(!st.expose?'expose 안 됨':'binding inactive')+')</span>');
  }
  function setV(t,cls){ var v=$('sebVerdict'); v.className='seb-verdict '+cls; v.innerHTML=t; }
  function renderVerdict(){
    if(st.expose && st.active){
      var t=curType();
      setV('<b>OData 서비스 활성 🎉</b> <code>$metadata</code>에 <b>Booking</b>이 노출되고 URL/테스트가 가능합니다. '+
        (t.ui?'UI binding이라 <b>Fiori Elements Preview</b>를 띄울 수 있어요(annotation 부족하면 빈 컬럼).':'Web API binding이라 <b>data-only</b> — Fiori Preview는 UI binding에서 합니다.'),'ok');
    } else if(st.expose && !st.active){
      setV('<b>Definition엔 있지만 Binding이 inactive.</b> source가 활성화돼도 binding을 <b>Activate</b>하지 않으면 URL·preview를 쓸 수 없습니다.','warn');
    } else if(!st.expose && st.active){
      setV('<b>Binding은 active지만 expose가 없습니다.</b> Service Definition에 <code>expose ZC_Booking</code>이 없어 <code>$metadata</code>가 비어 있어요 — 서로 다른 오류입니다.','warn');
    } else {
      setV('아직 노출 전입니다. <b>expose</b>로 무엇을 노출할지 정하고, <b>Binding을 Activate</b>해 어떻게 접근할지 정하세요(역할 분리).','warn');
    }
  }
  function render(){ renderCtrl(); renderCards(); renderMeta(); renderVerdict(); }

  $('sebExpose').addEventListener('click',function(){ st.expose=!st.expose; render(); });
  $('sebActive').addEventListener('click',function(){ st.active=!st.active; render(); });
  $('sebTypes').addEventListener('click',function(e){ var b=e.target.closest('.seb-seg'); if(!b) return; st.type=b.dataset.k; render(); });

  render();
})();
