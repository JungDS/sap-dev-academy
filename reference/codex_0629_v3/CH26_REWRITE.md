# CH26_REWRITE · OO ABAP 고급 설계와 패턴

> 주 소스: `content/abap/CH26/_chapter.md`, `content/abap/CH26/CH26-L01.md` ~ `CH26-L05.md`  
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, `reference/codex_0629_v3/CH20_REWRITE.md`, `reference/codex_0629_v3/CH25_REWRITE.md`  
> 목표: CH26을 Track-2의 OO 설계 심화 장으로 재집필하여, 입문자가 디자인 패턴 이름을 외우는 것이 아니라 생성 책임, 단일 인스턴스, 교체 가능한 알고리즘, 역할 분리, 테스트 가능성을 실제 ABAP 코드 구조로 이해하게 한다.

## CH26 전체 설계

CH20에서 OO ABAP의 기본 문법을 배웠다. 클래스, 객체, 인터페이스, 상속, 다형성, 예외, 이벤트를 배웠다면 이제 더 중요한 질문이 남는다. "이 문법을 어디에 어떻게 배치해야 유지보수하기 쉬운가?"이다.

프로그램 규모가 작을 때는 `NEW zcl_booking_manager( )`를 여기저기 쓰고, `IF booking_type = 'VIP'` 같은 분기를 여러 곳에 넣어도 당장 돌아간다. 하지만 기능이 늘어나면 생성 규칙이 흩어지고, 요금 정책 하나 바꾸려면 여러 파일을 고치고, 화면 코드와 DB 코드가 섞여 테스트가 어려워진다.

CH26은 그 문제를 다섯 가지 설계 도구로 다룬다.

| 설계 문제 | CH26의 도구 | 핵심 질문 |
|---|---|---|
| 객체 생성 규칙이 흩어진다 | Factory | "누가 어떤 구현체를 만들 책임을 가질 것인가?" |
| 하나여야 할 상태가 여러 개 생긴다 | Singleton | "정말 하나만 있어야 하는가, 아니면 전역 상태 남용인가?" |
| 알고리즘 분기가 길어진다 | Strategy | "변하는 정책을 인터페이스 뒤로 숨길 수 있는가?" |
| 화면·로직·데이터가 한 덩어리다 | MVC | "각 코드가 맡은 역할이 한 가지인가?" |
| 자동 테스트가 어렵다 | DI, Mock, ABAP Unit | "DB와 화면 없이 핵심 로직만 검증할 수 있는가?" |

CH26의 기준은 단순하다. 패턴을 쓰면 코드가 멋져 보이는가가 아니라, 변경할 때 덜 깨지고 테스트할 때 덜 고통스러운가다.

## CH26 R15 경계

CH26은 CH20의 OO 기본을 전제로 한다. `NEW`, 인터페이스, 다형성, 예외, 이벤트는 이미 학습했다. 다만 CH18에서 아직 정식 도입하지 않은 `COND`, `SWITCH`, `REDUCE` 같은 constructor expression은 쓰지 않는다. `.project-docs/11_KEYWORD_AUDIT.md`의 CH26 교정 기준에 따라 Factory 예제는 `COND #()`가 아니라 이미 배운 `CASE`로 작성한다.

| 구분 | CH26에서 정식 사용 | CH26에서 보류 |
|---|---|---|
| Factory | `CLASS-METHODS create`, `CASE`, interface 반환, 구체 class 은닉 | DI container, reflection 기반 동적 factory |
| Singleton | `CREATE PRIVATE`, `CLASS-DATA`, `get_instance` | shared memory singleton, cross-session singleton 보장 |
| Strategy | interface, 구현 class 교체, constructor injection | 복잡한 policy engine, BRF+ rule engine |
| MVC | Model/View/Controller 역할 분리, report 구조화 | UI5 MVC, Fiori Elements architecture |
| Testable design | dependency injection, local mock, ABAP Unit | ABAP Test Double Framework 상세, test seam/injection 상세 |
| Syntax gate | `CASE`, `IF`, `NEW`, `VALUE #()` 단순 사용 | `COND`, `SWITCH`, `REDUCE` |

