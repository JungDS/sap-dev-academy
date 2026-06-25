# CH08_REWRITE - Open SQL 기본 조회(classic) v2

> 목적: `content/abap/CH08`의 7개 레슨을 "입문자가 왜 필요한지부터 실습 확인까지 빠짐없이 따라갈 수 있는 완성 강의자료" 수준으로 재작성하기 위한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v2 기준안이다.

## CH08 전체 설계

CH08의 한 문장 목표는 "CH07에서 저장한 데이터를 이제 데이터베이스에서 읽어 오는 힘을 갖게 한다"이다. ABAP 초급자는 보통 `WRITE`로 화면에 찍거나 Internal Table 안에서만 데이터를 다루다가, 갑자기 데이터베이스 테이블을 만나면 세 가지를 동시에 헷갈린다.

- 데이터가 어디에 있는가: 프로그램 변수인가, [[Internal Table]]인가, 데이터베이스 테이블인가.
- 무엇을 읽어 오는가: 모든 컬럼인가, 필요한 컬럼인가, 한 행인가, 여러 행인가.
- 읽은 뒤 무엇으로 성공을 판단하는가: 화면 출력인가, [[sy-subrc]]인가, `sy-dbcnt`인가.

따라서 CH08은 SQL 문법 나열이 아니라 "조회 요청서 작성 훈련"으로 설계한다. `SELECT` 문장을 한 줄씩 외우게 하지 않고, 매번 다음 순서로 생각하게 만든다.

1. 어느 테이블에서 읽을 것인가.
2. 어떤 컬럼을 읽을 것인가.
3. 어떤 조건으로 줄일 것인가.
4. 결과를 어느 ABAP 대상에 담을 것인가.
5. 결과가 없을 때 무엇으로 확인하고 어떻게 말할 것인가.

### 범위와 금지선

이 장은 classic-first 장이다. CH18/CH19 이전이므로 modern SQL 문법을 가르치지 않는다. 특히 코드 예제에는 inline declaration, modern host-variable escape marker, string template, constructor expression을 넣지 않는다. 이 장은 조회 전용이다. 데이터 변경문, 트랜잭션, 감사 필드, 대량 변경은 CH24 이후로 넘긴다. 여러 테이블을 연결해 읽는 주제는 CH13로 넘긴다. 성능 최적화의 깊은 설명은 CH32로 넘기되, L06에서 "키 조건이 왜 중요한가"까지만 체감시킨다.

### 공식 문서 수동 확인 기준

v1의 자동 키워드 매칭은 관련 없는 공식 문서 힌트를 섞었다. v2에서는 아래 문서만 CH08 근거로 수동 채택한다.

- `C:\ABAP_DOCU_HTML\abapselect.htm`: `SELECT`의 전체 흐름, `ENDSELECT`, `sy-subrc`, `sy-dbcnt`.
- `C:\ABAP_DOCU_HTML\abapselect_single.htm`: `SELECT SINGLE`과 "정확히 한 행" 조회의 의미.
- `C:\ABAP_DOCU_HTML\abapselect_up_to_offset.htm`: `UP TO n ROWS`로 결과 수 제한.
- `C:\ABAP_DOCU_HTML\abapselect_into_target.htm`: `INTO`, `INTO TABLE`, `APPENDING TABLE` 대상.
- `C:\ABAP_DOCU_HTML\abapinto_clause.htm`: 조회 결과를 ABAP 변수, 구조, 테이블에 담는 규칙.
- `C:\ABAP_DOCU_HTML\abapwhere.htm`: `WHERE`가 결과 집합을 줄이는 방식과 client column 주의.
- `C:\ABAP_DOCU_HTML\abenabap_sql_stmt_logexp.htm`: `BETWEEN`, `LIKE`, `IN`, `IS NULL`, `AND`, `OR`, `NOT`.
- `C:\ABAP_DOCU_HTML\abenabap_sql_hostvar_obsolete.htm`: classic Open SQL에서 escape marker 없이 host variable을 쓰는 구문은 여전히 가능하지만 obsolete 문서에 속한다는 점.
- `C:\ABAP_DOCU_HTML\abapmessage.htm`: `MESSAGE`의 기본 동작과 프레젠테이션 레이어 권장.
- `C:\ABAP_DOCU_HTML\abapmessage_msg.htm`: 메시지 클래스와 번호 기반 메시지는 CH15에서 정식으로 다룰 근거.

### CH08 공통 체험 장치

CH08은 코드가 많은 장이므로 각 레슨에는 반드시 같은 페이지에서 결과를 만져 볼 수 있는 학습 장치를 붙인다.

