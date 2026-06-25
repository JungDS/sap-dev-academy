# CH10_REWRITE - 모듈화 기초 v2

> 목적: `content/abap/CH10`의 7개 레슨을 기준으로, v1의 템플릿 반복을 제거하고 "입문자가 반복 코드를 왜 묶어야 하는지, 값을 어떻게 주고받는지, 어떤 재사용 단위를 언제 선택해야 하는지"를 체험 중심으로 이해할 수 있는 기준 원고를 만든다. 이 문서는 아직 `content/abap` 원본 반영본이 아니라, 반영 전 검수 가능한 v2 재작성 산출물이다.

## CH10 전체 설계

CH10의 한 문장 목표는 "길어진 ABAP 코드를 이름 붙은 처리 단위로 나누고, 그 처리 단위에 값을 안전하게 주고받게 한다"이다.

CH09까지 학습자는 데이터 구조와 입력 도움말을 만들었다. 이제 콘서트 예매 앱에는 실제 로직이 필요하다. 잔여석을 계산하고, 요청 좌석 수가 잔여석보다 작은지 판단하고, 같은 계산을 여러 화면과 리포트에서 다시 써야 한다. 같은 코드를 복사해 붙이면 처음에는 빠르지만, 나중에 조건 하나가 바뀔 때 모든 복사본을 찾아 고쳐야 한다.

따라서 CH10은 "문법 묶음"이 아니라 "책임을 이름 붙여 분리하는 첫 훈련"으로 설계한다.

### 범위와 금지선

CH10은 classic-first 구간이다. 코드 예제에는 inline declaration, constructor expression, object creation expression, string template, New Open SQL escape marker를 넣지 않는다. `FORM/PERFORM`은 공식 문서상 obsolete modularization에 속하므로 "신규 권장"이 아니라 "기존 코드 이해와 초급 모듈화 감각"으로 가르친다. Local Class와 Global Class는 맛보기다. 객체 생성, 참조 변수, 인스턴스 설계, 상속, 인터페이스, class-based exception 체계는 CH20에서 정식으로 다룬다.

이 장의 Function Module 설명은 `CALL FUNCTION`의 기본 호출 구조와 classic exception 처리까지만 다룬다. RFC, BAPI, background/update function, 권한/패키지 설계는 CH30 이후로 넘긴다.

### 현재 소스 범위

`content/abap/CH10` 현재 상태는 7개 레슨이다. v2 산출물은 이 7개 레슨을 모두 다룬다.

| 레슨 | 현재 주제 | v2 재작성 초점 |
| --- | --- | --- |
| CH10-L01 | FORM/PERFORM 기본 호출 | 반복 코드를 이름 붙은 내부 처리 단위로 묶기 |
| CH10-L02 | USING/CHANGING 파라미터 | 값 전달 방향, 보호, 지역/정적 변수 |
| CH10-L03 | CALL FUNCTION 기본 구조 | 전역 재사용 단위와 호출자 기준 파라미터 방향 |
| CH10-L04 | Local Class 정적 기준 | 객체 생성 없이 정적 메서드로 모듈화 맛보기 |
| CH10-L05 | Global Class 호출 기초 | 이미 만들어진 전역 클래스의 정적 메서드 호출 |
| CH10-L06 | 선택 기준 | Subroutine, Function Module, Class를 상황별로 구분 |
| CH10-L07 | 잔여석 계산 실습 | 콘서트 예매 로직을 FORM으로 분리하고 디버거로 확인 |

### 공식 문서 수동 확인 기준

v1은 CH10에 일부 관련 없는 제어문 문서와 과도한 OO 문서를 섞었다. v2에서는 아래 문서만 수동 근거로 채택한다.

