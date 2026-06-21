# 02. PROGRESS — 진행 현황 · 다음 할 일

> 📅 **최종수정: 2026-06-21 00:37 KST**
> 🎯 **목적:** 목표가 어디까지 왔고, 다음에 무엇을 할지. 작업 시작·종료 시 갱신.
> 📖 **읽을 때:** 작업 시작 전(현황 파악) · 종료 후(갱신).
> ⚡ **TL;DR:** ABAP 커리큘럼 골격+CH01~14 본문 완료(CH15+ 스텁). 이번에 `sample/` 독립형 라이브러리 구축 + 입문자 작성표준·이름 풀 확정.

## 📦 ABAP 커리큘럼

| 항목 | 상태 |
|------|------|
| 콘텐츠 파이프라인(`tools/build-curriculum.mjs`) | ✅ 동작 |
| 런타임 셸(`assets/shell.js`/`shell.css`/`lesson.css`) | ✅ **v2-C 이식 Phase 1** — 앱바·설정(글자/다크/폭/전체화면)·좌측 레일(레슨/챕터/용어)·우측 여정(스크롤스파이·모바일 시트)·용어 hover/click·읽기진행·이전다음. 블루/그린+다크. **+T코드 공통 미니페이지(tcodes.json 2계층)·`::embed` 체험 임베드(R4)·글로서리 패리티 게이트.** 시안 D/E/F/G 사용금지(대체됨). [08](08_LESSON_SHELL_SPEC.md) |
| 코드 블록 표시 | ✅ **code-copy-block 양식 강제**(빌드가 ```abap → `.abap-editor`: 네이비 헤더+줄번호+ABAP 토큰색+복사). 다크 금지([05 P10](05_PITFALLS.md)/[04 R5](04_CONVENTIONS.md)). `<details>` 클릭 단서·생성물 파일명 `CHxx-Lyy.html` 통일([04 R11](04_CONVENTIONS.md)). |
| 전체 spine(35챕터/**194**레슨 스캐폴딩) | ✅ (CH01에 WRITE 심화 L05 신설 → 6레슨) |
| CH01~CH14 본문(classic 기초 전체) | ✅ 완료 (단 CH14-L08 = `AT SELECTION-SCREEN ON` 심화 **예약 스텁**, 본문 추후) |
| CH15~CH35 본문 | 🚧 스텁 골격 |
| 통합 커리큘럼 MD(`CURRICULUM.md`) | ✅ `npm run build:curriculum-md`로 전 챕터·레슨 구조+다룰내용 개요를 단일 MD 생성(NotebookLM 소스용). 생성물 — front-matter에서 고치고 재생성. |
| 로드맵 `pages/abap.html` | ✅ 개편 — 챕터 아코디언 + 레슨 요약(direction)·키워드·**직접 점프** + 검색/트랙점프/전체펼치기. v2-C 조화(블루/그린). 레슨 상세는 `lessons/CHxx.json` 지연 로드 |
| glossary(65용어, CH01~14 커버) | ✅ |
| 브라우저 시각 스모크테스트 | ⚠️ 일부 미실시(미리보기 깊은 URL 제약 → [07](07_BROWSER_TESTING.md)) |

## 🧪 샘플 라이브러리 (`sample/`) — 이번 세션 구축

- 카테고리별 **독립형(self-contained) 학습수단·구조 샘플** + 카탈로그(`sample/index.html`). 상세 [06_SAMPLE_LIBRARY](06_SAMPLE_LIBRARY.md).
- **디자인 결정 현황**:
  - 스텝 디버거: ✅ **A안(라이트 IDE) 확정** → `code-learning/step-debugger.html`(ABAP 구문강조·콘솔 현재행/전체 토글·강조=실행 직전). 비교본 제거됨.
  - Mermaid 흐름도: ✅ **A안(배지 카드) 확정** → `visuals/mermaid-flowchart.html`(역할 배지 카드·곡선 엣지·빈 라벨 박스 숨김·스타디움 라벨 클립 해제). 비교 시안 제거됨.
  - 레슨 셸: ✅ **v2-C 확정(표준)** → `sample/structure/lesson-shell-v2-c.html`(레일=E · 학습여정=F · 용어모음=G · 헤더 그라데이션 · T코드 공통 미니페이지+객체 요약 2계층 · 용어 hover/click · 전체화면=와이드강제 · 다크/글자크기(±·리셋)/가독폭 localStorage · 체험 슬롯(R4) · 끝 미니퀴즈 · 본문 좌측정렬 flex-basis 애니메이션 · 모바일 하단 여정 시트). A/B 사용금지, D/E/F/G 대체됨. **이식 규칙 → [08_LESSON_SHELL_SPEC](08_LESSON_SHELL_SPEC.md)**. ⚠️ 색 테마(블루·그린 vs 웜) 결정 후 실제 셸 이식 착수.
- **확정 규칙**(이번 세션): 입문자 작성표준([04 R3](04_CONVENTIONS.md)) · 이름 풀([04 R9](04_CONVENTIONS.md)).
- **🎨 디자인 일관화 패스(2026-06-19)** — 전 샘플(39개)에 디자인 규율 적용 + 각 파일 `@design-applied`/`@design-notes` 주석. 코드 에디터 헤더 통일(#2c3666 + 브랜드 액센트 · 쿨톤 거터 #eef1f8). code-copy-block은 2프리셋(A 프로그램명 표시 / B 생략)으로 재구성. **현재 사용자 리뷰 대기 중** → 리뷰 완료 후 처리(보류):
  - (A) **빌드 전파** — 샘플(스펙)의 코드블록 디자인을 실제 레슨(`lesson.css`/빌드 스크립트, [08](08_LESSON_SHELL_SPEC.md))에 이식.
  - (B) **코드 예제 디자인 완전 통일** — code-copy-block(`.abap-editor`) 기준으로 나머지 코드 샘플(code-tour·bug-hunt·step-debugger·event-lifecycle·write-output·write-format·select-query·salv·**fill-blank·diff-mapper·beginner-template**·image-hotspot)의 잔여 차이(`tok-*` 색·복사버튼·헤더 구조) 정리. ※ 클래스 체계가 제각각(.abap-editor/.code/.code-tour/.bughunt/.dbg/.ed/.codebox)이라 *시각 토큰*만 통일, 동작 구조는 샘플별 유지.
  - (C) **이모지 정책 정정 반영** — 이번에 이모지를 ✓/✗·SVG로 바꾼 변경은 [04 R3](04_CONVENTIONS.md) 신규 **이모지 권장** 정책과 반대 방향 → **복원 예정**(대상 독자=20대 비전공, 이모지=친근감 수단).
  - (D) commit — 위 정리 후.

## ▶️ 다음 할 일 (우선순위)
1. **골든 템플릿 5종 ✅ 전부 완료** — 셸 이식(✅v2-C·T코드·`::embed`) + 골든 5종([08 §10](08_LESSON_SHELL_SPEC.md)) 모두 신규 시뮬레이터 제작·검증 완료: ✅ **#1 CH14-L01(흐름)** 이벤트 점진적 빌드업 · ✅ **#2 CH01-L04(코드)** WRITE 출력 · ✅ **#3 CH03-L01(DDIC)** Domain 생성(저장→검사→활성화) · ✅ **#4 CH07-L01(SQL)** SELECT 조회(projection+WHERE→classic→sy-subrc) · ✅ **#5 CH10-L02(ALV)** SALV factory→display(라벨 자동·정렬·합계). 오써링 체크리스트=[08 §11](08_LESSON_SHELL_SPEC.md).
   - **▶ 다음**: 이 5 아키타입을 기준으로 나머지 레슨 양산(아래 2번).
2. **나머지 레슨 양산** — 골든 5종을 기준으로 CH01~14 업그레이드 + CH15~ 본문. ⚠️ CH18 classic→modern 경계([04 R6](04_CONVENTIONS.md)).
3. **시각 스모크테스트** — 셸 인터랙션·로드맵·임베드 렌더 눈으로 확인.
4. `index.html` 허브에서 ABAP 카드 → 로드맵 연결 점검.

## 🧠 메모리 핸드오프
`~/.claude/projects/.../memory/`: sda-architecture · abap-curriculum-design · sapui5-readonly · user-working-style · example-name-pool · beginner-learning-page-style. 새 세션은 이걸로 재설명 없이 이어간다.

> 과거 세션 상세는 git log 참조. (구 `PROGRESS-20260618.md`·`AUTHORING.md`는 이 번호 체계로 흡수됨.)
