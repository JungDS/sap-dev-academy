# CH08_REWRITE - Open SQL 기본 조회 v1

> 목적: `content/abap/CH08`의 8개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH08 전체 설계

CH08의 한 문장 목표는 "Database Interface (DBI)의 Native SQL 실시간 번역, Cursor-based Fetch(SELECT...ENDSELECT) vs Array Fetch(INTO TABLE)의 네트워크 패킷 왕복(Round-trip) 오버헤드 공식, CORRESPONDING FIELDS OF 의 런타임 컬럼명 매핑 스캔 비용, Host Variable 바인딩(`?` 플레이스홀더)을 통한 SQL Injection 원천 차단 및 하드 파싱 억제, 그리고 `SELECT *` vs Selective Projection 의 네트워크 대역폭 성능 차이를 규명해 데이터 조회 성능 최적화의 초석을 완성한다"이다.

IT 비전공자 입문자는 데이터베이스 대량 테이블 조회 시 `SELECT ... ENDSELECT` 를 쌩 무분별하게 남발하여 Cursor-based Fetch 에 의한 매 회차 네트워크 패킷 왕복 오버헤드로 서버 연산을 다운시키고, `SELECT *` 로 컬럼 전체를 긁어와 불필요한 필드까지 수송 대역폭을 가득 점유해 네트워크 정체를 초래한다.
또한, `INTO CORRESPONDING FIELDS OF` 가 초래하는 실시간 명칭 대조 스캔 비용을 모른 채 대량 루프에서 남발하고, `WHERE` 절 조건 매칭 시 이진 정렬 Index 스캔이 작동하지 않는 일반 컬럼 검색을 때려 Full Table Scan 성능 장애를 낸다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **DBI SQL Translator**: 특정 DBMS 에 종속되지 않게 Open SQL 을 Native SQL 로 실시간 치환 번역하는 Database Interface(DBI) 물리 아키텍처 규명.
2. **Array Fetch (Block Fetch)**: 한 행씩 왕복하는 Cursor 방식과 대조적으로, 한 번에 수천 행을 일괄 수송해 패킷 왕복(Network Round-trip) 오버헤드를 억제하는 `INTO TABLE` 사용법 교육.
3. **Selective Projection (필드 지정)**: 불필요한 필드를 수송 트래픽에서 배제하여 네트워크 대역폭(Bandwidth) 정체와 메모리 낭비를 가드하는 컬럼 명시 규칙 수립.
4. **Host Variable Bind Option**: Open SQL WHERE 절의 아바 변수 대입 시, DBI 가 이를 바인드 변수(`?` 플레이스홀더)로 파싱해 SQL Injection 보안 위협을 원천 봉쇄하는 기작 명세.
5. **CORRESPONDING Scan Cost**: 편리한 동명 필드 매핑 복사 뒤에 상주하는 메타데이터 스캔 비용을 교육하고, 개별 1:1 바인드 대입과의 성능 차이 비교.
6. **MESSAGE S/I Status Gate**: 데이터 유재석 대조 실패(`sy-subrc = 4`) 시 상태바('S')나 팝업('I')으로 오류를 표출해 예외 분기를 수호하는 메시지 핸들링 장치 연계.

---

## CH08-L01 - SAP 데모 테이블과 Client 종속

### 왜 필요한가

우리가 이전 CH07 에서 투명 테이블 `ZGUGUDAN` 을 개설하고 데이터를 하드디스크에 보존 완료했다.
이제 그 저장된 데이터를 아바 프로그램 소스로 끌어와 변수에 담아 요리하는 '조회(SELECT)' 의 번역 엔진 구조가 다음 장벽이다.
- " 아바 소스 상에 적어둔 Open SQL 구문이 어떻게 Oracle 이나 HANA DB 가 알아듣는 언어로 치환되어 날아가는가? 
그리고 MANDT 필드를 WHERE 절에 적어주지 않았는데도, 내 로그인 클라이언트 방(Client)의 데이터만 어떻게 딱 격리 스캔되어 조회되는가?"
데이터베이스 서버와 통신하는 커널 단의 번역기 엔진과 묵시적 클라이언트 필터링의 실체를 모르면, 쿼리 작성 시 불필요하게 MANDT 필드를 하드코딩하게 되어 소스 이식성과 형상을 망가뜨린다.

**Open SQL 을 Native SQL 로 벤더 호환 치환하는 Database Interface (DBI) 의 작동 기작과, Open SQL 엔진이 컴파일 시점에 `WHERE MANDT = sy-mandt` 를 묵시적으로 자동 삽입(Implicit Client Filtering)하는 물리 원천 기술**이 필요하다. 그것이 **Open SQL 기초 및 Client 독립성**의 장악이다.

### 무엇인가

#### 1. Database Interface (DBI - 데이터베이스 인터페이스)
- **번역 프로세스**: **아바의 Open SQL 은 특정 DBMS 제품군에 직접 명령을 쏘지 않는다. Application Server(2층) 내에 상주하는 Database Interface (DBI) 가 소스 코드의 Open SQL 을 읽어, 현재 도킹되어 있는 실제 DBMS(HANA DB 등) 벤더의 규격에 맞는 고유 쿼리 언어(Native SQL)로 런타임에 실시간 번역(SQL Translation)하여 데이터베이스 서버(3층)로 방출한다.** (이로 인해 개발자는 DB 제품 종류에 무관하게 동일한 아바 코드로 생존력을 유지한다.)

#### 2. Implicit Client Filtering (MANDT 자동 격리 기작)
- **묵시적 조건 자동 주입**: **Open SQL 번역기는 `SELECT` 문을 가공할 때, 대상 테이블에 MANDT 가 키 필드로 꽂혀 있으면 `WHERE MANDT = '현재로그인한클라이언트번호'(sy-mandt)` 조건식을 쿼리 꼬리에 강제로 자동 삽입한다. 개발자가 Open SQL 에 MANDT 를 적지 않는 것이 철칙인 이유가 바로 이 커널 자동 격리 장치가 뒤에서 실시간 수호하고 있기 때문이다.**

#### 3. SAP 항공 데모 테이블 (SCARR, SPFLI, SFLIGHT)
- **연습 데이터 세트**: SAP 이 전 세계 개발자 교육용으로 탑재해 둔 항공사(`SCARR` - master), 노선 스케줄(`SPFLI`), 항공편 예약 현황(`SFLIGHT` - detail)의 3대 관계 테이블이다. 

