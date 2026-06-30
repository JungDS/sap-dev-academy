# CH29_REWRITE - Enhancement / BAdI / User Exit v1

> 목적: `content/abap/CH29`의 5개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH29 전체 설계

CH29의 한 문장 목표는 "SAP 표준 소스코드를 직접 도려내지 않고 빈 자리에 안전하게 개입하기 위해 Customer/User Exit(SMOD/CMOD), Enhancement Point(추가)와 Section(대체 OCP 위배 경고), BAdI(인터페이스 다형성 GET/CALL BADI)를 학습하며, Single-use BAdI 의 0개/다중 매칭 에러(`CX_BADI_NOT_IMPLEMENTED` / `CX_BADI_MULTIPLY_IMPLEMENTED`) 방지용 Fallback 클래스 설정, 그리고 미래 S/4HANA 업그레이드를 보증하는 Clean Core Released API 아키텍처 판단력을 기른다"이다.

IT 비전공자 입문자는 `Single-use BAdI` 를 호출(`GET BADI`)하는 현장에서 활성화된 구현 클래스가 아예 없거나(0개) 혹은 2개 이상 중복 존재할 때 터지는 `CX_BADI_NOT_IMPLEMENTED` 캐치 예외 덤프를 미처 예방하지 못해 시스템 셧다운을 내고, 표준 저장 시퀀스 BAdI 내부 한가운데에 무단으로 `COMMIT WORK` 나 `ROLLBACK WORK` 구문을 적어 트랜잭션을 강제 찢어발겨 데이터 오염 덤프를 터트린다.
또한, 표준 코드 일부를 통째로 내 소스로 대체하는 `ENHANCEMENT-SECTION` 을 무분별하게 질러 OCP 원칙을 짓밟고 업그레이드 때 표준 로직 유실 회귀 오류를 겪으며, 겉에 확장 표시가 없는 `Implicit` 지점을 무제한 자유 이용권처럼 남용한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **User/Customer Exit 개념**: userexit INCLUDE 직접 수정의 파괴력을 고발하고, 표준이 나를 호출하는 `CALL CUSTOMER-FUNCTION` 과 `SMOD/CMOD` 활성화 시퀀스 전개.
2. **Enhancement Point vs Section**: 단순히 옆에 끼우는 Point 와, 표준 소스 일부를 대체 교체하는 Section 의 물리적 책임 구분(Section 대체 최소화 경고).
3. **BAdI 인터페이스 계약**: 인터페이스 계약 기반 다형성 확장 기법인 BAdI 정의(`SE18`) 및 구현(`SE19`) 소개.
4. **Single-use BAdI 예외 방어 (Fallback)**: 구현 개수 0개/다수 충돌 시 덤프를 막기 위해, SE18 정의 상에 기본 안전 지지대인 **`Fallback Class`** 를 매핑하는 철칙 수립.
5. **Exit/BAdI 내 트랜잭션 가드**: 표준 데이터 락 및 원본 커밋이 도는 중간이므로, **`COMMIT/ROLLBACK` 호출을 절대 금지**하는 정합성 가이드라인 명세.
6. **Implicit vs Explicit 판단 트리**: BAdI -> Explicit Point -> Section -> Implicit -> Modification 순의 OCP/Clean Core 계약 강도 선택 우선순위 확립.
7. **Clean Core 확장 철학**: Released API, Developer Extensibility 원칙을 적용하여, 업그레이드 때 절대 깨지지 않는 upgrade-stable 패키지 격리 전술 전수.

---

## CH29-L01 - Customer Exit / User Exit 개념

### 왜 필요한가

우리가 지금까지 짠 예약이나 결제 프로그램들은 내가 직접 모든 소스 코드를 생성하고 빌드한 커스텀(Z) 프로그램들이었다.
하지만 실무 현장에 가면 SAP 사가 미리 전 세계 공통용으로 한 치의 오차 없이 견고하게 작성해 둔 "표준 거래 오더 생성 프로그램(`VA01` 등)" 이 상주하고 있다.
이 표준 프로그램 흐름 한가운데에 우리 회사만의 고유한 규칙을 심고 싶다.
- "예매금액이 10만원을 넘어가면 VIP 전용 메모 필드에 기록을 강제로 남기거나 경고를 띄워라."
이때 표준 소스 파일을 에디터로 열어서 내 맘대로 한 줄 비집고 들어가 욱여넣으면, 다음 달 SAP 사가 시스템 버그나 성능 개선을 위해 패치(Upgrade/Note)를 배포해 덮어씌울 때 내가 삽입한 소스 코드가 흔적도 없이 삭제되어 증발하거나 컴파일 에러를 내며 시스템 전체가 굳어버린다.

