# CH26_REWRITE - OO ABAP 고급 설계와 패턴 v1

> 목적: `content/abap/CH26`의 5개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH26 전체 설계

CH26의 한 문장 목표는 "객체 지향 설계를 관통하는 4대 설계 기둥인 팩토리 패턴(Factory: 생성 일원화), 싱글톤 패턴(Singleton: 단일 인스턴스), 전략 패턴(Strategy: 알고리즘 교체 OCP 수호), MVC 기반 리포트 구조화(Model/View/Controller 책임 분리)를 배우고, 외부 의존성(DB/화면)을 분리(의존성 주입: DI)하여 Mock 객체로 격리하며, Fixture(setup/teardown) 규칙과 `FOR TESTING` 구문을 사용한 ABAP Unit 테스트 자동화를 완수한다"이다.

IT 비전공자 입문자는 ABAP Unit 테스트 Fixture 메서드(`setup`, `teardown`) 정의부 끝에 `FOR TESTING` 구문을 멋대로 기입해 컴파일 에러를 맞고, `setup`, `teardown`, `class_setup`, `class_teardown` 이라는 정해진 4가지 고유 철자 대신 `my_setup` 등 임의의 이름을 써서 픽스처 기능이 실행되지 않는 좀비 코드를 방치한다.
또한, Singleton 클래스 정의 시 `CREATE PRIVATE` 옵션을 빠뜨려 외부에서 `NEW` 연산자가 뚫리는 단일성 파괴 버그를 유발하고, 테스트 시 이전 테스트 케이스가 남겨놓은 static 전역 데이터 오염으로 인한 오작동을 유발한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **Factory 생성 일원화**: 코드 곳곳에 난사된 `NEW` 연산자를 단 하나의 팩토리 클래스로 묶어 다형성 인터페이스와 결합하는 정석 생성 가이드 탑재.
2. **Singleton 껍데기 가드**: 외부에서의 직접 `NEW` 인스턴스화를 원천 차단하기 위해 **`CREATE PRIVATE`** 옵션을 의무적으로 박아 단일 통제를 사수하는 규칙 체득.
3. **Strategy OCP 장착**: 확장에는 열려있고 변경에는 닫힌 OCP(Open-Closed Principle) 원칙을 수호하기 위해, 복잡한 사다리 Case 문을 인터페이스 기반 클래스로 갈아끼우는 기법 개설.
4. **MVC 책임 격리**: 비즈니스 SQL 과 계산은 **Model**, 화면 렌더링 ALV 표시는 **View**, 실행 절차와 순서 조율은 **Controller** 로 물리 분할하는 구조화 명세.
5. **의존성 주입 (DI)**: DB SELECT 가 걸린 리포지토리를 인터페이스로 격리하고, 생성자 파라미터(`Constructor`)로 밖에서 꽂아 넣어 결합도를 낮추는 DI 기술 장착.
6. **Fixture 스펠링 철칙**: 테스트 프레임워크가 격리 수거하는 4대 고유 Fixture 메서드 **`setup`**, **`teardown`**, **`class_setup`**, **`class_teardown`** 의 철자 제한 규명.
7. **FOR TESTING 격리**: Fixture 공용 준비 메서드와, 실제 기대값 검증을 집행하는 **`FOR TESTING`** 검증 메서드의 문법적 격리(Fixture 에는 `FOR TESTING` 기재 금지).
8. **Assert 결과 판정**: 단위 테스트 결과의 일치 여부를 판정하는 `cl_abap_unit_assert=>assert_equals` 문법 수동 검증.
9. **종합 실습 - 예매 패턴 완성**: Factory, Strategy, MVC, ABAP Unit 테스트 케이스까지 엮는 종합 캡스톤 예제 완수.

---

## CH26-L01 - Factory Pattern

### 왜 필요한가

우리가 앞선 챕터에서 객체 지향의 꽃인 클래스와 상속, 그리고 인터페이스 다형성을 열심히 배웠다.
그리하여 일반 예매용 클래스(`zcl_booking_manager`)와 VIP 예매용 클래스(`zcl_vip_booking`)를 이쁘게 설계해 두었다.
그런데 실제 현업 프로그램 10군데에서 예약을 생성하는 시나리오가 가동된다고 해 보자.
- 소스 코드 사방군데에 `IF VIP 고객. NEW zcl_vip_booking( ). ELSE. NEW zcl_booking_manager( ).` 와 같이 생성 분기 소스가 흩뿌려진다.
나중에 "새롭게 '얼리버드 예매용 클래스' 가 추가되었다" 면, 사방에 흩어진 10군데의 NEW 인스턴스화 소스 코드를 찾아서 돋보기로 들여다보며 전부 노가다 수동 수정을 감행해야 한다. 한 군데라도 빼먹으면 얼리버드 혜택 누수 버그가 발생한다.

