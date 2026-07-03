# CH18_REWRITE - Modern ABAP Syntax

> 기준 소스: `content/abap/CH18`
> 보조 참고: `reference/codex_0625_v2/CH18_REWRITE.md`, `reference/codex_0625_v2/CH18_QA.md`, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`
> 작성 목표: IT 비전공자도 "classic ABAP이 왜 길어졌고, modern syntax가 어떤 잡음을 줄이며, 어디까지가 CH18 범위인지" 안전하게 이해하게 만든다.

## CH18 전체 강의 설계

CH01부터 CH17까지는 일부러 classic-first로 진행했다. 변수를 먼저 선언하고, 구조체 필드를 하나씩 채우고, internal table에 `APPEND`하고, `READ TABLE` 뒤 `sy-subrc`를 확인하고, 문자열은 `CONCATENATE`나 `&&`로 이어 붙였다. 이 방식은 처음 배우기에 좋다. 눈에 보이는 단계가 많기 때문이다.

하지만 프로그램이 커지면 이 명시성이 잡음으로 바뀐다. 업무 의도보다 `DATA`, `CLEAR`, `APPEND`, `MOVE-CORRESPONDING`, 임시 work area, `CONCATENATE`가 더 많이 보이기 시작한다. CH18의 Modern ABAP Syntax는 이 잡음을 줄인다.

CH18에서 정식으로 여는 문법:

| 주제 | 줄이는 것 | 핵심 경계 |
| --- | --- | --- |
| Inline declaration | 선언 위치와 사용 위치 사이 거리 | SQL inline 선언은 CH19 |
| `VALUE` constructor | 구조체 필드 대입과 반복 `APPEND` | 너무 긴 expression은 금지 |
| `VALUE ... FOR` | 단순 반복 생성 loop | 중첩과 복잡한 조건은 보류 |
| `CORRESPONDING` | 이름 같은 필드 복사 | 의미가 다른 같은 이름은 위험 |
| Table Expression | `READ TABLE` boilerplate | 없는 행은 예외 가능. `line_exists` 필요 |
| String Template | 문자열 조립 잡음 | 복잡한 계산을 template 안에 밀어 넣지 않음 |
| `CONV` / `EXACT` | 불필요한 임시 변환 변수 | 변환 실패와 손실 가능성을 의식 |
| `COND` / `SWITCH` | 값 하나를 만들기 위한 긴 `IF`/`CASE` | 흐름 제어가 아니라 값 생성일 때만 |
| `REDUCE` / `FILTER` | 단순 합계 loop와 조건 추출 loop | 복잡한 누적 로직은 `LOOP` 유지 |
| Calculation assignment | `lhs = lhs + rhs` 반복 | 왼쪽 변수는 이미 존재해야 함 |

CH18에서 여전히 넘지 않는 경계:

- Modern SQL의 host marker, comma field list, SQL inline target은 CH19다.
- OO 본격 문법, exception handling 본격, object constructor expression은 CH20 이후다.
- `LET`, `THROW`를 포함한 복잡한 expression 조합은 공식 문서에 존재하지만, CH18에서는 읽기 가능한 기본형만 다룬다.
- CH18이 Modern ABAP Syntax의 유일한 정식 장이므로 `COND`, `SWITCH`, `REDUCE`, `FILTER`, `CONV`는 "나중에 배움"으로 미루지 않는다.

## CH18-L01 - Inline Declaration

### 왜 필요한가

classic ABAP에서는 변수를 보통 위에서 먼저 선언한다. 작은 프로그램에서는 괜찮지만, 코드가 길어지면 변수가 실제로 쓰이는 위치와 선언 위치가 멀어진다. 입문자는 "이 변수는 어디서 만들어졌고, 왜 필요한가"를 계속 위아래로 찾아야 한다.

Inline declaration은 변수가 필요한 자리에서 바로 선언하게 해 준다. 선언이 사용 위치 가까이 오면 읽는 범위가 줄어든다.

### 무엇인가

Inline declaration은 `DATA(name)` 또는 `FINAL(name)` 형태로 쓴다. 아무 곳에서나 쓸 수 있는 축약이 아니라, ABAP이 그 위치의 타입을 문맥상 확실히 알 수 있는 declaration position에서 사용한다.

Classic과 modern 비교:

```abap
DATA ls_book TYPE zbooking.

READ TABLE lt_booking INTO ls_book WITH KEY booking_id = 'B001'.
```

```abap
READ TABLE lt_booking INTO DATA(ls_book) WITH KEY booking_id = 'B001'.
```

Loop 예:

```abap
LOOP AT lt_booking INTO DATA(ls_booking).
  WRITE: / ls_booking-booking_id, ls_booking-seats.
