// ===== case-branch-sim 엔진 JS — CASE…WHEN 분기 시뮬 =====
// 값을 고르면 처음 일치하는 WHEN 줄을 하이라이트하고 실행 결과를 보여 준다.
// 설정은 위젯의 window.CASE_CFG (caseVar·variants[{label,whens[{keys,code,out}]}]·choices)로 주입.
(function(){
  var cfg = window.CASE_CFG; if(!cfg) return;
  var root = document.querySelector('[data-casesim]'); if(!root) return;
  var vIdx = 0, sel = null;

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function color(line){
    var h = esc(line);
    h = h.replace(/&#39;|'[^']*'/g, function(m){ return '<span class="cs-str">'+m+'</span>'; });
    h = h.replace(/\b(CASE|WHEN|OTHERS|OR|ENDCASE|WRITE)\b/g, '<span class="cs-kw">$1</span>');
    return h;
  }
  function matchIdx(variant, val){
    for(var i=0;i<variant.whens.length;i++){
      var w = variant.whens[i];
      if(w.keys.indexOf('*OTHERS*') >= 0) continue;
      if(w.keys.indexOf(val) >= 0) return i;
    }
    for(var j=0;j<variant.whens.length;j++){ if(variant.whens[j].keys.indexOf('*OTHERS*') >= 0) return j; }
    return -1;
  }
  function render(){
    var variant = cfg.variants[vIdx];
    var mi = (sel === null) ? -1 : matchIdx(variant, sel);
    var html = '';

    // variant 토글
    html += '<div class="cs-seg">';
    cfg.variants.forEach(function(v,i){ html += '<button type="button" data-v="'+i+'" class="'+(i===vIdx?'on':'')+'">'+esc(v.label)+'</button>'; });
    html += '</div>';

    // 값 선택 칩
    html += '<div class="cs-controls"><span class="cs-lbl">'+esc(cfg.caseVar)+' =</span>';
    cfg.choices.forEach(function(c){
      var disp = c.disp || ("'"+c.val+"'");
      html += '<button type="button" class="cs-chip'+(sel===c.val?' sel':'')+'" data-val="'+esc(c.val)+'">'+esc(disp)+'</button>';
    });
    html += '</div>';

    // 코드 패널
    html += '<div class="cs-code"><div class="cs-hd"><span class="cs-dots"><i></i><i></i><i></i></span><span class="cs-lang">ABAP</span></div><div class="cs-body">';
    html += '<div class="cs-line"><span class="cs-mk-sp"></span><span class="cs-kw">CASE</span> '+esc(cfg.caseVar)+'.</div>';
    variant.whens.forEach(function(w,i){
      var on = (i===mi);
      html += '<div class="when-grp'+(on?' on':'')+'" data-idx="'+i+'">';
      w.code.forEach(function(cl,k){
        var mk = (k===0 && on) ? '<span class="cs-mk">▶</span>' : '<span class="cs-mk-sp"></span>';
        html += '<div class="cs-line">'+mk+color(cl)+'</div>';
      });
      html += '</div>';
    });
    html += '<div class="cs-line"><span class="cs-mk-sp"></span><span class="cs-kw">ENDCASE</span>.</div>';
    html += '</div></div>';

    // 실행 결과
    html += '<div class="cs-out"><span class="cs-out__cap">실행 결과</span>';
    if(sel === null) html += '<span class="cs-out__hint">위에서 값을 골라 보세요.</span>';
    else html += '<span class="cs-out__val">'+esc(variant.whens[mi].out)+'</span>';
    html += '</div>';

    root.innerHTML = html;
  }
  root.addEventListener('click', function(e){
    var vb = e.target.closest('[data-v]');
    if(vb){ vIdx = +vb.dataset.v; sel = null; render(); return; }
    var cb = e.target.closest('[data-val]');
    if(cb){ sel = cb.dataset.val; render(); return; }
  });
  render();
})();
