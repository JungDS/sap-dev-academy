# CH12_REWRITE - SELECT-OPTIONS and Range Table

> 기준 소스: `content/abap/CH12/_chapter.md`, `content/abap/CH12/CH12-L01.md` ~ `CH12-L07.md`
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 기존 `reference/codex_0625`, `reference/codex_0625_v2`
> 공식 문서 확인: `C:\ABAP_DOCU_HTML`의 `SELECT-OPTIONS`, `FOR`, value/screen options, selection screen, ranges table, `TYPE RANGE OF`, `RANGES`, `IN range_tab`, `TABLES`, `APPEND`, `SELECT`, `START-OF-SELECTION` 항목을 수동 확인

## 챕터 설계

CH11에서 학습자는 예매 목록 전체를 SALV 표로 볼 수 있게 되었다. 이제 사용자는 바로 다음 요구를 낸다.

```text
전체 예매 말고 공연 C001만 보고 싶다.
예약 상태인 건만 보고 싶다.
C001부터 C003까지 보고 싶다.
취소된 건은 빼고 싶다.
고객명이 정으로 시작하는 건만 보고 싶다.
```

값 하나만 받는 `PARAMETERS`로는 이런 요구가 불편하다. 단일 값 하나를 받는 화면은 "하나만 고르기"에는 좋지만, 여러 값, 범위, 제외 조건, 패턴 조건을 담기에는 부족하다.

CH12의 목표는 사용자의 조건 입력을 Range Table로 이해하고, 그 Range Table을 classic Open SQL의 `WHERE ... IN`에 연결하는 것이다. 이 장을 지나면 학습자는 "선택화면의 From/To와 다중 선택 팝업이 프로그램 안에서 어떤 표로 바뀌는지"를 말할 수 있어야 한다.

CH12는 classic-first 구간이다. 코드 예제는 classic `SELECT-OPTIONS`, classic `TABLES`, classic `WHERE field IN s_xxx` 형태로 둔다. modern Open SQL host marker는 CH19 전에는 쓰지 않는다. `START-OF-SELECTION`은 선택화면 입력 후 실제 조회가 시작되는 위치를 보여 주기 위한 선행 사용이며, event block 전체 설명은 CH15로 넘긴다.

`TABLES`도 주의해서 다룬다. 공식 문서상 table work area는 오래된 스타일이며 일반 설계 도구로 권장할 대상이 아니다. 하지만 `SELECT-OPTIONS ... FOR zbooking-field`를 classic report에서 읽고 이해하는 데 자주 등장하므로, CH12에서는 Dictionary 필드 참조를 위한 선행 사용으로 제한한다.

## CH12-L01 - Range Table 구조

### 왜 필요한가

예매 목록을 필터링하려면 조건을 담을 그릇이 필요하다. 단순한 변수 하나로는 "C001 또는 C002", "C001부터 C003까지", "취소 상태는 제외" 같은 말을 표현하기 어렵다.

사람이 말하는 조건은 다양하지만, ABAP은 이것을 일정한 표 구조로 정리한다. 그 표가 Range Table이다.

```text
사람 말: C001부터 C003까지 포함하고, C002는 제외한다.

Range Table:
I / BT / C001 / C003
E / EQ / C002 /
```

입문자는 Range Table을 "어려운 내부 테이블"로 외우면 금방 막힌다. "조건 문장을 네 칸짜리 행으로 적는 표"라고 이해해야 한다.

### 무엇인가

Range Table은 조건을 담는 특수한 Internal Table이다. 한 행이 하나의 조건이고, 각 행은 네 칸으로 구성된다.

| 컬럼 | 의미 | 대표 값 |
|---|---|---|
| `SIGN` | 포함할지 제외할지 | `I`, `E` |
| `OPTION` | 어떤 방식으로 비교할지 | `EQ`, `BT`, `CP` |
| `LOW` | 비교값 또는 범위 시작값 | `C001`, `20`, `A*` |
| `HIGH` | 범위 끝값 | `C003`, `30` |

공식 문서의 ranges table 설명도 이 네 컬럼을 기준으로 한다. `SIGN`은 include/exclude를 정하고, `OPTION`은 비교 연산을 정하며, `LOW`와 `HIGH`는 실제 비교값을 가진다.

다음 예시는 모두 같은 구조로 읽는다.

| SIGN | OPTION | LOW | HIGH | 사람 말 |
|---|---|---|---|---|
| `I` | `EQ` | `C001` |  | C001과 같은 값 포함 |
| `I` | `BT` | `C001` | `C003` | C001부터 C003까지 포함 |
| `E` | `EQ` | `C002` |  | C002와 같은 값 제외 |
| `I` | `CP` | `C*` |  | C로 시작하는 값 포함 |

`SIGN`과 `OPTION`을 섞지 않는 것이 첫 번째 핵심이다.

