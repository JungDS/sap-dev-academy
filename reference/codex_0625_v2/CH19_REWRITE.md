# CH19_REWRITE · New Open SQL / Modern ABAP SQL

> 기준: `reference/codex_0625/00_QUALITY_REVIEW.md`의 재작업 판정  
> 원본: `content/abap/CH19/_chapter.md`, `content/abap/CH19/CH19-L01.md` ~ `CH19-L08.md`  
> 목적: CH19를 템플릿 보강안이 아니라, classic Open SQL에서 Modern ABAP SQL로 넘어가는 완성 강의자료 수준으로 재집필한다.

## CH19의 역할

CH18에서 학습자는 ABAP 코드 안의 modern syntax를 배웠다. `DATA( )`, `VALUE`, `CORRESPONDING`, table expression, string template, `+=`를 사용해 ABAP 문장을 더 가까운 위치에서 더 명확하게 쓸 수 있게 되었다. 그러나 CH18에서는 일부러 SQL을 건드리지 않았다. 그 이유는 SQL의 modern화가 단순한 축약이 아니라 ABAP 프로그램과 데이터베이스 사이의 경계를 다시 그리는 일이기 때문이다.

CH19는 그 경계를 여는 장이다. 이제 SELECT 문 안에서 ABAP 변수는 `@`로 표시하고, 필드 목록은 콤마로 구분하며, 결과 변수는 `@DATA( )`로 받을 수 있다. 또한 SELECT 목록에서 `CASE`, `CAST`, `COALESCE`, 문자열 함수, 날짜 함수를 사용해 데이터베이스가 값을 계산한 뒤 ABAP으로 결과를 넘기게 할 수 있다.

여기서 중요한 관점은 "문법이 최신이다"가 아니다. 입문자는 다음 질문에 답할 수 있어야 한다.

- 어느 이름이 DB 컬럼이고, 어느 이름이 ABAP 변수인가?
- SELECT 결과는 몇 행이고, `sy-subrc`, `sy-dbcnt`는 무엇을 말하는가?
- 계산은 DB에서 일어나는가, ABAP LOOP에서 일어나는가?
- `@DATA( )`가 만든 내부 테이블은 어떤 타입과 key를 가지는가?
- `SELECT FROM @itab`은 DB 테이블 조회와 어떤 점이 같고 다른가?

## R15 경계

CH19에서 허용되는 것과 아직 보류하는 것을 분명히 나눈다.

| 구분 | CH19에서 허용 | 아직 보류 |
|---|---|---|
| Modern SQL 기본 | `@` host variable, `@( )` host expression, 콤마 필드 목록 | 동적 SQL 심화, Native SQL, ADBC |
| SELECT 결과 대상 | `INTO TABLE @DATA( )`, `INTO @DATA( )` | `INTO NEW @...` 기반 동적 target 심화 |
| SQL expression | 산술, `CASE`, `CAST`, `COALESCE` | window expression, CTE, UNION/INTERSECT/EXCEPT 심화 |
| SQL function | 대표 문자열 함수, 대표 날짜 함수 | 정규식 SQL 함수, timezone/timestamp 심화 |
| Internal Table source | `SELECT ... FROM @itab` 기초 | 복수 internal table join 최적화, SQL engine 제약 심화 |
| 다음 연결 | CH20 OO, CH22 CDS의 예고 | 클래스 정의/예외/상속 코드, CDS DDL 코드 |

> CH19는 New Open SQL의 L3 정식 도입 장이다. 따라서 `@`, `@DATA`, 콤마, SQL expression은 이제 사용한다. 반대로 OO ABAP의 클래스 정의, 예외 처리 본격 문법, CDS view entity 코드는 CH20 이후로 보낸다.

## 공식 문서 수동 확인 근거

이번 재작성은 자동 키워드 매칭이 아니라 `C:\ABAP_DOCU_HTML`의 ABAP Keyword Documentation을 CH19 주제별로 직접 확인한 내용을 반영한다.

| 주제 | 확인한 문서 파일 | 본문 반영 포인트 |
|---|---|---|
| ABAP SQL 개요 | `abenabap_sql.htm` | ABAP SQL은 DB 접근용 ABAP 문장 집합이며 DB별 SQL로 변환된다. |
| `@` host variable | `abenabap_sql_host_variables.htm` | ABAP 데이터 객체는 SQL operand position에서 host variable로 쓰이며, `@` escape를 붙이면 strict mode가 작동한다. |
| `@( )` host expression | `abenabap_sql_host_expressions.htm` | ABAP expression 결과를 SQL operand로 넘기며, 결과 변환은 lossless해야 한다. |
| strict mode | `abenabap_sql_strict_modes.htm` | 콤마 리스트와 `@` 같은 새 구문은 더 엄격한 syntax check 규칙을 유도한다. |
| SELECT list와 콤마 | `abapselect_list.htm` | 공백 구분 개별 컬럼 지정은 obsolete이고, strict mode에서는 콤마가 필요하다. 계산 컬럼에는 alias가 중요하다. |
| INTO와 시스템 필드 | `abapselect.htm`, `abapselect_additions.htm`, `abapselect_into_target.htm` | `INTO`는 마지막 clause로 쓰는 것이 권장/강제되고, `SELECT`는 `sy-subrc`, `sy-dbcnt`를 세팅한다. `@DATA` inline target의 타입 생성 규칙이 있다. |
| SQL expression | `abapsql_expr.htm` | SQL expression은 DB에서 실행되고 결과가 AS ABAP으로 넘어온다. SELECT list alias는 같은 list의 다른 expression operand로 쓸 수 없다. |
| `CASE` | `abensql_case.htm`, `abensql_simple_case.htm`, `abensql_searched_case.htm` | simple/searched case가 있고, 결과 타입은 호환 가능한 공통 타입이어야 한다. |
| `CAST` | `abensql_cast.htm`, `abensql_cast_rules.htm` | SQL operand를 DDIC built-in type으로 변환하며, `CHAR( len )`처럼 길이 지정이 가능하다. |
| `COALESCE` | `abensql_coalesce.htm` | 첫 번째 non-null 값을 반환하며, 모든 인자가 null이면 마지막 인자 값이 반환된다. |
| 문자열 SQL 함수 | `abensql_functions_string.htm`, `abensql_string_func.htm` | `CONCAT`, `SUBSTRING`, `UPPER`, `LOWER`, `LENGTH` 등이 ABAP SQL에서 사용 가능하다. `SUBSTRING`은 SQL식 위치/길이 규칙을 따른다. |
| 날짜 SQL 함수 | `abenabap_sql_date_time_functions.htm`, `abensql_date_func.htm` | `DATS_ADD_DAYS( date, days )`, `DATS_DAYS_BETWEEN` 등이 있으며 DATS 값의 유효성에 주의한다. |
| `SELECT FROM @itab` | `abapselect_itab.htm`, `abenabap_sql_engine.htm`, `abensql_engine_restr.htm` | internal table을 query data source로 사용할 수 있고, ABAP SQL engine 처리 가능 여부와 DB 임시 전송 제약이 있다. |

## CH19-L01 · Classic Open SQL과 Modern ABAP SQL 비교

### 왜 필요한가

CH08과 CH13에서 배운 SELECT는 의도적으로 classic 형태였다.

```abap
SELECT carrid connid seatsmax
  FROM sflight
  INTO TABLE lt_flight
  WHERE carrid = lv_carr.
```

이 코드는 초반 학습에는 좋다. 공백으로 필드를 나열하고, ABAP 변수도 그냥 이름으로 쓴다. 하지만 프로그램이 커지면 읽는 사람이 계속 헷갈린다. `carrid`는 DB 컬럼인가, ABAP 변수인가? `lv_carr`는 왜 SQL 문 안에 그냥 들어가도 되는가? 필드 목록은 어디까지이고, target은 어디에 있는가?

Modern ABAP SQL은 이 경계를 더 명확히 표시한다.

```abap
SELECT carrid, connid, seatsmax
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @lt_flight.
```

달라진 점은 세 가지다.

