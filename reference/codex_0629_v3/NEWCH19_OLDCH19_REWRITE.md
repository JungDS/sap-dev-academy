# CH19_REWRITE · New Open SQL / Modern ABAP SQL

> 주 소스: `content/abap/CH19/_chapter.md`, `content/abap/CH19/CH19-L01.md` ~ `CH19-L08.md`  
> 보조 참고: `reference/codex_0625_v2/CH19_REWRITE.md`, `reference/codex_0625_v2/CH19_QA.md`  
> 목표: CH19를 "문법이 새로워졌다"가 아니라, ABAP 프로그램과 데이터베이스 사이의 경계를 읽고 검증하는 완성 강의자료로 재집필한다.

## CH19 전체 설계

CH18에서 학습자는 ABAP 코드 자체를 modern syntax로 정리했다. `DATA( )`, `FINAL( )`, `VALUE`, `CORRESPONDING`, table expression, string template, `+=`를 배웠다. 그러나 CH18에서는 일부러 `SELECT` 문을 modern SQL로 바꾸지 않았다. 이유는 단순하다. Open SQL의 modern화는 문장을 짧게 쓰는 문제가 아니라, SQL 문장 안에서 어느 이름이 데이터베이스 쪽 이름이고 어느 이름이 ABAP 프로그램 쪽 값인지 분리하는 문제이기 때문이다.

CH19는 그 경계를 여는 장이다. 여기부터는 Modern ABAP SQL을 정식으로 사용한다.

```abap
SELECT carrid, connid, seatsmax
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_flight).
```

이 한 문장에는 CH19의 핵심이 거의 들어 있다.

- `carrid, connid, seatsmax`: SELECT list의 필드를 콤마로 구분한다.
- `@lv_carr`: SQL 문장 안으로 들어오는 ABAP 변수는 `@`로 표시한다.
- `@DATA(lt_flight)`: SQL 결과를 받을 ABAP target도 `@`가 붙은 inline declaration으로 선언할 수 있다.
- `INTO TABLE`을 마지막 쪽에 두어 `무엇을 읽는가 -> 어디서 읽는가 -> 어떤 조건인가 -> 어디에 받는가` 흐름으로 읽는다.

입문자가 CH19를 끝낸 뒤 반드시 답할 수 있어야 하는 질문은 다음이다.

| 질문 | CH19에서 기대하는 답 |
|---|---|
| DB 컬럼과 ABAP 변수는 어떻게 구분하는가? | DB 컬럼은 그대로 쓰고, ABAP 변수·target·internal table source에는 `@`를 붙인다. |
| modern SQL에서 필드 목록은 어떻게 쓰는가? | 필드 사이를 콤마로 구분한다. 공백 구분 classic 목록과 섞지 않는다. |
| `@DATA( )`는 무엇을 만드는가? | SELECT 결과 형태를 기준으로 결과 변수 또는 standard internal table을 inline 선언한다. |
| SQL expression은 어디서 계산되는가? | SELECT 문장의 일부로 데이터베이스 쪽에서 계산되어 결과 컬럼으로 넘어온다. |
| `COALESCE`는 무엇을 바꾸는가? | ABAP initial 값이 아니라 DB null을 대체한다. |
| `SELECT FROM @itab`은 언제 쓰는가? | 이미 메모리에 있는 internal table을 SQL 문법으로 다시 필터·정렬·집계할 때 쓴다. |

## CH19 R15 경계

CH19는 R6상 New Open SQL의 L3 정식 도입 지점이다. 따라서 `@`, 콤마 SELECT list, `@DATA( )`, SQL expression, SQL function, `SELECT FROM @itab`은 적극적으로 쓴다. 반대로 CH20 이후 주제는 코드로 앞당기지 않는다.

| 구분 | CH19에서 정식 사용 | CH19에서 보류 |
|---|---|---|
| Modern SQL 기본 | `@`, `@( )`, 콤마 필드 목록, strict mode 관점 | dynamic SQL 심화, Native SQL, ADBC |
| 결과 target | `INTO TABLE @DATA( )`, `INTO @DATA( )`, 기존 target `@lt_result` | 동적 target 심화 |
| SQL expression | 산술식, `CASE`, `CAST`, `COALESCE`, alias | window expression, CTE, set operation, 복잡한 subquery |
| SQL function | 대표 문자열 함수, 대표 날짜 함수 | timestamp/time zone 심화, 정규식 SQL 함수 심화 |
| internal table source | `SELECT ... FROM @itab AS alias` 기초 | engine 최적화 튜닝, 복수 itab join 실무 심화 |
| 다음 연결 | CH20 OO와 CH22 CDS는 필요성만 예고 | 클래스 정의, 예외 클래스, CDS DDL 코드 |

> CH19의 목표는 "최신 문법을 많이 보여 주기"가 아니다. 목표는 SQL 문장을 읽을 때 DB 쪽 이름, ABAP 쪽 값, 결과 target, 계산 위치, 검증 지점을 분리해서 보는 습관을 만드는 것이다.

## 공식 문서 수동 확인 근거

Classic ABAP 및 ABAP SQL 관련 공식 문서는 자동 매칭하지 않고 `C:\ABAP_DOCU_HTML`에서 파일 존재와 주제를 수동 확인했다.

| 주제 | 확인 문서 | CH19 반영 포인트 |
|---|---|---|
| ABAP SQL 개요 | `abenabap_sql.htm` | ABAP SQL은 ABAP에서 DB 접근을 표현하고 DB별 SQL로 변환되는 계층이다. |
| host variable | `abenabap_sql_host_variables.htm` | ABAP data object는 SQL operand 위치에서 `@`로 escape한다. `@` 사용은 strict mode와 연결된다. |
| host expression | `abenabap_sql_host_expressions.htm` | `@( ... )`는 ABAP expression 결과를 SQL operand로 넘긴다. operand 타입에 맞는 변환이 가능해야 한다. |
| strict mode | `abenabap_sql_strict_modes.htm` | 새 ABAP SQL 문법은 더 엄격한 구문 검사를 유도한다. |
| SELECT list | `abapselect_list.htm` | modern SELECT list는 콤마 구분을 사용하고, 계산 컬럼에는 alias를 붙이는 습관이 중요하다. |
| SELECT target | `abapselect.htm`, `abapselect_additions.htm`, `abapselect_into_target.htm` | `INTO` 위치, `sy-subrc`·`sy-dbcnt`, inline target 타입 생성 규칙을 확인했다. |
| SQL expression | `abapsql_expr.htm` | SQL expression은 DB에서 계산된다. 같은 SELECT list의 alias 사용 제한을 주의한다. |
| CASE | `abensql_case.htm`, `abensql_simple_case.htm`, `abensql_searched_case.htm` | simple/searched case가 있으며 결과 타입 호환성이 필요하다. |
| CAST | `abensql_cast.htm`, `abensql_cast_rules.htm` | SQL operand를 명시 타입으로 변환한다. `CHAR( len )`처럼 길이 지정이 중요할 수 있다. |
| COALESCE | `abensql_coalesce.htm` | 첫 번째 non-null 값을 반환한다. ABAP initial 대체와 혼동하지 않는다. |
| 문자열 SQL 함수 | `abensql_functions_string.htm`, `abensql_string_func.htm` | `CONCAT`, `SUBSTRING`, `UPPER`, `LOWER`, `LENGTH` 등 대표 함수의 위치와 용도를 확인했다. |
| 날짜 SQL 함수 | `abenabap_sql_date_time_functions.htm`, `abensql_date_func.htm` | `DATS_ADD_DAYS`, `DATS_DAYS_BETWEEN` 등 DATS 기반 함수의 존재와 주의점을 확인했다. |
| `SELECT FROM @itab` | `abapselect_itab.htm`, `abenabap_sql_engine.htm`, `abensql_engine_restr.htm` | internal table을 data source로 사용할 수 있고, ABAP SQL engine 처리와 DB 임시 전송 제약이 있다. |