- L02는 기존 `embeds/abap/CH08-L02-S01.html`을 사용한다. `SELECT *`, 컬럼 선택, 숫자 조건, 문자 조건을 버튼으로 바꾸며 DB table, Internal Table, `sy-subrc`, `sy-dbcnt`를 동시에 보여 준다.
- L03은 "SELECT 형태 비교 실험실"을 추가한다. 버튼은 `SINGLE`, `INTO TABLE`, `ENDSELECT`, `UP TO 3 ROWS` 네 개다. 같은 `SFLIGHT` 모의 데이터에서 대상 모양, 행 수, 반복 횟수를 비교한다.
- L04는 "INTO 대상 보드"를 추가한다. `Work Area`, 변수 묶음, `CORRESPONDING`, `APPENDING` 탭을 누르면 같은 결과 행이 어디에 어떻게 들어가는지 애니메이션으로 보여 준다.
- L05는 "WHERE 필터 실험실"을 추가한다. 연산자 칩을 눌러 `=`, `BETWEEN`, `LIKE`, `IN`, `IS NULL`, `AND`, `OR` 조건을 조합하고 결과 행 수를 즉시 갱신한다.
- L06은 "키 조건 렌즈"를 추가한다. 기본 키 조건은 좁은 통로로 바로 찾는 그림, 일반 필드 조건은 많은 행을 확인하는 그림으로 보여 준다. 실제 DB 비용 숫자는 단정하지 않는다.
- L07은 "빈 결과와 메시지 피드백"을 추가한다. 조회할 `dan` 값을 2 또는 5로 바꾸어 `sy-subrc`가 0과 4로 바뀌는 장면, 상태바 메시지와 정보 팝업 차이를 보여 준다.

---

## CH08-L01 - SAP 데모 테이블과 Client 종속

### 왜 필요한가

CH07까지의 실습은 대부분 우리가 만든 프로그램과 우리가 만든 테이블 중심이었다. 그래서 초급자는 "데이터베이스 조회"를 배우기 전에 먼저 이런 질문에 부딪힌다.

"내가 직접 만든 `ZGUGUDAN` 말고, SAP 시스템에 이미 있는 데이터는 어떻게 읽을까?"

SAP 시스템에는 항공사, 항공편, 예약처럼 SQL 학습에 쓰기 좋은 데모 테이블이 있다. 이 장에서는 `SCARR`, `SPFLI`, `SFLIGHT`를 사용한다. 세 테이블은 실제 회사 업무 테이블은 아니지만, 테이블 간 관계와 조회 조건을 설명하기에 충분히 현실적이다.

### 무엇인가

`SCARR`는 항공사 마스터에 가깝다. 항공사 코드와 항공사 이름처럼 "항공사 자체"를 설명하는 정보를 가진다. `SPFLI`는 항공편 연결 정보다. 항공사 코드, 연결 번호, 출발 도시, 도착 도시처럼 "어떤 노선인가"를 설명한다. `SFLIGHT`는 실제 비행 일자와 좌석, 가격 같은 "특정 날짜의 항공편" 정보를 담는다.

이 세 테이블은 모두 ABAP 프로그램에서 [[Open SQL]]로 조회할 수 있는 투명 테이블 학습 재료다. 다만 입문 단계에서 반드시 알아야 할 한 가지가 있다. SAP 테이블에는 흔히 client를 나타내는 [[MANDT]] 필드가 있다. 같은 시스템 안에서도 client가 다르면 데이터가 분리되어 보인다. ABAP SQL은 기본적으로 현재 로그인한 client의 데이터만 읽도록 처리한다.

초급자가 여기서 흔히 하는 실수는 `WHERE mandt = sy-mandt`를 직접 붙이려는 것이다. CH08에서는 그렇게 하지 않는다. 현재 client 처리는 Open SQL이 맡는다고 이해한다. 특별한 cross-client 조회는 일반 애플리케이션 개발의 기본 주제가 아니며, 초급 과정에서 다루지 않는다.

### 어떻게 확인하는가

SE11 또는 ADT의 Dictionary Object 조회에서 `SCARR`, `SPFLI`, `SFLIGHT` 구조를 확인한다. 확인할 때는 모든 필드를 외우지 말고 다음만 본다.

- 첫 번째 필드에 `MANDT`가 있는가.
- `CARRID`가 항공사 코드로 반복해서 등장하는가.
- `SPFLI`에는 노선 정보가 있고 `SFLIGHT`에는 날짜별 운항 정보가 있는가.

그다음 아주 작은 조회 프로그램으로 현재 client의 항공편 데이터가 읽히는지 확인한다.

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

이 코드에서 중요한 것은 `MANDT`를 직접 조건에 쓰지 않았다는 점이다. 그래도 현재 client 기준으로 데이터가 읽힌다. 데이터가 없으면 `sy-subrc`는 보통 4가 되고, 읽은 건수는 0으로 확인된다.

### 체험 설계

"Client 자동 필터 체험 카드"를 둔다. 왼쪽에는 전체 시스템 그림을 두고 client 100, 200, 300을 세 칸으로 나눈다. 사용자가 "현재 로그인 client = 100" 토글을 켜면 100번 칸만 밝아진다. `SELECT FROM sflight WHERE carrid = 'LH'` 버튼을 누르면 `MANDT` 조건을 직접 적지 않아도 100번 client 데이터만 결과 테이블로 이동한다.

