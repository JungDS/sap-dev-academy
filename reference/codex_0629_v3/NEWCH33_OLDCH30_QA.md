# NEWCH33_OLDCH30_QA - 인터페이스 실무: BAPI/RFC/BDC/File

## 최종 판정

PASS. `content/abap/CH30`의 다섯 레슨을 v3 파일명 규칙에 맞춰 `NEWCH33_OLDCH30_REWRITE.md`로 재집필했다. 원본의 BAPI, RFC, BDC, Excel Upload, File Interface 흐름을 유지하면서 "호출 성공"이 아니라 "검증, 메시지 판정, commit/rollback, 로그, 재처리, 멱등성" 중심의 완성 강의자료로 확장했다.

이번 장은 감사표에서 CH10, CH24, CH25가 후속 회수 대상으로 남긴 BAPI/RFC 항목을 닫는다. CH10에서 배운 Function Module 감각을 RFC와 BAPI 호출로 확장했고, CH24의 LUW/COMMIT/ROLLBACK 원칙을 BAPI Return 처리와 파일 인터페이스 재처리 구조로 연결했다. CH25의 ALV edit event는 이미 `NEWCH31_OLDCH28`에서 회수되었고, BAPI/RFC는 이번 장에서 회수되었으며, 병렬 처리/성능은 CH32 후속 원본으로 남긴다.

## 입력 자료

| 구분 | 확인 내용 |
|---|---|
| 원본 챕터 | `content/abap/CH30/_chapter.md`, `CH30-L01.md` ~ `CH30-L05.md` |
| v2 보조 자료 | `reference/codex_0625_v2/CH30_REWRITE.md`, `CH30_QA.md` |
| v3 감사 기준 | `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md` |
| 기존 임베드 | `embeds/abap/CH30-L01-S01.html` ~ `CH30-L05-S01.html` |
| 공식문서 | `C:\ABAP_DOCU_HTML`, `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU` 로컬 문서 수동 확인 |

## 레슨별 반영 점검

| v3 레슨 | 원본 | 보강 결과 | 판정 |
|---|---|---|---|
| NEWCH33-L01 | CH30-L01 BAPI 호출과 Return 처리 | BAPI 의미, `BAPIRET2`, `TYPE E/A/W` 판정, `BAPI_TRANSACTION_COMMIT`, `BAPI_TRANSACTION_ROLLBACK`, warning 정책, 운영 로그 반영 | PASS |
| NEWCH33-L02 | CH30-L02 RFC Function Module 설계 | `CALL FUNCTION ... DESTINATION`, `SM59`, remote-enabled 속성, blank destination local call 위험, `communication_failure`, `system_failure`, `MESSAGE lv_msg`, 권한/로그 반영 | PASS |
| NEWCH33-L03 | CH30-L03 BDC / Batch Input 실무 기준 | `BDCDATA`, `CALL TRANSACTION ... USING`, `OPTIONS FROM`, `MODE`, `UPDATE`, `MESSAGES INTO`, `BDC_OPEN_GROUP`, `BDC_INSERT`, `BDC_CLOSE_GROUP`, `SHDB`, `SM35` 반영 | PASS |
| NEWCH33-L04 | CH30-L04 Excel Upload 처리 | `gui_upload`, `SPLIT`, header skip, row validation, duplicate check, PC/server file 차이, `ALSM_EXCEL_TO_INTERNAL_TABLE` 경계 반영 | PASS |
| NEWCH33-L05 | CH30-L05 File Interface와 재처리 | `OPEN DATASET ... MESSAGE`, `READ DATASET`, `TRANSFER`, `CLOSE DATASET`, directory traversal, commit 단위, retry queue, idempotency 반영 | PASS |

## 감사 회수 점검

