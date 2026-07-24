// ===== dcl-auth-comparator 엔진 JS — CDS DCL 권한 필터 결과 비교기 (CH23-L06) =====
// 같은 SELECT FROM ZI_Concert를 사용자별로 실행. mode=#CHECK→DCL 행 필터(venue∈auth만), #NOT_REQUIRED→필터 없음.
// #NOT_REQUIRED에서 권한 밖 venue가 보이면 보안 실패(bad). 행 단위 권한은 결과집합 내용이 핵심. 데이터=window.DAC_CFG.
(function(){
  var $=function(id){return document.getElementById(id);};
  var cfg=window.DAC_CFG||{};
  var ROWS=cfg.concerts||[];
  var USERS=cfg.users||[];
  var ENT=cfg.entity||'ZI_Concert';
  var st={ user:(USERS[0]||{}).id, mode:'CHECK' };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function user(){ return USERS.filter(function(u){return u.id===st.user;})[0]||{auth:[]}; }
  function allowed(venue){ return (user().auth||[]).indexOf(venue)>=0; }

  function renderUsers(){
    $('dacUsers').innerHTML=USERS.map(function(u){
      return '<button class="dac-seg'+(u.id===st.user?' on':'')+'" data-u="'+u.id+'">'+esc(u.id)+'</button>';
    }).join('');
    var u=user(), auth=(u.auth||[]);
    $('dacPfcg').className='dac-pfcg'+(auth.length?'':' none');
    $('dacPfcg').textContent=auth.length ? 'PFCG: VENUE = '+auth.join(', ') : 'PFCG 권한 없음';
  }
  function renderMode(){
    $('dacMode').className='dac-mode '+(st.mode==='CHECK'?'check':'notreq');
    $('dacMode').textContent='@AccessControl: #'+(st.mode==='CHECK'?'CHECK':'NOT_REQUIRED');
  }

  function code(){
    var acc = st.mode==='CHECK'
      ? '<span class="anno">@AccessControl.authorizationCheck: #CHECK</span>'
      : '<span class="anno">@AccessControl.authorizationCheck: #NOT_REQUIRED</span>';
    var dcl='<span class="role">@MappingRole: true</span>\n'+
      '<span class="k">define role</span> ZI_Concert_Role {\n'+
      '  <span class="k">grant select on</span> '+esc(ENT)+'\n'+
      '    <span class="k">where</span> ( venue ) = <span class="k">aspect</span> pfcg_auth( Z_VENUE_AUTH, VENUE, ACTVT = \'03\' );\n}';
    var sql='<span class="k">SELECT</span> concert_id, artist, venue\n'+
      '  <span class="k">FROM</span> <span class="ent">'+esc(ENT)+'</span>\n'+
      '  <span class="k">INTO TABLE</span> <span class="host">@DATA(gt_allowed_concerts)</span>.';
    $('dacDcl').className='dac-code mode-'+(st.mode==='CHECK'?'check':'notreq');
    $('dacDcl').innerHTML=acc+'\n\n'+dcl;
    $('dacSql').innerHTML=sql;
  }

  function result(){
    // #CHECK → DCL이 venue∉auth 행을 걸러냄. #NOT_REQUIRED → 전부 노출.
    var visible = ROWS.filter(function(r){ return st.mode==='NOT_REQUIRED' ? true : allowed(r.venue); });
    var head='<thead><tr><th>concert_id</th><th>artist</th><th>venue</th></tr></thead>';
    var body=visible.map(function(r){
      var bad = !allowed(r.venue);   // 보이면 안 되는데 보이는 행
      return '<tr'+(bad?' class="unauth"':'')+'><td>'+esc(r.id)+'</td><td>'+esc(r.artist)+'</td>'+
        '<td>'+esc(r.venue)+(bad?' <span class="tag">권한 없음</span>':'')+'</td></tr>';
    }).join('');
    $('dacResult').innerHTML = visible.length
      ? '<table class="dt">'+head+'<tbody>'+body+'</tbody></table>'
      : '<div class="dac-none">0건 — 이 사용자가 볼 수 있는 행이 없습니다.</div>';
    $('dacResultHd').textContent='SELECT 결과 — '+st.user+' ('+visible.length+'건)';
    return visible;
  }

  function verdict(){
    var visible = ROWS.filter(function(r){ return st.mode==='NOT_REQUIRED' ? true : allowed(r.venue); });
    var leak = visible.filter(function(r){ return !allowed(r.venue); }).length;
    var v=$('dacVerdict');
    if(st.mode==='NOT_REQUIRED' && leak>0){
      v.className='dac-verdict bad';
      v.innerHTML='<b>보안 실패 위험.</b> <code>#NOT_REQUIRED</code>라 권한 검사가 없어 권한 밖 venue가 <b>'+leak+'건</b> 노출됩니다 — 오류가 없다고 통과가 아닙니다(결과집합 내용이 핵심).';
    }else if(st.mode==='CHECK'){
      var n=visible.length;
      v.className='dac-verdict ok';
      v.innerHTML= n>0
        ? '<b>권한 필터 적용.</b> 같은 SELECT인데 이 사용자에게는 <b>'+n+'건</b>만 보입니다. 행 단위 보안이 모델에서 작동합니다.'
        : '<b>0건 (정상).</b> 권한이 없어 한 행도 보이지 않습니다 — 행 단위 보안이 막은 것입니다.';
    }else{
      v.className='dac-verdict ok';
      v.innerHTML='<b>노출 없음.</b> 이 사용자의 권한이 보이는 모든 venue를 포함합니다.';
    }
  }

  function render(){ renderUsers(); renderMode(); code(); result(); verdict(); }

  $('dacUsers').addEventListener('click',function(e){ var b=e.target.closest('.dac-seg'); if(!b) return; st.user=b.dataset.u; render(); });
  $('dacMode').addEventListener('click',function(){ st.mode=(st.mode==='CHECK'?'NOT_REQUIRED':'CHECK'); render(); });

  render();
})();
