# NEWCH38_OLDCH35_REWRITE · 운영 품질과 배포 관리

> 주 소스: `content/abap/CH35/_chapter.md`, `content/abap/CH35/CH35-L01.md` ~ `CH35-L05.md`
> 보조 참고: `reference/codex_0625_v2/CH35_REWRITE.md`, `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md`
> 목표: CH35를 "운영에 올려도 되는 코드인지 판단하고, 배포 후 문제를 추적할 수 있는가"라는 운영 품질 체인으로 재집필한다. 특히 CH26에서 보류한 ABAP Test Double Framework, SQL/CDS Test Double, `TEST-SEAM`/`TEST-INJECTION`의 사용 경계를 CH35-L02A에서 회수한다.

## NEWCH38 전체 설계

초급자는 프로그램이 "실행된다"는 사실에 집중한다. 중급으로 올라오면 "요구사항대로 동작한다"가 중요해진다. 하지만 운영 시스템에 코드를 올리는 개발자는 한 가지 질문을 더 해야 한다.

> 이 코드는 운영에 들어가도 추적 가능하고, 실패해도 원인을 찾을 수 있으며, 다음 수정 때 기존 기능을 깨뜨리지 않는가?

CH35는 이 질문에 답하는 장이다. 관통 예제는 공연 예매 정산 프로그램 `ZBOOK_SETTLE`이다. 개발자는 정산 로직을 수정하고, ABAP Unit으로 회귀를 막고, ATC로 정적 품질을 확인하고, transport로 DEV에서 QAS와 PRD로 이동시킨다. 야간 정산은 background job으로 실행되고, 실패 원인은 Application Log에서 조회한다.

이 장은 다음 흐름으로 배운다.

```text
개발 완료
  -> ABAP Unit으로 업무 약속 검증
  -> ATC/Code Inspector로 정적 품질 점검
  -> Transport로 DEV -> QAS -> PRD 이동
  -> Background Job으로 무인 실행
  -> Application Log로 실패 추적
```

| 레슨 | 주제 | 운영 질문 | 핵심 산출물 |
|---|---|---|---|
| L01 | ATC / Code Inspector | 운영 반영 전 자동 품질 검사에서 막히는가 | finding, priority, check variant, exemption, release gate |
| L02 | ABAP Unit과 회귀 방지 | 수정이 기존 약속을 깨뜨리지 않는가 | test class, test method, assert, red/green result, gate |
| L02A | Test Double 심화 | 외부 의존 없이 로직을 검증할 수 있는가 | manual fake, `CL_ABAP_TESTDOUBLE`, SQL/CDS Test Double, test seam |
| L03 | Transport 관리 | 변경 객체가 올바른 순서와 경로로 이동하는가 | request/task, SE09/SE10, STMS queue/log, dependency order |
| L04 | Background Job 운영 | 사람이 보지 않는 시간에도 안전하게 실행되는가 | SM36, SM37, job status, `SUBMIT ... VIA JOB ... AND RETURN` |
| L05 | Application Log와 오류 추적 | 실패 원인을 운영자가 재현 없이 찾을 수 있는가 | BAL, SLG1, object/subobject, external number, message context |

## NEWCH38 R15 경계

CH35는 Track 2 후반이다. 따라서 CH18 modern syntax, CH19 SQL, CH20 OO, CH23 RAP/Clean Core 개념, CH24 DML/LUW, CH26 테스트 가능한 설계, NEWCH28 Dynamic ABAP 일부 개념을 이미 배운 상태로 본다. 하지만 이 장은 운영 도구를 처음 실무적으로 연결하는 단계이므로 Basis 운영자 수준의 설정, 전체 CI/CD 플랫폼 설계, Cloud tenant별 화면 클릭 절차까지 들어가지 않는다.

| 구분 | NEWCH38에서 정식 사용 | NEWCH38에서 보류 |
|---|---|---|
| ATC | ATC run, finding, priority, variant, exemption, transport release gate, Code Inspector 관계 | ATC 중앙 검사 시스템 sizing, custom check class 구현 전체 |
| ABAP Unit | `CLASS ... FOR TESTING`, `METHODS ... FOR TESTING`, `CL_ABAP_UNIT_ASSERT`, red/green 회귀 gate | 전체 테스트 전략 조직 운영, coverage KPI 운영 정책 |
| Test Double | manual fake/mock, constructor/setter/parameter injection, `CL_ABAP_TESTDOUBLE`, SQL/CDS Test Double 개념, `TEST-SEAM`/`TEST-INJECTION` 경계 | 모든 framework API 암기, RAP BO test double 전체, 복잡한 mocking DSL |
| Transport | SE09/SE10 request/task, STMS import queue/log, DEV/QAS/PRD, release 전 gate | CTS route customizing, ChaRM, retrofit, dual landscape governance |
| Background Job | SM36/SM37, job status, job log, spool, `JOB_OPEN -> SUBMIT VIA JOB AND RETURN -> JOB_CLOSE` | batch server capacity tuning, event chain scheduler 전체 |
| Application Log | BAL 기본 흐름, SLG1 조회, message context, 민감정보 주의 | BAL object customizing 전체, archiving/retention 정책 상세 |
| Cloud/Clean Core | ATC cloud readiness, released API gate, transport/release contract 연결 | BTP subaccount 설정, communication arrangement 상세는 CH36 운영 체크리스트로 연결 |

