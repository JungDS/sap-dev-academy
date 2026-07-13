/* let-reader 엔진 — CH18-L09 전용.
   LET 보조값이 '먼저 한 번' 계산되고 IN 뒤에서 그 이름으로 결과가 만들어지는 순서를 시연.
   COND 탭: LET lv_remaining 하나로 WHEN들이 읽힘 / REDUCE 탭: LET lv_price(보조) vs INIT sum(누적) 구분.
   게이팅: modern expression 독해 시연만. 골격 계약(HTML): [data-lr] · [data-tab] · #lrCap · #lrRes · #lrView. 높이: _autoheight.js. */
(function () {
  var root = document.querySelector('[data-lr]'); if (!root) return;
  var cap = root.querySelector('#lrCap');
  var res = root.querySelector('#lrRes');
  var view = root.querySelector('#lrView');
  var tab = 'cond';

  function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
  function n(el,d){var v=parseInt(el.value,10);return isNaN(v)?d:v;}

  function render(){
    var capacity = n(cap,100), reserved = n(res,0);
    if (tab === 'cond'){
      var remaining = capacity - reserved;
      var branch, result;
      if (remaining <= 0){ branch='WHEN lv_remaining = 0'; result='매진'; }
      else if (remaining < 10){ branch='WHEN lv_remaining < 10'; result='마감 임박: '+remaining+'석'; }
      else { branch='ELSE'; result='예매 가능: '+remaining+'석'; }
      view.innerHTML =
        '<pre class="lr-pre">DATA(lv_status) = COND string(\n'+
        '  <span class="lr-let">LET lv_remaining = lv_capacity - lv_reserved IN</span>\n'+
        '  WHEN <span class="lr-h">lv_remaining</span> = 0  THEN \'매진\'\n'+
        '  WHEN <span class="lr-h">lv_remaining</span> < 10 THEN |마감 임박: { <span class="lr-h">lv_remaining</span> }석|\n'+
        '  ELSE                        |예매 가능: { <span class="lr-h">lv_remaining</span> }석| ).</pre>'+
        '<div class="lr-steps">'+
        '<div class="lr-step let"><b>① LET 먼저</b> <code><span class="lr-h">lv_remaining</span> = '+capacity+' − '+reserved+' = '+remaining+'</code> <small>(한 번만 계산)</small></div>'+
        '<div class="lr-step in"><b>② IN 이후</b> 선택된 가지 <code>'+esc(branch)+'</code> → 결과 <code class="lr-res">'+esc(result)+'</code></div>'+
        '</div>';
    } else {
      var seats=[2,4,1], price=10000, sum=0, rows=[];
      seats.forEach(function(s){ sum += s*price; rows.push('sum = '+ (sum-s*price) +' + '+s+'×<span class="lr-h2">'+price+'</span> = <b>'+sum+'</b>'); });
      view.innerHTML =
        '<pre class="lr-pre">DATA(lv_total) = REDUCE i(\n'+
        '  <span class="lr-let">LET <span class="lr-h2">lv_price</span> = 10000 IN</span>\n'+
        '  <span class="lr-let2">INIT sum = 0</span>\n'+
        '  FOR ls_book IN lt_booking\n'+
        '  NEXT sum = sum + ls_book-seats * <span class="lr-h2">lv_price</span> ).</pre>'+
        '<div class="lr-steps">'+
        '<div class="lr-step let"><b>보조값</b> <code><span class="lr-h2">lv_price</span> = 10000</code> <small>(LET · 고정, 안 바뀜)</small></div>'+
        '<div class="lr-step in"><b>누적값</b> <code>sum</code> <small>(INIT=0 → NEXT에서 반복마다 바뀜)</small></div>'+
        rows.map(function(r){return '<div class="lr-acc">'+r+'</div>';}).join('')+
        '<div class="lr-step in">최종 <code class="lr-res">lv_total = '+sum+'</code></div>'+
        '</div>';
    }
  }
  root.addEventListener('click', function(e){
    var b=e.target.closest('[data-tab]'); if(!b) return;
    tab=b.getAttribute('data-tab');
    root.querySelectorAll('[data-tab]').forEach(function(x){x.setAttribute('aria-pressed', x===b?'true':'false');});
    root.querySelector('.lr-inputs').style.display = tab==='cond' ? '' : 'none';
    render();
  });
  root.addEventListener('input', render);
  render();
})();
