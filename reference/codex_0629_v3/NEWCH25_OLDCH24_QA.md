# CH24_QA · 실무 데이터 변경과 트랜잭션 제어 검수

> 대상 산출물: `reference/codex_0629_v3/NEWCH25_OLDCH24_REWRITE.md`
> 작업 단위: CH24 1개 챕터
> 기준: `content/abap/CH24`, `.project-docs/04_CONVENTIONS.md` R6/R15, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`

## 1. 작업 범위 확인

| 항목 | 확인 |
|---|---|
| 챕터 | CH24 · 실무 데이터 변경과 트랜잭션 제어 |
| 원본 레슨 수 | L01~L05, 총 5개 |
| 산출 파일 | `NEWCH25_OLDCH24_REWRITE.md`, `NEWCH25_OLDCH24_QA.md` |
| 주 소스 | `content/abap/CH24` |
| 보조 참고 | `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 직전 v3 CH23 품질 패턴 |
| 품질 목표 | Track-2 첫 장으로 직접 DML, commit/rollback, LUW, 오류 재처리, 패키지 처리를 완성 강의자료 수준으로 재작성 |

CH24는 Classic ABAP 직접 데이터 변경 장이다. RAP `COMMIT ENTITIES`, Lock Object 직접 구현, BAPI/RFC 상세, Application Log 운영 상세는 후속 장으로 보류한다.

## 2. 원본 레슨 커버리지

| 원본 | v3 반영 위치 | 반영 내용 |
|---|---|---|
| `_chapter.md` | `CH24 전체 설계`, `CH24 R15 경계`, `CH24 최종 정리` | "데이터를 바꾼다"를 복구 가능한 트랜잭션 설계로 재정의 |
| `CH24-L01.md` | `CH24-L01 · INSERT / UPDATE / MODIFY / DELETE 실무 기준` | DML 4형제, `FROM TABLE`, 감사필드, 표준 테이블 직접 DML 금지 |
| `CH24-L02.md` | `CH24-L02 · COMMIT WORK / ROLLBACK WORK` | 원자성, 단계별 실패 누적, `AND WAIT`, rollback 주의 |
| `CH24-L03.md` | `CH24-L03 · DB LUW와 SAP LUW 차이` | DB LUW/SAP LUW, update task, `PERFORM ... ON COMMIT` |
| `CH24-L04.md` | `CH24-L04 · 오류 로그와 재처리 구조` | 실패 건 수집, 오류 로그, 재처리, 멱등성 |
| `CH24-L05.md` | `CH24-L05 · 대량 변경 시 Package 처리` | 패키지 commit, 마지막 나머지 commit, 재시작점 |

판정: 원본 5개 레슨이 모두 별도 절로 반영되었고, 원본의 짧은 설명을 템플릿 반복 없이 실무 저장 흐름으로 확장했다.

## 3. 공식 문서 수동 확인

