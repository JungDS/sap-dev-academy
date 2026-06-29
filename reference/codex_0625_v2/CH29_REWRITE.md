# CH29_REWRITE - Enhancement / BAdI / User Exit

> 기준 자료: `content/abap/CH29`, `reference/codex_0625/CH29_Enhancement-BAdI-User-Exit.md`, `reference/codex_0625/00_QUALITY_REVIEW.md`
> 재집필 목표: 표준 SAP 코드를 직접 고치지 않고 고객 요구를 넣는 방법을, 입문자가 "어디를 건드려야 하고 어디를 건드리면 안 되는지" 판단할 수 있을 만큼 완성 강의자료로 설명한다.
> Classic-first 경계: 이 장은 Classic ABAP 환경의 User Exit, Customer Exit, Enhancement Framework, BAdI를 먼저 다룬다. ABAP Cloud, RAP, Released API는 CH29-L05의 Clean Core 판단 기준으로만 사용하고, RAP 구현이나 Cloud 확장 구현 절차로 넘어가지 않는다.

## CH29 전체 강의 지도

CH28까지는 내가 만든 프로그램, 내가 만든 화면, 내가 만든 ALV 안에서 데이터를 읽고 보여 주고 검증하는 일이 중심이었다. CH29부터는 상황이 달라진다. 현업에서 자주 만나는 요구는 "SAP 표준 판매오더 저장 시점에 우리 회사 규칙을 하나 더 검사해 주세요", "구매오더 승인 전에 특정 필드를 보강해 주세요", "표준 계산 결과를 그대로 두되 특정 조건에서만 메시지를 추가해 주세요"처럼 표준 프로그램의 흐름 한가운데에 들어가야 하는 요구다.

이때 초보자가 가장 위험하게 착각하는 지점은 "표준 프로그램도 ABAP 소스니까 열어서 고치면 되는 것 아닌가?"이다. 그 방식은 modification, 즉 표준 객체 자체 변경에 가깝다. 당장은 빠르게 보이지만 업그레이드, 패치, SAP 지원, 원인 분석, 테스트 책임이 모두 고객 쪽으로 무겁게 돌아온다. CH29의 핵심 문장은 하나다. 표준을 고치는 사람이 아니라, 표준이 마련해 둔 확장 지점을 찾아서 내 코드를 꽂는 사람이 되어야 한다.

레슨의 진행 순서는 일부러 역사 순서와 판단 순서를 함께 따른다.

| 레슨 | 주제 | 학습 초점 | 대표 확인 지점 |
| --- | --- | --- | --- |
| CH29-L01 | User Exit / Customer Exit | 오래된 확장 방식의 구조와 한계 | `FORM`, `CALL CUSTOMER-FUNCTION`, `FUNCTION EXIT_...`, `SMOD`, `CMOD` |
| CH29-L02 | Enhancement Point / Section | Enhancement Framework의 소스 코드 확장 | `ENHANCEMENT-POINT`, `ENHANCEMENT-SECTION`, `ENHANCEMENT ... ENDENHANCEMENT` |
| CH29-L03 | BAdI 정의와 구현 | 객체지향 인터페이스 기반 확장 | `GET BADI`, `CALL BADI`, `SE18`, `SE19`, filter |
| CH29-L04 | Implicit / Explicit Enhancement 판단 | 어떤 확장 수단을 먼저 찾을지 결정 | BAdI > Explicit > Implicit > Modification |
| CH29-L05 | Clean Core 관점 | 업그레이드 안정성과 Cloud-ready 사고 | Released API, Key User Extensibility, Developer Extensibility |

공식 근거는 `C:\ABAP_DOCU_HTML`에서 수동 확인했다. Customer Exit는 `abapcall_customer-function.htm`, `abencustomer_exit_glosry.htm`, 오래된 FORM 기반 User Exit 설명은 `abapform_definition.htm`을 경계 근거로 삼았다. Enhancement Framework는 `abenenhancement_framework.htm`, `abapenhancement-point.htm`, `abapenhancement-section.htm`, `abenexplicit_enh_points.htm`, `abenimplicit_enh_points.htm`를 확인했다. BAdI는 `abenbadi_glosry.htm`, `abenbadi_enhancement.htm`, `abapget_badi.htm`, `abapcall_badi.htm`, `abapinterface_definition.htm`를 확인했다. Clean Core 경계는 `abenabap_cloud_glosry.htm`, `abenabap_for_cloud_dev_glosry.htm`, `abenabap_for_key_users_glosry.htm`, `abenreleased_api_glosry.htm`, `abendev_extensibility_glosry.htm`를 기준으로 정리했다.

R15 게이팅 기준으로 CH29는 CH10의 함수 모듈, CH18~CH20의 클래스와 인터페이스, CH23의 품질/구조 관점을 이미 지나온 뒤에 배치된다. 그래서 BAdI의 인터페이스 기반 호출과 Clean Core 판단은 다룰 수 있다. 다만 이 장에서는 IDoc, RFC, BAPI, OData, RAP behavior 구현 같은 연동·Cloud 구현 세부로 확장하지 않는다.

## CH29-L01 - Customer Exit / User Exit 개념

### 왜 필요한가

표준 프로그램에는 고객마다 다른 업무 규칙을 전부 미리 넣을 수 없다. 어떤 회사는 판매오더 저장 전에 VIP 고객 메모를 남겨야 하고, 어떤 회사는 특정 자재 조합을 금지해야 하며, 어떤 회사는 출고 문서 생성 직전에 자체 번호 체계를 검증해야 한다. SAP가 모든 회사의 규칙을 표준 소스 안에 직접 넣으면 표준은 유지될 수 없다.

그래서 오래된 SAP 확장 방식은 "표준 흐름 안에 빈 자리"를 마련해 두었다. 표준 프로그램은 평소처럼 자기 일을 하다가 특정 위치에서 고객 코드가 들어올 수 있는 자리를 호출한다. 고객은 표준 프로그램 본문을 고치지 않고, 그 빈 자리에 자기 로직을 채운다. 이 방식이 User Exit와 Customer Exit를 이해하는 출발점이다.

입문자에게 중요한 감각은 "내가 표준을 호출하는 것이 아니라 표준이 나를 호출한다"는 점이다. 일반 프로그램에서는 내가 `CALL FUNCTION`으로 기능을 호출한다. 하지만 exit에서는 표준 프로그램이 자기 흐름 중간에 고객 확장 지점을 호출하고, 활성화된 고객 구현이 있으면 그 구현이 실행된다. 그래서 exit를 찾을 때는 "어느 표준 프로그램이 어느 시점에 어떤 exit를 제공하는가"를 먼저 확인해야 한다.

### 무엇인가

