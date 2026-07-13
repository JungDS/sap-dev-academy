# CH23_REWRITE - RAP / ABAP Cloud 입문 v1

> 목적: `content/abap/CH23`의 9개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH23 전체 설계

CH23의 한 문장 목표는 "현대 SAP 표준 트랜잭션 프로그래밍 아키텍처인 RAP(RESTful Application Programming Model)의 6대 핵심 계층 구조(Root View, Projection, BDEF, Behavior Pool, Service Definition, Service Binding)를 이해하고, managed 시나리오 동작 선언, EML(Entity Manipulation Language) 연산 및 집합지향 keys 벌크 처리, OData 노출과 Fiori Elements Preview 테스트, Validation(검증)/Determination(자동결정)/Action(액션)의 시점 격리, 그리고 Clean Core와 Released API 중심의 ABAP Cloud 원칙을 정립하여 안전하게 트랜잭션 백엔드 어플리케이션을 구축한다"이다.

IT 비전공자 입문자는 BDEF 에 명시된 Behavior Pool 클래스를 일반 유틸리티 클래스로 오독하여 `NEW` 로 인스턴스화하려다 컴파일 에러를 맞고, validation 이나 action 작성 시 전달되는 `keys` internal table 을 단건 루프 스캔하며 `LOOP AT keys` 내부에 EML `READ/MODIFY ENTITIES` 를 반복 호출하는 성능 폭탄 안티패턴 코드를 짠다.
또한, validation 내벽 안에서 직접 값을 변조하는 EML `MODIFY ENTITIES` 를 태워 트랜잭션 버퍼를 오염시키고, Service Definition DDL 은 활성화했으나 Web Browser OData URL 연결 통로인 Service Binding 활성화(Activate) 단추를 누르지 않아 404/500 에러를 보며 좌절한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **6대 계층 조립**: Root Interface View(데이터 코어) -> Projection View(소비 모델) -> BDEF(동작 계약) -> Behavior Pool(구현부) -> Service Definition(노출 지목) -> Service Binding(OData 프로토콜)의 상호 체결성 명세.
2. **Managed 자동화**: persistent table 매핑, lock master 선언, `create/update/delete` operation을 통해 프레임워크가 DB 저장 처리를 자동 대행하는 managed 시나리오 수립.
3. **Behavior Pool 물리 제약**: `FOR BEHAVIOR OF` 전역 클래스는 백엔드 엔진이 통제하는 `ABSTRACT` 이고 `FINAL` 클래스이므로 **외부 인스턴스 생성(NEW) 및 상속이 100% 영구 차단**됨을 입증.
4. **EML 벌크 가드**: 루프 내 EML 다중 쿼리 격발을 엄금하고, **루프 진입 전 단 1회의 EML READ 벌크 수집 완료 후 루프 내 메모리 판정**을 집행하는 집합 지향 EML 규칙 준수.
5. **Validation 독립성**: validation 은 오직 저장이 무결한지 검사해 `failed/reported` 응답 상자를 리턴할 뿐이며, **데이터를 변조하는 MODIFY EML 이나 직접 SQL UPDATE는 내벽에서 완벽히 격리 금지**됨을 수립.
6. **V/D/A 타임라인 격리**: 검사 가드인 **Validation**, 값 자동 결정을 셋업하는 **Determination**, 사용자 명시 실행 단추 버튼인 **Action**의 기동 시점과 목적을 물리 비교 격리.
7. **Service Binding 활성화**: SDL 정의 활성화와 별개로, OData API 엔드포인트 개설을 위해 Binding 파일의 **Activate** 단추를 반드시 눌러주어야 게이트웨이가 열림을 규명.
8. **Cloud-ready 경계선**: classic ABAP GUI 문법(Dynpro, SALV)과 unreleased API 호출을 차단하고, released API 및 Clean Core 를 수호하는 **Restricted Language Scope** 지침 체득.
9. **종합 실습 - 예매 RAP 완성**: managed BDEF 정의, zbp_i_booking behavior pool handler EML 벌크 작성, Fiori Elements OData Preview 구동까지 종합 캡스톤 완성.

---

## CH23-L01 - RAP 아키텍처 개요

### 왜 필요한가

우리가 앞 챕터에서 열심히 공부한 CDS View Entity 는 데이터베이스 데이터를 멋진 모델로 엮어서 화면에 **"읽기(Read)"** 로 뿌려주는 데는 매우 훌륭한 도구였다.
하지만 업무용 예매 프로그램의 진짜 핵심 비즈니스는 조회에서 끝나지 않는다.
- 사용자가 Fiori 화면에서 예매 데이터를 새롭게 **입력 생성(Create)** 한다.
- 기존 예약 좌석 수량을 **수정(Update)** 한다.
- 마음에 안 드는 티켓을 **취소 삭제(Delete)** 한다.
- 저장 버튼을 누르는 순간, 잔여석 정원이 초과했는지 비즈니스 규칙을 **검증(Validation)** 한다.
그리고 이 모든 CRUD 트랜잭션 처리가 백엔드 메모리 락(Lock)을 쥐고 완수되어, 웹 브라우저나 모바일 앱의 **OData API** 서비스 엔드포인트로 무결하게 배포 제공되어야 한다.
이 모든 CRUD 파이프라인을 클래식 서브루틴이나 개별 펑션 모듈로 사방에 나누어 짜게 되면, 화면 프로그램마다 검증 룰이 다르게 노출되고 락이 꼬여 DB 데이터가 파손되는 대형 참사가 일어난다.

**읽기 모델(CDS) 위에 쓰기, 수정, 삭제, 검증, 그리고 OData 서비스 노출 규격까지 모든 트랜잭션의 생명주기(Life Cycle)를 단 하나의 단단한 비즈니스 객체 상자로 단일 포장해 관리하는 현대 SAP 백엔드 표준 기술**이 필요하다. 그것이 **[[RAP]] (ABAP RESTful Application Programming Model)** 이다.

### 무엇인가

#### 1. RAP (ABAP RESTful Application Programming Model)
- 현대 SAP의 클라우드 사양(Cloud-ready)에 맞춰, 비즈니스 엔티티의 조회부터 트랜잭션 처리(C/U/D), OData 웹 서비스 발행까지 올인원으로 조립해 내는 최신 표준 아키텍처 모델이다.

#### 2. RAP BO 를 완성하는 6대 계층 조립도 명세

```text
[소비처: Web Browser / Fiori Screen]
     │
1. Service Binding (OData 연결선) : OData V2/V4 등 프로토콜 규격을 씌워 API 주소 발급
2. Service Definition (노출 지목판) : 내 뷰들 중 어떤 CDS들을 API 서비스로 개방할지 나열 expose
3. ZC_Booking (소비 Projection)  : 특정 화면에 특화해 필드를 고른 소비 뷰 엔티티
4. BDEF (Behavior Definition)   : 이 객체가 create, update, delete 가 가능한지 동작 계약 선언
5. Behavior Pool (구현 클래스)   : BDEF 에 선언해 둔 validation 이나 action 의 실제 아바 소스 코드
6. ZI_Booking (Root Interface)  : 비즈니스 객체의 뼈대이자 뿌리(Root)가 되는 중심 CDS 뷰
     │
[지속 데이터: zbooking DB Table]
```

#### 3. Managed vs Unmanaged 시나리오 분기
- **managed (관리형)**: 개발자가 직접 DML 쿼리를 구현할 필요 없이, **RAP 프레임워크가 BDEF 선언에 맞춰 버퍼 관리와 DB INSERT/UPDATE 표준 저장을 자동으로 수행해 주는 초고속 모던 시나리오**다.
- **unmanaged (비관리형)**: 기존에 20년간 잘 써오던 레거시 CBO 펑션 모듈이나 특수한 저장 절차 로직이 있어, 표준 DML 저장을 **개발자가 EML 코드로 직접 제어 구현**해 주는 시나리오다.

