# CH22_REWRITE - CDS View Entity 기초

> 재작업 기준: `reference/codex_0625/00_QUALITY_REVIEW.md`의 판정에 따라 기존 `codex_0625`식 반복 템플릿을 버리고, CH22 원본 7개 레슨을 완성 강의자료 수준으로 다시 작성한다.
> 원본 범위: `content/abap/CH22/_chapter.md`, `CH22-L01.md` ~ `CH22-L07.md`
> 공식 확인: `C:\ABAP_DOCU_HTML`의 CDS DDL/DCL 문서를 파일 단위로 열어 문법과 경계를 수동 확인했다.

## CH22의 자리

CH22는 "테이블을 읽는 프로그램"에서 "데이터 모델을 재사용 가능한 계층으로 설계하는 개발자"로 넘어가는 장이다. CH14에서 classic DDIC View를 보았고, CH19에서 modern Open SQL을 배웠으며, CH20에서 책임을 클래스로 분리하는 감각을 익혔다. 이제 같은 생각을 데이터 계층으로 옮긴다. 즉 프로그램마다 같은 SELECT, JOIN, 라벨, 권한 필터를 반복하지 않고, CDS View Entity에 모델을 선언해 여러 소비처가 같은 정의를 읽게 만든다.

이 장의 목표는 RAP 앱을 만드는 것이 아니다. RAP, Behavior Definition, Service Binding, draft, action, validation은 CH23 이후의 주제다. CH22는 그 바로 아래에 놓일 읽기 모델을 단단히 만드는 장이다. 그래서 예제는 `ZI_Concert`, `ZI_Perf`, `ZC_Concert` 같은 CDS 뷰 계층에 머문다.

## R15 학습 경계

| 구분 | CH22에서 다룬다 | CH22에서 미룬다 |
|---|---|---|
| CDS 기본 | ADT DDL Source, `define view entity`, `as select from`, key, element list, 간단한 cast | table function, AMDP, analytical CDS, 복잡한 aggregate 모델링 |
| 계층 | Interface View 관습 `ZI_`, Projection View 관습 `ZC_`, `as projection on` | RAP용 provider contract의 상세 의미, transactional query 설계 |
| 관계 | `association [0..*] to ... as _... on ...`, `$projection`, association 노출, path가 JOIN으로 변환될 수 있다는 감각 | composition tree, root view entity, managed/unmanaged RAP 모델 |
| 의미 | `@EndUserText`, `@UI.lineItem`, `@Semantics`의 올바른 짝 개념 | Fiori Elements 전체 화면 설계, facet/identification의 상세 튜닝 |
| 확장 | `@Metadata.allowExtensions: true`, DDLX, `annotate entity ... with`, `@Metadata.layer` | 고객별 대규모 확장 전략, layer 충돌 운영 정책 |
| 권한 | DCL `define role`, `grant select`, `aspect pfcg_auth`, `@AccessControl.authorizationCheck` | RAP instance authorization, cloud authorization framework |

## 공식 문서 수동 확인 근거

| 확인한 문서 파일 | CH22 반영 내용 |
|---|---|
| `abencds_define_view_entity.htm` | `DEFINE VIEW ENTITY`가 CDS DDL에서 CDS View Entity를 정의하며, 엔티티별 DDL source가 따로 존재한다는 점 |
| `abencds_select_statement_v2.htm` | View Entity의 `as select from` 구조와 ABAP SQL에서 CDS entity를 읽을 수 있다는 점 |
| `abencds_define_view_as_projection.htm`, `abencds_proj_views.htm` | Projection View가 기존 CDS entity의 요소를 투영해 별도 CDS entity를 만든다는 점 |
| `abencds_association_v2.htm`, `abencds_simple_association_v2.htm`, `abencds_select_list_association_v2.htm`, `abencds_assoc_join_v2.htm` | Association 선언, cardinality, `$projection`, 노출된 association, path 사용 시 JOIN 변환 가능성 |
| `abencds_annotations.htm`, `abencds_annotations_frmwrk_tables.htm` | Annotation이 CDS object의 metadata로 저장되고, SAP predefined annotation을 사용해야 한다는 점 |
| `abencds_semantics_annotation_abexa.htm` | `@Semantics`는 필드의 업무 의미를 표현하며, 금액/수량은 통화/단위 필드와 짝을 맞춰야 한다는 점 |
| `abencds_meta_data_extensions.htm`, `abencds_f1_annotate_view.htm`, `abencds_f1_metadata_ext_annos.htm` | Metadata Extension은 별도 DDLX source이며, `@Metadata.allowExtensions`와 `@Metadata.layer`가 필요하다는 점 |
| `abencds_access_control.htm`, `abencds_f1_define_role.htm`, `abencds_dcl_role_grant_rule.htm`, `abencds_f1_cond_pfcg.htm` | DCL role, `@MappingRole: true`, `grant select`, `aspect pfcg_auth`, access control 적용 방식 |

---

## CH22-L01 - CDS View Entity 기본 구조

### 왜 필요한가

CH14의 classic Database View는 SE11에서 정의하고, 주로 테이블을 미리 JOIN하거나 필드를 제한하는 데 썼다. 학습 초반에는 이것만으로 충분하다. 그러나 실무 시스템이 커지면 문제가 생긴다.

첫째, 같은 의미의 조회가 프로그램마다 반복된다. 예를 들어 콘서트 목록을 보여주는 리포트, ALV, 배치 점검, 향후 서비스가 모두 `ZCONCERT`를 읽는다면 각 프로그램마다 필드 선택, 별칭, 권한, 라벨을 다시 맞춰야 한다. 둘째, 데이터 모델의 의도를 코드 밖에서 읽기 어렵다. 테이블에는 값이 있지만, "이 필드는 화면 목록에서 몇 번째로 보여야 하는가", "이 금액은 어떤 통화 필드와 짝인가", "이 공연은 어떤 회차와 연결되는가" 같은 의미가 흩어진다. 셋째, ADT와 Git 기반 개발 흐름에서는 텍스트 소스로 관리되는 모델이 훨씬 추적하기 좋다.

CDS View Entity는 이 문제를 해결하기 위해 데이터 계층의 모델을 DDL source로 선언한다. 여기서 중요한 말은 "프로그램을 하나 더 만드는 것"이 아니라 "읽기 모델을 하나의 재사용 가능한 이름으로 만든다"는 것이다.

### 무엇인가

CDS는 Core Data Services의 약자다. ABAP 프로그램의 `REPORT`, `FORM`, `CLASS`와 달리 CDS View Entity는 ADT에서 만드는 DDL Source 안에 작성한다. 문법의 핵심은 다음 한 줄이다.

```abap
define view entity ZI_Concert
  as select from zconcert
```

이 문장은 `zconcert`라는 데이터 소스를 읽어 `ZI_Concert`라는 CDS entity를 정의한다. `{ }` 안에는 외부에 노출할 필드를 적는다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
define view entity ZI_Concert
  as select from zconcert
{
  key concert_id,
      artist,
      venue,
      capacity
}
```

읽는 순서는 다음과 같다.

| 코드 | 뜻 |
|---|---|
| `@AccessControl.authorizationCheck: #NOT_REQUIRED` | 이 첫 예제에서는 DCL 권한 검사를 요구하지 않는다. DCL은 L06에서 정식으로 다룬다. |
| `define view entity ZI_Concert` | `ZI_Concert`라는 CDS View Entity를 만든다. |
| `as select from zconcert` | 기반 데이터 소스는 `zconcert` 테이블이다. |
| `key concert_id` | 이 뷰에서 `concert_id`를 키 요소로 노출한다. |
| `artist`, `venue`, `capacity` | 소비처가 읽을 일반 필드다. |

