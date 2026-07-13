# NEWCH39_OLDCH36_REWRITE · RAP + Fiori 실무 Capstone

> 원본: `content/abap/CH36`
> 기준: `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md`
> 목표: CH36을 "예매 앱이 Fiori에서 보이는가"가 아니라 "RAP business object가 운영 가능한 서비스로 완성되었는가"까지 확인하는 최종 Capstone으로 재집필한다. CH23에서 보강한 EML transaction 지도를 실제 consumer 실습으로 회수하고, CH25에서 보류한 RAP BDEF lock/ETag/total ETag, CH23/CH36 운영 보류 항목인 communication arrangement를 함께 회수한다.

## NEWCH39 전체 설계

CH36은 ABAP 커리큘럼의 마지막 장이다. 마지막 장은 축하 문구로 끝나는 장이 아니라, 학습자가 지금까지 배운 것을 하나의 업무 앱으로 조립해 보는 장이어야 한다.

이 장에서 만들 앱은 콘서트 예매 앱이다. 사용자는 Fiori 화면에서 공연과 회차를 보고 예매한다. 정원이 넘으면 저장이 막히고, 정상 예약은 취소할 수 있다. 작성 중 데이터는 Draft로 보관된다. 외부 consumer가 EML로 예매를 생성할 때는 `MODIFY ENTITIES`와 `COMMIT ENTITIES` 또는 `ROLLBACK ENTITIES`의 차이를 이해해야 한다. 운영으로 내보낼 때는 권한, lock, ETag, communication arrangement, released API, ATC, Transport까지 확인해야 한다.

학습 흐름은 다음처럼 둔다.

| 레슨 | 주제 | 학습자가 답해야 할 질문 | 핵심 회수 |
|---|---|---|---|
| L01 | Capstone 시나리오 | 무엇을 완성해야 하는가 | 요구사항, 정상/실패 흐름, 완료 기준 |
| L02 | Interface View | 어떤 데이터를 하나의 업무 객체로 볼 것인가 | root, association, composition, to-parent 경계 |
| L03 | Projection View와 UI annotation | Fiori가 읽을 소비 모델은 무엇인가 | `provider contract transactional_query`, `@UI`, metadata extension |
| L04 | BDEF/BIMP 계약 | 예매 객체가 무엇을 할 수 있는가 | create/update/delete, action, validation, determination |
| L05 | 업무 로직 구현 | 기본값, 정원 검증, 취소는 어디서 처리하는가 | `IN LOCAL MODE`, `failed`, `reported`, result |
| L06 | 외부 EML consumer | 프로그램에서 RAP BO를 바꾸면 언제 DB에 저장되는가 | `MODIFY ENTITIES`, `COMMIT ENTITIES`, `ROLLBACK ENTITIES` |
| L07 | Service Binding/Fiori Preview | 백엔드 계약이 화면에서 어떻게 검증되는가 | Service Definition, OData V4 UI, Preview |
| L08 | Draft/Lock/ETag/Auth | 동시에 여러 사용자가 수정할 때 무엇이 지켜지는가 | `lock master`, `etag master`, `total etag`, `authorization master` |
| L09 | 운영 노출과 Clean Core | 다른 시스템과 운영자가 이 서비스를 어떻게 안전하게 쓰는가 | communication scenario/system/user/arrangement, release contract, ATC |

## R15와 classic-first 경계

| 구분 | CH36에서 다룰 내용 | 경계 |
|---|---|---|
| Classic-first 연결 | DDIC 테이블, 권한, lock 사고방식, Transport, Application Log, ATC | CH25의 classic enqueue와 CH35 운영 품질을 RAP 운영 언어로 연결한다. |
| Modern/RAP 사용 | CDS view entity, BDEF, Behavior Pool, EML, Service Binding, Fiori Elements | CH22/CH23 이후 학습분이므로 본격 사용한다. |
| New Syntax | `VALUE #(...)`, `FOR`, inline declaration, constructor expression | CH18에서 회수된 범위 안에서 사용한다. 단, 문법 자랑이 아니라 RAP derived type 데이터를 구성하는 데만 쓴다. |
| ABAP Cloud/Clean Core | released API, release contract, communication arrangement, restricted API ATC | 운영 체크리스트로 다룬다. Classic ABAP 문법처럼 앞당겨 섞지 않는다. |
| 제외 | tenant별 Launchpad role 세부 설정, 실제 고객 시스템별 OAuth/Principal Propagation 상세, 전체 Fiori app deployment | 환경 의존성이 크므로 확인 포인트와 실패 원인 중심으로 설명한다. |

## 공식 문서 수동 확인 메모

