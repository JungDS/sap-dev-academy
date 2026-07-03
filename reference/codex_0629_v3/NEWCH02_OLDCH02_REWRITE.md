# CH02_REWRITE - 변수, 표준 타입, 상수, Text Symbol

> 기준 소스: `content/abap/CH02/_chapter.md`, `content/abap/CH02/CH02-L01.md` ~ `CH02-L06.md`
> 보조 참고: `.project-docs/04_CONVENTIONS.md`, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 기존 `reference/codex_0625` 진단
> 공식 문서 확인: `C:\ABAP_DOCU_HTML`의 `DATA`, `TYPES`, `CONSTANTS`, built-in character/numeric/date/time type, offset/length, assignment conversion, text symbol, text pool 항목을 수동 확인

## 챕터 설계

CH02의 목표는 "값을 코드에 직접 박아 넣는 단계"에서 "값에 이름과 타입을 붙여 프로그램이 다룰 수 있는 데이터로 만드는 단계"로 이동하는 것이다. CH01에서 학습자는 `WRITE 'Hello'.`처럼 고정된 문자를 화면에 출력했다. 그러나 실제 프로그램은 늘 같은 문장만 출력하지 않는다. 사용자, 수량, 금액, 날짜, 상태처럼 실행 중에 담고 바꾸고 비교할 값이 필요하다.

이 장에서는 데이터베이스, 화면 입력, 조건문, 반복문을 아직 배우지 않는다. 대신 앞으로 모든 ABAP 코드의 바닥이 되는 네 가지를 정확히 잡는다.

1. `DATA`로 변수를 선언하고 값을 담는다.
2. `STRING`, `I`, `F`, `D`, `T`처럼 바로 쓸 수 있는 complete type을 구분한다.
3. `C`, `N`, `P`처럼 길이와 소수 자릿수를 함께 지정해야 하는 incomplete type을 다룬다.
4. `TYPES`, `CONSTANTS`, Text Symbol로 반복 선언, 고정값, 번역 가능한 화면 문구를 정리한다.

신규 레슨은 추가하지 않는다. 원본 6개 레슨이 "변수 선언 -> 표준 타입 -> 길이 있는 타입 -> 타입 재사용 -> 상수 -> 번역 가능한 텍스트"로 자연스럽게 이어진다. 다만 기존 `codex_0625`의 반복 템플릿과 자동 매칭식 공식 문서 힌트는 재사용하지 않고, 각 레슨을 입문자용 완성 강의자료로 다시 쓴다.

## CH02-L01 - 변수 선언(DATA)

### 왜 필요한가

CH01에서 다음과 같은 코드는 문제없이 실행된다.

```abap
REPORT z_ch02_l01_a.

WRITE 'Hello, ABAP!'.
```

하지만 이 방식은 값이 코드 안에 그대로 박혀 있다. 문구를 한 번만 출력할 때는 괜찮지만, 같은 값을 여러 줄에서 쓰거나 중간에 바꿔야 하면 불편해진다. 예를 들어 이름을 세 번 출력하는 프로그램에서 `'정훈영'`을 세 군데에 직접 쓰면, 이름이 바뀔 때 세 군데를 모두 찾아 고쳐야 한다. 하나라도 놓치면 출력 결과가 서로 달라진다.

변수는 이런 문제를 해결한다. 변수는 "값을 담는 이름 붙은 공간"이다. 값 자체를 여러 곳에 흩뿌리지 않고, `lv_name`이라는 이름을 통해 값을 읽고 바꾼다. 비전공자 관점에서는 변수를 엑셀 셀처럼 이해하면 시작이 쉽다. 셀 주소 `A1`에 값이 들어 있고 다른 칸에서 `A1`을 참조하듯, ABAP에서는 변수 이름에 값이 들어 있고 문장에서 그 이름을 사용한다.

### 무엇인가

ABAP에서 기본 변수 선언은 `DATA` 문으로 한다.

```abap
DATA lv_name TYPE string.
```

이 한 줄은 세 부분으로 읽는다.

| 부분 | 의미 |
|---|---|
| `DATA` | 지금부터 데이터 객체를 선언한다는 ABAP 키워드 |
| `lv_name` | 변수 이름 |
| `TYPE string` | 이 변수에 담을 값의 종류와 규칙 |

공식 문서 기준으로 `DATA`는 이름 있는 data object를 선언한다. data object는 프로그램이 실행되는 동안 값을 보관할 수 있는 대상이다. 선언만 하고 값을 넣지 않으면 타입별 initial value로 시작한다. `string`은 빈 문자열, `i`는 `0`, `d`는 `00000000`, `t`는 `000000`처럼 시작값이 정해져 있다.

값은 대입 연산자 `=`로 넣는다.

```abap
REPORT z_ch02_l01_b.

DATA lv_msg TYPE string.

lv_msg = 'Hello, ABAP!'.

WRITE lv_msg.
```

여기서 중요한 흐름은 "선언 -> 대입 -> 사용"이다.

1. `DATA lv_msg TYPE string.`으로 값을 담을 공간을 만든다.
2. `lv_msg = 'Hello, ABAP!'.`로 그 공간에 값을 넣는다.
3. `WRITE lv_msg.`로 변수 안의 현재 값을 읽어 화면에 출력한다.

선언과 동시에 시작값을 넣을 수도 있다.

```abap
REPORT z_ch02_l01_c.

DATA lv_qty TYPE i VALUE 10.

WRITE lv_qty.
```

`VALUE`는 이 변수의 시작값을 지정한다. 이 장에서 말하는 `VALUE`는 `DATA ... VALUE ...`의 선언 추가 구문이다. 복잡한 값 생성 표현식은 아직 다루지 않는다.

여러 변수를 한 번에 선언할 때는 CH01에서 배운 chained statement를 사용할 수 있다.

```abap
REPORT z_ch02_l01_d.

DATA: lv_name TYPE string VALUE '정훈영',
      lv_qty  TYPE i      VALUE 3.

WRITE: / lv_name,
       / lv_qty.
```

콜론 `:` 왼쪽의 `DATA`가 공통부이고, 콤마로 이어지는 각 줄이 하나의 선언이다. 마지막에는 마침표가 하나만 온다.

`TYPE`은 타입을 직접 지정한다. `LIKE`는 이미 있는 데이터 객체의 타입을 따라 새 변수를 선언한다.

```abap
REPORT z_ch02_l01_e.

DATA lv_price TYPE p LENGTH 8 DECIMALS 2.
DATA lv_total LIKE lv_price.

lv_price = '1200.50'.
lv_total = lv_price.

WRITE: / lv_price,
       / lv_total.
```

`lv_total LIKE lv_price`는 `lv_total`을 `lv_price`와 같은 타입, 같은 길이, 같은 소수 자릿수로 만들겠다는 뜻이다. 금액처럼 같은 모양의 값이 여러 개 필요할 때 유용하다. 다만 ABAP Dictionary의 전역 타입을 배우는 CH03 이후에는 `LIKE`보다 의미가 분명한 타입을 기준으로 잡는 설계가 더 중요해진다. 지금은 `TYPE`과 `LIKE`의 읽는 법을 익히는 단계다.

