# CH35_REWRITE - 운영 품질과 배포 관리 v1

> 목적: `content/abap/CH35`의 5개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH35 전체 설계

CH35의 한 문장 목표는 "개발 완료 후 배포 전 코드 정적 스캔 장치인 ATC / Code Inspector(성능/보안/클라우드 Released API 위반 Finding 조치), 회귀 버그를 방지하는 단위 테스트(ABAP Unit CI 게이트), 배포 이송 경로(DEV→QAS→PRD)와 STMS 임포트 조율 및 이송 순서/의존 제어, 대량 정산용 배치 잡 API(SM36/SM37)와 `SUBMIT ... VIA JOB ... AND RETURN` 문법, 그리고 실 운영의 블랙박스 추적기 표준 Application Log(BAL: `SLG1`)의 정합성을 수립하여 배포 품질 관리 체계를 확립한다"이다.

IT 비전공자 입문자는 배치 스케줄에 타깃 프로그램을 등록하기 위해 `SUBMIT ... VIA JOB` 구문을 쏠 때 `AND RETURN` 옵션을 빠뜨려 컴파일 신택스 에러를 유발하고, `USER sy-uname` 을 무단 명시해 디버깅 과정에서 사용자 세션 변수가 오염되는 위협에 노출된다.
또한, 선행 마스터 테이블 구조나 신형 필드카탈로그 등 의존성이 걸린 객체들이 이송 요청서(TR)에 누락되거나 이송 순서가 역전되는 실책을 범해 QA/운영 장비에서 컴파일 폭사를 내며 예매 전산망을 마비시키고, 긴급 장애 시 운영(PRD) 장비에서 코드를 직접 열어 수정하는 만행으로 형상 관리를 파괴한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **ATC 정적 게이트**: 출시 전 성능/보안/클라우드 Released API 위반 Findings 를 자동 차단 점검하는 Variant 설정 및 이송 전 결재선 구축.
2. **ABAP Unit CI 연동**: 수정된 코드가 기존 정상 작동 영역을 깨뜨리는 회귀(Regression) 현상을 막기 위해 Mock DB 단위 테스트를 CI/CD 자동화 빌드에 엮어 차단.
3. **Transport 순서 가드**: DEV -> QAS -> PRD 시스템 파이프라인 상에서 `SE09`/`SE10` release 와 `STMS` Basis 임포트 시, 의존성 객체 누락과 순서 역전을 막는 가이드 제공.
4. **운영계 직접 수정 금지**: 운영(PRD) 서버 코드 직접 수정을 절대 법적으로 금지하고, 반드시 개발기 수정 이송(TR)을 거치도록 형상 관리 통제.
5. **SUBMIT VIA JOB AND RETURN**: 배치 등록 SUBMIT 구문 시 **`AND RETURN` 의무화** 및 **`USER sy-uname` 기입 금지(Redundant 생략)** 표준 룰 정밀 장착.
6. **Application Log (BAL)**: ZLOG 난사를 막고, `BAL_LOG_CREATE` -> `MSG_ADD` -> `DB_SAVE` 표준 함수군을 활용한 트랜잭션 추적 및 `SLG1` 통합 모니터 구성.

---

## CH35-L01 - ATC / Code Inspector

### 왜 필요한가

우리가 이전 개발 챕터들에서 BAPI, RFC, BDC, 파일 업로드에 성능 튜닝까지 탑재한 훌륭한 예매 프로그램을 개발 완료했다.
이제 대망의 실제 현업 직원과 고객들이 사용하는 실무 운영 서버로 배포 도장을 찍을 준비를 한다.
- "개발 장비에서 나 혼자 테스트할 때는 아무 에러 없이 잘 돌았으니 배포해도 되겠지?"
그런데 실무 환경은 가차 없다. 
내가 무심결에 적은 '루프 안 SELECT 쿼리' 나, 보안을 무시하고 짠 'ADBC Native SQL 문자열 덧셈 결합', 그리고 클라우드 전환 시 사용 금지된 'Released API 가 아닌 표준 Z오브젝트 접근' 이 그대로 배포되면 운영 서버는 며칠 내로 CPU 100% 락을 먹거나 해킹으로 데이터가 증발하는 참변을 맞이한다.
- "운영에 소스를 배포하기 바로 직전, 돋보기 스캔 검사기를 들이대어 '성능 위반, 보안 취약점, 클라우드 표준 위반' 이 단 1건이라도 존재하면 배포 결재(이송) 자체를 강제로 락 걸고 차단하는 자동 수문장이 필요하다."
그 정적 품질 스캐너가 **Code Inspector** 와 **ATC (ABAP Test Cockpit)** 다.

### 무엇인가

#### 1. Code Inspector (SCI)
- 아바 프로그램 소스 코드를 빌드 배포하기 전, 정적 분석을 통해 명명 규칙(Naming Rule) 위반, 미사용 변수 잔존, 성능 안티패턴을 자동으로 검사해 검출 보고서를 뱉어주는 표준 품질 점검 도구다. (트랜잭션 `SCI` 에서 검사 룰 세트인 Variant 를 설정한다.)

#### 2. ATC (ABAP Test Cockpit)
- Code Inspector 를 한 단계 더 발전시켜, 전사 표준 배포 프로세스(이송 결재)와 결합한 고성능 정적 품질 게이트웨이 툴이다. (이송 요청을 승인 릴리즈하는 순간 ATC 가 자동 실행되어 에러가 검출되면 이송 자체가 잠긴다.)

