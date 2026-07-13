# CH05_REWRITE - Structure, Local Structure, DDIC Structure

> 기준 소스: `content/abap/CH05/_chapter.md`, `content/abap/CH05/CH05-L01.md` ~ `CH05-L05.md`
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 기존 `reference/codex_0625` 진단
> 공식 문서 확인: `C:\ABAP_DOCU_HTML`의 structure data object, component selector, DATA BEGIN OF, DDIC structure, include structure, append structure, CLEAR, MOVE-CORRESPONDING 항목을 수동 확인

## 챕터 설계

CH04에서 학습자는 구구단을 만들었다. 단수는 `gv_dan`, 곱하는 수는 `gv_mul`, 결과는 `gv_res`에 따로 담았다. 세 변수는 사실 "구구단 한 줄"이라는 한 덩어리다. 하지만 코드에서는 흩어져 있다.

흩어진 값은 관리가 어렵다. 초기화할 때도 세 변수를 기억해야 하고, 다른 곳으로 넘길 때도 세 변수를 모두 챙겨야 하며, 디버거에서도 세 값이 같은 업무 단위라는 사실이 바로 보이지 않는다. 이 장은 이 불편을 해결한다.

CH05의 목표는 관련된 여러 값을 Structure(구조체) 하나로 묶는 것이다.

1. Local Structure로 한 프로그램 안에서 값을 묶는다.
2. DDIC Structure로 구조 모양을 전역에서 공유한다.
3. 중첩 구조, Include Structure, Append Structure의 차이를 구분한다.
4. 구조체를 통째로 복사하고, 비우고, 같은 이름 필드만 옮긴다.
5. 구구단 한 줄을 Structure로 만들고, 왜 CH06 Internal Table이 필요한지 확인한다.

원장에는 CH05가 4개 축으로 정리되어 있지만, 현재 `content/abap/CH05` 실제 원본은 L03 "중첩 · .INCLUDE · .APPEND"를 포함한 5개 레슨이다. 이 산출물은 원본 MD를 메인으로 삼기 때문에 5개 레슨을 모두 다룬다. 다만 `.APPEND`는 표준 확장 안정성의 입구만 설명하고, 확장 전략의 깊은 내용은 CH29 이후로 남긴다.

R15 게이팅도 유지한다. CH05는 classic-first 구간이다. `DATA(...)`, constructor expression, `VALUE`, `NEW`, modern Open SQL, modern `CORRESPONDING #( )`는 사용하지 않는다. 구조체 필드 접근은 `-`, 구조체 복사는 classic 대입과 `MOVE-CORRESPONDING`으로 설명한다.

## CH05-L01 - Local Structure: BEGIN OF ~ END OF

### 왜 필요한가

CH04 구구단 코드를 다시 보자.

```abap
DATA gv_dan TYPE i.
DATA gv_mul TYPE i.
DATA gv_res TYPE i.

gv_dan = 2.

DO 9 TIMES.
  gv_mul = sy-index.
  gv_res = gv_dan * gv_mul.
  WRITE: / gv_dan, 'x', gv_mul, '=', gv_res.
ENDDO.
```

이 코드는 동작한다. 하지만 의미가 흩어져 있다. `gv_dan`, `gv_mul`, `gv_res`는 각각 따로 선언되어 있지만 실제로는 한 줄을 이룬다.

```text
구구단 한 줄 = 단수 + 곱하는 수 + 결과
```

업무 프로그램에서도 같은 문제가 생긴다.

| 업무 한 건 | 흩어진 변수 예 |
|---|---|
| 사원 한 명 | 이름, 부서, 직급, 급여 |
| 주문 한 건 | 주문번호, 고객, 금액, 상태 |
| 항공편 한 건 | 항공사, 항공편번호, 출발일, 좌석수 |

관련 값이 흩어져 있으면 코드를 읽는 사람이 "이 값들이 한 건을 이룬다"는 사실을 머릿속으로 조립해야 한다. Structure는 이 조립을 코드 자체에 표현한다.

### 무엇인가

Structure는 여러 component(컴포넌트, 구조체 안의 필드)를 가진 하나의 data object다. 공식 문서 기준으로 구조체는 여러 component가 메모리에 연속적으로 놓인 structured data object다.

Local Structure는 프로그램 안에서 `DATA: BEGIN OF ... END OF ...`로 선언한다.

```abap
DATA: BEGIN OF ls_line,
        dan    TYPE i,
        mul    TYPE i,
        result TYPE i,
      END OF ls_line.
```

`ls_line`은 변수 하나다. 하지만 그 안에는 `dan`, `mul`, `result`라는 세 칸이 있다.

```text
ls_line
  dan
  mul
  result
```

구조체 안의 component는 하이픈 `-`로 접근한다. 공식 문서의 structure component selector도 `struct-comp` 형태를 설명한다.

```abap
ls_line-dan    = 2.
ls_line-mul    = 3.
ls_line-result = ls_line-dan * ls_line-mul.

WRITE: / ls_line-dan, 'x', ls_line-mul, '=', ls_line-result.
```