User Exit는 넓은 의미로 SAP 표준 흐름에 고객 로직을 넣는 오래된 확장 자리를 가리키는 말로 많이 쓰인다. 특히 SD 같은 오래된 영역에서는 표준 include 안의 `FORM userexit_...` 형태를 자주 만난다. 공식 ABAP 문서에서 `FORM` 서브루틴 정의 자체는 오래된 문법으로 분류되므로, 신규 설계에서 아름다운 모델로 받아들이기보다 레거시 표준을 읽는 기술로 이해해야 한다.

Customer Exit는 조금 더 구체적이다. SAP 표준 프로그램이 `CALL CUSTOMER-FUNCTION`으로 함수 모듈 exit를 호출하고, 고객은 `FUNCTION EXIT_...` 형태의 함수 모듈 안에 로직을 작성한다. SAP 문서 기준으로 이 함수 모듈 exit는 `SMOD`에서 SAP가 제공한 enhancement를 확인하고, 고객 시스템에서는 `CMOD` 프로젝트로 선택·그룹화·활성화한다. 활성화되지 않은 customer exit는 호출 위치가 있어도 실행되지 않는다.

개념 코드는 다음처럼 읽으면 된다. 첫 번째 코드는 SAP 표준 쪽 호출 위치를 단순화한 예시이고, 두 번째 코드는 고객 구현 쪽 자리다.

```abap
" SAP standard program side: simplified reading example
CALL CUSTOMER-FUNCTION '001'
  EXPORTING
    is_sales_order = ls_sales_order.
```

```abap
" Customer function exit side: customer-owned implementation body
FUNCTION exit_saplxxxx_001.
  " Validate or enrich data at the prepared standard hook.
  IF is_sales_order-netwr > 100000.
    " Add customer-specific check, message, or data preparation.
  ENDIF.
ENDFUNCTION.
```

여기서 눈여겨볼 단어는 `EXIT_...`, `SMOD`, `CMOD`, activation이다. 소스에 함수 모듈 exit가 있어도 CMOD 프로젝트가 활성화되지 않으면 실행되지 않는다. 또 SAP 문서에서도 customer exit와 CMOD 방식은 현재 관점에서는 obsolete에 가깝고, BAdI나 Enhancement Framework가 대체 방향으로 제시된다. 그렇다고 현업에서 사라졌다는 뜻은 아니다. 오래 운영된 ECC 또는 전환 프로젝트에서는 여전히 읽고 판단해야 한다.

### 어떻게 확인하는가

첫 번째 확인은 요구 시점이다. "판매오더 저장 직전", "납품 생성 직후", "전표 번호 채번 전"처럼 표준 흐름의 어느 순간이 필요한지 문장으로 고정한다. 시점을 고정하지 않으면 exit 이름만 검색하다가 엉뚱한 곳에 로직을 넣기 쉽다.

두 번째 확인은 제공된 확장 지점이다. 해당 업무 영역에서 `SMOD`로 enhancement를 찾고, 설명과 component 목록에서 `EXIT_...` 함수 모듈이 요구 시점과 맞는지 본다. 프로젝트가 이미 있으면 `CMOD`에서 해당 enhancement가 어떤 프로젝트에 들어 있는지, 활성화 상태인지, 운송 요청이 어떻게 묶였는지 확인한다. 이미 활성화된 프로젝트가 있다면 새 프로젝트를 만들기 전에 같은 enhancement를 중복 구현할 수 있는지부터 검토해야 한다.

세 번째 확인은 실행 흔적이다. 디버깅에서는 표준 프로그램이 `CALL CUSTOMER-FUNCTION`에 도달하는지, 해당 exit가 활성화되어 함수 모듈 안으로 들어가는지 본다. 활성화되지 않은 customer exit는 표준 호출 위치가 있어도 내 구현으로 들어오지 않는다. 따라서 "코드를 작성했는데 실행되지 않는다"는 문제의 절반은 로직 오류가 아니라 활성화 또는 프로젝트 연결 문제다.

네 번째 확인은 변경 범위다. 표준 include를 직접 수정했는지, customer function module의 include 또는 고객 영역에만 작성했는지 확인한다. CH29에서 원하는 결과는 "표준 소스 변경 0줄"이다. 이 문장을 확인 항목으로 삼으면 exit를 쓰는 목적이 흐려지지 않는다.

### 실수와 주의

가장 큰 실수는 User Exit라는 이름을 들었다는 이유로 표준 include를 바로 열어 수정하는 것이다. 예전 프로젝트에서는 그런 흔적이 실제로 남아 있을 수 있지만, 학습자는 그것을 모범 답안으로 배워서는 안 된다. 표준 객체를 직접 바꾸면 업그레이드 때 충돌이 생기고, SAP Note 적용이나 패치 이후 원인 분석도 어려워진다.

두 번째 실수는 `SMOD`와 `CMOD`의 역할을 섞는 것이다. `SMOD`는 SAP가 제공한 enhancement 정의를 보는 곳이고, `CMOD`는 고객 프로젝트로 선택하고 활성화하는 곳이다. "SMOD에서 봤으니 구현된 것"이 아니다. 반드시 고객 프로젝트와 activation을 확인해야 한다.

세 번째 실수는 obsolete 경계를 무시하는 것이다. Customer Exit는 레거시 시스템에서 중요하지만 신규 확장 요구를 받을 때는 먼저 BAdI나 명시적 enhancement point가 있는지 확인해야 한다. 특히 같은 업무 시점에 BAdI가 존재한다면 Customer Exit보다 BAdI가 더 구조적이고 테스트하기 쉬울 가능성이 크다.

네 번째 실수는 exit 안에 너무 많은 업무를 몰아넣는 것이다. exit는 표준 흐름 중간에서 호출되므로 느린 SELECT, 외부 통신, 화면 의존 로직, 예외 처리 없는 업데이트를 넣으면 표준 트랜잭션 전체가 불안정해진다. exit 안에는 판단과 위임을 두고, 복잡한 로직은 별도 Z 클래스나 함수로 분리해 테스트 가능한 구조로 만드는 편이 좋다.

### 체험형 학습 설계

`CH29-L01-S01`은 "User/Customer Exit - 빈 자리에 내 코드" 시뮬레이터로 설계한다. 화면은 왼쪽에 표준 판매오더 처리 흐름, 가운데에 빈 slot, 오른쪽에 고객 구현 결과를 둔다. 기본 상태는 `확장 적용 OFF`이며, 실행 버튼을 누르면 표준 흐름만 지나가고 결과 배지에 `표준 소스 변경 0줄`, `고객 로직 실행 안 됨`을 표시한다.

