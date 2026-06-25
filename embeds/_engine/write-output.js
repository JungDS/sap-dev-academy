(function(){
  var EXAMPLES = (window.__SDA_CFG__||{}).examples || [];
  var ta = document.getElementById('code'),
      screenEl = document.getElementById('screen'),
      statusEl = document.getElementById('status'),
      presetsEl = document.getElementById('presets'),
      gutterEl = document.getElementById('gutter');

  /* 행번호(거터) — 편집 내용과 1:1 동기화 + 스크롤 동기화 */
  function updateGutter(){
    var n = ta.value.split('\n').length, s='';
    for(var i=1;i<=n;i++){ s += (i>1?'\n':'') + i; }
    gutterEl.textContent = s;
  }
  ta.addEventListener('input', updateGutter);
  ta.addEventListener('scroll', function(){ gutterEl.scrollTop = ta.scrollTop; });

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* 주석 제거: 줄 전체 * 주석, 인라인 " 주석(문자열 밖) */
  function stripComments(text){
    return text.split('\n').map(function(line){
      if(/^\s*\*/.test(line)) return '';
      var out='', inStr=false;
      for(var i=0;i<line.length;i++){
        var c=line[i];
        if(c==="'"){ inStr=!inStr; out+=c; continue; }
        if(c==='"' && !inStr) break;   // 인라인 주석 시작
        out+=c;
      }
      return out;
    }).join('\n');
  }
  /* 마침표(.)로 문장 분리 — 문자열 안의 . 은 무시 */
  function splitStatements(text){
    var stmts=[], cur='', inStr=false, leftover='';
    for(var i=0;i<text.length;i++){
      var c=text[i];
      if(c==="'"){ inStr=!inStr; cur+=c; continue; }
      if(c==='.' && !inStr){ stmts.push(cur); cur=''; continue; }
      cur+=c;
    }
    if(cur.trim()) leftover=cur.trim();      // 마침표 없이 남은 꼬리
    return {stmts:stmts, leftover:leftover, open:inStr};
  }
  /* 콤마로 피연산자 분리 — 문자열 안의 , 은 무시 */
  function splitByComma(text){
    var ops=[], cur='', inStr=false;
    for(var i=0;i<text.length;i++){
      var c=text[i];
      if(c==="'"){ inStr=!inStr; cur+=c; continue; }
      if(c===',' && !inStr){ ops.push(cur); cur=''; continue; }
      cur+=c;
    }
    if(cur.trim()!=='') ops.push(cur);
    return ops;
  }

  function run(){
    var raw = ta.value;
    var text = stripComments(raw);
    var parsed = splitStatements(text);

    if(parsed.open){               // 따옴표 짝 안 맞음
      return showError("따옴표(')의 짝이 맞지 않아요. 문자열을 열었으면 같은 줄에서 닫아 주세요.");
    }

    var lines=[''], hasOut=false, wrote=false, badVar=null;
    function nl(){ if(hasOut) lines.push(''); }   // 출력 전 맨 처음 / 는 빈 줄을 만들지 않음

    parsed.stmts.forEach(function(stmt){
      var s = stmt.trim();
      if(s==='') return;
      if(!/^write\b/i.test(s)) return;            // WRITE 문만 출력 (REPORT·DATA 등은 무시)
      wrote = true;
      var rest = s.replace(/^\s*write\s*:?\s*/i,'');
      splitByComma(rest).forEach(function(op){
        var o = op.trim(), newline=false;
        if(o.charAt(0)==='/'){ newline=true; o=o.slice(1).trim(); }
        if(newline) nl();
        if(o===''){ return; }                     // 슬래시만 — 줄바꿈만
        var txt, m=o.match(/^'([\s\S]*)'$/);
        if(m){ txt=m[1]; }                          // 문자 리터럴
        else if(/^-?\d+$/.test(o)){ txt=o; }        // 숫자 리터럴(유효)
        else { if(!badVar) badVar=o; return; }      // 따옴표 없는 이름 = 미선언 변수 → 오류
        var idx=lines.length-1;
        lines[idx] = lines[idx]==='' ? txt : lines[idx]+' '+txt;
        hasOut=true;
      });
    });

    if(parsed.leftover && /^write\b/i.test(parsed.leftover)){
      return showError("마지막 WRITE 문에 마침표(.)가 없어요. 모든 문장은 ' . '으로 끝나야 합니다.");
    }
    if(!wrote){
      return showPlain('<span class="ph">출력할 WRITE 문이 없어요. 예를 들어 <b>WRITE \'Hello\'.</b> 를 적어 보세요.</span>',
        'bad', '출력할 WRITE 문이 없습니다.');
    }

    if(badVar){
      return showError("'" + badVar + "' 은(는) 따옴표로 감싸지 않았어요 — 따옴표 없는 이름은 변수로 취급되는데, 아직 선언한 변수가 없습니다. 화면에 글자를 내리려면 작은따옴표로: WRITE '" + badVar + "'. (변수는 CH02에서 배웁니다.)");
    }
    var html='';
    lines.forEach(function(ln,i){
      html += '<span class="row"><span class="rownum">'+(i+1)+'</span>'+(ln===''?' ':esc(ln))+'</span>';
    });
    screenEl.className='screen'; screenEl.innerHTML=html;
    setStatus('✓ ' + lines.length + '줄 출력', 'ok');
    postHeight();
  }
  function showError(text){
    screenEl.className='screen err'; screenEl.textContent='⚠ '+text;
    setStatus('⚠ '+text, 'bad'); postHeight();
  }
  function showPlain(html, cls, status){
    screenEl.className='screen'; screenEl.innerHTML=html; setStatus(status, cls); postHeight();
  }
  function setStatus(t, cls){ statusEl.className='status '+(cls||''); statusEl.textContent=t; }

  /* 예제 로드 */
  function loadEx(i){
    ta.value=EXAMPLES[i];
    updateGutter();
    presetsEl.querySelectorAll('.chip').forEach(function(c){ c.classList.toggle('on', +c.dataset.ex===i); });
    run();
  }
  presetsEl.addEventListener('click', function(e){
    var c=e.target.closest('.chip'); if(!c) return; loadEx(+c.dataset.ex);
  });
  document.getElementById('run').addEventListener('click', function(){
    presetsEl.querySelectorAll('.chip').forEach(function(c){ c.classList.remove('on'); });
    run();
  });
  ta.addEventListener('keydown', function(e){
    if(e.key==='F8' || (e.key==='Enter' && (e.ctrlKey||e.metaKey))){ e.preventDefault(); run(); }
  });

  /* 부모에 높이 전송(iframe 자동 높이) */
  function postHeight(){
    try{ var el=document.querySelector('.wrap');
      var h=Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight)+6;
      parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){}
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  loadEx(0);   // 첫 예제 + 즉시 실행
})();
