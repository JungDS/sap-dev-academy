# CH33_REWRITE - AMDP / ADBC / Pushdown v1

> 목적: `content/abap/CH33`의 5개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH33 전체 설계

CH33의 한 문장 목표는 "HANA DB 에 최적화된 Code Pushdown 의 4대 통로(Open SQL, CDS View, AMDP, ADBC)의 우선순위를 확립하고, ADT 전용 에디터에서만 생성되는 AMDP 클래스의 골격(`if_amdp_marker_hdb`, `BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT`), DB 버퍼 우회 제약 및 `OPTIONS READ-ONLY` 최적화, Native SQL인 ADBC(`CL_SQL_STATEMENT`)의 MANDT 자동 미지원 및 SQL Injection 보안 가드를 장착한다"이다.

IT 비전공자 입문자는 SAP GUI 클래스 빌더(`SE24`)에서 AMDP 클래스를 수정하려다 잠겨 있는 화면을 보고 당황하고, 조회용 AMDP 메서드 정의 시 `OPTIONS READ-ONLY` 구문을 누락해 HANA DB 병렬 읽기 성능 최적화를 놓친다.
또한, Native SQL API 인 ADBC 사용 시 `MANDT` 클라이언트 자동 격리 락이 기동되지 않음을 간과하여 타 테넌트 고객사 데이터를 강제 오염 노출하는 대형 전산 정합성 사고를 터트리고, 사용자 입력 텍스트를 SQL 문에 문자열 직접 결합으로 얹어 해커에게 데이터가 몽땅 지워지는 SQL Injection 침투를 허용한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **Code-to-Data 패러다임**: 데이터를 램으로 끌고 오던 Data-to-Code 시대의 폐해를 고발하고, 연산을 DB 단으로 밀어 내리는 Code Pushdown 우선순위(Open SQL -> CDS -> AMDP -> ADBC) 정립.
2. **AMDP HDB 마커**: `if_amdp_marker_hdb` 마커 인터페이스 부착과, 본문이 SQLScript 임을 선포하는 `BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT` 시퀀스 수립.
3. **OPTIONS READ-ONLY**: SELECT 연산 전용 마킹을 통해 HANA 병렬 성능과 Read Replica 처리를 유인하고, AMDP 의 DB Buffer Bypass 리스크 명세.
4. **ADT 편집 제약**: AMDP 클래스는 GUI 쌩 수정을 원천 차단하고 오직 **Eclipse ADT** 에서만 작성이 조립되는 물리 개발 환경의 특징 교육.
5. **ADBC Native SQL**: `CL_SQL_STATEMENT` API 활용법을 제시하고, 자동 클라이언트 격리가 무력화되므로 **`WHERE MANDT = :sy-mandt`** 수동 락 기입을 의무화.
6. **SQL Injection 방어**: 문자열 직접 삽입(String Concatenation)을 영구 차단하고, 파라미터 바인딩을 통해 데이터베이스 보안 펜스 구축.
7. **DB 종속성 스캔**: AMDP/ADBC 사용 시 다른 벤더 DB 이전이 차단되는 종속성과, 런타임 지원 여부를 점검하는 **`CL_ABAP_DBFEATURES=>CALL_AMDP_METHOD`** 동적 검문 구축.

---

## CH33-L01 - DB Pushdown 판단 기준

### 왜 필요한가

우리가 이전 튜닝 단원에서 "데이터를 램으로 다 퍼 올려서 Loop 돌려 집계하지 말고, DB 안방 엔진에게 집계 연산(GROUP BY)을 떠넘겨라(Code Pushdown)" 는 성능의 위대한 황금률을 배웠다.
그런데 이 코드 푸시다운을 ABAP 에서 실제로 코딩해 얹으려니 머릿속이 복잡해진다.
- " 보조 뷰(View)를 만들어서 OData 웹 서비스로 노출하라는데, CDS View 를 짜야 하는가? AMDP 프로시저를 빌드해야 하는가? 아니면 그냥 쌩 Native SQL 문장을 날려야 하는가?"
성격과 쓰임새를 파악하지 않은 채 무작정 "최신 기술이니까 AMDP 로 다 짜자!" 하고 모든 예약 조회를 AMDP 로 장착해 버리면, 내 예약 프로그램은 오직 HANA 데이터베이스 장비 하에서만 돌아가는 '특정 벤더 종속형 노예 시스템' 으로 전락한다. 훗날 회사가 다른 Oracle 이나 MS-SQL 클라우드로 시스템 이전을 결정할 때 내 Z코드는 쓰레기 컴파일 에러를 뿜으며 사망한다.

**코드 푸시다운의 4대 확장 통로(Open SQL -> CDS View -> AMDP -> ADBC)의 OCP/클라우드 친화성 우선순위를 정확히 체득하고, 가장 이식성이 높은 표준 도구부터 순차적으로 필터링해 낙찰받는 판단 기술**이 필요하다. 그것이 **DB Pushdown 판단 기준**의 확립이다.

### 무엇인가