### 어떻게 확인하는가

데모 테이블에 대고 Open SQL 을 날려 클라이언트가 자동 제어되는 과정을 검증한다.

```abap
REPORT zhello_demo_tables.

" 1. [ 데모 sflight 테이블의 행 모양을 상속받아 내부 테이블 선언 ]
DATA gt_flight TYPE TABLE OF sflight. 

" 2. [★ 중요: Open SQL 쿼리 격발 - WHERE 에 MANDT 를 쌩 생략해도 자동으로 룸 격리!]
SELECT * FROM sflight 
  INTO TABLE gt_flight
  UP TO 10 ROWS. " 10건만!

" 3. [ DBI 가 번역 완료한 Native SQL 을 SQL Trace(ST05)로 뜯어보면 아래와 같이 변환되어 날아감! ]
" SELECT * FROM "SFLIGHT" WHERE "MANDT" = '100' AND ROWID <= 10;

IF sy-subrc = 0.
  WRITE: / '현재 클라이언트의 항공 데이터 10건 스캔 성공.'.
ENDIF.
```

#### 체험/시뮬레이터 설계 (DBI 번역 기어)
- **프로세스 플로우**:
  1. 학습자가 [아바 Open SQL 기어] 와 [DBMS Native SQL 기어], 그리고 [DBI 번역기 상자] 를 본다.
  2. [Open SQL: SELECT * FROM sflight] 데이터 구슬을 투입한다.
  3. [DBI 번역기 상자] 안에서 톱니바퀴가 지이잉 돌며, 현재 내 세션 번호(Client = 100)를 감지해 [Native SQL: SELECT * FROM sflight WHERE MANDT = '100'] 구슬로 재가공 벼려 방출해 DBMS 에 꽂히는 물리 변환을 관찰한다.
  4. Client 번호 슬라이더를 [200] 으로 꺾자, 번역기 내의 묵시적 필터 상수가 '200' 으로 자동 갱신되는 정합성 피드백을 감상한다.
- **상태 및 데이터**:
  - `WHERE 절에 MANDT = sy-mandt 를 직접 수동 하드코딩해 빌드한 상태` -> 런타임 결과: `Syntax check warning. Host variable sy-mandt is redundant for Client Dependent table` 하이라이트.
- **피드백**: Open SQL 은 DBI 번역기를 경유하며, MANDT 는 커널이 수호하는 클라우드 세션 격리의 핵심 수문장임을 체득한다.

### 실수/주의

- **타 시스템이나 다른 데이터베이스(Legacy DB)와 DB Link 조인 조회를 기동할 때, MANDT 가 없는 이방인 테이블에 대고 Open SQL 필터를 묵인**:
  - 이방인 외부 DB 테이블은 MANDT 필드가 없으므로, 아바 커널이 Implicit Filtering 을 억지로 끼워 넣으려다 SQL 구문 에러를 터트려 프로세스가 폭사합니다.
  - **외부 DB Link 연동 시에는 `CONNECTION` 지시어 등 클라이언트 바이패스 옵션을 정확히 매겨 우회 수호해야 합니다.**

### 정리

- **`Open SQL`** 은 **`Database Interface (DBI)`** 가 실시간 Native SQL 로 변환해 주는 벤더 독립 인터페이스다.
- **`MANDT`** 필드는 Open SQL 컴파일 시점에 **`Implicit Client Filtering (묵시적 조건 자동 주입)`** 기작에 의해 철저히 격리 보호된다.
- 항공사(**`SCARR`**), 노선(**`SPFLI`**), 운항편(**`SFLIGHT`**)은 SAP 의 공인 관계 연습 3대 데모 테이블이다.

---

## CH08-L02 - SELECT 4요소 · `*` vs 필드

### 왜 필요한가

DBI 번역기와 MANDT 격리 기작을 이해했다.
이제 테이블 조회 명령을 작성할 때 'classic 구문 필드 구분자 규칙' 과 '조회 결과 수치 판정' 이 다음 장벽입니다.
- " SELECT 문을 짰는데, 필드명 사이에 콤마(,)를 적었더니 컴파일러가 신택스 에러를 뿜으며 즉각 빌드를 차단한다. classic 아바 SQL 과 modern SQL 의 콤마 차이는 무엇인가?"
그리고, 테이블 조회가 성공했는지 실패했는지를 나타내는 `sy-subrc` 와, 읽은 행 수를 돌려주는 `sy-dbcnt` 시스템 레지스터의 세부 갱신 조건 물리 원리를 이해하지 못하면, 데이터 유실이 발생했음에도 로직이 생 굴러가는 전산 훼손을 낳습니다.

**콤마(,) 없이 오직 공백으로만 필드를 벼려 나열하는 classic Open SQL 필드 Projection 스펙과, sy-subrc 및 sy-dbcnt 레지스터의 데이터셋 성공 수치 판정 기술**이 필요합니다. 그것이 **SELECT 4요소와 classic 문법**의 완수입니다.

### 무엇인가

#### 1. SELECT 4요소
- **FROM**: 대상 물리 테이블 지칭.
- **Projection (필드 나열)**: 긁어올 컬럼 지정. (주의: classic 구문은 필드 사이에 콤마(,)를 적으면 컴파일 즉사하며, **오직 쌩 공백**으로 토큰 분리해야 한다.)
- **WHERE**: 추출 행 필터링 조건.
- **INTO**: 램 메모리 적재 버퍼(gs / gt) 지정.

#### 2. sy-subrc 와 sy-dbcnt
- **`sy-subrc`**: **조회 결과 데이터가 단 1행이라도 성공적으로 램에 적재 완료되면 `0` 을 충전하고, 조건에 매칭되는 데이터가 단 1건도 없어 적재에 실패하면 실패 코드 `4` 를 채워주는 성공 판정 레지스터다.**
- **`sy-dbcnt`**: **SELECT 구문 기동 완료 시, 데이터베이스로부터 긁어다가 내 램(Internal Table) 버퍼에 최종 밀어 넣은 데이터 행 수(Record Count)를 정수로 돌려주는 결과 카운터 레지스터다.** (LOOP 루프 도는 중에는 현재까지 훑은 누적 카운터를 뱉어낸다.)

### 어떻게 확인하는가

classic 구문으로 필요한 필드만 projection 하여 조회하고 성공 여부를 판정하는 코드를 검증한다.

