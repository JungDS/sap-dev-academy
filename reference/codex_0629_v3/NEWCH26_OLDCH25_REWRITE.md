# CH25_REWRITE · Lock Object와 동시성 제어

> 주 소스: `content/abap/CH25/_chapter.md`, `content/abap/CH25/CH25-L01.md` ~ `CH25-L05.md`  
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, `reference/codex_0629_v3/CH24_REWRITE.md`  
> 목표: CH25를 Track-2의 동시성 제어 장으로 재집필하여, 입문자가 "데이터를 안전하게 바꾼다"에서 한 걸음 더 나아가 "여러 사용자가 동시에 바꿔도 안전하게 만든다"를 이해하게 한다.

## CH25 전체 설계

CH24는 한 프로그램 안에서 데이터를 바꾸고 commit/rollback하는 방법을 다뤘다. 하지만 실무 SAP 시스템에는 한 명의 사용자만 있는 것이 아니다. 같은 예매를 상담원 A와 상담원 B가 동시에 열 수 있고, 한쪽이 좌석 수를 2로 바꾼 직후 다른 쪽이 오래된 화면 값으로 1을 저장할 수 있다. 이때 commit/rollback만으로는 충분하지 않다. commit은 내 작업 단위를 확정하거나 취소할 뿐, 남이 동시에 같은 데이터를 만지는 것을 자동으로 막아 주지 않는다.

CH25의 핵심은 "수정하기 전에 먼저 작업권을 확보한다"이다. SAP에서는 이 작업권을 SAP lock으로 관리하고, 그 기반이 Lock Object다. Lock Object를 ABAP Dictionary에서 만들면 `ENQUEUE_...`와 `DEQUEUE_...` lock function module이 자동 생성된다. 프로그램은 이 함수를 호출해 중앙 lock table에 잠금 항목을 만들고 지운다. 이미 다른 사용자가 잠근 데이터라면 `foreign_lock`으로 거절한다.

입문자가 CH25에서 잡아야 할 질문은 다음과 같다.

| 질문 | 기대 답 |
|---|---|
| 왜 CH24의 commit만으로 부족한가? | commit은 내 LUW를 제어하지만, 다른 사용자의 동시 편집 자체를 막지는 않는다. |
| Lock Object는 무엇인가? | ABAP Dictionary에 정의하는 SAP lock의 기준 object이며, 생성 시 enqueue/dequeue function module이 자동 생성된다. |
| 무엇을 잠그는가? | 보통 업무 키, 예를 들어 `booking_id` 단위로 잠근다. 키를 비우면 더 넓은 범위가 잠겨 동시성이 떨어질 수 있다. |
| 충돌은 어떻게 알 수 있는가? | 같은 lock을 다른 사용자가 이미 갖고 있으면 enqueue function module이 `foreign_lock` 예외로 종료한다. |
| 언제 풀리는가? | `DEQUEUE`, 프로그램 종료, `_SCOPE`와 SAP LUW/update 처리에 따른 commit/rollback 시점에서 풀릴 수 있다. |
| 꼭 비관적 잠금만 써야 하는가? | 충돌 가능성이 낮으면 timestamp/ETag 같은 변경 추적값으로 optimistic 전략을 쓸 수 있다. |

## CH25 R15 경계

CH25는 Classic ABAP의 SAP lock과 동시성 제어 장이다. CH24의 DML/commit을 기반으로 하지만, 대량 처리 성능이나 RAP lock contract로 확장하지 않는다.

| 구분 | CH25에서 정식 사용 | CH25에서 보류 |
|---|---|---|
| Lock Object | SE11 lock object, Primary Table, Lock Argument, generated lock function modules | 복잡한 multi-table foreign key lock 설계 심화 |
| Lock function module | `ENQUEUE_EZ_BOOKING`, `DEQUEUE_EZ_BOOKING`, `foreign_lock`, `system_failure` | custom enqueue server 운영, SM12 관리 정책 심화 |
| Lock mode | `S`, `E`, `X`, optimistic `O` 개념 | lock mode 조합 전체 운영 matrix 암기 |
| Lock duration | `_SCOPE` 1/2/3 개념, commit/rollback 해제 조건의 주의 | update task 장애 복구 운영 상세 |
| 충돌 시나리오 | Lost Update, Pessimistic, Optimistic timestamp check | RAP ETag 구현 세부, HTTP OData concurrency protocol |
| 통합 패턴 | ENQUEUE → READ → CHECK → UPDATE → COMMIT/ROLLBACK → DEQUEUE | ALV edit event 저장 흐름은 CH28, BAPI/RFC 통합은 CH30 |

