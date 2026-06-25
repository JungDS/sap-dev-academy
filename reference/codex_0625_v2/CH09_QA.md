# CH09_QA - codex_0625_v2 재작업 검수

> 대상 파일: `reference/codex_0625_v2/CH09_REWRITE.md`
> 판정: CH09 v2 기준 원고는 재작업 준비 산출물로 통과. 실제 `content/abap/CH09` 반영과 신규 embed 구현은 아직 수행하지 않았다.

## 1. 재작업 판정 반영

`reference/codex_0625/00_QUALITY_REVIEW.md`는 v1 산출물이 최종 강의자료가 아니라 템플릿형 보강 지시문에 가깝다고 판정했다. CH09 v1에서도 관련 없는 공식 문서 힌트와 레슨별 반복 문구가 확인되었다.

v2에서는 다음 방식으로 처리했다.

| 항목 | v1 문제 | v2 처리 |
| --- | --- | --- |
| 템플릿 반복 | 레슨마다 같은 "도입 불편/실무 감각/학습수단" 문구 반복 | CH09 9개 레슨을 각각 새 강의 원고로 직접 작성 |
| 공식 문서 | CH09와 무관한 제어문/반복문 문서가 연결됨 | DDIC/F4/Foreign Key/Search Help 관련 문서만 수동 선별 |
| 체험 설계 | "시각화 필요" 수준의 일반 지시 | 각 레슨에 버튼, 토글, 데이터, 상태, 실패 피드백을 구체화 |
| R15 경계 | 직접 F4 이벤트, 데이터 저장 처리, 메시지 심화가 앞당겨질 위험 | 직접 F4는 CH15/16 L1 예고, 데이터 저장 처리는 CH24 이후로 경계 표시 |
| classic-first | CH17 이전 modern syntax 혼입 위험 | 코드 예제는 classic 구문만 사용 |

## 2. 소스 커버리지

현재 authoritative scope는 `content/abap/CH09`의 9개 레슨이다. `.project-docs/09_CURRICULUM_LEDGER.md`에는 오래된 6레슨 표가 남아 있지만, 실제 원본과 `.project-docs/12_EXPANSION_PLAN.md`는 9레슨 구성을 반영한다.

| 원본 | v2 반영 위치 | 확인 |
| --- | --- | --- |
| `CH09/_chapter.md` | "CH09 전체 설계", "CH09 마무리 학습 흐름" | 반영 |
| `CH09-L01.md` | `## CH09-L01 - Foreign Key와 Check Table` | 반영 |
| `CH09-L02.md` | `## CH09-L02 - Value Table과 Foreign Key의 차이` | 반영 |
| `CH09-L03.md` | `## CH09-L03 - Text Table: 코드 옆 이름표` | 반영 |
| `CH09-L04.md` | `## CH09-L04 - Elementary Search Help` | 반영 |
| `CH09-L05.md` | `## CH09-L05 - Collective Search Help 기초` | 반영 |
| `CH09-L06.md` | `## CH09-L06 - PARAMETERS와 DDIC F4 Help 연결` | 반영 |
| `CH09-L07.md` | `## CH09-L07 - Input Help 호출 우선순위` | 반영 |
| `CH09-L08.md` | `## CH09-L08 - DDIC 검증과 프로그램 검증의 역할 분리` | 반영 |
| `CH09-L09.md` | `## CH09-L09 - 실습: 콘서트 모델 만들기(DDIC)` | 반영 |

## 3. 공식 문서 수동 근거

CH09_REWRITE에는 아래 문서만 수동 근거로 남겼다.

