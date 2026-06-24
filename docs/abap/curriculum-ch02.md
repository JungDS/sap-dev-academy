# CH02 · 변수와 표준 타입 (+ Local Type) — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 4
> 🕒 생성: 2026-06-22T07:11:31.762Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH02 · 변수와 표준 타입 (+ Local Type) _(난이도: 입문)_

> 값을 따옴표에 직접 적자니 바꾸기도 재사용도 불편하다 — 어딘가 담아 두고 싶다.

**키워드**: 변수, DATA, STRING, I, C, N, P, TYPES

**레슨 (4)**
- **CH02-L01 · 변수 선언(DATA)** _(order 1)_
  - 다룰 내용: 값을 담을 그릇 — DATA로 변수를 선언한다.
  - 키워드: DATA, 변수, TYPE
- **CH02-L02 · Complete 타입(STRING·I·F·D·T)** _(order 2)_
  - 다룰 내용: 길이를 따로 안 적어도 되는 완전한 표준 타입부터.
  - 키워드: STRING, I, F, D, T, Complete 타입
- **CH02-L03 · Incomplete 타입(C·N·P)** _(order 3)_
  - 다룰 내용: 길이(와 소수 자릿수)를 함께 지정해야 하는 타입.
  - 키워드: C, N, P, LENGTH, DECIMALS, Incomplete 타입
- **CH02-L04 · Local Type(TYPES) 재사용** _(order 4)_
  - 다룰 내용: 같은 타입 정의를 매번 반복하지 말고, TYPES로 이름 붙여 재사용한다.
  - 키워드: TYPES, Local Type, 재사용