ENDLOOP.
```

계산 결과를 받는 예:

```abap
DATA(lv_total) = ls_book-seats * 10000.
```

값을 한 번 정한 뒤 바꾸면 안 되는 경우:

```abap
FINAL(lv_limit) = 100.
```

`DATA( )`는 이후 재대입할 수 있다. `FINAL( )`은 선언 뒤 write access를 막아 "이 값은 이 처리 범위에서 바뀌면 안 된다"는 의도를 표현한다.

### 어떻게 확인하는가

1. `READ TABLE ... INTO DATA(ls_book)` 줄에 breakpoint를 둔다.
2. 실행 전에는 `ls_book`이 변수 목록에 없는지 본다.
3. 해당 줄 실행 뒤 `ls_book`이 생기고 row 값이 들어오는지 확인한다.
4. `FINAL(lv_limit)` 아래에 `lv_limit = 200.`을 일부러 써서 문법 오류가 나는지 확인한다.
5. SQL inline target은 CH19 범위이므로 CH18 예제에서는 SQL 밖의 inline declaration만 확인한다.

### 체험 설계

학습 장치는 "Inline 선언 위치 판정기"로 설계한다.

- 카드: `READ TABLE ... INTO`, `LOOP AT ... INTO`, 계산 대입, SQL target.
- 버튼: `DATA로 선언`, `FINAL로 선언`, `다시 대입 시도`, `선언 위치 확인`.
- 상태: allowed, blocked, readonly, out-of-scope.
- 피드백: SQL 카드는 "CH19에서 여는 SQL 문법 경계"라고 표시한다.

### 실수와 주의

- `DATA( )`는 타입을 추론할 수 있는 위치에서만 가능하다.
- 같은 처리 범위에서 같은 이름을 다시 inline 선언하면 중복 선언이다.
- 누적 변수에는 `FINAL( )`이 맞지 않는다.
- inline declaration 때문에 변수 이름을 지나치게 짧게 만들지 않는다. `DATA(ls_booking)`이 `DATA(ls)`보다 낫다.

### 정리

Inline declaration은 변수를 짧게 쓰는 기술이 아니라 선언을 값이 만들어지는 위치 가까이 두는 기술이다. `DATA( )`는 필요한 곳에서 선언하고, `FINAL( )`은 바뀌면 안 되는 지역 값을 표현한다.

## CH18-L02 - VALUE Constructor Expression

### 왜 필요한가

classic 방식으로 구조체를 채우려면 필드마다 대입하고, internal table은 work area를 채운 뒤 `APPEND`를 반복한다. 학습 초기에는 이 과정이 도움이 된다. 하지만 단순히 값 모양을 만들 뿐인 코드가 너무 길어지면 업무 의도가 묻힌다.

`VALUE` constructor는 "이 값의 모양은 이렇다"를 한 식으로 표현하게 해 준다.

### 무엇인가

구조체 값 만들기:

```abap
TYPES: BEGIN OF ty_line,
         dan    TYPE i,
         mul    TYPE i,
         result TYPE i,
       END OF ty_line.

DATA(ls_line) = VALUE ty_line(
  dan    = 2
  mul    = 3
  result = 6 ).
```

Internal table 값 만들기:

```abap
TYPES ty_line_tab TYPE STANDARD TABLE OF ty_line WITH EMPTY KEY.

DATA(lt_gugu) = VALUE ty_line_tab(
  ( dan = 2 mul = 1 result = 2 )
  ( dan = 2 mul = 2 result = 4 )
  ( dan = 2 mul = 3 result = 6 ) ).
```

기존 내용을 유지하며 행 추가:

```abap
lt_gugu = VALUE #(
  BASE lt_gugu
  ( dan = 3 mul = 1 result = 3 ) ).
```

`#`는 왼쪽 변수 `lt_gugu`가 타입을 알려 주기 때문에 가능하다. `BASE`가 없으면 기존 내용은 유지되지 않고 새 값으로 바뀐다.

반복으로 테이블 생성:

```abap
DATA(lt_gugu_2) = VALUE ty_line_tab(
  FOR i = 1 WHILE i <= 9
  ( dan = 2 mul = i result = 2 * i ) ).
```

기존 테이블을 다른 형태로 변환:

```abap
DATA(lt_double) = VALUE ty_line_tab(
  FOR line IN lt_gugu_2
  ( dan = line-dan
    mul = line-mul
    result = line-result * 2 ) ).
```

`FOR` 안의 반복 변수는 그 expression 내부에서만 유효하다.

### 어떻게 확인하는가

1. `ls_line`의 `dan`, `mul`, `result` 값이 한 번에 채워졌는지 확인한다.
2. `lt_gugu`의 row count와 각 row 값을 확인한다.
3. `BASE lt_gugu`가 있을 때 기존 row가 유지되는지 확인한다.
4. `BASE`를 제거했을 때 기존 row가 사라지는 차이를 본다.
5. `lt_gugu_2`가 9행으로 만들어지는지 확인한다.

### 체험 설계

학습 장치는 "VALUE Builder"로 설계한다.

