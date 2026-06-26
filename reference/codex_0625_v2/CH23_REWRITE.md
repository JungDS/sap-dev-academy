# CH23_REWRITE - RAP / ABAP Cloud 입문

> 재작업 기준: `reference/codex_0625/00_QUALITY_REVIEW.md`의 판정에 따라 기존 `codex_0625`식 반복 템플릿을 버리고, CH23 원본 9개 레슨을 완성 강의자료 수준으로 다시 작성한다.
> 원본 범위: `content/abap/CH23/_chapter.md`, `CH23-L01.md` ~ `CH23-L09.md`
> 공식 확인: `C:\ABAP_DOCU_HTML`의 RAP, BDL, EML, Service Definition/Binding, ABAP Cloud 문서를 파일 단위로 열어 문법과 경계를 수동 확인했다.

## CH23의 자리

CH22에서 학습자는 CDS View Entity로 데이터를 모델링하고, `ZI_*`와 `ZC_*`로 기반 모델과 소비 모델을 나누는 방법을 배웠다. 하지만 CDS만으로는 트랜잭션 앱이 완성되지 않는다. 실무 앱은 새 예매를 만들고, 좌석 수를 수정하고, 취소 버튼을 누르고, 저장 전에 정원 초과를 막고, 그 기능을 Fiori나 OData 클라이언트에 노출해야 한다.

CH23은 이 지점을 다룬다. RAP, 즉 ABAP RESTful Application Programming Model은 CDS 데이터 모델 위에 behavior와 service를 얹어 트랜잭션 앱을 만드는 현대 SAP 표준이다. 이 장은 Track-1의 마지막 장이므로, CH01부터 쌓은 환경, 테이블, SQL, ALV, Dynpro, OO, CDS를 "현대 앱 구조"로 연결한다.

단, 이 장은 Track-2의 모든 실무 세부를 당겨오지 않는다. CH24의 직접 DB DML, LUW, COMMIT/ROLLBACK 심화, CH25의 lock object 심화, CH36의 RAP+Fiori capstone 운영 디테일은 뒤로 둔다. CH23에서는 RAP의 필수 뼈대, 즉 root view, projection, BDEF, behavior pool, service, validation/determination/action, EML, ABAP Cloud 원칙을 입문자가 빠짐없이 이해하도록 만든다.

## R15 학습 경계

| 구분 | CH23에서 다룬다 | CH23에서 미룬다 |
|---|---|---|
| RAP 큰 그림 | RAP BO, data model, behavior, business service, managed/unmanaged 개념 | 복잡한 composition tree 전체 설계, draft 운영, side effects 심화 |
| CDS 기반 | `define root view entity`, RAP root entity, transactional projection, `provider contract transactional_query` | 다중 child composition, redirected association 전체 패턴 |
| BDEF | `managed implementation in class ... unique`, `persistent table`, `lock master`, `create/update/delete`, `field`, `mapping` | unmanaged save, draft table, ETag/total ETag, authorization master 심화 |
| Behavior Pool | `cl_abap_behavior_handler`, `FOR VALIDATE ON SAVE`, keys, `failed/reported` | saver class 심화, global/instance feature control, authorization handler |
| Service | `define service ... expose`, Service Binding, OData V2/V4, UI/Web API 차이 | Gateway 운영, OData client proxy 개발, Fiori Elements annotation 심화 |
| 비즈니스 로직 | validation, determination, action의 역할과 기본 선언 | 대규모 메시지 프레임워크, side effect, draft action |
| EML | `READ ENTITIES`, `MODIFY ENTITIES`, `IN LOCAL MODE`, `WITH CORRESPONDING #( keys )`, `FAILED/REPORTED` | 외부 소비자용 EML 대량 패턴, `COMMIT ENTITIES` 세부, dynamic EML |
| ABAP Cloud | Released API, ABAP for Cloud Development, ADT 중심, classic과 cloud의 경계 | Clean Core 확장 전략, released API 목록별 실무 판정 |

## 공식 문서 수동 확인 근거

| 확인한 문서 파일 | CH23 반영 내용 |
|---|---|
| `abenabap_rap.htm` | RAP BO는 CDS 데이터 모델, behavior definition, business service가 결합된 구조이며, managed/unmanaged와 EML 소비가 존재한다는 점 |
| `abenabap_provide_rap_bos.htm`, `abenabap_behavior_pools.htm` | behavior pool은 behavior implementation을 담는 특수 class pool이고, local handler class가 동작 구현을 담당한다는 점 |
| `abencds_define_root_view_v2.htm` | `ROOT`가 CDS view entity를 RAP BO root entity로 정의하며, root entity는 parent가 없고 BO를 대표한다는 점 |
| `abencds_define_view_as_projection.htm`, `abencds_pv_transactional_query.htm` | transactional projection은 RAP BO projection layer이며, `provider contract transactional_query`와 root 조건이 중요하다는 점 |
| `abencds_bdef.htm`, `abenbdl_bdef_header.htm`, `abenbdl_define_beh.htm` | BDEF가 RAP BO의 transactional behavior를 정의하고 root entity당 BDEF가 연결된다는 점 |
| `abenbdl_standard_operations.htm`, `abenbdl_persistent_table.htm`, `abenbdl_locking.htm`, `abenbdl_field_char.htm` | `create/update/delete`, `persistent table`, `lock master`, `field ( readonly:update )`의 공식 구조 |
| `abenbdl_validations.htm`, `abenbdl_determinations.htm`, `abenbdl_action.htm` | validation, determination, action 선언 문법과 실패 시 `failed/reported` 반응 |
| `abapmethods_for_rap_behv.htm`, `abaphandler_meth_validate.htm` | handler method의 `FOR VALIDATE ON SAVE`, keys, implicit `failed/reported` 파라미터 |
| `abencds_service_definitions.htm`, `abencds_service_bindings.htm` | Service Definition은 CDS entity를 RAP business service로 expose하고, Service Binding은 protocol과 연결한다는 점 |
| `abeneml.htm`, `abeneml_in_abp.htm`, `abapread_entity_entities.htm`, `abapmodify_entity_entities.htm`, `abapin_local_mode.htm` | EML의 `READ/MODIFY ENTITIES`, `IN LOCAL MODE`, `FAILED/REPORTED`, loop 사용 주의 |
| `abenabap_cloud_glosry.htm`, `abenabap_for_cloud_dev_glosry.htm`, `abenreleased_api_glosry.htm`, `abenreleased_apis.htm` | ABAP Cloud는 restricted language version과 released API 접근 규칙을 기반으로 한다는 점 |

---

## CH23-L01 - RAP 아키텍처 개요

### 왜 필요한가

CH22까지의 CDS는 "읽기 모델"을 잘 만든다. `ZI_Concert`와 `ZC_Concert`를 만들면 프로그램이 테이블을 직접 읽지 않고 재사용 가능한 모델을 소비할 수 있다. 하지만 예매 앱의 핵심은 읽기에서 끝나지 않는다. 사용자는 예매를 생성하고, 좌석 수를 바꾸고, 취소 버튼을 누르고, 저장 전에 정원 초과를 막아야 한다. 그리고 그 기능은 Fiori 화면이나 OData API로 노출되어야 한다.

이 요구를 프로그램마다 직접 짜면 구조가 금방 무너진다. 화면 로직에 검증이 들어가고, 리포트에는 다른 저장 로직이 들어가고, 서비스에는 또 다른 권한 처리와 메시지 처리가 들어간다. 같은 "예매"라는 업무 객체가 소비처마다 다르게 구현된다. RAP는 이 문제를 해결하기 위해 데이터 모델, 동작, 서비스 노출을 하나의 비즈니스 객체 구조로 묶는다.

### 무엇인가

RAP는 RESTful Application Programming Model이다. 공식 문서 기준으로 RAP Business Object는 하나의 repository object가 아니라 여러 구성요소의 관계로 이루어진다. 입문자는 "RAP 파일 하나"를 찾으려고 하면 안 된다. 다음 계층을 함께 봐야 한다.

