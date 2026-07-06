# NEWCH28_OLDCH99_REWRITE · Dynamic ABAP: Field Symbol 심화와 Generic Programming

> 주 소스: 신규 집필. `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md`의 P1 판정에서 확정한 generic Field Symbol, generic type, dynamic `ASSIGN`, RTTS/RTTI 공백을 회수한다.
> 연결 위치: NEWCH27_OLDCH26 OO ABAP 고급 설계 이후, NEWCH29_OLDCH99 Advanced String Processing and Regex 이전. 기존 OLDCH27 ALV event/editing 계열보다 앞에 배치한다.
> 목표: CH06에서 배운 typed `LOOP ... ASSIGNING <fs>`를 넘어, "타입을 컴파일 시점에 모를 때 ABAP이 안전하게 값을 읽고 다루는 방법"을 입문자도 실무 코드 읽기 수준으로 이해하게 한다.

## NEWCH28 전체 설계

CH06에서 Field Symbol은 Internal Table(메모리에 잠깐 두는 표)의 한 행을 복사하지 않고 바로 가리키는 도구로 소개했다.

```abap
LOOP AT lt_booking ASSIGNING FIELD-SYMBOL(<booking>).
  <booking>-status = 'CHECKED'.
ENDLOOP.
```

이 코드는 학습 초반에는 충분하다. `<booking>`의 타입은 `lt_booking`의 한 줄 타입으로 분명하고, 개발자는 `<booking>-status`가 있는지 미리 알고 있다. 그러나 실무 ABAP을 읽다 보면 다음과 같은 코드가 나온다.

```abap
FIELD-SYMBOLS <value> TYPE any.

ASSIGN COMPONENT lv_component
       OF STRUCTURE ls_any
       TO <value>
       ELSE UNASSIGN.
```

처음 배우는 사람에게 이 코드는 거의 "ABAP이 자기 자신을 뜯어보는 코드"처럼 보인다. 변수 이름이 문자열로 들어가고, 구조의 필드 이름을 실행 중에 고르고, 타입을 `any`라고 선언한다. 심지어 어떤 코드는 `CREATE DATA`로 이름 없는 데이터를 만들고, RTTS(Runtime Type Services)로 그 데이터가 구조인지 표인지 확인한다.

이 장은 그런 코드를 "신기한 고급 문법"으로 외우게 하지 않는다. 다음 질문에 답할 수 있게 만든다.

| 질문 | 기대 답 |
|---|---|
| Field Symbol은 변수인가? | 아니다. Field Symbol은 자기 값을 가진 상자가 아니라, 이미 존재하는 메모리 영역을 가리키는 이름표다. |
| typed Field Symbol과 generic Field Symbol은 무엇이 다른가? | typed는 가리킬 수 있는 모양이 정해져 있고, generic은 실행 중에 어떤 모양이 올지 확인해야 한다. |
| `TYPE any`는 "아무거나 마음대로"인가? | 아니다. 무엇이든 받을 수 있다는 뜻이지, 무엇이든 같은 방식으로 사용할 수 있다는 뜻은 아니다. |
| `ASSIGN` 실패는 어떻게 확인하는가? | dynamic assignment에서는 `sy-subrc`와 `<fs> IS ASSIGNED`를 함께 확인하고, 가능하면 `ELSE UNASSIGN`을 붙인다. |
| `ASSIGN COMPONENT`는 왜 필요한가? | 구조의 component 이름이나 위치가 실행 중에 정해질 때 안전하게 접근하기 위해 필요하다. |
| `ASSIGN (name)`은 왜 조심해야 하는가? | 문자열이 실제 data object 이름으로 해석되므로 검색 범위, 보안, 유지보수 위험이 크다. 구조 component에는 `ASSIGN COMPONENT`가 우선이다. |
| `REF TO data`와 `CREATE DATA`는 왜 나오는가? | 컴파일 시점에 타입을 고정하지 않고, 실행 중에 필요한 data object를 만들기 위해 사용한다. |
| RTTI/RTTS는 무엇을 해 주는가? | 실행 중인 data object의 타입 정보를 읽고, 필요한 경우 type description object를 이용해 데이터를 만들게 해 준다. |

NEWCH28은 "동적이면 멋있다"가 아니라 "정적 코드로 충분하면 정적으로 쓰고, 정말 필요할 때만 동적으로 쓰는 판단"을 가르친다. 동적 ABAP은 강력하지만, 읽는 사람과 시스템을 동시에 위험하게 만들 수 있기 때문이다.

## NEWCH28 R15 경계

이 장은 NEWCH27 이후에 배치된다. 학습자는 이미 Internal Table, Structure, Method, Exception, OO 설계, Modern Syntax, Open SQL, DML, Lock, RAP 큰 그림을 학습했다. 따라서 generic type과 runtime type 정보라는 추상 개념을 다룰 수 있다. 그러나 이 장이 모든 dynamic programming을 허용하는 장은 아니다.

| 구분 | NEWCH28에서 정식 사용 | NEWCH28에서 보류 |
|---|---|---|
| Field Symbol | typed/generic `FIELD-SYMBOLS`, inline `FIELD-SYMBOL(<fs>)`, `TYPE any`, `TYPE ANY TABLE` | obsolete typing, header line 기반 old-style 테크닉 |
| Assignment | `ASSIGN`, `UNASSIGN`, `<fs> IS ASSIGNED`, `ELSE UNASSIGN`, `sy-subrc` 확인 | `ASSIGN LOCAL COPY`, 무분별한 `CASTING`, offset/length memory trick |
| Structure component | `ASSIGN COMPONENT comp OF STRUCTURE struc`, component name/position, 실패 시 `sy-subrc` | 복잡한 component selector 체인 남용, 임시 구조 expression에 대한 무리한 접근 |
| Dynamic data object name | `ASSIGN (name)`의 읽기용 이해, search order, 위험성, whitelist 설계 | 사용자 입력을 그대로 `(name)`에 넣기, `(PROG)DOBJ` cross-program 접근, private/read-only attribute 우회 시도 |
| Data reference | `REF TO data`, `CREATE DATA`, `dref->*`, anonymous data object | shared object area, low-level lifetime 최적화, data reference framework 설계 |
| RTTS/RTTI | `cl_abap_typedescr`, `cl_abap_datadescr`, `cl_abap_structdescr`, `describe_by_data`, `describe_by_name`, `components`, `TYPE HANDLE` 개념 | RTTC full dynamic table generator, ALV field catalog 자동 생성기, reflection framework |
| 실습 | 동적 구조 검사기: component 목록 읽기, component 선택, 값 표시/수정, 실패 피드백 | 동적 SQL, dynamic WHERE, generic persistence framework |
| 후속 연결 | regex/SUBMATCHES는 NEWCH29로 분리, ALV event/editing은 이후 장에서 활용 | 정규식 고급 처리, ALV full editing framework, Enhancement spot 구현 |

> 이 장의 핵심 경계는 단순하다. "동적 접근을 배운다"와 "아무 데이터나 문자열로 찔러 본다"는 완전히 다르다. NEWCH28은 동적 ABAP을 읽고 작은 안전 도구를 만들 수 있게 하지만, 예측 불가능한 framework를 즉흥적으로 만들게 하지 않는다.

## 공식 문서 수동 확인 근거

Classic ABAP 공식 문서는 자동 키워드 매칭으로 결론 내리지 않고 `C:\ABAP_DOCU_HTML`에서 관련 파일을 직접 열어 문법과 실패 동작을 확인했다.

| 주제 | 확인 문서 | NEWCH28 반영 포인트 |
|---|---|---|
| Field Symbol 선언 | `abapfield-symbols.htm` | Field Symbol은 angle bracket이 필수이고, 선언 직후에는 memory area를 가리키지 않는다. 사용 전 `ASSIGN`이 필요하다. |
| Generic Field Symbol | `abapfield-symbols.htm` | `TYPE ANY TABLE`, `TYPE any` 예제가 공식 문서에 있으며, typing은 할당 가능한 memory area와 operand position을 제한한다. |
| `ASSIGN` 기본 | `abapassign.htm` | 성공하면 Field Symbol이 memory area를 가리키며 dereferenced data reference처럼 동작한다. dynamic 실패 시 `sy-subrc`와 `ELSE UNASSIGN` 경계가 중요하다. |
| `UNASSIGN` | `abapunassign.htm` | `UNASSIGN <fs>` 후 Field Symbol은 memory area를 가리키지 않고 `<fs> IS ASSIGNED`가 false가 된다. `CLEAR <fs>`와 다르다. |
| Dynamic component | `abapassign_dynamic_components.htm` | `struc-(comp)`, `dref->(comp_name)`, `COMPONENT comp OF STRUCTURE struc`가 있으며, component name/position과 실패 시 `sy-subrc`를 반영했다. |
| Dynamic object name | `abapassign_mem_area_dynamic_dobj.htm` | `(dobj_name)`은 실행 시점에 data object 이름을 찾으며, 더 이상 권장되지 않고 구조 component 접근에는 다른 variant가 우선이다. |
| Data reference 생성 | `abapcreate_data.htm` | `CREATE DATA`는 실행 시점에 anonymous data object를 만들고 data reference에 할당한다. 내용 접근은 dereference나 Field Symbol을 통해 한다. |
| `TYPE HANDLE` | `abapcreate_data_handle.htm` | RTTS type description object를 `CREATE DATA ... TYPE HANDLE`에 넘겨 동적 타입의 데이터를 만들 수 있다. |
| RTTS/RTTI | `abenrtti.htm` | type description class 계층, `describe_by_data`, `describe_by_name`, `cl_abap_structdescr->components`를 확인했다. |
| RTTC 예제 | `abencreate_data_via_rttc_abexa.htm` | `cl_abap_structdescr=>get`, component type description, `CREATE DATA ... TYPE HANDLE` 흐름을 확인했다. |

