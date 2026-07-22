/* window-partition-sim 엔진 — GROUP BY(행 접힘) vs Window PARTITION BY(행 유지)를 나란히 비교하고
   ROW_NUMBER / RANK / DENSE_RANK를 partition 안에서 계산해 보여 준다.
   골격 계약(HTML): #wpsBtns · #wpsShape · #wpsSql · #wpsHead · #wpsBody · #wpsFb.
   config: window.WPS_CFG = { rows:[{id,part,seats}], modes:[{key,btn,sql,desc,tone}] }.
   집계·순위 로직은 엔진이 계산(레슨 데이터·문구는 전부 CFG). 게이팅: CH20 Advanced SQL만.
   높이: 자체 post()(parent.postMessage embed-height) — load·resize·상태변경마다. */
(function () {
  var CFG = window.WPS_CFG || { rows: [], modes: [] };
  var rows = CFG.rows || [];
  var modes = CFG.modes || [];
  var sel = modes.length ? modes[0].key : '';

  var elBtns = document.getElementById('wpsBtns');
  var elShape = document.getElementById('wpsShape');
  var elSql = document.getElementById('wpsSql');
  var elHead = document.getElementById('wpsHead');
  var elBody = document.getElementById('wpsBody');
  var elFb = document.getElementById('wpsFb');

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  // ---- 계산 헬퍼 ----
  function parts() { var out = []; rows.forEach(function (r) { if (out.indexOf(r.part) < 0) out.push(r.part); }); return out; }
  function partIdx(p) { return parts().indexOf(p); }
  function partSum(p) { return rows.filter(function (r) { return r.part === p; }).reduce(function (a, r) { return a + r.seats; }, 0); }
  function totalAll() { return rows.reduce(function (a, r) { return a + r.seats; }, 0); }
  function groupRows() { return parts().map(function (p) { return { part: p, sum: partSum(p) }; }); }
  function rowNum(r) {
    var same = rows.filter(function (x) { return x.part === r.part; }).slice()
      .sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
    for (var i = 0; i < same.length; i++) { if (same[i].id === r.id) return i + 1; }
    return 1;
  }
  function rankOf(r) { return 1 + rows.filter(function (x) { return x.part === r.part && x.seats > r.seats; }).length; }
  function denseOf(r) {
    var bigger = {};
    rows.forEach(function (x) { if (x.part === r.part && x.seats > r.seats) bigger[x.seats] = 1; });
    return 1 + Object.keys(bigger).length;
  }
  function gcls(p) { return 'g' + (partIdx(p) % 4); }

  function curMode() { for (var i = 0; i < modes.length; i++) { if (modes[i].key === sel) return modes[i]; } return modes[0]; }

  // ---- 결과 표 ----
  function buildTable(key) {
    var cols, trs;
    if (key === 'group') {
      cols = ['concert_id', 'booked_total'];
      trs = groupRows().map(function (g) {
        return { cls: gcls(g.part), cells: [{ v: g.part }, { v: g.sum, badge: 'brand' }] };
      });
    } else if (key === 'partition') {
      cols = ['booking_id', 'concert_id', 'seats', 'booked_total'];
      trs = rows.map(function (r) {
        return { cls: gcls(r.part), cells: [{ v: r.id }, { v: r.part }, { v: r.seats }, { v: partSum(r.part), badge: 'brand' }] };
      });
    } else if (key === 'rownum') {
      cols = ['booking_id', 'concert_id', 'seats', 'row_num'];
      trs = rows.map(function (r) {
        return { cls: gcls(r.part), cells: [{ v: r.id }, { v: r.part }, { v: r.seats }, { v: rowNum(r), badge: 'good' }] };
      });
    } else if (key === 'rank') {
      cols = ['booking_id', 'concert_id', 'seats', 'rank', 'dense_rank'];
      trs = rows.map(function (r) {
        var rk = rankOf(r), dn = denseOf(r);
        return { cls: gcls(r.part), cells: [{ v: r.id }, { v: r.part }, { v: r.seats }, { v: rk, gap: rk > dn }, { v: dn }] };
      });
    } else { // noPartition
      cols = ['booking_id', 'concert_id', 'seats', 'total_all'];
      var t = totalAll();
      trs = rows.map(function (r) {
        return { cls: 'whole', cells: [{ v: r.id }, { v: r.part }, { v: r.seats }, { v: t, badge: 'amber' }] };
      });
    }
    elHead.innerHTML = '<tr>' + cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>';
    elBody.innerHTML = trs.map(function (tr) {
      return '<tr class="' + tr.cls + '">' + tr.cells.map(function (c) {
        var inner = c.badge ? '<span class="wps-badge ' + c.badge + '">' + esc(c.v) + '</span>' : esc(c.v);
        return '<td' + (c.gap ? ' class="gap"' : '') + '>' + inner + '</td>';
      }).join('') + '</tr>';
    }).join('');
  }

  // ---- 행 접힘 vs 유지 미니 도식 ----
  function pill(txt, cls) { return '<span class="wps-pill ' + cls + '">' + esc(txt) + '</span>'; }
  function buildShape(key) {
    var leftPills = rows.map(function (r) { return pill(r.id + ' · ' + r.seats, gcls(r.part)); }).join('');
    var rightPills, rlabel, collapse = false;
    if (key === 'group') {
      rightPills = groupRows().map(function (g) { return pill(g.part + ' · ' + g.sum, gcls(g.part)); }).join('');
      rlabel = '결과 ' + groupRows().length + '행 (접힘)'; collapse = true;
    } else if (key === 'noPartition') {
      var t = totalAll();
      rightPills = rows.map(function (r) { return pill(r.id + ' → ' + t, 'whole'); }).join('');
      rlabel = '결과 ' + rows.length + '행 · 한 묶음'; collapse = true;
    } else {
      rightPills = rows.map(function (r) {
        var tag = key === 'partition' ? partSum(r.part) : key === 'rownum' ? rowNum(r) : rankOf(r);
        return pill(r.id + ' · ' + tag, gcls(r.part));
      }).join('');
      rlabel = '결과 ' + rows.length + '행 (유지)';
    }
    elShape.innerHTML =
      '<div class="wps-col"><span class="wps-cl">원본 상세 ' + rows.length + '행</span><div class="wps-pills">' + leftPills + '</div></div>' +
      '<div class="wps-arrow" aria-hidden="true">&#10140;</div>' +
      '<div class="wps-col"><span class="wps-cl' + (collapse ? ' warn' : ' ok') + '">' + esc(rlabel) + '</span><div class="wps-pills">' + rightPills + '</div></div>';
  }

  // ---- 렌더 ----
  function render() {
    var m = curMode();
    if (!m) return;
    elBtns.innerHTML = modes.map(function (x) {
      return '<button type="button" data-k="' + x.key + '" aria-pressed="' + (x.key === sel ? 'true' : 'false') + '">' + esc(x.btn) + '</button>';
    }).join('');
    elSql.innerHTML = '<span class="wps-sqllbl">ABAP SQL</span><pre>' + esc(m.sql) + '</pre>';
    buildShape(m.key);
    buildTable(m.key);
    elFb.className = 'wps-fb ' + (m.tone || 'brand');
    elFb.innerHTML = m.desc;
    post();
  }

  elBtns.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    sel = b.getAttribute('data-k'); render();
  });

  function post() {
    try {
      if (document.documentElement.clientWidth < 60) return;
      var el = document.querySelector('.wrap');
      var h = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight) + 6;
      parent.postMessage({ sda: 'embed-height', h: h }, '*');
    } catch (e) {}
  }
  window.addEventListener('load', post);
  window.addEventListener('resize', post);

  render();
})();
