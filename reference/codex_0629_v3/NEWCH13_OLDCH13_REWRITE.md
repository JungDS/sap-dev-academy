# CH13_REWRITE - Open SQL Classic Join and Aggregation

> 기준 소스: `content/abap/CH13/_chapter.md`, `content/abap/CH13/CH13-L01.md` ~ `CH13-L08.md`
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 기존 `reference/codex_0625`, `reference/codex_0625_v2`
> 공식 문서 확인: `C:\ABAP_DOCU_HTML`의 `SELECT`, `FROM JOIN`, `GROUP BY`, aggregate expression, `HAVING`, `ORDER BY`, `FOR ALL ENTRIES`, `DISTINCT`, `INTO`, SQL null, classic/modern SQL list 경계 항목을 수동 확인

## 챕터 설계

CH08에서 학습자는 한 테이블을 읽었다. CH11에서는 읽은 결과를 SALV 표로 보여 주었고, CH12에서는 선택화면 조건으로 필요한 행만 골랐다. 이제 남은 큰 불편은 "업무 데이터가 한 테이블에만 있지 않다"는 점이다.

예매 테이블에는 공연 ID가 있지만 아티스트명은 공연 테이블에 있다. 공연 테이블에는 정원이 있지만 실제 예매 좌석 수는 예매 테이블에 여러 행으로 쌓인다. 회차 테이블에는 공연일과 시간이 따로 있다.

```text
한 테이블을 읽는다        -> 단순 목록
여러 테이블을 합친다      -> 업무 문장이 완성됨
여러 행을 묶어 집계한다   -> 현황 리포트가 됨
정렬하고 기준 목록으로 조회한다 -> 사용자가 읽을 수 있는 결과가 됨
```

CH13의 목표는 classic Open SQL로 여러 테이블을 합치고, 묶고, 세고, 합산하고, 정렬하는 것이다. SQL 문법을 많이 외우는 장이 아니라 "결과 행이 왜 늘고 줄어드는지"를 설명할 수 있게 만드는 장이다.

CH13은 classic-first 경계를 지킨다. 예제의 SELECT list는 공백 구분 classic 형태로 쓰고, modern host marker와 comma-separated field list는 CH19로 미룬다. Right/Full join, SQL expression, CTE, window function, CDS, view entity, null 보정용 SQL expression은 CH13 범위가 아니다. 이 장은 읽기 전용 SELECT만 다룬다.

## CH13-L01 - INNER JOIN 기본 개념과 구현

### 왜 필요한가

한 테이블만 읽으면 업무 문장이 자주 끊긴다. 예매 테이블을 보면 `CONCERT_ID`는 있지만 아티스트명은 없다. 공연 테이블을 보면 아티스트명은 있지만 고객별 예매 좌석은 없다. 프로그램 안에서 각각 읽고 LOOP로 맞출 수도 있지만, 그렇게 하면 코드가 길어지고 중복과 누락을 찾기 어렵다.

JOIN은 데이터베이스가 두 표를 공통 키로 맞춰 한 줄로 붙이게 하는 도구다. 입문자는 먼저 이렇게 이해하면 된다.

```text
zbooking                        zconcert
booking_id concert_id seats     concert_id artist
5001       C001       2         C001       안유진
5002       C002       1         C002       신유빈

INNER JOIN 결과
booking_id concert_id seats artist
5001       C001       2     안유진
5002       C002       1     신유빈
```

JOIN을 배우는 이유는 "필드를 더 가져오기 위해서"만이 아니다. 업무상 한 문장인 데이터를 한 결과 집합으로 만들기 위해서다.

### 무엇인가

INNER JOIN은 양쪽 테이블에 모두 짝이 있는 행만 결과에 남긴다.

```abap
TYPES: BEGIN OF ty_out,
         booking_id TYPE zbooking-booking_id,
         concert_id TYPE zbooking-concert_id,
         artist     TYPE zconcert-artist,
         seats      TYPE zbooking-seats,
       END OF ty_out.

DATA: lt_out TYPE TABLE OF ty_out,
      ls_out TYPE ty_out.

SELECT b~booking_id b~concert_id c~artist b~seats
  FROM zbooking AS b
  INNER JOIN zconcert AS c
    ON b~concert_id = c~concert_id
  INTO CORRESPONDING FIELDS OF TABLE lt_out.

LOOP AT lt_out INTO ls_out.
  WRITE: / ls_out-booking_id,
           ls_out-concert_id,
           ls_out-artist,
           ls_out-seats.
ENDLOOP.
```

구성 요소를 분해하면 다음과 같다.

| 코드 | 의미 |
|---|---|
| `FROM zbooking AS b` | 예매 테이블을 `b`라는 별칭으로 부른다 |
| `INNER JOIN zconcert AS c` | 공연 테이블을 붙인다 |
| `ON b~concert_id = c~concert_id` | 두 테이블의 공연 ID가 같은 행만 짝으로 인정한다 |
| `b~booking_id` | `b` 별칭 테이블의 `booking_id` 필드 |
| `c~artist` | `c` 별칭 테이블의 `artist` 필드 |

