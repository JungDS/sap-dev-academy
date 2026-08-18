/* type-conversion-lab 엔진 — CH18-L06 전용.
   값 하나를 CONV i / CONV string / EXACT i 로 변환해 결과·위험을 보여 준다.
   CONV=손실(반올림) 허용·비숫자는 CONV도 예외(CX_SY_CONVERSION_NO_NUMBER) / EXACT=손실까지 예외(잡는 법은 Chapter 21 · Exception Class 링크로 안내). 게이팅: modern 변환 표현식 시연만.
   결과 객체: msg=텍스트(esc 처리) · after=엔진 내 신뢰 HTML(레슨 링크, esc 없이 삽입).
   골격 계약(HTML): [data-tcl] · #tclVal · [data-op] · #tclOut. 높이: _autoheight.js. */
(function () {
  var root = document.querySelector('[data-tcl]'); if (!root) return;
  var inp = root.querySelector('#tclVal');
  var out = root.querySelector('#tclOut');

  function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}

  function convI(v){
    var t = v.trim();
    if (!/^[+-]?\d+(\.\d+)?$/.test(t)) return { ok:false, exc:true, msg:'숫자가 아니라 CONV도 예외(CX_SY_CONVERSION_NO_NUMBER)를 냅니다. CONV가 관대한 건 \'3.7\' 반올림 같은 손실 허용뿐, 아예 불가능한 변환은 CONV·EXACT 모두 예외입니다.', after:'예외를 붙잡는 법은 <a href="../../docs/abap/pages/CH21-L06.html" target="_top">Chapter 21 · Exception Class</a>에서 배웁니다.' };
    var n = Math.round(parseFloat(t));
    var rounded = parseFloat(t) !== Math.trunc(parseFloat(t));
    return { ok:true, val:String(n), note: rounded ? '소수는 반올림됩니다(손실 있음).' : '' };
  }
  function exactI(v){
    var t = v.trim();
    if (!/^[+-]?\d+(\.0+)?$/.test(t)) {
      if (/^[+-]?\d+(\.\d+)?$/.test(t)) return { ok:false, exc:true, msg:'손실이 발생해 예외가 납니다(소수 → 정수).', after:'예외를 붙잡는 법은 <a href="../../docs/abap/pages/CH21-L06.html" target="_top">Chapter 21 · Exception Class</a>에서 배웁니다.' };
      return { ok:false, exc:true, msg:'숫자가 아니라 예외(CX_SY_CONVERSION_NO_NUMBER)가 납니다.' };
    }
    return { ok:true, val:String(parseInt(t,10)), note:'손실 없이 딱 맞아 통과.' };
  }

  function run(op){
    var v = inp.value;
    var code, r, cls, body;
    if (op === 'conv_i'){ code = "CONV i( '"+esc(v)+"' )"; r = convI(v); }
    else if (op === 'conv_s'){ code = "CONV string( '"+esc(v)+"' )"; r = { ok:true, val:"'"+v+"'", note:'문자열 변환은 거의 항상 안전합니다.' }; }
    else { code = "EXACT i( '"+esc(v)+"' )"; r = exactI(v); }

    if (r.ok){ cls='ok'; body = '<b>결과:</b> <code class="tcl-res">'+esc(r.val)+'</code>' + (r.note?'<span class="tcl-note">'+esc(r.note)+'</span>':''); }
    else { cls = r.exc?'exc':'bad'; body = '<b>'+(r.exc?'예외':'변환 불가')+':</b> '+esc(r.msg)+(r.after?' '+r.after:''); }
    out.className = 'tcl-out '+cls;
    out.innerHTML = '<div class="tcl-code">'+code+'</div>'+body;
  }

  root.addEventListener('click', function(e){ var b=e.target.closest('[data-op]'); if(b) run(b.getAttribute('data-op')); });
  root.addEventListener('keydown', function(e){ if(e.target===inp && e.key==='Enter') run('conv_i'); });
  out.className='tcl-out'; out.innerHTML='값을 넣고 변환 버튼을 눌러 보세요. <code>\'12\'</code>·<code>\'12.7\'</code>·<code>\'12A\'</code>·<code>\'120000\'</code>를 각각 시도해 CONV와 EXACT 차이를 보세요.';
})();
