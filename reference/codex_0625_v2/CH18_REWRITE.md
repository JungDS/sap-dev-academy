# CH18_REWRITE · Modern ABAP Syntax

> 기준: `reference/codex_0625/00_QUALITY_REVIEW.md`의 재작업 판정
> 원본: `content/abap/CH18/_chapter.md`, `content/abap/CH18/CH18-L01.md` ~ `CH18-L07.md`
> 목적: CH18을 템플릿 보강안이 아니라, 입문자가 classic ABAP에서 modern ABAP으로 안전하게 넘어가는 완성 강의자료 수준으로 재집필한다.

## CH18의 역할

CH18은 "새 문법 모음"이 아니다. CH01~CH17에서 이미 익힌 classic ABAP 사고방식을 더 짧고 덜 위험한 표현으로 바꾸는 첫 전환점이다. 그래서 이 장의 핵심 질문은 "짧게 쓰는 방법이 무엇인가"가 아니라 "이미 배운 의도를 유지하면서 어디까지 줄여도 사람이 더 잘 읽을 수 있는가"이다.

지금까지 학습자는 변수를 먼저 선언하고, 값을 따로 채우고, 테이블에서 행을 읽은 뒤 `sy-subrc`를 확인하고, 문자열을 여러 조각으로 이어 붙였다. 이 방식은 명시적이라 처음 배우기 좋다. 하지만 프로그램이 커지면 선언과 사용 위치가 멀어지고, `CLEAR`, 필드 대입, `APPEND`, `MOVE-CORRESPONDING`, `CONCATENATE` 같은 문장이 업무 의도보다 더 크게 보이기 시작한다. CH18의 modern syntax는 이 잡음을 줄인다.

이 장에서 허용되는 modern syntax는 다음 범위다.

| 도구 | 이번 장에서 하는 일 | 아직 하지 않는 일 |
|---|---|---|
| Inline declaration `DATA( )`, `FINAL( )` | 값을 받는 위치에서 변수를 선언한다. | SELECT문의 modern SQL 선언은 CH19에서 다룬다. |
| `VALUE` constructor | 구조체와 Internal Table을 값처럼 만든다. | `COND`, `SWITCH`, `REDUCE`, `FILTER`, `CONV`까지 확장하지 않는다. |
| `VALUE #( FOR ... )` | 반복으로 테이블 값을 생성한다. | 복잡한 중첩 comprehension으로 알고리즘을 숨기지 않는다. |
| `CORRESPONDING` | 같은 이름의 필드를 안전하게 매핑한다. | RAP/EML의 특수 매핑까지 끌어오지 않는다. |
| Table expression `itab[ ... ]` | 한 행 조회를 표현식으로 쓴다. | 예외 처리 구문을 본격 도입하지 않는다. |
| String template `|...{ }...|` | 문장 안에 값을 직접 넣는다. | 국제화 전체 설계나 Text Symbol 대체 전략으로 확장하지 않는다. |
| Calculation assignment `+=` 등 | 누적 계산을 짧게 쓴다. | 모든 산술식을 무조건 축약하지 않는다. |

> R15 경계: CH18은 New Syntax의 첫 정식 도입 장이다. 그러나 New Open SQL의 `@`, 콤마 기반 SELECT, SELECT문의 inline 선언은 CH19 경계에 속한다. 객체 생성식과 OO 본격 문법은 CH20 경계에 속한다. CH18의 예제는 classic SQL과 non-OO 범위 안에서 modern expression만 다룬다.

## 공식 문서 수동 확인 근거

이번 재작성은 자동 키워드 매칭이 아니라 CH18 핵심 문법별로 `C:\ABAP_DOCU_HTML`의 ABAP Keyword Documentation을 수동 확인한 내용을 반영한다.

| 주제 | 확인한 문서 파일 | 본문 반영 포인트 |
|---|---|---|
| Inline declaration | `abeninline_declarations.htm`, `abendata_inline.htm`, `abenfinal_inline.htm` | inline 선언은 declaration position에서만 가능하고, 타입은 정적으로 완전히 유도되어야 하며, `FINAL( )`은 선언 뒤 재대입을 막는다. |
| `VALUE` constructor | `abenconstructor_expression_value.htm`, `abenvalue_constructor_params_struc.htm`, `abenvalue_constructor_params_itab.htm` | `#`는 타입이 명확할 때만 가능하고, `BASE`가 없으면 대상 테이블을 새로 만든다. `FOR` 반복도 internal table constructor에서 사용할 수 있다. |
| `CORRESPONDING` | `abenconstructor_expr_corresponding.htm`, `abencorresponding_constr_mapping.htm` | 같은 이름 매핑, `MAPPING target = source`, `EXCEPT target`의 의미와 순서를 분리해 설명한다. |
| Table expression | `abentable_expressions.htm`, `abenline_exists_function.htm`, `abenline_index_function.htm` | table expression은 실패 시 `sy-subrc`를 세팅하지 않고, 없는 행은 예외를 일으킨다. `line_exists`와 `line_index`는 안전한 확인 도구다. |
| String template | `abenstring_templates.htm`, `abenstring_templates_expressions.htm`, `abenstring_templates_predef_format.htm` | `{ }` 안의 표현식, 공백 규칙, `DATE = USER`, `NUMBER = USER` 같은 출력 형식 옵션을 반영한다. |
| String function | `abensubstring_functions.htm`, `abenstring_processing_expr_func.htm` | `substring`, `to_upper`, `strlen` 같은 함수는 표현식 위치에서 사용할 수 있고, 범위 오류에 주의한다. |
| Calculation assignment | `abencalculation_assignments.htm` | `lhs += rhs`는 `lhs = lhs + rhs`와 같은 계열이며, 왼쪽은 이미 존재하는 숫자 변수여야 한다. |

## CH18-L01 · Inline Declaration

### 왜 필요한가

classic ABAP에서는 변수를 먼저 선언하고 나중에 값을 넣는다. 이 방식은 학습 초기에 좋다. 어떤 변수가 있는지 프로그램 위쪽에서 한눈에 보이고, `DATA lv_total TYPE i.`처럼 타입도 명확히 드러난다.

하지만 업무 코드가 조금만 길어지면 문제가 생긴다. 예를 들어 `READ TABLE`로 한 행을 읽으려고 파일 맨 위에 `ls_book`을 선언하고, 실제 사용은 80줄 아래에서 한다고 해 보자. 읽는 사람은 "이 변수는 어디서 값이 들어오지?", "중간에 다른 값으로 바뀌지는 않았나?"를 계속 추적해야 한다. 변수 선언이 업무 의도와 떨어져 있으면 선언 자체가 친절함이 아니라 잡음이 된다.

Inline declaration은 이 문제를 해결한다. 변수가 필요한 바로 그 위치에서 선언한다. 즉 "이 문장이 값을 만들어 내고, 그 값을 받을 변수가 지금 생긴다"를 한 줄에서 보여 준다.

### 무엇인가

Inline declaration은 `DATA(변수명)` 또는 `FINAL(변수명)` 형태로 쓴다. 아무 곳에서나 쓸 수 있는 축약 문법이 아니라, ABAP이 "여기에는 어떤 타입의 변수가 들어와야 하는지"를 문법적으로 알고 있는 위치에서만 쓸 수 있다. 공식 문서는 이런 위치를 declaration position으로 설명한다.

대표적인 위치는 다음과 같다.

| 위치 | classic | modern |
|---|---|---|
| `READ TABLE ... INTO` | `READ TABLE lt_booking INTO ls_book ...` | `READ TABLE lt_booking INTO DATA(ls_book) ...` |
| `LOOP AT ... INTO` | `LOOP AT lt_booking INTO ls_book.` | `LOOP AT lt_booking INTO DATA(ls_book).` |
| 계산 결과 대입 | `DATA lv_total TYPE i.` 후 대입 | `DATA(lv_total) = ls_book-seats * 10000.` |
| 한 번 정해지면 바꾸지 않을 값 | `DATA lv_max TYPE i VALUE 100.` | `FINAL(lv_max) = 100.` |

