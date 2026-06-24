// ===== 컴포넌트 JS — Diff Mapper =====
(function(){
  document.querySelectorAll(".diff-mapper").forEach(mapper=>{
    const lines = mapper.querySelectorAll(".diff-line");
    const explain = mapper.querySelector(".diff-explain");
    const base = explain.innerHTML;
    lines.forEach(line=>{
      line.addEventListener("mouseenter",()=>{
        const id = line.dataset.link;
        mapper.querySelectorAll(`.diff-line[data-link="${id}"]`).forEach(l=>l.classList.add("linked"));
        explain.innerHTML = `<div><strong>${line.dataset.title||"설명"}</strong><br>${line.dataset.desc||""}</div>`;
      });
      line.addEventListener("mouseleave",()=>{
        lines.forEach(l=>l.classList.remove("linked"));
        explain.innerHTML = base;
      });
    });
  });
})();
