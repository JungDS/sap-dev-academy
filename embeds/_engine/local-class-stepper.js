// ===== local-class-stepper 엔진 JS — Local Class 정적 메서드 (CH10-L04) =====
// DEFINITION(계약)·IMPLEMENTATION(본문)·=> 정적 호출을 색으로 구분하고, 호출 결과와 실험(PUBLIC/RETURNING 제거)을 보여 준다.
// (이 레슨 고유 — 코드 내장)
(function(){
  var $=function(id){return document.getElementById(id);};
  var SECTIONS={
    def:['<span class="tok-kw">CLASS</span> lcl_calc <span class="tok-kw">DEFINITION</span>.',
         '  <span class="tok-kw">PUBLIC SECTION</span>.',
         '    <span class="tok-kw">CLASS-METHODS</span> add_tax',
         '      <span class="tok-kw">IMPORTING</span> iv_amount        <span class="tok-kw">TYPE</span> p',
         '      <span class="tok-kw">RETURNING</span> <span class="tok-kw">VALUE</span>(rv_result) <span class="tok-kw">TYPE</span> p.',
         '<span class="tok-kw">ENDCLASS</span>.'],
    impl:['<span class="tok-kw">CLASS</span> lcl_calc <span class="tok-kw">IMPLEMENTATION</span>.',
          '  <span class="tok-kw">METHOD</span> add_tax.',
          "    rv_result = iv_amount * <span class=\"tok-str\">'1.1'</span>.",
          '  <span class="tok-kw">ENDMETHOD</span>.',
          '<span class="tok-kw">ENDCLASS</span>.'],
    call:['lv_result = lcl_calc=>add_tax( <span class="tok-num">1000</span> ).']
  };
  var hot=null, noPublic=false, noReturn=false;

  function render(){
    function block(key,label){
      return '<div class="sec '+key+(hot===key?' hot':'')+'"><div class="sec__lbl">'+label+'</div>'
        + SECTIONS[key].map(function(l){return '<div class="cline">'+l+'</div>';}).join('')+'</div>';
    }
    $('code').innerHTML = block('def','① DEFINITION — 공개 계약')
      + block('impl','② IMPLEMENTATION — 실제 본문')
      + block('call','③ 정적 호출 (=>)');
    $('contract').innerHTML = '<div class="kv"><span>공개 메서드</span><b>add_tax</b></div>'
      +'<div class="kv"><span>IMPORTING</span><b>iv_amount = 1000</b></div>'
      +'<div class="kv"><span>RETURNING</span><b>rv_result</b></div>';
    $('callfmt').textContent='lcl_calc=>add_tax( 1000 )';
    postHeight();
  }

  function run(){
    if(noPublic){ $('msg').className='msg err'; $('msg').innerHTML='컴파일 오류 — add_tax가 PUBLIC이 아니어서 <b>외부에서 호출할 수 없습니다</b>.'; postHeight(); return; }
    if(noReturn){ $('msg').className='msg err'; $('msg').innerHTML='RETURNING이 없어 <b>반환값을 받을 수 없습니다</b> — <code>lv_result =</code> 가 성립하지 않습니다.'; postHeight(); return; }
    $('msg').className='msg ok'; $('msg').innerHTML='정적 호출 성공 — <code>lcl_calc=>add_tax( 1000 )</code> → <b>rv_result = 1100</b> (객체 생성 없이 호출).';
    postHeight();
  }

  $('toolbar').addEventListener('click',function(e){
    var b=e.target.closest('.btn'); if(!b) return;
    var a=b.dataset.a;
    if(a==='def'||a==='impl'||a==='call'){ hot=(hot===a?null:a); $('msg').className='msg'; $('msg').textContent=''; render(); }
    else if(a==='run'){ run(); }
    else if(a==='nopub'){ noPublic=!noPublic; noReturn=false; b.classList.toggle('on',noPublic); refreshExp(); run(); }
    else if(a==='noret'){ noReturn=!noReturn; noPublic=false; b.classList.toggle('on',noReturn); refreshExp(); run(); }
  });
  function refreshExp(){ $('toolbar').querySelectorAll('.btn.exp').forEach(function(b){ b.classList.toggle('on',(b.dataset.a==='nopub'&&noPublic)||(b.dataset.a==='noret'&&noReturn)); }); }

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
