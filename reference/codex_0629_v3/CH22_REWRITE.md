# CH22_REWRITE · CDS View Entity 기초

> 주 소스: `content/abap/CH22/_chapter.md`, `content/abap/CH22/CH22-L01.md` ~ `CH22-L07.md`  
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, `reference/codex_0629_v3/CH21_REWRITE.md`  
> 목표: CH22를 IT 비전공자도 "테이블 위에 왜 모델 계층을 올리는가"부터 이해하도록 CDS View Entity 중심의 완성 강의자료로 재집필한다.

## CH22 전체 설계

CH14의 classic DDIC View는 SE11에서 만든 재사용 조회 객체였다. 그러나 실무가 커지면 "테이블을 그냥 조인해서 보여 주는 객체"만으로는 부족하다. 같은 공연 데이터가 ALV, Fiori 목록, API, 권한 적용 화면, 분석 화면에서 반복해서 쓰인다. 이때 매 프로그램마다 `SELECT`, `JOIN`, 라벨, UI 표시 순서, 권한 조건을 따로 넣으면 어느 한 곳은 빠지고 어느 한 곳은 오래된 규칙을 계속 쓰게 된다.

CDS View Entity는 이 문제를 DB 가까운 모델 계층에서 푼다. ABAP 프로그램 안에 조회 코드를 흩뿌리는 대신, ADT의 DDL 소스에 "이 데이터는 어떤 필드로 보이고, 어떤 관계를 가지며, 어떤 의미와 권한을 가진다"를 선언한다. 그 결과 ABAP SQL, RAP, Fiori Elements, 분석 도구가 같은 모델을 바라볼 수 있다.

CH22의 핵심은 트랜잭션 앱을 완성하는 것이 아니다. 테이블과 프로그램 사이에 재사용 가능한 읽기 모델을 세우는 것이다. 생성/수정/삭제, RAP Behavior Definition, Service Binding, ABAP Cloud 운영 규칙은 CH23 이후에서 다룬다. 여기서는 다음 질문에 답할 수 있어야 한다.

| 질문 | 기대 답 |
|---|---|
| CDS View Entity는 classic DDIC View와 무엇이 다른가? | ADT의 DDL 소스로 관리되는 현대 CDS 엔티티이며, 필드·관계·의미·권한을 모델에 선언한다. |
| 왜 `ZI_`와 `ZC_`를 나누는가? | `ZI_`는 재사용 가능한 interface 모델, `ZC_`는 화면/서비스 소비에 맞춘 projection 모델로 역할을 분리하기 위해서다. |
| Association은 JOIN과 어떻게 다른가? | 즉시 조인 결과를 고정하기보다 관계를 선언하고, 필요한 소비자가 path로 따라가게 한다. |
| Annotation은 무엇을 바꾸는가? | 데이터 자체가 아니라 라벨, UI 표시, 의미, 권한 적용 같은 메타정보를 부여한다. |
| Metadata Extension은 왜 필요한가? | CDS 본문은 데이터 모델에 집중하고 UI annotation은 별도 DDLX 소스로 분리하기 위해서다. |
| DCL은 무엇을 해결하는가? | 프로그램별 권한 코드를 반복하지 않고 CDS 모델에 행 단위 접근 규칙을 붙인다. |
| CH22에서 하지 않는 것은 무엇인가? | RAP BDEF/BIMP, service definition/binding, 실제 CUD, lock, transaction, Clean Core 상세 적용이다. |

## CH22 R15 경계

CH22는 CH19 이후이므로 modern ABAP SQL 감각을 전제로 한다. 또한 CH20 이후이므로 RAP로 이어질 OO/예외/이벤트의 기반은 배웠다. 그러나 CDS는 ABAP 메서드 안에 쓰는 문장이 아니라 ADT의 별도 DDL/DCL/DDLX 소스라는 점을 분명히 둔다.

| 구분 | CH22에서 정식 사용 | CH22에서 보류 |
|---|---|---|
| CDS DDL | `define view entity`, `as select from`, key field, element alias | table function, abstract entity, custom entity 심화 |
| Projection | `define view entity ... as projection on`, `ZI_`/`ZC_` 역할 분리 | `provider contract transactional_query`의 RAP 계약 상세 |
| Association | cardinality, `association ... to ... as _Assoc on ...`, association 노출 | composition, to-parent association, hierarchy association |
| Annotation | `@EndUserText.label`, `@UI.lineItem`, `@AccessControl.authorizationCheck`, `@Semantics.*` 개념 | annotation definition 직접 작성, Fiori Elements 전체 설계 |
| Metadata Extension | `@Metadata.allowExtensions: true`, `@Metadata.layer`, `annotate entity ... with` | layer 충돌 운영 정책, 고객 확장 전략 |
| DCL | `@MappingRole: true`, `define role`, `grant select on`, `aspect pfcg_auth` 개념 | PFCG 권한 객체 설계 심화, instance authorization |
| 콘서트 앱 | `ZCONCERT`, `ZPERF`, `ZBOOKING` 위에 읽기 모델 구성 | 예약/취소 action, validation, determination, service binding |