## 공식 문서 수동 확인 근거

Classic ABAP 공식 문서는 `C:\ABAP_DOCU_HTML`에서 직접 확인했다. ABAP Cloud/테스트 더블 보조 자료는 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU`에서 확인했고, 로컬 문서에 없는 운영 화면성 근거는 SAP Help 공식 문서로 보충 확인했다.

| 주제 | 확인 문서 | NEWCH38 반영 포인트 |
|---|---|---|
| ATC | `abenabap-testcockpit_guidl.htm`, `abenabap_test_cockpit_glosry.htm` | ATC가 Workbench/ADT/Transport Organizer에 통합된 검사 프레임워크이며 ABAP Unit, extended program check, Code Inspector 검사 등을 포함할 수 있음을 반영 |
| ABAP Unit | `abenabap_unit.htm`, `abapclass_for_testing.htm`, `abapmethods_testing.htm` | test class/method, `RISK LEVEL`, `DURATION`, test double/helper는 test code 쪽에 두는 경계 반영 |
| Test Double | `abapcreate_object_for_testing.htm`, `abentest_seams.htm`, `abaptest-seam.htm`, `abaptest-injection.htm`, `14_ABAP_Unit_Tests.md` | manual test double, injection 방식, `CL_ABAP_TESTDOUBLE`, SQL/CDS Test Double, test seam의 legacy-code 보완 경계 반영 |
| Background job | `abapsubmit_via_job.htm`, `abapsubmit.htm`, SAP Help Scheduling Background Jobs/Job Start Conditions | `SUBMIT ... VIA JOB`은 `AND RETURN`과 함께 사용해야 하는 규칙, SM36 start condition, SM37 확인 흐름 반영 |
| Application Log | SAP Help Application Log Methodology, Function Module Overview | `BAL_LOG_CREATE`, `BAL_LOG_MSG_ADD`, `BAL_DB_SAVE`, SLG1 display profile, object/subobject 검색 흐름 반영 |
| Transport | SAP Help Transport Organizer/CTS 자료 | SE09/SE10/SE01 object list 확인, STMS import queue/log, request/task release 흐름 반영 |

## NEWCH38-L01 · ATC / Code Inspector: 출시 전 자동 품질 게이트

### 왜 필요한가

사람은 피곤하면 놓친다. `SELECT`를 loop 안에 넣었는지, 권한 검사를 빠뜨렸는지, 금지 API를 사용했는지, unused variable이 남았는지 매번 눈으로 다 찾기는 어렵다. 운영 반영 직전에 이런 문제가 발견되면 더 큰 문제가 생긴다. 급하게 고치다가 다른 기능이 깨지고, "이번만 예외"가 쌓이면 품질 기준이 무너진다.

ATC는 이런 문제를 자동으로 걸러 주는 품질 게이트다. 개발자가 "내가 보기엔 괜찮다"고 말하는 것이 아니라, 팀이 정한 검사 variant와 finding 기준으로 운영 반영 가능 여부를 판단한다.

### 무엇인가

ATC는 ABAP Test Cockpit이다. ABAP Workbench와 ADT에서 repository object에 대해 검사를 실행하고 결과를 보여 주는 프레임워크다. 공식 문서 기준으로 ATC는 개발 중 필요한 여러 테스트를 실행하고 결과를 표시할 수 있으며, ABAP Unit, extended program check, Code Inspector 계열 검사 등을 포함할 수 있다.

Code Inspector, 즉 `SCI`는 오래된 정적 검사 도구다. ATC는 Code Inspector 검사를 포함해 더 넓은 개발 품질 프로세스와 transport release gate에 연결할 수 있다.

| 용어 | 쉬운 뜻 | 확인 질문 |
|---|---|---|
| Check variant | 어떤 검사 묶음을 실행할지 정한 설정 | 성능/보안/구문/Cloud readiness가 포함되어 있는가 |
| Finding | 검사 결과 발견된 문제 | 어떤 객체, 어떤 줄, 어떤 심각도인가 |
| Priority | finding의 심각도 | release를 막는 P1/P2인가, 권고 수준인가 |
| Exemption | 예외 승인 | 왜 수정하지 않는지 근거와 만료가 있는가 |
| Transport release gate | 이송 release 시점 자동 검사 | release 버튼이 품질 실패를 막는가 |

Classic ABAP 현장에서는 `SCI`와 ATC를 함께 이해해야 한다. 오래된 시스템에는 Code Inspector variant가 남아 있고, 새 시스템은 ATC가 더 중심이 된다. ABAP Cloud 또는 Clean Core 쪽에서는 released API, language version, cloud readiness 검사까지 연결된다.

### 어떻게 확인하는가

1. 검사 대상이 무엇인지 확인한다. 단일 class인지, package 전체인지, transport request 전체인지 구분한다.
2. 어떤 check variant를 실행했는지 확인한다. 느슨한 variant로 통과한 것은 운영 품질 근거가 약하다.
3. finding의 priority를 본다. release를 막아야 하는 finding인지, 근거 있는 예외가 가능한 finding인지 나눈다.
4. finding이 코드, DDIC, package, authorization, SQL 성능, released API 중 어느 축인지 분류한다.
5. transport release와 연결되어 있는지 확인한다. 개발자가 수동으로 한 번 실행한 것과 release gate로 강제되는 것은 다르다.

예매 정산 프로그램에서 ATC finding은 다음처럼 읽는다.

| Finding | 의미 | 조치 |
|---|---|---|
| `SELECT without WHERE` | 대량 데이터를 무조건 읽을 수 있음 | selection 조건과 index 확인 |
| `Missing authorization check` | 업무 권한 검증 누락 가능 | `AUTHORITY-CHECK` 또는 RAP authorization 설계 확인 |
| `Unreleased API used` | Clean Core/ABAP Cloud 위반 가능 | released API 대체 또는 예외 근거 검토 |
| `Unused variable` | 유지보수 노이즈 | 삭제 또는 실제 사용 여부 확인 |

### 실수/주의

- ATC를 마지막 날 한 번 돌리면 늦다. 개발 중, merge 전, transport release 전 여러 번 돌린다.
- 모든 warning을 끄면 품질 게이트가 아니라 장식이 된다.
- exemption은 "귀찮아서 무시"가 아니라 근거, 승인자, 만료가 있는 운영 기록이어야 한다.
- ATC는 사람 리뷰를 대체하지 않는다. 업무 규칙 누락, UX 문제, 장애 대응 절차는 여전히 사람이 봐야 한다.
- ABAP Cloud readiness finding은 classic 시스템에서 통과한 코드라도 Cloud로 갈 때 막힐 수 있음을 알려 준다.

### 체험형 학습 설계

**ATC Finding Gate Simulator**

| 요소 | 설계 |
|---|---|
| 데이터 | transport `DEVK900123`, object `ZBOOK_SETTLE`, findings P1/P2/P3, check variant, exemption list |
| 버튼 | `ATC 실행`, `P1 수정`, `예외 요청`, `예외 승인`, `Release 시도`, `Cloud readiness 보기` |
| 상태 | finding count, highest priority, release gate `BLOCKED/READY`, exemption pending/approved |
| 피드백 | P1이 남은 상태에서 release를 누르면 "Transport release blocked by ATC P1 finding" 표시. 예외 승인 없이 ignore하면 "근거 없는 예외는 운영 추적 불가" 표시 |

### 정리

ATC는 운영 반영 전 자동 품질 게이트다. CH35-L01의 핵심은 "ATC를 돌렸다"가 아니라 "어떤 variant로 어떤 객체를 검사했고, 어떤 finding이 release를 막으며, 어떤 예외가 승인되었는가"를 설명할 수 있는 것이다.

## NEWCH38-L02 · ABAP Unit과 회귀 방지: 고친 코드가 기존 약속을 지키는가

### 왜 필요한가

회귀는 "새 기능을 고쳤더니 기존 기능이 깨지는 일"이다. 예매 정산 로직에서 잔여 좌석 계산을 조금 바꿨는데 취소 로직이 깨질 수 있다. 사용자가 화면에서 한두 번 눌러 본 것만으로는 모든 조건을 검증할 수 없다.

ABAP Unit은 작은 업무 약속을 코드로 남기는 방법이다. 예를 들어 "총 좌석 100개, 예약 50개면 잔여 좌석은 50개"라는 약속을 테스트로 남기면, 누군가 계산식을 잘못 바꿨을 때 즉시 red로 알려 준다.

### 무엇인가

ABAP Unit 테스트는 보통 production class와 같은 개발 객체 안의 local test class에 둔다. test class는 `CLASS ... DEFINITION FOR TESTING`으로 선언하고, test method는 `METHODS ... FOR TESTING`으로 선언한다.

```abap
CLASS ltcl_settlement DEFINITION
  FOR TESTING
  RISK LEVEL HARMLESS
  DURATION SHORT.
  PRIVATE SECTION.
    METHODS remaining_is_total_minus_booked FOR TESTING.
