# CH11_QA - codex_0625_v2 재작업 검수

> 대상 파일: `reference/codex_0625_v2/CH11_REWRITE.md`
> 판정: CH11 v2 기준 원고는 재작업 준비 산출물로 통과. 실제 `content/abap/CH11` 반영과 신규 embed 구현은 아직 수행하지 않았다.

## 1. 재작업 판정 반영

`reference/codex_0625/00_QUALITY_REVIEW.md`는 v1 산출물이 완성 강의자료가 아니라 템플릿형 보강 지시문에 가깝다고 판정했다. CH11 v1도 L03/L04의 R2 체험 누락, L01/L05/L06의 본문 빈약, 자동 공식문서 힌트 혼입 문제가 있었다.

v2에서는 다음 방식으로 처리했다.

| 항목 | v1 문제 | v2 처리 |
| --- | --- | --- |
| 템플릿 반복 | "도입 불편/실무 감각/필요 학습수단" 문구 반복 | CH11 6개 레슨을 각각 새 강의 원고로 직접 작성 |
| 코드 체험 | L03/L04에 코드가 있으나 구체 체험이 없음 | L03 툴바 스위치, L04 파이프라인 스텝퍼를 버튼/상태/데이터/피드백까지 설계 |
| 공식 문서 | `WRITE` 형식 문서, 선택화면 문서 등 자동 매칭 흔적 | ALV guideline, SALV 예제, method parameter, reference, TRY/CATCH, SELECT, Data Element 문서만 수동 선별 |
| R15 경계 | `REF TO`, `TRY/CATCH`, method chain, `get_columns( )` 심화가 앞당겨질 위험 | SALV 호출 필수 문법은 `[선행 사용]`, `get_columns( )`는 CH21로 이동 권고 |
| classic-first | modern Open SQL, inline declaration 혼입 위험 | 코드 예제는 classic-safe 구문으로 작성 |

## 2. 소스 커버리지

현재 authoritative scope는 `content/abap/CH11`의 6개 레슨이다.

| 원본 | v2 반영 위치 | 확인 |
| --- | --- | --- |
| `CH11/_chapter.md` | "CH11 전체 설계", "CH11 마무리 학습 흐름" | 반영 |
| `CH11-L01.md` | `## CH11-L01 - SALV의 목적과 CL_SALV_TABLE 개요` | 반영 |
| `CH11-L02.md` | `## CH11-L02 - FACTORY 메서드로 Internal Table 출력` | 반영 |
| `CH11-L03.md` | `## CH11-L03 - 기본 Function 표시와 Display 실행` | 반영 |
| `CH11-L04.md` | `## CH11-L04 - Internal Table에서 SALV 미니 리포트` | 반영 |
| `CH11-L05.md` | `## CH11-L05 - SALV 기초 정리 및 이후 심화과정 소개` | 반영 |
| `CH11-L06.md` | `## CH11-L06 - 실습: 예매 목록 SALV` | 반영 |
| `embeds/abap/CH11-L02-S01.html` | L02 체험 설계 | 반영 |
| `embeds/abap/CH11-L06-S01.html` | L06 체험 설계 | 반영 |

## 3. 공식 문서 수동 근거

CH11_REWRITE에는 아래 문서만 수동 근거로 남겼다.

| 문서 | 사용 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abenabap_lists.htm` | 표 형태 list output에는 ALV 클래스, 예를 들어 `CL_SALV_TABLE` 사용 |
| `C:\ABAP_DOCU_HTML\abenlist_guidl.htm` | classic lists 대신 SAP List Viewer(ALV) 사용 권장 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpro_list.htm` | tabular list output과 ALV 클래스 연결 |
| `C:\ABAP_DOCU_HTML\abenseparation_concerns_guidl.htm` | `cl_salv_table=>factory`, `r_salv_table`, `t_table`, `display`, `cx_salv_msg` 예제 |
| `C:\ABAP_DOCU_HTML\abapcall_method_parameters.htm` | method call의 `EXPORTING`, `IMPORTING`, `CHANGING` 방향 |
| `C:\ABAP_DOCU_HTML\abapcall_method_static_chain.htm` | `get_functions( )->set_all( )` 같은 chained method call 이해 |
| `C:\ABAP_DOCU_HTML\abapdata_references.htm` | `DATA ... TYPE REF TO` reference variable |
| `C:\ABAP_DOCU_HTML\abaptry.htm` | `TRY` 보호 구역 |
| `C:\ABAP_DOCU_HTML\abapcatch_try.htm` | `CATCH` exception handler |
| `C:\ABAP_DOCU_HTML\abapselect.htm` | `SELECT`, `sy-subrc`, `sy-dbcnt` |
| `C:\ABAP_DOCU_HTML\abapselect_into_target.htm` | `SELECT ... INTO TABLE` internal table target |
| `C:\ABAP_DOCU_HTML\abapstart-of-selection.htm` | executable program의 standard processing block, CH11에서는 선행 사용 |
| `C:\ABAP_DOCU_HTML\abenddic_data_elements.htm` | Data Element의 technical/semantic role |
| `C:\ABAP_DOCU_HTML\abenddic_data_elements_sema.htm` | field label과 UI 의미 정보 |
| `C:\ABAP_DOCU_HTML\abapmessage.htm` | `MESSAGE`, type, `DISPLAY LIKE` |