## 공식 문서 수동 확인 근거

Classic ABAP/CDS 문서는 `C:\ABAP_DOCU_HTML`와 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md`에서 수동 확인했다. ABAP Cloud와 RAP의 경계 설명은 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md`에서 수동 확인했다.

| 주제 | 확인 문서 | 반영 포인트 |
|---|---|---|
| View Entity | `ABENCDS_DEFINE_VIEW_ENTITY.md`, `abencds_define_view_entity.htm` | `DEFINE VIEW ENTITY`, DDL source, ADT, access control 기본 동작 |
| Projection View | `ABENCDS_DEFINE_VIEW_AS_PROJECTION.md`, `abencds_define_view_as_projection.htm` | `AS PROJECTION ON`, projected entity, projection list, header annotation 비상속 |
| Association | `ABENCDS_SIMPLE_ASSOCIATION_V2.md`, `ABENCDS_SELECT_LIST_ASSOCIATION_V2.md` | cardinality, `_Assoc` naming, `$projection`, association 노출 조건 |
| Annotation | `ABENCDS_ANNOTATIONS_SYNTAX.md`, `ABENCDS_ANNOTATIONS_SCOPES.md`, `ABENCDS_SEMANTICS_ANNOTATION_ABEXA.md` | `@` syntax, scope, semantics annotation은 프레임워크가 해석하는 메타정보 |
| Metadata Extension | `ABENCDS_F1_ANNOTATE_VIEW.md`, `ABENCDS_METADATA_EXTENSION_GLOSRY.md`, `ABENCDS_METADATAEXTENSION_A.md` | `ANNOTATE ENTITY`, `@Metadata.layer`, `@Metadata.allowExtensions` 필요성 |
| DCL | `ABENCDS_F1_DEFINE_ROLE.md`, `ABENCDS_DCL_ROLE_GRANT_RULE.md`, `ABENCDS_ACCESS_CONTROL.md` | `@MappingRole: true`, `DEFINE ROLE`, `GRANT SELECT ON`, DCL이 ABAP SQL 접근 시 추가 조건처럼 적용됨 |
| ABAP Cloud/RAP 경계 | `ABENABAP_CLOUD_GLOSRY.md`, `ABENARAP_GLOSRY.md` | RAP은 ABAP Cloud의 transactional programming model이고 CDS entities와 behavior definitions 기반 |

중요한 교정 사항이 있다. 원본 감사 원장에 따라 `@Semantics.quantity.unitOfMeasure: 'CAPACITY'`처럼 정수 필드 `capacity`가 자기 자신을 단위 필드처럼 가리키는 예시는 쓰지 않는다. 수량과 금액 annotation은 반드시 단위 또는 통화 코드 필드와 짝을 이루는 모델에서만 예시로 다룬다.

## CH22-L01 · CDS View Entity 기본 구조

### 왜 필요한가

CH13에서 JOIN을 배웠고 CH14에서 classic DDIC View를 배웠다. 그러면 "이미 조인도 할 수 있고 view도 만들 수 있는데 왜 또 CDS를 배우는가"라는 질문이 자연스럽다.

classic DDIC View는 GUI 기반 객체라 단순 조회 재사용에는 유용하지만, 현대 SAP 개발에서 요구하는 모델 계층의 역할을 모두 담기 어렵다. 모델이 Git으로 관리되고, ADT에서 코드 리뷰되고, RAP/Fiori/API/권한과 연결되려면 DDL 소스 기반의 CDS View Entity가 필요하다.

비전공자 관점에서는 CDS를 "DB 테이블을 대신하는 새 테이블"로 오해하기 쉽다. 정확히는 원본 데이터를 저장하는 곳이 아니라, 원본 테이블 위에 만든 읽기 모델이다. 프로그램은 테이블을 직접 읽을 수도 있지만, 실무에서는 의미가 정리된 CDS를 읽는 편이 더 안정적인 경우가 많다.

### 무엇인가

CDS View Entity는 ADT에서 만드는 DDL source다. ABAP 프로그램의 `.abap` 본문에 쓰는 코드가 아니라, 별도 repository object로 만든다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Concert interface view'
define view entity ZI_Concert
  as select from zconcert
{
  key concert_id,
      artist,
      venue,
      capacity
}
```

| 구성 | 의미 |
|---|---|
| `@AccessControl.authorizationCheck` | CDS access control 적용 여부를 선언한다. 학습 초기 예제는 `#NOT_REQUIRED`로 단순화한다. |
| `@EndUserText.label` | 사람이 읽을 설명이다. ADT, preview, Fiori 등에서 의미 전달에 쓰인다. |
| `define view entity ZI_Concert` | CDS View Entity 이름을 정의한다. DDL 소스 이름과 엔티티 이름은 일치해야 한다. |
| `as select from zconcert` | 어떤 테이블 또는 CDS entity를 원천으로 읽는지 정한다. |
| `{ ... }` | 외부에 노출할 element 목록이다. |
| `key` | 이 view entity에서 식별자로 취급할 element를 표시한다. |

