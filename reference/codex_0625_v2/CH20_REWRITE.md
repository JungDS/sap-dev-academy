# CH20_REWRITE · OO ABAP 기본 설계

> 기준: `reference/codex_0625/00_QUALITY_REVIEW.md`의 재작업 판정  
> 원본: `content/abap/CH20/_chapter.md`, `content/abap/CH20/CH20-L01.md` ~ `CH20-L10.md`  
> 목적: CH20을 템플릿 보강안이 아니라, 절차적 ABAP에서 OO ABAP으로 넘어가는 완성 강의자료 수준으로 재집필한다.

## CH20의 역할

CH20은 학습자가 지금까지 배운 절차적 ABAP 지식을 객체지향 설계로 재배치하는 장이다. CH10에서 FORM, Function Module, Local Class를 통해 "코드를 덩어리로 나누는 이유"를 배웠고, CH18에서는 `DATA( )`, `NEW`, string template 같은 modern syntax를 열었다. CH19에서는 modern ABAP SQL을 통해 데이터 조회식을 더 명확하게 쓰는 법을 배웠다.

이제 CH20에서는 로직을 단순히 짧게 쓰는 수준을 넘어, 업무 개념을 클래스로 묶는다. 콘서트 예매 앱에서 "예약 관리자"는 단순한 FORM 묶음이 아니다. 공연 ID와 회차를 알고, 정원을 조회하고, 잔여석을 계산하고, 정원 초과를 예외로 알리고, 필요하면 매진 이벤트를 발생시키는 객체다.

입문자는 이 챕터가 끝났을 때 다음 질문에 답할 수 있어야 한다.

- 클래스는 왜 데이터와 행동을 함께 묶는가?
- `CLASS ... DEFINITION`과 `CLASS ... IMPLEMENTATION`은 왜 나뉘는가?
- `PUBLIC`, `PROTECTED`, `PRIVATE`는 단순한 접근 제한이 아니라 설계 의도를 어떻게 드러내는가?
- 인스턴스 멤버와 정적 멤버는 언제 나뉘는가?
- 생성자, 인터페이스, 예외, 상속, 다형성, 이벤트는 각각 어떤 불편을 해결하는가?
- `ZCL_BOOKING_MANAGER` 같은 전역 클래스가 절차적 콘서트 예매 로직을 어떻게 캡슐화하는가?

## R15 경계

CH20에서 허용되는 것과 아직 보류하는 것을 분명히 나눈다.

| 구분 | CH20에서 정식 사용 | 아직 보류 |
|---|---|---|
| OO 기본 | Global Class, object reference, `NEW`, `CREATE OBJECT`, `->`, `=>`, `me->` | 고급 패턴, factory/singleton 설계 심화 |
| 클래스 구조 | `PUBLIC/PROTECTED/PRIVATE`, `DATA`, `CLASS-DATA`, `METHODS`, `CLASS-METHODS` | `FRIENDS`, `CREATE PRIVATE`, 테스트 seam, RTTI 심화 |
| 생성 | `constructor`, `class_constructor` | 상속 생성자 체인 심화, dependency injection 패턴화 |
| 규약 | `INTERFACE`, `INTERFACES`, `인터페이스~메서드` | ALIASES, compound interface 심화 |
| 예외 | `TRY/CATCH/CLEANUP`, `RAISE EXCEPTION`, `RAISING`, `CX_STATIC_CHECK/DYNAMIC/NO_CHECK`, `CX_ROOT`, `RESUME` 개념 | T100 메시지 예외 설계 심화, 예외 프레임워크 표준화 |
| 상속/다형성 | `INHERITING FROM`, `REDEFINITION`, `super->`, `ABSTRACT`, `FINAL`, `CAST`, `?=`, `CASE TYPE OF` | 디자인 패턴, 전략 패턴, mock/test double |
| 이벤트 | `EVENTS`, `RAISE EVENT`, `SET HANDLER`, `FOR EVENT` | ALV 이벤트 심화는 CH21/CH27, RAP entity event는 CH23 이후 |
| 콘서트 앱 | 잔여석 조회, 정원 초과 검증, 예외/이벤트 발생 | 실제 `INSERT/UPDATE/DELETE`는 CH24 DML, CDS/RAP는 CH22/CH23 |

> CH20은 OO ABAP의 L3 정식 도입 장이다. 따라서 앞 챕터에서 선행 사용했던 `REF TO`, `CREATE OBJECT`, `TRY/CATCH`, `NEW`를 이제 원리까지 설명한다. 반대로 CH20의 완성도를 높인다는 이유로 CDS, RAP, ABAP Cloud, 고급 패턴, 실제 DML을 앞당기지 않는다.

## 공식 문서 수동 확인 근거

이번 재작성은 자동 키워드 매칭이 아니라 `C:\ABAP_DOCU_HTML`의 ABAP Keyword Documentation을 CH20 주제별로 직접 확인한 내용을 반영한다.

| 주제 | 확인한 문서 파일 | 본문 반영 포인트 |
|---|---|---|
| 전역/지역 클래스와 인터페이스 | `abenclass_interface_definition.htm` | Global class/interface는 repository class library에 저장되고 여러 프로그램에서 보인다. Class Builder 또는 ADT에서 편집한다. |
| 클래스 선언/구현 | `abapclass_definition.htm`, `abapclass_implementation.htm` | `CLASS ... DEFINITION`에는 visibility section과 components가 있고, `CLASS ... IMPLEMENTATION`에는 선언한 메서드 구현이 들어간다. |
| Visibility | `abenclass_visibility.htm` | public은 모든 사용자, protected는 자신과 하위 클래스, private은 자신만 접근한다. |
| 속성/메서드 | `abapclass-data.htm`, `abapclass-methods.htm`, `abapmethods_general.htm` | `DATA`는 인스턴스 속성, `CLASS-DATA`는 정적 속성, `METHODS`와 `CLASS-METHODS`는 인스턴스/정적 메서드를 선언한다. |
| 생성자 | `abapmethods_constructor.htm`, `abapclass-methods_constructor.htm` | `constructor`는 객체 생성 시, `class_constructor`는 클래스 최초 사용 시 한 번 실행된다. |
| 객체 생성과 참조 | `abapcreate_object.htm`, `abenconstructor_expression_new.htm`, `abenobject_reference_type.htm` | `CREATE OBJECT`와 `NEW`는 객체를 만들고 reference variable에 연결하며 instance constructor를 호출한다. |
| 호출 선택자 | `abenobject_component_selector.htm`, `abenclass_component_selector.htm`, `abapcall_method_meth_ident_stat.htm`, `abenme.htm` | 객체 멤버는 `->`, 정적 멤버는 `=>`, 인스턴스 메서드 내부의 짧은 호출은 `me->`로 이해한다. |
| 인터페이스 | `abapinterface.htm`, `abapinterfaces.htm`, `abapinterfaces_class.htm` | `INTERFACE`는 구현부가 없고, 클래스는 `INTERFACES`로 구현하며, 구현 메서드는 `intf~method` 이름을 가진다. |
| 예외 | `abaptry.htm`, `abapcatch_try.htm`, `abapcleanup.htm`, `abapraise_exception.htm`, `abapmethods_general.htm`, `abapresume.htm` | `TRY/CATCH/CLEANUP`, `RAISE EXCEPTION`, `RAISING`, CATCH 순서, `RESUME`의 제한을 반영한다. |
| 예외 계층 | `abenabap_exception_classes.htm`, `abenexception_categories.htm`, `abenexception_texts.htm` | `CX_STATIC_CHECK`, `CX_DYNAMIC_CHECK`, `CX_NO_CHECK`의 처리 강제 수준과 `CX_ROOT` 기반 텍스트 조회를 설명한다. |
| 상속/재정의 | `abapclass_options.htm`, `abapmethods_redefinition.htm`, `abapcall_method_meth_super.htm`, `abensingle_inheritance_glosry.htm` | ABAP 클래스는 단일 상속이며, `REDEFINITION`은 상속받은 인스턴스 메서드를 새 구현으로 바꾸고 `super->`로 부모 구현을 호출한다. |
| 캐스팅/타입 분기 | `abenconstructor_expression_cast.htm`, `abapmove_cast.htm`, `abapcase_type.htm` | `CAST`와 `?=`는 downcast/upcast에 쓰이며, 실패 시 `CX_SY_MOVE_CAST_ERROR`; `CASE TYPE OF ... WHEN TYPE ... INTO ...`를 사용할 수 있다. |
| 이벤트 | `abenevents.htm`, `abenevents_overview.htm`, `abapevents.htm`, `abapraise_event.htm`, `abapset_handler.htm`, `abapmethods_event_handler.htm` | `EVENTS` 선언, `RAISE EVENT` 발생, `FOR EVENT` 핸들러 선언, `SET HANDLER` 동적 등록, 동기 실행과 등록 필요성을 반영한다. |
| 콘서트 앱 조회식 | `abapselect.htm`, `abensql_coalesce.htm` | CH19에서 배운 modern SQL, aggregate, `COALESCE`를 잔여석 계산에 사용하되 DML은 제외한다. |

## CH20-L01 · Global Class 생성과 객체

### 왜 필요한가

절차적 ABAP에서는 업무 데이터와 업무 행동이 쉽게 흩어진다. 예를 들어 콘서트 예매 프로그램에 `FORM get_remaining`, `FORM check_capacity`, `FORM book_seats`가 각각 있으면 처음에는 단순해 보인다. 그러나 화면 프로그램, ALV 리포트, 배치 프로그램이 같은 예약 판단을 재사용하기 시작하면 문제가 드러난다.

