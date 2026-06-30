# CH20_REWRITE - OO ABAP 기본 설계 v1

> 목적: `content/abap/CH20`의 10개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH20 전체 설계

CH20의 한 문장 목표는 "독립적으로 흩어져 있던 콘서트 예매 잔여석 계산과 검증 절차식 코드를 하나의 통일된 전역 클래스(`ZCL_BOOKING_MANAGER`)로 캡슐화하고, 속성/메서드 공개 범위 격리, 생성자를 통한 객체 안정 초기화, 인터페이스 규약 다형성, 예외 클래스(TRY/CATCH/CX 계층) 전파, 상속 및 캐스팅 공정, 그리고 이벤트 핸들링 구조를 접목하여, 현대식 고유 업무 객체지향 아키텍처를 안전하게 수립하고 덤프 예외를 방어한다"이다.

IT 비전공자 입문자는 참조 변수 선언만 해두고 `NEW` 생성자를 생략해 빈 명함 덤프(`GET_REF_TO_INCONSISTENT`)를 터트리며, 상속받은 자식 클래스에서 부모의 `private` 멤버를 직접 만지려 들다 컴파일 거부를 겪는다. 
이에 더해, `CLASS_CONSTRUCTOR` 정적 생성자 내부에서 예외를 던지려다 문법 충돌을 맞이하고, `CATCH` 배치 순서를 거꾸로 잡아서 구체 예외가 슈퍼 클래스 예외(`CX_ROOT`)에 삼켜져 작동하지 않는 데드코드 오류를 내며, `CASE TYPE OF` 분기 시 순서를 잘못 적어 자식 객체를 부모 타입 분기로 오독 판정한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **설계도와 명함 격리**: 클래스(설계도)와 객체(물리 주머니)를 격리하고, 참조 변수(`REF TO`)는 단순 명함 주소방일 뿐이므로 반드시 **`NEW`** 생성 연산자로 객체를 실재화해야 함을 수립.
2. **visibility 3단 방어선**: 데이터를 마음대로 변조하지 못하도록 `PRIVATE` 섹션으로 데이터를 감싸 캡슐화하고, 확장은 `PROTECTED`, 조작 인터페이스는 `PUBLIC` 으로 고정하는 캡슐화 규격 장착.
3. **태어날 때 초기화 (CONSTRUCTOR)**: 객체 생성 시 즉시 사용 가능한 유효 상태를 강제하는 인스턴스 생성자 **`constructor`** 와 클래스 공용 정적 생성자 **`class_constructor`** 스펙 규명.
4. **정적 생성자 예외 전파 금지**: `class_constructor` 내부에서는 **`RAISING`** 절을 통한 예외 노출 전파가 문법적으로 100% 금지되는 물리 사양 한계 및 해결 기법 명세.
5. **화살표 기호 분리**: 클래스 직접 정적 호출 기호 **`=>`** 와 객체 참조 인스턴스 호출 기호 **`->`** 의 도킹 대상 격리 및 자기 참조 지시어 **`me->`** 수명 정의.
6. **약속의 강제 (Interface)**: 상속 계층과 상관없이 "출력 가능하다" 와 같은 공통 규약을 강제하여 느슨한 다형성을 빚어내는 **`INTERFACE`** 와 **`인터페이스~메서드`** 조립법.
7. **실패의 객체 수송 (Exception)**: 화면 메시지나 에러 코드 반환 대신, 오류 정보를 객체에 담아 던지고 복구 주기를 밟는 **`RAISE EXCEPTION`** 및 **`TRY/CATCH/CLEANUP`** 주기 장착.
8. **CATCH 우선순위 배치 룰**: 상위 추상 예외가 하위 구체 예외를 가로채지 못하도록, **구체 핸들러 분기부터 상단에 선순위 배치**하는 덤프 방어선 의무화.
9. **단일 상속과 재정의**: 자식 클래스가 부모의 인스턴스 메서드를 **`REDEFINITION`** 하여 변형 구현하고, **`super->`** 기호로 원래 부모의 검증 로직을 도킹하는 상속 메커니즘.
10. **안전 다운캐스팅**: 부모 타입에 자식을 담는 upcast와 반대로, 자식 전용 기능을 켜기 위해 하향 캐스팅할 때 안전을 확보하는 **`CAST( )`** (?=) 및 **`CASE TYPE OF`** 분기 가이드.
11. **비결합 알림 (Event)**: 사건 발생 객체가 수신 대상자를 몰라도 사태를 고지하는 **`EVENTS`**, **`RAISE EVENT`**, **`SET HANDLER ... FOR ...`** 의 4단계 라이프사이클 기획.
12. **종합 실습 - ZCL_BOOKING_MANAGER 완성**: 상태 캡슐화, 읽기, 정원 초과 예외 전파, 만석 시 이벤트 발송까지 결합한 콘서트 예매 비즈니스 OOP 완성.

---

## CH20-L01 - Global Class 생성과 객체

### 왜 필요한가

우리가 지금까지 짠 콘서트 예매 프로그램은 잔여석을 계산하거나, 정원을 확인하고, 자리를 추가하는 로직이 일반 프로그램 에디터 내부의 `FORM get_remaining`, `FORM book_seats` 라는 독립된 서브루틴으로 여기저기 흩어져 있었다.
처음에는 한 파일에 모여 있어 편해 보이지만, 시간이 흘러 ALV 예약 리포트 화면, 모바일용 입력 인터페이스, 매일 밤 돌아가는 백엔드 배치 프로그램까지 **"동일한 예약 가능 조건 검사"** 로직을 재사용하여 호출하기 시작하면 큰 혼란이 발생한다.
- 어떤 서브루틴 파일이 가장 최신 비즈니스 룰을 지닌 원본 소스인지 추적하기 어렵다.
- 루틴을 호출할 때마다 공연 코드, 정원, 예약 수 같은 데이터들을 파라미터(`USING`, `CHANGING`)로 구구절절 넘겨주어야 해서 매개변수 피로가 극에 달한다.

**"예약 관리자" 라는 명확한 비즈니스 개념을 프로그램 에디터 밖으로 분리해 내어, 그 개념이 알아야 할 데이터(잔여석, 정원)와 해야 할 행동(예약, 조회)을 단 하나의 독립된 주머니 팩 안에 밀착 묶어주는 기술**이 필요하다. 그것이 **[[Class]] (클래스)** 와 **[[객체]]** 의 장착이다.

### 무엇인가

#### 1. Class(클래스)와 Object(객체/인스턴스)의 관계
- **Class (클래스)**: 집을 짓기 위한 도면, 혹은 예약 관리자의 작동 원리를 적어둔 무형의 설계도다. 클래스 선언 자체로는 메모리 상에 아무런 실재 영역이 생기지 않는다.
- **Object (객체/인스턴스)**: 설계도를 기반으로 메모리 공간 상에 실제 구축해 낸 물리적인 데이터 주머니(실체)다. 

#### 2. Global Class (전역 클래스 - SE24)
- 특정 프로그램 내부에서만 갇혀 쓰는 Local Class와 달리, SAP 시스템 전체 어느 곳에서나 조회하고 호출하여 재사용할 수 있도록 공유 개설한 전역 클래스다. transaction code **`SE24`** 나 ADT(ABAP Development Tools)에서 생성한다.
- 클래스는 밖에서 보이는 규격을 약속하는 **`DEFINITION`** 영역과, 그 약속을 이행하여 실제 내부 소스 코드를 구현하는 **`IMPLEMENTATION`** 영역으로 쪼개어 구성한다.

#### 3. 객체 참조 변수(REF TO) 와 NEW 생성자
- **`TYPE REF TO 클래스명`**: 객체의 실제 데이터가 잠들어 있는 메모리 번지(주소)를 가리키는 포인터형 변수방(명함 변수)이다.
- **`NEW 클래스명( )`**: 설계도를 토대로 메모리 상에 실제 객체 주머니를 탄생시키고, 그 방 번호 주소를 리턴하는 모던 생성 연산자다. 클래식 아바에서는 `CREATE OBJECT 참조변수.` 구문으로 작성했다.

### 어떻게 확인하는가

SE24 전역 클래스 규격대로 참조 변수를 개설하고 NEW 연산자로 인스턴스를 조립하여 메서드를 호출하는 소스를 검증한다.

```abap
REPORT zch20_l01_class_create.

START-OF-SELECTION.
  " 1. [명함 변수 개설] ZCL_BOOKING_MANAGER 를 가리킬 명함 변수 lo_mgr 수립!
  " (이 단계에서는 객체가 메모리에 없어 아직 아무 일도 못하는 initial 상태)
  DATA lo_mgr TYPE REF TO zcl_booking_manager.

  " 2. [물리 주머니 생성] NEW 연산자로 메모리에 실체를 빚고 주소 번지를 lo_mgr 에 장착!
  lo_mgr = NEW #( ).

  " 3. [인스턴스 호출] 화살표 기호 -> 를 가동하여 실체 객체 내부의 book 메서드 작동!
  lo_mgr->book( iv_seats = 2 ).
```

#### 체험/시뮬레이터 설계 (클래스 설계도와 인스턴스 관계)
- **프로세스 플로우**:
  1. 학습자가 화면 왼쪽에 있는 `ZCL_BOOKING_MANAGER` 라는 [설계도 인쇄물]을 본다.
  2. [TYPE REF TO ZCL_BOOKING_MANAGER 선언] 카드를 집는다. 구멍이 숭숭 뚫린 [빈 명함 변수 박스 lo_mgr]가 생성된다. 이 박스를 클릭하자 "Initial (Null Reference) 에러 위험!" 경고등이 깜빡인다.
  3. [NEW] 생성 연산자 레버를 당긴다. 설계도 인쇄물에서 실재하는 [3D 객체 주머니 상자]가 메모리 영역에 쿵 솟아오르고, 그 고유 번지 리본 주소가 `lo_mgr` 박스로 도킹 결합되는 애니메이션을 본다.
  4. 화살표 호출을 누르자, `lo_mgr` 박스가 리본 주소를 추적하여 메모리 상의 실제 객체 상자 안의 book 스위치를 작동시키는 모션을 감상한다.