**표준 소스는 단 1글자도 변경하지 않으면서(Modification 0줄), 표준 프로그램 흐름이 돌다 가 특정 길목(확장 지점)에 도달했을 때 백엔드 엔진이 내 커스텀 코드 상자를 조용히 깨워 실행하고 다시 표준 흐름으로 돌아오게 만드는 기술**이 필요하다. 그것이 **Customer Exit / User Exit** 의 옛 고전 방식이다.

### 무엇인가

#### 1. User Exit (유저 엑시트)
- 주로 SD(영업) 모듈 표준 프로그램의 특정 include 파일 안에 SAP 가 미리 비워놓은 빈 서브루틴(`FORM userexit_...`) 공간이다. 고객은 표준 include 본문 대신 이 비어있는 FORM 내벽만 채워 확장을 완수한다. (매우 오래된 고전 레거시 기법이다.)

#### 2. Customer Exit (커스터머 엑시트)
- 함수 모듈(Function Module)을 경유하는 좀 더 세련된 레거시 확장이다.
- 표준 프로그램 소스에 **`CALL CUSTOMER-FUNCTION '001'`** 이라는 징표가 박혀 있고, 이 자리에 다다르면 **`EXIT_프로그램명_001`** 이라는 빈껍데기 전용 확장 함수가 호출된다.

#### 3. SMOD 와 CMOD
- *엑시트를 활성화하여 잠금을 해제하는 열쇠 기어다.*
- **SMOD (Enhancement 정의 조회)**: SAP 가 표준에 심어둔 Customer Exit 리스트와 빈 함수 껍데기들의 명세 구조를 구경하는 곳이다.
- **CMOD (고객 프로젝트 활성화)**: SMOD 의 정의를 내 고객 프로젝트 주머니에 쓸어 담은 뒤, **`활성화(Activation)` 전원을 켜주어야 비로소 표준 프로그램이 돌다가 CALL CUSTOMER-FUNCTION 을 만났을 때 멈춰 서서 내 확장 함수 코드를 격발**해 준다. (CMOD 에서 켜지 않으면 함수에 백날 소스를 적어봤자 아바 엔진은 그냥 패스하고 스킵한다.)

### 어떻게 확인하는가

CMOD 프로젝트로 SMOD 정의를 감싸 쥐고, CALL CUSTOMER-FUNCTION 흐름을 타는 고전 엑시트 아키텍처를 검증한다.

```abap
" 1. [SAP 표준 소스 영역 - CALL CUSTOMER-FUNCTION 으로 구멍만 뚫어둠]
MODULE user_command_0100 INPUT.
  " 표준 계산 수행...
  CALL CUSTOMER-FUNCTION '001' " 001번 커스터머 엑시트 소집!
    EXPORTING
      im_sales_order = ls_order.
ENDMODULE.
```

```abap
" 2. [고객 구현 함수 영역 - EXIT_SAPLxxxx_001 안방에 내 소스 채우기]
FUNCTION exit_saplxxxx_001.
  " 표준 소스는 0줄 수정! 빈 함수 내부만 깔끔히 활용!
  IF im_sales_order-netwr > 100000.
    " VIP 추가 처리 수행...
  ENDIF.
ENDFUNCTION.
```

#### 체험/시뮬레이터 설계 (User/Customer Exit 활성판)
- **프로세스 플로우**:
  1. 학습자가 [표준 VA01 프로그램 실행 벨트]를 본다. 
  2. 벨트 중앙에 `CALL CUSTOMER-FUNCTION '001'` 이라는 정지 정거장이 있다.
  3. [CMOD 프로젝트 활성화 = OFF] 상태에서 실행하면, 벨트가 정거장에서 멈추지 않고 쓱 미끄러져 지나가 정상 VIP 처리가 스킵되는 무반응을 확인한다.
  4. [CMOD 활성화 = ON] 레버를 올린다. 정거장에 빨간 불이 켜지며 `exit_saplxxxx_001` 함수 칩이 벨트에 위잉 안착되어 VIP 10만원 한도 가드가 안전하게 찰딱 기동하는 피드백을 감상한다.
- **상태 및 데이터**:
  - `SMOD 에서 보기만 하고 CMOD 프로젝트 생성을 누락한 상태` -> 런타임 결과: `Customer function called but project not active. Custom logic bypassed` 하이라이트.
- **피드백**: Customer Exit 은 구현뿐만 아니라 CMOD 활성화라는 바인딩 마침표가 결합해야 비소로 실행됨을 체득한다.

### 실수/주의

- **표준 include 파일의 빈 FORM userexit_... 이 아니라, 그 바깥 영역 표준 소스 코드를 무단 수정(Modification)**:
  - 이 실수 시 다음 패치 패키지 적용 시 수정했던 소스가 통째로 날아가며 예약 먹통 대형 서비스 장애를 유발한다.
  - **표준이 열어준 빈 방(FORM 내부) 밖으로는 1글자도 나가지 않는 절제를 지켜야 한다.**

