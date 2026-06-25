// ===== join-aggregate-visualizer 엔진 JS — LEFT OUTER JOIN + GROUP BY SUM 시각화 (config 주도) =====
// window.JOIN_CFG:
//   { left:{name,alias,cols[{key,label,num}],data[]}, right:{name,alias,cols[],data[]},
//     onLeft, onRight, filter:{field,op,val,label}, groupBy[leftKeys], sumField, sumAs, resultCols[{key,label,num}] }
// JOIN 타입(LEFT OUTER ↔ INNER) 토글로 '예매 없는 공연이 남는다'(LEFT) 차이를 시연. classic SELECT.
(function(){
  var cfg = window.JOIN_CFG; if(!cfg) return;
  var L=cfg.left, R=cfg.right;
  var $=function(id){return document.getElementById(id);};
  var jtype='LEFT';   // 'LEFT' | 'INNER'

  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function filterPass(rrow){
    if(!cfg.filter) return true;
    var v=rrow[cfg.filter.field], t=cfg.filter.val;
    return cfg.filter.op==='<>' ? String(v)!==String(t) : String(v)===String(t);
  }
  // 각 left행에 매칭되는(필터 통과) right행들
  function matchesFor(lrow){
    return R.data.filter(function(rr){ return String(rr[cfg.onRight])===String(lrow[cfg.onLeft]) && filterPass(rr); });
  }

  /* ── 원본 테이블 ── */
  function tableHtml(meta){
    var th='<thead><tr>'+meta.cols.map(function(c){return '<th>'+c.label+'</th>';}).join('')+'</tr></thead>';
    var bd='<tbody>'+meta.data.map(function(r){
      var cancelled = (meta===R && cfg.filter && !filterPass(r));
      return '<tr class="'+(cancelled?'cx':'')+'">'+meta.cols.map(function(c){return '<td class="'+(c.num?'num':'')+'">'+esc(r[c.key])+'</td>';}).join('')+'</tr>';
    }).join('')+'</tbody>';
    return th+bd;
  }
  function renderSrc(){
    $('srcL').innerHTML=tableHtml(L);
    $('srcR').innerHTML=tableHtml(R);
  }

  /* ── 코드 ── */
  function renderCode(){
    var join = jtype==='LEFT' ? 'LEFT OUTER JOIN' : 'INNER JOIN';
    var onTxt = L.alias+'~'+cfg.onLeft+' = '+R.alias+'~'+cfg.onRight + (cfg.filter? ' AND '+cfg.filter.label : '');
    var selFields = cfg.groupBy.map(function(k){return L.alias+'~'+k;}).join(' ')+' SUM( '+R.alias+'~'+cfg.sumField+' ) AS '+cfg.sumAs;
    var grpFields = cfg.groupBy.map(function(k){return L.alias+'~'+k;}).join(' ');
    var lines=[
      'SELECT '+selFields,
      '  FROM '+L.name+' AS '+L.alias,
      '  '+join+' '+R.name+' AS '+R.alias,
      '    ON '+onTxt,
      '  INTO TABLE lt_stat',
      '  GROUP BY '+grpFields+'.'
    ];
    var KW=new Set(['SELECT','SUM','AS','FROM','LEFT','OUTER','INNER','JOIN','ON','AND','INTO','TABLE','GROUP','BY']);
    $('javCode').innerHTML = lines.map(function(ln){
      return ln.replace(/[A-Za-z_][A-Za-z0-9_~]*/g,function(w){
        var bare=w.replace(/~.*/,''); // alias~field → 키워드 아님
        return (KW.has(w.toUpperCase()) && w.indexOf('~')<0) ? '<span class="tok-kw">'+w+'</span>' : w;
      }).replace(/'[^']*'/g,function(m){return '<span class="tok-str">'+m+'</span>';});
    }).join('\n');
  }

  /* ── 집계 결과 ── */
  function renderResult(){
    var html='';
    L.data.forEach(function(lrow){
      var ms=matchesFor(lrow);
      if(jtype==='INNER' && ms.length===0) return;   // INNER: 매칭 없으면 제외
      var booked=ms.reduce(function(s,r){return s+(Number(r[cfg.sumField])||0);},0);
      var emptyLeft = ms.length===0;  // LEFT에서만 도달
      var keyTxt = cfg.groupBy.map(function(k){
        var meta=L.cols.filter(function(c){return c.key===k;})[0];
        return (meta?meta.label:k)+' <b>'+esc(lrow[k])+'</b>';
      }).join(' · ');
      var chips = emptyLeft
        ? '<span class="bk-none">예매 없음 — LEFT라서 0으로 남음</span>'
        : ms.map(function(r){ return '<span class="bk-chip">'+esc(r.customer||r[cfg.onRight])+' '+esc(r[cfg.sumField])+'</span>'; }).join('');
      html += '<div class="jav-rrow'+(emptyLeft?' empty-left':'')+'">'+
        '<span class="jav-key">'+keyTxt+'</span>'+
        '<span class="jav-chips">'+chips+'</span>'+
        '<span class="jav-sum">'+cfg.sumAs+' = '+booked+'</span>'+
      '</div>';
    });
    $('javRes').innerHTML=html;
    postHeight();
  }

  function refresh(){ renderCode(); renderResult(); }

  /* ── 토글 ── */
  $('javToggle').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    jtype=b.dataset.j;
    $('javToggle').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});
    $('javHint').innerHTML = jtype==='LEFT'
      ? '🟡 <b>LEFT OUTER JOIN</b> — 예매가 하나도 없는 공연도 결과에 <b>남습니다</b>(booked 0). 빈 행 = 강조.'
      : '⚪ <b>INNER JOIN</b> — 매칭되는 예매가 있는 공연만 남습니다. 예매 0인 공연은 <b>사라집니다</b>.';
    refresh();
  });

  /* iframe 자동 높이 */
  function postHeight(){
    try{ var el=document.querySelector('.wrap');
      var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6;
      parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){}
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  renderSrc(); refresh();
})();
