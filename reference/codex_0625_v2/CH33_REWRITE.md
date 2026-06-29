# CH33_REWRITE - AMDP / ADBC / Pushdown

> 기준 자료: `content/abap/CH33`, `reference/codex_0625/CH33_AMDP-ADBC-Pushdown.md`, `reference/codex_0625/00_QUALITY_REVIEW.md`
> 재집필 목표: 성능을 위해 DB 가까이 내려가는 수단을 배우되, "빠르니까 쓰자"가 아니라 `Open SQL/CDS 우선 -> AMDP 제한 사용 -> ADBC 최후 사용 -> 운영 리스크 문서화`의 판단 기준을 입문자도 따라가게 만든다.
> Classic-first 경계: CH33은 Track 2 후반이다. CH18 modern ABAP, CH19 modern ABAP SQL, CH20 OO, CH22 CDS, CH23 RAP/ABAP Cloud, CH32 성능 분석을 이미 배운 상태에서 AMDP/ADBC를 다룬다. CH33 이전에는 AMDP/ADBC 구현 문법을 앞당기지 않는다.

## CH33 전체 강의 지도

CH32까지 학습자는 `ST05`, `SAT`, `SQLM`, `GROUP BY`, package 처리, SELECT-in-LOOP 제거를 배웠다. 즉 "어디가 느린지 측정하고, ABAP 서버와 DB 사이 왕복을 줄이는 법"을 안다. CH33은 그 다음 단계다. 단순 집계나 join은 이미 배운 Open SQL/CDS로 먼저 해결하고, 그래도 DB 내부 절차 로직이 필요할 때 AMDP, DB 고유 SQL을 직접 써야 하는 극단적인 경우 ADBC를 검토한다.

| 레슨 | 주제 | 학습자가 얻어야 할 판단 | 대표 확인 지점 |
| --- | --- | --- | --- |
| CH33-L01 | DB Pushdown 판단 기준 | 데이터를 끌어올지, 계산을 DB에 내릴지 고른다 | 전송 row 수, ST05 records, Open SQL/CDS 가능 여부 |
| CH33-L02 | AMDP 기본 구조 | ABAP 메서드 형태로 SQLScript를 관리하는 구조를 읽는다 | `IF_AMDP_MARKER_HDB`, `BY DATABASE PROCEDURE`, `USING`, `READ-ONLY` |
| CH33-L03 | ADBC Native SQL | DB 고유 SQL을 직접 보내는 API와 책임을 구분한다 | `CL_SQL_STATEMENT`, `EXECUTE_QUERY`, placeholder, `CX_SQL_EXCEPTION` |
| CH33-L04 | Open SQL/CDS/AMDP/ADBC 비교 | 네 수단의 권장 순서를 상황별로 고른다 | 이식성, 재사용성, 복잡 절차, Cloud 제약 |
| CH33-L05 | 운영 리스크와 DB 종속성 | 빠른 코드의 대가를 운영 기준으로 관리한다 | client-safety, SQL injection, buffering, debugging, 테스트 한계 |

