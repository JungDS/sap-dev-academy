# CH10_REWRITE - Modularization Basics

> 기준 소스: `content/abap/CH10/_chapter.md`, `content/abap/CH10/CH10-L01.md` ~ `CH10-L07.md`
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 기존 `reference/codex_0625`, `reference/codex_0625_v2`
> 공식 문서 확인: `C:\ABAP_DOCU_HTML`의 `FORM`, `PERFORM`, subroutine parameter, `RETURN`, `STATICS`, `CALL FUNCTION`, Function Module parameter, `CLASS`, `CLASS-METHODS`, static method, type-pool 항목을 수동 확인

## 챕터 설계

CH09에서 학습자는 콘서트 예매 앱의 데이터 토대를 만들었다. `ZCONCERT`, `ZPERF`, `ZBOOKING`이 있고, Foreign Key와 F4로 올바른 공연을 고를 수 있게 했다. 이제 프로그램에는 계산 로직이 필요하다.

```text
이 회차의 잔여석은 몇 석인가?
정훈영이 3석을 요청하면 예매 가능한가?
같은 계산을 리포트, 화면, ALV에서 반복하지 않으려면 어떻게 묶을까?
```

CH10의 목표는 "길어진 코드를 이름 붙은 처리 단위로 나누고, 그 처리 단위에 값을 안전하게 주고받게 한다"이다. 이 장의 중심은 멋진 구조가 아니라 반복 제거와 책임 분리다.

CH10은 classic-first 구간이다. CH17까지 금지된 inline declaration, constructor expression, object creation expression, string template, New Open SQL escape는 쓰지 않는다. `FORM/PERFORM`은 공식 문서상 obsolete subroutine이므로 신규 권장 도구가 아니라 기존 코드 이해와 초급 모듈화 감각을 위한 장치로 다룬다. Class와 Method는 CH20 전 본격 OO가 아니라 static method 호출 맛보기로 제한한다.

## CH10-L01 - FORM / PERFORM 기본 호출

### 왜 필요한가

프로그램이 짧을 때는 위에서 아래로 한 번에 써도 된다. 하지만 같은 출력 헤더, 같은 금액 계산, 같은 잔여석 계산이 여러 곳에 반복되면 문제가 생긴다. 계산식이 바뀔 때 복사된 모든 위치를 고쳐야 하고, 하나라도 놓치면 화면마다 서로 다른 결과가 나온다.

반복되는 코드는 이름 붙은 처리 블록으로 묶어야 한다. 가장 오래된 ABAP 도구가 Subroutine, 즉 `FORM`과 `PERFORM`이다.

단, 처음부터 명확히 말해야 한다. 공식 문서에서도 subroutine은 obsolete로 분류되며, 새 프로그램에는 method를 만들 것을 권장한다. 그래도 기존 ABAP 코드에 `FORM/PERFORM`이 매우 많기 때문에 초급자는 반드시 읽을 줄 알아야 한다.

### 무엇인가

`FORM`은 subroutine을 정의하고, `PERFORM`은 그 subroutine을 호출한다.

```abap
REPORT zch10_l01_form.

PERFORM print_header.

WRITE: / '정훈영 예매 목록'.

FORM print_header.
  WRITE: / '===================='.
  WRITE: / '콘서트 예매 리포트'.
  WRITE: / '===================='.
ENDFORM.
```

실행 흐름은 다음과 같다.

1. 프로그램이 `PERFORM print_header.`를 만난다.
2. 같은 프로그램 안의 `FORM print_header.` 블록으로 이동한다.
3. `ENDFORM.`까지 실행한다.
4. 다시 `PERFORM` 다음 줄로 돌아온다.

### 어떻게 확인하는가

디버거에서 `PERFORM print_header.` 줄에 breakpoint를 둔다. 한 단계 실행하면 커서가 `FORM print_header` 안으로 들어간다. `ENDFORM`을 지나면 다시 `WRITE: / '정훈영 예매 목록'.` 줄로 돌아온다.

지역 변수와 전역 변수 차이도 여기서 확인한다.

