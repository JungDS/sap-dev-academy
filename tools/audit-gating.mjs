#!/usr/bin/env node
/**
 * audit-gating.mjs — R15 게이팅·R6 경계 정적 감사 (W0 도구)
 * ──────────────────────────────────────────────────────────
 * 섹션(출력 = .archive/_generated/GATING_AUDIT.md):
 *   STRUCT     front-matter 필수키 누락 · id↔파일명 불일치
 *   PREREQ     prereq 대상 실존 · 전방(자기 이후) 참조 금지
 *   DUP-INTRO  같은 키워드를 여러 레슨이 introduces 선언(중복 L3 후보 — R6 나선은 오탐 가능)
 *   EARLY-USE  도입 레슨보다 앞에서 키워드가 본문에 등장(foreshadow/advanceUse 선언은 라벨)
 *   R6         CH01～17 코드 블록의 modern 토큰 · CH01～18 코드 블록의 New Open SQL 토큰
 * 판정 주의: 이 도구는 "후보"만 뽑는다 — 확정 판정(오탐/L1 허용/이동 필요)은 모델·사람 몫.
 * 사용: node tools/audit-gating.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'content', 'abap');
const OUT = path.join(ROOT, '.archive', '_generated', 'GATING_AUDIT.md');

/* ── 1. 로드 ───────────────────────────────────────────── */
const chapters = fs.readdirSync(SRC).filter((d) => /^CH\d\d$/.test(d)).sort();
const lessons = [];           // {id, chId, file, order, abs, fm, body, lines}
const chOrder = {};           // CH01 → 1

for (const ch of chapters) {
  const chDir = path.join(SRC, ch);
  const chMeta = matter(fs.readFileSync(path.join(chDir, '_chapter.md'), 'utf8')).data;
  chOrder[ch] = chMeta.order ?? parseInt(ch.slice(2), 10);
  for (const f of fs.readdirSync(chDir).filter((x) => /^CH\d\d-L\d\d.*\.md$/.test(x)).sort()) {
    const raw = fs.readFileSync(path.join(chDir, f), 'utf8');
    const { data: fm, content: body } = matter(raw);
    const order = fm.order ?? parseInt((f.match(/-L0*(\d+)/) || [])[1] || '0', 10);
    lessons.push({
      id: fm.id || f.replace(/\.md$/, ''), chId: ch, file: `content/abap/${ch}/${f}`,
      order, abs: chOrder[ch] * 1000 + order, fm, body, lines: body.split('\n'),
    });
  }
}
lessons.sort((a, b) => a.abs - b.abs);
const lessonById = new Map(lessons.map((l) => [l.id, l]));

/* ── 2. STRUCT ─────────────────────────────────────────── */
const struct = [];
for (const l of lessons) {
  const missing = ['id', 'title', 'order', 'introduces', 'prereq'].filter((k) => l.fm[k] == null);
  if (missing.length) struct.push(`- ${l.file} — 누락: ${missing.join(', ')}`);
  const fnameId = path.basename(l.file).match(/^(CH\d\d-L\d\d)/)?.[1];
  if (fnameId && l.fm.id && l.fm.id !== fnameId) struct.push(`- ${l.file} — id \`${l.fm.id}\` ≠ 파일명 \`${fnameId}\``);
}

/* ── 3. PREREQ 그래프 ──────────────────────────────────── */
const prereqIssues = [];
function absOf(ref) {
  // "CH10" → 그 챕터 첫 레슨 시점, "CH37-L01" → 해당 레슨 시점. 미존재 = null.
  if (/^CH\d\d$/.test(ref)) return chOrder[ref] ? chOrder[ref] * 1000 : null;
  if (/^CH\d\d-L\d\d$/.test(ref)) return lessonById.get(ref)?.abs ?? null;
  return undefined; // 형식 밖(예: "CH25-L04" 외 표기) — 별도 표시
}
for (const l of lessons) {
  for (const ref of l.fm.prereq || []) {
    const a = absOf(String(ref).trim());
    if (a === undefined) prereqIssues.push(`- ${l.id} → \`${ref}\` — 형식 미인식(CHxx 또는 CHxx-Lyy 아님)`);
    else if (a === null) prereqIssues.push(`- ${l.id} → \`${ref}\` — 대상 미존재`);
    else if (a >= l.abs && !(String(ref) === l.chId)) prereqIssues.push(`- ${l.id} → \`${ref}\` — 전방/동시점 참조(자기보다 앞이 아님)`);
  }
}

