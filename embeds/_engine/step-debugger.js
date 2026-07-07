// ===== 컴포넌트 JS — ABAP 하이라이터 + 스텝 디버거 엔진 =====
(function(){
  const ABAP_KW = new Set("DATA TYPE TYPES VALUE TABLE OF LIKE LINE BEGIN END REF TO LOOP AT INTO ENDLOOP APPEND WRITE IF ELSE ELSEIF ENDIF SELECT FROM WHERE INNER LEFT OUTER JOIN ON READ WITH KEY SORT BY CLEAR REFRESH MOVE CORRESPONDING FIELDS SINGLE STANDARD SORTED HASHED INSERT DELETE MODIFY DESCRIBE LINES DO ENDDO WHILE ENDWHILE CASE WHEN OTHERS ENDCASE CALL METHOD FUNCTION FORM PERFORM PARAMETERS RANGES CHECK EXIT CONTINUE RETURN ADD SUBTRACT MULTIPLY DIVIDE CONCATENATE SPLIT CONDENSE ASCENDING DESCENDING AND OR NOT IS INITIAL BOUND NEW LENGTH DECIMALS TIMES".split(/\s+/));
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
    if(varsBox) varsBox.innerHTML=cfg.vars.map(v=>`<div class="var"><div class="var__name"><span class="var__label">${v.label}</span><span class="var__sub">${v.sub||""}</span></div><b class="var__val" data-key="${v.key}" data-init="${v.init}">${v.init}</b></div>`).join("");

    const lines=root.querySelectorAll(".code li");
    const consoleEl=root.querySelector("[data-console]"), startBtn=root.querySelector("[data-start]"), nextBtn=root.querySelector("[data-next]");
    const progress=root.querySelector("[data-progress]"), counter=root.querySelector("[data-counter]"), cmodeBtns=root.querySelectorAll("[data-cmode]");
    const steps=cfg.steps;
    let started=false, cur=0, history=[], mode="cur"; // cur = 실행 완료한 줄 수

    function accVars(k){ const v={}; cfg.vars.forEach(d=>v[d.key]=d.init); for(let i=0;i<k;i++) Object.assign(v, steps[i].vars||{}); return v; }
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
      cfg.vars.forEach(d=>{ const cell=root.querySelector('.var__val[data-key="'+d.key+'"]'); if(cell){ cell.textContent=v[d.key]; cell.classList.remove("changed"); if(changed[d.key]!==undefined){ void cell.offsetWidth; cell.classList.add("changed"); } } });
      if(progress) progress.style.width=(cur/steps.length*100)+"%";
      if(counter) counter.textContent=cur+" / "+steps.length;
      paintConsole();
    }
    startBtn.addEventListener("click",()=>{ started=true; cur=0; history=[]; startBtn.textContent="↻ 다시"; nextBtn.disabled=false; if(progress) progress.style.transition="width .35s"; render(); });
    nextBtn.addEventListener("click",()=>{ if(!started||cur>=steps.length) return; const s=steps[cur]; history.push((cur+1)+". [line "+s.line+" 실행] "+(s.console||"")); cur++; render(); if(cur>=steps.length) nextBtn.disabled=true; });
    cmodeBtns.forEach(b=>b.addEventListener("click",()=>{ mode=b.dataset.cmode; cmodeBtns.forEach(x=>x.classList.toggle("on",x===b)); paintConsole(); }));
    render();
  }
  document.querySelectorAll("[data-stepper]").forEach(initStepper);
})();
