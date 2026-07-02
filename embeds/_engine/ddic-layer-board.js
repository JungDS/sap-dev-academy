// ===== ddic-layer-board 엔진 JS — Domain(기술) → Data Element(의미) 상속 보드 =====
// "개념의 모양"을 그린다: Domain 카드 1개가 Data Element N개에 기술 속성을 물려주는 계층.
// ① Domain 길이 토글 → 상속받는 DE 전부 + 화면 미리보기 동시 반영(한 곳 수정의 힘)
// ② DATA … TYPE z도메인. 직접 사용 시도 → 오류 데모(Data Element를 거쳐야 함)
// 설정 = window.DLB_CFG { domain:{name,type,len,altLen,desc}, elements:[{name,label,sample}], tryDirect:{code,msg}, note? }
(function(){
  var cfg = window.DLB_CFG; if(!cfg) return;
  var root = document.querySelector('[data-dlb]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var alt = false, err = false, changed = false;

  function render(){
    var d = cfg.domain, len = alt ? d.altLen : d.len;
    var h = '<div class="dlb-stage">';
    // Domain 카드 (기술 층)
    h += '<div class="dlb-dom"><div class="dlb-dom__tag">🔧 Domain — 기술 속성만</div>'
       + '<div class="dlb-dom__name">'+esc(d.name)+'</div>'
       + '<div class="dlb-dom__spec'+(changed?' flash':'')+'">'+esc(d.type)+' <b>'+len+'</b></div>'
       + '<div class="dlb-dom__desc">'+esc(d.desc)+'</div>'
       + '<div class="dlb-ctl">'
       + '<button type="button" class="dlb-btn'+(alt?' on':'')+'" data-alt>길이 '+d.len+' ↔ '+d.altLen+' 바꿔 보기</button>'
       + '<button type="button" class="dlb-btn try" data-try>'+esc(cfg.tryDirect.code)+' 시도</button>'
       + '</div></div>';
    // 상속 케이블
    h += '<div class="dlb-cables"><span class="dlb-cable"></span><span class="dlb-cable"></span>'
       + '<div class="dlb-cables__lab">1 : N 상속 — 기술은 그대로 물려받고 의미만 다르게</div></div>';
    // Data Element 카드들 (의미 층)
    h += '<div class="dlb-els">';
    (cfg.elements||[]).forEach(function(el){
      h += '<div class="dlb-el"><div class="dlb-el__tag">🏷️ Data Element — 의미·라벨</div>'
         + '<div class="dlb-el__name">'+esc(el.name)+'</div>'
         + '<div class="dlb-el__label">라벨: <b>'+esc(el.label)+'</b></div>'
         + '<div class="dlb-el__spec'+(changed?' flash':'')+'">상속: '+esc(d.type)+' <b>'+len+'</b> <small>(from '+esc(d.name)+')</small></div>'
         + '</div>';
    });
    h += '</div>';
    // 화면 미리보기 — 라벨이 어디서 오는지
    h += '<div class="dlb-scr"><div class="dlb-scr__tag">🖥️ 화면에서는 이렇게</div>';
    (cfg.elements||[]).forEach(function(el){
      var boxes = '';
      for(var i=0;i<len;i++) boxes += '<span class="dlb-cell'+(changed?' flash':'')+'">'+(el.sample[i]||'')+'</span>';
      h += '<div class="dlb-scr__row"><span class="dlb-scr__label">'+esc(el.label)+'</span>'+boxes+'</div>';
    });
    h += '</div></div>';
    // 판정 — base 중립, 상태 명시 클래스(교훈3)
    if(err){
      h += '<div class="dlb-verdict bad"><b>구문 오류!</b> Domain은 <b>변수 타입으로 직접 못 쓴다</b> — '+cfg.tryDirect.msg+'</div>';
    } else if(changed){
      h += '<div class="dlb-verdict ok"><b>Domain 한 곳</b>(길이 '+len+')을 바꿨더니 Data Element '+(cfg.elements||[]).length+'개와 화면 입력칸이 <b>전부 동시에</b> 바뀌었다 — 기술을 Domain에 모아 두는 이유.</div>';
    } else {
      h += '<div class="dlb-verdict">Domain의 <b>길이 바꿔 보기</b>를 눌러 보자 — 상속받는 쪽이 어떻게 되나?</div>';
    }
    if(cfg.note) h += '<div class="note">'+cfg.note+'</div>';   // note는 신뢰된 HTML(레슨 작성자)
    root.innerHTML = h;
  }

  root.addEventListener('click', function(e){
    if(e.target.closest('[data-alt]')){ alt = !alt; err = false; changed = true; render(); return; }
    if(e.target.closest('[data-try]')){ err = true; changed = false; render(); }
  });
  render();
})();
