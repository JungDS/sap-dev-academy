# CH12_QA - codex_0625_v2 재작업 검수

> 대상 파일: `reference/codex_0625_v2/CH12_REWRITE.md`
> 판정: CH12 v2 기준 원고는 재작업 준비 산출물로 통과. 실제 `content/abap/CH12` 반영과 신규 embed 구현은 아직 수행하지 않았다.

## 1. 재작업 판정 반영

`reference/codex_0625/00_QUALITY_REVIEW.md`는 v1 산출물이 완성 강의자료가 아니라 템플릿형 보강 지시문에 가깝다고 판정했다. CH12 v1도 레슨별 설명 대신 "도입 불편", "실무 감각", "필요 학습수단" 같은 공통 지시문이 반복되었고, 공식 문서 힌트에 자동 매칭 오류가 있었다.

v2에서는 다음 방식으로 처리했다.

| 항목 | v1 문제 | v2 처리 |
| --- | --- | --- |
| 템플릿 반복 | 레슨마다 같은 보강 지시문 반복 | CH12 7개 레슨을 각각 새 강의 원고로 직접 작성 |
| 코드 체험 | L02/L03/L06에 코드가 있으나 조작형 체험 부재 | 화면 입력, Range Table 행, SQL 결과, 시스템 필드 피드백을 레슨별로 구체화 |
| 공식 문서 | PARAMETERS, IF, CASE, JOIN 문서 등 자동 매칭 혼입 | SELECT-OPTIONS, ranges table, IN range_tab, TABLES, APPEND, SELECT 관련 문서만 수동 선별 |
| R15 경계 | Selection Screen 심화와 modern Open SQL이 앞당겨질 위험 | CH15/CH19/CH20 경계를 명시하고 CH12에는 기본 range 조건만 유지 |
| classic-first | host marker, inline declaration, constructor expression 혼입 위험 | 코드 예제는 classic-safe 구문으로 작성 |

## 2. 소스 커버리지

현재 authoritative scope는 `content/abap/CH12`의 7개 레슨이다.

| 원본 | v2 반영 위치 | 확인 |
| --- | --- | --- |
| `CH12/_chapter.md` | "CH12 전체 설계", "CH12 마무리 학습 흐름" | 반영 |
| `CH12-L01.md` | `## CH12-L01 - Range Table 구조` | 반영 |
| `CH12-L02.md` | `## CH12-L02 - SELECT-OPTIONS 기본 문법` | 반영 |
| `CH12-L03.md` | `## CH12-L03 - WHERE ... IN (classic range)` | 반영 |
| `CH12-L04.md` | `## CH12-L04 - Multiple Selection과 Include/Exclude` | 반영 |
| `CH12-L05.md` | `## CH12-L05 - EQ / BT / CP 옵션 이해` | 반영 |
| `CH12-L06.md` | `## CH12-L06 - Selection Table 직접 조작 기초` | 반영 |
| `CH12-L07.md` | `## CH12-L07 - 실습: 공연·상태로 예매 필터` | 반영 |
| `embeds/abap/CH12-L07-S01.html` | L07 체험 설계 | 반영 |

## 3. 공식 문서 수동 근거

CH12_REWRITE에는 아래 문서만 수동 근거로 남겼다.