어느 FORM이 최신 규칙인지 헷갈리고, 공연 ID와 회차 같은 상태를 매번 파라미터로 넘겨야 하며, 정원 초과 처리도 프로그램마다 조금씩 달라진다. "예약 관리자"라는 업무 개념이 분명히 있는데 코드에는 그 개념이 흩어져 있는 상태다.

Global Class는 이 문제를 해결하는 첫 도구다. `ZCL_BOOKING_MANAGER`라는 전역 클래스를 만들면, 예약과 관련된 상태와 행동을 하나의 repository 객체로 묶고 여러 프로그램에서 재사용할 수 있다.

### 무엇인가

클래스는 객체를 만들기 위한 설계도다. 객체는 그 설계도로 만든 실제 인스턴스다.

Global Class는 SE24 또는 ADT에서 만드는 repository class다. 소스 관점에서는 크게 두 부분으로 나뉜다.

- `DEFINITION`: 외부에서 무엇을 볼 수 있는지, 어떤 속성과 메서드가 있는지 선언한다.
- `IMPLEMENTATION`: 선언한 메서드가 실제로 무엇을 하는지 작성한다.

```abap
CLASS zcl_booking_manager DEFINITION
  PUBLIC
  CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS book
      IMPORTING iv_seats TYPE i.
ENDCLASS.

CLASS zcl_booking_manager IMPLEMENTATION.
  METHOD book.
    " 예약 처리의 실제 코드는 뒤 레슨에서 채운다.
  ENDMETHOD.
ENDCLASS.
```

클래스만 선언해도 예약 관리자가 생긴 것은 아니다. 실제로 일을 시키려면 객체를 만들어야 한다.

```abap
DATA(lo_mgr) = NEW zcl_booking_manager( ).

lo_mgr->book( iv_seats = 2 ).
```

`lo_mgr`는 객체 자체가 아니라 객체를 가리키는 참조 변수다. classic 방식으로 쓰면 이 구조가 더 노골적으로 보인다.

```abap
DATA lo_mgr TYPE REF TO zcl_booking_manager.

CREATE OBJECT lo_mgr.
lo_mgr->book( iv_seats = 2 ).
```

`NEW zcl_booking_manager( )`와 `CREATE OBJECT lo_mgr`는 모두 객체를 만든다. CH20 이후에는 modern `NEW`를 자연스럽게 쓰되, 기존 코드와 SAP GUI 예제에서 `CREATE OBJECT`를 만나도 같은 개념으로 읽을 수 있어야 한다.

### 어떻게 확인하는가

확인은 세 단계로 한다.

1. SE24 또는 ADT에서 `ZCL_BOOKING_MANAGER`가 활성화되는지 확인한다.
2. 테스트 리포트에서 `DATA(lo_mgr) = NEW zcl_booking_manager( ).` 줄에 중단점을 건다.
3. 디버거에서 `lo_mgr`가 initial reference에서 object reference로 바뀌는지 확인한다.

객체가 만들어진 뒤에는 `lo_mgr->book( )` 호출에서 `book` 메서드 내부로 진입해야 한다. 이때 `lo_mgr`가 initial이면 instance method 호출은 실패한다. 따라서 "객체 생성 -> 참조 변수에 담김 -> `->`로 메서드 호출" 순서를 눈으로 확인해야 한다.

기존 임베드 `CH20-L01-S01`은 이 관계를 보여 주는 핵심 시각 자료로 사용한다.

::embed CH20-L01-S01 | 클래스(설계도)와 객체(인스턴스)의 관계::

### 실수와 주의

객체 없이 인스턴스 메서드를 호출하려는 실수가 가장 흔하다.

```abap
DATA lo_mgr TYPE REF TO zcl_booking_manager.

" lo_mgr가 아직 어떤 객체도 가리키지 않는다.
lo_mgr->book( iv_seats = 2 ).
```

참조 변수 선언은 빈 명함을 만든 것과 같다. `NEW` 또는 `CREATE OBJECT`가 있어야 실제 객체를 가리킨다.

두 번째 실수는 클래스와 객체를 같은 것으로 생각하는 것이다. `zcl_booking_manager`는 설계도이고, `lo_mgr`는 그 설계도로 만든 특정 객체를 가리키는 변수다. 같은 클래스로 객체를 여러 개 만들면 각 객체는 서로 다른 인스턴스 상태를 가질 수 있다.

세 번째 실수는 Global Class를 무조건 모든 문제의 답으로 쓰는 것이다. 한 프로그램 안에서만 짧게 쓰는 보조 구조라면 local class도 가능하다. 그러나 콘서트 예매처럼 여러 프로그램과 후속 챕터가 공유할 업무 로직은 Global Class가 더 적합하다.

### 체험형 학습 설계

**실습 장치: Class-to-Object Builder**

데이터:
- 클래스 카드: `ZCL_BOOKING_MANAGER`
- 객체 슬롯: `lo_mgr`, `lo_mgr_vip`
- 메서드 카드: `book( iv_seats )`
- 상태: `referenceState = initial | bound`, `objectCount`, `lastCallTarget`

버튼:
- `클래스 정의 보기`: `DEFINITION`과 `PUBLIC SECTION`을 펼친다.
- `객체 생성 NEW`: `DATA(lo_mgr) = NEW zcl_booking_manager( ).`를 실행한 상태로 전환한다.
- `classic 생성 보기`: `DATA ... TYPE REF TO`, `CREATE OBJECT` 순서를 보여 준다.
- `book 호출`: 현재 선택된 객체의 `book` 메서드로 화살표를 이동시킨다.
- `참조 초기화`: `CLEAR lo_mgr` 상태를 만들어 initial reference 오류를 체험하게 한다.

피드백:
- 객체 생성 전 `book 호출`을 누르면 "참조 변수는 선언됐지만 객체를 가리키지 않음"이라고 표시한다.
- `NEW`와 `CREATE OBJECT`를 번갈아 누르면 "문법은 다르지만 둘 다 instance constructor를 호출해 객체를 만든다"라고 표시한다.
- 객체를 두 개 만들면 같은 클래스에서 나온 두 인스턴스가 서로 다른 슬롯에 표시된다.

### 정리

CH20-L01의 핵심은 클래스와 객체를 분리해서 보는 것이다. 클래스는 설계도, 객체는 실행 중 메모리에 존재하는 인스턴스, 참조 변수는 그 객체를 가리키는 손잡이다. Global Class를 만들고 객체를 생성할 수 있어야 이후 속성, 메서드, 생성자, 예외, 이벤트 설명이 모두 제자리에 놓인다.

## CH20-L02 · Attribute / Method / Visibility

### 왜 필요한가

클래스가 단지 FORM을 담는 상자라면 객체지향의 장점은 거의 없다. 좋은 클래스는 "무엇을 알고 있는가"와 "무엇을 할 수 있는가"를 함께 설계한다.

콘서트 예매 관리자라면 공연 ID, 회차, 정원 같은 상태를 알고 있어야 한다. 그리고 잔여석 계산, 예매 가능 여부 판단, 예약 요청 처리 같은 행동을 제공해야 한다. 여기서 중요한 점은 모든 데이터를 밖에 공개하지 않는 것이다. 외부 프로그램이 `mv_cap` 같은 내부 정원을 직접 바꾸면 클래스가 지켜야 할 규칙이 무너진다.

그래서 attribute, method, visibility가 필요하다.

### 무엇인가

Attribute는 클래스 또는 객체가 가진 데이터다. Method는 그 데이터로 수행하는 행동이다.

```abap
CLASS zcl_booking_manager DEFINITION
  PUBLIC
  CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS book
      IMPORTING iv_seats TYPE i.

    METHODS remaining
      RETURNING VALUE(rv_remaining) TYPE i.

  PRIVATE SECTION.
    DATA mv_concert TYPE zconcert-concert_id.
    DATA mv_perf    TYPE zbooking-perf_no.
    DATA mv_cap     TYPE i.
ENDCLASS.
```

`DATA`로 선언한 attribute는 인스턴스 속성이다. 객체마다 따로 값을 가진다. `CLASS-DATA`는 정적 속성이다. 객체별 값이 아니라 클래스에 하나만 존재하는 공용 값이다.

```abap
CLASS zcl_booking_manager DEFINITION
  PUBLIC
  CREATE PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS get_version
      RETURNING VALUE(rv_version) TYPE string.

  PRIVATE SECTION.
    CLASS-DATA gv_version TYPE string VALUE '1.0'.
ENDCLASS.
```

Visibility는 누가 그 component에 접근할 수 있는지를 정한다.

| 섹션 | 접근 가능 범위 | CH20에서의 설계 기준 |
|---|---|---|
| `PUBLIC SECTION` | 모든 사용자, 자신, 하위 클래스 | 외부가 호출해야 하는 메서드 |
| `PROTECTED SECTION` | 자신과 하위 클래스 | 상속 확장을 위해 열어 둘 내부 계약 |
| `PRIVATE SECTION` | 자신만 | 외부가 직접 바꾸면 안 되는 상태 |

입문자에게 가장 중요한 기본 원칙은 "데이터는 보통 private, 행동은 필요한 만큼 public"이다. 객체지향의 캡슐화는 데이터를 숨기기 위한 장식이 아니라, 잘못된 상태 변경을 막기 위한 방어선이다.

### 어떻게 확인하는가

가장 좋은 확인 방법은 일부러 잘못 접근해 보는 것이다.