#### 🧭 [ ATC/SCI 가 잡아내는 핵심 3대 보안/성능 위협 Findings 명세 ]
- *검사기는 아래의 치명적 위반을 검출하면 이송 승인을 강제 홀딩 차단한다.*

```text
[1] 성능 위협 : "SELECT in LOOP" (LOOP AT 안방에 SELECT 를 박은 행위)
   - DB 왕복 폭사를 방지하기 위해, FAE 나 JOIN 으로 밖에서 읽으라고 적색 에러를 때린다.
   │
[2] 보안 위협 : "SQL Injection Vulnerability" (ADBC Native SQL 에 ? 바인딩 없이 덧셈 결합한 행위)
   - 해킹에 노출되므로, ? 플레이스홀더 바인딩을 적용하라고 적색 경보를 때린다.
   │
[3] 클라우드 위협 : "Non-released API Access" (ABAP Cloud 에서 사용 금지된 Z오브젝트 직접 호출)
   - 미래 클라우드 전환을 막는 유산이므로, Clean Core Released API 로 갈아타라고 경고한다.
```

### 어떻게 확인하는가

프로그램에 대고 ATC 점검 Variant 를 기동하여 Finding 목록을 확인하는 시퀀스를 검증한다.

```text
[1단계] ATC 품질 검사 격발 :
   - ADT Eclipse 에서 zbooking_process 우클릭 -> Run As -> ABAP Test Cockpit 실행!
   
[2단계] Finding 결과 보고서 스캔 :
   ---------------------------------------------------------------------------------
   | Severity | Check Category      | Message / Line                               |
   ---------------------------------------------------------------------------------
   | Error    | Performance DB      | SELECT in LOOP detected at line 45           |
   | Error    | Security DB         | SQL Injection risk via string concat line 82  |
   | Warning  | Cloud Readiness     | ZMARA is not Released in Cloud contract 120  |
   ---------------------------------------------------------------------------------
   -> 에러가 존재하므로, 이송 요청서(TR) 릴리즈 시 "ATC check failed" 팝업과 함께 이송 잠금 발생 확인!
   
[3단계] 소스 보정 및 재검사 :
   - FAE 가드와 파라미터 바인딩으로 소스 수정 후 재실행 -> Findings = 0건 통과! -> 이송 락 해제 완료!
```

#### 체험/시뮬레이터 설계 (ATC 정적 스캔 게이트)
- **프로세스 플로우**:
  1. 학습자가 [내 불완전한 예매 소스 코드] 와 [운영 배포 이송 트럭]을 본다.
  2. 코드 안방에 [SELECT in LOOP 폭탄 칩] 이 꽂혀 있다.
  3. 무단으로 [이송 Release] 를 누르자, [ATC 센서 수문장] 이 삑삑 빨간 경보음을 내며 이송 트럭 바퀴에 쇠사슬 락을 채우는 비주얼을 확인한다.
  4. 소스에서 SELECT in LOOP 를 뽑아내고 FAE 카드로 갈아 끼운다. 
  5. 다시 릴리즈하자, 수문장이 경례하며 초록불로 길을 비켜주어 이송 트럭이 출발하는 배포 피드백을 감상한다.
- **상태 및 데이터**:
  - `ATC 경고가 귀찮다고 variant 설정을 다 꺼버린 채 억지로 배포를 집행한 상태` -> 런타임 결과: `Security breach on PRD. Database hijacked. Critical incident` 적색 사이렌 경보.
- **피드백**: ATC 는 나를 귀찮게 하는 잔소리가 아니라, 내 Z프로그램이 운영에 나가 폭사하는 것을 막는 최후의 방패막이 임을 인지한다.

### 실수/주의

- **ATC 에러 경고를 임시방편으로 끄기 위해, 소스 코드에 pseudo comment (예: `#EC CI_...`) 나 PRAGMA 주석을 가작 남발해 대충 우회 통과 처리**:
  - 이 꼼수 수정 시 정적 검사는 통과될지 몰라도, 진짜 루프 SELECT 와 해킹 취약점이 운영계에 그대로 올라가 폭탄 장치로 상주하게 된다.
  - **예외 주석은 오직 마스터 검수 팀의 정식 컨설팅 승인을 득한 정당한 사유가 기재된 경우에만 절제 사용해야 함을 수호해야 한다.**

### 정리

- 운영 배포 전 코드의 성능, 보안, 문법 하자를 자동으로 거르는 도구는 **`Code Inspector`** 다.
- **`ATC`** 는 이송 요청 결재 시스템과 결합해 에러 발견 시 이송을 차단하는 게이트웨이 수문장이다.
- 검출된 **`Finding`** (SELECT in LOOP, SQL Injection) 목록은 1순위로 수정 제거한다.

---

## CH35-L02 - ABAP Unit과 회귀 방지

### 왜 필요한가

