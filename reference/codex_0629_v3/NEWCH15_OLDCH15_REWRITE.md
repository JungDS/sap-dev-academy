# CH15_REWRITE - Report Event와 Selection Screen 심화

> 기준 소스: `content/abap/CH15`
> 보조 참고: `reference/codex_0625_v2/CH15_REWRITE.md`, `reference/codex_0625_v2/CH15_QA.md`, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`
> 작성 목표: IT 비전공자도 "리포트가 언제 기본값을 만들고, 언제 화면을 바꾸고, 언제 입력을 막고, 언제 조회를 시작하는지" 실행 흐름으로 이해하게 만든다.

## CH15 전체 강의 설계

CH15는 ABAP executable report의 "실행 흐름"을 배우는 장이다. CH01에서 `START-OF-SELECTION`을 가볍게 보았고, CH12에서 선택조건을 만들었으며, CH11에서 SALV로 결과를 표시했다. 그런데 실제 리포트는 단순히 위에서 아래로만 실행되지 않는다. 사용자가 실행 버튼을 누르기 전에 선택화면이 만들어지고, 기본값이 들어가고, 화면이 다시 그려지고, 입력값이 검증되고, 그 다음에야 조회가 시작된다.

입문자가 가장 많이 하는 오해는 세 가지다.

1. "리포트는 코드가 적힌 순서대로만 실행된다."
2. "기본값, 화면 제어, 입력 검증, 조회를 아무 데나 써도 된다."
3. "`END-OF-SELECTION`은 모든 리포트의 표준 마무리 위치다."

CH15는 이 오해를 바로잡는다.

핵심 흐름은 다음과 같다.

```text
프로그램 로드
  -> INITIALIZATION
  -> 선택화면 표시 전 조정
  -> 사용자 입력
  -> 선택화면 입력 검증
  -> START-OF-SELECTION
  -> 필요한 경우 기존 코드 독해 관점의 END-OF-SELECTION
```

강의에서 반드시 지켜야 할 경계도 있다.

- CH15는 classic report와 selection screen 중심이다.
- Dynpro 화면 설계는 CH16에서 본격적으로 다룬다.
- SALV 객체와 예외는 CH11, CH20에서 배운 것을 빌려 쓰되 여기서 깊게 확장하지 않는다.
- modern syntax, modern SQL, ABAP Cloud 스타일은 CH18 이후에서 다룬다.
- `END-OF-SELECTION`은 공식 문서 기준으로 legacy와 logical database 맥락이 강하므로 신규 단순 리포트의 필수 패턴처럼 가르치지 않는다.

## CH15-L01 - Report Event 흐름 한눈에 보기

### 왜 필요한가

ABAP report를 처음 보면 코드가 위에서 아래로 실행되는 것처럼 보인다. 그래서 초보자는 기본값도 조회문 위에 쓰고, 입력 검증도 조회 직전에 쓰고, 출력도 아무 위치에나 넣으려 한다. 작은 예제에서는 우연히 돌아갈 수 있지만, 선택화면이 있는 실무 report에서는 곧 혼란이 생긴다.

예를 들어 사용자가 공연 ID를 입력하는 리포트를 만든다고 하자. 기본값은 화면이 처음 뜨기 전에 들어가야 한다. 입력 검증은 사용자가 실행을 누른 뒤 조회가 시작되기 전에 해야 한다. 실제 예매 조회는 입력이 정상이라고 확인된 뒤에 해야 한다. 이 위치를 구분하지 못하면 "왜 사용자가 고친 값이 다시 덮였지?", "왜 잘못된 값으로 조회가 나갔지?", "왜 버튼을 눌렀는데 조회가 먼저 실행됐지?" 같은 문제가 생긴다.

### 무엇인가

ABAP report event는 프로그램 실행 중 특정 시점에 ABAP runtime이 호출하는 event block이다. CH15에서 다루는 핵심 event는 다음과 같다.

| Event | 초보자용 의미 | 대표 책임 |
| --- | --- | --- |
| `LOAD-OF-PROGRAM` | 프로그램이 메모리에 올라올 때 | 특수 초기 준비. CH15에서는 인지 수준 |
| `INITIALIZATION` | 선택화면이 처음 준비될 때 | 기본값 설정 |
| `AT SELECTION-SCREEN OUTPUT` | 선택화면을 사용자에게 보내기 직전 | 필드 숨김, 비활성화, 화면 속성 조정 |
| `AT SELECTION-SCREEN` | 사용자가 입력하고 실행 또는 버튼을 누른 뒤 | 입력 검증, 버튼 처리 |
| `START-OF-SELECTION` | 실제 업무 처리가 시작될 때 | DB 조회, 계산, 결과 준비 |
| `END-OF-SELECTION` | legacy report에서 selection 종료 뒤 | 기존 코드 독해용. 신규 단순 report의 필수 마무리로 권장하지 않음 |

event keyword 없이 실행부에 바로 작성된 코드는 기본적으로 시작 처리 영역처럼 동작한다. 하지만 교육용 코드에서는 학습자가 흐름을 눈으로 확인할 수 있도록 `START-OF-SELECTION`을 명시하는 편이 좋다.

### 어떻게 확인하는가

가장 좋은 확인 방법은 debugger breakpoint다.

1. `INITIALIZATION` 첫 줄에 breakpoint를 둔다.
2. `AT SELECTION-SCREEN OUTPUT` 첫 줄에 breakpoint를 둔다.
3. `AT SELECTION-SCREEN` 첫 줄에 breakpoint를 둔다.
4. `START-OF-SELECTION` 첫 줄에 breakpoint를 둔다.
5. 프로그램을 실행하고 선택화면이 뜨기 전, 뜨기 직전, 실행 버튼을 누른 뒤, 조회 시작 시점을 순서대로 본다.

학습자는 이 과정을 통해 "문서에 있는 실행 순서"가 아니라 "내 화면에서 실제로 멈추는 순서"로 event를 이해하게 된다.

### 체험 설계

학습 도구는 "리포트 이벤트 타임라인 시뮬레이터"로 설계한다.

- 화면 왼쪽: event 목록을 세로 타임라인으로 표시한다.
- 화면 오른쪽: 같은 report code를 event block 단위로 접었다 펼친다.
- 버튼: `실행 시작`, `선택화면 표시`, `값 입력`, `실행 버튼`, `조회 시작`.
- 상태: 현재 event, 선택화면 표시 여부, 사용자가 입력한 값, 검증 통과 여부.
- 데이터: `p_conc`, `s_status`, `gt_booking`을 상태 카드로 보여 준다.
- 피드백: 사용자가 "조회"를 `INITIALIZATION` 위치에 끌어다 놓으면 "아직 사용자가 조건을 입력하기 전"이라는 경고를 띄운다.

기존 embed인 `CH15-L01-S01`은 event block이 단계적으로 추가되는 구조이므로 이 레슨의 주 학습 장치로 적합하다. 원고에서는 이 embed가 "event 순서 암기"가 아니라 "책임 위치 구분"을 보여 주는 도구임을 명확히 설명한다.

### 실수와 주의

- event 이름만 외우면 안 된다. 중요한 것은 "이 event에서 무엇을 해도 되는가"다.
- `INITIALIZATION`에서 사용자 입력을 검증하려 하면 안 된다. 아직 사용자가 값을 고치기 전이다.
- `AT SELECTION-SCREEN OUTPUT`에서 DB 조회를 반복하면 화면이 다시 그려질 때마다 무거운 처리가 반복될 수 있다.
- `START-OF-SELECTION`에 선택화면 필드 숨김 로직을 두면 이미 늦다.
- `END-OF-SELECTION`을 신규 단순 report의 표준 출력 위치처럼 암기하면 안 된다.

### 정리

CH15의 출발점은 report event를 "코드 위치"가 아니라 "실행 시점과 책임"으로 이해하는 것이다. 기본값은 `INITIALIZATION`, 화면 조정은 `AT SELECTION-SCREEN OUTPUT`, 입력 검증은 `AT SELECTION-SCREEN`, 업무 조회는 `START-OF-SELECTION`에 둔다.

## CH15-L02 - INITIALIZATION으로 기본값 넣기

### 왜 필요한가

사용자는 선택화면을 볼 때 빈 화면보다 합리적인 기본값이 들어 있는 화면을 더 쉽게 이해한다. 오늘 날짜, 기본 부서, 기본 상태, 기본 조회 기간 같은 값은 사용자가 매번 입력하지 않아도 되게 해 주는 배려다.

다만 기본값을 넣는 시점이 중요하다. 선택화면이 처음 만들어질 때 넣어야지, 사용자가 이미 값을 바꾼 뒤에 다시 넣으면 사용자의 입력을 덮어버린다. 그래서 기본값은 `INITIALIZATION`에서 다룬다.

### 무엇인가

`INITIALIZATION`은 selection screen이 처음 표시되기 전에 실행되는 event block이다. 주 용도는 selection parameter와 selection criteria에 초기값을 넣는 것이다.

classic 예제는 다음처럼 구성한다.

```abap
TABLES ztperson.

