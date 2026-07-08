# NEWCH36_OLDCH33_QA - AMDP / ADBC / Pushdown

## 판정

PASS. `content/abap/CH33`의 다섯 레슨을 v3 파일명 규칙에 맞춰 `NEWCH36_OLDCH33_REWRITE.md`로 재집필했다. 기존 원본의 핵심인 Code Pushdown, AMDP, ADBC, Open SQL/CDS/AMDP 비교, 운영 리스크를 유지하되, 각 레슨을 비전공자 기준의 완성 강의자료 흐름으로 확장했다.

추가로 CH33 이후 AMDP 계열을 본격 설명하는 장이 없다는 점을 고려하여 `NEWCH36-L06 - CDS Table Function과 AMDP Function 경계`를 신규 레슨으로 추가했다. 이로써 `BY DATABASE FUNCTION`, `FOR TABLE FUNCTION`, `DEFINE TABLE FUNCTION`, CDS table function의 ABAP SQL data source 소비 구조를 누락 없이 소개했다.

## 입력 자료

| 구분 | 확인 내용 |
| --- | --- |
| 원본 챕터 | `content/abap/CH33/_chapter.md`, `CH33-L01.md` ~ `CH33-L05.md` |
| v2 참고 | `reference/codex_0625_v2/CH33_REWRITE.md`, `CH33_QA.md` |
| v3 감사표 | `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md` |
| 프로젝트 기준 | `.project-docs/11_KEYWORD_AUDIT.md`, `.project-docs/CONTENT_DEPTH_AUDIT.md`, `.project-docs/TRACK2_ENRICHMENT.md` |
| 기존 체험물 | `embeds/abap/CH33-L01-S01.html` ~ `CH33-L05-S01.html` |

## 레슨 매핑

| v3 레슨 | 원본 레슨 | 처리 |
| --- | --- | --- |
| NEWCH36-L01 | CH33-L01 DB Pushdown 판단 기준 | Code-to-Data, Open SQL/CDS/AMDP/ADBC 우선순위, ST05 records 기반 판단, 체험 토글 설계로 확장 |
| NEWCH36-L02 | CH33-L02 AMDP 기본 구조 | `IF_AMDP_MARKER_HDB`, `AMDP OPTIONS READ-ONLY`, `BY DATABASE PROCEDURE`, `USING`, `:parameter`, client 처리, 클릭형 해부 설계 반영 |
| NEWCH36-L03 | CH33-L03 ADBC Native SQL | `CL_SQL_STATEMENT`, `CL_SQL_PREPARED_STATEMENT`, placeholder/binding, `CL_SQL_RESULT_SET`, `CX_SQL_EXCEPTION`, client/injection/result set close 반영 |
| NEWCH36-L04 | CH33-L04 AMDP와 CDS/Open SQL 비교 | Open SQL/CDS/AMDP/CDS Table Function/ADBC 선택 기준을 책임 순서로 재구성 |
| NEWCH36-L05 | CH33-L05 운영 리스크와 DB 종속성 | DB 종속성, client safety, SQL injection, table buffering, CDS access control, 로그/테스트/Cloud 경계 확장 |
| NEWCH36-L06 | 신규 | AMDP Function, `BY DATABASE FUNCTION`, `FOR TABLE FUNCTION`, `DEFINE TABLE FUNCTION`, CDS table function 소비 구조 신규 보강 |

## 감사표 회수 항목

| 감사표 항목 | 이전 상태 | 이번 처리 |
| --- | --- | --- |
| CH19 Native SQL/ADBC | CH33 후속 원본 존재, 예정 회수 | NEWCH36-L03/L05에서 ADBC/Native SQL, client, injection, exception, `EXEC SQL` 경계로 회수 완료 |
| CH24/CH32 pushdown 판단 | CH32에서 pushdown 판단 예고 | NEWCH36-L01/L04에서 Open SQL/CDS/AMDP/ADBC 선택 순서로 회수 완료 |
| CH33 AMDP/ADBC 원본 장 | 미작성 | NEWCH36_OLDCH33 산출물로 작성 완료 |
| CDS Table Function | 원본 CH33에 명시적 레슨 없음 | NEWCH36-L06 신규 레슨으로 누락 방지 |