CDS의 select list는 CH19의 SELECT 감각과 닮았지만, ABAP SQL 문장을 실행하는 자리가 아니라 모델을 선언하는 자리다. 즉 `SELECT ... INTO TABLE ...`처럼 데이터를 당장 가져오는 문장이 아니다. 활성화하면 ABAP Dictionary에 CDS entity가 생기고, 이후 ABAP SQL이나 다른 CDS에서 그 이름을 데이터 소스처럼 사용할 수 있다.

계산 요소도 간단히 만들 수 있다. 예를 들어 회차 테이블 `zperf`의 날짜를 명확한 DATS 타입으로 노출하고 싶다면 다음처럼 쓸 수 있다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
define view entity ZI_Perf
  as select from zperf
{
  key concert_id,
  key perf_no,
      perf_date,
      cast( perf_date as abap.dats ) as event_date
}
```

여기서 `event_date`는 테이블의 물리 필드가 아니라 CDS가 노출하는 계산 요소다. 입문자는 이 지점에서 "테이블에 컬럼이 새로 생겼다"고 오해하기 쉽다. 실제 DB 테이블 구조를 바꾸는 것이 아니라, CDS entity를 조회할 때 보이는 요소를 정의한 것이다.

### 어떻게 확인하는가

ADT에서 DDL Source를 만들고 활성화한 뒤에는 세 가지를 확인한다.

첫째, 활성화 오류가 없는지 본다. CDS는 문법 오류가 있으면 활성화되지 않는다. DDL Source 이름과 CDS entity 이름은 프로젝트 규칙에 맞게 관리해야 하며, 필드명 오타나 key 위치 오류가 있으면 이 단계에서 드러난다.

둘째, Data Preview로 결과를 본다. ADT에서 `ZI_Concert`를 열고 Data Preview를 실행하면 `concert_id`, `artist`, `venue`, `capacity`가 보이는지 확인할 수 있다. 이때 조회 결과의 행 수가 원본 `zconcert`와 크게 다르면 `where`, join, association을 잘못 넣었는지 봐야 한다. L01에서는 단순 select이므로 행 수가 원본 테이블과 같아야 정상이다.

셋째, ABAP SQL에서 CDS entity를 읽어 본다.

```abap
SELECT *
  FROM ZI_Concert
  INTO TABLE @DATA(lt_concerts).
```

이 코드는 CH19 이후의 New Open SQL 문법을 사용한다. CH22는 CH19 이후이므로 `@DATA(...)`와 host variable escape `@`를 사용할 수 있다. 여기서 중요한 확인 포인트는 `FROM zconcert`가 아니라 `FROM ZI_Concert`를 읽는다는 것이다. 프로그램이 테이블에 직접 붙지 않고 CDS 모델을 소비하기 시작한 것이다.

### 실수와 주의

가장 흔한 실수는 CDS를 ABAP 프로그램처럼 생각하는 것이다. DDL Source에는 `WRITE`, `LOOP`, `IF`, `sy-subrc`가 나오지 않는다. 데이터 모델을 선언하는 파일이므로 실행 흐름이 아니라 결과 구조를 읽어야 한다.

두 번째 실수는 `key`를 DB primary key와 완전히 같은 것으로 착각하는 것이다. CDS의 `key`는 CDS entity가 노출하는 키 의미다. 보통 기반 테이블 키를 따라가지만, projection이나 집계 모델에서는 설계에 따라 달라질 수 있다. CH22에서는 테이블 키를 그대로 올리는 수준으로만 사용한다.

세 번째 실수는 첫 예제의 `#NOT_REQUIRED`를 실무 보안 설정으로 외우는 것이다. L01에서는 권한 주제를 아직 배우지 않았기 때문에 단순 조회 모델을 만들기 위한 최소 설정으로 쓴다. 실제 권한이 필요한 CDS는 L06처럼 DCL과 함께 `#CHECK`를 검토해야 한다.

### 체험형 학습 설계

학습 화면을 만든다면 "CDS View Entity 활성화 관찰기"로 구성한다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| `원본 테이블 보기` 버튼 | `zconcert`의 샘플 행 3개를 표로 보여준다. | "아직 모델이 없으므로 프로그램은 테이블에 직접 의존합니다." |
| `DDL 작성` 버튼 | `ZI_Concert` 예제 코드를 단계별로 채운다. | `define view entity`, `as select from`, `{ }` 영역을 색으로 구분한다. |
| `활성화` 버튼 | 가상 활성화 상태를 `Inactive -> Active`로 바꾼다. | 필드 오타가 있으면 "활성화 실패: 기반 테이블에 없는 필드"를 보여준다. |
| `Data Preview` 버튼 | CDS entity 결과 표를 표시한다. | 원본 테이블과 같은 행 수인지 비교 배지를 보여준다. |
| `ABAP SQL로 읽기` 버튼 | `SELECT FROM ZI_Concert` 예제를 표시한다. | "이제 프로그램은 테이블 대신 모델을 소비합니다." |

상태값은 `ddlStatus`, `fieldList`, `activationMessages`, `previewRows`, `consumerSql`로 나눈다. 입문자에게 특히 좋은 피드백은 "지금 바꾼 것은 테이블 데이터가 아니라 모델 정의"라는 문장을 활성화 성공 시 반복해 주는 것이다.

### 정리

CDS View Entity는 테이블 위에 놓는 현대적인 읽기 모델이다. `define view entity ... as select from ... { ... }` 구조로 데이터 소스와 노출 필드를 선언하고, 활성화 후 Data Preview와 ABAP SQL 조회로 확인한다. L01의 핵심은 문법 암기가 아니라 관점 전환이다. 이제 프로그램마다 테이블을 직접 해석하는 대신, 이름 붙은 데이터 모델을 만들어 재사용한다.

---

## CH22-L02 - Interface View와 Projection View 구분

### 왜 필요한가

L01에서 `ZI_Concert` 하나만 만들어도 프로그램은 조회할 수 있다. 그런데 실무에서 CDS가 한 장으로 끝나는 경우는 많지 않다. 같은 공연 데이터라도 소비처마다 원하는 모양이 다르기 때문이다.

예를 들어 운영 리포트는 내부 관리 필드까지 필요할 수 있고, 화면 목록은 사용자에게 보여줄 필드만 필요할 수 있다. 나중에 서비스가 붙으면 외부에 노출해도 되는 필드와 내부에만 남겨야 하는 필드도 갈린다. 이때 기반 모델 하나에 UI용 annotation, 서비스용 필드 제한, 내부 계산을 모두 섞으면 CDS가 금방 지저분해진다.

그래서 CDS는 보통 계층을 나눈다. 기반 데이터와 관계를 안정적으로 담는 계층, 특정 소비 목적에 맞게 필드를 고르는 계층을 분리한다.

### 무엇인가

이 프로젝트에서는 다음 이름 관습을 사용한다.

