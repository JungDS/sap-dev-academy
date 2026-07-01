# CH08_REWRITE - Open SQL Basic Read Access

> 기준 소스: `content/abap/CH08/_chapter.md`, `content/abap/CH08/CH08-L01.md` ~ `CH08-L07.md`
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 기존 `reference/codex_0625`, `reference/codex_0625_v2`
> 공식 문서 확인: `C:\ABAP_DOCU_HTML`의 `SELECT`, `SINGLE`, `INTO/APPENDING`, `UP TO`, `WHERE`, client handling, SQL condition, `MESSAGE`, DDIC index 항목을 수동 확인

## 챕터 설계

CH07에서 학습자는 `ZGUGUDAN`이라는 Transparent Table을 만들고 2단과 3단 18행을 수동으로 저장했다. 이제 자연스러운 질문이 생긴다.

```text
"테이블에 저장해 둔 값을 ABAP 프로그램에서 다시 가져오려면 어떻게 하지?"
```

CH08의 답은 Open SQL의 `SELECT`다. 이 장은 데이터베이스 변경 장이 아니다. 데이터 입력, 수정, 삭제, transaction control, 감사 필드, 대량 DML은 CH24 이후로 보낸다. CH08은 읽기 전용이다.

또한 CH08은 classic-first 구간이다. CH19 이전이므로 modern Open SQL의 `@` host variable escape, comma-separated select list, inline declaration, SQL expression을 예제로 쓰지 않는다. 코드는 기존 변수 선언과 classic Open SQL 흐름으로 쓴다.

이 장에서 학습자는 매번 같은 다섯 질문으로 조회를 설계한다.

| 질문 | Open SQL에서 대응되는 부분 |
|---|---|
| 어느 테이블에서 읽을 것인가 | `FROM` |
| 어떤 컬럼을 읽을 것인가 | `*` 또는 field list |
| 어떤 행만 통과시킬 것인가 | `WHERE` |
| 결과를 어떤 ABAP 대상에 담을 것인가 | `INTO`, `INTO TABLE`, `APPENDING TABLE` |
| 결과가 없으면 어떻게 알 것인가 | `sy-subrc`, `sy-dbcnt`, `MESSAGE` |

CH08의 마지막 상태는 "SELECT 문장을 외운 사람"이 아니라 "조회 요청을 설계할 수 있는 사람"이다. 입문자가 이 장을 마치면 `ZGUGUDAN`, `SCARR`, `SPFLI`, `SFLIGHT` 같은 테이블을 보고 한 행 조회, 여러 행 조회, 조건 조회, 빈 결과 처리를 스스로 설명할 수 있어야 한다.

## CH08-L01 - SAP 데모 테이블과 Client 종속

### 왜 필요한가

CH07의 `ZGUGUDAN`은 우리가 직접 만든 작은 테이블이다. 구구단 실습에는 좋지만 Open SQL을 충분히 익히기에는 데이터가 단순하다. 실제 업무 조회는 보통 여러 성격의 테이블을 만난다. 항공사, 노선, 날짜별 운항처럼 서로 연결되는 데이터가 있으면 `WHERE`, key, later join 개념을 훨씬 자연스럽게 배울 수 있다.

SAP 시스템에는 Open SQL 학습에 자주 쓰이는 항공 데모 테이블이 있다. 이 장에서는 세 테이블을 읽기 연습 재료로 사용한다.

| 테이블 | 입문자 설명 | 대표 필드 감각 |
|---|---|---|
| `SCARR` | 항공사 마스터 | 항공사 코드, 항공사명 |
| `SPFLI` | 항공편 노선/스케줄 | 항공사 코드, 연결 번호, 출발/도착 도시 |
| `SFLIGHT` | 날짜별 운항편 | 항공사 코드, 연결 번호, 비행일자, 좌석/금액 |

세 테이블은 "항공사 -> 노선 -> 날짜별 운항편"으로 이어진다. CH08에서는 아직 join을 하지 않는다. join은 CH13에서 정식으로 다룬다. 여기서는 표준 데모 데이터가 왜 조회 연습에 좋은지, 그리고 client 종속 테이블을 Open SQL이 어떻게 다루는지만 이해한다.

### 무엇인가

SAP 업무 테이블에는 흔히 `MANDT`라는 client 필드가 있다. client는 같은 SAP 시스템 안에서 데이터를 논리적으로 분리하는 단위다. 입문자에게는 "같은 건물 안의 분리된 교실"로 설명할 수 있다. 같은 테이블 이름이어도 client 100에서 넣은 데이터와 client 200에서 넣은 데이터는 분리되어 보일 수 있다.

공식 문서의 ABAP SQL client handling 설명에 따르면 ABAP SQL은 client-dependent data source를 접근할 때 implicit client handling을 적용한다. 즉 기본적으로 현재 로그인 client의 client column 조건이 ABAP SQL 인터페이스에서 추가된다. 그래서 일반적인 Open SQL 조회 코드에는 `WHERE mandt = sy-mandt`를 직접 쓰지 않는다.

이 사실은 초급자에게 매우 중요하다. `MANDT`가 필드 목록에 보인다고 해서 초급 조회 코드마다 직접 조건으로 넣는 것이 아니다. CH08에서는 "현재 client 데이터만 자동으로 읽힌다"까지 이해하면 충분하다. cross-client 조회나 특수 옵션은 일반 입문 범위가 아니다.

### 어떻게 확인하는가

SE11 또는 ADT Dictionary Object에서 `SCARR`, `SPFLI`, `SFLIGHT`를 열어 다음만 확인한다.

| 확인 항목 | 확인 질문 |
|---|---|
| 첫 필드 | `MANDT`가 있는가 |
| 공통 필드 | `CARRID`가 여러 테이블에 등장하는가 |
| 행의 의미 | `SCARR`는 항공사, `SPFLI`는 노선, `SFLIGHT`는 날짜별 운항편인가 |
| key | `SFLIGHT`에서 항공사/연결번호/날짜가 한 운항편을 찾는 기준인가 |

