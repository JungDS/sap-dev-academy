# CH25_QA · Lock Object와 동시성 제어 검수

> 대상 산출물: `reference/codex_0629_v3/NEWCH26_OLDCH25_REWRITE.md`
> 작업 단위: CH25 1개 챕터  
> 기준: `content/abap/CH25`, `.project-docs/04_CONVENTIONS.md` R6/R15, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`

## 1. 작업 범위 확인

| 항목 | 확인 |
|---|---|
| 챕터 | CH25 · Lock Object와 동시성 제어 |
| 원본 레슨 수 | L01~L05, 총 5개 |
| 산출 파일 | `NEWCH26_OLDCH25_REWRITE.md`, `NEWCH26_OLDCH25_QA.md` |
| 주 소스 | `content/abap/CH25` |
| 보조 참고 | `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 직전 v3 CH24 품질 패턴 |
| 품질 목표 | CH24의 DML/commit 지식 위에 다중 사용자 충돌과 SAP lock을 완성 강의자료 수준으로 설명 |

CH25는 Classic ABAP Lock Object와 동시성 제어 장이다. RAP ETag 구현, ALV edit event 저장 흐름, BAPI/RFC 통합은 후속 범위로 보류한다. 다만 감사 결과에 따라 multi-table lock object 설계 감각과 SM12 운영 확인/에스컬레이션 경계는 CH25 안에서 회수했다.

## 2. 원본 레슨 커버리지

| 원본 | v3 반영 위치 | 반영 내용 |
|---|---|---|
| `_chapter.md` | `CH25 전체 설계`, `CH25 R15 경계`, `CH25 최종 정리` | 여러 사용자가 동시에 같은 데이터를 수정하는 문제를 CH25 핵심 문제로 재정의 |
| `CH25-L01.md` | `CH25-L01 · Lock Object 설계 기준` | SE11 Lock Object, Primary Table, Lock Argument, `S/E/X/O` mode |
| `CH25-L02.md` | `CH25-L02 · ENQUEUE / DEQUEUE Function Module` | `ENQUEUE_EZ_BOOKING`, `DEQUEUE_EZ_BOOKING`, `foreign_lock`, `SM12` 확인 |
| `CH25-L03.md` | `CH25-L03 · Lock 해제와 예외 처리` | `_SCOPE`, `DEQUEUE`, `DEQUEUE_ALL`, commit/rollback 해제 조건 주의 |
| `CH25-L04.md` | `CH25-L04 · 다중 사용자 변경 충돌 시나리오` | Lost Update, pessimistic/optimistic, timestamp 비교 |
| `CH25-L05.md` | `CH25-L05 · Lock Object와 COMMIT/ROLLBACK 연결` | ENQUEUE → READ → UPDATE → COMMIT/ROLLBACK → DEQUEUE 통합 패턴 |
| 감사 보강 | `CH25-L06 · 복합 Lock Object 설계` | header/item, 업무 root key, foreign key dependency, lock granularity |
| 감사 보강 | `CH25-L07 · SM12 운영 확인과 잠금 장애 대응 경계` | lock entry 판독, stuck lock 원인 분류, 수동 삭제/운영 에스컬레이션 경계 |

판정: 원본 5개 레슨이 모두 별도 절로 반영되었고, 감사 보강 2개 레슨을 추가해 총 7개 레슨으로 확장했다.

## 3. 공식 문서 수동 확인

