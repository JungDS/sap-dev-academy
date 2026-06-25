// ===== 컴포넌트 JS — 빈칸 채우기 =====
(function(){
  document.querySelectorAll("[data-fillblank]").forEach(group=>{
    const inputs = group.querySelectorAll("input[data-answer]");
    const out = group.querySelector(".fill-output");
    const norm = s => s.trim().toLowerCase().replace(/\s+/g," ");
    group.querySelector("[data-check]").addEventListener("click",()=>{
      let all=true, done=0;
      inputs.forEach(inp=>{
        const ok = norm(inp.value)===norm(inp.dataset.answer);
        inp.classList.toggle("ok",ok); inp.classList.toggle("bad",!ok);
        if(ok) done++; else all=false;
      });
      out.className = "fill-output " + (all?"ok":"bad");
      out.textContent = all
        ? "✓ 정답입니다! " + (group.dataset.explain||"")
        : `✗ ${done}/${inputs.length} 정답. ${group.dataset.hint||""}`;
    });
    const reveal = group.querySelector("[data-reveal]");
    if(reveal) reveal.addEventListener("click",()=>{
      inputs.forEach(inp=>{ inp.value=inp.dataset.answer; inp.classList.remove("bad"); inp.classList.add("ok"); });
      out.className="fill-output"; out.textContent="정답을 채워 넣었습니다. 한 번 더 직접 입력해 보세요.";
    });
    // 잠깐 보기 — 정답을 1.5초만 보여 주고(외워서 직접 입력하도록) 다시 가린다.
    const peek = group.querySelector("[data-peek]");
    if(peek) peek.addEventListener("click",()=>{
      if(peek.disabled) return;
      const saved=[...inputs].map(inp=>inp.value);
      inputs.forEach(inp=>{ inp.value=inp.dataset.answer; inp.classList.remove("ok","bad"); inp.classList.add("peek"); });
      out.className="fill-output"; out.textContent="👁 정답을 잠깐만 — 곧 사라져요. 기억해서 직접 입력!";
      peek.disabled=true;
      setTimeout(()=>{
        inputs.forEach((inp,i)=>{ inp.value=saved[i]; inp.classList.remove("peek"); });
        out.textContent='기억나는 대로 빈칸을 채우고 "채점하기"!';
        peek.disabled=false;
      }, 1500);
    });
    const resetBtn = group.querySelector("[data-reset]");
    if(resetBtn) resetBtn.addEventListener("click",()=>{
      inputs.forEach(inp=>{ inp.value=""; inp.classList.remove("ok","bad"); });
      out.className="fill-output"; out.textContent='빈칸을 채우고 "채점하기"를 눌러 보세요.';
      if(inputs[0]) inputs[0].focus({preventScroll:true});
    });
  });
})();
