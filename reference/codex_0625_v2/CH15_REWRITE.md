# CH15_REWRITE - codex_0625_v2 재작업 원고

> 대상: `content/abap/CH15`
> 기준 판정: `reference/codex_0625/00_QUALITY_REVIEW.md`
> 작성 범위: CH15 1개 챕터만. 원본 `content/abap`은 수정하지 않는다.
> 목표: v1의 반복 템플릿을 제거하고, Report Event와 Selection Screen 심화를 실제 강의자료 수준으로 재집필한다.

## CH15 전체 설계

CH15는 "사용자가 실행 버튼을 눌렀을 때 ABAP 리포트가 어떤 순서로 반응하는가"를 배우는 장이다. CH12에서 학습자는 `PARAMETERS`, `SELECT-OPTIONS`, Range Table을 사용해 조회 조건을 만들었다. CH13에서는 그 조건을 `SELECT`에 연결했고, CH11에서는 결과를 SALV로 보여 주었다. 하지만 아직 중요한 질문이 남아 있다.

- 기본값은 언제 넣어야 하는가.
- 화면을 보여 주기 직전에 입력칸을 숨기거나 막을 수 있는가.
- 사용자가 잘못 입력했을 때 어디에서 막아야 하는가.
- 검증이 끝난 뒤 실제 조회는 어디에 써야 하는가.
- 버튼, F1, F4, 보조 선택화면, variant는 어떤 흐름에서 움직이는가.

이 장의 핵심은 "리포트는 위에서 아래로 한 번만 흐르는 코드가 아니라, 선택화면 처리 이벤트와 실행 이벤트가 정해진 순서로 호출되는 프로그램"이라는 감각이다. 입문자는 처음에 `START-OF-SELECTION`만 보고 "여기가 main인가?"라고 이해하기 쉽다. CH15는 그 감각을 더 정확하게 만든다. `INITIALIZATION`은 선택화면이 처음 준비될 때 기본값을 넣고, `AT SELECTION-SCREEN OUTPUT`은 화면을 보내기 직전에 모양을 조정하며, `AT SELECTION-SCREEN` 계열 이벤트는 사용자의 입력과 버튼 행동을 검증한다. 그 다음에 `START-OF-SELECTION`에서 실제 업무 조회를 수행한다.

학습 경계:

- CH15는 classic-first 구간이다. ABAP 예제는 CH17 이전 기준으로 유지하고, inline declaration, constructor expression, object creation expression, modern Open SQL host marker, comma field list를 쓰지 않는다.
- New Open SQL 문법은 CH19 이후 범위다. CH15의 `SELECT` 예제는 classic Open SQL 형태로 둔다.
- `END-OF-SELECTION`은 공식문서상 logical database와 관련된 obsolete 성격의 이벤트다. 신규 리포트의 필수 마무리 이벤트처럼 가르치지 않고, 기존 리포트 독해와 커리큘럼상 출력 분리 예제로만 다룬다.
- `TRY...CATCH`, `TYPE REF TO`, SALV 호출은 CH11에서 사용한 결과 표시 흐름의 재사용이다. OO 원리와 exception class 체계는 CH20 범위로 남긴다.
- `AUTHORITY-CHECK`는 명시적 권한 확인의 입문으로 다룬다. 권한 객체 설계, role/profile 관리, SU24, 조직 레벨 권한 설계는 보안 심화 범위다.
- Selection Screen Variant와 batch 실행은 이름과 연결 감각만 다룬다. batch job 운영, spool, variant transport 정책은 CH35 이후 범위다.

수동 확인한 공식문서 근거:

| 문서 | CH15에서 쓰는 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abapinitialization.htm` | `INITIALIZATION`이 `LOAD-OF-PROGRAM` 뒤, selection screen processing 앞에 실행되고 기본값 초기화가 첫 호출에만 의미 있음을 확인 |
| `C:\ABAP_DOCU_HTML\abapload-of-program.htm` | `LOAD-OF-PROGRAM`은 프로그램 로드 시점의 constructor 성격이며 executable program 기본값에는 `INITIALIZATION`이 더 적합함을 확인 |
| `C:\ABAP_DOCU_HTML\abapstart-of-selection.htm` | `START-OF-SELECTION`은 selection screen 처리 뒤 실행되는 standard processing block이고, 명시 이벤트가 없으면 executable statements가 암묵적으로 여기에 배정됨을 확인 |
| `C:\ABAP_DOCU_HTML\abapend-of-selection.htm` | `END-OF-SELECTION`은 logical database 연결 executable program 중심의 obsolete syntax임을 확인 |
| `C:\ABAP_DOCU_HTML\abapat_selection-screen.htm` | selection screen event block의 기본 성격과 처리 시점을 확인 |
| `C:\ABAP_DOCU_HTML\abapat_selection-screen_events.htm` | `OUTPUT`, `ON field`, `ON BLOCK`, `ON RADIOBUTTON GROUP`, `ON HELP-REQUEST`, `ON VALUE-REQUEST`의 발생 시점과 경고/오류 메시지 후 입력 가능 상태를 확인 |
| `C:\ABAP_DOCU_HTML\abaploop_at_screen.htm` | `LOOP AT SCREEN INTO wa` 형태를 확인하고, 짧은 `LOOP AT SCREEN.` 내장 work area 형태는 피해야 함을 확인 |
| `C:\ABAP_DOCU_HTML\abapmodify_screen.htm` | `MODIFY SCREEN FROM wa`는 `LOOP AT SCREEN` 안에서 현재 screen element를 바꾸며, PBO 시점인 `AT SELECTION-SCREEN OUTPUT`에서 의미 있음을 확인 |
| `C:\ABAP_DOCU_HTML\abapparameters.htm` | `PARAMETERS`가 전역 elementary data object와 selection screen input field를 함께 만든다는 점을 확인 |
| `C:\ABAP_DOCU_HTML\abapparameters_screen.htm` | `OBLIGATORY`, checkbox, radiobutton, `USER-COMMAND`, `MODIF ID` 등 parameter screen options를 확인 |
| `C:\ABAP_DOCU_HTML\abapparameters_value.htm` | `DEFAULT`, `LOWER CASE`, `MATCHCODE OBJECT`, `MEMORY ID`, `VALUE CHECK`의 성격과 조합 제한을 확인 |
| `C:\ABAP_DOCU_HTML\abapselect-options.htm` | `SELECT-OPTIONS`가 selection table과 low/high 입력 필드, multiple selection pushbutton을 만든다는 점을 확인 |
| `C:\ABAP_DOCU_HTML\abapselect-options_screen.htm` | `OBLIGATORY`, `NO-EXTENSION`, `NO INTERVALS`, `MODIF ID`의 성격과 `NO INTERVALS`의 주의점을 확인 |
| `C:\ABAP_DOCU_HTML\abapselect-options_value.htm` | `DEFAULT ... TO ... OPTION ... SIGN ...`, `LOWER CASE`, `MEMORY ID`의 start value 규칙을 확인 |
| `C:\ABAP_DOCU_HTML\abapselection-screen.htm` | `SELECTION-SCREEN`이 selection screen layout을 만들고 바꾸는 문장군임을 확인 |
| `C:\ABAP_DOCU_HTML\abapselection-screen_definition.htm` | `BEGIN OF SCREEN`, `AS WINDOW`, subscreen 성격의 보조 selection screen 정의를 확인 |
| `C:\ABAP_DOCU_HTML\abapselection-screen_block.htm` | block과 `AT SELECTION-SCREEN ON BLOCK` 연결을 확인 |
| `C:\ABAP_DOCU_HTML\abapselection-screen_line.htm` | `BEGIN OF LINE`, `POSITION`, `POS_LOW`, `POS_HIGH`, line 안의 label 주의점을 확인 |
| `C:\ABAP_DOCU_HTML\abapselection-screen_comment.htm` | `COMMENT ... FOR FIELD`가 field help와 접근성 연결에 중요함을 확인 |
| `C:\ABAP_DOCU_HTML\abapselection-screen_pushbutton.htm` | pushbutton은 `USER-COMMAND`와 `SSCRFIELDS-UCOMM`으로 처리하며 프로그램 흐름 제어용으로 남용하지 말아야 함을 확인 |
| `C:\ABAP_DOCU_HTML\abapselection-screen_functionkey.htm` | function key 1~5는 `FC01`~`FC05`로 들어오며 `SSCRFIELDS`를 사용해야 함을 확인 |
| `C:\ABAP_DOCU_HTML\abapselection-screen_tabbed.htm` | tabbed block은 subscreen assignment가 필요하고 잘못 지정하면 runtime 문제가 생길 수 있음을 확인 |
| `C:\ABAP_DOCU_HTML\abapselection-screen_modif_id.htm` | `MODIF ID`가 `SCREEN-GROUP1`에 저장되어 동적 화면 제어에 쓰임을 확인 |
| `C:\ABAP_DOCU_HTML\abapcall_selection_screen.htm` | `CALL SELECTION-SCREEN`, modal 위치, `USING SELECTION-SET`, `sy-subrc` 0/4 의미를 확인 |
| `C:\ABAP_DOCU_HTML\abapmessage.htm` | `MESSAGE`가 text 또는 message class short text를 보내며 `WITH`, `INTO`, `RAISING`을 가질 수 있음을 확인 |
| `C:\ABAP_DOCU_HTML\abapmessage_msg.htm` | message class, type, number, `WITH` placeholder, `sy-msgid`, `sy-msgno`, `sy-msgty`, `sy-msgv1`~`sy-msgv4`를 확인 |
| `C:\ABAP_DOCU_HTML\abapmessage_into.htm` | `MESSAGE ... INTO`는 흐름을 끊지 않고 short text를 변수에 담는 형태임을 확인 |
| `C:\ABAP_DOCU_HTML\abapmessage_raising.htm` | `MESSAGE ... RAISING`은 non-class-based exception과 함수/메서드 호출 맥락의 기능임을 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_messages_types.htm` | message type `A`, `E`, `I`, `S`, `W`, `X`와 흐름 영향이 context-dependent임을 확인 |
| `C:\ABAP_DOCU_HTML\abapauthority-check.htm` | `AUTHORITY-CHECK OBJECT`, `ID ... FIELD`, `DUMMY`, `ACTVT`, `sy-subrc`, update 중 체크 제한을 확인 |

