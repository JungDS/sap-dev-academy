# CH16_QA - codex_0629_v3 검수

## 1. 작업 범위

| 항목 | 결과 |
| --- | --- |
| 대상 챕터 | CH16 - Screen Programming / Dynpro 기초 |
| 입력 소스 | `content/abap/CH16/_chapter.md`, `CH16-L01.md`부터 `CH16-L08.md` |
| 산출물 | `reference/codex_0629_v3/CH16_REWRITE.md`, `reference/codex_0629_v3/CH16_QA.md` |
| 작업 방식 | v3 기준 신규 재집필. v2는 보조 품질 기준으로만 사용 |
| 판정 | 완료 |

## 2. 소스 커버리지

| 원본 파일 | 반영 위치 | 반영 상태 |
| --- | --- | --- |
| `_chapter.md` | 전체 설계, CH16 도입 | 반영 |
| `CH16-L01.md` | L01 Module Pool 구조, PBO/PAI 두 박자 | 반영 |
| `CH16-L02.md` | L02 screen number, Screen Painter, Flow Logic | 반영 |
| `CH16-L03.md` | L03 화면 요소와 변수 연결, Dropdown/VRM | 반영 |
| `CH16-L04.md` | L04 PBO, `LOOP AT SCREEN`, `MODIFY SCREEN` | 반영 및 작성형 교정 |
| `CH16-L05.md` | L05 PAI, OK_CODE, BACK/EXIT/CANCEL, LEAVE | 반영 |
| `CH16-L06.md` | L06 PF-STATUS, TITLEBAR, EXCLUDING | 반영 |
| `CH16-L07.md` | L07 Custom Control, Container, Tabstrip, Subscreen, Status Icon | 반영 |
| `CH16-L08.md` | L08 예매 입력 화면 통합 실습 | 반영 |

## 3. 공식 문서 수동 확인

Classic ABAP 문서는 `C:\ABAP_DOCU_HTML`에서 직접 확인했다. CH16은 selection screen 문서가 아니라 Dynpro 문서군을 근거로 삼아야 하므로, 파일명을 수동으로 확인했다.

| 확인 파일 | 확인 내용 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros.htm` | General Dynpro 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_processing.htm` | Dynpro flow와 Dynpro sequence 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_dynpro_statements.htm` | Flow Logic statement 문서 확인 |
| `C:\ABAP_DOCU_HTML\dynpprocess.htm` | `PROCESS BEFORE OUTPUT`, `PROCESS AFTER INPUT` 문서 확인 |
| `C:\ABAP_DOCU_HTML\dynpmodule.htm` | Flow Logic의 `MODULE` 호출 문서 확인 |
| `C:\ABAP_DOCU_HTML\abapmodule.htm` | ABAP dialog module `MODULE ... OUTPUT|INPUT` 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_fields.htm` | Dynpro field와 program data object 연결 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpro_user_actions.htm` | user action, function code, OK field, `sy-ucomm` 관련 문서 확인 |
| `C:\ABAP_DOCU_HTML\abaploop_at_screen.htm` | `LOOP AT SCREEN INTO wa` 작성형 확인 |
| `C:\ABAP_DOCU_HTML\abapmodify_screen.htm` | `MODIFY SCREEN FROM wa` 작성형 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpro_modify_screens_dyn.htm` | dynamic screen modification 문서 확인 |
| `C:\ABAP_DOCU_HTML\abapset_pf-status_dynpro.htm` | Dynpro의 `SET PF-STATUS`, `EXCLUDING` 문서 확인 |
| `C:\ABAP_DOCU_HTML\abapset_titlebar_dynpro.htm` | Dynpro의 `SET TITLEBAR` 실제 파일명 확인 |
| `C:\ABAP_DOCU_HTML\abapleave_screen.htm` | `LEAVE SCREEN`, `LEAVE TO SCREEN` 문서 확인 |
| `C:\ABAP_DOCU_HTML\abapleave_program.htm` | `LEAVE PROGRAM` 종료 의미 확인 |
| `C:\ABAP_DOCU_HTML\abapset_screen.htm` | `SET SCREEN`이 next screen 지정임을 확인 |
| `C:\ABAP_DOCU_HTML\abendynpro_custom_controls.htm` | Custom Control 문서 확인 |
| `C:\ABAP_DOCU_HTML\abendynp_tabstrip.htm` | Tabstrip 문서 확인 |
| `C:\ABAP_DOCU_HTML\abapcontrols_tabstrip.htm` | `CONTROLS ... TYPE TABSTRIP` 문서 확인 |
| `C:\ABAP_DOCU_HTML\abendynp_subscreen.htm` | Subscreen 문서 확인 |
| `C:\ABAP_DOCU_HTML\dynpcall_customer_subscreen.htm` | customer subscreen 문서는 obsolete 경로임을 확인하고 본문 근거에서 제외 |
| `C:\ABAP_DOCU_HTML\abendynp_table_controls.htm` | Table Control 존재 확인. 커리큘럼 결정에 따라 CH16 본문에서는 제외 |

확인 중 교정한 파일명:

- `abapset_titlebar.htm`가 아니라 `abapset_titlebar_dynpro.htm`를 사용했다.
- `abendynpro_subscreens.htm`가 아니라 `abendynp_subscreen.htm`를 사용했다.