```abap
DATA(lo_mgr) = NEW zcl_booking_manager( ).

" PUBLIC 메서드는 호출 가능
DATA(lv_remaining) = lo_mgr->remaining( ).

" PRIVATE 속성은 외부에서 직접 접근하면 syntax error
" lo_mgr->mv_cap = 100.
```

활성화 시점에 private 접근 오류가 나야 정상이다. 런타임 오류가 아니라 syntax check에서 막힌다는 점이 중요하다. 클래스의 경계는 실행 중 뒤늦게 드러나는 약속이 아니라 컴파일 시점에 검증되는 계약이다.

인스턴스 속성과 정적 속성도 확인한다. 객체 두 개를 만든 뒤 인스턴스 속성은 객체마다 달라질 수 있고, `CLASS-DATA`는 클래스 하나에 공통이라는 점을 디버거에서 비교한다.

### 실수와 주의

첫째, 내부 상태를 public으로 열어 두지 않는다.

```abap
" 나쁜 방향: 외부가 정원을 마음대로 바꿀 수 있다.
PUBLIC SECTION.
  DATA mv_cap TYPE i.
```

이렇게 하면 `remaining( )`이나 `book( )`이 지켜야 할 규칙을 외부 코드가 우회할 수 있다.

둘째, 모든 것을 private으로 닫아 버리면 클래스가 쓸모없어진다. 외부에서 호출해야 할 메서드는 public으로 열어야 한다. 캡슐화는 숨기는 기술이 아니라 공개할 것과 숨길 것을 나누는 설계다.

셋째, protected는 초반에 남용하지 않는다. protected는 "나중에 상속받은 클래스가 이 내부 계약에 의존해도 된다"는 의미다. 확장 의도가 분명하지 않다면 private으로 시작하는 편이 안전하다.

### 체험형 학습 설계

**실습 장치: Visibility Gate Simulator**

데이터:
- 클래스 내부 멤버: `mv_cap`, `mv_concert`, `remaining( )`, `book( )`
- 호출자 역할: `외부 리포트`, `자기 클래스`, `상속 자식 클래스`
- 상태: `selectedMember`, `callerRole`, `visibility`, `syntaxResult`

버튼:
- `PUBLIC으로 이동`: 선택한 멤버를 public section에 둔다.
- `PRIVATE으로 이동`: 선택한 멤버를 private section에 둔다.
- `PROTECTED으로 이동`: 선택한 멤버를 protected section에 둔다.
- `외부에서 접근`: 리포트 코드 `lo_mgr->...`를 시도한다.
- `자식에서 접근`: 상속 클래스 내부 코드에서 접근을 시도한다.
- `규칙 검사`: public/private/protected 결과표를 보여 준다.

피드백:
- `mv_cap`을 public으로 옮기면 "작동은 하지만 정원 규칙을 외부가 깨뜨릴 수 있음"이라고 표시한다.
- 외부에서 private 속성 접근을 누르면 "syntax check에서 차단됨: private component는 클래스 자신만 접근"이라고 표시한다.
- protected 접근은 외부 리포트에는 실패하고 자식 클래스에는 성공하는 차이를 보여 준다.

### 정리

CH20-L02의 핵심은 클래스 내부를 설계하는 법이다. Attribute는 상태, method는 행동, visibility는 경계다. 외부에 필요한 행동만 public으로 열고, 내부 상태는 private으로 보호해야 이후 생성자, 예외, 상속이 안정적으로 쌓인다.

## CH20-L03 · Constructor와 객체 초기화

### 왜 필요한가

객체를 만든 뒤 매번 초기화 메서드를 따로 호출해야 한다면 실수가 생긴다.

```abap
DATA(lo_mgr) = NEW zcl_booking_manager( ).
lo_mgr->set_concert( iv_concert = 'C001' iv_perf = '01' ).
lo_mgr->load_capacity( ).
```

이 흐름은 호출자가 반드시 순서를 기억해야 한다. 누군가 `load_capacity( )`를 빼먹으면 예약 관리자는 공연 ID 없이 잔여석을 계산하려고 한다. 객체가 만들어졌지만 아직 사용할 준비가 안 된 상태가 된다.

Constructor는 이 문제를 해결한다. 객체가 태어나는 순간 반드시 필요한 값을 받고, 사용할 준비가 된 상태로 만든다.

### 무엇인가

`constructor`는 객체 생성 직후 자동으로 실행되는 특별한 instance method다.

```abap
CLASS zcl_booking_manager DEFINITION
  PUBLIC
  CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS constructor
      IMPORTING
        iv_concert TYPE zconcert-concert_id
        iv_perf    TYPE zbooking-perf_no.

  PRIVATE SECTION.
    DATA mv_concert TYPE zconcert-concert_id.
    DATA mv_perf    TYPE zbooking-perf_no.
    DATA mv_cap     TYPE i.
ENDCLASS.

CLASS zcl_booking_manager IMPLEMENTATION.
  METHOD constructor.
    mv_concert = iv_concert.
    mv_perf    = iv_perf.

    SELECT SINGLE capacity
      FROM zconcert
      WHERE concert_id = @iv_concert
      INTO @mv_cap.
  ENDMETHOD.
ENDCLASS.
```

객체를 만들 때 constructor의 importing parameter를 넘긴다.

```abap
DATA(lo_mgr) = NEW zcl_booking_manager(
  iv_concert = 'C001'
  iv_perf    = '01' ).
```

`class_constructor`는 정적 생성자다. 객체마다 실행되는 것이 아니라 클래스가 처음 사용될 때 한 번 실행된다.

```abap
CLASS zcl_booking_manager DEFINITION
  PUBLIC
  CREATE PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS class_constructor.

  PRIVATE SECTION.
    CLASS-DATA gv_version TYPE string.
ENDCLASS.

CLASS zcl_booking_manager IMPLEMENTATION.
  METHOD class_constructor.
    gv_version = '1.0'.
  ENDMETHOD.
ENDCLASS.
```

`constructor`는 객체별 초기화, `class_constructor`는 클래스 공용 초기화에 쓴다.

### 어떻게 확인하는가

디버거에서 다음 순서를 본다.

1. `NEW zcl_booking_manager( ... )` 줄에 중단점을 둔다.
2. 실행하면 자동으로 `METHOD constructor` 내부로 들어가는지 확인한다.
3. `mv_concert`, `mv_perf`, `mv_cap`이 채워진 뒤 `lo_mgr` 참조가 완성되는지 본다.
4. 같은 클래스로 객체를 두 개 만들면 `constructor`가 두 번 실행되는지 확인한다.
5. `class_constructor`에 중단점을 두면 클래스 최초 사용 시 한 번만 실행되는지 확인한다.

Constructor 확인에서 중요한 질문은 "객체가 생성 직후 바로 사용할 수 있는 상태인가?"이다. `remaining( )`을 호출하기 전에 반드시 있어야 하는 값이 constructor에서 채워져야 한다.

### 실수와 주의

첫째, constructor에 너무 무거운 작업을 넣지 않는다. 객체를 만드는 모든 지점이 느려진다. CH20 예제의 capacity 조회는 예약 관리자에게 꼭 필요한 초기 상태라 허용하지만, 대량 통계 조회나 ALV 출력 준비까지 넣으면 생성이 과해진다.

둘째, constructor parameter와 private attribute를 구분한다. `iv_concert`는 생성할 때 전달된 입력값이고, `mv_concert`는 객체가 이후 계속 보관할 상태다.

셋째, 없는 공연 ID 처리는 실제 업무에서는 별도 예외가 필요하다. 다만 CH20-L10에서는 CH15 선택화면 검증에서 존재하지 않는 공연 ID를 이미 막았다고 가정하고, 정원 초과 예외에 집중한다.

넷째, static constructor를 객체 초기화 용도로 쓰지 않는다. `class_constructor`는 클래스 전체에 한 번 실행되므로 객체마다 다른 공연 ID나 회차를 담을 수 없다.

### 체험형 학습 설계

**실습 장치: Constructor Timeline**

데이터:
- 입력값: `iv_concert = C001`, `iv_perf = 01`
- DB 조회 결과: `capacity = 100`
- 객체 상태: `mv_concert`, `mv_perf`, `mv_cap`
- 실행 카운터: `constructorCount`, `classConstructorCount`

버튼:
- `객체 1 생성`: 첫 번째 manager를 만든다.
- `객체 2 생성`: 같은 클래스의 두 번째 manager를 만든다.
- `class method 호출`: 객체 없이 정적 메서드를 호출해 class constructor 실행을 관찰한다.
- `초기화 누락 비교`: constructor 없는 설계를 보여 주고 누락 위험을 표시한다.

피드백:
- 객체 생성 버튼을 누르면 `NEW -> constructor -> private state 채움 -> reference 반환` 순서가 타임라인으로 표시된다.
- 두 번째 객체 생성 시 `constructorCount`는 증가하지만 `classConstructorCount`는 증가하지 않는 차이를 보여 준다.
- `iv_concert`만 받고 `mv_concert`에 대입하지 않은 코드를 선택하면 "입력값은 사라지고 객체 상태가 비어 있음"이라고 표시한다.

### 정리

CH20-L03의 핵심은 객체가 태어날 때 필요한 상태를 반드시 준비시키는 것이다. `constructor`는 객체별 초기화, `class_constructor`는 클래스 공용 초기화다. 좋은 constructor는 객체를 즉시 사용 가능한 상태로 만들되, 생성 자체를 지나치게 무겁게 만들지 않는다.

## CH20-L04 · Static Method와 Instance Method

