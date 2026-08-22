// ===== dcl-auth-comparator 엔진 JS — CDS DCL 권한 필터 결과 비교기 (CH23-L06) =====
// 같은 SELECT FROM ZI_Concert를 사용자 × @AccessControl 3값(#CHECK/#NOT_REQUIRED/#NOT_ALLOWED) × DCL source 유/무로 비교.
// 본문 L06 3값 표(정본, ABENCDS_1180334353_ANNO — C058 교정):
//   #CHECK        · DCL 있음=평가(필터)          · DCL 없음=활성화 경고(있어야 하는데 없다)
//   #NOT_REQUIRED · DCL 있음=똑같이 평가(필터)    · DCL 없음=경고 없음(생략 시 기본값) — "DCL 끄기"가 아님
//   #NOT_ALLOWED  · DCL 있음=무시(필터 미적용+경고) · DCL 없음=아무 일 없음(권한 검사가 해로운 기술 entity용)
// 직접 비교 축(본문) = #CHECK ↔ #NOT_ALLOWED(존재 DCL 무시 → 권한 밖 공연장 노출 bad). privileged access는 note 1줄(L1).
// 데이터=window.DAC_CFG(entity/users auth/concerts venue).
(function(){
  var $=function(id){return document.getElementById(id);};
  var cfg=window.DAC_CFG||{};
  var ROWS=cfg.concerts||[];
  var USERS=cfg.users||[];
  var ENT=cfg.entity||'ZI_Concert';
  var MODES=['CHECK','NOT_REQUIRED','NOT_ALLOWED'];
  var st={ user:(USERS[0]||{}).id, mode:'CHECK', dcl:true };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function user(){ return USERS.filter(function(u){return u.id===st.user;})[0]||{auth:[]}; }
  function allowed(venue){ return (user().auth||[]).indexOf(venue)>=0; }
  function ignored(){ return st.dcl && st.mode==='NOT_ALLOWED'; }            // DCL이 있는데 무시되는 상태
  function filtered(){ return st.dcl && st.mode!=='NOT_ALLOWED'; }           // DCL 존재 + #CHECK/#NOT_REQUIRED → 평가
  function warnLine(){
    if(st.mode==='CHECK' && !st.dcl) return '⚠ 활성화 경고 — #CHECK 기대와 달리 access control이 아직 없습니다.';
    if(ignored()) return '⚠ 활성화 경고 — access control이 있지만 #NOT_ALLOWED라 런타임에 무시됩니다.';
    return '';
  }
  function visibleRows(){ return filtered() ? ROWS.filter(function(r){ return allowed(r.venue); }) : ROWS.slice(); }

  function renderUsers(){
    $('dacUsers').innerHTML=USERS.map(function(u){
      return '<button class="dac-seg'+(u.id===st.user?' on':'')+'" data-u="'+u.id+'">'+esc(u.id)+'</button>';
    }).join('');
    var u=user(), auth=(u.auth||[]);
    $('dacPfcg').className='dac-pfcg'+(auth.length?'':' none');
    $('dacPfcg').textContent=auth.length ? 'PFCG: VENUE = '+auth.join(', ') : 'PFCG 권한 없음';
  }
  function renderMode(){
    $('dacModeSeg').innerHTML=MODES.map(function(m){
      return '<button class="dac-mode'+(m===st.mode?' on':'')+'" data-m="'+m+'">#'+m+'</button>';
    }).join('');
    $('dacDclTog').className='dac-mode '+(st.dcl?'check':'notreq');
    $('dacDclTog').textContent=(st.dcl?'DCL source 있음 (define role)':'DCL source 없음');
  }

  function code(){
    var acc='<span class="anno">@AccessControl.authorizationCheck: #'+st.mode+'</span>';
    var w=warnLine();
    var dcl= st.dcl
      ? '<span class="role">@MappingRole: true</span>\n'+
        '<span class="k">define role</span> ZI_Concert_Role {\n'+
        '  <span class="k">grant select on</span> '+esc(ENT)+'\n'+
        '    <span class="k">where</span> ( venue ) = <span class="k">aspect</span> pfcg_auth( Z_VENUE, VENUE, ACTVT = \'03\' );\n}'
      : '<span class="cmt">// (DCL source 없음 — 이 entity를 대상으로 한 access control 미작성)</span>';
    var sql='<span class="k">SELECT</span> concert_id, artist, venue\n'+
      '  <span class="k">FROM</span> <span class="ent">'+esc(ENT)+'</span>\n'+
      '  <span class="k">INTO TABLE</span> <span class="host">@DATA(gt_concerts)</span>.';
    $('dacDcl').className='dac-code'+(w?' mode-warn':'');
    $('dacDcl').innerHTML=acc+(w?'\n<span class="warntag">'+esc(w)+'</span>':'')+'\n\n'+dcl;
    $('dacSql').innerHTML=sql;
  }

  function result(){
    var visible=visibleRows();
    var head='<thead><tr><th>concert_id</th><th>artist</th><th>venue</th></tr></thead>';
    var body=visible.map(function(r){
      var outside=!allowed(r.venue);
      var leak=outside && ignored();            // DCL이 있는데 무시돼 새는 행 → 빨강
      var out=outside && !st.dcl;               // 필터 자체가 없어 보이는 PFCG 밖 행 → 회색
      return '<tr'+(leak?' class="unauth"':'')+'><td>'+esc(r.id)+'</td><td>'+esc(r.artist)+'</td>'+
        '<td>'+esc(r.venue)+(leak?' <span class="tag">권한 없음 · DCL 무시됨</span>':(out?' <span class="tag out">PFCG 밖</span>':''))+'</td></tr>';
    }).join('');
    $('dacResult').innerHTML = visible.length
      ? '<table class="dt">'+head+'<tbody>'+body+'</tbody></table>'
      : '<div class="dac-none">0건 — 이 사용자가 볼 수 있는 행이 없습니다.</div>';
    $('dacResultHd').textContent='SELECT 결과 — '+st.user+' ('+visible.length+'건)';
  }

  function verdict(){
    var vis=visibleRows(), n=vis.length, total=ROWS.length, v=$('dacVerdict');
    var leak=vis.filter(function(r){ return !allowed(r.venue); }).length;
    if(st.dcl){
      if(st.mode==='NOT_ALLOWED'){
        v.className='dac-verdict bad';
        v.innerHTML='<b>존재하는 DCL이 무시됩니다.</b> <code>#NOT_ALLOWED</code>라 권한 필터가 적용되지 않아 권한 밖 공연장 행 <b>'+leak+'건</b>이 그대로 노출돼요(활성화 경고도 뜹니다). 같은 SELECT를 <code>#CHECK</code>로 돌리면 걸러집니다 — 보호가 목적인 뷰에 이 값을 쓰면 안 됩니다.';
      }else if(st.mode==='NOT_REQUIRED'){
        v.className='dac-verdict ok';
        v.innerHTML='<b>DCL이 있으면 <code>#NOT_REQUIRED</code>에서도 똑같이 평가됩니다.</b> 결과('+n+'건)가 <code>#CHECK</code>와 같아요 — 차이는 DCL이 없을 때 경고가 뜨는지뿐입니다. 이 값은 "DCL 끄기"가 아니에요(그건 <code>#NOT_ALLOWED</code>).';
      }else if(n>0){
        v.className='dac-verdict ok';
        v.innerHTML='<b>권한 필터 적용.</b> 같은 SELECT인데 이 사용자에게는 <b>'+n+'건</b>만 보입니다. 행 단위 보안이 모델에서 작동합니다.';
      }else{
        v.className='dac-verdict ok';
        v.innerHTML='<b>0건 (정상).</b> 권한이 없어 한 행도 보이지 않습니다 — 행 단위 보안이 막은 것입니다.';
      }
    }else if(st.mode==='CHECK'){
      v.className='dac-verdict warn';
      v.innerHTML='<b>활성화 경고 + 필터 없음.</b> <code>#CHECK</code>는 "access control이 있어야 한다"는 기대 선언인데 DCL이 아직 없습니다 — 경고가 뜨고, 걸러 줄 규칙이 없으니 전 행 <b>'+total+'건</b>이 그대로 보여요. 보호가 목적이라면 DCL을 만들어야 합니다.';
    }else if(st.mode==='NOT_REQUIRED'){
      v.className='dac-verdict';
      v.innerHTML='<b><code>#NOT_REQUIRED</code>의 본뜻.</b> 이 뷰는 access control이 없어도 된다고 선언했고(생략 시 기본값) DCL도 없습니다 — 경고 없이 전 행 <b>'+total+'건</b>이 보여요(단순 조회 예제에 맞는 상태). 보호가 필요한 데이터라면 이 선언이 아니라 <b>#CHECK + DCL</b>이 맞습니다.';
    }else{
      v.className='dac-verdict';
      v.innerHTML='<b>아무 일 없음.</b> 무시할 DCL이 없으니 전 행 <b>'+total+'건</b>이 보이고 경고도 없어요. <code>#NOT_ALLOWED</code>는 "이 entity엔 access control을 두지 않는다"는 선언 — 권한 검사가 오히려 해로운 기술 entity에 씁니다.';
    }
  }

  function render(){ renderUsers(); renderMode(); code(); result(); verdict(); }

  $('dacUsers').addEventListener('click',function(e){ var b=e.target.closest('.dac-seg'); if(!b) return; st.user=b.dataset.u; render(); });
  $('dacModeSeg').addEventListener('click',function(e){ var b=e.target.closest('.dac-mode'); if(!b) return; st.mode=b.dataset.m; render(); });
  $('dacDclTog').addEventListener('click',function(){ st.dcl=!st.dcl; render(); });

  render();
})();
