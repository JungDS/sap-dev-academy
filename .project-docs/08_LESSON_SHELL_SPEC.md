# 08. LESSON SHELL SPEC — 레슨 셸 표준(v2-C 확정) · 이식 규칙

> 📅 **최종수정: 2026-06-18 19:51 KST**
> 🎯 **목적:** 레슨 셸 디자인을 **v2-C로 확정**했고, 이를 실제 런타임(`assets/shell.*`)·빌드(`tools/build-curriculum.mjs`)·입문자 템플릿에 이식할 때 **지켜야 할 규칙·주의·체크리스트**를 한곳에.
> 📖 **읽을 때:** 레슨 셸/뷰어/빌드 마크업을 건드리기 직전. 입문자 템플릿 작성 시.
> ⚡ **TL;DR:**
> - 확정본 = **`sample/structure/lesson-shell-v2-c.html`** (레퍼런스 구현). 이걸 데이터 주도 셸로 이식.
> - **Phase 1 이식 완료**: `shell.css`/`shell.js`/`lesson.css`/빌드 템플릿 → 192페이지 재생성. 남은 건 P1(tcodes.json)·P2(front-matter tcode)·P5(입문자 템플릿).
> - **색 테마 = 프로젝트 블루/그린 확정(D안).** base.css 토큰 + html.dark 오버라이드.
> - T-code 미니페이지·용어는 **레슨 독립 공통**(레슨 전용 문구 금지). 사전은 2계층. [[tcode-minipage-shared]]
> - 생성물(`docs/abap/**`)은 **빌드로만**(R1). 셸은 fetch라 **HTTP 서빙**(P1).

---

## 0. 무엇을 어디에 (이식 대상 파일)

| 영역 | 파일 | 변경 성격 |
|------|------|-----------|
| 런타임 동작 | `assets/shell.js` | 레일 네비·우측 여정·용어 hover/click·T코드 모달·설정(localStorage)·전체화면·읽기진행 |
| 셸 스타일 | `assets/shell.css` | v2-C 레이아웃/컴포넌트 |
| 본문 스타일 | `assets/lesson.css` | prose·용어·헤더·콜아웃 정렬 |
| 전역 토큰 | `assets/base.css` | **색 테마 결정에 따라**(§1) |
| 페이지 생성 | `tools/build-curriculum.mjs` | 헤더(태그/T코드 라벨/목표)·레일/여정 컨테이너·설정 버튼 마크업 emit |
| 공통 사전 | `content/abap/tcodes.json` (신규) | T코드 미니페이지 + DDIC 객체 요약(2계층) |
| 입문자 기준 | `sample/structure/beginner-lesson-template.html` | 확정 셸과 톤·구조 정렬 |
| 생성물 | `docs/abap/**` | **직접 수정 금지** — 빌드 재생성(R1/P2) |

---

## 1. 색 테마 (결정 필요) 🚩
- 사이트 전역(`base.css`·`index.html`·`pages/abap.html`)은 **블루 `#3b5bdb` + 그린 `#0ca678`**.
- v2-C 샘플은 **웜(티얼 `#0f766e`·앰버 `#b45309`·크림)**.
- **선택지:** (A) v2-C **구조/UX + 프로젝트 블루·그린**(=과거 D안, 사이트 일관·권장) / (B) 웜 톤을 `base.css`까지 **사이트 전체 확장** / (C) 레슨만 웜(불일치·비권장).
- **결정 전 셸 색 작업 착수 금지.** 결정되면 본 문서 갱신.

## 2. 레이아웃 (S = Shell rule)
- **S1 앱바**(상단 sticky): 홈·메타·설정 도구(글자 A−/A+/↺·다크·가독폭·전체화면).
- **S2 좌측 아이콘 레일**: hover/클릭 확장. 탭 3개 = **레슨 목록 / 학습경로(챕터) / 용어 모음**. 모바일은 드로어(FAB).
- **S3 본문**: `flex`로 **왼쪽 좌표 고정**, 가독폭 토글 시 **`flex-basis`만 확장**(오른쪽으로). 좌측 정렬(넓힐 때 왼쪽 안 움직이게 한 귀결).
- **S4 우측 "이 레슨의 여정"**: 본문 섹션(h2) 스크롤스파이(현재/지나옴 + 진행선). **flex 형제로 본문 따라 이동**. 모바일은 **하단 고정 시트**(연결선 유지·점/글자 정렬·현재 라벨 라이브·접기/펼침·단계 탭 시 닫힘).