- 탭: 구조체, 테이블 literal, BASE, FOR.
- 버튼: `필드 하나씩 채우기`, `VALUE로 채우기`, `BASE 제거`, `FOR로 2단 생성`.
- 상태: before table, expression, after table, row count.
- 피드백: `VALUE #( )`에서 타입 추론이 불가능한 상황을 만들면 "좌변 타입 또는 명시 타입 필요"라고 표시한다.

### 실수와 주의

- `#`는 마법이 아니다. 타입을 알 수 있어야 한다.
- `BASE`를 빼면 누적이 아니라 새 값 생성이다.
- `FOR` expression이 길어지면 다시 `LOOP`가 더 나을 수 있다.
- unique key가 있는 table에 중복 key row를 만들면 문제가 생길 수 있다.
- Modern ABAP은 한 줄 압축 대회가 아니다.

### 정리

`VALUE`는 구조체와 internal table을 값 모양 그대로 만드는 문법이다. 단순 값 생성은 짧아지지만, 조건이 복잡하거나 중간 검증이 많으면 classic loop가 더 안전하고 읽기 좋다.

## CH18-L03 - CORRESPONDING과 구조 매핑

### 왜 필요한가

업무 프로그램에서는 DB 구조체를 화면 표시용 구조체로 옮기거나, 내부 처리 구조를 API용 구조로 바꾸는 일이 많다. 이름이 같은 필드를 하나씩 대입하면 코드가 길어지고 실수도 늘어난다. CH05에서 `MOVE-CORRESPONDING`을 배웠다면, CH18에서는 그 modern constructor expression 형태를 배운다.

### 무엇인가

Classic:

```abap
MOVE-CORRESPONDING ls_source TO ls_target.
```

Modern:

```abap
DATA(ls_target) = CORRESPONDING ty_target( ls_source ).
```

Internal table 변환:

```abap
DATA(lt_target) = CORRESPONDING ty_target_tab( lt_source ).
```

이름이 다른 필드 연결과 제외:

```abap
DATA(ls_ui) = CORRESPONDING ty_booking_ui(
  ls_booking
  MAPPING display_status = status
          customer_name   = customer
  EXCEPT  internal_note ).
```

`MAPPING display_status = status`의 방향은 "대상 필드 display_status에 원본 필드 status를 넣는다"이다. 이 방향을 헷갈리면 결과가 비어 보인다.

### 어떻게 확인하는가

1. 원본 구조체와 대상 구조체의 field 목록을 나란히 본다.
2. 이름이 같은 field가 자동으로 들어가는지 확인한다.
3. 이름이 다른 field는 `MAPPING` 후 들어가는지 확인한다.
4. `EXCEPT`에 지정한 대상 field가 결과에서 제외되는지 확인한다.
5. 이름은 같지만 의미가 다른 field가 있는지 검토한다.

### 체험 설계

학습 장치는 "구조 매핑 보드"로 설계한다.

- 왼쪽: source structure field 카드.
- 오른쪽: target structure field 카드.
- 버튼: `같은 이름 자동 매핑`, `MAPPING 추가`, `EXCEPT 추가`, `의미 충돌 표시`.
- 상태: copied, mapped, skipped, 위험.
- 피드백: 이름이 같은데 업무 의미가 다르면 "자동 매핑 전에 의미 확인 필요"라고 표시한다.

### 실수와 주의

- `CORRESPONDING`은 모든 field를 복사하는 문법이 아니다.
- `MAPPING`의 왼쪽은 대상 field, 오른쪽은 원본 field다.
- 이름이 같아도 의미가 다르면 자동 매핑은 위험하다.
- 변환 로직이 많아지면 explicit assignment나 loop가 더 읽기 쉽다.

### 정리

`CORRESPONDING`은 이름 기반 구조 매핑을 expression으로 만드는 도구다. 이름과 의미가 잘 정돈된 구조에서는 강력하지만, 의미 확인 없이 쓰면 조용한 오류를 만들 수 있다.

## CH18-L04 - Table Expression

### 왜 필요한가

classic internal table 조회는 `READ TABLE`과 `sy-subrc`가 중심이다. 이 방식은 안전하지만, 단순히 한 행의 값을 쓰고 싶은 경우에는 코드가 길어진다. Table expression은 internal table의 한 행을 값처럼 꺼내게 해 준다.

### 무엇인가

Classic:

```abap
DATA ls_book TYPE zbooking.

READ TABLE lt_booking INTO ls_book WITH KEY booking_id = 'B001'.
IF sy-subrc = 0.
  WRITE ls_book-customer.
ENDIF.
```

Modern:

```abap
DATA(ls_book) = lt_booking[ booking_id = 'B001' ].
```

Index 접근:

```abap
DATA(ls_first) = lt_booking[ 1 ].
```

하지만 table expression은 `READ TABLE`처럼 실패 시 `sy-subrc`만 세우고 지나가지 않는다. 없는 행을 직접 읽으면 예외가 발생할 수 있다. 그래서 CH18에서는 먼저 `line_exists`로 보호하는 방식을 기본으로 둔다.