상태 표시는 다음 세 가지를 동시에 보여 준다.

- 사용자가 작성한 WHERE 조건: `carrid = 'LH'`
- 시스템이 암묵적으로 적용한 범위: 현재 client
- 결과: Internal Table 행 수, `sy-subrc`, `sy-dbcnt`

### 실수와 주의

`SCARR`, `SPFLI`, `SFLIGHT`의 데이터는 시스템마다 다를 수 있다. 예제의 항공사 코드가 없는 시스템도 있다. 그래서 강의자료에는 "결과 행 수는 시스템 데이터에 따라 다를 수 있다"를 명시해야 한다.

`MANDT`는 필드 목록에서 보이지만 초급자가 직접 조건으로 다루는 대상이 아니다. 공식 문서에서도 `WHERE` 조건의 client column에는 implicit client handling이 적용된다고 설명한다. 이 장에서는 그 원리만 이해하고, 특별 조회 옵션은 가르치지 않는다.

### 정리

L01의 결론은 간단하다. CH08부터는 프로그램 안의 값만 보는 것이 아니라 SAP 데이터베이스 테이블을 읽는다. `SCARR`, `SPFLI`, `SFLIGHT`는 조회 연습용 표준 데모 데이터이고, client는 Open SQL이 현재 로그인 기준으로 기본 처리한다.

---

## CH08-L02 - SELECT 4요소, 전체 컬럼과 필요한 컬럼

### 왜 필요한가

초급자가 처음 쓰는 SQL은 대개 `SELECT *`이다. 이 문장은 빠르게 결과를 보여 주기 때문에 학습에는 좋지만, 실무에서는 늘 좋은 습관이 아니다. 화면이나 로직에 이름과 나이만 필요한데 주소, 생성일, 변경자, 긴 텍스트까지 모두 읽는다면 프로그램은 불필요한 데이터를 들고 다닌다.

L02의 목표는 `SELECT`를 "한 줄 주문서"로 보는 것이다. 주문서에는 네 가지가 들어간다.

1. 무엇을 읽을 것인가: 컬럼 목록.
2. 어디서 읽을 것인가: 데이터베이스 테이블.
3. 어떤 행만 읽을 것인가: `WHERE`.
4. 어디에 담을 것인가: [[Work Area]] 또는 [[Internal Table]].

### 무엇인가

`SELECT *`는 테이블의 모든 컬럼을 읽겠다는 뜻이다. 반대로 `SELECT carrid connid fldate`처럼 필드를 나열하면 필요한 컬럼만 읽는다. 이때 결과를 담는 대상의 필드 이름과 읽은 컬럼 이름을 맞추고 싶다면 `INTO CORRESPONDING FIELDS OF TABLE`을 사용할 수 있다.

테이블 이름과 필드 이름을 함께 써야 할 때는 `table~field` 형태가 나온다. CH08에서는 여러 테이블을 연결하지 않으므로 깊게 쓰지 않는다. 다만 "필드가 어느 테이블의 필드인지 명확하게 쓰는 표기" 정도로만 맛본다.

조회 후에는 `sy-subrc`와 `sy-dbcnt`를 반드시 확인한다. `sy-subrc`는 직전 Open SQL 문장의 결과가 있었는지 알려 준다. `sy-dbcnt`는 데이터베이스에서 ABAP 쪽으로 넘어온 행 수를 알려 준다.

### 어떻게 확인하는가

먼저 전체 컬럼을 읽는다.

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

이 예제는 "일단 다 가져오기"이다. `ZGUGUDAN`의 필드가 적기 때문에 학습에는 부담이 없다. 그러나 큰 업무 테이블에서 같은 습관을 반복하면 필요 없는 컬럼까지 읽게 된다.

다음은 필요한 컬럼만 읽는다.

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

필드가 세 개뿐이어도 학습자는 중요한 감각을 얻는다. "테이블 전체"와 "필요한 컬럼"은 다르다. 데이터베이스 조회는 단순히 가져오는 행동이 아니라, 필요한 데이터 모양을 정하는 행동이다.

### 체험 설계

기존 `embeds/abap/CH08-L02-S01.html`을 그대로 활용하되, 설명을 보강한다. 화면은 네 구역으로 나눈다.

- 왼쪽 위: DB Table `ZTPERSON` 원본 데이터.
- 오른쪽 위: 사용자가 고른 SELECT 문장.
- 왼쪽 아래: 조회 결과 Internal Table.
- 오른쪽 아래: `sy-subrc`, `sy-dbcnt`, 선택된 컬럼 수, 결과 행 수.

버튼은 "전체 조회", "컬럼만", "나이 조건", "도시 조건" 네 개로 유지한다. 버튼을 누를 때마다 다음 질문을 화면 상단에 띄운다.

- 전체 조회: "정말 모든 컬럼이 필요한가?"
- 컬럼만: "필요한 컬럼만 가져오면 결과 모양이 어떻게 달라지는가?"
- 나이 조건: "행을 줄이는 조건은 어디에 적는가?"
- 도시 조건: "문자 조건도 숫자 조건과 같은 구조로 읽을 수 있는가?"