## CH19-L01 · Classic Open SQL과 Modern ABAP SQL 비교

### 왜 필요한가

CH08과 CH13에서 배운 SELECT는 classic 형태였다.

```abap
DATA lt_flight TYPE TABLE OF sflight.

SELECT carrid connid seatsmax
  FROM sflight
  INTO TABLE lt_flight
  WHERE carrid = lv_carr.
```

초반에는 이 문장이 단순해서 좋다. 그러나 코드가 길어지면 입문자는 바로 헷갈린다. `carrid`는 DB 컬럼인가? `lv_carr`는 ABAP 변수인가? `INTO TABLE lt_flight`는 SQL의 일부인가, ABAP 쪽 결과 그릇인가? 필드 사이 공백은 구분자인가, 그냥 띄어쓰기인가?

Modern ABAP SQL은 이 모호함을 줄인다.

```abap
SELECT carrid, connid, seatsmax
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_flight).
```

이제 읽는 방향이 더 선명해진다.

- `carrid, connid, seatsmax`: DB에서 가져올 컬럼 목록이다.
- `sflight`: DB 테이블이다.
- `@lv_carr`: ABAP 프로그램에 있는 변수 값을 SQL 조건에 넘긴다.
- `@DATA(lt_flight)`: SQL 결과를 ABAP 내부 테이블로 받는다.

### 무엇인가

Modern ABAP SQL은 classic Open SQL의 후속 스타일이다. 문법의 핵심은 세 가지다.

| 변화 | classic | modern | 의미 |
|---|---|---|---|
| 필드 목록 | `carrid connid seatsmax` | `carrid, connid, seatsmax` | 필드 경계를 콤마로 분명히 한다. |
| ABAP 값 | `WHERE carrid = lv_carr` | `WHERE carrid = @lv_carr` | ABAP 변수임을 `@`로 표시한다. |
| 결과 target | `INTO TABLE lt_flight` | `INTO TABLE @lt_flight` 또는 `@DATA(lt_flight)` | SQL 밖 ABAP target임을 표시한다. |

여기서 "modern"은 단지 짧게 쓰는 문법이 아니다. SQL 문장 안에 섞인 두 세계를 구분하는 표시 체계다.

```abap
DATA lv_carr TYPE sflight-carrid VALUE 'LH'.

SELECT carrid, connid, fldate, seatsmax
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_flight).
```

`carrid`는 DB 컬럼이고, `@lv_carr`는 ABAP 변수다. 같은 `carr`라는 글자가 들어가도 출처가 다르다. CH19에서는 이 출처를 계속 확인한다.

### 어떻게 확인하는가

처음 modern SELECT를 실행한 뒤에는 결과만 보지 말고 관찰 지점을 정해 본다.

1. `lt_flight`가 internal table로 만들어졌는가?
2. `lines( lt_flight )`는 몇 개인가?
3. `sy-subrc`는 `0`인가, `4`인가?
4. `sy-dbcnt`는 결과 행 수와 맞는가?
5. `lv_carr` 값을 `LH`, `AA`, `ZZ`로 바꿨을 때 결과가 어떻게 달라지는가?

예상 관찰표:

| `lv_carr` | 기대 결과 | `sy-subrc` | `sy-dbcnt` |
|---|---|---:|---:|
| `LH` | 해당 항공사 항공편이 있으면 결과 행 존재 | 0 | 결과 행 수 |
| `AA` | 데이터가 있으면 결과 행 존재 | 0 | 결과 행 수 |
| `ZZ` | 보통 결과 없음 | 4 | 0 |

Modern SQL이 되어도 SELECT의 기본 확인 방법은 사라지지 않는다. 결과 internal table, `sy-subrc`, `sy-dbcnt`는 계속 본다.

### 실수와 주의

첫째, 한 SELECT 안에서 classic 필드 목록과 modern 필드 목록을 섞지 않는다.

```abap
" 잘못된 혼합
SELECT carrid connid, seatsmax
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_bad).
```

둘째, DB 컬럼에는 `@`를 붙이지 않는다.

```abap
" 잘못된 사고: carrid는 DB 컬럼이다.
WHERE @carrid = @lv_carr
```

셋째, `INTO` 위치를 뒤쪽에 두는 습관을 들인다. 공식 문서상 `INTO`는 뒤쪽 clause로 다루는 흐름이 modern SQL과 잘 맞는다. 입문자는 처음부터 `SELECT list -> FROM -> WHERE -> INTO` 순서로 읽는 편이 좋다.

넷째, `SELECT *`를 modern 문법이라고 해서 무조건 쓰지 않는다. CH08에서 배운 것처럼 필요한 컬럼만 읽는 원칙은 계속 유효하다.

### 체험형 학습 설계

**실습 장치: Classic-to-Modern SQL Converter**

데이터:

- `sflight` 샘플 8행.
- 선택 변수 `lv_carr`: `LH`, `AA`, `ZZ`.
- classic SELECT와 modern SELECT를 좌우 비교한다.

버튼:

- `classic 실행`: 공백 필드 목록과 `@` 없는 classic 문장을 실행한다.
- `콤마 적용`: SELECT list를 `carrid, connid, seatsmax`로 바꾼다.
- `@ 적용`: `lv_carr`와 target 앞에 `@`를 붙인다.
- `INTO 뒤로 이동`: `INTO TABLE`을 마지막 clause로 정렬한다.
- `결과 비교`: classic과 modern 결과의 행 수, `sy-subrc`, `sy-dbcnt`를 비교한다.

상태:

- `sqlMode`: `classic`, `commaOnly`, `hostEscaped`, `modernComplete`.
- `selectedCarrid`: 현재 항공사 코드.
- `syntaxWarnings`: 콤마 누락, `@` 누락, DB 컬럼에 잘못 붙은 `@`.
- `systemFields`: `sy-subrc`, `sy-dbcnt`.

피드백:

- 콤마만 적용하고 `@`를 빼면 "SELECT list는 modern인데 ABAP 변수 경계가 아직 표시되지 않았습니다."라고 보여 준다.
- DB 컬럼에 `@`를 붙이면 "DB 컬럼은 SQL 쪽 이름입니다. `@`는 ABAP 값에만 붙입니다."라고 알려 준다.
- `ZZ`를 선택하면 "문법은 맞지만 데이터가 없으므로 `sy-subrc = 4`, `sy-dbcnt = 0`입니다."라고 보여 준다.

### 정리

CH19-L01의 핵심은 modern SQL을 "새 표기법"이 아니라 "경계 표시법"으로 이해하는 것이다. 콤마는 필드 경계, `@`는 ABAP 값 경계, `@DATA( )`는 결과 target 경계를 보여 준다. 실행 후에는 결과 internal table과 시스템 필드를 확인한다.

## CH19-L02 · `@` Host Variable과 Host Expression

### 왜 필요한가

SQL 문장은 데이터베이스에서 해석된다. 반면 ABAP 변수는 애플리케이션 서버의 ABAP 프로그램 메모리에 있다. `WHERE carrid = lv_carr`처럼 쓰면 사람은 `lv_carr`가 변수라고 짐작할 수 있지만, 문법만 보면 SQL 이름과 ABAP 이름이 섞여 있다.

Modern ABAP SQL은 ABAP 쪽 값을 SQL에 넣을 때 `@`를 붙인다.

```abap
DATA(lv_carr) = 'LH'.

SELECT *
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_flight).
```

`@lv_carr`는 "이 값은 DB 컬럼이 아니라 ABAP 프로그램의 변수입니다"라는 표시다.

### 무엇인가

Host variable은 SQL 문장 안에서 사용되는 ABAP data object다. 공식 문서 기준으로 named data object나 field symbol을 SQL operand 위치에 넣을 때 `@` escape character를 붙이는 방식이다.

