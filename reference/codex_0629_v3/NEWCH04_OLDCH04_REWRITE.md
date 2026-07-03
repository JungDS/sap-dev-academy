# CH04_REWRITE - Operators, Control Flow, Debugging, Multiplication Table

> 기준 소스: `content/abap/CH04/_chapter.md`, `content/abap/CH04/CH04-L01.md` ~ `CH04-L07.md`
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 기존 `reference/codex_0625` 진단
> 공식 문서 확인: `C:\ABAP_DOCU_HTML`의 arithmetic expression, arithmetic operators, date/time processing, string statements, logical expression, IF, CASE, DO, WHILE, loop exit statements, system fields, BREAK-POINT 항목을 수동 확인

## 챕터 설계

CH03까지 학습자는 값을 선언하고, 전역 타입 규칙을 만들고, `PARAMETERS`로 실행 전에 값을 입력받았다. 하지만 입력받은 값은 아직 "가만히 있는 값"이다. 프로그램이 실제 일을 하려면 값으로 계산하고, 조건에 따라 다른 길로 가고, 같은 일을 여러 번 반복할 수 있어야 한다.

CH04의 목표는 프로그램에 세 가지 힘을 넣는 것이다.

1. 연산: 숫자와 문자열을 계산하고 가공한다.
2. 분기: 조건에 따라 실행할 문장을 선택한다.
3. 반복: 같은 패턴을 정해진 횟수 또는 조건이 참인 동안 되풀이한다.

이 장의 관통 실습은 구구단이다. 구구단은 입문용 예제로 가볍게 보이지만, 실제로는 ABAP 기본기를 확인하기에 좋다. 단수와 곱하는 수를 변수에 담고, 곱셈으로 결과를 만들고, `IF`로 범위를 걸러내고, `DO`로 9번 반복하고, 디버거로 `sy-index`와 변수 변화를 눈으로 확인할 수 있기 때문이다.

신규 레슨은 추가하지 않는다. 원본 7개 레슨은 "연산 -> 문자열 -> IF -> CASE -> 반복 -> 디버깅 -> 통합 실습" 순서로 자연스럽게 닫힌다. 다만 원본 L04는 설명이 짧고, L06은 도구 절차가 본문으로 더 풀려야 하므로 완성 강의자료 수준으로 보강한다.

R15 게이팅은 엄격히 유지한다. CH04는 classic-first 구간이다. `DATA(...)`, constructor expression, string template, modern Open SQL은 사용하지 않는다. 문자열 연결 `&&`만 원장상 CH04 조기 허용 예외로 다룬다. 복합 대입은 CH18 이후 주제이므로 이 장에서 예제로 쓰지 않는다.

## CH04-L01 - 산술 연산과 대입, 날짜 산술

### 왜 필요한가

CH03의 `PARAMETERS p_amount TYPE i.`는 사용자가 금액을 입력하게 해 준다. 그러나 입력값을 그대로 출력만 하면 프로그램이 아니라 입력 메모장에 가깝다. 실제 업무 프로그램은 입력값을 계산한다.

예를 들어 주문 수량과 단가가 들어오면 총액을 계산해야 한다. 할인율이 있으면 할인 금액을 빼야 한다. 납기일은 주문일에서 며칠 뒤인지 계산해야 한다. 반복문을 돌릴 때도 현재 회차와 단수를 곱해야 한다. 그래서 산술 연산은 "프로그램이 값을 바꾸는 첫 번째 방법"이다.

입문자가 여기서 꼭 잡아야 할 감각은 두 가지다.

| 감각 | 설명 |
|---|---|
| 표현식은 오른쪽에서 계산된다 | `gv_total = p_price * p_qty.`에서 `p_price * p_qty`가 먼저 계산되고 결과가 `gv_total`에 들어간다 |
| 대상 타입이 결과 모양을 결정한다 | 소수 결과를 정수 변수에 넣으면 소수 정보를 잃을 수 있다 |

### 무엇인가

ABAP의 기본 산술 연산자는 다음과 같다.

| 연산자 | 의미 | 예 |
|---|---|---|
| `+` | 더하기 | `gv_result = 7 + 3.` |
| `-` | 빼기 | `gv_result = 7 - 3.` |
| `*` | 곱하기 | `gv_result = 7 * 3.` |
| `/` | 나누기 | `gv_result = 10 / 4.` |
| `DIV` | 정수 나눗셈의 몫 | `gv_quotient = 10 DIV 4.` |
| `MOD` | 나머지 | `gv_remainder = 10 MOD 4.` |
| `**` | 거듭제곱 | `gv_power = 2 ** 10.` |

공식 문서의 arithmetic operators 기준으로 `*`, `/`, `DIV`, `MOD`는 `+`, `-`보다 우선순위가 높다. 그래서 아래 두 문장은 결과가 다르다.

```abap
DATA gv_result TYPE i.

gv_result = 2 + 3 * 4.
WRITE: / gv_result.        " 14

gv_result = ( 2 + 3 ) * 4.
WRITE: / gv_result.        " 20
```

입문 단계에서는 우선순위를 외우는 것보다 괄호를 습관화하는 편이 안전하다. 업무 로직에서 `공급가 + 세금 * 수량` 같은 식을 괄호 없이 쓰면 리뷰하는 사람도 의도를 바로 읽기 어렵다.

대입은 `=`를 사용한다.

```abap
DATA gv_total TYPE i.

gv_total = 1000.
gv_total = gv_total + 500.
```

두 번째 줄은 수학 등식이 아니다. 오른쪽의 현재 `gv_total + 500`을 계산한 뒤, 그 결과를 다시 왼쪽 `gv_total`에 넣는 명령이다. `MOVE`도 과거 ABAP에서 많이 보이지만, 이 교육에서는 값을 넣는 기본 표현으로 `=`를 사용한다.

classic 명령형 산술문도 알아야 기존 코드를 읽을 수 있다.

```abap
DATA gv_count TYPE i.

gv_count = 10.
ADD 5 TO gv_count.          " gv_count = 15
SUBTRACT 3 FROM gv_count.   " gv_count = 12
MULTIPLY gv_count BY 2.     " gv_count = 24
DIVIDE gv_count BY 4.       " gv_count = 6
```

새 코드를 쓸 때는 보통 `gv_count = gv_count + 5.`처럼 표현식으로 쓰는 편이 읽기 쉽다. 그러나 기존 SAP 시스템에는 `ADD`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`가 남아 있으므로 CH04에서 읽기 능력까지 확보한다.

`CLEAR`는 변수 값을 타입별 초기값으로 되돌린다.

```abap
DATA gv_amount TYPE i.
DATA gv_name   TYPE c LENGTH 10.
DATA gv_date   TYPE d.

gv_amount = 100.
gv_name   = 'ABAP'.
gv_date   = '20260101'.

CLEAR gv_amount.   " 0
CLEAR gv_name.     " blank
CLEAR gv_date.     " 00000000
```

`CLEAR`는 "삭제"가 아니라 "초기화"다. 변수 자체가 없어지는 것이 아니라, 타입이 정한 빈 값으로 돌아간다.

날짜 타입 `d`는 날짜 계산에서 자주 쓰인다.

```abap
DATA gv_start TYPE d.
DATA gv_due   TYPE d.
DATA gv_days  TYPE i.

gv_start = '20260101'.
gv_due   = gv_start + 30.
gv_days  = gv_due - gv_start.

