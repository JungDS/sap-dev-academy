# CH15 · Report Event·Selection Screen 심화 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초 — Classic 완결** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 12
> 🕒 생성: 2026-08-01T21:23:19.695Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH15 · Report Event·Selection Screen 심화 _(난이도: 중급)_

> 실행 흐름의 적절한 시점에 코드를 끼우고, 선택화면을 다듬고 싶다.

**키워드**: INITIALIZATION, AT SELECTION-SCREEN, START-OF-SELECTION

**레슨 (12)**
- **CH15-L01 · ABAP Report Event 전체 흐름** _(order 1)_ · T-code: `SE38`(복습)
  - 다룰 내용: 실행형 프로그램의 이벤트 순서 — 언제 무엇이 실행되나.
  - 키워드: Report Event, INITIALIZATION, START-OF-SELECTION, 흐름
- **CH15-L02 · INITIALIZATION 기본값 설정** _(order 2)_
  - 다룰 내용: 화면 뜨기 전 1회 — 좋은 출발점 제안(매번 강제 아님).
  - 키워드: INITIALIZATION, PARAMETERS, SELECT-OPTIONS, 기본값
- **CH15-L03 · AT SELECTION-SCREEN OUTPUT 동적 화면 제어** _(order 3)_
  - 다룰 내용: 화면 그리기 직전(PBO) — 필드를 동적으로 숨김/잠금.
  - 키워드: AT SELECTION-SCREEN OUTPUT, LOOP AT SCREEN, MODIFY SCREEN, PBO
- **CH15-L04 · AT SELECTION-SCREEN 입력 검증** _(order 4)_
  - 다룰 내용: 사용자가 실행할 때(PAI) — 입력값을 검증하고, 화면 전체로도 필드 하나로도 막는다.
  - 키워드: AT SELECTION-SCREEN, AT SELECTION-SCREEN ON, MESSAGE, 입력검증, PAI
- **CH15-L05 · START-OF-SELECTION 조회 실행** _(order 5)_
  - 다룰 내용: 검증을 통과한 뒤 본 처리(DB 조회·가공)를 시작하는 표준 자리.
  - 키워드: START-OF-SELECTION, Open SQL, sy-subrc, 본처리
- **CH15-L06 · END-OF-SELECTION의 위치와 경계** _(order 6)_
  - 다룰 내용: 신규 리포트의 표준 마무리가 아니다 — legacy/LDB 이벤트로 정확히 자리매김.
  - 키워드: END-OF-SELECTION, Logical Database, legacy, obsolete
- **CH15-L07 · Selection Screen 권한/존재 여부 검증 기초** _(order 7)_
  - 다룰 내용: 입력 단계에서 "있는 값인가"와 "볼 수 있는 사용자인가"를 분리해 막는다.
  - 키워드: AUTHORITY-CHECK, SELECT SINGLE, 존재검증, 권한검증, AT SELECTION-SCREEN
- **CH15-L08 · Selection Screen 고급 — 블록·그룹 검증과 커스텀 F1·F4** _(order 8)_
  - 다룰 내용: 필드 하나를 넘어 — 블록/라디오그룹 검증과, 코드로 직접 만드는 F1 도움말·F4 입력 도움.
  - 키워드: AT SELECTION-SCREEN ON, ON BLOCK, ON RADIOBUTTON GROUP, ON HELP-REQUEST, ON VALUE-REQUEST, F1, F4
- **CH15-L09 · Selection Screen UI 구성** _(order 9)_
  - 다룰 내용: 입력 조건을 업무 단위로 — 블록·체크박스·라디오·버튼·탭·툴바.
  - 키워드: SELECTION-SCREEN, BLOCK, CHECKBOX, RADIOBUTTON, PUSHBUTTON, SSCRFIELDS
- **CH15-L10 · PARAMETERS · SELECT-OPTIONS 옵션 총정리** _(order 10)_
  - 다룰 내용: 입력 항목에 붙이는 옵션들을 한자리에 — 필수·기본값·대소문자·복수선택·화면제어.
  - 키워드: PARAMETERS, SELECT-OPTIONS, OBLIGATORY, MEMORY ID, MODIF ID, LOWER CASE
- **CH15-L11 · 여러 선택화면 — 화면번호·CALL·Variant** _(order 11)_
  - 다룰 내용: 선택화면을 여러 개 두고 골라 부른다 — 화면번호·팝업 호출·입력값 저장.
  - 키워드: SELECTION-SCREEN, CALL SELECTION-SCREEN, Variant, 화면번호, sy-subrc
- **CH15-L12 · 실습 — 예매현황 리포트 (이벤트·검증)** _(order 12)_
  - 다룰 내용: 이벤트·검증 종합 — 기본값·화면제어·입력/존재/권한 검증·조회·표시를 이벤트마다 제자리에.
  - 키워드: 실습, 콘서트앱, INITIALIZATION, AT SELECTION-SCREEN, AUTHORITY-CHECK, START-OF-SELECTION
