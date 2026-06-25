// ===== struct-viz 엔진 JS — 구조체(Work Area) 컴포넌트 트리 =====
// 루트 변수 → 컴포넌트(하이픈 접근) · TYPE(+LENGTH/DECIMALS) · 값(있으면)을 트리로 렌더.
// 설정 = window.SV_CFG { root, kind, comps[{name,type,value?}], reuse?, assign?, note? }
//   assign:{comp,value,stmt} → "선언 직후 ↔ 값 전달 후" 인터랙션(버튼으로 그 컴포넌트에 값 기록).
(function(){
  var cfg = window.SV_CFG; if(!cfg) return;
  var root = document.querySelector('[data-structviz]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  // 컴포넌트는 이름만 표기 — 하이픈(-)은 접근 연산자지 이름의 일부가 아니다(트리 가지선이 루트→컴포넌트를 나타냄).
  // 선언만 해도 컴포넌트는 타입별 "초기값"을 가진다(미지정 아님). 명시 값이 없으면 타입에서 초기값을 유도.
  function initialFor(type){
    var t = String(type || '').toLowerCase().trim();
    var dec = (String(type).match(/decimals\s+(\d+)/i) || [])[1];
    if(/string/.test(t)) return "''";
    if(/^c\b|^n\b|char|clnt/.test(t)) return "''";
    if(/^d\b|datum/.test(t)) return "'00000000'";
    if(/^t\b|uzeit/.test(t)) return "'000000'";
    if(dec) return '0.' + new Array(+dec + 1).join('0');
    return '0';
  }
  function valChip(cls, v, type, cname){
    var attr = cname ? ' data-c="'+esc(cname)+'"' : '';
    if(v != null && v !== '') return '<span class="'+cls+'"'+attr+'>'+esc(v)+'</span>';
    return '<span class="'+cls+' init"'+attr+' title="선언 시 자동 초기값">'+esc(initialFor(type))+'</span>';
  }

  var assigned = false;
  // assign 대상이고 "실행됨"이면 기록된 값, 아니면 원래 값(보통 미설정→초기값)
  function effVal(c){
    if(cfg.assign && cfg.assign.comp === c.name && assigned) return cfg.assign.value;
    return c.value;
  }

  function render(){
    var stateKind = cfg.assign ? (assigned ? '값 전달 후' : '선언 직후') : cfg.kind;
    var h = '<div class="sv">';
    h += '<div class="sv__root"><span class="sv__rootname">'+esc(cfg.root)+'</span>'
       + (stateKind ? '<span class="sv__kind">'+esc(stateKind)+'</span>' : '') + '</div>';
    h += '<div class="sv__tree">';
    (cfg.comps || []).forEach(function(c){
      h += '<div class="sv__comp">'
         + '<span class="sv__name">'+esc(c.name)+'</span>'
         + '<span class="sv__type">TYPE '+esc(c.type)+'</span>'
         + '<span class="sv__lead"></span>'
         + valChip('sv__val', effVal(c), c.type, c.name)
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
             + valChip('sv-inst__v', v, c.type) + '</div>';
        });
        h += '</div>';
      });
      h += '</div></div>';
    }

    // 값 전달 인터랙션 — 선언 직후(초기값) ↔ 값 전달 후
    if(cfg.assign){
      h += '<div class="sv-assign">'
         + '<code class="sv-assign__stmt">'+esc(cfg.assign.stmt)+'</code>'
         + '<button type="button" class="sv-assign__btn" data-assign>'
         + (assigned ? '↺ 선언 직후로' : '▶ 값 전달 실행') + '</button></div>';
    }

    if(cfg.note) h += '<div class="sv__note">'+cfg.note+'</div>';  // note는 신뢰된 HTML(레슨 작성자)
    h += '</div>';
    root.innerHTML = h;
  }

  root.addEventListener('click', function(e){
    if(!e.target.closest('[data-assign]')) return;
    assigned = !assigned;
    render();
    if(assigned){   // 방금 기록된 컴포넌트 값에 플래시
      var leaf = root.querySelector('.sv__val[data-c="'+cfg.assign.comp+'"]');
      if(leaf) leaf.classList.add('flash');
    }
  });
  render();
})();