ENDCLASS.

CLASS ltcl_settlement IMPLEMENTATION.
  METHOD remaining_is_total_minus_booked.
    DATA(lo_cut) = NEW zcl_booking_settlement( ).

    cl_abap_unit_assert=>assert_equals(
      act = lo_cut->remaining(
              iv_total  = 100
              iv_booked = 50 )
      exp = 50 ).
  ENDMETHOD.
ENDCLASS.
```

`lo_cut`는 class under test, 즉 테스트 대상 객체를 뜻하는 관용적 이름이다. 테스트 method는 화면을 띄우지 않고 method를 직접 호출한 뒤 실제값과 기대값을 비교한다.

`RISK LEVEL`은 테스트가 시스템 상태에 주는 위험 정도를 나타낸다. `HARMLESS`는 보통 persistent data를 바꾸지 않는 테스트에 기대된다. `DURATION`은 예상 실행 시간이다. `SHORT` 테스트가 느려지고 외부 DB/네트워크에 의존한다면 gate에서 자주 실행하기 어렵다.

### 어떻게 확인하는가

1. 테스트 이름이 업무 약속을 설명하는지 확인한다. `test1`보다 `remaining_is_total_minus_booked`가 낫다.
2. given/when/then 흐름이 보이는지 확인한다.
3. expected 값이 테스트 안에서 명확한지 확인한다.
4. 테스트가 화면, frontend file, 실 DB 상태, 현재 날짜 같은 외부 조건에 과하게 의존하지 않는지 본다.
5. local run뿐 아니라 transport release, CI/gCTS gate에서 실행되는지 확인한다.

### 실수/주의

- 너무 큰 테스트를 unit test라고 부르면 실패 원인을 찾기 어렵다. 먼저 작은 업무 로직부터 테스트한다.
- 운영 DB에 의존하는 테스트는 순서와 데이터 상태에 따라 흔들린다.
- `RISK LEVEL HARMLESS`라고 적고 persistent data를 바꾸면 선언과 실제가 맞지 않는다.
- `SUBMIT` without `AND RETURN`, `LEAVE PROGRAM`, `LEAVE TO TRANSACTION`처럼 테스트 실행 흐름을 끊는 구조는 core logic을 class method로 분리하는 편이 낫다.
- 테스트가 private 구현에 지나치게 붙으면 리팩터링 때 불필요하게 깨진다. public behavior 검증을 우선한다.

### 체험형 학습 설계

**ABAP Unit Release Gate**

| 요소 | 설계 |
|---|---|
| 데이터 | test class `ltcl_settlement`, 3개 test method, expected/actual 값, release gate 상태 |
| 버튼 | `테스트 실행`, `버그 주입`, `expected 수정`, `local run`, `transport gate`, `CI gate` |
| 상태 | passed/failed count, failing method, actual/expected diff, gate `READY/BLOCKED` |
| 피드백 | bug switch가 켜지면 `remaining_is_total_minus_booked`가 red가 되고 transport release가 blocked로 바뀐다 |

### 정리

ABAP Unit은 회귀 방어선이다. CH35-L02의 핵심은 테스트 문법 암기가 아니라 "어떤 업무 약속을 자동으로 남기고, 실패했을 때 운영 반영을 멈출 수 있는가"를 판단하는 것이다.

## NEWCH38-L02A · Test Double 심화: 외부 의존을 끊고 테스트하기

### 왜 필요한가

CH26에서는 dependency injection과 local mock으로 테스트 가능한 설계를 배웠다. 하지만 운영 품질 장인 CH35에서는 한 단계 더 들어가야 한다. 실제 업무 코드는 다음 의존성 때문에 테스트가 흔들린다.

- 데이터베이스 table을 직접 읽는다.
- CDS view 결과에 의존한다.
- 권한 검사, 날짜, 외부 API, background context에 의존한다.
- legacy code라 interface로 깔끔하게 분리되어 있지 않다.

이때 test double이 필요하다. test double은 테스트 중 실제 의존 객체나 데이터 원천을 대신하는 대체물이다. 목적은 "가짜로 대충 넘기기"가 아니라, 테스트가 원하는 입력과 결과를 통제해서 핵심 로직만 검증하는 것이다.

### 무엇인가

테스트 더블을 선택하는 기준은 의존성의 모양이다.

| 의존성 | 우선 선택 | 언제 쓰는가 |
|---|---|---|
| interface 뒤의 repository/service | manual fake/mock | 가장 단순하고 명확하다. CH26에서 배운 방식 |
| global class 또는 interface method 호출 | `CL_ABAP_TESTDOUBLE` | framework로 return/export/exception/interaction을 설정하고 싶을 때 |
| ABAP SQL table/CDS view entity 읽기 | ABAP SQL Test Double Framework | SELECT 결과를 테스트 데이터로 통제하고 싶을 때 |
| CDS entity 자체 로직 | CDS Test Double Framework | CDS dependency를 분리해 CDS 기반 로직을 검증할 때 |
| legacy code의 직접 SELECT/AUTHORITY-CHECK | `TEST-SEAM`/`TEST-INJECTION` | 새 설계로 분리하기 어려운 기존 코드 보완용 |

### manual fake/mock

가장 먼저 고려할 것은 직접 만든 local test double이다.

```abap
INTERFACE zif_booking_repo.
  METHODS get_booked_seats
    IMPORTING iv_concert_id TYPE zconcert_id
    RETURNING VALUE(rv_booked) TYPE i.