### 어떻게 확인하는가

각 계층의 정의 소스들이 누락 없이 순서대로 엮였는지 검증한다.

```abap
" Root Interface View (ZI_Booking) 와 transactional projection (ZC_Booking) 이 준비되고,
" 그 위에 BDEF 가 create; update; delete; 로 승인되어 OData 서비스로 노출 도킹된 상태를 확인한다.
```

#### 체험/시뮬레이터 설계 (RAP 계층 조립 보드)
- **프로세스 플로우**:
  1. 학습자가 좌측에 [zbooking 테이블]을 보고, 우측에 빈 [Fiori Elements 목록 UI]를 본다. 둘 사이의 다리가 끊어져 작동 불가 아이콘이 뜬다.
  2. [ZI_Booking Root] 카드를 끼운다. 뼈대 주춧돌이 박힌다.
  3. [BDEF 동작 선언] 칩을 꽂아 create; update; 스위치를 올린다. UI 화면에 [예약 생성] 단추가 스르륵 솟아오른다.
  4. [Service Binding] 어댑터를 도킹하고 [Activate] 전원을 넣자, 광섬유 전류가 6대 계층을 촥 관통하며 Fiori 화면에 콘서트 예매 목록 데이터가 실시간 렌더링되어 표시되고 예약 단추가 기동되는 종합 피드백을 감상한다.
- **상태 및 데이터**:
  - `BDEF 에 delete; 선언을 빼먹은 채 UI에서 행 삭제 단추를 누른 상태` -> 런타임 결과: `Operation DELETE is not enabled in BDEF` 에러 박스 발생.
- **피드백**: RAP 은 단일 파일이 아니라 데이터 뼈대, 동작 선언, 서비스 개방이라는 6대 톱니바퀴 결합도 체계임을 인지시킨다.

### 실수/주의

- **managed 시나리오라고 해서 개발자가 코딩할 분량이 완전히 '0(Zero)' 일 것이라 오해**:
  - managed 는 표준적이고 평범한 DB C/U/D 저장 처리만 프레임워크가 대행해 줄 뿐이다. 
  - **"남은 좌석이 정원을 넘었는지 검사" 하는 비즈니스 정원 검증 validation 이나, "취소 상태를 C 로 변조" 하는 취소 action 같은 핵심 커스텀 업무 룰은 무조건 개발자가 Behavior Pool 클래스 안에 아바 소스로 100% 직접 구현해야 한다.**

### 정리

- **`RAP`** 은 비즈니스 객체의 뼈대, 트랜잭션 동작 계약, API 노출을 규격화한 최신 표준 모델이다.
- **`managed`** 시나리오는 프레임워크가 귀찮은 표준 DB DML 저장을 대행해 준다.
- RAP 의 시동을 위해서는 **Root -> BDEF -> Service Def/Binding** 의 순차 도킹이 필수다.

---

## CH23-L02 - Interface View ZI_* 설계 (Root)

### 왜 필요한가

RAP 로 데이터 모델 뼈대를 빚어 올리기로 했다. 
그런데 여러 테이블 중 도대체 어떤 파일에 대고 트랜잭션 동작 선언을 얹어야 할지 갈림길에 선다.
- 콘서트 예매 앱에는 공연 정보(`zconcert`), 회차 일정(`zperf`), 예매 내역(`zbooking`) 테이블이 복잡하게 얽혀 있다.
- Fiori 화면에서 사용자가 [저장]을 누르고, 취소 단추를 누르고, 수량을 수정하는 그 **'트랜잭션(Transaction)이 발생하는 물리적 한 건의 기준 단위'** 가 모호하다.
공연 정보에 대고 동작을 정의해 버리면, 예약을 생성할 때 엄하게 엉뚱한 공연 가수가 새로 지어지는 끔찍한 논리 파괴가 일어난다.

**이 비즈니스 어플리케이션 안에서 생성되고, 삭제되고, 락(Lock)이 잠겨 잠금 보호를 받아야 하는 가장 핵심적인 단 한 녀석의 주인공 비즈니스 객체를 '뿌리(Root)' 로 똑똑히 명세 지어 수립하는 기술**이 필요하다. 그것이 **Root Interface View** 의 설계이다.

### 무엇인가

#### 1. Root Entity (뿌리 엔티티) 의 정의
- RAP BO 의 중심이자 대들보가 되는 최상위 노드 엔티티다.
- **define root view entity**: 이 CDS 뷰가 일반 단순 뷰가 아니라, **이 RAP 비즈니스 객체를 가리키는 대들보 뿌리(Root)다** 임을 백엔드 엔진에 선언 등록하는 특수 구문이다.

#### 2. Root Key 의 절대적 신뢰성 규칙
- *RAP 락과 세션 추적의 가장 위대한 기초 사양이다.*
- Root 의 key 로 지정된 필드(예: `booking_id`)는 **사용자가 특정 한 건의 내역을 마우스로 더블클릭하거나 수정할 때, 메모리 상에서 그 물리 레코드를 중복 없이 100% 유일하게 포인팅해 낼 수 있는 영구불변의 식별자 값**이어야 한다.
- 중간에 값이 바뀔 수 있는 가변 필드(status 등)는 절대 root key 가 될 수 없다.

### 어떻게 확인하는가

