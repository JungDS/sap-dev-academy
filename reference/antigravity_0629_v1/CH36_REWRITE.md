# CH36_REWRITE - RAP + Fiori 실무 Capstone v1

> 목적: `content/abap/CH36`의 7개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH36 전체 설계

CH36의 한 문장 목표는 "아바 아카데미의 대단원으로서, 데이터 테이블 설계부터 CDS Interface(`ZI_`), UI 렌더링용 Projection(`ZC_`), RAP 동작 제어 BDEF/BIMP(Action, Validation, Determination), OData V4 서비스 바인딩 및 Fiori Elements Preview, 그리고 `draft table` 스키마 제약, `IN LOCAL MODE` 핸들러 격리 락, DCL 권한 모델링을 통합하여 실전 예매 풀스택 앱을 완수한다"이다.

IT 비전공자 입문자는 BDEF 에 `draft table zbooking_d` 를 기재한 뒤 임시 드래프트 테이블인 `zbooking_d` 를 데이터 사전(DDIC)에 뼈대를 구축해 활성화하지 않아 컴파일 거절 장벽을 만나고, Behavior Pool 핸들러 내부에서 데이터 갱신 시 `IN LOCAL MODE` 수식어를 빼먹어 전사 권한 제어와 글로벌 락 가드의 이중 기동으로 인한 교착 상태 롤백 장애를 겪는다.
또한, 비주얼 @UI 주석들을 Projection 뷰(`ZC_`) 선언부에 쌩으로 도배하여 데이터 모델의 순수성을 해치고, 비즈니스 권한 격리를 초기 단계에 배치하지 않아 배포 시점에 전체 전산망 권한 락을 마비시킨다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **CAPSTONE 여정 조율**: 데이터 테이블 구조 설계부터 최종 OData UI 미리보기까지 전체 5대 레이어의 연동 맵 제시.
2. **ZI_ Interface root**: 감사 필드 `created_by` 에 시맨틱 `@Semantics.user.createdBy: true` 주석을 달고, 공연/회차 정보를 노출하는 `define root view entity` 수립.
3. **ZC_ UI Projection**: 메타데이터 확장 `@Metadata.allowExtensions: true` 옵션을 켜고, lineItem 및 identification/facet 레이아웃을 쪼개는 MTE 아키텍처 제시.
4. **BDEF Draft table 락**: `zbooking_d` 드래프트 테이블 물리 DB 매핑 제약을 명세하고, `readonly` 키 정의 및 unique 비헤이비어 폴 조립.
5. **IN LOCAL MODE 격리**: 핸들러(`validateCapacity`, `cancelBooking`) 내벽 UPDATE 시, **`IN LOCAL MODE`** 수식어로 락 교착을 차단하고 `failed`/`reported` 메시지 전송.
6. **OData V4 UI 바인딩**: 서비스 정의(`ZUI_Booking`) 및 Binding 격발을 거쳐 코드 0줄로 Fiori Elements List Report/Object Page Preview 를 기동하는 모던 개발 체계 완수.
7. **DCL 행 보안 DCL**: global/instance 레벨의 권한 제어 코드를 물려 배포 품질(ATC/Unit)을 달성하고, 0부터 완주한 신입 개발자의 이정표 제시.

---

## CH36-L01 - Capstone 업무 시나리오 정의

### 왜 필요한가

우리가 이전 수십 개 챕터를 지나며 데이터 딕셔너리 테이블(`ZTICKET`), Open SQL, 1+N 튜닝, SAP Gateway, RFC, Application Log 등 무수히 많은 개별 부품들의 조립과 설계법을 다 마스터해 냈다.
그런데 이 개별 부품들을 내 머릿속에서 하나의 완성된 실전 애플리케이션으로 꿰어내지 못한다면 장벽을 만난다.
- " 부품은 다 배웠는데, 실제 현업에서 '콘서트 예매 시스템 구축 프로젝트' 미션을 주자, 어디서부터 펜을 잡아야 할지 눈앞이 하얗게 굳어버린다."
데이터베이스 테이블 설계부터 데이터 모델 CDS, 비즈니스 제어 RAP, 웹 노출 OData, 그리고 모던 화면 Fiori Elements 를 순서대로 정렬해 하나의 컨베이어 벨트로 이어가지 못하면, 엉뚱하게 화면부터 짜기 시작하다가 DB 데이터가 매칭이 안 되어 프로젝트를 통째로 엎어버리는 참상을 겪는다.

**콘서트 예매 풀스택 시나리오(공연 조회 -> 예매 등록 -> 초안 보관 -> 정원 검증 -> 예매 취소 -> 권한 격리)를 바탕으로, 전체 5대 기술 레이어(데이터-모델-동작-서비스-UI)의 통합 지도를 머릿속에 뼈대로 이식하는 기술**이 필요하다. 그것이 **Capstone 업무 시나리오의 확립**이다.

### 무엇인가

#### 1. Capstone 업무 시나리오
- 본사 영업팀 정훈영 사원이 웹 Fiori 화면에 로그인한다.
- 콘서트 리스트에서 마음에 드는 좌석 수를 적고 예매(CUD) 단추를 누른다.
- 작성 도중 취소하면 임시 보관(Draft)되고, 완료 시 정원 초과 검증(Validation)을 통과한 무결한 건만 DB 에 안착된다.
- 실수로 예약한 건은 '예매 취소' 액션(Action) 버튼을 눌러 상태를 업데이트하고, 권한이 없는 다른 공연은 화면에 노출되지 않도록 행 단위 보안(DCL)이 작동한다.

#### 🧭 [ Capstone 풀스택 5대 기술 레이어 연동 맵 명세 ]
- *우리는 0번 지점에서 시작해 아래의 정석 단계대로 컨베이어 벨트를 차례대로 쌓아 올린다.*

```text
[1단계] 데이터 레이어 (DB Table - DDIC) : 
   실제 데이터를 영구 저장할 sflight, zbooking 물리 테이블 셋업.
   │
   ▼
[2단계] 모델 레이어 (CDS View - ZI_ / ZC_) :
   Zbooking 을 읽는 root view entity ZI_Booking 과, UI @UI 주석을 얹은 ZC_Booking 소비 뷰 조립.
   │
   ▼
[3단계] 동작 레이어 (RAP - BDEF / BIMP) :
   CUD 권한을 통제하는 BDEF 와, 실제 정원 초과 검증/취소를 구현하는 Behavior Pool ZBP_I_BOOKING 구현.
   │
   ▼
[4단계] 서비스 레이어 (OData - Service Definition / Binding) :
   소비 CDS 뷰를 외부 웹에 노출하기 위한 OData V4 / UI 포트 서비스 바인딩 활성화.
   │
   ▼
[5단계] UI 레이어 (Fiori Elements Preview) :
   HTML/JS 코드를 단 1줄도 적지 않고, 메타데이터 @UI 를 토대로 고품격 웹 화면 자동 주조 미리보기.
```