| 계층 | 이름 관습 | 역할 |
|---|---|---|
| Interface View | `ZI_*` | 테이블과 가까운 재사용 기반 모델. 필드, 기본 계산, association을 안정적으로 정의한다. |
| Projection View | `ZC_*` | 특정 소비처에 맞춘 노출 모델. 필요한 필드를 고르고 annotation을 붙이는 출구 역할을 한다. |

`ZI_`, `ZC_`는 ABAP 문법이 아니라 프로젝트와 실무에서 자주 쓰는 명명 관습이다. 시스템이 `ZI_`라서 자동으로 interface view라고 판단하는 것이 아니다. 이름으로 역할을 드러내 팀이 같은 구조를 유지하도록 돕는 장치다.

Projection View의 기본 형태는 다음과 같다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
define view entity ZC_Concert
  as projection on ZI_Concert
{
  key concert_id,
      artist,
      venue,
      capacity
}
```

`as projection on ZI_Concert`는 `ZC_Concert`가 `ZI_Concert`를 기반으로 한다는 뜻이다. 여기서 모든 필드를 다시 가져올 필요는 없다. 소비처에 필요한 필드만 고를 수 있다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
define view entity ZC_ConcertList
  as projection on ZI_Concert
{
  key concert_id,
      artist,
      venue
}
```

이 예제에서는 `capacity`를 뺐다. 테이블에는 여전히 `capacity`가 있고, `ZI_Concert`에도 있을 수 있지만, `ZC_ConcertList` 소비자는 그 필드를 보지 않는다. 이것이 projection의 가장 단순하고 중요한 효과다.

### 어떻게 확인하는가

확인은 두 방향으로 한다.

첫째, `ZI_Concert`의 Data Preview와 `ZC_Concert`의 Data Preview를 비교한다. 같은 공연 행을 읽더라도 projection에서 노출하지 않은 필드는 보이지 않아야 한다. 입문자는 여기서 "필드를 삭제했다"고 오해하기 쉬운데, 삭제가 아니라 소비 모델에서 숨긴 것이다.

둘째, ABAP SQL에서 각각을 읽어 본다.

```abap
SELECT concert_id, artist, venue
  FROM ZC_Concert
  INTO TABLE @DATA(lt_concerts).
```

이 코드는 소비 프로그램이 `ZC_Concert`만 알면 되게 만든다. 내부 테이블 `zconcert`와 기반 view `ZI_Concert`의 구조가 어느 정도 바뀌어도, `ZC_Concert`가 같은 계약을 유지하면 소비 코드는 덜 흔들린다.

프로젝트 점검 기준은 간단하다.

| 질문 | 정상 답 |
|---|---|
| 이 view는 테이블과 가까운가? | 그렇다면 `ZI_`에 둔다. |
| 이 view는 화면, 서비스, 리포트 같은 소비 목적에 맞춘 출구인가? | 그렇다면 `ZC_`에 둔다. |
| UI annotation이 기반 view에 잔뜩 들어갔는가? | 가능하면 `ZC_` 또는 Metadata Extension으로 옮긴다. |

### 실수와 주의

첫 번째 실수는 `ZI_`와 `ZC_`를 문법으로 착각하는 것이다. 이름을 `ABC_Concert`로 지어도 CDS는 활성화될 수 있다. 그러나 팀 규칙을 잃으면 "어떤 view를 재사용해야 하는지"가 모호해진다. 그래서 학습 단계부터 이름에 역할을 담는 습관을 들인다.

두 번째 실수는 모든 view를 projection으로만 만들려는 것이다. Projection은 기반이 있어야 의미가 있다. 테이블에서 직접 읽어 기본 관계와 의미를 정리하는 view가 필요하고, 그 위에 소비용 projection이 올라간다.

세 번째 실수는 CH23의 RAP용 projection 개념을 CH22에 끌어오는 것이다. 공식 문서에는 provider contract 같은 내용도 나오지만, CH22에서는 읽기 모델의 계층 분리까지만 다룬다. RAP 트랜잭션 모델, service definition, behavior definition은 다음 장에서 다룬다.

### 체험형 학습 설계

학습 도구는 "계층 분리 슬라이더"로 만들 수 있다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| `기반 모델` 탭 | `ZI_Concert` 필드 전체를 표시한다. | "재사용 계층: 테이블과 가까운 안정 모델" |
| `소비 모델` 탭 | `ZC_Concert`에서 체크한 필드만 표시한다. | "소비 계층: 화면이나 서비스가 볼 필드" |
| 필드 체크박스 | `capacity` 같은 필드를 projection에 포함/제외한다. | 제외하면 "테이블에서 삭제된 것이 아니라 ZC에서 노출하지 않을 뿐"이라고 안내한다. |
| `ABAP SQL 미리보기` 버튼 | 선택된 projection 이름으로 SELECT 예제를 만든다. | 소비 코드는 `ZC_*`를 읽는다는 점을 강조한다. |

데이터 상태는 `interfaceFields`, `projectionFields`, `selectedConsumer`, `generatedSelect`로 나눈다. 좋은 상호작용은 `ZI_Concert`에서 필드를 제거하면 projection도 영향을 받지만, projection에서 필드를 숨겨도 `ZI_Concert`는 변하지 않는 모습을 시각적으로 보여주는 것이다.

### 정리

Interface View와 Projection View의 구분은 CDS를 오래 유지하기 위한 기본 구조다. `ZI_*`는 재사용 기반, `ZC_*`는 소비 출구다. `as projection on`은 기반 CDS entity의 요소를 목적에 맞게 투영한다. CH22에서는 이 계층 감각만 확실히 잡고, RAP용 projection의 상세 계약은 CH23으로 넘긴다.

---

## CH22-L03 - Association 기초

### 왜 필요한가

CH13에서 JOIN을 배웠다. JOIN은 반드시 필요하지만, 프로그램마다 같은 관계를 반복해서 쓰면 유지보수가 어려워진다. 콘서트 앱을 생각해 보자. 공연 `ZCONCERT`, 회차 `ZPERF`, 예매 `ZBOOKING`은 계속 함께 등장한다.

공연 목록에서 회차를 따라가야 하고, 회차에서 예매를 따라가야 하며, 예매에서 다시 공연 정보를 보여줘야 한다. 이 관계를 매번 JOIN 조건으로 쓰면 `concert_id`, `perf_no`를 잇는 규칙이 여러 곳에 흩어진다. 누군가 한 곳에서 조건을 잘못 쓰면 같은 업무 관계가 화면마다 다르게 해석된다.

CDS Association은 이 관계를 데이터 모델 안에 선언해 둔다. 핵심은 "JOIN을 없앤다"가 아니라 "관계를 이름 붙여 재사용한다"다.

### 무엇인가

Association의 기본 구조는 다음과 같다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
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

읽는 순서는 다음과 같다.

| 코드 | 뜻 |
|---|---|
| `association [0..*] to ZI_Perf as _Perf` | 현재 view에서 `ZI_Perf`로 가는 관계를 `_Perf`라는 이름으로 선언한다. 한 공연은 0개 이상의 회차를 가질 수 있다. |
| `on $projection.concert_id = _Perf.concert_id` | 현재 view가 노출하는 `concert_id`와 대상 view의 `concert_id`를 연결한다. |
| `_Perf` | select list 안에 association을 노출한다. 다른 CDS나 소비처가 이 경로를 따라갈 수 있게 한다. |

