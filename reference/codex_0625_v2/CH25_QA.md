# CH25_QA - Lock Object와 동시성 제어

> 대상 파일: `reference/codex_0625_v2/CH25_REWRITE.md`
> 기준 파일: `reference/codex_0625/00_QUALITY_REVIEW.md`
> 작업 단위: CH25 단일 챕터
> 판정: 재작업 완료, 사후 명령 검증 대상

## 1. 재작업 판정 반영

| 기준 | 반영 결과 |
|---|---|
| 기존 `codex_0625`의 템플릿 반복 제거 | v1의 반복 보강 문구를 본문 골격으로 쓰지 않고, 각 레슨을 실제 강의 흐름으로 다시 작성했다. |
| 완성 강의자료 수준 재집필 | 5개 레슨을 모두 "동시 변경이 왜 위험한가"에서 출발해 Lock Object 설계, ENQUEUE/DEQUEUE, 해제 수명, Lost Update, COMMIT/ROLLBACK 통합 패턴으로 연결했다. |
| 입문자 기준 흐름 | 모든 레슨에 `왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수와 주의 -> 체험형 학습 설계 -> 정리` 흐름을 넣었다. |
| 코드가 있는 레슨의 체험 설계 | 각 레슨에 기존 embed 기반 버튼, 상태, lock table, 데이터, 로그, 사용자 피드백, 진행 라운드를 구체화했다. |
| 공식문서 자동 매칭 금지 | `C:\ABAP_DOCU_HTML`에서 Lock Object/SAP Lock/LUW/RAP Locking/Cloud 문서를 수동 확인해 rewrite 상단의 근거 표에 반영했다. |
| R15 게이팅 | CH25는 CH24 이후이므로 DML, `COMMIT WORK`, `ROLLBACK WORK`, Function Module 호출, modern Open SQL `@` 표기를 사용할 수 있다. |
| classic-first 경계 | 본문 중심은 classic SE11 Lock Object와 `ENQUEUE_*`/`DEQUEUE_*`이며, RAP/ABAP Cloud는 경계 설명으로만 다뤘다. |

## 2. 원본 레슨 커버리지

| 원본 레슨 | v2 반영 위치 | 보강 내용 |
|---|---|---|
| `CH25-L01` Lock Object 설계 기준 | `CH25-L01 - Lock Object 설계 기준` | Lost Update 문제에서 출발해 Lock Object, primary table, lock argument, lock mode, generated function module, SM12 확인까지 강의 흐름으로 확장했다. |
| `CH25-L02` ENQUEUE / DEQUEUE Function Module | `CH25-L02 - ENQUEUE / DEQUEUE Function Module` | `foreign_lock`을 정상 업무 충돌로 설명하고, 두 세션 테스트, SM12 확인, 실패 후 변경 중단 원칙을 보강했다. |
| `CH25-L03` Lock 해제와 예외 처리 | `CH25-L03 - Lock 해제와 예외 처리` | `DEQUEUE`, `COMMIT WORK`, `ROLLBACK WORK`, 세션 종료를 단순 자동 해제 표가 아니라 `_SCOPE` 1/2/3 기준으로 보정했다. |
| `CH25-L04` 다중 사용자 변경 충돌 시나리오 | `CH25-L04 - 다중 사용자 변경 충돌 시나리오` | Lost Update 타임라인, pessimistic/optimistic 전략 비교, `changed_at`/version/ETag 경계까지 보강했다. |
| `CH25-L05` Lock Object와 COMMIT/ROLLBACK 연결 | `CH25-L05 - Lock Object와 COMMIT/ROLLBACK 연결` | `ENQUEUE -> READ -> UPDATE -> COMMIT/ROLLBACK -> 해제` 안전 변경 패턴과 실패 분기 검증 항목을 추가했다. |

## 3. 공식 문서 수동 확인 반영