`DATA( )`는 이후 다시 값을 넣을 수 있다. `FINAL( )`은 선언 이후 값을 바꾸지 않겠다는 표시다. 상수 `CONSTANTS`와 비슷하게 느껴질 수 있지만, `FINAL( )`은 실행 중 계산된 결과를 한 번만 받는 지역 값에 더 잘 어울린다.

```abap
" classic
DATA ls_book TYPE zbooking.
READ TABLE lt_booking INTO ls_book WITH KEY booking_id = '0001'.

" modern
READ TABLE lt_booking INTO DATA(ls_book) WITH KEY booking_id = '0001'.
```

위 modern 문장은 `READ TABLE`의 결과 행 타입을 ABAP이 알고 있기 때문에 `ls_book`의 타입을 자동으로 정한다. 학습자는 "타입 선언을 생략했다"가 아니라 "이미 문맥이 타입을 알고 있으므로 선언 위치를 값 생성 위치로 옮겼다"라고 이해해야 한다.

Loop에서도 같은 원리가 작동한다.

```abap
LOOP AT lt_booking INTO DATA(ls_row).
  WRITE: / ls_row-customer.
ENDLOOP.
```

`ls_row`는 `lt_booking`의 한 행 타입이다. 이 타입을 사람이 다시 적지 않아도 ABAP이 알 수 있다.

계산 결과도 받을 수 있다.

```abap
DATA(lv_total) = ls_book-seats * 10000.
FINAL(lv_max)  = 100.
```

`lv_total`은 오른쪽 계산 결과에 맞는 타입으로 유도된다. `lv_max`는 한 번 값이 정해진 뒤 다시 바꾸면 안 되는 값이다.

### 어떻게 확인하는가

확인은 디버거에서 하는 것이 가장 좋다.

1. `READ TABLE ... INTO DATA(ls_book)` 줄에 브레이크포인트를 둔다.
2. 실행 전에는 `ls_book`이 아직 값 목록에 의미 있게 나타나지 않는지 확인한다.
3. 한 줄 실행 후 `ls_book`이 생성되고 `zbooking` 한 행 구조를 가진다는 것을 본다.
4. `LOOP AT ... INTO DATA(ls_row)`에서는 루프에 들어갈 때마다 `ls_row` 값이 현재 행으로 바뀌는지 확인한다.
5. `FINAL(lv_max) = 100.` 아래에 `lv_max = 200.`을 일부러 적어 문법 오류가 나는지 확인한다.

여기서 중요한 관찰은 "inline 변수도 그냥 변수다"라는 점이다. 마법처럼 임시 값으로 사라지는 것이 아니다. 선언된 위치 이후 같은 처리 블록 안에서 사용할 수 있다. 다만 변수의 생명 범위를 넓게 쓰려고 inline을 남발하면 다시 읽기 어려워진다. 필요한 곳 가까이에 두되, 너무 많은 문장이 한 줄에 몰리지 않게 조절해야 한다.

### 실수와 주의

첫째, 타입을 ABAP이 확실히 알 수 없는 위치에서는 `DATA( )`를 쓸 수 없다. inline declaration은 "타입을 안 써도 된다"가 아니라 "문맥이 타입을 제공한다"이다.

둘째, 같은 처리 범위에서 같은 이름을 다시 inline 선언하면 안 된다. 이미 `DATA(ls_book)`이 만들어졌다면 아래에서 다시 `DATA(ls_book)`을 선언하는 것은 중복 선언이다. 값을 다시 넣고 싶다면 기존 변수에 대입해야 한다.

셋째, `FINAL( )`은 읽기 전용 의도를 표현한다. 한 번 정한 뒤 바꾸어야 하는 누적 변수에는 맞지 않는다. 예를 들어 합계를 더해 가는 `lv_total`을 `FINAL`로 선언하면 다음 누적 줄에서 막힌다.

넷째, CH18에서는 SELECT문의 modern inline 선언을 다루지 않는다. Open SQL의 host 변수 escape, 콤마 기반 SELECT list, SELECT문의 inline 선언은 CH19에서 문법 경계를 열고 다룬다. CH18-L01의 inline declaration은 `READ TABLE`, `LOOP`, 일반 대입 같은 ABAP 문장 안에서 익힌다.

### 체험형 학습 설계

**실습 장치: Inline 선언 위치 판정기**

데이터:
- `lt_booking`: 예매 3건. 필드: `booking_id`, `customer`, `seats`, `status`.
- 카드 4개: `READ TABLE ... INTO`, `LOOP AT ... INTO`, `DATA(lv_total) = ...`, `SELECT ... INTO ...`.

상태:
- `allowed`: 이번 CH18 범위에서 inline 선언 가능.
- `blocked`: 문법상 또는 R15 범위상 막힘.
- `readonly`: `FINAL( )`로 선언되어 재대입이 막힘.

버튼:
- `DATA()로 선언`: 선택한 카드의 받을 변수 자리에 `DATA( )`를 넣는다.
- `FINAL()로 선언`: 계산 결과 카드를 `FINAL( )`로 바꾼다.
- `한 줄 실행`: 디버거처럼 현재 줄 실행 후 변수 목록을 갱신한다.
- `다시 대입 시도`: `FINAL( )` 변수에 값을 다시 넣어 오류를 보여 준다.

피드백:
- `READ TABLE`과 `LOOP` 카드는 "행 타입을 문맥에서 알 수 있으므로 허용"이라고 보여 준다.
- 계산 카드에서는 "오른쪽 표현식의 결과 타입으로 변수 타입이 정해짐"이라고 보여 준다.
- SELECT 카드는 "문법 자체는 이후 장에서 다루는 modern SQL 경계이므로 CH18에서는 보류"라고 보여 준다.
- `FINAL` 재대입 시도에는 "이 변수는 한 번 받은 값의 의미를 보호하기 위해 읽기 전용으로 선언됨"이라고 설명한다.

### 정리

Inline declaration의 핵심은 짧게 쓰는 기술이 아니라 선언 위치를 의도 가까이 옮기는 기술이다. `DATA( )`는 값이 만들어지는 자리에서 변수를 만들고, `FINAL( )`은 이후 바꾸면 안 되는 값을 표시한다. 다만 타입을 문맥에서 알 수 있는 위치에서만 사용하고, SELECT문의 modern 선언은 CH19까지 기다린다.

## CH18-L02 · VALUE Constructor Expression

### 왜 필요한가

CH05와 CH06에서 구조체와 Internal Table을 배울 때는 값을 단계별로 채웠다. 구조체 필드를 하나씩 대입하고, 테이블에는 `APPEND`를 반복했다.

```abap
DATA ls_line TYPE ty_line.
DATA lt_gugu TYPE ty_line_tab.

ls_line-dan = 2.
ls_line-mul = 1.
ls_line-result = 2.
APPEND ls_line TO lt_gugu.
```

이 방식은 절차가 분명하다. 하지만 값의 모양을 읽기 어렵다. "2단 1행을 만들고 싶다"는 의도보다 "변수 만들기, 필드 채우기, append 하기"라는 작업 절차가 더 크게 보인다. 행이 5개, 10개로 늘어나면 실수도 늘어난다. `CLEAR ls_line`을 빼먹거나, 이전 행의 필드가 남거나, `APPEND` 전후 순서를 헷갈리기 쉽다.

`VALUE` constructor expression은 구조체와 테이블을 "값의 모양 그대로" 만든다. 절차를 나열하는 대신 결과가 어떤 값인지 표현한다.

### 무엇인가

`VALUE 타입( ... )`는 지정한 타입의 값을 만든다. 타입 자리에 `#`를 쓸 수도 있지만, 이때는 ABAP이 기대 타입을 정확히 알아야 한다.

먼저 구구단 한 줄 타입을 생각하자.

```abap
TYPES: BEGIN OF ty_line,
         dan    TYPE i,
         mul    TYPE i,
         result TYPE i,
       END OF ty_line.

TYPES ty_line_tab TYPE STANDARD TABLE OF ty_line WITH EMPTY KEY.
```

구조체 한 건은 이렇게 만든다.

```abap
DATA(ls_line) = VALUE ty_line(
  dan    = 2
  mul    = 3
  result = 6 ).
```