```abap
REPORT zhello_select_four.

DATA: BEGIN OF gs_data,
        carrid TYPE sflight-carrid,
        connid TYPE sflight-connid,
        price  TYPE sflight-price,
      END OF gs_data,
      gt_data LIKE TABLE OF gs_data.

" 1. [★ classic 구문 수호: 필드 나열 시 콤마 없이 오직 공백으로 격리 선고!]
SELECT carrid connid price 
  FROM sflight
  INTO CORRESPONDING FIELDS OF TABLE gt_data
  UP TO 5 ROWS.

" 2. [★ 중요: SELECT 격발 직후, 무조건 sy-subrc 와 sy-dbcnt 판정 수문장 기동!]
IF sy-subrc = 0.
  " 성공적으로 1건 이상 읽었음!
  WRITE: / '조회 성공! 총 건수(sy-dbcnt):', sy-dbcnt. " 5건 출력!
ELSE.
  WRITE: / '조회 실패. 해당 조건의 데이터가 실재하지 않음.'.
ENDIF.
```

#### 체험/시뮬레이터 설계 (SELECT * 대역폭 정체기)
- **프로세스 플로우**:
  1. 학습자가 [sflight 테이블 디스크 포트] 와 [gt_data 램 컨테이너], 그리고 [네트워크 수송 파이프] 를 본다.
  2. [SELECT * 칩] 을 구동한다. carrid, price 뿐만 아니라 불필요한 대형 XML, 가변 텍스트 등 50개 컬럼이 통째로 쏟아져 나와 [네트워크 수송 파이프] 가 붉게 정체 병목을 겪으며 램으로 둔탁하게 이동 완료되는 모션을 본다.
  3. [Selective Projection 칩] 으로 교체한다. 오직 carrid, connid, price 3개 데이터만 파이프를 타고 쾌속 통과해 0.0001초 만에 램에 도킹 성공하는 성능 정합성 피드백을 감상한다.
- **상태 및 데이터**:
  - `Projection 필드 나열 시 carrid, connid 처럼 콤마를 적어 빌드한 상태` -> 런타임 결과: `Syntax error. Field list must be space-separated in classic Open SQL` 하이라이트.
- **피드백**: classic 구문은 필드 간 공백 구분이 절대 문법이며, 필요한 필드만 짚어 내야 대역폭 폭사를 막음을 인지한다.

### 실수/주의

- **SELECT 구문을 쏜 직후, sy-subrc 검증을 누락하고 곧장 gt_data-carrid 등의 필드 처리를 단행**:
  - 쿼리가 실패해 데이터가 0건인데 루프를 타거나 쓰레기 값을 참조하여 프로그램이 뇌사 덤프를 뿜거나 잘못된 계산 결과를 낳습니다.
  - **SELECT 직후 `sy-subrc` 분기 판단은 아바 전산의 기초 예절임을 수호해야 합니다.**

### 정리

- SELECT 4요소는 **`FROM (테이블)`**, **`Projection (필드)`**, **`WHERE (조건)`**, **`INTO (담을곳)`** 이다.
- **`classic Open SQL`** 스펙에서 필드를 나열할 때는 콤마(,) 없이 **`공백으로 벼려 분리`** 한다.
- 조회 성공 판정은 **`sy-subrc = 0`** (실패는 4)이며, 읽어 들인 총 행 수는 **`sy-dbcnt`** 에 즉각 보존된다.

---

## CH08-L03 - SELECT 형태 — SINGLE · INTO TABLE · UP TO n ROWS

### 왜 필요한가

SELECT 4요소 classic 문법을 사수했다.
이번에는 "특정 비행 노선 한 건만 찾거나, 10만 건 노선을 모아 정산하는" 다각도 조회 시 발생하는 '네트워크 패킷 왕복 오버헤드' 가 장벽입니다.
- " SELECT SINGLE 과 SELECT ... ENDSELECT 는 데이터베이스 서버와 통신할 때 내부적으로 어떤 네트워크 물리적 오버헤드 차이를 겪는가?"
수천 건 대량 매출 조회를 편리하다는 이유로 `SELECT ... ENDSELECT` 루프로 도배해 기동하면, 매 회차 한 줄씩 DB 와 App Server 간에 전산 통신 패킷 왕복(Round-trip)이 격발되어 CPU 리소스 점유와 대역폭 정체로 전산망이 마비되는 참사를 예방해야 합니다.

**한 행씩 수송해 네트워크를 폭사시키는 Cursor-based Fetch (SELECT...ENDSELECT) 오버헤드 물리 규명과, 일괄 통으로 쓸어 담아 패킷을 절감하는 Array Fetch (INTO TABLE), 그리고 SINGLE/UP TO n ROWS 제어 기술**이 필요합니다. 그것이 **SELECT 형태 제어**의 완수입니다.

### 무엇인가

#### 1. SELECT SINGLE (단건 저격)
- **유일 행 보장**: **WHERE 조건절에 테이블의 Primary Key 전체를 다 물려 꽂아야만 완벽한 단 1행(Unique Row)을 반환한다. 키 필드 중 일부를 누락한 채 `SELECT SINGLE` 을 쏘면, DB 엔진은 조건에 맞는 대량 행 중 '임의의 무작위 1행' 을 가져다 꽂아주므로 전산 데이터 일치성이 깨지는 함정에 빠진다.**

#### 2. Array Fetch (INTO TABLE) vs Cursor-based Fetch (SELECT...ENDSELECT)
- **Array Fetch (Block Fetch)**: **`INTO TABLE gt_data` 는 DB 로부터 조건에 매칭되는 수천 행을 통째로 패키징해 한 번의 네트워크 수송으로 램에 쓸어 담는다. App Server 와 DB Server 간의 네트워크 패킷 왕복(Network Round-trip) 횟수가 단 1회로 통제되어 성능이 극대화된다.**
- **Cursor-based Fetch**: **`SELECT INTO gs ... ENDSELECT` 는 DB 에 커서(Cursor)를 열어놓고, 매 루프 바퀴마다 1행씩 네트워크 패킷을 타고 흘려보낸다. 1만 건 조회 시 1만 번의 네트워크 왕복 지연(Latency)이 중첩되어 연산 속도가 바닥을 친다. (실무에선 단독 SELECT...ENDSELECT 루프 및 중첩 루프는 엄격히 금지된다.)**