`~`는 table component selector다. JOIN에서는 같은 이름의 필드가 여러 테이블에 있을 수 있으므로 `b~concert_id`, `c~concert_id`처럼 어느 테이블의 필드인지 명확히 써야 한다.

복합 키도 중요하다. 회차 테이블이 `concert_id`와 `perf_no` 둘로 식별된다면 둘 다 `ON` 조건에 있어야 한다.

```abap
SELECT b~booking_id pf~perf_date pf~perf_time
  FROM zbooking AS b
  INNER JOIN zperf AS pf
    ON  b~concert_id = pf~concert_id
    AND b~perf_no    = pf~perf_no
  INTO CORRESPONDING FIELDS OF TABLE lt_perf.
```

`concert_id`만 맞추고 `perf_no`를 빼면 같은 공연의 여러 회차가 잘못 붙어 행이 늘어날 수 있다.

### 어떻게 확인하는가

JOIN 결과는 세 가지로 확인한다.

| 확인 | 질문 |
|---|---|
| 원본 행 | 왼쪽과 오른쪽에 어떤 키가 있는가 |
| `ON` 조건 | 어떤 필드가 같은 경우에만 붙이는가 |
| 결과 행 수 | 왜 이 행 수가 되었는가 |

디버거에서는 `lt_out`에 들어온 행 수와 각 행의 `artist`를 확인한다. 예매에는 있는데 공연 테이블에 없는 `concert_id`가 있다면 INNER JOIN 결과에서는 그 예매가 빠진다. 이것은 오류가 아니라 INNER JOIN의 정의다.

`sy-subrc`와 `sy-dbcnt`도 확인한다. 조회 결과가 있으면 `sy-subrc`는 0이고, `sy-dbcnt`는 전달된 행 수를 나타낸다. 하지만 `sy-subrc = 0`만 보고 끝내면 안 된다. JOIN에서는 "행 수가 업무적으로 맞는가"가 더 중요하다.

### 체험 설계

L01에는 "JOIN 짝 맞추기 보드"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `ON 조건 적용`, `INNER 결과 만들기`, `키 누락 실험`, `복합 키 모두 적용` |
| 상태 | 왼쪽 행, 오른쪽 행, 연결선, 결과 행 수 |
| 데이터 | `ZBOOKING` 예매 4건, `ZCONCERT` 공연 3건, `ZPERF` 회차 4건 |
| 피드백 | 매칭 없는 행은 "INNER라서 제외", 복합 키 일부 누락 시 "행 뻥튀기" 표시 |

복합 키 실험에서는 `concert_id`만 켰을 때와 `concert_id + perf_no`를 모두 켰을 때 결과 행 수를 비교한다. 학습자는 `ON` 조건 하나가 결과 품질을 결정한다는 점을 눈으로 본다.

### 실수와 주의

`ON` 조건 누락이나 불완전한 `ON` 조건은 가장 위험하다. 프로그램이 문법 오류 없이 실행되어도 결과가 조용히 틀릴 수 있다.

별칭을 쓰지 않으면 같은 필드명 때문에 의미가 모호해진다. JOIN 예제에서는 `AS b`, `AS c`, `b~field`, `c~field`를 기본 습관으로 둔다.

CH13에서는 modern Open SQL을 섞지 않는다. field list는 classic 공백 구분으로 읽고, host marker와 comma field list는 CH19에서 다시 배운다.

### 정리

INNER JOIN은 두 테이블을 `ON` 조건으로 짝지어 양쪽에 모두 매칭되는 행만 남긴다. `AS`는 별칭이고, `~`는 어느 테이블의 필드인지 지정한다. JOIN 결과가 맞는지는 문법보다 `ON` 조건과 결과 행 수로 확인한다.

## CH13-L02 - LEFT OUTER JOIN 기본 개념과 NULL 처리

### 왜 필요한가

INNER JOIN은 매칭이 없는 행을 버린다. 이것은 정확한 동작이지만 항상 원하는 결과는 아니다. 공연별 예매 현황에서 예매가 하나도 없는 공연도 보여야 한다면 INNER JOIN은 부적합하다. 예매 없는 공연이 결과에서 사라지면 "예매 0건"이 아니라 "공연 자체가 없는 것처럼" 보인다.

LEFT OUTER JOIN은 기준 목록을 보존할 때 필요하다. "왼쪽 테이블의 행은 모두 남기고, 오른쪽에 맞는 행이 있으면 붙인다"는 뜻이다.

### 무엇인가

LEFT OUTER JOIN은 왼쪽 data source의 행을 모두 결과에 남긴다. 오른쪽에 `ON` 조건을 만족하는 행이 없으면 오른쪽 필드는 DB의 null 값이 된다. ABAP data object로 전달될 때는 타입별 초기값처럼 보일 수 있지만, null과 ABAP 초기값은 개념적으로 다르다.