CDS View Entity는 활성화되어야 사용할 수 있다. 활성화 전에는 프로그램에서 `SELECT FROM ZI_Concert`를 해도 안정적으로 쓸 수 없다.

### 어떻게 확인하는가

1. ADT에서 새 Data Definition을 만든다.
2. DDL Source 이름과 `define view entity` 이름을 같게 둔다. 예: `ZI_Concert`.
3. 위 예제를 입력하고 Activate한다.
4. Data Preview를 열어 `zconcert`의 공연 데이터가 보이는지 확인한다.
5. ABAP SQL에서 다음처럼 읽을 수 있는지 확인한다.

```abap
SELECT concert_id, artist, venue, capacity
  FROM zi_concert
  INTO TABLE @DATA(lt_concert).
```

이 확인은 "CDS를 만들었다"보다 중요하다. CDS는 결국 소비자가 읽을 수 있어야 의미가 있기 때문이다.

### 실수와 주의

- CDS DDL은 ABAP report 안에 붙여 넣는 코드가 아니다.
- DDL source 이름과 entity 이름이 다르면 관리가 꼬인다.
- View Entity 이름은 전역 타입 namespace에 속하므로 대충 짧은 이름을 쓰면 충돌 가능성이 커진다.
- `@AccessControl.authorizationCheck: #NOT_REQUIRED`는 학습 예제를 단순하게 만들기 위한 설정이다. 실무 보안 모델을 무시해도 된다는 뜻이 아니다.
- CDS View Entity는 데이터를 저장하지 않는다. 원본 테이블이나 다른 CDS entity에서 읽어 만든 모델이다.

### 체험형 학습 설계

**CDS 활성화 관찰기**

| 요소 | 설계 |
|---|---|
| 데이터 | `zconcert` 3건: 공연 ID, 아티스트, 장소, 정원 |
| 버튼 | `DDL 작성`, `Activate`, `Data Preview`, `ABAP SQL로 읽기` |
| 상태 | `inactive`, `syntax error`, `active`, `preview rows`, `consumer select ok` |
| 피드백 | source name/entity name 불일치, key 누락, 원본 테이블명 오타를 각각 다른 메시지로 보여 준다. |

### 정리

CDS View Entity는 테이블을 새로 저장하는 객체가 아니라, 테이블 위에 세우는 재사용 가능한 읽기 모델이다. CH22의 모든 레슨은 이 모델에 계층, 관계, 의미, 권한을 하나씩 더하는 흐름이다.

## CH22-L02 · Interface View와 Projection View 구분

### 왜 필요한가

처음에는 `ZI_Concert` 하나만 있어도 충분해 보인다. 그러나 실무 화면이 늘어나면 같은 공연 데이터라도 소비자가 원하는 모습이 달라진다.

운영자용 화면은 정원과 생성자 정보를 보고 싶다. 고객용 앱은 공연명, 장소, 잔여석만 보여 주고 싶다. API는 내부 기술 필드를 숨기고 안정적인 필드명만 내보내고 싶다. 이 요구를 하나의 CDS에 모두 밀어 넣으면 모델이 빠르게 지저분해진다.

그래서 실무에서는 자주 interface view와 projection view를 나눈다.

### 무엇인가

| 계층 | 관례 이름 | 역할 | 바꾸기 쉬운가 |
|---|---|---|---|
| Interface View | `ZI_*` | 테이블과 가까운 재사용 기반 모델 | 비교적 안정적으로 유지 |
| Projection View | `ZC_*` | 화면, 서비스, 소비 목적에 맞춘 모델 | 소비 요구에 따라 조정 |

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Concert interface view'
define view entity ZI_Concert
  as select from zconcert
{
  key concert_id,
      artist,
      venue,
      capacity
}
```

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Concert consumption view'
define view entity ZC_Concert
  as projection on ZI_Concert
{
  key concert_id,
      artist,
      venue,
      capacity
}
```

`as projection on ZI_Concert`는 `ZI_Concert`를 원천으로 하여 소비용 view를 만든다는 뜻이다. 원본 테이블에 바로 붙는 것이 아니라 이미 정리된 interface view를 투영한다.

### 어떻게 확인하는가

