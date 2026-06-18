#!/usr/bin/env node
// SAP Developer Academy — 커리큘럼 빌드 (MD 소스 → JSON 인덱스 + 레슨 HTML)
/**
 * 입력:  content/abap/_tracks.md, content/abap/CHxx/_chapter.md, CHxx/CHxx-Lnn-*.md
 * 출력:  docs/abap/curriculum.json        (Tier1: 트랙→챕터(+슬림 레슨))
 *        docs/abap/lessons/CHxx.json      (Tier2: 챕터별 레슨 상세)
 *        docs/abap/pages/CHxx-Lnn-*.html  (레슨 페이지 — 본문은 MD→HTML)
 *
 * 실행:  npm run build:abap   (= node tools/build-curriculum.mjs)
 *
 * 원칙: HTML은 생성물이므로 직접 수정 금지. 내용은 content/**.md 에서만 고친다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOMAIN = 'abap';
const SRC = path.join(ROOT, 'content', DOMAIN);
const OUT = path.join(ROOT, 'docs', DOMAIN);
const OUT_PAGES = path.join(OUT, 'pages');
const OUT_LESSONS = path.join(OUT, 'lessons');

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const toPosix = (p) => p.split(path.sep).join('/');
const relPosix = (fromDir, toPath) => toPosix(path.relative(fromDir, toPath)) || '.';

/* ---------- marked: 핵심용어 [[term]] / [[term|label]] 인라인 확장 ---------- */
const glossaryExt = {
  name: 'glossary',
  level: 'inline',
  start(src) { const i = src.indexOf('[['); return i < 0 ? undefined : i; },
  tokenizer(src) {
    const m = /^\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/.exec(src);
    if (m) return { type: 'glossary', raw: m[0], term: m[1].trim(), label: (m[2] || m[1]).trim() };
  },
  renderer(t) {
    return `<button class="term" type="button" data-term="${esc(t.term)}">${esc(t.label)}</button>`;
  },
};
/* ---------- marked: 체험 임베드 ::embed <sample경로> | <제목>:: ----------
   sample/ 의 standalone HTML을 "체험 위젯"으로 프레이밍한 iframe으로 펼친다.
   레슨 페이지는 모두 docs/abap/pages/ 깊이 → sample 경로 접두 고정(../../../sample/). */
const embedExt = {
  name: 'embed',
  level: 'block',
  start(src) { const i = src.indexOf('::embed'); return i < 0 ? undefined : i; },
  tokenizer(src) {
    // ::embed <경로> | <제목> | <높이px>::  (제목·높이 선택)
    const m = /^::embed\s+([^\s|]+)\s*(?:\|\s*([^\n|]+?))?\s*(?:\|\s*(\d+))?\s*::/.exec(src);
    if (m) return { type: 'embed', raw: m[0], path: m[1].trim(), title: (m[2] || '').trim(), height: m[3] ? parseInt(m[3], 10) : 0 };
  },
  renderer(t) {
    const src = '../../../sample/' + t.path;
    const title = t.title || '직접 해보기';
    const hStyle = t.height ? ` style="height:${t.height}px"` : '';
    return `<figure class="embed"><figcaption class="embed__cap"><span class="embed__badge">체험</span>` +
      `<span class="embed__title">${esc(title)}</span>` +
      `<a class="embed__open" href="${src}" target="_blank" rel="noopener">↗ 새 탭에서 크게</a></figcaption>` +
      `<iframe class="embed__frame" src="${src}" loading="lazy" title="${esc(title)}"${hStyle}></iframe></figure>\n`;
  },
};
marked.use({ extensions: [glossaryExt, embedExt], gfm: true });

/* ---------- 소스 로딩 ---------- */
function loadTracks() {
  const raw = fs.readFileSync(path.join(SRC, '_tracks.md'), 'utf8');
  const tracks = matter(raw).data.tracks || [];
  return tracks;
}

function loadChapters() {
  const dirs = fs.readdirSync(SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^CH\d+$/.test(d.name))
    .map((d) => d.name)
    .sort();

  return dirs.map((dir) => {
    const chDir = path.join(SRC, dir);
    const meta = matter(fs.readFileSync(path.join(chDir, '_chapter.md'), 'utf8')).data;
    const lessons = fs.readdirSync(chDir)
      .filter((f) => /^CH\d+-L\d+.*\.md$/.test(f))
      .map((f) => {
        const g = matter(fs.readFileSync(path.join(chDir, f), 'utf8'));
        return { slug: f.replace(/\.md$/, ''), data: g.data, body: g.content };
      })
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
    return { dir, meta, lessons };
  });
}

/* ---------- 레슨 HTML 템플릿 (v2-C 셸 골격) ----------
   레이아웃/네비/설정은 shell.js가 data-shell 훅에 주입한다.
   T-code 라벨은 front-matter `tcode`가 있을 때만 emit(Phase 2). */