### 실수와 주의

classic 구문에서는 필드 목록을 쉼표로 구분하지 않는다. 이 장의 예제는 `SELECT dan mul result`처럼 쓴다. 또한 host variable escape marker가 붙는 modern 형태는 CH18 이후에 다룬다. CH08의 목적은 classic Open SQL의 흐름을 정확히 익히는 것이다.

`SELECT *`를 금지어처럼 가르치면 안 된다. 학습 초반에는 전체 구조 확인에 유용하다. 다만 실무 코드에서는 필요한 컬럼을 명시하는 습관이 중요하다고 연결한다.

### 정리

L02의 핵심은 `SELECT`를 네 요소로 분해하는 것이다. "컬럼, 테이블, 조건, 대상"을 말로 설명할 수 있으면 이후 `SINGLE`, `INTO TABLE`, `WHERE`, `APPENDING`도 같은 틀 안에서 이해할 수 있다.

---

## CH08-L03 - SELECT 형태: SINGLE, INTO TABLE, ENDSELECT, UP TO n ROWS

### 왜 필요한가

조회에는 모양이 있다. 어떤 조회는 한 명의 고객처럼 정확히 한 행만 필요하고, 어떤 조회는 오늘의 주문 목록처럼 여러 행이 필요하다. 또 오래된 ABAP 코드에서는 한 행씩 반복해서 읽는 `SELECT ... ENDSELECT`를 만나기도 한다. 초급자는 이 네 가지 모양을 구분하지 못하면 `SELECT SINGLE`로 목록을 읽으려 하거나, 목록 조회인데 Work Area 하나에 덮어쓰는 실수를 한다.

L03의 목표는 "결과가 한 행인가, 여러 행인가"를 먼저 판단하게 만드는 것이다.

### 무엇인가

[[SELECT SINGLE]]은 조건에 맞는 한 행을 Work Area에 담는다. 공식 문서 기준으로도 정확히 한 행이 결정되는 조회에 적합하다. 대표적으로 기본 키 전체를 알고 있을 때다.

`INTO TABLE`은 여러 행을 한 번에 Internal Table로 가져온다. 이 방식은 [[Array Fetch]] 감각을 익히기에 좋다. 데이터베이스에서 결과 집합을 받아 ABAP Internal Table에 담고, 이후 ABAP 쪽에서 반복 처리한다.

`SELECT ... ENDSELECT`는 결과를 한 행씩 Work Area에 담으며 반복한다. 초급자는 문법을 읽을 줄은 알아야 하지만 새 코드의 기본 선택지로 두면 안 된다. 특히 반복문 안에서 다시 조회하는 구조는 성능과 이해도 모두 나빠진다.

`UP TO n ROWS`는 최대 n행만 읽겠다는 제한이다. "아무 한 행"을 읽고 싶다는 뜻으로 남용하지 않는다. 데이터 순서가 중요하면 정렬 기준을 별도로 배워야 하며, 정렬은 뒤의 장에서 다룬다.

### 어떻게 확인하는가

정확히 한 항공편을 읽는 예제다.

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
  WRITE: / '항공사:', ls_flight-carrid,
         / '연결번호:', ls_flight-connid,
         / '비행일자:', ls_flight-fldate.
ELSE.
  WRITE: / '조건에 맞는 항공편이 없습니다.'.