ABAP에서 구조체 접근은 점이 아니라 하이픈이다.

```abap
" 올바름
ls_line-dan = 2.

" 잘못된 생각
" ls_line.dan = 2.
```

구조체를 변수로 바로 선언할 수도 있고, 타입 모양을 먼저 만든 뒤 그 타입으로 변수를 만들 수도 있다.

```abap
TYPES: BEGIN OF ty_person,
         name   TYPE c LENGTH 20,
         age    TYPE i,
         amount TYPE p LENGTH 8 DECIMALS 2,
       END OF ty_person.

DATA ls_person TYPE ty_person.

ls_person-name   = '정훈영'.
ls_person-age    = 30.
ls_person-amount = '1500.50'.
```

`TYPES`는 모양이고 `DATA`는 실제 변수다. 초보자가 가장 자주 섞는 부분이다.

| 구분 | 의미 | 예 |
|---|---|---|
| `TYPES ty_person ...` | 구조체의 설계도 | 아직 값이 들어가지 않음 |
| `DATA ls_person TYPE ty_person` | 설계도로 만든 실제 변수 | 값을 넣을 수 있음 |
| `ls_person-name` | 실제 변수 안의 component | `정훈영` 같은 값 저장 |

`ls_` 접두어는 local structure 변수라는 관례로 자주 사용한다. 강제 문법은 아니지만, 코드 리뷰에서 "이 변수는 구조체 한 건이구나"를 빨리 알 수 있게 한다.

### 어떻게 확인하는가

다음 프로그램을 실행한다.

```abap
REPORT z_ch05_l01_local_structure.

DATA: BEGIN OF ls_line,
        dan    TYPE i,
        mul    TYPE i,
        result TYPE i,
      END OF ls_line.

ls_line-dan    = 2.
ls_line-mul    = 3.
ls_line-result = ls_line-dan * ls_line-mul.

WRITE: / ls_line-dan, 'x', ls_line-mul, '=', ls_line-result.
```

확인할 것은 출력보다 디버거다.

1. `ls_line-dan = 2.` 앞에 breakpoint를 둔다.
2. 디버거에서 `ls_line`을 변수 목록에 올린다.
3. `ls_line`을 펼친다.
4. F5로 한 줄씩 실행하며 `dan`, `mul`, `result`가 채워지는지 본다.

디버거에서 `ls_line`을 펼쳐 보면 변수 하나 안에 세 component가 들어 있는 것이 보인다. 이것이 Structure의 핵심이다.

### 실수와 주의

첫 번째 실수는 component 접근에 점을 쓰는 것이다. ABAP 구조체는 `ls_line-dan`처럼 하이픈을 쓴다.

두 번째 실수는 `END OF` 이름을 잘못 닫는 것이다.

```abap
DATA: BEGIN OF ls_line,
        dan TYPE i,
      END OF ls_other.   " 잘못된 이름
```

`BEGIN OF ls_line`으로 시작했으면 `END OF ls_line`으로 닫아야 한다.

세 번째 실수는 타입과 변수를 구분하지 못하는 것이다.

```abap
TYPES: BEGIN OF ty_person,
         name TYPE c LENGTH 20,
       END OF ty_person.

" ty_person-name = '정훈영'.  " 잘못된 생각: ty_person은 타입
```

값은 `DATA`로 만든 변수에 넣는다.

```abap
DATA ls_person TYPE ty_person.

ls_person-name = '정훈영'.
```

네 번째 실수는 Structure 하나가 여러 줄을 담는다고 오해하는 것이다. Structure 변수 하나는 한 건이다. 81개 구구단 줄을 동시에 담으려면 CH06의 Internal Table이 필요하다.

### 체험 설계

기존 임베드 `embeds/abap/CH05-L01-S01.html`은 구조체 스텝 디버거다.

| 요소 | 설계 |
|---|---|
| 버튼 | `시작`, `다음`, `전체 출력`, `현재 행`, `다시하기` |
| 상태 | 실행 전, component별 값 채움, 완료 |
| 데이터 | `ls_person-name`, `ls_person-age`, `ls_person-amount` |
| 피드백 | "한 변수 `ls_person` 안에 세 component가 함께 들어 있음" |
| 시각화 | 구조체 카드 하나를 펼치면 component 행 3개가 보이는 방식 |

확장 체험으로는 "흩어진 변수 보기"와 "구조체 보기" 전환 버튼을 둔다. 흩어진 변수 화면에서는 `gv_name`, `gv_age`, `gv_amount`가 따로 보이고, 구조체 화면에서는 `ls_person` 아래로 세 component가 접혀 보이게 한다. 초보자는 이 비교를 통해 Structure가 단순 문법이 아니라 의미 묶음이라는 사실을 이해한다.

### 정리

