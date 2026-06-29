# CH36_QA - RAP + Fiori 실무 Capstone

## 판정

PASS.

`reference/codex_0625/00_QUALITY_REVIEW.md`의 재작업 판정에 따라 CH36 v1의 반복 템플릿형 문장을 제거하고, L01-L07을 완성 강의자료 흐름으로 재작성했다. 각 레슨은 입문자 기준으로 왜 필요한가, 무엇인가, 어떻게 확인하는가, 실수와 주의, 체험형 학습 설계, 정리를 포함한다.

## 산출물

- `reference/codex_0625_v2/CH36_REWRITE.md`
- `reference/codex_0625_v2/CH36_QA.md`

## 범위 확인

| 항목 | 결과 |
|---|---|
| 작업 단위 | CH36 단일 챕터만 작업 |
| 레슨 수 | CH36-L01부터 CH36-L07까지 7개 |
| 기존 v1 템플릿 반복 제거 | 통과 |
| 코드 포함 레슨의 체험/시뮬레이터 설계 | L02-L07에 반영, L01은 전체 스택 맵 기반 설계 |
| R15 게이팅 | CH22/CH23/CH35 이후 학습을 전제로 RAP/Fiori 사용, Cloud/Clean Core는 운영 경계로 분리 |
| classic-first 경계 | Classic 기반 DDIC/권한/운영 감각에서 출발하고, RAP/Fiori는 후반 Capstone 확장으로 설명 |
| NotebookLM 사용 | 미사용. 로컬 공식 문서와 SAP Help 공식 문서로 확인 가능했음 |

## 레슨별 QA

| 레슨 | 확인 내용 | 판정 |
|---|---|---|
| L01 | 공연 예약 Capstone 시나리오, 계층별 책임, 완료 기준, 전체 스택 체험 설계 | PASS |
| L02 | `ZI_Booking` Interface View, root/key/association/semantics, association 노출 확인 | PASS |
| L03 | `ZC_Booking` Projection View, `provider contract transactional_query`, `@UI` 애노테이션, Metadata Extension 경계 | PASS |
| L04 | BDEF/BIMP, managed implementation, persistent/draft table, lock/auth, determination/validation/action 선언 | PASS |
| L05 | Determination/Validation/Action 차이, EML `READ/MODIFY ENTITIES`, `IN LOCAL MODE`, `failed/reported/result` | PASS |
| L06 | Service Definition, Service Binding, OData V4 UI, Fiori Elements Preview 확인 항목 | PASS |
| L07 | Authorization, Draft, ATC, ABAP Unit, Transport, Application Log, Clean Core/released API 경계 | PASS |

## 공식 문서 수동 확인

Classic ABAP 문서 `C:\ABAP_DOCU_HTML`에서 CH36에 맞는 문서를 직접 확인했다.

- CDS projection: `abencds_define_view_as_projection.htm`, `abencds_pv_provider_contract.htm`, `abencds_proj_view_expose_assoc.htm`
- CDS annotations: `abencds_f1_entity_annotations.htm`, `abencds_annotations_frmwrk_tables.htm`
- Service Definition/Binding: `abensrvd_define_service.htm`, `abenservice_binding_glosry.htm`, `abenbusiness_service_glosry.htm`
- BDL/BDEF: `abenbdl_define_beh.htm`, `abenbdl_persistent_table.htm`, `abenbdl_draft_table.htm`, `abenbdl_locking.htm`, `abenbdl_determinations.htm`, `abenbdl_validations.htm`, `abenbdl_action.htm`, `abenbdl_authorization.htm`, `abenbdl_with_draft.htm`
- EML/handler: `abapmethods_for_rap_behv.htm`, `abapin_local_mode.htm`, `abapread_entities_long.htm`, `abapmodify_entities_long.htm`
- DCL/auth: `abencds_dcl_glosry.htm`, `abapauthority-check.htm`

ABAP Cloud/Clean Core 관련 문서는 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU`에서 수동 확인했다.

- `abap-docs-main\docs\cloud\md\ABENABAP_CLOUD_GLOSRY.md`
- `abap-docs-main\docs\cloud\md\ABENRELEASED_API_GLOSRY.md`
- `abap-cheat-sheets-main\19_ABAP_for_Cloud_Development.md`

Fiori Elements와 UI 서비스 보충은 SAP Help 공식 문서로 확인했다.

- SAP Help: Defining UI Annotations
- SAP Help: Using Service Binding Editor for OData V4 Service
- SAP Learning: Defining OData UI Services

## v1 문제 제거 확인

| v1 문제 유형 | v2 처리 |
|---|---|
| 동일 템플릿형 문장 반복 | 레슨별 상황과 코드 흐름에 맞춘 직접 서술로 교체 |
| CH36과 무관한 자동 공식문서 힌트 | RAP/CDS/BDL/EML/Service/Draft/Auth/Clean Core 문서로 교체 |
| "코드는 나중에 구체화" 식 추상 설명 | `ZI_Booking`, `ZC_Booking`, BDEF, handler, service definition 코드 골격 포함 |
| 체험형 학습수단의 추상 나열 | 버튼, 상태, 입력값, 피드백, 실패 시나리오를 레슨별로 구체화 |
| 확인 방법 부재 | 활성화, Data Preview, Fiori Preview, validation 실패, Draft, 권한, ATC/Unit 확인으로 분리 |

## 정적 점검 결과

다음 항목을 로컬에서 확인했다.

- 레슨 헤더 `CH36-L01`-`CH36-L07`: 7개 확인
- 각 레슨 표준 흐름 섹션: `왜 필요한가`, `무엇인가`, `어떻게 확인하는가`, `실수와 주의`, `체험형 학습 설계`, `정리` 확인
- trailing whitespace: 없음
- v1 템플릿 오염 패턴: 금지 패턴 검색 결과 없음
- CH36 필수 키워드: `ZI_Booking`, `ZC_Booking`, `provider contract transactional_query`, BDEF/BIMP, `draft table`, `authorization master`, EML, Service Binding, Fiori Elements, Clean Core 포함

## 남은 실제 시스템 검증

이 QA는 로컬 문서 재작성 검증이다. SAP 시스템 접속이 없으므로 다음은 실제 ADT/SAP 시스템에서 추가 확인해야 한다.

- 예시 CDS/BDEF 코드의 실제 오브젝트명, 필드명, DDIC 타입 일치
- draft table 기술 필드와 include 구성
- BDEF handler method 시그니처의 프로젝트 릴리스별 문법 차이
- Fiori Elements Preview에서 action 버튼과 validation 메시지 노출
- DCL/BDEF authorization이 실제 role/PFCG 설계와 일치하는지
- ATC variant와 ABAP Cloud readiness 기준

## 최종 결론

CH36 v2는 재작업 기준을 충족한다. 특히 v1의 자동 힌트와 템플릿식 반복을 제거했고, Capstone답게 요구사항에서 Interface View, Projection View, Behavior, Service, UI Preview, 운영 마감까지 하나의 흐름으로 재구성했다.
