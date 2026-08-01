# CH04 · 연산자와 흐름 제어 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 7
> 🕒 생성: 2026-08-01T16:40:30.498Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH04 · 연산자와 흐름 제어 _(난이도: 입문)_

> 값을 받았지만 계산·분기·반복을 못 한다. 연산자와 흐름 제어로 프로그램에 '판단'과 '되풀이'를 넣는다.

**키워드**: 연산자, IF, CASE, DO, WHILE, 디버깅, 구구단

**레슨 (7)**
- **CH04-L01 · 산술 연산과 대입 · 날짜 산술** _(order 1)_
  - 다룰 내용: 값을 더하고 빼고 곱하고 나누고, 날짜까지 계산한다.
  - 키워드: 산술연산, ADD, SUBTRACT, MULTIPLY, DIVIDE, CLEAR, 날짜산술
- **CH04-L02 · 문자열 다루기** _(order 2)_
  - 다룰 내용: 문자열을 잇고, 자르고, 찾고, 바꾸고, 다듬는다.
  - 키워드: CONCATENATE, SPLIT, FIND, REPLACE, CONDENSE, STRLEN, &&
- **CH04-L03 · IF와 조건식** _(order 3)_
  - 다룰 내용: 조건에 따라 갈라지게 해, 프로그램에 첫 '판단'을 넣는다.
  - 키워드: IF, ELSEIF, ELSE, AND, OR, NOT, IS INITIAL, boolean, abap_bool
- **CH04-L04 · CASE 분기** _(order 4)_
  - 다룰 내용: 한 값을 여러 경우로 깔끔하게 나눈다.
  - 키워드: CASE, WHEN, OTHERS
- **CH04-L05 · DO / WHILE · 루프 제어** _(order 5)_
  - 다룰 내용: 같은 일을 되풀이하고, 멈추고, 건너뛴다.
  - 키워드: DO, WHILE, EXIT, CONTINUE, CHECK, sy-index
- **CH04-L06 · 디버깅 입문** _(order 6)_
  - 다룰 내용: 디버거를 켜, 코드가 도는 동안 변수 값을 눈으로 본다.
  - 키워드: BREAK-POINT, /h, F5, F6, F7, F8, WATCH POINT
- **CH04-L07 · 종합 실습: 구구단** _(order 7)_
  - 다룰 내용: 배운 연산·분기·반복을 모아 구구단을 만든다.
  - 키워드: 구구단, 종합실습, 중첩 DO
