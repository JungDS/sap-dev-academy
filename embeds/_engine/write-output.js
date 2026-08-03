/* write-output — WRITE 출력 시뮬레이터 엔진 (CH01-L04-S01 단일사용 · 데이터=window.__SDA_CFG__.examples)
   에디터에 적은 ABAP을 아주 작은 파서로 해석해 가상 리스트 화면에 그린다.

   섹션 인덱스
   1) 유틸 — esc · postHeight
   2) 렉서 — checkStarColumn(컬럼1 주석 규칙) · stripComments · splitStatements(줄번호 추적)
   3) 파서 — parseWrite(콜론 체인 prefix 분리) · splitByComma · takeSlashes
   4) 실행 — run(): 문장별 dispatch + 출력 버퍼(putText·breakLine·skipLines·putUline)
   5) 표시 — render · showError · showPlain · setStatus
   6) UI — 예제 칩 · F8/Ctrl+Enter · 거터 동기화

   문법 규칙(본문 CH01-L03·L04와 일치)
   - `*` 전체 줄 주석은 **컬럼 1**에서만. 앞에 공백이 있으면 오류(L03).
   - 문장의 끝은 줄바꿈이 아니라 **마침표**. 중간 줄 마침표 누락도 잡는다.
   - 콜론 체인은 **콜론 왼쪽 전체를 항목마다 반복**한다 → `WRITE /: 'A','B'.` = `WRITE / 'A'.` + `WRITE / 'B'.`
   - 아는 문장: REPORT · WRITE · NEW-LINE · SKIP [n] · ULINE. 그 밖은 실행하지 않고 **무시했다고 알린다**.
     (SKIP·ULINE은 CH01-L05 개념이라 위젯 UI에서 광고하지 않는다 — 입력하면 동작만 한다.) */
