// ===== hierarchy-tree 엔진 JS — 계층 트리 위젯 (CH09-L05 Collective→Elementary 등) =====
// root + children 구조를 연결선 트리로 그리고, 노드 클릭 시 역할(=F4 탭)을 상세 패널에 보여 준다.
// 데이터=window.HT_CFG = { root:{id,name,badge,note,role,detail}, children:[{id,name,badge,note,role,detail,tab}] }
(function(){
  var cfg = window.HT_CFG || {};
  var ROOT = cfg.root || {};
  var KIDS = cfg.children || [];
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  var sel = ROOT.id;
  function all(){ return [ROOT].concat(KIDS); }
  function find(id){ return all().filter(function(n){return n.id===id;})[0]; }

  function nodeHtml(n){
    var bcls = n.badge==='Collective' ? 'coll' : 'elem';
    return '<div class="node'+(n.id===sel?' sel':'')+'" data-id="'+esc(n.id)+'">'
      +'<span class="nm">'+esc(n.name)+'</span>'
      +(n.note?'<span class="note">'+esc(n.note)+'</span>':'')
      +'<span class="badge '+bcls+'">'+esc(n.badge||'')+'</span></div>';
  }
  function renderTree(){
    $('tree').innerHTML = nodeHtml(ROOT)
      + '<div class="kids">' + KIDS.map(function(k){ return '<div class="kid">'+nodeHtml(k)+'</div>'; }).join('') + '</div>';
  }
  function renderDetail(){
    var n=find(sel)||ROOT;
    var tabs = '<div class="f4tabs">'+KIDS.map(function(k){
      return '<span class="f4tab'+((sel===k.id)?' on':'')+'">'+esc(k.note||k.name)+'</span>';
    }).join('')+'</div>';
    var isRoot = (sel===ROOT.id);
    $('detail').innerHTML='<div class="detail__hd">'+(isRoot?'Collective 묶음':'Elementary(검색 탭)')+'</div>'
      +'<div class="detail__b"><div class="dt-name">'+esc(n.name)+'</div>'
      +'<div class="dt-role">'+esc(n.role||'')+'</div>'
      +'<div class="dt-text">'+esc(n.detail||'')+'</div>'
      + tabs
      + '<div class="f4hint">'+(isRoot?'F4를 누르면 위 탭들이 한 팝업에 나타납니다.':'어느 탭에서 골라도 Collective 파라미터로 같은 값이 돌아오도록 대응시킵니다.')+'</div>'
      +'</div>';
  }
  function render(){ renderTree(); renderDetail(); postHeight(); }

  $('tree').addEventListener('click',function(e){ var n=e.target.closest('.node'); if(n){ sel=n.dataset.id; render(); } });

  function postHeight(){ try{ var el=document.querySelector('.wrap');
    var h=Math.ceil(el?el.getBoundingClientRect().bottom:document.body.scrollHeight)+8;
    parent.postMessage({sda:'embed-height', h:h}, '*'); }catch(e){} }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);

  render();
})();
