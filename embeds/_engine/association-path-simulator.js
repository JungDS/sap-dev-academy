// ===== association-path-simulator 엔진 JS — CDS Association 경로 시뮬레이터 (CH22-L03) =====
// 공연 선택→_Perf 경로로 회차 따라가기. 토글: 노출(off→소비자 경로 못 봄)·concert_id 유지(제거→ON source 사라짐)
// ·cardinality([1..1]인데 회차 여러개→불일치)·JOIN 보기(CH13 INNER JOIN 비교). 데이터=window.APS_CFG.
// 메시지 우선순위: concert_id 제거(bad) > 노출 off(warn) > cardinality 불일치(warn) > 정상(ok).
(function(){
  var $=function(id){return document.getElementById(id);};
  var cfg=window.APS_CFG||{};
  var CONCERTS=cfg.concerts||[];
  var PERFS=cfg.perfs||[];
  var st={ sel:(CONCERTS[0]||{}).id, expose:true, keepId:true, card:'0..*', joinView:false };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function concert(){ return CONCERTS.filter(function(c){return c.id===st.sel;})[0]||{}; }
  function perfsOf(id){ return PERFS.filter(function(p){return p.concert===id;}); }

  function renderSeg(){
    $('apsSel').innerHTML=CONCERTS.map(function(c){
      return '<button class="aps-seg'+(c.id===st.sel?' on':'')+'" data-c="'+c.id+'">'+esc(c.id)+'</button>';
    }).join('');
  }
  function renderToggles(){
    $('apsExpose').className='aps-toggle '+(st.expose?'act':'warnstate');
    $('apsExpose').textContent=(st.expose?'_Perf 노출 ✓':'_Perf 내부만');
    $('apsKeepId').className='aps-toggle '+(st.keepId?'act':'warnstate');
    $('apsKeepId').textContent=(st.keepId?'concert_id 포함':'concert_id 제거');
    $('apsCard').className='aps-toggle act';
    $('apsCard').textContent='cardinality ['+st.card+']';
    $('apsJoin').className='aps-toggle '+(st.joinView?'act':'');
    $('apsJoin').textContent=(st.joinView?'경로(association)로 보기':'JOIN으로 보기');
  }

  function srcPanel(){
    var c=concert();
    return '<table class="dt"><thead><tr><th>concert_id</th><th>artist</th><th>venue</th></tr></thead><tbody>'+
      '<tr><td class="'+(st.keepId?'hl':'')+'">'+esc(c.id)+'</td><td>'+esc(c.artist)+'</td><td>'+esc(c.venue)+'</td></tr>'+
      '</tbody></table>';
  }
  function tgtPanel(){
    if(!st.keepId) return '<div class="aps-blocked">ON 조건의 source <b>concert_id</b>가 select list에 없습니다.<br>경로를 따라갈 수 없습니다(활성화/사용 제한).</div>';
    if(!st.expose) return '<div class="aps-blocked warn">관계는 <b>내부 선언만</b> 되었습니다.<br>select list에 <b>_Perf</b>를 노출하지 않아 소비자는 경로를 볼 수 없습니다.</div>';
    var rows=perfsOf(st.sel);
    if(!rows.length) return '<div class="aps-blocked warn">이 공연에는 회차가 없습니다 ([0..*]라 0건도 정상).</div>';
    var body=rows.map(function(p){
      return '<tr><td>'+esc(p.concert)+'</td><td>'+esc(p.perf)+'</td><td>'+esc(p.date)+'</td></tr>';
    }).join('');
    return '<table class="dt"><thead><tr><th>concert_id</th><th>perf_no</th><th>perf_date</th></tr></thead><tbody>'+body+'</tbody></table>';
  }

  function codePanel(){
    if(st.joinView){
      return '<pre class="aps-code"><span class="k">SELECT</span> c~concert_id, c~artist, p~perf_no, p~perf_date\n'+
        '  <span class="k">FROM</span> <span class="src">zconcert</span> <span class="k">AS</span> c\n'+
        '  <span class="k">INNER JOIN</span> <span class="src">zperf</span> <span class="k">AS</span> p\n'+
        '    <span class="k">ON</span> c~concert_id = p~concert_id\n'+
        '  <span class="k">INTO TABLE</span> @<span class="as">DATA</span>(gt_rows).</pre>';
    }
    var idLine = st.keepId
      ? '  <span class="kw">key</span> concert_id,'
      : '  <span class="gone">key concert_id,</span>   <span class="as">// 제거됨 → ON source 없음</span>';
    var perfLine = st.expose ? '      _Perf' : '      <span class="gone">_Perf</span>   <span class="as">// 노출 안 함</span>';
    return '<pre class="aps-code"><span class="k">define view entity</span> <span class="ent">ZI_Concert</span>\n'+
      '  <span class="k">as select from</span> <span class="src">zconcert</span>\n'+
      '  <span class="k">association</span> <span class="card">['+st.card+']</span> <span class="k">to</span> <span class="ent">ZI_Perf</span> <span class="k">as</span> <span class="as">_Perf</span>\n'+
      '    <span class="k">on</span> $projection.concert_id = _Perf.concert_id\n'+
      '{\n'+idLine+'\n      artist,\n      venue,\n'+perfLine+'\n}</pre>';
  }

  function setMsg(t,cls){ var m=$('apsMsg'); m.className='aps-msg '+cls; m.innerHTML=t; }
  function evalMsg(){
    var n=perfsOf(st.sel).length;
    if(!st.keepId){ setMsg('<b>활성화 오류 위험:</b> association을 노출하는데 ON source <b>concert_id</b>가 select list에 없습니다. source 필드는 반드시 <code>{ }</code>에 있어야 합니다.','bad'); return; }
    if(!st.expose){ setMsg('관계를 선언했지만 <b>_Perf</b>를 노출하지 않았습니다 — 소비자는 경로를 따라갈 수 없습니다. <code>{ }</code>에 <b>_Perf</b>를 넣어야 합니다.','warn'); return; }
    if(st.card==='1..1' && n>1){ setMsg('cardinality <b>[1..1]</b>로 선언했지만 이 공연에는 회차가 <b>'+n+'개</b>입니다 — 모델과 데이터 현실이 어긋납니다. 한 공연에 회차가 여럿이면 <b>[0..*]</b>가 맞습니다.','warn'); return; }
    setMsg('<b>'+esc(st.sel)+'</b>의 <code>concert_id</code>로 <b>_Perf</b> 경로를 따라가 회차 <b>'+n+'건</b>을 얻었습니다 (['+st.card+']). path를 쓰면 내부적으로 JOIN으로 변환될 수 있어요.','ok');
  }

  function render(){
    renderSeg(); renderToggles();
    $('apsSrc').innerHTML=srcPanel();
    $('apsTgt').innerHTML=tgtPanel();
    $('apsCode').innerHTML=codePanel();
    evalMsg();
  }

  $('apsSel').addEventListener('click',function(e){ var b=e.target.closest('.aps-seg'); if(!b) return; st.sel=b.dataset.c; render(); });
  $('apsExpose').addEventListener('click',function(){ st.expose=!st.expose; render(); });
  $('apsKeepId').addEventListener('click',function(){ st.keepId=!st.keepId; render(); });
  $('apsCard').addEventListener('click',function(){ st.card=(st.card==='0..*'?'1..1':'0..*'); render(); });
  $('apsJoin').addEventListener('click',function(){ st.joinView=!st.joinView; render(); });

  render();
})();
