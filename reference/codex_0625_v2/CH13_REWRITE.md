# CH13_REWRITE - codex_0625_v2 재작업 원고

> 대상: `content/abap/CH13`
> 기준 판정: `reference/codex_0625/00_QUALITY_REVIEW.md`
> 작성 범위: CH13 1개 챕터만. 원본 `content/abap`은 수정하지 않는다.
> 목표: v1의 반복 지시문을 제거하고, CH13을 실제 강의자료 수준의 재집필 원고로 만든다.

## CH13 전체 설계

CH13은 CH08에서 배운 단일 테이블 조회를 넘어, 여러 테이블을 한 번에 읽고 데이터베이스에서 요약까지 수행하는 장이다. 학습자는 이미 `SELECT`, `WHERE`, Internal Table, SALV 기본 출력, `SELECT-OPTIONS`와 Range Table을 만났다. 이제 "한 표만 읽는 보고서"에서 "업무 관계를 가진 여러 표를 합쳐 읽는 보고서"로 넘어간다.

이 장의 핵심은 SQL 문법을 많이 외우는 것이 아니라, 결과 행이 왜 늘거나 줄어드는지 눈으로 설명할 수 있게 만드는 것이다. JOIN은 표를 옆으로 붙이는 도구이고, GROUP BY는 여러 행을 묶어 한 행으로 줄이는 도구이며, HAVING과 ORDER BY는 그 결과를 다시 제한하고 정렬하는 도구다. FOR ALL ENTRIES는 이미 메모리에 가진 목록을 조건으로 삼는 도구지만, 빈 테이블이면 조건이 사라지는 치명적인 함정이 있다.

학습 경계:

- CH13은 classic Open SQL 구간이다. 필드 목록은 공백 기반 classic 예제로 유지하고, modern host marker와 comma field list는 CH19에서 정식 도입한다.
- SQL expression, CTE, window function, CDS, view entity, `COALESCE` 같은 modern SQL 확장은 설명을 앞당기지 않는다.
- `REF TO`, SALV 정적 호출, `TRY/CATCH`는 CH11 실습 흐름의 재사용이자 CH20 전 선행 사용이다. CH13에서는 SALV 내부 구조를 가르치지 않는다.
- CH13의 모든 SQL은 읽기 전용이다. 데이터 변경, LUW, 잠금은 후속 장의 소유 범위다.
- 공식문서 근거는 자동 키워드 매칭이 아니라 `C:\ABAP_DOCU_HTML`에서 CH13 관련 문서만 직접 확인한 내용으로 제한한다.

수동 확인한 공식문서 근거:

| 문서 | CH13에서 쓰는 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abapselect.htm` | `SELECT`가 DB 데이터를 읽고 `sy-subrc`, `sy-dbcnt`를 설정한다는 확인 기준 |
| `C:\ABAP_DOCU_HTML\abapselect_join.htm` | INNER JOIN, LEFT OUTER JOIN, `ON`, `AS`, `~`, cross product 위험, outer join null 근거 |
| `C:\ABAP_DOCU_HTML\abapfrom_clause.htm` | `FROM` 뒤 data source와 join expression, alias 사용 근거 |
| `C:\ABAP_DOCU_HTML\abapselect_aggregate.htm` | `COUNT`, `SUM`, `MIN`, `MAX`, `AVG` 같은 aggregate expression 근거 |
| `C:\ABAP_DOCU_HTML\abapgroupby_clause.htm` | `GROUP BY`가 행 그룹을 한 행으로 결합하고, 비집계 컬럼 규칙을 요구한다는 근거 |
| `C:\ABAP_DOCU_HTML\abaphaving_clause.htm` | `HAVING`이 그룹 결과를 대상으로 조건을 거는 근거 |
| `C:\ABAP_DOCU_HTML\abaporderby_clause.htm` | `ORDER BY`, `ASCENDING`, `DESCENDING`, 정렬 순서 미지정 시 불확정, 성능 주의 근거 |
| `C:\ABAP_DOCU_HTML\abenwhere_all_entries.htm` | `FOR ALL ENTRIES`, 빈 내부 테이블 시 WHERE 무시, 중복 제거, `ORDER BY` 제한 근거 |
| `C:\ABAP_DOCU_HTML\abapselect_clause.htm` | `DISTINCT`가 중복 행을 제거한다는 근거 |
| `C:\ABAP_DOCU_HTML\abapinto_clause.htm` | `INTO TABLE`, `INTO CORRESPONDING FIELDS OF TABLE` 매핑 근거 |
| `C:\ABAP_DOCU_HTML\abenabap_sql_null_values.htm` | outer join과 aggregate에서 null이 생기고 ABAP data object로 넘어갈 때 초기값으로 변환된다는 근거 |
| `C:\ABAP_DOCU_HTML\abenwhere_logexp_null.htm` | SQL 조건에서 `IS NULL`, `IS NOT NULL`이 null을 확인하는 조건이라는 근거 |
| `C:\ABAP_DOCU_HTML\abenabap_sql_lists_obsolete.htm` | blank-separated classic list와 comma-separated modern list의 경계 설명 근거 |
| `C:\ABAP_DOCU_HTML\abenabap_sql_host_variables.htm` | host variable escape marker는 CH19 modern SQL 경계로 미루기 위한 근거 |

CH13에서 계속 쓰는 작은 데이터 그림:

```text
zconcert                         zbooking
concert_id artist   capacity     booking_id concert_id seats status
C001       안유진   100          5001       C001       2     N
C002       신유빈    50          5002       C002       1     C
C003       전지현    80          5003       C001       4     N
```

이 그림은 세 가지 질문으로 계속 재사용한다.

1. 예매가 있는 공연만 볼 것인가, 예매가 없어도 공연은 남길 것인가.
2. 예매 행을 그대로 볼 것인가, 공연별 합계 한 행으로 줄일 것인가.
3. 이미 가진 공연 목록을 기준으로 다시 조회할 것인가.

## CH13-L01 - INNER JOIN 기본 개념과 구현

### 왜 필요한가

한 테이블만 읽으면 업무 문장이 자주 끊긴다. 예매 테이블에는 `concert_id`가 있지만 아티스트명은 공연 테이블에 있고, 회차 테이블에는 공연일과 시간이 따로 있다. CH08 방식대로라면 공연을 읽고, 예매를 읽고, 프로그램 안에서 서로 맞춰야 한다. 데이터가 적을 때는 가능해 보여도, 실무 보고서에서는 곧 "왜 같은 공연이 여러 번 나오지?", "왜 어떤 예매는 공연명이 비어 있지?", "왜 조회가 느리지?"라는 문제로 바뀐다.

INNER JOIN은 이 불편을 DB 쪽에서 해결한다. 두 표가 같은 키를 가진 행만 한 줄로 붙여서 가져오므로, ABAP 프로그램은 이미 합쳐진 결과를 받아 출력하면 된다. 학습자가 여기서 반드시 가져가야 할 감각은 "JOIN은 표를 옆으로 붙이는 것"이고, "INNER JOIN은 양쪽에 짝이 있는 행만 남긴다"는 점이다.

### 무엇인가

JOIN은 두 개 이상의 data source를 공통 조건으로 결합해 하나의 결과 집합으로 만드는 SELECT의 `FROM` 절 기능이다. INNER JOIN은 왼쪽과 오른쪽 양쪽 모두에서 `ON` 조건이 참인 조합만 결과로 만든다. 둘 중 한쪽에만 있는 행은 결과에서 빠진다.

입문자가 먼저 외워야 하는 구성은 네 가지다.

| 구성 | 읽는 방법 | 초보자 해석 |
| --- | --- | --- |
| `FROM ztperson AS p` | 사람 테이블을 `p`라고 부르겠다 | 긴 테이블명 대신 짧은 별명 |
| `INNER JOIN ztdept AS d` | 부서 테이블을 붙이겠다 | 두 번째 표를 옆에 붙임 |
| `ON p~dept_id = d~dept_id` | 두 표의 부서ID가 같을 때만 붙임 | 짝 찾기 기준 |
| `p~name d~deptname` | 어느 표의 필드인지 표시 | 같은 필드명 충돌 방지 |

classic Open SQL 예제:

```abap
TYPES: BEGIN OF ty_out,
         persid   TYPE ztperson-persid,
         name     TYPE ztperson-name,
         deptname TYPE ztdept-deptname,
       END OF ty_out.

