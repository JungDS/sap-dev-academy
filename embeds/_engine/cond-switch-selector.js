/* cond-switch-selector 엔진 — CH18-L07 전용.
   잔여석→COND(범위 조건), 상태코드→SWITCH(상수 비교)로 값 하나가 어떻게 정해지는지 시연.
   ELSE 제거 토글로 조건 불일치 시 초기값이 되는 것도 보여 준다. 게이팅: 값 생성 표현식 시연만.
   골격 계약(HTML): [data-css] · #cssRem · #cssStat · #cssElse · #cssCond · #cssSwitch. 높이: _autoheight.js. */
(function () {
  var root = document.querySelector('[data-css]'); if (!root) return;
  var rem = root.querySelector('#cssRem');
  var stat = root.querySelector('#cssStat');
  var elseOn = root.querySelector('#cssElse');
  var condEl = root.querySelector('#cssCond');
  var swEl = root.querySelector('#cssSwitch');

  function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
  function box(el,label,branch,val,fallback){
    el.innerHTML = '<div class="css-branch">선택된 가지: <b>'+esc(branch)+'</b></div>' +
      '<div class="css-val'+(fallback?' fb':'')+'">결과: <code>'+ (val==='' ? "'' (초기값)" : esc(val)) +'</code>'+(fallback?' <span class="css-fbtag">ELSE 없음 → 초기값</span>':'')+'</div>';
  }

  function render(){
    var r = parseInt(rem.value,10); if(isNaN(r)) r=0;
    var hasElse = elseOn.checked;
    // COND (잔여석)
    var cbranch, cval, cfb=false;
    if (r === 0){ cbranch='WHEN lv_remaining = 0'; cval='매진'; }
    else if (r < 10){ cbranch='WHEN lv_remaining < 10'; cval='마감 임박'; }
    else if (hasElse){ cbranch='ELSE'; cval='예매 가능'; }
    else { cbranch='(일치 없음)'; cval=''; cfb=true; }
    box(condEl,'COND',cbranch,cval,cfb);
    // SWITCH (상태)
    var s = stat.value, sbranch, sval, sfb=false, map={N:'예약',C:'취소'};
    if (map[s]){ sbranch="WHEN '"+s+"'"; sval=map[s]; }
    else if (hasElse){ sbranch='ELSE'; sval='알 수 없음'; }
    else { sbranch='(일치 없음)'; sval=''; sfb=true; }
    box(swEl,'SWITCH',sbranch,sval,sfb);
  }
  root.addEventListener('input',render);
  root.addEventListener('change',render);
  render();
})();