- **상태 및 데이터**:
  - `lo_mgr 변수가 INITIAL 상태일 때 lo_mgr->book( ) 을 기동한 상태` -> 런타임 상태: `GET_REF_TO_INCONSISTENT` (참조 유실 덤프) 유발 시각화.
- **피드백**: 참조 변수 선언은 방을 가리키는 지표일 뿐이므로, 반드시 `NEW` 로 물리 객체를 빚어 엮어야 실체 작동이 일어남을 이해시킨다.

### 실수/주의

- **NEW 생성 연산자를 생략하고 쌩 변수명에 바로 호출**: `DATA lo_mgr TYPE REF TO zcl_booking_manager. lo_mgr->book( ).` 처럼 `NEW` 도킹을 빼먹고 쌩으로 화살표를 찌르면 런타임에 참조 오류 덤프를 터트리며 시스템을 다운시키므로, **사용 전에 반드시 `IS BOUND` 나 `IS NOT INITIAL` 로 포인터 바인딩 상태를 검문**해야 안전하다.

### 정리

- **`Class`** 는 데이터와 메서드의 구조를 선언한 형상 설계도다.
- **`Object`** 는 **`NEW`** 생성자를 가동해 메모리에 실제 구현해 낸 실체 주머니(인스턴스)다.
- 객체 변수(`REF TO`)는 **실제 주소 포인터**일 뿐이므로 초기화(생성) 없는 접근을 원천 차단한다.

---

## CH20-L02 - Attribute / Method / Visibility

### 왜 필요한가

클래스를 통해 로직을 설계도 안으로 모았다. 
그런데 클래스 내부의 속성(데이터) 값을 누구나 밖에서 마구잡이로 수정할 수 있다면 캡슐화가 깨진다. 
"예약 관리자의 정원 속성(`capacity`)을 외부 프로그램에서 `lo_mgr->mv_cap = 0.` 으로 쌩 대입하여 강제로 0으로 포맷해 버렸다."
정원이 강제로 0이 되는 바람에, 뒤이어 작동한 정상 예약 로직들이 전부 잔여석 에러를 내며 시스템 장애를 유발한다. 
이렇게 객체의 속성 데이터를 사방에 무방비로 개방해 두면, 어떤 엉뚱한 외부 코드 파일이 들어와 데이터를 오염시켰는지 추적하는 디버깅 지옥이 펼쳐진다.

**객체의 내부 핵심 데이터 상태는 외부에서 직접 손가락으로 건드리지 못하게 꽁꽁 감싸 차단하고(은닉), 외부에는 오직 검증된 게이트 통로 메서드(예약 신청, 잔여석 조회)만을 허용하여 오염을 원천 예방하는 차단 메커니즘**이 필요하다. 그것이 **Visiblity (공개 범위 캡슐화)** 의 장착이다.

### 무엇인가

#### 1. Attribute(속성) 와 Method(메서드) 의 분기
- **Attribute (속성)**: 클래스가 가진 변수 상태다. `DATA` 로 선언하면 객체별 고유 방인 **인스턴스 속성**, `CLASS-DATA` 로 선언하면 모든 객체가 단 1개의 방을 공유하는 **정적 속성**이 된다.
- **Method (행동)**: 클래스가 실행하는 처리 알고리즘이다. `METHODS` 는 인스턴스 메서드, `CLASS-METHODS` 는 정적 메서드다.

#### 2. Visibility 3대 공개 구역 정의
- **`PUBLIC SECTION`**: 제한 없이 외부 프로그램 누구나 맘대로 호출하고 쓸 수 있는 완전 개방 광장이다. 보통 외부 소통용 메서드를 배치한다.
- **`PROTECTED SECTION`**: 자기 클래스 본인과, 자기를 상속받은 자식(Subclass) 클래스 구성원들에게만 접근을 허용하는 내부 전용 통로다.
- **`PRIVATE SECTION`**: **오직 자기 클래스 내벽의 메서드 소스 코드 안에서만 접근할 수 있는 완전 통제 구역**이다. 외부 프로그램은 물론이고, 자기를 물려받은 자식 클래스조차 이 구역의 속성은 손댈 수 없다. 

#### ⚠️ [ private 속성에 대한 컴파일 단계의 선제적 에러 차단]
- *객체지향 설계의 가장 훌륭한 방어막 사양이다.*
- `lo_mgr->mv_cap = 100.` 처럼 private 구역에 외부인이 무단 접근을 시도하면, 프로그램 실행 중 뒤늦게 터지는 것이 아니라 **에디터 컴파일 단계(Syntax Check)에서 컴파일러가 문법 오류를 터트려 빌드 자체를 선제 차단한다.**

### 어떻게 확인하는가

Visibility 구역을 선언하고 외부에서 private 멤버에 무단 대입을 쳐서 컴파일이 가로막히는 소스를 검증한다.

```abap
REPORT zch19_l02_visibility.

CLASS lcl_booking_test DEFINITION.
  PUBLIC SECTION.
    METHODS remaining RETURNING VALUE(rv_val) TYPE i.
  PRIVATE SECTION.
    DATA mv_capacity TYPE i VALUE 100. " 외부 무단 접근을 차단한 프라이빗 속성!
ENDCLASS.

CLASS lcl_booking_test IMPLEMENTATION.
  METHOD remaining.
    rv_val = me->mv_capacity. " 내부 본인 메서드는 자유롭게 private 접근 가능!
  Endmethod.
ENDCLASS.

START-OF-SELECTION.
  DATA(lo_test) = NEW lcl_booking_test( ).
  DATA(lv_num) = lo_test->remaining( ). " PUBLIC 메서드 호출은 통과!
  
  " lo_test->mv_capacity = 200. " <-- 만약 이 줄의 주석을 풀면 컴파일러가 "Attribute mv_capacity is private" 문법 에러 발동!
```

#### 체험/시뮬레이터 설계 (Visibility Gate Simulator)
- **프로세스 플로우**:
  1. 학습자가 중앙의 [ZCL_BOOKING_MANAGER 성벽]을 본다. 성문은 PUBLIC, 비밀 지하는 PRIVATE 으로 나뉘어 있다.
  2. [remaining( ) 메서드 호출선]을 던진다. 성문을 지나 내부 `mv_capacity` 데이터 값을 안전하게 읽어오는 결합 선로가 렌더링된다.
  3. 이번에는 [mv_capacity 데이터 직접 조작선]을 던진다.
  4. 지하 PRIVATE 방 입구에서 붉은색 검문 레이저가 작동하며 선로를 동강 내고, "접근 권한 위반! private 멤버는 외부 호출이 금지됩니다!" 컴파일 거부 사이렌이 우는 피드백을 감상한다.
- **상태 및 데이터**:
  - `Private 멤버에 외부 프로그램이 직접 쓰기 접근을 시도한 상태` -> 컴파일러 상태: `Syntax Error`.
- **피드백**: 캡슐화는 장식이 아니라, 외부의 무분별한 상태 파괴 시도를 빌드 시점에 차단해 주는 정밀 아키텍처 가드임을 알게 한다.

### 실수/주의

- **귀찮다는 이유로 클래스의 모든 DATA 속성을 PUBLIC SECTION 에 배치**:
  - 클래스의 데이터가 모두 공공 광장에 노출되면 내부 예약 룰이 사방에서 우회 조작되므로, **"데이터 변수 속성은 무조건 private 구역에 꽁꽁 숨기고, 오직 검증용 public 메서드를 통해서만 우회 대입 조작하도록 통제"** 하는 캡슐화 기본 원칙을 수호해야 한다.

### 정리

- 데이터 속성은 **`PRIVATE`**, 외부 소통 행동은 **`PUBLIC`** 에 두는 것이 기본 원칙이다.
- 정적 멤버는 모든 인스턴스가 1개의 방을 공유하는 **`CLASS-DATA`** / **`CLASS-METHODS`** 다.
- Visibility 경계선 위반은 컴파일 단계에서 철저하게 빌드를 막아 시스템 안정성을 높인다.

---

## CH20-L03 - Constructor와 객체 초기화

### 왜 필요한가

속성을 프라이빗 구역에 잘 감췄다. 
그런데 이번에는 객체가 태어난 직후의 불완전한 상태가 말썽이다. 
"예약 관리자 객체를 생성하자마자 정원을 조회하려고 `lo_mgr->remaining( )` 을 불렀는데, 에러가 나거나 엉뚱한 0값이 리턴된다."
원인을 확인해 보니, 객체를 `NEW` 로 만들고 나서 깜빡 잊고 정원을 DB에서 읽어 적재해 주는 `lo_mgr->load_capacity( )` 라는 수동 셋업 메서드를 아랫줄에 호출하지 않은 채 조급하게 조회를 날린 것이다. 
객체가 메모리에 숨은 쉬고 있지만 정작 필요한 알맹이 데이터가 채워지지 않은 **불완전한 좀비 상태**로 방치되면 로직 전체가 꼬이게 된다.

