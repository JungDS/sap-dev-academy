// ===== 컴포넌트 JS — Mermaid 렌더 (그래프는 위젯의 .mermaid 요소 textContent로 주입) =====
// CDN 우선, 로컬(_vendor) fallback 로드까지 대기 후 렌더. 그래프 정의는 엔진에 없음(레슨별 위젯에).
(function(){
  function go(){
    try{
      mermaid.initialize({
        startOnLoad:false, securityLevel:'loose', theme:'base',
        themeVariables:{ fontFamily:'inherit' },
        flowchart:{ curve:'basis', htmlLabels:true, nodeSpacing:46, rankSpacing:44, padding:10 }
      });
      mermaid.run({ nodes: document.querySelectorAll('.mermaid') }).then(function(){
        document.querySelectorAll('.mermaid .edgeLabel').forEach(function(el){ if(!el.textContent.trim()) el.style.display='none'; });
      }).catch(function(){});
    }catch(e){}
  }
  var tries=0;
  (function wait(){
    if(window.mermaid){ go(); return; }
    if(tries++>80) return;            // ~4s (CDN 실패 시 로컬 fallback 로드 대기)
    setTimeout(wait, 50);
  })();
})();