CH25에서는 "잠금은 ABAP SQL SELECT를 자동으로 막는 벽이 아니다"도 명확히 한다. 공식 예제는 lock된 row도 프로그램이 별도 lock check를 하지 않으면 ABAP SQL로 접근할 수 있음을 보여 준다. 즉 SAP lock은 개발자가 `ENQUEUE_*` 호출과 예외 처리를 프로그램 흐름에 넣어야 의미가 있다.

## 공식 문서 수동 확인 근거

Classic ABAP 관련 문서는 `C:\ABAP_DOCU_HTML`에서 직접 확인했다. Markdown 사본은 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md`에서 대조했다.

| 주제 | 확인 문서 | 반영 포인트 |
|---|---|---|
| SAP lock 개념 | `abensap_lock.htm`, `ABENSAP_LOCK.md` | SAP locks are based on lock objects, 중앙 lock table, `SM12`, `FOREIGN_LOCK`, `_SCOPE` |
| enqueue/dequeue 예제 | `abenenqueue_abexa.htm`, `ABENENQUEUE_ABEXA.md` | `ENQUEUE_EDEMOFLHT`, `DEQUEUE_EDEMOFLHT`, `SM12`, locked row도 SQL 접근 가능 |
| Lock Object | `abenlock_object_glosry.htm`, `ABENLOCK_OBJECT_GLOSRY.md` | ABAP Dictionary repository object, 생성 시 lock function module 자동 생성 |
| Lock Function Module | `abenlock_function_module_glosry.htm`, `ABENLOCK_FUNCTION_MODULE_GLOSRY.md` | `ENQUEUE_`는 설정, `DEQUEUE_`는 제거 |
| Exclusive/Shared | `ABENEXCLUSIVE_LOCK_GLOSRY.md`, `ABENSHARED_LOCK_GLOSRY.md` | exclusive는 동시 lock 차단, shared는 다른 shared 허용·exclusive 차단 |
| Optimistic control | `ABENOPTIMISTIC_CONC_CONTROL_GLOSRY.md` | RAP에서는 ETag로 보장하지만, CH25에서는 timestamp 비교 사고방식으로 설명 |

## CH25-L01 · Lock Object 설계 기준

### 왜 필요한가

CH24에서 안전한 DML과 commit/rollback을 배웠다. 그런데 두 사용자가 같은 데이터를 동시에 수정하면 문제가 남는다. 상담원 A가 예매 `1001`을 열어 좌석 수를 2로 바꾼다. 상담원 B도 같은 예매를 열어 상태를 취소로 바꾼다. 두 사람이 각각 오래된 화면 상태를 들고 저장하면, 마지막으로 저장한 사람이 앞 사람의 변경을 덮어쓸 수 있다.

이 문제는 commit을 잘한다고 없어지지 않는다. 두 사람 모두 자기 프로그램 안에서는 정상 commit했기 때문이다. 그래서 수정 전 "이 업무 키는 지금 내가 작업 중"이라는 표시가 필요하다. SAP에서는 이 표시를 SAP lock으로 관리하고, 그 설계 기준이 Lock Object다.

### 무엇인가

Lock Object는 ABAP Dictionary에 정의하는 repository object다. 이 object는 어떤 DDIC database table의 어떤 key를 기준으로 SAP lock을 걸지 정의한다. 생성하면 `ENQUEUE_`와 `DEQUEUE_` prefix가 붙은 lock function module이 자동으로 만들어진다.

예매 테이블 `ZBOOKING`을 기준으로 한다면 기본 설계는 다음과 같다.

| 구성 | 예 | 의미 |
|---|---|---|
| Lock Object 이름 | `EZ_BOOKING` | 관례적으로 `E` + 대상 또는 업무 이름 |
| Primary Table | `ZBOOKING` | 잠금의 기준 테이블 |
| Lock Argument | `BOOKING_ID` | 실제로 어느 예매를 잠글지 정하는 key |
| Generated FM | `ENQUEUE_EZ_BOOKING` | 중앙 lock table에 잠금 등록 |
| Generated FM | `DEQUEUE_EZ_BOOKING` | 중앙 lock table에서 잠금 제거 |

Lock Argument가 중요하다. `booking_id = 1001`을 넘기면 1001번 예매만 잠그는 의도다. key 값을 비워 넓게 잠그면 더 많은 row가 막힌다. 초보자는 "넓게 잠그면 더 안전하다"고 생각하기 쉽지만, 실제로는 다른 사용자의 정상 작업까지 막아 시스템 사용성을 떨어뜨린다.

### 잠금 모드

Lock function module에는 `MODE_<table>` 형태의 parameter가 있다. 대표적인 mode는 다음과 같다.

| 모드 | 의미 | 사용 감각 |
|---|---|---|
| `S` | Shared lock | 읽기 보호 성격. 다른 shared lock은 허용하고 exclusive lock은 막는다. |
| `E` | Exclusive lock | 변경 작업의 일반적인 선택. 다른 사용자의 같은 데이터 lock을 막는다. |
| `X` | Expanded exclusive lock | 일반 exclusive보다 강해 같은 프로그램 안의 중복 요청도 허용하지 않는 특수 상황용이다. |
| `O` | Optimistic lock | 처음에는 shared처럼 동작하다가 exclusive로 전환할 수 있는 성격이다. CH25에서는 개념만 소개한다. |

대부분의 단순 수정 화면은 `E`를 먼저 이해하면 된다. "내가 수정하는 동안 같은 업무 키를 다른 사용자가 수정하지 못하게 한다"가 핵심이다.

### 어떻게 확인하는가

1. `SE11`에서 Lock Object를 선택한다.
2. `EZ_BOOKING` 같은 이름으로 lock object를 만든다.
3. Primary Table에 `ZBOOKING`을 지정한다.
4. Lock Argument에 `BOOKING_ID`를 포함한다.
5. 활성화 후 `ENQUEUE_EZ_BOOKING`, `DEQUEUE_EZ_BOOKING`이 생성되었는지 확인한다.
6. `SM12`에서 실행 중 lock entry가 보이는지 다음 레슨의 호출 예제로 확인한다.

### 실수와 주의

- 테이블 전체를 잠그면 동시성이 급격히 떨어진다. 가능한 업무 key 단위로 좁게 잡는다.
- lock object를 만들었다고 자동으로 보호되는 것이 아니다. 프로그램에서 `ENQUEUE_*`를 호출해야 한다.
- lock mode를 무조건 강하게 잡는다고 좋은 설계가 아니다. 충돌 위험과 사용자 대기 시간을 함께 본다.
- SAP lock은 application-level lock이다. 단순 `SELECT`가 자동으로 막힌다고 오해하지 않는다.

### 체험형 학습 설계

**Lock Object 설계 보드**

| 요소 | 설계 |
|---|---|
| 데이터 | `ZBOOKING` field 목록, key 후보, lock argument 후보, lock mode 선택 |
| 버튼 | `booking_id만 잠그기`, `customer_id까지 잠그기`, `key 비우기`, `E/S/X 비교`, `생성 FM 보기` |
| 상태 | lock scope, affected rows, expected wait users, generated FM names |
| 피드백 | key를 비우면 "테이블 전체 또는 넓은 범위가 막힐 수 있음"을 붉게 보여 주고, `booking_id`만 선택하면 다른 예매는 계속 수정 가능함을 보여 준다. |

### 정리

Lock Object는 동시 변경을 막기 위한 SAP lock의 설계도다. Primary Table과 Lock Argument로 "무엇을 잠글지"를 정하고, 활성화로 생성되는 `ENQUEUE_`/`DEQUEUE_` 함수를 프로그램에서 호출해야 실제 보호가 시작된다.

## CH25-L02 · ENQUEUE / DEQUEUE Function Module

### 왜 필요한가

Lock Object는 설계일 뿐이다. 실제 프로그램에서 잠금을 걸고 풀려면 생성된 lock function module을 호출해야 한다. 이 호출을 저장 흐름 앞에 넣어야 "먼저 작업권을 얻은 사용자만 수정 진행"이라는 규칙이 생긴다.

### 무엇인가

`ENQUEUE_EZ_BOOKING`은 lock entry를 중앙 lock table에 등록한다. 같은 key에 이미 충돌하는 lock entry가 있으면 `foreign_lock` 예외가 난다. `DEQUEUE_EZ_BOOKING`은 내가 가진 lock entry를 제거한다.

```abap
CALL FUNCTION 'ENQUEUE_EZ_BOOKING'
  EXPORTING
    mode_zbooking = 'E'
    booking_id    = lv_booking_id
  EXCEPTIONS
    foreign_lock   = 1
    system_failure = 2
    OTHERS         = 3.

