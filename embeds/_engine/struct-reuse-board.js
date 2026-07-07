// ===== struct-reuse-board 엔진 JS — 구조 재사용 3방식(중첩/.INCLUDE/.APPEND) 비교 보드 =====
// "어떤 모양으로 들어가고, 어떻게 접근하느냐"를 다이어그램+접근 경로로. 마지막에 경로 퀴즈.
// ① 방식 세그 → 구조 다이어그램 변화(중첩=하위 박스 · INCLUDE=펼쳐진 점선 그룹 · APPEND=잠긴 표준+확장 영역)
// ② 접근 경로 코드 칩 동기 표시 ③ 미니 퀴즈(선택형) — 정오 즉시 피드백
// 설정 = window.SRB_CFG { modes:{nested|include|append:{label,ownerName,own[],ins:{name,fields[]},path,pathNote}}, quiz:[{q,choices[],a,why}], note? }
(function(){
  var cfg = window.SRB_CFG; if(!cfg) return;
  var root = document.querySelector('[data-srb]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var mode = 'nested';
  var picked = {};   // quiz idx → choice idx

  function diagram(m){
    var d = cfg.modes[m];
    var h = '<div class="srb-diag">';
    h += '<div class="srb-box owner'+(m==='append'?' locked':'')+'"><div class="srb-box__hd">'+esc(d.ownerName)
       + (m==='append' ? ' <span class="srb-lock" title="표준 원본 — 직접 수정 금지">🔒 표준</span>' : '')+'</div>';
    d.own.forEach(function(f){ h += '<div class="srb-fld">'+esc(f)+'</div>'; });
    if(m === 'nested'){
      h += '<div class="srb-sub"><div class="srb-sub__hd">'+esc(d.ins.name)+' <small>(Structure가 통째로 한 Component)</small></div>';
      d.ins.fields.forEach(function(f){ h += '<div class="srb-fld in">'+esc(f)+'</div>'; });
      h += '</div>';
    } else if(m === 'include'){
      h += '<div class="srb-flat"><div class="srb-flat__hd">.INCLUDE '+esc(d.ins.name)+' <small>(펼쳐져 내 필드처럼)</small></div>';
      d.ins.fields.forEach(function(f){ h += '<div class="srb-fld flat">'+esc(f)+'</div>'; });
      h += '</div>';
    }
    h += '</div>';
    if(m === 'append'){
      h += '<div class="srb-appendlink">＋</div>';
      h += '<div class="srb-box ext"><div class="srb-box__hd">'+esc(d.ins.name)+' <small>(내가 만든 확장 — 원본은 안 건드림)</small></div>';
      d.ins.fields.forEach(function(f){ h += '<div class="srb-fld ext">'+esc(f)+'</div>'; });
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  function render(){
    var d = cfg.modes[mode];
    var h = '<div class="srb-seg">';
    ['nested','include','append'].forEach(function(m){
      h += '<button type="button" class="srb-seg__b'+(mode===m?' on':'')+'" data-mode="'+m+'">'+esc(cfg.modes[m].label)+'</button>';
    });
    h += '</div>';
    h += diagram(mode);
    h += '<div class="srb-path"><span class="srb-path__lab">접근 경로</span><code>'+esc(d.path)+'</code>'
       + '<small>'+esc(d.pathNote)+'</small></div>';
    // 퀴즈
    h += '<div class="srb-quiz"><div class="srb-quiz__hd">🧐 경로 퀴즈 — 어떻게 접근할까?</div>';
    (cfg.quiz||[]).forEach(function(q, i){
      h += '<div class="srb-q"><div class="srb-q__t">'+(i+1)+'. '+esc(q.q)+'</div><div class="srb-q__c">';
      q.choices.forEach(function(c, j){
        var cls = '';
        if(picked[i] != null){
          if(j === q.a) cls = ' good';
          else if(j === picked[i]) cls = ' bad';
        }
        h += '<button type="button" class="srb-choice'+cls+'" data-q="'+i+'" data-c="'+j+'"><code>'+esc(c)+'</code></button>';
      });
      h += '</div>';
      if(picked[i] != null){
        h += '<div class="srb-q__why'+(picked[i]===q.a?' ok':' no')+'">'
           + (picked[i]===q.a ? '⭕ ' : '❌ ')+q.why+'</div>';
      }
      h += '</div>';
    });
    h += '</div>';
    if(cfg.note) h += '<div class="note">'+cfg.note+'</div>';   // note는 신뢰된 HTML(레슨 작성자)
    root.innerHTML = h;
  }

  root.addEventListener('click', function(e){
    var m = e.target.closest('[data-mode]');
    if(m){ mode = m.getAttribute('data-mode'); render(); return; }
    var c = e.target.closest('[data-q]');
    if(c){ picked[+c.getAttribute('data-q')] = +c.getAttribute('data-c'); render(); }
  });
  render();
})();
