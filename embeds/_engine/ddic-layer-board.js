// ===== ddic-layer-board 엔진 JS — Domain(기술) → Data Element(의미) 상속 보드 =====
// "개념의 모양"을 그린다: Domain 카드 1개가 Data Element N개에 기술 속성을 물려주는 계층.
// ① Domain 길이 토글 → 상속받는 DE 전부 + 화면 미리보기 동시 반영(한 곳 수정의 힘)
// ② DE 카드의 Field Label을 직접 고쳐 보기 → 그 칸의 화면 라벨만 바뀐다(의미는 각자 몫 = 기술과 따로 논다)
// ③ DATA … TYPE z도메인. 직접 사용 시도 → 오류 데모(Data Element를 거쳐야 함)
//    tryOk가 있으면 성공 선언(TYPE z데이터엘리먼트) 데모도 함께 → 실패/성공을 나란히 본다
// 설정 = window.DLB_CFG { domain:{name,type,len,altLen,desc}, elements:[{name,label,sample}],
//                        tryDirect:{code,msg}, tryOk?:{code,msg}, labelSlot?:'Medium', note? }
(function(){
  var cfg = window.DLB_CFG; if(!cfg) return;
  var root = document.querySelector('[data-dlb]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var alt = false, err = false, changed = false, okDecl = false, labeled = false;
  var slot = cfg.labelSlot || 'Medium';
  var labels = (cfg.elements||[]).map(function(el){ return el.label; });   // 학습자가 고칠 수 있는 '의미' 층

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
       + (cfg.tryOk ? '<button type="button" class="dlb-btn tryok" data-tryok>'+esc(cfg.tryOk.code)+' 시도</button>' : '')
       + '</div></div>';
    // 상속 케이블
    h += '<div class="dlb-cables"><span class="dlb-cable"></span><span class="dlb-cable"></span>'
       + '<div class="dlb-cables__lab">1 : N 상속 — 기술은 그대로 물려받고 의미만 다르게</div></div>';
    // Data Element 카드들 (의미 층)
    h += '<div class="dlb-els">';
    (cfg.elements||[]).forEach(function(el, i){
      h += '<div class="dlb-el"><div class="dlb-el__tag">🏷️ Data Element — 의미·라벨</div>'
         + '<div class="dlb-el__name">'+esc(el.name)+'</div>'
         + '<div class="dlb-el__labrow">Field Label <small>('+esc(slot)+')</small> — 직접 고쳐 보세요</div>'
         + '<input type="text" class="dlb-el__labin" data-lab="'+i+'" value="'+esc(labels[i])+'" maxlength="20" spellcheck="false" aria-label="'+esc(el.name)+' Field Label" />'
         + '<div class="dlb-el__spec'+(changed?' flash':'')+'">상속: '+esc(d.type)+' <b>'+len+'</b> <small>(from '+esc(d.name)+')</small></div>'
         + '</div>';
    });
    h += '</div>';
    // 화면 미리보기 — 라벨이 어디서 오는지
    h += '<div class="dlb-scr"><div class="dlb-scr__tag">🖥️ 화면에서는 이렇게</div>';
    (cfg.elements||[]).forEach(function(el, i){
      var boxes = '';
      for(var j=0;j<len;j++) boxes += '<span class="dlb-cell'+(changed?' flash':'')+'">'+(el.sample[j]||'')+'</span>';
      h += '<div class="dlb-scr__row"><span class="dlb-scr__label" data-scrlab="'+i+'">'+esc(labels[i] || '(빈 라벨)')+'</span>'+boxes+'</div>';
    });
    h += '</div></div>';
    // 판정 — base 중립, 상태 명시 클래스(교훈3)
    if(err){
      h += '<div class="dlb-verdict bad"><b>구문 오류!</b> Domain은 <b>변수 타입으로 직접 못 쓴다</b> — '+cfg.tryDirect.msg+'</div>';
    } else if(okDecl && cfg.tryOk){
      h += '<div class="dlb-verdict ok"><b>선언 성공!</b> '+cfg.tryOk.msg+'</div>';
    } else if(labeled){
      h += '<div class="dlb-verdict ok">'+labelVerdictHtml()+'</div>';
    } else if(changed){
      h += '<div class="dlb-verdict ok"><b>Domain 한 곳</b>(길이 '+len+')을 바꿨더니 Data Element '+(cfg.elements||[]).length+'개와 화면 입력칸이 <b>전부 동시에</b> 바뀌었다 — 기술을 Domain에 모아 두는 이유.</div>';
    } else {
      h += '<div class="dlb-verdict">Domain의 <b>길이 바꿔 보기</b>를 눌러 보자 — 상속받는 쪽이 어떻게 되나?</div>';
    }
    if(cfg.note) h += '<div class="note">'+cfg.note+'</div>';   // note는 신뢰된 HTML(레슨 작성자)
    root.innerHTML = h;
    bindLabels();
  }

  function curLen(){ return alt ? cfg.domain.altLen : cfg.domain.len; }
  function labelVerdictHtml(){
    return '<b>라벨만 바뀌었다.</b> 화면 이름표는 달라졌지만 상속받은 기술 속성('
         + esc(cfg.domain.type)+' '+curLen()+')은 그대로다 — <b>의미는 Data Element 각자의 몫</b>이라 옆 칸도 Domain도 건드리지 않는다.';
  }
  // 라벨 편집은 타이핑 중 포커스가 살아 있어야 한다 → 전체 재렌더 대신 관련 노드만 갱신
  function bindLabels(){
    root.querySelectorAll('[data-lab]').forEach(function(inp){
      inp.addEventListener('input', function(){
        var i = +inp.getAttribute('data-lab');
        labels[i] = inp.value;
        var scr = root.querySelector('[data-scrlab="'+i+'"]');
        if(scr) scr.textContent = labels[i] || '(빈 라벨)';
        labeled = true; err = false; okDecl = false; changed = false;
        var v = root.querySelector('.dlb-verdict');
        if(v){ v.className = 'dlb-verdict ok'; v.innerHTML = labelVerdictHtml(); }
      });
    });
  }

  root.addEventListener('click', function(e){
    if(e.target.closest('[data-alt]')){ alt = !alt; err = false; okDecl = false; labeled = false; changed = true; render(); return; }
    if(e.target.closest('[data-tryok]')){ okDecl = true; err = false; changed = false; labeled = false; render(); return; }
    if(e.target.closest('[data-try]')){ err = true; okDecl = false; changed = false; labeled = false; render(); }
  });
  render();
})();