### 어떻게 확인하는가

통합 지도의 순서에 맞춤형 가설을 엮어 빌드 시작점을 식별하는 법을 검증한다.

```text
Q. 예매 저장 시 자동으로created_by(감사필드)에 로그인 유저를 박아주는 동작은 어느 레이어에 해당하는가?
   -> 판정 : [3단계 동작 레이어 (RAP Behavior Pool)] 에 대고 Determination 을 구현할 항목이다!

Q. Fiori Elements Preview 화면을 켰는데 아무 필드도 안 보이는 구멍 현상은 어느 단계의 오동작인가?
   -> 판정 : [2단계 모델 레이어] 의 ZC_ 소비 뷰에 @UI.lineItem 이나 facet 주석을 빼먹어 발생한 현상이다!
```

#### 체험/시뮬레이터 설계 (Capstone 통합 지도 탭)
- **프로세스 플로우**:
  1. 학습자가 [5대 컨베이어 벨트 라인]을 본다. 
  2. [1단계 DB] 에 불이 켜지자 데이터가 얹힌다.
  3. [2단계 CDS] 로 넘어가자 예매 정보가 구조를 잡는다.
  4. [3단계 RAP] 에 닿자 취소/저장 정원 필터 기어가 결합한다.
  5. [4단계 OData] 에서 케이블이 연결되어 웹 주소망이 뚫리고, [5단계 Fiori] 에서 모바일 화면이 번쩍 켜지며 실시간 예매 데이터가 연동 렌더링되는 유기적인 완성 피드백을 감상한다.
- **상태 및 데이터**:
  - `순서를 어기고 UI 디자인부터 먼저 작성하려 시도한 상태` -> 런타임 결과: `Data schema undefined. Build pipe failed` 하이라이트.
- **피드백**: 실무 풀스택 개발은 무작정 코드를 치는 것이 아니라, 데이터에서 시작해 화면으로 순차 도달하는 파이프라인의 조율임을 체득한다.

### 실수/주의

- **핵심인 예매 등록/취소 동작이 정상 작동하지 않는 상태에서, PDF 다운로드나 외부 파일 연동 같은 복잡한 부가 퀘스트 기능에 욕심을 내어 소스에 마구 결합**:
  - 이 실수 시 소스가 통째 꼬여 핵심 예매 컴파일조차 실패한 채 릴리즈 기한을 맞이하게 된다.
  - **무조건 핵심 뼈대(데이터-CDS-BDEF)를 1차 정상 통과 완료해 둔 뒤, 꼬리에 부가 기능을 한 칸씩 증설해야 함을 수호해야 한다.**

### 정리

- 실전 Capstone 은 **`데이터 -> CDS -> RAP -> OData -> Fiori Elements`** 의 정석 순서를 밟는다.
- 예매 생성 시 초안 보관(**`Draft`**), 정원 검증(**`Validation`**), 예매 취소(**`Action`**) 비즈니스를 통합한다.

---

## CH36-L02 - ZI_* Interface View 설계

### 왜 필요한가

Capstone 의 지도 구상을 마쳤다.
이제 1단계 데이터 테이블을 바탕으로, 2단계 모델 레이어의 토대인 'ZI_ Interface View (인터페이스 뷰)' 를 빚어야 한다.
- " 물리 DB 테이블 `zbooking` 을 읽는 기반 CDS 뷰를 만들려 한다. 
여기에 이 예매가 어느 공연(`ZI_Concert`), 어느 회차(`ZI_Perf`)인지 데이터 관계망을 엮어주어 화면에서 꼬리를 물고 탐색할 수 있게 개방해 주고 싶다."
기존의 클래식 SQL VIEW 는 두 테이블을 붙이려면 쌩 `JOIN` 을 갈겨 뷰가 너무 무거워지고 확장이 차단된다. 
또한 데이터가 수정된 시간이나 로그인 사용자 정보인 감사 필드(`created_by`)에 아무 시맨틱 표시를 안 해두면, 나중에 RAP 엔진이 이를 인지하지 못해 감사 스탬프를 자동으로 채워주지 못하는 오작동을 유발한다.

**트랜잭션 대상인 예매 뷰를 root 로 지정하고, 공연/회차 정보를 JOIN 대신 Association(연관)으로 맺어 노출하며, 감사 필드에 `@Semantics.user.createdBy: true` 주석을 심어 CDS 뷰를 빚어내는 기술**이 필요하다. 그것이 **ZI_* Interface View** 의 설계다.

### 무엇인가

#### 1. Interface View (ZI_ 기반 뷰)
- 데이터베이스 테이블 ZTABLE 에서 날것의 원본 필드를 그대로 가져오고, 비즈니스 관계 연관(Association)을 맺어두어, 전체 CDS 아키텍처의 뿌리 토대가 되는 기반 뷰다. (네이밍 규칙 `ZI_` 를 준수한다.)

#### 2. define root view entity (루트 뷰 엔티티 선언)
- **전체 비즈니스 트랜잭션(CUD 생성/수정/삭제)의 대장이 될 머리 뷰 엔티티를 선언하는 배지다. 예매(`ZI_Booking`) 뷰를 `root` 로 선언해 두어야, 이를 바탕으로 나중에 RAP 동작 BDEF 이 예약 락(Lock Master)을 걸고 저장할 수 있다.**

#### 3. association [1..1] to ZI_Concert as _Concert (연관 관계 노출)
- *JOIN 의 성능적 한계를 극복하는 모던 CDS 의 핵심이다.*
- 지금 당장 조인해서 메모리를 낭비하지 않고, 나중에 화면에서 "이 예매의 콘서트 정보가 보고 싶다" 고 꼬리를 물어 클릭할 때만 DB 가 알아서 찾아오도록 느긋한 로딩(Lazy Loading) 통로를 개설하는 선언이다. (반드시 하단 중괄호 `{ }` 내벽 맨 꼬리에 `_Concert` 라고 이름을 노출해 주어야 소비가 뚫린다.)

#### 4. @Semantics.user.createdBy: true (감사 필드 주석)
- *사용자 도장을 찍는 매커니즘이다.*
- 이 주석이 달린 created_by 필드는, 나중에 RAP 프레임워크가 폼 입력 창에 쌩뚱맞은 값을 안 적어도, 로그인한 사용자 ID (`sy-uname`)를 백엔드에서 식별해 자동으로 찰딱 기입해 주는 감사 통로가 된다.

### 어떻게 확인하는가

association 과 Semantics 주석을 갖추고 root 로 선언된 ZI_Booking 뷰 소스를 검증한다.

