/* _audit-dark-collisions — 일회성 감사(삭제 가능).
   _dark.css 의 '단일 제네릭 클래스' html.dark .X{...} 오버라이드가
   여러 엔진에서 쓰는 클래스명을 가로채는(누수) 위험을 탐지. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENG = path.join(ROOT, 'embeds', '_engine');

/* ---- _dark.css 파싱: 엔진 블록별 규칙 ---- */
const darkCss = fs.readFileSync(path.join(ENG, '_dark.css'), 'utf8');

// 단일 제네릭 클래스 selector 인지: 'html.dark .X' (X = 1개 클래스, 자손/복합/유사클래스/요소 없음)
function bareClass(sel) {
  const s = sel.trim();
  const m = s.match(/^html\.dark\s+\.([A-Za-z][\w-]*)$/);
  return m ? m[1] : null;
}
function hasColorOrBg(body) {
  return /(^|;|\{)\s*(color|background|background-color)\s*:/.test(body);
}

// 엔진 블록 단위로 쪼개기 (/* file.css */ 주석 기준)
const blocks = darkCss.split(/\/\*\s*([\w-]+\.css)\s*\*\//).slice(1);
const darkByEngine = {}; // engine -> [{cls, body, props}]
const bareOverride = {}; // cls -> [{engine, body, color, bg}]
for (let i = 0; i < blocks.length; i += 2) {
  const engine = blocks[i].replace('.css', '');
  const chunk = blocks[i + 1] || '';
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(chunk))) {
    const sels = m[1].split(',').map((x) => x.trim());
    const body = m[2].trim();
    for (const sel of sels) {
      const cls = bareClass(sel);
      if (!cls) continue;
      const colorM = body.match(/(?:^|;)\s*color\s*:\s*([^;]+)/);
      const bgM = body.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/);
      if (!colorM && !bgM) continue; // color/background 없는 건 관심 밖
      (bareOverride[cls] ||= []).push({
        engine,
        color: colorM ? colorM[1].trim() : null,
        bg: bgM ? bgM[1].trim() : null,
        body,
      });
    }
  }
}

/* ---- 각 엔진 css 가 selector로 참조하는 클래스명 집합 ---- */
const engFiles = fs.readdirSync(ENG).filter((f) => f.endsWith('.css') && !['_base.css', '_dark.css'].includes(f));
const classToEngines = {}; // cls -> Set(engine)
for (const f of engFiles) {
  const css = fs.readFileSync(path.join(ENG, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const engine = f.replace('.css', '');
  // selector 부분만(블록 본문 제외): '{' 앞 텍스트들에서 .class 토큰 추출
  const selectorText = css.replace(/\{[^{}]*\}/g, '{}');
  const clsRe = /\.([A-Za-z][\w-]*)/g;
  let m;
  while ((m = clsRe.exec(selectorText))) {
    (classToEngines[m[1]] ||= new Set()).add(engine);
  }
}

/* ---- 교차: 단일 제네릭 오버라이드 X 가 2+ 엔진에서 참조됨 ---- */
const risks = [];
for (const [cls, overs] of Object.entries(bareOverride)) {
  const users = classToEngines[cls] || new Set();
  if (users.size < 2) continue; // 한 엔진만 쓰면 누수 위험 없음
  // 생성 소스 엔진들(이 오버라이드를 만든 엔진)
  const srcEngines = [...new Set(overs.map((o) => o.engine))];
  // 값 충돌 여부(서로 다른 color/bg)
  const colorVals = new Set(overs.filter((o) => o.color).map((o) => o.color));
  const bgVals = new Set(overs.filter((o) => o.bg).map((o) => o.bg));
  risks.push({
    cls,
    userCount: users.size,
    users: [...users].sort(),
    srcEngines,
    colorVals: [...colorVals],
    bgVals: [...bgVals],
    valueConflict: colorVals.size > 1 || bgVals.size > 1,
  });
}

risks.sort((a, b) => b.userCount - a.userCount || a.cls.localeCompare(b.cls));
console.log('=== 단일 제네릭 클래스 다크 오버라이드 누수 위험 ===');
console.log('(cls · #참조엔진 · 값충돌 · color값 · bg값)\n');
for (const r of risks) {
  const flag = r.valueConflict ? '⚠️값충돌' : '   동일값';
  console.log(`.${r.cls.padEnd(18)} ${String(r.userCount).padStart(2)}엔진  ${flag}  color=${JSON.stringify(r.colorVals)} bg=${JSON.stringify(r.bgVals)}`);
  console.log(`   생성소스: ${r.srcEngines.join(', ')}`);
  console.log(`   참조엔진: ${r.users.join(', ')}`);
}
console.log(`\n총 ${risks.length} 클래스가 2+ 엔진 교차사용 + 단일제네릭 다크 오버라이드.`);
