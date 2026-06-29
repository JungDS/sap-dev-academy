# CH33_QA - AMDP / ADBC / Pushdown

## 판정

PASS. `reference/codex_0625/00_QUALITY_REVIEW.md`에서 지적한 v1의 반복 템플릿, 본문 빈약, 자동 문서 매칭 문제를 CH33 범위에서 해소했다. 산출물은 `reference/codex_0625_v2/CH33_REWRITE.md`이며, 다섯 레슨 모두 완성 강의자료 형식으로 재집필했다.

## 입력 자료

| 구분 | 확인 내용 |
| --- | --- |
| 원본 챕터 | `content/abap/CH33/_chapter.md`, `CH33-L01.md` ~ `CH33-L05.md` |
| 기존 v1 | `reference/codex_0625/CH33_AMDP-ADBC-Pushdown.md` |
| 품질 기준 | `reference/codex_0625/00_QUALITY_REVIEW.md` |
| 프로젝트 규칙 | `.project-docs/01_AI_SYNC.md`, `.project-docs/04_CONVENTIONS.md`, `.project-docs/11_KEYWORD_AUDIT.md`, `.project-docs/CONTENT_DEPTH_AUDIT.md`, `.project-docs/TRACK2_ENRICHMENT.md` |
| 기존 체험물 | `embeds/abap/CH33-L01-S01.html` ~ `embeds/abap/CH33-L05-S01.html` |

## 재작업 기준 반영

