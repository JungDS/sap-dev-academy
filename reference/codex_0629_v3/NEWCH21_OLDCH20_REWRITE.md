# NEWCH21_OLDCH20_REWRITE · OO ABAP 기본 설계

> 주 소스: `content/abap/CH20/_chapter.md`, `content/abap/CH20/CH20-L01.md` ~ `CH20-L10.md`  
> 보조 참고: `reference/codex_0625_v2/CH20_REWRITE.md`, `reference/codex_0625_v2/CH20_QA.md`  
> 목표: CH20을 절차적 ABAP에서 OO ABAP으로 넘어가는 완성 강의자료로 재집필한다. 핵심은 문법 목록이 아니라 "업무 개념을 상태·행동·경계·실패·사건으로 설계하는 눈"이다.

## CH20 전체 설계

CH10에서 학습자는 FORM, Function Module, Local Class를 통해 "코드를 덩어리로 나누는 이유"를 배웠다. CH18에서는 `DATA( )`, `NEW`, string template 같은 modern syntax가 열렸고, CH19에서는 modern ABAP SQL로 조회 문장을 명확히 쓰는 법을 배웠다.

CH20에서는 이 지식을 객체지향 설계로 재배치한다. 콘서트 예매 앱을 예로 들면 `FORM get_remaining`, `FORM check_capacity`, `FORM book_seats`가 흩어져 있는 상태에서 벗어나, `ZCL_BOOKING_MANAGER`라는 업무 객체가 공연 ID, 회차, 정원, 잔여석 계산, 정원 초과 예외, 매진 이벤트를 한 덩어리로 관리하게 만든다.

입문자가 CH20을 끝낸 뒤 답할 수 있어야 하는 질문은 다음이다.

| 질문 | 기대 답 |
|---|---|
| Class와 Object는 어떻게 다른가? | Class는 설계도, Object는 실행 중 만들어진 인스턴스이며 reference variable이 그 객체를 가리킨다. |
| Attribute와 Method는 무엇을 나누는가? | Attribute는 객체가 아는 상태, Method는 객체가 제공하는 행동이다. |
| Visibility는 왜 필요한가? | 외부가 직접 건드려도 되는 것과 내부 규칙으로 보호해야 하는 것을 구분한다. |
| Constructor는 왜 쓰는가? | 객체가 만들어지는 순간 필수 상태를 채워 "사용 가능한 객체"로 만든다. |
| Static과 Instance는 언제 나뉘는가? | 객체별 상태가 필요하면 instance, 객체 없이 공용 기능이면 static이다. |
| Interface와 Inheritance는 어떻게 다른가? | Interface는 따라야 할 규약, Inheritance는 기존 구현을 물려받아 확장하는 관계다. |
| Exception과 Event는 어떻게 다른가? | Exception은 실패를 호출자에게 넘기고, Event는 사건을 관심 객체에 알린다. |
| CAST와 CASE TYPE OF는 언제 쓰는가? | 부모/interface 참조의 실제 객체 타입을 확인해야 할 때만 제한적으로 쓴다. |

## CH20 R15 경계

CH20은 OO ABAP 기본 설계의 L3 정식 도입 장이다. 따라서 앞 챕터에서 `[선행 사용]`으로만 등장했던 `REF TO`, `CREATE OBJECT`, `TRY/CATCH`, `NEW`, `->`, `=>`를 여기서 원리까지 설명한다.

| 구분 | CH20에서 정식 사용 | CH20에서 보류 |
|---|---|---|
| OO 기본 | Global Class, object reference, `NEW`, `CREATE OBJECT`, `->`, `=>`, `me->` | OO 고급 패턴, factory/singleton 심화 |
| 클래스 구조 | `PUBLIC/PROTECTED/PRIVATE`, `DATA`, `CLASS-DATA`, `METHODS`, `CLASS-METHODS` | `FRIENDS`, `ALIASES`, RTTI 심화 |
| 생성 | `constructor`, `class_constructor` | 생성자 체인 고급 설계, dependency injection 패턴화 |
| 규약 | `INTERFACE`, `INTERFACES`, `interface~method` | compound interface 심화 |
| 예외 | `TRY/CATCH/CLEANUP`, `RAISE EXCEPTION`, `RAISING`, `CX_STATIC_CHECK`, `CX_DYNAMIC_CHECK`, `CX_NO_CHECK`, `CX_ROOT`, T100 기반 예외 텍스트 기본, `THROW` expression 기본, `RESUME` 개념 | `IF_T100_DYN_MSG` 전체 활용, `USING MESSAGE`, `PREVIOUS` 체인 분석, `RESUMABLE`/`SHORTDUMP` 심화 |
| 상속/다형성 | `INHERITING FROM`, `REDEFINITION`, `super->`, `ABSTRACT`, `FINAL`, `CAST`, `?=`, `CASE TYPE OF` | 디자인 패턴, mock/test double |
| 이벤트 | `EVENTS`, `RAISE EVENT`, `FOR EVENT`, `SET HANDLER` | ALV 이벤트 심화는 CH21/CH27 |
| 콘서트 앱 | 잔여석 조회, 정원 초과 검증, 예외/이벤트 발생 | 실제 저장·취소 처리, 트랜잭션 제어, CDS/RAP 모델링 |

## 공식 문서 수동 확인 근거

`C:\ABAP_DOCU_HTML`에서 CH20 관련 공식 문서를 수동 확인했다.

