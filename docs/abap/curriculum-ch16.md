# CH16 · Screen Programming / Dynpro 기초 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 10
> 🕒 생성: 2026-08-01T15:40:09.591Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH16 · Screen Programming / Dynpro 기초 _(난이도: 중급)_

> 표준 화면 말고 내가 설계한 입력 화면이 필요하다.

**키워드**: Dynpro, PBO, PAI, Screen Painter

**레슨 (10)**
- **CH16-L01 · Module Pool 프로그램 구조** _(order 1)_
  - 다룰 내용: 화면 중심 프로그램의 뼈대 — Module Pool과 PBO/PAI 두 박자.
  - 키워드: Module Pool, Dynpro, PBO, PAI, SE80, T-code
- **CH16-L02 · Screen Number와 Screen Painter** _(order 2)_
  - 다룰 내용: 화면에 번호를 붙이고, Screen Painter의 네 조각으로 화면을 그린다.
  - 키워드: Screen Number, Screen Painter, Flow Logic, MODULE, SE51
- **CH16-L03 · 화면 요소 — 입력·버튼·체크박스·라디오·드롭다운** _(order 3)_
  - 다룰 내용: 화면 요소를 세 가지 행동(값 운반·function code·표시)으로 구분해 변수와 잇는다.
  - 키워드: Input Field, Push Button, Checkbox, Radiobutton, Dropdown, VRM
- **CH16-L04 · Dictionary 화면 필드와 TABLES 운반** _(order 4)_
  - 다룰 내용: DDIC 필드를 화면에 얹고, 같은 이름의 TABLES work area로 값을 나른다.
  - 키워드: TABLES, table work area, Dictionary field, dynpro field, 운반
- **CH16-L05 · 화면에서 F1·F4 직접 만들기** _(order 5)_
  - 다룰 내용: DDIC 도움이 먼저, 그래도 부족할 때만 flow logic로 직접 F4를 만든다.
  - 키워드: PROCESS ON VALUE-REQUEST, PROCESS ON HELP-REQUEST, F4, F1, DYNP_VALUES_READ, 입력 도움
- **CH16-L06 · PBO 처리 흐름** _(order 6)_
  - 다룰 내용: 화면을 그리기 직전 — 상태·제목·목록·필드 속성을 준비한다.
  - 키워드: PBO, MODULE OUTPUT, LOOP AT SCREEN, MODIFY SCREEN
- **CH16-L07 · PAI 처리 흐름 — OK_CODE와 화면 떠나기** _(order 7)_
  - 다룰 내용: 버튼을 누른 뒤 — OK_CODE를 안전하게 읽고, 화면/프로그램 종료를 구분한다.
  - 키워드: PAI, OK_CODE, SAVE_OK, LEAVE TO SCREEN, LEAVE PROGRAM, SET SCREEN
- **CH16-L08 · PF-STATUS와 TITLEBAR** _(order 8)_
  - 다룰 내용: 화면 위 메뉴·툴바·기능키와 제목을 달고, function code를 PAI와 맞춘다.
  - 키워드: PF-STATUS, TITLEBAR, GUI Status, EXCLUDING, SE41
- **CH16-L09 · Custom Control과 Container · Tabstrip · Subscreen** _(order 9)_
  - 다룰 내용: 화면 안에 ALV·트리를 박을 자리와 화면 분할 구조를 잡는다.
  - 키워드: Custom Control, Custom Container, Tabstrip, Subscreen, Status Icon
- **CH16-L10 · 실습 — 예매 입력 화면 (Dynpro)** _(order 10)_
  - 다룰 내용: Module Pool 종합 — 화면 준비(PBO)·입력 처리(PAI)·검증·종료를 한 흐름으로.
  - 키워드: 실습, 콘서트앱, Dynpro, PBO, PAI, OK_CODE, 검증
