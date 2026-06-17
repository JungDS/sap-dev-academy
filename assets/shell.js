/* SAP Developer Academy — 런타임 셸
   생성된 레슨 페이지에 공통 헤더 · 좌측 3탭 네비(이 문서/레슨/챕터) ·
   이전/다음 · 핵심용어 팝업을 주입한다.
   데이터: curriculum.json, glossary.json (window.__SDA__.dataBase 기준 fetch).
   ※ fetch를 쓰므로 file:// 가 아니라 HTTP로 서빙해야 동작한다. */
(function () {
  "use strict";
  var cfg = window.__SDA__ || { dataBase: "../", siteRoot: "../../../", domain: "abap" };
  var DATA = cfg.dataBase, ROOT = cfg.siteRoot;
  var body = document.body;
  var chapterId = body.getAttribute("data-chapter-id");
  var lessonId = body.getAttribute("data-lesson-id");

  function getJSON(p) { return fetch(DATA + p).then(function (r) { if (!r.ok) throw new Error(p); return r.json(); }); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function slug(s) { return String(s).trim().toLowerCase().replace(/[^\w가-힣]+/g, "-").replace(/^-+|-+$/g, "") || "sec"; }

  /* ---- 상단바 ---- */
  function topbar() {
    var host = document.querySelector('[data-shell="topbar"]'); if (!host) return;
    host.innerHTML =
      '<div class="topbar__inner">' +
        '<a class="brand" href="' + ROOT + 'index.html"><span class="brand__mark">A</span><span>SAP Developer Academy</span></a>' +
        '<div class="topbar__utils"><a href="' + ROOT + 'pages/abap.html">ABAP 커리큘럼</a></div>' +
      '</div>';
  }

  /* ---- 좌측 3탭 네비 ---- */
  function tabBtn(label, key, active) {
    var b = h("button", "sidenav__tab" + (active ? " is-active" : ""), label);
    b.type = "button"; b.setAttribute("data-tab", key); return b;
  }
  function tocPanel() {
    var ul = h("ul", "sidenav__list");
    var hs = document.querySelectorAll(".prose h2, .prose h3");
    var used = {};
    hs.forEach(function (el) {
      var id = el.id;
      if (!id) { id = slug(el.textContent); if (used[id]) { id += "-" + (++used[id]); } else { used[id] = 1; } el.id = id; }
      var li = h("li"); var a = h("a", el.tagName === "H3" ? "toc-h3" : "", esc(el.textContent));
      a.href = "#" + id; li.appendChild(a); ul.appendChild(li);
    });
    if (!hs.length) ul.appendChild(h("li", "", '<span style="color:var(--soon);font-size:.84rem">섹션 없음</span>'));
    return ul;
  }
  function lessonsPanel(lessons) {
    var ul = h("ul", "sidenav__list");
    lessons.forEach(function (l) {
      var li = h("li");
      var a = h("a", l.id === lessonId ? "is-current" : "",
        '<span class="sidenav__num">' + esc(String(l.order)) + '</span>' + esc(l.title));
      a.href = DATA + l.href; li.appendChild(a); ul.appendChild(li);
    });
    return ul;
  }
  function chaptersPanel(curr) {
    var ul = h("ul", "sidenav__list");
    curr.tracks.forEach(function (t) {
      (t.chapters || []).forEach(function (c) {
        if (!c.lessons || !c.lessons.length) return;
        var li = h("li");
        var a = h("a", c.id === chapterId ? "is-current" : "",
          '<span class="sidenav__num">' + esc(c.id) + '</span>' + esc(c.title));
        a.href = DATA + c.lessons[0].href; li.appendChild(a); ul.appendChild(li);
      });
    });
    return ul;
  }
  function sidenav(curr, chLessons) {
    var host = document.querySelector('[data-shell="sidenav"]'); if (!host) return;
    var tabs = h("div", "sidenav__tabs");
    tabs.appendChild(tabBtn("이 문서", "toc", true));
    tabs.appendChild(tabBtn("레슨", "lesson", false));
    tabs.appendChild(tabBtn("챕터", "chapter", false));
    host.appendChild(tabs);
    var panels = {
      toc: h("div", "sidenav__panel is-active"),
      lesson: h("div", "sidenav__panel"),
      chapter: h("div", "sidenav__panel")
    };
    panels.toc.appendChild(tocPanel());
    panels.lesson.appendChild(lessonsPanel(chLessons));
    panels.chapter.appendChild(chaptersPanel(curr));
    host.appendChild(panels.toc); host.appendChild(panels.lesson); host.appendChild(panels.chapter);
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest(".sidenav__tab"); if (!b) return;
      tabs.querySelectorAll(".sidenav__tab").forEach(function (x) { x.classList.toggle("is-active", x === b); });
      var key = b.getAttribute("data-tab");
      Object.keys(panels).forEach(function (k) { panels[k].classList.toggle("is-active", k === key); });
    });
  }

  /* ---- 이전/다음 (전 커리큘럼 순서) ---- */
  function prevnext(curr) {
    var host = document.querySelector('[data-shell="prevnext"]'); if (!host) return;
    var flat = [];
    curr.tracks.forEach(function (t) { (t.chapters || []).forEach(function (c) { (c.lessons || []).forEach(function (l) { flat.push(l); }); }); });
    var i = flat.findIndex(function (l) { return l.id === lessonId; });
    var prev = i > 0 ? flat[i - 1] : null;
    var next = (i >= 0 && i < flat.length - 1) ? flat[i + 1] : null;
    host.innerHTML =
      (prev ? '<a class="prev" href="' + DATA + prev.href + '"><span class="dir">← 이전</span><span class="ttl">' + esc(prev.title) + '</span></a>' : '<span></span>') +
      (next ? '<a class="next" href="' + DATA + next.href + '"><span class="dir">다음 →</span><span class="ttl">' + esc(next.title) + '</span></a>' : '<span></span>');
  }

  /* ---- 핵심용어 팝업 ---- */
  function glossary(gloss) {
    var pop = document.querySelector('[data-shell="popup"]'); if (!pop || !gloss) return;
    function hide() { pop.hidden = true; }
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest(".term") : null;
      if (!t) { if (!(e.target.closest && e.target.closest(".term-popup"))) hide(); return; }
      e.preventDefault();
      var g = gloss[t.getAttribute("data-term")];
      if (!g) return;
      pop.innerHTML =
        '<button class="term-popup__close" type="button" aria-label="닫기">×</button>' +
        '<p class="term-popup__title">' + esc(g.title || t.getAttribute("data-term")) + '</p>' +
        '<p class="term-popup__desc">' + esc(g.desc || "") + '</p>' +
        (g.analogy ? '<p class="term-popup__analogy">' + esc(g.analogy) + '</p>' : '');
      pop.hidden = false;
      var r = t.getBoundingClientRect();
      pop.style.top = (window.scrollY + r.bottom + 8) + "px";
      pop.style.left = (window.scrollX + Math.min(r.left, document.documentElement.clientWidth - 340)) + "px";
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
    pop.addEventListener("click", function (e) { if (e.target.closest(".term-popup__close")) hide(); });
  }

  /* ---- init ---- */
  topbar();
  getJSON("curriculum.json").then(function (curr) {
    var chLessons = [];
    curr.tracks.forEach(function (t) { (t.chapters || []).forEach(function (c) { if (c.id === chapterId) chLessons = c.lessons || []; }); });
    sidenav(curr, chLessons);
    prevnext(curr);
  }).catch(function () { /* 데이터 없음/HTTP 아님 — 본문은 그대로 표시 */ });
  getJSON("glossary.json").then(glossary).catch(function () {});
})();
