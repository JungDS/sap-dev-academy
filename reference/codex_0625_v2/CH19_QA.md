# CH19_QA · New Open SQL / Modern ABAP SQL 재작성 검수

> 대상 산출물: `reference/codex_0625_v2/CH19_REWRITE.md`  
> 기준 문서: `reference/codex_0625/00_QUALITY_REVIEW.md`  
> 작업 단위: CH19 1개 챕터

## 1. 재작업 판정 반영

`00_QUALITY_REVIEW.md`의 판정은 기존 `codex_0625`가 완성 강의자료가 아니라 챕터별 진단과 보강 지시문에 가깝다는 것이다. CH19 v2는 다음 방식으로 재작성했다.

| 품질 이슈 | v1 문제 | v2 조치 |
|---|---|---|
| 반복 템플릿 | 레슨별로 유사한 도입/체험/문서 안내 구조가 반복됨 | CH19 modern SQL의 실제 문법과 실패 모델을 기준으로 레슨별 본문을 직접 작성 |
| 입문자 설명 부족 | `@`, `@DATA`, SQL expression을 짧은 정의 중심으로만 설명 | 각 레슨을 `왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리` 흐름으로 확장 |
| 체험 설계 추상성 | 시뮬레이터 유형만 제안하고 데이터/상태/피드백이 약함 | 모든 레슨에 버튼, 상태, 데이터, 피드백을 구현 설계 수준으로 작성 |
| 공식 문서 자동 힌트 | generic SELECT/IF/CASE 문서가 섞일 위험 | `C:\ABAP_DOCU_HTML`에서 CH19 SQL 문법별 파일을 수동 확인 |
| R15 위험 | SQL 첫 modern 장에서 OO/CDS/고급 SQL까지 앞당길 수 있음 | CH19 허용 범위와 CH20/CH22 이후 경계를 명시 |

판정: v2는 v1의 보강 지시문을 반복하지 않고, CH19 전용 완성 강의자료로 재작성했다.

## 2. 소스 커버리지

| 원본 | v2 반영 위치 | 비고 |
|---|---|---|
| `content/abap/CH19/_chapter.md` | `CH19의 역할`, `R15 경계`, `CH19 마무리 정리` | New Open SQL 경계 장으로 재정의 |
| `CH19-L01.md` | `CH19-L01 · Classic Open SQL과 Modern ABAP SQL 비교` | classic vs modern, 콤마, `@`, strict, 시스템 필드 |
| `CH19-L02.md` | `CH19-L02 · @ Host Variable과 Host Expression` | host variable/expression, 타입 변환, DB 컬럼과 ABAP 값 경계 |
| `CH19-L03.md` | `CH19-L03 · INTO TABLE @DATA( ) Inline Target` | inline target 타입 생성, empty key, alias 필요성 |
| `CH19-L04.md` | `CH19-L04 · SQL Expression: CASE, CAST, COALESCE` | DB 계산 위치, alias 제한, null/initial 구분 |
| `CH19-L05.md` | `CH19-L05 · SQL String / Date Function` | 문자열 함수, 날짜 함수, ABAP 함수와의 차이 |
| `CH19-L06.md` | `CH19-L06 · SELECT FROM @itab 기초` | internal table data source, SQL engine/DB 임시 전송 주의 |
| `CH19-L07.md` | `CH19-L07 · ABAP SQL 정리: 다음 단계로` | 의사결정표, CH20/CH22 연결, 경계 퀴즈 |
| `CH19-L08.md` | `CH19-L08 · 실습: 콘서트앱 모던 SQL` | 콘서트 예매 집계 modern SQL, outer join 조건 위치, 업무 검증 |

누락된 레슨 없음. CH19 원본 8개 레슨을 모두 별도 절로 반영했다.

## 3. 공식 문서 수동 확인 반영

자동 매칭 대신 `C:\ABAP_DOCU_HTML`에서 다음 문서를 수동 확인했다.