WRITE: / '시작일:', gv_start.
WRITE: / '납기일:', gv_due.
WRITE: / '차이일:', gv_days.
```

초보자에게 가장 안전한 날짜 산술은 날짜에 정수 일수를 더하거나 빼는 것, 날짜와 날짜의 차이를 일수로 보는 것이다. 시간 타입 `t`도 ABAP에서 별도 시간 필드로 다루지만, 자정 넘어감과 시간대까지 섞이면 업무 의미가 복잡해진다. CH04에서는 날짜 산술을 먼저 손에 익히고, 시간대와 timestamp는 뒤의 심화 주제로 남긴다.

### 어떻게 확인하는가

다음 프로그램을 실행하고 결과를 직접 비교한다.

```abap
REPORT z_ch04_l01_calc.

DATA gv_i   TYPE i.
DATA gv_dec TYPE p LENGTH 8 DECIMALS 2.
DATA gv_mod TYPE i.
DATA gv_due TYPE d.

gv_i = 2 + 3 * 4.
WRITE: / '2 + 3 * 4 =', gv_i.

gv_i = ( 2 + 3 ) * 4.
WRITE: / '( 2 + 3 ) * 4 =', gv_i.

gv_i = 10 / 4.
WRITE: / 'integer target 10 / 4 =', gv_i.

gv_dec = 10 / 4.
WRITE: / 'decimal target 10 / 4 =', gv_dec.

gv_i = 10 DIV 4.
gv_mod = 10 MOD 4.
WRITE: / '10 DIV 4 =', gv_i, '10 MOD 4 =', gv_mod.

gv_due = sy-datum + 7.
WRITE: / '오늘:', sy-datum, '7일 뒤:', gv_due.
```

확인 포인트는 다음이다.

| 확인할 것 | 기대하는 관찰 |
|---|---|
| 괄호 유무 | `2 + 3 * 4`와 `( 2 + 3 ) * 4`가 다르게 나온다 |
| 정수 대상과 소수 대상 | 나누기 결과를 어떤 타입에 넣는지에 따라 표시되는 값이 달라진다 |
| `DIV`와 `MOD` | 몫과 나머지가 분리된다 |
| 날짜 + 정수 | 오늘 날짜에서 지정 일수 뒤 날짜가 계산된다 |

### 실수와 주의

가장 흔한 실수는 소수 결과를 정수 변수에 넣는 것이다.

```abap
DATA gv_result TYPE i.

gv_result = 10 / 4.
```

`10 / 4`의 수학적 결과는 2.5지만, 왼쪽이 정수 타입이면 최종 저장 모양은 정수다. 금액, 환율, 비율처럼 소수가 중요한 값은 `p LENGTH ... DECIMALS ...`를 사용한다.

두 번째 실수는 0으로 나누는 것이다.

```abap
DATA gv_total TYPE i.
DATA gv_count TYPE i.
DATA gv_avg   TYPE i.

gv_total = 100.
gv_count = 0.

" 위험: 0으로 나누기
gv_avg = gv_total / gv_count.
```

공식 문서의 arithmetic 관련 예외에는 zero divide가 포함된다. 입문자는 "나누기 전에는 분모가 0인지 확인한다"를 습관으로 가져가야 한다.

```abap
IF gv_count = 0.
  WRITE: / '평균을 계산할 수 없습니다.'.
ELSE.
  gv_avg = gv_total / gv_count.
  WRITE: / gv_avg.
ENDIF.
```

세 번째 실수는 날짜를 문자처럼 조립하는 것이다.

```abap
" 좋지 않은 접근
" gv_due = '202601' && '32'.
```

날짜는 `d` 타입에 담고 날짜 산술로 계산한다. 날짜 유효성, 달력, 휴일은 별도 업무 규칙이 필요하지만, 최소한 "문자열 붙이기"로 날짜를 만드는 습관은 피한다.

### 체험 설계

기존 임베드 `embeds/abap/CH04-L01-S01.html`은 산술 스텝 디버거다. 웹 레슨에서는 다음처럼 연결한다.

| 요소 | 설계 |
|---|---|
| 버튼 | `시작`, `다음`, `다시하기` |
| 상태 | 시작 전, 실행할 줄 강조, 방금 실행한 줄, 완료 |
| 데이터 | `gv_a`, `gv_b`, `gv_result`, `gv_due` 같은 변수 모니터 |
| 피드백 | 각 줄 실행 후 "오른쪽 표현식이 먼저 계산되고 왼쪽 변수에 저장됨" 메시지 표시 |
| 실험 옵션 | 괄호 켜기/끄기, 정수 대상/소수 대상 선택, 분모 0 입력 |

버튼을 누를 때마다 코드 한 줄이 실행되고 변수 모니터가 바뀌어야 한다. 초보자는 산술식을 읽을 때 머릿속으로만 따라가기 어렵다. "아직 실행 전 줄"과 "방금 실행된 줄"을 색으로 구분하면 대입의 흐름이 눈에 들어온다.

### 정리

산술 연산은 값을 계산하는 첫 단계다. `+`, `-`, `*`, `/`, `DIV`, `MOD`, `**`를 읽고, 괄호로 의도를 분명히 하고, 결과 타입을 조심해야 한다. `CLEAR`는 변수를 타입별 초기값으로 되돌린다. 날짜는 문자 조립이 아니라 `d` 타입과 날짜 산술로 다룬다.

## CH04-L02 - 문자열 다루기

### 왜 필요한가

업무 데이터는 숫자만으로 이루어지지 않는다. 고객명, 자재명, 사번, 회사 코드, 메시지, 파일명처럼 문자열이 훨씬 많다. 사용자가 입력한 값에는 앞뒤 공백이 붙을 수 있고, 한 필드 안에 `1000:정훈영`처럼 여러 정보가 섞여 있을 수 있다. 출력 메시지는 여러 조각을 합쳐야 한다.

따라서 문자열을 다루는 능력은 "보여주기"와 "입력 정리"의 기본이다.

CH04-L02의 목표는 문자열을 다음 네 가지 동작으로 볼 수 있게 만드는 것이다.

| 동작 | ABAP 도구 |
|---|---|
| 붙이기 | `CONCATENATE`, `&&` |
| 쪼개기 | `SPLIT` |
| 찾고 바꾸기 | `FIND`, `REPLACE` |
| 정리하고 변환하기 | `CONDENSE`, `SHIFT`, `TRANSLATE`, `OVERLAY`, `WRITE TO`, `strlen( )` |

### 무엇인가

`CONCATENATE`는 여러 문자열을 하나로 붙인다.

```abap
DATA gv_first TYPE c LENGTH 10.
DATA gv_last  TYPE c LENGTH 10.
DATA gv_full  TYPE c LENGTH 30.

gv_first = 'Hoon'.
gv_last  = 'Young'.

CONCATENATE gv_first gv_last INTO gv_full SEPARATED BY space.
WRITE: / gv_full.
```

`&&`도 문자열 연결에 사용할 수 있다. 이 교육 과정에서 `&&`는 CH04 조기 허용 예외다. 단, 문자열 템플릿은 아직 사용하지 않는다.

```abap
DATA gv_msg TYPE string.

gv_msg = 'Hello, ' && gv_full.
WRITE: / gv_msg.
```

`SPLIT`은 문자열을 구분자로 나눈다.

```abap
DATA gv_source TYPE string.
DATA gv_bukrs  TYPE c LENGTH 4.
DATA gv_name   TYPE c LENGTH 20.

gv_source = '1000:정훈영'.

SPLIT gv_source AT ':' INTO gv_bukrs gv_name.

WRITE: / gv_bukrs.
WRITE: / gv_name.
```

`FIND`는 문자열 안에서 패턴을 찾는다.

```abap
DATA gv_text TYPE string.

gv_text = 'Classic ABAP lesson'.

FIND 'ABAP' IN gv_text.

IF sy-subrc = 0.
  WRITE: / '찾았습니다.'.
