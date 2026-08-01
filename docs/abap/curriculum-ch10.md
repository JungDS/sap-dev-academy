# CH10 · 모듈화 기초 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초 — Classic 완결** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 7
> 🕒 생성: 2026-08-01T17:42:33.191Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH10 · 모듈화 기초 _(난이도: 초급)_

> 같은 코드가 여기저기 반복된다 — 묶어서 재사용하고 싶다.

**키워드**: FORM, PERFORM, Function Module, 모듈화

**레슨 (7)**
- **CH10-L01 · FORM / PERFORM 기본 호출** _(order 1)_
  - 다룰 내용: 반복 코드를 묶는 첫 도구 — 서브루틴(FORM/PERFORM).
  - 키워드: Subroutine, FORM, PERFORM, 모듈화
- **CH10-L02 · USING / CHANGING 파라미터** _(order 2)_
  - 다룰 내용: 서브루틴에 값을 주고(USING) 결과를 돌려받는다(CHANGING).
  - 키워드: USING, CHANGING, Subroutine, 파라미터
- **CH10-L03 · CALL FUNCTION 기본 구조** _(order 3)_
  - 다룰 내용: 여러 프로그램이 공유하는 재사용 단위 — Function Module.
  - 키워드: Function Module, CALL FUNCTION, SE37, EXPORTING, IMPORTING
- **CH10-L04 · Local Class로 모듈화 — 정적 기준** _(order 4)_
  - 다룰 내용: 클래스라는 또 다른 묶음 — 객체 없이 부르는 정적 메서드부터.
  - 키워드: Class, Method, 로컬 클래스, Static
- **CH10-L05 · Global Class 호출 기초** _(order 5)_
  - 다룰 내용: 이미 만들어진 전역 클래스의 메서드를 정적으로 불러 쓴다.
  - 키워드: Global Class, SE24, Static Method, 블랙박스
- **CH10-L06 · Subroutine / Function / Class 선택 기준** _(order 6)_
  - 다룰 내용: 셋 중 무엇을 — 상황별 모듈화 선택 기준.
  - 키워드: Subroutine, Function Module, Class, 모듈화
- **CH10-L07 · 실습 — 잔여석 계산·예매 판정 모듈화** _(order 7)_
  - 다룰 내용: 콘서트앱 2단계 — 핵심 로직을 모듈로 묶는다.
  - 키워드: 실습, 콘서트앱, 모듈화, 잔여석, FORM
