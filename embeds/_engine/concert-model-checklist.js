// ===== concert-model-checklist 엔진 JS — 콘서트 모델(DDIC) 제작 체크리스트 (CH09-L09) =====
// 제작 단계를 클릭으로 진행(미작성→작성→활성화→검증완료)하고, 관계 미리보기와 테스트 결과가
// 선행 단계 완료에 따라 달라진다. 데이터=window.CMC_CFG.
(function(){
  var STATS=['미작성','작성','활성화','검증완료'];
  var STEPS = [
    {key:'domain', n:'Domain', sub:'공연ID·회차·상태·좌석 의미'},
    {key:'de',     n:'Data Element', sub:'라벨·F4 의미 정보'},
    {key:'zconcert', n:'ZCONCERT', sub:'공연 마스터 (CONCERT_ID·ARTIST·VENUE·CAPACITY)'},
    {key:'zperf',  n:'ZPERF', sub:'공연 회차 (CONCERT_ID·PERF_NO)'},
    {key:'zbooking', n:'ZBOOKING', sub:'예매 (BOOKING_ID·CONCERT_ID·SEATS·STATUS)'},
    {key:'fk',     n:'Foreign Key', sub:'ZBOOKING-CONCERT_ID → ZCONCERT'},
    {key:'sh',     n:'Search Help', sub:'ZSH_CONCERT (ID·아티스트·장소 / EXP=ID)'},
    {key:'data',   n:'테스트 데이터', sub:'공연 2·회차 3·예매 3(정훈영 포함)'}
  ];
  var $=function(id){return document.getElementById(id);};
  var st={}; STEPS.forEach(function(s){ st[s.key]=0; });

  function renderSteps(){
    $('steps').innerHTML = STEPS.map(function(s){
      var v=st[s.key];
      return '<div class="step" data-k="'+s.key+'"><div><div class="step__n">'+s.n+'</div><div class="step__sub">'+s.sub+'</div></div>'
        +'<div class="stat s'+v+'">'+STATS[v]+'</div></div>';
    }).join('');
  }
  function renderProg(){
    var total=STEPS.length*3, sum=STEPS.reduce(function(a,s){return a+st[s.key];},0);
    $('prog').style.width=Math.round(sum/total*100)+'%';
  }
  function on(k){ return st[k]>=2; }   // 활성화 이상이면 동작
  function renderPreview(){
    $('boxConcert').classList.toggle('on', st.zconcert>=1);
    $('boxPerf').classList.toggle('on', st.zperf>=1);
    $('boxBooking').classList.toggle('on', st.zbooking>=1);
    $('relFk').classList.toggle('on', on('fk'));
    $('relPerf').classList.toggle('on', on('fk'));
  }
  function render(){ renderSteps(); renderProg(); renderPreview(); postHeight(); }

  $('steps').addEventListener('click',function(e){
    var s=e.target.closest('.step'); if(!s) return;
    var k=s.dataset.k; st[k]=(st[k]+1)%4; render();
  });
  $('fillAll').addEventListener('click',function(){ STEPS.forEach(function(s){ st[s.key]=3; }); render(); });
  $('clearAll').addEventListener('click',function(){ STEPS.forEach(function(s){ st[s.key]=0; }); $('tout').className='tout'; $('tout').textContent=''; render(); });

  function test(kind){
    var o=$('tout');
    if(kind==='okId'){
      if(on('zconcert')){ o.className='tout ok'; o.innerHTML='✓ <code>C001</code> 통과 — 공연 마스터에 존재.'; }
      else { o.className='tout no'; o.textContent='ZCONCERT가 아직 활성화되지 않아 조회할 수 없습니다.'; }
    } else if(kind==='badId'){
      if(on('fk')){ o.className='tout ok'; o.innerHTML='✓ <code>C999</code> 거부 — Foreign Key가 막아 줍니다.'; }
      else { o.className='tout no'; o.textContent='Foreign Key 미활성화 — 관계가 선언되지 않아 C999가 막히지 않습니다.'; }
    } else if(kind==='f4'){
      if(on('sh')){ o.className='tout ok'; o.innerHTML='✓ F4 → 공연 ID·아티스트·장소 목록 표시, 선택 시 CONCERT_ID 반환.'; }
      else if(on('fk')){ o.className='tout ok'; o.textContent='△ Search Help는 없지만 Foreign Key 기반 Check Table 목록이 뜹니다(설명 컬럼 부족).'; }
      else { o.className='tout no'; o.textContent='도움말이 없어 기본 목록만 — Search Help를 만들어 보세요.'; }
    } else if(kind==='jhy'){
      if(on('zbooking') && on('data')){ o.className='tout ok'; o.innerHTML='✓ 예매 테이블에서 <b>정훈영</b> 행 강조 — 모델 완성.'; }
      else { o.className='tout no'; o.textContent='ZBOOKING과 테스트 데이터가 활성화/입력돼야 확인할 수 있습니다.'; }
    }
    postHeight();
  }
  $('tbtns').addEventListener('click',function(e){ var b=e.target.closest('.tbtn'); if(b) test(b.dataset.t); });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