## 공식문서 수동 확인 내역

Classic ABAP와 표준 API 문서는 `C:\ABAP_DOCU_HTML`에서 수동 확인했다.

| 범위 | 확인 파일 | 반영 내용 |
| --- | --- | --- |
| AMDP 구현 구문 | `C:\ABAP_DOCU_HTML\abapmethod_by_db_proc.htm` | `METHOD ... BY DATABASE PROCEDURE|FUNCTION FOR HDB LANGUAGE SQLSCRIPT [OPTIONS] [USING]` |
| AMDP 선언 옵션 | `C:\ABAP_DOCU_HTML\abapmethods_amdp_options.htm` | `[CLASS-]METHODS ... AMDP OPTIONS READ-ONLY`, 읽기 전용 제약, 선언/구현부 `READ-ONLY` 적용 |
| AMDP 개요 | `C:\ABAP_DOCU_HTML\abenabap_managed_db_objects_amdp.htm` | AMDP가 procedure/function을 ABAP-managed framework로 관리한다는 설명 |
| AMDP vs ABAP SQL | `C:\ABAP_DOCU_HTML\abenamdp_vs_abap_sql_abexa.htm` | 단순 SQL을 AMDP로 옮기는 것만으로 자동 성능 이점이 아님 |
| ADBC 개요 | `C:\ABAP_DOCU_HTML\abenadbc.htm` | ADBC 권장, `EXEC SQL`은 새 프로그램의 기본 방식이 아님 |
| `CL_SQL_STATEMENT` | `C:\ABAP_DOCU_HTML\abencl_sql_statement.htm` | SQL statement 실행과 transaction control 주의 |
| ADBC query/result set | `C:\ABAP_DOCU_HTML\abenadbc_query.htm` | `EXECUTE_QUERY`, `SET_PARAM_TABLE`, `NEXT_PACKAGE`, `CLOSE` |
| ADBC exception | `C:\ABAP_DOCU_HTML\abencx_sql_exception.htm` | `CX_SQL_EXCEPTION`, SQL code/message 운영 로그 |
| Embedded Native SQL | `C:\ABAP_DOCU_HTML\abapexec.htm` | Native SQL은 syntax check 제한, implicit client 없음, ADBC 권장 |
| Native SQL access risk | `C:\ABAP_DOCU_HTML\abenabap_managed_db_objects_nsql.htm` | table buffering, CDS access control, implicit client handling, where-used 제한 |
| Client handling | `C:\ABAP_DOCU_HTML\abenabap_sql_client_handling.htm` | ABAP SQL은 implicit client handling, AMDP/Native SQL은 current client 직접 지정 |
| CDS table function | `C:\ABAP_DOCU_HTML\abapclass-methods_for_tabfunc.htm`, `abencds_f1_define_table_function.htm` | `FOR TABLE FUNCTION`, `DEFINE TABLE FUNCTION`, `implemented by method` |

## ABAP Cloud / Clean Core 경계 확인

`C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU`에서 Cloud/standard Markdown 문서를 수동 확인했다.

| 범위 | 확인 파일 | 반영 내용 |
| --- | --- | --- |
| ABAP Cloud | `abap-docs-main\docs\cloud\md\ABENABAP_CLOUD_GLOSRY.md` | restricted language version, released API, RAP transactional model |
| Released API | `ABENRELEASED_API_GLOSRY.md` | release contract와 restricted language visibility |
| AMDP client safety | `ABENAMDP_CLIENT_SAFETY.md` | AMDP framework는 implicit client condition을 넣지 않으며 client-safe object와 `USING` list 확인 필요 |
| AMDP SQL injection | `ABENSQL_INJ_AMDP_SCRTY.md` | SQLScript dynamic part와 외부 입력 결합은 개발자 책임 |
| AMDP methods/glossary | `ABENAMDP_METHODS.md`, `ABENAMDP_GLOSSARY.md` | procedure/function, table/scalar function 구분 |
| CDS table function | `ABENCDS_F1_DEFINE_TABLE_FUNCTION.md`, `ABAPCLASS-METHODS_FOR_TABFUNC.md` | CDS table function은 AMDP function implementation으로 구현되고 ABAP SQL data source로 사용 |
| Native SQL | `ABENNATIVE_SQL_GLOSRY.md` | Native SQL은 DB-specific SQL이며 ADBC 또는 `EXEC SQL`로 전달 |
| SQLScript | `ABENSQL_SCRIPT_GLOSRY.md` | HANA procedure/function용 script language |