| 주제 | 확인 문서 | 반영 포인트 |
|---|---|---|
| 클래스/인터페이스 정의 | `abenclass_interface_definition.htm`, `abapclass_definition.htm`, `abapclass_implementation.htm` | `DEFINITION`과 `IMPLEMENTATION`, repository class 개념 |
| Visibility | `abenclass_visibility.htm` | public/protected/private 접근 범위 |
| 속성/메서드 | `abapclass-data.htm`, `abapclass-methods.htm`, `abapmethods_general.htm` | instance/static component, method parameter, `RAISING` |
| 생성자 | `abapmethods_constructor.htm`, `abapclass-methods_constructor.htm` | instance constructor와 static constructor 구분 |
| 객체 생성/참조 | `abapcreate_object.htm`, `abenconstructor_expression_new.htm`, `abenobject_reference_type.htm` | `CREATE OBJECT`, `NEW`, object reference |
| component selector | `abenobject_component_selector.htm`, `abenclass_component_selector.htm`, `abapcall_method_meth_ident_stat.htm`, `abenme.htm` | `->`, `=>`, `me->` |
| Interface | `abapinterface.htm`, `abapinterfaces.htm`, `abapinterfaces_class.htm` | `INTERFACE`, `INTERFACES`, `interface~method` |
| 예외 | `abaptry.htm`, `abapcatch_try.htm`, `abapcleanup.htm`, `abapraise_exception.htm`, `abapraise_exception_class.htm`, `abapresume.htm` | `TRY/CATCH/CLEANUP`, `RAISE EXCEPTION`, `RESUME` 제한 |
| 예외 계층/텍스트 | `abenabap_exception_classes.htm`, `abenexception_categories.htm`, `abenexception_texts.htm`, `abenexception_texts_t100.htm`, `abenif_t100_message.htm`, `abenif_t100_dyn_msg.htm`, `abapraise_exception_message.htm` | `CX_STATIC_CHECK`, `CX_DYNAMIC_CHECK`, `CX_NO_CHECK`, `CX_ROOT`, `get_text( )`, T100 메시지 기반 exception text |
| `THROW` expression | `abenconditional_expression_result.htm`, `abenabap_exceptions.htm` | `COND`/`SWITCH` 결과 위치에서 예외를 발생시키는 방법, `RAISE EXCEPTION TYPE`과의 경계 |
| 상속/재정의 | `abapclass_options.htm`, `abapmethods_redefinition.htm`, `abapcall_method_meth_super.htm`, `abensingle_inheritance_glosry.htm` | 단일 상속, `REDEFINITION`, `super->` |
| Casting/type case | `abenconstructor_expression_cast.htm`, `abapmove_cast.htm`, `abapcase_type.htm` | `CAST`, `?=`, `CASE TYPE OF ... INTO ...`, `CX_SY_MOVE_CAST_ERROR` |
| 이벤트 | `abenevents.htm`, `abenevents_overview.htm`, `abapevents.htm`, `abapraise_event.htm`, `abapset_handler.htm`, `abapmethods_event_handler.htm` | `EVENTS`, `RAISE EVENT`, `FOR EVENT`, `SET HANDLER` |

## CH20-L01 · Global Class 생성과 객체

### 왜 필요한가

절차적 ABAP에서는 업무 규칙이 쉽게 흩어진다. 콘서트 예매를 예로 들면 어떤 프로그램은 잔여석을 FORM으로 계산하고, 다른 프로그램은 Function Module로 검증하고, 화면 프로그램은 또 다른 로직을 가진다. 처음에는 빠르지만 시간이 지나면 "진짜 예약 규칙이 어디에 있는가?"를 찾기 어려워진다.

OO의 첫 목표는 업무 개념을 코드에 드러내는 것이다. "예약 관리자"라는 개념이 있다면 `ZCL_BOOKING_MANAGER`라는 Class(객체를 만들기 위한 설계도)로 만들고, 그 객체가 예약 관련 상태와 행동을 책임지게 한다.

### 무엇인가

Global Class는 SE24 또는 ADT에서 만드는 repository class다. 여러 프로그램에서 재사용할 수 있다. 클래스 소스는 보통 두 부분으로 읽는다.

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

- `DEFINITION`: 외부 계약과 내부 구성요소를 선언한다.
- `IMPLEMENTATION`: 선언한 Method(객체가 수행하는 행동)의 실제 코드를 작성한다.
- `CREATE PUBLIC`: 외부에서 이 클래스의 객체를 만들 수 있게 한다.

클래스만 있다고 객체가 생기는 것은 아니다. Object(클래스로 만든 실행 중 인스턴스)를 만들어야 한다.

```abap
DATA(lo_mgr) = NEW zcl_booking_manager( ).

lo_mgr->book( iv_seats = 2 ).
```

classic 방식도 읽을 수 있어야 한다.

```abap
DATA lo_mgr TYPE REF TO zcl_booking_manager.

CREATE OBJECT lo_mgr.
lo_mgr->book( iv_seats = 2 ).
```

`lo_mgr`는 객체 자체가 아니라 객체를 가리키는 reference variable이다. 참조 변수가 initial이면 아직 아무 객체도 가리키지 않는다.

### 어떻게 확인하는가

1. SE24 또는 ADT에서 `ZCL_BOOKING_MANAGER`를 만들고 활성화한다.
2. 테스트 리포트에 `DATA(lo_mgr) = NEW zcl_booking_manager( ).`를 작성한다.
3. 해당 줄에 중단점을 걸고 실행한다.
4. 디버거에서 `lo_mgr`가 initial reference에서 object reference로 바뀌는지 확인한다.
5. `lo_mgr->book( )` 호출 시 `book` method 내부로 들어가는지 확인한다.

기존 임베드는 클래스와 객체 관계를 설명하는 핵심 시각 자료로 유지한다.

::embed CH20-L01-S01 | 클래스(설계도)와 객체(인스턴스)의 관계::

### 실수와 주의

- 참조 변수 선언만 하고 객체를 만들지 않은 상태에서 `->`로 호출하면 실패한다.
- 클래스와 객체를 같은 것으로 생각하면 안 된다. 클래스는 설계도이고 객체는 실행 중 만들어진 개별 인스턴스다.
- Global Class는 재사용할 업무 로직에 적합하다. 한 프로그램 안에서만 쓰는 아주 작은 보조 구조라면 Local Class도 가능하다.

### 체험형 학습 설계

**Class-to-Object Builder**

데이터:
- 클래스 카드: `ZCL_BOOKING_MANAGER`
- 객체 슬롯: `lo_mgr`, `lo_mgr2`
- method 카드: `book( iv_seats )`

버튼:
- `클래스 정의 보기`: `DEFINITION`과 `IMPLEMENTATION`을 분리해서 보여 준다.
- `NEW로 객체 생성`: `lo_mgr`를 object reference 상태로 바꾼다.
- `CREATE OBJECT로 생성`: classic 생성 순서를 보여 준다.
- `book 호출`: `lo_mgr->book( )` 흐름을 method body로 이동시킨다.
- `참조 초기화`: `CLEAR lo_mgr` 후 호출 실패를 체험한다.

상태/피드백:
- `referenceState`: initial, bound
- `objectCount`: 생성된 객체 수
- 객체 생성 전 호출 시 "참조 변수는 있지만 객체가 없습니다."라고 표시한다.

### 정리

CH20-L01은 Class, Object, Reference Variable을 분리해서 보는 레슨이다. 클래스는 설계도, 객체는 실행 중 인스턴스, 참조 변수는 객체를 가리키는 손잡이다.

## CH20-L02 · Attribute / Method / Visibility

### 왜 필요한가

클래스가 FORM을 모아 둔 상자에 그치면 객체지향의 장점이 작다. 좋은 클래스는 "무엇을 알고 있는가"와 "무엇을 할 수 있는가"를 함께 설계한다. 예약 관리자는 공연 ID, 회차, 정원 같은 상태를 알고, 잔여석 계산과 예약 가능 검증 같은 행동을 제공해야 한다.