```abap
TYPES: BEGIN OF ty_status,
         concert_id TYPE zconcert-concert_id,
         artist     TYPE zconcert-artist,
         booking_id TYPE zbooking-booking_id,
         seats      TYPE zbooking-seats,
       END OF ty_status.

DATA: lt_status TYPE TABLE OF ty_status,
      ls_status TYPE ty_status.

SELECT c~concert_id c~artist b~booking_id b~seats
  FROM zconcert AS c
  LEFT OUTER JOIN zbooking AS b
    ON c~concert_id = b~concert_id
  INTO CORRESPONDING FIELDS OF TABLE lt_status.

LOOP AT lt_status INTO ls_status.
  WRITE: / ls_status-concert_id,
           ls_status-artist,
           ls_status-booking_id,
           ls_status-seats.
ENDLOOP.
```

이 예제에서 왼쪽은 `zconcert`다. 따라서 예매가 없는 공연도 결과에 남는다.

한 SELECT 안에서 INNER와 LEFT OUTER를 섞을 수도 있다.

```abap
SELECT b~booking_id c~artist pf~perf_date
  FROM zbooking AS b
  INNER JOIN zconcert AS c
    ON c~concert_id = b~concert_id
  LEFT OUTER JOIN zperf AS pf
    ON  pf~concert_id = b~concert_id
    AND pf~perf_no    = b~perf_no
  INTO CORRESPONDING FIELDS OF TABLE lt_out.
```

공연은 예매의 필수 부모라면 INNER가 맞고, 회차 정보는 일시적으로 비어 있을 수 있다면 LEFT OUTER가 맞을 수 있다. JOIN 종류는 기술 취향이 아니라 "업무상 어느 행을 보존해야 하는가"로 고른다.

### 어떻게 확인하는가

다음 데이터를 생각한다.

```text
zconcert: C001, C002, C003
zbooking: C001 예매 2건, C002 예매 1건
```

INNER JOIN 결과에는 C001, C002 관련 행만 나온다. LEFT OUTER JOIN 결과에는 C003도 남고, 예매 쪽 필드는 비어 보인다.

디버거에서는 `lt_status`에 C003이 있는지 확인한다. C003이 없으면 JOIN 종류를 잘못 썼거나, `WHERE` 조건이 오른쪽 테이블의 빈 값을 걸러 버렸을 수 있다.

### 체험 설계

L02에는 "LEFT 보존 스위치"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `INNER JOIN`, `LEFT OUTER JOIN`, `오른쪽 WHERE 조건 켜기`, `ON 조건으로 이동` |
| 상태 | 보존된 공연 수, 매칭된 예매 수, 오른쪽 값 없음 표시 |
| 데이터 | 공연 C001~C003, 예매 C001/C002만 존재 |
| 피드백 | C003이 INNER에서는 사라지고 LEFT에서는 "왼쪽 보존" 배지로 남음 |

`오른쪽 WHERE 조건 켜기` 버튼은 LEFT OUTER JOIN을 썼는데도 오른쪽 테이블 조건 때문에 매칭 없는 행이 사라질 수 있음을 보여 준다.

### 실수와 주의

기준이 되는 테이블을 왼쪽에 두지 않으면 LEFT OUTER JOIN의 의미가 바뀐다. "모두 남길 쪽"을 먼저 생각한다.

오른쪽 테이블 필드를 `WHERE`에서 제한하면 매칭 없는 행이 걸러질 수 있다. LEFT를 썼는데 결과가 INNER처럼 보이면 오른쪽 조건 위치를 확인한다.

DB null과 ABAP 초기값을 같은 것으로 설명하지 않는다. CH13에서는 null indicator나 SQL expression까지 확장하지 않고, outer join의 빈 오른쪽 값이 ABAP에서 초기값처럼 보일 수 있다는 수준으로 제한한다.

### 정리

LEFT OUTER JOIN은 왼쪽 기준 행을 보존한다. 매칭되는 오른쪽 행이 없으면 오른쪽 필드는 null이 되고, ABAP 내부에서는 초기값처럼 보일 수 있다. 기준 목록을 빠뜨리면 안 되는 조회에서는 INNER와 LEFT의 차이를 반드시 확인해야 한다.

## CH13-L03 - GROUP BY와 Aggregate

### 왜 필요한가

예매 목록을 행 단위로 보는 것만으로는 현황을 알기 어렵다.

```text
C001 예매 2석
C001 예매 4석
C001 예매 3석
```

운영 담당자가 알고 싶은 것은 각 행이 아니라 "C001 공연에 총 몇 석이 예매되었는가"다. 이때 DB에서 여러 행을 묶고 합계를 내는 도구가 `GROUP BY`와 aggregate function이다.

### 무엇인가

`GROUP BY`는 같은 그룹 키를 가진 행들을 한 행으로 묶는다. aggregate function은 그 그룹 안의 값을 세거나 합산하거나 최대/최소를 구한다.

```abap
TYPES: BEGIN OF ty_sum,
         concert_id TYPE zbooking-concert_id,
         cnt        TYPE i,
         seats      TYPE i,
       END OF ty_sum.

DATA lt_sum TYPE TABLE OF ty_sum.

SELECT concert_id COUNT( * ) AS cnt SUM( seats ) AS seats
  FROM zbooking
  INTO CORRESPONDING FIELDS OF TABLE lt_sum
  GROUP BY concert_id.
```

자주 쓰는 aggregate function은 다음과 같다.

