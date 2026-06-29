# 08. LESSON SHELL SPEC — 레슨 셸 표준(v2-C) · 골든 템플릿

> 📅 **최종수정: 2026-06-29 16:19 KST**
> 🎯 **목적:** 레슨 셸 = **v2-C 확정·이식 완료**. 셸/뷰어/빌드 마크업을 고칠 때 지킬 규칙(§0–7) + 텍스트위주 지표(§9) · 골든 템플릿 아키타입(§10) · 레슨 오써링 체크리스트(§11).
> 📖 **읽을 때:** 셸/빌드 마크업 수정 직전 · 레슨 작성 시(§9–§11).
> ⚡ **TL;DR:**
> - 표준 = **v2-C · 이식 완료**(shell.css/js·lesson.css·빌드 템플릿·`tcodes.json`·front-matter·beginner 템플릿 전부 적용). 레퍼런스 = `sample/structure/lesson-shell-v2-c.html`.
> - 색 테마 = **블루 `#3b5bdb` / 그린 `#0ca678` 확정**(`base.css` 토큰 + `html.dark`).
> - T-code 미니페이지·용어 = **레슨 독립 공통**(레슨 전용 문구 금지) · 사전 2계층. [[tcode-minipage-shared]]
> - 생성물(`docs/abap/**`)은 빌드로만(R1), 셸은 fetch라 HTTP 서빙([05 P1](05_PITFALLS.md)).

---

## 0. 무엇이 어디서 (셸 구성 파일)

| 영역 | 파일 | 역할 |
|------|------|------|
| 런타임 동작 | `assets/shell.js` | 레일 네비·우측 여정·용어 hover/click·T코드 모달·설정(localStorage)·전체화면·읽기진행 |
| 셸 스타일 | `assets/shell.css` | v2-C 레이아웃/컴포넌트 |
| 본문 스타일 | `assets/lesson.css` | prose·용어·헤더·콜아웃 |
| 전역 토큰 | `assets/base.css` | 색 테마 토큰(§1) |
| 페이지 생성 | `tools/build-curriculum.mjs` | 헤더(태그/T코드 라벨/목표)·레일/여정 컨테이너·설정 버튼 마크업 emit |
| 공통 사전 | `reference/tcodes.json` | T코드 미니페이지 + DDIC 객체 요약(2계층) · 런타임 직접 fetch |
| 입문자 기준 | `sample/structure/beginner-lesson-template.html` | 확정 셸과 톤·구조 정렬 |
| 생성물 | `docs/abap/**` | **직접 수정 금지** — 빌드 재생성(R1/P2) |

## 1. 색 테마 (확정)
- 사이트 전역·셸 = **블루 `#3b5bdb` + 그린 `#0ca678`**(v2-C 구조/UX + 프로젝트 색 = 과거 D안). `base.css` 토큰 + `html.dark` 오버라이드. (v2-C 샘플의 웜 톤은 미채택.)

## 2. 레이아웃 (S = Shell rule)
- **S1 앱바**(상단 sticky): 홈·메타·설정 도구(글자 A−/A+/↺·다크·가독폭·전체화면).
- **S2 좌측 아이콘 레일**: hover/클릭 확장. 탭 3개 = **레슨 목록 / 학습경로(챕터) / 용어 모음**. 모바일은 드로어(FAB).
- **S3 본문**: `flex`로 **왼쪽 좌표 고정**, 가독폭 토글 시 **`flex-basis`만 확장**(오른쪽으로). 좌측 정렬.
- **S4 우측 "이 레슨의 여정"**: 본문 섹션(h2) 스크롤스파이(현재/지나옴 + 진행선). **flex 형제로 본문 따라 이동**. 모바일은 **하단 고정 시트**(연결선·현재 라벨 라이브·접기/펼침·단계 탭 시 닫힘).

## 3. 컴포넌트 규칙
- **C1 용어**: 본문 `[[term]]`→`<button class="term" data-term=KEY>`. 팝업 **hover=임시, click=고정(× 노출)**, 미고정 시 벗어나면 사라짐. 정의는 `glossary.json`.
- **C2 T-code(★공통)**: 라벨(칩) 클릭 → **레슨 독립 "프로그램 소개" 미니페이지** 모달. 레슨 전용 문구·입문 설명("트랜잭션 코드란?") **공통 화면 금지**(첫 레슨 본문에서 1회). 미니페이지는 그 T코드의 객체를 **클릭 칩**으로 → **2차 요약 팝업**. 레슨별 차이는 **배지(복습/신규)뿐** → 라벨 `data-badge`. [[tcode-minipage-shared]]
- **C3 사전 2계층**: ① 미니페이지(`tcodes.json`) ② 객체 한 줄 요약(`DDIC_SUMMARY` 류). ②는 한 줄.
- **C4 체험/정리/퀴즈는 레슨 CONTENT(.md)** — 셸이 강제하지 않음. 단 **코드 나오면 체험 필수**(R2). 능동 회수(퀴즈/플래시카드)는 정리 뒤 권장.
- **C5 데코**: 섹션 우측 번호/아이콘은 **콘텐츠 뒤(z-index:0)**, 본문 z-index:1. 이모지 데코는 `opacity`로 반투명.
- **C6 여정 연결선 레이어**: hover 음영 < 연결선/진행선(z-index:1) < 점(z-index:2).

## 4. 읽기 설정 (localStorage)
- 글자 크기 A−/A+ (13–20px, 경계서 비활성+반투명) + **리셋 ↺**(기본 16px서 비활성). 다크 모드. 가독 폭(기본↔넓게). **셋 다 localStorage 저장**, `<head>` 선적용 스크립트로 **플래시 방지**.
- **전체화면 = 가독폭 넓게 강제**(폭 버튼 잠금), 해제 시 이전 설정 복원. 아이콘 maximize↔minimize 토글.
- ⚠️ 가독폭 1500px은 **큰 글씨와 함께 쓰는 opt-in** 전제(작은 글씨+넓게는 줄이 길어짐).