PARAMETERS p_date TYPE d.
SELECT-OPTIONS s_dept FOR ztperson-dept_id.

INITIALIZATION.
  p_date = sy-datum.

  s_dept-sign   = 'I'.
  s_dept-option = 'EQ'.
  s_dept-low    = '1000'.
  APPEND s_dept.
```

여기서 `p_date`는 단일 입력값이고, `s_dept`는 range table 구조를 가진 selection criteria다. `SELECT-OPTIONS`는 내부적으로 `SIGN`, `OPTION`, `LOW`, `HIGH`를 가진 테이블처럼 동작한다. 그래서 기본값을 넣을 때 단순 대입이 아니라 한 줄을 만든 뒤 append하는 흐름이 필요하다.

### 어떻게 확인하는가

1. `INITIALIZATION`에 breakpoint를 둔다.
2. 프로그램을 실행한다.
3. 선택화면이 보이기 전에 `p_date`와 `s_dept` 값이 채워지는지 확인한다.
4. 화면이 표시된 뒤 사용자가 값을 바꾸고 실행한다.
5. 실행 버튼을 눌렀을 때 `INITIALIZATION`이 다시 사용자의 값을 덮지 않는지 확인한다.

### 체험 설계

학습 장치는 "기본값 주입 실험실"로 설계한다.

- 입력 카드: `p_date`, `s_dept-low`, `s_dept-option`.
- 버튼: `초기 화면 만들기`, `사용자가 값 변경`, `실행 버튼`.
- 상태: `INITIALIZATION 실행 여부`, `사용자 변경 여부`, `현재 선택값`.
- 피드백: 기본값 로직을 `AT SELECTION-SCREEN OUTPUT`으로 옮기는 선택을 하면 "화면이 다시 그려질 때 사용자 값을 덮을 수 있음" 경고를 보여 준다.

### 실수와 주의

- `INITIALIZATION`은 검증 위치가 아니다. 잘못된 입력을 막는 일은 `AT SELECTION-SCREEN` 계열에서 한다.
- `SELECT-OPTIONS` 기본값은 한 줄 구조를 채운 뒤 append한다.
- `sy-datum` 같은 시스템 값을 기본값으로 쓰는 것은 좋지만, 사용자 입력 이후 반복 대입하면 안 된다.
- `TABLES dbtab`은 classic 문맥에서 배우는 형태다. modern 코드 스타일로 확장하는 것은 CH18 이후에 다룬다.

### 정리

`INITIALIZATION`은 "선택화면을 처음 열 때 사용자를 도와주는 기본값 준비 위치"다. 사용자가 고친 값을 존중해야 하므로 반복적인 화면 제어 위치와 섞지 않는다.

## CH15-L03 - AT SELECTION-SCREEN OUTPUT과 동적 화면 제어

### 왜 필요한가

실무 selection screen은 항상 같은 모양일 필요가 없다. "고급 조건 사용"을 체크했을 때만 상세 조건을 보이게 하거나, 특정 mode에서는 일부 필드를 입력하지 못하게 해야 한다. 이때 단순히 field를 선언하는 것만으로는 부족하다. 화면이 사용자에게 보내지기 직전에 screen element 속성을 바꿔야 한다.

### 무엇인가

`AT SELECTION-SCREEN OUTPUT`은 selection screen이 표시되기 직전에 실행되는 event다. Dynpro의 PBO 성격에 가깝다. 이 event에서는 `SCREEN` 테이블을 순회하면서 화면 요소의 속성을 조정한다.

classic-safe 예제는 다음처럼 작성한다.

```abap
PARAMETERS: p_adv    AS CHECKBOX,
            p_secret TYPE c LENGTH 10 MODIF ID adv.

DATA gs_screen TYPE screen.

AT SELECTION-SCREEN OUTPUT.
  LOOP AT SCREEN INTO gs_screen.
    IF gs_screen-group1 = 'ADV' AND p_adv IS INITIAL.
      gs_screen-active = '0'.
      MODIFY SCREEN FROM gs_screen.
    ENDIF.
  ENDLOOP.
