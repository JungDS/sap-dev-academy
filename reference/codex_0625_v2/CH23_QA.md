# CH23_QA - RAP / ABAP Cloud 입문

> 대상 파일: `reference/codex_0625_v2/CH23_REWRITE.md`
> 기준 파일: `reference/codex_0625/00_QUALITY_REVIEW.md`
> 작업 단위: CH23 단일 챕터
> 판정: 재작업 완료, 사후 명령 검증 완료

## 1. 재작업 판정 반영

| 기준 | 반영 결과 |
|---|---|
| 기존 `codex_0625`의 반복 템플릿 제거 | 기존 v1에서 반복되던 고정 섹션명과 자동 생성식 문장을 본문 구조로 사용하지 않았다. |
| 완성 강의자료 수준 재집필 | 9개 레슨 각각을 `왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수와 주의 -> 체험형 학습 설계 -> 정리` 흐름으로 재작성했다. |
| 입문자 기준 설명 | RAP가 CDS 한 파일이 아니라 data model, behavior, service의 결합이라는 점부터 root/projection/BDEF/BIMP/service/EML까지 단계별로 설명했다. |
| 코드가 있는 레슨의 체험 설계 | 코드가 있는 L01~L07, L09에 버튼, 상태값, 데이터, 피드백 설계를 포함했다. 코드가 없는 L08도 상황 카드 기반 판단 훈련으로 설계했다. |
| 공식 문서 기계적 링크 추정 금지 | `C:\ABAP_DOCU_HTML`의 RAP/BDL/EML/Service/ABAP Cloud 문서를 파일 단위로 확인하고 rewrite 상단에 근거를 표로 남겼다. |
| R15 게이팅 | CH24 직접 DB DML/LUW, CH25 lock object 심화, CH36 RAP+Fiori capstone 상세, draft/ETag/feature control 심화를 뒤로 미뤘다. |

## 2. 원본 레슨 커버리지

| 원본 레슨 | v2 반영 위치 | 보강 내용 |
|---|---|---|
| `CH23-L01` RAP 아키텍처 개요 | `CH23-L01 - RAP 아키텍처 개요` | RAP BO를 data model, behavior, business service 구조로 풀고, managed/unmanaged와 CH24 DML 경계를 분리했다. |
| `CH23-L02` Interface View ZI_* 설계 (Root) | `CH23-L02 - Interface View ZI_* 설계 (Root)` | root entity의 설계 질문, key 안정성, root와 DB table 차이를 보강했다. |
| `CH23-L03` Projection View ZC_* 설계 | `CH23-L03 - Projection View ZC_* 설계` | transactional projection, `provider contract transactional_query`, root 위치 일치, projection 소비 계약을 보강했다. |
| `CH23-L04` Behavior Definition 기초 | `CH23-L04 - Behavior Definition 기초` | BDEF가 동작 계약임을 설명하고 `persistent table`, `lock master`, `field`, `mapping`, 표준 operation을 공식 문법 기준으로 보강했다. |
| `CH23-L05` Behavior Implementation 기초 | `CH23-L05 - Behavior Implementation 기초` | behavior pool, local handler class, `FOR VALIDATE ON SAVE`, `keys`, `READ ENTITIES`, `failed/reported`의 집합 지향 처리를 보강했다. |
| `CH23-L06` Service Definition / Service Binding | `CH23-L06 - Service Definition / Service Binding` | Service Definition과 Binding의 책임 차이, OData UI/Web API 차이, activation 후 URL/metadata 확인을 보강했다. |
| `CH23-L07` Validation / Determination / Action 개요 | `CH23-L07 - Validation / Determination / Action 개요` | validation, determination, action을 목적/시점/예시로 분리하고 BDEF 선언 및 실패 반응을 보강했다. |
| `CH23-L08` ABAP Cloud와 Released API 원칙 | `CH23-L08 - ABAP Cloud와 Released API 원칙` | ABAP Cloud, ABAP for Cloud Development, released API, ADT 중심, classic/cloud 균형을 보강했다. |
| `CH23-L09` 실습 | `CH23-L09 - 실습: 예매 RAP 동작 구현` | `ZI_Booking -> ZC_Booking -> BDEF -> Behavior Pool -> Service` 순서와 validation/action/determination 검증표를 추가했다. |

## 3. 공식 문서 수동 확인 반영