하지만 모든 데이터를 외부에 공개하면 규칙이 깨진다. 외부 프로그램이 정원 속성을 마음대로 바꾸면 `book( )`이 아무리 잘 작성되어도 의미가 없다. 그래서 visibility가 필요하다.

### 무엇인가

Attribute는 객체 또는 클래스가 가진 데이터다. Method는 그 데이터로 수행하는 행동이다.

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

`DATA`는 instance attribute다. 객체마다 따로 값을 가진다. `CLASS-DATA`는 static attribute다. 클래스 하나에 공용으로 묶인다.

Visibility는 접근 범위를 정한다.

| 섹션 | 접근 가능 | 기준 |
|---|---|---|
| `PUBLIC SECTION` | 외부, 자신, 하위 클래스 | 외부가 호출해야 하는 method |
| `PROTECTED SECTION` | 자신과 하위 클래스 | 상속 확장을 위해 열어 둘 내부 계약 |
| `PRIVATE SECTION` | 자신만 | 외부가 직접 바꾸면 안 되는 상태 |

기본 원칙은 단순하다. 데이터는 보통 private, 행동은 필요한 만큼 public이다.

### 어떻게 확인하는가

일부러 private 속성에 접근해 본다.

```abap
DATA(lo_mgr) = NEW zcl_booking_manager( ).

DATA(lv_remaining) = lo_mgr->remaining( ).

" 아래 코드는 외부에서 private attribute에 접근하므로 활성화되어서는 안 된다.
" lo_mgr->mv_cap = 100.
```

정상이라면 runtime까지 가지 않고 syntax check에서 막힌다. visibility는 실행 중 약속이 아니라 컴파일 단계에서 검증되는 경계다.

### 실수와 주의

- 내부 상태를 public으로 열어 두면 캡슐화가 깨진다.
- 모든 것을 private으로 닫으면 외부가 클래스를 사용할 수 없다.
- protected는 "하위 클래스가 의존해도 된다"는 의미이므로 처음부터 남용하지 않는다.
- static attribute는 객체별 상태가 아니므로 예약 관리자처럼 객체마다 다른 상태에는 맞지 않는다.

### 체험형 학습 설계

**Visibility Gate Simulator**

데이터:
- 멤버: `mv_cap`, `mv_concert`, `remaining( )`, `book( )`
- 호출자 역할: 외부 리포트, 자기 클래스, 하위 클래스

버튼:
- `PUBLIC으로 이동`, `PRIVATE으로 이동`, `PROTECTED로 이동`
- `외부에서 접근`
- `하위 클래스에서 접근`
- `규칙 검사`

상태/피드백:
- `callerRole`, `visibility`, `syntaxResult`
- private 속성 외부 접근 시 "syntax check에서 차단"이라고 표시한다.
- public 속성으로 바꾸면 "작동은 하지만 외부가 내부 규칙을 깰 수 있음"이라고 경고한다.

### 정리

Attribute는 상태, Method는 행동, Visibility는 경계다. 외부에 필요한 행동은 public으로 열고, 내부 상태는 private으로 보호해야 객체가 자기 규칙을 지킬 수 있다.

## CH20-L03 · Constructor와 객체 초기화

### 왜 필요한가

객체를 만든 뒤 매번 초기화 method를 따로 호출해야 한다면 호출자가 순서를 기억해야 한다. 누군가 공연 ID나 회차를 넣지 않은 채 `remaining( )`을 부르면 객체는 불완전한 상태로 동작한다.

Constructor는 객체가 태어나는 순간 반드시 필요한 값을 받게 해서, 생성 직후부터 사용할 수 있는 상태를 만든다.

### 무엇인가

`constructor`는 객체 생성 시 자동으로 실행되는 특별한 instance method다.

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

객체 생성 시 constructor parameter를 넘긴다.

```abap
DATA(lo_mgr) = NEW zcl_booking_manager(
  iv_concert = 'C001'
  iv_perf    = '01' ).
```

`class_constructor`는 클래스가 처음 사용될 때 한 번 실행되는 static constructor다. 객체마다 실행되는 `constructor`와 다르다.

### 어떻게 확인하는가

1. `constructor` 첫 줄에 중단점을 건다.
2. `NEW zcl_booking_manager( ... )`를 실행한다.
3. `constructor`가 자동으로 호출되는지 본다.
4. `mv_concert`, `mv_perf`, `mv_cap`이 채워졌는지 확인한다.
5. 객체를 두 번 만들면 instance constructor가 두 번 실행되는지 본다.
6. static method 또는 class component를 처음 사용할 때 `class_constructor`가 한 번만 실행되는지 비교한다.

### 실수와 주의

- constructor에 너무 무거운 처리를 넣으면 객체 생성 자체가 느려진다.
- 필수 상태가 있다면 public setter에 의존하지 말고 constructor parameter로 받는 편이 안전하다.
- `class_constructor`는 객체별 초기화용이 아니다. 클래스 전체 공용 초기화에 쓴다.
- 존재하지 않는 공연 ID 처리 방식은 프로젝트 기준을 정해야 한다. CH20에서는 CH15 입력 검증이 선행된다는 전제로 설명한다.

### 체험형 학습 설계

**Constructor Timeline**

데이터:
- 입력: `iv_concert`, `iv_perf`
- DB 샘플: `zconcert-capacity`
- 객체 상태: `mv_concert`, `mv_perf`, `mv_cap`

버튼:
- `객체 생성`
- `constructor 건너뛰기 비교`
- `class_constructor 호출`
- `객체 두 개 생성`

상태/피드백:
- `constructorCount`, `classConstructorCount`, `objectReady`
- 필수 값이 비면 "사용 가능한 객체가 아님"이라고 표시한다.

### 정리

Constructor는 객체를 "생성만 된 빈 껍데기"가 아니라 "사용 가능한 상태"로 만드는 장치다. 객체마다 필요한 값은 `constructor`, 클래스 전체 공용 초기화는 `class_constructor`로 나눈다.

## CH20-L04 · Static Method와 Instance Method

### 왜 필요한가

어떤 행동은 객체 상태가 필요하고, 어떤 행동은 객체 없이도 가능하다. 예약 잔여석 계산은 특정 공연과 회차 상태가 필요하다. 반면 공연 ID를 보기 좋은 문자열로 포맷하는 유틸리티는 객체 상태가 없어도 된다.

이 구분 없이 모든 method를 instance로 만들거나 모두 static으로 만들면 호출 방식과 책임이 흐려진다.

### 무엇인가

Instance member는 객체별 상태와 연결된다. 객체 참조로 `->` 호출한다.

```abap
DATA(lo_mgr) = NEW zcl_booking_manager(
  iv_concert = 'C001'
  iv_perf    = '01' ).

lo_mgr->book( iv_seats = 2 ).
```

