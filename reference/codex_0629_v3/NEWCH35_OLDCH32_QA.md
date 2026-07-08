# NEWCH35_OLDCH32_QA - 성능 분석과 튜닝

## 최종 판정

PASS. `content/abap/CH32`의 다섯 레슨을 v3 파일명 규칙에 맞춰 `NEWCH35_OLDCH32_REWRITE.md`로 재집필했다. 성능 문제를 "느낌으로 고치는 일"이 아니라 `측정 -> 원인 분류 -> 수정 -> 재측정 -> 운영 기준 기록`의 절차로 설명했고, ST05/SAT/SQLM/SWLT, SELECT-in-LOOP 제거, 대량 package/pushdown/병렬 처리 기준을 완성 강의자료 수준으로 확장했다.

이번 장은 감사표에서 CH08, CH09, CH21, CH24, CH25가 CH32로 넘긴 성능/병렬 처리 항목을 닫는다. CH33의 AMDP/ADBC 구현은 앞당기지 않고, CH32에서는 이미 학습한 Open SQL aggregate와 대량 처리 설계 기준까지만 다뤘다.

## 입력 자료

| 구분 | 확인 내용 |
|---|---|
| 원본 챕터 | `content/abap/CH32/_chapter.md`, `CH32-L01.md` ~ `CH32-L05.md` |
| v2 보조 자료 | `reference/codex_0625_v2/CH32_REWRITE.md`, `CH32_QA.md` |
| v3 감사 기준 | `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md` |
| 프로젝트 키워드 감사 | `.project-docs/11_KEYWORD_AUDIT.md` CH32 메모 |
| Track 2 체험물 메모 | `.project-docs/TRACK2_ENRICHMENT.md` CH32 위젯/엔진 메모 |
| 기존 임베드 | `embeds/abap/CH32-L01-S01.html` ~ `CH32-L05-S01.html` |

## 레슨별 반영 점검

| v3 레슨 | 원본 | 보강 결과 | 판정 |
|---|---|---|---|
| NEWCH35-L01 | CH32-L01 ST05 SQL Trace | trace 범위 제한, Trace On/Off, total time, executions, records, identical/redundant select, 반복 SQL 분류, 재측정 기록 반영 | PASS |
| NEWCH35-L02 | CH32-L02 SAT Runtime Analysis | Hit List, own/net/total time, hits, ABAP/DB/System/External 비율, ST05와 SAT 역할 분리, 측정 오버헤드 주의 반영 | PASS |
| NEWCH35-L03 | CH32-L03 SQL Monitor / SQLM | 운영 누적 분석, SQLM snapshot, SWLT source position 연결, total/executions/average 기준, index 남발 주의 반영 | PASS |
| NEWCH35-L04 | CH32-L04 SELECT in LOOP 제거 | 1+N DB 왕복, `FOR ALL ENTRIES` 빈 driver guard, key 중복 제거, `READ TABLE ... BINARY SEARCH`, JOIN/FAE 선택 기준, 결과 동등성/재측정 반영 | PASS |
| NEWCH35-L05 | CH32-L05 대량 데이터 처리와 Package 설계 | `GROUP BY`/aggregate pushdown, package size, commit/restart, lock/memory, 병렬 처리 조건과 자원 위험, CH33 AMDP/ADBC 경계 반영 | PASS |

## 감사 회수 점검