ENDIF.
```

여러 행을 목록으로 읽는 예제다.

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

오래된 코드에서 만날 수 있는 한 행씩 읽기 형태다.

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

학습자는 이 코드를 보고 "이런 문법이 있구나"까지 이해하면 된다. 새로 작성하는 목록 조회 기본형은 `INTO TABLE`로 잡는다.

최대 행 수를 제한하는 예제다.

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

### 체험 설계

"SELECT 형태 비교 실험실"은 같은 데이터셋을 네 버튼으로 조회한다.

- `SINGLE`: 결과 대상은 Work Area 한 칸이다. 성공하면 한 행이 들어가고, 없으면 빈 구조와 `sy-subrc = 4`를 보여 준다.
- `INTO TABLE`: 결과 대상은 여러 행 Internal Table이다. `sy-dbcnt`와 행 수가 같이 증가한다.
- `ENDSELECT`: Work Area가 한 행씩 덮어써지는 장면을 프레임 단위로 보여 준다. 오른쪽에는 loop count가 증가한다.
- `UP TO 3 ROWS`: 전체 조건 결과가 8행이어도 ABAP으로 넘어오는 것은 최대 3행임을 잘라서 보여 준다.

버튼 아래에는 "결과 모양 먼저 고르기" 퀴즈를 둔다. 문제는 "항공사 코드와 연결 번호와 날짜를 모두 알고 있다", "항공사 코드만 알고 목록이 필요하다", "상위 3건만 빠르게 확인하고 싶다"처럼 상황형으로 낸다.

### 실수와 주의

`SELECT SINGLE`은 "빠르니까 아무 때나 한 건만"이 아니다. 정확히 한 행이 결정되는 조건에서 의미가 가장 분명하다. 조건이 애매한데 `SINGLE`을 쓰면 어떤 행이 선택되었는지 학습자가 설명하지 못한다.

`ENDSELECT`는 닫는 문장을 빠뜨리면 문법 자체가 성립하지 않는다. 또한 `SELECT ... ENDSELECT` 안에서 또 조회하는 패턴은 초급 과정에서 금지한다. 지금은 "읽을 수는 있어야 하지만 기본 습관은 `INTO TABLE`"이라고 정리한다.

### 정리

L03의 판단 기준은 "한 행인가, 여러 행인가, 제한된 여러 행인가"이다. 이 기준이 서면 `SELECT SINGLE`, `INTO TABLE`, `ENDSELECT`, `UP TO n ROWS`의 차이가 문법 암기가 아니라 결과 모양 선택으로 이해된다.

---

## CH08-L04 - INTO 대상 형태

### 왜 필요한가

데이터베이스에서 읽은 값은 결국 ABAP 변수 어딘가에 들어간다. 초급자는 `SELECT`의 앞부분보다 `INTO` 뒤에서 더 많이 틀린다. 여러 컬럼을 읽어 놓고 Work Area 구조가 맞지 않거나, 기존 Internal Table에 이어 붙여야 하는데 덮어쓰거나, 필드 순서와 필드 이름의 차이를 혼동한다.

L04의 목표는 `INTO`를 "도착지 주소"로 이해시키는 것이다. 같은 조회라도 도착지가 Work Area인지, 변수 묶음인지, Internal Table인지, 기존 테이블 뒤에 붙이는지에 따라 결과 처리 방식이 달라진다.

### 무엇인가

`INTO wa`는 한 행을 구조에 담는다. 주로 `SELECT SINGLE` 또는 `SELECT ... ENDSELECT`와 함께 만난다.

`INTO (v1, v2, ...)`는 선택한 컬럼을 개별 변수에 순서대로 담는다. 필드 이름이 아니라 순서가 중요하므로 초급자가 실수하기 쉽다.

`INTO CORRESPONDING FIELDS OF`는 이름이 같은 컴포넌트에 값을 넣는다. 필드 순서가 다르거나 일부 필드만 읽을 때 유용하다. 대신 이름이 맞지 않는 필드는 채워지지 않는다.

`APPENDING TABLE`은 기존 Internal Table의 내용을 지우지 않고 뒤에 붙인다. 반대로 `INTO TABLE`은 조회 결과로 대상 테이블을 새로 채운다고 이해하면 된다.

### 어떻게 확인하는가

한 행을 구조에 담는다.

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

필요한 컬럼을 개별 변수에 담는다.

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

필드 이름을 맞추어 Internal Table에 담는다.

```abap
REPORT zch08_l04_corresponding.

TYPES: BEGIN OF ty_flight_brief,
         carrid TYPE sflight-carrid,
         connid TYPE sflight-connid,
         fldate TYPE sflight-fldate,
       END OF ty_flight_brief.

DATA lt_brief TYPE TABLE OF ty_flight_brief.

SELECT carrid connid fldate
  FROM sflight
  INTO CORRESPONDING FIELDS OF TABLE lt_brief
  WHERE carrid = 'LH'.

WRITE: / '읽은 행 수:', sy-dbcnt.
```

기존 결과 뒤에 이어 붙인다.

```abap
REPORT zch08_l04_appending.

DATA lt_flight TYPE TABLE OF sflight.

SELECT *
  FROM sflight
  APPENDING TABLE lt_flight
  WHERE carrid = 'LH'.

SELECT *
  FROM sflight
  APPENDING TABLE lt_flight
  WHERE carrid = 'AA'.

