# 03. ARCHITECTURE — 폴더 역할 · 빌드 파이프라인 · 런타임 셸

> 📅 **최종수정: 2026-06-30 15:01 KST**
> 🎯 **목적:** "무엇이 어디 있고, 무엇이 소스이고 무엇이 생성물인가"를 한눈에.
> 📖 **읽을 때:** 파일을 어디에 둘지/고칠지 헷갈릴 때.
> ⚡ **TL;DR:**
> - **소스 = `content/abap/**.md`**(레슨 본문) **+ `embeds/`**(체험수단) / **생성물 = `docs/abap/**`(JSON·HTML)** / **참조 데이터 = `reference/`**(glossary·tcodes·autolink 등 — 손작성, 빌드 생성물 아님). 생성물은 손대지 않는다([04 R1](04_CONVENTIONS.md)).
> - 런타임은 `assets/shell.js`가 정적 페이지에 상단바·네비·용어팝업을 주입.
> - `sample/`은 **참고 카탈로그** — 체험수단의 정본 홈은 `embeds/`([06](06_SAMPLE_LIBRARY.md)).

## 🗂️ 폴더 역할
> 정렬 = **소스 → 도구 → 생성물 → 문서/메타 → 외부**(생명주기 순), 그룹 안은 중요도순. "구분" 열이 곧 분류.

| 경로 | 역할 | 구분 |
|------|------|------|
| `content/abap/**.md` | 레슨·챕터 **본문 소스**(손작성·검수 대상) | 소스 |
| `embeds/` | **체험수단 정본** — `_engine/`(공통 엔진 js·css) · `abap/CHnn-Lnn-Snn.html`(레슨 위젯) · `_vendor/`(mermaid 백업). 본문 `::embed`가 부른다. **위젯 제작 계약 = [`_engine/AUTHORING.md`](../embeds/_engine/AUTHORING.md)** | 소스 |
| `assets/` | 런타임 셸(`shell.js`·`shell.css`)·`base.css`·`lesson.css` | 소스 |
| `reference/` | **참조 데이터(손작성·생성물 아님)** — `glossary.json`(런타임 용어팝업 + 빌드 마킹) · `tcodes.json`(런타임 T코드) · `autolink.json`(빌드 `[[ ]]` 자동링크) · `sap-examples-index.md`·`codex_0625*`(집필 참고) | 소스 |
| `sample/` | 독립형 샘플 + 카탈로그 — **참고용**(체험 정본은 `embeds/`) | 소스(참고) |
| `pages/abap.html` | ABAP 로드맵(데이터 주도, `curriculum.json` 렌더) | 소스 |
| `index.html` | 학습 허브(도메인 카드) | 소스 |
| `tools/build-curriculum.mjs` | 빌드 스크립트(gray-matter + marked) | 도구 |
| `docs/abap/curriculum.json` | Tier1: 트랙→챕터(+슬림 레슨) | 생성물 |
| `docs/abap/lessons/CHxx.json` | Tier2: 챕터별 레슨 상세 | 생성물 |
| `docs/abap/pages/*.html` | 레슨 페이지(본문 MD→HTML) | 생성물 |
| `docs/abap/curriculum*.md` | 커리큘럼 개요(통합·트랙별·챕터별 MD) | 생성물 |
| `.project-docs/` | AI 부팅 컨텍스트(이 폴더) | 문서 |
| `.archive/` | 완료 원장·재생성물(부팅 밖 — 날짜폴더 + `_generated/`, [[project-docs-archive-convention]]) | 문서 |
| `check/` | 커리큘럼 계획·감사 작업물(`PLANNED-CURRICULUM`·`RUNNING-EXAMPLES`·`coverage-checklist*`) | 작업물 |
| `sapui5/`(형제 repo) | **구 참고본 — 읽기 전용([04 R14](04_CONVENTIONS.md))** | 외부 |

## 🔧 빌드 파이프라인

```
content/abap/**.md   (소스 · 본문에 ::embed CHnn-Lnn-Snn 지시문 포함)
        │  npm run build:abap   (tools/build-curriculum.mjs)
        ▼
docs/abap/curriculum.json · lessons/CHxx.json · pages/*.html · curriculum*.md  (생성물)
   ├ 본문 ::embed CHnn-Lnn-Snn  →  embeds/abap/…html 을 iframe 위젯으로 삽입
   └ reference/ — glossary·tcodes(런타임 직접 fetch) · autolink(빌드 `[[ ]]` 변환 입력)
        │  런타임
        ▼
assets/shell.js  →  상단바·설정 · 좌측 레일(레슨/챕터/용어) · 우측 "이 레슨의 여정"(스크롤스파이) · 이전다음 · 용어 hover/click 주입
```

- **레슨/로드맵 페이지는 `fetch` 사용 → 반드시 HTTP 서빙**(`file://` 불가). → [05 P1](05_PITFALLS.md).
- 로컬: `python -m http.server 8137` 후
  `http://localhost:8137/pages/abap.html`,
  `http://localhost:8137/docs/abap/pages/CH01-L01.html`.

## 🧩 소스 레이아웃 (content/abap)

```
content/abap/
  _tracks.md            트랙 메타(front-matter tracks 배열)
  CHxx/
    _chapter.md         챕터 메타 + 소개 산문
    CHxx-Lnn[-슬러그].md  레슨 front-matter + 본문 MD
```
- **폴더명 = 챕터 ID**(`CH01/`) → ID만 알면 경로 직행.
- 레슨 파일 = `<레슨ID>[-슬러그].md`. 슬러그는 가독성용(선택), 스캐폴드는 순수 ID.
- front-matter 스키마·본문 MD 규칙은 [04_CONVENTIONS](04_CONVENTIONS.md).
- **참조 데이터는 `content/abap`이 아니라 루트 `reference/`** — 손작성(생성물 아님). 런타임(shell.js)이 glossary·tcodes를 `siteRoot+reference/`로 직접 fetch하고, autolink은 빌드가 `[[ ]]` 변환에 쓴다. glossary는 도메인 공용(cross-cutting).

## 🖥️ 런타임 셸 (assets/shell.js)
정적 페이지에 주입: 상단바·설정(글자/다크/폭/전체화면) · **좌측 레일(레슨/챕터/용어)** · **우측 "이 레슨의 여정"(스크롤스파이)** · 이전다음 · 핵심용어 hover(임시)/click(고정) 팝업. 표준 = v2-C([08](08_LESSON_SHELL_SPEC.md)).
> 샘플 `sample/structure/lesson-shell*.html`이 이 셸 패턴의 독립형 데모 + 디자인 시안이다([06](06_SAMPLE_LIBRARY.md)).