```

중요한 점은 `LOOP AT SCREEN INTO gs_screen`과 `MODIFY SCREEN FROM gs_screen` 형태로 읽고 반영하는 것이다. 공식 문서에서도 짧은 내장 work area 형태는 obsolete로 설명되므로 새 예제에서는 명시 work area를 사용한다.

`MODIF ID adv`로 지정한 값은 screen group에 연결되고, 실행 중에는 대문자 그룹 값으로 비교한다. 그래서 예제에서는 `'ADV'`를 비교한다.

### 어떻게 확인하는가

1. 선택화면에서 `p_adv`를 끈 상태로 실행한다.
2. `p_secret`이 보이지 않거나 비활성화되는지 확인한다.
3. `p_adv`를 켠 뒤 Enter 또는 실행을 눌러 화면이 다시 그려지게 한다.
4. `p_secret`의 속성이 바뀌는지 확인한다.
5. debugger에서 `gs_screen-name`, `gs_screen-group1`, `gs_screen-active` 값을 확인한다.

### 체험 설계

학습 장치는 "화면 속성 토글 보드"로 설계한다.

- 토글: `고급 조건 사용`.
- 필드 카드: `p_secret`의 active, input, invisible 상태를 표시한다.
- 코드 하이라이트: `LOOP AT SCREEN`, 조건문, `MODIFY SCREEN FROM`이 순서대로 점등된다.
- 피드백: `MODIFY SCREEN FROM gs_screen`을 빼면 "work area 값만 바뀌고 화면에 반영되지 않음" 메시지를 보여 준다.

### 실수와 주의

- `AT SELECTION-SCREEN OUTPUT`은 입력 검증 위치가 아니다.
- 이 event에서 사용자가 입력한 값을 매번 초기화하면 사용자의 수정값을 덮을 수 있다.
- 화면 속성 변경 후에는 `MODIFY SCREEN FROM gs_screen`이 필요하다.
- `screen-name`은 실제 generated field name과 맞아야 한다. 단순 label text와 다를 수 있다.
- `MODIF ID`를 쓰면 field name 하나하나보다 그룹 단위 제어가 쉬워진다.

### 정리

`AT SELECTION-SCREEN OUTPUT`은 화면을 "보내기 직전"에 다듬는 위치다. 기본값은 `INITIALIZATION`, 검증은 `AT SELECTION-SCREEN`, 조회는 `START-OF-SELECTION`에 맡기고, 이 event는 screen element 속성 제어에 집중한다.

## CH15-L04 - AT SELECTION-SCREEN 입력 검증과 MESSAGE 정식

### 왜 필요한가

사용자가 잘못된 조건으로 조회를 실행하면 DB 조회가 낭비되고, 결과가 없거나 이상한 데이터가 표시된다. 더 나쁜 경우 권한이 없는 범위를 조회하려고 할 수도 있다. 따라서 selection screen 단계에서 막을 수 있는 오류는 조회 전에 막아야 한다.

이때 사용자에게 "왜 실행이 안 되는지" 알려 주는 표준 수단이 `MESSAGE`다. CH08에서 message를 맛보기로 보았다면, CH15에서는 selection screen 검증과 연결해 정식으로 배운다.

### 무엇인가

`AT SELECTION-SCREEN`은 사용자가 selection screen에서 실행, Enter, function key, pushbutton 같은 동작을 했을 때 입력값을 검증하는 event다.

대표 형태는 세 가지다.

| 형태 | 쓰는 경우 | 학습 포인트 |
| --- | --- | --- |
| `AT SELECTION-SCREEN ON p_field` | 특정 field 하나를 검증 | 오류 시 해당 field 중심으로 수정 |
| `AT SELECTION-SCREEN ON BLOCK b1` | 관련 field 묶음을 검증 | 날짜 시작과 종료 같은 조합 |
| `AT SELECTION-SCREEN` | 전체 화면 검증, 버튼 처리 | 여러 조건과 command 분기 |

날짜 범위 검증 예:

```abap
PARAMETERS: p_from TYPE d,
            p_to   TYPE d.

AT SELECTION-SCREEN.
  IF p_from > p_to.
    MESSAGE '시작일이 종료일보다 늦습니다' TYPE 'E'.
  ENDIF.
```

특정 field 검증 예:

```abap
PARAMETERS p_date TYPE d.

AT SELECTION-SCREEN ON p_date.
  IF p_date > sy-datum.
    MESSAGE '미래 날짜는 입력할 수 없습니다' TYPE 'E'.
  ENDIF.
```

message type은 화면 흐름에 직접 영향을 준다.

| Type | 의미 | CH15에서의 대표 위치 |
| --- | --- | --- |
| `S` | 성공 또는 상태 알림 | 조회 결과 없음 같은 부드러운 안내 |
| `I` | 정보 | 도움말성 안내 |
| `W` | 경고 | 사용자가 확인 후 계속할 수 있는 주의 |
| `E` | 오류 | selection screen에서 입력 수정 요구 |
| `A` | 종료성 중단 | 일반 입력 검증에는 부적합 |
| `X` | 심각한 runtime 종료 | 학습 예제와 일반 입력 검증에는 부적합 |

실무에서는 message class를 만들어 번호 메시지를 관리한다. 예를 들면 `ZMC_CONCERT`에 다음 메시지를 만든다.

| 번호 | 텍스트 예 |
| --- | --- |
| `001` | 공연 ID를 입력하세요 |
| `002` | 시작일 &1 이 종료일 &2 보다 늦습니다 |
| `003` | 존재하지 않는 공연 ID입니다: &1 |
| `004` | 공연 &1 에 대한 조회 권한이 없습니다 |

사용 예:

```abap
AT SELECTION-SCREEN.
  IF p_from > p_to.
    MESSAGE e002(zmc_concert) WITH p_from p_to.
  ENDIF.
```

`&1`부터 `&4`까지의 placeholder는 `WITH` 뒤의 값으로 채워진다. `MESSAGE ... INTO`는 message text를 변수에 담는 문법이고, `MESSAGE ... RAISING`은 non-class-based exception 맥락에서 사용된다. CH15의 selection screen 검증에서는 "존재하는 문법"으로 소개하되 주력 패턴은 message type과 message class다.

### 어떻게 확인하는가

1. `p_from`에 더 늦은 날짜, `p_to`에 더 이른 날짜를 넣는다.
2. 실행 버튼을 누른다.
3. `MESSAGE TYPE 'E'`가 화면 흐름을 막고 selection screen으로 돌아오는지 확인한다.
4. field event와 전체 event의 차이를 본다.
5. SE91에서 message class를 만들고 번호 메시지의 placeholder가 채워지는지 확인한다.

### 체험 설계

학습 장치는 "입력 검문소 시뮬레이터"로 설계한다.

- 입력: 시작일, 종료일, 공연 ID.
- 버튼: `정상 입력`, `날짜 역전`, `빈 공연 ID`, `없는 공연 ID`.
- 상태: 현재 event, 검증 결과, 반환 위치, message type.
- 피드백: type `E`를 선택하면 selection screen으로 돌아가고, type `S`를 선택하면 흐름이 계속되는 차이를 시각화한다.
- 데이터: message class 번호와 `&1`, `&2` 치환값을 별도 카드에 표시한다.

### 실수와 주의

- 입력 검증을 `START-OF-SELECTION`까지 미루면 이미 report 실행이 시작된 뒤다.
- field event와 전체 event를 혼동하지 않는다.
- message type `E`는 selection screen 문맥에서 사용자가 값을 고치도록 흐름을 되돌린다.
- message class가 없는 시스템에서 `MESSAGE e001(zmc_concert)`를 그대로 실행하면 활성화되지 않는다. 실습 전 SE91 준비가 필요하다.
- `MESSAGE ... INTO`는 화면에 메시지를 띄워 멈추는 용도가 아니라 text를 변수로 받는 용도다.

### 정리

`AT SELECTION-SCREEN`은 selection screen의 검문소다. 조회 전에 막아야 할 입력 오류는 여기서 막고, `MESSAGE`는 사용자가 바로 고칠 수 있는 이유를 알려 주는 표준 피드백이다.

## CH15-L05 - START-OF-SELECTION에서 조회 시작하기

### 왜 필요한가

기본값도 넣었고, 화면도 다듬었고, 입력도 검증했다면 이제 실제 업무 처리를 시작해야 한다. 이 시점이 `START-OF-SELECTION`이다. 사용자가 입력한 조건이 모두 준비된 뒤이므로 DB 조회와 결과 준비를 여기에 배치한다.

### 무엇인가

`START-OF-SELECTION`은 executable report에서 실제 main processing이 시작되는 대표 event block이다.

예:

```abap
TABLES ztperson.

SELECT-OPTIONS s_dept FOR ztperson-dept_id.

DATA gt_person TYPE TABLE OF ztperson.