Root view entity를 정의하고 key 지표를 셋업하는 코드를 검증한다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
" define root view entity 문법으로 이 뷰가 Booking 객체의 최상단 루트임을 명세!
define root view entity ZI_Booking
  as select from zbooking
{
  " OData ID 이자 RAP 의 락 인스턴스 식별 중심이 될 절대 키 지정!
  key booking_id,
      concert_id,
      perf_no,
      customer,
      seats,
      status
}
```

#### 체험/시뮬레이터 설계 (Root Entity 판정기)
- **프로세스 플로우**:
  1. 학습자가 좌측에 [ZCONCERT], [ZPERF], [ZBOOKING] 세 장의 설계도 카드를 본다.
  2. [정원 초과 검증], [예매 취소 버튼], [좌석 수 수정] 행동 카드들이 화면 중앙에 나타난다.
  3. [ZCONCERT] 카드에 행동들을 엮어 도킹하려고 하면 빨간 경고가 우며 튕겨 나간다.
  4. [ZBOOKING] 카드를 중앙 슬롯에 꽂고 [define root] 스위치를 올리자, 행동 카드들이 자석처럼 촥 달라붙어 조립되며 "판정 성공! 예매가 트랜잭션의 뿌리(Root)가 맞습니다!" 축하 불빛이 렌더링되는 모습을 감상한다.
- **상태 및 데이터**:
  - `Root 뷰에 key 지정을 완전히 누락한 상태` -> 활성화 컴파일 에러: `Root entity ZI_Booking must have at least one key element` 하이라이트.
- **피드백**: Root Entity 는 행동과 락, 라이프사이클이 도킹되는 트랜잭션의 유일무이한 뿌리 주체여야 함을 각인시킨다.

### 실수/주의

- **동일한 하나의 RAP BO 상자 안에 define root view entity 파일을 여러 개 만들어서 중첩 배치**:
  - **하나의 RAP BO(비즈니스 객체) 안방에는 대들보 뿌리 역할을 수행하는 Root Entity 가 오직 단 1개만 서식해야 한다.**
  - 만약 자식 자식 계보(공연 하위에 회차 일정)를 엮고 싶다면, 자식은 root 가 아닌 일반 `define view entity` 로 빚어내어 root 와 `association to parent` 로 종속 조립해야 안전하다.

### 정리

- **`define root view entity`** 는 RAP 트랜잭션 객체의 대들보 뿌리를 수립한다.
- Root 의 key 필드는 인스턴스를 유일하게 지목하는 **절대 식별력**을 지녀야 한다.
- Root Entity 는 **부모 노드가 존재하지 않는** 최상위 단독 주체다.

---

## CH23-L03 - Projection View ZC_* 설계

### 왜 필요한가

Root Interface View 로 뼈대를 세웠다. 
그런데 이번에는 이 내부 뼈대를 인터넷망 바깥 Fiori 웹 브라우저 화면에 그대로 다이렉트 노출 시 발생할 수 있는 유출이 문제다.
- 내부 시스템 전용 극비 관리자 승인 해시 필드, DB 락 버전 정보 등을 담고 있는 `ZI_Booking` 의 복잡한 내부 칼럼들이 Fiori Elements 웹 메타데이터에 다 노출되어 보안 취약점이 잡힌다.
- Fiori 표준 화면이 백엔드를 바라보고 통신을 구동할 때, **"이 통신은 비즈니스 트랜잭션 연산용 계약(OData Transactional Query)이다"** 라는 서비스 용도를 명확히 규약하지 않아, 프레임워크가 시각 캐싱만 집행하고 저장을 막아버려 통신 거부를 겪는다.

**안전한 내부 코어 데이터 필드는 장막 뒤에 꽁꽁 숨겨두고, 외부 Fiori 웹 인터페이스에 노출할 필드만을 선별 필터링하며, "이것은 트랜잭션 어플리케이션용 소비 규약이다" 고 용도를 명확히 맺어 배포하는 거울 창문 기술**이 필요하다. 그것이 **Projection View (소비 프로젝션 뷰)** 의 설계이다.

### 무엇인가

#### 1. transactional projection
- RAP BO 의 외부 노출 전용 출구 레이어다. 부모가 Root 뷰이므로, 소비 뷰도 무조건 머리맡에 **`define root view entity ZC_Booking`** 으로 루트 위치 위상을 맞춰 조립해야 한다.

#### 2. provider contract transactional_query (트랜잭션 쿼리 계약 명세)
- *RAP 프로젝션 빌드의 핵심 계약 조항이다.*
- **이 프로젝션 CDS 가 읽기 전용 캐시 데이터가 아니라, UI 화면 단에서 '신규 생성, 수정, 삭제 등의 CRUD 트랜잭션' 이 안전하게 가동될 수 있도록 백엔드 엔진과 표준 계약을 맺는 의무 선언문이다.**

### 어떻게 확인하는가

부모 root 를 참조하고 provider contract 를 명세하여 ZC_ 프로젝션 뷰를 개설하는 소스를 검증한다.

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.allowExtensions: true
" 부모인 ZI_ 가 root 이므로 자식인 ZC_ 도 똑같이 root view entity 로 선언!
define root view entity ZC_Booking
  " Fiori Elements 트랜잭션 통신을 보장받는 OData 규격 계약 체결!
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

#### 체험/시뮬레이터 설계 (Transactional Projection 계약 검사기)
- **프로세스 플로우**:
  1. 학습자가 [provider contract transactional_query] 코드를 마우스로 쥔다.
  2. 이를 [ZC_Booking DDL 본문]에 끼워 맞춘다.
  3. [활성화]를 때리자, 뷰 하단에 [OData CRUD 인터페이스 전용 포트]가 지잉하며 활성화되어 빛을 발한다.
  4. 만약 부모가 root 인데 자식 ZC_ 에 root 키워드를 지워버리자, "상속 위상 불일치 에러!" 퓨즈가 끊어지며 포트가 차단되는 모습을 확인한다.
- **상태 및 데이터**:
  - `provider contract 선언을 완전히 누락한 채 활성화를 시도한 상태` -> ADT 컴파일 경보: `Root projection entity requires a provider contract` 하이라이트.
- **피드백**: 프로젝션 뷰는 단순 투사를 넘어, OData 프레임워크와 트랜잭션 연산 계약을 체결하는 공식 거울 창문임을 체득한다.

### 실수/주의

- **기반 ZI_Booking 은 root 로 선언해 두고, 소비 ZC_Booking 은 root 키워드를 빼서 일반 define view entity 로 정의**:
  - **RAP 의 계층 투사 규칙 상, 부모Interface가 Root 이면 자식 Projection 뷰도 반드시 똑같이 `define root` 로 루트 위상을 일치시켜 주어야 트랜잭션 버퍼가 꼬이지 않고 무결하게 상속 활성화된다.**

### 정리

- **`provider contract transactional_query`** 는 Fiori Elements 와의 CRUD 통신을 체결한다.
- 부모와 자식 뷰 간의 **`root`** 위상 꼬리표는 무조건 1:1 일치해야 한다.
- 프로젝션은 **외부 OData 와 소통할 실제 계약 필드만** 골라 노출하는 청결 장막이다.

---

## CH23-L04 - Behavior Definition 기초

### 왜 필요한가

소비 프로젝션 뷰까지 마스터했다. 
그런데 Fiori Elements 화면 단에서 백엔드를 바라보며 "데이터 읽기는 성공했는데, 도대체 이 표에서 예약을 새로 추가해도 되는지, 수정하면 안 되는지, 삭제 단추를 켜도 되는지" 의 **'동작 권한 규정'** 이 전달되지 않는다.
- 데이터베이스 테이블에 아무리 `create; update; delete;` 연산 룰이 숨어 있어도, 이를 외부에 공표하지 않으면 화면의 '예약 생성' 아이콘 단추 자체가 비활성화되어 굳어버린다.
- 사용자가 예매 수정 중에 Key 필드인 예매 번호(`booking_id`)를 쌩으로 타이핑해서 다른 번호로 수정해 버리는 바람에, 엉뚱한 다른 사람의 예약 데이터가 덮어씌워져 파손되는 사고가 난다.

**이 비즈니스 객체가 할 수 있는 CRUD 동작의 권리를 공식 명세서로 선언하고, 수정 시 Key 필드는 읽기 전용으로 안전하게 잠가두며, 저장할 실제 DB 테이블 매핑 조건을 묶어두는 규칙 정의 기술**이 필요하다. 그것이 **Behavior Definition (동작 정의 BDEF)** 이다.

### 무엇인가

#### 1. Behavior Definition (BDL 동작 정의 - BDEF)
- CDS 가 데이터의 뼈대(정적 형상)를 정의한다면, BDEF 는 **"이 객체가 create, update, delete 가 가능한가"** 의 동적 행위 계약을 명세하는 BDL(Behavior Definition Language) 파일이다.

#### 2. field (readonly:update) 키 잠금 장치
- *데이터 파손을 방지하는 가장 훌륭한 키 가드 규칙이다.*
- **예매 정보를 '수정(Update)' 하는 도중에는 사용자가 예매 번호(Key) 필드를 절대로 바꿀 수 없도록 입력 락(Read-only)을 씌워 격리 통제하는 선언이다.**

#### 3. persistent table zbooking (지속 저장소 매핑)
- managed 시나리오에서 이 객체가 빚어낸 최종 CRUD 가공 데이터를 영구 저장할 실제 물리 DB 테이블명을 지정한다.

#### ⚠️ [ create; update; delete; 는 직접 DB DML 쿼리가 아님을 명세]
- *초보 개발자들이 가장 많이 혼동하는 아바 트랜잭션 버퍼와 SQL 의 물리 격리 경계다.*
- **BDEF 에 적힌 `create;` 선언은 "소비자가 화면에서 이 버튼을 눌러 예약을 만들 수 있게 권한을 연다" 는 행위 승인 계약서일 뿐이며, 아바 SQL 의 `INSERT INTO zbooking` 명령어가 직접 작동하는 물리 단계가 아니다.**
- 실제 물리 DML 락 저장 처리는 RAP 버퍼 내부에서 프레임워크가 PBO/PAI 세션 주기를 밟으며 조용히 집행한다.

### 어떻게 확인하는가

managed 시나리오로 BDEF 동작 정의를 기술하고 readonly 및 mapping 조건을 묶는 소스를 검증한다.

```abap
" managed 시나리오 선언 및 구현을 담당할 unique Behavior Pool 클래스명 매핑!
managed implementation in class zbp_i_booking unique;

