# CH03_REWRITE - DDIC Domain, Data Element, PARAMETERS

> 기준 소스: `content/abap/CH03/_chapter.md`, `content/abap/CH03/CH03-L01.md` ~ `CH03-L03.md`
> 보조 참고: `.project-docs/04_CONVENTIONS.md`, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 기존 `reference/codex_0625` 진단
> 공식 문서 확인: `C:\ABAP_DOCU_HTML`의 DDIC Domain, Data Element, built-in dictionary type, DDIC activation, `PARAMETERS`, selection screen, F4/input help 항목을 수동 확인

## 챕터 설계

CH02에서 학습자는 `DATA`, `TYPES`, `CONSTANTS`로 프로그램 안의 값을 정리했다. 하지만 CH02의 `TYPES ty_amount TYPE p LENGTH 8 DECIMALS 2.`는 그 프로그램 안에서만 산다. 다른 프로그램에서도 같은 금액 규칙을 쓰려면 또 선언해야 한다. A 프로그램은 금액을 `p LENGTH 8 DECIMALS 2`로, B 프로그램은 `p LENGTH 11 DECIMALS 2`로 만들면 같은 업무 값인데 서로 다른 규칙이 된다.

CH03의 목표는 이 문제를 해결하는 것이다. 타입 규칙과 의미를 프로그램 밖 전역 사전으로 올린다. SAP에서는 이 전역 사전을 ABAP Dictionary 또는 DDIC라고 부른다. 이 장에서 학습자는 다음 흐름을 익힌다.

1. Domain으로 기술 속성을 정의한다.
2. Data Element로 의미와 라벨을 입힌다.
3. `PARAMETERS`에서 Data Element를 사용해 selection screen 입력칸에 라벨과 F4 도움말이 연결되는 것을 확인한다.

CH03는 DDIC 전체를 다 배우는 장이 아니다. Transparent Table은 CH07, Foreign Key와 Search Help 심화는 CH09, selection screen 심화는 CH15에서 다룬다. 이 장에서는 Domain, Data Element, `PARAMETERS`의 연결을 정확히 이해하는 데 집중한다.

신규 레슨은 추가하지 않는다. 원본 3개 레슨이 "기술 속성 -> 의미/라벨 -> 화면 보상"으로 닫힌 학습 루프를 만든다. 다만 L02와 L03은 코드가 있으므로 체험 설계를 본문에 직접 보강한다.

## CH03-L01 - Domain: 기술 속성 정의

### 왜 필요한가

CH02의 local type은 프로그램 하나 안에서는 유용하다.

```abap
TYPES ty_amount TYPE p LENGTH 8 DECIMALS 2.
```

하지만 회사의 여러 프로그램이 모두 금액을 다룬다면, 이 선언을 프로그램마다 복사하는 방식은 위험하다. 어떤 프로그램은 길이 8, 어떤 프로그램은 길이 11, 어떤 프로그램은 소수 자릿수 0으로 만들 수 있다. 개발자 한 명이 실수해도 같은 "금액"이 서로 다른 모양으로 저장되고 계산된다.

그래서 타입의 기술 규칙을 전역으로 올려야 한다. "우리 회사에서 금액은 이런 길이와 소수 자릿수를 가진다", "상태값은 O와 C만 허용한다", "항공사 코드는 3자리 문자다" 같은 규칙을 한 곳에 둔다. 이 한 곳이 ABAP Dictionary이고, 그중 기술 속성을 담당하는 객체가 Domain이다.

입문자는 Domain을 "회사 공용 타입 규격서"로 이해하면 된다. 단, Domain은 최종 이름표가 아니다. Domain은 값이 어떻게 생겼는지만 말한다.

### 무엇인가

Domain은 ABAP Dictionary 안의 독립 객체다. 공식 문서 기준으로 Domain은 elementary data type의 technical property와 일부 semantic property를 정의한다. 그러나 ABAP 코드에서 Domain 이름을 `TYPE` 뒤에 직접 쓸 수는 없다.

```abap
" 잘못된 생각
" DATA lv_amount TYPE zdo_amount.
```

Domain은 Data Element가 참조하고, 프로그램은 보통 Data Element를 타입으로 사용한다. 흐름은 다음과 같다.

```text
Domain
  -> Data Element
      -> ABAP 변수, PARAMETERS, 테이블 필드
```

역할을 나누면 다음과 같다.

| 계층 | 맡는 일 | 예 |
|---|---|---|
| Domain | 기술 속성 | `DEC`, 길이 8, 소수 2, 소문자 허용, 고정값 |
| Data Element | 의미와 라벨 | "금액", "주문 상태", "항공사 코드" |
| 프로그램/화면/테이블 필드 | 실제 사용 | `DATA lv_amount TYPE zde_amount.` |