```abap
REPORT zch10_l01_scope.

DATA gv_total_calls TYPE i.

PERFORM count_call.
PERFORM count_call.

WRITE: / '전역 호출 수:', gv_total_calls.

FORM count_call.
  DATA lv_local_calls TYPE i.

  gv_total_calls = gv_total_calls + 1.
  lv_local_calls = lv_local_calls + 1.

  WRITE: / 'FORM 안 지역 호출 수:', lv_local_calls.
ENDFORM.
```

`gv_total_calls`는 프로그램 전체에서 살아 있으므로 두 번 호출 후 2가 된다. `lv_local_calls`는 `FORM` 안의 지역 변수라 호출이 끝나면 사라진다. 그래서 호출할 때마다 다시 0에서 시작해 1이 된다.

### 체험 설계

L01에는 "PERFORM 호출 지도"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `시작`, `다음 줄`, `FORM으로 이동`, `ENDFORM에서 복귀`, `정의 누락 실험` |
| 상태 | 현재 실행 줄, 호출한 subroutine 이름, 복귀할 줄 |
| 데이터 | `gv_total_calls`, `lv_local_calls` |
| 피드백 | `PERFORM`에서 `FORM`으로 점프하고, `ENDFORM` 뒤 호출 다음 줄로 돌아오는 흐름 표시 |

`정의 누락 실험` 버튼은 `PERFORM print_footer.`만 있고 `FORM print_footer.`가 없는 상태를 보여 준다. 피드백은 "이름 붙은 블록을 호출하려면 정의가 있어야 합니다"로 한다.

### 실수와 주의

`PERFORM` 이름과 `FORM` 이름이 다르면 호출할 블록을 찾지 못한다. 철자와 위치를 확인한다.

전역 변수에 지나치게 의존하면 subroutine의 입력과 출력이 보이지 않는다. 처음에는 편하지만 나중에는 어디서 값이 바뀌었는지 추적하기 어렵다.

외부 프로그램의 subroutine을 호출하는 방식은 피한다. CH10에서는 같은 프로그램 안의 내부 subroutine을 읽는 수준으로 제한한다.

### 정리

`FORM`은 정의, `PERFORM`은 호출이다. 이 도구는 기존 코드 이해에 꼭 필요하지만, 신규 설계의 중심으로 삼지는 않는다. CH10에서는 반복 코드를 이름 붙인 블록으로 나누는 감각을 얻는 것이 목표다.

## CH10-L02 - USING / CHANGING 파라미터

### 왜 필요한가

`print_header`처럼 입력이 없는 subroutine은 단순하다. 하지만 실제 업무 로직은 값을 받아야 한다. 세금 계산은 금액을 받아야 하고, 잔여석 계산은 공연 ID와 회차 번호를 받아야 한다. 계산 결과도 호출한 쪽으로 돌려줘야 한다.

파라미터는 모듈의 입구와 출구다. 입구와 출구가 없으면 subroutine은 전역 변수에 몰래 의존하게 된다. 그러면 코드는 짧아 보여도 테스트와 유지보수가 어려워진다.

### 무엇인가

`FORM`에서는 `USING`과 `CHANGING`으로 값을 주고받는다.

```abap
REPORT zch10_l02_parameters.

DATA: lv_amount TYPE p LENGTH 8 DECIMALS 2,
      lv_result TYPE p LENGTH 8 DECIMALS 2.

lv_amount = 1000.

PERFORM add_tax USING lv_amount CHANGING lv_result.

WRITE: / '원금:', lv_amount.
WRITE: / '세금 포함:', lv_result.

FORM add_tax
  USING    iv_amount TYPE p
  CHANGING cv_result TYPE p.

  cv_result = iv_amount * '1.1'.

ENDFORM.
```

`USING`은 입력 의도를 나타낸다. `CHANGING`은 subroutine 안에서 바뀌어 호출자에게 돌아갈 값을 나타낸다.

공식 문서 기준으로 `FORM`의 formal parameter는 명시 typing을 줄 수 있고, typing이 없으면 generic하게 다루어진다. 입문자는 처음부터 `TYPE`을 적어 안전하게 만든다.

### 어떻게 확인하는가

실행 전 값은 다음이다.

```text
lv_amount = 1000
lv_result = 0
```

`PERFORM add_tax`를 실행하면 `lv_amount`가 `iv_amount`로 들어간다. FORM 안에서 `cv_result`에 계산 결과가 들어가고, `ENDFORM` 이후 `lv_result`에 결과가 보인다.