- SELECT list의 필드를 콤마로 구분한다.
- ABAP 변수와 대상 앞에 `@`를 붙인다.
- `INTO`를 뒤쪽에 두어 데이터 흐름을 `SELECT list -> FROM -> WHERE -> INTO`로 읽게 한다.

### 무엇인가

Modern ABAP SQL은 "SQL 안에 있는 ABAP 것"을 분명히 표시한다. DB 컬럼은 그냥 쓰고, ABAP 변수는 `@`로 escape한다.

| 위치 | 의미 | 예 |
|---|---|---|
| `carrid` | DB 테이블 `sflight`의 컬럼 | `SELECT carrid` |
| `@lv_carr` | ABAP 프로그램의 변수 값 | `WHERE carrid = @lv_carr` |
| `@lt_flight` | ABAP 프로그램의 결과 내부 테이블 | `INTO TABLE @lt_flight` |
| `carrid, connid` | 콤마로 구분된 SELECT list | `SELECT carrid, connid` |

공식 문서 기준으로 공백으로 개별 컬럼을 나열하는 형태는 obsolete 쪽으로 밀려 있고, 콤마 리스트와 `@`는 strict mode를 유도한다. strict mode는 문법 검사를 더 엄격하게 하여 애매한 SQL을 더 빨리 잡아 준다.

Classic과 modern을 나란히 보면 목적이 선명하다.

```abap
" classic: CH08~CH13에서 학습한 형태
DATA lt_flight TYPE TABLE OF sflight.

SELECT carrid connid seatsmax
  FROM sflight
  INTO TABLE lt_flight
  WHERE carrid = lv_carr.

" modern: CH19부터 허용되는 형태
SELECT carrid, connid, seatsmax
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_flight_modern).
```

두 코드는 같은 데이터를 읽을 수 있다. 그러나 modern 코드는 ABAP 변수와 SQL 컬럼의 경계가 더 잘 보이고, 결과 테이블도 SELECT 문장에서 바로 선언한다.

### 어떻게 확인하는가

실행 후 세 가지를 본다.

1. `lt_flight_modern`에 몇 행이 들어왔는지 확인한다.
2. `sy-subrc`가 `0`인지 `4`인지 확인한다.
3. `sy-dbcnt`가 실제 전달된 행 수와 같은지 확인한다.

예를 들어 `lv_carr = 'LH'`이고 데이터가 있으면 `sy-subrc = 0`, `sy-dbcnt > 0`이어야 한다. 없는 항공사 코드라면 `lt_flight_modern`은 비고, `sy-subrc = 4`, `sy-dbcnt = 0`이어야 한다.

이 확인은 CH19 전체에서 반복된다. Modern SQL이 되어도 SELECT의 기본 관찰 지점은 사라지지 않는다. 결과 행 수, `sy-subrc`, `sy-dbcnt`를 보는 습관은 계속 유지한다.

### 실수와 주의

첫째, 콤마와 공백 필드 목록을 섞지 않는다.

```abap
" 잘못된 혼합 사고
SELECT carrid connid, seatsmax
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_bad).
```

필드 목록을 modern으로 쓸 거면 일관되게 콤마를 사용한다.

둘째, DB 컬럼에는 `@`를 붙이지 않는다. `@`는 ABAP 프로그램의 값이나 target을 SQL 문장에 가져오는 표시다.

셋째, `INTO`는 마지막 clause로 두는 흐름을 익힌다. 공식 문서는 `INTO`를 마지막 clause로 쓰는 것을 권장하고 strict mode에서 강제되는 경우가 있음을 설명한다. 입문자는 처음부터 마지막에 두는 습관이 좋다.

넷째, `SELECT *`는 필요한 경우에만 쓴다. CH19의 목표는 modern 문법을 배우는 것이지만, 필요한 컬럼만 읽는 기본 원칙은 CH08부터 계속 유지된다.

### 체험형 학습 설계

**실습 장치: Classic-to-Modern SQL Converter**

데이터:
- 테이블 `sflight`: `carrid`, `connid`, `fldate`, `seatsmax`, `seatsocc`.
- ABAP 변수 `lv_carr`: `LH`, `AA`, `ZZ` 중 선택.
- classic SELECT 문장과 modern SELECT 문장.

버튼:
- `classic 실행`: 공백 필드 목록과 `@` 없는 변수를 사용한 코드를 실행한다.
- `콤마 적용`: SELECT list 사이에 콤마를 넣는다.
- `@ 적용`: ABAP 변수와 target에 `@`를 붙인다.
- `INTO 뒤로 이동`: `INTO TABLE`을 마지막 clause 위치로 옮긴다.
- `결과 비교`: classic 결과와 modern 결과의 행 수, `sy-subrc`, `sy-dbcnt`를 비교한다.

상태:
- `sqlMode`: classic, commaOnly, hostEscaped, modernComplete.
- `selectedCarrid`: 현재 항공사 코드.
- `resultRows`: 결과 행 수.
- `systemFields`: `sy-subrc`, `sy-dbcnt`.
- `syntaxWarnings`: 콤마/공백 혼합, `@` 누락, target 누락.

피드백:
- 콤마만 적용하고 `@`를 빼면 "필드 목록은 modern인데 ABAP 변수 경계가 아직 불명확함"이라고 표시한다.
- DB 컬럼에 `@`를 붙이면 "DB 컬럼은 데이터베이스 쪽 이름이므로 escape하지 않음"이라고 표시한다.
- `lv_carr = 'ZZ'`에서 결과가 없으면 "modern SQL이어도 SELECT 실패 확인은 `sy-subrc = 4`, `sy-dbcnt = 0`으로 한다"라고 보여 준다.

### 정리

CH19-L01의 핵심은 modern SQL이 단순히 보기 좋은 문법이 아니라 ABAP 변수와 DB 컬럼의 경계를 명시하는 방식이라는 점이다. 콤마, `@`, 마지막 `INTO` 위치를 함께 익히고, 실행 후에는 결과 내부 테이블과 `sy-subrc`, `sy-dbcnt`를 확인한다.

## CH19-L02 · `@` Host Variable과 Host Expression

### 왜 필요한가

SQL 문장은 데이터베이스에서 실행된다. 하지만 ABAP 프로그램의 변수 값은 애플리케이션 서버 메모리에 있다. 이 둘을 연결할 때 "이 이름은 DB 컬럼이 아니라 ABAP 값이다"라는 표시가 필요하다. CH19의 `@`가 바로 그 표시다.

classic 형태에서는 다음 코드가 자연스럽게 보였다.

```abap
SELECT * FROM sflight
  WHERE carrid = lv_carr
  INTO TABLE lt_flight.
```

하지만 `lv_carr`가 ABAP 변수라는 사실은 이름 규칙에 기대고 있을 뿐 문법으로 드러나지 않는다. Modern ABAP SQL은 이 경계를 문법으로 표시한다.

```abap
SELECT *
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_flight).
```

`@lv_carr`는 "ABAP 프로그램에 있는 `lv_carr` 값을 SQL 조건에 넘긴다"는 뜻이다.

### 무엇인가

Host variable은 ABAP 프로그램에서 선언된 데이터 객체를 SQL 문장의 operand position에 넣은 것이다. `@`는 그 데이터 객체를 SQL 문장 안에서 host variable로 식별하는 escape 문자다.

```abap
DATA(lv_carr) = 'LH'.
DATA(lv_date) = sy-datum.

SELECT *
  FROM sflight
  WHERE carrid = @lv_carr
    AND fldate >= @lv_date
  INTO TABLE @DATA(lt_flight).
```

여기서 `carrid`, `fldate`는 DB 컬럼이고, `@lv_carr`, `@lv_date`는 ABAP 값이다.

Host expression은 단순 변수 하나가 아니라 ABAP expression 결과를 SQL에 넘기는 형태다.

```abap
DATA(lv_base) = 100.

SELECT carrid, connid, seatsmax
  FROM sflight
  WHERE seatsmax > @( lv_base + 100 )
  INTO TABLE @DATA(lt_large).
```