Domain에서 자주 다루는 속성은 다음과 같다.

| 속성 | 의미 | 입문자 설명 |
|---|---|---|
| Data Type | DDIC built-in type | `CHAR`, `NUMC`, `DEC`, `INT4`, `DATS` 같은 Dictionary 타입 |
| Length | 길이 | 담을 수 있는 자리 수 |
| Output Length | 출력 길이 | 화면에 보일 칸 수. 부호나 구분기호 때문에 실제 길이보다 길 수 있음 |
| Decimal Places | 소수 자릿수 | `DEC` 같은 숫자 타입에서 소수 몇 자리까지 볼지 |
| Lowercase Letters | 소문자 허용 | character-like 타입에서 입력을 대문자로 바꾸지 않고 보존할지 |
| Sign | 부호 허용 | 숫자 타입에서 음수를 화면에 표시할 수 있게 할지 |
| Fixed Values | 고정값 | 허용할 값을 Domain 안에 직접 적음 |
| Value Table | 값 테이블 | Foreign Key의 check table 기본 후보가 되는 테이블 |

CH02의 ABAP 타입과 DDIC 타입 이름은 다르다.

| DDIC Domain 타입 | ABAP 변수 타입으로 매핑될 때 | 용도 |
|---|---|---|
| `CHAR` | `c` | 문자 |
| `NUMC` | `n` | 숫자 모양의 텍스트 |
| `DEC` | `p` | packed decimal |
| `INT4` | `i` | 정수 |
| `DATS` | `d` | 날짜 |
| `TIMS` | `t` | 시간 |

이 차이를 반드시 기억해야 한다. SE11의 Domain 화면에서는 `CHAR`라고 고르지만, CH02의 ABAP 코드에서는 `TYPE c`라고 썼다. 둘은 같은 영역이 아니라 Dictionary 타입과 ABAP 타입의 매핑 관계다.

### 고정값과 Value Table 구분

Domain에서 값을 제한할 때 초보자가 가장 자주 섞는 것이 Fixed Values와 Value Table이다.

| 구분 | Fixed Values | Value Table |
|---|---|---|
| 무엇인가 | Domain 안에 직접 적는 값 목록 | Domain의 값 후보가 들어 있는 테이블 이름 |
| 예 | `O = Open`, `C = Closed` | 항공사 목록 테이블 `SCARR` |
| 잘 맞는 경우 | 값이 적고 거의 안 바뀜 | 값 목록이 테이블 데이터로 관리됨 |
| CH03에서 배울 깊이 | F4 후보와 입력 제한의 기초 | Foreign Key의 바탕이라는 개념만 |
| 심화 위치 | CH09에서 Foreign Key, Search Help와 함께 재방문 | CH09 |

공식 문서 기준으로 Value Table은 table field가 Foreign Key에 포함될 때 check table의 기본값으로 쓰일 수 있는 semantic property다. **Value Table을 Domain에 적었다고 해서 그 자체만으로 모든 입력 검증이 자동 실행되는 것은 아니다.** 실제 테이블 필드 검증은 Foreign Key와 함께 이해해야 하며, 이것은 CH09의 소유 범위다.

Fixed Values는 Domain 자체의 value range다. 예를 들어 상태값이 `O`, `C` 두 개뿐이면 Fixed Values로 충분하다. 반대로 항공사 목록처럼 계속 늘고 바뀌는 값은 테이블로 관리해야 한다.

### 어떻게 확인하는가

SE11에서 Domain을 하나 만들며 확인한다.

추천 실습 객체는 다음과 같다.

| 항목 | 값 |
|---|---|
| Domain 이름 | `ZDO_STATUS` |
| Data Type | `CHAR` |
| Length | `1` |
| Output Length | `1` |
| Fixed Values | `O = Open`, `C = Closed` |

확인 순서는 다음과 같다.

1. `SE11`을 실행한다.
2. Domain을 선택하고 `ZDO_STATUS`를 입력한다.
3. Create를 누른다.
4. Short Description을 입력한다.
5. Data Type을 `CHAR`, Length를 `1`로 지정한다.
6. Value Range 탭에서 fixed value `O`, `C`를 입력한다.
7. 저장한다.
8. Check를 실행한다.
9. Activate를 실행한다.

중요한 것은 저장, 검사, 활성화의 차이다.

| 단계 | 의미 | 학습자가 봐야 할 것 |
|---|---|---|
| Save | 소스 정의를 저장 | 아직 runtime에서 안전하게 쓸 준비가 끝난 것은 아님 |
| Check | 정의의 일관성을 검사 | 이름, 타입, 길이, 값 범위 오류를 찾음 |
| Activate | runtime object 생성 | 다른 DDIC 객체나 프로그램이 사용할 수 있는 상태가 됨 |

