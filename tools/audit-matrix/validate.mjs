/**
 * validate.mjs — 발견자 보고 검증기 (15_AUDIT_MATRIX §3-1·§8)
 *   ① JSON 파싱(펜스·래퍼 관용 추출) ② 스키마 검사(자체 구현 — 의존성 0)
 *   ③ 앵커 실존 검사(finding.quote가 대상 파일 원문에 실존하는가 = 환각 지표)
 *
 * 사용:
 *   node tools/audit-matrix/validate.mjs --single <파일.json>   단건 — exit 0/1 (run-one 래퍼용)
 *   node tools/audit-matrix/validate.mjs <raw/CHnn 폴더>        일괄 — 표 + _validate-summary.json
 * 섹션: CONST | extractJson | checkSchema | checkAnchors | validateFile | main
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const AGENTS = ['AG01', 'AG02', 'AG03', 'AG04', 'AG05', 'AG06', 'AG07', 'AG08', 'AG09'];
const MODELS = ['opus', 'sonnet', 'gpt-5.6-sol', 'gemini-3.6-flash-high'];
const SEVERITIES = ['치명', '높음', '중간', '낮음'];
const CONFIDENCES = ['확실', '추정'];
const GRADES = ['유지', '경미 수정', '보강 권장', '재집필 권장'];

/** 관용 추출: 순수 JSON → 그대로 / 펜스·서문 딸림 → 첫 '{'～마지막 '}' / 래퍼 객체 → 내부 후보 */
function extractJson(text) {
  const t = text.replace(/^﻿/, '').trim();
  const attempts = [t];
  const a = t.indexOf('{'); const b = t.lastIndexOf('}');
  if (a >= 0 && b > a) attempts.push(t.slice(a, b + 1));
  for (const s of attempts) {
    try {
      const o = JSON.parse(s);
      if (o && typeof o === 'object') {
        if (o.agent) return o;
        for (const k of ['structured_output', 'response', 'result', 'output', 'final']) {
          const v = o[k];
          if (typeof v === 'string') { try { const i = JSON.parse(v); if (i && i.agent) return i; } catch {} }
          if (v && typeof v === 'object' && v.agent) return v;
        }
        return o; // agent 없는 객체 — 스키마 검사에서 잡힌다
      }
    } catch {}
  }
  return null;
}

function checkSchema(o) {
  const errs = [];
  const req = (k, type) => {
    if (o[k] === undefined) { errs.push(`필수 누락: ${k}`); return false; }
    if (type === 'array' ? !Array.isArray(o[k]) : typeof o[k] !== type) { errs.push(`타입 오류: ${k}`); return false; }
    return true;
  };
  req('agent', 'string') && !AGENTS.includes(o.agent) && errs.push(`agent enum 위반: ${o.agent}`);
  req('model', 'string') && !MODELS.includes(o.model) && errs.push(`model enum 위반: ${o.model}`);
  req('target', 'string'); req('persona_ack', 'string'); req('method', 'string'); req('errors', 'array'); req('files_read', 'array');
  if (req('findings', 'array')) {
    o.findings.forEach((f, i) => {
      for (const k of ['seq', 'file', 'quote', 'category', 'severity', 'confidence', 'claim', 'evidence', 'suggestion'])
        if (f[k] === undefined) errs.push(`findings[${i}] 필수 누락: ${k}`);
      if (f.severity !== undefined && !SEVERITIES.includes(f.severity)) errs.push(`findings[${i}] severity enum 위반`);
      if (f.confidence !== undefined && !CONFIDENCES.includes(f.confidence)) errs.push(`findings[${i}] confidence enum 위반`);
      if (typeof f.quote === 'string' && f.quote.length > 240) errs.push(`findings[${i}] quote 240자 초과`);
    });
  }
  if (o.overall === undefined || typeof o.overall !== 'object') errs.push('필수 누락: overall');
  else {
    if (typeof o.overall.grade_opinion !== 'string' || !GRADES.includes(o.overall.grade_opinion))
      errs.push('overall.grade_opinion enum 위반');
    if (typeof o.overall.summary !== 'string') errs.push('overall.summary 누락');
  }
  return errs;
}

const fileCache = new Map();
function readTarget(rel) {
  const abs = path.isAbsolute(rel) ? rel : path.join(ROOT, rel);
  if (!fileCache.has(abs)) {
    fileCache.set(abs, fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null);
  }
  return fileCache.get(abs);
}

/** 앵커 검사 — 공백 정규화 완화 매칭 + 상대 파일명 폴백(content/abap/<target>/) */
function checkAnchors(o) {
  let anchored = 0, missing = 0, fileMiss = 0;
  for (const f of o.findings || []) {
    let body = typeof f.file === 'string' ? readTarget(f.file) : null;
    if (body === null && typeof f.file === 'string' && typeof o.target === 'string') {
      body = readTarget(path.join('content', 'abap', o.target, path.basename(f.file)));
    }
    if (body === null) { fileMiss++; continue; }
    const q = String(f.quote || '');
    const norm = (s) => s.replace(/\s+/g, ' ').trim();
    if (body.includes(q) || norm(body).includes(norm(q))) anchored++;
    else missing++;
  }
  return { anchored, missing, fileMiss, total: (o.findings || []).length };
}

function validateFile(p) {
  const raw = fs.readFileSync(p, 'utf8');
  const o = extractJson(raw);
  if (!o) return { file: p, valid: false, errors: ['JSON 파싱 실패'], anchors: null, obj: null };
  const errors = checkSchema(o);
  const anchors = errors.length ? null : checkAnchors(o);
  return { file: p, valid: errors.length === 0, errors, anchors, obj: o };
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--single') {
    const r = validateFile(args[1]);
    console.log(JSON.stringify({ valid: r.valid, errors: r.errors, anchors: r.anchors }, null, 2));
    process.exit(r.valid ? 0 : 1);
  }
  const dir = args[0];
  if (!dir || !fs.existsSync(dir)) { console.error('사용법: validate.mjs --single <파일> | <raw 폴더>'); process.exit(1); }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const rows = files.map((f) => validateFile(path.join(dir, f)));
  const summary = { dir, total: rows.length, valid: 0, byModel: {} };
  for (const r of rows) {
    const name = path.basename(r.file);
    if (r.valid) summary.valid++;
    const model = r.obj && r.obj.model ? r.obj.model : '(불명)';
    const m = (summary.byModel[model] ||= { reports: 0, valid: 0, findings: 0, anchored: 0, anchorTotal: 0 });
    m.reports++;
    if (r.valid) {
      m.valid++; m.findings += r.anchors.total;
      m.anchored += r.anchors.anchored; m.anchorTotal += r.anchors.total;
    }
    console.log(`${r.valid ? 'VALID  ' : 'INVALID'} ${name}` +
      (r.valid ? `  findings=${r.anchors.total} anchored=${r.anchors.anchored}/${r.anchors.total}` : `  ${r.errors.slice(0, 3).join(' | ')}`));
  }
  for (const [m, s] of Object.entries(summary.byModel)) {
    const rate = s.anchorTotal ? Math.round((s.anchored / s.anchorTotal) * 100) : null;
    console.log(`[${m}] 보고 ${s.valid}/${s.reports} 유효 · 발견 ${s.findings} · 앵커 실존 ${rate === null ? '-' : rate + '%'}`);
  }
  fs.writeFileSync(path.join(dir, '_validate-summary.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log(`요약 저장: ${path.join(dir, '_validate-summary.json')} (유효 ${summary.valid}/${summary.total})`);
}
main();