`@( lv_base + 100 )`은 ABAP에서 계산 가능한 표현식 결과를 SQL operand로 넘긴다. 공식 문서 기준으로 host expression 결과도 필요한 operand 타입으로 lossless 변환될 수 있어야 한다. 즉 아무 식이나 밀어 넣는 통로가 아니라, SQL 위치가 요구하는 타입에 맞아야 한다.

### 어떻게 확인하는가

확인은 의도적으로 세 가지 케이스를 실행해 본다.

1. 정상 변수: `lv_carr = 'LH'`
2. 결과 없음: `lv_carr = 'ZZ'`
3. 타입/값 부적합: `lv_carr` 길이나 값이 컬럼 타입과 맞지 않는 경우

정상 변수에서는 결과가 조회되고 `sy-subrc = 0`이어야 한다. 결과 없음에서는 `sy-subrc = 4`, `sy-dbcnt = 0`이다. 타입이나 값이 컬럼 타입에 lossless하게 맞지 않으면 문법 경고, 문법 오류, 또는 런타임 데이터 오류가 날 수 있다. 입문 단계에서는 이 상황을 "DB가 이상하다"로 보지 말고 "ABAP 값이 SQL operand 위치의 타입 규칙을 만족하지 못했다"로 해석한다.

디버거에서는 SELECT 직전에 `lv_carr`, `lv_date`, `lv_base` 값을 먼저 확인한다. SELECT 후에는 SQL 결과만 보지 말고, 실제 어떤 host 값이 들어갔는지 함께 기록한다.

### 실수와 주의

첫째, 컬럼 이름에 `@`를 붙이지 않는다.

```abap
" 잘못된 예: carrid는 DB 컬럼이다.
WHERE @carrid = @lv_carr
```

둘째, ABAP expression은 `@( ... )`로 감싼다.

```abap
" 변수 하나
WHERE carrid = @lv_carr

" 식
WHERE seatsmax > @( lv_base + 100 )
```

셋째, SQL expression과 host expression을 구분한다. `CASE`, `COALESCE`, `SUBSTRING` 같은 SQL expression은 DB에서 처리된다. `@( lv_base + 100 )` 같은 host expression은 ABAP expression 결과를 SQL에 넘기는 방식이다. 둘 다 "식"이라는 말이 들어가지만 실행 위치가 다르다.

넷째, host expression 안에 CH20 이후 개념을 끌어오지 않는다. 공식 문서에는 메서드 호출이나 객체 생성식 예시도 있지만, CH19 입문자는 산술식과 단순 내장값 정도로 익히면 충분하다.

### 체험형 학습 설계

**실습 장치: Host Boundary Inspector**

데이터:
- DB 컬럼 카드: `sflight-carrid`, `sflight-fldate`, `sflight-seatsmax`.
- ABAP 값 카드: `lv_carr = 'LH'`, `lv_date = sy-datum`, `lv_base = 100`.
- SQL 조건 슬롯: 왼쪽 operand, 비교 연산자, 오른쪽 operand.

버튼:
- `ABAP 값 넣기`: 선택한 ABAP 값 앞에 `@`를 붙여 조건에 넣는다.
- `DB 컬럼 넣기`: 선택한 DB 컬럼을 `@` 없이 조건에 넣는다.
- `식으로 넣기`: `@( lv_base + 100 )` host expression을 만든다.
- `@ 제거`: host variable에서 `@`를 빼서 strict mode 오류를 체험한다.
- `타입 검사`: SQL operand가 요구하는 타입과 host 값 타입을 비교한다.

상태:
- `leftOperandType`: column 또는 host.
- `rightOperandType`: column, hostVariable, hostExpression, literal.
- `escapeStatus`: required, present, missing, unnecessary.
- `conversionStatus`: ok, warning, error.
- `resultPreview`: 조건에 맞는 예상 행 수.

피드백:
- ABAP 값을 `@` 없이 넣으면 "ABAP 값은 SQL 문장 밖의 host 값이므로 escape 필요"라고 표시한다.
- DB 컬럼에 `@`를 붙이면 "컬럼은 DB 쪽 이름이므로 escape하지 않음"이라고 표시한다.
- host expression이 타입에 맞지 않으면 "식 결과가 SQL operand 타입으로 lossless 변환되어야 함"이라고 설명한다.

### 정리

`@`는 ABAP 값과 DB 컬럼의 경계를 보여 주는 문법이다. 변수 하나는 `@lv_value`, ABAP 식은 `@( ... )`로 넘긴다. 이 표시를 정확히 해야 strict mode에서 안전하게 검사받을 수 있고, SQL을 읽는 사람도 어느 값이 어디에서 왔는지 바로 알 수 있다.

## CH19-L03 · `INTO TABLE @DATA( )` Inline Target

### 왜 필요한가

CH18에서 inline declaration을 배운 이유는 선언을 사용 위치 가까이에 두기 위해서였다. SELECT 결과도 마찬가지다. classic Open SQL에서는 결과를 받을 내부 테이블을 먼저 선언했다.

```abap
DATA lt_flight TYPE TABLE OF sflight.

SELECT *
  FROM sflight
  WHERE carrid = 'LH'
  INTO TABLE lt_flight.
```

이 방식은 결과 타입을 명시하므로 안정적이다. 하지만 한 번 조회하고 바로 출력하거나 가공하는 짧은 report에서는 결과 그릇의 선언이 SELECT와 떨어져 있어 읽기 흐름이 끊긴다. CH19에서는 SELECT의 결과 구조가 정적으로 분명할 때 target을 inline으로 선언할 수 있다.

```abap
SELECT *
  FROM sflight
  WHERE carrid = 'LH'
  INTO TABLE @DATA(lt_flight).
```

SQL 문장 안이므로 `DATA( )`가 아니라 `@DATA( )`이다.

### 무엇인가

`INTO TABLE @DATA(lt_result)`는 SELECT 결과를 받을 standard internal table을 inline으로 선언한다. 공식 문서 기준으로 이때 만들어지는 내부 테이블은 standard table이고 empty table key를 가진다.

```abap
SELECT carrid, connid, seatsmax
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_flight).
```

이 경우 `lt_flight`의 한 행은 `carrid`, `connid`, `seatsmax` 세 컴포넌트를 가진 구조다. `SELECT *`이면 원본 테이블 행 구조에 가까워지고, 필드를 골라 쓰면 고른 필드만 가진 결과 행 구조가 만들어진다.

단건은 `INTO @DATA( )`로 받는다.

```abap
SELECT SINGLE carrid, carrname
  FROM scarr
  WHERE carrid = @lv_carr
  INTO @DATA(ls_carr).
```

여기서 `ls_carr`는 `carrid`, `carrname`을 가진 구조체다.

`@FINAL( )`도 사용할 수 있지만, 입문 단계에서는 결과를 이후 바꾸지 않을 때만 제한적으로 쓴다. 대부분의 실습은 `@DATA( )`로 시작한다.

### 어떻게 확인하는가

디버거에서 다음을 본다.

1. SELECT 전에는 `lt_flight`가 선언되어 있지 않다.
2. SELECT 후에는 `lt_flight`가 internal table로 생긴다.
3. row type에 SELECT list의 컬럼 이름이 들어 있는지 본다.
4. `sy-dbcnt`와 `lines( lt_flight )`가 같은지 확인한다.
5. `SELECT SINGLE`의 경우 `ls_carr` 구조체 값과 `sy-subrc`를 함께 확인한다.

추가로 중요한 실험이 있다. 계산 컬럼이나 중복 이름이 있는 SELECT list를 만들고 alias를 빼 보라.

```abap
SELECT carrid,
       seatsmax - seatsocc
  FROM sflight
  INTO TABLE @DATA(lt_bad).
```

계산 결과 컬럼에 이름이 없으면 inline target의 구조가 명확해지지 않는다. 실무에서는 계산 컬럼에 반드시 `AS`로 이름을 붙이는 습관을 들인다.

