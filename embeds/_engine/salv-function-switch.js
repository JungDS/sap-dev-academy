// ===== salv-function-switch 엔진 JS — SALV 표준 기능 vs 화면 표시 구분 (CH11-L03) =====
// set_all(기능 켜기)과 display(화면 표시)가 별개임을 버튼 시나리오로 보여 준다. (코드/데이터 내장)
// 시나리오 4종 — nofunc(기능 끄고 표시) · setall(정상) · nodisp(display 빼기) · late(display 뒤에 set_all).
// 데이터는 본문 정본과 동일한 SFLIGHT 연습 데이터(gt_flight) — L02에서 이어지는 그 객체 go_alv.
(function(){
  var $=function(id){return document.getElementById(id);};
  var COLS=[{k:'carrid',l:'항공사'},{k:'connid',l:'노선',num:true},{k:'fldate',l:'운항일'},{k:'seatsocc',l:'예약 좌석',num:true}];
  var ROWS=[
    {carrid:'AA',connid:17, fldate:'2026-07-01',seatsocc:371},
    {carrid:'AA',connid:17, fldate:'2026-07-08',seatsocc:120},
    {carrid:'LH',connid:400,fldate:'2026-07-02',seatsocc:275},
    {carrid:'LH',connid:402,fldate:'2026-07-03',seatsocc:64},
    {carrid:'SQ',connid:15, fldate:'2026-07-05',seatsocc:305},
    {carrid:'SQ',connid:15, fldate:'2026-07-12',seatsocc:98}
  ];
  var SUMKEY='seatsocc';
  function total(){ return ROWS.reduce(function(a,r){return a+r[SUMKEY];},0); }

  // mode ∈ 'nofunc' | 'setall' | 'nodisp' | 'late'
  var mode='setall', showSum=false;
  function funcsOn(){ return mode==='setall'; }        // 툴바 버튼이 실제로 생기는가
  function displayed(){ return mode!=='nodisp'; }      // 화면이 열렸는가

  var SET='go_alv-&gt;<span class="tok-kw">get_functions</span>( )-&gt;<span class="tok-kw">set_all</span>( <span class="tok-bool">abap_true</span> ).';
  var DISP='go_alv-&gt;<span class="tok-kw">display</span>( ).';
  function line(html,cls){ return '<span class="cline'+(cls?' '+cls:'')+'">'+html+'</span>'; }
  function renderCode(){
    var html;
    if(mode==='late'){                                  // 순서가 뒤집힌 코드 — 화면부터 그려 버린다
      html = line(DISP,'hot')
           + line(SET+'<span class="tok-com">  " 이미 그려진 뒤라 소용없다</span>','dim');
    } else if(mode==='nofunc'){
      html = line('go_alv-&gt;get_functions( )-&gt;set_all( abap_true ).<span class="tok-com">  " 안 켬</span>','dim')
           + line(DISP,'hot');
    } else {
      html = line(SET, funcsOn()?'hot':'') + line(DISP, displayed()?'hot':'dim');
    }
    $('code').innerHTML=html;
  }
  function barHtml(){
    if(funcsOn()) return '<span class="tbtn">정렬</span><span class="tbtn ext">필터</span><span class="tbtn ext sum" id="sumBtn">Σ 합계</span><span class="tbtn ext">엑셀</span><span class="tbtn ext">인쇄</span>';
    if(mode==='late') return '<span class="muted">툴바가 비어 있습니다 — set_all이 display 뒤에 있어 이미 그려진 화면에 버튼이 붙지 못했습니다</span>';
    return '<span class="muted">표준 기능이 제한적입니다 (set_all 미호출)</span>';
  }
  function renderSalv(){
    if(!displayed()){ $('salvBody').innerHTML='<div class="hidden-msg">아직 화면 표시 안 됨 — display( )를 호출해야 표가 열립니다.</div>'; $('bar').style.display='none'; return; }
    $('bar').style.display='flex';
    $('bar').className='sfs-bar'+(funcsOn()?'':' minimal');
    $('bar').innerHTML=barHtml();
    var head='<thead><tr>'+COLS.map(function(c){return '<th class="'+(c.num?'num':'')+'">'+c.l+'</th>';}).join('')+'</tr></thead>';
    var body=ROWS.map(function(r){return '<tr>'+COLS.map(function(c){return '<td class="'+(c.num?'num':'')+'">'+r[c.k]+'</td>';}).join('')+'</tr>';}).join('');
    var foot='';
    if(showSum&&funcsOn()){
      foot='<tfoot><tr>'+COLS.map(function(c){return '<td class="'+(c.num?'num':'')+'">'+(c.k===SUMKEY?('Σ '+total()):'')+'</td>';}).join('')+'</tr></tfoot>'; }
    $('salvBody').innerHTML='<table class="dt">'+head+'<tbody>'+body+'</tbody>'+foot+'</table>';
    var sb=$('sumBtn'); if(sb) sb.addEventListener('click',function(){ showSum=!showSum; render(); fb('숫자 컬럼은 표준 기능으로 합계 확인이 가능합니다 (Σ '+total()+').'); });
  }
  function render(){ renderCode(); renderSalv(); postHeight(); }
  function fb(t){ $('fb').textContent=t; postHeight(); }

  var MSG={
    nofunc:'표시는 됐지만 사용자 조작 기능이 제한됩니다 (set_all 미호출).',
    setall:'표준 기능 묶음을 켰습니다 — 직접 하나하나 만들지 않았습니다.',
    nodisp:'기능 설정은 화면 표시가 아닙니다 — display( )가 없으면 화면 출력이 없습니다.',
    late:'순서가 뒤집혔습니다 — 기능을 켜는 줄은 display( )보다 먼저 와야 합니다.'
  };
  $('toolbar').addEventListener('click',function(e){
    var b=e.target.closest('.btn'); if(!b) return;
    $('toolbar').querySelectorAll('.btn').forEach(function(x){x.classList.toggle('on',x===b);});
    mode=b.dataset.a; showSum=false;
    fb(MSG[mode]||''); render();
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  $('toolbar').querySelector('.btn[data-a="setall"]').classList.add('on');
  render(); fb('버튼으로 기능 켜기(set_all)와 화면 표시(display)가 어떻게 다른지 확인하세요.');
})();