## 공식 문서 수동 확인 근거

디자인 패턴 자체는 ABAP keyword statement가 아니라 설계 관용구다. 따라서 공식 확인은 패턴을 구현하는 ABAP OO 문법과 ABAP Unit 문법 중심으로 수행했다. Classic ABAP 문서는 `C:\ABAP_DOCU_HTML`에서 직접 확인했고, Markdown 사본은 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md`에서 대조했다.

| 주제 | 확인 문서 | 반영 포인트 |
|---|---|---|
| class option | `abapclass_options.htm`, `ABAPCLASS_OPTIONS.md` | `CREATE PRIVATE`, `FINAL`, `FOR TESTING`, instantiability |
| static method | `abapclass-methods.htm`, `ABAPCLASS-METHODS.md` | `CLASS-METHODS`, functional static method, `RETURNING` |
| interface | `abapinterface.htm`, `ABAPINTERFACE.md` | interface declaration has no implementation part |
| interface implementation | `ABAPINTERFACES_CLASS.md` | `INTERFACES`, `intf~method`, class must implement methods |
| test class | `abapclass_for_testing.htm`, `ABAPCLASS_FOR_TESTING.md` | `CLASS ... FOR TESTING`, `RISK LEVEL`, `DURATION`, test doubles |
| test method | `abapmethods_testing.htm`, `ABAPMETHODS_TESTING.md` | `METHODS ... FOR TESTING`, `CL_ABAP_UNIT_ASSERT` |
| ABAP Unit | `abenabap_unit.htm`, `ABENABAP_UNIT.md` | local test classes, test methods, assert methods, test doubles |

## CH26-L01 · Factory Pattern

### 왜 필요한가

객체를 만드는 코드는 생각보다 자주 바뀐다. 처음에는 `ZCL_BOOKING_MANAGER` 하나만 있으면 된다. 시간이 지나면 VIP 예매, 일반 예매, 프로모션 예매가 생기고, 테스트에서는 실제 DB를 쓰는 manager 대신 mock manager를 만들고 싶어진다.

그런데 호출부 곳곳에 다음 코드가 흩어져 있으면 문제가 생긴다.

```abap
DATA(lo_manager) = NEW zcl_booking_manager( ).
```

생성 대상이 바뀔 때마다 호출부를 찾아 고쳐야 한다. 호출부는 "예매 처리를 한다"만 알면 되지, VIP이면 어떤 class를 만들고 일반이면 어떤 class를 만들지까지 알 필요가 없다. Factory Pattern은 이 생성 책임을 한곳으로 모은다.

### 무엇인가

Factory는 객체 생성 규칙을 캡슐화하는 class 또는 method다. 호출부는 factory에 "어떤 종류가 필요한지"만 전달하고, factory는 적절한 구현체를 만들어 interface type으로 반환한다.

```abap
INTERFACE zif_booking.
  METHODS save.
ENDINTERFACE.

CLASS zcl_booking_factory DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS create
      IMPORTING iv_type       TYPE c
      RETURNING VALUE(ro_obj) TYPE REF TO zif_booking.
ENDCLASS.

CLASS zcl_booking_factory IMPLEMENTATION.
  METHOD create.
    CASE iv_type.
      WHEN 'V'.
        ro_obj = NEW zcl_vip_booking( ).
      WHEN 'P'.
        ro_obj = NEW zcl_promo_booking( ).
      WHEN OTHERS.
        ro_obj = NEW zcl_booking_manager( ).
    ENDCASE.
  ENDMETHOD.
