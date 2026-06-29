// ===== write-vs-salv 엔진 JS — WRITE 리스트 vs SALV 표 비교 (CH11-L01) =====
// 같은 예매 데이터를 WRITE 텍스트/SALV 표로 보여 주고, 정렬·합계가 WRITE에선 불가/SALV에선 표준임을 비교.
// 데이터=window.WVS_CFG = { cols:[{key,label,num}], rows:[] }
(function(){
  var cfg = window.WVS_CFG || {};
  var COLS = cfg.cols || [];
  var ROWS = (cfg.rows||[]).slice();
  var SUMKEY = cfg.sumKey || (COLS.filter(function(c){return c.num;})[0]||{}).key;
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var mode='write', sortKey=null, sortDir=1, showSum=false;

  function pad(s,n){ s=String(s); while(s.length<n) s+=' '; return s.slice(0,n); }
  function renderWrite(){
    var head=COLS.map(function(c){return pad(c.label,c.num?7:9);}).join(' ');
    var lines=ROWS.map(function(r){ return COLS.map(function(c){return pad(r[c.key],c.num?7:9);}).join(' '); });
    $('view').className='view write';
    $('viewHd').textContent='WRITE 리스트 (텍스트 줄)';
    $('salvbar').style.display='none';
    $('body').innerHTML='<div class="writeout">'+esc(head)+'\n'+esc(lines.join('\n'))+'</div>';
  }
  function renderSalv(){
    $('view').className='view salv';
    $('viewHd').textContent='SALV 표 (CL_SALV_TABLE)';
    $('salvbar').style.display='flex';
    var rows=ROWS.slice();
    if(sortKey){ var c=COLS.filter(function(x){return x.key===sortKey;})[0];
      rows.sort(function(a,b){ var x=a[sortKey],y=b[sortKey]; if(c&&c.num){x=+x;y=+y;} return x<y?-1*sortDir:x>y?1*sortDir:0; }); }
    var head='<thead><tr>'+COLS.map(function(c){return '<th class="'+(c.key===sortKey?'sorted':'')+(c.num?' num':'')+'" data-k="'+c.key+'">'+esc(c.label)+(c.key===sortKey?(sortDir>0?' ▲':' ▼'):'')+'</th>';}).join('')+'</tr></thead>';
    var body=rows.map(function(r){ return '<tr class="'+(r.status==='C'?'cancel':'')+'">'+COLS.map(function(c){return '<td class="'+(c.num?'num':'')+'">'+esc(r[c.key])+'</td>';}).join('')+'</tr>'; }).join('');
    var foot='';
    if(showSum){ var total=ROWS.reduce(function(a,r){return a+(+r[SUMKEY]||0);},0);
      foot='<tfoot><tr>'+COLS.map(function(c){return '<td class="'+(c.num?'num':'')+'">'+(c.key===SUMKEY?('Σ '+total):'')+'</td>';}).join('')+'</tr></tfoot>'; }
    $('body').innerHTML='<table class="dt">'+head+'<tbody>'+body+'</tbody>'+foot+'</table>';
    $('body').querySelectorAll('th[data-k]').forEach(function(th){ th.addEventListener('click',function(){
      var k=th.dataset.k; if(sortKey===k) sortDir=-sortDir; else { sortKey=k; sortDir=1; } render(); }); });
  }
  function render(){ if(mode==='write') renderWrite(); else renderSalv(); postHeight(); }

  $('modeSeg').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; mode=b.dataset.m;
    $('modeSeg').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);}); render(); });
  $('btnSort').addEventListener('click',function(){
    if(mode!=='salv'){ fb('정렬은 WRITE 리스트에서는 직접 코딩해야 합니다 — SALV로 바꿔 보세요.'); return; }
    sortKey='seats'; sortDir=-1; render(); fb('SALV의 가치는 데이터 조회가 아니라 표시 후 조작입니다(좌석수 내림차순).');
  });
  $('btnSum').addEventListener('click',function(){
    if(mode!=='salv'){ fb('합계도 WRITE에선 직접 계산·출력해야 합니다 — SALV로 바꿔 보세요.'); return; }
    showSum=!showSum; render(); fb('개발자가 합계 라인을 직접 WRITE하지 않아도 표준 기능으로 확인합니다(Σ 17).');
  });
  function fb(t){ $('fb').textContent=t; postHeight(); }

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