**코드 사방에 `NEW` 연산자를 무분별하게 난사하지 않고, "객체 생성의 권한과 판단" 을 단 한 곳의 전담 공장(Factory)으로 완전히 격리 포장해 일원화하는 기술**이 필요하다. 그것이 **[[Factory Pattern]]** 이다.

### 무엇인가

#### 1. Factory Pattern (팩토리 패턴)
- 구체적인 클래스의 타입을 직접 명시해 인스턴스를 만들지 않고, 생성 전담 클래스(Factory)를 경유해 인터페이스 타입의 객체로 안전하게 리턴 받는 디자인 패턴이다.

#### 2. zcl_booking_factory (팩토리의 실제 예시)
- 생성 책임을 거머쥔 정적 팩토리 클래스다.

```abap
CLASS zcl_booking_factory DEFINITION PUBLIC.
  PUBLIC SECTION.
    " zif_booking 인터페이스 다형성 타입으로 Ro_Obj 반환!
    CLASS-METHODS create
      IMPORTING iv_type          TYPE c
      RETURNING VALUE(ro_obj)    TYPE REF TO zif_booking.
ENDCLASS.

CLASS zcl_booking_factory IMPLEMENTATION.
  METHOD create.
    CASE iv_type.
      WHEN 'V'.    ro_obj = NEW zcl_vip_booking( ).     " VIP 클래스 생성
      WHEN OTHERS. ro_obj = NEW zcl_booking_manager( ). " 일반 클래스 생성
    ENDCASE.
  ENDMETHOD.
ENDCLASS.
```

### 어떻게 확인하는가

호출부 소스에서 직접적인 구체 클래스명 지정을 숨기고, 팩토리를 통해 인터페이스로 수령하는 코드를 검증한다.

```abap
" 호출 프로그램에서는 VIP 예매인지 일반 예매인지 상세 클래스명을 몰라도 됨!
" 오직 팩토리에게 타입 마크만 주면 다형성 인터페이스 zif_booking 으로 수령 완료!
DATA(lo_booking) = zcl_booking_factory=>create( iv_type = 'V' ).
```

#### 체험/시뮬레이터 설계 (Factory 시뮬)
- **프로세스 플로우**:
  1. 학습자가 좌측 [생성 요청 타입 = 'V'] 스위치를 본다.
  2. 중앙 [Factory 상자]에 신호를 전달한다. 상자 기어가 돌아가며 `NEW zcl_vip_booking` 을 가동하고, 우측 [Fiori 예매 인터페이스 포트]에 VIP 리시버가 촥 도킹된다.
  3. 이번에는 신규 타입 'E' (얼리버드) 카드를 Factory 소스에만 1줄 슬쩍 추가한다.
  4. 호출부 코드는 단 1글자도 안 바꿨는데도 우측 포트에 얼리버드 개체 주소가 유연하게 렌더링 연결되는 팩토리 일원화 피드백을 감상한다.
- **상태 및 데이터**:
  - `Factory 내 CASE 문에 Customizing 테이블이나 유효성 검사 없이 잘못된 타입 'X' 가 넘겨진 상태` -> 런타임 결과: `Null reference or unexpected default class initialized` 경고 하이라이트.
- **피드백**: 호출부는 팩토리 뒤에 숨겨진 복잡한 클래스 계보와 결합하지 않아 결합도가 완전히 내려감을 이해한다.

### 실수/주의

- **팩토리 클래스를 만들어두고, 귀찮다고 일부 소스에서 여전히 NEW zcl_vip_booking( ) 을 쌩으로 타이핑해 우회 격발**:
  - 이따위 편법 코딩이 섞이기 시작하면 팩토리의 '생성 일원화 사명' 이 붕괴된다. 나중에 클래스 생성 방식이 변경될 때 그 우회 코드만 누락되어 장애를 유발한다.
  - **클래스 생성은 무조건 팩토리 단일 창구로 통제되어야 함을 수호해야 한다.**

### 정리

- **`Factory`** 는 사방에 흩어진 `NEW` 생성 판단 책임을 단 한 곳으로 모은다.
- 팩토리는 구체 클래스가 아닌 **`인터페이스`** 타입을 리턴하여 다형성을 완성한다.
- 호출부는 팩토리 뒤의 실체 클래스가 누구인지 신경 꺼도 안전하다.

---

## CH26-L02 - Singleton Pattern

### 왜 필요한가

팩토리 패턴으로 생성을 모았다.
그런데 이번에는 시스템 전체에서 단 하나만 공유되어야 하는 '전역 환경 설정(`zcl_config`)' 이나 '데이터 캐시 메모리' 의 상태 분산이 문제다.
- " 프로그램 시작 시 DB 에서 환경 변수 100건을 읽어서 설정 객체 메모리에 올려두었다.
그런데 프로그램 내 A 클래스도 `NEW zcl_config( )`, B 클래스도 `NEW zcl_config( )`, C 리포트도 `NEW zcl_config( )` 를 시도했다."
인스턴스가 3개로 복제 생산되면서, A 가 수정한 설정 값이 B 의 설정 객체에는 반영되지 않아 서로 딴소리를 하고, 매번 DB 를 중복 조회하느라 램(RAM)과 시스템 속도가 폭사한다.

