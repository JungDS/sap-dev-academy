// ===== cds-activation-observer 엔진 JS — CDS View Entity 활성화 관찰기 (CH23-L01) =====
// 5단계: ①원본 테이블 ②DDL 작성 ③활성화 ④Data Preview ⑤ABAP SQL 소비.
// 필드 오타 토글 → ③활성화 실패 → ④⑤는 미리볼 수 없음(CDS는 오류 있으면 활성화 안 됨).
// 핵심 메시지: "바꾼 것은 테이블 데이터가 아니라 모델 정의". 데이터=window.CAO_CFG.
(function(){
  var $=function(id){return document.getElementById(id);};
  var cfg=window.CAO_CFG||{};
  var FIELDS=cfg.fields||[];
  var ROWS=cfg.rows||[];
  var ENT=cfg.entity||'ZI_Concert', SRC=cfg.source||'zconcert';
  var TYPO=cfg.typoField||'capacty';
  var lastField=FIELDS.length?FIELDS[FIELDS.length-1].name:'capacity';

  var STEPS=[
    {id:'table',   label:'① 원본 테이블'},
    {id:'ddl',     label:'② DDL 작성'},
    {id:'activate',label:'③ 활성화'},
    {id:'preview', label:'④ Data Preview'},
    {id:'consume', label:'⑤ ABAP SQL 소비'}
  ];
  var st={step:0, typo:false};
  function ok(){ return !st.typo; }   // 오타 없으면 활성화 성공

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function tableHtml(onlyExposed){
    var cols=FIELDS;
    var head='<thead><tr>'+cols.map(function(c){
      return '<th class="'+(c.key?'key':'')+'">'+esc(c.name)+'</th>';}).join('')+'</tr></thead>';
    var body=ROWS.map(function(r){
      return '<tr>'+cols.map(function(c){
        return '<td class="'+(c.key?'key':'')+'">'+esc(r[c.name])+'</td>';}).join('')+'</tr>';
    }).join('');
    return '<table class="dt">'+head+'<tbody>'+body+'</tbody></table>';
  }

  function ddlHtml(){
    var lines=[];
    lines.push('<span class="anno">@AccessControl.authorizationCheck: #NOT_REQUIRED</span>');
    lines.push('<span class="k">define view entity</span> <span class="ent">'+esc(ENT)+'</span>');
    lines.push('  <span class="k">as select from</span> <span class="src">'+esc(SRC)+'</span>');
    lines.push('{');
    FIELDS.forEach(function(c,i){
      var nm=esc(c.name), last=(i===FIELDS.length-1);
      if(last && st.typo) nm='<span class="bad">'+esc(TYPO)+'</span>';
      var pre = c.key ? '  <span class="kw">key</span> ' : '      ';
      lines.push(pre+nm+(last?'':','));
    });
    lines.push('}');
    return '<pre class="cao-ddl">'+lines.join('\n')+'</pre>'+
      '<div class="cao-region">'+
        '<span class="cao-tag k">define view entity … as select from</span>'+
        '<span class="cao-tag src">기반 데이터 소스 = '+esc(SRC)+'</span>'+
        '<span class="cao-tag fld">{ } = 노출할 필드 · key</span>'+
      '</div>';
  }

  function sqlHtml(){
    return '<pre class="cao-sql">'+
      '<span class="k">SELECT</span> *\n'+
      '  <span class="k">FROM</span> <span class="ent">'+esc(ENT)+'</span>\n'+
      '  <span class="k">INTO TABLE</span> <span class="host">@DATA(gt_concerts)</span>.</pre>';
  }

  function setMsg(t,warn){ var m=$('caoMsg'); m.className='cao-msg'+(warn?' warn':''); m.innerHTML=t; }

  function renderPanel(){
    var id=STEPS[st.step].id, cap='', html='';
    if(id==='table'){
      cap='원본 테이블 '+esc(SRC.toUpperCase())+' — 샘플 '+ROWS.length+'행';
      html=tableHtml(false);
      setMsg('아직 모델이 없으므로 프로그램은 <b>테이블에 직접</b> 의존합니다.');
    }else if(id==='ddl'){
      cap='DDL Source — 모델 선언(ABAP 프로그램 아님)';
      html=ddlHtml();
      setMsg(st.typo
        ? '필드명을 <b>'+esc(TYPO)+'</b>로 잘못 적었습니다. 활성화할 때 어떻게 되는지 ③으로 가 보세요.'
        : '세 영역으로 읽습니다: <b>정의</b>(define…select from) · <b>소스</b>('+esc(SRC)+') · <b>노출 필드</b>{ }. 실행 흐름이 아니라 결과 구조입니다.', st.typo);
    }else if(id==='activate'){
      cap='활성화 — DDL Source를 ADT에서 Activate';
      if(ok()){
        html='<span class="status inactive">Inactive</span><span class="cao-arrow">→</span><span class="status active">Active ✓</span>';
        setMsg('활성화 성공. ABAP Dictionary에 <b>'+esc(ENT)+'</b> CDS entity가 생겼습니다. 이제 다른 SQL·CDS가 이 이름을 소스처럼 씁니다.');
      }else{
        html='<span class="status inactive">Inactive</span><span class="cao-arrow">→</span><span class="status fail">활성화 실패 ✕</span>';
        setMsg('<b>활성화 실패:</b> 기반 테이블 '+esc(SRC.toUpperCase())+'에 <b>'+esc(TYPO)+'</b> 필드가 없습니다. CDS는 오류가 있으면 활성화되지 않습니다 — ②에서 오타를 고치세요.', true);
      }
    }else if(id==='preview'){
      cap='Data Preview — ADT에서 CDS entity 조회';
      if(ok()){
        html=tableHtml(true)+'<span class="cao-badge eq">원본 '+ROWS.length+'행 = CDS '+ROWS.length+'행 ✓ (단순 select라 행 수 같음)</span>';
        setMsg('지금 바꾼 것은 <b>테이블 데이터가 아니라 모델 정의</b>입니다. 행 수가 원본과 크게 다르면 where·join·association을 의심하세요.');
      }else{
        html='<div class="cao-blocked">활성화되지 않아 미리볼 수 없습니다 — 먼저 ②에서 오타를 고치세요.</div>';
        setMsg('CDS entity가 활성화돼야 Data Preview를 볼 수 있습니다.', true);
      }
    }else if(id==='consume'){
      cap='ABAP SQL 소비 — 프로그램이 모델을 읽음';
      if(ok()){
        html=sqlHtml();
        setMsg('핵심은 <b>FROM '+esc(SRC)+'</b>가 아니라 <b>FROM '+esc(ENT)+'</b>라는 점. 프로그램이 테이블이 아니라 <b>모델을 소비</b>하기 시작했습니다.');
      }else{
        html='<div class="cao-blocked">활성화되지 않은 CDS entity는 SQL에서 읽을 수 없습니다.</div>';
        setMsg('②에서 오타를 고치고 ③을 활성화하면 이 SELECT가 동작합니다.', true);
      }
    }
    $('caoCap').textContent=cap;
    $('caoPanel').innerHTML=html;
  }

  function renderRail(){
    var rail=$('caoRail'); rail.innerHTML='';
    STEPS.forEach(function(s,i){
      var b=document.createElement('button');
      b.className='cao-step'+(i===st.step?' on':'')+(i<st.step?' done':'');
      b.textContent=s.label; b.dataset.i=i;
      rail.appendChild(b);
    });
  }
  function render(){
    renderRail(); renderPanel();
    $('caoPrev').disabled=(st.step===0);
    $('caoNext').disabled=(st.step===STEPS.length-1);
    var tg=$('caoTypo'); tg.classList.toggle('on',st.typo);
    tg.textContent=(st.typo?'✓ ':'')+'필드 오타 주입('+TYPO+')';
  }

  $('caoRail').addEventListener('click',function(e){
    var b=e.target.closest('.cao-step'); if(!b) return;
    st.step=+b.dataset.i; render();
  });
  $('caoPrev').addEventListener('click',function(){ if(st.step>0){st.step--;render();} });
  $('caoNext').addEventListener('click',function(){ if(st.step<STEPS.length-1){st.step++;render();} });
  $('caoTypo').addEventListener('click',function(){ st.typo=!st.typo; render(); });

  render();
})();
