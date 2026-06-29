# CH36_REWRITE - RAP + Fiori 실무 Capstone

## 재집필 기준

CH36은 앞 장에서 배운 DDIC, CDS, Open SQL, RAP, Gateway/Fiori, 운영 지식을 하나의 업무 앱으로 묶는 Capstone이다. 그래서 이 장은 "새 문법을 더 소개하는 장"이 아니라, 이미 배운 조각들이 실제 프로젝트에서 어떤 순서와 책임으로 결합되는지 확인하는 장으로 작성한다.

R15 경계는 다음처럼 둔다.

- Classic-first 연결: 데이터 타입과 테이블, 권한, 운송, 로그, 테스트는 Classic ABAP에서 배운 운영 감각으로 설명한다.
- Modern/RAP 사용: CH22 이후의 CDS, CH23 이후의 RAP, CH35 운영 지식을 전제로 하므로 `root view entity`, `provider contract transactional_query`, BDEF, EML, Service Binding, Fiori Elements는 본문에서 다룬다.
- Cloud/Clean Core 경계: ABAP Cloud와 released API는 "운영 준수 기준"으로 설명한다. Classic 시스템에서도 같은 방향성을 익히되, Cloud 전용 제약을 Classic 문법 설명처럼 섞지 않는다.
- 공식 문서 힌트는 v1의 자동 매칭을 폐기하고, CH36에 실제로 필요한 RAP/CDS/Service/Draft/Auth/Clean Core 문서만 수동 확인한 근거로 둔다.

---

## CH36-L01 - Capstone 업무 시나리오 정의

### 왜 필요한가

지금까지 배운 내용은 대부분 한 가지 기술을 떼어 놓고 이해하는 방식이었다. 테이블은 테이블대로, CDS는 CDS대로, RAP Behavior는 Behavior대로, Service Binding은 Service Binding대로 배웠다. 하지만 실무 프로젝트에서 사용자는 "CDS가 잘 활성화되나요?"라고 요청하지 않는다. 사용자는 "공연 좌석을 예약하고, 정원이 넘으면 막고, 취소도 되고, 저장 중이던 작업을 다시 이어서 할 수 있게 해 주세요"라고 말한다.

Capstone의 첫 단계는 이 요청을 개발자 언어로 바꾸기 전에 업무 언어로 고정하는 일이다. 업무 흐름이 고정되지 않으면 개발자는 테이블부터 만들고, 화면부터 열고, 액션부터 선언하다가 나중에 "취소는 누가 할 수 있나", "초과 예약은 어느 시점에 막나", "저장 전 임시 데이터는 어디에 있나" 같은 질문으로 되돌아온다. 이 되돌아감이 실무에서 가장 비싼 비용이다.

### 무엇인가

CH36의 Capstone 시나리오는 공연 예약 앱이다. 주인공 정훈영은 Fiori 화면에서 공연과 회차를 보고 예약을 생성한다. 예약 인원이 남은 좌석보다 많으면 저장이 실패해야 한다. 이미 예약한 건은 취소 액션으로 상태가 바뀐다. 작성 중이던 예약은 Draft로 임시 저장되어 나중에 이어서 편집할 수 있어야 한다.

이 시나리오는 다음 계층으로 나뉜다.

| 계층 | 산출물 | 책임 |
|---|---|---|
| 요구사항 | 사용자 스토리, 정상/예외 흐름, 완료 기준 | 무엇을 만들지 고정한다. |
| 데이터 | `ZBOOKING`, `ZCONCERT`, `ZPERF` | 저장할 사실을 안정적으로 담는다. |
| Interface View | `ZI_Booking` | 테이블을 업무 객체처럼 읽게 만든다. |
| Projection View | `ZC_Booking` | UI와 서비스에 보여 줄 필드와 애노테이션을 정한다. |
| Behavior | BDEF/BIMP | 생성, 수정, 삭제, 취소, 검증, 기본값을 책임진다. |
| Service | Service Definition/Binding | OData V4 UI 서비스로 노출한다. |
| UI | Fiori Elements | 애노테이션을 읽어 List/Object Page를 만든다. |
| 운영 | Auth, Draft, ATC, ABAP Unit, Transport, Log | 실사용 가능한 상태로 마무리한다. |

여기서 중요한 점은 계층의 순서다. Fiori 화면이 먼저 보이면 개발이 된 것처럼 느껴지지만, 실제 책임은 더 아래에 있다. 예약 인원 초과를 막는 규칙은 화면 버튼의 문제가 아니라 Behavior Validation의 문제다. 취소 버튼은 UI 버튼처럼 보이지만 실제로는 RAP Action이다. 임시 저장은 브라우저 캐시가 아니라 RAP Draft와 draft table의 문제다.

### 어떻게 확인하는가

시나리오는 코드보다 먼저 다음 질문에 답해야 한다.

- 사용자: 예약을 생성하고 취소하는 주 사용자는 누구인가.
- 핵심 객체: 예약, 공연, 회차 중 root가 되는 객체는 무엇인가.
- 정상 흐름: 공연 선택, 회차 선택, 좌석 수 입력, 저장, 목록 확인이 어떤 순서로 일어나는가.
- 실패 흐름: 좌석 초과, 권한 없음, 이미 취소된 예약 재취소, 필수값 누락이 어떻게 보이는가.
- 저장 시점: 작성 중 데이터와 최종 저장 데이터는 어떻게 구분되는가.
- 완료 기준: ADT 활성화만 완료인지, Fiori Preview에서 생성/취소/검증까지 통과해야 완료인지 명확한가.

CH36의 완료 기준은 "객체가 활성화된다"가 아니다. 정훈영이 Fiori Elements Preview에서 예약을 만들고, 초과 예약 저장 실패 메시지를 보고, 정상 예약을 취소하고, Draft를 이어서 수정할 수 있으면 완료다.

### 실수와 주의

가장 흔한 실수는 데이터 모델을 만들기도 전에 화면부터 기대하는 것이다. Fiori Elements는 애노테이션과 서비스 메타데이터를 읽어 화면을 만들 뿐, 부족한 업무 규칙을 대신 상상하지 않는다. `@UI.lineItem`을 많이 붙여도 예약 초과 검증이 자동으로 생기지는 않는다.