Classic ABAP/RAP 문서는 `C:\ABAP_DOCU_HTML`, ABAP Cloud/RAP/BDL 문서는 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU`에서 수동 확인했다. communication arrangement는 로컬 ABAP keyword 문서에서 충분히 확인되지 않아 SAP Help를 보조 확인했다.

| 범위 | 확인 문서 | CH36 반영 |
|---|---|---|
| RAP BDL lock | `ABENBDL_LOCKING.md`, `abenbdl_locking.htm` | `lock master`, `lock dependent by _Assoc`, draft lock 만료 후 optimistic phase 설명 |
| RAP BDL ETag | `ABENBDL_ETAG.md`, `abenbdl_etag.htm` | `etag master`, `etag dependent`, `total etag`, draft-enabled BO의 mandatory total ETag |
| Draft | `ABENBDL_WITH_DRAFT.md`, `ABENBDL_DRAFT_TABLE.md` | `with draft`, `draft table`, draft action, draft table 직접 SQL 수정 금지 |
| Authorization | `ABENBDL_AUTHORIZATION.md` | global/instance authorization, DCL read access와 BDEF operation authorization 분리 |
| EML transaction | `ABAPMODIFY_ENTITIES_LONG.md`, `ABAPCOMMIT_ENTITIES.md`, `ABAPROLLBACK_ENTITIES.md`, `ABAPIN_LOCAL_MODE.md`, `ABENRAP_SAVE_SEQ_GLOSRY.md` | 외부 consumer의 `MODIFY -> COMMIT/ROLLBACK`, provider 내부 commit 금지, `IN LOCAL MODE` 경계 |
| Release contract | `ABENABAP_RELEASE_CONTRACTS.md`, `ABENC0_CONTRACT_GLOSRY.md`, `ABENC1_CONTRACT_GLOSRY.md`, `ABENRELEASED_APIS.md`, `ABENRESTRICTED_APIS_ATC_CHECKS.md` | released API, C0/C1/C2 의미, ATC의 release contract check |
| Communication arrangement | SAP Help Communication Management, Communication Arrangements, Create Communication Arrangement | communication scenario, communication system, communication user, arrangement 운영 체크리스트 |

---

## NEWCH39-L01 · Capstone 업무 시나리오 정의

### 왜 필요한가

지금까지 학습자는 여러 기술을 따로 배웠다. CH03에서는 테이블과 필드를 만들었고, CH09에서는 DDIC 관계와 입력도움을 다뤘다. CH16에서는 Dynpro 화면을, CH17과 CH21에서는 ALV를, CH22와 CH23에서는 CDS와 RAP를 배웠다. CH24와 CH25에서는 DB 변경과 동시성 제어를, CH35에서는 테스트와 운영 품질을 배웠다.

하지만 실무 요청은 기술 이름으로 오지 않는다. 사용자는 "BDEF와 projection view를 만들어 주세요"라고 말하지 않는다. 사용자는 "공연을 선택해서 예매하고, 정원이 넘으면 막고, 취소할 수 있고, 작성 중이던 내용을 잃어버리지 않게 해 주세요"라고 말한다.

Capstone의 첫 단계는 이 요청을 개발자의 계층 구조로 번역하는 일이다. 이 번역이 흐리면 개발자는 화면부터 만들고, 나중에 validation을 붙이고, 다시 권한을 고치고, 또 draft를 추가하다가 구조를 계속 되돌리게 된다.

### 무엇인가

CH36의 Capstone은 콘서트 예매 RAP + Fiori 앱이다.

업무 시나리오는 다음과 같다.

1. 사용자는 Fiori List Report에서 공연 예매 목록을 본다.
2. 사용자는 새 예매를 만든다.
3. 시스템은 공연, 회차, 좌석 수, 고객 정보를 받는다.
4. 저장 시 남은 좌석보다 많은 좌석을 요청하면 저장을 막고 메시지를 보여 준다.
5. 정상 예매는 상태가 `N`으로 저장된다.
6. 사용자는 예매를 취소할 수 있다. 취소된 예매는 상태가 `C`가 된다.
7. 작성 중인 예매는 Draft로 보관된다.
8. 다른 사용자가 같은 active data를 바꾸면 lock과 ETag가 충돌을 막거나 감지한다.
9. 운영 노출 시 communication arrangement와 권한, released API, ATC를 확인한다.

이 시나리오는 계층별 책임으로 나뉜다.

| 계층 | 산출물 | 책임 |
|---|---|---|
| 업무 요구 | 정상 흐름, 실패 흐름, 완료 기준 | 무엇을 완성해야 하는지 고정한다. |
| 저장 | `ZBOOKING`, `ZCONCERT`, `ZPERF` | 영속 데이터와 기술 필드를 담는다. |
| Interface View | `ZI_Booking` | 예약을 RAP BO의 root entity로 만든다. |
| Projection View | `ZC_Booking` | Fiori와 서비스 소비자가 볼 모델을 만든다. |
| Behavior | BDEF/BIMP | create/update/delete, validation, action, draft, lock, auth를 선언하고 구현한다. |
| EML consumer | ABAP class/test/program | RAP BO를 프로그램에서 호출하고 commit/rollback을 확인한다. |
| Service | Service Definition/Binding | OData V4 UI 서비스로 노출한다. |
| UI | Fiori Elements | annotation과 behavior metadata를 읽어 화면을 만든다. |
| 운영 | ATC, Unit, Transport, Communication Management | 운영 시스템에 안전하게 반영하고 호출 가능하게 한다. |

### 어떻게 확인하는가

시나리오는 다음 질문에 답할 수 있어야 한다.

| 질문 | 기대 답 |
|---|---|
| root entity는 무엇인가? | 예매 한 건이 생성/수정/취소의 중심이므로 `Booking`이 root다. |
| 정원 초과는 어디서 막는가? | 화면이 아니라 Behavior Validation에서 막는다. |
| 취소 버튼은 무엇인가? | Fiori 버튼처럼 보이지만 RAP Action이다. |
| 작성 중 데이터는 어디에 있는가? | Draft table에 RAP framework가 관리하는 draft instance로 존재한다. |
| 동시 수정은 무엇으로 막는가? | editing 중에는 lock, lock 만료 후 재개 시에는 total ETag/ETag 확인이 필요하다. |
| 외부 프로그램이 예매를 만들면 언제 저장되는가? | `MODIFY ENTITIES`는 transactional buffer 변경이고, `COMMIT ENTITIES`가 save sequence를 트리거한다. |
| 운영 노출은 Service Binding만으로 끝나는가? | 내부 Preview는 가능하지만 외부 통신에는 communication scenario/system/user/arrangement가 필요할 수 있다. |

### 실수와 주의

첫 번째 실수는 "화면이 뜨면 완성"이라고 생각하는 것이다. Fiori Preview는 중요한 검증 도구지만, 권한 없는 사용자가 접근할 수 없는지, 정원 초과가 DB에 저장되지 않는지, draft가 정상적으로 재개되는지까지 확인해야 한다.

두 번째 실수는 validation을 UI에서만 처리하는 것이다. UI validation은 사용자 경험을 좋게 만들 수 있지만, API나 다른 consumer가 같은 서비스를 호출할 수 있다. 업무 규칙은 Behavior 쪽에 있어야 한다.

세 번째 실수는 Draft, lock, ETag를 모두 "동시성"이라는 한 단어로 뭉개는 것이다. lock은 지금 편집 중인 사람을 보호하는 비관적 제어이고, ETag는 내가 읽은 상태와 저장하려는 시점의 상태가 같은지 비교하는 낙관적 제어다. Draft의 total ETag는 draft에서 active data로 돌아갈 때 그 사이 active data가 바뀌었는지를 확인한다.

### 체험형 학습 설계

**Capstone Responsibility Board**

| 요소 | 설계 |
|---|---|
| 화면 | 좌측에는 "사용자 요청 카드", 중앙에는 계층 지도, 우측에는 선택한 계층의 책임 설명 |
| 버튼 | `요구사항 고정`, `계층 연결`, `실패 흐름 보기`, `운영 기준 보기` |
| 상태 | `초기`, `모델 설계`, `동작 설계`, `서비스 노출`, `운영 검증` |
| 데이터 | 요구 카드: "좌석 초과", "취소", "작성 중 복구", "외부 호출", "권한 없음" |
| 피드백 | "좌석 초과를 UI에만 배치했습니다. API 호출이 우회할 수 있으므로 Validation에 배치해야 합니다." |

### 정리

CH36의 목표는 기술을 많이 나열하는 것이 아니다. 하나의 업무 시나리오를 root entity, projection, behavior, EML, service, UI, 운영 체크리스트로 끝까지 연결하는 것이다.

---

## NEWCH39-L02 · `ZI_*` Interface View 설계

### 왜 필요한가

테이블은 저장 구조다. 테이블만 보면 "이 값이 어떤 업무 객체의 일부인가", "어떤 entity가 트랜잭션의 기준인가", "다른 entity와 어떤 관계인가"를 개발자가 계속 해석해야 한다.

RAP에서는 이 해석을 CDS data model로 명시한다. 특히 root view entity는 이후 BDEF의 기준점이 된다. root를 잘못 잡으면 action, validation, lock, authorization, service exposure가 모두 흔들린다.

### 무엇인가

`ZI_Booking`은 예매 업무 객체의 Interface View다. Interface View는 화면 장식보다 업무 객체의 구조를 안정적으로 만드는 계층이다.

예시는 다음과 같다.

```abap
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Booking Interface View'
define root view entity ZI_Booking
  as select from zbooking
    association [1..1] to ZI_Concert as _Concert
      on $projection.ConcertUUID = _Concert.ConcertUUID
    association [1..1] to ZI_Perf as _Perf
      on  $projection.ConcertUUID = _Perf.ConcertUUID
      and $projection.PerfUUID    = _Perf.PerfUUID
{
  key booking_uuid    as BookingUUID,
      concert_uuid    as ConcertUUID,
      perf_uuid       as PerfUUID,
      customer        as Customer,
      seats           as Seats,
      status          as Status,

      @Semantics.user.createdBy: true
      created_by      as CreatedBy,

      @Semantics.systemDateTime.createdAt: true
      created_at      as CreatedAt,

      @Semantics.systemDateTime.localInstanceLastChangedAt: true
      local_last_changed_at as LocalLastChangedAt,

      @Semantics.systemDateTime.lastChangedAt: true
      last_changed_at as LastChangedAt,

      _Concert,
      _Perf
}
```

여기서 중요한 필드는 `LocalLastChangedAt`과 `LastChangedAt`이다. `LocalLastChangedAt`은 entity instance의 ETag master field로 쓰기 좋고, `LastChangedAt`은 draft-enabled BO에서 total ETag field로 쓰기 좋다. 실제 프로젝트에서는 사용하는 data element와 timestamp 타입이 시스템 릴리스 기준과 맞아야 한다.

고급 composition 예매 구조가 필요하면 root 아래에 item entity를 둘 수 있다.

```abap
define root view entity ZI_Booking
  as select from zbooking
  composition [0..*] of ZI_BookingItem as _Items
{
  key booking_uuid as BookingUUID,
      status       as Status,
      _Items
}