| 문서 | 사용 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abapselect-options.htm` | SELECT-OPTIONS 기본 효과, selection table, 4컬럼, multiple selection |
| `C:\ABAP_DOCU_HTML\abapselect-options_for.htm` | `FOR`가 `LOW/HIGH` 타입과 화면 도움 기준을 정함 |
| `C:\ABAP_DOCU_HTML\abapselect-options_value.htm` | `OPTION`, `SIGN`, `EQ/BT/CP`, start value 규칙 |
| `C:\ABAP_DOCU_HTML\abapselect-options_screen.htm` | `OBLIGATORY`, `NO-EXTENSION`, `NO INTERVALS`, `MODIF ID`는 CH15로 경계 |
| `C:\ABAP_DOCU_HTML\abapselection-screen.htm` | selection screen과 PARAMETERS/SELECT-OPTIONS의 관계 |
| `C:\ABAP_DOCU_HTML\abapselection-screen_definition.htm` | standard selection screen과 selection screen 생성 |
| `C:\ABAP_DOCU_HTML\abaptypes_ranges.htm` | ranges table line type과 `TYPE RANGE OF` |
| `C:\ABAP_DOCU_HTML\abapdata_ranges.htm` | `DATA ... TYPE RANGE OF` 선언 |
| `C:\ABAP_DOCU_HTML\abapranges.htm` | `RANGES`가 obsolete header-line 방식이며 `TYPE RANGE OF`로 대체됨 |
| `C:\ABAP_DOCU_HTML\abenranges_table_glosry.htm` | ranges table glossary |
| `C:\ABAP_DOCU_HTML\abenranges_condition_glosry.htm` | ranges condition glossary |
| `C:\ABAP_DOCU_HTML\abenwhere_logexp_seltab.htm` | SQL condition `IN range_tab`, 빈 range true, CP/NP 변환 |
| `C:\ABAP_DOCU_HTML\abenwhere_logexp_like.htm` | SQL LIKE wildcard와 Range CP 변환 이해 |
| `C:\ABAP_DOCU_HTML\abenlogexp_strings.htm` | ABAP CP/NP, `*`와 `+` wildcard |
| `C:\ABAP_DOCU_HTML\abaptables.htm` | `TABLES` table work area와 사용 주의 |
| `C:\ABAP_DOCU_HTML\abapappend.htm` | `APPEND`로 Internal Table 행 추가 |
| `C:\ABAP_DOCU_HTML\abapselect.htm` | `SELECT`, `sy-subrc`, `sy-dbcnt`, 빈 결과 |
| `C:\ABAP_DOCU_HTML\abapstart-of-selection.htm` | selection screen 이후 standard processing block, CH12에서는 선행 사용 |

## 4. R2 체험 장치 점검

| 레슨 | 코드 있음 | 체험 설계 | 판정 |
| --- | --- | --- | --- |
| L01 | ABAP 코드 블록 없음 | 조건 카드 -> Range Table 행 빌더 | 통과 |
| L02 | 있음 | SELECT-OPTIONS 화면 변환기 | 통과 |
| L03 | 있음 | WHERE IN 필터 엔진 | 통과 |
| L04 | ABAP 코드 블록 없음 | Include/Exclude 판정기 | 통과 |
| L05 | ABAP 코드 블록 없음 | OPTION 비교 실험실 | 통과 |
| L06 | 있음 | 코드로 range 행 추가 스텝퍼 | 통과 |
| L07 | 있음 | 기존 `CH12-L07-S01.html` 필터 시뮬레이터 | 통과 |

R2 관점에서 중요한 개선은 코드가 "문법 예시"로만 남지 않고, 버튼 조작, Range Table 상태, 결과 행 수, 오답 피드백까지 연결되었다는 점이다.

## 5. Classic-first 및 R15 범위 검사

수동 점검 기준:

- 코드 예제에는 inline declaration을 넣지 않았다.
- 코드 예제에는 constructor expression이나 object creation expression을 넣지 않았다.
- modern Open SQL host marker와 string template을 넣지 않았다.
- CH12의 SQL은 classic `WHERE field IN s_xxx` 형태로 유지했다.
- `START-OF-SELECTION`은 CH15 전 선행 사용으로 표시했다.
- `TABLES`는 SELECT-OPTIONS field reference와 기존 report reading 목적으로만 설명하고, 사용 주의도 함께 적었다.
- Selection Screen 심화 옵션(`OBLIGATORY`, `NO-EXTENSION`, `NO INTERVALS`, `MODIF ID`, Variant)은 CH15로 경계 처리했다.
- L07의 `REF TO`, `TRY/CATCH`, SALV 호출은 CH11 실습 흐름 재사용이자 CH20 전 선행 사용으로 표시했다.
- `RANGES`는 레거시 인지용으로만 다루고 새 기준 예제는 `TYPE RANGE OF`로 작성했다.

자동 검색 결과는 최종 파일 작성 후 실행했다.

```text
rg -n "도입 불편|단순히 실행되는 예제|필요 학습수단|abapparameters\.htm|abapif\.htm|abapcase\.htm|abapselect_join\.htm|공식 문서 체크 힌트" reference\codex_0625_v2\CH12_REWRITE.md
결과: 0건

rg -n "DATA\(|@DATA|@\w|VALUE #|NEW |\+=|FINAL\(" reference\codex_0625_v2\CH12_REWRITE.md
결과: 0건

rg -n "\|[^\n`]*\{[^\n`]*\}|\{[^\n`]*\}[^\n`]*\|" reference\codex_0625_v2\CH12_REWRITE.md
결과: 0건

rg -n "\b(INSERT|UPDATE|DELETE|MODIFY|COMMIT|ROLLBACK|CREATE OBJECT)\b" reference\codex_0625_v2\CH12_REWRITE.md
결과: 0건

rg -n "[ \t]+$" reference\codex_0625_v2\CH12_REWRITE.md reference\codex_0625_v2\CH12_QA.md
결과: 0건

rg -n "^## CH12-L|C:\\ABAP_DOCU_HTML" reference\codex_0625_v2\CH12_REWRITE.md
결과: 레슨 heading 7개, ABAP_DOCU 근거 18개

섹션 카운트:
왜 필요한가 7개, 무엇인가 7개, 어떻게 확인하는가 7개, 체험 설계 7개, 실수와 주의 7개, 정리 7개
```

## 6. 남은 작업

현재 산출물은 CH12를 실제 강의자료로 바꾸기 위한 v2 기준 원고다. 다음 단계에서 사용자가 진행을 승인하면 아래 중 하나를 선택해야 한다.

1. `reference/codex_0625_v2/CH12_REWRITE.md`를 기준으로 `content/abap/CH12/*.md`를 실제 교체한다.
2. L02의 "SELECT-OPTIONS 화면 변환기" embed를 신규 구현한다.
3. L03의 "WHERE IN 필터 엔진" embed를 신규 구현한다.
4. L04/L05/L06의 판정기와 스텝퍼 embed를 신규 구현한다.
5. 기존 `CH12-L07-S01.html`을 실제 원본 lesson 문맥에 맞춰 세부 문구만 다듬는다.
6. 같은 방식으로 다음 단일 챕터를 v2로 재작성한다.

이번 턴에서는 목표 범위에 맞춰 reference 산출물만 작성했다.