DATA: lt_out TYPE STANDARD TABLE OF ty_out,
      ls_out TYPE ty_out.

SELECT p~persid p~name d~deptname
  FROM ztperson AS p
  INNER JOIN ztdept AS d
    ON p~dept_id = d~dept_id
  INTO CORRESPONDING FIELDS OF TABLE lt_out
  WHERE p~age >= 20.

WRITE: / 'rows:', sy-dbcnt.

LOOP AT lt_out INTO ls_out.
  WRITE: / ls_out-persid, ls_out-name, ls_out-deptname.
ENDLOOP.
```

`~`는 table component selector다. `p~name`은 `p`라는 별칭을 가진 테이블의 `name` 필드라는 뜻이다. 여러 테이블에 같은 이름의 필드가 있을 수 있으므로, JOIN에서는 별칭과 `~`가 초보자 보호장치다.

복합 키는 특히 중요하다. 회차가 `concert_id`와 `perf_no` 둘로 식별된다면 둘 다 `ON` 조건에 있어야 한다.

```abap
SELECT b~booking_id pf~perf_date pf~perf_time
  FROM zbooking AS b
  INNER JOIN zperf AS pf
    ON  b~concert_id = pf~concert_id
    AND b~perf_no    = pf~perf_no
  INTO CORRESPONDING FIELDS OF TABLE lt_booking.
```

`concert_id`만 맞추고 `perf_no`를 빼면 C001 공연의 1회차 예매가 2회차, 3회차와도 붙을 수 있다. 이것이 행 뻥튀기의 대표 원인이다.

### 어떻게 확인하는가

INNER JOIN은 세 가지 숫자로 확인한다.

1. `sy-subrc`
2. `sy-dbcnt`
3. 출력 행 수

공식문서상 `SELECT`는 결과가 있으면 `sy-subrc`를 0으로, 결과 집합이 비면 4로 설정한다. `sy-dbcnt`는 전달된 행 수다. 따라서 INNER JOIN을 실행한 뒤 "조회 성공인가"만 보지 말고, "왜 이 행 수인가"를 설명해야 한다.

확인 절차:

| 단계 | 질문 | 기대 확인 |
| --- | --- | --- |
| 원본 표 확인 | 왼쪽 표 행 수는 몇 개인가 | 사람 3명 |
| 오른쪽 표 확인 | 오른쪽 표에 매칭 키가 모두 있는가 | 부서 2개 |
| JOIN 후 확인 | 양쪽 모두 매칭되는 행만 남았는가 | 부서 없는 사람 제외 |
| 시스템 필드 확인 | `sy-dbcnt`가 결과 행 수와 같은가 | 출력 행 수와 일치 |

디버거로 볼 때는 `lt_out`에 들어간 행을 펼쳐서 `deptname`이 실제로 붙었는지 확인한다. SQL 결과를 해석할 때는 "DB가 어떤 순서로 내부 처리했는가"를 억지로 외우기보다, `ON` 조건으로 어떤 행 조합이 살아남았는지 표로 설명하는 것이 더 안전하다.

### 체험 설계

L01 체험은 "JOIN 짝 맞추기 보드"로 설계한다.

데이터:

- 왼쪽 카드: 사람 3명. `persid`, `name`, `dept_id` 표시.
- 오른쪽 카드: 부서 2개. `dept_id`, `deptname` 표시.
- 결과 영역: `persid`, `name`, `deptname`, `판정` 표시.

버튼:

- `ON 조건 적용`: 같은 `dept_id`끼리 선을 연결한다.
- `INNER 결과 만들기`: 연결된 카드만 결과 테이블로 이동한다.
- `dept_id 누락 실험`: 오른쪽 부서 20을 잠시 숨겨 결과에서 어떤 사람이 빠지는지 보여준다.
- `복합 키 실험`: `concert_id`만 켠 상태와 `concert_id + perf_no`를 모두 켠 상태의 결과 행 수를 비교한다.

상태와 피드백:

- 준비 상태: 원본 두 표만 보이고 결과는 비어 있다.
- 매칭 상태: 같은 키 카드가 선으로 연결된다.
- 결과 상태: 연결이 없는 왼쪽 행은 "INNER라서 제외" 배지를 받는다.
- 오류 상태: 복합 키 일부만 켜면 "키 일부만 맞춰서 같은 예매가 여러 회차에 붙었습니다"라는 피드백과 함께 행 수가 빨간색으로 증가한다.

이 체험의 목적은 문법 암기가 아니라, `ON` 조건 하나가 결과 행 수를 결정한다는 사실을 몸으로 확인하게 하는 것이다.

### 실수와 주의

가장 큰 실수는 `ON` 조건을 느슨하게 쓰는 것이다. 특히 복합 키에서 일부 키만 쓰면 결과가 틀리는데, 프로그램은 오류 없이 실행될 수 있다. 초보자는 "덤프가 안 났으니 맞다"고 착각하기 쉽지만, JOIN의 실패는 종종 조용한 중복으로 나타난다.

두 번째 실수는 같은 필드명을 별칭 없이 읽으려는 것이다. 여러 테이블에 `mandt`, `concert_id`, `created_by` 같은 이름이 반복될 수 있으므로 JOIN 구간에서는 별칭과 `~`를 기본 습관으로 둔다.

세 번째 실수는 CH13에서 modern Open SQL 예제를 섞는 것이다. 현재 장은 CH17까지 이어지는 classic-first 구간이다. host marker, comma field list, inline declaration은 CH19에서 정식으로 다시 배운다. 지금은 기존 시스템의 classic 리포트를 읽고 고칠 수 있는 눈을 만드는 단계다.

### 정리

INNER JOIN은 두 표의 행을 `ON` 조건으로 짝지어 양쪽에 모두 있는 행만 남긴다. `AS`는 테이블 별칭이고, `~`는 어느 테이블의 필드인지 지정하는 표시다. JOIN 결과가 맞는지는 `sy-subrc`뿐 아니라 `sy-dbcnt`, 원본 행, `ON` 조건을 함께 보고 판단한다. 다음 레슨에서는 "짝이 없어도 왼쪽 행은 남겨야 하는" 경우를 다룬다.

## CH13-L02 - LEFT OUTER JOIN 기본 개념과 NULL 처리

### 왜 필요한가

INNER JOIN은 매칭이 없는 행을 버린다. 이것은 정확한 동작이지만, 모든 업무 질문에 맞지는 않는다. 예를 들어 공연별 예매 현황을 만들 때 예매가 하나도 없는 공연도 보여야 한다. INNER JOIN으로 공연과 예매를 붙이면 예매 없는 공연은 결과에서 사라져 "예매 0건"이 아니라 "공연 자체가 없는 것처럼" 보인다.

LEFT OUTER JOIN은 기준 목록을 보존해야 할 때 필요하다. "왼쪽 표를 기준으로 전부 보여 주고, 오른쪽에 있으면 붙이고, 없으면 빈 값으로 두라"는 문장이다. 조회 보고서에서는 이 차이가 매우 중요하다. 누락된 데이터도 업무 사실이기 때문이다.

### 무엇인가

LEFT OUTER JOIN은 왼쪽 data source의 행을 모두 결과에 남기고, 오른쪽에서 `ON` 조건을 만족하는 행이 있으면 붙인다. 오른쪽에 매칭되는 행이 없으면 오른쪽 필드는 DB의 null 값이 된다. 공식문서상 null은 ABAP data object의 타입별 초기값과 같은 것이 아니지만, SELECT 결과가 ABAP 변수나 내부 테이블로 넘어올 때 타입별 초기값으로 변환된다.

classic 예제:

```abap
TYPES: BEGIN OF ty_status,
         concert_id TYPE zconcert-concert_id,
         artist     TYPE zconcert-artist,
         booking_id TYPE zbooking-booking_id,
         seats      TYPE zbooking-seats,
       END OF ty_status.

