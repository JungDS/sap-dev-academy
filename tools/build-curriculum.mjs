#!/usr/bin/env node
// SAP Developer Academy — 커리큘럼 빌드 (MD 소스 → JSON 인덱스 + 레슨 HTML)
/**
 * 입력:  content/abap/_tracks.md, content/abap/CHxx/_chapter.md, CHxx/CHxx-Lnn-*.md
 * 출력:  docs/abap/curriculum.json        (Tier1: 트랙→챕터(+슬림 레슨))
 *        docs/abap/lessons/CHxx.json      (Tier2: 챕터별 레슨 상세)
 *        docs/abap/pages/CHxx-Lnn-*.html  (레슨 페이지 — 본문은 MD→HTML)
 *
 * 실행:  npm run build:abap   (= node tools/build-curriculum.mjs)
 *
 * 원칙: HTML은 생성물이므로 직접 수정 금지. 내용은 content/**.md 에서만 고친다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOMAIN = 'abap';
const SRC = path.join(ROOT, 'content', DOMAIN);
const OUT = path.join(ROOT, 'docs', DOMAIN);
const OUT_PAGES = path.join(OUT, 'pages');
const OUT_LESSONS = path.join(OUT, 'lessons');

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const toPosix = (p) => p.split(path.sep).join('/');
const relPosix = (fromDir, toPath) => toPosix(path.relative(fromDir, toPath)) || '.';

/* ---------- 용어 전역 자동 링크(게이팅) ----------
   reference/autolink.json: { "표면형": { "minCh": n, "key"?: "글로서리키" } }.
   레슨 챕터 ≥ minCh일 때만 그 용어를 자동 링크(R15 게이팅) → 도입 이후 모든 레슨에
   '섹션별 첫 등장 1회' 버튼. 소스 [[ ]] 마킹 없이 빌드가 매번 자동 적용.
   큐레이션 목록이라 길이 가드(≥3자)를 우회한다(짧은 한글 개념도 링크). */
let GLOBAL_AUTOLINK = [];
try {
  const al = JSON.parse(fs.readFileSync(path.join(ROOT, 'reference', 'autolink.json'), 'utf8'));
  GLOBAL_AUTOLINK = Object.entries(al)
    .filter(([form]) => !form.startsWith('_') && al[form] && typeof al[form] === 'object')
    .map(([form, cfg]) => ({ form, key: cfg.key || form, minCh: cfg.minCh || 0 }));
} catch (e) { /* 파일 없으면 전역 자동 링크 비활성(레슨 [[ ]] 마킹만 동작) */ }

/* ---------- marked: 핵심용어 [[term]] / [[term|label]] 인라인 확장 ---------- */
const glossaryExt = {
  name: 'glossary',
  level: 'inline',
  start(src) { const i = src.indexOf('[['); return i < 0 ? undefined : i; },
  tokenizer(src) {
    const m = /^\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/.exec(src);
    if (m) return { type: 'glossary', raw: m[0], term: m[1].trim(), label: (m[2] || m[1]).trim() };
  },
  renderer(t) {
    return `<button class="term" type="button" data-term="${esc(t.term)}">${esc(t.label)}</button>`;
  },
};
/* ---------- marked: 체험 임베드 ::embed CHnn-Lnn-Snn | <제목>:: ----------
   embeds/abap/CHnn-Lnn-Snn.html (공통 엔진 _engine + 레슨 전용 위젯)을 iframe으로 펼친다.
   레슨 페이지는 모두 docs/abap/pages/ 깊이 → 경로 접두 고정(../../../embeds/abap/).
   (구 sample/ 직접참조 분기는 전 챕터 이관 완료 후 제거됨 — 비형식 경로는 빌드 경고.) */
