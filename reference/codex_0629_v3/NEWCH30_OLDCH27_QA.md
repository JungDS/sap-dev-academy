# NEWCH30_OLDCH27_QA - ALV 고급 Event 응용

## 최종 판정

PASS. `content/abap/CH27`의 다섯 레슨을 v3 파일명 규칙에 맞춰 `NEWCH30_OLDCH27_REWRITE.md`로 재집필했다. 감사표에서 CH21/CH26이 CH27로 넘긴 ALV double click, hotspot, toolbar, user command 회수 항목을 반영했고, OLDCH28 editable grid와의 경계를 유지했다.

이번 장은 v2를 보조 자료로 참고했지만 v3 번호 체계와 현재 감사 흐름에 맞춰 다시 구성했다. 핵심은 다음 세 가지다.

1. `FOR EVENT`와 `SET HANDLER`의 차이를 입문자 기준으로 반복 확인하게 했다.
2. `toolbar`는 버튼 생성, `user_command`는 버튼 클릭 후 명령 처리라는 시점 차이를 명확히 했다.
3. `data_changed` 등 editable grid 이벤트는 다음 장으로 미루고, NEWCH30은 클릭/버튼 이벤트에 집중했다.

## 입력 자료

| 구분 | 확인 내용 |
|---|---|
| 원본 챕터 | `content/abap/CH27/_chapter.md`, `CH27-L01.md` ~ `CH27-L05.md` |
| v2 보조 자료 | `reference/codex_0625_v2/CH27_REWRITE.md`, `CH27_QA.md` |
| v3 감사 기준 | `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md` |
| 프로젝트 키워드 감사 | `.project-docs/11_KEYWORD_AUDIT.md` CH27 메모 |
| Track 2 체험물 메모 | `.project-docs/TRACK2_ENRICHMENT.md` CH27 위젯 계획/완료 메모 |
| 기존 임베드 | `embeds/abap/CH27-L01-S01.html` ~ `CH27-L05-S01.html` |

## 레슨별 반영 점검

| v3 레슨 | 원본 | 보강 결과 | 판정 |
|---|---|---|---|
| NEWCH30-L01 | CH27-L01 Double Click Event | `double_click`, `e_row-index`, `e_column-fieldname`, `SET HANDLER`, 행 번호와 업무 키 차이, 정렬/필터 주의 반영 | PASS |
| NEWCH30-L02 | CH27-L02 Hotspot Click Event | field catalog `hotspot`, `hotspot_click`, `e_row_id`, `e_column_id`, 링크형 컬럼 UX, double click과 hotspot 차이 반영 | PASS |
| NEWCH30-L03 | CH27-L03 Toolbar Event | `toolbar` 이벤트, `e_object->mt_toolbar`, `function = 'ZCANCEL'`, 버튼 생성과 업무 실행 시점 분리 반영 | PASS |
| NEWCH30-L04 | CH27-L04 USER_COMMAND 처리 | `user_command`, `e_ucomm`, `get_selected_rows`, 선택 없음 처리, `refresh_table_display`, DML/Lock 경계 반영 | PASS |
| NEWCH30-L05 | CH27-L05 Handler Class 설계 | 핸들러 클래스, 생성자 `SET HANDLER`, 이벤트 배선판, handler/controller/service 책임 분리, Cloud/RAP 경계 반영 | PASS |

## 감사 회수 점검

| 감사 항목 | 이전 상태 | v3 처리 |
|---|---|---|
| CH21 ALV double click/hotspot/toolbar/user command | CH27 후속 원본 존재로 예정 회수 | `NEWCH30_OLDCH27`에서 본격 회수 완료 |
| CH20 ALV event | CH21 일부, CH27 예정 | CH20의 OO 이벤트 문법을 CH27 ALV Grid 이벤트로 연결 완료 |
| CH17 ALV event/editing | CH27/CH28 예정 | event 쪽은 `NEWCH30_OLDCH27`로 회수, editable grid는 OLDCH28로 유지 |
| CH26 ALV 고급 event/editable save | CH27/CH28 예정 | event 설계는 `NEWCH30_OLDCH27`, editable save는 OLDCH28에서 회수 예정 |

## Classic ABAP 공식 문서 수동 확인 내역

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| event handler method | `C:\ABAP_DOCU_HTML\abapmethods_event_handler.htm` | `METHODS ... FOR EVENT ... OF ... IMPORTING ...` 선언과 `SET HANDLER` 필요성 |
| event registration | `C:\ABAP_DOCU_HTML\abapset_handler.htm` | `SET HANDLER`가 이벤트 핸들러를 등록/해제하는 구문이라는 설명 |
| instance event registration | `C:\ABAP_DOCU_HTML\abapset_handler_instance.htm` | `SET HANDLER ... FOR oref`로 특정 raising instance에 등록하는 구조 |
| events and parameters | `C:\ABAP_DOCU_HTML\abapevents.htm`, `abapevents_parameters.htm` | 이벤트 output parameter가 handler input parameter로 이어지는 구조 |
| class and method syntax | `C:\ABAP_DOCU_HTML\abapclass_definition.htm`, `abapmethods_general.htm` | handler class의 `CLASS ... DEFINITION`, visibility, `METHODS IMPORTING` 구조 |
| SAP GUI / GUI control | `C:\ABAP_DOCU_HTML\abengui_control_glosry.htm`, `abensap_gui_glosry.htm` | `CL_GUI_ALV_GRID`가 SAP GUI/Control Framework 기반 classic 화면 기술이라는 경계 |

