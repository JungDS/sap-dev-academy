#!/usr/bin/env node
/* 일회용 추출 도구 — standalone sample → 공통 엔진(embeds/_engine) + 얇은 위젯(embeds/abap)
 * 사용: node tools/_extract-embed.mjs <sample상대경로> <engineName> <embedId>
 * 예:   node tools/_extract-embed.mjs sample/code-learning/write-output-simulator.html write-output CH01-L04-S01
 * 동작: sample의 <style>→ _engine/<engine>.css(:root만 제거, 토큰은 _base.css가 제공)
 *       인라인 <script>→ _engine/<engine>.js
 *       <body> 골격(스크립트 제외)→ embeds/abap/<embedId>.html (← _base.css·엔진css·엔진js 링크)
 *       Mermaid CDN 감지 시 위젯 head에 보존(+로컬 fallback 주석).
 * ⚠️ 단일사용 엔진 전용(데이터가 엔진 안에 있어도 무방). 다중사용 엔진은 별도 config 주입 리팩터.
 */
import fs from 'node:fs';
import path from 'node:path';

const [, , sampleRel, engineName, embedId] = process.argv;
if (!sampleRel || !engineName || !embedId) { console.error('args: <sampleRel> <engineName> <embedId>'); process.exit(1); }
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const src = fs.readFileSync(path.join(ROOT, sampleRel), 'utf8');

const pick = (re) => { const m = re.exec(src); return m ? m[1] : ''; };
const title = (pick(/<title>([\s\S]*?)<\/title>/) || engineName).replace(/\s*·\s*Sample\s*$/, '').trim();
const hasMermaid = /<script[^>]*mermaid[^>]*>/i.test(src);

// 1) CSS — <style> 내부에서 :root 블록만 제거(토큰은 _base.css). 나머지(리셋 포함)는 무해하게 유지.
let css = pick(/<style>([\s\S]*?)<\/style>/).replace(/:root\s*\{[^}]*\}\s*/, '').trim();

// 2) JS — 인라인 <script>(속성 없는 것)들만. CDN <script src=...>는 제외됨.
let js = '';
const sre = /<script>([\s\S]*?)<\/script>/g; let m;
while ((m = sre.exec(src)) !== null) js += (js ? '\n' : '') + m[1];
js = js.trim();

// 3) body 골격 — <script> 모두 제거
let body = pick(/<body[^>]*>([\s\S]*?)<\/body>/).replace(/<script[\s\S]*?<\/script>/g, '').trim();

const ENG = path.join(ROOT, 'embeds', '_engine');
fs.writeFileSync(path.join(ENG, engineName + '.css'), css + '\n', 'utf8');
fs.writeFileSync(path.join(ENG, engineName + '.js'), js + '\n', 'utf8');

const mermaidTag = hasMermaid
  ? '\n<!-- Mermaid: CDN 우선 + 손상 대비 로컬 백업(embeds/_vendor) -->\n' +
    '<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>\n' +
    '<script>if(!window.mermaid){var s=document.createElement("script");s.src="../_vendor/mermaid.min.js";document.head.appendChild(s);}</script>'
  : '';

const html = `<!DOCTYPE html>
<!-- ${embedId} — 엔진: ${engineName} (embeds/_engine/${engineName}.{js,css}) · 공통토큰: _engine/_base.css
     ⚠️ 생성: tools/_extract-embed.mjs (${sampleRel}에서 추출). 엔진 수정은 _engine/에서. -->
<html lang="ko" data-eng="${engineName}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} · ${embedId}</title>${mermaidTag}
<link rel="stylesheet" href="../_engine/_base.css" />
<link rel="stylesheet" href="../_engine/${engineName}.css" />
</head>
<body>
${body}
<script src="../_engine/${engineName}.js" defer></script>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'embeds', 'abap', embedId + '.html'), html, 'utf8');
console.log(`✓ ${engineName}.css (${css.length}b) · ${engineName}.js (${js.length}b) · abap/${embedId}.html (mermaid=${hasMermaid})`);