1. `ZI_Concert`를 먼저 활성화한다.
2. `ZC_Concert`를 만들고 `as projection on ZI_Concert`로 연결한다.
3. `ZC_Concert`에서 일부 필드를 빼 본다. 예: `capacity` 제거.
4. Data Preview에서 `ZI_Concert`와 `ZC_Concert`의 필드 목록 차이를 비교한다.
5. `ZI_Concert`는 여러 projection에서 재사용될 수 있음을 확인한다.

### 실수와 주의

- `ZC_`를 테이블에 직접 붙이면 계층 분리 효과가 줄어든다.
- projection view의 header annotation은 projected entity에서 자동 상속된다고 기대하면 안 된다. 필요한 라벨과 소비용 annotation은 projection에 명시한다.
- interface view에 UI annotation을 과도하게 넣으면 재사용 기반 모델이 특정 화면에 종속된다.
- 작은 학습 예제는 한 계층으로도 가능하지만, CH22에서는 실무 계층 감각을 익히기 위해 `ZI_`/`ZC_`를 나눈다.

### 체험형 학습 설계

**ZI/ZC 계층 분리 보드**

| 요소 | 설계 |
|---|---|
| 데이터 | `ZCONCERT` 필드 6개, `ZI_Concert` 노출 5개, `ZC_Concert` 노출 4개 |
| 버튼 | `Interface 생성`, `Projection 생성`, `소비자 요구 변경`, `필드 영향 비교` |
| 상태 | source table, interface fields, projection fields, consumer screen |
| 피드백 | interface에서 필드를 빼면 여러 소비자가 깨지고, projection에서 빼면 해당 소비자만 바뀌는 차이를 표시한다. |

### 정리

`ZI_`는 안정적인 기반 모델이고 `ZC_`는 소비 목적에 맞춘 모델이다. 이 분리를 알면 CH23 RAP에서 interface/projection 계층을 처음 봐도 구조가 낯설지 않다.

## CH22-L03 · Association 기초

### 왜 필요한가

CH13의 JOIN은 두 테이블을 즉시 붙여서 결과를 만든다. 이 방식은 명확하지만, 모든 소비자가 항상 같은 방식으로 붙인 데이터를 필요로 하지는 않는다.

공연 목록을 볼 때는 공연만 필요할 수 있다. 어떤 화면에서는 공연 아래 회차가 필요하고, 어떤 화면에서는 회차 아래 예매 내역까지 필요하다. 관계를 항상 결과에 강제로 붙이면 불필요한 조인과 중복 데이터가 생긴다.

CDS Association은 "필요하면 따라갈 수 있는 관계"를 모델에 선언한다.

### 무엇인가

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Concert interface view'
define view entity ZI_Concert
  as select from zconcert
  association [0..*] to ZI_Perf as _Perf
    on $projection.concert_id = _Perf.concert_id
{
  key concert_id,
      artist,
      venue,
      capacity,
      _Perf
}
```

| 구문 | 의미 |
|---|---|
| `association [0..*] to ZI_Perf` | 현재 공연 하나가 회차 0개 이상과 연결될 수 있음을 나타낸다. |
| `as _Perf` | association 이름이다. CDS에서는 밑줄로 시작하는 이름을 권장한다. |
| `on $projection.concert_id = _Perf.concert_id` | 현재 view의 노출 필드와 대상 view의 필드를 연결한다. |
| `_Perf` in select list | association을 외부 소비자가 따라갈 수 있도록 노출한다. |

Association은 관계 선언이고, path expression으로 사용될 때 내부적으로 join이 만들어질 수 있다. 그래서 "JOIN을 대체하는 마법"이라기보다 "관계를 모델에 이름 붙이는 방법"으로 이해하는 편이 정확하다.

### 어떻게 확인하는가

1. `ZI_Perf`를 먼저 만든다. `concert_id`, `perf_no`, `perf_date`를 포함한다.
2. `ZI_Concert`에 `_Perf` association을 추가한다.
3. `_Perf`를 select list에 넣고 활성화한다.
4. ADT Data Preview에서 association navigation이 가능한지 확인한다.
5. `_Perf`를 select list에서 제거하고 다시 확인한다. 선언은 있어도 소비 측에서 따라갈 수 없는 차이를 본다.

### 실수와 주의

- association을 선언만 하고 select list에 노출하지 않으면 다른 CDS나 소비자가 따라갈 수 없다.
- `ON` 조건에 쓰는 source field는 select list에 포함되어야 한다.
- cardinality는 장식이 아니다. `[0..1]`, `[1..1]`, `[0..*]`를 실제 데이터 관계에 맞게 써야 한다.
- `_Perf` 같은 association 이름과 `perf_no` 같은 실제 필드를 혼동하지 않는다. association은 결과 행의 일반 컬럼이 아니다.
- to-many association을 아무 생각 없이 path로 펼치면 행 수가 늘어날 수 있다.

### 체험형 학습 설계

**Association 길 찾기 시뮬레이터**

| 요소 | 설계 |
|---|---|
| 데이터 | 공연 2건, 회차 5건, 예매 6건 |
| 버튼 | `관계 선언`, `association 노출`, `path 따라가기`, `cardinality 변경` |
| 상태 | source rows, target rows, exposed associations, preview navigation |
| 피드백 | `_Perf` 미노출 시 "관계는 내부에 있지만 외부에서 따라갈 수 없음"을 보여 준다. cardinality를 `[1..1]`로 잘못 두면 실제 1:N 데이터와 불일치 경고를 낸다. |

### 정리

Association은 매번 JOIN을 다시 쓰지 않기 위해 모델에 관계를 새기는 방법이다. 선언, 연결 조건, 노출 여부, cardinality를 함께 봐야 한다.

## CH22-L04 · Annotation과 의미 부여

### 왜 필요한가

테이블 필드명 `CONCERT_ID`, `ARTIST`, `CAPACITY`는 개발자에게는 익숙하지만 화면과 API를 쓰는 사람에게는 충분하지 않다. 어떤 필드가 제목인지, 목록에서 몇 번째에 나올지, 금액인지 수량인지, 권한을 확인해야 하는지 같은 정보는 데이터 값 자체에 들어 있지 않다.

Annotation은 이 빈칸을 채운다. 데이터에 의미를 덧붙이는 메타정보다.

### 무엇인가

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Concert consumption view'
define view entity ZC_Concert
  as projection on ZI_Concert
{
  @EndUserText.label: 'Concert ID'
  @UI.lineItem: [{ position: 10 }]
  key concert_id,

  @EndUserText.label: 'Artist'
  @UI.lineItem: [{ position: 20 }]
      artist,

  @EndUserText.label: 'Venue'
  @UI.lineItem: [{ position: 30 }]
      venue,

  @EndUserText.label: 'Capacity'
      capacity
}
```