| 감사 항목 | 이전 상태 | v3 처리 |
|---|---|---|
| CH10 RFC/BAPI/update task/background | RFC/BAPI는 CH30, update task는 CH24, background는 CH35로 예정 | BAPI/RFC는 `NEWCH33_OLDCH30`에서 회수 완료. update task는 CH24, background job은 `NEWCH38_OLDCH35` 회수 상태 유지 |
| CH24 BAPI/RFC | CH30 후속 원본 존재, 예정 회수 | `NEWCH33_OLDCH30` L01/L02에서 BAPI Return/commit/rollback, RFC destination/예외/로그로 회수 완료 |
| CH25 ALV edit event, BAPI/RFC, 병렬 처리 | ALV edit event는 `NEWCH31_OLDCH28`, BAPI/RFC는 CH30, 병렬 처리는 CH32 예정 | BAPI/RFC는 이번 장에서 회수 완료. 병렬 처리/성능은 CH32 후속 원본으로 유지 |
| 인터페이스 운영 품질 | CH24 재처리 원칙과 연결 필요 | L05에서 로그, 재처리, 멱등성, commit 단위를 통합 구조로 반영 |

## Classic ABAP 공식 문서 수동 확인 내역

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| Function Module 호출 | `C:\ABAP_DOCU_HTML\abapcall_function.htm` | `CALL FUNCTION`, 호출 결과와 `sy-subrc` 확인 |
| RFC destination | `C:\ABAP_DOCU_HTML\abapcall_function_destination.htm`, `abapcall_function_destination_para.htm` | `DESTINATION`, SM59, blank destination local call 위험 |
| RFC 예외 | `C:\ABAP_DOCU_HTML\abenrfc_exception.htm` | `communication_failure`, `system_failure`, `MESSAGE lv_msg` |
| BDC | `C:\ABAP_DOCU_HTML\abapcall_transaction_using.htm`, `abencall_transaction_bdc_abexa.htm` | `BDCDATA`, `CALL TRANSACTION ... USING`, `OPTIONS FROM`, `MESSAGES INTO BDCMSGCOLL` |
| File Interface | `C:\ABAP_DOCU_HTML\abapopen_dataset.htm`, `abapopen_dataset_access.htm`, `abapopen_dataset_error_handling.htm`, `abapread_dataset.htm`, `abaptransfer.htm`, `abapclose_dataset.htm` | `OPEN DATASET`, access mode, `MESSAGE`, `READ DATASET`, `TRANSFER`, `CLOSE DATASET` |
| 문자열 parsing | `C:\ABAP_DOCU_HTML\abapsplit.htm` | Excel/CSV 텍스트 처리의 `SPLIT` |
| LUW | `C:\ABAP_DOCU_HTML\abapcommit.htm`, `abaprollback.htm` | BAPI commit/rollback과 파일 처리 commit 단위 |