CASE sy-subrc.
  WHEN 0.
    " 잠금 성공. 이제 읽고 변경해도 된다.
  WHEN 1.
    MESSAGE '다른 사용자가 이 예매를 편집 중입니다.' TYPE 'E'.
  WHEN 2 OR 3.
    MESSAGE '잠금 처리 중 시스템 오류가 발생했습니다.' TYPE 'E'.
ENDCASE.
```

해제는 다음처럼 호출한다.

```abap
CALL FUNCTION 'DEQUEUE_EZ_BOOKING'
  EXPORTING
    mode_zbooking = 'E'
    booking_id    = lv_booking_id.
```

중요한 점은 `foreign_lock`을 업무 오류로 다루어야 한다는 것이다. 사용자가 잘못한 것이 아니라 다른 사용자가 먼저 편집 중인 정상적인 동시성 상황이다. 메시지는 비난이 아니라 안내여야 한다.

### 어떻게 확인하는가

1. 세션 A에서 `booking_id = 1001`로 `ENQUEUE_EZ_BOOKING`을 호출한다.
2. `SM12`에서 lock entry가 생겼는지 확인한다.
3. 세션 B에서 같은 `booking_id = 1001`로 같은 enqueue를 호출한다.
4. 세션 B가 `foreign_lock`으로 거절되는지 확인한다.
5. 세션 A에서 `DEQUEUE_EZ_BOOKING`을 호출한다.
6. 세션 B가 다시 enqueue할 수 있는지 확인한다.

공식 예제는 lock이 걸린 row도 ABAP SQL `SELECT` 자체는 접근할 수 있음을 보여 준다. 그래서 읽기 프로그램이 lock check 없이 그냥 조회하는 것은 가능할 수 있다. 하지만 수정 프로그램은 저장 전 반드시 enqueue를 시도하고 `foreign_lock`을 처리해야 한다.

### 실수와 주의

- `foreign_lock`을 `OTHERS`에 뭉뚱그리면 사용자에게 정확한 안내를 못 한다.
- `system_failure`를 `foreign_lock`처럼 처리하면 실제 lock infrastructure 문제를 놓친다.
- `ENQUEUE` 성공 후 바로 긴 화면 입력을 시작하면 다른 사용자가 오래 기다릴 수 있다. 가능한 짧은 수정 구간에서 잠근다.
- 잠금 성공 후 예외가 발생하는 경로에서도 해제가 필요하다. 오류 경로를 포함해 흐름을 설계한다.

### 체험형 학습 설계

**2세션 잠금 데모**

| 요소 | 설계 |
|---|---|
| 데이터 | User A, User B, `booking_id=1001`, 중앙 lock table, `SM12` 표시 영역 |
| 버튼 | `A ENQUEUE`, `B ENQUEUE`, `A DEQUEUE`, `B 다시 시도`, `A 세션 종료`, `SM12 열기` |
| 상태 | current lock owner, lock key, A/B `sy-subrc`, exception name, visible lock table rows |
| 피드백 | B가 실패하면 `foreign_lock`을 별도 색상으로 표시하고, "수정 진행 금지, 재조회 또는 나중에 다시 시도"를 안내한다. |

### 정리

Lock Object를 활성화하면 lock function module이 생긴다. 수정 프로그램은 `ENQUEUE_*` 성공 후에만 변경 흐름으로 들어가야 하며, `foreign_lock`은 반드시 별도로 처리해야 한다. `DEQUEUE_*`는 작업권을 반납하는 호출이다.

## CH25-L03 · Lock 해제와 예외 처리

### 왜 필요한가

잠금은 너무 약해도 문제지만, 너무 오래 잡아도 문제다. 잠금을 걸고 해제하지 않으면 다른 사용자는 같은 데이터를 계속 수정할 수 없다. 반대로 변경이 끝나기 전에 너무 일찍 풀면 잠금의 보호 효과가 사라진다. CH25-L03의 목표는 "언제 풀리는가"를 정확히 이해하고, 과장된 자동 해제 믿음을 피하는 것이다.

### 무엇인가

SAP lock은 중앙 lock table의 entry로 유지된다. 이 entry는 `DEQUEUE_*` 호출로 지울 수 있고, `_SCOPE` parameter에 따라 프로그램, SAP LUW, update 처리와 연결될 수 있다.

공식 문서 기준 `_SCOPE`의 핵심 의미는 다음과 같다.

| `_SCOPE` | 의미 | 해제 감각 |
|---|---|---|
| `1` | lock을 같은 program에서 처리 | `DEQUEUE` 또는 program 종료로 해제 |
| `2` | lock을 current SAP LUW/update와 연결 | update FM 등록이 있으면 `COMMIT WORK`/`ROLLBACK WORK` 완료 흐름에서 해제 |
| `3` | program과 update 양쪽에서 처리 | 양쪽 해제 조건이 모두 충족되어야 완전히 해제 |

그래서 "commit/rollback이면 무조건 모든 lock이 즉시 풀린다"라고 단정하면 위험하다. 실무 설명에서는 "일반적인 저장 패턴에서는 commit/rollback과 함께 해제되도록 설계하지만, 실제 해제 조건은 `_SCOPE`와 update 처리에 의존한다"가 정확하다.

`DEQUEUE_ALL`은 현재 context에서 잡은 lock들을 한 번에 해제하는 도구로 쓰일 수 있다. 다만 실무 코드에서 무조건 남발하면 의도치 않은 다른 lock까지 풀 수 있으므로, 어떤 lock을 풀고 있는지 명확한 곳에서만 사용한다.

### 어떻게 확인하는가

1. enqueue 호출 시 `_SCOPE` 값을 확인한다. 생략 시 시스템/생성 FM 기본값에 의존하지 말고 팀 표준을 확인한다.
2. `SM12`에서 lock entry가 생기는 시점을 확인한다.
3. `DEQUEUE_*` 호출 후 해당 key lock이 사라지는지 확인한다.
4. `COMMIT WORK`/`ROLLBACK WORK` 후 lock이 사라지는지 `_SCOPE`별로 실험한다.
5. 예외 발생 경로에서도 lock이 남지 않는지 확인한다.

### 예외 처리 기준

```abap
CALL FUNCTION 'ENQUEUE_EZ_BOOKING'
  EXPORTING
    mode_zbooking = 'E'
    booking_id    = lv_booking_id
  EXCEPTIONS
    foreign_lock   = 1
    system_failure = 2
    OTHERS         = 3.