그다음 작은 조회 프로그램으로 현재 client의 운항편을 읽는다.

```abap
REPORT zch08_l01_demo_table.

DATA: lt_flight TYPE TABLE OF sflight,
      lv_count  TYPE i.

SELECT *
  FROM sflight
  INTO TABLE lt_flight
  WHERE carrid = 'LH'.

DESCRIBE TABLE lt_flight LINES lv_count.

WRITE: / '읽은 항공편 수:', lv_count.
WRITE: / 'sy-subrc:', sy-subrc.
WRITE: / 'sy-dbcnt:', sy-dbcnt.
```

이 예제의 핵심은 `MANDT` 조건이 없다는 점이다. 그래도 Open SQL은 현재 client 기준으로 데이터를 읽는다. 단, 교육 시스템마다 항공 데모 데이터가 다를 수 있으므로 `LH`가 없으면 강사가 안내한 항공사 코드로 바꾼다.

### 체험 설계

L01에는 "Client 자동 필터 체험 카드"를 둔다.

| 요소 | 설계 |
|---|---|
| 화면 | client 100, 200, 300을 나란히 보여 주고 각 client 안에 `SFLIGHT` 행을 배치 |
| 입력 | 현재 로그인 client 선택, 항공사 코드 선택 |
| 버튼 | `SELECT 실행`, `MANDT 직접 입력 시도`, `client 전환 보기` |
| 상태 | 현재 client, 사용자가 쓴 WHERE, 시스템이 암묵 적용한 client 조건, 결과 행 수 |
| 피드백 | `MANDT`를 직접 쓰면 "초급 Open SQL에서는 직접 조건으로 다루지 않음" 경고 |

시각화는 사용자가 `WHERE carrid = 'LH'`만 작성해도 현재 client 칸의 행만 결과 Internal Table로 이동하게 한다. 이때 "작성한 조건"과 "시스템이 추가한 client 범위"를 분리해서 보여 주면 초급자가 암묵 동작을 이해하기 쉽다.

### 실수와 주의

첫 번째 실수는 `WHERE mandt = sy-mandt`를 습관적으로 쓰는 것이다. ABAP SQL의 implicit client handling을 먼저 믿는다.

두 번째 실수는 예제 데이터가 모든 시스템에 동일하다고 생각하는 것이다. 항공 데모 데이터는 교육 시스템 구성에 따라 없거나 값이 다를 수 있다.

세 번째 실수는 `SCARR`, `SPFLI`, `SFLIGHT`의 관계를 CH08에서 join 코드로 앞당기는 것이다. 이 장은 조회 기본이고, 여러 테이블 연결은 CH13이다.

### 정리

CH08은 저장된 데이터를 다시 읽는 장이다. `ZGUGUDAN`은 우리 관통 예제이고, `SCARR`, `SPFLI`, `SFLIGHT`는 SAP 표준 데모 데이터다. client-dependent table은 Open SQL이 현재 client 기준으로 기본 처리하므로 초급 조회 코드에서 `MANDT`를 직접 조건으로 쓰지 않는다.

## CH08-L02 - SELECT 4요소, `*`와 field projection

### 왜 필요한가

초급자는 처음 SQL을 배우면 보통 `SELECT *`부터 쓴다. 전체 컬럼을 읽으면 결과가 잘 보이기 때문에 학습 초기에는 좋다. 하지만 실무 프로그램에서 항상 전체 컬럼을 읽는 습관은 좋지 않다. 이름과 금액만 필요한데 긴 텍스트, 생성자, 변경일, 상태 필드까지 모두 읽으면 프로그램은 불필요한 데이터를 들고 다닌다.

L02의 목표는 `SELECT`를 "데이터 요청서"로 이해하는 것이다. 요청서에는 네 가지가 들어간다.

1. 어느 테이블에서 읽을지
2. 어떤 컬럼을 읽을지
3. 어떤 조건으로 행을 줄일지
4. 결과를 어느 ABAP 대상에 담을지

### 무엇인가

`SELECT *`는 테이블의 모든 컬럼을 읽는다. `SELECT dan mul result`처럼 필드를 나열하면 필요한 컬럼만 읽는다. 이렇게 필요한 컬럼만 고르는 것을 projection이라고 부른다.

classic Open SQL에서는 field list를 comma 없이 공백으로 나열한다.

```abap
SELECT dan mul result
```

modern Open SQL의 comma-separated field list와 `@` host variable escape는 CH19에서 다룬다. CH08에서는 섞지 않는다.

조회 후에는 `sy-subrc`와 `sy-dbcnt`를 확인한다.

| 시스템 필드 | 의미 |
|---|---|
| `sy-subrc` | 직전 SQL 문장의 성공/실패 상태. 조회 결과가 있으면 보통 0, 없으면 4 |
| `sy-dbcnt` | 직전 SQL 문장에서 ABAP으로 전달된 행 수 |

### 어떻게 확인하는가

CH07에서 저장한 `ZGUGUDAN`을 전체 컬럼으로 읽는다.

```abap
REPORT zch08_l02_select_all.

DATA: lt_gugu  TYPE TABLE OF zgugudan,
      lv_count TYPE i.

SELECT *
  FROM zgugudan
  INTO TABLE lt_gugu.

DESCRIBE TABLE lt_gugu LINES lv_count.

WRITE: / '읽은 행 수:', lv_count.
WRITE: / 'sy-subrc:', sy-subrc.
WRITE: / 'sy-dbcnt:', sy-dbcnt.
```

2단과 3단 18행을 넣어 두었다면 전체 조회 결과는 18행이어야 한다. 데이터가 없으면 0행이고 `sy-subrc`는 4가 될 수 있다.

