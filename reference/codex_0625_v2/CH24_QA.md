# CH24_QA - 실무 데이터 변경과 트랜잭션 제어

> 대상 파일: `reference/codex_0625_v2/CH24_REWRITE.md`
> 기준 파일: `reference/codex_0625/00_QUALITY_REVIEW.md`
> 작업 단위: CH24 단일 챕터
> 판정: 재작업 완료, 사후 명령 검증 대상

## 1. 재작업 판정 반영

| 기준 | 반영 결과 |
|---|---|
| 기존 `codex_0625`의 템플릿 반복 제거 | v1의 `도입 불편`, `핵심 설명`, `실무 감각`, `필요 학습수단`, `공식 문서 체크 힌트` 같은 반복 문구를 본문 구조로 사용하지 않았다. |
| 완성 강의자료 수준 재집필 | 5개 레슨을 모두 실제 강의 본문 형태로 다시 썼다. 각 레슨은 문법 소개가 아니라 업무 책임, 실행 확인, 실패 회수, 다음 레슨 연결까지 포함한다. |
| 입문자 기준 흐름 | 모든 레슨에 `왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수와 주의 -> 체험형 학습 설계 -> 정리` 흐름을 명시했다. |
| 코드가 있는 레슨의 체험 설계 | 모든 레슨에 기존 embed 기반 버튼, 상태, 데이터, 피드백, 라운드 진행 방식을 구체화했다. |
| 공식문서 자동 매칭 금지 | `C:\ABAP_DOCU_HTML`에서 DML/LUW/Cloud 관련 파일을 수동 확인하고, rewrite 상단의 공식 문서 표에 반영했다. |
| R15 게이팅 | CH24는 CH18/CH19 이후이므로 modern syntax와 `@` host variable을 허용하되, Lock Object(CH25), BAL 상세(CH35), BAPI transaction 상세(CH30), RAP transactional model 재강의(CH23/CH36)는 범위 밖으로 분리했다. |
| classic-first 경계 | 직접 DML 예제는 classic/on-premise 학습용 `Z*` 테이블로 한정했고, ABAP Cloud는 released API/RAP 경계 설명으로만 다뤘다. |

## 2. 원본 레슨 커버리지

| 원본 레슨 | v2 반영 위치 | 보강 내용 |
|---|---|---|
| `CH24-L01` INSERT / UPDATE / MODIFY / DELETE 실무 기준 | `CH24-L01 - INSERT / UPDATE / MODIFY / DELETE 실무 기준` | DML 네 문장을 업무 의도, key 존재 여부, `sy-subrc`, `sy-dbcnt`, `WHERE` 위험, 감사필드, 표준 테이블 BAPI/API 경계로 재구성했다. 원본의 "중복 INSERT=항상 덤프" 표현은 공식 문서 기준으로 더 정확히 보정했다. |
| `CH24-L02` COMMIT WORK / ROLLBACK WORK | `CH24-L02 - COMMIT WORK / ROLLBACK WORK` | 마지막 `sy-subrc`가 아니라 업무 단위 전체 성공 여부로 COMMIT 판단하는 흐름을 추가했다. 원자성, `AND WAIT`, rollback 후 확인 방법을 보강했다. |
| `CH24-L03` DB LUW와 SAP LUW 차이 | `CH24-L03 - DB LUW와 SAP LUW 차이` | DB LUW/SAP LUW를 관점·길이·경계로 분리하고, `IN UPDATE TASK`의 등록/실행 시점, `sy-subrc` undefined, `PERFORM ON COMMIT` 주의를 보강했다. |
| `CH24-L04` 오류 로그와 재처리 구조 | `CH24-L04 - 오류 로그와 재처리 구조` | 단순 `lt_error` 수집에서 key+reason 구조, 멱등성, 개인정보 로그 주의, 실패분 재처리 흐름까지 확장했다. |
| `CH24-L05` 대량 변경 시 Package 처리 | `CH24-L05 - 대량 변경 시 Package 처리` | package commit의 자원 관리 목적, 전체 rollback 가능성 상실, 마지막 commit 누락, 실패 정책, 재시작점 설계를 보강했다. |