학습자가 `확장 적용 ON` 토글을 켜면 가운데 slot에 `FORM userexit_save_document_prepare` 또는 `FUNCTION EXIT_SAPLXXXX_001`이 꽂히는 시각 효과를 보여 준다. 다시 실행하면 동일한 표준 흐름이 유지되면서 오른쪽 로그에 `VIP 메모 추가`, `검증 메시지 생성`, `CMOD project active` 같은 실행 결과가 나타난다. 핵심 피드백은 "표준 흐름은 그대로인데 고객 로직만 추가되었다"이다.

버튼은 네 가지가 필요하다. `표준만 실행`은 exit 비활성 상태를 보여 준다. `CMOD 활성화`는 고객 구현이 실행되는 상태로 바꾼다. `표준 소스 수정 시도`는 경고 상태를 띄우고 결과를 실패로 표시한다. `디버그 흐름 보기`는 `CALL CUSTOMER-FUNCTION -> EXIT_... -> 결과 반환` 순서를 단계별로 강조한다. 상태 배지는 `Inactive`, `Active`, `Direct modification blocked`, `Upgrade risk`로 나눈다.

데이터는 간단하게 `customer = VIP`, `netwr = 120000`, `memo = blank`인 판매오더 한 건을 사용한다. 피드백은 "활성화 전에는 메모가 비어 있음", "활성화 후에는 고객 exit가 메모를 채움", "표준 수정 시도는 금지"처럼 상태 차이를 바로 읽게 만든다. 입문자는 이 실습으로 exit의 존재 이유를 말보다 먼저 눈으로 확인한다.

### 정리

User Exit와 Customer Exit는 표준 프로그램을 직접 고치지 않고 고객 로직을 넣기 위한 오래된 확장 방식이다. Customer Exit는 `CALL CUSTOMER-FUNCTION`, `FUNCTION EXIT_...`, `SMOD`, `CMOD`, activation 흐름으로 이해하면 된다.

다만 이 방식은 레거시 이해 능력으로 중요하지, 신규 확장의 최우선 선택지는 아니다. 같은 요구에 BAdI나 명시적 Enhancement Point가 있다면 그쪽을 먼저 검토한다. CH29-L01의 결론은 "표준을 고치지 않고 빈 자리에 꽂는다"이고, 다음 레슨에서는 그 빈 자리를 ABAP Enhancement Framework 관점에서 더 정교하게 본다.

## CH29-L02 - Enhancement Point / Section

### 왜 필요한가

Customer Exit는 SAP가 함수 모듈 exit를 만들어 둔 곳에서만 사용할 수 있다. 하지만 표준 프로그램에는 "이 줄 다음에 고객 로직을 추가할 수 있으면 좋겠다"거나 "이 작은 계산 블록만 고객 로직으로 대체할 수 있으면 좋겠다"는 위치가 존재한다. 이런 요구를 더 일반적인 ABAP 소스 확장 모델로 다루는 것이 Enhancement Framework다.

Enhancement Point와 Enhancement Section은 둘 다 표준 소스를 직접 수정하지 않고 소스 코드 plug-in을 연결하기 위한 명시적 확장 옵션이다. 차이는 강하다. Point는 정해진 위치에 코드를 추가하는 방식이고, Section은 정해진 코드 구간을 고객 구현으로 대체하는 방식이다. 입문자가 이 차이를 놓치면 "조금만 보강"해야 할 상황에서 표준 블록 전체를 바꿔 버리는 위험한 설계를 하게 된다.

이 레슨의 목적은 문법 암기가 아니다. 목표는 "추가와 대체의 책임 차이"를 몸에 익히는 것이다. 추가는 표준 흐름 옆에 고객 로직을 놓는다. 대체는 표준 흐름 일부를 내 로직으로 맡아 오는 것이다. 대체는 더 강력하지만, 테스트와 업그레이드 책임도 더 크다.

### 무엇인가

`ENHANCEMENT-POINT`는 ABAP 프로그램의 특정 위치를 명시적 enhancement option으로 정의한다. 이 위치에는 하나 이상의 source code plug-in을 삽입할 수 있다. 표준 코드가 계속 실행되고, 지정 위치에 고객 코드가 추가로 실행된다고 이해하면 된다.

```abap
" SAP standard source: explicit point prepared by SAP or framework owner
ENHANCEMENT-POINT ep_before_save SPOTS es_sales_order.

" Customer source code plug-in: generated and managed through enhancement tools
ENHANCEMENT zenh_vip_before_save.
  IF ls_sales_order-netwr > 100000.
    " Add a customer-specific validation before save.
  ENDIF.
ENDENHANCEMENT.
```

`ENHANCEMENT-SECTION`은 코드 한 구간을 명시적 enhancement option으로 정의한다. 구현 plug-in이 없으면 원래 section 안의 표준 코드가 실행된다. 구현 plug-in이 있으면 그 section은 고객 구현으로 대체된다. 그래서 Section은 "중간에 조금 끼워 넣기"가 아니라 "원래 블록의 책임을 대신 맡기"에 가깝다.

```abap
" SAP standard source: replaceable section
ENHANCEMENT-SECTION es_amount_check SPOTS es_sales_order.
  IF ls_sales_order-netwr > gv_limit.
    MESSAGE e001(zsd) WITH 'Limit exceeded'.
  ENDIF.
END-ENHANCEMENT-SECTION.
```

Enhancement 구현 안에서 보이는 `ENHANCEMENT ... ENDENHANCEMENT` 블록은 고객 source code plug-in의 경계를 나타낸다. 실무에서는 이것을 표준 소스에 손으로 막 써 넣는 방식으로 접근하지 않고, ABAP Workbench의 enhancement 기능을 통해 구현과 활성화를 관리한다. CH29-L02의 판단 기준은 "Point는 더하기, Section은 바꾸기"이다.

### 어떻게 확인하는가

먼저 소스에서 SAP가 명시적으로 제공한 확장 옵션이 있는지 확인한다. ABAP Editor나 Enhancement Builder에서 enhancement mode를 켜고, `ENHANCEMENT-POINT` 또는 `ENHANCEMENT-SECTION`이 요구 위치 근처에 있는지 본다. 이름만 보지 말고 실제 위치를 봐야 한다. 저장 전 검증 요구인데 저장 후 위치에 있는 point를 쓰면 로직은 맞아도 시점이 틀린다.

다음으로 추가인지 대체인지 구분한다. 요구가 "표준 검증 후에 메시지를 하나 더 추가"라면 Point가 자연스럽다. 요구가 "표준 계산 공식을 우리 회사 공식으로 완전히 바꾼다"라면 Section 후보가 될 수 있지만, 그 순간 책임이 커진다. Section을 선택할 때는 표준 로직이 어떤 예외와 부수 효과를 가지고 있었는지, 내 구현이 그 책임을 모두 대신할 수 있는지 확인해야 한다.

