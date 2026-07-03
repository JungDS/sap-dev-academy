# NEWCH20_OLDCH99_QA · Advanced ABAP SQL 검수

> 대상 산출물: `reference/codex_0629_v3/NEWCH20_OLDCH99_REWRITE.md`  
> 작업 단위: 신규 CH20 1개 챕터  
> 기준: `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md` P1 판정, `content/abap/CH19`, `.project-docs/04_CONVENTIONS.md` R6/R15

## 1. 작업 범위 확인

| 항목 | 확인 |
|---|---|
| 챕터 | NEWCH20_OLDCH99 · Advanced ABAP SQL |
| 성격 | 신규 장 |
| 삽입 위치 | NEWCH19_OLDCH19 이후, NEWCH21_OLDCH20 이전 |
| 산출 파일 | `NEWCH20_OLDCH99_REWRITE.md`, `NEWCH20_OLDCH99_QA.md` |
| 주 근거 | CH19에서 보류된 CTE, window expression, set operation, complex subquery 회수 |
| 품질 목표 | IT 비전공 입문자가 고급 SELECT 결과 행을 읽고 검증할 수 있는 완성 강의자료 |

판정: CH19에서 "입문 범위 밖"으로 보류했으나 후속 SQL 전용 장이 없던 P1 공백을 신규 장으로 회수했다.

## 2. P1 감사 항목 회수

| P1 항목 | 반영 위치 | 반영 내용 |
|---|---|---|
| CTE/WITH | `NEWCH20-L02` | `WITH`, `+booked`, CTE를 main query의 data source로 사용하는 흐름 |
| Subquery/EXISTS | `NEWCH20-L03` | correlated subquery, `EXISTS`, `IN ( SELECT ... )`, JOIN과 행 수 차이 |
| Set operation | `NEWCH20-L04` | `UNION`, `UNION ALL`, `INTERSECT DISTINCT`, `EXCEPT DISTINCT`, 좌우 집합 검증 |
| Window expression | `NEWCH20-L05` | `SUM( ) OVER`, `ROW_NUMBER( )`, `RANK( )`, `DENSE_RANK( )`, `PARTITION BY`, `ORDER BY` |
| SQL식 성능/가독성 경계 | `NEWCH20-L06` | JOIN/CTE/subquery/window 선택 기준과 멈춤 기준 |
| 실습 | `NEWCH20-L07` | 콘서트 예매 Advanced SQL Lab, CTE/EXISTS/EXCEPT/window 통합 실습 |

판정: `00_CONCEPT_GAP_AUDIT.md`의 P1 최소 레슨 요구사항을 모두 충족한다.

## 3. 공식 문서 수동 확인

자동 키워드 매칭 대신 `C:\ABAP_DOCU_HTML`에서 다음 파일 존재와 주제를 수동 확인했다.

| 주제 | 확인 문서 | QA 판단 |
|---|---|---|
| WITH statement | `abapwith.htm` | CTE를 포함하는 WITH statement의 공식 위치 확인 |
| WITH subquery clauses | `abapwith_subquery.htm` | CTE result set을 후속 subquery/main query에서 temporary table처럼 사용하는 설명 반영 |
| Subquery clauses | `abenwhere_logexp_subquery.htm` | subquery가 WHERE 조건의 relational expression에 들어가는 구조 반영 |
| EXISTS | `abenwhere_logexp_exists.htm` | 존재 여부 판단 중심으로 `EXISTS` 설명 |
| IN subquery | `abenwhere_logexp_operand_in.htm` | 목록 포함 여부를 묻는 subquery로 설명 |
| Set operators | `abapunion.htm`, `abapunion_clause.htm` | `UNION`, `INTERSECT`, `EXCEPT`, `ORDER BY`/`INTO` 위치, multirow 결과 제약 반영 |
| Window expression | `abapselect_over.htm` | `win_func OVER( ... )`, `PARTITION BY`, `ORDER BY`, frame, SELECT list 위치 반영 |
| Window function | `abensql_win_func.htm` | aggregate/ranking/value window function 분류와 `ROW_NUMBER`, `RANK`, `DENSE_RANK` 반영 |
| DB feature check | `abencl_abap_dbfeatures.htm` | DB 지원 차이와 실제 syntax check 필요성 반영 |

