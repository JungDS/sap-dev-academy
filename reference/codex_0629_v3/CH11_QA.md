# CH11_QA - codex_0629_v3 품질 점검

> 대상 파일: `reference/codex_0629_v3/CH11_REWRITE.md`
> 작업 단위: CH11 모든 레슨
> 판정: CH11 v3 산출물 생성 완료. `content/abap/CH11`의 6개 레슨을 기준으로 재집필했고, 기존 `codex_0625_v2`는 보조 누락 방지 자료로만 사용했다.

## 1. 입력 소스 확인

| 구분 | 확인 내용 |
|---|---|
| 원본 챕터 | `content/abap/CH11/_chapter.md` |
| 원본 레슨 | `CH11-L01.md` ~ `CH11-L06.md` 전부 확인 |
| 프로젝트 규칙 | R2 code=experience, R3 입문자 흐름, R6 classic-first, R15 concept gating 적용 |
| 커리큘럼 원장 | `.project-docs/09_CURRICULUM_LEDGER.md`의 CH11 SALV 1차, Grid ALV/심화 분리, CH12 연결 확인 |
| 키워드 감사 | `.project-docs/11_KEYWORD_AUDIT.md`의 CH11 공식 일치 판정과 modern syntax 금지 확인 |
| 기존 reference | `reference/codex_0625` 계열은 범위 확인용으로만 사용 |
| 기존 v2 reference | `reference/codex_0625_v2/CH11_REWRITE.md`, `CH11_QA.md` 확인. 공식 근거와 범위 경계 확인용으로만 사용 |
| 기존 임베드 | `embeds/abap/CH11-L02-S01.html`, `embeds/abap/CH11-L06-S01.html` 확인. L02/L06 체험 설계에 연결 |

## 2. 공식 문서 수동 확인

Classic ABAP 및 SALV 관련 공식 근거는 `C:\ABAP_DOCU_HTML`에서 직접 파일명을 확인했다. 자동 키워드 매칭만으로 채택하지 않았다.

| 레슨 | 확인 파일 | 반영 내용 |
|---|---|---|
| L01 | `abenabap_lists.htm` | classic list 직접 사용보다 tabular output에 ALV 계열 클래스 사용을 권장하는 방향 반영 |
| L01 | `abenlist_guidl.htm` | 애플리케이션 표 출력은 SAP List Viewer 사용 권장, helper program의 `WRITE`와 구분 |
| L01 | `abenabap_dynpro_list.htm` | tabular list output에서 `CL_SALV_TABLE` 같은 ALV 클래스 사용 가능성 확인 |
| L02 | `abenseparation_concerns_guidl.htm` | `DATA ... TYPE REF TO cl_salv_table`, `factory`, `display`, `cx_salv_msg`가 함께 쓰이는 공식 예제 흐름 확인 |
| L02 | `abapcall_method_parameters.htm` | method call의 `IMPORTING`, `CHANGING` parameter 의미 반영 |
| L02 | `abapdata_references.htm` | `DATA ref TYPE REF TO type` 형태의 reference variable 선언 확인 |
| L02 | `abaptry.htm`, `abapcatch_try.htm` | `TRY` 보호 영역과 `CATCH` exception handler 구조 확인 |
| L03 | `abapcall_method_static_chain.htm` | `get_functions( )->set_all( )` 같은 method chain 설명 근거 확인 |
| L04 | `abapselect.htm`, `abapselect_into_target.htm` | classic `SELECT ... INTO TABLE` 흐름 확인 |
| L04 | `abapstart-of-selection.htm` | executable program의 standard processing block 확인. 본문에서는 CH15 전 선행 사용으로 제한 |
| L04/L06 | `abapmessage.htm` | 실패 또는 빈 결과 안내용 `MESSAGE ... TYPE 'I'` 사용 확인 |
| L02/L06 | `abenddic_data_elements.htm`, `abenddic_data_elements_sema.htm` | Data Element semantic attributes와 field label이 UI 컬럼명 품질에 연결되는 점 확인 |

## 3. ABAP Cloud / Clean Core / NotebookLM 확인 범위

CH11은 Track 1 Classic ABAP의 SALV 1차 챕터다. ABAP Cloud, RAP, Clean Core, released API를 본문에 도입하지 않았다. NotebookLM과 인터넷 검색은 사용하지 않았다. 로컬 원본, 프로젝트 SSOT, 기존 reference, `C:\ABAP_DOCU_HTML` 수동 확인으로 충분했다.

## 4. R15 게이팅 점검

| 항목 | 판정 | 근거 |
|---|---|---|
| Classic-first | 통과 | 코드 예제에 inline declaration, constructor expression, object creation expression, string template, New Open SQL escape 없음 |
| SALV 1차 범위 | 통과 | `factory`, `get_functions( )->set_all( )`, `display` 중심으로 제한 |
| OO 경계 | 통과 | `TYPE REF TO`, method call, method chain은 선행 사용으로 설명. OO 이론은 CH20로 분리 |
| 예외 처리 경계 | 통과 | `TRY ... CATCH cx_salv_msg`는 SALV 생성 보호용으로만 사용. class-based exception 이론은 CH20로 분리 |
| Grid ALV 경계 | 통과 | `CL_GUI_ALV_GRID`, container, field catalog, editing 구현 없음 |
| SALV 심화 경계 | 통과 | 컬럼 세밀 제어, 색, hotspot, 이벤트는 CH21/CH27/CH28로 분리 |
| SQL 경계 | 통과 | classic `SELECT * FROM ... INTO TABLE ...`만 사용. 범위 조건과 Selection Screen은 CH12로 분리 |
| DB 변경 | 통과 | DB 변경, commit, rollback 예제 없음 |

