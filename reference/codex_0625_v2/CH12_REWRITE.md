# CH12_REWRITE - SELECT-OPTIONS와 Range Table v2

> 목적: `content/abap/CH12`의 7개 레슨을 기준으로, v1의 템플릿 반복을 제거하고 "단일 입력값으로는 부족한 조회 조건을 Range Table과 SELECT-OPTIONS로 표현하는 방법"을 완성 강의자료 수준으로 재집필한다. 이 문서는 아직 `content/abap` 원본 반영본이 아니라, 반영 전 검수 가능한 v2 재작성 산출물이다.

## CH12 전체 설계

CH12의 한 문장 목표는 "사용자가 원하는 여러 값, 범위, 제외 조건을 Range Table로 표현하고 classic Open SQL의 `WHERE ... IN`에 연결한다"이다.

CH11에서 학습자는 예매 목록 전체를 SALV 표로 볼 수 있게 되었다. 하지만 실제 사용자는 전체 목록만 보지 않는다. "공연 C001만", "예약 상태만", "C001부터 C003까지", "취소 상태는 제외"처럼 조건을 바꿔 가며 조회한다. `PARAMETERS`처럼 값 하나만 받는 입력으로는 이 요구를 처리하기 어렵다.

CH12는 이 불편을 해결하기 위해 [[Range Table]](범위 조건을 담는 특수한 Internal Table)과 [[SELECT-OPTIONS]](선택화면 입력칸과 Range Table을 동시에 만드는 문장)를 정식 도입한다. 학습자는 화면 입력이 어떻게 `SIGN`, `OPTION`, `LOW`, `HIGH` 네 칸짜리 조건 행으로 바뀌고, 그 행들이 `WHERE ... IN`에서 어떤 결과를 만드는지 직접 확인해야 한다.

### 범위와 금지선

CH12는 classic-first 구간이다. 코드 예제에는 inline declaration, constructor expression, object creation expression, string template, modern Open SQL host marker를 넣지 않는다. CH12의 `WHERE concert_id IN s_conc`는 classic range 조건이다.

`START-OF-SELECTION`은 선택화면 입력 후 실제 조회가 시작되는 위치를 보여 주기 위한 선행 사용이다. Report event와 selection screen event의 정식 설명은 CH15에서 한다. `TABLES`는 `SELECT-OPTIONS ... FOR zbooking-field`를 입문자가 읽기 쉽게 연결하기 위한 현 커리큘럼의 선행 사용이다. 공식 문서상 table work area 사용은 주의가 필요하므로, CH12에서는 "선택 조건 필드 참조와 기존 레포트 읽기" 목적으로만 다룬다.

L07의 `TYPE REF TO`, `TRY ... CATCH`, SALV 호출은 CH11에서 이미 사용한 SALV 표시 흐름을 실습에 재사용하는 선행 사용이다. 본격 OO, 참조 변수 원리, exception class 체계는 CH20 범위로 남긴다. CH15의 `OBLIGATORY`, `NO-EXTENSION`, `NO INTERVALS`, `MODIF ID`, Selection Screen Variant는 이름만 예고할 수 있으며, CH12 코드로 끌어오지 않는다.

### 현재 소스 범위

`content/abap/CH12` 현재 상태는 7개 레슨이다. v2 산출물은 이 7개 레슨을 모두 다룬다.

| 레슨 | 현재 주제 | v2 재작성 초점 |
| --- | --- | --- |
| CH12-L01 | Range Table 구조 | 한 행이 하나의 조건이고 네 컬럼이 조건 문장을 만든다는 감각 |
| CH12-L02 | SELECT-OPTIONS 기본 문법 | 화면 입력과 Range Table 생성이 동시에 일어나는 구조 |
| CH12-L03 | WHERE ... IN classic range | Range Table이 SELECT 조건으로 평가되는 흐름과 빈 range의 의미 |
| CH12-L04 | Multiple Selection과 Include/Exclude | 다중 선택 팝업의 녹색/빨강 조건이 결과에 미치는 영향 |
| CH12-L05 | EQ / BT / CP 옵션 이해 | `OPTION`별 비교 방식, CP wildcard, SIGN과의 조합 |
| CH12-L06 | Selection Table 직접 조작 기초 | 화면 없이 `TYPE RANGE OF`와 `APPEND`로 조건 행을 만드는 법 |
| CH12-L07 | 공연·상태로 예매 필터 실습 | 콘서트 예매 목록을 공연/상태 조건으로 줄이고 SALV로 확인 |

### 공식 문서 수동 확인 기준

v1은 CH12에 자동 키워드 매칭으로 단일 입력, 일반 분기문, JOIN 계열 문서가 섞였다. v2에서는 로컬 `C:\ABAP_DOCU_HTML`에서 아래 문서만 수동 근거로 채택한다.

- `C:\ABAP_DOCU_HTML\abapselect-options.htm`: `SELECT-OPTIONS`가 selection criterion, selection table, low/high 입력 필드, multiple selection 버튼을 만든다는 근거. selection table의 4컬럼과 I/E, EQ/BT/CP 등 핵심 규칙도 확인.
- `C:\ABAP_DOCU_HTML\abapselect-options_for.htm`: `FOR`가 `LOW`, `HIGH` 컬럼의 데이터 타입과 화면 도움 속성을 결정한다는 근거.
- `C:\ABAP_DOCU_HTML\abapselect-options_value.htm`: `DEFAULT`, `OPTION`, `SIGN`의 start value 규칙과 `EQ`, `BT`, `CP`, `I`, `E` 값 근거. CH12에서는 옵션 목록과 의미만 사용하고 고급 start value 문법은 CH15로 넘긴다.
- `C:\ABAP_DOCU_HTML\abapselect-options_screen.htm`: `OBLIGATORY`, `NO-EXTENSION`, `NO INTERVALS`, `MODIF ID`가 별도 screen options임을 확인. CH12에서는 예고만 하고 코드로 쓰지 않는다.
- `C:\ABAP_DOCU_HTML\abapselection-screen.htm`, `C:\ABAP_DOCU_HTML\abapselection-screen_definition.htm`: selection screen 생성과 `PARAMETERS`/`SELECT-OPTIONS`가 화면 요소를 만든다는 근거.
- `C:\ABAP_DOCU_HTML\abaptypes_ranges.htm`: ranges table의 line type이 `sign`, `option`, `low`, `high`로 구성되고 `TYPE RANGE OF`가 table type을 만든다는 근거.
- `C:\ABAP_DOCU_HTML\abapdata_ranges.htm`: `DATA range_tab TYPE RANGE OF type`로 ranges table을 선언한다는 근거.
- `C:\ABAP_DOCU_HTML\abapranges.htm`: `RANGES range_tab FOR dobj`가 obsolete header-line 방식이며 `TYPE RANGE OF`로 대체된다는 근거.
- `C:\ABAP_DOCU_HTML\abenranges_table_glosry.htm`, `C:\ABAP_DOCU_HTML\abenranges_condition_glosry.htm`: ranges table/condition의 glossary 근거.
- `C:\ABAP_DOCU_HTML\abenwhere_logexp_seltab.htm`: SQL condition `IN range_tab`, 빈 range는 true, CP/NP가 SQL LIKE 패턴으로 변환된다는 근거.
- `C:\ABAP_DOCU_HTML\abenwhere_logexp_like.htm`, `C:\ABAP_DOCU_HTML\abenlogexp_strings.htm`: SQL LIKE와 ABAP CP wildcard 차이, `*`와 `+` 의미 근거.
- `C:\ABAP_DOCU_HTML\abaptables.htm`: `TABLES table_wa`가 Dictionary 구조 기반 table work area를 만든다는 근거와 사용 주의.
- `C:\ABAP_DOCU_HTML\abapappend.htm`: Internal Table에 행을 추가하는 `APPEND` 근거.
- `C:\ABAP_DOCU_HTML\abapselect.htm`: `SELECT`의 `sy-subrc`, `sy-dbcnt`, 빈 결과 의미 근거.
- `C:\ABAP_DOCU_HTML\abapstart-of-selection.htm`: executable program에서 selection screen 처리 후 standard processing block이 시작된다는 근거. CH12에서는 선행 사용으로만 둔다.

