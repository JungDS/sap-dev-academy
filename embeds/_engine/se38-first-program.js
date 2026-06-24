/* se38-first-program — 가상 SE38 개발 루프 시뮬레이터 (bespoke 단일사용 · #C01-1)
   명령창→SE38 / ZHELLO Create(Z·Y 검증) / 저장→$TMP·비활성 / 활성화→활성 / 실행.
   게이팅: 코드는 자동 골격 `REPORT zhello.`만(WRITE·변수는 CH01-L04↑). */
(function(){
  var $=function(id){return document.getElementById(id);};
  var st={ entered:false, created:false, code:'new' };  // code: new|saved|active

  function setBadge(s){
    var b=$('badge'), t=$('badgeTxt');
    b.className='se38__badge '+(s==='active'?'b-active':s==='saved'?'b-inactive':'b-new');
    t.textContent = s==='active'?'활성 (실행 가능)':s==='saved'?'비활성 (활성화 필요)':'신규 (미저장)';
  }
  function setMsg(cls,html){ var m=$('msg'); m.className='msg '+cls; m.innerHTML=html; post(); }
  function enable(id,on){ $(id).disabled=!on; }
  function renderCode(){
    if(!st.created){ $('code').innerHTML='<span class="hint">— Program을 Create하면 기본 골격이 생겨요 —</span>'; $('gut').textContent='1'; return; }
    var lines=['REPORT zhello.'];
    $('code').innerHTML=lines.map(function(l){ return l.replace(/\b(REPORT)\b/,'<span class="tok-kw">$1</span>'); }).join('\n');
    $('gut').textContent=lines.map(function(_,i){ return i+1; }).join('\n');
  }

  $('goBtn').addEventListener('click',function(){
    var v=$('cmd').value.trim().toUpperCase();
    if(v!=='SE38'){ return setMsg('bad','명령창엔 <b>SE38</b>을 입력하세요. (다른 화면 주소도 있지만, ABAP 에디터는 <code>SE38</code>)'); }
    st.entered=true; $('createRow').hidden=false; $('introHint').textContent='✓ SE38 진입';
    setMsg('info','ABAP Editor(SE38) 진입 — <b>Program</b>에 이름을 넣고 <b>Create</b>. 이름은 <b>Z/Y</b>로 시작해야 해요.');
  });
  $('createBtn').addEventListener('click',function(){
    if(!st.entered) return setMsg('bad','먼저 명령창에 <b>SE38</b>을 입력해 들어가세요.');
    var p=$('prog').value.trim().toUpperCase();
    if(!/^[ZY][A-Z0-9_]*$/.test(p)){ return setMsg('bad','이름은 <b>Z 또는 Y로 시작</b>해야 합니다(Name range 규칙). 예: <code>ZHELLO</code>.'); }
    st.created=true; st.code='new'; renderCode(); setBadge('new');
    enable('bSave',true); $('bSave').classList.add('ready');
    setMsg('ok','✓ <b>'+p+'</b> 생성 (Type = Executable Program). 자동 골격 <code>REPORT</code>가 들어왔어요 — 이제 <b>💾 저장</b>.');
  });
  $('bSave').addEventListener('click',function(){
    if(!st.created) return;
    st.code='saved'; setBadge('saved');
    $('tmpBadge').innerHTML=' <span class="tmp-badge">📦 $TMP (Local Object)</span>';
    $('bSave').classList.remove('ready'); enable('bAct',true); $('bAct').classList.add('ready');
    setMsg('info','💾 저장 시 “어느 패키지?” → <b>Local Object</b> 선택 → <code>$TMP</code>에 보관(이송·공유 불가). 상태 <b>비활성</b> — 아직 실행본이 아니에요. <b>🔥 활성화</b>!');
  });
  $('bAct').addEventListener('click',function(){
    if(st.code==='new') return setMsg('bad','먼저 <b>💾 저장</b>하세요.');
    st.code='active'; setBadge('active');
    $('bAct').classList.remove('ready'); enable('bRun',true); $('bRun').classList.add('ready');
    setMsg('ok','🔥 <b>활성화 완료</b> → 실행본(active) 생성. 이제 <b>▶ 실행(F8)</b>!');
  });
  $('bRun').addEventListener('click',function(){
    if(st.code!=='active'){ return setMsg('bad','⚠ <b>활성화 안 된 변경은 실행에 반영되지 않아요</b> — 🔥 활성화부터! (가장 흔한 실수)'); }
    $('bRun').classList.remove('ready');
    $('list').innerHTML='<span class="ph">(빈 리스트 — 실행됐지만 아직 출력문이 없어요)</span>';
    setMsg('ok','▶ 실행됨! <b>작성 → 저장 → 활성화 → 실행</b> 개발 루프 한 바퀴 완료 🎉 화면에 글자를 찍는 <b>WRITE</b>는 <b>다음 레슨(CH01-L04)</b>이라, 지금 리스트는 비어 있어요.');
  });

  $('cmd').addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); $('goBtn').click(); } });
  document.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){ e.preventDefault(); if(!$('bSave').disabled)$('bSave').click(); }
    if((e.ctrlKey||e.metaKey)&&e.key==='F3'){ e.preventDefault(); if(!$('bAct').disabled)$('bAct').click(); }
    if(e.key==='F8'){ e.preventDefault(); if(!$('bRun').disabled)$('bRun').click(); }
  });

  function post(){ try{ if(document.documentElement.clientWidth<60) return; var el=document.querySelector('.wrap'); var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6; parent.postMessage({sda:'embed-height',h:h},'*'); }catch(e){} }
  window.addEventListener('load',post); window.addEventListener('resize',post);
  renderCode(); post();
})();
