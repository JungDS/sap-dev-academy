# CH28 · Dynamic ABAP: Field Symbol 심화와 Generic — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-02 · ABAP 실무** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 8
> 🕒 생성: 2026-08-01T15:40:09.599Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH28 · Dynamic ABAP: Field Symbol 심화와 Generic _(난이도: 고급)_

> 타입을 미리 모르는 데이터를 안전하게 다루고 싶다 — 동적 ABAP.

**키워드**: Field Symbol, TYPE any, ASSIGN, RTTS, CREATE DATA

**레슨 (8)**
- **CH28-L01 · typed vs generic Field Symbol** _(order 1)_
  - 다룰 내용: 이름표의 두 얼굴 — 모양을 아는 이름표와 모르는 이름표.
  - 키워드: Field Symbol, TYPE any, typed, generic
- **CH28-L02 · TYPE any · ANY TABLE 파라미터** _(order 2)_
  - 다룰 내용: 어떤 데이터든 받는 메서드 — 대신 확인 책임이 생긴다.
  - 키워드: TYPE any, ANY TABLE, generic, 파라미터
- **CH28-L03 · ASSIGN · UNASSIGN · IS ASSIGNED** _(order 3)_
  - 다룰 내용: 지금 무엇을 가리키나 — 할당 상태와 ELSE UNASSIGN 함정.
  - 키워드: ASSIGN, UNASSIGN, IS ASSIGNED, ELSE UNASSIGN, sy-subrc
- **CH28-L04 · ASSIGN COMPONENT — 필드를 실행 중에 고르기** _(order 4)_
  - 다룰 내용: 구조의 필드 이름이 실행 시점에 정해질 때의 공식 도구.
  - 키워드: ASSIGN COMPONENT, 동적 필드, whitelist, sy-subrc
- **CH28-L05 · ASSIGN (name) — 이름 문자열로 찾기** _(order 5)_
  - 다룰 내용: 문자열이 변수 이름으로 해석된다 — 강력한 만큼 위험한 문법.
  - 키워드: ASSIGN (name), 동적 이름, search order, whitelist
- **CH28-L06 · REF TO data와 CREATE DATA** _(order 6)_
  - 다룰 내용: 실행 중에 데이터를 만든다 — 이름 없는 데이터와 손잡이.
  - 키워드: CREATE DATA, REF TO data, dref->*, TYPE HANDLE
- **CH28-L07 · RTTS — 실행 중 타입 정보 읽기** _(order 7)_
  - 다룰 내용: 들어온 값의 정체를 묻는다 — 타입 설명서와 describe.
  - 키워드: RTTS, RTTI, cl_abap_typedescr, describe_by_data, components
- **CH28-L08 · 실습 — 동적 구조 검사기** _(order 8)_
  - 다룰 내용: 챕터 전부를 조립한다 — describe → 검증 → ASSIGN → 결과.
  - 키워드: 실습, 동적, 구조 검사기, RTTS, ASSIGN COMPONENT