#### 1. Code-to-Data (코드 투 데이터 패러다임)
- 데이터를 네트워크 선을 타고 ABAP 서버 램으로 퍼 올려 가져오지 말고, 비즈니스 계산 연산 로직 자체를 데이터가 잠자고 있는 데이터베이스 안방으로 직접 내려보내 데이터가 상주한 그 자리에서 초고속 압축 연산하고 결과만 수송받아오자는 현대적인 성능 패러다임이다. (HANA DB 의 꽃이다.)

#### 🧭 [ Code Pushdown 4대 우선순위 이정표 명세 ]
- *우리는 성능 가속 요구를 맞이할 때마다, 아래의 4단계 정석 순서를 거쳐 최적의 도구를 선정한다.*

```text
[1순위] Open SQL / Modern SQL (표준 아바 쿼리) :
   가장 안전하고 DB 이식성이 100% 보장되는 1순위 도구다. SUM, GROUP BY, CASE WHEN 식 등 
   대부분의 집계 연산은 Modern SQL 선에서 0.01초 만에 안전 종결된다.
   │
   ├── [표준 SQL 로는 연산이 불가한 다중 가공/재사용 뷰 계층이 필요하다면?]
   ▼
[2순위] CDS View (코어 데이터 서비스 뷰) :
   웹 Fiori 나 타 프로그램에서 공통 재사용할 정밀 비즈니스 데이터 모델 뷰 계층을 빚을 때 채택한다.
   │
   ├── [CDS 나 SQL 로는 짤 수 없는 절차적 루프, 임시 테이블 순회 알고리즘이 필요하다면?]
   ▼
[3순위] AMDP (ABAP Managed Database Procedure) :
   HANA 전용 SQLScript 프로시저 언어를 사용하여 복잡한 알고리즘을 DB 안방 엔진에 직접 구동시킨다. (DB 종속성 발생!)
   │
   ├── [어떠한 방법으로도 안 되고, 특정 DB 고유 시스템 테이블이나 커널을 쌩으로 찔러야 한다면?]
   ▼
[4순위] ADBC / Native SQL (쌩 Native SQL 통로) :
   가장 낮은 수준에서 DB 엔진에 직접 말을 거는 최후의 보루다. 구문 검사도 안 되고 위험도가 극상이다.
```

### 어떻게 확인하는가

상황 미션에 따라 우선순위 판별 트리를 기동하여 1순위를 낙찰받는 시나리오를 검증한다.

```text
Q1. 10만 건 예매 내역에서 VIP 고객 여부에 따라 금액을 10% 감면해 합산한 결과만 한 줄 수령하고 싶은가?
   -> Yes: BAdI 나 AMDP 클래스를 새로 만들 필요 없이, 쌩 Open SQL 내에서 
           SELECT SUM( CASE WHEN status = 'VIP' THEN price * 0.9 ELSE price END ) AS total_price 
           문장 하나로 1순위 고속 해결 낙찰!

Q2. SQL 문장 하나로는 도저히 짤 수 없는, 루프를 돌며 임시 행을 만들고 특정 DB 함수를 격발하는 절차 계산이 필요한가?
   -> Yes: AMDP 클래스를 생성하여 SQLScript 절차 코드로 3순위 해결 낙찰!
```

#### 체험/시뮬레이터 설계 (Code Pushdown 내려보내기 시뮬)
- **프로세스 플로우**:
  1. 학습자가 [100만 건 seatsocc 데이터] 와 [ABAP 램 영역], [HANA DB 영역] 을 본다.
  2. [Data-to-Code] 를 누르자, 100만 개 데이터 화물차가 네트워크 케이블을 타고 ABAP 램으로 덜덜덜덜 배달되어 와 램이 폭사하는 장면을 목격한다.
  3. [Code-to-Data] 로 레버를 올린다. 
  4. 4대 도구 중 [Open SQL SUM] 카드를 꽂아 격발한다. DB 단에서 계산이 0.1초 만에 끝나고 압축된 '1줄 결과 칩' 만 가볍게 ABAP 서버로 배달되는 초고속 렌더링 피드백을 감상한다.
- **상태 및 데이터**:
  - `단순 SQL JOIN 으로 충분한 로직을 무조건 AMDP 로 설계해 빌드한 상태` -> 런타임 결과: `Database dependent lock. Poor portability index. System warnings` 하이라이트.
- **피드백**: 푸시다운은 무조건 최신 기술(AMDP)을 난사하는 기교가 아니라, 표준 계약과 이식성 우선순위를 지키는 정석 판단임을 깨닫는다.

### 실수/주의

- **"속도가 빠르니까" 라는 핑계로, 모든 간단한 마스터 쿼리(SELECT SINGLE)까지 모조리 AMDP 프로시저로 코딩**:
  - AMDP 는 데이터베이스 커널 단을 직접 소집하므로 컴파일/호출 오버헤드가 크며, 뒤에서 배울 테이블 버퍼(Buffering)를 무시하고 쌩 디스크를 긁어 오히려 성능이 더 느려지는 대참사를 겪는다.
  - **단건 조회는 무조건 표준 Open SQL 로 기재해야 한다.**