```abap
SELECT carrid,
       seatsmax - seatsocc AS seats_free
  FROM sflight
  INTO TABLE @DATA(lt_ok).
```

### 실수와 주의

첫째, SQL 안에서는 `DATA(lt)`가 아니라 `@DATA(lt)`다. CH18의 ABAP 문장 inline 선언과 CH19의 SQL target inline 선언을 구분한다.

둘째, 이미 선언된 이름에 `@DATA( )`를 쓰지 않는다. 새로 선언할 때만 `@DATA( )`를 쓰고, 기존 변수에 받으려면 `@lt_existing`을 사용한다.

셋째, inline target internal table은 standard table with empty key다. key 기반으로 자주 읽어야 하는 결과라면 명시적으로 타입을 선언하고 적절한 key를 가진 internal table을 쓰는 편이 낫다.

넷째, SELECT list의 컬럼 이름은 유일해야 한다. join에서 같은 이름의 컬럼이 여러 개 나오거나 계산 컬럼 이름이 없으면 inline target이 곤란해진다. `AS` alias를 사용한다.

다섯째, dynamic SELECT list를 직접 inline target으로 받는 것은 CH19 입문 범위를 넘는다. 공식 문서에는 `NEW`를 이용한 동적 target 설명이 있지만, CH19에서는 정적으로 구조를 알 수 있는 SELECT만 다룬다.

### 체험형 학습 설계

**실습 장치: SELECT Target Type Viewer**

데이터:
- SELECT list 옵션: `*`, `carrid, connid`, `carrid, seatsmax - seatsocc AS seats_free`, 중복 컬럼 이름.
- target 옵션: 기존 `@lt_flight`, 새 `@DATA(lt_flight)`, 새 `@DATA(ls_carr)`.

버튼:
- `필드 3개 조회`: 고른 컬럼만 가진 row type을 만든다.
- `SELECT * 조회`: 전체 row type을 만든다.
- `계산 컬럼 추가`: `seatsmax - seatsocc`를 SELECT list에 넣는다.
- `별칭 붙이기`: 계산 컬럼에 `AS seats_free`를 붙인다.
- `타입 보기`: 생성된 `lt_flight`의 row component 목록과 table kind/key를 보여 준다.

상태:
- `resultShape`: 컬럼 이름과 타입 목록.
- `targetKind`: work area 또는 internal table.
- `tableKey`: empty key, explicit key.
- `aliasStatus`: ok, missing, duplicate.
- `systemFields`: `sy-subrc`, `sy-dbcnt`.

피드백:
- alias가 없는 계산 컬럼은 "inline target은 결과 컬럼 이름이 필요함"이라고 알려 준다.
- key 기반 조회 과제가 나오면 "inline table은 empty key이므로 명시 타입 선언을 고려"라고 표시한다.
- `@DATA` 없이 `DATA`를 쓰면 "SQL target은 host variable 자리이므로 `@DATA` 필요"라고 안내한다.

### 정리

`INTO TABLE @DATA( )`는 SELECT 결과를 받는 내부 테이블을 SELECT 자리에서 선언한다. 결과 구조가 정적으로 분명하고, key 기반 접근이 중요하지 않은 짧은 조회에 적합하다. 계산 컬럼과 join 결과에는 alias를 붙이고, 기존 target을 재사용할 때는 `@DATA( )`가 아니라 `@기존변수`를 쓴다.

## CH19-L04 · SQL Expression: `CASE`, `CAST`, `COALESCE`

### 왜 필요한가

CH13까지는 DB에서 데이터를 읽고, ABAP으로 가져온 뒤 `LOOP`를 돌며 상태 문구나 계산 값을 만들었다.

```abap
LOOP AT lt_flight INTO DATA(ls_flight).
  IF ls_flight-seatsocc >= ls_flight-seatsmax.
    " status = FULL
  ELSE.
    " status = OPEN
  ENDIF.
ENDLOOP.
```

이 방식은 로직을 ABAP에서 명확하게 볼 수 있다는 장점이 있다. 그러나 단순한 계산이나 상태 분류까지 모두 ABAP LOOP로 가져오면, DB가 잘할 수 있는 일을 애플리케이션 서버로 넘기는 셈이 된다.

SQL expression은 SELECT 안에서 값을 계산한다. 데이터베이스가 결과 컬럼을 만들어 ABAP으로 넘긴다.

### 무엇인가

SQL expression은 ABAP SQL 문장 안에서 DB가 계산하는 표현식이다. 공식 문서 기준으로 SQL expression은 DB 시스템에서 실행되고, 요청된 결과가 AS ABAP으로 넘어온다.

대표적으로 `CASE`는 조건에 따라 결과 컬럼을 만든다.

```abap
SELECT carrid, connid, seatsocc, seatsmax,
       CASE
         WHEN seatsocc >= seatsmax THEN 'FULL'
         ELSE 'OPEN'
       END AS seat_status
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_status).
```

`seat_status`는 DB에서 계산된 결과 컬럼이다. ABAP에서 다시 `LOOP`를 돌며 상태 문구를 붙이지 않는다.

`CAST`는 SQL operand의 타입을 바꾼다.

```abap
SELECT carrid,
       CAST( seatsmax AS CHAR( 5 ) ) AS seatsmax_text
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_text).
```

`CAST( seatsmax AS CHAR( 5 ) )`는 숫자 좌석 수를 문자형 결과 컬럼으로 만든다. 길이가 충분하지 않으면 값 표현에 문제가 생길 수 있으므로 길이를 의식해야 한다.

`COALESCE`는 null 값을 대체한다.

```abap
SELECT c~carrid,
       c~carrname,
       COALESCE( p~cityto, 'NO ROUTE' ) AS city_to_text
  FROM scarr AS c
  LEFT OUTER JOIN spfli AS p
    ON p~carrid = c~carrid
  INTO TABLE @DATA(lt_route).
```

Left outer join에서 오른쪽 테이블에 매칭되는 행이 없으면 오른쪽 컬럼은 null이 될 수 있다. `COALESCE`는 첫 번째 non-null 값을 반환하므로, null일 때 보여 줄 대체 값을 지정할 수 있다.

### 어떻게 확인하는가

세 가지 컬럼을 각각 확인한다.

1. `CASE` 결과: `seatsocc >= seatsmax`인 행은 `FULL`, 그 외는 `OPEN`인지 본다.
2. `CAST` 결과: 숫자 컬럼이 문자 컬럼처럼 들어왔는지, 길이가 충분한지 본다.
3. `COALESCE` 결과: outer join에서 오른쪽 데이터가 없는 경우 `NO ROUTE` 같은 대체 값이 들어오는지 본다.

디버거나 ALV로 `lt_status`, `lt_text`, `lt_route`를 열어 결과 컬럼 이름을 확인한다. 계산 컬럼에는 `AS seat_status`, `AS seatsmax_text`, `AS city_to_text`처럼 alias가 붙어야 이후 코드에서 읽기 쉽다.

### 실수와 주의

첫째, SELECT list에서 만든 alias를 같은 SELECT list의 다른 expression 안에서 바로 쓰지 않는다. 공식 문서는 alias 이름을 SQL expression operand로 사용할 수 없다고 설명한다. 예를 들어 `SUM( b~seats ) AS booked`를 만든 뒤 같은 SELECT list에서 `booked`라는 alias로 `CASE`를 계산하는 식은 피한다. 필요하면 expression을 반복하거나 별도 단계로 나눈다.

둘째, `CASE`의 결과 타입은 서로 호환되어야 한다. `THEN 'FULL'`, `ELSE 0`처럼 문자와 숫자를 섞으면 타입 문제가 생긴다. 입문 단계에서는 같은 계열의 결과를 반환하게 한다.

셋째, `COALESCE`는 ABAP initial 값을 대체하는 함수가 아니다. DB null을 다루는 함수다. 빈 문자열, `0`, initial date와 null은 같은 개념이 아니다.

넷째, `CAST`는 값이 실제로 표현 가능한지 봐야 한다. `CHAR( 2 )`에 큰 숫자를 억지로 넣는 식의 변환은 잘못된 결과나 오류를 부를 수 있다.

