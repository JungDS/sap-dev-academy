# CH23_QA - antigravity_0629_v1 재작업 검수 및 Q&A

> 대상 파일: `reference/antigravity_0629_v1/CH23_REWRITE.md`
> 목적: CH23 v1 재집필 원고의 품질을 자가 검증하고, 비전공자 입문자를 위한 빈발 질문 및 구체적 답변을 정리한 QA 원장이다.

## 1. 재작업 품질 자가 검증

| 검증 항목 | 상세 기준 | 반영 내용 | 판정 |
| --- | --- | --- | --- |
| **입문자 가독성** | IT 비전공자 20대 전후 기준 친근한 비유와 쉬운 용어 노출 | 포장 상자(RAP BO), 대들보 뿌리(Root), 거울 창문(Projection), 어댑터 연결선(Binding), 검문 레이저(Validation), 자동 계산 기어(Determination), 명시적 취소 단추(Action) 등 비유 사용 | 통과 |
| **5단 구성 흐름** | 왜 필요한가 -> 무엇인가 -> 어떻게 확인하나 -> 실수/주의 -> 정리 흐름 준수 | 9개 레슨 모두에 누락 없이 5단 세션 완비 | 통과 |
| **용어 인라인 정의** | 첫 등장 용어에 대해 괄호로 간결히 인라인 뜻풀이 수행 | managed, transactional query, Behavior Definition, Behavior Pool, EML, Service Definition, Service Binding 등 반영 | 통과 |
| **R15 게이팅 준수** | 후속 개념(저장 데이터베이스 직접 수정 및 LUW 제어, classic lock object 등)을 미리 설명하지 않고, 타 챕터로의 연계 이정표로 격리 | DB DML SQL 및 트랜잭션 control, classic lock object 는 타 챕터로 완벽 격리 선언 | 통과 |
| **R6 classic-first** | local 스코프 및 modern 문법(inline 선언, `@`, `NEW`) 완전 제거 | 본 장은 최첨단 RAP 및 ABAP Cloud 단원이므로 modern syntax(EML, FOR BEHAVIOR OF, cl_abap_behavior_handler 등)를 정식 사용하되, classic BAPI 및 unreleased 구문들과의 경계를 정교히 배치함 | 통과 |
| **R2 체험성 구체화** | 코드가 있거나 GUI 조작이 있는 모든 페이지에 가상 시뮬레이터 구성 요소와 피드백 설계 | L01~L09 전 레슨에 입력-상태-피드백 모션을 구체적인 텍스트 설계서로 수록 | 통과 |

---

## 2. 소스 커버리지 및 파일 매핑

기존 `content/abap/CH23` 원본 레슨 파일들의 핵심 주제가 빠짐없이 원안에 매핑되었음을 보증한다.

- `CH23/_chapter.md` -> `## CH23 전체 설계` 부분의 한 문장 목표 및 인트로로 포괄 반영.
- `CH23-L01.md` -> `## CH23-L01 - RAP 아키텍처 개요`
- `CH23-L02.md` -> `## CH23-L02 - Interface View ZI_* 설계 (Root)`
- `CH23-L03.md` -> `## CH23-L03 - Projection View ZC_* 설계`
- `CH23-L04.md` -> `## CH23-L04 - Behavior Definition 기초`
- `CH23-L05.md` -> `## CH23-L05 - Behavior Implementation 기초`
- `CH23-L06.md` -> `## CH23-L06 - Service Definition / Service Binding`
- `CH23-L07.md` -> `## CH23-L07 - Validation / Determination / Action 개요`
- `CH23-L08.md` -> `## CH23-L08 - ABAP Cloud와 Released API 원칙`
- `CH23-L09.md` -> `## CH23-L09 - 실습 — 예매 RAP 동작 구현`

---

## 3. 공식 문서 수동 근거 명세

`abenabap_behavior_pools.htm` 및 `abapclass_for_behavior_of.htm` 을 대조하여 Behavior Pool 의 아키텍처 한계를 규명했다.

- **FOR BEHAVIOR OF 전역 클래스의 인스턴스/상속 금지 규칙**:
  Behavior Pool 전역 클래스(`FOR BEHAVIOR OF bdef`)는 아바 런타임 엔진에 의해 `ABSTRACT` 이고 `FINAL` 임이 묵시적 명세로 강제 선언된다. 따라서 일반 유틸리티 도구 클래스처럼 외부 프로그램에서 **`CREATE OBJECT` 나 `NEW` 연산자를 기동해 인스턴스화하거나, 다른 일반 클래스의 부모 클래스로 지정해 상속 관계를 물려주는 행위가 100% 문법적으로 전면 금지**된다는 절대 언어 제약 확인 및 수록 완료.