Classic ABAP 문서는 `C:\ABAP_DOCU_HTML`에서 직접 확인했고, Markdown 사본은 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md`에서 대조했다.

| 주제 | 확인 문서 |
|---|---|
| SAP lock 개념 | `abensap_lock.htm`, `ABENSAP_LOCK.md` |
| enqueue/dequeue 예제 | `abenenqueue_abexa.htm`, `ABENENQUEUE_ABEXA.md` |
| Lock Object | `abenlock_object_glosry.htm`, `ABENLOCK_OBJECT_GLOSRY.md` |
| Lock Function Module | `abenlock_function_module_glosry.htm`, `ABENLOCK_FUNCTION_MODULE_GLOSRY.md` |
| Exclusive lock | `ABENEXCLUSIVE_LOCK_GLOSRY.md` |
| Shared lock | `ABENSHARED_LOCK_GLOSRY.md` |
| Optimistic concurrency | `ABENOPTIMISTIC_CONC_CONTROL_GLOSRY.md` |

확인 결과: CH25에서 사용하는 Lock Object, generated lock function module, `FOREIGN_LOCK`, `SM12`, `_SCOPE`, foreign key dependency, pessimistic/optimistic 설명은 공식 문서와 정합한다.

## 4. 공식 문서 반영 사항

| 항목 | 반영 |
|---|---|
| Lock Object 기반 | SAP locks are based on lock objects라는 공식 설명을 L01에 반영 |
| Foreign key dependency | Lock Object의 lock argument가 DDIC table과 foreign key dependency로 구성될 수 있음을 L06에 반영 |
| Generated FM | lock object 생성 시 `ENQUEUE_`, `DEQUEUE_` function module이 자동 생성됨을 반영 |
| 중앙 lock table | lock function module이 central lock table에 entry를 쓰고, `SM12`에서 관리됨을 반영 |
| `FOREIGN_LOCK` | 충돌 lock entry가 있으면 enqueue가 `foreign_lock` 예외로 종료됨을 반영 |
| Lock key | key field 값을 지정하지 않으면 더 넓은 범위가 잠길 수 있음을 반영 |
| `_SCOPE` | 1/2/3에 따른 lock duration과 commit/rollback 해제 조건을 조건부로 설명 |
| SQL 접근 오해 방지 | lock된 row도 lock check 없는 ABAP SQL 접근은 가능할 수 있음을 공식 예제 기반으로 반영 |
| Shared/Exclusive | shared는 다른 shared 허용, exclusive는 동시 lock 차단으로 반영 |
| Optimistic | RAP ETag 공식 개념을 언급하되 CH25에서는 timestamp 비교 사고방식으로 제한 |

## 5. R15 게이팅 및 경계

### CH25에서 허용한 것

| 항목 | 이유 |
|---|---|
| SE11 Lock Object | CH25-L01 핵심 주제 |
| Primary Table, Lock Argument | lock scope 설계 핵심 |
| 복합 Lock Object 설계 | CH25-L06에서 header/item 업무 root 기준으로 보강 |
| `S`, `E`, `X`, `O` lock mode | 공식 SAP lock parameter 범위 |
| `ENQUEUE_EZ_BOOKING`, `DEQUEUE_EZ_BOOKING` | CH25-L02 핵심 호출 패턴 |
| `foreign_lock`, `system_failure` | lock function module 예외 처리 핵심 |
| `SM12` | 중앙 lock table 확인 도구이며 CH25-L07에서 triage 경계까지 보강 |
| `_SCOPE`, `DEQUEUE_ALL` | CH25-L03 해제 조건과 예외 처리 범위 |
| Lost Update | CH25-L04 동시성 사고 설명 핵심 |
| Pessimistic/Optimistic | 전략 비교 핵심 |
| timestamp based check | Classic-first optimistic 설명용 예제 |

### CH25에서 보류한 것

| 보류 항목 | 처리 |
|---|---|
| RAP ETag/BDEF lock 구현 세부 | RAP/ABAP Cloud 심화 범위 |
| ALV edit event와 저장 이벤트 | CH28 범위 |
| BAPI/RFC와 표준 트랜잭션 통합 | CH30 범위 |
| enqueue server HA/구성, lock table 용량 운영 | Basis 운영 심화 범위 |
| SM12 수동 삭제 승인 절차 | 운영 권한과 업무 승인 범위. CH25에서는 삭제 전 판정과 에스컬레이션 기준까지만 설명 |
| parallel processing lock 전략 | CH32 이후 성능/대량 처리 심화 범위 |
| cross-application lock framework 설계 | Track-2 이후 아키텍처 심화 범위 |

판정: CH25는 Classic ABAP Lock Object와 동시성 제어에 집중하면서, 후속 장이 없는 multi-table lock 설계와 SM12 운영 확인 경계는 필요한 수준으로 회수했다.

## 6. 입문자 강의 흐름 점검

| 흐름 | 반영 |
|---|---|
| 왜 필요한가 | 두 사용자가 같은 예매를 동시에 수정해 Lost Update가 발생하는 문제에서 출발 |
| 무엇인가 | Lock Object, generated FM, lock mode, `_SCOPE`, 복합 업무 root lock, SM12 triage, pessimistic/optimistic을 책임별로 설명 |
| 어떻게 확인하는가 | `SE11`, generated FM, 두 세션 enqueue, `SM12`, commit/rollback 후 lock 상태, header/item 동시 수정 시나리오 확인 |
| 실수/주의 | lock object만 만들고 호출 누락, key 과다/과소, `foreign_lock` 미처리, SQL 자동 차단 오해, `_SCOPE` 단정, SM12 수동 삭제 남용 |
| 정리 | CH24 원자성과 CH25 동시성의 결합으로 안전 변경 패턴을 요약 |

판정: 비전공자가 "잠금은 왜 필요한가"부터 "잠금이 실제로 어떻게 보이는가"까지 순서대로 이해하도록 구성했다.

## 7. 체험형 학습 설계 점검

| 레슨 | 학습 장치 | 데이터/상태/피드백 |
|---|---|---|
| L01 | Lock Object 설계 보드 | lock scope, affected rows, generated FM names, lock mode |
| L02 | 2세션 잠금 데모 | User A/B, central lock table, `sy-subrc`, exception name |
| L03 | 잠금 해제 판별 퀴즈 | `_SCOPE`, update registered, lock alive/deleted |
| L04 | Lost Update 시뮬레이터 | screen version, DB version, lock owner, `sy-dbcnt`, conflict detected |
| L05 | 안전 변경 패턴 흐름도 | locked/read/update/commit/rollback/dequeue 상태 |
| L06 | 복합 Lock Scope 디자이너 | header/item, root key, affected rows, lock granularity |
| L07 | SM12 Lock Triage 콘솔 | lock argument, owner, age, cleanup path, escalation classification |

판정: 모든 레슨에 버튼, 상태, 데이터, 피드백 설계를 포함했다.

## 8. 코드·설계 검토

| 항목 | 검토 결과 |
|---|---|
| Lock Object 설계 | `EZ_BOOKING`, `ZBOOKING`, `BOOKING_ID` 중심으로 key 단위 lock 설명 |
| Lock mode | `S/E/X/O`를 공식 의미에 맞게 설명하고 일반 수정은 `E` 중심으로 안내 |
| ENQUEUE 예제 | `mode_zbooking`, `booking_id`, `foreign_lock`, `system_failure`, `OTHERS` 구분 |
| DEQUEUE 예제 | 같은 key와 mode로 해제하는 구조 설명 |
| `_SCOPE` | commit/rollback 자동 해제를 단정하지 않고 조건부로 설명 |
| 복합 Lock Object | header/item 예매 업무를 root key 기준으로 보호하는 설계 감각 추가 |
| SM12 운영 확인 | lock entry 판독, stuck lock 원인 분류, 수동 삭제 위험, Basis 에스컬레이션 경계 추가 |
| Lost Update | 두 사용자 snapshot과 마지막 저장으로 덮어쓰는 사고를 단계별로 설명 |
| Optimistic check | timestamp 비교와 `WHERE changed_ts = old_ts` + `sy-dbcnt` 확인 포함 |
| 통합 패턴 | enqueue 실패 시 진행 중단, update 결과 확인, commit/rollback, dequeue 포함 |

판정: 원본의 짧은 Lock Object 설명을 실무 동시성 사고 방지 자료로 보강했다.

## 9. 자동 검증 기준

작업 후 다음 검증을 수행한다.

| 검증 | 기대 |
|---|---|
| `git diff --check` | whitespace 오류 없음 |
| `rg "^## CH25-L0[1-7]"` | L01~L07 헤딩 7개 존재 |
| 반복 문구 검색 | 기존 템플릿형 고정 문구와 이전 챕터 공식문서 힌트 없음 |
| 경계 검색 | RAP `COMMIT ENTITIES`, ALV `DATA_CHANGED`, BAPI/RFC 상세 구현이 본문 코드로 들어오지 않음 |
| 파일 상태 | `NEWCH26_OLDCH25_REWRITE.md`, `NEWCH26_OLDCH25_QA.md`, 감사표만 수정 |

## 10. 잔여 리스크

| 리스크 | 판단 |
|---|---|
| `_SCOPE` 시스템/팀 표준 차이 | 공식 설명을 반영하고 "보통" 표현 대신 조건부 확인으로 보완 |
| Optimistic concurrency의 RAP ETag와 Classic timestamp 차이 | CH25는 Classic-first timestamp 사고방식으로 제한하고 RAP ETag는 공식 개념만 언급 |
| `DEQUEUE_ALL` 남용 | 편의 기능이지만 의도치 않은 lock 해제 위험을 명시 |
| SQL 자동 차단 오해 | 공식 예제 기반으로 lock check 없는 ABAP SQL 접근 가능성을 명시 |
| SM12 수동 삭제 오해 | 삭제 절차가 아니라 판정/에스컬레이션 기준으로 제한 |
| 복합 Lock Object 과설계 | header/item root key 예제로 제한하고 cross-application lock framework 설계는 제외 |

## 11. 최종 판정

CH25 재집필본은 다음 기준을 충족한다.

- 원본 L01~L05를 모두 독립 절로 반영하고, 감사 보강 L06/L07을 추가했다.
- CH24의 트랜잭션 제어와 연결해 동시성 제어 필요성을 설명했다.
- Classic ABAP 공식 문서를 `C:\ABAP_DOCU_HTML`에서 직접 확인하고 `_SCOPE`, `FOREIGN_LOCK`, generated FM, `SM12`, foreign key dependency를 반영했다.
- 모든 레슨에 확인 절차와 체험형 학습 설계를 포함했다.
- R15 게이팅을 지키며 RAP ETag 구현, ALV edit event, BAPI/RFC, enqueue server HA/구성 운영은 후속 또는 운영 범위로 보류했다.

판정: `NEWCH26_OLDCH25_REWRITE.md`는 v3 품질 기준으로 사용 가능하다.