ENDINTERFACE.

CLASS ltd_booking_repo DEFINITION FOR TESTING.
  PUBLIC SECTION.
    INTERFACES zif_booking_repo.
ENDCLASS.

CLASS ltd_booking_repo IMPLEMENTATION.
  METHOD zif_booking_repo~get_booked_seats.
    rv_booked = 50.
  ENDMETHOD.
ENDCLASS.
```

테스트는 production repository 대신 `ltd_booking_repo`를 주입한다. 이 방식은 단순하고 읽기 쉽다. 단점은 method가 많거나 interaction 검증이 필요할 때 코드가 길어질 수 있다는 점이다.

### `CL_ABAP_TESTDOUBLE`

ABAP OO Test Double Framework는 test double 생성을 표준화한다. 공식 cheat sheet는 `CL_ABAP_TESTDOUBLE`이 method call의 return/export/changing 값, exception, event, interaction 검증을 지원한다고 설명한다. 단, local class/interface, `FINAL`, `FOR TESTING`, `CREATE PRIVATE`, mandatory constructor parameter 같은 제약이 있을 수 있으므로 무조건 대체 수단으로 보면 안 된다.

개념 흐름은 다음과 같다.

```abap
" 개념 스켈레톤: 실제 API 세부는 시스템 릴리스 문서에 맞춘다.
DATA(lo_double) = cl_abap_testdouble=>create( 'ZIF_BOOKING_REPO' ).

cl_abap_testdouble=>configure_call( lo_double )
  ->returning( 50 ).

lo_double->('GET_BOOKED_SEATS')(
  iv_concert_id = 'C001' ).

DATA(lo_cut) = NEW zcl_booking_settlement(
  io_repo = CAST zif_booking_repo( lo_double ) ).

