// ===== process-flow-pbo-pai 엔진 JS — Module Pool 두 박자(PBO/PAI) 순환 흐름 =====
// '다음 박자'로 PBO → 화면 표시 → 사용자 입력 → PAI → (다시 PBO) 순환을 한 칸씩 진행·강조.
// 설정은 위젯의 window.PF_CFG.stages (없으면 기본 4단계).
(function(){
  var cfg = window.PF_CFG || {};
  var STAGES = cfg.stages || [
    {cls:'s-pbo',   tag:'ABAP · PBO',  name:'PBO',       sub:'Process Before Output', desc:'화면을 <b>그리기 직전</b> — 초기값·필드 상태(숨김/회색)를 준비합니다.'},
    {cls:'s-screen',tag:'화면',         name:'화면 표시',  sub:'Screen displayed',      desc:'준비된 화면을 사용자에게 보여 주고 <b>입력을 기다립니다</b>(대기).'},
    {cls:'s-input', tag:'사용자',        name:'사용자 입력', sub:'Enter · Button',        desc:'사용자가 값을 넣고 <b>버튼·Enter</b>를 누릅니다 → OK_CODE 발생.'},
    {cls:'s-pai',   tag:'ABAP · PAI',  name:'PAI',       sub:'Process After Input',   desc:'입력값을 받아 <b>처리</b>(검증·저장·다음 화면). 끝나면 다시 PBO로.'}
  ];
  var root=document.querySelector('[data-pbopai]'); if(!root) return;
  var cur=-1, loops=0;

  function render(){
    var cyc='<div class="pf-cycle">';
    STAGES.forEach(function(s,i){
      cyc+='<div class="pf-stage '+s.cls+(i===cur?' on':'')+'">'+
        '<span class="pf-stage__tag">'+s.tag+'</span>'+
        '<div class="pf-stage__name">'+s.name+'</div>'+
        '<div class="pf-stage__sub">'+s.sub+'</div>'+
      '</div>';
      if(i<STAGES.length-1) cyc+='<div class="pf-arrow">→</div>';
    });
    cyc+='</div>';
    var loopback='<div class="pf-loopback">⟲ <b>PAI가 끝나면 다시 PBO로</b> — 화면이 닫히거나 다음 화면이 뜰 때까지 이 두 박자가 반복됩니다.</div>';
    var desc='<div class="pf-desc">'+(cur<0 ? '▶ <b>다음 박자</b>를 눌러 PBO부터 한 칸씩 진행해 보세요.' : STAGES[cur].desc)+'</div>';
    root.innerHTML=cyc+loopback+desc;
    var lc=document.getElementById('pfLoops'); if(lc) lc.textContent='완료한 사이클: '+loops;
    postHeight();
  }
  document.getElementById('pfNext').addEventListener('click',function(){
    cur++; if(cur>=STAGES.length){ cur=0; loops++; }
    render();
  });
  var rb=document.getElementById('pfReset'); if(rb) rb.addEventListener('click',function(){ cur=-1; loops=0; render(); });

  function postHeight(){
    try{ var el=document.querySelector('.wrap');
      var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6;
      parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){}
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  render();
})();