| 주제 | 확인 문서 | 확인한 핵심 | v2 반영 |
|---|---|---|---|
| SAP Locks | `C:\ABAP_DOCU_HTML\abensap_lock.htm` | SAP Lock은 lock object 기반이며 lock table entry로 관리되고 SAP LUW와 연결된다. | CH25 도입, L01, L02, L03, L05에 반영 |
| Lock Object | `C:\ABAP_DOCU_HTML\abenlock_object_glosry.htm` | ABAP Dictionary lock object가 SAP Lock의 기반이며 lock function module이 자동 생성된다. | L01 설계 표에 반영 |
| Lock Function Module | `C:\ABAP_DOCU_HTML\abenlock_function_module_glosry.htm` | `ENQUEUE_`는 잠금 설정, `DEQUEUE_`는 잠금 해제 함수다. | L01/L02 코드와 설명에 반영 |
| ENQUEUE/DEQUEUE 예제 | `C:\ABAP_DOCU_HTML\abenenqueue_abexa.htm` | `foreign_lock`, `system_failure`, SM12 확인, ABAP SQL이 SAP Lock을 자동 검사하지 않는다는 주의가 확인된다. | L01/L02 주의와 확인 절차에 반영 |
| Lock mode/key/scope | `C:\ABAP_DOCU_HTML\abensap_lock.htm` | `MODE_dbtab`의 `S/E/X/O`, key field 미지정 시 넓은 잠금, `_SCOPE` 1/2/3 해제 기준이 확인된다. | L01/L02/L03/L05에 반영 |
| COMMIT lock 처리 | `C:\ABAP_DOCU_HTML\abapcommit.htm` | `COMMIT WORK`는 lock function module의 `_SCOPE` 값에 따라 SAP Lock을 처리한다. | L03/L05에 반영 |
| ROLLBACK lock 처리 | `C:\ABAP_DOCU_HTML\abaprollback.htm` | `ROLLBACK WORK`는 `_SCOPE = 2`인 현재 프로그램의 SAP Lock 제거와 관련된다. | L03/L05의 조건부 해제 설명에 반영 |
| Shared/Exclusive Lock | `C:\ABAP_DOCU_HTML\abenshared_lock_glosry.htm`, `C:\ABAP_DOCU_HTML\abenexclusive_lock_glosry.htm` | shared lock끼리는 허용될 수 있고 exclusive lock은 동시 lock을 막는다. | L01 lock mode 표와 매트릭스 설계에 반영 |
| Optimistic/Pessimistic | `C:\ABAP_DOCU_HTML\abenoptimistic_conc_control_glosry.htm`, `C:\ABAP_DOCU_HTML\abenpessimist_conc_control_glosry.htm` | 낙관/비관 동시성 제어 개념과 RAP ETag/locking 경계가 확인된다. | L04 전략 비교와 Cloud 경계에 반영 |
| RAP/ABAP Cloud Locking | `C:\ABAP_DOCU_HTML\abenbdl_locking.htm`, `C:\ABAP_DOCU_HTML\abapset_locks.htm`, `C:\ABAP_DOCU_HTML\abaphandler_meth_lock.htm`, `C:\ABAP_DOCU_HTML\abenrap_locking_glosry.htm` | RAP에서는 BDEF `lock master/dependent`, EML `SET LOCKS`, handler `FOR LOCK`가 locking 경계다. | 상단 경계, L04/L05 Cloud 설명에 반영 |
| ABAP Cloud/released API | `C:\ABAP_DOCU_HTML\abenabap_cloud_glosry.htm`, `abenabap_for_cloud_dev_glosry.htm`, `abenreleased_api_glosry.htm`, `abenreleased_apis.htm` | ABAP Cloud는 restricted language version, released APIs, RAP transactional model 중심이다. | classic-first/Cloud 경계에 반영 |

## 4. R15 / classic-first 경계 점검

