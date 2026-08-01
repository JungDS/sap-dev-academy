# ABAP 커리큘럼 — TRACK-02 · Modern ABAP과 새 개발 모델

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **목적** — Modern ABAP과 새 개발 모델 트랙 전용 뷰. 전체는 curriculum.md.
> 📊 트랙 1 · 챕터 7 · 레슨 60
> 🕒 생성: 2026-08-01T18:57:10.054Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

## TRACK-02 · Modern ABAP과 새 개발 모델

문법이 새 세대로 바뀐다 — Modern Syntax·새 SQL·OO·CDS·RAP 입문.

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

### CH19 · New Open SQL / Modern ABAP SQL _(난이도: 중급)_

> 고전 Open SQL이 투박하다 — @·인라인으로 현대화. ★ 여기부터 modern SQL.

**키워드**: @, @DATA, 콤마 필드리스트, host 변수 escape

**레슨 (8)**
- **CH19-L01 · Classic Open SQL과 Modern ABAP SQL 비교** _(order 1)_
  - 다룰 내용: 같은 조회를 classic과 modern으로 — 무엇이, 왜 달라졌나.
  - 키워드: Open SQL, ABAP SQL, modern, 콤마, @, strict
- **CH19-L02 · @ Host Variable과 Host Expression** _(order 2)_
  - 다룰 내용: ABAP 값을 SQL에 안전하게 넣는다 — @변수와 @( 식 ).
  - 키워드: @, Host Variable, Host Expression, lossless
- **CH19-L03 · INTO TABLE @DATA(...) Inline Target** _(order 3)_
  - 다룰 내용: 결과 테이블을 SELECT 자리에서 바로 선언한다.
  - 키워드: @DATA, inline, INTO TABLE, AS alias, empty key
- **CH19-L04 · SQL Expression — CASE / CAST / COALESCE** _(order 4)_
  - 다룰 내용: SELECT 안에서 값을 계산·변환·치환한다 — DB가 직접.
  - 키워드: SQL Expression, CASE, CAST, COALESCE, AS alias
- **CH19-L05 · SQL String / Date Function** _(order 5)_
  - 다룰 내용: SELECT 안에서 문자열·날짜를 다루는 SQL 함수 — 단, ABAP 함수와 헷갈리지 않기.
  - 키워드: SQL Function, CONCAT, SUBSTRING, UPPER, DATS_ADD_DAYS
- **CH19-L06 · SELECT FROM @itab 기초** _(order 6)_
  - 다룰 내용: 내부 테이블을 SQL 소스처럼 조회한다 — DB 왕복 없이.
  - 키워드: SELECT FROM @itab, Internal Table, SQL, GROUP BY
- **CH19-L07 · ABAP SQL 정리 — 다음 단계로** _(order 7)_
  - 다룰 내용: 모던 ABAP SQL을 "언제 무엇을 쓸지"로 정리하고, 코드 구조의 OO로 넘어간다.
  - 키워드: ABAP SQL, 정리, 의사결정, CDS, OO
- **CH19-L08 · 실습 — 콘서트앱 모던 SQL** _(order 8)_
  - 다룰 내용: 콘서트앱 — 조회를 @·콤마·@DATA로 현대화하되, 업무 결과를 검증한다.
  - 키워드: 실습, 콘서트앱, 모던SQL, @DATA, COALESCE, LEFT OUTER JOIN

### CH20 · Advanced ABAP SQL _(난이도: 고급)_

> modern SQL 기본으론 벅찬 질문 — 데이터베이스에 '질문을 설계'하고 싶다.

**키워드**: CTE, WITH, Subquery, EXISTS, Window, UNION

**레슨 (7)**
- **CH20-L01 · 고급 SQL은 언제 필요한가** _(order 1)_
  - 다룰 내용: modern SQL 기본을 넘는 네 도구를 언제 꺼내는지 — 문법보다 판단.
  - 키워드: 고급 SQL, CTE, Subquery, Set operation, Window
- **CH20-L02 · WITH와 CTE — 중간 결과에 이름 붙이기** _(order 2)_
  - 다룰 내용: 복잡한 SELECT를 "중간 표를 만든다 → 다시 읽는다"로 나누기.
  - 키워드: CTE, WITH, 중간 결과, LEFT OUTER JOIN, COALESCE
- **CH20-L03 · Subquery와 EXISTS — 조건 안에서 다시 묻기** _(order 3)_
  - 다룰 내용: JOIN이 행을 붙인다면, 조건 안 SELECT는 존재·포함을 묻는다.
  - 키워드: Subquery, EXISTS, IN, correlated, NOT EXISTS
