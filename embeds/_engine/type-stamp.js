// ===== type-stamp 엔진 JS — TYPES(도면) → DATA(실물) 시각화 =====
// TYPES는 메모리 0바이트짜리 "도면", DATA가 그 도면으로 찍어낸 "실물".
// ① DECIMALS 토글 → 도면 한 줄 수정이 변수 전부에 동시 반영(핵심 메시지)
// ② 도면(ty_amount)에 값 대입 시도 → 오류 데모("타입은 값을 못 담는다")
// 설정 = window.TS_CFG { typeName, base, decOptions[], dec, vars:[{name,raw}], note? }
(function(){
  var cfg = window.TS_CFG; if(!cfg) return;
  var root = document.querySelector('[data-ts]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var dec = cfg.dec, err = false, changed = false;

  function render(){
    var h = '<div class="ts-stage">';
    // 도면(TYPES) 카드
    h += '<div class="ts-bp"><div class="ts-bp__tag">📐 도면 — 메모리 <b>0바이트</b></div>'
       + '<code class="ts-code">TYPES '+esc(cfg.typeName)+'\n  TYPE '+esc(cfg.base)+'\n  DECIMALS <b class="ts-dec">'+dec+'</b>.</code>'
       + '<div class="ts-seg">';
    (cfg.decOptions||[]).forEach(function(d){
      h += '<button type="button" class="ts-seg__b'+(d===dec?' on':'')+'" data-dec="'+d+'">DECIMALS '+d+'</button>';
    });
    h += '</div>'
       + '<button type="button" class="ts-try" data-try>'+esc(cfg.typeName)+' = \'100.00\'. 대입해 보기</button>'
       + '</div>';
    h += '<div class="ts-arrow">찍어내기<br>▶</div>';
    // 실물(DATA) 박스들
    h += '<div class="ts-vars">';
    (cfg.vars||[]).forEach(function(v){
      h += '<div class="ts-var'+(changed?' flash':'')+'"><div class="ts-var__decl"><code>DATA '+esc(v.name)+' TYPE '+esc(cfg.typeName)+'.</code></div>'
         + '<div class="ts-var__val">'+esc(v.raw.toFixed(dec))+'</div>'
         + '<div class="ts-var__tag">📦 실물 — 값 저장</div></div>';
    });
    h += '</div></div>';
    // 판정 — base 중립, 상태 명시 클래스(교훈3)
    if(err){
      h += '<div class="ts-verdict bad"><b>구문 오류!</b> <code>'+esc(cfg.typeName)+'</code>은 <b>타입(도면)</b>이지 변수가 아니다 — '
         + '도면에는 값을 담을 수 없다. 값은 <code>DATA</code>로 찍어낸 <b>실물 변수</b>에만.</div>';
    } else if(changed){
      h += '<div class="ts-verdict ok"><b>도면 한 줄</b>을 고쳤더니 변수 '+(cfg.vars||[]).length+'개의 소수 자리가 <b>한꺼번에</b> 바뀌었다 — '
         + '이게 <code>TYPES</code>로 이름을 붙이는 이유.</div>';
    } else {
      h += '<div class="ts-verdict">도면(왼쪽)의 <b>DECIMALS</b>를 바꿔 보자 — 실물 변수들이 어떻게 되나?</div>';
    }
    if(cfg.note) h += '<div class="note">'+cfg.note+'</div>';  // note는 신뢰된 HTML(레슨 작성자)
    root.innerHTML = h;
  }

  root.addEventListener('click', function(e){
    var seg = e.target.closest('[data-dec]');
    if(seg){ var d = +seg.getAttribute('data-dec'); if(d!==dec){ dec=d; err=false; changed=true; render(); } return; }
    if(e.target.closest('[data-try]')){ err = true; changed = false; render(); }
  });
  render();
})();