### 정리

- **`User/Customer Exit`** 은 표준을 건드리지 않고 고객 비즈니스를 심는 1세대 레거시 확장이다.
- Customer Exit 은 **`SMOD`** 에서 엑시트 스펙을 조회하고, **`CMOD`** 에서 활성해야 구동된다.
- 이 방식은 구시대 유산이므로 신규 구현 시엔 가급적 BAdI 나 Enhancement Spot 을 조준한다.

---

## CH29-L02 - Enhancement Point / Section

### 왜 필요한가

Customer Exit 개념을 잡았다.
그런데 이번에는 엑시트 구멍이 없는 꽉 막힌 표준 소스 코드 한가운데가 문제다.
- "표준 include 안방에 Customer Exit 함수 징표(`CALL CUSTOMER-FUNCTION`)가 전혀 안 심어져 있다.
그런데 쌩 표준 코드 50번째 줄과 51번째 줄 사이에 꼭 우리 회사 세금 연산용 소스 2줄을 끼워 넣어야만 세법 정합성이 맞는다."
Customer Exit 방식으로는 SAP 가 미리 함수를 뚫어놓은 명당자리가 아니면 개입이 원천 차단된다. 그렇다고 표준을 뜯어고쳐 칼질(Modification)하자니 업그레이드 폭사 리스크가 뒤따른다.

**표준 소스 임의의 특정 라인 틈새를 칼날로 가르듯 쪼개어 내 코드를 슬그머니 삽입하거나(Point), 아니면 표준 소스 블록 10줄을 아예 통째로 가두어 내 코드 10줄로 대체 교체해 실행하는(Section) 현대적 소스 확장 기술**이 필요하다. 그것이 **Enhancement Point / Section** 의 도킹이다.

### 무엇인가

#### 1. Enhancement Framework (인핸스먼트 프레임워크)
- 표준 소스를 임의의 라인 레벨에서 물리 변경 없이 주사기 바늘 찌르듯 코드를 주입/대체할 수 있게 돕는 2세대 확장 기술이다.

#### 2. Enhancement Point (인핸스먼트 포인트 - 추가)
- 표준 소스 라인 틈새에 내 코드를 슬며시 **'추가'** 로 얹는 기법이다. 
- `ENHANCEMENT-POINT ep_name SPOTS spot_name.` 이라는 명시적 깃발 틈새에 내 커스텀 코드 블록(`ENHANCEMENT ... ENDENHANCEMENT.`)을 끼워 올린다. 표준 코드는 그대로 다 실행되고 내 코드가 추가로 얹혀 안전하다.

#### ⚠️ [ Enhancement Section 대체 로직의 OCP 위배 및 표준 파손 위험 명세]
- *인핸스먼트 기법 중 아키텍처 결합도와 정합성을 가장 난폭하게 깨부수는 고위험 지대다.*
- **`ENHANCEMENT-SECTION` 은 지정된 표준 소스 블록 구간을 무력화하고 "대신 내 커스텀 소스 블록으로 통째 대체(Section Replace)해서 돌려라" 고 지시하는 난폭한 치환 기법이다.**
- **이유**: 내 Section 이 켜지면 원래 SAP 사가 정성껏 짜놓은 안전 가드 표준 코드 10줄이 증발하고 내 소스만 돌기 때문에, **표준 패치 업그레이드 시 SAP 가 원본 10줄 안에 중대한 보안 결함 보완이나 DB 필드 업데이트를 새로 추가해 배포해도, 내 Section 코드가 표준을 덮어쓰고 있기 때문에 그 신규 보완 혜택이 깡그리 누락되어 데이터 유실/정합성 폭사를 유발하는 OCP 파괴의 재앙을 낳는다.**
- **철칙**: Section 대체는 웬만해선 엮어선 안 되며, 가급적 순수 추가 모드인 **Point** 로만 우회 개입해야 업그레이드 전선에서 사수된다.

### 어떻게 확인하는가

표준 Point 자리에 ENHANCEMENT 블록 플러그인을 끼워 넣는 코드를 검증한다.

```abap
" 1. [SAP 표준 영역: ep_calc 라는 명시적 포인트 깃발을 꽂아둠]
SELECT SINGLE seats_total, seats_used FROM zbooking 
  INTO @DATA(ls_book) WHERE booking_id = @iv_id.

ENHANCEMENT-POINT ep_calc SPOTS es_booking_spot.
" 이 틈새 깃발에 아래 고객 인핸스먼트 칩이 물리 변경 없이 찰딱 장착됨!
```

```abap
" 2. [고객 구현 영역: zenh_my_calc 칩 생성 장착]
ENHANCEMENT 1 zenh_my_calc.
  " 표준 SELECT 바로 밑단 틈새에 난입하여, 잔여석 계산 로직을 유연하게 추가!
  DATA(lv_remain) = ls_book-seats_total - ls_book-seats_used.
ENDENHANCEMENT.
```