#### 3. UP TO n ROWS (상한선 브레이크)
- 긁어올 데이터의 최대 건수를 n건으로 강제 락 채워 제한하는 성능 가드다. (페이징이나 가벼운 실재 여부 스캔에 필수적이다.)

### 어떻게 확인하는가

SELECT SINGLE 및 Array Fetch, UP TO 10 ROWS 가 조립된 코드를 검증한다.

```abap
REPORT zhello_select_kind.

DATA: gs_flight TYPE sflight,
      gt_flight TYPE TABLE OF sflight.

" 1. [★ SELECT SINGLE 기동: Primary Key 3요소를 완벽히 WHERE 절에 도킹하여 유일 1행 저격!]
SELECT SINGLE * FROM sflight
  INTO gs_flight
  WHERE carrid = 'KE' 
    AND connid = '0701' 
    AND fldate = '20260623'.

IF sy-subrc = 0.
  WRITE: / '단건 예약석 상황:', gs_flight-seatsocc.
ENDIF.

" 2. [★ Array Fetch 기동: 한 통으로 뭉쳐 대량 수송해 네트워크 패킷 왕복 억제!]
SELECT * FROM sflight
  INTO TABLE gt_flight
  UP TO 100 ROWS. " 3. [ UP TO n ROWS 로 100건 상한선 브레이크 장착! ]

IF sy-subrc = 0.
  WRITE: / 'Array Fetch 100건 적재 성공. 왕복 횟수 = 단 1회!'.
ENDIF.
```

#### 체험/시뮬레이터 설계 (Cursor/Array 패킷 수송선)
- **프로세스 플로우**:
  1. 학습자가 [Database Server 항구] 와 [App Server 항구], 그리고 [바다(네트워크)] 를 본다.
  2. [SELECT ENDSELECT (Cursor) 칩] 을 구동한다. [1인승 뗏목 수송선] 이 1개 데이터를 싣고 바다를 건너 App 항구에 내리고, 다시 DB 항구로 돌아가 다음 1개를 싣고 오는 왕복 노역을 10번 반복하느라 날이 저무는 연산 렌더링을 본다. (Round-trip 오버헤드 확인).
  3. [INTO TABLE (Array) 칩] 으로 스위칭한다. [10인승 대형 바지선] 이 10개 데이터를 한 방에 다 때려 싣고 바다를 단 1회 횡단하여 App 항구에 원샷 도킹하는 쾌속 피드백을 감상한다.
- **상태 및 데이터**:
  - `SELECT SINGLE 을 날리면서 WHERE 절에 주 키인 fldate 조건을 누락한 상태` -> 런타임 결과: `Syntax check warning. SELECT SINGLE without full primary key returns unstable row` 하이라이트.
- **피드백**: 대량 데이터 순회 조회 시 `SELECT ... ENDSELECT` 루프 가설은 네트워크 병목을 낳는 대역죄며, 무조건 `INTO TABLE` Array 수송을 얹어야 함을 각인한다.

### 실수/주의

- **중첩 SELECT 루프 (LOOP AT gt_data ... SELECT SINGLE ... ENDLOOP.) 를 소스 상에 빌드**:
  - 1만 건 루프 내부에서 매번 쿼리를 새로 쏘는 최악의 N+1 쿼리 안티패턴으로, DB 서버 커널 CPU 점유율을 100% 로 치솟게 만들어 전체 개발 서버를 뇌사시키는 실무 최악의 테러 코딩입니다.
  - **조회는 무조건 루프 밖에서 한 번에 `SELECT` 해두고 램 상에서 `READ TABLE` 로 대조하는 룰을 수호해야 합니다.**

### 정리

- **`SELECT SINGLE`** 은 단건 조회를 전담하며, 임의 행 유입 방지를 위해 **`Primary Key 전체 매칭`** 을 의무화한다.
- **`INTO TABLE`** 은 한꺼번에 긁어오는 **`Array Fetch`** 이며 네트워크 왕복(Round-trip) 횟수를 단 1회로 통제한다.
- 한 행씩 흘려보내는 **`SELECT...ENDSELECT`** 는 네트워크 패킷 폭사 오버헤드를 낳으므로 **`실무 사용 전면 차단 지양`** 한다.
- **`UP TO n ROWS`** 는 디스크 스캔의 한계 상한선 브레이크다.

---

## CH08-L04 - INTO 대상 형태

### 왜 필요한가

SELECT 형태 제어까지 완수했다.
이제 테이블로부터 읽어 들인 데이터를 메모리 변수에 매핑해 담는 `INTO` 문의 '이름 대조 스캔 비용' 이 장벽입니다.
- " SELECT carrid connid FROM sflight INTO CORRESPONDING FIELDS OF TABLE gt_data 를 쐈다. 
이 CORRESPONDING 은 내부적으로 어떤 성능 탐색 오버헤드가 작동하며, 1:1 변수 매핑과 연산 비용 차이는 어떠한가?"
그리고, 기존 데이터 테이블의 뒤에 조회 값을 삭제 덮어쓰기 없이 연이어 덧붙여 누적하고 싶을 때 꽂아야 하는 지시어를 숙지하고 있어야 정밀 정산 장표를 구현합니다.

**CORRESPONDING FIELDS 의 런타임 명세 실시간 비교 스캔 오버헤드와, 개별 변수 바인딩 `INTO (v1, v2)` 1:1 결선, 그리고 INTO 와 APPENDING 의 메모리 갱신 정합성 차이를 규명하는 기술**이 필요합니다. 그것이 **INTO 대상 결선**의 완수입니다.

### 무엇인가

#### 1. INTO CORRESPONDING FIELDS OF TABLE (실시간 명칭 매핑 스캔)
- **메타 스캔 오버헤드**: **이 지시어는 DB 에서 긁어온 필드 목록과 목적지 구조체의 필드 목록을 실시간으로 대조해 '동일한 철자 이름' 을 가진 칸으로 데이터를 실시간 매핑 분배한다. 앞서 배운 `MOVE-CORRESPONDING` 과 똑같은 런타임 메타 스캔 비용을 뿜어내므로, 대량 트랜잭션 쿼리 시에 이 CORRESPONDING 을 남발하면 데이터 버퍼링 성능이 심각하게 지체된다. 필드 순서와 개수가 딱 맞다면 CORRESPONDING 을 빼고 다이렉트 `INTO TABLE` 로 받아야 고속 복제가 완수된다.**

