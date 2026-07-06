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

## CH26을 배우기 전 필요한 설계 어휘

비전공자에게 디자인 패턴이 갑자기 어려워지는 이유는 class 문법을 몰라서만이 아니다. "책임", "의존성", "결합도", "추상화", "주입" 같은 말을 배운 적이 없기 때문이다. CH26에서는 이 말을 다음처럼 단순하게 잡고 간다.

| 용어 | 쉬운 뜻 | ABAP 예 |
|---|---|---|
| 책임 | 이 코드가 맡은 일 | Factory는 생성 책임, Strategy는 계산 방식 책임 |
| 의존성 | 어떤 코드가 다른 코드를 알아야 돌아가는 관계 | `zcl_checkout`이 `zif_price_strategy`를 알아야 가격 계산 가능 |
| 결합도 | 서로 얼마나 강하게 묶였는가 | `NEW zcl_vip_price( )` 직접 호출은 결합도가 높음 |
| 추상화 | 구체 이름 대신 공통 약속으로 보는 것 | `zif_booking_repo` interface |
| 주입 | 필요한 의존성을 내부에서 만들지 않고 밖에서 받는 것 | constructor parameter `io_repo` |
| 변경 지점 | 요구사항 변경 때 실제로 고쳐야 하는 곳 | 새 요금 정책 추가 시 Strategy class만 추가 |
| 테스트 경계 | 자동 테스트에서 진짜 DB/화면 대신 바꿔 끼울 수 있는 선 | repository interface와 mock |

패턴은 이 용어들을 코드로 실천하는 방식이다. Factory는 생성 책임을 모으고, Strategy는 변하는 알고리즘을 추상화하고, MVC는 책임을 계층으로 나누고, Dependency Injection은 테스트 경계를 만든다.

## CH26 R15 경계

CH26은 CH20의 OO 기본을 전제로 한다. `NEW`, 인터페이스, 다형성, 예외, 이벤트는 이미 학습했다. CH18이 New Syntax의 유일한 정식 장으로 확장되었으므로 `COND`, `SWITCH`, `REDUCE` 자체는 이제 미학습 문법이 아니다. 다만 CH26의 Factory 예제는 타입별 생성 규칙을 초보자가 눈으로 따라가기 쉽도록 `CASE`로 유지한다. 여기서 중요한 것은 새 문법 과시가 아니라 생성 책임이 한곳에 모이는 구조다.

| 구분 | CH26에서 정식 사용 | CH26에서 보류 |
|---|---|---|
| Factory | `CLASS-METHODS create`, `CASE`, interface 반환, 구체 class 은닉 | DI container, reflection 기반 동적 factory |
| Singleton | `CREATE PRIVATE`, `CLASS-DATA`, `get_instance` | shared memory singleton, cross-session singleton 보장 |
| Strategy | interface, 구현 class 교체, constructor injection | 복잡한 policy engine, BRF+ rule engine |
| Advanced OO keyword reading | `FRIENDS`, `LOCAL FRIENDS`, `ALIASES`를 읽고 위험을 판단하는 수준 | friendship 기반 설계 남용, framework 내부 권한 구조 설계 |
| MVC | Model/View/Controller 역할 분리, report 구조화 | UI5 MVC, Fiori Elements architecture |
| Testable design | dependency injection, local mock, ABAP Unit | ABAP Test Double Framework 상세, test seam/injection 상세 |
| Syntax choice | CH18 학습분 사용 가능. 예제는 설명력 우선 | 패턴 설명을 흐리는 과밀 expression |

## 공식 문서 수동 확인 근거