#### 체험/시뮬레이터 설계 (Enhancement Section 교체판)
- **프로세스 플로우**:
  1. 학습자가 [표준 연산 10줄]이 적힌 전광판을 본다.
  2. [Point 추가 모드]로 칩을 꽂으면, 표준 10줄 밑단 틈새에 내 VIP 혜택 코드 1줄이 안전하게 꼬리를 물고 추가되는 모습을 본다.
  3. 이번엔 [Section 대체 모드]로 내 칩을 꽂는다. 표준 10줄 전광판에 취소선이 좍 그어지며 완전히 회색으로 잠기고, 오직 내 커스텀 코드 5줄만 작동하는 강력한 치환 현상을 목격한다.
  4. 이때 [SAP 표준 업그레이드 패치 격발]을 누르자, 취소된 표준 영역의 핵심 필드 변경 셋업이 무력화되어 시스템 불일치 경보가 뜨는 무시무시한 피드백을 감상한다.
- **상태 및 데이터**:
  - `Section 대체를 장착하고도 회귀 통합 테스트를 누락한 상태` -> 런타임 결과: `Standard security updates bypassed. Section replace error` 경고 사이렌 작동.
- **피드백**: Section 대체는 표준의 책임을 내가 독박 쓰는 일이므로, 극도의 절제 하에 Point 추가 위주로만 개입해야 함을 배운다.

### 실수/주의

- **Explicit Point 가 없다고 implicit(암묵적) 자리에 무작정 대형 로직을 난사**:
  - implicit(암묵적) 지점은 표준 눈에 안 보이고 깃발도 없어서 패치 시 틈새 줄 번호가 꼬이거나 구조가 바뀔 때 아무 컴파일 에러도 없이 동작이 뚝 끊겨 묵사발 나기 쉽다.
  - **언제나 BAdI 와 Explicit Point 명시 지점을 1순위로 조회하고 정석 진입해야 한다.**

### 정리

- **`Enhancement Point`** 는 표준 라인 사이에 내 코드를 안전하게 끼워 **추가**한다.
- **`Enhancement Section`** 은 표준 구간을 내 코드로 통째로 **대체**하여 OCP 위기를 초래한다.
- 소스 코드 수정 없이 Plug-in 을 꽂지만, 되도록 Point 추가 방식을 고수한다.

---

## CH29-L03 - BAdI 정의와 구현

### 왜 필요한가

소스 라인에 개입하는 인핸스먼트 포인트까지 마스터했다.
그런데 이번에는 여러 개의 비즈니스 다변화 분기가 골칫거리다.
- " 한국 사업부, 미국 사업부, 일본 사업부별로 예매 한도 검증 로직이 각각 180도 다르게 돌아가야 한다."
기존 Customer Exit 이나 Enhancement Point 방식을 쓰면, 그 안방에서 `IF 국가 = 'KR'. ... ELSEIF 국가 = 'US'. ... ENDIF.` 와 같이 거대하고 복잡한 분기 CASE 사다리 코드를 욱여넣어야 한다.
한국 로직을 수정하려고 엑시트 파일을 열어 코드를 만지다가, 아무 상관 없던 미국 사업부의 연산 괄호가 꼬여 미국 법인의 VA01 표준 오더 저장이 먹통이 되는 정합성 전염 대참사를 유발한다.

**표준 프로그램은 단순히 인터페이스 명세(계약)만 쳐다보고 호출(GET/CALL BADI)하고, 국가/사업부별 독립된 가짜/실체 구현 클래스(SE19)들을 장난감 조립 블록칩처럼 부착하여, 필터(Filter) 조건에 맞춰 엔진이 알아서 다형성 구현체를 찾아 안전하게 조율 실행해 주는 기술**이 필요하다. 그것이 **[[BAdI]] (Business Add-In)** 의 개설이다.

### 무엇인가

#### 1. BAdI (Business Add-In - 비즈니스 애드인)
- 표준과 고객 사이를 인터페이스 다형성으로 분리 연결하는 객체지향(OO) 2.0 세대 표준 확장 기술이다. (Customer Exit 의 최신식 진화형이다.)

#### 2. GET BADI 와 CALL BADI
- **GET BADI**: BAdI 인스턴스 칩을 준비시키는 시퀀스다.
- **CALL BADI**: BAdI 인터페이스에 뚫려 있는 메서드(예: `check_booking`)를 호출하는 최종 트리거다.

