// ===== move-mapping 엔진 JS — classic MOVE-CORRESPONDING 매핑 보드(SAP 표준 구도) =====
// SAP BC400 표준 이미지 구도(사용자 제공 2026-07-03): 위=원본 스트립 · 아래=대상 스트립 ·
// 같은 이름 필드끼리 화살표(실행 전=점선, 실행 후=실선+초록). 필드 라벨은 칸 위(SAP 표기).
// 공식 규칙: "identically named... other components are NOT affected" → 대상-only 잔존 함정 + CLEAR 토글.
// 설정 = window.MM_CFG { src:{name,fields:[{n,v,t?}]}, tgt:{name,fields:[{n,pre?,t?}]}, note? } — t=ABAP 타입(숫자면 값 우측 정렬)
(function(){
  var cfg = window.MM_CFG; if(!cfg) return;
  var root = document.querySelector('[data-mm]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  // 숫자 타입 = 우측 정렬(struct-viz와 동일 관례 — "숫자는 오른쪽" 각인, 피드백 2026-07-03)
  function isNumType(t){ return /^(i|int8|p|f|decfloat16|decfloat34)($|[^a-z0-9_])/i.test(String(t||'').trim()); }

  var clearFirst = false, moved = false;
  var srcNames = cfg.src.fields.map(function(f){ return f.n; });
  var tgtNames = cfg.tgt.fields.map(function(f){ return f.n; });

  function tgtVal(f){
    var common = srcNames.indexOf(f.n) >= 0;
    if(moved && common){ var s = cfg.src.fields.filter(function(x){return x.n===f.n;})[0]; return s.v; }
    if(f.pre == null) return '';
    return (moved && clearFirst) ? '' : f.pre;
  }

  function stripRow(side, st){
    var isSrc = side === 'src';
    var h = '<div class="mm-striprow '+side+'">'
          + '<span class="mm-slab"><b>'+esc(st.name)+'</b><small>'+(isSrc?'원본':'대상')+'</small></span>'
          + '<div class="mm-cells">';
    st.fields.forEach(function(f){
      var common = (isSrc ? tgtNames : srcNames).indexOf(f.n) >= 0;
      var cls = common ? 'common' : (isSrc ? 'srconly' : 'tgtonly');
      var val = isSrc ? f.v : tgtVal(f);
      var stale = !isSrc && !common && moved && !clearFirst && f.pre != null;
      h += '<div class="mm-cellwrap" data-side="'+side+'" data-f="'+esc(f.n)+'">'
         + '<small class="mm-flab">'+esc(f.n)+'</small>'
         + '<div class="mm-cell '+cls+(isNumType(f.t)?' num':'')+(moved && common && !isSrc ? ' flash':'')+(stale?' stale':'')+'">'
         + (val===''? '<i>(초기값)</i>' : esc(val))+'</div>'
         + (isSrc && !common ? '<small class="mm-tag amber">갈 곳 없음</small>'
            : (!isSrc && !common ? '<small class="mm-tag'+(stale?' bad':'')+'">'+(stale?'⚠ 이전 값 잔존':'건드리지 않음')+'</small>' : ''))
         + '</div>';
    });
    h += '</div></div>';
    return h;
  }

  function render(){
    var h = '<pre class="mm-code">'+(clearFirst ? 'CLEAR '+esc(cfg.tgt.name)+'.\n' : '')
          + 'MOVE-CORRESPONDING '+esc(cfg.src.name)+' TO '+esc(cfg.tgt.name)+'.</pre>';
    h += '<div class="mm-flow">'
       + stripRow('src', cfg.src)
       + '<div class="mm-gap"></div>'
       + stripRow('tgt', cfg.tgt)
       + '<svg class="mm-svg" aria-hidden="true"></svg>'
       + '</div>';
    h += '<div class="mm-btns">'
       + '<button type="button" class="mm-btn tog'+(clearFirst?' on':'')+'" data-clear>CLEAR '+esc(cfg.tgt.name)+' 먼저</button>'
       + '<button type="button" class="mm-btn run" data-run>'+(moved ? '↺ 다시하기' : '▶ MOVE-CORRESPONDING 실행')+'</button>'
       + '</div>';
    if(moved){
      var staleF = cfg.tgt.fields.filter(function(f){ return srcNames.indexOf(f.n)<0 && f.pre!=null; });
      if(!clearFirst && staleF.length){
        h += '<div class="mm-verdict warn"><b>함정 재현!</b> 화살표가 이어진 같은 이름('
           + cfg.tgt.fields.filter(function(f){return srcNames.indexOf(f.n)>=0;}).map(function(f){return f.n;}).join('·')
           + ')만 건너왔고, 대상에만 있는 <b>'+esc(staleF[0].n)+'</b>에는 이전 값 <b>'+esc(staleF[0].pre)+'</b>가 '
           + '<b>그대로 남았다</b>. 새 건을 채울 거면 <code>CLEAR</code> 먼저.</div>';
      } else {
        h += '<div class="mm-verdict ok"><b>깨끗하게 이동!</b> <code>CLEAR</code>로 대상을 비운 뒤 옮겨서, '
           + '화살표가 이어진 필드만 채워지고 나머지는 <b>초기값</b>이다. 지난 건의 값이 섞일 틈이 없다.</div>';
      }
    } else {
      h += '<div class="mm-verdict"><b>화살표 = 같은 이름</b>(건너간다). 원본에만 있는 필드(주황)는 화살표가 없고, '
         + '대상에만 있는 필드(회색)는 건드리지 않는다. 실행해 보고 <code>CLEAR</code> 토글로 차이를 비교해 보자.</div>';
    }
    if(cfg.note) h += '<div class="note">'+cfg.note+'</div>';   // note는 신뢰된 HTML(레슨 작성자)
    root.innerHTML = h;
    drawArrows();
  }

  // 같은 이름 필드끼리 화살표(SAP 표준 이미지 구도) — 실행 전 점선/실행 후 실선
  function drawArrows(){
    var flow = root.querySelector('.mm-flow'), svg = root.querySelector('.mm-svg');
    if(!flow || !svg) return;
    var fr = flow.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 '+fr.width+' '+fr.height);
    var defs = '<defs><marker id="mmah" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">'
             + '<path d="M0,0 L7,3 L0,6 Z" class="mm-ah'+(moved?' on':'')+'"/></marker></defs>';
    var lines = '';
    srcNames.forEach(function(nm){
      if(tgtNames.indexOf(nm) < 0) return;
      var sc = root.querySelector('.mm-cellwrap[data-side="src"][data-f="'+nm+'"] .mm-cell');
      var tc = root.querySelector('.mm-cellwrap[data-side="tgt"][data-f="'+nm+'"] .mm-cell');
      if(!sc || !tc) return;
      var sr = sc.getBoundingClientRect(), tr = tc.getBoundingClientRect();
      var x1 = sr.left - fr.left + sr.width/2, y1 = sr.bottom - fr.top;
      var x2 = tr.left - fr.left + tr.width/2, y2 = tr.top - fr.top - 2;
      lines += '<line class="mm-line'+(moved?' on':'')+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" marker-end="url(#mmah)"/>';
    });
    svg.innerHTML = defs + lines;
  }
  window.addEventListener('resize', drawArrows);

  root.addEventListener('click', function(e){
    if(e.target.closest('[data-clear]')){ clearFirst = !clearFirst; moved = false; render(); return; }
    if(e.target.closest('[data-run]')){ moved = !moved; render(); }
  });
  render();
})();
