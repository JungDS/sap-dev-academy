# CH04 · Structure (Local · DDIC) — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 3
> 🕒 생성: 2026-06-22T07:11:31.763Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH04 · Structure (Local · DDIC) _(난이도: 초급)_

> 낱개 변수가 난립한다 — 관련된 값을 하나로 묶고 싶다.

**키워드**: Structure, BEGIN OF, DDIC Structure, MOVE-CORRESPONDING

**레슨 (3)**
- **CH04-L01 · Local Structure(BEGIN OF~END OF)** _(order 1)_
  - 다룰 내용: 관련된 값을 하나로 — BEGIN OF ~ END OF로 구조체를 만든다.
  - 키워드: Structure, BEGIN OF, END OF, Work Area, 컴포넌트
- **CH04-L02 · DDIC Structure** _(order 2)_
  - 다룰 내용: 구조체 모양도 전역으로 — SE11에서 DDIC Structure로 공유한다.
  - 키워드: DDIC Structure, SE11, Data Element, 구조체
- **CH04-L03 · 구조체 다루기** _(order 3)_
  - 다룰 내용: 구조체 복사·초기화·동일 이름 필드 옮기기(MOVE-CORRESPONDING).
  - 키워드: MOVE-CORRESPONDING, CLEAR, 구조체, Work Area
