// ===== syntax-toggle-lab 엔진 JS — 문법 상태 실험기(REPORT·마침표·주석 위치) =====
// 코드를 "실행"하는 게 아니라 일부러 깨뜨려 보고 구문 검사 램프의 반응을 읽는다.
// 토글: 마침표 제거 / 별표(*) 한 칸 밀기 / 키워드 소문자 / 인라인 주석을 *로.
// 설정 = window.STL_CFG { toggles:[{id,label,bad,msg}], note? }
(function(){
  var cfg = window.STL_CFG; if(!cfg) return;
  var root = document.querySelector('[data-stl]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var st = {}; (cfg.toggles||[]).forEach(function(t){ st[t.id]=false; });

  function codeHtml(){
    // 1행: 전체 줄 주석 — star 토글이면 첫 칸에 공백이 끼어들어 주석이 깨진다
    var l1 = st.star
      ? '<span class="stl-sp" title="첫 칸에 공백!">␣</span><span class="stl-err">* 작성자: 정훈영</span>'
      : '<span class="stl-cmt">* 작성자: 정훈영</span>';
    // 2행: REPORT 문 — period 토글이면 마침표가 사라진다 · lower면 소문자
    var kw = st.lower ? 'report' : 'REPORT';
    var period = st.period ? '<span class="stl-miss" title="마침표가 없다!">▁</span>' : '.';
    var tail = st.midstar
      ? ' <span class="stl-err">* 첫 리포트</span>'
      : ' <span class="stl-cmt">" 첫 리포트</span>';
    var l2 = '<span class="stl-kw">'+kw+'</span> zhello'+period+tail;
    return '<pre class="stl-code"><span class="stl-ln">1</span>'+l1+'\n<span class="stl-ln">2</span>'+l2+'</pre>';
  }

  function render(){
    var h = codeHtml();
    h += '<div class="stl-togs">';
    (cfg.toggles||[]).forEach(function(t){
      h += '<button type="button" class="stl-tog'+(st[t.id]?' on':'')+'" data-tog="'+t.id+'">'
         + (st[t.id]?'☑':'☐')+' '+esc(t.label)+'</button>';
    });
    h += '</div>';
    // 구문 검사 램프 — 켜진 bad 토글이 하나라도 있으면 빨강
    var errs = (cfg.toggles||[]).filter(function(t){ return st[t.id] && t.bad; });
    var infos = (cfg.toggles||[]).filter(function(t){ return st[t.id] && !t.bad; });
    if(errs.length){
      h += '<div class="stl-lamp bad"><span class="stl-dot"></span><b>구문 오류 '+errs.length+'건</b> — 저장은 되어도 활성화가 거부된다</div><ul class="stl-msgs">';
      errs.forEach(function(t){ h += '<li class="bad-li">'+t.msg+'</li>'; });
      infos.forEach(function(t){ h += '<li>'+t.msg+'</li>'; });
      h += '</ul>';
    } else {
      h += '<div class="stl-lamp ok"><span class="stl-dot"></span><b>문법 정상</b> — 저장·활성화 가능</div>';
      if(infos.length){ h += '<ul class="stl-msgs">'; infos.forEach(function(t){ h += '<li>'+t.msg+'</li>'; }); h += '</ul>'; }
    }
    if(cfg.note) h += '<div class="note">'+cfg.note+'</div>';  // note는 신뢰된 HTML(레슨 작성자)
    root.innerHTML = h;
  }

  root.addEventListener('click', function(e){
    var b = e.target.closest('[data-tog]'); if(!b) return;
    var id = b.getAttribute('data-tog'); st[id] = !st[id]; render();
  });
  render();
})();
