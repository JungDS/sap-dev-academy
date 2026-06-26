// ===== sap-easy-access-mock 엔진 JS — SAP Easy Access 첫 화면 mock (CH01-L02) =====
// 정적 재현(명령창 위치 콜아웃). 명령창에 예시 코드를 천천히 순환 표시(읽기 편하게). 데이터=window.EAM_CFG.
(function(){
  var cfg = window.EAM_CFG || {};
  var SAMPLES = cfg.samples || ['SE38'];
  var $=function(id){return document.getElementById(id);};

  // 명령창 예시 코드 순환(타이핑 느낌)
  var fi=0;
  function cycle(){
    var f=$('field'); if(!f) return;
    f.firstChild.textContent = SAMPLES[fi % SAMPLES.length];
    fi++;
  }
  if(SAMPLES.length>1){ cycle(); setInterval(cycle, 2200); }
  else { var f=$('field'); if(f) f.firstChild.textContent=SAMPLES[0]; }

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  postHeight();
})();