ATC 정적 스캔은 통과했다.
이번에는 내 코드의 '기능적 정합성 작동 상태' 가 문제다.
- " 예약 완료 시 남은 좌석 수(`remaining`)를 올바르게 계산해 빼주는 핵심 로직을 가지고 있다.
마케팅 팀의 요청으로 신규 마일리지 적립 로직을 추가하려고 클래스를 수정했다.
배포 후 다음 날 아침, 마일리지는 잘 쌓이는데 웬일인지 남은 좌석 수 차감 로직이 오작동해 비행기 예약이 중복으로 오버부킹되는 난장판 장애가 터졌다."
코드를 수정/리팩터링(Refactoring)할 때, 신규 기능은 잘 도는데 엉뚱한 기존 정상 기능이 깨지는 현상을 **회귀 (Regression) 버그** 라고 부른다.
사람 눈으로 소스 코드를 훑는 정적 검사로는 연산 버그를 잡을 수 없고, 그렇다고 매번 100가지 시나리오를 QA 서버에서 수동으로 마우스 클릭해 가며 테스트하는 것은 불가능에 가깝다.

**코드가 수정될 때마다 기존 연산이 한 치의 오차도 없이 이전과 똑같이 100% 무결하게 돌아가는지 기계가 0.1초 만에 자가 진단 Assert 검증해 주는 회귀 테스트(ABAP Unit)를 배포 파이프라인 게이트에 장착하는 기술**이 필요하다. 그것이 **ABAP Unit과 회귀 방지** 다.

### 무엇인가

#### 1. ABAP Unit
- 내 비즈니스 클래스의 핵심 계산 메서드에 대고 예상 값(Expected)과 실제 실행 값(Actual)이 1:1 일치하는지 아바 Assert 엔진을 쏴서 코드 기능적 무결성을 자가 검사하는 자동 단위 테스트 프레임워크다.

#### 2. 회귀 (Regression - 회귀 버그)
- 소스 코드에 새로운 변경이나 튜닝을 가했을 때, 수정하지 않은 멀쩡하던 기존 핵심 연산 로직이 톱니바퀴 이탈 충돌로 깨져서 뒤로 후퇴하는 장애 현상이다.

#### 3. CI/CD 빌드 게이트 결합 (gCTS)
- **개발자가 소스 수정을 마치고 이송을 날리는 순간, gCTS 나 Git 연동 배포 파이프라인 서버가 깨어나 내가 작성해 둔 수백 개의 ABAP Unit 단위 테스트를 백그라운드에서 전체 쌩 실행한다. 단 1개라도 Assert 실패 경고를 뱉으면 배포를 즉시 기각 차단하여 회귀 버그가 운영 서버 땅을 밟지 못하게 수호한다.**

#### 4. Test Double 과 Mocking
- 단위 테스트 시 진짜 DB 테이블에서 데이터를 조회하게 만들면, 테스트가 돌 때마다 DB 상태에 따라 테스트 결과가 성공했다 실패했다 요동친다. 
- 테스트 대상 클래스와 진짜 DB 사이의 전원 케이블을 촥 끊어버리고, 가상의 가짜 데이터(Mock Object)를 반환해 주는 테스트 대역(Test Double)을 끼워 넣어, DB 상태와 격리된 순수 연산의 정합성만 0.01초 만에 정밀 검수해 낸다.

### 어떻게 확인하는가

remaining(남은 좌석) 계산 메서드를 Unit 테스트 ASSERT 로 검증하는 소스를 확인한다.

```abap
" 1. [테스트 대상 Z클래스]
CLASS lcl_concert DEFINITION.
  PUBLIC SECTION.
    METHODS book_seats IMPORTING iv_seats TYPE i.
    METHODS remaining RETURNS VALUE(rv_rem) TYPE i.
  PRIVATE SECTION.
    DATA mv_capacity TYPE i VALUE 100.
ENDCLASS.

CLASS lcl_concert IMPLEMENTATION.
  METHOD book_seats.
    mv_capacity = mv_capacity - iv_seats. " 좌석 차감 로직!
  METHOD remaining.
    rv_rem = mv_capacity.
  ENDMETHOD.
ENDCLASS.
```