```text
Fiori Elements / OData Client
        |
Service Binding
        |
Service Definition
        |
Projection View (ZC_*)
        |
Behavior Definition (BDEF)
        |
Behavior Implementation / Behavior Pool
        |
Root Interface View (ZI_*)
        |
DB Table
```

각 계층의 책임은 다르다.

| 계층 | 역할 |
|---|---|
| DB Table | 실제 지속 데이터가 저장되는 물리 테이블 |
| Root Interface View | RAP BO의 중심 entity. 업무 객체의 뿌리이며 보통 `define root view entity`로 만든다. |
| Projection View | 외부 소비자에게 보여줄 모델. transactional projection에서는 `provider contract transactional_query`를 사용한다. |
| BDEF | 어떤 operation을 허용할지 선언한다. create, update, delete, validation, determination, action이 여기에 나온다. |
| Behavior Pool | BDEF에 선언한 custom 동작의 실제 ABAP 코드를 담는다. |
| Service Definition | 어떤 CDS entity를 서비스로 노출할지 선언한다. |
| Service Binding | OData 같은 protocol과 연결해 실제 접근 가능한 service로 만든다. |

managed와 unmanaged도 여기서 처음 구분한다. managed RAP BO는 RAP runtime/provider가 표준 저장 처리의 상당 부분을 맡는다. unmanaged RAP BO는 기존 로직이나 특수 저장 절차를 개발자가 더 많이 직접 구현한다. 신규 학습과 신규 개발은 보통 managed에서 시작하는 편이 이해하기 좋다.

### 어떻게 확인하는가

RAP 프로젝트를 볼 때는 파일 이름을 외우기보다 "계층이 빠짐없이 이어지는가"를 확인한다.

| 확인 질문 | 정상 신호 |
|---|---|
| root entity가 있는가? | `define root view entity ZI_Booking ...`가 있다. |
| 소비 projection이 있는가? | `ZC_Booking`이 `ZI_Booking`을 projection한다. |
| behavior가 선언되어 있는가? | BDEF에 `define behavior for ZI_Booking`이 있다. |
| 구현이 필요한 동작의 코드 위치가 있는가? | behavior pool `ZBP_I_BOOKING`의 local handler class가 있다. |
| 서비스로 노출되는가? | service definition이 `expose ZC_Booking as Booking;`을 포함한다. |
| protocol binding이 있는가? | ADT Service Binding이 활성화되어 URL이나 preview를 제공한다. |

초기 학습에서는 이 여섯 가지가 모두 보이면 큰 그림이 맞다. 아직 모든 로직이 완성되지 않아도, "어디에 무엇을 넣어야 하는지"를 찾을 수 있어야 한다.

### 실수와 주의

첫 번째 실수는 RAP를 CDS의 다른 이름으로 생각하는 것이다. CDS는 RAP의 data model을 구성하지만, RAP는 behavior와 service까지 포함한다.

두 번째 실수는 `create/update/delete`라는 단어를 보고 CH24의 직접 DB DML과 섞는 것이다. CH23의 `create; update; delete;`는 BDEF에서 BO operation을 허용하는 선언이다. 테이블을 직접 바꾸는 SQL 문장과 LUW 심화는 CH24에서 다룬다.

세 번째 실수는 managed를 "아무 코드도 안 쓴다"로 오해하는 것이다. 표준 저장 처리는 줄어들지만 validation, determination, action, 메시지, 권한, feature control 같은 custom 로직은 behavior pool에 들어갈 수 있다.

네 번째 실수는 서비스부터 만들려는 것이다. Service Binding이 있어도 root entity와 BDEF가 부실하면 transactional app으로 동작하지 않는다. RAP는 아래 계층이 단단해야 위 계층이 의미가 있다.

### 체험형 학습 설계

학습 화면은 "RAP 계층 조립 보드"로 구성한다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| `Root View 추가` 버튼 | `ZI_Booking` 카드를 계층도에 놓는다. | "업무 객체의 뿌리가 생겼습니다." |
| `Projection 추가` 버튼 | `ZC_Booking` 카드를 `ZI_Booking` 위에 연결한다. | "외부 소비 모델이 생겼습니다." |
| `BDEF 추가` 버튼 | behavior 카드를 root view 옆에 붙인다. | 허용 operation 목록을 표시한다. |
| `Behavior Pool 추가` 버튼 | validation/action 구현 위치를 표시한다. | "선언은 BDEF, 코드는 behavior pool"이라고 안내한다. |
| `Service 노출` 버튼 | Service Definition과 Binding 카드를 붙인다. | OData URL/Preview 상태가 활성화된다. |
| `누락 검사` 버튼 | 빠진 계층을 찾는다. | 예: "BDEF가 없어 create/update/delete가 선언되지 않았습니다." |

상태값은 `hasRoot`, `hasProjection`, `hasBdef`, `hasBehaviorPool`, `hasServiceDefinition`, `hasServiceBinding`으로 둔다. 입문자에게 좋은 피드백은 "이 파일은 무엇을 하는가"보다 "이 파일이 없으면 어떤 사용자 행동이 불가능한가"를 보여주는 것이다.

### 정리

RAP는 CDS 위에 트랜잭션 동작과 서비스 노출을 얹는 모델이다. CH23에서는 RAP BO를 root entity, projection, BDEF, behavior pool, service definition, service binding의 연결로 본다. managed는 표준 저장 처리를 RAP가 맡는 쪽이고, unmanaged는 개발자가 기존 로직을 더 직접 연결하는 쪽이다. 이 장의 나머지 레슨은 이 계층을 아래에서 위로 하나씩 만든다.

---

## CH23-L02 - Interface View ZI_* 설계 (Root)

### 왜 필요한가

RAP에서 가장 먼저 안정되어야 하는 것은 업무 객체의 뿌리다. 예매 앱이라면 "예매"가 중심인지, "공연"이 중심인지, "회차"가 중심인지 결정해야 한다. 취소 action, 정원 validation, 상태 determination이 모두 예매 단위로 일어난다면 root entity는 `Booking`이 자연스럽다.

root entity가 모호하면 뒤 계층이 모두 흔들린다. Projection이 무엇을 노출해야 하는지 불명확해지고, BDEF가 어떤 entity에 붙어야 하는지 헷갈리며, action의 대상도 불안정해진다. 그래서 RAP의 첫 설계 질문은 "이 앱의 트랜잭션 단위는 무엇인가"다.

### 무엇인가