#### ⚠️ [ Single-use BAdI 의 0개/다중 구현 덤프 제약 및 Fallback Class 설계 명세]
- *BAdI 아키텍처 설계 시 입문자들이 가장 뼈아프게 시스템 덤프를 터트리는 BAdI 전용 컴파일 장벽이다.*
- BAdI 정의 시 **Single-use** (단 1개의 활성 구현체만 허용)로 지정해 둔 지점이 있다.
- **덤프 유발**: 표준 프로그램이 `GET BADI` 를 격발하는 순간, 시스템 상에 활성화된 구현체가 **아예 없거나(0개)**, 혹은 여러 부서가 욕심내어 구현을 2개 이상 만들어두어 **중복 매칭(Multiple)** 되면 즉시 **`CX_BADI_NOT_IMPLEMENTED` 또는 `CX_BADI_MULTIPLY_IMPLEMENTED` 캐치 예외가 터지며 트랜잭션이 폭사**한다.
- **방어선 (Fallback Class)**: 구현체가 0개여도 시스템이 다운되지 않고 얌전하게 기본 동작을 타도록, BAdI 정의 SE18 상에 **"구현 클래스가 없으면 이 기본 대체 클래스를 강제 실행해라" 고 Fallback Class 를 의무 매핑**해 주어야 안전망이 수호된다.

#### ⚠️ [ BAdI/Exit 내 COMMIT WORK 및 ROLLBACK WORK 금지 철칙 명세]
- *표준 저장 시퀀스 도중 DB 트랜잭션 롤백 대형 사고를 차단하는 정합성 철칙이다.*
- BAdI 나 User Exit 은 표준의 DB 업데이트 및 커밋 프로세스 한가운데에서 불려 돌아간다.
- **만약 내 BAdI 메서드 구현부 소스 코드 안에서 직접 `COMMIT WORK` 나 `ROLLBACK WORK` 문을 기재하면, 표준이 쥐고 있던 업데이트 락 큐가 임의로 조기 확정되거나 풀려버려 표준 DB 정합성이 찢어지는 치명적인 런타임 덤프가 터진다.**
- **철칙**: 확장의 내벽에서는 **오직 값 계산과 에러 판정만 하고, 트랜잭션 확정(COMMIT/ROLLBACK) 결정권은 절대 건드리지 않고 표준의 손에 전적으로 위임**해야 무결하다.

### 어떻게 확인하는가

GET BADI 로 인스턴스를 얻고 CALL BADI 로 인터페이스 다형성 메서드를 부르는 정석 소스를 검증한다.

```abap
" 1. [SAP 표준 영역 - BAdI 인터페이스 계약 기반 호출]
DATA lo_badi TYPE REF TO zperf_badi_check.

" BAdI 칩 확보 (국가 필터 장착)
GET BADI lo_badi
  FILTERS country = 'KR'.

" BAdI 인터페이스 check_booking 메서드 호출
" (구현 클래스가 KR 필터로 SE19 에 활성화되어 있다면 그것이 다형성 격발!)
CALL BADI lo_badi->check_booking
  EXPORTING
    is_booking = ls_booking.
```

```abap
" 2. [고객 구현 영역 - SE19 로 생성된 클래스 내부]
METHOD zif_ex_perf_badi_check~check_booking.
  " [★ COMMIT WORK 또는 ROLLBACK WORK 절대 엄금!]
  " 오직 순수한 값 유효성 체크 및 메시지 반환만 집중!
  IF is_booking-seats > 10.
    " 초과 에러 반환...
  ENDIF.
ENDMETHOD.
```

#### 체험/시뮬레이터 설계 (BAdI Spot 장착판)
- **프로세스 플로우**:
  1. 학습자가 [BAdI Spot 소켓]을 본다.
  2. [KR 요금 검증 칩 (Filter = KR)] 을 슬롯에 가져다 댄다.
  3. 표준이 `country = 'KR'` 로 호출하자, KR 칩만 노란색 불이 들어오며 계산을 완수하고, `US` 필터 호출 시엔 칩이 반응하지 않고 Fallback 기본 클래스가 녹색 불로 부드럽게 통과하는 다형성 스왑 모션을 본다.
  4. 이때 [KR 칩을 중복으로 2개 활성화 테스트] 해 본다. `CX_BADI_MULTIPLY_IMPLEMENTED` 경보음이 울리며 소켓이 빨간 불로 차단되는 에러 피드백을 감상한다.
- **상태 및 데이터**:
  - `BAdI 내부에 COMMIT WORK 문을 한 줄 우회 삽입해 둔 상태` -> 런타임 결과: `Transaction sync broken. COMMIT WORK within BAdI is illegal. Crash Dump` 경보 작동.
- **피드백**: BAdI 는 느슨하게 조립되는 인터페이스 결합판이므로, 트랜잭션 독자 커밋과 Single-use 중복 규칙을 사수해야 함을 배운다.

### 실수/주의

- **필터 BAdI 구현 시, Filter Value 매핑 대소문자 오타**:
  - 필터 값에 소문자로 `kr` 이라 적어두었는데 표준이 대문자 `KR` 로 호출하면, 백날 구현을 켜두어도 매칭을 찾지 못해 Fallback 으로 우회 통과되어 내 비즈니스가 씹히는 현상을 겪는다.
  - **필터 값 매핑 시에는 대소문자와 공백 정합성을 필사적으로 확인해야 한다.**