### 어떻게 확인하는가

아래 프로그램을 실행해 변수의 흐름을 눈으로 확인한다.

```abap
REPORT z_ch02_l01_check.

DATA lv_name TYPE string VALUE '정훈영'.
DATA lv_qty  TYPE i      VALUE 3.

WRITE: / 'Name:', lv_name,
       / 'Qty :', lv_qty.

lv_qty = 5.

WRITE: / 'Changed Qty:', lv_qty.
```

확인할 점은 세 가지다.

- 첫 번째 `WRITE`에서는 `lv_qty`의 시작값 `3`이 출력된다.
- `lv_qty = 5.` 이후에는 같은 변수 이름이지만 현재 값이 `5`로 바뀐다.
- `'Name:'`, `'Qty :'`, `'Changed Qty:'`는 고정 문자이고, `lv_name`, `lv_qty`는 변수에서 읽은 값이다.

초보자는 코드의 줄을 위에서 아래로 따라가며 변수 표를 그리면 이해가 빠르다.

| 실행 지점 | `lv_name` | `lv_qty` |
|---|---:|---:|
| 선언 직후 | `정훈영` | `3` |
| 첫 출력 후 | `정훈영` | `3` |
| `lv_qty = 5.` 후 | `정훈영` | `5` |
| 마지막 출력 후 | `정훈영` | `5` |

변수는 값 하나만 기억하는 것이 아니라 "현재 마지막으로 들어온 값"을 기억한다. 같은 변수에 다시 대입하면 이전 값은 사라진다.

### 실수와 주의

가장 흔한 실수는 변수를 선언하기 전에 사용하는 것이다.

```abap
REPORT z_ch02_l01_wrong_a.

lv_msg = 'Hello'.
WRITE lv_msg.
```

이 코드는 `lv_msg`가 무엇인지 ABAP이 알 수 없으므로 syntax error가 난다. ABAP은 사람처럼 "아마 변수겠지"라고 추측하지 않는다. 먼저 선언해야 한다.

두 번째 실수는 타입을 생략하는 것이다.

```abap
DATA lv_flag.
```

공식 문서 기준으로 `TYPE`이나 `LIKE`를 모두 생략하면 기본적으로 길이 1의 character field로 선언된다. 입문 단계에서는 이런 암묵 규칙에 기대면 안 된다. `"Y"` 같은 한 글자만 담을 의도가 아니라면 `TYPE`을 명확히 쓴다.

세 번째 실수는 `=`를 "같다"라는 비교로 읽는 것이다. CH02에서 `=`는 오른쪽 값을 왼쪽 변수에 넣는 대입이다. 조건문에서 비교로 쓰는 장면은 CH04에서 다시 만난다. 지금은 `lv_qty = 5.`를 "lv_qty에 5를 넣는다"라고 읽는다.

네 번째 실수는 변수 이름을 의미 없이 짓는 것이다.

```abap
DATA a TYPE i.
DATA b TYPE i.
```

이름이 너무 짧으면 나중에 무엇을 담은 값인지 알 수 없다. 교육 코드에서는 `lv_qty`, `lv_name`, `lv_price`처럼 역할이 드러나는 이름을 사용한다. 실제 프로젝트에서는 팀의 naming convention을 따른다.

### 체험형 학습 설계

이 레슨에는 기존 임베드가 없으므로 "변수 메모리 카드" 시뮬레이터를 설계한다.

- 화면 구성: 왼쪽에는 ABAP 코드 조각, 오른쪽에는 변수 카드 영역, 아래에는 리스트 출력 영역을 둔다.
- 데이터: `lv_msg`, `lv_qty`, `lv_total` 세 변수를 예제로 둔다. 각 변수 카드는 `이름`, `타입`, `현재 값`, `상태`를 보여준다.
- 버튼: `선언 실행`, `값 대입`, `WRITE 실행`, `다시 대입`, `선언 전 사용 오류`를 둔다.
- 상태:
  - `선언 전`: 변수 카드가 회색으로 비활성화된다.
  - `선언됨`: 타입은 보이지만 값은 initial value로 표시된다.
  - `대입됨`: 값 칸이 바뀐다.
  - `출력됨`: 리스트 출력 영역에 현재 값이 추가된다.
  - `오류`: 선언되지 않은 변수 사용 시 "ABAP은 이름을 추측하지 않는다"는 피드백을 표시한다.
- 피드백: `DATA` 줄을 실행하면 "공간이 생겼다", `=` 줄을 실행하면 "현재 값이 바뀌었다", `WRITE` 줄을 실행하면 "변수 값을 읽어 출력했다"라고 단계별 메시지를 준다.

추가 실험 버튼으로 `LIKE lv_price`를 누르면 `lv_total` 카드의 타입 정보가 `lv_price`에서 복사되어 채워지는 모습을 보여준다. 이때 값은 복사되지 않고 타입 규칙만 따라온다는 점을 분리해서 표시한다.

### 정리

`DATA`는 값을 담을 이름 있는 공간을 만든다. 변수는 선언하고, 값을 대입하고, 필요한 위치에서 읽어 사용한다. `TYPE`은 타입을 직접 지정하고, `LIKE`는 기존 데이터 객체의 타입을 따른다. 선언 없이 변수 이름을 쓰면 오류가 나며, 타입 생략은 길이 1 문자 필드가 되는 암묵 규칙 때문에 입문 단계에서는 피한다.

## CH02-L02 - Complete 타입: STRING, I, F, D, T

### 왜 필요한가

변수 이름만 있다고 프로그램이 안전해지는 것은 아니다. 같은 `lv_value`라는 변수라도 어떤 값이 들어갈 수 있는지 정해야 한다. 이름만 있는 빈 상자에는 문자열도, 숫자도, 날짜처럼 보이는 값도 들어갈 수 있을 것 같지만, 프로그램은 값을 더하고 출력하고 저장할 때 명확한 규칙을 필요로 한다.

타입은 그 규칙이다. 사람에게 "수량"이라고 말하면 정수인지 소수인지, 음수가 가능한지, 화면에는 어떻게 보일지 문맥으로 짐작한다. ABAP은 그런 문맥을 자동으로 완벽히 알 수 없다. `TYPE i`라고 쓰면 정수 계산 규칙을 적용하고, `TYPE string`이라고 쓰면 텍스트 처리 규칙을 적용한다.

CH02-L02에서는 길이나 소수 자릿수를 따로 지정하지 않아도 바로 쓸 수 있는 complete type을 먼저 배운다.

### 무엇인가

Complete type은 타입 이름만으로 데이터 객체의 모양이 완성되는 타입이다. 이 레슨의 핵심은 `STRING`, `I`, `F`, `D`, `T`다.