수동 확인 중 `C:\ABAP_DOCU_HTML`에는 `CL_SALV_TABLE` 전용 API 파일이 별도로 보이지 않았다. 따라서 v2는 자동 키워드 매칭을 하지 않고, 위 guideline/예제 문서에 나타난 SALV 사용 패턴만 근거로 삼았다.

## 4. R2 체험 장치 점검

| 레슨 | 코드 있음 | 체험 설계 | 판정 |
| --- | --- | --- | --- |
| L01 | 설명상 코드 이름만, ABAP 코드 블록 없음 | WRITE 리스트 vs SALV 비교 카드 | 통과 |
| L02 | 있음 | 기존 `CH11-L02-S01.html` factory/display 시뮬레이터 | 통과 |
| L03 | 있음 | 표준 기능 스위치 패널 신규 설계 | 통과 |
| L04 | 있음 | SELECT -> Internal Table -> SALV 파이프라인 스텝퍼 신규 설계 | 통과 |
| L05 | 없음 | SALV 1차 범위 카드 분류 | 통과 |
| L06 | 있음 | 기존 `CH11-L06-S01.html` 예매 목록 SALV 시뮬레이터 | 통과 |

R2 관점에서 중요한 개선은 L03/L04의 정적 코드가 버튼, 상태 전이, 표시 데이터, 오답 피드백과 연결되었다는 점이다.

## 5. Classic-first 및 R15 범위 검사

수동 점검 기준:

- 코드 예제에는 inline declaration을 넣지 않았다.
- 코드 예제에는 constructor expression이나 object creation expression을 넣지 않았다.
- New Open SQL escape marker와 string template을 넣지 않았다.
- `TYPE REF TO`, `TRY/CATCH cx_salv_msg`, `lo_alv->...`, method chain은 SALV 호출에 필요한 선행 사용으로 표시했다.
- 본격 객체 생성, 참조 변수 원리, 예외 계층, 인스턴스 설계는 CH20으로 경계 처리했다.
- `START-OF-SELECTION`은 실행 흐름 표시 목적의 선행 사용으로 표시하고, 정식 이벤트 블록 설명은 CH15로 경계 처리했다.
- Grid ALV, Field Catalog, Container, 이벤트, 편집 ALV는 L1 예고만 하고 코드로 당겨오지 않았다.
- 원본 L06의 `get_columns( )` 도전 과제는 CH21로 이동하는 것이 안전하다고 명시했다.

자동 검색 결과는 최종 파일 작성 후 실행했다.

```text
rg -n "도입 불편|단순히 실행되는 예제|필요 학습수단|abapparameters\.htm|abapselect-options\.htm|공식 문서 체크 힌트" reference\codex_0625_v2\CH11_REWRITE.md
결과: 0건

rg -n "DATA\(|@DATA|@\w|VALUE #|NEW |\+=|FINAL\(" reference\codex_0625_v2\CH11_REWRITE.md
결과: 0건

rg -n "\|[^\n`]*\{[^\n`]*\}|\{[^\n`]*\}[^\n`]*\|" reference\codex_0625_v2\CH11_REWRITE.md
결과: 0건

rg -n "\b(INSERT|UPDATE|DELETE|MODIFY|COMMIT|ROLLBACK|CREATE OBJECT)\b" reference\codex_0625_v2\CH11_REWRITE.md
결과: 0건

rg -n "[ \t]+$" reference\codex_0625_v2\CH11_REWRITE.md reference\codex_0625_v2\CH11_QA.md
결과: 0건

rg -n "^## CH11-L|C:\\ABAP_DOCU_HTML" reference\codex_0625_v2\CH11_REWRITE.md
결과: 레슨 heading 6개, ABAP_DOCU 근거 15개 이상

섹션 카운트:
왜 필요한가 6개, 무엇인가 6개, 어떻게 확인하는가 6개, 체험 설계 6개, 실수와 주의 6개, 정리 6개
```

## 6. 남은 작업

현재 산출물은 CH11을 실제 강의자료로 바꾸기 위한 v2 기준 원고다. 다음 단계에서 사용자가 진행을 승인하면 아래 중 하나를 선택해야 한다.

1. `reference/codex_0625_v2/CH11_REWRITE.md`를 기준으로 `content/abap/CH11/*.md`를 실제 교체한다.
2. L03의 "SALV 표준 기능 스위치" embed를 신규 구현한다.
3. L04의 "SELECT -> Internal Table -> SALV 파이프라인" embed를 신규 구현한다.
4. 기존 `CH11-L02-S01.html`, `CH11-L06-S01.html`을 실제 원본 lesson 문맥에 맞춰 세부 문구만 다듬는다.
5. 같은 방식으로 다음 단일 챕터를 v2로 재작성한다.

이번 턴에서는 목표 범위에 맞춰 reference 산출물만 작성했다.