수동 확인한 공식 근거는 세 묶음이다. Classic/standard ABAP 문법과 API는 `C:\ABAP_DOCU_HTML`에서 `abapmethod_by_db_proc.htm`, `abapmethods_amdp_options.htm`, `abenadbc.htm`, `abencl_sql_statement.htm`, `abenadbc_query.htm`, `abencx_sql_exception.htm`, `abapexec.htm`, `abenabap_managed_db_objects_nsql.htm`, `abenabap_sql_client_handling.htm`, `abenamdp_vs_abap_sql_abexa.htm`를 직접 확인했다. ABAP Cloud와 Clean Core 경계는 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_CLOUD_GLOSRY.md`, `ABENRELEASED_API_GLOSRY.md`, `ABENAMDP_CLIENT_SAFETY.md`, `ABENSQL_INJ_AMDP_SCRTY.md`를 확인했다. 표준 Markdown 쪽에서는 `ABENABAP_MANAGED_DB_PROC_GLOSRY.md`, `ABENNATIVE_SQL_GLOSRY.md`, `ABENSQL_SCRIPT_GLOSRY.md`를 추가로 확인했다.

R15 기준으로 CH33에서 새로 정식 도입되는 개념은 Code-to-Data 판단, AMDP, ADBC, Native SQL 운영 책임이다. 단, SQLScript 자체를 깊게 가르치는 장은 아니다. SQLScript 문법은 AMDP 예제 안에서 필요한 최소 형태만 읽게 하고, SQLScript 고급 문법, HANA Calculation View, CDS table function 심화, database-specific optimizer hint 남발은 후속 실무 심화로 넘긴다.

## CH33-L01 - DB Pushdown 판단 기준

### 왜 필요한가

CH32에서 ST05 trace를 보면 같은 프로그램이라도 두 종류의 느림이 보인다. 하나는 DB가 정말 오래 계산하는 느림이고, 다른 하나는 ABAP 서버로 너무 많은 데이터를 끌어와서 ABAP loop가 처리하느라 생기는 느림이다. 두 번째 문제는 "DB가 느리다"가 아니라 "데이터가 있는 곳에서 할 일을 굳이 끌어와서 했다"는 설계 문제다.

예를 들어 공연 예매 100만 건에서 공연별 좌석 합계를 구한다고 하자. ABAP 서버로 100만 행을 모두 가져온 뒤 `LOOP AT lt_booking`으로 합산하면 네트워크 전송량, ABAP 서버 memory, loop 시간이 모두 커진다. 반대로 DB에서 `GROUP BY concert_id`와 `SUM( seats )`를 수행하고 결과 20행만 받으면 이동량이 급격히 줄어든다. 이것이 Code-to-Data의 핵심이다.

하지만 여기서 곧바로 AMDP로 가면 안 된다. CH33의 첫 판단은 "계산을 DB로 내릴까?"가 아니라 "어느 수준으로 내릴까?"다. Open SQL로 충분한가, CDS로 재사용 모델을 만들 수 있는가, 그래도 SQLScript 절차 로직이 필요한가, DB 고유 기능 때문에 ADBC가 불가피한가를 순서대로 본다.

### 무엇인가

Code-to-Data는 데이터를 애플리케이션 쪽으로 가져와 처리하는 방식(Data-to-Code)의 반대다. 계산을 데이터가 있는 DB 쪽으로 보내고, ABAP 서버는 줄어든 결과만 받는다. HANA 환경에서 자주 말하는 Pushdown은 이 방향을 뜻한다.

초보자가 가장 먼저 잡아야 할 기준은 다음 순서다.

| 순서 | 수단 | 언제 먼저 생각하는가 | 장점 | 대가 |
| --- | --- | --- | --- | --- |
| 1 | Modern Open SQL | 집계, join, filter, SQL expression으로 충분할 때 | 가장 단순하고 이식성이 좋다 | 절차 로직은 제한적이다 |
| 2 | CDS View | 여러 프로그램, OData, RAP, 분석 모델에서 재사용할 때 | 의미와 관계를 모델로 남긴다 | 설계와 활성화 구조가 필요하다 |
| 3 | AMDP | DB 안에서 임시 결과, 복잡한 절차, SQLScript가 꼭 필요할 때 | DB 내부 계산을 ABAP 객체로 관리한다 | HANA/SQLScript 종속과 테스트 부담이 생긴다 |
| 4 | ADBC / Native SQL | Open SQL/AMDP/CDS로 불가능한 DB 고유 기능이 필요할 때 | DB가 제공하는 기능을 직접 쓸 수 있다 | client, injection, 이식성, 검증을 직접 책임진다 |

중요한 점은 AMDP가 "Open SQL보다 무조건 빠른 상위 기술"이 아니라는 것이다. 로컬 ABAP 문서의 AMDP와 ABAP SQL 비교 예제도, ABAP SQL로 표현 가능한 SQL만 AMDP에 옮겼을 때 AMDP 자체가 자동 성능 이점을 주는 것은 아니라고 설명한다. AMDP의 자리는 "SQLScript 절차 로직이 DB 내부에서 꼭 필요할 때"다.

### 어떻게 확인하는가

첫 번째 확인은 데이터 이동량이다. ST05나 SQL trace에서 반환 records가 지나치게 많은지 본다. 실제 업무에 필요한 결과는 공연별 20행인데 DB에서 100만 행을 읽어 ABAP 서버로 가져온다면 Pushdown 후보가 된다.

두 번째 확인은 계산 형태다. 단순 filter, join, group, aggregate, SQL expression이면 CH19에서 배운 Modern Open SQL로 먼저 시도한다. 여러 화면, OData, RAP, 리포트가 같은 계산을 공유한다면 CH22에서 배운 CDS View가 더 좋을 수 있다.

세 번째 확인은 절차 로직 여부다. DB 내부에서 여러 단계의 임시 결과를 만들고, 중간 결과를 다시 join하거나, SQLScript function/procedure를 써야 하는 상황이면 AMDP 후보가 된다. 하지만 단순 `SELECT ... GROUP BY`를 AMDP로 감싸는 것은 보통 과하다.

네 번째 확인은 DB 고유 기능 여부다. 특정 HANA 함수나 DB vendor 기능을 직접 호출해야 하고 ABAP SQL/CDS/AMDP로 감싸기 어렵다면 ADBC를 검토할 수 있다. 이때는 "가능하다"와 "운영해도 된다"를 분리해야 한다. ADBC는 문법검사와 client 처리, 보안 책임을 개발자가 더 많이 진다.

### 실수와 주의

가장 흔한 실수는 성능 문제가 보이면 AMDP부터 만드는 것이다. AMDP는 강력하지만 DB 종속성을 만든다. 단순 합계, 평균, 건수, 조건 필터는 Open SQL에서 끝내는 것이 더 읽기 쉽고 이식성도 좋다.

두 번째 실수는 Pushdown을 "ABAP 코드를 DB로 다 옮기는 것"으로 이해하는 것이다. 검증, 권한, 상태 변경, 메시지 처리, 재처리 로그처럼 업무 흐름과 운영 통제가 중요한 부분은 ABAP 계층에 남겨야 할 수 있다. DB는 집계와 필터를 잘하지만 모든 업무 책임을 대신하지 않는다.

세 번째 실수는 측정 없이 판단하는 것이다. Pushdown 전후에는 입력 건수, DB에서 읽은 records, ABAP 서버로 넘어온 결과 건수, runtime, memory 변화를 기록해야 한다. "AMDP라 빠를 것이다"는 판단 근거가 아니다.

네 번째 실수는 Cloud/Clean Core 경계를 잊는 것이다. ABAP Cloud에서는 restricted language version과 released API 기준이 중요하다. AMDP 자체가 금지라는 단순 문장이 아니라, client-safe object와 released API, RAP/CDS 우선 설계를 함께 봐야 한다. Native SQL은 특히 제약과 보안 책임이 커진다.

### 체험형 학습 설계

기존 체험물 `CH33-L01-S01`은 Data-to-Code와 Code-to-Data를 토글하는 시뮬레이터다. 화면에는 `끌어오기 (Data-to-Code)` 버튼과 `내려보내기 (Code-to-Data)` 버튼이 있고, DB(HANA) 노드에는 `zbooking 100만 행`, ABAP 서버 노드에는 `집계 결과 사용`이 표시된다.

학습자는 먼저 `끌어오기`를 선택한다. 이 상태에서는 DB에서 ABAP으로 많은 원본 행이 이동하고, ABAP 서버가 합산을 맡는다. 피드백 영역은 전송량이 큰 이유를 보여 주어야 한다. 다음으로 `내려보내기`를 선택하면 DB 노드 안에서 집계가 끝나고 결과 행만 이동한다. 이때 학습자는 "빠른 이유가 AMDP라는 이름 때문이 아니라 데이터 이동량이 줄었기 때문"임을 보게 된다.

이 위젯 뒤에는 짧은 판별 과제를 둔다. `공연별 좌석 합계`, `단건 상세 조회`, `여러 화면에서 공유하는 예매 요약`, `DB 고유 함수가 필요한 계산` 네 상황을 보여 주고, 학습자가 Open SQL, CDS, AMDP, ADBC 중 하나를 고르게 한다. 정답 피드백은 수단명만 말하지 않고, "왜 한 단계 더 낮게 내려가지 않아도 되는가"까지 설명해야 한다.

### 정리

DB Pushdown의 목표는 "멋진 기술을 쓰는 것"이 아니라 "불필요한 데이터 이동을 줄이는 것"이다. 먼저 Open SQL로 가능한지 보고, 재사용 모델이면 CDS를 검토한다. AMDP는 SQLScript 절차 로직이 DB 안에서 꼭 필요할 때, ADBC는 DB 고유 SQL을 직접 써야 하는 최후의 경우다. 다음 레슨에서는 AMDP가 ABAP 클래스 안에서 어떤 구조로 선언되고 실행되는지 본다.

## CH33-L02 - AMDP 기본 구조

### 왜 필요한가

Open SQL과 CDS로 대부분의 pushdown을 처리할 수 있지만, 실무에는 더 복잡한 경우가 있다. DB 내부에서 여러 중간 결과를 만들고, 그 결과를 다시 합치고, HANA SQLScript가 제공하는 절차 로직을 써야 할 때가 있다. 이때 모든 처리를 ABAP 서버로 끌어오면 CH32에서 본 대량 처리 문제가 다시 생긴다.

AMDP는 이런 경우에 "DB procedure를 ABAP 개발 객체처럼 관리"하게 해 준다. ABAP 개발자는 클래스를 만들고 메서드를 호출하지만, 해당 메서드의 구현부는 HANA SQLScript로 DB에서 실행된다. 그래서 AMDP를 처음 배울 때는 SQLScript 문법을 많이 외우기보다, ABAP 클래스 선언부와 DB 실행 구현부가 어디서 갈라지는지 읽는 능력이 먼저다.

### 무엇인가

AMDP(ABAP Managed Database Procedure)는 AS ABAP이 database procedure나 function을 관리하고 호출하게 해 주는 class-based framework다. 로컬 ABAP 문서 기준으로 AMDP 메서드는 global class 안에서 적절한 marker interface를 가진 AMDP class에 구현되며, 구현부에서 `METHOD ... BY DATABASE PROCEDURE FOR db LANGUAGE db_lang ... USING entities` 형태를 사용한다.

기본 구조는 네 부분으로 나뉜다.

| 부분 | 예 | 의미 |
| --- | --- | --- |
| Marker interface | `INTERFACES if_amdp_marker_hdb` | 이 global class가 HANA AMDP class임을 표시한다 |
| 메서드 선언 | `CLASS-METHODS get_stats ... AMDP OPTIONS READ-ONLY` | ABAP 쪽 호출 interface와 AMDP 속성을 선언한다 |
| DB procedure 구현 | `METHOD get_stats BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT` | 이 구현부가 HANA SQLScript로 DB에서 실행됨을 뜻한다 |
| 사용 객체 목록 | `USING zbooking` | SQLScript에서 접근하는 ABAP-managed DB object를 정적으로 알린다 |

다음 예제는 공연별 예매 집계를 AMDP로 만든 최소 구조다. 이 코드는 "AMDP를 꼭 써야 하는 복잡 예제"가 아니라 구조를 읽기 위한 교육용 예제다.

```abap
CLASS zcl_booking_amdp DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_amdp_marker_hdb.

    TYPES:
      BEGIN OF ty_stat,
        concert_id    TYPE zconcert-concert_id,
        booking_count TYPE i,
        total_seats   TYPE i,
      END OF ty_stat,
      tt_stat TYPE STANDARD TABLE OF ty_stat WITH EMPTY KEY.

    CLASS-METHODS get_stats
      IMPORTING
        VALUE(iv_client)  TYPE mandt
        VALUE(iv_concert) TYPE zconcert-concert_id
      EXPORTING
        VALUE(et_stats)   TYPE tt_stat
      AMDP OPTIONS READ-ONLY.
