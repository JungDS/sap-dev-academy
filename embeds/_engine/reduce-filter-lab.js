/* reduce-filter-lab 엔진 — CH18-L08 전용.
   예매 테이블에서 REDUCE(좌석 합계 누적)·FILTER(status=N)·EXCEPT(반대집합)를 시연.
   REDUCE는 INIT→NEXT 누적을 한 행씩 보여 준다. 게이팅: modern 테이블 표현식 시연만(DML 없음).
   골격 계약(HTML): [data-rfl] · #rflSrc · [data-op] · #rflOut. 높이: _autoheight.js. */
(function () {
  var root = document.querySelector('[data-rfl]'); if (!root) return;
  var DATA = [
    { id:5001, cust:'정훈영', seats:2, status:'N' },
    { id:5002, cust:'손흥민', seats:4, status:'N' },
    { id:5003, cust:'아이유', seats:3, status:'C' },
    { id:5004, cust:'김연아', seats:1, status:'N' },
    { id:5005, cust:'유재석', seats:5, status:'C' }
  ];
  var srcEl = root.querySelector('#rflSrc');
  var out = root.querySelector('#rflOut');

  function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
  function tbl(rows, hi){
    return '<table class="rfl-t"><tr><th>예매</th><th>고객</th><th>좌석</th><th>상태</th></tr>' +
      rows.map(function(r){ return '<tr'+(hi&&hi(r)?' class="hi"':'')+'><td>'+r.id+'</td><td>'+esc(r.cust)+'</td><td>'+r.seats+'</td><td>'+r.status+'</td></tr>'; }).join('') + '</table>';
  }
  srcEl.innerHTML = tbl(DATA);

  function reduce(){
    var sum=0, steps=[];
    DATA.forEach(function(r){ sum += r.seats; steps.push('sum = '+ (sum-r.seats) +' + '+r.seats+' = <b>'+sum+'</b>  <small>('+esc(r.cust)+')</small>'); });
    out.className='rfl-out ok';
    out.innerHTML = '<div class="rfl-code">REDUCE i( INIT sum = 0 FOR ls_book IN lt_booking NEXT sum = sum + ls_book-seats )</div>' +
      '<div class="rfl-steps">'+steps.map(function(s){return '<div>'+s+'</div>';}).join('')+'</div>' +
      '<div class="rfl-final">합계 좌석 = <code>'+sum+'</code></div>';
  }
  function filter(except){
    var rows = DATA.filter(function(r){ return except ? r.status!=='N' : r.status==='N'; });
    out.className='rfl-out ok';
    out.innerHTML = '<div class="rfl-code">FILTER tt_booking( lt_booking '+(except?'EXCEPT ':'')+'WHERE status = \'N\' )</div>' +
      '<div class="rfl-cap">'+(except?'조건에 <b>안</b> 맞는 행(취소):':'조건에 맞는 행(예약):')+' '+rows.length+'건</div>' + tbl(rows);
  }

  root.addEventListener('click', function(e){
    var b=e.target.closest('[data-op]'); if(!b) return;
    var op=b.getAttribute('data-op');
    if(op==='reduce') reduce(); else if(op==='filter') filter(false); else if(op==='except') filter(true);
  });
  out.className='rfl-out'; out.innerHTML='버튼을 눌러 <b>REDUCE</b>(좌석 합계)·<b>FILTER</b>(예약만)·<b>EXCEPT</b>(취소만)를 실행해 보세요.';
})();