## 3. 컴포넌트 규칙
- **C1 용어**: 본문 `[[term]]`→`<button class="term" data-term=KEY>`. 팝업은 **hover=임시 표시, click=고정(× 노출)**, 미고정 시 벗어나면 사라짐. 정의는 `glossary.json`.
- **C2 T-code(★공통)**: 라벨(칩) 클릭 → **레슨 독립 "프로그램 소개" 미니페이지** 모달. 레슨 전용 문구("이번 Lesson…", 레슨별 정리) **금지**. 입문 설명("트랜잭션 코드란?")도 **공통 화면엔 넣지 않음**(첫 레슨 본문에서 1회). 미니페이지는 그 T코드가 다루는 객체를 **클릭 칩**으로 나열 → **2차 요약 팝업**. 레슨별로 다른 건 **배지(복습/신규)뿐** → 라벨 `data-badge`. [[tcode-minipage-shared]]
- **C3 사전 2계층**: ① 미니페이지(`tcodes.json`) ② 객체 한 줄 요약(`DDIC_SUMMARY` 류). 전부 상세설명은 과함 → ②는 한 줄.
- **C4 체험/정리/퀴즈는 레슨 CONTENT(.md)** — 셸이 강제하지 않는다. 단 **코드가 나오면 그 레슨에서 체험 필수**(R4). 능동 회수(퀴즈/플래시카드)는 정리 뒤 권장.
- **C5 데코**: 섹션 우측 번호/아이콘은 **콘텐츠 뒤(z-index:0)**, 본문 z-index:1 → 글자 안 가림. 이모지 데코는 `color` 안 먹으므로 **`opacity`로 반투명**.
- **C6 여정 연결선 레이어**: hover 음영 < 연결선/진행선(z-index:1) < 점(z-index:2).

## 4. 읽기 설정 (localStorage)
- 글자 크기 A−/A+ (13~20px, 경계서 비활성+반투명) + **리셋 ↺**(기본 16px서 비활성). 다크 모드. 가독 폭(기본↔넓게). **셋 다 localStorage 저장**, `<head>` 선적용 스크립트로 **플래시 방지**.
- **전체화면 = 가독폭 넓게 강제**(폭 버튼 잠금), 해제 시 이전 설정 복원(localStorage 미변경). 전체화면 아이콘 maximize↔minimize 토글.
- ⚠️ 가독폭 1500px은 **큰 글씨와 함께 쓰는 opt-in** 전제(작은 글씨+넓게는 줄이 길어짐, 사용자 자기교정 영역).

## 5. front-matter 확장 (R2 보강 — 결정/추가 필요)
레슨 `.md`에 셸이 헤더를 그리려면 다음을 **소스에서** 받아야 한다(생성물 직접 수정 금지).
- **태그**: Track(트랙)·Chapter(chId)·Lesson(order)·난이도 → 챕터 메타 `difficulty` + 구조에서 **파생 가능**(front-matter 추가 불필요).
- **T-code**(선택): `tcode: SE11` (+ `tcodeBadge: 복습|신규|처음`). 라벨/모달 트리거.
- **학습 목표**(선택): `goals: "…"` 또는 챕터 `objectives` 재사용. 없으면 `direction`로 대체.
- 빌드는 위를 읽어 `lesson-head`(eyebrow·h1·태그·T코드 라벨·목표 카드)·여정 컨테이너·레일/설정 마크업을 emit.

## 6. 빌드/런타임 주의 (기존 규칙 재확인)
- **R1/P2**: `docs/abap/**`는 생성물 — `content/**.md` + 빌드 스크립트에서만 고치고 `npm run build:abap` 재생성.
- **P1**: 셸이 `fetch`(curriculum/glossary/tcodes) → `file://` 금지, `python -m http.server`로 HTTP 서빙.
- **R7/P8**: 예제 이름은 풀에서만, 1번 정훈영.
- **R8**: `shell.js`·`*.css` 수정 전 전체 읽기(이 작업 이미 수행).

## 7. 이식 체크리스트 (단계)
- [x] **(P0) §1 색 테마 확정** — 프로젝트 블루/그린(D안).
- [ ] (P1) `tcodes.json` 스키마 + 초기 T코드(SE38·SE11·SE16N·SE80…) 작성, 빌드 pass-through. **(다음)**
- [ ] (P2) front-matter 확장(`tcode`/`tcodeBadge`/`goals`) — 빌드 emit은 준비됨(tcode 라벨 조건부). 콘텐츠에 값 추가 + shell.js에 T코드 모달(2계층) 결선. **(다음)**
- [x] (P3) `shell.css`/`lesson.css`에 v2-C 컴포넌트 이식(블루/그린 + html.dark). base.css는 미변경(토큰 재사용).
- [x] (P4) `shell.js` 재작성: 레일(레슨/챕터/용어)·여정 스크롤스파이(모바일 시트)·용어 hover/click·설정(글자/다크/폭/전체화면)·읽기진행·이전다음. (T코드 모달만 P2로)
- [ ] (P5) `beginner-lesson-template.html` 정렬.
- [x] (P6) `npm run build:abap` 통과(192페이지) + CH01-L01 데스크톱/모바일/다크 검증 + 콘솔0.
- [ ] (P7) 시안 정리: v2-C ✅확정, A/B 사용금지, **D/E/F/G 대체됨**(보존/삭제는 확인 후).

> 레퍼런스 구현(픽셀·동작 기준): [`sample/structure/lesson-shell-v2-c.html`](../sample/structure/lesson-shell-v2-c.html). 이식은 이 파일의 CSS/JS 블록을 데이터 주도로 옮기는 작업이다.