```text
SIGN   = 방향      I 포함, E 제외
OPTION = 비교 방식 EQ 같음, BT 범위, CP 패턴
LOW    = 값 또는 시작
HIGH   = 끝
```

### 어떻게 확인하는가

학습자는 먼저 사람 말을 Range Table 행으로 바꾸는 연습을 한다.

| 사람 말 | SIGN | OPTION | LOW | HIGH |
|---|---|---|---|---|
| 공연 C001만 | I | EQ | C001 |  |
| 공연 C001부터 C003까지 | I | BT | C001 | C003 |
| 상태 C는 제외 | E | EQ | C |  |
| 고객명이 정으로 시작 | I | CP | 정* |  |

그다음 반대로 읽는다.

| SIGN | OPTION | LOW | HIGH | 해석 |
|---|---|---|---|---|
| I | EQ | N |  | N과 같은 값을 포함한다 |
| I | BT | 20 | 30 | 20부터 30까지 포함한다 |
| E | EQ | C |  | C와 같은 값은 제외한다 |
| I | CP | A* |  | A로 시작하는 값을 포함한다 |

`HIGH`가 비어 있는 행은 오류가 아니다. `EQ`, `CP`, `GT`, `GE`, `LT`, `LE`처럼 값 하나만 필요한 옵션은 주로 `LOW`만 쓴다. `BT`처럼 범위를 표현할 때 `HIGH`가 필요하다.

### 체험 설계

L01에는 "조건 카드 -> Range Table 행" 빌더를 둔다.

| 요소 | 설계 |
|---|---|
| 카드 | `공연 C001만`, `공연 C001~C003`, `취소 C 제외`, `C로 시작` |
| 버튼 | `행으로 변환`, `행 해석`, `SIGN/OPTION 바꿔보기`, `초기화` |
| 상태 | 현재 Range Table 행, 한국어 해석, 오류 위치 |
| 데이터 | 공연 ID `C001`~`C004`, 상태 `N`/`C`, 고객명 샘플 |
| 피드백 | 네 칸 중 어느 칸이 조건의 어느 부분을 표현하는지 강조 |

오답 피드백은 칸 단위로 준다.

| 오답 | 피드백 |
|---|---|
| `SIGN = BT` | `SIGN`은 포함/제외만 담당합니다. `BT`는 `OPTION`에 들어갑니다. |
| `OPTION = I` | `OPTION`은 비교 방식입니다. 포함 여부는 `SIGN`에 적습니다. |
| `BT`인데 `HIGH` 없음 | 범위 조건에는 끝값이 필요합니다. |
| `EQ`인데 `HIGH` 사용 | 단일 값 비교는 보통 `LOW`만 사용합니다. |

### 실수와 주의

`SIGN`과 `OPTION`을 바꿔 적으면 조건의 의미가 완전히 깨진다. `I/E`는 `SIGN`, `EQ/BT/CP`는 `OPTION`이다.

`HIGH`를 항상 채우려는 습관도 좋지 않다. 값 하나를 비교하는 조건은 `LOW` 중심으로 읽는다.

여러 행이 있을 때 모든 행을 동시에 만족해야 한다고 생각하면 안 된다. 포함 행들은 보통 후보를 넓히고, 제외 행은 그 후보에서 빼는 역할을 한다. 이 판정 규칙은 L04에서 더 자세히 확인한다.

### 정리

Range Table은 조건을 담는 네 칸짜리 행들의 모음이다. `SIGN`은 포함/제외, `OPTION`은 비교 방식, `LOW`와 `HIGH`는 비교값이다. CH12의 나머지 레슨은 모두 이 네 칸을 화면 입력, SQL 조건, 코드 직접 조작과 연결한다.

## CH12-L02 - SELECT-OPTIONS 기본 문법

### 왜 필요한가

Range Table 구조를 알아도 사용자가 `SIGN`, `OPTION`, `LOW`, `HIGH`를 직접 입력하게 만들 수는 없다. 사용자는 SAP GUI 선택화면에서 From/To 입력칸에 값을 넣고, 필요하면 다중 선택 버튼을 누르는 방식으로 조건을 준다.

`SELECT-OPTIONS`는 이 간격을 메운다. 화면에는 범위 입력칸을 만들고, 프로그램 안에는 같은 이름의 selection table을 만든다. 사용자의 화면 입력이 자동으로 Range Table 행이 되는 것이다.

### 무엇인가

기본 문법은 다음과 같다.

```abap
TABLES zbooking.

SELECT-OPTIONS: s_conc FOR zbooking-concert_id,
                s_stat FOR zbooking-status.

DATA ls_conc LIKE LINE OF s_conc.

START-OF-SELECTION.
  LOOP AT s_conc INTO ls_conc.
    WRITE: / ls_conc-sign, ls_conc-option,
             ls_conc-low,  ls_conc-high.
  ENDLOOP.
```