```cds
@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #NOT_REQUIRED // DCL 권한은 ZC 소비 뷰에서 채울 예정!
@EndUserText.label: '예매 기반 인터페이스 뷰'
@Metadata.ignorePropagatedAnnotations: true

// 1. [★ CUD 저장의 대장이 될 root view entity 선언!]
define root view entity ZI_Booking
  as select from zbooking as Booking
  
  // 2. [JOIN 대신 느긋한 로딩 통로인 Association 개방!]
  association [1..1] to ZI_Concert as _Concert
    on $projection.concert_id = _Concert.concert_id
  association [1..1] to ZI_Perf    as _Perf
    on  $projection.concert_id = _Perf.concert_id
    and $projection.perf_no    = _Perf.perf_no
{
  key booking_id,
      concert_id,
      perf_no,
      customer,
      seats,
      status,
      
      // 3. [★ 감사 로그 시맨틱스 장착: 만든 사람 자동 기록 연동]
      @Semantics.user.createdBy: true
      created_by,
      
      // 4. [★ 중괄호 꼬리에 association 경로를 반드시 노출해 개방할 것!]
      _Concert, 
      _Perf
}
```

#### 체험/시뮬레이터 설계 (ZI_Booking CDS 뷰 구조선)
- **프로세스 플로우**:
  1. 학습자가 [zbooking DB] 와 [ZI_Booking CDS 뷰 기판]을 본다.
  2. 기판 위에 [define root view] 스위치를 올린다. 
  3. [_Concert Association 선] 이 옆 콘서트 칩에 지잉 점선으로 흐릿하게 배선 매칭된다. (조인처럼 다 가져오는 게 아니라 대기선만 연결됨.)
  4. 중괄호 `{ }` 내벽에서 `_Concert` 노출 카드를 쏙 빼버린다. 점선 케이블이 뚝 끊기며 "Association not exposed. External consumption blocked" 적색 경고가 들어오는 렌더링 피드백을 감상한다.
- **상태 및 데이터**:
  - `created_by 감사 필드에 Semantics 주석을 누락한 상태` -> 런타임 결과: `System Stamp bypass. created_by field remains NULL after insert` 하이라이트.
- **피드백**: Interface 뷰는 CUD 트랜잭션 대장(`root`) 설정과 비즈니스 경로 개방(`_Concert` 노출)이 핵심 정합성 요소임을 배운다.

### 실수/주의

- **두 테이블 간의 관계인 Cardinality 지정 시, 예약:공연 = [1..*] (일대다) 인데 [1..1] 로 잘못 기재해 선고**:
  - 런타임에 2차 조인 연산이 꼬여 데이터가 증발하거나 "Cardinality 위배" 덤프를 터트린다.
  - **실제 테이블 키 매칭 카디널리티를 엄수해 수호해야 한다.**

### 정리

- 데이터 테이블의 날것을 가져와 뼈대를 잡는 CDS 뷰는 **`Interface View (ZI_)`** 다.
- CUD 트랜잭션을 소화하려면 뷰 명칭 앞에 **`define root view entity`** 를 장착한다.
- 불필요한 DB 조인을 피하기 위해 **`Association`** 경로를 트리에 뚫고 중괄호에 노출한다.

---

## CH36-L03 - ZC_* Projection View 설계

### 왜 필요한가

기반 인터페이스 뷰(`ZI_`)는 완성했다.
이제 2단계 모델 레이어의 꽃인 '소비용 Projection View (프로젝션 뷰)' 와 화면 레이아웃 주석의 매칭이 문제다.
- " ZI_Booking 을 Fiori 웹 화면에 얹어 보여줄 뷰를 빚고 싶다.
화면의 첫 번째 칼럼에는 '공연ID' 가 와야 하고, 필드 레이블에는 친근한 한글로 '공연' 이라고 박혀 있어야 한다. 
상세 페이지로 클릭해 들어갔을 때는 '예약번호, 고객명' 필드가 상세 폼 그룹(Identification Facet)으로 이쁘게 정렬되어 보여야 한다."
기존 SAP GUI 에선 이 모든 필드 정렬과 버튼 배치를 Dynpro 화면 소스 수천 줄을 짜서 조작해야 했다. 
- "화면 소스 코드는 단 1줄도 안 쓰고, 오직 CDS 필드 머리맡에 '목록의 10번 자리에 이 필드를 그리라' 는 **메타데이터 UI 주석**만 찰딱 적어주면 Fiori 웹 브라우저가 알아서 화면을 주조해 그리는 기적의 기술이 필요하다."
그것이 **ZC_* Projection View 와 @UI 주석**의 결합이다.

### 무엇인가

#### 1. Projection View (ZC_ 소비 뷰)
- 기반 인터페이스 뷰(`ZI_`)를 거울로 투영(Projection)하여, 실제 웹 화면 OData 포트나 서비스 단에 대고 1:1 최종 소비 배급하는 겉 표면 뷰다. (네이밍 규칙 `ZC_` 를 준수한다. provider contract transactional_query 옵션을 부착한다.)

#### 2. @Metadata.allowExtensions: true
- **소비 뷰 안에 수백 줄의 @UI 주석들이 도배되기 시작하면 코드가 오염되므로, 이 주석들을 별도의 Metadata Extension (MTE) 이라는 메타데이터 전용 개별 파일로 쪼개어 격리 분리해 쓰도록 허락해 주는 확장 개방 단추다.**

#### 3. @UI.lineItem: [{ position: 10 }] (목록 칼럼 배치)
- Fiori 그리드 표 화면(List Report)에서, 왼쪽부터 10번 인덱스 자리에 이 필드를 한 줄 컬럼으로 그리라고 지시하는 비주얼 주석이다.

#### 4. @UI.facet 과 identification (상세 폼 그룹 배치)
- **@UI.facet**: 상세 페이지(Object Page) 화면 캔버스에 텍스트 입력 폼을 담아둘 이쁜 사각 테두리 바구니(Group Facet)를 10번 위치에 가설하라는 지시다.
- **@UI.identification**: 내 필드(예: customer)를 방금 가설한 그 사각 테두리 바구니 속 20번 입력창 칸에 집어넣어 렌더링하라는 도킹 지시다.

### 어떻게 확인하는가

UI 주석을 얹어 ZI_Booking 을 프로젝션 투영하는 ZC_Booking 소스를 검증한다.

