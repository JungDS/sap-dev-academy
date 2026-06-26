# CH17_QA - codex_0625_v2 재작업 검수

> 대상 파일: `reference/codex_0625_v2/CH17_REWRITE.md`  
> 판정: CH17 v2 기준 원고는 재작업 준비 산출물로 통과 대상. 실제 `content/abap/CH17` 반영과 embed 수정은 아직 수행하지 않았다.

## 1. 재작업 판정 반영

`reference/codex_0625/00_QUALITY_REVIEW.md`는 v1 산출물이 완성 강의자료가 아니라 반복 템플릿형 보강안에 가깝다고 판정했다. CH17 v1도 레슨마다 거의 같은 "도입 불편", "필요 학습수단", "공식 문서 체크 힌트"가 반복되었고, 일부 공식문서 힌트는 selection screen 또는 일반 출력 문서처럼 CH17 Grid ALV와 직접 맞지 않는 항목이 섞였다.

v2에서는 다음 방식으로 처리했다.

| 항목 | v1 문제 | v2 처리 |
| --- | --- | --- |
| 템플릿 반복 | 레슨마다 같은 개선 지시문 반복 | 10개 레슨을 실제 강의 원고로 재작성 |
| 강의 흐름 | 컨테이너, 그리드, field catalog 설명이 짧게 압축 | 왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수와 주의 -> 정리 흐름으로 확장 |
| 공식 문서 | 무관 문서가 자동 힌트로 혼입 | `C:\ABAP_DOCU_HTML`에서 직접 확인한 문서만 근거로 기록 |
| 학습 체험 | L07/L10 외 레슨은 체험 설계가 약함 | 모든 코드 포함 레슨에 버튼, 상태, 데이터, 실패 피드백 설계를 추가 |
| R15 경계 | `REF TO`, `CREATE OBJECT`, method call이 CH20 전 선노출 | `[선행 사용]`으로 제한하고 객체 이론 설명은 CH20로 분리 |
| 후속 주제 경계 | 합계, 셀 색상, 이벤트, 편집이 섞일 위험 | 행 색상까지만 CH17로 유지하고 CH21/CH27/CH28로 분리 |

## 2. 소스 커버리지

현재 authoritative scope는 `content/abap/CH17`의 10개 레슨이다.

| 원본 | v2 반영 위치 | 확인 |
| --- | --- | --- |
| `CH17/_chapter.md` | "CH17 전체 설계", "CH17 마무리 학습 흐름" | 반영 |
| `CH17-L01.md` | `## CH17-L01 - CL_GUI_CUSTOM_CONTAINER 생성` | 반영 |
| `CH17-L02.md` | `## CH17-L02 - CL_GUI_ALV_GRID 생성` | 반영 |
| `CH17-L03.md` | `## CH17-L03 - 출력용 Internal Table 준비` | 반영 |
| `CH17-L04.md` | `## CH17-L04 - Field Catalog 기초` | 반영 |
| `CH17-L05.md` | `## CH17-L05 - Layout 기본 설정` | 반영 |
| `CH17-L06.md` | `## CH17-L06 - Variant 기본 설정` | 반영 |
| `CH17-L07.md` | `## CH17-L07 - SET_TABLE_FOR_FIRST_DISPLAY` | 반영 |
| `CH17-L08.md` | `## CH17-L08 - Refresh와 Stable Refresh 기초` | 반영 |
| `CH17-L09.md` | `## CH17-L09 - 행 색상 기초` | 반영 |
| `CH17-L10.md` | `## CH17-L10 - 종합 실습: 예매 목록 Grid ALV 완성` | 반영 |

## 3. 공식 문서 수동 근거

CH17_REWRITE에는 아래 문서를 수동 근거로 남겼다.

