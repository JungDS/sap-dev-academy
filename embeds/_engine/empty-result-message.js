// ===== empty-result-message 엔진 JS — 조회 실패와 MESSAGE 피드백 (CH08-L07) =====
// dan을 골라 조회 → 결과/빈 결과를 sy-subrc·sy-dbcnt로 판정하고, 피드백 방식(WRITE / MESSAGE S / I)을
// SAP GUI 모형으로 비교한다. 데이터=window.ERM_CFG.
//   ERM_CFG = { present:[2,3], rows:{2:[{mul,result}...]}, table:'zgugudan', itab:'gt_gugu' }
(function(){
  var cfg = window.ERM_CFG || {};
  var PRESENT = cfg.present || [2,3];
  var ROWS = cfg.rows || {};
  var TBL = cfg.table || 'zgugudan', ITAB = cfg.itab || 'gt_gugu';
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var dan=2, fb='write';

  function genCode(){
    var msgLine =
      fb==='write' ? "  WRITE: / '"+dan+"단 데이터가 없습니다.'."
    : fb==='msgS'  ? "  MESSAGE '해당 단의 데이터가 없습니다.' TYPE 'S'.   <span class=\"tok-com\">\" 상태바</span>"
    :                "  MESSAGE '해당 단의 데이터가 없습니다.' TYPE 'I'.   <span class=\"tok-com\">\" 정보 팝업</span>";
    var html=
      '<span class="tok-kw">SELECT</span> * <span class="tok-kw">FROM</span> '+TBL+' <span class="tok-kw">INTO TABLE</span> '+ITAB+' <span class="tok-kw">WHERE</span> dan = <span class="tok-num">'+dan+'</span>.\n\n'
      +'<span class="tok-kw">IF</span> sy-subrc <span class="tok-kw">&lt;&gt;</span> <span class="tok-num">0</span>.\n'
      + msgLine + '\n'
      +'<span class="tok-kw">ELSE</span>.\n'
      +'  <span class="tok-kw">LOOP AT</span> '+ITAB+' <span class="tok-kw">INTO</span> gs_line.\n'
      +'    <span class="tok-kw">WRITE</span>: / gs_line-dan, <span class="tok-str">\'x\'</span>, gs_line-mul, <span class="tok-str">\'=\'</span>, gs_line-result.\n'
      +'  <span class="tok-kw">ENDLOOP</span>.\n'
      +'<span class="tok-kw">ENDIF</span>.';
    $('code').innerHTML=html;
  }

  function run(){
    var has = PRESENT.indexOf(dan)>=0;
    var rows = has ? (ROWS[dan]||[]) : [];
    var n = rows.length;
    // subrc 카드
    $('subrc').innerHTML = n>0 ? '<span class="v ok">0</span>' : '<span class="v no">4</span>';
    $('subrc').className='v '+(n>0?'ok':'no');
    $('dbcnt').textContent = n;
    $('lines').textContent = n;

    // GUI 리스트 (WRITE 결과)
    var list=$('guiList');
    if(n>0){
      list.innerHTML = rows.map(function(r){ return '<div class="ln">'+dan+' x '+r.mul+' = '+r.result+'</div>'; }).join('');
    } else {
      // 실패: 피드백 방식에 따라
      if(fb==='write') list.innerHTML='<div class="ln empty">'+dan+'단 데이터가 없습니다. (WRITE 출력)</div>';
      else list.innerHTML='<div class="ln empty">(리스트 비어 있음)</div>';
    }

    // 상태바 (MESSAGE S)
    var status=$('guiStatus');
    if(n===0 && fb==='msgS'){ status.className='gui__status show'; status.innerHTML='<span class="ico">i</span>해당 단의 데이터가 없습니다. <small style="margin-left:6px;color:var(--ink-soft)">(MESSAGE … TYPE \'S\' · 상태바)</small>'; }
    else if(n>0){ status.className='gui__status show'; status.innerHTML='<span class="ico">✓</span>'+n+'건 조회됨'; }
    else { status.className='gui__status'; status.innerHTML='<span class="ico">·</span>준비'; }

    // 팝업 (MESSAGE I)
    if(n===0 && fb==='msgI'){ $('popup').style.display='flex'; $('popMsg').textContent='해당 단의 데이터가 없어 목록을 표시할 수 없습니다.'; }
    else { $('popup').style.display='none'; }

    postHeight();
  }

  function render(){ genCode(); run(); }

  $('danSeg').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return; dan=+b.dataset.d;
    $('danSeg').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});
    render();
  });
  $('fbSeg').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return; fb=b.dataset.f;
    $('fbSeg').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});
    render();
  });
  $('run').addEventListener('click', run);
  document.addEventListener('keydown',function(e){ if(e.key==='F8'){ e.preventDefault(); run(); } });
  $('popClose').addEventListener('click',function(){ $('popup').style.display='none'; postHeight(); });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