```abap
DATA(lv_carr) = 'LH'.
DATA(lv_date) = sy-datum.

SELECT carrid, connid, fldate
  FROM sflight
  WHERE carrid = @lv_carr
    AND fldate >= @lv_date
  INTO TABLE @DATA(lt_flight).
```

여기서 `carrid`, `connid`, `fldate`는 DB 컬럼이고, `@lv_carr`, `@lv_date`는 ABAP 값이다.

Host expression은 변수 하나가 아니라 ABAP expression 결과를 SQL operand로 넘기는 형태다.

```abap
DATA(lv_base) = 100.

SELECT carrid, connid, seatsmax
  FROM sflight
  WHERE seatsmax > @( lv_base + 100 )
  INTO TABLE @DATA(lt_large).
```

`@( lv_base + 100 )`은 ABAP expression을 계산한 결과를 SQL 조건 값으로 넘긴다. 입문 단계에서는 산술식 정도로 이해하면 충분하다. CH20 이후의 메서드 호출이나 객체 표현식을 일부러 끌어오지 않는다.

### 어떻게 확인하는가

디버거에서 SELECT 직전과 직후를 나누어 본다.

SELECT 직전:

- `lv_carr` 값이 무엇인가?
- `lv_date` 값이 무엇인가?
- `lv_base + 100`의 결과가 어떤 값으로 예상되는가?

SELECT 직후:

- 조건에 맞는 행이 들어왔는가?
- `sy-subrc`, `sy-dbcnt`는 기대와 맞는가?
- 결과가 없을 때 변수 값이 잘못된 것인지, 데이터가 없는 것인지 구분했는가?

확인 예:

| 실험 | 조건 | 기대 |
|---|---|---|
| 변수 조건 | `WHERE carrid = @lv_carr` | `lv_carr` 값에 따라 결과 행이 달라진다. |
| 날짜 조건 | `WHERE fldate >= @lv_date` | 오늘 이후 날짜만 남는다. |
| host expression | `WHERE seatsmax > @( lv_base + 100 )` | 기준값보다 큰 좌석 수만 남는다. |

### 실수와 주의

첫째, 컬럼에는 `@`를 붙이지 않는다.

```abap
" 잘못된 예
WHERE @carrid = @lv_carr
```

둘째, 변수 하나와 expression을 구분한다.

```abap
WHERE carrid = @lv_carr          " 변수 하나
WHERE seatsmax > @( lv_base + 100 )  " ABAP expression
```

셋째, SQL expression과 host expression을 혼동하지 않는다. `CASE`, `COALESCE`, `SUBSTRING` 같은 SQL expression은 SQL 문장 안에서 DB가 처리한다. `@( lv_base + 100 )`은 ABAP expression 결과를 SQL에 넘긴다.

넷째, literal에는 `@`가 필요 없다.

```abap
WHERE carrid = 'LH'
```

`'LH'`는 literal이다. ABAP 변수명이 아니므로 `@`를 붙이지 않는다.

### 체험형 학습 설계

**실습 장치: Host Boundary Inspector**

데이터:

- DB 컬럼 카드: `sflight-carrid`, `sflight-fldate`, `sflight-seatsmax`.
- ABAP 값 카드: `lv_carr = 'LH'`, `lv_date = sy-datum`, `lv_base = 100`.
- SQL 조건 슬롯: 왼쪽 operand, 비교 연산자, 오른쪽 operand.

버튼:

- `DB 컬럼 넣기`: 선택한 DB 컬럼을 `@` 없이 조건에 넣는다.
- `ABAP 변수 넣기`: 선택한 ABAP 값 앞에 `@`를 붙인다.
- `식으로 넣기`: `@( lv_base + 100 )`을 만든다.
- `@ 제거`: host variable의 `@`를 빼서 오류를 확인한다.
- `출처 색상 보기`: DB 컬럼은 파란색, ABAP 값은 초록색으로 표시한다.

상태:

- `operandSource`: `dbColumn`, `hostVariable`, `hostExpression`, `literal`.
- `escapeStatus`: `required`, `present`, `missing`, `unnecessary`.
- `conversionStatus`: `ok`, `warning`, `error`.
- `resultPreview`: 예상 결과 행 수.

피드백:

- ABAP 값을 `@` 없이 넣으면 "ABAP 값은 host variable이므로 `@`가 필요합니다."라고 표시한다.
- DB 컬럼에 `@`를 붙이면 "컬럼은 DB 쪽 이름입니다. escape하지 않습니다."라고 표시한다.
- `@( )` 안의 식이 타입에 맞지 않는 경우 "SQL operand가 요구하는 타입으로 변환 가능한 값이어야 합니다."라고 안내한다.

### 정리

`@`는 SQL 문장 안에서 ABAP 값을 표시하는 경계 표시다. 변수 하나는 `@lv_value`, ABAP expression은 `@( ... )`로 쓴다. DB 컬럼과 literal에는 붙이지 않는다. CH19 전체에서 가장 많이 반복되는 실수는 `@`의 위치를 반대로 붙이는 것이다.

## CH19-L03 · `INTO TABLE @DATA( )` Inline Target

### 왜 필요한가

classic SELECT에서는 결과를 받을 그릇을 먼저 선언했다.

```abap
DATA lt_flight TYPE TABLE OF sflight.

SELECT *
  FROM sflight
  INTO TABLE lt_flight
  WHERE carrid = 'LH'.
```

이 방식은 타입이 명확해서 좋다. 그러나 짧은 조회에서 결과를 바로 출력하거나 한 번만 가공할 때는 선언과 사용 위치가 떨어져 흐름이 끊긴다. CH18에서 배운 inline declaration을 SELECT target에도 적용할 수 있다.

```abap
SELECT *
  FROM sflight
  WHERE carrid = 'LH'
  INTO TABLE @DATA(lt_flight).
```

SQL 문장 안이므로 `DATA( )`가 아니라 `@DATA( )`다.

### 무엇인가

`INTO TABLE @DATA(lt_result)`는 SELECT 결과를 받을 internal table을 그 자리에서 선언한다.

```abap
SELECT carrid, connid, seatsmax
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_flight).
```

이때 `lt_flight`의 행 구조는 SELECT list로 결정된다. 위 예시는 `carrid`, `connid`, `seatsmax` 세 컴포넌트를 가진 행의 standard internal table로 보면 된다.

단건 조회는 `INTO @DATA( )`로 받는다.

```abap
SELECT SINGLE carrid, carrname
  FROM scarr
  WHERE carrid = @lv_carr
  INTO @DATA(ls_carrier).
```

이 경우 `ls_carrier`는 `carrid`, `carrname` 컴포넌트를 가진 구조체다.

기존 변수를 사용할 수도 있다.

```abap
DATA lt_flight TYPE TABLE OF sflight.

SELECT *
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @lt_flight.
```

새로 만들면 `@DATA( )`, 이미 있으면 `@lt_flight`다.

### 어떻게 확인하는가

디버거나 결과 표에서 다음을 확인한다.

1. SELECT 전에는 `lt_flight`가 별도로 선언되어 있지 않아도 된다.
2. SELECT 후에는 `lt_flight`가 internal table로 생긴다.
3. `lt_flight`의 행에 SELECT list에 적은 컬럼만 들어 있는지 본다.
4. `lines( lt_flight )`와 `sy-dbcnt`가 맞는지 본다.
5. `SELECT SINGLE`일 때 `ls_carrier` 구조체의 값과 `sy-subrc`를 함께 본다.

특히 계산 컬럼을 만들 때는 alias가 중요하다.

```abap
SELECT carrid,
       seatsmax - seatsocc AS free_seats
  FROM sflight
  INTO TABLE @DATA(lt_free).
```

`free_seats`처럼 이름을 붙여야 결과 구조를 읽기 쉽다.

### 실수와 주의

첫째, SQL 안에서는 `DATA(lt)`가 아니라 `@DATA(lt)`다.