**프로그램 가동 세션 주기 내에서 해당 클래스의 인스턴스를 무조건 '단 1개' 로 영구 보장하고, 어디서든 동일한 징표 메모리 주소를 공유해 소통하도록 강제하는 기술**이 필요하다. 그것이 **[[Singleton Pattern]]** 이다.

### 무엇인가

#### 1. Singleton Pattern (싱글톤 패턴)
- 어플리케이션이 시작되어 끝날 때까지 특정 클래스의 인스턴스를 메모리 상에 오직 단 1개만 생성하여 돌려쓰는 설계 기법이다.

#### 2. CREATE PRIVATE (외부 생성 원천 차단 가드)
- *싱글톤을 완성하는 절대적 첫 번째 물리 방어선이다.*
- **클래스 정의부 머리에 `CREATE PRIVATE` 옵션을 적어두면, 외부 프로그램에서 `NEW zcl_config( )` 명령어를 타이핑할 시 아바 컴파일러가 즉각 컴파일 에러를 터트리며 인스턴스 생성을 영구 차단한다.**

#### 3. get_instance (통합 공유 포트)
- 외부에서 인스턴스를 수령하는 유일한 단독 창구다. 내부 정적 변수(`go_instance`)가 비어 있을 때만 최초 1회 생성(NEW)을 집행하고, 이후로는 이미 만들어진 주소만 계속 넘겨준다.

### 어떻게 확인하는가

CREATE PRIVATE 으로 외부 뉴를 막고 get_instance 로 단일 주소를 공유하는 싱글톤 소스를 검증한다.

```abap
" 1. [외부 생성 차단 CREATE PRIVATE 철칙 지정]
CLASS zcl_config DEFINITION PUBLIC CREATE PRIVATE.
  PUBLIC SECTION.
    " 2. [공유 인스턴스 수령 포트 개설]
    CLASS-METHODS get_instance
      RETURNING VALUE(ro)        TYPE REF TO zcl_config.
  PRIVATE SECTION.
    " 3. [단 1개만 상주할 정적 인스턴스 변수]
    CLASS-DATA go_instance       TYPE REF TO zcl_config.
ENDCLASS.

CLASS zcl_config IMPLEMENTATION.
  METHOD get_instance.
    " 최초 1회 진입 시에만 내 안방에서 조용히 NEW 로 깨우기!
    IF go_instance IS INITIAL.
      go_instance = NEW #( ).
    ENDIF.
    ro = go_instance. " 항상 동일한 메모리 주소 리턴!
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (Singleton 시뮬)
- **프로세스 플로우**:
  1. 학습자가 [User A] 와 [User B] 버튼을 본다.
  2. [NEW zcl_config 난사 모드]에서 둘 다 NEW 를 누른다. 램 보드에 [주소 #10A1] 과 [주소 #99D2] 두 개의 객체가 생성되어 메모리가 낭비되고 설정 값이 어긋나는 것을 본다.
  3. [싱글톤 모드 ON] 스위치를 켠다. 외부 NEW 단추가 빨간 사슬 락(`CREATE PRIVATE`)으로 묶여 잠긴다.
  4. 오직 `get_instance( )` 단추만 활성화되어 A 와 B 가 누를 때마다 똑같은 [주소 #77C3] 징표가 녹색 불로 나란히 반환되는 모습을 확인한다.
- **상태 및 데이터**:
  - `CREATE PRIVATE 을 빼먹어 외부 클래스에서 NEW zcl_config( ) 를 쌩으로 빌드 성공한 상태` -> 런타임 결과: `Multiple configuration objects instantiated. Singleton Broken` 적색 경보 발생.
- **피드백**: 싱글톤은 get_instance 포트 제공뿐만 아니라, `CREATE PRIVATE` 외부 생성 가드가 함께 결합되어야 완성되는 철칙임을 체득한다.

### 실수/주의

- **테스트 격리(Test Isolation) 시나리오에서 정적 Singleton 인스턴스 초기화 누락**:
  - 단위 테스트를 여러 개 돌릴 때, 1번 테스트 케이스가 싱글톤 내부 정적 설정 값을 훼손해 두면, 2번 테스트 케이스가 싱글톤을 부를 때 앞선 오염 상태가 그대로 전달되어 테스트가 깨진다.
  - **테스트 환경에서는 매 테스트 격발 전 싱글톤 인스턴스(`go_instance`)를 말끔히 청소(Clear)하는 백도어 초기화 메서드를 제공해야 정합성이 산다.**

### 정리

- **`Singleton`** 은 인스턴스를 시스템 내에 단 하나로 고정 보장한다.
- 외부 무단 생성을 가로막기 위해 클래스 헤더에 **`CREATE PRIVATE`** 을 의무 기입한다.
- 어디서나 **`get_instance`** 메서드를 통해 유일한 주소를 공유한다.

---

## CH26-L03 - Strategy Pattern

### 왜 필요한가

싱글톤 패턴으로 공유 환경까지 구축했다.
그런데 이번에는 콘서트 요금 계산 정책 분기가 복잡해지며 유지보수 장벽에 직면한다.
- "일반 예약, VIP 예약, 조기 예약, 단체 예약 등 조건에 따라 티켓 요금을 계산하는 소스를 짰다."
기존 방식으로는 `CASE 요금구분. WHEN VIP. 요금 = 100. WHEN 얼리버드. 요금 = 70. WHEN 단체. 요금 = 50. ENDCASE.` 와 같이 길고 지루한 분기 사다리 문장을 짰다.
여기에 "군인/경찰 할인 요금 정책이 추가되었다" 면, 기존에 수개월 동안 아무 에러 없이 잘 돌아가던 핵심 요금 계산 소스 코드를 칼로 도려내어 Case 분기를 비집고 삽입해야 한다.
이 과정에서 오타나 괄호 누락 실수 하나로 기존에 멀쩡하던 VIP 요금 계산식까지 오염되어 컴파일 에러를 내뿜고 시스템 전체가 뻗어버리는 대참사를 유발한다.

**기존의 잘 돌아가는 핵심 소스 코드는 단 1자도 손대지 않고(Open-Closed Principle), 새로 추가되는 요금 알고리즘들을 독립적인 클래스 파일로 똑 떼어내어 겉껍데기에 장난감 칩처럼 유연하게 갈아끼우는 기술**이 필요하다. 그것이 **Strategy Pattern (전략 패턴)** 이다.

### 무엇인가

#### 1. Strategy Pattern (전략 패턴)
- 동일한 목적을 지닌 알고리즘 집합(요금 계산 등)을 각각 인터페이스의 하위 독립 클래스로 캡슐화하여, 상황에 따라 실행 코드를 부드럽게 스왑(Swap) 교체해 내는 디자인 패턴이다.

#### 2. OCP (Open-Closed Principle - 개방-폐쇄 원칙)
- *객체 지향의 가장 위대한 아키텍처 원리 중 하나다.*
- **기존 코드는 확장에 대해서는 열려 있어야 하고(Open), 수정에 대해서는 꽁꽁 닫혀 있어야 한다(Closed)는 원칙이다.** 즉, 새 기능이 추가될 때 기존 소스 파일을 도려내는 것이 아니라 새 클래스 파일을 '추가' 함으로써 완수해야 안전하다.

### 어떻게 확인하는가

전략 인터페이스를 정의하고, 호출부는 인터페이스의 메서드 1줄 호출로 유지하는 구성을 검증한다.

```abap
" 1. [요금 전략 인터페이스 개설]
INTERFACE zif_price_strategy.
  METHODS calc
    IMPORTING iv_seats           TYPE i
    RETURNING VALUE(rv_price)    TYPE p.