IF sy-subrc = 1.
  MESSAGE '다른 사용자가 편집 중입니다. 잠시 후 다시 시도하세요.' TYPE 'E'.
ELSEIF sy-subrc <> 0.
  MESSAGE '잠금을 설정할 수 없습니다. 관리자에게 문의하세요.' TYPE 'E'.
ENDIF.
```

잠금 소유자 이름은 메시지 변수에 항상 있다고 가정하지 않는다. 시스템과 상황에 따라 다를 수 있다. 운영 확인이 필요하면 `SM12` 또는 별도 lock 조회 방법으로 확인한다.

### 실수와 주의

- `DEQUEUE_ALL`을 편리하다고 아무 곳에서나 쓰면 같은 프로그램 흐름의 다른 업무 lock도 풀 수 있다.
- commit/rollback 자동 해제를 너무 단순하게 말하면 `_SCOPE` 의존성을 놓친다.
- 편집 화면 진입 시점부터 저장 완료까지 오래 잠그면 사용자 대기가 길어진다.
- `foreign_lock` 메시지에서 사용자를 탓하는 표현을 쓰지 않는다. 동시성 상황은 정상 업무 상황이다.

### 체험형 학습 설계

**잠금 해제 판별 퀴즈**

| 요소 | 설계 |
|---|---|
| 데이터 | lock entry 목록, `_SCOPE` 값, update task 등록 여부, program/session 상태 |
| 버튼 | `DEQUEUE`, `COMMIT`, `ROLLBACK`, `세션 종료`, `DEQUEUE_ALL`, `_SCOPE 변경` |
| 상태 | lock alive/deleted, owner, scope, update registered, last action |
| 피드백 | `_SCOPE=2`에서 update 등록이 있는 경우와 없는 경우를 나누어 보여 주고, "보통 자동 해제"라는 표현이 왜 조건부인지 설명한다. |

### 정리

잠금 해제는 단순 암기가 아니라 `_SCOPE`, program lifecycle, SAP LUW/update 흐름의 조합이다. 안전한 코드는 정상 경로뿐 아니라 오류 경로에서도 lock이 남지 않도록 설계한다.

## CH25-L04 · 다중 사용자 변경 충돌 시나리오

### 왜 필요한가

Lock Object 문법을 배워도, 실제로 어떤 사고를 막는지 모르면 코드가 형식적으로만 남는다. CH25-L04는 "잠금이 없으면 무슨 일이 생기는가"를 다룬다. 대표 사고는 Lost Update다.

### 무엇인가

Lost Update는 두 사용자가 같은 과거 값을 기준으로 수정하고, 뒤에 저장한 사용자가 앞 사용자의 변경을 조용히 덮어쓰는 상황이다.

```text
초기 DB: booking_id=1001, seats=1, status='O'

