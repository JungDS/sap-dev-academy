# NEWCH31_OLDCH28_QA - Editable Grid ALV와 입력 검증

## 최종 판정

PASS. `content/abap/CH28`의 여섯 레슨을 v3 파일명 규칙에 맞춰 `NEWCH31_OLDCH28_REWRITE.md`로 재집필했다. 이번 장은 `fieldcat edit`만 설명하지 않고, `register_edit_event`, `data_changed`, `data_changed_finished`, `CL_ALV_CHANGED_DATA_PROTOCOL`, Cell Style, 저장 전 `check_changed_data`, DML/LUW 경계까지 하나의 입력 트랜잭션 흐름으로 보강했다.

감사표에서 CH21, CH24, CH25, CH26이 CH28로 넘긴 editable grid 검증/저장 항목을 회수했다. NEWCH30은 ALV 클릭/버튼 이벤트, NEWCH31은 ALV 입력/변경 이벤트로 역할을 분리했다.

## 입력 자료

| 구분 | 확인 내용 |
|---|---|
| 원본 챕터 | `content/abap/CH28/_chapter.md`, `CH28-L01.md` ~ `CH28-L06.md` |
| v2 보조 자료 | `reference/codex_0625_v2/CH28_REWRITE.md`, `CH28_QA.md` |
| v3 감사 기준 | `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md` |
| 프로젝트 키워드 감사 | `.project-docs/11_KEYWORD_AUDIT.md` CH28 메모 |
| Track 2 체험물 메모 | `.project-docs/TRACK2_ENRICHMENT.md` CH28 editable-grid 6모드 |
| 기존 임베드 | `embeds/abap/CH28-L01-S01.html` ~ `CH28-L06-S01.html` |

## 레슨별 반영 점검

| v3 레슨 | 원본 | 보강 결과 | 판정 |
|---|---|---|---|
| NEWCH31-L01 | CH28-L01 Editable Field Catalog 설정 | Field Catalog `edit`, 키/계산 컬럼 보호, `SET HANDLER`, `register_edit_event`, `mc_evt_modified`, `mc_evt_enter`, edit와 저장의 차이 반영 | PASS |
| NEWCH31-L02 | CH28-L02 DATA_CHANGED Event | `data_changed`, `er_data_changed`, `mt_good_cells`, 숫자 변환 실패, 범위 검증, `add_protocol_entry` 흐름 반영 | PASS |
| NEWCH31-L03 | CH28-L03 DATA_CHANGED_FINISHED Event | 검증과 후처리 차이, `e_modified`, 파생값 재계산, `refresh_table_display` stable 옵션 반영 | PASS |
| NEWCH31-L04 | CH28-L04 Cell Style 기반 입력 제어 | `LVC_T_STYL`, `stylefname`, `mc_style_disabled`, `mc_style_enabled`, fieldcat edit과 cell style 책임 분리, UI 잠금과 보안 경계 반영 | PASS |
| NEWCH31-L05 | CH28-L05 Grid 입력값 검증과 오류 표시 | `CL_ALV_CHANGED_DATA_PROTOCOL`, `add_protocol_entry`, `display_protocol`, 셀 위치 기반 오류 UX, 메시지 구체성 반영 | PASS |
| NEWCH31-L06 | CH28-L06 변경 데이터 DB 반영 전 검증 | `check_changed_data`, 마지막 셀 반영, 전체 규칙 검증, Lock/권한 경계, `MODIFY`, `COMMIT WORK`, `ROLLBACK WORK` 반영 | PASS |

## 감사 회수 점검

| 감사 항목 | 이전 상태 | v3 처리 |
|---|---|---|
| CH11 ALV event/editing | CH27/CH28 예정 | event는 `NEWCH30_OLDCH27`, editing은 `NEWCH31_OLDCH28`로 회수 완료 |
| CH17 ALV event/editing | CH27/CH28 예정 | event는 NEWCH30, editable grid는 NEWCH31에서 분리 회수 |
| CH21 editable grid 검증/저장 | CH28 후속 원본 존재로 예정 회수 | `NEWCH31_OLDCH28`에서 `data_changed`, protocol, `check_changed_data`, 저장 방어선으로 회수 |
| CH24 ALV edit event 저장 | CH28 후속 원본 존재로 예정 회수 | L06에서 저장 직전 검증, DML, LUW 경계를 CH24와 연결 |
| CH25 ALV edit event | CH28 후속 원본 존재로 예정 회수 | L04/L06에서 UI 잠금과 Lock/권한 경계를 구분 |
| CH26 ALV 고급 event/editable save | CH27/CH28 예정 | event는 NEWCH30, editable save는 NEWCH31로 회수 완료 |

