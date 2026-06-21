# 03. ARCHITECTURE — 폴더 역할 · 빌드 파이프라인 · 런타임 셸

> 📅 **최종수정: 2026-06-21 00:37 KST**
> 🎯 **목적:** "무엇이 어디 있고, 무엇이 소스이고 무엇이 생성물인가"를 한눈에.
> 📖 **읽을 때:** 파일을 어디에 둘지/고칠지 헷갈릴 때.
> ⚡ **TL;DR:**
> - **소스 = `content/abap/**.md`** / **생성물 = `docs/abap/**`(JSON·HTML)**. 생성물은 손대지 않는다([04 R1](04_CONVENTIONS.md)).
> - 런타임은 `assets/shell.js`가 정적 페이지에 상단바·네비·용어팝업을 주입.
> - `sample/`은 독립형(self-contained) 학습수단/구조 샘플 모음([06](06_SAMPLE_LIBRARY.md)).

## 🗂️ 폴더 역할

| 경로 | 역할 | 소스/생성물 |
|------|------|------------|
| `content/abap/**.md` | 레슨·챕터·글로서리 **소스**(손작성·검수 대상) | 소스 |
| `tools/build-curriculum.mjs` | 빌드 스크립트(gray-matter + marked) | 도구 |
| `docs/abap/curriculum.json` | Tier1: 트랙→챕터(+슬림 레슨) | 생성물 |
| `docs/abap/lessons/CHxx.json` | Tier2: 챕터별 레슨 상세 | 생성물 |
| `docs/abap/pages/*.html` | 레슨 페이지(본문 MD→HTML) | 생성물 |
| `docs/abap/glossary.json` | 용어(=`content/abap/glossary.json` 패스스루) | 생성물 |
| `assets/` | 런타임 셸(`shell.js`·`shell.css`)·`base.css`·`lesson.css` | 소스 |
| `pages/abap.html` | ABAP 로드맵(데이터 주도, `curriculum.json` 렌더) | 소스 |
| `index.html` | 학습 허브(도메인 카드) | 소스 |
| `sample/` | 독립형 학습수단·페이지구조 샘플 + 카탈로그 | 소스(참고용) |
| `.project-docs/` | AI 부팅 컨텍스트(이 폴더) | 문서 |
| `sapui5/`(형제 repo) | **구 참고본 — 읽기 전용([04 R14](04_CONVENTIONS.md))** | 외부 |

## 🔧 빌드 파이프라인

```
content/abap/**.md   (소스)
        │  npm run build:abap   (tools/build-curriculum.mjs)
        ▼
docs/abap/curriculum.json · lessons/CHxx.json · pages/*.html · glossary.json
        │  런타임
        ▼
assets/shell.js  → 상단바 · 좌측 3탭 네비(이 문서/레슨/챕터) · 이전다음 · 용어팝업 주입
```

- **레슨/로드맵 페이지는 `fetch` 사용 → 반드시 HTTP 서빙**(`file://` 불가). → [05 P1](05_PITFALLS.md).
- 로컬: `python -m http.server 8137` 후
  `http://localhost:8137/pages/abap.html`,
  `http://localhost:8137/docs/abap/pages/CH01-L01-logon.html`.

## 🧩 소스 레이아웃 (content/abap)

```
content/abap/
  _tracks.md            트랙 메타(front-matter tracks 배열)
  glossary.json         용어 사전 (term → {title, desc, analogy?})
  CHxx/
    _chapter.md         챕터 메타 + 소개 산문
    CHxx-Lnn[-슬러그].md  레슨 front-matter + 본문 MD
```
- **폴더명 = 챕터 ID**(`CH01/`) → ID만 알면 경로 직행.
- 레슨 파일 = `<레슨ID>[-슬러그].md`. 슬러그는 가독성용(선택), 스캐폴드는 순수 ID.
- front-matter 스키마·본문 MD 규칙은 [04_CONVENTIONS](04_CONVENTIONS.md).

## 🖥️ 런타임 셸 (assets/shell.js)
정적 페이지에 주입: 상단바 · **좌측 3탭 네비(이 문서 목차 / 레슨 / 챕터)** · 이전다음 · 핵심용어 팝업.
> 샘플 `sample/structure/lesson-shell*.html`이 이 셸 패턴의 독립형 데모 + 디자인 시안이다([06](06_SAMPLE_LIBRARY.md)).