| Annotation | 위치 | 의미 |
|---|---|---|
| `@EndUserText.label` | view 또는 field | 사람이 읽는 라벨을 제공한다. |
| `@UI.lineItem` | field | 목록 화면에서 표시 위치 같은 UI 힌트를 제공한다. |
| `@AccessControl.authorizationCheck` | view | CDS access control 적용 여부를 선언한다. |
| `@Semantics.*` | field | 주소, 이메일, 수량, 금액, 통화 같은 의미를 제공한다. |

Annotation은 실행 코드를 직접 작성하는 것이 아니라 프레임워크가 해석할 수 있는 설명을 붙이는 것이다. 예를 들어 `@UI.lineItem`은 Fiori Elements 같은 소비자가 읽어 목록 구성을 자동화하는 데 사용한다.

### `@Semantics` 주의

수량과 금액 annotation은 특히 조심한다. 다음처럼 자기 자신을 단위로 가리키는 예시는 잘못된 학습이다.

```abap
" 잘못된 개념 예시: capacity가 수량값인데 capacity 자신을 단위 필드처럼 가리키면 안 된다.
" @Semantics.quantity.unitOfMeasure: 'CAPACITY'
" capacity
```

단위가 있는 모델이라면 별도 단위 필드를 둔다.

```abap
@Semantics.quantity.unitOfMeasure: 'CAPACITY_UNIT'
capacity,

@Semantics.unitOfMeasure
capacity_unit
```

금액도 마찬가지로 통화 코드 필드가 필요하다.

```abap
@Semantics.amount.currencyCode: 'CURRENCY_CODE'
ticket_price,

@Semantics.currencyCode
currency_code
```

### 어떻게 확인하는가

1. `@EndUserText.label`을 붙이기 전후로 ADT outline 또는 preview 표시명을 비교한다.
2. `@UI.lineItem` position 값을 바꿔 소비 화면의 표시 순서 설계를 예상한다.
3. `@Semantics.quantity.unitOfMeasure`를 쓸 때 참조하는 단위 필드가 실제 select list에 있는지 확인한다.
4. annotation 위치를 view 위와 field 위로 바꿔 어떤 scope에 적용되는지 구분한다.

### 실수와 주의

- annotation은 위치가 중요하다. view 전체 annotation과 field annotation을 섞어 쓰면 의미가 달라진다.
- UI annotation을 interface view에 과하게 넣으면 재사용 모델이 특정 화면에 묶인다.
- annotation 이름을 임의로 만들면 프레임워크가 해석하지 못할 수 있다.
- Metadata Extension으로 옮길 수 있는 annotation인지도 고려해야 한다.

### 체험형 학습 설계

**Annotation 스코프 실험실**