## 3. 공식 문서 수동 확인 반영

| 주제 | 확인 문서 | 확인한 핵심 | v2 반영 |
|---|---|---|---|
| `INSERT` | `C:\ABAP_DOCU_HTML\abapinsert_dbtab.htm` | 단건 work area 삽입은 row가 들어가면 `sy-subrc=0`, 같은 primary key/unique secondary index가 있으면 `sy-subrc=4`; `sy-dbcnt`는 삽입 행 수 | L01의 DML 표와 중복 key 주의에 반영 |
| `INSERT FROM TABLE` | `C:\ABAP_DOCU_HTML\abapinsert_dbtab.htm` | internal table 기반 대량 insert 문법과 중복 처리/예외 가능성 | L01 `FROM TABLE`, L04/L05 실패 회수 설명에 반영 |
| `UPDATE` | `C:\ABAP_DOCU_HTML\abapupdate.htm` | `UPDATE`는 하나 이상 변경 시 성공, 변경 행이 없거나 일부 변경 실패 시 `sy-subrc=4`; `sy-dbcnt`는 변경 행 수 | L01/L02 확인 기준에 반영 |
| `MODIFY` | `C:\ABAP_DOCU_HTML\abapmodify_dbtab.htm` | DB table에 row를 삽입하거나 기존 row를 덮어쓰며 `sy-subrc`, `sy-dbcnt` 설정 | L01 upsert 설명, L04 멱등성 설명에 반영 |
| `DELETE` | `C:\ABAP_DOCU_HTML\abapdelete_dbtab.htm` | `DELETE FROM target`는 `WHERE`가 없으면 전체 삭제 대상이 될 수 있고, `sy-dbcnt`는 삭제 행 수 | L01 `WHERE` 없는 삭제 경고에 반영 |
| `COMMIT WORK` | `C:\ABAP_DOCU_HTML\abapcommit.htm` | 현재 SAP LUW를 닫고 새 SAP LUW를 열며, `PERFORM ON COMMIT`, update task 처리, `AND WAIT` 동작 포함 | L02/L03에 반영 |
| `ROLLBACK WORK` | `C:\ABAP_DOCU_HTML\abaprollback.htm` | 현재 SAP LUW 변경 요청 취소, `PERFORM ON ROLLBACK`, `PERFORM ON COMMIT` 등록 삭제, update task 등록 삭제, DB rollback | L02/L03에 반영 |
| SAP LUW | `C:\ABAP_DOCU_HTML\abensap_luw.htm` | `COMMIT WORK`/`ROLLBACK WORK`가 SAP LUW 경계를 결정하며 update task/ON COMMIT 등록과 연결 | L03 전체 구조에 반영 |
| Update Task | `C:\ABAP_DOCU_HTML\abapcall_function_update.htm`, `C:\ABAP_DOCU_HTML\abensap_luw_update_task_abexa.htm` | `CALL FUNCTION ... IN UPDATE TASK`는 update function module 등록이며, `COMMIT WORK` 시 실행; 실행 후 `sy-subrc` undefined | L03 확인/주의에 반영 |
| `PERFORM ... ON COMMIT` | `C:\ABAP_DOCU_HTML\abapperform_on_commit.htm`, `C:\ABAP_DOCU_HTML\abensap_luw_on_commit_abexa.htm` | subroutine은 COMMIT/ROLLBACK 시점 실행으로 등록되며 신규 subroutine 사용에는 주의 | L03 classic legacy 패턴 주의에 반영 |
| BAPI | `C:\ABAP_DOCU_HTML\abenbapi_glosry.htm` | BAPI는 Business Application Programming Interface | L01 표준 테이블 직접 DML 금지와 BAPI/API 경유 설명에 반영 |
| ABAP Cloud | `C:\ABAP_DOCU_HTML\abenabap_cloud_glosry.htm`, `abenabap_for_cloud_dev_glosry.htm`, `abenreleased_api_glosry.htm`, `abenreleased_apis.htm` | ABAP Cloud는 restricted language version, released APIs, RAP transactional model 중심 | 상단 경계, L01/L03 주의에 반영 |