A 조회: seats=1, status='O'
B 조회: seats=1, status='O'

A 변경: seats=2 저장
DB: seats=2, status='O'

B 변경: status='C' 저장
B의 화면에는 seats=1이 남아 있었고 전체 row update를 수행
DB: seats=1, status='C'

결과: A의 seats=2 변경이 사라짐
```

이를 막는 전략은 크게 두 가지다.

| 전략 | 방식 | 장점 | 주의 |
|---|---|---|---|
| Pessimistic | 수정 전 `ENQUEUE`로 먼저 잠근다 | 충돌을 사전에 막는다 | 오래 잠그면 대기가 늘어난다 |
| Optimistic | 수정 전에는 잠그지 않고 저장 직전 변경 여부를 비교한다 | 읽기 위주 업무에서 대기가 적다 | 변경 추적 필드가 필요하고 충돌 시 재조회가 필요하다 |

### Optimistic timestamp check

Classic ABAP 학습에서는 `changed_on`, `changed_at`, `changed_by`, 더 정밀하게는 timestamp 필드를 이용해 설명할 수 있다. 사용자가 조회한 시점의 변경 timestamp를 화면 상태에 보관했다가 저장 직전 DB의 현재 timestamp와 비교한다.

```abap
SELECT SINGLE changed_ts
  FROM zbooking
 WHERE booking_id = @lv_booking_id
  INTO @DATA(lv_current_changed_ts).