ELSE.
  WRITE: / '없습니다.'.
ENDIF.
```

`REPLACE`는 찾은 내용을 바꾼다.

```abap
DATA gv_text TYPE string.

gv_text = 'ABAP is old'.

REPLACE FIRST OCCURRENCE OF 'old' IN gv_text WITH 'important'.
WRITE: / gv_text.
```

`CONDENSE`는 공백을 정리한다.

```abap
DATA gv_text TYPE c LENGTH 40.

gv_text = '   SAP     ABAP   '.
CONDENSE gv_text.
WRITE: / gv_text.          " SAP ABAP

gv_text = '   SAP     ABAP   '.
CONDENSE gv_text NO-GAPS.
WRITE: / gv_text.          " SAPABAP
```

`SHIFT`는 문자열을 밀거나 특정 문자를 제거하는 데 쓰인다.

```abap
DATA gv_code TYPE c LENGTH 10.

gv_code = '00001234'.
SHIFT gv_code LEFT DELETING LEADING '0'.
WRITE: / gv_code.
```

`TRANSLATE`는 대소문자를 바꾼다.

```abap
DATA gv_text TYPE c LENGTH 20.

gv_text = 'abap'.
TRANSLATE gv_text TO UPPER CASE.
WRITE: / gv_text.
```

`OVERLAY`는 한 문자열의 빈 자리 또는 지정한 문자 자리를 다른 문자열로 덮는다. 실무에서는 자주 쓰는 핵심문은 아니지만, 레거시 코드 읽기 능력을 위해 개념을 잡는다.

```abap
DATA gv_mask TYPE c LENGTH 10.
DATA gv_data TYPE c LENGTH 10.

gv_mask = 'ID:      '.
gv_data = '  A123   '.

OVERLAY gv_mask WITH gv_data.
WRITE: / gv_mask.
```

`WRITE TO`는 화면에 바로 출력하는 `WRITE`와 다르다. 값을 출력 형식으로 변환해 문자 변수에 넣는다.

```abap
DATA gv_amount TYPE p LENGTH 8 DECIMALS 2.
DATA gv_text   TYPE c LENGTH 20.

gv_amount = '1234.50'.
WRITE gv_amount TO gv_text.

WRITE: / gv_text.
```

`strlen( )`은 문자열 길이를 구하는 내장 함수다.

```abap
DATA gv_text TYPE string.
DATA gv_len  TYPE i.

gv_text = 'ABAP'.
gv_len = strlen( gv_text ).

WRITE: / gv_len.
```

CH04 원장에는 `abs`, `sqrt`, `ipow` 같은 숫자 내장 함수도 포함된다. 이들은 산술 표현식 안에서 값을 계산하는 함수다.

```abap
DATA gv_result TYPE i.

gv_result = abs( -10 ).
WRITE: / gv_result.

gv_result = ipow( base = 2 exp = 5 ).
WRITE: / gv_result.
```

함수의 named parameter는 공식 문서에도 등장하지만, 입문자는 "함수 괄호 안에 입력값을 넣고 결과를 받는다"는 감각만 먼저 잡으면 충분하다.

### 어떻게 확인하는가

다음 프로그램을 실행한다.

```abap
REPORT z_ch04_l02_string.

DATA gv_raw   TYPE string.
DATA gv_bukrs TYPE c LENGTH 4.
DATA gv_name  TYPE c LENGTH 20.
DATA gv_msg   TYPE string.
DATA gv_len   TYPE i.

gv_raw = ' 1000:hoonyoung '.

CONDENSE gv_raw NO-GAPS.
SPLIT gv_raw AT ':' INTO gv_bukrs gv_name.
TRANSLATE gv_name TO UPPER CASE.

gv_len = strlen( gv_name ).
gv_msg = '회사=' && gv_bukrs && ', 이름=' && gv_name.

FIND 'YOUNG' IN gv_name.

IF sy-subrc = 0.
  WRITE: / gv_msg, ', 길이=', gv_len, ', YOUNG 포함'.
ELSE.
  WRITE: / gv_msg, ', 길이=', gv_len, ', YOUNG 없음'.
ENDIF.
```

확인 포인트는 다음이다.

| 확인할 것 | 기대하는 관찰 |
|---|---|
| `CONDENSE ... NO-GAPS` | 앞뒤 공백과 내부 공백이 모두 제거된다 |
| `SPLIT ... AT ':'` | `1000`과 `hoonyoung`이 분리된다 |
| `TRANSLATE ... TO UPPER CASE` | 이름이 대문자로 바뀐다 |
| `FIND`와 `sy-subrc` | 찾으면 `sy-subrc = 0`, 못 찾으면 0이 아니다 |
| `&&` | 메시지 조각이 하나의 문자열로 이어진다 |

### 실수와 주의

첫 번째 실수는 고정 길이 문자 타입의 공백을 잊는 것이다.

```abap
DATA gv_c TYPE c LENGTH 10.
DATA gv_s TYPE string.

gv_c = 'ABAP'.
gv_s = gv_c && 'END'.
```

`c LENGTH 10`은 남는 자리가 공백이다. 화면에서는 티가 덜 나지만, 연결이나 비교에서 의도와 다를 수 있다. 초보자는 공백이 중요한 경우 `CONDENSE`, `SHIFT`, 또는 `string` 타입 사용을 검토한다.

두 번째 실수는 `SPLIT` 결과 대상 개수를 고려하지 않는 것이다.

```abap
SPLIT 'A:B:C' AT ':' INTO gv_one gv_two.
```

값이 세 조각인데 대상이 두 개뿐이면 나머지 처리 방식이 기대와 다를 수 있다. 여러 조각을 안전하게 다루는 internal table은 CH06 이후에 본격적으로 다룬다. CH04에서는 대상 필드 수와 입력 형식을 맞춘다.

세 번째 실수는 `SEARCH` 같은 obsolete 문을 새 코드에 쓰는 것이다. 원장과 공식 대조 기준으로 새 설명은 `FIND`를 사용한다.

네 번째 실수는 문자열 템플릿을 여기서 섞는 것이다. 문자열 템플릿은 편리하지만 CH18 이후의 modern syntax 구간에서 다룬다. CH04에서는 `CONCATENATE`와 `&&`로 충분하다.

### 체험 설계

기존 임베드 `embeds/abap/CH04-L02-S01.html`은 문자열 함수 빈칸 채우기다. 본문과 연결할 때 다음 설계를 사용한다.

| 요소 | 설계 |
|---|---|
| 버튼 | `채점하기`, `정답 보기`, `다시하기` |
| 입력 | `CONCATENATE`, `SPLIT`, `strlen`, `FIND`의 핵심 키워드 빈칸 |
| 상태 | 미입력, 일부 정답, 모두 정답, 정답 공개 |
| 데이터 | 원본 문자열, 분리된 회사 코드, 이름, 길이, 찾기 결과 |
| 피드백 | 틀린 칸마다 "이 위치에는 구분자 지정 키워드가 필요함"처럼 역할 중심 설명 |

추가 실험 패널을 만든다면 다음 버튼이 좋다.

| 버튼 | 동작 |
|---|---|
| `공백 정리` | 원본 문자열에 `CONDENSE`와 `CONDENSE NO-GAPS`를 각각 적용 |
| `대문자 변환` | `TRANSLATE ... TO UPPER CASE` 전후 비교 |
| `찾기 실행` | 찾을 단어 입력 후 `sy-subrc` 값을 0/4로 표시 |
| `바꾸기 실행` | `REPLACE FIRST OCCURRENCE` 후 결과 문자열 표시 |

### 정리

문자열 처리는 입력을 정리하고, 값을 분해하고, 메시지를 만드는 기본 기술이다. `CONCATENATE`와 `&&`는 붙이고, `SPLIT`은 나누고, `FIND`와 `REPLACE`는 찾고 바꾸고, `CONDENSE`, `SHIFT`, `TRANSLATE`, `OVERLAY`, `WRITE TO`는 문자열 모양을 다듬는다. CH04에서는 문자열 템플릿이 아니라 classic-first 방식과 `&&` 예외만 사용한다.

## CH04-L03 - IF와 조건식

### 왜 필요한가

계산만 하는 프로그램은 항상 같은 길로 간다. 하지만 업무 프로그램은 조건에 따라 다르게 행동해야 한다.

예를 들어 금액이 1000보다 크면 승인 대상이고, 0이면 입력 오류이고, 그 외에는 일반 처리일 수 있다. 사용자가 입력한 회사 코드가 비어 있으면 메시지를 내고, 값이 있으면 조회를 진행해야 한다. 구구단에서도 단수가 2보다 작거나 9보다 크면 계산을 막아야 한다.

이때 사용하는 기본 분기문이 `IF`다.

### 무엇인가

`IF`는 논리식이 참인지 거짓인지에 따라 실행할 문장 블록을 고른다.

```abap
PARAMETERS p_amt TYPE i.