두 번째 실수는 정상 흐름만 적는 것이다. 실무 앱은 실패 흐름에서 품질이 드러난다. 좌석이 부족할 때 저장이 막히는가, 메시지가 사용자가 이해할 수 있는 문장인가, 취소할 수 없는 상태의 버튼은 어떻게 되는가를 처음부터 요구사항에 넣어야 한다.

세 번째 실수는 권한과 운영을 마지막 부록처럼 다루는 것이다. 권한, Draft, 테스트, 운송, 로그는 "나중에 운영팀이 알아서"가 아니다. CH36에서는 L07에서 별도로 다루지만, L01 시나리오 단계부터 성공 조건에 포함해야 한다.

### 체험형 학습 설계

`CH36-L01-S01.html`은 전체 스택 지도를 보여 주는 학습 수단으로 사용한다. 화면은 데이터 테이블에서 시작해 `ZI_Booking`, `ZC_Booking`, Service Binding, Fiori Elements로 올라가고, Behavior가 `ZI_Booking`에 붙는 구조로 배치한다.

개선된 상호작용 설계는 다음과 같다.

- `요구사항 고정` 버튼: 공연 예약의 정상 흐름과 실패 흐름을 좌측 패널에 표시한다.
- `계층 따라가기` 버튼: 데이터, Interface View, Projection View, Behavior, Service, UI 순서로 하이라이트를 이동한다.
- `규칙 위치 찾기` 버튼: "정원 초과 방지", "취소", "임시 저장", "권한" 카드를 사용자가 올바른 계층에 끌어다 놓게 한다.
- `피드백` 상태: 정원 초과를 UI에 놓으면 "화면은 메시지를 보여 줄 수 있지만 규칙의 주인은 Validation입니다"처럼 즉시 피드백을 준다.

이 체험은 입문자가 "화면에 보이는 기능"과 "기능을 책임지는 계층"을 분리해서 보게 만드는 것이 목적이다.

### 정리

Capstone은 기술 목록을 모두 넣는 장이 아니다. 사용자의 업무 흐름을 먼저 고정하고, 그 흐름을 어느 계층이 책임지는지 나누는 장이다. CH36의 나머지 레슨은 이 시나리오를 기준으로 Interface View, Projection View, Behavior, Service, 운영 마감까지 순서대로 완성한다.

---

## CH36-L02 - `ZI_*` Interface View 설계

### 왜 필요한가

테이블은 저장에는 좋지만 업무 언어로 읽기에는 부족하다. `ZBOOKING` 테이블에 `booking_uuid`, `perf_uuid`, `status`, `seats`가 들어 있어도 개발자는 여전히 "이 예약이 어떤 공연과 연결되는가", "회차 정보는 어디서 따라오는가", "이 객체가 트랜잭션의 root인가"를 따로 해석해야 한다.

Interface View는 이 간격을 줄인다. 테이블을 그대로 화면에 던지는 대신, 테이블 위에 업무 객체의 이름, 키, 관계, 의미 애노테이션을 입힌다. 특히 RAP에서는 root view entity가 이후 Behavior Definition의 중심이 되므로, 여기서 뿌리를 잘못 잡으면 뒤의 BDEF와 Service까지 계속 흔들린다.

### 무엇인가

`ZI_Booking`은 예약 업무 객체의 Interface View다. Interface View는 재사용 가능한 중심 모델이다. 여기에는 UI 배치보다 데이터 구조와 관계를 우선 표현한다.

핵심 코드는 다음 구조를 갖는다.

```abap
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Booking Interface View'
define root view entity ZI_Booking
  as select from zbooking
    association [1..1] to ZI_Concert as _Concert
      on $projection.ConcertUUID = _Concert.ConcertUUID
    association [1..1] to ZI_Perf as _Perf
      on $projection.PerfUUID = _Perf.PerfUUID
{
  key booking_uuid     as BookingUUID,
      concert_uuid     as ConcertUUID,
      perf_uuid        as PerfUUID,
      status           as Status,
      seats            as Seats,

      @Semantics.user.createdBy: true
      created_by       as CreatedBy,

      created_at       as CreatedAt,
      last_changed_at  as LastChangedAt,

      _Concert,
      _Perf
}
```

`define root view entity`는 이 CDS가 예약 객체의 뿌리임을 드러낸다. `association [1..1]`은 예약 한 건이 공연과 회차 각각 하나에 연결된다는 의도를 표현한다. `$projection.ConcertUUID`는 현재 view가 노출하는 필드 이름을 기준으로 association 조건을 쓰겠다는 뜻이다. `_Concert`, `_Perf`를 중괄호 안에 다시 노출해야 후속 계층에서 association을 사용할 수 있다.

Interface View에서 UI 애노테이션을 너무 많이 넣지 않는 이유도 분명하다. `ZI_Booking`은 여러 소비자가 재사용할 수 있는 중심 모델이다. 화면의 컬럼 순서나 Object Page 섹션은 L03의 Projection View에서 다루는 편이 책임이 명확하다.

### 어떻게 확인하는가

먼저 ADT에서 `ZI_Booking`을 활성화한다. 활성화 오류가 나면 필드 alias, association 대상 view, cardinality, `$projection` 필드명을 먼저 확인한다. RAP 이전의 CDS 오류처럼 보이더라도, 대부분은 "현재 view에 없는 이름으로 association 조건을 썼다"거나 "키 필드가 빠졌다"는 기본 문제다.

다음으로 Data Preview에서 예약 데이터가 보이는지 확인한다. Data Preview는 UI 검증이 아니라 모델 검증이다. 예약 키, 공연 키, 회차 키, 상태, 좌석 수가 기대한 타입과 값으로 보이는지 본다.

마지막으로 association 노출을 확인한다. `ZI_Booking`에서 `_Concert`, `_Perf`가 projection list에 들어가 있어야 후속 projection/service에서 탐색 경로로 이어갈 수 있다. "association을 정의했다"와 "association을 노출했다"는 다르다.

### 실수와 주의

`[1..1]`을 습관처럼 쓰면 위험하다. 실제로 회차가 삭제될 수 있거나 예약이 임시 상태에서 회차를 아직 갖지 않을 수 있다면 cardinality가 달라져야 한다. Capstone 예제는 정상 예약이 반드시 공연/회차에 연결된다는 전제로 `[1..1]`을 사용한다.

또 하나의 실수는 DB 테이블 필드명을 그대로 UI까지 끌고 가는 것이다. `booking_uuid` 같은 저장소 이름은 테이블에서는 자연스럽지만, CDS 계층에서는 `BookingUUID`처럼 의미가 드러나는 이름으로 올려 주는 편이 이후 코드를 읽기 쉽다.