다섯째, 모든 업무 판단을 SQL expression으로 밀어 넣지 않는다. 단순 상태 컬럼 생성은 좋지만, 복잡한 업무 규칙, 메시지 처리, 권한 분기, 사용자 상호작용은 ABAP 또는 이후 장의 구조화된 코드가 더 적합하다.

### 체험형 학습 설계

**실습 장치: SQL Expression Lab**

데이터:
- `sflight` 샘플 5행: `carrid`, `connid`, `seatsocc`, `seatsmax`.
- `scarr`와 `spfli` left join 샘플: route가 있는 항공사와 없는 항공사.

버튼:
- `CASE 컬럼 추가`: 좌석 상태 컬럼을 생성한다.
- `CAST 적용`: `seatsmax`를 `CHAR( 5 )`로 바꾼 결과를 보여 준다.
- `COALESCE 적용`: null route를 대체 문구로 바꾼다.
- `ABAP LOOP 버전 보기`: 같은 결과를 ABAP LOOP로 만든 코드를 비교한다.
- `alias 제거`: 계산 컬럼 alias가 없을 때 target 구조가 불명확해지는 것을 보여 준다.

상태:
- `calculationLocation`: DB 또는 ABAP.
- `resultColumns`: 결과 컬럼 이름과 타입.
- `nullRows`: outer join에서 null이 발생한 행 목록.
- `typeWarnings`: `CASE` 결과 타입 불일치, `CAST` 길이 부족.
- `aliasStatus`: ok 또는 missing.

피드백:
- `CASE`를 켜면 "상태 컬럼은 DB에서 계산되어 결과셋에 포함됨"이라고 표시한다.
- `COALESCE`를 켜면 null 셀만 강조하고 "initial 값 대체가 아니라 null 대체"라고 설명한다.
- alias를 제거하면 "inline target과 후속 코드가 읽을 컬럼 이름이 필요함"이라고 알려 준다.

### 정리

SQL expression은 DB에서 결과 컬럼을 계산하게 하는 도구다. `CASE`는 조건별 값, `CAST`는 타입 변환, `COALESCE`는 null 대체에 사용한다. 계산 컬럼에는 alias를 붙이고, 결과 타입과 null/initial 차이를 분명히 구분한다.

## CH19-L05 · SQL String / Date Function

### 왜 필요한가

CH18에서는 ABAP 쪽 string template과 string function을 배웠다. 그러나 모든 문자열·날짜 가공을 ABAP으로 가져와서 처리해야 하는 것은 아니다. 결과 목록에 표시할 간단한 route code, 대문자 도시명, 일정 기준일처럼 SELECT 단계에서 만들 수 있는 값은 DB에서 계산해 가져오는 편이 더 자연스러울 때가 있다.

다만 SQL 함수는 ABAP 함수와 이름이 비슷해도 실행 위치와 인덱스 규칙이 다를 수 있다. 특히 SQL의 `SUBSTRING`은 위치를 1부터 생각하는 방식으로 가르쳐야 CH18의 ABAP `substring( off = 0 ... )`와 섞이지 않는다.

### 무엇인가

문자열 SQL 함수는 SELECT 목록에서 문자열 결과 컬럼을 만든다.

```abap
SELECT carrid,
       connid,
       CONCAT( carrid, connid )  AS route_code,
       SUBSTRING( connid, 1, 2 ) AS conn_prefix,
       UPPER( cityfrom )         AS city_from_upper
  FROM spfli
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_route).
```

읽는 방법은 다음과 같다.

- `CONCAT( carrid, connid )`: 두 문자열을 이어 route code를 만든다.
- `SUBSTRING( connid, 1, 2 )`: `connid`의 첫 번째 위치부터 두 글자를 가져온다.
- `UPPER( cityfrom )`: 도시명을 대문자로 바꾼다.

날짜 함수는 날짜 계산을 SELECT에서 수행한다.

```abap
SELECT carrid,
       connid,
       fldate,
       DATS_ADD_DAYS( fldate, 7 ) AS due_date
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_due).
```

`DATS_ADD_DAYS( fldate, 7 )`는 비행일 기준 7일 뒤 날짜를 만든다. 현재 확인한 ABAP SQL 문서 기준으로 이 함수는 `date`, `days` 두 인자를 사용한다. 세 번째 오류 처리 인자를 붙이는 형태는 이 장의 ABAP SQL 예제로 쓰지 않는다.

날짜 차이가 필요하면 다음 형태를 사용한다.

```abap
SELECT carrid,
       connid,
       fldate,
       DATS_DAYS_BETWEEN( @sy-datum, fldate ) AS days_from_today
  FROM sflight
  WHERE carrid = @lv_carr
  INTO TABLE @DATA(lt_days).
```

여기서 `@sy-datum`은 ABAP 시스템 날짜를 host variable로 SQL에 넘긴 것이다.

### 어떻게 확인하는가

문자열 함수는 샘플 한 행을 골라 사람이 직접 계산한다.

예:
- `carrid = 'LH'`
- `connid = '0400'`
- `cityfrom = 'Frankfurt'`

기대:
- `route_code = 'LH0400'`
- `conn_prefix = '04'`
- `city_from_upper = 'FRANKFURT'`

날짜 함수도 한 행을 골라 직접 비교한다. `fldate = 20260626`이면 `DATS_ADD_DAYS( fldate, 7 )` 결과는 7일 뒤 날짜여야 한다. `DATS_DAYS_BETWEEN( @sy-datum, fldate )`는 두 날짜의 차이를 정수로 돌려준다.

### 실수와 주의

첫째, ABAP string function과 SQL string function을 섞어 생각하지 않는다. CH18의 ABAP `substring( val = text off = 0 len = 3 )`과 CH19의 SQL `SUBSTRING( connid, 1, 2 )`는 실행 위치와 인자 의미가 다르다.

둘째, 함수 결과에는 alias를 붙인다. `AS route_code`, `AS due_date`가 있어야 결과 구조가 읽기 쉽다.

셋째, null 전파를 기억한다. 공식 문서 기준으로 문자열 함수의 인자가 null이면 전체 함수 결과가 null이 될 수 있다. outer join과 함께 쓰는 경우 `COALESCE`와 같이 생각해야 한다.

넷째, 날짜 값의 유효성에 주의한다. DATS 값은 `YYYYMMDD` 형태의 유효 날짜여야 한다. 잘못된 날짜가 들어오면 함수마다 초기화, 오류, 예외 상황이 생길 수 있다. 입문 실습에서는 정상 날짜로 시작하고, 별도 오류 실험에서 invalid date를 다룬다.

다섯째, 모든 표시 문자열을 SQL에서 만들지 않는다. 사용자 언어, 번역, Text Symbol, 메시지 클래스와 관련된 문장은 ABAP/UI 계층에서 다루는 편이 적합할 수 있다. SQL 함수는 결과 컬럼의 간단한 가공에 집중한다.

### 체험형 학습 설계

**실습 장치: SQL Function Workbench**

데이터:
- `spfli` 행: `carrid`, `connid`, `cityfrom`, `cityto`.
- `sflight` 행: `carrid`, `connid`, `fldate`.
- 날짜 입력: 기준일, 더할 일수.

버튼:
- `CONCAT 실행`: `carrid + connid` 결과를 보여 준다.
- `SUBSTRING 실행`: 시작 위치와 길이를 바꿔 prefix 결과를 보여 준다.
- `UPPER/LOWER 전환`: 도시명의 대소문자 변환을 비교한다.
- `DATS_ADD_DAYS 실행`: 비행일 기준 N일 뒤 날짜를 계산한다.
- `DATS_DAYS_BETWEEN 실행`: 기준일과 비행일 사이 일수를 계산한다.
- `ABAP 함수와 비교`: CH18의 ABAP string function과 실행 위치 차이를 표로 보여 준다.