IF lv_current_changed_ts <> lv_screen_changed_ts.
  MESSAGE '다른 사용자가 먼저 변경했습니다. 다시 조회하세요.' TYPE 'E'.
ENDIF.

UPDATE zbooking
   SET seats      = @lv_new_seats,
       changed_by = @sy-uname,
       changed_ts = @lv_new_changed_ts
 WHERE booking_id = @lv_booking_id.
```

더 안전하게는 `WHERE`에 이전 timestamp를 포함해 "내가 읽은 버전이 아직 현재 버전일 때만 update"하게 만들 수 있다.

```abap
UPDATE zbooking
   SET seats      = @lv_new_seats,
       changed_by = @sy-uname,
       changed_ts = @lv_new_changed_ts
 WHERE booking_id = @lv_booking_id
   AND changed_ts = @lv_screen_changed_ts.

IF sy-subrc <> 0 OR sy-dbcnt <> 1.
  ROLLBACK WORK.
  MESSAGE '저장 전 데이터가 변경되었습니다. 다시 조회하세요.' TYPE 'E'.
ENDIF.
```

이 방식은 lock을 오래 잡지 않는 대신, 저장 시점에 충돌을 발견하면 사용자가 다시 조회하고 수정해야 한다.

### 어떻게 확인하는가

1. 두 세션에서 같은 key를 동시에 조회한다.
2. A가 먼저 저장한다.
3. B가 오래된 화면 상태로 저장을 시도한다.
4. pessimistic 전략에서는 B가 처음부터 `foreign_lock`으로 막히는지 확인한다.
5. optimistic 전략에서는 B의 timestamp 비교 또는 `sy-dbcnt` 확인으로 저장이 거절되는지 확인한다.

### 실수와 주의

- 전체 row를 work area로 update하면 화면의 오래된 필드가 DB의 최신 필드를 덮을 수 있다.
- optimistic 전략에는 변경 추적 필드가 필수다. 필드가 없으면 비교 기준이 없다.
- timestamp 정밀도가 낮으면 같은 초 안의 변경을 놓칠 수 있다. 시스템 환경에 맞는 정밀한 timestamp를 검토한다.
- 충돌 빈도가 높은 업무에 optimistic만 쓰면 사용자가 계속 재조회하게 된다.
- pessimistic을 너무 긴 편집 시간에 적용하면 다른 사용자가 오래 막힌다.

### 체험형 학습 설계

**Lost Update 시뮬레이터**

| 요소 | 설계 |
|---|---|
| 데이터 | 초기 `ZBOOKING` row, A 화면 snapshot, B 화면 snapshot, DB current row |
| 버튼 | `A 조회`, `B 조회`, `A 저장`, `B 저장`, `pessimistic 켜기`, `optimistic 켜기`, `timestamp WHERE 적용` |
| 상태 | screen version, DB version, lock owner, `sy-dbcnt`, conflict detected |
| 피드백 | 보호 없음에서는 A 변경이 사라지는 최종 row를 보여 주고, pessimistic/optimistic 전략에서는 어느 단계에서 막히는지 표시한다. |

### 정리

Lost Update는 동시성 제어를 하지 않은 수정 화면의 대표 사고다. 충돌이 잦고 수정 시간이 짧으면 pessimistic lock이 명확하고, 충돌이 드물고 읽기 비중이 높으면 optimistic check가 사용자 대기를 줄일 수 있다.

## CH25-L05 · Lock Object와 COMMIT/ROLLBACK 연결

### 왜 필요한가

CH24는 DML과 트랜잭션 제어를, CH25 앞부분은 SAP lock을 따로 배웠다. 실무 프로그램에서는 둘이 분리되지 않는다. 안전한 변경 흐름은 "잠금 성공 → 현재값 읽기 → 변경 검증 → DML → commit/rollback → 해제"가 하나로 이어져야 한다.

### 무엇인가

가장 기본적인 pessimistic 변경 패턴은 다음과 같다.

```abap
DATA lv_locked TYPE abap_bool.
DATA lv_failed TYPE abap_bool.