#### 2. INTO ( gv_1, gv_2 ) (개별 변수 결선)
- 구조체 변수 없이 낱개 변수에 데이터를 직접 담는다. **반드시 쿼리의 SELECT 필드 나열 순서와 괄호 속의 변수 배선 순서가 1:1 로 정확히 물리 일치해야 한다.** 순서가 어긋나면 엉뚱한 변수에 데이터 비트가 쑤셔 박혀 값이 깨진다.

#### 3. INTO TABLE vs APPENDING TABLE (덮어쓰기 vs 덧붙이기)
- **`INTO TABLE`**: 테이블의 기존 메모리 Body 적재 내용을 깨끗이 **지우고(Clear)** 새로 긁어온 데이터를 원샷 인서트한다.
- **`APPENDING TABLE`**: **기존 적재된 레코드는 1줄도 다치지 않게 무결 보존하고, 그 꼬리 아랫줄에 연이어 조회 데이터를 누적(Append)** 시킨다. (월별 분할 조회 결산 누적에 필수적이다.)

### 어떻게 확인하는가

CORRESPONDING 과 APPENDING 을 사용해 데이터를 적재하는 단계를 검증한다.

```abap
REPORT zhello_into_target.

DATA: BEGIN OF gs_simple,
        carrid TYPE sflight-carrid,
        connid TYPE sflight-connid,
      END OF gs_simple,
      gt_simple LIKE TABLE OF gs_simple.

" 1. [★ CORRESPONDING FIELDS OF 기동: 이름 일치 필드 자동 매핑 적재]
"    (주의: 런타임 이름 스캔 비용이 수반되므로 대용량 시 절제 수호!)
SELECT carrid connid FROM sflight
  INTO CORRESPONDING FIELDS OF TABLE gt_simple
  WHERE carrid = 'KE'
  UP TO 3 ROWS.

" 2. [★ APPENDING TABLE 기동: 기존 KE 3건을 보존하고 LH 2건을 꼬리에 연이어 덧붙이기!]
SELECT carrid connid FROM sflight
  APPENDING TABLE gt_simple
  WHERE carrid = 'LH'
  UP TO 2 ROWS.

" lines( gt_simple ) = 5건! (KE 3건 + LH 2건 누적 보존 완료!)
WRITE: / '총 적재 건수:', lines( gt_simple ).
```

#### 체험/시뮬레이터 설계 (Host Variable 바인딩 렌즈)
- **프로세스 플로우**:
  1. 학습자가 [sflight carrid 컬럼] 과 [gt_simple 램 서랍] 을 본다.
  2. [CORRESPONDING 칩] 을 구동한다. [스캔 돋보기] 가 켜져 서랍의 carrid 가 DB 의 carrid 와 일치하는지 철자를 매칭하느라 지체되는 비주얼을 확인한다.
  3. 이어서 [APPENDING 스위치] 를 켜자, 기존 KE 데이터가 든 서랍 아래에 LH 데이터가 연이어 적재되는 모션을 본다. 
  4. 만약 [INTO TABLE] 로 스위칭하면, 기존 서랍이 쿵 떨어지며 비워지고 새 데이터로 채워지는 정합성 피드백을 감상한다.
- **상태 및 데이터**:
  - `INTO (gv_1, gv_2) 개별 변수 대입 시 SELECT 순서와 변수 타입을 다르게 꼬아 둔 상태` -> 런타임 결과: `Data corruption. Type mismatch during INTO assignment` 하이라이트.
- **피드백**: CORRESPONDING 은 편리하나 이름 대조 비용이 상주하며, 누적 결산 시에는 APPENDING 이 답임을 체득한다.

### 실수/주의

- **대용량 이관 루프 내부에서 데이터가 계속 초기화되어 날아가는 버그를 만났는데, 알고 보니 루프 안에서 쿼리 시 APPENDING TABLE 대신 INTO TABLE 을 기입해 매번 이전 건을 지워버린 실수**:
  - 데이터 유실 장애를 낳으므로, 누적 정적 적재 시에는 반드시 **`APPENDING`** 단어를 확인해 수호해야 합니다.

### 정리

- **`INTO CORRESPONDING FIELDS`** 는 이름이 일치하는 필드끼리 엮어 담아 주지만, **`실시간 명칭 매핑 스캔 비용`** 을 동반한다.
- **`INTO (gv_1, gv_2)`** 낱개 변수 대입 시에는 **`필드 나열 순서와 변수 배선의 1:1 물리 매칭`** 이 구국 철칙이다.
- 기존 램 테이블 데이터를 수호하며 조회 데이터를 누적 접착할 때는 **`APPENDING TABLE`** 을 선고한다.

---

## CH08-L05 - WHERE 상세 — 연산자와 wildcard

### 왜 필요한가

INTO 대상 결선 제어까지 완료했다.
이제 WHERE 조건절에 로컬 변수 대입 시 격발되는 '하드 파싱 오버헤드와 SQL Injection' 보안 및 연산 튜닝이 장벽입니다.
- " WHERE carrid = gv_carr 와 같이 아바 로컬 변수를 쿼리에 대입했다. 
DBI 는 이 로컬 변수를 내부적으로 어떻게 변환하여 DB 에 쏘며, 왜 이 바인딩이 SQL Injection 해킹 공격을 원천적으로 걸러내는가?"
그리고, 패턴 매칭 `LIKE '07%'` 기동 시 와일드카드 `%` 와 `_` 의 물리적 스캔 크기 판정 차이를 명세해 두어야 정밀한 조건 조작이 완성됩니다.

**Host Variable 이 DBI 를 경유해 바인드 변수(? 플레이스홀더)로 파싱되는 물리 보안 기작과, SQL Injection 차단 원리, 그리고 BETWEEN/LIKE/IN/IS NULL 4대 조건 연산자의 물리 처리 정합성을 수호하는 기술**이 필요합니다. 그것이 **WHERE 조건 제어**의 완수입니다.

### 무엇인가