define view entity ZI_BookingItem
  as select from zbooking_i
  association to parent ZI_Booking as _Booking
    on $projection.BookingUUID = _Booking.BookingUUID
{
  key booking_uuid as BookingUUID,
  key item_no      as ItemNo,
      seat_no      as SeatNo,
      _Booking
}
```

이 장의 기본 앱은 단순화를 위해 `Booking` root 중심으로 설명한다. 다만 composition과 to-parent association은 CH22에서 보류된 RAP 구조 이해를 CH36에서 읽을 수 있게 해 주기 위해 여기서 지도만 제공한다.

### 어떻게 확인하는가

1. `ZI_Booking`을 활성화한다.
2. key가 instance를 식별하기에 충분한지 확인한다.
3. `_Concert`, `_Perf` association이 정의만 된 것이 아니라 projection list에 노출되었는지 확인한다.
4. timestamp 필드가 BDEF의 ETag/total ETag 후보로 쓸 수 있는 타입과 annotation을 갖는지 확인한다.
5. composition을 쓴다면 child entity에 to-parent association이 있고, root에서 composition이 노출되는지 확인한다.

### 실수와 주의

`association`과 `composition`을 같은 말로 생각하면 안 된다. association은 관련 대상을 따라갈 수 있는 관계이고, composition은 root가 child의 생명주기까지 책임지는 강한 포함 관계다.

또한 `$projection` 이름은 현재 CDS에서 노출하는 alias 기준이다. DB table의 원래 필드명과 CDS alias를 섞어 쓰면 활성화 오류가 난다.

ETag 후보 필드를 나중에 추가하려고 하면 BDEF, table, draft table, UI, test가 모두 다시 흔들릴 수 있다. CH36에서는 처음부터 `local_last_changed_at`과 `last_changed_at` 같은 변경 추적 필드를 설계에 넣는다.

### 체험형 학습 설계

**RAP Data Model Inspector**

| 요소 | 설계 |
|---|---|
| 버튼 | `root 표시`, `association 표시`, `composition 표시`, `ETag 후보 표시` |
| 상태 | 선택한 코드 라인에 따라 root, 관계, timestamp, auth 관련 설명 전환 |
| 데이터 | `Booking`, `Concert`, `Perf`, 선택 확장 `BookingItem` |
| 피드백 | association만 만들고 projection list에서 누락하면 "후속 projection/service에서 탐색 경로가 보이지 않습니다." 표시 |

### 정리

Interface View는 테이블을 업무 객체로 끌어올리는 계층이다. CH36에서는 root, association, optional composition, timestamp 필드를 처음부터 설계해 이후 BDEF의 lock/ETag/draft/auth가 붙을 자리를 만든다.

---

## NEWCH39-L03 · `ZC_*` Projection View와 UI annotation

### 왜 필요한가

Interface View는 업무 객체의 중심 모델이다. 하지만 Fiori 화면이나 외부 서비스 소비자에게 그대로 내보내기에는 너무 내부 모델에 가깝다. 어떤 필드를 목록에 보여 줄지, 상세 화면에서 무엇을 먼저 보여 줄지, 어떤 association을 서비스 소비자에게 허용할지 별도로 정해야 한다.

Projection View는 이 소비 계약을 만든다. 여기서 "보여 줄 모델"과 "저장할 모델"의 책임을 분리한다.

### 무엇인가

`ZC_Booking`은 Fiori UI와 OData 서비스가 소비할 Projection View다.

```abap
@AccessControl.authorizationCheck: #CHECK
@Metadata.allowExtensions: true
@EndUserText.label: 'Booking Consumption View'
define root view entity ZC_Booking
  provider contract transactional_query
  as projection on ZI_Booking
{
  key BookingUUID,

      @UI.lineItem: [ { position: 10, label: 'Concert' } ]
      @UI.identification: [ { position: 10, label: 'Concert' } ]
      ConcertUUID,

      @UI.lineItem: [ { position: 20, label: 'Performance' } ]
      @UI.identification: [ { position: 20, label: 'Performance' } ]
      PerfUUID,

      @UI.lineItem: [ { position: 30, label: 'Customer' } ]
      @UI.identification: [ { position: 30, label: 'Customer' } ]
      Customer,

      @UI.lineItem: [ { position: 40, label: 'Seats' } ]
      @UI.identification: [ { position: 40, label: 'Seats' } ]
      Seats,

      @UI.lineItem: [ { position: 50, label: 'Status' } ]
      @UI.identification: [ { position: 50, label: 'Status' } ]
      Status,

      LocalLastChangedAt,
      LastChangedAt,
      _Concert,
      _Perf
}
```

`provider contract transactional_query`는 이 projection이 transactional UI/service 소비에 쓰이는 계약임을 드러낸다. `@UI.lineItem`은 List Report의 컬럼 후보이고, `@UI.identification`은 Object Page의 주요 필드 후보다.

애노테이션이 많아지면 Metadata Extension으로 옮긴다.

```abap
@Metadata.layer: #CUSTOMER
annotate view ZC_Booking with
{
  @UI.facet: [
    { id: 'Booking',
      purpose: #STANDARD,
      type: #IDENTIFICATION_REFERENCE,
      label: 'Booking',
      position: 10 }
  ]
  BookingUUID;
}
```

### 어떻게 확인하는가

1. Projection View를 활성화한다.
2. `provider contract transactional_query`가 현재 view의 용도와 맞는지 확인한다.
3. `@UI.lineItem`이 붙은 필드가 List Report에 나올 수 있는지 확인한다.
4. `@UI.identification`과 facet이 Object Page에 기대한 구조를 만들 수 있는지 확인한다.
5. `_Concert`, `_Perf`를 노출해야 하는 이유가 있는지 확인한다. 필요 없는 association을 습관적으로 노출하지 않는다.

### 실수와 주의

Projection View를 Interface View 복사본으로 만들면 책임이 흐려진다. Projection은 소비자 계약이므로 필드 노출, annotation, alias, association 노출을 의도적으로 결정해야 한다.

반대로 UI annotation에 업무 규칙을 기대해도 안 된다. `@UI.lineItem`은 목록 컬럼을 만든다. 좌석 초과를 막지는 않는다. 정원 초과는 Behavior Validation이 책임진다.

### 체험형 학습 설계

**Fiori Annotation Preview Lab**

| 요소 | 설계 |
|---|---|
| 버튼 | `List Report 보기`, `Object Page 보기`, `Facet 추가`, `Annotation 위치 오류` |
| 상태 | annotation 적용 전/후, metadata extension 분리 전/후 |
| 데이터 | `ConcertUUID`, `PerfUUID`, `Customer`, `Seats`, `Status` |
| 피드백 | "annotation이 화면 배치를 돕지만 behavior를 대신하지 않습니다." |

### 정리

Projection View는 UI와 service가 소비할 계약이다. `ZI_*`가 업무 객체의 뼈대라면 `ZC_*`는 외부 소비자가 볼 표면이다.

---

## NEWCH39-L04 · BDEF/BIMP로 예매 동작 계약 선언

### 왜 필요한가

CDS는 데이터를 읽는 구조를 만든다. 그러나 예매 앱은 읽기만 하지 않는다. 생성하고, 수정하고, 취소하고, 저장 전에 검증하고, draft를 관리하고, 동시에 수정할 때 충돌을 막아야 한다.

RAP에서는 이 동작 계약을 BDEF가 선언한다. Behavior Pool은 선언된 계약의 실제 ABAP 로직을 구현한다.

### 무엇인가

CH36의 핵심 BDEF는 다음 구조를 갖는다.

```abap
managed implementation in class zbp_i_booking unique;
strict ( 2 );
with draft;