공식문서 교정 메모:

- v1의 CH15 문서 힌트는 selection screen과 무관한 조건문, JOIN, SELECT 문서가 섞여 있었다. v2는 CH15 이벤트와 화면 문장에 직접 관련된 문서만 근거로 남긴다.
- `LOOP AT SCREEN.`처럼 내장 `SCREEN` work area를 쓰는 짧은 형태는 공식문서에서 obsolete로 분류된다. v2 예제는 항상 `DATA gs_screen TYPE screen.`과 `LOOP AT SCREEN INTO gs_screen.`, `MODIFY SCREEN FROM gs_screen.` 형태로 쓴다.
- `END-OF-SELECTION`은 "조회 후 출력은 반드시 여기에 쓴다"로 설명하지 않는다. logical database가 없는 신규 리포트에서는 필수 이벤트가 아니며, 기존 classic report를 읽을 때 만날 수 있는 이벤트로 위치를 낮춘다.
- `AT SELECTION-SCREEN OUTPUT`에서 값을 대입하면 화면 전송 직전에 다시 화면에 반영되어 사용자가 이미 입력한 값을 덮어쓸 수 있다. 반복 초기화는 조심하고, 최초 기본값은 `INITIALIZATION`에 둔다.
- `ON HELP-REQUEST`와 `ON VALUE-REQUEST` 중에는 selection screen의 최신 값이 자동으로 ABAP 변수에 운반되지 않는다. 현재 화면 값을 읽어야 하는 복잡한 도움말은 별도 API가 필요하지만, CH15에서는 "단일 필드 F1/F4 반응"까지만 다룬다.
- Selection screen pushbutton, function key, tab user command는 `sy-ucomm`이 아니라 `SSCRFIELDS-UCOMM`으로 읽는다.
- `MESSAGE ... INTO`와 `MESSAGE ... RAISING`은 문법상 소개하되, CH15 report validation의 주력은 사용자에게 바로 피드백하는 `MESSAGE type WITH`이다.

CH15에서 계속 쓰는 작은 업무 모델:

```text
zconcert
concert_id  perf_name       concert_date  hall_id
C001        클래식 갈라      2026-07-01    H01
C002        재즈 나이트      2026-07-03    H02

zbooking
booking_id  concert_id  customer_name  status  amount
B001        C001        김민수         R       120000
B002        C001        이서연         C       120000
B003        C002        박지훈         R       70000

status 의미: R = 예약, C = 취소
```

이 데이터는 레슨마다 같은 질문으로 재사용한다.

1. 사용자가 조회할 공연을 선택하기 전에 기본 공연을 제안할 것인가.
2. 고급 조건은 항상 보여 줄 것인가, 필요할 때만 보여 줄 것인가.
3. 없는 공연 코드나 권한 없는 공연 코드는 언제 막을 것인가.
4. 검증이 끝난 뒤 어떤 event에서 `zbooking`을 읽을 것인가.
5. 조회 조건을 variant로 저장하거나 보조 selection screen으로 분리할 필요가 있는가.

---

## CH15-L01 - Report Event 전체 흐름

### 왜 필요한가

처음 ABAP 리포트를 배우면 코드를 위에서 아래로 읽으려는 습관이 강하다. 하지만 selection screen이 있는 executable program은 단순한 직선 흐름이 아니다. 사용자가 프로그램을 실행하면 시스템이 먼저 프로그램을 로드하고, 선택화면을 준비하고, 화면을 보여 주고, 사용자의 입력을 검증하고, 그 뒤에 실제 조회 로직을 실행한다. 이 순서를 모르면 기본값을 엉뚱한 위치에 넣거나, 입력 검증을 조회 뒤에 하거나, 화면 제어 코드를 실행되지 않는 곳에 쓰게 된다.

CH15-L01의 목표는 event 이름을 암기하는 것이 아니다. "이 코드는 사용자가 보기 전인가, 입력한 뒤인가, 실행 버튼 뒤인가"를 판단하는 기준을 만드는 것이다.

### 무엇인가

Executable report의 대표 event 흐름은 다음과 같이 이해한다.

| 순서 | 이벤트 | 입문자 관점의 질문 |
| --- | --- | --- |
| 1 | `LOAD-OF-PROGRAM` | 프로그램이 internal session에 로드되는 순간인가 |
| 2 | `INITIALIZATION` | 선택화면이 처음 나타나기 전 기본값을 넣는가 |
| 3 | `AT SELECTION-SCREEN OUTPUT` | 화면을 사용자에게 보내기 직전에 모양을 조정하는가 |
| 4 | `AT SELECTION-SCREEN` 계열 | 사용자가 입력하거나 버튼을 눌렀을 때 검증하는가 |
| 5 | `START-OF-SELECTION` | 검증이 끝난 뒤 실제 조회와 처리를 시작하는가 |
| 6 | `END-OF-SELECTION` | 기존 logical database 기반 리포트에서 마무리 이벤트를 만나는가 |

모든 리포트가 이 이벤트를 전부 써야 하는 것은 아니다. 단순 리포트는 `START-OF-SELECTION`만 명시해도 충분하다. 더 단순하게는 event keyword 없이 executable statement를 쓰는 경우도 있는데, 공식문서상 executable program에서 명시적 processing block이 없으면 그 문장들은 암묵적으로 `START-OF-SELECTION`에 속한 것처럼 처리된다. 학습자가 기존 코드를 읽을 때 이 규칙이 중요하다.

classic 예제:

```abap
PARAMETERS p_conc TYPE zconcert-concert_id.

INITIALIZATION.
  p_conc = 'C001'.

AT SELECTION-SCREEN.
  IF p_conc IS INITIAL.
    MESSAGE '공연 코드를 입력하세요' TYPE 'E'.
  ENDIF.

START-OF-SELECTION.
  WRITE: / '조회 시작:', p_conc.
```

이 코드는 세 시점을 나눈다. `INITIALIZATION`은 화면에 처음 보일 기본값을 만든다. `AT SELECTION-SCREEN`은 실행 전에 입력을 막는다. `START-OF-SELECTION`은 검증을 통과한 뒤 업무 처리를 시작한다.

### 어떻게 확인하는가

학습자는 event마다 `WRITE`를 넣어 확인하려고 할 수 있다. 하지만 selection screen 전에 발생한 이벤트의 출력은 기대한 위치에 바로 보이지 않을 수 있다. 그래서 CH15-L01은 화면 로그형 체험 장치를 쓰는 편이 좋다. 기존 embed `CH15-L01-S01`은 event lifecycle을 단계별로 보여 주는 데 적합하다.

확인 순서:

1. 프로그램 실행 버튼을 누르기 전 `LOAD-OF-PROGRAM`과 `INITIALIZATION`이 어떤 순서로 지나가는지 본다.
2. 선택화면이 나타나기 직전 `AT SELECTION-SCREEN OUTPUT`이 실행되는지 본다.
3. 잘못된 값을 넣고 실행했을 때 `AT SELECTION-SCREEN`에서 멈추는지 본다.
4. 올바른 값을 넣고 실행했을 때만 `START-OF-SELECTION`으로 넘어가는지 본다.

### 체험 설계

체험 장치 이름: "Report Event 타임라인"

- 데이터: `p_conc = C001`, `p_conc = 비어 있음`, `p_conc = C999` 세 입력 상태를 둔다.
- 버튼: `처음 실행`, `화면 다시 그리기`, `잘못된 입력으로 실행`, `정상 실행`, `뒤로 갔다 다시 실행`.
- 상태 표시: 현재 이벤트, selection screen field value, message area, 다음 이벤트 가능 여부를 분리해서 보여 준다.
- 피드백: 오류 메시지가 발생하면 `START-OF-SELECTION` 칸을 회색으로 잠그고, 어떤 event에서 멈췄는지 표시한다.
- 학습 포인트: `INITIALIZATION`은 최초 기본값, `OUTPUT`은 화면 직전, `AT SELECTION-SCREEN`은 입력 후, `START`는 검증 후라는 문장을 화면 아래에 고정한다.

### 실수와 주의

- `INITIALIZATION`에 조회 로직을 쓰면 사용자가 조건을 입력하기 전에 DB를 읽는 구조가 된다.
- `START-OF-SELECTION`에서 입력 오류를 처음 발견하면 사용자는 화면으로 돌아가는 피드백을 늦게 받는다. 입력 검증은 가능하면 selection screen event에서 한다.
- `LOAD-OF-PROGRAM`은 일반 report 기본값을 넣는 표준 위치로 가르치지 않는다. 사용자 interaction이나 blocking message를 두기에도 부적절하다.
- `END-OF-SELECTION`을 신규 리포트의 표준 마무리 event로 암기하지 않는다. CH15-L06에서 별도로 경계를 잡는다.

### 정리

Report event는 "코드를 나눠 쓰는 장식"이 아니라 사용자 실행 흐름의 체크포인트다. CH15 전체에서 학습자는 이 체크포인트마다 어떤 책임을 둘지 결정한다. 기본값은 `INITIALIZATION`, 화면 모양은 `AT SELECTION-SCREEN OUTPUT`, 입력 검증은 `AT SELECTION-SCREEN`, 실제 조회는 `START-OF-SELECTION`에 두는 것이 기본 감각이다.

---

## CH15-L02 - INITIALIZATION 기본값

### 왜 필요한가

사용자는 매번 빈 화면에서 시작하고 싶어 하지 않는다. 운영 리포트라면 오늘 날짜, 자주 보는 공연, 기본 상태 같은 값을 미리 넣어 두는 것이 자연스럽다. 하지만 기본값은 "언제든 값을 덮어써도 되는 코드"가 아니다. 사용자가 이미 화면에서 값을 바꿨는데, 화면이 다시 그려질 때마다 프로그램이 그 값을 초기값으로 되돌리면 사용자는 입력을 잃는다.

`INITIALIZATION`은 이 문제를 해결하기 위한 첫 위치다. 선택화면이 처음 나타나기 전에 기본값을 한 번 준비하는 데 적합하다.

### 무엇인가