| 함수 | 의미 |
|---|---|
| `COUNT( * )` | 그룹 안의 행 수 |
| `SUM( seats )` | 그룹 안의 좌석 수 합계 |
| `MIN( seats )` | 그룹 안의 최소값 |
| `MAX( seats )` | 그룹 안의 최대값 |
| `AVG( seats )` | 그룹 안의 평균 |

공식 문서의 `GROUP BY` 규칙에서 중요한 점은 SELECT list에 있는 비집계 컬럼은 `GROUP BY`에도 있어야 한다는 것이다. 아래처럼 `status`를 그냥 SELECT list에 넣으면 "공연별 그룹에서 어떤 status를 대표로 보여 줄 것인가"가 정의되지 않는다.

```abap
" 잘못된 생각: concert_id로 묶는데 status를 그냥 가져오려 함
SELECT concert_id status COUNT( * ) AS cnt
  FROM zbooking
  INTO CORRESPONDING FIELDS OF TABLE lt_bad
  GROUP BY concert_id.
```

`status`도 보고 싶다면 `GROUP BY concert_id status`로 그룹 키에 추가하거나, status별 집계가 필요한지 요구사항을 다시 확인해야 한다.

`DISTINCT`도 CH13-L03에서 함께 정리한다. 집계가 아니라 중복 행 제거만 필요하면 `SELECT DISTINCT`를 쓴다.

```abap
DATA lt_concert TYPE TABLE OF zbooking-concert_id.

SELECT DISTINCT concert_id
  FROM zbooking
  INTO TABLE lt_concert.
```

`GROUP BY`는 묶어서 요약하는 도구이고, `DISTINCT`는 같은 결과 행을 한 번만 남기는 도구다.

### 어떻게 확인하는가

다음 데이터로 확인한다.

| BOOKID | CONCERT_ID | SEATS |
|---|---|---|
| 5001 | C001 | 2 |
| 5002 | C001 | 4 |
| 5003 | C002 | 1 |

`GROUP BY concert_id` 결과는 C001 한 행, C002 한 행이다. C001의 `COUNT( * )`는 2이고 `SUM( seats )`는 6이다.

`SELECT DISTINCT concert_id` 결과도 C001, C002 두 행이지만 합계와 건수는 없다. 여기서 GROUP BY와 DISTINCT의 차이를 확인한다.

### 체험 설계

L03에는 "행 묶기 실험실"을 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `원본 행 보기`, `concert_id로 묶기`, `COUNT`, `SUM`, `DISTINCT`, `잘못된 평컬럼 추가` |
| 상태 | 그룹 키, 그룹별 원본 행, 집계 결과, 오류 메시지 |
| 데이터 | 예매 6건, 공연 ID와 좌석 수 |
| 피드백 | 그룹 키가 아닌 컬럼을 SELECT에 넣으면 "그룹 대표값을 정할 수 없습니다" 표시 |

`DISTINCT` 버튼은 GROUP BY 결과와 나란히 보여 준다. `DISTINCT`에는 합계가 없고 중복 제거만 있다는 차이를 시각적으로 보여 준다.

### 실수와 주의

`GROUP BY`에 없는 컬럼을 집계 없이 SELECT list에 넣으면 안 된다. 그룹 한 행에 어떤 값을 넣을지 정해지지 않기 때문이다.

`SUM` 결과 타입은 충분히 크게 잡아야 한다. 작은 정수 타입에 큰 금액이나 수량 합계를 담으면 오버플로 위험이 있다.

`DISTINCT`를 집계로 오해하지 않는다. 중복 없는 목록만 필요하면 DISTINCT, 그룹별 건수와 합계가 필요하면 GROUP BY와 aggregate를 사용한다.

### 정리

`GROUP BY`는 여러 행을 그룹 키 기준으로 묶고, aggregate function은 그룹 안의 값을 요약한다. 비집계 컬럼은 그룹 키에 포함되어야 한다. `DISTINCT`는 중복 행 제거 도구이며, 집계와 목적이 다르다.

## CH13-L04 - HAVING과 집계 조건

### 왜 필요한가

`WHERE`는 개별 행을 먼저 거른다. 하지만 "예매 건수가 5건 이상인 공연만", "좌석 합계가 80석 이상인 공연만" 같은 조건은 집계한 뒤에야 판단할 수 있다.

집계 결과를 기준으로 그룹을 거르는 도구가 `HAVING`이다.

### 무엇인가

`WHERE`와 `HAVING`은 시점이 다르다.

| 절 | 시점 | 대상 |
|---|---|---|
| `WHERE` | 그룹 만들기 전 | 개별 DB 행 |
| `GROUP BY` | 행을 묶음 | 그룹 |
| `HAVING` | 그룹 만든 후 | 집계 결과 |

예제:

```abap
SELECT concert_id COUNT( * ) AS cnt SUM( seats ) AS seats
  FROM zbooking
  INTO CORRESPONDING FIELDS OF TABLE lt_sum
  WHERE status = 'N'
  GROUP BY concert_id
  HAVING COUNT( * ) >= 5.
```

이 SQL은 먼저 예약 상태 `N`인 개별 행만 남긴다. 그다음 공연별로 묶는다. 마지막으로 예매 건수가 5건 이상인 그룹만 결과에 남긴다.

### 어떻게 확인하는가

