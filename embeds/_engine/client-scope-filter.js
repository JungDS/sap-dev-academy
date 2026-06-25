// ===== client-scope-filter 엔진 JS — Open SQL client(MANDT) 자동 종속 체험 (CH08-L01) =====
// 현재 로그인 client를 바꿔 가며 같은 SELECT(WHERE carrid=...)를 실행하면, MANDT를 안 써도
// 현재 client 행만 결과로 넘어옴을 보여 준다. 데이터는 window.CSF_CFG로 주입.
//   CSF_CFG = { table, itab, carrid, current, cols[], clients:[{id,rows:[{...}]}] }
(function(){
  var cfg = window.CSF_CFG || {};
  var TBL = cfg.table || 'sflight', ITAB = cfg.itab || 'gt_flight';
  var CARR = cfg.carrid || 'KE';
  var COLS = cfg.cols || ['carrid','connid','fldate'];
  var CLIENTS = cfg.clients || [];
  var cur = cfg.current || (CLIENTS[0] && CLIENTS[0].id) || '100';
  var ran = false;
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  /* 코드 박스(고정 — WHERE엔 carrid만, MANDT 없음) */
  function renderCode(){
    var html='<span class="tok-kw">SELECT</span> * <span class="tok-kw">FROM</span> '+TBL+'\n'
      +'  <span class="tok-kw">INTO</span> <span class="tok-kw">TABLE</span> '+ITAB+'\n'
      +'  <span class="tok-kw">WHERE</span> carrid = <span class="tok-str">\''+CARR+'\'</span>.'
      +'   <span class="tok-com">" MANDT는 안 적는다 — 시스템이 자동</span>';
    $('code').innerHTML=html;
  }

  /* client 칸막이 렌더 */
  function renderClients(highlight){
    $('clients').innerHTML = CLIENTS.map(function(c){
      var active = c.id===cur;
      var rows = c.rows.map(function(r){
        var hit = active && highlight && r.carrid===CARR;
        return '<div class="frow'+(hit?' hit':'')+'">'
          +'<span class="car">'+esc(r.carrid)+'</span><span>'+esc(r.connid)+'</span>'
          +'<span>'+esc(r.fldate)+'</span><span>'+(hit?'✓':'')+'</span></div>';
      }).join('');
      return '<div class="cl'+(active?' active':'')+'" data-c="'+c.id+'">'
        +'<div class="cl__hd">client '+c.id+(active?' <span class="badge">현재 로그인</span>':'')+'</div>'
        +rows+'</div>';
    }).join('');
  }

  /* 결과 테이블 */
  function renderResult(){
    if(!ran){
      $('resTbl').innerHTML='<tbody><tr><td class="empty">▶ SELECT 실행을 누르면 현재 client 결과가 채워집니다.</td></tr></tbody>';
      $('resCnt').textContent=''; setStatus(null); return;
    }
    var c=CLIENTS.filter(function(x){return x.id===cur;})[0]||{rows:[]};
    var hits=c.rows.filter(function(r){return r.carrid===CARR;});
    var head='<thead><tr>'+COLS.map(function(k){return '<th>'+k.toUpperCase()+'</th>';}).join('')+'</tr></thead>';
    if(hits.length===0){
      $('resTbl').innerHTML='<tbody><tr><td class="empty">조회 결과 없음 (0행)</td></tr></tbody>';
    } else {
      $('resTbl').innerHTML=head+'<tbody>'+hits.map(function(r){
        return '<tr>'+COLS.map(function(k){return '<td>'+esc(r[k])+'</td>';}).join('')+'</tr>';
      }).join('')+'</tbody>';
    }
    $('resCnt').textContent=hits.length+'행';
    setStatus(hits.length);
  }

  function setStatus(n){
    $('stYou').textContent="carrid = '"+CARR+"'";
    $('stSys').textContent='MANDT = '+cur+' (현재 client)';
    if(n===null){ $('stOut').textContent='—'; }
    else { $('stOut').innerHTML=n+'행 · sy-subrc = '+(n>0?'0':'4')+' · sy-dbcnt = '+n; }
  }

  function draw(){ renderCode(); renderClients(ran); renderResult(); postHeight(); }

  $('clientSeg').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    cur=b.dataset.c; ran=false;
    $('clientSeg').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});
    draw();
  });
  $('run').addEventListener('click',function(){ ran=true; draw(); });
  document.addEventListener('keydown',function(e){ if(e.key==='F8'){ e.preventDefault(); ran=true; draw(); } });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  draw();
})();