그리고 Interface View에 화면 장식을 과도하게 넣지 않는다. `@Semantics.user.createdBy`처럼 필드 의미 자체를 설명하는 애노테이션은 적절하지만, `@UI.lineItem`의 표시 순서 같은 소비자별 결정은 Projection View로 미루는 것이 좋다.

### 체험형 학습 설계

`CH36-L02-S01.html`은 코드 해부 학습 수단으로 사용한다. 학습자가 `root`, `association`, `$projection`, `key`, `@Semantics.user.createdBy`, association 노출 부분을 클릭하면 우측 설명 패널이 바뀌도록 설계한다.

추가하면 좋은 실습 시뮬레이터는 다음과 같다.

- `Association 숨기기` 토글: `_Concert`를 projection list에서 제거하면 후속 계층에서 탐색이 끊기는 상태를 시각적으로 보여 준다.
- `Cardinality 바꾸기` 선택: `[1..1]`, `[0..1]`, `[1..*]`를 바꾸면 "예약 한 건과 대상 객체의 관계 의미"가 어떻게 달라지는지 설명한다.
- `이름 매핑 확인` 버튼: `booking_uuid -> BookingUUID`처럼 저장소 이름과 모델 이름을 나란히 보여 준다.
- 피드백 문구: "테이블 이름을 예쁘게 바꾸는 것이 아니라, 업무 객체가 읽히도록 책임을 부여하는 단계입니다."

### 정리

`ZI_Booking`은 저장 테이블을 업무 객체로 끌어올리는 계층이다. 여기서는 root, key, association, 필드 의미를 안정적으로 만든다. UI 표시와 서비스 소비자 요구는 다음 레슨의 `ZC_Booking` Projection View에서 다룬다.

---

## CH36-L03 - `ZC_*` Projection View와 UI 애노테이션

### 왜 필요한가

하나의 업무 객체도 소비자에 따라 보여 줄 모습이 다르다. 운영자 화면은 상태와 생성자를 보고 싶고, 예약 사용자는 공연명과 회차 시간을 먼저 보고 싶으며, API 소비자는 기술 키를 필요로 할 수 있다. Interface View 하나에 모든 소비자 요구를 섞으면 모델이 금방 지저분해진다.

Projection View는 이 문제를 해결한다. `ZI_Booking`이 재사용 가능한 중심 모델이라면, `ZC_Booking`은 UI 서비스가 소비하기 좋은 모양으로 다듬은 소비 계층이다. 여기서 어떤 필드를 노출할지, List Report 컬럼은 무엇인지, Object Page에는 어떤 섹션을 둘지 정한다.

### 무엇인가

`ZC_Booking`은 `ZI_Booking`을 기반으로 한 Projection View다. RAP UI 서비스에서 쓰기 위해 `provider contract transactional_query`를 명시한다. 공식 문서상 provider contract는 projection view가 어떤 시나리오와 런타임에서 사용되는지 지정하고, 해당 런타임에 맞는 문법 검사를 가능하게 한다.

```abap
@AccessControl.authorizationCheck: #CHECK
@Metadata.allowExtensions: true
@EndUserText.label: 'Booking Consumption View'
define root view entity ZC_Booking
  provider contract transactional_query
  as projection on ZI_Booking
{
  key BookingUUID,

      @UI.lineItem: [
        { position: 10, label: 'Concert' }
      ]
      @UI.identification: [
        { position: 10, label: 'Concert' }
      ]
      ConcertUUID,

      @UI.lineItem: [
        { position: 20, label: 'Performance' }
      ]
      @UI.identification: [
        { position: 20, label: 'Performance' }
      ]
      PerfUUID,

      @UI.lineItem: [
        { position: 30, label: 'Status' }
      ]
      @UI.identification: [
        { position: 30, label: 'Status' }
      ]
      Status,

      @UI.lineItem: [
        { position: 40, label: 'Seats' }
      ]
      @UI.identification: [
        { position: 40, label: 'Seats' }
      ]
      Seats,

      CreatedBy,
      CreatedAt,
      LastChangedAt,

      _Concert,
      _Perf
}
```

`@UI.lineItem`은 목록 화면의 컬럼 후보를 만든다. `@UI.identification`은 Object Page에서 핵심 필드로 보일 항목을 지정한다. `@UI.facet`은 Object Page의 섹션 구성을 잡을 때 사용한다. 실제 프로젝트에서는 애노테이션이 길어질 수 있으므로 `@Metadata.allowExtensions: true`를 두고 Metadata Extension으로 분리하는 설계가 읽기 쉽다.

### 어떻게 확인하는가

첫 확인은 활성화다. `provider contract transactional_query`는 단순 장식이 아니므로, root entity 여부와 composition tree 연결이 맞지 않으면 오류가 날 수 있다. CH36 예제에서는 `ZC_Booking`이 root projection으로 동작한다는 전제를 둔다.

두 번째 확인은 서비스 전 단계의 미리보기다. ADT에서 CDS preview 또는 annotation 확인 도구로 `@UI.lineItem`, `@UI.identification`이 원하는 필드에 붙었는지 본다. 필드 위에 붙은 애노테이션은 바로 다음 필드에 적용되므로, 줄 위치가 틀리면 엉뚱한 필드가 화면에 나온다.

세 번째 확인은 association 노출이다. L02에서 노출한 `_Concert`, `_Perf`를 L03에서도 필요한 만큼 유지해야 Fiori 화면이나 서비스 메타데이터에서 관련 객체 탐색을 이어갈 수 있다.

### 실수와 주의

Projection View를 "Interface View 복사본"으로 만들면 의미가 없다. 필드를 그대로 복사만 하고 UI 소비 목적을 반영하지 않으면 `ZC_*` 계층이 책임을 갖지 못한다. 반대로 너무 많은 계산과 비즈니스 규칙을 Projection View에 넣는 것도 좋지 않다. 정원 초과 검증은 Projection View가 아니라 Behavior Validation의 책임이다.

`@UI` 애노테이션을 아무 데나 붙이는 실수도 많다. `@UI.lineItem`은 목록에 보일지와 순서를 돕지만, 저장 가능 여부나 검증 규칙을 만들지 않는다. `@UI.identification`은 Object Page의 주요 필드 노출을 돕지만, 액션이 성공하는 조건을 만들지 않는다.