줄별 의미는 다음과 같다.

| 코드 | 의미 |
|---|---|
| `TABLES zbooking.` | Dictionary 테이블 `ZBOOKING`의 필드를 `zbooking-field` 형태로 참조할 수 있게 한다 |
| `SELECT-OPTIONS s_conc FOR zbooking-concert_id.` | 선택화면에 공연 ID 조건을 만들고, 프로그램 안에 `s_conc` selection table을 만든다 |
| `SELECT-OPTIONS s_stat FOR zbooking-status.` | 상태 조건용 selection table을 만든다 |
| `DATA ls_conc LIKE LINE OF s_conc.` | `s_conc` 한 행을 읽을 work area를 만든다 |
| `LOOP AT s_conc INTO ls_conc.` | 사용자가 입력한 조건 행을 순회한다 |

`SELECT-OPTIONS` 이름은 최대 8자 제한이 있다. 그래서 `s_concert_id`처럼 길게 쓰기보다 `s_conc`, `s_stat`, `s_date` 같은 짧은 이름을 사용한다. `s_`는 selection option이라는 뜻으로 흔히 쓰는 접두어다.

`TABLES`는 CH12에서 필요한 만큼만 다룬다. 공식 문서상 table work area는 class 안에서 허용되지 않고, 일반적인 새 설계의 중심으로 삼을 대상도 아니다. 하지만 classic report와 selection screen 문맥에서는 여전히 많이 보이므로, 여기서는 `FOR zbooking-concert_id`의 필드 참조를 가능하게 하는 장치로 읽는다.

### 어떻게 확인하는가

프로그램을 실행하면 선택화면이 먼저 나타난다. `s_conc`에는 From/To 입력칸과 다중 선택 버튼이 표시된다.

확인 순서는 다음과 같다.

1. From 칸에 `C001`만 입력한다.
2. 실행하면 `s_conc`에는 `I / EQ / C001 / 빈칸`에 해당하는 행이 들어간다.
3. From에 `C001`, To에 `C003`을 입력한다.
4. 실행하면 `s_conc`에는 `I / BT / C001 / C003` 범위 행이 들어간다.
5. 다중 선택 버튼을 누른다.
6. 여러 값, 여러 범위, 제외 조건을 입력할 수 있는 팝업을 확인한다.

중요한 질문은 이것이다.

```text
SELECT-OPTIONS는 화면만 만드는가?
아니다. 같은 이름의 selection table도 만든다.

FOR 뒤의 필드는 조회 조건인가?
아니다. LOW/HIGH의 타입과 화면 도움 속성 기준을 정한다.

s_conc는 값 하나인가?
아니다. 여러 조건 행을 담는 table이다.
```

### 체험 설계

L02에는 "SELECT-OPTIONS 화면 변환기"를 둔다.

| 요소 | 설계 |
|---|---|
| 입력 | From, To, 다중 선택 버튼, 실행 버튼 |
| 버튼 | `단일 값 입력`, `범위 입력`, `다중 선택 열기`, `조건 행 보기`, `이름 길이 오류` |
| 상태 | selection screen 입력값, `s_conc` 행 목록, 현재 행 해석 |
| 데이터 | `zbooking-concert_id`, `zbooking-status` |
| 피드백 | 화면 입력이 `SIGN/OPTION/LOW/HIGH` 행으로 바뀌는 과정을 표시 |

`이름 길이 오류` 버튼은 `SELECT-OPTIONS s_concert FOR ...`처럼 8자를 넘는 이름을 보여 주고, "selection criterion 이름은 8자 이내로 잡아야 합니다"라고 안내한다.

### 실수와 주의

`TABLES`를 빼고 `FOR zbooking-concert_id`만 쓰면 필드 참조가 되지 않아 문법 오류를 만나기 쉽다. classic report 예제에서는 `TABLES zbooking.`을 먼저 확인한다.

`SELECT-OPTIONS`를 단일 변수처럼 생각하면 이후 `LOOP AT s_conc`나 `WHERE concert_id IN s_conc`가 이해되지 않는다. `s_conc`는 조건 행이 여러 개 들어갈 수 있는 selection table이다.

`START-OF-SELECTION`은 여기서 선택화면 입력 후 실행되는 본문 위치를 보여 주기 위한 선행 사용이다. event block과 selection screen event는 CH15에서 정식으로 다룬다.

### 정리

`SELECT-OPTIONS`는 선택화면 입력 요소와 selection table을 동시에 만든다. 사용자가 From/To와 다중 선택 팝업에 입력한 값은 프로그램 안에서 `SIGN`, `OPTION`, `LOW`, `HIGH` 행으로 확인할 수 있다.

## CH12-L03 - WHERE ... IN classic range

### 왜 필요한가

조건을 화면에서 받았으면 조회에 적용해야 한다. 사용자가 `s_conc`에 공연 ID 조건을 넣었는데, `SELECT`가 여전히 전체 예매를 가져오면 의미가 없다.