| 항목 | 점검 결과 |
|---|---|
| CH25 이전 지식 | CH24에서 DML/LUW/COMMIT/ROLLBACK을 이미 다뤘으므로 CH25에서 transaction 흐름과 결합했다. |
| Function Module 호출 | CH10 이후 개념이므로 `CALL FUNCTION 'ENQUEUE_*'`/`'DEQUEUE_*'` 예제를 사용할 수 있다. |
| New Open SQL | CH19 이후이므로 `@` host variable을 사용했다. |
| Lock Object | CH25 정식 주제이므로 SE11 lock object, lock argument, generated function module, SM12를 본문 중심으로 다뤘다. |
| DB isolation/deadlock | DB isolation level, database deadlock, `SELECT ... FOR UPDATE` 심화는 범위 밖으로 분리했다. |
| BAPI/RFC commit | CH30 범위이므로 표준 객체 변경 경계만 언급하고 상세는 다루지 않았다. |
| RAP/ABAP Cloud | RAP locking 용어는 경계 설명으로만 사용했다. classic Lock Object 코드를 Cloud-ready 코드로 포장하지 않았다. |
| Update task 상세 | `_SCOPE=2`와 commit/update 흐름의 관계만 필요한 만큼 설명하고, update task 재강의는 CH24 범위를 재사용했다. |

## 5. 코드 예제 QA

| 예제 | 점검 |
|---|---|
| `CALL FUNCTION 'ENQUEUE_EZ_BOOKING'` | 학습용 `ZBOOKING`/`EZ_BOOKING` lock object 전제로 작성했다. `mode_zbooking`, key, `_scope`, `foreign_lock`, `system_failure`를 포함했다. |
| `CALL FUNCTION 'DEQUEUE_EZ_BOOKING'` | 잠금과 같은 key로 해제해야 한다는 원칙을 명시했다. |
| `foreign_lock` 분기 | 메시지만 보여 주는 것이 아니라 변경 흐름을 중단해야 한다고 반복해서 설명했다. |
| `_SCOPE` 표 | `1`, `2`, `3`의 해제 주체와 COMMIT/ROLLBACK 관계를 단순 자동 해제로 오해하지 않도록 보정했다. |
| SM12 확인 | SAP Lock이 중앙 lock table entry라는 점을 확인 절차와 체험 설계에 반영했다. |
| Lost Update 예제 | A/B가 같은 snapshot을 읽고 나중 저장이 먼저 저장을 덮어쓰는 타임라인으로 설명했다. |
| Optimistic 예제 | `changed_at`은 학습용 단순 예시이며 실제로는 timestamp/version/ETag가 더 안전하다고 경고했다. |
| 안전 변경 패턴 | `ENQUEUE -> READ -> UPDATE -> COMMIT/ROLLBACK -> 해제` 순서를 기준으로 정상/실패 경로를 제시했다. |
| ABAP SQL 주의 | SAP Lock이 ABAP SQL을 자동 차단하지 않으며 프로그램이 enqueue check를 해야 한다고 명시했다. |

## 6. 체험형 학습 설계 QA

| 레슨 | 반영한 체험 설계 |
|---|---|
| L01 | lock mode 호환 매트릭스: A 보유 모드, B 요청 모드, key, 허용/거절 verdict, `foreign_lock` 피드백을 설계했다. |
| L02 | 2세션 ENQUEUE/DEQUEUE 데모: User A/B 패널, SM12풍 lock list, `sy-subrc`, 예외명, 사용자 메시지, reset 흐름을 설계했다. |
| L03 | 잠금 해제 판별 퀴즈: DEQUEUE, COMMIT, ROLLBACK, 세션 종료, SELECT, 다른 key 변경, `DEQUEUE_ALL`의 풀림/유지/조건부 판정을 설계했다. |
| L04 | Lost Update 시뮬레이터: 전략 없음/Pessimistic/Optimistic 토글, A/B snapshot, DB 최종값, 보존/소실 판정을 설계했다. |
| L05 | 안전 변경 패턴 흐름도: ENQUEUE 실패, READ 실패, UPDATE 실패, COMMIT/ROLLBACK, `_SCOPE` 변경 버튼과 DB/lock/message 결과 패널을 설계했다. |