| 문서 | 사용 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abenabap_dictionary.htm` | ABAP Dictionary와 F4 help 전체 근거 |
| `C:\ABAP_DOCU_HTML\abenddic_database_tables_forkeyrel.htm` | Foreign Key dependency와 평가 경계 |
| `C:\ABAP_DOCU_HTML\abenddic_database_tables_checktab.htm` | Check Table과 key field 대응 |
| `C:\ABAP_DOCU_HTML\abenddic_database_tables_forkey.htm` | Foreign Key, Cardinality, Text Table 관련 규칙 |
| `C:\ABAP_DOCU_HTML\abenddic_domains_sema.htm` | Fixed values, Value Table, Conversion Routine |
| `C:\ABAP_DOCU_HTML\abenvalue_table_glosry.htm` | Value Table glossary 근거 |
| `C:\ABAP_DOCU_HTML\abentext_table_glosry.htm` | Text Table glossary 근거 |
| `C:\ABAP_DOCU_HTML\abenddic_data_elements_sema.htm` | Data Element에 Search Help 부착 |
| `C:\ABAP_DOCU_HTML\abensearch_help_glosry.htm` | Search Help 개념 근거 |
| `C:\ABAP_DOCU_HTML\abapparameters_type.htm` | PARAMETERS와 DDIC type의 F4/value checking 연결 |
| `C:\ABAP_DOCU_HTML\abapparameters_value.htm` | MATCHCODE OBJECT |
| `C:\ABAP_DOCU_HTML\abendynpro_f4_help_dic_abexa.htm` | Dictionary 기반 F4 사례 |
| `C:\ABAP_DOCU_HTML\dynpprocess.htm` | PROCESS ON VALUE-REQUEST 우선 경계 |
| `C:\ABAP_DOCU_HTML\abensel_screen_f4_help_abexa.htm` | 선택화면 직접 F4는 CH15 예고 |

## 4. R2 체험 장치 점검

| 레슨 | 코드 있음 | 체험 설계 | 판정 |
| --- | --- | --- | --- |
| L01 | 없음 | 관계 게이트 실험실 | 통과 |
| L02 | 없음 | 제안 vs 검증 스위치보드 | 통과 |
| L03 | 없음 | 언어별 이름표 뷰어 | 통과 |
| L04 | 없음 | Elementary Search Help 빌더 | 통과 |
| L05 | text diagram | Collective Search Help 탭 시뮬레이터 | 통과 |
| L06 | 있음 | F4 부착 범위 보드 | 통과 |
| L07 | 기존 embed 있음 | 기존 `CH09-L07-S01.html` + 우선순위 토글 실험 | 통과 |
| L08 | 있음 | 검증 책임 라우터 | 통과 |
| L09 | 없음 | 콘서트 모델 제작 체크리스트 | 통과 |

L06과 L08은 ABAP 코드가 있으므로 같은 페이지에서 결과를 체험하는 장치가 필요하다. v2 원고에는 입력칸, F4 후보, Search Help 부착 범위, `sy-subrc` 기반 읽기 확인 결과를 직접 볼 수 있는 체험 설계를 포함했다.

## 5. Classic-first 및 R15 범위 검사

수동 점검 기준:

- CH17 이전 금지 문법을 코드 예제에 넣지 않았다.
- 직접 F4 이벤트 구현은 CH15/16 예고로만 두었다.
- 데이터 저장과 트랜잭션 처리는 CH24 이후로 경계 처리했다.
- `MESSAGE` 심화, 선택화면 검증 이벤트, Dynpro flow logic은 정식 설명하지 않았다.
- Search Help는 DDIC 설계 관점으로 설명하고, modern ABAP나 RAP 문법으로 확장하지 않았다.

자동 검색 결과:

```text
rg -n "도입 불편|단순히 실행되는 예제|필요 학습수단|abapif\.htm|abapcase\.htm|abaploop_at_itab|abapparameters\.htm`? 공식" reference\codex_0625_v2\CH09_REWRITE.md
결과: 0건

rg -n "DATA\(|@DATA|@\w|VALUE #|NEW " reference\codex_0625_v2\CH09_REWRITE.md
결과: 0건

rg -n "\b(INSERT|UPDATE|DELETE|MODIFY|COMMIT|ROLLBACK|JOIN)\b" reference\codex_0625_v2\CH09_REWRITE.md
결과: 0건

rg -n "[ \t]+$" reference\codex_0625_v2\CH09_REWRITE.md
결과: 0건

rg -n "^## CH09-L|C:\\ABAP_DOCU_HTML" reference\codex_0625_v2\CH09_REWRITE.md
결과: 레슨 heading 9개, ABAP_DOCU 근거 14개
```

## 6. 남은 작업

현재 산출물은 CH09를 실제 강의자료로 바꾸기 위한 v2 기준 원고다. 다음 단계에서 사용자가 진행을 승인하면 아래 중 하나를 선택해야 한다.

1. `reference/codex_0625_v2/CH09_REWRITE.md`를 기준으로 `content/abap/CH09/*.md`를 실제 교체한다.
2. L01-L06, L08-L09의 신규 embed HTML을 구현하고 원본 lesson에 연결한다.
3. 기존 `CH09-L07-S01.html`에 우선순위 토글 실험을 추가한다.
4. 같은 방식으로 다음 단일 챕터를 v2로 재작성한다.

이번 턴에서는 목표 범위에 맞춰 reference 산출물만 작성했다.