Range Table은 `WHERE ... IN`과 만날 때 실전 도구가 된다.

```text
s_conc에 C001 조건이 있다.
SELECT가 WHERE concert_id IN s_conc로 실행된다.
결과는 C001 예매만 남는다.
```

### 무엇인가

classic Open SQL에서 selection table을 조건으로 쓰는 기본 형태는 다음과 같다.

```abap
DATA lt_book TYPE TABLE OF zbooking.

SELECT * FROM zbooking
  INTO TABLE lt_book
  WHERE concert_id IN s_conc.
```

여러 조건도 결합할 수 있다.

```abap
SELECT * FROM zbooking
  INTO TABLE lt_book
  WHERE concert_id IN s_conc
    AND status     IN s_stat.
```

CH12에서는 classic 형태를 사용한다. modern Open SQL 표기는 CH19 이후에 다룬다.

공식 문서의 `IN range_tab` 설명에서 중요한 점은 두 가지다. 첫째, ranges table 또는 selection table을 `IN` 조건에 사용할 수 있다. 둘째, ranges table이 비어 있으면 `IN range_tab` 조건은 참으로 평가된다. 그래서 selection option을 비워 두면 그 필드는 전체 통과가 된다.

### 어떻게 확인하는가

다음 예매 데이터가 있다고 하자.

| BOOKID | CONCERT_ID | STATUS | SEATS |
|---|---|---|---|
| 5001 | C001 | N | 2 |
| 5002 | C001 | C | 1 |
| 5003 | C002 | N | 3 |
| 5004 | C003 | N | 4 |

`s_conc = I / EQ / C001`이면 결과는 5001, 5002다.

`s_conc = I / BT / C001 / C002`이면 결과는 5001, 5002, 5003이다.

`s_conc`가 비어 있으면 `concert_id IN s_conc`는 전체 통과로 보아 5001부터 5004까지 모두 후보가 된다.

`s_conc = C001`, `s_stat = N`이면 두 조건을 모두 만족하는 5001만 남는다.

### 체험 설계

L03에는 "WHERE IN 필터 엔진"을 둔다.

| 요소 | 설계 |
|---|---|
| 입력 | `s_conc` Range Table, `s_stat` Range Table |
| 버튼 | `C001만`, `C001~C002`, `예약만`, `빈 range`, `조회 실행` |
| 상태 | SQL 조건 문자열, 통과 행 수, 탈락 이유 |
| 데이터 | 예매 목록 6건 |
| 피드백 | 각 행 옆에 `공연 조건 통과`, `상태 조건 탈락`, `빈 range라 통과` 표시 |

학습자가 `빈 range`를 누르면 "조건을 비우면 아무 것도 조회하지 않는다"가 아니라 "그 필드는 전체 통과"라는 점을 강조한다.

### 실수와 주의

가장 큰 실수는 빈 `SELECT-OPTIONS`를 "조건 없음이라서 결과 없음"으로 오해하는 것이다. 실제로는 전체 통과가 된다. 전체 조회를 막아야 하는 프로그램이라면 입력 필수 검증이 필요하지만, 그 검증 문법은 CH15에서 다룬다.

두 번째 실수는 classic 구간에 modern Open SQL 표기를 섞는 것이다. CH12 예제는 `WHERE concert_id IN s_conc` 형태로 읽는다.

세 번째 실수는 `IN`을 단일 값 비교로만 생각하는 것이다. 오른쪽이 Range Table이면 여러 포함/제외 행 전체가 조건으로 평가된다.

### 정리

Range Table은 `WHERE ... IN`에서 조회 조건이 된다. `SELECT-OPTIONS`가 만든 selection table도 같은 방식으로 사용할 수 있다. 비어 있는 range는 전체 통과가 되므로, 전체 조회를 막아야 하는 경우에는 별도 검증이 필요하다.

## CH12-L04 - Multiple Selection과 Include/Exclude

### 왜 필요한가

From/To 두 칸만으로는 조건을 모두 표현할 수 없다. 사용자는 여러 값을 하나씩 넣고 싶을 수도 있고, 여러 범위를 넣고 싶을 수도 있고, 특정 값만 빼고 싶을 수도 있다.

SAP GUI 선택화면의 다중 선택 버튼은 이 문제를 해결한다. 버튼을 누르면 여러 조건 행을 만들 수 있는 팝업이 열리고, 그 결과가 Range Table에 쌓인다.

### 무엇인가

다중 선택 팝업은 크게 포함과 제외를 다룬다.

| 팝업 영역 | Range Table 의미 |
|---|---|
| Single values 포함 | `SIGN = I`, `OPTION = EQ` 행 여러 개 |
| Ranges 포함 | `SIGN = I`, `OPTION = BT` 행 여러 개 |
| Single values 제외 | `SIGN = E`, `OPTION = EQ` 행 여러 개 |
| Ranges 제외 | `SIGN = E`, `OPTION = BT` 행 여러 개 |