## 5. 레슨별 품질 점검

| 레슨 | 왜 필요한가 | 무엇인가 | 어떻게 확인 | 실수/주의 | 체험 설계 | 정리 |
|---|---|---|---|---|---|---|
| CH11-L01 | 통과 | 통과 | 통과 | 통과 | WRITE와 SALV 비교 보드 | 통과 |
| CH11-L02 | 통과 | 통과 | 통과 | 통과 | 기존 factory/display 시뮬레이터 확장 | 통과 |
| CH11-L03 | 통과 | 통과 | 통과 | 통과 | 표준 기능 스위치 패널 | 통과 |
| CH11-L04 | 통과 | 통과 | 통과 | 통과 | 미니 리포트 실행 파이프라인 | 통과 |
| CH11-L05 | 통과 | 통과 | 통과 | 통과 | SALV 기능 분기 지도 | 통과 |
| CH11-L06 | 통과 | 통과 | 통과 | 통과 | 예매 목록 리포트 조작 실습 | 통과 |

## 6. 체험·시뮬레이터 설계 점검

| 레슨 | 반영한 체험 설계 |
|---|---|
| L01 SALV 목적 | 같은 내부 테이블을 WRITE와 SALV로 비교, 정렬/필터/내보내기 가능 여부 차이 표시 |
| L02 factory 출력 | 기존 `CH11-L02-S01`의 factory/display 버튼을 객체 상태, 빈 테이블, 예외 흐름과 연결 |
| L03 standard functions | `set_all` 전후 툴바 활성 상태, 정렬/필터/합계 버튼 피드백 |
| L04 미니 리포트 | `SELECT -> 행 수 확인 -> factory -> set_all -> display` 흐름을 mermaid 파이프라인으로 제시 |
| L05 범위 경계 | 기본 표시/컬럼 제어/색/이벤트/편집/container 카드를 후속 장으로 분류 |
| L06 예매 목록 실습 | 기존 `CH11-L06-S01`을 예매 조회, 상태 필터, 좌석 합계, 고객명 정렬 중심으로 재정의 |

## 7. 기존 codex_0625_v2 대비 처리

사용자 지시에 따라 v2는 보조로만 사용했다.

| v2에서 참고한 부분 | v3 처리 |
|---|---|
| 6개 레슨 전체 범위 | 현재 `content/abap/CH11` 원본 6개 레슨을 authoritative scope로 재확인 |
| 공식 문서 후보 | 실제 `C:\ABAP_DOCU_HTML`에서 다시 수동 확인 후 QA에 기록 |
| L02/L06 임베드 연결 | 기존 임베드를 유지하되 v3의 설명 흐름에 맞게 체험 설계를 재서술 |
| `get_columns` 도전 과제 | CH11 범위를 넘으므로 CH21로 이동한다고 명시 |
| R15 경계 | CH17/CH21/CH27/CH28로 분리해 본문에 명확히 기록 |
| 템플릿 제거 | v2 문장을 복사하지 않고 WRITE 불편에서 SALV 성공 경험으로 새 흐름 구성 |

## 8. 코드/절차 예제 점검

| 점검 항목 | 결과 |
|---|---|
| ABAP 코드 | `CL_SALV_TABLE=>FACTORY`, `get_functions( )->set_all`, `display`, classic `SELECT`, `DESCRIBE TABLE` |
| Modern syntax | 없음 |
| New Open SQL | 없음 |
| DB 변경 코드 | 없음 |
| Grid ALV 코드 | 없음 |
| SALV deep column code | 없음. `get_columns` 구현은 CH21로 분리 |
| Instance OO 설명 | 참조 변수와 method call은 선행 사용으로만 설명 |
| 콘서트 관통 예제 | CH09의 `ZBOOKING` 예매 목록을 SALV 실습으로 연결 |

## 9. 자동 점검 기록

작성 후 아래 기준으로 자동 점검했다.

```text
git diff --check
rg -n "DATA\(|@DATA|@\w|VALUE #|NEW |\+=|FINAL\(" reference\codex_0629_v3\CH11_REWRITE.md
rg -n "\|[^\n`]*\{[^\n`]*\}|\{[^\n`]*\}[^\n`]*\|" reference\codex_0629_v3\CH11_REWRITE.md
rg -n "\b(INSERT|UPDATE|DELETE|MODIFY|COMMIT|ROLLBACK|CREATE OBJECT|CL_GUI_ALV_GRID|LVC_T_FCAT)\b" reference\codex_0629_v3\CH11_REWRITE.md
rg -n "도입 불편|필요 학습수단|abapparameters\.htm|abapselect-options\.htm|공식 문서 체크 힌트" reference\codex_0629_v3\CH11_REWRITE.md
```

점검 결과:

| 명령 | 결과 |
|---|---|
| `git diff --check` | trailing whitespace 없음 |
| modern ABAP/SQL token 검색 | REWRITE 본문 0건 |
| string template 패턴 검색 | REWRITE 본문 0건 |
| DB 변경/Grid ALV token 검색 | REWRITE 본문 0건 |
| 기존 템플릿/오연결 힌트 검색 | REWRITE 본문 0건 |

## 10. 최종 판정

CH11 v3 산출물은 생성 완료로 판정한다. 원본 `content/abap/CH11`의 6개 레슨을 모두 포함했고, 공식 문서 수동 확인 근거를 QA에 기록했으며, 기존 v2는 보조로만 사용했다. 각 레슨은 입문자 기준의 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 체험 설계 -> 정리" 흐름을 갖춘다.

이번 산출물 범위는 reference 재집필 자료이므로 실제 `content/abap/CH11` 파일은 수정하지 않았다.