" ZI_Booking 루트 엔티티의 동작 정의 개시! alias(별칭)는 Booking 지칭
define behavior for ZI_Booking alias Booking
persistent table zbooking " 영구 저장할 실제 DB 테이블 지명!
lock master " managed 락 마스터 권한 장착!
{
  " 1. [CRUD 권한 오픈]
  create;
  update;
  delete;

  " 2. [★ 키 잠금 철칙] 수정(update) 시에는 booking_id 키 필드를 변경 불가 readonly 락!
  field ( readonly:update ) booking_id;

  " 3. [DB 필드 매핑 결합]
  mapping for zbooking
  {
    booking_id = booking_id;
    concert_id = concert_id;
    seats      = seats;
    status     = status;
  }
}
```

#### 체험/시뮬레이터 설계 (BDEF 계약 편집기)
- **프로세스 플로우**:
  1. 학습자가 좌측의 [BDEF 계약서]를 본다. 
  2. [create;] 스위치를 내리고 빌드한다. Fiori 화면 상단의 [예약 생성] 아이콘 단추가 회색으로 비활성화되며 입력창 진입이 가로막힌다.
  3. [create;] 스위치를 다시 올리고, [field (readonly:update) booking_id] 카드를 도킹한다.
  4. 수정 모드 화면에서 다른 필드는 다 수정되는데, `booking_id` 입력 필드만 회색 음영 락이 채워져 마우스 포커스가 안 들러붙는 철저한 키 가드 피드백을 감상한다.
- **상태 및 데이터**:
  - `BDEF 에 지정한 persistent table 명칭을 존재하지 않는 'zfake_table' 로 기입해 활성화한 상태` -> 빌드 컴파일 에러: `Table zfake_table does not exist in Dictionary` 하이라이트.
- **피드백**: BDEF 는 비즈니스 객체가 밖으로 개방할 동작의 허용 한계선과 잠금 규칙을 천명하는 엄격한 계약서임을 깨닫는다.

### 실수/주의

- **booking_id 와 같은 핵심 키 필드를 readonly:update 로 묶지 않고 무방비로 방치**:
  - 이 설정을 빼먹으면 사용자가 화면에서 값을 수정하다가 키 값을 실수로 타이핑해 변조할 수 있고, 이 경우 RAP 버퍼는 기존 레코드가 삭제되고 엉뚱한 신규 레코드가 생성되거나 락이 깨져 데이터 정합성이 붕괴된다.
  - **모든 비즈니스 BDEF 에서 Key 속성 필드는 무조건 수정 시 read-only 락을 걸어야 함을 수호해야 한다.**

### 정리

- **`BDEF`** 는 비즈니스 객체가 개방할 행위의 승인 범위와 저장 규칙을 선언한다.
- 키 필드 오염을 막기 위해 **`field (readonly:update)`** 가드를 의무 지정한다.
- **`mapping for`** 를 통해 CDS 요소 이름과 실제 DB 테이블 필드명을 안전하게 도킹한다.

---

## CH23-L05 - Behavior Implementation 기초

### 왜 필요한가

BDEF 로 동작 허용까지 다 셋팅했다. 
그런데 이제는 validation 이나 action 등의 커스텀 업무 룰을 짤 때, 백엔드 로직 안에서 데이터 조회를 처리하는 코딩에 한계를 마주한다.
- " validation 검증을 수행하기 위해 사용자가 화면에서 입력한 '예약 요청석 데이터' 를 백엔드 램(RAM) 버퍼에서 실시간으로 읽어와야 한다."
기존 클래식 아바에서는 `SELECT` 쿼리로 DB 테이블을 직접 뒤져서 값을 읽었다.
하지만 사용자가 화면에서 입력창에 숫자를 치고 [저장]을 누른 찰나에는, 해당 데이터가 아직 DB 테이블 디스크에 물리적으로 써지기 직전인 **'임시 트랜잭션 버퍼(Transactional Buffer)'** 상에만 따끈따끈하게 머물러 있는 상태다. 
DB 테이블만 셀렉트해 긁어오면, 아직 안 써진 임시 예약 행을 읽지 못해 검증 자체가 불발되고 무력화된다.

**DB 테이블 디스크가 아니라, 아직 커밋되기 전 백엔드 메모리 버퍼 상에 살아있는 따끈한 인스턴스의 변경 상태를 EML(Entity Manipulation Language) 특수 명령어로 통째 집합 조회해 내는 기술**이 필요하다. 그것이 **Behavior Implementation (구현 Behavior Pool)** 과 **EML** 이다.

### 무엇인가

#### 1. Behavior Pool (ABP - Behavior 구현 클래스)
- BDEF 에 정의해 둔 validation, determination, action 의 실제 소스 코드가 적혀 상주하는 특수 클래스 파일이다. global class 는 껍데기일 뿐이며, 실제 핸들링은 **`local handler class`** 가 상속(`INHERITING FROM cl_abap_behavior_handler`)받아 전담 기동한다.

#### 2. EML (Entity Manipulation Language) 의 READ ENTITIES
- **READ ENTITIES OF ZI_Booking IN LOCAL MODE**: DB 테이블에 대고 직접 셀렉트(SELECT)를 찌르는 것이 아니라, **현재 트랜잭션 버퍼 상에 떠도는 임시 예약 인스턴스들의 데이터 필드를 실시간 조준해 고속 벌크 조회**해 내는 RAP 고유의 버퍼 리드 EML 특수 명령어다.

#### ⚠️ [ 루프(LOOP) 내부 EML (READ/MODIFY) 다중 격발 금지 벌크 가드 명세]
- *RAP 성능 튜닝 시 컴파일러가 안 잡아주는 최악의 런타임 성능 폭탄 안티패턴이다.*
- 핸들러 메서드에 주어지는 **`keys` 는 단 한 건이 아니라 화면에서 한 번에 대량으로 밀어 넣은 internal table(집합)** 형태다.
- **오동작**: `LOOP AT keys INTO DATA(ls_key). READ ENTITIES ... WITH VALUE #( ( %key = ls_key-%key ) ) ... ENDLOOP.`
  위와 같이 루프 블록 내부에 EML 명령어를 박아두면, 100건 예약 저장 시 DB 버퍼 통신이 100번 연속 격발되어 시스템 속도가 마비된다.
- **방어선 (Bulk EML)**: 무조건 루프에 들어가기 전, **단 1회의 벌크 `READ ENTITIES` 로 keys 전체 집합을 한 번에 다 읽어와 internal table(`lt_bookings`)에 안착시킨 뒤, 루프 내부에서는 오직 램(RAM) 메모리 루프만 돌며 비즈니스 판정**을 집행해야 성능 병목이 차단된다.