- `C:\ABAP_DOCU_HTML\abapform.htm`: `FORM`이 subroutine과 interface를 정의하며, subroutine이 obsolete이고 신규 프로그램에는 method를 권장한다는 근거.
- `C:\ABAP_DOCU_HTML\abapperform.htm`: `PERFORM`이 subroutine을 호출하며, subroutine은 기존 내부 모듈화 코드에서 계속 호출될 수 있지만 신규 생성은 지양된다는 근거.
- `C:\ABAP_DOCU_HTML\abapform_parameters.htm`: `FORM` formal parameter의 typing, pass by value, implicit generic typing 위험.
- `C:\ABAP_DOCU_HTML\abapperform_parameters.htm`: `PERFORM`의 `USING`, `CHANGING`, `TABLES` parameter list와 `TABLES` obsolete 주의.
- `C:\ABAP_DOCU_HTML\abapperform_form.htm`: 외부 subroutine call이 거의 obsolete이고 methods/function modules를 explicit interface로 쓰라는 근거.
- `C:\ABAP_DOCU_HTML\abapreturn.htm`: `RETURN`은 processing block을 조기 종료하는 문장이고, procedure exit 용도로 쓰라는 근거.
- `C:\ABAP_DOCU_HTML\abapstatics.htm`: `STATICS`는 subroutine/function module/static method 안에서 값 수명을 유지하는 local visible variable이라는 근거.
- `C:\ABAP_DOCU_HTML\abapcall_function.htm`: `CALL FUNCTION`의 전체 구조와 `sy-subrc` 설정.
- `C:\ABAP_DOCU_HTML\abapcall_function_parameter.htm`: `EXPORTING`, `IMPORTING`, `TABLES`, `CHANGING`, `EXCEPTIONS`, `OTHERS`, `sy-subrc` 처리.
- `C:\ABAP_DOCU_HTML\abenfunction_module_glosry.htm`: Function Module이 Function Builder에서 만들고 `CALL FUNCTION`으로 호출되는 처리 블록이라는 근거.
- `C:\ABAP_DOCU_HTML\abenfunction_modules_obsolete.htm`: Function Module 작성 시 table parameters 등 obsolete 요소 주의.
- `C:\ABAP_DOCU_HTML\abapclass.htm`: `CLASS`의 definition/implementation 구조와 section 구성.
- `C:\ABAP_DOCU_HTML\abapclass-methods.htm`: `CLASS-METHODS`, `IMPORTING`, `EXPORTING`, `CHANGING`, `RETURNING` 선언.
- `C:\ABAP_DOCU_HTML\abapclass-methods_functional.htm`: `RETURNING`이 있는 functional static method.
- `C:\ABAP_DOCU_HTML\abenlocal_class_glosry.htm`: Local Class는 ABAP program 안에서 정적으로 접근되는 class라는 근거.
- `C:\ABAP_DOCU_HTML\abenglobal_class_glosry.htm`: Global Class는 class pool에 정의되는 global type이라는 근거.
- `C:\ABAP_DOCU_HTML\abenstatic_method_glosry.htm`: Static Method는 `CLASS-METHODS`로 선언되며 instance 없이 사용할 수 있다는 근거.
- `C:\ABAP_DOCU_HTML\abaptype-pool.htm`, `C:\ABAP_DOCU_HTML\abaptype-pools.htm`: Type Pool/TYPE-POOLS는 기존 코드 인지용이며 신규 생성은 지양된다는 근거.

### CH10 공통 체험 장치

CH10은 코드가 1줄이라도 나오면 호출 흐름을 보이게 해야 한다. 각 레슨에는 다음 체험을 붙인다.

- L01: "PERFORM 호출 지도"에서 `PERFORM print_header`를 누르면 실행 위치가 FORM 블록으로 점프했다가 호출 다음 줄로 돌아온다.
- L02: "파라미터 이동 보드"에서 `USING`, `USING VALUE`, `CHANGING`, `CHANGING VALUE`를 토글하고 원본 값이 바뀌는지 비교한다.
- L03: "CALL FUNCTION 상자"에서 호출자 기준 `EXPORTING`, `IMPORTING`, `CHANGING`, `EXCEPTIONS` 화살표를 뒤집어 보며 방향 혼동을 막는다.
- L04: "Local Class 정적 메서드 스텝퍼"에서 `CLASS ... DEFINITION`, `IMPLEMENTATION`, `lcl_calc=>add_tax` 호출 흐름을 한 줄씩 따라간다.
- L05: "전역 클래스 블랙박스 호출기"에서 이미 만들어진 `ZCL_BOOKING_CALC=>GET_REMAINING`을 호출하고 내부는 열지 않은 채 입력/출력 계약만 본다.
- L06: "모듈화 선택 카드"에서 상황 카드를 Subroutine, Function Module, Class 중 어디에 둘지 분류한다.
- L07: 기존 `embeds/abap/CH10-L07-S01.html`을 사용해 잔여석 합산 과정을 step debugger로 확인한다.

---

## CH10-L01 - FORM / PERFORM 기본 호출

### 왜 필요한가

프로그램이 짧을 때는 위에서 아래로 쭉 쓰면 된다. 하지만 같은 출력 헤더, 같은 세금 계산, 같은 잔여석 계산이 여러 곳에 반복되면 문제가 생긴다. 한 곳의 계산식만 고치고 다른 복사본을 놓치면 프로그램 안에 서로 다른 규칙이 생긴다.

CH10-L01은 반복 코드를 이름 붙은 블록으로 묶는 첫 레슨이다. 가장 오래된 도구가 `FORM`과 `PERFORM`이다. 다만 이 도구는 공식 문서상 obsolete modularization에 속한다. 새 설계의 주력으로 추천하는 것이 아니라, 기존 ABAP 코드에 너무 많이 남아 있어 읽고 유지보수할 수 있게 배우는 것이다.