## 4. R15 / classic-first 경계 점검

| 항목 | 점검 결과 |
|---|---|
| New Syntax | CH24는 CH18 이후이므로 `DATA(...)`, `VALUE #( ... )`, string template, `+=` 사용 가능. L04/L05 예제에 제한적으로 사용했다. |
| New Open SQL | CH24는 CH19 이후이므로 `@` host variable 사용 가능. DML 예제는 modern ABAP SQL 표기로 작성했다. |
| Direct DB DML | CH24의 정식 주제이므로 `INSERT`, `UPDATE`, `MODIFY`, `DELETE`를 다룰 수 있다. 단 학습용 `Z*` 테이블로 한정했다. |
| SAP standard table 변경 | 직접 DML 금지 원칙을 L01/L04/L05에 반복해 둔다. BAPI/API 경유는 CH30 상세로 넘겼다. |
| Lock Object | CH25 주제이므로 잠금 API, `ENQUEUE_`, `DEQUEUE_`, `_SCOPE` 설명은 하지 않았다. L05에서 잠금은 다음 챕터 연결 수준으로만 언급했다. |
| BAL/SLG1 | CH35 상세 주제다. CH24에서는 운영 로그 필요성과 BAL/SLG1 용어 예고까지만 사용했다. |
| RAP | CH23에서 이미 배웠으나 CH24는 classic DML/LUW 실무 챕터다. RAP 저장 모델을 다시 가르치지 않고 ABAP Cloud 경계만 설명했다. |
| Update Task | CH24-L03 정식 주제이므로 `CALL FUNCTION ... IN UPDATE TASK`, `COMMIT WORK`, `ROLLBACK WORK` 연결을 설명했다. |
| `PERFORM ON COMMIT` | classic 코드 이해용으로 설명하되 신규 권장 패턴처럼 포장하지 않았다. |

## 5. 코드 예제 QA

| 예제 | 점검 |
|---|---|
| `INSERT zbooking FROM @ls_booking` | 학습용 `Z*` 테이블 대상. 중복 key 실패를 `sy-subrc` 중심으로 설명했다. |
| `UPDATE zbooking SET status = 'C' WHERE booking_id = @lv_booking_id` | `WHERE` 조건과 `sy-dbcnt` 확인을 함께 설명했다. |
| `MODIFY zbooking FROM @ls_booking` | upsert 의도를 설명하고, 신규 등록 중복 감지에는 부적합할 수 있음을 보강했다. |
| `DELETE FROM zbooking WHERE booking_id = @lv_booking_id` | `WHERE` 없는 전체 삭제 위험을 별도 사고 예제로 분리했다. |
| `INSERT ... FROM TABLE @lt_items` | 대량 insert와 실패 회수 연결을 L02/L04에 걸어 설명했다. |
| 감사필드 stamp | `sy-uname`, `sy-datum`, `sy-uzeit`를 사용해 생성자·생성일·생성시각을 채우는 예제를 유지했다. |
| COMMIT/ROLLBACK 기본 | 마지막 `sy-subrc`만 보는 위험을 피하고, 실패 플래그 누적 예제를 추가했다. |
| `CALL FUNCTION ... IN UPDATE TASK` | 등록과 실행 시점 차이를 설명하고, `sy-subrc` undefined 주의를 반영했다. |
| 오류 테이블 | 단순 원본 row 수집에서 key+reason 구조로 확장했다. |
| package commit | 마지막 commit 누락 방지와 `lv_pending` 플래그 예제를 추가했다. |

## 6. 체험형 학습 설계 QA