`[0..*]`는 cardinality다. 한 공연에 회차가 없을 수도 있고 여러 개 있을 수도 있다는 뜻이다. cardinality는 단순 주석이 아니라 모델을 읽는 사람과 도구에게 관계의 기대 형태를 알려준다. 잘못 쓰면 결과 해석과 최적화 기대가 틀어질 수 있으므로 데이터 현실에 맞춰야 한다.

`$projection`은 현재 view가 노출하는 요소를 기준으로 ON 조건을 쓰겠다는 표시다. Association을 select list에 노출하는 경우, ON 조건의 source 쪽 필드는 select list에 있어야 한다. 위 예제에서는 `concert_id`가 `{ }` 안에 있으므로 `_Perf`를 노출해도 관계를 따라갈 수 있다.

Association은 JOIN과 무관한 마법 통로가 아니다. 공식 문서 기준으로 association path expression이 실제로 사용되면 내부적으로 JOIN으로 변환될 수 있다. 차이는 JOIN 조건을 소비처마다 반복하지 않고 모델에 한 번 선언한다는 점이다.

::embed CH22-L03-S01 | 공연–회차–예매 association 관계도::

### 어떻게 확인하는가

확인은 세 단계로 한다.

첫째, `ZI_Concert` 자체가 활성화되는지 본다. ON 조건에 쓴 필드가 source와 target에 모두 존재해야 한다. `_Perf.concert_id`처럼 대상 association 필드는 association 이름으로 접근한다.

둘째, ADT의 CDS dependency나 outline에서 `_Perf`가 association으로 보이는지 확인한다. 단순 필드가 아니라 관계 항목으로 보이면 의도대로 선언된 것이다.

셋째, association을 사용하는 projection을 만들어 path가 동작하는지 본다. CH22에서는 복잡한 path 조회를 깊게 다루지 않지만, 다음처럼 관계가 소비 계층으로 전달되는지는 확인할 수 있다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
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

`ZC_Concert`에서도 `_Perf`가 보인다면 기반 view가 관계를 노출한 것이다. 이후 다른 CDS가 `_Perf` 경로를 사용할 수 있다.

### 실수와 주의

첫 번째 실수는 association을 선언만 하고 `{ }`에 노출하지 않는 것이다. 선언은 view 내부에서 사용할 수 있지만, 소비자가 따라가게 하려면 select list에 `_Perf`를 넣어야 한다. 원본 레슨의 핵심도 이 지점이다.

두 번째 실수는 cardinality를 대충 쓰는 것이다. 공연과 회차는 보통 `[0..*]`가 맞다. 반대로 예매에서 공연으로 가는 관계는 한 예매가 정확히 한 공연에 속한다면 `[1..1]`에 가깝다. 실제 데이터 무결성, 외래키, 업무 규칙을 보고 결정해야 한다.

세 번째 실수는 association을 성능 무료 쿠폰처럼 생각하는 것이다. path를 사용하면 JOIN이 발생할 수 있다. CDS는 관계를 선언하는 도구이지, 데이터베이스 비용을 없애는 도구가 아니다. 성능은 SQL Trace, Plan, Data Preview 결과 행 수로 확인해야 한다.

네 번째 실수는 `$projection`을 생략하거나 source 필드를 select list에서 빼는 것이다. 특히 association을 노출할 때 ON 조건 source 필드가 view의 요소로 존재하지 않으면 활성화 오류나 사용 제한으로 이어질 수 있다.

### 체험형 학습 설계

학습 수단은 "Association 경로 시뮬레이터"가 적합하다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| `공연 선택` 버튼 | `CON001` 같은 공연 행을 선택한다. | 선택된 `concert_id`가 ON 조건의 왼쪽 값으로 강조된다. |
| `_Perf 따라가기` 버튼 | 같은 `concert_id`를 가진 회차 행을 필터링해 보여준다. | `[0..*]`라서 여러 행이 나올 수 있음을 표시한다. |
| `association 노출` 토글 | `_Perf`를 select list에 넣거나 뺀다. | 꺼져 있으면 "관계는 내부 선언만 되었고 소비자는 경로를 볼 수 없습니다." |
| `JOIN으로 보기` 버튼 | 같은 관계를 CH13 JOIN 문장으로 보여준다. | "association은 JOIN 조건을 모델에 이름 붙여 둔 것"이라고 비교한다. |

상태는 `selectedConcertId`, `associationExposed`, `targetRows`, `joinPreview`, `activationStatus`로 둔다. 오류 피드백은 두 가지가 중요하다. `concert_id`를 select list에서 제거하면 ON 조건 source가 사라졌다는 경고를 띄우고, cardinality를 `[1..1]`로 바꾸었는데 여러 회차가 나오면 cardinality와 실제 데이터가 맞지 않는다는 경고를 띄운다.

### 정리

Association은 CDS view 사이의 관계를 선언하는 문법이다. `association [0..*] to ... as _... on ...`으로 관계를 만들고, select list에 `_Perf`를 넣어 소비처에 노출한다. Association은 JOIN을 대체하는 마법이 아니라 JOIN 조건을 모델에 재사용 가능한 이름으로 올리는 방법이다. CH22에서는 관계 선언과 노출, cardinality, `$projection`의 기본 감각을 잡는다.

---

## CH22-L04 - Annotation과 의미 부여

### 왜 필요한가

테이블과 view는 값을 담거나 계산할 수 있다. 그러나 값만으로는 업무 의미가 충분히 전달되지 않는다. `artist`라는 필드는 화면에 "아티스트"라고 보여야 할 수 있고, `ticket_price`는 단순 숫자가 아니라 특정 통화와 짝을 이루는 금액일 수 있다. `capacity`는 숫자지만 좌석 수라는 수량 의미를 가진다.

프로그램마다 라벨을 직접 쓰고, 화면마다 목록 순서를 직접 정하고, 금액과 통화의 관계를 따로 처리하면 같은 데이터가 소비처마다 다르게 보인다. CDS Annotation은 이 의미를 모델 가까이에 붙인다. 그래서 UI, 분석, 검색, 권한 같은 도구가 CDS의 metadata를 읽어 일관되게 행동할 수 있다.

### 무엇인가

Annotation은 `@`로 시작하는 metadata 선언이다. CDS entity 위에 붙으면 view 전체에 적용되고, 필드 위에 붙으면 해당 요소에 적용된다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: '공연'
define view entity ZC_Concert
  as projection on ZI_Concert
{
  @EndUserText.label: '공연 ID'
  key concert_id,

  @UI.lineItem: [{ position: 10 }]
  @EndUserText.label: '아티스트'
      artist,

  @UI.lineItem: [{ position: 20 }]
  @EndUserText.label: '공연장'
      venue,

  @EndUserText.label: '정원'
      capacity
}
```

핵심 annotation의 역할은 다음과 같다.

| Annotation | 역할 |
|---|---|
| `@EndUserText.label` | 사용자에게 보일 설명 라벨을 제공한다. |
| `@UI.lineItem` | 목록형 UI에서 어떤 필드를 어떤 순서로 보여줄지 힌트를 준다. |
| `@Semantics.*` | 필드의 업무 의미를 선언한다. 이름, 주소, 금액, 통화, 수량, 단위 같은 의미를 표현한다. |
| `@AccessControl.authorizationCheck` | CDS access control을 어떻게 다룰지 선언한다. DCL은 L06에서 정식으로 연결한다. |

`@Semantics`는 특히 짝을 조심해야 한다. 금액 필드는 통화 필드를 가리켜야 하고, 수량 필드는 단위 필드를 가리켜야 한다. 잘못된 예는 금액 필드가 자기 자신을 통화 필드로 가리키는 것이다. 올바른 모양은 다음과 같다.

```abap
@Semantics.amount.currencyCode: 'currency_code'
ticket_price,

