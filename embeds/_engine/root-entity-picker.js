// ===== root-entity-picker 엔진 JS — RAP Root Entity 판정기 (CH23-L02) =====
// 업무 후보(공연/회차/예매) 중 트랜잭션 단위 고르기 → 사용자 행동이 모이나 + key 안정성 판정.
// 예매+안정 key(booking_id) → root 적합(ok). 다른 후보 → action 대상 불안정(warn). 불안정 key → bad. 데이터 내장.
(function(){
  var $=function(id){return document.getElementById(id);};
  var ACTIONS=['예약 생성','예매 취소','정원 검증','상태 변경'];   // 모두 예매 단위
  var ENT={
    concert:{ nm:'공연', tb:'ZCONCERT', root:'ZI_Concert', fits:false,
      keys:[{f:'concert_id',ok:true},{f:'artist',ok:false,why:'아티스트는 중복될 수 있어 인스턴스를 못 가립니다.'}] },
    perf:{ nm:'회차', tb:'ZPERF', root:'ZI_Perf', fits:false,
      keys:[{f:'concert_id, perf_no',ok:true},{f:'perf_date',ok:false,why:'날짜는 같은 날 여러 회차가 있을 수 있습니다.'}] },
    booking:{ nm:'예매', tb:'ZBOOKING', root:'ZI_Booking', fits:true,
      keys:[{f:'booking_id',ok:true},{f:'status',ok:false,why:'예매 상태는 자주 바뀌므로 key로 부적합합니다.'},{f:'customer',ok:false,why:'한 사람이 여러 예매를 하므로 유일하지 않습니다.'}] }
  };
  var ORDER=['concert','perf','booking'];
  var st={ ent:'booking', key:null };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function cur(){ return ENT[st.ent]; }

  function renderCards(){
    $('repCards').innerHTML=ORDER.map(function(k){
      var e=ENT[k];
      return '<div class="rep-card'+(k===st.ent?' on':'')+'" data-e="'+k+'"><div class="rep-card__nm">'+esc(e.nm)+'</div>'+
        '<div class="rep-card__tb">'+esc(e.tb)+'</div></div>';
    }).join('');
  }
  function renderActs(){
    var fits=cur().fits;
    $('repActs').innerHTML=ACTIONS.map(function(a){
      return '<span class="rep-act '+(fits?'belong':'stray')+'">'+esc(a)+(fits?' ✓':' ?')+'</span>';
    }).join('');
    $('repActNote').textContent = fits
      ? '이 행동들이 모두 ‘예매’ 단위에서 일어납니다 → 예매가 root로 자연스럽습니다.'
      : '이 행동들은 실제로 ‘예매’ 단위인데, root를 ‘'+cur().nm+'’로 두면 action·validation 대상이 흔들립니다.';
  }
  function renderKeys(){
    var e=cur();
    $('repKeys').innerHTML=e.keys.map(function(k,i){
      var sel=(st.key&&st.key.f===k.f);
      var cls=sel?(k.ok?'sel-ok':'sel-bad'):'';
      return '<button class="rep-key '+cls+'" data-i="'+i+'">'+esc(k.f)+'</button>';
    }).join('');
    var note='';
    if(st.key){ note = st.key.ok ? '✓ 안정적 — 인스턴스를 정확히 식별합니다(OData key·RAP 식별 기준).' : '✕ '+st.key.why; }
    else note='key 후보를 골라 안정성을 확인하세요.';
    $('repKeyNote').textContent=note;
  }
  function renderCode(){
    var e=cur();
    var keyf = (st.key && st.key.ok) ? st.key.f : (e.keys[0].f);
    var fields = st.ent==='booking'
      ? ['concert_id','perf_no','customer','seats','status']
      : (st.ent==='perf' ? ['concert_id','perf_no','perf_date'] : ['artist','venue','capacity']);
    var lines=['<span class="k">define root view entity</span> <span class="ent">'+esc(e.root)+'</span>',
      '  <span class="k">as select from</span> '+esc(e.tb.toLowerCase()),'{'];
    keyf.split(', ').forEach(function(kf){ lines.push('  <span class="kw">key</span> '+esc(kf)+','); });
    fields.forEach(function(f,i){ lines.push('      '+esc(f)+(i===fields.length-1?'':',')); });
    lines.push('}');
    $('repCode').innerHTML='<pre class="rep-code">'+lines.join('\n')+'</pre>';
  }
  function renderVerdict(){
    var e=cur(), v=$('repVerdict');
    if(!e.fits){ v.className='rep-verdict warn'; v.innerHTML='<b>트랜잭션 단위가 안 맞습니다.</b> 이 앱의 예약·취소·검증은 ‘예매’에서 일어납니다 — root를 <b>'+esc(e.nm)+'</b>로 두면 뒤 계층(BDEF·action·validation)이 흔들립니다.'; return; }
    if(!st.key){ v.className='rep-verdict warn'; v.innerHTML='예매를 골랐습니다. 이제 <b>안정적인 key</b>를 정하세요 — RAP key는 인스턴스 식별 기준입니다.'; return; }
    if(!st.key.ok){ v.className='rep-verdict bad'; v.innerHTML='<b>key 부적합:</b> '+esc(st.key.why)+' RAP에서 key는 update·action·OData URL이 인스턴스를 찾는 기준이라 안정적이어야 합니다.'; return; }
    v.className='rep-verdict ok';
    v.innerHTML='<b>예매가 root로 적합 🎉</b> 트랜잭션이 예매 단위에 모이고, <code>'+esc(st.key.f)+'</code>가 안정적인 식별자입니다. 이 root 위에 projection·BDEF가 올라갑니다.';
  }
  function render(){ renderCards(); renderActs(); renderKeys(); renderCode(); renderVerdict(); }

  $('repCards').addEventListener('click',function(e){ var c=e.target.closest('.rep-card'); if(!c) return; st.ent=c.dataset.e; st.key=null; render(); });
  $('repKeys').addEventListener('click',function(e){ var b=e.target.closest('.rep-key'); if(!b) return; st.key=cur().keys[+b.dataset.i]; render(); });

  render();
})();