const embedExt = {
  name: 'embed',
  level: 'block',
  start(src) { const i = src.indexOf('::embed'); return i < 0 ? undefined : i; },
  tokenizer(src) {
    // ::embed <경로> | <제목> | <높이px>::  (제목·높이 선택)
    const m = /^::embed\s+([^\s|]+)\s*(?:\|\s*([^\n|]+?))?\s*(?:\|\s*(\d+))?\s*::/.exec(src);
    if (m) return { type: 'embed', raw: m[0], path: m[1].trim(), title: (m[2] || '').trim(), height: m[3] ? parseInt(m[3], 10) : 0 };
  },
  renderer(t) {
    // `::embed CHnn-Lnn-Snn` → embeds/abap/CHnn-Lnn-Snn.html (유일 경로)
    if (!/^CH\d+-L\d+-S\d+$/.test(t.path))
      console.warn(`  ⚠️ embed 경로가 CHnn-Lnn-Snn 형식이 아님(레거시 sample 참조?): ${t.path}`);
    const src = '../../../embeds/abap/' + t.path + '.html';
    const title = t.title || '직접 해보기';
    const hStyle = t.height ? ` style="height:${t.height}px"` : '';
    return `<figure class="embed"><figcaption class="embed__cap"><span class="embed__badge">체험</span>` +
      `<span class="embed__title">${esc(title)}</span>` +
      `<a class="embed__open" href="${src}" target="_blank" rel="noopener">↗ 새 탭에서 크게</a></figcaption>` +
      `<iframe class="embed__frame" src="${src}" loading="lazy" title="${esc(title)}"${hStyle}></iframe></figure>\n`;
  },
};
/* ---------- 코드 블록 = code-copy-block 양식 강제 (R3 / P10) ----------
   합의된 코드 표시 = sample/structure/code-copy-block.html (네이비 헤더 + 줄번호 + 토큰색 + 복사 버튼).
   marked 기본 <pre><code>(다크 블록) 대신 이 양식을 빌드가 항상 emit한다 → 손으로 "블랙 코드"가 나올 수 없다. */
