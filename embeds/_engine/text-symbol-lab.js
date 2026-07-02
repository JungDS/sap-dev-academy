// ===== text-symbol-lab 엔진 JS — Text Symbol 언어·등록 상태 실험기 =====
// 레슨 핵심(TEXT-nnn vs '기본값'(nnn)의 미등록 fallback 차이)을 표가 아니라 체험으로.
// 공식 근거(abentext_symbols.htm): 미등록 시 TEXT-idf = "initial single-character text field"(빈칸),
//                                  'literal'(idf) = "the literal is used"(기본값 fallback).
// ① 등록 상태 토글(등록됨/미등록) ② 로그인 언어 토글(KO/EN) → 두 문법의 출력 나란히 비교.
// 설정 = window.TSL_CFG { id, pool:{KO,EN}, literal, note? }
(function(){
  var cfg = window.TSL_CFG; if(!cfg) return;
  var root = document.querySelector('[data-tsl]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var reg = true, lang = 'KO';

  function render(){
    var h = '';
    // 코드 패널 — 두 문법
    h += '<pre class="tsl-code">WRITE: / <span class="kw">TEXT</span>-'+esc(cfg.id)+'.\n'
       + 'WRITE: / \''+esc(cfg.literal)+'\'('+esc(cfg.id)+').</pre>';
    // 컨트롤
    h += '<div class="tsl-ctl">'
       + '<div class="tsl-seg"><span class="tsl-seg__lab">Text Elements</span>'
       + '<button type="button" class="tsl-seg__b'+(reg?' on':'')+'" data-reg="1">등록됨 ('+esc(cfg.id)+')</button>'
       + '<button type="button" class="tsl-seg__b'+(!reg?' on':'')+'" data-reg="0">미등록</button></div>'
       + '<div class="tsl-seg"><span class="tsl-seg__lab">로그인 언어</span>'
       + '<button type="button" class="tsl-seg__b'+(lang==='KO'?' on':'')+'" data-lang="KO">KO 한국어</button>'
       + '<button type="button" class="tsl-seg__b'+(lang==='EN'?' on':'')+'" data-lang="EN">EN English</button></div>'
       + '</div>';
    // Text Elements 테이블 mock
    if(reg){
      h += '<div class="tsl-pool"><div class="tsl-pool__hd">📋 Text Elements — Text Symbols</div>'
         + '<table class="tsl-tbl"><tr><th>ID</th><th>KO</th><th>EN</th></tr>'
         + '<tr><td>'+esc(cfg.id)+'</td>'
         + '<td class="'+(lang==='KO'?'cur':'')+'">'+esc(cfg.pool.KO)+'</td>'
         + '<td class="'+(lang==='EN'?'cur':'')+'">'+esc(cfg.pool.EN)+'</td></tr></table></div>';
    } else {
      h += '<div class="tsl-pool empty"><div class="tsl-pool__hd">📋 Text Elements — Text Symbols</div>'
         + '<div class="tsl-pool__none">'+esc(cfg.id)+' 없음 — 등록하지 않았다</div></div>';
    }
    // 출력 리스트 — 두 줄 비교
    var v1, v2, c1='', c2='';
    if(reg){ v1 = cfg.pool[lang]; v2 = cfg.pool[lang]; }
    else {
      v1 = ''; c1 = 'blank';                    // TEXT-nnn → 빈 값처럼(공식: initial text field)
      v2 = cfg.literal; c2 = 'fallback';        // 'literal'(nnn) → 기본값 fallback
    }
    h += '<div class="tsl-out"><div class="tsl-out__hd">리스트 — 실행 결과</div>'
       + '<div class="tsl-line"><code class="tsl-src">TEXT-'+esc(cfg.id)+'</code><span class="tsl-arrow">→</span>'
       + (c1==='blank' ? '<span class="tsl-val blank" title="빈 값처럼 출력">▯ (빈칸)</span>' : '<span class="tsl-val">'+esc(v1)+'</span>')+'</div>'
       + '<div class="tsl-line"><code class="tsl-src">\''+esc(cfg.literal)+'\'('+esc(cfg.id)+')</code><span class="tsl-arrow">→</span>'
       + '<span class="tsl-val'+(c2?' fb':'')+'">'+esc(v2)+(c2?' <small>(코드의 기본값)</small>':'')+'</span></div></div>';
    // 판정 — base 중립, 상태 명시(교훈3)
    if(reg){
      h += '<div class="tsl-verdict ok"><b>코드는 한 글자도 안 바꿨다</b> — 로그인 언어(' + lang + ')에 맞는 글자가 Text Elements에서 온다. 이게 다국어의 원리.</div>';
    } else {
      h += '<div class="tsl-verdict warn"><b>미등록일 때 둘이 갈린다</b> — <code>TEXT-'+esc(cfg.id)+'</code>는 <b>빈칸</b>이라 누락이 바로 들통나고(점검엔 안전), '
         + '<code>\''+esc(cfg.literal)+'\'('+esc(cfg.id)+')</code>는 그럴싸하게 보여서 <b>누락이 숨는다</b>(편하지만 주의).</div>';
    }
    if(cfg.note) h += '<div class="note">'+cfg.note+'</div>';   // note는 신뢰된 HTML(레슨 작성자)
    root.innerHTML = h;
  }

  root.addEventListener('click', function(e){
    var r = e.target.closest('[data-reg]');
    if(r){ reg = r.getAttribute('data-reg')==='1'; render(); return; }
    var l = e.target.closest('[data-lang]');
    if(l){ lang = l.getAttribute('data-lang'); render(); }
  });
  render();
})();