ENDCLASS.
```

여기서 중요한 것은 반환 type이 `REF TO zif_booking`이라는 점이다. 호출부는 `zcl_vip_booking`인지 `zcl_booking_manager`인지 몰라도 `save( )`를 호출할 수 있다.

```abap
DATA(lo_booking) = zcl_booking_factory=>create( iv_type = p_type ).
lo_booking->save( ).
```

### 어떻게 확인하는가

1. 호출부에 직접 `NEW zcl_vip_booking( )`, `NEW zcl_booking_manager( )`가 흩어져 있는지 검색한다.
2. 생성 분기 조건이 여러 곳에 반복되는지 확인한다.
3. 공통 interface가 있는지 확인한다.
4. factory method가 interface reference를 반환하는지 확인한다.
5. 새 booking type을 추가할 때 호출부를 바꾸지 않고 factory와 새 구현 class만 바꾸면 되는지 확인한다.

### 실수와 주의

- Factory를 만들고도 호출부에서 직접 `NEW`를 계속 쓰면 생성 규칙이 다시 흩어진다.
- Factory가 모든 업무 판단을 다 떠안으면 거대 class가 된다. 생성 규칙만 맡기고 업무 로직은 생성된 객체로 넘긴다.
- type code가 너무 많아지면 하위 factory, 설정 table, customizing 기반 mapping을 검토한다.
- CH26에서는 `COND #()`를 쓰지 않는다. 감사 기준상 미학습 constructor expression이므로 `CASE`가 맞다.

### 체험형 학습 설계

**Factory 생성 라우터**

| 요소 | 설계 |
|---|---|
| 데이터 | type `N/V/P`, concrete class 목록, `zif_booking` method 목록 |
| 버튼 | `일반 생성`, `VIP 생성`, `프로모션 생성`, `새 타입 추가`, `직접 NEW 탐지` |
| 상태 | selected type, created class, interface reference, caller changed count |
| 피드백 | 새 타입 추가 시 호출부 변경 수가 0이면 "생성 책임이 factory에 모임", 직접 `NEW`가 남아 있으면 "우회 생성으로 규칙 분산"을 표시한다. |

### 정리

Factory는 객체 생성을 한곳에 모은다. 생성 규칙이 바뀔 가능성이 있고 호출부가 구체 class를 몰라도 되는 구조라면 Factory가 적합하다. 핵심은 interface 반환과 호출부 변경 최소화다.

## CH26-L02 · Singleton Pattern

### 왜 필요한가

설정값, feature toggle, 작은 cache처럼 프로그램 실행 중 하나의 상태로 관리해야 하는 객체가 있다. 이런 객체를 매번 `NEW`로 만들면 A 코드가 보는 설정과 B 코드가 보는 설정이 달라질 수 있다. Singleton은 인스턴스를 하나로 제한해 상태의 중심을 만든다.

하지만 Singleton은 위험한 도구이기도 하다. 전역 상태에 가까워져 테스트가 어려워지고, 숨은 의존성이 생긴다. 그래서 CH26에서는 "만드는 법"만큼 "정말 필요한지 판단하는 법"을 같이 다룬다.

### 무엇인가

ABAP에서 Singleton의 기본 구조는 `CREATE PRIVATE`와 `CLASS-DATA`로 만든다.

```abap
CLASS zcl_booking_config DEFINITION PUBLIC FINAL CREATE PRIVATE.
  PUBLIC SECTION.
    CLASS-METHODS get_instance
      RETURNING VALUE(ro_config) TYPE REF TO zcl_booking_config.

    METHODS get_currency
      RETURNING VALUE(rv_currency) TYPE waers.

  PRIVATE SECTION.
    CLASS-DATA go_instance TYPE REF TO zcl_booking_config.
ENDCLASS.

CLASS zcl_booking_config IMPLEMENTATION.
  METHOD get_instance.
    IF go_instance IS INITIAL.
      go_instance = NEW #( ).
    ENDIF.

    ro_config = go_instance.
  ENDMETHOD.

  METHOD get_currency.
    rv_currency = 'KRW'.
  ENDMETHOD.
ENDCLASS.
```

`CREATE PRIVATE`는 class 외부에서 직접 생성하지 못하게 한다. 공식 문서 기준으로 `CREATE PRIVATE` class는 class 자신의 method 또는 friend에서만 instantiate할 수 있다. 따라서 외부 호출부는 `get_instance( )`만 쓸 수 있다.

### 어떻게 확인하는가

