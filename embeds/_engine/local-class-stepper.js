// ===== local-class-stepper 엔진 JS — Local Class 정적 메서드 (CH10-L04) =====
// DEFINITION(계약)·IMPLEMENTATION(본문)·=> 정적 호출을 색으로 구분하고, 호출 결과와 실험(PUBLIC/RETURNING 제거)을 보여 준다.
// 실험은 메시지만 띄우지 않는다 — 코드·공개 계약·호출 형식을 실제로 다시 그린다(제거된 줄=취소선, 문제 줄=빨간 띠).
// 코드는 본문 CH10-L04 예제와 일치: RETURNING VALUE(rv_result) TYPE p LENGTH 8 DECIMALS 2 · gv_out = lcl_calc=>add_tax( gv_amount ).
// (이 레슨 고유 — 코드 내장)
(function(){
  var $=function(id){return document.getElementById(id);};
  var hot=null, noPublic=false, noReturn=false;

  var KW=function(s){return '<span class="tok-kw">'+s+'</span>';};
  var STR=function(s){return '<span class="tok-str">'+s+'</span>';};
  var NUM=function(s){return '<span class="tok-num">'+s+'</span>';};
  var COM=function(s){return '<span class="tok-com">'+s+'</span>';};
  var TAG=function(s){return '<span class="tag">'+s+'</span>';};

  // 상태(noPublic/noReturn)에 따라 매번 새로 만든다 — 실험이 코드에 반영되게.
  function sections(){
    var def=[{t:KW('CLASS')+' lcl_calc '+KW('DEFINITION')+'.'}];
    if(noPublic){
      def.push({t:'  '+KW('PUBLIC SECTION')+'.', cls:'gone', tag:' " ← 제거'});
      def.push({t:'  '+KW('PRIVATE SECTION')+'.', cls:'bad', tag:' " 그러면 여기 남는다'});
    } else {
      def.push({t:'  '+KW('PUBLIC SECTION')+'.'});
    }
    def.push({t:'    '+KW('CLASS-METHODS')+' add_tax'});
    def.push({t:'      '+KW('IMPORTING')+' iv_amount        '+KW('TYPE')+' p'+(noReturn?'.':'')});
    if(noReturn){
      def.push({t:'      '+KW('RETURNING')+' '+KW('VALUE')+'(rv_result) '+KW('TYPE')+' p '+KW('LENGTH')+' '+NUM('8')+' '+KW('DECIMALS')+' '+NUM('2')+'.', cls:'gone', tag:' " ← 제거'});
    } else {
      def.push({t:'      '+KW('RETURNING')+' '+KW('VALUE')+'(rv_result) '+KW('TYPE')+' p '+KW('LENGTH')+' '+NUM('8')+' '+KW('DECIMALS')+' '+NUM('2')+'.'});
    }
    def.push({t:KW('ENDCLASS')+'.'});

    var impl=[
      {t:KW('CLASS')+' lcl_calc '+KW('IMPLEMENTATION')+'.'},
      {t:'  '+KW('METHOD')+' add_tax.'},
      {t:"    rv_result = iv_amount * "+STR("'1.1'")+'.', cls:noReturn?'bad':'', tag:noReturn?' " rv_result가 없다':''},
      {t:'  '+KW('ENDMETHOD')+'.'},
      {t:KW('ENDCLASS')+'.'}
    ];

    var callBad = noPublic || noReturn;
    var call=[
      {t:KW('START-OF-SELECTION')+'.'},
      {t:'  '+KW('DATA')+': gv_amount '+KW('TYPE')+' p '+KW('LENGTH')+' '+NUM('8')+' '+KW('DECIMALS')+' '+NUM('2')+','},
      {t:'        gv_out    '+KW('TYPE')+' p '+KW('LENGTH')+' '+NUM('8')+' '+KW('DECIMALS')+' '+NUM('2')+'.'},
      {t:''},
      {t:'  gv_amount = '+NUM('1000')+'.'},
      {t:'  gv_out = lcl_calc=>add_tax( gv_amount ).'+(callBad?'':'   '+COM('" 객체 생성 불필요')),
       cls:callBad?'bad':'', tag:noPublic?' " ✕ PRIVATE이라 못 부른다':(noReturn?' " ✕ 돌려줄 값이 없다':'')},
      {t:'  '+KW('WRITE')+' gv_out.'}
    ];
    return {def:def, impl:impl, call:call};
  }

  function render(){
    var S=sections();
    function block(key,label){
      return '<div class="sec '+key+(hot===key?' hot':'')+'"><div class="sec__lbl">'+label+'</div>'
        + S[key].map(function(l){
            return '<div class="cline'+(l.cls?' '+l.cls:'')+'">'+l.t+(l.tag?TAG(l.tag):'')+'</div>';
          }).join('')+'</div>';
    }
    $('code').innerHTML = block('def','① DEFINITION — 공개 계약')
      + block('impl','② IMPLEMENTATION — 실제 본문')
      + block('call','③ 정적 호출 (=>)');

    $('contract').innerHTML = '<div class="kv"><span>공개 메서드</span><b>'+(noPublic?'(없음 — PRIVATE)':'add_tax')+'</b></div>'
      +'<div class="kv"><span>IMPORTING</span><b>iv_amount = gv_amount</b></div>'
      +'<div class="kv"><span>RETURNING</span><b>'+(noReturn?'(없음)':'rv_result')+'</b></div>';

    $('callfmt').textContent = noPublic ? 'lcl_calc=>add_tax( gv_amount )  ✕ 호출 불가'
      : (noReturn ? 'lcl_calc=>add_tax( gv_amount )  ✕ 대입 불가'
                  : 'gv_out = lcl_calc=>add_tax( gv_amount )');
    postHeight();
  }

  function run(){
    if(noPublic){ $('msg').className='msg err'; $('msg').innerHTML='컴파일 오류 — <code>add_tax</code>가 <b>PUBLIC SECTION에 없어</b> 클래스 밖에서 호출할 수 없습니다(③의 빨간 줄).'; postHeight(); return; }
    if(noReturn){ $('msg').className='msg err'; $('msg').innerHTML='컴파일 오류 — <code>RETURNING</code>이 없어 <b>돌려줄 값 자체가 없습니다</b>. <code>gv_out =</code> 대입도, 본문의 <code>rv_result</code>도 성립하지 않습니다.'; postHeight(); return; }
    $('msg').className='msg ok'; $('msg').innerHTML='정적 호출 성공 — <code>gv_out = lcl_calc=>add_tax( gv_amount )</code> → <b>gv_out = 1100.00</b> (객체 생성 없이 호출).';
    postHeight();
  }

  $('toolbar').addEventListener('click',function(e){
    var b=e.target.closest('.btn'); if(!b) return;
    var a=b.dataset.a;
    if(a==='def'||a==='impl'||a==='call'){ hot=(hot===a?null:a); $('msg').className='msg'; $('msg').textContent=''; render(); }
    else if(a==='run'){ run(); }
    else if(a==='nopub'){ noPublic=!noPublic; noReturn=false; refreshExp(); render(); run(); }
    else if(a==='noret'){ noReturn=!noReturn; noPublic=false; refreshExp(); render(); run(); }
  });
  function refreshExp(){ $('toolbar').querySelectorAll('.btn.exp').forEach(function(b){ b.classList.toggle('on',(b.dataset.a==='nopub'&&noPublic)||(b.dataset.a==='noret'&&noReturn)); }); }

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
