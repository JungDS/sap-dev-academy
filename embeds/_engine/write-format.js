/* write-format — WRITE 서식 플레이그라운드 엔진 (CH01-L05-S01 단일사용 · 데이터=window.__SDA_CFG__.presets)
   옵션을 고르면 ① ABAP 코드가 만들어지고 ② 가상 리스트에 그 결과가 그려진다.

   섹션 인덱스
   1) 데이터 — VALUES(값 카탈로그: 코드·타입·선언문) · CURR(통화별 소수 자리) · COLORS(리스트 색)
   2) 서식 계산 — valueText(NO-ZERO·DECIMALS·CURRENCY·날짜) · group(천단위) · fmtDate · fieldCell(폭·정렬·오버플로)
   3) 표시 — swatchStyle(COLOR·INTENSIFIED·INVERSE) · tok(코드 하이라이트) · render · outNote/tip
   4) 상태 — normalize(값 종류에 안 맞는 옵션 정리) · syncUI · 바인딩 · 예제 프리셋

   본문(CH01-L05)과 맞춘 규칙
   - 폭 초과: **숫자(int·packed)는 `*`로 채움**, 문자·NUMC·날짜는 뒤가 잘림(본문 "잘리거나 *로 표시된다").
   - NO-ZERO: TYPE n 값의 앞 0 → 공백(값이 전부 0이면 전부 공백).
   - CURRENCY: 저장값(소수 2자리)을 **통화의 소수 자리**로 다시 읽는다 → KRW·JPY 0자리, USD·EUR 2자리.
   - 날짜: 형식 애디션을 주면 **그 순서 그대로**, 안 주면 사용자 설정 형식(여기선 YYYY.MM.DD 가정).
   - INVERSE는 COLOR가 없어도 전경/배경을 뒤집는다(기본색 = 잉크/서피스 토큰) → 헛체험 방지.
   ⚠️ 색은 인라인 style로 들어가므로 다크 대응이 필요한 값은 var(--ink)·var(--surface) 토큰을 쓴다. */