**참조 변수로 객체를 생성하는 바로 그 탄생 시점에, 필수적인 매개 데이터(공연 ID, 회차)를 아예 강제로 주입받도록 문법적으로 제약하고, DB 로드까지 단 한 번에 자동 완수하여 언제나 100% 즉시 사용 가능한 정상 상태로 객체를 빚어내는 장치**가 필요하다. 그것이 **[[CONSTRUCTOR]] (생성자)** 이다.

### 무엇인가

#### 1. Instance Constructor (인스턴스 생성자) 의 규칙
- **정의**: 객체가 메모리에 탄생할 때 백엔드 런타임 엔진이 **가장 먼저 무조건 자동으로 딱 1회 호출**해 주는 특수한 예약 메서드다.
- **문법**: PUBLIC SECTION 에 메서드명을 반드시 **`constructor`** 라는 고정 단어로 선언해야 한다.
- **매개변수 제약**: 생성자는 값을 외부로 뱉어낼 수 없으므로 `EXPORTING` 이나 `RETURNING` 을 쓸 수 없으며, **오직 외부로부터 값을 주입받는 `IMPORTING` 단방향 매개변수만 개설할 수 있다.**

#### 2. Static Constructor (정적 생성자 - CLASS_CONSTRUCTOR)
- 개별 객체의 탄생과 무관하게, **해당 클래스가 전체 프로그램 실행 주기 중 메모리에 최초로 1회 접속(호출, 생성 등)되는 순간 딱 한 번 자동으로 구동**되는 정적 클래스 공용 생성자다. 
- 명칭은 **`class_constructor`** 로 고정되며, 매개변수를 일절 탑재할 수 없는 단독형이다.

#### ⚠️ [정적 생성자(CLASS_CONSTRUCTOR) 내부에서 RAISING 예외 전파 금지 제약]
- *정적 생성자 아키텍처의 가장 치명적인 언어 명세상 함정이다.*
- 인스턴스 생성자 `constructor` 는 예외 전파를 던질 수 있다.
- **반면, `class_constructor` 정적 생성자 내부에서는 `RAISING` 절을 적어 예외를 바깥으로 던지는 것 자체가 문법적으로 전면 금지된다.**
- **이유**: 이 정적 생성자가 작동하도록 격발(Trigger)한 1순위 코드 사용자가 "내가 정적 영역의 초기화 예외까지 책임지고 `TRY/CATCH` 로 잡아내야 한다" 는 의무 계약을 예측할 수 없기 때문이다. 따라서 정적 생성자 내부에서 터지는 예외는 반드시 내벽 안에서 완벽히 수습(`TRY/CATCH` 완수)하고 소멸시켜야 한다.

### 어떻게 확인하는가

인스턴스 생성자에서 공연 정보를 주입받아 DB 조회를 끝마치고 mv_ 속성에 밀착 고정하는 코드를 검증한다.

```abap
REPORT zch19_l03_constructor.

CLASS lcl_booking_mgr DEFINITION.
  PUBLIC SECTION.
    " 1. [생성자 선언] 메서드명은 constructor 고정, 단방향 IMPORTING 인자만 허용!
    METHODS constructor IMPORTING iv_concert TYPE zconcert-concert_id.
    METHODS remaining RETURNING VALUE(rv_val) TYPE i.
  PRIVATE SECTION.
    DATA mv_concert TYPE zconcert-concert_id. " 탄생 후 두고두고 기억할 프라이빗 상태방!
    DATA mv_cap     TYPE i.
ENDCLASS.

CLASS lcl_booking_mgr IMPLEMENTATION.
  METHOD constructor.
    " 2. [인자 대입 필수] 주입된 iv_ 인자를 mv_ 프라이빗 보관함에 복사 보존!
    mv_concert = iv_concert.
    SELECT SINGLE capacity FROM zconcert
      WHERE concert_id = @iv_concert INTO @mv_cap.
  ENDMETHOD.
  METHOD remaining.
    rv_val = mv_cap.
  Endmethod.
ENDCLASS.

START-OF-SELECTION.
  " 3. [생성 시 전달] 객체를 빚는 찰나에 필수 인자인 공연 코드를 주입하여 완전한 상태로 탄생!
  DATA(lo_mgr) = NEW lcl_booking_mgr( iv_concert = 'C001' ).
  WRITE: / '잔여석:', lo_mgr->remaining( ).
```

#### 체험/시뮬레이터 설계 (Constructor Timeline)
- **프로세스 플로우**:
  1. 학습자가 [NEW lcl_booking_mgr( iv_concert = 'C001' )] 단추를 누른다.
  2. 타임라인 기어 1단계: 메모리에 빈 인스턴스가 빚어진다.
  3. 타임라인 기어 2단계: 주입된 `'C001'` 캡슐이 생성자의 `iv_concert` 입구로 골인한다.
  4. 타임라인 기어 3단계: 생성자 내부의 `SELECT SINGLE` 계산 기어가 작동해 정원 수 `100` 을 뽑아내고, `mv_cap` 내부 보관소에 안착시킨 뒤 완성된 녹색 객체가 튀어나오는 모션을 확인한다.
- **상태 및 데이터**:
  - `CLASS_CONSTRUCTOR 에 RAISING zcx_error 를 선언해 둔 상태` -> 컴파일 경보: `CLASS_CONSTRUCTOR cannot have a RAISING clause` 하이라이트.
- **피드백**: 생성자는 객체가 탄생할 때 오염되지 않은 정상 기준 상태를 완성해 주는 첫 번째 강제 단추임을 학습한다.

### 실수/주의

- **생성자(Constructor) 내부에 극단적으로 무겁고 긴 대량 데이터 가공 로직 적재**:
  - 생성자는 객체를 빚을 때마다 무조건 런타임에 동기 실행되므로, 이 내부에 5초 이상 걸리는 헤비 쿼리나 파일 다운로드 로직을 박아두면 이 클래스 객체를 뉴(NEW)하는 시스템 전 구역의 속도가 마비된다.
  - **생성자 내부에는 오직 변수 대입과 1건 조회 정도의 가벼운 정체성 세팅만 두고, 무거운 가공은 별도의 일반 메서드로 빼내어 호출**해야 한다.

### 정리

- **`constructor`** 는 인스턴스 생성 시 무조건 자동 구동되어 객체 상태를 수립한다.
- 생성자는 오직 값 주입 수용용 **`IMPORTING`** 단방향 매개변수만 개설할 수 있다.
- **`class_constructor`** 정적 생성자는 클래스 최초 접속 시 1회 구동되며 **`RAISING` 이 금지**된다.

---

## CH20-L04 - Static Method와 Instance Method

### 왜 필요한가

생성자를 통해 상태를 잘 로드했다. 
그런데 클래스 내부에 모든 메서드를 무작정 인스턴스 메서드로만 만들어 두었더니 다른 비효율이 발생한다. 
"입력받은 예매 코드가 대문자인지 검증해 소문자를 싹 소거하고 `'C001'` 로 규격 포맷하는 1회성 유틸리티 함수 `normalize_id` 가 필요하다."
단순히 글자 하나를 포맷 변환하고 싶은 것뿐인데, 이 메서드가 인스턴스로 설계되어 있으면 굳이 `NEW ZCL_BOOKING_MANAGER( )` 로 객체 주머니를 메모리에 비효율적으로 빚어낸 뒤에야 화살표를 찔러 호출해야만 작동한다. 
객체의 정원 상태나 회원 정보 데이터가 전혀 관여할 필요가 없는 가벼운 연산인데도, 매번 주머니 생성을 강제하니 불필요한 가비지 메모리가 쌓이고 절차가 복잡해진다.

**객체 주머니 생성이라는 번거로운 공정 없이, 클래스 설계도 이름에 직접 대고 신호를 날려 1회성 연산 결과를 즉시 반환받는 정적 도킹 기술**이 필요하다. 그것이 **Static Method (정적 메서드)** 의 격리 분기다.

### 무엇인가

#### 1. Static(정적) 멤버 와 Instance(인스턴스) 멤버의 격리
- **Instance 멤버 (`->`)**: 객체 고유의 내부 상태값(`mv_capacity` 등)에 접근해야만 연산할 수 있는 성격으로, 반드시 객체를 먼저 실재화(NEW)하여 가리키는 화살표 기호 **`->`** 로 호출해야 한다.
- **Static 멤버 (`=>`)**: 객체의 수나 개별 상태와 아무 관계없이 클래스 공용으로 작동하는 성격이다. 객체를 생성할 필요 없이 클래스 명칭 자체에 대고 이중 화살표 **`=>`** 로 직접 호출한다. (예: `zcl_booking_manager=>normalize( )`).

#### 2. me-> 지시어 (자기 인스턴스 포인터)
- 인스턴스 메서드 내부에서, 현재 연산 중인 자기 자신의 다른 인스턴스 속성이나 메서드를 명시 지칭할 때 사용하는 내부 예약 변수다. (예: `me->mv_capacity`).

#### ⚠️ [정적 메서드 내부에서 me-> 호출 금지 제약]
- *초보 객체지향 입문자들이 겪는 가장 당황스러운 컴파일 에러다.*
- **정적 메서드(`CLASS-METHODS`) 내부 소스 코드에서는 `me->` 나 일반 인스턴스 멤버 변수를 절대 호출해 사용할 수 없다.**
- **이유**: 정적 메서드는 객체가 메모리에 존재하지 않는 상태에서도 클래스로 직접 호출될 수 있기 때문에, "나 자신" 을 가리키는 물리 인스턴스 주체인 `me` 가 런타임에 아예 존재하지 않기 때문이다.

### 어떻게 확인하는가