디자인 패턴 자체는 ABAP keyword statement가 아니라 설계 관용구다. 따라서 공식 확인은 패턴을 구현하는 ABAP OO 문법과 ABAP Unit 문법 중심으로 수행했다. Classic ABAP 문서는 `C:\ABAP_DOCU_HTML`에서 직접 확인했고, Markdown 사본은 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md`에서 대조했다.

| 주제 | 확인 문서 | 반영 포인트 |
|---|---|---|
| class option | `abapclass_options.htm`, `ABAPCLASS_OPTIONS.md` | `CREATE PRIVATE`, `FINAL`, `FOR TESTING`, instantiability |
| friends | `abenfriends.htm`, `abapclass_options.htm`, `abapclass_local_friends.htm` | `FRIENDS`, `GLOBAL FRIENDS`, `LOCAL FRIENDS`, 단방향 friendship, friend 범위 확장 위험 |
| static method | `abapclass-methods.htm`, `ABAPCLASS-METHODS.md` | `CLASS-METHODS`, functional static method, `RETURNING` |
| interface | `abapinterface.htm`, `ABAPINTERFACE.md` | interface declaration has no implementation part |
| interface implementation | `ABAPINTERFACES_CLASS.md` | `INTERFACES`, `intf~method`, class must implement methods |
| aliases | `abapaliases.htm`, `abapinterfaces_class.htm` | `ALIASES alias FOR intf~comp`, interface component selector, alias visibility and namespace 주의 |
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

비전공자 관점에서는 Factory를 "창구 직원"으로 생각하면 된다. 사용자는 "VIP 예매 처리자가 필요하다"고 요청할 뿐, 실제로 어느 class를 만들지 창고 안쪽까지 알 필요가 없다. 창구가 바뀌면 내부 배정 규칙만 바꾸면 되고, 사용자는 같은 창구를 계속 이용한다.

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
- `COND`로 짧게 쓸 수 있어도, 여러 구현 class를 고르는 예제에서는 `CASE`가 입문자에게 더 선명할 수 있다.

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

Singleton을 이해할 때 가장 중요한 질문은 "하나면 편한가?"가 아니라 "둘 이상이면 업무적으로 틀리는가?"이다. 단순히 어디서나 접근하기 편하다는 이유라면 Singleton이 아니라 의존성 주입이 더 좋은 경우가 많다.

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

입문자가 Strategy를 처음 볼 때 가장 낯선 부분은 "굳이 class를 여러 개 만들 필요가 있나"이다. 기준은 변경 빈도다. 요금 정책이 자주 바뀌고, 정책마다 테스트해야 할 규칙이 다르면 class로 분리할 가치가 생긴다. 반대로 평생 두 가지 분기뿐이라면 `CASE` 하나가 더 정직한 코드일 수 있다.

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

## CH26-L03A · `FRIENDS`와 `ALIASES`: 고급 OO 코드를 읽기 위한 키워드

### 왜 필요한가

CH20에서 배운 캡슐화의 기본 원칙은 단순하다. class 내부 사정은 `PRIVATE SECTION`에 숨기고, 바깥에는 필요한 public method만 공개한다. 그래야 내부 구현을 바꿔도 호출부가 덜 흔들린다.

그런데 실무 ABAP OO 코드를 읽다 보면 다음처럼 낯선 키워드를 만나게 된다.

```abap
CLASS lcl_booking_cache DEFINITION FINAL CREATE PRIVATE
  FRIENDS lcl_booking_cache_test.
```

또는 interface 구현 class에서 이런 선언을 본다.

```abap
ALIASES calc_price FOR zif_price_strategy~calc.
```

입문자는 여기서 두 가지 오해를 하기 쉽다.

- `FRIENDS`를 "친한 class니까 대충 접근해도 된다"는 느슨한 허용으로 이해한다.
- `ALIASES`를 "새 method를 하나 더 만든 것"으로 이해한다.

둘 다 정확하지 않다. `FRIENDS`는 캡슐화를 예외적으로 뚫는 강한 권한이고, `ALIASES`는 interface component의 긴 이름에 짧은 이름을 붙이는 읽기 보조 장치다. CH26에서 이 둘을 완전히 설계 도구로 남용할 단계는 아니지만, 고급 OO 코드와 테스트 코드를 읽으려면 반드시 구분해야 한다.

### 무엇인가: `FRIENDS`

`FRIENDS`는 어떤 class가 다른 class의 숨겨진 구성요소까지 접근할 수 있게 허락하는 선언이다. 공식 문서 기준으로 friend는 granting class의 모든 component에 visibility와 관계없이 접근할 수 있다. 즉 public만 보는 일반 사용자와 다르다.

```abap
CLASS lcl_booking_cache_test DEFINITION DEFERRED.

CLASS lcl_booking_cache DEFINITION FINAL CREATE PRIVATE
  FRIENDS lcl_booking_cache_test.
  PUBLIC SECTION.
    CLASS-METHODS get_instance
      RETURNING VALUE(ro_cache) TYPE REF TO lcl_booking_cache.
  PRIVATE SECTION.
    CLASS-DATA go_cache TYPE REF TO lcl_booking_cache.
    DATA mv_hit_count TYPE i.
    METHODS reset_for_test.
ENDCLASS.
```

위 선언에서 `lcl_booking_cache_test`는 `lcl_booking_cache`의 friend다. 따라서 일반 호출부라면 접근할 수 없는 `reset_for_test`나 `mv_hit_count`에 접근할 수 있다. 이 기능은 특히 테스트 class가 private 상태를 확인해야 할 때 등장할 수 있다.

하지만 이것은 매우 강한 예외다. `PRIVATE SECTION`은 유지보수자를 보호하는 울타리인데, `FRIENDS`는 그 울타리에 특정 사람만 지나갈 수 있는 문을 만드는 것이다. 문을 많이 만들면 울타리 의미가 사라진다.

```abap
CLASS lcl_booking_cache_test DEFINITION FOR TESTING
  DURATION SHORT
  RISK LEVEL HARMLESS.
  PRIVATE SECTION.
    METHODS reset_clears_counter FOR TESTING.
