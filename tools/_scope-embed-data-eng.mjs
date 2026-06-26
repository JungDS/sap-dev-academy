/* _scope-embed-data-eng — 일회성 마이그레이션(재실행 안전·idempotent).
   embeds/abap/*.html 의 <html …> 태그에 data-eng="<엔진>"을 주입.
   목적: 생성물 _dark.css가 'html.dark[data-eng=x] …'로 엔진 전용 스코프되도록(누수 차단).
   엔진은 <link href="../_engine/<engine>.css"> 중 _base가 아닌 것에서 추론.
   앞으로 새 임베드는 _extract-embed.mjs가 data-eng를 직접 부여. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'embeds', 'abap');

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.html'));
let added = 0, already = 0, skipped = [];

for (const f of files) {
  const p = path.join(DIR, f);
  let html = fs.readFileSync(p, 'utf8');

  // 엔진 추론: ../_engine/<name>.css 중 _base 제외
  const engines = [...html.matchAll(/href="\.\.\/_engine\/([\w-]+)\.css"/g)]
    .map((m) => m[1]).filter((n) => n !== '_base');
  const eng = engines[0];
  if (!eng) { skipped.push(`${f} (엔진 css 링크 못 찾음)`); continue; }

  const htmlTag = html.match(/<html\b[^>]*>/);
  if (!htmlTag) { skipped.push(`${f} (<html> 태그 없음)`); continue; }
  if (/\bdata-eng=/.test(htmlTag[0])) { already++; continue; }   // idempotent

  const newTag = htmlTag[0].replace(/>$/, ` data-eng="${eng}">`);
  html = html.replace(htmlTag[0], newTag);
  fs.writeFileSync(p, html, 'utf8');
  added++;
}

console.log(`✓ data-eng 주입: 신규 ${added} · 기존보유 ${already} · 전체 ${files.length}`);
if (skipped.length) console.log(`  ⚠ 건너뜀(${skipped.length}):\n   ${skipped.join('\n   ')}`);