정적 메서드와 인스턴스 메서드를 기호에 맞춰 분기 호출하고 정적 내부 me 사용 오류를 확인한다.

```abap
REPORT zch19_l04_methods.

CLASS lcl_util DEFINITION.
  PUBLIC SECTION.
    " 1. [정적 메서드] CLASS-METHODS로 선언! 객체 없이 호출 가능!
    CLASS-METHODS normalize IMPORTING iv_val TYPE string RETURNING VALUE(rv_val) TYPE string.
    
    METHODS set_name IMPORTING iv_name TYPE string.
  PRIVATE SECTION.
    DATA mv_name TYPE string.
ENDCLASS.

CLASS lcl_util IMPLEMENTATION.
  METHOD normalize.
    rv_val = to_upper( iv_val ).
    " mv_name = iv_val. " <-- 만약 이 줄을 켜면 컴파일러가 "Instance attribute mv_name is not usable here" 에러 유발!
  ENDMETHOD.
  
  METHOD set_name.
    me->mv_name = iv_name. " 인스턴스 메서드는 me-> 지시어로 자기 방 접근 가능!
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  " 2. [정적 호출] 클래스명 => 정적 메서드 구동! (객체 생성 생략)
  DATA(lv_res) = lcl_util=>normalize( 'c001' ).
  
  " 3. [인스턴스 호출] 참조변수 -> 인스턴스 메서드 구동!
  DATA(lo_util) = NEW lcl_util( ).
  lo_util->set_name( '정훈영' ).
```

#### 체험/시뮬레이터 설계 (=> vs -> 호출 조립기)
- **프로세스 플로우**:
  1. 학습자가 우측에 [lcl_util=>normalize( )] 문장 카드를 꽂는다.
  2. 시스템이 "클래스명에서 직접 뻗어 나가는 이중 화살표 => 정적 도킹 완료!" 녹색 통과 신호를 켠다.
  3. 이번에는 [lo_util=>set_name( )] 카드를 꽂아본다.
  4. "lo_util 은 클래스가 아니라 인스턴스 참조 변수이므로 => 기호를 쓸 수 없습니다!" 경고를 울리며 선로를 해제하는 모션을 본다.
- **상태 및 데이터**:
  - `정적 메서드 소스 안에 me->mv_name 을 호출해 기입해 둔 상태` -> 컴파일러 상태: `me is not defined in static methods` 하이라이트.
- **피드백**: 개별 속성에 도킹할 필요 없는 보조식은 과감히 정적(Static)으로 격리 설계해야 메모리를 보존할 수 있음을 체득한다.

### 실수/주의

- **정적 변수(CLASS-DATA)를 프로그램 전역 변수처럼 마구잡이로 공유 조작**:
  - `CLASS-DATA` 는 메모리 상에 단 1개만 상주하여 모든 객체가 공유하므로, 한 객체에서 정적 값을 슬쩍 훼손하면 다른 백개 객체의 정적 값도 동시에 파괴되는 부작용(Side Effect)이 난다. 
  - **공용 데이터 초기 셋팅 목적 외에는 함부로 정적 쓰기 변수를 남발하지 말아야 한다.**

### 정리

- 객체 상태와 무관한 공용 계산 유틸리티는 **`CLASS-METHODS`** 정적으로 뺀다.
- 호출 기호는 클래스 기준 **`=>`**, 참조 변수 인스턴스 기준 **`->`** 로 물리 구분한다.
- 정적 메서드 내부에서는 가상 주체인 **`me`** 지시어를 절대 호출할 수 없다.

---

## CH20-L05 - Interface 기본 설계

### via 왜 필요한가

정적 메서드와 상속 설계까지 마스터했다. 
그런데 이번에는 느슨한 공통 약속을 엮는 설계에 한계가 온다. 
"우리 예매 관리자 클래스(`ZCL_BOOKING_MANAGER`)와, 시스템 오류 로그 클래스(`ZCL_ERROR_LOG`)는 업무 계통도와 상속 계보가 180도 다른 완전 쌩판 남남인 클래스들이다. 
그런데 이 두 녀석 모두 공통적으로 '화면에 결과를 텍스트 인쇄할 수 있다' 는 기능을 지니고 있다."
이 둘을 공통 인쇄 메서드로 묶기 위해, 아무 업무 연관도 없는 두 클래스를 억지로 하나의 공통 부모 밑으로 집어넣어 상속 계보를 엮어버리면, 원하지 않는 부모 필드와 잡다한 예약 데이터까지 오류 로그 클래스가 원치 않게 물려받게 되어 상속의 오염(Mishap)이 난다.

**서로 계보가 완전히 다른 클래스들이라도, 오직 특정 기능(인쇄, 검증)의 약속 이름만 동일하게 규정해 엮어주고, 호출자가 실체 클래스가 뭔지 전혀 상관하지 않고 "인쇄 약속을 지켰다" 는 스펙만 보고 안심하고 기동할 수 있게 해주는 약속 기술**이 필요하다. 그것이 **[[Interface]] (인터페이스)** 이다.

### 무엇인가

#### 1. Interface(인터페이스) 와 Polymorphism(다형성) 의 개념
- **Interface**: 메서드의 알맹이 구현(Implementation)을 일절 작성하지 않고, 오직 **"이름과 입력/출력 인자 규격"** 만을 껍데기로 약속하여 배포하는 규약 설계도다.
- **다형성**: 동일한 인터페이스 규약을 수용한 여러 서로 다른 자식 객체들에게 똑같은 신호(`print( )`)를 날렸을 때, **각 자식의 정체성에 따라 전혀 다르게 맞춤형으로 텍스트를 인쇄해 내는 객체지향 고유 마법**이다.

#### 2. INTERFACES (규약 수용 선언) 과 틸드(~) 조립식
- 클래스 DEFINITION 영역에 **`INTERFACES 인터페이스명.`** 을 기입해 규약을 공식 승인한다.
- IMPLEMENTATION 내부에서 해당 인터페이스 메서드를 실제로 구현할 때는, 이름 충돌을 피하기 위해 반드시 **`인터페이스명~메서드명`** 틸드 기호 형식으로 조립해 기입해야 한다. (예: `zif_printable~print`).

#### 3. 인터페이스 참조 타입 (TYPE REF TO zif_printable)
- 구체 클래스명이 아닌 인터페이스명을 참조형으로 삼는 유연한 명함 박스다.
- **이 박스에 담긴 객체는 오직 인터페이스가 약속한 규약 메서드만 밖으로 노출되어 보이며, 구체 클래스가 독자적으로 지닌 사설 메서드는 완벽하게 감추어 격리하는 안전 격리 필터** 역할을 수행한다.

### 어떻게 확인하는가

인터페이스를 정의하고 두 개별 클래스에서 이를 수용 구현하여 인터페이스 명함으로 호출하는 소스를 검증한다.

```abap
REPORT zch19_l05_interface.

" 1. [인터페이스 약속 수립] 메서드 이름만 선언!
INTERFACE lif_printable.
  METHODS print.
ENDINTERFACE.

" 2. [예약 클래스에서 규약 이행]
CLASS lcl_booking DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_printable. " 인쇄 약속 수용 선언!
ENDCLASS.
CLASS lcl_booking IMPLEMENTATION.
  METHOD lif_printable~print. " 틸드 기호 조립 구현!
    WRITE: / '예매 티켓을 물리 인쇄합니다.'.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  " 3. [인터페이스 명함에 도킹]
  DATA lo_client TYPE REF TO lif_printable.
  
  lo_client = NEW lcl_booking( ).
  lo_client->print( ). " 구체 클래스명이 뭔지 몰라도 약속된 print 호출 작동!
```

#### 체험/시뮬레이터 설계 (Contract Board)
- **프로세스 플로우**:
  1. 학습자가 [ZIF_PRINTABLE 인터페이스 퍼즐 조각]을 본다. print 구멍이 뚫려있다.
  2. [lcl_booking 클래스 카드]를 준비해 INTERFACES 선언 칩을 끼운다.
  3. 퍼즐 조각이 클래스 카드에 철컥 도킹되며, `lif_printable~print` 구현 슬롯이 개설된다.
  4. [인터페이스 참조 lo_client] 박스를 가져와 도킹하자, 사설 예약 정보 필드들은 장막 뒤로 감춰지고 오직 녹색 print 단추만 전면으로 드러나 호출되는 흐름을 감상한다.
- **상태 및 데이터**:
  - `INTERFACES를 선언해 두고 구현부 IMPLEMENTATION 에서 틸드 print 메서드를 빠뜨린 상태` -> 컴파일 오류: `Class lcl_booking must implement method lif_printable~print` 하이라이트.
- **피드백**: 인터페이스는 클래스의 결합도를 낮추고 다형성을 확보해 주는 강력한 규격 도킹 장치임을 확인한다.

### 실수/주의

- **인터페이스에 온갖 잡다한 속성 필드 데이터를 배치 시도**:
  - 인터페이스는 순수한 행동 약속 판이므로 인스턴스 데이터 변수(mv_ 속성)를 탑재할 수 없다. 
  - **인터페이스 안에는 오직 행동의 표준 이름과 입출력 매개변수 규격만 콤팩트하게 정의해야 한다.**

### 정리

- **`Interface`** 는 사물 간의 작동 약속만 이름으로 규정해 배포하는 규약판이다.
- 수용한 클래스는 반드시 **`인터페이스~메서드`** 조립 이름으로 구현 의무를 다해야 한다.
- 인터페이스 명함 박스는 **규약에 선언된 메서드만 외부에 투사**해 보이는 안전 격리 필터다.

---

## CH20-L06 - Exception Class — TRY / CATCH / CX 계층