| 타입 | 읽는 법 | 주 용도 | 시작값 | 입문자에게 중요한 감각 |
|---|---|---|---|---|
| `string` | text string | 길이가 변하는 문자 | 빈 문자열 | 이름, 문장, 설명처럼 길이가 달라지는 텍스트 |
| `i` | integer | 정수 | `0` | 개수, 순번, 인덱스처럼 소수점 없는 숫자 |
| `f` | floating point | 근사 실수 | `0` | 과학 계산 등 근사값. 금액에는 부적합 |
| `d` | date | 날짜 | `00000000` | 내부 형식은 `YYYYMMDD` 8자리 |
| `t` | time | 시간 | `000000` | 내부 형식은 `HHMMSS` 6자리 |

`string`은 내용에 따라 길이가 변한다. `TYPE c LENGTH 10`처럼 길이를 고정하는 문자 타입은 다음 레슨에서 다룬다. 지금은 "긴 문장을 담을 수 있는 일반 텍스트 타입"으로 받아들이면 된다.

`i`는 정수 타입이다. 개수, 수량, 반복 횟수, 순번처럼 소수점이 필요 없는 숫자에 적합하다. 공식 문서에서 `i`는 4바이트 정수이며 값 범위가 제한된다. 매우 큰 숫자를 다루는 상황은 나중에 별도 설계가 필요하지만, 입문 단계의 카운터와 수량은 대부분 `i`로 시작한다.

`f`는 floating point, 즉 부동소수점 타입이다. 소수를 담을 수 있지만 내부 표현상 모든 10진 소수를 정확히 표현하지 못할 수 있다. 그래서 금액, 세율, 수량 단가처럼 정확한 10진 계산이 중요한 값에는 다음 레슨의 `p` 타입을 사용한다.

`d`와 `t`는 날짜와 시간 타입이다. 내부적으로는 각각 `YYYYMMDD`, `HHMMSS` 모양의 character-like 값으로 다뤄진다. 날짜 계산과 `sy-datum` 같은 시스템 필드는 CH04에서 본격적으로 다룬다. CH02에서는 "날짜와 시간에도 전용 타입이 있다"는 정도까지 익힌다.

기본 예제는 다음과 같다.

```abap
REPORT z_ch02_l02_a.

DATA: lv_text  TYPE string VALUE 'ABAP',
      lv_qty   TYPE i      VALUE 10,
      lv_rate  TYPE f      VALUE '1.5',
      lv_date  TYPE d      VALUE '20260630',
      lv_time  TYPE t      VALUE '153000'.

WRITE: / lv_text,
       / lv_qty,
       / lv_rate,
       / lv_date,
       / lv_time.
```

여기서 `lv_rate`의 시작값을 `'1.5'`처럼 작은따옴표로 쓴 점을 주의한다. ABAP에서 마침표 `.`는 문장의 끝이다. 그래서 소수점이 있는 10진 숫자를 코드에 직접 쓸 때는 문자 리터럴로 적고 타입 변환을 통해 숫자 타입에 넣는 방식을 사용한다. 정수 `10`은 그대로 쓸 수 있지만, `1.5`를 문장 안에 그대로 쓰면 마침표와 충돌한다.

### 어떻게 확인하는가

먼저 타입별 출력이 되는지 확인한다.

```abap
REPORT z_ch02_l02_check_a.

DATA: lv_text TYPE string VALUE '수량',
      lv_qty  TYPE i      VALUE 10,
      lv_date TYPE d      VALUE '20260630',
      lv_time TYPE t      VALUE '153000'.

WRITE: / lv_text,
       / lv_qty,
       / lv_date,
       / lv_time.
```

그 다음 `i` 타입의 나눗셈을 확인한다.

```abap
REPORT z_ch02_l02_check_b.

DATA lv_result TYPE i.

lv_result = 7 / 2.

WRITE lv_result.
```

ABAP의 정수 계산에서 나눗셈 결과는 단순히 소수점을 버리는 방식으로 이해하면 틀린다. 공식 문서 기준으로 `i` 타입 계산의 나눗셈은 truncation이 아니라 rounding 동작을 한다. 그래서 `7 / 2`의 결과를 `i`에 넣으면 `3`이 아니라 `4`가 나온다. 이 작은 실험은 "타입이 계산 규칙을 바꾼다"는 사실을 강하게 보여준다.

소수 값을 다룰 때는 다음 예제를 실행한다.

```abap
REPORT z_ch02_l02_check_c.

DATA: lv_float TYPE f,
      lv_int   TYPE i.

lv_float = '123.45'.
lv_int   = '123.45'.

WRITE: / lv_float,
       / lv_int.
```

이 예제는 ABAP이 대입 시 타입 변환을 수행한다는 점을 보여준다. 다만 "변환이 된다"와 "업무적으로 안전하다"는 다르다. 금액을 정수 변수에 넣거나 부동소수점으로 계산하면 값 손실이나 반올림 문제가 생길 수 있다.

### 실수와 주의

첫 번째 실수는 금액에 `f`를 사용하는 것이다. `f`는 근사 실수라서 10진 소수를 사람이 기대하는 방식으로 항상 정확히 저장하지 못한다. 금액은 `TYPE p LENGTH ... DECIMALS ...`로 선언하는 습관을 들인다.

두 번째 실수는 소수 리터럴을 따옴표 없이 쓰는 것이다.

```abap
lv_rate = 1.5.
```

ABAP에서 `.`는 문장 종료 기호다. 소수점이 있는 숫자를 직접 대입할 때는 다음처럼 문자 리터럴을 사용한다.

```abap
lv_rate = '1.5'.
```

세 번째 실수는 `d`와 `t`를 화면 표시 형식으로 오해하는 것이다. `TYPE d`의 내부 형식은 `YYYYMMDD`이고, `TYPE t`의 내부 형식은 `HHMMSS`다. `2026-06-30`처럼 하이픈이 들어간 문자열을 그대로 넣는 방식은 이 레슨의 범위가 아니다. 날짜를 사용자 친화적으로 출력하거나 계산하는 내용은 CH04에서 다룬다.

네 번째 실수는 정수 나눗셈을 다른 언어의 경험으로 단정하는 것이다. `7 / 2`를 `i`에 담으면 `4`가 될 수 있다. 수량 계산에서 소수점이 의미 있다면 처음부터 `p` 타입으로 설계해야 한다.

### 체험형 학습 설계

이 레슨에는 "타입 선택 실험기"를 설계한다.

- 화면 구성: 위쪽에는 입력값 칸, 가운데에는 타입 선택 탭(`string`, `i`, `f`, `d`, `t`), 아래에는 결과와 경고 패널을 둔다.
- 입력 데이터: `'123'`, `'123.45'`, `'20260630'`, `'153000'`, `'ABAP'` 샘플 버튼을 둔다.
- 버튼: `대입해보기`, `WRITE 출력`, `7 / 2 계산`, `초기값 보기`, `다시하기`를 둔다.
- 상태:
  - `대입 성공`: 변수 카드에 현재 값과 타입을 표시한다.
  - `변환 주의`: 문자 `'123.45'`를 `i`에 넣는 등 값 손실 가능성이 있을 때 노란 피드백을 준다.
  - `계산 규칙 확인`: `i`의 `7 / 2` 결과를 `4`로 보여주고 "정수 타입은 계산 규칙도 함께 온다"라고 설명한다.
  - `표현 주의`: `f` 선택 시 "금액에는 사용하지 말 것"을 표시한다.