| 레슨 | 반영한 체험 설계 |
|---|---|
| L01 | DML 플레이그라운드: `INSERT`/`UPDATE`/`MODIFY`/`DELETE`, `WHERE 생략` 토글, `sy-subrc`, `sy-dbcnt`, 변경 전후 row, 감사필드 자동 stamp |
| L02 | 원자성 시뮬레이터: 예매 헤더/항목, 항목 실패 토글, COMMIT/ROLLBACK 선택, 반쪽 저장과 전부 취소 비교, `AND WAIT` 대기 타임라인 |
| L03 | SAP LUW 타임라인: 화면 입력, update task 등록, COMMIT 전 조회, ROLLBACK 등록 삭제, COMMIT 실행, `AND WAIT` 완료 대기 표시 |
| L04 | 재처리 시뮬레이터: batch 입력, 성공 DB, 오류 테이블, key+reason, 원인 해결, 실패분만 재처리, 멱등성 테스트 |
| L05 | 패키지 커밋 시각화: 총 건수, 패키지 크기, commit 횟수, 최대 미커밋 버퍼, 실패 정책, 재시작점, sawtooth chart |

## 7. 기존 시각 자료 반영

| 자료 | 반영 |
|---|---|
| `embeds/abap/CH24-L01-S01.html` | L01의 중심 체험으로 사용. DML별 DB row 변화와 위험 토글을 본문에서 상세 해석하도록 설계했다. |
| `embeds/abap/CH24-L02-S01.html` | L02의 원자성 체험으로 사용. COMMIT/ROLLBACK 선택 결과를 업무 단위 관점으로 재해석했다. |
| `embeds/abap/CH24-L03-S01.html` | L03의 SAP LUW 타임라인 체험으로 사용. update task 등록/실행 시점을 문서화했다. |
| `embeds/abap/CH24-L04-S01.html` | L04의 실패 수집/재처리 체험으로 사용. 오류 테이블의 필수 컬럼과 멱등성 테스트를 보강했다. |
| `embeds/abap/CH24-L05-S01.html` | L05의 package commit 체험으로 사용. commit 횟수, 최대 미커밋 버퍼, 마지막 commit 누락을 설명했다. |
| 새 HTML/SVG 생성 | 요청 산출물이 reference 문서이므로 새 embed 파일은 만들지 않고, 필요한 버튼/상태/데이터/피드백 설계를 글로 구체화했다. |

## 8. v1 대비 주요 정정

| v1 문제 | v2 조치 |
|---|---|
| CH24-L01 공식 문서 힌트에 Selection Screen 문서가 섞임 | DML/LUW/Cloud 문서만 수동 확인하여 상단 표로 남김 |
| 반복 템플릿 문장 중심 | 각 레슨의 실제 강의 흐름과 운영 사고를 직접 서술 |
| DML 실패 설명이 단순함 | `sy-subrc`, `sy-dbcnt`, 중복 key, `WHERE`, 대량 처리 예외 가능성을 구분 |
| COMMIT/ROLLBACK이 단순 버튼 설명에 가까움 | 업무 단위 전체 성공 여부, 반쪽 저장, update task, `AND WAIT`까지 연결 |
| 오류 로그가 `lt_error` 수준에 머묾 | key+reason, 재처리 가능성, 멱등성, 개인정보 로그 주의까지 확장 |
| package 처리에서 commit 반복만 강조 | 부분 성공 정책, 전체 rollback 불가, 마지막 commit, 재시작점까지 보강 |

## 9. ABAP Cloud 경계 메모

사용자 목표의 `ABAP Cloud에 대한 공식문서 힌트는` 문장이 미완성 상태였지만, CH24 내용과 직접 관련된 경계는 로컬 ABAP_DOCU에서 확인했다.

- `abenabap_cloud_glosry.htm`: ABAP Cloud는 cloud-ready, upgrade-stable development model이며 restricted ABAP language version, released APIs, ADT 중심, RAP transactional model을 둔다.
- `abenabap_for_cloud_dev_glosry.htm`: ABAP for Cloud Development는 restricted language version과 released APIs 접근 제한을 가진다.
- `abenreleased_api_glosry.htm`: released API는 ABAP Cloud에서 접근 허용된 repository object 또는 그 일부다.
- `abenreleased_apis.htm`: restricted language version에서 사용 가능한 released API 목록과 release contract 개념을 제공한다.

따라서 CH24 v2는 다음 경계를 둔다.