#### 1. Host Variable 의 Bind Option 파싱 (보안과 성능의 핵심)
- **Host Variable (호스트 변수)**: Open SQL 쿼리 우변에 지칭해 대입하는 아바 로컬 변수(`gv_carr`)다.
- **바인드 변수 (? 플레이스홀더) 변환**: **Open SQL 을 쏘면, DBI 번역기는 gv_carr 의 실제 값('KE')을 SQL 문장에 문자열로 직접 쑤셔 넣지 않는다. `SELECT * FROM sflight WHERE carrid = ?` 와 같이 물음표 플레이스홀더(Placeholder)로 쿼리 뼈대를 통째 파싱해 DBMS 에 먼저 보낸다. 실제 값 'KE' 는 바인딩 파라미터 메모리 레지스터를 통해 따로 안전하게 밀어 넣는다. (이로 인해 얻는 2대 혜택은 다음과 같다.)**
  - **SQL Injection 원천 차단**: 사용자가 인풋 창에 악의적인 SQL 명령어(`'KE' OR 1=1`)를 주입하더라도, DB 엔진은 이를 SQL 명령이 아닌 오직 'carrid 컬럼의 순수 매칭 문자열 값' 자체로만 격리 인식하므로 해킹이 원천 봉쇄된다.
  - **Soft Parsing (소프트 파싱)**: DB 가 동일한 쿼리 뼈대를 메모리(Shared Pool)에 이미 등록된 실행 계획으로 재사용하므로, 매번 쿼리를 새로 해석(Hard Parsing)하는 연산 부하가 사라져 속도가 극대화된다.

#### 2. BETWEEN · IN · LIKE · IS NULL 4대 조건식
- **`LIKE '07%'` vs `'07_'`**: `%` 는 0개 이상의 임의 길이 글자 매칭이고, `_` 는 **단 1글자**만을 지칭하는 고정 폭 패턴 매칭이다.
- **`IS NULL`**: DB 테이블의 컬럼 메모리 공간에 값이 미기입(Null)된 뇌사 레코드만을 발라낸다.

### 어떻게 확인하는가

호스트 변수를 조건식에 바인딩하고 패턴 연산자들을 벼려 조회하는 코드를 검증한다.

```abap
REPORT zhello_where_detail.

DATA: gv_carr TYPE sflight-carrid VALUE 'KE',
      gt_data TYPE TABLE OF sflight.

" 1. [★ 호스트 변수 gv_carr 기동 - DBI 가 ? 바인드 변수로 파싱해 SQL Injection 철통 차단!]
" 2. [ BETWEEN 범위, IN 목록, LIKE 패턴 3대 조건 결합! ]
SELECT * FROM sflight
  INTO TABLE gt_data
  WHERE carrid = gv_carr " Host variable 바인딩!
    AND fldate BETWEEN '20260101' AND '20260630' " 상하 범위 지정
    AND planetype IN ('747-400', '380-800') " 특정 장비 목록
    AND connid LIKE '07_'. " 3자리 중 앞 07로 시작하고 뒤는 딱 1글자만! (예: 070, 071)

IF sy-subrc = 0.
  WRITE: / '정밀 필터 스캔 건수:', sy-dbcnt.
ENDIF.
```

#### 체험/시뮬레이터 설계 (Host Variable 바인딩 렌즈)
- **프로세스 플로우**:
  1. 학습자가 [아바 입력창] 과 [DBI 바인드 가이드], [DB SQL 실행계획실] 을 본다.
  2. 입력창에 악의적인 [KE OR 1=1] 을 친다.
  3. [DBI 바인드 가이드] 가 이를 가로채 `carrid = ?` 라는 [투명 플라스틱 SQL 뼈대] 만 빚어서 [실행계획실] 로 먼저 던진다. 계획실은 뼈대를 보고 재사용 승인을 낸다.
  4. 이어서 [KE OR 1=1] 덩어리를 쌩 데이터 칩으로 포장해 물음표 자리에 찰딱 끼워 스캔하자, 쿼리가 변조되지 않고 순수 문자 검색으로 기각 정화되어 초록불이 들어오는 보안 격리 피드백을 감상한다.
- **상태 및 데이터**:
  - `LIKE 뒤의 문자 패턴에 와일드카드를 생략하여 단순 일치 EQ 비교처럼 작동해 데이터 스캔이 누락된 상태` -> 런타임 결과: `sy-subrc = 4. Pattern match zero` 하이라이트.
- **피드백**: 호스트 변수는 ? 바인딩 처리를 거쳐 하드 파싱 억제와 SQL Injection 철통 보안의 영웅임을 인지한다.

### 실수/주의

- **modern escape 문법( @gv_carr )을 이 classic Open SQL 단원에서 혼용해 빌드 기각당하는 실수**:
  - 골뱅이(`@`) 바인딩은 CH19 에서 배울 현대식 아바 구문 전용 스펙이므로, classic 구문에서 골뱅이를 적으면 컴파일 즉사 에러를 맞이합니다.
  - **본 classic 챕터에서는 골뱅이 없이 쌩 변수명만 적어 수호해야 합니다.**

### 정리

- Open SQL WHERE 절의 로컬 변수(**`Host Variable`**)는 **`바인드 변수 (? 플레이스홀더)`** 로 자동 변환 파싱된다.
- 이 바인드 변수 기작은 **`SQL Injection 해킹 공격을 원천 차단`** 하고, DB 단의 **`Soft Parsing`** 성능을 이끈다.
- **`BETWEEN`** 은 범위 스캔, **`IN`** 은 목록 매칭, **`LIKE`** 는 와일드카드 패턴 매칭(`%` 는 가변, `_` 는 딱 1글자)을 소화한다.

---

## CH08-L06 - 키 필드 vs 일반 필드 · Index 기초

### 왜 필요한가

WHERE 정밀 조건식까지 완수했다.
이제 테이블 규모가 수백만 건 이상으로 확장될 때 격발되는 '조회 검색 엔진 속도(Index vs Full Scan)' 가 장벽입니다.
- " carrid = 'KE' 로 조회하는 것과 planetype = '747-400' 으로 조회하는 것은 DB 물리 디스크 헤더가 스캔하는 방식에서 어떤 엄청난 속도 성능 차이를 유발하는가?"
일반 컬럼 조회 시 DB 가 테이블의 첫 블록부터 끝 블록까지 하드디스크를 다 긁어내는 Full Table Scan 을 단행하여, 쿼리 응답 대기 시간이 분 단위로 길어지다 세션이 굳어 덤프로 튕기는 장애를 목격합니다.

**Primary Key 기반의 정렬 트리 이진 고속 스캔(O(log N))과, 일반 필드 조회 시 겪는 Full Table Scan O(N) 병목의 실체, 그리고 S/4HANA 인메모리(Columnar DB)의 Secondary Index 설계 제약 기술**이 필요합니다. 그것이 **키 인덱스 성능 설계**의 완수입니다.

### 무엇인가