### 어떻게 확인하는가

EML 벌크 조회를 가동해 reported 예외 응답을 기입하는 local handler 소스 구조를 검증한다.

```abap
CLASS lhc_booking DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS validate_capacity FOR VALIDATE ON SAVE
      IMPORTING keys FOR Booking~validate_capacity.
ENDCLASS.

CLASS lhc_booking IMPLEMENTATION.
  METHOD validate_capacity.
    " [★ EML 벌크 조회 철칙] 루프 돌기 전 단 1번 벌크 EML 로 keys 통째 긁어오기!
    READ ENTITIES OF ZI_Booking IN LOCAL MODE
      ENTITY Booking
      FIELDS ( booking_id concert_id perf_no seats )
      WITH CORRESPONDING #( keys ) " keys 전체 목록 매핑 전달!
      RESULT DATA(lt_bookings).

    " EML 로 긁어온 lt_bookings 를 메모리 순회 루프 작동!
    LOOP AT lt_bookings INTO DATA(ls_booking).
      " 비즈니스 판정 시 만석 실패 검출 시!
      IF ls_booking-seats > 10.
        " 실패한 인스턴스 ID 를 failed 응답 상자에 박고!
        APPEND VALUE #( %key = ls_booking-%key ) TO failed-booking.
        
        " 구체적인 오류 메세지를 reported 응답 상자에 얹어 돌려주기!
        APPEND VALUE #( 
          %key = ls_booking-%key 
          %msg = new_message_with_text( severity = if_abap_behv_message=>severity-error 
                                        text     = '예매 좌석 수량이 한도 초과되었습니다.' )
        ) TO reported-booking.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (Behavior Pool 호출 추적기)
- **프로세스 플로우**:
  1. 학습자가 [3개 행 예약 요청] keys 판을 본다.
  2. [루프 내부 EML 모드]를 선택하고 기동한다. EML 로케트가 DB 버퍼로 3번 왔다 갔다 하며 빨간 불이 번쩍이고 런타임 타임아웃 경고 게이지가 차오른다.
  3. [벌크 EML 모드 ON] 스위치를 켠다. EML 로케트가 단 1번만 가서 3개 행 데이터를 컨테이너에 한 번에 싣고 돌아와 루프가 고속으로 완료되는 녹색 통과 비주얼 피드백을 감상한다.
- **상태 및 데이터**:
  - `failed 및 reported 응답 구조체에 실패 정황 기입을 누락한 상태` -> 런타임 결과: `Validation failed but UI shows success with blank screen` 먹통 현상 시각화.
- **피드백**: RAP handler 는 대량 집합 처리 모델이므로, 벌크 EML 가드와 failed/reported 기입 의무가 필수 기둥임을 깨닫는다.

### 실수/주의

- **EML READ ENTITIES 호출 시 IN LOCAL MODE 키워드를 일반 외부 리포트 프로그램에서 무단 복사 사용**:
  - **`IN LOCAL MODE` 는 오직 자기 자신 RAP BO 구현 클래스(Behavior Pool) 내벽에서만 버퍼 보안 검사를 초월해 읽을 수 있도록 허락된 특수 면책 특권 기어다.**
  - 외부 프로그램에서 뷰를 EML 로 읽고 싶을 때는 이 키워드를 제외하고 일반 `READ ENTITIES OF ZI_Booking ...` 문법으로 호출해야 문법 거부를 면한다.

### 정리

- Behavior Pool 의 실제 연산은 **`cl_abap_behavior_handler`** 로컬 클래스가 도행한다.
- 트랜잭션 버퍼를 읽기 위해 EML 명령어인 **`READ ENTITIES OF`** 를 활용한다.
- keys 루프 내부 EML 호출은 절대 엄금하며, **루프 진입 전 1회 벌크 조회**로 선행 조치한다.

---

## CH23-L06 - Service Definition / Service Binding

### 왜 필요한가

Behavior Pool 소스 코딩까지 다 마쳤다. 
그런데 이 훌륭한 백엔드 엔진이 내 컴퓨터 로컬 ADT 에만 갇혀 있고, 웹 브라우저나 외부 시스템 OData 게이트웨이 포트로 뚫려 나가지 못한다.
- Fiori 표준 화면 개발자나 웹 연동 엔지니어가 내 예약 뷰(`ZC_Booking`)에 API 형식으로 접근하고 싶은데, 통신 엔드포인트 URL 주소가 발급되지 않는다.
- 무엇을 내보낼지 CDS 뷰 명칭들만 DDL 소스로 조접하게 적어두고, 정작 어떤 전송 프로토콜(OData V2 인지 OData V4 인지)을 사용해 변환해 포장할지 도킹 연결선을 올리지 않아, 게이트웨이가 작동을 안 한다.

**내가 지은 뷰들 중 바깥 세상에 상품처럼 개방할 녀석들만 딱 골라서 진열대(Service Definition)에 얹고, 이것을 OData V4 UI 통신 규격(Service Binding)에 매핑 도킹하여, 런타임 OData API 주소를 개설하고 Fiori Elements Preview 화면을 기동해 내는 기술**이 필요하다. 그것이 **Service Definition 과 Service Binding** 의 장착이다.

### 무엇인가

#### 1. Service Definition (서비스 정의 SDL)
- 내가 개발한 수십 개 CDS 뷰 엔티티 중, 외부 웹 API 서비스로 노출할 최종 정예 엔티티들만 골라 지목하는 리스트 정의서다.
- **define service**: 서비스를 정의 개시하겠다는 SDL(Service Definition Language) 명령어다.
- **expose ZC_Booking as Booking**: `ZC_Booking` 소비 프로젝션을 서비스상에서 `Booking` 이라는 이쁜 별칭명으로 밖으로 **노출(Expose)** 하겠다는 선언이다.

#### 2. Service Binding (서비스 바인딩)
- 노출 지목된 Service Definition 을 실제 통신 가능한 OData 규격(OData V4 - UI 전용 등) 프로토콜 어댑터와 엮어내는 물리 엔드포인트 도킹 개설기다.
- **Activate**: 바인딩 개설 후, Eclipse 상단의 **활성화(Activate) 단추를 눌러 전원을 넣어주어야만 게이트웨이가 URL 주소를 산출**해 내기 시작한다.

### 어떻게 확인하는가

서비스 정의를 나열하고 서비스 바인딩을 활성화하여 Preview 단추를 여는 흐름을 검증한다.

```abap
" --------------------------------------------------
" ① [ Service Definition DDL - ZUI_Booking ]
" --------------------------------------------------
define service ZUI_Booking {
  " 외부 OData API 진열대에 Booking 이라는 이름으로 expose 개방 노출!
  expose ZC_Booking as Booking;
}
```

```abap
" --------------------------------------------------
" ② [ Service Binding - ZUI_BOOKING_V4 ]
" --------------------------------------------------
" ADT GUI UI 상에서 Binding Type 을 'OData V4 - UI' 로 선택 조립하고,
" Service Definition 을 ZUI_Booking 으로 지정한 뒤,
" 상단 [Activate] 버튼을 눌러 상태를 ACTIVE 로 올림을 검수한다.
" 그 후 Entity Set 'Booking' 을 더블클릭해 [Preview] 가상 피오리 웹화면이 켜지는지 확인한다.
```

#### 체험/시뮬레이터 설계 (Service 노출 점검판)
- **프로세스 플로우**:
  1. 학습자가 [expose ZC_Booking] 코드를 적은 Service Definition 판을 본다.
  2. [Service Binding] 장치로 가니 [INACTIVE] 빨간 등이 들어와 있다. Preview 버튼을 아무리 눌러도 "404 Not Found" 에러만 뜬다.
  3. [Activate] 스위치 레버를 위로 올린다. 지잉 소리와 함께 게이트웨이 포트가 녹색 [ACTIVE] 로 켜지며 고유 OData API URL 주소가 송출된다.
  4. [Preview] 단추를 누르자 웹 브라우저가 열리며 렌더링된 Fiori 표 화면이 촥 시연되는 피드백을 감상한다.
- **상태 및 데이터**:
  - `Service Definition 에 expose 를 ZI_Booking 부모 뷰로 다이렉트 셋업해 올린 상태` -> 컴파일 가이드라인 경보: `Exposing database view directly bypasses projection contract. Projection view ZC_Booking is recommended` 하이라이트.
- **피드백**: OData 개설은 expose 진열과 Binding 활성화(Activate)의 두 단추가 완벽히 켜져야 게이트웨이 엔드포인트 주소가 산출됨을 알게 한다.

### 실수/주의

- **Service Binding 의 활성화(Activate) 단추 클릭 누락**:
  - Service Definition 코드는 열심히 다 짜서 활성화해 두었는데, 정작 Service Binding 파일 에디터를 열고 상단의 **`Activate`** 버튼 전원을 누르지 않아 통신 포트가 계속 차단된 채 `inactive` 상태로 방치되어 404 에러를 보며 삽질하는 경우가 많다.
  - **바인딩 소스는 무조건 최종 Activate 승인 단추까지 눌러 게이트웨이를 해방해야 함을 수호해야 한다.**

### 정리

- **`Service Definition`** 은 어떤 소비 프로젝션 뷰를 외부에 상품처럼 노출할지 지목한다.
- **`Service Binding`** 은 노출 모델을 OData V2/V4 프로토콜 어댑터와 도킹 연결한다.
- 바인딩 파일은 반드시 최종 **`Activate`** 단추를 눌러 포트를 해방해야 Preview 가 켜진다.

---

## CH23-L07 - Validation / Determination / Action 개요

### 왜 필요한가

서비스 바인딩까지 정복했다. 
그런데 BDEF 내부에 비즈니스 알고리즘을 추가할 때, 이 셋이 언제 기동되는지 시점과 목적 구분이 엉망이다.
- " 사용자가 예매 취소 단추를 눌렀을 때, status를 'C' 로 바꾸고 잔여석을 반환하고 싶다."
이 명시적인 취소 업무 처리를 '저장 전 가드(Validation)' 에 욱여넣어 버리면, 저장 버튼을 누를 때마다 예매가 강제로 매번 취소되는 대형 오류가 난다.
반대로, "생성할 때 상태 값을 'N'(New)으로 자동 할당해 주는 기본값 세팅" 을 'Action' 으로 설계해 버리면, 사용자가 화면에서 저장 단추 외에 '기본값 적용' 이라는 뚱딴지같은 버튼을 수동으로 직접 눌러야 비로소 상태가 채워지는 조접한 UI 화면이 유도된다.

**비즈니스 룰의 본질적 목적이 '저장 전 방어(Validation)' 인지, '값 자동 결정(Determination)' 인지, 아니면 '사용자 명시 단추 버튼(Action)' 인지 명확히 구분하여, 백엔드 기동 타임라인 시점에 맞춰 배치하는 설계 기술**이 필요한다. 그것이 **Validation / Determination / Action (V/D/A)** 의 분류 기획이다.

### 무엇인가

#### 🎨 RAP 3대 비즈니스 로직 시점 및 목적 매트릭스 명세

| 종류 | 목적 | 실행 타이틀 및 트리거 시점 | 콘서트 비즈니스 예시 |
| --- | --- | --- | --- |
| **Validation** (검증 가드) | 데이터에 위반이 있으면 저장을 거부하고 차단함 | **`on save`** 시점 (사용자가 저장 버튼을 누르는 순간 1순위 검문) | 잔여석이 정원보다 작거나 같은지 검사해 만석 시 저장 거부 |
| **Determination** (자동 결정) | 필드 값을 백엔드가 알아서 자동 계산해 채워줌 | **`on modify`** 또는 **`on save`** 시점 (값 입력 감지 시 자동 셋업) | 신규 예매 인스턴스가 빚어지는 찰나 `status = 'N'` 기본값 자동 할당 |
| **Action** (명시 액션) | 사용자가 의도를 가지고 명시적으로 기동함 | **`사용자 직접 버튼 클릭`** 또는 API 명시 호출 시점 | 예매 취소 버튼(`action cancel`)을 눌러 상태값을 'C' 로 변경 |

#### 🧭 BDEF 내의 V/D/A 선언 구격 문법
- **`validation validate_capacity on save { field seats; }`**: seats 필드 값 변조 저장 시점(`on save`)에 검증 기동 명세.
- **`determination set_status_new on modify { create; }`**: 인스턴스 신규 생성 감지 시점(`on modify`)에 자동결정 기동 명세.
- **`action cancel result [1] $self;`**: 호출 시 자기 자신 단건 레코드 결과(`result [1] $self`)를 뱉어내며 상태를 바꾸는 버튼 명세.

### 어떻게 확인하는가

BDEF 에 V/D/A 삼총사를 선언하고 각 핸들러 시점을 연결하는 뼈대 코드를 검증한다.

```abap
define behavior for ZI_Booking alias Booking
{
  " 1. [Validation] seats 필드 변조 저장 시 작동할 검증 선언!
  validation validate_capacity on save { field seats; }

  " 2. [Determination] 생성 modify 시 작동할 자동 상태 셋업 선언!
  determination set_status_new on modify { create; }

  " 3. [Action] 사용자가 누를 취소 버튼 cancel 선언! (결과는 자기자신 반환)
  action cancel result [1] $self;
}
```

#### 체험/시뮬레이터 설계 (V/D/A 분류 + 실행 타임라인)
- **Proces스 플로우**:
  1. 학습자가 좌측에 [상황: 예매 수량이 0이하인지 체크] 카드를 본다.
  2. [Validation] 통에 카드를 넣고 [저장 테스트]를 작동시킨다. 사용자가 값을 기입하고 [저장]을 누르는 찰나에 validation 검문 레이저가 가동되어 불법 저장을 탁 차단하는 모션을 확인한다.
  3. 이번에는 [취소 상태 'C' 로 변경] 카드를 [Action] 에 엮자, 가상 UI 화면에 [cancel] 이라는 이쁜 버튼이 촥 피어오르는 비주얼 피드백을 감상한다.
- **상태 및 데이터**:
  - `validation 내부에서 MODIFY ENTITIES 를 때려 다른 값을 변조하려 든 상태` -> 런타임 결과: `Illegal modification inside save sequence validation` 락 덤프 유발 시각화.
- **피드백**: Validation 은 순수한 '검사 가드' 이며, 값 변조는 Determination 이나 Action 의 영역으로 물리 격리해야 정합성이 깨지지 않음을 인지시킨다.

### 실수/주의

- **사용자가 저장할 때 꼭 지켜야 할 무결성 필수 규칙을 Validation 대신 사용자가 직접 눌러야 하는 Action 버튼으로 셋업**:
  - 이따위 설정을 해두면 사용자가 버튼 누르는 것을 깜빡하고 그냥 저장을 때렸을 때, 백엔드 정원 검사 검문소가 bypass 통과되어 DB 에 정원 초과 상태로 예약이 깨져 박히는 대형 장애를 낸다.
  - **저장 전 필수 가드는 무조건 `validation ... on save` 로 선언해 강제 검문망을 깔아야 함을 수호해야 한다.**

### 정리

- **`Validation`** 은 저장 시점(`on save`)에 작동해 올바르지 않은 저장을 격퇴한다.
- **`Determination`** 은 생성/수정 시점(`on modify`)에 기본값을 자동으로 기입한다.
- **`Action`** 은 Fiori 화면의 버튼으로 노출되어 사용자가 명시 실행하는 가공 행위다.

---

## CH23-L08 - ABAP Cloud와 Released API 원칙

### 왜 필요한가

V/D/A 설계까지 마스터했다. 
이제 현대 SAP 클라우드 시대가 요구하는 최첨단 개발 패러다임 장벽을 돌파해야 한다.
- "온프레미스 장비에서 20년 전부터 쓰던 SAP GUI 전용 Dynpro 팝업창 띄우기 코드, 혹은 쌩 Database View 를 직접 뜯어고쳐 칼럼을 마음대로 우회 수정하는 코드들이 클라우드 에디션(S/4HANA Cloud) 업그레이드 때마다 충돌을 내며 전체 SAP 장비를 셧다운시킨다."
표준 코어를 마구잡이로 훼손하고 unreleased(미배포)된 SAP 내부 전용 데이터베이스 기둥을 우회 쿼리로 마음대로 읽어 쓰니, SAP 사가 시스템 업그레이드 패치를 밀어 넣을 때마다 그 테이블 구조가 변조되어 내 CBO 프로그램 전체가 폭사하는 업그레이드 재앙이 유발된다.

**SAP 표준 Core 코드는 단 1줄도 무단 수정하지 않고 깨끗이 유지하되(Clean Core), SAP 사가 '이 객체는 미래 업그레이드 패치 시에도 절대 구조를 변조하지 않고 영구 보장해 주겠다' 고 공표한 Released API 통로만을 활용하여 안전하게 클라우드 친화적인 확장을 빚어내는 개발 원칙**이 필요하다. 그것이 **ABAP Cloud** 의 장착이다.

### 무엇인가

#### 1. Clean Core (깨끗한 표준 코어 수호)
- SAP 의 표준 원본 소스 코드와 표준 테이블 레이아웃을 무단 수정(Modification)하지 않고 순수하게 유지하여, 언제든 다음 주 버전 업그레이드 패치를 즉시 1분 만에 무중단 완료할 수 있게 돕는 클라우드 표준 개발 원칙이다.

#### 2. Released API (배포 승인 API)
- SAP 사가 클라우드 상에서 안전하게 호출해도 좋다고 공식 릴리즈 승인서 마크를 달아 배포한 테이블, 클래스, CDS 뷰 객체들의 모음이다. 
- **제한 범위**: 클라우드 에디션 개발 시에는 오직 이 Released API 만을 쿼리 SELECT list 나 호출 타깃으로 삼아야 빌드가 승인된다.

#### 3. Restricted Language Scope (제한된 언어 범위)
- 클라우드 표준인 **'ABAP for Cloud Development'** 언어 버전에서는, 화면을 그리는 `CALL SCREEN`(Dynpro) 이나 GUI 전용인 `WRITE`, `SUBMIT` , unreleased 펑션 모듈 직접 호출 등 과거의 유산 코드 문법들의 기재가 아예 문법적으로 100% 차단 격리된다.

### 어떻게 확인하는가

Restricted 언어 버전 체크 규칙에 따라 released API 인지를 대조하는 흐름을 검증한다.

```abap
" ADT 상에서 내 클래스의 Properties -> ABAP Language Version 이 
" 'ABAP for Cloud Development' 로 엄격하게 격리 설정되어 있는지 검수하고,
" unreleased 테이블인 'ZSPARE_PARTS' 를 직접 SELECT 칠 때 
" 컴파일러가 'Use of ZSPARE_PARTS is restricted' 문법 에러를 터트리는지 확인한다.
```

#### 체험/시뮬레이터 설계 (Cloud 준비도 판정 카드)
- **프로세스 플로우**:
  1. 학습자가 [BAPI_SALESORDER_CREATE 호출 카드], [I_Currency CDS 뷰 카드], [CALL SCREEN 100 카드]를 본다.
  2. [ABAP Cloud 판정 구역]에 카드를 하나씩 넣어본다.
  3. [I_Currency] 카드를 넣자 "Released API 마크 확인! 통과!" 초록빛이 들어온다.
  4. [CALL SCREEN 100] 카드를 넣자 "오류! Dynpro GUI 문법은 Cloud 버전에서 전면 금지됩니다!" 빨간 검문 레이저가 차단하는 모습을 감상한다.
- **상태 및 데이터**:
  - `unreleased 내부 표준 테이블인 'T000' 을 직접 select 쳐서 빌드한 상태` -> 컴파일 오류: `Table T000 is not released for cloud development` 하이라이트.
- **피드백**: ABAP Cloud 는 단순 개발 서버의 위치가 아니라, Clean Core 와 Released API 만을 수용하는 정교한 클라우드 업그레이드 보장 규칙임을 체득한다.

### 실수/주의

- **released 가 되지 않은 일반 테이블인데 단순히 예전에 온프레미스에서 자주 쓰던 익숙한 이름(`CL_EXITHANDLER` 등)이라는 이유로 클라우드 개발 소스에 직접 호출 기입**:
  - **이름이 익숙하다고 released 인 것이 절대 아니다. 반드시 ADT Properties 에서 API State 중 'Released' 승인이 붙어 있는지 직접 눈으로 수동 대조해야 안전하다.**

### 정리

- **`ABAP Cloud`** 는 업그레이드 안정성(Clean Core)을 수호하는 차세대 개발 모델이다.
- 오직 공식 배포 승인된 **`Released API`** 와 CDS, RAP 프로토콜만 활용해 코딩한다.
- GUI 용 Dynpro, unreleased BAPI, 쌩 테이블 직접 훼손은 문법적으로 전면 차단된다.

---

## CH23-L09 - 실습 — 예매 RAP 동작 구현

### 왜 필요한가

managed BDEF 동작 정의, Behavior Pool local handler EML 집합 처리, OData 서비스 Definition/Binding 개설 활성화, V/D/A 실행 시점 분류, 그리고 Clean Core/Released API 클라우드 수호 원칙까지 RAP 의 모든 6대 톱니바퀴 무기를 완전히 섭렵했다.

이제 이 파편들을 **🎫 하나의 완결된 트랜잭션 시나리오인 '콘서트 예매 RAP 코어 객체'** 로 조립 완성하여 Track-1을 대단원의 막으로 완수할 순간이다.
정원 초과 시 validation EML 벌크 가드로 저장을 안전 차단하고, 취소 action 버튼 클릭 시 상태값을 'C' 로 정교하게 변조 수정하는 **실제 작동하는 RAP OData 웹 서비스**를 구축하여 Fiori Elements Preview 시연을 성공적으로 증명해 내야 한다.

### 무엇인가

#### 🎫 콘서트 예매 managed RAP BO 구현 명세
우리는 아래와 같이 4단계 도킹 절차를 밟아 예매 트랜잭션을 종합 조립 완성한다.

1. **BDEF 동작 계약서 완성**:
   - `managed` 로 지정하고, `persistent table zbooking` 매핑, `lock master` 장착, `create; update; delete;` 를 허용한다.
   - `validation validate_capacity on save { field seats; }` 와 `action cancel result [1] $self;` 를 공식 선언한다.
2. **Behavior Pool local handler 벌크 구현**:
   - `READ ENTITIES OF ZI_Booking IN LOCAL MODE` EML 로 keys 벌크 조회를 1순위 집행해 내부 테이블(`lt_bookings`)을 준비한다.
   - 루프 내부에서 `ZCL_BOOKING_MANAGER=>remaining` 과 seats 를 대조하여 만석일 경우, **`failed-booking`** 과 **`reported-booking`** 오류 박스에 실패 인스턴스 정보와 한글 오류 텍스트를 담아 리턴 반환한다.
3. **cancel action 구현**:
   - EML `READ` 로 인스턴스 정황을 조회한 뒤, status 가 이미 'C' 취소인지 검문하고, 정상 취소 대상이면 `MODIFY ENTITIES OF ZI_Booking IN LOCAL MODE` EML 명령어를 가동해 status 를 'C' 로 변조 수정 처리한다.
4. **Service Binding 활성화 및 Preview 가동**:
   - Service Definition 과 Binding 을 ACTIVE 상태로 완전히 승인 개설한 뒤, Entity Set 'Booking' 에 [Preview] 단추를 기동하여 Fiori 화면 리스트를 띄우고 동작을 수동 검수한다.

### 어떻게 확인하는가

모든 파일 활성화를 완료하고 가상 preview 웹 브라우저 테스트를 개시해 무결성을 검수한다.

1. ADT 상에서 `ZI_Booking` -> `ZC_Booking` -> BDEF -> Behavior Pool -> Service Def/Binding 순으로 6대 계층을 꼬임 없이 싹 활성화(Activate) 완료한다.
2. Service Binding 에디터를 열고 **`ACTIVE`** 녹색 전원 등이 올바르게 켜졌는지 재확인한다. (바인딩 전원 검수).
3. Entity Set 에 [Preview] 를 눌러 Fiori 웹 화면이 켜지면, [Create] 예약 단추를 눌러 남은 좌석보다 과적한 좌석(100석 등)을 강제 저장해 본다. -> 백엔드 validation 이 작동하여 화면 상단에 "예매 좌석 수량이 한도 초과되었습니다" 라는 한글 에러가 붉게 뜨며 저장이 긴급 차단되는지 확인한다. (Validation 검수).
4. 예약 행을 탭하고 [cancel] 단추 버튼을 명시적으로 클릭해 본다. -> 해당 레코드의 status 값이 화면 흔들림 없이 'C' 로 부드럽게 변조 갱신되는지 확인한다. (Action cancel 검수).

```abap
" [ ZBP_I_BOOKING Behavior Pool local handler 구현 소스 골격 검수 ]
CLASS lhc_booking DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS validate_capacity FOR VALIDATE ON SAVE
      IMPORTING keys FOR Booking~validate_capacity.
    METHODS cancel FOR MODIFY
      IMPORTING keys FOR ACTION Booking~cancel RESULT result.