ENDCLASS.

CLASS zcl_booking_amdp IMPLEMENTATION.
  METHOD get_stats BY DATABASE PROCEDURE FOR HDB
                   LANGUAGE SQLSCRIPT
                   OPTIONS READ-ONLY
                   USING zbooking.

    et_stats =
      SELECT concert_id,
             COUNT(*) AS booking_count,
             SUM( seats ) AS total_seats
        FROM zbooking
        WHERE mandt = :iv_client
          AND concert_id = :iv_concert
        GROUP BY concert_id;

  ENDMETHOD.
ENDCLASS.
```

초보자가 헷갈리는 지점은 `@`와 `:`다. ABAP SQL에서 host variable은 `@iv_concert`로 배웠지만, AMDP SQLScript 안에서는 ABAP 입력 파라미터를 `:iv_concert`처럼 콜론으로 참조한다. 또 AMDP 구현부 안에는 ABAP statement를 섞어 쓸 수 없다. `IF`, `LOOP`, `DATA`처럼 ABAP에서 익숙한 문장을 그대로 넣는 것이 아니라 SQLScript 문법을 써야 한다.

`READ-ONLY`는 성능 마법 주문이 아니다. 로컬 ABAP 문서 기준의 핵심 효과는 해당 database procedure/function 구현에서 database table 읽기만 허용되고, 다른 AMDP를 호출할 때도 `READ-ONLY`로 표시된 대상만 호출할 수 있다는 점이다. 순수 조회 메서드라면 `AMDP OPTIONS READ-ONLY` 또는 구현부 `OPTIONS READ-ONLY`로 의도를 드러내고 쓰기 혼입을 막는다.

### 어떻게 확인하는가

첫 번째 확인은 class가 global class인지와 marker interface다. AMDP method는 local class가 아니라 global class/인터페이스 맥락에서 다룬다. HANA용 AMDP class는 `IF_AMDP_MARKER_HDB` 계열 tag interface가 필요하다.

두 번째 확인은 선언부와 구현부의 일치다. 선언부에서 `IMPORTING`, `EXPORTING`, `RETURNING`, table type이 정해지고, 구현부 SQLScript는 이 파라미터에 값을 채워야 한다. 출력 table의 컬럼 순서와 type이 맞지 않으면 activation이나 runtime에서 문제가 생긴다.

세 번째 확인은 `USING` 목록이다. SQLScript에서 접근하는 ABAP-managed database table, CDS entity, AMDP method가 있으면 `USING`에 올려야 한다. 이 목록은 where-used list, package check, activation check, framework 관리의 근거가 된다.

네 번째 확인은 client 처리다. AMDP와 Native SQL은 ABAP SQL처럼 implicit client handling을 자동으로 제공하지 않는다. 위 예제처럼 client-dependent table을 직접 읽는다면 `iv_client`를 받고 `WHERE mandt = :iv_client`처럼 현재 client만 읽도록 설계해야 한다. ABAP Cloud에서는 더 엄격하게 client-safe object와 AMDP option을 확인해야 한다.

다섯 번째 확인은 실행 전후 측정이다. AMDP를 만들었으면 ST05, SAT, SQLM, PlanViz 같은 도구로 실제로 데이터 이동량과 runtime이 줄었는지 본다. 단순 SQL을 AMDP로 옮겼는데 결과와 성능이 비슷하다면 복잡도만 늘린 것이다.

### 실수와 주의

가장 흔한 실수는 `USING` 누락이다. SQLScript 본문에서 `zbooking`을 읽는데 `USING zbooking`이 없으면 AMDP framework가 의존성을 제대로 알 수 없다. 사용한 table/view/procedure를 보이면 반드시 `USING`을 점검한다.

두 번째 실수는 `OPTIONS READ-ONLY`를 "빨라지는 옵션"으로만 외우는 것이다. 공식 확인 기준에서 먼저 기억할 내용은 읽기만 허용한다는 제약이다. 쓰기 로직이 섞이면 맞지 않는 옵션이고, 읽기 전용 AMDP에서 읽기 전용이 아닌 AMDP를 호출할 수 없다는 호출 제약도 생긴다.

세 번째 실수는 client를 빠뜨리는 것이다. Open SQL에서는 현재 client 조건이 자동으로 들어가는 경우가 많지만, AMDP SQLScript에서는 그렇지 않다. client-dependent table을 읽는다면 `MANDT`나 client-safe CDS object를 어떻게 처리하는지 설명 없이 넘어가면 운영 데이터가 섞일 수 있다.

네 번째 실수는 ABAP 디버거 경험을 그대로 기대하는 것이다. AMDP 구현은 DB 쪽 SQLScript로 실행된다. 공식 문서에는 AMDP 구현을 ADT에서 debug할 수 있다고 되어 있지만, classic ABAP debugger에서 ABAP statement처럼 한 줄씩 보는 경험과는 다르다. 개발 환경, 권한, DB trace, SQLScript debugging 가능 여부를 확인해야 한다.

다섯 번째 실수는 보안 책임을 ABAP이 전부 대신해 준다고 생각하는 것이다. ABAP이 AMDP 객체를 관리하더라도 SQLScript 내부 내용과 dynamic SQL 보안은 개발자의 책임으로 남는다. 동적 조건이나 외부 입력을 SQLScript에 섞을 때는 CH33-L05의 SQL injection 경계를 반드시 지켜야 한다.

### 체험형 학습 설계

기존 체험물 `CH33-L02-S01`은 AMDP code anatomy 위젯이다. 학습자는 밑줄 친 코드 조각을 클릭하고, annotation 영역에서 역할을 확인한다. 클릭 대상은 `INTERFACES if_amdp_marker_hdb`, `BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT`, `USING zbooking`, `OPTIONS READ-ONLY`, `SUM(...) GROUP BY`, `:iv_concert`이다.

강의 본문에서는 위젯을 단순 설명 뒤에 붙이는 것이 아니라 "오른쪽 해부 순서"를 과제로 준다. 1단계로 marker interface를 클릭해 class의 정체를 확인한다. 2단계로 `BY DATABASE PROCEDURE`를 클릭해 ABAP method 호출과 DB procedure 실행의 차이를 읽는다. 3단계로 `USING`을 클릭해 의존성 선언을 확인한다. 4단계로 `READ-ONLY`를 클릭해 읽기 전용 제약을 확인한다. 5단계로 `:iv_concert`를 클릭해 SQLScript에서 ABAP 입력값을 참조하는 표기법을 확인한다.

위젯의 피드백은 상태 기반으로 설계한다. 아무것도 클릭하지 않은 idle 상태에서는 "밑줄 친 구문을 클릭하면 설명이 나옵니다"라고 둔다. 올바른 순서로 클릭할수록 annotation에는 역할과 실수 경고가 함께 나온다. 예를 들어 `USING`을 클릭했을 때는 "빠뜨리면 컴파일 오류"뿐 아니라 "where-used와 package check의 근거"를 추가 피드백으로 보여 주는 것이 좋다.

코드 평가 과제는 한 줄 암기가 아니라 오류 찾기로 만든다. `USING zbooking`이 빠진 코드, `@iv_concert`를 SQLScript에 쓴 코드, client 조건이 없는 코드, 읽기 전용 메서드에 `UPDATE`를 넣은 코드를 카드로 보여 주고 "activation 오류, runtime 위험, 보안 위험, 운영 데이터 혼입" 중 무엇인지 고르게 한다.

### 정리

AMDP는 ABAP class method 형태로 관리되는 database procedure/function 구현이다. HANA AMDP class에는 `IF_AMDP_MARKER_HDB`가 필요하고, 구현부에는 `BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT`, 필요 시 `OPTIONS READ-ONLY`, 접근 객체 `USING`이 들어간다. SQLScript 안에서는 ABAP 문법과 ABAP SQL의 `@` 표기를 그대로 쓰지 않는다. 다음 레슨에서는 DB 고유 SQL을 ABAP에서 직접 보내는 ADBC를 다룬다.

## CH33-L03 - ADBC Native SQL

### 왜 필요한가

AMDP는 DB procedure를 ABAP 개발 객체로 관리하게 해 주지만, 때로는 DB에 Native SQL을 직접 보내야 하는 경우가 있다. 예를 들어 DB vendor가 제공하는 특수 DDL, 세션 변수 조회, 일반 ABAP SQL로 표현되지 않는 DB 고유 기능, 기존 Native SQL 기반 운영 도구와의 연결이 그렇다.

ADBC(ABAP Database Connectivity)는 이런 Native SQL을 ABAP Objects 기반 API로 실행하게 해 주는 수단이다. 하지만 ADBC를 배우는 목적은 "Open SQL보다 멋진 직접 SQL"을 쓰는 것이 아니다. 오히려 반대다. ADBC를 쓰면 ABAP SQL이 대신해 주던 client handling, 문법 검사, CDS access control, table buffering, 이식성 보호가 약해지므로 언제 피해야 하는지를 먼저 배워야 한다.

### 무엇인가

ADBC는 AS ABAP의 Native SQL interface에 접근하는 class-based API다. 로컬 ABAP 문서 기준으로 ADBC class는 `CL_SQL_` 또는 `CX_SQL_` prefix를 가지며, 대표 class는 `CL_SQL_STATEMENT`, `CL_SQL_PREPARED_STATEMENT`, `CL_SQL_CONNECTION`, `CX_SQL_EXCEPTION`이다.

`CL_SQL_STATEMENT`는 동적으로 만들어진 SQL statement를 받아 실행한다. query는 `EXECUTE_QUERY`로 실행하고, 결과는 `CL_SQL_RESULT_SET` reference로 받는다. 여러 row를 internal table로 읽을 때는 result set에 `SET_PARAM_TABLE`로 table reference를 붙이고 `NEXT_PACKAGE`로 가져온다.

다음 예제는 교육용 ADBC query 흐름이다.

```abap
TYPES:
  BEGIN OF ty_count,
    carrid       TYPE sflight-carrid,
    flight_count TYPE i,
  END OF ty_count,
  tt_count TYPE STANDARD TABLE OF ty_count WITH EMPTY KEY.