## 4. v2 품질 이슈 반영

| v2 검수에서 중요했던 항목 | v3 처리 |
| --- | --- |
| selection screen 문서와 일반 IF/CASE 문서가 Dynpro 근거처럼 섞일 위험 | 공식 근거를 Dynpro 문서군으로 제한 |
| `LOOP AT SCREEN` 짧은 내장 work area 예제 위험 | 모든 예제에서 `DATA gs_screen TYPE screen`, `LOOP AT SCREEN INTO gs_screen`, `MODIFY SCREEN FROM gs_screen` 형태 사용 |
| OK_CODE와 `sy-ucomm` 처리 압축 | OK_CODE를 보조 변수에 복사하고 clear한 뒤 `CASE` 분기하는 패턴으로 확장 |
| `LEAVE` 문장 차이 부족 | `LEAVE TO SCREEN 0`, `LEAVE SCREEN`, `LEAVE PROGRAM`, `SET SCREEN`을 표로 비교 |
| PF-STATUS와 PAI command 불일치 위험 | PF-STATUS function code와 PAI `CASE` 값 매칭을 체험 설계에 포함 |
| Custom Control에서 OO 문법 선행 사용 위험 | `TYPE REF TO`, `CREATE OBJECT`를 CH20 이전 선행 사용으로 명시 |
| Table Control 확장 위험 | 공식 문서 존재는 확인하되 CH16 범위에서 제외하고 CH17 Grid ALV로 연결 |

## 5. R15 게이팅 점검

| 항목 | 판정 |
| --- | --- |
| classic-first 유지 | 통과 |
| modern syntax 본문 예제 배제 | 통과 |
| modern SQL host marker 배제 | 통과 |
| ABAP Cloud, Clean Core로 범위 확장 없음 | 통과 |
| 데이터 생성/변경/저장 실습 없음 | 통과 |
| Lock, LUW, transaction 심화 없음 | 통과 |
| Table Control 제외 | 통과 |
| CH17 Grid ALV 구현 침범 없음 | 통과 |
| CH20 OO 문법은 선행 사용으로만 표시 | 통과 |

## 6. 체험형 학습 설계 점검

| 레슨 | 체험 설계 | 상태 |
| --- | --- | --- |
| L01 | PBO/PAI 두 박자 타임라인 | 통과 |
| L02 | Screen Painter 연결 점검판 | 통과 |
| L03 | Dynpro 요소와 변수 모니터 | 통과 |
| L04 | PBO 화면 준비 스텝퍼 | 통과 |
| L05 | OK_CODE 안전 분기 실험실 | 통과 |
| L06 | Toolbar와 Function Code 매핑판 | 통과 |
| L07 | 화면 분할과 컨테이너 설계판 | 통과 |
| L08 | 예매 입력 Dynpro 통합 시뮬레이터 | 통과 |

## 7. 자동 검색 검수 기록

작성 후 다음 항목을 검사한다.

| 검사 항목 | 기대 결과 |
| --- | --- |
| whitespace와 patch 정합성 | 출력 없음 |
| R15 이전 modern 문법 혼입 | 출력 없음 |
| string template 오탐 가능성 | 출력 없음 |
| CH24 이전 데이터 변경문 혼입 | 출력 없음 |
| Grid ALV 구현 클래스 혼입 | 출력 없음 |
| v2 템플릿성 문구 반복 | 출력 없음 |
| `LOOP AT SCREEN` 짧은 작성형 | 출력 없음 |

검수 의도:

- CH18 이전 modern syntax 혼입 방지.
- CH24 이전 데이터 생성/변경/트랜잭션 제어 혼입 방지.
- CH17 Grid ALV 구현을 CH16에서 앞당기지 않기.
- `LOOP AT SCREEN INTO`와 `MODIFY SCREEN FROM` 작성형 유지.
- 반복 템플릿 문구와 자동 공식문서 힌트 제거.

## 8. 잔여 리스크

- Dynpro는 실제 SAP GUI와 Screen Painter가 필요한 주제라 Markdown 원고만으로는 실습 환경 의존성이 있다.
- `VRM_SET_VALUES`, `CL_GUI_CUSTOM_CONTAINER`, PF-STATUS, TITLEBAR는 시스템 객체와 화면 객체가 준비되어야 실제 활성화된다.
- `Z_CONCERT`, `ZPERF`, `ZBOOKING`, `ZMC_CONCERT` 등 예시는 이전 챕터의 교육용 모델과 연결되어야 한다.
- `TYPE REF TO`, `CREATE OBJECT`는 CH20 이전 선행 사용이다. 본문에서 객체지향 설명으로 확장하지 않도록 주의해야 한다.

## 9. 최종 판정

CH16 v3 원고는 원본 8개 레슨을 모두 반영했고, Module Pool과 Dynpro의 PBO/PAI 흐름을 입문자 기준으로 재구성했다. 공식문서 근거는 Dynpro 문서군으로 수동 확인했고, OK_CODE 복사 후 clear, `LEAVE` 문장 차이, PF-STATUS와 command 매핑, Custom Control과 CH17 연결, Table Control 제외 경계를 명확히 했다.

판정: 통과.