| 주제 | 확인 문서 | 반영 판정 |
|---|---|---|
| RAP BO 구조 | `abenabap_rap.htm` | RAP BO가 CDS data model, BDEF behavior, business service로 구성된다는 설명에 반영 |
| Behavior Pool | `abenabap_provide_rap_bos.htm`, `abenabap_behavior_pools.htm` | behavior pool과 local handler class 설명에 반영 |
| Root View Entity | `abencds_define_root_view_v2.htm` | `define root view entity`, root entity parent 없음, BO 대표 개념에 반영 |
| Transactional Projection | `abencds_define_view_as_projection.htm`, `abencds_pv_transactional_query.htm` | `provider contract transactional_query`, projection layer, root 위치 조건에 반영 |
| BDEF | `abencds_bdef.htm`, `abenbdl_bdef_header.htm`, `abenbdl_define_beh.htm` | `managed implementation in class`, `define behavior for`, root entity당 BDEF 연결 설명에 반영 |
| Standard Operations / Mapping | `abenbdl_standard_operations.htm`, `abenbdl_persistent_table.htm`, `abenbdl_locking.htm`, `abenbdl_field_char.htm` | create/update/delete, persistent table, lock master, readonly field, mapping에 반영 |
| Validation / Determination / Action | `abenbdl_validations.htm`, `abenbdl_determinations.htm`, `abenbdl_action.htm` | BDEF 선언 문법과 실패 반응, result `[1] $self` 설명에 반영 |
| Handler Methods | `abapmethods_for_rap_behv.htm`, `abaphandler_meth_validate.htm` | `FOR VALIDATE ON SAVE`, keys, implicit failed/reported 설명에 반영 |
| Service | `abencds_service_definitions.htm`, `abencds_service_bindings.htm` | Service Definition/Binding 역할, OData binding, activation 확인에 반영 |
| EML | `abeneml.htm`, `abeneml_in_abp.htm`, `abapread_entity_entities.htm`, `abapmodify_entity_entities.htm`, `abapin_local_mode.htm` | `READ/MODIFY ENTITIES`, `IN LOCAL MODE`, EML loop 주의, failed/reported에 반영 |
| ABAP Cloud | `abenabap_cloud_glosry.htm`, `abenabap_for_cloud_dev_glosry.htm`, `abenreleased_api_glosry.htm`, `abenreleased_apis.htm` | restricted language version, released API, ADT 중심, RAP transactional model에 반영 |

## 4. R15 / classic-first 경계 점검

| 항목 | 점검 결과 |
|---|---|
| New Syntax | CH23은 CH18 이후이므로 `DATA(...)`, `VALUE #( ... )` 같은 modern syntax를 설명 코드에서 제한적으로 사용할 수 있음 |
| New Open SQL | CH23은 CH19 이후이므로 `@DATA(...)`와 modern Open SQL 감각 전제 가능 |
| CDS View Entity | CH22에서 학습 완료, CH23에서는 root/projection RAP 맥락으로 확장 |
| RAP | CH23의 정식 도입 개념이므로 BDEF/BIMP/Service/EML 기본 설명 가능 |
| Direct DB DML | CH24 주제이므로 테이블을 직접 변경하는 SQL 실행 예제를 넣지 않음 |
| LUW / COMMIT | CH24 이후 심화이므로 CH23에서는 validation 실패와 transactional buffer 개념까지만 설명 |
| Draft / ETag | 공식 문서에 존재하지만 CH23 범위를 넘는 심화로 보류 |
| Lock Object | CH25 이후 심화. CH23은 BDEF `lock master` 기본 의미만 설명 |
| CH36 Capstone | RAP+Fiori 실무 심화는 침범하지 않고 Track-1 입문 수준에 맞춤 |

## 5. 코드 예제 QA

| 예제 | 점검 |
|---|---|
| `ZI_Booking` root | `define root view entity ZI_Booking as select from zbooking` 구조와 key 포함 |
| `ZC_Booking` projection | `define root view entity ZC_Booking provider contract transactional_query as projection on ZI_Booking` 구조 포함 |
| BDEF 기본 | `managed implementation in class zbp_i_booking unique`, `define behavior for ZI_Booking alias Booking`, `persistent table zbooking`, `lock master` 포함 |
| Standard operations | BDEF 안에 `create;`, `update;`, `delete;` 포함. 직접 DB DML이 아니라 RAP operation 선언으로 설명 |
| Field characteristic | `field ( readonly:update ) booking_id;` 사용 |
| Mapping | `mapping for zbooking { ... }`로 CDS 요소와 table field 연결 |
| Handler method | `CLASS lhc_booking ... INHERITING FROM cl_abap_behavior_handler`, `FOR VALIDATE ON SAVE`, `IMPORTING keys` 포함 |
| EML read | `READ ENTITIES OF ZI_Booking IN LOCAL MODE ... WITH CORRESPONDING #( keys ) RESULT ... FAILED ...` 포함 |
| Validation/Determination/Action | `validation ... on save`, `determination ... on modify`, `action cancel result [1] $self` 포함 |
| Service | `define service ZUI_Booking { expose ZC_Booking as Booking; }` 포함 |