### 무엇인가

[[Subroutine]]은 같은 프로그램 안에서 이름을 붙여 부를 수 있는 처리 블록이다. `FORM`은 블록을 정의하고, `PERFORM`은 그 블록을 호출한다.

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

1. `PERFORM print_header.`를 만난다.
2. 아래쪽 `FORM print_header.` 블록으로 이동한다.
3. `ENDFORM.`까지 실행한다.
4. 다시 `PERFORM` 다음 줄로 돌아와 `WRITE`를 실행한다.

### 어떻게 확인하는가

디버거 또는 스텝 실행 체험에서 `PERFORM` 줄에 멈춘다. 다음 실행을 누르면 커서가 `FORM print_header` 안으로 들어간다. `ENDFORM`을 지나면 다시 호출 다음 줄로 돌아온다. 이 "들어갔다가 돌아오는" 감각이 모듈화의 출발점이다.

지역 변수와 전역 변수 차이도 함께 확인한다.

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

`gv_total_calls`는 프로그램 전체에서 살아 있으므로 2가 된다. 반면 `lv_local_calls`는 `FORM`을 부를 때마다 새로 만들어졌다가 사라지므로 매번 1처럼 보인다. 초급자는 여기서 "블록 안에서 만든 DATA는 그 블록 밖에서 마음대로 쓰는 것이 아니다"라는 스코프 감각을 얻어야 한다.

### 체험 설계

"PERFORM 호출 지도"는 코드 왼쪽에 실행 화살표를 둔다.

- 버튼: `시작`, `다음 줄`, `FORM으로 들어가기`, `ENDFORM에서 돌아오기`, `정의 누락 실험`.
- 상태: 현재 실행 위치, 호출 스택 1칸, 전역 변수 영역, 지역 변수 영역.
- 데이터: `gv_total_calls`, `lv_local_calls`.
- 피드백:
  - `PERFORM`을 누르면 "호출: print_header 블록으로 이동" 표시.
  - `ENDFORM`을 지나면 "복귀: 호출 다음 줄로 돌아옴" 표시.
  - `FORM` 정의를 숨기면 "정의되지 않은 subroutine을 호출했습니다" 오류 카드 표시.

### 실수와 주의

`PERFORM`만 있고 `FORM`이 없으면 호출할 블록이 없다. 이름 철자도 정확해야 한다.

외부 프로그램의 subroutine을 호출하는 방식은 거의 obsolete이고 위험하다. CH10에서는 같은 프로그램 내부의 흐름을 읽는 정도로 제한한다.

가장 중요한 주의는 신규 개발 습관이다. `FORM/PERFORM`은 읽을 줄 알아야 하지만, 새 코드를 설계할 때는 method 중심으로 가는 것이 현대 ABAP의 방향이다.

### 정리

L01의 결론은 "반복 코드는 이름 붙은 처리 블록으로 묶을 수 있다"이다. `FORM`은 정의, `PERFORM`은 호출이다. 다만 이 도구는 레거시 이해용이라는 꼬리표를 항상 붙인다.

---

## CH10-L02 - USING / CHANGING 파라미터

### 왜 필요한가

L01의 `print_header`는 바깥 값을 받지 않는다. 하지만 실제 업무 로직은 입력을 받아야 한다. 세금 계산은 금액을 받아야 하고, 잔여석 계산은 공연 ID와 회차 번호를 받아야 한다. 그리고 결과를 호출한 쪽으로 돌려줘야 한다.

파라미터는 모듈의 입구와 출구다. 입구와 출구를 분명히 하지 않으면 subroutine은 전역 변수에 몰래 의존하게 되고, 나중에 어디서 값이 바뀌었는지 찾기 어려워진다.

### 무엇인가

[[파라미터]]는 subroutine, function module, method에 값을 건네주거나 결과를 돌려받는 통로다. `FORM`에서는 보통 `USING`과 `CHANGING`으로 표현한다.

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

`USING`은 호출자가 subroutine으로 넘기는 입력값이라는 의도를 나타낸다. `CHANGING`은 subroutine 안에서 바꾸어 호출자 쪽으로 돌려줄 값이라는 의도를 나타낸다.

### 어떻게 확인하는가

첫 번째 확인은 값의 방향이다.

- `lv_amount`는 `PERFORM`에서 `iv_amount`로 들어간다.
- `cv_result`에 계산 결과가 들어간다.
- `ENDFORM` 이후 `lv_result`에 결과가 보인다.

두 번째 확인은 전달 방식이다.

