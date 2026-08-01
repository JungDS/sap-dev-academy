# CH30 · ALV 고급 Event 응용 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-03 · ABAP 실무 심화** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 5
> 🕒 생성: 2026-08-01T18:57:10.076Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH30 · ALV 고급 Event 응용 _(난이도: 고급)_

> ALV에서 사용자 상호작용(이벤트)을 처리하고 싶다.

**키워드**: ALV Event, Double Click, Toolbar, User Command

**레슨 (5)**
- **CH30-L01 · Double Click Event** _(order 1)_
  - 다룰 내용: 행을 더블클릭하면 상세로 — ALV 이벤트의 시작.
  - 키워드: double_click, Event, SET HANDLER, ALV
- **CH30-L02 · Hotspot Click Event** _(order 2)_
  - 다룰 내용: 셀을 링크처럼 — 한 번 클릭으로 이동.
  - 키워드: hotspot, hotspot_click, Event
- **CH30-L03 · Toolbar Event** _(order 3)_
  - 다룰 내용: ALV 툴바에 내 버튼을 추가한다.
  - 키워드: toolbar, Event, 커스텀 버튼
- **CH30-L04 · USER_COMMAND 처리** _(order 4)_
  - 다룰 내용: 툴바 버튼이 눌리면 — 명령을 분기 처리한다.
  - 키워드: user_command, Event, 선택 행
- **CH30-L05 · ALV Event Handler Class 설계** _(order 5)_
  - 다룰 내용: 이벤트 처리를 한 클래스로 모아 깔끔하게.
  - 키워드: Event Handler, Class, 설계