수동 확인 중 `abapassign_component.htm`, `abencl_abap_typedescr.htm`, `abencl_abap_structdescr.htm` 같은 이름은 독립 문서 파일로 확인되지 않았다. 본문에서는 실제 확인한 `abapassign_dynamic_components.htm`, `abenrtti.htm`, `abapcreate_data_handle.htm`의 내용을 기준으로 작성한다.

## NEWCH28-L01 · typed Field Symbol과 generic Field Symbol

### 왜 필요한가

CH06에서 Field Symbol을 처음 배울 때는 다음 한 가지 목적이 중요했다.

> Internal Table의 한 줄을 복사하지 않고 바로 수정한다.

예매 목록을 돌면서 상태를 바꾸는 코드를 보자.

```abap
TYPES:
  BEGIN OF ty_booking,
    booking_id TYPE c LENGTH 10,
    concert_id TYPE c LENGTH 10,
    seats      TYPE i,
    status     TYPE c LENGTH 10,
  END OF ty_booking.

DATA lt_booking TYPE STANDARD TABLE OF ty_booking WITH EMPTY KEY.

LOOP AT lt_booking ASSIGNING FIELD-SYMBOL(<booking>).
  <booking>-status = 'CHECKED'.
ENDLOOP.
```

이때 `<booking>`은 사실상 `ty_booking` 한 줄처럼 쓸 수 있다. `<booking>-status`라고 쓰면 syntax check가 component 존재를 확인해 준다. 이것이 typed Field Symbol이다.

문제는 실무에서 항상 타입을 미리 알 수 있는 것은 아니라는 점이다.

- 공통 로그 도구가 어떤 구조든 받아서 필드명과 값을 보여 줘야 한다.
- 화면 설정에서 사용자가 고른 필드만 읽어야 한다.
- DDIC structure 이름을 받아 실행 중에 빈 데이터를 만들어야 한다.
- ALV, Interface, Migration 도구가 "어떤 테이블이든" 처리해야 한다.

이때 typed Field Symbol만으로는 부족하다. 들어오는 데이터의 모양을 컴파일 시점에 모르면 `TYPE any`, `TYPE ANY TABLE` 같은 generic type을 사용해야 한다.

### 무엇인가

Field Symbol은 변수와 다르다.

| 구분 | 일반 변수 | Field Symbol |
|---|---|---|
| 자기 값 보유 | 자기 memory area를 가진다. | 자기 값이 없다. 다른 memory area를 가리킨다. |
| 선언 직후 사용 | 초기값을 가진 data object로 사용할 수 있다. | 할당 전 사용하면 오류가 난다. |
| 값 변경 | 변수의 memory area가 바뀐다. | 가리키는 원본 memory area가 바뀐다. |
| 타입 | 선언 타입이 data object의 타입이다. | 선언 typing이 "무엇을 가리킬 수 있는가"를 제한한다. |

typed Field Symbol은 타입이 분명하다.

```abap
FIELD-SYMBOLS <booking> TYPE ty_booking.
```

generic Field Symbol은 받을 수 있는 범위를 넓힌다.

```abap
FIELD-SYMBOLS:
  <table> TYPE ANY TABLE,
  <line>  TYPE any,
  <value> TYPE any.
```

여기서 `any`는 "아무거나 마음대로 component 접근 가능"이라는 뜻이 아니다. "어떤 타입의 값이 올지 컴파일러가 구체적으로 모른다"는 뜻이다. 따라서 `<value>-status`처럼 특정 component를 바로 쓰면 안 된다. 먼저 이 값이 구조인지, 그 구조에 `STATUS` component가 있는지 확인해야 한다.

### 어떻게 확인하는가

학습자가 typed와 generic의 차이를 직접 확인하게 하려면, 같은 데이터를 두 방식으로 다룬다.

```abap
DATA ls_booking TYPE ty_booking.

ls_booking-booking_id = 'B0001'.
ls_booking-status     = 'OPEN'.

FIELD-SYMBOLS <typed> TYPE ty_booking.
ASSIGN ls_booking TO <typed>.

IF <typed> IS ASSIGNED.
  <typed>-status = 'CHECKED'.
ENDIF.
```

typed에서는 component 접근이 쉽다. 이제 generic으로 바꿔 본다.

```abap
FIELD-SYMBOLS <generic> TYPE any.
ASSIGN ls_booking TO <generic>.

IF <generic> IS ASSIGNED.
  ASSIGN COMPONENT 'STATUS'
         OF STRUCTURE <generic>
         TO FIELD-SYMBOL(<status>)
         ELSE UNASSIGN.

  IF sy-subrc = 0 AND <status> IS ASSIGNED.
    <status> = 'CHECKED'.
  ENDIF.
ENDIF.
```

같은 구조를 가리키지만, 접근 방식이 달라졌다. generic Field Symbol은 구조인지 아닌지, component가 있는지 없는지 실행 중에 확인해야 한다.

확인 질문은 다음과 같다.

| 확인 질문 | typed | generic |
|---|---|---|
| component 이름을 syntax check가 확인해 주는가? | 예 | 아니오 |
| 어떤 구조든 받을 수 있는가? | 아니오 | 예, 그러나 실행 중 확인 필요 |
| `ASSIGN COMPONENT`가 필요한가? | 보통 필요 없음 | 자주 필요 |
| 실패 가능성을 코드가 다뤄야 하는가? | 상대적으로 적음 | 반드시 다뤄야 함 |

### 실수/주의

- Field Symbol을 선언만 하고 사용하면 안 된다. 먼저 `ASSIGN` 성공 여부를 확인한다.
- `TYPE any`를 쓰면 코드는 유연해지지만, 컴파일러가 대신 잡아 주던 실수를 개발자가 직접 검증해야 한다.
- `<fs> IS ASSIGNED`는 "현재 어딘가를 가리키는가"만 말한다. 방금 시도한 dynamic `ASSIGN`이 성공했다는 뜻으로만 해석하면 위험하다.
- Field Symbol에 값을 대입하면 Field Symbol이라는 이름표가 바뀌는 것이 아니라, 그 이름표가 가리키는 원본 값이 바뀐다.
- generic Field Symbol이 많아질수록 코드 읽기가 어려워진다. 업무 구조가 명확하면 typed Field Symbol을 우선한다.

### 체험 설계

**Field Symbol Pointer Board**를 만든다.

| 요소 | 설계 |
|---|---|
| 데이터 | `ls_booking` 구조: `BOOKING_ID = B0001`, `STATUS = OPEN`, `SEATS = 2` |
| 버튼 | `Declare typed`, `Assign typed`, `Change typed-status`, `Declare generic`, `Assign generic`, `Assign component STATUS`, `Change generic component`, `Unassign` |
| 상태 | `typedAssigned`, `genericAssigned`, `lastAssignSubrc`, `selectedComponent`, `sourceStatus` |
| 시각화 | 왼쪽에는 실제 memory box `ls_booking`, 오른쪽에는 `<typed>`, `<generic>`, `<status>` 이름표를 배치한다. |
| 피드백 | 할당 전 수정 버튼을 누르면 "Field Symbol은 아직 memory area를 가리키지 않습니다"를 표시한다. generic에서 component 선택 전 수정하면 "`TYPE any`는 component를 바로 알 수 없습니다"를 표시한다. |

학습 포인트는 "Field Symbol이 값을 담는 작은 상자가 아니라, 원본 상자에 붙는 이름표"라는 감각이다.

### 정리

typed Field Symbol은 이미 모양을 아는 데이터를 빠르고 명확하게 다룰 때 쓴다. generic Field Symbol은 모양을 실행 중에 확인해야 하는 공통 도구에서 쓴다. generic은 더 강력하지만 더 안전하지 않다. 더 많은 확인 책임이 개발자에게 온다.

## NEWCH28-L02 · `TYPE any`, `ANY TABLE`, generic formal parameter

### 왜 필요한가

공통 도구를 만들 때는 특정 structure만 받으면 부족하다.

예를 들어 "값을 로그에 남기는 메서드"를 만든다고 하자. 예매 구조, 고객 구조, 메시지 구조를 모두 받을 수 있어야 한다면 매번 overload처럼 메서드를 여러 개 만드는 것은 비효율적이다.

```abap
METHODS write_booking IMPORTING is_booking TYPE ty_booking.
METHODS write_customer IMPORTING is_customer TYPE ty_customer.
METHODS write_message IMPORTING is_message TYPE ty_message.
```