DATA: lt_status TYPE STANDARD TABLE OF ty_status,
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

예매가 없는 공연은 `concert_id`, `artist`는 남고, `booking_id`, `seats` 쪽이 초기값처럼 보인다. 여기서 입문자가 기억할 문장은 하나다.

> LEFT OUTER JOIN은 "왼쪽 명단 보존" 도구다.

한 SELECT 안에서 INNER와 LEFT OUTER를 섞을 수도 있다. 예매는 반드시 공연을 가져야 하지만, 회차 정보가 아직 정리 중인 상황을 가정하면 아래처럼 의도를 나눌 수 있다.

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

공연은 예매의 필수 부모이므로 INNER, 회차는 임시 누락을 허용한다면 LEFT OUTER다. JOIN 종류는 "기술 취향"이 아니라 "업무상 빠지면 안 되는 기준 행이 무엇인가"로 고른다.

### 어떻게 확인하는가

LEFT OUTER JOIN은 결과 행이 "더 많다"가 아니라 "기준 행을 보존한다"로 확인한다.

확인 예시:

```text
zconcert: C001, C002, C003
zbooking: C001 예매 2건, C002 취소 1건

INNER JOIN 결과:
C001 예매 2건, C002 취소 1건

LEFT OUTER JOIN 결과:
C001 예매 2건, C002 취소 1건, C003 오른쪽 값 초기
```

디버거에서는 `lt_status`에서 C003이 남아 있는지 먼저 확인한다. C003이 없으면 LEFT OUTER가 아니라 INNER처럼 동작했거나, WHERE 조건이 오른쪽 테이블 필드를 걸러 버렸을 가능성이 있다.

SQL에서 null을 직접 검사하려면 `IS NULL`, `IS NOT NULL` 조건이 있다. 다만 CH13 본문 코드는 null indicator나 SQL expression까지 확장하지 않는다. 현재 단계에서는 "DB null은 ABAP 초기값과 같은 개념이 아니며, ABAP data object로 넘어올 때 초기값처럼 보일 수 있다"는 차이를 정확히 기억한다.

### 체험 설계

L02 체험은 "LEFT 보존 스위치"로 설계한다.

데이터:

- 왼쪽 표 `zconcert`: C001, C002, C003.
- 오른쪽 표 `zbooking`: C001 예매 여러 건, C002 취소 건, C003 없음.
- 결과 표: `concert_id`, `artist`, `booking_id`, `seats`, `join_reason`.

버튼:

- `INNER JOIN`: 매칭되는 공연만 결과에 남긴다.
- `LEFT OUTER JOIN`: C003도 결과에 남기고 오른쪽 값을 빈 칸으로 표시한다.
- `오른쪽 WHERE 조건 켜기`: 오른쪽 필드 조건을 WHERE에 두었을 때 C003이 사라질 수 있음을 보여 준다.
- `ON 조건으로 이동`: 같은 조건을 ON 쪽 의미로 옮겼을 때 기준 공연 보존 의도가 어떻게 달라지는지 설명한다.

상태와 피드백:

- C003이 INNER에서 사라지면 "오른쪽 예매가 없어서 제외" 표시.
- C003이 LEFT에서 남으면 "왼쪽 공연 보존" 표시.
- 오른쪽 필드 조건 때문에 C003이 사라지면 "LEFT를 써도 WHERE가 오른쪽 빈 값을 걸러낼 수 있습니다" 경고.

### 실수와 주의

LEFT OUTER JOIN의 대표 실수는 "LEFT니까 무조건 왼쪽이 남는다"고 단순화하는 것이다. SELECT 전체에는 `WHERE`가 있고, WHERE가 오른쪽 필드의 null 또는 초기값을 걸러 버리면 매칭 없는 왼쪽 행이 결과에서 빠질 수 있다. 오른쪽 테이블에 대한 조건이 "매칭 조건"인지 "최종 결과 필터"인지 구분해야 한다.

두 번째 실수는 null과 초기값을 같은 것으로 이해하는 것이다. 공식문서상 null은 ABAP data object의 타입별 초기값과 같은 개념이 아니다. 다만 SELECT 결과가 ABAP 변수로 전달될 때 초기값으로 변환될 수 있다. 그래서 업무상 "진짜 0"과 "오른쪽 행 없음"을 구분해야 하면 오른쪽 키의 존재 여부나 별도 설계를 함께 봐야 한다.

세 번째 실수는 기준 표 방향을 반대로 잡는 것이다. LEFT OUTER JOIN에서 보존되는 쪽은 왼쪽이다. 공연을 모두 남기고 싶으면 `FROM zconcert AS c`가 왼쪽에 와야 한다.

### 정리

LEFT OUTER JOIN은 왼쪽 기준 목록을 보존하면서 오른쪽 값을 붙인다. 매칭이 없으면 오른쪽 값은 DB null이 되고, ABAP으로 넘어오면 초기값처럼 보일 수 있다. 실무 보고서에서는 "0건도 보여야 하는 기준 목록"을 먼저 찾고, 그 표를 왼쪽에 둔다. 다음 레슨에서는 이렇게 붙은 행들을 그룹별로 줄여 요약한다.

## CH13-L03 - GROUP BY와 Aggregate

### 왜 필요한가

JOIN은 행을 옆으로 붙인다. 하지만 보고서는 항상 행 목록만 원하는 것이 아니다. "공연별 예매 좌석 합계", "항공사별 비행 수", "부서별 인원수"처럼 여러 행을 묶어 한 줄로 요약해야 할 때가 많다. 이때 모든 행을 ABAP으로 가져와 LOOP로 세고 더하면 데이터 이동량이 커지고, 프로그램도 길어진다.

GROUP BY와 aggregate function은 요약을 DB에서 먼저 수행하게 한다. DB가 같은 그룹끼리 묶고, `COUNT`, `SUM`, `MIN`, `MAX`, `AVG`로 값을 계산한 뒤 작은 결과만 ABAP으로 넘긴다. 공식문서도 `GROUP BY`와 aggregate function을 사용하면 DB 시스템에서 그룹과 집계가 만들어져 전송 데이터량을 줄일 수 있다고 설명한다.

### 무엇인가

GROUP BY는 같은 그룹 키를 가진 여러 행을 하나의 그룹으로 묶는다. aggregate function은 그 그룹 안의 여러 값을 하나의 값으로 계산한다.

대표 aggregate function:

| 함수 | 의미 | 예시 질문 |
| --- | --- | --- |
| `COUNT( * )` | 행 개수 | 공연별 예매 건수는 몇 개인가 |
| `SUM( seats )` | 합계 | 공연별 예약 좌석 합계는 몇 석인가 |
| `MIN( price )` | 최소값 | 가장 싼 가격은 얼마인가 |
| `MAX( price )` | 최대값 | 가장 비싼 가격은 얼마인가 |
| `AVG( price )` | 평균 | 평균 가격은 얼마인가 |

classic 예제:

```abap
TYPES: BEGIN OF ty_sum,
         dept_id TYPE ztperson-dept_id,
         cnt     TYPE i,
         total   TYPE p LENGTH 15 DECIMALS 2,
       END OF ty_sum.

DATA: lt_sum TYPE STANDARD TABLE OF ty_sum,
      ls_sum TYPE ty_sum.

SELECT dept_id COUNT( * ) AS cnt SUM( salary ) AS total
  FROM ztperson
  INTO CORRESPONDING FIELDS OF TABLE lt_sum
  GROUP BY dept_id.

LOOP AT lt_sum INTO ls_sum.
  WRITE: / ls_sum-dept_id, ls_sum-cnt, ls_sum-total.
ENDLOOP.
```

중요 규칙은 단순하다. `GROUP BY dept_id`라고 썼다면 SELECT 목록의 일반 컬럼은 `dept_id`처럼 그룹 키이거나, `COUNT`, `SUM` 같은 aggregate function 안에 있어야 한다. 그룹 키도 아니고 aggregate도 아닌 평범한 컬럼을 함께 고르면 "그 그룹의 여러 값 중 무엇을 한 행에 넣어야 하는가"가 모호해진다.