WRITE: / '두 항공사 결과를 합친 행 수:', sy-dbcnt.
```

마지막 예제의 `sy-dbcnt`는 직전 `SELECT`의 전달 행 수를 의미한다. 합쳐진 전체 Internal Table 행 수를 알고 싶으면 `DESCRIBE TABLE`로 별도 확인한다.

### 체험 설계

"INTO 대상 보드"는 같은 `SFLIGHT` 한 행을 네 가지 도착지로 보내는 화면이다.

- `Work Area` 탭: 한 구조 카드에 값이 들어간다. 기존 값은 새 값으로 덮인다.
- `변수 묶음` 탭: 컬럼 1, 2, 3이 변수 1, 2, 3으로 순서대로 이동한다. 순서를 바꾸면 값이 잘못 들어가는 경고를 띄운다.
- `CORRESPONDING` 탭: 필드 이름이 같은 칸만 초록색으로 연결된다. 이름이 없는 칸은 회색으로 남는다.
- `APPENDING` 탭: 기존 Internal Table 아래에 새 행들이 붙는다. `INTO TABLE`과 비교 버튼을 누르면 "교체"와 "추가" 차이를 보여 준다.

### 실수와 주의

`INTO (v1, v2, ...)`는 이름이 아니라 순서다. `SELECT connid carrid`로 읽고 `INTO (lv_carrid, lv_connid)`에 넣으면 학습자가 기대한 값과 반대로 들어갈 수 있다.

`CORRESPONDING`은 마법이 아니다. 이름이 같은 필드만 채운다. 이름이 다르면 값은 들어가지 않는다.

`APPENDING TABLE`을 쓰면 이전 결과가 남는다. 이것이 장점일 때도 있지만, 이전 결과를 지우고 새로 읽어야 하는 상황에서는 버그가 된다.

### 정리

L04의 핵심 문장은 "조회 결과는 반드시 도착지가 필요하다"이다. `INTO` 뒤를 읽을 수 있으면 초급자는 SQL 결과가 ABAP 메모리 안에서 어떤 모양으로 존재하는지 이해하기 시작한다.

---

## CH08-L05 - WHERE 상세: 연산자와 wildcard

### 왜 필요한가

실무 조회의 대부분은 "전체를 읽지 않는 기술"이다. 전체 고객, 전체 주문, 전체 전표를 모두 읽어 놓고 ABAP에서 걸러 내면 프로그램은 느리고 위험해진다. 조건은 가능하면 데이터베이스에 맡겨야 한다. L05는 초급자가 `WHERE`를 단순 암기가 아니라 "필요한 행만 통과시키는 문"으로 이해하게 만드는 레슨이다.

### 무엇인가

`WHERE`는 결과 집합에 포함될 행을 제한한다. 행마다 조건식을 평가해서 참인 행만 결과로 넘어온다. 조건식에는 비교 연산자, 범위, 패턴, 목록, NULL 확인, 논리 연결이 들어갈 수 있다.

기본 비교는 `=`, `<>`, `<`, `>`, `<=`, `>=`이다. ABAP 문서와 오래된 코드에서는 `EQ`, `NE`, `LT`, `GT`, `LE`, `GE` 같은 표현도 만난다. 입문자는 먼저 기호형을 읽고, 레거시 코드를 만날 때 문자형 연산자도 같은 의미라고 연결하면 된다.

`BETWEEN`은 양 끝값을 포함하는 범위 조건이다. `LIKE`는 문자열 패턴 조건이다. `%`는 여러 글자, `_`는 한 글자를 의미한다. `IN`은 여러 후보 중 하나인지 확인한다. `IS NULL`은 DB 값이 NULL인지 확인한다. ABAP 초기값과 DB NULL은 같은 말이 아니므로 여기서는 "DB에 값 자체가 없음을 나타내는 특별 상태"라고만 설명한다.

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

### 체험 설계

"WHERE 필터 실험실"은 테이블 행을 카드로 보여 주고, 조건을 칩으로 조립하게 한다.

- 비교 칩: `carrid = 'LH'`, `seatsmax > 100`.
- 범위 칩: `fldate BETWEEN 시작일 AND 종료일`.
- 패턴 칩: `cityfrom LIKE 'S%'`, `cityfrom LIKE '_EOUL'`.
- 목록 칩: `carrid IN ('LH', 'AA')`.
- NULL 칩: 특정 선택 필드가 `IS NULL`인 행만 통과.
- 연결 칩: `AND`, `OR`, `NOT`.

사용자가 칩을 조합하면 조건식 아래에 결과 행이 즉시 줄어든다. 각 행에는 "통과" 또는 "제외" 배지를 붙이고, 제외된 행에는 어떤 조건에서 탈락했는지 짧게 표시한다.

### 실수와 주의

`AND`와 `OR`를 섞을 때는 괄호가 없으면 사람이 기대한 순서와 다르게 읽힐 수 있다. 입문 단계에서는 조건을 짧게 유지하고, 복잡해지면 괄호를 명확히 쓰는 습관을 들인다.

`LIKE`의 `%`와 `_`는 ABAP 문자열 검색의 일반 와일드카드 감각과 다를 수 있다. `%`는 여러 글자, `_`는 정확히 한 글자라고 체험으로 확인시킨다.

SELECT-OPTIONS와 Range Table을 이용한 `IN`은 CH12에서 정식으로 다룬다. L05에서는 고정 후보 목록과 단순 조건만 익힌다.

### 정리

L05의 핵심은 "필요한 행만 데이터베이스에서 통과시킨다"이다. `WHERE`가 정확하면 ABAP으로 넘어오는 데이터가 줄고, 프로그램은 읽기 쉬워진다. 조건은 SQL의 부속품이 아니라 조회 품질의 중심이다.

---

## CH08-L06 - 키 필드, 일반 필드, Index 기초

### 왜 필요한가

초급자는 `WHERE carrid = 'LH'`와 `WHERE planetype = '747-400'`을 비슷한 조건으로 본다. 둘 다 조건이고 둘 다 결과를 줄인다. 그러나 데이터베이스 입장에서는 전혀 다를 수 있다. 어떤 필드는 테이블의 기본 키에 속해서 행을 찾는 길잡이가 되고, 어떤 필드는 일반 속성이라 많은 행을 확인해야 할 수 있다.

L06의 목표는 성능 튜닝을 가르치는 것이 아니다. 목표는 "조건을 어떻게 주느냐가 조회 비용에 영향을 준다"는 감각을 만드는 것이다.

### 무엇인가

키 필드는 행을 식별하거나 정렬된 접근 경로를 만들 때 중요한 필드다. 기본 키 전체를 정확히 조건으로 주면 특정 행을 찾기 쉽다. 일반 필드는 설명 속성일 수 있다. 일반 필드로도 조건을 줄 수 있지만, 데이터베이스가 효율적으로 찾을 수 있는 경로가 없으면 많은 행을 검사해야 할 수 있다.

Secondary Index는 기본 키가 아닌 필드 조합으로 별도의 찾기 경로를 만드는 개념이다. 그러나 S/4HANA 환경에서는 예전처럼 인덱스를 많이 만들어 해결하는 방식이 항상 좋은 답이 아니다. 쓰기 비용, 메모리, HANA의 컬럼 저장 구조, 표준 객체 영향까지 고려해야 한다. 그래서 CH08에서는 "인덱스는 빠르게 만드는 버튼"이 아니라 "조회 경로를 설계하는 객체"라고만 소개한다.

### 어떻게 확인하는가

기본 키에 가까운 조건을 주는 예제다.

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
  WRITE: / '해당 키의 항공편이 없습니다.'.
ENDIF.
```