Local Structure는 한 프로그램 안에서 관련 값을 하나로 묶는 방법이다. `BEGIN OF`와 `END OF` 사이에 component를 선언하고, `ls_line-dan`처럼 하이픈으로 접근한다. Structure 하나는 한 건이다. 여러 건을 담는 방법은 CH06에서 다룬다.

## CH05-L02 - DDIC Structure

### 왜 필요한가

Local Structure는 한 프로그램 안에서는 좋다. 하지만 같은 구조가 여러 프로그램에서 필요하면 문제가 생긴다.

예를 들어 주문 요약 구조가 여러 리포트에서 필요하다고 하자.

```abap
DATA: BEGIN OF ls_order,
        order_id TYPE c LENGTH 10,
        customer TYPE c LENGTH 20,
        amount   TYPE p LENGTH 8 DECIMALS 2,
      END OF ls_order.
```

이 모양을 프로그램마다 복사하면 언젠가 달라진다. 어떤 프로그램은 `amount` 길이를 8로, 어떤 프로그램은 11로, 어떤 프로그램은 고객명을 30자리로 만들 수 있다. 구조의 모양이 달라지면 같은 업무 데이터인데 서로 호환되지 않는다.

CH03에서 Domain과 Data Element를 전역으로 올렸듯, Structure의 모양도 전역으로 올릴 수 있다. 이것이 DDIC Structure다.

### 무엇인가

DDIC Structure는 ABAP Dictionary에 저장되는 전역 structured type이다. 공식 문서 기준으로 DDIC Structure는 다른 data type을 component로 포함하는 structured type을 정의한다. component는 elementary data type, reference type, structured type, table type이 될 수 있다.

입문 단계에서는 다음처럼 이해하면 충분하다.

```text
Local Structure
  - 프로그램 안에만 있음
  - 그 프로그램에서만 쓰는 임시 한 건에 적합

DDIC Structure
  - ABAP Dictionary에 있음
  - 여러 프로그램, 화면, 테이블, 인터페이스가 공유할 수 있음
```

SE11에서 Structure를 만드는 기본 흐름은 다음이다.

1. `SE11` 실행
2. Data Type 선택
3. 이름 입력: 예 `ZST_PERSON`
4. Create
5. Structure 선택
6. component 추가
7. 각 component의 typing method와 type 지정
8. 저장, 검사, 활성화

예시는 다음과 같다.

| Component | Typing | Type |
|---|---|---|
| `NAME` | Data Element | `ZDE_NAME` |
| `AGE` | Data Element | `ZDE_AGE` |
| `AMOUNT` | Data Element | `ZDE_AMOUNT` |

가능하면 component 타입은 Data Element를 사용한다. 표준 타입을 직접 줄 수도 있지만, Data Element를 사용하면 라벨, 문서, F4 도움말 같은 의미 정보까지 이어진다.

프로그램에서는 DDIC Structure 이름을 타입처럼 사용한다.

```abap
REPORT z_ch05_l02_ddic_structure.

DATA ls_person TYPE zst_person.

ls_person-name = '정훈영'.
WRITE: / ls_person-name.
```

사용법은 Local Structure와 같다. 차이는 "정의가 어디 사는가"다.

| 비교 | Local Structure | DDIC Structure |
|---|---|---|
| 정의 위치 | 프로그램 안 | ABAP Dictionary |
| 재사용 | 해당 프로그램 중심 | 여러 객체에서 공유 |
| 변경 영향 | 프로그램 하나 | 참조하는 여러 객체 |
| 라벨/문서/F4 | 직접 없음 | Data Element 연결 시 활용 |
| 활성화 | 프로그램 활성화 | DDIC 객체 활성화 필요 |

DDIC 객체 중 Domain은 변수 타입으로 직접 쓰지 않는다. CH03에서 배웠듯 Domain은 Data Element를 통해 사용한다.

| DDIC 객체 | 변수/컴포넌트 타입으로 사용 | 설명 |
|---|---|---|
| Data Element | 가능 | 가장 흔한 component 타입 |
| Structure | 가능 | 구조 안의 구조, 또는 변수 타입 |
| Transparent Table | 가능 | 테이블 한 행의 구조로 사용 |
| View | 가능 | View 결과 한 행의 구조로 사용 |
| Table Type | 가능 | 내부 테이블 타입. CH06 이후 본격 |
| Domain | 직접 사용하지 않음 | Data Element를 거쳐 사용 |

### 어떻게 확인하는가

SE11에서 `ZST_PERSON` 같은 Structure를 만든 뒤 다음을 확인한다.

| 확인 위치 | 확인 내용 |
|---|---|
| SE11 component 목록 | `NAME`, `AGE`, `AMOUNT`가 있는지 |
| 각 component 타입 | Data Element를 참조하는지 |
| 활성화 상태 | inactive가 아니라 active인지 |
| 프로그램 syntax check | `DATA ls_person TYPE zst_person.`가 통과하는지 |
| 디버거 | `ls_person`을 펼쳤을 때 DDIC component가 보이는지 |

테스트 프로그램은 다음처럼 간단히 만든다.