이 코드는 `ls_line-dan = 2`, `ls_line-mul = 3`, `ls_line-result = 6`을 따로 쓰는 것과 같은 결과를 만든다. 차이는 읽는 방향이다. `VALUE`는 "이 구조체 값은 dan 2, mul 3, result 6이다"라고 한 덩어리로 읽힌다.

Internal Table은 행을 괄호로 나열한다.

```abap
DATA(lt_gugu) = VALUE ty_line_tab(
  ( dan = 2 mul = 1 result = 2 )
  ( dan = 2 mul = 2 result = 4 )
  ( dan = 2 mul = 3 result = 6 ) ).
```

각 안쪽 괄호가 테이블 한 행이다. 세 줄을 읽으면 테이블에 세 행이 들어간다는 것이 눈으로 보인다.

기존 테이블을 유지하면서 행을 추가하려면 `BASE`가 필요하다.

```abap
lt_gugu = VALUE #(
  BASE lt_gugu
  ( dan = 3 mul = 1 result = 3 ) ).
```

여기서 `#`는 왼쪽 `lt_gugu`가 이미 타입을 알려 주기 때문에 가능하다. `BASE lt_gugu`는 기존 행을 먼저 가져오고, 뒤의 새 행을 이어 붙이라는 뜻이다. `BASE` 없이 `lt_gugu = VALUE #( ... )`를 쓰면 기존 내용은 유지되는 것이 아니라 새 값으로 대체된다.

CH18-L02에서 중요한 보강은 `FOR`를 이용한 테이블 생성이다. 구구단 2단 전체를 손으로 9행 쓰지 않고 반복으로 만들 수 있다.

```abap
DATA(lt_gugu_2) = VALUE ty_line_tab(
  FOR i = 1 WHILE i <= 9
  ( dan = 2 mul = i result = 2 * i ) ).
```

이 `FOR`는 Internal Table constructor 안에서 행을 만드는 반복이다. `i`는 이 표현식 안에서만 의미가 있다. 아래처럼 기존 테이블을 읽어서 새 테이블을 만들 수도 있다.

```abap
DATA(lt_double) = VALUE ty_line_tab(
  FOR line IN lt_gugu_2
  ( dan    = line-dan
    mul    = line-mul
    result = line-result * 2 ) ).
```

이 코드는 `lt_gugu_2`의 각 행을 읽어 `result`만 두 배로 만든 새 테이블을 생성한다. 기존 테이블을 직접 바꾸는 것이 아니라 새 값을 만드는 표현식이라는 점을 분명히 해야 한다.

### 어떻게 확인하는가

확인은 세 가지로 나누면 좋다.

첫째, 구조체 확인이다. `DATA(ls_line) = VALUE ty_line( ... )` 다음 줄에서 디버거를 열고 `ls_line`의 세 필드를 확인한다. `dan = 2`, `mul = 3`, `result = 6`이면 구조체 constructor가 의도대로 작동한 것이다.

둘째, 테이블 행 수 확인이다. `lt_gugu`를 만든 뒤 행 수가 3인지 본다. `BASE`로 한 행을 추가한 뒤에는 4행이 되어야 한다. 만약 여전히 1행이라면 `BASE` 없이 새 테이블로 덮어쓴 것이다.

셋째, `FOR` 확인이다. `lt_gugu_2`의 행 수가 9인지, 첫 행은 `2 x 1 = 2`, 마지막 행은 `2 x 9 = 18`인지 확인한다. `lt_double`은 `result` 값이 각각 두 배인지 보면 된다.

### 실수와 주의

첫째, `#`는 만능이 아니다. 왼쪽 타입이나 인수 위치가 기대 타입을 명확히 제공할 때만 사용할 수 있다. 처음 학습할 때는 `VALUE ty_line( ... )`, `VALUE ty_line_tab( ... )`처럼 타입을 명시하고, 익숙해진 뒤 `#`를 쓰는 편이 안전하다.

둘째, `BASE`를 빠뜨리면 기존 테이블을 유지하지 않는다. `VALUE`는 "새 값을 만든다"는 성격이 강하다. 누적 추가를 원하면 `BASE 기존테이블`을 직접 써야 한다.

셋째, `FOR` 변수를 표현식 밖에서 쓰려고 하면 안 된다. `FOR i = 1 WHILE i <= 9`의 `i`는 그 `VALUE` 표현식 내부의 반복 변수다. 아래 줄에서 `WRITE i.` 같은 방식으로 사용할 대상이 아니다.

넷째, 중복 key가 금지된 sorted table이나 hashed table에 `VALUE`로 중복 행을 넣으면 런타임 오류가 날 수 있다. CH18 예제는 `STANDARD TABLE ... WITH EMPTY KEY`로 시작하지만, 실무 테이블 타입에서는 key 규칙을 반드시 같이 봐야 한다.

다섯째, `VALUE #( FOR ... )`가 읽기 어려울 정도로 길어지면 다시 `LOOP`가 낫다. Modern ABAP은 한 줄로 압축하는 대회가 아니다. 조건이 많고 중간 검증이 필요하면 절차형 코드가 더 교육적이고 안전하다.

### 체험형 학습 설계

**실습 장치: VALUE Builder**

데이터:
- 구조체 타입 `ty_line`: `dan`, `mul`, `result`.
- 시작 테이블 `lt_gugu`: 비어 있음 또는 2단 3행.
- key 모드: `EMPTY KEY`, `UNIQUE KEY dan mul` 두 가지.

버튼:
- `구조체 만들기`: 입력한 `dan`, `mul`로 `VALUE ty_line( ... )`을 생성한다.
- `테이블 만들기`: 현재 행 목록을 `VALUE ty_line_tab( ... )` 코드로 바꾼다.
- `BASE로 추가`: 기존 테이블을 유지하고 새 행을 추가한다.
- `BASE 없이 대입`: 기존 테이블이 사라지는 것을 의도적으로 보여 준다.
- `FOR로 2단 생성`: `FOR i = 1 WHILE i <= 9` 결과를 9행 테이블로 만든다.
- `중복 key 시도`: unique key 모드에서 같은 `dan`, `mul` 행을 넣어 오류 피드백을 보여 준다.

상태:
- `beforeTable`: 실행 전 테이블.
- `expression`: 생성된 `VALUE` 코드.
- `afterTable`: 실행 후 테이블.
- `warning`: 타입 추론 불가, BASE 누락, 중복 key 같은 메시지.

피드백:
- `BASE` 버튼을 누르면 기존 행이 연한 색으로 유지되고 새 행이 강조된다.
- `BASE 없이 대입`을 누르면 이전 행이 사라지는 애니메이션과 함께 "VALUE는 새 값을 만든다"는 메시지가 나온다.
- `FOR로 2단 생성`은 반복 변수 `i`가 1부터 9까지 바뀌는 과정을 작은 타임라인으로 보여 준다.
- 중복 key 오류는 "테이블 타입의 key 규칙은 VALUE에서도 그대로 적용됨"이라고 설명한다.

### 정리

`VALUE`는 구조체와 Internal Table을 결과 모양 그대로 만들게 해 준다. 한 건은 `VALUE ty_line( field = value )`, 여러 건은 `VALUE ty_line_tab( ( ... ) ( ... ) )`로 읽는다. 기존 테이블을 유지하려면 `BASE`를 쓰고, 반복 생성이 필요하면 CH18 범위에서 `FOR`를 사용할 수 있다. 단, `#`의 타입 추론과 `BASE` 누락은 초보자가 가장 자주 틀리는 지점이다.

## CH18-L03 · CORRESPONDING과 구조 매핑

### 왜 필요한가

업무 프로그램에서는 같은 데이터를 다른 모양으로 옮기는 일이 많다. DB 테이블 행을 화면 표시용 구조체로 옮기거나, 입력 구조체를 저장 구조체로 바꾸거나, 내부 처리용 구조체를 ALV 출력용 구조체로 바꾼다.

classic 방식에서는 같은 이름 필드를 자동으로 옮기기 위해 `MOVE-CORRESPONDING`을 썼다.