| 문서 | 사용 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_screen.htm` | Dynpro screen element 중 Custom Control이 화면 안 control 표시 영역임을 확인 |
| `C:\ABAP_DOCU_HTML\abendynpro_custom_controls.htm` | Custom Control, SAP Control Framework, `CL_GUI_CUSTOM_CONTAINER`, container control과 application control 연결 구조 확인 |
| `C:\ABAP_DOCU_HTML\abendynpro_custom_control_abexa.htm` | PBO에서 Custom Container와 control 객체를 처음 한 번 생성하는 예제 흐름 확인 |
| `C:\ABAP_DOCU_HTML\abencontrol_framework_glosry.htm` | `CL_GUI_` 계열 Control Framework 개념 확인 |
| `C:\ABAP_DOCU_HTML\abapcreate_object.htm` | `CREATE OBJECT`가 object reference에 인스턴스를 할당한다는 문법 확인 |
| `C:\ABAP_DOCU_HTML\abapselect.htm` | `SELECT` 후 `sy-subrc`, `sy-dbcnt` 확인 기준 |
| `C:\ABAP_DOCU_HTML\abapselect_into_target.htm` | `SELECT ... INTO TABLE ...` 대상 internal table 흐름 확인 |
| `C:\ABAP_DOCU_HTML\abapcall_function.htm` | Function Module 호출과 `sy-subrc` 기준 확인 |
| `C:\ABAP_DOCU_HTML\abapreturn.htm` | ABAP_DOCU 예제 안에서 `CL_GUI_ALV_GRID`, `i_parent`, `set_table_for_first_display`, `it_outtab` 사용 확인 |

근거 수준 분리:

- `CL_GUI_CUSTOM_CONTAINER`, Control Framework, Dynpro Custom Control, `CREATE OBJECT`, `SELECT`, `CALL FUNCTION`은 ABAP_DOCU에서 직접 확인했다.
- `LVC_T_FCAT`, `LVC_S_FCAT`, `LVC_S_LAYO`, `DISVARIANT`, `LVC_S_STBL`, `info_fname`, ALV Grid 세부 method exception은 ABAP 키워드 독립 문서가 아니라 ALV Grid/Class Builder API 성격이다. 원고에는 `11_KEYWORD_AUDIT.md`의 CH17 감사 결과와 원본 커리큘럼 범위를 함께 대조해 유지했으며, ABAP_DOCU 직접 근거 표와 섞어 쓰지 않았다.

무관 문서 배제:

- `PARAMETERS`, `SELECT-OPTIONS`, `WRITE`, 일반 `IF`, 일반 `CASE` 문서는 CH17 Grid ALV 근거로 사용하지 않았다.
- v1의 자동 공식문서 힌트는 그대로 재사용하지 않았다.

## 4. 공식문서 기반 교정 사항

가장 중요한 교정은 "화면 영역", "컨테이너 객체", "실제 Grid control"을 분리한 점이다.

| 항목 | v2 판정 |
| --- | --- |
| Custom Control | Screen Painter에 만든 직사각형 화면 영역 |
| Custom Container | Custom Control 영역을 ABAP Control Framework와 연결하는 `CL_GUI_CUSTOM_CONTAINER` 객체 |
| Grid ALV | Container 안에 들어가는 application control인 `CL_GUI_ALV_GRID` 객체 |
| Object creation | `CREATE OBJECT`로 reference variable에 객체를 할당하되 CH20 전 `[선행 사용]`으로 제한 |
| 데이터 준비 | ALV가 직접 DB를 그리는 것이 아니라 internal table을 화면에 표시 |
| Field Catalog | 데이터 필드를 화면 컬럼으로 번역하는 설명서 |
| Layout | 컬럼별 속성이 아니라 표 전체 보기 설정 |
| Variant | 예매 데이터 저장이 아니라 사용자의 표시 방식 저장 |
| First display | `set_table_for_first_display`는 처음 표시 호출 |
| Refresh | 이미 표시된 Grid는 `refresh_table_display`로 다시 그림 |
| Row color | CH17은 행 전체 색상까지만, 셀 색상과 스타일은 CH21 이후 |

추가 교정:

- `do_sum`을 CH17 과제 코드로 확장하지 않았다.
- 이벤트, toolbar extension, double click, editable Grid는 설명 대상에서 제외했다.
- `set_table_for_first_display`와 `refresh_table_display`의 책임을 명확히 분리했다.
- `sy-subrc`, `sy-dbcnt`, `lt_fcat`, `lt_booking`, `go_cont`, `go_grid` 등 확인 가능한 디버깅 기준을 각 레슨에 배치했다.

## 5. R2 체험 장치 점검

| 레슨 | 코드 있음 | 체험 설계 | 판정 |
| --- | --- | --- | --- |
| L01 | 있음 | Screen Painter 이름 확인 -> PBO 실행 -> container 생성 상태 패널 | 통과 |
| L02 | 있음 | `go_cont`, `go_grid`, 데이터, field catalog 준비 상태를 분리한 조립 상태판 | 통과 |
| L03 | 있음 | 공연 번호별 조회 결과, `sy-subrc`, `sy-dbcnt`, internal table 행 수 비교 | 통과 |
| L04 | 있음 | Field Catalog 편집기, 컬럼 제목/너비 미리보기, fieldname 오타 피드백 | 통과 |
| L05 | 있음 | Layout 토글 패널, zebra/title/width 변화 즉시 미리보기 | 통과 |
| L06 | 있음 | 사용자 A/B variant 저장과 다시 열기 시뮬레이션 | 통과 |
| L07 | 있음 | 기존 `CH17-L07-S01` 4단계 조립 위젯과 실패 토글 설계 | 통과 |
| L08 | 있음 | internal table 상태와 화면 Grid 상태를 나란히 둔 일반 refresh/stable refresh 비교 | 통과 |
| L09 | 있음 | 매진 판정 슬라이더, 색 코드 쓰기, `info_fname` 연결, 실패 원인 피드백 | 통과 |
| L10 | 있음 | 기존 `CH17-L10-S01` 종합 조립 위젯, 화면-데이터-컬럼-갱신 체크리스트 | 통과 |

모든 코드 포함 레슨은 버튼, 상태, 데이터, 실패 피드백을 가진 체험 설계로 연결된다.

## 6. Classic-first 및 R15 범위 검사

수동 점검 기준:

- ABAP 예제에는 inline declaration을 넣지 않았다.
- constructor expression, object creation expression, string template을 넣지 않았다.
- modern Open SQL host marker와 comma field list를 넣지 않았다.
- `SELECT`는 classic `SELECT ... INTO TABLE ... WHERE ...` 형태로 유지했다.
- `TYPE REF TO`와 `CREATE OBJECT`는 CH20 전 `[선행 사용]`으로 명시했다.
- `CL_GUI_ALV_GRID` method call은 Grid control 조립을 위한 필수 호출로만 설명했다.
- 셀 색상, style table, event handling, toolbar extension, editable Grid는 CH21/CH27/CH28로 분리했다.
- `do_sum`은 CH17 본문 과제에서 제외했다.
- SAPUI5/Fiori 또는 Web Dynpro로 확장하지 않았다.

## 7. 자동 검색 결과

최종 파일 작성 후 아래 자동 검색을 실행했다.

```powershell
rg -n "도입 불편|단순히 실행되는 예제|필요 학습수단|공식 문서 체크 힌트|abapparameters\.htm|abapselect-options\.htm|abapif\.htm|abapcase\.htm" reference\codex_0625_v2\CH17_REWRITE.md
```

결과: 출력 없음. v1 템플릿 반복 문구와 무관 공식문서 힌트는 남아 있지 않다.

```powershell
rg -n "DATA\(|@DATA|@\w|VALUE #|NEW |FINAL\(|\+=|\|.*\{|SELECT .*@|,\s*\w+\s+FROM" reference\codex_0625_v2\CH17_REWRITE.md
```

결과: 출력 없음. 주요 modern ABAP 금지 패턴은 발견되지 않았다.

```powershell
rg -n "^## CH17-L[0-9][0-9]" reference\codex_0625_v2\CH17_REWRITE.md
```

결과: CH17-L01부터 CH17-L10까지 10개 레슨 heading이 모두 존재한다.

```powershell
rg -n "셀 색상|이벤트|편집|do_sum|합계|CH21|CH27|CH28|\[선행 사용\]|TYPE REF TO|CREATE OBJECT" reference\codex_0625_v2\CH17_REWRITE.md
```

결과: `TYPE REF TO`, `CREATE OBJECT`, `[선행 사용]`은 의도적으로 등장한다. 셀 색상, 이벤트, 편집, 합계 관련 문구는 구현 코드가 아니라 후속 챕터 경계 설명 또는 제외 과제 문맥으로만 등장한다.

## 8. 잔여 리스크와 다음 단계

- `CH17_REWRITE.md`는 반영 전 원고다. 실제 `content/abap/CH17`로 옮길 때는 front matter, `::embed` 연결, 금지 HTML 요소를 별도로 검증해야 한다.
- 기존 `CH17-L07-S01`, `CH17-L10-S01` embed에는 `Σ 합계` 버튼이 보인다. CH17_REWRITE에서는 합계를 CH17 과제로 확장하지 않았으므로, 실제 반영 시 해당 버튼을 제거하거나 "ALV 기본 툴바 맛보기"로 명확히 낮춰야 한다.
- ALV Grid 세부 API는 ABAP 키워드 문서보다 Class Builder와 SAP GUI ALV 문서 성격이 강하다. 실제 개발 실습 전에는 대상 시스템의 `CL_GUI_ALV_GRID`, `LVC_T_FCAT`, `LVC_S_LAYO`, `DISVARIANT`, `LVC_S_STBL` 가용성을 SE24/SE11에서 확인해야 한다.
- `ZBOOKING`, `ZPERF` 필드명은 프로젝트 관통 예제 전제다. 실제 콘텐츠 반영 시 현재 DDIC 실습 테이블 정의와 필드명을 맞춰야 한다.
- L10 통합 예제는 교육용으로 FORM을 잘게 나눴다. 실제 코딩 표준이 class-based 구조를 요구하는 프로젝트라면 CH20 이후 별도 리팩터링 대상으로 둔다.

## 9. 최종 판정

CH17 v2는 `00_QUALITY_REVIEW.md`의 재작업 판정에 맞춰 v1의 템플릿 반복을 제거했고, 10개 레슨을 Grid ALV 입문자가 화면 조립 순서와 확인 방법을 이해할 수 있는 강의 원고로 재작성했다. 공식문서 근거는 수동 확인으로 제한했고, R15 게이팅과 classic-first 경계를 지켰다.

판정: 통과.