ENDCLASS.

CLASS lhc_booking IMPLEMENTATION.
  METHOD validate_capacity.
    " 1단계: 벌크 EML 로 keys 통째 긁어오기!
    READ ENTITIES OF ZI_Booking IN LOCAL MODE
      ENTITY Booking FIELDS ( booking_id concert_id perf_no seats )
      WITH CORRESPONDING #( keys )
      RESULT DATA(lt_bookings).

    " 2단계: 집합 순회 루프 판정 집행!
    LOOP AT lt_bookings INTO DATA(ls_booking).
      " 잔여석 remaining 비즈니스 룰 결합
      DATA(lo_mgr) = NEW zcl_booking_manager( iv_concert = ls_booking-concert_id 
                                              iv_perf    = ls_booking-perf_no ).
      IF ls_booking-seats > lo_mgr->remaining( ).
        " 실패 인스턴스 reported 기록
        APPEND VALUE #( %key = ls_booking-%key ) TO failed-booking.
        APPEND VALUE #(
          %key = ls_booking-%key
          %msg = new_message_with_text( severity = if_abap_behv_message=>severity-error
                                        text     = '공연 정원을 초과하여 예약 신청이 거절되었습니다.' )
        ) TO reported-booking.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  METHOD cancel.
    " 1단계: keys 로 취소 대상 인스턴스 리드
    READ ENTITIES OF ZI_Booking IN LOCAL MODE
      ENTITY Booking FIELDS ( booking_id status )
      WITH CORRESPONDING #( keys )
      RESULT DATA(lt_bookings).

    " 2단계: modify EML 로 status = 'C' 변조 수정 집행!
    MODIFY ENTITIES OF ZI_Booking IN LOCAL MODE
      ENTITY Booking
        UPDATE FIELDS ( status )
        WITH VALUE #( FOR b IN lt_bookings ( %key = b-%key status = 'C' ) )
      FAILED failed
      REPORTED reported.

    " 3단계: result 파라미터에 취소 완료된 현재 인스턴스 결과 전달 조립!
    READ ENTITIES OF ZI_Booking IN LOCAL MODE
      ENTITY Booking ALL FIELDS
      WITH CORRESPONDING #( keys )
      RESULT DATA(lt_updated).

    result = VALUE #( FOR u IN lt_updated ( %key = u-%key %param = u ) ).
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (예매 RAP 런타임 시뮬레이터)
- **프로세스 플로우**:
  1. 학습자가 좌측 [Fiori Elements 예매 UI 화면]을 본다.
  2. [Create (seats = 999)] 예약 신청 데이터를 기입하고 [Save] 를 누른다.
  3. 백엔드 behavior pool 의 `validate_capacity` 핸들러가 격발되어 `failed` 상자 통과 검문을 치고, reported 에 에러 캡슐을 실어 Fiori 화면으로 되돌려 던진다.
  4. Fiori 화면 상단에 빨간색 느낌표 경고창이 깜빡이며 "정원을 초과하여 신청이 거절되었습니다" 라는 한글 에러 문구가 동적으로 렌더링 출력되는 6대 계층 유기적 통신 애니메이션을 감상한다.