- 피드백: 학습자가 같은 입력값을 타입만 바꿔 넣어 보게 하여 "값은 같아 보여도 타입이 다르면 해석이 다르다"를 체험하게 한다.

### 정리

타입은 변수에 들어갈 값의 규칙이다. `string`은 길이가 변하는 텍스트, `i`는 정수, `f`는 근사 실수, `d`는 `YYYYMMDD` 날짜, `t`는 `HHMMSS` 시간이다. 소수점이 있는 값은 마침표와 충돌하므로 문자 리터럴로 적어 타입 변환을 거친다. 금액처럼 정확한 10진 계산이 필요한 값은 `f`가 아니라 다음 레슨의 `p` 타입으로 다룬다.

## CH02-L03 - Incomplete 타입: C, N, P와 offset/length

### 왜 필요한가

Complete type은 편리하지만 모든 업무 값을 설명하기에는 부족하다. 사번은 보통 정해진 길이가 있고, 우편번호는 앞의 `0`이 사라지면 안 되며, 금액은 소수 둘째 자리까지 정확해야 한다. 이런 값들은 "문자다", "숫자다"만으로는 부족하고 길이와 소수 자릿수까지 규칙으로 정해야 한다.

`C`, `N`, `P`는 이런 상황에서 자주 만나는 기본 타입이다. 이들은 타입 이름만으로는 완성되지 않으므로 길이 또는 소수 자릿수를 함께 지정해야 한다.

### 무엇인가

이 레슨의 핵심 타입은 세 가지다.

| 타입 | 이름 | 필요한 추가 정보 | 주 용도 |
|---|---|---|---|
| `c` | character field | `LENGTH` | 고정 길이 문자, 코드, 한 글자 플래그 |
| `n` | numeric text field | `LENGTH` | 숫자로만 이루어진 텍스트, 우편번호, 계정번호 |
| `p` | packed number | `LENGTH`, 필요 시 `DECIMALS` | 금액, 중량, 정확한 소수 계산 |

예제는 다음과 같다.

```abap
REPORT z_ch02_l03_a.

DATA: lv_code TYPE c LENGTH 4,
      lv_zip  TYPE n LENGTH 5,
      lv_amt  TYPE p LENGTH 8 DECIMALS 2.

lv_code = 'ABCD'.
lv_zip  = '01234'.
lv_amt  = '123.45'.

WRITE: / lv_code,
       / lv_zip,
       / lv_amt.
```

`TYPE c LENGTH 4`는 네 글자짜리 고정 길이 문자 필드다. `string`은 내용에 따라 길이가 변하지만, `c`는 선언한 길이가 유지된다. 코드값이나 플래그처럼 길이가 정해진 값에 적합하다.

`TYPE n LENGTH 5`는 숫자처럼 보이는 텍스트다. 공식 문서에서도 `n`은 numeric type이 아니라 character-like type으로 분류된다. 즉 계산용 숫자가 아니다. 우편번호 `01234`, 계정번호 `000123`처럼 앞의 0이 의미 있는 값을 담기 좋다.

`TYPE p LENGTH 8 DECIMALS 2`는 packed number다. 금액처럼 정확한 10진 계산이 필요한 값에 적합하다. `LENGTH 8`은 내부 저장 길이를 뜻하고, `DECIMALS 2`는 소수 자릿수 두 자리를 뜻한다. 입문 단계에서는 "금액은 `p`와 `DECIMALS`를 함께 쓴다"는 습관을 먼저 잡는다.

`C` 타입 값은 offset/length로 일부만 읽거나 바꿀 수 있다. offset은 0부터 센다.

```abap
REPORT z_ch02_l03_b.

DATA lv_date_text TYPE c LENGTH 8 VALUE '20260630'.

WRITE: / lv_date_text+0(4),
       / lv_date_text+4(2),
       / lv_date_text+6(2).

lv_date_text+6(2) = '01'.

WRITE / lv_date_text.
```

`lv_date_text+0(4)`는 0번째 위치부터 4글자, 즉 `2026`을 읽는다. `lv_date_text+4(2)`는 4번째 위치부터 2글자, 즉 `06`을 읽는다. `lv_date_text+6(2) = '01'.`은 마지막 두 글자를 `01`로 바꾼다. 결과는 `20260601`이 된다.

### 어떻게 확인하는가

먼저 고정 길이 문자와 numeric text를 확인한다.

```abap
REPORT z_ch02_l03_check_a.

DATA: lv_short TYPE c LENGTH 4,
      lv_zip   TYPE n LENGTH 5.

lv_short = 'AB'.
lv_zip   = '01234'.

WRITE: / '[',
         lv_short,
         ']',
       / lv_zip.
```

`lv_short`는 네 글자 공간을 가진다. 화면 출력에서는 공백이 잘 보이지 않을 수 있으므로 대괄호 같은 표시 문자를 같이 출력하면 길이 감각을 잡기 쉽다. `lv_zip`은 `01234`처럼 앞의 `0`을 보존해야 하는 텍스트 값이다.

다음으로 금액 계산을 확인한다.

```abap
REPORT z_ch02_l03_check_b.

DATA: lv_amt    TYPE p LENGTH 8 DECIMALS 2,
      lv_result TYPE p LENGTH 8 DECIMALS 2.

lv_amt = '7.00'.
lv_result = lv_amt / 2.

WRITE: / lv_amt,
       / lv_result.
```

`lv_result`는 `3.50`처럼 소수 둘째 자리까지 의미 있는 값으로 확인할 수 있다. 교육 시스템에서 아주 오래된 프로그램 속성 때문에 packed number의 소수점 처리 결과가 예상과 다르면 fixed point arithmetic 설정을 강사와 함께 확인한다. 현대 교육 환경에서는 이 설정을 켜고 실습하는 것이 전제다.

offset/length는 위치 표를 그리며 확인한다.

```text
값:      2 0 2 6 0 6 3 0
offset: 0 1 2 3 4 5 6 7
```

`+0(4)`는 `2026`, `+4(2)`는 `06`, `+6(2)`는 `30`이다. offset이 1부터 시작한다고 생각하면 날짜가 한 칸씩 밀려 완전히 다른 값이 나온다.

### 실수와 주의

첫 번째 실수는 `TYPE c`에 길이를 쓰지 않는 것이다.

```abap
DATA lv_code TYPE c.
```

이렇게 쓰면 길이 1로 선언된다. `ABCD`를 넣고 싶었는데 첫 글자만 남는 식의 값 손실을 만들 수 있다. `c`와 `n`은 의도를 드러내기 위해 `LENGTH`를 적는다.

