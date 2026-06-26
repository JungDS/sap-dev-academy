# CH13_QA - codex_0625_v2 재작업 검수

> 대상 파일: `reference/codex_0625_v2/CH13_REWRITE.md`
> 판정: CH13 v2 기준 원고는 재작업 준비 산출물로 통과 대상. 실제 `content/abap/CH13` 반영과 신규 embed 구현은 아직 수행하지 않았다.

## 1. 재작업 판정 반영

`reference/codex_0625/00_QUALITY_REVIEW.md`는 v1 산출물이 완성 강의자료가 아니라 반복 템플릿형 보강안에 가깝다고 판정했다. CH13 v1도 각 레슨에 거의 같은 "도입", "실무 감각", "필요 학습수단" 문구가 반복되었고, JOIN과 집계 레슨에 분기문이나 반복문 계열 공식문서 힌트가 섞였다.

v2에서는 다음 방식으로 처리했다.

| 항목 | v1 문제 | v2 처리 |
| --- | --- | --- |
| 템플릿 반복 | 레슨마다 같은 보강 지시문 반복 | CH13 8개 레슨을 각각 새 강의 원고로 직접 작성 |
| 본문 밀도 | JOIN, 집계, HAVING, FAE가 짧은 설명으로 끝남 | 왜 필요한가, 무엇인가, 확인 방법, 체험 설계, 실수와 주의, 정리 흐름으로 확장 |
| 코드 체험 | 코드가 있으나 조작형 확인 설계 부족 | JOIN 보드, LEFT 보존 스위치, 행 묶기 실험실, WHERE/HAVING 파이프라인, FAE 안전장치 시뮬레이터 등 설계 |
| 공식 문서 | 자동 키워드 매칭으로 무관한 제어문 문서 혼입 | `C:\ABAP_DOCU_HTML`에서 CH13 관련 Open SQL 문서만 수동 선별 |
| R15 경계 | modern Open SQL과 SQL expression을 앞당길 위험 | CH19/CH20 경계를 명시하고 CH13은 classic read-only SQL로 제한 |
| classic-first | host marker, inline declaration, comma field list 혼입 위험 | 예제는 CH17 이전 classic-safe 구문으로 작성 |

## 2. 소스 커버리지

현재 authoritative scope는 `content/abap/CH13`의 8개 레슨과 기존 embed 1개다.

| 원본 | v2 반영 위치 | 확인 |
| --- | --- | --- |
| `CH13/_chapter.md` | "CH13 전체 설계", "CH13 마무리 학습 흐름" | 반영 |
| `CH13-L01.md` | `## CH13-L01 - INNER JOIN 기본 개념과 구현` | 반영 |
| `CH13-L02.md` | `## CH13-L02 - LEFT OUTER JOIN 기본 개념과 NULL 처리` | 반영 |
| `CH13-L03.md` | `## CH13-L03 - GROUP BY와 Aggregate` | 반영 |
| `CH13-L04.md` | `## CH13-L04 - HAVING과 집계 조건` | 반영 |
| `CH13-L05.md` | `## CH13-L05 - ORDER BY 정렬 조회` | 반영 |
| `CH13-L06.md` | `## CH13-L06 - FOR ALL ENTRIES 사용 기준` | 반영 |
| `CH13-L07.md` | `## CH13-L07 - JOIN / FAE / ABAP 처리 선택 기준` | 반영 |
| `CH13-L08.md` | `## CH13-L08 - 실습: 공연별 예매현황 리포트` | 반영 |
| `embeds/abap/CH13-L08-S01.html` | L08 체험 설계 | 반영 |

## 3. 공식 문서 수동 근거

CH13_REWRITE에는 아래 문서만 수동 근거로 남겼다.