IF p_amt > 1000.
  WRITE: / '큰 금액입니다.'.
ELSEIF p_amt = 1000.
  WRITE: / '기준 금액입니다.'.
ELSE.
  WRITE: / '일반 금액입니다.'.
ENDIF.
```

위 코드는 위에서 아래로 조건을 검사한다. 처음 참이 되는 블록 하나만 실행한다. `IF`가 참이면 아래의 `ELSEIF`와 `ELSE`는 보지 않는다.

비교 연산자는 다음과 같이 읽는다.

| 기호 | 단어형 | 의미 |
|---|---|---|
| `=` | `EQ` | 같다 |
| `<>` | `NE` | 같지 않다 |
| `<` | `LT` | 작다 |
| `>` | `GT` | 크다 |
| `<=` | `LE` | 작거나 같다 |
| `>=` | `GE` | 크거나 같다 |

입문 단계에서는 기호형을 먼저 익힌다. 단어형도 기존 코드에서 보이므로 읽을 수는 있어야 한다.

여러 조건은 `AND`, `OR`, `NOT`으로 연결한다.

```abap
PARAMETERS p_dan TYPE i.

IF p_dan >= 2 AND p_dan <= 9.
  WRITE: / '구구단 범위입니다.'.
ELSE.
  WRITE: / '2부터 9 사이를 입력하세요.'.
ENDIF.
```

`AND`는 모두 참이어야 참이다. `OR`는 하나라도 참이면 참이다. `NOT`은 참과 거짓을 뒤집는다. 공식 문서 기준 논리식은 truth value, 즉 참 또는 거짓 결과를 만든다.

복잡한 조건은 괄호로 의도를 고정한다.

```abap
IF ( p_dan >= 2 AND p_dan <= 9 ) OR p_dan = 99.
  WRITE: / '허용된 입력입니다.'.
ENDIF.
```

`IS INITIAL`은 타입별 초기값인지 확인한다.

```abap
DATA gv_name TYPE c LENGTH 20.

IF gv_name IS INITIAL.
  WRITE: / '이름이 비어 있습니다.'.
ENDIF.
```

ABAP에는 일반적인 의미의 built-in boolean 타입이 없다. 실무에서는 `abap_bool`, `abap_true`, `abap_false`, `'X'`, space를 많이 본다. 논리식 결과를 변수에 담아야 할 때는 boolean function을 사용할 수 있다.

```abap
DATA gv_is_valid TYPE abap_bool.

gv_is_valid = xsdbool( p_dan >= 2 AND p_dan <= 9 ).

IF gv_is_valid = abap_true.
  WRITE: / '계산 가능'.
ELSE.
  WRITE: / '계산 불가'.
ENDIF.
```

`xsdbool( )`은 논리식을 ABAP boolean 값으로 바꾸는 데 쓰인다. `boolc( )`도 공식 boolean function에 포함되지만 반환 타입과 비교 방식 때문에 입문 단계에서는 `xsdbool( )`을 우선 설명한다.

### 어떻게 확인하는가

다음 프로그램을 세 번 실행한다. `p_amt`에 0, 1000, 1500을 각각 입력한다.

```abap
REPORT z_ch04_l03_if.

PARAMETERS p_amt TYPE i.

DATA gv_is_large TYPE abap_bool.

gv_is_large = xsdbool( p_amt > 1000 ).

IF p_amt IS INITIAL.
  WRITE: / '금액이 비어 있거나 0입니다.'.
ELSEIF gv_is_large = abap_true.
  WRITE: / '큰 금액입니다.'.
ELSE.
  WRITE: / '일반 금액입니다.'.
ENDIF.
```

확인 포인트는 다음이다.

| 입력 | 관찰 |
|---|---|
| `0` | `IS INITIAL` 가지로 들어간다 |
| `1000` | `ELSE` 가지로 들어간다 |
| `1500` | `gv_is_large = abap_true`가 되어 큰 금액 가지로 들어간다 |

디버거에서 `gv_is_large` 값을 보면 조건식 결과가 `'X'` 또는 blank 계열 값으로 저장되는 것을 볼 수 있다.

### 실수와 주의

첫 번째 실수는 `=`를 수학의 등식처럼 읽는 것이다.

```abap
IF p_amt = 1000.
```

`IF` 안의 `=`는 비교다. 그러나 대입문에서 `gv_amt = 1000.`은 값을 넣는 것이다. 같은 기호라도 위치에 따라 역할이 다르다.

두 번째 실수는 `OR` 조건의 범위를 잘못 쓰는 것이다.

```abap
" 잘못된 범위 검사
IF p_dan >= 2 OR p_dan <= 9.
  WRITE: / '허용'.
ENDIF.
```

이 조건은 거의 모든 숫자가 참이 된다. 1은 `p_dan <= 9`가 참이고, 10은 `p_dan >= 2`가 참이다. "2 이상이면서 9 이하"는 `AND`다.

```abap
IF p_dan >= 2 AND p_dan <= 9.
  WRITE: / '허용'.
ENDIF.
```

세 번째 실수는 `IS INITIAL`을 "문자열만 빈 값"으로 오해하는 것이다. `IS INITIAL`은 타입별 초기값을 본다. `i` 타입의 초기값은 0이고, `c` 타입은 blank, `d` 타입은 `00000000`이다.

네 번째 실수는 boolean 값을 아무 문자와 비교하는 것이다. `abap_bool` 변수는 `abap_true`, `abap_false`와 비교하는 습관이 안전하다.

### 체험 설계

기존 임베드 `embeds/abap/CH04-L03-S01.html`은 IF 분기 흐름도다.

| 요소 | 설계 |
|---|---|
| 입력 | `p_amt` 숫자 입력 |
| 버튼 | `조건 검사`, `다음 조건`, `초기화` |
| 상태 | IF 검사 전, 첫 조건 검사, ELSEIF 검사, ELSE 실행, ENDIF 도착 |
| 데이터 | `p_amt`, `gv_is_large`, 현재 검사 중인 조건, 실행된 WRITE |
| 피드백 | "첫 번째 조건이 참이므로 아래 조건은 검사하지 않음"처럼 흐름 중심 설명 |

시각화는 마름모를 조건, 사각형을 실행문으로 표시한다. `p_amt > 1000`이 참일 때 아래 `ELSEIF`가 회색으로 비활성화되면, "한 번 갈라진 뒤 하나만 실행한다"는 IF의 핵심이 명확해진다.

### 정리

`IF`는 조건에 따라 실행 경로를 고르는 기본 분기문이다. 비교 연산자와 `AND`, `OR`, `NOT`, 괄호를 함께 사용한다. `IS INITIAL`은 타입별 초기값 검사다. ABAP boolean은 일반 언어의 boolean과 다르게 다루므로 `abap_bool`, `abap_true`, `abap_false`, `xsdbool( )`의 의미를 분명히 잡아야 한다.

## CH04-L04 - CASE 분기

### 왜 필요한가

`IF`는 어떤 조건이든 표현할 수 있다. 하지만 한 변수의 값에 따라 여러 갈래로 나뉘는 코드를 모두 `IF`로 쓰면 반복이 심해진다.

```abap
IF p_grade = 'A'.
  WRITE: / '우수'.