두 번째 실수는 `n`을 계산용 숫자로 쓰는 것이다. `n`은 숫자 모양의 텍스트다. 우편번호, 사번, 계정번호처럼 자리수가 의미 있는 코드에 적합하다. 더하기, 빼기, 나누기를 할 값이면 `i`나 `p`를 검토한다.

세 번째 실수는 금액을 `i`나 `f`로 처리하는 것이다. `i`는 소수점이 사라지거나 반올림될 수 있고, `f`는 근사값 문제가 있다. 금액, 단가, 세율처럼 정확한 10진 계산이 필요하면 `p LENGTH ... DECIMALS ...`를 기본 선택지로 둔다.

네 번째 실수는 offset 범위를 넘는 것이다. `lv_date_text+6(2)`는 8글자 안에 들어가지만 `lv_date_text+7(2)`는 끝을 넘어간다. 공식 문서 기준으로 offset/length가 데이터 객체 범위를 벗어나면 오류가 발생할 수 있다. offset은 0부터 세고, `offset + length`가 전체 길이를 넘지 않는지 확인한다.

다섯 번째 실수는 offset/length를 text symbol이나 literal에 직접 붙이려는 것이다. offset/length는 특정 데이터 객체의 일부 영역에 접근하는 문법이다. 먼저 변수에 담고 그 변수에서 잘라 읽는 흐름을 사용한다.

### 체험형 학습 설계

이 레슨에는 "길이와 조각 실험실"을 설계한다.

- 화면 구성: 타입 선택 패널(`c`, `n`, `p`), `LENGTH` 슬라이더, `DECIMALS` 입력, 값 입력칸, 메모리 격자, 출력 패널을 둔다.
- 데이터:
  - `c`: 입력값 `'AB'`, `'ABCD'`, `'ABCDE'`
  - `n`: 입력값 `'01234'`, `'000123'`
  - `p`: 입력값 `'7.00'`, `'123.45'`
  - offset 예제: `'20260630'`
- 버튼: `선언`, `대입`, `WRITE`, `offset 읽기`, `offset 바꾸기`, `범위 초과 실험`, `초기화`를 둔다.
- 상태:
  - `길이 맞음`: 메모리 격자가 지정 길이만큼 칸을 만든다.
  - `값 손실 주의`: 입력값이 고정 길이보다 길 때 뒤쪽 손실 가능성을 표시한다.
  - `numeric text`: `n` 타입 선택 시 "계산용 숫자가 아니라 자리 보존 텍스트"를 표시한다.
  - `packed amount`: `p` 타입 선택 시 소수 자릿수 칸을 분리해 보여준다.
  - `offset 오류`: 범위 초과 시 해당 칸을 빨간색으로 표시하고 `offset + length <= total length` 공식을 보여준다.
- 피드백: `lv_date_text+4(2)`를 실행하면 메모리 격자의 4번, 5번 칸만 강조하고 결과 `06`을 출력한다. `lv_date_text+6(2) = '01'`을 실행하면 마지막 두 칸이 바뀌고 전체 값이 `20260601`로 바뀌는 과정을 보여준다.

### 정리

`c`, `n`, `p`는 길이나 소수 자릿수와 함께 써야 의도가 분명해지는 타입이다. `c`는 고정 길이 문자, `n`은 숫자 모양의 텍스트, `p`는 금액처럼 정확한 10진 계산에 적합한 packed number다. offset/length는 `변수+offset(length)` 형태로 데이터 객체의 일부를 읽거나 바꾸며, offset은 0부터 센다.

## CH02-L04 - Local Type(TYPES) 재사용

### 왜 필요한가

프로그램이 조금만 길어져도 같은 타입 선언이 반복된다.

```abap
DATA lv_price TYPE p LENGTH 8 DECIMALS 2.
DATA lv_tax   TYPE p LENGTH 8 DECIMALS 2.
DATA lv_total TYPE p LENGTH 8 DECIMALS 2.
```

세 줄이 같은 규칙을 공유한다면 문제가 두 가지 생긴다. 첫째, 읽는 사람이 "이 세 값은 같은 종류의 금액인가?"를 직접 추측해야 한다. 둘째, 금액 자릿수를 바꾸어야 할 때 세 줄을 모두 찾아 고쳐야 한다. 하나라도 놓치면 같은 금액 그룹인데 서로 다른 타입이 된다.

`TYPES`는 이런 반복을 줄인다. 먼저 "금액 타입은 이런 모양"이라고 이름을 붙이고, 여러 변수가 그 타입을 사용하게 한다.

### 무엇인가

`TYPES`는 data type을 정의한다. 중요한 점은 `TYPES` 자체가 값을 담는 공간을 만들지 않는다는 것이다. 공식 문서 기준으로 data type은 data object의 템플릿이며, 작업 데이터를 저장할 메모리를 갖지 않는다.

```abap
REPORT z_ch02_l04_a.

TYPES ty_amount TYPE p LENGTH 8 DECIMALS 2.

DATA: lv_price TYPE ty_amount,
      lv_tax   TYPE ty_amount,
      lv_total TYPE ty_amount.

lv_price = '1000.00'.
lv_tax   = '100.00'.
lv_total = lv_price + lv_tax.

WRITE: / lv_price,
       / lv_tax,
       / lv_total.
```

이 코드는 두 단계로 읽는다.

1. `TYPES ty_amount TYPE p LENGTH 8 DECIMALS 2.`는 `ty_amount`라는 타입 설계도를 만든다.
2. `DATA lv_price TYPE ty_amount.`는 그 설계도를 사용해 실제 값을 담는 변수를 만든다.

비유하면 `TYPES`는 컵의 규격이고, `DATA`는 실제 컵이다. 규격만으로는 물을 담을 수 없다. 물을 담으려면 실제 컵이 필요하다. 그래서 `ty_amount = '1000.00'.`처럼 타입 이름에 값을 넣을 수 없다.

여러 local type도 chained statement로 선언할 수 있다.

```abap
REPORT z_ch02_l04_b.

TYPES: ty_amount TYPE p LENGTH 8 DECIMALS 2,
       ty_code   TYPE c LENGTH 4.

DATA: lv_price TYPE ty_amount,
      lv_code  TYPE ty_code.

lv_price = '1200.50'.
lv_code  = 'A001'.

WRITE: / lv_price,
       / lv_code.
```

여기서 `local type`이라는 말은 이 프로그램 안에서 정의한 타입이라는 뜻으로 받아들이면 된다. 여러 프로그램에서 공통으로 쓰는 전역 타입과 ABAP Dictionary 기반 설계는 CH03에서 다룬다.

### 어떻게 확인하는가

`TYPES`의 효과는 "한 곳을 바꾸면 그 타입을 사용하는 변수들의 규칙이 함께 바뀐다"는 점으로 확인한다.

```abap
REPORT z_ch02_l04_check_a.

TYPES ty_amount TYPE p LENGTH 8 DECIMALS 2.

DATA: lv_price TYPE ty_amount,
      lv_total TYPE ty_amount.

lv_price = '123.45'.
lv_total = lv_price + lv_price.

WRITE: / lv_price,
       / lv_total.
```

