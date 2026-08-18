// ===== 컴포넌트 JS — Diff Mapper =====
// 상호작용 = 사이트 공통 관례(레슨 용어 버튼과 동일): hover = 임시 미리보기 · 클릭/탭 = 고정.
//   고정 중 다른 줄 hover = 임시로 그 줄을 보여 주고, 벗어나면 고정된 줄로 복귀.
//   같은 줄 다시 클릭 = 해제, 다른 줄 클릭 = 고정 이동. 모바일(hover 없음)은 탭 고정이 기본 경로.
//   (hover 전용이던 구 동작은 모바일에서 누르고 있어야 해 화면을 가림 — 사용자 확정 2026-08-19)
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
      line.addEventListener("mouseenter",()=>paint(line));
      line.addEventListener("mouseleave",()=>paint(pinned ? lineOf(pinned) : null));
    });
  });
})();