처음에는 이해하기 쉽지만, 공통 로깅/검사/변환 도구가 많아질수록 중복이 늘어난다. 이럴 때 generic formal parameter를 사용한다.

### 무엇인가

formal parameter는 method나 FORM이 받는 입력/출력 자리다. generic formal parameter는 그 자리의 타입을 넓게 잡는다.

| generic type | 의미 | 주 사용처 |
|---|---|---|
| `TYPE any` | 어떤 data object든 받을 수 있다. | 값 표시, 구조 검사, generic validator |
| `TYPE data` | `any`와 비슷하게 일반 data object를 받는 generic typing 문맥에서 사용된다. | dynamic assignment inline typing 이해 |
| `TYPE ANY TABLE` | 어떤 internal table이든 받을 수 있다. | table row count, generic table display, ALV helper |
| `TYPE STANDARD TABLE` 등 generic table category | table 종류 일부만 고정하고 line type은 열어 둔다. | table 처리 도구 |

간단한 method 예시는 다음과 같다.

```abap
CLASS lcl_value_inspector DEFINITION.
  PUBLIC SECTION.
    METHODS describe_value
      IMPORTING iv_value TYPE any.

    METHODS count_rows
      IMPORTING it_table TYPE ANY TABLE
      RETURNING VALUE(rv_count) TYPE i.
ENDCLASS.

CLASS lcl_value_inspector IMPLEMENTATION.
  METHOD describe_value.
    DATA(lo_type) = cl_abap_typedescr=>describe_by_data( iv_value ).
    WRITE: / lo_type->absolute_name, lo_type->type_kind.
  ENDMETHOD.

  METHOD count_rows.
    rv_count = lines( it_table ).
  ENDMETHOD.
ENDCLASS.
```

`count_rows`는 line type을 몰라도 행 수는 셀 수 있다. 그러나 line의 특정 component를 읽으려면 추가 확인이 필요하다.

### 어떻게 확인하는가

generic parameter가 "가능한 작업"과 "불가능한 작업"을 구분하게 한다.

```abap
METHOD show_first_line.
  FIELD-SYMBOLS <line> TYPE any.

  LOOP AT it_table ASSIGNING <line>.
    " 여기서 <line>-booking_id 라고 바로 쓰면 안 된다.
    WRITE / <line>.
    EXIT.
  ENDLOOP.
ENDMETHOD.
```

위 코드는 line이 elementary value이면 출력할 수 있다. 하지만 line이 structure이면 단순 `WRITE / <line>`은 기대한 형태로 보이지 않을 수 있다. 더 중요한 문제는 `<line>-booking_id`를 바로 쓰는 것이 불가능하다는 점이다. `it_table TYPE ANY TABLE`은 line type을 모른다.

component가 필요하면 다음 단계로 넘어간다.

```abap
METHOD show_component.
  FIELD-SYMBOLS:
    <line>  TYPE any,
    <value> TYPE any.

  LOOP AT it_table ASSIGNING <line>.
    ASSIGN COMPONENT iv_component
           OF STRUCTURE <line>
           TO <value>
           ELSE UNASSIGN.

    IF sy-subrc = 0 AND <value> IS ASSIGNED.
      WRITE / <value>.
    ELSE.
      WRITE / |Component { iv_component } was not found.|.
    ENDIF.

    EXIT.
  ENDLOOP.
ENDMETHOD.
```

학습자는 여기서 두 가지를 확인한다.

1. `TYPE ANY TABLE`만으로는 line 구조를 알 수 없다.
2. component 접근은 `ASSIGN COMPONENT`와 실패 처리까지 포함해야 한다.

### 실수/주의

- generic parameter를 쓰면 method signature는 유연해지지만, method 내부 검증 코드가 늘어난다.
- "어떤 table이든 받는다"와 "어떤 table이든 같은 업무 규칙을 적용할 수 있다"는 다르다.
- `TYPE any` parameter에 대해 산술 연산, component 접근, table operation을 바로 수행하면 안 된다. 먼저 타입을 확인해야 한다.
- 공통 도구가 업무 규칙까지 알아야 한다면 generic이 오히려 설계를 흐릴 수 있다. 업무별 class/interface가 더 나을 수 있다.

### 체험 설계

**Generic Parameter Gate**를 만든다.

| 요소 | 설계 |
|---|---|
| 데이터 세트 | `lt_booking`, `lt_customer`, `lt_message`, `lv_text` |
| 버튼 | `Pass structure`, `Pass table`, `Pass elementary`, `Try direct component`, `Use ASSIGN COMPONENT`, `Use RTTS check` |
| 상태 | `inputKind`, `isTable`, `isStructure`, `componentName`, `componentFound`, `allowedOperations` |
| 피드백 | direct component 시도 시 "컴파일 시점에 component를 모릅니다"를 표시한다. RTTS check 후에는 "구조입니다: component 목록을 확인할 수 있습니다"를 표시한다. |
| 시각화 | parameter 입구를 funnel처럼 표현하고, 통과 후 `allowed operations` 목록이 바뀌게 한다. |

### 정리

generic type은 공통 도구를 만들 때 필요하다. 그러나 generic은 "편하게 아무거나 쓰기"가 아니라 "어떤 것이 들어왔는지 실행 중에 확인하고, 확인된 범위 안에서만 다루기"다. 이 원칙을 놓치면 generic 코드는 가장 디버깅하기 어려운 코드가 된다.

## NEWCH28-L03 · `ASSIGN`, `UNASSIGN`, `IS ASSIGNED`, `ELSE UNASSIGN`

### 왜 필요한가

Field Symbol을 안전하게 쓰는 첫 번째 기준은 "지금 무엇을 가리키는가"를 분명히 아는 것이다. 특히 dynamic `ASSIGN`에서는 실패해도 runtime error가 나지 않고 `sy-subrc`만 바뀌는 경우가 있다. 더 위험한 것은 실패 후에도 Field Symbol이 예전 할당을 계속 가리킬 수 있다는 점이다.

다음 상황을 생각해 보자.

1. `<value>`가 `STATUS` component를 가리키고 있다.
2. 다음 줄에서 존재하지 않는 `UNKNOWN_FIELD` component를 할당하려고 한다.
3. 실패했는데 `<value>`가 여전히 이전 `STATUS`를 가리킨다.
4. 개발자가 `<value> IS ASSIGNED`만 보고 성공으로 착각한다.

이 실수는 동적 ABAP에서 자주 발생한다.

### 무엇인가

`ASSIGN`은 memory area를 Field Symbol에 연결한다.

```abap
FIELD-SYMBOLS <value> TYPE any.

ASSIGN lv_status TO <value>.

IF <value> IS ASSIGNED.
  WRITE / <value>.
ENDIF.
```

`UNASSIGN`은 연결을 끊는다.

```abap
UNASSIGN <value>.

IF <value> IS NOT ASSIGNED.
  WRITE / 'No memory area is assigned now.'.
ENDIF.
```

`CLEAR <value>`와 `UNASSIGN <value>`는 다르다.

| 문장 | 의미 |
|---|---|
| `CLEAR <value>` | `<value>`가 가리키는 원본 memory area의 내용을 초기화한다. |
| `UNASSIGN <value>` | `<value>`가 더 이상 어떤 memory area도 가리키지 않게 한다. |

### 어떻게 확인하는가

먼저 정적 할당을 본다.

```abap
DATA lv_status TYPE c LENGTH 10 VALUE 'OPEN'.
FIELD-SYMBOLS <status> TYPE c.

ASSIGN lv_status TO <status>.

IF <status> IS ASSIGNED.
  <status> = 'CHECKED'.
ENDIF.
```

`lv_status` 값이 `CHECKED`로 바뀐다. Field Symbol이 원본을 가리키기 때문이다.

이제 dynamic component 할당에서 실패를 확인한다.

```abap
DATA:
  BEGIN OF ls_booking,
    booking_id TYPE c LENGTH 10 VALUE 'B0001',
    status     TYPE c LENGTH 10 VALUE 'OPEN',
  END OF ls_booking.

FIELD-SYMBOLS <field> TYPE any.

ASSIGN COMPONENT 'STATUS'
       OF STRUCTURE ls_booking
       TO <field>.

WRITE: / sy-subrc, <field>.

ASSIGN COMPONENT 'UNKNOWN_FIELD'
       OF STRUCTURE ls_booking
       TO <field>.

IF <field> IS ASSIGNED.
  WRITE / |Still assigned: { <field> }|.
ENDIF.
```

두 번째 `ASSIGN COMPONENT`가 실패해도, `ELSE UNASSIGN`이 없으면 `<field>`가 이전 `STATUS`를 계속 가리킬 수 있다. 따라서 dynamic assignment에서는 다음 형태를 기본 습관으로 잡는다.

```abap
ASSIGN COMPONENT lv_component
       OF STRUCTURE ls_booking
       TO <field>
       ELSE UNASSIGN.

IF sy-subrc = 0 AND <field> IS ASSIGNED.
  WRITE / <field>.
ELSE.
  WRITE / |Component { lv_component } was not found.|.
ENDIF.
```

이 패턴은 두 가지를 동시에 보장한다.