이제 `TYPES` 줄의 `DECIMALS 2`를 `DECIMALS 3`으로 바꿔 다시 실행해 본다.

```abap
TYPES ty_amount TYPE p LENGTH 8 DECIMALS 3.
```

`lv_price`, `lv_total` 선언은 그대로 두었지만 두 변수 모두 같은 타입 설계도를 따르므로 소수 자릿수 규칙이 함께 바뀐다. 이 실험은 `TYPES`가 단순한 줄 줄이기가 아니라 "의미 있는 타입 이름을 중심으로 규칙을 관리하는 방법"이라는 점을 보여준다.

또 다음 코드를 일부러 실행하지 말고 syntax check 관점으로 읽어 본다.

```abap
REPORT z_ch02_l04_wrong_a.

TYPES ty_amount TYPE p LENGTH 8 DECIMALS 2.

ty_amount = '100.00'.
```

`ty_amount`는 값이 들어가는 변수가 아니라 타입 이름이다. 값을 넣으려면 `DATA lv_amount TYPE ty_amount.`처럼 data object를 먼저 만들어야 한다.

### 실수와 주의

첫 번째 실수는 `TYPES`와 `DATA`를 섞어 이해하는 것이다. `TYPES`는 타입을 만든다. `DATA`는 값을 담는 변수를 만든다. 화면에 출력하거나 계산에 사용하는 것은 `DATA`로 선언한 변수다.

두 번째 실수는 타입을 사용한 뒤에 선언하는 것이다.

```abap
DATA lv_price TYPE ty_amount.

TYPES ty_amount TYPE p LENGTH 8 DECIMALS 2.
```

ABAP은 위에서 아래로 문장을 해석한다. `lv_price`를 선언하는 시점에 `ty_amount`가 아직 알려져 있지 않으면 오류가 난다. 타입은 사용하는 위치보다 먼저 선언한다.

세 번째 실수는 이름을 변수처럼 짓는 것이다. 교육 코드에서는 local type 이름에 `ty_` 접두어를 붙인다. 예를 들어 `ty_amount`, `ty_customer_code`처럼 쓰면 "이 이름은 타입이다"라는 신호가 된다. 변수는 `lv_price`, `lv_code`처럼 구분한다.

네 번째 실수는 local type을 전역 표준처럼 생각하는 것이다. 지금 만든 `ty_amount`는 이 프로그램 안에서만 의미가 있다. 회사 전체에서 재사용하는 공통 타입은 ABAP Dictionary의 domain, data element, structure와 연결되며 CH03에서 배운다.

### 체험형 학습 설계

이 레슨에는 "타입 설계도와 변수 복제" 시뮬레이터를 설계한다.

- 화면 구성: 왼쪽에는 `TYPES` 설계도 카드, 오른쪽에는 그 설계도를 사용하는 변수 카드 여러 개를 둔다.
- 데이터: `ty_amount TYPE p LENGTH 8 DECIMALS 2`, `lv_price`, `lv_tax`, `lv_total`을 기본으로 둔다.
- 버튼: `타입 만들기`, `변수 만들기`, `DECIMALS 변경`, `값 대입`, `잘못된 타입 대입 실험`, `초기화`를 둔다.
- 상태:
  - `설계도 없음`: 변수 선언 시 `Unknown type` 피드백을 표시한다.
  - `설계도 생성`: `ty_amount` 카드가 생기지만 값 칸은 없다.
  - `변수 생성`: 각 변수 카드가 `ty_amount`를 참조하며 값 칸을 가진다.
  - `설계도 변경`: 모든 변수 카드의 타입 규칙 표시가 동시에 바뀐다.
  - `오류`: 타입 이름에 값을 넣으려 하면 "타입은 메모리가 아니다"라고 표시한다.
- 피드백: 타입 카드는 파란 설계도 모양, 변수 카드는 실제 데이터 칸 모양으로 시각적으로 분리한다.

### 정리

`TYPES`는 반복되는 타입 규칙에 이름을 붙이는 문장이다. `TYPES`는 값을 저장하지 않고, `DATA`가 실제 data object를 만든다. 같은 금액, 같은 코드, 같은 플래그가 여러 번 등장하면 local type으로 의미를 붙이면 읽기 쉽고 바꾸기 쉬운 코드가 된다. 전역 재사용 타입은 CH03의 ABAP Dictionary에서 이어진다.

## CH02-L05 - CONSTANTS

### 왜 필요한가

프로그램에는 바뀌면 안 되는 값이 많다. 원주율, 고정 세율, 상태 코드, 최대 시도 횟수처럼 코드 여러 곳에서 같은 의미로 쓰는 값이 있다. 이런 값을 숫자나 문자 리터럴로 직접 쓰면 두 가지 문제가 생긴다.

첫째, 의미가 보이지 않는다.

```abap
lv_total = lv_price * '1.10'.
```

`'1.10'`이 부가세 포함 계산인지, 할인율인지, 임시 테스트 값인지 읽는 사람이 추측해야 한다.

둘째, 변경이 위험해진다. 같은 세율을 여러 곳에 직접 썼다면 세율이 바뀔 때 모든 위치를 찾아 바꿔야 한다. 하나라도 빠지면 같은 프로그램 안에서 서로 다른 기준이 섞인다.

상수는 이런 값을 이름으로 고정한다. 값은 바뀌지 않고, 코드는 의미 있는 이름을 읽는다.

### 무엇인가

`CONSTANTS`는 constant data object를 선언한다. 공식 문서 기준으로 constant의 내용은 runtime에 변경할 수 없고, 선언할 때 `VALUE`를 반드시 지정해야 한다.

```abap
REPORT z_ch02_l05_a.

CONSTANTS gc_tax_rate TYPE p LENGTH 4 DECIMALS 2 VALUE '0.10'.

DATA: lv_price TYPE p LENGTH 8 DECIMALS 2,
      lv_tax   TYPE p LENGTH 8 DECIMALS 2.

lv_price = '1000.00'.
lv_tax   = lv_price * gc_tax_rate.

WRITE: / lv_price,
       / lv_tax.
```

`gc_tax_rate`는 "세율"이라는 의미를 드러낸다. 코드에서 `0.10`만 보는 것보다 훨씬 안전하다. 교육 코드에서는 상수 이름에 `gc_` 접두어를 붙여 "global constant" 성격의 고정값임을 드러낸다. 프로젝트마다 접두어 규칙은 다를 수 있지만, 변수와 상수를 이름으로 구분하는 습관은 중요하다.

상수는 선언 뒤 값을 바꿀 수 없다.

```abap
REPORT z_ch02_l05_wrong_a.

CONSTANTS gc_limit TYPE i VALUE 10.

" 아래 줄은 오류가 난다.
" gc_limit = 20.
```

상수는 "처음 정한 값으로 계속 읽히는 값"이다. 그래서 `VALUE`가 필수다. 시작값이 없는 고정값은 의미가 없기 때문이다.