ELSEIF p_grade = 'B'.
  WRITE: / '양호'.
ELSEIF p_grade = 'C'.
  WRITE: / '보통'.
ELSE.
  WRITE: / '확인 필요'.
ENDIF.
```

여기서는 계속 `p_grade` 하나만 비교한다. 이런 상황은 `CASE`가 더 읽기 쉽다.

### 무엇인가

`CASE`는 하나의 기준 값을 여러 `WHEN` 값과 비교해 맞는 블록 하나를 실행한다.

```abap
PARAMETERS p_grade TYPE c LENGTH 1.

CASE p_grade.
  WHEN 'A'.
    WRITE: / '우수'.
  WHEN 'B'.
    WRITE: / '양호'.
  WHEN 'C'.
    WRITE: / '보통'.
  WHEN OTHERS.
    WRITE: / '확인 필요'.
ENDCASE.
```

공식 문서 기준으로 `CASE`도 최대 하나의 statement block만 실행한다. 첫 번째로 맞는 `WHEN`을 찾으면 그 블록을 실행하고 `ENDCASE` 뒤로 간다.

여러 값을 같은 처리로 묶을 수도 있다.

```abap
CASE p_grade.
  WHEN 'A' OR 'B'.
    WRITE: / '통과'.
  WHEN 'C'.
    WRITE: / '재검토'.
  WHEN OTHERS.
    WRITE: / '미분류'.
ENDCASE.
```

`CASE`는 "한 기준 값을 같은지 비교"할 때 적합하다. 범위 조건이나 서로 다른 변수를 섞은 조건은 `IF`가 더 맞다.

```abap
" 범위 조건은 IF가 적합
IF p_amt >= 1000 AND p_amt <= 5000.
  WRITE: / '중간 금액'.
ENDIF.
```

### 어떻게 확인하는가

다음 프로그램을 실행하고 `A`, `B`, `C`, `X`를 입력한다.

```abap
REPORT z_ch04_l04_case.

PARAMETERS p_grade TYPE c LENGTH 1.

TRANSLATE p_grade TO UPPER CASE.

CASE p_grade.
  WHEN 'A' OR 'B'.
    WRITE: / '통과 등급입니다.'.
  WHEN 'C'.
    WRITE: / '보통 등급입니다.'.
  WHEN 'D' OR 'F'.
    WRITE: / '재학습이 필요합니다.'.
  WHEN OTHERS.
    WRITE: / '정의되지 않은 등급입니다.'.
ENDCASE.
```

확인 포인트는 다음이다.

| 입력 | 관찰 |
|---|---|
| `A` | 첫 번째 `WHEN 'A' OR 'B'` 실행 |
| `B` | 첫 번째 `WHEN 'A' OR 'B'` 실행 |
| `C` | 두 번째 `WHEN 'C'` 실행 |
| `X` | `WHEN OTHERS` 실행 |

### 실수와 주의

첫 번째 실수는 `CASE`로 범위를 억지로 표현하는 것이다. 금액이 1000 이상인지, 단수가 2부터 9 사이인지 같은 조건은 `IF`가 자연스럽다.

두 번째 실수는 `WHEN OTHERS`를 빼는 것이다. 모든 입력값이 예상 범위 안에 있다고 믿으면, 실제 운영에서 정의되지 않은 값이 들어왔을 때 아무 출력도 없이 지나갈 수 있다.

세 번째 실수는 대소문자 정리를 잊는 것이다. `p_grade`에 `a`가 들어오면 `WHEN 'A'`와 같지 않다. 입력을 대문자로 통일할 필요가 있으면 `TRANSLATE ... TO UPPER CASE` 같은 전처리를 먼저 한다.

### 체험 설계

기존 임베드 `embeds/abap/CH04-L04-S01.html`은 CASE 분기 시뮬레이터다.

| 요소 | 설계 |
|---|---|
| 입력 | 등급 선택 드롭다운 또는 버튼 `A`, `B`, `C`, `X` |
| 버튼 | `CASE 실행`, `OR 묶기 보기`, `초기화` |
| 상태 | 기준 값 표시, 현재 검사 중인 `WHEN`, 실행된 블록, `WHEN OTHERS` 도달 여부 |
| 데이터 | `p_grade`, 매칭된 `WHEN`, 출력 메시지 |
| 피드백 | "`A`는 첫 번째 `WHEN`에서 이미 일치했으므로 아래 `WHEN`은 검사하지 않음" |

`IF` 시뮬레이터와 나란히 배치하면 좋다. 같은 등급 판정을 `IF`와 `CASE`로 보여 주고, 중복되는 `p_grade =` 비교가 `CASE`에서 사라지는 것을 시각적으로 비교한다.

### 정리

`CASE`는 하나의 기준 값을 여러 값과 비교할 때 읽기 좋은 분기문이다. `WHEN OTHERS`로 예외 입력을 받는 습관이 중요하다. 범위 조건, 여러 변수의 복합 조건, 크고 작음 비교는 `IF`를 사용한다.

## CH04-L05 - DO, WHILE, 루프 제어, SY 필드

### 왜 필요한가

구구단 2단을 출력한다고 생각해 보자.

```abap
WRITE: / 2 * 1.
WRITE: / 2 * 2.
WRITE: / 2 * 3.
...
WRITE: / 2 * 9.
```

이 방식은 불편하고 위험하다. 9줄 중 하나를 빼먹을 수 있고, 3단으로 바꾸려면 모든 줄을 고쳐야 한다. 반복되는 패턴은 반복문으로 표현해야 한다.

반복문은 "같은 구조의 일을 여러 번 수행"하게 해 준다. ABAP 입문에서 가장 먼저 만나는 반복문은 `DO`와 `WHILE`이다.

### 무엇인가

`DO n TIMES`는 정해진 횟수만큼 반복한다.

```abap
DATA gv_result TYPE i.

DO 5 TIMES.
  gv_result = sy-index * 2.
  WRITE: / sy-index, gv_result.
ENDDO.
```

`sy-index`는 현재 반복 회차를 알려주는 시스템 필드다. 위 예제에서 `sy-index`는 1, 2, 3, 4, 5로 바뀐다.

`WHILE`은 조건이 참인 동안 반복한다.

```abap
DATA gv_num TYPE i.

gv_num = 1.

WHILE gv_num <= 5.
  WRITE: / gv_num.
  gv_num = gv_num + 1.
ENDWHILE.
```

`WHILE`에서는 반복 조건을 언젠가 거짓으로 만들 코드가 반드시 필요하다. 위 예제의 `gv_num = gv_num + 1.`이 없으면 무한 반복이 된다.

루프 안에서 흐름을 제어하는 문장도 있다.

| 문장 | 루프 안에서의 의미 |
|---|---|
| `EXIT` | 현재 루프 전체를 끝내고 루프 뒤로 이동 |
| `CONTINUE` | 현재 회차의 남은 문장을 건너뛰고 다음 회차로 이동 |
| `CHECK log_exp` | 조건이 거짓이면 현재 회차를 건너뛰고 다음 회차로 이동 |

예제를 보자.

```abap
DATA gv_remainder TYPE i.

