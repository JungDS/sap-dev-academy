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
  h += '</div>';   // /sv__tree

  // 재사용 — 같은 타입(모양)으로 변수 인스턴스 여러 개. 컴포넌트 모양은 cfg.comps 공유, 값만 각자.
  if(cfg.reuse && cfg.reuse.instances){
    h += '<div class="sv-reuse">';
    if(cfg.reuse.label) h += '<div class="sv-reuse__label">'+esc(cfg.reuse.label)+'</div>';
    h += '<div class="sv-insts">';
    cfg.reuse.instances.forEach(function(inst){
      h += '<div class="sv-inst"><div class="sv-inst__hd"><span class="sv-inst__var">'+esc(inst.root)+'</span>'
         + '<span class="sv-inst__type">TYPE '+esc(cfg.root)+'</span></div>';
      (cfg.comps || []).forEach(function(c){
        var v = inst.vals && inst.vals[c.name];
        h += '<div class="sv-inst__row"><span class="sv-inst__k">'+esc(c.name)+'</span>'
           + ((v != null && v !== '') ? '<span class="sv-inst__v">'+esc(v)+'</span>'
                                      : '<span class="sv-inst__v empty">미지정</span>') + '</div>';
      });
      h += '</div>';
    });
    h += '</div></div>';
  }

  if(cfg.note) h += '<div class="sv__note">'+cfg.note+'</div>';  // note는 신뢰된 HTML(레슨 작성자)
  h += '</div>';
  root.innerHTML = h;
})();