| 요소 | 설계 |
|---|---|
| 데이터 | `ZC_Concert` field 4개와 annotation 목록 |
| 버튼 | `view 라벨 추가`, `field 라벨 추가`, `lineItem 순서 변경`, `잘못된 Semantics 검사` |
| 상태 | selected scope, annotation name, annotation value, expected consumer effect |
| 피드백 | field 위에 둔 라벨은 해당 field만 바꾸고, view 위 라벨은 entity 설명을 바꾼다는 차이를 표시한다. `capacity` 자기참조 semantics는 "단위 필드가 아님"으로 막는다. |

### 정리

Annotation은 CDS에 의미를 입히는 언어다. 특히 UI와 Semantics는 강력하지만, 위치와 참조 필드를 잘못 잡으면 활성화 오류나 잘못된 소비 화면으로 이어진다.

## CH22-L05 · Metadata Extension 기초

### 왜 필요한가

CDS 본문에 UI annotation이 조금 붙는 것은 괜찮다. 그러나 화면이 커지면 `@UI.lineItem`, `@UI.identification`, `@UI.facet` 같은 annotation이 모델 본문을 덮어 버린다. 그러면 데이터 모델을 읽고 싶은 개발자가 UI 설정 사이에서 길을 잃는다.

Metadata Extension은 이 문제를 분리로 해결한다. CDS 본문은 데이터 구조와 관계에 집중하고, UI metadata는 별도 DDLX source에 둔다.

### 무엇인가

먼저 원본 CDS entity가 metadata extension을 허용해야 한다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.allowExtensions: true
@EndUserText.label: 'Concert consumption view'
define view entity ZC_Concert
  as projection on ZI_Concert
{
  key concert_id,
      artist,
      venue,
      capacity
}
```

그 다음 별도 metadata extension source에서 annotation을 붙인다.

```abap
@Metadata.layer: #CORE
annotate entity ZC_Concert with
{
  @UI.lineItem: [{ position: 10 }]
  concert_id;

  @UI.lineItem: [{ position: 20 }]
  artist;

  @UI.lineItem: [{ position: 30 }]
  venue;
}
```

| 요소 | 의미 |
|---|---|
| `@Metadata.allowExtensions: true` | 해당 CDS entity가 metadata extension을 받을 수 있게 한다. |
| `@Metadata.layer: #CORE` | annotation 계층을 지정한다. |
| `annotate entity ZC_Concert with` | 기존 entity에 annotation만 추가한다. |
| `artist;` | 필드를 다시 정의하는 것이 아니라 해당 필드에 annotation을 붙이는 대상이다. |

### 어떻게 확인하는가

1. `ZC_Concert`에 `@Metadata.allowExtensions: true`를 넣고 활성화한다.
2. 새 Metadata Extension을 만들고 `annotate entity ZC_Concert with`를 작성한다.
3. `@UI.lineItem`을 DDLX에 넣고 활성화한다.
4. Data Preview 또는 preview 소비 화면에서 UI annotation이 적용되는지 확인한다.
5. `@Metadata.allowExtensions: true`를 빼면 metadata extension이 왜 문제가 되는지 확인한다.

### 실수와 주의

- Metadata Extension은 CDS entity를 다시 만드는 파일이 아니다. 기존 entity에 annotation을 추가하는 파일이다.
- `@Metadata.allowExtensions: true`가 없으면 extension 전제가 깨진다.
- 모든 annotation이 metadata extension에서 허용되는 것은 아니다. annotation definition에서 usage가 허용된 것만 가능하다.
- 같은 annotation을 본문과 extension에 중복으로 넣으면 해석 우선순위와 충돌을 관리해야 한다.
- `#CORE`, `#CUSTOMER` 같은 layer는 운영 확장 전략과 연결된다. CH22에서는 개념만 잡고 운영 정책은 후속 심화로 넘긴다.

### 체험형 학습 설계

**UI Annotation 분리 리팩터링 도구**

| 요소 | 설계 |
|---|---|
| 데이터 | annotation이 본문에 섞인 `ZC_Concert`와 비어 있는 DDLX |
| 버튼 | `본문 annotation 탐지`, `DDLX로 이동`, `allowExtensions 켜기`, `중복 검사` |
| 상태 | source annotations, extension annotations, layer, conflict list |
| 피드백 | 본문에서 UI annotation을 제거해도 DDLX가 활성화되어 있으면 소비 효과가 유지됨을 보여 준다. |

### 정리

Metadata Extension은 CDS 본문과 UI metadata를 분리한다. CDS를 오래 유지하려면 "데이터 모델"과 "화면 표시 힌트"를 같은 파일에 끝없이 쌓지 않는 습관이 중요하다.

## CH22-L06 · DCL / Authorization 개요

### 왜 필요한가

권한 검사를 프로그램마다 직접 넣으면 빠뜨리기 쉽다. 어떤 리포트는 장소 권한을 확인하고, 어떤 OData 서비스는 확인하지 않고, 어떤 배치 조회는 전체 데이터를 읽는 식으로 흩어질 수 있다.