(function(){
  var $=function(id){return document.getElementById(id);};
  var st={ val:'name', just:'', width:16, color:0, intens:false, inverse:false, uline:false, skip:false,
           nozero:false, decimals:'', currency:'', datefmt:'' };

  /* ── 1) 데이터 ─────────────────────────────────────────── */
  /* kind: char(문자) · int(정수 리터럴) · numc(TYPE n) · packed(TYPE p) · date(TYPE d) */
  var VALUES={
    name : { code:"'정훈영'", kind:'char',   text:'정훈영' },
    num  : { code:'1250000',  kind:'int',    num:1250000 },
    total: { code:"'합 계'",  kind:'char',   text:'합 계' },
    qty  : { code:'gv_qty',   kind:'numc',   text:'0001',
             decl:"DATA gv_qty TYPE n LENGTH 4 VALUE '0001'." },
    amt  : { code:'gv_amt',   kind:'packed', num:100, dec:2,
             decl:"DATA gv_amt TYPE p LENGTH 8 DECIMALS 2 VALUE '100.00'." },
    date : { code:'sy-datum', kind:'date' }
  };
  var CURR={ KRW:0, JPY:0, USD:2, EUR:2 };      // 통화별 표시 소수 자리

  /* COLOR n → 배경/글자 (SAP 리스트 색 근사) */
  var COLORS={
    0:{bg:'transparent',fg:'#1c2233',name:''},
    1:{bg:'#dfe7f0',fg:'#2a3a52',name:'HEADING'},
    3:{bg:'#fff3bf',fg:'#7a5a00',name:'TOTAL'},
    4:{bg:'#d0ebff',fg:'#1457a8',name:'KEY'},
    5:{bg:'#d3f9d8',fg:'#1b7a36',name:'POSITIVE'},
    6:{bg:'#ffe3e3',fg:'#c92a2a',name:'NEGATIVE'}
  };

  var TODAY=new Date();
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function cur(){ return VALUES[st.val]; }
  /* 값 종류별로 켜지는 옵션 */
  function applies(){
    var k=cur().kind;
    return { nozero:k==='numc', decimals:k==='packed', currency:k==='packed', datefmt:k==='date' };
  }

  /* ── 2) 서식 계산 ──────────────────────────────────────── */
  function pad2(n){ return (n<10?'0':'')+n; }
  function group(s){                                   // 천단위 구분(정수부만)
    var neg = s.charAt(0)==='-'; if(neg) s=s.slice(1);
    var p=s.split('.');
    p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg?'-':'')+p.join('.');
  }
  function ymd(){ return String(TODAY.getFullYear())+pad2(TODAY.getMonth()+1)+pad2(TODAY.getDate()); }
  function fmtDate(f){
    var s=ymd(), Y=s.slice(0,4), y=s.slice(2,4), M=s.slice(4,6), D=s.slice(6,8);
    if(f==='DD/MM/YY')   return D+'/'+M+'/'+y;
    if(f==='DD/MM/YYYY') return D+'/'+M+'/'+Y;
    if(f==='MM/DD/YYYY') return M+'/'+D+'/'+Y;
    if(f==='YYMMDD')     return y+M+D;
    return Y+'.'+M+'.'+D;                              // 애디션 없음 = 사용자 설정 형식(가정)
  }
  function noZero(t){                                  // 앞의 의미 없는 0 → 공백
    if(/^0+$/.test(t)) return new Array(t.length+1).join(' ');
    return t.replace(/^0+/, function(m){ return new Array(m.length+1).join(' '); });
  }
  function valueText(){
    var v=cur();
    if(v.kind==='char') return v.text;
    if(v.kind==='int')  return String(v.num);
    if(v.kind==='numc') return st.nozero ? noZero(v.text) : v.text;
    if(v.kind==='date') return fmtDate(st.datefmt);
    /* packed — CURRENCY가 있으면 통화 소수 자리로, 없으면 DECIMALS(없으면 필드 자리수) */
    if(st.currency){
      var cd=CURR[st.currency];
      var raw=Math.round(v.num*Math.pow(10,v.dec));     // 저장 정수(소수 2자리 기준) = 10000
      return group((raw/Math.pow(10,cd)).toFixed(cd));
    }
    var d = st.decimals==='' ? v.dec : +st.decimals;
    return group(v.num.toFixed(d));
  }
  /* 정렬 애디션을 안 쓰면 **타입이 정렬을 정한다**(keyword doc ABENWRITE_FORMATS "Predefined Alignment"):
     수치형(i·p·f 등) = 오른쪽 · 문자형(c·n·string) = 왼쪽 · 날짜/시간형(d·t) = 왼쪽.
     ⚠️ n(NUMC)은 이름과 달리 **문자형**이라 왼쪽이다(ABENBUILTIN_TYPES_CHARACTER). */
  function defaultJust(){
    var k=cur().kind;
    return (k==='int'||k==='packed') ? 'RIGHT-JUSTIFIED' : 'LEFT-JUSTIFIED';
  }
  /* 폭 안에 넣기 — 넘치면 숫자는 `*`로 채우고(SAP 동작), 문자·날짜는 뒤가 잘린다 */
  function fieldCell(){
    var t=valueText(), w=st.width, k=cur().kind, over=false, star=false;
    if(t.length>w){
      over=true;
      if(k==='int' || k==='packed'){ t=new Array(w+1).join('*'); star=true; }
      else t=t.slice(0,w);
    }
    var just = st.just || defaultJust();                // 명시한 정렬 옵션이 항상 우선
    var pad=w-t.length, left=0, right=0;
    if(just==='RIGHT-JUSTIFIED'){ left=pad; }
    else if(just==='CENTERED'){ left=Math.floor(pad/2); right=pad-left; }
    else { right=pad; }                                 // LEFT-JUSTIFIED
    return { text:t, over:over, star:star, just:just,
             inner:new Array(left+1).join(' ')+t+new Array(right+1).join(' ') };
  }

  /* ── 3) 표시 ───────────────────────────────────────────── */
  /* COLOR·INTENSIFIED·INVERSE → 인라인 스타일. COLOR가 없어도 INVERSE는 전경/배경을 뒤집는다. */
  function swatchStyle(){
    var c=COLORS[st.color]||COLORS[0], style='';
    var bg = st.color ? c.bg : 'var(--surface)';
    var fg = st.color ? c.fg : 'var(--ink)';
    if(st.inverse){ style+='background:'+fg+';color:'+bg+';'; }
    else if(st.color){ style+='background:'+bg+';color:'+fg+';'; }
    if(st.intens){ style+='font-weight:800;'; }
    return style;
  }
  function fieldHtml(cell){
    return '<span class="swatch" style="'+swatchStyle()+'">'+esc(cell.inner).replace(/ /g,'&nbsp;')+'</span>';
  }
  function ruler(){
    var w=st.width, s=''; for(var i=1;i<=w;i++){ s+=(i%5===0)?String((i/5)%10):'·'; }
    return s;   // 눈금만 — 라벨은 별도 줄, 출력과 시작 위치 정렬
  }
  /* 코드 하이라이트 — 한 번에 훑어 문자열 안 숫자가 따로 물들지 않게 한다 */
  function tok(line){
    return line.replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/('[^']*')|(\b(?:REPORT|WRITE|DATA|TYPE|LENGTH|DECIMALS|VALUE|SKIP|ULINE|COLOR|INTENSIFIED|INVERSE|NO-ZERO|CURRENCY|LEFT-JUSTIFIED|CENTERED|RIGHT-JUSTIFIED)\b|DD\/MM\/YYYY|MM\/DD\/YYYY|DD\/MM\/YY|YYMMDD)|(\d+)/g,
        function(m, str, kw, num){
          if(str) return '<span class="tok-str">'+str+'</span>';
          if(kw)  return '<span class="tok-kw">'+kw+'</span>';
          return '<span class="tok-num">'+num+'</span>';
        });
  }

  function codeLines(){
    var v=cur(), lines=['REPORT zhello.',''];
    if(v.decl){ lines.push(v.decl); lines.push(''); }
    if(st.skip) lines.push('SKIP.');
    if(st.uline) lines.push('ULINE.');
    var opts='';
    if(st.just) opts+=' '+st.just;
    if(st.nozero)    opts+=' NO-ZERO';
    if(st.decimals!=='') opts+=' DECIMALS '+st.decimals;
    if(st.currency)  opts+=" CURRENCY '"+st.currency+"'";
    if(st.datefmt)   opts+=' '+st.datefmt;
    if(st.color)     opts+=' COLOR '+st.color;
    if(st.intens)    opts+=' INTENSIFIED';
    if(st.inverse)   opts+=' INVERSE';
    lines.push('WRITE: /('+st.width+') '+v.code+opts+'.');
    return lines;
  }

  /* 출력 아래 한 줄 안내 — 왜 이렇게 보이는지(오버플로·통화·NO-ZERO·날짜) */
  function outNote(cell){
    var v=cur(), msgs=[];
    if(cell.star){
      msgs.push('⚠ <b>폭(len)이 값보다 좁습니다</b> — 숫자는 잘리는 대신 <code>*</code>로 채워져 "값이 안 들어갔다"고 알려 줍니다. 폭을 넉넉히 주세요.');
    } else if(cell.over){
      msgs.push('⚠ <b>폭(len)이 값보다 좁습니다</b> — 문자 값은 <b>뒤가 잘린 채</b> 아무 경고 없이 출력됩니다. 그래서 더 위험해요.');
    }
    if(v.kind==='packed' && st.currency){
      msgs.push('💱 저장값 <code>100.00</code>은 내부적으로 <code>10000</code>(소수 2자리)입니다. <code>'+st.currency
        +'</code>의 소수 자리가 <b>'+CURR[st.currency]+'</b>이라 같은 값이 <code>'+esc(cell.text.trim())+'</code>으로 보입니다.');
    } else if(v.kind==='numc' && st.nozero){
      msgs.push('🔢 <code>0001</code>의 앞 <b>0</b>이 공백으로 바뀌었습니다(값 자체는 그대로).');
    } else if(v.kind==='date'){
      msgs.push('📅 내부값 <code>'+ymd()+'</code> → '
        + (st.datefmt ? '<code>'+st.datefmt+'</code> 형식은 <b>적은 순서 그대로</b> 나옵니다.'
                      : '형식을 지정하지 않으면 <b>사용자 설정 형식</b>을 따릅니다(여기선 YYYY.MM.DD 가정).'));
    }
    $('outnote').innerHTML = msgs.length ? msgs.map(function(m){ return '<div class="ol">'+m+'</div>'; }).join('') : '';
  }

  /* 어떤 옵션이 이 값에 붙는지 + 정렬 '기본'이 무엇으로 정해지는지 안내 */
  function tipText(){
    var k=cur().kind, opt;
    if(k==='numc')        opt='이 값은 <code>TYPE n</code>이라 <b>NO-ZERO</b>가 켜집니다.';
    else if(k==='packed') opt='이 값은 <code>TYPE p</code>(소수 2자리)라 <b>DECIMALS·CURRENCY</b>가 켜집니다.';
    else if(k==='date')   opt='이 값은 날짜라 <b>날짜 형식</b>이 켜집니다.';
    else                  opt='텍스트·정수 리터럴에는 숫자·날짜 옵션이 붙지 않습니다. <code>gv_qty</code>·<code>gv_amt</code>·<code>sy-datum</code>을 골라 보세요.';
    var right = defaultJust()==='RIGHT-JUSTIFIED';
    var why = right ? '수를 담는 타입이라' : (k==='date' ? '날짜는 문자처럼 다뤄서' : '글자를 담는 타입이라');
    return opt + ' 정렬 <b>기본</b>은 ' + why + ' <b>' + (right?'오른쪽':'왼쪽') + '</b>입니다.';
  }

  function render(){
    var lines=codeLines();
    $('code').innerHTML=lines.map(tok).join('\n');
    $('codeGut').textContent=lines.map(function(_,i){return i+1;}).join('\n');

    var cell=fieldCell();
    var out='<div class="ruler-lbl">폭 '+st.width+'</div>';
    out+='<div class="ruler-scale">'+ruler()+'</div>';
    if(st.skip) out+='<div class="listline">&nbsp;</div>';
    if(st.uline) out+='<div class="listline uline">'+new Array(st.width+1).join('─')+'</div>';
    out+='<div class="listline">'+fieldHtml(cell)+'</div>';
    $('screen').innerHTML=out;

    outNote(cell);
    $('tip').innerHTML=tipText();
    var isAdvance = !!cur().decl || cur().kind==='date';   // 변수·시스템 필드 = R15 L2(선행 사용)
    $('advTip').hidden = !isAdvance;
    postHeight();
  }

  /* ── 4) 상태 ───────────────────────────────────────────── */
  /* 값 종류에 안 맞는 옵션은 꺼 둔다 — 켜 봐야 코드에만 남고 효과가 없으면 헛체험이 된다 */
  function normalize(){
    var a=applies();
    if(!a.nozero)   st.nozero=false;
    if(!a.decimals) st.decimals='';
    if(!a.currency) st.currency='';
    if(!a.datefmt)  st.datefmt='';
    if(st.currency) st.decimals='';            // CURRENCY가 자리수를 정한다 → DECIMALS와 겹치지 않게
  }
  function syncUI(){
    var a=applies();
    $('val').value=st.val;
    $('width').value=st.width; $('wlbl').textContent=st.width;
    $('color').value=st.color;
    $('decimals').value=st.decimals; $('currency').value=st.currency; $('datefmt').value=st.datefmt;
    $('decimals').disabled=!a.decimals; $('currency').disabled=!a.currency; $('datefmt').disabled=!a.datefmt;
    $('tgNozero').classList.toggle('off', !a.nozero);
    $('tgNozero').querySelector('input').disabled=!a.nozero;
    $('just').querySelectorAll('button').forEach(function(b){ b.classList.toggle('on', b.dataset.j===st.just); });
    document.querySelectorAll('.tg').forEach(function(tg){
      var on=!!st[tg.dataset.tgl];
      tg.querySelector('input').checked=on; tg.classList.toggle('on',on);
    });
  }
  function update(){ normalize(); syncUI(); render(); }

  /* 바인딩 */
  $('val').addEventListener('change',function(e){ st.val=e.target.value; update(); });
  $('just').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return;
    st.just=b.dataset.j; update(); });
  $('width').addEventListener('input',function(e){ st.width=+e.target.value; update(); });
  $('color').addEventListener('change',function(e){ st.color=+e.target.value; update(); });
  $('decimals').addEventListener('change',function(e){ st.decimals=e.target.value; update(); });
  $('currency').addEventListener('change',function(e){ st.currency=e.target.value; update(); });
  $('datefmt').addEventListener('change',function(e){ st.datefmt=e.target.value; update(); });
  document.querySelectorAll('.tg').forEach(function(tg){
    tg.querySelector('input').addEventListener('change',function(e){
      st[tg.dataset.tgl]=e.target.checked; update();
    });
  });

  /* 예제 */
  var EX = (window.__SDA_CFG__||{}).presets || [];
  function applyState(s){ st=Object.assign({},st,s); update(); }
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

  applyState(EX[0]||{});
})();