`INITIALIZATION`은 executable program의 event block이다. 공식문서 기준으로 `LOAD-OF-PROGRAM` 바로 뒤, selection screen processing 전에 실행된다. 표준 selection screen의 parameter와 selection criterion에 기본값을 넣는 대표 위치다.

classic 예제:

```abap
DATA gv_dept TYPE c LENGTH 4.

PARAMETERS p_date TYPE d.
SELECT-OPTIONS s_dept FOR gv_dept.

INITIALIZATION.
  p_date = sy-datum.

  s_dept-sign = 'I'.
  s_dept-option = 'EQ'.
  s_dept-low = '1000'.
  APPEND s_dept.
```

여기서 `p_date`는 단일 입력값이고, `s_dept`는 selection table이다. `SELECT-OPTIONS`는 header line을 가진 selection table을 만들기 때문에 위 예제처럼 `sign`, `option`, `low`를 채운 뒤 `APPEND s_dept.`로 조건 행을 추가할 수 있다. CH12에서 배운 Range Table의 네 칸 구조가 그대로 연결된다.

### 어떻게 확인하는가

SE38 또는 ADT에서 report를 실행한 뒤 선택화면을 본다.

- `p_date`가 오늘 날짜로 채워졌는지 확인한다.
- `s_dept`의 multiple selection을 열어 `I/EQ/1000` 조건 행이 들어갔는지 확인한다.
- 값을 다른 날짜나 부서로 바꾼 뒤 실행한다.
- 뒤로 돌아왔을 때 사용자가 바꾼 값이 유지되는지 관찰한다.

중요한 관찰은 "처음 채우기"와 "매번 강제로 되돌리기"가 다르다는 점이다. `INITIALIZATION`은 기본값 제안에 가깝고, 사용자의 입력을 계속 이기는 강제 규칙이 아니다.

### 체험 설계

체험 장치 이름: "기본값 주입기"

- 데이터: 오늘 날짜, 기본 부서 `1000`, 사용자가 바꾼 부서 `2000`을 준비한다.
- 버튼: `최초 실행`, `사용자 값 입력`, `실행 후 뒤로`, `OUTPUT에서 매번 덮어쓰기 비교`.
- 상태 표시: program variable, screen field, selection table 첫 행을 나란히 보여 준다.
- 피드백: `INITIALIZATION`만 사용한 경우에는 사용자 값이 보존되는 흐름을 초록색으로 표시하고, `OUTPUT`에서 매번 값을 대입하는 경우에는 "사용자 입력이 덮어써짐" 경고를 표시한다.

### 실수와 주의

- `INITIALIZATION`에 사용자의 선택을 무조건 강제하는 검증을 넣지 않는다. 검증은 `AT SELECTION-SCREEN` 계열이 더 적합하다.
- `SELECT-OPTIONS`의 header line을 바꾸고 `APPEND`하지 않으면 selection table 조건 행이 추가되지 않는다.
- `s_dept-low`에 화면 표시용 텍스트를 넣으면 안 된다. `LOW`와 `HIGH`에는 해당 필드 타입에 맞는 내부 값이 들어가야 한다.
- 사용자가 화면으로 돌아왔을 때 값이 왜 유지되는지 이해하지 못하면 `INITIALIZATION`을 "매번 초기화"로 오해한다. 첫 실행 기본값이라는 표현을 유지한다.

### 정리

`INITIALIZATION`은 사용자에게 좋은 출발점을 제공하는 event다. 이 event를 쓰면 오늘 날짜, 기본 조직, 기본 상태를 미리 넣을 수 있다. 하지만 사용자의 입력을 계속 덮어쓰는 위치가 아니며, 반복 화면 제어는 `AT SELECTION-SCREEN OUTPUT`과 구분해야 한다.

---

## CH15-L03 - AT SELECTION-SCREEN OUTPUT과 동적 화면 제어

### 왜 필요한가

실무 리포트에는 "항상 보이면 오히려 방해되는 입력칸"이 많다. 기본 조회만 하는 사용자는 공연 코드와 날짜만 있으면 되지만, 운영 담당자는 내부 점검용 조건을 추가로 보고 싶을 수 있다. 이때 같은 report를 두 개 만들기보다, 선택화면이 그려지기 직전에 특정 필드를 숨기거나 비활성화할 수 있다.

`AT SELECTION-SCREEN OUTPUT`은 사용자가 화면을 보기 직전에 selection screen의 모양을 조정하는 event다.

### 무엇인가

`AT SELECTION-SCREEN OUTPUT`은 selection screen의 PBO 시점에 해당한다. 화면이 사용자에게 보내지기 전에 실행되므로, `LOOP AT SCREEN`으로 screen element를 순회하면서 `active`, `input`, `invisible`, `required` 같은 속성을 조정할 수 있다.

classic-safe 예제:

```abap
PARAMETERS: p_mode   TYPE c LENGTH 1,
            p_secret TYPE c LENGTH 10.

DATA gs_screen TYPE screen.

AT SELECTION-SCREEN OUTPUT.
  LOOP AT SCREEN INTO gs_screen.
    IF gs_screen-name = 'P_SECRET' AND p_mode <> 'A'.
      gs_screen-active = '0'.
      MODIFY SCREEN FROM gs_screen.
    ENDIF.
  ENDLOOP.
```

이 예제에서 `p_mode`가 `A`가 아니면 `P_SECRET` 필드를 화면에서 비활성 상태로 만든다. 공식문서 기준으로 짧은 `LOOP AT SCREEN.` 형태는 피한다. 반드시 `TYPE screen` work area를 선언하고 `LOOP AT SCREEN INTO gs_screen`, `MODIFY SCREEN FROM gs_screen` 형태로 쓴다.

### 어떻게 확인하는가

확인할 때는 "변수 값"과 "화면 상태"를 분리해서 본다.

1. `p_mode`를 비워 두고 실행하면 `p_secret`이 보이지 않거나 입력 불가 상태인지 본다.
2. `p_mode`에 `A`를 넣고 Enter를 눌러 화면이 다시 그려지게 한다.
3. `p_secret`이 다시 활성화되는지 본다.
4. debugger에서 `gs_screen-name`, `gs_screen-active` 값을 확인한다.

중요한 점은 `AT SELECTION-SCREEN OUTPUT`이 화면을 보낼 때마다 다시 실행된다는 것이다. 그래서 여기서 값을 대입하면 사용자의 입력을 덮어쓸 수 있다. 이 레슨에서는 화면 속성만 바꾸고 기본값 대입은 L02의 `INITIALIZATION`에 남겨 둔다.

### 체험 설계

체험 장치 이름: "SCREEN 속성 조정 패널"

- 데이터: 화면 요소 `P_MODE`, `P_SECRET`, `S_DATE-LOW`, `S_DATE-HIGH`를 가상 screen table 행으로 만든다.
- 버튼: `기본 모드`, `고급 모드`, `active 0 적용`, `input 0 적용`, `invisible 1 적용`.
- 상태 표시: 각 screen row의 `name`, `active`, `input`, `invisible`을 표로 보여 주고 오른쪽에 실제 화면 미리보기를 둔다.
- 피드백: `MODIFY SCREEN FROM gs_screen`을 누르기 전에는 미리보기가 바뀌지 않게 해서 "work area 수정"과 "화면 반영"을 구분시킨다.

### 실수와 주의

- `LOOP AT SCREEN.` 짧은 형태를 새 예제로 쓰지 않는다. 기존 코드 독해 때 만날 수는 있지만 v2 강의 예제는 명시 work area를 사용한다.
- `MODIFY SCREEN`은 `LOOP AT SCREEN` 안에서 의미가 있다. loop 밖에서 임의로 호출하는 문장으로 가르치지 않는다.
- `screen-name`은 대문자 field name 기준으로 비교한다. `p_secret`이 아니라 `P_SECRET`으로 확인하는 습관을 들인다.
- 사용자 입력값을 `OUTPUT`에서 계속 재대입하면 화면이 새로 그려질 때 입력이 사라진다.

### 정리

`AT SELECTION-SCREEN OUTPUT`은 화면을 보내기 직전의 조정 지점이다. 기본값을 넣는 `INITIALIZATION`, 입력을 검증하는 `AT SELECTION-SCREEN`, 실제 조회를 수행하는 `START-OF-SELECTION`과 역할을 섞지 않아야 한다. 이 event의 대표 작업은 `LOOP AT SCREEN INTO gs_screen`으로 screen element를 읽고 `MODIFY SCREEN FROM gs_screen`으로 속성을 반영하는 것이다.

---

## CH15-L04 - AT SELECTION-SCREEN 입력 검증과 MESSAGE 정식

### 왜 필요한가

리포트는 잘못된 조건으로 실행되기 전에 멈춰야 한다. 존재하지 않는 공연 코드로 DB를 조회하면 빈 결과가 나오고 끝날 수 있지만, 사용자는 "데이터가 없는 것인지, 코드를 잘못 입력한 것인지" 알기 어렵다. 시작일이 종료일보다 늦은 조건, 필수값 누락, 서로 맞지 않는 radio 선택도 조회 전에 막아야 한다.

`AT SELECTION-SCREEN`은 사용자의 입력이 프로그램 변수로 넘어온 뒤, 실제 `START-OF-SELECTION`으로 가기 전에 검증하는 대표 위치다. 이때 사용자에게 이유를 알려 주는 표준 도구가 `MESSAGE`다.

### 무엇인가

selection screen 검증은 범위에 따라 나눠 쓸 수 있다.

| 형태 | 언제 쓰는가 | 오류 시 느낌 |
| --- | --- | --- |
| `AT SELECTION-SCREEN ON p_field` | 특정 field 하나의 값만 검증 | 해당 field 중심으로 다시 입력 |
| `AT SELECTION-SCREEN ON BLOCK b1` | block 안의 관련 값을 묶어 검증 | block 단위 조건 검증 |
| `AT SELECTION-SCREEN` | 여러 필드 조합이나 버튼 처리를 마지막으로 검증 | 전체 화면 검증 |

message type은 단순 표시 방식이 아니라 흐름에 영향을 준다.