- **상태 및 데이터**:
  - `modify EML update 칠 때 status = 'C' 가 아닌 테이블 직접 UPDATE zbooking set status = 'C' 를 때린 상태` -> 런타임 결과: `RAP buffer inconsistency warning and database lock crash` 사이렌 발생.
- **피드백**: RAP 어플리케이션 구현 시에는 버퍼 무결성을 유지하기 위해 테이블 직접 SQL 수정 DML 을 배제하고, 무조건 EML(`MODIFY ENTITIES`) 통로를 거쳐 수습해야 정석임을 확인한다.

### 실수/주의

- **Behavior Pool 내부 validation 이나 action 구현 소스 안에서 테이블 직접 수정 DML (INSERT, UPDATE, DELETE SQL)을 무단 기입**:
  - **이것은 RAP 버퍼의 save sequence 라이프사이클을 통째로 파괴 우회하는 최악의 DB 불일치(Inconsistency) 안티패턴이다.**
  - behavior pool 내에서 값을 바꿀 때는 무조건 버퍼 무결성이 보장되는 EML 명령어인 **`MODIFY ENTITIES IN LOCAL MODE`** 로 갱신 셋업해야 하며, DB 테이블 직접 쓰기는 이식 및 실행 규칙 상 영구 배제 격리해야 한다.

### 정리

- managed RAP 의 동작은 BDEF 에 선언하고 **`Behavior Pool`** 로컬 클래스에 살을 채운다.
- validation 실패 시에는 **`failed`** 와 **`reported`** 응답 박스에 정황을 정교히 기입한다.
- action 내부에서 상태를 변조할 때는 직접 UPDATE SQL 을 배제하고 **`MODIFY ENTITIES`** EML 을 가동한다.
- Track-1의 최종 OData 서비스 가동은 **Service Binding 의 Active** 전원이 올라갈 때 완수된다.