### CH12 공통 체험 장치

CH12의 체험은 "입력값을 바꾸면 Range Table 행이 바뀌고, Range Table 행이 바뀌면 조회 결과가 줄어든다"를 보여 줘야 한다.

- L01: "조건 카드 -> Range Table 행" 빌더. `20~30 포함`, `C001 제외`, `A로 시작` 같은 카드를 네 컬럼 행으로 바꾼다.
- L02: "SELECT-OPTIONS 화면 변환기" 설계. From/To 입력과 다중 선택 버튼 조작이 `s_conc` 또는 `s_age`의 행으로 들어가는 모습을 보여 준다.
- L03: "WHERE IN 필터 엔진" 설계. `s_conc`와 `s_stat` 행을 적용하면 예매 데이터가 몇 건으로 줄어드는지 보여 준다.
- L04: "Include/Exclude 판정기" 설계. 포함 조건과 제외 조건을 동시에 넣고 각 행이 통과/탈락하는 이유를 표시한다.
- L05: "OPTION 비교 실험실" 설계. `EQ`, `BT`, `CP`를 토글하고 같은 데이터가 어떻게 다르게 걸리는지 확인한다.
- L06: "코드로 range 행 추가" 스텝퍼. `CLEAR -> sign -> option -> low/high -> APPEND` 순서로 한 행이 완성되는 과정을 보여 준다.
- L07: 기존 `embeds/abap/CH12-L07-S01.html`을 사용한다. preset, range 행 추가, 실행, 결과표를 조작하며 공연/상태 필터를 확인한다.

---

## CH12-L01 - Range Table 구조

### 왜 필요한가

CH11에서 예매 목록 전체를 SALV로 볼 수 있게 되었다. 그런데 사용자는 전체 목록만 보고 싶어 하지 않는다. 정훈영 담당자는 "공연 C001만 보고 싶다"고 말할 수 있고, 운영 담당자는 "예약 상태만 보고 싶다"고 말할 수 있다. 회계 담당자는 "C001부터 C003까지 보고, 취소된 건은 빼고 싶다"고 말할 수 있다.

`PARAMETERS`는 값 하나를 받는 데 좋다. 하지만 "여러 값", "범위", "제외"를 한 번에 담기에는 부족하다. Range Table은 이런 조건들을 행으로 쌓아 두는 전용 그릇이다.

이 레슨의 목표는 Range Table을 "어려운 내부 구조"가 아니라 "조건 문장을 표로 적는 방법"으로 이해하는 것이다.

### 무엇인가

[[Range Table]]은 조건을 담는 특수한 Internal Table이다. 한 행이 하나의 조건이고, 각 행에는 항상 네 칸이 있다.

| 컬럼 | 의미 | 예 |
| --- | --- | --- |
| `SIGN` | 이 조건을 포함할지 제외할지 | `I`는 Include, `E`는 Exclude |
| `OPTION` | 어떻게 비교할지 | `EQ`, `BT`, `CP` |
| `LOW` | 비교할 값 또는 범위의 시작 | `C001`, `20` |
| `HIGH` | 범위의 끝 | `C003`, `30` |

예를 들어 "공연 C001만 포함"은 다음 한 행이 된다.

| SIGN | OPTION | LOW | HIGH | 사람 말 |
| --- | --- | --- | --- | --- |
| I | EQ | C001 |  | C001과 같은 값 포함 |

"공연 C001부터 C003까지 포함"은 다음처럼 쓴다.

| SIGN | OPTION | LOW | HIGH | 사람 말 |
| --- | --- | --- | --- | --- |
| I | BT | C001 | C003 | C001부터 C003까지 포함 |

"취소 상태 C는 제외"는 다음처럼 쓴다.

| SIGN | OPTION | LOW | HIGH | 사람 말 |
| --- | --- | --- | --- | --- |
| E | EQ | C |  | C와 같은 값 제외 |

초보자가 가장 먼저 기억할 문장은 이것이다.

> Range Table은 조건 여러 개를 행으로 쌓는 표이고, 각 행은 `SIGN + OPTION + LOW + HIGH`로 읽는다.

### 어떻게 확인하는가

학습자는 먼저 사람 말을 Range Table 행으로 바꿔 본다.

| 사람 말 | SIGN | OPTION | LOW | HIGH |
| --- | --- | --- | --- | --- |
| 공연 C001 포함 | I | EQ | C001 |  |
| 공연 C001부터 C003까지 포함 | I | BT | C001 | C003 |
| 상태 C 제외 | E | EQ | C |  |
| 고객명이 정으로 시작 | I | CP | 정* |  |

그다음 반대로 읽는다.

| SIGN | OPTION | LOW | HIGH | 해석 |
| --- | --- | --- | --- | --- |
| I | EQ | N |  | 상태 N 포함 |
| I | BT | 20 | 30 | 20부터 30까지 포함 |
| E | EQ | C |  | C는 제외 |
| I | CP | C* |  | C로 시작하는 값 포함 |

여기서 `HIGH`가 비어 있는 행을 보고 놀라지 않게 해야 한다. `EQ`, `CP`, `GT`, `GE`, `LT`, `LE`처럼 값 하나로 판단하는 옵션은 보통 `LOW`만 쓴다. `BT`처럼 시작과 끝이 필요한 옵션에서 `HIGH`가 중요하다.

### 체험 설계

체험 제목은 "조건 카드 -> Range Table 행"이다.

화면 왼쪽에는 사람이 말하는 조건 카드가 있고, 오른쪽에는 네 칸짜리 Range Table이 있다.

| 버튼/카드 | 생성되는 행 | 피드백 |
| --- | --- | --- |
| `공연 C001만` | `I / EQ / C001 / 빈칸` | "단일 값은 EQ이고 HIGH는 비워 둡니다." |
| `공연 C001~C003` | `I / BT / C001 / C003` | "범위는 BT이고 LOW와 HIGH가 모두 필요합니다." |
| `취소 C 제외` | `E / EQ / C / 빈칸` | "제외 조건은 SIGN이 E입니다." |
| `C로 시작` | `I / CP / C* / 빈칸` | "패턴 비교는 CP이고 wildcard를 사용합니다." |
| `행 해석하기` | 현재 행을 한국어 문장으로 변환 | "`I BT C001 C003`은 C001부터 C003까지 포함입니다." |