function renderLessonPage(ch, lesson, trackNo) {
  const assets = relPosix(OUT_PAGES, path.join(ROOT, 'assets'));
  const dataBase = relPosix(OUT_PAGES, OUT) + '/';
  const siteRoot = relPosix(OUT_PAGES, ROOT) + '/';
  const bodyHtml = marked.parse(lesson.body);
  const chId = ch.meta.id;
  const sda = JSON.stringify({ domain: DOMAIN, dataBase, siteRoot });
  const tcode = lesson.data.tcode || '';
  const tcodeBadge = lesson.data.tcodeBadge || '';
  const tags =
    `<span class="tag tag--track">Track ${esc(String(trackNo || 1))}</span>` +
    `<span class="tag tag--ch">Chapter ${esc(String(ch.meta.order ?? ''))}</span>` +
    `<span class="tag tag--ls">Lesson ${esc(String(lesson.data.order ?? ''))}</span>` +
    (ch.meta.difficulty ? `<span class="tag tag--lv">${esc(ch.meta.difficulty)}</span>` : '');
  const tcodeBlock = tcode
    ? `      <section class="lcard tcode">
        <p class="lcard__h"><span class="ic">🖥️</span>이번 Lesson에서 다루는 트랜잭션 코드</p>
        <button class="tcode-label" data-tcode="${esc(tcode)}"${tcodeBadge ? ` data-badge="${esc(tcodeBadge)}"` : ''}>
          ${tcodeBadge ? `<span class="tcode-label__badge">${esc(tcodeBadge)}</span>` : ''}
          <span class="tcode-label__code">${esc(tcode)}</span>
          <span class="tcode-label__hint">자세히 보기 ›</span>
        </button>
      </section>\n`
    : '';
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(lesson.data.title)} · ${esc(ch.meta.title)} · SAP Developer Academy</title>
<link rel="stylesheet" href="${assets}/base.css">
<link rel="stylesheet" href="${assets}/lesson.css">
<link rel="stylesheet" href="${assets}/shell.css">
<script>/* 읽기 설정 선적용(플래시 방지) */(function(){try{var L=localStorage,r=document.documentElement;if(L.getItem('sda.dark')==='1')r.classList.add('dark');if(L.getItem('sda.wide')==='1')r.classList.add('wide');var f=parseInt(L.getItem('sda.fontPx'),10);if(f>=13&&f<=20)r.style.fontSize=f+'px';}catch(e){}})();</script>
</head>
<body data-domain="${DOMAIN}" data-chapter-id="${esc(chId)}" data-lesson-id="${esc(lesson.data.id)}">
<header class="appbar">
  <a class="appbar__home" href="${siteRoot}index.html">🏠 <span class="full">SAP Developer Academy</span></a>
  <span class="appbar__sp"></span>
  <span class="meta">${esc(chId)} · ${esc(ch.meta.title)}</span>
  <a class="btn-soft" href="${siteRoot}pages/abap.html">ABAP 커리큘럼</a>
  <div class="tools">
    <button class="icon-btn" id="fsDec" title="글자 작게">A−</button>
    <button class="icon-btn" id="fsInc" title="글자 크게">A+</button>
    <button class="icon-btn" id="fsReset" title="글자 크기 초기화">↺</button>
    <button class="icon-btn" id="darkBtn" title="다크 모드">🌙</button>
    <button class="icon-btn" id="widthBtn" title="가독 폭 넓게">↔</button>
    <button class="icon-btn fs-btn" title="전체화면" aria-label="전체화면"></button>
  </div>
</header>
<div class="read-progress"><i></i></div>
<div class="scrim"></div>
<nav class="rail" data-shell="rail"></nav>
<button class="railFab" id="railFab" aria-label="네비 열기">☰</button>
<div class="stage">
  <div class="layout">
    <main class="main">
      <nav class="crumb"><a href="${siteRoot}index.html">홈</a> › <a href="${siteRoot}pages/abap.html">ABAP 커리큘럼</a> › ${esc(chId)}</nav>
      <section class="lhead">
        <p class="lhead__eyebrow">${esc(ch.meta.title)}</p>
        <h1>${esc(lesson.data.title)}</h1>
        ${lesson.data.direction ? `<p class="lhead__direction">${esc(lesson.data.direction)}</p>` : ''}
        <div class="tags">${tags}</div>
      </section>
${tcodeBlock}      <article class="prose">
${bodyHtml}
      </article>
      <nav class="lesson-nav" data-shell="prevnext"></nav>
      <footer class="foot">SAP Developer Academy · ${esc(chId)} ${esc(lesson.data.id)}</footer>
    </main>
    <aside class="journey" data-shell="journey"></aside>
  </div>