마지막으로 `@Metadata.allowExtensions: true`는 "언제나 필요한 주문"이 아니다. 다만 CH36처럼 UI 애노테이션이 늘어날 가능성이 높은 projection에서는 Metadata Extension으로 분리할 여지를 열어 두기 위해 의미가 있다.

### 체험형 학습 설계

`CH36-L03-S01.html`은 `provider contract`, `as projection on`, `@UI.lineItem`, `@UI.identification`, `@UI.facet`을 클릭해 설명하는 코드 해부 자료다.

추가 실습 설계는 다음과 같다.

- `목록 화면 보기` 버튼: `@UI.lineItem`이 붙은 필드만 List Report 표에 나타난다.
- `상세 화면 보기` 버튼: `@UI.identification`이 붙은 필드가 Object Page의 주요 영역에 배치된다.
- `Facet 추가` 버튼: 기본 필드를 "예약 정보", "공연 정보", "관리 정보" 섹션으로 나누는 예시를 보여 준다.
- `애노테이션 위치 오류` 버튼: 애노테이션을 한 줄 아래로 밀었을 때 엉뚱한 필드에 적용되는 상황을 시각화한다.

피드백은 단순히 "맞음/틀림"이 아니라 "이 애노테이션은 화면 배치의 힌트입니다. 저장 규칙은 Behavior에서 확인하세요"처럼 계층 책임을 계속 되짚어야 한다.

### 정리

`ZC_Booking`은 UI와 서비스가 소비할 모양을 정하는 계층이다. Interface View가 업무 객체의 뼈대라면, Projection View는 소비자에게 보여 줄 표면이다. `provider contract transactional_query`와 `@UI` 애노테이션은 이 view가 Fiori Elements와 만날 준비를 하는 핵심 장치다.

---

## CH36-L04 - BDEF/BIMP로 트랜잭션 동작 선언과 구현

### 왜 필요한가

CDS만으로는 "무엇을 볼 수 있는가"를 말할 수 있지만, "무엇을 할 수 있는가"는 충분히 말하지 못한다. 예약을 생성할 수 있는가, 수정할 수 있는가, 삭제할 수 있는가, 취소라는 업무 액션이 있는가, 저장 전에 정원 초과를 막는가, 기본 상태값은 언제 들어가는가 같은 질문은 Behavior가 맡는다.

RAP에서 BDEF는 업무 객체의 행동 계약이다. BIMP, 즉 Behavior Pool의 구현 클래스는 그 계약의 실제 ABAP 로직이다. 화면에서 버튼을 누르는 순간 사용자는 UI를 보고 있지만, 시스템 안에서는 BDEF와 BIMP가 트랜잭션의 중심에 있다.

### 무엇인가

Behavior Definition은 다음과 같은 책임을 선언한다.

```abap
managed implementation in class zbp_i_booking unique;
strict ( 2 );
with draft;

define behavior for ZI_Booking alias Booking
persistent table zbooking
draft table zbooking_d
lock master
authorization master ( global, instance )
{
  create;
  update;
  delete;

  field ( readonly : update ) BookingUUID;
  field ( readonly ) CreatedBy, CreatedAt, LastChangedAt;

  determination setDefaults on modify { create; }
  validation validateCapacity on save { create; update; }
  action ( features : instance ) cancelBooking result [1] $self;

  mapping for zbooking
  {
    BookingUUID    = booking_uuid;
    ConcertUUID    = concert_uuid;
    PerfUUID       = perf_uuid;
    Status         = status;
    Seats          = seats;
    CreatedBy      = created_by;
    CreatedAt      = created_at;
    LastChangedAt  = last_changed_at;
  }
}
```

`managed implementation`은 RAP 프레임워크가 표준 저장 흐름을 관리하고, 개발자는 필요한 훅과 업무 로직을 구현한다는 뜻이다. `persistent table`은 최종 저장 테이블이다. `draft table`은 Draft가 켜진 업무 객체에서 임시 인스턴스를 저장하는 테이블이다. `lock master`는 동시 수정 충돌을 관리할 root를 지정한다. `authorization master`는 이 entity가 권한 제어의 기준임을 선언한다.

Behavior Pool에는 선언한 determination, validation, action의 구현 메서드가 들어간다.

```abap
CLASS lhc_booking DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS setDefaults FOR DETERMINE ON MODIFY
      IMPORTING keys FOR Booking~setDefaults.

    METHODS validateCapacity FOR VALIDATE ON SAVE
      IMPORTING keys FOR Booking~validateCapacity.

    METHODS cancelBooking FOR MODIFY
      IMPORTING keys FOR ACTION Booking~cancelBooking
      RESULT result.
ENDCLASS.
```

여기서 `FOR DETERMINE`, `FOR VALIDATE`, `FOR MODIFY ... FOR ACTION`은 RAP handler method의 문법이다. `failed`, `reported`, `mapped`, `result` 같은 파라미터는 RAP 응답 구조와 연결된다. 이 구조를 제대로 채워야 Fiori Elements가 사용자에게 실패 이유와 결과 상태를 보여 줄 수 있다.

### 어떻게 확인하는가

첫 확인은 BDEF 활성화다. `persistent table`, `draft table`, `lock master`, `authorization master`, field control, mapping 이름이 실제 CDS와 테이블 필드에 맞아야 한다. 활성화 오류는 대개 "선언한 필드가 CDS에 없다", "mapping 대상 테이블 필드가 없다", "draft table 구조가 맞지 않는다"에서 난다.

두 번째 확인은 Behavior Pool 생성과 메서드 골격이다. ADT Quick Fix로 Behavior Pool을 생성하면 메서드 시그니처가 BDEF와 맞게 만들어진다. 수동 작성할 때는 메서드 이름보다 `FOR ...` 절이 더 중요하다. 이름이 비슷해도 시그니처가 BDEF와 맞지 않으면 RAP runtime이 연결하지 못한다.

세 번째 확인은 Fiori Preview 또는 EML 테스트에서 create/update/delete/action이 실제로 노출되는지 보는 것이다. BDEF에 `create;`를 선언하지 않으면 화면의 생성 흐름이 기대와 다르게 동작한다. action을 선언했지만 구현이 비어 있으면 버튼은 보여도 업무 상태가 바뀌지 않는다.

### 실수와 주의