## 6. 체험형 학습 설계 QA

| 레슨 | 체험 설계 |
|---|---|
| L01 | RAP 계층 조립 보드: Root, Projection, BDEF, Behavior Pool, Service Definition, Service Binding 누락 검사 |
| L02 | Root Entity 판정기: 업무 후보 카드, 사용자 행동 연결, key 검사, root 활성화 |
| L03 | Projection 계약 검사기: provider contract 토글, root 맞춤 검사, 노출 필드 선택 |
| L04 | BDEF 계약 편집기: operation 체크박스, persistent table 입력, lock master 토글, mapping 표 |
| L05 | Behavior Pool 호출 추적기: keys 전달, READ ENTITIES, 정원 검사, failed/reported 기록 |
| L06 | Service 노출 점검판: expose 추가, binding 생성/활성화, metadata/preview 확인 |
| L07 | RAP 로직 분류 퀴즈와 실행 타임라인: validation/determination/action 분류와 phase 확인 |
| L08 | Cloud 준비도 판정 카드: released API, language version, classic vs cloud 판단 |
| L09 | 예매 RAP 런타임 시뮬레이터: 정상 생성, 정원 초과, 취소 action, service preview, DML 우회 탐지 |

## 7. 기존 시각 자료 반영

| 자료 | 반영 |
|---|---|
| `embeds/abap/CH23*` | 기존 CH23 전용 embed 파일이 없음을 확인했다. |
| 추가 SVG/HTML 생성 | 이번 작업 범위는 문서 산출물이므로 새 파일은 만들지 않고, 필요한 시각/상호작용 수단은 글로 설계했다. |

## 8. 잔여 리스크와 의도적 보류

| 항목 | 처리 |
|---|---|
| 실제 ABAP Platform 릴리스별 RAP 문법 차이 | 로컬 ABAP_DOCU 기준으로 작성했으나, 학습자의 시스템 버전에 따라 일부 syntax/ADT 기능은 다를 수 있다. |
| 메시지 생성 상세 | `failed/reported` 구조의 목적은 설명했지만, 메시지 클래스와 `new_message*` 세부 구현은 프로젝트별 규칙이 필요해 골격으로 남겼다. |
| 취소 action 실제 update 구현 | CH23에서는 action 흐름 설계와 검증 포인트를 중심으로 두고, 대규모 EML modify 구현은 심화로 남겼다. |
| Draft/ETag/Feature Control | 공식 문서에 있으나 Track-1 입문 범위를 넘기 때문에 배제했다. |
| 직접 DB 변경 | CH24 주제이므로 RAP behavior pool에서 직접 table DML로 우회하지 않도록 경고만 남겼다. |

## 9. 최종 수동 점검 체크리스트

- [x] CH23 단일 챕터만 작업했다.
- [x] `reference/codex_0625_v2/CH23_REWRITE.md`를 생성했다.
- [x] `reference/codex_0625_v2/CH23_QA.md`를 생성했다.
- [x] 원본 9개 레슨을 모두 반영했다.
- [x] 기존 `codex_0625` 반복 템플릿을 사용하지 않았다.
- [x] 각 레슨에 입문자용 설명 흐름을 넣었다.
- [x] 코드가 있는 레슨에 체험형 설계를 넣었다.
- [x] ABAP_DOCU 공식 문서를 수동 확인한 근거를 남겼다.
- [x] R15 게이팅과 classic-first 경계를 지켰다.

## 10. 사후 검증 기록

아래 항목은 파일 생성 후 명령으로 추가 점검한다.

| 검증 | 결과 |
|---|---|
| 반복 템플릿 문구 검색 | 완료. 기존 v1 반복 섹션명은 사용되지 않음. |
| 레슨별 흐름 섹션 개수 | 완료. `왜 필요한가/무엇인가/어떻게 확인하는가/실수와 주의/체험형 학습 설계/정리`가 54개로 확인됨. |
| CH24 직접 DML 구현 코드 검색 | 완료. 직접 테이블 변경 실행 예제는 없고, DML/LUW는 경계 설명으로만 남김. |
| RAP 공식 문서 파일명 반영 검색 | 완료. RAP BO, root view, transactional projection, BDEF, validation/determination/action, service, EML, ABAP Cloud 관련 공식 문서명이 rewrite와 QA에 반영됨. |
| trailing whitespace 검사 | 완료. 파일 자체 검사에서 trailing whitespace 없음. |