### 정리

- **`BAdI`** 는 인터페이스 계약을 맺고 표준과 고객을 느슨하게 격리 결합하는 최적의 OO 확장이다.
- **`GET BADI`** 로 인스턴스 칩을 소집하고 **`CALL BADI`** 로 다형성 계약을 실행한다.
- Single-use 덤프 차단을 위해 반드시 **`Fallback Class`** 안전 지지대를 조립해 둔다.
- BAdI 내부에서는 절대로 **`COMMIT/ROLLBACK`** 트랜잭션을 쌩으로 기재하지 않는다.

---

## CH29-L04 - Implicit / Explicit Enhancement 판단

### 왜 필요한가

BAdI 정의와 구현까지 완료했다.
그런데 막상 실무 기획 요구사항을 받으면 눈앞이 캄캄해진다.
- "사용자 변경 시 오더 데이터를 검증하라는데, 이 표준 트랜잭션에 BAdI 도 없고 Explicit Point 도 깃발이 안 꽂혀 있다. 
어디를 비집고 들어가 무슨 확장 도구로 칼을 들이밀어야 하는가?"
마음만 급해서 가장 손쉬운 '표준 소스 통째 개조(Modification)' 부터 지르면 당장은 1시간 만에 개발이 끝나 기쁘지만, 내년에 장비 패치할 때 복구 복사 노가다 공수가 수백 시간에 달해 프로젝트가 파멸한다.
확장 도구들의 성격과 계약의 견고함을 훤히 꿰뚫고, 가장 안정한 계약부터 최후의 수단까지 깔끔한 선택 순서 지도를 머릿속에 이정표로 꽂아두어야 한다.

**안전하고 업그레이드에 강한 우선순위 기준(BAdI -> Explicit Point -> Section -> Implicit -> Modification)에 따라 한 단계씩 검문 필터링하며 최적의 확장 도구를 낙찰해 내는 기술**이 필요하다. 그것이 **Implicit / Explicit Enhancement 의 판단**이다.

### 무엇인가

#### 1. Explicit Enhancement (명시적 확장)
- SAP 사가 대놓고 "여기 고객 님들 소스 심으세요" 라고 깃발 꽂아 의도적으로 배려해 둔 공식 확장 구역이다. (BAdI 와 Explicit Point 가 이에 속하며, 가장 안전하고 권장된다.)

#### 2. Implicit Enhancement (암묵적/묵시적 확장)
- *표준 소스에 겉보기엔 아무 확장 표시 깃발이 없는데도 컴파일러가 자동 배려해 제공하는 숨겨진 틈새 구멍이다.*
- 에디터 상에서 'Show Implicit Enhancement' 옵션을 켜야 비로소 보이며, 주로 **클래스 메서드의 시작/끝, 함수(Function) 시작/끝, FORM 서브루틴의 시작/끝** 줄 틈새가 이에 해당한다.
- **경고**: 강력하지만, SAP 가 공식적으로 파라미터 규격을 보증한 징표가 아니므로 표준 패치 시 해당 메서드가 삭제되거나 변수명이 바뀌면 내 인핸스먼트가 허공에 떠서 컴파일 덤프를 때리는 주원인이 된다.

#### 🧭 [ 안전한 확장 수단 선택 5단계 우선순위 지도 명세]
우리는 어떤 표준 확장을 마주하든, 아래의 5단계 정석 수순을 순차적으로 밟아 아키텍처를 낙찰한다.

```text
[1순위] BAdI (인터페이스 다형성) :
   가장 강력한 업그레이드 내성(Released API)과 필터 조립 지원. BAdI 인터페이스가 있다면 무조건 1순위 적용!
   │
   ├── [BAdI 가 없다면?]
   ▼
[2순위] Explicit Point (명시적 추가) :
   SAP 가 공식 깃발(SPOTS)을 꽂아둔 지점에 코드를 추가 삽입.
   │
   ├── [명시적 포인트도 없다면?]
   ▼
[3순위] Explicit Section (명시적 대체) :
   SAP 가 공식 대체를 허용한 구간을 내 소스로 교체. (표준 소스 소멸 리스크가 있으니 극도 신중!)
   │
   ├── [명시적 교체 구간도 없다면?]
   ▼
[4순위] Implicit (암묵적 시작/끝) :
   메서드나 함수의 맨 첫 줄 또는 맨 끝 줄 숨겨진 틈새를 찾아 칩을 장착. (업데이트 패치 시 꼬임 주의!)
   │
   ├── [어떠한 묵시적 틈새도 작동 안 된다면?]
   ▼
[5순위] Modification (최후의 강제 개조) :
   시스템에 라이선스 키를 등록하고 표준 본문을 강제로 뜯어고침. (운영 원가 폭증 및 업그레이드 불가 최후 보루!)
```