### 정리

- **`Code-to-Data`** 패러다임은 데이터를 가져오지 않고 로직을 데이터가 있는 DB 로 내려보낸다.
- 선택 우선순위는 **`Open SQL -> CDS View -> AMDP -> ADBC`** 순서로 내려간다.
- 위쪽 우선순위 도구들을 사용할수록 **`DB 이식성`** 과 시스템 안정성이 비약적으로 보장된다.

---

## CH33-L02 - AMDP 기본 구조

### 왜 필요한가

DB Pushdown 판단 지도를 확보했다.
이제 3순위 정석 도구인 'AMDP 프로시저 클래스' 를 실제 빚어내어 가동해야 한다.
- "표준 SQL 로는 연산 불가능한, 임시 테이블 변수를 선언하고 복잡한 행 순회 SQLScript 계산 처리를 DB 에서 직접 가동하고 싶다."
이 프로시저를 아바 상에서 엮으려니, 아바 클래스 문법 규칙과 DB SQLScript 규칙이 오염되어 충돌한다.
또한, AMDP 클래스 코드를 수정하려고 SAP GUI 클래스 빌더(`SE24`)를 켰는데, 수정 단추가 회색으로 완전히 잠겨 있어 소스 1글자도 타이핑할 수 없어 굳어버린다.

**클래스 선언부에 AMDP 전용 마커 인터페이스(if_amdp_marker_hdb)를 달고, 구현부에 BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT 징표를 박아주며, Eclipse ADT 환경을 통해 클래스를 컴파일 빌드해 내는 기술**이 필요하다. 그것이 **AMDP 기본 구조**의 설계다.

### 무엇인가

#### 1. AMDP (ABAP Managed Database Procedure)
- 아바 클래스 내부 구현 메서드 안방에 HANA DB 고유 SQLScript 언어 소스를 쌩으로 기재하여, 아바가 컴파일하고 관리(Managed)해 주는 데이터베이스 프로시저 기술이다.

#### 2. if_amdp_marker_hdb (AMDP 인식 배지)
- "이 아바 클래스는 데이터베이스 프로시저를 관리 보관하는 특수 용도의 AMDP 클래스다" 라고 아바 컴파일러에게 신고하는 마커 인터페이스(Marker Interface)다. (반드시 PUBLIC SECTION 에 박아 넣어야 작동한다.)

#### 3. BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT (프로시저 선포)
- 메서드 구현(Implementation) 헤더에 대고 적어주는 **프로시저 스위치**다.
- **이 구문이 적히는 순간, 해당 메서드 소스 본문 내벽 틈새에는 아바 문법(APPEND, LOOP, WRITE 등)을 기재할 수 없으며 오직 100% 순수한 HANA SQLScript(데이터베이스 고유 프로시저 언어)로만 작성해야 작동한다.**

#### 4. USING (사용할 테이블 선고)
- AMDP 메서드 구현 헤더 맨 꼬리에, 이 메서드 안방에서 쌩 SELECT 로 찌를 물리 DB 테이블명(예: `zbooking`)을 의무적으로 다 신고해 기재해야 한다. (안 적고 소스에서 부르면 컴파일 오류가 난다.)

#### ⚠️ [ AMDP OPTIONS READ-ONLY 마킹 의무 및 버퍼 우회 제약 명세 ]
- *HANA 성능 가속과 실무 컴파일 파손을 방지하는 정합성 펜스다.*
- **OPTIONS READ-ONLY**: **조회(Select)만 전담하는 AMDP 메서드 정의 시에는 반드시 이 읽기 전용 옵션을 대가리에 박아 선언해야 한다. 그래야 HANA DB 가 읽기 전용 복제본(Read Replica)이나 병렬 연산 슬롯에 안전하게 배분해 성능을 3배 이상 배가시키고, 다른 개발자가 본문에 수정 DML 을 쌩뚱맞게 추가해 트랜잭션 꼬임을 내는 참사를 사전 차단한다.**
- **DB 버퍼 우회 (Bypass Buffering)**: **AMDP 를 타는 순간 SAP 의 초고속 DB 버퍼링 메모리(Buffering) 셋업이 100% 통째 무력화 스킵된다. 무조건 실시간 물리 디스크를 긁으러 가므로, 자주 바뀌지 않고 캐싱되어야 할 환경 변수나 마스터 테이블은 절대로 AMDP 로 읽지 말고 Open SQL 로 읽는 것을 수호해야 한다.**

### 어떻게 확인하는가

마커 인터페이스와 READ-ONLY 옵션을 장착하고 SQLScript 프로시저를 빚는 클래스 소스를 검증한다.