ENDINTERFACE.
```

```abap
" 2. [호출부: 구체적인 계산 로직을 몰라도 됨. 주입받은 전략 칩에 calc 만 격발!]
CLASS zcl_checkout DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING io_strategy TYPE REF TO zif_price_strategy.
    METHODS pay.
  PRIVATE SECTION.
    DATA mo_strategy TYPE REF TO zif_price_strategy.
ENDCLASS.

CLASS zcl_checkout IMPLEMENTATION.
  METHOD constructor.
    mo_strategy = io_strategy. " 외부에서 전략 칩을 주입받아 적재!
  ENDMETHOD.
  METHOD pay.
    " 호출부는 단 1줄! 전략의 실체가 VIP 인지 얼리버드 인지 관심 없음!
    DATA(lv_total) = mo_strategy->calc( iv_seats = 2 ).
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (Strategy 시뮬)
- **프로세스 플로우**:
  1. 학습자가 [VIP요금 전략 칩], [단체요금 전략 칩] 두 카드를 본다.
  2. [checkout 본체 기기]에 [VIP요금 칩]을 마우스로 드래그해 슬롯에 꽂는다. 계산을 누르자 100달러가 출력된다.
  3. 칩을 빼고 [단체요금 칩]으로 갈아 끼운다. 본체 소스는 전혀 변하지 않았는데 결과가 즉각 50달러로 교체 연산되는 모습을 확인한다.
  4. 신규 요금 칩을 슬롯 옆에 추가하고 꽂아보며 OCP 원칙의 짜릿한 피드백을 감상한다.
- **상태 및 데이터**:
  - `전략 클래스 내부에서 또다시 IF 문으로 VIP/일반 가격 분기를 쪼개 둔 상태` -> 런타임 결과: `Nested strategy conflict. Anti-pattern warning` 사이렌 작동.
- **피드백**: 한 전략 클래스는 오직 단 하나의 단일 알고리즘만 담백하게 구현해야 전략 패턴의 격리 가치가 산다.

