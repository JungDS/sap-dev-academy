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

  /* ALPHA 변환 */
  function alpha(){
    var raw=$('alphaIn').value.trim().replace(/[^0-9]/g,'');
    var internal = raw==='' ? '' : raw.padStart(10,'0');
    $('alphaInternal').textContent = internal||'—';
    $('alphaDisplay').textContent = raw===''?'—':String(Number(raw));
  }
  $('alphaIn').addEventListener('input', function(){ alpha(); postHeight(); });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render(); alpha();
})();
