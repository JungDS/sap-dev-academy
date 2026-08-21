// ===== 컴포넌트 JS — Diff Mapper =====
// 상호작용: hover = 임시 미리보기(자유 상태에서만) · 클릭/탭 = 고정.
//   고정 중에는 hover를 완전히 무시한다(표시 불변) — 해제 경로는 딱 둘:
//   ① 같은 줄 다시 클릭 = 해제 · ② 다른 줄 클릭 = 그 줄로 고정 이동. (사용자 확정 2026-08-19)
//   모바일(hover 없음)은 탭 고정이 기본 경로 — hover 전용이던 구 동작은 누르고 있어야 해 화면을 가렸음.
(function(){
  document.querySelectorAll(".diff-mapper").forEach(mapper=>{
    const lines = [...mapper.querySelectorAll(".diff-line")];
    const explain = mapper.querySelector(".diff-explain");
    const base = explain.innerHTML;
    let pinned = null;                                  // 고정된 data-link id (null = 자유)
    const lineOf = id => lines.find(l=>l.dataset.link===id);
    function paint(line){
      lines.forEach(l=>l.classList.remove("linked","pinned"));
      if(!line){ explain.innerHTML = base; return; }
      const id = line.dataset.link, isPin = (pinned===id);
      mapper.querySelectorAll(`.diff-line[data-link="${id}"]`).forEach(l=>{
        l.classList.add("linked"); if(isPin) l.classList.add("pinned");
      });
      explain.innerHTML = `<div>${isPin?'<span class="diff-pin">📌 고정됨 · 같은 줄을 다시 누르면 해제</span><br>':""}<strong>${line.dataset.title||"설명"}</strong><br>${line.dataset.desc||""}</div>`;
    }
    lines.forEach(line=>{
      line.addEventListener("click",()=>{
        const id = line.dataset.link;
        pinned = (pinned===id) ? null : id;
        paint(pinned ? line : null);
      });
      line.addEventListener("mouseenter",()=>{ if(pinned===null) paint(line); });
      line.addEventListener("mouseleave",()=>{ if(pinned===null) paint(null); });
    });
  });
})();