CDS DCL은 "이 CDS entity를 읽을 때 어떤 행을 볼 수 있는가"를 모델 가까이에 선언한다. 권한 조건이 CDS 접근에 일관되게 붙는 구조를 만들 수 있다.

### 무엇인가

CDS entity 쪽에서는 access control을 확인하도록 둔다.

```abap
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Concert interface view'
define view entity ZI_Concert
  as select from zconcert
{
  key concert_id,
      artist,
      venue,
      capacity
}
```

DCL source에는 role을 만든다.

```abap
@MappingRole: true
define role ZI_Concert_Role {
  grant select on ZI_Concert
    where ( venue ) = aspect pfcg_auth(
      Z_VENUE_AUTH,
      VENUE,
      ACTVT = '03' );
}
```

| 구성 | 의미 |
|---|---|
| `@MappingRole: true` | CDS role을 사용자에게 매핑하는 기본 annotation이다. |
| `define role` | DCL role을 정의한다. |
| `grant select on ZI_Concert` | 해당 CDS entity의 read 접근 규칙을 만든다. |
| `where ... aspect pfcg_auth` | 기존 PFCG 권한 객체와 연결해 행 조건을 만든다. |
| `@AccessControl.authorizationCheck: #CHECK` | CDS entity 접근 시 access control을 확인하도록 의도를 드러낸다. |

DCL은 학습 예제에서 바로 완전한 보안 모델을 구현하자는 뜻이 아니다. "권한이 프로그램 밖 모델 계층에도 존재할 수 있다"는 관점을 잡는 것이 CH22의 목표다.

### 어떻게 확인하는가

1. `ZI_Concert`를 `#CHECK`로 바꾼다.
2. DCL role source를 만들고 활성화한다.
3. 권한이 있는 사용자와 없는 사용자의 Data Preview 결과 차이를 비교한다.
4. `#NOT_REQUIRED` 또는 `#NOT_ALLOWED`로 바꿨을 때 DCL 적용 기대가 어떻게 달라지는지 확인한다.
5. ABAP SQL 소비자가 같은 CDS를 읽을 때도 권한 조건이 일관되게 고려되는지 개념적으로 확인한다.

### 실수와 주의

- DCL 파일만 만들고 CDS 쪽 access control annotation을 무시하면 기대와 다르게 동작한다.
- 권한 객체와 field mapping이 실제 PFCG 설계와 맞아야 한다.
- DCL은 "화면에서 버튼 숨기기"가 아니라 "데이터 행 접근" 관점이다.
- 개발 중 `#NOT_REQUIRED`를 사용한 예제를 운영 보안 설계로 착각하면 안 된다.
- privileged access 같은 우회 개념은 CH22 입문 범위를 넘어선다.

### 체험형 학습 설계

**행 권한 필터 시뮬레이터**

| 요소 | 설계 |
|---|---|
| 데이터 | 공연 5건: venue가 `SEOUL`, `BUSAN`, `DAEGU`로 나뉨 |
| 사용자 | `USER_A`는 `SEOUL`, `USER_B`는 `BUSAN`, `ADMIN`은 전체 |
| 버튼 | `권한 객체 적용`, `DCL 켜기`, `DCL 끄기`, `사용자 전환` |
| 상태 | authorizationCheck, role active, user auth values, visible rows |
| 피드백 | 같은 `SELECT FROM ZI_Concert`라도 사용자 권한 값에 따라 보이는 행이 달라지는 구조를 시각화한다. |

### 정리

DCL은 CDS 기반 모델에 행 단위 접근 규칙을 붙이는 방법이다. CH22에서는 문법의 큰 그림과 적용 지점을 이해하고, 세밀한 권한 설계는 실무 보안/ABAP Cloud/RAP 단계에서 확장한다.

## CH22-L07 · 실습: 콘서트 CDS 뷰 `ZI_` / `ZC_`

### 왜 필요한가

CH09부터 콘서트 예매 모델을 쌓아 왔다. `ZCONCERT`, `ZPERF`, `ZBOOKING`이 있고, CH20에서는 `ZCL_BOOKING_MANAGER`로 잔여석 계산을 객체화했다. CH21에서는 ALV에서 잔여석 상태를 색으로 강조했다.

이제 같은 데이터를 CDS 모델로 올려야 한다. 그래야 CH23에서 RAP가 "어떤 데이터 모델을 바탕으로 트랜잭션 앱을 만들 것인가"라는 질문에 답할 수 있다.

### 무엇인가

실습 목표는 다음 세 가지다.

| 산출물 | 역할 |
|---|---|
| `ZI_Concert` | 공연 기반 interface view |
| `ZI_Perf` | 회차 기반 interface view |
| `ZC_Concert` | 소비용 projection view |