```abap
REPORT z_ch05_l02_use_ddic.

DATA ls_person TYPE zst_person.

ls_person-name   = '정훈영'.
ls_person-age    = 30.
ls_person-amount = '1500.50'.

WRITE: / ls_person-name, ls_person-age, ls_person-amount.
```

### 실수와 주의

첫 번째 실수는 DDIC Structure를 만들고 활성화하지 않는 것이다. 저장만 되어 있고 active runtime object가 없으면 프로그램에서 타입으로 쓰기 어렵다. SE11에서 활성화 상태를 반드시 확인한다.

두 번째 실수는 component를 전부 built-in type으로 직접 정의하는 것이다.

```text
NAME  CHAR 20
AGE   INT4
```

이렇게도 가능하지만 의미 정보가 약하다. 업무 필드라면 Data Element를 사용해 라벨과 문서를 연결하는 편이 좋다.

세 번째 실수는 Local Structure와 DDIC Structure를 경쟁 관계로 보는 것이다. 둘은 선택 기준이 다르다.

| 상황 | 선택 |
|---|---|
| 프로그램 안에서 잠깐 쓰는 출력용 묶음 | Local Structure |
| 여러 프로그램이 공유하는 업무 한 건의 모양 | DDIC Structure |
| 테이블, 화면, 인터페이스와 의미를 맞춰야 함 | DDIC Structure |

네 번째 실수는 DDIC Structure를 데이터 저장소로 오해하는 것이다. Structure는 "한 행의 모양"이지 데이터를 저장하는 DB 테이블이 아니다. 영속 저장은 CH07 Transparent Table에서 다룬다.

### 체험 설계

L02에는 기존 embed가 없으므로 신규 체험 설계를 글로 제안한다.

| 요소 | 설계 |
|---|---|
| 화면 | 왼쪽 Local Structure 코드, 오른쪽 SE11 DDIC Structure 카드 |
| 버튼 | `Local로 보기`, `DDIC로 보기`, `활성화`, `프로그램에서 사용` |
| 상태 | 신규, 저장됨, 검사 실패, 활성화됨, 프로그램 참조 성공 |
| 데이터 | component 이름, Data Element, 라벨, 활성화 여부 |
| 피드백 | "DDIC Structure는 값을 저장하지 않고 타입 모양을 공유함" |

학습자는 component 타입을 built-in으로 둘 때와 Data Element로 둘 때를 토글한다. Data Element를 선택하면 라벨과 F4 정보가 연결되는 모습을 카드에 표시한다. 이 체험은 CH03 Domain/Data Element와 CH05 Structure의 연결을 복습하게 만든다.

### 정리

DDIC Structure는 구조체 모양을 전역으로 공유하는 ABAP Dictionary 객체다. Local Structure와 사용법은 비슷하지만 정의 위치와 영향 범위가 다르다. 여러 프로그램, 테이블, 화면이 같은 한 건의 모양을 써야 한다면 DDIC Structure를 고려한다.

## CH05-L03 - 구조 재사용: 중첩, Include, Append

### 왜 필요한가

구조체를 만들다 보면 같은 필드 묶음이 반복된다.

```text
생성자, 생성일, 변경자, 변경일
```

이런 감사 필드는 여러 구조와 테이블에 반복해서 들어간다. 매번 손으로 복사하면 이름이 달라지거나 타입이 달라질 수 있다. 재사용 가능한 필드 묶음을 이미 만들어 두고 다른 구조에서 활용하면 이런 차이를 줄일 수 있다.

CH05-L03에서는 구조를 재사용하는 세 가지 방식을 구분한다.

| 방식 | 핵심 느낌 |
|---|---|
| 중첩 구조 | 구조 안에 구조가 component로 들어감 |
| Include Structure | 다른 구조의 component가 펼쳐져 들어감 |
| Append Structure | 기존 DDIC 구조나 테이블에 고객 필드를 별도 구조로 덧붙임 |

### 무엇인가

중첩 구조는 구조 안에 다른 구조를 component로 넣는 방식이다.

```abap
TYPES: BEGIN OF ty_address,
         city TYPE c LENGTH 20,
         zip  TYPE c LENGTH 10,
       END OF ty_address.

DATA: BEGIN OF ls_person,
        name    TYPE c LENGTH 20,
        address TYPE ty_address,
      END OF ls_person.

ls_person-name         = '정훈영'.
ls_person-address-city = 'Seoul'.
ls_person-address-zip  = '04500'.
```

접근할 때 단계가 생긴다. `ls_person-address-city`처럼 하이픈을 두 번 사용한다. 중첩 구조의 장점은 묶음이 눈에 보인다는 것이다. 주소는 `address` 아래에 모여 있다.

Include Structure는 DDIC Structure 안에서 다른 구조의 component를 펼쳐 넣는 방식이다. 공식 문서 기준으로 include structure는 다른 DDIC structure, database table, view의 component를 포함할 수 있다.