가장 위험한 실수는 Behavior 구현 안에서 DB 테이블을 직접 `UPDATE zbooking` 하는 것이다. RAP handler 안에서는 현재 트랜잭션 버퍼와 draft 상태를 고려해야 하므로 EML의 `READ ENTITIES`, `MODIFY ENTITIES`를 사용해 같은 BO를 다루는 방식이 기본이다.

두 번째 실수는 BDEF를 "버튼 선언 파일"처럼 보는 것이다. BDEF는 버튼만 만드는 곳이 아니다. 저장 가능 필드, 읽기 전용 필드, locking, draft, authorization, mapping, validation까지 트랜잭션 계약 전체를 담는다.

세 번째 실수는 Draft를 켰는데 draft table을 운영 기준으로 보지 않는 것이다. 공식 문서상 draft-enabled RAP BO에서는 draft table이 필수이고, 기술 필드도 필요하다. Draft는 화면 편의 기능이 아니라 저장 전 트랜잭션 상태를 다루는 설계다.

### 체험형 학습 설계

`CH36-L04-S01.html`은 BDEF 코드 해부 자료다. `managed`, `persistent table`, `draft table`, `lock master`, `determination`, `validation`, `action`, `mapping`을 클릭하면 각 선언이 어떤 런타임 책임을 갖는지 설명한다.

추가 상호작용은 다음과 같다.

- `선언-구현 연결` 버튼: BDEF의 `validation validateCapacity`를 Behavior Pool의 `METHODS validateCapacity FOR VALIDATE ON SAVE`와 선으로 연결한다.
- `Draft 끄기/켜기` 토글: draft table이 없을 때와 있을 때 저장 전 임시 인스턴스 흐름이 어떻게 달라지는지 보여 준다.
- `직접 DB 업데이트 경고` 버튼: handler 안에서 DB를 직접 바꾸는 코드를 보여 주고, 트랜잭션 버퍼와 Draft를 우회하는 위험을 설명한다.
- 상태 패널: `Declared`, `Implemented`, `Tested` 3단계로 각 behavior 요소의 완료 상태를 표시한다.

### 정리

BDEF는 예약 업무 객체가 할 수 있는 일을 선언하고, BIMP는 그 일을 실제로 수행한다. CDS가 업무 객체의 모양이라면 Behavior는 업무 객체의 행동이다. CH36의 예약 앱은 이 레슨에서 "볼 수 있는 모델"에서 "사용자가 조작할 수 있는 트랜잭션 객체"로 넘어간다.

---

## CH36-L05 - Determination, Validation, Action 구현

### 왜 필요한가

실무 앱의 품질은 작은 업무 규칙에서 갈린다. 새 예약의 기본 상태가 비어 있으면 목록에서 해석이 어렵다. 정원이 넘는 예약이 저장되면 데이터 신뢰가 무너진다. 취소가 단순 삭제로 처리되면 감사와 이력 관리가 어려워진다. 이 문제들은 화면 배치가 아니라 Behavior 로직으로 풀어야 한다.

RAP에서는 이 세 가지 성격을 분리한다. 기본값처럼 시스템이 자동으로 채우는 로직은 Determination, 저장 전에 일관성을 검사하는 로직은 Validation, 사용자가 명시적으로 실행하는 업무 명령은 Action이다.

### 무엇인가

세 요소는 실행 시점과 목적이 다르다.

| 요소 | 실행 시점 | 목적 | CH36 예 |
|---|---|---|---|
| Determination | modify 단계 | 누락된 값을 자동 보정 | 새 예약의 상태를 `N`으로 설정 |
| Validation | save 단계 | 저장 가능한지 검사 | 회차 잔여 좌석보다 예약 좌석이 많으면 실패 |
| Action | 사용자가 명시 실행 | 표준 CRUD 밖 업무 명령 | 예약 취소로 상태를 `C`로 변경 |

Determination 예시는 다음과 같다.

```abap
METHOD setDefaults.
  READ ENTITIES OF zi_booking IN LOCAL MODE
    ENTITY Booking
    FIELDS ( Status CreatedBy )
    WITH CORRESPONDING #( keys )
    RESULT DATA(bookings).

  MODIFY ENTITIES OF zi_booking IN LOCAL MODE
    ENTITY Booking
    UPDATE FIELDS ( Status CreatedBy )
    WITH VALUE #(
      FOR booking IN bookings
      WHERE ( Status IS INITIAL )
      ( %tky      = booking-%tky
        Status    = 'N'
        CreatedBy = sy-uname ) )
    FAILED DATA(failed_update)
    REPORTED DATA(reported_update).
ENDMETHOD.
```

`IN LOCAL MODE`는 Behavior 구현 안에서 같은 BO의 현재 트랜잭션 상태를 다룰 때 사용한다. `WITH CORRESPONDING #( keys )`는 handler로 들어온 key를 EML read 입력 형태에 맞춰 넘기는 전형적인 패턴이다. `VALUE #( FOR ... )`는 CH18 이후 도입된 constructor expression 범위 안에서 사용할 수 있다.

Validation은 실패를 `failed`와 `reported`에 명시해야 한다.

```abap
METHOD validateCapacity.
  READ ENTITIES OF zi_booking IN LOCAL MODE
    ENTITY Booking
    FIELDS ( PerfUUID Seats )
    WITH CORRESPONDING #( keys )
    RESULT DATA(bookings).

  LOOP AT bookings ASSIGNING FIELD-SYMBOL(<booking>).
    DATA(remaining_seats) = get_remaining_seats( <booking>-PerfUUID ).

    IF <booking>-Seats > remaining_seats.
      APPEND VALUE #( %tky = <booking>-%tky ) TO failed-booking.

      APPEND VALUE #(
        %tky = <booking>-%tky
        %msg = new_message_with_text(
          severity = if_abap_behv_message=>severity-error
          text     = |남은 좌석은 { remaining_seats }석입니다.| ) )
        TO reported-booking.
    ENDIF.
  ENDLOOP.
ENDMETHOD.
```

`get_remaining_seats`는 강의용 helper method 이름이다. 실제 구현에서는 회차별 총 좌석, 이미 확정된 예약 좌석, 현재 transaction에서 추가되는 좌석을 어떻게 합산할지 프로젝트 규칙에 맞춰 분리한다.

Action은 사용자가 누른 명령을 처리한다.