const ABAP_KW = new Set((
  "REPORT PROGRAM TYPE TYPES DATA CONSTANTS STATICS FIELD-SYMBOLS FIELD-SYMBOL VALUE TABLE OF REF TO LIKE " +
  "BEGIN END WRITE ULINE SKIP FORMAT NEW-LINE NEW-PAGE " +
  "IF ELSEIF ELSE ENDIF CASE WHEN ENDCASE CHECK CONTINUE EXIT " +
  "DO ENDDO WHILE ENDWHILE LOOP ENDLOOP AT ENDAT " +
  "MOVE CLEAR REFRESH FREE APPEND INSERT MODIFY DELETE READ COLLECT SORT " +
  "SELECT FROM INTO CORRESPONDING FIELDS WHERE AND OR NOT IN BETWEEN " +
  "ORDER GROUP UP ROWS SINGLE DISTINCT INNER JOIN ON AS CLIENT " +
  "PARAMETERS SELECT-OPTIONS SELECTION-SCREEN " +
  "INITIALIZATION START-OF-SELECTION END-OF-SELECTION LOAD-OF-PROGRAM OUTPUT " +
  "MESSAGE RAISE CALL FUNCTION METHOD PERFORM FORM ENDFORM ENDFUNCTION " +
  "TRY CATCH CLEANUP ENDTRY CREATE OBJECT NEW " +
  "IMPORTING EXPORTING CHANGING RETURNING EXCEPTIONS RECEIVING " +
  "CLASS ENDCLASS METHODS CLASS-METHODS ENDMETHOD DEFINITION IMPLEMENTATION " +
  "PUBLIC PRIVATE PROTECTED SECTION INHERITING REDEFINITION ABSTRACT FINAL " +
  "COMMIT ROLLBACK WORK ASSIGN UNASSIGN IS INITIAL BOUND ASSIGNED " +
  "WITH KEY USING DEFAULT ASCENDING DESCENDING LINES DESCRIBE CONCATENATE SPLIT CONDENSE " +
  "SET GET PARAMETER ID " +
  // 타입 추가 · 출력 서식(WRITE/FORMAT) · 날짜 마스크 · 문자열 템플릿 포맷
  "LENGTH DECIMALS NO-ZERO CURRENCY COLOR INTENSIFIED INVERSE RIGHT-JUSTIFIED LEFT-JUSTIFIED CENTERED " +
  "DD MM YY YYYY DDMMYY MMDDYY YYMMDD " +
  // 산술(classic) · 연산자
  "ADD SUBTRACT MULTIPLY DIVIDE DIV MOD " +
  // 문자열 처리 · 내장/SQL 함수
  "FIND REPLACE SEPARATED CONCAT SUBSTRING UPPER LOWER COALESCE CAST " +
  // 내부 테이블 · 제어 · 분기 보조
  "FOR BY TIMES OTHERS SUM COUNT INDEX STANDARD TRANSPORTING BINARY SEARCH ENTRIES ALL NO LINE THEN BASE MAPPING EXCEPT " +
  "ASSIGNING MOVE-CORRESPONDING ADJACENT DUPLICATES COMPARING APPENDING " +
  // Open SQL 추가
  "LEFT OUTER NULL RANGE HAVING UPDATE ENDSELECT OFFSET " +
  // 선택화면 · 모듈풀 · 화면(Dynpro) 흐름
  "TABLES MODULE ENDMODULE INPUT SCREEN RADIOBUTTON CHECKBOX OBLIGATORY MATCHCODE BLOCK FRAME COMMENT TITLE TITLEBAR PF-STATUS LEAVE PROCESS BEFORE AFTER INTERVALS NO-EXTENSION MODIF WINDOW STARTING HELP-REQUEST VALUE-REQUEST " +
  // OO · 인터페이스 · 이벤트 · 예외 · 디버그
  "INTERFACE ENDINTERFACE INTERFACES EXCEPTION RAISING EVENT EVENTS HANDLER REFERENCE CLASS-DATA BREAK-POINT " +
  // 권한 · 파일 · 메모리 · 잡 · 원격 호출
  "AUTHORITY-CHECK FIELD DATASET OPEN CLOSE TEXT ENCODING MEMORY TASK DESTINATION TRANSACTION MESSAGES " +
  // CDS · RAP · AMDP · ABAP Unit · Enhancement
  "ENTITIES ENTITY LOCAL MODE ACTION DETERMINE VALIDATE SAVE DATABASE PROCEDURE HDB LANGUAGE SQLSCRIPT OPTIONS READ-ONLY CHAR " +
  "ENHANCEMENT ENDENHANCEMENT BADI TESTING DURATION SHORT RISK LEVEL HARMLESS"
).split(/\s+/));