기존 학습 임베드 `CH02-L05-S01`은 이 레슨에 잘 맞는다. 원주율을 직접 숫자로 쓰는 코드와 `gc_pi` 상수를 쓰는 코드를 비교해 보여준다. 중요한 교육 포인트는 "상수는 계산을 화려하게 만드는 기능"이 아니라 "숨어 있는 의미를 이름으로 드러내고 변경 지점을 하나로 모으는 기능"이라는 점이다.

### 어떻게 확인하는가

아래 프로그램을 실행한다.

```abap
REPORT z_ch02_l05_check_a.

CONSTANTS gc_unit_price TYPE p LENGTH 8 DECIMALS 2 VALUE '1200.00'.
CONSTANTS gc_qty        TYPE i VALUE 3.

DATA lv_total TYPE p LENGTH 8 DECIMALS 2.

lv_total = gc_unit_price * gc_qty.

WRITE: / 'Unit Price:', gc_unit_price,
       / 'Quantity  :', gc_qty,
       / 'Total     :', lv_total.
```

확인할 점은 두 가지다.

- 출력 결과에는 상수의 값이 일반 변수처럼 읽혀 사용된다.
- 그러나 코드에서 상수에 새 값을 대입하려 하면 syntax check 단계에서 막힌다.

다음 줄의 주석을 일부러 풀어 syntax check를 실행해 본다.

```abap
" gc_qty = 5.
```

상수는 읽을 수는 있지만 쓸 수는 없다. 이 경험이 중요하다. 초보자는 "상수도 data object라면 값을 넣을 수 있는 것 아닌가?"라고 생각하기 쉽다. constant data object는 읽기 전용 data object로 이해한다.

### 실수와 주의

첫 번째 실수는 상수에 `VALUE`를 빼는 것이다.

```abap
CONSTANTS gc_limit TYPE i.
```

상수는 선언과 동시에 값이 확정되어야 한다. `VALUE` 없이 선언할 수 있는 변수와 다르다.

두 번째 실수는 상수에 다시 대입하는 것이다.

```abap
gc_limit = 20.
```

이 줄은 "고정값"이라는 약속을 깨므로 허용되지 않는다. 실행 중에 바뀌어야 하는 값이면 상수가 아니라 변수로 선언해야 한다.

세 번째 실수는 의미 없는 이름을 붙이는 것이다.

```abap
CONSTANTS gc_10 TYPE i VALUE 10.
```

이름이 값 자체를 반복하면 도움이 적다. `gc_retry_limit`, `gc_tax_rate`, `gc_company_code`처럼 업무 의미를 담아야 상수의 장점이 살아난다.

네 번째 실수는 모든 값을 상수로 만들려는 것이다. 프로그램 실행 중 바뀌는 현재 수량, 사용자 입력값, 계산 결과는 변수다. 변하지 않는 기준값, 코드값, 한 번 정하면 바뀌면 안 되는 값은 상수다.

표준 상수 중에는 나중에 조건문과 함께 자주 만나는 boolean 관련 값도 있다. 다만 조건문과 boolean 흐름은 CH04에서 다루므로, 이 레슨에서는 "상수라는 개념은 언어와 표준 라이브러리 전반에서 쓰인다"는 정도로만 두고 코드 예제는 만들지 않는다.

### 체험형 학습 설계

기존 `CH02-L05-S01` 임베드를 확장하는 방향으로 "매직 넘버 제거" 체험을 설계한다.

- 화면 구성: 왼쪽에는 숫자를 직접 쓰는 before 코드, 오른쪽에는 `CONSTANTS gc_pi ...` 또는 `CONSTANTS gc_tax_rate ...`를 쓰는 after 코드를 둔다.
- 데이터: 반지름, 원주율, 단가, 수량, 세율 중 하나를 선택할 수 있게 한다.
- 버튼: `before 실행`, `after 실행`, `상수값 변경 위치 찾기`, `상수 재대입 시도`, `다시하기`를 둔다.
- 상태:
  - `직접값 사용`: 여러 위치의 같은 숫자가 강조된다.
  - `상수 사용`: 상수 선언 한 줄과 사용 위치가 같은 색으로 연결된다.
  - `변경 시뮬레이션`: 세율을 바꿀 때 before는 여러 칸을 수정해야 하고 after는 상수 선언 한 줄만 수정하면 되는 모습을 보여준다.
  - `오류`: 상수 재대입 시도 시 "상수는 읽기 전용" 피드백을 표시한다.
- 피드백: 숫자 `10`처럼 값만 보일 때는 의미가 사라지고, `gc_retry_limit`처럼 이름이 있으면 의도가 보인다는 메시지를 준다.

### 정리

`CONSTANTS`는 바뀌면 안 되는 값에 이름을 붙인다. 상수는 선언할 때 `VALUE`가 필수이고, runtime에 값을 다시 대입할 수 없다. 좋은 상수 이름은 값 자체가 아니라 업무 의미를 드러낸다. 직접 숫자나 문자를 반복하는 대신 상수를 사용하면 코드가 읽기 쉽고 변경 지점이 명확해진다.

## CH02-L06 - Text Symbol

### 왜 필요한가

프로그램에 화면 문구를 직접 쓰면 처음에는 편하다.

```abap
WRITE '금액'.
```

하지만 SAP 시스템은 여러 언어로 쓰이는 경우가 많다. 한국어 사용자는 `금액`을 보고, 영어 사용자는 `Amount`를 봐야 할 수 있다. 문구를 코드 안에 직접 박아 넣으면 번역과 관리가 어려워진다. 코드 수정 없이 언어별 문구를 관리하려면 텍스트를 프로그램의 Text Elements로 분리해야 한다.

Text Symbol은 ABAP 프로그램 안에서 번역 가능한 짧은 텍스트를 참조하는 방법이다. CH02 마지막에 Text Symbol을 배우는 이유는 변수와 상수처럼 "값에 이름을 붙이는 감각"을 화면 문구까지 확장하기 위해서다.

### 무엇인가

Text Symbol은 프로그램의 text pool에 저장된 text element를 코드에서 참조하는 방식이다. 대표 문법은 두 가지다.

```abap
WRITE TEXT-001.
WRITE '금액'(001).
```

둘 다 `001`이라는 ID를 가진 text symbol을 참조한다. 그러나 누락 동작이 다르다.

| 문법 | Text Symbol이 존재할 때 | Text Symbol이 없을 때 |
|---|---|---|
| `TEXT-001` | 현재 언어의 text pool에서 `001` 값을 읽음 | initial single-character text field처럼 동작하므로 빈 값처럼 보일 수 있음 |
| `'금액'(001)` | 현재 언어의 text pool에서 `001` 값으로 대체됨 | 코드의 literal `'금액'`을 그대로 사용 |

이 차이는 매우 중요하다. `TEXT-001`은 번역 누락을 빨리 발견하게 해 준다. 등록되지 않으면 화면이 비어 보여 문제를 알아차릴 수 있다. 반대로 `'금액'(001)`은 text symbol이 없으면 literal이 fallback으로 나오므로 화면은 덜 깨져 보이지만, 번역 누락이 숨어버릴 수 있다.

