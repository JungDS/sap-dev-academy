# CH16_QA - codex_0625_v2 재작업 검수

> 대상 파일: `reference/codex_0625_v2/CH16_REWRITE.md`
> 판정: CH16 v2 기준 원고는 재작업 준비 산출물로 통과 대상. 실제 `content/abap/CH16` 반영과 신규 embed 구현은 아직 수행하지 않았다.

## 1. 재작업 판정 반영

`reference/codex_0625/00_QUALITY_REVIEW.md`는 v1 산출물이 완성 강의자료가 아니라 반복 템플릿형 보강안에 가깝다고 판정했다. CH16 v1도 레슨마다 비슷한 도입/학습수단/공식문서 힌트가 반복되었고, Dynpro 장인데도 selection screen 또는 일반 조건문 문서가 공식 근거처럼 섞였다.

v2에서는 다음 방식으로 처리했다.

| 항목 | v1 문제 | v2 처리 |
| --- | --- | --- |
| 템플릿 반복 | 레슨마다 유사한 보강 지시문 반복 | 8개 레슨을 각각 실제 강의 원고로 재작성 |
| 강의 흐름 | "화면 요소를 설명한다" 수준으로 압축 | 왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 체험 설계 -> 실수와 주의 -> 정리 흐름으로 확장 |
| 공식 문서 | selection screen/일반 문법 문서가 자동 힌트로 혼입 | `C:\ABAP_DOCU_HTML`의 Dynpro 문서군을 수동 확인 |
| 정확도 | `sy-ucomm`, OK_CODE, LEAVE 문장 차이가 짧게 처리됨 | OK_CODE 보조 변수 저장, `CLEAR ok_code`, `LEAVE`/`SET SCREEN` 차이를 공식문서 기준으로 보강 |
| classic-first | `CREATE OBJECT`가 OO 선노출로 오해될 위험 | `TYPE REF TO`/`CREATE OBJECT`를 CH20 전 `[선행 사용]` 블랙박스로 제한 |
| R15 경계 | Table Control, DB 저장, 복잡한 다중 화면으로 확장될 위험 | Table Control 제외, CH17 ALV로 연결, DML/lock/LUW는 CH24~25로 분리 |

## 2. 소스 커버리지

현재 authoritative scope는 `content/abap/CH16`의 8개 레슨이다.

| 원본 | v2 반영 위치 | 확인 |
| --- | --- | --- |
| `CH16/_chapter.md` | "CH16 전체 설계", "CH16 마무리 학습 흐름" | 반영 |
| `CH16-L01.md` | `## CH16-L01 - Module Pool 프로그램 구조` | 반영 |
| `CH16-L02.md` | `## CH16-L02 - Screen Number와 Screen Painter` | 반영 |
| `CH16-L03.md` | `## CH16-L03 - 화면 요소: 입력, 버튼, 체크박스, 라디오, 드롭다운` | 반영 |
| `CH16-L04.md` | `## CH16-L04 - PBO 처리 흐름` | 반영 |
| `CH16-L05.md` | `## CH16-L05 - PAI 처리 흐름: OK_CODE와 화면 떠나기` | 반영 |
| `CH16-L06.md` | `## CH16-L06 - PF-STATUS와 TITLEBAR` | 반영 |
| `CH16-L07.md` | `## CH16-L07 - Custom Control, Container, Tabstrip, Subscreen, Status Icon` | 반영 |
| `CH16-L08.md` | `## CH16-L08 - 실습: 예매 입력 화면 만들기` | 반영 |

## 3. 공식 문서 수동 근거

CH16_REWRITE에는 아래 문서를 수동 근거로 남겼다.