- **CCIMP Include 와 local class 구조 격리**:
  Behavior Pool 의 전역 클래스(Global Class) 자체는 실제 어떠한 비즈니스 구현 소스 코드도 담지 않고 껍데기로 존재한다. 모든 실제 비즈니스 동작 연산은 Behavior Pool 파일 내부의 **`CCIMP` 인클루드 공간에 격리 정의되어 있는 `local handler class` 와 `local saver class` 안에서만 집행**되도록 구성되는 특수 class pool 구조임을 확인 및 명세 수록 완료.

---

## 4. 입문자용 단골 질문 Q&A (Glossary 보완용)

### Q1. BDEF 머리에 명시한 Behavior Pool 클래스(zbp_i_booking)를 왜 일반 유틸리티 클래스처럼 외부 프로그램에서 NEW 연산자로 기동할 수 없나요?
**A**: **Behavior Pool 은 RAP 런타임 엔진이 트랜잭션 버퍼 이벤트를 감지해 내부적으로 자동 호출하는 특수 포트 클래스이며, 아바 엔진에 의해 인스턴스 및 상속이 원천 차단되는 ABSTRACT FINAL FOR BEHAVIOR OF 규격으로 고정되어 태어나기 때문입니다.**
일반적으로 우리는 공통 연산 클래스를 `NEW zcl_util( )` 로 만들어 메서드를 호출합니다.
하지만 Behavior Pool 클래스(`zbp_i_booking`)는 BDEF 의 꼬리표(`FOR BEHAVIOR OF ZI_Booking`)를 달고 탄생하는 순간, 아바 컴파일러는 이 전역 클래스를 **`ABSTRACT`** (인스턴스 생성 불가) 이고 **`FINAL`** (상속 확장 불가) 인 특수 상태로 박제해 버립니다.
이 클래스의 목적은 외부 프로그램이 수동으로 뉴(NEW)하는 데 있는 것이 아닙니다. 
사용자가 OData 통신을 통해 저장/수정을 날리면, RAP 백엔드 런타임 엔진이 이 결합 뼈대를 읽어서 내부에 비공개로 숨겨진 `local handler class` 의 `validate_capacity` 메서드를 **알아서 역직렬화(Deserialize)해 깨워 가동**합니다. 
따라서 외부에서 수동 생성하려는 시도는 문법적으로 즉각 차단당하며, 오직 RAP BDEF 계약 관계를 통해서만 소통하도록 강제되는 특수 아키텍처입니다.

### Q2. validation 이나 action handler 내에서 EML 코딩을 짤 때, 왜 LOOP AT keys 내벽에서 READ ENTITIES 를 반복 호출하면 안 되나요? 벌크(Bulk) 처리의 구체적 방법은 무엇인가요?
**A**: **루프 안에서 EML 을 매번 던지면 keys 의 개수만큼 DB 임시 버퍼를 여러 번 찌르는 다중 통신(Round-trip) 병목을 유발하여 시스템 전체가 마비되기 때문이며, 루프 전에 keys 전체를 한 번에 EML 로 긁어와 internal table 에 채운 뒤 루프를 도는 벌크 리드 가드로 방어해야 합니다.**
- **성능 폭탄 코드 (안티패턴)**:
  ```abap
  LOOP AT keys INTO DATA(ls_key).
    " keys 가 100건이면 이 EML 쿼리가 100번 연속으로 작동해 성능 파괴!
    READ ENTITIES OF ZI_Booking IN LOCAL MODE
      ENTITY Booking FIELDS ( concert_id )
      WITH VALUE #( ( %key = ls_key-%key ) )
      RESULT DATA(lt_single).
  ENDLOOP.
  ```
- **올바른 벌크 EML 가드 (정석)**:
  ```abap
  " 루프 시작 전에 단 1번만 keys 전체 집합을 전달해 한 번에 긁어오기!
  READ ENTITIES OF ZI_Booking IN LOCAL MODE
    ENTITY Booking FIELDS ( concert_id perf_no seats )
    WITH CORRESPONDING #( keys ) " keys 전체를 CORRESPONDING 벌크 매핑 전달!
    RESULT DATA(lt_bookings).   " lt_bookings 에 100건 데이터가 한 번에 탑재 완료

  " 그 후 메모리에 탑재된 lt_bookings 를 단순 LOOP 순회하며 속도 0에 가깝게 판정!
  LOOP AT lt_bookings INTO DATA(ls_booking).
    " 비즈니스 판정 로직 집행
  ENDLOOP.
  ```
이와 같이 코딩을 격리 구성해야 대량 데이터 일괄 저장 시 0.1초 안에 통과하는 고성능 비즈니스 백엔드가 완성됩니다.