### 왜 필요한가

인터페이스 약속까지 정복했다. 
그런데 클래스 내부에서 업무 조건 판정 실패 시 발생하는 오류를 사용자 화면에 통지하는 방식이 번거롭다. 
"예약 가능 잔여석이 부족해서 예약을 중단해야 한다."
기존 클래식 아바에서는 서브루틴 내부에서 `MESSAGE '매진입니다' TYPE 'E'.` 구문을 적어 직접 빨간 에러 메시지를 화면에 뿜고 강제 중단시켰다.
하지만 이 클래스를 백엔드 배치 프로그램이나, 외부 웹 API 수신 모듈에서 재사용하게 되면, 화면이 존재하지 않는 배치 세션이나 API 세션에서 `MESSAGE` 가 작동하는 순간 시스템은 화면 렌더링 충돌로 즉각 비정상 셧다운 덤프를 터트려 폭사한다.
클래스가 독자적으로 메시지를 내뱉지 않고, **"예약 가능 수량 부족" 이라는 오류 정황을 우아하게 박스에 담아 상위 호출자에게 패스하고, 호출자의 물리 위치(화면 프로그램, 배치 프로그램)에 맞게 알아서 사후 처리하도록 예외를 수송하는 기술**이 필요하다. 그것이 **예외 클래스(Exception Class)** 의 장착이다.

### 무엇인가

#### 1. Exception Class (예외 클래스 - CX 계층) 의 개념
- 오류 메시지나 에러 코드 숫자 대신, 에러의 속 사정 정황 데이터들을 하나의 독립된 클래스 객체(박스)에 담아서 호출한 상위 구역으로 쏘아 올려주는 예외 수송용 특수 클래스 군이다. 최상위 부모는 **`CX_ROOT`** 다.

#### 2. RAISE EXCEPTION 과 RAISING 선언 의무
- **`RAISE EXCEPTION TYPE 예외클래스명`**: 특정 에러 상황 감지 시 예외 박스를 즉시 빚어서 상단으로 쏘아 올리는 기폭제다.
- **`RAISING 예외클래스명`**: 이 메서드 내부에서 해당 예외가 터져서 밖으로 도망쳐 올라갈 수 있음을 상위 호출자에게 의무 고지(Declaration)하는 메서드 머리 꼬리표다.

#### 3. TRY / CATCH / CLEANUP (예외 포착 주기)
- **`TRY`**: 에러가 터질 위험이 있는 위험 영역 코드를 안전 펜스로 감싼다.
- **`CATCH 예외 INTO DATA(lx_err)`**: 쏘아 올려진 예외 상자를 그물망으로 낚아채서, 에러 메시지(`lx_err->get_text( )`)를 화면에 이쁘게 출력해 가공하는 포착소다.
- **`CLEANUP`**: 에러가 터져 나가며 강제로 문을 닫고 탈출할 때, 열려있던 DB 커넥션이나 메모리 개체를 안전하게 반환하고 지나가도록 보장하는 청소 대피소다.

#### ⚠️ [상위 예외(CX_ROOT)를 구체 예외보다 위에 배치할 때의 데드코드 트랩]
- *CATCH 핸들러를 짤 때 100% 실수하는 치명적 덤프 방어선 정렬 함정이다.*
- `TRY. ... CATCH cx_root INTO ... CATCH zcx_fully_booked ...`
- **위와 같이 포괄적 부모 예외인 `CX_ROOT` 를 맨 윗줄에 먼저 배치하면, 아래에 기입해 둔 구체적 업무 예외 `zcx_fully_booked` 는 부모 조건 필터에 몽땅 먼저 낚여 가로채 지므로, 아래 코드는 영원히 실행되지 않는 도달 불가 데드코드(Dead-code) 에러를 맞이한다.**
- **방어선**: CATCH 문을 나열할 때는 반드시 **가장 구체적인 하위 업무 예외 클래스를 맨 윗줄에 선순위 배치**하고, 가장 포괄적인 `CX_ROOT` 나 `CX_STATIC_CHECK` 는 맨 마지막 줄에 깔아주어야 물리 정렬이 성립한다.

### 어떻게 확인하는가

예외를 던지고 CATCH 구문으로 낚아채 get_text 메시지를 투사하는 소스 규격을 검증한다.

```abap
REPORT zch19_l06_exception.

" 1. [예외 클래스 개설 가정 - CX_STATIC_CHECK 상속]
" ZCX_FULLY_BOOKED TYPE REF TO cx_static_check.

CLASS lcl_booking DEFINITION.
  PUBLIC SECTION.
    " 2. [RAISING 고지] 이 메서드는 예약 만석 예외를 뿜을 수 있음을 천명!
    METHODS book IMPORTING iv_seats TYPE i RAISING zcx_fully_booked.
ENDCLASS.

CLASS lcl_booking IMPLEMENTATION.
  METHOD book.
    IF iv_seats > 10.
      " 3. [기폭제 가동] 예외 발생 즉시 상자를 조립해 위로 발사!
      RAISE EXCEPTION TYPE zcx_fully_booked.
    ENDIF.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA(lo_book) = NEW lcl_booking( ).
  
  " 4. [TRY-CATCH 그물망 수립]
  TRY.
      lo_book->book( iv_seats = 99 ).
    CATCH zcx_fully_booked INTO DATA(lx_booked). " 구체적 업무 예외를 맨 위에 선 배치!
      WRITE: / lx_booked->get_text( ).
    CATCH cx_root.                              " 가장 포괄적인 부모 가드는 맨 밑바닥에 수립!
      WRITE: / '기타 시스템 에러 발생'.
  ENDTRY.
```

#### 체험/시뮬레이터 설계 (Exception Flow Console)
- **프로세스 플로우**:
  1. 학습자가 [CATCH cx_root] 카드를 1번 라인, [CATCH zcx_fully_booked] 카드를 2번 라인에 두고 [정렬 검사]를 누른다.
  2. 시스템이 "오류! 상위 예외가 1번에서 가로채기 때문에 2번 카드는 영원히 도달 불가능합니다!" 빨간 라인 경고를 켠다.
  3. 학습자가 카드의 위아래 위치를 마우스로 뒤집어 정렬한다.
  4. 녹색 통과 신호와 함께, 쿼리 에러가 1번 검문소(fully_booked)에 촥 낚여 안전 구역으로 안착하는 포착 슬라이드 모션을 감상한다.
- **상태 및 데이터**:
  - `CATCH 순서를 부모부터 먼저 적은 상태` -> 컴파일 경보: `Catch block for cx_root hides catch block for zcx_fully_booked` 하이라이트.
- **피드백**: 예외는 던져진 그물 순서대로 낚이므로, 구체 그물망을 1순위로 깔아주는 정렬 배치가 핵심임을 시각화한다.

### 실수/주의

- **예외 발생 시 팝업창 띄우기 등의 UI 화면 메시지를 클래스 메서드 내벽에 직접 하드코딩**:
  - 클래스는 오직 예외 상자 발송에만 집중해야 한다. 
  - **예외 상자가 낚아채진 바깥 CATCH 영역에서 화면 출력 프로그램을 가동해야 클래스의 재사용 독립성이 사수된다.**

### 정리

- **`RAISE EXCEPTION`** 은 에러 상태 정보를 객체 상자에 패킹해 위로 쏘아 올린다.
- 메서드 정의 머리에 **`RAISING`** 절을 명시해 예외 탈출 가능 통로를 등록한다.
- CATCH 그물망은 무조건 **구체적인 자식 예외부터 상단에 선순위 기입**한다.

---

## CH20-L07 - Inheritance / Redefinition

### 왜 필요한가

예외 수송까지 정복했다. 
그런데 이번에는 유사한 변종 비즈니스 룰을 추가하는 코드가 중복된다.
"일반 예매 관리자(`ZCL_BOOKING_MANAGER`)를 만들었는데, 이번에 새로 추가된 'VIP 고객용 예매 관리자' 는 일반 예매 규칙과 95% 동일하지만, 딱 하나 '한 번에 최대 4석까지만 예매할 수 있다' 는 미세한 차이 조건이 추가된다."
만약 VIP 예매 관리자 클래스를 완전히 새로 빚어내면, 잔여석 조회 쿼리, 정원 로드 생성자, 캡슐화 데이터 변수 선언까지 95% 의 동일한 코드가 사방에 2중 카피 적재된다. 
정원 로드 쿼리에 버그가 나서 고칠 때, 일반 클래스와 VIP 클래스 두 군데 소스를 똑같이 열어서 수작업으로 수정해야 하므로 동기화 누수와 유지보수 파괴가 일어난다.

**이미 무결하게 잘 돌아가는 부모의 공통 설계도(속성, 쿼리 메서드)를 고스란히 100% 무상으로 상속받아 사용하되, 미세하게 틀어지는 그 단 5% 의 행동 메서드만 골라내어 자식 방에서 우아하게 재정의(Over-ride)하는 기술**이 필요하다. 그것이 **Inheritance (상속)** 와 **[[REDEFINITION]] (재정의)** 의 장착이다.

### 무엇인가

#### 1. Inheritance (상속) 과 단일 상속 제약
- **Inheriting from**: 부모 클래스를 지목해 물려받는 키워드다. ABAP 언어는 다중 상속을 금지하며, **오직 단 1개의 부모 클래스로부터만 상속받을 수 있는 단일 상속(Single Inheritance) 구조**로 설계되어 있다.
- **`REDEFINITION`**: 부모의 PUBLIC 이나 PROTECTED 메서드 약속 규격을 자식 방에서 그대로 복사 지목하여, **내부 알맹이 소스 코드만 VIP 용 조건식으로 전면 새 구현**하는 키워드다.

