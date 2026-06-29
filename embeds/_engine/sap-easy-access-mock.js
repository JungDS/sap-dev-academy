// ===== sap-easy-access-mock 엔진 JS — 명령창 직행 플레이그라운드 (CH01-L02) =====
// Easy Access ↔ 트랜잭션(SE38/SE11/SE80) 인터랙티브. 핵심 규칙:
//  · 접두어 없는 코드는 "Easy Access에서만" 이동. 트랜잭션 안에선 /n 없이는 막힘(강조).
//  · /n<code> /o<code> ("/n SE38"처럼 공백 허용)는 어디서든 이동.  · /nex( "/n ex")=로그아웃.
//  · 이 데모 유효 코드 = SE38·SE11·SE80 뿐. 그 외는 "트랜잭션 없음".
(function(){
  var VALID={ SE38:'ABAP Editor', SE11:'ABAP Dictionary', SE80:'Object Navigator' };
  var ICON={ SE38:'📝', SE11:'🗄️', SE80:'🧭' };
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var screen='easy';          // 'easy' | 'SE38'|'SE11'|'SE80' | 'logout'
  var msg='', kind='';        // 결과 스트립

  function easyHtml(){
    var folders=['사무관리','인사관리','재무회계','관리회계','물류관리','판매관리','생산관리','도구'];
    return '<div class="eam-grid"><div class="eam-tree">'
      +'<div class="trow"><span class="ar">▶</span> 즐겨찾기</div>'
      +'<div class="trow root"><span class="ar">▼</span> SAP 메뉴</div>'
      + folders.map(function(f){return '<div class="trow fold"><span class="ar">▶</span> <span class="fico">📁</span> '+f+'</div>';}).join('')
      +'</div><div class="eam-main"><h3>SAP Easy Access</h3><div class="sub">사용자 메뉴</div>'
      +'<div class="eam-illus"><div class="mon"><b>SAP</b></div><div class="path"></div><div class="pin">📍</div></div></div></div>';
  }
  function txnHtml(code){
    var form = code==='SE38' ? 'Program' : code==='SE11' ? 'Database table' : 'Object';
    return '<div class="eam-txn"><div class="eam-txn__hd"><span class="ic">'+ICON[code]+'</span> '+code+' <small>'+esc(VALID[code])+'</small></div>'
      +'<div class="eam-txn__body">여기는 <b>'+code+'</b> 화면입니다(Easy Access가 아님).'
      +'<div class="eam-txn__form">'+form+' <input type="text" placeholder="..." /></div></div>'
      +'<div class="eam-hint">⚠️ 지금은 <b>Easy Access가 아닙니다.</b> 여기서 다른 화면으로 가려면 접두어 없이는 안 되고 <b>/n</b>을 붙여야 합니다 — 예: <code>/nSE11</code></div>'
      +'<button class="eam-back" id="back" type="button">↩ Easy Access로 (/n)</button></div>';
  }
  function logoutHtml(){
    return '<div class="eam-logout"><div class="big">🚪 로그아웃되었습니다</div>'
      +'<div class="sub"><code style="font-family:var(--mono)">/nex</code> 는 확인 창 없이 즉시 세션을 종료합니다.</div>'
      +'<button class="eam-restart" id="restart" type="button">↻ 다시하기 (Easy Access로)</button></div>';
  }

  function render(){
    // 명령창: 로그아웃이면 숨김
    $('cmdrow').style.display = screen==='logout' ? 'none' : 'flex';
    $('menubarWhere').textContent = screen==='logout' ? '— 로그아웃' :
      (screen==='easy' ? '현재: SAP Easy Access' : '현재: '+screen+' (트랜잭션 안)');
    $('menubarWhere').style.display = screen==='logout' ? 'none' : 'inline-block';
    // 결과 스트립
    var st=$('status');
    if(msg){ st.className='eam-status show '+kind; st.innerHTML=msg; }
    else { st.className='eam-status'; st.innerHTML=''; }
    // 본문
    var b=$('body');
    if(screen==='logout') b.innerHTML=logoutHtml();
    else if(screen==='easy') b.innerHTML=easyHtml();
    else b.innerHTML=txnHtml(screen);
    var back=b.querySelector('#back'); if(back) back.addEventListener('click', function(){ go('easy','↩ Easy Access로 돌아왔습니다.','ok'); $('cmd').value=''; });
    var rs=b.querySelector('#restart'); if(rs) rs.addEventListener('click', function(){ msg=''; go('easy','',''); $('cmd').value='SE38'; $('cmd').focus(); });
    postHeight();
  }
  function go(s,m,k){ screen=s; msg=m; kind=k; render(); }
  function status(m,k){ msg=m; kind=k; render(); }

  function run(raw){
    var s=(raw||'').trim();
    if(!s){ status('명령창에 코드를 입력하세요(예: SE38).','err'); return; }
    var low=s.toLowerCase();
    // /nex 또는 /n ex → 로그아웃
    if(/^\/n\s*ex$/.test(low)){ go('logout','','' ); return; }
    // /n<code> 또는 /o<code> (공백 허용)
    var m=low.match(/^(\/n|\/o)\s*([a-z0-9]+)$/);
    if(m){
      var pre=m[1], code=m[2].toUpperCase();
      if(!VALID[code]){ status('‘'+esc(code)+'’ 트랜잭션은 이 데모에 없습니다 — <b>SE38·SE11·SE80</b>만 됩니다.','err'); return; }
      if(pre==='/o') go(code,'✓ <b>새 세션(창)</b>에서 '+code+' 열기(<code>/o</code>) — 원래 화면은 그대로(데모에선 '+code+'로 표시).','ok');
      else go(code,'✓ <code>/n</code> — 현재 작업을 닫고 '+code+'로 이동(<b>어느 화면에서든</b> 동작).','ok');
      $('cmd').value=''; return;
    }
    // 접두어 없는 코드
    var bm=low.match(/^([a-z0-9]+)$/);
    if(bm){
      var c=bm[1].toUpperCase();
      if(screen==='easy'){
        if(!VALID[c]){ status('‘'+esc(c)+'’ 트랜잭션은 이 데모에 없습니다 — <b>SE38·SE11·SE80</b>만 됩니다.','err'); return; }
        go(c,'✓ Easy Access에서는 접두어 없이 <b>'+c+'</b>만으로 이동합니다.','ok'); $('cmd').value='';
      } else {
        status('✕ 지금은 Easy Access가 아니라 <b>'+screen+'</b> 안입니다. 접두어 없는 ‘'+esc(c)+'’는 <b>이동이 안 됩니다</b> — <code>/n'+esc(c)+'</code> 로 입력하세요!','err big');
      }
      return;
    }
    status('명령을 이해할 수 없습니다: '+esc(s),'err');
  }

  $('cmd').addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); run($('cmd').value); } });
  $('enter').addEventListener('click', function(){ run($('cmd').value); });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