### 왜 필요한가

모든 메서드에 객체가 필요한 것은 아니다. 공연 ID를 대문자로 정리하거나 화면 표시용 문자열을 만드는 작업은 특정 예약 객체의 상태가 없어도 가능하다. 반대로 잔여석 계산은 특정 공연과 회차를 알아야 한다. 객체 상태가 필요하다.

이 둘을 구분하지 않으면 설계가 흐려진다. 객체 상태가 필요한 로직을 static으로 만들면 필요한 값을 계속 parameter로 넘겨야 하고, 상태가 필요 없는 유틸리티를 instance method로 만들면 불필요하게 객체를 생성하게 된다.

### 무엇인가

인스턴스 멤버는 객체마다 존재한다. `METHODS`, `DATA`로 선언하고 `->`로 접근한다.

정적 멤버는 클래스에 하나 존재한다. `CLASS-METHODS`, `CLASS-DATA`로 선언하고 `=>`로 접근한다.

```abap
CLASS zcl_booking_manager DEFINITION
  PUBLIC
  CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS remaining
      RETURNING VALUE(rv_remaining) TYPE i.

    CLASS-METHODS normalize_concert_id
      IMPORTING iv_concert TYPE zconcert-concert_id
      RETURNING VALUE(rv_concert) TYPE zconcert-concert_id.

  PRIVATE SECTION.
    DATA mv_concert TYPE zconcert-concert_id.
    DATA mv_perf    TYPE zbooking-perf_no.
ENDCLASS.
```

호출은 다르다.

```abap
" 인스턴스 메서드: 객체가 필요하다.
DATA(lo_mgr) = NEW zcl_booking_manager(
  iv_concert = 'C001'
  iv_perf    = '01' ).

DATA(lv_remaining) = lo_mgr->remaining( ).

" 정적 메서드: 객체 없이 클래스로 호출한다.
DATA(lv_concert) = zcl_booking_manager=>normalize_concert_id( 'c001' ).
```

메서드 내부에서 자기 객체의 멤버를 가리킬 때 `me->`를 쓴다.

```abap
METHOD remaining.
  SELECT COALESCE( SUM( seats ), 0 )
    FROM zbooking
    WHERE concert_id = @mv_concert
      AND perf_no    = @mv_perf
      AND status    <> 'C'
    INTO @DATA(lv_booked).

  rv_remaining = mv_cap - lv_booked.
ENDMETHOD.
```

`me->`는 대부분 생략할 수 있지만, 지역 변수나 parameter와 이름이 비슷할 때는 의도를 분명히 해 준다.

### 어떻게 확인하는가

정적/인스턴스 차이는 일부러 잘못 호출해 보면 명확하다.

```abap
" 올바름
DATA(lv_id) = zcl_booking_manager=>normalize_concert_id( 'c001' ).

" 올바름
DATA(lv_remaining) = lo_mgr->remaining( ).

" 잘못된 방향: 인스턴스 메서드를 클래스명으로 호출
" DATA(lv_bad) = zcl_booking_manager=>remaining( ).
```

디버거에서는 `remaining( )` 안에서 `me`가 현재 객체를 가리키는지 확인한다. 반대로 static method 안에는 자기 객체가 없으므로 `me->`를 사용할 수 없다.

### 실수와 주의

첫째, 객체 상태를 읽는 메서드는 static으로 만들지 않는다. 잔여석은 공연과 회차에 따라 달라지므로 객체 상태가 필요하다.

둘째, 단순 helper를 모두 instance method로 만들지 않는다. 특정 객체 상태가 필요 없는 포맷 변환은 static method가 더 자연스럽다.

셋째, static data를 전역 변수처럼 남용하지 않는다. `CLASS-DATA`는 여러 객체가 공유하므로 한 객체의 변경이 다른 객체에도 영향을 줄 수 있다.

넷째, `=>`와 `->`를 기계적으로 외우지 말고 왼쪽에 무엇이 오는지 본다. 클래스명이 왼쪽이면 `=>`, 참조 변수가 왼쪽이면 `->`다.

### 체험형 학습 설계

**실습 장치: Arrow Selector Trainer**

데이터:
- 호출 대상 카드: `zcl_booking_manager`, `lo_mgr`
- 멤버 카드: `remaining( )`, `normalize_concert_id( )`, `mv_concert`, `gv_version`
- 상태: `leftSideType = class | objectReference`, `memberKind = static | instance`, `selector = => | ->`

버튼:
- `객체 생성`: `lo_mgr`를 bound 상태로 만든다.
- `=> 선택`: class component selector를 선택한다.
- `-> 선택`: object component selector를 선택한다.
- `호출 검사`: 선택한 조합이 문법적으로 맞는지 확인한다.
- `me-> 보기`: instance method 내부 시점으로 전환한다.

피드백:
- `zcl_booking_manager->remaining( )` 조합에는 "클래스명 뒤에는 object selector를 붙일 수 없음"이라고 표시한다.
- `lo_mgr=>remaining( )` 조합에는 "참조 변수 뒤에는 class selector를 붙일 수 없음"이라고 표시한다.
- static method 내부에서 `me->`를 누르면 "static context에는 현재 객체가 없음"이라고 표시한다.

### 정리

CH20-L04의 핵심은 객체 상태가 필요한지 묻는 것이다. 객체별 상태를 읽거나 바꾸면 instance method, 객체와 무관한 공용 기능이면 static method다. `->`, `=>`, `me->`는 그 설계 판단이 코드에 드러난 결과다.

## CH20-L05 · Interface 기본 설계

### 왜 필요한가

상속은 "비슷한 종류"를 확장할 때 유용하다. 하지만 실제 업무에서는 종류가 달라도 같은 약속을 지켜야 하는 경우가 많다.

예를 들어 예매 내역, 공연 정보, 오류 로그는 서로 다른 클래스일 수 있다. 그런데 화면이나 로그 파일에 출력할 수 있다는 점은 같다. 이때 모든 클래스를 같은 부모에서 상속시키는 것은 억지다. 필요한 것은 "출력할 수 있다"는 규약이다.

Interface는 이 규약을 정의한다. 클래스의 내부 구현은 달라도 같은 interface를 구현하면 호출자는 같은 방식으로 다룰 수 있다.

### 무엇인가

Interface는 공개 규약이다. 메서드 이름과 parameter를 선언하지만 일반적인 의미의 구현부는 없다.

```abap
INTERFACE zif_printable PUBLIC.
  METHODS print.
ENDINTERFACE.
```

클래스는 `INTERFACES` 문으로 그 규약을 구현한다고 선언한다.

```abap
CLASS zcl_booking DEFINITION
  PUBLIC
  CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES zif_printable.
ENDCLASS.

CLASS zcl_booking IMPLEMENTATION.
  METHOD zif_printable~print.
    WRITE: / '예매 내역 출력'.
  ENDMETHOD.
ENDCLASS.
```

인터페이스 메서드 구현 이름에는 `인터페이스~메서드` 형식이 쓰인다. 클래스 참조로 호출할 때도 같은 방식으로 명시할 수 있다.

```abap
DATA(lo_booking) = NEW zcl_booking( ).

lo_booking->zif_printable~print( ).
```

인터페이스 참조 변수로 받으면 호출자는 실제 클래스가 무엇인지 몰라도 interface의 메서드를 부를 수 있다.

```abap
DATA lo_printable TYPE REF TO zif_printable.

lo_printable = NEW zcl_booking( ).
lo_printable->print( ).
```

이것이 다형성의 기반이다. 호출자는 "이 객체가 출력 가능하다"는 약속만 보고 사용한다.

### 어떻게 확인하는가

확인은 두 방향으로 한다.

1. `INTERFACES zif_printable`를 선언하고 `zif_printable~print` 구현을 일부러 빼 본다. 활성화가 실패해야 한다.
2. `TYPE REF TO zif_printable` 변수에 `zcl_booking` 객체를 넣고 `print( )`가 실행되는지 확인한다.

이 확인에서 중요한 점은 호출자가 구체 클래스 타입이 아니라 interface 타입으로도 객체를 사용할 수 있다는 것이다. 클래스 이름에 덜 묶일수록 나중에 구현 교체가 쉬워진다.

### 실수와 주의

첫째, interface를 "빈 부모 클래스"처럼 사용하지 않는다. Interface는 상태를 상속받기 위한 도구가 아니라 외부 규약을 고정하기 위한 도구다.

둘째, 구현 메서드 이름에서 `~`를 빼먹지 않는다.

```abap
" 잘못된 구현 이름
" METHOD print.

" 올바른 구현 이름
METHOD zif_printable~print.
ENDMETHOD.
```

셋째, interface에 너무 많은 메서드를 넣지 않는다. `zif_printable`이라면 출력에 필요한 약속만 있어야 한다. 예매, 취소, 검증까지 모두 넣으면 구현 클래스가 불필요한 의무를 떠안는다.

넷째, interface reference로 볼 수 있는 것은 interface에 선언된 component다. 구체 클래스 전용 메서드는 interface 참조만으로는 바로 보이지 않는다.

### 체험형 학습 설계

**실습 장치: Contract Board**

데이터:
- Interface 카드: `ZIF_PRINTABLE`
- 구현 클래스 카드: `ZCL_BOOKING`, `ZCL_CONCERT_INFO`, `ZCL_ERROR_LOG`
- 메서드 약속: `print( )`
- 상태: `implementedMethods`, `activationStatus`, `referenceType`