| Type | 입문자 설명 | selection screen 검증에서의 사용 |
| --- | --- | --- |
| `S` | 상태 메시지 | 성공 또는 안내. 흐름을 막지 않음 |
| `I` | 정보 팝업 | 확인 후 계속 진행 |
| `W` | 경고 | context에 따라 다시 입력 가능 상태가 될 수 있음 |
| `E` | 오류 | 실행을 막고 입력 화면으로 돌려보내는 검증에 적합 |
| `A` | 중단 | 일반 입력 검증용으로 쓰지 않음 |
| `X` | short dump | 의도적 dump 상황 외에는 쓰지 않음 |

message class를 사용하는 예:

```abap
PARAMETERS: p_from TYPE d,
            p_to   TYPE d.

AT SELECTION-SCREEN.
  IF p_from IS INITIAL OR p_to IS INITIAL.
    MESSAGE e001(zmc_concert).
  ENDIF.

  IF p_from > p_to.
    MESSAGE e002(zmc_concert) WITH p_from p_to.
  ENDIF.
```

SE91에서 message class `ZMC_CONCERT`를 만들고 다음 메시지를 등록한다고 가정한다.

```text
001 조회 시작일과 종료일을 모두 입력하세요.
002 시작일 &1 이 종료일 &2 보다 늦습니다.
```

`WITH` 뒤의 값은 message text의 `&1`, `&2`, `&3`, `&4`에 들어간다. 이 방식은 hard-coded text보다 번역과 표준 관리에 유리하다.

필드 단위 검증 예:

```abap
PARAMETERS p_conc TYPE zconcert-concert_id.

DATA gv_concert_id TYPE zconcert-concert_id.

AT SELECTION-SCREEN ON p_conc.
  IF p_conc IS INITIAL.
    MESSAGE e003(zmc_concert).
  ENDIF.

  SELECT SINGLE concert_id
    FROM zconcert
    INTO gv_concert_id
    WHERE concert_id = p_conc.

  IF sy-subrc <> 0.
    MESSAGE e004(zmc_concert) WITH p_conc.
  ENDIF.
```

`MESSAGE ... INTO`는 message short text를 변수에 담고 흐름을 끊지 않는 형태다. 예를 들어 로그용 텍스트를 만들 때 쓸 수 있다.

```abap
DATA gv_text TYPE string.

MESSAGE e004(zmc_concert) WITH p_conc INTO gv_text.
```

`MESSAGE ... RAISING`은 non-class-based exception과 함수/메서드 호출 맥락에서 의미가 있다. CH15의 report selection screen 검증에서는 깊게 확장하지 않고, "존재하는 문법이지만 사용자 입력 검증의 주력은 아니다" 정도로 위치를 잡는다.

### 어떻게 확인하는가

검증은 정상 케이스보다 실패 케이스를 먼저 확인해야 한다.

1. `p_from`만 입력하고 실행한다. `E` 메시지가 나오고 화면으로 돌아오는지 본다.
2. `p_from`이 `p_to`보다 늦은 날짜가 되게 입력한다. message text의 `&1`, `&2`가 실제 값으로 바뀌는지 본다.
3. 존재하지 않는 `p_conc`를 입력한다. `AT SELECTION-SCREEN ON p_conc`에서 멈추는지 본다.
4. 정상 값을 넣으면 `START-OF-SELECTION`으로 넘어가는지 본다.

### 체험 설계

체험 장치 이름: "검증 게이트와 메시지 콘솔"

- 데이터: 날짜 범위 세트, 존재하는 공연 `C001`, 없는 공연 `C999`, 비어 있는 입력을 제공한다.
- 버튼: `필드 검증 실행`, `전체 검증 실행`, `메시지 클래스 보기`, `WITH 값 바꾸기`.
- 상태 표시: 현재 이벤트, 검증 대상 field, `sy-msgid`, `sy-msgno`, `sy-msgty`, `sy-msgv1`~`sy-msgv4`, screen unlock 범위를 보여 준다.
- 피드백: `E` 메시지는 다음 단계인 `START-OF-SELECTION`을 잠그고, `S`나 `I` 메시지는 흐름이 계속되는 것으로 표현한다.

### 실수와 주의

- 입력 검증을 `START-OF-SELECTION`에만 두면 사용자는 조회가 시작된 뒤에야 오류를 알게 된다.
- `MESSAGE TYPE 'E'`를 어디서나 똑같이 이해하면 안 된다. 공식문서도 message behavior가 context-dependent라고 설명한다. CH15에서는 selection screen PAI 맥락으로 설명한다.
- message class의 `&1`~`&4`와 `WITH` 값 순서가 맞지 않으면 사용자에게 틀린 안내가 나간다.
- `MESSAGE ... INTO`는 화면에 메시지를 보내는 것이 아니라 text를 변수에 담는다. 오류로 멈추는 문장처럼 설명하지 않는다.
- `A`와 `X` type은 일반 입력 검증용으로 쓰지 않는다.

### 정리

`AT SELECTION-SCREEN`은 selection screen의 검문소다. 여기서 입력값을 확인하고, `MESSAGE`로 사용자가 고칠 수 있는 이유를 알려 준다. CH15에서 가장 중요한 실무 감각은 "조회 전에 막을 오류는 조회 전에 막는다"이다.

---

## CH15-L05 - START-OF-SELECTION 조회 시작

### 왜 필요한가

입력 검증이 끝나면 이제 실제 업무 처리를 시작해야 한다. 공연 예매 리포트라면 사용자가 입력한 공연 코드와 상태 조건으로 `zbooking`을 읽고 결과를 만든다. 이 로직을 `INITIALIZATION`에 쓰면 사용자가 조건을 입력하기 전에 조회하고, `AT SELECTION-SCREEN OUTPUT`에 쓰면 화면을 그릴 때마다 조회할 수 있다. 둘 다 좋은 위치가 아니다.

`START-OF-SELECTION`은 검증이 끝난 뒤 본 처리로 들어가는 표준 위치다.

### 무엇인가

공식문서 기준으로 `START-OF-SELECTION`은 executable program의 standard processing block이다. selection screen processing이 끝난 뒤 발생한다. 명시적 event block 없이 executable statement만 있는 report에서는 그 statement들이 암묵적으로 `START-OF-SELECTION`에 속한 것처럼 처리된다.

classic 예제:

```abap
DATA gv_status TYPE zbooking-status.

PARAMETERS p_conc TYPE zbooking-concert_id.
SELECT-OPTIONS s_stat FOR gv_status.

DATA gt_booking TYPE STANDARD TABLE OF zbooking.
DATA gs_booking TYPE zbooking.

START-OF-SELECTION.
  SELECT *
    FROM zbooking
    INTO TABLE gt_booking
    WHERE concert_id = p_conc
      AND status IN s_stat.

  IF sy-subrc <> 0.
    MESSAGE '조회된 예매가 없습니다' TYPE 'S'.
  ENDIF.

  LOOP AT gt_booking INTO gs_booking.
    WRITE: / gs_booking-booking_id,
             gs_booking-concert_id,
             gs_booking-customer_name,
             gs_booking-status,
             gs_booking-amount.
  ENDLOOP.
```

이 예제는 CH12의 `SELECT-OPTIONS`, CH13의 classic `SELECT`, CH08의 `sy-subrc` 감각을 CH15 event 흐름에 연결한다. `START-OF-SELECTION`은 "조회 버튼을 눌렀을 때 실행되는 아무 위치"가 아니라 "selection screen 처리가 끝난 뒤 본 처리로 들어가는 event"다.

### 어떻게 확인하는가

확인할 때는 event trace를 같이 본다.

1. 정상 `p_conc`와 상태 조건을 넣고 실행한다.
2. `AT SELECTION-SCREEN` 검증이 끝난 뒤 `START-OF-SELECTION` breakpoint에 도착하는지 본다.
3. `SELECT` 후 `sy-subrc`와 `sy-dbcnt`를 확인한다.
4. 조건을 바꿔 결과가 0건일 때 message가 표시되는지 본다.

### 체험 설계

체험 장치 이름: "조회 시작 게이트"

- 데이터: `zbooking` 5건, status `R/C`, 존재하지 않는 공연 코드를 준비한다.
- 버튼: `검증 통과`, `검증 실패`, `SELECT 실행`, `결과 루프 실행`.
- 상태 표시: event timeline, selection table 조건, SQL WHERE 해석, result count, `sy-subrc`.
- 피드백: 검증 실패 상태에서는 `SELECT 실행` 버튼을 비활성화한다. 검증 통과 뒤에만 `START-OF-SELECTION`이 열리는 구조로 만든다.

### 실수와 주의

- `START-OF-SELECTION`에 화면 속성 제어를 쓰지 않는다. 화면은 이미 지나간 뒤다.
- 빈 결과와 잘못된 입력을 구분한다. 존재하지 않는 코드 입력은 L04/L07에서 막고, 정상 조건이지만 결과가 없는 경우는 `S` 메시지나 빈 표 안내로 처리한다.
- `SELECT *`는 입문 예제에서는 구조를 보기 쉽지만, 실무에서는 필요한 필드 중심으로 줄이는 습관이 필요하다. CH15에서는 event 위치가 주제이므로 SQL 최적화 심화는 확장하지 않는다.

### 정리

`START-OF-SELECTION`은 본 처리의 시작점이다. selection screen이 사용자 입력을 받고 검증까지 마친 뒤, 실제 조회와 결과 준비를 여기서 수행한다. 이 위치를 정확히 잡으면 기본값, 화면 제어, 검증, 조회의 책임이 섞이지 않는다.

---

## CH15-L06 - END-OF-SELECTION의 위치와 경계

### 왜 필요한가

기존 SAP 시스템에는 `END-OF-SELECTION`이 들어간 오래된 리포트가 많다. 입문자는 이 코드를 보고 "모든 리포트는 조회를 `START-OF-SELECTION`에 쓰고 출력은 `END-OF-SELECTION`에 써야 하나?"라고 오해하기 쉽다. 공식문서 기준으로는 그렇게 단순하게 가르치면 안 된다.

CH15-L06의 목표는 `END-OF-SELECTION`을 무조건 권장하는 것이 아니라, 기존 classic report를 읽을 때 만나는 이벤트로 정확히 위치시키는 것이다.

### 무엇인가

