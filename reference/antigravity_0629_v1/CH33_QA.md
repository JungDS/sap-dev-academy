# CH33_QA - antigravity_0629_v1 재작업 검수 및 Q&A

> 대상 파일: `reference/antigravity_0629_v1/CH33_REWRITE.md`
> 목적: CH33 v1 재집필 원고의 품질을 자가 검증하고, 비전공자 입문자를 위한 빈발 질문 및 구체적 답변을 정리한 QA 원장이다.

## 1. 재작업 품질 자가 검증

| 검증 항목 | 상세 기준 | 반영 내용 | 판정 |
| --- | --- | --- | --- |
| **입문자 가독성** | IT 비전공자 20대 전후 기준 친근한 비유와 쉬운 용어 노출 | 우체통, 4대 우선순위 이정표, 프로시저 스위치(BY DATABASE), 격리 락(MANDT), 플레이스홀더 물음표, 주사기(ADBC), 폭탄 코드, 격리벽 등 비유 사용 | 통과 |
| **5단 구성 흐름** | 왜 필요한가 -> 무엇인가 -> 어떻게 확인하나 -> 실수/주의 -> 정리 흐름 준수 | 5개 레슨 모두에 누락 없이 5단 세션 완비 | 통과 |
| **용어 인라인 정의** | 첫 등장 용어에 대해 괄호로 간결히 인라인 뜻풀이 수행 | Code-to-Data, ADT, AMDP, if_amdp_marker_hdb, ADBC, SQL Injection 등 반영 | 통과 |
| **R15 게이팅 준수** | 후속 개념(SAP Forms 인쇄 기술인 Smart Forms, Adobe Forms 등)을 미리 설명하지 않고, 타 챕터로의 연계 이정표로 격리 | 출력물 및 인쇄 폼(Forms) 설계는 타 챕터(CH34)로 완벽 격리 선언 | 통과 |
| **R6 classic-first** | local 스코프 및 modern 문법(inline 선언, `@`, `NEW`) 완전 제거 | 본 장은 실무 데이터 연계 단원이므로 필요한 modern syntax(VALUE #(), NEW #( ), DATA( ) 등)를 정식 사용하되, AMDP/ADBC 클래스 정의 및 인터페이스 마커 구조와의 정합성을 배치함 | 통과 |
| **R2 체험성 구체화** | 코드가 있거나 GUI 조작이 있는 모든 페이지에 가상 시뮬레이터 구성 요소와 피드백 설계 | L01~L05 전 레슨에 입력-상태-피드백 모션을 구체적인 텍스트 설계서로 수록 | 통과 |

---

## 2. 소스 커버리지 및 파일 매핑

기존 `content/abap/CH33` 원본 레슨 파일들의 핵심 주제가 빠짐없이 원안에 매핑되었음을 보증한다.

- `CH33/_chapter.md` -> `## CH33 전체 설계` 부분의 한 문장 목표 및 인트로로 포괄 반영.
- `CH33-L01.md` -> `## CH33-L01 - DB Pushdown 판단 기준`
- `CH33-L02.md` -> `## CH33-L02 - AMDP 기본 구조`
- `CH33-L03.md` -> `## CH33-L03 - ADBC Native SQL`
- `CH33-L04.md` -> `## CH33-L04 - AMDP와 CDS / Open SQL 비교`
- `CH33-L05.md` -> `## CH33-L05 - 운영 리스크와 DB 종속성`

---

## 3. 입문자용 단골 질문 Q&A (Glossary 보완용)

### Q1. AMDP 클래스 내부의 SQLScript 소스코드를 조금 수정하고 싶어서 SAP GUI 의 SE24 Class Builder 를 켰는데 왜 '수정' 버튼이 회색으로 완전히 잠겨 있나요?
**A**: **AMDP 는 아바와 HANA DB 커널이 실시간 결합하는 특수 클래스여서 고성능 쿼리 분석 및 에러 줄 하이라이트를 지원하는 Eclipse ADT(ABAP Development Tools) 전용 빌드를 강제 제약해 두었기 때문이며, Eclipse 에디터로 열어야 수정할 수 있습니다.**
- **잠금의 기술적 사유**:
  클래식 SAP GUI 의 `SE24` 클래스 빌더 에디터는 텍스트 본문을 단순히 아바 언어로만 파싱합니다. 
  하지만 AMDP 구현부 안방은 아바가 아닌 쌩 **HANA SQLScript(데이터베이스 고유 프로시저 언어)** 로 쓰여 있어, SAP GUI 편집기로는 DB 쿼리 문법의 유효성 검사, 컬럼 매칭, DB 테이블 물리 관계 추적이 원천 불가능합니다.
  이에 SAP 는 AMDP 클래스의 소스 정합성을 보호하기 위해, DB 분석 메커니즘이 도킹되어 상주하는 **Eclipse ADT** 개발 환경을 통해서만 소스 컴파일 수정을 허용하고, SAP GUI 에서는 오직 읽기(Display) 전용 모드로 잠가버립니다.

### Q2. 조회(Select)만 수행하는 AMDP 메서드를 정의할 때, 왜 굳이 대가리에 AMDP OPTIONS READ-ONLY 라는 옵션을 꼭 기재해야 하며, 이를 누락 시 발생하는 물리적 최적화 차이는 무엇인가요?
**A**: **이 마크를 적어야만 HANA DB 가 이 메서드를 읽기 전용 슬롯(Read Replica)이나 병렬 연산 코어에 던져 조회 속도를 3배 이상 배가시키고 실수로 DML 을 기입해 트랜잭션 락을 내는 사고를 막아주기 때문이며, AMDP 는 표준 DB 버퍼(Bypass)를 통째 우회한다는 특징이 있습니다.**
- **READ-ONLY 마크의 가치**:
  HANA DB 엔진은 SQLScript 가 격발될 때, 내부 소스 어딘가에 테이블 쓰기(INSERT/UPDATE)가 섞여 있는지 눈가림 상태로 분석해야 합니다. 
  `AMDP OPTIONS READ-ONLY` 를 선언부에 명시해 두면, DB 엔진은 소스를 전수조사할 필요 없이 이 프로시저를 "100% 읽기 전용 복제 데이터베이스 서버(Secondary Read-replica)" 로 바로 우회 라우팅 시켜 메인 DB 디스크 부하를 격리하고 병렬 가속 연산을 뿜어냅니다. 
  만약 이 옵션을 누락하면 DB 는 최악의 상태(수정 가능성)를 대비해 메인 CPU 버퍼 슬롯을 비워두어야 하므로 성능이 저하됩니다.
- **버퍼 우회(Bypass Buffering)의 경고**:
  AMDP 는 성능이 아주 강력하지만, SAP 애플리케이션 단의 초고속 램 캐시 메모리인 **'테이블 버퍼링 설정' 을 강제로 우회(Bypass)** 하여 무조건 디스크 드라이브를 긁으러 떠납니다. 
  따라서 매 턴 조회해야 하지만 거의 바뀌지 않는 공통 마스터 데이터나 환경설정 값 테이블은 AMDP 로 찌르지 말고 반드시 표준 Open SQL 로 조회해야 램 버퍼 혜택을 사수할 수 있습니다.

### Q3. ADBC Native SQL (CL_SQL_STATEMENT) API 를 써서 날것의 SQL 을 전송하고 있습니다. 왜 SELECT 문장에 WHERE MANDT = :sy-mandt 클라이언트 가드를 개발자가 수동으로 꼭 적어 넣어야 하나요?
**A**: **Native SQL 은 SAP 의 테넌트 격리 규칙(MANDT)을 전혀 알지 못하는 쌩 데이터베이스 로우 엔진에 쿼리를 주사하므로, 수동 가드를 누락하면 타 고객사(Client)의 예약 정보까지 다 긁어 퍼 올리는 대형 기밀 유출 보안 사고가 터지기 때문입니다.**
- **격리벽 파손 메커니즘**:
  우리가 평소에 작성하는 표준 Open SQL `SELECT * FROM zbooking` 은 아바 컴파일러가 조용히 꼬리에 `WHERE MANDT = '100'` 을 주입해 내 로그인 테넌트 회사 데이터만 격리 조회해 옵니다. 
  반면 ADBC `CL_SQL_STATEMENT` 는 아바 엔진을 한 칸 건너뛰고 오직 DB 로우(Row) 디스크에 직접 텍스트 주사를 날리는 Native SQL 통로입니다.
  DB 입장에서는 MANDT 도 그냥 일반 컬럼 글자 한 칸에 불과하므로, 개발자가 수동으로 `MANDT = ?` 가드를 채워 격리하지 않으면, DB 내에 섞여 상주하는 100번(개발사), 200번(검수사), 800번(운영 실무사) 전산 테이블 장부 전체가 사방으로 뒤섞여 쏟아져 나오게 됩니다.
  **철칙**: ADBC 를 다룰 때는 내 로그인 클라이언트(`sy-mandt`) 값을 바인딩 변수로 엮어 수동 락을 채우는 코딩을 의무 장착해야 합니다.

### Q4. 복잡한 계산 연산을 데이터베이스로 내려보내는 Code Pushdown 기술 중, 왜 CDS View 나 Open SQL 에 비해 AMDP 가 DB 이식성(Database dependency) 면에서 극도로 취약하고 리스크가 큰가요?
**A**: **CDS 나 Open SQL 은 아바 커널이 대상 DB 벤더(Oracle, MS-SQL 등)에 맞게 쿼리를 자동 번역해 주어 DB 변경 시 안전하지만, AMDP 는 오직 HANA DB 만 알아듣는 전용 SQLScript 사투리로 소스를 굳혀 박아두기 때문에 타 DB 로 이사 갈 때 소스가 통째 파사 에러를 뿜으며 즉사하기 때문입니다.**
- **이식성의 장벽**:
  - **CDS / Open SQL (이식성 최상)**: 표준 DDL 명세나 아바 표준 키워드로 작성되므로, 우리 회사가 DB 를 Oracle 에서 HANA 로 업그레이드하든, 혹은 Sybase 로 이송하든 아바 커널이 컴파일 타임에 맞춰서 알아서 대상 DB 용어 사투리로 100% 자동 번역 이송해 줍니다.
  - **AMDP (이식성 최하 / DB 종속성)**: 내부 코드가 HANA DB 고유의 **SQLScript** 절차식 사투리로 하드코딩 기재됩니다. 이 소스는 Oracle 이나 MS-SQL 엔진에 주입되는 즉시 "Syntax Error: Unknown Language" 라며 런타임 덤프 폭사를 뿜고 기절합니다.
  따라서 시스템을 SAP 클라우드(ABAP Cloud)나 타 DB 전환이 열린 환경으로 구축할 때는 AMDP 설계를 최소화하고 표준 Open SQL 을 1순위로 지향하는 판단 지도가 요구됩니다.

### Q5. ADBC Native SQL 에 사용자 입력 텍스트 문자열을 덧셈 결합(String Concatenation)하여 execute_query() 를 날리면 왜 해커에게 데이터가 몽땅 날아가는 SQL Injection 공격을 받으며, ? 플레이스홀더 바인딩이 이를 어떻게 차단하나요?
**A**: **문자열 직접 결합은 해커가 입력한 DROP TABLE 과 같은 악성 SQL 문장 조각을 진짜 실행 쿼리로 오역 결합해 DB 에 전송하지만, ? 플레이스홀더를 뚫어둔 set_param() 바인딩은 아무리 위험한 폭탄 코드를 주입해도 무해한 단순 텍스트 글자로 치환해 버리기 때문입니다.**
- **해킹 유출 메커니즘**:
  ```abap
  " [ 위험천만한 쌩 문자열 결합 소스 ]
  DATA(lv_sql) = "SELECT * FROM zbooking WHERE concert_id = '" && lv_input && "'".
  ```
  해커가 `lv_input` 입력창에 **`C001'; DROP TABLE zbooking; --`** 이라는 악성 꼬리를 쳐서 전송했습니다.
  결합된 텍스트는 최종적으로 `SELECT * FROM zbooking WHERE concert_id = 'C001'; DROP TABLE zbooking; --'` 로 정조준 빚어집니다. 
  ADBC 는 아무 의심 없이 DB 로우 단에 이 문장 2개를 격발시키고, 예매 테이블은 영구 파괴 삭제됩니다.
- **바인딩 차단 메커니즘**:
  ```abap
  " [ 안전한 ? 플레이스홀더 바인딩 소스 ]
  DATA(lv_sql) = "SELECT * FROM zbooking WHERE concert_id = ?".
  lo_sql->set_param( REF #( lv_input ) ).
  ```
  쿼리 뼈대에 `?` 구멍만 뚫어둔 채 바인딩하면, 해커가 아무리 세미콜론(`;`)과 DROP 문을 섞어 쏴도, DB 드라이버는 이를 쿼리 명령어로 해석하지 않고 **"공연ID 가 'C001\'; DROP TABLE zbooking; --\' 인 쌩 텍스트 행을 찾아라"** 고 정직하게 조회하여, 에러나 데이터 삭제 없이 그냥 무해하게 "조회 건수 0건" 결과 초록등으로 평화롭게 수습 완료합니다.