START-OF-SELECTION.
  SELECT *
    FROM ztperson
    INTO TABLE gt_person
    WHERE dept_id IN s_dept.

  IF gt_person IS INITIAL.
    MESSAGE '조회된 사원이 없습니다' TYPE 'S'.
  ENDIF.
```

CH12에서 배운 `SELECT-OPTIONS`는 `WHERE ... IN s_dept`로 연결된다. 사용자가 selection screen에 입력한 include, exclude, interval 조건이 내부 range table로 전달되고, 조회 조건으로 사용된다.

### 어떻게 확인하는가

1. selection screen에 부서 조건을 입력한다.
2. `AT SELECTION-SCREEN` 검증 breakpoint를 통과한다.
3. `START-OF-SELECTION` breakpoint에 도착한다.
4. `s_dept`의 range row와 `gt_person` 조회 결과를 확인한다.
5. 조건을 비워 실행했을 때와 특정 부서만 입력했을 때 결과 차이를 확인한다.

### 체험 설계

학습 장치는 "조건에서 조회까지 흐름판"으로 설계한다.

- 왼쪽: selection screen 입력값.
- 가운데: `s_dept` range table row.
- 오른쪽: `SELECT` 결과 table.
- 버튼: `부서 1000`, `1000부터 3000`, `제외 조건`, `조건 없음`.
- 피드백: `START-OF-SELECTION` 전에 range table이 이미 준비되어 있음을 강조한다.

### 실수와 주의

- DB 조회를 `INITIALIZATION`에 넣으면 사용자가 조건을 입력하기 전이다.
- DB 조회를 `AT SELECTION-SCREEN OUTPUT`에 넣으면 화면 표시 때마다 반복될 수 있다.
- `SELECT *`는 교육용 단순 예제로만 쓰고, 실무에서는 필요한 field만 읽는 습관을 이후 장에서 확장한다.
- 데이터 변경 DML은 CH24 범위다. CH15는 조회와 선택화면 검증에 집중한다.

### 정리

`START-OF-SELECTION`은 "검증된 입력으로 업무 처리를 시작하는 위치"다. selection screen에서 만들어진 조건을 받아 DB 조회, 계산, 결과 준비를 수행한다.

## CH15-L06 - END-OF-SELECTION의 위치와 경계

### 왜 필요한가

기존 SAP 시스템에는 `START-OF-SELECTION` 뒤에 `END-OF-SELECTION`이 있는 report가 많다. 입문자는 이를 보고 "조회는 start, 출력은 end가 정답"이라고 외우기 쉽다. 하지만 공식 문서 기준으로 `END-OF-SELECTION`은 obsolete와 logical database 맥락이 강하다. 따라서 신규 단순 report의 표준 마무리 위치처럼 가르치면 안 된다.

이 레슨의 목표는 `END-OF-SELECTION`을 없었던 것처럼 무시하는 것이 아니다. 기존 classic code를 읽기 위해 정확히 이해하되, 새 report 설계 원칙으로 과도하게 일반화하지 않는 것이다.

### 무엇인가

`END-OF-SELECTION`은 logical database와 연결된 executable program에서 selection 처리가 끝난 뒤 발생하는 event로 설명된다. 오래된 report에서 조회와 출력의 분리를 위해 보일 수 있다.

기존 코드 독해 예:

```abap
DATA gt_booking TYPE TABLE OF zbooking.

START-OF-SELECTION.
  SELECT *
    FROM zbooking
    INTO TABLE gt_booking
    WHERE concert_id = p_conc.

END-OF-SELECTION.
  IF gt_booking IS INITIAL.
    MESSAGE '표시할 예매가 없습니다' TYPE 'S'.
  ELSE.
    PERFORM display_booking.
  ENDIF.
```

이 코드는 "기존 시스템에서 이렇게 나뉘어 있을 수 있다"는 독해 예다. 신규 단순 report라면 `START-OF-SELECTION`에서 조회와 표시 호출을 명확히 이어도 충분하다.

### 어떻게 확인하는가

1. 오래된 report에서 `END-OF-SELECTION`을 검색한다.
2. 해당 report가 logical database를 사용하는지, 단순히 출력 분리 목적으로 남아 있는지 구분한다.
3. `START-OF-SELECTION`에서 내부 테이블이 채워지고 `END-OF-SELECTION`에서 그 데이터를 읽는 흐름을 debugger로 본다.
4. 신규 단순 report라면 같은 흐름을 `START-OF-SELECTION` 안에서 더 명확하게 표현할 수 있는지 검토한다.

### 체험 설계

학습 장치는 "기존 코드 독해 모드"로 설계한다.

- 버튼: `legacy report 보기`, `신규 단순 report로 정리`.
- 상태: logical database 사용 여부, 조회 위치, 표시 위치.
- 피드백: `END-OF-SELECTION`을 필수 event로 선택하면 "필수 아님. 기존 코드 독해와 legacy 맥락에서 이해" 경고를 보여 준다.

### 실수와 주의

- `END-OF-SELECTION`을 신규 report의 권장 마무리 event로 가르치지 않는다.
- 입력 검증을 `END-OF-SELECTION`에 넣으면 너무 늦다.
- 단순 report에서 event를 많이 나누는 것이 항상 더 좋은 설계는 아니다.
- `END-OF-SELECTION`을 만나면 먼저 "왜 여기에 있는가"를 읽어야 한다.

### 정리

`END-OF-SELECTION`은 classic report 독해에 필요하지만, CH15에서 신규 report 표준으로 권장할 event는 아니다. 기본 설계는 `START-OF-SELECTION` 중심으로 충분히 설명하고, `END-OF-SELECTION`은 legacy와 logical database 경계를 표시한다.

## CH15-L07 - 존재 검증과 AUTHORITY-CHECK

### 왜 필요한가

사용자가 입력한 공연 ID가 실제로 존재하지 않으면 조회 결과가 비어 있을 수 있다. 이 경우 단순히 "결과 없음"이라고 보여 주는 것보다 "존재하지 않는 공연 ID"라고 바로 알려 주는 편이 좋다. 또 공연 ID가 존재하더라도 현재 사용자가 볼 권한이 없을 수 있다.

존재 검증과 권한 검증은 서로 다른 질문이다.

- 존재 검증: 이 코드가 데이터베이스에 있는가?
- 권한 검증: 현재 사용자가 이 코드에 접근할 수 있는가?

### 무엇인가

존재 검증은 `SELECT SINGLE`과 `sy-subrc`로 판단한다. 권한 검증은 `AUTHORITY-CHECK OBJECT`와 `sy-subrc`로 판단한다.

예:

```abap
PARAMETERS p_conc TYPE zconcert-concert_id.

DATA gv_conc TYPE zconcert-concert_id.

AT SELECTION-SCREEN ON p_conc.
  IF p_conc IS INITIAL.
    MESSAGE e001(zmc_concert).
  ENDIF.

  SELECT SINGLE concert_id
    FROM zconcert
    INTO gv_conc
    WHERE concert_id = p_conc.

  IF sy-subrc <> 0.
    MESSAGE e003(zmc_concert) WITH p_conc.
  ENDIF.

  AUTHORITY-CHECK OBJECT 'Z_CONCERT'
    ID 'ZCONC' FIELD p_conc
    ID 'ACTVT' FIELD '03'.

  IF sy-subrc <> 0.
    MESSAGE e004(zmc_concert) WITH p_conc.
  ENDIF.
