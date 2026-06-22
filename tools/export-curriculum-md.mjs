#!/usr/bin/env node
// SAP Developer Academy — 커리큘럼 개요를 MD로 내보내기 (통합 + 트랙별 + 챕터별)
/**
 * 입력:  content/abap/_tracks.md, CHxx/_chapter.md, CHxx/CHxx-Lnn-*.md (front-matter)
 * 출력:  docs/abap/curriculum.md             (전체 통합 개요)
 *        docs/abap/curriculum-track-01.md …  (트랙별 슬라이스)
 *        docs/abap/curriculum-ch01.md …      (챕터별 슬라이스)
 * 실행:  npm run build:curriculum-md   (= node tools/export-curriculum-md.mjs)
 *
 * 목적: 챕터·레슨 구조를 입도별(전체/트랙/챕터) 단일 MD로 — NotebookLM 소스·AI 부분 분석용.
 * 원칙: 생성물이므로 직접 수정 금지. 내용은 content/abap/**.md 에서 고치고 재생성한다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'content', 'abap');
const OUT_DIR = path.join(ROOT, 'docs', 'abap');

function loadTracks() {
  const raw = fs.readFileSync(path.join(SRC, '_tracks.md'), 'utf8');
  return matter(raw).data.tracks || [];
}
function loadChapters() {
  return fs.readdirSync(SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^CH\d+$/.test(d.name))
    .map((d) => d.name).sort()
    .map((dir) => {
      const chDir = path.join(SRC, dir);
      const meta = matter(fs.readFileSync(path.join(chDir, '_chapter.md'), 'utf8')).data;
      const lessons = fs.readdirSync(chDir)
        .filter((f) => /^CH\d+-L\d+.*\.md$/.test(f))
        .map((f) => matter(fs.readFileSync(path.join(chDir, f), 'utf8')).data)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return { dir, meta, lessons };
    });
}

function arr(a) { return Array.isArray(a) ? a : (a ? [a] : []); }

const PHILO = '학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.';

/* 공통 헤더(통합/트랙/챕터 공유) */
function header(L, title, scopeNote, counts) {
  L.push(`# ${title}`);
  L.push('');
  L.push('> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.');
  L.push(`> 🎯 ${scopeNote}`);
  L.push(`> 📊 ${counts}`);
  L.push(`> 🕒 생성: ${new Date().toISOString()}`);
  L.push('');
  L.push(PHILO);
  L.push('');
  L.push('---');
  L.push('');
}

/* 챕터 1개 블록(### …)을 줄 배열 L에 추가 */
function renderChapter(ch, L) {
  const m = ch.meta;
  L.push(`### ${m.id} · ${m.title}${m.difficulty ? ` _(난이도: ${m.difficulty})_` : ''}`);
  if (m.intro) L.push(`\n> ${m.intro}`);
  const objs = arr(m.objectives);
  if (objs.length) { L.push('\n**학습 목표**'); objs.forEach((o) => L.push(`- ${o}`)); }
  const kws = arr(m.keywords);
  if (kws.length) L.push(`\n**키워드**: ${kws.join(', ')}`);
  L.push(`\n**레슨 (${ch.lessons.length})**`);
  ch.lessons.forEach((l) => {
    const tcode = l.tcode ? ` · T-code: \`${l.tcode}\`${l.tcodeBadge ? `(${l.tcodeBadge})` : ''}` : '';
    L.push(`- **${l.id} · ${l.title}** _(order ${l.order ?? '?'})_${tcode}`);
    const scope = l.direction || '(골격 — 본문 작성 예정)';
    L.push(`  - 다룰 내용: ${scope}`);
    if (l.goals && l.goals !== l.direction) L.push(`  - 학습 목표: ${l.goals}`);
    const lkw = arr(l.keywords);
    if (lkw.length) L.push(`  - 키워드: ${lkw.join(', ')}`);
  });
  L.push('');
}