define behavior for ZI_Booking alias Booking
persistent table zbooking
draft table zbooking_d
lock master
total etag LastChangedAt
etag master LocalLastChangedAt
authorization master ( global, instance )
{
  create;
  update;
  delete;

  field ( readonly ) BookingUUID, CreatedBy, CreatedAt,
                     LocalLastChangedAt, LastChangedAt;

  determination setDefaults on modify { create; }
  validation validateCapacity on save { field ConcertUUID, PerfUUID, Seats; }
  action ( features : instance ) cancelBooking result [1] $self;

  draft action Activate optimized;
  draft action Discard;
  draft action Edit;
  draft action Resume;
  draft determine action Prepare;

  mapping for zbooking
  {
    BookingUUID          = booking_uuid;
    ConcertUUID          = concert_uuid;
    PerfUUID             = perf_uuid;
    Customer             = customer;
    Seats                = seats;
    Status               = status;
    CreatedBy            = created_by;
    CreatedAt            = created_at;
    LocalLastChangedAt   = local_last_changed_at;
    LastChangedAt        = last_changed_at;
  }
}
```

각 선언의 의미는 다음과 같다.

| 선언 | 의미 |
|---|---|
| `managed implementation` | 표준 CUD와 transactional buffer의 많은 부분을 RAP managed provider가 맡는다. |
| `strict ( 2 )` | 엄격한 BDL 규칙을 적용해 계약을 더 명확히 한다. |
| `with draft` | BO 전체를 draft-enabled로 만든다. entity별 일부 draft가 아니라 BO 전체 개념이다. |
| `persistent table` | active data가 저장되는 table이다. |
| `draft table` | draft data가 저장되는 table이다. RAP framework가 관리한다. |
| `lock master` | root가 lock 기준이다. child가 있으면 child는 `lock dependent by _Assoc`로 연결한다. |
| `total etag` | draft-enabled BO에서 active와 draft 사이 재개 충돌을 확인하는 필수 ETag다. |
| `etag master` | active data 변경 상태를 나타내는 ETag field다. |
| `authorization master` | operation/action 권한 제어의 기준 entity다. |
| `validation` | 저장 가능한지 검사한다. 실패 시 `failed`와 `reported`를 채운다. |
| `action` | 취소처럼 사용자가 실행하는 업무 명령을 선언한다. |

Behavior Pool의 handler method skeleton은 다음처럼 읽는다.

```abap
CLASS lhc_booking DEFINITION
  INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS setDefaults
      FOR DETERMINE ON MODIFY
      IMPORTING keys FOR Booking~setDefaults.

    METHODS validateCapacity
      FOR VALIDATE ON SAVE
      IMPORTING keys FOR Booking~validateCapacity.

    METHODS cancelBooking
      FOR MODIFY
      IMPORTING keys FOR ACTION Booking~cancelBooking
      RESULT result.

    METHODS get_global_authorizations
      FOR GLOBAL AUTHORIZATION
      IMPORTING REQUEST requested_authorizations FOR Booking
      RESULT result.

    METHODS get_instance_authorizations
      FOR INSTANCE AUTHORIZATION
      IMPORTING keys REQUEST requested_authorizations FOR Booking
      RESULT result.