확인 순서는 파이프라인으로 본다.

```text
원본 행
 -> WHERE status = 'N'
 -> GROUP BY concert_id
 -> COUNT, SUM 계산
 -> HAVING COUNT( * ) >= 5
 -> 최종 결과
```

`WHERE COUNT( * ) >= 5`처럼 쓰면 안 된다. `WHERE` 단계에서는 아직 그룹별 건수가 계산되지 않았기 때문이다.

### 체험 설계

L04에는 "WHERE와 HAVING 2단 필터 파이프라인"을 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `WHERE 적용`, `GROUP BY`, `COUNT 계산`, `HAVING 적용`, `잘못된 WHERE COUNT` |
| 상태 | 각 단계별 행 수, 그룹 수, 탈락 이유 |
| 데이터 | 예약/취소 상태가 섞인 예매 목록 |
| 피드백 | WHERE는 행을 줄이고 HAVING은 그룹을 줄인다는 차이 표시 |

`잘못된 WHERE COUNT` 버튼을 누르면 "COUNT는 그룹 후에 생기는 값이므로 WHERE에서 사용할 수 없습니다"라고 안내한다.

### 실수와 주의

집계 조건을 `WHERE`에 쓰려는 실수가 많다. 집계 함수 결과로 거르는 조건은 `HAVING`이다.

절 순서를 헷갈리지 않는다. 기본 흐름은 `WHERE -> GROUP BY -> HAVING -> ORDER BY`다.

`HAVING`에 너무 많은 조건을 몰아넣으면 개별 행 필터와 그룹 필터가 섞인다. 개별 행에서 먼저 줄일 수 있는 조건은 `WHERE`에 두는 것이 읽기 쉽다.

### 정리

`WHERE`는 그룹 전의 개별 행 조건이고, `HAVING`은 그룹 후의 집계 조건이다. 집계 결과로 필터링하려면 `HAVING`을 사용한다.

## CH13-L05 - ORDER BY 정렬 조회

### 왜 필요한가

DB에서 읽은 결과의 순서는 보장되지 않는다. 우연히 원하는 순서로 보인다고 해서 다음 실행이나 다른 DB에서도 같은 순서라고 믿으면 안 된다. 사용자가 읽을 리포트라면 정렬 기준을 명시해야 한다.

ABAP 내부 테이블을 읽은 뒤 `SORT`할 수도 있지만, DB에서 바로 정렬된 결과가 필요할 때는 `ORDER BY`를 사용한다.

### 무엇인가

classic 예제:

```abap
DATA lt_book TYPE TABLE OF zbooking.

SELECT booking_id concert_id status seats
  FROM zbooking
  INTO CORRESPONDING FIELDS OF TABLE lt_book
  ORDER BY concert_id ASCENDING seats DESCENDING.
```

이 예제는 공연 ID는 오름차순, 같은 공연 안에서는 좌석 수를 내림차순으로 정렬한다.

기본 키 순으로 받고 싶을 때는 다음 형태도 있다.

```abap
SELECT booking_id concert_id status seats
  FROM zbooking
  INTO CORRESPONDING FIELDS OF TABLE lt_book
  ORDER BY PRIMARY KEY.
```

공식 문서의 `ORDER BY` 설명에서 중요한 점은 `ORDER BY`가 없으면 결과 순서가 정의되지 않는다는 것이다. 또한 DB 정렬은 비용이 들 수 있으므로 필요한 경우에만 사용한다.

### 어떻게 확인하는가

같은 SELECT를 두 가지 방식으로 비교한다.

1. `ORDER BY` 없이 실행한다.
2. `ORDER BY concert_id ASCENDING seats DESCENDING`으로 실행한다.

두 번째 결과에서는 공연 ID가 묶이고, 같은 공연 안에서 좌석 수가 큰 예매가 먼저 나온다. 정렬 기준이 여러 개이면 앞 기준이 먼저 적용되고, 같은 값 안에서 다음 기준이 적용된다.

### 체험 설계

L05에는 "정렬 우선순위 조작기"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `정렬 없음`, `공연 오름차순`, `좌석 내림차순`, `공연+좌석`, `PRIMARY KEY` |
| 상태 | 현재 ORDER BY 절, 결과 순서, 같은 공연 안의 2차 정렬 |
| 데이터 | 공연 ID와 좌석 수가 섞인 예매 6건 |
| 피드백 | ORDER BY가 없으면 "순서 보장 없음", 다중 정렬이면 "1차 기준 후 2차 기준" 표시 |

### 실수와 주의

`ORDER BY`가 없는데 화면에 보이는 순서를 신뢰하지 않는다. DB 결과 순서는 명시하지 않으면 정의되지 않는다.

대량 데이터에 불필요한 정렬을 걸면 DB 부담이 커진다. 인덱스와 사용 목적을 고려한다.

이미 내부 테이블로 읽은 소량 데이터라면 ABAP `SORT`가 더 단순할 수 있다. DB에서 줄이고 정렬해서 가져올지, ABAP에서 읽은 뒤 정렬할지는 데이터량과 용도에 따라 결정한다.

### 정리

