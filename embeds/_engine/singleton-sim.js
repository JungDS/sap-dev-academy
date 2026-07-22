/* singleton-sim — Singleton 패턴 체험 (CH27-L02).
   왼쪽 get_instance() ×N → 항상 같은 인스턴스(동일 id, 생성 1회) / 오른쪽 NEW ×N → 매번 새 인스턴스. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var sCalls = [], nCalls = [], nSeq = 0;
  var SID = '0xA17F';   // 싱글턴 고정 주소

  function row(id, cls, label) { return '<div class="ref ' + cls + '"><span class="id">' + id + '</span><span>' + label + '</span></div>'; }
  function render() {
    $('sRefs').innerHTML = sCalls.length ? sCalls.map(function (n) { return row(SID, 'same', 'get_instance() 호출 #' + n); }).join('') : '<span class="ph">get_instance()를 눌러 보세요.</span>';
    $('nRefs').innerHTML = nCalls.length ? nCalls.map(function (o) { return row(o.id, 'uniq', 'NEW zcl_config( ) #' + o.n); }).join('') : '<span class="ph">NEW를 눌러 보세요.</span>';
    $('sCnt').textContent = '인스턴스 ' + (sCalls.length ? 1 : 0) + '개';
    $('nCnt').textContent = '인스턴스 ' + nCalls.length + '개';
    post();
  }
  $('sCall').addEventListener('click', function () { sCalls.push(sCalls.length + 1); render(); });
  $('nCall').addEventListener('click', function () { nSeq++; nCalls.push({ id: '0x' + (0xB200 + nSeq * 0x40).toString(16).toUpperCase(), n: nSeq }); render(); });
  $('reset').addEventListener('click', function () { sCalls = []; nCalls = []; nSeq = 0; render(); });
  function post() { try { if (document.documentElement.clientWidth < 60) return; var el = document.querySelector('.wrap'); var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6; parent.postMessage({ sda: 'embed-height', h: h }, '*'); } catch (e) {} }
  window.addEventListener('load', post); window.addEventListener('resize', post);
  render();
})();