1. class definition에 `CREATE PRIVATE`가 있는지 확인한다.
2. instance를 담는 `CLASS-DATA go_instance`가 있는지 확인한다.
3. `get_instance`가 최초 1회만 `NEW`를 실행하는지 확인한다.
4. 외부 코드에서 `NEW zcl_booking_config( )`가 syntax상 불가능한지 확인한다.
5. 테스트에서 Singleton 상태가 이전 테스트의 영향을 받지 않는지 확인한다.

### 실수와 주의

- `CREATE PRIVATE`를 빼면 외부에서 직접 `NEW`할 수 있어 Singleton 보장이 깨진다.
- Singleton 안에 업무 상태를 많이 넣으면 숨은 전역 변수처럼 변한다.
- 테스트는 순서에 의존하면 안 된다. Singleton이 내부 상태를 갖는다면 reset 방법이나 설계 대안을 고민한다.
- SAP internal session, shared memory, 여러 application server instance까지 하나로 묶는 문제는 단순 Singleton 예제의 범위를 넘는다.

### 체험형 학습 설계

**Singleton 인스턴스 추적기**

| 요소 | 설계 |
|---|---|
| 데이터 | call count, object id, `go_instance` state, external `NEW` attempt |
| 버튼 | `get_instance 1회`, `get_instance 3회`, `외부 NEW 시도`, `CREATE PRIVATE 제거`, `상태 reset` |
| 상태 | instance created, same reference, external creation allowed, test pollution flag |
| 피드백 | `CREATE PRIVATE` 제거 시 서로 다른 object id가 생기는 모습을 보여 주고, 테스트 사이 상태 잔존 위험을 경고한다. |

### 정리

Singleton은 "하나만 있어야 하는 객체"를 표현할 수 있지만, 남용하면 숨은 전역 상태가 된다. 설정처럼 정말 하나의 중심이 필요한 경우에만 사용하고, 테스트 영향까지 같이 설계해야 한다.

## CH26-L03 · Strategy Pattern

### 왜 필요한가

요금 계산은 바뀌기 쉽다. 일반 예매는 좌석 수에 기본 단가를 곱하고, VIP는 할인 없이 추가 혜택 금액을 붙이고, 조기 예매는 할인율을 적용할 수 있다. 이런 정책을 하나의 method 안에 `IF`나 `CASE`로 계속 추가하면 method가 길어지고 변경 위험이 커진다.

Strategy Pattern은 바뀌는 알고리즘을 interface 뒤로 분리한다. 호출부는 "가격을 계산한다"만 알고, 어떤 정책으로 계산하는지는 주입된 strategy object가 맡는다.

### 무엇인가

```abap
INTERFACE zif_price_strategy.
  METHODS calc
    IMPORTING iv_seats        TYPE i
    RETURNING VALUE(rv_price) TYPE p LENGTH 10 DECIMALS 2.
ENDINTERFACE.

CLASS zcl_regular_price DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES zif_price_strategy.
ENDCLASS.

CLASS zcl_regular_price IMPLEMENTATION.
  METHOD zif_price_strategy~calc.
    rv_price = iv_seats * 50000.
  ENDMETHOD.
ENDCLASS.

CLASS zcl_checkout DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS constructor
      IMPORTING io_strategy TYPE REF TO zif_price_strategy.
    METHODS total
      IMPORTING iv_seats TYPE i
      RETURNING VALUE(rv_price) TYPE p LENGTH 10 DECIMALS 2.
  PRIVATE SECTION.
    DATA mo_strategy TYPE REF TO zif_price_strategy.
ENDCLASS.

CLASS zcl_checkout IMPLEMENTATION.
  METHOD constructor.
    mo_strategy = io_strategy.
  ENDMETHOD.

  METHOD total.
    rv_price = mo_strategy->calc( iv_seats = iv_seats ).
  ENDMETHOD.
ENDCLASS.
```

`zcl_checkout`은 요금 정책의 구체 class를 모른다. 새 정책이 필요하면 `zif_price_strategy`를 구현하는 새 class를 추가하고, factory나 설정에서 그 strategy를 주입한다.

### 어떻게 확인하는가

