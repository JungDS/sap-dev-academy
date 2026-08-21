/**
 * scorecard.mjs — 모델 스코어카드 재생성기 (15_AUDIT_MATRIX §6)
 *   raw(발견자 보고) + verdict/<CHnn>.json(본선 판정, 있으면) → .archive/_generated/MODEL_SCORECARD.md
 *   verdict JSON 형식: { "adopted": [{"agent","model","seq"}...], "rejected": [{"agent","model","seq","reason"?}...] }
 *
 * 사용: node tools/audit-matrix/scorecard.mjs [--campaign 이름] [--out 파일]
 * 섹션: CONST | collect | uniqueness | verdictJoin | render | main
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MODELS = ['opus', 'sonnet', 'gpt-5.6-sol', 'gemini-3.6-flash-high', 'gemini-3.7-flash-high'];
const SEVS = ['치명', '높음', '중간', '낮음'];

const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 60);
const fkey = (f) => `${f.file}::${norm(f.quote)}`;

function collect(campDir) {
  const rawRoot = path.join(campDir, 'raw');
  const rows = []; const missing = [];
  if (!fs.existsSync(rawRoot)) return { rows, missing };
  for (const ch of fs.readdirSync(rawRoot)) {
    const dir = path.join(rawRoot, ch);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.MISSING.txt')) { missing.push({ chapter: ch, name: f }); continue; }
      if (!f.endsWith('.json') || f.startsWith('_')) continue;
      try {
        let o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (o && !o.agent && o.structured_output && o.structured_output.agent) o = o.structured_output; // agy 봉투 언랩
        if (o && o.agent && o.model) rows.push({ chapter: ch, ...oMeta(o) });
        else missing.push({ chapter: ch, name: f + ' (형식 불명)' });
      } catch { missing.push({ chapter: ch, name: f + ' (파싱 실패)' }); }
    }
  }
  return { rows, missing };
}
function oMeta(o) {
  return {
    agent: o.agent, model: o.model,
    findings: (o.findings || []).map((f) => ({ seq: f.seq, file: f.file, quote: f.quote, severity: f.severity, key: fkey(f) })),
    grade: o.overall ? o.overall.grade_opinion : null,
  };
}

function loadVerdicts(campDir) {
  const dir = path.join(campDir, 'verdict');
  const map = new Map(); // `${agent}|${model}|${seq}|${chapter}` -> 'adopted'|'rejected'
  if (!fs.existsSync(dir)) return map;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const ch = path.basename(f, '.json');
    try {
      const v = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      for (const a of v.adopted || []) map.set(`${a.agent}|${a.model}|${a.seq}|${ch}`, 'adopted');
      for (const r of v.rejected || []) map.set(`${r.agent}|${r.model}|${r.seq}|${ch}`, 'rejected');
    } catch {}
  }
  return map;
}

function main() {
  const args = process.argv.slice(2);
  const gi = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
  const campaign = gi('--campaign', '2026-08-03-matrix-audit');
  const out = gi('--out', path.join(ROOT, '.archive', '_generated', 'MODEL_SCORECARD.md'));
  const campDir = path.join(ROOT, '.archive', campaign);
  const { rows, missing } = collect(campDir);
  const verdicts = loadVerdicts(campDir);

  // 모델별 집계 + 고유 발견(같은 챕터에서 타 모델이 같은 key를 안 낸 것)
  const byModel = Object.fromEntries(MODELS.map((m) => [m, {
    reports: 0, findings: 0, unique: 0, adopted: 0, rejected: 0,
    sev: Object.fromEntries(SEVS.map((s) => [s, 0])), byAgent: {},
  }]));
  const keyOwners = new Map(); // `${chapter}::${key}` -> Set(models)
  for (const r of rows) for (const f of r.findings) {
    const k = `${r.chapter}::${f.key}`;
    (keyOwners.get(k) || keyOwners.set(k, new Set()).get(k)).add(r.model);
  }
  for (const r of rows) {
    const m = byModel[r.model]; if (!m) continue;
    m.reports++;
    const ag = (m.byAgent[r.agent] ||= { findings: 0, unique: 0, adopted: 0 });
    for (const f of r.findings) {
      m.findings++; ag.findings++;
      if (SEVS.includes(f.severity)) m.sev[f.severity]++;
      if (keyOwners.get(`${r.chapter}::${f.key}`).size === 1) { m.unique++; ag.unique++; }
      const v = verdicts.get(`${r.agent}|${r.model}|${f.seq}|${r.chapter}`);
      if (v === 'adopted') { m.adopted++; ag.adopted++; }
      if (v === 'rejected') m.rejected++;
    }
  }

  const chapters = [...new Set(rows.map((r) => r.chapter))].sort();
  const L = [];
  L.push('# MODEL SCORECARD — 4모델 검수 매트릭스 (재생성물)');
  L.push('');
  L.push(`> 캠페인: \`${campaign}\` · 생성: ${new Date().toISOString()} · 재생성: \`node tools/audit-matrix/scorecard.mjs\``);
  L.push(`> 대상 챕터 ${chapters.length}개(${chapters.join(', ') || '-'}) · 보고 ${rows.length}벌 · 결측 ${missing.length}건`);
  L.push('> ⚠️ AG02는 스택(모델+도구) 비교로 해석([15 §1](../../.project-docs/15_AUDIT_MATRIX.md) 도구 자유화). 채택/오탐 열은 verdict JSON이 있는 챕터만 반영.');
  L.push('');
  L.push('| 모델 | 보고 | 발견 | 고유 발견 | 채택 | 기각 | 치명 | 높음 | 중간 | 낮음 |');
  L.push('|---|---|---|---|---|---|---|---|---|---|');
  for (const m of MODELS) {
    const s = byModel[m];
    L.push(`| ${m} | ${s.reports} | ${s.findings} | ${s.unique} | ${s.adopted || '-'} | ${s.rejected || '-'} | ${s.sev['치명']} | ${s.sev['높음']} | ${s.sev['중간']} | ${s.sev['낮음']} |`);
  }
  L.push('');
  L.push('## 축(AGxx) × 모델 — 발견/고유/채택');
  L.push('');
  const agents = [...new Set(rows.map((r) => r.agent))].sort();
  L.push('| 축 | ' + MODELS.join(' | ') + ' |');
  L.push('|---|' + MODELS.map(() => '---').join('|') + '|');
  for (const a of agents) {
    const cells = MODELS.map((m) => {
      const s = byModel[m].byAgent[a];
      return s ? `${s.findings}/${s.unique}/${s.adopted || 0}` : '-';
    });
    L.push(`| ${a} | ${cells.join(' | ')} |`);
  }
  if (missing.length) {
    L.push('');
    L.push('## 결측');
    for (const x of missing) L.push(`- ${x.chapter}/${x.name}`);
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, L.join('\n') + '\n', 'utf8');
  console.log(`스코어카드 생성: ${out} (보고 ${rows.length} · 챕터 ${chapters.length} · 결측 ${missing.length})`);
}
main();