```abap
" 2. [★ lcl_concert 를 자동 검문할 ABAP Unit 테스트 클래스 정의]
CLASS ltcl_concert_test DEFINITION FOR TESTING
  DURATION SHORT RISK LEVEL HARMLESS. " 테스트 수행 조건 지정
  PRIVATE SECTION.
    METHODS test_booking FOR TESTING. " 테스트 수행 메서드!
ENDCLASS.

CLASS ltcl_concert_test IMPLEMENTATION.
  METHOD test_booking.
    " Given (준비)
    DATA(lo_cut) = NEW lcl_concert( ). " 검사 대상 클래스 조립!
    
    " When (실행)
    lo_cut->book_seats( 30 ). " 30석 예매 격발!
    
    " Then (검증 - Assert)
    " 100석에서 30석을 뺐으니 남은 좌석(remaining)은 반드시 70이어야 함을 검증!
    cl_abap_unit_assert=>assert_equals(
      act = lo_cut->remaining( ) " 실제 결과 값
      exp = 70                    " 내가 예상한 기대 값
      msg = '30석 예매 시 남은 좌석 차감 연산 회귀 버그 감지!'
    ).
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (ABAP Unit 회귀 검사판)
- **프로세스 플로우**:
  1. 학습자가 [예매 좌석 차감 로직 = 100 - iv_seats] 를 본다.
  2. [Run Unit Test] 를 누른자, 녹색 전광판에 `Test Passed (70 = 70)` 합격 등이 들어온다.
  3. 학습자가 코드를 `100 + iv_seats` 로 오타 리팩터링 실수를 낸다. 
  4. 재테스트를 때리자, 즉각 적색 사이렌 경보음과 함께 `Assert Failed! Expected: 70, Actual: 130` 이 뜨며 배포 트랙이 차단되는 회귀 포착 피드백을 감상한다.
- **상태 및 데이터**:
  - `DB 데이터의 상태에 의존적인 Unit 테스트를 작성해 빌드가 불안정한 상태` -> 런타임 결과: `Test flaky. DB connection state unstable. Test rejected` 하이라이트.
- **피드백**: 단위 테스트는 Mock Object 를 결합해 오직 알고리즘 순수도만을 검증해야 속도와 안전이 수호됨을 체득한다.

### 실수/주의

- **테스트 코드가 상용 운영 메모리를 잠식할까 두려워, 테스트 클래스 정의 시 FOR TESTING 옵션을 빼고 Z클래스에 그냥 서브루틴으로 작성**:
  - 이 실수 시 컴파일러는 이 코드를 정식 테스트로 안 보고 일반 소스로 빌드하여, 운영 배포 시 쌩뚱맞게 테스트용 Z데이터 조작 코드가 상용 DB 에 들어가 트랜잭션을 오염시키는 대재앙을 낳는다.
  - **테스트 코드는 무조건 `FOR TESTING` 배지를 달아 선언해야 하며, 이 배지가 달린 클래스는 운영기 컴파일 시 엔진에서 자동으로 흔적도 없이 삭제되어 성능에 0.001% 도 관여하지 않음을 수호해야 한다.**

### 정리

- 기능을 수정할 때 기존 정상 영역이 깨지는 현상을 **`회귀 버그`** 라고 한다.
- **`ABAP Unit`** 은 예상 값과 실제 값을 비교하는 자동 검문 메서드다.
- 빌드 파이프라인과 결합해 에러 시 배포를 차단하는 **`CI 게이트`** 로서 동작을 보증한다.

---

## CH35-L03 - Transport 관리

### 왜 필요한가

ABAP Unit 과 ATC 스캔까지 합격했다.
이제 안전하게 수확한 코드 꾸러미를 실제 이송 기차에 실어 배포(Deploy)하는 물리 배송망 조율이 장벽이다.
- " 100번 개발 서버에서 예매 테이블(`ZTICKET`)을 새로 만들고, 이 테이블을 조회하는 예매 폼 프로그램(`ZREPORT`)을 열심히 고쳤다.
이제 운영 서버로 배포 도장을 찍고 퇴근했다.
다음 날 아침 출근했더니 운영 서버 전체가 'ZTICKET 이라는 개체가 존재하지 않습니다' 라는 컴파일 신택스 사망 덤프를 내뿜고 예매 결제 전체가 뻗어 있다."
원인을 확인해 보니, 예매 프로그램(`ZREPORT`)만 릴리즈하고, 핵심 테이블(`ZTICKET`)은 다른 이송 요청서(TR)에 담아둔 채 개발기에 방치하여, 운영계에는 테이블도 없이 프로그램만 덜렁 올라가는 **이송 누락** 사고가 난 것이다.
또한, 선행 마스터가 먼저 운영에 가기 전에 뒤따르던 프로그램이 먼저 운영을 밟아 락이 깨지는 **이송 역전** 이 다반사다.

**개발(DEV) -> 품질(QAS) -> 운영(PRD)의 표준 배포 3단계 경로를 수립하고, SE09 에서 의존 객체 누락 없이 요청서(TR)를 릴리즈하며, STMS 이송 제어실을 통해 역전 없이 순서대로 릴리즈 임포트하는 기술**이 필요하다. 그것이 **Transport 관리 (이송 관리)** 다.

### 무엇인가

#### 1. Transport (이송)
- 개발기(DEV) 클라이언트에서 생성/수정한 클래스, 프로그램, 테이블 등의 변경분을 이송 요청서(Transport Request - TR)라는 기차 상자에 정교하게 패키징하여, 품질(QAS)을 거쳐 운영(PRD) 데이터베이스로 물리 복사/설치하는 SAP 전용 배포 기술이다.

#### 2. DEV -> QAS -> PRD 표준 3계 시스템 파이프라인
- **DEV (Development - 개발기)**: 모래성 쌓기 놀이를 하듯 자유롭게 지은 소스를 ATC 와 Unit 테스트로 1차 정화하는 놀이터다.
- **QAS (Quality Assurance - 품질기)**: 현업 부서가 실제 이송 트레인을 수령해 대량 전표를 돌리며 시나리오 수동 테스트를 단행하는 최종 리허설 무대다.
- **PRD (Production - 운영기)**: 실제 100% 라이브 고객 돈이 오가는 최고 엄격 통제 구역이다.

#### ⚠️ [ 운영 PRD 직접 개발 절대 금지 및 STMS 순서 수호 명세 ]
- *형상 관리를 단 한 순간에 붕괴시키고 시스템을 돌이킬 수 없는 상태로 오염시키는 최악의 운영 금지령이다.*
- **운영계 직접 수정 금지**: **긴급 장애 핫픽스가 터졌다고 해서 운영(PRD) 라이브 장비에서 소스 편집기를 쌩 열고 코드를 직접 수정해 저장하는 행위는 법적으로 엄격히 처단 금지된다. 이 짓을 단 1회라도 범하는 순간, 개발기와 운영기의 소스 형상 싱크가 영구히 어긋나(Out of sync) 다음 이송 때 운영 코드가 덮어씌워져 장애가 재발되는 무간도 늪에 빠지기 때문이다. 무조건 개발기(DEV)에서 TR 을 생성해 이송 트랙을 타고 통과해야 한다.**
- **이송 역전 방지 (STMS)**: **A 테이블이 먼저 운영계를 밟은 뒤에 B 프로그램이 뒤따라 들어가야 컴파일이 뚫린다. STMS 이송실에서 B 프로그램을 먼저 Import 단추를 눌러 역전 수송하면, A 테이블이 없어 B 가 컴파일 에러 상태(Inactive)로 멈춰 서서 사용자를 맞이한다. 반드시 선행 의존 개체 순서대로 탑재(Import)해야 한다.**

### 어떻게 확인하는가

SE09 에서 TR 을 Release 하고 STMS 에서 순서대로 수신 임포트하는 프로세스를 검증한다.

```text
[1단계] SE09 이송 요청서 패키징 진단 :
   - 이송 요청서 번호 : EK0K900182 (설명: 예매 테이블 및 리포트 일괄 이송)
   - Object List 검문 :
     └- TABL : ZTICKET (예매 테이블 개체 확인! - 누락 없음!)
     └- PROG : ZREPORT (예매 폼 프로그램 개체 확인!)
   - 검문 완료 후 하위 Task 와 상위 TR 을 차례대로 Release (트레인 출발!)
   