1. 하나의 method 안에 요금 정책 `IF/CASE`가 길게 있는지 확인한다.
2. 정책별로 독립 class를 만들 수 있는지 본다.
3. 공통 interface method signature가 안정적인지 확인한다.
4. 호출부가 concrete class가 아니라 interface reference를 갖는지 확인한다.
5. 새 전략 추가 시 기존 checkout code를 수정하지 않는지 확인한다.

### 실수와 주의

- strategy class 내부에서 다시 type별 `IF`를 길게 쓰면 pattern 의미가 사라진다.
- 전략이 1개뿐이고 변경 가능성이 낮으면 오히려 과설계다.
- interface method signature를 너무 구체 정책에 맞추면 새 strategy가 억지로 끼워 맞춰진다.
- strategy 선택 책임은 checkout이 아니라 factory, controller, customizing 쪽에 둔다.

### 체험형 학습 설계

**Strategy 교체 실험실**

| 요소 | 설계 |
|---|---|
| 데이터 | 좌석 수, Regular/VIP/EarlyBird strategy, 단가, 할인율 |
| 버튼 | `Regular 주입`, `VIP 주입`, `EarlyBird 주입`, `새 정책 추가`, `checkout 코드 보기` |
| 상태 | selected strategy, calculated price, changed classes, checkout unchanged |
| 피드백 | strategy 변경 시 checkout code diff가 0이면 "알고리즘 교체 성공", checkout에 `CASE`가 생기면 "정책 분리 실패"를 표시한다. |

### 정리

Strategy는 바뀌는 알고리즘을 객체로 분리한다. 새 정책이 기존 호출부를 흔들지 않게 만들고 싶을 때, interface와 dependency injection을 함께 사용한다.

## CH26-L04 · MVC 기반 Report 구조화

### 왜 필요한가

ABAP report는 쉽게 커진다. 처음에는 `SELECT`, 계산, `WRITE` 또는 ALV 출력이 한 파일에 있어도 괜찮다. 하지만 이벤트가 붙고, 검색 조건이 늘고, 저장 버튼이 생기면 한 프로그램 안에서 데이터 조회, 업무 판단, 화면 표시가 서로 엉킨다.

MVC는 이 엉킴을 역할별로 분리한다. Model은 데이터와 업무 로직, View는 표시, Controller는 흐름 조율을 맡는다.

### 무엇인가

| 계층 | 책임 | ABAP 예 |
|---|---|---|
| Model | 데이터 조회, 계산, 검증 같은 업무 로직 | `ZCL_BOOKING_MODEL` |
| View | ALV, Dynpro, 메시지 표시 | `ZCL_BOOKING_VIEW` |
| Controller | 사용자 입력과 event를 받아 Model/View를 연결 | `ZCL_BOOKING_CONTROLLER` |

```abap
CLASS zcl_booking_controller DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS constructor
      IMPORTING
        io_model TYPE REF TO zif_booking_model
        io_view  TYPE REF TO zif_booking_view.
    METHODS run.
  PRIVATE SECTION.
    DATA mo_model TYPE REF TO zif_booking_model.
    DATA mo_view  TYPE REF TO zif_booking_view.
ENDCLASS.

CLASS zcl_booking_controller IMPLEMENTATION.
  METHOD constructor.
    mo_model = io_model.
    mo_view  = io_view.
  ENDMETHOD.

  METHOD run.
    DATA(lt_booking) = mo_model->get_bookings( ).
    mo_view->display( lt_booking ).
  ENDMETHOD.
ENDCLASS.
```

Controller는 직접 SQL을 쓰지 않는다. View는 잔여석 계산을 하지 않는다. Model은 ALV grid object를 알지 않는다. 이 경계가 지켜질수록 변경 영향이 줄어든다.

### 어떻게 확인하는가

1. Model class 안에 `cl_gui_alv_grid`, `cl_salv_table`, dynpro OK_CODE 같은 화면 관심사가 있는지 검색한다.
2. View class 안에 `SELECT`, `UPDATE`, 가격 계산 같은 업무 로직이 있는지 확인한다.
3. Controller가 흐름 조율을 넘어서 업무 계산까지 떠안고 있는지 확인한다.
4. Model만 단독으로 ABAP Unit 테스트할 수 있는지 확인한다.
5. ALV 대신 다른 View를 붙여도 Model이 바뀌지 않는지 확인한다.