## R15 및 classic-first 점검

| 항목 | 판정 |
| --- | --- |
| CH18 이후 문법 | `NEW`, `REF #( )`, inline declaration 사용 가능 |
| CH19 이후 SQL | `GROUP BY`, aggregate, host variable, Open SQL pushdown 판단 가능 |
| CH20 이후 OO | global class, static method, interface 전제 가능 |
| CH22 이후 CDS | CDS View와 CDS Table Function 경계 설명 가능 |
| CH23 이후 Cloud/RAP | ABAP Cloud, released API, Clean Core 경계 비교 가능 |
| CH32 이후 성능 | ST05/SAT/SQLM 측정 후 pushdown 판단 연결 가능 |
| SQLScript 심화 제한 | SQLScript 고급 문법, PlanViz 심화, optimizer hint 남발은 범위 밖으로 제한 |

## 체험형 학습 설계 점검

| 레슨 | 설계 |
| --- | --- |
| NEWCH36-L01 | Data-to-Code/Code-to-Data 토글, Open SQL/CDS/AMDP/ADBC 선택 카드 |
| NEWCH36-L02 | AMDP code anatomy 클릭형 해부, 오류 카드 판별 |
| NEWCH36-L03 | ADBC flow diagram, injection/client/result set close 위험 카드 |
| NEWCH36-L04 | 선택 매트릭스, 상황 카드별 추천 수단 강조 |
| NEWCH36-L05 | 운영 승인 체크리스트, 적절/부적절 판별 퀴즈 |
| NEWCH36-L06 | CDS DDL -> AMDP class -> ABAP SQL 소비 연결 지도 신규 설계 |

## 기계 점검 기대값

| 점검 | 기대 |
| --- | --- |
| 레슨 헤더 | `NEWCH36-L01` ~ `NEWCH36-L06` 존재 |
| 필수 키워드 | `AMDP`, `ADBC`, `Native SQL`, `SQLScript`, `IF_AMDP_MARKER_HDB`, `BY DATABASE PROCEDURE`, `BY DATABASE FUNCTION`, `FOR TABLE FUNCTION`, `DEFINE TABLE FUNCTION` 존재 |
| ADBC 책임 | `CL_SQL_STATEMENT`, `CL_SQL_PREPARED_STATEMENT`, `CL_SQL_RESULT_SET`, `SET_PARAM_TABLE`, `NEXT_PACKAGE`, `CLOSE`, `CX_SQL_EXCEPTION` 존재 |
| 보안/client | `implicit client handling`, `MANDT`, `SQL injection`, `placeholder`, `client-safe`, `USING` 존재 |
| 운영 경계 | `Open SQL`, `CDS`, `Clean Core`, `released API`, `Cloud`, `table buffering`, `CDS access control` 존재 |
| 코드 fence | 짝수 개 |

## 남은 리스크

이 산출물은 reference 재작성 문서이며 실제 `content/abap/CH33`과 embed 구현 파일은 수정하지 않았다. AMDP/ADBC/CDS Table Function은 SAP release, HANA 사용 여부, ADT/DB 권한, ABAP language version, Cloud readiness, customer namespace 정책에 따라 실습 가능 범위가 달라진다. 실제 교육 페이지로 이식할 때는 대상 실습 시스템에서 AMDP activation 권한, SQLScript debugging, ADBC 허용 정책, ATC/Cloud readiness check를 다시 확인해야 한다.