```abap
IF line_exists( lt_booking[ booking_id = lv_id ] ).
  DATA(ls_hit) = lt_booking[ booking_id = lv_id ].
ENDIF.
```

위치를 알고 싶을 때:

```abap
DATA(lv_index) = line_index( lt_booking[ booking_id = lv_id ] ).
```

찾지 못하면 `line_index`는 0을 돌려줄 수 있다. 순서 인덱스를 말할 수 없는 접근에서는 다른 값이 나올 수 있으므로, 입문 단계에서는 standard table의 기본 사용부터 익힌다.

### 어떻게 확인하는가

1. 존재하는 booking ID로 table expression을 실행한다.
2. `ls_book`에 해당 row가 들어오는지 확인한다.
3. 존재하지 않는 booking ID로 직접 접근했을 때 위험을 확인한다.
4. `line_exists`로 보호하면 오류 없이 분기되는지 본다.
5. `line_index` 결과가 존재 시 양수, 미존재 시 0인지 확인한다.

### 체험 설계

학습 장치는 "READ TABLE vs Table Expression 비교기"로 설계한다.

- 데이터: 예매 3건과 검색 ID.
- 버튼: `READ TABLE`, `Table Expression`, `line_exists 보호`, `line_index 확인`.
- 상태: `sy-subrc`, exception risk, found, index.
- 피드백: 없는 행을 직접 expression으로 읽으면 "CH18에서는 line_exists로 먼저 보호"를 표시한다.

### 실수와 주의

- Table expression 뒤에 `sy-subrc`를 확인하는 습관은 맞지 않는다.
- 존재가 불확실하면 `line_exists`를 먼저 사용한다.
- 같은 expression을 두 번 쓰는 비용과 가독성을 생각해야 한다.
- 예외 처리는 CH20에서 본격적으로 다룬다.

### 정리

Table expression은 internal table 한 행을 값처럼 읽는 modern syntax다. 짧지만 실패 방식이 다르므로 `line_exists`와 `line_index`를 함께 배워야 안전하다.

## CH18-L05 - String Template과 내장 함수

### 왜 필요한가

문자열 조립은 대부분의 프로그램에 등장한다. classic에서는 `CONCATENATE`, `WRITE TO`, 임시 변수, 구분자 처리가 이어지며 코드가 길어지기 쉽다. String Template은 문자열 안에 값을 바로 넣어 읽기 좋은 문장을 만들게 해 준다.

### 무엇인가

기본 형태:

```abap
DATA(lv_name) = '정훈영'.
DATA(lv_msg)  = |{ lv_name }님 환영합니다|.
```

계산 결과와 구조체 field 넣기:

```abap
DATA(ls_line) = VALUE ty_line( dan = 2 mul = 3 result = 6 ).
DATA(lv_text) = |{ ls_line-dan } x { ls_line-mul } = { ls_line-result }|.
```

날짜와 숫자 format:

```abap
DATA(lv_total) = 120000.
DATA(lv_line)  = |오늘은 { sy-datum DATE = USER }, 합계 { lv_total NUMBER = USER }|.
```

함수형 문자열 처리:

```abap
DATA(lv_upper) = to_upper( lv_name ).
DATA(lv_part)  = substring( val = lv_name off = 0 len = 2 ).
DATA(lv_len)   = strlen( lv_name ).
```

String Template의 핵심은 `| ... |` 안에 `{ ... }` embedded expression을 넣는 것이다. 값은 braces 안에서 평가되어 문자열로 들어간다.

### 어떻게 확인하는가

1. `lv_name` 값을 바꾸고 `lv_msg` 결과가 바뀌는지 본다.
2. 날짜 format 옵션을 제거했을 때와 넣었을 때 출력 차이를 비교한다.
3. 숫자 format 옵션을 넣었을 때 사용자 환경에 맞게 표시되는지 확인한다.
4. `substring`의 offset과 length를 바꿔 결과를 확인한다.

### 체험 설계

학습 장치는 "String Template 조립기"로 설계한다.

- 입력: 이름, 날짜, 금액, 구구단 row.
- 버튼: `CONCATENATE 방식`, `Template 방식`, `DATE 옵션`, `NUMBER 옵션`, `substring`.
- 상태: source pieces, template, result string.
- 피드백: `{ }` 없이 변수명을 쓰면 "문자 그대로 들어감"을 보여 준다.

### 실수와 주의

- 변수는 `{ }` 안에 넣어야 값으로 들어간다.
- 숫자와 날짜는 format 옵션을 의식적으로 사용한다.
- Template 안에 너무 복잡한 계산을 넣으면 다시 읽기 어려워진다.
- 복잡한 값은 먼저 이름 있는 변수로 계산하고 template에는 그 변수를 넣는다.

### 정리

String Template은 문자열 조립의 잡음을 줄인다. 읽기 좋은 문장을 만들되, template 안이 계산식으로 과밀해지지 않도록 조절해야 한다.

