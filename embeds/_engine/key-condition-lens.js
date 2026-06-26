// ===== key-condition-lens 엔진 JS — 키 조건 vs 일반 필드 vs 보조 인덱스 (CH08-L06) =====
// 키 일부/전체를 채워 후보 행이 좁혀지는 장면, 일반 필드는 전 행을 훑는 장면을 보여 준다.
// 성능 ms는 단정하지 않음 — "찾는 길"의 차이만 체감. 데이터=window.KCL_CFG.
(function(){
  var cfg = window.KCL_CFG || {};
  var DATA = cfg.data || [];
  var KEY = cfg.key || {carrid:'KE', connid:'0701', fldate:'2026-06-23'};   // full key 예시값
  var GEN = cfg.general || {field:'planetype', val:'747-400'};
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var mode='key';
  var given={carrid:true, connid:false, fldate:false};   // 어떤 키 부분을 조건으로 줬는지

  function rowCells(r, cls){
    return '<div class="rowline '+(cls||'')+'"><span>'+esc(r.carrid)+'</span><span>'+esc(r.connid)+'</span>'
      +'<span>'+esc(r.fldate)+'</span><span class="pt">'+esc(r.planetype)+'</span></div>';
  }

  function renderKey(){
    var parts=['carrid','connid','fldate'].filter(function(k){return given[k];});
    var candidates=DATA.filter(function(r){ return parts.every(function(k){ return r[k]===KEY[k]; }); });
    // 후보 표시(주어진 키 부분 만족 = 후보, 전체 키 만족 = hit)
    var full = given.carrid&&given.connid&&given.fldate;
    var list=DATA.map(function(r){
      var isCand=parts.every(function(k){return r[k]===KEY[k];});
      var isHit=full&&isCand;
      return rowCells(r, isHit?'hit':(isCand?'cand':''));
    }).join('');
    $('left').innerHTML='<div class="panel__hd">SFLIGHT — 정렬된 키로 접근</div><div class="panel__body">'
      +'<div class="rowline" style="font-weight:800;color:var(--ink)"><span>CARRID</span><span>CONNID</span><span>FLDATE</span><span>PLANETYPE</span></div>'
      +list
      +'<div class="funnel"><div class="frung" style="width:'+Math.max(34, Math.round(candidates.length/DATA.length*100))+'%">후보 '+candidates.length+'행<small>('+DATA.length+'행 중)</small></div></div>'
      +'</div>';
    var pct=Math.round(parts.length/3*100);
    var pathTxt = full ? '정렬된 키로 바로 1행' : (parts.length? '키 앞부분으로 범위 좁히기' : '키 조건 없음 → 전체 훑기');
    $('right').innerHTML='<div class="metrics">'
      +'<div class="mcard"><div class="k">키 조건 완성도</div><div class="v">'+parts.length+'/3 (key)</div><div class="meter"><i style="width:'+pct+'%"></i></div></div>'
      +'<div class="mcard green"><div class="k">접근 방식</div><div class="v" style="font-size:.8rem">'+pathTxt+'</div></div>'
      +'<div class="mcard"><div class="k">예상 후보 행 수</div><div class="v">'+candidates.length+'행</div></div>'
      +'</div>';
  }

  function renderGeneral(){
    var matched=DATA.filter(function(r){return r[GEN.field]===GEN.val;});
    var list=DATA.map(function(r){
      var hit=r[GEN.field]===GEN.val;
      return rowCells(r, hit?'hit scan':'scan');
    }).join('');
    $('left').innerHTML='<div class="panel__hd">SFLIGHT — 일반 필드는 정렬 경로가 없다</div><div class="panel__body">'
      +'<div class="rowline" style="font-weight:800;color:var(--ink)"><span>CARRID</span><span>CONNID</span><span>FLDATE</span><span>PLANETYPE</span></div>'
      +list
      +'<div style="margin-top:8px;font-size:.76rem;color:var(--amber);font-weight:700">⟳ '+GEN.field+" = '"+GEN.val+"' — 정렬 경로가 없으면 모든 행을 확인해야 할 수 있다(주황=훑음)</div>"
      +'</div>';
    $('right').innerHTML='<div class="metrics">'
      +'<div class="mcard amber"><div class="k">접근 방식</div><div class="v" style="font-size:.8rem">여러 행을 훑어 확인</div></div>'
      +'<div class="mcard"><div class="k">DB가 확인할 가능성</div><div class="v">전체 '+DATA.length+'행</div></div>'
      +'<div class="mcard green"><div class="k">일치 행</div><div class="v">'+matched.length+'행</div></div>'
      +'</div>';
  }

  function renderIndex(){
    $('left').innerHTML='<div class="panel__hd">보조 인덱스(Secondary Index) — 개념만</div><div class="panel__body">'
      +'<div class="idxdiag">'
      +'<div class="idxcard"><h4>① 기본 키 경로</h4><p>테이블은 <b>Primary Key</b>(carrid·connid·fldate)로 정렬돼 있어, 키로 찾으면 바로 도달한다.</p></div>'
      +'<div class="idxcard alt"><h4>② 보조 인덱스 경로</h4><p>자주 쓰는 <b>일반 필드 조합</b>(예: planetype)에 별도의 "찾기 경로"를 하나 더 만들 수 있다.</p></div>'
      +'</div>'
      +'<p style="margin:10px 0 0;font-size:.78rem;color:var(--ink-soft)">인덱스는 "빠르게 만드는 버튼"이 아니라 <b>조회 경로를 설계하는 객체</b>다. 생성 절차·남용 팁은 여기서 다루지 않는다.</p>'
      +'</div>';
    $('right').innerHTML='<div class="metrics">'
      +'<div class="mcard"><div class="k">쓰기 비용</div><div class="v" style="font-size:.8rem">인덱스가 늘면 입력·수정이 느려질 수 있음</div></div>'
      +'<div class="mcard"><div class="k">S/4HANA 환경</div><div class="v" style="font-size:.8rem">컬럼 저장 — 인덱스 남발이 답이 아닐 때가 많음</div></div>'
      +'<div class="mcard green"><div class="k">결론</div><div class="v" style="font-size:.8rem">설계 검토 후 꼭 필요한 곳만</div></div>'
      +'</div>';
  }

  function render(){
    $('keysel').style.display = mode==='key' ? 'flex' : 'none';
    if(mode==='key') renderKey();
    else if(mode==='general') renderGeneral();
    else renderIndex();
    postHeight();
  }

  $('modes').addEventListener('click',function(e){
    var b=e.target.closest('.mbtn'); if(!b) return;
    mode=b.dataset.m;
    $('modes').querySelectorAll('.mbtn').forEach(function(x){x.classList.toggle('on',x===b);});
    render();
  });
  // <label>이 내부 <input> 클릭을 재유발해 두 번 토글되는 것을 피하려고 change 이벤트로 처리(input.checked가 단일 출처).
  $('keysel').addEventListener('change',function(e){
    var input=e.target.closest('input'); if(!input) return;
    var l=e.target.closest('.kchk'); if(!l) return;
    var k=l.dataset.k; given[k]=input.checked;
    l.classList.toggle('on',given[k]);
    render();
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