## ABAP Cloud / Clean Core 경계 확인

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| ABAP Cloud | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_CLOUD_GLOSRY.md` | ABAP Cloud는 ADT/RAP/released API 중심이며 SAP GUI 접근이 없다는 경계 |
| Released API | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENRELEASED_API_GLOSRY.md` | Cloud-ready 판단은 released API 기준을 따른다는 설명 |
| Classic ABAP | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENCLASSIC_ABAP_GLOSRY.md` | Classic ABAP/SAP GUI 기반 ALV 이벤트 수업임을 명확화 |

## SAP Help 공식 보충 확인

`CL_GUI_ALV_GRID`의 구체 이벤트와 메서드는 ABAP keyword 문서가 아니라 ALV Grid Control API 영역이므로 SAP Help 공식 문서로 보충했다.

| 범위 | 공식 URL | v3 반영 |
|---|---|---|
| ALV Grid events | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/70396d7dec4c4f19b9ca3b2e47559d12/22a3f5f5d2fe11d2b467006094192fe3.html` | `double_click`, `hotspot_click`, `toolbar`, `user_command`가 ALV Grid Control 이벤트임을 확인 |
| ALV Grid Control SAP GUI 환경 | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/70396d7dec4c4f19b9ca3b2e47559d12/4eb7a512999e0134e10000000a42189b.html` | 이 장이 SAP GUI ALV Grid Control 기반 classic 화면 기술이라는 경계 |
| Toolbar GUI elements | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/70396d7dec4c4f19b9ca3b2e47559d12/4eb7cbd1b5d92139e10000000a42189d.html` | toolbar에서 function code를 지정하고 user command에서 조회하는 흐름 |
| `get_selected_rows` | `https://help.sap.com/docs/SAP_NETWEAVER_700/12a9d91a6c53101489a69be2cd91f0df/0ab55312d30911d2b467006094192fe3.html` | 선택 행 조회와 row index 확인 흐름 |
| `refresh_table_display` | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/70396d7dec4c4f19b9ca3b2e47559d12/0ab5531ed30911d2b467006094192fe3.html` | 내부 데이터 변경 후 grid 표시 refresh 필요성 |

## R15 및 classic-first 점검

| 항목 | 점검 |
|---|---|
| OO 이벤트 문법 | CH20 이후이므로 `FOR EVENT`, `SET HANDLER`, handler class 사용 가능 |
| ALV 기초 | CH17/CH21 이후이므로 `CL_GUI_ALV_GRID`, field catalog, refresh 개념 사용 가능 |
| Advanced OO 설계 | OLDCH26 보강 이후이므로 handler/controller 책임 분리 설명 가능 |
| Dynamic ABAP/Regex 신규 장 영향 | NEWCH28/NEWCH29 이후 배치지만 CH27 본문에는 불필요한 동적/regex 심화를 끌어오지 않음 |
| Editable Grid | OLDCH28에서 다룰 `data_changed`, `check_changed_data`, protocol은 경계 설명만 하고 코드로 사용하지 않음 |
| ABAP Cloud | Cloud/RAP/Fiori action으로 대체 설명하지 않고 Classic SAP GUI ALV 경계로만 안내 |

## 체험형 학습 설계 점검

| 레슨 | 체험 설계 |
|---|---|
| NEWCH30-L01 | 행 더블클릭, 이벤트 로그, `e_row/e_column`, `SET HANDLER` 끄기, 정렬 적용 후 업무 키 비교 |
| NEWCH30-L02 | hotspot 토글, 일반 셀/링크 셀 클릭 차이, 클릭 컬럼/업무 키 피드백 |
| NEWCH30-L03 | toolbar 이벤트 실행, `mt_toolbar` 버튼 정의 테이블, `function` 누락 경고 |
| NEWCH30-L04 | 선택 없음/선택 있음/처리 완료 상태, `e_ucomm`, `get_selected_rows`, refresh 로그 |
| NEWCH30-L05 | 이벤트 배선판, handler 상태, business 상태, handler 해제/function 코드 변경 진단 |

## 기계 점검 기준

작성 후 다음 항목으로 검증한다.

| 점검 | 기대값 |
|---|---|
| 레슨 헤더 | `NEWCH30-L01` ~ `NEWCH30-L05` 모두 존재 |
| 핵심 이벤트 | `double_click`, `hotspot_click`, `toolbar`, `user_command` 모두 존재 |
| 핵심 문법 | `FOR EVENT`, `SET HANDLER`, `IMPORTING`, `e_ucomm` 모두 존재 |
| ALV 메서드/상태 | `get_selected_rows`, `refresh_table_display`, `e_object->mt_toolbar`, `ZCANCEL` 모두 존재 |
| 경계 | `data_changed`는 경계 설명으로만 존재하고 본문 코드에 사용하지 않음 |
| 문서 품질 | Markdown fence 균형, trailing whitespace 없음, `git diff --check` 통과 |

## 남은 리스크

이 산출물은 reference 재작성 문서이며 실제 `content/abap/CH27` 파일과 embed 구현은 수정하지 않았다. `CL_GUI_ALV_GRID`의 이벤트와 메서드는 시스템 release, GUI 상태, field catalog 설정, selection mode, layout 설정에 따라 세부 동작이 달라질 수 있다.

실제 교육 페이지로 이식할 때는 대상 시스템에서 `CL_GUI_ALV_GRID`, SAP GUI Control Framework, field catalog, toolbar event, selection mode, refresh/stable 옵션, authorization/transaction 처리 경계를 다시 맞춰야 한다.
