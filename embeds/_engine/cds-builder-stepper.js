// ===== cds-builder-stepper 엔진 JS — 콘서트 CDS 빌더 (CH23-L07 capstone) =====
// 6단계 순서 의존: ①ZI_Perf ②ZI_Concert(+_Perf assoc, target=ZI_Perf 필요) ③ZC_Concert(소비 뷰 nesting) ④Metadata Extension(zc 필요)
// ⑤Data Preview(zi&zc 필요) ⑥소비 코드(zc 필요). 순서 어기면 bad. 산출물 4개 active 다이어그램. 데이터=window.CBS_CFG.
(function(){
  var $=function(id){return document.getElementById(id);};
  var cfg=window.CBS_CFG||{};
  var CONCERTS=cfg.concerts||[];
  var st={ ziPerf:false, ziConcert:false, zcConcert:false, mdext:false, preview:false, consume:false };

  var STEPS=[
    {id:'ziPerf',   label:'ZI_Perf 만들기'},
    {id:'ziConcert',label:'ZI_Concert + _Perf'},
    {id:'zcConcert',label:'ZC_Concert (소비 뷰)'},
    {id:'mdext',    label:'Metadata Extension'},
    {id:'preview',  label:'Data Preview'},
    {id:'consume',  label:'소비 코드 생성'}
  ];

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function setMsg(t,cls){ var m=$('cbsMsg'); m.className='cbs-msg '+cls; m.innerHTML=t; }

  function renderSteps(){
    $('cbsSteps').innerHTML=STEPS.map(function(s,i){
      return '<button class="cbs-step'+(st[s.id]?' done':'')+'" data-s="'+s.id+'"><span class="n">'+(i+1)+'.</span>'+esc(s.label)+(st[s.id]?' ✓':'')+'</button>';
    }).join('')+'<button class="cbs-reset" id="cbsReset">↺ 리셋</button>';
  }
  function renderArts(){
    var arts=[
      {nm:'ZI_Perf', role:'회차 기반', on:st.ziPerf},
      {nm:'ZI_Concert', role:'공연 기반 +_Perf', on:st.ziConcert},
      {nm:'ZC_Concert', role:'소비 뷰(nesting)', on:st.zcConcert},
      {nm:'DDLX', role:'UI 주석 분리', on:st.mdext}
    ];
    $('cbsArts').innerHTML=arts.map(function(a){
      return '<div class="cbs-art'+(a.on?' active':'')+'"><div class="cbs-art__nm">'+esc(a.nm)+'</div>'+
        '<div class="cbs-art__role">'+esc(a.role)+'</div><div class="cbs-art__st"></div></div>';
    }).join('');
  }
  function renderOut(){
    var html='';
    if(st.preview){
      var head='<thead><tr><th>concert_id</th><th>artist</th><th>venue</th></tr></thead>';
      var body=CONCERTS.map(function(c){return '<tr><td>'+esc(c.id)+'</td><td>'+esc(c.artist)+'</td><td>'+esc(c.venue)+'</td></tr>';}).join('');
      html+='<div class="cbs-prev">'+
        '<div><p class="cbs-prev__t zi">ZI_Concert (기반)</p><table class="dt">'+head+'<tbody>'+body+'</tbody></table></div>'+
        '<div><p class="cbs-prev__t zc">ZC_Concert (소비)</p><table class="dt">'+head+'<tbody>'+body+'</tbody></table></div>'+
        '</div><span class="cbs-eq">두 뷰 모두 '+CONCERTS.length+'행 — 소비 뷰는 행 수를 바꾸지 않습니다</span>';
    }
    if(st.consume){
      html+=(st.preview?'<div style="height:9px"></div>':'')+
        '<pre class="cbs-code"><span class="k">SELECT</span> concert_id, artist, venue, capacity\n'+
        '  <span class="k">FROM</span> <span class="ent">ZC_Concert</span>\n'+
        '  <span class="k">INTO TABLE</span> <span class="host">@DATA(gt_concerts)</span>.</pre>';
    }
    if(!html) html='<div class="cbs-empty">⑤ Data Preview · ⑥ 소비 코드 생성을 실행하면 여기에 결과가 나옵니다.</div>';
    $('cbsOut').innerHTML='<p class="cbs-out__cap">산출 결과</p>'+html;
  }
  function render(){ renderSteps(); renderArts(); renderOut(); }

  function doStep(id){
    if(id==='ziPerf'){ st.ziPerf=true; setMsg('<b>ZI_Perf 활성화.</b> 회차 기반 뷰가 준비됐습니다 — association target으로 쓸 수 있어요.','ok'); }
    else if(id==='ziConcert'){
      if(!st.ziPerf){ setMsg('<b>활성화 실패.</b> <code>_Perf</code> association의 target인 <b>ZI_Perf</b>가 아직 없습니다 — ①을 먼저 만드세요(활성화 순서).','bad'); return; }
      st.ziConcert=true; setMsg('<b>ZI_Concert 활성화.</b> <code>_Perf</code> association이 <code>concert_id</code>로 ZI_Perf에 연결됐습니다.','ok');
    }
    else if(id==='zcConcert'){
      if(!st.ziConcert){ setMsg('<b>활성화 실패.</b> 기반인 <b>ZI_Concert</b>가 먼저 있어야 합니다 — ②를 만드세요.','bad'); return; }
      st.zcConcert=true; setMsg('<b>ZC_Concert 활성화.</b> ZI_Concert 위에 소비용 뷰를 얹고 <code>_Perf</code>도 노출했습니다.','ok');
    }
    else if(id==='mdext'){
      if(!st.zcConcert){ setMsg('<b>활성화 실패.</b> annotate할 대상 <b>ZC_Concert</b>가 먼저 있어야 합니다 — ③을 만드세요.','bad'); return; }
      st.mdext=true; setMsg('<b>Metadata Extension 활성화.</b> UI 주석을 DDLX로 분리했습니다(대상에 <code>@Metadata.allowExtensions: true</code> 필요).','ok');
    }
    else if(id==='preview'){
      if(!(st.ziConcert && st.zcConcert)){ setMsg('<b>미리볼 수 없습니다.</b> ZI_Concert·ZC_Concert가 모두 활성화돼야 합니다(②③).','bad'); return; }
      st.preview=true; setMsg('<b>Data Preview.</b> 노출 필드는 달라도 행 수는 같습니다 — 소비 뷰는 열만 고를 뿐 행을 바꾸지 않아요.','ok');
    }
    else if(id==='consume'){
      if(!st.zcConcert){ setMsg('<b>생성 실패.</b> 소비할 <b>ZC_Concert</b>가 먼저 있어야 합니다 — ③을 만드세요.','bad'); return; }
      st.consume=true; setMsg('<b>소비 코드 생성.</b> 프로그램은 테이블이 아니라 <code>ZC_Concert</code> 모델만 읽습니다.','ok');
    }
    render();
  }

  $('cbsSteps').addEventListener('click',function(e){
    var r=e.target.closest('#cbsReset');
    if(r){ st={ziPerf:false,ziConcert:false,zcConcert:false,mdext:false,preview:false,consume:false}; setMsg('초기화 — ①부터 순서대로 만들어 보세요. ②를 먼저 누르면 어떻게 되는지도 확인하세요.','ok'); render(); return; }
    var b=e.target.closest('.cbs-step'); if(!b) return; doStep(b.dataset.s);
  });

  render();
  setMsg('①부터 순서대로 만들어 보세요. ②(ZI_Concert)를 먼저 누르면 <b>association target 없음</b> 오류가 납니다.','ok');
})();