공식 문서 기준으로 DDIC data type이 활성화되면 DDIC runtime object가 만들어진다. ABAP 프로그램이나 dynpro 같은 소비자는 이 runtime object를 통해 타입 속성에 접근한다. 그래서 "저장했다"와 "활성화했다"를 절대 같은 말로 쓰면 안 된다.

기존 임베드 `CH03-L01-S01`은 이 실습에 바로 연결된다.

- 예제 버튼: 금액 Domain, 상태 Domain, 항공사 코드 Domain, 이메일 Domain, 재고 증감 Domain 등을 선택한다.
- 입력 영역: Domain 이름, Data Type, Length, Output Length, Decimals, Lowercase, Sign, Value Table, Fixed Values를 바꾼다.
- 버튼: `저장`, `검사`, `활성화`를 순서대로 누른다.
- 상태: `신규`, `비활성`, `활성`을 배지로 확인한다.
- 오류 피드백: 이름이 `Z`/`Y`로 시작하지 않거나, `DEC`의 decimal이 길이보다 크거나, Fixed Values와 Value Table을 동시에 넣으면 경고를 본다.

### 실수와 주의

첫 번째 실수는 Domain을 ABAP 변수 타입으로 직접 쓰려는 것이다.

```abap
" Domain은 이렇게 직접 쓰지 않는다.
" DATA lv_status TYPE zdo_status.
```

Domain은 Data Element를 통해 사용한다. 다음 레슨에서 `ZDE_STATUS` 같은 Data Element를 만들고, 그 Data Element가 `ZDO_STATUS` Domain을 참조하게 한다.

두 번째 실수는 `CHAR`와 `c`를 같은 화면에서 쓰는 이름으로 오해하는 것이다. Domain 화면의 `CHAR`는 DDIC built-in type이고, ABAP 코드의 `c`는 ABAP built-in type이다. 서로 매핑되지만 표기 위치가 다르다.

세 번째 실수는 Value Table을 입력 검증으로 오해하는 것이다. Value Table은 Foreign Key의 check table 후보 역할을 한다. Value Table만 적어 놓고 "이제 입력값이 자동으로 테이블에 존재하는지 검사된다"고 기대하면 안 된다. Foreign Key는 CH09에서 정식으로 다룬다.

네 번째 실수는 활성화를 잊는 것이다. DDIC 객체는 저장만으로 끝나지 않는다. 활성화하지 않으면 runtime object가 최신 상태로 만들어지지 않는다. 특히 기존 Domain을 수정하면 의존 객체도 영향을 받을 수 있으므로, 활성화 로그를 확인하는 습관이 필요하다.

다섯 번째 실수는 Domain에 의미까지 넣으려는 것이다. `ZDO_AMOUNT`가 금액이라는 느낌을 주더라도 Domain의 핵심 역할은 기술 속성이다. "송장 금액", "결제 금액", "할인 금액"처럼 의미와 라벨은 Data Element에서 나눈다.

### 체험형 학습 설계

이 레슨은 기존 `CH03-L01-S01` Domain 생성 시뮬레이터를 사용한다.

- 화면 구성: SE11 Domain 유지보수 화면을 본뜬 폼, 상태 배지, toolbar, Value Range 탭을 둔다.
- 데이터: `ZDO_AMOUNT`, `ZDO_STATUS`, `ZDO_CARRID`, `ZDO_EMAIL`, `ZDO_STOCKCHG`, `ZDO_SEQNO` 예제 칩을 제공한다.
- 버튼: `저장`, `검사`, `활성화`, 예제 선택, 고정값 추가, 탭 전환을 둔다.
- 상태:
  - `신규`: 아직 저장되지 않은 객체
  - `비활성`: 저장됐지만 runtime object가 준비되지 않은 상태
  - `활성`: runtime object가 생성되어 참조 가능한 상태
  - `수정됨`: 활성화 후 속성을 바꿔 다시 활성화가 필요한 상태
  - `검사 실패`: 이름, 길이, decimal, 값 범위 오류가 있는 상태
- 피드백:
  - `CHAR` 선택 시 "DDIC는 CHAR, ABAP 변수는 c"를 보여준다.
  - `NUMC` 선택 시 "숫자 모양의 텍스트이며 계산용이 아님"을 보여준다.
  - Fixed Values와 Value Table을 동시에 넣으면 "보통 둘 중 하나만 선택"을 표시한다.
  - Value Table 입력 시 "Foreign Key 검증은 CH09에서 연결"이라고 표시한다.

학습 목표는 Domain을 만드는 클릭 순서가 아니라, 각 속성이 어떤 책임을 가지며 활성화 전후 상태가 어떻게 바뀌는지 체험하는 것이다.

### 정리

