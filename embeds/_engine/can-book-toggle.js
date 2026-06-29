// ===== can-book-toggle 엔진 JS — 예매 가능 판정(can_book) (CH10-L07, S02) =====
// 잔여석 = 정원 − 비취소 예매 합계, can_book = 요청 ≤ 잔여. 취소 포함 토글 시 잘못된 계산을 보여 준다.
// 데이터=window.CBT_CFG = { capacity, bookings:[{name,seats,status}] }  (status 'C'=취소)
(function(){
  var cfg = window.CBT_CFG || {};
  var CAP = cfg.capacity || 10;
  var BK = cfg.bookings || [];
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var want=3, includeCancelled=false;

  function sum(){ return BK.reduce(function(a,b){ return a + ((includeCancelled || b.status!=='C') ? b.seats : 0); }, 0); }

  function render(){
    $('bk').innerHTML = '<div class="bookings__hd">예매 (ZBOOKING) <span class="cap">정원 '+CAP+'</span></div>'
      + BK.map(function(b){
        var cancelled=b.status==='C';
        var counted = includeCancelled || !cancelled;
        return '<div class="brow '+(cancelled?'cancelled'+(includeCancelled?' included':''):'counted')+'">'
          +'<span>'+esc(b.name)+'</span><span class="seat">'+b.seats+'석</span>'
          +'<span class="st '+(cancelled?'c':'o')+'">'+(cancelled?'취소(C)':'예매(O)')+'</span></div>';
      }).join('');
    var s=sum(), left=CAP-s;
    $('calc').innerHTML =
      '<div class="calcline"><span>예매 합계 '+(includeCancelled?'(취소 포함!)':'(취소 제외)')+'</span><b>'+s+'</b></div>'
     +'<div class="calcline"><span>정원 − 합계</span><b>'+CAP+' − '+s+'</b></div>'
     +'<div class="calcline big"><span>잔여석 cv_left</span><b>'+left+'</b></div>';
    var ok = want<=left;
    $('verdict').className='verdict '+(ok?'ok':'no');
    $('verdict').innerHTML=(ok?'✓ 예매 가능':'✕ 예매 불가')
      +'<div class="sub">can_book = boolc( '+want+' &lt;= '+left+' ) = '+(ok?'abap_true':'abap_false')+'</div>';
    $('warn').className='warnbox'+(includeCancelled?' show':'');
    $('warn').innerHTML='⚠ 취소 건을 합산하면 잔여석이 <b>실제보다 작게</b> 계산됩니다. <code>status &lt;&gt; \'C\'</code> 조건은 단순 조건이 아니라 <b>업무 규칙</b>입니다.';
    postHeight();
  }

  $('reqSeg').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; want=+b.dataset.w;
    $('reqSeg').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);}); render(); });
  $('incChk').addEventListener('change',function(e){ includeCancelled=e.target.checked; render(); });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