[2단계] STMS 품질계(QAS) 임포트 수행 :
   - STMS 실행 -> QAS Import Queue 진입!
   - EK0K900182 요청서가 큐에 안착되어 있음 확인.
   - [Import Request] 단추 클릭! -> 컴파일 결과 'RC = 0' (성공 안착!)
   - QAS 화면에서 수동 검수 합격 낙찰!
   
[3단계] STMS 운영계(PRD) 최종 순서 이송 :
   - PRD Import Queue 진입 -> 이송 트레인 릴리즈 순서대로 한 줄 임포트 단행!
   - 덤프 없이 깔끔하게 운영계 배포 성료! (전산망 정합성 수호 완료)
```

#### 체험/시뮬레이터 설계 (Transport 경로 신호등)
- **프로세스 플로우**:
  1. 학습자가 [DEV 기지] -> [QAS 기지] -> [PRD 라이브 전산실] 철길 노선을 본다.
  2. [테이블 ZTICKET] 은 놔두고 [프로그램 ZREPORT] 만 TR 에 싣고 [Release] 버튼을 누른다.
  3. 열차가 [PRD 전산실] 에 부딪치는 순간, "ZTABLE missing! Red compile error!" 적색 경보와 함께 라이브 결제창 신호등이 빨간불로 깨진다.
  4. 테이블을 TR 상자에 짝꿍으로 묶고, [선행: ZTICKET 이송] -> [후행: ZREPORT 이송] 철로 스위치를 순서대로 스위칭한다.
  5. 기차가 차례로 들어가 컴파일 100% 무결 초록불이 켜지는 배포 피드백을 감상한다.
- **상태 및 데이터**:
  - `운영(PRD) 장비에서 긴급 개발 락을 강제로 해제하고 소스를 직접 직접 타이핑해 저장한 상태` -> 런타임 결과: `Source drift detected. Version history alignment failed` 하이라이트.
- **피드백**: 운영계는 오직 단방향 이송 파이프라인의 이송 요청서(TR)에 의해서만 문이 열려야 형상이 수호됨을 명심한다.

### 실수/주의

- **이송 요청서(TR)를 릴리즈(Release)하기 전에, 대상 Z오브젝트들이 활성화(Active)가 안 되어 인액티브(Inactive) 상태로 방치**:
  - 이송 기차는 오직 활성화 도장이 찍힌 소스만 싣고 떠나므로, Inactive 상태로 릴리즈하면 개발기에 활성화 안 된 옛날 껍데기 쓰레기 코드나 빈 소스가 운영계에 올라가 실행 즉시 먹통 덤프를 터트린다.
  - **무조건 이송 전 전체 Active 상태 확인을 수호해야 한다.**

### 정리

- 개발물 이송은 **`DEV -> QAS -> PRD`** 의 단방향 엄격 파이프라인을 사수한다.
- **`SE09 / SE10`** 에서 변경 내역을 포장해 릴리즈하고, Basis 통제 도구인 **`STMS`** 에서 임포트한다.
- 의존성 객체가 누락되거나 이송 순서가 **`역전`** 되지 않도록 정교하게 요청서에 짝꿍 결합한다.
- **`운영기 직접 수정`** 은 형상을 파괴하는 절대 불법 행위다.

---

## CH35-L04 - Background Job 운영

### 왜 필요한가

이송 관리 시스템까지 완수했다.
이제 매일 저녁 대량으로 도는 배치 정산 시스템의 '무인 스케줄링 운영' 과 '잡 등록 신택스 제약' 이 장벽이다.
- " 매일 밤 새벽 2시에 자동으로 깨어나서, 낮 동안 쌓인 10만 건의 예매 금액을 은행 전산망과 대조해 결산 정산하는 무거운 배치 프로그램을 돌리고 싶다."
이 대량 연산 프로그램을 낮 시간대에 사용자가 화면을 켠 채 엔터 쳐서 기동하면, 30분 동안 마우스 락이 걸리고 WAS 리소스 전체를 점유해 다른 고객들의 실시간 결제 요청이 타임아웃 덤프를 뿜으며 동시 사망한다.
또한 백그라운드 잡에 등록하는 아바 구문을 짤 때, 예약 지시어 옵션인 **`AND RETURN`** 을 빼먹고 코드를 짜면 아바 컴파일러가 신택스 에러를 내뱉고 빌드를 거부한다.

**대량 야간 처리를 화면 없이 백그라운드로 안전 격리하고(SM36/SM37), SUBMIT VIA JOB API 를 엮을 때는 AND RETURN 구문을 의무적으로 동반 선언하며, USER sy-uname 명시 지정을 배제하여 세션 오염을 방어하는 기술**이 필요하다. 그것이 **Background Job 운영**의 완수다.

### 무엇인가

#### 1. Background Job (배치 잡)
- 대량 데이터 연산이나 주기적인 시스템 정산 작업을 온라인 유저 세션을 방해하지 않기 위해, 화면이 없는 백그라운드 배치 프로세스 슬롯에 스케줄링하여 무인 가동시키는 시스템 운영 기법이다.

#### 2. SM36 과 SM37
- **SM36 (Job Definition)**: "매일 밤 2시 정각에 `ZBOOK_SETTLE` 아바 프로그램을 100번 클라이언트로 깨워서 실행하라" 고 주기 조건과 단계(Step)를 정의하고 예약 도장을 찍는 스케줄러 화면이다.
- **SM37 (Job Monitor)**: 백그라운드에서 예약 작동한 배치 잡들이 "성공적으로 끝났는지(Finished), 지금 도는 중인지(Active), 에러로 폭사했는지(Aborted)" 를 돋보기 모니터링하여 잡 로그와 스풀을 확인하는 전산 관제탑 화면이다.

#### ⚠️ [ SUBMIT VIA JOB AND RETURN 문법 강제 및 USER 생략 명세 ]
- *배치 예약 등록 시 입문자가 100% 구문 장벽에 직면하는 신택스 제약 요건이다.*
- **AND RETURN 의무화**: **`SUBMIT zreport VIA JOB job_name NUMBER job_number` 구문을 적어 배치 잡에 등록할 때는, 무조건 꼬리에 `AND RETURN` 옵션을 함께 심어서 컴파일해야 한다. 만약 이를 빠뜨리면 컴파일러는 "호출한 쪽 프로세스가 즉각 복귀하여 다음 줄을 타야 잡 예약 큐가 성립된다" 며 컴파일을 전면 기각 에러를 뿜는다.**
- **USER sy-uname 기입 금지 (생략)**: **잡 예약 시 `USER sy-uname` 을 수동 명시하는 것은 불필요한 중복(Redundant)이며, 디버깅을 타고 넘어가는 과정에서 sy-uname 시스템 필드가 오염 변조되어 엉뚱한 임의 사용자로 잡 소유권이 이전되어 이송이 누락되는 보안 리스크를 유발한다. 현재 실행 유저로 잡을 태울 때는 USER 구문을 아예 생략하는 것이 표준 규칙이다.**

### 어떻게 확인하는가

JOB_OPEN, SUBMIT VIA JOB AND RETURN, JOB_CLOSE 3단 배치 등록 시퀀스를 검증한다.

```abap
DATA: lv_jobname   TYPE tbtcjob-jobname VALUE 'ZBOOK_DAILY_SETTLE',
      lv_jobcount  TYPE tbtcjob-jobcount,
      ls_print_par TYPE pri_params.