ENDCLASS.

CLASS lcl_booking_cache_test IMPLEMENTATION.
  METHOD reset_clears_counter.
    DATA(lo_cache) = lcl_booking_cache=>get_instance( ).

    lo_cache->mv_hit_count = 3.
    lo_cache->reset_for_test( ).

    cl_abap_unit_assert=>assert_equals(
      act = lo_cache->mv_hit_count
      exp = 0 ).
  ENDMETHOD.
ENDCLASS.
```

이 예제는 friend test class가 private attribute와 private method를 직접 건드리는 모습을 보여 주기 위한 것이다. 실제 설계에서는 먼저 "public 동작만으로 검증할 수 없는가?"를 물어야 한다. 테스트가 private 구현에 지나치게 붙으면 리팩터링할 때 기능은 그대로인데 테스트만 깨질 수 있다.

`FRIENDS`에서 반드시 기억할 점은 다음과 같다.

| 규칙 | 의미 |
|---|---|
| 권한은 단방향이다 | A가 B를 friend로 지정해도 B가 A를 friend로 지정한 것은 아니다 |
| friend는 넓은 접근 권한을 가진다 | private/protected까지 접근할 수 있으므로 최소한으로 지정해야 한다 |
| interface를 friend로 지정하면 범위가 커진다 | 그 interface를 구현하는 class들이 friend가 될 수 있어 영향 범위가 넓다 |
| final class를 friend로 지정하는 편이 상대적으로 안전하다 | 상속으로 접근 범위가 퍼지는 위험을 줄일 수 있다 |
| local test class friend는 테스트에서 등장할 수 있다 | 그래도 public behavior 검증을 우선하고, private 직접 검증은 예외로 둔다 |

### 무엇인가: `ALIASES`

ABAP에서 class가 interface를 구현하면 interface component는 보통 `intf~comp` 형태로 보인다.

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
```

`zif_price_strategy~calc`는 "이 method는 interface에서 온 calc다"라는 뜻이다. 이름이 길지만 출처가 분명하다.

`ALIASES`는 이 interface component에 짧은 이름을 붙인다.

```abap
CLASS zcl_regular_price DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES zif_price_strategy.
    ALIASES calc_price FOR zif_price_strategy~calc.
ENDCLASS.
```

이제 같은 method를 더 짧게 호출할 수 있다.

```abap
DATA(lo_price) = NEW zcl_regular_price( ).

DATA(lv_total) = lo_price->calc_price( iv_seats = 2 ).
```

중요한 점은 `calc_price`가 완전히 새로운 method가 아니라는 것이다. `zif_price_strategy~calc`라는 interface method에 붙인 다른 이름이다. 따라서 코드를 읽을 때는 `ALIASES calc_price FOR zif_price_strategy~calc` 선언으로 돌아가 "이 이름의 원래 출처가 어느 interface인가"를 확인해야 한다.

### 어떻게 확인하는가

`FRIENDS`를 만나면 다음 순서로 읽는다.

1. 누가 누구에게 권한을 열어 주는지 본다. `CLASS A ... FRIENDS B`라면 A가 B에게 접근을 허락한다.
2. friend가 class인지 interface인지 확인한다. interface friend는 영향 범위가 커질 수 있다.
3. friend가 private 생성자 접근 때문에 필요한지, private 상태 테스트 때문에 필요한지, 단순 편의인지 판단한다.
4. 테스트 class가 friend라면 public method로 검증할 수 없는 이유가 있는지 확인한다.
5. friend class가 늘어날수록 캡슐화가 약해진다는 점을 기록한다.

`ALIASES`를 만나면 다음 순서로 읽는다.

1. `ALIASES alias FOR intf~comp`에서 `intf~comp` 원본을 먼저 찾는다.
2. alias가 public/protected/private 중 어느 section에 선언되었는지 확인한다.
3. 호출부에서 alias와 `intf~comp` 전체 이름이 섞여 쓰이는지 본다.
4. alias 이름이 원래 interface 출처를 너무 숨기지 않는지 판단한다.
5. 같은 class의 다른 component 이름과 충돌하거나 의미가 모호하지 않은지 확인한다.

### 실수와 주의

- `FRIENDS`를 "테스트하기 편하게 private을 모두 열어도 된다"로 이해하면 안 된다. 테스트는 가능한 한 public behavior를 검증한다.
- global interface를 friend로 지정하면 그 interface를 구현하는 많은 class가 접근 권한을 얻을 수 있다. 영향 범위를 반드시 계산한다.
- A가 B를 friend로 지정했다고 해서 B도 A에게 private 접근을 허용한 것은 아니다.
- `ALIASES`는 새 method 복사본이 아니다. 같은 interface component에 붙은 다른 이름이다.
- alias가 너무 많으면 오히려 "이 method가 어느 interface에서 왔는지"가 흐려진다.
- 같은 코드에서 `calc_price`와 `zif_price_strategy~calc`를 뒤섞으면 학습자와 유지보수자가 같은 method인지 헷갈릴 수 있다.