먼저 회차 interface view를 만든다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Performance interface view'
define view entity ZI_Perf
  as select from zperf
{
  key concert_id,
  key perf_no,
      perf_date,
      perf_time,
      status
}
```

다음 공연 interface view에서 회차 association을 노출한다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Concert interface view'
define view entity ZI_Concert
  as select from zconcert
  association [0..*] to ZI_Perf as _Perf
    on $projection.concert_id = _Perf.concert_id
{
  key concert_id,
      artist,
      venue,
      capacity,
      _Perf
}
```

마지막으로 소비용 projection을 만든다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.allowExtensions: true
@EndUserText.label: 'Concert consumption view'
define view entity ZC_Concert
  as projection on ZI_Concert
{
  key concert_id,
      artist,
      venue,
      capacity,
      _Perf
}
```

UI annotation은 metadata extension으로 분리한다.

```abap
@Metadata.layer: #CORE
annotate entity ZC_Concert with
{
  @UI.lineItem: [{ position: 10 }]
  concert_id;

  @UI.lineItem: [{ position: 20 }]
  artist;

  @UI.lineItem: [{ position: 30 }]
  venue;

  @UI.lineItem: [{ position: 40 }]
  capacity;
}
```

### 어떻게 확인하는가

1. `ZI_Perf`를 먼저 활성화한다.
2. `ZI_Concert`를 활성화한다. `_Perf` 대상이 없으면 여기서 막힌다.
3. `ZC_Concert`를 활성화한다.
4. `ZC_Concert` Data Preview에서 공연 목록이 보이는지 확인한다.
5. association navigation으로 회차를 따라갈 수 있는지 확인한다.
6. metadata extension을 활성화한 뒤 UI annotation 적용 기대를 확인한다.

### 실수와 주의

- 활성화 순서가 중요하다. target view가 없으면 association이 깨진다.
- `ZC_Concert`에 `_Perf`를 노출하지 않으면 소비자가 회차 관계를 따라가기 어렵다.
- 잔여석 계산을 CH22에서 무리하게 구현하지 않는다. 집계, 예약 수량, 트랜잭션 규칙은 CH23/CH24와 맞물린다.
- RAP root, behavior definition, service binding은 CH23으로 넘긴다.
- 운영 권한은 `#NOT_REQUIRED`로 끝내지 않는다. CH22 실습에서는 단순화를 위해 쓰고, DCL 개념은 L06에서 별도 확인한다.

### 체험형 학습 설계

**Concert CDS Model Builder**

| 단계 | 버튼 | 상태 | 피드백 |
|---|---|---|---|
| 1 | `ZI_Perf 생성` | perf fields, active flag | 회차 target view 준비 여부 표시 |
| 2 | `ZI_Concert 생성` | association `_Perf`, on condition | target 미활성화 또는 `concert_id` 누락 시 오류 |
| 3 | `ZC_Concert 생성` | projection fields, exposed association | 소비용 필드가 interface와 어떻게 다른지 표시 |
| 4 | `Metadata Extension 생성` | lineItem positions | 본문/DDLX 분리 효과 표시 |
| 5 | `Data Preview` | visible concerts, navigation | 공연에서 회차로 이동 가능한지 표시 |

### 정리

CH22 실습의 목적은 완성 앱이 아니라 읽기 모델의 뼈대를 세우는 것이다. `ZI_Concert`와 `ZC_Concert`를 만들고, `_Perf` association을 노출하고, UI annotation을 분리하면 CH23 RAP의 출발점이 준비된다.

## CH22 최종 정리

| 레슨 | 핵심 |
|---|---|
| L01 | CDS View Entity는 ADT DDL source로 만드는 재사용 읽기 모델이다. |
| L02 | `ZI_`는 기반 interface, `ZC_`는 소비 projection으로 나눈다. |
| L03 | Association은 관계를 선언하고, 노출해야 소비자가 따라갈 수 있다. |
| L04 | Annotation은 라벨, UI, 의미, 권한 같은 메타정보를 부여한다. |
| L05 | Metadata Extension은 UI annotation을 CDS 본문에서 분리한다. |
| L06 | DCL은 CDS entity에 행 단위 접근 제어를 붙인다. |
| L07 | 콘서트 모델을 `ZI_Concert`/`ZI_Perf`/`ZC_Concert`로 구성한다. |

CH22를 끝낸 학습자는 CDS를 "새로운 SQL 문법"이 아니라 "SAP 현대 개발에서 프로그램과 DB 사이에 놓는 모델 계층"으로 이해해야 한다. 이 관점이 잡히면 CH23 RAP에서 나오는 root view entity, projection, behavior definition, service binding이 뜬금없는 새 기술이 아니라 CH22 모델 위에 올라가는 다음 층으로 보인다.