이번에는 필요한 컬럼만 읽는다.

```abap
REPORT zch08_l02_select_fields.

DATA: lt_gugu  TYPE TABLE OF zgugudan,
      lv_count TYPE i.

SELECT dan mul result
  FROM zgugudan
  INTO CORRESPONDING FIELDS OF TABLE lt_gugu
  WHERE dan = 3.

DESCRIBE TABLE lt_gugu LINES lv_count.

WRITE: / '3단 행 수:', lv_count.
WRITE: / 'sy-subrc:', sy-subrc.
WRITE: / 'sy-dbcnt:', sy-dbcnt.
```

`INTO CORRESPONDING FIELDS OF TABLE`은 읽은 컬럼과 대상 Internal Table row의 같은 이름 필드에 값을 넣는다. 일부 컬럼만 읽을 때 초급자가 필드 순서 실수를 줄일 수 있는 방법이다.

`table~field` 표기는 필드가 어느 테이블 소속인지 명확히 할 때 사용한다. CH08에서는 단일 테이블 조회가 기본이므로 맛보기만 한다. 여러 테이블에서 같은 이름 필드가 등장하는 상황은 CH13에서 다룬다.

### 체험 설계

기존 `embeds/abap/CH08-L02-S01.html`을 중심 체험으로 사용한다. 이 위젯은 연습용 `ZTPERSON` 데이터를 사용하지만 학습 목표는 동일하다. field list, `WHERE`, 결과 Internal Table, `sy-subrc`, `sy-dbcnt`가 한 화면에서 바뀐다.

| 버튼 | 학습 포인트 |
|---|---|
| `전체 조회` | `SELECT *`가 모든 컬럼을 읽는다는 점 |
| `컬럼만` | field projection으로 결과 모양이 줄어든다는 점 |
| `나이 조건` | 숫자 조건으로 행이 줄어드는 점 |
| `도시 조건` | 문자 조건도 같은 `WHERE` 구조로 읽힌다는 점 |

결과 패널은 다음 네 값을 항상 보여 준다.

```text
선택 컬럼 수
결과 행 수
sy-subrc
sy-dbcnt
```

사용자가 버튼을 누를 때마다 "내가 지금 바꾼 것은 컬럼인가, 행 조건인가, 대상인가"를 짧게 되묻는 피드백을 붙이면 좋다.

### 실수와 주의

첫 번째 실수는 classic 구문에서 필드를 comma로 나열하는 것이다. CH08 예제에서는 `SELECT dan mul result`처럼 쓴다.

두 번째 실수는 `SELECT *`를 영원히 나쁜 코드로 오해하는 것이다. 학습 초반과 구조 확인에는 유용하다. 다만 실무 로직에서는 필요한 컬럼을 명시하는 습관이 중요하다.

세 번째 실수는 `sy-dbcnt`와 Internal Table 전체 행 수를 언제나 같은 의미로 보는 것이다. 직전 SQL이 `INTO TABLE`이면 대체로 같은 행 수를 보지만, `APPENDING TABLE`처럼 누적하는 경우에는 직전 SQL 전달 행 수와 누적 테이블 행 수가 다를 수 있다.

### 정리

`SELECT`는 "어디서, 무엇을, 어떤 조건으로, 어디에"를 정하는 문장이다. L02를 지나면 학습자는 전체 컬럼 조회와 필요한 컬럼 조회의 차이, classic field list 규칙, `sy-subrc`와 `sy-dbcnt`의 역할을 설명할 수 있어야 한다.

## CH08-L03 - SELECT 형태: `SINGLE`, `INTO TABLE`, `ENDSELECT`, `UP TO n ROWS`

### 왜 필요한가

조회 결과는 모양이 다르다. 어떤 조회는 정확히 한 행만 필요하다. 어떤 조회는 목록 전체가 필요하다. 어떤 오래된 코드는 한 행씩 읽으며 반복한다. 어떤 조회는 처음 몇 행만 빠르게 확인하면 된다.

이 차이를 모르고 모두 같은 `SELECT`로 보면 문제가 생긴다. 여러 행이 필요한데 Work Area 하나에만 받거나, 정확히 한 행이 보장되지 않는데 `SELECT SINGLE`을 써서 "왜 이 행이 나왔는지" 설명하지 못하게 된다.

L03의 기준 질문은 하나다.

```text
"내가 원하는 결과는 한 행인가, 여러 행인가?"
```

### 무엇인가

`SELECT SINGLE`은 결과 집합을 한 행으로 다룬다. 공식 문서에서도 `SINGLE`을 쓰면 internal table을 target으로 지정할 수 없고, non-table target에 한 행을 넣는다고 설명한다. 조건이 정확히 한 행을 가리킬 때 의미가 가장 분명하다.

`INTO TABLE`은 여러 행 결과를 Internal Table에 담는다. 초급자가 새 목록 조회를 작성할 때 기본 선택지로 삼기 좋다.

`SELECT ... ENDSELECT`는 non-table target에 여러 결과를 한 행씩 담으며 반복하는 오래된 형태다. 읽을 수는 있어야 하지만, 새 코드의 기본 습관으로 삼지는 않는다.

`UP TO n ROWS`는 읽을 최대 행 수를 제한한다. 공식 문서 기준으로 결과 집합의 최대 행 수를 제한하는 addition이다. 단, `SINGLE`과 함께 쓰지 않는다.

### 어떻게 확인하는가

정확한 한 운항편을 Work Area에 읽는다.

```abap
REPORT zch08_l03_single.

DATA ls_flight TYPE sflight.

SELECT SINGLE *
  FROM sflight
  INTO ls_flight
  WHERE carrid = 'LH'
    AND connid = '0400'
    AND fldate = '20260625'.

IF sy-subrc = 0.
  WRITE: / '항공사:', ls_flight-carrid.
  WRITE: / '연결번호:', ls_flight-connid.
  WRITE: / '비행일자:', ls_flight-fldate.
ELSE.
  WRITE: / '조건에 맞는 항공편이 없습니다.'.
ENDIF.
```