`END-OF-SELECTION`은 logical database와 연결된 executable program에서 모든 데이터가 선택된 뒤 발생하는 이벤트로 설명된다. 공식문서에는 obsolete syntax로 표시되어 있고, logical database를 사용하지 않는 신규 리포트에서는 꼭 구현해야 할 이유가 없다.

다만 교육상 "조회 단계와 표시 단계를 분리한다"는 생각을 보여 주기 위해 제한적으로 사용할 수 있다. 이때도 "신규 리포트 표준 패턴"이 아니라 "기존 코드 독해와 단계 분리 예제"라고 명확히 말해야 한다.

제한적 예제:

```abap
PARAMETERS p_conc TYPE zbooking-concert_id.

DATA gt_booking TYPE STANDARD TABLE OF zbooking.
DATA lo_alv     TYPE REF TO cl_salv_table.

START-OF-SELECTION.
  SELECT *
    FROM zbooking
    INTO TABLE gt_booking
    WHERE concert_id = p_conc.

END-OF-SELECTION.
  IF gt_booking IS INITIAL.
    MESSAGE '표시할 예매가 없습니다' TYPE 'S'.
    RETURN.
  ENDIF.

  TRY.
      cl_salv_table=>factory(
        IMPORTING r_salv_table = lo_alv
        CHANGING  t_table      = gt_booking ).
      lo_alv->display( ).
    CATCH cx_salv_msg.
      MESSAGE 'ALV 표시 중 오류가 발생했습니다' TYPE 'E'.
  ENDTRY.
```

`TYPE REF TO`, `TRY...CATCH`, SALV 호출은 CH11에서 결과 표시를 위해 이미 사용한 흐름의 재사용이다. CH15-L06에서는 이 문법 자체를 깊게 설명하지 않는다.

### 어떻게 확인하는가

확인은 두 갈래로 한다.

1. 기존 report 독해: `START-OF-SELECTION`과 `END-OF-SELECTION`이 모두 있으면 각각 조회와 후처리 역할을 어떻게 나누는지 본다.
2. 신규 report 판단: logical database를 쓰지 않는 단순 report라면 `END-OF-SELECTION` 없이 `START-OF-SELECTION` 안에서 조회와 표시를 명확히 구성할 수 있는지 본다.

debugger로는 `START-OF-SELECTION`에서 `gt_booking`이 채워진 뒤 `END-OF-SELECTION`로 넘어가는 것을 확인한다. 하지만 이 확인이 "항상 이렇게 써야 한다"는 결론이 되면 안 된다.

### 체험 설계

체험 장치 이름: "기존 리포트 독해 모드"

- 데이터: `START`에 SELECT가 있는 report, `END`에 ALV 표시가 있는 report, `END` 없이 START에서 모두 처리하는 report를 나란히 둔다.
- 버튼: `logical database 사용`, `일반 SELECT 사용`, `END 제거 비교`.
- 상태 표시: 공식문서 경고 배지, event 호출 여부, 출력 위치를 보여 준다.
- 피드백: logical database가 없는 신규 report에서 `END-OF-SELECTION`을 필수처럼 선택하면 "필수 아님, 기존 코드 독해용으로만 유지" 경고를 띄운다.

### 실수와 주의

- `END-OF-SELECTION`을 신규 리포트의 권장 마무리 event로 가르치지 않는다.
- `END-OF-SELECTION`에 입력 검증을 넣지 않는다. 사용자는 이미 조회 흐름을 지나왔다.
- SALV 표시 예제 때문에 OO, exception class 설명을 CH15에서 확장하지 않는다. CH15의 주제는 report event 경계다.

### 정리

`END-OF-SELECTION`은 classic report 독해에서 알아야 하지만, 신규 단순 report의 필수 event는 아니다. CH15에서는 이 이벤트를 "공식문서상 obsolete 성격이 있는 legacy/LDB 중심 이벤트"로 정확히 경계 짓고, 학습자가 기존 시스템 코드를 읽을 때 혼란을 줄이는 데 사용한다.

---

## CH15-L07 - AUTHORITY-CHECK 권한과 존재 검증

### 왜 필요한가

없는 공연 코드를 입력한 경우와 볼 권한이 없는 공연 코드를 입력한 경우는 다르다. 전자는 데이터 존재 검증 문제이고, 후자는 보안 문제다. 둘을 구분하지 않으면 사용자는 잘못된 안내를 받고, 운영 시스템에서는 권한 없는 데이터 접근을 허용할 위험이 생긴다.

CH15-L07은 selection screen 검증 단계에서 "존재하는 값인가"와 "현재 사용자가 볼 수 있는 값인가"를 분리해 검사하는 감각을 만든다.

### 무엇인가

존재 검증은 DB에 해당 코드가 있는지 확인하는 작업이다. 권한 검증은 사용자 master와 role에 부여된 authorization object 값을 기준으로 접근 가능 여부를 확인하는 작업이다. ABAP에서는 명시적 권한 체크에 `AUTHORITY-CHECK OBJECT`를 사용한다.

classic 예제:

```abap
PARAMETERS p_conc TYPE zconcert-concert_id.

DATA gv_concert_id TYPE zconcert-concert_id.

AT SELECTION-SCREEN ON p_conc.
  SELECT SINGLE concert_id
    FROM zconcert
    INTO gv_concert_id
    WHERE concert_id = p_conc.

  IF sy-subrc <> 0.
    MESSAGE e004(zmc_concert) WITH p_conc.
  ENDIF.

  AUTHORITY-CHECK OBJECT 'Z_CONCERT'
    ID 'CONCERT' FIELD p_conc
    ID 'ACTVT'   FIELD '03'.

  IF sy-subrc <> 0.
    MESSAGE e005(zmc_concert) WITH p_conc.
  ENDIF.
```

`ACTVT`의 `03`은 일반적으로 display 활동을 의미하는 코드로 많이 사용된다. 실제 authorization object 이름과 field 이름은 시스템 설계에 따라 달라진다. 교육용으로 `Z_CONCERT`를 쓰지만, 실제 시스템에서는 SU21 등에서 정의된 authorization object와 field를 확인해야 한다.

### 어떻게 확인하는가

확인 시나리오를 세 개로 분리한다.

1. `C999`처럼 존재하지 않는 공연을 입력한다. `SELECT SINGLE` 검증에서 먼저 막히는지 본다.
2. 존재하지만 권한이 없는 공연을 입력한다. `AUTHORITY-CHECK` 후 `sy-subrc`가 0이 아닌지 본다.
3. 존재하고 권한도 있는 공연을 입력한다. `START-OF-SELECTION`으로 넘어가는지 본다.

debugger에서는 `AUTHORITY-CHECK` 직후 `sy-subrc`를 확인한다. 공식문서 기준으로 성공 시 0, 실패 시 0이 아닌 값이다. update processing 중에는 권한 체크가 수행되지 않고 0으로 세팅된다는 주의도 있다. CH15 report selection screen에서는 일반 foreground 실행 맥락을 기준으로 설명한다.

### 체험 설계

체험 장치 이름: "존재 검증과 권한 검증 이중문"

- 데이터: `C001` 존재/권한 있음, `C002` 존재/권한 없음, `C999` 존재하지 않음을 준비한다.
- 버튼: `존재 체크`, `권한 체크`, `조회 시작`.
- 상태 표시: DB hit 여부, authorization object, checked field, `ACTVT`, `sy-subrc`, 사용자에게 보낼 message를 보여 준다.
- 피드백: 존재 검증 실패는 "없는 코드", 권한 실패는 "접근 권한 없음"으로 다른 색과 문구를 보여 준다. 둘을 같은 "데이터 없음"으로 처리하지 못하게 한다.

### 실수와 주의

- 권한 검증을 단순히 "데이터가 안 보이면 권한 없음"으로 추정하지 않는다. 존재 검증과 권한 검증은 분리한다.
- `AUTHORITY-CHECK` 뒤에는 반드시 `sy-subrc`를 확인한다.
- 교육용 authorization object 이름을 실무 시스템에 그대로 적용하지 않는다.
- 권한이 없는 데이터의 존재 여부를 사용자에게 지나치게 자세히 알려 주는 것도 보안상 문제가 될 수 있다. CH15에서는 개발자 관점의 검증 구조를 배우고, 보안 메시지 정책은 별도 심화로 남긴다.

### 정리

selection screen 검증은 문법 검사가 아니라 업무 접근의 첫 관문이다. `SELECT SINGLE`로 값의 존재를 확인하고, `AUTHORITY-CHECK`로 사용자의 접근 권한을 확인한다. 둘을 분리하면 오류 메시지도 정확해지고, 조회 로직이 시작되기 전에 위험한 입력을 막을 수 있다.

---

## CH15-L08 - Selection Screen 고급 이벤트

### 왜 필요한가

입력값 하나만 검증할 때는 `AT SELECTION-SCREEN ON p_field`로 충분하다. 하지만 실무 화면에는 더 복잡한 반응이 필요하다. block 안의 여러 필드가 함께 맞아야 하고, radio button 그룹 선택에 따라 조건이 달라지며, F1 도움말이나 F4 값 도움말을 직접 제공해야 할 때도 있다.

CH15-L08은 selection screen이 단순 입력칸 묶음이 아니라 작은 dialog 화면처럼 반응할 수 있다는 점을 보여 준다.

### 무엇인가

대표 고급 이벤트는 다음과 같다.

| 이벤트 | 쓰임 |
| --- | --- |
| `AT SELECTION-SCREEN ON BLOCK block` | block 안의 값 조합을 한 번에 검증 |
| `AT SELECTION-SCREEN ON RADIOBUTTON GROUP group` | radio group 선택 변경이나 실행 시 그룹 단위 검증 |
| `AT SELECTION-SCREEN ON HELP-REQUEST FOR field` | F1 field help를 직접 제공 |
| `AT SELECTION-SCREEN ON VALUE-REQUEST FOR field` | F4 input help를 직접 제공 |

block 검증 예:

```abap
SELECTION-SCREEN BEGIN OF BLOCK b_date WITH FRAME TITLE text-001.
PARAMETERS: p_from TYPE d,
            p_to   TYPE d.
SELECTION-SCREEN END OF BLOCK b_date.

AT SELECTION-SCREEN ON BLOCK b_date.
  IF p_from IS INITIAL OR p_to IS INITIAL.
    MESSAGE e001(zmc_concert).
  ENDIF.

  IF p_from > p_to.
    MESSAGE e002(zmc_concert) WITH p_from p_to.
  ENDIF.
```