버튼:
- `규약 만들기`: interface에 `print( )`를 추가한다.
- `클래스에 구현 선언`: `INTERFACES zif_printable`를 삽입한다.
- `구현 누락`: `zif_printable~print`를 제거해 활성화 실패를 본다.
- `인터페이스 참조로 호출`: `TYPE REF TO zif_printable`에서 `print( )`를 실행한다.
- `구체 메서드 호출 시도`: interface에 없는 `vip_only( )` 호출을 시도한다.

피드백:
- 구현 누락 시 "규약을 받았으면 모든 필수 메서드를 구현해야 함"이라고 표시한다.
- 클래스 참조 호출과 interface 참조 호출을 비교해 "`lo_booking`은 구체 클래스, `lo_printable`은 규약 관점"이라고 설명한다.
- interface가 비대해지면 "이 규약을 구현하는 모든 클래스가 해당 메서드를 책임져야 함"이라고 경고한다.

### 정리

CH20-L05의 핵심은 같은 부모가 아니라 같은 약속으로 객체를 묶는 것이다. Interface는 구현을 강제하는 공개 계약이고, `INTERFACES`와 `intf~method`가 그 계약을 클래스에 연결한다. 이 개념은 다음 레슨의 예외, 뒤 레슨의 다형성, CH21 이후 이벤트/ALV 처리의 기반이 된다.

## CH20-L06 · Exception Class: TRY / CATCH / CX 계층

### 왜 필요한가

절차적 코드에서는 오류를 숫자 코드나 메시지로 처리하는 경우가 많다.

```abap
IF iv_seats > lv_remaining.
  MESSAGE '매진입니다' TYPE 'E'.
ENDIF.
```

이 방식은 간단하지만 로직 재사용에는 문제가 있다. 예약 관리 클래스가 직접 화면 메시지를 띄우면, 같은 로직을 배치 프로그램이나 테스트에서 쓰기 어렵다. 또 호출자는 무엇이 실패했는지 구조적으로 구분하기 어렵다.

예외는 오류를 객체로 전달한다. `ZCL_BOOKING_MANAGER`는 "정원 초과라서 예약할 수 없다"는 사실을 `ZCX_FULLY_BOOKED` 예외로 던지고, 호출자는 화면, 배치, 테스트 상황에 맞게 잡아서 처리한다.

### 무엇인가

예외 클래스는 오류 상황을 표현하는 클래스다. CH20에서는 `ZCX_FULLY_BOOKED`를 SE24에서 만들고 `CX_STATIC_CHECK`를 상속한다고 가정한다.

예약 메서드는 발생 가능한 예외를 signature에 선언한다.

```abap
CLASS zcl_booking_manager DEFINITION
  PUBLIC
  CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS book
      IMPORTING iv_seats TYPE i
      RAISING   zcx_fully_booked.
ENDCLASS.
```

메서드 내부에서 조건이 맞지 않으면 예외를 던진다.

```abap
METHOD book.
  IF iv_seats > me->remaining( ).
    RAISE EXCEPTION TYPE zcx_fully_booked.
  ENDIF.

  " 실제 INSERT는 CH24 DML에서 다룬다.
ENDMETHOD.
```

호출자는 `TRY/CATCH`로 잡는다.

```abap
TRY.
    lo_mgr->book( iv_seats = 100 ).

  CATCH zcx_fully_booked INTO DATA(lx_booked).
    MESSAGE lx_booked->get_text( ) TYPE 'I'.

  CLEANUP.
    " 예외로 현재 TRY 블록의 context가 정리될 때 필요한 후처리
ENDTRY.
```

ABAP의 class-based exception은 계층을 가진다.

| 계층 | 의미 | 입문자 판단 기준 |
|---|---|---|
| `CX_STATIC_CHECK` | syntax check가 처리/선언을 강하게 요구 | 업무상 예상 가능한 복구 오류에 적합 |
| `CX_DYNAMIC_CHECK` | 선언은 필요하지만 일부 검사가 런타임 중심 | 동적 상황에서 발생할 수 있는 오류 |
| `CX_NO_CHECK` | 처리 강제를 하지 않음 | 어디서나 발생 가능하거나 강제 처리 부적절한 오류 |
| `CX_ROOT` | 모든 class-based exception의 상위 | `get_text( )` 같은 공통 기능의 기반 |

`RESUME`은 resumable exception을 잡은 뒤 발생 지점 이후로 재개하는 문장이다. 공식 문서상 `CATCH BEFORE UNWIND`와 `RESUMABLE` 조건이 필요하다. CH20에서는 존재와 제약을 알고 넘어가되, 일반 업무 예외 처리의 기본 패턴으로 쓰지 않는다.

### 어떻게 확인하는가

확인은 정상 흐름과 실패 흐름을 나눠 한다.

```abap
TRY.
    lo_mgr->book( iv_seats = 2 ).
    WRITE: / '예약 가능'.

  CATCH zcx_fully_booked INTO DATA(lx_booked).
    WRITE: / lx_booked->get_text( ).
ENDTRY.
```

1. 잔여석보다 작은 좌석 수를 넣으면 `CATCH`로 가지 않고 정상 메시지가 출력되어야 한다.
2. 잔여석보다 큰 좌석 수를 넣으면 `RAISE EXCEPTION` 줄에서 `CATCH zcx_fully_booked`로 이동해야 한다.
3. `CATCH cx_root`를 먼저 쓰고 그 뒤에 `CATCH zcx_fully_booked`를 두면 더 구체적인 handler가 도달 불가능해진다는 점을 확인한다. CATCH는 구체 예외부터 일반 예외 순서로 둔다.
4. `book` signature에서 `RAISING zcx_fully_booked`를 빼면 `CX_STATIC_CHECK` 계열 예외 전파가 interface 위반이 될 수 있음을 확인한다.

### 실수와 주의

첫째, 예외를 던지는 메서드와 메시지를 띄우는 위치를 섞지 않는다. 클래스는 업무 실패를 예외로 알리고, 화면 프로그램은 그 예외를 사용자 메시지로 바꾼다.

둘째, 무조건 `CATCH cx_root`로 삼키지 않는다.

```abap
TRY.
    lo_mgr->book( iv_seats = 100 ).
  CATCH cx_root.
    " 모든 오류를 같은 방식으로 숨김
ENDTRY.
```

이렇게 하면 실제로 무엇이 실패했는지 사라진다. 먼저 구체 예외를 잡고, 정말 필요한 경계에서만 `cx_root`를 사용한다.

셋째, `CLEANUP`을 finally처럼 오해하지 않는다. ABAP의 `CLEANUP`은 TRY 블록의 context가 예외로 정리될 때 실행되는 블록이다. 일반적으로 항상 실행되는 후처리 패턴과 동일하게 설명하면 오해가 생긴다.

넷째, `RESUME`을 일반 복구 흐름처럼 쓰지 않는다. `RESUME`은 resumable exception이라는 특수 조건이 있을 때만 의미가 있다.

### 체험형 학습 설계

**실습 장치: Exception Flow Console**

데이터:
- 입력: `iv_seats = 2 | 100`
- 잔여석: `remaining = 40`
- 예외 클래스: `ZCX_FULLY_BOOKED`, `CX_ROOT`
- 상태: `tryState`, `raisedException`, `caughtBy`, `cleanupExecuted`

버튼:
- `정상 예약`: `iv_seats = 2`로 실행한다.
- `정원 초과`: `iv_seats = 100`으로 실행한다.
- `CATCH 순서 바꾸기`: `cx_root`를 먼저 두었을 때 경고를 표시한다.
- `RAISING 제거`: method signature에서 예외 선언을 제거한 상태를 보여 준다.
- `CLEANUP 관찰`: 잡히지 않은 예외가 바깥 TRY로 전파될 때 cleanup 표시를 켠다.

피드백:
- 정상 흐름은 `TRY -> book -> 정상 복귀`로 표시된다.
- 실패 흐름은 `TRY -> book -> RAISE -> CATCH zcx_fully_booked`로 표시된다.
- `cx_root`가 먼저 있으면 "상위 예외가 먼저 잡으면 하위 예외 handler가 의미 없어짐"이라고 표시한다.
- `RESUME` 버튼은 잠겨 있고 "resumable exception과 BEFORE UNWIND를 배운 뒤에만 사용"이라고 설명한다.

### 정리

CH20-L06의 핵심은 오류를 메시지나 숫자 코드가 아니라 객체로 전달하는 것이다. 예외를 던지는 쪽은 업무 실패를 명확한 예외 클래스로 표현하고, 호출자는 `TRY/CATCH`로 상황에 맞게 처리한다. 예외 계층과 CATCH 순서를 이해하면 이후 ALV, Gateway, RAP의 오류 처리도 더 안정적으로 읽을 수 있다.

## CH20-L07 · Inheritance / Redefinition

### 왜 필요한가

모든 차이를 복사-붙여넣기로 해결하면 클래스가 늘어날수록 유지보수가 무너진다. 일반 예매와 VIP 예매가 대부분 같고 일부 규칙만 다르다고 하자. 두 클래스를 처음부터 따로 만들면 잔여석 계산, 정원 초과 예외, 공연/회차 상태 보관 같은 공통 로직이 중복된다.

상속은 공통 부분을 부모 클래스에 두고, 차이만 자식 클래스에서 확장하게 해 준다.

### 무엇인가

ABAP 클래스는 단일 상속이다. 한 클래스는 직접 부모를 하나만 가질 수 있다. 자식 클래스는 `INHERITING FROM`으로 부모 클래스를 지정한다.