| 확인 | 이유 |
|---|---|
| `sy-subrc = 0` | 방금 시도한 `ASSIGN`이 성공했는지 확인한다. |
| `<field> IS ASSIGNED` | 실제로 memory area를 가리키는지 확인한다. |

### 실수/주의

- dynamic `ASSIGN` 후 `<fs> IS ASSIGNED`만 확인하면 이전 할당을 성공으로 착각할 수 있다.
- 실패 시 이전 할당을 남길 의도가 없다면 `ELSE UNASSIGN`을 붙인다.
- `UNASSIGN`은 Field Symbol 연결만 끊는다. 원본 데이터가 사라지는 것이 아니다.
- `CLEAR <fs>`는 연결을 끊지 않는다. 원본 값을 지운다.
- `ASSIGN`이 illegal memory access를 일으키는 상황은 예외가 날 수 있다. `sy-subrc`만으로 모든 위험을 설명할 수 있다고 생각하면 안 된다.

### 체험 설계

**ASSIGN State Machine**을 만든다.

| 상태 | 의미 |
|---|---|
| `unassigned` | Field Symbol이 아무것도 가리키지 않음 |
| `assigned:STATUS` | `STATUS` component를 가리킴 |
| `failed:keptPrevious` | 실패했지만 `ELSE UNASSIGN`이 없어 이전 할당 유지 |
| `failed:unassigned` | 실패했고 `ELSE UNASSIGN`으로 연결 해제 |

| 버튼 | 동작 |
|---|---|
| `Assign STATUS` | `sy-subrc = 0`, `<field>`가 `STATUS`를 가리킴 |
| `Assign UNKNOWN without ELSE` | `sy-subrc = 4`, `<field>`는 이전 상태 유지 |
| `Assign UNKNOWN with ELSE` | `sy-subrc = 4`, `<field>`는 unassigned |
| `CLEAR <field>` | 원본 component 값을 초기화 |
| `UNASSIGN <field>` | 연결만 해제 |

피드백 문구는 다음처럼 구체적으로 둔다.

- "`ASSIGN`은 실패했습니다. 그러나 `ELSE UNASSIGN`이 없어서 `<field>`는 아직 STATUS를 가리킵니다."
- "`CLEAR <field>`를 눌렀습니다. Field Symbol이 아니라 원본 STATUS 값이 초기화되었습니다."
- "`UNASSIGN <field>`를 눌렀습니다. 원본 STATUS 값은 유지되고 연결만 끊겼습니다."

### 정리

동적 ABAP에서 `ASSIGN`은 항상 "성공했는가"와 "지금 무엇을 가리키는가"를 분리해서 본다. `ELSE UNASSIGN`, `sy-subrc`, `<fs> IS ASSIGNED`를 함께 쓰면 이전 할당 유지 함정을 줄일 수 있다.

## NEWCH28-L04 · `ASSIGN COMPONENT`: 구조의 필드를 실행 중에 고르기

### 왜 필요한가

일반적인 ABAP 코드는 component 이름을 직접 쓴다.

```abap
WRITE / ls_booking-status.
```

이 코드는 명확하고 안전하다. 그러나 사용자가 화면에서 표시할 필드를 고르거나, 설정 테이블에 저장된 필드 목록을 읽어야 한다면 component 이름이 코드 작성 시점이 아니라 실행 시점에 결정된다.

```text
사용자 선택 필드: BOOKING_ID, STATUS
출력해야 할 값: ls_booking-booking_id, ls_booking-status
```

이때 문자열 `STATUS`를 구조 component 접근으로 바꾸는 문법이 `ASSIGN COMPONENT`다.

### 무엇인가

기본 형태는 다음이다.

```abap
ASSIGN COMPONENT lv_component
       OF STRUCTURE ls_booking
       TO FIELD-SYMBOL(<value>)
       ELSE UNASSIGN.
```

`lv_component`에는 component 이름 또는 위치가 들어갈 수 있다.

| component 지정 | 예 | 의미 |
|---|---|---|
| 이름 | `'STATUS'` | `STATUS` component를 찾는다. 대소문자는 실무상 구분하지 않지만 이름을 표준화하는 것이 좋다. |
| 위치 | `1` | 구조의 첫 번째 component를 찾는다. |
| `0` | `0` | 전체 구조 memory area를 할당하는 특수한 의미가 있으므로 입문 실습에서는 피한다. |

구조가 아닌 값에 `ASSIGN COMPONENT`를 시도하거나 component가 없으면 `sy-subrc`가 4가 될 수 있다. 일부 잘못된 동적 지정은 예외가 될 수 있으므로, 사전에 구조 여부와 component 목록을 확인하는 습관이 필요하다.

### 어떻게 확인하는가

먼저 고정 component 접근과 dynamic component 접근을 나란히 비교한다.

```abap
TYPES:
  BEGIN OF ty_booking,
    booking_id TYPE c LENGTH 10,
    concert_id TYPE c LENGTH 10,
    seats      TYPE i,
    status     TYPE c LENGTH 10,
  END OF ty_booking.

DATA ls_booking TYPE ty_booking.

ls_booking-booking_id = 'B0001'.
ls_booking-concert_id = 'C1000'.
ls_booking-seats      = 2.
ls_booking-status     = 'OPEN'.

DATA(lv_component) = 'STATUS'.

ASSIGN COMPONENT lv_component
       OF STRUCTURE ls_booking
       TO FIELD-SYMBOL(<value>)
       ELSE UNASSIGN.

IF sy-subrc = 0 AND <value> IS ASSIGNED.
  WRITE / |{ lv_component } = { <value> }|.
ENDIF.
```

이제 component 목록을 돌며 모든 값을 출력한다.

```abap
DO.
  ASSIGN COMPONENT sy-index
         OF STRUCTURE ls_booking
         TO FIELD-SYMBOL(<component>)
         ELSE UNASSIGN.

  IF sy-subrc <> 0.
    EXIT.
  ENDIF.

  WRITE: / sy-index, <component>.
ENDDO.
```

이 코드는 component 이름을 몰라도 위치 순서대로 값을 읽는다. 그러나 실무에서는 위치 기반 접근보다 이름 기반 접근이 읽기 쉽고 안전한 경우가 많다. 위치는 structure 정의가 바뀌면 의미가 변하기 때문이다.

다음은 설정 필드 목록을 사용하는 예다.

```abap
DATA lt_requested_fields TYPE STANDARD TABLE OF string WITH EMPTY KEY.

lt_requested_fields = VALUE #(
  ( `BOOKING_ID` )
  ( `STATUS`     )
  ( `UNKNOWN`    )
).

LOOP AT lt_requested_fields INTO DATA(lv_field_name).
  ASSIGN COMPONENT lv_field_name
         OF STRUCTURE ls_booking
         TO FIELD-SYMBOL(<field>)
         ELSE UNASSIGN.

  IF sy-subrc = 0 AND <field> IS ASSIGNED.
    WRITE / |{ lv_field_name } = { <field> }|.
  ELSE.
    WRITE / |{ lv_field_name } is not a component of ty_booking.|.
  ENDIF.
ENDLOOP.
```

학습자는 `UNKNOWN`에서 실패가 발생하고, 그 실패가 데이터 손상 없이 피드백으로 처리되는 것을 확인해야 한다.

### 실수/주의

- `ASSIGN COMPONENT`는 구조 component 접근을 동적으로 만드는 도구다. 단순히 "짧게 쓰기" 위해 쓰는 문법이 아니다.
- component 이름을 사용자 입력에서 직접 받으면 whitelist가 필요하다. 허용된 component 목록에 있는지 먼저 검사한다.
- 실패 처리 없이 `<field>`를 사용하면 unassigned field symbol 접근 오류 또는 이전 할당 착각이 생길 수 있다.
- position 기반 접근은 structure 순서 변경에 취약하다. 디버깅 도구나 단순 inspector에는 유용하지만, 업무 규칙에는 component 이름 기반이 더 명확하다.
- component name으로 구조 내부의 더 깊은 selector까지 허용하면 코드가 급격히 어려워진다. 입문 실습에서는 단일 component 이름만 허용한다.

### 체험 설계

**Dynamic Component Picker**를 만든다.

| 요소 | 설계 |
|---|---|
| 데이터 | `ls_booking`: `BOOKING_ID`, `CONCERT_ID`, `SEATS`, `STATUS` |
| 입력 | component name text box, component position stepper |
| 버튼 | `Assign by name`, `Assign by position`, `Try unknown`, `Use ELSE UNASSIGN`, `Change selected value` |
| 상태 | `componentInput`, `assignMode`, `sySubrc`, `fsAssigned`, `selectedMemory`, `allowedByWhitelist` |
| 피드백 | 없는 component면 "component가 없습니다. 이전 할당을 유지하지 않도록 ELSE UNASSIGN을 사용했습니다." 표시 |
| 시각화 | structure table에서 선택된 component cell에 highlight를 주고, `<field>` label이 그 cell을 가리키게 한다. |

확장 모드에서는 whitelist panel을 둔다.

```text
Allowed components:
[x] BOOKING_ID
[ ] CONCERT_ID
[x] STATUS
[ ] SEATS
```