function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function hlAbapLine(line) {
  if (/^\s*\*/.test(line)) return '<span class="tok-com">' + escHtml(line) + '</span>';
  let out = '', m;
  const re = /('[^']*'?)|(`[^`]*`?)|(".*$)|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_\-]*)|([^A-Za-z0-9_'`"\-]+)/g;
  while ((m = re.exec(line)) !== null) {
    if (m[1] || m[2]) out += '<span class="tok-str">' + escHtml(m[1] || m[2]) + '</span>';
    else if (m[3]) out += '<span class="tok-com">' + escHtml(m[3]) + '</span>';
    else if (m[4]) out += '<span class="tok-num">' + escHtml(m[4]) + '</span>';
    else if (m[5]) out += ABAP_KW.has(m[5].toUpperCase()) ? '<span class="tok-kw">' + escHtml(m[5]) + '</span>' : escHtml(m[5]);
    else out += escHtml(m[0]);
  }
  return out;
}
/* fence 언어 토큰 → 헤더 라벨 + 하이라이트 여부.
   code-copy-block 헤더를 '작성하는 오브젝트 유형'에 맞게 구분(무조건 ABAP 금지).
   ```abap/빈칸=ABAP · ```cds=CDS View · ```bdef=Behavior Definition · ```bimpl=Behavior Implementation
   · ```service=Service Definition · ```metadata=Metadata Extension · ```dcl=Access Control(DCL).
   ABAP 계열(DDL 포함)은 ABAP 토큰 하이라이트 공유(hl:true). 그 외(text 등)는 라벨 대문자화·하이라이트 없음. */
const CODE_LANGS = {
  abap:     { label: 'ABAP',                    hl: true },
  cds:      { label: 'CDS View',                hl: true },
  ddl:      { label: 'CDS View',                hl: true },
  bdef:     { label: 'Behavior Definition',     hl: true },
  bimpl:    { label: 'Behavior Implementation', hl: true },
  service:  { label: 'Service Definition',      hl: true },
  metadata: { label: 'Metadata Extension',      hl: true },
  dcl:      { label: 'Access Control (DCL)',    hl: true },
  sql:      { label: 'SQL',                     hl: true },
};
function renderCodeBlock(code, lang) {
  const language = (lang || '').trim().toLowerCase();
  const cfg = CODE_LANGS[language];
  const isAbap = language === '' ? true : (cfg ? cfg.hl : false);
  const raw = String(code).replace(/\n+$/, '');
  const lines = raw.length ? raw.split('\n') : [''];
  const gutter = lines.map((_, i) => i + 1).join('\n');
  const bodyHl = lines.map((l) => (isAbap ? hlAbapLine(l) : escHtml(l))).join('\n');
  const title = cfg ? cfg.label : (language ? language.toUpperCase() : 'ABAP');
  return '<div class="abap-editor">' +
    '<div class="abap-editor__header">' +
      '<span class="abap-editor__dots"><i class="abap-editor__dot r"></i><i class="abap-editor__dot y"></i><i class="abap-editor__dot g"></i></span>' +
      '<span class="abap-editor__title">' + esc(title) + '</span>' +
      '<button class="copy-btn" type="button">⧉ 복사</button>' +
    '</div>' +
    '<div class="abap-editor__body">' +
      '<pre class="abap-editor__gutter" aria-hidden="true">' + gutter + '</pre>' +
      '<pre class="abap-editor__code"><code>' + bodyHl + '</code></pre>' +
    '</div></div>\n';
}

marked.use({
  extensions: [glossaryExt, embedExt],
  gfm: true,
  renderer: {
    code(codeArg, infoArg) {
      let code, lang;
      if (codeArg && typeof codeArg === 'object') { code = codeArg.text; lang = codeArg.lang; }
      else { code = codeArg; lang = infoArg; }
      return renderCodeBlock(code, lang);
    },
  },
});

/* ---------- 소스 로딩 ---------- */
function loadTracks() {
  const raw = fs.readFileSync(path.join(SRC, '_tracks.md'), 'utf8');
  const tracks = matter(raw).data.tracks || [];
  return tracks;
}

function loadChapters() {
  const dirs = fs.readdirSync(SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^CH\d+$/.test(d.name))
    .map((d) => d.name)
    .sort();

  return dirs.map((dir) => {
    const chDir = path.join(SRC, dir);
    const meta = matter(fs.readFileSync(path.join(chDir, '_chapter.md'), 'utf8')).data;
    const lessons = fs.readdirSync(chDir)
      .filter((f) => /^CH\d+-L\d+.*\.md$/.test(f))
      .map((f) => {
        const g = matter(fs.readFileSync(path.join(chDir, f), 'utf8'));
        return { slug: f.replace(/\.md$/, ''), data: g.data, body: g.content };
      })
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
    return { dir, meta, lessons };
  });
}

/* 본문 h2 섹션을 흰 카드(.lblock)로 감싼다 — v2-C의 섹션 카드 디자인 */
/* ---------- 용어 자동 링크 ----------
   레슨에서 [[…]]로 한 번이라도 표시한 용어는 '섹션(h2)마다 첫 등장 1회'에 용어 버튼을 단다.
   (입문자가 못 외워도 매 섹션 한 번은 설명을 제공하되, 같은 섹션 안 반복은 도배하지 않음.)
   - 명시 [[ ]] 버튼도 그 섹션의 '첫 등장'으로 카운트 → 직후 같은 용어는 자동 링크 안 함.
   - 새 h2를 만나면 카운터 초기화 → 다음 섹션의 첫 등장은 다시 링크.
   - 코드/기존 버튼/링크/제목 안은 제외. 짧은 표면형(타입글자 I·P·D·T 등)은 자동 링크 제외(첫 [[마킹]]만).
   대상 = 그 레슨이 명시적으로 마킹한 용어(작성자 opt-in). data-term=글로서리 키 · seen=섹션 내 이미 링크한 키. */
const AUTOLINK_SKIP = new Set(['pre','code','button','a','h1','h2','h3','h4','h5','h6','script','style']);
function linkTermsInText(text, forms, formToKey, seen) {
  let out = '', i = 0;
  while (i < text.length) {
    let matched = null;
    for (const f of forms) {                 // forms = 길이 내림차순(greedy)
      if (!text.startsWith(f, i)) { continue; }
      if (seen.has(formToKey.get(f))) { continue; }   // 이 섹션에서 이미 링크한 키 → 평문 유지
      if (/^[\x00-\x7F]+$/.test(f)) {         // ASCII 용어는 단어 경계 확인(부분일치 방지)
        const prev = text[i - 1], next = text[i + f.length];
        if ((prev && /[A-Za-z0-9_]/.test(prev)) || (next && /[A-Za-z0-9_]/.test(next))) { continue; }
      }
      matched = f; break;
    }
    if (matched) {
      const key = formToKey.get(matched);
      out += `<button class="term" type="button" data-term="${esc(key)}">${esc(matched)}</button>`;
      seen.add(key);                          // 이 섹션에선 더 안 검 → 다음 h2에서 초기화
      i += matched.length;
    } else { out += text[i]; i += 1; }
  }
  return out;
}
function autolinkGlossary(html, rawBody, chapterNum) {
  const re = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;
  const formToKey = new Map(); let m;
  while ((m = re.exec(rawBody))) {
    const key = m[1].trim(), label = (m[2] || m[1]).trim();
    formToKey.set(key, key); formToKey.set(label, key);   // 키·라벨 둘 다 표면형으로
  }
  // 과잉 링크 방지: 레슨이 직접 마킹한 표면형 중 너무 짧은 것(타입글자 I·P·D·T, '변수' 등)은 자동 링크 제외(첫 [[마킹]]만).
  const forms = [...formToKey.keys()].filter((k) => k.replace(/\s/g, '').length >= 3);
  // 전역 자동 링크(게이팅) 병합 — 큐레이션 목록이라 길이 가드 우회. 챕터 ≥ minCh일 때만.
  for (const g of GLOBAL_AUTOLINK) {
    if ((chapterNum || 0) >= g.minCh && !formToKey.has(g.form)) {
      formToKey.set(g.form, g.key);
      forms.push(g.form);
    }
  }
  if (!forms.length) { return html; }
  forms.sort((a, b) => b.length - a.length);   // greedy: 긴 표면형 우선
  const tagRe = /<\/?([a-zA-Z0-9]+)(?:\s[^>]*)?\/?>/g;
  const seen = new Set();                     // 현재 h2 섹션에서 이미 링크한 글로서리 키
  let out = '', last = 0, skip = 0, mt;
  while ((mt = tagRe.exec(html))) {
    const seg = html.slice(last, mt.index);
    out += skip > 0 ? seg : linkTermsInText(seg, forms, formToKey, seen);
    out += mt[0];
    const name = mt[1].toLowerCase(), isClose = mt[0][1] === '/';
    const selfClose = /\/>$/.test(mt[0]) || ['br','hr','img','input','meta','link'].includes(name);
    if (name === 'h2' && !isClose) { seen.clear(); }                 // 새 섹션 → 첫 등장 카운터 초기화
    if (name === 'button' && !isClose) {                             // 명시 [[ ]] 버튼도 '첫 등장'으로 카운트
      const dm = /data-term="([^"]*)"/.exec(mt[0]); if (dm) { seen.add(dm[1]); }
    }
    if (AUTOLINK_SKIP.has(name) && !selfClose) { skip = isClose ? Math.max(0, skip - 1) : skip + 1; }
    last = tagRe.lastIndex;
  }
  out += skip > 0 ? html.slice(last) : linkTermsInText(html.slice(last), forms, formToKey, seen);
  return out;
}