Static member는 클래스 자체에 묶인다. 객체 없이 `=>`로 호출한다.

```abap
DATA(lv_text) = zcl_booking_manager=>format_id( 'C001' ).
```

method 안에서 자기 객체의 component를 명확히 가리키려면 `me->`를 쓴다.

```abap
METHOD book.
  IF iv_seats > me->remaining( ).
    RAISE EXCEPTION TYPE zcx_fully_booked.
  ENDIF.
ENDMETHOD.
```

### 어떻게 확인하는가

1. `lo_mgr->book( )`은 객체가 있어야 호출된다.
2. `zcl_booking_manager=>format_id( )`는 객체 없이 호출된다.
3. static method 안에서 `me->remaining( )`을 쓰면 안 되는지 syntax check로 확인한다.
4. instance method 안에서는 `me->`가 현재 객체를 가리키는지 디버거에서 확인한다.

### 실수와 주의

- 정적 method에는 `me`가 없다. 객체 상태에 접근할 수 없다.
- 객체별 상태를 다루는 기능을 static으로 만들면 상태 전달이 파라미터로 계속 늘어난다.
- 단순 유틸리티를 instance method로 만들면 불필요하게 객체 생성이 필요해진다.
- `=>`와 `->`를 문법 기호로만 외우지 말고 왼쪽에 클래스 이름이 오는지 객체 참조가 오는지 보아야 한다.

### 체험형 학습 설계

**Arrow Selector Trainer**

데이터:
- 왼쪽 대상: `zcl_booking_manager`, `lo_mgr`
- component: `format_id`, `book`, `mv_cap`

버튼:
- `=> 선택`
- `-> 선택`
- `me-> 보기`
- `호출 검사`

상태/피드백:
- `leftSideKind`: class, object, me
- `memberKind`: static, instance
- `callResult`: ok, syntaxError
- 정적에서 instance member를 호출하면 "객체가 없으므로 instance 상태에 접근할 수 없음"이라고 표시한다.

### 정리

Instance는 객체별 상태가 필요할 때, Static은 객체 없이 공용 기능을 제공할 때 쓴다. `->`는 object reference, `=>`는 class, `me->`는 현재 객체다.

## CH20-L05 · Interface 기본 설계

### 왜 필요한가

여러 클래스가 같은 방식으로 호출되어야 할 때가 있다. 예매 내역, 공연 목록, 오류 로그는 서로 다른 클래스일 수 있지만 "출력할 수 있다"는 공통 규약을 가질 수 있다. 이때 부모 클래스로 억지로 묶으면 구현 관계가 어색해진다.

Interface는 "무엇을 할 수 있어야 한다"는 약속만 정하고, 실제 구현은 각 클래스가 맡게 한다.

### 무엇인가

Interface는 method 규약을 정의한다.

```abap
INTERFACE zif_printable.
  METHODS print.
ENDINTERFACE.
```

클래스는 `INTERFACES`로 이 규약을 구현한다고 선언한다.

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

`zif_printable~print`의 `~`는 interface component임을 나타낸다. interface reference로 다루면 서로 다른 클래스도 같은 방식으로 호출할 수 있다.

```abap
DATA lo_printable TYPE REF TO zif_printable.

lo_printable = NEW zcl_booking( ).
lo_printable->print( ).
```

### 어떻게 확인하는가

1. `zif_printable`에 `print` method를 선언한다.
2. `zcl_booking`이 `INTERFACES zif_printable`을 선언하게 한다.
3. `zif_printable~print` 구현을 일부러 빼고 활성화 오류를 확인한다.
4. 구현 후 interface reference에 객체를 담아 `print( )`를 호출한다.

### 실수와 주의

- interface에 선언한 모든 method를 구현해야 한다.
- 구현 method 이름에서 `interface~method` 형식을 빼먹지 않는다.
- interface는 공통 규약이다. 공통 상태를 물려주는 도구가 아니다.
- 한 클래스는 여러 interface를 구현할 수 있지만, 너무 많은 interface는 책임이 흐려질 수 있다.

### 체험형 학습 설계

**Contract Board**

데이터:
- interface 카드: `ZIF_PRINTABLE`
- method 약속: `print`
- 구현 클래스: `ZCL_BOOKING`, `ZCL_CONCERT`

버튼:
- `규약 만들기`
- `클래스가 구현 선언`
- `구현 누락`
- `interface reference 호출`

상태/피드백:
- `contractMethods`, `implementedMethods`, `activationResult`
- 구현 누락 시 "interface 계약을 지키지 않아 활성화 실패"라고 표시한다.

### 정리

Interface는 여러 클래스가 같은 약속을 따르게 하는 도구다. 구현을 물려주는 것이 아니라 호출 가능한 규약을 공유한다. `INTERFACE`, `INTERFACES`, `interface~method`를 함께 읽어야 한다.

## CH20-L06 · Exception Class: TRY / CATCH / CX 계층

### 왜 필요한가

정원 초과는 단순히 `abap_false`를 돌려주는 것만으로 부족할 수 있다. 호출자는 "예약 가능하지 않다"와 "입력 값이 이상하다"와 "정원이 초과됐다"를 구분해야 한다. 실패 이유가 업무적으로 중요하면 Exception(예외 객체)로 표현하는 편이 명확하다.

CH11에서 `cx_salv_msg`를 `[선행 사용]`으로 잡아 보았다. CH20에서는 예외를 정식으로 배운다.

### 무엇인가

예외는 실패 상황을 객체로 전달하는 방식이다. 업무 예외 클래스 `ZCX_FULLY_BOOKED`는 보통 `CX_STATIC_CHECK` 같은 표준 예외 계층을 상속해 만든다.

```abap
METHOD book.
  IF iv_seats > me->remaining( ).
    RAISE EXCEPTION TYPE zcx_fully_booked.
  ENDIF.
ENDMETHOD.
```

호출자는 `TRY/CATCH`로 처리한다.

```abap
TRY.
    lo_mgr->book( iv_seats = 100 ).

  CATCH zcx_fully_booked INTO DATA(lx_booked).
    MESSAGE lx_booked->get_text( ) TYPE 'I'.

  CLEANUP.
    " 예외로 빠져나갈 때 정리가 필요한 자원 처리
ENDTRY.
```

예외 계층의 큰 분류:

| 계층 | 의미 |
|---|---|
| `CX_STATIC_CHECK` | method signature에서 선언하고 호출자가 처리해야 하는 checked exception |
| `CX_DYNAMIC_CHECK` | 처리 권장, 미처리 시 runtime 문제 가능 |
| `CX_NO_CHECK` | 처리 강제 없음 |
| `CX_ROOT` | 모든 class-based exception의 최상위 |

