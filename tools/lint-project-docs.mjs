#!/usr/bin/env node
/* =============================================================
   lint-project-docs.mjs — .project-docs 무결성 린트 (재발 자동 차단)
   -------------------------------------------------------------
   설계 정본·근거 = .archive/_generated/DOC_VERIFICATION_SCORECARD.md
   우선축 ②내구·⑦측정·③독자적합. 실행: `node tools/lint-project-docs.mjs`
   (pre-commit/CI 연결 가능 — FAIL이면 exit 1.)

   밴드 (사용자 합의 2026-06-30):
   - FAIL(게이트, exit 1): 오탐≈0만 — M 기계계열(+개수복창 span 금지) · S1 링크/경로 ·
     S2a 안정ID(max는 04/05서 도출) · 섹션참조 · S3 토큰예산 · S3b 타임스탬프형식.
   - WARN(자문, exit 0, "클린"이라 말 안 함 → 거짓그린 차단): 6 포인터비대칭 · 8 point-of-use.
   - 제외: 7 중복면.   MANUAL(린트 밖, L2·L4): 9 제목↔본문.
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PD = path.join(ROOT, '.project-docs');
const rel2abs = r => path.join(ROOT, r);
const slash = r => r.replace(/\\/g, '/');

// 스캔 대상 = AI 문서 집합(.project-docs + 부팅 동반 + 위젯 계약)
const PD_FILES = fs.readdirSync(PD).filter(f => f.endsWith('.md')).map(f => '.project-docs/' + f);
const DOC_FILES = [...PD_FILES, 'README.md', 'CLAUDE.md', 'embeds/_engine/AUTHORING.md'];

// R2 부팅셋 = CLAUDE @-임포트. 상한: 2026-06-30 수용 ~16.5K + 여유(고-ROI 초과는 여기서 의식적으로 올림).
const AUTOLOAD = ['README.md', '.project-docs/00_INDEX.md', '.project-docs/01_AI_SYNC.md',
  '.project-docs/04_CONVENTIONS.md', '.project-docs/05_PITFALLS.md', 'CLAUDE.md'];
const BUDGET_CHARS = 17000;

// on-demand 문서(부팅 밖) — point-of-use(WARN8) 대상
const ONDEMAND = ['02', '03', '06', '07', '08', '09', '10', '14'];

const fails = [], warns = [];
const F = (id, rel, msg) => fails.push(`  [${id}] ${slash(rel)} — ${msg}`);
const W = (id, rel, msg) => warns.push(`  [${id}] ${slash(rel)} — ${msg}`);
const read = rel => fs.readFileSync(rel2abs(rel), 'utf8');
const lnAt = (txt, idx) => txt.slice(0, idx).split('\n').length;
const docNum = rel => (path.basename(rel).match(/^(\d{2})_/) || [])[1];
// 형식 예시 링크(실링크 아님): CHnn-Lmm.html, CHnn-Lnn-Snn, <…>, … 등
const isPlaceholder = t => /(?:^|[^0-9A-Za-z])(nn|mm|xx)(?:[^0-9A-Za-z]|$)|Lnn|Lmm|Snn|<|…|CHxx/i.test(t);

// 섹션 인벤토리: 문서번호 → 보유 섹션번호 집합 (섹션참조 검증용)
const docSections = {};
for (const rel of PD_FILES) {
  const num = docNum(rel); if (!num) continue;
  const set = new Set();
  for (const m of read(rel).matchAll(/^#{2,3}\s*(?:§\s*)?(\d+)[.\s)]/gm)) set.add(m[1]);
  docSections[num] = set;
}

// 안정ID 참 최대 = 04/05의 정의 개수에서 *도출*(린트가 자기 max를 하드코딩하지 않게 — anti-복창 자기적용).
const maxId = (rel, re) => Math.max(0, ...[...read(rel).matchAll(re)].map(m => +m[1]));
const MAX_R = maxId('.project-docs/04_CONVENTIONS.md', /\*\*R(\d+)/g);
const MAX_P = maxId('.project-docs/05_PITFALLS.md', /\*\*P(\d+)/g);

for (const rel of DOC_FILES) {
  if (!fs.existsSync(rel2abs(rel))) continue;
  const txt = read(rel);
  const at = i => `L${lnAt(txt, i)}`;

  /* ---------- FAIL: M 기계계열 ---------- */
  for (const m of txt.matchAll(/CH\d+~|\b\d~\d문장|R\d+~R\d+|P\d+~P\d+/g))
    F('M-tilde', rel, `반각 범위틸드 "${m[0]}" (${at(m.index)}) → 전각 ～`);
  for (const m of txt.matchAll(/R1`?[~～]`?R\d+|P1`?[~～]`?P\d+/g))
    F('M-span', rel, `개수복창 금지 — 범위 진술 "${m[0]}" (${at(m.index)}). 04·05 홈도 span 안 씀 → 참조는 "규칙/함정"으로`);
  for (const m of txt.matchAll(/::embed\s+<|sample\/ standalone|sample\/ iframe/g))
    F('M-embed', rel, `구 embed/sample 잔재 "${m[0]}" (${at(m.index)})`);
  for (const m of txt.matchAll(/192레슨|35챕터|6,248|6,105/g))
    F('M-stale', rel, `stale 수치 "${m[0]}" (${at(m.index)})`);

  /* ---------- FAIL: S1 링크/경로 실존 ---------- */
  for (const m of txt.matchAll(/\]\(([^)]+)\)/g)) {
    const t = m[1].trim();
    if (/^(https?:|mailto:|#)/.test(t)) continue;
    const p0 = t.split('#')[0];
    if (!p0 || isPlaceholder(p0)) continue;
    if (!fs.existsSync(path.resolve(path.dirname(rel2abs(rel)), p0)))
      F('S1-link', rel, `깨진 링크/경로 "${t}" (${at(m.index)})`);
  }

  /* ---------- FAIL: S2a 안정ID dangling ---------- */
  for (const m of txt.matchAll(/\bR(\d{1,2})\b/g))
    if (+m[1] > MAX_R) F('S2a-id', rel, `dangling R${m[1]} (>R${MAX_R} 정의, ${at(m.index)})`);
  for (const m of txt.matchAll(/\bP(\d{1,2})\b/g))
    if (+m[1] > MAX_P) F('S2a-id', rel, `dangling P${m[1]} (>P${MAX_P} 정의, ${at(m.index)})`);

  /* ---------- FAIL: 섹션참조 "NN §M" → 대상 보유? ---------- */
  for (const m of txt.matchAll(/\b(\d{2}) §(\d+)/g)) {
    const [_, num, sec] = m;
    if (docSections[num] && !docSections[num].has(sec))
      F('S-secref', rel, `섹션참조 "${num} §${sec}" 대상 없음 (${at(m.index)})`);
  }

  /* ---------- FAIL: S3b 타임스탬프 형식 (.project-docs만) ---------- */
  if (rel.startsWith('.project-docs/') && !/최종수정: ?\d{4}-\d{2}-\d{2} \d{2}:\d{2} KST/.test(txt))
    F('S3b-ts', rel, `'최종수정: YYYY-MM-DD HH:MM KST' 형식 없음(R13)`);

  /* ---------- WARN: 6 포인터 비대칭(자문) ---------- */
  for (const m of txt.matchAll(/(정본|단일 홈|단일 출처|SSOT)\s*=\s*\[([^\]]+)\]/g))
    W('W6-ptr', rel, `정본 선언 "${m[1]} = ${m[2]}" → 대상 실소유 수동 확인 (${at(m.index)})`);

  /* ---------- WARN: 8 point-of-use(자문) — on-demand의 구속규칙 ---------- */
  if (ONDEMAND.includes(docNum(rel))) {
    const binds = [...txt.matchAll(/(금지|필수|반드시|위반)/g)].length;
    if (binds) W('W8-pou', rel, `구속 키워드 ${binds}건 — 01 라우터가 이 문서로 라우팅하는지 확인(③)`);
  }
}