Domain은 전역으로 재사용할 기술 속성의 기준이다. Data Type, Length, Output Length, Decimal Places, Lowercase, Sign, Fixed Values, Value Table 같은 속성을 정의한다. Domain은 ABAP 코드의 `TYPE` 뒤에 직접 쓰는 타입이 아니며, Data Element가 참조한다. Fixed Values는 Domain 안의 고정 값 목록이고, Value Table은 Foreign Key의 check table 후보라는 점을 구분해야 한다. 저장만으로는 부족하고, 활성화해야 runtime에서 사용할 수 있다.

## CH03-L02 - Data Element: 의미와 라벨 입히기

### 왜 필요한가

Domain만 만들면 기술 규칙은 생긴다. 하지만 화면과 문서에서 사람이 읽을 의미는 아직 부족하다.

예를 들어 `DEC 8,2`라는 Domain이 있다고 하자. 이 규칙은 금액에도 쓸 수 있고, 단가에도 쓸 수 있고, 세금에도 쓸 수 있다. 모두 기술적으로는 "소수 둘째 자리까지 있는 숫자"지만 업무 의미는 다르다. 화면 라벨도 다르다. 사용자는 `DEC 8,2`라는 설명을 보고 값을 입력하지 않는다. 사용자는 "금액", "단가", "세금" 같은 이름을 보고 입력한다.

Data Element는 Domain 위에 의미와 라벨을 입힌다. Domain이 "값의 모양"이라면 Data Element는 "그 값이 업무에서 무엇을 뜻하는지"를 말한다.

### 무엇인가

Data Element는 DDIC data element다. 공식 문서 기준으로 Data Element는 elementary data type 또는 reference type의 technical property와, 그 타입을 참조하는 객체의 semantic meaning을 정의한다. elementary type의 기술 속성은 직접 지정할 수도 있고 Domain에서 상속받을 수도 있다.

입문 단계에서는 "Data Element는 보통 Domain을 참조하고, 그 위에 의미와 라벨을 붙인다"로 이해하면 된다.

```text
ZDO_AMOUNT        Domain
  기술 속성: DEC, 길이 8, 소수 2

ZDE_INVOICE_AMT   Data Element
  의미: 송장 금액
  라벨: 송장금액 / Invoice Amount
  참조 Domain: ZDO_AMOUNT

ZDE_PAY_AMT       Data Element
  의미: 결제 금액
  라벨: 결제금액 / Payment Amount
  참조 Domain: ZDO_AMOUNT
```

같은 Domain을 여러 Data Element가 참조할 수 있다. 이것이 Domain과 Data Element를 나누는 가장 큰 이유다. 기술 규칙은 공유하고, 의미와 라벨은 나누는 것이다.

| 구분 | Domain | Data Element |
|---|---|---|
| 핵심 질문 | 값이 어떤 모양인가? | 이 값이 무엇을 뜻하는가? |
| 예 | `CHAR 3`, `DEC 8,2` | 항공사 코드, 송장 금액 |
| 주요 속성 | Data Type, Length, Decimals, Fixed Values | Short Text, Field Labels, Documentation, Search Help, Parameter ID |
| ABAP 코드 사용 | 직접 `TYPE` 뒤에 쓰지 않음 | `DATA`, `PARAMETERS`, 테이블 필드에서 타입처럼 사용 |

Data Element의 대표 semantic property는 다음과 같다.

| 속성 | 의미 | CH03에서의 범위 |
|---|---|---|
| Short Text | Data Element의 짧은 설명 | F1/도움말과 식별용 |
| Field Label | Short, Medium, Long, Heading 라벨 | PARAMETERS/화면/ALV 라벨의 바탕 |
| Documentation | F1 field help 문서 | 존재만 이해 |
| Search Help | 입력 도움말 연결 | CH09에서 심화 |
| Parameter ID | SPA/GPA 사용자 메모리 연결 | 존재만 예고, Track-2 심화 |

CH03에서는 Short Text와 Field Label을 중심으로 다룬다. Search Help와 Parameter ID는 존재만 알고 넘어간다.

### 어떻게 확인하는가

앞 레슨에서 만든 `ZDO_STATUS`를 참조하는 Data Element를 만든다.

| 항목 | 값 |
|---|---|
| Data Element 이름 | `ZDE_STATUS` |
| Short Description | `주문 상태` |
| Domain | `ZDO_STATUS` |
| Short Label | `상태` |
| Medium Label | `주문 상태` |
| Long Label | `주문 상태 코드` |
| Heading | `상태` |

확인 순서는 다음과 같다.

1. `SE11`을 실행한다.
2. Data Type 영역에서 Data Element를 선택한다.
3. `ZDE_STATUS`를 입력하고 Create를 누른다.
4. Elementary Type을 선택한다.
5. Domain에 `ZDO_STATUS`를 지정한다.
6. Field Label 탭에서 Short, Medium, Long, Heading을 입력한다.
7. 저장, 검사, 활성화한다.