```abap
MOVE-CORRESPONDING ls_source TO ls_target.
```

이 문장은 오래된 코드에서 매우 자주 보인다. 하지만 modern ABAP에서는 값을 만드는 표현식 흐름 안에서 같은 일을 해야 하는 경우가 많다. 예를 들어 "원본을 받아서 표시용 구조체 값을 만들고, 그 결과를 inline 변수에 담는다"는 흐름에서는 `CORRESPONDING` constructor expression이 더 잘 맞는다.

### 무엇인가

`CORRESPONDING 타입( 원본 )`은 원본 구조체 또는 원본 Internal Table에서 대상 타입과 이름이 같은 컴포넌트를 찾아 값을 옮긴다.

예를 들어 저장용 예매 구조가 있고, 화면 표시용 구조가 있다고 하자.

```abap
TYPES: BEGIN OF ty_booking_ui,
         booking_id     TYPE zbooking-booking_id,
         customer       TYPE zbooking-customer,
         seats          TYPE zbooking-seats,
         display_status TYPE zbooking-status,
         audit_user     TYPE syuname,
       END OF ty_booking_ui.
```

원본 `ls_booking`에 `booking_id`, `customer`, `seats`, `status`가 있다면 같은 이름 필드는 자동으로 옮겨진다. 이름이 다른 `display_status`는 자동으로 알 수 없으므로 `MAPPING`으로 지정한다. 옮기지 않을 필드는 `EXCEPT`로 제외한다.

```abap
DATA(ls_ui) = CORRESPONDING ty_booking_ui(
  ls_booking
  MAPPING display_status = status
  EXCEPT  audit_user ).
```

읽는 방법은 다음과 같다.

- 대상 타입은 `ty_booking_ui`다.
- 원본은 `ls_booking`이다.
- 같은 이름인 `booking_id`, `customer`, `seats`는 자동으로 옮긴다.
- 대상 `display_status`에는 원본 `status` 값을 넣는다.
- 대상 `audit_user`는 옮기지 않고 초기값으로 둔다.

Internal Table도 같은 생각으로 읽는다.

```abap
TYPES ty_booking_ui_tab TYPE STANDARD TABLE OF ty_booking_ui WITH EMPTY KEY.

DATA(lt_ui) = CORRESPONDING ty_booking_ui_tab(
  lt_booking
  MAPPING display_status = status
  EXCEPT  audit_user ).
```

테이블의 각 행에 같은 매핑 규칙이 적용되어 새 테이블이 만들어진다.

### 어떻게 확인하는가

디버거에서 다음 네 가지를 확인한다.

1. `booking_id`, `customer`, `seats`처럼 이름이 같은 필드가 값 그대로 복사되는지 본다.
2. `display_status`가 원본 `status` 값을 받는지 본다.
3. `audit_user`가 초기값으로 남는지 본다.
4. 원본에는 있지만 대상 타입에는 없는 필드가 조용히 버려지는지 확인한다.

이 확인이 중요한 이유는 `CORRESPONDING`이 "모든 것을 복사"하는 도구가 아니기 때문이다. 대상 타입 기준으로 복사 가능한 필드만 결과에 들어간다. 그래서 결과 구조를 먼저 보고, 어떤 필드가 자동 매칭되고 어떤 필드가 빠지는지 판단해야 한다.

### 실수와 주의

첫째, `MAPPING`의 방향을 헷갈리면 안 된다. 문법은 `대상필드 = 원본필드`다. 위 예제의 `display_status = status`는 대상 `display_status`에 원본 `status`를 넣는다는 뜻이다.

둘째, `EXCEPT`는 대상 필드 기준으로 생각해야 한다. `audit_user`를 제외한다는 것은 결과 구조체의 `audit_user`를 채우지 않는다는 뜻이다.

셋째, 같은 이름이라는 이유만으로 의미가 같은 것은 아니다. 예를 들어 어떤 구조의 `status`는 예매 상태이고, 다른 구조의 `status`는 처리 상태일 수 있다. 이름은 같지만 의미가 다르면 자동 복사하면 안 된다. 이 경우에는 필드 이름을 분리하거나 명시적 대입으로 의도를 드러내야 한다.

넷째, `CORRESPONDING`은 변환 로직을 숨기기 쉽다. 단순 이름 매칭에는 좋지만, 값 변환이나 조건부 매핑이 많아지면 `LOOP`와 명시 대입이 더 읽기 쉽다. CH18에서는 "같은 이름 또는 간단한 이름 변경" 범위에서만 사용한다.

### 체험형 학습 설계

**실습 장치: Field Mapping Board**

데이터:
- 왼쪽 원본 구조: `booking_id`, `customer`, `seats`, `status`, `created_by`.
- 오른쪽 대상 구조: `booking_id`, `customer`, `seats`, `display_status`, `audit_user`.

화면:
- 같은 이름 필드는 자동 연결선이 그려진다.
- 이름이 다른 필드는 회색 빈 슬롯으로 남는다.
- 사용자가 `status` 카드를 `display_status` 슬롯으로 드래그하면 `MAPPING display_status = status` 코드가 생성된다.
- 사용자가 `audit_user` 슬롯을 제외하면 `EXCEPT audit_user`가 붙는다.

버튼:
- `자동 매칭`: 같은 이름 필드만 연결한다.
- `MAPPING 추가`: 선택한 원본 필드를 대상 필드에 연결한다.
- `EXCEPT 지정`: 대상 필드를 결과에서 제외한다.
- `결과 보기`: 생성된 `CORRESPONDING` 코드와 결과 구조체 값을 나란히 보여 준다.

피드백:
- 방향을 반대로 연결하려 하면 "MAPPING은 대상 = 원본 순서"라고 즉시 알려 준다.
- 의미가 의심되는 같은 이름 필드에는 "이름이 같아도 업무 의미 확인 필요"라는 노란 경고를 붙인다.
- `EXCEPT`를 원본에만 있는 필드에 적용하려 하면 "EXCEPT는 대상 필드 기준"이라고 설명한다.

### 정리

`CORRESPONDING`은 같은 이름의 필드를 기준으로 구조체나 테이블을 새 타입으로 옮기는 constructor expression이다. `MAPPING`은 이름이 다른 필드를 연결하고, `EXCEPT`는 대상 필드를 결과에서 제외한다. 이 문법은 필드 이름과 업무 의미가 잘 정돈된 코드에서 강력하지만, 이름은 같고 의미가 다른 구조에는 위험할 수 있다.

## CH18-L04 · Table Expression

### 왜 필요한가

CH06에서 Internal Table을 배울 때 한 행을 찾는 기본 도구는 `READ TABLE`이었다.

```abap
READ TABLE lt_booking INTO ls_book WITH KEY booking_id = lv_id.
IF sy-subrc = 0.
  WRITE: / ls_book-customer.
ENDIF.
```

이 방식은 classic ABAP에서 안전하고 명확하다. 조회가 성공했는지 `sy-subrc`로 확인하고, 성공했을 때만 값을 쓴다. 하지만 한 행을 읽어 바로 값처럼 사용하고 싶은 곳에서는 문장이 길어진다.

Table expression은 Internal Table의 한 행을 배열처럼 꺼내는 표현식이다.

```abap
DATA(ls_book) = lt_booking[ booking_id = lv_id ].
```

짧고 읽기 쉽다. 그러나 중요한 차이가 있다. `READ TABLE`은 실패하면 `sy-subrc`를 세팅한다. Table expression은 일반 값 표현식이므로 실패 모델이 다르다. 없는 행을 직접 읽으면 예외가 발생한다. 이 차이를 모르면 modern 문법이 더 위험해진다.

### 무엇인가

Table expression의 기본 형태는 `itab[ 조건 ]`이다.

```abap
DATA(ls_book) = lt_booking[ booking_id = '0001' ].
```

인덱스로도 읽을 수 있다.

```abap
DATA(ls_first) = lt_booking[ 1 ].
```

그러나 production 코드에서는 "있다고 확신할 수 있는가"를 먼저 물어야 한다. 확신할 수 없다면 `line_exists`로 확인한다.

