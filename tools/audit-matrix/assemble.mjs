/**
 * assemble.mjs — 매트릭스 감사 프롬프트 조립기 (15_AUDIT_MATRIX §4)
 *
 * 사용:
 *   node tools/audit-matrix/assemble.mjs CH01 [CH02 ...]     챕터 스코프 7종(AG01~06·09) 조립
 *   node tools/audit-matrix/assemble.mjs --curriculum        AG07 + AG08(3구간) 조립
 *   옵션: --campaign <이름>   (기본 2026-08-03-matrix-audit)
 *
 * 출력: .archive/<campaign>/_prompts/<TARGET>/AGxx.md  (4모델 공용 1벌)
 *   - {{MODEL_ID}}·{{SERVE_URL}}은 발사 시점 치환(레인별) — 여기서는 남겨 둔다.
 * 섹션: CONST | helpers | assembleChapter | assembleCurriculum | main
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const CONTENT = path.join(ROOT, 'content', 'abap');
const EMBEDS = path.join(ROOT, 'embeds', 'abap');

const CHAPTER_AGENTS = ['AG01', 'AG02', 'AG03', 'AG04', 'AG05', 'AG06', 'AG09'];
const AG08_RANGES = [
  { target: 'CH01～17', from: 1, to: 17 },
  { target: 'CH18～24', from: 18, to: 24 },
  { target: 'CH25～39', from: 25, to: 39 },
];

const read = (p) => fs.readFileSync(p, 'utf8');
const preamble = read(path.join(HERE, 'preamble.md'));
const schemaJson = read(path.join(HERE, 'schema.json')).trim();

function listLessons(ch) {
  const dir = path.join(CONTENT, ch);
  if (!fs.existsSync(dir)) throw new Error(`챕터 폴더 없음: ${dir}`);
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()
    .map((f) => path.join(dir, f));
}

function listEmbeds(ch) {
  if (!fs.existsSync(EMBEDS)) return [];
  return fs.readdirSync(EMBEDS).filter((f) => f.startsWith(ch + '-') && f.endsWith('.html'))
    .sort().map((f) => path.join(EMBEDS, f));
}

function fill(agent, target, targetFiles, body, contextBlocks = '') {
  return preamble
    .replaceAll('{{AGENT_ID}}', agent)
    .replaceAll('{{TARGET}}', target)
    .replace('{{TARGET_FILES}}', targetFiles.map((f) => `- ${f}`).join('\n'))
    .replace('{{CONTEXT_BLOCKS}}', contextBlocks)
    .replace('{{SCHEMA_JSON}}', schemaJson)
    .replace('{{AGENT_BODY}}', body.replaceAll('{{TARGET}}', target));
}

// 학습 이력 블록 — CH01～CH(n-1)의 챕터 제목 + 레슨 front-matter introduces 누적(기계 추출).
// 사용자 확정 2026-08-21: 발견자에게 "여기까지 배운 상태"를 제공(감사 판정문은 계속 비공개).
function learnedSoFar(ch) {
  const n = parseInt(ch.slice(2), 10);
  if (!Number.isFinite(n) || n <= 1) return '';
  const lines = [];
  for (let i = 1; i < n; i++) {
    const cid = 'CH' + String(i).padStart(2, '0');
    const dir = path.join(CONTENT, cid);
    if (!fs.existsSync(dir)) continue;
    let title = '';
    const concepts = [];
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
      const src = read(path.join(dir, f));
      if (f === '_chapter.md') {
        const m = src.match(/^title:\s*"?([^"\n]+)"?\s*$/m);
        if (m) title = m[1].trim();
        continue;
      }
      const m = src.match(/^introduces:\s*\[(.*)\]\s*$/m);
      if (m && m[1].trim()) {
        for (const c of m[1].split(',')) {
          const v = c.trim().replace(/^"|"$/g, '');
          if (v) concepts.push(v);
        }
      }
    }
    lines.push(`- ${cid} «${title}»: ${concepts.length ? concepts.join(' · ') : '(introduces 미선언)'}`);
  }
  if (!lines.length) return '';
  return [
    '[학습 이력 — 학습자는 이 챕터 직전까지 아래를 이미 배웠다]',
    '- 각 챕터의 정식 도입 개념(front-matter introduces 기계 추출)이다. 판단에 "앞에서 배웠나?"가 중요하면 해당 챕터 원문·학습수단을 직접 열어 확인하라(접근 허용 ②). 아래 목록에 없고 원문에도 없으면 미학습 개념이다.',
    ...lines,
  ].join('\n');
}

function knownFacts() {
  const p = path.join(HERE, 'known-facts.md');
  return fs.existsSync(p) ? read(p).trim() : '';
}

function writeOut(campaign, target, agent, text) {
  const dir = path.join(ROOT, '.archive', campaign, '_prompts', target.replaceAll('～', '-'));
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${agent}.md`);
  fs.writeFileSync(out, text, 'utf8');
  return out;
}

function assembleChapter(campaign, ch) {
  const lessons = listLessons(ch);
  const embeds = listEmbeds(ch);
  // 컨텍스트 주입(배치 7+, 사용자 확정 2026-08-21): 학습 이력 + 확정 사실. 감사 판정문은 비공개 유지.
  const ctx = [learnedSoFar(ch), knownFacts()].filter(Boolean).join('\n\n');
  const made = [];
  for (const agent of CHAPTER_AGENTS) {
    const body = read(path.join(HERE, `${agent}.md`));
    const files = agent === 'AG02' ? [...lessons, ...embeds] : lessons;
    made.push(writeOut(campaign, ch, agent, fill(agent, ch, files, body, ctx)));
  }
  return { chapter: ch, lessons: lessons.length, embeds: embeds.length, prompts: made.length };
}

function assembleCurriculum(campaign) {
  const made = [];
  const ag07Files = [
    path.join(ROOT, '.archive', '_generated', 'GATING_AUDIT.md'),
    path.join(CONTENT) + '  (후보가 가리키는 레슨 원문 — 필요한 파일만 열람)',
  ];
  made.push(writeOut(campaign, 'CURRICULUM', 'AG07',
    fill('AG07', '커리큘럼 전량(게이팅 후보 판정)', ag07Files, read(path.join(HERE, 'AG07.md')))));
  for (const r of AG08_RANGES) {
    const folders = [];
    for (let n = r.from; n <= r.to; n++) {
      const ch = 'CH' + String(n).padStart(2, '0');
      if (fs.existsSync(path.join(CONTENT, ch))) folders.push(path.join(CONTENT, ch) + '  (폴더 전체 .md)');
    }
    made.push(writeOut(campaign, `AG08-${r.target.replaceAll('～', '-')}`, 'AG08',
      fill('AG08', r.target, folders, read(path.join(HERE, 'AG08.md')))));
  }
  return { curriculum: true, prompts: made.length };
}

function main() {
  const args = process.argv.slice(2);
  let campaign = '2026-08-03-matrix-audit';
  const ci = args.indexOf('--campaign');
  if (ci >= 0) { campaign = args[ci + 1]; args.splice(ci, 2); }
  if (!args.length) { console.error('사용법: assemble.mjs CH01 [CH02 ...] | --curriculum [--campaign 이름]'); process.exit(1); }
  const results = [];
  for (const a of args) {
    if (a === '--curriculum') results.push(assembleCurriculum(campaign));
    else if (/^CH\d{2}$/.test(a)) results.push(assembleChapter(campaign, a));
    else { console.error(`알 수 없는 인자: ${a}`); process.exit(1); }
  }
  console.log(JSON.stringify({ campaign, results }, null, 2));
}
main();