Root Interface View는 RAP BO를 대표하는 CDS view entity다. CH22의 Interface View 개념을 RAP에 맞게 확장한 것이다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
define root view entity ZI_Booking
  as select from zbooking
{
  key booking_id,
      concert_id,
      perf_no,
      customer,
      seats,
      status
}
```

읽는 순서는 다음과 같다.

| 코드 | 뜻 |
|---|---|
| `define root view entity ZI_Booking` | 이 CDS view entity가 RAP BO의 root entity임을 선언한다. |
| `as select from zbooking` | 지속 데이터의 기반은 `zbooking` 테이블이다. |
| `key booking_id` | OData entity key와 RAP instance 식별의 중심이 된다. |
| `concert_id`, `perf_no` | 공연과 회차를 찾기 위한 업무 연결 필드다. |
| `customer`, `seats`, `status` | 예매자, 좌석 수, 예매 상태 같은 트랜잭션 필드다. |

공식 문서 기준으로 root entity는 RAP business object를 대표하며 parent entity가 없다. child entity가 있을 수는 있지만, CH23의 입문 실습에서는 예매 root 하나를 중심으로 단순하게 시작한다.

### 어떻게 확인하는가

첫째, DDL Source가 활성화되는지 확인한다. `define root view entity`는 CH22의 `define view entity`와 비슷해 보이지만, `root`가 RAP BO 설계 의미를 추가한다.

둘째, key가 안정적인지 확인한다. `booking_id`가 비어 있거나 중복될 수 있다면 root key로 적합하지 않다. RAP와 OData에서 key는 인스턴스를 식별하는 기준이므로, "사용자가 한 건을 열었을 때 어떤 행인가"를 정확히 가리켜야 한다.

셋째, ADT Data Preview로 `ZI_Booking`을 조회한다. `booking_id`, `concert_id`, `perf_no`, `customer`, `seats`, `status`가 보이면 최소 모델은 준비된 것이다.

넷째, CH22의 `ZI_Concert`, `ZI_Perf`와 어떤 관계가 필요한지 점검한다. CH23에서는 association 전체 설계를 넓히지 않지만, 예매가 공연/회차와 떨어져 있지 않다는 점은 알아야 한다.

### 실수와 주의

첫 번째 실수는 모든 CDS view를 root로 만드는 것이다. root는 업무 객체를 대표하는 entity다. 보조 조회용 view나 value help view까지 root로 만들면 구조가 흐려진다.

두 번째 실수는 root key를 화면 표시용 번호처럼 가볍게 보는 것이다. RAP에서 key는 update, action, validation, OData URL이 인스턴스를 찾는 기준이다. 나중에 바뀔 수 있는 설명 필드나 상태 필드를 key로 삼으면 안 된다.

세 번째 실수는 root view에 UI 표현을 과하게 넣는 것이다. `ZI_Booking`은 기반 모델이다. 사용자 목록에 어떤 컬럼을 몇 번째로 보여줄지는 `ZC_Booking`이나 Metadata Extension에서 다루는 편이 낫다.

네 번째 실수는 root entity와 DB table을 같은 것으로 보는 것이다. `zbooking`은 저장소이고, `ZI_Booking`은 RAP가 이해하는 업무 모델의 시작점이다.

### 체험형 학습 설계

"Root Entity 판정기"를 만든다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| 업무 후보 카드 | `공연`, `회차`, `예매` 카드를 보여준다. | 사용자가 root 후보를 선택한다. |
| `사용자 행동 연결` 버튼 | 예약, 취소, 정원 검증을 어떤 카드에 연결할지 표시한다. | 대부분이 예매에 연결되면 `Booking` root가 자연스럽다고 안내한다. |
| `키 검사` 버튼 | 후보 key의 중복/변경 가능성을 검사한다. | "상태 필드는 바뀌므로 key에 부적합" 같은 피드백을 준다. |
| `root 활성화` 버튼 | `define root view entity` 코드를 완성한다. | root 선언이 빠지면 BDEF 연결이 불안정하다고 표시한다. |

상태값은 `selectedRoot`, `candidateKeys`, `operationTargets`, `activationStatus`, `keyWarnings`로 둔다. 이 시뮬레이터는 문법보다 설계 판단을 훈련해야 하므로, "왜 예매가 root인지"를 사용자가 직접 설명하도록 한다.

### 정리

Root Interface View는 RAP BO의 뿌리다. `define root view entity ZI_Booking`은 예매라는 업무 객체를 RAP가 다룰 수 있는 root entity로 만든다. root는 parent가 없고, key는 인스턴스 식별의 기준이 된다. CH23의 나머지 계층은 이 root 위에 올라간다.

---

## CH23-L03 - Projection View ZC_* 설계

### 왜 필요한가

Root Interface View를 만들었다고 그것을 바로 외부에 노출하면 안 되는 경우가 많다. 기반 모델은 내부 안정성을 위해 존재하고, 외부 소비자는 화면이나 API 목적에 맞춘 모델을 원한다. 내부 필드를 숨기고 싶을 수도 있고, UI annotation을 분리하고 싶을 수도 있으며, RAP transactional service에서 사용할 projection 계약을 명확히 하고 싶을 수도 있다.

CH22에서도 `ZI_`와 `ZC_`를 나눴다. CH23에서는 같은 분리를 RAP 트랜잭션 모델에 맞게 적용한다.

### 무엇인가

RAP의 Projection View는 root entity를 소비자에게 노출하기 위한 CDS projection view다. transactional projection의 예는 다음과 같다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.allowExtensions: true
define root view entity ZC_Booking
  provider contract transactional_query
  as projection on ZI_Booking
{
  key booking_id,
      concert_id,
      perf_no,
      customer,
      seats,
      status
}
```

핵심은 세 가지다.

| 코드 | 뜻 |
|---|---|
| `define root view entity ZC_Booking` | projected entity인 `ZI_Booking`이 root이므로 projection도 root 위치를 반영한다. |
| `provider contract transactional_query` | 이 projection이 RAP transactional query 시나리오에 쓰인다는 계약을 드러낸다. |
| `as projection on ZI_Booking` | 기반 root view를 외부 소비 목적에 맞게 투영한다. |

공식 문서 기준으로 transactional projection view는 RAP BO의 projection layer를 모델링하기 위한 것이다. 또한 transactional query는 business object 일부여야 하며, root entity이거나 root를 포함한 composition tree 안에 있어야 한다. CH23에서는 root 하나를 사용하는 단순 구조로 이 조건을 이해한다.

### 어떻게 확인하는가

첫째, `ZC_Booking`이 활성화되는지 본다. `provider contract transactional_query` 위치, `as projection on ZI_Booking`, 필드 목록이 올바른지 확인한다.

둘째, root 위치가 맞는지 확인한다. `ZI_Booking`이 root인데 `ZC_Booking`이 root가 아니면 projection tree 위치가 맞지 않는다. 입문자에게는 "기반이 root면 소비 projection도 root로 맞춘다"로 기억시키면 된다.

셋째, Data Preview에서 필드 노출을 본다. `ZC_Booking`은 외부 소비 모델이므로 어떤 필드를 보여줄지 의도적으로 결정해야 한다. 예를 들어 내부 감사 필드가 있다면 이 projection에서 뺄 수 있다.

넷째, Metadata Extension을 붙일 계획이라면 `@Metadata.allowExtensions: true`가 있는지 확인한다. CH22에서 배운 DDLX 분리 규칙이 여기서도 유효하다.

### 실수와 주의

첫 번째 실수는 provider contract를 장식처럼 보는 것이다. transactional projection에서는 어떤 runtime 시나리오에서 쓰이는 projection인지 계약을 드러낸다. contract가 없으면 runtime-specific syntax check를 기대하기 어렵다.

두 번째 실수는 `ZI_Booking`을 서비스에 직접 expose하는 것이다. 작은 실습에서는 동작할 수 있어 보여도, 실무 구조에서는 외부 소비 계층 `ZC_*`를 따로 두는 편이 변경에 강하다.

세 번째 실수는 projection에 모든 내부 필드를 무조건 올리는 것이다. projection은 소비 계약이다. 외부 소비자에게 보여줄 필요가 없는 필드는 숨길 수 있다.

네 번째 실수는 CH22의 일반 projection과 CH23의 transactional projection을 같은 수준으로만 이해하는 것이다. CH22는 계층 분리의 기본을 배웠고, CH23은 RAP transactional BO에 붙는 projection 계약을 배운다.

### 체험형 학습 설계

"Projection 계약 검사기"를 설계한다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| `ZI_Booking 보기` 버튼 | 기반 root view 필드를 보여준다. | 내부 모델 카드로 표시한다. |
| `ZC_Booking 만들기` 버튼 | projection 코드를 생성한다. | 소비 모델 카드로 표시한다. |
| `contract 토글` | `provider contract transactional_query`를 넣고 뺀다. | 빠지면 "transactional projection 시나리오 점검이 약해집니다." |
| `root 맞춤 검사` | 기반 root와 projection root 여부를 비교한다. | 불일치하면 "projected entity 위치를 반영해야 합니다." |
| `노출 필드 선택` | 외부에 보여줄 필드를 체크한다. | 선택 결과로 service payload preview를 보여준다. |

상태값은 `baseIsRoot`, `projectionIsRoot`, `providerContract`, `exposedFields`, `metadataExtensionAllowed`로 둔다. 좋은 피드백은 "필드를 지운 것이 아니라 외부 소비 계약에서 제외한 것"을 명확히 보여주는 것이다.

### 정리