```abap
METHOD cancelBooking.
  MODIFY ENTITIES OF zi_booking IN LOCAL MODE
    ENTITY Booking
    UPDATE FIELDS ( Status )
    WITH VALUE #(
      FOR key IN keys
      ( %tky   = key-%tky
        Status = 'C' ) )
    FAILED failed
    REPORTED reported.

  READ ENTITIES OF zi_booking IN LOCAL MODE
    ENTITY Booking
    ALL FIELDS WITH CORRESPONDING #( keys )
    RESULT DATA(cancelled).

  result = VALUE #(
    FOR booking IN cancelled
    ( %tky   = booking-%tky
      %param = booking ) ).
ENDMETHOD.
```

Action이 `result [1] $self`로 선언되어 있다면 실행 후 갱신된 자기 자신을 반환해야 화면이 최신 상태를 반영할 수 있다.

### 어떻게 확인하는가

Determination은 새 예약을 만들 때 확인한다. 사용자가 상태를 입력하지 않아도 저장 전 또는 화면 갱신 시점에 기본 상태가 들어가는지 본다. 기본값이 안 들어가면 determination trigger 조건과 `UPDATE FIELDS` 대상을 확인한다.

Validation은 일부러 실패 데이터를 넣어 확인한다. 잔여 좌석이 2석인 회차에 3석을 예약해 저장을 시도한다. 기대 결과는 저장 실패, 사용자 메시지 표시, DB 미반영이다. 단순히 ABAP 디버거에서 IF문이 탔는지가 아니라 Fiori Preview에서 사용자가 이해할 수 있는 메시지를 보는 것이 핵심이다.

Action은 정상 예약을 선택하고 취소 버튼을 눌러 확인한다. 상태가 `C`로 바뀌고, 결과가 화면에 반영되어야 한다. 이미 취소된 예약에 대해 버튼을 숨길지, 눌렀을 때 메시지를 줄지는 feature control이나 action 내부 검증 정책으로 정한다.

### 실수와 주의

Validation에서 `failed`만 채우고 `reported`를 비워 두면 사용자는 왜 실패했는지 모른다. 반대로 `reported` 메시지만 만들고 `failed`를 채우지 않으면 저장 차단 의도가 흐려질 수 있다. 실패한 인스턴스와 메시지는 함께 다루는 습관이 필요하다.

Determination에서 검증을 하려는 것도 흔한 실수다. Determination은 값을 보정하는 쪽에 가깝다. 저장을 막아야 하는 규칙은 Validation으로 분리한다. 특히 정원 초과처럼 데이터 일관성을 깨는 문제는 save 단계에서 확실히 막아야 한다.

Action 안에서 DB를 직접 수정하는 것도 피한다. RAP BO 내부의 현재 상태, Draft, authorization, lock 흐름을 고려하려면 EML을 통해 BO를 수정하는 방식을 유지한다.

### 체험형 학습 설계

`CH36-L05-S01.html`은 Determination, Validation, Action 비교 매트릭스다. 학습자는 "기본 상태 채우기", "좌석 초과 막기", "취소 처리" 카드를 올바른 열에 배치한다.

추가 실습 시뮬레이터 설계는 다음과 같다.

- 입력 상태: `Status`, `Seats`, `Remaining Seats`, `Current User` 값을 조작할 수 있다.
- `Create Draft` 버튼: 상태가 비어 있는 예약을 만들고 determination이 `N`을 채우는 과정을 보여 준다.
- `Save` 버튼: 좌석 초과 여부를 검사하고, 실패 시 `failed`와 `reported` 패널에 각각 어떤 데이터가 들어가는지 보여 준다.
- `Cancel` 버튼: action 실행 후 `Status = C`와 action result가 화면에 반영되는 흐름을 보여 준다.
- 피드백: "저장을 막는 규칙은 Validation", "사용자가 누르는 업무 명령은 Action", "자동 보정은 Determination"을 반복 확인하게 한다.

### 정리

Determination, Validation, Action은 모두 Behavior 로직이지만 역할이 다르다. 기본값은 자동 보정, 저장 가능성은 검증, 사용자의 업무 명령은 액션이다. 이 셋을 섞지 않아야 RAP 앱의 동작이 예측 가능해진다.

---

## CH36-L06 - Service Binding과 Fiori Elements Preview

### 왜 필요한가

백엔드 모델과 Behavior가 완성되어도 사용자가 접근할 통로가 없으면 앱이 아니다. RAP 비즈니스 객체를 Fiori 화면에서 사용하려면 Service Definition으로 노출 대상을 정하고, Service Binding으로 프로토콜과 소비 방식을 연결해야 한다.

이 단계의 핵심은 "화면을 직접 코딩하지 않아도 된다"가 아니라 "화면이 읽을 수 있는 메타데이터를 정확히 제공해야 한다"이다. Fiori Elements는 `@UI` 애노테이션, 서비스 메타데이터, Behavior 정보를 읽어 List Report와 Object Page, 액션 버튼, 메시지 흐름을 구성한다.

### 무엇인가

Service Definition은 어떤 CDS entity를 비즈니스 서비스로 노출할지 정한다.

```abap
@EndUserText.label: 'Booking UI Service'
define service ZUI_Booking {
  expose ZC_Booking as Booking;
  expose ZI_Concert as Concert;
  expose ZI_Perf as Perf;
}
```

CH36 원본 범위에서는 `Booking`의 주 UI entity로 `ZC_Booking`을 노출하고, `Concert`, `Perf`는 조회 보조 entity로 노출한다. 실제 프로젝트에서 공연과 회차도 UI 전용 projection을 따로 만든다면 `ZC_Concert`, `ZC_Perf`처럼 소비 계층을 맞춰 노출하는 것이 더 일관적이다.

Service Binding은 이 Service Definition을 특정 프로토콜과 사용 방식에 연결한다. CH36에서는 OData V4 UI 서비스를 기준으로 한다. ADT의 Service Binding Editor에서 binding을 활성화하고 publish하면 서비스 URL과 entity set을 확인할 수 있고, UI 서비스라면 Fiori Elements Preview를 실행해 List/Object Page를 바로 확인할 수 있다.

### 어떻게 확인하는가

첫 단계는 Service Definition 활성화다. `expose` 대상 CDS entity가 활성화되어 있어야 하고, alias가 있으면 서비스 접근 시 그 alias를 기준으로 보게 된다. 여러 entity를 노출할 때는 서로 의미적으로 연결된 대상인지 확인한다. 공식 문서도 service definition에서 association target을 함께 노출하는 것을 권장한다.