### 실수/주의

- **새 정책 클래스를 만들고, 전략 칩을 갈아끼우는 결정을 호출부(checkout)가 Case 문으로 직접 판정**:
  - `IF VIP. mo_strategy = NEW zcl_vip_strategy( ).` 
  - 이렇게 짜두면 전략 칩만 분리했지, 결국 checkout 본체 소스가 모든 클래스 계보를 다 알고 있어 OCP 원칙이 여전히 붕괴된다.
  - **전략 칩을 결정하고 조립해 주는 생성 책임은 무조건 Factory 나 환경 설정 DB 에 몰아두고, 실행 본체는 주입받아 격발하는 일만 해야 무결하다.**

### 정리

- **`Strategy`** 는 다채로운 비즈니스 알고리즘을 독립 클래스로 캡슐화한다.
- 새 정책 추가는 기존 파일 수정이 아닌 **`새 클래스 추가 (OCP)`** 로 완수한다.
- 전략의 선택은 **Factory** 에게, 실행은 **인터페이스** 다형성에 맡겨 수호한다.

---

## CH26-L04 - MVC 기반 Report 구조화

### 왜 필요한가

Strategy 패턴까지 마스터했다.
그런데 이번에는 하나의 리포트 프로그램 안에 SQL 쿼리, 화면 ALV 레이아웃, 클릭 이벤트 제어, 에러 메시지 팝업이 한 파이프라인에 뒤엉켜 썩어 들어가는 대형 리포트 스파게티 소스에 한계를 느낀다.
- " 사용자가 Fiori 화면 목록 뷰에서 특정 칼럼 명칭을 ALV 로 살짝 수정해 달라고 요청했다.
소스 코드를 찾아가 화면 ALV 셋업 라인을 만졌는데, 쌩뚱맞게 그 밑단에 결합되어 있던 SQL JOIN 구문과 잔여석 계산 로직 필드 꼬임이 격발하여 시스템 전체 컴파일 에러를 뿜고 예매 저장이 거부된다."
화면을 바꾸려는데 로직이 터지고, 로직을 바꾸려는데 데이터 조회가 먹통이 된다.

**어플리케이션의 관심사를 데이터 조회·업무 계산(Model), 화면 렌더링 표시(View), 그리고 이 둘의 순서 절차를 조율하는 지휘관(Controller)의 3가지 계층으로 명확히 칼로 자르듯 분할 격리하는 기술**이 필요하다. 그것이 **MVC 기반 Report 구조화** 이다.

### 무엇인가

#### 1. MVC (Model-View-Controller) 아키텍처 명세
- **Model (모델)**: *화면이나 이벤트를 절대 모르는 순수한 코어 데이터/로직 영역이다.* DB `SELECT` 쿼리, 잔여석 계산, 할인율 산정 등 날것의 비즈니스 연산만 완수해 결과 테이블을 리턴한다.
- **View (뷰)**: *데이터의 조회 처리를 절대 모르는 순수한 시각 렌더링 영역이다.* 전달받은 테이블을 ALV grid 로 화면에 뿌리거나, 에러 색상을 입히는 등 시각화만 담당한다.
- **Controller (컨트롤러)**: *스스로 계산하거나 화면을 그리지 않고 오직 절차 지휘만 맡는다.* 사용자의 입력 조건을 접수하여 Model 을 깨워 데이터를 타오고, 그 결과를 View 에 전달해 화면을 그리라고 지시한다.

#### 🎨 MVC 계층 간 분리 정합성 체크 기준

| 변경 요구 | 바뀌어야 하는 물리적 클래스 | 절대 소스 코드가 바뀌면 안 되는 영역 (오염 격리선) |
| --- | --- | --- |
| ALV 표 형태를 list 출력형으로 전면 교체 | **`View`** 클래스만 수정 | Model 의 SQL 쿼리나 계산식은 **단 1줄도 수정 없음** |
| 잔여석을 계산하는 세부 업무 식 수정 | **`Model`** 클래스만 수정 | View 의 ALV display 코드나 색상 셋업은 **단 1줄도 수정 없음** |
| 버튼 클릭 이벤트 시 재조회 작동 조율 | **`Controller`** 클래스만 수정 | Model 의 DB 쿼리나 View 의 렌더링은 **단 1줄도 수정 없음** |

### 어떻게 확인하는가

조회/계산은 Model 에, 표시는 View 에 격리하고 Controller 가 이식 연동하는 코드를 검증한다.