CALL FUNCTION 'ENQUEUE_EZ_BOOKING'
  EXPORTING
    mode_zbooking = 'E'
    booking_id    = lv_booking_id
  EXCEPTIONS
    foreign_lock   = 1
    system_failure = 2
    OTHERS         = 3.

IF sy-subrc = 0.
  lv_locked = abap_true.
ELSEIF sy-subrc = 1.
  MESSAGE '다른 사용자가 편집 중입니다.' TYPE 'E'.
ELSE.
  MESSAGE '잠금 처리 중 오류가 발생했습니다.' TYPE 'E'.
ENDIF.

SELECT SINGLE *
  FROM zbooking
 WHERE booking_id = @lv_booking_id
  INTO @DATA(ls_booking).

IF sy-subrc <> 0.
  lv_failed = abap_true.
ELSE.
  ls_booking-seats      = lv_new_seats.
  ls_booking-changed_by = sy-uname.
  ls_booking-changed_on = sy-datum.
  ls_booking-changed_at = sy-uzeit.

  UPDATE zbooking FROM @ls_booking.
  IF sy-subrc <> 0 OR sy-dbcnt <> 1.
    lv_failed = abap_true.
  ENDIF.
ENDIF.

IF lv_failed = abap_false.
  COMMIT WORK.
ELSE.
  ROLLBACK WORK.