### 어떻게 확인하는가

확장 우선순위 지도를 따라가며 상황별로 적절한 도구를 낙찰받는 로직을 검증한다.

```text
Q1. 표준 검증 구조 상에 BAdI (zif_booking_check) 인터페이스가 공식 제공되는가?
   -> Yes: 고민할 것 없이 SE19 에서 BAdI 구현 클래스를 생성하여 낙찰 완료! (1순위 통과)

Q2. BAdI 는 없으나 ENHANCEMENT-POINT ep_save 가 눈에 보이는가?
   -> Yes: Point 구현 칩을 만들어 ep_save 에 안전 삽입 낙찰! (2순위 통과)

Q3. 아무 깃발도 없으나 함수의 맨 마지막 ENDFUNCTION 바로 전 줄에 코드를 얹고 싶은가?
   -> Yes: Implicit Enhancement 옵션을 켜고 함수 끝단 틈새에 코드 장착 낙찰! (4순위 통과)
```

#### 체험/시뮬레이터 설계 (확장 판단 의사결정 트리)
- **프로세스 플로우**:
  1. 학습자가 [세법 검증 로직 추가] 라는 미션을 받는다.
  2. 화면의 [우선순위 룰렛]이 돌아간다.
  3. 학습자가 귀찮다고 [5단계 Modification 개조] 버튼을 바로 누르자, "운영 유지보수 경보 발생! 내년 패치 비용 500% 증가!" 적색 사이렌이 울린다.
  4. 뒤로가기 해서 다시 [1단계 BAdI 조회 -> KR_TAX_BADI 존재 확인 -> BAdI 구현 장착] 을 고르자, 초록색 합격등과 함께 "Clean Core 등급 100% 통과" 팡파르 피드백이 울리는 쾌감을 체득한다.
- **상태 및 데이터**:
  - `BAdI 가 명확히 존재함에도 우회하여 Implicit 을 쌩으로 꽂아 넣은 상태` -> 런타임 결과: `Clean Core Violation. Legacy implicit bypass detected` 경고 하이라이트.
- **피드백**: 확장 판단은 기술의 기교가 아니라, 시스템의 수명을 늘리는 정석 우선순위 가이드라인 사수에 있음을 깨닫는다.

### 실수/주의

- **Modification(표준 강제 개조)을 단행하면서, 주석으로 "왜 개조했는지, 기존 코드는 무엇이었는지" 기록을 생략**:
  - 패치 기사가 들어와서 "이거 쌩 표준 코드인데 왜 정체불명의 Z코드가 박혀있지?" 하고 싹 지워버려 예약 한도 가드가 뚫리는 대재앙을 겪는다.
  - **최후의 보루로 개조를 할 때는 반드시 Z주석 펜스를 치고 일자, 작성자, 사유를 역사 책 쓰듯 명세해야 한다.**

### 정리

- 확장 수단은 **`BAdI -> Explicit Point -> Explicit Section -> Implicit -> Modification`** 순서로 밟는다.
- **`Implicit`** 은 겉보기 깃발은 없으나 함수/메서드의 시작/끝 틈새에 자동 개설되는 구멍이다.
- Modification(표준 개조)은 시스템 원가를 훼손하므로 반드시 **`예외 심사`** 를 거쳐 최후에 단행한다.

---

## CH29-L05 - Clean Core 관점의 확장 기준

### 왜 필요한가

인핸스먼트 우선순위 필터링까지 마스터했다.
이제 객체 지향 고급 설계의 최종 피날레인 '클라우드 친화성(Clean Core)' 의 철학을 마주한다.
" 지금 장비는 On-premise(자체 구축 서버) 라서 마음껏 표준 테이블을 SQL 로 쌩으로 찌르고 비공개 클래스를 가져다 써도 컴파일이 잘 된다.
그런데 3년 뒤 회사가 SAP S/4HANA Public Cloud(클라우드 장비) 로 이전을 결정했다."
이전을 하려고 장비를 올리는 순간, 기존에 짰던 수천 개의 비정석 인핸스먼트 코드들이 "클라우드 보안 및 Released API 규격 미준수" 판정을 받아 단 1개도 컴파일되지 못하고 몽땅 에러를 뿜으며 주저앉는다. 시스템 전체 Z코드를 처음부터 다시 다 짜야 하는 수십억 원대 폐기물 참사가 난다.

**지금 당장 On-premise 환경일지라도 미래 클라우드 전환을 염두에 두고, 오직 SAP 가 공식 약속한 Released API 와 Released BAdI 로만 결합 배선하며, 고객 확장 코드는 깔끔하게 전용 패키지로 격리하는 미래형 선진 아키텍처 기술**이 필요하다. 그것이 **Clean Core 관점의 확장 기준** 사수다.

