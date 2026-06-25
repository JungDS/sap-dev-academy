// ===== into-target-board 엔진 JS — INTO 대상 형태 비교 (CH08-L04) =====
// 같은 조회 결과가 Work Area / 개별 변수 묶음 / CORRESPONDING / APPENDING 으로
// 어떻게 담기는지 탭으로 보여 준다. 데이터=window.ITB_CFG.
(function(){
  var cfg = window.ITB_CFG || {};
  var ROW = cfg.row || {carrid:'KE', connid:'0701', fldate:'2026-06-23', seatsocc:320, seatsmax:380};
  var KEFLIGHTS = cfg.keFlights || [];
  var LHFLIGHTS = cfg.lhFlights || [];
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function code(s){ $('code').innerHTML=s; }

  var tab='wa', swap=false, appendMode='appending';

  function fldRow(name, val, cls, tag){
    return '<div class="fld '+(cls||'')+'"><span class="nm">'+esc(name)+'</span><span class="vv">'+esc(val)
      +(tag?'<span class="tagm '+tag.c+'">'+tag.t+'</span>':'')+'</span></div>';
  }

  function renderWA(){
    code('<span class="tok-kw">SELECT SINGLE</span> * <span class="tok-kw">FROM</span> sflight\n  <span class="tok-kw">INTO</span> gs_flight\n  <span class="tok-kw">WHERE</span> carrid = <span class="tok-str">\'KE\'</span> <span class="tok-kw">AND</span> connid = <span class="tok-str">\'0701\'</span> <span class="tok-kw">AND</span> fldate = <span class="tok-str">\'2026-06-23\'</span>.');
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
    code('<span class="tok-kw">SELECT SINGLE</span> carrid connid seatsmax <span class="tok-kw">FROM</span> sflight\n  <span class="tok-kw">INTO</span> '+esc(into)+'\n  <span class="tok-kw">WHERE</span> carrid = <span class="tok-str">\'KE\'</span> <span class="tok-kw">AND</span> connid = <span class="tok-str">\'0701\'</span>.');
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

  function renderCorr(){
    code('<span class="tok-kw">SELECT</span> carrid connid fldate <span class="tok-kw">FROM</span> sflight\n  <span class="tok-kw">INTO</span> <span class="tok-kw">CORRESPONDING FIELDS OF</span> gs_brief\n  <span class="tok-kw">WHERE</span> carrid = <span class="tok-str">\'KE\'</span> <span class="tok-kw">AND</span> connid = <span class="tok-str">\'0701\'</span>.');
    var read=['carrid','connid','fldate'];
    var target=[{f:'carrid',m:1},{f:'connid',m:1},{f:'fldate',m:1},{f:'cityfrom',m:0}];
    $('board').innerHTML='<div class="flow">'
      +'<div><div class="col__t">읽은 컬럼</div>'+read.map(function(c){return fldRow(c,ROW[c]);}).join('')+'</div>'
      +'<div class="arrow">→</div>'
      +'<div><div class="col__t">대상 구조 gs_brief (이름 같은 칸만)</div>'
      + target.map(function(t){
          return t.m ? fldRow(t.f, ROW[t.f]!==undefined?ROW[t.f]:'-', 'matched', {c:'ok',t:'이름 일치'})
                     : fldRow(t.f, '(안 채워짐)', 'unmatched', {c:'no',t:'이름 없음'});
        }).join('')
      +'</div></div>';
    $('explain').innerHTML='<b>INTO CORRESPONDING FIELDS OF</b> — <b>이름이 같은 필드끼리만</b> 자동으로 맞춰 담는다(순서 무관). 대상에만 있는 <code>cityfrom</code>은 읽은 컬럼에 없으므로 <b>안 채워진다</b>. 마법이 아니라 "이름 매칭"이다.';
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