radio group 검증 예:

```abap
PARAMETERS: p_sum RADIOBUTTON GROUP g1 DEFAULT 'X',
            p_det RADIOBUTTON GROUP g1.

AT SELECTION-SCREEN ON RADIOBUTTON GROUP g1.
  IF p_sum IS INITIAL AND p_det IS INITIAL.
    MESSAGE e006(zmc_concert).
  ENDIF.
```

F1 도움말 예:

```abap
PARAMETERS p_conc TYPE zconcert-concert_id.

AT SELECTION-SCREEN ON HELP-REQUEST FOR p_conc.
  MESSAGE '공연 코드는 ZCONCERT에 등록된 CONCERT_ID입니다' TYPE 'I'.
```

F4 값 도움말 예:

```abap
PARAMETERS p_carr TYPE scarr-carrid.

DATA: BEGIN OF gs_carr,
        carrid   TYPE scarr-carrid,
        carrname TYPE scarr-carrname,
      END OF gs_carr.
DATA gt_carr LIKE STANDARD TABLE OF gs_carr.

AT SELECTION-SCREEN ON VALUE-REQUEST FOR p_carr.
  SELECT carrid carrname
    FROM scarr
    INTO TABLE gt_carr.

  CALL FUNCTION 'F4IF_INT_TABLE_VALUE_REQUEST'
    EXPORTING
      retfield    = 'CARRID'
      dynpprog    = sy-repid
      dynpnr      = sy-dynnr
      dynprofield = 'P_CARR'
    TABLES
      value_tab   = gt_carr.
```

F4는 DDIC search help나 check table로 자동 제공되는 경우가 많다. 직접 F4 이벤트를 구현하는 것은 값 목록을 동적으로 만들거나, 화면 맥락에 맞춘 도움말을 제공해야 할 때다.

### 어떻게 확인하는가

확인은 버튼과 키보드 행동으로 한다.

1. block 안의 날짜 둘 중 하나를 비우고 실행해 block 검증이 발생하는지 본다.
2. radio group을 바꾸고 Enter 또는 실행을 눌러 group 이벤트가 반응하는지 본다.
3. `p_conc`에 커서를 두고 F1을 눌러 직접 help message가 뜨는지 본다.
4. `p_carr`에 커서를 두고 F4를 눌러 `SCARR` 목록이 뜨고 선택값이 `P_CARR`로 들어가는지 본다.

F1/F4 이벤트 중에는 selection screen의 다른 입력값이 자동으로 프로그램 변수에 운반되지 않는다는 점도 주의한다. 단일 field help는 괜찮지만, 다른 field의 현재 화면 값을 반영해야 하는 복잡한 도움말은 추가 API가 필요하다.

### 체험 설계

체험 장치 이름: "Selection Screen 반응 실험실"

- 데이터: 날짜 block, radio group `요약/상세`, 항공사 목록 `SCARR` 샘플을 준비한다.
- 버튼: `ON BLOCK 실행`, `RADIO 변경`, `F1 호출`, `F4 호출`, `DDIC 자동 F4와 직접 F4 비교`.
- 상태 표시: 발생한 dynpro event, ABAP event, field transport 여부, 반환된 선택값을 보여 준다.
- 피드백: F4에서 값을 고르면 `P_CARR` 화면 필드에는 들어가지만, 다른 field 값은 자동으로 읽히지 않는다는 안내를 표시한다.

### 실수와 주의

- F4가 필요하다고 항상 function module부터 쓰지 않는다. DDIC search help와 check table로 자동 제공되는 도움말을 먼저 고려한다.
- `ON HELP-REQUEST`를 남용해 긴 교육 문서를 팝업으로 띄우는 방식은 좋지 않다. field 의미를 보충하는 짧은 도움말에 적합하다.
- block 검증과 전체 검증을 중복해서 같은 오류 메시지를 두 번 띄우지 않는다.
- F4 function module 예제는 classic 시스템에서 흔히 보이는 패턴으로 소개한다. search help exit, OO value help, UI5 value help는 후속 범위다.

### 정리

Selection screen은 field 입력만 받는 정적 화면이 아니다. block, radio group, F1, F4 이벤트를 사용하면 사용자의 행동에 맞춰 검증과 도움말을 제공할 수 있다. 다만 자동 DDIC 도움말과 직접 구현의 경계를 먼저 판단하고, CH15에서는 classic report selection screen 범위에 머문다.

---

## CH15-L09 - Selection Screen UI 구성

### 왜 필요한가

입력칸이 많아질수록 사용자는 어떤 값이 필수이고, 어떤 조건이 같은 묶음인지 알기 어려워진다. selection screen도 UI다. block, comment, line, checkbox, radio button, pushbutton, function key, tabbed block을 적절히 쓰면 사용자가 조건을 빠르게 이해하고 실수 없이 실행할 수 있다.

CH15-L09는 화면을 꾸미는 문법 목록이 아니라 "입력 조건을 업무 단위로 정리하는 방법"을 다룬다.

### 무엇인가

대표 selection screen 구성 요소:

| 문장 | 쓰임 |
| --- | --- |
| `SELECTION-SCREEN BEGIN OF BLOCK` | 관련 입력값을 frame으로 묶음 |
| `SELECTION-SCREEN COMMENT` | 안내 text나 field label 보강 |
| `SELECTION-SCREEN ULINE`, `SKIP` | 구분선과 여백 |
| `SELECTION-SCREEN BEGIN OF LINE` | 한 줄에 여러 요소 배치 |
| `PARAMETERS ... AS CHECKBOX` | yes/no 선택 |
| `PARAMETERS ... RADIOBUTTON GROUP` | 하나만 선택되는 모드 |
| `SELECTION-SCREEN PUSHBUTTON` | selection screen 안의 버튼 |
| `SELECTION-SCREEN FUNCTION KEY 1`~`5` | application toolbar 버튼 |
| `SELECTION-SCREEN TABBED BLOCK` | tabstrip으로 여러 subscreen 표시 |

기본 UI 예:

```abap
TABLES sscrfields.

SELECTION-SCREEN BEGIN OF BLOCK b_main WITH FRAME TITLE text-001.
PARAMETERS p_conc TYPE zconcert-concert_id OBLIGATORY.

SELECTION-SCREEN SKIP.
SELECTION-SCREEN COMMENT /1(40) text-002 FOR FIELD p_all.
PARAMETERS p_all AS CHECKBOX.

PARAMETERS: p_sum RADIOBUTTON GROUP g1 DEFAULT 'X',
            p_det RADIOBUTTON GROUP g1.

SELECTION-SCREEN PUSHBUTTON /1(20) but_ref USER-COMMAND ref.
SELECTION-SCREEN END OF BLOCK b_main.

SELECTION-SCREEN FUNCTION KEY 1.

INITIALIZATION.
  but_ref = '조건 새로고침'.
  sscrfields-functxt_01 = '도움말'.

AT SELECTION-SCREEN.
  CASE sscrfields-ucomm.
    WHEN 'REF'.
      MESSAGE '조건을 다시 계산했습니다' TYPE 'S'.
    WHEN 'FC01'.
      MESSAGE '이 리포트는 공연 예매 조회용입니다' TYPE 'I'.
  ENDCASE.
```

공식문서 기준으로 pushbutton과 function key의 user command는 `SSCRFIELDS-UCOMM`으로 처리한다. `sy-ucomm`을 쓰는 방식으로 가르치지 않는다.

Tabbed block은 더 복잡하다. 각 tab은 실제 내용을 담을 subscreen selection screen과 연결되어야 한다. assignment가 빠지거나 잘못되면 runtime 문제가 날 수 있으므로, CH15에서는 "여러 조건 영역을 탭으로 나눌 수 있다"와 "subscreen 연결이 필수다"까지 정확히 설명하고, 복잡한 tab framework는 실습 심화로 둔다.

### 어떻게 확인하는가

확인 기준은 예쁘게 보이는지가 아니라 사용자가 덜 헷갈리는지다.

1. block title만 보고 입력 묶음의 목적을 알 수 있는지 본다.
2. comment가 field와 연결되어 F1/F4 사용성을 해치지 않는지 본다.
3. checkbox와 radio button의 기본 선택이 업무적으로 안전한지 본다.
4. pushbutton을 눌렀을 때 `sscrfields-ucomm`에 `REF`가 들어오는지 본다.
5. function key 1을 눌렀을 때 `FC01`이 들어오는지 본다.

### 체험 설계

체험 장치 이름: "Selection Screen 레이아웃 빌더"

- 데이터: 기본 조건 block, 출력 옵션 block, 도움말 toolbar, tab 영역을 카드로 준비한다.
- 버튼: `Block 추가`, `Comment 연결`, `Checkbox 추가`, `Radio group 추가`, `Pushbutton 추가`, `Function key 추가`, `Tabbed block 미리보기`.
- 상태 표시: 화면 미리보기, `SSCRFIELDS-UCOMM`, 현재 focus field, field help 연결 여부를 보여 준다.
- 피드백: comment에 `FOR FIELD`가 없으면 "도움말 연결 약함" 경고를 띄우고, pushbutton 처리에서 `sy-ucomm`을 선택하면 "selection screen에서는 SSCRFIELDS-UCOMM 사용" 경고를 띄운다.

### 실수와 주의

- UI 구성 문법을 한꺼번에 많이 쓰면 화면이 복잡해진다. 업무 단위 grouping이 먼저이고 장식은 그 다음이다.
- pushbutton은 program execution을 대체하는 버튼이 아니다. 공식문서도 dynamic modification 용도를 중심으로 설명한다. 실제 조회는 Execute 흐름과 분리해서 설계한다.
- function key text는 `INITIALIZATION` 또는 적절한 초기화 시점에 넣어야 사용자가 버튼 의미를 볼 수 있다.
- tabbed block은 subscreen 연결을 대충 넘기지 않는다. 빈 tab은 사용자에게 혼란을 준다.

### 정리