```abap
CLASS zcl_vip_booking DEFINITION
  PUBLIC
  INHERITING FROM zcl_booking_manager
  CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS book REDEFINITION.
ENDCLASS.
```

부모의 인스턴스 메서드를 새 구현으로 바꾸려면 `REDEFINITION`을 선언한다.

```abap
CLASS zcl_vip_booking IMPLEMENTATION.
  METHOD book.
    IF iv_seats > 4.
      RAISE EXCEPTION TYPE zcx_fully_booked.
    ENDIF.

    super->book( iv_seats = iv_seats ).
  ENDMETHOD.
ENDCLASS.
```

`super->book( )`은 부모 클래스의 원래 구현을 호출한다. 자식이 전체 로직을 완전히 대체할 수도 있지만, 많은 경우 자식의 추가 검사를 한 뒤 부모의 기본 동작을 재사용한다.

`ABSTRACT`와 `FINAL`은 상속 설계의 경계를 드러낸다.

| 키워드 | 의미 | 예 |
|---|---|---|
| `ABSTRACT` | 직접 객체를 만들 수 없고 상속을 위한 틀로 둔다 | 공통 예약 정책의 추상 부모 |
| `FINAL` | 더 이상 상속하거나 재정의하지 못하게 막는다 | 더 확장하면 안 되는 완성 클래스 |

기존 임베드 `CH20-L07-S01`은 상속 계층과 `REDEFINITION`, `super->` 관계를 보여 주는 자료로 사용한다.

::embed CH20-L07-S01 | 부모-자식 클래스 상속 계층::

### 어떻게 확인하는가

확인은 "정적 타입"과 "동적 타입"을 나눠 본다.

```abap
DATA lo_mgr TYPE REF TO zcl_booking_manager.

lo_mgr = NEW zcl_vip_booking(
  iv_concert = 'C001'
  iv_perf    = '01' ).

lo_mgr->book( iv_seats = 2 ).
```

변수 `lo_mgr`의 정적 타입은 `zcl_booking_manager`다. 그러나 실제 객체의 동적 타입은 `zcl_vip_booking`이다. `book`이 재정의되어 있으면, 호출은 자식의 `book` 구현으로 들어간다. 이것을 디버거로 확인한다.

`super->book( )` 줄에 중단점을 두면 자식 구현에서 부모 구현으로 이동하는 순간을 볼 수 있다.

### 실수와 주의

첫째, `REDEFINITION` 없이 부모 메서드를 바꾸려 하지 않는다. 부모 메서드를 재정의하려면 class definition에 `METHODS book REDEFINITION.`이 있어야 한다.

둘째, private component는 자식에서 직접 접근할 수 없다. 부모가 자식에게 열어 줄 의도가 있는 component는 protected로 설계해야 한다. 그렇지 않으면 부모의 public/protected method를 통해 접근한다.

셋째, 상속으로 모든 변형을 해결하지 않는다. "VIP 예매는 예약 관리자의 특수한 종류"라면 상속이 자연스럽지만, "출력 가능하다", "검증 가능하다" 같은 횡단 규약은 interface가 더 적합할 수 있다.

넷째, `super->` 호출을 무조건 넣거나 무조건 빼지 않는다. 부모 동작을 유지하면서 앞뒤로 추가 규칙을 넣을지, 부모 동작을 완전히 대체할지 설계 의도를 먼저 정한다.

### 체험형 학습 설계

**실습 장치: Redefinition Stepper**

데이터:
- 부모 클래스: `ZCL_BOOKING_MANAGER`
- 자식 클래스: `ZCL_VIP_BOOKING`
- 메서드: `book( iv_seats )`
- 상태: `staticType`, `dynamicType`, `currentMethod`, `superCalled`

버튼:
- `부모 객체 생성`: `NEW zcl_booking_manager( )`
- `자식 객체 생성`: `NEW zcl_vip_booking( )`
- `부모 타입 변수에 자식 담기`: upcast 상태를 만든다.
- `book 실행`: 실제로 어느 구현으로 들어가는지 표시한다.
- `super 호출 켜기/끄기`: 부모 로직 재사용 여부에 따른 흐름 차이를 보여 준다.

피드백:
- 부모 타입 변수에 자식 객체를 담아도 자식의 재정의 메서드가 실행되면 "정적 타입보다 동적 타입의 구현이 실행됨"이라고 표시한다.
- `super->book( )`을 끄면 "부모의 정원 초과 검증을 재사용하지 않음"이라고 경고한다.
- 부모 private 속성 직접 접근을 시도하면 "private은 하위 클래스에서도 보이지 않음"이라고 표시한다.

### 정리

CH20-L07의 핵심은 공통 로직과 차이 나는 로직을 나누는 것이다. `INHERITING FROM`은 부모를 물려받고, `REDEFINITION`은 필요한 메서드만 새로 구현하며, `super->`는 부모 구현을 명시적으로 재사용한다. 상속은 강력하지만 결합도도 높이므로, "종류의 확장"일 때 신중하게 사용한다.

## CH20-L08 · 다형성: CAST와 CASE TYPE OF

### 왜 필요한가

상속과 interface를 쓰면 여러 실제 객체를 하나의 부모 타입 또는 interface 타입으로 다룰 수 있다. 이것이 다형성이다.

```abap
DATA lo_mgr TYPE REF TO zcl_booking_manager.

lo_mgr = NEW zcl_vip_booking(
  iv_concert = 'C001'
  iv_perf    = '01' ).

lo_mgr->book( iv_seats = 2 ).
```

호출자는 `lo_mgr`가 일반 예약 관리자인지 VIP 예약 관리자인지 몰라도 `book( )`을 호출할 수 있다. 이것은 좋은 설계다. 그런데 가끔 실제 타입 전용 기능이 필요할 때가 있다. 예를 들어 VIP 전용 쿠폰 메서드 `apply_vip_coupon( )`은 부모 타입에는 없다.

이때 CAST와 `CASE TYPE OF`가 필요하다.

### 무엇인가

Upcast는 자식 객체를 부모 타입 참조에 담는 것이다. 대개 자연스럽게 가능하다.

```abap
DATA lo_mgr TYPE REF TO zcl_booking_manager.

lo_mgr = NEW zcl_vip_booking(
  iv_concert = 'C001'
  iv_perf    = '01' ).
```

Downcast는 부모 타입으로 보고 있던 참조를 더 구체적인 자식 타입으로 내려 보는 것이다.

```abap
TRY.
    DATA(lo_vip) = CAST zcl_vip_booking( lo_mgr ).
    lo_vip->apply_vip_coupon( ).

  CATCH cx_sy_move_cast_error.
    MESSAGE 'VIP 예약 객체가 아닙니다.' TYPE 'I'.
ENDTRY.
```

classic downcast 문법은 `?=`다.

```abap
DATA lo_vip TYPE REF TO zcl_vip_booking.

lo_vip ?= lo_mgr.
```

실제 객체 타입이 맞지 않으면 downcast는 실패하고 `CX_SY_MOVE_CAST_ERROR`가 발생한다. 따라서 무조건 CAST하기보다 타입을 먼저 확인하는 흐름이 필요하다.

`CASE TYPE OF`는 객체의 실제 타입에 따라 분기한다.

```abap
CASE TYPE OF lo_mgr.
  WHEN TYPE zcl_vip_booking INTO DATA(lo_vip_case).
    lo_vip_case->apply_vip_coupon( ).

  WHEN TYPE zcl_booking_manager INTO DATA(lo_base_case).
    lo_base_case->book( iv_seats = 1 ).

  WHEN OTHERS.
    MESSAGE '처리할 수 없는 예약 객체입니다.' TYPE 'I'.
ENDCASE.
```

공식 문서 기준으로 `WHEN TYPE ... INTO ...`는 타입이 맞을 때 해당 참조를 target에 대입해 준다. 즉 타입 검사와 안전한 참조 확보를 한 번에 한다.

### 어떻게 확인하는가

두 개의 객체로 테스트한다.

```abap
DATA lo_mgr TYPE REF TO zcl_booking_manager.

lo_mgr = NEW zcl_vip_booking(
  iv_concert = 'C001'
  iv_perf    = '01' ).

" 성공해야 하는 downcast
DATA(lo_vip) = CAST zcl_vip_booking( lo_mgr ).
```

그리고 일반 예약 객체를 넣어 실패를 확인한다.

```abap
lo_mgr = NEW zcl_booking_manager(
  iv_concert = 'C001'
  iv_perf    = '01' ).

TRY.
    DATA(lo_wrong) = CAST zcl_vip_booking( lo_mgr ).

  CATCH cx_sy_move_cast_error.
    WRITE: / 'downcast 실패'.
ENDTRY.
```

디버거에서는 참조 변수의 static type과 dynamic type을 함께 확인한다. CAST는 static type을 바꾸는 문법처럼 보이지만, 실제 객체의 dynamic type이 맞아야 성공한다.

### 실수와 주의

첫째, CAST를 설계 도구처럼 남용하지 않는다. 타입별 분기가 계속 늘어난다면 공통 interface나 재정의 메서드로 해결할 수 없는지 먼저 본다.

둘째, downcast 실패를 무시하지 않는다. 운영 코드에서 실제 타입이 확실하지 않다면 `TRY/CATCH cx_sy_move_cast_error` 또는 `CASE TYPE OF`를 사용한다.

셋째, `CASE TYPE OF`의 순서는 구체 타입부터 둔다. 부모 타입을 먼저 두면 자식 객체도 부모 조건에 걸려 자식 전용 분기까지 내려가지 못할 수 있다.