## 7. 기존 시각 자료 반영

| 자료 | 반영 |
|---|---|
| `embeds/abap/CH25-L01-S01.html` | L01의 lock mode 호환 매트릭스로 사용했다. |
| `embeds/abap/CH25-L02-S01.html` | L02의 2세션 lock table/`foreign_lock` 체험으로 사용했다. |
| `embeds/abap/CH25-L03-S01.html` | L03의 해제 판별 퀴즈로 사용하되, 본문에서 `_SCOPE` 조건을 보강했다. |
| `embeds/abap/CH25-L04-S01.html` | L04의 Lost Update 전략 비교 체험으로 사용했다. |
| `embeds/abap/CH25-L05-S01.html` | L05의 안전 변경 패턴 흐름도로 사용했다. |
| 새 HTML/SVG 생성 | 요청 산출물이 reference 문서이므로 새 embed 파일은 만들지 않고, 필요한 버튼/상태/데이터/피드백 설계를 글로 구체화했다. |

## 8. v1 대비 주요 정정

| v1 문제 | v2 조치 |
|---|---|
| 함수 호출 일반 문서 중심의 넓은 공식 힌트 | Lock Object, SAP Lock, lock function module, `_SCOPE`, SM12, RAP locking 문서로 수동 보정했다. |
| 반복 템플릿 문장 중심 | 모든 레슨을 업무 사고, 코드 흐름, 검증 방법, 실수 회수 중심의 강의 본문으로 재작성했다. |
| COMMIT/ROLLBACK 해제를 단순 자동 해제로 읽을 위험 | `_SCOPE` 1/2/3에 따른 해제 주체와 조건을 명확히 설명했다. |
| SAP Lock을 DB 물리 lock처럼 오해할 위험 | 중앙 lock table의 논리 lock이며 ABAP SQL이 자동 검사하지 않는다고 명시했다. |
| Lost Update 설명이 얇음 | 전략 없음/Pessimistic/Optimistic을 같은 A/B 시나리오로 비교했다. |
| Cloud 경계가 약함 | classic Lock Object 중심을 유지하면서 RAP `lock master/dependent`, `SET LOCKS`, `FOR LOCK`, ETag 경계를 분리했다. |

## 9. ABAP Cloud 경계 메모

사용자 목표의 `ABAP Cloud에 대한 공식문서 힌트는` 문장은 미완성 상태였지만, CH25의 Cloud 경계는 로컬 ABAP_DOCU에서 확인했다.

- `abenabap_cloud_glosry.htm`: ABAP Cloud는 restricted ABAP language version, released APIs, ADT, RAP transactional model 중심이다.
- `abenabap_for_cloud_dev_glosry.htm`: ABAP for Cloud Development는 restricted language scope와 released APIs 접근 제한을 가진다.
- `abenreleased_api_glosry.htm`, `abenreleased_apis.htm`: released API와 release contract 개념을 확인했다.
- `abenbdl_locking.htm`: RAP BDEF의 `lock master`, `lock dependent`, managed/unmanaged locking을 확인했다.
- `abapset_locks.htm`: EML `SET LOCKS`는 RAP BO instance의 enqueue lock과 연결된다.
- `abaphandler_meth_lock.htm`: `FOR LOCK` handler method는 RAP locking 처리 경계다.

따라서 CH25 v2는 다음 경계를 둔다.

- classic 학습 본문은 SE11 Lock Object와 generated function module 중심으로 쓴다.
- RAP/ABAP Cloud는 개념 경계와 후속 학습 방향만 제시한다.
- Cloud-ready 구현처럼 classic `ENQUEUE_*` 코드를 포장하지 않는다.
- released API 목록에 lock 관련 API가 있더라도 CH25 본문에서 해당 class 기반 구현을 새로 가르치지 않는다.