```cds
@AccessControl.authorizationCheck: #NOT_REQUIRED // DCL 은 여기서 조율 예정!
@EndUserText.label: '예매 소비 프로젝션 뷰'
@Metadata.allowExtensions: true // [★ @UI 주석 격리용 확장 MTE 전원 ON!]

// 1. [★ 트랜잭션 소비 계약 provider contractTransactional 선포!]
define root view entity ZC_Booking
  provider contract transactional_query
  as projection on ZI_Booking
{
  // 2. [★ 상세 화면에 Identification 바구니 Facet 개설!]
  @UI.facet: [
    { id:       'BookingDetail',
      purpose:  #STANDARD,
      type:     #IDENTIFICATION_REFERENCE,
      label:    '상세 예매 내역 정보',
      position: 10 }
  ]

  key booking_id,

  // 3. [그리드 목록 10번 컬럼 & 상세 바구니 10번 입력창에 공연ID 매핑!]
  @UI: { lineItem:       [{ position: 10 }],
         identification: [{ position: 10 }] }
  @EndUserText.label: '공연 코드' " 한글 레이블 선고!
  concert_id,

  @UI: { lineItem:       [{ position: 20 }],
         identification: [{ position: 20 }] }
  @EndUserText.label: '고객명'
  customer,

  @UI: { lineItem:       [{ position: 30 }],
         identification: [{ position: 30 }] }
  @EndUserText.label: '예매 좌석 수'
  seats,

  @UI: { lineItem:       [{ position: 40 }] }
  @EndUserText.label: '예매 상태'
  status,
  
  /* Associations */
  _Concert,
  _Perf
}
```

#### 체험/시뮬레이터 설계 (ZC_Booking @UI 주석 디자이너)
- **프로세스 플로우**:
  1. 학습자가 [Fiori 표 그리드 화면] 과 [ZC_Booking CDS 소스 캔버스] 를 본다.
  2. `customer` 필드 머리 위에 [@UI.lineItem position 20] 주석 핀을 꽂자, Fiori 표 2번째 칸에 '고객명' 컬럼이 실시간으로 촥 그려진다.
  3. 이번엔 `status` 필드에서 [@UI.lineItem] 핀을 싹 뽑아버린다. Fiori 표 그리드에서 상태 컬럼이 흔적도 없이 사라지는 시각 렌더링을 감상한다.
- **상태 및 데이터**:
  - `소비 뷰인데 provider contract 지정을 빼먹고 빌드한 상태` -> 런타임 결과: `Contract violation. Transactional query feature disabled` 하이라이트.
- **피드백**: Projection 뷰는 화면 렌더링 지침서(`@UI`)와 서비스 계약(`provider contract`)이 합치되어야 Fiori Elements 가 주조됨을 확인한다.

### 실수/주의

- **상세 폼 바구니인 @UI.facet 의 ID 명칭과, 각 필드 바인딩의 @UI.identification 대상 Facet ID 명칭을 다르게 입력해 매핑 미스**:
  - 이 실수 시 상세 페이지로 진입했을 때 바구니 매핑이 풀려 화면에 아무런 입력창 필드도 그려지지 않는 '상세 텅 빔' 버그를 겪는다.
  - **Facet ID 꼬리표 결선을 1:1 완벽하게 매칭 수호해야 한다.**

### 정리

- **`Projection View (ZC_)`** 는 기반 뷰를 화면 소비 목적에 맞게 재가공 투영하는 거울 뷰다.
- UI 메타데이터 오염을 막기 위해 **`@Metadata.allowExtensions: true`** 와 MTE 를 활용한다.
- 목록 표는 **`lineItem`**, 상세 입력창은 **`facet / identification`** 주석 배지로 렌더링 위치를 잡는다.

---

## CH36-L04 - Behavior Definition / Implementation

### 왜 필요한가

소비 뷰와 UI 주석 캔버스까지 이룩했다.
이제 3단계 동작 레이어의 기둥인 '동작 정의(BDEF)' 와 '초안 보관(Draft)' 의 설계가 장벽이다.
- " 사용자가 Fiori Elements 화면에서 [예매 등록(Create)] 과 [수정(Update)], [삭제(Delete)] 단추를 누르면, 데이터베이스 테이블에 안전하게 써져야 한다.
이때 예약번호(`booking_id`)는 아바 프로그램이 내부 번호 발급기로 알아서 따서 넣어주어야 하므로 화면에선 절대 수정할 수 없게(Read Only) 잠가두고 싶다."
기존 ABAP 에서는 화면 잠금 제어(LOOP AT SCREEN)와 DML SQL 저장 로직을 개발자가 PAI/PBO 에 수작업 코딩으로 쑤셔 넣어야 해 코드가 파손되기 쉬웠다.
또한, managed RAP 상에서 대량 입력 도중 튕겼을 때 복구하는 임시 초안 저장 기능(`zbooking_d`) 테이블의 구조 제약을 알지 못해 BDEF 빌드가 폭사한다.

**BDEF 에 managed implementation unique 를 선포하고, zbooking persistent 매핑을 엮으며, readonly 필드 가드를 올리고, DDIC 에 zbooking_d 드래프트 임시 테이블의 물리 빌드를 완수하는 기술**이 필요하다. 그것이 **Behavior Definition / Implementation** 의 설계다.

### 무엇인가

#### 1. Behavior Definition (BDEF - 동작 정의서)
- 내 예매 뷰에 대고 "이 엔티티는 Create 가 되고, Delete 도 되고, cancelBooking 이라는 특수 버튼(Action)이 격발된다" 라고 비즈니스 동작 명세를 아바 프로그램 밖에서 계약 정의해 두는 행동 설계도 파일이다.

#### 2. Behavior Implementation (BIMP / Behavior Pool - 동작 구현체)
- BDEF 설계서에 적어둔 비즈니스 규칙(기본값 채우기, 정원 초과 검증 등)의 진짜 Z코드를 담아서 아바 클래스로 코딩해 주는 실제 구현 클래스 안방이다. (`unique` 에 선고된 zbp_i_booking 클래스다.)

#### ⚠️ [ BDEF draft table 선언 제약 및 DDIC 물리 테이블 빌드 명세 ]
- *임시 초안 보관 기능 작동 시 입문자가 100% 컴파일 차단을 겪는 테이블 스키마 제약이다.*
- **BDEF 에 `draft table zbooking_d` 를 적으면, 이 임시 드래프트 테이블인 `zbooking_d` 도 반드시 데이터 사전(DDIC)에 동일한 구조 스키마로 물리 생성 및 활성화되어 있어야 한다.**
- **이유**: **사용자가 타이핑을 치는 찰나, 백엔드 RAP 이 DB 의 zbooking_d 테이블 공간에 임시 저장 이송을 단행하기 때문이다. 이 테이블 구조 안에는 `zbooking` 의 키 필드들에 더해, 드래프트 전용 관리 키 필드들(`%admin` 공통 구조체)이 물리적으로 합치되어 빌드되어 상주해야만 BDEF 컴파일이 통과된다.**

### 어떻게 확인하는가

readonly 와 draft table 매핑이 체결된 BDEF 설계서 코드를 검증한다.