상태:
- `functionName`: 선택된 SQL 함수.
- `inputColumns`: 함수에 들어가는 컬럼과 host variable.
- `resultColumn`: alias와 결과 값.
- `executionSide`: DB.
- `dateValidity`: valid, invalid, initial.
- `nullPropagation`: null input 여부와 결과.

피드백:
- `SUBSTRING`에서 시작 위치를 `0`으로 넣으면 "SQL substring은 ABAP off 방식과 다르게 다룬다"는 경고를 표시한다.
- 날짜가 유효하지 않으면 "날짜 함수는 DATS 유효성을 전제로 확인해야 함"이라고 안내한다.
- 사용자 표시 문장을 SQL에서 만들려 하면 "다국어 문구는 Text Symbol/메시지 설계와 분리해서 판단"이라고 피드백한다.

### 정리

SQL 문자열·날짜 함수는 SELECT 결과 컬럼을 DB에서 간단히 가공하게 해 준다. `CONCAT`, `SUBSTRING`, `UPPER`, `DATS_ADD_DAYS`, `DATS_DAYS_BETWEEN`을 먼저 익히고, 함수 결과에는 alias를 붙인다. ABAP 함수와 이름이 비슷해도 실행 위치와 인자 규칙이 다르다는 점을 항상 확인한다.

## CH19-L06 · `SELECT FROM @itab` 기초

### 왜 필요한가

CH06에서 Internal Table을 배웠고, CH13에서 SQL 집계와 정렬을 배웠다. 실무에서는 이미 메모리에 가져온 데이터를 다시 필터링하거나 정렬하거나 집계하고 싶을 때가 있다.

방법은 여러 가지다.

- `LOOP AT lt_data WHERE ...`로 직접 순회한다.
- `SORT`, `READ TABLE`, `COLLECT` 같은 Internal Table 도구를 쓴다.
- CH19의 `SELECT ... FROM @itab`으로 internal table을 SQL data source처럼 다룬다.

`SELECT FROM @itab`은 세 번째 선택지다. DB 테이블을 다시 읽는 것이 아니라, ABAP 메모리에 있는 internal table을 query 대상으로 놓고 SQL 문법을 적용한다.

### 무엇인가

기본 형태는 다음과 같다.

```abap
TYPES: BEGIN OF ty_flight,
         carrid   TYPE sflight-carrid,
         connid   TYPE sflight-connid,
         seatsocc TYPE sflight-seatsocc,
       END OF ty_flight.

TYPES ty_flight_tab TYPE STANDARD TABLE OF ty_flight WITH EMPTY KEY.

DATA(lt_flight) = VALUE ty_flight_tab(
  ( carrid = 'LH' connid = '0400' seatsocc = 120 )
  ( carrid = 'LH' connid = '0401' seatsocc = 80  )
  ( carrid = 'AA' connid = '0017' seatsocc = 50  ) ).

SELECT f~carrid, f~connid, f~seatsocc
  FROM @lt_flight AS f
  WHERE f~carrid = @lv_carr
  ORDER BY f~connid
  INTO TABLE @DATA(lt_filtered).
```

`FROM @lt_flight AS f`에서 `@lt_flight`는 ABAP internal table이고, `f`는 SQL 문장 안에서 쓸 alias다. 결과는 다시 `@DATA(lt_filtered)`로 받는다.

집계도 가능하다.

```abap
SELECT f~carrid,
       SUM( f~seatsocc ) AS total_occ
  FROM @lt_flight AS f
  GROUP BY f~carrid
  INTO TABLE @DATA(lt_sum).
```

다만 공식 문서 기준으로 internal table을 data source로 쓰는 SELECT는 ABAP SQL engine이 처리할 수 있는 경우와, 임시로 DB에 데이터를 넘겨야 하는 경우가 나뉜다. 특히 집계, join, 복잡한 SQL expression이 섞이면 시스템이 경고를 낼 수 있다. 입문자는 처음부터 pragma로 경고를 숨기지 말고, 왜 경고가 나는지 이해해야 한다.

### 어떻게 확인하는가

확인은 원본 internal table과 결과 internal table을 나란히 놓고 본다.

원본:

| carrid | connid | seatsocc |
|---|---|---:|
| LH | 0400 | 120 |
| LH | 0401 | 80 |
| AA | 0017 | 50 |

`lv_carr = 'LH'`로 필터링하면 결과는 2행이어야 한다. `ORDER BY f~connid`가 있으므로 `0400`, `0401` 순서인지 확인한다.

집계 결과는 다음이어야 한다.

| carrid | total_occ |
|---|---:|
| AA | 50 |
| LH | 200 |

`sy-subrc`와 `sy-dbcnt`도 함께 본다. internal table을 source로 사용해도 SELECT 문장이므로 시스템 필드 관찰은 그대로 유효하다.

### 실수와 주의

첫째, `FROM lt_flight`가 아니라 `FROM @lt_flight`다. internal table도 ABAP host variable이므로 `@`가 필요하다.

둘째, alias를 붙이는 습관을 들인다. `FROM @lt_flight AS f`라고 쓰고 `f~carrid`처럼 읽으면 DB 테이블과 internal table source가 섞인 쿼리에서도 출처가 보인다.

셋째, 대량 데이터의 원천 처리를 internal table SELECT로 우회하지 않는다. DB에 있는 대량 데이터를 먼저 모두 가져온 뒤 `SELECT FROM @itab`으로 집계하는 것은 보통 나쁜 방향이다. 가능하면 DB에서 직접 조건과 집계를 처리한다.

넷째, ABAP SQL engine과 DB 임시 전송 제약을 가볍게라도 알아야 한다. 공식 문서 기준으로 처리할 수 없는 요소가 있으면 한 internal table의 일부 컬럼을 DB 임시 테이블로 넘겨 처리할 수 있고, DB 지원 여부와 경고가 관여한다. 복수 internal table이나 복잡한 join은 입문 단계에서 남용하지 않는다.

다섯째, elementary row table에서는 컬럼 이름이 `table_line`이 될 수 있다. inline target과 함께 쓰면 alias가 필요할 수 있다. CH19에서는 구조화된 row type으로 시작하는 편이 안전하다.

### 체험형 학습 설계

**실습 장치: Internal Table SQL Console**

데이터:
- `lt_flight` 3~6행. 컬럼: `carrid`, `connid`, `seatsocc`.
- 선택 변수 `lv_carr`.
- 처리 모드: `LOOP`, `SELECT FROM @itab`, `DB SELECT`.

버튼:
- `원본 테이블 보기`: ABAP 메모리의 `lt_flight`를 보여 준다.
- `WHERE 필터 실행`: `FROM @lt_flight`로 특정 항공사만 고른다.
- `ORDER BY 실행`: `connid` 순서를 바꿔 본다.
- `GROUP BY 실행`: `carrid`별 탑승 좌석을 합산한다.
- `LOOP와 비교`: 같은 결과를 `LOOP AT`으로 만든 코드와 비교한다.
- `엔진 경고 보기`: 집계/복잡도에 따라 ABAP SQL engine 처리 가능 여부를 설명한다.

상태:
- `sourceKind`: dbTable 또는 internalTable.
- `enginePath`: AS ABAP 처리, DB 임시 전송 필요, unsupported.
- `resultRows`: 결과 행 수.
- `systemFields`: `sy-subrc`, `sy-dbcnt`.
- `warningVisible`: warning, pragmaHidden, none.

피드백:
- `@`를 빼면 "internal table도 ABAP host variable이므로 `@` 필요"라고 표시한다.
- 대량 데이터 경고 버튼을 누르면 "DB에 있는 데이터를 모두 가져와 메모리에서 다시 SQL 처리하는 것은 목적이 아님"이라고 안내한다.
- pragma로 경고를 숨기려 하면 "먼저 처리 경로를 이해한 뒤 사용"이라고 표시한다.

### 정리

`SELECT FROM @itab`은 internal table을 SQL data source처럼 다루는 도구다. 이미 메모리에 있는 데이터를 SQL 문법으로 필터링, 정렬, 간단히 집계할 때 유용하다. 그러나 DB 대량 처리의 대체재가 아니며, ABAP SQL engine 처리 가능 여부와 DB 임시 전송 제약을 이해해야 한다.