전달 방식도 구분한다.

| 방식 | 문법 | 의미 |
|---|---|---|
| Call by Reference | `USING iv_x`, `CHANGING cv_x` | 원본과 연결된 채 전달 |
| Call by Value | `USING VALUE(iv_x)` | 복사본으로 전달해 원본 보호 |
| Call by Value and Result | `CHANGING VALUE(cv_x)` | 복사해 처리하고 정상 종료 시 되돌림 |

입력만 필요한 값은 `USING VALUE(...)`로 보호하는 방식이 이해하기 쉽다. 기존 코드에는 reference 전달이 많으므로 읽을 수 있어야 한다.

`RETURN`은 현재 처리 블록을 즉시 빠져나간다.

```abap
FORM divide_safe
  USING    iv_left   TYPE i
           iv_right  TYPE i
  CHANGING cv_result TYPE i.

  IF iv_right = 0.
    cv_result = 0.
    RETURN.
  ENDIF.

  cv_result = iv_left / iv_right.

ENDFORM.
```

`STATICS`는 procedure 안에서만 보이지만 호출이 끝나도 값이 유지되는 변수다.

```abap
FORM count_subroutine.
  STATICS sv_count TYPE i.

  sv_count = sv_count + 1.
  WRITE: / '이 FORM 호출 횟수:', sv_count.
ENDFORM.
```

세 번 호출하면 `sv_count`는 1, 2, 3으로 증가한다. 일반 지역 변수 `DATA`와 다르다.

### 체험 설계

L02에는 "파라미터 이동 보드"를 둔다.

| 버튼 | 보여 줄 상태 |
|---|---|
| `USING reference` | 내부에서 값을 바꾸면 원본도 영향을 받을 수 있음 |
| `USING VALUE` | 복사본만 바뀌고 원본 보호 |
| `CHANGING reference` | 내부 결과가 호출자 변수로 바로 반영 |
| `CHANGING VALUE` | 정상 종료 시 결과가 되돌아감 |
| `0으로 나누기` | `RETURN`으로 조기 종료되는 줄 강조 |
| `STATICS 3회 호출` | 호출 사이 값 유지 |

상태 패널에는 호출자 변수, FORM formal parameter, FORM 내부 지역 변수, ENDFORM 이후 값을 나란히 표시한다.

### 실수와 주의

`USING`으로 받은 값을 출력처럼 바꾸면 의도가 흐려진다. 돌려줄 값은 `CHANGING`으로 드러낸다.

호출부와 정의부의 파라미터 순서가 맞아야 한다. classic `FORM/PERFORM`은 이름 기반 호출보다 위치 대응을 많이 보므로 순서를 특히 조심한다.

`STATICS`는 편하지만 숨은 상태를 만든다. 호출할 때마다 같은 결과가 나와야 하는 계산에는 남용하지 않는다.

### 정리

모듈은 입구와 출구가 분명해야 한다. `USING`은 입력, `CHANGING`은 입출력, `RETURN`은 조기 종료, `STATICS`는 procedure 내부에서만 보이는 장기 생존 변수다.

## CH10-L03 - CALL FUNCTION 기본 구조

### 왜 필요한가

Subroutine은 같은 프로그램 내부에서만 살기 쉽다. 여러 프로그램이 함께 쓰는 절차형 재사용 단위가 필요할 때 Function Module을 만난다. SAP 표준에는 Function Module 기반 기능이 많고, BAPI나 RFC 같은 후속 장에서도 계속 등장한다.

CH10에서는 Function Module을 깊게 설계하지 않는다. `CALL FUNCTION`을 읽고, 호출자 기준으로 파라미터 방향을 이해하고, classic exception을 `sy-subrc`로 처리하는 기본 구조만 잡는다.

### 무엇인가

Function Module은 Function Builder에서 관리되는 전역 procedure다. ABAP 프로그램은 `CALL FUNCTION`으로 호출한다.