`ORDER BY`는 DB 결과를 명시한 기준으로 정렬한다. 정렬 기준이 없으면 결과 순서는 보장되지 않는다. 여러 기준을 나열하면 앞 기준부터 차례로 적용된다.

## CH13-L06 - FOR ALL ENTRIES 사용 기준

### 왜 필요한가

이미 내부 테이블에 기준 목록이 있을 때가 있다. 예를 들어 선택화면이나 앞 단계 로직으로 공연 ID 목록 `lt_conc`를 만들었고, 그 목록에 해당하는 예매만 DB에서 다시 읽고 싶을 수 있다.

이때 사용할 수 있는 classic 도구가 `FOR ALL ENTRIES`다. 하지만 FAE는 초급자에게 매우 위험한 함정이 있다. 기준 내부 테이블이 비어 있으면 WHERE 조건이 무시되어 전체 조회가 될 수 있다.

### 무엇인가

기본 형태는 다음과 같다.

```abap
DATA: lt_conc TYPE TABLE OF zconcert,
      lt_book TYPE TABLE OF zbooking.

IF lt_conc IS NOT INITIAL.
  SELECT booking_id concert_id seats status
    FROM zbooking
    INTO CORRESPONDING FIELDS OF TABLE lt_book
    FOR ALL ENTRIES IN lt_conc
    WHERE concert_id = lt_conc-concert_id.
ENDIF.
```

읽는 순서는 다음과 같다.

| 코드 | 의미 |
|---|---|
| `lt_conc IS NOT INITIAL` | 기준 목록이 비어 있지 않은지 먼저 확인 |
| `FOR ALL ENTRIES IN lt_conc` | 내부 테이블의 행들을 조건 기준으로 사용 |
| `WHERE concert_id = lt_conc-concert_id` | DB 필드와 기준 내부 테이블 필드를 비교 |

공식 문서에서도 기준 내부 테이블이 비어 있으면 WHERE 조건이 무시된다는 점을 명확히 경고한다. 따라서 FAE 예제에서 `IS NOT INITIAL`은 선택 사항이 아니라 필수 안전장치다.

### 어떻게 확인하는가

두 시나리오를 비교한다.

```text
lt_conc = C001, C002
 -> C001 또는 C002 예매만 조회

lt_conc = 비어 있음
 -> 보호 IF가 있으면 SELECT 자체를 실행하지 않음
 -> 보호 IF가 없으면 전체 예매 조회 위험
```

또 하나의 확인점은 중복 제거다. FAE 결과는 중복 행이 제거될 수 있다. 기준 내부 테이블에 같은 `concert_id`가 여러 번 있더라도 결과 행이 그만큼 반복된다고 기대하면 안 된다.

### 체험 설계

L06에는 "FAE 안전장치 시뮬레이터"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `기준 목록 C001/C002`, `기준 목록 비우기`, `IS NOT INITIAL 켜기`, `IS NOT INITIAL 끄기`, `중복 기준 추가` |
| 상태 | `lt_conc` 행 수, SELECT 실행 여부, 결과 행 수, 위험 경고 |
| 데이터 | 공연 목록과 예매 목록 |
| 피드백 | 빈 기준 목록 + 보호 없음이면 "전체 조회 위험"을 빨간 상태로 표시 |

중복 기준 추가 버튼은 `lt_conc`에 C001을 두 번 넣어도 결과가 두 배로 늘지 않을 수 있음을 보여 준다.

### 실수와 주의

`IS NOT INITIAL` 확인을 빼면 안 된다. CH13에서 FAE를 배운다는 것은 문법을 배우는 것이 아니라 이 안전장치를 몸에 붙이는 것이다.

FAE는 JOIN의 대체품이 항상 아니다. 이미 내부 테이블 기준 목록이 있을 때 유용하지만, 처음부터 DB 테이블끼리 키로 합치면 되는 경우에는 JOIN이 더 단순할 수 있다.

FAE와 집계, 정렬에는 제약이 있다. CH13에서는 FAE를 기준 목록 조회 도구로만 사용하고, GROUP BY와 섞어 복잡한 SQL을 만들지 않는다.

### 정리

`FOR ALL ENTRIES`는 내부 테이블의 값 목록을 조건으로 DB를 조회하는 classic 도구다. 기준 내부 테이블이 비어 있으면 전체 조회 위험이 있으므로 반드시 `IS NOT INITIAL`로 보호한다. 중복 제거와 제약도 함께 기억해야 한다.

## CH13-L07 - JOIN / FAE / ABAP 처리 선택 기준

### 왜 필요한가

CH13까지 오면 데이터를 합치는 방법이 여러 개 생긴다. DB에서 JOIN할 수도 있고, 이미 가진 내부 테이블을 기준으로 FAE를 쓸 수도 있고, 소량 데이터라면 ABAP 내부 테이블끼리 LOOP와 READ로 맞출 수도 있다.

도구가 많아지면 초급자는 "무엇이 정답인가"를 묻는다. 정답은 하나가 아니라 상황에 따른 선택이다.

### 무엇인가

세 방법을 비교하면 다음과 같다.