Selection screen UI 구성은 "조건을 업무 언어로 정리하는 일"이다. block으로 묶고, comment로 보충하고, checkbox/radio로 선택 방식을 명확히 하며, pushbutton과 function key는 `SSCRFIELDS-UCOMM`으로 처리한다. 화면을 멋지게 만드는 것보다 실행 실수를 줄이는 것이 우선이다.

---

## CH15-L10 - PARAMETERS와 SELECT-OPTIONS 옵션 정리

### 왜 필요한가

CH12에서 `SELECT-OPTIONS`를 배웠고, CH15 앞 레슨에서 event를 배웠다. 이제 selection screen field 자체에 붙는 옵션을 정리해야 한다. 어떤 값은 반드시 입력되어야 하고, 어떤 값은 소문자를 유지해야 하며, 어떤 조건은 범위 입력을 막아야 한다. 이 설정을 모르면 event code로 해결하지 않아도 되는 일을 불필요하게 직접 구현하게 된다.

CH15-L10은 `PARAMETERS`와 `SELECT-OPTIONS`의 자주 쓰는 옵션을 "사용자 입력 경험" 관점에서 정리한다.

### 무엇인가

`PARAMETERS`는 전역 elementary data object와 입력 필드를 만든다. `SELECT-OPTIONS`는 selection table과 low/high 입력 필드, multiple selection 버튼을 만든다.

`PARAMETERS` 주요 옵션:

| 옵션 | 의미 | 주의 |
| --- | --- | --- |
| `TYPE`, `LIKE` | 입력값 타입 결정 | DDIC field를 참조하면 field help와 label 연결이 쉬움 |
| `OBLIGATORY` | 비어 있으면 Execute를 막음 | 모든 검증을 대체하지는 않음 |
| `DEFAULT` | 시작값 제안 | `MEMORY ID`보다 우선될 수 있음 |
| `LOWER CASE` | 대문자 변환 방지 | character-like field에 의미 있음 |
| `AS CHECKBOX` | `X` 또는 blank 선택 | 길이 1 character 성격 |
| `RADIOBUTTON GROUP` | group 안에서 하나 선택 | group 최소 2개, 기본 선택 관리 필요 |
| `MEMORY ID` | SPA/GPA user memory 연결 | 사용자별 이전 값 영향 가능 |
| `VALUE CHECK` | fixed value/check table 기반 검사 | checkbox/radio/listbox 등과 조합 제한 있음 |
| `MODIF ID` | 동적 화면 제어 group 지정 | `SCREEN-GROUP1`에 저장됨 |

`SELECT-OPTIONS` 주요 옵션:

| 옵션 | 의미 | 주의 |
| --- | --- | --- |
| `DEFAULT low TO high` | 첫 조건 행의 시작값 | 내부값 기준으로 이해 |
| `OBLIGATORY` | 조건 입력 필수 | multiple selection과 함께 UX 확인 필요 |
| `NO-EXTENSION` | multiple selection 버튼 숨김 | 복수 조건을 막음 |
| `NO INTERVALS` | high 입력 필드 숨김 | 단독 사용 시 multiple selection dialog에서는 interval 가능 |
| `MEMORY ID` | user memory 연결 | 이전 사용자 값이 들어올 수 있음 |
| `MODIF ID` | 동적 화면 제어 group 지정 | `LOOP AT SCREEN`에서 group으로 제어 |

classic 예:

```abap
DATA gv_date TYPE d.

PARAMETERS p_conc TYPE zconcert-concert_id OBLIGATORY.
PARAMETERS p_note TYPE c LENGTH 20 LOWER CASE MEMORY ID znt.
PARAMETERS p_test AS CHECKBOX.

SELECT-OPTIONS s_date FOR gv_date
  DEFAULT sy-datum TO sy-datum
  OBLIGATORY NO-EXTENSION NO INTERVALS.
```

`MODIF ID`와 `LOOP AT SCREEN` 연결 예:

```abap
PARAMETERS: p_basic TYPE c LENGTH 1,
            p_adv1  TYPE c LENGTH 10 MODIF ID adv,
            p_adv2  TYPE c LENGTH 10 MODIF ID adv.

DATA gs_screen TYPE screen.

AT SELECTION-SCREEN OUTPUT.
  LOOP AT SCREEN INTO gs_screen.
    IF gs_screen-group1 = 'ADV' AND p_basic = 'X'.
      gs_screen-active = '0'.
      MODIFY SCREEN FROM gs_screen.
    ENDIF.
  ENDLOOP.
```

`MODIF ID adv`는 screen table의 `GROUP1`에 `ADV`로 들어간다. ABAP source의 대소문자와 화면 runtime 값의 대문자화를 함께 보여 주면 입문자가 debugger에서 찾기 쉽다.

### 어떻게 확인하는가

확인은 옵션별로 화면 행동을 관찰한다.

1. `OBLIGATORY` 필드를 비우고 Execute를 누른다. report event code 없이도 실행이 막히는지 본다.
2. `LOWER CASE`가 있는 field와 없는 field에 `abc`를 넣어 대문자 변환 차이를 본다.
3. `NO-EXTENSION`, `NO INTERVALS` 조합으로 multiple selection 버튼과 high field가 어떻게 바뀌는지 본다.
4. `MODIF ID`가 있는 field를 debugger의 `SCREEN-GROUP1`에서 확인한다.

### 체험 설계

체험 장치 이름: "옵션 스위치보드"

- 데이터: 같은 field에 옵션을 하나씩 켜고 끄는 가상 selection screen을 만든다.
- 버튼: `OBLIGATORY 켜기`, `LOWER CASE 비교`, `NO-EXTENSION`, `NO INTERVALS`, `MODIF ID 적용`, `MEMORY ID 시뮬레이션`.
- 상태 표시: 화면 모양, 내부 변수 값, selection table 첫 행, multiple selection 가능 여부를 보여 준다.
- 피드백: `NO INTERVALS`만 켠 상태에서 multiple selection dialog를 열면 interval 입력이 여전히 가능할 수 있다는 주의 메시지를 표시한다.

### 실수와 주의

- `OBLIGATORY`만으로 업무 검증이 끝났다고 생각하지 않는다. 필수 여부와 값의 업무적 유효성은 다르다.
- `LOWER CASE`를 아무 타입에나 붙이는 옵션으로 설명하지 않는다.
- `NO INTERVALS`와 `NO-EXTENSION`의 차이를 섞지 않는다. high field를 숨기는 것과 복수 선택을 막는 것은 다르다.
- `MEMORY ID`는 편리하지만 사용자의 이전 값이 들어와 테스트 결과를 헷갈리게 만들 수 있다.

### 정리

Selection screen 옵션은 작은 문법처럼 보이지만 사용자 경험을 크게 바꾼다. 입력 필수, 기본값, 대소문자, 복수 선택, 화면 제어 group을 event code로 억지 구현하기 전에 `PARAMETERS`와 `SELECT-OPTIONS` 옵션으로 해결할 수 있는지 먼저 본다.

---

## CH15-L11 - 여러 Selection Screen, CALL, Variant

### 왜 필요한가

모든 조건을 표준 selection screen 1000 하나에 몰아넣으면 화면이 커지고 복잡해진다. 고급 조건, 도움말성 설정, 추가 필터는 별도 selection screen으로 분리해 필요할 때만 열 수 있다. 또 사용자는 매번 같은 조건을 입력하지 않고 variant로 저장해 재사용하고 싶어 한다.

CH15-L11은 표준 selection screen 1000을 넘어, 보조 selection screen과 variant의 흐름을 이해하는 레슨이다.

### 무엇인가

Executable report는 standard selection screen 1000을 자동으로 가진다. 추가 selection screen은 `SELECTION-SCREEN BEGIN OF SCREEN`으로 정의할 수 있고, `CALL SELECTION-SCREEN`으로 호출한다.

classic 예:

```abap
TABLES sscrfields.

PARAMETERS p_conc TYPE zconcert-concert_id.

SELECTION-SCREEN FUNCTION KEY 1.

SELECTION-SCREEN BEGIN OF SCREEN 1100 AS WINDOW TITLE text-010.
PARAMETERS p_max TYPE i DEFAULT 100.
PARAMETERS p_log AS CHECKBOX.
SELECTION-SCREEN END OF SCREEN 1100.

INITIALIZATION.
  sscrfields-functxt_01 = '고급조건'.

AT SELECTION-SCREEN.
  IF sscrfields-ucomm = 'FC01'.
    CALL SELECTION-SCREEN 1100 STARTING AT 10 5.

    IF sy-subrc = 0.
      MESSAGE '고급 조건을 적용했습니다' TYPE 'S'.
    ELSE.
      MESSAGE '고급 조건 적용을 취소했습니다' TYPE 'S'.
    ENDIF.
  ENDIF.
```

`CALL SELECTION-SCREEN`의 `sy-subrc`는 사용자가 Execute 계열로 나왔는지, Back/Exit/Cancel로 나왔는지 판단하는 데 중요하다. modal 창처럼 열고 싶으면 `STARTING AT`과 `ENDING AT` 위치를 지정할 수 있다.

variant는 selection screen 값 세트를 저장해 재사용하는 기능이다. 프로그램 실행 화면에서 variant를 저장하거나 불러올 수 있고, `CALL SELECTION-SCREEN ... USING SELECTION-SET variant`로 특정 selection screen variant를 적용할 수도 있다. 공식문서 기준으로 variant 값은 `AT SELECTION-SCREEN OUTPUT` 직전에 관련 data object로 전달된다.

### 어떻게 확인하는가

확인 순서:

1. 표준 selection screen에서 function key 1을 누른다.
2. 1100 보조 selection screen이 modal처럼 열리는지 본다.
3. 값을 바꾸고 Execute를 눌렀을 때 `sy-subrc = 0`인지 확인한다.
4. Back 또는 Cancel로 닫았을 때 `sy-subrc = 4`인지 확인한다.
5. 표준 화면의 variant를 저장하고 다시 불러와 값이 복원되는지 확인한다.

variant 확인은 "batch job 설정"으로 확장하지 않는다. CH15에서는 사용자가 조건 세트를 저장하고 다시 불러오는 selection screen 기능으로만 다룬다.

### 체험 설계

체험 장치 이름: "보조 선택화면과 Variant 금고"