DATA lt_result TYPE tt_count.
DATA lv_client TYPE mandt VALUE sy-mandt.

TRY.
    DATA(lo_stmt) = NEW cl_sql_statement( ).

    lo_stmt->set_param( REF #( lv_client ) ).

    DATA(lo_result) = lo_stmt->execute_query(
      `SELECT carrid, COUNT(*) AS flight_count ` &&
      `FROM sflight ` &&
      `WHERE mandt = ? ` &&
      `GROUP BY carrid` ).

    lo_result->set_param_table( REF #( lt_result ) ).
    lo_result->next_package( ).
    lo_result->close( ).

  CATCH cx_sql_exception INTO DATA(lx_sql).
    " lx_sql->sql_code / lx_sql->sql_message로 DB 오류를 기록한다.
ENDTRY.
```

이 코드에서 가장 중요한 줄은 `WHERE mandt = ?`와 `set_param( REF #( lv_client ) )`다. ADBC는 ABAP SQL과 달리 implicit client handling을 하지 않는다. 또한 외부 입력값을 문자열에 직접 이어 붙이면 SQL injection 위험이 생긴다. operand 위치의 값은 `?` placeholder와 parameter binding으로 넘기는 습관을 들여야 한다.

### 어떻게 확인하는가

첫 번째 확인은 정말 ADBC가 필요한지다. Open SQL로 가능한 `SELECT`, `GROUP BY`, `JOIN`, `CASE`, `CAST`, `COALESCE`라면 ADBC를 쓰지 않는다. CDS로 재사용 가능한 모델이라면 CDS를 먼저 고려한다. ADBC는 DB 고유 SQL이 필요한 경우에만 후보가 된다.

두 번째 확인은 client 조건이다. client-dependent table을 읽는다면 `MANDT` 또는 해당 DB/세션 변수 처리 방식을 명시해야 한다. `WHERE mandt = ?`가 있고 현재 client 값이 binding되는지 확인한다.

세 번째 확인은 placeholder와 binding이다. 외부 입력이 SQL statement의 operand 위치에 들어간다면 `?` placeholder를 쓰고 `set_param` 또는 관련 binding method를 사용한다. table 결과를 받을 때는 `set_param_table`과 `next_package` 흐름을 확인한다.

네 번째 확인은 result set close다. `CL_SQL_RESULT_SET`을 열어 결과를 읽은 뒤 `close( )`를 호출하는 습관이 필요하다. package 단위로 읽는 경우에는 한 번에 전체를 읽을지, `UPTO`로 제한할지, 기존 internal table에 append되는 동작을 이해해야 한다.

다섯 번째 확인은 예외 처리와 로그다. ADBC 오류는 `CX_SQL_EXCEPTION`으로 올라오며, `SQL_CODE`, `SQL_MESSAGE`, `DB_ERROR`, `DUPLICATE_KEY`, `DBOBJECT_NOT_EXISTS` 같은 속성이 원인 분석에 쓰인다. 운영 코드는 `CATCH cx_sql_exception`에서 메시지와 SQL 식별자를 로그로 남겨야 한다.

### 실수와 주의

가장 위험한 실수는 문자열 연결로 SQL을 만드는 것이다. `... WHERE carrid = '`와 사용자 입력을 이어 붙이면 SQL injection이 가능해진다. ADBC 문서도 statement의 operand position이 아닌 부분을 외부에서 받지 말고, 값은 `?` placeholder와 binding으로 처리하라고 경고한다.

두 번째 실수는 client 조건 누락이다. ABAP SQL에서는 현재 client가 자동으로 들어간다고 배웠기 때문에, ADBC에서도 그럴 것이라고 착각하기 쉽다. Native SQL과 ADBC는 client를 자동 처리하지 않는다. 운영에서는 client 100에서 실행했는데 client 000 데이터까지 읽는 사고가 치명적이다.

세 번째 실수는 CDS 역할과 buffering을 기대하는 것이다. Native SQL은 table buffering을 지원하지 않고, CDS access control과 association 같은 CDS 의미를 그대로 처리하지 않는다. DB object를 직접 건드리는 것이므로 ABAP 계층의 보호장치가 줄어든다.

네 번째 실수는 `EXEC SQL`을 새 코드의 기본 방식으로 배우는 것이다. 로컬 ABAP 문서에서 static `EXEC SQL ... ENDEXEC`는 여전히 지원되지만 새 기능과 개선은 ADBC 중심이며, 새 프로그램에서는 ADBC 사용이 권장된다. CH33에서는 `EXEC SQL`을 "옛 Native SQL embedded 방식"으로만 비교하고, 새 구현 예제는 ADBC로 둔다.

다섯 번째 실수는 transaction control을 `CL_SQL_STATEMENT` SQL 문자열로 보내는 것이다. `CL_SQL_STATEMENT` 문서에는 `COMMIT`, `ROLLBACK` 같은 transaction control statement를 이 class method로 실행하지 말라고 되어 있다. transaction control은 `CL_SQL_CONNECTION`의 관련 method와 SAP LUW/DB LUW 경계를 확인해야 한다.

### 체험형 학습 설계

기존 체험물 `CH33-L03-S01`은 Mermaid 기반 흐름도다. `ABAP 프로그램 -> CL_SQL_STATEMENT execute_query( ) -> Native SQL -> Result Set set_param_table -> 내부 테이블`의 경로를 보여 주고, Native SQL 노드에는 `client 자동종속 X`와 `injection 주의` 경고가 붙는다.

이 위젯은 클릭형은 아니지만, 본문에서는 "경로 읽기 과제"로 사용할 수 있다. 학습자는 먼저 ABAP 프로그램에서 시작해 `CL_SQL_STATEMENT`가 SQL을 DB로 보내는 위치를 찾는다. 다음으로 `Native SQL` 노드에서 빨간 경고를 읽고, Open SQL과 달라지는 책임을 말한다. 마지막으로 `Result Set`에서 internal table로 값을 옮기는 지점을 보고, `set_param_table`과 `next_package`가 왜 필요한지 연결한다.

확장 설계는 3단 카드가 좋다. 첫 카드는 "문자열 연결 SQL"을 보여 주고 injection 위험으로 판정한다. 둘째 카드는 `?` placeholder와 `set_param`을 보여 주고 적절로 판정한다. 셋째 카드는 `WHERE mandt = ?`가 없는 query를 보여 주고 client 누락으로 판정한다. 각 카드의 피드백은 `보안`, `client`, `이식성`, `예외 처리` 네 라벨 중 하나로 분류한다.

코드와 위젯의 1:1 연결은 다음과 같다. `CL_SQL_STATEMENT` 줄은 흐름도의 두 번째 노드, SQL 문자열은 Native SQL 노드, `set_param_table`은 Result Set 노드, `lt_result`는 내부 테이블 노드에 대응한다. 학습자가 코드를 읽을 때 어느 줄이 어느 노드를 움직이는지 표시하면 ADBC가 "그냥 SQL 문자열 실행"이 아니라 result set binding까지 포함하는 흐름임을 이해한다.

### 정리

ADBC는 Native SQL interface에 접근하는 객체지향 API다. `CL_SQL_STATEMENT`로 query를 실행하고, `CL_SQL_RESULT_SET`으로 결과를 읽으며, `CX_SQL_EXCEPTION`으로 DB 오류를 처리한다. 하지만 implicit client handling, 강한 ABAP SQL 문법 검사, CDS access control, table buffering 같은 보호장치가 약하다. 그래서 ADBC는 Open SQL/CDS/AMDP로 해결되지 않는 DB 고유 기능이 필요할 때만 쓴다.

## CH33-L04 - AMDP와 CDS / Open SQL 비교

### 왜 필요한가

CH33-L01에서 수단의 큰 순서를 봤고, L02와 L03에서 AMDP와 ADBC의 구조를 봤다. 이제 필요한 것은 "기술 이름을 아는 것"이 아니라 "상황을 보고 어느 수단을 고를지 말할 수 있는 능력"이다.

초보자는 강력한 수단을 배우면 바로 쓰고 싶어진다. 하지만 실무에서는 강한 수단일수록 유지보수 비용과 운영 리스크가 커진다. Open SQL 한 문장으로 끝날 일을 AMDP로 만들면 debugging, activation, DB 종속성, 테스트, Cloud 제약이 불필요하게 따라온다. 반대로 정말 DB 내부 절차가 필요한데 ABAP loop로 끌어오면 대량 처리 병목이 반복된다.

### 무엇인가

이 레슨의 핵심은 네 수단의 자리를 정하는 것이다.

| 질문 | Open SQL | CDS View | AMDP | ADBC |
| --- | --- | --- | --- | --- |
| 집계/필터/join이면? | 1순위 | 공유 모델이면 2순위 | 보통 과함 | 보통 금지 |
| 여러 소비자가 같은 모델을 쓰면? | 가능 | 1순위 | 특수 계산만 | 부적합 |
| SQLScript 절차 로직이 꼭 필요하면? | 부족할 수 있음 | table function 등 심화 가능 | 후보 | 최후 |
| DB vendor 고유 SQL이 필요하면? | 불가 | 불가/제한 | 일부 가능 | 후보 |
| Cloud/Clean Core 친화성은? | 높음 | 높음 | 조건부 | 낮음/제한 |
| 테스트와 리뷰 난이도는? | 낮음 | 중간 | 높음 | 매우 높음 |

Open SQL은 프로그램 안의 SQL이다. 이미 CH19에서 modern ABAP SQL의 host variable, SQL expression, aggregate를 배웠다. CDS는 재사용 가능한 데이터 모델이다. CH22와 CH23 이후에는 OData/RAP/Fiori와 연결될 수 있다. AMDP는 HANA SQLScript procedure/function을 ABAP class method로 관리하는 수단이다. ADBC는 Native SQL을 DB interface에 직접 보내는 API다.

### 어떻게 확인하는가

첫 번째 확인은 "표준 SQL로 표현 가능한가"다. `SELECT FROM ... FIELDS ... WHERE ... GROUP BY ... INTO TABLE @DATA(...)`로 충분하다면 Open SQL이 정답에 가깝다. 이 경우 AMDP를 만들 이유를 별도로 증명해야 한다.

두 번째 확인은 "재사용 모델인가"다. 같은 join과 계산이 report, Gateway, RAP projection, Fiori Elements, 다른 batch에서 반복된다면 CDS View로 모델을 올리는 편이 좋다. CDS는 의미와 관계를 남기므로 단순 코드 중복 제거보다 큰 가치가 있다.

세 번째 확인은 "DB 내부 절차가 필요한가"다. 여러 단계의 임시 결과, SQLScript-only function, 복잡한 DB-side loop, procedure call이 필요하면 AMDP가 후보가 된다. 단, 이때도 AMDP 안의 SQLScript가 실제로 줄이는 데이터 이동량과 runtime 개선을 측정해야 한다.

네 번째 확인은 "DB 고유 기능이 불가피한가"다. Open SQL/CDS/AMDP로 표현하기 어렵고 DB vendor 기능을 직접 써야 한다면 ADBC가 후보가 된다. 이 경우 설계 문서에 DB 종속 이유, 대체안, client 처리, injection 방어, 예외 처리, 테스트 범위를 남겨야 한다.

다섯 번째 확인은 ABAP Cloud 경계다. ABAP Cloud는 restricted language version과 released API가 기준이다. RAP과 CDS를 우선하고, AMDP는 client-safe object와 `USING` list, AMDP client option을 검토해야 한다. Native SQL은 client-dependent data 접근과 Clean Core 관점에서 특히 조심해야 한다.

### 실수와 주의

가장 흔한 실수는 "AMDP가 제일 빠르다"라는 서열을 만드는 것이다. 올바른 서열은 속도 서열이 아니라 책임 서열이다. Open SQL과 CDS는 ABAP 플랫폼이 많이 보호해 주고, AMDP와 ADBC는 개발자가 더 많은 책임을 진다.

두 번째 실수는 CDS를 단순 SQL view처럼만 보는 것이다. CDS는 재사용, annotation, access control, RAP/OData 연결까지 이어지는 모델이다. 단일 report 내부에서만 쓰고 버릴 계산이면 Open SQL이 더 단순할 수 있고, 여러 소비자가 쓰는 모델이면 CDS가 더 낫다.

세 번째 실수는 ADBC를 AMDP의 대체재처럼 쓰는 것이다. AMDP는 ABAP-managed database procedure이고, ADBC는 Native SQL을 직접 보내는 API다. 둘 다 DB 가까운 수단이지만 관리 방식과 검증 책임이 다르다.

네 번째 실수는 운영팀과 리뷰어가 이해할 수 없는 DB 종속 코드를 숨기는 것이다. AMDP/ADBC를 썼다면 왜 Open SQL/CDS가 안 되는지, 어떤 DB 기능에 종속되는지, 어떤 trace로 효과를 확인했는지, fallback이나 전환 비용은 무엇인지 기록해야 한다.

### 체험형 학습 설계

기존 체험물 `CH33-L04-S01`은 compare matrix다. 학습자는 `Open/Modern SQL`, `CDS View`, `AMDP`, `ADBC / Native SQL` 행 이름을 클릭하고, `이식성`, `복잡 절차`, `재사용`, `클라우드`, `권장순위` column을 비교한다. detail 영역은 각 수단의 권장 상황을 보여 준다.

강의에서는 이 매트릭스를 "선택 게임"으로 써야 한다. 먼저 학습자에게 `공연별 좌석 합계`, `예매 요약을 RAP/Fiori에서 재사용`, `DB 안에서 임시 테이블을 여러 번 조합`, `HANA 고유 세션 변수 조회` 네 카드를 준다. 각 카드마다 행 하나를 클릭하게 하고, detail을 읽은 뒤 선택 이유를 말하게 한다.

피드백은 세 단계로 설계한다. 1단계는 선택한 수단의 장점, 2단계는 선택하지 않은 더 단순한 수단이 가능한지, 3단계는 운영 리스크다. 예를 들어 학습자가 단순 집계에 AMDP를 고르면 "가능은 하지만 Open SQL로 충분하므로 복잡도만 늘어난다"는 피드백을 준다.

확장 위젯을 만든다면 행 클릭 외에 `상황 카드` 버튼을 추가한다. 버튼 라벨은 `단순 집계`, `공유 모델`, `절차 로직`, `DB 고유 기능`, `Cloud 전환 예정`으로 둔다. 버튼을 누르면 매트릭스의 추천 행이 강조되고, 왜 다른 행이 아닌지 설명한다.

### 정리

Open SQL, CDS, AMDP, ADBC는 강약 순서가 아니라 책임과 적합성의 순서로 봐야 한다. Open SQL은 대부분의 집계와 join의 1순위다. CDS는 재사용 모델과 RAP/OData 연결에 강하다. AMDP는 SQLScript 절차 로직이 DB 안에서 꼭 필요할 때 쓰고, ADBC는 DB 고유 Native SQL이 불가피한 최후 수단이다. 다음 레슨에서는 이 강한 수단들이 운영에서 어떤 비용을 만드는지 정리한다.

## CH33-L05 - 운영 리스크와 DB 종속성

### 왜 필요한가

성능 개선은 운영에서 끝난다. 개발 서버에서 AMDP가 빨라 보여도 운영에서 client가 섞이거나, 권한이 없거나, DB upgrade 후 Native SQL이 깨지거나, 보안 리뷰에서 SQL injection 위험이 발견되면 개선이 아니라 장애가 된다.

CH33의 마지막 레슨은 "강한 도구를 언제 쓰는가"보다 "쓴 뒤 무엇을 책임지는가"를 다룬다. AMDP와 ADBC는 빠른 길을 열어 주지만, ABAP SQL/CDS가 제공하던 보호막 일부를 벗어난다. 그래서 코드보다 운영 체크리스트가 더 중요하다.

### 무엇인가

AMDP/ADBC 운영 리스크는 다섯 축으로 나눌 수 있다.

| 리스크 | AMDP | ADBC / Native SQL | 확인 기준 |
| --- | --- | --- | --- |
| DB 종속성 | HANA SQLScript 종속 | DB vendor SQL 직접 종속 | DB 전환/Cloud 전환 영향 기록 |
| Client safety | implicit client handling 없음, client-safe object 필요 | `MANDT` 조건 직접 필요 | current client만 접근하는지 확인 |
| 보안 | dynamic SQLScript는 injection 위험 | 문자열 SQL은 injection 위험 | placeholder, validation, code review |
| 플랫폼 보호 | ABAP-managed이나 SQLScript 내용 책임은 개발자 | ABAP SQL 보호장치 약함 | access control, buffering, where-used 영향 |
| 테스트/디버깅 | ADT/DB 도구 필요, ABAP Unit 한계 | DB 오류와 vendor message 처리 필요 | trace, exception log, 대표 데이터 테스트 |

Cloud/Clean Core 관점에서는 더 엄격하다. ABAP Cloud는 restricted language version과 released API를 기준으로 하고, RAP이 transactional programming model이다. AMDP는 Cloud에서도 조건부로 사용할 수 있지만 client-safe repository object와 AMDP option을 확인해야 한다. Native SQL은 client-dependent data 접근과 released API 관점에서 특히 제한적이다.

### 어떻게 확인하는가

첫 번째 확인은 사용 이유 문서화다. AMDP/ADBC class 위나 설계 문서에 "Open SQL/CDS로 안 되는 이유", "DB 기능에 종속되는 이유", "대상 DB", "fallback 가능성", "측정 결과"를 남긴다. 리뷰어가 이 기록만 보고도 왜 강한 수단이 필요한지 이해해야 한다.

두 번째 확인은 client-safety다. AMDP는 `USING` list가 client-safe object로 구성되는지, 필요한 AMDP client option이 있는지 확인한다. ADBC는 `WHERE mandt = ?` 같은 current client 조건과 binding이 있는지 확인한다. client-independent object라면 그 근거를 따로 남긴다.

세 번째 확인은 SQL injection 방어다. AMDP SQLScript에서 dynamic `EXEC`나 `APPLY_FILTER` 같은 동적 구성이 있다면 외부 입력 검증이 필요하다. ADBC에서는 operand 값은 placeholder와 `set_param`으로 넘기고, column name이나 SQL clause처럼 placeholder로 처리할 수 없는 동적 token은 허용 목록과 `CL_ABAP_DYN_PRG` 계열 검증이 필요하다.

네 번째 확인은 운영 관찰성이다. `CX_SQL_EXCEPTION`의 `SQL_CODE`, `SQL_MESSAGE`, DB object not exists, duplicate key 같은 원인 정보를 로그로 남긴다. AMDP activation 오류나 권한 문제는 ADT activation, SICK, ST22, DB trace, SQL console/PlanViz 등 시스템에 맞는 확인 절차를 정한다.

다섯 번째 확인은 재측정과 회귀 테스트다. 성능을 위해 만든 코드라면 수정 전후 ST05/SAT/SQLM 또는 DB trace 수치를 남긴다. 기능 결과도 Open SQL/CDS 기준 결과와 비교한다. 특히 AMDP는 ABAP test tool이 SQLScript 내부 보안을 자동으로 보장하지 않으므로 대표 데이터와 악성 입력 케이스를 별도로 넣어야 한다.

### 실수와 주의

가장 큰 실수는 "DB에 내려가면 Clean Core가 된다"는 오해다. Clean Core는 핵심 표준을 덜 건드리고 released API와 안정적 확장 지점을 쓰는 방향이지, DB 종속 코드를 늘리는 뜻이 아니다. AMDP/ADBC는 오히려 Clean Core 검토가 더 필요하다.

두 번째 실수는 table buffering과 CDS access control을 잊는 것이다. Native SQL과 AMDP는 table buffer를 우회하거나 buffer 동기화와 다른 경로를 만들 수 있다. Native SQL은 CDS access control, association, CDS의 의미 계층을 기대한 대로 처리하지 않는다. 권한은 별도로 점검해야 한다.

세 번째 실수는 동적 SQL을 테스트 없이 배포하는 것이다. AMDP 보안 문서는 AMDP 구현 내용과 보안이 ABAP의 책임으로 자동 전가되지 않는다고 설명한다. 동적 부분이 외부 입력과 결합하면 SQL injection 위험이 생긴다. 최소한 code review와 악성 입력 테스트를 둔다.

네 번째 실수는 오류를 단순 메시지로 삼키는 것이다. ADBC `CX_SQL_EXCEPTION`에는 DB error 여부, SQL code, SQL message, duplicate key, DB object 존재 여부 같은 원인 속성이 있다. 운영 로그에는 이 정보를 남겨야 재처리가 가능하다.

다섯 번째 실수는 DB 전환 가능성을 고려하지 않는 것이다. 지금 HANA에서만 돌 시스템이라도 S/4HANA upgrade, ABAP Cloud 전환, side-by-side architecture 전환, package split이 생길 수 있다. DB 종속 부분은 별도 class로 격리하고 호출부는 가능한 interface 뒤에 숨긴다.

### 체험형 학습 설계

기존 체험물 `CH33-L05-S01`은 judge quiz다. 각 상황에 대해 `적절` 또는 `부적절`을 고르면 점수 bar가 올라가고, 왜 맞거나 틀렸는지 피드백이 나온다. 문제는 `Open SQL GROUP BY로 충분한 집계`, `단순 단건 조회를 굳이 AMDP`, `복잡 알고리즘을 AMDP`, `DB 이전 예정 시스템에서 Native SQL 남발`, `AMDP/Native 별도 class 격리`, `ABAP Cloud에서 Native SQL 핵심 로직`으로 구성되어 있다.

본문에서는 이 퀴즈를 마지막 정리 평가로 사용한다. 학습자는 먼저 아무 설명 없이 6문항을 풀고, 틀린 문항의 `why` 피드백을 읽는다. 그 다음 각 문항을 `성능`, `이식성`, `Cloud`, `보안`, `운영 관리` 중 하나의 리스크 라벨로 분류한다. 이 과정을 통해 "적절/부적절"이 감정이 아니라 기준이라는 점을 배운다.

확장 설계로는 `운영 승인 체크리스트` 버튼을 둔다. 학습자가 AMDP 또는 ADBC를 선택하면 체크리스트가 펼쳐지고, `Open SQL/CDS 대안 검토`, `client 처리`, `injection 방어`, `trace 수치`, `예외 로그`, `Cloud/released API 확인`, `DB 종속 사유` 항목을 하나씩 체크한다. 모든 항목이 체크되기 전에는 `배포 가능` 상태가 아니라 `검토 필요` 상태로 남긴다.

상태 피드백은 명확해야 한다. 초록 상태는 "측정 근거와 운영 통제가 있는 제한 사용", 노란 상태는 "성능 근거는 있으나 client/보안 확인이 부족", 빨간 상태는 "단순 SQL인데 AMDP/ADBC 과용 또는 Cloud/보안 위반"으로 나눈다.

### 정리

AMDP와 ADBC는 빠른 길이지만 책임이 커지는 길이다. AMDP는 SQLScript 절차 로직을 ABAP 객체로 관리하게 해 주지만 client-safety, `USING`, `READ-ONLY`, SQL injection, debugging, 테스트 한계를 확인해야 한다. ADBC는 Native SQL을 직접 보내므로 client, placeholder, exception log, DB 종속성을 직접 책임진다. CH33의 최종 결론은 단순하다. 먼저 Open SQL과 CDS로 해결하고, AMDP/ADBC는 이유와 측정과 운영 통제가 있을 때만 제한적으로 사용한다.

## CH33 마무리

CH33은 "DB 가까이 가는 기술"을 배웠지만, 실제 메시지는 절제다. CH32에서 측정한 병목이 단순 데이터 이동 문제라면 Open SQL `GROUP BY`나 CDS가 먼저다. SQLScript 절차 로직이 DB 안에서 필요할 때 AMDP를 쓰고, DB 고유 Native SQL을 피할 수 없을 때 ADBC를 쓴다.

좋은 CH33 산출물은 코드보다 판단 기록이 중요하다. 어떤 데이터를 얼마나 줄였는가, 왜 더 단순한 수단으로 안 되는가, client와 보안은 어떻게 지켰는가, 오류를 어디에 기록하는가, Cloud/Clean Core 경계에 맞는가가 남아 있어야 한다. 다음 CH34에서는 성능이 아니라 출력물, 양식, PDF, 스풀 운영으로 시선을 옮긴다.