## CH19-L07 · ABAP SQL 정리: 다음 단계로

### 왜 필요한가

CH19까지 오면 학습자는 데이터 조회의 큰 흐름을 한 번 완주했다.

- CH08: 단일 테이블을 classic Open SQL로 읽었다.
- CH12: selection screen의 조건을 SQL 조건으로 연결했다.
- CH13: join과 aggregate로 여러 테이블을 합치고 요약했다.
- CH18: SQL 바깥의 ABAP 문법을 modern syntax로 정리했다.
- CH19: SELECT 자체를 Modern ABAP SQL로 전환했다.

이제 필요한 것은 새 문법을 하나 더 외우는 것이 아니라, 어떤 상황에서 어떤 형태를 선택할지 정리하는 것이다.

### 무엇인가

CH19의 도구를 의사결정 표로 정리한다.

| 상황 | 선택 | 이유 |
|---|---|---|
| DB 컬럼과 ABAP 변수 경계가 헷갈린다 | `@` host variable | SQL 안에서 ABAP 값임을 명확히 표시 |
| SELECT list가 길다 | 콤마 필드 목록 | 필드 경계가 분명하고 strict mode와 맞음 |
| 짧은 조회 결과를 바로 쓰고 싶다 | `INTO TABLE @DATA( )` | 결과 target을 SELECT 가까이에 둠 |
| 단순 상태 컬럼이 필요하다 | SQL `CASE` | DB에서 결과 컬럼으로 계산 |
| null을 표시값으로 바꾸고 싶다 | `COALESCE` | DB null을 대체 |
| 날짜/문자열 일부 가공이 필요하다 | SQL function | SELECT 결과 컬럼으로 계산 |
| 이미 메모리에 있는 데이터를 SQL식으로 재가공한다 | `SELECT FROM @itab` | internal table을 data source로 사용 |
| 복잡한 업무 규칙을 표현한다 | ABAP 코드 또는 이후 구조화 | SQL expression에 과도하게 밀어 넣지 않음 |

이 표의 핵심은 "modern이니까 무조건 SQL로"가 아니다. DB가 잘하는 단순 집합 연산과 결과 컬럼 계산은 SQL에 두고, 절차적 판단과 사용자 상호작용은 ABAP에 둔다.

### 어떻게 확인하는가

다음 미니 퀴즈로 확인한다.

1. "항공사 코드가 사용자가 입력한 `p_carrid`와 같은 행만 읽는다."  
   답: `WHERE carrid = @p_carrid`

2. "좌석이 꽉 찼으면 `FULL`, 아니면 `OPEN` 컬럼을 결과에 추가한다."  
   답: SQL `CASE ... END AS seat_status`

3. "조회 결과를 key 기반으로 자주 읽어야 한다."  
   답: `@DATA( )` inline table보다 명시 타입과 key를 가진 internal table 고려

4. "이미 가져온 200행짜리 internal table을 항공사별로 정렬해서 보여 준다."  
   답: `SELECT FROM @itab` 또는 `SORT` 모두 가능. SQL식 정렬/필터 연습이면 `FROM @itab`, 단순 정렬이면 `SORT`도 충분

5. "CDS View를 만들어 재사용하고 UI annotation을 붙인다."  
   답: CH22 범위. CH19에서는 SQL 감각만 예고

### 실수와 주의

첫째, 한 SELECT 안에서 classic과 modern을 섞지 않는다. 콤마 필드 목록을 쓰기 시작했다면 host variable도 `@`로 표시한다.

둘째, SQL에 업무 로직을 과도하게 넣지 않는다. `CASE`가 가능하다고 모든 조건을 SELECT list에 넣으면 SQL은 길어지고, 디버깅은 어려워진다.

셋째, `@DATA( )`가 항상 최선은 아니다. 결과를 여러 번 key로 조회하거나, 타입을 여러 모듈에서 공유해야 한다면 명시 타입 선언이 더 좋다.

넷째, `SELECT FROM @itab`은 "DB SELECT 없이 SQL을 쓰는 멋진 방법"이 아니다. 이미 메모리에 있는 적당한 데이터에 SQL 문법을 적용하는 선택지다.

다섯째, CH20과 CH22를 앞당기지 않는다. OO 설계와 CDS는 다음 단계의 주제다. CH19에서는 그 주제들이 왜 필요해지는지까지만 연결한다.

### 체험형 학습 설계

**실습 장치: SQL Decision Cards**

데이터:
- 상황 카드 12개: 사용자 입력 조건, 결과 target, 상태 컬럼, null 대체, 날짜 계산, internal table 재가공, key 기반 후속 조회, CDS 재사용 요구 등.
- 도구 카드: `@`, `@DATA`, `CASE`, `CAST`, `COALESCE`, SQL string/date function, `SELECT FROM @itab`, classic explicit target, ABAP LOOP.

버튼:
- `상황 뽑기`: 랜덤 상황 카드를 보여 준다.
- `도구 선택`: 학습자가 도구 카드를 선택한다.
- `정답 확인`: 선택이 적절한지 이유를 보여 준다.
- `경계 확인`: CH19에서 가능한지, CH20/CH22로 넘겨야 하는지 표시한다.
- `대안 보기`: 같은 문제를 SQL과 ABAP 중 어디서 처리할지 비교한다.

상태:
- `scenario`: 현재 상황.
- `selectedTool`: 선택한 도구.
- `scopeLevel`: CH19 가능, CH20 이후, CH22 이후, 과도한 SQL.
- `feedback`: 선택 이유와 주의점.

피드백:
- 맞으면 "DB가 잘하는 집합 처리라 SQL이 적합" 또는 "후속 key 접근이 중요하므로 명시 타입이 적합"처럼 이유 중심으로 설명한다.
- 틀리면 "문법 가능 여부"와 "좋은 설계 여부"를 분리해 알려 준다.
- CH20/CH22 카드를 고르면 "예고는 가능하지만 코드 정의는 아직 보류"라고 표시한다.

### 정리

CH19의 마무리는 문법 암기가 아니라 선택 기준이다. `@`로 경계를 표시하고, `@DATA`로 짧은 결과를 받고, SQL expression/function으로 단순 결과 컬럼을 만들고, `SELECT FROM @itab`으로 메모리 데이터를 SQL식으로 다룬다. 그러나 복잡한 업무 규칙과 재사용 모델은 다음 장으로 넘긴다.

## CH19-L08 · 실습: 콘서트앱 모던 SQL

### 왜 필요한가

마지막 레슨은 CH12와 CH13에서 만든 콘서트 예매 조회를 CH19 문법으로 바꾸는 실습이다. 목표는 콘서트 앱 전체를 다시 설계하는 것이 아니다. 이미 배운 조회를 modern SQL 경계 안에서 안전하게 바꾸는 것이다.

이 실습에서 바꾸는 것:

- selection screen range table을 `@s_conc`로 SQL에 넘긴다.
- SELECT list를 콤마로 쓴다.
- 결과 target을 `@DATA( )`로 선언한다.
- 집계 결과와 상태 컬럼에 alias를 붙인다.
- 단순 매진 상태를 SQL `CASE`로 계산한다.

이 실습에서 하지 않는 것:

- 예매 저장 DML
- lock object
- OO manager class
- CDS/RAP 모델링
- 예외 처리 클래스 설계

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

`s_conc`는 selection screen에서 만들어진 range table이다. SQL 안에서는 ABAP 쪽 값이므로 `@s_conc`로 표시한다.

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

여기서 일부러 `booked` alias를 `CASE` 안에서 다시 쓰지 않는다. SELECT list의 alias는 같은 SELECT list의 다른 SQL expression operand로 사용할 수 없기 때문이다. 그래서 `CASE` 안에서는 `COALESCE( SUM( b~seats ), 0 )`를 반복한다. 길어 보이지만 규칙을 정확히 지키는 코드다.

결과 메시지는 CH18의 string template로 만들 수 있다.

