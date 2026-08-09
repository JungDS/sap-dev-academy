// ===== validation-router 엔진 JS — 검증 책임(DDIC vs 프로그램) 분류 (CH09-L08) =====
// 상황 카드를 DDIC/프로그램으로 분류하면 정답·해설을 보여 준다 + (선택) sy-subrc 미니 체험.
//   VR_CFG = { cards:[{q, ans:'DDIC'|'PROG', why}], probe:{exists:[id..]} }
// probe: 레슨 코드(SELECT SINGLE … INTO gv_dummy → IF sy-subrc <> 0)를 그대로 실행.
//   결과가 비면 INTO 대상은 "그대로 남는다"(keyword doc abapinto_clause: result set is empty → data
//   objects remain unchanged) → gv_dummy를 상태로 들고 있어야 앞 조회 값 잔존을 보여 줄 수 있다.
(function(){
  var cfg = window.VR_CFG || {};
  var CARDS = cfg.cards || [];
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var answered={};   // idx -> chosen

  function render(){
    $('cards').innerHTML = CARDS.map(function(c,i){
      var chosen=answered[i];
      var done = chosen!=null;
      var correct = done && chosen===c.ans;
      function btn(val,label){
        var cls='cbtn'; if(chosen===val) cls+=' chosen';
        if(done){ if(val===c.ans) cls+=' right'; else if(chosen===val) cls+=' wrong'; }
        return '<button class="'+cls+'" data-i="'+i+'" data-c="'+val+'" '+(done?'disabled':'')+'>'+label+'</button>';
      }
      var fb = done
        ? '<div class="fb '+(correct?'ok':'no')+'">'+(correct?'✓ 정답':'✕ 정답은 '+(c.ans==='DDIC'?'DDIC':'프로그램'))+' — '+esc(c.why)+'</div>'
        : '';
      return '<div class="card'+(done?' done':'')+'"><div class="card__q">'+esc(c.q)+'</div>'
        +'<div class="choices">'+btn('DDIC','DDIC가 검증')+btn('PROG','프로그램이 검증')+'</div>'+fb+'</div>';
    }).join('');
    var ans=Object.keys(answered).length;
    var ok=CARDS.filter(function(c,i){return answered[i]===c.ans;}).length;
    $('score').textContent='정답 '+ok+' / '+CARDS.length+(ans<CARDS.length?'  (푼 문제 '+ans+')':'');
    postHeight();
  }

  $('cards').addEventListener('click',function(e){
    var b=e.target.closest('.cbtn'); if(!b||b.disabled) return;
    var i=+b.dataset.i; if(answered[i]!=null) return;
    answered[i]=b.dataset.c; render();
  });
  $('reset').addEventListener('click',function(){ answered={}; render(); });

  /* ---- sy-subrc 미니 체험(선택) ---- */
  var PROBE = cfg.probe;
  if(PROBE && $('probeBtns')){
    var EXISTS = PROBE.exists || [];
    var dummy='';           // gv_dummy — 초기값은 빈 문자열(CHAR 4의 초기값)
    var lastWhere=null, subrc=null, stale=false;

    function codeHtml(){
      var w = lastWhere==null ? 'gs_booking-concert_id' : "'"+esc(lastWhere)+"'";
      var hit = subrc===0;
      function line(s,on){ return '<span class="ln'+(on?' hit':'')+'">'+s+'</span>'; }
      return line('<span class="tok-kw">SELECT SINGLE</span> concert_id <span class="tok-kw">FROM</span> zconcert', subrc!=null)
        +'\n'+line('  <span class="tok-kw">INTO</span> gv_dummy <span class="tok-kw">WHERE</span> concert_id = '+w+'.', subrc!=null)
        +'\n'+line('<span class="tok-kw">IF</span> sy-subrc &lt;&gt; 0.', subrc!=null)
        +'\n'+line('  <span class="tok-com">" 잘못된 공연 ID — 업무 처리(메시지/중단)</span>', subrc!=null && !hit)
        +'\n'+line('<span class="tok-kw">ENDIF</span>.', subrc!=null);
    }
    function renderProbe(){
      $('probeCode').innerHTML = codeHtml();
      $('probeVars').innerHTML =
        '<span class="v"><span class="vn">sy-subrc</span><b class="'+(subrc===0?'ok':(subrc==null?'':'no'))+'">'+(subrc==null?'—':subrc)+'</b></span>'
       +'<span class="v"><span class="vn">gv_dummy</span><b class="'+(stale?'warn':'')+'">'+(dummy===''?"' '":"'"+esc(dummy)+"'")+'</b>'+(stale?'<em>앞 조회 값 잔존</em>':'')+'</span>';
      var o=$('probeOut');
      if(subrc==null){ o.className='probe__out idle'; o.textContent='버튼을 눌러 실행해 보세요.'; }
      else if(subrc===0){ o.className='probe__out ok'; o.innerHTML='조회 성공 → <code>sy-subrc = 0</code>. <code>IF sy-subrc &lt;&gt; 0</code>이 거짓이라 업무 처리를 건너뛰고 <b>저장으로 넘어갑니다</b>.'; }
      else { o.className='probe__out no'; o.innerHTML='마스터에 없는 값 → <code>sy-subrc = 4</code>. <code>IF</code> 안으로 들어가 <b>잘못된 공연 ID로 처리</b>합니다.'
          + (stale ? ' 이때 <code>gv_dummy</code>는 <b>비워지지 않고 앞 조회 값이 그대로 남습니다</b> — 그래서 판정은 값이 아니라 <code>sy-subrc</code>로 합니다.' : ''); }
      postHeight();
    }
    $('probeBtns').addEventListener('click',function(e){
      var b=e.target.closest('.pbtn'); if(!b) return;
      var v=b.dataset.v;
      if(v==='__reset'){ dummy=''; lastWhere=null; subrc=null; stale=false; renderProbe(); return; }
      lastWhere=v;
      if(EXISTS.indexOf(v)>=0){ dummy=v; subrc=0; stale=false; }
      else { subrc=4; stale=(dummy!==''); }   // 결과 없음 → gv_dummy는 손대지 않는다
      renderProbe();
    });
    renderProbe();
  }

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