## Classic ABAP 공식 문서 수동 확인 내역

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| event handler method | `C:\ABAP_DOCU_HTML\abapmethods_event_handler.htm` | `METHODS ... FOR EVENT ... OF ... IMPORTING ...` 선언 |
| event registration | `C:\ABAP_DOCU_HTML\abapset_handler_instance.htm`, `abapevents.htm` | `SET HANDLER ... FOR go_grid`, event output parameter와 handler input parameter 연결 |
| DB DML | `C:\ABAP_DOCU_HTML\abapmodify_dbtab.htm` | `MODIFY dbtab`, `sy-subrc`, `sy-dbcnt` 확인 |
| LUW | `C:\ABAP_DOCU_HTML\abapcommit.htm`, `abaprollback.htm` | `COMMIT WORK` 확정, `ROLLBACK WORK` 취소 경계 |
| Message | `C:\ABAP_DOCU_HTML\abapmessage.htm` | 메시지를 presentation feedback에서 쓰되 저장 검증과 분리 |
| SAP GUI / GUI control | `C:\ABAP_DOCU_HTML\abengui_control_glosry.htm`, `abensap_gui_glosry.htm` | Classic SAP GUI ALV Grid Control 기반 장임을 명시 |

## ABAP Cloud / Clean Core 경계 확인

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| ABAP Cloud | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_CLOUD_GLOSRY.md` | ABAP Cloud는 SAP GUI 접근을 전제하지 않는다는 경계 |
| Released API | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENRELEASED_API_GLOSRY.md` | Cloud-ready 판단은 released API 기준임을 명시 |
| Classic ABAP | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENCLASSIC_ABAP_GLOSRY.md` | 이 장은 Classic ABAP/SAP GUI 화면 유지보수 역량을 위한 장으로 한정 |

## SAP Help 공식 보충 확인

`CL_GUI_ALV_GRID`의 상세 이벤트와 메서드는 ABAP Keyword Documentation이 아니라 ALV Grid Control API 영역이므로 SAP Help Portal 공식 문서로 보충했다.

| 범위 | 공식 URL | v3 반영 |
|---|---|---|
| ALV Grid events | `https://help.sap.com/docs/SAP_NETWEAVER_700/12a9d91a6c53101489a69be2cd91f0df/22a3f5f5d2fe11d2b467006094192fe3.html` | `data_changed`, `data_changed_finished`가 ALV Grid Control 이벤트라는 경계 |
| ALV Grid methods | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/70396d7dec4c4f19b9ca3b2e47559d12/22a3f5ecd2fe11d2b467006094192fe3.html?locale=en-US` | `CL_GUI_ALV_GRID` 메서드가 SAP GUI ALV Grid Control API라는 경계 |
| edit event registration | `https://help.sap.com/docs/SUPPORT_CONTENT/abap/3353523611.html` | `REGISTER_EDIT_EVENT`, `mc_evt_modified`, `mc_evt_enter`, `CHECK_CHANGED_DATA` 흐름 보강 |
| changed value example | `https://help.sap.com/docs/SUPPORT_CONTENT/abap/3353523879.html` | `REGISTER_EDIT_EVENT`, handler receiver, changed value 확인 흐름 보강 |
| Cell style / stylefname | `https://help.sap.com/docs/SAP_NETWEAVER_740/70396d7dec4c4f19b9ca3b2e47559d12/4eb7ce9ab5c52138e10000000a42189d.html?version=7.4.26` | `LVC_T_STYL`, output row style table, layout `stylefname` 흐름 보강 |
| Refreshing display | `https://help.sap.com/docs/SAP_NETWEAVER_700/10a3e8bd6c5310149e49f2842aea724a/493e093c347d3ef0e10000000a421937.html` | 변경 확인 뒤 화면 refresh와 안정성 주의 |

## R15 및 classic-first 점검