| 요구 | 반영 결과 |
| --- | --- |
| v1의 템플릿 반복 제거 | v1의 반복 지시문을 사용하지 않고 CH33의 Pushdown, AMDP, ADBC, 선택 기준, 운영 리스크에 맞게 새로 작성했다. |
| 완성 강의자료 수준 재집필 | 각 레슨을 실제 강의 흐름으로 풀어 쓰고, 왜 강한 수단을 남용하면 안 되는지까지 설명했다. |
| 입문자 흐름 | 모든 레슨에 `왜 필요한가`, `무엇인가`, `어떻게 확인하는가`, `실수와 주의`, `체험형 학습 설계`, `정리`를 배치했다. |
| 코드와 체험 연결 | AMDP/ADBC 코드 예제와 CH33-L02/L03 위젯의 클릭/흐름/상태/피드백을 본문에서 직접 연결했다. |
| Classic ABAP 공식문서 수동 확인 | `C:\ABAP_DOCU_HTML`에서 AMDP method, AMDP options, ADBC, Native SQL, SQL exception, client handling 문서를 직접 확인했다. |
| ABAP Cloud/Clean Core 계열 수동 확인 | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU`에서 ABAP Cloud, released API, AMDP client safety, AMDP SQL injection 경계를 직접 확인했다. |
| 로컬에서 확인 안 되는 근거 보충 | 필요한 근거가 로컬 문서에 있어 인터넷 검색과 NotebookLM은 사용하지 않았다. |
| R15/classic-first | CH33은 Track 2 후반이므로 CH18/19/20/22/23/32 이후 학습 범위 안에서 AMDP/ADBC를 정식 도입했다. SQLScript 심화와 DB 고급 최적화는 범위 밖으로 제한했다. |

## 레슨별 품질 점검

| 레슨 | v1/감사 지적 | v2 보강 | 판정 |
| --- | --- | --- | --- |
| CH33-L01 | Pushdown 판단이 짧고 AMDP 우선 오해 가능 | 데이터 이동량, Open SQL/CDS/AMDP/ADBC 우선순위, 측정 기준, 위젯 토글 해석 보강 | PASS |
| CH33-L02 | AMDP 구조가 압축되고 `READ-ONLY` 의미 보강 필요 | marker interface, `BY DATABASE PROCEDURE`, `USING`, `OPTIONS READ-ONLY`, client 조건, 클릭 해부 위젯 연결 | PASS |
| CH33-L03 | ADBC 설명이 짧고 보안/client 책임 압축 | `CL_SQL_STATEMENT`, `EXECUTE_QUERY`, result set, `set_param_table`, placeholder, `CX_SQL_EXCEPTION`, `EXEC SQL` 대비 보강 | PASS |
| CH33-L04 | 비교 기준이 표 수준으로 압축됨 | 이식성, 재사용, Cloud, 절차 로직, DB 고유 기능 기준으로 선택 판단 흐름 확장 | PASS |
| CH33-L05 | 운영 리스크가 bullet 수준 | client-safety, SQL injection, table buffering, CDS access control, debugging/test 한계, 승인 체크리스트 설계 보강 | PASS |

## 공식 문서 수동 확인 내역

| 범위 | 확인한 파일 | v2 반영 |
| --- | --- | --- |
| AMDP method 구현 | `C:\ABAP_DOCU_HTML\abapmethod_by_db_proc.htm` | `METHOD ... BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT [OPTIONS] [USING]` 구조와 marker interface 필요성 |
| AMDP options | `C:\ABAP_DOCU_HTML\abapmethods_amdp_options.htm` | `AMDP OPTIONS READ-ONLY`가 읽기만 허용하고 READ-ONLY AMDP 호출 제약을 만든다는 설명 |
| AMDP 개요와 ABAP-managed DB objects | `C:\ABAP_DOCU_HTML\abenabap_managed_db_objects_amdp.htm` | AMDP framework가 procedure/function을 관리하고 SQLScript 구현을 DB에서 실행한다는 경계 |
| AMDP vs ABAP SQL | `C:\ABAP_DOCU_HTML\abenamdp_vs_abap_sql_abexa.htm` | ABAP SQL로 표현 가능한 SQL만 AMDP로 옮기는 것은 자동 성능 이점이 아니라는 선택 기준 |
| ADBC 개요 | `C:\ABAP_DOCU_HTML\abenadbc.htm` | ADBC가 Native SQL interface용 class-based API이며, `EXEC SQL`보다 새 프로그램에서 권장된다는 설명 |
| `CL_SQL_STATEMENT` | `C:\ABAP_DOCU_HTML\abencl_sql_statement.htm` | `EXECUTE_QUERY`, 단일 SQL statement, transaction control 주의 |
| ADBC query/result set | `C:\ABAP_DOCU_HTML\abenadbc_query.htm` | `EXECUTE_QUERY`, `CL_SQL_RESULT_SET`, `SET_PARAM_TABLE`, `NEXT_PACKAGE`, placeholder 사용 |
| ADBC exception | `C:\ABAP_DOCU_HTML\abencx_sql_exception.htm` | `SQL_CODE`, `SQL_MESSAGE`, `DB_ERROR`, duplicate/object existence 원인 로그 |
| Embedded Native SQL | `C:\ABAP_DOCU_HTML\abapexec.htm` | `EXEC SQL ... ENDEXEC`는 static Native SQL이며 새 프로그램은 ADBC 중심이라는 경계 |
| Native SQL access risk | `C:\ABAP_DOCU_HTML\abenabap_managed_db_objects_nsql.htm` | platform-dependent, implicit client handling 없음, table buffering/CDS access control 미지원, where-used 약함 |
| Client handling | `C:\ABAP_DOCU_HTML\abenabap_sql_client_handling.htm` | ABAP SQL과 달리 AMDP/Native SQL은 current client를 직접 고려해야 함 |

## ABAP Cloud / Clean Core 경계 확인

| 범위 | 확인한 파일 | v2 반영 |
| --- | --- | --- |
| ABAP Cloud | `ABENABAP_CLOUD_GLOSRY.md` | ABAP Cloud는 restricted language version과 released API 기준이며 RAP이 transactional programming model임 |
| Released API | `ABENRELEASED_API_GLOSRY.md` | Cloud-ready 판단은 released API와 release contract 기준임 |
| AMDP 정의 | `ABENABAP_MANAGED_DB_PROC_GLOSRY.md` | AMDP는 stored/database procedure를 class-based framework로 관리하는 수단임 |
| AMDP client safety | `ABENAMDP_CLIENT_SAFETY.md` | AMDP는 implicit client condition을 넣지 않으므로 `USING` list와 client-safe object 확인이 필요함 |
| AMDP SQL injection | `ABENSQL_INJ_AMDP_SCRTY.md` | AMDP SQLScript의 dynamic part와 외부 입력 결합은 개발자 책임으로 검증해야 함 |
| Native SQL glossary | `ABENNATIVE_SQL_GLOSRY.md` | Native SQL은 DB-specific SQL이고 ADBC class 또는 `EXEC SQL`로 전달됨 |
| SQLScript glossary | `ABENSQL_SCRIPT_GLOSRY.md` | SQLScript는 HANA procedure/function을 위한 script language임 |

## R15 및 classic-first 점검

CH33은 Track 2 후반이며 CH32의 성능 분석과 대량 처리 뒤에 온다.

| 항목 | 처리 |
| --- | --- |
| Modern ABAP | CH18 이후라 inline declaration, `NEW`, `REF #( )`, `VALUE #( )` 사용 가능 |
| Modern SQL | CH19 이후라 `@`, SQL expression, `GROUP BY`, aggregate 전제 가능 |
| OO class/method | CH20 이후라 global class, static method, exception class 전제 가능 |
| CDS/RAP/Cloud | CH22/CH23 이후라 CDS와 ABAP Cloud 경계를 비교 기준으로 사용 가능 |
| SQLScript | AMDP 예제 안에서 최소 독해만 다루고 SQLScript 자체 심화는 범위 밖으로 제한 |
| ADBC/Native SQL | CH33에서 정식 도입. 이전 챕터에는 구현 문법을 당겨 쓰지 않음 |

