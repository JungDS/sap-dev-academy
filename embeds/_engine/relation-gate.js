// ===== relation-gate 엔진 JS — Foreign Key / Check Table 관계 게이트 (CH09-L01) =====
// ZBOOKING-CONCERT_ID에 값을 넣어 Check Table ZCONCERT 통과/거부를 비교. F4로 고르면 항상 유효값.
// 데이터=window.RG_CFG = { checkTable, fkTable, fkField, keyField, rows:[{id,artist,venue}] }
(function(){
  var cfg = window.RG_CFG || {};
  var CHK = cfg.checkTable || 'ZCONCERT';
  var FKT = cfg.fkTable || 'ZBOOKING';
  var FKF = cfg.fkField || 'CONCERT_ID';
  var ROWS = cfg.rows || [];
  var IDS = ROWS.map(function(r){return r.id;});
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var input=null;   // 현재 입력값

  function renderCheck(){
    $('chkBody').innerHTML = ROWS.map(function(r){
      var m = input!=null && r.id===input;
      return '<div class="crow'+(m?' match':'')+'"><span class="id">'+esc(r.id)+'</span><span>'+esc(r.artist)+' · '+esc(r.venue)+'</span></div>';
    }).join('');
  }
  function renderInput(){
    var box=$('inbox');
    if(input==null){ box.className='inbox empty'; box.textContent='(값 없음)'; }
    else {
      var ok=IDS.indexOf(input)>=0;
      box.className='inbox '+(ok?'ok':'no'); box.textContent=input;
    }
  }
  function renderResult(){
    var v=$('verdict'), e=$('vexp'), c=$('conn');
    if(input==null){ v.className='verdict idle'; v.textContent='입력 대기'; e.textContent=''; c.className='conn'; c.querySelector('.lbl').textContent='참조'; return; }
    var ok=IDS.indexOf(input)>=0;
    if(ok){ v.className='verdict ok'; v.textContent='✓ 통과'; e.innerHTML='<code>'+input+'</code>는 Check Table <code>'+CHK+'</code>에 존재합니다.'; c.className='conn'; c.querySelector('.lbl').textContent='참조 OK'; }
    else { v.className='verdict no'; v.textContent='✕ 거부'; e.innerHTML='<code>'+input+'</code>는 <code>'+CHK+'</code>에 없습니다 — 고아 데이터가 됩니다.'; c.className='conn broken'; c.querySelector('.lbl').textContent='끊김'; }
  }
  function draw(){ renderCheck(); renderInput(); renderResult(); postHeight(); }

  function set(v){ input=v; $('f4pop').style.display='none'; draw(); }

  $('btnGood').addEventListener('click',function(){ set(IDS[0]); });
  $('btnBad').addEventListener('click',function(){ set('C999'); });
  $('btnF4').addEventListener('click',function(){
    var p=$('f4pop');
    if(p.style.display==='block'){ p.style.display='none'; postHeight(); return; }
    p.innerHTML='<div class="f4pop__hd">🔍 '+CHK+' — 공연 선택 (F4)<span class="x" id="f4x">✕</span></div>'
      + ROWS.map(function(r){ return '<div class="f4row" data-id="'+r.id+'"><span class="id">'+esc(r.id)+'</span><span>'+esc(r.artist)+'</span><span>'+esc(r.venue)+'</span></div>'; }).join('');
    p.style.display='block';
    p.querySelector('#f4x').addEventListener('click',function(){ p.style.display='none'; postHeight(); });
    p.querySelectorAll('.f4row').forEach(function(row){ row.addEventListener('click',function(){ set(row.dataset.id); }); });
    postHeight();
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  // 레이블 채움
  $('fkLbl').textContent = FKT+'-'+FKF;
  $('chkHd').textContent = 'Check Table · '+CHK;
  draw();
})();