```abap
REPORT zch26_l04_mvc.

" 1. [Model - 순수 계산/DB조회 전담]
CLASS zcl_booking_model DEFINITION.
  PUBLIC SECTION.
    METHODS get_bookings RETURNING VALUE(rt) TYPE ztt_booking.
ENDCLASS.
CLASS zcl_booking_model IMPLEMENTATION.
  METHOD get_bookings.
    " 오직 순수한 DB 조회 연산만 수행! ALV fieldcatalog 나 메시지 기입 절대 엄금!
    SELECT * FROM zbooking INTO TABLE @rt.
  ENDMETHOD.
ENDCLASS.

" 2. [View - 순수 화면 렌더링 전담]
CLASS zcl_booking_view DEFINITION.
  PUBLIC SECTION.
    METHODS display IMPORTING it_data TYPE ztt_booking.
ENDCLASS.
CLASS zcl_booking_view IMPLEMENTATION.
  METHOD display.
    " 오직 넘겨받은 데이터로 ALV 화면을 렌더링하는 시각 작업만 전담! SELECT 금지!
    cl_salv_table=>factory( IMPORTING r_salv_table = DATA(lo_salv) 
                            CHANGING  t_table      = it_data ).
    lo_salv->display( ).
  ENDMETHOD.
ENDCLASS.
```

```abap
" 3. [Controller - 실행 순서 절차 조율 지휘관]
CLASS zcl_booking_controller DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS zcl_booking_controller IMPLEMENTATION.
  METHOD run.
    " 1) 모델 호출해 데이터 타오기
    DATA(lo_model) = NEW zcl_booking_model( ).
    DATA(lt_data) = lo_model->get_bookings( ).
    
    " 2) 뷰 호출해 화면 그리라고 명령
    DATA(lo_view) = NEW zcl_booking_view( ).
    lo_view->display( it_data = lt_data ).
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (MVC 영향 범위 시각화)
- **프로세스 플로우**:
  1. 학습자가 [Model], [View], [Controller] 세 영역으로 칼 분할된 소스 보드를 본다.
  2. [View 내부의 display 함수 안에 SELECT SQL 카드를 강제 삽입] 해 본다. View 주변에 빨간 경보 정합성 경고가 오며 결합도 게이지가 폭발한다.
  3. 카드를 다시 빼서 Model 로 돌려보낸다. 
  4. 이번에는 [View 표 형태를 PDF 출력으로 교체] 단추를 누르자, 오직 View 클래스 카드만 노랗게 번쩍이며 수정 완료되고 Model 과 Controller 카드는 완벽히 초록색으로 불변 유지되는 격리 피드백을 감상한다.
- **상태 및 데이터**:
  - `Model 클래스 본문 내벽 안에 WRITE 구문이나 ALV display( ) 호출을 때려 넣은 상태` -> 코드 리뷰 컴파일 경보: `Model must not contain presentation logic (WRITE/ALV)` 하이라이트.
- **피드백**: MVC 는 단순한 클래스 조각내기가 아니라, 한 계층의 변경 충돌파가 타 계층으로 전염되지 않게 차단벽을 까는 정교한 관심사 격리 작업임을 확인한다.

### 실수/주의

- **30줄짜리 단순 1회성 Report 프로그램을 짜는데 MVC 디자인 패턴을 억지로 쑤셔 넣어 분할**:
  - 오늘 한 번 돌리고 버릴 단순 조회 쿼리 리포트에 굳이 클래스 3개를 쪼개고 결합하면, 구조화가 아니라 무거운 주술 의식(Ritual)이 되어 유지보수 속도만 느려지게 만든다.
  - **MVC 분리는 "향후 데이터 계산식이 자주 변경될 것으로 예상되는가", "자동 테스트 코드를 작성해야 하는가", "화면 요구가 다변화되는가" 에 해당하는 중대형 프로젝트에 절제해 도입해야 한다.**

### 정리

- **`Model`** 은 화면을 모른 채 데이터 연산만 하고, **`View`** 는 DB 를 모른 채 렌더링만 전담한다.
- **`Controller`** 는 비즈니스 연산과 시각 렌더링의 순서 흐름만 정교하게 매칭 지휘한다.
- Model 에 화면 출력 코드가 들어가거나, View 에 SELECT 가 박히면 분리가 무력화된다.

---

## CH26-L05 - Testable Class 설계와 ABAP Unit

### 왜 필요한가

MVC 리포트 구조화까지 마쳤다.
이제 객체 지향 고급 설계의 최종 종착역인 '자동화 단위 테스트(Unit Test)' 환경을 마주한다.
" 잔여석 계산 로직(`seats_total - seats_used`)이 100% 무결하게 도는지를 매번 프로그램 켜서 수동 클릭하지 않고 컴퓨터가 자동으로 1초 만에 검증(ABAP Unit)하게 만들고 싶다.
그런데 계산 메서드 내벽 안에 직접 `SELECT SINGLE ... FROM zbooking WHERE ...` 이라는 DB 테이블 쿼리가 한 몸으로 묶여 박혀 있다."
이 계산을 테스트하려면, 실제 DB 테이블에 특정 예약번호 레코드가 데이터 디스크 상에 정확히 심어져 들어앉아 있어야만 기동된다. 
다른 직원이 DB 데이터를 지워버리거나 튜닝하는 순간, 내 계산 소스는 멀쩡한데 테스트가 빨간 불을 뿜으며 실패 폭사한다.

**실제 DB 테이블 디스크나 화면 UI 처리를 다이렉트로 바라보지 않도록 결합선을 싹둑 잘라내어 의존성을 밖에서 주입(Dependency Injection)받고, 테스트 시에만 가짜 데이터 상자(Mock)를 꽂아 넣어 순수 알고리즘만 0.001초 만에 컴퓨터가 자동 검증해 내는 자동화 테스트 기술**이 필요하다. 그것이 **Testable Class (테스트 가능한 설계)와 ABAP Unit** 의 체결이다.

### 무엇인가

#### 1. Testable Class (테스트 가능한 클래스)
- 비즈니스 연산 로직과 외부 의존성(데이터베이스, 화면 출력, 파일 IO, 외부 네트워크 등)이 완전히 분리되어, 외부 환경이 끊기더라도 내 알고리즘 단독으로 독립 테스트를 가동해 낼 수 있는 강건한 클래스다.

#### 2. Dependency Injection (의존성 주입 - DI)
- *결합도를 낮추는 클래스 조립의 꽃이다.*
- 클래스 내벽 안에서 직접 `NEW zcl_repository( )` 로 DB 접근 자식을 조립해 버리지 않고, 생성자 파라미터(`io_repo`)를 통해 **필요한 부품을 외부 밖에서 꽂아 넣어 주도록 통로만 뚫어주는 기법**이다.

#### 3. Mock (테스트 더블 / 가짜 리포지토리)
- 테스트 실행 시, 진짜 DB 테이블을 찌르는 리포지토리 클래스 대신 **"DB 조회 없이 메모리에 가상의 가짜 데이터 행만 즉석에서 얹어 넘겨주는 테스트 전용 가짜 클래스"** 다.

#### 4. ABAP Unit 의 Fixture (테스트 픽스처 4대 고유 명칭 규칙)
- *ABAP unit 이 격리 기동할 때 전후에 자동으로 가동되는 픽스처 메서드 명세다.*
- **반드시 아래 4가지 고유 철자 스펠링을 100% 일치시켜 소문자/대문자 선언해야만 백엔드 테스트 엔진이 자동으로 인지하여 격리 실행해 준다. (임의의 이름을 지으면 작동하지 않는다.)**
  1. **`setup`**: 각 개별 테스트 메서드 **기동 직전**마다 매번 호출되어 상태를 초기화한다.
  2. **`teardown`**: 각 개별 테스트 메서드 **완료 직후**마다 매번 호출되어 리소스를 청소한다.
  3. **`class_setup`**: 전체 테스트 클래스가 최초 시작할 때 **정적으로 단 1번만** 선언 기동된다.
  4. **`class_teardown`**: 전체 테스트 클래스가 최종 종료될 때 **정적으로 단 1번만** 청소를 기동한다.
- **Fixture 주의**: 이 Fixture 메서드들은 내부 상태 세팅용이지 검증 단위 테스트가 아니므로, **메서드 정의 뒤에 `FOR TESTING` 구문을 절대 덧붙여선 안 된다.**

#### 5. cl_abap_unit_assert=>assert_equals
- ABAP Unit 에서 실제 계산 값(`act`)과 비즈니스 기대 값(`exp`)을 대조하여 어긋나면 즉각 빨간 불을 송출해 주는 표준 판정 메서드다.

### 어떻게 확인하는가

의존성을 주입받아 Mock 칩으로 단위 테스트를 자동 수행하는 ltcl_ 테스트 클래스 소스를 검증한다.

```abap
" --------------------------------------------------
" ① [ DB 리포지토리 인터페이스 정의 ]
" --------------------------------------------------
INTERFACE zif_booking_repo.
  METHODS get_booking IMPORTING id TYPE c RETURNING VALUE(rs) TYPE zbooking.