교육 시스템에 해당 날짜 데이터가 없을 수 있다. 이 경우 SE11/ADT에서 존재하는 `SFLIGHT` key 값을 확인한 뒤 조건을 바꿔 실행한다.

여러 운항편을 Internal Table로 읽는다.

```abap
REPORT zch08_l03_into_table.

DATA: lt_flight TYPE TABLE OF sflight,
      ls_flight TYPE sflight.

SELECT *
  FROM sflight
  INTO TABLE lt_flight
  WHERE carrid = 'LH'.

IF sy-subrc = 0.
  LOOP AT lt_flight INTO ls_flight.
    WRITE: / ls_flight-carrid, ls_flight-connid, ls_flight-fldate.
  ENDLOOP.
ELSE.
  WRITE: / 'LH 항공편이 없습니다.'.
ENDIF.
```

오래된 코드에서 볼 수 있는 `ENDSELECT` 형태다.

```abap
REPORT zch08_l03_endselect.

DATA ls_flight TYPE sflight.

SELECT *
  FROM sflight
  INTO ls_flight
  WHERE carrid = 'LH'.

  WRITE: / ls_flight-carrid, ls_flight-connid, ls_flight-fldate.

ENDSELECT.
```

CH08의 학습 목표는 이 코드를 읽을 수 있게 만드는 것이다. 새 목록 조회는 우선 `INTO TABLE`로 가져오고 ABAP 쪽에서 `LOOP AT`으로 처리하는 흐름을 권장한다.

최대 행 수를 제한한다.

```abap
REPORT zch08_l03_up_to.

DATA: lt_flight TYPE TABLE OF sflight,
      lv_count  TYPE i.

SELECT *
  FROM sflight
  INTO TABLE lt_flight
  UP TO 10 ROWS
  WHERE carrid = 'LH'.

DESCRIBE TABLE lt_flight LINES lv_count.

WRITE: / '최대 10행 중 실제 읽은 행 수:', lv_count.
WRITE: / 'sy-subrc:', sy-subrc.
WRITE: / 'sy-dbcnt:', sy-dbcnt.
```

행 순서가 중요한 요구사항은 CH13의 정렬 주제와 연결된다. CH08에서는 `UP TO`가 "최대 몇 행"을 제한한다는 점까지만 잡는다.

### 체험 설계

L03에는 "SELECT 형태 비교 실험실"을 둔다.

| 버튼 | 화면 변화 | 피드백 |
|---|---|---|
| `SINGLE` | Work Area 한 칸에 한 행이 들어감 | "한 행 target. 조건이 애매하면 어떤 한 행인지 설명하기 어렵다." |
| `INTO TABLE` | Internal Table에 여러 행이 채워짐 | "목록 조회 기본형. 이후 LOOP로 처리한다." |
| `ENDSELECT` | Work Area가 행마다 덮어써지는 애니메이션 | "레거시 코드에서 읽어야 하지만 기본 습관은 아님." |
| `UP TO 3 ROWS` | 전체 후보 중 최대 3행만 결과로 이동 | "행 수 제한. 정렬 의미는 별도 학습." |

상태 패널은 target type, target row count, loop pass count, `sy-subrc`, `sy-dbcnt`를 동시에 보여 준다.

### 실수와 주의

첫 번째 실수는 일부 key 조건으로 `SELECT SINGLE`을 쓰는 것이다. `carrid = 'LH'`만으로는 여러 운항편이 있을 수 있다. 이때 `SINGLE`은 한 행만 가져오지만 학습자는 왜 그 행인지 설명하기 어렵다.

두 번째 실수는 `ENDSELECT` 안에서 다시 `SELECT`를 수행하는 중첩 조회다. 이 패턴은 성능과 이해도 모두 나쁘므로 CH08부터 금지 습관으로 둔다.

세 번째 실수는 `UP TO 1 ROWS`와 `SELECT SINGLE`을 아무 의미 없이 바꾸어 쓰는 것이다. `SINGLE`은 한 행 target의 의도가 분명할 때 사용한다.

### 정리

L03의 핵심은 결과 모양이다. 정확한 한 행이면 `SELECT SINGLE`, 여러 행 목록이면 `INTO TABLE`, 오래된 한 행씩 반복 코드는 `ENDSELECT`, 최대 행 수 제한은 `UP TO n ROWS`로 읽는다.

## CH08-L04 - `INTO` 대상 형태

### 왜 필요한가

데이터베이스가 값을 읽어도 ABAP 프로그램 어딘가에 담기 전까지는 사용할 수 없다. `INTO`는 조회 결과의 도착지다.

초급자는 `SELECT`의 앞부분보다 `INTO` 뒤에서 더 많이 틀린다. 한 행을 구조에 담아야 하는데 Internal Table로 선언하지 않았거나, 개별 변수 순서를 바꿔 값이 뒤집히거나, 기존 Internal Table을 지우지 않고 이어 붙여야 하는데 덮어쓰는 실수를 한다.

L04의 목표는 `INTO` 뒤를 보면 결과가 ABAP 메모리 안에서 어떤 모양으로 존재하는지 설명하게 만드는 것이다.

### 무엇인가

대표 target 형태는 네 가지다.

| 형태 | 의미 | 주 사용 상황 |
|---|---|---|
| `INTO wa` | 한 행을 Work Area/Structure에 담음 | `SELECT SINGLE`, `SELECT ... ENDSELECT` |
| `INTO (v1, v2, ...)` | 선택 컬럼을 개별 변수에 순서대로 담음 | 몇 개 scalar 값만 필요할 때 |
| `INTO CORRESPONDING FIELDS OF ...` | 같은 이름 필드에 맞춰 담음 | 일부 컬럼, 다른 구조 target |
| `APPENDING TABLE itab` | 기존 Internal Table 뒤에 결과를 추가 | 여러 조회 결과를 누적할 때 |