(function(){
  var EXAMPLES = (window.__SDA_CFG__||{}).examples || [];
  var ta = document.getElementById('code'),
      screenEl = document.getElementById('screen'),
      statusEl = document.getElementById('status'),
      presetsEl = document.getElementById('presets'),
      gutterEl = document.getElementById('gutter');

  /* 아는 문장 = 실행 · 그 밖 = 무시했다고 안내 */
  var KNOWN = ['REPORT','WRITE','NEW-LINE','SKIP','ULINE'];
  /* 새 문장이 시작됐는지(=앞 줄 마침표 누락) 판정할 키워드 — 뒤 챕터 키워드까지 넉넉히 */
  var STMT_KW = /^(WRITE|REPORT|NEW-LINE|SKIP|ULINE|DATA|TYPES|CONSTANTS|PARAMETERS|SELECT-OPTIONS|FORMAT|START-OF-SELECTION|IF|ELSEIF|ELSE|ENDIF|DO|ENDDO|WHILE|ENDWHILE|CASE|WHEN|ENDCASE|CLEAR|MOVE|LOOP|ENDLOOP)\b/i;

  /* ── 1) 유틸 ───────────────────────────────────────────── */
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* 행번호(거터) — 편집 내용과 1:1 동기화 + 스크롤 동기화 */
  function updateGutter(){
    var n = ta.value.split('\n').length, s='';
    for(var i=1;i<=n;i++){ s += (i>1?'\n':'') + i; }
    gutterEl.textContent = s;
  }
  ta.addEventListener('input', updateGutter);
  ta.addEventListener('scroll', function(){ gutterEl.scrollTop = ta.scrollTop; });

  /* ── 2) 렉서 ───────────────────────────────────────────── */
  /* `*` 주석은 컬럼 1 전용 — 앞에 공백이 있으면 주석이 아니라 코드다(L03 규칙) */
  function checkStarColumn(lines){
    for(var i=0;i<lines.length;i++){
      if(/^[ \t]+\*/.test(lines[i])) return { line:i+1, text:lines[i].trim() };
    }
    return null;
  }
  /* 주석 제거 — 줄 수는 그대로 유지(줄번호 보존) */
  function stripComments(lines){
    return lines.map(function(line){
      if(/^\*/.test(line)) return '';              // 컬럼 1 전체 줄 주석
      var out='', inStr=false;
      for(var i=0;i<line.length;i++){
        var c=line[i];
        if(c==="'"){ inStr=!inStr; out+=c; continue; }
        if(c==='"' && !inStr) break;               // 인라인 주석 시작
        out+=c;
      }
      return out;
    });
  }
  /* 마침표(.)로 문장 분리 — 문자열 안의 . 은 무시. 문장마다 기여한 줄(segs)을 기록 */
  function splitStatements(lines){
    var stmts=[], cur='', segs=[], segTxt='', segNo=0, inStr=false;
    function flushSeg(no){
      if(segTxt.trim()!==''){ segs.push({ no:no, txt:segTxt.trim() }); }
      segTxt='';
    }
    function pushStmt(){
      if(cur.trim()!=='' || segs.length){ stmts.push({ text:cur, segs:segs }); }
      cur=''; segs=[];
    }
    for(var li=0; li<lines.length; li++){
      var line=lines[li]; segNo=li+1; segTxt='';
      for(var i=0;i<line.length;i++){
        var c=line[i];
        if(c==="'"){ inStr=!inStr; cur+=c; segTxt+=c; continue; }
        if(c==='.' && !inStr){
          segTxt+=c; flushSeg(segNo); pushStmt(); continue;
        }
        cur+=c; segTxt+=c;
      }
      flushSeg(segNo);
      cur+='\n';
    }
    var leftover = cur.trim();
    if(leftover===''){ segs=[]; }
    return { stmts:stmts, leftover:leftover, leftoverSegs:segs, open:inStr };
  }

  /* ── 3) 파서 ───────────────────────────────────────────── */
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
  /* WRITE 문 해부 — 콜론(:) 왼쪽 = 항목마다 반복되는 prefix */
  function parseWrite(stmt){
    var rest = stmt.replace(/^\s*write\b/i,'');
    var idx=-1, inStr=false;
    for(var i=0;i<rest.length;i++){
      var c=rest[i];
      if(c==="'"){ inStr=!inStr; continue; }
      if(c===':' && !inStr){ idx=i; break; }
    }
    if(idx<0) return { chain:false, prefix:'', ops:splitByComma(rest) };
    return { chain:true, prefix:rest.slice(0,idx).trim(), ops:splitByComma(rest.slice(idx+1)) };
  }
  /* 앞쪽 `/` 를 떼어 개수를 센다 — `/`는 "여기서 줄바꿈" 신호 */
  function takeSlashes(t){
    var n=0; t=t.trim();
    while(t.charAt(0)==='/'){ n++; t=t.slice(1).trim(); }
    return { n:n, rest:t };
  }

  /* ── 4) 실행 ───────────────────────────────────────────── */
  function run(){
    var srcLines = ta.value.split('\n');

    var star = checkStarColumn(srcLines);
    if(star){
      return showError(star.line + '번째 줄 — 별표(*) 전체 줄 주석은 첫 칸(컬럼 1)에서만 통해요. '
        + '한 칸이라도 밀리면 주석이 아니라 코드로 읽혀 오류가 납니다. 줄 중간 주석은 큰따옴표(")를 쓰세요.');
    }

    var parsed = splitStatements(stripComments(srcLines));
    if(parsed.open){               // 따옴표 짝 안 맞음
      return showError("따옴표(')의 짝이 맞지 않아요. 문자열을 열었으면 같은 줄에서 닫아 주세요.");
    }

    /* 출력 버퍼 — rows: {k:'t',s:'…'}(글자 줄) | {k:'u'}(구분선)
       pending=true 면 다음 출력은 새 줄에서 시작한다(첫 출력 앞에서는 빈 줄을 만들지 않음). */
    var rows=[], pending=false;
    function curRow(){
      var last = rows[rows.length-1];
      if(!last || last.k!=='t' || pending){ rows.push({k:'t',s:''}); pending=false; }
      return rows[rows.length-1];
    }
    function putText(txt){ var r=curRow(); r.s = (r.s==='' ? txt : r.s+' '+txt); }
    function breakLine(){ pending=true; }
    function skipLines(n){ for(var i=0;i<n;i++) rows.push({k:'t',s:''}); pending=true; }
    function putUline(){ rows.push({k:'u'}); pending=false; }

    var wrote=false, err=null, unsupported=[];

    for(var si=0; si<parsed.stmts.length && !err; si++){
      var st = parsed.stmts[si];
      var s = st.text.trim();
      if(s==='') continue;

      /* 마침표 누락(문장 중간) — 한 문장 안에서 다음 줄이 새 키워드로 시작하면 앞 줄에 마침표가 빠진 것 */
      for(var k=1; k<st.segs.length; k++){
        if(STMT_KW.test(st.segs[k].txt)){
          err = st.segs[k-1].no + '번째 줄 끝에 마침표(.)가 없어요. ABAP은 줄바꿈이 아니라 '
              + '마침표로 문장이 끝나서, 다음 줄(' + st.segs[k].no + '번째 줄)까지 한 문장으로 붙어 버립니다.';
          break;
        }
      }
      if(err) break;

      var head = (s.match(/^[A-Za-z-]+/)||[''])[0].toUpperCase();
      if(KNOWN.indexOf(head)<0){
        if(unsupported.indexOf(head||s.slice(0,12))<0) unsupported.push(head||s.slice(0,12));
        continue;
      }
      if(head==='REPORT') continue;                       // 프로그램 선언 — 출력 없음
      if(head==='NEW-LINE'){ breakLine(); continue; }     // 다음 WRITE 출력이 새 줄에서 시작
      if(head==='ULINE'){ putUline(); continue; }
      if(head==='SKIP'){
        var mn = s.match(/^skip\s+(\d+)/i);
        skipLines(mn ? Math.min(+mn[1], 20) : 1);
        continue;
      }

      /* WRITE — 콜론 체인 prefix를 항목마다 반복 */
      wrote = true;
      var w = parseWrite(s);
      for(var oi=0; oi<w.ops.length && !err; oi++){
        var eff = (w.prefix + ' ' + w.ops[oi]).trim();
        var sl = takeSlashes(eff);
        if(sl.n>1){
          err = "한 항목 앞에 `/`가 두 번 붙었어요. 콜론(:) 왼쪽의 `/`는 이미 **항목마다** 반복되니, "
              + "항목 쪽 `/`는 빼 주세요. (예: WRITE /: 'A', 'B'.)";
          break;
        }
        if(sl.n===1) breakLine();
        var o = sl.rest;
        if(o===''){ continue; }                            // 슬래시만 있는 항목 = 줄바꿈만
        var m = o.match(/^'([\s\S]*)'$/);
        if(m){ putText(m[1]); }                            // 문자 리터럴
        else if(/^-?\d+$/.test(o)){ putText(o); }          // 숫자 리터럴
        else {                                             // 따옴표 없는 이름 = 미선언 변수
          err = "'" + o + "' 은(는) 따옴표로 감싸지 않았어요 — 따옴표 없는 이름은 변수로 취급되는데, "
              + "아직 선언한 변수가 없습니다. 화면에 글자를 내리려면 작은따옴표로: WRITE '" + o + "'. (변수는 CH02에서 배웁니다.)";
        }
      }
    }

    if(err) return showError(err);

    /* 마지막 문장에 마침표가 없는 경우 */
    if(parsed.leftover){
      var lastHead = (parsed.leftover.match(/^[A-Za-z-]+/)||[''])[0].toUpperCase();
      var lastNo = parsed.leftoverSegs.length ? parsed.leftoverSegs[parsed.leftoverSegs.length-1].no : 0;
      if(KNOWN.indexOf(lastHead)>=0){
        return showError((lastNo?lastNo+'번째 줄 — ':'') + '마지막 ' + lastHead
          + " 문에 마침표(.)가 없어요. 모든 문장은 ' . '으로 끝나야 합니다.");
      }
    }

    if(!rows.length){
      if(!wrote){
        return showPlain('<span class="ph">출력할 WRITE 문이 없어요. 예를 들어 <b>WRITE \'Hello\'.</b> 를 적어 보세요.</span>',
          'bad', '출력할 WRITE 문이 없습니다.', unsupported);
      }
      return showPlain('<span class="ph">(WRITE는 있지만 화면에 찍힌 값이 없어요)</span>', 'bad', '출력된 값이 없습니다.', unsupported);
    }
    render(rows, unsupported);
  }

  /* ── 5) 표시 ───────────────────────────────────────────── */
  function render(rows, unsupported){
    var html='';
    rows.forEach(function(r,i){
      var num='<span class="rownum">'+(i+1)+'</span>';
      html += '<span class="row">' + num + (r.k==='u' ? '<span class="ul"></span>' : (r.s===''?' ':esc(r.s))) + '</span>';
    });
    screenEl.className='screen'; screenEl.innerHTML=html;
    setStatus('✓ ' + rows.length + '줄 출력', 'ok', unsupported);
    postHeight();
  }
  function showError(text){
    screenEl.className='screen err'; screenEl.textContent='⚠ '+text;
    setStatus('⚠ '+text, 'bad'); postHeight();
  }
  function showPlain(html, cls, status, unsupported){
    screenEl.className='screen'; screenEl.innerHTML=html; setStatus(status, cls, unsupported); postHeight();
  }
  /* 상태줄 — 본문 + (있으면) '무시한 문장' 안내. 조용히 넘기지 않는다. */
  function setStatus(t, cls, unsupported){
    statusEl.className='status '+(cls||'');
    var html='<span class="s-main">'+esc(t)+'</span>';
    if(unsupported && unsupported.length){
      html += '<span class="s-sub">⚠ 이 시뮬레이터가 모르는 문장 '
            + unsupported.map(function(u){ return '<code>'+esc(u)+'</code>'; }).join(' · ')
            + ' 은(는) 실행하지 않고 건너뛰었어요.</span>';
    }
    statusEl.innerHTML=html;
  }

  /* ── 6) UI ─────────────────────────────────────────────── */
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