세 번째로 구현 활성화와 실행 순서를 본다. Enhancement 구현은 생성만으로 끝나지 않는다. 활성화되어 있는지, 같은 point에 여러 plug-in이 있을 때 실행 순서가 업무 결과에 영향을 주는지, switch나 package 구성으로 비활성화될 수 있는지 확인한다. 실행이 안 되면 문법보다 activation과 switch를 먼저 의심한다.

마지막으로 표준 소스 변경 여부를 확인한다. 원하는 상태는 표준 프로그램에는 명시적 option이 이미 있고, 고객은 별도 enhancement implementation에 plug-in을 만든 상태다. Git diff처럼 사고하면 이해가 쉽다. 표준 줄이 바뀌면 위험 신호이고, 고객 plug-in만 생기면 의도에 맞다.

### 실수와 주의

첫 번째 실수는 Point와 Section을 이름만 비슷한 기능으로 보는 것이다. Point는 삽입이고 Section은 대체다. Section은 표준 구간을 대신 실행하므로 훨씬 신중해야 한다. 특히 금액 계산, 권한 검사, 업데이트 제어 같은 핵심 로직을 Section으로 대체하면 회귀 테스트 범위가 크게 늘어난다.

두 번째 실수는 explicit enhancement가 없는데 억지로 비슷한 위치를 찾으려는 것이다. 명시적 point가 요구 시점과 맞지 않으면 CH29-L04의 판단 트리로 돌아가야 한다. BAdI가 있는지, implicit enhancement로 충분한지, 그래도 안 되면 modification 심사까지 가는 것이 순서다.

세 번째 실수는 enhancement 구현을 "어디서든 변수에 접근할 수 있는 편한 구멍"으로 쓰는 것이다. 표준 내부 변수에 과하게 의존하면 표준 패치로 변수명이나 흐름이 바뀔 때 바로 깨진다. 사용할 수 있는 값이 무엇인지, 그 값이 안정적인 계약인지, 아니면 우연히 보이는 내부 상태인지 구분해야 한다.

네 번째 실수는 활성화와 운송을 가볍게 보는 것이다. Enhancement implementation은 repository object다. 개발, 품질, 운영 시스템 사이에서 transport가 누락되면 개발에서는 실행되지만 운영에서는 실행되지 않는 일이 생긴다. 구현 이름, package, transport request, activation 상태를 체크리스트로 남겨야 한다.

### 체험형 학습 설계

`CH29-L02-S01`은 "Enhancement Point - 라인 사이 코드 추가" 실습으로 구성한다. 화면 상단에는 표준 금액 검증 루틴을 줄 번호와 함께 보여 준다. 30번 줄과 40번 줄 사이에 `ENHANCEMENT-POINT ep_before_save` 마커가 있고, 사용자는 `plug-in 활성화` 토글로 고객 코드를 넣거나 뺄 수 있다.

실행 버튼을 누르면 세 가지 상태를 비교한다. `표준만` 상태에서는 금액 계산과 기본 검증만 실행된다. `Point plug-in ON` 상태에서는 표준 검증 앞뒤 흐름은 유지되고 고객 VIP 검증만 추가된다. `Section 대체 보기` 상태에서는 표준 계산 블록이 흐리게 처리되고 고객 구현이 대신 실행되는 모습을 보여 준다.

시뮬레이터의 핵심 피드백은 색으로 구분한다. 표준 코드는 회색 또는 파란색 고정 영역, 고객 plug-in은 초록색 추가 영역, 대체된 section은 주황색 경고 영역으로 표시한다. `표준 소스 변경 수` 카운터는 항상 0이어야 한다. 사용자가 표준 줄을 직접 수정하는 선택지를 누르면 결과 패널에 `Modification risk`가 뜨고 실습은 실패 처리된다.

버튼은 `Point로 추가`, `Section으로 대체`, `활성화 해제`, `실행 순서 보기`가 필요하다. `실행 순서 보기`는 `표준 before -> plug-in -> 표준 after`와 `section original skipped -> plug-in replacement`를 두 개의 흐름도로 보여 준다. 데이터는 `netwr = 120000`, `limit = 100000`, `vip = true`를 사용해 Point에서는 메시지가 추가되고 Section에서는 계산 책임이 넘어가는 차이를 확인하게 한다.

### 정리

Enhancement Point와 Enhancement Section은 ABAP Enhancement Framework의 명시적 소스 코드 확장 지점이다. Point는 특정 위치에 고객 코드를 추가하고, Section은 정해진 구간을 고객 코드로 대체한다.

입문자가 기억해야 할 기준은 간단하다. 먼저 BAdI 같은 더 구조적인 확장 지점이 있는지 확인하고, source code enhancement를 써야 한다면 Point를 우선 검토한다. Section은 표준 책임을 대신 맡는 선택이므로 검토와 테스트 범위를 넓혀야 한다. 다음 레슨에서는 이보다 더 객체지향적이고 확장 관리가 좋은 BAdI로 이동한다.

## CH29-L03 - BAdI 정의와 구현

### 왜 필요한가

Exit와 source code enhancement는 "표준 흐름의 어느 위치에 코드를 꽂는가"에 초점이 있다. 하지만 업무 확장이 커질수록 위치만으로는 부족하다. 같은 표준 시점이라도 국가별, 회사코드별, 사업부별로 구현이 달라질 수 있다. 여러 구현을 켜고 끄거나, 특정 조건에 맞는 구현만 선택하거나, 인터페이스 계약으로 입력과 출력을 안정적으로 정의해야 한다.

BAdI, Business Add-In은 이런 문제를 객체지향 방식으로 풀기 위한 SAP 확장 모델이다. 표준 프로그램은 "여기서 어떤 구현을 부를지" 직접 알지 않는다. 대신 BAdI 객체를 얻고, BAdI 인터페이스의 메서드를 호출한다. 실제 고객 구현은 SE19에서 만든 implementation class가 담당한다. 표준은 인터페이스만 보고 말하고, 고객 구현은 그 인터페이스를 구현해 응답한다.

CH20에서 인터페이스를 배운 이유가 여기서 살아난다. 인터페이스는 "호출자가 기대하는 메서드 모양"을 고정한다. BAdI는 그 인터페이스를 확장 지점의 계약으로 사용한다. 그래서 BAdI는 단순히 새 문법이 아니라, 표준과 고객 코드 사이의 계약을 분리하는 장치다.

### 무엇인가