기본 예제는 다음과 같다.

```abap
REPORT z_ch02_l06_a.

DATA lv_amount TYPE p LENGTH 8 DECIMALS 2 VALUE '123.45'.

WRITE: / TEXT-001,
       / lv_amount.
```

이 코드를 의미 있게 실행하려면 프로그램의 Text Elements에서 Text Symbol `001`을 등록해야 한다.

| ID | 기본 텍스트 예 |
|---|---|
| `001` | `금액` |

그 다음 다른 언어 번역에 `Amount`를 등록하면, 로그온 언어나 text environment에 따라 화면 문구가 달라질 수 있다. CH02에서는 `SET LANGUAGE` 같은 언어 전환 문장은 다루지 않는다. 여기서는 "문구를 코드 밖 text pool로 분리한다"는 설계 감각을 익힌다.

### 어떻게 확인하는가

확인 절차는 코드와 Text Elements를 함께 봐야 한다.

1. `SE38`에서 프로그램을 만든다.
2. 아래 코드를 입력한다.

```abap
REPORT z_ch02_l06_check.

DATA lv_amount TYPE p LENGTH 8 DECIMALS 2 VALUE '123.45'.

WRITE: / TEXT-001,
       / '금액'(001),
       / lv_amount.
```

3. 프로그램의 Text Elements에서 Text Symbol `001`을 만든다.
4. `001`의 텍스트를 `금액`으로 저장한다.
5. 활성화 후 실행한다.

Text Symbol을 등록한 상태에서는 `TEXT-001`과 `'금액'(001)` 모두 등록된 텍스트를 사용한다. 이제 Text Symbol `001`을 일부러 지우거나 다른 프로그램에서 등록하지 않은 상태로 실행하면 차이를 관찰할 수 있다.

- `TEXT-001`은 빈 값처럼 보일 수 있다.
- `'금액'(001)`은 literal `금액`을 fallback으로 보여준다.

이 실험은 "fallback이 친절해 보이지만 번역 누락을 숨길 수 있다"는 점을 알려준다.

### 실수와 주의

첫 번째 실수는 코드에 `TEXT-001`만 쓰고 Text Elements에 등록하지 않는 것이다. 문법은 맞아도 실행 화면에서 빈 값처럼 보여 학습자가 당황할 수 있다. Text Symbol은 코드와 Text Elements가 한 쌍이다.

두 번째 실수는 ID 자릿수를 헷갈리는 것이다. 일반적인 text symbol 참조는 `TEXT-001`처럼 세 글자 ID를 사용한다. `TEXT-1`이라고 쓰는 습관은 피한다.

세 번째 실수는 Text Symbol과 Message Class를 섞는 것이다. Text Symbol은 프로그램의 화면 문구를 text pool에서 가져오는 장치다. 사용자에게 오류, 경고, 정보 메시지를 내는 message class와 `MESSAGE` 문은 다른 주제이며 나중에 별도로 다룬다.

네 번째 실수는 `'문구'(001)` fallback을 항상 더 좋은 방식으로 보는 것이다. fallback은 화면이 비어 보이는 것을 막아 주지만, 번역 또는 text element 누락을 발견하기 어렵게 만들 수 있다. 수업에서는 두 문법을 모두 보여주고, 팀 기준에 맞춰 선택해야 한다고 설명한다.

다섯 번째 실수는 번역 길이를 너무 짧게 잡는 것이다. 같은 의미라도 언어가 바뀌면 글자 수가 늘어날 수 있다. Text Symbol을 만들 때 최대 길이를 너무 타이트하게 잡으면 번역문이 잘릴 수 있다.

### 체험형 학습 설계

기존 `CH02-L06-S01` fill-blank 임베드를 기반으로 "Text Symbol 언어 전환 실험기"를 설계한다.

- 화면 구성: 코드 영역, Text Elements 테이블, 언어 선택 탭(`KO`, `EN`, `미등록`), 출력 리스트를 둔다.
- 데이터:
  - 코드: `WRITE TEXT-001.`, `WRITE '금액'(001).`
  - Text Elements: `001 = 금액`, English translation `001 = Amount`
  - 누락 상태: `001` 없음
- 버튼: `TEXT-001 실행`, `'금액'(001) 실행`, `Text Symbol 등록`, `번역 추가`, `누락 상태로 실행`, `다시하기`를 둔다.
- 상태:
  - `등록됨`: 두 문법 모두 text pool 값을 출력한다.
  - `번역됨`: 언어 탭에 따라 `금액` 또는 `Amount`가 출력된다.
  - `누락-TEXT`: `TEXT-001` 결과가 빈 값처럼 표시되고 "누락을 빨리 발견할 수 있다"는 피드백을 준다.
  - `누락-literal`: `'금액'(001)` 결과가 `금액`으로 표시되고 "fallback이 누락을 숨길 수 있다"는 피드백을 준다.
  - `ID 오류`: `TEXT-01` 같은 입력에 "세 글자 ID를 사용하라"는 피드백을 준다.
- 피드백: Text Symbol은 코드 줄 하나만 보는 기능이 아니라 "코드와 text pool과 언어"가 함께 움직이는 구조임을 시각적으로 연결한다.

### 정리

Text Symbol은 화면 문구를 코드 밖 text pool로 분리해 번역 가능하게 만든다. `TEXT-001`은 등록된 text symbol을 직접 참조하고, 누락 시 빈 값처럼 보일 수 있다. `'금액'(001)`은 등록된 text symbol이 있으면 그 값을 쓰고, 없으면 literal을 fallback으로 사용한다. 화면 문구를 직접 코드에 박아 넣지 않고 Text Elements로 관리하는 습관은 다국어 SAP 개발의 기본이다.

## 챕터 전체 정리

CH02는 앞으로의 ABAP 학습에서 계속 쓰이는 데이터 기본기를 만든다.

| 레슨 | 핵심 |
|---|---|
| L01 | `DATA`로 변수를 선언하고 `TYPE`, `LIKE`, `VALUE`를 읽는다 |
| L02 | `string`, `i`, `f`, `d`, `t` complete type의 용도와 주의점을 구분한다 |
| L03 | `c`, `n`, `p` incomplete type에 `LENGTH`, `DECIMALS`를 붙여 의도를 명확히 한다 |
| L04 | `TYPES`로 반복되는 타입 규칙에 이름을 붙인다 |
| L05 | `CONSTANTS`로 바뀌면 안 되는 값을 의미 있는 이름으로 고정한다 |
| L06 | Text Symbol로 화면 문구를 text pool에 분리하고 번역 가능하게 만든다 |

이 장을 끝낸 학습자는 "값을 그냥 코드에 적는 방식"과 "값을 변수, 타입, 상수, Text Symbol로 관리하는 방식"의 차이를 설명할 수 있어야 한다. 아직 조건문, 날짜 계산, Dictionary 전역 타입, 데이터베이스는 다루지 않는다. 다음 CH03에서는 이 타입 감각을 ABAP Dictionary의 domain, data element, structure로 확장한다.