```bdef
// 1. [managed (아바가 CUD 저장을 직접 관리해라) 선포!]
// 2. [ZBP_I_BOOKING 구현 클래스 unique 결선!]
managed implementation in class zbp_i_booking unique;

// 3. [임시 드래프트 복구 락 및 마스터 락 선포]
define behavior for ZI_Booking alias Booking
persistent table zbooking
draft table zbooking_d // [★ zbooking_d 물리 테이블이 DDIC 에 활성화되어 있어야 함!]
lock master
total change to zbooking_d // 드래프트 전체 변경 추적
{
  create;
  update;
  delete;

  // 4. [★ 중요: UI 화면에서 입력하지 못하도록 읽기 전용 가드 장착!]
  field ( readonly ) booking_id, created_by;

  // 5. [저장 전 유효성 정원 검사 & 취소 액션 버튼 정의]
  validation validateCapacity on save { field seats, concert_id, perf_no; }
  action ( features : instance ) cancelBooking result [1] $self;

  // 6. [DB 필드 매핑 선고]
  mapping for zbooking
  {
    booking_id = booking_id;
    concert_id = concert_id;
    perf_no = perf_no;
    customer = customer;
    seats = seats;
    status = status;
    created_by = created_by;
  }
}
```

#### 체험/시뮬레이터 설계 (BDEF 동작 배선판)
- **프로세스 플로우**:
  1. 학습자가 [BDEF 설계서 기판] 을 본다.
  2. [draft table zbooking_d] 단자를 꽂는다. 
  3. [ZBOOKING_D 테이블 생성 = OFF] 인 채로 빌드 기어를 돌리자, "Draft table ZBOOKING_D not active in Dictionary! Build Error!" 적색 경보등이 켜진다.
  4. [ZBOOKING_D 테이블 빌드 = ON] 스위치를 올린다. 
  5. 기어가 부드럽게 돌며 초록색 합격등이 켜지는 빌드 피드백을 감상한다.
- **상태 및 데이터**:
  - `readonly 로 잠근 booking_id 에 대해 BDEF 필드 설정을 생략한 상태` -> 런타임 결과: `Security risk: Client-side key manipulation allowed` 하이라이트.
- **피드백**: Draft 임시 저장 기능을 켤 때는 Dictionary 에 상응하는 전용 드래프트 공간 테이블이 상주 활성화되어야 함이 필수 정합성임을 체득한다.

### 실수/주의

- **BDEF behavior definition 을 수정해 두고, 상응하는 구현 클래스인 Behavior Pool (zbp_i_booking) 의 선언부 메서드 인자 목록을 리프레시하여 싱크하지 않고 방치**:
  - 이 실수 시 컴파일러가 "BDEF 에 정의된 validateCapacity handler 가 구현 클래스에 없다" 며 즉각 빌드를 다운 차단한다.
  - **BDEF 수정 시에는 Eclipse ADT 의 Quick Fix (Ctrl+1) 기능을 경유해 구현 클래스 뼈대 싱크를 함께 수호해야 한다.**

### 정리

- RAP CUD 동작 설계는 **`Behavior Definition (BDEF)`** 에 적어 계약한다.
- **`draft table`** 가동 시에는 Dictionary 에 전용 임시 드래프트 테이블 빌드가 의무 선행된다.
- 화면 키 조작 훼손을 막기 위해 핵심 키 필드는 **`readonly`** 배지로 잠근다.

---

## CH36-L05 - Action / Validation / Determination 구현

### 왜 필요한가

BDEF 동작 설계 기판을 갖췄다.
이제 3단계 동작 레이어의 본체이자 진짜 비즈니스가 살아 도는 'Behavior Pool(행동 구현체 클래스)' 내벽의 Z코드 코딩이 문제다.
- " 사용자가 [저장] 을 누르는 순간, 기존 예매 좌석의 총합과 이번에 신청한 좌석 수의 합이 콘서트 회차 정원(`capacity`)을 넘지 않는지 DB 를 찔러 검증(Validation)해야 한다.
만약 정원을 단 1석이라도 초과하면, 즉각 예매 저장을 취소 거부하고 빨간 경고등과 함께 '남은 정원 부족' 경고 메시지를 웹 화면에 띄워 저장을 막고 싶다."
이 핸들러 연산 시, 내부 엔티티를 읽고 쓰는 과정에서 격리성(`IN LOCAL MODE`)을 누락하면, 무한 재귀 권한 락 루프에 걸려 시스템 전체가 기절해 버린다.
또한 에러가 난 상세 정보를 통보 상자(`failed`/`reported`)에 정교하게 담아 쏘아 올리지 않으면 웹 화면에 경고 창이 안 뜨고 저장이 뚫려 버리는 정합성 대참사를 초래한다.

**핸들러 내벽 CRUD 기동 시 IN LOCAL MODE 수식어를 무조건 장착하고, 정원 한도 초과 시 failed 와 reported 통보 상자에 에러 단서를 실어 보냄으로써 저장을 철통 차단하는 기술**이 필요하다. 그것이 **Action / Validation / Determination 의 구현**이다.

### 무엇인가

#### 1. Determination (자동 기본값 지정기 - setDefaults)
- 사용자가 데이터를 입력하는 이벤트가 발생하면 백엔드가 알아서 깨어나 상태 코드(`status = 'N'`)나 사용자 ID (`sy-uname`)를 자동으로 채워주는 자동화 핸들러다. (CH24 의 감사 stamp 의 RAP 모던 버전이다.)

#### 2. Validation (저장 전 정원 검증기 - validateCapacity)
- *저장 트랜잭션을 승인할지 기각할지 결정하는 수문장이다.*
- **저장 단추를 누르는 찰나 격발되며, 정합성 위배 감지 시 failed 상자와 reported 상자에 에러 카드들을 APPEND 하여 엔진에 통보하면, RAP 엔진이 알아서 커밋을 취소 롤백하고 저장을 차단한다.**

#### 3. Action (특수 버튼 동작기 - cancelBooking)
- 일반 Create 나 Update 이외에, 사용자가 화면에서 [예매 취소] 버튼을 쿡 누르면, 예매 상태 값을 'C' (Cancelled) 로 즉시 갱신하고 결과를 리턴해 주는 커스텀 비즈니스 버튼 동작이다.

#### ⚠️ [ RAP 핸들러 내 MODIFY/READ 시 IN LOCAL MODE 의무 명세 ]
- *프로그램 전체를 무한 루프 교착 상태로 몰고 가는 아바 실무의 치명적 장벽 제약이다.*
- **BY DATABASE 가 아닌 RAP 핸들러 안에서 엔티티 데이터를 조회하거나 수정할 때는 반드시 `READ ENTITIES OF ... IN LOCAL MODE` 와 `MODIFY ENTITIES OF ... IN LOCAL MODE` 로 격리 코딩해야 한다.**
- **이유**: **IN LOCAL MODE 를 빼먹고 쌩으로 수정하면, RAP 엔진은 "이 클래스 내벽 메서드가 외부의 쌩뚱맞은 해커 프로그램일지 모른다" 고 판단해, 전사 보안 권한(DCL) 검사와 글로벌 락킹(Lock master)을 2차로 중복 격발시킨다. 이로 인해 내가 내 락에 부딪쳐 무한 재귀 루프에 걸리거나 권한 위배 에러를 뿜으며 처리가 영구 기절 롤백되기 때문이다. 로컬 모드 장착은 의무다.**