사용자가 `SEATS`를 입력했지만 whitelist에서 꺼져 있으면 "구조에는 있지만 이 도구에서 허용하지 않은 component"라고 피드백한다. 이것이 보안/업무 경계의 시작이다.

### 정리

`ASSIGN COMPONENT`는 구조 component 이름이나 위치가 실행 중에 결정될 때 사용하는 공식적인 동적 접근 도구다. 구조 component를 동적으로 읽어야 한다면 `ASSIGN (name)`보다 `ASSIGN COMPONENT ... OF STRUCTURE`를 우선한다.

## NEWCH28-L05 · `ASSIGN (name)`: 이름 문자열로 data object 찾기

### 왜 필요한가

실무 코드에는 다음과 같은 문장이 등장할 수 있다.

```abap
DATA(lv_name) = `SY-DATUM`.

ASSIGN (lv_name) TO FIELD-SYMBOL(<value>) ELSE UNASSIGN.
```

문자열 `SY-DATUM`이 실제 system field `sy-datum`으로 연결된다. 처음 보면 매우 편리해 보인다. 그러나 이 문법은 위험하다. 문자열이 단순 label이 아니라 실행 중 data object 이름으로 해석되기 때문이다.

### 무엇인가

`ASSIGN (name)`은 괄호 안의 character-like 값이 가리키는 이름을 runtime에 찾아 Field Symbol에 연결한다.

```abap
DATA lv_status TYPE c LENGTH 10 VALUE 'OPEN'.
DATA lv_name   TYPE string VALUE 'LV_STATUS'.

ASSIGN (lv_name) TO FIELD-SYMBOL(<dyn>) ELSE UNASSIGN.

IF sy-subrc = 0 AND <dyn> IS ASSIGNED.
  WRITE / <dyn>.
ENDIF.
```

이 문법에서 중요한 점은 search order다. 실행 위치에 따라 local data, method에서 보이는 attribute, current program의 global data, `TABLES` interface work area 등이 검색 대상이 될 수 있다. 따라서 이름 충돌과 의도치 않은 접근이 생길 수 있다.

공식 문서에서도 이 variant는 더 이상 권장되지 않으며, 특히 structure component 접근에는 다른 variant가 우선이라고 안내한다. 이 장에서는 `ASSIGN (name)`을 "읽을 수 있어야 하는 고급 문법"으로 다루되, 새 코드에서 남용하지 않는 방향으로 가르친다.

### 어떻게 확인하는가

먼저 단순한 local data object를 찾는다.

```abap
DATA lv_amount TYPE i VALUE 120.
DATA lv_name   TYPE string VALUE 'LV_AMOUNT'.

ASSIGN (lv_name) TO FIELD-SYMBOL(<amount>) ELSE UNASSIGN.

IF sy-subrc = 0 AND <amount> IS ASSIGNED.
  <amount> = <amount> + 10.
ENDIF.

WRITE / lv_amount.
```

결과는 `130`이다. `<amount>`를 바꾼 것이 원본 `lv_amount`를 바꿨기 때문이다.

이제 같은 목적을 `ASSIGN COMPONENT`로 바꾸어 비교한다.

```abap
DATA:
  BEGIN OF ls_booking,
    amount TYPE i VALUE 120,
    status TYPE c LENGTH 10 VALUE 'OPEN',
  END OF ls_booking.

DATA(lv_component) = 'AMOUNT'.

ASSIGN COMPONENT lv_component
       OF STRUCTURE ls_booking
       TO FIELD-SYMBOL(<component>)
       ELSE UNASSIGN.

IF sy-subrc = 0 AND <component> IS ASSIGNED.
  <component> = <component> + 10.
ENDIF.
```

두 코드는 모두 동적으로 값을 찾지만, 의미가 다르다.

| 방식 | 동적 대상 | 권장 상황 |
|---|---|---|
| `ASSIGN (name)` | 프로그램 안의 data object 이름 전체 | 기존 코드 읽기, 제한된 진단 도구, system field 예제 |
| `ASSIGN COMPONENT` | 특정 structure 안의 component | 구조 필드 선택, generic inspector, 설정 기반 field display |

구조 안에서 필드를 고르는 문제라면 `ASSIGN COMPONENT`가 더 안전하고 의도가 선명하다.

### 안전 설계: whitelist

`ASSIGN (name)`을 정말 써야 한다면 문자열을 그대로 믿지 않는다.

```abap
DATA lt_allowed TYPE STANDARD TABLE OF string WITH EMPTY KEY.

lt_allowed = VALUE #(
  ( `SY-DATUM` )
  ( `SY-UZEIT` )
  ( `SY-UNAME` )
).

DATA(lv_name) = `SY-DATUM`.

READ TABLE lt_allowed
     WITH KEY table_line = lv_name
     TRANSPORTING NO FIELDS.

IF sy-subrc <> 0.
  WRITE / |{ lv_name } is not allowed.|.
  RETURN.
ENDIF.

ASSIGN (lv_name) TO FIELD-SYMBOL(<value>) ELSE UNASSIGN.

IF sy-subrc = 0 AND <value> IS ASSIGNED.
  WRITE / |{ lv_name } = { <value> }|.
ENDIF.
```

whitelist는 "이 도구가 접근해도 되는 이름"의 명단이다. 사용자 입력, customizing table, 외부 파일에서 들어온 이름을 그대로 `(name)`에 넣지 않는다.

### 실수/주의

- `ASSIGN (name)`은 문자열 기반 runtime lookup이다. 오타가 syntax check에서 잡히지 않을 수 있다.
- 검색 범위를 개발자가 직관적으로 오해하기 쉽다. 같은 이름의 local/global/attribute가 있으면 의도와 다른 데이터를 찾을 수 있다.
- 사용자 입력을 그대로 넣으면 내부 데이터 노출 위험이 생긴다.
- structure component 접근에는 `ASSIGN COMPONENT`를 우선한다.
- `(PROG)DOBJ` 형태의 cross-program 접근은 내부용 성격이 강하고 유지보수 위험이 크다. 입문/일반 실무 코드에서는 사용하지 않는 경계로 둔다.
- Field Symbol은 접근 권한 확인이 `ASSIGN` 지점에 집중된다. private/read-only attribute를 외부로 노출하는 형태를 만들면 캡슐화가 무너진다.

### 체험 설계

**Runtime Name Lookup Lab**을 만든다.

| 요소 | 설계 |
|---|---|
| 데이터 | local `lv_status`, global처럼 표현한 `gv_status`, system field 카드 `sy-datum`, 구조 `ls_booking-status` |
| 입력 | name text box: `LV_STATUS`, `GV_STATUS`, `SY-DATUM`, `LS_BOOKING-STATUS`, `UNKNOWN` |
| 버튼 | `Assign by name`, `Apply whitelist`, `Show search order`, `Prefer component mode`, `Reset` |
| 상태 | `rawName`, `normalizedName`, `whitelistPassed`, `foundScope`, `sySubrc`, `fsAssigned`, `riskLevel` |
| 피드백 | whitelist 실패 시 "문자열 이름은 허용 목록을 통과해야 합니다" 표시 |
| 시각화 | search order ladder: Local -> Visible attributes -> Global -> TABLES work area -> dynamic type of me |

`LS_BOOKING-STATUS`를 입력하면 "구조 component 접근은 가능하더라도 이 실습에서는 `ASSIGN COMPONENT` 모드로 전환하는 것을 권장합니다"라는 피드백을 준다. 학습자는 같은 값을 찾는 더 명확한 도구가 있음을 이해한다.

### 정리

`ASSIGN (name)`은 동적 ABAP을 읽기 위해 알아야 하지만, 새 코드에서 쉽게 선택할 문법은 아니다. 문자열로 프로그램 data object를 찾는 것은 강력한 만큼 위험하다. 구조 component 선택은 `ASSIGN COMPONENT`, 이름 기반 진단 도구는 whitelist와 실패 처리를 전제로 설계한다.

## NEWCH28-L06 · `REF TO data`와 `CREATE DATA`: 실행 중 data object 만들기

### 왜 필요한가

지금까지의 예제는 이미 존재하는 데이터를 Field Symbol이 가리켰다. 그런데 실행 중에 타입을 결정해야 하는 경우가 있다.

- 사용자가 DDIC structure 이름을 선택하면 그 타입의 빈 row를 만들고 싶다.
- generic upload 도구가 파일 header를 보고 structure를 만들고 싶다.
- RTTS로 만든 type description object에 맞춰 anonymous data object를 만들고 싶다.

이때 `DATA ls_booking TYPE ty_booking`처럼 컴파일 시점에 이름 있는 변수를 선언할 수 없다. 실행 시점에 data object를 만들어야 한다. 이 역할을 하는 문법이 `CREATE DATA`이고, 그 객체를 잡고 있는 손잡이가 data reference다.

### 무엇인가

`REF TO data`는 어떤 data object든 가리킬 수 있는 generic data reference다.

```abap
DATA lr_data TYPE REF TO data.
```

`CREATE DATA`는 실행 시점에 anonymous data object를 만들고 그 reference를 `lr_data`에 넣는다.