예를 들어 `ZST_AUDIT`에 다음 component가 있다고 하자.

| Component | 의미 |
|---|---|
| `CREATED_BY` | 생성자 |
| `CREATED_ON` | 생성일 |
| `CHANGED_BY` | 변경자 |
| `CHANGED_ON` | 변경일 |

`ZST_ORDER`에서 `ZST_AUDIT`를 include하면 `ZST_ORDER` 안에 감사 필드가 직접 component처럼 펼쳐진다.

```text
ZST_ORDER
  ORDER_ID
  CUSTOMER
  AMOUNT
  .INCLUDE ZST_AUDIT
  CREATED_BY
  CREATED_ON
  CHANGED_BY
  CHANGED_ON
```

프로그램에서 접근할 때는 중첩처럼 `ls_order-audit-created_by`가 아니라, 펼쳐진 component로 접근한다.

```abap
DATA ls_order TYPE zst_order.

ls_order-order_id   = 'O1000'.
ls_order-created_by = sy-uname.
ls_order-created_on = sy-datum.
```

Append Structure는 이미 존재하는 DDIC Structure나 DDIC database table에 고객 필드를 덧붙이는 확장 방식이다. 공식 문서 기준으로 append structure는 ABAP Dictionary의 다른 DDIC structure나 database table에 append되어 component를 추가한다. 고객 시스템에서는 SAP가 제공한 구조나 테이블에 append structure를 붙일 수 있다.

입문 단계에서 기억할 핵심은 하나다. SAP 표준 구조를 직접 수정하지 않고, 내 필드를 별도 append structure로 더한다.

| 구분 | 중첩 | Include | Append |
|---|---|---|---|
| 결과 모양 | 구조 안에 하위 구조 | component가 펼쳐짐 | 기존 DDIC 객체에 별도 확장으로 추가 |
| 접근 | `ls-head-field` | `ls-field` | 추가 후 `ls-zzfield`처럼 접근 |
| 주 사용처 | 의미 묶음 보존 | 공통 필드 묶음 재사용 | 표준/공유 객체 확장 |
| 주의 | 단계 접근 필요 | 이름 충돌 주의 | 표준 직접 수정 금지 |

### 어떻게 확인하는가

Local 예제로 중첩 구조를 먼저 확인한다.

```abap
REPORT z_ch05_l03_nested.

TYPES: BEGIN OF ty_address,
         city TYPE c LENGTH 20,
         zip  TYPE c LENGTH 10,
       END OF ty_address.

DATA: BEGIN OF ls_person,
        name    TYPE c LENGTH 20,
        address TYPE ty_address,
      END OF ls_person.

ls_person-name         = '정훈영'.
ls_person-address-city = 'Seoul'.
ls_person-address-zip  = '04500'.

WRITE: / ls_person-name.
WRITE: / ls_person-address-city.
WRITE: / ls_person-address-zip.
```

디버거에서 `ls_person`을 펼치면 `address`라는 하위 구조가 보이고, 그 안에 `city`, `zip`이 보인다.

DDIC Include는 SE11에서 확인한다.

1. `ZST_AUDIT` 구조를 만든다.
2. `ZST_ORDER` 구조를 만든다.
3. `ZST_ORDER`에 include로 `ZST_AUDIT`를 넣는다.
4. component 목록에서 감사 필드가 펼쳐져 보이는지 확인한다.
5. 활성화 후 프로그램에서 `ls_order-created_by`처럼 접근한다.

Append Structure는 실제 표준 객체에 실습으로 적용하지 않는 것이 안전하다. 학습 시뮬레이터에서는 "표준 구조 카드"와 "append structure 카드"를 분리해 보여 주고, append를 적용하면 표준 원본은 잠긴 상태로 두고 추가 필드만 확장 영역에 붙는 모습을 보여 준다.

### 실수와 주의

첫 번째 실수는 중첩 구조인데 하이픈 단계를 빼는 것이다.

```abap
" 잘못된 생각
" ls_person-city = 'Seoul'.

" 올바름
ls_person-address-city = 'Seoul'.
```

중첩은 묶음이 유지되므로 component 경로도 단계가 있다.

두 번째 실수는 Include와 중첩을 같은 것으로 보는 것이다. Include는 펼쳐진다. 중첩은 하위 구조로 남는다.

세 번째 실수는 Include Structure의 이름 충돌을 생각하지 않는 것이다. 이미 `CREATED_BY`가 있는 구조에 또 `CREATED_BY`가 들어오면 충돌이 생길 수 있다. 공통 구조를 설계할 때 component 이름은 업무 전체에서 일관되게 가져가야 한다.

네 번째 실수는 SAP 표준 구조나 테이블을 직접 수정하려는 것이다. 표준 객체는 업그레이드와 패치의 대상이다. 고객 필드를 더해야 한다면 append structure 같은 확장 방식을 사용한다. 이 내용은 확장과 Clean Core 관점에서 뒤에서 더 깊게 다룬다.

### 체험 설계