이후 ABAP 프로그램에서 Data Element를 타입으로 쓸 수 있다.

```abap
REPORT z_ch03_l02_a.

DATA lv_status TYPE zde_status.

lv_status = 'O'.

WRITE lv_status.
```

이 코드에서 `lv_status`는 `ZDE_STATUS`의 기술 속성을 따라간다. `ZDE_STATUS`가 `ZDO_STATUS`를 참조하고, `ZDO_STATUS`가 `CHAR 1`을 정의했으므로 결과적으로 `lv_status`는 한 글자 상태값을 담는 변수가 된다.

Data Element는 `PARAMETERS`에서도 쓸 수 있다.

```abap
REPORT z_ch03_l02_b.

PARAMETERS p_stat TYPE zde_status.

WRITE p_stat.
```

이 예제에서 중요한 것은 코드를 길게 쓰지 않았는데도 selection screen의 입력칸이 DDIC 정보를 일부 물려받는다는 점이다. 본격 확인은 다음 레슨에서 한다.

### 실수와 주의

첫 번째 실수는 Data Element와 Domain을 1:1로만 생각하는 것이다. 같은 Domain을 여러 Data Element가 공유할 수 있다. 공항 코드 3자리 Domain 하나를 `출발 공항`, `도착 공항`, `경유 공항` Data Element가 나누어 쓰는 식이다.

두 번째 실수는 Data Element의 Field Label을 비워 두는 것이다. 기술적으로 활성화가 되더라도 화면이나 ALV에서 사람이 읽을 라벨이 부족해진다. 초보자는 "타입만 맞으면 됐다"고 생각하기 쉬운데, SAP에서는 메타데이터가 화면 품질로 이어진다.

세 번째 실수는 Domain 없이 Data Element를 만들면 항상 틀렸다고 생각하는 것이다. 공식 문서 기준으로 Data Element는 기술 속성을 직접 정의할 수도 있다. 그러나 공통 기술 규칙을 재사용하려면 Domain을 두는 편이 좋다. CH03에서는 Domain을 먼저 만들고 Data Element가 참조하는 표준 흐름을 익힌다.

네 번째 실수는 Data Element를 바꾸면 영향이 작다고 생각하는 것이다. Data Element를 참조하는 프로그램, 테이블 필드, 화면 요소가 모두 영향을 받을 수 있다. 공식 문서도 기존 Data Element를 수정하면 모든 consumer가 영향을 받는다고 설명한다. 운영 시스템에서는 이런 변경을 가볍게 하면 안 된다.

다섯 번째 실수는 Search Help와 Parameter ID를 CH03에서 모두 이해하려는 것이다. Data Element에는 그런 속성이 있지만, Search Help 연결과 F4 설계는 CH09에서 더 정확히 다룬다. Parameter ID는 사용자 메모리와 관련된 고급 편의 기능이므로 지금은 "그런 속성이 있다" 정도로만 둔다.

### 체험형 학습 설계

이 레슨에는 "Domain에서 Data Element로 의미 입히기" 시뮬레이터를 설계한다.

- 화면 구성: 왼쪽에는 Domain 카드, 가운데에는 Data Element 카드, 오른쪽에는 사용처 미리보기 카드를 둔다.
- 데이터:
  - Domain 카드: `ZDO_AMOUNT`, `DEC`, Length `8`, Decimals `2`
  - Data Element 카드 1: `ZDE_INVOICE_AMT`, 라벨 `송장 금액`
  - Data Element 카드 2: `ZDE_PAY_AMT`, 라벨 `결제 금액`
  - 사용처: `DATA lv_amount TYPE ...`, `PARAMETERS p_amt TYPE ...`, 테이블 필드 미리보기
- 버튼: `Domain 선택`, `Data Element 생성`, `라벨 입력`, `활성화`, `사용처 미리보기`, `라벨 비우기 실험`, `Domain 변경 영향 보기`를 둔다.
- 상태:
  - `Domain 없음`: Data Element가 기술 속성을 상속받지 못함
  - `라벨 미입력`: 화면 미리보기에서 parameter name만 보이거나 라벨이 빈약함
  - `활성`: 프로그램 타입 참조 가능
  - `공유`: 여러 Data Element가 같은 Domain을 참조함
  - `영향 경고`: Domain 또는 Data Element 변경 시 사용처 카드가 동시에 강조됨
- 피드백:
  - "Domain은 모양, Data Element는 의미"를 카드 색으로 분리한다.
  - 같은 `DEC 8,2`라도 `송장 금액`과 `결제 금액`은 다른 Data Element가 될 수 있음을 보여준다.
  - 라벨을 입력하면 selection screen 미리보기와 ALV heading 미리보기의 텍스트가 바뀌게 한다.