BAdI는 Enhancement Framework 안에서 제공되는 명시적 확장 옵션이다. 하나의 BAdI는 BAdI interface, filter, 설정, 그리고 구현 plug-in으로 구성된다. 정의는 보통 `SE18`에서 확인하고, 고객 구현은 `SE19`에서 생성한다. 구현 클래스는 BAdI interface의 메서드를 구현한다.

표준 프로그램 쪽 흐름은 단순화하면 다음과 같다.

```abap
" Standard program side: simplified BAdI call flow
GET BADI lo_booking_badi
  FILTERS
    country = lv_country.

CALL BADI lo_booking_badi->check_booking
  EXPORTING
    is_booking = ls_booking.
```

`GET BADI`는 활성화된 BAdI implementation 중 switch 상태와 filter 조건이 맞는 object plug-in을 찾아 BAdI reference를 준비한다. `CALL BADI`는 그 reference를 통해 BAdI method를 호출한다. SAP 문서 기준으로 multiple-use BAdI는 여러 object plug-in을 가질 수 있고, 구현이 없으면 호출 효과가 없을 수도 있다. 반대로 single-use BAdI에서 참조가 initial인데 호출하면 예외가 날 수 있으므로 정의의 사용 방식과 fallback 여부를 확인해야 한다.

구현 쪽은 인터페이스 메서드 구현으로 이해하면 된다.

```abap
" Customer implementation class: simplified method body
METHOD if_ex_booking_check~check_booking.
  IF is_booking-total_amount > 100000
     AND is_booking-customer_group = 'VIP'.
    " Add customer-specific validation or message handling.
  ENDIF.
ENDMETHOD.
```

여기서 `IF_EX_...` 형태는 고전 BAdI나 exit 계열에서 자주 보이는 인터페이스 이름 패턴으로 이해하면 된다. 시스템마다 실제 이름은 다르다. 중요한 것은 "표준이 구현 클래스를 직접 부르지 않고 BAdI interface method를 호출한다"는 구조다.

### 어떻게 확인하는가

첫 번째 확인은 BAdI 정의다. `SE18`에서 BAdI 이름을 열어 설명, interface, method, parameter, filter, single-use 또는 multiple-use 여부, fallback implementation, enhancement spot 연결을 확인한다. 이름만 보고 구현을 만들지 말고 method signature를 읽어야 한다. 내가 필요한 데이터가 importing parameter로 들어오는지, 변경 가능한 값이 changing parameter로 제공되는지, 메시지를 어떤 방식으로 반환해야 하는지가 여기서 결정된다.

두 번째 확인은 구현 상태다. `SE19`에서 implementation을 만들거나 기존 구현을 찾고, 구현 클래스가 활성화되어 있는지 확인한다. filter BAdI라면 filter 값이 실제 표준 호출의 `GET BADI ... FILTERS` 값과 맞는지 본다. 많은 BAdI 문제는 코드가 틀린 것이 아니라 filter가 맞지 않아 선택되지 않는 문제다.

세 번째 확인은 실행 로그다. 디버깅에서는 `GET BADI` 이후 reference가 어떤 구현을 포함하는지, `CALL BADI`에서 내 method로 진입하는지 확인한다. multiple-use라면 여러 구현이 순서대로 호출될 수 있으므로 "내 구현만 실행된다"고 가정하면 안 된다. 구현 간 부수 효과가 충돌하지 않는지도 봐야 한다.

네 번째 확인은 확장 책임이다. BAdI method는 표준이 허용한 계약이다. 계약 밖의 전역 변수나 내부 테이블을 억지로 건드리는 로직은 BAdI를 쓰면서도 Clean Core 장점을 잃는 방식이다. 입력 parameter, 반환 규칙, 예외 처리 방식을 기준으로 구현해야 한다.

### 실수와 주의

첫 번째 실수는 BAdI 정의와 구현을 혼동하는 것이다. `SE18`은 정의를 보는 곳이고, `SE19`는 구현을 만드는 곳이다. 정의만 보고 "작동한다"고 판단할 수 없고, 구현만 만들어도 정의의 filter나 activation 조건이 맞지 않으면 호출되지 않는다.

두 번째 실수는 filter를 가볍게 보는 것이다. filter 값은 단순한 부가 조건이 아니라 구현 선택 조건이다. 예를 들어 표준이 `country = 'KR'`로 `GET BADI`를 수행하는데 구현 filter를 `US`로 만들어 두면 로직은 완벽해도 호출되지 않는다.

세 번째 실수는 multiple-use BAdI에서 실행 순서와 중복 효과를 무시하는 것이다. 여러 구현이 같은 데이터를 검사하거나 메시지를 추가하면 결과가 중복될 수 있다. 구현은 가능한 한 멱등적으로 만들고, 같은 메시지를 여러 번 만들지 않도록 guard 조건을 둔다.

네 번째 실수는 BAdI 안에 화면 처리나 외부 연동을 직접 넣는 것이다. BAdI는 표준 흐름 중간에서 실행된다. 느린 I/O, 커밋 제어, 화면 호출, 예외 미처리 로직은 표준 트랜잭션 전체를 불안정하게 만들 수 있다. 필요한 경우 별도 서비스 클래스로 분리하고, BAdI method에서는 짧게 호출·판단·반환하도록 구성한다.

### 체험형 학습 설계

`CH29-L03-S01`은 "BAdI 플러그인 - 구현 on/off" 실습으로 설계한다. 화면은 세 칸으로 나눈다. 왼쪽은 표준 프로그램의 `GET BADI`와 `CALL BADI` 호출, 가운데는 BAdI interface `IF_EX_BOOKING~CHECK_BOOKING`, 오른쪽은 고객 implementation class다. 가운데 interface는 소켓처럼 보이고, 오른쪽 구현은 플러그처럼 꽂히는 형태로 표현한다.

기본 데이터는 `country = KR`, `amount = 120000`, `customer_group = VIP`로 둔다. filter 선택 드롭다운에는 `KR`, `US`, `ALL`을 제공한다. 사용자가 `SE19 구현 활성화` 토글을 켜고 filter를 `KR`로 맞춘 뒤 실행하면 로그에 `GET BADI selected ZIMPL_KR_VIP_CHECK`, `CALL BADI entered CHECK_BOOKING`, `VIP high amount warning created`가 순서대로 표시된다.

실패 학습도 중요하다. filter를 `US`로 바꾸면 실행 결과는 `No matching implementation`으로 표시하고, 표준 흐름은 계속 진행되지만 고객 검증은 실행되지 않았다고 알려 준다. 구현을 비활성화하면 `Implementation inactive` 상태가 보인다. multiple-use 모드를 켜면 두 개의 구현 카드가 순서대로 실행되며, 동일 메시지를 두 번 만들 때 중복 경고가 뜬다.