L03에는 기존 embed가 없으므로 비교형 시뮬레이터를 설계한다.

| 요소 | 설계 |
|---|---|
| 화면 | 구조 다이어그램 3개: 중첩, Include, Append |
| 버튼 | `중첩 적용`, `Include 적용`, `Append 적용`, `접근 경로 보기` |
| 상태 | 원본 구조, 재사용 구조 선택, 적용 후 구조, 이름 충돌 경고 |
| 데이터 | `ZST_ADDRESS`, `ZST_AUDIT`, `ZST_ORDER`, `ZAPP_ORDER_EXT` |
| 피드백 | "중첩은 경로가 깊어지고, Include는 펼쳐지고, Append는 확장 영역에 붙음" |

접근 경로 미니 퀴즈를 붙이면 효과적이다.

| 질문 | 정답 |
|---|---|
| 중첩 주소의 도시 접근 | `ls_person-address-city` |
| Include된 생성자 접근 | `ls_order-created_by` |
| Append로 추가한 고객 필드 접근 | 구조에 붙은 component 이름으로 직접 접근 |

### 정리

구조 재사용에는 중첩, Include, Append가 있다. 중첩은 묶음을 보존하고, Include는 component를 펼쳐 넣고, Append는 기존 DDIC 객체에 고객 확장을 별도로 붙인다. CH05에서는 차이를 읽고 설명할 수 있으면 충분하다. 표준 확장 전략은 뒤에서 더 깊게 다룬다.

## CH05-L04 - 구조체 다루기

### 왜 필요한가

구조체를 만들었으면 다룰 수 있어야 한다. 실무에서는 구조체를 다음처럼 자주 조작한다.

| 작업 | 예 |
|---|---|
| 통째로 복사 | 조회 결과를 출력 구조로 옮김 |
| 초기화 | 다음 건을 담기 전에 work area를 비움 |
| 같은 이름 필드만 이동 | 화면 구조와 DB 구조 사이에서 공통 필드만 옮김 |

구조체를 묶는 것만 배우고 다루는 법을 모르면 다시 component별 대입으로 돌아가게 된다.

### 무엇인가

같은 타입의 구조체는 통째로 대입할 수 있다.

```abap
DATA: BEGIN OF ls_a,
        name TYPE c LENGTH 20,
        age  TYPE i,
      END OF ls_a.

DATA ls_b LIKE ls_a.

ls_a-name = '정훈영'.
ls_a-age  = 30.

ls_b = ls_a.

WRITE: / ls_b-name, ls_b-age.
```

`ls_b = ls_a.`는 component를 하나씩 복사하는 것과 같은 효과다. 타입이 같거나 호환되는 구조라면 통째 대입이 읽기 쉽다.

`CLEAR`는 구조체 전체를 타입별 initial value로 되돌린다. 공식 문서 기준 `CLEAR`는 구조체를 initial value로 세팅한다.

```abap
CLEAR ls_a.
```

구조체 안의 문자 component는 blank, 정수 component는 0, 날짜 component는 `00000000` 같은 타입별 초기값으로 돌아간다.

타입은 다르지만 이름이 같은 component만 옮기고 싶을 때는 `MOVE-CORRESPONDING`을 사용한다. 공식 문서 기준으로 `MOVE-CORRESPONDING`은 identically named components를 서로 할당한다.

```abap
DATA: BEGIN OF ls_source,
        name   TYPE c LENGTH 20,
        age    TYPE i,
        amount TYPE p LENGTH 8 DECIMALS 2,
      END OF ls_source.

DATA: BEGIN OF ls_target,
        name TYPE c LENGTH 20,
        age  TYPE i,
        city TYPE c LENGTH 20,
      END OF ls_target.

ls_source-name   = '정훈영'.
ls_source-age    = 30.
ls_source-amount = '1500.50'.
ls_target-city   = 'Seoul'.

MOVE-CORRESPONDING ls_source TO ls_target.

WRITE: / ls_target-name, ls_target-age, ls_target-city.
```

위 예제에서 `name`, `age`는 옮겨진다. `amount`는 target에 없으므로 옮겨지지 않는다. `city`는 source에 없으므로 그대로 남는다.

### 어떻게 확인하는가

다음 프로그램을 실행하고 디버거로 `ls_source`, `ls_target`을 함께 본다.

```abap
REPORT z_ch05_l04_move_corresponding.

DATA: BEGIN OF ls_source,
        name   TYPE c LENGTH 20,
        age    TYPE i,
        amount TYPE p LENGTH 8 DECIMALS 2,
      END OF ls_source.

DATA: BEGIN OF ls_target,
        name TYPE c LENGTH 20,
        age  TYPE i,
        city TYPE c LENGTH 20,
      END OF ls_target.

ls_source-name   = '정훈영'.
ls_source-age    = 30.
ls_source-amount = '1500.50'.
ls_target-city   = 'Seoul'.

BREAK-POINT.

MOVE-CORRESPONDING ls_source TO ls_target.

WRITE: / ls_target-name, ls_target-age, ls_target-city.

CLEAR ls_source.
```