```abap
CREATE DATA lr_data TYPE ty_booking.
```

anonymous data object는 이름 있는 변수처럼 직접 `lr_data-status`로 접근하지 않는다. reference를 역참조하거나 Field Symbol에 할당해서 접근한다.

```abap
ASSIGN lr_data->* TO FIELD-SYMBOL(<data>) ELSE UNASSIGN.
```

이제 `<data>`가 방금 만든 data object를 가리킨다.

### 어떻게 확인하는가

먼저 정적 타입으로 anonymous data object를 만든다.

```abap
DATA lr_booking TYPE REF TO data.

CREATE DATA lr_booking TYPE ty_booking.

ASSIGN lr_booking->* TO FIELD-SYMBOL(<booking>) ELSE UNASSIGN.

IF sy-subrc = 0 AND <booking> IS ASSIGNED.
  ASSIGN COMPONENT 'BOOKING_ID'
         OF STRUCTURE <booking>
         TO FIELD-SYMBOL(<booking_id>)
         ELSE UNASSIGN.

  IF sy-subrc = 0 AND <booking_id> IS ASSIGNED.
    <booking_id> = 'B9000'.
  ENDIF.
ENDIF.
```

여기서 중요한 흐름은 세 단계다.

```text
CREATE DATA
  -> data reference가 anonymous data object를 가리킴
  -> ASSIGN dref->* 로 Field Symbol이 실제 content를 가리킴
  -> ASSIGN COMPONENT로 내부 component 접근
```

이제 타입 이름을 문자열로 받는 형태를 본다.

```abap
DATA lr_any TYPE REF TO data.
DATA lv_type_name TYPE string VALUE 'SYST'.

TRY.
    CREATE DATA lr_any TYPE (lv_type_name).
  CATCH cx_sy_create_data_error INTO DATA(lx_create).
    WRITE / lx_create->get_text( ).
    RETURN.
ENDTRY.

ASSIGN lr_any->* TO FIELD-SYMBOL(<any_data>) ELSE UNASSIGN.
```

시스템에 존재하지 않는 타입 이름을 넣으면 data object가 만들어지지 않는다. `CREATE DATA`는 `sy-subrc`로 확인하는 문법이 아니다. 예외 처리와 입력 검증이 필요하다.

### `TYPE HANDLE`의 위치

RTTS/RTTC에서는 type description object를 만들거나 읽은 뒤, 그 handle로 data object를 만들 수 있다.

```abap
DATA lr_data TYPE REF TO data.

DATA(lo_type) = CAST cl_abap_datadescr(
  cl_abap_typedescr=>describe_by_name( 'SYST' )
).

CREATE DATA lr_data TYPE HANDLE lo_type.
```

이 코드는 `'SYST'`라는 타입 이름을 RTTS type description object로 읽고, 그 type description object를 `CREATE DATA`에 넘긴다. NEWCH28에서는 `TYPE HANDLE`을 "RTTS가 읽거나 만든 타입 설명서를 `CREATE DATA`가 사용하는 연결점"으로 이해하면 된다.

RTTC로 완전히 새로운 structure type을 만드는 것은 가능하지만, 입문자에게는 과밀하다. 이 장에서는 작은 예로만 감각을 잡고, full dynamic type generator는 보류한다.

### 실수/주의

- `REF TO data`는 generic reference다. 어떤 타입인지 모르면 component 접근 전에 타입 확인이 필요하다.
- `CREATE DATA`는 실행 시점에 object를 만든다. `DATA` 선언처럼 프로그램 로드 시점에 고정되는 것이 아니다.
- `CREATE DATA ... TYPE (lv_type_name)`에서 `lv_type_name`을 사용자 입력 그대로 사용하지 않는다. 허용 타입 목록을 둔다.
- `CREATE DATA` 실패는 `sy-subrc`가 아니라 예외로 다뤄야 한다.
- data reference가 initial이면 `ASSIGN lr_data->*`는 실패하고 `sy-subrc = 4`가 될 수 있다. 항상 확인한다.
- Field Symbol이나 reference가 anonymous data object를 계속 가리키는 동안 해당 object는 살아 있다. "이름이 없으니 바로 사라진다"가 아니다.

### 체험 설계

**Anonymous Data Factory**를 만든다.

| 요소 | 설계 |
|---|---|
| 타입 선택 | `TY_BOOKING`, `SYST`, `UNKNOWN_TYPE` |
| 버튼 | `CREATE DATA`, `ASSIGN dref->*`, `Show type`, `Assign component`, `Clear reference`, `Reset` |
| 상태 | `typeName`, `createOk`, `referenceInitial`, `assignSubrc`, `fsAssigned`, `componentName`, `componentFound` |
| 피드백 | `UNKNOWN_TYPE` 선택 시 "타입 이름을 확인할 수 없어 anonymous data object를 만들지 못했습니다" 표시 |
| 시각화 | `lr_data` reference arrow가 heap 영역의 anonymous object box를 가리키고, `<data>` Field Symbol이 같은 box를 가리키는 그림 |

추가 버튼 `Compare DATA vs CREATE DATA`를 두어, `DATA ls_booking TYPE ty_booking`은 이름 있는 object, `CREATE DATA lr_data TYPE ty_booking`은 reference로 접근하는 anonymous object임을 비교한다.

### 정리

`CREATE DATA`는 실행 중에 data object를 만드는 문법이고, `REF TO data`는 그 data object를 붙잡는 reference다. 만든 데이터는 `dref->*`를 Field Symbol에 할당해서 다루는 경우가 많다. dynamic type name과 `TYPE HANDLE`을 사용하면 유연해지지만, 입력 검증과 예외 처리가 필수다.

## NEWCH28-L07 · RTTI/RTTS: 실행 중 타입 정보 읽기

### 왜 필요한가

generic code의 가장 큰 문제는 "무엇이 들어왔는지 모른다"는 점이다. `TYPE any`로 받은 값이 숫자인지, 문자열인지, 구조인지, internal table인지 모르면 안전한 처리를 할 수 없다.

예를 들어 generic inspector가 다음 입력을 모두 받는다고 하자.

| 입력 | 하고 싶은 일 |
|---|---|
| 숫자 | 타입과 값을 표시 |
| 문자열 | 길이와 값을 표시 |
| 구조 | component 목록과 값을 표시 |
| internal table | 행 수와 line type 표시 |

이 판단을 감으로 할 수는 없다. 실행 중 타입 정보를 읽어야 한다. 이때 사용하는 것이 RTTI/RTTS다.

### 무엇인가

RTTS(Runtime Type Services)는 ABAP의 runtime type service 전체를 말한다. 그 안에서 두 용어를 구분해 이해하면 좋다.

| 용어 | 의미 | 이 장의 사용 |
|---|---|---|
| RTTI | Runtime Type Identification. 실행 중 기존 data object나 type name의 타입 정보를 읽는다. | `describe_by_data`, `describe_by_name`, `type_kind`, `components` |
| RTTC | Runtime Type Creation. 실행 중 새로운 type description object를 만들고 데이터 생성에 사용한다. | `cl_abap_structdescr=>get`, `CREATE DATA ... TYPE HANDLE` 개념 소개 |
| RTTS | RTTI와 RTTC를 포함하는 type service 체계 | 전체 이름 |

대표 클래스 계층은 다음 감각으로 잡는다.

```text
CL_ABAP_TYPEDESCR
  |
  +-- CL_ABAP_DATADESCR
        |
        +-- CL_ABAP_ELEMDESCR
        +-- CL_ABAP_COMPLEXDESCR
              |
              +-- CL_ABAP_STRUCTDESCR
              +-- CL_ABAP_TABLEDESCR
```

입문자는 모든 attribute와 method를 외울 필요가 없다. 이 장에서는 다음 네 가지만 익힌다.

| 필요 | 대표 사용 |
|---|---|
| 값의 타입 설명 얻기 | `cl_abap_typedescr=>describe_by_data( iv_value )` |
| 이름으로 타입 설명 얻기 | `cl_abap_typedescr=>describe_by_name( 'SYST' )` |
| 구조 component 목록 얻기 | `CAST cl_abap_structdescr( lo_type )->components` |
| type description으로 데이터 만들기 | `CREATE DATA lr_data TYPE HANDLE lo_data_descr` |

### 어떻게 확인하는가: elementary value

먼저 단순 값의 타입을 읽는다.

```abap
DATA lv_amount TYPE p LENGTH 8 DECIMALS 2 VALUE '120.50'.

DATA(lo_descr) = cl_abap_typedescr=>describe_by_data( lv_amount ).

WRITE: / lo_descr->absolute_name,
       / lo_descr->type_kind,
       / lo_descr->length,
       / lo_descr->decimals.
```

학습자는 "변수의 값"과 "변수의 타입 설명"이 다르다는 점을 구분해야 한다. `lv_amount`는 금액 값이고, `lo_descr`는 그 값의 타입 정보를 담은 설명서다.

### 어떻게 확인하는가: structure component

구조의 component 목록을 읽는다.