@Semantics.currencyCode: true
currency_code
```

수량도 같은 원리다.

```abap
@Semantics.quantity.unitOfMeasure: 'unit'
seat_count,

@Semantics.unitOfMeasure: true
unit
```

입문자는 여기서 "annotation은 주석이니까 없어도 실행만 되면 된다"고 생각하기 쉽다. 그러나 CDS annotation은 일반 주석이 아니다. 활성화된 CDS metadata로 저장되고, 도구가 읽을 수 있는 정보다. 그래서 틀린 annotation은 화면, 분석, 서비스 소비에서 실제 문제로 이어질 수 있다.

### 어떻게 확인하는가

첫째, ADT에서 annotation 위치를 확인한다. view 전체 라벨은 `define view entity` 위에 있어야 하고, 필드 라벨이나 UI annotation은 해당 필드 바로 위에 있어야 한다.

둘째, Data Preview나 metadata outline에서 라벨이 반영되는지 본다. 시스템과 도구 버전에 따라 보이는 위치는 다를 수 있지만, 적어도 활성화 오류가 없어야 하고 annotation metadata가 entity에 붙어 있어야 한다.

셋째, `@Semantics`는 짝 필드 존재 여부를 확인한다. `@Semantics.amount.currencyCode: 'currency_code'`라고 썼다면 같은 select list 안에 `currency_code` 요소가 있어야 한다. 통화 필드가 없는데 금액 annotation만 붙이면 의미가 완성되지 않는다.

넷째, UI annotation은 이 장에서 "힌트" 수준으로 확인한다. CH22는 Fiori Elements 화면을 만드는 장이 아니므로, 실제 목록 화면 생성까지 요구하지 않는다. 다만 `@UI.lineItem`이 projection 또는 metadata extension에 정리되어 있는지 확인한다.

### 실수와 주의

첫 번째 실수는 annotation 위치를 틀리는 것이다. 필드 annotation은 다음 필드에 붙는다. 따라서 `@UI.lineItem`을 `artist` 위에 썼다고 생각했는데 실제로는 빈 줄이나 다른 필드 배치 때문에 의도와 다르게 읽히는 일이 없도록 코드를 촘촘히 봐야 한다.

두 번째 실수는 UI annotation을 interface view에 너무 많이 넣는 것이다. `ZI_`는 재사용 기반 모델이고, UI 표현은 소비 계층인 `ZC_`나 Metadata Extension이 더 자연스럽다. 단, 프로젝트 규칙에 따라 공통 의미 annotation은 기반에 둘 수도 있다. 중요한 것은 역할을 섞지 않는 것이다.

세 번째 실수는 `@Semantics` 자기참조다. 금액 필드 `ticket_price`가 `currency_code`를 가리켜야 하는데 `'ticket_price'`를 가리키면 의미가 무너진다. CH22 품질 점검에서 이미 이 유형의 오류가 지적되었으므로, v2에서는 반드시 올바른 짝 예제로 고친다.

네 번째 실수는 SAP predefined annotation이 아닌 임의 annotation을 마음대로 만드는 것이다. 공식 문서 기준으로 CDS annotation은 SAP가 정의한 annotation definition과 규칙을 따라야 한다. 이름이 그럴듯하다고 도구가 읽어 주는 것은 아니다.

### 체험형 학습 설계

"Annotation 효과 미리보기"를 만들면 입문자가 metadata의 가치를 바로 이해한다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| `라벨 켜기` 토글 | `@EndUserText.label`이 있을 때와 없을 때의 표 헤더를 비교한다. | 없으면 기술 필드명, 있으면 업무 라벨이 보인다. |
| `lineItem 순서 조정` 슬라이더 | `artist`와 `venue`의 `position` 값을 바꾼다. | 목록 컬럼 순서가 즉시 바뀐다. |
| `금액 의미 검사` 버튼 | `ticket_price`와 `currency_code` 짝을 검사한다. | 짝이 맞으면 "금액+통화 의미 완성", 틀리면 "금액 필드가 통화 필드를 가리켜야 합니다." |
| `주석 위치 검사` 버튼 | annotation이 어떤 필드에 붙었는지 하이라이트한다. | 필드 바로 위 annotation만 해당 필드에 적용됨을 보여준다. |

상태는 `annotations`, `fieldOrder`, `semanticPairs`, `metadataWarnings`로 나눈다. 좋은 피드백은 단순히 "오류"가 아니라 "이 annotation은 `artist`가 아니라 다음 필드 `venue`에 붙었습니다"처럼 실제 적용 대상을 보여주는 것이다.

### 정리

Annotation은 CDS에 업무 의미와 UI 힌트를 붙이는 metadata다. `@EndUserText`는 라벨, `@UI.lineItem`은 목록 표시 힌트, `@Semantics`는 금액/수량/통화/단위 같은 의미를 표현한다. 특히 `@Semantics`는 짝 필드를 정확히 가리켜야 한다. CH22에서는 annotation을 "예쁜 설명"이 아니라 소비 도구가 읽는 모델 정보로 이해한다.

---

## CH22-L05 - Metadata Extension 기초

### 왜 필요한가

L04처럼 annotation을 view 본문에 직접 쓰면 처음에는 이해하기 쉽다. 그러나 UI annotation이 늘어나면 문제가 생긴다. `ZC_Concert`의 핵심은 어떤 데이터를 소비자에게 노출할지인데, 본문이 `@UI.lineItem`, `@UI.identification`, `@EndUserText`, 여러 position 값으로 가득 차면 데이터 구조를 읽기 어려워진다.

또 프로젝트가 커지면 같은 데이터 모델을 여러 UI나 고객별 확장 계층에서 다르게 꾸미고 싶어진다. 이때 CDS 본문을 계속 수정하면 기반 모델과 표현 설정이 강하게 엮인다. Metadata Extension은 annotation을 별도 DDLX source로 분리해 이 문제를 줄인다.

### 무엇인가

Metadata Extension은 기존 CDS entity에 annotation만 덧붙이는 별도 소스다. 문법의 핵심은 `annotate entity ... with`다.

먼저 대상 CDS entity는 extension을 허용해야 한다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.allowExtensions: true
define view entity ZC_Concert
  as projection on ZI_Concert
{
  key concert_id,
      artist,
      venue,
      capacity
}
```

그 다음 별도 Metadata Extension source에서 annotation을 붙인다.

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

DDL Source의 select list는 쉼표로 필드를 나열하지만, Metadata Extension의 annotate 블록에서는 요소명 뒤에 세미콜론을 쓴다. 이 차이는 입문자에게 매우 중요하다. `ZC_Concert`를 정의하는 것이 아니라 이미 존재하는 `ZC_Concert`의 요소에 annotation을 붙이는 파일이기 때문이다.