" 1. [배치 잡 껍데기 발급받기 - 번호표 뽑기]
CALL FUNCTION 'JOB_OPEN'
  EXPORTING
    jobname          = lv_jobname
  IMPORTING
    jobcount         = lv_jobcount
  EXCEPTIONS
    cant_create_job  = 1
    invalid_job_data = 2
    OTHERS           = 3.

IF sy-subrc = 0.
  " 2. [★ VIA JOB NUMBER 와 함께 AND RETURN 의무 결선 격발!]
  " (USER sy-uname 은 오염 방지를 위해 생략 처리!)
  SUBMIT zbooking_settle_program
    TO SAP-SPOOL
    SPOOL PARAMETERS ls_print_par
    WITHOUT SPOOL DYNPRO
    VIA JOB lv_jobname NUMBER lv_jobcount
    AND RETURN. " <- 이 AND RETURN 이 없으면 컴파일 신택스 에러 즉사!

  IF sy-subrc = 0.
    " 3. [배치 잡 스케줄 뚜껑 최종 승인 닫기]
    CALL FUNCTION 'JOB_CLOSE'
      EXPORTING
        jobcount             = lv_jobcount
        jobname              = lv_jobname
        strtimmed            = 'X' " 지금 즉시 배치 큐에 올리고 스케줄대로 시작!
      EXCEPTIONS
        cant_start_immediate = 1
        job_close_failed     = 2
        OTHERS               = 3.
  ENDIF.