```

`ACTVT` 값 `03`은 조회 권한을 의미하는 대표 값으로 자주 사용된다. 실제 시스템에서는 authorization object와 field 이름이 프로젝트별로 다르므로 보안 설계자가 정의한 값을 따른다.

### 어떻게 확인하는가

1. 빈 공연 ID를 입력한다. 필수 입력 message가 나오는지 확인한다.
2. 존재하지 않는 공연 ID를 입력한다. 존재 검증 message가 나오는지 확인한다.
3. 존재하지만 권한이 없는 공연 ID를 입력한다. `AUTHORITY-CHECK` 뒤 `sy-subrc`가 0이 아닌지 확인한다.
4. 정상 권한이 있는 공연 ID를 입력한다. `START-OF-SELECTION`까지 진행되는지 확인한다.

### 체험 설계

학습 장치는 "검증 게이트 2단계"로 설계한다.

- 게이트 1: DB 존재 검증.
- 게이트 2: 권한 검증.
- 입력 시나리오: 빈 값, 없는 값, 권한 없는 값, 정상 값.
- 상태: `SELECT SINGLE sy-subrc`, `AUTHORITY-CHECK sy-subrc`, 최종 진행 여부.
- 피드백: 권한 오류와 존재 오류를 같은 message로 처리하면 "사용자가 무엇을 고쳐야 하는지 알 수 없음" 경고를 띄운다.

### 실수와 주의

- 존재 검증과 권한 검증을 하나로 뭉개지 않는다.
- `AUTHORITY-CHECK` 뒤에는 반드시 `sy-subrc`를 확인한다.
- 권한 객체 이름과 field 이름은 프로젝트마다 다르다. 예제의 `Z_CONCERT`, `ZCONC`는 교육용 명명이다.
- 권한 설계, role, profile, SU24 심화는 CH15 범위가 아니다.

### 정리

selection screen 검증은 단순 문법 검사가 아니다. 사용자가 입력한 값이 실제로 존재하는지, 현재 사용자가 접근 가능한지 확인하는 업무 관문이다.

## CH15-L08 - Selection Screen 고급 이벤트

### 왜 필요한가

field 하나만 검증하는 화면은 단순하다. 그러나 실무 selection screen에는 관련 field 묶음, radio button 선택, F1 도움말, F4 값 도움말 같은 반응이 필요하다. CH15-L08은 selection screen event를 한 단계 더 넓힌다.

### 무엇인가

대표 고급 event는 다음과 같다.

| Event | 사용 상황 |
| --- | --- |
| `AT SELECTION-SCREEN ON BLOCK b1` | block 안의 여러 값 조합 검증 |
| `AT SELECTION-SCREEN ON RADIOBUTTON GROUP g1` | radio group 기준 검증 |
| `AT SELECTION-SCREEN ON HELP-REQUEST FOR p_field` | F1 도움말 직접 처리 |
| `AT SELECTION-SCREEN ON VALUE-REQUEST FOR p_field` | F4 값 도움말 직접 처리 |

block 검증 예:

```abap
SELECTION-SCREEN BEGIN OF BLOCK b_date WITH FRAME TITLE text-001.
PARAMETERS: p_from TYPE d,
            p_to   TYPE d.
SELECTION-SCREEN END OF BLOCK b_date.

AT SELECTION-SCREEN ON BLOCK b_date.
  IF p_from IS INITIAL OR p_to IS INITIAL.
    MESSAGE '조회 기간을 모두 입력하세요' TYPE 'E'.
  ENDIF.

  IF p_from > p_to.
    MESSAGE '시작일이 종료일보다 늦습니다' TYPE 'E'.
  ENDIF.
```

radio group 검증 예:

```abap
PARAMETERS: p_all  RADIOBUTTON GROUP g1 DEFAULT 'X',
            p_open RADIOBUTTON GROUP g1,
            p_paid RADIOBUTTON GROUP g1.

AT SELECTION-SCREEN ON RADIOBUTTON GROUP g1.
  IF p_paid = 'X' AND p_all = 'X'.
    MESSAGE '하나의 조회 방식만 선택하세요' TYPE 'E'.
  ENDIF.
```

F1 도움말 예:

```abap
PARAMETERS p_conc TYPE zconcert-concert_id.

AT SELECTION-SCREEN ON HELP-REQUEST FOR p_conc.
  MESSAGE '공연 ID는 ZCONCERT에 등록된 번호입니다' TYPE 'I'.
```

F4 값 도움말 예:

```abap
PARAMETERS p_carr TYPE scarr-carrid.

DATA gt_scarr TYPE TABLE OF scarr.

AT SELECTION-SCREEN ON VALUE-REQUEST FOR p_carr.
  SELECT carrid carrname
    FROM scarr
    INTO CORRESPONDING FIELDS OF TABLE gt_scarr.

  CALL FUNCTION 'F4IF_INT_TABLE_VALUE_REQUEST'
    EXPORTING
      retfield    = 'CARRID'
      dynpprog    = sy-repid
      dynpnr      = sy-dynnr
      dynprofield = 'P_CARR'
    TABLES
      value_tab   = gt_scarr.
```

DDIC search help가 있으면 우선 DDIC 기반 F4를 쓰는 것이 자연스럽다. 코드로 F4를 만드는 방식은 값 목록이 동적이거나 화면 상황에 따라 달라지는 경우에 의미가 있다.

### 어떻게 확인하는가

1. 날짜 block에서 시작일과 종료일을 바꿔 실행한다.
2. radio button을 바꿔 해당 group event가 발생하는지 확인한다.
3. `p_conc`에서 F1을 눌러 help event가 실행되는지 본다.
4. `p_carr`에서 F4를 눌러 value request function module이 호출되는지 확인한다.

### 체험 설계

학습 장치는 "event trigger map"으로 설계한다.

- 화면 구성: block, radio group, F1 field, F4 field를 나란히 표시.
- 버튼: `Block 검증`, `Radio 변경`, `F1`, `F4`.
- 상태: 발생한 event 이름, 검증 대상, message 결과.
- 데이터: F4 후보 table을 팝업 목록처럼 보여 준다.
- 피드백: F4가 필요한 field에 DDIC search help가 이미 있으면 "코드 F4보다 DDIC search help 우선 검토" 안내를 표시한다.

### 실수와 주의

- block event는 block 안의 조합 검증에 적합하다.
- radio group의 개별 field를 일반 field event처럼 다루려 하지 않는다.
- F1, F4 event는 selection screen의 일반 실행 흐름과 다르게 사용자가 도움말을 요청할 때 발생한다.
- 복잡한 F4에서 화면의 최신 값을 읽어야 하는 경우 별도 API가 필요할 수 있다. CH15에서는 기본 구조만 다룬다.

### 정리

selection screen event는 전체 검증만 있는 것이 아니다. block, radio group, F1, F4처럼 사용자 행동과 화면 구조에 맞춘 event를 선택하면 입력 경험이 훨씬 정확해진다.

## CH15-L09 - Selection Screen UI 구성

### 왜 필요한가

조건이 많아지면 selection screen이 지저분해진다. 모든 field를 세로로 나열하면 사용자는 무엇이 필수이고, 어떤 조건끼리 묶이는지 알기 어렵다. CH15-L09는 selection screen을 학습자가 읽을 수 있는 화면으로 구성하는 방법을 다룬다.

### 무엇인가

대표 UI 요소는 다음과 같다.

| 요소 | 역할 |
| --- | --- |
| `BLOCK` | 관련 조건 묶음 |
| `COMMENT` | 화면 설명 text |
| `ULINE`, `SKIP` | 구분선과 빈 줄 |
| `BEGIN OF LINE`, `POSITION` | 한 줄 배치 |
| `AS CHECKBOX` | 참 또는 거짓 선택 |
| `RADIOBUTTON GROUP` | 여러 선택 중 하나 |
| `PUSHBUTTON` | selection screen 본문 버튼 |
| `FUNCTION KEY 1`부터 `5` | application toolbar 버튼 |
| `TABBED BLOCK` | 조건 영역을 tab으로 분리 |

기본 구성 예:

```abap
TABLES sscrfields.

SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE text-001.
PARAMETERS: p_conc TYPE zconcert-concert_id OBLIGATORY,
            p_all  AS CHECKBOX DEFAULT 'X'.
SELECTION-SCREEN SKIP.
SELECTION-SCREEN COMMENT /1(40) text-002.
SELECTION-SCREEN ULINE.
PARAMETERS: p_open RADIOBUTTON GROUP g1 DEFAULT 'X',
            p_paid RADIOBUTTON GROUP g1.
SELECTION-SCREEN PUSHBUTTON /1(20) text-003 USER-COMMAND ref.
SELECTION-SCREEN END OF BLOCK b1.

SELECTION-SCREEN FUNCTION KEY 1.

INITIALIZATION.
  sscrfields-functxt_01 = '새로고침'.

AT SELECTION-SCREEN.
  CASE sscrfields-ucomm.
    WHEN 'REF'.
      MESSAGE '조건을 다시 계산했습니다' TYPE 'S'.
    WHEN 'FC01'.
      MESSAGE '툴바 기능키를 눌렀습니다' TYPE 'I'.
  ENDCASE.
```

중요한 구분은 `PUSHBUTTON`과 `FUNCTION KEY`다.

- `PUSHBUTTON`: selection screen 본문에 놓는 버튼이다. `USER-COMMAND` 값을 지정한다.
- `FUNCTION KEY`: application toolbar에 놓는 버튼이다. `TABLES sscrfields`와 `sscrfields-functxt_01`, `sscrfields-ucomm`으로 다룬다.

`TABBED BLOCK`은 여러 조건 영역을 tab으로 나눌 때 사용한다. 각 tab은 실제 내용을 담는 subscreen selection screen과 연결되어야 하므로 CH15에서는 구조와 주의점을 소개하고, 복잡한 화면 프로그램은 CH16 이후로 넘긴다.

### 어떻게 확인하는가

1. block title이 text symbol과 연결되는지 확인한다.
2. checkbox와 radio button의 값이 실행 전후에 어떻게 변하는지 본다.
3. 본문 pushbutton을 눌렀을 때 `sscrfields-ucomm` 값이 지정한 command로 들어오는지 본다.
4. toolbar function key를 눌렀을 때 `FC01`이 들어오는지 본다.
5. tabbed block 예제를 볼 때 subscreen 연결이 빠지지 않았는지 확인한다.

### 체험 설계

학습 장치는 "selection screen 빌더"로 설계한다.

- 팔레트: Block, Comment, Checkbox, Radio group, Pushbutton, Function key, Tabbed block.
- 미리보기: 실제 selection screen에 가까운 wireframe.
- 상태: 선택된 요소의 ABAP 선언, command 값, text symbol 연결 여부.
- 버튼: `요소 추가`, `command 확인`, `실행 시뮬레이션`.
- 피드백: pushbutton을 추가하고 `USER-COMMAND`를 빼면 "버튼은 보이지만 처리 분기가 어려움" 경고를 표시한다.

### 실수와 주의

- 화면 text를 code literal로만 관리하면 번역과 유지보수가 어렵다. title과 comment는 text symbol을 우선 고려한다.
- 본문 pushbutton과 toolbar function key를 같은 것으로 설명하면 안 된다.
- selection screen command 처리는 `sscrfields-ucomm` 기준으로 설명한다.
- checkbox는 값 하나, radio group은 그룹 안에서 하나만 선택된다는 차이를 명확히 한다.
- tabbed block은 단순 장식이 아니라 subscreen 연결이 필요한 구조다.

### 정리

selection screen UI 구성은 보기 좋은 화면을 만드는 작업이 아니라 사용자가 조건의 의미와 범위를 정확히 이해하게 하는 작업이다. block으로 묶고, text로 안내하고, checkbox와 radio로 선택 방식을 명확히 하며, 버튼 command를 정확히 처리한다.

## CH15-L10 - PARAMETERS와 SELECT-OPTIONS 옵션 정리

### 왜 필요한가

CH12에서 `SELECT-OPTIONS`를 배웠고, CH15에서 selection screen event를 배웠다. 이제 각 입력 field를 선언할 때 붙일 수 있는 옵션을 한 번 정리해야 한다. 이 옵션들은 화면 모양, 필수 여부, 기본값, memory 연결, 동적 화면 제어에 직접 영향을 준다.

### 무엇인가

`PARAMETERS` 주요 옵션:

| 옵션 | 의미 | 예 |
| --- | --- | --- |
| `TYPE` | ABAP type 지정 | `PARAMETERS p_date TYPE d.` |
| `LIKE` | 기존 object와 같은 type | `PARAMETERS p_conc LIKE zconcert-concert_id.` |
| `DECIMALS` | packed number 소수 자리 | `PARAMETERS p_amt TYPE p DECIMALS 2.` |
| `OBLIGATORY` | 필수 입력 | `PARAMETERS p_conc TYPE zconcert-concert_id OBLIGATORY.` |
| `DEFAULT` | 기본값 | `PARAMETERS p_curr TYPE c LENGTH 3 DEFAULT 'KRW'.` |
| `LOWER CASE` | 소문자 유지 | `PARAMETERS p_text TYPE c LENGTH 20 LOWER CASE.` |
| `AS CHECKBOX` | checkbox field | `PARAMETERS p_all AS CHECKBOX.` |
| `RADIOBUTTON GROUP` | radio group | `PARAMETERS p_r1 RADIOBUTTON GROUP g1.` |
| `MEMORY ID` | SAP memory parameter 연결 | `PARAMETERS p_bukrs TYPE bukrs MEMORY ID buk.` |
| `VALUE CHECK` | DDIC value check | DDIC 기반 입력값 확인 |
| `MODIF ID` | 동적 화면 제어 그룹 | `PARAMETERS p_adv TYPE c LENGTH 10 MODIF ID adv.` |

`SELECT-OPTIONS` 주요 옵션:

| 옵션 | 의미 |
| --- | --- |
| `DEFAULT low TO high` | 초기 range 값 |
| `OBLIGATORY` | range 입력 필수 |
| `NO-EXTENSION` | 여러 줄 확장 버튼 제한 |
| `NO INTERVALS` | interval 입력 제한 |
| `LOWER CASE` | 문자 입력 소문자 유지 |
| `MEMORY ID` | SAP memory parameter 연결 |
| `MODIF ID` | screen group 지정 |

`MODIF ID`와 screen 제어 연결 예:

```abap
PARAMETERS: p_adv  AS CHECKBOX,
            p_note TYPE c LENGTH 40 MODIF ID det.