### 어떻게 확인하는가

IN LOCAL MODE 와 failed/reported 로 락 교착 없이 정원 한도를 가드하는 핸들러 코드를 검증한다.

```abap
" 1. [예매 취소 버튼 Action 구현]
METHOD cancelBooking.
  " [★ 철칙: 핸들러 내부 수정은 반드시 IN LOCAL MODE 로 락 교착 격리!]
  MODIFY ENTITIES OF zi_booking IN LOCAL MODE
    ENTITY Booking
      UPDATE FIELDS ( status )
      WITH VALUE #( FOR k IN keys ( %tky   = k-%tky 
                                    status = 'C' ) ) " Status 를 C(취소)로 갱신!
    REPORTED DATA(lt_reported)
    FAILED   DATA(lt_failed).

  " 변경된 결과 인스턴스를 result 에 실어 Fiori 화면으로 즉시 송출!
  READ ENTITIES OF zi_booking IN LOCAL MODE
    ENTITY Booking ALL FIELDS WITH CORRESPONDING #( keys )
    RESULT DATA(lt_bookings).

  result = VALUE #( FOR b IN lt_bookings 
                     ( %tky   = b-%tky 
                       %param = b ) ).
ENDMETHOD.
```

```abap
" 2. [저장 전 정원 한도 초과 Validation 구현]
METHOD validateCapacity.
  " 1. [IN LOCAL MODE 로 현재 입력된 예매 정보 읽기]
  READ ENTITIES OF zi_booking IN LOCAL MODE
    ENTITY Booking FIELDS ( concert_id perf_no seats )
    WITH CORRESPONDING #( keys ) RESULT DATA(lt_books).
    
  LOOP AT lt_books INTO DATA(ls_book).
    " 2. [회차 테이블 zperf 에서 정원 capacity 와 기존 예매 합계 조회]
    SELECT SINGLE capacity FROM zperf 
      INTO @DATA(lv_cap) WHERE concert_id = @ls_book-concert_id AND perf_no = @ls_book-perf_no.
      
    " [가정: 계산 결과 잔여 석이 부족해 정원 초과 감지!]
    IF lv_cap < ls_book-seats.
    
      " 3. [★ FAILED 상자에 예매 ID 키를 던져 저장을 강제 취소 기각!]
      APPEND VALUE #( %tky = ls_book-%tky ) TO failed-booking.
      
      " 4. [★ REPORTED 상자에 에러 메시지 텍스트 카드를 담아 화면 송출!]
      APPEND VALUE #(
        %tky = ls_book-%tky
        %msg = new_message( id       = 'ZMSG_BOOK'
                            number   = '002' " "티켓 잔여 석이 부족합니다!"
                            severity = if_abap_behv_message=>severity-error )
      ) TO reported-booking.
      
    ENDIF.
  ENDLOOP.
ENDMETHOD.
```

#### 체험/시뮬레이터 설계 (Action/Validation/Determination)
- **프로세스 플로우**:
  1. 학습자가 [예매 상세 화면] 에서 [좌석 = 80] 을 입력하고 [저장] 을 누른다.
  2. [validateCapacity 수문장] 이 깨어난다. 기존 예매 30석 + 신규 80석 = 110석이 되어 정원 100석을 초과한다.
  3. [FAILED/REPORTED 가드 = OFF] 면, 정원 초과가 무시되어 DB 가 깨진다.
  4. [FAILED/REPORTED 가드 = ON] 을 켜자, FAILED 상자에 C001 예매 키가 담겨 저장이 즉각 롤백 차단되고, 웹 화면 상단에 "티켓 잔여 석이 부족합니다!" 빨간 팝업 창이 촥 번쩍 뜨는 정합성 피드백을 감상한다.
- **상태 및 데이터**:
  - `IN LOCAL MODE 를 빼먹고 핸들러 내부에서 MODIFY 를 때린 상태` -> 런타임 결과: `Lock master conflict. Infinite loop recursion. Process terminated by kernel` 하이라이트.
- **피드백**: RAP 핸들러 내벽의 모든 CRUD 제어는 무조건 `IN LOCAL MODE` 를 동반하고, `failed/reported` 결선을 통해 저장을 통제해야 함을 명심한다.

### 실수/주의

- **validateCapacity 메서드 내에서 FAILED-booking 에 키를 넣어 저장을 막았는데, 정작 세부 에러 텍스트를 담아주는 REPORTED-booking 에 값을 채워주는 것을 누락**:
  - 이 실수 시 웹 화면에서 저장 버튼을 누를 때, 저장은 정상 취소 차단되어 먹통이 되는데, 화면에는 아무런 에러 경고 텍스트 창도 뜨지 않아 사용자가 "화면이 굳었나?" 하고 마우스 클릭을 난사하는 답답 버그를 유발한다.
  - **FAILED 와 REPORTED 는 항상 짝꿍으로 묶어 수호해야 한다.**

### 정리

- **`Determination`** 은 기본값(Sy-uname 등)을 자동으로 기입하며, **`Validation`** 은 저장 전 정합성을 스캔 검증한다.
- 검증 실패 판정 시 **`failed`** (저장 기각)와 **`reported`** (에러 메시지 송출) 상자를 채워 롤백한다.
- 핸들러 내부에서 엔티티를 고칠 때는 무조건 **`IN LOCAL MODE`** 수식어로 락 교착을 원천 회피한다.

---

## CH36-L06 - Service Binding과 Fiori Elements 테스트

### 왜 필요한가

RAP 비즈니스 핸들러 구현까지 완료했다.
이제 4단계 서비스 노출 OData 바인딩을 거쳐, 5단계 최종 Fiori Elements 모바일/웹 UI 미리보기 셋업이 장벽이다.
- " 지금까지 빚은 예매 CDS 소비 뷰(`ZC_Booking`)와 취소 단추(Action) 비즈니스를 웹에 OData 포트로 개방 노출하여 Fiori Elements 화면으로 띄워 테스트하고 싶다."
과거 Dynpro 나 Gateway 시대에는 OData 주소를 뚫은 뒤에도, HTML/CSS/Javascript 나 SAPUI5 웹 소스코드를 개발자가 수천 줄을 손으로 타이핑해 화면 그리드를 렌더링해야 해 버그가 난무하고 개발 기간이 6개월씩 걸렸다.
- "ABAP 백엔드 개발자가 HTML/JS 코드를 단 한 줄도 건드리지 않고, 오직 CDS 메타데이터 UI 주석만을 토대로 완성된 고품격 웹 Fiori 화면을 1초 만에 자동 생성 미리보기(Preview)하는 모던 기술이 필요하다."
그것이 **Service Binding 과 Fiori Elements Preview** 의 격발이다.

