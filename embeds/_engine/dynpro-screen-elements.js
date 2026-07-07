// ===== dynpro-screen-elements 엔진 JS — Dynpro 화면 요소 ↔ 전역 변수 연결 시연 =====
// 입력칸·체크박스·라디오·드롭다운(VRM)·버튼을 조작하면 연결된 변수 값이 모니터에 반영되고,
// 버튼(FctCode)을 누르면 OK_CODE로 전달돼 PAI가 받는다(시연). SELECT/조회 없음(Dynpro 요소만).
(function(){
  var root=document.querySelector('[data-dynpro]'); if(!root) return;
  var $=function(s){return root.querySelector(s);};
  // 상태(= 화면 필드에 연결된 전역 변수)
  var st={ p_conc:'', p_seats:'', p_vip:'', p_stat:'R', ok_code:'' };

  function vrow(k,label,val){
    var empty = (val===''||val==null);
    return '<div class="dse-vrow'+(k==='ok_code'&&val?' ok':'')+'"><span class="k">'+label+'</span>'+
      '<span class="v">'+(empty?'<span class="empty">( 공백 )</span>':val)+'</span></div>';
  }
  function renderVars(){
    var m=$('[data-mon]');
    m.innerHTML =
      vrow('p_conc','p_conc', st.p_conc)+
      vrow('p_seats','p_seats', st.p_seats)+
      vrow('p_vip',"p_vip (CHAR1)", st.p_vip)+
      vrow('p_stat','p_stat', st.p_stat)+
      vrow('ok_code','ok_code (sy-ucomm)', st.ok_code);
    var msg=$('[data-okmsg]');
    msg.innerHTML = st.ok_code
      ? '✓ <b>OK_CODE = \''+st.ok_code+'\'</b> 가 PAI로 전달됨 → 입력값으로 처리(검증·저장).'
      : '버튼을 누르면 FctCode가 <b>OK_CODE</b>로 전달됩니다(→ PAI).';
    postHeight();
  }

  root.addEventListener('input', function(e){
    var f=e.target.getAttribute('data-f'); if(!f) return;
    if(e.target.type==='checkbox'){ st[f]=e.target.checked?'X':''; }
    else st[f]=e.target.value;
    st.ok_code='';            // 값 바꾸면 아직 미전송
    renderVars();
  });
  root.addEventListener('change', function(e){
    var f=e.target.getAttribute('data-f'); if(!f) return;
    if(e.target.type==='radio'){ st[f]=e.target.value; }
    else if(e.target.tagName==='SELECT'){ st[f]=e.target.value; }
    else if(e.target.type==='checkbox'){ st[f]=e.target.checked?'X':''; }
    st.ok_code=''; renderVars();
  });
  root.addEventListener('click', function(e){
    var b=e.target.closest('[data-fct]'); if(!b) return;
    st.ok_code=b.getAttribute('data-fct');      // FctCode → OK_CODE
    renderVars();
  });

  function postHeight(){
    try{ var el=document.querySelector('.wrap');
      var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6;
      parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){}
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  renderVars();
})();
