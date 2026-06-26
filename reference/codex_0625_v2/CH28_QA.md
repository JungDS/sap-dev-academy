# CH28_QA - Editable Grid ALV와 입력 검증

> 대상 파일: `reference/codex_0625_v2/CH28_REWRITE.md`  
> 판정 기준: `reference/codex_0625/00_QUALITY_REVIEW.md`  
> 작업 단위: CH28 단일 챕터

## 1. 최종 판정

PASS.

CH28 v1은 레슨별 진단과 보강 방향은 갖고 있었지만, 본문이 완성 강의자료라기보다 반복된 작성 지시와 짧은 요약에 가까웠다. v2에서는 L01-L06 전체를 다시 작성했고, 각 레슨마다 `왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수와 주의 -> 체험형 학습 설계 -> 정리` 흐름을 실제 강의 본문으로 구성했다.

CH28의 핵심 목표도 유지했다. 이 챕터는 editable `CL_GUI_ALV_GRID`에서 입력 가능 컬럼을 열고, 변경 이벤트를 받고, 오류를 셀 위치에 표시하고, 저장 직전에 전체 검증 후 DB 반영 여부를 결정하는 수업이다. Classic ABAP/SAP GUI 기반 설명을 유지했고, ABAP Cloud/RAP/Fiori 방식으로 대체하지 않았다.

## 2. 입력 자료 확인

| 자료 | 확인 내용 |
|---|---|
| `reference/codex_0625/00_QUALITY_REVIEW.md` | v1은 템플릿 성격이 강하므로 완성 강의자료 수준으로 재집필해야 함을 확인 |
| `reference/codex_0625/CH28_Editable-Grid-ALV와-입력-검증.md` | CH28 v1의 레슨별 부족 지점, 편집/검증/저장 흐름 강화 요구 확인 |
| `content/abap/CH28/_chapter.md` | 챕터 목표, 키워드, Track-2 고급 위치 확인 |
| `content/abap/CH28/CH28-L01.md` - `CH28-L06.md` | 원본 코드, prereq, introduces, 임베드 ID, 도전 과제 확인 |
| `embeds/abap/CH28-L01-S01.html` - `CH28-L06-S01.html` | editable-grid 엔진 모드, 조작 흐름, 로그/오류/저장 피드백 확인 |
| `.project-docs/04_CONVENTIONS.md` | R15, R6, 입문자 설명 원칙 확인 |
| `.project-docs/09_CURRICULUM_LEDGER.md` | CH28이 CH17/21/27 이후 editable grid 입력으로 배치됨을 확인 |
| `.project-docs/11_KEYWORD_AUDIT.md` | CH28 ALV 편집 API가 기존 감사에서 일치 판정된 점과 L04의 `COND` 금지 교정 이력 확인 |
| `.project-docs/TRACK2_ENRICHMENT.md` | CH28 임베드 6개와 editable-grid 모드별 학습 의도 확인 |
| `.project-docs/CONTENT_DEPTH_AUDIT.md` | CH28 L01-L06 모두 본문 빈약/흐름 압축 보강 대상임을 확인 |

## 3. 공식 문서 수동 확인

자동 키워드 매칭으로 문서 힌트를 붙이지 않고, CH28에서 필요한 ABAP 문법/트랜잭션/경계 파일을 직접 열어 확인했다.