예외 객체는 "실패가 있었다"만 말하면 부족하다. 사용자가 보는 메시지, 로그에 남길 텍스트, 운영자가 찾을 메시지 번호가 필요하다. ABAP에서는 메시지 클래스의 T100 메시지를 예외 텍스트로 연결할 수 있다.

가장 먼저 알아야 할 구조는 다음이다.

| 요소 | 역할 |
|---|---|
| Message Class | 메시지 묶음. 예: `ZBOOKING` |
| Message Number | 메시지 번호. 예: `001` |
| Message Text | 사용자와 운영자가 읽는 문장. 예: `공연 &1 회차 &2 잔여석은 &3석입니다.` |
| `IF_T100_MESSAGE` | 예외 클래스와 T100 메시지를 연결하는 시스템 interface |
| `SCX_T100KEY` | message class, number, placeholder attribute 이름을 담는 구조 |
| `TEXTID` | 예외를 만들 때 어떤 예외 텍스트를 쓸지 고르는 constructor parameter |

ADT에서 Global Exception Class를 만들면 예외 텍스트를 source에서 유지할 수 있다. 입문자는 완성된 코드를 모두 외울 필요는 없지만, 다음 흐름은 읽을 수 있어야 한다.

```abap
" Message class ZBOOKING
" 001: 공연 &1 회차 &2 잔여석은 &3석입니다.
```

```abap
CLASS zcx_fully_booked DEFINITION
  PUBLIC
  INHERITING FROM cx_static_check
  CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES if_t100_message.

    CONSTANTS:
      BEGIN OF fully_booked,
        msgid TYPE symsgid      VALUE 'ZBOOKING',
        msgno TYPE symsgno      VALUE '001',
        attr1 TYPE scx_attrname VALUE 'MV_CONCERT',
        attr2 TYPE scx_attrname VALUE 'MV_PERF',
        attr3 TYPE scx_attrname VALUE 'MV_REMAINING',
        attr4 TYPE scx_attrname VALUE '',
      END OF fully_booked.

    DATA mv_concert   TYPE zconcert-concert_id READ-ONLY.
    DATA mv_perf      TYPE zbooking-perf_no    READ-ONLY.
    DATA mv_remaining TYPE i                   READ-ONLY.

    METHODS constructor
      IMPORTING
        textid       LIKE if_t100_message=>t100key OPTIONAL
        previous     LIKE previous OPTIONAL
        mv_concert   TYPE zconcert-concert_id OPTIONAL
        mv_perf      TYPE zbooking-perf_no OPTIONAL
        mv_remaining TYPE i OPTIONAL.
ENDCLASS.
```

위 코드를 "직접 타이핑할 암기 대상"으로 보지 말고 연결 지도로 읽는다. ADT나 Class Builder는 exception text와 attribute를 기준으로 constructor를 생성해 준다. 손으로 작성한다면 constructor는 `super->constructor( previous = previous )`를 호출하고, importing parameter 값을 `me->mv_concert`, `me->mv_perf`, `me->mv_remaining`에 옮기는 일을 해야 한다. `fully_booked`는 메시지 `ZBOOKING 001`을 가리킨다. `attr1`, `attr2`, `attr3`에는 메시지의 `&1`, `&2`, `&3`에 들어갈 attribute 이름이 들어간다. 따라서 예외 객체가 `mv_concert`, `mv_perf`, `mv_remaining` 값을 갖고 있으면 메시지 placeholder가 그 값으로 채워진다.

예외 발생 시에는 `textid`와 placeholder에 들어갈 값을 넘긴다.

```abap
RAISE EXCEPTION TYPE zcx_fully_booked
  EXPORTING
    textid       = zcx_fully_booked=>fully_booked
    mv_concert   = mv_concert
    mv_perf      = mv_perf
    mv_remaining = lv_remaining.
```

잡은 예외는 텍스트로 읽거나 메시지 객체로 보낼 수 있다.

```abap
CATCH zcx_fully_booked INTO DATA(lx_booked).
  MESSAGE lx_booked TYPE 'I'.
  " 또는 화면 종류에 따라: MESSAGE lx_booked->get_text( ) TYPE 'I'.
```

`IF_T100_DYN_MSG`는 `MESSAGE ... WITH ...`를 이용해 메시지 속성을 더 동적으로 연결할 때 쓰는 interface다. CH20에서는 이름과 용도만 잡는다. 메시지 클래스와 exception class가 안정적으로 정해진 업무 예외라면 먼저 `IF_T100_MESSAGE`와 predefined exception text를 이해하는 것이 안전하다.

CH18에서 남겨 둔 `THROW`도 여기서 회수한다. `THROW`는 `COND`나 `SWITCH`의 결과 위치에서 예외를 발생시킬 수 있는 expression 문법이다. 다음 두 코드는 목적이 다르다.

```abap
IF iv_seats > lv_remaining.
  RAISE EXCEPTION TYPE zcx_fully_booked
    EXPORTING
      textid       = zcx_fully_booked=>fully_booked
      mv_concert   = mv_concert
      mv_perf      = mv_perf
      mv_remaining = lv_remaining.
ENDIF.
```

```abap
DATA(lv_status_text) = COND string(
  WHEN iv_seats <= lv_remaining THEN |예약 가능: { iv_seats }석|
  ELSE THROW zcx_fully_booked(
         textid       = zcx_fully_booked=>fully_booked
         mv_concert   = mv_concert
         mv_perf      = mv_perf
         mv_remaining = lv_remaining ) ).
```

첫 번째는 statement다. 흐름 중간에서 실패하면 예외를 던진다. 두 번째는 expression이다. 조건에 따라 문자열 값을 만들다가, 정상 값을 만들 수 없는 branch에서 예외를 던진다. `THROW` 뒤 exception class에는 괄호가 필요하고, `RAISE EXCEPTION TYPE`처럼 `EXPORTING`을 쓰지 않는다.

CH20에서 `THROW`를 배웠다고 모든 `IF`를 `COND ... THROW`로 바꾸지 않는다. 조건별로 값 하나를 만들 때만 적합하다. 검증, 로그 기록, 여러 단계 보정, 이벤트 발생이 같이 있으면 `IF`와 `RAISE EXCEPTION`이 더 읽기 좋다.

`RESUME`은 일반 복구 문법이 아니다. resumable exception 등 특수 조건이 필요한 고급 주제이므로 CH20에서는 "존재와 제한"만 이해한다.

### 어떻게 확인하는가