ENDCLASS.
```

### 어떻게 확인하는가

1. BDEF를 활성화한다.
2. draft를 켰다면 draft table이 정확한 필드와 draft admin include를 갖는지 확인한다.
3. `total etag`가 `lock master` 바로 뒤에 위치하는지 확인한다.
4. `etag master` field가 변경 때마다 갱신되는 필드인지 확인한다.
5. `authorization master`를 선언했다면 handler method가 생성되고 구현할 준비가 되었는지 확인한다.
6. ADT quick fix로 Behavior Pool method skeleton이 생성되는지 확인한다.

### 실수와 주의

`draft table`은 일반 DDIC table처럼 보이지만 마음대로 SQL로 지우거나 고치는 대상이 아니다. 공식 문서는 draft table이 RAP transactional engine의 metadata와 함께 관리된다고 설명한다. 정리나 폐기는 RAP draft action 또는 framework 흐름을 사용해야 한다.

`lock master`만 쓰면 모든 동시성 문제가 끝난다고 생각해도 안 된다. Draft lock은 일정 시간 후 만료될 수 있고, 그 후에는 optimistic phase에서 ETag/total ETag가 중요해진다.

`authorization master ( global, instance )`를 선언하고 구현을 비워 두면 권한 설계를 한 것이 아니다. 선언은 계약이고, 실제 판단은 handler method에서 구현해야 한다.

### 체험형 학습 설계

**BDEF Contract Builder**

| 요소 | 설계 |
|---|---|
| 버튼 | `draft 켜기`, `lock master 추가`, `total etag 추가`, `authorization master 추가`, `action 추가` |
| 상태 | BDEF 활성화 가능/불가능, 누락 계약 표시 |
| 데이터 | BDEF source fragment, 오류 목록, quick fix 안내 |
| 피드백 | draft를 켜고 total ETag를 누락하면 "draft-enabled BO에는 total ETag가 필요합니다." 표시 |

### 정리

BDEF는 RAP BO의 동작 계약이다. CH36에서는 create/update/delete만 선언하지 않고, 운영 가능한 앱에 필요한 draft, lock, ETag, authorization까지 계약에 포함한다.

---

## NEWCH39-L05 · Action / Validation / Determination 구현

### 왜 필요한가

BDEF가 계약이라면 Behavior Pool은 실제 업무 판단이다. 생성 시 기본 상태를 넣는 일, 정원 초과를 막는 일, 취소 action으로 상태를 바꾸는 일은 모두 사용자가 화면에서 느끼는 핵심 기능이다.

이 로직을 아무 데나 넣으면 앱이 불안정해진다. 기본값은 determination, 저장 가능성 판단은 validation, 사용자가 누르는 업무 명령은 action으로 나누어야 한다.

### 무엇인가

기본값 determination은 생성된 booking에 초기 상태와 생성자를 채운다.

```abap
METHOD setDefaults.
  READ ENTITIES OF ZI_Booking IN LOCAL MODE
    ENTITY Booking
    FIELDS ( BookingUUID Status CreatedBy )
    WITH CORRESPONDING #( keys )
    RESULT DATA(bookings).

  DATA updates TYPE TABLE FOR UPDATE ZI_Booking.

  LOOP AT bookings INTO DATA(booking).
    APPEND VALUE #(
      %tky      = booking-%tky
      Status    = 'N'
      CreatedBy = sy-uname
      %control-Status    = if_abap_behv=>mk-on
      %control-CreatedBy = if_abap_behv=>mk-on
    ) TO updates.
  ENDLOOP.

  MODIFY ENTITIES OF ZI_Booking IN LOCAL MODE
    ENTITY Booking
    UPDATE FROM updates
    FAILED DATA(failed_update)
    REPORTED DATA(reported_update).
ENDMETHOD.
```

Validation은 "고치기"가 아니라 "검사하고 거부하기"다. 정원 초과를 발견하면 `failed-booking`과 `reported-booking`을 채운다.

```abap
METHOD validateCapacity.
  READ ENTITIES OF ZI_Booking IN LOCAL MODE
    ENTITY Booking
    FIELDS ( BookingUUID ConcertUUID PerfUUID Seats )
    WITH CORRESPONDING #( keys )
    RESULT DATA(bookings).

  LOOP AT bookings INTO DATA(booking).
    " 예시: 실제 구현에서는 회차 정원과 기존 예약 합계를 읽어 비교한다.
    DATA(capacity_ok) = abap_true.

    IF capacity_ok = abap_false.
      APPEND VALUE #( %tky = booking-%tky ) TO failed-booking.
      APPEND VALUE #(
        %tky = booking-%tky
        %msg = new_message_with_text(
                 severity = if_abap_behv_message=>severity-error
                 text     = '남은 좌석보다 많은 좌석을 예약할 수 없습니다.' )
      ) TO reported-booking.
    ENDIF.
  ENDLOOP.
ENDMETHOD.
```

취소 action은 상태를 `C`로 바꾸고, action result에 변경 후 instance를 돌려준다.

```abap
METHOD cancelBooking.
  DATA updates TYPE TABLE FOR UPDATE ZI_Booking.

  LOOP AT keys INTO DATA(key).
    APPEND VALUE #(
      %tky = key-%tky
      Status = 'C'
      %control-Status = if_abap_behv=>mk-on
    ) TO updates.
  ENDLOOP.

  MODIFY ENTITIES OF ZI_Booking IN LOCAL MODE
    ENTITY Booking
    UPDATE FROM updates
    FAILED DATA(failed_cancel)
    REPORTED DATA(reported_cancel).

  READ ENTITIES OF ZI_Booking IN LOCAL MODE
    ENTITY Booking
    ALL FIELDS WITH CORRESPONDING #( keys )
    RESULT DATA(changed_bookings).

  result = VALUE #(
    FOR changed IN changed_bookings
    ( %tky = changed-%tky
      %param = changed ) ).
ENDMETHOD.
```

`IN LOCAL MODE`는 Behavior implementation 내부에서 같은 BO를 다룰 때 쓰는 도구다. feature control, authorization, precheck를 억제할 수 있으므로 외부 consumer가 권한을 피하려고 붙이는 문법이 아니다.

### 어떻게 확인하는가

| 확인 | 방법 |
|---|---|
| 기본값 | Fiori에서 새 예매 생성 후 status가 `N`으로 설정되는지 확인 |
| 정원 초과 | `Seats`를 회차 잔여석보다 크게 입력하고 저장 실패 메시지 확인 |
| 취소 action | 정상 예매에서 `cancelBooking` 실행 후 status가 `C`로 바뀌는지 확인 |
| 메시지 | Fiori 메시지 영역에 사용자가 이해할 수 있는 문장이 나오는지 확인 |
| 실패 응답 | ABAP Unit 또는 EML test에서 `failed`와 `reported`가 채워지는지 확인 |

### 실수와 주의

Validation 안에서 데이터를 고치려 하면 책임이 흐려진다. validation은 검사와 거부가 중심이다. 자동 보정은 determination에서 한다.

Handler method는 여러 instance가 한 번에 들어올 수 있다는 점을 항상 생각해야 한다. `keys[ 1 ]`만 처리하는 코드는 단건 테스트에서는 통과하지만 실제 OData batch나 다건 요청에서 깨진다.

`IN LOCAL MODE`를 외부 프로그램 예제로 남용하면 학습자가 권한과 feature control을 우회하는 습관을 들인다. 외부 consumer는 일반 EML 흐름을 써야 한다.

### 체험형 학습 설계

**Behavior Logic Simulator**

| 요소 | 설계 |
|---|---|
| 버튼 | `Create Draft`, `Set Defaults`, `Save 정상`, `Save 좌석초과`, `Cancel` |
| 상태 | `draft`, `validated`, `failed`, `saved`, `cancelled` |
| 데이터 | booking row, transactional buffer, `failed`, `reported`, action result |
| 피드백 | validation에서 update를 시도하면 "검증은 고치는 곳이 아니라 저장을 허용/거부하는 곳입니다." 표시 |

### 정리

Determination, Validation, Action은 모두 Behavior Pool에서 구현하지만 책임이 다르다. 기본값은 determination, 저장 가능성 판단은 validation, 사용자 명령은 action이다.

---

## NEWCH39-L06 · 외부 EML consumer: `MODIFY`에서 `COMMIT`까지

### 왜 필요한가

CH23에서 `MODIFY ENTITIES`, `COMMIT ENTITIES`, `ROLLBACK ENTITIES`의 개념 지도를 보강했다. CH36에서는 그 지도를 실제 Capstone 앱에 적용해야 한다.

비전공자 입장에서 가장 큰 오해는 `MODIFY ENTITIES`를 DB 저장으로 생각하는 것이다. RAP에서 `MODIFY ENTITIES`는 transactional buffer에 변경 요청을 넣는다. 저장은 save sequence가 성공해야 DB에 반영된다.

### 무엇인가

외부 ABAP class, 테스트 코드, 수동 EML consumer가 예매를 만들 때 흐름은 다음과 같다.

```abap
DATA create_bookings TYPE TABLE FOR CREATE ZI_Booking.

