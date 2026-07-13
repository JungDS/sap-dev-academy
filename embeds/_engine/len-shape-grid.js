// ===== len-shape-grid 엔진 JS — C·N·P "칸(cell)" 시각화 + offset/length 하이라이트 =====
// 변수 선언은 돌릴 로직이 없다 → 대신 "어떤 모양의 칸이 생기는지"를 그린다.
// C: 패딩/잘림 · N: 앞 0 채움 · P: 바이트 칸(1칸=숫자 2자리, 마지막 반 칸=부호 → 최대 2×len−1자리)
// offset: +시작(길이)가 어느 칸을 집는지 하이라이트 · 범위 초과 bad · 부분 쓰기 교체.
// 설정 = window.LSG_CFG { items:[{kind:'c'|'n'|'p', name, len, dec?, samples[]|sample, label}],
//                         offset:{name, value, ranges:[{off,len,lab}], write:{off,len,val}} }
(function(){
  var cfg = window.LSG_CFG; if(!cfg) return;
  var root = document.querySelector('[data-lsg]'); if(!root) return;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // 상태: 아이템별 선택 샘플 idx · offset 선택 range idx · 부분 쓰기 여부
  var sel = {}; (cfg.items||[]).forEach(function(it,i){ sel[i]=0; });
  var offSel = -1, wrote = false;
  // 넛지("눌러 보세요" 배지)는 상시 표시 — 인터랙션 발견가능성 유지

  function cRow(item, idx){
    var v = item.samples[sel[idx]];
    var h = '<div class="lsg-cells">';
    for(var i=0;i<item.len;i++){
      var ch = v[i];
      h += ch==null ? '<span class="lsg-cell pad" title="공백으로 채워짐">␣</span>'
                    : '<span class="lsg-cell">'+esc(ch)+'</span>';
    }
    var cut = v.length>item.len ? v.slice(item.len) : '';
    if(cut) for(var j=0;j<cut.length;j++) h += '<span class="lsg-cell cut" title="칸을 넘어 잘림">'+esc(cut[j])+'</span>';
    h += '</div>';
    var msg = cut ? '<div class="lsg-msg bad">LENGTH '+item.len+'을 넘는 <b>\''+esc(cut)+'\'</b>는 <b>잘려 나간다</b> — 값 손실!</div>'
        : v.length<item.len ? '<div class="lsg-msg">모자란 칸은 <b>공백</b>으로 채워진다(고정 길이).</div>'
        : '<div class="lsg-msg ok">딱 맞게 채워졌다.</div>';
    return h+msg;
  }
  function nRow(item, idx){
    var v = item.samples[sel[idx]];
    var padded = v.length<item.len ? new Array(item.len-v.length+1).join('0')+v : v;
    var padN = item.len - v.length;
    var h = '<div class="lsg-cells">';
    for(var i=0;i<item.len;i++){
      var auto = i<padN;
      h += '<span class="lsg-cell'+(auto?' zero':'')+'"'+(auto?' title="자동으로 0 채움"':'')+'>'+esc(padded[i])+'</span>';
    }
    h += '</div>';
    var msg = padN>0 ? '<div class="lsg-msg">모자란 앞자리를 <b>0</b>으로 채운다 — 그래서 <b>앞의 0이 보존</b>되는 타입.</div>'
                     : '<div class="lsg-msg ok">앞의 0까지 그대로 담겼다(정수 I였다면 <b>'+esc(String(+v))+'</b>로 깨졌을 값).</div>';
    return h+msg;
  }
  function pRow(item){
    var digits = item.len*2-1;                       // 부호 반 칸 빼고 담을 수 있는 자릿수
    var v = item.sample;                             // 예: '123.45'
    var parts = v.split('.'), intp = parts[0], decp = parts[1]||'';
    var digitStr = (intp+decp);
    var padN = digits - digitStr.length;
    var slots = new Array(digits-digitStr.length+1).join('0') + digitStr;
    var decStart = digits - item.dec;                // 소수 시작 슬롯 idx
    var h = '<div class="lsg-cells lsg-bytes">', s = 0;
    for(var b=0;b<item.len;b++){
      var last = b===item.len-1;
      h += '<span class="lsg-byte" title="길이 1칸(=1바이트) — 숫자 2자리가 들어간다">';
      var per = last?1:2;
      for(var k=0;k<per;k++,s++){
        var faded = s<padN;
        h += '<span class="lsg-slot'+(faded?' pad':'')+'">'+esc(slots[s])+'</span>';
        if(s===decStart-1 && item.dec>0) h += '<span class="lsg-dot" title="DECIMALS '+item.dec+' — 여기부터 소수">.</span>';
      }
      if(last) h += '<span class="lsg-slot sign" title="마지막 칸의 뒷자리 — 숫자가 아니라 부호(+/−) 전용!">+</span>';
      h += '</span>';
    }
    h += '</div>';
    h += '<div class="lsg-msg">길이 한 칸(<b>LENGTH 1 = 1바이트</b>)에 문자는 <b>1개</b> 들어가지만, P는 한 칸을 둘로 쪼개 <b>숫자 2자리</b>를 담는다. '
       + '단 <b>마지막 칸의 뒷자리 하나는 숫자가 아니라 부호(+/−) 자리</b> — 그래서 LENGTH '+item.len
       + ' → 담을 수 있는 숫자는 최대 <b>'+digits+'자리</b>(= '+item.len+'×2−1, 소수 포함). C·N의 LENGTH(=글자 수)와 의미가 다르다!</div>';
    return h;
  }

  function offsetPanel(){
    var o = cfg.offset; if(!o) return '';
    var val = o.value;
    if(wrote){ var w=o.write; val = val.slice(0,w.off)+w.val+val.slice(w.off+w.len); }
    var r = offSel>=0 ? o.ranges[offSel] : null;
    var over = r && (r.off+r.len > val.length);
    var h = '<div class="lsg-t">offset/length — <code>+시작(길이)</code>는 어느 칸을 집나 <small>(시작은 0부터)</small></div>';
    if(wrote){
      // 초기값이 바뀐 게 아니라 "부분 쓰기로 현재 내용이 바뀐 것" — 전→후를 명시(혼동 방지)
      h += '<div class="lsg-varname"><code>'+esc(o.name)+'</code> = <code class="lsg-was">\''+esc(o.value)+'\'</code>'
         + '<span class="lsg-became">→</span><code class="lsg-now">\''+esc(val)+'\'</code>'
         + '<small class="lsg-wtag">+'+o.write.off+'('+o.write.len+') 부분만 교체된 <b>현재 값</b></small></div>';
    } else {
      h += '<div class="lsg-varname"><code>'+esc(o.name)+'</code> = <code>\''+esc(val)+'\'</code></div>';
    }
    h += '<div class="lsg-cells lsg-idx">';
    for(var i=0;i<val.length;i++){
      var hit = r && !over && i>=r.off && i<r.off+r.len;
      var part = r && over && i>=r.off;                     // 초과여도 실재하는 칸은 "집히려던 칸"으로 표시
      var wcell = wrote && i>=o.write.off && i<o.write.off+o.write.len;
      h += '<span class="lsg-cellwrap"><span class="lsg-cell'+(hit?' hit':'')+(part?' part':'')+(wcell?' wrote':'')+'">'+esc(val[i])+'</span><span class="lsg-i">'+i+'</span></span>';
    }
    if(r && over){
      for(var x=val.length; x<r.off+r.len; x++)
        h += '<span class="lsg-cellwrap"><span class="lsg-cell over">?</span><span class="lsg-i bad-i">'+x+'</span></span>';
    }
    h += '</div>';
    h += '<div class="lsg-btns">';
    o.ranges.forEach(function(rg,i){
      h += '<button type="button" class="lsg-btn'+(offSel===i?' on':'')+'" data-range="'+i+'">'+esc(rg.lab)+'</button>';
    });
    h += '<button type="button" class="lsg-btn wr'+(wrote?' on':'')+'" data-write>'
       + (wrote ? '↺ 되돌리기' : '✍ +'+cfg.offset.write.off+'('+cfg.offset.write.len+') = \''+esc(cfg.offset.write.val)+'\' 로 교체')+'</button>';
    h += '<span class="lsg-nudge">👆 버튼을 눌러 칸을 집어 보세요</span>';
    h += '</div>';
    if(r){
      h += over
        ? '<div class="lsg-msg bad"><b>범위 초과!</b> '+r.off+'번 칸(<b>\''+esc(val.substr(r.off))+'\'</b>)까지는 있지만 '
          + val.length+'번 칸은 <b>없다</b> — 시작 '+r.off+' + 길이 '+r.len+' = '+(r.off+r.len)+' &gt; 전체 '+val.length+'칸이라 <b>문장 전체가 오류</b>. '
          + '<b>시작+길이 ≤ 전체 길이</b>를 지켜야 한다.</div>'
        : '<div class="lsg-msg ok"><code>'+esc(o.name)+'+'+r.off+'('+r.len+')</code> → <b>\''+esc(val.substr(r.off,r.len))+'\'</b> 를 집었다.</div>';
    } else if(wrote){
      // 소스 두 줄을 = 위치 정렬로 직접 비교 — 설명보다 직관
      var w = o.write, lhs1 = o.name, lhs2 = o.name+'+'+w.off+'('+w.len+')';
      var wpad = Math.max(lhs1.length, lhs2.length);
      var sp = function(s){ return new Array(wpad-s.length+1).join(' '); };
      h += '<pre class="lsg-code">'
         + esc(lhs1)+sp(lhs1)+' = \''+esc(o.value)+'\'. <span class="cmt">" 처음 값</span>\n'
         + esc(o.name)+'<span class="hl">+'+w.off+'('+w.len+')</span>'+sp(lhs2)+' = \''+esc(w.val)+'\'.       <span class="cmt">" 끝 두 칸만 교체 → \''+esc(val)+'\'</span></pre>';
      h += '<div class="lsg-msg ok">끝 두 칸만 갈아 끼웠다 — 전체가 <b>\''+esc(val)+'\'</b>로 바뀌었다(부분 쓰기).</div>';
    }
    return '<div class="lsg-sec">'+h+'</div>';
  }

  function render(){
    var h = '';
    (cfg.items||[]).forEach(function(it, idx){
      h += '<div class="lsg-sec"><div class="lsg-t">'+esc(it.label)+'</div>';
      h += '<div class="lsg-varname"><code>DATA '+esc(it.name)+' TYPE '+it.kind+' LENGTH '+it.len+(it.dec?' DECIMALS '+it.dec:'')+'.</code></div>';
      if(it.kind!=='p'){
        h += '<div class="lsg-chips">';
        it.samples.forEach(function(s,i){
          h += '<button type="button" class="lsg-chip'+(sel[idx]===i?' on':'')+'" data-item="'+idx+'" data-s="'+i+'">\''+esc(s)+'\'</button>';
        });
        h += '<span class="lsg-nudge">👆 칩을 눌러 값을 바꿔 보세요</span>';
        h += '</div>';
      }
      h += it.kind==='c' ? cRow(it,idx) : it.kind==='n' ? nRow(it,idx) : pRow(it);
      h += '</div>';
    });
    h += offsetPanel();
    if(cfg.note) h += '<div class="note">'+cfg.note+'</div>';  // note는 신뢰된 HTML(레슨 작성자)
    root.innerHTML = h;
  }

  root.addEventListener('click', function(e){
    var chip = e.target.closest('[data-item]');
    if(chip){ sel[+chip.getAttribute('data-item')] = +chip.getAttribute('data-s'); render(); return; }
    var rb = e.target.closest('[data-range]');
    if(rb){ var i=+rb.getAttribute('data-range'); offSel = (offSel===i? -1 : i); render(); return; }
    if(e.target.closest('[data-write]')){ wrote = !wrote; offSel = -1; render(); }
  });
  render();
})();