두 번째 단계는 Service Binding 생성과 활성화다. ADT에서 OData V4 UI 유형으로 binding을 만들고 활성화한다. 활성화 후 publish해야 실제 서비스 접근 URL이 준비된다.

세 번째 단계는 Fiori Elements Preview다. `Booking` entity set을 선택하고 Preview를 실행한다. 확인할 항목은 다음과 같다.

- List Report에 `@UI.lineItem`으로 지정한 필드가 기대 순서로 보이는가.
- Object Page에 `@UI.identification`과 facet 구성이 보이는가.
- Create/Edit/Delete 흐름이 BDEF 선언과 맞는가.
- `cancelBooking` action이 버튼으로 노출되는가.
- 좌석 초과 저장 시 validation 메시지가 화면에 표시되는가.
- Draft를 켠 경우 작성 중 상태와 Activate/Discard 흐름이 자연스러운가.

### 실수와 주의

Service Definition을 만들었다고 서비스가 실행되는 것은 아니다. Service Binding을 만들고 활성화하고 publish해야 소비 가능한 서비스가 된다.

두 번째 실수는 Service Binding Preview를 "완성된 앱"으로 착각하는 것이다. Preview는 빠른 확인 도구다. 실제 배포용 Fiori 앱은 프로젝트 기준에 맞는 앱 생성, 라우팅, 권한, 타일/카탈로그, 배포 경로를 따로 갖는다. CH36에서는 Preview를 학습 검증 도구로 사용한다.

세 번째 실수는 `@UI` 애노테이션이 부족한 상태에서 Fiori Elements가 알아서 화면을 꾸며 주길 기대하는 것이다. Fiori Elements는 선언을 읽는다. 선언하지 않은 컬럼, 섹션, 중요도는 기대한 대로 나오지 않는다.

### 체험형 학습 설계

`CH36-L06-S01.html`은 Service Definition에서 Service Binding, OData V4, Fiori Elements Preview로 이어지는 흐름을 다이어그램으로 보여 준다.

추가 실습 설계는 다음과 같다.

- `Activate` 버튼: Service Definition과 Binding의 상태가 `Inactive -> Active`로 바뀐다.
- `Publish` 버튼: 서비스 URL이 생성되고 entity set 목록이 표시된다.
- `Preview Booking` 버튼: `@UI.lineItem` 기반 목록 화면을 보여 준다.
- `Create Booking` 버튼: BDEF의 `create` 선언이 있을 때만 생성 흐름을 열어 준다.
- `Over Capacity Save` 버튼: Validation 실패 메시지를 Fiori 메시지 영역에 표시한다.
- `Cancel Action` 버튼: action result가 Object Page 상태를 갱신하는 흐름을 보여 준다.

피드백은 "Service Binding은 백엔드 객체를 사용자 경험으로 연결하는 관문입니다. 하지만 화면의 품질은 CDS 애노테이션과 Behavior 응답 품질에 달려 있습니다"로 잡는다.

### 정리

Service Definition은 무엇을 노출할지 정하고, Service Binding은 어떤 방식으로 소비할지 연결한다. Fiori Elements Preview는 CH36 전체 흐름을 검증하는 빠른 관찰 창이다. 이 단계에서 모델, Behavior, UI 애노테이션, 메시지 품질이 한 번에 드러난다.

---

## CH36-L07 - Authorization, Draft, 운영 마감

### 왜 필요한가

개발자 화면에서 기능이 동작하는 것과 운영 가능한 앱은 다르다. 개발자는 모든 권한을 가진 계정으로 테스트하는 경우가 많지만, 실제 사용자는 역할별로 볼 수 있는 예약이 달라야 한다. 개발자는 저장 버튼을 바로 누르지만, 실제 사용자는 작성 중 화면을 닫았다가 다시 이어서 편집할 수 있어야 한다. 개발자는 자신의 패키지에서 활성화하면 끝이라고 느끼지만, 운영에서는 ATC, ABAP Unit, Transport, 로그, Clean Core 기준을 통과해야 한다.

L07은 CH36을 "동작하는 예제"에서 "운영할 수 있는 앱"으로 올리는 단계다.

### 무엇인가

Authorization은 크게 두 층으로 본다. 첫째, CDS access control인 DCL은 어떤 데이터를 조회할 수 있는지 제한한다. 둘째, BDEF의 `authorization master ( global, instance )`는 RAP operation과 action에 대한 권한 제어의 기준을 선언한다.

```abap
define behavior for ZI_Booking alias Booking
persistent table zbooking
draft table zbooking_d
lock master
authorization master ( global, instance )
{
  create;
  update;
  delete;
  action ( features : instance ) cancelBooking result [1] $self;
}
```

Draft는 저장 전 상태를 다룬다. `with draft;`와 `draft table zbooking_d`가 있으면 사용자는 작성 중 데이터를 임시 상태로 유지하고, 나중에 Activate 또는 Discard 흐름으로 확정하거나 버릴 수 있다. 공식 문서상 draft-enabled RAP BO에는 draft table이 필수다.

운영 마감은 다음 항목으로 본다.

| 항목 | 확인할 것 |
|---|---|
| 권한 | 사용자 역할별 조회/수정/취소 가능 범위 |
| Draft | 작성 중 저장, 재개, 폐기, 활성화 흐름 |
| Validation | 실패 메시지와 DB 미반영 |
| ABAP Unit | 핵심 계산과 검증 로직 테스트 |
| ATC | Cloud readiness, 보안, 성능, Clean Core 위반 |
| Transport | DEV에서 QAS/PRD로 이동할 객체 목록과 순서 |
| Application Log | 운영 중 실패 원인을 추적할 로그 |
| Released API | ABAP Cloud 또는 Clean Core 범위에서 허용된 API 사용 |

### 어떻게 확인하는가

권한은 반드시 사용자 차이로 확인한다. 개발자 계정 하나로는 충분하지 않다. 정훈영에게는 자신이 만든 예약만 보이게 하고, 운영자 역할에는 전체 예약을 보이게 하는 식으로 최소 두 역할을 준비해 DCL과 BDEF 권한을 확인한다.

Draft는 브라우저에서 작성 중인 예약을 저장하지 않고 나갔다가 다시 들어오는 방식으로 확인한다. draft table에 임시 인스턴스가 생기고, Activate 후 persistent table로 반영되며, Discard 후에는 임시 상태가 사라져야 한다.