ENDIF.

IF lv_locked = abap_true.
  CALL FUNCTION 'DEQUEUE_EZ_BOOKING'
    EXPORTING
      mode_zbooking = 'E'
      booking_id    = lv_booking_id.
ENDIF.
```

실무에서는 `_SCOPE`와 commit/rollback 해제 설계에 따라 명시 `DEQUEUE` 위치를 조정한다. 학습 단계에서는 "내가 잡은 잠금을 어디서 반납하는가"가 코드에 보이도록 명시 호출을 넣는 편이 이해에 좋다. 단, 이미 `_SCOPE`와 update task가 해제하도록 설계한 lock을 중복 해제하는 정책은 팀 표준에 맞춘다.

### 어떻게 확인하는가

1. enqueue 전에 DML이 실행되지 않는지 코드 순서를 본다.
2. `foreign_lock`이면 이후 read/update/commit으로 진행하지 않는지 확인한다.
3. `SELECT SINGLE` 실패와 `UPDATE` 실패가 모두 rollback 경로로 가는지 확인한다.
4. 성공 시 commit 후 lock이 사라지는지 `SM12`로 확인한다.
5. 실패 시 rollback 후 lock이 남지 않는지 `_SCOPE`와 `DEQUEUE` 정책을 함께 확인한다.

### 실수와 주의

- enqueue 실패 후에도 계속 update하면 lock의 의미가 사라진다.
- read 전에 잠그지 않으면 읽은 값과 저장 시점 값 사이에 다른 사용자의 변경이 끼어들 수 있다.
- update 성공 여부를 `sy-subrc`만으로 보지 말고 `sy-dbcnt = 1`까지 확인한다.
- rollback 후 lock 해제를 단정하지 말고 `_SCOPE`와 update task 설계를 확인한다.
- error path에서 `MESSAGE ... TYPE 'E'`로 빠져나갈 때 lock이 남을 수 있는 구조인지 점검한다.

### 체험형 학습 설계

**안전 변경 패턴 흐름도**

| 요소 | 설계 |
|---|---|
| 데이터 | `booking_id`, lock owner, DB row, screen input, failure switch, `_SCOPE` |
| 버튼 | `정상 저장`, `foreign_lock 발생`, `SELECT 실패`, `UPDATE 실패`, `ROLLBACK`, `SM12 확인`, `DEQUEUE 누락` |
| 상태 | locked, read_ok, update_ok, committed, rolled_back, lock_released |
| 피드백 | enqueue 실패 후 update를 강제로 진행하면 "동시성 보호 우회"를 표시하고, rollback 후 lock 상태를 `_SCOPE`별로 확인하게 한다. |

### 정리

안전한 변경은 CH24와 CH25가 합쳐진 흐름이다. CH24의 원자성은 내 변경 묶음을 보호하고, CH25의 lock은 다른 사용자와의 충돌을 줄인다. 실무 저장 코드는 두 축을 함께 설계해야 한다.

## CH25 최종 정리

CH25의 핵심은 다음과 같다.

| 원칙 | 의미 |
|---|---|
| commit만으로 동시성을 해결하지 않는다 | commit/rollback은 내 LUW 제어이고, 동시 사용자 충돌에는 lock/check가 필요하다. |
| Lock Object는 설계도다 | 실제 보호는 generated `ENQUEUE_`/`DEQUEUE_` 호출에서 시작된다. |
| key 단위로 좁게 잠근다 | 넓은 lock은 안전해 보이지만 사용성을 크게 떨어뜨린다. |
| `foreign_lock`은 정상 업무 상황이다 | 사용자를 탓하지 말고 재조회/재시도 안내를 제공한다. |
| 해제 조건은 `_SCOPE`를 본다 | commit/rollback 자동 해제를 단정하지 않는다. |
| Lost Update를 시뮬레이션한다 | 동시성 사고를 눈으로 봐야 lock 전략을 제대로 선택한다. |
| pessimistic과 optimistic을 구분한다 | 미리 막을지, 저장 직전 감지할지는 업무 충돌 빈도와 사용자 경험으로 결정한다. |

다음 CH26에서는 저장 흐름 자체보다 ABAP OO 고급 설계와 패턴으로 넘어간다.
