# CH23_QA · RAP / ABAP Cloud 입문 검수

> 대상 산출물: `reference/codex_0629_v3/CH23_REWRITE.md`  
> 작업 단위: CH23 1개 챕터  
> 기준: `content/abap/CH23`, `.project-docs/04_CONVENTIONS.md` R6/R15, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`

## 1. 작업 범위 확인

| 항목 | 확인 |
|---|---|
| 챕터 | CH23 · RAP / ABAP Cloud 입문 |
| 원본 레슨 수 | L01~L09, 총 9개 |
| 산출 파일 | `CH23_REWRITE.md`, `CH23_QA.md` |
| 주 소스 | `content/abap/CH23` |
| 보조 참고 | `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 직전 v3 CH22 품질 패턴 |
| 품질 목표 | Track-1 마무리로 RAP 계층과 ABAP Cloud 원칙을 입문자 기준 완성 강의자료로 재작성 |

CH23은 RAP 입문 장이다. 일반 SQL DML, `COMMIT WORK`, `ROLLBACK WORK`, Lock Object 직접 제어, 운영 수준 draft/authorization 심화는 CH24 이후로 보류한다.

## 2. 원본 레슨 커버리지

| 원본 | v3 반영 위치 | 반영 내용 |
|---|---|---|
| `_chapter.md` | `CH23 전체 설계`, `CH23 R15 경계`, `CH23 최종 정리` | RAP와 ABAP Cloud를 Track-1 마무리 계층으로 재정의 |
| `CH23-L01.md` | `CH23-L01 · RAP 아키텍처 개요` | RAP 계층, managed/unmanaged, CDS와 RAP 구분 |
| `CH23-L02.md` | `CH23-L02 · Interface View ZI_* 설계 (Root)` | `define root view entity`, key, association, root entity |
| `CH23-L03.md` | `CH23-L03 · Projection View ZC_* 설계` | `provider contract transactional_query`, 소비 projection |
| `CH23-L04.md` | `CH23-L04 · Behavior Definition 기초` | managed BDEF, persistent table, lock master, standard operations, mapping |
| `CH23-L05.md` | `CH23-L05 · Behavior Implementation 기초` | behavior pool, local handler class, `FOR VALIDATE` |
| `CH23-L06.md` | `CH23-L06 · Service Definition / Service Binding` | `define service`, `expose`, OData binding, preview |
| `CH23-L07.md` | `CH23-L07 · Validation / Determination / Action 개요` | validation/determination/action 책임 분리, `READ ENTITIES`, failed/reported |
| `CH23-L08.md` | `CH23-L08 · ABAP Cloud와 Released API 원칙` | ABAP Cloud, released API, Clean Core, classic-first 경계 |
| `CH23-L09.md` | `CH23-L09 · 실습: 예매 RAP 동작 구현` | 콘서트 예매 RAP BO, validation, determination, action, service preview |

판정: 원본 9개 레슨이 모두 별도 절로 반영되었다.

## 3. 공식 문서 수동 확인