RAP Projection View는 root interface view를 외부 소비 목적에 맞게 투영한다. `ZC_Booking`은 `ZI_Booking`을 기반으로 하며, transactional service에 사용할 경우 `provider contract transactional_query`가 중요한 의미를 가진다. 기반은 안정적으로, 소비는 명확하게 분리한다.

---

## CH23-L04 - Behavior Definition 기초

### 왜 필요한가

CDS view는 데이터를 보여줄 수 있지만, 사용자가 무엇을 할 수 있는지는 말해 주지 않는다. 예매를 만들 수 있는가, 수정할 수 있는가, 삭제할 수 있는가, 취소 버튼이 있는가, 저장 전에 검증해야 하는가 같은 동작은 별도의 계약이 필요하다.

이 계약이 없으면 소비자는 "이 entity가 읽기 전용인지, 수정 가능한지, 어떤 action을 제공하는지"를 알기 어렵다. RAP에서는 Behavior Definition, 줄여서 BDEF가 이 역할을 맡는다.

### 무엇인가

BDEF는 RAP BO의 transactional behavior를 정의하는 repository object다. root entity를 기준으로 어떤 operation을 허용하는지 선언한다.

```abap
managed implementation in class zbp_i_booking unique;

define behavior for ZI_Booking alias Booking
persistent table zbooking
lock master
{
  create;
  update;
  delete;

  field ( readonly:update ) booking_id;

  mapping for zbooking
  {
    booking_id = booking_id;
    concert_id = concert_id;
    perf_no    = perf_no;
    customer   = customer;
    seats      = seats;
    status     = status;
  }
}
```

각 줄의 의미는 다음과 같다.

| 코드 | 뜻 |
|---|---|
| `managed implementation in class zbp_i_booking unique;` | managed 시나리오이며, custom 구현이 필요하면 `zbp_i_booking` behavior pool을 사용한다. |
| `define behavior for ZI_Booking alias Booking` | `ZI_Booking` root entity의 behavior를 정의하고, BDEF 내부에서 `Booking` alias로 부른다. |
| `persistent table zbooking` | managed RAP BO의 지속 데이터 테이블을 지정한다. |
| `lock master` | root entity가 lock master임을 선언한다. managed에서는 framework가 lock mechanism을 처리한다. |
| `create; update; delete;` | RAP BO consumer가 사용할 수 있는 표준 operation을 허용한다. |
| `field ( readonly:update ) booking_id;` | update 시 key 필드를 바꾸지 못하게 한다. |
| `mapping for zbooking { ... }` | CDS 요소와 persistent table 필드의 대응을 명시한다. |

여기서 `create/update/delete`는 직접 DB SQL이 아니다. RAP BO에 대해 가능한 표준 operation을 선언하는 BDL 문법이다. 직접 `INSERT`, `UPDATE`, `DELETE` SQL과 transaction control은 CH24에서 따로 배운다.

### 어떻게 확인하는가

첫째, BDEF가 root entity에 연결되어 있는지 확인한다. 공식 문서 기준으로 BDEF는 적어도 하나의 root entity로 구성된 CDS data model에 기반하며, root entity는 BDEF와 연결된다.

둘째, `persistent table`이 실제 root view의 기반 테이블과 맞는지 확인한다. `ZI_Booking`이 `zbooking`을 기반으로 하는데 BDEF가 다른 테이블을 가리키면 저장 모델이 어긋난다.

셋째, `lock master`가 root entity에 지정되어 있는지 본다. CH23에서는 root 하나만 다루므로 `lock master`가 자연스럽다. child entity가 있는 구조의 lock dependent는 심화로 미룬다.

넷째, ADT의 activation error를 확인한다. mapping 필드명 오타, alias 불일치, persistent table 누락, root entity 이름 오류는 활성화 단계에서 잡힌다.

### 실수와 주의

첫 번째 실수는 BDEF를 ABAP class로 착각하는 것이다. BDEF는 behavior를 선언하는 BDL source이고, 실제 ABAP 구현은 behavior pool에 둔다.

두 번째 실수는 `mapping`을 생략해도 항상 괜찮다고 생각하는 것이다. 필드명이 완전히 같고 규칙이 단순하면 덜 복잡할 수 있지만, 학습 단계에서는 entity 요소와 DB 필드의 대응을 눈으로 확인하는 편이 안전하다.

세 번째 실수는 key를 수정 가능하게 두는 것이다. `booking_id`가 update 중 바뀌면 사용자가 어떤 예매를 수정하는지 기준이 흔들린다. 보통 key는 read-only로 둔다.

네 번째 실수는 `lock master`를 CH25의 classic lock object와 같은 방식으로 이해하는 것이다. CH23에서는 RAP BDEF의 locking 선언을 배우고, classic enqueue/dequeue와 동시성 심화는 뒤에서 다룬다.

### 체험형 학습 설계

"BDEF 계약 편집기"를 만든다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| operation 체크박스 | `create`, `update`, `delete` 허용 여부를 선택한다. | 선택한 operation만 소비자 행동 버튼으로 나타난다. |
| `persistent table` 입력 | `zbooking`을 지정한다. | root view 기반과 다르면 경고를 표시한다. |
| `lock master` 토글 | root의 lock 선언을 켜고 끈다. | 꺼져 있으면 동시 수정 보호가 빠졌다는 경고를 준다. |
| mapping 표 | CDS 요소와 DB 필드를 한 줄씩 연결한다. | 오타나 누락 필드를 빨간색으로 표시한다. |
| `활성화 검사` 버튼 | BDEF 구조를 점검한다. | "BDEF는 동작 선언이고 ABAP 코드는 아닙니다." |

상태값은 `allowedOperations`, `persistentTable`, `lockMode`, `fieldMapping`, `activationMessages`로 둔다. 이 도구의 핵심은 사용자가 `create`를 체크하면 화면에 "예매 생성 가능" 버튼이 생기고, 체크를 빼면 소비자가 만들 수 없다는 것을 보여주는 것이다.

### 정리

BDEF는 RAP BO의 동작 계약이다. root entity에 대해 create, update, delete 같은 표준 operation과 field characteristic, persistent table, lock, mapping을 선언한다. CH23에서는 managed BDEF의 기본 구조를 이해하고, 직접 DB DML과 LUW 심화는 CH24로 남긴다.

---

## CH23-L05 - Behavior Implementation 기초

### 왜 필요한가

BDEF는 "무엇을 할 수 있는가"를 선언한다. 하지만 정원 초과 검증, 취소 action, 상태 자동 설정 같은 업무 로직은 실제 코드가 필요하다. 이 코드를 아무 report나 class에 흩뿌리면 RAP runtime이 호출할 수 없다. BDEF와 연결된 정해진 구현 위치가 필요하다.

그 위치가 Behavior Pool이다. CH20에서 배운 class와 method 지식이 여기서 다시 등장한다. 다만 일반 class와 달리 RAP handler method는 BDEF의 operation과 연결되는 특수 method signature를 가진다.

### 무엇인가

Behavior Pool은 ABAP behavior implementation을 위한 특수 class pool이다. global class 자체가 모든 behavior를 직접 구현하는 것이 아니라, 보통 CCIMP include 안의 local handler class가 동작을 구현한다.

Validation handler의 기본 모양은 다음과 같다.