| 방식 | 예 | 초급자 감각 |
| --- | --- | --- |
| Call by Reference | `USING iv_amount` | 원본과 연결된 채 넘어간다 |
| Call by Value | `USING VALUE(iv_amount)` | 복사본을 넘겨 원본을 보호한다 |
| Call by Value and Result | `CHANGING VALUE(cv_result)` | 복사해 처리하고 정상 종료 시 되돌린다 |

초급 과정에서는 "입력만 받는 값은 `USING VALUE(...)`로 보호하는 습관이 좋다" 정도로 잡는다. 기존 코드에는 reference 방식도 많기 때문에 읽을 수 있어야 한다.

`RETURN`과 `STATICS`도 여기서 맛본다.

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

`RETURN`은 남은 코드를 실행하지 않고 현재 처리 블록을 빠져나간다.

```abap
FORM count_subroutine.
  STATICS sv_count TYPE i.

  sv_count = sv_count + 1.
  WRITE: / '이 FORM 호출 횟수:', sv_count.
ENDFORM.
```

`STATICS`는 `FORM` 안에서만 보이지만 호출이 끝나도 값이 유지된다. 일반 `DATA` 지역 변수와 다르다.

### 체험 설계

"파라미터 이동 보드"는 왼쪽에 호출자 변수, 가운데에 FORM interface, 오른쪽에 FORM 내부 변수를 둔다.

- 버튼: `USING reference`, `USING VALUE`, `CHANGING reference`, `CHANGING VALUE`, `0으로 나누기`, `STATICS 3회 호출`.
- 상태:
  - 원본 변수 값.
  - FORM 내부 값.
  - ENDFORM 이후 되돌아온 값.
  - RETURN이 실행되어 건너뛴 줄.
- 데이터:
  - `lv_amount = 1000`
  - `lv_result = 0`
  - `sv_count = 1, 2, 3`
- 피드백:
  - "USING reference는 입력 의도여도 원본을 바꿀 수 있으므로 주의."
  - "USING VALUE는 복사본이므로 원본 보호."
  - "RETURN 이후 줄은 실행되지 않았습니다."
  - "STATICS 값은 다음 호출에도 유지됩니다."

### 실수와 주의

`USING`과 `CHANGING` 순서를 대충 쓰면 호출자와 정의의 대응이 흐려진다. 공식 문서도 program documentation 관점에서 `FORM`의 interface와 맞춰 쓰는 것이 좋다고 안내한다.

타입을 생략하면 formal parameter가 너무 generic해질 수 있다. 입문 단계부터 `TYPE`을 명시해 안전하게 만든다.

출력값을 `USING`으로 돌려주는 코드는 읽는 사람을 속인다. 값이 바뀌어 돌아오는 의도가 있으면 `CHANGING`을 사용한다.

### 정리

L02의 결론은 "모듈은 입구와 출구가 분명해야 한다"이다. `USING`은 입력 의도, `CHANGING`은 입출력 의도다. `RETURN`은 조기 종료, `STATICS`는 호출 사이 값 유지다.

---

## CH10-L03 - CALL FUNCTION 기본 구조

### 왜 필요한가

Subroutine은 같은 프로그램 내부에 묶인다. 하지만 SAP에는 여러 프로그램에서 함께 쓰는 재사용 단위가 필요하다. 세금 계산, 파일 다운로드, 표준 BAPI, RFC 호출처럼 하나의 프로그램 안에 가둘 수 없는 기능이 많다.

Function Module은 Function Builder에서 관리되는 전역 재사용 단위다. 오래된 SAP 표준과 실무 코드에서 매우 자주 등장하므로, 초급자도 `CALL FUNCTION` 구조와 파라미터 방향을 읽을 수 있어야 한다.

### 무엇인가

[[Function Module]]은 Function Group 안에 들어 있는 전역 절차형 처리 블록이다. 호출은 `CALL FUNCTION`으로 한다.

```abap
REPORT zch10_l03_call_function.

DATA: lv_amount TYPE p LENGTH 8 DECIMALS 2,
      lv_result TYPE p LENGTH 8 DECIMALS 2,
      lv_log    TYPE c LENGTH 40.

lv_amount = 1000.

CALL FUNCTION 'Z_CH10_ADD_TAX'
  EXPORTING
    iv_amount       = lv_amount
  IMPORTING
    ev_result       = lv_result
  CHANGING
    cv_log          = lv_log
  EXCEPTIONS
    invalid_amount  = 1
    OTHERS          = 2.

IF sy-subrc = 0.
  WRITE: / '세금 포함 금액:', lv_result.
ELSE.
  WRITE: / '함수 모듈 처리 실패:', sy-subrc.
ENDIF.
```