| 로컬 공식 문서 | 반영 지점 |
|---|---|
| `C:\ABAP_DOCU_HTML\abapmethods_event_handler.htm` | `METHODS ... FOR EVENT ... OF ... IMPORTING ...` 이벤트 핸들러 선언 근거 |
| `C:\ABAP_DOCU_HTML\abapset_handler_instance.htm` | `SET HANDLER ... FOR oref` 인스턴스 이벤트 등록 근거 |
| `C:\ABAP_DOCU_HTML\abapevents.htm` | 이벤트 파라미터가 핸들러 입력 파라미터로 이어지는 구조 근거 |
| `C:\ABAP_DOCU_HTML\abapmodify_dbtab.htm` | `MODIFY dbtab`, `sy-subrc`, `sy-dbcnt`, commit 전 rollback 가능성 근거 |
| `C:\ABAP_DOCU_HTML\abapcommit.htm` | `COMMIT WORK`가 SAP LUW를 닫고 변경 요청을 확정하는 근거 |
| `C:\ABAP_DOCU_HTML\abaprollback.htm` | `ROLLBACK WORK`가 현재 SAP LUW의 변경 요청을 취소하는 근거 |
| `C:\ABAP_DOCU_HTML\abapmessage.htm` | 사용자 메시지, 메시지 타입, `sy-msg*` 근거 |
| `C:\ABAP_DOCU_HTML\abengui_control_glosry.htm` | GUI control이 SAP GUI/Control Framework 기반임을 확인 |
| `C:\ABAP_DOCU_HTML\abensap_gui_glosry.htm` | SAP GUI가 presentation layer와 GUI controls를 포함함을 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_cloud_glosry.htm` | ABAP Cloud의 restricted language, released API, ADT, SAP GUI 접근 없음 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_for_cloud_dev_glosry.htm` | ABAP for Cloud Development의 제한 언어/Released API 경계 확인 |
| `C:\ABAP_DOCU_HTML\abenreleased_api_glosry.htm` | released API 개념 확인 |

주의: `register_edit_event`, `data_changed`, `data_changed_finished`, `check_changed_data`, `CL_ALV_CHANGED_DATA_PROTOCOL`, `add_protocol_entry`, `display_protocol`, `LVC_T_STYL` 등은 ALV Control 클래스 API 영역이다. 로컬 ABAP Keyword Documentation에서는 이벤트 핸들러 문법, DB/LUW, SAP GUI/Cloud 경계를 수동 확인했고, ALV API 이름은 원본 레슨, 임베드, 프로젝트 키워드 감사 결과와 일치하도록 유지했다.

## 4. 품질 리뷰 대응

| 품질 리뷰 요구 | CH28 v2 대응 |
|---|---|
| 기존 v1의 템플릿 반복 제거 | 레슨별로 입력 상태, 이벤트 시점, 오류 피드백, 저장 방어선을 직접 설명 |
| 완성 강의자료 수준 재집필 | 6개 레슨 모두 목적, 개념, 확인, 주의, 체험 설계, 정리를 갖춘 본문으로 확장 |
| 입문자 기준 흐름 | 같은 섹션 구조를 사용하되 본문 내용은 레슨별 실제 맥락으로 작성 |
| 코드가 있으면 체험 설계 | 모든 레슨에 버튼, 상태, 데이터, 로그, 오류/피드백 설계를 구체화 |
| 공식문서 수동 확인 | ABAP_DOCU_HTML에서 이벤트 문법, DB/LUW, GUI/Cloud 경계 파일 직접 열람 |
| R15 게이팅 | CH20 이후 학습분만 사용하고 CH29/RAP/Fiori 개념은 경계 언급으로 제한 |
| Classic-first | SAP GUI 기반 `CL_GUI_ALV_GRID` editable grid 수업으로 유지 |

## 5. 레슨별 QA

| 레슨 | 재집필 포인트 | 체험 설계 확인 | 경계 확인 |
|---|---|---|---|
| CH28-L01 | Field Catalog `edit`와 `register_edit_event`를 분리 설명 | 편집 모드 토글, 키 컬럼 보호, 이벤트 등록 상태, 전체 편집 위험 버튼 설계 | 입력칸 생성과 저장을 혼동하지 않게 분리 |
| CH28-L02 | `data_changed`, `er_data_changed`, `mt_good_cells`, `add_protocol_entry` 흐름 설명 | 정상값/범위 밖/문자/빈칸 버튼, 이벤트 로그, 오류 프로토콜 상태 설계 | 전체 규칙 검증은 L06로 분리 |
| CH28-L03 | `data_changed_finished`를 변경 완료 후 후처리로 설명 | 합계 배지, Enter 확정, 변경 없음 시나리오, stable refresh 피드백 설계 | 검증 이벤트와 후처리 이벤트를 분리 |
| CH28-L04 | Field Catalog 컬럼 편집과 Cell Style 셀별 잠금의 책임 분리 | 매진 토글, style 테이블 표시, stylefname 누락/재계산 누락 진단 설계 | UI 잠금이 보안/저장 검증을 대체하지 않음을 명시 |
| CH28-L05 | 오류 셀 표시와 오류 목록 UX를 중심으로 검증 확장 | 오류 목록 클릭, 셀 포커스, 오류 카운터, 저장 버튼 비활성 피드백 설계 | 화면 검증과 저장 검증을 분리 |
| CH28-L06 | `check_changed_data -> 전체 검증 -> MODIFY -> COMMIT/ROLLBACK` 흐름 설명 | 화면 값/내부 테이블 값/DB 예정 값 비교, 저장 단계 로그, 실패 시뮬레이션 설계 | CH24/CH25의 DML/Lock을 재사용하고 새 주제로 확장하지 않음 |