## CH18-L06 - `CONV`와 `EXACT` 변환 표현식

### 왜 필요한가

CH02에서 타입과 값의 관계를 배웠고, 이후 여러 장에서 숫자, 문자, 날짜, 금액이 서로 다른 타입이라는 것을 반복해서 보았다. Classic ABAP에서는 변환이 필요할 때 임시 변수를 하나 만들고 대입한 뒤 그 변수를 다시 넘기는 방식이 많았다.

Modern ABAP에서는 변환 자체를 expression으로 써서 "이 자리에서 이 타입으로 바꿔서 넘긴다"는 의도를 드러낼 수 있다. 이것이 `CONV`다.

### 무엇인가

`CONV type( value )`는 값을 지정한 타입으로 변환한 결과를 만든다.

```abap
DATA(lv_count_text) = '12'.
DATA(lv_count)      = CONV i( lv_count_text ).
```

메서드나 함수가 특정 타입을 요구할 때 임시 변수를 줄이는 데도 쓴다.

```abap
DATA(lv_name_c) = '정훈영'.
DATA(lv_text)   = |예매자: { CONV string( lv_name_c ) }|.
```

`EXACT type( value )`는 손실 없는 변환을 요구하는 표현식이다. 값이 잘리거나 반올림되어 의미가 달라질 수 있으면 예외가 날 수 있다. CH18에서는 "이런 도구가 있고, 손실 없는 변환을 강하게 요구할 때 쓴다"까지만 잡는다. 예외 처리 자체는 CH20에서 본격적으로 다룬다.

```abap
DATA(lv_price_text) = '120000'.
DATA(lv_price)      = EXACT i( lv_price_text ).
```

### 어떻게 확인하는가

1. 문자 `'12'`를 `CONV i( )`로 바꿨을 때 정수 12가 되는지 확인한다.
2. 이미 같은 타입인 값에 불필요하게 `CONV`를 쓰면 문법 검사 경고가 날 수 있음을 확인한다.
3. 숫자가 아닌 문자를 숫자 타입으로 바꾸려 할 때 실패 가능성이 있음을 확인한다.
4. 금액, 수량, 날짜처럼 업무 의미가 큰 값은 무조건 변환하지 말고 원본 타입과 값 범위를 먼저 확인한다.

### 체험 설계

학습 장치는 "타입 변환 실험실"로 설계한다.

- 입력: 문자 숫자, 숫자가 아닌 문자, 금액 문자열, 날짜 문자열.
- 버튼: `CONV i`, `CONV string`, `EXACT i`, `임시 변수 방식 비교`.
- 상태: source type, target type, result, conversion risk.
- 피드백: `'12A'`를 숫자로 바꾸려 하면 "값이 숫자 타입으로 안전하게 변환될 수 없음"을 표시한다.

### 실수와 주의

- `CONV`는 타입을 속이는 문법이 아니다. 실제 변환 규칙을 따른다.
- 이미 같은 타입이면 `CONV`가 불필요할 수 있다.
- `EXACT`는 안전해 보이지만 실패 가능성을 더 분명히 드러내는 도구다.
- 변환 expression을 많이 중첩하면 읽기 어려워진다. 복잡하면 이름 있는 변수로 분리한다.

### 정리

`CONV`는 임시 변환 변수를 줄이고 operand position에서 타입 의도를 드러낸다. `EXACT`는 손실 없는 변환을 요구한다. 변환은 편의 문법이 아니라 데이터 의미를 바꾸는 행위이므로 항상 값의 안전성을 함께 생각해야 한다.

## CH18-L07 - `COND`와 `SWITCH` 조건 표현식

### 왜 필요한가

`IF`와 `CASE`는 흐름을 나눈다. 그런데 실무 코드에는 흐름 전체를 나누기보다 "상태값 하나", "표시 문구 하나", "색상 코드 하나"를 조건에 따라 만들고 싶은 경우가 많다. 이때 여러 줄의 `IF`로 변수를 채우면 실제 목적보다 대입 과정이 더 크게 보인다.

`COND`와 `SWITCH`는 조건에 따라 값 하나를 만드는 expression이다.

### 무엇인가

`COND`는 논리 조건을 차례대로 검사해 첫 번째로 참인 결과를 돌려준다. `IF`에 가깝다.

```abap
DATA(lv_status_text) = COND string(
  WHEN lv_remaining = 0  THEN '매진'
  WHEN lv_remaining < 10 THEN '마감 임박'
  ELSE                        '예매 가능' ).
```

`SWITCH`는 하나의 값이 어떤 상수와 같은지 비교해 결과를 돌려준다. `CASE`에 가깝다.

```abap
DATA(lv_icon) = SWITCH string( lv_status
  WHEN 'N' THEN '@5B@'
  WHEN 'C' THEN '@5C@'
  WHEN 'X' THEN '@5D@'
  ELSE          '@5A@' ).
```