/* 섹션(h2)당 용어 버튼 1회 보장 — 자동 링크는 autolink가 이미 억제하지만,
   작성자가 한 섹션에 [[용어]]를 두 번 명시 마킹한 경우(또는 평문+명시 순서)까지 평문으로 풀어 보장.
   첫 등장만 버튼 유지, 같은 키 2번째부터는 라벨 텍스트로 unwrap. h2를 만나면 초기화. */
function dedupTermButtonsPerSection(html) {
  const seen = new Set();
  return html.replace(/<h2[\s>]|<button class="term" type="button" data-term="([^"]*)">([^<]*)<\/button>/g,
    (full, key, inner) => {
      if (key === undefined) { seen.clear(); return full; }   // <h2 경계 → 카운터 초기화
      if (seen.has(key)) { return inner; }                    // 같은 섹션 2번째+ → 평문
      seen.add(key); return full;                             // 섹션 첫 등장 → 버튼 유지
    });
}

function wrapSections(html) {
  const parts = html.split(/(?=<h2[\s>])/);
  return parts.map((p) => (/^<h2[\s>]/.test(p) ? `<section class="lblock">${p}</section>` : p)).join('');
}

/* ---------- 레슨 HTML 템플릿 (v2-C 셸 골격) ----------
   레이아웃/네비/설정은 shell.js가 data-shell 훅에 주입한다.
   T-code 라벨은 front-matter `tcode`가 있을 때만 emit(Phase 2). */