```abap
CLASS lhc_booking DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS validateCapacity FOR VALIDATE ON SAVE
      IMPORTING keys FOR Booking~validateCapacity.
ENDCLASS.

CLASS lhc_booking IMPLEMENTATION.
  METHOD validateCapacity.
    READ ENTITIES OF ZI_Booking IN LOCAL MODE
      ENTITY Booking
      FIELDS ( booking_id concert_id perf_no seats )
      WITH CORRESPONDING #( keys )
      RESULT DATA(bookings)
      FAILED DATA(read_failed).

    LOOP AT bookings INTO DATA(booking).
      " 정원 초과 여부를 계산하고, 실패 시 failed/reported에 기록한다.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

읽는 순서는 다음과 같다.

| 코드 | 뜻 |
|---|---|
| `INHERITING FROM cl_abap_behavior_handler` | RAP handler class의 기반 클래스를 상속한다. |
| `FOR VALIDATE ON SAVE` | 이 method가 save 시점 validation 구현임을 나타낸다. |
| `IMPORTING keys FOR Booking~validateCapacity` | validation 대상 instance key 집합을 받는다. |
| `READ ENTITIES OF ZI_Booking IN LOCAL MODE` | 같은 RAP BO 구현 안에서 현재 transactional buffer를 고려해 entity를 읽는다. |
| `WITH CORRESPONDING #( keys )` | handler가 받은 key 구조를 read request에 맞게 매핑한다. |
| `FAILED`, `reported` | 실패 인스턴스와 메시지를 RAP runtime에 돌려주는 응답 구조다. |

공식 문서 기준으로 handler method의 parameter는 BDEF derived type과 연결된다. `keys`는 단건이 아니라 internal table이다. RAP는 여러 instance를 한 번에 처리하는 집합 지향 모델이므로, method 안에서는 `keys`를 한 건이라고 가정하면 안 된다.

### 어떻게 확인하는가

첫째, behavior pool class가 BDEF header의 `managed implementation in class zbp_i_booking unique;`와 이름이 맞는지 확인한다.

둘째, local handler method 이름이 BDEF에 선언한 validation/action/determination 이름과 맞는지 확인한다. BDEF에 `validateCapacity`를 선언했는데 handler는 `validateSeats`만 구현하면 연결되지 않는다.

셋째, method signature를 ADT quick fix나 syntax check로 확인한다. RAP handler method는 `FOR VALIDATE ON SAVE`, `FOR MODIFY`, `FOR ACTION` 같은 추가 구문이 정확해야 한다.

넷째, 구현 코드 안에서 EML을 loop 안에 반복 호출하지 않는지 본다. 공식 문서도 EML statement를 loop 안에서 남발하지 말라고 경고한다. 보통 먼저 필요한 데이터를 한 번에 읽고, 그 결과를 loop로 처리한다.

### 실수와 주의

첫 번째 실수는 behavior pool을 일반 utility class처럼 쓰는 것이다. behavior pool은 RAP runtime이 호출하는 구현 위치다. 외부에서 마음대로 호출하는 업무 helper와 구분해야 한다.

두 번째 실수는 `keys`를 단건으로 처리하는 것이다. 사용자가 UI에서 여러 행을 동시에 저장할 수 있고, RAP runtime은 여러 instance를 한 번에 넘길 수 있다.

세 번째 실수는 validation 안에서 데이터를 수정하려는 것이다. 공식 validation 문서는 validation 구현에서 EML MODIFY를 쓰지 말라고 경고한다. 검증은 실패를 알리는 역할이고, 값 자동 변경은 determination이나 action에 맞춰 설계해야 한다.

네 번째 실수는 `failed/reported`를 채우지 않는 것이다. 검증에서 문제를 발견해도 RAP runtime에 실패와 메시지를 돌려주지 않으면 사용자는 왜 저장이 막혔는지 알기 어렵다.

### 체험형 학습 설계

"Behavior Pool 호출 추적기"를 만든다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| `저장 요청` 버튼 | 예매 3건의 key를 handler에 전달한다. | `keys` internal table에 3행이 들어가는 모습을 보여준다. |
| `READ ENTITIES` 버튼 | key에 해당하는 booking rows를 한 번에 읽는다. | loop 안 SELECT가 아니라 집합 read임을 표시한다. |
| `정원 검사` 버튼 | 각 booking의 seats를 capacity와 비교한다. | 실패 행은 빨간 배지로 표시한다. |
| `failed/reported 기록` 버튼 | 실패 key와 메시지를 응답 구조에 넣는다. | RAP runtime이 어떤 인스턴스를 거부하는지 보여준다. |
| `loop 안 EML 탐지` 버튼 | EML이 loop 안에 있으면 경고한다. | "RAP handler는 집합 지향으로 설계합니다." |

상태값은 `keys`, `readResult`, `capacityByPerf`, `failedBooking`, `reportedBooking`, `emlWarnings`로 둔다. 입문자는 이 화면을 통해 "handler는 버튼 클릭 한 번을 처리하는 함수"가 아니라 "여러 instance를 한 번에 처리하는 runtime callback"임을 이해해야 한다.

### 정리

Behavior Implementation은 BDEF에 선언한 custom 동작의 실제 코드다. Behavior Pool 안의 local handler class가 `cl_abap_behavior_handler`를 상속하고, `FOR VALIDATE ON SAVE` 같은 RAP-specific method를 구현한다. `keys`, `READ ENTITIES`, `failed/reported`는 단건 사고가 아니라 집합 지향 처리로 이해해야 한다.

---

## CH23-L06 - Service Definition / Service Binding

### 왜 필요한가

RAP BO가 시스템 안에서만 존재하면 사용자가 앱으로 사용할 수 없다. Fiori 화면, 외부 OData client, 테스트 도구가 접근하려면 business service로 노출해야 한다. 여기서 두 단계가 필요하다. 무엇을 노출할지 정하는 Service Definition, 어떤 protocol로 실제 접근 가능하게 만들지 정하는 Service Binding이다.

이 둘을 섞으면 문제 해결이 어려워진다. `expose`를 안 해서 entity가 서비스에 없는데 binding만 만지거나, binding을 활성화하지 않았는데 service definition만 보고 URL을 찾는 식의 혼란이 생긴다.

### 무엇인가

Service Definition은 CDS entity를 RAP business service로 노출하는 SDL source다.

```abap
define service ZUI_Booking {
  expose ZC_Booking as Booking;
}
```

여기서 `ZC_Booking`은 projection view이고, `Booking`은 서비스에서 보일 노출 이름이다. Service Definition에 넣은 entity만 외부에 노출된다.

Service Binding은 ADT의 form-based repository object다. Service Definition을 OData 같은 RESTful protocol과 연결한다. 공식 문서 기준으로 binding type에는 OData V2/V4, UI용 OData, Web API용 OData 같은 변형이 있다. UI용 OData는 SAPUI5/Fiori UI 기술이 사용할 control information을 포함할 수 있고, Web API용은 data-only 성격이 강하다.

### 어떻게 확인하는가

첫째, Service Definition에서 `expose ZC_Booking as Booking;`이 있는지 확인한다. `ZI_Booking`이 아니라 소비 projection `ZC_Booking`을 expose하는 구조가 명확해야 한다.

둘째, Service Binding이 어떤 service definition을 참조하는지 확인한다. binding 이름이 있어도 다른 service definition에 연결되어 있으면 원하는 entity가 보이지 않는다.

셋째, binding을 Activate한다. 공식 문서 기준으로 service binding이 활성화되면 protocol에 따라 business service 접근이 가능해지고, ADT는 URL과 testing 기능을 제공한다.

넷째, `$metadata` 또는 ADT Preview로 entity가 보이는지 확인한다. service definition의 alias `Booking`이 metadata에 노출되어야 한다.

다섯째, action 이름이나 key field가 OData 제약에 걸리지 않는지 확인한다. service binding 활성화 시 key field, association cardinality, data type, action naming conflict 같은 제한이 점검될 수 있다.

### 실수와 주의

첫 번째 실수는 Service Definition과 Service Binding을 같은 것으로 보는 것이다. Definition은 무엇을 노출할지, Binding은 어떻게 접근하게 할지다.

두 번째 실수는 binding 활성화를 빼먹는 것이다. source가 활성화되어도 binding이 활성화되지 않으면 실제 URL이나 preview를 사용할 수 없다.

세 번째 실수는 root/projection/BDEF가 미완성인데 service만 먼저 테스트하는 것이다. service는 아래 모델의 문제를 그대로 드러낸다. service 오류가 나면 항상 root, projection, BDEF, annotation, key를 함께 봐야 한다.

네 번째 실수는 UI용 binding과 Web API용 binding의 목적을 섞는 것이다. UI는 annotation과 control information의 영향을 크게 받고, Web API는 data contract에 더 집중한다.