오답 피드백은 조건의 네 칸을 분리해서 제공한다.

- `SIGN`에 `BT`를 넣으면: "`SIGN`은 포함/제외만 담당합니다. 비교 방식은 `OPTION`에 넣습니다."
- `OPTION`에 `I`를 넣으면: "`OPTION`은 EQ, BT, CP처럼 비교 방식을 적는 칸입니다."
- `BT`인데 `HIGH`가 비어 있으면: "범위에는 끝 값이 필요합니다. `HIGH`를 채워야 합니다."

### 실수와 주의

첫 번째 실수는 `SIGN`과 `OPTION`을 섞는 것이다. `SIGN`은 방향, `OPTION`은 비교 방식이다. `I`, `E`는 방향이고 `EQ`, `BT`, `CP`는 비교 방식이다.

두 번째 실수는 `HIGH`를 항상 채우는 것이다. `EQ`는 정확히 같은 값 하나를 비교하므로 `LOW`만 있으면 된다. `HIGH`는 `BT` 같은 범위 조건에서 의미가 있다.

세 번째 실수는 여러 행이 있을 때 모두 동시에 만족해야 한다고 생각하는 것이다. 포함 행이 여러 개면 보통 "그중 하나라도 맞으면 후보"가 된다. 제외 행은 후보에서 빼는 역할을 한다. 이 규칙은 L04에서 더 자세히 다룬다.

### 정리

- Range Table은 조건을 행으로 쌓는 특수한 Internal Table이다.
- 한 행은 `SIGN`, `OPTION`, `LOW`, `HIGH` 네 칸으로 구성된다.
- `SIGN`은 포함/제외, `OPTION`은 비교 방식, `LOW`와 `HIGH`는 비교값이다.
- `EQ`는 `LOW`만, `BT`는 `LOW`와 `HIGH`를 함께 쓴다.
- 다음 레슨에서는 이 Range Table을 선택화면에서 자동으로 만들어 주는 `SELECT-OPTIONS`를 배운다.

---

## CH12-L02 - SELECT-OPTIONS 기본 문법

### 왜 필요한가

L01에서 Range Table 구조를 알았다. 하지만 사용자가 매번 `SIGN`, `OPTION`, `LOW`, `HIGH`를 직접 입력하게 만들 수는 없다. 사용자는 SAP GUI 선택화면에서 From/To 칸에 값을 넣고, 필요하면 다중 선택 버튼을 누르는 방식에 익숙하다.

[[SELECT-OPTIONS]]는 바로 이 연결을 만들어 준다. 화면에는 범위 입력칸을 만들고, 프로그램 안에는 같은 이름의 Range Table을 만든다. 즉, `SELECT-OPTIONS`는 "화면 요소"이면서 동시에 "조건을 담는 Internal Table"이다.

### 무엇인가

기본 구조는 다음과 같다.

> [선행 사용] `TABLES`는 Dictionary 객체의 필드를 `SELECT-OPTIONS ... FOR`에서 참조하기 위해 사용한다. 공식 문서상 table work area는 주의가 필요한 오래된 스타일이므로, CH12에서는 선택 조건 필드 참조와 기존 레포트 읽기 목적으로만 다룬다. `START-OF-SELECTION`은 CH15에서 정식으로 배운다.

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

줄별로 보면 다음과 같다.

| 코드 | 의미 |
| --- | --- |
| `TABLES zbooking.` | `zbooking-concert_id`처럼 Dictionary 필드를 참조할 수 있게 한다. |
| `SELECT-OPTIONS s_conc FOR zbooking-concert_id.` | 선택화면에 공연ID 범위 입력을 만들고, 프로그램 안에 `s_conc` selection table을 만든다. |
| `SELECT-OPTIONS s_stat FOR zbooking-status.` | 상태값용 selection table을 만든다. |
| `DATA ls_conc LIKE LINE OF s_conc.` | `s_conc`의 한 행을 담을 work area를 만든다. |
| `LOOP AT s_conc INTO ls_conc.` | 사용자가 입력한 조건 행을 한 줄씩 확인한다. |

이름 관례도 중요하다. `s_`는 selection option이라는 뜻으로 자주 쓴다. `s_conc`, `s_stat`, `s_date`처럼 쓰면 코드만 봐도 "사용자 선택 조건"임을 알아보기 쉽다.

### 어떻게 확인하는가

실행하면 선택화면에 `s_conc`와 `s_stat`이 나타난다. 각 항목은 단일 입력칸 하나가 아니라 From/To 구조와 다중 선택 버튼을 가진다.

확인 순서는 다음과 같다.

1. `s_conc`의 From 칸에 `C001`을 입력한다.
   - 프로그램 안에서는 보통 `SIGN = I`, `OPTION = EQ`, `LOW = C001`인 행이 된다.
2. `s_conc`의 From/To에 `C001`과 `C003`을 입력한다.
   - `SIGN = I`, `OPTION = BT`, `LOW = C001`, `HIGH = C003` 행으로 이해한다.
3. 다중 선택 버튼을 누른다.
   - 여러 값, 여러 범위, 제외 조건을 넣는 팝업이 열린다.
4. 실행 후 `LOOP AT s_conc`로 내부 행을 출력한다.
   - 화면 입력이 Range Table 행으로 변환됐음을 확인한다.

초보자용 확인 질문은 다음과 같다.

| 질문 | 기대 답 |
| --- | --- |
| `SELECT-OPTIONS s_conc`는 화면만 만드는가? | 아니다. 같은 이름의 selection table도 만든다. |
| `FOR zbooking-concert_id`는 무엇을 정하는가? | `LOW`, `HIGH`의 타입과 화면 도움 속성 기준을 정한다. |
| 이름은 아무 길이나 가능한가? | selection criterion 이름은 최대 8자 제한이 있다. |

### 체험 설계

L02에는 "SELECT-OPTIONS 화면 변환기"를 설계한다.

화면은 세 영역이다.

```text
[선택화면 입력] -> [s_conc Range Table] -> [해석 문장]
```

버튼과 상태는 다음처럼 둔다.

| 버튼/입력 | Range Table 상태 | 피드백 |
| --- | --- | --- |
| `From = C001` | `I / EQ / C001 / 빈칸` | "값 하나만 입력하면 EQ 조건이 됩니다." |
| `From = C001, To = C003` | `I / BT / C001 / C003` | "To까지 입력하면 범위 조건으로 이해합니다." |
| `다중 선택 열기` | 팝업 모형 표시 | "여러 행을 만들 때는 다중 선택 팝업을 사용합니다." |
| `행 출력` | `LOOP AT s_conc` 결과 표시 | "선택화면 입력은 프로그램 안에서 Internal Table처럼 순회할 수 있습니다." |
| `이름 9자 입력` | 오류 상태 | "SELECT-OPTIONS 이름은 8자 이내로 잡습니다." |