- 데이터: 표준 화면 1000, 보조 화면 1100, variant `DAILY_C001`, variant `MONTHLY_ALL`을 준비한다.
- 버튼: `고급조건 열기`, `Execute로 닫기`, `Cancel로 닫기`, `Variant 저장`, `Variant 불러오기`.
- 상태 표시: 현재 screen number, modal 위치, `sy-subrc`, 저장된 field values, variant 적용 시점을 보여 준다.
- 피드백: Cancel로 닫은 값은 적용하지 않는 흐름을 시각화하고, variant가 없는 이름이면 무시될 수 있다는 경고를 띄운다.

### 실수와 주의

- 보조 selection screen을 `CALL SCREEN`으로 호출하려고 하지 않는다. selection screen은 `CALL SELECTION-SCREEN`을 사용한다.
- `sy-subrc`를 확인하지 않으면 사용자가 취소했는데도 값이 적용된 것처럼 처리할 수 있다.
- variant를 프로그램 로직의 대체물로 생각하지 않는다. variant는 입력값 세트 저장 기능이고, 검증과 권한 확인은 여전히 필요하다.
- batch job, spool, variant transport 정책은 CH15에서 확장하지 않는다.

### 정리

Selection screen은 하나만 있는 것이 아니다. 표준 화면 1000 외에 보조 화면을 만들고 필요할 때 호출할 수 있다. Variant는 반복 입력을 줄여 주지만 검증을 대신하지 않는다. `CALL SELECTION-SCREEN`과 `sy-subrc`를 함께 이해하면 사용자의 선택과 취소 흐름을 안전하게 처리할 수 있다.

---

## CH15-L12 - 실습: 공연 예매 조회 리포트

### 왜 필요한가

CH15의 마지막은 event를 따로 외우는 것이 아니라 한 리포트 흐름으로 묶는 실습이어야 한다. 사용자는 공연 코드를 입력하고, 기본값을 보고, 잘못된 입력을 고치고, 권한 검증을 통과한 뒤, 예매 목록을 조회한다. 이 과정을 한 번에 만들면 `INITIALIZATION`, `AT SELECTION-SCREEN OUTPUT`, `AT SELECTION-SCREEN`, `START-OF-SELECTION`, message, authority check가 각각 왜 필요한지 연결된다.

### 무엇인가

실습 리포트 요구사항:

- 최초 실행 시 기본 공연 코드 `C001`을 제안한다.
- 고급 조건 field는 모드 값이 `A`일 때만 활성화한다.
- 공연 코드가 비어 있거나 존재하지 않으면 실행을 막는다.
- 현재 사용자에게 공연 조회 권한이 없으면 실행을 막는다.
- 검증을 통과하면 `zbooking`을 조회한다.
- 결과가 없으면 상태 메시지를 보여 준다.
- 결과가 있으면 SALV로 표시한다.

classic 통합 예제:

```abap
REPORT zch15_concert_booking.

PARAMETERS: p_conc TYPE zconcert-concert_id,
            p_mode TYPE c LENGTH 1,
            p_note TYPE c LENGTH 20.

DATA gv_status     TYPE zbooking-status.
DATA gv_concert_id TYPE zconcert-concert_id.
DATA gt_booking    TYPE STANDARD TABLE OF zbooking.
DATA lo_alv        TYPE REF TO cl_salv_table.
DATA gs_screen     TYPE screen.

SELECT-OPTIONS s_stat FOR gv_status.

INITIALIZATION.
  p_conc = 'C001'.

  s_stat-sign = 'I'.
  s_stat-option = 'EQ'.
  s_stat-low = 'R'.
  APPEND s_stat.

AT SELECTION-SCREEN OUTPUT.
  LOOP AT SCREEN INTO gs_screen.
    IF gs_screen-name = 'P_NOTE' AND p_mode <> 'A'.
      gs_screen-active = '0'.
      MODIFY SCREEN FROM gs_screen.
    ENDIF.
  ENDLOOP.

AT SELECTION-SCREEN ON p_conc.
  IF p_conc IS INITIAL.
    MESSAGE e003(zmc_concert).
  ENDIF.

  SELECT SINGLE concert_id
    FROM zconcert
    INTO gv_concert_id
    WHERE concert_id = p_conc.

  IF sy-subrc <> 0.
    MESSAGE e004(zmc_concert) WITH p_conc.
  ENDIF.

  AUTHORITY-CHECK OBJECT 'Z_CONCERT'
    ID 'CONCERT' FIELD p_conc
    ID 'ACTVT'   FIELD '03'.

  IF sy-subrc <> 0.
    MESSAGE e005(zmc_concert) WITH p_conc.
  ENDIF.

START-OF-SELECTION.
  SELECT *
    FROM zbooking
    INTO TABLE gt_booking
    WHERE concert_id = p_conc
      AND status IN s_stat.

  IF gt_booking IS INITIAL.
    MESSAGE '조회된 예매가 없습니다' TYPE 'S'.
    RETURN.
  ENDIF.

  TRY.
      cl_salv_table=>factory(
        IMPORTING r_salv_table = lo_alv
        CHANGING  t_table      = gt_booking ).
      lo_alv->display( ).
    CATCH cx_salv_msg.
      MESSAGE 'ALV 표시 중 오류가 발생했습니다' TYPE 'E'.
  ENDTRY.
```

이 코드는 CH15의 모든 핵심 책임을 한 곳에 묶는다. 기본값은 `INITIALIZATION`, 화면 제어는 `OUTPUT`, 입력/존재/권한 검증은 `AT SELECTION-SCREEN ON p_conc`, 조회와 결과 표시는 `START-OF-SELECTION`에 둔다.

### 어떻게 확인하는가

실습 검증 시나리오:

| 시나리오 | 입력 | 기대 결과 |
| --- | --- | --- |
| 기본 실행 | `p_conc = C001`, `s_stat = R` | 예매 목록 조회 |
| 공연 코드 누락 | `p_conc` blank | `E003` 메시지, 화면 복귀 |
| 없는 공연 | `p_conc = C999` | `E004` 메시지, 화면 복귀 |
| 권한 없음 | `p_conc = C002`, 사용자 권한 없음 | `E005` 메시지, 화면 복귀 |
| 결과 없음 | 존재/권한 있음, 조건 결과 0건 | `S` 메시지, 종료 |
| 고급 모드 | `p_mode = A` | `p_note` 입력 가능 |
| 일반 모드 | `p_mode` blank | `p_note` 비활성 |

debugger 확인 포인트:

- `INITIALIZATION` 뒤 `p_conc`와 `s_stat` 첫 행
- `AT SELECTION-SCREEN OUTPUT`에서 `gs_screen-name = P_NOTE`
- `AT SELECTION-SCREEN ON p_conc`에서 `SELECT SINGLE`과 `AUTHORITY-CHECK` 후 `sy-subrc`
- `START-OF-SELECTION`의 `SELECT` 후 `gt_booking`과 `sy-dbcnt`

### 체험 설계

체험 장치 이름: "공연 예매 리포트 실행 시뮬레이터"

- 데이터: `zconcert`, `zbooking`, 사용자 권한 matrix를 탭으로 제공한다.
- 버튼: `최초 실행`, `고급 모드 전환`, `공연 검증`, `권한 검증`, `조회 실행`, `ALV 표시`, `실패 케이스 자동 실행`.
- 상태 표시: event timeline, selection screen 미리보기, message area, internal table 결과, ALV preview를 한 화면에 둔다.
- 피드백: 각 단계가 통과해야 다음 버튼이 활성화된다. 오류가 나면 해당 event 위치로 스크롤하고 message class 번호와 사용자 문구를 같이 보여 준다.
- 확장 실습: 학습자가 `s_stat` 조건을 `R`에서 `C`로 바꾸면 result table이 어떻게 달라지는지 즉시 비교한다.

### 실수와 주의

- `p_note`를 숨긴다고 해서 내부 변수 값이 자동으로 초기화되는 것은 아니다. 숨김과 값 삭제는 다른 문제다.
- 권한 검증을 `START-OF-SELECTION` 조회 뒤로 미루지 않는다.
- message class가 없으면 예제의 `MESSAGE e003(zmc_concert)`는 활성화되지 않는다. 실습 전 SE91 메시지 준비를 확인한다.
- SALV 오류 처리는 CH20 exception 학습으로 확장하지 않는다. 여기서는 "표시 중 오류가 생길 수 있어 CATCH한다" 정도로만 다룬다.
- `END-OF-SELECTION`을 이 통합 실습에 넣지 않는다. 신규 단순 리포트에서는 `START-OF-SELECTION` 중심으로 충분히 구성할 수 있음을 보여 준다.

### 정리

CH15 실습의 완성 기준은 코드가 실행되는 것만이 아니다. 사용자가 값을 보기 전, 값을 입력한 뒤, 실행하기 전, 실제 조회를 시작한 뒤의 책임이 분리되어 있어야 한다. 이 분리가 되면 리포트는 읽기 쉬워지고, 오류는 빨리 잡히며, 사용자 피드백은 정확해진다.

---

## CH15 마무리 학습 흐름

CH15를 끝낸 학습자는 report event를 단순 키워드 목록으로 외우지 않는다. 다음 질문에 답할 수 있어야 한다.

1. 이 코드는 화면이 처음 뜨기 전, 화면이 그려지기 전, 사용자가 입력한 뒤, 조회가 시작된 뒤 중 어디에 있어야 하는가.
2. 기본값과 반복 화면 제어를 왜 분리해야 하는가.
3. 입력 오류, 존재하지 않는 값, 권한 없는 값을 어떻게 다른 메시지로 막을 것인가.
4. `LOOP AT SCREEN`을 classic-safe하게 어떻게 써야 하는가.
5. F1/F4, pushbutton, function key, 보조 selection screen이 어떤 event와 system field로 연결되는가.
6. `END-OF-SELECTION`을 왜 신규 리포트 표준처럼 가르치면 안 되는가.

최종 암기 문장:

```text
INITIALIZATION은 첫 기본값,
AT SELECTION-SCREEN OUTPUT은 화면 직전 제어,
AT SELECTION-SCREEN은 입력 검증,
START-OF-SELECTION은 검증 후 본 처리,
END-OF-SELECTION은 legacy/LDB 중심 기존 코드 독해 포인트다.
```