```abap
" 1. [AMDP 클래스 정의부]
CLASS zcl_booking_amdp DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    " AMDP 마커 인터페이스 의무 장착!
    INTERFACES if_amdp_marker_hdb.
    
    TYPES: BEGIN OF ty_stats,
             concert_id TYPE zconcert-concert_id,
             total_seats TYPE i,
           END OF ty_stats,
           tt_stats TYPE STANDARD TABLE OF ty_stats WITH DEFAULT KEY.

    METHODS get_booking_stats
      IMPORTING VALUE(iv_concert) TYPE zconcert-concert_id
      EXPORTING VALUE(et_stats)   TYPE tt_stats
      " [★ 조회 전용 AMDP 메서드에 READ-ONLY 가드 의무 지정!]
      AMDP OPTIONS READ-ONLY. 
ENDCLASS.
```

```abap
" 2. [AMDP 클래스 구현부 - SQLScript 구문 전개]
CLASS zcl_booking_amdp IMPLEMENTATION.
  METHOD get_booking_stats BY DATABASE PROCEDURE FOR HDB
                           LANGUAGE SQLSCRIPT
                           " [★ 소스 본문에서 찌를 DB 테이블 zbooking 선고!]
                           USING zbooking.
    " 여기서부터는 아바 소스가 아님! 100% HANA SQLScript 문법 적용!
    " 파라미터는 앞에 콜론(:)을 얹어 바인딩!
    et_stats = SELECT concert_id, SUM( seats ) AS total_seats
                 FROM zbooking
                 WHERE concert_id = :iv_concert
                 GROUP BY concert_id;
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (AMDP 메서드 해부기)
- **프로세스 플로우**:
  1. 학습자가 SAP GUI [SE24 클래스 빌더 에디터 창]을 본다.
  2. [수정] 단추를 누르자 "AMDP classes can only be edited in Eclipse ADT" 에러 팝업과 함께 회색 락이 잠기는 물리 환경 제약을 본다.
  3. [Eclipse ADT 창] 으로 시선을 이동해 `BY DATABASE PROCEDURE` 칩을 클래스에 장착한다.
  4. [READ-ONLY 옵션 = OFF] 상태에서 SQLScript 본문에 `DELETE FROM zbooking;` 쌩 DML 공격 카드를 쑤셔 넣는다. DB 가 즉사하는 모션을 본다.
  5. [READ-ONLY 옵션 = ON] 을 켜자, DELETE 카드를 꽂는 순간 Eclipse 검사기에서 "DML not allowed in READ-ONLY procedure" 컴파일 에러 적색 밑줄이 쳐지며 안전하게 거절당하는 정합성 피드백을 감상한다.
- **상태 및 데이터**:
  - `USING zbooking 선고를 누락한 채 본문에서 zbooking 을 읽은 상태` -> 런타임 결과: `Database object ZBOOKING must be declared in USING clause` 하이라이트.
- **피드백**: AMDP 는 SAP GUI 가 아닌 Eclipse ADT 전용 기술이며, USING 선고와 READ-ONLY 옵션이 양대 안전 축임을 이해한다.

### 실수/주의

- **AMDP 메서드 파라미터 선언 시, VALUE(값 전달)를 생략하고 레퍼런스 Pass by Reference 로 선언**:
  - 데이터베이스 프로시저는 바다 건너 DB 커널 메모리 주소(Reference)를 직접 들여다볼 수 없으므로 무조건 값을 통째 복사해 전달받아야(VALUE) 기동한다.
  - VALUE 지정을 빠뜨리면 컴파일러가 즉각 컴파일 즉사 에러를 낸다.
  - **AMDP 파라미터는 무조건 VALUE(iv_param) 선언을 수호해야 한다.**

### 정리

- **`AMDP 클래스`** 는 반드시 Eclipse ADT 에서만 수정/작성할 수 있는 물리 제약이 걸려 있다.
- PUBLIC SECTION 에 **`if_amdp_marker_hdb`** 마커 인터페이스를 꼽아야 시작된다.
- 구현부 헤더에 **`BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT USING 테이블`** 을 선고한다.
- 조회 전용 메서드는 무조건 **`AMDP OPTIONS READ-ONLY`** 옵션을 박아 병렬 처리 가속을 사수한다.

---

## CH33-L03 - ADBC Native SQL

### 왜 필요한가

AMDP 로 프로시저 튜닝은 완료했다.
이번에는 4순위 최후의 수단인 'Native SQL 직접 전송' 통로 구축을 마주한다.
- " SAP 표준 Open SQL 이나 BAdI, AMDP 조차도 전혀 모르는, 오직 이 Oracle 이나 HANA 데이터베이스 고유 장비 칩만이 가진 특수 시스템 메모리(뷰)를 쌩으로 조회하고 싶다."
이 최후의 수단에서는 아바 컴파일러가 내 SQL 문장을 대신 문법 검사해 주지 않는다.
또한, Native SQL 은 내가 로그인한 회사(Client)를 식별하지 못해 아무 가드 없이 조회를 때렸다가는 다른 고객사의 기밀 정보까지 몽땅 유출/오염되는 대형 테넌트 붕괴 사고를 내며, 문자열을 쌩으로 이어 붙여 쿼리를 날렸다가 해커가 주입한 악성 문장(SQL Injection)에 의해 데이터 전체가 한순간에 지워지는 대참사가 도사린다.

**Native SQL 호출 전용 API 객체(CL_SQL_STATEMENT)를 조립하고, Native SQL 은 MANDT 필터를 안 챙겨주므로 수동으로 클라이언트 락(MANDT = :sy-mandt)을 기재하며, 파라미터 바인딩으로 SQL Injection 을 차단하는 기술**이 필요하다. 그것이 **ADBC Native SQL** 의 완수다.

### 무엇인가

#### 1. ADBC (ABAP Database Connectivity)
- 표준 Open SQL 을 거치지 않고, 특정 데이터베이스 고유의 날것(Native)의 SQL 문장을 텍스트 문자열에 실어 DB 엔진에 직접 쏘아 보내 연산하는 객체지향 API 클래스 모음이다. (구 레거시 `EXEC SQL ... ENDEXEC` 구문의 신형 API 판이다.)

#### ⚠️ [ Native SQL 의 MANDT 자동 미지원 및 수동 제한 필터링 명세 ]
- *다중 고객사(Multi-client) 테넌트 격리벽이 무너지는 최악의 보안 장애 지대다.*
- 우리가 평소에 쓰는 Open SQL 은 `SELECT * FROM zbooking` 이라고만 적어도 아바 엔진이 똑똑하게 꼬리에 `WHERE MANDT = '100'` 을 자동으로 심어 내 회사 예약만 발라내 준다.
- **오작동**: ADBC `execute_query( 'SELECT * FROM zbooking' )` 를 그대로 던진다.
- **이유**: **Native SQL 은 SAP 의 MANDT 규칙을 전혀 알지 못하는 쌩 데이터베이스 로우 엔진이므로, 클라이언트 구분을 싹 무시하고 100번(개발용), 200번(QA용), 800번(운영 실무용) 회사 예약 데이터 전체를 다 긁어 퍼 올리는 대참사를 유발하기 때문이다.**
- **방어선 (수동 기입)**: 반드시 Native SQL 문장 본문 틈새에 **`WHERE MANDT = ?`** 나 클라이언트 조건을 명시 기재하고 파라미터로 내 로그인 회사(`sy-mandt`) 값을 꽂아 격리 락을 수동으로 채워야 보안이 사수된다.

#### ⚠️ [ SQL Injection 해킹 리스크 및 Parameter Binding 방어 명세 ]
- *데이터베이스 무단 유출/삭제 해킹을 격퇴하는 철통 보안 수칙이다.*
- 사용자가 텍스트 창에 입력한 값(`lv_user_input`)을 Native SQL 문자열에 `SELECT * FROM ... WHERE id = '` + `lv_user_input` + `'` 와 같이 쌩으로 이어 붙여 전송(String Concatenation)한다.
- **해킹 유발**: 해커가 입력창에 **`' OR '1' = '1`** 이나 **`'; DELETE FROM zbooking; --`** 을 적어 보내는 순간, Native SQL 문장은 `WHERE id = '' OR '1' = '1'; DELETE FROM zbooking;` 으로 돌변하여 테이블의 100만 건 데이터를 한 번에 밀어버린다.
- **방어선 (파라미터 바인딩)**: 절대로 문자열을 쌩으로 더하지 말고, 쿼리에는 **`?` (플레이스홀더 물음표)** 만 뚫어둔 뒤 **`set_param( )`** 메서드를 통해 입력 변수 주소만 결합(Parameter Binding)해야, 해커가 아무리 악성 문장을 쳐도 그냥 '단순 텍스트 글자' 로 처리되어 침투가 영구 차단된다.