| 주제 | 확인 문서 | 반영 내용 |
|---|---|---|
| ABAP SQL 개요 | `abenabap_sql.htm` | ABAP SQL은 DB 접근 ABAP 문장 집합이며 DB별 SQL로 변환됨 |
| host variable | `abenabap_sql_host_variables.htm` | ABAP data object를 SQL operand position에 넣을 때 `@` escape 사용, strict mode 작동 |
| host expression | `abenabap_sql_host_expressions.htm` | `@( expr )` 결과는 SQL operand 타입으로 lossless 변환 가능해야 함 |
| strict mode | `abenabap_sql_strict_modes.htm` | 콤마 리스트와 `@`는 release-dependent strict mode 규칙과 연결됨 |
| SELECT list | `abapselect_list.htm` | 개별 컬럼 공백 구분은 obsolete, strict mode에서 콤마 필요, alias 규칙 |
| SELECT target | `abapselect.htm`, `abapselect_additions.htm`, `abapselect_into_target.htm` | `INTO` final clause, `sy-subrc`/`sy-dbcnt`, `@DATA` target 타입 생성 규칙 |
| SQL expression | `abapsql_expr.htm` | SQL expression은 DB에서 실행, alias를 같은 SELECT list expression operand로 사용 불가 |
| CASE | `abensql_case.htm`, `abensql_simple_case.htm`, `abensql_searched_case.htm` | simple/searched case, 결과 타입 호환성 |
| CAST | `abensql_cast.htm`, `abensql_cast_rules.htm` | `CAST( sql_exp AS dtype )`, `CHAR( len )` 등 DDIC built-in type 변환 |
| COALESCE | `abensql_coalesce.htm` | 첫 번째 non-null 값 반환, null과 ABAP initial 구분 |
| 문자열 SQL 함수 | `abensql_functions_string.htm`, `abensql_string_func.htm` | `CONCAT`, `SUBSTRING`, `UPPER`, `LOWER`, `LENGTH` 및 substring 위치/길이 주의 |
| 날짜 SQL 함수 | `abenabap_sql_date_time_functions.htm`, `abensql_date_func.htm` | `DATS_ADD_DAYS( date, days )`, `DATS_DAYS_BETWEEN`, DATS 유효성 |
| `SELECT FROM @itab` | `abapselect_itab.htm`, `abenabap_sql_engine.htm`, `abensql_engine_restr.htm` | internal table을 data source로 사용, engine 처리 가능 여부와 DB 임시 전송 제약 |

공식 문서 기반으로 본문에 반영한 주요 교정:

- `DATS_ADD_DAYS` 예시는 현재 확인한 ABAP SQL 문서 기준으로 두 인자 형태를 사용했다.
- `INTO`를 SELECT 문장의 마지막 clause 위치로 두는 흐름을 강조했다.
- `@DATA( )` inline target이 standard table with empty key를 만든다는 제한을 명시했다.
- SQL expression alias를 같은 SELECT list의 다른 expression에서 바로 쓰지 않는 규칙을 콘서트 예제에 반영했다.
- `COALESCE`를 ABAP initial 대체가 아니라 DB null 대체로 설명했다.
- `SELECT FROM @itab`은 항상 AS ABAP 메모리에서만 처리된다는 식으로 단순화하지 않고, ABAP SQL engine과 DB 임시 전송 가능성을 분리했다.

## 4. R15 및 classic-first 경계

CH19는 New Open SQL이 열리는 장이므로 다음 문법은 정식 사용했다.

- `@` host variable
- `@( )` host expression
- 콤마 기반 SELECT list
- `INTO TABLE @DATA( )`, `INTO @DATA( )`
- SQL expression: 산술, `CASE`, `CAST`, `COALESCE`
- SQL string/date function
- `SELECT FROM @itab`

동시에 다음은 본문에서 보류했다.

| 보류 항목 | 처리 |
|---|---|
| OO ABAP 코드 | CH20 예고만 하고 클래스 정의/상속/예외 코드는 쓰지 않음 |
| CDS DDL | CH22 예고만 하고 view entity 코드는 쓰지 않음 |
| 고급 SQL | UNION/CTE/window/subquery 심화는 다루지 않음 |
| Native SQL/ADBC | CH19 scope 밖으로 둠 |
| dynamic SQL/`INTO NEW` target | 공식 문서에는 있으나 CH19 입문 본문에서는 보류 |
| SQL engine 최적화 심화 | `SELECT FROM @itab`의 주의로 설명하되 튜닝 장으로 확장하지 않음 |

판정: CH19에서 열리는 modern SQL 경계는 적극적으로 사용했고, CH20/CH22 이후 개념은 코드로 앞당기지 않았다.

## 5. 체험형 학습 설계 점검

