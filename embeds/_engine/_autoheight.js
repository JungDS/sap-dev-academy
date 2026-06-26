/* _autoheight.js — 자체 postHeight가 없는 위젯(CSS-only·fill-blank 등)용 공통 자동높이.
   .wrap(없으면 body) 바닥 + body 하단 마진을 부모에 postMessage(sda:'embed-height'). shell.js가 iframe 높이 설정.
   ⚠️ scrollHeight는 뷰포트 높이를 바닥값으로 포함 → iframe 높이 설정 후 resize 되먹임 루프를 만든다.
   그래서 getBoundingClientRect().bottom(뷰포트 floor 없음) + body 마진으로 측정(리셋 빠진 위젯의 8px 마진도 흡수).
   폰트(D2Coding) swap 후 reflow·DOM 변화(채점 등)에도 재전송. 폭 0(뷰포트 붕괴) 땐 전송 안 함. */
(function(){
  function post(){
    try{
      if(document.documentElement.clientWidth<60) return;
      var wrap=document.querySelector('.wrap')||document.body;
      var bm=parseFloat(getComputedStyle(document.body).marginBottom)||0;
      var h=Math.ceil(wrap.getBoundingClientRect().bottom+bm)+2;
      parent.postMessage({sda:'embed-height', h:h}, '*');
    }catch(e){}
  }
  window.addEventListener('load', post);
  window.addEventListener('resize', post);
  document.addEventListener('toggle', post, true);   // <details> 아코디언 펼침/접힘 시 높이 재측정(capture=toggle은 버블 안 함)
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(post);   // 웹폰트 swap 후 reflow 재측정
  try{ new MutationObserver(post).observe(document.body, {childList:true, subtree:true, characterData:true}); }catch(e){}
  if(document.readyState!=='loading') post(); else document.addEventListener('DOMContentLoaded', post);
})();