| 감사 항목 | 이전 상태 | v3 처리 |
|---|---|---|
| CH08 성능 심화 | CH32 후속 원본 존재, 예정 회수 | `NEWCH35_OLDCH32` L01~L05에서 측정 도구, 반복 SQL, SELECT-in-LOOP, 대량 처리 설계로 회수 완료 |
| CH09 DB 변경/Transaction/MESSAGE/JOIN/성능 | 후속 배치 명확, 정상 또는 예정 회수 | DB/LUW/MESSAGE/JOIN은 선행 장에서 회수되었고 성능 항목은 `NEWCH35_OLDCH32`에서 회수 완료 |
| CH21 실제 저장/취소, CDS/RAP, 성능 | CH24, CH22/23, CH32 후속 배치 | 성능 항목을 `NEWCH35_OLDCH32`에서 ST05/SAT/SQLM과 대량 처리 기준으로 회수 완료 |
| CH24 병렬 처리/성능 튜닝 | CH32 후속 원본 존재, 예정 회수 | L05에서 package, restart, 병렬 가능성, lock/resource 위험으로 회수 완료 |
| CH25 ALV edit event, BAPI/RFC, 병렬 처리 | ALV/BAPI/RFC는 회수, 병렬 처리/성능은 CH32 예정 | 병렬 처리/성능 항목을 L05에서 회수 완료 |

## Classic ABAP 공식 문서 수동 확인 내역

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| `FOR ALL ENTRIES` | `C:\ABAP_DOCU_HTML\abenwhere_all_entries.htm` | FAE 동작, 중복 제거, 빈 driver table이면 전체 조회될 수 있는 위험 |
| `READ TABLE` | `C:\ABAP_DOCU_HTML\abapread_table.htm`, `abapread_table_key.htm` | `sy-subrc`, `sy-tabix`, sorted key, `BINARY SEARCH`, key access |
| 정렬 | `C:\ABAP_DOCU_HTML\abapsort_itab.htm` | `BINARY SEARCH` 전 정렬과 key 설계 필요 |
| Aggregate | `C:\ABAP_DOCU_HTML\abapselect_aggregate.htm` | aggregate expression과 `SUM` 예시 |
| `GROUP BY` | `C:\ABAP_DOCU_HTML\abapgroupby_clause.htm` | DB에서 group/aggregate를 만들어 AS ABAP로 전송되는 데이터량을 줄이는 원칙 |
| SELECT 구조 | `C:\ABAP_DOCU_HTML\abapselect_clause.htm` | SELECT list/result set 구조와 DISTINCT 경계 |

## ABAP Cloud / RAP 경계 확인

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| ABAP Cloud | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_CLOUD_GLOSRY.md` | cloud-ready/restricted language version 경계 |
| Released API | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENRELEASED_API_GLOSRY.md` | Cloud 환경에서는 released API 기준을 별도 확인해야 함 |
| RAP | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md\ABENABAP_RAP_GLOSRY.md`, `ABENARAP_GLOSRY.md` | RAP/service/query는 신규 개발 경계로만 언급 |
| Classic ABAP | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENCLASSIC_ABAP_GLOSRY.md` | 이 장의 primary context가 Classic ABAP 성능 분석임을 명시 |

## SAP Help Portal 보충 근거

ST05, SAT, SQLM/SWLT는 로컬 ABAP Keyword Documentation의 문법 문서가 아니라 분석 도구 문서에 속하므로 SAP Help Portal 공식 자료를 보충 확인했다.