- **CH20-L04 · UNION · INTERSECT · EXCEPT — 결과 집합 다루기** _(order 4)_
  - 다룰 내용: JOIN이 컬럼을 옆으로 붙인다면, 집합 연산은 행을 위아래로 합·교·차.
  - 키워드: Set operation, UNION, UNION ALL, INTERSECT, EXCEPT
- **CH20-L05 · Window Expression — 행을 유지하며 그룹 계산** _(order 5)_
  - 다룰 내용: GROUP BY는 행을 접지만, window는 상세 행을 두고 합계·순번을 붙인다.
  - 키워드: Window, OVER, PARTITION BY, ROW_NUMBER, RANK
- **CH20-L06 · 선택 기준과 멈춤 기준** _(order 6)_
  - 다룰 내용: SQL로 되느냐보다 읽기 쉽고 검증 가능하냐를 먼저 묻는다.
  - 키워드: 선택 기준, JOIN, EXISTS, CTE, Window
- **CH20-L07 · 실습 — 콘서트 Advanced SQL** _(order 7)_
  - 다룰 내용: CTE·EXISTS·EXCEPT·Window를 한 콘서트 조회에 모아 결과를 검증한다.
  - 키워드: 실습, 콘서트, CTE, EXISTS, EXCEPT, Window

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

### CH22 · SALV/Grid ALV 표시 제어 심화 _(난이도: 고급)_

> ALV 표시를 색·셀 단위까지 세밀하게 제어하고 싶다.

**키워드**: Cell Color, Stable Refresh, Event, Layout 심화

**레슨 (8)**
- **CH22-L01 · SALV Sort / Filter / Function 제어** _(order 1)_
  - 다룰 내용: SALV 객체로 정렬·필터·툴바 기능을 코드로 — display 전에 지정한다.
  - 키워드: SALV, Sort, Filter, Function, FACTORY
- **CH22-L02 · SALV Layout / Variant 심화** _(order 2)_
  - 다룰 내용: 표시 설정·컬럼 텍스트·레이아웃 저장 — 개발자 기본값 + 사용자 보기.
  - 키워드: SALV, Display Settings, Columns, Layout, Variant
- **CH22-L03 · Grid ALV Column 제어 심화** _(order 3)_
  - 다룰 내용: Field Catalog로 컬럼을 숨기고·합계·정렬·키 강조 — 화면 표시 지시서.
  - 키워드: Field Catalog, Column, no_out, do_sum, just, key
- **CH22-L04 · Deep Structure 기반 Cell Color** _(order 4)_
  - 다룰 내용: 행이 아니라 셀 하나만 — 행 구조에 색 정보 테이블을 품는다.
  - 키워드: Cell Color, LVC_T_SCOL, Deep Structure, ctab_fname
- **CH22-L05 · Deep Structure 기반 Cell Style** _(order 5)_
  - 다룰 내용: 셀 단위 모양·동작 — 비활성·편집·버튼. 색과 같은 deep, 다른 연결.
  - 키워드: Cell Style, LVC_T_STYL, Deep Structure, stylefname
- **CH22-L06 · Row / Column / Cell Color 선택 기준** _(order 6)_
  - 다룰 내용: 행·컬럼·셀 — 색을 줄 단위를 상황에 맞게 고른다.
  - 키워드: Row Color, Column Color, Cell Color, info_fname, emphasize, ctab_fname
- **CH22-L07 · Stable Refresh와 표시 상태 보존** _(order 7)_
  - 다룰 내용: 갱신해도 스크롤·선택·정렬을 지킨다 — 사용자 흐름 보존.
  - 키워드: Stable Refresh, soft refresh, is_stable, refresh_table_display
- **CH22-L08 · 실습 — 매진 회차 색 강조** _(order 8)_
  - 다룰 내용: 콘서트앱 — 잔여석 계산을 셀 색으로(매진 빨강·임박 노랑).
  - 키워드: 실습, 콘서트앱, Cell Color, 매진, ctab_fname

### CH23 · CDS View Entity 기초 _(난이도: 고급)_

> DB 계층에서 모델링하고 재사용하고 싶다.

**키워드**: CDS, View Entity, Association, Annotation

**레슨 (7)**
- **CH23-L01 · CDS View Entity 기본 구조** _(order 1)_
  - 다룰 내용: DB 계층의 현대적 읽기 모델 — define view entity.
  - 키워드: CDS, View Entity, define view entity, DDL, Data Preview, Calculated Element, ZI_Flight