넷째, interface reference에서도 같은 관점이 필요하다. interface로 공통 기능을 호출하는 것은 좋지만, 구체 클래스 전용 기능이 필요해지는 순간 결합도가 높아진다.

### 체험형 학습 설계

**실습 장치: Dynamic Type Inspector**

데이터:
- 객체 후보: `ZCL_BOOKING_MANAGER`, `ZCL_VIP_BOOKING`
- 참조 변수: `lo_mgr TYPE REF TO zcl_booking_manager`
- 타입 정보: `staticType`, `dynamicType`
- 상태: `castTarget`, `castResult`, `caughtException`

버튼:
- `일반 객체 담기`: `lo_mgr = NEW zcl_booking_manager( )`
- `VIP 객체 담기`: `lo_mgr = NEW zcl_vip_booking( )`
- `CAST 실행`: `CAST zcl_vip_booking( lo_mgr )`
- `?= 실행`: classic downcast를 보여 준다.
- `CASE TYPE OF 실행`: 분기 결과와 `INTO DATA(...)` target을 표시한다.
- `공통 메서드로 해결`: CAST 없이 `book( )` 재정의가 실행되는 흐름을 보여 준다.

피드백:
- VIP 객체일 때 CAST는 성공하고 `apply_vip_coupon( )` 버튼이 활성화된다.
- 일반 객체일 때 CAST는 `CX_SY_MOVE_CAST_ERROR`로 실패한다.
- 타입별 분기가 세 개 이상 늘어나면 "다형성으로 풀 수 있는 설계인지 재검토"라는 설계 피드백을 표시한다.

### 정리

CH20-L08의 핵심은 "부모 타입으로 다루되, 정말 필요할 때만 실제 타입을 확인한다"는 균형이다. 다형성의 기본은 공통 메서드 호출이고, CAST와 `CASE TYPE OF`는 예외적으로 구체 타입 기능이 필요할 때 쓰는 도구다.

## CH20-L09 · OO 이벤트: EVENTS / RAISE EVENT / SET HANDLER

### 왜 필요한가

객체가 어떤 사건을 외부에 알려야 할 때가 있다. 예약 관리자가 정원 초과를 예외로 던지는 것은 실패 처리다. 반면 "방금 매진 상태가 되었다"는 실패가 아니라 사건이다. 누군가는 이 사건을 듣고 ALV 행을 빨갛게 표시하거나, 로그를 남기거나, 알림을 띄울 수 있다.

메서드 호출은 호출자가 대상을 알고 직접 부른다. 이벤트는 반대에 가깝다. 발생시키는 객체는 누가 들을지 모른다. 관심 있는 객체가 미리 handler를 등록해 두고, 사건이 발생하면 반응한다. 이 구조는 CH21 이후 ALV 이벤트를 이해하는 기반이다.

### 무엇인가

이벤트는 클래스의 public interface 일부로 선언한다.

```abap
CLASS zcl_booking_manager DEFINITION
  PUBLIC
  CREATE PUBLIC.
  PUBLIC SECTION.
    EVENTS sold_out
      EXPORTING
        VALUE(iv_concert) TYPE zconcert-concert_id
        VALUE(iv_perf)    TYPE zbooking-perf_no.

    METHODS book
      IMPORTING iv_seats TYPE i
      RAISING   zcx_fully_booked.
ENDCLASS.
```

이벤트 발생은 메서드 안에서 `RAISE EVENT`로 한다.

```abap
METHOD book.
  DATA(lv_remaining) = me->remaining( ).

  IF iv_seats > lv_remaining.
    RAISE EXCEPTION TYPE zcx_fully_booked.
  ENDIF.

  IF iv_seats = lv_remaining.
    RAISE EVENT sold_out
      EXPORTING
        iv_concert = mv_concert
        iv_perf    = mv_perf.
  ENDIF.
ENDMETHOD.
```

반응하는 쪽은 event handler method를 선언한다.

```abap
CLASS zcl_booking_monitor DEFINITION
  PUBLIC
  CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS on_sold_out
      FOR EVENT sold_out OF zcl_booking_manager
      IMPORTING iv_concert iv_perf sender.
ENDCLASS.

CLASS zcl_booking_monitor IMPLEMENTATION.
  METHOD on_sold_out.
    MESSAGE |{ iv_concert }/{ iv_perf } 매진| TYPE 'I'.
  ENDMETHOD.
ENDCLASS.
```

마지막으로 `SET HANDLER`로 어떤 객체의 이벤트를 들을지 등록한다.

```abap
DATA(lo_mgr) = NEW zcl_booking_manager(
  iv_concert = 'C001'
  iv_perf    = '01' ).

DATA(lo_monitor) = NEW zcl_booking_monitor( ).

SET HANDLER lo_monitor->on_sold_out FOR lo_mgr.
```

흐름은 네 단계다.

1. `EVENTS`로 사건 이름과 전달값을 선언한다.
2. `FOR EVENT`로 handler method를 선언한다.
3. `SET HANDLER`로 handler를 특정 발생 객체에 등록한다.
4. `RAISE EVENT`가 실행되면 등록된 handler가 동기적으로 호출된다.

### 어떻게 확인하는가

확인은 handler 등록 전후를 비교한다.

```abap
" 1단계: handler 등록 없이 실행
lo_mgr->book( iv_seats = lv_remaining ).

" 2단계: handler 등록 후 실행
SET HANDLER lo_monitor->on_sold_out FOR lo_mgr.
lo_mgr->book( iv_seats = lv_remaining ).
```

이벤트는 handler가 없어도 발생할 수 있다. 다만 아무도 듣지 않으면 눈에 보이는 반응이 없다. `SET HANDLER` 후에는 `on_sold_out` 메서드에 중단점을 걸어 이벤트 발생 직후 handler가 호출되는지 확인한다.

공식 문서 기준으로 등록된 이벤트 핸들러는 `RAISE EVENT` 뒤, 다음 문장이 처리되기 전에 동기적으로 실행된다. handler가 여러 개이면 호출 순서는 정의되지 않는다.

### 실수와 주의

첫째, `SET HANDLER`를 빼먹으면 이벤트가 발생해도 handler가 실행되지 않는다. 이벤트 선언과 handler 선언만으로 연결되는 것이 아니다.

둘째, 이벤트를 예외처럼 쓰지 않는다. 실패를 중단하고 호출자에게 처리 책임을 넘겨야 하면 예외가 맞다. 단지 어떤 일이 일어났다고 알리는 것은 이벤트가 맞다.

셋째, handler 실행 순서에 의존하지 않는다. 여러 handler가 등록될 수 있고 순서는 정의되지 않는다. 순서가 꼭 필요하다면 하나의 handler에서 명시적으로 순서 있는 메서드 호출을 구성한다.

넷째, handler 객체도 참조로 등록된다. 등록된 handler 객체는 등록되어 있는 동안 생명주기와 연결될 수 있으므로 불필요한 등록을 오래 유지하지 않도록 주의한다.

### 체험형 학습 설계

**실습 장치: Event Wiring Panel**

데이터:
- 발생 객체: `lo_mgr`
- handler 객체: `lo_monitor`, `lo_logger`
- 이벤트: `sold_out`
- 전달값: `iv_concert`, `iv_perf`, `sender`
- 상태: `handlerRegistered`, `raisedEvents`, `handlerCallLog`

버튼:
- `이벤트 선언 보기`: `EVENTS sold_out` 코드를 펼친다.
- `핸들러 선언 보기`: `FOR EVENT sold_out OF ...` 코드를 펼친다.
- `SET HANDLER 등록`: monitor를 `lo_mgr`에 연결한다.
- `매진 발생`: `RAISE EVENT sold_out`을 실행한다.
- `핸들러 하나 더 등록`: logger를 추가해 다중 handler를 체험한다.
- `등록 해제`: `ACTIVATION abap_false` 개념을 예고 수준으로 보여 준다.

피드백:
- 등록 전 매진 발생에는 "이벤트는 발생했지만 등록된 handler가 없음"이라고 표시한다.
- 등록 후 매진 발생에는 `RAISE EVENT -> on_sold_out` 호출 로그가 추가된다.
- handler가 둘이면 "여러 handler의 호출 순서는 보장하지 않음"이라는 경고를 띄운다.
- 예외 버튼과 비교해 "예외는 실패 전달, 이벤트는 사건 알림"을 구분한다.

### 정리

CH20-L09의 핵심은 객체 간 결합을 낮추는 사건 알림 구조다. 이벤트 발생자는 누가 반응할지 몰라도 되고, handler는 관심 있는 이벤트에 등록해 반응한다. `EVENTS`, `RAISE EVENT`, `FOR EVENT`, `SET HANDLER` 네 요소가 함께 있어야 동작한다.

## CH20-L10 · 실습: ZCL_BOOKING_MANAGER 클래스

### 왜 필요한가

CH20의 마지막 실습은 앞 레슨의 문법을 하나의 업무 클래스에 모으는 단계다. 목표는 멋진 OO 코드를 많이 쓰는 것이 아니다. CH10에서 절차적으로 만들었던 잔여석/예매 가능 판단을 `ZCL_BOOKING_MANAGER`라는 객체로 캡슐화하고, 실패는 예외로, 사건은 이벤트로 표현하는 것이다.

다만 실제 예약 행을 `INSERT`하거나 취소 상태를 `UPDATE`하는 것은 CH24 DML의 영역이다. CH20에서는 읽기와 검증, 예외/이벤트 설계까지만 구현한다.

### 무엇인가

완성 목표는 다음 구조다.