```abap
REPORT zch10_l03_call_function.

DATA: lv_amount TYPE p LENGTH 8 DECIMALS 2,
      lv_result TYPE p LENGTH 8 DECIMALS 2,
      lv_log    TYPE c LENGTH 40.

lv_amount = 1000.

CALL FUNCTION 'Z_CH10_ADD_TAX'
  EXPORTING
    iv_amount      = lv_amount
  IMPORTING
    ev_result      = lv_result
  CHANGING
    cv_log         = lv_log
  EXCEPTIONS
    invalid_amount = 1
    OTHERS         = 2.

IF sy-subrc = 0.
  WRITE: / '세금 포함 금액:', lv_result.
ELSE.
  WRITE: / '함수 모듈 처리 실패:', sy-subrc.
ENDIF.
```

방향은 호출자 기준이다.

| 구문 | 호출자 기준 의미 |
|---|---|
| `EXPORTING` | 내가 함수 모듈로 내보내는 값 |
| `IMPORTING` | 내가 함수 모듈에서 받아오는 값 |
| `CHANGING` | 넘겨서 바뀐 뒤 돌아오는 값 |
| `TABLES` | Internal Table 전달에 쓰이던 레거시 방식 |
| `EXCEPTIONS` | non-class-based exception을 숫자로 받아 `sy-subrc` 처리 |

### 어떻게 확인하는가

SE37에서 Function Module을 열고 Import, Export, Changing, Tables, Exceptions 탭을 본다. 호출 코드의 각 parameter가 SE37 interface와 맞는지 확인한다.

`CALL FUNCTION` 뒤에는 `sy-subrc`를 확인한다. 공식 문서 기준으로 non-class-based exception이 assignment value로 처리되면 `sy-subrc`는 그 값으로 설정된다. 예를 들어 `invalid_amount = 1`이 발생하면 `sy-subrc = 1`이 된다.

### 체험 설계

L03에는 "CALL FUNCTION 상자"를 둔다.

| 요소 | 설계 |
|---|---|
| 왼쪽 | 호출자 변수 `lv_amount`, `lv_result`, `lv_log` |
| 가운데 | Function Module interface 상자 |
| 오른쪽 | 반환값과 `sy-subrc` |
| 버튼 | `정상 금액`, `음수 금액`, `방향 퀴즈`, `EXCEPTIONS 제거 실험` |
| 피드백 | `EXPORTING`/`IMPORTING`을 호출자 기준으로 화살표 표시 |

`음수 금액` 버튼을 누르면 `invalid_amount` exception과 `sy-subrc = 1`을 보여 준다. `방향 퀴즈`는 "IMPORTING은 함수 내부 기준인가, 호출자 기준인가"를 묻고 호출자 기준이라고 피드백한다.

### 실수와 주의

가장 흔한 실수는 `EXPORTING`과 `IMPORTING` 방향을 함수 내부 기준으로 읽는 것이다. 항상 호출자 기준이다.

`EXCEPTIONS`를 선언해 놓고 `sy-subrc`를 확인하지 않으면 실패 흐름을 놓친다.

`TABLES` parameter는 기존 Function Module에서 자주 보이지만 신규 설계 관점에서는 주의해야 한다. CH10에서는 읽기 위한 지식으로만 둔다.

### 정리

Function Module은 여러 프로그램에서 호출할 수 있는 절차형 재사용 단위다. `CALL FUNCTION`은 호출자 기준으로 `EXPORTING`, `IMPORTING`, `CHANGING`을 읽고, classic exception은 `sy-subrc`로 확인한다.

## CH10-L04 - Local Class로 모듈화: 정적 기준

### 왜 필요한가

현대 ABAP의 중심은 Class와 Method다. 하지만 CH10에서 객체지향 전체를 시작하면 너무 이르다. 객체 생성, 참조 변수, instance state, 상속, 인터페이스, class-based exception은 CH20에서 정식으로 다룬다.

CH10-L04는 class를 "또 하나의 모듈화 도구"로 맛보는 레슨이다. 객체를 만들지 않고 호출할 수 있는 static method부터 본다.

### 무엇인가

Class는 관련 있는 method와 data를 묶는 설계 단위다. Method는 class 안에 들어 있는 처리 블록이다. Local Class는 현재 ABAP program 안에서 정의해 쓰는 class다.

Class는 declaration part와 implementation part로 나뉜다.