### 무엇인가

#### 1. Clean Core (클린 코어 원칙)
- 표준의 본체 핵심 영역은 새하얗고 깨끗하게 오염 없이 유지하고, 고객의 확장은 오직 공식적으로 뚫어준 투명한 문(Released API)을 통해서만 매칭해 시스템 유연성을 극대화하자는 SAP 의 최신 아키텍처 표준이다.

#### 2. Released API (공개 보증 API)
- *SAP 가 "이 객체와 이 클래스 메서드는 클라우드 패치나 업그레이드 때도 절대 이름을 바꾸거나 파괴하지 않고 평생 동일한 스펙을 보증하겠다" 고 공증해 준 명세 계약이다.*
- 이 마크가 없는 비공개 표준 객체에 내 코드가 끈적하게 달라붙어 쌩 SQL 을 찌르기 시작하면, 업그레이드 시 예고 없이 폭사한다.

#### 3. Developer Extensibility (개발자 확장성)
- ABAP Cloud 개발 환경(ADT)에서 오직 Released API 와 Released Extension Spot 만 사용하여 빚어내는, **업그레이드에도 절대 깨지지 않는 무결성(Upgrade-stable) 커스텀 코드 영역**이다.

### 어떻게 확인하는가

Clean Core 에 맞는 Released BAdI 와 API 만 조립해 격리 패키지에 담는 아키텍처를 검증한다.

```abap
" 1. [Clean Core 위배 (Classic 레거시 예시) - 비공개 표준 테이블 직접 SELECT]
" zcl_my_check 클래스 내부
METHOD check.
  " SAP 표준 비공개 테이블 (kna1 등) 을 SQL 로 직접 쌩으로 SELECT 하는 행위!
  " (테이블 구조가 클라우드에서 바뀌면 내 로직도 즉각 폭사)
  SELECT SINGLE name1 FROM kna1 INTO @rv_name WHERE kunnr = @iv_kunnr.
ENDMETHOD.
```

```abap
" 2. [Clean Core 준수 (Modern Cloud 예시) - Released API 래퍼 경유]
" zcl_my_check_cloud 클래스 내부
METHOD check_cloud.
  " SAP 가 공식 보증한 Released API 클래스 메서드를 경유해 안전 획득!
  " (내부 테이블이 어떻게 바뀌든 SAP 가 API 리턴값을 평생 책임짐)
  rv_name = cl_customer_api=>get_name( iv_kunnr = iv_kunnr ).
ENDMETHOD.
```

#### 체험/시뮬레이터 설계 (Clean Core 친화 판별 퀴즈)
- **프로세스 플로우**:
  1. 학습자가 [3개의 소스 코드 카드]를 본다.
     - A 카드: `Released API 인 cl_abap_typedescr 로 데이터 타입 확인`
     - B 카드: `비공개 표준 테이블인 kna1 을 직접 SELECT 쿼리`
     - C 카드: `Implicit 으로 표준 PBO 중간에 변수 값 직접 변조`
  2. [클라우드 업그레이드 시뮬레이션] 단추를 누른다.
  3. B 와 C 카드는 "Released API 미준수! 컴파일 거절!" 폭탄 아이콘이 뜨며 깨진다.
  4. A 카드만 무사 통과하여 ✓ 초록색 안정성 사인이 켜지는 미래지향성 시각 피드백을 감상한다.
- **상태 및 데이터**:
  - `비공개 표준 테이블을 직접 JOIN 하여 뷰를 짠 상태` -> 런타임 결과: `Clean Core Score: 30% (Poor). High upgrade risk warning` 빨간색 하이라이트.
- **피드백**: Clean Core 는 단순히 구호가 아니라, 유지보수 비용을 제로화하기 위한 실질적인 Released API 매칭 약속임을 체득한다.

### 실수/주의

- **"우리 회사는 어차피 On-premise 만 평생 쓸 거니까 상관없어" 하고 비공개 표준 데이터 구조를 무분별하게 조작**:
  - SAP 패치 한 번 돌릴 때마다 수십억짜리 시스템 가동이 멈춰 Z코드 복구 노가다 지옥에 팀 전체가 야근하는 고질적 재앙의 늪에 빠지게 된다.
  - **classic 환경일지라도 Clean Core Released API 계약을 추구하여 시스템을 건강하게 빚어야 한다.**

### 정리

- **`Clean Core`** 는 표준을 깨끗이 지키고, 확장은 **`Released API (공개 보증 계약)`** 로 격리한다.
- 비공개 테이블이나 클래스를 직접 찌르면 미래 업그레이드 시 예고 없이 폭사한다.
- **`Developer Extensibility`** 는 ADT 에서 공식 릴리즈된 구멍만 다루는 미래형 아키텍처다.