- **CH23-L02 · Interface View와 Consumption View 계층** _(order 2)_
  - 다룰 내용: 재사용 기반 뷰 위에 소비용 뷰를 쌓는다 — nesting(ZI_/ZC_).
  - 키워드: Interface View, Consumption View, ZI_, ZC_, as select from, Nesting
- **CH23-L03 · Association 기초** _(order 3)_
  - 다룰 내용: 뷰끼리 관계를 선언하고 경로로 따라간다 — Association.
  - 키워드: Association, _Perf, $projection, cardinality, CDS
- **CH23-L04 · Annotation과 의미 부여** _(order 4)_
  - 다룰 내용: 뷰·필드에 업무 의미를 단다 — @Annotation.
  - 키워드: Annotation, @EndUserText, @UI.lineItem, @Semantics
- **CH23-L05 · Metadata Extension 기초** _(order 5)_
  - 다룰 내용: UI 주석을 본문에서 분리한다 — annotate entity (DDLX).
  - 키워드: Metadata Extension, annotate entity, @Metadata.allowExtensions, @Metadata.layer
- **CH23-L06 · DCL / Authorization 개요** _(order 6)_
  - 다룰 내용: 누가 어떤 행을 볼 수 있나 — CDS 접근 제어(DCL).
  - 키워드: DCL, Access Control, define role, aspect pfcg_auth
- **CH23-L07 · 실습 — 콘서트 CDS 뷰 (ZI_/ZC_)** _(order 7)_
  - 다룰 내용: 콘서트앱 — 데이터 모델을 재사용 가능한 CDS 계층으로.
  - 키워드: 실습, 콘서트앱, CDS, ZI_Concert, ZC_Concert, Association

### CH24 · RAP / ABAP Cloud 입문 _(난이도: 고급)_

> 현대 SAP 표준 — 트랜잭션 앱을 RAP로 짓고 싶다.

**키워드**: RAP, Behavior Definition, ABAP Cloud, Fiori

**레슨 (9)**
- **CH24-L01 · RAP 아키텍처 개요** _(order 1)_
  - 다룰 내용: 현대 SAP 트랜잭션 앱의 표준 — RAP의 큰 그림.
  - 키워드: RAP, ABAP Cloud, managed, unmanaged, OData
- **CH24-L02 · Interface View ZI_* 설계 (Root)** _(order 2)_
  - 다룰 내용: RAP의 토대 — 트랜잭션 단위를 정하는 root Interface View.
  - 키워드: Interface View, root entity, define root view entity, RAP
- **CH24-L03 · Projection View ZC_* 설계** _(order 3)_
  - 다룰 내용: 서비스·화면에 노출할 소비용 뷰 — transactional projection.
  - 키워드: Projection View, ZC_, provider contract, transactional_query
- **CH24-L04 · Behavior Definition 기초** _(order 4)_
  - 다룰 내용: 무엇을 할 수 있나 — create·update·delete를 선언한다.
  - 키워드: Behavior Definition, BDEF, managed, create/update/delete, lock master
- **CH24-L05 · Behavior Implementation 기초** _(order 5)_
  - 다룰 내용: 동작의 실제 코드 — Behavior Pool과 집합 지향 handler.
  - 키워드: Behavior Implementation, BIMP, behavior pool, FOR VALIDATE ON SAVE, keys
- **CH24-L06 · Service Definition / Service Binding** _(order 6)_
  - 다룰 내용: 앱을 OData 서비스로 노출한다 — Definition + Binding.
  - 키워드: Service Definition, Service Binding, OData, expose, Fiori
- **CH24-L07 · Validation / Determination / Action 개요** _(order 7)_
  - 다룰 내용: 검증·자동결정·액션 — RAP의 비즈니스 로직 셋.
  - 키워드: Validation, Determination, Action, RAP
- **CH24-L08 · ABAP Cloud와 Released API 원칙** _(order 8)_
  - 다룰 내용: 클라우드 준비된 개발 — Released API·restricted scope·Clean Core.
  - 키워드: ABAP Cloud, Released API, Clean Core, ABAP for Cloud Development
- **CH24-L09 · 실습 — 예매 RAP 동작 구현** _(order 9)_
  - 다룰 내용: 콘서트 예매 RAP — 정원 validation·취소 action·상태 determination.
  - 키워드: 실습, 콘서트앱, RAP, Validation, Determination, Action

---