ATC와 ABAP Unit은 "운송 직전 형식 검사"가 아니라 개발 완료 조건이다. CH36의 핵심 테스트는 정원 초과 validation, 취소 action, 기본값 determination이다. 이 세 가지가 자동화되지 않으면 이후 수정에서 회귀가 생기기 쉽다.

Clean Core와 ABAP Cloud 기준은 사용 API를 확인하는 방식으로 접근한다. ABAP Cloud에서는 접근 가능한 SAP 제공 객체가 released API로 제한된다. Classic 시스템에서 개발하더라도 Cloud-ready를 목표로 하면 private SAP object나 unreleased API 의존을 줄여야 한다.

### 실수와 주의

권한을 UI에서 버튼을 숨기는 것으로만 처리하면 안 된다. 버튼이 안 보이는 것은 사용자 경험이고, 실제 operation을 막는 것은 권한 제어와 Behavior 로직이다. API 호출이나 다른 소비자가 같은 서비스를 사용할 수 있기 때문이다.

Draft table을 직접 수정하거나 정리 대상으로 보는 것도 위험하다. 공식 문서는 draft table이 일반 DDIC table이지만 RAP transactional engine이 draft 처리를 위해 사용한다고 설명한다. 운영 정리는 RAP draft action과 표준 흐름을 기준으로 해야 한다.

ATC 오류를 "나중에 예외 승인"으로 미루면 Clean Core 기준이 무너진다. 특히 ABAP Cloud 또는 S/4HANA 확장 개발을 염두에 둔 코드라면 released API, 언어 버전, 사용 금지 객체를 초기에 확인해야 한다.

### 체험형 학습 설계

`CH36-L07-S01.html`은 판단형 퀴즈로 사용한다. 학습자는 다음 문장을 보고 맞는 계층을 고른다.

- "작성 중 저장 데이터를 담는 테이블은 persistent table이다."
- "DCL은 CDS access control과 관련된다."
- "권한은 화면 버튼 숨김만으로 충분하다."
- "ATC와 ABAP Unit은 운송 전에 확인해야 한다."
- "ABAP Cloud에서는 released API 사용 여부가 중요하다."

개선된 상호작용 설계는 다음과 같다.

- `역할 전환` 버튼: 정훈영, 운영자, 권한 없는 사용자로 전환해 목록과 액션 가능 여부를 비교한다.
- `Draft Journey` 버튼: Create Draft, Resume, Activate, Discard 상태 전이를 보여 준다.
- `운영 체크` 버튼: ATC, ABAP Unit, Transport, Application Log, Released API 항목을 체크리스트로 표시한다.
- `실패 원인 찾기` 버튼: "Preview에서는 되는데 운영자에게만 안 보임" 같은 사건 카드를 DCL/BDEF/Auth/Role 중 원인에 연결하게 한다.

### 정리

CH36의 마지막은 화면을 띄우는 것이 아니라 운영 가능한 상태를 확인하는 것이다. 권한, Draft, 테스트, ATC, Transport, 로그, Clean Core 기준이 맞아야 Capstone 앱이라고 부를 수 있다. 이 장을 끝내면 학습자는 테이블에서 Fiori 화면까지의 한 줄 경로뿐 아니라, 그 경로를 운영 품질로 마무리하는 기준까지 갖게 된다.

---

## CH36 공식 확인 메모

아래 근거는 CH36 작성 중 수동 확인한 문서다. v1의 selection screen 관련 자동 힌트는 CH36 범위와 맞지 않아 사용하지 않았다.

| 범위 | 수동 확인 문서 | CH36 반영 |
|---|---|---|
| CDS Projection View | `C:\ABAP_DOCU_HTML\abencds_define_view_as_projection.htm`, `C:\ABAP_DOCU_HTML\abencds_pv_provider_contract.htm`, `C:\ABAP_DOCU_HTML\abencds_proj_view_expose_assoc.htm` | L03의 `as projection on`, `provider contract transactional_query`, association 노출 설명 |
| CDS annotations | `C:\ABAP_DOCU_HTML\abencds_f1_entity_annotations.htm`, `C:\ABAP_DOCU_HTML\abencds_annotations_frmwrk_tables.htm` | `@Metadata.allowExtensions`, `@Semantics.user.createdBy`, `@UI.lineItem`, `@UI.identification`, `@UI.facet` 설명 |
| Service Definition/Binding | `C:\ABAP_DOCU_HTML\abensrvd_define_service.htm`, `C:\ABAP_DOCU_HTML\abenservice_binding_glosry.htm`, `C:\ABAP_DOCU_HTML\abenbusiness_service_glosry.htm` | L06의 `define service`, `expose`, Service Binding 역할 설명 |
| BDL/BDEF | `C:\ABAP_DOCU_HTML\abenbdl_define_beh.htm`, `abenbdl_persistent_table.htm`, `abenbdl_draft_table.htm`, `abenbdl_locking.htm`, `abenbdl_determinations.htm`, `abenbdl_validations.htm`, `abenbdl_action.htm`, `abenbdl_authorization.htm`, `abenbdl_with_draft.htm` | L04-L07의 BDEF, draft, lock, determination, validation, action, authorization 설명 |
| EML/Handler | `C:\ABAP_DOCU_HTML\abapmethods_for_rap_behv.htm`, `abapin_local_mode.htm`, `abapread_entities_long.htm`, `abapmodify_entities_long.htm` | L05의 `READ ENTITIES`, `MODIFY ENTITIES`, `IN LOCAL MODE`, `failed/reported/result` 설명 |
| DCL/Auth | `C:\ABAP_DOCU_HTML\abencds_dcl_glosry.htm`, `C:\ABAP_DOCU_HTML\abapauthority-check.htm` | L07의 CDS access control과 권한 확인 관점 |
| ABAP Cloud/Clean Core | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_CLOUD_GLOSRY.md`, `ABENRELEASED_API_GLOSRY.md`, `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-cheat-sheets-main\19_ABAP_for_Cloud_Development.md` | L07의 restricted language version, released API, Cloud-ready 경계 |
| Fiori Elements/UI 보충 | SAP Help `Defining UI Annotations`, `Using Service Binding Editor for OData V4 Service`, SAP Learning `Defining OData UI Services` | L03/L06의 UI annotation과 Fiori Elements Preview 검증 |