#### 1. Primary Key Index 스캔 vs Full Table Scan
- **Primary Key 스캔**: **DB 테이블은 생성(SE11) 시점에 이미 지정한 키 필드(`MANDT+DAN+MUL`)를 기준으로 디스크 상에 B-Tree 정렬 구조의 인덱스 색인지가 물리 적재된다. 키로 조회를 날리면 DB 는 B-Tree 인덱스 노드를 2~3회만 훑어 다이렉트로 해당 행의 디스크 주소지를 집어내므로 O(log N) 에 근접한 초고속 단건 탐색을 격발한다.**
- **Full Table Scan (느림)**: **키가 아닌 일반 필드(`planetype`)로 조건을 쏘면, 색인 장부가 없다. DB 엔진은 이 데이터가 테이블의 어디에 묻혀 있는지 알 길이 없으므로, 하드디스크 상에 ZTABLE 이 차지하는 수백만 건의 첫 물리 블록부터 맨 마지막 블록 끝 줄까지 쌩으로 다 긁어서 대조해 가려낸다(O(N)). 디스크 I/O 가 폭증하고 CPU 메모리가 오버플로되어 세션 타임아웃 뇌사를 자초한다.**

#### 2. Secondary Index (보조 인덱스)와 S/4HANA 컬럼 DB 제약
- **보조 인덱스**: 일반 필드인 `planetype` 에 대고 SE11 에서 보조 색인장(Secondary Index)을 추가 개설하면, DB 가 해당 필드만의 B-Tree 정렬 복제본을 따로 만들어 관리해 조회를 고속화한다.
- **S/4HANA 제약**: **S/4HANA (HANA Database)는 행 단위가 아닌 컬럼 단위로 데이터를 디스크에 적재하는 인메모리 Columnar DB 다. 컬럼 단위 적재 덕에 보조 인덱스가 없어도 자체 스캔이 무지막지하게 빠르다. 오히려 무분별하게 보조 인덱스를 많이 만들어두면, 데이터를 인서트/업데이트할 때마다 여러 인덱스 트리들을 실시간으로 재구조화하느라 쓰기 성능만 깎아먹으므로, S/4HANA 에선 보조 인덱스 개설을 극히 절제 통제하는 Basis 룰을 준수한다.**

### 어떻게 확인하는가

키 조회와 일반 필드 조회의 물리 동작 차이를 비교 검증한다.

```abap
REPORT zhello_index_speed.

DATA: gs_flight TYPE sflight,
      gt_flight TYPE TABLE OF sflight.

" 1. [★ 초고속 성능 수호: Primary Key 3요소를 완벽 조립해 B-Tree 인덱스 고속 검색 격발!]
SELECT SINGLE * FROM sflight
  INTO gs_flight
  WHERE carrid = 'KE' AND connid = '0701' AND fldate = '20260623'.

IF sy-subrc = 0.
  WRITE: / '키 조회 속도: O(log N) - B-Tree 인덱스 탐색 성료.'.
ENDIF.

" 2. [★ 성능 저하 위험: 키가 아닌 일반 필드 planetype 로 쌩 조건 조회!]
"    (주의: 데이터가 수백만 건일 경우 Full Table Scan O(N) 병목 유발!)
SELECT * FROM sflight
  INTO TABLE gt_flight
  WHERE planetype = '747-400'.

IF sy-subrc = 0.
  WRITE: / '일반 필드 조회 건수:', sy-dbcnt.
ENDIF.
```

#### 체험/시뮬레이터 설계 (키 조건 렌즈)
- **프로세스 플로우**:
  1. 학습자가 [B-Tree 키 정렬 장부] 와 [수백만 행 디스크 블록판] 을 본다.
  2. [Key 조건 carrid = KE 칩] 을 꽂는다. [조건 렌즈] 가 장부의 3단 가지를 타고 찰칵 찰칵 3번 쪼갠 뒤, 디스크 블록판의 Ke 비행 노선 행 주소를 정확히 저격해 0.0001초 만에 뽑아내는 O(log N) 모션을 본다.
  3. [일반 필드 planetype = 747 칩] 으로 스위칭한다. 렌즈가 꺼지고, [디스크 빗자루] 가 기판의 1번 행부터 수백만 행 끝까지 쌩으로 빗자루질하며 하드디스크를 다 쓸어 담느라 연기가 뿜어져 나오는 모션을 감상한다.
- **상태 및 데이터**:
  - `HANA DB 환경에서 쌩 일반 컬럼마다 성능 보조 인덱스를 10개 이상 마구잡이로 중복 개설해 둔 상태` -> 런타임 결과: `Database write latency spikes during INSERT/UPDATE operations` 하이라이트.
- **피드백**: 키 검색은 B-Tree 지름길 탐색이며, 일반 필드 조회는 Full 스캔 위험을 내포하므로 튜닝은 키 우선 결선이어야 함을 체득한다.

### 실수/주의

- **Secondary Index 를 개설하면서, 인덱스 컬럼의 순서를 WHERE 절의 사용 빈도와 완전히 거꾸로 배열하여 인덱스가 씹히는 오작동 유발**:
  - 복합 인덱스는 선두 컬럼이 WHERE 절에서 누락되면 B-Tree 엔진이 인덱스를 타지 못하고 무용지물이 됩니다.
  - **인덱스 복합 키의 맨 첫 번째 필드는 무조건 쿼리에 가장 자주 쓰이는 핵심 필드로 수호해야 합니다.**

### 정리

- 테이블의 **`Primary Key`** 로 조회를 날리면 DB 의 **`B-Tree 인덱스`** 가 격발되어 초고속 단건 검색을 소화한다.
- 일반 필드 조건 조회는 색인 장부가 없어 테이블의 처음부터 끝까지 다 긁어내는 **`Full Table Scan (O(N))`** 병목을 낳는다.
- S/4HANA 의 **`Columnar DB (HANA)`** 환경에서는 자체 연산 속도가 빨라 **`Secondary Index 개설을 지극히 절제 차단`** 하는 것이 쓰기 성능 수호의 기초다.

---

## CH08-L07 - 조회 실패와 MESSAGE (기초)

### 왜 필요한가

