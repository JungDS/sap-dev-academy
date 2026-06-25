/* SAP Developer Academy — 런타임 셸 (v2-C 구조)
   생성된 레슨 페이지에 앱바 설정 · 좌측 아이콘 레일(레슨/챕터/용어) · 우측 "이 레슨의 여정"
   (섹션 스크롤스파이, 모바일 하단 시트) · 용어 hover/click 팝업 · 읽기 진행률 · 이전/다음을 주입.
   §0 진입 시 항상 최상단(scrollRestoration='manual' + pageshow) — 이전/다음 왕복 시 중간 시작 방지.
   데이터: curriculum.json은 __SDA__.dataBase(docs/abap), glossary·tcodes는 __SDA__.siteRoot+reference/ 기준 fetch. fetch라 HTTP 서빙 필수.
   레퍼런스: sample/structure/lesson-shell-v2-c.html · 규칙: .project-docs/08_LESSON_SHELL_SPEC.md
   ※ T-code 미니페이지 모달은 Phase 2(tcodes.json + front-matter tcode)에서 추가. */
(function () {
  "use strict";
  var cfg = window.__SDA__ || { dataBase: "../", siteRoot: "../../../", domain: "abap" };
  var DATA = cfg.dataBase;
  var doc = document, body = doc.body, root = doc.documentElement;
  var chapterId = body.getAttribute("data-chapter-id");
  var lessonId = body.getAttribute("data-lesson-id");

  function getJSON(p) { return fetch(DATA + p).then(function (r) { if (!r.ok) throw new Error(p); return r.json(); }); }
  var REF = (cfg.siteRoot || "../../../") + "reference/";  // 참조 데이터(glossary·tcodes)는 reference/에서 직접 fetch
  function getRef(p) { return fetch(REF + p).then(function (r) { if (!r.ok) throw new Error(p); return r.json(); }); }
  function byId(id) { return doc.getElementById(id); }
  function q(s) { return doc.querySelector(s); }
  function qa(s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function slug(s) { return String(s).trim().toLowerCase().replace(/[^\w가-힣]+/g, "-").replace(/^-+|-+$/g, "") || "sec"; }
  function isMobile() { return window.matchMedia("(max-width:1000px)").matches; }
  var LS = (function () { try { return window.localStorage; } catch (e) { return null; } })();
  function lsGet(k) { try { return LS && LS.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { LS && LS.setItem(k, v); } catch (e) {} }

  /* ===== 0. 진입 시 항상 최상단 =====
     브라우저 기본 history.scrollRestoration='auto'는 이미 방문한 레슨을 다시 열 때(이전/다음 왕복 등)
     직전 스크롤 위치를 복원해 페이지 중간에서 시작하게 만든다. 복원을 끄고, 모든 표시 시점
     (초기 로드 + bfcache 뒤로/앞으로 = pageshow)에서 맨 위로 보낸다. 단 의도된 #앵커 이동은 존중. */
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  window.addEventListener("pageshow", function () { if (!location.hash) window.scrollTo(0, 0); });

  var spyFn = null; // 여정 scroll-spy (있으면 스크롤 핸들러가 호출)

  /* ===== 1. 읽기 설정: 글자 크기 / 다크 / 가독 폭 / 전체화면 ===== */
  function settings() {
    var darkBtn = byId("darkBtn"), widthBtn = byId("widthBtn"), fsBtn = q(".fs-btn");
    var fsInc = byId("fsInc"), fsDec = byId("fsDec"), fsReset = byId("fsReset");
    if (!darkBtn) return;
    var FMIN = 13, FMAX = 20, FDEF = 16;
    var fontPx = parseInt(lsGet("sda.fontPx"), 10); if (!(fontPx >= FMIN && fontPx <= FMAX)) fontPx = FDEF;
    function syncFont() { fsDec.disabled = fontPx <= FMIN; fsInc.disabled = fontPx >= FMAX; fsReset.disabled = fontPx === FDEF; }
    function applyFont() { root.style.fontSize = fontPx + "px"; lsSet("sda.fontPx", String(fontPx)); syncFont(); }
    fsInc.onclick = function () { fontPx = Math.min(FMAX, fontPx + 1); applyFont(); };
    fsDec.onclick = function () { fontPx = Math.max(FMIN, fontPx - 1); applyFont(); };
    fsReset.onclick = function () { fontPx = FDEF; applyFont(); };
    function syncDark() { var on = root.classList.contains("dark"); darkBtn.textContent = on ? "☀️" : "🌙"; darkBtn.classList.toggle("on", on); darkBtn.title = on ? "라이트 모드" : "다크 모드"; }
    function syncWide() { var on = root.classList.contains("wide"); widthBtn.classList.toggle("on", on); widthBtn.title = on ? "가독 폭 기본" : "가독 폭 넓게"; }
    darkBtn.onclick = function () { root.classList.toggle("dark"); lsSet("sda.dark", root.classList.contains("dark") ? "1" : "0"); syncDark(); };
    widthBtn.onclick = function () { root.classList.toggle("wide"); lsSet("sda.wide", root.classList.contains("wide") ? "1" : "0"); syncWide(); };
    var FS_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
    var FS_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/></svg>';
    if (fsBtn) {
      fsBtn.innerHTML = FS_OPEN;
      fsBtn.onclick = function () {
        if (!doc.fullscreenElement && !doc.webkitFullscreenElement) { (root.requestFullscreen || root.webkitRequestFullscreen || function () {}).call(root); }
        else { (doc.exitFullscreen || doc.webkitExitFullscreen || function () {}).call(doc); }
      };
      var prevWide = null;
      var onFs = function () {
        var on = !!(doc.fullscreenElement || doc.webkitFullscreenElement);
        body.classList.toggle("is-fullscreen", on);
        fsBtn.innerHTML = on ? FS_CLOSE : FS_OPEN; fsBtn.title = on ? "전체화면 해제" : "전체화면";
        if (on) { if (prevWide === null) prevWide = root.classList.contains("wide"); root.classList.add("wide"); widthBtn.disabled = true; }
        else { if (prevWide !== null) { root.classList.toggle("wide", prevWide); prevWide = null; } widthBtn.disabled = false; }
        syncWide();
      };
      doc.addEventListener("fullscreenchange", onFs); doc.addEventListener("webkitfullscreenchange", onFs);
    }
    syncDark(); syncWide(); syncFont();
  }

  /* ===== 2. 우측 "이 레슨의 여정" (본문 h2 → 스텝퍼, 스크롤스파이, 모바일 하단 시트) ===== */
  function buildJourney() {
    var host = q('[data-shell="journey"]'); if (!host) return;
    var hs = qa(".prose h2");
    if (!hs.length) { host.hidden = true; return; }
    var used = {}, stepsHtml = "";
    hs.forEach(function (el) {
      var id = el.id;
      if (!id) { id = slug(el.textContent); if (used[id]) { id += "-" + (++used[id]); } else { used[id] = 1; } el.id = id; }
      stepsHtml += '<li class="step" data-go="' + id + '"><span class="step__dot"></span><span class="step__t">' + esc(el.textContent) + "</span></li>";
    });
    host.innerHTML =
      '<button class="journey__bar" id="journeyBar" aria-expanded="false">' +
        '<span class="journey__now"><small>이 레슨의 여정</small><b id="jNow"></b></span>' +
        '<span class="journey__count"><span id="jIdx">1</span> / <span id="jTot">' + hs.length + "</span></span>" +
        '<span class="journey__chev" aria-hidden="true">▾</span>' +
      "</button>" +
      '<div class="journey__body"><p class="journey__hd">이 레슨의 여정</p>' +
      '<p class="journey__sub">스크롤에 따라 현재 위치가 표시돼요.</p>' +
      '<ul class="steps" id="steps">' + stepsHtml + "</ul></div>";
    var steps = qa(".step"), secs = steps.map(function (s) { return byId(s.getAttribute("data-go")); });
    var stepsEl = byId("steps"), bar = byId("journeyBar"), jNow = byId("jNow"), jIdx = byId("jIdx");
    function closeSheet() { host.classList.remove("up"); body.classList.remove("jup"); bar.setAttribute("aria-expanded", "false"); }
    bar.onclick = function () { var up = host.classList.toggle("up"); body.classList.toggle("jup", up); bar.setAttribute("aria-expanded", up ? "true" : "false"); };
    steps.forEach(function (st, i) { st.onclick = function () { if (secs[i]) secs[i].scrollIntoView({ behavior: "smooth", block: "start" }); if (isMobile()) closeSheet(); }; });
    spyFn = function () {
      var idx = 0;
      for (var i = 0; i < secs.length; i++) { if (secs[i] && secs[i].getBoundingClientRect().top <= 150) idx = i; }
      steps.forEach(function (s, i) { s.classList.toggle("current", i === idx); s.classList.toggle("visited", i < idx); });
      stepsEl.style.setProperty("--progress", (steps.length > 1 ? (idx / (steps.length - 1)) * 100 : 0) + "%");
      var cur = steps[idx]; if (cur) { jNow.textContent = cur.querySelector(".step__t").textContent; jIdx.textContent = idx + 1; }
    };
  }

  /* ===== 3. 읽기 진행률 + 스크롤 핸들러 ===== */
  function scrollInit() {
    var rp = q(".read-progress>i");
    function onScroll() {
      var hgt = doc.documentElement.scrollHeight - window.innerHeight;
      if (rp) rp.style.width = (hgt > 0 ? Math.min(100, window.scrollY / hgt * 100) : 0) + "%";
      if (spyFn) spyFn();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  /* ===== 4. 좌측 아이콘 레일 (레슨 / 챕터 / 용어) ===== */
  function buildRail(curr, gloss) {
    var host = q('[data-shell="rail"]'); if (!host) return;
    var chLessons = [], allChaps = [], chTitle = "";
    curr.tracks.forEach(function (t) {
      (t.chapters || []).forEach(function (c) {
        if (!c.lessons || !c.lessons.length) return;
        allChaps.push(c);
        if (c.id === chapterId) { chLessons = c.lessons; chTitle = c.title; }
      });
    });
    var lessonHtml = chLessons.map(function (l) {
      return '<li><a class="' + (l.id === lessonId ? "on" : "") + '" href="' + DATA + l.href + '"><small>LESSON ' + esc(String(l.order)) + '</small><span class="t">' + esc(l.title) + "</span></a></li>";
    }).join("");
    var chapHtml = allChaps.map(function (c) {
      return '<li><a class="' + (c.id === chapterId ? "on" : "") + '" href="' + DATA + c.lessons[0].href + '"><small>' + esc(c.id) + '</small><span class="t">' + esc(c.title) + "</span></a></li>";
    }).join("");
    var seen = {}, termsArr = [];
    qa(".prose .term").forEach(function (t) { var k = t.getAttribute("data-term"); if (!k || seen[k]) return; seen[k] = 1; termsArr.push(k); });
    var termsHtml = termsArr.map(function (k) { var g = (gloss && gloss[k]) || {}; return "<li><b>" + esc(g.title || k) + "</b><span>" + esc(g.desc || "") + "</span></li>"; }).join("");
    host.innerHTML =
      '<div class="rail__icons">' +
        '<button class="rail__btn on" data-rtab="lesson" title="레슨">📑</button>' +
        '<button class="rail__btn" data-rtab="chapter" title="챕터">🗺️</button>' +
        '<button class="rail__btn" data-rtab="terms" title="용어">📖</button>' +
      "</div>" +
      '<div class="rail__expand">' +
        '<div class="rail__hd"><b>학습 네비</b><button class="rail__x" title="접기">«</button></div>' +
        '<div class="rail__tabs"><button class="rail__tab on" data-rtab="lesson">레슨</button><button class="rail__tab" data-rtab="chapter">챕터</button><button class="rail__tab" data-rtab="terms">용어</button></div>' +
        '<div class="rail__panel on" data-rpanel="lesson"><p class="rail__chap">현재 Chapter · ' + esc(chTitle) + '</p><ul class="ll">' + lessonHtml + "</ul></div>" +
        '<div class="rail__panel" data-rpanel="chapter"><ul class="ll">' + chapHtml + "</ul></div>" +
        '<div class="rail__panel" data-rpanel="terms">' +
          (termsHtml
            ? '<p class="glos__note">이 레슨의 핵심 용어입니다. 본문 점선 용어에 마우스를 올리면 바로 뜻이 떠요.</p><ul class="glos">' + termsHtml + "</ul>"
            : '<p class="rail__empty">이 레슨엔 표시된 핵심 용어가 없어요.</p>') +
        "</div>" +
      "</div>";
    function setTab(tab) {
      host.querySelectorAll("[data-rtab]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-rtab") === tab); });
      host.querySelectorAll("[data-rpanel]").forEach(function (p) { p.classList.toggle("on", p.getAttribute("data-rpanel") === tab); });
    }
    function openRail(tab) { host.classList.add("open"); if (isMobile()) body.classList.add("rail-open"); if (tab) setTab(tab); }
    function closeRail() { host.classList.remove("open"); body.classList.remove("rail-open"); }
    host.querySelectorAll(".rail__icons .rail__btn").forEach(function (b) { b.onclick = function () { openRail(b.getAttribute("data-rtab")); }; });
    host.querySelectorAll(".rail__tab").forEach(function (b) { b.onclick = function () { setTab(b.getAttribute("data-rtab")); }; });
    var x = host.querySelector(".rail__x"); if (x) x.onclick = closeRail;
    var scrim = q(".scrim"); if (scrim) scrim.onclick = closeRail;
    var fab = byId("railFab"); if (fab) fab.onclick = function () { host.classList.contains("open") ? closeRail() : openRail(); };
    host.addEventListener("mouseenter", function () { if (!isMobile()) host.classList.add("open"); });
    host.addEventListener("mouseleave", function () { if (!isMobile()) host.classList.remove("open"); });
    window.addEventListener("resize", function () { if (!isMobile()) body.classList.remove("rail-open"); });
  }

  /* ===== 5. 용어 팝업 (hover=임시, click=고정) ===== */
  function initTermPopup(gloss) {
    var pop = q('[data-shell="popup"]'); if (!pop) return;
    var curTerm = null, pinned = false;
    function place(t) { var r = t.getBoundingClientRect(); pop.style.left = Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - 312) + "px"; pop.style.top = (r.bottom + window.scrollY + 8) + "px"; }
    function build(t) {
      var g = gloss[t.getAttribute("data-term")] || { title: t.getAttribute("data-term"), desc: "" };
      pop.className = "term-popup";
      pop.innerHTML =
        '<button class="term-popup__x" aria-label="닫기">×</button>' +
        '<b class="term-popup__title">' + esc(g.title || t.getAttribute("data-term")) + "</b>" +
        '<span class="term-popup__desc">' + esc(g.desc || "") + "</span>" +
        (g.analogy ? '<p class="term-popup__analogy">' + esc(g.analogy) + "</p>" : "") +
        '<span class="term-popup__pin">📌 클릭하면 고정</span>';
      pop.hidden = false; place(t);
      pop.querySelector(".term-popup__x").onclick = function () { destroy(true); };
    }
    function destroy(force) { if (!pop.hidden && (force || !pinned)) { pop.hidden = true; curTerm = null; pinned = false; pop.classList.remove("pinned"); } }
    function show(t) { if (curTerm === t && !pop.hidden) return; destroy(true); curTerm = t; pinned = false; build(t); }
    qa(".prose .term").forEach(function (t) {
      t.addEventListener("mouseenter", function () { show(t); });
      t.addEventListener("mouseleave", function () { if (!pinned) destroy(); });
      t.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        if (curTerm !== t || pop.hidden) show(t);
        pinned = true; pop.classList.add("pinned");
        var pin = pop.querySelector(".term-popup__pin"); if (pin) pin.textContent = "📌 고정됨 · 바깥을 누르면 닫힘";
      });
    });
    doc.addEventListener("click", function (e) {
      if (pinned && !pop.hidden && !pop.contains(e.target) && !(e.target.classList && e.target.classList.contains("term"))) destroy(true);
    });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") destroy(true); });
  }

  /* ===== 6. 이전/다음 (전 커리큘럼 순서) ===== */
  function prevnext(curr) {
    var host = q('[data-shell="prevnext"]'); if (!host) return;
    var flat = [];
    curr.tracks.forEach(function (t) { (t.chapters || []).forEach(function (c) { (c.lessons || []).forEach(function (l) { flat.push(l); }); }); });
    var i = flat.findIndex(function (l) { return l.id === lessonId; });
    var prev = i > 0 ? flat[i - 1] : null;
    var next = (i >= 0 && i < flat.length - 1) ? flat[i + 1] : null;
    host.innerHTML =
      (prev ? '<a class="prev" href="' + DATA + prev.href + '"><span class="dir">← 이전 LESSON</span><span class="ttl">' + esc(prev.title) + "</span></a>" : "<span></span>") +
      (next ? '<a class="next" href="' + DATA + next.href + '"><span class="dir">다음 LESSON →</span><span class="ttl">' + esc(next.title) + "</span></a>" : "<span></span>");
  }

  /* ===== 7. T-code 공통 미니페이지 모달 (라벨 클릭 → 모달, 객체 칩 → 2차 요약 팝업) ===== */
  function initTcode(tc) {
    var modal = q('[data-shell="tmodal"]'), labels = qa(".tcode-label");
    if (!modal || !labels.length) return;
    var tcodes = tc.tcodes || {}, objects = tc.objects || {};
    function objChips(groups) {
      return (groups || []).map(function (g) {
        return '<div class="objgroup"><span class="objgroup__l">' + esc(g.label) + '</span><span class="objgroup__chips">' +
          (g.items || []).map(function (it) { return '<button class="objchip" data-sum="' + esc(it) + '">' + esc(it) + "</button>"; }).join("") +
          "</span></div>";
      }).join("");
    }
    function renderBody(d) {
      var h = "<h4>📌 한 줄 정의</h4><p>" + esc(d.intro) + "</p>";
      if (d.open) h += '<h4>🚪 어떻게 여나요?</h4><p>명령 필드에 입력하고 Enter:</p><div class="cmdfield">' + esc(d.open) + "</div>";
      if (d.groups && d.groups.length) h += '<h4>🛠️ 여기서 다루는 객체</h4><p class="dim">항목을 누르면 한 줄 설명이 떠요.</p>' + objChips(d.groups);
      if (d.pitfalls && d.pitfalls.length) h += "<h4>⚠️ 자주 걸리는 점</h4><ul>" + d.pitfalls.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul>";
      if (d.related && d.related.length) h += '<h4>🔗 함께 보는 트랜잭션</h4><div class="related">' + d.related.map(function (r) { return '<span title="' + esc(r[1] || "") + '">' + esc(r[0]) + "</span>"; }).join("") + "</div>";
      return h;
    }
    var sumPop = null;
    function closeSum() { if (sumPop) { sumPop.remove(); sumPop = null; } }
    function showSum(chip) {
      closeSum();
      var key = chip.getAttribute("data-sum");
      sumPop = doc.createElement("div"); sumPop.className = "sum-popup";
      sumPop.innerHTML = "<b>" + esc(key) + "</b><span>" + esc(objects[key] || "") + "</span>";
      doc.body.appendChild(sumPop);
      var r = chip.getBoundingClientRect();
      sumPop.style.left = Math.min(r.left, window.innerWidth - sumPop.offsetWidth - 12) + "px";
      sumPop.style.top = (r.bottom + 8) + "px";
    }
    function close() { modal.hidden = true; body.style.overflow = ""; closeSum(); }
    function open(code, badge) {
      var d = tcodes[code]; if (!d) return;
      modal.innerHTML =
        '<div class="tmodal__backdrop" data-close></div>' +
        '<div class="tmodal__card" role="dialog" aria-modal="true">' +
          '<header class="tmodal__hd">' + (badge ? '<span class="tmodal__badge">' + esc(badge) + "</span>" : "") +
            '<div><span class="tmodal__code">' + esc(code) + '</span><span class="tmodal__sub">' + esc(d.sub || "") + "</span></div>" +
            '<button class="tmodal__x" data-close aria-label="닫기">×</button>' +
          "</header>" +
          '<div class="tmodal__body">' + renderBody(d) + "</div>" +
        "</div>";
      modal.hidden = false; body.style.overflow = "hidden";
      modal.querySelectorAll("[data-close]").forEach(function (el) { el.onclick = close; });
      modal.querySelectorAll(".objchip").forEach(function (c) { c.onclick = function (e) { e.stopPropagation(); showSum(c); }; });
      modal.querySelector(".tmodal__body").addEventListener("click", function (e) { if (!e.target.classList.contains("objchip")) closeSum(); });
    }
    labels.forEach(function (b) { b.addEventListener("click", function () { open(b.getAttribute("data-tcode"), b.getAttribute("data-badge")); }); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) close(); });
  }

  /* ===== 코드 복사 버튼 (.abap-editor / code-copy-block 양식) ===== */
  function codeCopy() {
    doc.addEventListener("click", function (e) {
      var btn = e.target.closest(".copy-btn"); if (!btn) return;
      var ed = btn.closest(".abap-editor"); if (!ed) return;
      var codeEl = ed.querySelector(".abap-editor__code"); if (!codeEl) return;
      var done = function () {
        var o = btn.getAttribute("data-o") || btn.textContent;
        btn.setAttribute("data-o", o); btn.textContent = "✓ 복사됨"; btn.classList.add("is-copied");
        setTimeout(function () { btn.textContent = o; btn.classList.remove("is-copied"); }, 1600);
      };
      var text = codeEl.innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(done);
      else done();
    });
  }

  /* ===== 임베드 iframe 자동 높이 (컴포넌트가 postMessage 로 높이 전송) ===== */
  function embedAutoHeight() {
    window.addEventListener("message", function (e) {
      var d = e.data;
      if (!d || d.sda !== "embed-height" || !d.h) return;
      var frames = qa(".embed__frame");
      for (var i = 0; i < frames.length; i++) {
        if (frames[i].contentWindow === e.source) { frames[i].style.height = d.h + "px"; break; }
      }
    });
  }

  /* ===== init ===== */
  settings();
  buildJourney();
  scrollInit();
  codeCopy();
  embedAutoHeight();
  var needTcode = !!q(".tcode-label");
  Promise.all([
    getJSON("curriculum.json").catch(function () { return null; }),
    getRef("glossary.json").catch(function () { return null; }),
    needTcode ? getRef("tcodes.json").catch(function () { return null; }) : Promise.resolve(null),
  ]).then(function (res) {
    var curr = res[0], gloss = res[1], tc = res[2];
    if (gloss) initTermPopup(gloss);
    if (tc) initTcode(tc);
    if (curr) { buildRail(curr, gloss || {}); prevnext(curr); }
  });
})();