#### 2. super-> 지시어 (부모 도킹 호출기)
- 자식 클래스에서 부모의 메서드를 재정의해 버리면 부모의 원래 쿼리 동작이 덮어씌워져 막혀버린다.
- **원리**: 자식 메서드 내부에서 **`super->book( )`** 을 명시 호출해 주면, **자식이 1차적으로 VIP 예약 수량 검사(4석 이하)를 완료한 뒤, 2차 저장 처리는 부모의 원래 book 코드로 바통을 넘겨 재사용**하는 스마트한 도킹 조립이 수행된다.

#### ⚠️ [부모의 private 속성에 대한 자식 클래스의 접근 차단 경계 격리]
- *상속 튜닝 시 가장 자주 범하는 멤버 스코프 위반 오류다.*
- **부모 클래스 내부의 `PRIVATE SECTION` 에 들어있는 mv_ 속성 변수는, 자식 클래스 내부에서 `me->mv_capacity` 로 쓰거나 읽으려 해도 컴파일 에러를 뿜으며 완벽하게 차단 격리된다.**
- **해결책**: 자식에게 상태 접근 권한을 물려주고 싶다면, 부모 설계 시 해당 속성을 private 이 아닌 **`PROTECTED SECTION`** 에 보관해 두어야 자식의 노크가 통과된다.

### 어떻게 확인하는가

부모를 상속받은 자식 클래스에서 redefinition 과 super 를 가동하여 실행하는 소스를 검증한다.

```abap
REPORT zch19_l07_inheritance.

CLASS lcl_parent DEFINITION.
  PUBLIC SECTION.
    METHODS book IMPORTING iv_seats TYPE i.
  PROTECTED SECTION.
    DATA mv_cap TYPE i VALUE 100. " 자식에게 상속 개방한 프로텍티드 속성!
ENDCLASS.
CLASS lcl_parent IMPLEMENTATION.
  METHOD book.
    WRITE: / iv_seats, '석 일반 예매 완료.'.
  ENDMETHOD.
ENDCLASS.

" 1. [상속 선언] INHERITING FROM 으로 부모 물려받기!
CLASS lcl_child DEFINITION INHERITING FROM lcl_parent.
  PUBLIC SECTION.
    " 2. [재정의 천명] 부모의 book 메서드를 내 입맛대로 변형 선언!
    METHODS book REDEFINITION.
ENDCLASS.
CLASS lcl_child IMPLEMENTATION.
  METHOD book.
    IF iv_seats > 4.
      WRITE: / 'VIP 는 최대 4석까지만 예매 가능합니다. 차단!'.
      RETURN.
    ENDIF.
    " 3. [부모 도킹] super-> 기호로 부모의 원래 예매 인쇄 로직을 기동!
    super->book( iv_seats = iv_seats ).
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA(lo_vip) = NEW lcl_child( ).
  lo_vip->book( iv_seats = 3 ). " 일반 검사 통과 후 부모 book 도킹 작동!
```

#### 체험/시뮬레이터 설계 (부모-자식 상속 계층)
- **프로세스 플로우**:
  1. 학습자가 [부모 lcl_parent 상자]와 [자식 lcl_child 상자] 계보를 본다.
  2. 자식 상자 안에 book 을 얹고 [REDEFINITION] 스위치를 켠다. book 슬롯이 자식 독자 버전으로 번쩍 하이라이트된다.
  3. 자식 book 내부에서 [super->book] 연결 끈을 잡고 부모 book 슬롯으로 엮어 던진다.
  4. 실행을 하자, 1차 검사가 자식 단에서 가동되고, 2차 수송 화물이 끈을 타고 부모 book 슬롯으로 전달되어 인쇄를 완수하는 애니메이션을 감상한다.
- **상태 및 데이터**:
  - `자식 IMPLEMENTATION 안에서 부모의 private 변수 mv_secret 에 대입을 친 상태` -> 컴파일 에러: `Field mv_secret is private and not inheritable` 하이라이트.
- **피드백**: 상속은 코드 복사 노가다를 방지하며, protected 와 super-> 를 조화롭게 가동해야 무결한 자식 확장이 일어남을 이해시킨다.

### 실수/주의

- **상속(Inheritance)을 단순 코드 재사용 편의를 위해 만능 해결책으로 남용**:
  - "이메일 발송 클래스에 들어있는 문자 인코딩 메서드가 필요하니까, 우리 예약 관리자 클래스를 이메일 발송 클래스의 자식으로 상속받아야지" 
  - 이따위 계통 붕괴 설계를 자행하면 예약 클래스에 이메일 계정 정보와 스팸 필터 속성까지 개입되어 설계가 파괴된다.
  - **상속은 무조건 "VIP 예약은 예약 관리자의 일종(Is-a)이다" 라는 완전한 정체성 계보 일치가 일어날 때만 좁게 적용해야 한다.**

### 정리

- **`INHERITING FROM`** 은 부모의 유산을 독식 전수받는 단일 상속 지시어다.
- 자식은 **`REDEFINITION`** 을 통해 부모의 행동 메서드를 오버라이드 튜닝한다.
- 자식 내부에서 부모의 원래 메서드를 부를 때는 **`super->`** 통로를 연다.

---

## CH20-L08 - 다형성 — CAST와 CASE TYPE OF

### 왜 필요한가

상속 재정의까지 정복했다. 
이제 다형성의 마법을 부릴 차례다. "프로그램 시동 시, 예매 관리자 참조 변수(`lo_mgr`)라는 넓은 부모 명함 방에, 일반 예매 객체나 VIP 예매 객체를 조건에 맞게 골라 담아 똑같이 다루고 있다."
이것을 업캐스트(Up-cast)라 하며 아주 자연스럽게 컴파일러가 허용해 준다.
그런데 가동 중, 특정한 분기 시점에서 "이 녀석이 정말 VIP 예약 객체인 게 확실하다면, 부모 클래스에는 정의되어 있지 않고 오직 VIP 자식 클래스 내부에만 사설로 숨어있는 'VIP 전용 쿠폰 할인 적용(`apply_coupon`)' 메서드를 긴급 가동하고 싶다."
부모 타입의 안경(`lo_mgr`)을 쓰고 쳐다보고 있으니, 자식의 사설 기둥인 `apply_coupon` 은 안경 렌즈에 잡히지 않아 컴파일러가 "그런 메서드는 부모에게 없다" 며 호출을 막아서 한계에 부딪힌다.

**부모 타입 안경으로 가려져 있던 자식 본연의 고유 기능 정체성을 다시 드러내기 위해, 하향 형변환(Down-cast)을 안전하게 수동 집행하고, 만약 엉뚱한 클래스면 덤프 에러 없이 평화롭게 우회 분기를 태우는 기술**이 필요하다. 그것이 **CAST 연산자** 와 **`CASE TYPE OF`** 분기이다.

### 무엇인가

#### 1. Down-cast (하향 형변환) 의 물리적 제약
- 부모 타입 참조 변수 방에 담긴 실제 알맹이 객체의 주소를, 구체적인 자식 타입 참조 변수 방으로 옮겨 담는 강제 이송이다.
- 문법은 **`CAST 자식클래스( 부모변수 )`** 형태로 기입한다. 클래식 아바에서는 **`?=`** 기호를 사용했다.

#### ⚠️ [ 잘못된 Downcast 시 CX_SY_MOVE_CAST_ERROR 시스템 덤프 위협 명세]
- *형변환 가동 시 개발자들이 가장 자주 마주하는 런타임 폭사 함정이다.*
- `lo_mgr` 안방에 들어있는 실제 알맹이가 그냥 일반 예약 객체일 뿐인데, 욕심을 부려 `lo_vip = CAST zcl_vip_booking( lo_mgr )` 로 VIP 변환을 강제 집행하면, 아바 엔진은 주소의 물리적 레이아웃이 어긋나므로 **`CX_SY_MOVE_CAST_ERROR`** 런타임 에러 덤프를 터트려 프로그램을 강제 셧다운 시켜버린다.
- **방어선 (TRY/CATCH)**: 따라서 `CAST` 를 가동할 때는 언제든 타입 불일치 실패가 터질 수 있음을 대비해, 반드시 `TRY / CATCH cx_sy_move_cast_error` 그물망으로 캐스팅 실패 구간을 포위 감싸 보호해 주어야 안전하다.

#### 2. CASE TYPE OF (안전한 타입 분기 장치)
- `TRY/CATCH` 로 덤프를 억제하며 변환하는 피로를 싹 해결한다.
- 쿼리 조건문처럼 **`WHEN TYPE 자식클래스 INTO DATA(lo_vip)`** 문법을 타면, **알맹이의 실시간 정체성 검사와 안전한 자식 참조변수 개설 및 대입 수송까지 단 한 줄에 원천 집행 완료**해 주므로 덤프의 위험 없이 매우 우아하게 분기 처리를 끝마칠 수 있다.

### 어떻게 확인하는가

부모 명함에 담긴 객체를 CASE TYPE OF 와 CAST 로 형변환 해 자식 메서드를 호출하는 소스를 검증한다.