`DISTINCT`는 GROUP BY와 다르다.

```abap
DATA lt_dept TYPE STANDARD TABLE OF ztperson-dept_id.

SELECT DISTINCT dept_id
  FROM ztperson
  INTO TABLE lt_dept.
```

`DISTINCT`는 중복 행 제거다. "부서별 인원수"처럼 요약 값을 계산하지 않는다. "등장한 부서 ID만 중복 없이 보고 싶다"면 `DISTINCT`, "부서별 몇 명인지 세고 싶다"면 `GROUP BY`와 `COUNT`다.

### 어떻게 확인하는가

GROUP BY는 "행이 줄었는가"와 "줄어든 이유를 설명할 수 있는가"로 확인한다.

```text
원본:
dept_id  salary
10       300
10       400
20       500

GROUP BY dept_id:
dept_id  cnt  total
10       2    700
20       1    500
```

확인 순서:

1. 원본 행 수를 확인한다.
2. 그룹 키의 종류를 확인한다.
3. 결과 행 수가 그룹 키 종류 수와 같은지 본다.
4. 각 그룹의 집계 값이 원본 행으로 계산한 값과 맞는지 손으로 검산한다.
5. 합계 필드 타입이 충분한지 본다.

`SUM` 결과를 받을 필드는 원본보다 넉넉하게 잡아야 한다. 예를 들어 좌석 수는 작아 보여도 여러 예매를 합산하면 커진다. 집계 결과가 대상 필드에 비해 너무 크면 예외나 잘못된 값으로 이어질 수 있다.

### 체험 설계

L03 체험은 "행 묶기 실험실"로 설계한다.

데이터:

- 원본 표: `booking_id`, `concert_id`, `seats`, `status`.
- 그룹 키 후보: `concert_id`, `status`, `concert_id + status`.
- 집계 후보: `COUNT`, `SUM seats`, `MAX seats`.

버튼:

- `그룹 키 선택`: 어떤 컬럼으로 묶을지 고른다.
- `집계 함수 선택`: COUNT 또는 SUM을 선택한다.
- `GROUP BY 실행`: 원본 행을 색으로 그룹화하고 결과 행으로 접는다.
- `DISTINCT 비교`: 같은 데이터에서 DISTINCT만 실행해 "요약 없음"을 보여 준다.

상태와 피드백:

- 그룹화 전: 모든 예매 행이 낱개로 보인다.
- 그룹화 중: 같은 `concert_id` 행이 같은 색으로 묶인다.
- 집계 후: 각 색 그룹이 한 행으로 접히며 `cnt`, `total`이 계산된다.
- 오류 피드백: 그룹 키가 아닌 `customer`를 SELECT하려 하면 "한 그룹 안에 고객이 여러 명인데 어떤 고객을 보여 줄지 결정할 수 없습니다"라고 설명한다.

### 실수와 주의

첫 번째 실수는 GROUP BY에 없는 일반 컬럼을 SELECT 목록에 넣는 것이다. SQL은 그룹당 한 행을 만들기 때문에, 그룹 키가 아닌 여러 값을 그대로 보여 줄 수 없다. 보여 주고 싶으면 GROUP BY에 추가하거나 aggregate function으로 계산해야 한다.

두 번째 실수는 `DISTINCT`와 GROUP BY를 같은 도구로 생각하는 것이다. `DISTINCT`는 중복 제거이고 GROUP BY는 요약이다. `SELECT DISTINCT dept_id`는 부서 목록을 주지만, 부서별 인원수는 주지 않는다.

세 번째 실수는 합계 타입을 작게 잡는 것이다. DB가 정확히 합계를 계산해도 ABAP 대상 필드가 작으면 결과를 안전하게 받을 수 없다. 집계 결과 필드는 원본 개별 값보다 넉넉하게 설계한다.

### 정리

GROUP BY는 같은 키를 가진 여러 행을 한 그룹으로 묶고, aggregate function은 그 그룹의 값을 하나로 계산한다. `COUNT`, `SUM`, `MIN`, `MAX`, `AVG`는 보고서의 질문을 "행 목록"에서 "요약"으로 바꾸는 핵심 도구다. 다음 레슨에서는 요약된 결과를 기준으로 다시 거르는 HAVING을 배운다.

## CH13-L04 - HAVING과 집계 조건

### 왜 필요한가

WHERE는 개별 행을 거른다. 하지만 보고서에서는 개별 행이 아니라 요약 결과를 기준으로 걸러야 할 때가 많다. "성인만 대상으로 부서별 인원수를 세라"는 WHERE로 가능하다. 반면 "부서별로 세어 본 뒤 인원이 5명 이상인 부서만 보여 달라"는 GROUP BY 이후 결과를 대상으로 해야 한다.

HAVING은 이 두 번째 질문을 해결한다. 초보자가 HAVING을 어려워하는 이유는 문법이 복잡해서가 아니라, 조건을 거는 시점이 다르기 때문이다. CH13-L04의 목표는 WHERE와 HAVING을 암기가 아니라 처리 시점으로 구분하게 만드는 것이다.

### 무엇인가

WHERE는 GROUP BY 전에 개별 행을 필터링한다. HAVING은 GROUP BY 후 그룹 결과를 필터링한다.

| 조건 | 시점 | 대상 | 예시 |
| --- | --- | --- | --- |
| `WHERE age >= 20` | 그룹 전 | 사람 한 명 한 명 | 성인만 집계 대상 |
| `HAVING COUNT( * ) >= 5` | 그룹 후 | 부서별 집계 결과 | 인원 5명 이상 부서만 |

classic 예제:

```abap
TYPES: BEGIN OF ty_sum,
         dept_id TYPE ztperson-dept_id,
         cnt     TYPE i,
       END OF ty_sum.

DATA lt_sum TYPE STANDARD TABLE OF ty_sum.

SELECT dept_id COUNT( * ) AS cnt
  FROM ztperson
  INTO CORRESPONDING FIELDS OF TABLE lt_sum
  WHERE age >= 20
  GROUP BY dept_id
  HAVING COUNT( * ) >= 5.
```

이 예제는 두 번 거른다.

1. `WHERE age >= 20`: 20세 미만 사람 행은 그룹 만들기 전에 제외한다.
2. `HAVING COUNT( * ) >= 5`: 남은 사람을 부서별로 센 뒤, 인원 5명 미만 부서는 제외한다.

HAVING 조건 안에는 aggregate expression을 쓸 수 있다. 공식문서상 HAVING은 그룹의 내용을 평가하는 논리식이고, aggregate expression은 HAVING 조건의 비교 피연산자로 사용할 수 있다.

### 어떻게 확인하는가

HAVING은 "WHERE로 거른 뒤, GROUP BY로 묶고, HAVING으로 그룹을 버린다"는 단계표로 확인한다.

```text
원본 사람:
dept_id age
10      25
10      31
10      17
20      42

WHERE age >= 20 이후:
10      25
10      31
20      42

GROUP BY dept_id 이후:
10 cnt 2
20 cnt 1

HAVING COUNT >= 2 이후:
10 cnt 2
```

디버거로는 GROUP BY 중간 결과를 직접 볼 수 없으므로, 작은 데이터로 손 계산을 먼저 한다. 그 다음 `lt_sum`의 행 수와 `cnt`를 비교한다. 예상과 다르면 WHERE 조건을 바꾼 것인지, HAVING 조건을 바꾼 것인지 분리해서 확인한다.

문법 오류 확인도 중요하다. `WHERE COUNT( * ) >= 5`처럼 WHERE에 집계 조건을 넣는 것은 잘못된 방향이다. COUNT는 그룹이 만들어진 뒤 의미가 생기므로 HAVING으로 간다.

### 체험 설계

L04 체험은 "WHERE와 HAVING 2단 필터 파이프라인"으로 설계한다.

데이터:

- 사람 카드: `dept_id`, `age`, `salary`.
- 파이프라인 칸: 원본, WHERE 후, GROUP BY 후, HAVING 후.
- 조건 입력: `age >= 20`, `COUNT >= 2`, `SUM salary >= 1000`.

