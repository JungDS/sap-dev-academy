// ===== constant-circle-sim 엔진 JS — 상수 pi 원 계산기 + 변수↔상수 보호 데모 =====
// (1) 반지름·pi 정밀도를 바꾸면 지름/둘레/넓이가 실시간 계산(상수 gc_pi 재사용·정밀도 체감)
// (2) pi를 '변수'/'상수'로 두고 'pi=3 덮어쓰기' → 변수는 조용히 틀어지고, 상수는 문법 오류로 보호됨.
// ABAP을 실제 실행하지 않고 결과만 시뮬레이션. 단일 사용(CH02-L05).
(function(){
  var root = document.querySelector('[data-circlesim]'); if(!root) return;
  var $ = function(s){ return root.querySelector(s); };
  var REAL_PI = 3.1415926;
  var st = { piStr:'3.1415926', radius:5, mode:'const', acted:false };

  function fmt(n){ return (Math.round(n*100)/100).toFixed(2); }
  function piVal(){ return parseFloat(st.piStr); }
  function rad(){ var r = parseFloat(st.radius); return isNaN(r)?0:r; }

  // 작은 ABAP 하이라이터
  function hl(code){
    return code.split('\n').map(function(line){
      if(/^\s*"/.test(line)) return '<span class="tok-com">'+esc(line)+'</span>';
      var out='', re=/('[^']*'?)|("[^\n]*$)|([A-Za-z_][A-Za-z0-9_]*)|([^A-Za-z0-9_']+)/g, m;
      var KW=/^(CONSTANTS|DATA|TYPE|VALUE|LENGTH|DECIMALS)$/i;
      while((m=re.exec(line))!==null){
        if(m[1]) out+='<span class="tok-str">'+esc(m[1])+'</span>';
        else if(m[2]) out+='<span class="tok-com">'+esc(m[2])+'</span>';
        else if(m[3]) out+= KW.test(m[3]) ? '<span class="tok-kw">'+esc(m[3])+'</span>' : esc(m[3]);
        else out+=esc(m[0]);
      }
      return out;
    }).join('\n');
  }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function renderCalc(){
    var r=rad(), p=piVal();
    $('[data-d]').textContent   = fmt(2*r);
    $('[data-c]').textContent   = fmt(2*p*r);
    $('[data-a]').textContent   = fmt(p*r*r);
    var code =
      "CONSTANTS gc_pi TYPE p LENGTH 8 DECIMALS 7 VALUE '"+st.piStr+"'.\n" +
      "DATA: lv_r    TYPE p LENGTH 8 DECIMALS 2 VALUE '"+fmt(r)+"',\n" +
      "      lv_circ TYPE p LENGTH 8 DECIMALS 2,\n" +
      "      lv_area TYPE p LENGTH 8 DECIMALS 2.\n" +
      "\n" +
      "lv_circ = gc_pi * lv_r * 2.        \" 둘레 = "+fmt(2*p*r)+"\n" +
      "lv_area = gc_pi * lv_r * lv_r.     \" 넓이 = "+fmt(p*r*r);
    $('[data-code]').innerHTML = hl(code);
  }

  function renderGuard(){
    var r=rad();
    var correct = REAL_PI*r*r;
    var box = $('[data-out]');
    if(!st.acted){
      box.className='cc-out idle';
      box.innerHTML = 'pi를 <b>'+(st.mode==='const'?'상수(gc_pi)':'변수(lv_pi)')+'</b>로 뒀다. 아래 버튼으로 '+
        '누군가 실수로 <code>pi = 3</code> 으로 덮어쓰면 어떻게 되는지 보자. (현재 정상 넓이 = '+fmt(correct)+')';
      return;
    }
    if(st.mode==='const'){
      box.className='cc-out ok';
      box.innerHTML =
        '<span class="cc-out__code">gc_pi = 3.   ✗ <b>문법 오류 — 컴파일 거부</b></span>'+
        '상수는 재대입이 <b>아예 막힌다</b>. pi는 <b>3.1415926</b> 그대로 → 넓이 <span class="big">'+fmt(correct)+'</span> <b>안전 ✓</b>';
    } else {
      var wrong = 3*r*r;
      box.className='cc-out bad';
      box.innerHTML =
        '<span class="cc-out__code">lv_pi = 3.   (오류 없음 — 그냥 통과)</span>'+
        '변수는 막지 못한다. pi가 <b>3</b>이 되어 넓이가 '+
        '<span class="cc-strike">'+fmt(correct)+'</span> → <span class="big">'+fmt(wrong)+'</span> 로 '+
        '<b>조용히 틀어진다 ✗</b>';
    }
  }

  function render(){ renderCalc(); renderGuard(); postHeight(); }

  // 이벤트
  $('[data-pi-seg]').addEventListener('click', function(e){
    var b=e.target.closest('button'); if(!b) return;
    st.piStr=b.dataset.pi;
    $('[data-pi-seg]').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});
    render();
  });
  $('[data-radius]').addEventListener('input', function(e){ st.radius=e.target.value; render(); });
  $('[data-mode-seg]').addEventListener('click', function(e){
    var b=e.target.closest('button'); if(!b) return;
    st.mode=b.dataset.mode; st.acted=false;
    $('[data-mode-seg]').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});
    renderGuard(); postHeight();
  });
  $('[data-act]').addEventListener('click', function(){ st.acted=true; renderGuard(); postHeight(); });
  $('[data-greset]').addEventListener('click', function(){ st.acted=false; renderGuard(); postHeight(); });

  function postHeight(){
    try{ var el=document.querySelector('.wrap');
      var h=Math.ceil(el?el.getBoundingClientRect().height:document.body.scrollHeight)+6;
      parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){}
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  render();
})();