1. `book( )`에 `RAISING zcx_fully_booked`를 선언한다.
2. 잔여석보다 큰 좌석 수를 넣는다.
3. `RAISE EXCEPTION TYPE zcx_fully_booked` 줄에서 예외가 발생하는지 본다.
4. 호출부의 `CATCH zcx_fully_booked`로 이동하는지 확인한다.
5. `CATCH cx_root`를 먼저 두면 구체 예외 catch가 의미 없어지는지 순서를 확인한다.
6. `ZBOOKING 001` 메시지와 `fully_booked` 예외 텍스트를 연결한 뒤 `MESSAGE lx_booked TYPE 'I'`가 placeholder 값을 채운 문장을 보여 주는지 확인한다.
7. `COND ... ELSE THROW zcx_fully_booked( ... )`를 실행해 정상 branch에서는 문자열이 만들어지고, 실패 branch에서는 `CATCH`로 이동하는지 확인한다.

### 실수와 주의

- checked exception을 던지는 method는 `RAISING` 선언과 호출부 처리가 맞아야 한다.
- 너무 넓은 `CATCH cx_root`를 먼저 두면 구체 예외 처리 기회가 사라진다.
- `CLEANUP`을 모든 경우에 실행되는 finally처럼 단순화하지 않는다. 예외로 블록을 떠날 때 정리가 필요한 경우에 의미가 있다.
- 예외 이름은 업무 상황을 말해야 한다. `ZCX_ERROR`보다 `ZCX_FULLY_BOOKED`가 낫다.
- T100 메시지 기반 예외는 메시지 클래스, 메시지 번호, placeholder attribute 이름이 맞아야 한다.
- `IF_T100_MESSAGE`의 `ATTR1`~`ATTR4`에는 placeholder 값이 아니라 placeholder 값을 가진 attribute의 이름이 들어간다.
- `THROW`는 expression 결과 위치에서만 자연스럽다. 여러 문장을 실행해야 하면 `IF`와 `RAISE EXCEPTION`을 유지한다.
- `THROW ... SHORTDUMP`는 CH20 실습에서 사용하지 않는다. 학습 목적의 업무 예외는 `TRY/CATCH`로 처리 가능한 class-based exception으로 둔다.

### 체험형 학습 설계

**Exception Flow Console**

데이터:
- `remainingSeats`
- `iv_seats`
- exception class: `ZCX_FULLY_BOOKED`

버튼:
- `정상 예약 시도`
- `정원 초과 예약 시도`
- `CATCH 순서 바꾸기`
- `RAISING 제거`
- `T100 메시지 연결`
- `COND THROW 실행`
- `CLEANUP 관찰`

상태/피드백:
- `exceptionRaised`, `caughtBy`, `cleanupExecuted`, `t100Key`, `messageText`, `throwBranch`
- 구체 catch 전에 `cx_root`를 두면 "넓은 catch가 먼저 잡아버림"이라고 표시한다.
- `RAISING` 누락 시 "method 계약에 예외 가능성이 드러나지 않음"이라고 안내한다.
- `ATTR1`에 실제 값 `'C001'`을 넣으면 "여기는 값이 아니라 attribute 이름 자리"라고 표시한다.
- `COND THROW`에서 실패 branch가 선택되면 "값 생성 대신 예외 객체가 호출자에게 전달됨"을 표시한다.

### 정리

Exception은 실패를 호출자에게 명확히 전달하는 객체다. `RAISE EXCEPTION`으로 던지고, `TRY/CATCH`로 잡고, checked exception은 `RAISING` 계약을 통해 드러낸다. 사용자에게 보여 줄 텍스트가 필요하면 T100 메시지 기반 예외 텍스트를 연결하고, 조건 expression에서 정상 값을 만들 수 없는 branch는 `THROW`로 예외를 던질 수 있다.

## CH20-L07 · Inheritance / Redefinition

### 왜 필요한가

일반 예약 관리자와 VIP 예약 관리자가 대부분 같은 동작을 하지만 일부 규칙만 다르다면 모든 코드를 복사하는 것은 위험하다. 공통 로직은 부모 클래스에 두고, 달라지는 부분만 자식 클래스가 재정의하면 중복을 줄일 수 있다.

### 무엇인가

Inheritance는 기존 클래스를 물려받아 확장하는 관계다.

```abap
CLASS zcl_vip_booking DEFINITION
  PUBLIC
  INHERITING FROM zcl_booking_manager
  CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS book REDEFINITION.
ENDCLASS.

CLASS zcl_vip_booking IMPLEMENTATION.
  METHOD book.
    " VIP 전용 사전 처리
    super->book( iv_seats = iv_seats ).
  ENDMETHOD.
ENDCLASS.
```

- `INHERITING FROM`: 부모 클래스를 물려받는다.
- `REDEFINITION`: 부모의 instance method 구현을 자식에서 다시 정의한다.
- `super->`: 부모의 원래 구현을 호출한다.
- `ABSTRACT`: 직접 객체 생성은 막고 상속 전용으로 둔다.
- `FINAL`: 더 이상 상속 또는 재정의를 막는다.

기존 상속 임베드는 시각 자료로 유지한다.

::embed CH20-L07-S01 | 부모-자식 클래스 상속 계층::

### 어떻게 확인하는가

1. `ZCL_BOOKING_MANAGER`에 `book( )`을 만든다.
2. `ZCL_VIP_BOOKING`이 `INHERITING FROM zcl_booking_manager`를 선언하게 한다.
3. `book REDEFINITION`을 선언하고 구현한다.
4. `zcl_vip_booking` 객체의 `book( )` 호출이 자식 구현으로 들어가는지 확인한다.
5. `super->book( )`을 주석 처리했을 때 부모 검증이 실행되지 않는 차이를 본다.

### 실수와 주의

- 부모 method를 바꾸려면 `REDEFINITION` 선언이 필요하다.
- 부모 동작이 필요한데 `super->`를 빼면 공통 검증이 누락될 수 있다.
- ABAP class 상속은 단일 상속이다. 여러 규약은 interface로 푸는 것이 맞다.
- 상속은 "정말 is-a 관계인가"를 따져야 한다. 단순 코드 재사용만을 위해 상속하면 결합도가 높아진다.

### 체험형 학습 설계

**Redefinition Stepper**

데이터:
- 부모: `ZCL_BOOKING_MANAGER`
- 자식: `ZCL_VIP_BOOKING`
- method: `book`

버튼:
- `부모 객체 실행`
- `자식 객체 실행`
- `super 호출 켜기/끄기`
- `ABSTRACT 표시`
- `FINAL 표시`

상태/피드백:
- `staticType`, `dynamicType`, `executedMethod`, `superCalled`
- `super->`를 끄면 "부모의 공통 검증이 실행되지 않음"이라고 표시한다.

### 정리

상속은 기존 클래스를 물려받아 차이 나는 동작만 재정의하는 도구다. `INHERITING FROM`, `REDEFINITION`, `super->`를 함께 이해해야 한다. 단순 중복 제거만을 목적으로 남용하지 않는다.

## CH20-L08 · 다형성: CAST와 CASE TYPE OF