수동 확인 중 `abapwindow.htm`은 SQL window expression이 아니라 Classic List의 `WINDOW` 문서임을 확인했다. 따라서 공식 근거 목록에서 제외했고, 본문에 오인 방지 문장으로만 남겼다.

## 4. R15 게이팅 및 classic-first 경계

### NEWCH20에서 허용한 것

| 항목 | 이유 |
|---|---|
| `WITH`, CTE `+booked` | CH19에서 보류된 Advanced ABAP SQL P1 항목 |
| `EXISTS`, `IN ( SELECT ... )` | CH19 이후 subquery 조건을 정식 회수 |
| `UNION`, `INTERSECT`, `EXCEPT` | SQL 전용 신규 장에서 set operation 회수 |
| `SUM( ) OVER`, `ROW_NUMBER( )`, `RANK( )`, `DENSE_RANK( )` | window expression 공식 문서 확인 후 회수 |
| `COALESCE`, `CASE` 계열 SQL expression 감각 | CH19에서 이미 정식 도입 |
| `@DATA( )`, host variable `@` | CH19에서 이미 정식 도입 |

### NEWCH20에서 보류한 것

| 보류 항목 | 처리 |
|---|---|
| CDS DDL, association, path expression | CH22 이후 범위로 보류 |
| RAP EML, `MODIFY ENTITIES`, `COMMIT ENTITIES` | CH23/CH24/CH36 보강 범위로 보류 |
| Native SQL, ADBC | CH33 이후 범위로 보류 |
| Dynamic SQL, RTTS/RTTI | NEWCH28_OLDCH99 Dynamic ABAP 신규 장 범위로 보류 |
| ST05, SQL Monitor, PlanViz 심화 | 성능 장 또는 실무 심화 범위로 보류 |
| OO class 구현 | 다음 장 NEWCH21_OLDCH20에서 정식 도입 |

판정: Advanced ABAP SQL은 정식 회수했지만, 후속 장의 개념을 코드로 앞당기지 않았다.

## 5. 입문자 강의 흐름 점검

| 흐름 | 반영 |
|---|---|
| 왜 필요한가 | 각 레슨이 업무 질문과 CH19 이후의 실제 불편에서 시작한다. |
| 무엇인가 | 문법을 표, 코드, 읽는 순서로 분해했다. |
| 어떻게 확인하는가 | 입력표, 예상 중간표, 예상 결과표, 행 수/중복/null 검증을 포함했다. |
| 실수/주의 | 조건 누락, alias 혼동, CTE 과밀, set operation 좌우 방향, window `ORDER BY` 혼동을 다뤘다. |
| 정리 | 각 레슨별 핵심 문장을 별도 정리했다. |

판정: 단순 키워드 나열이 아니라, 비전공 입문자가 결과 행의 의미를 추적할 수 있도록 작성했다.

## 6. 체험형 학습 설계 점검

| 레슨 | 학습 장치 | 데이터 | 버튼/상태/피드백 |
|---|---|---|---|
| L02 | CTE Step Viewer | `zconcert`, `zbooking` | 예약 합계 만들기, 공연과 조인, 취소 포함/제외. `cteRows`, `joinRows`, `cancelIncluded` |
| L03 | EXISTS vs JOIN Comparator | 공연 3건, 예약 5건 | JOIN, EXISTS, 조건 제거. `outerRows`, `innerMatches`, `duplicateRows` |
| L04 | SQL Set Board | 왼쪽 집합 A, 오른쪽 집합 B | UNION, UNION ALL, INTERSECT, EXCEPT, 좌우 바꾸기. `duplicatePolicy`, `resultRows` |
| L05 | Window Partition Simulator | 예약 상세 8건 | GROUP BY, PARTITION BY, ROW_NUMBER, RANK 비교. `partitionKeys`, `windowOrder`, `rankMode` |
| L07 | Concert Advanced SQL Lab | `zconcert`, `zbooking` 통합 샘플 | CTE 잔여석, EXISTS 예약 공연, EXCEPT 미예약 공연, Window 상세, 조건 제거 실험 |