이 체험의 핵심은 "타입 재사용"이 단순한 문법 줄이기가 아니라, 화면과 문서까지 이어지는 메타데이터 설계라는 점을 느끼게 하는 것이다.

### 정리

Data Element는 Domain이 가진 기술 속성 위에 의미와 라벨을 붙인다. 같은 Domain을 여러 Data Element가 공유할 수 있으므로 기술 규칙은 통일하고 업무 의미는 분리할 수 있다. ABAP 프로그램에서는 Domain을 직접 쓰지 않고 Data Element를 `TYPE` 뒤에 사용한다. Field Label과 Documentation은 화면 품질과 도움말 품질에 영향을 준다.

## CH03-L03 - PARAMETERS: 라벨과 F4 자동 적용

### 왜 필요한가

Domain과 Data Element를 만드는 일은 처음에는 번거롭다. "그냥 `PARAMETERS p_stat TYPE c LENGTH 1.`이라고 쓰면 되지 않나?"라고 느낄 수 있다. 하지만 DDIC에 공들여 정의한 정보는 화면에서 보상으로 돌아온다.

프로그램 실행 전에 사용자가 값을 입력하는 화면을 selection screen이라고 한다. `PARAMETERS`는 selection screen에 입력 필드 한 칸을 만드는 가장 단순한 문장이다. 이 입력칸이 Data Element를 참조하면 길이, 라벨, field help, input help 같은 화면 관련 성격을 일부 물려받을 수 있다.

CH03의 마지막 레슨은 "DDIC를 왜 만들었는가?"에 대한 첫 번째 보상 확인이다. 전역 타입과 라벨을 만들어 두면 입력 화면이 더 똑똑해진다.

### 무엇인가

`PARAMETERS`는 selection parameter를 선언한다. 공식 문서 기준으로 selection parameter는 ABAP 프로그램 안의 global elementary data object와 selection screen의 input field를 함께 만든다.

가장 단순한 예는 다음과 같다.

```abap
REPORT z_ch03_l03_a.

PARAMETERS p_stat TYPE zde_status.

WRITE p_stat.
```

이 코드를 실행하면 바로 리스트가 출력되는 것이 아니라 selection screen이 먼저 열린다. 화면에는 `p_stat` 값을 입력할 수 있는 칸이 생긴다. 사용자가 값을 입력하고 F8을 누르면 그 값이 프로그램의 전역 데이터 객체 `p_stat`에 들어간다. 이후 `WRITE p_stat.`가 실행되어 입력값을 출력한다.

`PARAMETERS` 이름은 최대 8자다. 그래서 `p_status`는 8자라 가능하지만, `p_order_status`처럼 긴 이름은 selection parameter 이름으로 사용할 수 없다. 교육 코드에서는 `p_stat`, `p_amt`, `p_name`처럼 짧고 의미가 드러나는 이름을 사용한다.

Data Element를 사용하면 다음 효과를 기대할 수 있다.

| 효과 | 설명 |
|---|---|
| 입력 길이 | Data Element가 참조한 DDIC 타입의 길이를 따른다 |
| 라벨 후보 | Data Element의 field label 또는 selection text가 화면 설명으로 쓰일 수 있다 |
| F1 field help | Data Element short text/documentation이 도움말의 바탕이 된다 |
| F4 input help | DDIC fixed values, search help, check table 연결 등에 따라 도움말이 나타날 수 있다 |
| 값 검증 | fixed values 검증은 `VALUE CHECK`를 사용해야 명시적으로 수행된다 |

여기서 마지막 줄이 중요하다. 원본 자료처럼 "Data Element를 쓰면 입력검증이 자동으로 다 된다"라고 말하면 과장이다. 공식 문서 기준으로 `PARAMETERS`의 input field는 Screen Painter에서 Dictionary reference로 만든 dynpro field와 완전히 같은 real DDIC reference가 아니다. 고정값에 대한 value check는 자동이 아니라 `VALUE CHECK` 추가 구문으로 수행할 수 있다.

따라서 CH03에서 권장하는 기본 실험은 다음 두 가지다.

```abap
REPORT z_ch03_l03_b.

PARAMETERS p_stat TYPE zde_status.

WRITE p_stat.
```

```abap
REPORT z_ch03_l03_c.

PARAMETERS p_stat TYPE zde_status VALUE CHECK.

WRITE p_stat.
```

첫 번째는 DDIC 타입 참조와 라벨/F4 확인용이다. 두 번째는 Domain fixed values를 기준으로 값 검증까지 확인하는 실험용이다.

### 유용한 PARAMETERS 옵션

CH03에서 다룰 `PARAMETERS` 옵션은 세 개로 제한한다.

