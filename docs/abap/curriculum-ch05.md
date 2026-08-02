# CH05 · Structure (Local · DDIC) — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초 — Classic 완결** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 5
> 🕒 생성: 2026-08-01T21:23:19.688Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH05 · Structure (Local · DDIC) _(난이도: 초급)_

> 단일 값 변수가 난립한다. 관련된 값을 하나로 묶고 싶다.

**키워드**: Structure, BEGIN OF, DDIC Structure, MOVE-CORRESPONDING

**레슨 (5)**
- **CH05-L01 · Local Structure (BEGIN OF ~ END OF)** _(order 1)_
  - 다룰 내용: BEGIN OF ~ END OF로 Structure를 만들어 관련된 값을 하나로 묶는다.
  - 키워드: Structure, BEGIN OF, END OF, Work Area, Component, TYPES, LIKE
- **CH05-L02 · DDIC Structure** _(order 2)_
  - 다룰 내용: SE11에서 DDIC Structure를 만들어 Structure Type을 전역으로 공유한다.
  - 키워드: DDIC Structure, SE11, Data Element, Structure
- **CH05-L03 · Structure 재사용 — 중첩 · .INCLUDE · .APPEND** _(order 3)_
  - 다룰 내용: Structure 안에 Structure를 끼워 넣고, 펼쳐 담아 재사용한다.
  - 키워드: 중첩 Structure, .INCLUDE, .APPEND, Structure 재사용
- **CH05-L04 · Structure 다루기** _(order 4)_
  - 다룰 내용: Structure 복사·초기화·동일 이름 필드 옮기기(MOVE-CORRESPONDING).
  - 키워드: MOVE-CORRESPONDING, CLEAR, Structure, Work Area
- **CH05-L05 · 구구단 한 줄 = Structure (캡스톤)** _(order 5)_
  - 다룰 내용: 구구단 한 줄을 Structure로 묶어 채우고, 디버거로 들여다본다.
  - 키워드: 구구단, Structure, Work Area, 캡스톤
