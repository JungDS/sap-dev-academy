// ===== image-figure 엔진 JS — 정적 이미지 figure (스크린샷) =====
// 이미지 로드/실패에 맞춰 높이를 부모로 전송. 파일이 없으면 플레이스홀더로 전환.
(function(){
  var $=function(s){return document.querySelector(s);};
  var img=$('.if-img'), ph=$('.if-ph');

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }

  if(img){
    img.addEventListener('load', postHeight);
    img.addEventListener('error', function(){
      img.style.display='none';
      if(ph){ ph.style.display='block'; var c=ph.querySelector('.path'); if(c) c.textContent=img.getAttribute('src'); }
      postHeight();
    });
    // 이미 캐시로 로드 완료된 경우
    if(img.complete){ if(img.naturalWidth===0){ img.dispatchEvent(new Event('error')); } else { postHeight(); } }
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  postHeight();
})();