/* ── 4. 키워드 추출 → 최초 도입 맵 ─────────────────────── */
// introduces 항목에서 grep 가능한 토큰만: 백틱 조각 + 괄호 앞 영문 머리(3자+, 한글 미포함)
// 초일반 토큰(조사급 문법어·범용어) — 선노출 스캔에서 노이즈만 만들어 제외
const STOP = new Set([
  'abap', 'sap', 'the', 'and', 'for', 'with', 'l3', 'l1',
  'into', 'check', 'key', 'base', 'display', 'return', 'and/or/not', 'lower case',
]);
function extractKeys(item) {
  const out = new Set();
  const s = String(item);
  for (const m of s.matchAll(/`([^`]+)`/g)) {
    const t = m[1].trim();
    if (t.length >= 3 && !/[가-힣]/.test(t)) out.add(t);
  }
  const head = s.replace(/`[^`]*`/g, ' ').split(/[(（—:]/)[0].trim();
  if (head.length >= 3 && /^[A-Za-z][A-Za-z0-9_\/\-. ]*$/.test(head) && !STOP.has(head.toLowerCase())) out.add(head);
  return [...out];
}
const firstIntro = new Map();   // keyLower → {key, lessonId, abs}
const dupIntro = [];
for (const l of lessons) {
  for (const item of l.fm.introduces || []) {
    for (const key of extractKeys(item)) {
      const kl = key.toLowerCase();
      const prev = firstIntro.get(kl);
      if (!prev) firstIntro.set(kl, { key, lessonId: l.id, abs: l.abs });
      else if (prev.lessonId !== l.id) dupIntro.push(`- \`${key}\` — ${prev.lessonId} 와 ${l.id} 가 모두 introduces (나선 재방문이면 정상 — 판정 필요)`);
    }
  }
}

/* ── 5. EARLY-USE 스캔 ─────────────────────────────────── */
// 도입 시점(abs)보다 앞 레슨 본문에 키워드 등장 → 후보. 단어 경계 매칭(식별자성 키워드).
// v2: 동음이의 제외 — 키워드별 "제외 문맥" 정규식(매치 주변 ±60자에 걸리면 스킵).
//     W1 판정에서 확정된 4쌍(TABLES=함수 파라미터절 · Method=Selection Method ·
//     CHECKBOX/RADIOBUTTON GROUP=PARAMETERS 애드온 · Include/APPEND=DDIC .INCLUDE/.APPEND).
const AMBIG = new Map([
  ['tables', /call function|exporting|importing|changing|value_tab|파라미터 종류|레거시 방식/i],
  ['method', /selection method/i],
  ['checkbox', /parameters|as checkbox/i],
  ['radiobutton group', /parameters|라디오 그룹 검증|on radiobutton/i],
  ['include', /\.include|\.append|include·append|include\/exclude/i],
  ['append', /\.append|\.include/i],
]);
function ambigSkip(keyLower, body, idx) {
  const re = AMBIG.get(keyLower);
  if (!re) return false;
  return re.test(body.slice(Math.max(0, idx - 60), idx + keyLower.length + 60));
}
const early = [];
const entries = [...firstIntro.values()].filter((e) => e.key.length >= 3);
for (const l of lessons) {
  const bodyLower = l.body.toLowerCase();
  for (const e of entries) {
    if (l.abs >= e.abs) continue;                    // 도입 이후 등장은 자유
    const kl = e.key.toLowerCase();
    let idx = bodyLower.indexOf(kl);
    // 단어 경계 확인 루프(부분 문자열 오탐 컷: 좌우가 영숫자/_이면 스킵) + 동음이의 문맥 스킵(v2)
    while (idx !== -1) {
      const before = bodyLower[idx - 1] || ' ';
      const after = bodyLower[idx + kl.length] || ' ';
      if (!/[a-z0-9_]/.test(before) && !/[a-z0-9_]/.test(after) && !ambigSkip(kl, bodyLower, idx)) break;
      idx = bodyLower.indexOf(kl, idx + 1);
    }
    if (idx === -1) continue;
    const line = l.body.slice(0, idx).split('\n').length;
    // 3분류: 선언됨(foreshadow/advanceUse) < LOW(같은 챕터·도입과 거리≤2 — 챕터 내 여정 언급) < REVIEW
    const declared =
      (l.fm.foreshadow || []).some((x) => String(x).toLowerCase().includes(kl)) ? 'foreshadow' :
      (l.fm.advanceUse || []).some((x) => String(x).toLowerCase().includes(kl)) ? 'advanceUse' : null;
    const intro = lessonById.get(e.lessonId);
    const near = intro && intro.chId === l.chId && (intro.abs - l.abs) <= 2;
    const tier = declared ? 'DECLARED' : near ? 'LOW' : 'REVIEW';
    early.push({ abs: l.abs, tier, text: `- ${l.id}:${line} — \`${e.key}\` (도입 = ${e.lessonId})${declared ? ` [${declared} 선언]` : ''}` });
  }
}
early.sort((a, b) => (a.tier === b.tier ? a.abs - b.abs : a.tier === 'REVIEW' ? -1 : b.tier === 'REVIEW' ? 1 : a.tier === 'LOW' ? -1 : 1));

/* ── 6. R6 하드 경계(코드 블록 안만) ───────────────────── */
const r6 = [];
const MODERN = [
  [/\bDATA\(/, 'inline DATA()'], [/@DATA\(/, '@DATA()'],
  [/\bVALUE\s+(#|\w+)\s*\(/i, 'VALUE 생성식'],           // classic `VALUE 'x'`·`VALUE CHECK`는 제외
  [/\bNEW\s+(#|\w+)\s*\(/i, 'NEW 생성식'],
  [/\+=|-=/, '+= / -='], [/\bCOND\s+#/i, 'COND #'],
  [/\bSWITCH\s+#/i, 'SWITCH #'], [/\bREDUCE\s+(#|\w+)\s*\(/i, 'REDUCE'],
  [/\bFILTER\s+(#|\w+)\s*\(/i, 'FILTER'],
  [/\bCORRESPONDING\s+#/i, 'CORRESPONDING #'], [/\|[^|\n]*\{/, '문자열 템플릿 |…{ }…|'],
];
const NEWSQL = [[/(?:INTO|=|\()\s*@\w/, 'Open SQL 호스트변수 @'], [/\bSELECT\s+\w+\s*,/i, 'SELECT 콤마 나열']];
for (const l of lessons) {
  const chNum = chOrder[l.chId];
  const blocks = [...l.body.matchAll(/```abap\n([\s\S]*?)```/g)];
  for (const b of blocks) {
    const code = b[1];
    const startLine = l.body.slice(0, b.index).split('\n').length;
    const checks = [...(chNum <= 17 ? MODERN : []), ...(chNum <= 18 ? NEWSQL : [])];
    for (const [re, label] of checks) {
      const m = code.match(re);
      if (m) {
        const line = startLine + code.slice(0, m.index).split('\n').length - 1;
        r6.push(`- ${l.id}:${line} — ${label} → \`${m[0].trim().slice(0, 40)}\``);
      }
    }
  }
}

/* ── 7. 출력 ───────────────────────────────────────────── */
const now = ''; // 재생성물 — 타임스탬프 미기록(diff 노이즈 방지), 생성 명령만 명시
const md = `# GATING_AUDIT — R15 게이팅·R6 경계 정적 감사 (자동 생성)

> 재생성: \`node tools/audit-gating.mjs\` (이 파일을 직접 수정하지 말 것)
> ⚠️ 아래는 전부 **후보**다 — 오탐(나선 재방문·L1 예고·동음이의)을 모델/사람이 판정한 뒤에만 위반으로 확정한다.

## 요약
| 섹션 | 건수 |
|---|---|
| STRUCT (필수키·id) | ${struct.length} |
| PREREQ (실존·전방참조) | ${prereqIssues.length} |
| DUP-INTRO (중복 도입 선언) | ${dupIntro.length} |
| EARLY-USE — **REVIEW(요판정)** | ${early.filter((e) => e.tier === 'REVIEW').length} |
| EARLY-USE — LOW(같은 챕터 인접) | ${early.filter((e) => e.tier === 'LOW').length} |
| EARLY-USE — DECLARED(예고/선행 선언) | ${early.filter((e) => e.tier === 'DECLARED').length} |
| R6 경계 (classic 구간 modern 토큰) | ${r6.length} |
| 검사 규모 | 레슨 ${lessons.length} · 추적 키워드 ${firstIntro.size} |

## STRUCT
${struct.join('\n') || '- 없음'}

## PREREQ
${prereqIssues.join('\n') || '- 없음'}

## DUP-INTRO
${dupIntro.join('\n') || '- 없음'}

## EARLY-USE · REVIEW (요판정 — 미선언·비인접)
${early.filter((e) => e.tier === 'REVIEW').map((e) => e.text).join('\n') || '- 없음'}

## EARLY-USE · LOW (같은 챕터·도입 인접 — 여정 언급일 가능성 높음)
${early.filter((e) => e.tier === 'LOW').map((e) => e.text).join('\n') || '- 없음'}

## EARLY-USE · DECLARED (foreshadow/advanceUse 선언 — 수위만 점검)
${early.filter((e) => e.tier === 'DECLARED').map((e) => e.text).join('\n') || '- 없음'}

## R6 경계
${r6.join('\n') || '- 없음'}
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md, 'utf8');
console.log(`✓ GATING_AUDIT.md — STRUCT ${struct.length} · PREREQ ${prereqIssues.length} · DUP ${dupIntro.length} · EARLY ${early.length} · R6 ${r6.length} (키워드 ${firstIntro.size})`);