APPEND VALUE #(
  %cid = 'BOOK_001'
  ConcertUUID = 'C001'
  PerfUUID    = 'P001'
  Customer    = 'Jung Hunyoung'
  Seats       = 2
  %control-ConcertUUID = if_abap_behv=>mk-on
  %control-PerfUUID    = if_abap_behv=>mk-on
  %control-Customer    = if_abap_behv=>mk-on
  %control-Seats       = if_abap_behv=>mk-on
) TO create_bookings.

MODIFY ENTITIES OF ZI_Booking
  ENTITY Booking
  CREATE FROM create_bookings
  MAPPED DATA(mapped)
  FAILED DATA(failed)
  REPORTED DATA(reported).

IF failed-booking IS INITIAL.
  COMMIT ENTITIES
    RESPONSE OF ZI_Booking
    FAILED DATA(commit_failed)
    REPORTED DATA(commit_reported).

  IF sy-subrc <> 0 OR commit_failed-booking IS NOT INITIAL.
    ROLLBACK ENTITIES.
  ENDIF.
ELSE.
  ROLLBACK ENTITIES.
ENDIF.
```

이 코드는 세 구간으로 나뉜다.

| 구간 | 의미 |
|---|---|
| `CREATE FROM create_bookings` | RAP BO instance 생성 요청을 transactional buffer에 넣는다. |
| `FAILED`/`REPORTED` | interaction phase에서 실패한 instance와 메시지를 받는다. |
| `COMMIT ENTITIES` | RAP save sequence를 트리거하고 DB 반영을 시도한다. |
| `ROLLBACK ENTITIES` | 현재 RAP transaction의 buffer와 lock을 정리한다. |

Fiori/OData처럼 RAP runtime이 transaction owner인 경우에는 runtime이 commit/rollback을 수행한다. 그래서 Fiori action handler 안에 `COMMIT ENTITIES`를 직접 넣는 식으로 이해하면 안 된다. 외부 ABAP consumer가 EML을 직접 호출할 때 commit/rollback 책임이 드러난다.

### 어떻게 확인하는가

1. 정상 create 데이터를 넣고 `MODIFY ENTITIES` 후 `COMMIT ENTITIES`를 실행한다.
2. DB 또는 READ ENTITIES로 생성된 booking을 확인한다.
3. 좌석 초과 데이터를 넣고 `failed` 또는 `commit_failed`가 채워지는지 확인한다.
4. 실패 후 `ROLLBACK ENTITIES`를 호출하고 DB에 반영되지 않았는지 확인한다.
5. 같은 로직을 Fiori Preview와 비교한다. Fiori에서는 commit을 직접 호출하지 않아야 한다.

### 실수와 주의

`MODIFY ENTITIES` 뒤에 바로 `SELECT`해서 DB 저장을 기대하면 안 된다. 아직 transactional buffer일 수 있다.

`FAILED`를 받지 않거나 무시하면 실패한 요청을 성공으로 착각한다. 공식 문서도 consumer 쪽 proper error handling을 강조한다.

EML을 loop 안에서 반복 호출하면 성능과 일관성 문제가 생기기 쉽다. 가능한 한 여러 instance를 internal table로 모아 한 번의 EML request로 처리한다.

### 체험형 학습 설계

**RAP Transaction Console**

| 요소 | 설계 |
|---|---|
| 버튼 | `MODIFY 실행`, `COMMIT 실행`, `ROLLBACK 실행`, `좌석초과 데이터 넣기`, `DB 확인` |
| 상태 | `initial`, `buffer changed`, `save sequence`, `committed`, `rolled back`, `failed` |
| 데이터 | input table, transactional buffer, `mapped`, `failed`, `reported`, DB table |
| 피드백 | commit 전 DB 확인 시 "아직 transactional buffer입니다. save sequence가 실행되지 않았습니다." 표시 |

### 정리

외부 EML consumer는 RAP BO를 프로그램에서 다루는 방법이다. `MODIFY ENTITIES`는 요청, `COMMIT ENTITIES`는 저장 트리거, `ROLLBACK ENTITIES`는 정리다. 이 차이를 이해해야 RAP 앱을 테스트하고 운영 문제를 추적할 수 있다.

---

## NEWCH39-L07 · Service Binding과 Fiori Elements Preview

### 왜 필요한가

RAP BO가 완성되어도 사용자가 접근할 서비스가 없으면 앱이 아니다. Service Definition은 어떤 entity를 노출할지 정하고, Service Binding은 어떤 프로토콜과 소비 형태로 노출할지 연결한다.

CH36에서는 OData V4 UI service와 Fiori Elements Preview를 사용해 Capstone을 확인한다.

### 무엇인가

Service Definition은 다음처럼 작성한다.

```abap
@EndUserText.label: 'Booking UI Service'
define service ZUI_Booking {
  expose ZC_Booking as Booking;
  expose ZI_Concert as Concert;
  expose ZI_Perf    as Performance;
}
```

Service Binding에서는 `ZUI_Booking`을 OData V4 UI service로 연결한다. ADT에서 binding을 만들고 activate/publish하면 Fiori Elements Preview로 List Report와 Object Page를 확인할 수 있다.

Preview에서 확인할 항목은 다음과 같다.

| 확인 항목 | 기준 |
|---|---|
| 목록 | `@UI.lineItem` 필드가 기대 순서로 보이는가 |
| 상세 | `@UI.identification`과 facet이 Object Page를 구성하는가 |
| 생성 | BDEF `create;`가 UI에서 생성 흐름으로 보이는가 |
| 수정/삭제 | BDEF operation과 field readonly가 UI behavior에 반영되는가 |
| 취소 | `cancelBooking` action이 버튼으로 보이고 상태를 바꾸는가 |
| 정원 초과 | validation 메시지가 사용자 문장으로 표시되는가 |
| Draft | Edit, Save/Activate, Discard, Resume 흐름이 자연스러운가 |

### 어떻게 확인하는가

1. Service Definition 활성화.
2. Service Binding 생성. CH36에서는 OData V4 UI 기준.
3. Binding 활성화 및 publish.
4. `Booking` entity set으로 Preview 실행.
5. 새 booking 생성, 좌석 초과 저장, 정상 저장, 취소 action, draft resume을 차례로 확인.
6. 브라우저 developer tool 또는 ADT error log에서 metadata/service 오류를 확인.

### 실수와 주의

Service Definition만 만들고 Service Binding을 만들지 않으면 실제 소비 경로가 없다.

Fiori Elements가 화면을 자동으로 만든다고 해서 아무 annotation 없이 좋은 화면이 나오지는 않는다. Fiori Elements는 선언된 metadata를 읽는다.

Preview는 학습과 빠른 검증 도구다. 운영 배포에는 role, catalog, tile, destination, communication arrangement 같은 환경 설정이 따로 들어갈 수 있다.

### 체험형 학습 설계

**Service to Fiori Flow**

| 요소 | 설계 |
|---|---|
| 버튼 | `Service Definition 활성화`, `Binding 생성`, `Publish`, `Preview`, `Create`, `Cancel`, `Draft Resume` |
| 상태 | inactive, active, published, preview open, validation failed, action done |
| 데이터 | service entity set, metadata field list, Fiori list/object page mock |
| 피드백 | binding 미활성 상태에서 preview를 누르면 "서비스 소비 경로가 아직 열리지 않았습니다." 표시 |

### 정리

Service Binding은 RAP BO와 Fiori 소비 경험을 연결하는 관문이다. 이 단계에서 CDS annotation, BDEF operation, validation message, action result, draft 상태가 한 번에 드러난다.

---

## NEWCH39-L08 · Draft, Lock, ETag, Authorization 심화

### 왜 필요한가

운영 앱에서는 여러 사용자가 같은 데이터를 다룬다. 한 사용자가 예약을 편집하는 동안 다른 사용자가 같은 예약을 바꿀 수 있다. 작성 중 브라우저를 닫았다가 다시 들어올 수도 있다. 사용자는 권한이 있는 데이터만 봐야 하고, 허용된 action만 실행해야 한다.

CH25에서 classic lock을 배웠다면, CH36에서는 RAP의 lock/ETag/draft/auth 조합을 이해해야 한다.

### 무엇인가

#### Lock

`lock master`는 RAP BO instance를 편집할 때 비관적 동시성 제어를 제공한다. root가 lock master이면 root와 lock-dependent child가 하나의 BO instance 단위로 보호된다.

```abap
define behavior for ZI_Booking alias Booking
persistent table zbooking
lock master
{
  update;
  delete;
}
```

child entity가 있다면 다음처럼 의존시킨다.

```abap
define behavior for ZI_BookingItem alias Item
lock dependent by _Booking
{
  update;
  delete;
  association _Booking;
}
```

#### ETag

ETag는 낙관적 동시성 제어다. 사용자가 읽은 상태와 저장 요청 시점의 상태가 같은지 비교한다.

```abap
define behavior for ZI_Booking alias Booking
persistent table zbooking
lock master
total etag LastChangedAt
etag master LocalLastChangedAt
{
  update;
}
```

`etag master`는 active data의 상태 비교에 쓰이고, `etag dependent by _Assoc`는 자신의 ETag field가 아니라 master entity의 ETag를 쓰는 경우에 사용한다.

#### Total ETag

`total etag`는 draft-enabled BO에서 중요하다. 사용자가 draft를 만들고 자리를 비운 동안 exclusive lock이 만료될 수 있다. 그 사이 active data가 바뀌면 draft resume이 위험해진다. total ETag는 draft와 active 사이 전환에서 active data가 바뀌었는지 확인하는 기준이다.

공식 문서 기준으로 draft-enabled RAP BO에서는 total ETag가 필수다. 또한 total ETag는 lock master entity의 entity behavior characteristics에 정의된다.

#### Authorization

권한은 두 층으로 분리한다.

| 층 | 담당 |
|---|---|
| DCL | read access. 어떤 row를 볼 수 있는가 |
| BDEF authorization | operation/action access. 생성, 수정, 삭제, 취소를 할 수 있는가 |

```abap
define behavior for ZI_Booking alias Booking
authorization master ( global, instance )
{
  create;
  update;
  delete;
  action ( authorization : instance, features : instance )
    cancelBooking result [1] $self;
}
```

`global`은 전체 BO나 operation 수준의 권한이다. 예를 들어 "예매 생성 권한이 있는가"를 확인한다. `instance`는 instance 상태나 소유자에 따라 달라지는 권한이다. 예를 들어 "이 예매를 취소할 수 있는 사용자인가"를 확인한다.

### 어떻게 확인하는가

| 시나리오 | 확인 |
|---|---|
| 사용자 A가 booking을 편집 중 | 사용자 B가 같은 booking을 수정하려 할 때 lock 충돌이 나는가 |
| Draft 생성 후 lock 만료 | active data가 바뀌었을 때 resume이 total ETag로 막히는가 |
| 사용자 권한 없음 | DCL로 목록에서 보이지 않거나 BDEF authorization으로 action이 거부되는가 |
| 외부 consumer 호출 | UI 버튼 숨김과 무관하게 operation 권한이 서버에서 적용되는가 |
| Projection/service | base BO의 lock/auth/ETag가 projection 소비에서도 의도대로 재사용되는가 |

### 실수와 주의

버튼 숨김을 권한이라고 생각하면 안 된다. 버튼은 사용자 경험이다. 실제 보호는 DCL과 BDEF authorization, 그리고 handler implementation에서 한다.

`IN LOCAL MODE`는 authorization check를 억제할 수 있으므로 외부 consumer에서 권한 회피 수단처럼 쓰면 안 된다. Behavior implementation 내부에서 같은 BO의 내부 로직을 구현할 때만 경계를 이해하고 사용한다.

Draft table을 직접 SQL로 정리하면 metadata가 꼬일 수 있다. RAP draft action과 framework 흐름을 사용한다.

ETag field를 사용한다면 변경 때마다 안정적으로 갱신되어야 한다. managed RAP에서 특정 annotation과 타입 조건을 만족하면 provider가 자동으로 처리할 수 있지만, unmanaged에서는 개발자가 save sequence에서 책임져야 한다.

### 체험형 학습 설계

**Concurrency and Authorization Lab**

| 요소 | 설계 |
|---|---|
| 버튼 | `사용자 A 편집 시작`, `사용자 B 저장 시도`, `Lock 만료`, `Active Data 변경`, `Draft Resume`, `권한 없는 사용자 전환` |
| 상태 | exclusive lock, optimistic phase, ETag match, ETag conflict, auth denied |
| 데이터 | active row, draft row, `LocalLastChangedAt`, `LastChangedAt`, user role |
| 피드백 | lock 만료 후 active data를 바꾸고 resume하면 "exclusive lock은 끝났지만 total ETag가 변경을 감지했습니다." 표시 |

### 정리

RAP 운영 품질은 Draft, lock, ETag, authorization이 함께 맞아야 한다. lock은 편집 중 충돌을 막고, ETag는 읽은 상태와 저장 상태의 불일치를 감지하며, authorization은 볼 수 있는 것과 할 수 있는 것을 나눈다.

---

## NEWCH39-L09 · Communication Arrangement와 운영 마감

### 왜 필요한가

Service Binding Preview로 화면이 뜨는 것은 개발자 검증이다. 운영에서는 다른 시스템, 외부 도구, 통합 계층, 사용자 역할이 서비스를 안전하게 호출해야 한다. ABAP Cloud나 S/4HANA Cloud 계열에서는 communication management가 이 연결을 관리한다.

또한 Clean Core 관점에서는 내가 쓰는 API가 released API인지, release contract를 지키는지, ATC에서 restricted API 위반이 없는지 확인해야 한다.

### 무엇인가

운영 노출은 다음 흐름으로 이해한다.

| 개념 | 의미 |
|---|---|
| Communication Scenario | 어떤 inbound/outbound service와 인증 방식을 허용할지 묶은 시나리오 |
| Communication System | 통신 상대 시스템. 외부 시스템의 host, user, authentication 정보와 연결된다. |
| Communication User | 기술 통신에 쓰이는 사용자 또는 인증 주체 |
| Communication Arrangement | scenario와 system/user를 실제 연결한 운영 설정 |
| Service Binding | ABAP 개발 객체로서 service definition을 OData 등으로 노출하는 binding |

CH36의 학습 앱에서는 Fiori Preview 중심이지만, 외부 시스템이 이 서비스를 호출한다면 communication scenario와 arrangement를 검토해야 한다. tenant와 제품군에 따라 화면 명칭과 절차는 달라질 수 있으므로, 본문은 클릭 순서 암기가 아니라 체크리스트 중심으로 둔다.

운영 체크리스트는 다음과 같다.

| 단계 | 확인 |
|---|---|
| Service Binding | OData V4 service가 활성화/publish되었는가 |
| Authorization | 호출 사용자에게 필요한 business role과 DCL/BDEF 권한이 있는가 |
| Communication Scenario | 필요한 inbound service가 scenario에 포함되어 있는가 |
| Communication System | 호출 주체와 인증 방식이 정확히 설정되었는가 |
| Communication Arrangement | scenario, system, user, service endpoint가 연결되었는가 |
| Test Call | metadata, read, create/action 호출이 expected status와 message를 반환하는가 |
| Log/Trace | 실패 시 Application Log, HTTP trace, Gateway/OData error에서 원인을 찾을 수 있는가 |

Release contract와 Clean Core는 다음처럼 본다.

| 개념 | CH36에서의 의미 |
|---|---|
| released API | restricted ABAP language version에서 안정적으로 사용할 수 있는 공개 API |
| release contract C0 | 확장 지점 안정성. enhancement/custom field 같은 확장과 관련 |
| release contract C1 | 시스템 내부 사용을 위한 안정적 public interface |
| release contract C2 | 외부 remote API 소비자를 위한 안정적 public interface |
| ATC contract check | released API와 restricted API 사용 규칙 위반을 검사 |

### 어떻게 확인하는가

1. ADT에서 Service Binding이 활성화/publish되었는지 확인한다.
2. Fiori Preview에서 기본 기능을 확인한다.
3. 외부 호출이 필요한 경우, 운영 환경에서 communication scenario가 필요한 서비스와 인증 방식을 포함하는지 확인한다.
4. Communication Arrangements app에서 scenario, communication system, communication user가 연결되었는지 확인한다.
5. 호출 실패 시 401/403은 인증/권한, 404는 endpoint/binding, 400은 payload/validation, 500은 provider 로직이나 backend 오류로 분류해 본다.
6. ATC에서 ABAP Cloud readiness, released API usage, security/performance check를 실행한다.
7. Transport에 CDS, BDEF, behavior pool, service definition, service binding, DCL, message class, tables, draft table, test class가 포함되었는지 확인한다.

### 실수와 주의

Service Binding과 Communication Arrangement를 같은 것으로 생각하면 안 된다. Service Binding은 개발 객체의 service 노출이고, Communication Arrangement는 운영 통신 설정이다.

권한 오류를 CORS나 URL 문제로 단정하지 않는다. 같은 endpoint라도 사용자 역할, DCL, BDEF authorization, communication user 설정에 따라 결과가 달라진다.

release contract는 "문서상 좋은 말"이 아니라 업그레이드 안정성의 계약이다. unreleased SAP object에 의존하면 현재는 동작해도 업그레이드 후 깨질 수 있다.

### 체험형 학습 설계

**Service Operations Checklist**

| 요소 | 설계 |
|---|---|
| 버튼 | `Binding 확인`, `Scenario 선택`, `System 연결`, `User 연결`, `Arrangement 생성`, `ATC 실행`, `Transport 확인` |
| 상태 | dev preview, integration ready, auth failed, contract violation, transport ready |
| 데이터 | endpoint URL, user role, scenario id, service list, ATC finding list |
| 피드백 | communication system 없이 arrangement를 만들려 하면 "서비스 binding만으로 외부 통신 주체가 정해지지 않습니다." 표시 |

### 정리

CH36의 마지막 확인은 "화면이 보인다"가 아니다. 서비스가 권한과 통신 설정을 갖추고, released API와 ATC 기준을 통과하며, Transport로 운영 환경에 안전하게 이동할 준비가 되었는지 확인해야 한다.

---

## 종합 실습 · Concert RAP Release Board

학습자는 마지막으로 다음 보드를 완성한다.

| 영역 | 완료 조건 |
|---|---|
| Data Model | `ZI_Booking`, `ZC_Booking` 활성화, association 노출 확인 |
| Behavior | BDEF/BIMP 활성화, create/update/delete/action/validation/determination 작동 |
| Draft | draft table, draft action, resume/discard/activate 확인 |
| Concurrency | lock, ETag, total ETag 충돌 시나리오 확인 |
| Authorization | DCL read access와 BDEF operation authorization 확인 |
| EML Consumer | `MODIFY -> COMMIT`, 실패 시 `ROLLBACK`, `FAILED/REPORTED` 확인 |
| Service/UI | OData V4 UI binding, Fiori Preview, action/message 확인 |
| Operations | ATC, ABAP Unit, Transport, Application Log, communication arrangement 체크 |

## 마무리

CH36을 끝낸 학습자는 단순히 "RAP 화면을 띄워 본 사람"이 아니다. DDIC에서 시작해 CDS, BDEF, Behavior Pool, EML, Service Binding, Fiori Elements, Draft, Lock, ETag, Authorization, Communication Management, ATC/Transport까지 하나의 업무 앱 생명주기를 본 사람이다.

ABAP 입문자는 여기서 초급을 벗어난다. 여전히 모르는 것이 많아도 괜찮다. 중요한 것은 어떤 문제가 어느 계층의 책임인지 분해할 수 있게 되었다는 점이다. 이 분해 능력이 이후 UI5, Gateway, RAP 심화, ABAP Cloud, BTP 통합으로 넘어가는 기반이다.