버튼은 `SE18 정의 보기`, `SE19 구현 켜기`, `Filter 바꾸기`, `표준 실행`, `호출 로그 펼치기`가 필요하다. 상태 배지는 `Definition found`, `Implementation active`, `Filter matched`, `Method entered`, `No object plug-in`으로 나눈다. 학습자는 버튼 조작만으로 BAdI가 "인터페이스 계약 + 구현 선택 + method 호출"이라는 구조임을 확인한다.

### 정리

BAdI는 표준 프로그램과 고객 구현 사이를 인터페이스 계약으로 분리하는 객체지향 확장 방식이다. 표준은 `GET BADI`로 구현 plug-in을 준비하고, `CALL BADI`로 BAdI method를 호출한다. 고객은 `SE19`에서 implementation class를 만들고 BAdI interface method를 구현한다.

Customer Exit보다 BAdI가 더 선호되는 이유는 구조가 명확하기 때문이다. method signature, filter, single-use 또는 multiple-use 설정, activation 상태를 통해 확장을 관리할 수 있다. 다음 레슨에서는 BAdI, explicit enhancement, implicit enhancement, modification 중 무엇을 먼저 선택해야 하는지 판단 순서를 정리한다.

## CH29-L04 - Implicit / Explicit Enhancement 판단

### 왜 필요한가

확장 수단을 많이 아는 것보다 중요한 것은 순서대로 판단하는 능력이다. 초보자는 "BAdI를 배웠으니 무조건 BAdI", "Enhancement Point를 봤으니 무조건 거기", "안 보이면 implicit enhancement"처럼 기술 하나에 매달리기 쉽다. 하지만 실무에서 먼저 해야 할 일은 코드를 쓰는 것이 아니라 확장 지점의 위험도를 비교하는 것이다.

같은 요구라도 선택지는 여러 개다. 표준이 공식 BAdI를 제공할 수 있고, 명시적 Enhancement Point를 제공할 수 있고, 절차 시작이나 끝의 implicit enhancement로 충분할 수 있고, 어떤 경우에는 modification 요청 심사를 피할 수 없을 수도 있다. 선택 순서를 잘못 잡으면 유지보수 가능한 요구도 위험한 구현이 된다.

CH29-L04의 목표는 "내가 코드를 넣을 수 있는가"가 아니라 "그곳에 넣는 것이 맞는가"를 판단하는 것이다. 확장 수단은 자유도가 높을수록 책임도 커진다. 그러므로 먼저 계약이 강하고 안정적인 지점을 찾고, 뒤로 갈수록 신중해져야 한다.

### 무엇인가

Explicit enhancement option은 SAP 또는 개발자가 명시적으로 만들어 둔 확장 지점이다. 이 장에서 다루는 BAdI, `ENHANCEMENT-POINT`, `ENHANCEMENT-SECTION`이 여기에 해당한다. explicit이라는 말은 "여기는 확장하라고 의도적으로 표시된 자리"라는 뜻에 가깝다.

Implicit enhancement option은 ABAP 시스템이 특정 위치에 자동으로 제공하는 확장 가능 위치다. SAP 문서 기준으로 실행 프로그램, 함수 풀, 모듈 풀, include의 마지막 위치, procedure 구현의 첫 줄 앞과 마지막 줄 뒤, source code plug-in의 시작과 끝, 로컬 클래스의 visibility section 끝, 일부 parameter interface 위치 등에 암시적 option이 존재한다. 에디터에서는 Enhancement Operations에서 implicit enhancement point 표시를 켜야 보인다.

Modification은 표준 객체 자체를 직접 바꾸는 선택이다. 이 장에서는 마지막 후보로만 다룬다. modification이 항상 기술적으로 불가능한 것은 아니지만, 업그레이드 안정성, SAP 지원, 회귀 테스트, 충돌 해결 책임이 가장 크다.

판단 우선순위는 다음처럼 잡는다.

| 우선순위 | 선택지 | 선택 이유 | 멈춰야 하는 신호 |
| --- | --- | --- | --- |
| 1 | BAdI | 인터페이스 계약, filter, activation 관리가 좋다 | 필요한 데이터나 시점이 method 계약 안에 없다 |
| 2 | Explicit Enhancement Point | SAP가 추가 위치를 명시했다 | point 위치가 요구 시점과 다르다 |
| 3 | Explicit Enhancement Section | 표준 블록 대체를 명시적으로 허용한다 | 표준 책임을 완전히 대신할 준비가 없다 |
| 4 | Implicit Enhancement | 시작·끝 같은 제한적 위치에서만 최소 보강한다 | 내부 변수 의존, 중간 흐름 변경, 과도한 로직 |
| 5 | Modification | 다른 선택지가 없을 때 예외 심사 대상 | 단순 편의, 빠른 해결, 테스트 부족 |

### 어떻게 확인하는가

요구를 한 문장으로 고정한다. 예를 들어 "판매오더 저장 전에 VIP 고액 주문이면 경고 메시지를 추가한다"처럼 업무 객체, 시점, 조건, 결과가 들어가야 한다. 이 문장이 없으면 확장 지점 선택이 감으로 흐른다.

그다음 BAdI를 먼저 찾는다. 업무 영역의 IMG 문서, 패키지, Enhancement Spot, `SE18` 검색을 통해 해당 시점의 BAdI가 있는지 확인한다. BAdI가 있으면 interface method의 parameter가 요구를 충족하는지, filter로 대상 범위를 좁힐 수 있는지, 구현 활성화가 가능한지 본다.

BAdI가 맞지 않으면 명시적 source code enhancement를 본다. 요구 시점 근처에 `ENHANCEMENT-POINT`나 `ENHANCEMENT-SECTION`이 있는지 확인한다. Point가 있으면 추가로 해결 가능한지 먼저 생각한다. Section은 대체 책임을 감당할 수 있을 때만 검토한다.

그다음 implicit enhancement를 본다. 에디터에서 implicit enhancement points 표시를 켜고 procedure의 시작·끝 등 제공 위치를 확인한다. 암시적 option은 편하지만, 표준 내부 상태에 기대기 쉽다. 요구가 "시작 전에 초기값 보강" 또는 "끝난 뒤 로그 추가"처럼 위치와 책임이 단순할 때만 후보로 둔다.

마지막으로 modification 여부를 판단한다. 이 단계까지 왔다면 기술 작업이 아니라 의사결정 문서가 필요하다. 왜 BAdI가 안 되는지, 왜 explicit/implicit enhancement가 안 되는지, modification의 영향 범위와 회귀 테스트 범위가 무엇인지 기록해야 한다.

### 실수와 주의