| 범위 | URL | 본문 반영 |
|---|---|---|
| ST05 Performance Analysis | `https://help.sap.com/docs/SUPPORT_CONTENT/basis/3354611581.html` | ST05가 database access, locking, remote call 등을 trace file로 기록하는 도구임을 반영 |
| ABAP Runtime Analysis / SAT | `https://help.sap.com/saphelp_em92/helpdata/en/3c/74c6163ce4459888bc06dedda37685/content.htm` | runtime/memory 소비 위치, bottleneck, Hit List, hits/net runtime 해석 |
| SQL Monitor / SWLT usage | `https://help.sap.com/saphelp_snc700_ehp04/helpdata/de/1e/c2329419b64f3992a9c342437d3a0f/content.htm` | productive SQL Monitor 수집, snapshot, SWLT source position 결합 흐름 |
| SQL Performance Monitoring | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/a24970c68fcf4770a64bf9a78e3719e2/355d59ff44ce4f789d6b29cda7ec45fa.html` | ST05/SAT/SQL monitoring을 성능 분석 도구로 다루는 경계 |

NotebookLM은 사용하지 않았다. 로컬 공식 문서와 SAP Help Portal 자료로 필요한 근거가 충족되었다.

## R15 및 classic-first 점검

| 항목 | 점검 |
|---|---|
| ST05/SAT/SQLM | 성능 분석 도구로 설명하고 ABAP 문법처럼 오해시키지 않음 |
| Open SQL | CH13/CH19 이후이므로 JOIN, FAE, aggregate, `GROUP BY`, host variable `@` 설명 가능 |
| Internal Table | CH06 이후이므로 `READ TABLE`, sort, binary search, sorted/hashed key 경계 설명 가능 |
| LUW/Package | CH24 이후이므로 commit/restart/package 처리 기준 설명 가능 |
| Lock/병렬 | CH25 이후이므로 병렬 처리의 lock/resource 위험 설명 가능 |
| Pushdown | CH19 이후의 `GROUP BY`/aggregate까지만 다루고, AMDP/ADBC 구현은 CH33으로 유지 |
| ABAP Cloud | released API/RAP 우선 경계만 언급하고 Cloud 전용 구현을 앞당기지 않음 |

## 체험형 학습 설계 점검

| 레슨 | 체험 설계 |
|---|---|
| NEWCH35-L01 | ST05 trace table에서 total time, executions, records를 정렬하고 반복 SQL을 분류 |
| NEWCH35-L02 | SAT Hit List 막대에서 ABAP/DB/External time을 구분하고 다음 분석 도구 선택 |
| NEWCH35-L03 | SQLM 누적 table에서 total/executions/average 기준 우선순위를 바꾸고 SWLT source 연결 |
| NEWCH35-L04 | 예매 건수 slider로 SELECT-in-LOOP 1+N 왕복과 FAE/JOIN 접근 수 비교 |
| NEWCH35-L05 | decision tree와 package size slider로 pushdown/package/parallel/simple processing 판단 |

## 기계 점검 기준

작성 후 다음 항목으로 검증한다.

| 점검 | 기대값 |
|---|---|
| 레슨 헤더 | `NEWCH35-L01` ~ `NEWCH35-L05` 모두 존재 |
| 분석 도구 | `ST05`, `SAT`, `SQLM`, `SWLT`, `Hit List`, `Trace On`, `Trace Off` 존재 |
| SQL 튜닝 | `FOR ALL ENTRIES`, `READ TABLE`, `BINARY SEARCH`, `JOIN`, `SELECT SINGLE`, `execution count` 존재 |
| 대량 처리 | `GROUP BY`, `SUM`, `Package`, `COMMIT WORK`, `병렬`, `aRFC`, `restart`, `lock`, `memory` 존재 |
| 경계 | AMDP/ADBC 구현을 CH32 본문으로 앞당기지 않음 |
| 문서 품질 | Markdown fence 균형, trailing whitespace 없음, `git diff --check` 통과 |

## 남은 리스크

이 산출물은 reference 재작성 문서이며 실제 `content/abap/CH32` 파일과 embed 구현은 수정하지 않았다. ST05/SAT/SQLM 화면과 권한은 SAP release, SAP GUI/ADT 사용 방식, 운영 정책에 따라 달라질 수 있다. 실제 교육 페이지로 이식할 때는 대상 실습 시스템의 메뉴명, 권한, sample trace 결과, 운영 trace 허용 정책을 다시 확인해야 한다.

병렬 처리와 index 추가는 시스템 전체 자원과 운영 정책에 영향을 준다. 이 문서는 초급을 넘어 실무 성능 분석으로 들어가는 학습자를 위한 판단 기준이며, 운영 변경은 Basis/DBA/아키텍처 기준과 함께 결정해야 한다.