판정은 다음처럼 이해하면 된다.

```text
포함 조건이 있으면, 포함 조건 중 하나라도 맞는 값이 후보가 된다.
제외 조건에 걸리면, 후보에서 빠진다.
```

예를 들어 다음 조건을 생각한다.

| SIGN | OPTION | LOW | HIGH |
|---|---|---|---|
| I | BT | C001 | C003 |
| E | EQ | C002 |  |

이 조건은 "C001부터 C003까지 포함하되 C002는 제외"로 읽는다. 결과 후보는 C001, C003이다.

### 어떻게 확인하는가

다음 값을 하나씩 판정해 본다.

| 값 | 포함 `I BT C001 C003` | 제외 `E EQ C002` | 최종 |
|---|---|---|---|
| C001 | 통과 | 해당 없음 | 통과 |
| C002 | 통과 | 제외 걸림 | 탈락 |
| C003 | 통과 | 해당 없음 | 통과 |
| C004 | 포함 조건 불통과 | 해당 없음 | 탈락 |

포함 조건과 제외 조건을 따로 보고 마지막에 합쳐야 한다. 한 줄씩 독립적으로만 보면 "C002도 포함 범위 안인데 왜 빠지지"라는 혼란이 생긴다. 제외 행은 마지막에 후보를 깎아내는 역할을 한다.

### 체험 설계

L04에는 "Include/Exclude 판정기"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `포함 범위 추가`, `제외 값 추가`, `값별 판정`, `제외만 입력`, `초기화` |
| 상태 | 포함 후보 목록, 제외 적용 후 목록, 최종 결과 |
| 데이터 | 공연 ID `C001`~`C004`, 상태 `N`/`C` |
| 피드백 | 각 행에 "포함 후보가 됨", "제외 조건에 걸림", "최종 탈락" 배지 표시 |

`제외만 입력` 버튼을 누르면 주의 메시지를 표시한다. 제외 조건만 입력한 경우에는 데이터와 문맥에 따라 학습자가 기대한 결과와 달라질 수 있으므로, "무엇을 포함할지 먼저 정하고 무엇을 뺄지 정하라"는 습관을 만든다.

### 실수와 주의

녹색/빨강 아이콘을 색으로만 외우면 시스템 테마가 달라졌을 때 헷갈릴 수 있다. 반드시 `SIGN = I`는 포함, `SIGN = E`는 제외로 이해한다.

제외 조건을 "조회하지 말라"는 뜻으로만 대충 이해하면 안 된다. Range Table 전체 판정 안에서 후보에서 빼는 조건이다.

포함 조건이 여러 개일 때 모두 만족해야 한다고 생각하면 결과가 너무 적어진다. 포함 조건 여러 행은 보통 OR 후보로 이해하고, 제외 조건은 그 후보에서 제거하는 것으로 이해한다.

### 정리

다중 선택 팝업은 Range Table 행을 여러 개 만드는 화면이다. 포함은 `SIGN = I`, 제외는 `SIGN = E`로 들어간다. 포함 조건이 후보를 만들고, 제외 조건이 후보를 제거한다.

## CH12-L05 - EQ / BT / CP 옵션 이해

### 왜 필요한가

`SIGN`이 포함/제외를 정한다면, `OPTION`은 비교 방식을 정한다. 같은 `LOW = C001`이라도 `EQ`인지 `CP`인지에 따라 의미가 달라진다.

조건이 의도와 다르게 동작할 때는 대부분 `OPTION`을 잘못 고른 경우가 많다. 정확히 같은 값인지, 범위인지, 패턴인지 구분해야 한다.

### 무엇인가

자주 쓰는 `OPTION`은 다음과 같다.

| OPTION | 의미 | LOW/HIGH 사용 |
|---|---|---|
| `EQ` | 같음 | `LOW` |
| `NE` | 다름 | `LOW` |
| `BT` | 사이 범위 | `LOW`, `HIGH` |
| `NB` | 범위 밖 | `LOW`, `HIGH` |
| `GT` | 초과 | `LOW` |
| `GE` | 이상 | `LOW` |
| `LT` | 미만 | `LOW` |
| `LE` | 이하 | `LOW` |
| `CP` | 패턴 일치 | `LOW` |
| `NP` | 패턴 불일치 | `LOW` |

`CP`에서는 ABAP 패턴 wildcard를 사용한다.

| 패턴 | 의미 |
|---|---|
| `C*` | C로 시작 |
| `*son` | son으로 끝 |
| `A+01` | A 다음 임의의 한 문자, 그 뒤 01 |

`*`는 여러 문자, `+`는 한 문자를 뜻한다. SQL의 `LIKE`에서 자주 보는 `%`, `_`와 그대로 같다고 외우면 안 된다. ABAP의 `CP` 패턴은 `*`, `+`를 기준으로 설명한다.

