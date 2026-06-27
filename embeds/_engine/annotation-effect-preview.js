// ===== annotation-effect-preview 엔진 JS — CDS Annotation 효과 미리보기 (CH22-L04) =====
// 3패널: ①라벨 토글(헤더 기술명↔업무라벨) ②@Semantics.amount.currencyCode 짝(currency_code=ok·자기참조=bad·없음=warn)
// ③@UI.lineItem 순서(▲▼→컬럼 순서+position 재할당). annotation은 활성화된 metadata. 데이터=window.AEP_CFG.
(function(){
  var $=function(id){return document.getElementById(id);};
  var cfg=window.AEP_CFG||{};
  var LABELS=cfg.labels||{};
  var price=cfg.priceField||'ticket_price', curr=cfg.currencyField||'currency_code';
  var st={ labelOn:true, target:curr, order:(cfg.order||['concert_id','artist','venue','capacity']).slice() };
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function labelOf(n){ return LABELS[n]||n; }

  // ── 패널1: 라벨 토글 → 헤더 미리보기 ──
  function renderLabel(){
    $('aepLabelBtn').className='aep-toggle '+(st.labelOn?'on':'off');
    $('aepLabelBtn').textContent=(st.labelOn?'@EndUserText.label 적용 ✓':'라벨 없음 ✗');
    var cols=['concert_id','artist','venue','capacity'];
    var th=cols.map(function(n){
      return st.labelOn
        ? '<th>'+esc(labelOf(n))+'</th>'
        : '<th class="tech">'+esc(n.toUpperCase())+'</th>';
    }).join('');
    $('aepLabelPrev').innerHTML='<table class="dt"><thead><tr>'+th+'</tr></thead></table>';
    $('aepLabelNote').textContent=st.labelOn
      ? '도구가 라벨 metadata를 읽어 업무 용어를 보여 줍니다.'
      : '라벨이 없으면 기술 필드명이 그대로 노출됩니다.';
  }

  // ── 패널2: @Semantics 금액 짝 ──
  function renderSem(){
    $('aepSemSeg').querySelectorAll('button').forEach(function(b){ b.classList.toggle('on', b.dataset.t===st.target); });
    var tShow = st.target==='none' ? '(지정 안 함)' : st.target;
    var codeTarget = st.target==='none'
      ? '<span class="anno">@Semantics.amount.currencyCode</span> 미지정'
      : (st.target===price
          ? '<span class="anno">@Semantics.amount.currencyCode:</span> <span class="bad">\''+esc(price)+'\'</span>'
          : '<span class="anno">@Semantics.amount.currencyCode:</span> \''+esc(curr)+'\'');
    var code='<pre class="aep-code">'+codeTarget+'\n<span class="fld">'+esc(price)+',</span>\n\n'+
      '<span class="anno">@Semantics.currencyCode:</span> true\n<span class="fld">'+esc(curr)+'</span></pre>';
    $('aepSemCode').innerHTML=code;
    var v=$('aepSemVerdict');
    if(st.target===curr){ v.className='aep-verdict ok'; v.innerHTML='<b>금액 + 통화 의미 완성.</b> 금액 필드 <code>'+esc(price)+'</code>가 통화 필드 <code>'+esc(curr)+'</code>를 가리킵니다.'; }
    else if(st.target===price){ v.className='aep-verdict bad'; v.innerHTML='<b>자기참조 오류.</b> 금액 필드가 자기 자신을 통화로 가리킵니다 — 금액은 <b>다른 통화 필드</b>(<code>'+esc(curr)+'</code>)를 가리켜야 합니다.'; }
    else { v.className='aep-verdict warn'; v.innerHTML='<b>통화 짝 없음.</b> 금액만 선언하고 통화 필드를 가리키지 않으면 의미가 완성되지 않습니다.'; }
  }

  // ── 패널3: @UI.lineItem 순서 ──
  function renderOrder(){
    $('aepOrderList').innerHTML=st.order.map(function(n,i){
      var pos=(i+1)*10;
      return '<div class="aep-item"><span class="aep-pos">position: '+pos+'</span>'+
        '<span class="nm">'+esc(n)+'</span><span class="lbl">'+esc(labelOf(n))+'</span>'+
        '<span class="aep-ord">'+
          '<button data-d="up" data-i="'+i+'"'+(i===0?' disabled':'')+'>▲</button>'+
          '<button data-d="down" data-i="'+i+'"'+(i===st.order.length-1?' disabled':'')+'>▼</button>'+
        '</span></div>';
    }).join('');
    $('aepOrderPrev').innerHTML='<table class="dt"><thead><tr>'+
      st.order.map(function(n){return '<th>'+esc(st.labelOn?labelOf(n):n.toUpperCase())+'</th>';}).join('')+
      '</tr></thead></table>';
  }

  function render(){ renderLabel(); renderSem(); renderOrder(); }

  $('aepLabelBtn').addEventListener('click',function(){ st.labelOn=!st.labelOn; render(); });
  $('aepSemSeg').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; st.target=b.dataset.t; renderSem(); });
  $('aepOrderList').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b||b.disabled) return;
    var i=+b.dataset.i, j=(b.dataset.d==='up'?i-1:i+1);
    var t=st.order[i]; st.order[i]=st.order[j]; st.order[j]=t;
    renderOrder();
  });

  render();
})();