```abap
REPORT zch19_l08_cast.

CLASS lcl_parent DEFINITION.
  PUBLIC SECTION.
    METHODS info.
ENDCLASS.
CLASS lcl_parent IMPLEMENTATION.
  METHOD info. WRITE: / '일반 예약'. ENDMETHOD.
ENDCLASS.

CLASS lcl_child DEFINITION INHERITING FROM lcl_parent.
  PUBLIC SECTION.
    METHODS vip_only. " 자식 전용 사설 메서드!
ENDCLASS.
CLASS lcl_child IMPLEMENTATION.
  METHOD vip_only. WRITE: / 'VIP 전용 쿠폰 적용 완료!'. ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA lo_mgr TYPE REF TO lcl_parent.
  lo_mgr = NEW lcl_child( ). " upcast 적재!

  " [ CASE TYPE OF 로 안전하고 기품있게 타입 분기 적재 가동 ]
  CASE TYPE OF lo_mgr.
    WHEN TYPE lcl_child INTO DATA(lo_vip).
      " 타입 검출 성공 시 즉시 lo_vip 변수가 자식 타입으로 개설되어 수령!
      lo_vip->vip_only( ).
    WHEN OTHERS.
      WRITE: / '일반 객체로 판단됩니다.'.
  ENDCASE.
```

#### 체험/시뮬레이터 설계 (Dynamic Type Inspector)
- **프로세스 플로우**:
  1. 학습자가 [lo_mgr 변수 박스]를 본다. 겉에는 parent 라고 적힌 안경 필터가 씌워져 있다. 알맹이는 VIP 자식 객체다.
  2. [lo_mgr->vip_only( )] 호출 카드를 던진다. 안경 필터가 가로막아 컴파일 에러 적색 표시가 뜬다.
  3. [CAST lcl_child] 레버를 내린다. 안경 필터가 child 로 정교하게 교체되며 숨겨진 `vip_only` 스위치가 활짝 노출되어 연동되는 모션을 확인한다.
  4. 이번에는 알맹이가 일반 객체인데 캐스팅을 가동하자, `MOVE_CAST_ERROR` 예고 번개가 치며 덤프 위협이 뜨는 모습을 감상한다.
- **상태 및 데이터**:
  - `부모 객체를 자식으로 억지 형변환 하려다 CAST_ERROR 가 났을 때` -> 런타임 상태: `Crash Dump`.
- **피드백**: 상향 캐스팅은 무상 통과지만, 하향 다운캐스팅은 알맹이 검증 절차가 수반되는 덤프 폭사 지대이므로 안전 가드(`CASE TYPE OF`)가 특효약임을 보여준다.

### 실수/주의

- **CASE TYPE OF 나열 시 부모 추상 클래스를 자식보다 상단에 선순위 배치**:
  - `CASE TYPE OF lo_mgr. WHEN TYPE lcl_parent ... WHEN TYPE lcl_child ...`
  - **위와 같이 부모 클래스 필터를 윗줄에 두면, 자식 객체도 부모의 피를 이어받았으므로 1번 부모 분기에서 몽땅 포착 통과되어 버려, 아래 VIP 자식 전용 분기 코드가 영원히 기동되지 않는 대형 논리 버그를 낸다.**
  - **방어선**: 분기를 적을 때는 무조건 **가장 좁고 구체적인 말단 자식 클래스 타입부터 위에 선순위 배치**해야 정밀 매칭이 성립한다.

### 정리

- 부모 명함에 자식을 수용하는 것은 자동으로 이루어지지만(**Upcast**), 그 반대는 수동 변환(**Downcast**)을 쳐야 한다.
- **`CAST`** 는 강제 변환을 집행하며 실패 시 **`CX_SY_MOVE_CAST_ERROR`** 덤프를 유발한다.
- **`CASE TYPE OF`** 는 타입 검출과 안전 대입 수령을 동시에 완수하는 덤프 방어막이다.

---

## CH20-L09 - OO 이벤트 — EVENTS / RAISE EVENT / SET HANDLER

### 왜 필요한가

다형성 변환까지 마스터했다. 
이제 객체 간의 사건 소통 코드가 복잡하다. 
"예약 관리자가 자석 예약을 하다가, 딱 마지막 남은 잔여석 1석을 채워서 '완전 매진(sold_out)' 이라는 중대한 비즈니스 사건을 마주했다."
이 사건을 딘프로 화면, 백엔드 로깅 모듈, 혹은 알림 카카오톡 전송 모듈이 실시간으로 귀신같이 알아채어 각자 ALV 빨간 칠을 하거나, 로그를 쓰고, 전송을 쏘게 만들고 싶다.
만약 예약 클래스 내부에서 `lo_alv->paint_red( ). lo_log->write( ). lo_sms->send( ).` 처럼 직접 다른 부서 클래스들을 하나씩 호출해 신호를 찌르면, 
예약 클래스는 인코딩과 SMS 전송 클래스의 물리 존재 유무와 주소 정보까지 모두 다 쥐고 엮여있어야 하므로, 한 군데 부서가 공사를 하거나 클래스 이름만 바꿔도 예약 전체가 작동을 멈추는 **극도의 무거운 결합도(Tight Coupling)로 파멸**한다.

**사건 발생 객체는 다른 부서의 존재 여부와 이름을 일절 모른 채 오직 "매진!" 하고 허공에 고함치듯 고지(Publish)만 하고, 그 사건을 조용히 구독 대기하고 있던 외부 결합체들이 신호를 알아채어 알아서 리액션을 치게 엮어내는 느슨한 결합 기술**이 필요하다. 그것이 **OO Event** 의 장착이다.

### 무엇인가

#### 1. OO Event (비결합 알림) 의 물리 매커니즘
- **결합도 해소**: 이벤트를 날리는 주체(Publisher)는 수신자가 누구이며 몇 명인지 0.001% 도 관여하지 않으며, 오직 규약된 이벤트를 공중으로 살포할 뿐이다.
- **SET HANDLER (동적 연결 선로)**: 수신자(Subscriber)가 아바 런타임 엔진에 "저 매니저의 sold_out 사건 신호가 터지면 제 귀에 도킹해 주십시오" 하고 동적 선로를 도킹 등록해 둔다.

#### 2. OO 이벤트를 완성하는 4단계 수명주기
1. **`EVENTS sold_out EXPORTING ...` (사건 선언)**: 클래스 DEFINITION 에 이 클래스가 뿜어낼 수 있는 사건의 규격과 전달 매개 인자를 공식 천명한다.
2. **`RAISE EVENT sold_out EXPORTING ...` (사건 폭파)**: IMPLEMENTATION 내부에서 매진 트리거 발생 시 실제 사건 신호탄을 우주로 발사한다.
3. **`FOR EVENT sold_out OF 클래스` (귀때기 장착)**: 수신자 클래스 정의에 이 사건을 수신 전담할 **핸들러 메서드**를 개설한다. (이때 발생자 본인의 주소인 **`sender`** 를 임포팅 인자로 자동 접수해 기동할 수 있다.)
4. **`SET HANDLER lo_recv->on_sold_out FOR lo_mgr.` (선로 체결)**: 런타임 실행 코드 단에서 발생자와 수신자의 실제 물리적 도킹 연결을 체결 완료해 준다.

### 어떻게 확인하는가

이벤트를 선언 폭파하고, 이를 FOR EVENT 핸들러로 낚아채 SET HANDLER로 wiring 하는 소스를 검증한다.

```abap
REPORT zch19_l09_events.

" --------------------------------------------------
" ① [사건 발생자 정의]
" --------------------------------------------------
CLASS lcl_manager DEFINITION.
  PUBLIC SECTION.
    " 1단계: sold_out 사건 공식 선언!
    EVENTS sold_out EXPORTING VALUE(iv_concert) TYPE string.
    METHODS book.
ENDCLASS.
CLASS lcl_manager IMPLEMENTATION.
  METHOD book.
    " 2단계: 사건 폭파!
    RAISE EVENT sold_out EXPORTING iv_concert = 'C001'.
  ENDMETHOD.
ENDCLASS.

" --------------------------------------------------
" ② [사건 수신자 정의]
" --------------------------------------------------
CLASS lcl_monitor DEFINITION.
  PUBLIC SECTION.
    " 3단계: FOR EVENT 로 귀때기 핸들러 장착! (sender 인자는 자동으로 전수됨)
    METHODS on_sold_out FOR EVENT sold_out OF lcl_manager
                        IMPORTING iv_concert sender.
ENDCLASS.
CLASS lcl_monitor IMPLEMENTATION.
  METHOD on_sold_out.
    WRITE: / iv_concert, '공연 매진 긴급 감지!'.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA(lo_mgr) = NEW lcl_manager( ).
  DATA(lo_mon) = NEW lcl_monitor( ).
  
  " 4단계: [선로 체결] 런타임에 동적 배선 셋업!
  SET HANDLER lo_mon->on_sold_out FOR lo_mgr.
  
  lo_mgr->book( ). " 매진 사건이 터지자 모니터의 리액션 메서드가 알아서 동기 실행!
```

#### 체험/시뮬레이터 설계 (Event Wiring Panel)
- **프로세스 플로우**:
  1. 학습자가 좌측 [발생 매니저 lo_mgr] 와 우측 [모니터 lo_mon] 노드를 본다. 선로가 아직 끊어져 있어 book 을 눌러도 모니터에 아무런 불이 안 들어온다.
  2. [SET HANDLER] 체결 기어 스위치를 올린다. 두 노드 사이에 은은한 광섬유 배선선로가 촥 도킹 연결된다.
  3. [book 실행] 버튼을 탭하자, 매니저가 sold_out 신호를 공중에 방사하고, 광섬유 배선을 타고 실시간으로 모니터 노드에 전류가 흘러 "매진 감지!" 녹색 전광판 불빛이 렌더링되는 종합 피드백을 감상한다.
- **상태 및 데이터**:
  - `SET HANDLER 체결을 빼먹고 book 을 실행한 상태` -> 수신 감지 상태: `Nothing happened` 침묵 시각화.