### 어떻게 확인하는가

아래 데이터로 비교한다.

| 값 |
|---|
| C001 |
| C002 |
| D001 |
| CA01 |

`I EQ C001`이면 C001만 통과한다.

`I BT C001 C999`이면 C로 시작하는 여러 코드가 범위 안에 들어올 수 있다. 단, 문자열 범위 비교는 문자 정렬 순서의 영향을 받으므로 업무 코드 체계를 알고 써야 한다.

`I CP C*`이면 C001, C002, CA01처럼 C로 시작하는 값이 통과한다.

`E EQ C002`이면 C002는 후보에서 빠진다.

### 체험 설계

L05에는 "OPTION 비교 실험실"을 둔다.

| 요소 | 설계 |
|---|---|
| 컨트롤 | OPTION 선택 탭 `EQ`, `BT`, `CP`, `NE`, `GT`, `LT` |
| 입력 | LOW, HIGH |
| 버튼 | `판정 실행`, `CP wildcard 보기`, `SIGN 반전`, `초기화` |
| 상태 | 현재 조건, 값별 통과/탈락, 패턴 해석 |
| 데이터 | 공연 ID와 고객명 샘플 |

`CP wildcard 보기` 버튼은 `C*`, `*영`, `A+01`을 시각적으로 펼친다. `A+01`에서는 `+`가 한 자리만 대신한다는 점을 강조한다.

### 실수와 주의

정확히 같은 값을 찾는데 `CP`를 쓰면 예기치 않은 값이 같이 걸릴 수 있다. 정확 비교는 `EQ`를 먼저 생각한다.

범위 조건 `BT`에서 `HIGH`를 비워 두면 조건이 불완전하다. 범위에는 시작과 끝이 모두 필요하다.

문자 코드에 `BT`를 사용할 때는 숫자 범위처럼 단순하게 생각하면 안 된다. 문자 정렬 순서와 코드 체계에 따라 결과가 달라질 수 있다.

`CP`의 wildcard는 `*`와 `+`다. SQL `LIKE`의 wildcard와 혼동하지 않는다.

### 정리

`OPTION`은 비교 방식을 정한다. `EQ`는 정확히 같음, `BT`는 범위, `CP`는 패턴이다. `SIGN`과 `OPTION`을 조합하면 "포함할 정확값", "제외할 범위", "포함할 패턴" 같은 조건을 표현할 수 있다.

## CH12-L06 - Selection Table 직접 조작 기초

### 왜 필요한가

`SELECT-OPTIONS`는 화면 입력을 자동으로 Range Table에 넣어 준다. 하지만 모든 조건이 화면에서 오지는 않는다.

예를 들어 배치 프로그램에서 기본 상태 `N`만 조회해야 할 수 있고, 다른 프로그램이 넘겨 준 조건으로 range를 만들어야 할 수도 있다. 이때는 Range Table을 코드로 직접 채운다.

### 무엇인가

현재 기준으로는 `TYPE RANGE OF`를 사용해 header line 없는 Range Table을 만들고, work area를 채운 뒤 `APPEND`한다.

```abap
DATA: lr_stat TYPE RANGE OF zbooking-status,
      ls_stat LIKE LINE OF lr_stat,
      lt_book TYPE TABLE OF zbooking.

CLEAR ls_stat.
ls_stat-sign   = 'I'.
ls_stat-option = 'EQ'.
ls_stat-low    = 'N'.
APPEND ls_stat TO lr_stat.

SELECT * FROM zbooking
  INTO TABLE lt_book
  WHERE status IN lr_stat.
```

코드는 다음 순서로 읽는다.

| 단계 | 코드 | 의미 |
|---|---|---|
| Range Table 선언 | `lr_stat TYPE RANGE OF zbooking-status` | 상태 필드 타입에 맞는 Range Table |
| 한 행 준비 | `ls_stat LIKE LINE OF lr_stat` | 조건 한 행을 담을 work area |
| 조건 채우기 | `sign`, `option`, `low` 대입 | `I EQ N` 조건 작성 |
| 행 추가 | `APPEND ls_stat TO lr_stat` | Range Table에 조건 행 추가 |
| 조회 적용 | `WHERE status IN lr_stat` | 코드로 만든 조건으로 조회 |

옛 코드에서는 다음 형태도 만난다.

```abap
RANGES r_stat FOR zbooking-status.
```

`RANGES`는 ranges table과 header line을 함께 만드는 오래된 선언 방식이다. 공식 문서에서도 `TYPE RANGE OF` 또는 `LIKE RANGE OF`로 대체되는 방식으로 설명한다. CH12에서는 기존 코드 해석용으로만 인지하고, 직접 작성 예제는 header line 없는 `TYPE RANGE OF`를 사용한다.