## 5. front-matter (셸 헤더 입력)
레슨 `.md` front-matter에서 셸이 헤더를 그린다(생성물 직접 수정 금지).
- **태그**: Track·Chapter(chId)·Lesson(order)·난이도 → 챕터 메타 `difficulty` + 구조에서 **파생**.
- **`tcode`**(선택) + **`tcodeBadge`**(복습|신규|처음): 라벨/모달 트리거.
- **`goals`**(선택) 또는 챕터 objectives 재사용, 없으면 `direction` 대체.
- 빌드가 위를 읽어 `lesson-head`(eyebrow·h1·태그·T코드 라벨·목표 카드)·여정 컨테이너·레일/설정 마크업 emit. 스키마 정본 = [04 R10](04_CONVENTIONS.md).

## 6. 빌드/런타임 가드 (기존 규칙 재확인)
- **R1/P2**: `docs/abap/**`는 생성물 — `content/**.md` + 빌드에서만 고치고 `npm run build:abap` 재생성.
- **P1**: 셸이 `fetch`(curriculum/glossary/tcodes) → `file://` 금지, HTTP 서빙([05 P1](05_PITFALLS.md)/[07](07_BROWSER_TESTING.md)).
- **R9/P8**: 예제 이름은 풀에서만, 1번 정훈영.
- **R8**: `shell.js`·`*.css` 수정 전 인덱스 주석 + grep으로 기존 구현 확인.

## 7. 이식 현황
✅ **v2-C 이식 완료** — `shell.css`/`shell.js`/`lesson.css`·빌드 템플릿·`tcodes.json`(2계층)·front-matter(`tcode`/`goals`)·T코드 모달·`beginner-lesson-template.html` 전부 적용, 전 레슨 페이지 재생성·CH01-L01 데스크톱/모바일/다크 검증·콘솔 0. 색 테마 블루/그린 확정.
> 레퍼런스 구현(픽셀·동작 기준) = [`sample/structure/lesson-shell-v2-c.html`](../sample/structure/lesson-shell-v2-c.html).

---

## 9. 텍스트위주 검증 지표
- `preview_eval`로 각 `.prose`(또는 섹션) 내 **시각/상호작용 노드**(`.embed`·`.term`·`table`·`blockquote/callout`·`img/svg`·`details`) 집계 → **요소 0인 순수 텍스트 섹션 = *리뷰 플래그*(게이트 아님 — 텍스트만으로 충분하면 통과, 장식 강제 금지).** 단 **레슨 전체가 텍스트-only면 보강 필수.** (01 DoD 시각화 항목의 진단 근거.)

## 10. 골든 템플릿 (5 distinct 아키타입) ✅ 완료
Track1 토픽 채점으로 **서로 다른 5 아키타입**을 선정·제작·검증 완료. 나머지 레슨 양산의 기준 템플릿.

| # | 아키타입 | 레슨 | 체험(엔진) |
|---|---|---|---|
| 1 | 이벤트·실행 흐름 | **CH14-L01** Report Event 흐름 | event-lifecycle-buildup(점진 빌드업) |
| 2 | 코드 작성·실행 | **CH01-L04** WRITE 출력 | write-output(편집→실행→리스트 렌더) |
| 3 | DDIC 객체 생성 | **CH03-L01** Domain 기초 | domain-builder(저장→검사→활성화) · SE11 라벨 |
| 4 | SQL·데이터 조회 | **CH07-L01** SELECT INTO TABLE | select-query(projection+WHERE→classic→`sy-subrc`) · SE16N |
| 5 | ALV·출력 | **CH10-L02** SALV factory | salv-grid(factory→display·라벨/정렬/합계) · SE38 |

> 각 골든 = 섹션마다 ≥1 시각/상호작용(§9 통과)·glossary 패리티 0·콘솔 0. 위젯 현황 정본 = [embeds/abap/_index.md](../embeds/abap/_index.md). 미채택 아키타입(GUI조작·모듈화/OO·개념)은 양산 시 추가 템플릿 후보.

## 11. 오써링 체크리스트 (레슨 작성 시 — 운영판 DoD)
> DoD 정본 = [01 DoD](01_AI_SYNC.md). 여기는 레슨 1개 작성의 실무 순서.
1. **동기 훅**: 첫 섹션 "이게 왜 불편한가" → 해결 약속(R3/R5).
2. **흐름**: 왜 → 무엇 → 어떻게 → 실수/주의 → 정리(+다음 불편 `→ CHxx`).
3. **체험(R2)**: 코드/조작 나오면 `::embed CHnn-Lnn-Snn`(기존 위젯 재사용·신규 제작, `embeds/`). 없으면 상황 맞는 시각요소(표·다이어그램·상태그리드).
4. **점진적 공개**: 핵심 용어 `[[term]]`, 깊은 설명은 `> 콜아웃`·`<details>`로 접어 둠.
5. **텍스트위주 지양**: 시각/상호작용은 값 하는 곳에(§9 진단), 레슨 전체 텍스트-only만 금지.
6. **T코드**: 핵심 트랜잭션이면 front-matter `tcode`(+`tcodeBadge`).
7. **이름 풀**(R9)·**glossary 패리티**(R12, 빌드 경고 0).
8. **검증**: 빌드·콘솔0·모바일·다크·인터랙션([07](07_BROWSER_TESTING.md)).
