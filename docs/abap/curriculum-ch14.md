# CH14 · Report Event·Selection Screen 심화 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 8
> 🕒 생성: 2026-06-22T07:11:31.769Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH14 · Report Event·Selection Screen 심화 _(난이도: 중급)_

> 실행 흐름의 적절한 시점에 코드를 끼우고, 선택화면을 다듬고 싶다.

**키워드**: INITIALIZATION, AT SELECTION-SCREEN, START-OF-SELECTION

**레슨 (8)**
- **CH14-L01 · ABAP Report Event 전체 흐름** _(order 1)_ · T-code: `SE38`(복습)
  - 다룰 내용: 실행형 프로그램의 이벤트 순서 — 언제 무엇이 실행되나.
  - 키워드: Report Event, INITIALIZATION, START-OF-SELECTION, 흐름
- **CH14-L02 · INITIALIZATION 기본값 설정** _(order 2)_
  - 다룰 내용: 화면 뜨기 전 1회 — PARAMETERS/SELECT-OPTIONS 기본값.
  - 키워드: INITIALIZATION, PARAMETERS, SELECT-OPTIONS, 기본값
- **CH14-L03 · AT SELECTION-SCREEN OUTPUT 동적 화면 제어** _(order 3)_
  - 다룰 내용: 화면 그리기 직전(PBO) — 필드를 동적으로 숨김/잠금.
  - 키워드: AT SELECTION-SCREEN OUTPUT, LOOP AT SCREEN, PBO
- **CH14-L04 · AT SELECTION-SCREEN 입력 검증** _(order 4)_
  - 다룰 내용: 사용자가 실행할 때(PAI) — 입력값을 검증하고, 화면 전체로도 필드 하나로도 막는다.
  - 키워드: AT SELECTION-SCREEN, AT SELECTION-SCREEN ON, MESSAGE, 입력검증, PAI
- **CH14-L05 · START-OF-SELECTION 조회 실행** _(order 5)_
  - 다룰 내용: 본 처리의 자리 — 조회·가공을 여기서.
  - 키워드: START-OF-SELECTION, Open SQL, 본처리
- **CH14-L06 · END-OF-SELECTION 출력 마무리** _(order 6)_
  - 다룰 내용: 본 처리 후 마무리 — 출력·요약을 정리.
  - 키워드: END-OF-SELECTION, 출력, ALV
- **CH14-L07 · Selection Screen 권한/존재 여부 검증 기초** _(order 7)_
  - 다룰 내용: 입력 단계에서 권한과 존재를 확인하는 기초.
  - 키워드: AUTHORITY-CHECK, 입력검증, 권한, AT SELECTION-SCREEN
- **CH14-L08 · Selection Screen 고급 — 블록·그룹 검증과 커스텀 F1·F4** _(order 8)_
  - 다룰 내용: 필드 하나를 넘어 — 블록/라디오그룹 검증과, 코드로 직접 만드는 F1 도움말·F4 입력 도움.
  - 키워드: AT SELECTION-SCREEN ON, ON BLOCK, ON RADIOBUTTON GROUP, ON HELP-REQUEST, ON VALUE-REQUEST, F1, F4