| 문서 | 사용 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros.htm` | Dynpro 정의, layout/flow logic, PBO/PAI, classic dynpro 경계 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_processing.htm` | transaction code 또는 `CALL SCREEN`으로 시작되는 dynpro sequence와 next dynpro 0 의미 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_dynpro_statements.htm` | Screen Painter Flow Logic 문장군 확인 |
| `C:\ABAP_DOCU_HTML\dynpprocess.htm` | `PROCESS BEFORE OUTPUT`, `PROCESS AFTER INPUT` event block 확인 |
| `C:\ABAP_DOCU_HTML\dynpmodule.htm` | Flow Logic의 `MODULE` 호출 문장과 ABAP `MODULE` 정의문 구분 확인 |
| `C:\ABAP_DOCU_HTML\abapmodule.htm` | ABAP dialog module `MODULE ... OUTPUT|INPUT` 정의 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_fields.htm` | dynpro field와 같은 이름의 ABAP global data object 사이 data transport 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_screen.htm` | 주요 screen element와 OK field 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpro_user_actions.htm` | function code, OK field, `sy-ucomm`, OK_CODE clear 권장 패턴 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_listbox.htm` | Dropdown Listbox와 `VRM_SET_VALUES`, F4와의 차이 확인 |
| `C:\ABAP_DOCU_HTML\abaploop_at_screen.htm` | `LOOP AT SCREEN INTO wa`와 obsolete short form 회피 확인 |
| `C:\ABAP_DOCU_HTML\abapmodify_screen.htm` | `MODIFY SCREEN FROM wa` 사용 위치와 PBO 의미 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpro_modify_screens_dyn.htm` | `screen-input`, `screen-invisible`, `screen-active` 관계 확인 |
| `C:\ABAP_DOCU_HTML\abapset_pf-status_dynpro.htm` | `SET PF-STATUS`, `EXCLUDING`, PBO 설정 기준 확인 |
| `C:\ABAP_DOCU_HTML\abapset_titlebar_dynpro.htm` | `SET TITLEBAR ... WITH`, `sy-title` 확인 |
| `C:\ABAP_DOCU_HTML\abapleave_screen.htm` | `LEAVE SCREEN`, `LEAVE TO SCREEN dynnr`, `LEAVE TO SCREEN 0` 확인 |
| `C:\ABAP_DOCU_HTML\abapleave_program.htm` | `LEAVE PROGRAM` 종료 의미 확인 |
| `C:\ABAP_DOCU_HTML\abapset_screen.htm` | `SET SCREEN`은 next dynpro만 지정하고 즉시 processing을 끊지 않음을 확인 |
| `C:\ABAP_DOCU_HTML\abendynpro_custom_controls.htm` | Custom Control과 `CL_GUI_CUSTOM_CONTAINER` 연결 확인 |
| `C:\ABAP_DOCU_HTML\abendynp_subscreen.htm`, `dynpcall.htm` | Subscreen area, `CALL SUBSCREEN`, 자체 OK field 없음 확인 |
| `C:\ABAP_DOCU_HTML\abendynp_tabstrip.htm`, `abapcontrols_tabstrip.htm` | Tabstrip, `activetab`, subscreen 연결 확인 |
| `C:\ABAP_DOCU_HTML\abendynpro_status_icons.htm` | Status Icon placeholder와 icon/text/tooltip 확인 |
| `C:\ABAP_DOCU_HTML\abendynp_table_controls.htm` | Table Control 존재와 복잡도를 확인하되 CH16 범위에서 제외 |

무관 문서 배제:

- `PARAMETERS`와 `SELECT-OPTIONS` 문서는 CH16 Dynpro 근거로 사용하지 않았다.
- 일반 `IF`, `CASE` 문서는 CH16 공식문서 근거로 남기지 않았다.

## 4. 공식문서 기반 교정 사항

가장 중요한 교정은 OK_CODE 처리와 classic Dynpro 경계다.

| 항목 | v2 판정 |
| --- | --- |
| Dynpro | screen layout, attributes, flow logic을 가진 ABAP program component |
| Module Pool | T-code와 시작 dynpro를 통해 실행되는 화면 중심 program 구조 |
| PBO | 화면 표시 전 준비. GUI status, title, dropdown, screen 속성 제어 |
| PAI | 사용자 action 후 처리. OK_CODE 저장, clear, branch |
| OK_CODE | `sy-ucomm`보다 화면 OK field를 ABAP 변수로 받아 보조 변수에 저장 후 `CLEAR`하는 패턴을 기본으로 설명 |
| `SET SCREEN` | next dynpro 지정. 현재 processing을 즉시 끊지 않음 |
| `LEAVE TO SCREEN 0` | dynpro sequence 종료 흐름 |
| `LEAVE PROGRAM` | 프로그램 전체 종료 |
| Table Control | 공식문서에는 있으나 현재 커리큘럼에서는 제외. CH17 ALV로 대체 |

추가 교정:

- `LOOP AT SCREEN.`과 `MODIFY SCREEN.` 짧은 형식은 새 코드 예제로 쓰지 않았다.
- Dropdown은 F4 검색 팝업이 아니라 작은 고정 목록 UI로 설명했다.
- `TYPE REF TO`/`CREATE OBJECT`는 CH20 전 선행 사용으로 명시했다.
- Custom Control은 내용 자체가 아니라 container/control을 붙이는 화면 영역이라고 설명했다.
- Tabstrip은 tab title, function code, `activetab`, subscreen area의 연결 구조로 설명했다.
- L08의 통합 예제는 교육용으로 Flow Logic과 ABAP module을 한 코드 블록에 함께 보여 준다고 명시했다.

## 5. R2 체험 장치 점검