## 6. 임베드 반영 확인

| 임베드 | v2 반영 |
|---|---|
| `CH28-L01-S01` | 편집 모드 토글과 `SEATS` 컬럼만 input으로 바뀌는 확인 흐름으로 배치 |
| `CH28-L02-S01` | `DATA_CHANGED` 즉시 검증, 오류 셀, 이벤트 로그 확인 흐름으로 배치 |
| `CH28-L03-S01` | 변경 확정 후 합계 재계산과 후처리 이벤트 확인 흐름으로 배치 |
| `CH28-L04-S01` | 매진 행의 `SEATS` 셀 잠금과 Cell Style 확인 흐름으로 배치 |
| `CH28-L05-S01` | 오류 셀과 오류 목록 UX 확인 흐름으로 배치 |
| `CH28-L06-S01` | 저장 전 검증, 거부, `MODIFY+COMMIT` 로그 확인 흐름으로 배치 |

## 7. R15 및 classic-first 검토

CH28은 CH20 이후 Track-2 챕터이므로 ABAP Objects 이벤트, `SET HANDLER`, 예외 처리, 참조 변수, inline `DATA`, `FIELD-SYMBOLS`, `VALUE #(...)`, New Open SQL host variable 사용이 가능하다. v2는 이 범위 안에서 코드를 구성했다.

Classic-first 경계는 유지했다. 본문은 SAP GUI 기반 `CL_GUI_ALV_GRID` editable grid에 집중한다. ABAP Cloud는 restricted language, released API, ADT, SAP GUI 접근 없음이라는 경계 설명으로만 등장한다. RAP/Fiori/UI5 입력 검증은 이 챕터에서 구현 대상으로 다루지 않았다.

CH29 경계도 유지했다. Enhancement/BAdI/User Exit은 다음 챕터 안내 수준으로만 처리하고, CH28의 코드나 체험 설계에 끌어오지 않았다.

## 8. 검증 명령 결과

| 검증 | 결과 |
|---|---|
| 반복 템플릿/부적절 문서명 패턴 검색 | hit 없음 |
| `^## CH28-L0[1-6]` 카운트 | 6 |
| 6개 레슨 섹션 카운트 | 36 |
| 핵심 키워드 검색 | `register_edit_event`, `mc_evt_modified`, `data_changed`, `data_changed_finished`, `er_data_changed`, `mt_good_cells`, `add_protocol_entry`, `display_protocol`, `check_changed_data`, `LVC_T_STYL`, `stylefname`, `mc_style_disabled`, `MODIFY`, `COMMIT WORK`, `ROLLBACK WORK` 확인 |
| 후속 개념 검색 | CH29/RAP/Fiori/UI5는 경계 설명으로만 존재 |

## 9. 잔여 리스크

`CL_GUI_ALV_GRID`의 editable grid 상세 API는 ABAP Keyword Documentation의 키워드 문법 페이지가 아니라 SAP GUI ALV Control 클래스 API 영역이다. 따라서 v2는 로컬 공식 문서로 ABAP 이벤트 문법, DB/LUW, SAP GUI/Cloud 경계를 수동 확인했고, ALV 이벤트명과 메서드명은 기존 원본, 임베드, 프로젝트 키워드 감사 결과와 일치하도록 유지했다.

이 산출물은 `reference/` 재작업 자료이며, 실제 사이트 `content/abap/CH28` 파일에는 반영하지 않았다.