오답 피드백은 다음처럼 둔다.

- "s_conc는 단일 변수다"를 고르면: "`s_conc`는 한 값이 아니라 여러 조건 행을 담는 selection table입니다."
- "FOR는 DB 조회를 실행한다"를 고르면: "`FOR`는 조회 실행이 아니라 입력 타입과 도움 속성 기준을 정합니다."
- "TABLES가 데이터를 조회한다"를 고르면: "`TABLES`는 조회가 아니라 Dictionary 구조 모양의 work area 선언입니다."

### 실수와 주의

첫 번째 실수는 `SELECT-OPTIONS`를 `PARAMETERS`처럼 단일 값으로 생각하는 것이다. `s_conc-low`처럼 첫 행 값만 보는 방식에 익숙해지면 다중 선택 행을 놓치기 쉽다. 조건은 table 전체로 다룬다.

두 번째 실수는 `TABLES`를 DB 조회 문장으로 오해하는 것이다. `TABLES zbooking.`은 DB에서 데이터를 읽지 않는다. `zbooking-concert_id` 같은 필드 참조를 가능하게 하는 table work area 선언이다.

세 번째 실수는 selection screen 심화 옵션을 지금 모두 배우려 하는 것이다. `OBLIGATORY`, `NO-EXTENSION`, `NO INTERVALS`, `MODIF ID` 같은 옵션은 CH15에서 정리한다. CH12에서는 기본 구조와 Range Table 연결에 집중한다.

### 정리

- `SELECT-OPTIONS`는 선택화면 입력 영역과 프로그램 내부 selection table을 동시에 만든다.
- selection table은 Range Table과 같은 `SIGN/OPTION/LOW/HIGH` 구조다.
- `FOR`는 `LOW`, `HIGH`의 타입과 화면 도움 기준을 정한다.
- `TABLES`는 CH12에서 필드 참조를 위해 선행 사용하지만, 신규 설계의 만능 도구로 오해하지 않는다.
- 다음 레슨에서는 이 selection table을 `WHERE ... IN`으로 SELECT 조건에 연결한다.

---

## CH12-L03 - WHERE ... IN (classic range)

### 왜 필요한가

L02까지는 사용자의 조건이 `s_conc`, `s_stat` 같은 Range Table에 담기는 것을 보았다. 하지만 조건을 담기만 해서는 예매 목록이 줄어들지 않는다. DB 조회 문장에 그 조건을 꽂아야 한다.

CH12-L03의 핵심은 `WHERE field IN range_table`이다. 이 한 줄이 사용자가 입력한 단일 값, 여러 값, 범위, 제외 조건을 SELECT의 필터로 바꿔 준다.

### 무엇인가

classic 구간에서는 Range Table을 다음처럼 사용한다.

```abap
DATA lt_book TYPE TABLE OF zbooking.

SELECT * FROM zbooking INTO TABLE lt_book
  WHERE concert_id IN s_conc
    AND status     IN s_stat.
```

읽는 순서는 사람 말과 같다.

| 코드 | 사람 말 |
| --- | --- |
| `concert_id IN s_conc` | 공연ID가 사용자가 입력한 공연 조건에 들어오면 |
| `status IN s_stat` | 상태가 사용자가 입력한 상태 조건에 들어오면 |
| `AND` | 두 조건을 모두 만족하는 행만 |

여기서 가장 중요한 공식 문서 근거는 "빈 range table은 true"라는 점이다. 즉 `s_conc`가 비어 있으면 `concert_id IN s_conc`는 조건을 걸지 않은 것처럼 동작한다. 그래서 `s_conc`와 `s_stat`을 모두 비우면 전체 예매가 조회될 수 있다.

이 동작은 편리하지만 위험할 수 있다. 사용자가 실수로 조건을 비웠는데 전체 테이블을 읽어 버릴 수 있기 때문이다. 지금은 구조를 이해하고, 실제 입력 필수 검증은 CH15의 selection screen 검증에서 다룬다.

### 어떻게 확인하는가

예매 데이터 6건을 기준으로 확인한다.

| booking_id | concert_id | customer | seats | status |
| ---: | --- | --- | ---: | --- |
| 5001 | C001 | 정훈영 | 2 | N |
| 5002 | C001 | 손흥민 | 4 | N |
| 5003 | C001 | 아이유 | 3 | N |
| 5004 | C002 | 유재석 | 1 | C |
| 5005 | C002 | 김연아 | 2 | N |
| 5006 | C001 | 차은우 | 5 | N |

테스트 시나리오는 다음과 같다.

| s_conc | s_stat | 예상 결과 |
| --- | --- | --- |
| 비어 있음 | 비어 있음 | 6건 전체 |
| `I EQ C001` | 비어 있음 | C001 공연 4건 |
| 비어 있음 | `I EQ N` | 예약 상태 N 5건 |
| `I EQ C001` | `I EQ N` | C001이면서 N인 4건 |
| `I BT C001 C002` | `E EQ C` | C001~C002 중 취소 C 제외, 5건 |

실행 후에는 `sy-subrc`와 `sy-dbcnt`를 확인한다.

- 조회된 행이 있으면 `sy-subrc = 0`이고 `sy-dbcnt`는 전달된 행 수다.
- 결과가 비어 있으면 일반적으로 `sy-subrc = 4`, `sy-dbcnt = 0`이다.
- range가 비어 있어 전체가 나왔을 때도 `sy-subrc = 0`일 수 있다. 그래서 "성공"과 "의도한 필터"는 따로 확인해야 한다.

### 체험 설계

L03에는 "WHERE IN 필터 엔진"을 설계한다.

화면은 Range Table 입력 영역, SQL 미리보기, 결과표, 시스템 필드 표시로 구성한다.

| 버튼 | Range Table 상태 | 결과 | 피드백 |
| --- | --- | --- | --- |
| `전체` | `s_conc`와 `s_stat` 모두 빈 table | 6건 | "빈 range는 true라서 조건을 제한하지 않습니다." |
| `C001만` | `s_conc = I/EQ/C001` | 4건 | "공연ID 조건이 적용됐습니다." |
| `예약 N만` | `s_stat = I/EQ/N` | 5건 | "상태 조건이 적용됐습니다." |
| `C001 + N` | 두 조건 모두 | 4건 | "`AND`라 두 조건을 모두 만족해야 합니다." |
| `존재하지 않는 공연` | `s_conc = I/EQ/C999` | 0건 | "`sy-subrc = 4`, `sy-dbcnt = 0`을 확인합니다." |

오답 피드백은 다음처럼 둔다.

- "빈 SELECT-OPTIONS는 0건"을 고르면: "ABAP SQL의 `IN range_tab`에서 빈 range는 true입니다. 그래서 전체가 나올 수 있습니다."
- "s_conc와 s_stat은 OR로 묶인다"를 고르면: "두 줄 사이에 `AND`가 있으므로 둘 다 만족해야 합니다."
- "modern 문법으로 바꿔야 한다"를 고르면: "CH12는 classic 구간입니다. modern Open SQL은 CH19에서 다룹니다."

### 실수와 주의