버튼:

- `WHERE 적용`: 조건에 맞지 않는 개별 행을 회색으로 보낸다.
- `GROUP BY 적용`: 남은 행을 부서별 그룹으로 접는다.
- `HAVING 적용`: 집계 조건에 맞지 않는 그룹 전체를 제거한다.
- `잘못된 위치 실험`: `COUNT` 조건을 WHERE 칸에 끌어다 놓으면 왜 아직 COUNT가 존재하지 않는지 설명한다.

상태와 피드백:

- WHERE 단계에서는 행 하나가 사라진다.
- HAVING 단계에서는 그룹 한 덩어리가 사라진다.
- 오답 피드백은 "지금 조건이 행 조건인지 그룹 조건인지 먼저 말해 보세요"로 시작한다.

### 실수와 주의

가장 흔한 실수는 집계 조건을 WHERE에 두는 것이다. WHERE는 그룹 전에 실행되는 개별 행 조건이다. 아직 그룹도 없고 COUNT 결과도 없으므로 aggregate 조건은 HAVING에 둔다.

두 번째 실수는 HAVING이 WHERE를 대체한다고 생각하는 것이다. WHERE와 HAVING은 경쟁 관계가 아니다. WHERE로 집계 대상 행을 먼저 줄이고, HAVING으로 집계 결과 그룹을 줄인다.

세 번째 실수는 HAVING이 없어도 ABAP에서 LOOP로 지우면 된다고 생각하는 것이다. 소량 실습에서는 가능하지만, 대량 데이터에서는 불필요한 그룹을 DB에서 먼저 줄이는 편이 결과 전송량과 프로그램 단순성 측면에서 유리하다.

### 정리

WHERE는 그룹 전 행 조건이고, HAVING은 그룹 후 집계 조건이다. `COUNT`, `SUM` 같은 aggregate 조건은 HAVING에서 다룬다. WHERE와 HAVING을 순서로 이해하면 "왜 이 조건은 여기 있어야 하는가"를 설명할 수 있다. 다음 레슨에서는 완성된 결과의 순서를 DB에서 정렬하는 ORDER BY를 다룬다.

## CH13-L05 - ORDER BY 정렬 조회

### 왜 필요한가

데이터베이스에서 행을 읽을 때, 정렬을 지정하지 않으면 결과 순서는 보장되지 않는다. 오늘은 우연히 이름순처럼 보였는데 내일은 다른 순서로 보일 수 있다. 보고서에서 "상위 매출", "최근 공연일", "항공사 코드순"처럼 순서가 의미를 가지면 정렬을 명시해야 한다.

ABAP 내부 테이블을 읽은 뒤 `SORT`할 수도 있다. 하지만 처음부터 DB에서 정렬된 결과가 필요하거나, 정렬 기준이 DB 인덱스와 잘 맞는 경우에는 ORDER BY가 자연스럽다. CH13-L05의 목표는 "정렬은 보기 좋게 만드는 장식"이 아니라 "결과 의미를 고정하는 조건"임을 이해하는 것이다.

### 무엇인가

ORDER BY는 SELECT 결과의 여러 행을 지정한 컬럼 기준으로 정렬한다. `ASCENDING`은 오름차순, `DESCENDING`은 내림차순이다. 아무 것도 쓰지 않으면 기본은 오름차순이다.

classic 예제:

```abap
TYPES: BEGIN OF ty_person,
         persid TYPE ztperson-persid,
         name   TYPE ztperson-name,
         age    TYPE ztperson-age,
       END OF ty_person.

DATA lt_person TYPE STANDARD TABLE OF ty_person.

SELECT persid name age
  FROM ztperson
  INTO CORRESPONDING FIELDS OF TABLE lt_person
  ORDER BY age DESCENDING name ASCENDING.
```

해석:

- 나이가 많은 사람부터 먼저 온다.
- 나이가 같으면 이름 오름차순으로 정렬한다.
- 정렬 기준은 앞에 적은 것부터 우선순위가 높다.

단일 테이블을 기본 키 순서로 읽고 싶으면 `ORDER BY PRIMARY KEY`를 사용할 수 있다.

```abap
SELECT carrid connid fldate seatsmax seatsocc
  FROM sflight
  INTO CORRESPONDING FIELDS OF TABLE lt_flight
  ORDER BY PRIMARY KEY.
```

다만 공식문서상 `ORDER BY PRIMARY KEY`는 join expression으로 여러 data source를 읽는 경우에는 사용할 수 없다. JOIN 결과는 명시 컬럼 기준으로 정렬한다.

### 어떻게 확인하는가

ORDER BY는 "정렬 기준을 빼도 같은가"가 아니라 "정렬 기준을 바꿨을 때 결과가 예측대로 바뀌는가"로 확인한다.

확인 절차:

1. 같은 SELECT를 정렬 없이 실행해 순서가 업무 의미가 없음을 보여 준다.
2. `ORDER BY age DESCENDING`을 붙여 큰 나이가 먼저 오는지 본다.
3. 같은 나이 데이터 두 건을 넣고 `name ASCENDING`의 두 번째 정렬 기준이 작동하는지 본다.
4. `sy-dbcnt`는 정렬 전후 같아야 한다. ORDER BY는 행을 버리지 않고 순서만 바꾼다.

GROUP BY와 함께 쓸 때는 ORDER BY 필드가 SELECT 결과와 GROUP BY 규칙을 만족해야 한다. 예를 들어 부서별 인원수를 구한 뒤 인원수 내림차순으로 보려면 aggregate alias 또는 같은 aggregate expression 기준으로 정렬한다.

### 체험 설계

L05 체험은 "정렬 우선순위 조작기"로 설계한다.

데이터:

- 사람 표: `name`, `age`, `dept_id`.
- 정렬 기준 슬롯 1, 2, 3.
- 결과 표와 정렬 화살표 표시.

버튼:

- `정렬 없음`: 결과 순서에 "보장 없음" 배지를 붙인다.
- `age 내림차순`: 나이 큰 행부터 정렬한다.
- `name 오름차순 추가`: 동률 행 안에서 이름순이 적용되는지 보여 준다.
- `PRIMARY KEY 비교`: 단일 테이블 기본 키 정렬의 의미를 보여 주고, JOIN 결과에서는 비활성화한다.

상태와 피드백:

- 정렬 없음 상태: "지금 보이는 순서는 업무 규칙이 아닙니다" 표시.
- 단일 기준 상태: 첫 번째 기준 컬럼에 굵은 화살표.
- 다중 기준 상태: 첫 번째 기준으로 묶인 동률 구간 안에서 두 번째 기준이 적용됨.
- 성능 주의 상태: 대량 데이터와 인덱스 없는 정렬을 선택하면 "DB가 큰 정렬 작업을 수행할 수 있습니다" 경고.

### 실수와 주의

첫 번째 실수는 정렬이 없는데도 현재 출력 순서를 믿는 것이다. 공식문서상 ORDER BY가 없으면 결과 순서는 지정되지 않는다. 특히 테스트 데이터가 적을 때 우연히 정렬된 것처럼 보이는 상황을 경계해야 한다.

두 번째 실수는 대량 데이터에 무분별하게 ORDER BY를 붙이는 것이다. 공식문서도 적절한 인덱스가 없으면 DB 정렬 비용이 커질 수 있다고 설명한다. 필요한 결과 순서만 지정하고, 이미 읽은 소량 내부 테이블은 ABAP `SORT`가 더 단순할 수 있다.

세 번째 실수는 FAE와 ORDER BY를 마음대로 결합하는 것이다. 공식문서상 FOR ALL ENTRIES와 함께 ORDER BY를 사용할 때는 제한이 크고, 사실상 `PRIMARY KEY` 조건과 키 필드 SELECT 목록 조건을 만족해야 한다. CH13-L06에서 이 경계를 다시 본다.

### 정리

ORDER BY는 결과 행을 버리지 않고 순서를 정한다. 순서를 지정하지 않으면 결과 순서는 업무 규칙이 아니다. `ASCENDING`, `DESCENDING`, 여러 정렬 기준의 우선순위를 이해하면 보고서의 출력 의미를 고정할 수 있다. 다음 레슨에서는 이미 가진 내부 테이블 값을 조건으로 DB를 다시 조회하는 FOR ALL ENTRIES를 다룬다.