```abap
REPORT z_ch03_l03_d.

PARAMETERS p_stat TYPE zde_status OBLIGATORY.
PARAMETERS p_cnt  TYPE i DEFAULT 10.
PARAMETERS p_name TYPE c LENGTH 20 LOWER CASE.

WRITE: / p_stat,
       / p_cnt,
       / p_name.
```

| 옵션 | 의미 | 확인 방법 |
|---|---|---|
| `OBLIGATORY` | 필수 입력 | 빈칸으로 F8을 눌러 실행이 막히는지 확인 |
| `DEFAULT` | 시작값 | selection screen이 열릴 때 값이 미리 들어오는지 확인 |
| `LOWER CASE` | 소문자 보존 | 입력한 소문자가 대문자로 바뀌지 않는지 확인 |

`PARAMETERS`에는 checkbox, radio button, listbox, block, pushbutton 같은 UI 옵션도 있다. 그러나 이것들은 selection screen UI 구성의 주제이며 CH15에서 정식으로 다룬다. CH03에서는 입력 필드 한 칸과 DDIC 연결만 확실히 잡는다.

### 어떻게 확인하는가

실습은 세 단계로 나눈다.

첫째, Data Element 없이 직접 타입을 준다.

```abap
REPORT z_ch03_l03_check_a.

PARAMETERS p_stat TYPE c LENGTH 1.

WRITE p_stat.
```

확인할 점:

- selection screen에 입력칸은 생긴다.
- 그러나 이 입력칸이 업무적으로 "상태"인지 알 수 있는 DDIC 라벨은 부족하다.
- F4를 눌러도 Domain fixed values 기반 목록을 기대하기 어렵다.

둘째, Data Element를 사용한다.

```abap
REPORT z_ch03_l03_check_b.

PARAMETERS p_stat TYPE zde_status.

WRITE p_stat.
```

확인할 점:

- 입력칸의 길이가 Data Element의 기술 속성을 따른다.
- 라벨 또는 도움말이 DDIC 정의를 바탕으로 더 의미 있게 보일 수 있다.
- F4를 눌러 fixed values 또는 연결된 도움말이 보이는지 확인한다.

셋째, fixed values 검증까지 확인한다.

```abap
REPORT z_ch03_l03_check_c.

PARAMETERS p_stat TYPE zde_status VALUE CHECK.

WRITE p_stat.
```

확인할 점:

- Domain fixed values가 `O`, `C`라면 `X` 같은 값을 입력하고 F8을 눌러 본다.
- `VALUE CHECK`가 있으면 현재 입력값이 Domain fixed values에 맞는지 검사된다.
- `VALUE CHECK` 없이 F4 목록만 보고 "검증도 자동이다"라고 단정하지 않는다.

원본 예제에는 `START-OF-SELECTION`이 등장한다. 이 이벤트는 CH15에서 정식으로 배운다. CH03에서는 복사 실행용으로만 볼 수 있으며, 지금은 "selection screen 입력이 끝난 뒤 실행되는 처리 구간" 정도로만 받아들인다.

```abap
REPORT z_ch03_l03_check_d.

PARAMETERS p_amt TYPE zde_amount.

START-OF-SELECTION. " [선행 사용] CH15에서 정식으로 배움
  WRITE: / '입력값:', p_amt.
```

이 예제에서 분석할 대상은 `START-OF-SELECTION`이 아니라 `PARAMETERS p_amt TYPE zde_amount.`다.

### 실수와 주의

첫 번째 실수는 `PARAMETERS` 이름을 길게 짓는 것이다. selection parameter 이름은 최대 8자다. `p_order_status`처럼 길게 쓰면 안 된다. `p_stat`, `p_carr`, `p_amt`처럼 짧게 쓴다.

두 번째 실수는 Data Element의 field label을 만들지 않고 "라벨이 왜 안 뜨지?"라고 생각하는 것이다. 화면 설명은 프로그램의 selection text나 DDIC field label 같은 메타데이터에 의존한다. Data Element의 라벨과 프로그램 Text Elements를 함께 점검한다.

세 번째 실수는 F4와 검증을 같은 것으로 보는 것이다. F4는 값을 고르는 도움말이다. 검증은 사용자가 입력한 값이 허용 범위에 맞는지 막는 일이다. `PARAMETERS`에서 Domain fixed values를 기준으로 검증하려면 `VALUE CHECK`를 명시하는 흐름을 알아야 한다.

네 번째 실수는 `LOWER CASE`를 빼고 이름이나 이메일을 입력하는 것이다. character-like selection parameter는 기본적으로 대문자로 변환될 수 있다. 소문자를 보존해야 하는 입력값이면 `LOWER CASE`를 검토한다. 단, Domain에도 Lowercase Letters 속성이 있다는 점을 함께 기억한다.