첫 번째 실수는 빈 range의 의미를 반대로 기억하는 것이다. 빈 `s_conc`는 "아무것도 선택하지 않았으니 0건"이 아니라 "공연 조건은 제한하지 않음"으로 동작한다.

두 번째 실수는 조건이 비어 전체 조회된 것을 정상 필터라고 착각하는 것이다. 실무에서는 전체 조회가 성능 문제나 권한 문제로 이어질 수 있다. 입력 필수 검증은 CH15에서 다루지만, 지금부터 "빈 조건이면 전체"라는 위험 신호를 기억해야 한다.

세 번째 실수는 classic Open SQL과 modern Open SQL을 섞는 것이다. 이 레슨의 예제는 classic range 조건이다. host marker와 comma-separated field list는 쓰지 않는다.

### 정리

- `WHERE field IN range_table`은 Range Table을 SELECT 조건으로 평가한다.
- selection table도 ranges table과 같은 구조라 `WHERE ... IN s_conc`에 바로 쓸 수 있다.
- 빈 range는 true라서 전체 조회가 될 수 있다.
- 결과는 `sy-subrc`, `sy-dbcnt`, 결과 Internal Table 행 수로 확인한다.
- 다음 레슨에서는 다중 선택 팝업에서 Include와 Exclude가 섞일 때 결과가 어떻게 결정되는지 본다.

---

## CH12-L04 - Multiple Selection과 Include/Exclude

### 왜 필요한가

단일 From/To 입력만으로는 사용자의 조건을 충분히 표현하기 어렵다. 사용자는 "C001과 C003만", "C001부터 C005까지지만 C004는 제외", "상태 N은 포함하고 C는 제외"처럼 조건을 여러 줄로 만들고 싶어 한다.

`SELECT-OPTIONS` 오른쪽의 multiple selection 버튼은 이 요구를 처리한다. 이 팝업에서 사용자는 여러 단일 값, 여러 범위, 포함, 제외를 입력한다. 그 결과는 결국 Range Table의 여러 행이 된다.

### 무엇인가

Multiple Selection 팝업은 사용자가 Range Table 행을 화면으로 편하게 만드는 도구다.

입문자는 탭 이름보다 행의 의미를 먼저 이해하면 된다.

| 화면 의미 | Range Table 행 |
| --- | --- |
| 포함할 단일 값 | `SIGN = I`, `OPTION = EQ` |
| 포함할 범위 | `SIGN = I`, `OPTION = BT` |
| 제외할 단일 값 | `SIGN = E`, `OPTION = EQ` |
| 제외할 범위 | `SIGN = E`, `OPTION = BT` |

공식 문서 기준으로 selection screen에서는 `SIGN = I`일 때 녹색 아이콘, `SIGN = E`일 때 빨간색 아이콘으로 구분된다.

동작 규칙은 다음처럼 설명한다.

1. Include 행 중 하나라도 맞으면 후보가 된다.
2. Exclude 행에 걸리면 후보에서 빠진다.
3. Include가 비어 있는 range는 전체를 제한하지 않는 조건처럼 동작할 수 있다.

예를 들어 다음 조건을 보자.

| SIGN | OPTION | LOW | HIGH | 뜻 |
| --- | --- | --- | --- | --- |
| I | BT | C001 | C003 | C001부터 C003까지 포함 |
| E | EQ | C002 |  | C002는 제외 |

결과는 C001과 C003은 통과하고, C002는 제외된다.

### 어떻게 확인하는가

학습자는 공연ID 후보를 놓고 통과/탈락을 판정한다.

조건:

| SIGN | OPTION | LOW | HIGH |
| --- | --- | --- | --- |
| I | BT | C001 | C003 |
| E | EQ | C002 |  |

판정:

| concert_id | Include 후보인가 | Exclude에 걸리는가 | 최종 |
| --- | --- | --- | --- |
| C001 | 예 | 아니오 | 통과 |
| C002 | 예 | 예 | 탈락 |
| C003 | 예 | 아니오 | 통과 |
| C004 | 아니오 | 아니오 | 탈락 |

여기서 핵심은 제외가 포함보다 "더 센 필터"처럼 작동한다는 감각이다. 포함 범위에 들어왔더라도 제외 조건에 걸리면 최종 결과에서 빠진다.

### 체험 설계

L04에는 "Include/Exclude 판정기"를 설계한다.

화면은 세 부분이다.

```text
[Multiple Selection 팝업 모형] -> [Range Table 행] -> [데이터별 통과/탈락 이유]
```

버튼과 피드백은 다음과 같다.

| 버튼 | 조건 행 | 결과 피드백 |
| --- | --- | --- |
| `C001~C003 포함` | `I / BT / C001 / C003` | "C001, C002, C003이 후보가 됩니다." |
| `C002 제외 추가` | 위 행 + `E / EQ / C002 / 빈칸` | "C002는 후보였지만 제외 조건에 걸려 탈락합니다." |
| `C004만 추가 포함` | Include 행 추가 | "Include 행은 여러 개면 OR처럼 후보를 넓힙니다." |
| `제외만 남기기` | `E / EQ / C002`만 | "제외만 있는 조건은 의도와 다르게 읽히기 쉽습니다. 전체에서 C002만 빼는 효과를 기대할 수 있지만, 업무적으로는 포함 범위를 함께 명확히 두는 편이 안전합니다." |

행별 readout에는 "왜 통과했는가"를 문장으로 표시한다.

- "C001: 포함 범위 C001~C003에 있고 제외 조건에는 없습니다."
- "C002: 포함 범위에는 있지만 제외 조건 C002에 걸렸습니다."
- "C004: 포함 조건에 들어오지 않았습니다."

### 실수와 주의

첫 번째 실수는 녹색/빨강 아이콘을 단순한 색상 장식으로 보는 것이다. 녹색은 Include, 빨강은 Exclude다. 실제로 `SIGN` 값이 달라진다.

두 번째 실수는 Include 여러 줄을 AND로 생각하는 것이다. 같은 필드의 Include 여러 줄은 보통 후보를 넓힌다. "C001도 되고 C003도 된다"에 가깝다.

세 번째 실수는 Exclude만 넣고 의도를 설명하지 않는 것이다. 공식 평가 규칙 자체는 Range Table 규칙을 따르지만, 실무 화면에서는 "어느 범위에서 무엇을 제외하는지"를 사용자에게 명확히 보여 주는 편이 안전하다.

### 정리

- Multiple Selection 팝업은 여러 Range Table 행을 화면에서 만드는 도구다.
- Include는 `SIGN = I`, Exclude는 `SIGN = E`다.
- Include는 후보를 만들고, Exclude는 후보에서 제거한다.
- 녹색/빨강 아이콘은 실제 `SIGN` 값과 연결된다.
- 다음 레슨에서는 `OPTION` 값인 `EQ`, `BT`, `CP`가 각각 어떤 비교를 하는지 정리한다.

---

## CH12-L05 - EQ / BT / CP 옵션 이해

### 왜 필요한가

Range Table의 `SIGN`이 포함/제외를 정한다면, `OPTION`은 "어떤 방식으로 비교할지"를 정한다. `OPTION`을 잘못 고르면 결과가 전혀 달라진다.

