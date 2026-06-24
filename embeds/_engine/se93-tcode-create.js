/* se93-tcode-create — SE93로 내 프로그램에 T-code 붙이고 명령창으로 실행 (bespoke 단일사용 · #C01-2)
   ① SE93: 트랜잭션코드(Z/Y) + 유형(report transaction) + 프로그램(ZHELLO) → 저장·활성화
   ② 명령창: 만든 코드 입력 → ZHELLO 실행 → 리스트 'Hello, ABAP!'(CH01-L04 WRITE 수준).
   게이팅: 출력은 L04 WRITE 결과만(SELECT·ALV 금지). */
(function(){
  var $=function(id){return document.getElementById(id);};
  var st={ created:false, tcode:'', prog:'' };

  function setBadge(s){ var b=$('badge'),t=$('badgeTxt');
    b.className='se93__badge '+(s==='active'?'b-active':'b-new');
    t.textContent=s==='active'?'활성 (실행 가능)':'신규 (미생성)'; }
  function setMsg(c,h){ var m=$('msg'); m.className='msg '+c; m.innerHTML=h; post(); }

  $('createBtn').addEventListener('click',function(){
    var tc=$('tcode').value.trim().toUpperCase();
    var ty=$('typeSel').value;
    var pg=$('prog').value.trim().toUpperCase();
    if(!/^[ZY][A-Z0-9_]*$/.test(tc)) return setMsg('bad','트랜잭션 코드는 <b>Z 또는 Y로 시작</b>해야 합니다(고객 네임스페이스). 예: <code>ZHELLO</code>.');
    if(ty!=='report') return setMsg('bad','유형은 <b>“Program and selection screen (report transaction)”</b>를 고르세요 — 실행형 리포트(REPORT)에 맞는 유형이에요.');
    if(!/^[ZY][A-Z0-9_]*$/.test(pg)) return setMsg('bad','연결할 <b>프로그램 이름</b>을 넣으세요(앞서 만든 <code>ZHELLO</code>, Z/Y 시작).');
    st.created=true; st.tcode=tc; st.prog=pg; setBadge('active');
    $('cmdRow').hidden=false; $('createBtn').disabled=true; $('goBtn').classList.add('ready');
    $('cmd').value='';
    setMsg('ok','✓ 트랜잭션 <b>'+tc+'</b> 생성·활성화 완료 (프로그램 <code>'+pg+'</code> 연결). 이제 아래 <b>명령창</b>에 <code>'+tc+'</code>를 입력해 실행해 보세요!');
  });

  $('goBtn').addEventListener('click',function(){
    if(!st.created) return setMsg('bad','먼저 위에서 트랜잭션을 만들고 활성화하세요.');
    var v=$('cmd').value.trim().toUpperCase();
    if(v===''){ return setMsg('bad','명령창에 방금 만든 트랜잭션 코드 <code>'+st.tcode+'</code>를 입력하세요.'); }
    if(v!==st.tcode){
      $('list').innerHTML='<span class="ph">실행 안 됨</span>';
      return setMsg('bad','⚠ <b>'+v+'</b> — 그런 트랜잭션 코드가 없습니다(오타·미생성). 방금 만든 건 <code>'+st.tcode+'</code>예요.');
    }
    $('list').innerHTML='<span class="row-out"><span class="ln">1</span>Hello, ABAP!</span>';
    $('goBtn').classList.remove('ready');
    setMsg('ok','▶ <b>'+st.tcode+'</b> 입력 → 내 프로그램 <code>'+st.prog+'</code> 실행! SE38을 안 거치고 <b>짧은 코드 하나</b>로 바로 떴어요 🎉 (출력은 CH01-L04의 <code>WRITE</code> 결과)');
  });

  $('cmd').addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); $('goBtn').click(); } });
  $('tcode').addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); $('createBtn').click(); } });

  function post(){ try{ var el=document.querySelector('.wrap'); if(document.documentElement.clientWidth<60) return; var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6; parent.postMessage({sda:'embed-height',h:h},'*'); }catch(e){} }
  window.addEventListener('load',post); window.addEventListener('resize',post);
  post();
})();