## 10. 잔여 리스크와 의도적 보류

| 항목 | 처리 |
|---|---|
| 실제 Lock Object 이름과 generated parameter | 교육용 `EZ_BOOKING`/`ZBOOKING` 예시로 작성했다. 실제 시스템에서는 SE11 생성 결과를 확인해야 한다. |
| `_SCOPE`와 update task 세부 조합 | CH25의 목적에 필요한 수준으로 설명했다. update task 자체의 상세는 CH24 범위다. |
| `DEQUEUE_ALL` 세부 공식 페이지 | 원본/커리큘럼 항목으로 cleanup 개념을 유지하되, 핵심 해제 근거는 SAP Lock과 `_SCOPE` 문서로 잡았다. |
| optimistic 변경표식 | `changed_at`은 학습용 단순 예시다. 운영에서는 timestamp, version, ETag 등 더 안정적인 식별자가 필요하다고 명시했다. |
| embed 내부 문구와 공식 정밀도 차이 | reference 문서 산출 범위에서는 embed 파일을 수정하지 않았다. L03 본문에서 COMMIT/ROLLBACK 카드의 `_SCOPE` 조건을 보강했다. |

## 11. 최종 수동 점검 체크리스트

- [x] CH25 단일 챕터만 작업했다.
- [x] `reference/codex_0625_v2/CH25_REWRITE.md`를 생성했다.
- [x] `reference/codex_0625_v2/CH25_QA.md`를 생성했다.
- [x] 원본 5개 레슨을 모두 반영했다.
- [x] 기존 `codex_0625` 반복 템플릿을 제거했다.
- [x] 각 레슨에 입문자용 흐름을 넣었다.
- [x] 코드가 있는 레슨에 체험형 설계를 넣었다.
- [x] Classic ABAP 공식 문서를 `C:\ABAP_DOCU_HTML`에서 수동 확인했다.
- [x] ABAP Cloud/RAP locking 경계를 로컬 ABAP_DOCU로 확인했다.
- [x] R15 게이팅과 classic-first 경계를 지켰다.

## 12. 사후 검증 기록

아래 항목은 파일 생성 후 명령으로 추가 점검했다.

| 검증 | 결과 |
|---|---|
| 반복 템플릿 문구 검색 | 완료. `CH25_REWRITE.md`에서 v1 고정 문구(`도입 불편`, `실무 감각`, `필요 학습수단`, `공식 문서 체크 힌트`)가 검출되지 않음. |
| 레슨별 흐름 섹션 개수 | 완료. `왜 필요한가/무엇인가/어떻게 확인하는가/실수와 주의/체험형 학습 설계/정리` 섹션이 30개로 확인됨(5레슨 x 6섹션). |
| 레슨 수 확인 | 완료. `## CH25-L01` ~ `## CH25-L05` 총 5개 레슨 확인. |
| 잘못된 자동 매칭 문서 힌트 제거 | 완료. Selection Screen, 일반 함수 호출, message/exception, DML 문서 파일명 패턴 검색 결과 없음. |
| CH25 핵심 키워드 반영 검색 | 완료. `ENQUEUE_EZ_BOOKING`, `DEQUEUE_EZ_BOOKING`, `foreign_lock`, `_SCOPE`, `SM12`, `Lock Argument`, `Lost Update`, `Pessimistic`, `Optimistic`, `changed_at`, RAP locking 경계 키워드 반영 확인. |
| 공식 문서 파일명 반영 검색 | 완료. SAP Lock, Lock Object, lock function module, COMMIT/ROLLBACK, shared/exclusive, optimistic/pessimistic, RAP/Cloud 문서 파일명 반영 확인. |
| trailing whitespace 검사 | 완료. `git diff --check -- reference/codex_0625_v2/CH25_REWRITE.md reference/codex_0625_v2/CH25_QA.md` 통과. |