예를 들어 "C001만"은 `EQ`가 맞다. "C001부터 C003까지"는 `BT`가 맞다. "C로 시작하는 모든 공연"은 `CP`가 맞다. 이 차이를 모르고 모두 `EQ`로만 처리하면 다중 조건의 장점을 거의 쓰지 못한다.

### 무엇인가

자주 쓰는 `OPTION`은 다음과 같다.

| OPTION | 의미 | LOW | HIGH | 예 |
| --- | --- | --- | --- | --- |
| `EQ` | 같음 | 사용 | 비움 | `I EQ C001` |
| `NE` | 다름 | 사용 | 비움 | `I NE C001` |
| `BT` | 사이 | 사용 | 사용 | `I BT C001 C003` |
| `NB` | 사이가 아님 | 사용 | 사용 | `I NB C001 C003` |
| `GT` | 초과 | 사용 | 비움 | `I GT 10` |
| `GE` | 이상 | 사용 | 비움 | `I GE 10` |
| `LT` | 미만 | 사용 | 비움 | `I LT 10` |
| `LE` | 이하 | 사용 | 비움 | `I LE 10` |
| `CP` | 패턴에 맞음 | 사용 | 비움 | `I CP C*` |
| `NP` | 패턴에 맞지 않음 | 사용 | 비움 | `I NP C*` |

CH12에서는 특히 `EQ`, `BT`, `CP`를 확실히 잡는다.

`CP`는 "Contains Pattern"이라는 이름 때문에 "포함 문자열 검색"처럼 느끼기 쉽다. 하지만 ABAP의 `CP`는 패턴 전체에 맞는지를 판단하는 비교다. wildcard를 함께 써서 원하는 모양을 표현해야 한다.

| 패턴 | 의미 |
| --- | --- |
| `C*` | C로 시작 |
| `*01` | 01로 끝 |
| `C+01` | C 다음 한 글자, 그 뒤 01 |

`*`는 여러 글자, `+`는 정확히 한 글자에 대응한다. SQL `LIKE`의 `%`, `_`와 모양이 다르다는 점도 기억한다. ABAP SQL에서 Range Table의 `CP`가 평가될 때는 SQL LIKE 패턴으로 변환될 수 있지만, CH12 학습자는 selection option에는 `*`와 `+`를 쓴다고 잡으면 된다.

### 어떻게 확인하는가

데이터 후보를 놓고 `OPTION`별 결과를 비교한다.

후보: `C001`, `C002`, `A001`, `C010`

| 조건 | 통과 값 | 해설 |
| --- | --- | --- |
| `I EQ C001` | C001 | 정확히 같은 값 |
| `I BT C001 C002` | C001, C002 | LOW부터 HIGH까지 |
| `I CP C*` | C001, C002, C010 | C로 시작 |
| `E EQ C002` | C002 제외 | SIGN이 E라 제외 |

학습자는 `SIGN`과 `OPTION`을 함께 읽어야 한다.

- `I EQ C001`: C001을 포함한다.
- `E EQ C001`: C001을 제외한다.
- `I CP C*`: C로 시작하는 값을 포함한다.
- `E CP C*`: C로 시작하는 값을 제외한다.

### 체험 설계

L05에는 "OPTION 비교 실험실"을 설계한다.

화면 구성은 왼쪽에 후보 값 목록, 가운데에 조건 편집기, 오른쪽에 통과 결과를 둔다.

| 조작 | 결과 | 피드백 |
| --- | --- | --- |
| `OPTION = EQ`, `LOW = C001` | C001만 통과 | "정확히 같은 값만 통과합니다." |
| `OPTION = BT`, `LOW = C001`, `HIGH = C003` | C001~C003 통과 | "BT는 LOW와 HIGH가 모두 필요합니다." |
| `OPTION = CP`, `LOW = C*` | C로 시작하는 값 통과 | "`*`는 여러 글자 wildcard입니다." |
| `OPTION = CP`, `LOW = C+01` | C 다음 한 글자 뒤 01 패턴만 통과 | "`+`는 정확히 한 글자 wildcard입니다." |
| `SIGN = E` 토글 | 통과/탈락 반전 | "같은 OPTION이라도 SIGN이 E면 제외 조건이 됩니다." |

오답 피드백은 다음처럼 둔다.

- `CP`에 `C001`만 넣고 "C001 포함 검색"을 기대하면: "wildcard가 없는 패턴은 `EQ`와 혼동하기 쉽습니다. 정확 매칭이면 `EQ`를 사용하세요."
- `BT`인데 `HIGH`가 비어 있으면: "`BT`는 사이값 비교라 끝 값이 필요합니다."
- SQL wildcard `%`를 입력하면: "SELECT-OPTIONS의 CP 패턴은 ABAP wildcard `*`, `+`를 사용합니다."

### 실수와 주의

첫 번째 실수는 `CP`를 일반 포함 검색처럼 사용하는 것이다. `CP`는 wildcard와 함께 패턴을 표현해야 의미가 분명하다.

두 번째 실수는 `BT`에서 `LOW`와 `HIGH`의 순서를 바꾸는 것이다. selection screen은 상한/하한 검사를 해 주는 경우가 있지만, 코드로 직접 range를 만들 때는 직접 조심해야 한다.

세 번째 실수는 SQL `LIKE`의 `%`, `_`와 SELECT-OPTIONS `CP`의 `*`, `+`를 섞는 것이다. CH12에서는 Range Table의 `CP` 패턴에는 `*`, `+`를 쓴다고 기억한다.

### 정리

- `OPTION`은 비교 방식을 정한다.
- `EQ`는 정확히 같음, `BT`는 범위, `CP`는 wildcard 패턴 비교다.
- `SIGN`과 `OPTION`은 항상 함께 읽어야 한다.
- `CP`의 wildcard는 `*`와 `+`다.
- 다음 레슨에서는 화면 입력 없이 코드로 Range Table 행을 직접 만든다.

---

## CH12-L06 - Selection Table 직접 조작 기초

### 왜 필요한가

지금까지는 사용자가 selection screen에 값을 입력하면 Range Table이 만들어졌다. 하지만 모든 조건이 화면에서 오지는 않는다. 배치 프로그램, 내부 호출, 기본 조건 보정, 권한에 따른 자동 제한처럼 화면 없이 조건을 만들어야 할 때가 있다.

이때 필요한 것이 Range Table 직접 조작이다. 구조는 이미 L01에서 배웠다. 코드로도 결국 `SIGN`, `OPTION`, `LOW`, `HIGH`를 채운 행을 만들어 `APPEND`하면 된다.

### 무엇인가

현재식으로 Range Table 변수를 만들 때는 `TYPE RANGE OF`를 사용한다.

```abap
DATA: lr_stat TYPE RANGE OF zbooking-status,
      ls_stat LIKE LINE OF lr_stat,
      lt_book TYPE TABLE OF zbooking.

CLEAR ls_stat.
ls_stat-sign   = 'I'.
ls_stat-option = 'EQ'.
ls_stat-low    = 'N'.
APPEND ls_stat TO lr_stat.

SELECT * FROM zbooking INTO TABLE lt_book
  WHERE status IN lr_stat.
```