가장 헷갈리는 지점은 방향이다. `EXPORTING`과 `IMPORTING`은 호출자 기준으로 읽는다.

- `EXPORTING`: 내가 함수 모듈로 내보내는 값.
- `IMPORTING`: 내가 함수 모듈에서 받아오는 값.
- `CHANGING`: 넘겨서 바뀐 뒤 돌아오는 값.
- `TABLES`: Internal Table 전달에 쓰이던 레거시 방식.
- `EXCEPTIONS`: classic exception을 숫자로 매핑해 `sy-subrc`로 받는 방식.

### 어떻게 확인하는가

SE37에서 Function Module을 열면 Import, Export, Changing, Tables, Exceptions 탭을 볼 수 있다. 호출 코드의 `EXPORTING`, `IMPORTING`, `CHANGING`, `EXCEPTIONS`가 SE37의 interface와 맞는지 확인한다.

함수 모듈이 정상 종료되면 `sy-subrc`는 0이다. `EXCEPTIONS invalid_amount = 1`로 매핑한 예외가 발생하면 `sy-subrc`는 1이 된다. `OTHERS = 2`는 명시하지 않은 나머지 예외를 공통 코드로 받는 안전망이다.

### 체험 설계

"CALL FUNCTION 상자"는 Function Module을 검은 상자가 아니라 계약 상자로 보여 준다.

- 버튼: `정상 금액`, `음수 금액`, `EXPORT/IMPORT 방향 뒤집기 퀴즈`, `EXCEPTIONS 제거 실험`.
- 상태:
  - 호출자 변수 `lv_amount`, `lv_result`, `lv_log`.
  - Function Module interface 탭.
  - `sy-subrc`.
- 데이터:
  - 정상: `iv_amount = 1000`, `ev_result = 1100`, `sy-subrc = 0`.
  - 오류: `iv_amount = -1`, `invalid_amount`, `sy-subrc = 1`.
- 피드백:
  - "EXPORTING은 호출자가 함수로 내보내는 값입니다."
  - "IMPORTING은 호출자가 함수에서 가져오는 값입니다."
  - "EXCEPTIONS를 매핑하지 않으면 예외 상황을 제대로 분기하지 못할 수 있습니다."

### 실수와 주의

가장 흔한 실수는 `EXPORTING`과 `IMPORTING`을 함수 모듈 내부 기준으로 읽는 것이다. 반드시 호출자 기준으로 읽는다.

두 번째 실수는 `sy-subrc` 확인 누락이다. `CALL FUNCTION` 뒤에서 classic exception을 매핑했다면 `sy-subrc` 분기를 바로 읽어야 한다.

`TABLES` parameter와 일부 obsolete typing은 기존 함수 모듈에서 만날 수 있지만 신규 설계에서 권장하지 않는다. CH10에서는 읽기 위해 알아두고, 깊은 설계는 후속 장으로 넘긴다.

### 정리

L03의 결론은 "Function Module은 프로그램 밖에서도 공유되는 절차형 재사용 단위이고, `CALL FUNCTION`은 호출자 기준 파라미터 계약을 읽어야 한다"이다.

---

## CH10-L04 - Local Class로 모듈화: 정적 기준

### 왜 필요한가

Subroutine과 Function Module은 절차형 모듈화다. 하지만 현대 ABAP의 중심은 class와 method다. 다만 CH10에서 객체지향을 본격적으로 시작하면 초급자는 너무 많은 개념을 한 번에 만난다. 그래서 여기서는 객체를 만들지 않고 부를 수 있는 static method만 맛본다.

목표는 "class도 코드를 이름 붙은 책임 단위로 묶는 도구"라는 감각을 얻는 것이다. 설계 원칙, 객체 생성, 상속, 인터페이스는 CH20에서 정식으로 배운다.

### 무엇인가

[[Class]]는 관련 있는 data와 method를 묶는 설계 단위다. [[Method]]는 class 안에 들어 있는 처리 블록이다. Local Class는 현재 ABAP program 안에서 정의해 쓰는 class다.

class는 두 부분으로 나뉜다.

- `DEFINITION`: 무엇을 공개하고 어떤 method가 있는지 선언한다.
- `IMPLEMENTATION`: method의 실제 코드를 작성한다.

정적 메서드는 `CLASS-METHODS`로 선언하고, 객체 생성 없이 `클래스=>메서드` 형태로 부른다.

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

### 어떻게 확인하는가

코드를 세 덩어리로 색칠한다.

1. `CLASS lcl_calc DEFINITION`: 외부에서 볼 수 있는 약속.
2. `CLASS lcl_calc IMPLEMENTATION`: 실제 계산 코드.
3. `lcl_calc=>add_tax( 1000 )`: 정적 method 호출.

