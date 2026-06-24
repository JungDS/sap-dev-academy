(function(){
  var TYPES = {
    CHAR:{maxLen:1333, dec:false, numeric:false, fixedLen:false, lower:true,  sign:false, abap:'c', desc:'문자(텍스트)'},
    NUMC:{maxLen:255,  dec:false, numeric:true,  fixedLen:false, lower:false, sign:false, abap:'n', desc:'숫자만 담는 문자(자릿수 고정·앞 0 유지)'},
    DEC: {maxLen:31,   dec:true,  numeric:true,  fixedLen:false, lower:false, sign:true,  abap:'p', desc:'십진수(소수 가능·금액 등)'},
    INT4:{maxLen:10,   dec:false, numeric:true,  fixedLen:true,  lower:false, sign:true,  abap:'i', desc:'정수(4바이트)'},
    DATS:{maxLen:8,    dec:false, numeric:false, fixedLen:true,  lower:false, sign:false, abap:'d', desc:'날짜 YYYYMMDD(8자리)'}
  };
  var EXAMPLES = [
    { goal:'금액을 담을 Domain을 직접 만들어 보세요. <b>목표</b>: 이름 <b>ZDO_AMOUNT</b>, 타입 <b>DEC</b>, 길이 <b>8</b>, 소수 <b>2</b>자리. 값을 입력한 뒤 💾 저장 → ✓ 검사 → 🔥 활성화 순으로 눌러 확인하세요.',
      target:{ name:'ZDO_AMOUNT', type:'DEC', len:8, dec:2 } },
    { goal:'주문 상태 코드 Domain을 만들어 보세요. <b>목표</b>: 이름 <b>ZDO_STATUS</b>, 타입 <b>CHAR</b>, 길이 <b>1</b>. “값 범위” 탭에서 고정값 <b>O</b>(Open)·<b>C</b>(Closed)를 추가하세요.',
      target:{ name:'ZDO_STATUS', type:'CHAR', len:1, fixed:['O','C'] } },
    { goal:'항공사 코드 Domain을 만들어 보세요. <b>목표</b>: 이름 <b>ZDO_CARRID</b>, 타입 <b>CHAR</b>, 길이 <b>3</b>. “값 범위” 탭의 <b>값 테이블(Value Table)</b>에 <b>SCARR</b>를 입력해 외래키 후보로 연결하세요.',
      target:{ name:'ZDO_CARRID', type:'CHAR', len:3, vtab:'SCARR' } },
    { goal:'이메일처럼 <b>대소문자를 그대로 보존</b>해야 하는 값의 Domain을 만들어 보세요. <b>목표</b>: 이름 <b>ZDO_EMAIL</b>, 타입 <b>CHAR</b>, 길이 <b>80</b>, “속성” 탭에서 <b>소문자 허용(Lower Case)</b>을 체크. (체크 안 하면 입력이 자동 대문자로 바뀝니다.)',
      target:{ name:'ZDO_EMAIL', type:'CHAR', len:80, lower:true } },
    { goal:'재고 증감처럼 <b>음수가 될 수 있는 정수</b>(입고 +, 출고 −)를 담을 Domain을 만들어 보세요. <b>목표</b>: 이름 <b>ZDO_STOCKCHG</b>, 타입 <b>INT4</b>(정수), “속성” 탭에서 <b>음수 허용(Sign)</b>을 체크. 참고: <b>NUMC</b>는 음수를 담지 못합니다.',
      target:{ name:'ZDO_STOCKCHG', type:'INT4', neg:true } },
    { goal:'연도·대기번호처럼 <b>숫자로 적지만 계산하지 않는</b> “단순 카운트” 값의 Domain을 만들어 보세요. <b>목표</b>: 이름 <b>ZDO_SEQNO</b>, 타입 <b>NUMC</b>, 길이 <b>4</b>(예: 대기번호 0001~9999, 연도 2026). 참고: NUMC는 <b>앞 0을 보존</b>하는 “숫자 문자”라 계산용이 아니고 <b>음수도 담지 못합니다</b>.',
      target:{ name:'ZDO_SEQNO', type:'NUMC', len:4 } }
  ];

  var $=function(id){return document.getElementById(id);};
  var dname=$('dname'), dtype=$('dtype'), dlen=$('dlen'), dout=$('dout'), ddec=$('ddec'),
      dlower=$('dlower'), dneg=$('dneg'), dvtab=$('dvtab'),
      rowDec=$('rowDec'), rowOut=$('rowOut'), rowLower=$('rowLower'), rowNeg=$('rowNeg'), typeAbap=$('typeAbap'),
      lenHint=$('lenHint'), fvBody=$('fvBody'),
      badge=$('badge'), badgeTxt=$('badgeTxt'), msg=$('msg'), msgBody=$('msgBody'),
      presetsEl=$('presets'), goalbar=$('goalbar');
  var state='new', curEx=0;

  /* ---- 타입에 따른 폼 표시 ---- */
  function syncType(){
    var t=TYPES[dtype.value];
    if(!t){   // 타입 미선택 — 부가 행 모두 숨기고 안내
      rowDec.classList.add('hide'); rowLower.classList.add('hide'); rowNeg.classList.add('hide');
      dlen.disabled=false; lenHint.textContent='';
      typeAbap.innerHTML='먼저 <b>데이터 타입</b>을 선택하세요.';
      return;
    }
    rowDec.classList.toggle('hide', !t.dec);
    if(!t.dec) ddec.value=0;
    if(t.fixedLen){ dlen.disabled=true; if(dtype.value==='INT4') dlen.value=10; if(dtype.value==='DATS') dlen.value=8; }
    else { dlen.disabled=false; }
    lenHint.textContent='최대 길이: '+t.maxLen+(t.fixedLen?' (고정)':'')+(t.numeric?' · 숫자 타입':'');
    // ABAP 변수 선언 대응 타입 (도메인 CHAR ↔ 변수 c 의 구분을 분명히)
    typeAbap.innerHTML='ABAP 변수로 선언하면 → <b>TYPE '+t.abap+'</b> ('+t.desc+')'+
      (dtype.value==='CHAR'?' · <b>주의:</b> DDIC 타입은 <b>CHAR</b>, 변수 선언 키워드는 <b>c</b>':'');
    // 대소문자(Lower Case)는 문자 타입에만 · 음수 허용(Sign)은 부호 가능한 숫자 타입(INT4·DEC)에만
    rowLower.classList.toggle('hide', !t.lower);
    if(!t.lower) dlower.checked=false;
    rowNeg.classList.toggle('hide', !t.sign);
    if(!t.sign) dneg.checked=false;
    // 출력 길이: 비워두면 그대로(저장/검사/활성화 때 자동 계산). 값이 있을 때만 길이 이상 유지.
    var len=parseInt(dlen.value,10)||0;
    if(dout.value.trim()!=='' && (parseInt(dout.value,10)||0)<len) dout.value=len;
  }

  /* ---- 출력 길이 자동 계산 (SE11: Length로부터 Output Length 자동 채움) ---- */
  function computeOutLen(){
    var t=TYPES[dtype.value]; if(!t) return 0;
    var len=parseInt(dlen.value,10)||0; if(!len) return 0;
    var dec=parseInt(ddec.value,10)||0;
    if(!t.numeric) return len;            // CHAR / DATS: 길이와 동일
    if(dtype.value==='NUMC') return len;  // 숫자 문자: 부호·구분기호 없음
    // INT4 / DEC: 부호 + (DEC) 천단위 구분기호 + 소수점 고려
    var intDigits = (dtype.value==='DEC') ? Math.max(len-dec,1) : len;
    var seps = (dtype.value==='DEC') ? Math.floor((intDigits-1)/3) : 0;
    var out = len + seps;
    if(dec>0) out += 1;                    // 소수점
    if(dneg.checked) out += 1;             // 부호 자리
    return out;
  }
  function autofillOut(){   // 출력 길이가 비어 있으면 자동 계산해 채움
    if(dout.value.trim()==='' && dtype.value && (parseInt(dlen.value,10)||0)>0){
      var v=computeOutLen(); if(v>0) dout.value=v;
    }
  }

  /* ---- 고정값 행 ---- */
  function addFv(v,d){
    var tr=document.createElement('tr');
    tr.innerHTML='<td><input type="text" class="f-val" value="'+(v||'')+'" spellcheck="false"></td>'+
                 '<td><input type="text" class="f-desc" value="'+(d||'')+'" spellcheck="false"></td>'+
                 '<td><button class="del" type="button" title="삭제">✕</button></td>';
    tr.querySelector('.del').addEventListener('click',function(){ tr.remove(); touched(); });
    tr.querySelectorAll('input').forEach(function(i){ i.addEventListener('input', touched); });
    fvBody.appendChild(tr);
  }
  function getFv(){
    return [].map.call(fvBody.querySelectorAll('tr'),function(tr){
      return [tr.querySelector('.f-val').value.trim(), tr.querySelector('.f-desc').value.trim()];
    }).filter(function(r){ return r[0]!==''; });
  }

  /* ---- 상태 배지 ---- */
  function setState(s){
    state=s;
    badge.className='badge s-'+s;
    badgeTxt.textContent = s==='new'?'신규 (미저장)' : s==='inactive'?'비활성 (활성화 필요)' : '활성 (런타임 사용 가능)';
  }
  function touched(){   // 필드 수정 시: 활성 → 비활성(수정됨)
    if(state==='active'){ setState('inactive'); showMsg('info','✏️ 수정됨', '정의가 바뀌었습니다 — 다시 <b>🔥 활성화</b>해야 변경이 런타임에 반영됩니다.'); }
  }

  /* ---- 검증 ---- */
  function validate(){
    var t=TYPES[dtype.value], name=dname.value.trim().toUpperCase(), len=parseInt(dlen.value,10), dec=parseInt(ddec.value,10)||0;
    var c=[];
    var nameOk=/^[YZ][A-Z0-9_]{1,29}$/.test(name);
    c.push({ok:nameOk, msg: nameOk?('이름 '+name+' — 명명 규칙 OK'):'이름은 Z 또는 Y로 시작하고 영문·숫자·_만 (2~30자).'});
    dname.classList.toggle('bad', !nameOk);
    var lenOk = len>=1 && len<=t.maxLen;
    c.push({ok:lenOk, msg: lenOk?('길이 '+len+' — '+dtype.value+' 허용 범위 내'):('길이는 1~'+t.maxLen+' 사이여야 합니다('+dtype.value+').')});
    dlen.classList.toggle('bad', !lenOk);
    if(t.dec){
      var decOk = dec>=0 && dec<len && dec<=14;
      c.push({ok:decOk, msg: decOk?('소수 '+dec+'자리 — 길이('+len+')보다 작음 OK'):'소수 자릿수는 0 이상, 길이보다 작아야 합니다(최대 14).'});
      ddec.classList.toggle('bad', !decOk);
    }
    // 출력 길이
    var out=parseInt(dout.value,10)||0;
    var outOk = out>=len && out<=99;
    c.push({ok:outOk, msg: outOk?('출력 길이 '+out+' — 길이('+len+') 이상 OK'):('출력 길이는 길이('+len+') 이상이어야 합니다(최대 99).')});
    dout.classList.toggle('bad', !outOk);
    var fv=getFv();
    if(fv.length){
      var bad=fv.filter(function(r){
        if(r[0].length>len) return true;
        if(t.numeric && !/^-?\d+$/.test(r[0])) return true;
        return false;
      });
      var fvOk=bad.length===0;
      c.push({ok:fvOk, msg: fvOk?('고정값 '+fv.length+'개 — 타입·길이 일관성 OK'):('고정값이 타입/길이에 안 맞습니다: '+bad.map(function(r){return '"'+r[0]+'"';}).join(', '))});
    }
    // 값 테이블
    var vtab=dvtab.value.trim().toUpperCase();
    if(vtab){
      var vtabOk=/^[A-Z][A-Z0-9_\/]{1,29}$/.test(vtab);
      c.push({ok:vtabOk, msg: vtabOk?('값 테이블 '+vtab+' — 참조 OK'):'값 테이블 이름 형식이 올바르지 않습니다(테이블명).'});
      dvtab.classList.toggle('bad', !vtabOk);
    } else { dvtab.classList.remove('bad'); }
    if(vtab && fv.length){
      c.push({ok:false, msg:'값 테이블과 고정값을 동시에 두지 마세요 — 보통 둘 중 하나만 씁니다.'});
    }
    return c;
  }
  function structOk(){   // 저장 가능한 최소 조건(이름)
    return /^[YZ][A-Z0-9_]{1,29}$/.test(dname.value.trim().toUpperCase());
  }

  /* ---- 예제 '목표' 일치 검사 (선택된 예제대로 정확히 입력해야 통과) ---- */
  function targetChecks(){
    var e=EXAMPLES[curEx]; if(!e||!e.target) return [];
    var tg=e.target, out=[], name=dname.value.trim().toUpperCase();
    function chk(ok, okMsg, failMsg){ out.push({ok:ok, msg: ok?okMsg:failMsg}); }
    chk(name===tg.name, '목표 이름 '+tg.name+' — 일치', '이름을 목표대로 입력하세요 → <b>'+tg.name+'</b>');
    chk(dtype.value===tg.type, '목표 타입 '+tg.type+' — 일치', '타입을 <b>'+tg.type+'</b>(으)로 선택하세요.');
    if(tg.len!=null) chk((parseInt(dlen.value,10)||0)===tg.len, '목표 길이 '+tg.len+' — 일치', '길이를 <b>'+tg.len+'</b>(으)로 맞추세요.');
    if(tg.dec!=null) chk((parseInt(ddec.value,10)||0)===tg.dec, '목표 소수 '+tg.dec+'자리 — 일치', '소수 자릿수를 <b>'+tg.dec+'</b>(으)로 맞추세요.');
    if(tg.lower!=null) chk(dlower.checked===tg.lower, tg.lower?'소문자 허용 — 체크됨(목표)':'소문자 허용 — 해제됨(목표)', tg.lower?'“속성” 탭에서 <b>소문자 허용(Lower Case)</b>을 체크하세요.':'“소문자 허용”을 해제하세요.');
    if(tg.neg!=null) chk(dneg.checked===tg.neg, tg.neg?'음수 허용 — 체크됨(목표)':'음수 허용 — 해제됨(목표)', tg.neg?'“속성” 탭에서 <b>음수 허용(Sign)</b>을 체크하세요.':'“음수 허용”을 해제하세요.');
    if(tg.vtab!=null) chk(dvtab.value.trim().toUpperCase()===tg.vtab, '목표 값 테이블 '+tg.vtab+' — 일치', '“값 범위” 탭에서 값 테이블을 <b>'+tg.vtab+'</b>(으)로 입력하세요.');
    if(tg.fixed!=null){
      var vals=getFv().map(function(r){return r[0].toUpperCase();}).sort();
      var want=tg.fixed.map(function(s){return s.toUpperCase();}).sort();
      chk(vals.length===want.length && vals.join(',')===want.join(','), '목표 고정값 '+tg.fixed.join('·')+' — 일치', '“값 범위” 탭에서 고정값 <b>'+tg.fixed.join('·')+'</b>만 추가하세요.');
    }
    return out;
  }

  function showMsg(cls, head, bodyHtml){
    msg.className='msgbar '+cls; msg.querySelector('.head').textContent=head; msgBody.innerHTML=bodyHtml; postHeight();
  }
  function showChecks(cls, head, checks, extra){
    msg.className='msgbar '+cls; msg.querySelector('.head').textContent=head;
    var html='<ul class="checks">'+checks.map(function(x){
      return '<li class="'+(x.ok?'pass':'fail')+'"><span class="m">'+(x.ok?'✓':'✕')+'</span><span>'+x.msg+'</span></li>';
    }).join('')+'</ul>'+(extra||'');
    msgBody.innerHTML=html; postHeight();
  }

  /* ---- 액션: 저장 / 검사 / 활성화 ---- */
  function doSave(){
    if(!structOk()){ dname.classList.add('bad'); return showMsg('bad','⛔ 저장 실패','도메인 <b>이름</b>을 먼저 올바르게 입력하세요 (Z/Y로 시작).'); }
    if(!dtype.value){ return showMsg('bad','⛔ 저장 실패','<b>데이터 타입</b>을 선택하세요.'); }
    autofillOut();
    setState('inactive');
    showMsg('ok','💾 저장되었습니다','상태: <b>비활성</b>. 아직 런타임에선 못 씁니다 — <b>✓ 검사</b> 후 <b>🔥 활성화</b>하세요. (출력 길이를 비워뒀다면 길이로부터 자동 계산해 채웠어요.)');
  }
  function doCheck(){
    if(!dtype.value){ return showMsg('bad','⛔ 검사 불가','먼저 <b>데이터 타입</b>을 선택하세요.'); }
    autofillOut();
    var c=targetChecks().concat(validate()), allOk=c.every(function(x){return x.ok;});
    showChecks(allOk?'ok':'bad', allOk?'✓ 검사 통과 — 예제 목표와 일치':'✗ 검사 — 아래 항목을 예제 목표대로 고치세요', c,
      allOk?'<div style="margin-top:6px;color:#0b7250;font-weight:700">이제 🔥 활성화할 수 있습니다.</div>':'');
  }
  function doActivate(){
    if(state==='new'){ return showMsg('bad','⛔ 활성화 전','먼저 <b>💾 저장</b>한 뒤 활성화하세요.'); }
    autofillOut();
    var c=targetChecks().concat(validate()), allOk=c.every(function(x){return x.ok;});
    if(!allOk){ return showChecks('bad','⛔ 활성화 실패 — 예제 목표와 다릅니다', c); }
    setState('active');
    var name=dname.value.trim().toUpperCase();
    showChecks('ok','🔥 활성화 완료', c,
      '<div class="usehint">✓ '+name+' 활성 — 런타임 객체 생성됨.<br>이제 <b>Data Element</b>가 이 Domain을 참조할 수 있습니다 (다음 레슨).</div>');
  }

  /* ---- 예제 로드 ---- */
  function loadEx(i){
    curEx=i;
    var e=EXAMPLES[i];
    // 값을 미리 채우지 않는다 — 폼 초기화 후 '목표'만 안내해 사용자가 직접 입력하도록 유도
    dname.value=''; dtype.value=''; dlen.value=''; ddec.value=''; dout.value=''; dlower.checked=false; dneg.checked=false; dvtab.value='';
    syncType();
    fvBody.innerHTML='';
    [dname,dlen,ddec,dout,dvtab].forEach(function(el){ el.classList.remove('bad'); });
    presetsEl.querySelectorAll('.chip').forEach(function(c){ c.classList.toggle('on', +c.dataset.ex===i); });
    // 첫 탭으로
    document.querySelector('.setab[data-tab="def"]').click();
    setState('new');
    if(goalbar) goalbar.innerHTML='<b>🎯 목표 ·</b> '+e.goal;
    showMsg('info','준비됨','값을 입력한 뒤 💾 저장 → ✓ 검사 → 🔥 활성화 순으로 눌러 보세요. (목표는 위 배너에 계속 표시됩니다.)');
  }

  /* ---- 이벤트 바인딩 ---- */
  dtype.addEventListener('change', function(){ syncType(); touched(); });
  [dname,dlen,ddec,dout,dvtab].forEach(function(el){ el.addEventListener('input', touched); });
  dlower.addEventListener('change', touched);
  dneg.addEventListener('change', touched);
  dlen.addEventListener('input', function(){ var len=parseInt(dlen.value,10)||0; if(dout.value.trim()!=='' && (parseInt(dout.value,10)||0)<len) dout.value=len; });
  $('bSave').addEventListener('click', doSave);
  $('bCheck').addEventListener('click', doCheck);
  $('bAct').addEventListener('click', doActivate);
  $('fvAdd').addEventListener('click', function(){ addFv('',''); touched(); postHeight(); });
  presetsEl.addEventListener('click', function(e){ var c=e.target.closest('.chip'); if(c) loadEx(+c.dataset.ex); });
  document.querySelector('.setabs').addEventListener('click', function(e){
    var b=e.target.closest('.setab'); if(!b) return;
    document.querySelectorAll('.setab').forEach(function(x){ x.classList.toggle('on', x===b); });
    document.querySelectorAll('.tabpane').forEach(function(p){ p.classList.toggle('on', p.dataset.pane===b.dataset.tab); });
    postHeight();
  });
  document.addEventListener('keydown', function(e){
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='s'){ e.preventDefault(); doSave(); }
    if((e.ctrlKey||e.metaKey) && e.key==='F3'){ e.preventDefault(); doActivate(); }
  });

  /* ---- iframe 자동 높이 ---- */
  function postHeight(){
    try{ var el=document.querySelector('.wrap');
      var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6;
      parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){}
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  syncType();
  loadEx(0);   // 금액 도메인 기본 로드
})();