줄별 의미는 다음과 같다.

| 코드 | 의미 |
| --- | --- |
| `lr_stat TYPE RANGE OF zbooking-status` | 상태 필드와 같은 타입의 Range Table을 만든다. |
| `ls_stat LIKE LINE OF lr_stat` | Range Table 한 행을 담을 work area를 만든다. |
| `CLEAR ls_stat.` | 이전 행 값이 남지 않게 비운다. |
| `ls_stat-sign = 'I'.` | 포함 조건으로 만든다. |
| `ls_stat-option = 'EQ'.` | 정확히 같은 값 비교로 만든다. |
| `ls_stat-low = 'N'.` | 상태 N을 조건값으로 둔다. |
| `APPEND ls_stat TO lr_stat.` | 완성한 조건 행을 Range Table에 추가한다. |

레거시 코드에서는 다음 문장을 볼 수 있다.

```abap
RANGES r_stat FOR zbooking-status.
```

공식 문서 기준으로 `RANGES`는 obsolete declaration이고 header line 방식이다. 새로 작성할 기준 원고에서는 `TYPE RANGE OF`를 기본으로 쓰고, `RANGES`는 기존 코드 인지용으로만 설명한다.

### 어떻게 확인하는가

코드를 디버거처럼 한 줄씩 따라가며 `lr_stat`의 상태를 본다.

| 실행 단계 | `ls_stat` | `lr_stat` |
| --- | --- | --- |
| 선언 직후 | 빈 행 | 빈 table |
| `sign = 'I'` | I만 채워짐 | 빈 table |
| `option = 'EQ'` | I/EQ | 빈 table |
| `low = 'N'` | I/EQ/N | 빈 table |
| `APPEND` 후 | I/EQ/N | 1행: I/EQ/N |

그 다음 `SELECT ... WHERE status IN lr_stat`를 실행하면 상태 N인 예매만 들어와야 한다.

확인 질문은 다음과 같다.

| 질문 | 기대 답 |
| --- | --- |
| `APPEND` 전 `lr_stat`에 조건이 들어갔는가? | 아니다. `ls_stat`에만 준비된 상태다. |
| `CLEAR`를 안 하면 어떤 위험이 있는가? | 이전 행의 `HIGH`나 다른 값이 남을 수 있다. |
| `RANGES`를 새 코드 기준으로 권장하는가? | 아니다. 기존 코드 인지용이다. |

### 체험 설계

L06은 원본에 코드가 있지만 embed가 없으므로 "코드로 range 행 추가" 스텝퍼를 설계한다.

화면은 네 영역이다.

```text
[ABAP 코드] [현재 ls_stat] [lr_stat 행 목록] [SELECT 결과]
```

버튼과 상태는 다음과 같다.

| 버튼 | 현재 상태 | 피드백 |
| --- | --- | --- |
| `CLEAR` | `ls_stat` 모든 칸 빈 값 | "새 조건 행을 만들기 전 이전 값을 지웁니다." |
| `SIGN 입력` | `SIGN = I` | "포함 조건으로 설정했습니다." |
| `OPTION 입력` | `OPTION = EQ` | "정확히 같은 값 비교입니다." |
| `LOW 입력` | `LOW = N` | "상태 N을 조건값으로 넣었습니다." |
| `APPEND` | `lr_stat`에 1행 추가 | "이제 WHERE IN에서 평가할 조건이 생겼습니다." |
| `SELECT 실행` | 결과표에 N 상태만 표시 | "화면 없이 만든 Range Table도 WHERE IN에 쓸 수 있습니다." |
| `CLEAR 없이 두 번째 행` | 이전 값 잔류 경고 | "새 행을 만들기 전 work area를 비우지 않으면 의도치 않은 값이 남을 수 있습니다." |

오답 피드백은 다음처럼 둔다.

- "`ls_stat`만 채우면 조건이 적용된다"를 고르면: "아직 `lr_stat`에 행이 없습니다. `APPEND`가 필요합니다."
- "`TYPE RANGE OF`와 `SELECT-OPTIONS`가 완전히 같다"를 고르면: "구조는 같지만 `SELECT-OPTIONS`는 화면 입력까지 만들고, `TYPE RANGE OF`는 코드 안의 table만 만듭니다."
- "`RANGES`를 새 코드에 쓰자"를 고르면: "`RANGES`는 레거시 header-line 방식입니다. 새 기준은 `TYPE RANGE OF`입니다."

### 실수와 주의

첫 번째 실수는 `SIGN`이나 `OPTION`을 비워 둔 채 `APPEND`하는 것이다. Range Table 행은 네 칸 구조지만, 최소한 `SIGN`, `OPTION`, `LOW`는 조건에 맞게 채워야 한다.

두 번째 실수는 work area를 재사용하면서 `CLEAR`하지 않는 것이다. 특히 앞 행이 `BT`라 `HIGH`를 썼고 다음 행이 `EQ`라면, `HIGH`가 남아 해석을 헷갈리게 만들 수 있다.

세 번째 실수는 `RANGES`를 현 기준처럼 쓰는 것이다. 기존 ABAP 코드에는 많이 보일 수 있지만, 공식 문서상 obsolete declaration이다. 읽을 수는 있어야 하지만 새 원고의 기본 예제는 `TYPE RANGE OF`로 둔다.

### 정리

- 화면 없이도 `TYPE RANGE OF`로 Range Table을 만들 수 있다.
- 한 조건 행은 work area에 `SIGN`, `OPTION`, `LOW`, `HIGH`를 채운 뒤 `APPEND`한다.
- `SELECT-OPTIONS`는 화면 입력과 selection table을 만들고, `TYPE RANGE OF`는 코드 안에서 range table만 만든다.
- `RANGES`는 레거시 인지용이다.
- 마지막 실습에서는 공연과 상태 조건을 받아 예매 목록을 필터링한다.

---

## CH12-L07 - 실습: 공연·상태로 예매 필터

### 왜 필요한가

CH11-L06에서 예매 목록 전체를 SALV로 볼 수 있었다. 하지만 실제 업무에서는 전체 목록보다 "필요한 목록"이 더 중요하다. 정훈영 담당자가 공연 C001의 예약 건만 보고 싶다면, 전체 6건을 띄운 뒤 눈으로 찾는 방식은 곧 한계가 온다.

CH12-L07은 CH12의 Range Table 지식을 콘서트 예매 앱에 연결한다. 사용자는 공연ID와 상태를 입력하고, 프로그램은 그 조건을 `WHERE ... IN`에 연결해 필요한 예매만 가져온다.

### 무엇인가

실습 프로그램은 세 부분으로 나뉜다.

1. 선택화면: 공연과 상태 조건을 받는다.
2. 조회: `WHERE concert_id IN s_conc AND status IN s_stat`로 필터링한다.
3. 표시: CH11의 SALV로 결과를 보여 준다.

> [선행 사용] `TYPE REF TO`, `TRY ... CATCH`, `lo_alv->display( )`는 CH11 SALV 실습 흐름을 재사용한다. 본격 OO와 예외 처리는 CH20에서 다룬다.