## CH13-L06 - FOR ALL ENTRIES 사용 기준

### 왜 필요한가

항상 JOIN으로 해결할 수 있는 것은 아니다. 앞 단계에서 이미 내부 테이블에 고객 목록, 부서 목록, 공연 목록을 만들어 두었고, 그 목록을 기준으로 DB에서 상세 데이터를 가져와야 할 때가 있다. 이때 초보자가 자주 쓰는 나쁜 방식은 LOOP 안에서 SELECT를 반복하는 것이다.

```text
부서 100개
각 부서마다 SELECT 1번
결과: DB 왕복 100번
```

FOR ALL ENTRIES는 내부 테이블의 여러 값을 한 번의 SELECT 조건처럼 사용하게 해 준다. 하지만 이 도구는 함정이 크다. 내부 테이블이 비어 있으면 WHERE 조건이 무시되어 전체 조회가 될 수 있다. 그래서 CH13-L06은 단순 문법보다 "언제 쓰고, 어떤 안전장치를 반드시 둘 것인가"가 핵심이다.

### 무엇인가

FOR ALL ENTRIES는 SELECT의 WHERE 앞에서 내부 테이블을 기준 목록으로 지정한다. WHERE 조건 안에서는 그 내부 테이블의 필드를 DB 컬럼과 비교한다.

classic 예제:

```abap
TYPES: BEGIN OF ty_dept,
         dept_id TYPE ztdept-dept_id,
       END OF ty_dept.

TYPES: BEGIN OF ty_person,
         persid  TYPE ztperson-persid,
         name    TYPE ztperson-name,
         dept_id TYPE ztperson-dept_id,
       END OF ty_person.

DATA: lt_dept   TYPE STANDARD TABLE OF ty_dept,
      lt_person TYPE STANDARD TABLE OF ty_person.

" 전제: lt_dept에는 조회 기준이 될 부서 ID들이 들어 있다.
IF lt_dept IS NOT INITIAL.
  SELECT persid name dept_id
    FROM ztperson
    INTO CORRESPONDING FIELDS OF TABLE lt_person
    FOR ALL ENTRIES IN lt_dept
    WHERE dept_id = lt_dept-dept_id.
ENDIF.
```

읽는 방법:

- `lt_dept`에 들어 있는 여러 `dept_id`를 조건 목록처럼 사용한다.
- DB 컬럼 `dept_id`가 내부 테이블 행의 `dept_id`와 같은 사람을 조회한다.
- 결과에 중복 행이 발생하면 전체 행 내용 기준으로 중복이 제거된다.

공식문서에서 가장 중요한 문장은 "내부 테이블이 비어 있으면 WHERE 조건 전체가 무시된다"는 내용이다. 그래서 `IF lt_dept IS NOT INITIAL.`은 선택이 아니라 안전장치다.

### 어떻게 확인하는가

FAE는 정상 케이스보다 빈 테이블 케이스를 먼저 확인해야 한다.

확인 절차:

| 상태 | 내부 테이블 | 기대 결과 |
| --- | --- | --- |
| 정상 | 10, 20 | 부서 10 또는 20 사람만 조회 |
| 빈 목록 | 없음 | SELECT 자체를 실행하지 않음 |
| 안전장치 누락 | 없음 | WHERE 무시로 전체 조회 위험 |
| 중복 기준 | 10, 10, 20 | 결과 행 중복 제거 가능성 확인 |

실습에서는 일부러 `lt_dept`를 비운 상태로 두고, 안전장치가 있으면 SELECT가 실행되지 않는다는 것을 보여 준다. 안전장치를 제거한 가상 시나리오에서는 결과 행 수가 전체 테이블 수준으로 커지는 모습을 시뮬레이터로 보여 준다. 실제 운영 DB에서 이런 실험을 하면 안 된다.

`sy-dbcnt`는 안전장치 확인에도 쓸 수 있다. 빈 목록이면 SELECT가 실행되지 않았으므로 이전 값에 의존하면 안 된다. 실행 여부를 별도 메시지나 상태 변수로 보여 주는 편이 초보자에게 명확하다.

### 체험 설계

L06 체험은 "FAE 안전장치 시뮬레이터"로 설계한다.

데이터:

- 기준 내부 테이블 `lt_dept`: 부서 10, 20 또는 빈 상태.
- DB 표 `ztperson`: 부서 10, 20, 30, 40 사람 여러 명.
- 결과 표 `lt_person`: 조회된 사람 목록.

버튼:

- `기준 목록 채우기`: `lt_dept`에 10, 20을 넣는다.
- `기준 목록 비우기`: `lt_dept`를 빈 상태로 만든다.
- `안전장치 ON`: `IS NOT INITIAL` 확인을 켠다.
- `안전장치 OFF`: 실행 버튼을 누르면 실제 DB 대신 시뮬레이션으로 전체 조회 위험을 표시한다.
- `중복 기준 추가`: 10을 두 번 넣고 결과 중복 제거 설명을 보여 준다.

상태와 피드백:

- 안전 정상: "기준 2개로 제한 조회" 표시.
- 빈 목록 보호: "기준 목록이 비어 SELECT를 실행하지 않았습니다" 표시.
- 위험 상태: "WHERE 조건이 사라지는 것과 같아 전체 조회가 될 수 있습니다" 경고.
- 중복 상태: "FAE 결과는 중복 행을 제거할 수 있으므로 입력 목록 개수와 결과 행 수를 단순 비교하지 마세요" 피드백.

### 실수와 주의

첫 번째 실수는 `IS NOT INITIAL` 확인을 빼는 것이다. 이것은 성능 문제가 아니라 장애로 이어질 수 있는 오류다. 큰 표에서 전체 조회가 발생하면 화면이 멈추거나 배치 시간이 폭증할 수 있다.

두 번째 실수는 FAE 결과가 입력 목록의 중복을 그대로 반영한다고 생각하는 것이다. 공식문서상 FAE 결과는 중복 행이 제거된다. 중복 자체가 업무 의미라면 FAE 결과와 입력 목록을 1대1로 맞추면 안 된다.

세 번째 실수는 GROUP BY와 FAE를 함께 쓰려는 것이다. 공식문서상 FAE와 GROUP BY 조합은 피해야 하며 GROUP BY 효과가 기대대로 동작하지 않는다. 집계가 핵심이면 JOIN이나 별도 SELECT 설계를 다시 검토한다.

네 번째 실수는 LOOP 안 SELECT를 FAE로 바꿨다고 항상 최적이라고 보는 것이다. JOIN으로 한 번에 해결되는 관계라면 JOIN이 더 단순할 수 있다. FAE는 이미 기준 목록이 내부 테이블에 있고, 그 목록을 DB 조건으로 써야 할 때의 도구다.

### 정리

FOR ALL ENTRIES는 내부 테이블 값을 DB 조회 조건으로 사용하는 classic Open SQL 도구다. 반드시 기준 내부 테이블이 비어 있지 않은지 확인해야 한다. 빈 기준 테이블은 WHERE 조건 무시와 전체 조회 위험으로 이어진다. FAE는 JOIN 대체재가 아니라, 이미 가진 기준 목록으로 추가 조회해야 할 때 쓰는 선택지다.

## CH13-L07 - JOIN / FAE / ABAP 처리 선택 기준

### 왜 필요한가

CH13 앞 레슨에서 JOIN, GROUP BY, ORDER BY, FAE를 각각 배웠다. 그런데 실무에서는 문법을 아는 것보다 "이번 상황에서는 무엇을 고를 것인가"가 더 어렵다. 초보자는 배운 직후의 문법을 모든 문제에 적용하려는 경향이 있다. JOIN을 배운 날에는 모든 것을 JOIN으로, FAE를 배운 날에는 모든 것을 FAE로 바꾸고 싶어진다.