```abap
IF line_exists( lt_booking[ booking_id = lv_id ] ).
  DATA(ls_book) = lt_booking[ booking_id = lv_id ].
  WRITE: / ls_book-customer.
ENDIF.
```

행 위치가 필요하면 `line_index`를 쓴다.

```abap
DATA(lv_idx) = line_index( lt_booking[ booking_id = lv_id ] ).

IF lv_idx = 0.
  WRITE: / '해당 예매를 찾지 못했습니다.'.
ENDIF.
```

공식 문서 기준으로 `line_index`는 찾지 못하면 `0`을 돌려준다. hashed key처럼 순서 인덱스를 말할 수 없는 접근에서는 `-1`이 될 수 있다. 입문 단계에서는 standard table의 기본 인덱스 확인부터 익히면 충분하다.

### 어떻게 확인하는가

같은 데이터로 세 가지 경우를 비교한다.

데이터:

| booking_id | customer | seats |
|---|---|---:|
| B001 | 정훈영 | 2 |
| B002 | 김하나 | 1 |
| B003 | 이도윤 | 4 |

첫째, 존재하는 키를 읽는다.

```abap
DATA(ls_book) = lt_booking[ booking_id = 'B001' ].
```

디버거에서 `ls_book-customer = '정훈영'`인지 확인한다.

둘째, 없는 키를 직접 읽어 본다.

```abap
DATA(ls_missing) = lt_booking[ booking_id = 'B999' ].
```

이 코드는 `READ TABLE`처럼 `sy-subrc`만 바뀌고 지나가지 않는다. 없는 행을 표현식으로 읽으려 했기 때문에 런타임 예외가 발생할 수 있다. CH20에서 예외 처리 문법을 본격적으로 배우기 전까지는, CH18에서는 이 위험을 `line_exists`로 피한다.

셋째, 안전하게 확인하고 읽는다.

```abap
IF line_exists( lt_booking[ booking_id = 'B999' ] ).
  DATA(ls_safe) = lt_booking[ booking_id = 'B999' ].
ELSE.
  WRITE: / '없음'.
ENDIF.
```

여기서는 없는 행이어도 프로그램이 멈추지 않고 `없음`을 출력한다.

### 실수와 주의

첫째, table expression은 `sy-subrc`를 확인하는 문법이 아니다. `lt_booking[ ... ]` 뒤에 `IF sy-subrc = 0.`을 붙이는 습관은 잘못된 신호를 준다. 성공 여부는 `line_exists`, 위치는 `line_index`로 확인한다.

둘째, 같은 table expression을 반복해서 쓰면 읽기도 나쁘고 비용도 반복된다.

```abap
IF line_exists( lt_booking[ booking_id = lv_id ] ).
  DATA(ls_book) = lt_booking[ booking_id = lv_id ].
ENDIF.
```

입문 단계에서는 이렇게 한 번 확인하고 한 번 읽는 구조가 안전하다. 나중에는 field symbol, reference, 예외 처리 등 더 세밀한 선택지가 있지만 CH18에서는 다루지 않는다.

셋째, 여러 행을 처리하려고 table expression을 남발하면 안 된다. Table expression은 한 행 조회 도구다. 여러 행을 순회하거나 조건에 맞는 행 전체를 처리하려면 여전히 `LOOP AT`이 자연스럽다.

넷째, 인덱스 접근 `lt_booking[ 1 ]`은 정렬과 테이블 종류에 민감하다. "첫 번째 행"이 업무적으로 의미 있는 경우에만 써야 한다. 예매번호로 찾을 수 있다면 key 조건이 더 명확하다.

### 체험형 학습 설계

**실습 장치: READ TABLE vs Table Expression 비교기**

데이터:
- `lt_booking` 3행.
- 검색 입력: `B001`, `B002`, `B999`.

버튼:
- `READ TABLE 실행`: classic 코드와 `sy-subrc` 값을 보여 준다.
- `Table Expression 실행`: 존재하는 행이면 구조체 값을 보여 주고, 없는 행이면 예외 상태를 빨간색으로 표시한다.
- `line_exists로 보호`: 먼저 존재 여부를 확인하고 안전하게 분기한다.
- `line_index 확인`: 찾은 위치 또는 `0`을 출력한다.

상태:
- `selectedId`: 현재 검색 예매번호.
- `found`: 행 존재 여부.
- `sySubrc`: classic READ TABLE 실행 시 값.
- `exceptionState`: table expression 직접 실행 시 예외 여부.
- `index`: `line_index` 결과.

피드백:
- `READ TABLE`에서 없는 값은 "`sy-subrc = 4`, 프로그램은 계속 진행"으로 표시한다.
- table expression에서 없는 값은 "없는 행을 값처럼 읽으려 해서 예외 발생"으로 표시한다.
- `line_exists` 경로는 "CH18에서 권장하는 보호 방식"이라는 초록 피드백을 준다.
- 사용자가 `sy-subrc` 확인을 table expression 뒤에 붙이면 "이 문법의 성공 여부는 `sy-subrc`로 판단하지 않음"이라고 경고한다.

### 정리

Table expression은 Internal Table 한 행을 값처럼 읽는 modern syntax다. 존재가 확실할 때는 매우 간결하지만, 없는 행을 직접 읽으면 `READ TABLE`과 다르게 예외가 발생할 수 있다. CH18에서는 `line_exists`와 `line_index`를 함께 익혀 "짧지만 안전한 조회"를 목표로 한다.

## CH18-L05 · String Template과 내장 함수

### 왜 필요한가

문자열은 사용자에게 보이는 마지막 결과인 경우가 많다. 메시지, ALV 표시 문구, 로그, 상태 설명은 모두 사람이 읽는다. classic ABAP에서는 `CONCATENATE`로 문자열을 조립했다.

```abap
CONCATENATE lv_name '님 환영합니다' INTO lv_msg.
```

간단한 문장은 괜찮다. 하지만 변수와 문장이 여러 번 섞이면 읽기 어렵다. 실제 출력 문장을 머릿속에서 다시 조립해야 한다.

String template은 출력될 문장 모양 그대로 코드를 쓰게 해 준다.

```abap
DATA(lv_msg) = |{ lv_name }님 환영합니다|.
```

읽는 사람이 최종 문장을 더 쉽게 상상할 수 있다.

### 무엇인가

String template은 파이프 문자 `|`로 감싼 문자열이다. 값이 들어갈 자리는 `{ 표현식 }`으로 표시한다.

```abap
DATA(lv_msg) = |{ lv_name }님 환영합니다|.
```

중괄호 안에는 변수뿐 아니라 계산식, built-in function, table expression 같은 표현식도 들어갈 수 있다. 다만 CH18에서는 입문자가 바로 읽을 수 있는 단순 표현식 위주로 사용한다.

구구단 출력은 string template의 장점을 잘 보여 준다.

```abap
DATA(lv_eq) = |{ ls_line-dan } x { ls_line-mul } = { ls_line-result }|.
```

이 코드는 출력 문장과 거의 같은 모양이다. `CONCATENATE`로 같은 결과를 만들려면 숫자를 문자로 바꾸고, 공백을 조절하고, 조각 순서를 확인해야 한다.

날짜와 숫자는 사용자 환경에 맞는 형식으로 출력할 수 있다.

```abap
DATA(lv_line) =
  |오늘은 { sy-datum DATE = USER }, 합계 { lv_total NUMBER = USER }원입니다.|.
```

공식 문서 기준으로 날짜와 숫자는 기본 출력만 믿으면 사용자가 기대하는 구분자나 형식과 다를 수 있다. 그래서 화면에 보이는 문자열에서는 `DATE = USER`, `NUMBER = USER` 같은 형식 옵션을 의식적으로 쓰는 습관이 좋다.

문자열 내장 함수도 표현식처럼 사용할 수 있다.

```abap
DATA(lv_upper) = to_upper( lv_name ).
DATA(lv_part)  = substring( val = lv_text off = 0 len = 3 ).
DATA(lv_len)   = strlen( lv_text ).
```

`to_upper`는 대문자로 바꾸고, `substring`은 일부 문자열을 잘라 오며, `strlen`은 길이를 구한다. CH04에서 문자열 기본 조작을 배웠다면, CH18에서는 이 함수들을 modern expression 흐름 안에서 사용하는 법을 익힌다.

