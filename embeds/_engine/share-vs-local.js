// ===== share-vs-local 엔진 JS — "정의는 한 곳(DDIC 공유) vs 프로그램마다 정의(Local 독립)" 비교 보드 =====
// 좌=Local: 프로그램 카드마다 자기 정의(점선 박스) — 서로 남남. 우=DDIC: 정의 카드 1개 → 곡선으로 여러 프로그램에 연결(참조).
// 토글 "필드 추가": Local=프로그램마다 ⚠ 직접 수정 ↔ DDIC=정의 1곳 수정·✅ 자동 반영 — "한 곳만 고치면 전부 반영"을 체감.
// 설정 = window.SVL_CFG { defName, fields:[..], addField, programs:[..], useStmt, localFields?:[[..],..] }
//   localFields = 프로그램별 로컬 정의 구성(이름이 같아도 모양이 제각각 = 남남 강조, 피드백 2026-07-03). 없으면 fields 공용.
(function(){
  var cfg = window.SVL_CFG; if(!cfg) return;
  var root = document.querySelector('[data-svl]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var added = false;

  function fieldChips(list, newCls){
    var h = (list||[]).map(function(f){ return '<i class="svl-f">'+esc(f)+'</i>'; }).join('');
    if(added) h += '<i class="svl-f new '+newCls+'">'+esc(cfg.addField)+'</i>';
    return h;
  }

  function render(){
    var n = (cfg.programs||[]).length;
    var h = '<div class="svl">';
    // ── 좌: Local — 정의가 프로그램 안에(독립) ──
    h += '<div class="svl-col"><div class="svl-hd local">Local Structure — 프로그램 내부 선언</div><div class="svl-progs">';
    (cfg.programs||[]).forEach(function(p, i){
      var flds = (cfg.localFields && cfg.localFields[i]) || cfg.fields;
      h += '<div class="svl-prog"><div class="svl-prog__hd">'+esc(p)
         + (added ? '<span class="svl-badge bad">⚠ 직접 수정</span>' : '')+'</div>'
         + '<div class="svl-def"><small>DATA BEGIN OF gs_person</small>'
         + '<div class="svl-frow">'+fieldChips(flds, 'bad')+'</div></div></div>';
    });
    h += '</div><div class="svl-cap">'+(added
       ? '프로그램마다 따로 선언했으니 <b>'+n+'곳을 각각</b> 고쳐야 한다. 하나라도 빠뜨리면 모양이 서로 달라진다.'
       : '변수 이름(<code>gs_person</code>)이 같아도 <b>프로그램마다 따로 선언</b>한 것이라 <b>서로 독립</b>이다. 그래서 모양도 이렇게 제각각일 수 있다.')+'</div></div>';
    // ── 우: DDIC — 정의는 한 곳, 모두가 참조 ──
    h += '<div class="svl-col"><div class="svl-hd ddic">Global(DDIC) Structure — ABAP Dictionary에서 정의</div>'
       + '<div class="svl-defcard"><div class="svl-defcard__hd">SE11 · '+esc(cfg.defName)
       + (added ? '<span class="svl-badge ok">+ '+esc(cfg.addField)+' (여기만 수정)</span>' : '')+'</div>'
       + '<div class="svl-frow">'+fieldChips(cfg.fields, 'ok')+'</div></div>'
       + '<div class="svl-progs ddicside">';
    (cfg.programs||[]).forEach(function(p){
      h += '<div class="svl-prog slim" data-tgt><div class="svl-prog__hd">'+esc(p)
         + (added ? '<span class="svl-badge ok">✅ 자동 반영</span>' : '')+'</div>'
         + '<code class="svl-use">'+esc(cfg.useStmt)+'</code></div>';
    });
    h += '</div><svg class="svl-svg" aria-hidden="true"></svg>'
       + '<div class="svl-cap">'+(added
       ? '<b>정의한 곳 하나만</b> 고치면 참조하는 모든 프로그램에 <b>자동 반영</b>된다.'
       : 'ABAP Dictionary에 <b>정의한 하나</b>를 여러 프로그램이 <b>참조</b>한다(선 = 참조).')+'</div></div>';
    h += '</div>';
    h += '<div class="svl-actions"><button type="button" class="svl-btn'+(added?' on':'')+'" data-add>'
       + (added ? '↺ 원래대로' : '🧪 필드 '+esc(cfg.addField)+'를 추가해야 한다면?')+'</button>'
       + (added ? '<span class="svl-verdict">Local = 수정 <b class="x">'+n+'곳</b> · DDIC = 수정 <b class="o">1곳</b></span>' : '')
       + '</div>';
    root.innerHTML = h;
    drawCurves();
  }

  // 정의 카드 하단 → 각 프로그램 상단 곡선(화살촉 없는 베지어 + 끝점 도트 — struct-viz와 같은 시각 언어)
  function drawCurves(){
    var svg = root.querySelector('.svl-svg'); if(!svg) return;
    var col = svg.closest('.svl-col'); var cr = col.getBoundingClientRect();
    svg.setAttribute('viewBox','0 0 '+cr.width+' '+cr.height);
    var def = col.querySelector('.svl-defcard').getBoundingClientRect();
    var x1 = def.left-cr.left+def.width/2, y1 = def.bottom-cr.top;
    var inner = '';
    col.querySelectorAll('[data-tgt]').forEach(function(p){
      var r = p.getBoundingClientRect();
      var x2 = r.left-cr.left+r.width/2, y2 = r.top-cr.top-2;
      var k = Math.max(14,(y2-y1)*0.5);
      inner += '<path class="svl-line" d="M'+x1+','+y1+' C '+x1+','+(y1+k)+' '+x2+','+(y2-k)+' '+x2+','+y2+'"/>'
             + '<circle class="svl-dot" cx="'+x2+'" cy="'+y2+'" r="3"/>';
    });
    svg.innerHTML = inner;
  }
  window.addEventListener('resize', drawCurves);
  root.addEventListener('click', function(e){ if(e.target.closest('[data-add]')){ added=!added; render(); } });
  render();
})();