조회 속도 최적화 설계까지 완수했다.
이제 테이블 조회 실패 시 프로그램이 빈 깡통 메모리를 쥐고 굴러가다 터지는 'Dirty Buffer 오동작' 과 예외 상황 전파가 마지막 장벽입니다.
- " ZGUGUDAN 에서 5단을 조회했는데, 데이터가 존재하지 않아 sy-subrc = 4 가 떴다.
이 실패 상황을 방치하면 후속 LOOP AT 이나 연산에서 어떤 정합성 파손 버그가 터지며, 사용자에게 S 와 I 타입 메시지로 예외를 알려 주는 물리 흐름은 무엇인가?"
이 예외 제어 기작을 완수해야만, 데이터가 0건일 때 흐름을 즉시 차단 기각하는 전산 안전 벨트를 조립할 수 있습니다.

**sy-subrc <> 0 실패 조건 감지 및 후속 로직 강제 기각(Exit/Return) 가드와, MESSAGE TYPE 'S'(상태바) 및 'I'(팝업)의 화면 격발 정합성을 수호하는 기술**이 필요합니다. 그것이 **조회 예외 및 메시지 제어**의 완수입니다.

### 무엇인가

#### 1. sy-subrc <> 0 예외 차단 가드 (예외 분기)
- **Dirty Buffer 방어**: **조회 쿼리 격발 후 `sy-subrc` 가 `0` 이 아닌 `4` (조회 결과 없음)를 뱉었음에도 가드 없이 후속 LOOP AT 이나 MODIFY 연산을 기동하면 안 된다. 램 내부 테이블에 잔존해 있던 이전 회차의 더러운 버퍼 값(Dirty Data)이 연산에 뒤섞여 엉뚱한 정산 값을 찍어내는 침묵의 살인마 버그를 낳는다. 반드시 `IF sy-subrc <> 0.` 조건문 게이트를 세워, 실패 시 즉시 `EXIT.` 나 `RETURN.` 으로 프로그램 후속 연산 흐름을 강제 격리 종료시켜야 한다.**

#### 2. MESSAGE TYPE 'S' 와 'I' (사용자 예외 전파)
- **`MESSAGE '알림' TYPE 'S'`**: **화면 하단 상태바(Status bar)에 초록색 한 줄 라인으로 예쁜 메시지를 띄우는 클린 상태바 알림이다. 사용자의 업무 흐름을 끊지 않고 얌전하게 알려줄 때 수호한다.**
- **`MESSAGE '알림' TYPE 'I'`**: **화면 중앙에 둥근 느낌의 정보 아이콘과 함께 단단한 [확인] 단추가 박힌 독립 팝업창(Information dialog)을 강제 기동하는 단절 알림이다. 사용자가 반드시 이 경고를 읽고 마우스로 클릭해 승인해야만 다음 화면으로 넘어가게 락(Lock)을 채운다.**

### 어떻게 확인하는가

조회 실패 조건을 판정해 메시지 팝업을 격발하고 흐름을 격리하는 코드를 검증한다.

```abap
REPORT zhello_message_gate.

DATA: gs_line TYPE zst_line,
      gt_gugu TYPE TABLE OF zst_line.

" 1. [★ ZGUGUDAN 에 5단이 없으므로 무조건 sy-subrc = 4 실패 격발!]
SELECT * FROM zgugudan
  INTO TABLE gt_gugu
  WHERE dan = 5.

" 2. [★ 중요: 실패 시 즉각 가드 게이트를 올려 후속 뇌사 연산을 강제 차단!]
IF sy-subrc <> 0.
  " 3. [ TYPE 'I' 정보성 팝업창을 띄워 사용자에게 수동 확인 락 채우기! ]
  MESSAGE '5단 구구단이 데이터베이스에 존재하지 않습니다.' TYPE 'I'.
  EXIT. " 후속 LOOP 로직 완전 격리 기각!
ENDIF.

" ( sy-subrc = 0 일 때만 내려오는 안전 청정 지대! )
LOOP AT gt_gugu INTO gs_line.
  WRITE: / gs_line-dan, 'x', gs_line-mul, '=', gs_line-result.
ENDLOOP.
```

#### 체험/시뮬레이터 설계 (빈 결과와 MESSAGE 피드백)
- **프로세스 플로우**:
  1. 학습자가 [조회 결과 = 0건 (sy-subrc = 4)] 과 [후속 LOOP 기어], 그리고 [MESSAGE 통제판] 을 본다.
  2. [예외 가드 = OFF] 상태에서 가동하자, 0건임에도 기어가 억지로 돌아 이전 회차의 엉뚱한 정훈영 정보 램 버퍼를 읽어 계산 결과를 찍는 버그 화면이 뿜어진다.
  3. [예외 가드 = ON] 스위치를 켠다. sy-subrc = 4 가 감지되자마자 [기어 락 쇠사슬] 이 내려와 기어를 세우고, [MESSAGE 통제판] 에서 [TYPE I 팝업 렌즈] 가 화면 한복판에 촥 뜨며 클릭 전까지 세션을 묶어주는 무결 예외 피드백을 감상한다.
- **상태 및 데이터**:
  - `조회 실패 메시지 타입을 TYPE E 로 지정해 경고창 기동 시 프로그램 자체가 강제 파괴 셧다운된 상태` -> 런타임 결과: `Processing terminated. Hard error TYPE E triggered outside screen PAI` 하이라이트.
- **피드백**: 조회 실패는 전산 가드로 걸러야 하며, 상황에 맞는 S/I 메시지로 사용자 흐름을 조율해야 정합성이 완수됨을 배운다.

### 실수/주의

- **단순 데이터 미조회 상황인데 메시지 타입을 폭사 경고인 TYPE 'A' (Abend) 나 'X' (Dump) 로 지정하여 시스템 터미널 화면 자체를 폭파 격리하는 하드 에러 유발**:
  - 사용자는 튕김 현상으로 작업 중이던 모든 데이터가 소멸하는 분노를 겪게 됩니다.
  - **단순 미존재 알림은 무조건 `S` 나 `I` 타입을 사수해야 합니다.**

### 정리

- 쿼리 실패(**`sy-subrc <> 0`**) 시 후속 처리를 가드 없이 단행하면, 이전 더러운 메모리 버퍼(**`Dirty Buffer`**)를 참조해 꼬이는 대형 참사가 터진다.
- 실패 감지 즉시 **`IF 가드 게이트`** 를 기동해 `EXIT` 나 `RETURN` 으로 흐름을 강제 기각 수호한다.
- 사용자 알림 전파 시, 상태바 알림은 **`TYPE 'S'`**, 독립 확인 팝업창 락 기동은 **`TYPE 'I'`** 로 격발한다.