```abap
DATA:
  BEGIN OF ls_booking,
    booking_id TYPE c LENGTH 10,
    concert_id TYPE c LENGTH 10,
    seats      TYPE i,
    status     TYPE c LENGTH 10,
  END OF ls_booking.

TRY.
    DATA(lo_struct) = CAST cl_abap_structdescr(
      cl_abap_typedescr=>describe_by_data( ls_booking )
    ).
  CATCH cx_sy_move_cast_error.
    WRITE / 'The value is not a structure.'.
    RETURN.
ENDTRY.

LOOP AT lo_struct->components ASSIGNING FIELD-SYMBOL(<component_descr>).
  WRITE: / <component_descr>-name.
ENDLOOP.
```

`describe_by_data`는 일반 type description reference를 돌려준다. 그 값이 structure라고 확신하려면 `cl_abap_structdescr`로 downcast한다. 구조가 아니면 cast error를 처리한다.

이제 component 설명과 `ASSIGN COMPONENT`를 연결한다.

```abap
LOOP AT lo_struct->components ASSIGNING FIELD-SYMBOL(<component_descr>).
  ASSIGN COMPONENT <component_descr>-name
         OF STRUCTURE ls_booking
         TO FIELD-SYMBOL(<value>)
         ELSE UNASSIGN.

  IF sy-subrc = 0 AND <value> IS ASSIGNED.
    WRITE: / <component_descr>-name, <value>.
  ENDIF.
ENDLOOP.
```

이 흐름이 dynamic structure inspector의 핵심이다.

```text
RTTS로 component 목록 읽기
  -> component 이름을 하나씩 꺼내기
  -> ASSIGN COMPONENT로 실제 값에 접근
  -> 값 출력 또는 검증
```

### 어떻게 확인하는가: type name과 `TYPE HANDLE`

이름으로 타입을 읽고 data object를 만든다.

```abap
DATA lr_data TYPE REF TO data.

TRY.
    DATA(lo_data_descr) = CAST cl_abap_datadescr(
      cl_abap_typedescr=>describe_by_name( 'SYST' )
    ).

    CREATE DATA lr_data TYPE HANDLE lo_data_descr.

  CATCH cx_sy_move_cast_error cx_sy_create_data_error INTO DATA(lx_error).
    WRITE / lx_error->get_text( ).
    RETURN.
ENDTRY.

ASSIGN lr_data->* TO FIELD-SYMBOL(<data>) ELSE UNASSIGN.
```

`describe_by_name`은 이름에 해당하는 type description object를 찾는다. `CREATE DATA ... TYPE HANDLE`은 그 type description object를 사용해 anonymous data object를 만든다.

### 실수/주의

- RTTI는 마법이 아니다. "타입을 모르는 값"을 안전하게 다루기 위한 확인 도구다.
- `describe_by_data` 결과를 무조건 `cl_abap_structdescr`로 cast하면 structure가 아닌 입력에서 예외가 난다. `TRY...CATCH`나 type kind 확인이 필요하다.
- `components`는 구조 component 설명 목록이지 실제 값 목록이 아니다. 실제 값은 `ASSIGN COMPONENT`로 원본 구조에서 읽어야 한다.
- RTTC로 type을 동적으로 만들 수 있지만, 무분별하게 사용하면 코드가 도구인지 업무 로직인지 구분되지 않는다.
- `CREATE DATA ... TYPE HANDLE`에 generic type description을 넘기면 원하는 bound type이 아닐 수 있다. 입문 실습에서는 기존 DDIC/local structure를 읽는 정도로 제한한다.

### 체험 설계

**RTTS Type Lens**를 만든다.

| 요소 | 설계 |
|---|---|
| 입력 카드 | `lv_amount`, `lv_text`, `ls_booking`, `lt_booking` |
| 버튼 | `describe_by_data`, `Cast to struct`, `Show components`, `Assign each component`, `Create data by handle` |
| 상태 | `typeKind`, `absoluteName`, `length`, `decimals`, `castOk`, `componentCount`, `selectedComponent`, `createdByHandle` |
| 시각화 | 값 카드 위에 "type description lens"를 올리면 오른쪽에 metadata panel이 열린다. |
| 피드백 | structure가 아닌 값에서 `Cast to struct`를 누르면 "이 값은 구조가 아니므로 component 목록이 없습니다"를 표시한다. |

학습자는 "타입 설명서"와 "실제 값"을 분리해서 본다.

```text
ls_booking           = 실제 값
lo_struct            = ls_booking의 타입 설명서
lo_struct->components = component 이름/타입 설명 목록
ASSIGN COMPONENT     = 설명서에 있는 이름으로 실제 값에 접근
```

### 정리

RTTI/RTTS는 generic code의 눈이다. `TYPE any`로 들어온 값이 무엇인지 확인하고, 구조라면 component 목록을 읽고, 필요한 경우 그 타입 설명으로 anonymous data object를 만들 수 있다. 이 장에서는 RTTS를 framework 제작 도구가 아니라 안전한 dynamic access의 검증 도구로 사용한다.

## NEWCH28-L08 · 실습: 동적 구조 검사기

### 왜 필요한가

지금까지 배운 문법을 하나로 묶으면 "어떤 구조든 받아 component 목록과 값을 보여 주는 검사기"를 만들 수 있다. 이 실습은 실무에서 자주 보이는 generic helper의 축소판이다.

예를 들어 운영자가 "예매 데이터의 특정 필드만 확인하고 싶다"고 한다.

```text
입력 구조: ty_booking
보고 싶은 필드: BOOKING_ID, STATUS, SEATS
해야 할 일:
1. 입력이 구조인지 확인한다.
2. 구조의 component 목록을 읽는다.
3. 요청 필드가 실제 component인지 확인한다.
4. component 값을 안전하게 읽는다.
5. 없는 필드는 덤프가 아니라 피드백으로 보여 준다.
```

이 실습의 목표는 동적 문법을 많이 쓰는 것이 아니라, 동적 문법을 안전한 순서로 배열하는 것이다.

### 실습 데이터

```abap
TYPES:
  BEGIN OF ty_booking,
    booking_id TYPE c LENGTH 10,
    concert_id TYPE c LENGTH 10,
    customer   TYPE c LENGTH 20,
    seats      TYPE i,
    status     TYPE c LENGTH 10,
  END OF ty_booking.

DATA ls_booking TYPE ty_booking.

ls_booking-booking_id = 'B0001'.
ls_booking-concert_id = 'C1000'.
ls_booking-customer   = '정훈영'.
ls_booking-seats      = 2.
ls_booking-status     = 'OPEN'.

DATA lt_requested TYPE STANDARD TABLE OF string WITH EMPTY KEY.

lt_requested = VALUE #(
  ( `BOOKING_ID` )
  ( `STATUS`     )
  ( `UNKNOWN`    )
  ( `SEATS`      )
).
```

`UNKNOWN`은 일부러 넣은 실패 케이스다. 좋은 실습은 성공만 보여 주지 않는다. 실패했을 때 안전하게 멈추고 설명하는지도 보여 줘야 한다.

### 프로세스 플로우

```text
Start
  |
  v
Receive generic value TYPE any
  |
  v
RTTS describe_by_data
  |
  v
Cast to CL_ABAP_STRUCTDESCR
  |
  +-- cast 실패 -> "구조가 아닙니다" 피드백 후 종료
  |
  v
Read component metadata
  |
  v
Loop requested field names
  |
  v
Check requested name in component metadata
  |
  +-- 없음 -> "허용되지 않거나 존재하지 않는 필드" 피드백
  |
  v
ASSIGN COMPONENT ... ELSE UNASSIGN
  |
  +-- 실패 -> sy-subrc/assigned 상태 표시
  |
  v
Display field name and value
```

### 구현 예제

```abap
CLASS lcl_struct_inspector DEFINITION.
  PUBLIC SECTION.
    TYPES:
      ty_field_name_tab TYPE STANDARD TABLE OF string WITH EMPTY KEY,
      BEGIN OF ty_result,
        field_name TYPE string,
        value_text TYPE string,
        found      TYPE abap_bool,
        message    TYPE string,
      END OF ty_result,
      ty_result_tab TYPE STANDARD TABLE OF ty_result WITH EMPTY KEY.

    METHODS inspect
      IMPORTING
        is_data      TYPE any
        it_requested TYPE ty_field_name_tab
      RETURNING
        VALUE(rt_result) TYPE ty_result_tab.
ENDCLASS.

CLASS lcl_struct_inspector IMPLEMENTATION.
  METHOD inspect.
    FIELD-SYMBOLS:
      <requested> TYPE any,
      <value>     TYPE any.

    TRY.
        DATA(lo_struct) = CAST cl_abap_structdescr(
          cl_abap_typedescr=>describe_by_data( is_data )
        ).
      CATCH cx_sy_move_cast_error.
        rt_result = VALUE #(
          ( field_name = ``
            value_text = ``
            found      = abap_false
            message    = `Input value is not a structure.` )
        ).
        RETURN.
    ENDTRY.

    LOOP AT it_requested ASSIGNING <requested>.
      DATA(lv_requested) = |{ <requested> }|.
      DATA(lv_found_in_metadata) = abap_false.

      LOOP AT lo_struct->components ASSIGNING FIELD-SYMBOL(<component>).
        IF <component>-name = lv_requested.
          lv_found_in_metadata = abap_true.
          EXIT.
        ENDIF.
      ENDLOOP.

      IF lv_found_in_metadata = abap_false.
        APPEND VALUE #(
          field_name = lv_requested
          value_text = ``
          found      = abap_false
          message    = `Component is not part of the structure.` )
          TO rt_result.
        CONTINUE.
      ENDIF.

      ASSIGN COMPONENT lv_requested
             OF STRUCTURE is_data
             TO <value>
             ELSE UNASSIGN.

      IF sy-subrc = 0 AND <value> IS ASSIGNED.
        APPEND VALUE #(
          field_name = lv_requested
          value_text = |{ <value> }|
          found      = abap_true
          message    = `OK` )
          TO rt_result.
      ELSE.
        APPEND VALUE #(
          field_name = lv_requested
          value_text = ``
          found      = abap_false
          message    = |ASSIGN failed. sy-subrc = { sy-subrc }| )
          TO rt_result.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

위 코드는 입력 구조 `is_data`만 generic하게 열고, 요청 필드 목록 `it_requested`는 `string` table로 고정했다. 동적 ABAP에서도 모든 것을 generic하게 만들 필요는 없다. 모양을 알고 있는 값은 명확한 타입으로 잡고, 정말 모르는 값만 generic하게 여는 편이 안전하다.

실행 예시는 다음이다.

```abap
DATA(lo_inspector) = NEW lcl_struct_inspector( ).