- **피드백**: 이벤트는 선로 체결(`SET HANDLER`)이 수반되지 않으면 한쪽의 짝사랑 외침으로 무력화되므로 배선 연결이 필수임을 증명한다.

### 실수/주의

- **이벤트 핸들러(Handler)의 실행 순서가 기계적으로 순차 작동할 것이라 가정하는 설계**:
  - `SET HANDLER` 로 동일한 한 매니저의 `sold_out` 이벤트에 5개의 다른 수니 모니터 모듈을 엮어둘 수 있다.
  - **이때 5개 모니터의 핸들러 메서드들이 어떤 녀석부터 먼저 실행될지 그 물리적 우선순위 순서는 아바 런타임 명세 상 절대 약속되지 않으므로, 순서가 중요한 비즈니스 로직 체인은 이벤트가 아닌 일반 명시적 메서드 호출로 엮어야 한다.**

### 정리

- **`EVENTS`** 와 **`RAISE EVENT`** 는 결합도가 극도로 낮은 비결합 알림 체계를 빚어낸다.
- 수신 전담자는 **`FOR EVENT ... OF ...`** 형태로 핸들러를 정의 개설한다.
- 런타임에 **`SET HANDLER`** 로 연결 배선을 도킹하지 않으면 이벤트는 침묵 유실된다.

---

## CH20-L10 - 실습 — ZCL_BOOKING_MANAGER 클래스 종합 완성

### 왜 필요한가

우리가 공부한 객체 창조(`NEW`), Visibility 은닉 방어선, Constructor 자동 초기화, 틸드 인터페이스 다형성, 예외 클래스 CX 수송, super-> 부모 상속 도킹, 그리고 이벤트 SET HANDLER 기어까지 OO ABAP의 모든 대형 무기들을 완전히 섭렵했다.

이제 이 파편들을 **🎫 하나의 완결된 실무 캡스톤인 '콘서트 예약 코어 객체 (ZCL_BOOKING_MANAGER)'** 로 조립하여 캡슐화를 완성할 순간이다.
실패 상황은 `ZCX_FULLY_BOOKED` 라는 예외 클래스 상자로 엄격하게 포장해 전파하고, 성공 중 만석이라는 중대한 업무 사건은 `sold_out` 이벤트로 공중에 살포하여 모니터와 정교하게 엮어내는 **물리적 OOP 가동성**을 입증해야 한다.

### 무엇인가

#### 🎫 ZCL_BOOKING_MANAGER OOP 코어 설계도 명세
우리는 콘서트 비즈니스의 상태와 행위를 다음과 같이 물리 OOP 설계 구조로 개설 집행한다.

1. **상태 데이터 은닉 (PRIVATE SECTION)**:
   - `mv_concert`(공연 코드), `mv_perf`(회차 번호), `mv_cap`(정원)은 외부에서 쌩으로 접근하여 오염시키지 못하도록 private 구역에 완전히 은닉 보관한다.
2. **생성자 강제 초기화 (`constructor`)**:
   - 객체 생성과 동시에 공연 및 회차 정보를 주입받아, 내부 `SELECT SINGLE capacity` 를 동기 가동하여 mv_cap 정원 로드를 마치고 언제나 안전하게 사용할 수 있는 유효 상태로 객체를 수립한다.
3. **실패와 사건의 물리적 격리 (`RAISE EXCEPTION` vs `RAISE EVENT`)**:
   - 예약 요청석이 잔여석보다 큰 **실패 상황**은 클래스 내부에서 직접 메시지를 출력해 덤프 내지 않고, **`RAISE EXCEPTION TYPE zcx_fully_booked`** 로 에러를 쏘아 올려 상위 화면 프로그램이 낚아채게 위임한다.
   - 예약을 마침으로써 딱 알맞게 잔여석이 0석이 되는 **성공 사건**은, **`RAISE EVENT sold_out`** 으로 사건을 방사해 외부 모니터링 모듈이 반응하게 결합한다.

### 어떻게 확인하는가

리팩터링을 마친 후 통합 예매 모션과 예외 CATCH 수동 테스트를 개시해 무결성을 검수한다.

1. `SE24` 또는 ADT 에 `ZCL_BOOKING_MANAGER` 전역 클래스 구현을 활성화 완료한다.
2. `/nSE38` 에 테스트 리포트 프로그램을 작동하여, 공연 `C001`, 회차 `01` 의 잔여석을 끄집어내는 인스턴스 생성자가 덤프 없이 작동하는지 확인한다.
3. 잔여석이 `95석` 남은 상태에서, 무리하게 `100석` 을 예약 주문해 본다. -> 화면에 `ZCX_FULLY_BOOKED` 예외 그물이 작동하여 "잔여석 초과 예약 불가" 경고 텍스트가 안전하게 출력되는지 확인한다. (예외 그물 검수).
4. 딱 남아있는 좌석 수와 동일한 수량의 예약 신청을 날려본다. -> 공중에 살포된 `sold_out` 이벤트 배선이 `SET HANDLER` 모니터에 즉각 감지되어 "C001/01 공연이 완판 매진되었습니다!" 축하 메시지 리액션이 성공 가동되는지 확인한다. (이벤트 배선 검수).

```abap
" [ ZCL_BOOKING_MANAGER 객체 구동 테스트 리포트 ]
REPORT zch19_l10_concert_oop.

" ZCX_FULLY_BOOKED 예외 클래스 및 ZCL_BOOKING_MANAGER 가 활성화되어 있다는 전제!

" --------------------------------------------------
" ① [이벤트 모니터 클래스 선언 - lcl_monitor]
" --------------------------------------------------
CLASS lcl_monitor DEFINITION.
  PUBLIC SECTION.
    METHODS on_sold_out FOR EVENT sold_out OF zcl_booking_manager
                        IMPORTING iv_concert iv_perf sender.
ENDCLASS.
CLASS lcl_monitor IMPLEMENTATION.
  METHOD on_sold_out.
    WRITE: / |[긴급 알림] 공연 { iv_concert } / 회차 { iv_perf } 가 완전 매진되었습니다!|.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA: lo_mgr TYPE REF TO zcl_booking_manager,
        lo_mon TYPE REF TO lcl_monitor.
        
  " 1. [초기 생성 생성자 가동] 공연 C001, 회차 01 상태를 셋업하며 태어남!
  lo_mgr = NEW #( iv_concert = 'C001' iv_perf = '01' ).
  lo_mon = NEW #( ).

  " 2. [이벤트 배선 도킹] 매진 감지용 핸들러를 런타임 결합!
  SET HANDLER lo_mon->on_sold_out FOR lo_mgr.

  " 3. [예외 그물TRY-CATCH 탑재 예약 신청 가동]
  TRY.
      WRITE: / |예약 신청 전 잔여석: { lo_mgr->remaining( ) }석|.
      
      " 만약 남은 좌석보다 큰 예약을 신청하면 예외가 터져 CATCH 로 낙하!
      lo_mgr->book( iv_seats = 5 ).
      
      WRITE: / '예약 처리 심사가 무사히 완료되었습니다.'.
    CATCH zcx_fully_booked INTO DATA(lx_booked). " 구체 예외 낚아채기 수령
      WRITE: / |예약 거절 사유: { lx_booked->get_text( ) }|.
  ENDTRY.
```

#### 체험/시뮬레이터 설계 (OOP 종합 캡스톤 렌더러)
- **프로세스 플로우**:
  1. 학습자가 좌측에 [book( 100 ) 예약 요정]을 세우고, 중앙에 [ZCL_BOOKING_MANAGER 주머니 객체]를 둔다.
  2. 예약을 기동하자, 주머니 객체가 `remaining` 메서드를 거치며 '남은 좌석 95석' 상태를 파악하고, `book` 내부에서 적색 예외 상자 `ZCX_FULLY_BOOKED` 를 위로 뿜어 올리는 모션을 본다.
  3. 상자가 날아오르다 상단 `TRY-CATCH` 펜스 그물망에 걸려 탕 정지하고, lx_booked 가 get_text 리포트를 뱉어내며 조용히 종료되는 피드백을 감상한다.
- **상태 및 데이터**:
  - `남은 좌석보다 과적 예약을 날려 예외가 정상 낚인 상태` -> 런타임 상태: `Safe handled`.
- **피드백**: 완성형 OOP 설계는 내부 상태의 철저한 은닉(PRIVATE)과, 경계선 예외(`RAISE EXCEPTION`)의 안전한 외부 수송 분기가 조화될 때 비로소 달성됨을 확인한다.

### 실수/주의

- **ZCL_BOOKING_MANAGER 가 실제 테이블에 INSERT/UPDATE DML 저장 연산까지 집행하는 무리한 DB 조작 설계**:
  - **본 챕터의 아키텍처 경계는 OO '설계' 이며, 실제 데이터베이스를 영구 영사하는 저장(DML)과 락(Lock)은 뒤에 이어지는 전담 챕터에서 안전 격리하여 다룹니다.**
  - 이 장에서는 읽기 조회, 잔여석 연산, 예외 던지기, 이벤트 Wiring 배선 설계까지만 선을 딱 지켜 완수해야 함을 명심해야 한다.

### 정리

- **`ZCL_BOOKING_MANAGER`** 클래스는 예매에 필요한 상태 데이터와 행위를 은닉 집약한다.
- 비즈니스 위반 실패는 **`ZCX_FULLY_BOOKED`** 예외 객체로 패킹해 상단으로 양도한다.
- 완판 성공 사건은 **`sold_out`** 이벤트로 뿜어내어 외부 감시 리액터가 유연하게 반응하게 엮는다.