`PUBLIC SECTION`에 있는 method는 호출할 수 있다. `PRIVATE SECTION`에 있는 구성 요소는 class 내부 구현용이다. CH10에서는 `PUBLIC`과 `PRIVATE`만 다루고, `PROTECTED`는 깊게 설명하지 않는다.

### 체험 설계

"Local Class 정적 메서드 스텝퍼"는 class를 설계도 카드와 실행 카드로 나눈다.

- 버튼: `DEFINITION 보기`, `IMPLEMENTATION 보기`, `정적 호출 실행`, `PUBLIC 제거 실험`, `RETURNING 제거 실험`.
- 상태:
  - 공개 계약: `add_tax`.
  - 입력: `iv_amount = 1000`.
  - 반환: `rv_result = 1100`.
  - 호출 형식: `lcl_calc=>add_tax`.
- 피드백:
  - "DEFINITION은 사용자가 볼 계약입니다."
  - "IMPLEMENTATION은 실제 작업 내용입니다."
  - "CLASS-METHODS는 instance 없이 호출할 수 있습니다."
  - "객체 생성과 instance method는 CH20에서 정식으로 다룹니다."

### 실수와 주의

`DEFINITION`만 쓰고 `IMPLEMENTATION`을 빠뜨리면 method 본문이 없다. 반대로 `IMPLEMENTATION`에만 method를 써도 공개 계약이 없다.

정적 method를 부를 때는 `=>`를 사용한다. 객체를 만들어 부르는 instance method 호출은 CH20에서 다룬다. CH10에서는 `=>` 감각만 확실히 잡는다.

method 이름과 parameter 이름이 길어 보인다고 줄이면 안 된다. class 방식은 "계약을 읽을 수 있게 만드는 것"이 중요하다.

### 정리

L04의 결론은 "Local Class도 모듈화 도구이며, CH10에서는 정적 method만 안전하게 맛본다"이다. `DEFINITION`은 계약, `IMPLEMENTATION`은 본문, `=>`는 정적 호출이다.

---

## CH10-L05 - Global Class 호출 기초

### 왜 필요한가

Local Class는 현재 프로그램 안에서만 쓰기 좋다. 하지만 여러 프로그램에서 함께 쓰려면 전역 재사용 단위가 필요하다. Function Module이 절차형 전역 재사용 단위라면, Global Class는 객체지향 쪽 전역 재사용 단위다.

CH10-L05의 목표는 Global Class를 설계하는 것이 아니다. 이미 만들어진 전역 클래스의 정적 method를 블랙박스처럼 호출하는 법을 익히는 것이다. CH11의 SALV에서도 표준 클래스를 만나므로, 지금 `클래스=>메서드` 호출 감각을 만들어 둔다.

### 무엇인가

[[Global Class]]는 class pool에 정의되는 전역 class다. 보통 `SE24`에서 만들고 조회한다. 이름은 고객 객체라면 `ZCL_...`, SAP 표준이라면 `CL_...` 형태를 자주 본다.

이미 만들어진 정적 method는 다음처럼 호출할 수 있다.

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

위 예제는 "전역 클래스를 내가 지금 설계한다"는 뜻이 아니다. `ZCL_BOOKING_CALC`가 이미 만들어져 있고, 그 method의 공개 interface만 보고 호출한다고 가정한다.

### 어떻게 확인하는가

SE24에서 전역 클래스를 열고 다음을 확인한다.

- method가 static인지.
- method 이름과 parameter 이름이 무엇인지.
- `IMPORTING`으로 넣어야 할 값이 무엇인지.
- `RETURNING` 또는 `EXPORTING`으로 받는 값이 무엇인지.
- 공개된 method인지.

CH10에서는 내부 구현을 열어 깊게 분석하지 않는다. 블랙박스처럼 "입력 계약과 출력 계약"만 읽는다.

### 체험 설계

"전역 클래스 블랙박스 호출기"는 왼쪽에 호출자, 가운데에 닫힌 class 상자, 오른쪽에 결과를 둔다.

- 버튼: `SE24 계약 보기`, `정상 호출`, `필수 parameter 누락`, `static 여부 확인`.
- 상태:
  - 클래스명: `ZCL_BOOKING_CALC`.
  - method: `GET_REMAINING`.
  - 입력: `C001`, `001`.
  - 결과: `4`.
- 피드백:
  - "static method이므로 `=>`로 호출합니다."
  - "내부 구현을 몰라도 공개 interface가 맞으면 호출할 수 있습니다."
  - "instance가 필요한 method는 CH20에서 다룹니다."

### 실수와 주의

