// ===== f4-attach-scope 엔진 JS — Search Help 부착 지점별 영향 범위 (CH09-L06) =====
// Data Element / 테이블 필드 / Structure / MATCHCODE OBJECT 부착 시 어떤 입력칸이 영향받는지(초록) 비교.
// 데이터=window.FAS_CFG = { fields:[{id,name,basis}], points:[{key,label,code,scope,fields:[id..]}] }
(function(){
  var cfg = window.FAS_CFG || {};
  var FIELDS = cfg.fields || [];
  var POINTS = cfg.points || [];
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var cur = POINTS[0] ? POINTS[0].key : null;

  function curPoint(){ return POINTS.filter(function(p){return p.key===cur;})[0] || {fields:[]}; }

  function render(){
    $('aps').querySelectorAll('.ap').forEach(function(b){ b.classList.toggle('on', b.dataset.k===cur); });
    var p=curPoint();
    $('code').innerHTML = p.code || '';
    $('scopebar').innerHTML = '영향 범위: <b>'+esc(p.scope||'')+'</b>';
    var lit = p.fields || [];
    $('fields').innerHTML = FIELDS.map(function(f){
      var on = lit.indexOf(f.id)>=0;
      return '<div class="fcard'+(on?' lit':'')+'"><div class="fcard__n">'+esc(f.name)+'</div>'
        +'<div class="fcard__b">'+esc(f.basis)+'</div>'
        +'<div class="fcard__f4">'+(on?'<span class="yes">▶ 이 F4가 적용됨</span>':'<span class="no">— 영향 없음</span>')+'</div></div>';
    }).join('');
    postHeight();
  }

  $('aps').addEventListener('click',function(e){ var b=e.target.closest('.ap'); if(b){ cur=b.dataset.k; render(); } });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