### 어떻게 확인하는가

확인은 출력 문자열을 직접 비교한다.

예제 값:

```abap
DATA(lv_name)  = '정훈영'.
DATA(lv_total) = 120000.
```

메시지:

```abap
DATA(lv_msg) = |{ lv_name }님 환영합니다|.
WRITE / lv_msg.
```

출력이 `정훈영님 환영합니다`인지 확인한다.

구구단:

```abap
DATA(ls_line) = VALUE ty_line( dan = 2 mul = 3 result = 6 ).
DATA(lv_eq)  = |{ ls_line-dan } x { ls_line-mul } = { ls_line-result }|.
WRITE / lv_eq.
```

출력이 `2 x 3 = 6`인지 확인한다.

날짜와 숫자:

```abap
DATA(lv_line) =
  |오늘은 { sy-datum DATE = USER }, 합계 { lv_total NUMBER = USER }원입니다.|.
WRITE / lv_line.
```

사용자 설정에 맞게 날짜와 숫자 형식이 바뀌는지 본다. 시스템과 사용자 설정에 따라 보이는 결과가 다를 수 있다는 점도 함께 확인한다.

### 실수와 주의

첫째, `{`와 `}` 안의 공백을 습관적으로 지킨다. 공식 문서는 embedded expression에서 중괄호 안쪽 공백을 문법 요소로 다룬다. `|{ lv_name }|`처럼 쓰는 형태를 기본으로 삼는다.

둘째, string template은 사용자에게 보여 줄 문장을 읽기 좋게 만들지만, 모든 텍스트 관리를 대체하지 않는다. 번역이 필요한 고정 문구는 Text Symbol이나 메시지 클래스를 계속 고려해야 한다. CH18에서는 문법 사용법에 집중하고, 다국어 설계 전체는 별도 주제다.

셋째, `substring`은 범위를 벗어나면 오류가 날 수 있다. `off = 0 len = 3`은 앞에서 세 글자를 가져오라는 뜻이지만, 입력 문자열 길이가 충분한지 확인해야 한다.

넷째, 숫자와 날짜를 단순히 `{ lv_total }`, `{ sy-datum }`으로 넣으면 사람이 기대하는 표시와 다를 수 있다. 화면 출력용이면 `DATE = USER`, `NUMBER = USER` 같은 옵션을 검토한다.

다섯째, template 안에 너무 복잡한 계산을 넣으면 문장이 다시 읽기 어려워진다. 복잡한 값은 먼저 `DATA( )`로 계산해 이름을 붙이고, template에는 그 이름을 넣는 것이 좋다.

### 체험형 학습 설계

**실습 장치: Message Composer**

데이터 입력:
- 이름: `정훈영`
- 날짜: 현재 `sy-datum`
- 합계: `120000`
- 구구단 행: `dan = 2`, `mul = 3`, `result = 6`

버튼:
- `CONCATENATE로 보기`: classic 방식으로 조립된 코드와 결과를 보여 준다.
- `Template으로 보기`: string template 코드와 결과를 보여 준다.
- `사용자 형식 켜기`: `DATE = USER`, `NUMBER = USER` 옵션을 추가한다.
- `substring 실험`: 입력 문자열과 `off`, `len`을 바꿔 결과를 본다.
- `범위 오류 시도`: 문자열 길이보다 긴 범위를 요청해 오류 피드백을 본다.

상태:
- `codeMode`: classic 또는 template.
- `formatMode`: raw 또는 user format.
- `resultText`: 최종 출력 문자열.
- `rangeWarning`: substring 범위 경고.

피드백:
- template 모드에서는 최종 문장과 코드가 거의 같은 형태로 강조된다.
- 사용자 형식을 켜면 날짜/숫자 부분만 색이 바뀌고 "표시 형식은 사용자 설정의 영향을 받음"이라고 설명한다.
- substring 범위를 벗어나면 "문자열 함수도 안전한 입력 범위가 필요함"이라고 보여 준다.

### 정리

String template은 사람이 읽을 문장과 코드의 모양을 가깝게 만든다. `{ 표현식 }`으로 값을 넣고, 날짜와 숫자는 형식 옵션을 사용한다. `to_upper`, `substring`, `strlen` 같은 함수는 표현식 흐름에 잘 맞지만, 범위와 가독성은 계속 확인해야 한다.

## CH18-L06 · Legacy 코드의 Modern ABAP 리팩터링

### 왜 필요한가

Modern syntax를 배웠다고 해서 기존 코드를 무조건 새 문법으로 바꾸면 안 된다. 리팩터링의 목표는 짧아지는 것이 아니라 의도가 더 잘 보이고, 실수 가능성이 줄며, 실행 결과가 유지되는 것이다.

CH18-L06은 지금까지 배운 조각을 실제 legacy 코드에 적용하는 중간 점검 레슨이다. 여기서는 새 기능을 더 배우기보다, 같은 결과를 유지하면서 어떤 줄을 바꾸고 어떤 줄은 그대로 둘지 판단한다.

### 무엇인가

대표적인 classic 코드를 보자.

```abap
DATA ls_line TYPE ty_line.
DATA lt_gugu TYPE ty_line_tab.
DATA lv_total TYPE i.

ls_line-dan = 2.
ls_line-mul = 1.
ls_line-result = 2.
APPEND ls_line TO lt_gugu.

lv_total = lv_total + ls_line-result.
```

이 코드는 동작한다. 그러나 한 행의 값을 만들기 위해 여러 줄을 쓰고, 누적 계산도 긴 형태로 반복된다. CH18에서는 다음처럼 바꿀 수 있다.

```abap
DATA(lt_gugu) = VALUE ty_line_tab(
  ( dan = 2 mul = 1 result = 2 ) ).

DATA(lv_total) = 0.
lv_total += lt_gugu[ 1 ]-result.
```

여기서 리팩터링 판단은 세 가지다.

첫째, 구조체를 임시로 채우고 바로 append하는 패턴은 `VALUE`로 줄일 수 있다. 결과 테이블의 모양이 더 직접적으로 보인다.

둘째, 누적 계산은 `+=`로 바꿀 수 있다. `lv_total += x`는 `lv_total = lv_total + x`와 같은 의도를 가진다. 왼쪽 변수는 이미 존재해야 하고, 숫자 계산에 적합해야 한다.

셋째, table expression을 쓸 때는 안전성을 판단해야 한다. 위 예제는 바로 앞에서 한 행짜리 테이블을 만들었기 때문에 `lt_gugu[ 1 ]`이 존재한다는 사실이 명확하다. 실제 업무 테이블처럼 행 존재가 불확실하면 `line_exists`로 보호해야 한다.

### 어떻게 확인하는가

리팩터링 검증은 "컴파일된다"에서 끝나면 안 된다. 최소한 다음 순서로 확인한다.

1. classic 코드 실행 결과를 먼저 기록한다.
2. modern 코드로 바꾼다.
3. 같은 입력으로 실행한다.
4. 출력, 내부 테이블 행 수, 합계 값이 같은지 비교한다.
5. modern SQL, OO, 예외 처리처럼 아직 배우지 않은 경계를 우연히 끌어오지 않았는지 확인한다.

예를 들어 위 코드에서는 다음을 비교한다.

| 항목 | classic 기대 | modern 기대 |
|---|---:|---:|
| `lt_gugu` 행 수 | 1 | 1 |
| 첫 행 `dan` | 2 | 2 |
| 첫 행 `mul` | 1 | 1 |
| 첫 행 `result` | 2 | 2 |
| `lv_total` | 2 | 2 |

### 실수와 주의

첫째, `VALUE`로 바꾸면서 `BASE`를 빼먹으면 기존 행을 잃는다. 기존 테이블에 새 행을 추가하는 코드라면 `BASE`가 필요한지 먼저 확인한다.

둘째, `+=`는 왼쪽 변수를 새로 선언하지 않는다. 다음 코드는 잘못된 방향이다.

