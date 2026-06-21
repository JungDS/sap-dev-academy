#!/usr/bin/env node
// SAP Developer Academy — 커리큘럼 전체를 단일 MD로 내보내기 (NotebookLM 소스용)
/**
 * 입력:  content/abap/_tracks.md, CHxx/_chapter.md, CHxx/CHxx-Lnn-*.md (front-matter)
 * 출력:  CURRICULUM.md  (저장소 루트 · 전 챕터/레슨 구조 + 레슨별 다룰내용 개요)
 * 실행:  npm run build:curriculum-md   (= node tools/export-curriculum-md.mjs)
 *
 * 목적: 챕터·레슨 구조가 바뀌어도 한 파일로 최신 전체 개요를 확보 → 구글 NotebookLM 등에 소스로 전달.
 * 원칙: 생성물이므로 직접 수정 금지. 내용은 content/abap/**.md 에서 고치고 재생성한다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'content', 'abap');
const OUT = path.join(ROOT, 'CURRICULUM.md');

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

function main() {
  const tracks = loadTracks();
  const chapters = loadChapters();
  const byTrack = new Map(tracks.map((t) => [t.id, []]));
  for (const ch of chapters) {
    if (!byTrack.has(ch.meta.track)) byTrack.set(ch.meta.track, []);
    byTrack.get(ch.meta.track).push(ch);
  }
  const totalLessons = chapters.reduce((n, c) => n + c.lessons.length, 0);

  const L = [];
  L.push('# SAP Developer Academy — ABAP 커리큘럼 전체 개요');
  L.push('');
  L.push('> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.');
  L.push('> 🎯 **목적** — 챕터·레슨 구조 전체를 한 파일로 최신화한 단일 소스. 구글 NotebookLM 등에 업로드해 챕터/레슨별 내용을 확보·전달하는 데 쓴다.');
  L.push(`> 📊 트랙 ${tracks.length} · 챕터 ${chapters.length} · 레슨 ${totalLessons}`);
  L.push(`> 🕒 생성: ${new Date().toISOString()}`);
  L.push('');
  L.push('학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.');
  L.push('');
  L.push('---');
  L.push('');

  for (const t of tracks) {
    const chs = (byTrack.get(t.id) || []).sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));
    if (!chs.length) continue;
    L.push(`## ${t.id} · ${t.title || ''}`);
    if (t.intro) L.push(`\n${t.intro}`);
    L.push('');

    for (const ch of chs) {
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
    L.push('---');
    L.push('');
  }

  fs.writeFileSync(OUT, L.join('\n'), 'utf8');
  console.log(`✓ CURRICULUM.md — ${tracks.length} tracks / ${chapters.length} chapters / ${totalLessons} lessons`);
}

main();