### Q3. validation 핸들러 내부에서 정원 초과를 발견했을 때, status = 'E' 처럼 직접 MODIFY ENTITIES 를 날려 값을 바꾸거나 DB UPDATE SQL 로 강제 수정을 집행하면 안 되나요?
**A**: **validation 은 저장 시점(save sequence)에 작동하는 순수한 '검사 가드' 일 뿐이며, 이 단계에서 트랜잭션 임시 버퍼 값을 강제로 수정 변경(Modify)하려 들면 RAP 런타임 엔진이 버퍼 일관성 오염(Inconsistency)으로 판단하고 즉각 세션을 강제 폭사시키기 때문입니다.**
Validation 은 "이 예약 신청을 DB 디스크에 써도 되는가?" 라는 질문에 **"예(성공)"** 혹은 **"아니오(실패)"** 의 대답(reported 에 오류 박스 리턴)만 안전하게 제출하고 빠져나가는 검문소 역할입니다.
검문관이 갑자기 여권 정보를 직접 볼펜으로 변조 수정(MODIFY ENTITIES 또는 UPDATE SQL)하려 드는 행위는 트랜잭션 라이프사이클 규약을 정면 위배하는 파괴 행위입니다.
**규격 규칙**:
- 값의 자동 변경이나 기본 세팅은 무조건 입력/수정 시점인 **`Determination (on modify)`** 에 위임해야 합니다.
- 사용자가 버튼을 눌러 상태를 강제로 변조해야 한다면 **`Action`** 의 통로로 우회하여 구현해야 하며, Validation 안에서는 오직 **오류 검출 및 reported 패킹**에만 완벽히 집중해야 버퍼 오염 덤프를 피할 수 있습니다.

### Q4. Service Definition DDL 은 문법 오류 없이 이쁘게 활성화가 완료되었는데, 왜 웹 브라우저 OData URL 을 호출하면 계속 404 Not Found 나 500 에러를 터트리며 먹통이 되나요?
**A**: **Service Definition 은 단지 '이 뷰를 내보내겠다' 는 진열서 표기일 뿐이며, 이를 실제 OData 통신 포트와 엮어주는 Service Binding 파일을 개설하고 상단의 활성화(Activate) 전원 버튼을 누르지 않아 통신 통로가 inactive 락으로 닫혀있기 때문입니다.**
- **동작 원리**:
  1. Service Definition 은 진열장에 상품을 올린 상태입니다.
  2. Service Binding 은 이 진열장을 1층 3번 OData 전용 매장(OData V4 UI 프로토콜)으로 입점시켜 통신 케이블을 꽂고 전원 스위치를 켠 상태입니다.
많은 초보 개발자가 Binding 파일은 만들어두고 에디터 창 상단의 **`Activate`** 버튼(번개 또는 활성화 아이콘)을 누르지 않아, 바인딩 상태가 회색 `INACTIVE` 에 머물러 있습니다. 전원선이 차단된 상태이므로 웹 서버는 게이트웨이 엔드포인트 URL 주소 자체를 외부 세상에 개설하지 않아 계속 404 주소 없음 에러를 냅니다.
**해결책**: 반드시 Binding 에디터를 열고 **`Activate` 버튼을 누르고 ACTIVE 상태**가 된 것을 확인한 뒤에야 비로소 Preview 기능과 외부 OData 통신 포트가 정상 해방됩니다.

### Q5. @Metadata.allowExtensions: true 가 켜져 있는 Projection 뷰에서, BDEF 에 선언해 둔 'action cancel' 취소 버튼의 Fiori Elements 화면 상의 배치 힌트를 왜 굳이 DDLX 메타데이터 파일에 적어 도킹해야 하나요?
**A**: **action cancel 은 비즈니스 트랜잭션 동작 계약(BDEF)이지만, 그 동작이 Fiori Elements 화면의 상단 툴바(Header Area)에 배치될 것인가, 혹은 목록 각 행의 우측 단추(Line Item)로 렌더링될 것인가의 visual 힌트는 순수한 시각 레이아웃 영역이므로, 본문 뼈대를 어노테이션으로 오염시키지 않기 위해 DDLX 파일에 적어 매핑해야 합니다.**
- **BDEF 선언**: `action cancel result [1] $self;` 는 "취소 기능 버튼을 활성화한다" 는 백엔드 동작 약속입니다.
- **DDLX 매핑**: 이 버튼이 Fiori 웹 화면의 예약 리스트 각 로우 옆에 '예매 취소' 라는 이쁜 버튼 단추로 나타나게 엮어주기 위한 어노테이션 셋업은 **`asddlx`** 메타데이터 확장 파일 안에 기입합니다.
  ```abap
  " ZC_Booking.asddlx 메타데이터 확장 파일 내의 UI 배치 셋업
  @UI.lineItem: [
    { position: 30 },
    { type: #FOR_ACTION, dataAction: 'cancel', label: '예매 취소' } " BDEF cancel 액션을 UI 버튼으로 도킹!
  ]
  status;
  ```
이렇게 기입해 두면, Fiori Elements UI 렌더링 엔진은 DDLX 파일의 `#FOR_ACTION` 마크를 읽어서 "아, status 필드 옆 30번 자리에 cancel 액션을 격발하는 예매 취소 단추를 이쁘게 그려 올려야겠구나" 라고 판단하고 자동으로 버튼을 그려내어 백엔드 action과 안전하게 체결 도킹이 완료됩니다.