- 직접 DB DML 예제는 classic/on-premise 학습용 `Z*` 테이블에 한정한다.
- SAP 표준 테이블 직접 변경은 금지한다.
- ABAP Cloud 맥락에서는 released API와 RAP transactional model을 우선한다.
- CH24에서 Cloud DML 대체 구현을 새로 가르치지 않는다. 그것은 CH23/CH36 및 별도 ABAP Cloud 심화 범위다.

## 10. 잔여 리스크와 의도적 보류

| 항목 | 처리 |
|---|---|
| 실제 시스템별 Open SQL DML 예외 차이 | 로컬 ABAP_DOCU 758 기준으로 작성했다. 특정 DB 제약/릴리스 차이는 실습 시스템에서 확인해야 한다. |
| BAPI transaction commit 상세 | CH30의 BAPI/RFC 주제와 겹치므로 CH24에서는 표준 테이블 직접 DML 금지와 BAPI/API 경유 원칙까지만 다뤘다. |
| BAL API 상세 | CH35 로그/운영 주제로 보류했다. |
| Lock Object와 commit/rollback 관계 | CH25에서 본격 학습한다. CH24에서는 대량 처리의 잠금 부담만 예고했다. |
| package size 정답 | 업무·테이블·시스템 성능에 따라 달라지므로 1,000~10,000 시작점과 측정 조정 원칙으로 설명했다. |
| embed 내부 텍스트와 공식 정밀도 차이 | reference 문서 산출 범위에서는 embed 파일을 수정하지 않았다. 본문에서 `INSERT` 중복 key를 공식 기준으로 보정했다. |

## 11. 최종 수동 점검 체크리스트

- [x] CH24 단일 챕터만 작업했다.
- [x] `reference/codex_0625_v2/CH24_REWRITE.md`를 생성했다.
- [x] `reference/codex_0625_v2/CH24_QA.md`를 생성했다.
- [x] 원본 5개 레슨을 모두 반영했다.
- [x] 기존 `codex_0625` 반복 템플릿을 제거했다.
- [x] 각 레슨에 입문자용 흐름을 넣었다.
- [x] 코드가 있는 레슨에 체험형 설계를 넣었다.
- [x] Classic ABAP 공식 문서를 `C:\ABAP_DOCU_HTML`에서 수동 확인했다.
- [x] ABAP Cloud 경계를 로컬 ABAP_DOCU Cloud/released API 문서로 확인했다.
- [x] R15 게이팅과 classic-first 경계를 지켰다.

## 12. 사후 검증 기록

아래 항목은 파일 생성 후 명령으로 추가 점검했다.

| 검증 | 결과 |
|---|---|
| 반복 템플릿 문구 검색 | 완료. `CH24_REWRITE.md`에서 v1 고정 문구(`도입 불편`, `실무 감각`, `필요 학습수단`, `공식 문서 체크 힌트`)가 검출되지 않음. |
| 레슨별 흐름 섹션 개수 | 완료. `왜 필요한가/무엇인가/어떻게 확인하는가/실수와 주의/체험형 학습 설계/정리` 섹션이 30개로 확인됨(5레슨 x 6섹션). |
| 레슨 수 확인 | 완료. `## CH24-L01` ~ `## CH24-L05` 총 5개 레슨 확인. |
| 잘못된 Selection Screen 공식 문서 힌트 제거 | 완료. v1에서 섞였던 Selection Screen 계열 파일명 패턴 검색 결과 없음. |
| CH24 핵심 키워드 반영 검색 | 완료. `INSERT/UPDATE/MODIFY/DELETE`, `COMMIT WORK`, `ROLLBACK WORK`, `IN UPDATE TASK`, `FROM TABLE`, `sy-dbcnt`, `BAPI`, `SLG1`, `멱등성`, `package/패키지` 반영 확인. |
| 공식 문서 파일명 반영 검색 | 완료. DML, COMMIT/ROLLBACK, SAP LUW, update task, ABAP Cloud/released API 문서 파일명 반영 확인. |
| trailing whitespace 검사 | 완료. `git diff --check -- reference/codex_0625_v2/CH24_REWRITE.md reference/codex_0625_v2/CH24_QA.md` 통과. |
