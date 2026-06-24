/* se38-first-program — 가상 SE38 개발 루프 시뮬레이터 (bespoke 단일사용 · #C01-1)
   3-step 진행형: ① 명령창에 SE38 입력→엔터 / ② Program 이름 입력→생성 / ③ 에디터(REPORT)+저장→활성화→실행.
   한 단계만 보이고, 다음으로 넘어가면 이전 단계 UI는 사라진다(한 번에 다 보여주지 않음).
   게이팅: 코드는 자동 골격 `REPORT <prog>.`만(WRITE·변수는 CH01-L04↑). */
(function(){
  var $=function(id){return document.getElementById(id);};
  var st={ step:1, prog:'', code:'new' };  // code: new|saved|active

  function showStep(n){
    st.step=n;
    $('step1').hidden = n!==1; $('step2').hidden = n!==2; $('step3').hidden = n!==3;
    var titles={1:'📂 SAP — 명령창', 2:'🆕 SE38 — 새 프로그램', 3:'📝 ABAP Editor · '+st.prog};
    $('barTitle').textContent = titles[n];
    $('badge').hidden = (n!==3);
    [1,2,3].forEach(function(i){ $('si'+i).className = 's'+(i<n?' done':(i===n?' on':'')); });
    if(n===1){ try{$('cmd').focus();}catch(e){} } else if(n===2){ try{$('prog').focus();}catch(e){} }
    post();
  }
  function setBadge(s){
    var b=$('badge'), t=$('badgeTxt');
    b.className='se38__badge '+(s==='active'?'b-active':s==='saved'?'b-inactive':'b-new');
    t.textContent = s==='active'?'활성 (실행 가능)':s==='saved'?'비활성 (활성화 필요)':'신규 (미저장)';
  }
  function setMsg(cls,html){ var m=$('msg'); m.className='msg '+cls; m.innerHTML=html; post(); }
  function renderCode(){
    var lines=['REPORT '+st.prog+'.'];
    $('code').innerHTML=lines.map(function(l){ return l.replace(/\b(REPORT)\b/,'<span class="tok-kw">$1</span>'); }).join('\n');
    $('gut').textContent=lines.map(function(_,i){ return i+1; }).join('\n');
  }

  /* ① 명령창 → SE38 → 엔터 */
  $('goBtn').addEventListener('click',function(){
    var v=$('cmd').value.trim().toUpperCase();
    if(v!=='SE38'){ return setMsg('bad','명령창엔 <b>SE38</b>을 입력하세요. (다른 화면 주소도 있지만, ABAP 에디터는 <code>SE38</code>)'); }
    setMsg('info','ABAP Editor(SE38) 진입 — 만들 <b>Program</b> 이름을 넣고 <b>생성</b>. 이름은 <b>Z/Y</b>로 시작해야 해요.');
    showStep(2);
  });
  /* ② Program 이름 → 생성 */
  $('createBtn').addEventListener('click',function(){
    var p=$('prog').value.trim().toUpperCase();
    if(!/^[ZY][A-Z0-9_]*$/.test(p)){ return setMsg('bad','이름은 <b>Z 또는 Y로 시작</b>해야 합니다(Name range 규칙). 예: <code>ZHELLO</code>.'); }
    st.prog=p; st.code='new'; renderCode(); setBadge('new');
    $('bSave').disabled=false; $('bSave').classList.add('ready');
    $('bAct').disabled=true;  $('bAct').classList.remove('ready');
    $('bRun').disabled=true;  $('bRun').classList.remove('ready');
    $('list').innerHTML='<span class="ph">실행하면 리스트(출력 화면)가 여기 떠요.</span>';
    setMsg('ok','✓ <b>'+p+'</b> 생성 (Type = Executable Program). 자동 골격 <code>REPORT</code>가 들어왔어요 — 이제 <b>💾 저장</b>.');
    showStep(3);
  });
  /* ③ 저장 → 활성화 → 실행 */
  $('bSave').addEventListener('click',function(){
    if(!st.prog) return;
    st.code='saved'; setBadge('saved');
    $('bSave').classList.remove('ready'); $('bAct').disabled=false; $('bAct').classList.add('ready');
    setMsg('info','💾 저장 시 “어느 패키지?” → <b>Local Object</b> 선택 → <code>$TMP</code>에 보관(이송·공유 불가). 상태 <b>비활성</b> — 아직 실행본이 아니에요. <b>🔥 활성화</b>!');
  });
  $('bAct').addEventListener('click',function(){
    if(st.code==='new') return setMsg('bad','먼저 <b>💾 저장</b>하세요.');
    st.code='active'; setBadge('active');
    $('bAct').classList.remove('ready'); $('bRun').disabled=false; $('bRun').classList.add('ready');
    setMsg('ok','🔥 <b>활성화 완료</b> → 실행본(active) 생성. 이제 <b>▶ 실행(F8)</b>!');
  });
  $('bRun').addEventListener('click',function(){
    if(st.code!=='active'){ return setMsg('bad','⚠ <b>활성화 안 된 변경은 실행에 반영되지 않아요</b> — 🔥 활성화부터! (가장 흔한 실수)'); }
    $('bRun').classList.remove('ready');
    $('list').innerHTML='<span class="ph">(빈 리스트 — 실행됐지만 아직 출력문이 없어요)</span>';
    setMsg('ok','▶ 실행됨! <b>작성 → 저장 → 활성화 → 실행</b> 개발 루프 한 바퀴 완료 🎉 화면에 글자를 찍는 <b>WRITE</b>는 <b>다음 레슨(CH01-L04)</b>이라, 지금 리스트는 비어 있어요.');
  });

  /* 처음부터 다시 */
  $('resetBtn').addEventListener('click',function(){
    st={ step:1, prog:'', code:'new' };
    $('cmd').value=''; $('prog').value='';
    $('bSave').disabled=true; $('bAct').disabled=true; $('bRun').disabled=true;
    ['bSave','bAct','bRun'].forEach(function(id){ $(id).classList.remove('ready'); });
    setMsg('info','먼저 명령창에 <b>SE38</b>을 입력해 에디터로 들어가세요.');
    showStep(1);
  });

  /* Enter / 단축키 */
  $('cmd').addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); $('goBtn').click(); } });
  $('prog').addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); $('createBtn').click(); } });
  document.addEventListener('keydown',function(e){
    if(st.step!==3) return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){ e.preventDefault(); if(!$('bSave').disabled)$('bSave').click(); }
    if((e.ctrlKey||e.metaKey)&&e.key==='F3'){ e.preventDefault(); if(!$('bAct').disabled)$('bAct').click(); }
    if(e.key==='F8'){ e.preventDefault(); if(!$('bRun').disabled)$('bRun').click(); }
  });

  function post(){ try{ if(document.documentElement.clientWidth<60) return; var el=document.querySelector('.wrap'); var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6; parent.postMessage({sda:'embed-height',h:h},'*'); }catch(e){} }
  window.addEventListener('load',post); window.addEventListener('resize',post);

  showStep(1); post();
})();