| 문서 | 사용 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abapselect.htm` | `SELECT`, `sy-subrc`, `sy-dbcnt`, 빈 결과와 행 수 확인 |
| `C:\ABAP_DOCU_HTML\abapselect_join.htm` | INNER JOIN, LEFT OUTER JOIN, `ON`, `AS`, `~`, outer join null, cross product 주의 |
| `C:\ABAP_DOCU_HTML\abapfrom_clause.htm` | `FROM`의 data source, join expression, alias 사용 |
| `C:\ABAP_DOCU_HTML\abapselect_aggregate.htm` | aggregate expression, `COUNT`, `SUM`, `MIN`, `MAX`, `AVG`, HAVING 내 집계 사용 |
| `C:\ABAP_DOCU_HTML\abapgroupby_clause.htm` | `GROUP BY` 그룹 결합, 비집계 컬럼 규칙, DB 쪽 집계 장점 |
| `C:\ABAP_DOCU_HTML\abaphaving_clause.htm` | `HAVING`이 그룹 결과를 제한하는 조건이라는 근거 |
| `C:\ABAP_DOCU_HTML\abaporderby_clause.htm` | `ORDER BY`, `ASCENDING`, `DESCENDING`, 미지정 순서 불확정, 정렬 성능 주의 |
| `C:\ABAP_DOCU_HTML\abenwhere_all_entries.htm` | `FOR ALL ENTRIES`, 빈 내부 테이블 시 WHERE 무시, 중복 제거, GROUP BY와 ORDER BY 제한 |
| `C:\ABAP_DOCU_HTML\abapselect_clause.htm` | `DISTINCT`가 중복 행을 제거한다는 근거 |
| `C:\ABAP_DOCU_HTML\abapinto_clause.htm` | `INTO TABLE`, `INTO CORRESPONDING FIELDS OF TABLE` 결과 매핑 |
| `C:\ABAP_DOCU_HTML\abenabap_sql_null_values.htm` | null은 ABAP 초기값과 다르며 SELECT 전달 시 초기값으로 변환될 수 있음 |
| `C:\ABAP_DOCU_HTML\abenwhere_logexp_null.htm` | `IS NULL`, `IS NOT NULL` 조건의 의미 |
| `C:\ABAP_DOCU_HTML\abenabap_sql_lists_obsolete.htm` | blank-separated classic SQL list와 comma-separated modern list 경계 |
| `C:\ABAP_DOCU_HTML\abenabap_sql_host_variables.htm` | host variable escape marker를 CH19 modern SQL로 미루는 경계 |

## 4. R2 체험 장치 점검

| 레슨 | 코드 있음 | 체험 설계 | 판정 |
| --- | --- | --- | --- |
| L01 | 있음 | JOIN 짝 맞추기 보드, 복합 키 뻥튀기 실험 | 통과 |
| L02 | 있음 | LEFT 보존 스위치, INNER/LEFT 비교, 오른쪽 조건 위치 실험 | 통과 |
| L03 | 있음 | 행 묶기 실험실, GROUP BY와 DISTINCT 비교 | 통과 |
| L04 | 있음 | WHERE와 HAVING 2단 필터 파이프라인 | 통과 |
| L05 | 있음 | 정렬 우선순위 조작기, 정렬 없음/다중 기준 비교 | 통과 |
| L06 | 있음 | FAE 안전장치 시뮬레이터, 빈 목록과 중복 기준 실험 | 통과 |
| L07 | ABAP 코드 블록 없음 | 조회 전략 의사결정 카드 | 통과 |
| L08 | 있음 | 기존 `CH13-L08-S01.html` 위젯 중심, LEFT/INNER/GROUP BY 결과 비교 | 통과 |

R2 관점에서 중요한 개선은 모든 코드 예제가 단순 문법 표시로 끝나지 않고, 조작 버튼, 데이터 상태, 결과 행 수, 오답 피드백과 연결되었다는 점이다.

## 5. Classic-first 및 R15 범위 검사

수동 점검 기준:

- 코드 예제에는 inline declaration을 넣지 않았다.
- 코드 예제에는 constructor expression이나 object creation expression을 넣지 않았다.
- modern Open SQL host marker와 comma field list를 넣지 않았다.
- string template을 넣지 않았다.
- CH13 SQL은 classic read-only SELECT로 유지했다.
- `GROUPING SETS`, CTE, window function, SQL expression, CDS, view entity는 정식 도입하지 않았다.
- null 보정용 SQL expression 계열은 CH19 이후로 경계 처리했다.
- L08의 `REF TO`, SALV 호출, `TRY/CATCH`는 CH11 재사용 및 CH20 전 선행 사용으로 명시했다.
- FAE의 빈 내부 테이블 위험, 중복 제거, GROUP BY와 ORDER BY 제한을 공식문서 근거로 반영했다.

최종 파일 작성 후 아래 자동 검색을 실행했다.

```text
rg -n "도입 불편|단순히 실행되는 예제|필요 학습수단|공식 문서 체크 힌트|abapparameters\.htm|abapif\.htm|abapcase\.htm|abapdo\.htm|abapwhile\.htm" reference\codex_0625_v2\CH13_REWRITE.md

