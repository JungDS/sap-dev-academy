# 저술·빌드 표준 (ABAP 커리큘럼)

> 내부 운영 문서. 학습 허브에는 노출되지 않는다.

## 아키텍처 한눈에

```
content/abap/**.md   (소스, 손작성·검수 대상)
        │  npm run build:abap   (gray-matter + marked)
        ▼
docs/abap/curriculum.json   (Tier1: 트랙→챕터(+슬림 레슨))
docs/abap/lessons/CHxx.json (Tier2: 챕터별 레슨 상세)
docs/abap/pages/*.html      (레슨 페이지 — 본문 MD→HTML)
docs/abap/glossary.json     (용어, content/abap/glossary.json 패스스루)
        │  런타임
        ▼
assets/shell.js  → 상단바·좌측 3탭 네비(이문서/레슨/챕터)·이전다음·용어팝업 주입
```

## 소스 레이아웃

```
content/abap/
  _tracks.md            트랙 메타(front-matter의 tracks 배열)
  glossary.json         핵심용어 사전 (term → {title, desc, analogy?})
  CHxx/
    _chapter.md         챕터 메타 + 소개 산문
    CHxx-Lnn[-슬러그].md  레슨 front-matter + 본문 MD
```

- **폴더 = 챕터 ID 그대로**(`CH01/`) → ID만 알면 경로 직행.
- 레슨 파일 = `<레슨ID>[-슬러그].md`. 슬러그는 선택(가독성용). 자동 스캐폴드는 순수 ID(`CH08-L01.md`).

## front-matter 스키마

**_chapter.md**
```yaml
id: CH01            # = 폴더명
track: TRACK-01
order: 1
title: 개발 환경과 첫 프로그램   # 기술형(스캔 가능)
intro: "…불편 한 줄(동기 훅)…"   # 동기부여는 제목이 아니라 여기
objectives: [ … ]   # 선택
keywords: [ … ]
difficulty: 입문
```

**레슨 .md**
```yaml
id: CH01-L01
title: SAPGUI 로그온과 화면 구성
direction: "…학습 방향 한 줄…"
keywords: [ … ]
order: 1
```

## 본문(MD) 규칙

- 섹션은 `##`(필요시 `###`). 네비 "이 문서" 탭이 `##/###`를 자동 목차로 만든다.
- 코드: ```` ```abap … ``` ````
- 핵심용어: `[[WRITE]]` 또는 표시텍스트 분리 `[[Internal Table|내부 테이블]]`
  → 셸이 `<button class="term" data-term="…">`로 변환, 클릭 시 glossary 팝업.
  **사용한 모든 `data-term` 키는 glossary.json에 있어야 한다**(빌드 후 정적 점검 권장).
- 콜아웃은 `>` 블록인용.
- 챕터/레슨 끝에 다음 불편의 씨앗을 `→ CHxx` 로 명시(불편 체인).

## 핵심 규칙 (락)

1. **HTML은 생성물 — 절대 손으로 고치지 않는다.** 내용은 `content/**.md`에서만.
2. **제목은 기술형, 동기는 `intro`/`direction`.** (제목에 서사 문구 금지)
3. **classic-first SQL 경계 = CH18.** CH07~CH16의 Open SQL은 전부 classic
   (공백 필드리스트, host 변수 그대로, 미리 선언한 INTO TABLE).
   **CH18부터** modern(`,` 필드리스트, `@`/`@DATA()`).
4. 스칼라·구조체는 Local → Global(DDIC) 나선. DDIC는 쪼개서 CH03/CH04/CH06에 분산.

## 빌드 & 서빙

```bash
npm run build:abap     # content/abap → docs/abap 재생성
```

- 레슨/로드맵 페이지는 `fetch`를 쓰므로 **HTTP로 서빙**해야 한다(file:// 불가).
- 로컬 확인: `python -m http.server 8137` 후
  `http://localhost:8137/docs/abap/pages/CH01-L01-logon.html`,
  `http://localhost:8137/pages/abap.html`.
- 정적 배포(GitHub Pages 등)는 `docs/abap` 생성물을 커밋해서 사용.

## 챕터 spine (35챕터 / 2트랙)

TRACK-01(기초) CH01~CH22, TRACK-02(실무) CH23~CH35.
전반부(CH01~07) 재그룹 설계, 후반부(CH08~35)는 v5.4 순서를 이식.
상세는 `docs/abap/curriculum.json` 및 로드맵 페이지(`pages/abap.html`) 참조.