### 무엇인가

#### 1. Service Definition (ZUI_Booking - 서비스 정의서)
- 내 ZC_Booking 소비 뷰와 ZI_Concert 등 관련 CDS 뷰들을 한 묶음으로 엮어서, "이 묶음 세트를 웹 서비스로 한 번에 송출하겠다" 고 선언하는 서비스 포트 패키지 파일이다.

#### 2. Service Binding (OData V4 / UI - 서비스 바인딩 통로)
- *웹 브라우저와 SAP 백엔드를 연결하는 진짜 물리 파이프라인 전원이다.*
- 서비스 정의서(`ZUI_Booking`)를 OData V4 UI 전용 통신 프로토콜로 묶어 활성화(Activate)하고 퍼블리시(Publish)함으로써, `/sap/opu/odata4/...` 라는 실제 접속 웹 URL 주소를 최종 발급받는 화면이다.

#### 3. Fiori Elements Preview (코드 0줄 Fiori 자동 주조 미리보기)
- **Service Binding 화면에서 내 ZC_Booking 엔티티에 대고 [Preview] 단추를 누르면, 웹 브라우저가 새 창으로 열리며 OData 메타데이터와 @UI 주석을 해석해, 목록 화면(List Report)과 상세 등록/조회 화면(Object Page)을 100% 완전 자동 생성해 띄워주는 미리보기 테스트 환경이다.**
- **격세지감**: CH16 에서 배우던 Dynpro 화면 그리기(스크린페인터 PBO/PAI 화면 픽셀 배치)와 비교해 보면, 아바 코드로 화면 레이아웃을 한 줄도 안 짰는데도 풀 화면이 뿜어져 나오는 격세지감의 모던 생산성을 증명한다.

### 어떻게 확인하는가

Service Definition 을 엮어 Binding 을 Activate 하고 Preview 화면을 기동하는 시퀀스를 검증한다.

```cds
// 1. [ ZUI_Booking 서비스 정의서 작성 ]
define service ZUI_Booking {
  expose ZC_Booking as Booking; " 예매 소비 뷰 노출!
  expose ZI_Concert as Concert; " 공연 뷰 노출!
  expose ZI_Perf    as Perf;    " 회차 뷰 노출!
}
```

```text
[2단계] Service Binding 퍼블리시 가동 :
   - ZUI_Booking 우클릭 -> New Service Binding 생성!
   - Binding Type : OData V4 - UI (Fiori Elements 최적화 규격!) 선택!
   - [Activate] 기어 돌린 뒤 -> [Publish] 클릭 완료!
   - 상태 : 'Published' 초록불 점등! (웹 주소 개방 완료!)
   
[3단계] Fiori Elements Preview 테스트 집행 :
   - Entity set 리스트 중 'Booking' 선택 -> [Preview] 더블 클릭!
   - 크롬 브라우저가 켜지며 가동!
   - [Go] 버튼을 누르자 ZC_Booking @UI.lineItem 에 적어둔 순서대로 
     '공연 코드, 고객명, 예매 좌석 수' 표 그리드가 코딩 0줄로 완벽 자동 생성 렌더링 성공!
   - 행 클릭 시 상세 Object Page 진입 -> [cancelBooking] 취소 버튼 활성화 확인! (풀스택 안착!)
```

#### 체험/시뮬레이터 설계 (OData Fiori Element 렌더러)
- **프로세스 플로우**:
  1. 학습자가 [Service Binding Published 상태판] 을 본다.
  2. [Preview] 단추를 누른다.
  3. 화면에 [Fiori List Report] 표 그리드가 렌더링되는데, [@UI 주석 누락 = ON] 상태이면 컬럼이 하나도 안 보이고 흰 도화지만 뜬다.
  4. [@UI 주석 매핑 = ON] 스위치를 올린다.
  5. 10번 '공연 코드', 20번 '고객명' 순서대로 표 컬럼이 이쁘게 채워지고, 행을 클릭하자 상세 Object Page 입력창이 촥 슬라이딩 렌더링되는 웹 화면 주조 피드백을 감상한다.
- **상태 및 데이터**:
  - `Service Binding 을 Publish 하지 않고 Preview 를 시도한 상태` -> 런타임 결과: `404 API Gateway Endpoint unreachable. Service not active` 하이라이트.
- **피드백**: OData 서비스 활성화와 메타데이터 UI 주석 매핑이 싱크되어야만 웹 화면이 자동 생성되는 모던 개발의 심장을 체득한다.

### 실수/주의

- **Service Binding 의 Binding Type 을 OData V2 Web Service (Non-UI API 규격) 로 잘못 지정해 빌드**:
  - Fiori Elements 미리보기용 Preview 단추가 비활성화되어 켜지지 않고, 데이터 API 포트로만 동작하여 웹 화면을 자동으로 얻지 못해 헤맨다.
  - **화면용 바인딩은 무조건 `OData V4 - UI` 나 `OData V2 - UI` 규격을 수호해야 한다.**

### 정리

- 소비 뷰 패키지를 OData 서비스로 묶는 파일은 **`Service Definition`** 이다.
- **`Service Binding`** 을 `OData V4 - UI` 로 발행(Publish)하여 실제 웹 주소를 개방한다.
- **`Fiori Elements Preview`** 를 통해 웹/모바일 목록/상세 화면을 코드 0줄로 자동 생성 미리보기 한다.

---

## CH36-L07 - Authorization / Draft / 운영 고려사항

### 왜 필요한가

Fiori Elements 웹 화면 자동 생성까지 이룩했다.
이제 예매 풀스택 앱 배포 전 마지막 단계인 'DCL 행 단위 권한 격리' 와 'Draft 임시 보관 가드', 그리고 아바 아카데미 졸업 총정리를 마주한다.
- " 우리 회사 대구 지점 직원은 대구 콘서트 예매 정보만 조회할 수 있어야 하고, 서울 지점 직원은 서울 공연 예매 정보만 조회할 수 있어야 한다."
이 권한 제어를 하겠다고 아바 Z프로그램 SELECT 문장 뒤에 `WHERE region = ...` 와 같이 권한 분기 하드코딩을 쑤셔 넣기 시작하면, 지점이 늘어날 때마다 소스 코드를 계속 도려내 고쳐야 하는 결합도 헬게이트가 열린다.
소스 수정 없이, 외부 보안 관리자가 주는 권한 설정표에 맞춰 CDS 데이터 조회를 자동으로 격리 가드하는 **DCL (Data Control Language)** 과, **Draft** 초안 기능을 엮어야 한다.