`@Metadata.layer: #CORE`는 이 extension이 어느 layer에 속하는지 나타낸다. 공식 문서 기준으로 layer는 metadata extension 평가 우선순위에 영향을 준다. CH22에서는 `#CORE`를 기본 예제로 사용하고, 고객별 덮어쓰기 전략은 뒤로 미룬다.

### 어떻게 확인하는가

첫째, 대상 entity인 `ZC_Concert`가 먼저 활성화되어 있어야 한다. 존재하지 않는 entity를 annotate할 수 없다.

둘째, 대상 entity에 `@Metadata.allowExtensions: true`가 있는지 확인한다. 이 annotation이 없으면 metadata extension을 허용하지 않는 모델에 외부 annotation을 붙이려는 상태가 된다.

셋째, Metadata Extension source를 활성화한다. ADT에서 DDLX source로 관리되며, 일반 CDS DDL source와 파일 성격이 다르다. 활성화 오류가 나면 요소명 오타, 세미콜론 누락, layer 누락, 허용되지 않는 annotation을 먼저 본다.

넷째, annotation이 본문에서 빠졌는지 확인한다. 같은 `@UI.lineItem`을 본문과 extension에 동시에 두면 어디에서 무엇을 관리하는지 흐려진다. 학습 단계에서는 UI annotation을 extension으로 옮겼다면 본문에는 필드 구조만 남겨 비교한다.

### 실수와 주의

첫 번째 실수는 `@Metadata.allowExtensions: true`를 빼는 것이다. Metadata Extension은 "아무 CDS에나 밖에서 주석을 붙이는 기능"이 아니다. 대상이 확장을 허용해야 한다.

두 번째 실수는 DDL Source 문법과 DDLX 문법을 섞는 것이다. `define view entity` 내부는 필드 뒤에 쉼표를 쓰고, `annotate entity` 내부는 annotation 대상 요소 뒤에 세미콜론을 쓴다.

세 번째 실수는 Metadata Extension을 데이터 구조 변경 도구로 생각하는 것이다. Metadata Extension은 annotation을 추가하는 도구다. 필드를 새로 만들거나 select source를 바꾸는 곳이 아니다.

네 번째 실수는 layer를 단순 장식으로 보는 것이다. layer는 여러 metadata extension이 있을 때 평가 우선순위와 관련된다. CH22에서는 깊게 운영 전략을 다루지 않지만, `@Metadata.layer`가 필수적인 관리 정보라는 점은 기억해야 한다.

### 체험형 학습 설계

"본문과 메타데이터 분리 실험실"을 설계한다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| `본문에 UI 주석 넣기` 버튼 | `ZC_Concert` 본문에 `@UI.lineItem`을 표시한다. | 코드가 길어지며 데이터 구조와 UI 설정이 섞였다는 표시를 띄운다. |
| `Extension으로 이동` 버튼 | UI annotation을 DDLX 패널로 옮긴다. | 본문은 필드 중심, extension은 UI 중심으로 나뉜다. |
| `allowExtensions` 토글 | 대상 entity의 `@Metadata.allowExtensions`를 켜고 끈다. | 꺼져 있으면 extension 활성화 실패 메시지를 보여준다. |
| `세미콜론 검사` 버튼 | DDLX에서 쉼표를 쓴 요소를 찾아낸다. | "annotate entity 블록은 요소 뒤에 세미콜론을 사용합니다." |

상태값은 `entityAllowsExtensions`, `ddlSourceAnnotations`, `ddlxAnnotations`, `activationErrors`, `layer`로 둔다. 피드백은 "UI 주석을 뺐는데 화면 의미가 사라진 것이 아니라 DDLX로 이동했다"는 점을 시각적으로 보여줘야 한다.

### 정리

Metadata Extension은 CDS entity의 annotation을 별도 DDLX source로 분리하는 방법이다. 대상 entity에는 `@Metadata.allowExtensions: true`가 필요하고, extension source에는 `@Metadata.layer`와 `annotate entity ... with`가 필요하다. CH22에서는 UI annotation을 본문에서 분리해 CDS 구조를 읽기 쉽게 만드는 목적에 집중한다.

---

## CH22-L06 - DCL / Authorization 개요

### 왜 필요한가

데이터 모델을 만들고 UI 힌트까지 붙였다고 끝이 아니다. 실제 시스템에서는 "누가 어떤 데이터를 볼 수 있는가"가 중요하다. 같은 `ZI_Concert`라도 서울 공연 담당자는 서울 venue만 보고, 부산 담당자는 부산 venue만 봐야 할 수 있다.

이 권한 필터를 프로그램마다 `AUTHORITY-CHECK`와 WHERE 조건으로 반복하면 위험하다. 어떤 프로그램은 권한을 적용하고, 어떤 프로그램은 빠뜨릴 수 있다. CDS의 장점은 읽기 모델 가까이에 접근 제어를 선언해 여러 소비처가 같은 보안 규칙을 따르게 할 수 있다는 것이다.

### 무엇인가

DCL은 Data Control Language다. CDS entity에 대한 접근 규칙을 별도 DCL source로 정의한다. 기본 구조는 다음과 같다.

```abap
@MappingRole: true
define role ZI_Concert_Role {
  grant select on ZI_Concert
    where ( venue ) = aspect pfcg_auth( Z_VENUE_AUTH, VENUE, ACTVT = '03' );
}
```

읽는 순서는 다음과 같다.

| 코드 | 뜻 |
|---|---|
| `@MappingRole: true` | 이 DCL role이 CDS access control role임을 표시한다. |
| `define role ZI_Concert_Role` | 접근 규칙 이름을 정의한다. |
| `grant select on ZI_Concert` | `ZI_Concert`를 SELECT할 때의 허용 조건을 정의한다. |
| `where ( venue ) = aspect pfcg_auth(...)` | 사용자의 PFCG 권한을 기준으로 `venue` 값을 필터링한다. |

대상 CDS view는 권한 검사를 의도에 맞게 선언해야 한다.

```abap
@AccessControl.authorizationCheck: #CHECK
define view entity ZI_Concert
  as select from zconcert
{
  key concert_id,
      artist,
      venue,
      capacity
}
```

공식 문서 기준으로 CDS access control은 ABAP SQL로 CDS entity를 읽을 때 암묵적으로 평가될 수 있다. `#CHECK`는 access control이 있어야 한다는 기대를 분명히 드러내며, access control이 없으면 경고 관점에서 점검할 수 있다. `#NOT_REQUIRED`는 access control이 없어도 된다는 뜻으로 초기 예제에 적합하고, `#NOT_ALLOWED`는 access control을 적용하지 않겠다는 뜻에 가깝다. CH22에서는 `#CHECK`와 `#NOT_REQUIRED`의 차이만 확실히 잡는다.

중요한 구분이 있다. DCL role은 PFCG role을 사용자에게 배정하는 행위 그 자체가 아니다. DCL은 CDS access rule이고, `aspect pfcg_auth`는 classic PFCG 권한 객체의 값을 조건으로 참조한다. 즉 권한 객체 설계와 사용자 권한 부여는 별도 보안 설정이며, DCL은 그 결과를 CDS 조회 조건에 연결한다.

### 어떻게 확인하는가