cl_abap_unit_assert=>assert_equals(
  act = lo_cut->remaining( iv_concert_id = 'C001' )
  exp = 50 ).
```

학습자는 이 코드를 "정확한 method chain 암기"로 받아들이면 안 된다. 핵심은 framework가 test double의 응답과 interaction을 설정해 준다는 점이다. 단순한 한두 method fake는 직접 class를 만드는 쪽이 더 읽기 쉬울 수 있다.

### ABAP SQL/CDS Test Double

일부 legacy code는 repository interface 없이 table이나 CDS view를 직접 읽는다. 이 경우 production DB를 그대로 사용하면 테스트가 데이터 상태에 흔들린다. ABAP cheat sheet는 이런 의존을 다루기 위해 ABAP SQL Test Double Framework와 CDS Test Double Framework를 소개한다.

| Framework | 대표 class | 목적 |
|---|---|---|
| ABAP SQL Test Double | `CL_OSQL_TEST_ENVIRONMENT` | ABAP SQL이 참조하는 table/CDS view entity의 테스트 데이터를 통제 |
| CDS Test Double | `CL_CDS_TEST_ENVIRONMENT` | CDS entity dependency를 테스트 double로 대체 |

개념 흐름은 다음과 같다.

```abap
" 개념 스켈레톤: 실제 method signature는 시스템 릴리스 문서를 따른다.
CLASS-DATA go_sql_env TYPE REF TO if_osql_test_environment.