### 체험형 학습 설계

"Service 노출 점검판"을 만든다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| `expose 추가` 버튼 | Service Definition에 `ZC_Booking`을 노출한다. | metadata entity 목록에 `Booking`이 생긴다. |
| `Binding 생성` 버튼 | OData V4 UI binding 카드를 만든다. | protocol, service definition, 상태를 표시한다. |
| `Activate` 버튼 | binding 상태를 inactive에서 active로 바꾼다. | URL과 `$metadata` 버튼이 활성화된다. |
| `$metadata` 버튼 | 노출 entity와 action 목록을 보여준다. | expose하지 않은 entity는 보이지 않는다. |
| `Preview` 버튼 | Fiori Elements 미리보기 상태를 표시한다. | annotation이 부족하면 빈 화면/컬럼 부족 경고를 준다. |

상태값은 `exposedEntities`, `bindingType`, `bindingActive`, `metadataEntities`, `previewWarnings`로 둔다. 좋은 피드백은 "Service Definition에는 있는데 Binding이 inactive"와 "Binding은 active지만 expose가 없음"을 서로 다른 오류로 보여주는 것이다.

### 정리

Service Definition은 어떤 CDS entity를 business service로 노출할지 정하고, Service Binding은 그 service를 OData 같은 protocol로 실제 접근 가능하게 만든다. CH23에서는 `define service ... expose ...`와 ADT binding 활성화의 역할 분리를 확실히 잡는다.

---

## CH23-L07 - Validation / Determination / Action 개요

### 왜 필요한가

트랜잭션 앱은 단순히 저장 버튼만 있으면 안 된다. 사용자가 잘못된 좌석 수를 입력하면 저장 전에 막아야 하고, 새 예매의 기본 상태는 자동으로 채워야 하며, 취소처럼 사용자가 명시적으로 실행하는 업무 버튼도 필요하다. 이 세 종류의 로직을 모두 같은 곳에 섞으면 언제 실행되는지 알기 어렵다.

RAP는 이 로직을 validation, determination, action으로 나눈다. 이 구분을 이해해야 BDEF를 읽을 수 있고, behavior pool 구현 위치도 찾을 수 있다.

### 무엇인가

세 개념은 실행 시점과 목적이 다르다.

| 종류 | 목적 | 실행 시점 예 | 콘서트 예매 예 |
|---|---|---|---|
| Validation | 저장해도 되는지 검사한다. | save sequence | 정원 초과 예매 거부 |
| Determination | 값을 자동으로 계산하거나 채운다. | on modify 또는 on save | 생성 시 `status = 'N'` 기본값 |
| Action | 사용자가 명시적으로 실행하는 업무 동작이다. | 버튼/API action 호출 | 예매 취소 |

BDEF 선언 예는 다음과 같다.

```abap
managed implementation in class zbp_i_booking unique;

define behavior for ZI_Booking alias Booking
persistent table zbooking
lock master
{
  create;
  update;
  delete;

  validation validateCapacity on save { field seats, concert_id, perf_no; }
  determination setStatusToNew on modify { create; }
  action cancel result [1] $self;

  field ( readonly:update ) booking_id;

  mapping for zbooking
  {
    booking_id = booking_id;
    concert_id = concert_id;
    perf_no    = perf_no;
    customer   = customer;
    seats      = seats;
    status     = status;
  }
}
```

`validation validateCapacity on save { field seats, concert_id, perf_no; }`는 해당 필드가 관련된 create/update 이후 save 시점에 정원 초과를 검사한다는 뜻으로 읽는다. `determination setStatusToNew on modify { create; }`는 생성 요청이 들어왔을 때 상태 기본값을 자동으로 잡는 로직이다. `action cancel result [1] $self;`는 사용자가 취소 동작을 호출하고, 결과로 자기 자신 한 건을 돌려받는 형태다.

### 어떻게 확인하는가

첫째, 로직의 목적을 먼저 분류한다. "잘못된 데이터면 막는다"는 validation, "값을 자동으로 채운다"는 determination, "사용자가 버튼으로 실행한다"는 action이다.

둘째, BDEF에 선언이 있는지 확인한다. behavior pool에 method만 만들어서는 RAP runtime이 그 동작을 알 수 없다.

셋째, behavior pool에 해당 method가 있는지 확인한다. 예를 들어 `validateCapacity`는 `FOR VALIDATE ON SAVE`, `setStatusToNew`는 `FOR DETERMINE ON MODIFY`, `cancel`은 action handler로 구현되어야 한다.

넷째, 실패 반응을 본다. validation이 실패하면 `failed`와 `reported`에 인스턴스와 메시지를 기록해야 한다. 공식 문서 기준으로 validation이 실패하면 해당 RAP transaction의 transactional buffer가 거부될 수 있으므로, "오류 메시지 하나 띄우고 계속 저장"이라고 생각하면 안 된다.

### 실수와 주의

첫 번째 실수는 모든 로직을 action으로 만드는 것이다. 사용자가 눌러야 하는 동작은 action이지만, 저장 전에 반드시 지켜야 하는 규칙은 validation이 더 자연스럽다.

두 번째 실수는 validation에서 값을 고치는 것이다. validation은 검사와 실패 보고가 중심이다. 값을 자동으로 채우는 로직은 determination에 둔다.

세 번째 실수는 determination 실행 순서에 과도하게 의존하는 것이다. 여러 determination이나 validation이 같은 조건으로 트리거될 때 실행 순서를 전제로 로직을 짜면 위험하다. 각 로직은 필요한 데이터를 명확히 읽고, 결과를 명확히 남겨야 한다.

네 번째 실수는 action 결과를 설계하지 않는 것이다. `result [1] $self`는 action 후 자기 자신 한 건을 결과로 돌려주는 의미다. UI가 action 이후 갱신할 데이터를 기대한다면 result 설계를 함께 봐야 한다.

### 체험형 학습 설계

"RAP 로직 분류 퀴즈와 실행 타임라인"을 만든다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| 상황 카드 | "좌석 수가 정원보다 큼", "생성 시 상태 기본값", "취소 버튼"을 보여준다. | 사용자가 validation/determination/action 중 하나로 분류한다. |
| `저장 시뮬레이션` 버튼 | create request가 들어온 뒤 modify phase와 save phase를 보여준다. | determination은 값 채움, validation은 저장 전 검사로 표시한다. |
| `취소 실행` 버튼 | action cancel을 별도 흐름으로 실행한다. | action은 사용자가 명시적으로 실행하는 동작임을 표시한다. |
| `실패 응답 보기` 버튼 | `failed-booking`, `reported-booking` 구조를 표로 보여준다. | "이 응답이 있어야 RAP가 저장 실패와 메시지를 알 수 있습니다." |

상태값은 `scenarioType`, `modifyPhaseEvents`, `savePhaseEvents`, `failedResponse`, `reportedResponse`, `actionResult`로 둔다. 이 도구는 "언제 실행되는가"를 시각화해야 한다. 입문자는 BDEF 문법보다 실행 시점 구분에서 자주 틀린다.

### 정리

Validation은 저장 가능 여부를 검사하고, Determination은 값을 자동으로 결정하며, Action은 사용자가 명시적으로 실행하는 업무 동작이다. CH23에서는 세 로직의 목적과 BDEF 선언 형태, behavior pool 구현 연결을 배운다. 이 구분이 잡혀야 RAP 앱의 비즈니스 로직을 읽을 수 있다.

---

## CH23-L08 - ABAP Cloud와 Released API 원칙

### 왜 필요한가

Track-1에서 학습자는 classic ABAP도 많이 배웠다. Dynpro, SALV, classic table maintenance, SAP GUI 기반 도구는 온프레미스 유지보수와 기존 시스템에서 여전히 중요하다. 그러나 신규 S/4HANA Cloud 또는 cloud-ready 확장을 만들 때는 아무 객체나 직접 호출하고, 표준을 직접 수정하고, SAP GUI 전용 흐름에 의존하는 방식이 맞지 않는다.