DATA(lt_result) = lo_inspector->inspect(
  is_data      = ls_booking
  it_requested = lt_requested
).

LOOP AT lt_result INTO DATA(ls_result).
  WRITE: / ls_result-field_name,
           ls_result-found,
           ls_result-value_text,
           ls_result-message.
ENDLOOP.
```

예상 결과는 다음과 같다.

| FIELD_NAME | FOUND | VALUE_TEXT | MESSAGE |
|---|---|---|---|
| BOOKING_ID | X | B0001 | OK |
| STATUS | X | OPEN | OK |
| UNKNOWN |  |  | Component is not part of the structure. |
| SEATS | X | 2 | OK |

### 더 안전하게 만들기

학습용 코드는 component metadata에서 이름을 찾고, 다시 `ASSIGN COMPONENT`를 수행한다. 실무 도구라면 다음 점을 더 보강한다.

| 보강 | 이유 |
|---|---|
| 요청 필드 대문자 정규화 | 사용자 입력 `status`, `Status`, `STATUS`를 같은 의미로 처리 |
| 허용 목록 분리 | 구조에는 있어도 노출하면 안 되는 field를 막기 위해 |
| deep component 표시 정책 | internal table, reference, string 같은 deep value를 어떻게 표시할지 결정 |
| 값 변경 권한 분리 | inspector는 읽기 전용, editor는 쓰기 가능으로 역할 분리 |
| 예외 메시지 표준화 | caller가 실패 원인을 UI에 안정적으로 표시하기 위해 |

### 체험형 시뮬레이터 설계

**Dynamic Structure Inspector Simulator**를 만든다.

#### 화면 구성

```text
+-------------------------------------------------------------+
| Input Structure                                              |
| BOOKING_ID | CONCERT_ID | CUSTOMER | SEATS | STATUS          |
| B0001      | C1000      | 정훈영   | 2     | OPEN            |
+-------------------------------------------------------------+

+----------------------+   +----------------------------------+
| Requested Fields     |   | RTTS Metadata                    |
| [BOOKING_ID] [x]     |   | 1 BOOKING_ID  C(10)              |
| [STATUS]     [x]     |   | 2 CONCERT_ID  C(10)              |
| [UNKNOWN]    [x]     |   | 3 CUSTOMER    C(20)              |
| [SEATS]      [x]     |   | 4 SEATS       I                  |
| [+ Add Field]        |   | 5 STATUS      C(10)              |
+----------------------+   +----------------------------------+

+-------------------------------------------------------------+
| Step Controls                                               |
| [1 Describe Type] [2 Cast Struct] [3 Validate Names]        |
| [4 Assign Component] [5 Display Result] [Reset]             |
+-------------------------------------------------------------+

+-------------------------------------------------------------+
| Result                                                      |
| BOOKING_ID = B0001  OK                                      |
| STATUS     = OPEN   OK                                      |
| UNKNOWN    =        Component is not part of the structure. |
| SEATS      = 2      OK                                      |
+-------------------------------------------------------------+
```

#### 버튼과 상태

| 버튼 | 상태 변화 | 피드백 |
|---|---|---|
| `Describe Type` | `typeDescrCreated = true`, `typeKind = structure` | "`describe_by_data`가 입력의 타입 설명서를 만들었습니다." |
| `Cast Struct` | `structCastOk = true` 또는 false | 성공 시 component panel 활성화, 실패 시 "구조가 아닙니다" |
| `Validate Names` | 각 requested field에 `metadataFound` 표시 | 없는 필드는 노란 warning |
| `Assign Component` | 선택 field별 `assignSubrc`, `fsAssigned` 기록 | 실패 시 이전 할당 유지 여부를 같이 표시 |
| `Display Result` | result table 생성 | 성공/실패를 한 행씩 표시 |
| `Toggle ELSE UNASSIGN` | `elseUnassign = true/false` | false일 때 이전 할당 유지 위험을 빨간 badge로 표시 |
| `Reset` | 모든 상태 초기화 | Field Symbol label을 memory box에서 떼어냄 |

#### 학습 피드백

시뮬레이터는 정답만 보여 주지 말고 상태를 보여 줘야 한다.

```text
component = UNKNOWN
sy-subrc = 4
<value> IS ASSIGNED = false
reason = component metadata not found
next = requested field name or whitelist를 확인하세요
```

`ELSE UNASSIGN`을 끄고 실패를 재현하면 다음 피드백을 보여 준다.

```text
방금 ASSIGN은 실패했습니다.
하지만 ELSE UNASSIGN이 없어서 <value>가 이전 component STATUS를 계속 가리킬 수 있습니다.
동적 ASSIGN에서는 sy-subrc와 assigned 상태를 함께 보세요.
```

### 실수/주의

- inspector는 읽기 도구다. 값을 수정하는 editor로 확장하려면 권한, whitelist, 변경 로그, rollback 설계를 추가해야 한다.
- `TYPE any`로 받은 값이 구조가 아닐 수 있다. 구조 cast 실패를 정상 흐름으로 다룬다.
- component metadata가 존재한다고 `ASSIGN COMPONENT`가 항상 성공한다고 단정하지 않는다. 실제 assignment의 `sy-subrc`도 확인한다.
- deep component의 문자열 표시 방식은 업무적으로 정해야 한다. internal table을 무작정 string template에 넣으려 하면 원하는 결과가 아닐 수 있다.
- 동적 도구는 테스트 케이스가 더 중요하다. 성공 구조, 없는 component, 구조가 아닌 값, empty requested list를 모두 테스트한다.

### 정리

동적 구조 검사기는 NEWCH28의 모든 핵심을 연결한다. `TYPE any`로 입력을 받고, RTTS로 타입을 확인하고, 구조 component metadata를 읽고, `ASSIGN COMPONENT ... ELSE UNASSIGN`으로 실제 값에 접근한다. 안전한 dynamic ABAP은 문법을 많이 쓰는 코드가 아니라, 실패 가능성을 상태와 피드백으로 드러내는 코드다.

## NEWCH28 마무리

이 장에서 배운 내용은 고급 ABAP의 중요한 분기점이다. 지금까지의 ABAP은 대부분 "타입을 알고 코드를 쓴다"였다. NEWCH28은 "타입을 모를 때도 안전하게 확인하고 다룬다"는 사고를 추가한다.

마지막으로 판단 기준을 정리한다.

| 상황 | 우선 선택 |
|---|---|
| structure 타입을 알고 있다 | typed variable, typed Field Symbol |
| internal table 행을 직접 수정한다 | `LOOP ... ASSIGNING FIELD-SYMBOL(<line>)` |
| 어떤 structure든 component를 읽어야 한다 | `TYPE any` + RTTS + `ASSIGN COMPONENT` |
| structure component 이름이 runtime에 정해진다 | `ASSIGN COMPONENT ... OF STRUCTURE` |
| data object 이름 자체가 runtime 문자열이다 | 가능하면 피하고, 필요하면 whitelist + `ASSIGN (name)` |
| runtime에 data object를 만들어야 한다 | `REF TO data` + `CREATE DATA` + `ASSIGN dref->*` |
| type description으로 data object를 만들어야 한다 | RTTS/RTTC + `CREATE DATA ... TYPE HANDLE` |

후속 NEWCH29에서는 문자열 처리 심화를 다룬다. NEWCH28이 "데이터의 모양을 실행 중에 읽는 법"이었다면, NEWCH29는 "문자열 안의 패턴을 정확히 찾고 검증하는 법"이다. 두 장 모두 동적이고 유연한 실무 도구를 만들 때 필요하지만, 다루는 대상은 다르다. NEWCH28은 타입과 메모리 접근, NEWCH29는 텍스트 패턴과 정규식이다.