### 체험형 학습 설계

**OO Access Boundary Inspector**

| 요소 | 설계 |
|---|---|
| 데이터 | class A의 public/protected/private component, friend 후보 class, interface method, alias name |
| 버튼 | `friend 지정`, `friend 해제`, `private 접근 시도`, `alias 추가`, `interface 전체 이름 호출`, `alias 호출` |
| 상태 | access allowed/denied, granting class, friend class, alias target, visible name list |
| 피드백 | friend가 없는데 private 접근을 시도하면 "캡슐화 위반"을 표시하고, friend 지정 후에는 "권한은 열렸지만 설계 위험이 증가했다"를 표시한다. alias 호출이 성공하면 원래 target인 `intf~comp`를 함께 highlight한다. |

### 정리

`FRIENDS`와 `ALIASES`는 고급 OO 코드에서 자주 보이는 작은 키워드지만 의미는 가볍지 않다. `FRIENDS`는 캡슐화를 예외적으로 여는 권한 선언이고, `ALIASES`는 interface component에 더 짧은 이름을 붙이는 선언이다. CH26에서는 이 둘을 남용하는 설계 기술로 배우는 것이 아니라, 고급 코드를 읽을 때 "어느 경계가 열렸는가", "이 이름의 원래 출처가 무엇인가"를 파악하는 도구로 배운다.

## CH26-L04 · MVC 기반 Report 구조화

### 왜 필요한가

ABAP report는 쉽게 커진다. 처음에는 `SELECT`, 계산, `WRITE` 또는 ALV 출력이 한 파일에 있어도 괜찮다. 하지만 이벤트가 붙고, 검색 조건이 늘고, 저장 버튼이 생기면 한 프로그램 안에서 데이터 조회, 업무 판단, 화면 표시가 서로 엉킨다.

MVC는 이 엉킴을 역할별로 분리한다. Model은 데이터와 업무 로직, View는 표시, Controller는 흐름 조율을 맡는다.

MVC는 "파일을 세 개로 나누라"는 규칙이 아니다. 코드가 서로 다른 이유로 바뀌도록 분리하라는 규칙이다. 화면 디자인이 바뀌는 이유와 잔여석 계산 규칙이 바뀌는 이유는 다르다. 바뀌는 이유가 다르면 같은 method 안에 두지 않는 편이 오래 간다.

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

여기서 "가짜"라는 말은 허술하다는 뜻이 아니다. Mock은 테스트를 위해 의도적으로 만든 대체 구현이다. 실제 DB는 느리고 데이터 상태가 계속 변하지만, mock은 항상 같은 값을 돌려주므로 계산 로직이 맞는지 안정적으로 확인할 수 있다.

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
| FRIENDS | 특정 class/interface에 private 경계를 예외적으로 연다 | 캡슐화가 무너지고 테스트가 구현에 붙는다 |
| ALIASES | interface component에 짧은 이름을 붙인다 | 원래 interface 출처가 숨겨진다 |
| MVC | 화면·흐름·로직을 나눈다 | 작은 report까지 불필요하게 복잡하게 만든다 |
| ABAP Unit/DI | 의존성을 바꿔 끼워 자동 테스트한다 | mock과 production code 경계가 흐려진다 |

CH26의 목표는 패턴 이름을 많이 아는 것이 아니다. 변경 이유가 생겼을 때 수정 위치가 좁고, 테스트로 결과를 확인할 수 있는 구조를 만드는 것이다. 다음 CH27에서는 OO 이벤트 지식을 바탕으로 ALV의 본격 이벤트 처리로 넘어간다.

마지막으로 패턴 선택 기준을 한 문장으로 정리한다.

| 상황 | 먼저 생각할 선택 |
|---|---|
| `NEW`가 여러 곳에 흩어져 생성 규칙 변경이 어렵다 | Factory |
| 둘 이상이면 업무적으로 틀리는 단일 상태가 있다 | Singleton |
| 계산/판정 방식이 자주 바뀌고 방식별 테스트가 필요하다 | Strategy |
| 화면 변경이 업무 로직 변경까지 건드린다 | MVC |
| DB나 화면 때문에 자동 테스트가 어렵다 | Dependency Injection + ABAP Unit |

패턴을 적용하지 않는 것도 실력이다. 작은 코드에 과한 구조를 넣으면 학습자에게도 유지보수자에게도 부담이 된다. CH26의 핵심은 "무조건 패턴"이 아니라 "변경이 아픈 곳에 정확한 패턴"이다.