```abap
REPORT zch10_l04_local_class.

CLASS lcl_calc DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS add_tax
      IMPORTING iv_amount        TYPE p
      RETURNING VALUE(rv_result) TYPE p.
ENDCLASS.

CLASS lcl_calc IMPLEMENTATION.
  METHOD add_tax.
    rv_result = iv_amount * '1.1'.
  ENDMETHOD.
ENDCLASS.

DATA lv_result TYPE p LENGTH 8 DECIMALS 2.

lv_result = lcl_calc=>add_tax( 1000 ).

WRITE: / '세금 포함:', lv_result.
```

`CLASS-METHODS`는 static method를 선언한다. 공식 문서 기준으로 static method는 class component selector `=>`를 사용해 object와 독립적으로 사용할 수 있다.

### 어떻게 확인하는가

코드를 세 구역으로 나눈다.

| 구역 | 역할 |
|---|---|
| `CLASS ... DEFINITION` | 공개 계약 선언 |
| `CLASS ... IMPLEMENTATION` | method 실제 코드 |
| `lcl_calc=>add_tax( 1000 )` | static method 호출 |

`PUBLIC SECTION`에 있는 method는 외부에서 호출할 수 있다. `PRIVATE SECTION`은 class 내부 구현용이다. CH10에서는 `PUBLIC`과 `PRIVATE`만 소개하고, `PROTECTED`는 후속 OO 장으로 남긴다.

### 체험 설계

L04에는 "Local Class 정적 메서드 스텝퍼"를 둔다.

| 버튼 | 피드백 |
|---|---|
| `DEFINITION 보기` | 외부에서 보이는 계약 표시 |
| `IMPLEMENTATION 보기` | 실제 계산 코드 표시 |
| `정적 호출 실행` | `=>` 호출로 반환값 생성 |
| `PUBLIC 제거 실험` | 외부에서 호출할 수 없다는 피드백 |
| `RETURNING 제거 실험` | 함수형 호출 결과를 받을 수 없다는 피드백 |

상태 패널에는 `iv_amount = 1000`, `rv_result = 1100`, 호출 형식 `lcl_calc=>add_tax`를 보여 준다.

### 실수와 주의

`DEFINITION`만 있고 `IMPLEMENTATION`이 없으면 method 본문이 없다. 두 부분이 함께 필요하다.

Static method는 `=>`로 호출한다. instance method와 `->` 호출은 CH20에서 정식으로 다룬다.

`RETURNING VALUE(...)`의 `VALUE`는 pass-by-value 반환 parameter 문법이다. CH18의 constructor expression과 다르다.

### 정리

Local Class도 모듈화 도구다. CH10에서는 본격 OO가 아니라 static method 맛보기만 한다. `DEFINITION`은 계약, `IMPLEMENTATION`은 본문, `=>`는 static 호출이다.

## CH10-L05 - Global Class 호출 기초

### 왜 필요한가

Local Class는 현재 프로그램 안에서만 사용하기 쉽다. 여러 프로그램이 함께 쓰는 class는 Global Class로 만든다. SAP 표준에도 `CL_...`로 시작하는 전역 클래스가 많고, 고객 개발에도 `ZCL_...` 형태의 전역 클래스가 많다.

CH10-L05의 목표는 Global Class를 설계하는 것이 아니다. 이미 만들어진 Global Class의 static method를 블랙박스처럼 호출하는 법을 익힌다. CH11의 SALV에서도 표준 class 호출을 만나므로 지금 감각을 만들어 둔다.

### 무엇인가

Global Class는 class pool에 정의되는 global type이다. 보통 SE24에서 조회하거나 생성한다.

이미 만들어진 static method는 다음처럼 호출할 수 있다.

```abap
REPORT zch10_l05_global_class.

DATA: lv_left TYPE i,
      lv_text TYPE c LENGTH 40.

lv_left = zcl_booking_calc=>get_remaining(
  iv_concert = 'C001'
  iv_perf    = '001' ).

lv_text = zcl_booking_calc=>format_remaining(
  iv_left = lv_left ).

WRITE: / lv_text.
```

여기서 `ZCL_BOOKING_CALC`는 이미 만들어진 class라고 가정한다. CH10에서는 내부 설계를 열어 분석하지 않는다. 공개 method의 이름, parameter, 반환값만 보고 호출한다.