ABAP Cloud는 업그레이드에 강한 cloud-ready 개발을 위해 언어 범위와 API 접근을 제한한다. 이 제한은 불편하게 하려는 규칙이 아니라, 표준 코어를 깨지 않고 확장하기 위한 안전장치다.

### 무엇인가

공식 문서 기준으로 ABAP Cloud는 state-of-the-art, cloud-ready, upgrade-stable solution을 위한 ABAP development model이다. ABAP Cloud에서는 ABAP for Cloud Development라는 restricted ABAP language version을 사용하고, 다른 repository object에 접근할 때 released API만 사용할 수 있다. 개발 도구도 ADT 중심이다.

핵심 원칙은 다음과 같다.

| 원칙 | 뜻 |
|---|---|
| Released API | ABAP Cloud에서 접근하도록 release된 repository object 또는 그 일부만 사용한다. |
| Restricted language scope | 모든 classic ABAP 구문과 도구가 허용되는 것이 아니다. |
| ADT 중심 개발 | ABAP Cloud 개발은 Eclipse 기반 ADT 흐름을 중심으로 한다. |
| RAP transactional model | ABAP Cloud의 트랜잭션 프로그래밍 모델은 RAP다. |
| Clean Core | SAP 표준 코어를 직접 바꾸지 않고 확장 지점과 공개 API를 사용한다. |

중요한 균형이 있다. classic ABAP을 배운 것이 낭비가 아니다. 기존 시스템을 읽고 유지보수하려면 classic 지식이 필요하다. 다만 cloud-ready 신규 개발에서는 RAP, CDS, released API 원칙을 따라야 한다.

### 어떻게 확인하는가

첫째, 개발 객체의 ABAP language version을 확인한다. ABAP for Cloud Development로 설정된 객체는 classic 환경보다 더 엄격한 syntax/access check를 받는다.

둘째, 사용하는 API가 released API인지 확인한다. 단순히 SE24에서 보이는 class, SE11에서 보이는 table이라고 해서 cloud에서 사용 가능한 것은 아니다. release contract와 visibility를 봐야 한다.

셋째, SAP GUI 전용 흐름이나 unreleased table 직접 접근에 의존하는지 점검한다. CH23의 RAP 서비스 모델은 ADT와 OData/Fiori 소비를 전제로 한다.

넷째, "표준을 직접 수정했는가"를 묻는다. Clean Core 관점에서는 표준 수정을 피하고, 공개된 확장 지점과 released API를 사용해야 한다.

### 실수와 주의

첫 번째 실수는 ABAP Cloud를 "클라우드 서버에서 돌리는 ABAP" 정도로 이해하는 것이다. 핵심은 서버 위치가 아니라 restricted language version, released API, RAP 중심 개발 모델이다.

두 번째 실수는 released API 여부를 이름으로 추측하는 것이다. `CL_*`, `BAPI_*`, 테이블 이름이 익숙하다고 released인 것은 아니다. 시스템의 API release 정보를 확인해야 한다.

세 번째 실수는 classic 지식을 부정하는 것이다. 기존 온프레미스 시스템에서는 classic 지식이 여전히 필요하다. 다만 cloud-ready 개발에서는 허용 경계를 다르게 본다.

네 번째 실수는 Clean Core를 "아무 확장도 하지 말라"로 오해하는 것이다. Clean Core는 확장을 금지하는 것이 아니라 표준을 직접 훼손하지 않는 방식으로 확장하라는 원칙이다.

### 체험형 학습 설계

"Cloud 준비도 판정 카드"를 만든다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| 상황 카드 | "표준 테이블 직접 UPDATE", "released CDS view 소비", "Dynpro 신규 개발", "RAP service 노출"을 제시한다. | 사용자가 Cloud-ready 여부를 선택한다. |
| `API release 검사` 버튼 | 객체가 released인지 여부를 가상 결과로 보여준다. | unreleased면 "ABAP Cloud 접근 불가" 경고를 준다. |
| `대안 찾기` 버튼 | unreleased 접근의 대체 방향을 보여준다. | released API, RAP service, extension point를 후보로 제시한다. |
| `classic vs cloud` 토글 | 온프레미스 유지보수와 cloud 신규 개발의 판단 기준을 나란히 보여준다. | 둘 다 배워야 하는 이유를 설명한다. |

상태값은 `scenario`, `languageVersion`, `apiReleaseState`, `cloudReady`, `recommendedAlternative`로 둔다. 이 레슨은 코드가 없어도 판단 훈련이 중요하므로, 상황 카드와 즉시 해설이 학습 수단이 된다.

### 정리

ABAP Cloud는 released API, restricted language scope, ADT 중심 개발, RAP transactional model을 바탕으로 cloud-ready 개발을 하게 하는 모델이다. classic ABAP은 기존 시스템 이해에 필요하고, RAP/CDS/Released API는 신규 cloud-ready 개발의 중심이다. CH23에서는 원칙을 잡고, 세부 확장 전략은 후속 실무 장으로 넘긴다.

---

## CH23-L09 - 실습: 예매 RAP 동작 구현

### 왜 필요한가

이제 CH23의 조각을 하나의 콘서트 예매 흐름으로 묶는다. 목표는 "RAP 앱 전체를 완벽히 운영 배포한다"가 아니다. Track-1 입문자가 RAP 구조를 실제 예매 시나리오에 연결해 보는 것이다.

실습의 핵심은 두 가지다. 첫째, 정원 초과 예매는 validation으로 막는다. 둘째, 취소는 action으로 명시 실행한다. 여기에 생성 시 기본 상태를 determination으로 채우는 과제를 붙이면 validation, determination, action의 차이를 한 번에 확인할 수 있다.

### 무엇인가

실습 산출물은 다음 순서로 만든다.

| 단계 | 산출물 | 역할 |
|---|---|---|
| 1 | `ZI_Booking` | 예매 root interface view |
| 2 | `ZC_Booking` | transactional projection view |
| 3 | BDEF | create/update/delete, validation, determination, action 선언 |
| 4 | Behavior Pool | validation/action/determination 구현 위치 |
| 5 | Service Definition | `ZC_Booking` expose |
| 6 | Service Binding | OData로 활성화하고 Preview 확인 |

BDEF는 다음처럼 시작한다.

```abap
managed implementation in class zbp_i_booking unique;

define behavior for ZI_Booking alias Booking
persistent table zbooking
lock master
{
  create;
  update;
  delete;

  validation validateCapacity on save { field seats, concert_id, perf_no; }
  determination setStatusToNew on modify { create; }
  action cancel result [1] $self;

  field ( readonly:update ) booking_id;

  mapping for zbooking
  {
    booking_id = booking_id;
    concert_id = concert_id;
    perf_no    = perf_no;
    customer   = customer;
    seats      = seats;
    status     = status;
  }
}
```

정원 validation의 behavior pool 흐름은 다음처럼 설계한다.

```abap
METHOD validateCapacity.
  READ ENTITIES OF ZI_Booking IN LOCAL MODE
    ENTITY Booking
    FIELDS ( booking_id concert_id perf_no seats )
    WITH CORRESPONDING #( keys )
    RESULT DATA(bookings)
    FAILED DATA(read_failed).

  LOOP AT bookings INTO DATA(booking).
    " 1. booking-concert_id와 booking-perf_no로 회차 정원을 찾는다.
    " 2. 이미 예약된 좌석 수와 이번 요청 좌석 수를 비교한다.
    " 3. 초과하면 failed-booking과 reported-booking에 기록한다.
  ENDLOOP.
ENDMETHOD.
```

취소 action은 상태를 취소 상태로 바꾸는 명시 동작이다. CH23에서는 전체 update 구현을 길게 늘리지 않고, action이 validation과 다른 종류의 로직이라는 점을 확인한다.