입문자가 반드시 구분해야 할 점이 있다. `COND/SWITCH`는 "문장 묶음을 실행"하는 도구가 아니라 "값을 만든다"는 도구다. 조건마다 `UPDATE`, `CALL SCREEN`, 복잡한 업무 처리를 넣고 싶다면 expression이 아니라 `IF`/`CASE`가 맞다.

### 어떻게 확인하는가

1. `lv_remaining` 값을 0, 5, 20으로 바꾸며 `lv_status_text`가 달라지는지 확인한다.
2. `lv_status` 값을 `N`, `C`, `X`, 빈 값으로 바꾸며 `lv_icon` 결과를 확인한다.
3. `ELSE`를 제거했을 때 조건에 맞지 않는 경우 초기값이 될 수 있음을 확인한다.
4. `THEN` 뒤 결과들의 타입이 같은 결과 타입으로 변환 가능한지 확인한다.

### 체험 설계

학습 장치는 "조건 표현식 선택기"로 설계한다.

- 입력: 잔여석, 예매 상태 코드.
- 버튼: `IF로 작성`, `COND로 작성`, `CASE로 작성`, `SWITCH로 작성`, `ELSE 제거`.
- 상태: condition path, selected result, result type, initial fallback.
- 피드백: 조건 안에 여러 동작을 넣으려 하면 "값 생성이 아니라 흐름 제어이므로 IF/CASE 유지"를 표시한다.

### 실수와 주의

- `COND`가 짧다고 모든 `IF`를 바꾸지 않는다.
- `SWITCH`는 하나의 operand를 상수들과 비교할 때 적합하다.
- `ELSE`가 없으면 조건 불일치 시 초기값이 될 수 있다.
- 결과 expression이 길어지면 가독성이 떨어진다.

### 정리

`COND`와 `SWITCH`는 조건별로 값 하나를 만드는 modern syntax다. 흐름을 나누는 `IF/CASE`를 대체하는 것이 아니라, 단순 조건 대입을 더 가까운 위치에서 표현하는 도구다.

## CH18-L08 - `REDUCE`와 `FILTER` 테이블 표현식

### 왜 필요한가

Internal table을 배운 뒤로 우리는 반복해서 `LOOP`를 사용했다. 전체 좌석 수를 합산하거나, 상태가 `N`인 예매만 모으거나, 특정 조건의 행만 골라 새 table을 만드는 코드는 매우 흔하다. Classic `LOOP`는 명확하지만, "합계 하나 만들기"나 "조건에 맞는 행만 추출"처럼 패턴이 단순한 경우에는 boilerplate가 많다.

`REDUCE`는 여러 값을 하나로 줄이고, `FILTER`는 table에서 조건에 맞는 row만 새 table로 만든다.

### 무엇인가

`REDUCE`는 초기값을 만들고, 반복하면서 누적 변수에 값을 더해 최종 결과를 만든다.

```abap
DATA(lv_total_seats) = REDUCE i(
  INIT sum = 0
  FOR ls_book IN lt_booking
  NEXT sum += ls_book-seats ).
```

위 코드는 다음 classic loop와 같은 목적이다.

```abap
DATA lv_total_seats TYPE i.

LOOP AT lt_booking INTO DATA(ls_book).
  lv_total_seats += ls_book-seats.
ENDLOOP.
```

`FILTER`는 조건에 맞는 row만 뽑아 새 internal table을 만든다. 실무에서 `FILTER`는 table key와 조건의 관계가 중요하므로, CH18에서는 먼저 sorted table처럼 key가 분명한 단순 예제로 익힌다.

```abap
TYPES ty_booking_tab TYPE SORTED TABLE OF ty_booking
  WITH NON-UNIQUE KEY status.

DATA(lt_open) = FILTER ty_booking_tab(
  lt_booking
  WHERE status = 'N' ).
```

`EXCEPT`를 붙이면 조건에 맞지 않는 row를 가져온다.

```abap
DATA(lt_not_open) = FILTER ty_booking_tab(
  lt_booking
  EXCEPT
  WHERE status = 'N' ).
```

### 어떻게 확인하는가

1. classic `LOOP` 합계와 `REDUCE` 합계가 같은지 확인한다.
2. `INIT sum = 0`이 누적 시작값임을 확인한다.
3. `NEXT sum += ls_book-seats`가 각 반복에서 실행되는지 추적한다.
4. `FILTER` 결과 row count가 조건에 맞는 row 수와 같은지 확인한다.
5. `EXCEPT`를 붙였을 때 반대 집합이 만들어지는지 확인한다.

### 체험 설계

학습 장치는 "Table Expression 집계/필터 실험실"로 설계한다.