DO 9 TIMES.
  gv_remainder = sy-index MOD 2.

  IF gv_remainder <> 0.
    CONTINUE.
  ENDIF.

  WRITE: / sy-index, '짝수'.
ENDDO.
```

홀수 회차에서는 `CONTINUE`가 실행되어 아래 `WRITE`를 건너뛴다.

`CHECK`를 사용하면 같은 의미를 더 짧게 표현할 수 있다.

```abap
DO 9 TIMES.
  CHECK sy-index MOD 2 = 0.
  WRITE: / sy-index, '짝수'.
ENDDO.
```

초보 단계에서는 `CHECK`가 루프 밖에서 다른 의미를 가질 수 있다는 점만 알아 둔다. CH04에서는 루프 안에서 "조건이 맞지 않으면 이번 회차를 지나간다"로 사용한다.

`EXIT`는 반복을 완전히 끝낸다.

```abap
DO 9 TIMES.
  IF sy-index > 5.
    EXIT.
  ENDIF.

  WRITE: / sy-index.
ENDDO.
```

### 유용한 SY 필드

ABAP에는 `sy-`로 시작하는 시스템 필드가 있다. 시스템이 현재 실행 환경이나 직전 명령 결과를 담아 준다. CH04에서는 전체를 외우는 것이 아니라 "자주 보는 필드의 용도"를 잡는다.

| 필드 | 의미 | 초보자용 사용 예 |
|---|---|---|
| `sy-index` | DO/WHILE 반복 회차 | 구구단에서 곱하는 수 |
| `sy-datum` | 현재 날짜 | 기본 실행일 출력, 날짜 계산 기준 |
| `sy-uzeit` | 현재 시간 | 실행 시각 표시 |
| `sy-uname` | 현재 사용자 | 누가 실행했는지 출력 |
| `sy-mandt` | 현재 client | client 종속 데이터 이해의 준비 |
| `sy-langu` | 로그온 언어 | 다국어 텍스트 이해의 준비 |
| `sy-tcode` | 현재 transaction code | 어떤 T-code로 들어왔는지 확인 |
| `sy-repid` | 현재 프로그램 이름 | 로그/출력에 프로그램명 표시 |
| `sy-subrc` | 직전 특정 명령의 성공 여부 | `FIND`, `READ TABLE`, `SELECT` 이후 결과 확인 |

공식 문서는 시스템 필드가 모든 문장에서 항상 신뢰 가능한 방식으로 바뀌는 것은 아니라고 경고한다. 즉, 어떤 명령이 `sy-subrc`를 세팅한다고 문서화되어 있을 때 그 직후에 확인해야 한다. 중간에 다른 문장을 실행한 뒤 오래된 `sy-subrc`를 믿으면 안 된다.

### 어떻게 확인하는가

다음 프로그램을 실행한다.

```abap
REPORT z_ch04_l05_loop.

DATA gv_remainder TYPE i.

WRITE: / '실행자:', sy-uname.
WRITE: / '실행일:', sy-datum.
WRITE: / '실행시각:', sy-uzeit.
SKIP.

DO 9 TIMES.
  gv_remainder = sy-index MOD 2.

  IF gv_remainder <> 0.
    CONTINUE.
  ENDIF.

  WRITE: / '짝수 회차:', sy-index.
ENDDO.
```

확인 포인트는 다음이다.

| 확인할 것 | 관찰 |
|---|---|
| `sy-uname`, `sy-datum`, `sy-uzeit` | 실행 환경 정보가 출력된다 |
| `sy-index` | 루프 회차마다 1부터 증가한다 |
| `MOD` | 짝수/홀수 판정에 쓰인다 |
| `CONTINUE` | 홀수 회차는 출력하지 않는다 |

### 실수와 주의

첫 번째 실수는 `WHILE`에서 조건을 바꾸지 않는 것이다.

```abap
DATA gv_num TYPE i.

gv_num = 1.

WHILE gv_num <= 5.
  WRITE: / gv_num.
ENDWHILE.
```

`gv_num`이 계속 1이면 조건은 영원히 참이다. `WHILE` 안에는 조건을 거짓으로 만들 변화가 있어야 한다.

두 번째 실수는 `EXIT`와 `CONTINUE`를 혼동하는 것이다. `EXIT`는 루프를 끝낸다. `CONTINUE`는 이번 회차만 건너뛰고 다음 회차로 간다.

세 번째 실수는 `sy-index`를 모든 반복의 영구 번호처럼 생각하는 것이다. 중첩 루프에서는 안쪽 루프에서도 `sy-index`가 바뀐다. 바깥 회차 값이 필요하면 별도 변수에 저장한다.

```abap
DATA gv_dan TYPE i.
DATA gv_mul TYPE i.

DO 8 TIMES.
  gv_dan = sy-index + 1.

  DO 9 TIMES.
    gv_mul = sy-index.
    WRITE: / gv_dan, 'x', gv_mul.
  ENDDO.
ENDDO.
```

네 번째 실수는 `sy-subrc`를 너무 늦게 확인하는 것이다.

```abap
FIND 'ABAP' IN gv_text.
" 여기서 바로 sy-subrc 확인
IF sy-subrc = 0.
  WRITE: / '찾음'.
ENDIF.
```

### 체험 설계

기존 임베드 `embeds/abap/CH04-L05-S01.html`은 `DO`와 `sy-index` 스텝 디버거다.

| 요소 | 설계 |
|---|---|
| 버튼 | `시작`, `다음`, `다시하기` |
| 상태 | 루프 진입 전, 회차별 실행, `CONTINUE`로 건너뜀, 루프 완료 |
| 데이터 | `sy-index`, `gv_remainder`, 출력 버퍼 |
| 피드백 | "이번 회차는 홀수라 CONTINUE로 WRITE를 건너뜀" |
| 시각 장치 | 반복 회차 막대 1~9, 현재 회차 강조, 출력된 회차만 진하게 표시 |

추가로 `WHILE` 무한 루프 예방 체험을 만들 수 있다.

| 버튼 | 동작 |
|---|---|
| `증가문 끄기` | `gv_num = gv_num + 1.`을 비활성화하고 경고 표시 |
| `5회 안전 정지` | 브라우저 시뮬레이터에서는 실제 무한 반복 대신 5회 후 "조건이 변하지 않음" 피드백 |

### 정리

`DO`는 정해진 횟수 반복, `WHILE`은 조건 반복이다. `sy-index`는 반복 회차를 알려 준다. `EXIT`, `CONTINUE`, `CHECK`는 루프 안에서 흐름을 조절한다. 시스템 필드는 유용하지만, 문서화된 시점에 바로 확인해야 한다.

## CH04-L06 - 디버깅 입문

### 왜 필요한가

초보자는 코드가 틀렸을 때 주로 `WRITE`를 계속 추가한다. 이것도 도움이 되지만 한계가 있다. 값이 어느 줄에서 바뀌었는지, 조건이 왜 다른 가지로 들어갔는지, 반복문이 몇 회 돌았는지는 출력만으로 확인하기 어렵다.

디버거는 프로그램 실행을 멈추고, 한 줄씩 진행하면서 변수 값을 보는 도구다. CH04에서 디버거를 도입하는 이유는 명확하다. 이제 연산, 분기, 반복을 배웠으므로 "프로그램이 실제로 어느 줄을 지나가는지"를 눈으로 확인할 수 있다.

### 무엇인가

`BREAK-POINT`는 프로그램 실행 중 멈출 지점을 만든다.

```abap
REPORT z_ch04_l06_debug.