rg -n "DATA\(|@DATA|@\w|VALUE #|NEW |\+=|FINAL\(" reference\codex_0625_v2\CH13_REWRITE.md

rg -n "\|[^\n`]*\{[^\n`]*\}|\{[^\n`]*\}[^\n`]*\|" reference\codex_0625_v2\CH13_REWRITE.md

rg -n "\b(INSERT|UPDATE|MODIFY|COMMIT|ROLLBACK|CREATE OBJECT)\b" reference\codex_0625_v2\CH13_REWRITE.md

rg -n "[ \t]+$" reference\codex_0625_v2\CH13_REWRITE.md reference\codex_0625_v2\CH13_QA.md

rg -n "^## CH13-L|C:\\ABAP_DOCU_HTML|^### 왜 필요한가|^### 무엇인가|^### 어떻게 확인하는가|^### 체험 설계|^### 실수와 주의|^### 정리" reference\codex_0625_v2\CH13_REWRITE.md
```

실행 결과:

| 검사 | 결과 |
| --- | --- |
| v1 반복 문구와 잘못된 자동 문서 힌트 | 0건 |
| modern ABAP/Open SQL 금지 패턴 | 0건 |
| markdown table 내 curly brace 오인 위험 | 0건 |
| 범위 밖 쓰기/트랜잭션 키워드 | 0건 |
| trailing whitespace | 0건 |
| CH13 레슨 heading | 8개 |
| 공식문서 근거 | `C:\ABAP_DOCU_HTML` 문서 14개 |
| 핵심 섹션 카운트 | 왜 필요한가 8개, 무엇인가 8개, 어떻게 확인하는가 8개, 체험 설계 8개, 실수와 주의 8개, 정리 8개 |
| 파일 크기 | `CH13_REWRITE.md` 54204 bytes, `CH13_QA.md` 8853 bytes |

## 6. 남은 작업

현재 산출물은 CH13을 실제 강의자료로 바꾸기 위한 v2 기준 원고다. 다음 단계에서 사용자가 진행을 승인하면 아래 중 하나를 선택해야 한다.

1. `reference/codex_0625_v2/CH13_REWRITE.md`를 기준으로 `content/abap/CH13/*.md`를 실제 교체한다.
2. L01의 "JOIN 짝 맞추기 보드" embed를 신규 구현한다.
3. L02의 "LEFT 보존 스위치" embed를 신규 구현한다.
4. L03의 "행 묶기 실험실" embed를 신규 구현한다.
5. L04의 "WHERE와 HAVING 2단 필터 파이프라인" embed를 신규 구현한다.
6. L05의 "정렬 우선순위 조작기" embed를 신규 구현한다.
7. L06의 "FAE 안전장치 시뮬레이터" embed를 신규 구현한다.
8. 기존 `CH13-L08-S01.html`을 실제 원본 lesson 문맥에 맞춰 세부 문구만 다듬는다.
9. 같은 방식으로 다음 단일 챕터를 v2로 재작성한다.

이번 턴에서는 목표 범위에 맞춰 reference 산출물만 작성했다.