::embed CH20-L10-S01 | 클래스의 속성·메서드 구조::

Class definition은 외부 계약과 내부 상태를 나눈다.

```abap
CLASS zcl_booking_manager DEFINITION
  PUBLIC
  CREATE PUBLIC.
  PUBLIC SECTION.
    EVENTS sold_out
      EXPORTING
        VALUE(iv_concert) TYPE zconcert-concert_id
        VALUE(iv_perf)    TYPE zbooking-perf_no.

    METHODS constructor
      IMPORTING
        iv_concert TYPE zconcert-concert_id
        iv_perf    TYPE zbooking-perf_no.

    METHODS remaining
      RETURNING VALUE(rv_remaining) TYPE i.

    METHODS can_book
      IMPORTING iv_seats TYPE i
      RETURNING VALUE(rv_ok) TYPE abap_bool.

    METHODS book
      IMPORTING iv_seats TYPE i
      RAISING   zcx_fully_booked.

  PRIVATE SECTION.
    DATA mv_concert TYPE zconcert-concert_id.
    DATA mv_perf    TYPE zbooking-perf_no.
    DATA mv_cap     TYPE i.
ENDCLASS.
```

Implementation은 상태 초기화, 잔여석 조회, 검증, 예외/이벤트 발생을 맡는다.

```abap
CLASS zcl_booking_manager IMPLEMENTATION.
  METHOD constructor.
    mv_concert = iv_concert.
    mv_perf    = iv_perf.

    SELECT SINGLE capacity
      FROM zconcert
      WHERE concert_id = @iv_concert
      INTO @mv_cap.
  ENDMETHOD.

  METHOD remaining.
    SELECT COALESCE( SUM( seats ), 0 )
      FROM zbooking
      WHERE concert_id = @mv_concert
        AND perf_no    = @mv_perf
        AND status    <> 'C'
      INTO @DATA(lv_booked).

    rv_remaining = mv_cap - lv_booked.
  ENDMETHOD.

  METHOD can_book.
    rv_ok = xsdbool( iv_seats > 0 AND iv_seats <= me->remaining( ) ).
  ENDMETHOD.

  METHOD book.
    DATA(lv_remaining) = me->remaining( ).

    IF iv_seats <= 0 OR iv_seats > lv_remaining.
      RAISE EXCEPTION TYPE zcx_fully_booked.
    ENDIF.

    IF iv_seats = lv_remaining.
      RAISE EVENT sold_out
        EXPORTING
          iv_concert = mv_concert
          iv_perf    = mv_perf.
    ENDIF.

    " 실제 INSERT는 CH24(DML)에서 처리한다.
  ENDMETHOD.
ENDCLASS.
```

호출부는 클래스의 public method만 사용한다.

```abap
DATA(lo_mgr) = NEW zcl_booking_manager(
  iv_concert = 'C001'
  iv_perf    = '01' ).

TRY.
    lo_mgr->book( iv_seats = 2 ).
    MESSAGE '예약 가능' TYPE 'S'.

  CATCH zcx_fully_booked INTO DATA(lx_booked).
    MESSAGE lx_booked->get_text( ) TYPE 'I'.
ENDTRY.
```

이 설계에서 외부 리포트는 정원 `mv_cap`이나 공연 ID `mv_concert`를 직접 바꾸지 않는다. 생성할 때 필요한 값을 넘기고, 이후에는 `remaining( )`, `can_book( )`, `book( )`이라는 public method만 사용한다.

### 어떻게 확인하는가

실습 검증은 다섯 단계로 한다.

1. `ZCX_FULLY_BOOKED` 예외 클래스를 SE24에서 만들고 `CX_STATIC_CHECK`를 상속한다.
2. `ZCL_BOOKING_MANAGER`를 활성화한다.
3. 존재하는 공연 ID/회차로 객체를 생성하고 constructor에서 `mv_concert`, `mv_perf`, `mv_cap`이 채워지는지 확인한다.
4. `remaining( )`을 실행해 `zbooking`의 취소되지 않은 좌석 합계가 정원에서 빠지는지 확인한다.
5. `book( )`에 잔여석보다 큰 값을 넣어 `ZCX_FULLY_BOOKED`가 `CATCH`로 잡히는지 확인한다.

이벤트까지 확인하려면 잔여석과 같은 좌석 수를 넣고 `sold_out` handler가 호출되는지 본다.

```abap
DATA(lo_monitor) = NEW zcl_booking_monitor( ).

SET HANDLER lo_monitor->on_sold_out FOR lo_mgr.

lo_mgr->book( iv_seats = lo_mgr->remaining( ) ).
```

### 실수와 주의

첫째, `book( )`이 실제 DB insert까지 한다고 오해하지 않는다. CH20은 OO 설계 장이고, DML과 LUW는 CH24에서 다룬다. 여기서는 "예약 가능 여부 검증"과 "실패/사건 전달"까지가 경계다.

둘째, `remaining( )`에서 취소 상태를 제외한다. `status = 'C'`인 예매까지 좌석 합계에 넣으면 잔여석이 실제보다 적게 계산된다.

셋째, `can_book( )`과 `book( )`의 기준이 달라지지 않게 한다. 두 메서드가 서로 다른 잔여석 판단을 가지면 호출자는 혼란스러워진다. 가능하면 `book( )`이 내부에서 `remaining( )`을 다시 확인해야 한다.

넷째, 예외 클래스 이름은 업무 상황을 말해야 한다. `ZCX_ERROR`처럼 너무 넓은 이름은 호출자가 실패 이유를 구분하기 어렵다. `ZCX_FULLY_BOOKED`는 정원 초과라는 의미가 분명하다.

다섯째, constructor에서 존재하지 않는 공연 ID를 어떻게 처리할지는 실제 프로젝트 기준을 정해야 한다. 이 실습은 CH15 선택화면 검증으로 존재하지 않는 공연 ID가 걸러진다는 전제에서 진행한다. 운영 설계라면 `ZCX_CONCERT_NOT_FOUND` 같은 별도 예외가 더 적합할 수 있다.

### 체험형 학습 설계

**실습 장치: Booking Manager OO Lab**

데이터:
- `zconcert`: `concert_id`, `capacity`
- `zbooking`: `concert_id`, `perf_no`, `seats`, `status`
- 입력: `iv_concert`, `iv_perf`, `iv_seats`
- 객체 상태: `mv_concert`, `mv_perf`, `mv_cap`
- 계산 상태: `bookedSeats`, `remainingSeats`, `canBook`
- 이벤트/예외 상태: `raisedException`, `raisedEvent`, `handlerLog`

버튼:
- `객체 생성`: constructor를 실행하고 private state를 채운다.
- `잔여석 계산`: `remaining( )` SQL 흐름을 실행한다.
- `예매 가능 검사`: `can_book( )` 결과를 `abap_true/abap_false`로 표시한다.
- `book 실행`: 성공, 정원 초과, 매진 이벤트 세 경로 중 하나를 실행한다.
- `handler 등록`: `SET HANDLER`로 monitor를 연결한다.
- `DML 경계 보기`: 실제 `INSERT`가 CH24로 보류되는 이유를 표시한다.

피드백:
- 정상 좌석 수에는 `book -> success` 흐름과 "아직 DB insert는 하지 않음"을 동시에 표시한다.
- 잔여석 초과에는 `RAISE EXCEPTION TYPE zcx_fully_booked`와 `CATCH` 이동을 시각화한다.
- 잔여석과 같은 좌석 수에는 `RAISE EVENT sold_out`과 handler 로그를 표시한다.
- `status = 'C'` 행을 합계에 넣으려 하면 "취소 예매는 점유 좌석이 아님"이라고 경고한다.
- private attribute를 외부에서 수정하려 하면 "캡슐화 위반: public method로만 다룬다"라고 표시한다.

### 정리

CH20-L10의 핵심은 문법 목록을 하나의 업무 객체로 묶는 것이다. `ZCL_BOOKING_MANAGER`는 constructor로 상태를 받고, private attribute로 보호하며, public method로 잔여석과 예매 가능 여부를 제공하고, 실패는 예외로, 매진 사건은 이벤트로 알린다. 실제 데이터 변경은 CH24로 넘겨 R15 경계를 지킨다.

## CH20 마무리 정리

CH20은 ABAP 개발자가 절차적 코드에서 객체지향 설계로 넘어가는 첫 본격 장이다. 이 챕터에서 배운 문법은 많지만 핵심 질문은 하나다.

> 이 업무 개념은 어떤 상태를 가지고, 어떤 행동을 외부에 제공하며, 어떤 실패와 사건을 어떻게 알리는가?

`ZCL_BOOKING_MANAGER`는 이 질문에 대한 첫 답이다.

- 상태: 공연 ID, 회차, 정원
- 행동: 잔여석 계산, 예매 가능 검사, 예매 요청 검증
- 경계: public method와 private attribute
- 생성: constructor로 필수 상태 초기화
- 실패: `ZCX_FULLY_BOOKED` 예외
- 사건: `sold_out` 이벤트
- 확장: VIP 예약은 상속/재정의 가능
- 규약: 출력/검증 같은 횡단 약속은 interface로 분리 가능
- 타입 처리: 부모/interface 참조와 실제 타입은 CAST/CASE TYPE OF로 확인 가능

다음 CH21에서는 이 OO 기반을 ALV 표시 제어로 가져간다. 특히 이벤트와 객체 참조를 알고 있어야 SALV/ALV의 사용자 동작 처리와 색상/표시 제어를 덜 낯설게 받아들일 수 있다.
