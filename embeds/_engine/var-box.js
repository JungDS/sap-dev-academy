// ===== var-box 엔진 JS — 변수 박스 비유(타입 라벨 박스 + 값 쪽지) =====
// 선언 직후(타입 기본값) ↔ 값 넣기(대입) 토글. 설정 = window.VB_CFG { vars[{name,type,value,init?}], note? }
(function(){
  var cfg = window.VB_CFG; if(!cfg) return;
  var root = document.querySelector('[data-varbox]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function initialFor(type){   // 선언만 해도 갖는 타입 기본값
    var t = String(type || '').toLowerCase().trim();
    var dec = (String(type).match(/decimals\s+(\d+)/i) || [])[1];
    if(/string/.test(t)) return "''";
    if(/^c\b|^n\b|char/.test(t)) return "''";
    if(/^d\b/.test(t)) return "'00000000'";
    if(dec) return '0.' + new Array(+dec + 1).join('0');
    return '0';
  }
  var assigned = false;
  function render(){
    var h = '<div class="vb-row">';
    (cfg.vars || []).forEach(function(v){
      var paper = assigned ? v.value : (v.init != null ? v.init : initialFor(v.type));
      h += '<div class="vb"><div class="vb__paper' + (assigned ? '' : ' init') + '">' + esc(paper) + '</div>'
         + '<div class="vb__box"><div class="vb__name">' + esc(v.name) + '</div>'
         + '<div class="vb__type">TYPE ' + esc(v.type) + '</div></div></div>';
    });
    h += '</div>';
    h += '<div class="vb-ctl"><button type="button" class="vb-ctl__btn" data-toggle>'
       + (assigned ? '↺ 선언 직후로' : '▶ 값 넣기 (대입 =)') + '</button>'
       + '<span class="vb-ctl__state">' + (assigned ? '값을 넣은 뒤' : '선언 직후 — 타입 기본값') + '</span></div>';
    if(cfg.note) h += '<div class="note">' + cfg.note + '</div>';   // note는 신뢰된 HTML(레슨 작성자)
    root.innerHTML = h;
  }
  root.addEventListener('click', function(e){
    if(!e.target.closest('[data-toggle]')) return;
    assigned = !assigned;
    render();
    if(assigned) root.querySelectorAll('.vb__paper').forEach(function(p){ p.classList.add('flash'); });
  });
  render();
})();
