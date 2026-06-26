// ===== command-field-sim 엔진 JS — SAP 명령창 T-code 이동 시뮬 (CH01-L02) =====
// "현재 화면"(Easy Access vs 다른 트랜잭션 SE11)에서 명령을 입력하면 결과가 달라짐을 보여 준다.
// 핵심: 접두어 없는 코드(SE38)는 Easy Access에서만 통하고, 다른 화면에선 /n을 붙여야 한다.
(function(){
  var cfg = window.CFS_CFG || {};
  var TARGET = cfg.target || 'SE38';            // 이동 대상 트랜잭션
  var TARGET_NAME = cfg.targetName || 'ABAP Editor';
  var OTHER = cfg.other || 'SE11';              // "다른 트랜잭션" 예시
  var OTHER_NAME = cfg.otherName || 'ABAP Dictionary';
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var ctx='easy';     // 'easy' | 'other'  (현재 화면)
  var cmd=null;       // 입력한 명령
  var COMMANDS=[TARGET, '/n'+TARGET, '/o'+TARGET, '/nex'];

  // 결과 계산
  function compute(){
    if(cmd==null) return {state:'ready'};
    if(cmd==='/nex') return {state:'logoff'};
    if(cmd==='/o'+TARGET) return {state:'newwin'};
    if(cmd==='/n'+TARGET) return {state:'nav'};         // 어느 화면에서든 OK
    if(cmd===TARGET){                                    // 접두어 없음
      return ctx==='easy' ? {state:'nav'} : {state:'error'};
    }
    return {state:'ready'};
  }

  function screenHtml(which){
    if(which==='easy') return '<div class="cfs-scr"><h4>🏠 SAP Easy Access <span class="tcode">로그인 직후</span></h4>'
      +'<div class="cfs-tree">📁 즐겨찾기\n📁 SAP 메뉴\n   └ 📁 도구 → ABAP 워크벤치 → ...\n      └ <span class="hi">한참 펼쳐야 SE38이 나온다</span></div></div>';
    if(which==='other') return '<div class="cfs-scr"><h4>🗄️ '+esc(OTHER)+' — '+esc(OTHER_NAME)+' <span class="tcode">다른 트랜잭션 안</span></h4>'
      +'<div class="cfs-form">Database table <input value="ZCONCERT" readonly> <span>… (이미 '+esc(OTHER)+' 작업 중)</span></div></div>';
    // target (SE38)
    return '<div class="cfs-scr"><h4>📝 '+esc(TARGET)+' — '+esc(TARGET_NAME)+' <span class="tcode">이동 성공</span></h4>'
      +'<div class="cfs-form" style="margin-bottom:9px">Program <input value="ZHELLO" readonly></div>'
      +'<div class="cfs-ed">REPORT zhello.\nWRITE: / \'Hello, ABAP!\'.</div></div>';
  }

  function render(){
    // 컨트롤 상태
    $('ctxSeg').querySelectorAll('button').forEach(function(b){ b.classList.toggle('on', b.dataset.c===ctx); });
    $('cmds').querySelectorAll('.cfs-cmd').forEach(function(b){ b.classList.toggle('on', b.dataset.cmd===cmd); });
    // 명령창 표시
    $('cmdtxt').innerHTML = (cmd?esc(cmd):'')+'<span class="cur"></span>';

    var r=compute();
    var bodyScreen = ctx;                 // 기본은 현재 화면
    var overlay='';
    if(r.state==='nav'){ bodyScreen='target'; }
    else if(r.state==='logoff'){ bodyScreen='logoff'; }
    // 타이틀
    var titleCode = (r.state==='nav')?TARGET : (ctx==='easy'?'SAP Easy Access':OTHER);
    $('winTitle').textContent = (r.state==='logoff')? '—' : titleCode;

    // 본문
    var bodyHtml;
    if(bodyScreen==='logoff'){ bodyHtml='<div class="cfs-logoff"><div class="big">🚪 로그오프됨</div><div>확인 창 없이 즉시 세션이 종료됩니다.</div></div>'; }
    else { bodyHtml = screenHtml(bodyScreen); }

    if(r.state==='error'){
      bodyHtml += '<div class="cfs-err"><span class="ic">⛔</span><span class="tx">화면 명령으로 처리됨 — <b>"'+esc(TARGET)+'"</b>은(는) 현재 '+esc(OTHER)+' 화면의 함수 코드가 아니라 <b>이동이 안 됩니다</b>. 다른 화면에서 이동하려면 앞에 <b>/n</b>을 붙이세요.</span></div>';
    }
    if(r.state==='newwin'){
      overlay = '<div class="cfs-new"><div class="nbar">🪟 새 세션 (창)</div><div class="nbody">'+esc(TARGET)+' — '+esc(TARGET_NAME)+'\nProgram: ZHELLO</div></div>';
    }
    $('winBody').innerHTML = bodyHtml + overlay;

    // 결과 메시지
    var res=$('result');
    if(r.state==='ready'){ res.className='cfs-result idle'; res.innerHTML='<span class="ic">⌨️</span>현재 화면을 고르고, 위 명령 중 하나를 눌러 결과를 확인하세요.'; }
    else if(r.state==='error'){ res.className='cfs-result no'; res.innerHTML='<span class="ic">✕</span><span><b>이동 실패</b> — 접두어 없는 <code>'+esc(TARGET)+'</code>은(는) <b>Easy Access에서만</b> 통합니다. 지금처럼 '+esc(OTHER)+' 안에서는 <code>/n'+esc(TARGET)+'</code>로 이동하세요.</span>'; }
    else if(r.state==='nav'){ res.className='cfs-result ok';
      res.innerHTML = (cmd===TARGET)
        ? '<span class="ic">✓</span><span><b>이동 성공</b> — Easy Access에서는 접두어 없이 <code>'+esc(TARGET)+'</code>만으로 이동합니다.</span>'
        : '<span class="ic">✓</span><span><b>이동 성공</b> — <code>/n</code>은 현재 작업을 닫고 새 트랜잭션으로 이동합니다(<b>어느 화면에서든</b> 동작).</span>'; }
    else if(r.state==='newwin'){ res.className='cfs-result ok'; res.innerHTML='<span class="ic">✓</span><span><b>새 창</b> — <code>/o</code>는 <b>새 세션</b>에서 '+esc(TARGET)+'를 엽니다. 현재 '+(ctx==='easy'?'화면':esc(OTHER))+'은 그대로 남습니다.</span>'; }
    else if(r.state==='logoff'){ res.className='cfs-result no'; res.innerHTML='<span class="ic">🚪</span><span><b>로그오프</b> — <code>/nex</code>는 저장 확인 없이 즉시 종료합니다.</span>'; }

    postHeight();
  }

  $('ctxSeg').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; ctx=b.dataset.c; cmd=null; render(); });
  $('cmds').addEventListener('click',function(e){ var b=e.target.closest('.cfs-cmd'); if(!b) return; cmd=b.dataset.cmd; render(); });
  $('enterBtn').addEventListener('click',function(){ if(cmd==null){ cmd=COMMANDS[0]; render(); } });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  // 명령 칩 생성
  COMMANDS.forEach(function(c){ var b=document.createElement('button'); b.type='button'; b.className='cfs-cmd'; b.dataset.cmd=c; b.textContent=c; $('cmds').appendChild(b); });
  render();
})();