첫 번째 실수는 implicit enhancement를 "어디든 넣을 수 있는 자유권"처럼 사용하는 것이다. 암시적 option은 존재 위치가 정해져 있고, include와 compilation unit 조건에 따라 보이지 않거나 사용할 수 없는 경우도 있다. 보인다고 해서 안정적인 계약이라는 뜻은 아니다.

두 번째 실수는 explicit section을 modification보다 항상 안전하다고 단정하는 것이다. Section은 표준이 대체를 허용한 자리이므로 modification보다 낫지만, 대체된 표준 블록의 책임은 여전히 고객 구현이 가져간다. 표준 로직의 예외, 메시지, 데이터 변경을 놓치면 기능 회귀가 생긴다.

세 번째 실수는 "BAdI가 있는데도 parameter가 부족해서 불편하다"는 이유로 implicit enhancement로 우회하는 것이다. 먼저 BAdI 계약 안에서 가능한 설계를 해야 한다. 계약 밖 내부 변수에 접근하면 당장은 편해도 업그레이드 안정성이 떨어진다.

네 번째 실수는 선택 근거를 남기지 않는 것이다. 확장은 표준 흐름에 붙는 결정이므로 나중에 누군가 반드시 이유를 묻는다. "왜 BAdI가 아니라 implicit인가", "왜 Section인가", "왜 modification 심사를 올렸는가"를 한 문단으로 남겨 두면 운영 중 분석 시간이 크게 줄어든다.

### 체험형 학습 설계

`CH29-L04-S01`은 "확장 수단 선택 트리"로 만든다. 사용자는 요구 카드를 하나 선택한다. 예시는 `저장 전 VIP 검증`, `계산 후 로그 추가`, `표준 계산 공식 대체`, `프로그램 시작 시 기본값 세팅` 네 가지다. 화면은 질문형 decision tree로 진행된다.

첫 질문은 `공식 BAdI가 있는가?`이다. `예`를 누르면 `method parameter가 요구 데이터를 제공하는가?`, `filter로 대상 범위를 제한할 수 있는가?`로 이어진다. 조건이 충족되면 결과는 `BAdI 추천`이고, 오른쪽에는 `SE18 정의 확인 -> SE19 구현 -> filter 테스트` 체크리스트가 나온다.

`BAdI 없음` 또는 `계약 불충분`을 선택하면 다음 질문은 `명시적 Enhancement Point가 요구 시점에 있는가?`이다. 있으면 `Point 추천`으로 가고, point가 아니라 section만 있으면 `대체 책임 검토` 경고가 뜬다. 명시적 option이 없으면 `implicit 위치가 요구 시점과 정확히 맞는가?`를 묻는다. 여기서도 아니면 결과는 `Modification 심사 필요`로 표시한다.

상태 피드백은 위험도 색상으로 준다. BAdI는 녹색, Explicit Point는 연녹색, Section은 노란색, Implicit은 주황색, Modification은 빨간색이다. 각 결과 카드에는 `표준 소스 변경 여부`, `계약 강도`, `업그레이드 위험`, `테스트 범위` 점수를 표시한다. 사용자는 버튼을 누르며 같은 요구라도 선택 근거에 따라 위험도가 바뀐다는 사실을 체험한다.

### 정리

CH29-L04의 핵심은 확장 수단의 우선순위다. 먼저 BAdI를 찾고, 그다음 명시적 Enhancement Point를 찾고, 필요할 때 Section을 신중히 검토하고, implicit enhancement는 제한적으로 사용하며, modification은 마지막 심사 대상으로 남긴다.

좋은 ABAP 개발자는 "여기에 코드를 넣을 수 있다"에서 멈추지 않는다. "이 위치가 표준이 의도한 확장 계약인가", "업그레이드 후에도 견딜 수 있는가", "다른 개발자가 이유를 이해할 수 있는가"까지 확인한다. 이 판단력이 다음 레슨의 Clean Core 관점과 연결된다.

## CH29-L05 - Clean Core 관점의 확장 기준

### 왜 필요한가

확장은 고객 요구를 빠르게 해결하는 도구이지만, 잘못 쓰면 표준 시스템을 점점 무겁게 만든다. 처음에는 작은 exit 하나였는데 몇 년 뒤에는 업그레이드 때마다 깨지는 표준 변경, 어디서 실행되는지 모르는 implicit enhancement, 내부 테이블에 직접 접근하는 Z 로직이 쌓일 수 있다. 이런 시스템은 기능이 많아도 변경하기 어렵다.

Clean Core는 표준 핵심을 가능한 깨끗하게 유지하고, 고객 확장은 표준이 허용한 안정적인 지점과 공개된 계약을 통해 분리하자는 사고방식이다. CH29-L05는 최신 유행어를 외우는 시간이 아니다. 앞에서 배운 User Exit, Enhancement, BAdI를 실제 운영 시스템에 넣을 때 "미래의 업그레이드와 Cloud-ready 방향을 해치지 않는가"를 판단하는 시간이다.

Classic ABAP 환경에서는 여전히 여러 확장 수단을 사용할 수 있다. 하지만 ABAP Cloud 관점은 훨씬 제한적이다. 공식 문서 기준으로 ABAP Cloud는 restricted ABAP language version과 released API 접근 제한을 전제로 하며, SAP GUI 접근이 아니라 ADT 중심 개발을 사용한다. 이 장에서는 이 내용을 구현 절차로 들어가지 않고, classic 확장을 평가하는 기준으로 사용한다.

### 무엇인가

Clean Core 관점에서 좋은 확장은 네 가지 특성을 가진다. 첫째, 표준 소스를 직접 수정하지 않는다. 둘째, SAP가 제공한 명시적 확장 계약을 우선 사용한다. 셋째, 공개되거나 release된 API와 안정적인 interface를 통해 표준과 통신한다. 넷째, 고객 코드는 별도 package, 명확한 이름, transport, 테스트 근거를 가진다.

BAdI는 이 기준에 잘 맞는 경우가 많다. interface method라는 계약이 있고, filter나 activation으로 구현을 관리할 수 있기 때문이다. Enhancement Point도 SAP가 의도한 위치라면 사용할 수 있다. Customer Exit는 레거시 시스템에서 이해하고 유지해야 하지만, 신규 요구에서는 BAdI나 명시적 enhancement가 있는지 먼저 확인해야 한다. Implicit enhancement는 가능하더라도 내부 구현에 기대기 쉬우므로 최소 범위로 제한한다.

ABAP Cloud와 관련해서는 세 단어를 구분해야 한다. Released API는 ABAP Cloud에서 접근이 허용된 repository object 또는 그 일부다. ABAP for Cloud Development는 제한된 언어 범위와 released API 접근을 사용하는 ABAP 언어 버전이다. Developer Extensibility는 ADT에서 released API를 사용해 upgrade-stable custom ABAP code를 만드는 접근이다. Key User Extensibility는 dedicated enhancement points에서 key user 도구로 수행하는 제한된 확장 접근이다.