ENDINTERFACE.

" --------------------------------------------------
" ② [ 테스트 대상 업무 클래스 - 생성자 의존성 주입 DI 철칙 장착 ]
" --------------------------------------------------
CLASS zcl_booking_manager DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS constructor IMPORTING io_repo TYPE REF TO zif_booking_repo.
    METHODS remaining   IMPORTING id TYPE c RETURNING VALUE(rv) TYPE i.
  PRIVATE SECTION.
    DATA mo_repo TYPE REF TO zif_booking_repo.
ENDCLASS.
CLASS zcl_booking_manager IMPLEMENTATION.
  METHOD constructor.
    mo_repo = io_repo. " 외부에서 꽂아 넣어 주는 부품 수령! (직접 NEW 하지 않음)
  ENDMETHOD.
  METHOD remaining.
    DATA(ls) = mo_repo->get_booking( id = id ).
    rv = ls-seats_total - ls-seats_used. " 순수한 계산에 집중!
  ENDMETHOD.
ENDCLASS.
```

```abap
" --------------------------------------------------
" ③ [ 테스트 전용 가짜 DB Mock 클래스 정의 ]
" --------------------------------------------------
CLASS ltd_booking_repo DEFINITION FOR TESTING. " FOR TESTING 마크 필수!
  PUBLIC SECTION.
    INTERFACES zif_booking_repo.