전역 클래스라고 해서 모두 정적으로 부를 수 있는 것은 아니다. method가 `CLASS-METHODS`로 선언된 static method인지 확인해야 한다.

Global Class를 직접 설계하는 규칙은 CH20의 주제다. CH10에서 너무 많이 설명하면 선수지식 잠금이 깨진다. 이 레슨은 "이미 있는 도구를 부른다"에 한정한다.

### 정리

L05의 결론은 "Global Class는 여러 프로그램이 함께 쓰는 전역 class이고, CH10에서는 정적 method를 블랙박스처럼 호출하는 법만 익힌다"이다.

---

## CH10-L06 - Subroutine / Function / Class 선택 기준

### 왜 필요한가

이제 학습자는 세 가지 모듈화 도구를 보았다. `FORM/PERFORM`, Function Module, Class/Method다. 모두 "코드를 묶는다"는 공통점이 있지만, 같은 도구가 아니다. 아무 상황에나 같은 도구를 쓰면 유지보수 방향이 엉킨다.

L06은 새 문법을 배우는 레슨이 아니라 선택 기준을 세우는 레슨이다.

### 무엇인가

세 도구는 범위와 권장도가 다르다.

| 도구 | 범위 | 현재 권장도 | 초급자 판단 |
| --- | --- | --- | --- |
| Subroutine | 프로그램 내부 | 레거시 이해용 | 기존 코드 읽기와 작은 내부 정리에 사용 |
| Function Module | 전역 절차형 재사용 | 여전히 중요 | 표준 FM, RFC, BAPI 계열을 만날 때 |
| Class / Method | 전역/지역 책임 단위 | 신규 개발 중심 | 현대 ABAP의 기본 방향 |

Type Group도 오래된 코드에서 만날 수 있다. 공식 문서상 Type Pool은 기존 global type/constant 묶음으로 존재하지만, public section의 global class 등으로 대체 가능한 흐름이라 신규 생성은 지양한다. CH10에서는 "옛 코드에서 보이면 놀라지 말 것" 정도로만 다룬다.

### 어떻게 확인하는가

상황별로 고른다.

- 같은 프로그램 안에서 오래된 리포트를 조금 정리한다: 기존 `FORM`을 읽고 최소 수정한다.
- 표준 BAPI나 RFC 가능 인터페이스를 호출한다: Function Module을 읽는다.
- 새 업무 로직을 여러 프로그램이 재사용하게 만들고 싶다: Class/Method 중심으로 설계한다.
- CH11에서 SALV 표준 표시 기능을 쓴다: 표준 Global Class의 공개 method를 호출한다.

선택 기준은 "무엇이 더 멋져 보이는가"가 아니라 "이 코드가 어디까지 재사용되어야 하고, 어떤 SAP 표준 형태와 연결되는가"다.

### 체험 설계

"모듈화 선택 카드"는 상황 카드를 도구 칸으로 끌어다 놓는 활동이다.

- 카드: "기존 20년 된 리포트의 FORM 유지보수" -> Subroutine.
- 카드: "표준 BAPI 호출" -> Function Module.
- 카드: "새 잔여석 계산 서비스를 여러 리포트에서 공유" -> Class/Method.
- 카드: "RFC로 외부 시스템과 연결" -> Function Module.
- 카드: "CH11 SALV 표준 표시 호출" -> Global Class.
- 카드: "TYPE-POOLS 문을 발견" -> 옛 코드 인지, 신규 선택지 아님.

각 선택 후에는 왜 맞는지 한 줄 피드백을 보여 준다.

### 실수와 주의

신규 코드에 `FORM`을 습관처럼 추가하는 것은 지양한다. 기존 코드 이해용과 신규 설계용을 구분해야 한다.

반대로 모든 것을 class로만 보아도 안 된다. SAP 표준에는 Function Module 기반 인터페이스가 여전히 많고, BAPI/RFC 같은 주제에서는 Function Module을 읽을 수 있어야 한다.

### 정리

L06의 결론은 "기존 내부 코드는 Subroutine을 읽고, 표준 절차형 재사용은 Function Module을 읽고, 신규 설계 방향은 Class/Method를 중심에 둔다"이다.

---

## CH10-L07 - 실습: 잔여석 계산과 예매 판정 모듈화

### 왜 필요한가

CH09에서 콘서트 예매 테이블을 만들었다. 이제 업무 질문이 생긴다.

"이 회차에 몇 석이 남았는가?"

"정훈영이 3석을 요청했을 때 예매 가능한가?"

이 계산을 화면마다 복사해 붙이면 안 된다. 잔여석 계산은 하나의 책임이다. CH10-L07은 그 책임을 `get_remaining`과 `can_book`이라는 이름 붙은 모듈로 분리한다.

