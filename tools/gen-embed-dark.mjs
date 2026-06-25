/* gen-embed-dark — 체험 위젯(embeds/_engine/*.css)의 다크모드 오버라이드 자동 생성.
   체험은 iframe(별도 문서)이라 부모 html.dark를 상속하지 않음 → shell.js가 iframe <html>에 .dark 주입,
   _base.css가 코어 토큰(var)을 다크화, 그리고 "엔진별 하드코딩 라이트색"은 이 생성기가 _dark.css로 덮는다.
   정책(속성별):
     - background: 밝은 색(L≥0.6)만 어둡게(중립→다크 서피스, 채도 틴트→같은 색조 다크 틴트). 이미 어두운 배경(네이비 헤더 등)은 유지.
     - border/outline: 밝은 라인 → 다크 라인(#333845).
     - color: 흰 글자(L≥0.82, 액센트 위 글자)는 유지 · 어두운 중립 텍스트 → 밝은 잉크 · 채도 액센트 텍스트는 밝게 보정.
     - gradient/box-shadow 선언은 건드리지 않음(토큰/그대로).
   이미 수동 html.dark 블록이 있는 엔진(예: step-debugger)은 존중하여 스킵.
   재실행: node tools/gen-embed-dark.mjs  (엔진 css 색이 바뀌면 다시 돌려 _dark.css 갱신). 미세조정은 해당 엔진 css에 html.dark 규칙으로(소스 순서상 우선). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENG = path.join(ROOT, 'embeds', '_engine');
const OUT = path.join(ENG, '_dark.css');

/* ---- 색 변환 유틸 ---- */
function parseHex(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('') + h[3] + h[3];
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return { r, g, b, a: h.length >= 8 ? h.slice(6, 8) : null };
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}
function hslToHex(h, s, l) {
  h /= 360;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    r = hue(p, q, h + 1 / 3); g = hue(p, q, h); b = hue(p, q, h - 1 / 3);
  }
  const to = (x) => ('0' + Math.round(x * 255).toString(16)).slice(-2);
  return '#' + to(r) + to(g) + to(b);
}

/* 속성 맥락에 따라 hex 변환. 변경 없으면 null. */
function transformHex(hex, prop) {
  const { r, g, b, a } = parseHex(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const keepA = (v) => (a ? v + a : v);
  const isBg = /^(background|background-color|fill)$/.test(prop);
  const isBorder = /(border|outline|stroke)/.test(prop);
  const neutral = s < 0.22;

  if (isBg) {
    if (l >= 0.6) {                                   // 밝은 배경 → 어둡게
      if (neutral) return keepA(l >= 0.85 ? '#1f2229' : '#262b36');
      return keepA(hslToHex(h, Math.min(s, 0.6), 0.16)); // 채도 틴트 → 같은 색조 다크 틴트
    }
    return null;                                       // 이미 어두운 배경(네이비 헤더 등) 유지
  }
  if (isBorder) {
    if (l >= 0.55) return keepA('#333845');
    return null;
  }
  // color (텍스트/아이콘)
  if (l >= 0.82) return null;                          // 흰 글자(액센트 위) 유지
  if (neutral) return l < 0.66 ? keepA('#d6dbe8') : null; // 어둡거나 중간인 중립 텍스트 → 밝은 잉크 · 밝은 중립만 유지
  // 채도 있는 텍스트(토큰·링크·헤딩) → 색조 유지하며 밝게(하한 0.63 → 칙칙함 방지)
  return keepA(hslToHex(h, Math.min(s, 0.85), Math.min(0.74, Math.max(0.63, l + 0.26))));
}

/* ---- CSS 파싱(최상위 룰만; @-룰 블록은 통째 스킵) ---- */
function topRules(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  let i = 0; const n = css.length;
  while (i < n) {
    const j = css.indexOf('{', i);
    if (j < 0) break;
    const sel = css.slice(i, j).trim();
    let depth = 1, k = j + 1;
    while (k < n && depth > 0) { const c = css[k]; if (c === '{') depth++; else if (c === '}') depth--; k++; }
    const body = css.slice(j + 1, k - 1);
    if (sel && !sel.startsWith('@')) out.push({ sel, body });
    i = k;
  }
  return out;
}

const COLOR_PROP = /^(background|background-color|color|border|border-top|border-right|border-bottom|border-left|border-color|border-top-color|border-right-color|border-bottom-color|border-left-color|outline|outline-color|fill|stroke)$/;

function procBody(body) {
  const changed = [];
  for (const d of body.split(';')) {
    const idx = d.indexOf(':'); if (idx < 0) continue;
    const prop = d.slice(0, idx).trim().toLowerCase();
    const val = d.slice(idx + 1).trim();
    if (!val || !COLOR_PROP.test(prop)) continue;
    if (/gradient|box-shadow|url\(/.test(val) || prop === 'box-shadow') continue;
    const hexes = val.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (!hexes) continue;
    let nv = val, any = false;
    for (const hx of hexes) {
      const nh = transformHex(hx, prop);
      if (nh && nh.toLowerCase() !== hx.toLowerCase()) { nv = nv.split(hx).join(nh); any = true; }
    }
    if (any) changed.push(`${prop}:${nv}`);
  }
  return changed;
}

/* ---- 실행 ---- */
const files = fs.readdirSync(ENG)
  .filter((f) => f.endsWith('.css') && f !== '_base.css' && f !== '_dark.css')
  .sort();

let out = `/* _dark.css — AUTO-GENERATED: node tools/gen-embed-dark.mjs · 직접 수정 금지(재생성됨).
   체험 위젯 iframe 다크모드: 엔진별 하드코딩 라이트색을 html.dark에서 어둡게/밝게 덮음.
   코어 토큰(var)은 _base.css의 html.dark가 처리. 미세조정은 해당 엔진 css에 html.dark 규칙으로(소스 순서상 우선).
   수동 html.dark 블록이 있는 엔진은 존중하여 제외. */\n`;

let genCount = 0, skipManual = [];
for (const f of files) {
  const css = fs.readFileSync(path.join(ENG, f), 'utf8');
  if (/html\.dark/.test(css)) { skipManual.push(f); continue; }   // 수동 블록 존중
  const blocks = [];
  for (const { sel, body } of topRules(css)) {
    const changed = procBody(body);
    if (!changed.length) continue;
    const darkSel = sel.split(',').map((s) => 'html.dark ' + s.trim()).join(', ');
    blocks.push(`${darkSel}{${changed.join(';')};}`);
  }
  if (blocks.length) { out += `\n/* ${f} */\n${blocks.join('\n')}\n`; genCount++; }
}

fs.writeFileSync(OUT, out, 'utf8');
console.log(`✓ ${path.relative(ROOT, OUT)} 생성 · 엔진 ${genCount}종 다크 오버라이드`);
if (skipManual.length) console.log(`  수동 html.dark 보유로 제외: ${skipManual.join(', ')}`);
