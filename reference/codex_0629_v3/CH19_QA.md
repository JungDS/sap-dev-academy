# CH19_QA · New Open SQL / Modern ABAP SQL 검수

> 대상 산출물: `reference/codex_0629_v3/CH19_REWRITE.md`  
> 작업 단위: CH19 1개 챕터  
> 기준: `content/abap/CH19` 원본, `.project-docs/04_CONVENTIONS.md` R6/R15, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`

## 1. 작업 범위 확인

| 항목 | 확인 |
|---|---|
| 챕터 | CH19 · New Open SQL / Modern ABAP SQL |
| 원본 레슨 수 | L01~L08, 총 8개 |
| 산출 파일 | `CH19_REWRITE.md`, `CH19_QA.md` |
| 주 소스 | `content/abap/CH19` |
| 보조 참고 | `reference/codex_0625_v2/CH19_REWRITE.md`, `reference/codex_0625_v2/CH19_QA.md` |
| 품질 목표 | IT 비전공 입문자 기준의 완성 강의자료 수준 재집필 |

CH19는 CH18의 modern ABAP syntax 이후, New Open SQL이 처음 정식으로 열리는 장이다. 따라서 `@`, `@DATA`, 콤마 SELECT list, SQL expression, SQL function, `SELECT FROM @itab`은 사용 대상이며, CH20 이후 OO·예외·CDS·DML·고급 SQL은 코드로 앞당기지 않는 것이 핵심 검수 기준이다.

## 2. 원본 레슨 커버리지

| 원본 | v3 반영 위치 | 반영 내용 |
|---|---|---|
| `_chapter.md` | `CH19 전체 설계`, `CH19 R15 경계`, `CH19 최종 정리` | Modern SQL 경계 장으로 재정의 |
| `CH19-L01.md` | `CH19-L01 · Classic Open SQL과 Modern ABAP SQL 비교` | classic vs modern, 콤마, `@`, `@DATA`, 시스템 필드 확인 |
| `CH19-L02.md` | `CH19-L02 · @ Host Variable과 Host Expression` | host variable, host expression, DB 컬럼과 ABAP 값 경계 |
| `CH19-L03.md` | `CH19-L03 · INTO TABLE @DATA( ) Inline Target` | inline target, 기존 target, 단건 target, alias 주의 |
| `CH19-L04.md` | `CH19-L04 · SQL Expression: CASE, CAST, COALESCE` | DB 계산 위치, `CASE`, `CAST`, `COALESCE`, null/initial 구분 |
| `CH19-L05.md` | `CH19-L05 · SQL String / Date Function` | 문자열 함수, 날짜 함수, ABAP 함수와 실행 위치 구분 |
| `CH19-L06.md` | `CH19-L06 · SELECT FROM @itab 기초` | internal table source, alias, engine/DB 임시 전송 주의 |
| `CH19-L07.md` | `CH19-L07 · ABAP SQL 정리: 다음 단계로` | 선택 기준, 경계 퀴즈, CH20/CH22 예고만 허용 |
| `CH19-L08.md` | `CH19-L08 · 실습: 콘서트앱 모던 SQL` | 콘서트 예매 조회 modern SQL, outer join 조건 위치, 업무 검증 |

판정: 원본 8개 레슨이 모두 별도 절로 반영되었다.

## 3. 공식 문서 수동 확인

자동 키워드 매칭 대신 `C:\ABAP_DOCU_HTML`에서 다음 파일 존재를 수동 확인했다.

| 주제 | 확인 문서 | QA 판단 |
|---|---|---|
| ABAP SQL 개요 | `abenabap_sql.htm` | ABAP SQL을 DB 접근 계층으로 설명 |
| host variable | `abenabap_sql_host_variables.htm` | `@dobj`, strict mode, read/write host position 반영 |
| host expression | `abenabap_sql_host_expressions.htm` | `@( ... )`와 operand 타입 변환 주의 반영 |
| strict mode | `abenabap_sql_strict_modes.htm` | modern syntax의 엄격한 검사 관점 반영 |
| SELECT list | `abapselect_list.htm` | 콤마 필드 목록과 alias 필요성 반영 |
| SELECT target | `abapselect.htm`, `abapselect_additions.htm`, `abapselect_into_target.htm` | `INTO` 위치, `sy-subrc`, `sy-dbcnt`, inline target 반영 |
| SQL expression | `abapsql_expr.htm` | DB 계산 위치와 alias 주의 반영 |
| CASE | `abensql_case.htm`, `abensql_simple_case.htm`, `abensql_searched_case.htm` | searched CASE 중심으로 입문자 예제 작성 |
| CAST | `abensql_cast.htm`, `abensql_cast_rules.htm` | `CHAR( 5 )`처럼 길이를 명시한 예제로 보강 |
| COALESCE | `abensql_coalesce.htm` | DB null 대체, ABAP initial과 구분 |
| 문자열 SQL 함수 | `abensql_functions_string.htm`, `abensql_string_func.htm` | `CONCAT`, `SUBSTRING`, `UPPER`, `LOWER`, `LENGTH` 반영 |
| 날짜 SQL 함수 | `abenabap_sql_date_time_functions.htm`, `abensql_date_func.htm` | `DATS_ADD_DAYS`, `DATS_DAYS_BETWEEN` 반영 |
| `SELECT FROM @itab` | `abapselect_itab.htm`, `abenabap_sql_engine.htm`, `abensql_engine_restr.htm` | internal table source와 engine/DB 임시 전송 제약 반영 |

수동 확인 결과: 위 문서 22개는 모두 `C:\ABAP_DOCU_HTML`에 존재했다.

## 4. R15 게이팅 및 classic-first 경계

### CH19에서 허용한 것

| 항목 | 이유 |
|---|---|
| `@` host variable | CH19 L3 정식 도입 |
| `@( )` host expression | CH19 L3 정식 도입 |
| 콤마 SELECT list | CH19 L3 정식 도입 |
| `INTO TABLE @DATA( )`, `INTO @DATA( )` | CH18 inline declaration 이후 CH19 SQL target으로 정식 사용 |
| SQL `CASE`, `CAST`, `COALESCE` | CH19 SQL expression 범위 |
| SQL string/date function | CH19 SQL function 범위 |
| `SELECT FROM @itab` | CH19 원본 L06 범위 |
| CH18 string template | CH18에서 이미 정식 도입되었으므로 실습 출력에 사용 가능 |

### CH19에서 보류한 것

| 보류 항목 | 처리 |
|---|---|
| OO class 설계 | CH20 예고만 하고 코드 작성 없음 |
| 예외 클래스와 본격 예외 처리 | CH20 이후 범위로 보류 |
| CDS View Entity 코드 | CH22 예고만 하고 DDL 코드 없음 |
| 데이터 변경과 트랜잭션 제어 | CH24 이후 Track-2 범위로 보류 |
| Lock Object | CH25 이후 범위로 보류 |
| Native SQL/ADBC | CH33 이후 또는 Track-2 심화로 보류 |
| 고급 SQL 조합과 window expression | CH19 입문 범위 밖으로 보류 |
| RAP/ABAP Cloud | CH23 이후 범위로 보류 |

판정: R6/R15 경계를 지켰다. CH19에서 열리는 modern SQL은 정식 사용했고, 다음 장 이후 개념은 코드로 앞당기지 않았다.

## 5. 입문자 강의 흐름 점검

각 레슨은 다음 흐름을 갖도록 재작성했다.

| 흐름 | 반영 |
|---|---|
| 왜 필요한가 | classic SQL의 모호함, ABAP 값과 DB 컬럼 경계, target 선언 거리, DB 계산 필요성 등 불편에서 시작 |
| 무엇인가 | 문법 정의를 표·코드·용어 구분으로 설명 |
| 어떻게 확인하는가 | 디버거, 결과 행 수, `sy-subrc`, `sy-dbcnt`, null 케이스, 업무 기대 결과로 확인 |
| 실수/주의 | `@` 위치, 콤마 혼용, alias 누락, SQL 과적, `SELECT FROM @itab` 남용 등 구체화 |
| 정리 | 레슨별 핵심 문장을 별도로 정리 |

판정: 단순 문법 요약이 아니라 입문자가 실행 후 무엇을 봐야 하는지까지 포함했다.

## 6. 체험형 학습 설계 점검

| 레슨 | 학습 장치 | 데이터 | 버튼/상태/피드백 |
|---|---|---|---|
| L01 | Classic-to-Modern SQL Converter | `sflight`, `lv_carr` | classic 실행, 콤마 적용, `@` 적용, INTO 이동, 결과 비교. `sqlMode`, `syntaxWarnings`, `systemFields` |
| L02 | Host Boundary Inspector | DB 컬럼 카드, ABAP 값 카드 | DB 컬럼 넣기, ABAP 변수 넣기, 식으로 넣기, `@` 제거. `operandSource`, `escapeStatus`, `conversionStatus` |
| L03 | SELECT Target Type Viewer | SELECT list 옵션, target 옵션 | `*`, 필드 선택, 계산 컬럼, alias 제거, target 비교. `targetKind`, `rowShape`, `aliasStatus` |
| L04 | SQL Expression Lab | `sflight`, outer join 샘플 | CASE, CAST, COALESCE, ABAP LOOP 비교. `expressionKind`, `nullRows`, `aliasStatus` |
| L05 | SQL Function Workbench | `spfli`, `sflight`, 날짜 입력 | CONCAT, SUBSTRING, UPPER/LOWER, DATS_ADD_DAYS, ABAP 비교. `argumentStatus`, `resultColumn` |
| L06 | Internal Table SQL Console | `lt_flight`, `lv_carr` | 원본 보기, WHERE, ORDER BY, GROUP BY, LOOP 비교, 엔진 경고. `enginePath`, `warningVisible` |
| L07 | SQL Decision Cards | 상황 카드, 도구 카드 | 상황 뽑기, 도구 선택, 정답 확인, 경계 확인. `scopeLevel`, `feedback` |
| L08 | Concert Modern SQL Lab | `zconcert`, `zbooking`, `s_conc` | classic 조회, `@`, 콤마, `@DATA`, CASE, COALESCE, ON/WHERE 비교. `lostConcerts`, `boundaryWarnings` |

판정: 모든 코드 레슨에 데이터, 버튼, 상태, 피드백 설계가 포함되었다.

## 7. 내용상 주요 보강

| 보강 | 이유 |
|---|---|
| `@`를 "경계 표시"로 설명 | 입문자가 DB 컬럼과 ABAP 변수를 구분하도록 하기 위함 |
| `sy-subrc`, `sy-dbcnt` 반복 확인 | modern SQL에서도 SELECT 관찰 습관 유지 |
| `@DATA( )`와 명시 target의 선택 기준 | inline target 남용 방지 |
| `COALESCE`와 ABAP initial 구분 | null 처리 오해 방지 |
| 같은 SELECT list alias를 다른 expression에서 바로 쓰지 않는 주의 | 콘서트 실습의 `booked`/`seat_status` 오류 방지 |
| `LEFT OUTER JOIN` 조건의 `ON`/`WHERE` 차이 | 예매 없는 공연이 사라지는 업무 오류 방지 |
| `SELECT FROM @itab` engine/DB 임시 전송 주의 | "메모리 SQL은 항상 가볍다"는 오해 방지 |

## 8. 자동 점검 예정/기준

작업 후 다음 검색으로 범위 이탈을 점검한다.

| 점검 | 기대 |
|---|---|
| OO·예외 처리 선언 패턴 | CH20 조기 코드 없음 |
| CDS/RAP 선언 패턴 | CH22/CH23 조기 코드 없음 |
| 데이터 변경·트랜잭션 제어 패턴 | CH24+ 조기 코드 없음 |
| 고급 SQL 조합 패턴 | CH19 입문 범위 밖의 고급 SQL 조기 도입 없음 |
| v1 반복형 안내 문구 | v1 템플릿 반복 흔적 없음 |
| `git diff --check` | Markdown whitespace 문제 없음 |

## 9. 남은 위험

| 위험 | 대응 |
|---|---|
| SQL 함수 릴리스 차이 | 공식 문서 758 기준으로 작성했으며, 실제 시스템 syntax check 필요성을 본문에 명시 |
| `SELECT FROM @itab` 성능 오해 | engine/DB 임시 전송 가능성과 대량 데이터 남용 금지를 본문에 포함 |
| `@DATA( )` 남용 | 명시 table type과 key 설계가 더 나은 경우를 L03/L07에 포함 |
| 콘서트 예제의 DDIC 타입 차이 | 실습 설계에서 업무 기대 결과와 null/취소 케이스 검증을 강조 |
| SQL expression 과적 | 복잡한 업무 규칙은 ABAP/후속 구조화로 넘긴다는 기준을 반복 |

## 10. 최종 판정

CH19 v3 산출물은 다음 조건을 충족한다.

- `content/abap/CH19`의 8개 레슨을 모두 반영했다.
- v2는 보조 기준으로만 사용했고, v3 본문은 CH19 교육 흐름에 맞춰 다시 구성했다.
- 입문자 기준으로 왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리 흐름을 레슨별로 작성했다.
- 코드가 있는 레슨마다 체험/시뮬레이터/버튼/상태/데이터/피드백 설계를 구체화했다.
- 공식 ABAP Keyword Documentation 파일을 `C:\ABAP_DOCU_HTML`에서 수동 확인했다.
- R15 게이팅과 classic-first 이후 modern SQL 경계를 지켰다.

판정: **통과**.