DATA gs_screen TYPE screen.

AT SELECTION-SCREEN OUTPUT.
  LOOP AT SCREEN INTO gs_screen.
    IF gs_screen-group1 = 'DET' AND p_adv IS INITIAL.
      gs_screen-active = '0'.
      MODIFY SCREEN FROM gs_screen.
    ENDIF.
  ENDLOOP.
```

### 어떻게 확인하는가

1. `OBLIGATORY` field를 비우고 실행해 본다.
2. `DEFAULT` 값이 selection screen 최초 표시 전에 들어오는지 확인한다.
3. lowercase 입력이 유지되는 field와 자동 변환되는 field를 비교한다.
4. `NO INTERVALS`를 적용한 `SELECT-OPTIONS`에서 high field가 제한되는지 확인한다.
5. `MODIF ID` field가 `screen-group1`으로 묶여 제어되는지 확인한다.

### 체험 설계

학습 장치는 "옵션 비교 테이블"로 설계한다.

- 왼쪽: 옵션 토글 목록.
- 오른쪽: selection screen field 미리보기.
- 상태: 필수 여부, 기본값, 여러 줄 가능 여부, interval 가능 여부, group id.
- 버튼: `옵션 적용`, `실행 검사`, `screen group 보기`.
- 피드백: `LOWER CASE`를 숫자형 field에 붙이려는 조합을 선택하면 "문자 입력 유지 목적의 옵션"이라고 설명한다.

### 실수와 주의

- `OBLIGATORY`는 모든 업무 규칙을 대신하지 않는다. 날짜 순서 같은 조합 검증은 event에서 해야 한다.
- `DEFAULT`와 `INITIALIZATION`을 혼동하지 않는다. 간단한 고정 기본값은 선언 옵션으로도 가능하고, 조건부 기본값은 event가 더 적합하다.
- `NO INTERVALS`는 interval 입력을 제한하지만 range table 성격이 완전히 사라지는 것은 아니다.
- `MODIF ID`는 화면 제어를 위한 group 연결이다. 검증 로직의 업무 그룹과 개념을 섞지 않는다.

### 정리

selection screen field 옵션은 입력 경험을 정의하는 작은 설계 도구다. 필수 여부, 기본값, 입력 형태, 동적 제어 group을 선언 단계에서 명확히 하면 event 로직도 단순해진다.

## CH15-L11 - 여러 Selection Screen, CALL, Variant

### 왜 필요한가

기본 selection screen 1000 하나로 충분한 report도 많지만, 실무에서는 "고급 조건"을 별도 작은 창으로 열거나, 반복 사용하는 조건 세트를 variant로 저장해야 할 때가 있다. CH15-L11은 selection screen이 하나만 있는 것이 아니라는 감각을 만든다.

### 무엇인가

기본 selection screen은 report의 기본 입력 화면이며 일반적으로 1000번 화면으로 다뤄진다. 별도 selection screen을 정의하고 `CALL SELECTION-SCREEN`으로 호출할 수도 있다.

예:

```abap
TABLES sscrfields.

PARAMETERS p_conc TYPE zconcert-concert_id.

SELECTION-SCREEN FUNCTION KEY 1.

SELECTION-SCREEN BEGIN OF SCREEN 1100 AS WINDOW TITLE text-010.
PARAMETERS: p_from TYPE d,
            p_to   TYPE d.
SELECTION-SCREEN END OF SCREEN 1100.

INITIALIZATION.
  sscrfields-functxt_01 = '고급조건'.

AT SELECTION-SCREEN.
  CASE sscrfields-ucomm.
    WHEN 'FC01'.
      CALL SELECTION-SCREEN 1100 STARTING AT 10 5.
      IF sy-subrc = 0.
        MESSAGE '고급 조건을 적용했습니다' TYPE 'S'.
      ELSE.
        MESSAGE '고급 조건 적용을 취소했습니다' TYPE 'S'.
      ENDIF.
  ENDCASE.
```

variant는 selection screen 값 세트를 저장해 재사용하는 기능이다. 매일 같은 조건으로 report를 실행하거나 batch job에서 같은 조건을 쓰는 경우 유용하다. 다만 batch job과 운영 스케줄링은 CH35 범위이므로 CH15에서는 "조건 세트 저장과 재사용"까지만 다룬다.

### 어떻게 확인하는가

1. 기본 selection screen에서 toolbar function key를 누른다.
2. 별도 screen 1100이 작은 창으로 열리는지 확인한다.
3. 확인과 취소에 따라 `sy-subrc`가 어떻게 달라지는지 본다.
4. report 실행 화면에서 variant를 저장하고 다시 불러와 값이 복원되는지 확인한다.

### 체험 설계

학습 장치는 "고급 조건 팝업 실습"으로 설계한다.

- 기본 화면: 공연 ID만 표시.
- toolbar button: `고급조건`.
- 팝업 화면: 날짜 시작, 날짜 종료.
- 상태: popup open 여부, `sy-subrc`, 적용된 조건.
- 피드백: 취소했는데 조건이 적용된 것처럼 처리하면 "CALL 결과 확인 누락" 경고를 표시한다.

### 실수와 주의

- 별도 selection screen은 화면 번호와 호출 위치를 명확히 관리해야 한다.
- `CALL SELECTION-SCREEN` 후 `sy-subrc`를 확인하지 않으면 사용자가 취소했는지 알기 어렵다.
- variant는 값 저장 기능이지 업무 검증을 대신하지 않는다.
- batch job과 variant의 운영 활용은 CH35에서 더 깊게 다룬다.

### 정리

selection screen은 기본 화면 하나로 끝나지 않는다. 별도 screen을 호출해 고급 조건을 받을 수 있고, variant로 자주 쓰는 조건을 저장할 수 있다. 그러나 CH15에서는 입력 화면 흐름 이해에 집중하고 운영 자동화는 뒤로 넘긴다.

## CH15-L12 - 실습: 공연 예매 조회 리포트

### 왜 필요한가

마지막 실습은 event를 따로 외우는 것이 아니라 하나의 report 흐름으로 연결하는 과정이어야 한다. 사용자는 공연 ID를 입력하고, 기본값을 보고, 고급 조건 표시 여부를 바꾸고, 존재와 권한 검증을 통과한 뒤, 예매 목록을 조회한다. 이 과정 하나에 CH15의 핵심이 모두 들어 있다.

### 무엇인가

실습 report의 책임 배치는 다음과 같다.

| 위치 | 책임 |
| --- | --- |
| 선언부 | selection screen field, 내부 테이블, screen work area |
| `INITIALIZATION` | 기본 공연 ID와 toolbar text 준비 |
| `AT SELECTION-SCREEN OUTPUT` | 고급 조건 표시 제어 |
| `AT SELECTION-SCREEN ON p_conc` | 필수값, 존재, 권한 검증 |
| `AT SELECTION-SCREEN` | button command 처리 |
| `START-OF-SELECTION` | 예매 조회와 결과 표시 호출 |

통합 예제:

```abap
REPORT zch15_booking_report.

TABLES sscrfields.

PARAMETERS: p_conc TYPE zconcert-concert_id OBLIGATORY,
            p_adv  AS CHECKBOX DEFAULT 'X'.

PARAMETERS p_note TYPE c LENGTH 40 MODIF ID adv.