ENDCLASS.
CLASS ltd_booking_repo IMPLEMENTATION.
  METHOD zif_booking_repo~get_booking.
    " DB 를 조회하지 않고, 무조건 가짜 100석과 60석 예약 상태만 뿜어주는 가짜 칩!
    rs-seats_total = 100.
    rs-seats_used  = 60.
  ENDMETHOD.
ENDCLASS.

" --------------------------------------------------
" ④ [ ★ ABAP Unit 테스트 자동화 클래스 선언 ]
" --------------------------------------------------
CLASS ltcl_booking_manager DEFINITION FOR TESTING
  RISK LEVEL HARMLESS DURATION SHORT. " 무해하고 짧은 단위 테스트임을 명세!
  PRIVATE SECTION.
    " 1. [Fixture 정의: FOR TESTING 붙이지 않음!]
    METHODS setup. 
    " 2. [검증 메서드 정의: FOR TESTING 장착!]
    METHODS remaining_calc FOR TESTING. 
    
    DATA mo_manager TYPE REF TO zcl_booking_manager.
ENDCLASS.

CLASS ltcl_booking_manager IMPLEMENTATION.
  METHOD setup.
    " 매 테스트 시작 전, 가짜 Mock 리포지토리를 꽂아 매니저 조립 준비!
    mo_manager = NEW zcl_booking_manager( io_repo = NEW ltd_booking_repo( ) ).
  ENDMETHOD.

  METHOD remaining_calc.
    " 1) 실제 기동 (Mock 에 의해 100 - 60 연산 가동)
    DATA(lv_rem) = mo_manager->remaining( id = 'B001' ).
    
    " 2) 기대값 40과 실제값 lv_rem 이 일치하는지 컴퓨터가 자동 assertion 대조!
    cl_abap_unit_assert=>assert_equals(
      act = lv_rem
      exp = 40
    ).
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (ABAP Unit 러너)
- **프로세스 플로우**:
  1. 학습자가 [zcl_booking_manager 소스 코드]와 우측의 [ABAP Unit 자동 러너 기계]를 본다.
  2. [Run Test] 를 클릭하자, 0.001초 만에 ✓ 초록색 합격 등이 켜진다. DB 를 단 1밀리초도 안 건드렸음을 본다.
  3. 학습자가 일부러 remaining 계산식을 `seats_total + seats_used` 로 훼손 꼬아놓고 다시 [Run Test] 를 지른다.
  4. 빨간색 경고등이 요란하게 울리며 "Assertion Failed! Expected 40 but Actual 160" 오류가 모니터링되어 버그가 즉시 검출되는 시각 피드백을 감상한다.
- **상태 및 데이터**:
  - `setup Fixture 메서드 뒤에 FOR TESTING 문법을 강제 기입해 둔 상태` -> ADT 컴파일 에러: `Fixture method setup cannot be declared as a test method` 하이라이트.
- **피드백**: 단위 테스트는 비즈니스 코어 알고리즘의 안전 그물망이며, Mock 분리와 Fixture 철자가 필수 기둥임을 깨닫는다.

### 실수/주의

- **테스트 케이스를 다 짰는데, RISK LEVEL 에 HARMLESS 가 아닌 CRITICAL 이나 DANGEROUS 를 기재해 두어 단위 테스트를 미가동 처리**:
  - `RISK LEVEL CRITICAL` 이나 `DANGEROUS` 는 시스템 커스터마이징이나 DB 영구 디스크 값을 쌩으로 오염 변경하는 고위험군 테스트임을 뜻한다.
  - 이 설정을 해두면 SAP 운영 장비나 상위 개발 클라이언트 셋업 상에서 "안전을 위해 고위험군 단위 테스트는 실행을 강제 차단한다" 는 보안 차단막에 걸려 내 단위 테스트가 실행 조차 되지 않고 무력화된다.
  - **단위 테스트는 Mock 을 활용하여 DB 나 시스템 설정을 절대 건드리지 않는 100% 무해한 HARMLESS 등급으로 설계하여 가동하는 것이 정석이다.**

### 정리

- **`Testable Class`** 는 계산 로직과 외부 DB/화면 의존성을 깔끔히 절단 격리한다.
- **`의존성 주입 (DI)`** 은 생성자 등을 통해 외부 인터페이스 부품을 주입받는 기법이다.
- ABAP Unit Fixture 메서드는 **`setup`**, **`teardown`** 의 정해진 4대 철자로 적어야 하며, 뒤에 `FOR TESTING` 구문을 절대 기입하지 않는다.
- 실제 검증을 수행하는 개별 테스트 메서드에만 **`FOR TESTING`** 지표를 심어 가동한다.