## ABAP Cloud / Clean Core 경계 확인

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| BAPI glossary | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md\ABENBUSINESS_APP_PROG_INTER_GLOSRY.md`, `...\docs\cloud\md\ABENBUSINESS_APP_PROG_INTER_GLOSRY.md` | BAPI는 SAP application data/process에 접근하는 predefined interface이며 remote-called function module 기반 |
| ABAP Cloud | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_CLOUD_GLOSRY.md` | restricted language version과 cloud-ready 경계 |
| ABAP for Cloud Development | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_FOR_CLOUD_DEV_GLOSRY.md` | Cloud 개발에서는 released API 여부가 중요함을 경계 설명으로 제한 |
| Released API | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENRELEASED_API_GLOSRY.md` | BAPI가 항상 Cloud released API인 것은 아니라는 판단 기준 |
| Classic ABAP | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENCLASSIC_ABAP_GLOSRY.md` | 이 장의 primary context가 Classic ABAP임을 명시 |

## R15 및 classic-first 점검

| 항목 | 점검 |
|---|---|
| Function Module | CH10 이후이므로 `CALL FUNCTION`, BAPI, RFC FM, `DESTINATION` 설명 가능 |
| Screen Programming | CH16 이후이므로 BDC가 dynpro 화면 흐름에 의존한다는 설명 가능 |
| Modern ABAP | CH18 이후이므로 `line_exists`, inline `DATA` 예제 사용 가능 |
| LUW | CH24 이후이므로 `BAPI_TRANSACTION_COMMIT`, `BAPI_TRANSACTION_ROLLBACK`, commit 단위, rollback 설명 가능 |
| Lock/운영 | CH25 이후이므로 중복 방지, 재처리, 운영 로그, idempotency 설명 가능 |
| 후속 경계 | IDoc/ALE/Gateway는 CH31, 병렬 처리/성능은 CH32, RAP/OData 구현은 후속 Cloud/RAP 장으로 유지 |

## 체험형 학습 설계 점검

| 레슨 | 체험 설계 |
|---|---|
| NEWCH33-L01 | 정상/오류/경고 입력, `BAPIRET2` Return table, commit/rollback 판정, warning 정책 스위치, 로그 패널 |
| NEWCH33-L02 | 정상 호출, destination 없음, 통신 실패, 원격 dump, 권한 오류, `sy-subrc/lv_msg` 로그 |
| NEWCH33-L03 | `BDCDATA` row 누적, `CALL TRANSACTION`, `MESSAGES INTO`, Session queue, `SM35` 재처리 감각 |
| NEWCH33-L04 | raw file preview, header skip, parsing, row validation, rejected rows, 성공 행 등록 |
| NEWCH33-L05 | server file 수신, `OPEN DATASET` 실패 메시지, 행 검증, 오류 파일 생성, 재처리 queue, duplicate blocked 상태 |

## 기계 점검 기준

작성 후 다음 항목으로 검증한다.

| 점검 | 기대값 |
|---|---|
| 레슨 헤더 | `NEWCH33-L01` ~ `NEWCH33-L05` 모두 존재 |
| BAPI | `BAPIRET2`, `BAPI_TRANSACTION_COMMIT`, `BAPI_TRANSACTION_ROLLBACK`, `line_exists` 존재 |
| RFC | `CALL FUNCTION`, `DESTINATION`, `SM59`, `communication_failure`, `system_failure`, `MESSAGE lv_msg` 존재 |
| BDC | `BDCDATA`, `CALL TRANSACTION`, `OPTIONS FROM`, `MESSAGES INTO`, `BDC_OPEN_GROUP`, `BDC_INSERT`, `BDC_CLOSE_GROUP`, `SHDB`, `SM35` 존재 |
| Excel | `gui_upload`, `SPLIT`, header skip, row validation, PC/server file 구분 존재 |
| File | `OPEN DATASET`, `READ DATASET`, `TRANSFER`, `CLOSE DATASET`, `directory traversal`, `idempotency`, `재처리` 존재 |
| 경계 | IDoc/ALE/Gateway 구현, aRFC 병렬 처리, RAP/OData 구현을 CH30 본문으로 앞당기지 않음 |
| 문서 품질 | Markdown fence 균형, trailing whitespace 없음, `git diff --check` 통과 |

## 남은 리스크

이 산출물은 reference 재작성 문서이며 실제 `content/abap/CH30` 파일과 embed 구현은 수정하지 않았다. 실제 교육 페이지로 이식할 때는 대상 SAP release, 사용 가능한 BAPI, RFC destination 정책, BDC 허용 여부, SAP GUI 사용 가능 여부, application server 파일 권한, 운영 로그 표준을 다시 확인해야 한다.

BAPI와 RFC는 시스템마다 공개 범위와 권한 정책이 다를 수 있다. BDC는 화면 변경에 취약하므로 신규 개발의 기본 수단으로 권장하지 않는다. ABAP Cloud 개발에서는 Classic BAPI/RFC 사용 가능성보다 released API 여부를 우선 확인해야 한다.