| 항목 | 점검 |
|---|---|
| OO 이벤트 문법 | CH20 이후이므로 `FOR EVENT`, `SET HANDLER`, handler class 사용 가능 |
| ALV 기초 | CH17/CH21 이후이므로 `CL_GUI_ALV_GRID`, Field Catalog, Layout, refresh 개념 사용 가능 |
| ALV event 분리 | NEWCH30은 클릭/버튼 이벤트, NEWCH31은 입력 변경 이벤트로 역할을 분리 |
| New Syntax | CH18 이후라 `VALUE #( row = abap_true col = abap_true )`, inline `DATA`는 허용하되, L04 style 결정은 감사 지적에 맞춰 `IF`로 설명 |
| DML/LUW | CH24 이후이므로 `MODIFY`, `COMMIT WORK`, `ROLLBACK WORK` 연결 가능 |
| Lock/권한 | CH25 이후이므로 저장 전 경계로 연결하되 Lock 설계 자체를 새로 확장하지 않음 |
| ABAP Cloud | RAP/Fiori validation으로 대체하지 않고 Classic SAP GUI ALV 경계로 안내 |
| 후속 장 경계 | Enhancement/BAdI, Gateway, RAP, Fiori 입력 검증은 이후 장 또는 다른 트랙 주제로 남김 |

## 체험형 학습 설계 점검

| 레슨 | 체험 설계 |
|---|---|
| NEWCH31-L01 | 표시 전용/SEATS만 편집/전체 편집 위험, 이벤트 등록 끄기, Field Catalog 상태 패널 |
| NEWCH31-L02 | 정상값/범위 밖/문자/빈칸 입력 버튼, `mt_good_cells` 로그, protocol 오류 상태 |
| NEWCH31-L03 | 입력 중/검증 통과/변경 완료/합계 갱신 단계, `e_modified`와 stable refresh 비교 |
| NEWCH31-L04 | 판매 중/매진/정산 완료 토글, `CELLSTYLES` 테이블, `stylefname` 누락 진단 |
| NEWCH31-L05 | 오류 셀, 오류 목록, 메시지 변수, 저장 가능 여부 패널 |
| NEWCH31-L06 | 화면 값/내부 테이블 값/DB 예정 값 비교, `check_changed_data`, 전체 검증, DML/LUW 단계 로그 |

## 기계 점검 기준

작성 후 다음 항목으로 검증한다.

| 점검 | 기대값 |
|---|---|
| 레슨 헤더 | `NEWCH31-L01` ~ `NEWCH31-L06` 모두 존재 |
| 핵심 edit 설정 | `fieldcat`, `edit`, `register_edit_event`, `mc_evt_modified`, `mc_evt_enter` 존재 |
| 핵심 이벤트 | `data_changed`, `data_changed_finished`, `er_data_changed`, `mt_good_cells`, `e_modified` 존재 |
| 오류 프로토콜 | `CL_ALV_CHANGED_DATA_PROTOCOL`, `add_protocol_entry`, `display_protocol` 존재 |
| Cell Style | `LVC_T_STYL`, `stylefname`, `mc_style_disabled`, `mc_style_enabled` 존재 |
| 저장 전 검증 | `check_changed_data`, `MODIFY`, `COMMIT WORK`, `ROLLBACK WORK` 존재 |
| 경계 | RAP/Fiori/Enhancement를 본문 핵심 구현으로 끌어오지 않음 |
| 문서 품질 | Markdown fence 균형, trailing whitespace 없음, `git diff --check` 통과 |

## 남은 리스크

이 산출물은 reference 재작성 문서이며 실제 `content/abap/CH28` 파일과 embed 구현은 수정하지 않았다. `CL_GUI_ALV_GRID`의 editable behavior는 SAP GUI 버전, grid readiness, field catalog, layout, event registration, screen PAI 흐름, selection mode에 따라 세부 동작이 달라질 수 있다.

실제 교육 페이지로 이식할 때는 대상 시스템에서 `CL_GUI_ALV_GRID`, `REGISTER_EDIT_EVENT`, `CHECK_CHANGED_DATA`, `CL_ALV_CHANGED_DATA_PROTOCOL`, Cell Style, Lock/Authorization, DB update/commit 정책을 다시 검증해야 한다.