function renderLessonPage(ch, lesson, trackNo) {
  const assets = relPosix(OUT_PAGES, path.join(ROOT, 'assets'));
  const dataBase = relPosix(OUT_PAGES, OUT) + '/';
  const siteRoot = relPosix(OUT_PAGES, ROOT) + '/';
  const chId = ch.meta.id;
  const chNum = parseInt(String(chId).replace(/\D/g, ''), 10) || 0;
  const bodyHtml = wrapSections(dedupTermButtonsPerSection(autolinkGlossary(marked.parse(lesson.body), lesson.body, chNum)));
  const sda = JSON.stringify({ domain: DOMAIN, dataBase, siteRoot });
  const tcode = lesson.data.tcode || '';
  const tcodeBadge = lesson.data.tcodeBadge || '';
  const tags =
    `<span class="tag tag--track">Track ${esc(String(trackNo || 1))}</span>` +
    `<span class="tag tag--ch">Chapter ${esc(String(ch.meta.order ?? ''))}</span>` +
    `<span class="tag tag--ls">Lesson ${esc(String(lesson.data.order ?? ''))}</span>` +
    (ch.meta.difficulty ? `<span class="tag tag--lv">${esc(ch.meta.difficulty)}</span>` : '');
  const tcodeBlock = tcode
    ? `      <section class="lcard tcode">
        <p class="lcard__h"><span class="ic">🖥️</span>이번 Lesson에서 다루는 트랜잭션 코드</p>
        <button class="tcode-label" data-tcode="${esc(tcode)}"${tcodeBadge ? ` data-badge="${esc(tcodeBadge)}"` : ''}>
          ${tcodeBadge ? `<span class="tcode-label__badge">${esc(tcodeBadge)}</span>` : ''}
          <span class="tcode-label__code">${esc(tcode)}</span>
          <span class="tcode-label__hint">자세히 보기 ›</span>
        </button>
      </section>\n`
    : '';
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(lesson.data.title)} · ${esc(ch.meta.title)} · SAP Developer Academy</title>
<link rel="stylesheet" href="${assets}/base.css">
<link rel="stylesheet" href="${assets}/lesson.css">
<link rel="stylesheet" href="${assets}/shell.css">
<script>/* 읽기 설정 선적용(플래시 방지) */(function(){try{var L=localStorage,r=document.documentElement;if(L.getItem('sda.dark')==='1')r.classList.add('dark');if(L.getItem('sda.wide')==='1')r.classList.add('wide');var f=parseInt(L.getItem('sda.fontPx'),10);if(f>=13&&f<=20)r.style.fontSize=f+'px';}catch(e){}})();</script>
</head>
<body data-domain="${DOMAIN}" data-chapter-id="${esc(chId)}" data-lesson-id="${esc(lesson.data.id)}">
<header class="appbar">
  <a class="appbar__home" href="${siteRoot}index.html">🏠 <span class="full">SAP Developer Academy</span></a>
  <span class="appbar__sp"></span>
  <span class="meta">${esc(chId)} · ${esc(ch.meta.title)}</span>
  <a class="btn-soft" href="${siteRoot}pages/abap.html">ABAP 커리큘럼</a>
  <div class="tools">
    <button class="icon-btn" id="fsDec" title="글자 작게">A−</button>
    <button class="icon-btn" id="fsInc" title="글자 크게">A+</button>
    <button class="icon-btn" id="fsReset" title="글자 크기 초기화">↺</button>
    <button class="icon-btn" id="darkBtn" title="다크 모드">🌙</button>
    <button class="icon-btn" id="widthBtn" title="가독 폭 넓게">↔</button>
    <button class="icon-btn fs-btn" title="전체화면" aria-label="전체화면"></button>
  </div>