### 어떻게 확인하는가

execute_query 를 격발하고 set_param_table 에 담으며, MANDT 가드와 바인딩을 적용한 ADBC 소스를 검증한다.

```abap
DATA: lt_result TYPE TABLE OF zbooking,
      lv_msg    TYPE string.

" 1. [★ SQL Injection 방어를 위해 ? 플레이스홀더만 뚫어둔 Native SQL 빚기]
" 2. [★ MANDT 클라이언트 필터 수동 기입 철칙 장착!]
DATA(lv_sql_stmt) = |SELECT * FROM zbooking WHERE mandt = ? AND concert_id = ?|.

TRY.
    " 3. [ADBC 구동 객체 조립]
    DATA(lo_sql) = NEW cl_sql_statement( ).
    
    " 4. [파라미터 바인딩 셋업]
    " ? 물음표 순서대로 내 변수 주소(REF)를 1:1 도킹 바인딩! (SQL Injection 완벽 차단)
    lo_sql->set_param( REF #( sy-mandt ) ). " 1번째 ? 자리에 회사코드 주입!
    lo_sql->set_param( REF #( iv_concert_id ) ). " 2번째 ? 자리에 공연ID 주입!
    
    " 5. [쿼리 격발 및 결과 회수]
    DATA(lo_res) = lo_sql->execute_query( lv_sql_stmt ).
    lo_res->set_param_table( REF #( lt_result ) ). " 리턴 테이블 주소 매핑!
    lo_res->next_package( ). " 결과 버퍼 Flush!
    
  CATCH cx_sql_exception INTO DATA(lx).
    " 에러 덤프 나기 전 catch 해서 수습!
    lv_msg = lx->get_text( ).
    WRITE: / 'Native SQL 실행 실패! 원인:', lv_msg.
ENDTRY.
```