PARAMETERS p_dan TYPE i.

DATA gv_mul TYPE i.
DATA gv_res TYPE i.

BREAK-POINT.

DO 9 TIMES.
  gv_mul = sy-index.
  gv_res = p_dan * gv_mul.
  WRITE: / p_dan, 'x', gv_mul, '=', gv_res.
ENDDO.
```

프로그램이 dialog processing에서 active breakpoint에 도달하면 ABAP Debugger로 들어간다. 운영성 코드에 무심코 남기면 실행이 멈출 수 있으므로 학습용 프로그램에서만 사용하고, 실제 반영 전 제거해야 한다.

SAP GUI에서 `/h`는 다음 실행부터 디버깅을 켜는 명령으로 쓰인다. 화면 명령 입력칸에 `/h`를 넣고 Enter를 누른 뒤 실행하면 디버거가 시작된다.

디버거에서 입문자가 먼저 익힐 키는 다음이다.

| 키 | 의미 | 입문자 설명 |
|---|---|---|
| F5 | Single Step | 다음 한 문장으로 들어가며 실행 |
| F6 | Execute | 현재 문장을 실행하되 내부 호출로 깊게 들어가지 않음 |
| F7 | Return | 현재 호출 수준을 빠져나옴 |
| F8 | Continue | 다음 breakpoint 또는 종료까지 계속 실행 |

CH04에서는 FORM, Function Module, Method를 아직 본격적으로 배우지 않았으므로 F6/F7의 깊은 의미는 뒤에서 재방문한다. 지금은 F5로 한 줄씩 실행하고 F8로 계속 실행하는 감각을 잡는다.

Watchpoint는 특정 변수 값이 조건을 만족할 때 멈추는 장치다. 예를 들어 `gv_res = 14`가 되는 순간 멈추게 하면, 구구단에서 언제 그 값이 만들어지는지 볼 수 있다.

### 어떻게 확인하는가

다음 절차로 확인한다.

1. `z_ch04_l06_debug` 프로그램을 만든다.
2. `p_dan`에 `2`를 입력한다.
3. `BREAK-POINT`에서 디버거가 열리는지 확인한다.
4. 변수 영역에 `p_dan`, `sy-index`, `gv_mul`, `gv_res`를 올린다.
5. F5를 눌러 한 줄씩 진행한다.
6. `DO` 안에서 `sy-index`가 1, 2, 3으로 바뀌는지 본다.
7. `gv_res`가 `p_dan * gv_mul` 이후에 바뀌는지 본다.

디버거에서 확인할 핵심은 "문장이 실행되기 전과 후의 차이"다. 강조된 줄이 아직 실행 전인지, 방금 실행된 줄인지 구분해야 변수 변화가 이해된다.

### 실수와 주의

첫 번째 실수는 breakpoint를 실제 전달 코드에 남기는 것이다. 학습 중에는 유용하지만, 협업 코드에서는 실행을 멈추는 위험이 된다.

두 번째 실수는 F8을 눌러 버리고 "아무것도 못 봤다"고 생각하는 것이다. F8은 계속 실행이다. 한 줄씩 보고 싶으면 F5를 사용한다.

세 번째 실수는 값 변경 기능을 남용하는 것이다. 디버거에서 변수 값을 바꿀 수 있지만, 그것은 원인을 고친 것이 아니다. 값 변경은 가설 검증용으로만 사용하고, 실제 수정은 코드에서 해야 한다.

네 번째 실수는 Short Dump를 실패로만 보는 것이다. Dump가 나면 ST22에서 어떤 예외가 어느 줄에서 발생했는지 볼 수 있다. 0으로 나누기 같은 오류를 일부러 재현해 보면, 덤프도 학습 자료가 된다.

### 체험 설계

기존 임베드 `embeds/abap/CH04-L06-S01.html`은 구구단 디버거다.

| 요소 | 설계 |
|---|---|
| 버튼 | `시작`, `다음(F5)`, `계속(F8)`, `watchpoint 설정`, `초기화` |
| 상태 | breakpoint 도착, 실행 전 줄, 실행 후 줄, watchpoint 정지, 완료 |
| 데이터 | `p_dan`, `sy-index`, `gv_mul`, `gv_res`, 출력 버퍼 |
| 피드백 | "이 줄은 곱셈 전이므로 gv_res는 아직 이전 값" |
| watchpoint | `gv_res = 14` 또는 `sy-index = 7` 조건 선택 |

브라우저 시뮬레이터에서는 실제 ABAP Debugger를 대체하지 않는다. 대신 F5의 감각을 훈련한다. 사용자가 다음 버튼을 누를 때 코드 라인 강조, 변수 모니터, 출력 버퍼가 함께 바뀌면 ABAP GUI에서 디버거를 열었을 때 덜 당황한다.

### 정리

디버거는 프로그램을 멈추고, 한 줄씩 실행하며, 변수 변화를 확인하는 도구다. `BREAK-POINT`, `/h`, F5, F8을 먼저 익히고, watchpoint와 변수 확인을 통해 연산·분기·반복의 실제 흐름을 본다. CH04 이후 모든 장에서 "디버거로 직접 확인"은 반복되는 학습 습관이 된다.

## CH04-L07 - 종합 실습: 구구단

### 왜 필요한가

구구단은 CH04의 모든 요소를 한 번에 묶는다.

| 필요한 요소 | 구구단에서의 역할 |
|---|---|
| `PARAMETERS` | 사용자가 출력할 단 또는 범위를 입력 |
| 산술 연산 | 단수와 곱하는 수를 곱함 |
| `IF` | 입력 범위 검증 또는 출력 범위 필터링 |
| `DO` | 1부터 9까지 반복 |
| `sy-index` | 현재 곱하는 수 |
| 디버거 | 반복마다 변수 변화를 확인 |

단순한 출력 예제가 아니라, 앞으로 CH05 Structure, CH06 Internal Table, CH07 Transparent Table로 이어지는 관통 예제의 출발점이다. CH04에서는 한 줄씩 바로 출력한다. CH05에서는 한 줄을 구조체로 묶고, CH06에서는 여러 줄을 internal table에 담고, CH07에서는 저장까지 생각하게 된다.

### 무엇인가

먼저 특정 단 하나를 출력한다.

```abap
REPORT z_ch04_l07_one_dan.

PARAMETERS p_dan TYPE i.

DATA gv_mul TYPE i.
DATA gv_res TYPE i.

IF p_dan < 2 OR p_dan > 9.
  WRITE: / '2부터 9 사이의 단을 입력하세요.'.
ELSE.
  DO 9 TIMES.
    gv_mul = sy-index.
    gv_res = p_dan * gv_mul.
    WRITE: / p_dan, 'x', gv_mul, '=', gv_res.
  ENDDO.
ENDIF.
```

여기서 `IF p_dan < 2 OR p_dan > 9`는 "범위 밖"을 잡는 조건이다. 정상 범위는 `p_dan >= 2 AND p_dan <= 9`이고, 그 반대가 위 조건이다.

전체 2단부터 9단까지 출력하려면 중첩 반복을 사용한다.

```abap
REPORT z_ch04_l07_all_dan.

DATA gv_dan TYPE i.
DATA gv_mul TYPE i.
DATA gv_res TYPE i.

DO 8 TIMES.
  gv_dan = sy-index + 1.

  WRITE: / '---', gv_dan, '단 ---'.

  DO 9 TIMES.
    gv_mul = sy-index.
    gv_res = gv_dan * gv_mul.
    WRITE: / gv_dan, 'x', gv_mul, '=', gv_res.
  ENDDO.

  SKIP.