첫째, DCL source가 활성화되는지 본다. `@MappingRole: true` 누락, role 이름 오류, 대상 CDS entity 오타, 권한 객체 또는 필드명 오류가 있으면 활성화 또는 점검 단계에서 드러난다.

둘째, 대상 view의 `@AccessControl.authorizationCheck`를 본다. DCL을 설명하는 레슨에서는 권한 규칙이 있어야 한다는 의도를 드러내기 위해 `#CHECK`로 바꾸는 편이 명확하다. `#NOT_REQUIRED`는 access control이 필수가 아니라는 뜻이므로, 초반 단순 조회 예제와 권한 확인 예제를 구분해야 한다.

셋째, 테스트 사용자별 Data Preview나 ABAP SQL 조회 결과를 비교한다. 예를 들어 사용자 A는 `venue = 'SEOUL'` 권한을 가지고, 사용자 B는 `venue = 'BUSAN'` 권한을 가진다고 가정한다. 같은 `SELECT FROM ZI_Concert`를 실행했을 때 보이는 행이 달라져야 한다.

```abap
SELECT concert_id, artist, venue
  FROM ZI_Concert
  INTO TABLE @DATA(lt_allowed_concerts).
```

넷째, 보안 테스트에서는 "권한 없는 행이 보이지 않는가"를 확인해야 한다. 단순히 오류가 없다고 통과가 아니다. 행 단위 권한은 결과 집합의 내용이 핵심이다.

### 실수와 주의

첫 번째 실수는 DCL을 만들면 자동으로 모든 상황에서 무조건 적용된다고 생각하는 것이다. CDS entity의 access control 설정, privileged access, 시스템 소비 방식에 따라 적용 여부를 확인해야 한다. CH22에서는 ABAP SQL로 일반 조회할 때의 기본 감각만 다룬다.

두 번째 실수는 `#NOT_REQUIRED`를 권한 규칙이 필요하다는 표시로 이해하는 것이다. 이름 때문에 "필요하지 않지만 관련 설정이 있으면 어떻게 되는가"라는 세부 동작에서 헷갈릴 수 있다. 학습 자료에서는 권한을 보여주는 예제에서 `#CHECK`를 사용해 의도를 명확히 한다.

세 번째 실수는 DCL role과 사용자 role assignment를 혼동하는 것이다. DCL의 `define role`은 CDS access rule이며, SU01/PFCG에서 사용자에게 role을 부여하는 작업과 같은 파일이 아니다.

네 번째 실수는 권한 필터를 UI에서만 막는 것이다. UI에서 버튼이나 컬럼을 숨겨도 데이터 모델을 직접 읽는 다른 소비처가 있으면 우회될 수 있다. 행 단위 권한은 가능하면 데이터 모델 가까이에서 일관되게 적용해야 한다.

### 체험형 학습 설계

"권한 필터 결과 비교기"를 만든다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| 사용자 선택 버튼 | `SEOUL_USER`, `BUSAN_USER`, `NO_AUTH_USER`를 전환한다. | 선택한 사용자의 PFCG 권한 값을 배지로 보여준다. |
| `DCL 적용` 토글 | `#CHECK`와 `#NOT_REQUIRED` 학습 상태를 전환한다. | `#CHECK`는 권한 규칙 존재를 기대하는 설정, `#NOT_REQUIRED`는 초반 단순 조회에 쓴 설정으로 구분해 보여준다. |
| `SELECT 실행` 버튼 | 같은 `SELECT FROM ZI_Concert`를 실행한 결과를 사용자별로 보여준다. | 같은 코드, 다른 결과 행을 비교한다. |
| `권한 없는 행 찾기` 버튼 | 현재 결과에 허용되지 않은 venue가 섞였는지 검사한다. | 발견 시 "보안 실패: 권한 없는 venue 노출"을 띄운다. |

상태는 `currentUser`, `pfcgValues`, `accessControlMode`, `visibleRows`, `securityFindings`로 둔다. 이 시뮬레이터의 핵심 피드백은 "권한 검사는 화면 장식이 아니라 결과 행을 바꾸는 데이터 조건"이라는 점이다.

### 정리

DCL은 CDS entity에 행 단위 접근 제어를 붙이는 선언적 보안 모델이다. `@MappingRole: true`, `define role`, `grant select`, `aspect pfcg_auth`가 핵심이며, 대상 CDS view의 `@AccessControl.authorizationCheck` 설정과 함께 봐야 한다. CH22에서는 PFCG 권한 객체와 연결된 기본 필터 감각까지만 익히고, RAP instance authorization은 다음 단계로 넘긴다.

---

## CH22-L07 - 실습: 콘서트 CDS 뷰 ZI_/ZC_

### 왜 필요한가

지금까지 배운 문법을 따로 보면 각각은 작아 보인다. 그러나 실무 가치는 조합에서 나온다. 콘서트 앱의 테이블 위에 `ZI_Concert`, `ZI_Perf`, `ZC_Concert`를 만들면 다음 변화가 생긴다.

프로그램은 테이블을 직접 읽는 대신 CDS entity를 읽을 수 있다. 공연과 회차의 관계는 association으로 모델에 남는다. 화면 목록에 필요한 필드는 projection에서 고른다. UI annotation은 Metadata Extension으로 분리할 수 있다. 권한이 필요하면 DCL로 row-level filter를 붙일 수 있다.

이 실습은 CH23 RAP로 가기 전의 마지막 기반 작업이다. RAP를 만들지는 않지만, RAP가 올라갈 수 있는 읽기 모델의 뼈대를 만든다.

### 무엇인가

실습 산출물은 네 가지다.

| 산출물 | 역할 |
|---|---|
| `ZI_Concert` | 공연 테이블의 재사용 기반 CDS view |
| `ZI_Perf` | 회차 테이블의 재사용 기반 CDS view |
| `ZC_Concert` | 화면/서비스 소비를 염두에 둔 projection view |
| `ZC_Concert` metadata extension | UI 목록 annotation 분리 |

먼저 회차 기반 view를 만든다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
define view entity ZI_Perf
  as select from zperf
{
  key concert_id,
  key perf_no,
      perf_date
}
```

다음으로 공연 기반 view를 만들고 회차 association을 연결한다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
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

그 위에 소비용 projection을 만든다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.allowExtensions: true
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

마지막으로 UI 목록 annotation을 metadata extension으로 분리한다.

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

이 실습에서는 잔여석 집계나 예매 수 계산을 구현하지 않는다. association과 aggregate를 결합해 잔여석을 계산하는 설계는 좋은 확장 과제지만, CH22의 핵심 문법을 넘어서기 쉽다. 여기서는 "공연과 회차가 관계로 연결되었다"는 기반까지만 완성한다.

### 어떻게 확인하는가

확인은 순서가 중요하다.

1. `ZI_Perf`를 먼저 활성화한다. `ZI_Concert`가 association target으로 `ZI_Perf`를 참조하기 때문이다.
2. `ZI_Concert`를 활성화한다. `_Perf` association이 보이고, ON 조건이 `concert_id`로 연결되는지 확인한다.
3. `ZC_Concert`를 활성화한다. projection이 `ZI_Concert`를 기반으로 하며 `_Perf`가 그대로 노출되는지 본다.
4. Metadata Extension을 활성화한다. `ZC_Concert`에 `@Metadata.allowExtensions: true`가 없으면 먼저 고친다.
5. ADT Data Preview로 `ZI_Concert`와 `ZC_Concert`를 각각 조회한다. 두 view의 행 수와 필드 노출 차이를 비교한다.
6. ABAP SQL로 `ZC_Concert`를 읽는다.

```abap
SELECT concert_id, artist, venue, capacity
  FROM ZC_Concert
  INTO TABLE @DATA(lt_concerts).