판정: 코드가 있는 레슨마다 프로세스 플로우, 체험 버튼, 상태, 데이터, 피드백 설계가 포함되었다.

## 7. 내용상 주요 보강

| 보강 | 이유 |
|---|---|
| `abapwindow.htm` 오인 배제 | Classic List `WINDOW`와 SQL window expression을 혼동하지 않기 위해 명시 |
| CTE를 "실제 table 생성"이 아닌 statement-local result로 설명 | 입문자의 영속 table 오해 방지 |
| `EXISTS`와 JOIN의 행 수 차이 설명 | JOIN 중복 행과 존재 조건을 구분하기 위함 |
| set operation의 좌우 방향과 중복 정책 설명 | `EXCEPT` 방향, `UNION ALL` 중복 유지 실수 방지 |
| window expression과 `GROUP BY` 비교표 | 상세 행 유지와 행 축약의 차이를 시각적으로 이해시키기 위함 |
| `OVER( ... ORDER BY ... )`와 최종 `ORDER BY` 구분 | window 계산 순서와 결과 표시 순서 혼동 방지 |
| DB 지원 차이 언급 | 공식 문서의 DB feature warning을 입문자 수준으로 반영 |

## 8. 자동 점검 예정/기준

작업 후 다음 검색으로 범위 이탈을 점검한다.

| 점검 | 기대 |
|---|---|
| CDS/RAP 선언 패턴 | 신규 장에 DDL/EML 조기 코드 없음 |
| 데이터 변경·트랜잭션 제어 패턴 | INSERT/UPDATE/DELETE/MODIFY/COMMIT/ROLLBACK 실습 코드 없음 |
| Native SQL/ADBC 패턴 | EXEC SQL, ADBC 클래스 코드 없음 |
| OO class 구현 패턴 | CLASS/METHOD 구현 코드 없음 |
| SQL 필수 항목 | CTE, EXISTS, set operation, window expression 모두 포함 |
| `git diff --check` | Markdown whitespace 문제 없음 |

## 9. 남은 위험

| 위험 | 대응 |
|---|---|
| 실제 고객 시스템 릴리스 차이 | 공식 문서 기준으로 작성했고, 실제 시스템 syntax check 및 DB 지원 확인 필요성을 본문에 명시 |
| Window expression 문법의 DB 지원 차이 | `CL_ABAP_DBFEATURES` 관련 공식 문서를 확인했으나, OO 상세는 다음 장 이후라 본문은 개념 수준으로 제한 |
| 콘서트 예제 DDIC 타입 차이 | 교육용 table 이름과 컬럼을 사용했으며, 실제 구현 시 DDIC 타입 조정 필요 |
| 고급 SQL 과밀 | L06에 멈춤 기준을 별도 레슨으로 두어 "SQL 한 문장 만능" 오해를 줄였다 |

## 10. 최종 판정

NEWCH20_OLDCH99 v3 산출물은 다음 조건을 충족한다.

- `00_CONCEPT_GAP_AUDIT.md`의 P1 고급 Modern SQL 공백을 신규 장으로 회수했다.
- CTE/WITH, subquery/EXISTS, UNION/INTERSECT/EXCEPT, window expression, SQL식 성능/가독성 경계, 실습을 모두 포함했다.
- 입문자 기준으로 왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리 흐름을 레슨별로 작성했다.
- 코드가 있는 레슨마다 체험/시뮬레이터/버튼/상태/데이터/피드백 설계를 구체화했다.
- 공식 ABAP Keyword Documentation 파일을 `C:\ABAP_DOCU_HTML`에서 수동 확인했다.
- R15 게이팅을 지켜 CDS/RAP/Native SQL/Dynamic SQL/OO 구현을 앞당기지 않았다.

판정: **통과**.