</header>
<div class="read-progress"><i></i></div>
<div class="scrim"></div>
<nav class="rail" data-shell="rail"></nav>
<button class="railFab" id="railFab" aria-label="네비 열기">☰</button>
<div class="stage">
  <div class="layout">
    <main class="main">
      <nav class="crumb"><a href="${siteRoot}index.html">홈</a> › <a href="${siteRoot}pages/abap.html">ABAP 커리큘럼</a> › ${esc(chId)}</nav>
      <section class="lhead">
        <p class="lhead__eyebrow">${esc(ch.meta.title)}</p>
        <h1>${esc(lesson.data.title)}</h1>
        ${lesson.data.direction ? `<p class="lhead__direction">${esc(lesson.data.direction)}</p>` : ''}
        <div class="tags">${tags}</div>
      </section>
${tcodeBlock}      <article class="prose">
${bodyHtml}
      </article>
      <nav class="lesson-nav" data-shell="prevnext"></nav>
      <footer class="foot">SAP Developer Academy · ${esc(chId)} ${esc(lesson.data.id)}</footer>
    </main>
    <aside class="journey" data-shell="journey"></aside>
  </div>
</div>
<div class="term-popup" data-shell="popup" hidden></div>
<div class="tmodal" data-shell="tmodal" hidden></div>
<script>window.__SDA__=${sda};</script>
<script src="${assets}/shell.js" defer></script>
</body>
</html>
`;
}

/* ---------- main ---------- */
function main() {
  const tracks = loadTracks();
  const chapters = loadChapters();

  // 페이지 파일명은 레슨 ID로 통일(CHxx-Lyy.html). 슬러그 잔재 제거 위해 먼저 비운다.
  fs.rmSync(OUT_PAGES, { recursive: true, force: true });
  fs.mkdirSync(OUT_PAGES, { recursive: true });
  fs.mkdirSync(OUT_LESSONS, { recursive: true });

  // 챕터를 트랙별로 묶기
  const byTrack = new Map(tracks.map((t) => [t.id, []]));
  for (const ch of chapters) {
    const tid = ch.meta.track;
    if (!byTrack.has(tid)) byTrack.set(tid, []);
    byTrack.get(tid).push(ch);
  }

  let pageCount = 0;
  const curriculumTracks = tracks.map((t, trackIdx) => {
    const chs = (byTrack.get(t.id) || [])
      .sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));

    const chapterEntries = chs.map((ch) => {
      // 레슨 HTML + Tier2 작성
      const lessonsTier2 = ch.lessons.map((l) => {
        const href = `pages/${l.data.id}.html`;   // 파일명 = 레슨 ID로 통일(슬러그 무관)
        fs.writeFileSync(path.join(OUT, href), renderLessonPage(ch, l, trackIdx + 1), 'utf8');
        pageCount += 1;
        return {
          id: l.data.id, title: l.data.title, direction: l.data.direction || '',
          keywords: l.data.keywords || [], order: l.data.order ?? 0, href,
        };
      });
      fs.writeFileSync(
        path.join(OUT_LESSONS, `${ch.meta.id}.json`),
        JSON.stringify({ chapterId: ch.meta.id, chapterTitle: ch.meta.title, lessons: lessonsTier2 }, null, 2),
        'utf8'
      );

      // Tier1 슬림 레슨 목록
      const lessonsSlim = lessonsTier2.map((l) => ({ id: l.id, title: l.title, order: l.order, href: l.href }));
      return {
        id: ch.meta.id, title: ch.meta.title, intro: ch.meta.intro || '',
        objectives: ch.meta.objectives || [], keywords: ch.meta.keywords || [],
        difficulty: ch.meta.difficulty || '', order: ch.meta.order ?? 0,
        lessonCount: lessonsSlim.length, lessons: lessonsSlim,
      };
    });

    return {
      id: t.id, title: t.title, intro: t.intro || '',
      keywords: t.keywords || [], difficulty: t.difficulty || '',
      chapterCount: chapterEntries.length, chapters: chapterEntries,
    };
  });

  const curriculum = {
    domain: DOMAIN, version: 'v6',
    generatedAt: new Date().toISOString(),
    tracks: curriculumTracks,
  };
  fs.writeFileSync(path.join(OUT, 'curriculum.json'), JSON.stringify(curriculum, null, 2), 'utf8');

  // 참조 데이터(glossary·tcodes)는 reference/에 손작성 → 런타임이 직접 fetch. 빌드 pass-through 없음.
  // glossary 패리티만 점검(경고): 본문 [[term]] 키가 reference/glossary.json에 정의돼 있나 (R12).
  const glossSrc = path.join(ROOT, 'reference', 'glossary.json');
  let glossCount = 0;
  if (fs.existsSync(glossSrc)) {
    const gloss = JSON.parse(fs.readFileSync(glossSrc, 'utf8'));
    glossCount = Object.keys(gloss).length;
    const missing = new Set();
    for (const ch of chapters) for (const l of ch.lessons) {
      const re = /\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]/g; let m;
      while ((m = re.exec(l.body)) !== null) { const k = m[1].trim(); if (!gloss[k]) missing.add(k); }
    }
    if (missing.size) console.warn(`⚠ glossary 미정의 용어 ${missing.size}건: ${[...missing].slice(0, 20).join(', ')}${missing.size > 20 ? ' …' : ''}`);
    else console.log('✓ glossary parity — 미정의 용어 0건');
  }

  const totalCh = curriculumTracks.reduce((n, t) => n + t.chapterCount, 0);
  console.log(`✓ curriculum.json — ${curriculumTracks.length} tracks / ${totalCh} chapters`);
  console.log(`✓ lessons/*.json  — ${chapters.length} files`);
  console.log(`✓ pages/*.html    — ${pageCount} lessons`);
  console.log(`✓ reference/glossary.json — ${glossCount} terms (참조 — 빌드 안 함)`);
}

main();