- 데이터: 상태별 예매 internal table, 좌석 수.
- 버튼: `LOOP 합계`, `REDUCE 합계`, `LOOP 필터`, `FILTER`, `EXCEPT`, `복잡한 조건 넣기`.
- 상태: source rows, accumulator, filtered rows, key suitability, readability score.
- 피드백: 조건이 단순하면 `FILTER`를 추천하고, 누적 로직에 여러 검증이 들어가면 "LOOP가 더 읽기 좋음"을 표시한다.

### 실수와 주의

- `REDUCE`는 강력하지만 초보자에게 가장 읽기 어려운 modern expression 중 하나다. 단순 합계부터 시작한다.
- 누적 중간에 메시지, 검증, 예외 처리가 많으면 `LOOP`가 낫다.
- `FILTER`는 table type과 key를 의식해야 한다.
- `FILTER ... EXCEPT`는 단순 `NOT`과 항상 같은 사고방식이 아니므로, 결과 row를 직접 확인한다.

### 정리

`REDUCE`는 internal table을 합계나 하나의 결과로 줄이는 표현식이고, `FILTER`는 조건에 맞는 row만 새 table로 만드는 표현식이다. 둘 다 "단순한 반복 패턴"을 줄이는 데 쓰며, 복잡한 업무 흐름은 여전히 `LOOP`가 더 좋은 선택일 수 있다.

## CH18-L09 - Legacy 코드의 Modern ABAP 리팩터링

### 왜 필요한가

Modern syntax를 각각 배웠다면 이제 classic 코드를 어떻게 바꿀지 판단해야 한다. 리팩터링은 문법을 새것으로 바꾸는 작업이 아니라, 결과는 유지하면서 의도를 더 잘 드러내는 작업이다.

### 무엇인가

Classic:

```abap
DATA ls_line TYPE ty_line.
DATA lt_gugu TYPE ty_line_tab.
DATA lv_total TYPE i.

ls_line-dan = 2.
ls_line-mul = 1.
ls_line-result = 2.
APPEND ls_line TO lt_gugu.

lv_total = 0.
lv_total = lv_total + ls_line-result.
```

Modern:

```abap
DATA(lt_gugu) = VALUE ty_line_tab(
  ( dan = 2 mul = 1 result = 2 ) ).

DATA(lv_total) = 0.
lv_total += lt_gugu[ 1 ]-result.
```

여기서 `+=`는 inline declaration이 아니다. 이미 존재하는 왼쪽 변수에 오른쪽 값을 누적하는 calculation assignment다.

더 읽기 좋은 리팩터링 기준:

| 기준 | 질문 |
| --- | --- |
| 의미 보존 | 결과가 classic과 같은가? |
| 안전성 | table expression이 실패할 가능성은 없는가? |
| 경계 | SQL modern 문법이나 OO 본격 문법을 끌어오지 않았는가? |
| 가독성 | 짧아졌지만 이해하기 쉬운가? |

### 어떻게 확인하는가

1. classic 버전의 결과를 먼저 저장한다.
2. modern 버전으로 바꾼다.
3. 같은 입력에서 결과가 같은지 비교한다.
4. table expression을 쓴 줄은 row 존재가 보장되는지 확인한다.
5. SQL이나 OO 경계를 넘은 문법이 섞이지 않았는지 확인한다.

### 체험 설계

학습 장치는 "Legacy Refactor Diff Lab"으로 설계한다.

- 왼쪽: classic code.
- 오른쪽: modern code.
- 버튼: `inline 적용`, `VALUE 적용`, `table expression 적용`, `+= 적용`, `경계 검사`.
- 상태: output equality, shorter, safe, boundary warning.
- 피드백: 짧아졌지만 `line_exists`가 필요한 상황이면 "짧지만 안전하지 않음"을 표시한다.

### 실수와 주의

- 모든 classic 코드를 억지로 modern으로 바꾸지 않는다.
- `+=`의 왼쪽 변수는 이미 존재해야 한다.
- 너무 긴 expression은 디버깅과 교육에 불리하다.
- CH18 리팩터링은 ABAP expression 중심이고, SQL 리팩터링은 CH19다.

### 정리

좋은 modern refactor는 결과가 같고, 의도는 더 선명하며, 아직 배우지 않은 경계를 넘지 않는다. 짧아졌다는 사실만으로 좋은 코드가 되지는 않는다.

## CH18-L10 - 실습: 콘서트앱 모던 리팩터

### 왜 필요한가

마지막 실습은 CH10, CH11, CH17에서 이어 온 콘서트 예매 흐름을 modern syntax로 다듬는다. 새 기능을 만드는 것이 아니라 이미 배운 업무 흐름을 더 짧고 읽기 좋게 표현한다.

### 무엇인가

예매 목록 합계:

```abap
DATA(lv_total) = REDUCE i(
  INIT sum = 0
  FOR ls_book IN lt_book
  NEXT sum += ls_book-seats ).
```

새 예매 구조 만들기:

```abap
DATA(ls_new) = VALUE zbooking(
  concert_id = p_conc
  perf_id    = p_perf
  customer   = p_cust
  seats      = p_seats
  status     = 'N' ).
```