DATA: gt_booking TYPE TABLE OF zbooking,
      gv_conc    TYPE zconcert-concert_id,
      gs_screen  TYPE screen,
      go_alv     TYPE REF TO cl_salv_table.

SELECTION-SCREEN FUNCTION KEY 1.

INITIALIZATION.
  sscrfields-functxt_01 = '초기화'.

  SELECT SINGLE concert_id
    FROM zconcert
    INTO p_conc.

AT SELECTION-SCREEN OUTPUT.
  LOOP AT SCREEN INTO gs_screen.
    IF gs_screen-group1 = 'ADV' AND p_adv IS INITIAL.
      gs_screen-active = '0'.
      MODIFY SCREEN FROM gs_screen.
    ENDIF.
  ENDLOOP.

AT SELECTION-SCREEN ON p_conc.
  IF p_conc IS INITIAL.
    MESSAGE e001(zmc_concert).
  ENDIF.

  SELECT SINGLE concert_id
    FROM zconcert
    INTO gv_conc
    WHERE concert_id = p_conc.

  IF sy-subrc <> 0.
    MESSAGE e003(zmc_concert) WITH p_conc.
  ENDIF.

  AUTHORITY-CHECK OBJECT 'Z_CONCERT'
    ID 'ZCONC' FIELD p_conc
    ID 'ACTVT' FIELD '03'.

  IF sy-subrc <> 0.
    MESSAGE e004(zmc_concert) WITH p_conc.
  ENDIF.

AT SELECTION-SCREEN.
  CASE sscrfields-ucomm.
    WHEN 'FC01'.
      CLEAR p_note.
      MESSAGE '추가 조건을 초기화했습니다' TYPE 'S'.
  ENDCASE.

START-OF-SELECTION.
  SELECT *
    FROM zbooking
    INTO TABLE gt_booking
    WHERE concert_id = p_conc.

  IF gt_booking IS INITIAL.
    MESSAGE '조회된 예매가 없습니다' TYPE 'S'.
  ELSE.
    TRY.
        cl_salv_table=>factory(
          IMPORTING
            r_salv_table = go_alv
          CHANGING
            t_table      = gt_booking ).
        go_alv->display( ).
      CATCH cx_salv_msg.
        MESSAGE 'ALV 표시 중 오류가 발생했습니다' TYPE 'E'.
    ENDTRY.
  ENDIF.
```

이 예제의 SALV 부분은 CH11에서 배운 표시 기술을 다시 사용하는 것이고, `TRY ... CATCH`는 CH20에서 더 깊게 다룬다. CH15의 핵심은 SALV가 아니라 event별 책임 배치다.

### 어떻게 확인하는가

1. 프로그램을 실행하고 `INITIALIZATION`에서 function key text와 기본 공연 ID가 준비되는지 확인한다.
2. `p_adv`를 끄고 Enter를 눌러 `p_note`가 숨겨지는지 확인한다.
3. 존재하지 않는 공연 ID를 입력해 `AT SELECTION-SCREEN ON p_conc`에서 message가 발생하는지 본다.
4. 권한이 없는 공연 ID를 입력해 `AUTHORITY-CHECK` 뒤 message가 발생하는지 본다.
5. 정상 공연 ID로 실행해 `START-OF-SELECTION`에서 `gt_booking`이 채워지는지 본다.
6. 결과가 있으면 SALV 표시가 호출되는지 확인한다.

debugger 관찰 지점:

- `INITIALIZATION`: `p_conc`, `sscrfields-functxt_01`
- `AT SELECTION-SCREEN OUTPUT`: `gs_screen-name`, `gs_screen-group1`, `gs_screen-active`
- `AT SELECTION-SCREEN ON p_conc`: `gv_conc`, `sy-subrc`, 권한 체크 결과
- `AT SELECTION-SCREEN`: `sscrfields-ucomm`
- `START-OF-SELECTION`: `gt_booking`

### 체험 설계

최종 학습 장치는 "공연 예매 리포트 실행 시뮬레이터"로 설계한다.

- 화면 1: selection screen 모사 화면.
- 화면 2: event timeline.
- 화면 3: 내부 상태 panel.
- 버튼: `기본값 주입`, `고급조건 토글`, `없는 공연 입력`, `권한 없는 공연 입력`, `정상 실행`, `초기화 기능키`.
- 상태: `p_conc`, `p_adv`, `p_note`, `sscrfields-ucomm`, `sy-subrc`, `gt_booking row count`.
- 피드백: 각 버튼을 누를 때 어느 event가 실행되는지 timeline에 불이 들어온다.
- 데이터: 예제 공연 3건, 예매 5건, 권한 허용 목록 2건을 고정 데이터로 제공한다.

### 실수와 주의

- 예제의 message class `ZMC_CONCERT`는 실습 전에 SE91에서 만들어야 한다.
- 예제의 authorization object `Z_CONCERT`는 교육용이다. 실제 시스템에서는 이미 정의된 object를 따른다.
- `SELECT SINGLE` 기본 공연 ID 조회는 데모 편의를 위한 것이다. 실제 운영 report에서는 기본값 정책을 명확히 정해야 한다.
- SALV와 exception은 CH15의 주제가 아니므로 event 책임 설명을 흐리지 않을 정도로만 사용한다.
- 이 통합 실습에서는 `END-OF-SELECTION`을 넣지 않는다. 신규 단순 report는 `START-OF-SELECTION` 중심으로 명확하게 구성할 수 있음을 보여 준다.

### 정리

CH15의 완성 기준은 event 이름을 외우는 것이 아니다. "기본값, 화면 조정, 입력 검증, command 처리, 조회"를 각각 알맞은 event에 배치할 수 있어야 한다. 이 흐름을 이해하면 사용자가 실행 버튼을 누르기 전과 후에 ABAP runtime이 무엇을 해 주는지 읽을 수 있다.

## CH15 마무리 체크리스트

학습자는 CH15를 마친 뒤 다음 질문에 답할 수 있어야 한다.

1. 기본값은 왜 `INITIALIZATION`에 두는가?
2. `AT SELECTION-SCREEN OUTPUT`은 왜 화면 제어 위치인가?
3. 입력 검증은 왜 `START-OF-SELECTION`이 아니라 `AT SELECTION-SCREEN`에서 해야 하는가?
4. `MESSAGE TYPE 'E'`는 selection screen 문맥에서 어떤 흐름을 만드는가?
5. `AUTHORITY-CHECK`와 존재 검증은 왜 분리해야 하는가?
6. `PUSHBUTTON`과 `FUNCTION KEY`는 어떻게 다른가?
7. `sscrfields-ucomm`은 어떤 command 값을 담는가?
8. `END-OF-SELECTION`을 왜 신규 단순 report 표준처럼 가르치면 안 되는가?
9. `LOOP AT SCREEN INTO gs_screen`과 `MODIFY SCREEN FROM gs_screen`이 왜 함께 필요한가?
10. CH15 실습에서 각 event가 맡은 책임을 말할 수 있는가?

핵심 문장:

```text
INITIALIZATION은 기본값,
AT SELECTION-SCREEN OUTPUT은 화면 표시 직전 조정,
AT SELECTION-SCREEN은 입력 검증과 command 처리,
START-OF-SELECTION은 검증된 조건으로 업무 처리 시작,
END-OF-SELECTION은 legacy와 LDB 중심 기존 코드 독해 포인트다.
```
