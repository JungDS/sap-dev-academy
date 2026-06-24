(function(){
  var $=function(id){return document.getElementById(id);};
  var st={ val:"'정훈영'", just:'', width:16, color:0, intens:false, inverse:false, uline:false, skip:false };

  /* COLOR n → 배경/글자 (SAP 리스트 색 근사) */
  var COLORS={
    0:{bg:'transparent',fg:'#1c2233',name:''},
    1:{bg:'#dfe7f0',fg:'#2a3a52',name:'HEADING'},
    3:{bg:'#fff3bf',fg:'#7a5a00',name:'TOTAL'},
    4:{bg:'#d0ebff',fg:'#1457a8',name:'KEY'},
    5:{bg:'#d3f9d8',fg:'#1b7a36',name:'POSITIVE'},
    6:{bg:'#ffe3e3',fg:'#c92a2a',name:'NEGATIVE'}
  };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function rawVal(){ var m=st.val.match(/^'(.*)'$/); return m?m[1]:String(st.val); }

  /* 폭 안에서 정렬 + 색/강조 적용한 출력 필드 */
  function fieldHtml(){
    var text=rawVal(), w=st.width;
    if(text.length>w) text=text.slice(0,w);
    var pad=w-text.length, left=0, right=0;
    if(st.just==='RIGHT-JUSTIFIED'){ left=pad; }
    else if(st.just==='CENTERED'){ left=Math.floor(pad/2); right=pad-left; }
    else { right=pad; }            // 기본/LEFT = 왼쪽 정렬
    var inner=' '.repeat(left)+text+' '.repeat(right);
    var c=COLORS[st.color]||COLORS[0];
    var style='';
    if(st.color){ style+='background:'+c.bg+';color:'+c.fg+';'; }
    if(st.inverse && st.color){ style='background:'+c.fg+';color:'+c.bg+';'; }
    if(st.intens){ style+='font-weight:800;'; }
    return '<span class="swatch" style="'+style+'">'+esc(inner).replace(/ /g,'&nbsp;')+'</span>';
  }

  function ruler(){
    var w=st.width, s=''; for(var i=1;i<=w;i++){ s+=(i%5===0)?String((i/5)%10):'·'; }
    return s;   // 눈금만 — 라벨은 별도 줄, 출력과 시작 위치 정렬
  }

  function render(){
    // 코드
    var lines=['REPORT zhello.',''];
    if(st.skip) lines.push('SKIP.');
    if(st.uline) lines.push('ULINE.');
    var w='WRITE: /';
    var opts='';
    if(st.color){ opts+=' COLOR '+st.color; }
    if(st.intens){ opts+=' INTENSIFIED'; }
    if(st.inverse){ opts+=' INVERSE'; }
    // 폭 지정: WRITE: /(len) value  +  정렬
    w='WRITE: /('+st.width+') '+st.val + (st.just? ' '+st.just : '') + opts + '.';
    lines.push(w);
    $('code').innerHTML=lines.map(function(l){
      return l.replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/\b(REPORT|WRITE|SKIP|ULINE|COLOR|INTENSIFIED|INVERSE|LEFT-JUSTIFIED|CENTERED|RIGHT-JUSTIFIED)\b/g,'<span class="tok-kw">$1</span>')
        .replace(/('[^']*')/g,'<span class="tok-str">$1</span>')
        .replace(/(?<![\w>])(\d+)(?![\w<])/g,'<span class="tok-num">$1</span>');
    }).join('\n');
    $('codeGut').textContent=lines.map(function(_,i){return i+1;}).join('\n');

    // 출력 — 눈금 라벨(별도 줄) + 눈금(출력과 칸 정렬)
    var out='<div class="ruler-lbl">폭 '+st.width+'</div>';
    out+='<div class="ruler-scale">'+ruler()+'</div>';
    if(st.skip) out+='<div class="listline">&nbsp;</div>';
    if(st.uline) out+='<div class="listline uline">'+'─'.repeat(st.width)+'</div>';
    out+='<div class="listline">'+fieldHtml()+'</div>';
    $('screen').innerHTML=out;
    postHeight();
  }

  /* 바인딩 */
  $('val').addEventListener('change',function(e){ st.val=e.target.value; render(); });
  $('just').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return;
    st.just=b.dataset.j; $('just').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);}); render(); });
  $('width').addEventListener('input',function(e){ st.width=+e.target.value; $('wlbl').textContent=e.target.value; render(); });
  $('color').addEventListener('change',function(e){ st.color=+e.target.value; render(); });
  document.querySelectorAll('.tg').forEach(function(tg){
    tg.querySelector('input').addEventListener('change',function(e){
      st[tg.dataset.tgl]=e.target.checked; tg.classList.toggle('on',e.target.checked); render();
    });
  });

  /* 예제 */
  var EX = (window.__SDA_CFG__||{}).presets || [];
  function applyState(s){
    st=Object.assign({},s);
    $('val').value=st.val; $('width').value=st.width; $('wlbl').textContent=st.width; $('color').value=st.color;
    $('just').querySelectorAll('button').forEach(function(b){ b.classList.toggle('on', b.dataset.j===st.just); });
    document.querySelectorAll('.tg').forEach(function(tg){ var on=st[tg.dataset.tgl]; tg.querySelector('input').checked=on; tg.classList.toggle('on',on); });
    render();
  }
  $('presets').addEventListener('click',function(e){ var c=e.target.closest('.chip'); if(!c) return;
    $('presets').querySelectorAll('.chip').forEach(function(x){x.classList.toggle('on',x===c);});
    applyState(EX[+c.dataset.ex]);
  });

  function postHeight(){
    try{ var el=document.querySelector('.wrap');
      var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6;
      parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){}
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  applyState(EX[0]);
})();
