# CH18 · Modern ABAP Syntax — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-02 · Modern ABAP과 새 개발 모델** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 11
> 🕒 생성: 2026-08-01T21:23:19.698Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH18 · Modern ABAP Syntax _(난이도: 중급)_

> 장황한 고전 구문이 번거롭다 — 현대 ABAP으로 간결하게.

**키워드**: inline DATA, VALUE, FOR, string template, CORRESPONDING

**레슨 (11)**
- **CH18-L01 · Inline Declaration** _(order 1)_
  - 다룰 내용: 선언 위치를 의도 가까이로 — DATA()/FINAL() 인라인 선언.
  - 키워드: inline, DATA(), FINAL(), declaration position, Modern
- **CH18-L02 · VALUE Constructor Expression** _(order 2)_
  - 다룰 내용: Structure·내부 테이블을 결과 모양 그대로 — VALUE
  - 키워드: VALUE #(), Constructor, Internal Table, BASE, FOR
- **CH18-L03 · CORRESPONDING과 구조 매핑** _(order 3)_
  - 다룰 내용: 이름이 같은 필드를 새 타입으로 옮긴다 — CORRESPONDING·MAPPING·EXCEPT.
  - 키워드: CORRESPONDING #(), MAPPING, EXCEPT, MOVE-CORRESPONDING
- **CH18-L04 · Table Expression** _(order 4)_
  - 다룰 내용: 한 행을 값처럼 읽는다 — tab[ ]·line_exists·line_index (짧지만 안전하게).
  - 키워드: Table Expression, line_exists, line_index, CX_SY_ITAB_LINE_NOT_FOUND
- **CH18-L05 · String Template과 내장 함수** _(order 5)_
  - 다룰 내용: 출력 문장 모양 그대로 — | … { } … | 템플릿과 함수형 문자열 함수.
  - 키워드: String Template, | |, to_upper, substring, strlen
- **CH18-L06 · CONV·EXACT 변환 표현식** _(order 6)_
  - 다룰 내용: 임시 변수 없이 그 자리에서 타입을 바꾸는 CONV, 손실을 막는 EXACT.
  - 키워드: CONV, EXACT, 타입 변환, constructor expression
- **CH18-L07 · COND·SWITCH 조건 표현식** _(order 7)_
  - 다룰 내용: 조건에 따라 값 하나를 만드는 표현식 — 흐름을 나누는 IF/CASE와 구분한다.
  - 키워드: COND, SWITCH, 조건 표현식, constructor expression
- **CH18-L08 · REDUCE·FILTER 테이블 표현식** _(order 8)_
  - 다룰 내용: 여러 행을 하나로 줄이는 REDUCE, 조건 행만 새 테이블로 뽑는 FILTER.
  - 키워드: REDUCE, FILTER, 집계, 테이블 표현식
- **CH18-L09 · LET으로 표현식 속 이름 읽기** _(order 9)_
  - 다룰 내용: 표현식 안에서만 사는 보조 이름 — LET으로 중간값을 한 번만 이름 붙인다.
  - 키워드: LET, IN, constructor expression, 보조 이름
- **CH18-L10 · Legacy 코드의 Modern ABAP 리팩터링** _(order 10)_
  - 다룰 내용: classic 코드를 모던으로 — "짧게"가 아니라 "또렷하게", 결과는 그대로. += 까지.
  - 키워드: 리팩터링, +=, Modern, before-after, 동작보존
- **CH18-L11 · 실습 — 콘서트앱 모던 리팩터** _(order 11)_
  - 다룰 내용: 콘서트앱 — classic 코드를 모던 ABAP으로, 결과는 그대로 다듬는다.
  - 키워드: 실습, 콘서트앱, 모던리팩터, 인라인, VALUE, line_exists
