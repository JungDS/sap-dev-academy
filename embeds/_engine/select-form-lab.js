// ===== select-form-lab 엔진 JS — SELECT 형태 비교 실험실 (CH08-L03) =====
// 같은 데이터셋을 SINGLE / INTO TABLE / ENDSELECT / UP TO n 으로 조회하고
// 결과 대상 모양·전달 행 수·반복 횟수·sy-subrc를 비교한다. 데이터=window.SFL_CFG.
//   SFL_CFG = { carrid, single:{connid,fldate}, cap, cols[], numeric{}, data[] }
(function(){
  var cfg = window.SFL_CFG || {};
  var CARR = cfg.carrid || 'KE';
  var SINGLE = cfg.single || {connid:'0701', fldate:'2026-06-23'};
  var CAP = cfg.cap || 3;
  var COLS = cfg.cols || ['connid','fldate','seatsocc','seatsmax'];
  var NUM = cfg.numeric || {seatsocc:true, seatsmax:true};
  var DATA = cfg.data || [];
  var ALL = DATA.filter(function(r){ return r.carrid===CARR; });   // carrid 조건 통과 행
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var form='single';

  /* ── 코드 생성(classic) ── */
  function codeFor(f){
    if(f==='single') return [
      'DATA gs_flight TYPE sflight.','',
      "SELECT SINGLE * FROM sflight",
      "  INTO gs_flight",
      "  WHERE carrid = '"+CARR+"'",
      "    AND connid = '"+SINGLE.connid+"'",
      "    AND fldate = '"+SINGLE.fldate+"'." ];
    if(f==='table') return [
      'DATA gt_flight TYPE TABLE OF sflight.','',
      "SELECT * FROM sflight",
      "  INTO TABLE gt_flight",
      "  WHERE carrid = '"+CARR+"'." ];
    if(f==='endselect') return [
      'DATA gs_flight TYPE sflight.','',
      "SELECT * FROM sflight",
      "  INTO gs_flight",
      "  WHERE carrid = '"+CARR+"'.",
      "  WRITE: / gs_flight-connid.",
      "ENDSELECT." ];
    return [   // up to n
      'DATA gt_flight TYPE TABLE OF sflight.','',
      "SELECT * FROM sflight",
      "  INTO TABLE gt_flight",
      "  UP TO "+CAP+" ROWS",
      "  WHERE carrid = '"+CARR+"'." ];
  }
  var KW=new Set('DATA TYPE TABLE OF SELECT SINGLE FROM INTO WHERE AND UP TO ROWS ENDSELECT WRITE'.split(' '));
  function hl(line){
    if(/^\s*"/.test(line)) return '<span class="tok-com">'+esc(line)+'</span>';
    var out='', re=/('[^']*'?)|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_]*)|([^A-Za-z0-9_']+)/g, m;
    while((m=re.exec(line))!==null){
      if(m[1]) out+='<span class="tok-str">'+esc(m[1])+'</span>';
      else if(m[2]) out+='<span class="tok-num">'+esc(m[2])+'</span>';
      else if(m[3]) out+= KW.has(m[3].toUpperCase())?'<span class="tok-kw">'+esc(m[3])+'</span>':esc(m[3]);
      else out+=esc(m[0]);
    }
    return out;
  }
  function renderCode(){
    var src=codeFor(form);
    $('code').innerHTML=src.map(hl).join('\n');
    $('codeGut').textContent=src.map(function(_,i){return i+1;}).join('\n');
  }

  /* ── 대상/지표 ── */
  function waCard(r){
    return '<div class="wa"><div class="wa__t">gs_flight (Work Area · 1행)</div><div class="wa__grid">'
      +COLS.map(function(c){return '<span class="f">'+c+'</span><span class="val">'+esc(r?r[c]:'—')+'</span>';}).join('')
      +'</div></div>';
  }
  function tbl(rows, cappedFrom){
    var head='<thead><tr>'+COLS.map(function(c){return '<th>'+c.toUpperCase()+'</th>';}).join('')+'</tr></thead>';
    var body=rows.map(function(r,i){
      var capped = cappedFrom!=null && i>=cappedFrom;
      return '<tr class="'+(capped?'capped':'')+'">'+COLS.map(function(c){return '<td class="'+(NUM[c]?'num':'')+'">'+esc(r[c])+'</td>';}).join('')+'</tr>';
    }).join('');
    return '<table class="dt">'+head+'<tbody>'+body+'</tbody></table>';
  }

  function render(){
    renderCode();
    var tHd=$('targetHd'), tBody=$('targetBody'), cnt=$('targetCnt');
    var single = ALL.filter(function(r){return r.connid===SINGLE.connid && r.fldate===SINGLE.fldate;})[0];
    if(form==='single'){
      tHd.textContent='결과 대상 · Work Area';
      tBody.innerHTML=waCard(single);
      cnt.textContent='1행';
      metrics('Work Area', single?1:0, 'DB 왕복 1회', single?0:4);
      explain('<b>SELECT SINGLE</b> — 키 전체로 <b>정확히 한 행</b>만 <code>gs_flight</code>(Work Area)에 담는다. 목록이 필요할 땐 쓰지 않는다.');
    } else if(form==='table'){
      tHd.textContent='결과 대상 · Internal Table';
      tBody.innerHTML=tbl(ALL);
      cnt.textContent=ALL.length+'행';
      metrics('Internal Table', ALL.length, 'DB 왕복 1회 (Array Fetch)', ALL.length?0:4);
      explain('<b>INTO TABLE</b> — 조건에 맞는 <b>모든 행을 한 번에</b> <code>gt_flight</code>로 가져온다(Array Fetch, 빠름). 새 코드의 목록 조회 기본형.');
    } else if(form==='endselect'){
      tHd.textContent='결과 대상 · Work Area (반복 재사용)';
      var log=ALL.map(function(r,i){
        return '<div class="lrow'+(i===ALL.length-1?' last':'')+'"><span class="it">반복 '+(i+1)+'</span>gs_flight = { '+r.connid+' · '+r.fldate+' }'+(i===ALL.length-1?'  ← 마지막':'')+'</div>';
      }).join('');
      tBody.innerHTML=waCard(ALL[ALL.length-1])
        +'<div class="looplog"><div class="looplog__t">⟳ 한 Work Area를 '+ALL.length+'번 덮어쓰며 반복</div>'+log+'</div>';
      cnt.textContent=ALL.length+'회';
      metrics('Work Area(반복)', ALL.length, 'DB 여러 번 왕복 · '+ALL.length+'회 반복', ALL.length?0:4);
      explain('<b>SELECT … ENDSELECT</b> — 한 행씩 <code>gs_flight</code>에 담아 반복한다. <b>같은 Work Area를 계속 덮어쓴다.</b> DB를 여러 번 왕복해 느리므로 <b>지양</b> — 읽을 줄만 알면 된다.');
    } else {
      tHd.textContent='결과 대상 · Internal Table (UP TO '+CAP+')';
      tBody.innerHTML=tbl(ALL, CAP);
      cnt.textContent=Math.min(CAP,ALL.length)+' / '+ALL.length+'행';
      metrics('Internal Table', Math.min(CAP,ALL.length), '전체 '+ALL.length+'행 중 '+CAP+'행만', ALL.length?0:4);
      explain('<b>UP TO '+CAP+' ROWS</b> — 조건 결과가 '+ALL.length+'행이어도 <b>최대 '+CAP+'행만</b> ABAP으로 넘어온다(취소선=잘림). "아무 한 행"의 뜻이 아니므로 순서가 중요하면 정렬을 따로 배운다.');
    }
    postHeight();
  }
  function metrics(target, rows, loops, subrc){
    $('mTarget').textContent=target; $('mRows').textContent=rows;
    $('mLoop').textContent=loops; $('mSubrc').textContent='sy-subrc = '+subrc;
  }
  function explain(html){ $('explain').innerHTML=html; }

  /* ── 폼 버튼 ── */
  function setForm(f){
    form=f;
    $('forms').querySelectorAll('.fbtn').forEach(function(b){ b.classList.toggle('on', b.dataset.f===f); });
    render();
  }
  $('forms').addEventListener('click',function(e){ var b=e.target.closest('.fbtn'); if(b) setForm(b.dataset.f); });
  $('situ').addEventListener('click',function(e){ var c=e.target.closest('.schip'); if(c) setForm(c.dataset.f); });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  setForm('single');
})();