예매 ID로 한 행 찾기:

```abap
IF line_exists( lt_book[ booking_id = lv_id ] ).
  DATA(ls_hit) = lt_book[ booking_id = lv_id ].
  DATA(lv_msg) = |예매자 { ls_hit-customer }님의 좌석 수는 { ls_hit-seats }석입니다|.
ENDIF.
```

상태 문구 만들기:

```abap
DATA(lv_status_text) = SWITCH string( ls_hit-status
  WHEN 'N' THEN '신규'
  WHEN 'C' THEN '취소'
  WHEN 'X' THEN '완료'
  ELSE          '확인 필요' ).
```

이 실습에서 지키는 경계:

- SQL 문장은 classic 형태로 둔다.
- 실제 데이터 저장은 하지 않는다.
- 객체지향 설계로 확장하지 않는다.
- 없는 행 접근은 `line_exists`로 보호한다.

### 어떻게 확인하는가

1. classic 합계 결과와 modern 합계 결과가 같은지 확인한다.
2. `ls_new`의 field가 모두 의도한 값으로 채워졌는지 본다.
3. 존재하는 booking ID로 table expression을 실행한다.
4. 없는 booking ID로 `line_exists` 분기가 안전하게 막는지 확인한다.
5. string template 결과가 사용자가 읽을 수 있는 메시지인지 확인한다.
6. `SWITCH`로 만든 상태 문구가 상태 코드별로 맞는지 확인한다.

### 체험 설계

학습 장치는 "Concert Refactor Lab"으로 설계한다.

- 데이터: `lt_book` 예매 3건, `lv_id`, 공연 ID, 좌석 수.
- 버튼: `classic 실행`, `modern 실행`, `없는 ID 테스트`, `line_exists 제거`, `REDUCE 비교`, `SWITCH 상태`, `경계 검사`.
- 상태: classic result, modern result, exception risk, message text, status text, boundary warnings.
- 피드백: 결과가 같으면 "의미 보존", 없는 ID에서 보호가 없으면 "table expression 위험"을 표시한다.

### 실수와 주의

- table expression을 보호 없이 쓰지 않는다.
- inline 변수 이름을 너무 짧게 만들지 않는다.
- string template 안에 업무 계산을 과하게 넣지 않는다.
- `COND`, `SWITCH`, `REDUCE`, `FILTER`를 배웠다고 모든 `IF`, `CASE`, `LOOP`를 바꾸지 않는다.
- CH18 실습은 modern syntax 리팩터링이지 modern SQL 실습이 아니다.
- classic 코드와 modern 코드는 한동안 공존할 수 있다.

### 정리

CH18-L10의 목표는 최신 문법 과시가 아니다. 이미 배운 콘서트 예매 흐름을 유지하면서 선언 위치를 좁히고, 값 생성은 `VALUE`로 표현하고, 한 행 조회는 table expression과 보호 조건으로 다루며, 메시지는 string template으로 읽기 좋게 만들고, 단순 합계와 상태 변환은 expression으로 안전하게 옮기는 것이다.

## CH18 마무리 체크리스트

학습자는 CH18을 마친 뒤 다음 질문에 답할 수 있어야 한다.

1. `DATA( )`는 아무 곳에서나 쓸 수 있는가?
2. `FINAL( )`은 `CONSTANTS`와 어떻게 다른가?
3. `VALUE #( )`에서 `#`는 언제 가능한가?
4. `BASE`를 빼면 기존 internal table 내용은 어떻게 되는가?
5. `VALUE ... FOR`의 반복 변수는 어디까지 살아 있는가?
6. `CORRESPONDING`의 `MAPPING target = source` 방향을 설명할 수 있는가?
7. Table expression은 실패할 때 `sy-subrc`를 세우는가?
8. `line_exists`와 `line_index`는 왜 필요한가?
9. String Template에서 변수는 어떻게 넣는가?
10. `CONV`는 언제 필요한가?
11. `EXACT`는 왜 실패 가능성을 함께 생각해야 하는가?
12. `COND`와 `IF`의 차이를 "값 생성 vs 흐름 제어" 관점에서 설명할 수 있는가?
13. `SWITCH`와 `CASE`의 차이를 "값 생성 vs 흐름 제어" 관점에서 설명할 수 있는가?
14. `REDUCE`의 `INIT`, `FOR`, `NEXT` 역할을 설명할 수 있는가?
15. `FILTER`를 쓸 때 table type과 key를 왜 의식해야 하는가?
16. `+=`는 inline declaration인가, calculation assignment인가?
17. CH18에서 아직 열지 않는 SQL, OO, 예외 처리 경계는 무엇인가?

핵심 문장:

```text
CH18은 modern syntax를 여는 장이다.
짧게 쓰는 것이 목적이 아니라,
선언과 값 생성과 조회와 문자열 조립의 의도를 더 가까이 보여 주는 것이 목적이다.
```
