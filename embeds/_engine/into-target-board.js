// ===== into-target-board 엔진 JS — INTO 대상 형태 비교 (CH08-L04) =====
// 같은 조회 결과가 Work Area / 개별 변수 묶음 / CORRESPONDING / APPENDING 으로
// 어떻게 담기는지 탭으로 보여 준다. 데이터=window.ITB_CFG.
//   ITB_CFG = { row{}, keFlights[], lhFlights[], prevWa{} }
// 렌더러: renderWA · renderVars(순서 어긋남 토글) · renderCorr(TABLE↔wa 토글) · renderAppend(APPENDING↔INTO 토글).
// 규약 — SELECT SINGLE을 생성하는 코드는 **키 전체**(carrid+connid+fldate)를 조건에 준다.
//   부분 키 SINGLE은 본문 L03이 대표 실수로 못 박은 패턴이라 시범하지 않는다.
// 사실 근거(abapinto_clause) — CORRESPONDING FIELDS OF **wa**: 이름이 안 맞는 성분은
//   "not changed" = 직전 값 잔존. **TABLE**: 행마다 초기 행을 새로 만든 뒤 담으므로 초기값.
(function(){
  var cfg = window.ITB_CFG || {};
  var ROW = cfg.row || {carrid:'KE', connid:'0701', fldate:'20260623', seatsocc:320, seatsmax:380};
  var KEFLIGHTS = cfg.keFlights || [];
  var LHFLIGHTS = cfg.lhFlights || [];
  var PREVWA = cfg.prevWa || {carrid:'LH', connid:'0400', fldate:'20260623', cityfrom:'FRANKFURT'};
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function code(s){ $('code').innerHTML=s; }

  var tab='wa', swap=false, appendMode='appending', corrMode='table';

  function fldRow(name, val, cls, tag){
    return '<div class="fld '+(cls||'')+'"><span class="nm">'+esc(name)+'</span><span class="vv">'+esc(val)
      +(tag?'<span class="tagm '+tag.c+'">'+tag.t+'</span>':'')+'</span></div>';
  }

  function renderWA(){
    code('<span class="tok-kw">SELECT SINGLE</span> * <span class="tok-kw">FROM</span> sflight\n  <span class="tok-kw">INTO</span> gs_flight\n  <span class="tok-kw">WHERE</span> carrid = <span class="tok-str">\'KE\'</span> <span class="tok-kw">AND</span> connid = <span class="tok-str">\'0701\'</span> <span class="tok-kw">AND</span> fldate = <span class="tok-str">\'20260623\'</span>.');
    var rowFlds = ['carrid','connid','fldate','seatsocc','seatsmax'].map(function(c){ return fldRow(c, ROW[c],'matched',{c:'ok',t:'담김'}); }).join('');
    $('board').innerHTML='<div class="flow">'
      +'<div><div class="col__t">조회한 한 행</div>'+['carrid','connid','fldate','seatsocc','seatsmax'].map(function(c){return fldRow(c,ROW[c]);}).join('')+'</div>'
      +'<div class="arrow">→</div>'
      +'<div><div class="col__t">Work Area · gs_flight</div><div class="wa"><div class="wa__t">gs_flight TYPE sflight</div>'+rowFlds+'</div></div>'
      +'</div>';
    $('explain').innerHTML='<b>INTO wa</b> — 한 행을 구조체 <code>gs_flight</code>에 통째로 담는다. <b>기존 값은 새 값으로 덮인다.</b> 주로 <code>SELECT SINGLE</code>·<code>ENDSELECT</code>와 함께 쓴다.';
  }

  function renderVars(){
    var selFields=['carrid','connid','seatsmax'];
    var vars=['gv_carrid','gv_connid','gv_max'];
    var into = swap ? '(gv_connid, gv_carrid, gv_max)' : '(gv_carrid, gv_connid, gv_max)';
    code('<span class="tok-kw">SELECT SINGLE</span> carrid connid seatsmax <span class="tok-kw">FROM</span> sflight\n  <span class="tok-kw">INTO</span> '+esc(into)+'\n  <span class="tok-kw">WHERE</span> carrid = <span class="tok-str">\'KE\'</span> <span class="tok-kw">AND</span> connid = <span class="tok-str">\'0701\'</span>\n    <span class="tok-kw">AND</span> fldate = <span class="tok-str">\'20260623\'</span>.');
    // 위치 기반 매핑: SELECT 필드[i] → INTO 변수[i]
    var targetVars = swap ? ['gv_connid','gv_carrid','gv_max'] : vars;
    var rows = selFields.map(function(f,i){
      var v=targetVars[i];
      var expected = (v==='gv_carrid'&&f==='carrid')||(v==='gv_connid'&&f==='connid')||(v==='gv_max'&&f==='seatsmax');
      var cls = expected ? 'matched' : 'warn';
      var tag = expected ? {c:'ok',t:'정상'} : {c:'bad',t:'엉뚱'};
      return fldRow('위치 '+(i+1)+': '+f+' → '+v, ROW[f], cls, tag);
    }).join('');
    $('board').innerHTML='<div class="col__t">위치(순서)로 짝지어 담는다 — 이름이 아니라 순서</div>'+rows
      +'<div class="ctrlrow"><span style="font-size:.8rem;font-weight:700;color:var(--ink-soft)">변수 순서:</span>'
      +'<div class="tgl" id="swapTgl"><button data-s="0" '+(!swap?'class="on"':'')+'>정상</button><button data-s="1" '+(swap?'class="on"':'')+'>순서 어긋남</button></div></div>';
    $('swapTgl').addEventListener('click',function(e){var b=e.target.closest('button');if(b){swap=b.dataset.s==='1';renderVars();postHeight();}});
    $('explain').innerHTML = swap
      ? '<b class="bad">순서 어긋남!</b> <code>INTO (gv_connid, gv_carrid, …)</code>로 받으면 <b>carrid 값이 gv_connid에</b> 들어간다. 변수 묶음은 <b>이름이 아니라 순서</b>로 짝지어지므로, SELECT 필드 순서와 1:1로 맞춰야 한다.'
      : '<b>INTO (v1, v2, v3)</b> — 고른 컬럼을 변수에 <b>순서대로</b> 담는다. 위 토글로 순서를 어긋나게 해보면 값이 엉뚱하게 들어가는 걸 볼 수 있다.';
  }

  function corrToggle(){
    return '<div class="ctrlrow"><span style="font-size:.8rem;font-weight:700;color:var(--ink-soft)">담을 그릇:</span>'
      +'<div class="tgl" id="corrTgl"><button data-m="table" '+(corrMode==='table'?'class="on"':'')+'>TABLE (본문 예제)</button>'
      +'<button data-m="wa" '+(corrMode==='wa'?'class="on"':'')+'>Work Area 하나</button></div></div>';
  }

  /* 본문 정본 형태 — 여러 건을 Internal Table로. 대상 행은 매번 초기 행으로 새로 만들어진다. */
  function renderCorrTable(){
    code('<span class="tok-kw">SELECT</span> carrid connid fldate <span class="tok-kw">FROM</span> sflight\n  <span class="tok-kw">INTO</span> <span class="tok-kw">CORRESPONDING FIELDS OF TABLE</span> gt_flight\n  <span class="tok-kw">WHERE</span> carrid = <span class="tok-str">\'KE\'</span>.');
    var head='<thead><tr><th>CARRID</th><th>CONNID</th><th>FLDATE</th><th>SEATSOCC</th><th>SEATSMAX</th></tr></thead>';
    var rows=KEFLIGHTS.map(function(r){
      return '<tr class="added"><td>'+esc(r.carrid)+'</td><td>'+esc(r.connid)+'</td><td>'+esc(r.fldate)+'</td>'
        +'<td>0 <span class="tagm no">초기값</span></td><td>0 <span class="tagm no">초기값</span></td></tr>';
    }).join('');
    $('board').innerHTML='<div class="col__t">읽은 컬럼 carrid connid fldate → gt_flight ('+KEFLIGHTS.length+'행, 행 타입 = SFLIGHT)</div>'
      +'<table class="dt">'+head+'<tbody>'+rows+'</tbody></table>'
      +corrToggle();
    $('explain').innerHTML='<b>INTO CORRESPONDING FIELDS OF TABLE</b> — <b>이름이 같은 필드끼리만</b> 맞춰 담는다(순서 무관). 읽지 않은 <code>seatsocc</code>·<code>seatsmax</code>는 <b>빈칸이 아니라 초기값 0</b>이다. 담을 때마다 초기 행을 새로 만들어 채우기 때문이다. 마법이 아니라 "이름 매칭"이다.';
  }

  /* 같은 표현을 Work Area 하나에 쓰면 — 짝 없는 칸에 직전 값이 남는다(본문 ⚠️ 경고와 같은 장면). */
  function renderCorrWa(){
    code('<span class="tok-com">" gs_brief에는 앞선 처리의 값이 남아 있다</span>\n<span class="tok-kw">SELECT SINGLE</span> carrid connid fldate <span class="tok-kw">FROM</span> sflight\n  <span class="tok-kw">INTO</span> <span class="tok-kw">CORRESPONDING FIELDS OF</span> gs_brief\n  <span class="tok-kw">WHERE</span> carrid = <span class="tok-str">\'KE\'</span> <span class="tok-kw">AND</span> connid = <span class="tok-str">\'0701\'</span>\n    <span class="tok-kw">AND</span> fldate = <span class="tok-str">\'20260623\'</span>.');
    var read=['carrid','connid','fldate'];
    var target=[{f:'carrid',m:1},{f:'connid',m:1},{f:'fldate',m:1},{f:'cityfrom',m:0}];
    $('board').innerHTML='<div class="flow">'
      +'<div><div class="col__t">읽은 컬럼</div>'+read.map(function(c){return fldRow(c,ROW[c]);}).join('')
        +'<div class="col__t" style="margin-top:11px">SELECT 직전 gs_brief</div>'
        +target.map(function(t){return fldRow(t.f, PREVWA[t.f]);}).join('')+'</div>'
      +'<div class="arrow">→</div>'
      +'<div><div class="col__t">SELECT 직후 gs_brief</div>'
      + target.map(function(t){
          return t.m ? fldRow(t.f, ROW[t.f]!==undefined?ROW[t.f]:'-', 'matched', {c:'ok',t:'새 값'})
                     : fldRow(t.f, PREVWA[t.f], 'warn', {c:'bad',t:'직전 값 잔존'});
        }).join('')
      +'</div></div>'
      +corrToggle();
    $('explain').innerHTML='<b class="bad">짝 없는 칸은 지워지지 않는다.</b> 이름이 맞은 세 칸만 새 값으로 바뀌고, 읽은 컬럼에 없는 <code>cityfrom</code>에는 <b>직전 값('+esc(PREVWA.cityfrom)+')이 그대로 남는다.</b> 옛 값과 새 값이 한 그릇에 섞이는 조용한 버그다. 새로 담기 전에 <code>CLEAR gs_brief.</code>로 비우는 습관이 안전하다.';
  }

  function renderCorr(){
    if(corrMode==='table') renderCorrTable(); else renderCorrWa();
    $('corrTgl').addEventListener('click',function(e){var b=e.target.closest('button');if(b){corrMode=b.dataset.m;renderCorr();postHeight();}});
  }

  function renderAppend(){
    var appending = appendMode==='appending';
    var kw = appending ? 'APPENDING TABLE' : 'INTO TABLE';
    code('<span class="tok-com">" 1차: KE 2행을 gt_flight에 담음 (INTO TABLE)</span>\n'
      +'<span class="tok-kw">SELECT</span> * <span class="tok-kw">FROM</span> sflight <span class="tok-kw">INTO TABLE</span> gt_flight <span class="tok-kw">WHERE</span> carrid = <span class="tok-str">\'KE\'</span>.\n'
      +'<span class="tok-com">" 2차: LH를 '+(appending?'덧붙임':'덮어씀')+'</span>\n'
      +'<span class="tok-kw">SELECT</span> * <span class="tok-kw">FROM</span> sflight <span class="tok-kw">'+kw+'</span> gt_flight <span class="tok-kw">WHERE</span> carrid = <span class="tok-str">\'LH\'</span>.');
    var head='<thead><tr><th>CARRID</th><th>CONNID</th><th>FLDATE</th></tr></thead>';
    var rows;
    if(appending){
      rows = KEFLIGHTS.map(function(r){return '<tr class="kept"><td>'+r.carrid+'</td><td>'+r.connid+'</td><td>'+r.fldate+'</td></tr>';}).join('')
           + LHFLIGHTS.map(function(r){return '<tr class="added"><td>'+r.carrid+'</td><td>'+r.connid+'</td><td>'+r.fldate+'</td></tr>';}).join('');
    } else {
      rows = LHFLIGHTS.map(function(r){return '<tr class="added"><td>'+r.carrid+'</td><td>'+r.connid+'</td><td>'+r.fldate+'</td></tr>';}).join('');
    }
    var total = appending ? KEFLIGHTS.length+LHFLIGHTS.length : LHFLIGHTS.length;
    $('board').innerHTML='<div class="col__t">2차 SELECT 후 gt_flight ('+total+'행)</div>'
      +'<table class="dt">'+head+'<tbody>'+rows+'</tbody></table>'
      +'<div class="ctrlrow"><span style="font-size:.8rem;font-weight:700;color:var(--ink-soft)">2차 SELECT 방식:</span>'
      +'<div class="tgl" id="appTgl"><button data-a="appending" '+(appending?'class="on"':'')+'>APPENDING (덧붙임)</button><button data-a="into" '+(!appending?'class="on"':'')+'>INTO TABLE (덮어씀)</button></div></div>';
    $('appTgl').addEventListener('click',function(e){var b=e.target.closest('button');if(b){appendMode=b.dataset.a;renderAppend();postHeight();}});
    $('explain').innerHTML = appending
      ? '<b>APPENDING TABLE</b> — 기존 KE 2행을 <b>지우지 않고</b> 그 뒤에 LH 행을 이어 붙인다(초록=추가). 여러 조건 결과를 모을 때 유용.'
      : '<b>INTO TABLE</b> — 2차 SELECT가 기존 내용을 <b>모두 지우고</b> LH 결과로 새로 채운다. KE 2행은 사라졌다. "이전 결과를 유지해야 하는데 INTO를 쓰는" 실수에 주의.';
  }

  function render(){
    if(tab==='wa') renderWA();
    else if(tab==='vars') renderVars();
    else if(tab==='corr') renderCorr();
    else renderAppend();
    postHeight();
  }
  $('tabs').addEventListener('click',function(e){
    var b=e.target.closest('.tab'); if(!b) return;
    tab=b.dataset.t;
    $('tabs').querySelectorAll('.tab').forEach(function(x){x.classList.toggle('on',x===b);});
    render();
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