### 실수와 주의

- 작은 report에 무조건 3계층 class를 만들면 과분리다. 변화 가능성과 규모를 보고 적용한다.
- Controller가 모든 것을 다 아는 god class가 되지 않게 한다.
- View에서 DB를 직접 읽으면 화면 교체가 어려워진다.
- Model에서 MESSAGE를 직접 띄우면 테스트와 재사용이 어려워진다. 오류는 result나 exception으로 전달하는 편이 좋다.

### 체험형 학습 설계

**MVC 영향 범위 시각화**

| 요소 | 설계 |
|---|---|
| 데이터 | Model/View/Controller 카드, 변경 시나리오, 의존 화살표 |
| 버튼 | `ALV를 리스트로 교체`, `요금 계산 변경`, `버튼 이벤트 추가`, `Model에 화면 코드 넣기` |
| 상태 | affected layers, changed files, testable model, dependency violation |
| 피드백 | Model에 화면 코드가 들어가면 "View 관심사가 Model로 새어 들어감"을 표시하고, View 교체 시 Model 변경이 없으면 역할 분리 성공을 표시한다. |

### 정리

MVC는 ABAP report를 역할별로 나누는 실용적인 사고방식이다. 모든 프로그램에 기계적으로 적용할 필요는 없지만, 화면·업무 로직·데이터 접근이 섞이기 시작하면 분리의 이점이 커진다.

## CH26-L05 · Testable Class 설계와 ABAP Unit

### 왜 필요한가

리팩터링이 두려운 이유는 바꾼 뒤 무엇이 깨졌는지 모르기 때문이다. 특히 DB와 화면에 붙은 코드는 자동 테스트가 어렵다. 매번 실제 테이블 상태와 화면 조작에 의존하면 테스트가 느리고 불안정해진다.

테스트 가능한 설계는 의존성을 interface로 분리하고, 테스트에서는 실제 DB 구현 대신 mock을 주입한다. 그러면 핵심 로직을 빠르게 반복 검증할 수 있다.

### 무엇인가

먼저 production code가 repository interface에 의존하도록 만든다.

```abap
INTERFACE zif_booking_repo.
  METHODS get_booked_seats
    IMPORTING iv_concert_id TYPE zconcert_id
    RETURNING VALUE(rv_seats) TYPE i.
ENDINTERFACE.

CLASS zcl_booking_manager DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS constructor
      IMPORTING io_repo TYPE REF TO zif_booking_repo.
    METHODS remaining
      IMPORTING iv_concert_id TYPE zconcert_id
      RETURNING VALUE(rv_remaining) TYPE i.
  PRIVATE SECTION.
    DATA mo_repo TYPE REF TO zif_booking_repo.
ENDCLASS.

CLASS zcl_booking_manager IMPLEMENTATION.
  METHOD constructor.
    mo_repo = io_repo.
  ENDMETHOD.

  METHOD remaining.
    DATA(lv_booked) = mo_repo->get_booked_seats( iv_concert_id ).
    rv_remaining = 100 - lv_booked.
  ENDMETHOD.
ENDCLASS.
```

테스트에서는 DB 대신 local mock을 구현한다.

```abap
CLASS ltd_repo_mock DEFINITION FOR TESTING.
  PUBLIC SECTION.
    INTERFACES zif_booking_repo.
ENDCLASS.

CLASS ltd_repo_mock IMPLEMENTATION.
  METHOD zif_booking_repo~get_booked_seats.
    rv_seats = 50.
  ENDMETHOD.
ENDCLASS.
```

ABAP Unit 테스트 class는 `FOR TESTING`으로 정의하고, 테스트 method도 `FOR TESTING`으로 선언한다.