```abap
" 잘못된 사고: 누적 변수는 먼저 존재해야 한다.
" DATA(lv_total) += 10.
```

올바른 흐름은 변수를 만든 뒤 누적하는 것이다.

```abap
DATA(lv_total) = 0.
lv_total += 10.
```

셋째, 코드가 짧아졌다고 항상 더 좋은 것은 아니다. 다음처럼 한 줄에 너무 많은 개념이 들어가면 입문자는 의도를 놓친다.

```abap
DATA(lv_total) = VALUE ty_line_tab( FOR i = 1 WHILE i <= 9 ( dan = 2 mul = i result = 2 * i ) )[ 9 ]-result.
```

이런 코드는 문법적으로 가능해 보일 수 있어도 교육용으로 나쁘다. `VALUE`, `FOR`, table expression, component access가 한 줄에 몰려 있다. CH18의 목표는 적절한 modern syntax이지 과밀한 expression이 아니다.

넷째, classic SQL 문장을 CH18에서 modern SQL로 바꾸지 않는다. SQL 경계는 CH19에서 따로 열린다. CH18-L06의 리팩터링 범위는 변수 선언, 값 생성, 테이블 한 행 접근, 문자열, 누적 계산이다.

### 체험형 학습 설계

기존 embed `CH18-L06-S01`은 classic 코드와 modern 코드를 나란히 보여 주는 diff-mapper다. 이 위젯은 CH18-L06의 중심 학습 장치로 유지하되, 본문은 사용자가 무엇을 봐야 하는지 정확히 안내해야 한다.

**위젯 사용 시나리오**

1. 왼쪽 classic 줄에 마우스를 올린다.
2. 오른쪽 modern 줄이 함께 강조된다.
3. 아래 설명 패널이 "이 줄은 어떤 의도를 어떤 modern syntax로 바꿨는가"를 보여 준다.
4. 사용자는 "값 생성", "누적 계산", "그대로 둘 줄"을 구분한다.

추가하면 좋은 학습 상태:
- `unchanged`: 바꾸지 않은 줄. 아직 배우지 않은 문법이나 그대로 두는 것이 더 명확한 줄이다.
- `modernized`: CH18 범위에서 바꾼 줄.
- `risky`: 짧아졌지만 안전성 확인이 필요한 줄.

추가 버튼 설계:
- `변경 줄만 보기`: 실제로 바뀐 줄만 필터링한다.
- `동작 결과 비교`: classic과 modern 실행 결과 테이블을 나란히 보여 준다.
- `R15 경계 검사`: modern SQL, OO, 예외 처리 문법이 섞였는지 표시한다.
- `되돌리기`: 너무 과한 modern 표현을 classic 또는 더 단순한 modern 코드로 되돌린다.

피드백:
- `DATA( )`로 바뀐 줄은 "선언이 사용 위치로 이동"이라고 설명한다.
- `VALUE`로 바뀐 줄은 "필드 대입+APPEND 절차를 결과 테이블 모양으로 표현"이라고 설명한다.
- `+=`로 바뀐 줄은 "누적 의도는 같고 왼쪽 변수는 기존 변수"라고 설명한다.
- 바꾸지 않은 classic SQL 줄이 있다면 "SQL modern화는 CH19 범위"라고 명시한다.

### 정리

리팩터링은 문법 교체가 아니라 의미 보존 작업이다. CH18-L06에서는 `DATA( )`, `VALUE`, table expression, string template, `+=`를 이용해 legacy 코드를 더 읽기 좋게 만들되, 실행 결과를 반드시 비교한다. 짧아졌지만 안전성이 떨어지거나 학습 경계를 넘으면 좋은 리팩터링이 아니다.

## CH18-L07 · 실습: 콘서트앱 모던 리팩터

### 왜 필요한가

문법은 작은 예제에서 배우지만, 실무 감각은 관통 예제에서 확인해야 한다. CH18-L07은 CH10 이후 이어 온 콘서트 예매 흐름에 modern syntax를 적용한다. 목표는 콘서트 앱을 새 기술로 다시 만드는 것이 아니라, 이미 동작하는 classic 코드의 일부를 CH18 범위 안에서 더 읽기 좋게 바꾸는 것이다.

이 레슨에서 지켜야 할 경계는 분명하다.

- 예매 데이터 조회 SQL 자체는 classic 형태로 둔다.
- 객체지향 구조로 재설계하지 않는다.
- 예외 처리 문법을 새로 가르치지 않는다.
- 예약 로직의 업무 규칙은 바꾸지 않는다.
- 바꾸는 대상은 inline declaration, `VALUE`, table expression 보호, string template, 누적 계산이다.

### 무엇인가

먼저 좌석 합계를 구하는 classic 코드를 보자.

```abap
DATA: ls_book TYPE zbooking,
      lv_sum  TYPE i.

LOOP AT lt_book INTO ls_book.
  lv_sum = lv_sum + ls_book-seats.
ENDLOOP.
```

CH18 문법으로는 다음처럼 바꿀 수 있다.

```abap
DATA(lv_total) = 0.

LOOP AT lt_book INTO DATA(ls_book).
  lv_total += ls_book-seats.
ENDLOOP.
```

바뀐 것은 세 가지다.

- `ls_book` 선언이 루프의 `INTO` 위치로 이동했다.
- 합계 변수는 실제로 필요한 위치에서 `DATA(lv_total) = 0`으로 시작한다.
- 누적 계산은 `+=`로 의도를 짧게 표현한다.

새 예매 행을 만드는 코드는 `VALUE`가 잘 어울린다.

```abap
DATA(ls_new) = VALUE zbooking(
  concert_id = 'C001'
  perf_no    = '01'
  customer   = '정훈영'
  seats      = 2
  status     = 'N' ).
```

이 코드는 "새 예매 구조체는 어떤 필드를 가진다"를 결과 모양으로 보여 준다. 여러 줄 필드 대입보다 신규 행의 의미가 더 빨리 보인다.

기존 예매를 찾을 때는 table expression을 사용할 수 있지만, 업무 입력값은 항상 틀릴 수 있다. 따라서 보호 없이 바로 읽지 않는다.

```abap
IF line_exists( lt_book[ booking_id = lv_id ] ).
  DATA(ls_hit) = lt_book[ booking_id = lv_id ].
  DATA(lv_msg) = |예매자 { ls_hit-customer }님의 좌석 수는 { ls_hit-seats }석입니다.|.
  WRITE / lv_msg.
ELSE.
  WRITE / |예매번호 { lv_id }를 찾지 못했습니다.|.
ENDIF.
```

여기에는 CH18의 여러 요소가 함께 들어 있다.

- `line_exists`로 table expression 실패를 보호한다.
- `DATA(ls_hit)`으로 조회 결과를 필요한 위치에서 선언한다.
- string template으로 사용자 메시지를 만든다.
- 업무 결과를 바꾸지 않고 표현만 개선한다.

### 어떻게 확인하는가

실습 검증은 classic 결과와 modern 결과를 비교한다. 같은 `lt_book` 데이터를 사용해야 한다.

예시 데이터:

| booking_id | concert_id | perf_no | customer | seats | status |
|---|---|---|---|---:|---|
| B001 | C001 | 01 | 정훈영 | 2 | N |
| B002 | C001 | 01 | 김하나 | 1 | N |
| B003 | C001 | 02 | 이도윤 | 4 | N |

확인 항목:

| 확인 항목 | 기대 결과 |
|---|---|
| 좌석 합계 | `2 + 1 + 4 = 7` |
| 신규 예매 구조체 | `concert_id = C001`, `perf_no = 01`, `customer = 정훈영`, `seats = 2`, `status = N` |
| 존재하는 예매번호 `B001` | 예매자와 좌석 수 메시지 출력 |
| 없는 예매번호 `B999` | 찾지 못했다는 메시지 출력, 프로그램 중단 없음 |
| SQL 문장 | CH19 문법으로 바꾸지 않음 |

실습자는 디버거에서 `lv_total`, `ls_new`, `ls_hit`, `lv_msg`를 차례로 확인한다. 특히 `B999` 테스트가 중요하다. table expression을 배운 직후에는 존재하는 값만 넣고 성공 화면만 보는 경우가 많다. 실제 프로그램의 안정성은 없는 값에서 드러난다.