| 방법 | 일을 주로 하는 곳 | 적합한 상황 | 주의 |
|---|---|---|---|
| JOIN | DB | DB 테이블끼리 키로 바로 합칠 수 있음 | `ON` 조건 정확성 |
| FAE | DB | 이미 내부 테이블 기준 목록이 있음 | 빈 기준 목록 전체 조회 위험 |
| ABAP 처리 | 앱 서버 | 소량 데이터, 이미 읽은 데이터, 예외적 가공 | LOOP 안 SELECT 금지 |

일반 원칙은 다음과 같다.

```text
DB 테이블끼리 바로 합칠 수 있으면 JOIN을 먼저 검토한다.
이미 내부 테이블 기준 목록이 있으면 FAE를 검토한다.
이미 읽은 소량 데이터의 단순 매칭은 ABAP 처리도 가능하다.
LOOP 안에서 SELECT를 반복하는 구조는 피한다.
```

### 어떻게 확인하는가

상황별로 판단한다.

| 상황 | 선택 |
|---|---|
| 예매와 공연을 공연 ID로 한 번에 보여 준다 | JOIN |
| 선택화면 처리 후 내부 테이블에 공연 ID 목록이 이미 있다 | FAE |
| 조회된 20건에 화면 표시용 설명만 붙인다 | ABAP 처리 가능 |
| 10,000건 LOOP 안에서 매번 SELECT SINGLE을 한다 | JOIN 또는 FAE로 바꿔야 함 |

성능 문제는 보통 문법보다 왕복 횟수에서 시작한다. LOOP 안 SELECT는 행 수만큼 DB 왕복을 만들 수 있으므로 대표적인 안티패턴으로 본다.

### 체험 설계

L07에는 "조회 전략 의사결정 카드"를 둔다.

| 요소 | 설계 |
|---|---|
| 카드 | `DB 테이블 두 개`, `이미 내부 테이블 있음`, `소량 후처리`, `LOOP 안 SELECT`, `예매 없는 공연도 보존` |
| 선택지 | JOIN, FAE, ABAP 처리, 설계 재검토 |
| 상태 | 예상 DB 왕복, 누락 위험, 중복 위험, 코드 복잡도 |
| 피드백 | 선택 이유와 피해야 할 위험을 한 줄로 표시 |

`LOOP 안 SELECT` 카드를 ABAP 처리로 놓으면 "반복마다 DB 왕복이 생기므로 JOIN 또는 FAE로 바꾸는 후보입니다"라고 피드백한다.

### 실수와 주의

무조건 JOIN이 정답은 아니다. 이미 내부 테이블 기준 목록이 있고 그 목록이 복잡한 로직으로 만들어졌다면 FAE가 더 자연스러울 수 있다.

무조건 FAE도 정답이 아니다. DB 테이블끼리 단순 키로 합치면 되는 경우 FAE는 오히려 안전장치와 중복 처리를 더 신경 써야 한다.

ABAP 처리는 나쁜 것이 아니다. 이미 읽은 소량 데이터를 화면 표시용으로 살짝 가공하는 것은 자연스럽다. 문제는 대량 데이터에 대해 DB 조회를 반복하는 구조다.

### 정리

JOIN, FAE, ABAP 처리는 각각 적합한 상황이 다르다. 기본은 DB가 잘하는 일은 DB에 맡기고, 이미 가진 내부 테이블 기준 목록이 있을 때 FAE를 검토하며, LOOP 안 SELECT는 피하는 것이다.

## CH13-L08 - 실습: 공연별 예매현황 리포트

### 왜 필요한가

지금까지는 예매 목록을 행 단위로 보았다. 하지만 운영자가 자주 보는 것은 공연별 현황이다.

```text
C001 공연 정원 100석, 예매 14석
C002 공연 정원 50석, 예매 2석
C003 공연 정원 80석, 예매 0석
```

이 현황은 한 테이블에서 나오지 않는다. 공연 테이블의 정원과 아티스트, 예매 테이블의 좌석 수를 합쳐야 한다. 그리고 예매가 없는 공연도 0으로 보여야 하므로 LEFT OUTER JOIN이 필요하다.

### 무엇인가

공연별 예매 현황의 기본 예제는 다음과 같다.

```abap
TYPES: BEGIN OF ty_stat,
         concert_id TYPE zconcert-concert_id,
         artist     TYPE zconcert-artist,
         capacity   TYPE zconcert-capacity,
         booked     TYPE i,
         remain     TYPE i,
       END OF ty_stat.

DATA: lt_stat TYPE TABLE OF ty_stat,
      ls_stat TYPE ty_stat,
      lo_alv  TYPE REF TO cl_salv_table.

SELECT c~concert_id c~artist c~capacity SUM( b~seats ) AS booked
  FROM zconcert AS c
  LEFT OUTER JOIN zbooking AS b
    ON  c~concert_id = b~concert_id
    AND b~status     <> 'C'
  INTO CORRESPONDING FIELDS OF TABLE lt_stat
  GROUP BY c~concert_id c~artist c~capacity
  ORDER BY c~concert_id ASCENDING.

LOOP AT lt_stat INTO ls_stat.
  ls_stat-remain = ls_stat-capacity - ls_stat-booked.
  MODIFY lt_stat FROM ls_stat.
ENDLOOP.

TRY.
    cl_salv_table=>factory(
      IMPORTING
        r_salv_table = lo_alv
      CHANGING
        t_table      = lt_stat ).

    lo_alv->get_functions( )->set_all( abap_true ).
    lo_alv->display( ).
  CATCH cx_salv_msg.
    MESSAGE '공연별 예매현황 ALV 생성 실패' TYPE 'I'.
ENDTRY.
```