다음 문서를 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main`에서 수동 확인했다.

| 주제 | 확인 문서 |
|---|---|
| ABAP Cloud | `docs/cloud/md/ABENABAP_CLOUD_GLOSRY.md` |
| RAP 개요 | `docs/cloud/md/ABENARAP_GLOSRY.md`, `docs/standard/md/ABENABAP_RAP.md` |
| BDL/BDEF | `ABENBDL.md`, `ABENBDL_DEFINE_BEH.md`, `ABENBDL_BDEF_HEADER.md`, `ABENBDL_IMPL_TYPE.md` |
| Persistent/Lock | `ABENBDL_PERSISTENT_TABLE.md`, `ABENBDL_LOCKING.md` |
| Operations | `ABENBDL_OPERATIONS.md` |
| Behavior Pool | `ABENABAP_BEHAVIOR_POOLS.md` |
| Validation/Determination/Action | `ABENBDL_VALIDATIONS.md`, `ABENBDL_DETERMINATIONS.md`, `ABENBDL_ACTION.md` |
| EML | `ABAPREAD_ENTITY_ENTITIES.md`, `ABAPREAD_ENTITY_ENTITIES_FIELDS.md`, `ABAPIN_LOCAL_MODE.md`, `ABAPEML_RESPONSE.md` |
| Service | `ABENSRVD_DEFINE_SERVICE.md`, `ABENCDS_SERVICE_BINDINGS.md` |

확인 결과: CH23에서 사용하는 RAP BDL/EML/Service/ABAP Cloud 핵심 설명은 공식 문서와 정합한다.

## 4. R15 게이팅 및 경계

### CH23에서 허용한 것

| 항목 | 이유 |
|---|---|
| `define root view entity` | CH23 RAP root interface view 주제 |
| `provider contract transactional_query` | CH23 projection view 주제 |
| BDEF `managed`, `persistent table`, `lock master`, `create/update/delete` | CH23 Behavior Definition 주제 |
| `validation`, `determination`, `action` | CH23 업무 로직 분류 주제 |
| Behavior Pool handler class | CH23 Behavior Implementation 주제 |
| `READ ENTITIES ... IN LOCAL MODE` | CH23 validation/action 구현 맛보기와 공식 감사 범위 |
| `failed`, `reported`, `mapped` 개념 | RAP response handling 기본 |
| `define service`, `expose`, Service Binding | CH23 service 노출 주제 |
| ABAP Cloud, Released API, Clean Core | CH23-L08 공식 주제 |

### CH23에서 보류한 것

| 보류 항목 | 처리 |
|---|---|
| SQL `INSERT/UPDATE/MODIFY/DELETE` | CH24 직접 DML 범위 |
| `COMMIT WORK`, `ROLLBACK WORK`, LUW 상세 | CH24 범위 |
| Lock Object와 `ENQUEUE/DEQUEUE` 직접 구현 | CH25 범위 |
| Draft 고급, saver class, unmanaged save | Track-2/RAP 심화 범위 |
| Gateway 운영, communication arrangement | 후속 실무 운영 범위 |
| ATC variant와 package release contract 상세 | ABAP Cloud/Clean Core 심화 범위 |

판정: CH23은 RAP 입문에 필요한 트랜잭션 모델을 다루되, 직접 DB 변경과 트랜잭션 제어를 CH24로 넘겼다.

## 5. 입문자 강의 흐름 점검

| 흐름 | 반영 |
|---|---|
| 왜 필요한가 | CH22 읽기 모델만으로는 생성/수정/취소/검증/Fiori 노출이 부족하다는 문제에서 출발 |
| 무엇인가 | RAP 계층, root/projection, BDEF, behavior pool, service, ABAP Cloud를 책임별로 설명 |
| 어떻게 확인하는가 | ADT activation, BDEF 연결, handler method 생성, service preview, failed/reported 테스트 |
| 실수/주의 | RAP=CDS 오해, BDEF operation과 SQL DML 혼동, validation/determination/action 책임 혼동, service binding 미활성 |
| 정리 | Track-1 전체 흐름과 CH24 Track-2 전환을 명확히 정리 |

판정: 문법 암기가 아니라 계층 책임과 확인 방법 중심으로 작성했다.

## 6. 체험형 학습 설계 점검

| 레슨 | 학습 장치 | 데이터/상태/피드백 |
|---|---|---|
| L01 | RAP 계층 조립 지도 | layer dependency, managed/unmanaged, missing layer |
| L02 | Root Entity 설계 검사기 | root flag, key stability, required fields |
| L03 | Projection 노출 범위 조절기 | exposed/hidden fields, service-visible fields |
| L04 | BDEF 계약 조립대 | operations, persistent table, readonly fields, mapping |
| L05 | Behavior Pool 호출 흐름 추적기 | trigger type, keys count, response table |
| L06 | OData 노출 파이프라인 | exposed entities, binding type, URL, preview |
| L07 | RAP 업무 로직 분류 퀴즈 | scenario, chosen logic type, expected trigger |
| L08 | Released API 판별 카드 | language version, release state, replacement suggestion |
| L09 | Concert RAP Transaction Lab | root/BDEF/service/validation/action states |

판정: 모든 레슨에 버튼, 상태, 데이터, 피드백 설계를 포함했다.

## 7. 코드·설계 검토

| 항목 | 검토 결과 |
|---|---|
| RAP 계층 | DB table → ZI root → ZC projection → BDEF/BIMP → service/binding 구조 |
| Root view | `define root view entity ZI_Booking`, key, association 구조 |
| Projection | `provider contract transactional_query`, `@Metadata.allowExtensions` 포함 |
| BDEF | managed, strict, persistent table, lock master, create/update/delete, readonly, mapping |
| Behavior Pool | `cl_abap_behavior_handler`, local handler class, `FOR VALIDATE ON SAVE` |
| Validation | `READ ENTITIES ... IN LOCAL MODE`, `FIELDS ... WITH`, `failed/reported` 책임 |
| Determination | 기본 status 자동 결정 책임으로 설명 |
| Action | cancel action을 사용자 명시 실행 custom operation으로 설명 |
| Service | `define service`, `expose`, binding activation, preview 확인 |
| ABAP Cloud | released API, ADT, Clean Core, classic 유지보수 경계 설명 |

판정: 공식 문서와 프로젝트 감사 원장의 CH23 판정을 반영했다.

## 8. 자동 검증 기준

작업 후 다음 검증을 수행한다.

| 검증 | 기대 |
|---|---|
| `git diff --check` | whitespace 오류 없음 |
| `rg "^## CH23-L0[1-9]"` | L01~L09 헤딩 9개 존재 |
| 반복 문구 검색 | 기존 템플릿형 고정 문구와 이전 챕터 공식문서 힌트 없음 |
| 경계 검색 | SQL DML/COMMIT WORK/ROLLBACK WORK가 본문 코드로 들어오지 않음 |
| 파일 상태 | `CH23_REWRITE.md`, `CH23_QA.md` 두 파일만 신규 |

## 9. 잔여 리스크

| 리스크 | 판단 |
|---|---|
| RAP 문법의 방대함 | CH23은 입문 장이므로 BDEF/BIMP/Service/Validation/Action 핵심 흐름으로 제한 |
| EML modify/action 구현 세부 부족 | 완전 구현은 RAP 심화 범위이며, CH23은 skeleton과 책임 분리 중심 |
| ABAP Cloud 운영 세부 부족 | Released API와 Clean Core 원칙만 소개하고 ATC/계약 운영은 후속으로 보류 |
| DML 경계 오해 | BDEF operation과 SQL DML을 명시적으로 구분해 보완 |

## 10. 최종 판정

CH23 재집필본은 다음 기준을 충족한다.

- 원본 L01~L09를 모두 독립 절로 반영했다.
- Track-1 마무리 장으로 RAP 계층과 ABAP Cloud 원칙을 직접 설명했다.
- 공식 RAP BDL/EML/Service/ABAP Cloud 문서 확인 결과를 반영했다.
- 모든 레슨에 확인 절차와 체험형 학습 설계를 포함했다.
- R15 게이팅을 지키며 직접 DB DML, LUW, Lock Object 심화를 CH24/CH25로 보류했다.

판정: `CH23_REWRITE.md`는 v3 품질 기준으로 사용 가능하다.