### 어떻게 확인하는가

SE24에서 전역 클래스를 열고 다음을 확인한다.

1. method가 static method인지 확인한다.
2. method가 public으로 공개되어 있는지 확인한다.
3. 필요한 `IMPORTING` parameter 이름을 확인한다.
4. `RETURNING` 또는 `EXPORTING`으로 결과를 받는지 확인한다.
5. 호출 코드가 interface와 맞는지 확인한다.

### 체험 설계

L05에는 "전역 클래스 블랙박스 호출기"를 둔다.

| 요소 | 설계 |
|---|---|
| 왼쪽 | 호출자 입력: 공연 ID, 회차 번호 |
| 가운데 | 닫힌 상자 `ZCL_BOOKING_CALC` |
| 오른쪽 | 반환값: 잔여석, 표시 문구 |
| 버튼 | `SE24 계약 보기`, `정상 호출`, `필수 parameter 누락`, `static 여부 확인` |
| 피드백 | 내부 구현을 몰라도 public static interface를 맞추면 호출 가능 |

`필수 parameter 누락` 버튼은 "method가 요구하는 입력 계약을 맞추지 않았습니다"라고 알려 준다.

### 실수와 주의

Global Class라고 모두 `=>`로 부르는 것은 아니다. static method인지 확인해야 한다.

CH10에서 instance 생성, reference variable, constructor는 다루지 않는다. 이런 개념은 CH20의 OO 기본으로 넘긴다.

Class 내부 구현을 모른다고 무작정 호출하면 안 된다. 공개 interface, parameter 의미, 반환값 의미는 문서나 SE24에서 확인한다.

### 정리

Global Class는 여러 프로그램에서 함께 쓰는 전역 class다. CH10에서는 이미 만들어진 static method를 `=>`로 호출하는 법만 다룬다. 본격적인 class 설계는 CH20이다.

## CH10-L06 - Subroutine / Function / Class 선택 기준

### 왜 필요한가

이제 학습자는 `FORM/PERFORM`, Function Module, Class/Method를 모두 보았다. 셋 다 코드를 묶지만 쓰임새가 다르다. 도구 선택 기준이 없으면 오래된 방식과 현대 방식이 섞여 유지보수가 어려워진다.

L06은 새 문법 레슨이 아니라 판단 기준 레슨이다.

### 무엇인가

세 도구를 한눈에 정리한다.

| 도구 | 범위 | 현재 권장도 | 주 용도 |
|---|---|---|---|
| Subroutine `FORM` | 프로그램 내부 | 레거시 이해용 | 기존 리포트 유지보수 |
| Function Module | 전역 절차형 재사용 | 여전히 중요 | 표준 FM, BAPI, RFC 계열 |
| Class / Method | 지역/전역 책임 단위 | 신규 개발 중심 | 현대 ABAP 모듈화 |

Type Pool과 `TYPE-POOLS`도 오래된 코드에서 볼 수 있다. 공식 문서상 `TYPE-POOLS` 문은 obsolete이며, 지금은 type pool 요소가 필요할 때 자동 로드된다. CH10에서는 신규 선택지로 가르치지 않고 "옛 코드에서 보이면 읽을 수 있다" 정도로만 둔다.

### 어떻게 확인하는가

상황별로 판단한다.

| 상황 | 선택 |
|---|---|
| 오래된 report 안에 이미 `FORM`이 많다 | 기존 `FORM`을 읽고 최소 수정 |
| 표준 BAPI나 RFC 가능 인터페이스를 호출한다 | Function Module |
| 새 잔여석 계산 로직을 여러 프로그램에서 공유한다 | Class/Method |
| CH11에서 SALV 표준 표시를 사용한다 | 표준 Global Class |
| `TYPE-POOLS` 문을 발견했다 | 옛 코드 인지, 신규 설계 후보 아님 |

판단 기준은 "무엇이 최신인가"만이 아니라 "SAP 표준과 어떻게 연결되는가", "어디까지 재사용되어야 하는가"다.

### 체험 설계

L06에는 "모듈화 선택 카드"를 둔다.