공식 `SELECT, INTO, APPENDING` 문서는 `INTO`와 `APPENDING`이 query result를 어떤 ABAP data object에 어떻게 assign할지 정의한다고 설명한다.

### 어떻게 확인하는가

한 행을 Work Area에 담는다.

```abap
REPORT zch08_l04_into_wa.

DATA ls_scarr TYPE scarr.

SELECT SINGLE *
  FROM scarr
  INTO ls_scarr
  WHERE carrid = 'LH'.

IF sy-subrc = 0.
  WRITE: / ls_scarr-carrid, ls_scarr-carrname.
ENDIF.
```

몇 개 컬럼을 개별 변수로 받는다.

```abap
REPORT zch08_l04_into_variables.

DATA: lv_carrid   TYPE sflight-carrid,
      lv_connid   TYPE sflight-connid,
      lv_payments TYPE sflight-paymentsum.

SELECT SINGLE carrid connid paymentsum
  FROM sflight
  INTO (lv_carrid, lv_connid, lv_payments)
  WHERE carrid = 'LH'
    AND connid = '0400'.

IF sy-subrc = 0.
  WRITE: / lv_carrid, lv_connid, lv_payments.
ENDIF.
```

`INTO (lv_carrid, lv_connid, lv_payments)`는 이름이 아니라 순서로 들어간다. `SELECT connid carrid paymentsum`으로 바꾸면 변수에 들어가는 의미도 바뀐다.

필드 이름을 맞춰 작은 구조 Internal Table에 담는다.

```abap
REPORT zch08_l04_corresponding.

TYPES: BEGIN OF ty_flight_brief,
         carrid TYPE sflight-carrid,
         connid TYPE sflight-connid,
         fldate TYPE sflight-fldate,
       END OF ty_flight_brief.

DATA: lt_brief TYPE TABLE OF ty_flight_brief,
      lv_count TYPE i.

SELECT carrid connid fldate
  FROM sflight
  INTO CORRESPONDING FIELDS OF TABLE lt_brief
  WHERE carrid = 'LH'.

DESCRIBE TABLE lt_brief LINES lv_count.
WRITE: / '읽은 행 수:', lv_count.
WRITE: / 'sy-dbcnt:', sy-dbcnt.
```

기존 Internal Table에 결과를 이어 붙인다.

```abap
REPORT zch08_l04_appending.

DATA: lt_flight TYPE TABLE OF sflight,
      lv_count  TYPE i.

SELECT *
  FROM sflight
  APPENDING TABLE lt_flight
  WHERE carrid = 'LH'.

SELECT *
  FROM sflight
  APPENDING TABLE lt_flight
  WHERE carrid = 'AA'.

DESCRIBE TABLE lt_flight LINES lv_count.

WRITE: / '누적 Internal Table 행 수:', lv_count.
WRITE: / '직전 SELECT 전달 행 수:', sy-dbcnt.
```

마지막 예제에서 `sy-dbcnt`는 직전 `SELECT`가 전달한 행 수다. `lt_flight` 전체 누적 행 수는 `DESCRIBE TABLE`로 확인한다.

### 체험 설계

L04에는 "INTO 대상 보드"를 둔다. 같은 `SFLIGHT` 결과를 네 도착지로 보내는 방식이다.

| 탭 | 시각화 |
|---|---|
| Work Area | 한 행 구조 카드에 값이 들어가고 다음 실행 시 덮어써짐 |
| 변수 묶음 | field 1 -> variable 1, field 2 -> variable 2 순서 화살표 |
| CORRESPONDING | 이름이 같은 field만 초록색으로 연결, 이름이 없으면 회색 |
| APPENDING | 기존 Internal Table 아래에 새 행이 붙고 누적 row count 증가 |

실수 체험으로 `SELECT connid carrid`와 `INTO (lv_carrid, lv_connid)`의 순서를 일부러 바꾸는 버튼을 제공한다. 버튼을 누르면 값이 변수 이름과 맞지 않게 들어가는 경고를 표시한다.

### 실수와 주의

첫 번째 실수는 `INTO (v1, v2)`를 이름 매칭으로 오해하는 것이다. 이것은 순서 매칭이다.

두 번째 실수는 `CORRESPONDING`을 모든 값을 알아서 맞춰 주는 기능으로 오해하는 것이다. 이름이 같은 필드만 채운다.

세 번째 실수는 `INTO TABLE`과 `APPENDING TABLE` 차이를 놓치는 것이다. `INTO TABLE`은 대상 테이블을 새 결과로 채우고, `APPENDING TABLE`은 기존 행 뒤에 붙인다.

### 정리

`INTO`는 조회 결과의 도착지다. 한 행 구조, 변수 묶음, 이름 매칭 구조, 누적 Internal Table 중 어떤 target을 쓰는지에 따라 이후 ABAP 로직의 모양이 달라진다.

## CH08-L05 - `WHERE` 상세: 비교, 범위, 목록, 패턴, NULL

### 왜 필요한가

좋은 조회는 전체를 읽지 않는다. 고객 전체, 주문 전체, 전표 전체를 모두 가져온 뒤 ABAP에서 걸러 내면 프로그램은 느리고 위험해진다. 필요한 행만 데이터베이스에서 통과시키는 것이 `WHERE`의 역할이다.

L05의 목표는 `WHERE`를 "필터 문"으로 이해하는 것이다. 행마다 조건식을 평가하고, 참인 행만 결과 집합에 들어간다.

### 무엇인가

공식 `SELECT, WHERE` 문서는 `WHERE sql_cond`가 result set에 포함되는 row 수를 logical expression으로 제한한다고 설명한다. 행은 조건이 true일 때만 결과에 포함된다.