L07은 문법을 하나 더 배우는 레슨이 아니라 판단 기준을 정리하는 레슨이다. 좋은 ABAP 개발자는 "동작하는 코드"에서 멈추지 않고, 데이터가 어디에 있고, 몇 건이고, 어떤 기준으로 합쳐야 하며, 어떤 결과가 필요한지 먼저 묻는다.

### 무엇인가

세 가지 선택지를 한 문장으로 정리하면 다음과 같다.

| 방법 | 일을 하는 곳 | 적합한 상황 | 피해야 할 상황 |
| --- | --- | --- | --- |
| JOIN | DB | 테이블 관계가 명확하고 한 번에 합쳐 읽을 때 | 기준 행 보존 방향이나 키 조건을 설명 못할 때 |
| FAE | DB와 ABAP SQL 처리 | 이미 내부 테이블 기준 목록이 있을 때 | 기준 목록이 비어 있을 수 있는데 보호가 없을 때 |
| ABAP LOOP 처리 | AS ABAP | 이미 읽은 소량 데이터를 간단히 가공할 때 | LOOP 안 SELECT로 DB 왕복이 반복될 때 |

기본 원칙:

1. DB 테이블끼리 키 관계로 합칠 수 있으면 JOIN을 먼저 검토한다.
2. 기준 목록이 이미 내부 테이블에 있으면 FAE를 검토하되 빈 목록 보호를 반드시 둔다.
3. 이미 메모리에 있는 소량 데이터의 표시 순서나 간단 계산은 ABAP 처리도 가능하다.
4. LOOP 안에서 SELECT를 반복하는 구조는 먼저 의심한다.

이 판단 기준은 성능만의 문제가 아니다. JOIN은 업무 관계를 SQL에 명시하므로 의도가 드러난다. FAE는 기준 목록 기반 조회 의도가 드러난다. ABAP LOOP는 이미 읽은 데이터를 프로그램 쪽에서 다루는 의도가 드러난다. 도구 선택은 코드 읽는 사람에게도 설명이 되어야 한다.

### 어떻게 확인하는가

선택 기준은 아래 질문으로 확인한다.

| 질문 | 예 | 선택 방향 |
| --- | --- | --- |
| 필요한 데이터가 모두 DB 테이블에 있고 키 관계가 명확한가 | 예매와 공연 | JOIN |
| 기준 목록이 이미 내부 테이블에 만들어져 있는가 | 선택화면으로 고른 부서 목록 후속 조회 | FAE |
| 처리 대상이 이미 메모리에 있고 건수가 작나 | 화면 표시 전 간단 정렬 | ABAP 처리 |
| 결과가 그룹 요약인가 | 공연별 좌석 합계 | GROUP BY |
| 기준 행이 없어도 남아야 하나 | 예매 없는 공연도 표시 | LEFT OUTER JOIN |

실제 코드 리뷰에서는 다음 냄새를 찾는다.

```text
LOOP AT lt_dept INTO ls_dept.
  SELECT ...
    FROM ztperson
    WHERE dept_id = ls_dept-dept_id.
ENDLOOP.
```

이 구조는 부서 개수만큼 DB를 왕복한다. JOIN으로 합칠 수 있는지, 이미 내부 테이블 기준 목록이라면 FAE로 바꿀 수 있는지 검토한다. 단, FAE로 바꾼다면 빈 목록 보호가 설계의 일부여야 한다.

### 체험 설계

L07 체험은 "조회 전략 의사결정 카드"로 설계한다.

상황 카드:

- 카드 A: 공연과 예매를 함께 보여야 한다. 둘 다 DB 테이블이다.
- 카드 B: 사용자가 선택한 부서 목록이 이미 내부 테이블에 있다.
- 카드 C: 30건짜리 결과를 화면 표시 전에 이름순으로 바꾸고 싶다.
- 카드 D: 공연별 예매 좌석 합계가 필요하다.
- 카드 E: 예매 없는 공연도 0건으로 보여야 한다.

버튼:

- `JOIN 선택`
- `FAE 선택`
- `ABAP 처리 선택`
- `GROUP BY 선택`
- `LEFT OUTER 선택`

상태와 피드백:

- 정답 상태: 선택한 도구와 이유를 한 문장으로 표시한다.
- 부분 정답 상태: 동작은 가능하지만 주의점이 있는 선택을 노란색으로 표시한다.
- 오답 상태: "이 선택이 틀린 이유"보다 "먼저 물어야 할 질문"을 보여 준다.

예시 피드백:

- 카드 A에서 JOIN: "두 DB 테이블의 키 관계가 명확하므로 DB에서 합치는 편이 자연스럽습니다."
- 카드 B에서 FAE: "이미 내부 테이블 기준 목록이 있으므로 가능하지만, 빈 목록 보호가 필수입니다."
- 카드 E에서 INNER JOIN: "예매 없는 공연이 사라지므로 기준 공연을 보존하려면 LEFT OUTER를 검토하세요."

### 실수와 주의

첫 번째 실수는 "JOIN이 항상 최고"라고 생각하는 것이다. JOIN은 강력하지만 기준 목록이 이미 내부 테이블에 있거나, buffered table과 관련된 기존 시스템 상황에서는 FAE가 더 자연스러울 수 있다. 공식문서도 buffered table에는 JOIN 대신 FAE가 대안이 될 수 있음을 설명한다.

두 번째 실수는 "FAE가 LOOP SELECT보다 빠르다"에서 멈추는 것이다. FAE는 빈 테이블 함정을 가진 도구다. 안전장치 없는 FAE는 LOOP SELECT보다 더 위험할 수 있다.

세 번째 실수는 성능 이야기만 하고 정확성 질문을 빠뜨리는 것이다. INNER인지 LEFT인지, 전체 키가 들어갔는지, GROUP BY가 올바른 그룹 키인지가 먼저다. 성능이 좋아도 틀린 결과는 보고서가 아니다.

### 정리

CH13의 도구 선택은 데이터 위치와 질문 형태로 결정한다. DB 테이블끼리 명확히 합치면 JOIN, 이미 내부 테이블 기준 목록이 있으면 FAE, 이미 읽은 소량 데이터의 단순 처리면 ABAP 처리다. 집계 질문이면 GROUP BY, 기준 목록 보존 질문이면 LEFT OUTER JOIN을 생각한다. 다음 레슨에서는 이 판단을 공연별 예매현황 리포트로 묶어 실습한다.

## CH13-L08 - 실습: 공연별 예매현황 리포트

### 왜 필요한가

지금까지는 JOIN과 집계를 따로 배웠다. 실무 보고서는 둘을 함께 쓴다. 공연별 예매 현황은 좋은 종합 실습이다. 공연 마스터는 공연별 정원과 아티스트를 가지고 있고, 예매 테이블은 공연별 좌석 수와 상태를 가지고 있다. 사용자는 공연별로 몇 석이 예약되었고, 아직 몇 석이 남았는지 보고 싶다.

이 실습의 핵심 질문은 세 가지다.

1. 예매가 없는 공연도 보여야 하는가.
2. 취소된 예매를 합계에서 제외해야 하는가.
3. 예매 행 여러 개를 공연별 한 행으로 줄여야 하는가.

이 질문에 답하면 자연스럽게 LEFT OUTER JOIN, `ON` 조건, `GROUP BY`, `SUM`이 함께 등장한다.

### 무엇인가

공연별 예매현황 리포트는 `zconcert`를 기준으로 `zbooking`을 붙이고, 공연별로 예약 좌석을 합산하는 읽기 전용 보고서다. 예매 없는 공연도 현황표에 보여야 하므로 `zconcert`가 왼쪽이고, JOIN 종류는 LEFT OUTER JOIN이다. 취소 상태는 합계에서 제외해야 하므로 예매를 붙이는 조건에 상태 조건을 함께 둔다.

classic 예제:

```abap
TYPES: BEGIN OF ty_stat,
         concert_id TYPE zconcert-concert_id,
         artist     TYPE zconcert-artist,
         capacity   TYPE zconcert-capacity,
         booked     TYPE i,
       END OF ty_stat.

DATA: lt_stat TYPE TABLE OF ty_stat,
      lo_alv  TYPE REF TO cl_salv_table.

SELECT c~concert_id c~artist c~capacity SUM( b~seats ) AS booked
  FROM zconcert AS c
  LEFT OUTER JOIN zbooking AS b
    ON c~concert_id = b~concert_id
   AND b~status <> 'C'
  INTO CORRESPONDING FIELDS OF TABLE lt_stat
  GROUP BY c~concert_id c~artist c~capacity.

TRY.
    cl_salv_table=>factory(
      IMPORTING r_salv_table = lo_alv
      CHANGING  t_table      = lt_stat ).
    lo_alv->display( ).
  CATCH cx_salv_msg.
ENDTRY.
```

이 코드에서 CH13이 책임지는 부분은 SELECT다. SALV 표시와 `TRY/CATCH`는 CH11 실습 흐름의 재사용이며, 예외 클래스 체계 설명은 CH20 소유다.

SELECT를 문장으로 읽으면 다음과 같다.

- 공연 `c`를 기준 목록으로 둔다.
- 예매 `b`를 공연 ID로 붙인다.
- 취소 상태가 아닌 예매만 붙인다.
- 공연 ID, 아티스트, 정원으로 그룹을 만든다.
- 각 그룹에서 좌석 수를 더해 `booked`에 담는다.

예매가 없는 공연의 `SUM` 결과는 DB null과 ABAP 초기값 변환의 영향을 받을 수 있다. CH13 단계에서는 "예매 없는 공연도 결과에 남아야 한다"는 LEFT OUTER 설계 의도를 먼저 확인하고, null을 값으로 바꾸는 SQL expression 계열 보정은 CH19 이후로 미룬다.

### 어떻게 확인하는가

실습 결과는 손 계산과 화면 결과를 비교한다.

기준 데이터:

```text
zconcert
C001 안유진 정원 100
C002 신유빈 정원 50
C003 전지현 정원 80

zbooking
5001 C001 2 N
5002 C001 4 N
5003 C001 3 N
5004 C002 1 C
5005 C002 2 N
```

손 계산:

| 공연 | 계산 | 기대 booked |
| --- | --- | --- |
| C001 | 2 + 4 + 3 | 9 |
| C002 | 취소 1 제외, 정상 2 | 2 |
| C003 | 예매 없음 | 0 또는 초기 표시 |

확인 절차:

1. C003이 결과에 남아 있는지 본다. 없으면 LEFT OUTER 의도가 깨졌다.
2. C002의 취소 1석이 합계에 들어가지 않았는지 본다.
3. C001의 여러 예매가 한 행으로 묶였는지 본다.
4. `sy-dbcnt`가 공연 기준 결과 행 수와 맞는지 본다.
5. SALV에는 `concert_id`, `artist`, `capacity`, `booked`가 모두 보이는지 본다.

기존 위젯 `CH13-L08-S01`은 이 검증을 시각화하는 도구로 유지한다. 본문에서는 위젯 앞에 조작 목표를 먼저 주고, 위젯 뒤에 결과 해석을 회수한다.

### 체험 설계

L08 체험은 기존 `embeds/abap/CH13-L08-S01.html`을 중심으로 구성한다.

기존 위젯 역할:

- `zconcert`와 `zbooking` 원본 표를 보여 준다.
- LEFT OUTER JOIN과 INNER JOIN을 버튼으로 비교한다.
- 취소 상태 제외 조건이 합계에 어떤 영향을 주는지 보여 준다.
- GROUP BY 결과 `lt_stat`을 시각화한다.

추가 본문 설계:

- 위젯 앞에는 "C003이 남아야 한다", "C002 취소 건은 빠져야 한다", "C001은 한 행으로 합산되어야 한다"라는 관찰 목표 세 가지를 둔다.
- 위젯 중간에는 JOIN 방식 토글을 누르게 한다. LEFT OUTER에서는 C003이 남고, INNER에서는 C003이 빠지는 것을 비교한다.
- 위젯 뒤에는 "내가 만든 SELECT가 어떤 업무 질문에 답했는가"를 한 문장으로 쓰게 한다.

버튼과 상태:

- `LEFT OUTER JOIN`: 기준 공연 보존 상태. C003이 강조된다.
- `INNER JOIN`: 예매 없는 공연 제외 상태. C003이 사라진다.
- `취소 포함 보기`: C002 booked가 달라지는 위험 상태를 보여 준다.
- `GROUP BY 접기`: 예매 행들이 공연별 한 행으로 접히는 애니메이션을 보여 준다.

피드백:

- C003이 남으면 "예매 0도 현황입니다" 표시.
- C003이 빠지면 "INNER는 매칭 없는 기준 행을 버립니다" 표시.
- 취소 포함 시 "상태 조건을 빠뜨리면 업무 합계가 틀립니다" 표시.
- GROUP BY 전후 행 수를 함께 보여 "행 목록에서 요약 보고서로 바뀌었다"는 감각을 만든다.

### 실수와 주의

첫 번째 실수는 예매 없는 공연을 INNER JOIN으로 날리는 것이다. 공연별 현황은 예매가 없어도 공연이 보여야 하므로 기준 표는 `zconcert`, JOIN은 LEFT OUTER가 적합하다.

두 번째 실수는 취소 조건을 어디에 둘지 생각하지 않는 것이다. 이 실습에서는 "취소 예매는 합계에서 제외하되 공연 자체는 남긴다"가 목표다. 상태 조건이 기준 행 보존 의도를 깨지 않는지 위젯으로 확인해야 한다.

세 번째 실수는 GROUP BY 목록을 SELECT 일반 컬럼과 맞추지 않는 것이다. `c~concert_id`, `c~artist`, `c~capacity`를 SELECT 일반 컬럼으로 가져오면 GROUP BY에도 같은 기준이 있어야 한다.

네 번째 실수는 SALV와 SQL 학습 목표를 섞는 것이다. 이 레슨에서 중요한 것은 SALV 객체 구조가 아니라 SELECT 결과가 맞는지다. SALV는 결과 확인 화면일 뿐이다.

### 정리

CH13 실습은 "공연 기준 목록을 보존하고, 예매를 붙이고, 취소를 제외하고, 공연별 합계를 만든다"는 한 문장을 SELECT로 구현한다. LEFT OUTER JOIN은 예매 없는 공연을 남기고, GROUP BY와 SUM은 여러 예매 행을 공연별 한 행으로 줄인다. 이 장을 마치면 학습자는 classic Open SQL로 여러 표를 읽고, 합치고, 요약하고, 정렬하고, 기준 목록 조회까지 판단할 수 있다. 다음 장에서는 이런 조회 로직을 DDIC View와 유지보수 객체 관점에서 다시 만난다.

## CH13 마무리 학습 흐름

CH13의 완성 기준은 문법 암기가 아니라 설명 능력이다. 학습자는 아래 문장을 스스로 말할 수 있어야 한다.

- INNER JOIN은 양쪽에 매칭되는 행만 남긴다.
- LEFT OUTER JOIN은 왼쪽 기준 행을 보존한다.
- `ON` 조건이 느슨하면 행이 조용히 뻥튀기될 수 있다.
- GROUP BY는 여러 행을 그룹별 한 행으로 줄인다.
- aggregate function은 그룹 안의 여러 값을 하나로 계산한다.
- WHERE는 그룹 전 행 조건이고 HAVING은 그룹 후 집계 조건이다.
- ORDER BY가 없으면 결과 순서는 업무 규칙이 아니다.
- FAE는 내부 테이블 기준 목록 조회 도구지만, 빈 목록이면 전체 조회 위험이 있다.
- JOIN, FAE, ABAP 처리는 데이터 위치와 질문 형태로 고른다.

후속 경계:

- CH14: Classic DDIC View와 유지보수 객체. JOIN을 코드가 아니라 DDIC 객체로 바라본다.
- CH15: Selection Screen 심화와 검증. 선택화면 조건을 더 정교하게 다룬다.
- CH19: Modern Open SQL. host marker, comma field list, SQL expression을 정식 도입한다.
- CH20: OO와 예외. SALV 호출, `TRY/CATCH`, class-based exception을 구조적으로 다시 배운다.