### 실수와 주의

첫째, "콘서트 앱을 modernize한다"는 말에 SQL까지 바꾸면 CH18 범위를 넘는다. SELECT문의 modern SQL은 CH19에서 `@`, 콤마, SQL expression과 함께 배워야 한다. CH18-L07에서는 SQL 바깥의 ABAP 코드만 다듬는다.

둘째, table expression을 보호 없이 쓰면 입력 오류에 약하다.

```abap
" 존재가 확실하지 않은 업무 입력에는 위험하다.
DATA(ls_hit) = lt_book[ booking_id = lv_id ].
```

학습용으로 차이를 보여 줄 수는 있지만, 완성 코드에서는 `line_exists` 또는 이후 장의 예외 처리를 선택해야 한다. CH18에서는 `line_exists`가 기본 방어선이다.

셋째, inline declaration으로 변수 이름을 너무 짧게 만들지 않는다. `DATA(ls)`보다 `DATA(ls_book)`이 더 낫다. Modern syntax가 짧아져도 업무 이름은 길고 정확해야 한다.

넷째, string template 안에 업무 판단을 넣지 않는다. 예를 들어 상태 코드에 따라 문구를 바꾸는 로직은 먼저 `IF`나 `CASE`로 결정하고, template은 최종 문장 조립에 집중시키는 편이 좋다.

다섯째, 기존 classic 코드와 modern 코드를 섞는 것을 두려워하지 않는다. 한 파일 안에서도 오래된 SQL, classic loop, modern value constructor가 공존할 수 있다. 중요한 것은 팀의 기준과 학습 경계, 그리고 읽는 사람의 이해다.

### 체험형 학습 설계

기존 embed `CH18-L07-S01`은 콘서트 예매 코드의 classic/modern 차이를 diff-mapper로 보여 준다. 이 위젯은 최종 실습의 시각 장치로 적합하다. 다만 본문은 위젯이 보여 주는 변화가 "업무 결과 동일성"과 연결되도록 안내해야 한다.

**실습 장치: Concert Refactor Lab**

데이터:
- `lt_book`: 예매 3건.
- `lv_id`: 조회할 예매번호.
- `capacity`: 회차별 총 좌석 수.
- `lv_total`: 현재 예약 좌석 합계.

버튼:
- `classic 실행`: 원래 코드로 합계와 메시지를 만든다.
- `modern 실행`: CH18 문법으로 바꾼 코드로 같은 결과를 만든다.
- `결과 비교`: 두 실행 결과의 합계, 신규 구조체, 메시지를 비교한다.
- `없는 예매번호 테스트`: `lv_id = 'B999'`를 넣어 안전 분기를 확인한다.
- `경계 검사`: SQL modern 문법과 OO 문법이 섞였는지 검사한다.

상태:
- `classicOutput`: classic 코드 실행 결과.
- `modernOutput`: modern 코드 실행 결과.
- `diffLines`: 바뀐 코드 줄 목록.
- `boundaryWarnings`: CH19/CH20 경계 위반 여부.
- `missingIdHandled`: 없는 예매번호가 안전하게 처리되었는지 여부.

피드백:
- 합계가 같으면 "표현만 바뀌고 업무 결과는 유지됨"이라고 표시한다.
- 합계가 다르면 "리팩터링 실패: 문법 교체 중 의미가 바뀜"이라고 표시한다.
- 없는 예매번호에서 프로그램이 중단되는 경로는 빨간색으로 표시하고, `line_exists` 경로를 초록색으로 비교한다.
- SQL 문장이 modern 형태로 바뀌면 "CH19에서 다룰 SQL 경계"라고 알려 준다.

### 정리

CH18-L07의 목표는 콘서트 예매 프로그램을 최신 문법으로 과시하는 것이 아니다. 이미 배운 업무 흐름을 유지하면서, 선언 위치를 좁히고, 값 생성은 `VALUE`로 표현하고, 한 행 조회는 table expression과 보호 조건으로 다루며, 메시지는 string template으로 읽기 좋게 만드는 것이다. 좋은 modern refactor는 결과가 같고, 의도는 더 선명하며, 아직 배우지 않은 경계를 넘지 않는다.

## CH18 마무리 정리

CH18을 끝낸 학습자는 다음 질문에 답할 수 있어야 한다.

| 질문 | 기대 답 |
|---|---|
| `DATA( )`는 왜 쓰는가? | 선언을 값이 만들어지는 위치 가까이에 두어 읽기 범위를 줄이기 위해 쓴다. |
| `FINAL( )`은 언제 쓰는가? | 실행 중 한 번 계산된 뒤 바꾸면 안 되는 지역 값을 표현할 때 쓴다. |
| `VALUE`에서 `BASE`가 왜 중요한가? | 기존 테이블을 유지할지 새 값으로 대체할지 결정하기 때문이다. |
| `VALUE #( FOR ... )`는 무엇을 만드는가? | 반복 규칙으로 새 Internal Table 값을 만든다. |
| `CORRESPONDING`의 `MAPPING a = b`는 어떤 방향인가? | 대상 필드 `a`에 원본 필드 `b`를 넣는다. |
| table expression은 실패 시 무엇이 다른가? | `sy-subrc` 확인 방식이 아니라, 없는 행을 직접 읽으면 예외가 날 수 있다. |
| `line_exists`와 `line_index`는 왜 배우는가? | table expression을 안전하게 확인하고 위치를 알기 위해 배운다. |
| string template은 무엇을 개선하는가? | 출력 문장과 코드 모양을 가깝게 만들어 문자열 조립을 읽기 쉽게 한다. |
| `+=`는 무엇을 줄이는가? | `lhs = lhs + rhs` 형태의 누적 계산을 줄인다. |
| CH18에서 아직 하지 않는 것은 무엇인가? | New Open SQL, OO 본격 문법, 예외 처리 본격 문법, `COND/SWITCH/REDUCE/FILTER/CONV` 확장이다. |

## 최종 실습 과제

아래 classic 코드를 CH18 범위에서 modern syntax로 리팩터링하라. 단, SQL 문장이 있다면 SQL 문법은 바꾸지 않는다.

```abap
DATA: ls_book TYPE zbooking,
      lt_ui   TYPE ty_booking_ui_tab,
      ls_ui   TYPE ty_booking_ui,
      lv_sum  TYPE i,
      lv_text TYPE string.

LOOP AT lt_book INTO ls_book.
  lv_sum = lv_sum + ls_book-seats.

  MOVE-CORRESPONDING ls_book TO ls_ui.
  ls_ui-display_status = ls_book-status.
  APPEND ls_ui TO lt_ui.
ENDLOOP.

CONCATENATE '총 예약 좌석:' lv_sum INTO lv_text SEPARATED BY space.
WRITE / lv_text.
```

기대 리팩터링 방향:

```abap
DATA(lv_sum) = 0.

DATA(lt_ui) = CORRESPONDING ty_booking_ui_tab(
  lt_book
  MAPPING display_status = status ).

LOOP AT lt_book INTO DATA(ls_book).
  lv_sum += ls_book-seats.
ENDLOOP.

DATA(lv_text) = |총 예약 좌석: { lv_sum NUMBER = USER }|.
WRITE / lv_text.
```

검토 질문:
- `lt_ui` 생성은 `CORRESPONDING`으로 충분히 의도가 보이는가, 아니면 필드별 대입이 더 안전한가?
- `lv_sum` 계산까지 한 표현식에 넣으려는 유혹이 생기지 않는가?
- `CORRESPONDING`의 `MAPPING display_status = status` 방향을 정확히 설명할 수 있는가?
- 출력 문장에 숫자 형식 옵션을 넣은 이유를 설명할 수 있는가?
- 이 리팩터링이 CH19 SQL 경계를 넘지 않았는가?

모범 답안은 하나가 아니다. CH18의 좋은 답은 "무조건 가장 짧은 코드"가 아니라, 이미 배운 개념만으로 읽을 수 있고, classic 결과와 동일하며, 의도가 더 잘 보이는 코드다.
