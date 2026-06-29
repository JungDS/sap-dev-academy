/* audit-content-depth — 레슨별 콘텐츠 깊이/DoD 결손 진단 원장 생성기
   content/abap/**.md를 훑어 본문량·섹션·코드·체험임베드·용어·표를 집계하고,
   DoD 결손(특히 R2: 코드 있는데 체험 임베드 없음)을 플래그해 .archive/_generated/CONTENT_DEPTH_AUDIT.md로 출력.
   (재생성물이라 frozen 원장과 분리된 .archive/_generated/에 둔다 — 매 실행 덮어쓰기·.project-docs 통독 시 미포함.)
   재실행: node tools/audit-content-depth.mjs  (콘텐츠가 늘면 다시 돌려 갱신). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'content', 'abap');
const OUT = path.join(ROOT, '.archive', '_generated', 'CONTENT_DEPTH_AUDIT.md');

// 임계 — 초반(CH01~08) 골드 스탠다드(본문 ~1640자·섹션 ~5.6) 대비
const THIN = 900;        // 본문자 < THIN → 🟠 빈약
const WARN = 1200;       // THIN ≤ 본문자 < WARN → 🟡 주의
const FEWSEC = 3;        // 섹션 ≤ FEWSEC → 흐름 압축

const body = (t) => t.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
function metrics(t) {
  const b = body(t);
  return {
    chars: b.length,
    sec: (b.match(/^##\s/gm) || []).length,
    code: Math.floor((b.match(/^```/gm) || []).length / 2),
    emb: (b.match(/::embed/g) || []).length,
    gloss: (b.match(/\[\[/g) || []).length,
    tbl: (b.match(/^\|.*\|/gm) || []).length > 0,
  };
}
function flags(m) {
  const f = [];
  if (m.code >= 1 && m.emb === 0) f.push('🔴R2');                 // 코드 있는데 체험 없음
  if (m.chars < THIN) f.push('🟠빈약');
  else if (m.chars < WARN) f.push('🟡주의');
  if (m.sec <= FEWSEC) f.push('🟡압축');
  if (m.emb === 0 && !m.tbl && m.code === 0) f.push('⬜무체험');  // 코드·표·임베드 전무(텍스트only)
  return f;
}
function action(m) {
  const a = [];
  if (m.code >= 1 && m.emb === 0) a.push('체험 임베드 추가');
  if (m.chars < WARN) a.push('본문 확장(왜·주의·정리)');
  if (m.sec <= FEWSEC) a.push('흐름 단계 보강');
  if (m.emb === 0 && !m.tbl && m.code === 0) a.push('시각화/표 추가');
  return a.length ? a.join(' · ') : '—';
}

const chs = fs.readdirSync(SRC).filter((d) => /^CH\d+$/.test(d)).sort((a, b) => +a.slice(2) - +b.slice(2));
const all = [];
for (const ch of chs) {
  const dir = path.join(SRC, ch);
  const ls = fs.readdirSync(dir).filter((f) => /^CH\d+-L\d+.*\.md$/.test(f)).sort();
  for (const l of ls) {
    const id = (l.match(/(CH\d+-L\d+)/) || [, l])[1];
    const t = fs.readFileSync(path.join(dir, l), 'utf8');
    const titleM = t.match(/^title:\s*"?(.+?)"?\s*$/m);
    const m = metrics(t);
    all.push({ ch, id, title: titleM ? titleM[1] : '', ...m, flags: flags(m), action: action(m) });
  }
}

const r2 = all.filter((x) => x.flags.includes('🔴R2'));
const thin = all.filter((x) => x.chars < THIN);
const textonly = all.filter((x) => x.flags.includes('⬜무체험'));
const clean = all.filter((x) => x.flags.length === 0);

let md = '';
md += '# 콘텐츠 깊이 / DoD 결손 진단 원장\n\n';
md += `> 📅 자동 생성: \`node tools/audit-content-depth.mjs\` (콘텐츠 변경 후 재실행). 수기 편집 금지 — 재생성됨.\n`;
md += `> 🎯 후반 챕터 "내용 빈곤" 정밀 진단. 레슨별 본문량·섹션·코드·체험임베드·표를 집계해 DoD 결손을 플래그.\n`;
md += `> 임계: 본문 < ${THIN}자=🟠빈약 · < ${WARN}=🟡주의 · 섹션 ≤ ${FEWSEC}=🟡압축 · 코드有+임베드0=🔴R2(체험누락) · 코드·표·임베드 전무=⬜무체험.\n`;
md += `> 골드 스탠다드 = CH01~08(본문 ~1,640자·섹션 ~5.6·체험임베드 빈번).\n\n`;

md += `## 요약\n`;
md += `- 전체 레슨: **${all.length}**\n`;
md += `- 🔴 R2 위반(코드 있는데 체험 임베드 0): **${r2.length}**\n`;
md += `- 🟠 본문 빈약(< ${THIN}자): **${thin.length}**\n`;
md += `- ⬜ 무체험(코드·표·임베드 전무): **${textonly.length}**\n`;
md += `- ✅ 결손 플래그 없음: **${clean.length}**\n\n`;

// 구간 비교(초·중·후반) — "빈곤"의 단조 악화 추세
md += `## 구간 비교 — "후반 빈곤"의 증거\n\n`;
md += `| 구간 | 레슨 | 평균 본문자 | 평균 섹션 | 빈약(<${THIN}) | 임베드0 | 🔴R2 |\n|---|---|---|---|---|---|---|\n`;
const bandOf = (id) => { const n = +id.slice(2, 4); return n <= 8 ? 'CH01~08' : n <= 17 ? 'CH09~17' : 'CH18~36'; };
for (const b of ['CH01~08', 'CH09~17', 'CH18~36']) {
  const g = all.filter((x) => bandOf(x.id) === b);
  const avgC = Math.round(g.reduce((s, x) => s + x.chars, 0) / g.length);
  const avgS = (g.reduce((s, x) => s + x.sec, 0) / g.length).toFixed(1);
  const thinN = g.filter((x) => x.chars < THIN).length;
  const noEmb = g.filter((x) => x.emb === 0).length;
  const r2N = g.filter((x) => x.flags.includes('🔴R2')).length;
  const pct = (k) => `${k} (${Math.round(k / g.length * 100)}%)`;
  md += `| **${b}** | ${g.length} | ${avgC} | ${avgS} | ${pct(thinN)} | ${pct(noEmb)} | ${pct(r2N)} |\n`;
}
md += `\n- **본문 자수·섹션**이 단조 감소(1,650→830자 · 5.7→3.0섹션) = "빈곤"의 직접 신호.\n`;
md += `- **빈약(<${THIN}자)** 비율이 7%→51%→72%로 급증 → 후반 보강의 1차 타깃.\n`;
md += `- **임베드 0**·**R2**는 후반에 더 심하나 *프로젝트 전반*의 체험 부족(초반도 절반 이상) → 별도 트랙으로 관리.\n\n`;

md += `## 🔴 최우선 — R2 위반 (코드가 있는데 그 페이지에서 체험할 수단이 없음)\n`;
md += `> R2는 본 프로젝트 필수 규칙. 코드가 1줄이라도 나오면 체험/시뮬레이션 동반.\n\n`;
md += `| 레슨 | 제목 | 본문자 | 섹션 | 코드 | 권장 |\n|---|---|---|---|---|---|\n`;
for (const x of r2) md += `| ${x.id} | ${x.title} | ${x.chars} | ${x.sec} | ${x.code} | ${x.action} |\n`;
md += `\n`;

md += `## 챕터별 전체 원장\n\n`;
let curCh = '';
for (const x of all) {
  if (x.ch !== curCh) {
    curCh = x.ch;
    md += `\n### ${x.ch}\n\n| 레슨 | 본문자 | 섹션 | 코드 | 임베드 | 용어[[ | 표 | 플래그 | 권장조치 |\n|---|---|---|---|---|---|---|---|---|\n`;
  }
  md += `| ${x.id} | ${x.chars} | ${x.sec} | ${x.code} | ${x.emb} | ${x.gloss} | ${x.tbl ? '✓' : ''} | ${x.flags.join(' ') || '✅'} | ${x.action} |\n`;
}
md += `\n`;

fs.writeFileSync(OUT, md, 'utf8');
console.log(`✓ ${path.relative(ROOT, OUT)} 생성`);
console.log(`  전체 ${all.length} · R2위반 ${r2.length} · 빈약 ${thin.length} · 무체험 ${textonly.length} · 무결손 ${clean.length}`);