### 무엇인가

잔여석 계산은 다음 순서다.

1. 해당 공연/회차의 예매를 읽는다.
2. 취소 상태가 아닌 예매의 좌석 수를 더한다.
3. 공연 정원에서 이미 예매된 좌석 합계를 뺀다.
4. 원하는 좌석 수가 잔여석보다 작거나 같은지 판단한다.

CH13의 SQL 집계는 아직 배우지 않았으므로, 이 장에서는 CH06의 Internal Table과 `LOOP`, CH08의 `SELECT`만 사용한다.

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

호출 예시는 다음과 같다.

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

### 체험 설계

기존 `embeds/abap/CH10-L07-S01.html`을 중심으로 사용한다. 이 embed는 `get_remaining`의 실행을 step debugger로 보여 준다.

- 버튼: `시작`, `다음`, `현재 행`, `전체 출력`.
- 상태:
  - `ls_book-seats`: 현재 LOOP에서 읽은 예매 좌석 수.
  - `lv_sum`: 누적 예매 좌석.
  - `lv_cap`: 공연 정원.
  - `cv_left`: 최종 잔여석.
- 데이터:
  - 예매 3건: 2석, 3석, 1석.
  - 정원: 10석.
  - 결과: 잔여석 4석.
- 피드백:
  - `SELECT` 단계: "조건에 맞는 예매 3건 조회".
  - `LOOP` 단계: "좌석 수를 lv_sum에 누적".
  - `SELECT SINGLE` 단계: "공연 정원 조회".
  - 마지막 단계: "정원 10 - 예매 6 = 잔여석 4".

추가 체험으로 `can_book` 판정 토글을 둔다.

- 요청 좌석 `3`: `3 <= 4`, 가능.
- 요청 좌석 `5`: `5 <= 4`, 불가능.
- 취소 예매 포함 토글: 켜면 잘못된 합계가 나오고, "취소 건을 합산하면 잔여석이 실제보다 작게 계산됩니다" 피드백을 표시한다.

### 실수와 주의

취소 상태를 제외하지 않으면 이미 취소된 예매까지 좌석을 차지하는 것처럼 계산된다. `status <> 'C'` 조건은 단순 조건이 아니라 업무 규칙이다.

잔여석 계산 안에서 전역 변수에 의존하면 테스트하기 어렵다. 공연 ID와 회차 번호는 `USING`, 결과 잔여석은 `CHANGING`으로 분명히 전달한다.

CH13에서 배우는 SQL 집계를 미리 쓰지 않는다. 지금은 Internal Table과 `LOOP`로 합산 과정을 눈으로 확인하는 것이 목적이다.

### 정리

L07의 결론은 "업무 규칙은 이름 붙은 모듈로 분리하고, 입력과 결과를 파라미터로 드러낸다"이다. 이 실습을 마치면 CH11에서 예매 목록을 표로 보여 줄 준비가 된다.

---

## CH10 마무리 학습 흐름

CH10을 마친 학습자는 다음 질문에 답할 수 있어야 한다.

- `FORM`과 `PERFORM`은 각각 무엇을 하는가.
- Subroutine이 obsolete인데도 왜 읽을 줄 알아야 하는가.
- 지역 변수와 전역 변수의 차이는 무엇인가.
- `USING`, `CHANGING`, pass by value, pass by reference는 값 이동을 어떻게 바꾸는가.
- `RETURN`과 `STATICS`는 처리 흐름과 값 수명에 어떤 영향을 주는가.
- `CALL FUNCTION`에서 `EXPORTING`과 `IMPORTING`은 왜 호출자 기준으로 읽어야 하는가.
- classic `EXCEPTIONS`는 `sy-subrc`와 어떻게 연결되는가.
- Local Class의 `DEFINITION`, `IMPLEMENTATION`, `CLASS-METHODS`, `=>`는 각각 무엇인가.
- Global Class의 정적 method를 블랙박스처럼 호출한다는 말은 무엇인가.
- Subroutine, Function Module, Class 중 무엇을 언제 선택해야 하는가.

최종 과제는 다음 기준으로 채점한다.

1. 같은 계산 로직을 복사하지 않고 `FORM`으로 분리했다.
2. 입력값은 `USING`, 결과값은 `CHANGING`으로 드러냈다.
3. `sy-subrc` 또는 결과값을 확인해 실패 흐름을 설명할 수 있다.
4. 기존 `CH10-L07-S01` 디버거에서 `lv_sum`, `lv_cap`, `cv_left` 변화를 설명할 수 있다.
5. "신규 설계의 중심은 method, 기존 코드 이해에는 FORM, 표준 절차형 재사용에는 Function Module"이라는 선택 기준을 말할 수 있다.