| 카드 | 정답 |
|---|---|
| 기존 20년 된 리포트의 내부 subroutine 유지보수 | Subroutine |
| 표준 BAPI 호출 | Function Module |
| 외부 시스템과 RFC 연결 | Function Module |
| 새 콘서트 잔여석 계산 서비스 공유 | Class/Method |
| SALV 표준 표시 호출 | Global Class |
| `TYPE-POOLS`를 발견 | 옛 코드 읽기 |

각 카드에는 선택 후 "왜 이 선택이 맞는지"를 한 문장으로 표시한다.

### 실수와 주의

신규 코드에 무심코 `FORM`을 추가하는 습관은 피한다. 기존 코드 이해용과 신규 설계용을 분리한다.

반대로 모든 것을 class로만 보면 SAP 표준의 Function Module 기반 인터페이스를 읽지 못한다. 실무에서는 둘 다 만난다.

### 정리

기존 내부 코드는 Subroutine을 읽고, 표준 절차형 재사용은 Function Module을 읽고, 신규 설계 방향은 Class/Method를 중심에 둔다. 이 선택 기준이 있어야 CH11 이후 표준 class와 CH20 OO 학습으로 자연스럽게 넘어간다.

## CH10-L07 - 실습: 잔여석 계산과 예매 판정 모듈화

### 왜 필요한가

CH09에서 만든 콘서트 예매 모델에는 이제 핵심 로직이 필요하다.

```text
잔여석 = 공연 정원 - 취소되지 않은 예매 좌석 합계
예매 가능 = 요청 좌석 수 <= 잔여석
```

이 계산을 여러 화면과 리포트에 복사하면 안 된다. 잔여석 계산은 하나의 업무 책임이다. CH10-L07은 그 책임을 `get_remaining`과 `can_book`이라는 이름 붙은 모듈로 분리한다.

### 무엇인가

아직 CH13의 SQL 집계 `SUM`을 배우지 않았다. 따라서 CH10에서는 CH08의 `SELECT`, CH06의 Internal Table과 `LOOP`만 사용해 합산 과정을 눈으로 확인한다.

잔여석 계산 절차는 다음이다.

1. 해당 공연/회차의 예매를 읽는다.
2. 취소 상태가 아닌 예매만 대상으로 한다.
3. 좌석 수를 `LOOP`로 합산한다.
4. 공연 정원을 읽는다.
5. 정원에서 예매 합계를 뺀다.

### 어떻게 확인하는가

잔여석 계산 FORM이다.

```abap
REPORT zch10_l07_booking_module.

FORM get_remaining
  USING    iv_concert TYPE zbooking-concert_id
           iv_perf    TYPE zbooking-perf_no
  CHANGING cv_left    TYPE i.

  DATA: lt_book TYPE TABLE OF zbooking,
        ls_book TYPE zbooking,
        lv_sum  TYPE i,
        lv_cap  TYPE zconcert-capacity.

  SELECT *
    FROM zbooking
    INTO TABLE lt_book
    WHERE concert_id = iv_concert
      AND perf_no    = iv_perf
      AND status    <> 'C'.

  LOOP AT lt_book INTO ls_book.
    lv_sum = lv_sum + ls_book-seats.
  ENDLOOP.

  SELECT SINGLE capacity
    FROM zconcert
    INTO lv_cap
    WHERE concert_id = iv_concert.

  IF sy-subrc <> 0.
    cv_left = 0.
    RETURN.
  ENDIF.

  cv_left = lv_cap - lv_sum.

ENDFORM.
```

예매 가능 판정 FORM이다.

```abap
FORM can_book
  USING    iv_concert TYPE zbooking-concert_id
           iv_perf    TYPE zbooking-perf_no
           iv_want    TYPE i
  CHANGING cv_ok      TYPE abap_bool.

  DATA lv_left TYPE i.

  PERFORM get_remaining
    USING    iv_concert iv_perf
    CHANGING lv_left.

  cv_ok = boolc( iv_want <= lv_left ).

ENDFORM.
```

호출 예시다.

```abap
DATA: lv_left TYPE i,
      lv_ok   TYPE abap_bool.

PERFORM get_remaining
  USING    'C001' '001'
  CHANGING lv_left.

PERFORM can_book
  USING    'C001' '001' 3
  CHANGING lv_ok.

WRITE: / '잔여석:', lv_left.
WRITE: / '3석 예매 가능:', lv_ok.
```

