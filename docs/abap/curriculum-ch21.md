# CH21 · OO ABAP 기본 설계 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 10
> 🕒 생성: 2026-08-01T16:40:30.510Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH21 · OO ABAP 기본 설계 _(난이도: 고급)_

> 절차적 코드의 한계 — 객체로 구조화하고 싶다.

**키워드**: CLASS, METHOD, 인스턴스, 상속, 인터페이스

**레슨 (10)**
- **CH21-L01 · Global Class 생성과 객체** _(order 1)_
  - 다룰 내용: SE24로 전역 클래스를 만들고 객체를 생성한다 — 흩어진 로직을 한 덩어리로.
  - 키워드: Global Class, SE24, NEW, CREATE OBJECT, 객체, REF TO
- **CH21-L02 · Attribute / Method / Visibility** _(order 2)_
  - 다룰 내용: 클래스가 가진 데이터와 행동, 그리고 공개 범위 — 캡슐화는 방어선.
  - 키워드: Attribute, Method, PUBLIC, PROTECTED, PRIVATE, CLASS-DATA
- **CH21-L03 · Constructor와 객체 초기화** _(order 3)_
  - 다룰 내용: 객체가 태어날 때 자동 실행되는 생성자 — 바로 쓸 수 있는 상태로.
  - 키워드: CONSTRUCTOR, CLASS_CONSTRUCTOR, 초기화, IMPORTING
- **CH21-L04 · Static Method와 Instance Method** _(order 4)_
  - 다룰 내용: 클래스로 직접(=>) vs 객체로(->) — 객체 상태가 필요한가로 가른다.
  - 키워드: Static, Instance, =>, ->, me
- **CH21-L05 · Interface 기본 설계** _(order 5)_
  - 다룰 내용: 같은 부모가 아니라 같은 약속으로 묶는다 — Interface와 다형성.
  - 키워드: Interface, INTERFACES, 다형성, intf~method
- **CH21-L06 · Exception Class — TRY / CATCH / CX 계층** _(order 6)_
  - 다룰 내용: 오류를 메시지·숫자코드가 아니라 객체로 다룬다 — 예외 클래스와 TRY/CATCH.
  - 키워드: Exception, TRY/CATCH, RAISE EXCEPTION, RAISING, CX_ROOT
- **CH21-L07 · Inheritance / Redefinition** _(order 7)_
  - 다룰 내용: 공통은 부모에, 차이만 자식에 — 물려받아 확장·재정의한다.
  - 키워드: Inheritance, INHERITING FROM, REDEFINITION, super, ABSTRACT, FINAL
- **CH21-L08 · 다형성 — CAST와 CASE TYPE OF** _(order 8)_
  - 다룰 내용: 부모 타입으로 다루되, 정말 필요할 때만 실제 타입을 확인한다.
  - 키워드: CAST, CASE TYPE OF, 다형성, ?=, CX_SY_MOVE_CAST_ERROR
- **CH21-L09 · OO 이벤트 — EVENTS / RAISE EVENT / SET HANDLER** _(order 9)_
  - 다룰 내용: 객체가 사건을 알리고, 등록된 다른 객체가 반응한다 — 결합도를 낮추는 구조.
  - 키워드: EVENTS, RAISE EVENT, SET HANDLER, FOR EVENT, 이벤트
- **CH21-L10 · 실습 — ZCL_BOOKING_MANAGER 클래스** _(order 10)_
  - 다룰 내용: 콘서트앱 — 예약 로직을 객체로 종합 설계(상태·검증·예외·이벤트).
  - 키워드: 실습, 콘서트앱, 클래스, 예외, 이벤트, ZCX_FULLY_BOOKED