**소비 뷰 ZC_Booking 에 대고 define role DCL 권한 정책을 심어 소스 수정 없이 행 단위 조회를 격리(Data Control)하고, BDEF 에 authorization master 를 명세하여 Action 실행 권한을 잠그며, ATC 와 ABAP Unit 통합 배포 품질 테스트를 거쳐 최종 클라우드 친화적(Clean Core Released API)으로 배포 완료하는 기술**이 필요하다. 그것이 **Authorization / Draft / 운영 고려사항**의 완수다.

### 무엇인가

#### 1. DCL (Data Control Language - 데이터 권한 제어)
- *CDS 뷰의 자동 보안 경비원이다.*
- `WHERE` 조건 하드코딩 없이, 사용자 ID 별로 인가된 영업 권한(Authorization Object)을 DB 단에서 자동으로 읽어 판정하여, **권한이 있는 레코드 행(Row)만 SELECT 결과물로 자동 필터링 격리해 넘겨주는 CDS 전용 행 단위 권한 정의서**다. (트랜잭션 `DCL` 로 CDS 뷰와 1:1 결선 정의한다.)

#### 2. authorization master ( global, instance )
- *BDEF 에 적어주는 동작 권한 스위치다.*
- **단순 데이터 조회를 넘어, [예매 취소] Action 버튼을 누르거나 Create 를 갈길 때, "이 유저가 취소 권한을 보유한 영업 사원인지" 를 판정해 버튼을 비활성화하거나 차단하는 행위 동작 권한 제어기다.**

#### 3. Draft (미저장 임시 초안 보관)
- 사용자가 웹 폼에 값을 치다 브라우저가 꺼지거나 접속이 끊겨도, 임시 테이블(`zbooking_d`) 공간에 작성 중이던 상태가 고스란히 복구되는 모던 웹 보존 기술이다. (BDEF 에 `draft table` 이 선언되어 있으면 managed RAP 이 이송/복구를 99% 자동으로 해 준다.)

#### 4. Capstone 졸업 점검과 Clean Core 배포
- **ATC(성능/보안 Finding 0)** 와 **ABAP Unit( Assert 통과)** 배포 게이트를 통과하고, **Application Log(BAL)** 표준 로깅을 장착했으며, 오직 클라우드 공인 **Clean Core Released API** 만을 경유해 작성된 무결성 캡스톤 앱을 최종 운영계로 이송(`STMS`) 완료하는 것으로 **현업 개발자의 한 바퀴**를 완수하게 된다.

### 어떻게 확인하는가

DCL 권한 룰을 심어 행 조회를 통제하고 캡스톤 프로젝트 배포 품질을 검증하는 흐름을 확인한다.

```cds
// 1. [ ZC_Booking 소비 뷰를 수호할 DCL 데이터 권한 제어 선포 ]
define role ZC_Booking_Auth {
  grant select on ZC_Booking
    where ( concert_id ) = 
      aspect pfcg_auth( ZCONC_AUTH, CONC_ID, ACTVT = '03' ); 
      // [★ 사용자 권한 프로파일 ZCONC_AUTH 의 공연 ID 와 일치하는 행만 SELECT 허용!]
}
```

```text
[2단계] DCL 권한 검문 작동 :
   - 서울 지점 사원 '정훈영' 계정으로 로그인!
   - Fiori Elements Preview 화면 기동 -> [Go] 클릭!
   - ZC_Booking 뷰가 DB 를 조회할 때 DCL 정책이 자동 개입!
   - 정훈영에게 권한이 부여된 '서울 공연(C001)' 데이터 행만 발라내어 화면 렌더링 성공!
   - 권한이 없는 '대구 공연(C002)' 데이터는 SELECT 단계에서 자동 필터 아웃 격리 수호 완료!
```

#### 체험/시뮬레이터 설계 (졸업 점검 운영 퀴즈)
- **프로세스 플로우**:
  1. 학습자가 [최종 완성된 Fiori 예매 앱] 과 [DCL 권한 게이트]를 본다. 
  2. [정훈영 (서울 권한)] 으로 로그인해 조회를 날린다. [서울 예매] 3건만 녹색 등으로 조회된다.
  3. 이때 [DCL 권한 OFF] 상태로 스위칭하면, 대구/부산 모든 지점 기밀 예약 내역이 쏟아져 나와 [보안 경보]가 울린다.
  4. 다시 [DCL ON] 을 켜서 보안을 사수한다.
  5. 최종 관문인 [ATC/Unit Test 배포 게이트]를 통과하자, "Congratulations! CAPSTONE Project Complete!" 팡파르와 함께 이송 기차가 운영 서버 라이브 전산실로 안착하며 졸업 축하 초록불이 사방에 번쩍이는 영광의 피드백을 감상한다.
- **상태 및 데이터**:
  - `DCL 권한 정의 없이 ZC 소비 뷰의 authorizationCheck 옵션을 #CHECK 로 둔 상태` -> 런타임 결과: `DCL role missing. System fallback: access denied for checking entity` 하이라이트.
- **피드백**: 보안 DCL 과 Draft, 그리고 이송 배포 품질(ATC/Unit)이 완수되어야 실무 라이브 환경에서 생존 가능한 정식 애플리케이션이 빚어짐을 각인한다.

### 🎓 완수 소감과 여정의 끝

우리는 01번 챕터의 첫 헬로 월드 `WRITE` 문장부터 출발해, 변수, 조건문, 내부 테이블, DB 쿼리를 거치고, ALV 화면을 빚고, Modern ABAP Object Oriented, CDS, RAP, OData, 그리고 배포 운영 STMS 와 Application Log 에 이르기까지 **실무 ABAP 개발자가 겪는 삶의 한 바퀴**를 단 한 걸음의 누락도 없이 완벽하게 돌파해 냈습니다.
- "배움은 여기서 멈추지 않는다. 
이 튼튼한 뼈대(토대)를 쥐고 있다면, 미래의 어떠한 UI5/Fiori 심화 기술이나 ABAP Cloud 신규 릴리즈 스펙을 마주하더라도 며칠 만에 스스로 뇌에 이식해 조립해 내는 강인한 '진짜 개발자' 로 성장할 수 있다."
0부터 시작해 캡스톤 프로젝트 완주에 이른 당신의 앞날을 열렬히 응원합니다! 🚀

### 정리

- **`DCL`** 은 WHERE 절 하드코딩 없이 로그인 유저의 인가 권한에 맞춰 행(Row) 단위 조회를 자동 필터 격리한다.
- BDEF 의 **`authorization`** 을 통해 Action 버튼 및 Create/Update 행위 권한을 통제한다.
- managed RAP 은 **`draft table`** 을 통해 미저장 데이터 임시 보관/복구를 거의 자동으로 처리한다.
- **`ATC`**, **`ABAP Unit`**, **`Application Log`**, **`Clean Core Released API`** 가 통합 수반되어야 실무 배포 품질이 완수된다.