/* ---------- FAIL: S3 토큰예산 ---------- */
let bootChars = 0;
const bootBreak = AUTOLOAD.map(a => { const n = read(a).length; bootChars += n; return `${slash(a)}=${n}`; });
if (bootChars > BUDGET_CHARS)
  F('S3-budget', 'AUTOLOAD', `부팅셋 ${bootChars}자 > 상한 ${BUDGET_CHARS}자 (의식적 상향이면 BUDGET_CHARS 갱신)`);

/* ---------- 리포트 ---------- */
const out = [];
out.push('===== .project-docs 무결성 린트 =====');
out.push(`스캔 ${DOC_FILES.length}개 · 부팅셋 ${bootChars}/${BUDGET_CHARS}자 (~${Math.round(bootChars*0.45)}–${Math.round(bootChars*0.6)} tok)`);
out.push('');
out.push(fails.length ? `❌ FAIL (게이트) — ${fails.length}건` : '✅ FAIL 0 (게이트 통과)');
if (fails.length) out.push(...fails);
out.push('');
out.push(warns.length ? `⚠️  WARN (자문 — "클린" 아님, 수동 점검) — ${warns.length}건` : '⚠️  WARN 0');
if (warns.length) out.push(...warns);
console.log(out.join('\n'));

process.exit(fails.length ? 1 : 0);