#### 체험/시뮬레이터 설계 (ADBC Native SQL 경로)
- **프로세스 플로우**:
  1. 학습자가 [ADBC 주사기 기계] 와 [zbooking DB] 를 본다.
  2. 입력창에 ['; DROP TABLE zbooking; --] 폭탄 코드를 타이핑한다.
  3. [문자열 직접 결합 모드] 로 주사기를 찌르자, DB 테이블이 통째로 쾅 깨지며 "Data Table Dropped!" 해킹 경보가 울린다.
  4. [파라미터 바인딩 ON] 및 [MANDT 수동 필터 ON] 을 켠다. 
  5. 찌르자 폭탄 코드가 그냥 단순 '글자' 로 흡수되어 무해하게 "조회 결과 0건" 초록불로 수습되고, 오직 내 100번 클라이언트 예약만 발라져 나오는 철통 보안 피드백을 감상한다.
- **상태 및 데이터**:
  - `MANDT 수동 필터를 누락한 상태` -> 런타임 결과: `Multi-tenant Data Leakage! 100/200/800 client bookings exposed` 적색 사이렌 경보.
- **피드백**: ADBC 는 DB 쌩 뇌와 직결되므로, 개발자가 수동 MANDT 락과 FAE 바인딩 방어선을 다 쥐고 짜야 함을 학습한다.

### 실수/주의

- **ADBC 작업이 다 끝났는데, 결과 셋 객체인 lo_res->close( ) 호출을 생략**:
  - DB 서버 커서(Cursor) 리소스가 닫히지 않고 좀비 상태로 누수되어 상주해, 야간 배치 가동 시 "DB Cursor Exhausted" 커서 고갈 에러를 뿜으며 기계 전체를 마비시킨다.
  - **조회 완료 직후 lo_res->close( ) 또는 statement 자원 반환을 수호해야 한다.**

### 정리

- **`ADBC`** 는 DB 고유의 쌩 Native SQL 을 문자열에 실어 직접 실행하는 4순위 최후 통로다.
- Native SQL 은 **`MANDT 클라이언트 격리를 자동으로 해주지 않으므로`** WHERE 문에 수동 지정한다.
- SQL Injection 침투를 차단하기 위해 문자열 더하기 대신 **`? 플레이스홀더 및 set_param 바인딩`** 을 채택한다.

---

## CH33-L04 - AMDP와 CDS / Open SQL 비교

### 왜 필요한가

AMDP 와 ADBC 구조까지 마스터했다.
그런데 각 도구들의 성능 대비 유지보수 책임을 정확히 비교 도표로 대조해 두지 않으면 기획 회의 때 장벽을 만난다.
- " 사용자가 신규 뷰를 만들어달라고 요청해 왔다.
성능을 극한으로 올려보겠다며 BAdI 나 AMDP 클래스를 생성해 1,000줄짜리 복잡한 SQLScript 프로시저로 조립했다."
다음 달 갑자기 "Oracle 클라우드 장비로 이사 가겠다" 는 의사결정이 내려지는 순간, 이 AMDP 1,000줄은 단 한 줄도 재사용되지 못해 쓰레기통으로 들어가고, 개발팀은 3달 동안 야근하며 쿼리를 첨부터 다시 번역해야 하는 재앙을 겪는다. 
각 도구의 계약 강도와 DB 종속성 경계를 훤히 꿰어 차고 아키텍처를 선택해야 한다.

**Modern SQL, CDS View, AMDP 의 3대 가속 도구의 특징을 OCP 개방폐쇄, 클라우드 이식성, 디버깅 난이도의 지표로 입체 비교 대조하여 적재적소에 정밀 칼 배치하는 기술**이 필요하다. 그것이 **AMDP와 CDS / Open SQL 비교** 다.

### 무엇인가

#### 📊 [ 3대 Code Pushdown 도구 비교 매트릭스 ]
- *우리는 성능과 유지보수의 최적 교차점을 아래 비교 명세를 기준으로 짚어 아키텍처를 결정한다.*

| 비교 지표 | 1순위: Open SQL (Modern) | 2순위: CDS View | 3순위: AMDP |
| --- | --- | --- | --- |
| **DB 이식성 (Portability)** | **최상 (100% 독립)**<br>어느 DB 로 가든 아바가 자동 번역함 | **상 (독립)**<br>표준 DDL 규격이라 이식 견고 | **하 (HANA 종속)**<br>HANA SQLScript 로 짜여 이식 불가 |
| **디버깅 편의 (Debugging)** | **최상**<br>아바 디버거로 값 추적 쉬움 | **중**<br>ADT Eclipse 데이터 프리뷰 지원 | **하**<br>ABAP 디버거로 내벽 값 스캔 불가 |
| **재사용성 (Reusability)** | **하**<br>해당 프로그램 내부 전용 | **최상**<br>OData, ALV, RAP 등 사방에서 공유 | **중**<br>AMDP 클래스를 부르는 소스만 공유 |
| **주요 사용 용도** | 단순 집계, CASE 식 분기, 단건 결합 연산 | 표준 비즈니스 데이터 모델 설계, RAP 결합 | 임시 테이블 순회, 복잡 절차 알고리즘 |

### 어떻게 확인하는가

매트릭스 지도를 참고해 신규 요구사항에 맞춤형 도구를 낙찰 매핑하는 코드를 검증한다.

```text
미션: "Fiori UI5 화면과 RAP 서비스에 결합해 사용할, 공통 예매 현황 표준 뷰를 설계하라."
  - 1단계 검문: 재사용성과 Fiori 도킹이 1순위인가? -> Yes: CDS View 가 정답! (2순위 낙찰)
  
미션: "HANA DB 의 고유 문자열 압축 함수와 임시 테이블 변수 순회 연산이 꼭 필요한가?"
  - 1단계 검문: 절차적 SQLScript 문법이 필수인가? -> Yes: AMDP 클래스가 정답! (3순위 낙찰)
```

#### 체험/시뮬레이터 설계 (푸시다운 비교 매트릭스)
- **프로세스 플로우**:
  1. 학습자가 [3대 푸시다운 카드: Open SQL, CDS, AMDP] 와 [상황 미션: DB 이전 계획 있음] 을 본다.
  2. [AMDP 카드] 를 꽂고 전원을 넣자 "HANA DB 종속으로 인해 타 DB 이송 불가! 삐-" 경보음이 울린다.
  3. [Open SQL 카드] 로 교체하자 "이식성 100% 승인! 클라우드 패스!" 초록색 불이 들어오는 매트릭스 조립 피드백을 감상한다.
- **상태 및 데이터**:
  - `단순 집계 쿼리를 무조건 AMDP 로 도배해 배포한 상태` -> 런타임 결과: `Technical debt score: 85% (Critical). System upgrade blocked` 하이라이트.
- **피드백**: 기술의 강력함 뒤에는 항상 유지보수 종속성 부채가 따르므로, 이식성이 높은 Open SQL 을 1순위로 조준해야 함을 각인한다.

### 실수/주의

- **"속도가 빠르니까 무조건 성능은 최고다" 라며 CDS View 안방 내부에 AMDP Table Function 을 마구 엮어서 설계**:
  - 이렇게 엮어두면 겉은 CDS 지만 속은 AMDP 고위험 칩이 들어앉아 결국 전체 CDS 뷰 계층이 HANA DB 에 강제 종속되는 오염 전파를 유발한다.
  - **CDS 안에는 웬만해선 순수 SQL 식만 채우고 AMDP 결합은 극단적으로 통제해야 한다.**

### 정리

- **`Open SQL`** 은 이식성과 디버깅이 최상이며, **`CDS View`** 는 공유 표준 모델 재사용성이 최상이다.
- **`AMDP`** 는 복잡한 절차 알고리즘을 소화하지만 DB 종속과 디버깅 난이도 상승의 부채를 동반한다.
- 아키텍처는 성능과 유지보수의 균형을 맞춰 **`이식성이 높은 순서`** 로 필터링 낙찰한다.

---

## CH33-L05 - 운영 리스크와 DB 종속성

### 왜 필요한가

비교 매트릭스까지 마스터했다.
이제 AMDP/Native SQL 구동 시 터지는 '실무 운영 리스크 관리' 와 '동적 호출 검문선' 구축을 마주한다.
- " 이 프로그램은 HANA 전용 AMDP 메서드를 호출해 예매 통계를 낸다.
그런데 우리 회사 내의 다른 개발 클라이언트나, 계열사 소형 On-premise 장비는 여전히 HANA 가 아닌 일반 DB(Sybase 등)를 쓰고 있다."
이 일반 DB 장비에서 내 AMDP 호출 프로그램을 켜는 순간, 컴파일러가 아니라 DB 단에서 "HANA 프로시저를 돌릴 수 없다" 는 메모리 덤프(Crash)를 터트리며 시스템 전체가 뻗어버린다.

**해당 DB 가 AMDP HDB 엔진을 탑재해 지원하는지 프로그램 가동 런타임에 동적으로 사전 검문(CL_ABAP_DBFEATURES)하고, 예외(cx_amdp_error)를 안전하게 Catch 하여 덤프 폭사를 방어하는 기술**이 필요하다. 그것이 **AMDP 운영 리스크의 격리** 다.

### 무엇인가

#### 1. AMDP 운영 리스크와 디버깅 한계
- AMDP 는 데이터베이스 커널 단에서 쌩 작동하므로, 우리가 평소에 쓰는 아바 디버거(`F5`, `F6`)로 소스를 타며 변수 값을 훔쳐보는 스캔 분석이 원천 차단된다. (ADT Eclipse 전용 DB 디버거 셋업이 동반되어야만 내벽 분석이 뚫린다.)

#### 2. CL_ABAP_DBFEATURES=>CALL_AMDP_METHOD (동적 기능 검문소)
- *시스템 폭사를 막는 선제 검문 전원이다.*
- **현재 프로그램을 실행하고 있는 백엔드 DB 장비가 AMDP 기능을 지원하는 칩(HANA DB 등)을 탑재했는지 아바 단에서 1차로 조회해 주는 정적 판정 속성이다. 지원하지 않는 장비라면 AMDP 호출을 차단하고 로컬 Open SQL 로 우회 우회 유도하여 컴파일 사망을 막는다.**

#### 3. cx_amdp_error (AMDP 전용 예외 클래스)
- SQLScript 런타임 연산 중 나누기 0 에러나, 데이터 형식 오류가 났을 때 터지는 예외를 아바 단에서 받아 수습하는 전용 예외 카드다.

### 어떻게 확인하는가

CL_ABAP_DBFEATURES 검문을 거쳐 AMDP 를 동적으로 깨우고 cx_amdp_error 로 예외 처리하는 코드를 검증한다.

```abap
DATA: lt_stats TYPE ztt_stats,
      lv_msg   TYPE string.

" 1. [★ AMDP HDB 엔진 지원 여부 동적 선제 검문!]
IF cl_abap_dbfeatures=>use_features(
     EXPORTING
       requested_features = VALUE #( ( cl_abap_dbfeatures=>call_amdp_method ) )
   ) = abap_true.

  " 2. [HANA DB 임이 확인되었으므로 안심하고 AMDP 기동!]
  TRY.
      NEW zcl_booking_amdp( )->get_booking_stats(
        EXPORTING iv_concert = 'C001'
        IMPORTING et_stats   = lt_stats
      ).
    CATCH cx_amdp_error INTO DATA(lx_amdp).
      " 3. [★ AMDP 내부 연산 실패 시 덤프 방어 catch!]
      lv_msg = lx_amdp->get_text( ).
      WRITE: / 'AMDP 런타임 연산 실패! 원인:', lv_msg.
  ENDTRY.

ELSE.
  " 4. [일반 DB 환경이므로 안전하게 표준 Open SQL 로직으로 우회 이송!]
  SELECT concert_id, SUM( seats ) AS total_seats
    FROM zbooking
    INTO CORRESPONDING FIELDS OF TABLE @lt_stats
    WHERE concert_id = 'C001'
    GROUP BY concert_id.
    
  WRITE: / 'HANA DB 가 아니므로 일반 Open SQL 로 우회 연산 수행 완료.'.
ENDIF.
```

#### 체험/시뮬레이터 설계 (푸시다운 적절성 판별 퀴즈)
- **프로세스 플로우**:
  1. 학습자가 [Sybase 일반 DB 클라이언트] 와 [HANA DB 클라이언트] 두 장비를 본다.
  2. [동적 검문소 OFF] 상태에서 Sybase 기계에 AMDP 칩을 넣고 구동한다. `AMDP_NOT_SUPPORTED` 적색 덤프 번개가 떨어지며 화면이 깨진다.
  3. [동적 검문소 ON] 스위치를 켠다. 
  4. Sybase 기계가 검문소에 닿자 "HANA HDB 없음 감지! 1순위 Open SQL 로 우회 가동!" 문구와 함께 녹색 불이 켜지며 우회 통과되고, HANA 기계에선 정상 AMDP 가 가동되는 유연한 리스크 격리 피드백을 감상한다.
- **상태 및 데이터**:
  - `동적 검문 없이 non-HANA 장비에 AMDP 호출을 다이렉트로 때려 배포한 상태` -> 런타임 결과: `AMDP method execution failed. System crashed on Sybase client` 하이라이트.
- **피드백**: 고성능 Native 기술을 다룰 때는 항상 미지원 장비에 대비한 동적 검문(`use_features`)과 우회 대피로(Fallback) 설계가 동반되어야 안전함을 체득한다.

### 실수/주의

- **AMDP 내부에서 발생한 에러를 일반 cx_sy_open_sql_db_error 로 CATCH 하려 시도**:
  - AMDP 예외는 SQLScript 프로시저 레벨에서 던져지므로 일반 Open SQL 예외 카드로 잡히지 않고 필터를 뚫고 나가 덤프 폭사를 터트린다.
  - **AMDP 예외는 무조건 `cx_amdp_error` 전용 카드로 CATCH 수호해야 한다.**

### 정리

- AMDP 는 고성능을 내는 대신 **`DB 종속성`** 과 **`아바 디버깅 불가`** 의 리스크를 수반한다.
- 미지원 일반 DB 장비에서의 폭사를 막기 위해 **`cl_abap_dbfeatures=>use_features`** 로 선제 검문한다.
- 예외 발생 시에는 **`cx_amdp_error`** 카드로 CATCH 하여 덤프를 안전 가드한다.
- *HANA Native 기술은 S/4HANA 의 핵심 동력이며, 미래 클라우드에선 이 AMDP 원리가 RAP Action 이나 AMDP Table Function 으로 승계 조립된다.*
