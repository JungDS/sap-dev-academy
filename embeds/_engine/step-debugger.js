// ===== 컴포넌트 JS — ABAP 하이라이터 + 스텝 디버거 엔진 =====
// vars 항목에 itab:{cols:[..],num:[..]}을 주면 값(2차원 배열)을 행 미니테이블로 렌더 —
// 추가(new)/변경(chg) 행 강조 = **초록·스텝 유지형**(완료된 줄이 만든 결과 = 코드 창 done과 같은 초록,
// 다음 스텝 전까지 배경 유지 — CSS가 담당. 노랑은 왼쪽 '실행할 차례' 전용, 사용자 확정 2026-08-19),
// steps[i].focus={key:1기준행번호}로 현재 처리 행 강조(파랑 포인터). (CH06+ Internal Table 워치)
//   · itab.max(선택, 기본 없음): 행이 max보다 많으면 앞/뒤만 보이고 가운데는 "⋮ n행 생략"으로 접는다
//     (focus 행은 항상 포함). 대량 테이블(CH06-L06 구구단 72행)용 — max 미지정이면 전 행 렌더로 종전과 동일.
//
// [선택 레이어] Watchpoint — 인스턴스 HTML에 [data-wp] 마크업이 있을 때만 배선한다(config 변경 없음).
//   마크업 훅: [data-wp](루트) · [data-wp-open](만들기 버튼) · [data-wp-form](입력줄) ·
//              [data-wp-name](변수 이름 입력) · [data-wp-names](datalist·엔진이 채움) ·
//              [data-wp-add](저장) · [data-wp-cancel] · [data-wp-list](목록) ·
//              [data-wp-run](계속 F8) · [data-wp-msg](상태줄)
//   동작: 감시 변수가 바뀌는 스텝을 만나면 그 줄에서 자동 정지. 걸어 둔 게 없으면 끝까지 실행.
//   ⚠️ [data-wp]가 없는 기존 소비자(CH04-L01/L05·CH05·CH06·CH10)는 이 블록에 진입하지 않는다.
(function(){
  const ABAP_KW = new Set("DATA TYPE TYPES VALUE TABLE OF LIKE LINE BEGIN END REF TO LOOP AT INTO ENDLOOP APPEND WRITE IF ELSE ELSEIF ENDIF SELECT FROM WHERE INNER LEFT OUTER JOIN ON READ WITH KEY SORT BY CLEAR REFRESH MOVE CORRESPONDING FIELDS SINGLE STANDARD SORTED HASHED INSERT DELETE MODIFY DESCRIBE LINES DO ENDDO WHILE ENDWHILE CASE WHEN OTHERS ENDCASE CALL METHOD FUNCTION FORM PERFORM PARAMETERS RANGES CHECK EXIT CONTINUE RETURN ADD SUBTRACT MULTIPLY DIVIDE CONCATENATE SPLIT CONDENSE ASCENDING DESCENDING AND OR NOT IS INITIAL BOUND NEW LENGTH DECIMALS TIMES TRANSPORTING NO BINARY SEARCH ASSIGNING FIELD SYMBOLS COLLECT ADJACENT DUPLICATES COMPARING SUM ENDAT FREE INDEX UNIQUE".split(/\s+/));
  const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  function highlightAbap(line){
    if(/^\s*\*/.test(line)) return '<span class="tok-com">'+esc(line)+'</span>'; // 전체 줄 주석(*)
    let out=""; const re=/('[^']*'?)|(".*$)|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_]*)|([^A-Za-z0-9_'"]+)/g; let m;
    while((m=re.exec(line))!==null){
      if(m[1]) out+='<span class="tok-str">'+esc(m[1])+'</span>';      // 문자열 '...'
      else if(m[2]) out+='<span class="tok-com">'+esc(m[2])+'</span>'; // 인라인 주석 "...
      else if(m[3]) out+='<span class="tok-num">'+esc(m[3])+'</span>'; // 숫자
      else if(m[4]) out+= ABAP_KW.has(m[4].toUpperCase()) ? '<span class="tok-kw">'+esc(m[4])+'</span>' : esc(m[4]);
      else out+=esc(m[0]);
    }
    return out;
  }

  function initStepper(root){
    let cfg; try{ cfg = JSON.parse(root.querySelector(".stepper-config").textContent); }catch(e){ return; }
    // 코드 렌더(+구문 강조)
    const codeBox = root.querySelector("[data-code]");
    if(codeBox){
      const ol=document.createElement("ol"); ol.className="code";
      cfg.code.forEach((line,i)=>{ const li=document.createElement("li"); li.dataset.line=i+1;
        const code=document.createElement("code"); code.innerHTML=highlightAbap(line); li.appendChild(code); ol.appendChild(li); });
      codeBox.appendChild(ol);
    }
    const varsBox=root.querySelector("[data-vars]");
    if(varsBox) varsBox.innerHTML=cfg.vars.map(v=>{
      if(v.itab) return `<div class="var var--itab"><div class="var__name"><span class="var__label">${v.label}</span><span class="var__sub">${v.sub||""}</span></div><div class="itw" data-key="${v.key}"></div></div>`;
      return `<div class="var"><div class="var__name"><span class="var__label">${v.label}</span><span class="var__sub">${v.sub||""}</span></div><b class="var__val" data-key="${v.key}" data-init="${v.init}">${v.init}</b></div>`;
    }).join("");

    const lines=root.querySelectorAll(".code li");
    const consoleEl=root.querySelector("[data-console]"), startBtn=root.querySelector("[data-start]"), nextBtn=root.querySelector("[data-next]");
    const progress=root.querySelector("[data-progress]"), counter=root.querySelector("[data-counter]"), cmodeBtns=root.querySelectorAll("[data-cmode]");
    const steps=cfg.steps;
    let started=false, cur=0, history=[], mode="cur"; // cur = 실행 완료한 줄 수

    function accVars(k){ const v={}; cfg.vars.forEach(d=>v[d.key]=d.init); for(let i=0;i<k;i++) Object.assign(v, steps[i].vars||{}); return v; }
    // itab 워치 — 행 미니테이블(추가=new·변경=chg 플래시, focus=현재 처리 행, 숫자 열=우측 정렬)
    function itabHTML(d, rows, prevRows, focusIdx){
      const cols=d.itab.cols||[], num=d.itab.num||[], max=d.itab.max|0;
      let h='<table class="itw__t"><thead><tr><th class="ix">#</th>'+cols.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>';
      if(!rows||!rows.length){ h+='<tr class="itw__empty"><td colspan="'+(cols.length+1)+'">비어 있음 · 0행</td></tr>'; }
      else{
        // 렌더할 행 인덱스 — max 미지정(0)이면 전 행(종전 동작), 지정 시 앞/뒤 + focus 행만
        let show;
        if(max>0 && rows.length>max){
          const head=Math.ceil(max/2), tail=max-head, keep=new Set();
          for(let i=0;i<head;i++) keep.add(i);
          for(let i=rows.length-tail;i<rows.length;i++) keep.add(i);
          if(focusIdx) keep.add(focusIdx-1);
          show=[...keep].sort((a,b)=>a-b);
        } else show=rows.map((_,i)=>i);
        let prev=-1;
        show.forEach(i=>{
          if(i>prev+1) h+='<tr class="itw__more"><td colspan="'+(cols.length+1)+'">⋮ '+(i-prev-1)+'행 생략</td></tr>';
          prev=i;
          const r=rows[i], p=prevRows?prevRows[i]:r;
          const isNew=!p, isChg=!!p&&JSON.stringify(p)!==JSON.stringify(r);
          const cls=[(i+1)===focusIdx?'focus':'', isNew?'new':(isChg?'chg':'')].filter(Boolean).join(' ');
          h+='<tr'+(cls?' class="'+cls+'"':'')+'><td class="ix">'+(i+1)+'</td>'+r.map((c,j)=>'<td'+(num[j]?' class="n"':'')+'>'+esc(String(c))+'</td>').join('')+'</tr>';
        });
      }
      return h+'</tbody></table>';
    }
    function curMsg(){
      if(!started) return "대기 중 — ▶ 시작을 누르세요.";
      const next = cur<steps.length ? steps[cur].line : null;
      if(cur===0) return "▶ 준비됨 — '다음 ⏭'을 누르면 "+next+"번 줄을 실행합니다.\n(강조된 줄은 '실행할 차례'이며 아직 실행 전입니다.)";
      const done=steps[cur-1];
      let msg="✓ 방금 "+done.line+"번 줄 실행 → "+(done.console||"");
      msg += (next!=null) ? "\n▶ 다음에 실행할 줄: "+next+"번 (아직 실행 전)" : "\n■ 끝까지 실행 완료";
      return msg;
    }
    function paintConsole(){ if(!consoleEl) return; consoleEl.textContent=(mode==="all")?(history.length?history.join("\n"):"(아직 실행한 줄이 없습니다)"):curMsg(); }
    function render(){
      lines.forEach(l=>l.classList.remove("active","done"));
      const nextLine=(started&&cur<steps.length)?steps[cur].line:null, lastLine=(started&&cur>0)?steps[cur-1].line:null;
      if(lastLine!=null){ const el=root.querySelector('.code li[data-line="'+lastLine+'"]'); if(el) el.classList.add("done"); }
      if(nextLine!=null){ const el=root.querySelector('.code li[data-line="'+nextLine+'"]'); if(el){ el.classList.add("active"); el.scrollIntoView({block:"nearest"}); } }
      const v=accVars(cur), changed=(started&&cur>0)?(steps[cur-1].vars||{}):{};
      const prevV=(started&&cur>0)?accVars(cur-1):null, focus=(started&&cur>0)?(steps[cur-1].focus||{}):{};
      cfg.vars.forEach(d=>{
        if(d.itab){ const box=root.querySelector('.itw[data-key="'+d.key+'"]'); if(box) box.innerHTML=itabHTML(d, v[d.key], prevV?prevV[d.key]:null, focus[d.key]||null); return; }
        const cell=root.querySelector('.var__val[data-key="'+d.key+'"]'); if(cell){ cell.textContent=v[d.key]; cell.classList.remove("changed"); if(changed[d.key]!==undefined){ void cell.offsetWidth; cell.classList.add("changed"); } } });
      if(progress) progress.style.width=(cur/steps.length*100)+"%";
      if(counter) counter.textContent=cur+" / "+steps.length;
      paintConsole();
    }
    startBtn.addEventListener("click",()=>{ started=true; cur=0; history=[]; startBtn.textContent="↻ 다시"; nextBtn.disabled=false; if(progress) progress.style.transition="width .35s"; render(); });
    nextBtn.addEventListener("click",()=>{ if(!started||cur>=steps.length) return; const s=steps[cur]; history.push((cur+1)+". [line "+s.line+" 실행] "+(s.console||"")); cur++; render(); if(cur>=steps.length) nextBtn.disabled=true; });
    cmodeBtns.forEach(b=>b.addEventListener("click",()=>{ mode=b.dataset.cmode; cmodeBtns.forEach(x=>x.classList.toggle("on",x===b)); paintConsole(); }));

    // ---- Watchpoint 레이어(선택) — [data-wp] 마크업이 있을 때만 배선 ----
    const wpRoot = root.querySelector("[data-wp]");
    if(wpRoot){
      const wpOpen=wpRoot.querySelector("[data-wp-open]"), wpForm=wpRoot.querySelector("[data-wp-form]"),
            wpName=wpRoot.querySelector("[data-wp-name]"), wpNames=wpRoot.querySelector("[data-wp-names]"),
            wpAdd=wpRoot.querySelector("[data-wp-add]"), wpCancel=wpRoot.querySelector("[data-wp-cancel]"),
            wpList=wpRoot.querySelector("[data-wp-list]"), wpRun=wpRoot.querySelector("[data-wp-run]"),
            wpMsg=wpRoot.querySelector("[data-wp-msg]");
      const watched=new Set();                         // 감시 중인 vars key
      const byLabel=s=>cfg.vars.find(v=>v.label.toLowerCase()===s || v.key.toLowerCase()===s);
      const labelOf=k=>{ const d=cfg.vars.find(v=>v.key===k); return d?d.label:k; };
      if(wpNames) wpNames.innerHTML=cfg.vars.map(v=>'<option value="'+v.label+'"></option>').join("");
      function say(t,cls){ if(!wpMsg) return; wpMsg.className="wp__msg"+(cls?" "+cls:""); wpMsg.innerHTML=t; }
      function paintWp(){
        if(wpList) wpList.innerHTML = watched.size
          ? [...watched].map(k=>'<span class="wp__chip">👁 '+labelOf(k)+
              '<button class="wp__x" type="button" data-wp-del="'+k+'" aria-label="'+labelOf(k)+' Watchpoint 삭제">✕</button></span>').join("")
          : '<span class="wp__none">아직 없음 — 걸어 두면 그 변수가 <b>바뀌는 줄</b>에서 자동으로 멈춥니다.</span>';
        if(wpRun) wpRun.textContent = watched.size ? "▶▶ 계속 (F8) — Watchpoint까지" : "▶▶ 계속 (F8) — 끝까지";
      }
      function openForm(o){ if(!wpForm) return; wpForm.hidden=!o; if(o&&wpName){ wpName.value=""; wpName.focus({preventScroll:true}); } }
      function save(){
        const raw=(wpName&&wpName.value||"").trim(), d=byLabel(raw.toLowerCase());
        if(!raw){ say("감시할 <b>변수 이름</b>을 적어 주세요."); return; }
        if(!d){ say("<b>"+raw+"</b> 라는 변수가 이 프로그램에 없습니다 — 오른쪽 <b>변수 모니터</b>에 있는 이름으로 적어 주세요."); return; }
        if(watched.has(d.key)){ say("<b>"+d.label+"</b>에는 이미 Watchpoint가 걸려 있습니다."); paintWp(); return; }
        watched.add(d.key); paintWp(); openForm(false);
        say("✅ <b>"+d.label+"</b> Watchpoint 저장 — 이제 <b>계속 (F8)</b>을 누르면 이 값이 바뀌는 줄에서 자동으로 멈춥니다.");
      }
      function runToWatch(){
        if(!started){ say("먼저 <b>▶ 시작</b>을 눌러 주세요."); return; }
        if(cur>=steps.length){ say("이미 끝까지 실행했습니다 — <b>↻ 다시</b>로 처음부터 해 보세요."); return; }
        let hit=null;
        while(cur<steps.length){
          const s=steps[cur], before=accVars(cur);
          history.push((cur+1)+". [line "+s.line+" 실행] "+(s.console||""));
          cur++;
          const keys=Object.keys(s.vars||{}).filter(k=>watched.has(k)&&String(before[k])!==String(s.vars[k]));
          if(keys.length){ hit={line:s.line,keys:keys,before:before,after:accVars(cur)}; break; }
        }
        render();
        if(cur>=steps.length) nextBtn.disabled=true;
        if(hit) say("⏸ <b>Watchpoint 정지</b> — "+hit.line+"번 줄에서 "+
              hit.keys.map(k=>"<b>"+labelOf(k)+"</b>: "+hit.before[k]+" → "+hit.after[k]).join(" · ")+
              " (값이 바뀐 그 줄을 실행한 직후 멈췄습니다)","hit");
        else if(watched.size) say("■ 끝까지 실행했습니다 — 남은 구간에서는 감시 변수가 <b>바뀌지 않았습니다</b>.","end");
        else say("■ 끝까지 실행했습니다 — <b>걸어 둔 Watchpoint가 없으면 F8은 이렇게 끝까지 가 버립니다.</b>","end");
      }
      if(wpOpen)   wpOpen.addEventListener("click",()=>openForm(wpForm&&wpForm.hidden));
      if(wpAdd)    wpAdd.addEventListener("click",save);
      if(wpCancel) wpCancel.addEventListener("click",()=>openForm(false));
      if(wpName)   wpName.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); save(); } });
      if(wpRun)    wpRun.addEventListener("click",runToWatch);
      if(wpList)   wpList.addEventListener("click",e=>{ const b=e.target.closest("[data-wp-del]"); if(!b) return;
                     const k=b.dataset.wpDel; watched.delete(k); paintWp();
                     say("🗑 <b>"+labelOf(k)+"</b> Watchpoint를 지웠습니다."); });
      startBtn.addEventListener("click",()=>{ say(watched.size
        ? "처음부터 다시 — 걸어 둔 Watchpoint는 <b>그대로</b> 살아 있습니다(세션 동안 유지)."
        : "처음부터 다시 — <b>＋ Watchpoint 만들기</b>로 감시할 변수를 걸어 보세요."); });
      paintWp();
      say("<b>＋ Watchpoint 만들기</b> → 감시할 변수 이름 입력 → <b>저장</b> 순서로 걸어 봅니다.");
    }

    render();
  }
  document.querySelectorAll("[data-stepper]").forEach(initStepper);
})();