## 체험형 학습 설계 점검

| 레슨 | 체험 설계 |
| --- | --- |
| CH33-L01 | `끌어오기`/`내려보내기` 버튼으로 Data-to-Code와 Code-to-Data 전송량 차이를 비교한다. |
| CH33-L02 | 밑줄 친 AMDP 구문을 클릭해 marker, procedure declaration, `USING`, `READ-ONLY`, parameter 역할을 해부한다. |
| CH33-L03 | ADBC flow diagram에서 `CL_SQL_STATEMENT`, Native SQL, result set, internal table 경로와 client/injection 경고를 읽는다. |
| CH33-L04 | compare matrix 행을 클릭해 Open SQL, CDS, AMDP, ADBC의 권장 상황과 trade-off를 비교한다. |
| CH33-L05 | 적절/부적절 판별 퀴즈로 AMDP/Native SQL 남용, Cloud 제약, 격리/문서화 원칙을 평가한다. |

## 기계 점검 결과

| 점검 | 명령 | 결과 |
| --- | --- | --- |
| 레슨 수 | `rg -c "^## CH33-L0[1-5]" reference\codex_0625_v2\CH33_REWRITE.md` | 5 |
| 필수 흐름 섹션 수 | `rg -c "^### (왜 필요한가\|무엇인가\|어떻게 확인하는가\|실수와 주의\|체험형 학습 설계\|정리)$" reference\codex_0625_v2\CH33_REWRITE.md` | 30 |
| 오염 패턴 묶음 | v1 반복 문구와 잘못된 자동 문서명 패턴을 `rg`로 검색 | hit 없음 |
| 핵심 키워드 | AMDP, ADBC, Native SQL, SQLScript, `IF_AMDP_MARKER_HDB`, `BY DATABASE PROCEDURE`, `USING`, `READ-ONLY`, `CL_SQL_STATEMENT`, `CX_SQL_EXCEPTION`, client-safe 검색 | 모두 확인 |
| whitespace | `rg -n "[ \t]+$" reference\codex_0625_v2\CH33_REWRITE.md reference\codex_0625_v2\CH33_QA.md` | hit 없음 |
| 공식문서 경로 | QA에 기록한 `C:\ABAP_DOCU_HTML` 및 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU` 근거 파일 `Test-Path` 확인 | 모두 OK |

## 남은 리스크

CH33는 reference 재작성 산출물이므로 실제 `content/abap/CH33` 빌드나 embed 구현 변경은 수행하지 않았다. AMDP/ADBC는 시스템 release, HANA 사용 여부, ADT/DB 권한, Cloud language version, customer namespace 정책에 따라 실습 가능 범위가 달라진다. 실제 교육 페이지로 이식할 때는 대상 시스템에서 AMDP activation 권한, SQLScript debugging 가능 여부, ADBC 허용 정책, ATC/Cloud readiness check 결과를 다시 맞추는 것이 좋다.
