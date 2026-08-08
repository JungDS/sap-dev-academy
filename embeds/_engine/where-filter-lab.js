// ===== where-filter-lab 엔진 JS — WHERE 연산자/와일드카드 실험실 (CH08-L05) =====
// 조건 칩(= <> < > <= >=, BETWEEN, LIKE, IN, IS NULL)을 AND/OR로 조합하고 NOT으로 뒤집으면
// 행별로 통과/제외와 사유를 즉시 보여 준다. 데이터·조건·컬럼은 window.WFL_CFG로 주입.
//   WFL_CFG = { table, itab, cols[], numeric{}, data[],
//               conds:[{id, group?, label, sql, field, type, val|lo/hi}] }
// (test는 문자열 표현식이 아니라 type+args로 선언 → 엔진이 평가; 게이팅: classic SQL 텍스트만 생성)
// type: eq · ne · lt · gt · le · ge · like · in · between · isnull
// group: 값이 있으면 그 칩 앞에 구분 라벨을 넣는다(칩이 많아질 때 묶음 표시).
// NULL 규약 — SQL과 같게: NULL은 어떤 비교에도 걸리지 않는다(IS NULL만 참).
(function(){
  var cfg = window.WFL_CFG || {};
  var COLS = cfg.cols || [];
  var NUM = cfg.numeric || {};
  var DATA = cfg.data || [];
  var TBL = cfg.table || 'spfli', ITAB = cfg.itab || 'gt_spfli';
  var CONDS = cfg.conds || [];
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var active={}, conn='AND', neg=false;

  /* 조건 평가 (선언형 spec) — 비교 연산자는 NULL을 항상 제외(SQL 3값 논리와 같은 결과) */
  function evalCond(c, row){
    var v=row[c.field];
    switch(c.type){
      case 'eq':  return v!=null && String(v)===String(c.val);
      case 'ne':  return v!=null && String(v)!==String(c.val);
      case 'lt':  return v!=null && Number(v)< Number(c.val);
      case 'gt':  return v!=null && Number(v)> Number(c.val);
      case 'le':  return v!=null && Number(v)<=Number(c.val);
      case 'ge':  return v!=null && Number(v)>=Number(c.val);
      case 'like':{ if(v==null) return false;
        var rx=new RegExp('^'+String(c.val).replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/%/g,'.*').replace(/_/g,'.')+'$','i');
        return rx.test(String(v)); }
      case 'in':  return v!=null && c.val.some(function(x){return String(x)===String(v);});
      case 'between': return v!=null && Number(v)>=Number(c.lo) && Number(v)<=Number(c.hi);
      case 'isnull': return v==null;
    }
    return true;
  }

  function activeConds(){ return CONDS.filter(function(c){return active[c.id];}); }

  /* classic SQL 텍스트 생성 */
  var KW=new Set('SELECT FROM INTO TABLE WHERE AND OR BETWEEN LIKE IN IS NULL'.split(' '));
  function hl(line){
    var out='', re=/('[^']*')|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_]*)|([^A-Za-z0-9_']+)/g, m;
    while((m=re.exec(line))!==null){
      if(m[1]) out+='<span class="tok-str">'+esc(m[1])+'</span>';
      else if(m[2]) out+='<span class="tok-num">'+esc(m[2])+'</span>';
      else if(m[3]) out+= KW.has(m[3].toUpperCase())?'<span class="tok-kw">'+esc(m[3])+'</span>':esc(m[3]);
      else out+=esc(m[0]);
    }
    return out;
  }
  function genCode(){
    var ac=activeConds();
    var lines=['<span class="tok-kw">SELECT</span> * <span class="tok-kw">FROM</span> '+TBL,
               '  <span class="tok-kw">INTO TABLE</span> '+ITAB];
    if(ac.length){
      // NOT을 켜면 조건 전체를 괄호로 묶어 뒤집는다(classic: 괄호는 앞뒤 공백 필요).
      var on = neg;
      lines.push('  <span class="tok-kw">WHERE</span> '+(on?'<span class="tok-kw">NOT</span> ( ':'')+hl(ac[0].sql));
      for(var i=1;i<ac.length;i++) lines.push('    '+(on?'    ':'')+'<span class="tok-kw">'+conn+'</span> '+hl(ac[i].sql));
      lines[lines.length-1]+=(on?' )':'')+'.';
    } else { lines[lines.length-1]+='.'; }
    return lines.join('\n');
  }

  function rowPass(row){
    var ac=activeConds();
    if(!ac.length) return {pass:true, fails:[], inner:true};
    var fails=ac.filter(function(c){return !evalCond(c,row);});
    var inner = conn==='AND' ? fails.length===0 : fails.length<ac.length;
    return {pass: neg ? !inner : inner, fails:fails, inner:inner};
  }

  function render(){
    $('code').innerHTML=genCode();
    var ac=activeConds();
    var passCount=0;
    var head='<thead><tr>'+COLS.map(function(c){return '<th>'+c.toUpperCase()+'</th>';}).join('')
      +'<th>결과</th><th>사유</th></tr></thead>';
    var body=DATA.map(function(r){
      var res=rowPass(r);
      if(res.pass) passCount++;
      var cells=COLS.map(function(c){
        var v=r[c];
        if(v==null) return '<td class="nul">(null)</td>';
        return '<td class="'+(NUM[c]?'num':'')+'">'+esc(v)+'</td>';
      }).join('');
      var reason;
      if(!ac.length) reason='<span class="reason ok">조건 없음 → 전체</span>';
      else if(neg) reason = res.pass
        ? '<span class="reason ok">괄호 안이 거짓 → NOT이 뒤집어 통과</span>'
        : '<span class="reason">괄호 안이 참 → NOT이 뒤집어 제외</span>';
      else if(res.pass) reason='<span class="reason ok">통과</span>';
      else if(conn==='AND') reason='<span class="reason">탈락: '+res.fails.map(function(c){return c.label;}).join(', ')+'</span>';
      else reason='<span class="reason">어떤 조건도 통과 못 함</span>';
      return '<tr class="'+(res.pass?'pass':'fail')+'">'+cells
        +'<td><span class="bdg '+(res.pass?'pass':'fail')+'">'+(res.pass?'통과':'제외')+'</span></td>'
        +'<td>'+reason+'</td></tr>';
    }).join('');
    $('grid').innerHTML='<table class="dt">'+head+'<tbody>'+body+'</tbody></table>';
    $('cnt').innerHTML='결과 <b>'+passCount+'</b> / '+DATA.length+'행';
    postHeight();
  }

  /* 칩 생성 — cond.group이 있으면 그 앞에 묶음 라벨(.connrow__lbl 재사용) */
  var cw=$('chips');
  CONDS.forEach(function(c){
    if(c.group){ var g=document.createElement('span'); g.className='connrow__lbl'; g.textContent=c.group; cw.appendChild(g); }
    var b=document.createElement('button'); b.type='button'; b.className='chip'; b.dataset.id=c.id; b.textContent=c.label;
    cw.appendChild(b);
  });
  cw.addEventListener('click',function(e){
    var b=e.target.closest('.chip'); if(!b) return;
    var id=b.dataset.id; active[id]=!active[id]; b.classList.toggle('on',active[id]); render();
  });
  $('connTgl').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    conn=b.dataset.c;
    $('connTgl').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});
    render();
  });
  var notTgl=$('notTgl');
  if(notTgl) notTgl.addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    neg=b.dataset.n==='1';
    notTgl.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});
    render();
  });
  $('clr').addEventListener('click',function(){
    active={}; cw.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on');});
    neg=false;
    if(notTgl) notTgl.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x.dataset.n==='0');});
    render();
  });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