CH08에서 다루는 조건은 다음이다.

| 조건 | 예 | 설명 |
|---|---|---|
| 비교 | `carrid = 'LH'` | 단일 값 비교 |
| 범위 | `fldate BETWEEN '20260101' AND '20261231'` | 양 끝값 포함 범위 |
| 목록 | `carrid IN ('LH', 'AA')` | 후보 중 하나 |
| 패턴 | `cityfrom LIKE 'S%'` | 문자열 pattern |
| NULL | `field IS NULL` | DB null 값 확인 |
| 논리 연결 | `AND`, `OR`, `NOT` | 조건 결합 |

비교 연산자는 기호형과 단어형을 모두 볼 수 있다.

| 기호형 | 단어형 |
|---|---|
| `=` | `EQ` |
| `<>` | `NE` |
| `<` | `LT` |
| `>` | `GT` |
| `<=` | `LE` |
| `>=` | `GE` |

classic Open SQL에서 ABAP 변수는 modern escape marker 없이 그대로 쓴다. host variable escape가 붙는 modern 형태는 CH19에서 다룬다.

### 어떻게 확인하는가

단일 값 조건이다.

```abap
REPORT zch08_l05_equal.

DATA lt_flight TYPE TABLE OF sflight.

SELECT *
  FROM sflight
  INTO TABLE lt_flight
  WHERE carrid = 'LH'.

WRITE: / 'LH 항공편 수:', sy-dbcnt.
```

ABAP 변수로 조건을 준다.

```abap
REPORT zch08_l05_host_variable.

DATA: lt_flight TYPE TABLE OF sflight,
      lv_carrid TYPE sflight-carrid.

lv_carrid = 'LH'.

SELECT *
  FROM sflight
  INTO TABLE lt_flight
  WHERE carrid = lv_carrid.

WRITE: / '선택 항공사 항공편 수:', sy-dbcnt.
```

범위 조건이다.

```abap
REPORT zch08_l05_between.

DATA lt_flight TYPE TABLE OF sflight.

SELECT *
  FROM sflight
  INTO TABLE lt_flight
  WHERE fldate BETWEEN '20260101' AND '20261231'.

WRITE: / '2026년 항공편 수:', sy-dbcnt.
```

후보 목록 조건이다.

```abap
REPORT zch08_l05_in.

DATA lt_flight TYPE TABLE OF sflight.

SELECT *
  FROM sflight
  INTO TABLE lt_flight
  WHERE carrid IN ('LH', 'AA').

WRITE: / 'LH 또는 AA 항공편 수:', sy-dbcnt.
```

패턴 조건이다.

```abap
REPORT zch08_l05_like.

DATA lt_spfli TYPE TABLE OF spfli.

SELECT *
  FROM spfli
  INTO TABLE lt_spfli
  WHERE cityfrom LIKE 'S%'.

WRITE: / 'S로 시작하는 출발 도시 노선 수:', sy-dbcnt.
```

논리 연결 조건이다.

```abap
REPORT zch08_l05_and_or.

DATA lt_flight TYPE TABLE OF sflight.

SELECT *
  FROM sflight
  INTO TABLE lt_flight
  WHERE carrid = 'LH'
    AND seatsmax > 100.

WRITE: / 'LH 중 최대 좌석 100 초과:', sy-dbcnt.
```

`IS NULL`은 DB null 값을 확인하는 조건이다. ABAP 초기값과 DB null은 같은 말이 아니다. CH08에서는 "DB에 값 자체가 없음을 나타내는 특별 상태" 수준으로만 소개한다.

### 체험 설계

L05에는 "WHERE 필터 실험실"을 둔다.

| UI 요소 | 설계 |
|---|---|
| 데이터 | `SFLIGHT`/`SPFLI` 축소 모의 데이터 10~15행 |
| 조건 칩 | `=`, `>`, `BETWEEN`, `IN`, `LIKE`, `IS NULL` |
| 논리 칩 | `AND`, `OR`, `NOT`, 괄호 표시 |
| 버튼 | `조건 적용`, `조건 초기화`, `제외 이유 보기` |
| 상태 | 전체 행 수, 통과 행 수, 제외 행 수, `sy-subrc`, `sy-dbcnt` |
| 피드백 | 각 제외 행에 "carrid 불일치", "날짜 범위 밖" 같은 이유 표시 |

특히 `LIKE`는 `%`와 `_`를 직접 체험해야 한다. `S%`는 S로 시작하는 여러 글자, `_EOUL`은 정확히 한 글자 뒤 `EOUL`인 값이라는 식으로 pattern badge를 보여 준다.

### 실수와 주의

첫 번째 실수는 ABAP 변수 앞에 `@`를 붙이는 modern 습관을 CH08에 섞는 것이다. CH08은 classic 구문이다.

두 번째 실수는 `%`와 `_`를 ABAP의 다른 wildcard 감각과 섞는 것이다. ABAP SQL `LIKE`에서는 standard SQL처럼 `%`와 `_`를 쓴다.

세 번째 실수는 `AND`와 `OR`를 길게 섞고 괄호를 생략하는 것이다. 조건이 길어지면 사람이 읽는 순서와 실제 논리식 해석이 어긋날 수 있다. 입문 단계에서는 조건을 짧게 유지하고 괄호를 명확히 둔다.

네 번째 실수는 SELECT-OPTIONS와 range table을 여기서 앞당기는 것이다. 사용자가 입력한 복수 조건과 range는 CH12에서 정식으로 다룬다.

### 정리

`WHERE`는 필요한 행만 데이터베이스에서 통과시키는 조건문이다. 비교, 범위, 목록, 패턴, NULL, 논리 연결을 조합하면 전체 테이블이 아니라 필요한 결과 집합을 읽을 수 있다.

## CH08-L06 - Key Field, 일반 Field, Index 기초

### 왜 필요한가