go_sql_env = cl_osql_test_environment=>create(
  i_dependency_list = VALUE #( ( 'ZBOOKING' ) ) ).

go_sql_env->insert_test_data( lt_booking_test_data ).

DATA(lo_cut) = NEW zcl_booking_reader( ).

cl_abap_unit_assert=>assert_equals(
  act = lo_cut->count_booked_seats( iv_concert_id = 'C001' )
  exp = 50 ).

go_sql_env->clear_doubles( ).
go_sql_env->destroy( ).
```

중요한 감각은 "실 DB를 테스트에 맞게 조작하는 것"이 아니라 "테스트 실행 동안 SQL dependency를 테스트 환경으로 격리하는 것"이다.

### `TEST-SEAM`과 `TEST-INJECTION`

`TEST-SEAM`은 production code에 replaceable block을 만든다. ABAP Unit 실행 중 test class의 `TEST-INJECTION`이 그 block을 대체할 수 있다.

```abap
METHOD read_booked_seats.
  TEST-SEAM select_booking.
    SELECT SUM( seats )
      FROM zbooking
      WHERE concert_id = @iv_concert_id
      INTO @rv_booked.
  END-TEST-SEAM.
ENDMETHOD.
```

테스트에서는 injection으로 DB 접근을 대체한다.

```abap
METHOD booked_seats_without_db.
  TEST-INJECTION select_booking.
    rv_booked = 50.
  END-TEST-INJECTION.

  DATA(lo_cut) = NEW zcl_booking_reader( ).

  cl_abap_unit_assert=>assert_equals(
    act = lo_cut->read_booked_seats( iv_concert_id = 'C001' )
    exp = 50 ).
ENDMETHOD.
```

공식 문서는 test seam이 주로 separation of concerns가 부족해 unit test에 적합하지 않은 legacy code를 보완하는 수단이라고 설명한다. 새 프로그램은 처음부터 interface와 dependency injection으로 설계해 test seam이 불필요하게 만드는 것이 우선이다.

### 어떻게 확인하는가

1. 테스트 대상이 어떤 의존성을 갖는지 목록화한다.
2. interface로 분리 가능한 의존성은 manual fake/mock 또는 `CL_ABAP_TESTDOUBLE`을 우선한다.
3. table/CDS dependency가 문제라면 SQL/CDS Test Double Framework를 검토한다.
4. legacy code를 바로 뜯기 어렵다면 `TEST-SEAM`을 임시 완충 장치로 고려한다.
5. test double이 production code에 섞이지 않는지 확인한다.
6. 테스트가 "성공해야 하는 정상 케이스"와 "실패해야 하는 오류 케이스"를 모두 다루는지 확인한다.

### 실수/주의

- test double은 테스트를 쉽게 통과시키는 도구가 아니다. 업무 약속을 더 정확히 검증하기 위한 통제 장치다.
- 새 코드에서 test seam부터 넣는 것은 경고 신호일 수 있다. 먼저 DI와 interface 분리를 고려한다.
- `CL_ABAP_TESTDOUBLE`은 모든 class를 대체하지 않는다. 제약 조건을 확인한다.
- SQL/CDS Test Double은 테스트 데이터 준비와 cleanup이 중요하다. 이전 테스트 데이터가 다음 테스트를 오염시키면 안 된다.
- interaction 검증을 너무 많이 넣으면 내부 구현 변경 때 테스트가 과하게 깨질 수 있다. 외부 observable behavior를 우선한다.

### 체험형 학습 설계

**Test Double Decision Lab**

| 요소 | 설계 |
|---|---|
| 데이터 | 의존성 유형: interface repo, global service class, direct table SELECT, CDS view, legacy AUTHORITY-CHECK |
| 버튼 | `manual fake 선택`, `CL_ABAP_TESTDOUBLE 선택`, `SQL double 선택`, `CDS double 선택`, `TEST-SEAM 선택`, `DI 리팩터링` |
| 상태 | selected technique, production code change, test isolation score, maintenance risk |
| 피드백 | 새 코드에서 `TEST-SEAM`을 선택하면 "legacy 보완용입니다. DI 가능성을 먼저 검토하세요" 표시. direct table SELECT에는 SQL double 또는 repository 분리를 추천 |

### 정리

CH35-L02A의 목표는 test double 도구 이름을 많이 외우는 것이 아니다. 의존성의 모양을 보고 가장 단순하고 유지보수 가능한 테스트 격리 방법을 선택하는 것이다. 새 코드는 DI와 interface를 우선하고, framework와 test seam은 필요한 경우에 정확히 사용한다.

## NEWCH38-L03 · Transport 관리: DEV에서 PRD까지 변경을 안전하게 옮기기

### 왜 필요한가

CH01에서 이송요청을 처음 봤을 때는 "내 변경을 담는 상자" 정도로 이해했다. CH35에서는 그 상자가 운영 품질의 핵심 통제 단위가 된다.

운영 시스템 PRD에서 직접 코드를 수정하면 누가 무엇을 언제 바꿨는지 추적하기 어렵다. 개발 시스템 DEV에서 만들고, 품질 시스템 QAS에서 테스트하고, 운영 시스템 PRD로 승인된 변경만 이동해야 한다. 이 흐름을 관리하는 것이 Transport 관리다.

### 무엇인가

CTS(Change and Transport System)는 ABAP 시스템 사이에서 변경 객체를 관리하고 이동시키는 체계다. 실무에서 개발자는 SE09/SE10의 Transport Organizer로 task와 request를 보고 release한다. Basis 또는 운영 담당자는 STMS에서 import queue와 import log를 확인한다.

```text
DEV
  - 개발, 단위 테스트
  - task release, request release
  - ATC/ABAP Unit gate
    |
    v
QAS
  - import, 통합 테스트, 사용자 검증
  - import log 확인
    |
    v
PRD
  - 승인된 순서로 import
  - 운영 모니터링
```

| 용어 | 의미 |
|---|---|
| Task | 개발자별 작업 단위. request 안에 들어간다 |
| Request | 운영으로 이동할 변경 묶음 |
| Release | task/request를 더 이상 수정하지 않고 다음 시스템으로 보낼 준비 |
| Import queue | 대상 시스템에 들어올 transport 목록 |
| Import log | import 성공/실패, activation/generation 결과 기록 |
| Return code | import 결과 요약. 숫자만 보지 말고 log를 확인해야 한다 |

### 어떻게 확인하는가

1. request 안의 object list를 확인한다. 프로그램만 있고 DDIC table, class include, message class, test include가 빠지지 않았는지 본다.
2. task가 모두 release되었는지 확인한다.
3. request release 전에 ATC와 ABAP Unit gate가 통과했는지 본다.
4. 의존 request 순서가 맞는지 확인한다. DDIC type이 뒤에 가고 program이 먼저 가면 activation이 깨질 수 있다.
5. QAS import 후 import log를 확인한다.
6. QAS 테스트 승인 없이 PRD import로 넘어가지 않는다.

### 실수/주의

- PRD 직접 수정은 운영 통제 실패다. 긴급 수정도 추적 가능한 절차로 처리한다.
- 의존 transport 순서가 역전되면 import는 성공처럼 보여도 activation 또는 runtime에서 깨질 수 있다.
- object 누락은 흔하다. class만 보냈는데 DDIC type이 빠지거나, test include/check variant 관련 객체가 빠질 수 있다.
- return code만 보고 끝내지 않는다. import log에서 실제 실패 객체와 원인을 확인한다.
- transport는 git commit과 다르다. SAP repository object, customizing, activation, import queue라는 별도 세계를 이해해야 한다.

### 체험형 학습 설계

**Transport Flow Board**

| 요소 | 설계 |
|---|---|
| 데이터 | request `DEVK900123`, tasks, object list, dependencies, ATC/Unit result, DEV/QAS/PRD lanes |
| 버튼 | `Task release`, `Request release`, `Import to QAS`, `Run QAS tests`, `Approve PRD import`, `Show import log` |
| 상태 | task open/released, request modifiable/released, queue position, import RC, gate status |
| 피드백 | task가 남아 있으면 request release 비활성. ATC P1이 남으면 release blocked. dependency가 뒤집히면 QAS import에서 activation error 표시 |

### 정리

Transport 관리는 객체 이동이 아니라 운영 통제다. CH35-L03의 핵심은 "어떤 객체가, 어떤 순서로, 어떤 검증을 통과해, 어느 시스템에 들어갔는가"를 추적하는 능력이다.

## NEWCH38-L04 · Background Job 운영: 사람이 보지 않는 시간에도 안전하게 실행하기

### 왜 필요한가

SAP 업무에는 화면에서 사용자가 기다리며 실행하면 안 되는 작업이 많다. 야간 정산, 대량 청구, 외부 인터페이스 수신, 오래 걸리는 집계는 dialog로 처리하면 timeout, lock, 성능 문제가 생길 수 있다.

Background job은 이런 작업을 정해진 시간이나 조건에 따라 무인 실행하는 운영 방식이다. 하지만 사람이 보고 있지 않기 때문에 더 많은 증거가 필요하다. 언제 시작했는지, 어떤 variant로 실행했는지, 몇 건을 처리했는지, 실패했는지, 재시작해도 안전한지 남아 있어야 한다.

### 무엇인가

SAP GUI에서는 `SM36`에서 background job을 정의하고 스케줄하며, `SM37`에서 job overview와 log, spool을 확인한다. ABAP 코드에서는 `JOB_OPEN`, `SUBMIT ... VIA JOB ... NUMBER ... AND RETURN`, `JOB_CLOSE` 흐름으로 report를 job step에 넣을 수 있다.

```abap
DATA lv_jobname TYPE tbtcjob-jobname VALUE 'ZBOOK_SETTLE_NIGHTLY'.
DATA lv_jobcount TYPE tbtcjob-jobcount.

CALL FUNCTION 'JOB_OPEN'
  EXPORTING
    jobname  = lv_jobname
  IMPORTING
    jobcount = lv_jobcount.

SUBMIT zbook_settle
  VIA JOB lv_jobname NUMBER lv_jobcount
  USING SELECTION-SET 'NIGHTLY_SETTLE'
  AND RETURN.

CALL FUNCTION 'JOB_CLOSE'
  EXPORTING
    jobname   = lv_jobname
    jobcount  = lv_jobcount
    strtimmed = abap_true.
```

공식 문서 기준으로 `SUBMIT ... VIA JOB`은 `AND RETURN`과 함께 사용해야 한다. 이 문장은 프로그램을 즉시 dialog로 실행하는 것이 아니라 background request 조건에 맞춰 처리되게 한다.

### 어떻게 확인하는가

1. SM36에서 job name, step program, variant, execution user, start condition을 확인한다.
2. start condition이 즉시, 특정 시각, 주기, event 중 무엇인지 확인한다.
3. SM37에서 scheduled, released, active, finished, canceled 상태를 확인한다.
4. finished라도 업무적으로 성공했는지 Application Log와 처리 건수로 확인한다.
5. job log와 spool을 본다. 기술 로그와 업무 로그는 다르다.
6. 실패 후 재시작해도 중복 처리되지 않는지 확인한다.

### 실수/주의

- dialog report를 그대로 background에 태우면 frontend file, popup, 사용자 입력 대기에서 실패할 수 있다.
- variant 없이 background job을 만들면 조건이 불명확해진다.
- job이 `Finished`라도 업무 오류가 있을 수 있다. SLG1 Application Log를 함께 본다.
- 중복 실행 방지 없이 주기 job을 만들면 같은 건을 두 번 처리할 수 있다.
- `SUBMIT VIA JOB`에서 `AND RETURN` 규칙을 지키지 않으면 문법/동작 경계가 깨진다.

### 체험형 학습 설계

**Background Job State Machine**

| 요소 | 설계 |
|---|---|
| 데이터 | job name, variant, start condition, processed count, failed count, job log, spool, application log link |
| 버튼 | `SM36 정의`, `Release`, `Start`, `Finish`, `Fail`, `Restart`, `Show spool`, `Open SLG1` |
| 상태 | scheduled/released/active/finished/canceled, restartable, duplicate risk, log saved |
| 피드백 | `Fail`을 누르면 `SM37: Canceled`, `4,000/10,000 processed`, `SLG1: 17 errors` 표시. restartable이 꺼져 있으면 "중복 처리 위험" 경고 |

### 정리

Background job은 "밤에 자동 실행되는 report"가 아니라 운영 프로세스다. CH35-L04의 핵심은 실행 자체보다 상태 확인, spool/log 확인, 중복 방지, 재시작 설계를 운영 기준으로 보는 것이다.

## NEWCH38-L05 · Application Log와 오류 추적: 운영자가 원인을 찾을 수 있게 남기기

### 왜 필요한가

운영 장애에서 가장 답답한 상황은 "실패했다"는 사실만 있고 "왜 실패했는지"가 없는 경우다. 개발자가 임시로 `WRITE`를 찍었거나 internal table에만 메시지를 담았다면 job이 끝난 뒤에는 확인할 수 없다. 사용자가 화면에서 본 메시지도 시간이 지나면 사라진다.

Application Log는 운영자가 실패 원인을 검색하고 재처리 판단을 할 수 있게 만드는 표준 로그 방식이다. 특히 background job, interface, 대량 DML처럼 화면이 없거나 처리 건수가 많은 프로그램에서는 업무 로그가 필수다.

### 무엇인가

Application Log는 SAP의 BAL(Business Application Log) 기반 로그다. 기본 구성은 object, subobject, external number, message, context다. 운영자는 `SLG1`에서 object/subobject, 기간, 사용자, external number 같은 조건으로 로그를 검색한다.

| 구성 | 의미 | 예 |
|---|---|---|
| Object | 큰 업무 영역 | `ZBOOK` |
| Subobject | 세부 처리 영역 | `SETTLE`, `INTERFACE`, `CANCEL` |
| External number | 실행 단위 식별자 | `RUN-20260706-020000` |
| Message | 실제 성공/경고/오류 | `Booking C001 failed: capacity exceeded` |
| Context | 재처리 판단에 필요한 key/value | concert id, booking id, step |

개념 흐름은 다음과 같다.

```abap
DATA ls_log TYPE bal_s_log.
DATA lv_handle TYPE balloghndl.

ls_log-object    = 'ZBOOK'.
ls_log-subobject = 'SETTLE'.
ls_log-extnumber = 'RUN-20260706-020000'.

CALL FUNCTION 'BAL_LOG_CREATE'
  EXPORTING
    i_s_log      = ls_log
  IMPORTING
    e_log_handle = lv_handle.

CALL FUNCTION 'BAL_LOG_MSG_ADD'
  EXPORTING
    i_log_handle = lv_handle
    i_s_msg      = VALUE bal_s_msg(
      msgty = 'E'
      msgid = 'ZBOOK'
      msgno = '001'
      msgv1 = 'C001' ).

CALL FUNCTION 'BAL_DB_SAVE'.
```

이 코드는 "로그 생성 -> 메시지 추가 -> DB 저장"의 최소 흐름이다. 실제 프로젝트에서는 message class, long text, context structure, retention, authorization, 개인정보 마스킹까지 확인한다.

### 어떻게 확인하는가

1. object/subobject가 업무 검색에 맞게 설계되었는지 확인한다.
2. external number가 job run, interface file, request id처럼 실행 단위를 식별하는지 확인한다.
3. message에 key와 단계가 들어 있는지 본다.
4. 오류만이 아니라 중요한 성공/경고도 균형 있게 남기는지 확인한다.
5. `BAL_DB_SAVE`로 DB 저장이 되는지 확인한다.
6. SLG1에서 운영자가 같은 조건으로 로그를 찾을 수 있는지 확인한다.
7. 민감정보가 로그에 남지 않는지 확인한다.

### 실수/주의

- `WRITE`는 운영 로그가 아니다. 화면 출력은 job이 끝나면 추적성이 약하다.
- 메시지가 "실패" 한 단어뿐이면 운영자가 재처리할 수 없다. 어떤 key, 어떤 단계, 어떤 원인인지 남긴다.
- 너무 많은 성공 로그는 노이즈가 된다. 운영자가 필터링할 수 있게 message type과 context를 설계한다.
- 개인정보, 비밀번호, 카드번호 같은 민감정보를 로그에 남기지 않는다.
- `BAL_DB_SAVE`를 잊으면 나중에 SLG1에서 찾을 수 없다.

### 체험형 학습 설계

**SLG1 Application Log Viewer**

| 요소 | 설계 |
|---|---|
| 데이터 | object `ZBOOK`, subobject `SETTLE`, external number, S/W/E messages, booking key, job id |
| 버튼 | `전체`, `오류`, `경고`, `성공`, `SM37에서 열기`, `재처리 후보 추출`, `민감정보 검사` |
| 상태 | selected filter, visible messages, retry candidates, sensitive-data warning |
| 피드백 | 오류 row를 누르면 booking id, step, reason, suggested action 표시. 민감정보 패턴 발견 시 "로그 정책 위반" 표시 |

### 정리

Application Log는 운영자가 실패 원인을 찾고 재처리 판단을 할 수 있게 만드는 업무 로그다. CH35-L05의 핵심은 "로그를 남겼다"가 아니라 "운영자가 재현 없이도 무엇이 실패했고 다음 행동이 무엇인지 알 수 있게 남겼는가"다.

## NEWCH38 종합 실습 · 운영 반영 준비 보드

마지막 실습은 `ZBOOK_SETTLE` 운영 반영 준비 보드다.

```text
[Code Ready]
  -> [Unit Tests]
  -> [ATC]
  -> [Transport]
  -> [QAS Import/Test]
  -> [Background Job]
  -> [Application Log]
  -> [PRD Ready]
```

| 체크 항목 | 통과 기준 |
|---|---|
| ABAP Unit | 핵심 계산, 오류 케이스, test double 격리 통과 |
| ATC | P1/P2 finding 0 또는 승인된 exemption |
| Transport | object list 완전, dependency order 정리, task/request release |
| QAS | import log 정상, 통합 테스트 승인 |
| Background Job | SM36 variant/start condition 정의, SM37 모니터링 기준 수립 |
| Application Log | SLG1에서 run별 object/subobject/external number로 조회 가능 |
| Clean Core | released API/ATC cloud readiness finding 확인 |

체험형 화면은 왼쪽에 checklist, 가운데에 DEV/QAS/PRD lane, 오른쪽에 failure detail panel을 둔다. `Run full gate` 버튼을 누르면 테스트 실패, ATC P1, transport dependency missing, job canceled, log missing 같은 실패를 순차적으로 표시한다. 학습자는 각 실패를 해결해야 `PRD Ready` 상태에 도달한다.

## NEWCH38 마무리

CH35의 다섯 도구는 따로 외우는 목록이 아니다.

| 도구 | 막는 사고 |
|---|---|
| ATC | 정적 품질 문제와 정책 위반이 운영으로 넘어가는 사고 |
| ABAP Unit | 수정이 기존 업무 약속을 깨는 회귀 |
| Test Double | 외부 의존 때문에 테스트가 불안정해지는 문제 |
| Transport | 변경 객체가 누락되거나 잘못된 순서로 운영에 들어가는 문제 |
| Background Job | 무인 실행이 실패했는데 아무도 모르는 문제 |
| Application Log | 실패 원인을 재현 없이는 찾지 못하는 문제 |

운영 가능한 ABAP 개발자는 "코드가 실행된다"에서 멈추지 않는다. 자동 테스트와 ATC로 막고, transport로 추적하며, background job과 application log로 운영 상태를 관찰한다. CH36 Capstone에서는 이 운영 품질 기준을 RAP/Fiori 실전 앱 마감 조건으로 다시 사용한다.