```abap
METHOD cancel.
  " 1. keys로 취소 대상 예매를 읽는다.
  " 2. 이미 취소된 건인지 확인한다.
  " 3. 취소 가능하면 status를 'C'로 바꾸는 modify request를 수행한다.
  " 4. 실패하면 failed/reported에 원인을 기록한다.
ENDMETHOD.
```

이 코드는 실습 설계용 골격이다. 실제 시스템에서는 메시지 클래스, 상태 도메인 값, 정원 계산 기준, 취소 가능 조건, 동시성 정책을 프로젝트 규칙에 맞춰 확정해야 한다.

### 어떻게 확인하는가

확인은 아래 순서로 한다.

1. `ZI_Booking`과 `ZC_Booking`이 활성화되는지 확인한다.
2. BDEF가 활성화되고, `validateCapacity`, `setStatusToNew`, `cancel` 선언이 보이는지 확인한다.
3. Behavior Pool에 각 선언과 연결되는 method가 생성되었는지 확인한다.
4. 정상 예매를 생성해 `status = 'N'` 기본값이 들어가는지 확인한다.
5. 정원 이내 예매는 저장되고, 정원 초과 예매는 validation으로 거부되는지 확인한다.
6. 취소 action을 실행하면 해당 예매의 상태가 취소로 바뀌는지 확인한다.
7. Service Binding Preview 또는 OData metadata에서 `Booking` entity와 `cancel` action이 보이는지 확인한다.

검증 표는 다음처럼 작성한다.

| 케이스 | 입력 | 기대 결과 |
|---|---|---|
| 정상 생성 | 좌석 2, 잔여 10 | 저장 성공, 상태 `N` |
| 정원 초과 | 좌석 12, 잔여 10 | validation 실패, `failed/reported` 메시지 |
| 취소 | 상태 `N` 예매에 cancel 실행 | 상태 `C` |
| 중복 취소 | 이미 `C`인 예매에 cancel 실행 | 실패 메시지 또는 no-op 정책 확인 |
| service preview | binding 활성화 후 preview | Booking 목록과 action 노출 확인 |

### 실수와 주의

첫 번째 실수는 validation 실패를 단순 화면 메시지로만 처리하는 것이다. RAP에서는 실패 instance를 `failed`에, 사용자 메시지를 `reported`에 기록해야 runtime과 UI가 제대로 반응한다.

두 번째 실수는 정원 계산을 단순히 현재 입력 좌석만 보는 것이다. 실제 검증은 이미 예약된 좌석 수, 취소 상태 제외 여부, 같은 회차의 기존 예매 합계, 현재 transaction의 변경분을 함께 고려해야 한다. CH23 실습에서는 이 기준을 설계 질문으로 명확히 적어 둔다.

세 번째 실수는 action과 determination을 섞는 것이다. 취소는 사용자가 명시적으로 실행하므로 action이 자연스럽다. 생성 시 기본 상태는 사용자가 누르는 버튼이 아니라 자동 결정이므로 determination이 자연스럽다.

네 번째 실수는 `IN LOCAL MODE`를 아무 곳에서나 쓰는 것이다. 공식 문서 기준으로 `IN LOCAL MODE`는 behavior implementation에서 해당 RAP BO 자체에 대해 사용하는 특수 EML 형태다. 일반 소비 프로그램에서 습관적으로 붙이는 문법이 아니다.

다섯 번째 실수는 CH24의 직접 DML로 우회하는 것이다. Behavior Pool 안에서 테이블을 직접 변경하는 방식은 RAP transactional buffer와 save sequence를 우회할 수 있다. CH23 실습은 RAP operation과 EML 흐름으로 생각한다.

### 체험형 학습 설계

"예매 RAP 런타임 시뮬레이터"를 만든다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| `정상 예매 생성` 버튼 | 좌석 2, 잔여 10의 create request를 넣는다. | determination으로 status가 `N`이 되고 validation 통과 표시 |
| `정원 초과 예매` 버튼 | 좌석 12, 잔여 10의 create request를 넣는다. | `failed-booking`에 key, `reported-booking`에 오류 메시지 표시 |
| `취소 Action` 버튼 | 선택한 booking에 cancel을 실행한다. | status가 `C`로 바뀌고 action result가 갱신됨 |
| `실행 타임라인` 탭 | create -> determination -> validation -> save 또는 reject 흐름을 보여준다. | 어느 단계에서 막혔는지 표시 |
| `Service Preview` 탭 | Booking entity와 action 노출 상태를 보여준다. | binding inactive, expose 누락, action 누락을 각각 다른 경고로 표시 |
| `DML 우회 탐지` 버튼 | behavior pool 코드에 직접 테이블 변경 패턴이 있는지 검사한다. | "RAP buffer를 우회하지 말고 EML/operation 흐름으로 설계하세요." |

상태값은 `bookingDraft`, `remainingCapacity`, `determinationLog`, `validationLog`, `failedResponse`, `reportedResponse`, `actionResult`, `serviceExposure`로 둔다. 사용자 피드백은 단순 성공/실패가 아니라 "어떤 RAP 단계에서 무엇이 바뀌었는가"를 보여줘야 한다.

### 정리

CH23 최종 실습은 콘서트 예매 앱을 RAP 트랜잭션 구조로 연결하는 작업이다. `ZI_Booking`, `ZC_Booking`, BDEF, Behavior Pool, Service Definition, Service Binding을 순서대로 만들고, 정원 validation과 cancel action을 확인한다. 여기까지 오면 Track-1은 "읽기 프로그램"에서 "현대 SAP 트랜잭션 앱의 기본 구조"까지 한 바퀴를 완성한다. 다음 CH24부터는 직접 DB 변경, LUW, COMMIT/ROLLBACK 같은 실무 데이터 변경 디테일로 들어간다.

---

## CH23 마무리

CH23의 핵심은 파일 이름 암기가 아니라 책임 분리다. `ZI_Booking`은 root data model, `ZC_Booking`은 소비 projection, BDEF는 동작 계약, behavior pool은 custom 로직 구현, service definition은 노출 목록, service binding은 protocol 연결이다. validation, determination, action은 같은 비즈니스 로직이 아니라 실행 목적과 시점이 다른 RAP 개념이다.

입문자가 이 장을 마쳤다면 다음 질문에 답할 수 있어야 한다.

| 질문 | 기대 답 |
|---|---|
| RAP는 CDS만을 뜻하는가? | 아니다. CDS data model, behavior, service가 결합된 트랜잭션 앱 모델이다. |
| root entity는 왜 필요한가? | RAP BO를 대표하고 instance key와 behavior의 기준이 되는 뿌리이기 때문이다. |
| `ZC_Booking`은 왜 필요한가? | 외부 소비 계약을 기반 model과 분리하기 위해서다. |
| BDEF는 무엇을 하는가? | 어떤 operation과 business logic hook을 허용할지 선언한다. |
| Behavior Pool은 무엇을 하는가? | BDEF에 선언한 custom 동작의 ABAP 구현을 담는다. |
| Validation과 Determination의 차이는 무엇인가? | Validation은 막는 검사이고, Determination은 값을 자동 결정하는 로직이다. |
| Action은 언제 쓰는가? | 사용자가 명시적으로 실행하는 업무 동작에 쓴다. |
| Service Definition과 Binding의 차이는 무엇인가? | Definition은 무엇을 expose할지, Binding은 어떤 protocol로 접근하게 할지 정한다. |
| ABAP Cloud에서 왜 released API가 중요한가? | cloud-ready, upgrade-stable 개발을 위해 허용된 API만 사용해야 하기 때문이다. |
| CH24와의 경계는 무엇인가? | CH23은 RAP operation 선언과 구현 흐름이고, CH24는 직접 DB DML과 transaction control 심화다. |

CH23을 단단히 이해하면 CH24의 직접 DML을 배울 때도 "RAP에서는 왜 무작정 DB를 직접 바꾸지 않는가"를 비교할 수 있다. 또한 후속 RAP/Fiori 심화 장에서는 이미 본 `ZI_*`, `ZC_*`, BDEF, behavior pool, service 구조 위에 더 복잡한 실무 패턴을 얹을 수 있다.