초급자는 `WHERE carrid = 'LH'`와 `WHERE planetype = '747-400'`을 같은 종류의 조건으로 보기 쉽다. 둘 다 문법적으로는 조건이다. 하지만 데이터베이스가 행을 찾는 입장에서는 큰 차이가 날 수 있다.

어떤 필드는 테이블의 key에 속해 행을 식별하는 길잡이가 된다. 어떤 필드는 설명 속성일 뿐이라 많은 행을 확인해야 할 수 있다. L06의 목표는 성능 튜닝이 아니라 "조건에 어떤 필드를 쓰느냐가 조회 비용에 영향을 준다"는 감각을 만드는 것이다.

### 무엇인가

Primary Key는 행을 유일하게 식별하는 key field 조합이다. DDIC index 공식 문서는 DDIC database table에 key field로 구성된 primary index가 하나 있고, optional secondary index를 가질 수 있다고 설명한다.

`SFLIGHT`에서는 항공사 코드, 연결 번호, 비행일자 같은 조합이 특정 운항편을 찾는 핵심 조건이 된다. 반면 `planetype` 같은 일반 필드는 여러 행에서 반복될 수 있다.

Secondary Index는 primary key가 아닌 field 조합으로 별도의 조회 경로를 만드는 개념이다. 하지만 "느리면 인덱스를 만들면 된다"는 식으로 단순화하면 안 된다. 인덱스는 저장 공간, 쓰기 비용, 운영 영향, DB 플랫폼 특성을 함께 고려해야 한다. 특히 S/4HANA/HANA 환경에서는 과거 방식처럼 인덱스를 많이 추가하는 접근이 항상 좋은 답이 아니다.

### 어떻게 확인하는가

key에 가까운 조건으로 한 행을 찾는다.

```abap
REPORT zch08_l06_key_condition.

DATA ls_flight TYPE sflight.

SELECT SINGLE *
  FROM sflight
  INTO ls_flight
  WHERE carrid = 'LH'
    AND connid = '0400'
    AND fldate = '20260625'.

IF sy-subrc = 0.
  WRITE: / '정확한 항공편을 찾았습니다.'.
ELSE.
  WRITE: / '해당 key의 항공편이 없습니다.'.
ENDIF.
```

일반 필드 조건으로 목록을 찾는다.

```abap
REPORT zch08_l06_general_condition.

DATA lt_flight TYPE TABLE OF sflight.

SELECT *
  FROM sflight
  INTO TABLE lt_flight
  WHERE planetype = '747-400'.

WRITE: / '해당 기종 항공편 수:', sy-dbcnt.
```

두 예제 모두 문법적으로 맞다. 그러나 질문이 다르다.

| 코드 | 학습 질문 |
|---|---|
| key 조건 `carrid/connid/fldate` | 내가 정확히 한 행을 찾고 있는가 |
| 일반 필드 `planetype` | 이 조건으로 후보 행이 많이 남지는 않는가 |

### 체험 설계

L06에는 "키 조건 렌즈"를 둔다.

| 모드 | 시각화 |
|---|---|
| key 완성 모드 | `carrid`, `connid`, `fldate` 세 조건을 채우면 한 행으로 바로 연결되는 좁은 길 |
| key 일부 모드 | `carrid`만 채우면 여러 후보 행이 남는 넓은 길 |
| 일반 필드 모드 | `planetype` 조건으로 많은 행을 검사하는 흐름 |
| secondary index 개념 모드 | 자주 쓰는 일반 field 조합에 별도 길이 생기는 그림 |

결과 패널에는 실제 시간을 단정하지 않고 다음을 표시한다.

```text
key 조건 완성도
예상 후보 행 수
일반 field 조건 여부
성능 심화: CH32
```

### 실수와 주의

첫 번째 실수는 key 일부만 넣고도 단건이라고 믿는 것이다. `carrid = 'LH'`는 항공사 하나지만 운항편은 여러 개일 수 있다.

두 번째 실수는 `SELECT SINGLE`로 일반 필드 조건의 "아무 한 행"을 가져오고도 그것을 업무적으로 의미 있는 한 행이라고 생각하는 것이다.

세 번째 실수는 secondary index를 빠르게 만드는 만능 버튼으로 이해하는 것이다. 표준 테이블, 운영 데이터, HANA 환경에서는 인덱스 추가가 설계 검토 대상이다.

### 정리

`WHERE` 조건은 결과 행 수뿐 아니라 데이터베이스가 찾는 길에도 영향을 준다. CH08에서는 key 조건을 존중하는 습관과 secondary index의 존재만 이해한다. SQL 성능 분석과 trace는 CH32에서 다룬다.

## CH08-L07 - 조회 실패와 `MESSAGE` 기초

### 왜 필요한가

조회는 실패할 수 있다. CH07에서 `ZGUGUDAN`에 2단과 3단만 넣었다면 5단 조회는 결과가 없다. 이때 프로그램이 조용히 빈 화면만 보여 주면 사용자는 조건이 틀린 것인지, 데이터가 없는 것인지, 프로그램이 멈춘 것인지 알 수 없다.

실무 프로그램의 품질은 실패 처리에서 드러난다. L07의 목표는 `sy-subrc`로 빈 결과를 판단하고, 사용자에게 이해 가능한 피드백을 주는 것이다.

### 무엇인가

조회 뒤 `sy-subrc = 0`이면 적어도 한 행이 ABAP 쪽으로 넘어온 상황으로 볼 수 있다. 결과가 없으면 보통 `sy-subrc = 4`가 된다. `sy-dbcnt`는 직전 SQL에서 전달된 행 수다.

`MESSAGE`는 사용자에게 메시지를 보내는 ABAP 문장이다. 공식 문서 기준으로 `MESSAGE`는 message text를 보내며, 표시와 흐름은 message type과 실행 context에 따라 달라진다. CH08에서는 전체 메시지 체계를 외우지 않는다. `TYPE 'S'`와 `TYPE 'I'`를 맛보기로만 다룬다.