```abap
CLASS ltcl_booking_manager DEFINITION
  FOR TESTING
  DURATION SHORT
  RISK LEVEL HARMLESS.
  PRIVATE SECTION.
    METHODS remaining_calc FOR TESTING.
ENDCLASS.

CLASS ltcl_booking_manager IMPLEMENTATION.
  METHOD remaining_calc.
    DATA(lo_cut) = NEW zcl_booking_manager(
      io_repo = NEW ltd_repo_mock( ) ).

    cl_abap_unit_assert=>assert_equals(
      act = lo_cut->remaining( iv_concert_id = 'C001' )
      exp = 50 ).
  ENDMETHOD.
ENDCLASS.
```

`CUT`는 class under test의 약어로 자주 쓰인다. 여기서는 `zcl_booking_manager`가 테스트 대상이다.

### 어떻게 확인하는가

1. 테스트하려는 class가 DB table을 직접 `SELECT`하는지 확인한다.
2. 직접 의존을 interface로 감쌀 수 있는지 본다.
3. constructor parameter로 interface reference를 주입할 수 있는지 확인한다.
4. local test double 또는 mock class가 interface를 구현하는지 확인한다.
5. ABAP Unit에서 성공과 실패를 모두 확인한다.

### 실수와 주의

- mock이 production code에 들어가면 안 된다. 테스트 helper는 test class 영역에 둔다.
- 테스트가 실제 DB 상태에 의존하면 실행 순서와 환경에 따라 깨진다.
- `RISK LEVEL HARMLESS`라고 적고 persistent data를 바꾸면 의미가 맞지 않는다.
- 너무 내부 구현을 검증하면 리팩터링 때 테스트가 불필요하게 깨진다. 외부에서 관찰 가능한 결과를 검증한다.
- Singleton 상태가 테스트 간 공유되면 테스트 순서 의존성이 생길 수 있다.

### 체험형 학습 설계

**ABAP Unit 러너와 Mock 주입 실험**

| 요소 | 설계 |
|---|---|
| 데이터 | real repo, mock repo, booking manager, expected remaining, bug switch |
| 버튼 | `real repo 사용`, `mock repo 사용`, `테스트 실행`, `버그 주입`, `assert 수정`, `DB 의존 제거` |
| 상태 | injected dependency, test result, expected/actual value, risk level, duration |
| 피드백 | mock 사용 시 DB 없이 즉시 초록 결과를 보여 주고, bug switch가 켜지면 `assert_equals`의 actual/expected 차이를 빨간 상태로 표시한다. |

### 정리

테스트 가능한 OO 설계의 핵심은 의존성을 바깥에서 주입받는 것이다. DB, 화면, 외부 API 같은 느리고 불안정한 의존성을 interface 뒤로 숨기면 ABAP Unit으로 핵심 로직을 빠르게 검증할 수 있다.

## CH26 최종 정리

CH26에서 다룬 패턴과 설계 원칙은 모두 같은 방향을 가진다. 바뀌는 것을 한곳에 모으고, 호출부가 구체 구현을 덜 알게 하며, 핵심 로직을 테스트 가능하게 만드는 것이다.

| 도구 | 한 줄 요약 | 잘못 쓰면 |
|---|---|---|
| Factory | 생성 책임을 한곳에 모은다 | 거대 생성 분기 class가 된다 |
| Singleton | 하나만 있어야 하는 인스턴스를 통제한다 | 전역 상태가 되어 테스트를 망친다 |
| Strategy | 알고리즘을 교체 가능한 객체로 만든다 | 간단한 분기도 과설계한다 |
| MVC | 화면·흐름·로직을 나눈다 | 작은 report까지 불필요하게 복잡하게 만든다 |
| ABAP Unit/DI | 의존성을 바꿔 끼워 자동 테스트한다 | mock과 production code 경계가 흐려진다 |

CH26의 목표는 패턴 이름을 많이 아는 것이 아니다. 변경 이유가 생겼을 때 수정 위치가 좁고, 테스트로 결과를 확인할 수 있는 구조를 만드는 것이다. 다음 CH27에서는 OO 이벤트 지식을 바탕으로 ALV의 본격 이벤트 처리로 넘어간다.