### 왜 필요한가

상속과 interface를 쓰면 여러 실제 객체를 하나의 부모 타입 또는 interface 타입으로 다룰 수 있다.

```abap
DATA lo_mgr TYPE REF TO zcl_booking_manager.

lo_mgr = NEW zcl_vip_booking(
  iv_concert = 'C001'
  iv_perf    = '01' ).

lo_mgr->book( iv_seats = 2 ).
```

이것이 다형성이다. 호출자는 실제 객체가 일반 예약 관리자인지 VIP 예약 관리자인지 몰라도 공통 method를 호출할 수 있다. 그런데 가끔 VIP 전용 method처럼 구체 타입에만 있는 기능이 필요하다. 그때 CAST와 `CASE TYPE OF`가 필요하다.

### 무엇인가

부모 타입 참조에 자식 객체를 담는 것은 upcast다. 보통 자연스럽게 가능하다. 반대로 부모 타입으로 보고 있던 참조를 더 구체적인 자식 타입으로 내려 보는 것은 downcast다.

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

`CASE TYPE OF`는 실제 타입에 따라 분기하고, 맞는 타입이면 target에 참조를 담을 수 있다.

```abap
CASE TYPE OF lo_mgr.
  WHEN TYPE zcl_vip_booking INTO DATA(lo_vip_case).
    lo_vip_case->apply_vip_coupon( ).

  WHEN TYPE zcl_booking_manager INTO DATA(lo_base_case).
    lo_base_case->book( iv_seats = 1 ).
ENDCASE.
```

### 어떻게 확인하는가

1. `lo_mgr`에 `NEW zcl_vip_booking( )`을 담고 `CAST zcl_vip_booking( lo_mgr )`가 성공하는지 본다.
2. `lo_mgr`에 일반 `zcl_booking_manager` 객체를 담고 같은 CAST가 실패하는지 본다.
3. 실패 시 `CX_SY_MOVE_CAST_ERROR`가 잡히는지 확인한다.
4. 디버거에서 reference variable의 static type과 실제 object의 dynamic type을 비교한다.

### 실수와 주의

- CAST를 자주 써야 한다면 설계를 다시 본다. 공통 interface나 method 재정의로 해결할 수 있는지 먼저 검토한다.
- downcast 실패 가능성을 무시하지 않는다.
- `CASE TYPE OF`에서는 구체 타입을 먼저 두는 편이 안전하다.
- interface reference를 구체 클래스로 내리는 순간 결합도가 높아진다.

### 체험형 학습 설계

**Dynamic Type Inspector**

데이터:
- 객체 후보: 일반 예약 관리자, VIP 예약 관리자
- 참조 변수: `lo_mgr TYPE REF TO zcl_booking_manager`

버튼:
- `일반 객체 담기`
- `VIP 객체 담기`
- `CAST 실행`
- `?= 실행`
- `CASE TYPE OF 실행`
- `공통 method로 해결`

상태/피드백:
- `staticType`, `dynamicType`, `castTarget`, `castResult`
- CAST 실패 시 `CX_SY_MOVE_CAST_ERROR` 흐름을 보여 준다.
- 타입별 분기가 많아지면 "다형성 설계로 해결 가능한지 검토"라고 표시한다.

### 정리

다형성의 기본은 부모/interface 타입으로 공통 method를 호출하는 것이다. CAST와 `CASE TYPE OF`는 실제 타입 전용 기능이 꼭 필요할 때만 제한적으로 쓴다.

## CH20-L09 · OO 이벤트: EVENTS / RAISE EVENT / SET HANDLER

### 왜 필요한가

정원 초과는 실패이므로 예외가 맞다. 하지만 "방금 매진이 되었다"는 실패가 아니라 사건이다. 이 사건을 듣고 ALV 색을 바꾸거나 로그를 남기거나 알림을 띄울 수 있다. 발생 객체가 반응 객체를 직접 알 필요 없이 사건을 알리는 구조가 이벤트다.

### 무엇인가

이벤트는 클래스의 public 계약 일부로 선언한다.

```abap
CLASS zcl_booking_manager DEFINITION
  PUBLIC
  CREATE PUBLIC.
  PUBLIC SECTION.
    EVENTS sold_out
      EXPORTING
        VALUE(iv_concert) TYPE zconcert-concert_id
        VALUE(iv_perf)    TYPE zbooking-perf_no.
ENDCLASS.
```

발생은 `RAISE EVENT`로 한다.

```abap
METHOD book.
  IF me->remaining( ) = 0.
    RAISE EVENT sold_out
      EXPORTING
        iv_concert = mv_concert
        iv_perf    = mv_perf.
  ENDIF.
ENDMETHOD.
```

반응하는 클래스는 handler method를 선언한다.

```abap
CLASS zcl_booking_monitor DEFINITION
  PUBLIC
  CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS on_sold_out
      FOR EVENT sold_out OF zcl_booking_manager
      IMPORTING iv_concert iv_perf sender.
ENDCLASS.
```

그리고 `SET HANDLER`로 연결한다.

```abap
DATA(lo_monitor) = NEW zcl_booking_monitor( ).

SET HANDLER lo_monitor->on_sold_out FOR lo_mgr.
```

### 어떻게 확인하는가

1. handler 등록 없이 `RAISE EVENT`가 실행되는 경로를 본다. 아무 반응도 없어야 한다.
2. `SET HANDLER` 후 같은 이벤트를 발생시킨다.
3. `on_sold_out` method에 중단점을 걸어 호출되는지 확인한다.
4. handler를 두 개 등록해 호출 순서에 의존하면 안 된다는 점을 확인한다.

### 실수와 주의

- `EVENTS`와 handler method를 선언해도 `SET HANDLER`가 없으면 연결되지 않는다.
- 이벤트를 예외처럼 쓰지 않는다. 실패 전달은 예외, 사건 알림은 이벤트다.
- 여러 handler의 실행 순서에 의존하지 않는다.
- handler 객체의 생명주기와 등록 상태를 신경 써야 한다.

### 체험형 학습 설계

**Event Wiring Panel**

데이터:
- 발생 객체: `lo_mgr`
- handler 객체: `lo_monitor`, `lo_logger`
- 이벤트: `sold_out`

버튼:
- `이벤트 선언 보기`
- `핸들러 선언 보기`
- `SET HANDLER 등록`
- `매진 발생`
- `핸들러 하나 더 등록`

상태/피드백:
- `handlerRegistered`, `raisedEvents`, `handlerCallLog`
- 등록 전에는 "이벤트는 발생했지만 듣는 객체가 없음"이라고 표시한다.
- handler가 여럿이면 "호출 순서에 의존하지 말 것"이라고 표시한다.

### 정리

