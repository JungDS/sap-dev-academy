# CH32_QA - 성능 분석과 튜닝

## 판정

PASS. `reference/codex_0625/00_QUALITY_REVIEW.md`에서 지적한 v1의 반복 템플릿, 본문 빈약, 자동 문서 매칭 문제를 CH32 범위에서 해소했다. 산출물은 `reference/codex_0625_v2/CH32_REWRITE.md`이며, 다섯 레슨 모두 완성 강의자료 형식으로 재집필했다.

## 입력 자료

| 구분 | 확인 내용 |
| --- | --- |
| 원본 챕터 | `content/abap/CH32/_chapter.md`, `CH32-L01.md` ~ `CH32-L05.md` |
| 기존 v1 | `reference/codex_0625/CH32_성능-분석과-튜닝.md` |
| 품질 기준 | `reference/codex_0625/00_QUALITY_REVIEW.md` |
| 프로젝트 규칙 | `.project-docs/01_AI_SYNC.md`, `.project-docs/04_CONVENTIONS.md`, `.project-docs/11_KEYWORD_AUDIT.md`, `.project-docs/CONTENT_DEPTH_AUDIT.md`, `.project-docs/TRACK2_ENRICHMENT.md` |
| 기존 체험물 | `embeds/abap/CH32-L01-S01.html` ~ `embeds/abap/CH32-L05-S01.html` |

## 재작업 기준 반영

| 요구 | 반영 결과 |
| --- | --- |
| v1의 템플릿 반복 제거 | v1의 반복 지시문을 사용하지 않고 CH32의 성능 측정, 원인 분류, 튜닝 흐름에 맞게 새로 작성했다. |
| 완성 강의자료 수준 재집필 | ST05, SAT, SQLM, SELECT-in-LOOP 제거, 대량처리를 `측정 -> 판단 -> 수정 -> 재측정` 흐름으로 확장했다. |
| 입문자 흐름 | 모든 레슨에 `왜 필요한가`, `무엇인가`, `어떻게 확인하는가`, `실수와 주의`, `체험형 학습 설계`, `정리`를 배치했다. |
| 코드와 체험 연결 | L04/L05 코드와 기존 위젯의 slider, table sort, decision tree, 결과 피드백을 본문에서 직접 연결했다. |
| Classic ABAP 공식문서 수동 확인 | `C:\ABAP_DOCU_HTML`에서 FAE, `READ TABLE`, `SORT`, aggregate, `GROUP BY` 관련 문서를 직접 확인했다. |
| ABAP Cloud/Clean Core 계열 수동 확인 | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU`에서 ABAP Cloud, released API, RAP glossary를 직접 확인했다. |
| 로컬에서 확인 안 되는 공식 근거 보충 | ST05/SAT/SQLM/SWLT는 ABAP Keyword Doc 문법 범위 밖이라 SAP Help Portal 공식 문서를 인터넷으로 확인했다. |
| R15/classic-first | CH32는 Track 2이므로 CH06/08/13/18/19/24/31 이후 학습 범위 안에서 modern SQL과 성능 도구를 다뤘다. CH33 AMDP/ADBC는 예고로 제한했다. |

## 레슨별 품질 점검

| 레슨 | v1/감사 지적 | v2 보강 | 판정 |
| --- | --- | --- | --- |
| CH32-L01 | ST05 설명이 짧고 도구 사용 흐름이 압축됨 | trace 범위 제한, total time/execution count/records 해석, 반복 SQL 분류, 수정 후 재측정을 추가 | PASS |
| CH32-L02 | SAT를 단순 Hit List 소개로 다룸 | ABAP time/DB time/System time 분류, hits 해석, ST05와 SAT 역할 분리, 측정 오버헤드 주의 보강 | PASS |
| CH32-L03 | SQLM 운영 관점이 압축됨 | 운영 기간 누적 분석, total/average/executions 기준, SWLT와 source position 연결, index 남발 주의 보강 | PASS |
| CH32-L04 | 코드가 있으나 운영 확인과 공식 경고 보강 필요 | SELECT-in-LOOP의 1+N 비용, FAE 빈 driver table 전체 조회 경고, key 중복 제거, 결과 동등성, ST05 재측정까지 확장 | PASS |
| CH32-L05 | 대량 처리와 pushdown 설명이 짧음 | DB aggregate, `GROUP BY`, package size, commit/restart, 병렬 조건, CH33 경계까지 보강 | PASS |

## 공식 문서 수동 확인 내역

| 범위 | 확인한 파일 | v2 반영 |
| --- | --- | --- |
| `FOR ALL ENTRIES` | `C:\ABAP_DOCU_HTML\abenwhere_all_entries.htm` | FAE 문법, row별 조건 평가, duplicate 제거, 빈 driver table이면 WHERE 조건이 무시되는 경고 |
| `READ TABLE` | `C:\ABAP_DOCU_HTML\abapread_table.htm`, `abapread_table_key.htm` | `sy-subrc`, `sy-tabix`, sorted key, hash key, binary search, key access 주의 |
| 정렬 | `C:\ABAP_DOCU_HTML\abapsort_itab.htm` | `BINARY SEARCH` 전 정렬 필요와 internal table search 설계 |
| Aggregate | `C:\ABAP_DOCU_HTML\abapselect_aggregate.htm` | aggregate expression이 여러 row 값을 집계하고 `SUM` 등으로 단일 값을 만드는 설명 |
| `GROUP BY` | `C:\ABAP_DOCU_HTML\abapgroupby_clause.htm` | group과 aggregate가 database system에서 만들어져 DB-AS ABAP 데이터 이동량을 줄일 수 있음 |
| SELECT 구조 | `C:\ABAP_DOCU_HTML\abapselect_clause.htm` | SELECT list, WHERE, GROUP BY, INTO 흐름의 문법 경계 |
| ABAP Cloud 경계 | `ABENABAP_CLOUD_GLOSRY.md`, `ABENRELEASED_API_GLOSRY.md` | Cloud-ready 판단은 restricted language version과 released API 기준임을 경계로만 반영 |
| RAP 경계 | `ABENABAP_RAP_GLOSRY.md`, `ABENARAP_GLOSRY.md` | RAP은 ABAP Cloud의 transactional programming model이며 OData와 CDS/RAP behavior 기반임을 CH33 이후 경계로만 반영 |

## SAP Help Portal 보충 근거

ST05, SAT, SQLM/SWLT는 로컬 ABAP Keyword Documentation의 문법 문서가 아니라 분석 도구 문서에 속하므로 SAP Help Portal을 보충 확인했다.

| 범위 | URL | v2 반영 |
| --- | --- | --- |
| ST05 Performance Trace | `https://help.sap.com/docs/SUPPORT_CONTENT/basis/3354611581.html` | ST05가 database access, locking, remote call 등을 trace file로 기록하는 도구임을 반영 |
| ABAP Runtime Analysis / SAT | `https://help.sap.com/saphelp_em92/helpdata/en/3c/74c6163ce4459888bc06dedda37685/content.htm` | Hit List로 runtime 소비 항목을 찾고 hits/net runtime을 해석하는 흐름 반영 |
| ABAP Runtime Analysis 개요 | `https://help.sap.com/saphelp_em700_ehp01/helpdata/en/49/2fc895b7ac2583e10000000a421937/content.htm` | Runtime Analysis가 statement부터 transaction까지 duration overview를 제공한다는 경계 반영 |
| SQL Monitor snapshot / SWLT | `https://help.sap.com/docs/SAP_NETWEAVER_AS_ABAP_752/a24970c68fcf4770a64bf9a78e3719e2/27b5c104071f4c738d0eccacddd6769e.html` | SQLM snapshot과 SWLT 연결 흐름 반영 |
| SWLT usage scenarios | `https://help.sap.com/saphelp_snc700_ehp04/helpdata/de/1e/c2329419b64f3992a9c342437d3a0f/content.htm` | runtime data와 static check 결과를 source position 기준으로 결합한다는 설명 반영 |