```abap
" 잘못된 예
INTO TABLE DATA(lt_flight)

" 올바른 예
INTO TABLE @DATA(lt_flight)
```

둘째, 이미 선언된 변수명에 `@DATA( )`를 다시 쓰지 않는다. 이미 있으면 `@lt_flight`로 받는다.

셋째, `@DATA( )`가 항상 최선은 아니다. 결과 internal table을 key 기반으로 자주 읽어야 하거나 여러 모듈에서 공유해야 한다면 명시 타입 선언이 낫다.

넷째, 계산 컬럼에는 alias를 붙인다. alias가 없으면 결과 구조가 읽기 어렵고, 후속 ABAP 코드에서 어떤 컴포넌트인지 혼란스러워진다.

### 체험형 학습 설계

**실습 장치: SELECT Target Type Viewer**

데이터:

- SELECT list 옵션: `*`, `carrid, connid`, `carrid, seatsmax - seatsocc AS free_seats`.
- target 옵션: 기존 선언 target, `@DATA(lt_result)`, 단건 `@DATA(ls_result)`.
- 결과 shape 미리보기.

버튼:

- `SELECT * 실행`: 원본 테이블 전체 구조를 target으로 만든다.
- `필드 선택 실행`: 선택한 컬럼만 가진 결과 구조를 만든다.
- `계산 컬럼 추가`: `free_seats` alias가 있는 계산 컬럼을 추가한다.
- `alias 제거`: alias 없는 계산 컬럼의 문제를 보여 준다.
- `target 비교`: 명시 선언 target과 inline target의 장단점을 비교한다.

상태:

- `targetKind`: `existingTable`, `inlineTable`, `inlineStructure`.
- `rowShape`: 결과 행 컴포넌트 목록.
- `tableKey`: inline table의 key 설명.
- `aliasStatus`: `clear`, `missing`, `duplicate`.
- `systemFields`: `sy-subrc`, `sy-dbcnt`.

피드백:

- `@DATA` 앞의 `@`를 빼면 "SQL target 위치에서는 host target이므로 `@DATA( )`를 씁니다."라고 표시한다.
- 계산 컬럼 alias를 빼면 "후속 ABAP 코드가 이 컬럼을 읽기 어렵습니다. `AS free_seats`처럼 이름을 붙입니다."라고 안내한다.
- key 기반 후속 조회를 선택하면 "inline target은 빠른 실습에는 좋지만, 반복 key 조회에는 명시 table type이 더 적합할 수 있습니다."라고 설명한다.

### 정리

`@DATA( )`는 SELECT 결과 target을 사용 위치에 가깝게 선언하는 도구다. 짧고 명확한 조회에는 좋지만, 타입과 key를 정교하게 설계해야 하는 경우에는 명시 선언이 더 낫다. SQL 안에서는 항상 `@DATA( )` 형태라는 점을 기억한다.

## CH19-L04 · SQL Expression: `CASE`, `CAST`, `COALESCE`

### 왜 필요한가

classic 방식에서는 데이터를 읽은 뒤 ABAP에서 다시 LOOP를 돌며 값을 가공하는 일이 많았다.

```abap
LOOP AT lt_flight INTO DATA(ls_flight).
  IF ls_flight-seatsocc >= ls_flight-seatsmax.
    ls_flight-status = 'FULL'.
  ELSE.
    ls_flight-status = 'OPEN'.
  ENDIF.
ENDLOOP.
```

하지만 어떤 계산은 DB가 결과를 만들 때 같이 처리해도 된다. "좌석이 꽉 찼는가", "null이면 대체값을 보여 줄 것인가", "숫자를 문자로 바꿔 표시할 것인가"처럼 결과 컬럼을 만드는 단순 가공이 그렇다.

Modern ABAP SQL은 SELECT list 안에서 SQL expression을 사용할 수 있다.

### 무엇인가

SQL expression은 SQL 문장 안에서 계산되는 표현식이다. ABAP의 `IF`나 string template가 아니라 DB 쪽 SELECT 결과를 만드는 계산식이다.

#### CASE

조건에 따라 결과 값을 다르게 만든다.

```abap
SELECT carrid, connid,
       seatsocc,
       seatsmax,
       CASE
         WHEN seatsocc >= seatsmax THEN 'FULL'
         ELSE 'OPEN'
       END AS seat_status
  FROM sflight
  INTO TABLE @DATA(lt_flight).
```

`seat_status`는 DB에서 계산되어 결과 internal table의 컬럼으로 넘어온다.

#### CAST

SQL 값의 타입을 명시적으로 바꾼다.

```abap
SELECT carrid,
       CAST( seatsmax AS CHAR( 5 ) ) AS seats_text
  FROM sflight
  INTO TABLE @DATA(lt_text).
```

입문자는 `CAST`를 "결과 컬럼의 모양을 명시적으로 맞추는 도구"로 이해하면 된다.

#### COALESCE

DB null을 대체한다.

```abap
SELECT c~carrid,
       COALESCE( p~cityto, 'N/A' ) AS destination
  FROM scarr AS c
  LEFT OUTER JOIN spfli AS p
    ON p~carrid = c~carrid
  INTO TABLE @DATA(lt_route).
```

`COALESCE`는 ABAP initial을 바꾸는 함수가 아니다. outer join 등에서 생길 수 있는 DB null을 대체한다.

### 어떻게 확인하는가

확인은 "DB에서 계산된 결과 컬럼"을 중심으로 한다.

| 확인 항목 | 기대 |
|---|---|
| `seat_status` | `seatsocc >= seatsmax`이면 `FULL`, 아니면 `OPEN` |
| `seats_text` | 숫자 좌석 수가 문자 형태로 표시됨 |
| `destination` | join 결과가 null이면 `N/A` |
| alias | 계산 컬럼을 ABAP에서 `ls_row-seat_status`처럼 읽을 수 있음 |

또한 `COALESCE`는 반드시 null 케이스를 만들어 확인해야 한다. 예매나 연결 데이터가 없는 왼쪽 테이블 행을 남기는 outer join을 만들어야 효과가 보인다.

### 실수와 주의

첫째, 계산 컬럼에는 alias를 붙인다.

```abap
CASE WHEN seatsocc >= seatsmax THEN 'FULL' ELSE 'OPEN' END AS seat_status
```

둘째, 같은 SELECT list에서 만든 alias를 바로 다른 expression의 operand로 쓰려고 하지 않는다. 복잡하면 expression을 반복하거나 ABAP 후속 단계로 나눈다.

셋째, `COALESCE`와 ABAP initial을 혼동하지 않는다. DB null은 "값이 없음"이고, ABAP initial은 타입별 초기값이다.

넷째, 복잡한 업무 규칙을 모두 SQL expression에 밀어 넣지 않는다. SQL expression은 단순 결과 컬럼 계산에 적합하다. 승인 규칙, 메시지, 사용자 상호작용, 여러 단계 상태 변경은 ABAP 코드나 후속 구조화 주제로 넘긴다.

### 체험형 학습 설계

**실습 장치: SQL Expression Lab**

데이터:

- `sflight`: `carrid`, `connid`, `seatsocc`, `seatsmax`.
- outer join용 보조 테이블: 일부 항공사에만 노선 값이 있는 샘플.
- null 발생 케이스 1개 이상.

버튼:

- `CASE 추가`: 좌석 상태 컬럼을 만든다.
- `CAST 적용`: 숫자 좌석 수를 문자 컬럼으로 만든다.
- `COALESCE 적용`: null destination을 `N/A`로 바꾼다.
- `alias 제거`: 계산 컬럼 이름이 없을 때 후속 코드가 어려워지는 모습을 보여 준다.
- `ABAP LOOP와 비교`: 같은 상태 계산을 ABAP LOOP로 했을 때와 SQL expression으로 했을 때를 비교한다.

상태:

- `expressionKind`: `case`, `cast`, `coalesce`.
- `calculationPlace`: `database`, `abapLoop`.
- `nullRows`: null이 발생한 행 목록.
- `aliasStatus`: `ok`, `missing`, `reusedTooEarly`.
- `resultPreview`: 계산 컬럼 포함 결과.

피드백:

- `COALESCE`를 켰는데 null 행이 없으면 "대체할 null이 없으므로 결과가 달라지지 않습니다."라고 표시한다.
- alias를 빼면 "inline target에서 계산 컬럼을 읽기 어려워집니다. `AS`로 이름을 주세요."라고 안내한다.
- 너무 긴 `CASE`를 만들면 "문법은 가능하지만 업무 규칙이 과도하게 SQL에 들어가고 있습니다."라고 경고한다.

### 정리

SQL expression은 DB가 결과를 만들 때 같이 계산하는 도구다. `CASE`는 조건 컬럼, `CAST`는 타입 변환, `COALESCE`는 DB null 대체에 쓴다. 계산 컬럼에는 alias를 붙이고, 복잡한 업무 규칙을 SQL에 과적하지 않는다.

## CH19-L05 · SQL String / Date Function

### 왜 필요한가

조회 결과를 화면에 보여 주려면 문자열을 붙이거나, 일부만 잘라 보거나, 날짜를 계산해야 할 때가 있다. ABAP에서도 문자열 함수와 날짜 계산을 할 수 있지만, 단순한 결과 컬럼 가공이라면 SQL에서 바로 계산해 받을 수 있다.

예를 들어 출발 도시를 대문자로 받고, 연결편 번호 앞자리를 잘라 보고, 비행일 기준 7일 뒤 날짜를 같이 받고 싶을 수 있다.

### 무엇인가

ABAP SQL은 문자열 함수와 날짜 함수를 제공한다. CH19에서는 자주 보는 대표 함수만 다룬다.

#### 문자열 함수

```abap
SELECT carrid,
       connid,
       CONCAT( carrid, connid ) AS route_key,
       SUBSTRING( connid, 1, 2 ) AS conn_prefix,
       UPPER( cityfrom ) AS city_from_upper
  FROM spfli
  INTO TABLE @DATA(lt_route).
```

대표적으로 다음을 볼 수 있다.

| 함수 | 의미 | 예 |
|---|---|---|
| `CONCAT` | 문자열 결합 | 항공사 코드와 연결편 번호를 붙임 |
| `SUBSTRING` | 문자열 일부 추출 | 연결편 번호 앞 2자리 |
| `UPPER` / `LOWER` | 대문자·소문자 변환 | 도시명 표시 통일 |
| `LENGTH` | 문자열 길이 | 코드 길이 확인 |

#### 날짜 함수

```abap
SELECT carrid, connid, fldate,
       DATS_ADD_DAYS( fldate, 7 ) AS due_date
  FROM sflight
  INTO TABLE @DATA(lt_due).
```

날짜 차이도 계산할 수 있다.

```abap
SELECT carrid, connid, fldate,
       DATS_DAYS_BETWEEN( @sy-datum, fldate ) AS days_left
  FROM sflight
  INTO TABLE @DATA(lt_days).
```

시스템 릴리스나 DB별 지원 차이가 있을 수 있으므로, 실무에서는 사용하는 시스템의 ABAP Keyword Documentation과 syntax check를 기준으로 확인한다.

### 어떻게 확인하는가

함수는 눈으로 예상 가능한 작은 데이터로 확인한다.

| 원본 | 함수 | 기대 |
|---|---|---|
| `carrid = 'LH'`, `connid = '0400'` | `CONCAT` | `LH0400` |
| `connid = '0400'` | `SUBSTRING( connid, 1, 2 )` | `04` |
| `cityfrom = 'seoul'` | `UPPER` | `SEOUL` |
| `fldate = 20260703` | `DATS_ADD_DAYS( fldate, 7 )` | 7일 뒤 날짜 |

날짜 함수는 특히 유효한 DATS 값인지 확인한다. 날짜처럼 보이는 문자와 실제 DATS 타입 값은 다르게 다뤄질 수 있다.

### 실수와 주의

첫째, SQL 함수와 ABAP 함수를 같은 것으로 보지 않는다. 이름이 비슷해도 실행 위치와 인자 규칙이 다를 수 있다.

둘째, 함수 결과에도 alias를 붙인다.

```abap
SUBSTRING( connid, 1, 2 ) AS conn_prefix
```

셋째, 모든 표시 가공을 SQL로 몰아넣지 않는다. 단순 결과 컬럼은 SQL에서 처리할 수 있지만, 복잡한 문장 조립은 CH18의 string template를 사용한 ABAP 출력이 더 읽기 쉬울 수 있다.

넷째, 날짜 함수는 릴리스 차이를 확인한다. 교육 자료에서는 대표 함수를 보여 주되, 실제 시스템에서는 syntax check와 F1 문서를 기준으로 삼는다.

### 체험형 학습 설계

**실습 장치: SQL Function Workbench**

데이터:

- `spfli` 샘플: `carrid`, `connid`, `cityfrom`, `cityto`.
- `sflight` 샘플: `fldate`.
- 날짜 입력: 기준일, 더할 일수.

버튼:

- `CONCAT 실행`: `carrid + connid` 결과를 보여 준다.
- `SUBSTRING 실행`: 시작 위치와 길이를 조절해 결과를 본다.
- `UPPER/LOWER 전환`: 도시명 표시를 바꾼다.
- `DATS_ADD_DAYS 실행`: 날짜에 n일을 더한다.
- `ABAP 처리와 비교`: 같은 결과를 ABAP 문자열 함수나 string template로 만들 때와 비교한다.

상태:

- `functionName`: 선택 함수.
- `inputValue`: 현재 입력값.
- `argumentStatus`: 정상, 위치 오류, 길이 오류, 날짜 오류.
- `resultColumn`: 계산된 결과 컬럼.
- `executionPlace`: SQL, ABAP.

피드백:

- `SUBSTRING` 범위가 이상하면 "시작 위치와 길이가 원본 문자열 범위 안에 있는지 확인하세요."라고 표시한다.
- 날짜 값이 유효하지 않으면 "DATS 함수는 유효한 날짜 값을 전제로 합니다."라고 안내한다.
- 표시 문장이 너무 복잡해지면 "이 정도 조립은 SQL보다 ABAP string template가 더 읽기 쉬울 수 있습니다."라고 비교한다.

### 정리

SQL string/date function은 조회 결과를 단순 가공할 때 유용하다. 문자열 결합, 일부 추출, 대소문자 변환, 날짜 더하기 같은 작업을 SELECT 결과 컬럼으로 만들 수 있다. 단, 함수마다 인자 규칙과 릴리스 지원 범위를 확인하고, 복잡한 표시 로직은 ABAP 쪽으로 남겨 둔다.

## CH19-L06 · `SELECT FROM @itab` 기초

### 왜 필요한가

지금까지 SELECT의 source는 DB 테이블이었다. 그런데 프로그램 안에는 이미 internal table이 있을 수 있다. 예를 들어 DB에서 항공편 200행을 가져온 뒤, 그중 일부를 다시 필터링하거나 항공사별로 요약해서 보여 주고 싶을 수 있다.

물론 `LOOP AT`과 `SORT`, `COLLECT`, `READ TABLE`로 처리할 수도 있다. CH19에서는 이미 메모리에 있는 internal table을 SQL 문법으로 다시 다루는 방법을 배운다.

### 무엇인가

`SELECT FROM @itab`은 ABAP internal table을 ABAP SQL의 data source로 사용하는 문법이다.

```abap
SELECT carrid, connid, seatsocc
  FROM @lt_flight AS f
  WHERE f~carrid = @lv_carr
  ORDER BY f~connid
  INTO TABLE @DATA(lt_filtered).
```

`@lt_flight`는 ABAP 메모리에 있는 internal table이다. 그래서 `@`가 필요하다. `AS f`는 SQL 문장 안에서 그 source를 부르는 alias다.

