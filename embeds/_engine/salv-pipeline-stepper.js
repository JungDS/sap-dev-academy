// ===== salv-pipeline-stepper 엔진 JS — SELECT→Internal Table→SALV (CH11-L04) =====
// DB·Internal Table·SALV 3칸을 SELECT/DESCRIBE/factory/set_all/display 순서로 채운다.
// 단계를 건너뛰면 명확한 피드백을 준다. (데이터 내장 — 본문 정본 SFLIGHT/gt_flight/go_alv/gv_count)
// ★ SALV 칸은 언제나 "Internal Table에 실제로 담긴 것"만 그린다 — SELECT를 건너뛰면 빈 표가 뜬다
//   (본문 §조회 결과가 비었을 때와 같은 인과. 데이터는 DB가 아니라 메모리 표에서 온다).
// ★ 이미 지나간 단계는 소급해서 바뀌지 않는다(스냅샷 의미론) — 두 규칙이 이를 지킨다:
//   ① set_all은 display 이후엔 성공 처리하지 않는다(경고만) — 첫 화면은 이미 그려졌다. 설정은 display 전에.
//   ② '빈 결과 시나리오'는 진행 중인 파이프라인을 뒤에서 비우지 않고 resetSt( )로 처음부터 다시 시작한다.
(function(){
  var $=function(id){return document.getElementById(id);};
  var COLS=[{k:'carrid',l:'항공사'},{k:'connid',l:'노선'},{k:'fldate',l:'운항일'}];
  var FULL=[
    {carrid:'AA',connid:17, fldate:'2026-07-01'},{carrid:'AA',connid:17, fldate:'2026-07-08'},
    {carrid:'LH',connid:400,fldate:'2026-07-02'},{carrid:'LH',connid:402,fldate:'2026-07-03'},
    {carrid:'SQ',connid:15, fldate:'2026-07-05'},{carrid:'SQ',connid:15, fldate:'2026-07-12'}
  ];
  var st;
  function resetSt(empty){ st={sel:false, desc:false, fac:false, set:false, disp:false, empty:!!empty}; }
  resetSt(false);

  function dbRows(){ return st.empty ? [] : FULL; }            // DB에 있는 것
  function itRows(){ return st.sel ? dbRows() : []; }          // 메모리 표에 담긴 것 = SELECT를 해야 채워진다
  function tbl(list,emptyText){
    var head='<thead><tr>'+COLS.map(function(c){return '<th>'+c.l+'</th>';}).join('')+'</tr></thead>';
    var body=list.map(function(r){return '<tr>'+COLS.map(function(c){return '<td>'+r[c.k]+'</td>';}).join('')+'</tr>';}).join('');
    return '<table class="dt">'+head+'<tbody>'+(body||'<tr><td colspan="'+COLS.length+'" class="empty-it">'+emptyText+'</td></tr>')+'</tbody></table>';
  }
  function renderDB(){ $('dbBody').innerHTML=tbl(dbRows(),'0행'); }
  function renderIT(){
    if(!st.sel){ $('itBody').innerHTML='<div class="empty-it">(SELECT 전 — 비어 있음)</div>'; return; }
    var cnt = st.desc ? '<div class="badge cnt">gv_count = '+itRows().length+'</div>' : '';
    $('itBody').innerHTML=cnt+tbl(itRows(),'0행');
  }
  function renderSALV(){
    var html='';
    if(st.fac) html+='<div class="badge lo">go_alv 생성됨</div>';
    if(st.set) html+='<div class="bar"><span class="tbtn">정렬</span><span class="tbtn">필터</span><span class="tbtn">Σ</span><span class="tbtn">엑셀</span></div>';
    if(st.disp){
      html+=tbl(itRows(), st.sel ? '빈 표(정상 — 조회 결과가 0행)' : '빈 표 — SELECT를 건너뛰어 표에 담긴 게 없다');
    } else if(!st.fac){ html='<div class="salv-wait">(아직 ALV 없음)</div>'; }
    else { html+='<div class="salv-wait">factory 완료 — display 전이라 표 없음</div>'; }
    $('salvBody').innerHTML=html;
  }
  function render(){ renderDB(); renderIT(); renderSALV(); markBtns(); postHeight(); }
  function markBtns(){
    ['sel','desc','fac','set','disp','empty'].forEach(function(k){   // empty도 함께 — 리셋 후 표시가 남지 않게
      var b=$('toolbar').querySelector('.btn[data-a="'+k+'"]'); if(b) b.classList.toggle('done', st[k]);
    });
  }
  function fb(t,warn){ $('fb').className='fb'+(warn?' warn':''); $('fb').textContent=t; postHeight(); }

  $('toolbar').addEventListener('click',function(e){
    var b=e.target.closest('.btn'); if(!b) return;
    var a=b.dataset.a;
    if(a==='sel'){ st.sel=true; fb('SELECT는 화면이 아니라 메모리 표(GT_FLIGHT)를 채웁니다.'); }
    else if(a==='desc'){ if(!st.sel){ fb('먼저 SELECT로 데이터를 담아야 행 수를 셀 수 있습니다.',true); return;} st.desc=true; fb('표시 전에 데이터 유무를 확인합니다 — gv_count = '+itRows().length+'.'); }
    else if(a==='fac'){ st.fac=true;
      if(!st.sel) fb('SELECT를 건너뛰었습니다 — go_alv는 만들어지지만 표시할 Internal Table이 비어 있습니다.',true);
      else fb('ALV 객체(go_alv)가 준비됐지만 아직 화면은 열리지 않았습니다.'); }
    else if(a==='set'){ if(!st.fac){ fb('go_alv가 아직 없습니다 — factory가 먼저입니다.',true); return;}
      if(st.disp){ fb('이미 display( )로 화면을 그린 뒤입니다 — 지금 누른 set_all은 열려 있는 첫 화면에 반영되지 않습니다. 툴바 기능은 display 전에 켜세요.',true); return;}
      st.set=true; fb('사용자 조작 기능을 켰습니다(set_all).'); }
    else if(a==='disp'){ if(!st.fac){ fb('go_alv가 아직 없습니다 — factory가 먼저입니다.',true); return;}
      st.disp=true;
      if(!st.sel){ fb('빈 표가 떴습니다 — SELECT를 건너뛰어 Internal Table이 비었기 때문입니다. 표가 비면 SALV가 아니라 SELECT부터 확인하세요.',true); }
      else if(!st.set){ fb('표는 떴지만 표준 기능이 제한될 수 있습니다(set_all 미호출).',true); }
      else { fb('사용자가 보는 화면은 마지막 display( ) 호출에서 열립니다.'); } }
    else if(a==='empty'){ var on=!st.empty;   // 시나리오 전환은 '처음부터' — 이미 조회한 표를 뒤에서 비우지 않는다
      resetSt(on);
      fb(on?'빈 결과 시나리오로 처음부터 — 데이터가 0행인 상황을 SELECT부터 다시 밟아 보세요. 데이터 없음과 ALV 실패는 다릅니다(빈 표는 정상).'
           :'정상 데이터(6행) 시나리오로 처음부터 — SELECT부터 다시 눌러 보세요.'); }
    else if(a==='reset'){ resetSt(false); fb('초기화 — SELECT부터 순서대로 눌러 보세요.'); }
    render();
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render(); fb('SELECT → 행 수 확인 → factory → set_all → display 순서로 눌러 보세요.');
})();