이 코드는 CH13의 핵심을 한 번에 묶는다.

| 코드 | 역할 |
|---|---|
| `LEFT OUTER JOIN` | 예매 없는 공연도 남긴다 |
| `AND b~status <> 'C'` | 취소 예매는 합계에서 제외한다 |
| `SUM( b~seats ) AS booked` | 공연별 예매 좌석 수를 합산한다 |
| `GROUP BY c~concert_id c~artist c~capacity` | 공연별 한 행으로 묶는다 |
| `ORDER BY c~concert_id` | 결과 순서를 명시한다 |

`remain`은 SQL에서 바로 계산하지 않고 ABAP LOOP로 계산한다. CH13에서는 SQL expression을 앞당기지 않고, 이미 배운 산술 대입과 LOOP 감각으로 처리한다.

### 어떻게 확인하는가

확인 순서는 다음과 같다.

1. 원본 `ZCONCERT`에 공연 C001, C002, C003이 있는지 확인한다.
2. `ZBOOKING`에 C001과 C002 예매만 있고 C003 예매가 없다고 가정한다.
3. LEFT OUTER JOIN 결과에 C003이 남는지 확인한다.
4. 취소 상태 `C`가 합계에서 빠졌는지 확인한다.
5. `SUM( b~seats )` 결과가 공연별 합계와 맞는지 수기로 더해 본다.
6. `remain = capacity - booked` 계산이 맞는지 확인한다.
7. SALV에서 정렬, 필터, 합계를 눌러 결과를 탐색한다.

기존 `CH13-L08-S01` 임베드는 LEFT OUTER JOIN과 INNER JOIN을 바꿔 비교하고, GROUP BY 결과가 어떻게 달라지는지 보여 주는 용도로 사용한다.

### 체험 설계

L08에는 "공연별 예매현황 JOIN + GROUP BY 시뮬레이터"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `LEFT OUTER JOIN`, `INNER JOIN`, `취소 제외 ON`, `GROUP BY 실행`, `잔여석 계산`, `SALV 표시` |
| 상태 | 원본 공연, 원본 예매, JOIN 중간 결과, 그룹 결과, 잔여석 |
| 데이터 | 공연 3건, 예매 6건, 취소 상태 1건 |
| 피드백 | 예매 없는 공연이 LEFT에서는 남고 INNER에서는 빠지는 차이 표시 |

`취소 제외 ON` 버튼은 조건을 ON에 두는 이유를 보여 준다. 공연은 보존하면서 합계 대상 예매만 제한해야 하기 때문이다.

### 실수와 주의

예매 없는 공연도 보여야 하는데 INNER JOIN을 쓰면 해당 공연이 사라진다. 공연별 현황에서는 이 차이가 치명적이다.

취소 제외 조건을 어디에 두는지 주의한다. LEFT OUTER JOIN에서 오른쪽 테이블 조건을 잘못 다루면 보존해야 할 공연이 사라질 수 있다.

집계 SELECT list에 있는 `c~concert_id`, `c~artist`, `c~capacity`는 모두 `GROUP BY`에도 있어야 한다.

SQL에서 `remain`까지 계산하려는 욕심은 CH13 범위를 넘을 수 있다. 지금은 SQL로 묶고 합산한 뒤, ABAP에서 잔여석을 계산하는 흐름으로 충분하다.

### 정리

CH13-L08은 공연 테이블과 예매 테이블을 LEFT OUTER JOIN으로 합치고, 공연별로 GROUP BY하여 예매 좌석 합계를 만드는 실습이다. 예매 없는 공연도 남기고, 취소 예매를 제외하고, 결과를 SALV로 확인한다.

## CH13 마무리

CH13은 classic Open SQL 조회의 큰 줄기를 정리하는 장이다. 한 테이블 조회에서 여러 테이블 결합과 집계 리포트로 넘어왔다.

학습자가 이 장을 마치면 다음을 말할 수 있어야 한다.

```text
INNER JOIN은 양쪽에 매칭되는 행만 남긴다.
LEFT OUTER JOIN은 왼쪽 기준 행을 보존한다.
ON 조건이 불완전하면 결과 행이 조용히 틀릴 수 있다.
GROUP BY는 행을 그룹으로 묶고 aggregate function은 그룹을 요약한다.
DISTINCT는 중복 행 제거이고 집계가 아니다.
HAVING은 그룹 후 집계 조건이다.
ORDER BY가 없으면 결과 순서는 보장되지 않는다.
FOR ALL ENTRIES는 빈 기준 테이블 보호가 필수다.
JOIN, FAE, ABAP 처리는 상황에 맞게 선택한다.
```

다음 CH14에서는 반복되는 JOIN 코드를 DDIC View로 올리고, 마스터 데이터를 표준 유지보수 화면으로 다루는 방향으로 이동한다.