집계도 기초 수준에서는 이렇게 볼 수 있다.

```abap
SELECT f~carrid,
       SUM( f~seatsocc ) AS total_occ
  FROM @lt_flight AS f
  GROUP BY f~carrid
  INTO TABLE @DATA(lt_sum).
```

중요한 점은 "DB에 있는 데이터를 일부러 모두 가져와서 다시 `SELECT FROM @itab`으로 처리하라"는 뜻이 아니라는 것이다. 이미 메모리에 있는 적당한 규모의 데이터를 SQL 문법으로 재가공할 때 쓰는 선택지다.

### 어떻게 확인하는가

작은 원본 internal table을 먼저 만든다.

| carrid | connid | seatsocc |
|---|---|---:|
| LH | 0400 | 120 |
| LH | 0401 | 80 |
| AA | 0017 | 50 |

필터링:

```abap
DATA(lv_carr) = 'LH'.

SELECT carrid, connid, seatsocc
  FROM @lt_flight AS f
  WHERE f~carrid = @lv_carr
  ORDER BY f~connid
  INTO TABLE @DATA(lt_lh).
```

기대 결과는 `LH` 2행이다. `sy-subrc = 0`, `sy-dbcnt = 2`를 기대한다.

집계:

```abap
SELECT f~carrid,
       SUM( f~seatsocc ) AS total_occ
  FROM @lt_flight AS f
  GROUP BY f~carrid
  INTO TABLE @DATA(lt_sum).
```

기대 결과:

| carrid | total_occ |
|---|---:|
| AA | 50 |
| LH | 200 |

### 실수와 주의

첫째, `FROM lt_flight`가 아니라 `FROM @lt_flight`다. internal table은 ABAP host variable이다.

둘째, alias를 붙이는 습관을 들인다. `FROM @lt_flight AS f`라고 쓰면 `f~carrid`처럼 출처가 분명해진다.

셋째, 대량 DB 처리의 대체재로 남용하지 않는다. DB에 있는 수십만 행을 먼저 모두 가져온 뒤 internal table SELECT로 집계하는 것은 보통 나쁜 방향이다. 가능하면 DB에서 조건과 집계를 처리한다.

넷째, 공식 문서 기준으로 `SELECT FROM @itab`은 ABAP SQL engine이 처리할 수 있는 경우와 DB 임시 전송이 필요할 수 있는 경우가 나뉜다. 입문자는 경고를 무시하거나 pragma로 숨기기 전에 "왜 이 경고가 나왔는가"를 먼저 확인해야 한다.

다섯째, elementary line type의 internal table은 컬럼 이름이 `table_line`처럼 다뤄질 수 있다. CH19에서는 구조화된 행 타입으로 시작하는 편이 안전하다.

### 체험형 학습 설계

**실습 장치: Internal Table SQL Console**

데이터:

- `lt_flight` 3~6행.
- 선택 변수 `lv_carr`.
- 처리 모드: `LOOP`, `SELECT FROM @itab`, `DB SELECT`.

버튼:

- `원본 internal table 보기`: 메모리의 `lt_flight`를 표로 보여 준다.
- `WHERE 필터 실행`: `FROM @lt_flight`로 특정 항공사만 고른다.
- `ORDER BY 실행`: 연결편 번호 순서를 바꿔 본다.
- `GROUP BY 실행`: 항공사별 탑승 좌석 합계를 만든다.
- `LOOP와 비교`: 같은 결과를 ABAP LOOP로 만든 코드와 나란히 보여 준다.
- `엔진 경고 보기`: ABAP SQL engine 처리와 DB 임시 전송 가능성을 설명한다.

상태:

- `sourceKind`: `dbTable`, `internalTable`.
- `enginePath`: `abapSqlEngine`, `temporaryDbTable`, `unsupported`.
- `resultRows`: 결과 행 수.
- `systemFields`: `sy-subrc`, `sy-dbcnt`.
- `warningVisible`: 경고 없음, 경고 있음, 숨김 시도.

피드백:

- `@`를 빼면 "internal table도 ABAP 변수이므로 `@`가 필요합니다."라고 표시한다.
- 대량 데이터 경고를 누르면 "DB에 있는 데이터를 모두 가져와 메모리에서 다시 처리하는 용도가 아닙니다."라고 안내한다.
- pragma로 숨기려 하면 "먼저 처리 경로를 이해한 뒤에만 경고 억제를 판단합니다."라고 표시한다.

### 정리

`SELECT FROM @itab`은 internal table을 SQL data source처럼 다루는 문법이다. 이미 메모리에 있는 데이터를 SQL식으로 필터링, 정렬, 간단히 집계할 때 유용하다. 그러나 DB 대량 처리의 우회로가 아니며, engine 처리와 성능 경고를 이해해야 한다.

## CH19-L07 · ABAP SQL 정리: 다음 단계로

### 왜 필요한가

CH19의 마지막 이론 레슨에서는 문법을 더 늘리기보다 선택 기준을 정리해야 한다. 입문자가 실무 코드에서 막히는 이유는 문법을 몰라서만이 아니다. "이 처리를 SQL에 둘까, ABAP에 둘까?", "`@DATA`로 받을까, 명시 타입으로 받을까?", "이건 CH19에서 해도 되는가, 다음 장으로 넘겨야 하는가?" 같은 판단에서 막힌다.

CH19까지의 흐름은 다음과 같다.

- CH08: 단일 테이블을 classic SELECT로 읽었다.
- CH12: selection screen의 조건을 SQL에 연결했다.
- CH13: JOIN과 집계로 여러 테이블을 읽었다.
- CH18: SQL 바깥 ABAP 문법을 modern으로 정리했다.
- CH19: SELECT 자체를 modern ABAP SQL로 정리했다.

### 무엇인가

CH19 도구를 선택 기준으로 정리한다.

| 상황 | 선택 | 이유 |
|---|---|---|
| ABAP 변수 값을 SQL 조건에 넣는다 | `@lv_value` | DB 컬럼과 ABAP 값의 경계를 표시한다. |
| ABAP expression 결과를 조건에 넣는다 | `@( lv_base + 100 )` | 변수 하나가 아닌 expression 결과를 넘긴다. |
| SELECT list가 여러 컬럼이다 | 콤마 필드 목록 | 필드 경계가 명확하고 modern strict 흐름과 맞다. |
| 짧은 결과를 바로 쓴다 | `INTO TABLE @DATA(lt)` | target 선언을 SELECT 가까이에 둔다. |
| 결과를 key로 반복 조회한다 | 명시 table type 고려 | key 설계가 필요한 경우 inline target만으로 부족할 수 있다. |
| 단순 상태 컬럼이 필요하다 | SQL `CASE` | DB에서 결과 컬럼으로 계산한다. |
| outer join null을 표시값으로 바꾼다 | `COALESCE` | DB null을 대체한다. |
| 문자열·날짜를 단순 가공한다 | SQL string/date function | 조회 결과 컬럼으로 바로 받는다. |
| 이미 메모리에 있는 데이터를 다시 요약한다 | `SELECT FROM @itab` | internal table을 SQL source로 사용한다. |
| 복잡한 업무 규칙·상태 변경을 한다 | ABAP 코드 또는 후속 구조화 | SQL expression에 과적하지 않는다. |

### 어떻게 확인하는가

학습 확인은 짧은 판단 문제로 한다.

1. "사용자가 입력한 항공사 코드 `p_carrid`와 같은 행만 읽는다."  
   기대 답: `WHERE carrid = @p_carrid`

2. "좌석이 꽉 찼으면 `FULL`, 아니면 `OPEN` 결과 컬럼을 만든다."  
   기대 답: SQL `CASE ... END AS seat_status`

3. "결과 internal table을 이후 `READ TABLE ... WITH KEY`로 여러 번 읽는다."  
   기대 답: `@DATA( )`도 가능하지만, 명시 table type과 key 설계를 고려한다.