일반 필드 조건을 주는 예제다.

```abap
REPORT zch08_l06_general_condition.

DATA lt_flight TYPE TABLE OF sflight.

SELECT *
  FROM sflight
  INTO TABLE lt_flight
  WHERE planetype = '747-400'.

WRITE: / '해당 기종 항공편 수:', sy-dbcnt.
```

두 예제 모두 문법적으로 맞다. 그러나 학습자가 얻어야 할 질문은 다르다. 첫 번째는 "내가 정확한 한 행을 찾고 있는가"이고, 두 번째는 "이 조건으로 많은 행을 훑게 되는 것은 아닌가"이다.

### 체험 설계

"키 조건 렌즈"는 같은 테이블을 두 가지 시야로 보여 준다.

- 키 조회 모드: `carrid`, `connid`, `fldate` 세 조건을 채우면 테이블 왼쪽에 좁은 길이 생기고 한 행으로 바로 연결된다.
- 일반 필드 모드: `planetype` 조건을 주면 여러 행이 순서대로 검사되는 애니메이션을 보여 준다.
- 보조 인덱스 개념 모드: 자주 쓰는 일반 필드 조합에 별도 길을 만들 수 있다는 그림만 보여 준다. 생성 절차나 남용 팁은 제공하지 않는다.

결과 패널은 실제 속도를 숫자로 단정하지 않는다. 대신 "키 조건 완성도", "예상 후보 행 수", "더 깊은 성능 분석은 CH32" 세 항목만 표시한다.

### 실수와 주의

키 필드를 일부만 조건에 넣었다고 항상 한 행이 되는 것은 아니다. `carrid = 'LH'`는 항공사 하나를 뜻하지만 항공편은 여러 개일 수 있다. `SELECT SINGLE`과 일부 키 조건을 섞으면 초급자가 "왜 이 한 행이 나왔는지" 설명하지 못할 수 있다.

Secondary Index는 함부로 만들 대상이 아니다. 표준 테이블, 운영 시스템, S/4HANA 환경에서는 더더욱 설계 검토가 필요하다. CH08에서는 생성 방법을 다루지 않고, 조건과 접근 경로의 관계만 체험한다.

### 정리

L06의 결론은 "WHERE 조건은 결과 행 수뿐 아니라 찾는 길도 바꾼다"이다. 초급자는 여기서 키 필드를 존중하는 습관을 얻고, 성능 깊이는 나중 장에서 다시 배운다.

---

## CH08-L07 - 조회 실패와 MESSAGE 기초

### 왜 필요한가

초급자는 조회가 성공하면 화면에 값이 나오기 때문에 안심한다. 문제는 실패했을 때다. 결과가 없는데 아무 말도 하지 않으면 사용자는 프로그램이 멈춘 것인지, 조건이 틀린 것인지, 데이터가 없는 것인지 알 수 없다. 실무 프로그램은 성공보다 실패 처리에서 품질이 드러난다.

L07의 목표는 `sy-subrc`로 "조회 결과 없음"을 판단하고, 사용자가 이해할 수 있는 피드백을 주는 것이다. 메시지 클래스와 메시지 타입 전체 체계는 CH15에서 정식으로 다루며, 여기서는 상태 메시지와 정보 메시지의 맛보기만 한다.

### 무엇인가

조회 문장 뒤 `sy-subrc = 0`이면 적어도 한 행이 ABAP 쪽으로 넘어왔다고 볼 수 있다. 결과가 없으면 보통 `sy-subrc = 4`가 된다. `sy-dbcnt`는 넘어온 행 수를 알려 준다.