| 레슨 | 설계한 학습 장치 | 데이터 | 버튼/상태/피드백 구체성 |
|---|---|---|---|
| L01 | Classic-to-Modern SQL Converter | `sflight`, `lv_carr` | classic 실행, 콤마 적용, `@` 적용, INTO 이동, 결과 비교. `sqlMode`, `systemFields`, syntax warning 상태 |
| L02 | Host Boundary Inspector | DB 컬럼 카드, ABAP 값 카드 | ABAP 값 넣기, DB 컬럼 넣기, 식으로 넣기, `@` 제거, 타입 검사. escape/conversion 상태 |
| L03 | SELECT Target Type Viewer | SELECT list 옵션, target 옵션 | 필드 조회, `*`, 계산 컬럼, 별칭, 타입 보기. resultShape/tableKey/aliasStatus 상태 |
| L04 | SQL Expression Lab | `sflight`, `scarr`/`spfli` outer join | CASE, CAST, COALESCE, ABAP LOOP 비교, alias 제거. null/type/alias 피드백 |
| L05 | SQL Function Workbench | `spfli`, `sflight`, 날짜 입력 | CONCAT, SUBSTRING, UPPER/LOWER, DATS_ADD_DAYS, DATS_DAYS_BETWEEN, ABAP 함수 비교 |
| L06 | Internal Table SQL Console | `lt_flight`, `lv_carr` | 원본 보기, WHERE, ORDER BY, GROUP BY, LOOP 비교, 엔진 경고. enginePath/warning 상태 |
| L07 | SQL Decision Cards | 상황 카드, 도구 카드 | 상황 뽑기, 도구 선택, 정답 확인, 경계 확인, 대안 보기. scopeLevel 피드백 |
| L08 | Concert Modern SQL Lab | `zconcert`, `zbooking`, `s_conc` | classic 조회, `@`, 콤마, `@DATA`, CASE, COALESCE, ON/WHERE 비교. lostConcerts/boundaryWarnings 상태 |

판정: 구현자가 바로 위젯/시뮬레이터로 옮길 수 있도록 데이터, 버튼, 상태, 피드백을 레슨마다 구체화했다.

## 6. 남은 위험과 보완 권장

| 위험 | 상태 | 보완 |
|---|---|---|
| 실제 시스템 release 차이 | ABAP_DOCU 758 기준으로 작성 | 수강 시스템에서 SQL 함수 지원 release 확인 필요 |
| SQL expression을 과도하게 쓰려는 유혹 | 본문에 "복잡한 업무 규칙은 SQL에 과적하지 않는다"는 기준 명시 | 후속 실제 content 반영 시 SQL/ABAP 처리 위치 퀴즈 추가 권장 |
| `SELECT FROM @itab` 성능 오해 | engine/DB 임시 전송 제약을 설명 | 실제 실습에서는 작은 데이터셋으로 시작하고 warning을 숨기지 않게 설계 |
| 콘서트 예제의 custom table 타입 | `zconcert`, `zbooking` 로컬 프로젝트 관통 예제 기준 | 실제 DDIC 필드 길이/타입에 맞춰 `COALESCE` literal 길이와 SUM 타입 점검 |
| inline target의 empty key | 본문에 제한 명시 | key 기반 후속 조회 실습에서는 명시 타입 선언 버전을 병행 제시 |

## 7. 자동 점검 기록

작업 후 다음 점검을 수행했다.

| 점검 | 결과 |
|---|---|
| v1 반복 템플릿 흔적 검색 | v1의 반복형 도입/예제/문서힌트 문구와 부정확한 자동 문서 힌트 파일명 모두 매치 없음 |
| CH20/CH22 조기 코드 검색 | class 정의, object 생성, 예외 처리 본격 코드, CDS/RAP 코드 패턴 매치 없음 |
| 날짜 함수 오류 패턴 검색 | `DATS_ADD_DAYS` 3인자 형태 매치 없음 |
| 레슨 헤딩 검색 | `CH19-L01` ~ `CH19-L08` 총 8개 확인 |
| Markdown whitespace 검사 | `git diff --check` 통과 |
| ABAP_DOCU 파일 존재 확인 | QA에 기재한 공식 문서 파일 모두 `C:\ABAP_DOCU_HTML`에서 존재 확인 |

## 8. 최종 판정

CH19 v2는 `00_QUALITY_REVIEW.md`의 재작업 필요 판정을 반영해 작성되었다.

- 기존 v1의 반복 지시문 구조를 재사용하지 않았다.
- CH19 원본 8개 레슨을 모두 완성 강의자료 흐름으로 재서술했다.
- 각 레슨에 실행 확인 지점과 실패/주의 케이스를 포함했다.
- 공식 ABAP Keyword Documentation을 수동 확인한 문법 근거를 반영했다.
- CH19에서 허용되는 modern SQL과 CH20/CH22 이후 경계를 분리했다.
- 체험형 학습 장치를 버튼/상태/데이터/피드백 수준으로 구체화했다.
- 자동 검색과 whitespace 검증을 통과했다.

판정: **통과**.