이 구분은 classic 개발자에게도 중요하다. 오늘은 on-premise라서 내부 테이블을 직접 읽을 수 있어도, 그것이 미래에 안정적인 계약이라는 뜻은 아니다. Clean Core 판단은 "기술적으로 가능한가"보다 "공개된 계약인가"를 먼저 묻는다.

### 어떻게 확인하는가

요구를 받으면 먼저 확장 유형을 분류한다. 단순 필드 추가인지, 저장 전 검증인지, 계산 보강인지, 표준 프로세스 변경인지 구분한다. 단순 설정이나 key user 도구로 해결 가능한 요구를 개발 확장으로 바로 끌고 오면 불필요하게 시스템을 무겁게 만든다.

다음으로 공개 계약을 찾는다. BAdI, released API, 명시적 Enhancement Point, 공식 extension point가 있는지 확인한다. BAdI가 있다면 interface method와 filter가 요구를 충족하는지 본다. ABAP Cloud 또는 Cloud-ready 관점이 필요한 대상이면 released API 여부를 확인한다. 이름이 SAP 표준 객체라고 해서 모두 안정적인 API는 아니다.

세 번째로 구현 위치를 확인한다. 고객 코드는 별도 Z/Y package에 두고, 의미 있는 이름을 붙이고, transport와 activation 상태를 추적한다. Enhancement implementation도 "어느 요구 때문에, 어느 표준 지점에, 어떤 조건으로 실행되는지" 설명이 있어야 한다.

네 번째로 금지 신호를 찾는다. 표준 소스 직접 수정, private table 직접 접근, 내부 include 변수 의존, 과도한 implicit enhancement, update task나 commit 제어를 표준 흐름 중간에서 임의로 수행하는 로직은 Clean Core 점수를 크게 떨어뜨린다. 이런 신호가 보이면 더 안정적인 확장 지점을 다시 찾아야 한다.

마지막으로 테스트와 회귀 범위를 정한다. 확장은 표준 흐름에 붙기 때문에 단위 테스트만으로 충분하지 않을 수 있다. 해당 표준 트랜잭션의 정상 흐름, 예외 흐름, 비활성 상태, filter 불일치 상태, 업그레이드 후 재확인 항목을 함께 적어야 한다.

### 실수와 주의

첫 번째 실수는 Clean Core를 "Cloud에서만 필요한 이야기"로 밀어내는 것이다. Clean Core는 on-premise에서도 중요하다. 업그레이드, 패치, 운영 분석, 개발자 교체는 Cloud가 아니어도 발생한다. 표준 핵심을 깨끗하게 유지하는 습관은 classic 시스템에서도 비용을 줄인다.

두 번째 실수는 released API와 SAP 표준 객체를 같은 뜻으로 보는 것이다. SAP가 제공한 객체라고 해서 ABAP Cloud에서 접근이 release된 API라는 뜻은 아니다. Released API는 release contract와 제한된 언어 버전에서의 visibility 기준을 가진다.

세 번째 실수는 implicit enhancement를 Clean Core 예외 구멍으로 쓰는 것이다. 직접 modification이 아니더라도 내부 흐름에 깊게 붙어 표준 변수와 순서에 의존하면 업그레이드 안정성이 낮다. Clean Core 관점에서는 "표준을 안 고쳤다"만으로 충분하지 않고 "안정적인 계약을 사용했다"까지 확인해야 한다.

네 번째 실수는 확장 구현을 문서화하지 않는 것이다. 어느 BAdI에 어떤 filter로 구현했는지, 어떤 business rule을 담당하는지, 비활성화하면 어떤 기능이 사라지는지 모르면 운영 중 장애 분석이 어려워진다. 확장은 표준과 고객 코드 사이의 접점이므로 문서가 곧 운영 안전장치다.

### 체험형 학습 설계

`CH29-L05-S01`은 "Clean Core 친화 판별 퀴즈"로 구성한다. 화면에는 여섯 개의 확장 후보 카드가 나온다. 예시는 `공개 BAdI 구현`, `released API 사용`, `Z package의 별도 validation class`, `표준 include 직접 수정`, `private standard table 직접 SELECT`, `implicit enhancement로 핵심 흐름 가로채기`이다.

사용자는 각 카드를 `Clean Core 친화`, `주의 필요`, `위험` 세 영역으로 드래그한다. 채점 버튼을 누르면 카드마다 근거를 보여 준다. `공개 BAdI 구현`은 계약 기반이므로 높은 점수, `released API 사용`은 Cloud-ready 기준에 맞아 높은 점수, `Z package 분리`는 운영 관리에 유리하다. 반대로 표준 include 직접 수정은 modification 위험, private table 직접 SELECT는 공개 계약 부재, 핵심 흐름을 implicit으로 가로채는 방식은 업그레이드 취약점으로 표시한다.

퀴즈는 단순 정답 표시로 끝나면 안 된다. 각 위험 카드에는 개선 제안을 제공한다. 예를 들어 `표준 include 직접 수정` 카드는 `BAdI 또는 explicit enhancement 검색으로 되돌아가기`를 제안한다. `private table 직접 SELECT` 카드는 `released API 또는 CDS view release 상태 확인`을 제안한다. `implicit enhancement` 카드는 `BAdI/Explicit Point 부재 근거 문서화 및 범위 축소`를 제안한다.

버튼은 `채점`, `개선 제안 보기`, `Classic 허용성과 Cloud-ready 비교`, `내 선택 기록 저장`을 둔다. 상태는 `Green contract`, `Yellow caution`, `Red core risk`로 나눈다. 피드백 패널에는 "기술적으로 가능"과 "장기적으로 안정"이 다를 수 있음을 반복해서 보여 준다.

### 정리

CH29의 마지막 결론은 "확장을 할 수 있다"가 아니라 "표준을 깨끗하게 유지하면서 확장할 수 있다"이다. Classic ABAP에서는 User Exit, Customer Exit, Enhancement Point, BAdI, implicit enhancement를 모두 만날 수 있지만, 선택 기준은 항상 안정적인 계약과 최소 침범이다.

Clean Core 관점에서는 BAdI와 released API처럼 공개된 계약을 우선한다. Customer Exit와 implicit enhancement는 레거시 이해와 제한적 사용의 영역으로 두고, modification은 마지막 심사 대상으로 남긴다. 이 장을 마친 학습자는 표준 확장 요구를 받았을 때 바로 코드를 쓰기보다, 먼저 확장 지점과 책임 범위를 판단하는 개발자로 넘어간다.