확인 포인트는 다음이다.

| 줄 | 확인 |
|---|---|
| `BREAK-POINT` | 이동 전 source와 target 상태 |
| `MOVE-CORRESPONDING` 후 | 같은 이름 `name`, `age`만 target에 복사 |
| `city` | source에 없으므로 기존 값 유지 |
| `CLEAR ls_source` 후 | source component들이 초기값으로 변경 |

### 실수와 주의

첫 번째 실수는 `MOVE-CORRESPONDING`이 모든 필드를 옮긴다고 생각하는 것이다. 이름이 같은 component만 대상이다.

두 번째 실수는 target에 남아 있는 기존 값을 잊는 것이다.

```abap
ls_target-city = 'Seoul'.
MOVE-CORRESPONDING ls_source TO ls_target.
```

`city`는 source에 없으므로 그대로 남는다. 이것이 의도라면 좋지만, 새로 채우는 구조라면 먼저 `CLEAR ls_target.`을 해야 할 수 있다.

```abap
CLEAR ls_target.
MOVE-CORRESPONDING ls_source TO ls_target.
```

세 번째 실수는 modern `CORRESPONDING #( )`를 여기서 쓰는 것이다. 그것은 CH18 이후 New Syntax 주제다. CH05에서는 classic `MOVE-CORRESPONDING`만 사용한다.

네 번째 실수는 구조체와 internal table 초기화를 섞는 것이다. 구조체 한 건은 `CLEAR`다. 여러 행을 담는 internal table의 `REFRESH`, `FREE` 등은 CH06에서 다룬다.

### 체험 설계

L04에는 신규 스텝퍼가 적합하다.

| 요소 | 설계 |
|---|---|
| 버튼 | `값 채우기`, `MOVE-CORRESPONDING`, `CLEAR source`, `CLEAR target`, `다시하기` |
| 상태 | 초기, source 채움, target 기존값 있음, 이동 후, 초기화 후 |
| 데이터 | source 구조체 카드, target 구조체 카드 |
| 피드백 | 이름이 같은 component는 초록, target에만 있는 component는 회색, source에만 있는 component는 이동 안 됨 표시 |
| 오류 실험 | target을 clear하지 않고 이동했을 때 기존 `city`가 남는 모습 |

시각화는 두 구조체를 나란히 두고 같은 이름 component 사이에 선을 긋는다. `amount`는 target에 없으므로 선이 생기지 않고, `city`는 source에 없으므로 그대로 남는다. 초보자는 이 그림을 통해 "이름 기준 복사"를 바로 이해한다.

### 정리

구조체는 통째로 대입할 수 있고, `CLEAR`로 전체를 초기화할 수 있다. 타입이 다른 구조 사이에서 같은 이름 component만 옮길 때는 `MOVE-CORRESPONDING`을 사용한다. 단, target에만 있는 값은 그대로 남을 수 있으므로 필요하면 먼저 `CLEAR`한다.

## CH05-L05 - 구구단 한 줄 = Structure

### 왜 필요한가

CH05의 캡스톤은 CH04 구구단 한 줄을 구조체로 묶는 것이다. 이 실습의 목적은 "코드를 더 멋있게 보이게 하는 것"이 아니다. 한 업무 행의 의미를 코드에 드러내는 것이다.

CH04 방식은 다음처럼 세 변수가 흩어져 있었다.

```text
gv_dan
gv_mul
gv_res
```

CH05 방식은 다음처럼 한 변수 아래에 세 component를 둔다.

```text
ls_line
  dan
  mul
  result
```

이제 코드가 "구구단 한 줄"을 다룬다는 사실이 분명해진다.

### 무엇인가

구구단 한 줄 구조체를 선언한다.

```abap
DATA: BEGIN OF ls_line,
        dan    TYPE i,
        mul    TYPE i,
        result TYPE i,
      END OF ls_line.
```

이 구조체를 반복문에서 한 줄씩 채운다.

```abap
REPORT z_ch05_l05_gugu_structure.

DATA: BEGIN OF ls_line,
        dan    TYPE i,
        mul    TYPE i,
        result TYPE i,
      END OF ls_line.

ls_line-dan = 2.

DO 9 TIMES.
  ls_line-mul    = sy-index.
  ls_line-result = ls_line-dan * ls_line-mul.

  WRITE: / ls_line-dan, 'x', ls_line-mul, '=', ls_line-result.
ENDDO.
```

반복마다 같은 `ls_line`이 다시 채워진다.

| 회차 | `ls_line-dan` | `ls_line-mul` | `ls_line-result` |
|---:|---:|---:|---:|
| 1 | 2 | 1 | 2 |
| 2 | 2 | 2 | 4 |
| 3 | 2 | 3 | 6 |
| ... | ... | ... | ... |
| 9 | 2 | 9 | 18 |