### 어떻게 확인하는가

디버거에서 다음 순서로 본다.

1. `lr_stat`은 처음에 비어 있다.
2. `ls_stat-sign = 'I'.` 이후 한 행의 방향이 포함으로 정해진다.
3. `ls_stat-option = 'EQ'.` 이후 정확 비교가 된다.
4. `ls_stat-low = 'N'.` 이후 비교값이 N이 된다.
5. `APPEND ls_stat TO lr_stat.` 이후 `lr_stat`에 한 행이 생긴다.
6. `SELECT`가 실행되면 상태가 N인 예매만 `lt_book`에 들어온다.

두 번째 조건을 추가하고 싶으면 `CLEAR ls_stat` 후 다시 값을 채우고 `APPEND`한다.

```abap
CLEAR ls_stat.
ls_stat-sign   = 'E'.
ls_stat-option = 'EQ'.
ls_stat-low    = 'C'.
APPEND ls_stat TO lr_stat.
```

이렇게 하면 취소 상태 C를 제외하는 행이 추가된다.

### 체험 설계

L06에는 "코드로 range 행 추가" 스텝퍼를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `CLEAR`, `SIGN 넣기`, `OPTION 넣기`, `LOW 넣기`, `APPEND`, `SELECT 실행`, `두 번째 행 추가` |
| 상태 | `ls_stat` 현재 값, `lr_stat` 행 목록, 조회 결과 행 수 |
| 데이터 | 상태 `N`/`C`가 섞인 예매 목록 |
| 피드백 | work area에만 값이 있을 때와 `APPEND` 후 table에 들어간 뒤를 구분 |

중요한 시각 피드백은 `APPEND` 전후 차이다. `ls_stat`에 값을 채우기만 하면 아직 Range Table 조건이 아니다. `APPEND`해야 `lr_stat`에 행이 생기고 조회 조건으로 사용된다.

### 실수와 주의

`APPEND` 전에 `CLEAR`를 하지 않으면 이전 행의 `HIGH`나 다른 값이 남아 다음 조건을 오염시킬 수 있다.

`SIGN`이나 `OPTION`을 비워 둔 채 `APPEND`하면 조건 행이 잘못된다. 한 행을 만들 때는 `SIGN`, `OPTION`, `LOW`, 필요한 경우 `HIGH`를 모두 확인한다.

`RANGES`의 header line 방식에 익숙해지면 table과 work area가 섞여 보인다. 초급자는 `lr_stat` table과 `ls_stat` 한 행을 분리해서 쓰는 쪽이 더 안전하다.

### 정리

Range Table은 화면 없이도 코드로 만들 수 있다. `TYPE RANGE OF`로 table을 선언하고, 한 행 work area를 채운 뒤 `APPEND`한다. `RANGES`는 기존 코드에서 만날 수 있는 레거시 선언으로 인지하되, 새 예제의 중심은 `TYPE RANGE OF`다.

## CH12-L07 - 실습: 공연·상태로 예매 필터

### 왜 필요한가

CH11-L06에서는 전체 예매 목록을 SALV로 띄웠다. 하지만 실제 업무 화면에서 전체 목록만 보는 경우는 드물다. 담당자는 특정 공연만 보거나, 예약 상태만 보거나, 취소를 제외하고 싶어 한다.

CH12-L07은 CH11의 SALV 예매 목록에 CH12의 선택 조건을 붙인다. 이 실습의 목표는 "사용자가 조건을 바꾸면 Range Table이 바뀌고, 조회 결과가 줄어들며, SALV 표에 그 결과가 보인다"를 한 번에 경험하는 것이다.

### 무엇인가

예매 필터 리포트의 기본 형태는 다음과 같다.

```abap
REPORT zbooking_select_options.

TABLES zbooking.

SELECT-OPTIONS: s_conc FOR zbooking-concert_id,
                s_stat FOR zbooking-status.

DATA: lt_book  TYPE TABLE OF zbooking,
      lo_alv   TYPE REF TO cl_salv_table,
      lv_count TYPE i.

START-OF-SELECTION.
  SELECT * FROM zbooking
    INTO TABLE lt_book
    WHERE concert_id IN s_conc
      AND status     IN s_stat.

  DESCRIBE TABLE lt_book LINES lv_count.

  IF lv_count = 0.
    MESSAGE '조건에 맞는 예매가 없습니다' TYPE 'I'.
  ELSE.
    TRY.
        cl_salv_table=>factory(
          IMPORTING
            r_salv_table = lo_alv
          CHANGING
            t_table      = lt_book ).

        lo_alv->get_functions( )->set_all( abap_true ).
        lo_alv->display( ).
      CATCH cx_salv_msg.
        MESSAGE '예매 목록 ALV 생성 실패' TYPE 'I'.
    ENDTRY.
  ENDIF.
```

여기서 새로 봐야 할 부분은 조회 조건이다.