`MESSAGE`는 사용자에게 메시지를 보여 주는 ABAP 문장이다. L07에서는 `TYPE 'S'`와 `TYPE 'I'`만 맛본다. `S`는 보통 상태바에 표시되는 성공/상태 메시지 감각이고, `I`는 사용자가 확인해야 하는 정보 팝업 감각이다. 오류 메시지, 경고 메시지, 메시지 클래스, 번호, 화면 입력 제어는 CH15에서 다룬다.

### 어떻게 확인하는가

CH07에서 만든 구구단 테이블에 2단만 저장되어 있다고 가정한다. 2단은 조회되고, 5단은 없을 수 있다.

```abap
REPORT zch08_l07_no_result.

DATA: lt_gugu TYPE TABLE OF zgugudan,
      lv_dan  TYPE zgugudan-dan.

lv_dan = 5.

SELECT *
  FROM zgugudan
  INTO TABLE lt_gugu
  WHERE dan = lv_dan.

IF sy-subrc = 0.
  WRITE: / lv_dan, '단을 찾았습니다.'.
  WRITE: / '읽은 행 수:', sy-dbcnt.
ELSE.
  WRITE: / lv_dan, '단 데이터가 없습니다.'.
  MESSAGE '조건에 맞는 구구단 데이터가 없습니다.' TYPE 'S'.
ENDIF.
```

정보 팝업으로 더 분명히 알려 주는 맛보기다.

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

여기서 핵심은 메시지 타입을 많이 외우는 것이 아니다. 조회 결과가 없을 때 조용히 지나가지 않고, 사용자가 이해할 수 있는 말을 남기는 습관이다.

### 체험 설계

"빈 결과와 메시지 피드백" 실습은 `dan` 선택 버튼 두 개로 구성한다.

- `dan = 2`: 결과 행이 테이블에 표시되고 `sy-subrc = 0`, `sy-dbcnt = 9`가 표시된다.
- `dan = 5`: 결과 테이블은 비어 있고 `sy-subrc = 4`, `sy-dbcnt = 0`이 표시된다.

아래에는 피드백 방식 선택 버튼을 둔다.

- `WRITE만 표시`: 목록 영역에 "데이터가 없습니다"를 출력한다.
- `MESSAGE S`: 화면 하단 상태바 모형에 메시지를 표시한다.
- `MESSAGE I`: 팝업 모형을 띄우고 확인 버튼을 보여 준다.

학습자는 같은 실패 상황도 피드백 방식에 따라 사용자 경험이 달라진다는 점을 체감한다.

### 실수와 주의

`sy-subrc` 확인을 생략하면 결과가 없을 때도 이후 로직이 계속 실행될 수 있다. 특히 Work Area에 이전 값이 남아 있던 상황과 섞이면 초급자가 디버깅하기 어렵다.

`MESSAGE`를 무조건 많이 쓰는 것도 좋은 설계가 아니다. 공식 문서에서도 메시지는 프레젠테이션 로직에서 쓰는 것이 적절하다고 안내한다. CH08의 예제는 보고서 학습용이며, 비즈니스 로직 깊은 곳에서 사용자 메시지를 직접 띄우는 설계는 나중에 분리해서 배운다.

### 정리

L07의 결론은 "조회는 실패할 수 있고, 실패도 설계해야 한다"이다. `sy-subrc`, `sy-dbcnt`, 사용자 메시지를 함께 보면 초급자는 데이터가 없을 때의 프로그램 흐름을 설명할 수 있다.

---

## CH08 마무리 학습 흐름

CH08을 마친 학습자는 다음 질문에 답할 수 있어야 한다.

- 내가 읽으려는 대상은 어떤 데이터베이스 테이블인가.
- 전체 컬럼이 필요한가, 필요한 컬럼만 읽을 것인가.
- 한 행인가, 여러 행인가.
- 결과는 Work Area, 변수 묶음, Internal Table 중 어디로 가는가.
- 조건은 데이터베이스에서 행을 줄이도록 충분히 명확한가.
- 키 조건과 일반 필드 조건의 차이를 설명할 수 있는가.
- 결과가 없을 때 `sy-subrc`, `sy-dbcnt`, 메시지로 어떻게 처리할 것인가.

다음 장으로 넘어가기 전, 최종 실습은 `ZGUGUDAN` 또는 `SFLIGHT` 중 하나를 골라 다음 요구사항을 만족하는 조회 프로그램을 작성하게 한다.

1. 전체 조회가 아니라 필요한 컬럼만 읽는다.
2. `WHERE` 조건을 최소 하나 이상 사용한다.
3. 결과는 Internal Table에 담는다.
4. `sy-subrc`가 0일 때와 0이 아닐 때를 나누어 처리한다.
5. 결과가 없으면 사용자에게 이유를 알리는 메시지를 보여 준다.

이 과제를 통과하면 학습자는 단순 문법 암기자가 아니라 "조회 요청을 설계하는 사람"으로 CH09 이후의 데이터 처리 학습을 시작할 수 있다.