ENDIF.
```

#### 체험/시뮬레이터 설계 (Background Job 주기 스케줄러)
- **프로세스 플로우**:
  1. 학습자가 [배치 잡 등록기] 와 [SM37 관제 모니터]를 본다. 
  2. [SUBMIT 소스 칩] 에서 [AND RETURN] 옵션 핀을 제거하고 전원을 켠다. 컴파일 에러 전광판에 "VIA JOB requires AND RETURN option" 컴파일 즉사 빨간 불이 번쩍인다.
  3. [AND RETURN] 핀을 찰딱 꽂고 구동한다.
  4. [SM37 모니터] 상에 `Scheduled -> Ready -> Running` 순으로 가상 프로세스가 도는 배너가 점등된다.
  5. 연산 성공 시 `Finished` 초록불이 켜지고, 실패 시 번개 소리와 함께 `Aborted` 적색 경보가 뜨며 꼬리에 [Job Log 조회] 단추가 도킹 활성화되는 라이프사이클 피드백을 감상한다.
- **상태 및 데이터**:
  - `USER sy-uname 을 수동 명시하여 디버거 상에서 세션이 꼬인 상태` -> 런타임 결과: `Job Authorization Conflict. Current session user mismatch. Aborted` 하이라이트.
- **피드백**: 백그라운드 잡은 화면 없는 비동기 대량 처리망이므로, 정교한 JOB 트랜잭션 짝 구성과 AND RETURN 제약 준수가 기둥임을 각인한다.

### 실수/주의

- **백그라운드 잡에서 도는 배치 프로그램 내부에, 사용자의 입력을 유도하는 POPUP_TO_CONFIRM 이나 MESSAGE TYPE 'I' 화면 알림 팝업 창 함수를 기입**:
  - 이 실수 시 낮에 개발할 때는 창이 잘 떠서 넘어가다가, 새벽 2시 화면이 없는 배치 슬롯에서 가동될 때 프로그램이 "화면 응답 없음" 무한 대기 락에 걸려 아바 세션이 뇌사 상태로 고사한다.
  - **배치용 프로그램에는 절대 화면 UI 객체를 섞어서는 안 된다.**

### 정리

- 대량 부하 작업을 유저 세션에서 분리해 무인 자동 스케줄링하는 도구는 **`Background Job`** 이다.
- **`SM36`** 에서 스케줄을 짜고, **`SM37`** 에서 상태(Finished, Aborted)와 로그를 모니터링한다.
- **`SUBMIT ... VIA JOB ... AND RETURN`** 구문을 활용하며 `USER` 명시는 오염 방지를 위해 생략한다.

---

## CH35-L05 - Application Log와 오류 추적

### 왜 필요한가

배치 잡 시스템까지 운영에 올렸다.
이제 최종 결산에서 발생한 "어젯밤 100건 결제 중 2건이 왜 실패했는가" 의 미스터리 실무 원인 추적이 마지막 장벽이다.
- " 야간 배치 정산을 돌렸는데, 아침에 일어나 보니 예약 결산 2건이 조용히 누락되어 빵꾸가 나 있다."
원인을 찾겠다고 코드 곳곳에 `WRITE / '에러 났음'` 이라든지 ZLOG 같은 임시 Z테이블을 만들어 마구 인서트해 두면, 에러가 났을 때 검색하기도 어렵고, 로그 데이터가 무한 증식해 하드 디스크 용량을 갉아먹는다.
또한, 로그 테이블에 "정훈영 고객의 카드 비밀번호 1234, 개인 주민번호" 같은 개인정보(PII) 날것을 아무 보안 마스킹 없이 고스란히 텍스트로 박아 로깅해 두면, 나중에 정보 보안 감사에 적발되어 시스템이 전면 폐기되고 개발팀은 감옥에 가는 대형 보안 사고를 초래한다.

**임시 로그 테이블을 걷어내고, 검색/보관/보안/권한 제어가 보장되는 SAP 표준 로깅 API(Application Log)를 장착하고, SLG1 조회실을 통해 추적하며, 개인 민감정보를 단단히 가드 필터링하는 기술**이 필요하다. 그것이 **Application Log** 의 완수다.

### 무엇인가

#### 1. Application Log (표준 로깅 - BAL)
- SAP 가 제공하는 공인 표준 트랜잭션 로깅 프레임워크다.
- **임시 Z로그 테이블이나 WRITE 덤프 대신, 비즈니스 처리 기록을 객체(Object)와 하위 객체(Subobject) 카테고리별로 정밀 격리 저장해 주며, 기간/유저/프로그램별 인덱스 검색 기능이 기본 내장되어 있어 관리가 매우 용이하다.**

#### 2. BAL_LOG_CREATE -> BAL_LOG_MSG_ADD -> BAL_DB_SAVE 3단 시퀀스
- *로그 기입의 정석 삼총사 API 다.*
- **BAL_LOG_CREATE**: 메모리 상에 로그 편지 봉투(Header)를 임시 생성한다.
- **BAL_LOG_MSG_ADD**: 루프를 돌며 에러/성공 메시지들을 봉투 속에 가득 APPEND 한다.
- **BAL_DB_SAVE**: 메모리에 고여 있던 메시지 묶음을 물리 데이터베이스 표준 로그 테이블(`BALHDR`, `BALDAT`)에 영구 쓰기 커밋 완료시킨다.

#### 3. SLG1 (Application Log Viewer - 로그 조회실)
- *운영의 블랙박스 분석판이다.*
- 백엔드에서 쏟아진 에러 로그들을 객체 단위로 깔끔하게 필터링하여, 경고등 색상별(적색: Error, 황색: Warning, 녹색: Success)로 렌더링해 훑어보는 공인 로그 뷰어 화면이다.

#### ⚠️ [ 로그 기입 시 개인 민감정보 및 보안 유출 가드 명세 ]
- *전산망 개인정보 유출 형사 처벌을 가로막는 절대 보안 철칙이다.*
- **보안 오염**: 에러 상세 사유랍시고 "카드번호 1234-5678-.... 및 패스워드 5562 불일치로 승인 실패" 고 날것의 민감 정보를 문자열에 다 꽂아 로깅을 채운다.
- **방어 규칙**: **로그는 누구나 조회(SLG1)할 수 있는 공용 영역이므로 개인 식별 정보(주민번호, 카드번호 전체, 패스워드)는 문자열을 `REPLACE` 나 정규식으로 걸러 반드시 마스킹(`XXXX-XXXX-XXXX`)하거나 아예 처음부터 담지 않아야 안전이 수호된다.**

### 어떻게 확인하는가

3단 API 로 로그를 생성/추가/저장하고 SLG1 에서 조회하는 코드를 검증한다.

```abap
DATA: ls_log_hdr TYPE bal_s_log,
      lv_log_hnd TYPE balloghndl,
      ls_msg     TYPE bal_s_msg.

