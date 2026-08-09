// ===== value-vs-fk 엔진 JS — Value Table(제안) vs Foreign Key(검증) (CH09-L02) =====
// 두 토글(Value Table / Foreign Key) 조합으로 C999가 통과처럼 보이는지/거부되는지 비교 + ALPHA 변환.
(function(){
  var $=function(id){return document.getElementById(id);};
  var vt=false, fk=false;

  function verdict(v,f){
    // 실제 검증은 Foreign Key가 있을 때만(Value Table만으론 check 발생 안 함)
    return f ? {ok:false, big:'C999 거부', sm:'Foreign Key가 실제 관계를 검증합니다.'}
             : {ok:true,  big:'C999 통과처럼 보임', sm:(v?'Value Table은 후보 제안일 뿐 — 검증을 강제하지 않습니다.':'아무 관계도 선언하지 않았습니다.')};
  }

  function render(){
    $('swVT').classList.toggle('on',vt);
    $('swFK').classList.toggle('on',fk);
    // 선언 목록
    $('decl').innerHTML =
      '<div class="li '+(vt?'on':'off')+'"><span class="dot"></span>Domain <code>ZCONCERT_ID</code> · Value Table = <code>ZCONCERT</code> '+(vt?'(설정됨)':'(없음)')+'</div>'
     +'<div class="li '+(fk?'on':'off')+'"><span class="dot"></span><code>ZBOOKING-CONCERT_ID</code> · Foreign Key '+(fk?'(설정됨)':'(없음)')+'</div>';
    var vd=verdict(vt,fk);
    $('verdict').className='verdict '+(vd.ok?'ok':'no');
    $('verdict').innerHTML='<div class="big">'+(vd.ok?'△ ':'✕ ')+vd.big+'</div><div class="sm">'+vd.sm+'</div>';
    // 매트릭스 현재행 강조
    var key=(vt?'1':'0')+(fk?'1':'0');
    document.querySelectorAll('.matrix tr[data-k]').forEach(function(tr){ tr.classList.toggle('cur', tr.dataset.k===key); });
    postHeight();
  }

  $('swVT').addEventListener('click',function(){ vt=!vt; render(); });
  $('swFK').addEventListener('click',function(){ fk=!fk; render(); });

  /* ALPHA 변환 — ALPHA=IN은 값이 '처음부터 끝까지 숫자'일 때만 앞자리를 0으로 채운다.
     글자가 섞이면 아무 일도 하지 않고 값을 그대로 둔다(공연 ID C001이 대상 밖인 이유). */
  var LEN=10;
  function alpha(){
    var raw=$('alphaIn').value.trim();
    var msg=$('alphaMsg');
    if(raw===''){
      $('alphaInternal').textContent='—'; $('alphaDisplay').textContent='—';
      msg.className='alpha__msg'; msg.textContent='값을 넣거나 아래 예시를 눌러 보세요.';
      return;
    }
    if(raw.length>LEN){
      $('alphaInternal').textContent='—'; $('alphaDisplay').textContent='—';
      msg.className='alpha__msg no';
      msg.innerHTML='<code>CHAR '+LEN+'</code> 칸보다 길어 이 필드에는 담기지 않습니다. '+LEN+'자리 이하로 넣어 보세요.';
      return;
    }
    if(/^[0-9]+$/.test(raw)){
      var internal = raw.padStart(LEN,'0');
      $('alphaInternal').textContent=internal;
      $('alphaDisplay').textContent=internal.replace(/^0+(?=.)/,'');
      msg.className='alpha__msg yes';
      msg.innerHTML='숫자로만 된 값이라 ALPHA가 앞자리를 0으로 채웁니다(<code>CHAR '+LEN+'</code> 기준). 화면에는 다시 0을 떼고 보여 줍니다.';
    } else {
      $('alphaInternal').textContent=raw;
      $('alphaDisplay').textContent=raw;
      msg.className='alpha__msg no';
      msg.innerHTML='글자가 섞여 있어 <b>ALPHA가 아무것도 하지 않습니다</b> — 값이 그대로 저장됩니다. 우리 공연 ID <code>C001</code>이 ALPHA 대상이 아닌 이유입니다.';
    }
  }
  $('alphaIn').addEventListener('input', function(){ alpha(); postHeight(); });
  $('alphaChips').addEventListener('click', function(e){
    var b=e.target.closest('.achip'); if(!b) return;
    $('alphaIn').value=b.dataset.v; alpha(); postHeight();
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render(); alpha();
})();