| 레슨 | 코드 있음 | 체험 설계 | 판정 |
| --- | --- | --- | --- |
| L01 | 없음/흐름 중심 | PBO/PAI 두 박자 타임라인, 기존 `CH16-L01-S01` 활용 | 통과 |
| L02 | 있음 | Screen Painter 연결 지도, layout/element/flow/source 매칭 | 통과 |
| L03 | 있음 | 화면 요소와 변수 모니터, 기존 `CH16-L03-S01` 활용 | 통과 |
| L04 | 있음 | PBO 화면 준비 스텝퍼, `MODIFY SCREEN` 반영 비교 | 통과 |
| L05 | 있음 | OK_CODE 안전 분기 실험실, clear 생략 실패 케이스 | 통과 |
| L06 | 있음 | Toolbar와 Function Code 매핑판, PF-STATUS/PAI branch 비교 | 통과 |
| L07 | 있음 | 화면 분할과 컨테이너 설계판, Custom Control/Tabstrip/Subscreen 상태 | 통과 |
| L08 | 있음 | 예매 입력 Dynpro 통합 시뮬레이터, PBO/PAI/message/종료 흐름 | 통과 |

모든 코드 포함 레슨은 버튼, 상태, 데이터, 실패 피드백을 가진 체험 설계로 연결된다.

## 6. Classic-first 및 R15 범위 검사

수동 점검 기준:

- ABAP 예제에는 inline declaration을 넣지 않았다.
- constructor expression `VALUE #`, object creation expression `NEW`, string template을 넣지 않았다.
- modern Open SQL host marker와 comma field list를 넣지 않았다.
- `LOOP AT SCREEN` 예제는 `TYPE screen` work area와 `INTO`, `FROM` 형태로 작성했다.
- `TYPE REF TO`와 `CREATE OBJECT`는 CH20 전 `[선행 사용]`으로 명시했다.
- 실제 DB 저장, `INSERT`, `COMMIT WORK`, lock object는 CH24~25로 분리했다.
- Table Control은 설명 대상에서 제외하고 CH17 Grid ALV로 연결했다.
- SAPUI5/Web Dynpro/Fiori는 classic Dynpro의 현대 대안으로만 언급하고 코드나 구현으로 확장하지 않았다.

## 7. 자동 검색 결과

최종 파일 작성 후 아래 자동 검색을 실행했다.

```powershell
rg -n "도입 불편|단순히 실행되는 예제|필요 학습수단|공식 문서 체크 힌트|abapparameters\.htm|abapselect-options\.htm|abapif\.htm|abapcase\.htm" reference\codex_0625_v2\CH16_REWRITE.md
```

결과: 출력 없음. v1 템플릿 반복 문구와 무관 공식문서 힌트는 남아 있지 않다.

```powershell
rg -n "DATA\(|@DATA|@\w|VALUE #|NEW |FINAL\(|\+=|\|.*\{|SELECT .*@|,\s*\w+\s+FROM" reference\codex_0625_v2\CH16_REWRITE.md
```

결과: 출력 없음. 주요 modern ABAP 금지 패턴은 발견되지 않았다.

```powershell
rg -n "## CH16-L[0-9][0-9]" reference\codex_0625_v2\CH16_REWRITE.md
```

결과: CH16-L01부터 CH16-L08까지 8개 레슨 heading이 모두 존재한다.

주의: `TYPE REF TO`와 `CREATE OBJECT` 문자열은 CH20 전 선행 사용으로 의도적으로 등장한다. QA상 위반이 아니라 R15 경계 표기 대상이다.

## 8. 잔여 리스크와 다음 단계

- `CH16_REWRITE.md`는 반영 전 원고다. 실제 `content/abap/CH16`으로 옮길 때는 MD fragment front matter, embed 연결, 금지 HTML 요소를 별도로 검증해야 한다.
- L08 통합 예제는 학습 편의를 위해 Flow Logic과 ABAP module을 한 코드 블록에 함께 보여 준다. 실제 콘텐츠 반영 시에는 Screen Painter Flow Logic과 ABAP source 위치를 더 명확히 시각적으로 분리하는 편이 좋다.
- `VRM_SET_VALUES`, `CL_GUI_CUSTOM_CONTAINER`는 시스템 릴리스와 패키지 가용성에 따라 실습 환경 준비가 필요하다.
- Custom Control 이후 실제 ALV Grid 구현은 CH17 산출물과 표현을 맞춰야 한다.

## 9. 최종 판정

CH16 v2는 `00_QUALITY_REVIEW.md`의 재작업 판정에 맞춰 v1의 템플릿 반복을 제거했고, 8개 레슨을 Dynpro 입문자가 실제 화면 흐름을 이해할 수 있는 강의 원고로 재작성했다. 공식문서 근거는 수동 확인으로 제한했고, R15 게이팅과 classic-first 경계를 지켰다.

판정: 통과.