" 1. [로그 헤더 뼈대 정의 - ZBOOKING 객체 카테고리 배정]
ls_log_hdr-object    = 'ZBOOKING'.   " SLG1 에서 필터링해 찾을 메인 키!
ls_log_hdr-subobject = 'SETTLEMENT'. " 하위 카테고리 키!
ls_log_hdr-aluser    = sy-uname.
ls_log_hdr-alprogram = sy-repid.

" 2. [1단계: 메모리 상에 임시 로그 봉투 개설]
CALL FUNCTION 'BAL_LOG_CREATE'
  EXPORTING
    i_s_log      = ls_log_hdr
  IMPORTING
    e_log_handle = lv_log_hnd.

" [가정: 루프 연산 중 에러 발생 시 메시지 삽입 격발]
ls_msg-msgty = 'E'. " Error 적색 마크!
ls_msg-msgid = 'ZMSG_BOOK'.
ls_msg-msgno = '001'. " "예매 결재 정산 실패" 메시지!
" [★ 보안 필터링: 카드 비밀번호 등 민감한 원인은 마스킹 처리하여 주입!]
ls_msg-msgv1 = 'CARD_NO: XXXX-XXXX-1234'. " 끝자리만 남기고 마스킹!
ls_msg-msgv2 = 'C001'. " 공연ID

" 3. [2단계: 임시 봉투에 메시지 욱여넣기]
CALL FUNCTION 'BAL_LOG_MSG_ADD'
  EXPORTING
    i_log_handle = lv_log_hnd
    i_s_msg      = ls_msg.

" 4. [3단계: 루프 끝난 뒤 최종 DB 로그 테이블 커밋 저장!]
CALL FUNCTION 'BAL_DB_SAVE'
  EXPORTING
    i_t_log_handle = VALUE #( ( lv_log_hnd ) ).
```

#### 체험/시뮬레이터 설계 (Application Log 뷰어)
- **프로세스 플로우**:
  1. 학습자가 [SLG1 로그 뷰어 화면]을 본다.
  2. 객체 칸에 [ZBOOKING] 을 치고 [실행]을 누른다.
  3. 좌측 트리에 `ZBOOKING -> SETTLEMENT` 폴더가 열린다.
  4. 클릭하자 우측에 [적색 에러등 #10082] 예약 실패 행이 렌더링된다.
  5. 클릭 시 세부 텍스트 창에 "CARD_NO: XXXX-XXXX-1234 결제 거부" 라고 깔끔하게 마스킹된 로그 내용이 보여 합격 초록등이 들어오는 피드백을 감상한다.
- **상태 및 데이터**:
  - `BAL_DB_SAVE 함수 호출을 누락하고 프로그램만 끝낸 상태` -> 런타임 결과: `Log buffers lost. DB save missing. SLG1 read NULL` 하이라이트.
- **피드백**: 로그는 DB 에 저장 승인을 쏘아주어야만 보존되며, 개인 민감정보 마스킹은 개발자의 법적 의무임을 명심한다.

### 실수/주의

- **로그 저장 개수가 너무 무제한으로 많아질 것을 방치하여, 매일 1,000만 건 성공 로그까지 쌩으로 다 저장해 디스크를 폭사시킴**:
  - **성공 로그는 비즈니스 중요 정산 전표 이외에는 가급적 로깅하지 않으며, 에러와 경고 위주로 점유율 균형을 수호해야 한다.** (오래된 로그는 `SARA` 나 삭제 배치 프로그램 `BAL_DELETE` 로 주기적 소거 청소를 설계해야 한다.)

### 정리

- 운영 로그는 Z테이블 대신 공인 표준 로깅 시스템인 **`Application Log`** 를 쓴다.
- **`BAL_LOG_CREATE -> BAL_LOG_MSG_ADD -> BAL_DB_SAVE`** 3단 배선으로 메시지를 기입한다.
- **`SLG1`** 트랜잭션을 통해 카테고리별로 안전 조회하고 분석을 격리한다.
- 로그 저장 시 **`개인 민감정보 (비밀번호 등)`** 는 무조건 마스킹 필터링하여 보안을 수호한다.
- *이 Application Log 아키텍처는 classic/modern 영원 공통이며, Cloud 환경에서도 BAL 클래스나 Released FM 으로 영속 사용된다.*