`abap_bool`과 `boolc`는 ABAP의 boolean 처리 관례로 CH04의 조건식 흐름과 연결된다. CH10에서는 참/거짓 결과를 표현하는 실용 도구로만 사용한다.

### 체험 설계

기존 `embeds/abap/CH10-L07-S01.html`을 중심으로 사용한다. 이 embed는 잔여석 합산 과정을 step debugger로 보여 준다.

| 단계 | 상태 변화 |
|---|---|
| `SELECT` | 조건에 맞는 예매 3건을 `lt_book`에 담음 |
| `LOOP` 1회 | `ls_book-seats = 2`, `lv_sum = 2` |
| `LOOP` 2회 | `ls_book-seats = 3`, `lv_sum = 5` |
| `LOOP` 3회 | `ls_book-seats = 1`, `lv_sum = 6` |
| `SELECT SINGLE` | `lv_cap = 10` |
| 계산 | `cv_left = 10 - 6 = 4` |

추가 체험으로 `can_book` 판정 토글을 둔다.

| 요청 좌석 | 비교 | 결과 |
|---|---|---|
| 3 | `3 <= 4` | 가능 |
| 5 | `5 <= 4` | 불가능 |

`취소 건 포함` 토글을 켜면 잘못된 합계가 나오게 하고, "취소된 예매까지 합산하면 잔여석이 실제보다 작게 계산됩니다"라고 피드백한다.

### 실수와 주의

취소 상태를 제외하지 않으면 이미 취소된 예매가 좌석을 차지하는 것처럼 계산된다. `status <> 'C'`는 단순 조건이 아니라 업무 규칙이다.

공연 ID와 회차 번호를 전역 변수에서 몰래 가져오지 않는다. 입력은 `USING`, 결과는 `CHANGING`으로 드러낸다.

CH13의 SQL 집계를 앞당기지 않는다. 지금은 합산 과정을 Internal Table과 `LOOP`로 눈으로 확인하는 단계다.

### 정리

업무 로직은 이름 붙은 모듈로 분리하고, 입력과 결과를 파라미터로 드러낸다. CH10-L07을 마치면 학습자는 잔여석 계산과 예매 가능 판정을 반복 코드가 아니라 재사용 가능한 책임 단위로 설명할 수 있다.

## CH10 마무리

CH10을 마치면 학습자는 다음을 설명할 수 있어야 한다.

| 기준 | 할 수 있어야 하는 일 |
|---|---|
| `FORM/PERFORM` | subroutine 정의와 호출 흐름 설명 |
| obsolete 경계 | `FORM`은 기존 코드 이해용이며 신규 중심은 method라고 설명 |
| scope | 지역 변수와 전역 변수 차이 설명 |
| parameter | `USING`, `CHANGING`, pass by value/reference 차이 설명 |
| `RETURN` | 처리 블록 조기 종료 설명 |
| `STATICS` | procedure 내부 가시성과 긴 수명 설명 |
| Function Module | `CALL FUNCTION` 구조와 호출자 기준 parameter 방향 설명 |
| `EXCEPTIONS` | classic exception과 `sy-subrc` 연결 설명 |
| Local Class | `DEFINITION`, `IMPLEMENTATION`, `CLASS-METHODS`, `=>` 설명 |
| Global Class | 이미 만들어진 static method를 블랙박스처럼 호출 |
| 선택 기준 | Subroutine, Function Module, Class를 상황별로 구분 |

최종 과제는 다음 기준으로 확인한다.

1. 잔여석 계산 로직을 복사하지 않고 `FORM get_remaining`으로 분리한다.
2. 입력값은 `USING`, 결과값은 `CHANGING`으로 드러낸다.
3. `CH10-L07-S01` 디버거에서 `lv_sum`, `lv_cap`, `cv_left` 변화를 설명한다.
4. 요청 좌석 3석과 5석에서 `can_book` 결과가 달라지는 이유를 설명한다.
5. 신규 설계의 중심은 method, 기존 코드 이해는 FORM, 표준 절차형 재사용은 Function Module이라는 선택 기준을 말할 수 있다.

다음 CH11에서는 콘서트 예매 목록을 표로 보여 주기 위해 SALV ALV를 사용한다.