이벤트는 객체가 사건을 알리고 다른 객체가 반응하게 하는 구조다. `EVENTS`, `RAISE EVENT`, `FOR EVENT`, `SET HANDLER` 네 요소가 함께 있어야 동작한다.

## CH20-L10 · 실습: ZCL_BOOKING_MANAGER 클래스

### 왜 필요한가

마지막 실습은 CH20 문법을 콘서트 예매 업무 객체에 모으는 단계다. 목표는 OO 문법을 많이 쓰는 것이 아니라, 예약 로직을 public 계약과 private 상태로 나누고, 실패는 예외로, 매진 사건은 이벤트로 표현하는 것이다.

실제 저장과 취소 처리는 CH24 이후 범위다. CH20에서는 읽기, 계산, 검증, 예외/이벤트 발생까지만 다룬다.

### 무엇인가

완성 구조는 다음과 같다.

::embed CH20-L10-S01 | 클래스의 속성·메서드 구조::

먼저 예외 클래스 `ZCX_FULLY_BOOKED`는 L06에서 배운 방식으로 메시지 클래스 `ZBOOKING`의 예외 텍스트를 가진다고 전제한다.

```abap
" Message class ZBOOKING
" 001: 공연 &1 회차 &2 잔여석은 &3석입니다.
```

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
    rv_ok = xsdbool(
      iv_seats > 0
      AND iv_seats <= me->remaining( ) ).
  ENDMETHOD.

  METHOD book.
    DATA(lv_remaining) = me->remaining( ).

    IF iv_seats <= 0 OR iv_seats > lv_remaining.
      RAISE EXCEPTION TYPE zcx_fully_booked
        EXPORTING
          textid       = zcx_fully_booked=>fully_booked
          mv_concert   = mv_concert
          mv_perf      = mv_perf
          mv_remaining = lv_remaining.
    ENDIF.

    IF iv_seats = lv_remaining.
      RAISE EVENT sold_out
        EXPORTING
          iv_concert = mv_concert
          iv_perf    = mv_perf.
    ENDIF.

    " 실제 저장 처리는 CH24에서 다룬다.
  ENDMETHOD.
ENDCLASS.
```

호출부:

```abap
DATA(lo_mgr) = NEW zcl_booking_manager(
  iv_concert = 'C001'
  iv_perf    = '01' ).

TRY.
    lo_mgr->book( iv_seats = 2 ).
    MESSAGE '예약 가능' TYPE 'S'.

  CATCH zcx_fully_booked INTO DATA(lx_booked).
    MESSAGE lx_booked TYPE 'I'.
ENDTRY.
```

### 어떻게 확인하는가

1. `ZCX_FULLY_BOOKED` 예외 클래스를 만들고 `CX_STATIC_CHECK` 계층으로 둔다.
2. `ZCL_BOOKING_MANAGER`를 활성화한다.
3. constructor에서 `mv_concert`, `mv_perf`, `mv_cap`이 채워지는지 확인한다.
4. `remaining( )`이 취소 상태를 제외하고 잔여석을 계산하는지 본다.
5. 잔여석보다 큰 값을 넣어 `ZCX_FULLY_BOOKED`가 `CATCH`로 잡히는지 확인한다.
6. `MESSAGE lx_booked TYPE 'I'`가 `ZBOOKING 001`의 `&1`, `&2`, `&3` 자리에 공연, 회차, 잔여석을 채우는지 확인한다.
7. 잔여석과 같은 값을 넣고 handler를 등록해 `sold_out` 이벤트가 호출되는지 확인한다.

### 실수와 주의

- `book( )`이 실제 저장까지 한다고 오해하지 않는다. CH20은 OO 설계 장이다.
- `remaining( )`에서 취소 상태를 제외해야 한다.
- `can_book( )`과 `book( )`의 판단 기준이 달라지면 안 된다.
- 예외 클래스 이름은 업무 상황을 말해야 한다.
- 예외 텍스트 없이 `get_text( )`만 기대하면 운영자가 볼 메시지가 빈약해질 수 있다.
- 존재하지 않는 공연 ID 처리는 실제 프로젝트 기준을 정해야 한다. CH20 실습은 CH15 입력 검증을 전제로 둔다.

### 체험형 학습 설계

**Booking Manager OO Lab**

데이터:
- `zconcert`: `concert_id`, `capacity`
- `zbooking`: `concert_id`, `perf_no`, `seats`, `status`
- 입력: `iv_concert`, `iv_perf`, `iv_seats`

버튼:
- `객체 생성`
- `잔여석 계산`
- `예매 가능 검사`
- `book 실행`
- `handler 등록`
- `저장 경계 보기`

상태/피드백:
- `mv_concert`, `mv_perf`, `mv_cap`
- `bookedSeats`, `remainingSeats`, `canBook`
- `raisedException`, `exceptionMessage`, `raisedEvent`, `handlerLog`
- 정상 경로에는 "검증 성공, 실제 저장은 후속 장"이라고 표시한다.
- 초과 경로에는 `RAISE EXCEPTION -> CATCH` 흐름을 보여 준다.
- 예외 메시지에는 `ZBOOKING 001`과 placeholder 값이 어떻게 합쳐지는지 보여 준다.
- 매진 경로에는 `RAISE EVENT -> handler` 흐름을 보여 준다.

### 정리

CH20-L10은 OO 문법을 업무 객체로 묶는 실습이다. `ZCL_BOOKING_MANAGER`는 constructor로 상태를 받고, private attribute로 보호하며, public method로 잔여석과 예매 가능 여부를 제공하고, 실패는 T100 메시지 기반 예외로, 사건은 이벤트로 알린다.

## CH20 최종 정리

CH20의 핵심 질문은 하나다.

> 이 업무 개념은 어떤 상태를 가지고, 어떤 행동을 제공하며, 어떤 실패와 사건을 어떻게 알리는가?

`ZCL_BOOKING_MANAGER`는 그 첫 답이다.

| 설계 요소 | CH20 답 |
|---|---|
| 상태 | 공연 ID, 회차, 정원 |
| 행동 | 잔여석 계산, 예매 가능 검사, 예매 요청 검증 |
| 경계 | public method, private attribute |
| 생성 | constructor로 필수 상태 초기화 |
| 실패 | `ZCX_FULLY_BOOKED` exception과 T100 기반 예외 텍스트 |
| 사건 | `sold_out` event |
| 확장 | VIP 예약은 inheritance/redefinition 가능 |
| 규약 | 출력·검증 같은 공통 약속은 interface |
| 타입 확인 | CAST와 `CASE TYPE OF`는 필요할 때 제한적으로 |

CH21에서는 이 OO 기반을 ALV 표시 제어로 가져간다. 객체 참조, method 호출, event handler를 알고 있어야 ALV의 색상·상호작용 제어가 덜 낯설다.