Classic ABAP 문서는 `C:\ABAP_DOCU_HTML`에서 직접 확인했고, Markdown 사본은 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md`에서 대조했다.

| 주제 | 확인 문서 |
|---|---|
| `INSERT` | `abapinsert_dbtab.htm`, `ABAPINSERT_DBTAB.md` |
| `UPDATE` | `abapupdate.htm`, `ABAPUPDATE.md`, `ABAPUPDATE_SET_EXPRESSION.md` |
| `MODIFY` | `abapmodify_dbtab.htm`, `ABAPMODIFY_DBTAB.md` |
| `DELETE` | `abapdelete_dbtab.htm`, `ABAPDELETE_DBTAB.md` |
| `COMMIT WORK` | `abapcommit.htm`, `ABAPCOMMIT.md` |
| `ROLLBACK WORK` | `abaprollback.htm`, `ABAPROLLBACK.md` |
| update task | `abapcall_function_update.htm`, `ABAPCALL_FUNCTION_UPDATE.md` |
| `PERFORM ... ON COMMIT` | `abapperform_on_commit.htm`, `ABAPPERFORM_ON_COMMIT.md` |

확인 결과: CH24에서 사용하는 DML, system field, commit/rollback, update task 설명은 공식 문서와 정합한다.

## 4. 공식 문서 반영 사항

| 항목 | 반영 |
|---|---|
| DML 결과 확인 | `INSERT`, `UPDATE`, `MODIFY`, `DELETE`가 `sy-subrc`와 `sy-dbcnt`를 설정한다는 점을 반영 |
| Commit 전 rollback 가능 | DML 변경은 다음 database commit 전 rollback 가능하다는 설명을 L01/L02에 반영 |
| `FROM TABLE` | `INSERT ... FROM TABLE @itab`, `MODIFY ... FROM TABLE @itab`를 대량 처리 전 단계로 반영 |
| `UPDATE SET` | 상태 변경과 감사필드 갱신 예제로 반영 |
| `DELETE WHERE` | 조건 없는 삭제 위험과 영향 행 수 확인으로 반영 |
| `COMMIT WORK AND WAIT` | update task 완료 대기와 `sy-subrc` 차이를 반영 |
| `ROLLBACK WORK` | update task 등록 삭제, rollback 후 `sy-subrc` 확인 불필요를 반영 |
| update task | 즉시 실행이 아니라 등록이고 `COMMIT WORK` 시점에 실행됨을 반영 |
| `PERFORM ... ON COMMIT` | 지연 실행 개념과 신규 설계 주의로 반영 |

## 5. R15 게이팅 및 경계

### CH24에서 허용한 것

| 항목 | 이유 |
|---|---|
| `INSERT/UPDATE/MODIFY/DELETE` | CH24 핵심 주제 |
| `FROM TABLE` | 원본 L01과 대량 변경 전제 |
| `sy-subrc`, `sy-dbcnt` | DML 결과 확인 필수 요소 |
| `COMMIT WORK`, `ROLLBACK WORK`, `COMMIT WORK AND WAIT` | CH24-L02 핵심 주제 |
| DB LUW와 SAP LUW | CH24-L03 핵심 주제 |
| `CALL FUNCTION ... IN UPDATE TASK` | SAP LUW 지연 실행 이해를 위한 공식 범위 |
| `PERFORM ... ON COMMIT` | 오래된 코드 독해와 LUW 이해 범위 |
| 오류 수집, 재처리, 멱등성 | CH24-L04 핵심 주제 |
| 패키지 commit과 재시작점 | CH24-L05 핵심 주제 |

### CH24에서 보류한 것

| 보류 항목 | 처리 |
|---|---|
| Lock Object 직접 구현 | CH25 범위 |
| BAPI/RFC 상세 구현 | CH30 범위 |
| Application Log, BAL, SLG1 상세 | CH35 범위 |
| RAP `MODIFY ENTITIES`, `COMMIT ENTITIES`, `ROLLBACK ENTITIES` | RAP/ABAP Cloud 후속 심화 범위 |
| ALV edit event 저장 흐름 | CH28 범위 |
| 병렬 처리와 성능 튜닝 심화 | CH32 이후 범위 |

판정: CH24의 직접 DML과 트랜잭션 제어 범위를 지켰고, 동시성·운영 로그·RAP EML로 과도하게 확장하지 않았다.

## 6. 입문자 강의 흐름 점검

| 흐름 | 반영 |
|---|---|
| 왜 필요한가 | 읽기와 쓰기의 위험 차이, 예매 저장의 반쪽 저장 문제, 대량 처리 실패를 문제 상황으로 제시 |
| 무엇인가 | DML 4형제, commit/rollback, DB LUW/SAP LUW, 오류 로그, 패키지 처리를 책임별로 설명 |
| 어떻게 확인하는가 | `WHERE` 사전 조회, `sy-subrc`/`sy-dbcnt`, commit 전후 DB 확인, update task 타임라인, 재처리 대상 확인 |
| 실수/주의 | 중복키, `WHERE` 누락, 표준 테이블 직접 DML, 마지막 `sy-subrc`만 확인, commit 남발, rollback 후 `sy-subrc` 확인 오해 |
| 정리 | 각 레슨 끝에 저장 사고방식 중심으로 요약 |

판정: 비전공자가 문법을 외우기보다 "어떤 사고를 막기 위해 이 문법이 필요한가"를 이해하도록 구성했다.

## 7. 체험형 학습 설계 점검

| 레슨 | 학습 장치 | 데이터/상태/피드백 |
|---|---|---|
| L01 | DML 플레이그라운드 | 미니 `ZBOOKING`, selected key, `sy-subrc`, `sy-dbcnt`, 중복키와 `WHERE` 누락 피드백 |
| L02 | 원자성 시뮬레이터 | 예매 헤더/항목, failure flag, pending/committed/rolled-back 상태 |
| L03 | SAP LUW 타임라인 | update task queue, DB visible rows, commit/rollback 단계 |
| L04 | 재처리 시뮬레이터 | 정상/오류 입력, 오류 테이블, retry attempt, idempotent flag |
| L05 | 패키지 커밋 시각화 | 총 건수, 패키지 크기, committed packages, rollback scope, restart position |

판정: 모든 레슨에 버튼, 상태, 데이터, 피드백 설계를 포함했다.

## 8. 코드·설계 검토

| 항목 | 검토 결과 |
|---|---|
| DML 예제 | `INSERT`, `UPDATE SET`, `MODIFY`, `DELETE FROM ... WHERE`를 모두 포함 |
| 감사필드 | `created_by/on/at`, `changed_by/on/at` 구분 |
| 결과 확인 | `sy-subrc`와 `sy-dbcnt`를 함께 설명 |
| 트랜잭션 예제 | 마지막 DML의 `sy-subrc`만 보는 원본 단순화를 보완하여 실패 누적 플래그 사용 |
| `AND WAIT` | 필요한 경우에만 사용하고 `sy-subrc` 의미 차이를 설명 |
| update task | 등록과 실행 분리, rollback 시 등록 삭제, `sy-subrc` undefined 주의 반영 |
| 오류 처리 | 업무 키와 사유를 가진 오류 테이블 구조 예시 포함 |
| 패키지 처리 | 마지막 나머지 commit과 재시작점 관리 포함 |
| 표준 테이블 규율 | 표준 테이블 직접 DML 금지, BAPI/표준 API 경유 명시 |

판정: 원본보다 실무 사고 방지 요소를 보강했고, 공식 문서와 충돌하는 설명은 발견되지 않았다.

## 9. 자동 검증 기준

작업 후 다음 검증을 수행한다.

| 검증 | 기대 |
|---|---|
| `git diff --check` | whitespace 오류 없음 |
| `rg "^## CH24-L0[1-5]"` | L01~L05 헤딩 5개 존재 |
| 반복 문구 검색 | 기존 템플릿형 고정 문구와 이전 챕터 공식문서 힌트 없음 |
| 경계 검색 | CH25 Lock Object 직접 구현, RAP EML commit/rollback 코드가 본문으로 들어오지 않음 |
| 파일 상태 | `NEWCH25_OLDCH24_REWRITE.md`, `NEWCH25_OLDCH24_QA.md` 두 파일만 신규 |

## 10. 잔여 리스크

| 리스크 | 판단 |
|---|---|
| DB별 lock/rollback 자원 동작 차이 | CH24는 개념과 실무 설계 중심으로 설명하고 DB 세부 튜닝은 후속으로 보류 |
| 표준 테이블 변경 예외 | 원칙은 직접 DML 금지로 유지하고, 표준 API/BAPI 세부는 CH30으로 보류 |
| Application Log 세부 미구현 | CH24에서는 오류 로그와 재처리 구조만 다루고 BAL/SLG1 구현은 CH35로 보류 |
| 패키지 commit의 부분 성공 정책 | 전체 rollback 전략과 부분 성공 전략을 구분해 설명했으며, 실제 선택은 업무 요구사항으로 결정한다고 명시 |

## 11. 최종 판정

CH24 재집필본은 다음 기준을 충족한다.

- 원본 L01~L05를 모두 독립 절로 반영했다.
- 기존 템플릿 반복 없이 저장 프로그램의 실패 방지 흐름으로 재구성했다.
- Classic ABAP 공식 문서를 `C:\ABAP_DOCU_HTML`에서 직접 확인하고 핵심 내용을 반영했다.
- 모든 레슨에 확인 절차와 체험형 학습 설계를 포함했다.
- R15 게이팅을 지키며 Lock Object, BAPI/RFC, BAL/SLG1, RAP EML 심화를 후속 장으로 보류했다.

판정: `NEWCH25_OLDCH24_REWRITE.md`는 v3 품질 기준으로 사용 가능하다.