</div>
<div class="term-popup" data-shell="popup" hidden></div>
<div class="tmodal" data-shell="tmodal" hidden></div>
<script>window.__SDA__=${sda};</script>
<script src="${assets}/shell.js" defer></script>
</body>
</html>
`;
}

/* ---------- main ---------- */
function main() {
  const tracks = loadTracks();
  const chapters = loadChapters();

  fs.mkdirSync(OUT_PAGES, { recursive: true });
  fs.mkdirSync(OUT_LESSONS, { recursive: true });

  // 챕터를 트랙별로 묶기
  const byTrack = new Map(tracks.map((t) => [t.id, []]));
  for (const ch of chapters) {
    const tid = ch.meta.track;
    if (!byTrack.has(tid)) byTrack.set(tid, []);
    byTrack.get(tid).push(ch);
  }

  let pageCount = 0;
  const curriculumTracks = tracks.map((t, trackIdx) => {
    const chs = (byTrack.get(t.id) || [])
      .sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));

    const chapterEntries = chs.map((ch) => {
      // 레슨 HTML + Tier2 작성
      const lessonsTier2 = ch.lessons.map((l) => {
        const href = `pages/${l.slug}.html`;
        fs.writeFileSync(path.join(OUT, href), renderLessonPage(ch, l, trackIdx + 1), 'utf8');
        pageCount += 1;
        return {
          id: l.data.id, title: l.data.title, direction: l.data.direction || '',
          keywords: l.data.keywords || [], order: l.data.order ?? 0, href,
        };
      });
      fs.writeFileSync(
        path.join(OUT_LESSONS, `${ch.meta.id}.json`),
        JSON.stringify({ chapterId: ch.meta.id, chapterTitle: ch.meta.title, lessons: lessonsTier2 }, null, 2),
        'utf8'
      );

      // Tier1 슬림 레슨 목록
      const lessonsSlim = lessonsTier2.map((l) => ({ id: l.id, title: l.title, order: l.order, href: l.href }));
      return {
        id: ch.meta.id, title: ch.meta.title, intro: ch.meta.intro || '',
        objectives: ch.meta.objectives || [], keywords: ch.meta.keywords || [],
        difficulty: ch.meta.difficulty || '', order: ch.meta.order ?? 0,
        lessonCount: lessonsSlim.length, lessons: lessonsSlim,
      };
    });

    return {
      id: t.id, title: t.title, intro: t.intro || '',
      keywords: t.keywords || [], difficulty: t.difficulty || '',
      chapterCount: chapterEntries.length, chapters: chapterEntries,
    };
  });

  const curriculum = {
    domain: DOMAIN, version: 'v6',
    generatedAt: new Date().toISOString(),
    tracks: curriculumTracks,
  };
  fs.writeFileSync(path.join(OUT, 'curriculum.json'), JSON.stringify(curriculum, null, 2), 'utf8');

  // 글로서리 pass-through (source content/abap/glossary.json → docs/abap/glossary.json)
  const glossSrc = path.join(SRC, 'glossary.json');
  let glossCount = 0;
  if (fs.existsSync(glossSrc)) {
    const gloss = JSON.parse(fs.readFileSync(glossSrc, 'utf8'));
    glossCount = Object.keys(gloss).length;
    fs.writeFileSync(path.join(OUT, 'glossary.json'), JSON.stringify(gloss, null, 2), 'utf8');
  }

  // T-code 사전 pass-through (content/abap/tcodes.json → docs/abap/tcodes.json)
  const tcodesSrc = path.join(SRC, 'tcodes.json');
  let tcodeCount = 0;
  if (fs.existsSync(tcodesSrc)) {
    const tc = JSON.parse(fs.readFileSync(tcodesSrc, 'utf8'));
    tcodeCount = Object.keys(tc.tcodes || {}).length;
    fs.writeFileSync(path.join(OUT, 'tcodes.json'), JSON.stringify(tc, null, 2), 'utf8');
  }

  // 글로서리 패리티 점검(경고만, 빌드는 계속) — [[term]] 키가 glossary에 정의돼 있나 (R6)
  if (fs.existsSync(glossSrc)) {
    const gloss = JSON.parse(fs.readFileSync(glossSrc, 'utf8'));
    const missing = new Set();
    for (const ch of chapters) for (const l of ch.lessons) {
      const re = /\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]/g; let m;
      while ((m = re.exec(l.body)) !== null) { const k = m[1].trim(); if (!gloss[k]) missing.add(k); }
    }
    if (missing.size) console.warn(`⚠ glossary 미정의 용어 ${missing.size}건: ${[...missing].slice(0, 20).join(', ')}${missing.size > 20 ? ' …' : ''}`);
    else console.log('✓ glossary parity — 미정의 용어 0건');
  }

  const totalCh = curriculumTracks.reduce((n, t) => n + t.chapterCount, 0);
  console.log(`✓ curriculum.json — ${curriculumTracks.length} tracks / ${totalCh} chapters`);
  console.log(`✓ lessons/*.json  — ${chapters.length} files`);
  console.log(`✓ pages/*.html    — ${pageCount} lessons`);
  console.log(`✓ glossary.json   — ${glossCount} terms`);
  console.log(`✓ tcodes.json     — ${tcodeCount} t-codes`);
}

main();