```abap
LOOP AT lt_stat INTO DATA(ls_stat).
  WRITE: / |{ ls_stat-concert_id } { ls_stat-artist } 예약 { ls_stat-booked }/{ ls_stat-capacity } - { ls_stat-seat_status }|.
ENDLOOP.
```

이 부분은 SQL이 아니라 ABAP 출력이다. CH18에서 배운 string template를 사용해 결과를 확인한다.

### 어떻게 확인하는가

실습 데이터는 다음처럼 둔다.

`zconcert`

| concert_id | artist | capacity |
|---|---|---:|
| C001 | 정훈영 Band | 100 |
| C002 | ABAP Trio | 50 |
| C003 | UI5 Night | 80 |

`zbooking`

| booking_id | concert_id | customer | seats | status |
|---|---|---|---:|---|
| B001 | C001 | 김하나 | 2 | N |
| B002 | C001 | 이도윤 | 3 | N |
| B003 | C001 | 박서연 | 1 | C |
| B004 | C002 | 정훈영 | 50 | N |

조회 조건 `s_conc = C001, C002, C003`이면 기대 결과는 다음이다.

| concert_id | booked | seat_status | 이유 |
|---|---:|---|---|
| C001 | 5 | OPEN | 취소 `C` 1건은 제외, 2+3만 합산 |
| C002 | 50 | FULL | 예약 좌석이 capacity와 같음 |
| C003 | 0 | OPEN | 예매가 없어 `SUM` 결과 null 가능, `COALESCE`로 0 처리 |

실행 후 확인할 것:

1. `lt_book` 행 수와 `sy-dbcnt`.
2. `lt_stat`의 `booked` 값.
3. `seat_status`가 capacity 기준과 맞는지.
4. `C003`처럼 예매가 없는 공연이 사라지지 않고 남는지.
5. 취소 상태 `C`가 합계에서 빠졌는지.

### 실수와 주의

첫째, `s_conc` 앞의 `@`를 빼면 안 된다. range table도 ABAP host variable이다.

둘째, `LEFT OUTER JOIN` 조건 위치를 주의한다. 취소 예매 제외 조건 `b~status <> 'C'`를 join `ON`에 둘지, `WHERE`에 둘지에 따라 예매가 없는 공연이 사라질 수 있다. 이 실습에서는 예매가 없는 공연도 보여 주기 위해 오른쪽 테이블 조건을 `ON`에 둔다.

셋째, `SUM( b~seats ) AS booked` alias를 같은 SELECT list의 `CASE`에서 바로 쓰지 않는다. expression을 반복하거나 후속 ABAP 단계로 나눈다.

넷째, `COALESCE`는 null 처리다. 예매가 없는 공연의 합계가 null이 될 수 있으므로 `0`으로 대체한다. 이미 `0`인 값을 바꾸는 함수가 아니다.

다섯째, SQL 결과가 맞는지 반드시 업무 데이터로 검증한다. 문법이 modern이어도, 취소 예매 포함 여부나 outer join 보존 여부가 틀리면 업무 결과는 틀린다.

### 체험형 학습 설계

**실습 장치: Concert Modern SQL Lab**

데이터:
- `zconcert` 3행.
- `zbooking` 4~6행. 정상, 취소, 예매 없음 케이스 포함.
- selection range `s_conc`: 전체, C001만, 없는 공연ID.

버튼:
- `classic 조회 실행`: 기존 CH12/CH13 스타일 조회 결과를 보여 준다.
- `@ 적용`: `s_conc`와 target에 `@`를 붙인다.
- `콤마 적용`: SELECT list를 modern 필드 목록으로 바꾼다.
- `@DATA target 적용`: `lt_book`, `lt_stat`를 inline target으로 바꾼다.
- `CASE 상태 추가`: `seat_status` 컬럼을 계산한다.
- `COALESCE 켜기`: 예매 없는 공연의 booked 값을 `0`으로 보여 준다.
- `ON/WHERE 조건 비교`: 취소 제외 조건을 `ON`에 둘 때와 `WHERE`에 둘 때 결과 차이를 보여 준다.

상태:
- `selectedConcertRange`: 현재 selection 조건.
- `joinConditionPlacement`: ON 또는 WHERE.
- `coalesceEnabled`: true/false.
- `resultRows`: 공연별 집계 결과.
- `lostConcerts`: outer join 의도와 다르게 사라진 공연 목록.
- `systemFields`: `sy-subrc`, `sy-dbcnt`.
- `boundaryWarnings`: CH20/CH22 개념을 끌어왔는지 여부.

피드백:
- `ON` 조건에서 C003이 유지되면 "예매가 없어도 공연 목록은 유지됨"이라고 표시한다.
- `WHERE b~status <> 'C'`로 바꿔 C003이 사라지면 "outer join 후 WHERE가 오른쪽 null 행을 제거할 수 있음"이라고 설명한다.
- alias를 `CASE` 안에 넣으려 하면 "SELECT list alias는 같은 list의 SQL expression operand로 쓰지 않음"이라고 알려 준다.
- `@` 누락 시 "selection range도 ABAP host variable"이라고 강조한다.

### 정리

CH19-L08은 modern SQL 문법을 콘서트 예매 조회에 적용하는 실습이다. `@`, 콤마, `@DATA`, SQL `CASE`, `COALESCE`를 사용하지만, 업무 결과 검증이 더 중요하다. 취소 예매가 합계에서 빠지는지, 예매 없는 공연이 유지되는지, `sy-dbcnt`와 결과 행 수가 맞는지 확인해야 한다.

## CH19 마무리 정리

| 질문 | 기대 답 |
|---|---|
| `@`는 왜 쓰는가? | SQL 문장 안에서 ABAP 변수/target을 host operand로 표시하기 위해 쓴다. |
| DB 컬럼에도 `@`를 붙이는가? | 아니다. DB 컬럼은 SQL 쪽 이름이므로 `@`를 붙이지 않는다. |
| 콤마 필드 목록은 왜 중요한가? | 필드 경계를 명확히 하고 strict mode의 modern SELECT list 규칙에 맞추기 위해서다. |
| `INTO TABLE @DATA(lt)`는 무엇을 만드는가? | SELECT 결과 row type을 기준으로 standard internal table with empty key를 inline 선언한다. |
| 계산 컬럼에는 왜 alias가 필요한가? | 결과 구조에서 컬럼 이름으로 읽히고 inline target이 명확해지기 때문이다. |
| SQL expression은 어디서 실행되는가? | 데이터베이스에서 실행되고 결과가 AS ABAP으로 전달된다. |
| `COALESCE`는 무엇을 대체하는가? | ABAP initial 값이 아니라 DB null 값을 대체한다. |
| SQL `SUBSTRING`과 ABAP `substring`은 같은가? | 이름은 비슷하지만 실행 위치와 인자 규칙을 구분해야 한다. |
| `SELECT FROM @itab`은 언제 쓰는가? | 이미 ABAP 메모리에 있는 internal table을 SQL식으로 재가공할 때 쓴다. |
| CH19에서 아직 하지 않는 것은 무엇인가? | OO 설계, CDS DDL, 고급 SQL, Native SQL/ADBC, 복잡한 SQL engine 최적화다. |

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
- SELECT list의 모든 필드가 콤마로 구분되어 있는가?
- `INTO TABLE @DATA( )`가 만든 테이블이 key 기반 후속 조회에 적합한지 판단했는가?
- 취소 예매 제외 조건을 `ON`에 둔 이유를 설명할 수 있는가?
- `booked` alias를 같은 SELECT list의 `CASE`에서 바로 쓰지 않은 이유를 설명할 수 있는가?
- 예매가 없는 공연의 `booked`가 null이 아니라 `0`으로 보이는지 확인했는가?
- `sy-subrc`, `sy-dbcnt`, `lines( lt_stat )`를 기록했는가?

좋은 CH19 답안은 modern SQL 문법을 적용했을 뿐 아니라, SQL과 ABAP의 경계, DB 계산 위치, 결과 타입, 시스템 필드, 업무 결과를 함께 검증한다.
