/* _autoheight.js — 자체 postHeight가 없는 위젯(CSS-only·fill-blank 등)용 공통 자동높이.
   .wrap(없으면 body) 높이를 부모에 postMessage(sda:'embed-height'). shell.js가 iframe 높이 설정.
   MutationObserver로 DOM 변화(채점·정답보기 등)에도 재전송. 폭 0(뷰포트 붕괴) 땐 전송 안 함. */
(function(){
  function post(){
    try{
      if(document.documentElement.clientWidth<60) return;
      var el=document.querySelector('.wrap')||document.body;
      var h=Math.ceil(el.getBoundingClientRect().height)+6;
      parent.postMessage({sda:'embed-height', h:h}, '*');
    }catch(e){}
  }
  window.addEventListener('load', post);
  window.addEventListener('resize', post);
  try{ new MutationObserver(post).observe(document.body, {childList:true, subtree:true, characterData:true}); }catch(e){}
  if(document.readyState!=='loading') post(); else document.addEventListener('DOMContentLoaded', post);
})();
