// ===== salv-function-switch 엔진 JS — SALV 표준 기능 vs 화면 표시 구분 (CH11-L03) =====
// set_all(기능 켜기)과 display(화면 표시)가 별개임을 버튼 시나리오로 보여 준다. (코드/데이터 내장)
(function(){
  var $=function(id){return document.getElementById(id);};
  var COLS=[{k:'persid',l:'persid',num:true},{k:'name',l:'이름'},{k:'city',l:'도시'},{k:'salary',l:'급여',num:true}];
  var ROWS=[
    {persid:1001,name:'정훈영',city:'서울',salary:5000},
    {persid:1002,name:'손흥민',city:'런던',salary:9000},
    {persid:1003,name:'아이유',city:'서울',salary:8000},
    {persid:1004,name:'유재석',city:'서울',salary:12000},
    {persid:1005,name:'김연아',city:'부산',salary:7000},
    {persid:1006,name:'차은우',city:'서울',salary:6000}
  ];
  // 시나리오: funcsOn, displayed
  var funcsOn=false, displayed=true, showSum=false;

  function renderCode(){
    var setLine='<span class="cline'+(funcsOn?' hot':'')+'">lo_alv-&gt;<span class="tok-kw">get_functions</span>( )-&gt;<span class="tok-kw">set_all</span>( <span class="tok-bool">abap_true</span> ).</span>';
    var dispLine='<span class="cline'+(displayed?' hot':' dim')+'">lo_alv-&gt;<span class="tok-kw">display</span>( ).</span>';
    if(!funcsOn) setLine='<span class="cline dim">lo_alv-&gt;get_functions( )-&gt;set_all( abap_true ).  " 안 켬</span>';
    $('code').innerHTML=setLine+'\n'+dispLine;
  }
  function renderSalv(){
    if(!displayed){ $('salvBody').innerHTML='<div class="hidden-msg">아직 화면 표시 안 됨 — display( )를 호출해야 표가 열립니다.</div>'; $('bar').style.display='none'; return; }
    $('bar').style.display='flex';
    $('bar').className='bar'+(funcsOn?'':' minimal');
    $('bar').innerHTML = funcsOn
      ? '<span class="tbtn">정렬</span><span class="tbtn ext">필터</span><span class="tbtn ext sum" id="sumBtn">Σ 합계</span><span class="tbtn ext">엑셀</span><span class="tbtn ext">인쇄</span>'
      : '<span class="muted">표준 기능이 제한적입니다 (set_all 미호출)</span>';
    var head='<thead><tr>'+COLS.map(function(c){return '<th class="'+(c.num?'num':'')+'">'+c.l+'</th>';}).join('')+'</tr></thead>';
    var body=ROWS.map(function(r){return '<tr>'+COLS.map(function(c){return '<td class="'+(c.num?'num':'')+'">'+r[c.k]+'</td>';}).join('')+'</tr>';}).join('');
    var foot='';
    if(showSum&&funcsOn){ var total=ROWS.reduce(function(a,r){return a+r.salary;},0);
      foot='<tfoot><tr>'+COLS.map(function(c){return '<td class="'+(c.num?'num':'')+'">'+(c.k==='salary'?('Σ '+total):'')+'</td>';}).join('')+'</tr></tfoot>'; }
    $('salvBody').innerHTML='<table class="dt">'+head+'<tbody>'+body+'</tbody>'+foot+'</table>';
    var sb=$('sumBtn'); if(sb) sb.addEventListener('click',function(){ showSum=!showSum; render(); fb('숫자 컬럼은 표준 기능으로 합계 확인이 가능합니다 (Σ 47000).'); });
  }
  function render(){ renderCode(); renderSalv(); postHeight(); }
  function fb(t){ $('fb').textContent=t; postHeight(); }

  $('toolbar').addEventListener('click',function(e){
    var b=e.target.closest('.btn'); if(!b) return;
    var a=b.dataset.a;
    $('toolbar').querySelectorAll('.btn').forEach(function(x){x.classList.toggle('on',x===b);});
    if(a==='nofunc'){ funcsOn=false; displayed=true; showSum=false; fb('표시는 됐지만 사용자 조작 기능이 제한됩니다 (set_all 미호출).'); }
    else if(a==='setall'){ funcsOn=true; displayed=true; fb('표준 기능 묶음을 켰습니다 — 직접 하나하나 만들지 않았습니다.'); }
    else if(a==='nodisp'){ funcsOn=true; displayed=false; showSum=false; fb('기능 설정은 화면 표시가 아닙니다 — display( )가 없으면 화면 출력이 없습니다.'); }
    render();
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  $('toolbar').querySelector('.btn[data-a="setall"]').classList.add('on'); funcsOn=true;
  render(); fb('버튼으로 기능 켜기(set_all)와 화면 표시(display)가 어떻게 다른지 확인하세요.');
})();