중요한 점은 `ls_line`이 한 건짜리 그릇이라는 것이다. 반복 1회차의 값은 2회차에서 덮어써진다. 화면에는 출력이 남지만, 메모리의 `ls_line` 하나가 9줄을 모두 기억하지는 않는다.

### 어떻게 확인하는가

다음 절차로 디버거에서 확인한다.

1. `DO 9 TIMES.` 안 첫 줄에 breakpoint를 둔다.
2. `ls_line`을 변수 모니터에 올리고 펼친다.
3. F5로 한 줄씩 실행한다.
4. 1회차에서 `mul = 1`, `result = 2`가 되는지 본다.
5. 다음 회차에서 같은 `ls_line-mul`, `ls_line-result`가 새 값으로 바뀌는지 본다.
6. "이전 줄이 메모리에 쌓이는 것이 아니라 덮어써진다"는 점을 확인한다.

확인 질문은 다음과 같다.

| 질문 | 기대 답 |
|---|---|
| `ls_line`은 몇 줄을 담는가 | 한 줄 |
| 반복 3회차에서 2회차 값은 어디에 있는가 | 화면 출력에는 남지만 `ls_line` 메모리에는 남지 않음 |
| 2단 전체 9줄을 나중에 정렬하려면 무엇이 필요한가 | 여러 행을 담는 Internal Table |

### 실수와 주의

첫 번째 실수는 `ls_line`을 여러 행 저장소로 생각하는 것이다. 구조체는 한 건이다.

두 번째 실수는 출력과 저장을 혼동하는 것이다. `WRITE`로 화면에 찍힌 줄은 리스트에 보인다. 하지만 그것이 프로그램 메모리에 여러 행으로 저장된다는 뜻은 아니다.

세 번째 실수는 Structure를 썼으니 CH04보다 항상 더 좋은 코드라고 단정하는 것이다. 값이 하나뿐이고 묶음 의미가 없다면 굳이 Structure가 필요하지 않다. Structure는 관련 값이 함께 움직일 때 의미가 있다.

네 번째 실수는 다음 장의 Internal Table 개념을 앞당겨 구현하려는 것이다. CH05의 목표는 한 줄을 묶는 것이다. 여러 줄을 쌓는 문법은 CH06에서 정식으로 배운다.

### 체험 설계

기존 임베드 `embeds/abap/CH05-L05-S01.html`은 구구단 구조체 디버거다.

| 요소 | 설계 |
|---|---|
| 버튼 | `시작`, `다음`, `현재 행`, `전체 출력`, `다시하기` |
| 상태 | 초기, 회차별 구조체 갱신, 출력 누적, 완료 |
| 데이터 | `ls_line-dan`, `ls_line-mul`, `ls_line-result`, `sy-index`, 출력 버퍼 |
| 피드백 | "출력은 누적되지만 `ls_line`은 한 행만 들고 있어 값이 갱신됨" |
| 시각화 | 왼쪽은 구조체 카드, 오른쪽은 화면 출력 리스트 |

핵심은 "메모리 한 건"과 "화면 출력 여러 줄"을 분리해 보여 주는 것이다. 구조체 카드에는 항상 현재 한 줄만 보이고, 출력 리스트에는 지나간 줄이 쌓이게 한다. 그러면 CH06으로 넘어가는 불편이 자연스럽다.

### 정리

구구단 한 줄을 Structure로 묶으면 단수, 곱하는 수, 결과가 하나의 의미 단위가 된다. 하지만 Structure 하나는 한 줄만 담는다. 여러 줄을 메모리에 모아 정렬하고, 검색하고, 다시 출력하려면 같은 모양의 행을 여러 개 담는 그릇이 필요하다. 다음 CH06의 Internal Table이 그 역할을 한다.

## CH05 마무리

CH05를 끝내면 학습자는 "관련 값을 하나의 한 건으로 묶는다"는 감각을 가져야 한다.

| 기준 | 할 수 있어야 하는 일 |
|---|---|
| Local Structure | `DATA: BEGIN OF ... END OF ...`로 구조체 변수를 만들 수 있다 |
| Component 접근 | `ls_struct-field` 형태로 component를 읽고 쓸 수 있다 |
| TYPES와 DATA 구분 | 구조체 타입 설계도와 실제 변수를 구분할 수 있다 |
| DDIC Structure | SE11에서 전역 구조체 타입을 만들고 프로그램에서 사용할 수 있음을 설명할 수 있다 |
| 구조 재사용 | 중첩, Include, Append의 차이를 그림으로 설명할 수 있다 |
| 구조체 조작 | 통째 대입, `CLEAR`, `MOVE-CORRESPONDING`을 사용할 수 있다 |
| 캡스톤 | 구구단 한 줄을 `ls_line` 구조체로 표현하고 한 행 한계를 설명할 수 있다 |

다음 CH06에서는 이 한 행 한계를 해결한다. `ls_line` 하나가 아니라, 같은 모양의 `ls_line`을 여러 개 쌓는 Internal Table을 배운다.