ENDDO.
```

바깥 `DO 8 TIMES`는 2부터 9까지 단수를 만든다. 첫 회차 `sy-index`는 1이므로 `gv_dan = sy-index + 1`로 2단을 만든다. 안쪽 `DO 9 TIMES`는 1부터 9까지 곱하는 수를 만든다.

범위를 입력받아 일부 단만 출력할 수도 있다.

```abap
REPORT z_ch04_l07_range.

PARAMETERS p_from TYPE i DEFAULT 2.
PARAMETERS p_to   TYPE i DEFAULT 9.

DATA gv_dan TYPE i.
DATA gv_mul TYPE i.
DATA gv_res TYPE i.

IF p_from < 2 OR p_to > 9 OR p_from > p_to.
  WRITE: / '범위는 2부터 9 사이이며 시작 단은 종료 단보다 작거나 같아야 합니다.'.
ELSE.
  DO 8 TIMES.
    gv_dan = sy-index + 1.

    IF gv_dan < p_from OR gv_dan > p_to.
      CONTINUE.
    ENDIF.

    WRITE: / '---', gv_dan, '단 ---'.

    DO 9 TIMES.
      gv_mul = sy-index.
      gv_res = gv_dan * gv_mul.
      WRITE: / gv_dan, 'x', gv_mul, '=', gv_res.
    ENDDO.

    SKIP.
  ENDDO.
ENDIF.
```

이 예제는 CH04의 좋은 종합 문제다. `PARAMETERS`, 범위 검사 `IF`, 반복 `DO`, 건너뛰기 `CONTINUE`, 곱셈 `*`, 시스템 필드 `sy-index`, 출력 `WRITE`가 모두 들어 있다.

### 어떻게 확인하는가

다음 순서로 확인한다.

| 단계 | 입력 | 확인 |
|---|---|---|
| 특정 단 | `p_dan = 2` | 2단이 1부터 9까지 출력 |
| 입력 오류 | `p_dan = 1` | 오류 메시지 출력 |
| 전체 단 | 입력 없음 | 2단부터 9단까지 출력 |
| 범위 단 | `p_from = 3`, `p_to = 5` | 3단, 4단, 5단만 출력 |
| 범위 오류 | `p_from = 8`, `p_to = 3` | 오류 메시지 출력 |

디버거 확인은 다음 변수를 올려서 한다.

| 변수 | 확인할 변화 |
|---|---|
| `gv_dan` | 바깥 반복마다 2, 3, 4...로 바뀐다 |
| `gv_mul` | 안쪽 반복마다 1부터 9까지 바뀐다 |
| `gv_res` | `gv_dan * gv_mul` 결과로 바뀐다 |
| `sy-index` | 현재 루프 기준 회차를 보여 준다 |

중첩 루프에서는 `sy-index`가 어느 루프의 회차인지 주의해야 한다. 그래서 바깥 단수는 `gv_dan`에 저장한 뒤 안쪽 루프에 들어간다.

### 실수와 주의

첫 번째 실수는 입력 검증 없이 계산하는 것이다. `p_dan = 0`이나 `p_dan = 99`도 계산 자체는 되지만, 구구단 업무 규칙에는 맞지 않는다. 프로그램은 계산 가능 여부뿐 아니라 업무적으로 허용되는 값인지도 확인해야 한다.

두 번째 실수는 중첩 루프에서 `sy-index`를 잘못 읽는 것이다.

```abap
DO 8 TIMES.
  DO 9 TIMES.
    WRITE: / sy-index.
  ENDDO.
ENDDO.
```

안쪽에서 보는 `sy-index`는 안쪽 루프의 회차다. 바깥 단수는 안쪽 루프 전에 별도 변수에 저장한다.

세 번째 실수는 범위 검사에서 `AND`와 `OR`를 반대로 쓰는 것이다. 정상 범위를 확인할 때와 오류 범위를 확인할 때 조건식이 달라진다.

```abap
" 정상 범위
IF p_from >= 2 AND p_to <= 9 AND p_from <= p_to.

" 오류 범위
IF p_from < 2 OR p_to > 9 OR p_from > p_to.
```

네 번째 실수는 `CONTINUE` 위치를 잘못 두는 것이다. 범위 밖 단을 건너뛰려면 단 제목을 출력하기 전에 `CONTINUE`가 있어야 한다.

### 체험 설계

기존 임베드 `embeds/abap/CH04-L07-S01.html`은 구구단 빈칸 채우기다. 완성 레슨에서는 다음 체험까지 확장할 수 있다.

| 요소 | 설계 |
|---|---|
| 입력 | 단수, 시작 단, 종료 단 |
| 버튼 | `한 단 실행`, `전체 실행`, `범위 실행`, `디버거 모드`, `초기화` |
| 상태 | 입력 대기, 검증 실패, 실행 중, 완료, 디버거 정지 |
| 데이터 | `p_dan`, `p_from`, `p_to`, `gv_dan`, `gv_mul`, `gv_res`, 출력 줄 목록 |
| 피드백 | 범위 오류 시 "2~9 사이인지, 시작 단이 종료 단보다 크지 않은지 확인" |
| 디버거 모드 | `다음` 버튼으로 바깥 루프와 안쪽 루프를 한 단계씩 진행 |

시각 장치는 2차원 표가 좋다. 행은 단수, 열은 1~9 곱하는 수다. 현재 계산 중인 칸을 강조하고, 이미 계산된 칸은 채워진 상태로 둔다. 사용자가 `p_from = 3`, `p_to = 5`를 입력하면 2단과 6~9단은 흐리게 비활성화하고, 3~5단만 활성화한다.

### 정리

구구단은 CH04의 종합 실습이다. 특정 단, 전체 단, 범위 단을 구현하면서 산술, 문자열 출력, IF, DO, CONTINUE, `sy-index`, 디버거를 함께 사용한다. 여기서 만든 불편함이 다음 장의 동기가 된다. 한 줄을 구성하는 `gv_dan`, `gv_mul`, `gv_res`가 서로 흩어져 있으므로 CH05에서는 Structure로 한 줄을 묶는다.

## CH04 마무리

CH04를 끝내면 학습자는 "값을 받는 프로그램"에서 "판단하고 반복하는 프로그램"으로 넘어온다. 이 장의 최소 성취 기준은 다음이다.

| 기준 | 할 수 있어야 하는 일 |
|---|---|
| 산술 | 우선순위, 괄호, 나누기, `DIV`, `MOD`, `CLEAR`, 날짜 + 일수 계산을 설명할 수 있다 |
| 문자열 | 붙이기, 쪼개기, 찾기, 바꾸기, 공백 정리, 대소문자 변환을 코드로 쓸 수 있다 |
| 조건 | `IF`, `ELSEIF`, `ELSE`, `AND`, `OR`, `NOT`, `IS INITIAL`을 읽고 쓸 수 있다 |
| CASE | 한 기준 값의 다중 분기를 `CASE`로 정리할 수 있다 |
| 반복 | `DO`, `WHILE`, `EXIT`, `CONTINUE`, `CHECK`, `sy-index`를 설명할 수 있다 |
| 디버깅 | `BREAK-POINT`, `/h`, F5, F8, 변수 모니터로 흐름을 확인할 수 있다 |
| 종합 | 구구단 특정 단, 전체 단, 범위 단을 구현하고 디버거로 변수 변화를 볼 수 있다 |

다음 CH05에서는 구구단 한 줄을 이루는 단수, 곱하는 수, 결과를 따로따로 들고 다니는 불편함을 해결한다. 여러 변수를 하나의 의미 있는 묶음으로 만드는 Structure가 등장한다.