다섯 번째 실수는 `PARAMETERS`로 모든 입력 화면을 만들 수 있다고 생각하는 것이다. `PARAMETERS`는 가장 단순한 한 칸 입력이다. 여러 값 범위는 CH12의 `SELECT-OPTIONS`, 화면 구성과 검증 이벤트는 CH15, 직접 설계한 dynpro 화면은 CH16에서 다룬다.

### 체험형 학습 설계

이 레슨에는 "DDIC 보상 확인 selection screen" 시뮬레이터를 설계한다.

- 화면 구성: 왼쪽에는 ABAP 코드 카드, 가운데에는 selection screen 미리보기, 오른쪽에는 DDIC 메타데이터 패널을 둔다.
- 데이터:
  - 직접 타입 예제: `PARAMETERS p_stat TYPE c LENGTH 1.`
  - Data Element 예제: `PARAMETERS p_stat TYPE zde_status.`
  - 검증 예제: `PARAMETERS p_stat TYPE zde_status VALUE CHECK.`
  - 옵션 예제: `OBLIGATORY`, `DEFAULT`, `LOWER CASE`
- 버튼: `직접 타입 실행`, `Data Element 타입 실행`, `F4 누르기`, `X 입력 후 실행`, `VALUE CHECK 켜기`, `OBLIGATORY 실험`, `LOWER CASE 실험`, `다시하기`를 둔다.
- 상태:
  - `직접 타입`: 입력칸만 있고 라벨/F4 메타데이터가 약함
  - `DDIC 참조`: 라벨 후보와 F4 후보가 표시됨
  - `F4 열림`: fixed values 목록 `O/C`가 보임
  - `검증 없음`: 목록 밖 값도 통과할 수 있음을 경고
  - `VALUE CHECK`: fixed values 밖 값이 막힘
  - `필수 입력 오류`: 빈칸이면 F8 실행 불가
  - `대문자 변환`: `LOWER CASE` 없을 때 `jung`이 `JUNG`으로 바뀌는 모습
- 피드백:
  - "F4는 선택 도움말, VALUE CHECK는 검증"을 분리해서 표시한다.
  - Data Element의 label card와 selection screen label을 선으로 연결한다.
  - `START-OF-SELECTION`은 CH15 선행 사용이라고 표시하고 클릭해도 상세 설명은 열지 않는다.

이 체험의 핵심은 `PARAMETERS`가 단순 입력칸을 만들 뿐 아니라, DDIC 메타데이터와 연결될 때 화면 품질이 좋아진다는 점을 확인하는 것이다.

### 정리

`PARAMETERS`는 selection screen에 입력 필드 한 칸을 만들고, 같은 이름의 global elementary data object를 프로그램에 만든다. Data Element를 타입으로 쓰면 길이, 라벨, field help, input help 같은 화면 관련 정보를 활용할 수 있다. F4는 도움말이고 검증은 별도 개념이다. Domain fixed values를 기준으로 검사하려면 `VALUE CHECK`를 사용한다. `OBLIGATORY`, `DEFAULT`, `LOWER CASE`는 CH03에서 확인할 수 있는 기본 옵션이며, selection screen 심화는 CH15에서 다룬다.

## 챕터 전체 정리

CH03는 CH02의 local type 감각을 전역 Dictionary 설계로 확장한다.

| 레슨 | 핵심 |
|---|---|
| L01 | Domain은 기술 속성이다. DDIC 타입, 길이, 출력 길이, 소수, 소문자, 고정값, Value Table을 정의한다 |
| L02 | Data Element는 Domain 위에 의미와 라벨을 입힌다. 프로그램은 Domain이 아니라 Data Element를 타입으로 사용한다 |
| L03 | `PARAMETERS`는 selection screen 입력칸을 만들고, Data Element를 통해 DDIC 메타데이터의 보상을 확인한다 |

이 장을 끝낸 학습자는 다음 질문에 답할 수 있어야 한다.

- 왜 CH02의 local type만으로는 회사 공통 규칙을 관리하기 어려운가?
- Domain과 Data Element의 책임은 어떻게 다른가?
- Fixed Values와 Value Table은 어떤 차이가 있는가?
- DDIC 객체는 왜 저장 후 활성화가 필요한가?
- `PARAMETERS`에서 Data Element를 쓰면 화면에서 무엇이 좋아지는가?
- F4 도움말과 입력값 검증은 왜 같은 말이 아닌가?

다음 CH04에서는 `PARAMETERS`로 받은 값을 계산하고, 조건에 따라 나누고, 반복해서 처리하는 방법을 배운다. 즉 CH03가 "값을 입력받는 입구"를 만들었다면, CH04는 그 값을 프로그램 로직으로 움직이게 하는 장이다.