```abap
WHERE concert_id IN s_conc
  AND status     IN s_stat.
```

`s_conc`가 비어 있으면 공연 조건은 전체 통과다. `s_stat`가 비어 있으면 상태 조건도 전체 통과다. 둘 다 비어 있으면 전체 예매가 조회된다.

### 어떻게 확인하는가

실습은 다음 순서로 진행한다.

1. 두 조건을 모두 비워 실행한다.
   - 전체 예매가 SALV에 표시된다.
2. `s_conc`에 `C001`만 입력한다.
   - C001 공연의 예매만 남는다.
3. `s_stat`에 `N`만 입력한다.
   - 예약 상태만 남는다.
4. 다중 선택에서 상태 `C`를 제외한다.
   - 취소 상태가 빠지는지 확인한다.
5. `s_conc`에 `C001`~`C002` 범위를 넣는다.
   - 두 공연 범위의 예매가 남는다.
6. 결과가 없는 조건을 넣는다.
   - SALV가 뜨기 전에 안내 메시지가 나오는지 확인한다.

기존 `CH12-L07-S01` 임베드는 이 흐름에 맞게 사용한다. preset 버튼으로 전체, 공연 C001, 공연 C001~C002, 예약만, 취소 제외를 바꿔 보고 결과 행 수가 어떻게 변하는지 확인한다.

### 체험 설계

L07에는 "예매 필터 SALV 시뮬레이터"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `전체`, `공연 C001`, `C001~C002`, `예약만`, `취소 제외`, `실행` |
| 상태 | `s_conc` Range Table, `s_stat` Range Table, SQL 조건, 결과 행 수 |
| 데이터 | `ZBOOKING` 예매 샘플 6건 |
| 화면 | 조건 적용 후 SALV처럼 보이는 결과 표 |
| 피드백 | 각 결과 행에 "공연 조건 통과", "상태 조건 통과", "제외 조건 탈락" 이유 표시 |

시뮬레이터는 조건을 바꿀 때마다 SQL 코드를 함께 보여 준다.

```text
SELECT * FROM zbooking INTO TABLE lt_book
  WHERE concert_id IN s_conc
    AND status     IN s_stat.
```

학습자는 화면 입력, Range Table, SQL 조건, 결과표가 따로 노는 것이 아니라 한 흐름이라는 점을 확인한다.

### 실수와 주의

조건을 비웠는데 전체가 조회되는 것은 정상 동작이다. 전체 조회가 위험한 업무라면 CH15의 선택화면 검증에서 입력 필수 정책을 추가해야 한다.

상태값의 실제 코드가 무엇인지 확인해야 한다. 예제에서는 `N`을 예약, `C`를 취소로 설명하지만, 실제 프로젝트에서는 Domain fixed value 또는 업무 정의를 확인한다.

SALV에서 필터를 거는 것과 SQL에서 조건을 거는 것을 구분한다. CH12의 목표는 DB 조회 단계에서 필요한 데이터만 가져오는 것이다. SALV 화면 필터는 이미 가져온 데이터를 화면에서 줄여 보는 기능이다.

`TYPE REF TO`, `TRY ... CATCH`, `CL_SALV_TABLE`은 CH11에서 사용한 SALV 흐름의 재사용이다. CH12의 새 개념은 Range Table과 `SELECT-OPTIONS`다.

### 정리

CH12-L07은 선택화면 조건을 이용해 예매 목록을 줄이고, 줄어든 결과를 SALV로 확인하는 실습이다. `s_conc`와 `s_stat`는 단일 값이 아니라 Range Table이며, `WHERE ... IN`에서 실제 조회 조건이 된다.

## CH12 마무리

CH12의 핵심은 "조건도 데이터처럼 표로 다룬다"는 생각이다. 사용자가 선택화면에 입력한 값은 `SIGN`, `OPTION`, `LOW`, `HIGH` 네 칸짜리 행으로 정리되고, 그 행들이 `WHERE ... IN`에서 조회 결과를 결정한다.

학습자가 이 장을 마치면 다음을 말할 수 있어야 한다.

```text
Range Table 한 행은 SIGN, OPTION, LOW, HIGH로 구성된다.
SELECT-OPTIONS는 선택화면과 selection table을 동시에 만든다.
WHERE field IN s_xxx는 Range Table 조건을 SQL 조회에 적용한다.
빈 range는 전체 통과가 된다.
Include는 후보를 만들고 Exclude는 후보에서 제거한다.
EQ, BT, CP는 비교 방식이 다르다.
TYPE RANGE OF로 화면 없이 조건을 만들 수 있다.
RANGES는 기존 코드에서 만날 수 있는 레거시 선언이다.
```

다음 CH13에서는 조건으로 줄인 데이터를 여러 테이블과 결합하고, 공연별 예매 수나 좌석 합계처럼 집계하는 단계로 이동한다.