/* 트랙 부분집합 → 통합/트랙별 문서 문자열 */
function renderDoc(tracksSubset, byTrack, { title, scopeNote }) {
  const chsAll = tracksSubset.flatMap((t) => byTrack.get(t.id) || []);
  const totalLessons = chsAll.reduce((n, c) => n + c.lessons.length, 0);
  const L = [];
  header(L, title, scopeNote, `트랙 ${tracksSubset.length} · 챕터 ${chsAll.length} · 레슨 ${totalLessons}`);
  for (const t of tracksSubset) {
    const chs = (byTrack.get(t.id) || []).sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));
    if (!chs.length) continue;
    L.push(`## ${t.id} · ${t.title || ''}`);
    if (t.intro) L.push(`\n${t.intro}`);
    L.push('');
    for (const ch of chs) renderChapter(ch, L);
    L.push('---');
    L.push('');
  }
  return L.join('\n');
}

/* 챕터 1개 → 챕터별 문서 문자열 */
function renderChapterDoc(ch, track) {
  const L = [];
  const tname = track ? `${track.id} · ${track.title || ''}` : (ch.meta.track || '');
  header(
    L,
    `${ch.meta.id} · ${ch.meta.title} — 커리큘럼 개요`,
    `**${tname}** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.`,
    `레슨 ${ch.lessons.length}`
  );
  renderChapter(ch, L);
  return L.join('\n');
}

function main() {
  const tracks = loadTracks();
  const chapters = loadChapters();
  const byTrack = new Map(tracks.map((t) => [t.id, []]));
  for (const ch of chapters) {
    if (!byTrack.has(ch.meta.track)) byTrack.set(ch.meta.track, []);
    byTrack.get(ch.meta.track).push(ch);
  }
  const trackById = new Map(tracks.map((t) => [t.id, t]));

  fs.mkdirSync(OUT_DIR, { recursive: true });
  // 스테일 방지: 기존 curriculum*.md 제거 후 재생성 (curriculum.json은 .md 아니라 무영향)
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (/^curriculum.*\.md$/.test(f)) fs.rmSync(path.join(OUT_DIR, f));
  }

  // 1) 통합본 — 헤더 문구는 기존 루트 CURRICULUM.md와 동일 유지(회귀 비교 가능)
  fs.writeFileSync(
    path.join(OUT_DIR, 'curriculum.md'),
    renderDoc(tracks, byTrack, {
      title: 'SAP Developer Academy — ABAP 커리큘럼 전체 개요',
      scopeNote: '**목적** — 챕터·레슨 구조 전체를 한 파일로 최신화한 단일 소스. 구글 NotebookLM 등에 업로드해 챕터/레슨별 내용을 확보·전달하는 데 쓴다.',
    }),
    'utf8'
  );

  // 2) 트랙별 (TRACK-01 → curriculum-track-01.md)
  let trackFiles = 0;
  for (const t of tracks) {
    if (!(byTrack.get(t.id) || []).length) continue;
    fs.writeFileSync(
      path.join(OUT_DIR, `curriculum-${t.id.toLowerCase()}.md`),
      renderDoc([t], byTrack, {
        title: `ABAP 커리큘럼 — ${t.id} · ${t.title || ''}`,
        scopeNote: `**목적** — ${t.title || t.id} 트랙 전용 뷰. 전체는 curriculum.md.`,
      }),
      'utf8'
    );
    trackFiles += 1;
  }

  // 3) 챕터별 (CH01 → curriculum-ch01.md)
  let chapterFiles = 0;
  for (const ch of chapters) {
    fs.writeFileSync(
      path.join(OUT_DIR, `curriculum-${ch.meta.id.toLowerCase()}.md`),
      renderChapterDoc(ch, trackById.get(ch.meta.track)),
      'utf8'
    );
    chapterFiles += 1;
  }

  const totalLessons = chapters.reduce((n, c) => n + c.lessons.length, 0);
  console.log(`✓ docs/abap/curriculum.md (통합) + track ${trackFiles} + chapter ${chapterFiles} = ${1 + trackFiles + chapterFiles} files`);
  console.log(`  tracks ${tracks.length} / chapters ${chapters.length} / lessons ${totalLessons}`);
}

main();