```

검증 표는 다음처럼 작성한다.

| 점검 항목 | 기대 결과 |
|---|---|
| `ZI_Perf` 활성화 | 회차 키 `concert_id`, `perf_no`가 보인다. |
| `ZI_Concert` 활성화 | `_Perf` association이 있고, source `concert_id`가 select list에 있다. |
| `ZC_Concert` 활성화 | projection이 필요한 필드와 `_Perf`를 노출한다. |
| Metadata Extension 활성화 | `@UI.lineItem`이 DDLX에 있고 본문이 UI annotation으로 과도하게 오염되지 않는다. |
| ABAP SQL 조회 | 프로그램이 `ZC_Concert`를 데이터 소스로 읽는다. |

### 실수와 주의

첫 번째 실수는 활성화 순서를 무시하는 것이다. `ZI_Concert`가 `ZI_Perf`를 association target으로 참조하므로 target이 먼저 존재해야 한다.

두 번째 실수는 projection에서 association을 빠뜨리는 것이다. 소비자가 회차 경로를 따라가야 한다면 `ZC_Concert`에서도 `_Perf`를 노출해야 한다. 반대로 소비처에 관계를 공개하고 싶지 않다면 projection에서 의도적으로 뺄 수 있다. 중요한 것은 실수인지 설계인지 구분하는 것이다.

세 번째 실수는 metadata extension을 만들면서 `@Metadata.allowExtensions: true`를 projection에 넣지 않는 것이다. DDLX만 만들어서는 충분하지 않다.

네 번째 실수는 CH23 내용을 실습에 섞는 것이다. 이 장의 최종 산출물은 CDS view와 metadata extension이다. `define behavior`, behavior pool, service definition, service binding, action, validation은 작성하지 않는다.

다섯 번째 실수는 잔여석 계산을 성급하게 넣는 것이다. 잔여석은 `capacity - booked_count`처럼 단순해 보이지만 실제로는 예매 상태, 취소, 집계, 중복, 권한, 성능을 함께 봐야 한다. CH22에서는 확장 과제로 설계만 하고, 본문 코드는 기본 모델에 집중한다.

### 체험형 학습 설계

최종 실습 화면은 "콘서트 CDS 빌더"로 구성한다.

| UI 요소 | 동작 | 피드백 |
|---|---|---|
| `1. ZI_Perf 만들기` 버튼 | 회차 view 코드를 생성하고 활성화 상태를 표시한다. | target view 준비 완료 배지를 보여준다. |
| `2. ZI_Concert 만들기` 버튼 | 공연 view와 `_Perf` association을 생성한다. | ON 조건의 양쪽 필드를 선으로 연결해 보여준다. |
| `3. ZC_Concert 만들기` 버튼 | projection view를 생성한다. | `ZI_`와 `ZC_`의 필드 차이를 비교 표로 표시한다. |
| `4. Metadata Extension 분리` 버튼 | UI annotation을 DDLX 패널에 만든다. | 본문과 metadata 영역이 분리되었다는 상태를 보여준다. |
| `5. Data Preview` 버튼 | `ZI_Concert`, `ZC_Concert` 결과를 나란히 표시한다. | 노출 필드와 row count를 비교한다. |
| `6. 소비 코드 생성` 버튼 | `SELECT FROM ZC_Concert` ABAP SQL을 생성한다. | 프로그램이 소비 view만 읽는다는 피드백을 준다. |

필수 상태는 `ziPerfActive`, `ziConcertActive`, `zcConcertActive`, `metadataExtensionActive`, `associationExposed`, `previewRows`, `generatedSql`이다. 버튼은 순서 의존성을 가져야 한다. 예를 들어 `ZI_Perf`가 활성화되지 않았는데 `ZI_Concert`를 만들려고 하면 "association target이 아직 없습니다"라는 오류를 보여준다.

도전 과제는 별도 카드로 둔다.

| 도전 과제 | CH22에서의 처리 |
|---|---|
| 잔여석 계산 | 구현 대신 필요한 데이터와 관계를 설계하게 한다. `capacity`, 예매 수, 취소 상태, 회차별 집계가 필요하다는 질문을 던진다. |
| 예매 association 추가 | `_Booking [0..*]` 관계를 어디에 두는 것이 자연스러운지 그리게 한다. |
| 권한 적용 | L06의 DCL을 `venue` 기준으로 붙였을 때 결과가 어떻게 달라지는지 사용자별로 비교한다. |

### 정리

CH22 최종 실습은 콘서트 앱의 읽기 모델을 CDS로 올리는 작업이다. `ZI_Perf`, `ZI_Concert`, `ZC_Concert`, Metadata Extension을 순서대로 만들고, Data Preview와 ABAP SQL로 확인한다. 여기까지 완성하면 CH23에서 RAP가 사용할 기반 view 계층을 이해할 준비가 된다. 하지만 CH22 자체는 CDS 기초 장이므로 RAP 구현 코드는 작성하지 않는다.

---

## CH22 마무리

CH22에서 배운 것은 하나의 문법이 아니라 데이터 모델을 설계하는 방식이다. `define view entity`로 읽기 모델을 만들고, `ZI_`와 `ZC_`로 기반과 소비를 나누며, association으로 관계를 선언하고, annotation과 metadata extension으로 의미와 UI 힌트를 관리한다. 마지막으로 DCL을 통해 행 단위 접근 제어의 기본 모양을 본다.

입문자가 이 장을 마쳤다면 다음 질문에 답할 수 있어야 한다.

| 질문 | 기대 답 |
|---|---|
| CDS View Entity는 ABAP 프로그램인가? | 아니다. ADT DDL Source에 작성하는 데이터 모델 정의다. |
| `ZI_`와 `ZC_`는 문법인가? | 아니다. 기반 view와 소비 view를 구분하기 위한 명명 관습이다. |
| Association은 JOIN을 없애는가? | 아니다. 관계를 모델에 선언하고, path 사용 시 JOIN으로 변환될 수 있다. |
| Annotation은 일반 주석인가? | 아니다. 활성화된 CDS metadata로 도구가 읽을 수 있는 정보다. |
| Metadata Extension은 필드를 추가하는가? | 아니다. 기존 CDS entity에 annotation을 별도 source로 붙인다. |
| DCL role은 PFCG role 배정 그 자체인가? | 아니다. CDS access rule이며, PFCG 권한 객체를 조건으로 참조할 수 있다. |
| CH22에서 RAP 코드를 작성하는가? | 아니다. RAP는 CH23에서 다룬다. CH22는 RAP 아래의 CDS 기반을 만든다. |

다음 CH23에서는 이 CDS 기반 위에 RAP를 얹어 트랜잭션 서비스 모델로 확장한다. CH22를 단단히 이해해야 CH23의 `ZI_`, `ZC_`, service, behavior가 갑자기 등장한 문법이 아니라 앞에서 만든 모델의 다음 단계로 보인다.
