// ===== struct-viz 엔진 JS — 구조체(Work Area) 컴포넌트 트리 =====
// 루트 변수 → 컴포넌트(하이픈 접근) · TYPE(+LENGTH/DECIMALS) · 값(있으면)을 트리로 렌더.
// 설정 = window.SV_CFG { root, kind, access('-'), comps[{name,type,value?}], note? }
(function(){
  var cfg = window.SV_CFG; if(!cfg) return;
  var root = document.querySelector('[data-structviz]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  // 컴포넌트는 이름만 표기 — 하이픈(-)은 접근 연산자(구분자)지 이름의 일부가 아니다(트리 가지선이 루트→컴포넌트를 나타냄).

  var h = '<div class="sv">';
  h += '<div class="sv__root"><span class="sv__rootname">'+esc(cfg.root)+'</span>'
     + (cfg.kind ? '<span class="sv__kind">'+esc(cfg.kind)+'</span>' : '') + '</div>';
  h += '<div class="sv__tree">';
  (cfg.comps || []).forEach(function(c){
    h += '<div class="sv__comp">'
       + '<span class="sv__name">'+esc(c.name)+'</span>'
       + '<span class="sv__type">TYPE '+esc(c.type)+'</span>'
       + '<span class="sv__lead"></span>'
       + ((c.value != null && c.value !== '')
            ? '<span class="sv__val">'+esc(c.value)+'</span>'
            : '<span class="sv__val empty">미지정</span>')
       + '</div>';
  });
  h += '</div>';
  if(cfg.note) h += '<div class="sv__note">'+cfg.note+'</div>';  // note는 신뢰된 HTML(레슨 작성자)
  h += '</div>';
  root.innerHTML = h;
})();