4. "이미 가져온 200행 internal table을 항공사별로 합산한다."  
   기대 답: `SELECT FROM @itab` 또는 classic internal table 처리 모두 가능하다. 목적과 가독성을 비교한다.

5. "재사용 가능한 view를 만들고 UI annotation을 붙인다."  
   기대 답: CH22 CDS 범위다. CH19에서는 예고만 한다.

6. "조회 코드를 클래스로 묶고 예외 클래스를 설계한다."  
   기대 답: CH20 OO 범위다. CH19에서는 코드로 앞당기지 않는다.

### 실수와 주의

첫째, 한 SELECT 안에서 classic과 modern을 섞지 않는다. 콤마 필드 목록을 쓰면 host variable도 `@`로 표시한다.

둘째, `@DATA( )`를 남용하지 않는다. 짧은 조회에는 좋지만, 타입 공유와 key 설계가 중요하면 명시 타입이 더 낫다.

셋째, SQL에 업무 로직을 과도하게 넣지 않는다. SQL expression은 단순 결과 컬럼 계산에 적합하다.

넷째, `SELECT FROM @itab`을 DB 최적화 도구처럼 오해하지 않는다. 이미 메모리에 있는 데이터를 재가공하는 선택지다.

다섯째, CH20과 CH22를 코드로 앞당기지 않는다. OO와 CDS는 다음 단계의 필요성으로만 연결한다.

### 체험형 학습 설계

**실습 장치: SQL Decision Cards**

데이터:

- 상황 카드 12개: 사용자 입력 조건, 결과 target, 상태 컬럼, null 대체, 날짜 계산, internal table 재가공, key 기반 후속 조회, CDS 재사용 요구, OO 구조화 요구 등.
- 도구 카드: `@`, `@( )`, 콤마 SELECT list, `@DATA`, 명시 target, `CASE`, `COALESCE`, SQL function, `SELECT FROM @itab`, ABAP LOOP, CH20, CH22.

버튼:

- `상황 뽑기`: 현재 요구사항을 보여 준다.
- `도구 선택`: 학습자가 도구 카드를 고른다.
- `정답 확인`: 선택이 맞는지 이유를 보여 준다.
- `경계 확인`: CH19 가능, CH20 이후, CH22 이후, Track-2 이후를 표시한다.
- `대안 보기`: SQL 처리와 ABAP 처리의 장단점을 비교한다.

상태:

- `scenario`: 현재 상황.
- `selectedTool`: 선택한 도구.
- `scopeLevel`: `CH19`, `CH20`, `CH22`, `Track2`, `overloadedSql`.
- `feedback`: 문법 가능 여부와 설계 적합성.

피드백:

- 맞으면 "DB가 잘하는 집합 처리라 SQL이 적합합니다."처럼 이유 중심으로 설명한다.
- 틀리면 "문법적으로 가능"과 "좋은 설계인지"를 분리해 알려 준다.
- CH20/CH22 카드를 고르면 "예고는 가능하지만 코드 정의는 아직 다음 장입니다."라고 표시한다.

### 정리

CH19를 마치면 modern SQL 문법을 외우는 것보다, SQL과 ABAP의 책임을 나누는 눈이 생겨야 한다. `@`로 경계를 표시하고, `@DATA`로 가까운 target을 만들고, SQL expression/function으로 단순 결과 컬럼을 만들고, `SELECT FROM @itab`으로 메모리 데이터를 SQL식으로 다룬다. 복잡한 구조화와 재사용 모델은 CH20, CH22로 넘긴다.

## CH19-L08 · 실습: 콘서트앱 모던 SQL

### 왜 필요한가

마지막 레슨은 CH12와 CH13에서 만든 콘서트 예매 조회를 CH19 문법으로 현대화하는 실습이다. 목적은 콘서트 앱 전체를 다시 만드는 것이 아니다. 이미 배운 조회를 `@`, 콤마, `@DATA`, SQL expression으로 안전하게 바꾸는 것이다.

이번 실습에서 바꾸는 것:

- selection range `s_conc`를 `@s_conc`로 SQL에 넘긴다.
- SELECT list를 콤마로 구분한다.
- 결과 target을 `@DATA( )`로 받는다.
- 집계 결과와 상태 컬럼에 alias를 붙인다.
- 예매 없는 공연의 null 합계를 `COALESCE`로 0 처리한다.
- 단순 매진 상태를 SQL `CASE`로 계산한다.

이번 실습에서 하지 않는 것:

- 예매 저장용 데이터 변경문
- 트랜잭션 확정·취소 제어문
- Lock Object
- OO manager class
- CDS/RAP 모델링
- 예외 클래스 설계

### 무엇인가

먼저 CH12식 조회를 modern SQL로 바꾼다.

```abap
" classic
DATA lt_book TYPE TABLE OF zbooking.

SELECT *
  FROM zbooking
  INTO TABLE lt_book
  WHERE concert_id IN s_conc.

" modern
SELECT *
  FROM zbooking
  WHERE concert_id IN @s_conc
  INTO TABLE @DATA(lt_book).
```

`s_conc`는 selection screen에서 만들어진 range table이다. SQL 문장 안에서는 ABAP 쪽 값이므로 `@s_conc`로 표시한다.

공연별 예약 좌석 집계도 modern SQL로 정리한다.

```abap
SELECT c~concert_id,
       c~artist,
       c~capacity,
       COALESCE( SUM( b~seats ), 0 ) AS booked,
       CASE
         WHEN COALESCE( SUM( b~seats ), 0 ) >= c~capacity THEN 'FULL'
         ELSE 'OPEN'
       END AS seat_status
  FROM zconcert AS c
  LEFT OUTER JOIN zbooking AS b
    ON  b~concert_id = c~concert_id
    AND b~status <> 'C'
  WHERE c~concert_id IN @s_conc
  GROUP BY c~concert_id, c~artist, c~capacity
  INTO TABLE @DATA(lt_stat).
```

여기서 취소 상태 `C`를 제외하는 조건을 `ON`에 둔 이유가 중요하다. 예매가 없는 공연도 결과에 남기려면 오른쪽 테이블 조건을 `WHERE`에 두는 것보다 join 조건으로 두는 편이 안전하다. `WHERE b~status <> 'C'`로 옮기면 outer join 결과에서 오른쪽 값이 null인 행이 사라질 수 있다.

결과 출력은 CH18의 string template로 확인할 수 있다.

```abap
LOOP AT lt_stat INTO DATA(ls_stat).
  WRITE: / |{ ls_stat-concert_id } { ls_stat-artist } 예약 { ls_stat-booked }/{ ls_stat-capacity } - { ls_stat-seat_status }|.
ENDLOOP.
```

### 어떻게 확인하는가

실습 데이터:

`zconcert`

| concert_id | artist | capacity |
|---|---|---:|
| C001 | 정훈영 Band | 100 |
| C002 | ABAP Trio | 50 |
| C003 | UI5 Night | 80 |

`zbooking`

| booking_id | concert_id | customer | seats | status |
|---|---|---|---:|---|
| B001 | C001 | 정훈영 | 2 | N |
| B002 | C001 | 성춘향 | 3 | N |
| B003 | C001 | 이몽룡 | 1 | C |
| B004 | C002 | 손흥민 | 50 | N |

`s_conc`가 C001, C002, C003을 포함하면 기대 결과는 다음이다.

| concert_id | booked | seat_status | 이유 |
|---|---:|---|---|
| C001 | 5 | OPEN | 취소 `C` 1건은 제외하고 2+3만 합산 |
| C002 | 50 | FULL | 예약 좌석이 capacity와 같음 |
| C003 | 0 | OPEN | 예매가 없어 SUM 결과가 null일 수 있으므로 0으로 대체 |

실행 후 확인할 것:

1. `lt_book` 행 수와 `sy-dbcnt`.
2. `lt_stat`의 공연별 `booked`.
3. `seat_status`가 capacity 기준과 맞는지.
4. C003처럼 예매 없는 공연이 결과에서 사라지지 않았는지.
5. 취소 상태 `C`가 합계에서 제외됐는지.
6. `COALESCE`를 뺐을 때 C003의 booked가 어떻게 달라지는지.

### 실수와 주의

첫째, `s_conc` 앞에 `@`를 붙인다. range table도 ABAP host variable이다.

둘째, SELECT list와 `GROUP BY` 목록은 콤마 구분을 일관되게 사용한다.

셋째, outer join에서 오른쪽 테이블 조건을 `WHERE`로 옮길 때 결과가 바뀌는지 반드시 확인한다.

넷째, `SUM( b~seats ) AS booked` alias를 같은 SELECT list의 `CASE`에서 바로 쓰지 않는다. 그래서 예제에서는 `COALESCE( SUM( b~seats ), 0 )`를 `CASE` 안에서 반복한다.

다섯째, 이 장에서는 읽기와 계산만 한다. 예매 저장, 취소 저장, 트랜잭션 제어는 CH24 이후 범위다.

### 체험형 학습 설계

**실습 장치: Concert Modern SQL Lab**

데이터:

- `zconcert` 3행: 정상, 매진, 예매 없음 케이스.
- `zbooking` 4~6행: 정상 예매, 취소 예매, 매진 예매.
- `s_conc`: 전체, C001만, C003만, 없는 공연ID.

버튼:

- `classic 조회 실행`: 기존 CH12/CH13 스타일 결과를 보여 준다.
- `@ 적용`: `s_conc`와 target에 `@`를 붙인다.
- `콤마 적용`: SELECT list와 GROUP BY를 modern 목록으로 바꾼다.
- `@DATA target 적용`: 결과 target을 inline으로 바꾼다.
- `CASE 상태 추가`: `seat_status` 컬럼을 만든다.
- `COALESCE 켜기`: 예매 없는 공연의 booked를 0으로 표시한다.
- `ON/WHERE 비교`: 취소 제외 조건을 `ON`에 둘 때와 `WHERE`에 둘 때 결과 차이를 보여 준다.

상태:

- `selectedConcertRange`: 현재 selection range.
- `joinConditionPlacement`: `ON`, `WHERE`.
- `coalesceEnabled`: true, false.
- `resultRows`: 공연별 집계 결과.
- `lostConcerts`: outer join 의도와 다르게 사라진 공연.
- `systemFields`: `sy-subrc`, `sy-dbcnt`.
- `boundaryWarnings`: DML, OO, CDS, RAP 선노출 여부.

피드백:

- C003이 유지되면 "예매가 없어도 공연 master 행은 유지됩니다."라고 표시한다.
- 조건을 `WHERE b~status <> 'C'`로 옮겨 C003이 사라지면 "outer join 후 WHERE가 오른쪽 null 행을 제거할 수 있습니다."라고 설명한다.
- alias를 `CASE` 안에 넣으려 하면 "같은 SELECT list의 alias를 다른 SQL expression operand로 바로 쓰지 않는 방향으로 작성합니다."라고 알려 준다.
- `@` 누락 시 "selection range도 ABAP host variable입니다."라고 강조한다.

### 정리

CH19-L08은 modern SQL 문법을 콘서트 예매 조회에 적용하는 실습이다. 문법상 핵심은 `@`, 콤마, `@DATA`, `CASE`, `COALESCE`지만, 더 중요한 것은 업무 결과 검증이다. 취소 예매가 빠졌는지, 예매 없는 공연이 남았는지, `sy-dbcnt`와 결과 행 수가 맞는지 확인해야 한다.

## CH19 최종 정리

| 핵심 질문 | 답 |
|---|---|
| `@`는 왜 쓰는가? | SQL 문장 안에서 ABAP 변수, target, internal table source를 host operand로 표시하기 위해 쓴다. |
| DB 컬럼에도 `@`를 붙이는가? | 아니다. DB 컬럼은 SQL 쪽 이름이므로 `@`를 붙이지 않는다. |
| `@( )`는 언제 쓰는가? | 변수 하나가 아니라 ABAP expression 결과를 SQL operand로 넘길 때 쓴다. |
| 콤마 SELECT list는 왜 중요한가? | 필드 경계를 명확히 하고 modern strict 흐름에 맞추기 위해서다. |
| `INTO TABLE @DATA(lt)`는 무엇을 만드는가? | SELECT 결과 row shape를 기준으로 inline internal table target을 만든다. |
| 계산 컬럼에는 왜 alias가 필요한가? | 결과 구조에서 컴포넌트 이름으로 읽히고 후속 ABAP 코드가 명확해지기 때문이다. |
| SQL expression은 어디서 실행되는가? | SQL 문장의 일부로 DB 쪽에서 계산되어 결과로 넘어온다. |
| `COALESCE`는 무엇을 대체하는가? | DB null을 대체한다. ABAP initial과 혼동하지 않는다. |
| `SELECT FROM @itab`은 언제 쓰는가? | 이미 ABAP 메모리에 있는 internal table을 SQL식으로 재가공할 때 쓴다. |
| CH19에서 아직 하지 않는 것은 무엇인가? | OO 설계, CDS DDL, DML/트랜잭션, 고급 SQL, Native SQL/ADBC다. |

## 최종 실습 과제

다음 classic 코드를 CH19 범위에서 modern SQL로 바꾸고, 결과 검증표를 작성하라.

```abap
DATA: lt_book TYPE TABLE OF zbooking,
      lt_stat TYPE TABLE OF ty_stat.

SELECT * FROM zbooking INTO TABLE lt_book
  WHERE concert_id IN s_conc.

SELECT c~concert_id c~artist c~capacity
       SUM( b~seats ) AS booked
  FROM zconcert AS c
  LEFT OUTER JOIN zbooking AS b
    ON c~concert_id = b~concert_id
  INTO TABLE lt_stat
  WHERE c~concert_id IN s_conc
    AND b~status <> 'C'
  GROUP BY c~concert_id c~artist c~capacity.
```

권장 답안:

```abap
SELECT *
  FROM zbooking
  WHERE concert_id IN @s_conc
  INTO TABLE @DATA(lt_book).

SELECT c~concert_id,
       c~artist,
       c~capacity,
       COALESCE( SUM( b~seats ), 0 ) AS booked,
       CASE
         WHEN COALESCE( SUM( b~seats ), 0 ) >= c~capacity THEN 'FULL'
         ELSE 'OPEN'
       END AS seat_status
  FROM zconcert AS c
  LEFT OUTER JOIN zbooking AS b
    ON  b~concert_id = c~concert_id
    AND b~status <> 'C'
  WHERE c~concert_id IN @s_conc
  GROUP BY c~concert_id, c~artist, c~capacity
  INTO TABLE @DATA(lt_stat).
```

검토 질문:

- `s_conc` 앞에 `@`를 붙인 이유를 설명할 수 있는가?
- SELECT list와 GROUP BY list가 모두 콤마로 구분되어 있는가?
- `@DATA(lt_book)`과 `@DATA(lt_stat)`가 만든 target을 디버거에서 확인했는가?
- 취소 예매 제외 조건을 `ON`에 둔 이유를 설명할 수 있는가?
- 예매 없는 공연의 `booked`가 null이 아니라 0으로 표시되는가?
- `booked` alias를 같은 SELECT list의 `CASE` 안에서 바로 쓰지 않은 이유를 설명할 수 있는가?
- `sy-subrc`, `sy-dbcnt`, `lines( lt_stat )`를 기록했는가?

좋은 CH19 답안은 modern 문법을 적용한 코드가 아니라, SQL과 ABAP의 경계, DB 계산 위치, 결과 target, 시스템 필드, 업무 검증 결과까지 함께 설명하는 답안이다.