| 메시지 타입 | CH08 수준 설명 |
|---|---|
| `S` | 상태/성공 성격. 보통 상태바 알림으로 이해 |
| `I` | 정보 알림. 사용자가 확인하는 팝업 감각 |

`E`, `W`, `A`, `X`, 메시지 클래스, 메시지 번호, 화면 입력 제어는 CH15에서 정식으로 다룬다.

### 어떻게 확인하는가

구구단 5단을 조회하고 결과 없음 분기를 작성한다.

```abap
REPORT zch08_l07_no_result.

DATA: lt_gugu TYPE TABLE OF zgugudan,
      ls_gugu TYPE zgugudan,
      lv_dan  TYPE zgugudan-dan.

lv_dan = 5.

SELECT *
  FROM zgugudan
  INTO TABLE lt_gugu
  WHERE dan = lv_dan.

IF sy-subrc = 0.
  LOOP AT lt_gugu INTO ls_gugu.
    WRITE: / ls_gugu-dan, 'x', ls_gugu-mul, '=', ls_gugu-result.
  ENDLOOP.
ELSE.
  WRITE: / lv_dan, '단 데이터가 없습니다.'.
  MESSAGE '조건에 맞는 구구단 데이터가 없습니다.' TYPE 'S'.
ENDIF.
```

정보 메시지로 더 강하게 알려 주는 맛보기다.

```abap
REPORT zch08_l07_message_i.

DATA lt_gugu TYPE TABLE OF zgugudan.

SELECT *
  FROM zgugudan
  INTO TABLE lt_gugu
  WHERE dan = 5.

IF sy-subrc <> 0.
  MESSAGE '5단 데이터가 없어 목록을 표시할 수 없습니다.' TYPE 'I'.
ENDIF.
```

여기서 중요한 것은 message type 암기가 아니다. 조회 결과가 없을 때도 프로그램 흐름을 설계하고 사용자에게 이유를 알려 주는 습관이다.

### 체험 설계

L07에는 "빈 결과와 메시지 피드백" 체험을 둔다.

| 조작 | 상태 변화 |
|---|---|
| `dan = 2` 선택 | 9행 표시, `sy-subrc = 0`, `sy-dbcnt = 9` |
| `dan = 5` 선택 | 결과 테이블 비움, `sy-subrc = 4`, `sy-dbcnt = 0` |
| `WRITE만 표시` | 목록 영역에 "데이터가 없습니다" 출력 |
| `MESSAGE S` | 화면 하단 상태바 모형에 메시지 표시 |
| `MESSAGE I` | 정보 팝업 모형과 확인 버튼 표시 |

사용자는 같은 실패 상황도 피드백 방식에 따라 경험이 달라진다는 점을 본다. 상태 패널에는 "프로그램 판단: 데이터 없음", "사용자에게 전달한 말", "다음 흐름: 종료/재입력/다른 조건"을 나눠 표시한다.

### 실수와 주의

첫 번째 실수는 `sy-subrc`를 확인하지 않고 다음 로직을 계속 실행하는 것이다. 특히 Work Area를 재사용하는 코드에서는 이전 값이 남아 있어 더 위험하다.

두 번째 실수는 단순 "데이터 없음"을 무조건 error로 처리하는 것이다. 데이터가 없는 것은 업무적으로 정상 상황일 수 있다. CH08에서는 `S`와 `I` 정도로 가볍게 알리는 감각만 익힌다.

세 번째 실수는 비즈니스 로직 깊은 곳에서 바로 화면 메시지를 띄우는 설계를 일반화하는 것이다. CH08 예제는 report 학습용이다. 메시지 설계와 분리는 뒤에서 더 다룬다.

### 정리

조회는 실패할 수 있고, 실패도 설계해야 한다. `sy-subrc`, `sy-dbcnt`, `MESSAGE`를 함께 보면 초급자는 "데이터가 없을 때 프로그램이 무엇을 판단하고 사용자에게 무엇을 말하는지" 설명할 수 있다.

## CH08 마무리

CH08을 마치면 학습자는 다음을 설명할 수 있어야 한다.

| 기준 | 할 수 있어야 하는 일 |
|---|---|
| Open SQL | ABAP에서 DB 데이터를 읽는 SQL 계층이라고 설명 |
| client handling | Open SQL이 현재 client를 기본 처리하므로 `MANDT` 직접 조건을 쓰지 않음을 설명 |
| SELECT 4요소 | table, field, condition, target으로 분해 |
| projection | `SELECT *`와 필요한 field list 차이 설명 |
| SELECT 형태 | `SINGLE`, `INTO TABLE`, `ENDSELECT`, `UP TO n ROWS` 구분 |
| INTO target | Work Area, 변수 묶음, corresponding, appending 차이 설명 |
| WHERE | 비교, 범위, 목록, pattern, null, logical condition 사용 |
| key/index | key 조건과 일반 field 조건의 차이 감각 확보 |
| 실패 처리 | `sy-subrc`, `sy-dbcnt`, `MESSAGE`로 빈 결과 처리 |

최종 실습은 다음 요구사항을 만족하는 작은 report다.

1. `ZGUGUDAN` 또는 `SFLIGHT` 중 하나를 고른다.
2. `SELECT *`가 아니라 필요한 field list를 한 번 이상 사용한다.
3. `WHERE` 조건을 최소 하나 이상 사용한다.
4. 여러 행 결과는 Internal Table에 담는다.
5. `sy-subrc = 0`과 `sy-subrc <> 0`을 나누어 처리한다.
6. 결과가 없으면 사용자에게 이유를 알린다.

다음 CH09에서는 조회할 때 사용자가 올바른 값을 고르도록 돕는 DDIC 관계와 F4 입력 도움말로 넘어간다.