```abap
REPORT zch12_l07_booking_filter.

TABLES zbooking.

SELECT-OPTIONS: s_conc FOR zbooking-concert_id,
                s_stat FOR zbooking-status.

DATA: lt_book TYPE TABLE OF zbooking,
      lo_alv  TYPE REF TO cl_salv_table.

START-OF-SELECTION.
  SELECT * FROM zbooking INTO TABLE lt_book
    WHERE concert_id IN s_conc
      AND status     IN s_stat.

  TRY.
      cl_salv_table=>factory(
        IMPORTING r_salv_table = lo_alv
        CHANGING  t_table      = lt_book ).

      lo_alv->get_functions( )->set_all( abap_true ).
      lo_alv->display( ).
    CATCH cx_salv_msg.
      MESSAGE '예매 목록 ALV 생성 실패' TYPE 'I'.
  ENDTRY.
```

코드에서 CH12의 핵심은 SALV가 아니라 다음 두 줄이다.

```abap
SELECT-OPTIONS: s_conc FOR zbooking-concert_id,
                s_stat FOR zbooking-status.
```

그리고 다음 조건이다.

```abap
WHERE concert_id IN s_conc
  AND status     IN s_stat.
```

### 어떻게 확인하는가

기존 시뮬레이터 `embeds/abap/CH12-L07-S01.html`을 사용한다.

확인 순서는 다음과 같다.

1. `전체 (빈 범위)`를 누르고 실행한다.
   - 결과가 전체 6건인지 확인한다.
   - 빈 range는 true라는 규칙을 복습한다.
2. `공연 C001만 (EQ)`을 누르고 실행한다.
   - C001 예매만 남는지 확인한다.
3. `예약만 (status=N)`을 누르고 실행한다.
   - 상태 N만 남는지 확인한다.
4. `취소 제외 (E)`를 누르고 실행한다.
   - C 상태가 빠지는지 확인한다.
5. 직접 `+ 범위 행 추가`를 눌러 Include/Exclude 행을 만든다.
   - Range Table 행과 결과표가 어떻게 연결되는지 설명한다.

실습 후 확인 질문은 다음과 같다.

| 질문 | 기대 답 |
| --- | --- |
| `s_conc`를 비우면 공연 조건은 어떻게 되는가? | 제한하지 않는다. 전체 공연이 통과할 수 있다. |
| `s_stat = I EQ N`이면 어떤 상태가 남는가? | N 상태만 남는다. |
| `s_stat = E EQ C`이면 어떤 상태가 빠지는가? | C 상태가 빠진다. |
| 결과가 0건이면 어디부터 확인하는가? | Range Table 행, `sy-subrc`, `sy-dbcnt`, 원본 데이터 |

### 체험 설계

이 레슨은 기존 embed를 사용한다.

```text
::embed CH12-L07-S01 | 조건을 바꿔 결과가 어떻게 줄어드는지 보기::
```

체험의 핵심 상태는 다음과 같다.

| 버튼/조작 | Range Table 상태 | 결과 | 피드백 |
| --- | --- | --- | --- |
| `전체 (빈 범위)` | `s_conc`, `s_stat` 모두 0행 | 6건 | "빈 range는 조건을 제한하지 않습니다." |
| `공연 C001만 (EQ)` | `s_conc = I/EQ/C001` | C001만 | "공연 조건이 적용됐습니다." |
| `공연 C001~C002 (BT)` | `s_conc = I/BT/C001/C002` | C001~C002 | "범위 조건은 LOW와 HIGH를 함께 봅니다." |
| `예약만 (status=N)` | `s_stat = I/EQ/N` | N만 | "상태 조건이 적용됐습니다." |
| `취소 제외 (E)` | `s_stat = E/EQ/C` | C 제외 | "Exclude 조건은 후보에서 제거합니다." |
| `범위 행 추가` | 사용자가 직접 행 생성 | 조건에 따라 변화 | "화면 조작 하나가 Range Table 한 행이 됩니다." |
| `실행` | 현재 Range Table을 SQL 조건으로 적용 | 결과 행 수 표시 | "`WHERE ... IN`이 조건을 평가했습니다." |

피드백에는 항상 세 가지를 함께 보여 준다.

1. 현재 `s_conc`, `s_stat`의 Range Table 행
2. 실행되는 classic SQL 조건
3. 필터링 후 예매 결과 행 수

### 실수와 주의

첫 번째 실수는 조건을 비워 놓고 "왜 전체가 나오지?"라고 생각하는 것이다. 빈 range는 true이므로 전체 조회가 될 수 있다. 실무에서 전체 조회를 막고 싶으면 CH15에서 입력 필수 검증을 추가한다.

두 번째 실수는 공연 조건과 상태 조건의 결합을 OR로 오해하는 것이다. 코드에는 `AND`가 있으므로 두 조건을 모두 만족해야 한다.

세 번째 실수는 SALV 오류와 조회 결과 0건을 섞는 것이다. 조회 결과가 0건이어도 SALV는 빈 표를 띄울 수 있다. 반대로 SALV 생성 실패는 `cx_salv_msg` 처리 대상이다.

네 번째 실수는 상태값의 업무 의미를 설명하지 않는 것이다. 실습에서는 `N`을 예약, `C`를 취소로 읽는다. 이 값의 도메인/고정값 관리는 CH03/CH09에서 배운 DDIC 개념으로 돌아가 확인한다.

### 정리

- `SELECT-OPTIONS`는 공연과 상태 조건을 selection table로 만든다.
- `WHERE concert_id IN s_conc AND status IN s_stat`는 두 조건을 모두 만족하는 예매만 조회한다.
- 빈 range는 전체 통과가 될 수 있으므로 주의한다.
- 기존 CH11의 SALV 표시와 결합하면 조건 입력형 예매 목록 리포트가 된다.
- 다음 CH13에서는 필요한 예매를 가져오는 것에서 더 나아가, 여러 테이블을 연결하고 공연별 예매 현황을 집계한다.

---

## CH12 마무리 학습 흐름

CH12를 끝낸 학습자는 다음 문장을 스스로 말할 수 있어야 한다.

1. "Range Table 한 행은 `SIGN/OPTION/LOW/HIGH` 네 칸짜리 조건이다."
2. "`SELECT-OPTIONS`는 선택화면 입력과 selection table을 동시에 만든다."
3. "`WHERE field IN range_table`은 Range Table을 SELECT 조건으로 평가한다."
4. "빈 range는 true라서 전체 조회가 될 수 있다."
5. "Include는 후보를 만들고 Exclude는 후보에서 제거한다."
6. "`TYPE RANGE OF`는 화면 없이 코드로 Range Table을 만들 때 사용하고, `RANGES`는 레거시 인지용이다."

다음 CH13으로 넘어갈 때의 자연스러운 불편은 "필요한 예매만 가져왔지만, 공연명/회차 정보와 합쳐 보고 공연별 좌석 합계도 보고 싶다"이다. 이 불편은 classic Open SQL의 JOIN과 집계로 연결한다.
