// ===== salv-pipeline-stepper 엔진 JS — SELECT→Internal Table→SALV (CH11-L04) =====
// DB·Internal Table·SALV 3칸을 SELECT/DESCRIBE/factory/set_all/display 순서로 채운다.
// 단계를 건너뛰면 명확한 피드백을 준다. (데이터 내장)
(function(){
  var $=function(id){return document.getElementById(id);};
  var COLS=[{k:'persid',l:'persid'},{k:'name',l:'이름'},{k:'city',l:'도시'}];
  var FULL=[
    {persid:1001,name:'정훈영',city:'서울'},{persid:1002,name:'손흥민',city:'런던'},
    {persid:1003,name:'아이유',city:'서울'},{persid:1004,name:'유재석',city:'서울'},
    {persid:1005,name:'김연아',city:'부산'},{persid:1006,name:'차은우',city:'서울'}
  ];
  var st={sel:false, desc:false, fac:false, set:false, disp:false, empty:false};

  function rows(){ return st.empty ? [] : FULL; }
  function renderDB(){
    var head='<thead><tr>'+COLS.map(function(c){return '<th>'+c.l+'</th>';}).join('')+'</tr></thead>';
    var body=rows().map(function(r){return '<tr>'+COLS.map(function(c){return '<td>'+r[c.k]+'</td>';}).join('')+'</tr>';}).join('');
    $('dbBody').innerHTML='<table class="dt">'+head+'<tbody>'+(body||'<tr><td colspan="3" class="empty-it">0행</td></tr>')+'</tbody></table>';
  }
  function renderIT(){
    if(!st.sel){ $('itBody').innerHTML='<div class="empty-it">(SELECT 전 — 비어 있음)</div>'; return; }
    var head='<thead><tr>'+COLS.map(function(c){return '<th>'+c.l+'</th>';}).join('')+'</tr></thead>';
    var body=rows().map(function(r){return '<tr>'+COLS.map(function(c){return '<td>'+r[c.k]+'</td>';}).join('')+'</tr>';}).join('');
    var cnt = st.desc ? '<div class="badge cnt">lv_count = '+rows().length+'</div>' : '';
    $('itBody').innerHTML=cnt+'<table class="dt">'+head+'<tbody>'+(body||'<tr><td colspan="3" class="empty-it">0행</td></tr>')+'</tbody></table>';
  }
  function renderSALV(){
    var html='';
    if(st.fac) html+='<div class="badge lo">lo_alv 생성됨</div>';
    if(st.set) html+='<div class="bar"><span class="tbtn">정렬</span><span class="tbtn">필터</span><span class="tbtn">Σ</span><span class="tbtn">엑셀</span></div>';
    if(st.disp){
      var head='<thead><tr>'+COLS.map(function(c){return '<th>'+c.l+'</th>';}).join('')+'</tr></thead>';
      var body=rows().map(function(r){return '<tr>'+COLS.map(function(c){return '<td>'+r[c.k]+'</td>';}).join('')+'</tr>';}).join('');
      html+='<table class="dt">'+head+'<tbody>'+(body||'<tr><td colspan="3" class="empty-it">빈 표(정상)</td></tr>')+'</tbody></table>';
    } else if(!st.fac){ html='<div class="salv-wait">(아직 ALV 없음)</div>'; }
    else { html+='<div class="salv-wait">factory 완료 — display 전이라 표 없음</div>'; }
    $('salvBody').innerHTML=html;
  }
  function render(){ renderDB(); renderIT(); renderSALV(); markBtns(); postHeight(); }
  function markBtns(){
    [['sel','sel'],['desc','desc'],['fac','fac'],['set','set'],['disp','disp']].forEach(function(p){
      var b=$('toolbar').querySelector('.btn[data-a="'+p[0]+'"]'); if(b) b.classList.toggle('done', st[p[1]]);
    });
  }
  function fb(t,warn){ $('fb').className='fb'+(warn?' warn':''); $('fb').textContent=t; postHeight(); }

  $('toolbar').addEventListener('click',function(e){
    var b=e.target.closest('.btn'); if(!b) return;
    var a=b.dataset.a;
    if(a==='sel'){ st.sel=true; fb('SELECT는 화면이 아니라 메모리 표(LT_PERSON)를 채웁니다.'); }
    else if(a==='desc'){ if(!st.sel){ fb('먼저 SELECT로 데이터를 담아야 행 수를 셀 수 있습니다.',true); return;} st.desc=true; fb('표시 전에 데이터 유무를 확인합니다 — lv_count = '+rows().length+'.'); }
    else if(a==='fac'){ if(!st.sel){ fb('표시할 Internal Table이 비어 있습니다 — SELECT 먼저(빈 표가 나올 수 있음).',true); }
      st.fac=true; fb(st.fac&&st.sel?'ALV 객체(lo_alv)가 준비됐지만 아직 화면은 열리지 않았습니다.':$('fb').textContent); }
    else if(a==='set'){ if(!st.fac){ fb('lo_alv가 아직 없습니다 — factory가 먼저입니다.',true); return;} st.set=true; fb('사용자 조작 기능을 켰습니다(set_all).'); }
    else if(a==='disp'){ if(!st.fac){ fb('lo_alv가 아직 없습니다 — factory가 먼저입니다.',true); return;}
      if(!st.set){ st.disp=true; fb('표는 떴지만 표준 기능이 제한될 수 있습니다(set_all 미호출).',true); }
      else { st.disp=true; fb('사용자가 보는 화면은 마지막 display( ) 호출에서 열립니다.'); } }
    else if(a==='empty'){ st.empty=!st.empty; b.classList.toggle('done',st.empty);
      fb(st.empty?'빈 결과 시나리오 — 데이터 없음과 ALV 실패는 다릅니다(빈 표는 정상).':'정상 데이터(6행) 시나리오.'); }
    else if(a==='reset'){ st={sel:false,desc:false,fac:false,set:false,disp:false,empty:false}; fb('초기화 — SELECT부터 순서대로 눌러 보세요.'); }
    render();
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render(); fb('SELECT → 행 수 확인 → factory → set_all → display 순서로 눌러 보세요.');
})();
