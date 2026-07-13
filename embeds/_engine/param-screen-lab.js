// ===== param-screen-lab 엔진 JS — PARAMETERS 보상 실험(선택화면 mock) =====
// "F4는 마법이 아니라 Dictionary 메타데이터의 결과"를 몸으로:
// ① 같은 칸의 타입을 Data Element ↔ 표준 타입 직접 지정으로 토글 → 라벨·F4가 붙었다 떨어진다
// ② F4 ≠ 검증 — 고정값 검증은 VALUE CHECK를 켜야 수행(abapparameters_value.htm Addition 5).
//    VALUE CHECK는 DDIC 타입 참조일 때만 가능 → 표준 타입 모드에선 비활성.
// ③ OBLIGATORY(빈값 실행 차단)·DEFAULT(미리 채움)·LOWER CASE(대문자 변환 방지) 토글
// ④ 실행(F8) → 통과 시 WRITE 출력 mock / 막히면 원인 표시
// 설정 = window.PSL_CFG { de:{param,name,rawType,label,fixed:[{val,txt}]}, nameField:{param,label,sample}, note? }
(function(){
  var cfg = window.PSL_CFG; if(!cfg) return;
  var root = document.querySelector('[data-psl]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // 상태
  var useDe = true, oblig = true, defOn = false, lower = false, vcheck = false;
  var valStat = '', valName = '', f4Open = false;
  var result = null;   // {kind:'ok'|'block'|'invalid', ...}

  function code(){
    var l1 = 'PARAMETERS ' + cfg.de.param + ' TYPE ' + (useDe ? cfg.de.name : cfg.de.rawType)
           + (oblig ? ' OBLIGATORY' : '') + (defOn ? " DEFAULT '" + cfg.de.fixed[0].val + "'" : '')
           + (useDe && vcheck ? ' VALUE CHECK' : '') + '.';
    var l2 = 'PARAMETERS ' + cfg.nameField.param + ' TYPE c LENGTH 10' + (lower ? ' LOWER CASE' : '') + '.';
    return l1 + '\n' + l2;
  }

  function render(){
    var h = '';
    // 토글 패널
    h += '<div class="psl-togs">'
       + '<div class="psl-seg"><span class="psl-seg__lab">'+esc(cfg.de.param)+' 타입</span>'
       + '<button type="button" class="psl-seg__b'+(useDe?' on':'')+'" data-mode="de">'+esc(cfg.de.name)+' (Data Element)</button>'
       + '<button type="button" class="psl-seg__b'+(!useDe?' on':'')+'" data-mode="raw">'+esc(cfg.de.rawType)+' (표준 타입 직접)</button></div>'
       + '<div class="psl-opts">'
       + '<button type="button" class="psl-opt'+(oblig?' on':'')+'" data-opt="oblig">OBLIGATORY</button>'
       + '<button type="button" class="psl-opt'+(defOn?' on':'')+'" data-opt="def">DEFAULT \''+esc(cfg.de.fixed[0].val)+'\'</button>'
       + '<button type="button" class="psl-opt'+(vcheck?' on':'')+'" data-opt="vcheck"'+(useDe?'':' disabled title="DDIC 타입을 참조할 때만 붙일 수 있다"')+'>VALUE CHECK</button>'
       + '<button type="button" class="psl-opt'+(lower?' on':'')+'" data-opt="lower">LOWER CASE <small>('+esc(cfg.nameField.param)+')</small></button>'
       + '</div></div>';
    // 코드 미리보기
    h += '<pre class="psl-code">'+esc(code())+'</pre>';
    // 선택화면 mock
    var stat = defOn && !valStat ? cfg.de.fixed[0].val : valStat;
    h += '<div class="psl-scr"><div class="psl-scr__hd">선택화면 <small>(프로그램 실행 시 먼저 뜨는 입력 화면)</small></div>';
    h += '<div class="psl-row"><span class="psl-label">'+(useDe ? esc(cfg.de.label) : '<i class="psl-nolabel">'+esc(cfg.de.param)+'</i>')+'</span>'
       + '<input class="psl-in" id="pslStat" maxlength="1" value="'+esc(stat)+'" aria-label="'+esc(cfg.de.param)+'" />'
       + (useDe ? '<button type="button" class="psl-f4" data-f4 title="F4 — 허용 값 목록">🔍 F4</button>' : '<span class="psl-nof4">F4 없음</span>')
       + '</div>';
    if(f4Open && useDe){
      h += '<div class="psl-f4pop">Domain 고정값에서 온 목록 — 골라 보세요:';
      cfg.de.fixed.forEach(function(f){
        h += '<button type="button" class="psl-f4pop__v" data-pick="'+esc(f.val)+'"><b>'+esc(f.val)+'</b> '+esc(f.txt)+'</button>';
      });
      h += '</div>';
    }
    h += '<div class="psl-row"><span class="psl-label">'+esc(cfg.nameField.label)+'</span>'
       + '<input class="psl-in wide" id="pslName" maxlength="10" value="'+esc(valName)+'" placeholder="'+esc(cfg.nameField.sample)+'" aria-label="'+esc(cfg.nameField.param)+'" />'
       + '</div>';
    h += '<div class="psl-run"><button type="button" class="psl-runbtn" data-run>▶ 실행 (F8)</button></div></div>';
    // 결과
    if(result){
      if(result.kind==='block'){
        h += '<div class="psl-out bad"><b>실행 차단!</b> <code>OBLIGATORY</code> 필드가 비었다 — "필수 필드를 모두 채우십시오." 본문은 시작조차 안 한다.</div>';
      } else if(result.kind==='invalid'){
        h += '<div class="psl-out bad"><b>입력 거부!</b> <code>VALUE CHECK</code>가 \''+esc(result.val)+'\'를 Domain 고정값('+cfg.de.fixed.map(function(f){return f.val;}).join('/')+')과 대조해 거부했다 — 상태바에 오류 메시지가 뜨고 실행이 막힌다.</div>';
      } else {
        h += '<div class="psl-out ok"><b>통과!</b> 리스트 출력:<pre class="psl-list">입력 상태: '+esc(result.stat)+'\n입력 이름: '+esc(result.name)+'</pre>'
           + (result.upper ? '<div class="psl-warn">⚠️ 소문자로 넣었는데 <b>'+esc(result.name)+'</b>(대문자)로 바뀌었다 — <code>LOWER CASE</code>가 없어서 자동 대문자 변환됨!</div>' : '')
           + (result.noCheck ? '<div class="psl-warn">⚠️ F4 목록(<b>'+cfg.de.fixed.map(function(f){return f.val;}).join('/')+'</b>) 밖의 값인데 <b>그냥 통과</b>했다 — F4는 도움말일 뿐! 막으려면 <code>VALUE CHECK</code>를 켜라.</div>' : '')
           + (result.rawPass ? '<div class="psl-warn">⚠️ 표준 타입 직접 지정이라 DDIC 검증과 연결 자체가 없다 — 아무 값이나 통과.</div>' : '')
           + '</div>';
      }
    } else {
      h += '<div class="psl-out">타입·옵션을 바꾸고 <b>실행(F8)</b>을 눌러 보자 — 라벨·F4·검증이 어디서 오는지 보인다.</div>';
    }
    if(cfg.note) h += '<div class="note">'+cfg.note+'</div>';   // note는 신뢰된 HTML(레슨 작성자)
    root.innerHTML = h;
    var si = root.querySelector('#pslStat'), ni = root.querySelector('#pslName');
    if(si) si.addEventListener('input', function(){ valStat = si.value; });
    if(ni) ni.addEventListener('input', function(){ valName = ni.value; });
  }

  root.addEventListener('click', function(e){
    var m = e.target.closest('[data-mode]');
    if(m){ useDe = m.getAttribute('data-mode')==='de'; if(!useDe) vcheck=false; f4Open=false; result=null; render(); return; }
    var o = e.target.closest('[data-opt]');
    if(o && !o.disabled){
      var k = o.getAttribute('data-opt');
      if(k==='oblig') oblig=!oblig; else if(k==='def') defOn=!defOn;
      else if(k==='vcheck') vcheck=!vcheck; else lower=!lower;
      result=null; render(); return;
    }
    if(e.target.closest('[data-f4]')){ f4Open=!f4Open; render(); return; }
    var p = e.target.closest('[data-pick]');
    if(p){ valStat = p.getAttribute('data-pick'); f4Open=false; result=null; render(); return; }
    if(e.target.closest('[data-run]')){
      var stat = (defOn && !valStat) ? cfg.de.fixed[0].val : valStat;
      var name = valName;
      var inFixed = !stat || cfg.de.fixed.some(function(f){ return f.val===stat.toUpperCase(); });
      if(oblig && !stat){ result={kind:'block'}; }
      else if(useDe && vcheck && !inFixed){                        // 검증은 VALUE CHECK가 있을 때만!
        result={kind:'invalid', val:stat};
      } else {
        var upper = !lower && /[a-z]/.test(name);
        result={ kind:'ok', stat:(stat||'(빈값)').toUpperCase(), name: lower? name||'(빈값)' : (name||'(빈값)').toUpperCase(),
                 upper:upper, noCheck: useDe && !vcheck && !inFixed, rawPass: !useDe && !!stat && !inFixed };
      }
      render();
    }
  });
  render();
})();