NotebookLM은 사용하지 않았다. 로컬 공식 문서와 SAP Help Portal 자료로 필요한 근거가 충족되었다.

## R15 및 classic-first 점검

CH32는 Track 2 구간이며 CH06 Internal Table, CH08/CH13 Open SQL, CH18/CH19 modern syntax와 modern SQL, CH24 package/commit, CH31 운영 연계 관점을 전제로 한다.

| 항목 | 처리 |
| --- | --- |
| ST05/SAT/SQLM | 성능 분석 도구로 설명하고, ABAP 문법처럼 오해시키지 않았다. |
| SELECT-in-LOOP | CH13의 JOIN/FAE와 CH06의 `READ TABLE` 전제 위에서 설명했다. |
| Modern SQL | CH19 이후이므로 `@`, inline `DATA`, aggregate SQL 예시를 사용했다. |
| Pushdown | `GROUP BY`/aggregate는 CH19 이후 학습 범위로 다뤘고, AMDP/ADBC는 CH33 예고로 제한했다. |
| ABAP Cloud | released API/RAP 우선 경계만 언급하고 Cloud 전용 구현을 앞당기지 않았다. |

## 체험형 학습 설계 점검

| 레슨 | 체험 설계 |
| --- | --- |
| CH32-L01 | ST05 trace table에서 header sort로 total time, execution count, records를 비교하고 반복 SQL을 찾는다. |
| CH32-L02 | SAT Hit List 막대에서 ABAP time과 DB time을 구분하고 다음 분석 도구를 선택한다. |
| CH32-L03 | SQLM 누적 table에서 total time, executions, average time 기준 우선순위를 바꿔 본다. |
| CH32-L04 | slider로 예매 건수 N을 늘리며 SELECT-in-LOOP 1+N 왕복과 FAE/JOIN 2회 접근을 비교한다. |
| CH32-L05 | decision tree로 pushdown, package, parallel, simple processing을 상황별로 고른다. |

## 기계 점검 결과

| 점검 | 명령 | 결과 |
| --- | --- | --- |
| 레슨 수 | `rg -c "^## CH32-L0[1-5]" reference\codex_0625_v2\CH32_REWRITE.md` | 5 |
| 필수 흐름 섹션 수 | `rg -c "^### (왜 필요한가\|무엇인가\|어떻게 확인하는가\|실수와 주의\|체험형 학습 설계\|정리)$" reference\codex_0625_v2\CH32_REWRITE.md` | 30 |
| 오염 패턴 묶음 | v1 반복 문구와 잘못된 자동 문서명 패턴을 `rg`로 검색 | hit 없음 |
| 핵심 키워드 | ST05, SAT, SQLM, SWLT, FAE, `READ TABLE`, `BINARY SEARCH`, `GROUP BY`, aggregate, package, pushdown 검색 | 모두 확인 |
| whitespace | `rg -n "[ \t]+$" reference\codex_0625_v2\CH32_REWRITE.md reference\codex_0625_v2\CH32_QA.md` | hit 없음 |

## 남은 리스크

CH32는 reference 재작성 산출물이므로 실제 `content/abap/CH32` 빌드나 embed 구현 변경은 수행하지 않았다. ST05/SAT/SQLM 화면과 권한은 SAP release, SAP GUI/ADT 사용 방식, 운영 정책에 따라 달라질 수 있다. 실제 교육 페이지로 이식할 때는 대상 실습 시스템의 메뉴명, 권한, 예시 trace 결과를 한 번 더 맞추는 것이 좋다.
