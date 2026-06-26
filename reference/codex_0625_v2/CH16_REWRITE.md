# CH16_REWRITE - codex_0625_v2 재작업 원고

> 대상: `content/abap/CH16`
> 기준 판정: `reference/codex_0625/00_QUALITY_REVIEW.md`
> 작성 범위: CH16 1개 챕터만. 원본 `content/abap`은 수정하지 않는다.
> 목표: v1의 반복 템플릿을 제거하고, Screen Programming / Dynpro 기초를 실제 강의자료 수준으로 재집필한다.

## CH16 전체 설계

CH16은 "SAP이 자동으로 만들어 주는 selection screen"에서 "개발자가 직접 설계하는 SAP GUI 화면"으로 넘어가는 장이다. CH15까지 학습자는 `PARAMETERS`, `SELECT-OPTIONS`, report event, selection screen event를 사용했다. 이 방식은 조회 조건을 받는 리포트에는 좋다. 하지만 업무 화면에는 더 많은 요구가 있다.

- 공연을 고르고 좌석 수를 입력한 뒤 `예매` 버튼을 누른다.
- 입력 화면 위에 `저장`, `뒤로`, `취소` 같은 표준 버튼을 둔다.
- 특정 조건에서는 좌석 수 입력칸을 읽기 전용으로 만든다.
- 화면 안에 이후 CH17의 ALV Grid를 넣을 자리를 마련한다.
- 한 화면 안에서 공연 정보, 예매자 정보, 상태 정보를 탭으로 나눈다.

이 요구는 standard selection screen만으로는 자연스럽게 처리하기 어렵다. Dynpro는 화면 layout과 flow logic을 개발자가 직접 가진다. Module Pool은 이런 화면 중심 프로그램을 담는 classic dialog program 구조다.

학습 경계:

- CH16은 classic-first 구간이다. ABAP 예제에는 inline declaration, constructor expression, object creation expression `NEW`, string template, modern Open SQL host marker를 쓰지 않는다.
- 공식 ABAP 문서에는 classic dynpro가 새 application program 개발에는 obsolete 성격이라고 설명된다. 하지만 기존 SAP GUI 업무 화면을 읽고 유지보수하기 위해 CH16에서 다룬다. 신규 UX 전략, SAPUI5, Web Dynpro, Fiori는 이 장의 본문 실습 범위가 아니다.
- `TYPE REF TO`와 `CREATE OBJECT`는 CH20 OO 이전의 선행 사용이다. CH16-L07에서는 "Custom Control 영역에 container 객체를 연결한다"는 블랙박스로만 설명한다.
- Table Control은 제외한다. 공식문서상 존재하는 Dynpro 요소이지만, 현재 커리큘럼 결정은 화면 표를 CH17 Grid ALV로 대체하는 것이다.
- 실제 DB 저장, `INSERT`, lock object, LUW, enqueue/dequeue는 CH24~CH25 이후 범위다. CH16-L08 실습은 화면 입력과 검증까지만 다룬다.
- `CALL SCREEN` 다중 화면 네비게이션은 Dynpro sequence 이해를 위해 이름만 제한적으로 언급한다. 복잡한 다중 화면 설계는 Track-2 또는 후속 실무 범위다.

수동 확인한 공식문서 근거:

| 문서 | CH16에서 쓰는 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros.htm` | Dynpro가 ABAP program의 repository object이고 screen layout, attributes, flow logic으로 구성되며 PBO/PAI로 흐른다는 점 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_processing.htm` | Dynpro sequence가 transaction code 또는 `CALL SCREEN`으로 시작되고, PBO -> 화면 표시 -> PAI -> next dynpro로 흐른다는 점 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_dynpro_statements.htm` | Flow Logic은 Screen Painter의 Flow Logic 탭에 작성하는 dynpro 전용 procedural part이고 `PROCESS`, `MODULE`, `FIELD`, `CHAIN`, `CALL SUBSCREEN` 등이 있음을 확인 |
| `C:\ABAP_DOCU_HTML\dynpprocess.htm` | `PROCESS BEFORE OUTPUT`, `PROCESS AFTER INPUT`, `PROCESS ON HELP-REQUEST`, `PROCESS ON VALUE-REQUEST`의 event block 성격과 순서 제한 확인 |
| `C:\ABAP_DOCU_HTML\dynpmodule.htm` | Flow Logic의 `MODULE`이 ABAP dialog module을 호출하며 ABAP의 `MODULE ... ENDMODULE` 정의문과 구분된다는 점 확인 |
| `C:\ABAP_DOCU_HTML\abapmodule.htm` | ABAP program 쪽 `MODULE mod OUTPUT|INPUT. ... ENDMODULE.` dialog module 정의 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_fields.htm` | Dynpro field와 같은 이름의 ABAP global data object 사이에 PBO/PAI data transport가 일어난다는 점 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_screen.htm` | text, input/output, dropdown, checkbox, radio button, pushbutton, frame, subscreen, tabstrip, custom control, status icon, OK field 등 화면 요소 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpro_user_actions.htm` | user action, function code, OK field, `sy-ucomm`, OK_CODE field 저장 후 `CLEAR` 권장 패턴 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_listbox.htm` | Dropdown listbox는 F4 input help와 다른 고정 목록 UI이고 `VRM_SET_VALUES` 또는 input help 기반 값 목록을 사용할 수 있음을 확인 |
| `C:\ABAP_DOCU_HTML\abaploop_at_screen.htm` | `LOOP AT SCREEN INTO wa` 형태와 짧은 built-in `screen` 형식 회피 근거 확인 |
| `C:\ABAP_DOCU_HTML\abapmodify_screen.htm` | `MODIFY SCREEN FROM wa`는 `LOOP AT SCREEN` 안, PBO에서 의미 있고 속성 변경은 PBO마다 static 속성으로 reset됨을 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpro_modify_screens_dyn.htm` | `screen-input`, `screen-invisible`, `screen-active`의 관계와 동적 field selection 주의 확인 |
| `C:\ABAP_DOCU_HTML\abapset_pf-status_dynpro.htm` | `SET PF-STATUS`, `EXCLUDING`, PBO 이전 설정 필요, `sy-pfkey` 확인 |
| `C:\ABAP_DOCU_HTML\abapset_titlebar_dynpro.htm` | `SET TITLEBAR ... WITH`와 `sy-title` 확인 |
| `C:\ABAP_DOCU_HTML\abapleave_screen.htm` | `LEAVE SCREEN`, `LEAVE TO SCREEN dynnr`, `LEAVE TO SCREEN 0`의 next dynpro 흐름 확인 |
| `C:\ABAP_DOCU_HTML\abapleave_program.htm` | `LEAVE PROGRAM`이 프로그램을 종료한다는 점 확인 |
| `C:\ABAP_DOCU_HTML\abapset_screen.htm` | `SET SCREEN`은 next dynpro를 지정하지만 현재 dynpro processing을 즉시 끊지 않는다는 점 확인 |
| `C:\ABAP_DOCU_HTML\abendynpro_custom_controls.htm` | Custom Control은 dynpro의 사각 영역이고 `CL_GUI_CUSTOM_CONTAINER` 같은 container control에 연결해야 함을 확인 |
| `C:\ABAP_DOCU_HTML\abendynp_subscreen.htm` | Subscreen area, subscreen dynpro, `CALL SUBSCREEN`, subscreen에는 자체 OK field가 없다는 점 확인 |
| `C:\ABAP_DOCU_HTML\abendynp_tabstrip.htm` | Tabstrip은 tab title과 subscreen area로 구성되고 tab 선택 방식에 따라 PAI/data transport가 달라짐을 확인 |
| `C:\ABAP_DOCU_HTML\abapcontrols_tabstrip.htm` | `CONTROLS ctrl TYPE TABSTRIP`, `activetab`, subscreen dynpro 연결 확인 |
| `C:\ABAP_DOCU_HTML\abendynpro_status_icons.htm` | Status Icon은 Screen Painter placeholder와 icon/text/tooltip 지정이 필요함을 확인 |
| `C:\ABAP_DOCU_HTML\abendynp_table_controls.htm` | Table Control의 존재와 복잡한 PBO/PAI loop 구조를 확인하되 CH16에서는 의도적으로 제외 |

공식문서 교정 메모:

- v1의 공식문서 힌트는 selection screen과 일반 조건문 문서로 반복 치우침이 있었다. CH16 v2는 selection screen이 아니라 Dynpro 문서군을 근거로 삼는다.
- `LOOP AT SCREEN.`과 `MODIFY SCREEN.`의 짧은 형태는 새 예제로 사용하지 않는다. v2는 `DATA gs_screen TYPE screen.`, `LOOP AT SCREEN INTO gs_screen.`, `MODIFY SCREEN FROM gs_screen.`으로 통일한다.
- Dynpro의 OK field는 `sy-ucomm`만 직접 읽기보다 화면에 정의한 OK_CODE field를 ABAP 변수로 받아 보조 변수에 저장하고 `CLEAR ok_code`하는 패턴이 공식 예제와 문서에서 권장된다.
- `SET SCREEN`은 다음 화면 번호를 바꾸지만 현재 processing을 즉시 멈추지 않는다. 즉시 떠나려면 `LEAVE SCREEN` 또는 `LEAVE TO SCREEN`을 사용한다.
- Dropdown Listbox는 F4 검색 팝업의 다른 이름이 아니다. 값 목록이 작고 고정적일 때 적합하며, F4와 동시에 쓰는 화면 경험이 아니다.
- Tabstrip은 단순 장식이 아니라 tab title function code, `activetab`, subscreen area, `CALL SUBSCREEN`이 연결되는 구조다. CH16에서는 전체 골격을 설명하고 복잡한 tab framework는 깊게 구현하지 않는다.
- Table Control은 공식문서에 존재하지만 커리큘럼 결정상 CH16에서 가르치지 않는다. 화면 표는 CH17 Grid ALV로 넘긴다.

CH16에서 계속 쓰는 작은 업무 모델:

```text
화면 0100: 예매 입력

P_CONC   공연ID        예: C001
P_PERF   회차          예: 001
P_SEATS  좌석 수       예: 2
P_CUST   예매자        예: 정훈영
P_STAT   상태          R=예약, W=대기, C=취소
OK_CODE  버튼 명령     SAVE, BACK, EXIT, CANCEL
CONT100  Custom Control 영역
```

이 데이터는 레슨마다 같은 질문으로 재사용한다.

1. 사용자가 보는 화면 요소와 ABAP global data object가 어떻게 같은 이름으로 연결되는가.
2. 화면이 뜨기 전 PBO에서 무엇을 준비하는가.
3. 사용자가 버튼을 누른 뒤 PAI에서 `OK_CODE`를 어떻게 읽고 지우는가.
4. 화면을 닫는 것과 프로그램을 끝내는 것은 어떻게 다른가.
5. 다음 장의 ALV를 넣기 위해 어떤 화면 영역이 필요한가.

---

## CH16-L01 - Module Pool 프로그램 구조

### 왜 필요한가

CH15의 selection screen은 빠르게 조회 조건을 받는 데 좋다. 하지만 사용자가 업무 화면처럼 느끼는 입력 흐름을 만들기에는 한계가 있다. 공연ID, 회차, 좌석 수, 예매자 이름을 배치하고, `예매` 버튼을 누르면 검증이 돌고, `뒤로`를 누르면 화면이 닫히는 구조는 selection screen보다 Dynpro가 자연스럽다.

Module Pool은 이런 화면 중심 프로그램의 그릇이다. 입문자는 여기서 가장 먼저 "리포트처럼 F8로 시작하는 프로그램이 아니다"를 확실히 잡아야 한다. Module Pool 화면은 transaction code로 시작 화면을 지정해 실행한다.

### 무엇인가

Dynpro는 Dynamic Program의 줄임말이다. 공식문서 기준으로 Dynpro는 ABAP program의 repository object이고, screen layout, attributes, flow logic으로 구성된다. Module Pool은 화면 중심 dialog program을 담는 프로그램 유형이다. 사용자는 transaction code를 실행하고, 시스템은 지정된 첫 dynpro를 호출한다.

Report와 Module Pool의 차이:

| 비교 | Report | Module Pool |
| --- | --- | --- |
| 시작 방식 | 실행형 프로그램, F8, selection screen | T-code로 시작 화면 호출 |
| 중심 흐름 | report event, `START-OF-SELECTION` | Dynpro sequence, PBO/PAI |
| 화면 | selection screen 자동 생성 | Screen Painter로 직접 설계 |
| 사용자 행동 | 실행, variant, 조건 입력 | 버튼, 메뉴, 입력 필드, 탭, 컨트롤 |
| 대표 실수 | event 위치 혼동 | T-code/시작 화면/OK_CODE 누락 |

Module Pool의 기본 리듬:

```text
T-code 실행
  -> 화면 0100 PBO
  -> 화면 표시
  -> 사용자 입력 또는 버튼
  -> 화면 0100 PAI
  -> 다음 화면 또는 다시 0100 PBO
```

이 리듬은 화면이 닫힐 때까지 반복된다. 그래서 CH16에서는 "위에서 아래로 한 번 실행"이 아니라 "화면이 보이고, 사용자가 반응하고, 다시 화면이 준비되는 순환"으로 생각해야 한다.

### 어떻게 확인하는가

확인 대상은 세 곳이다.

1. SE80에서 Module Pool program이 만들어졌는지 확인한다.
2. Screen Painter에서 화면 0100이 있고, PBO/PAI flow logic이 있는지 확인한다.
3. SE93에서 transaction code가 module pool program과 시작 화면 0100을 가리키는지 확인한다.

실행 확인은 T-code로 한다. report처럼 프로그램명만 열어 F8 실행을 기대하면 안 된다. 실행이 안 되거나 빈 화면이 뜨면 먼저 T-code, 시작 화면 번호, 화면 활성화 상태를 본다.

### 체험 설계

체험 장치 이름: "PBO/PAI 두 박자 타임라인"

- 기존 embed: `CH16-L01-S01`을 사용한다.
- 데이터: 화면 0100, `P_CONC = C001`, `OK_CODE = SAVE`, next screen 0100과 0을 준비한다.
- 버튼: `T-code 실행`, `PBO 진행`, `사용자 입력`, `PAI 진행`, `다시 PBO`, `화면 종료`.
- 상태 표시: 현재 박자, 화면 번호 `sy-dynnr`, OK_CODE 값, 다음 화면 번호를 나란히 보여 준다.
- 피드백: `START-OF-SELECTION`을 선택하면 "Module Pool 흐름 아님" 경고를 띄우고, T-code 없이 실행을 누르면 "시작 화면을 가진 transaction code 필요" 경고를 표시한다.

### 실수와 주의

- Module Pool을 report처럼 F8로 실행하려고 하면 흐름을 잡기 어렵다. 시작 transaction code가 필요하다.
- Dynpro가 classic SAP GUI 기술이라는 경계를 숨기지 않는다. 기존 시스템 유지보수와 classic 화면 이해를 위해 배우는 장이다.
- PBO/PAI를 selection screen의 `AT SELECTION-SCREEN OUTPUT`과 `AT SELECTION-SCREEN`으로 그대로 치환하지 않는다. 비슷한 "전/후" 감각은 있지만 Dynpro flow logic과 dialog module이라는 다른 구조다.
- 화면 번호 0100은 관례적 예시다. 시스템이 꼭 0100만 쓰는 것은 아니다.

### 정리

CH16의 출발점은 Module Pool이 화면 중심 프로그램이라는 사실이다. T-code가 시작 화면을 호출하고, 화면은 PBO와 PAI를 반복한다. 이 두 박자를 이해하면 뒤 레슨의 Screen Painter, OK_CODE, PF-STATUS, Custom Control이 모두 같은 흐름 안에 들어온다.

---

## CH16-L02 - Screen Number와 Screen Painter

### 왜 필요한가

Module Pool에는 화면이 하나만 있는 것이 아니다. 예매 입력 화면 0100, 상세 확인 화면 0200, 팝업 화면 0300처럼 여러 Dynpro가 있을 수 있다. 화면마다 layout과 flow logic이 따로 있다. 화면 번호를 모르면 "지금 내가 어느 화면의 PBO/PAI를 고치는가"를 잃어버린다.

Screen Painter는 이 화면을 그리는 도구다. 입문자는 여기서 "ABAP 코드만 쓰면 화면이 생긴다"는 생각을 버리고, 화면 layout, element list, flow logic, ABAP module이 함께 맞아야 한다는 구조를 배운다.

### 무엇인가

Dynpro는 번호로 구분된다. 일반적으로 네 자리 번호를 사용하며 예제에서는 0100을 첫 화면으로 둔다. Screen Painter에서는 다음을 만든다.

| 구성 | 설명 | 확인 위치 |
| --- | --- | --- |
| Layout | 입력칸, 텍스트, 버튼의 위치와 크기 | Screen Painter Layout |
| Element List | 화면 요소 이름, 타입, 길이, OK field 등 | Element List |
| Flow Logic | PBO/PAI block과 호출할 `MODULE` | Flow Logic |
| Attributes | next screen, modal 여부, screen type 등 | Screen Attributes |

Flow Logic 예:

```abap
PROCESS BEFORE OUTPUT.
  MODULE status_0100.

PROCESS AFTER INPUT.
  MODULE user_command_0100.
```

Flow Logic의 `MODULE status_0100.`은 ABAP dialog module을 호출하는 dynpro 문장이다. 실제 ABAP 코드는 program include 쪽에 다음처럼 정의한다.

```abap
MODULE status_0100 OUTPUT.
  SET PF-STATUS 'ST100'.
  SET TITLEBAR  'TB100'.
ENDMODULE.

MODULE user_command_0100 INPUT.
  " PAI 처리
ENDMODULE.
```

중요한 구분은 "Flow Logic의 `MODULE` 호출"과 "ABAP program의 `MODULE ... ENDMODULE` 정의"가 서로 다른 위치에 있다는 점이다. 이름이 같아야 연결된다.

### 어떻게 확인하는가

화면 0100을 만들었다면 다음 순서로 확인한다.

1. Screen Attributes에서 screen number가 0100인지 본다.
2. Layout에 `P_CONC`, `P_SEATS`, `OK_CODE` 같은 요소가 있는지 본다.
3. Element List에서 OK field 이름이 지정되어 있는지 본다.
4. Flow Logic에 `PROCESS BEFORE OUTPUT`과 `PROCESS AFTER INPUT`이 있는지 본다.
5. ABAP source에 `MODULE status_0100 OUTPUT`과 `MODULE user_command_0100 INPUT`이 실제로 존재하는지 본다.

활성화 오류가 나면 Flow Logic의 module 이름과 ABAP module 이름이 맞는지 먼저 확인한다. 화면 요소 이름과 전역 변수 이름이 맞는지도 함께 본다.

### 체험 설계

체험 장치 이름: "Screen Painter 연결 지도"

- 데이터: 화면 0100의 layout, element list, flow logic, ABAP source를 네 패널로 나눈다.
- 버튼: `입력칸 추가`, `OK field 지정`, `PBO MODULE 추가`, `PAI MODULE 추가`, `ABAP module 생성`, `활성화 검사`.
- 상태 표시: 화면 요소 이름, 같은 이름의 ABAP 변수 존재 여부, Flow Logic module 호출과 ABAP module 정의의 매칭 상태를 보여 준다.
- 피드백: `MODULE status_0100.`은 있는데 `MODULE status_0100 OUTPUT.` 정의가 없으면 "Flow Logic 호출 대상 없음" 오류를 표시한다.

### 실수와 주의

- Flow Logic에 일반 ABAP 처리 코드를 길게 쓰지 않는다. Flow Logic은 screen event block에서 dialog module을 호출하는 위치다.
- Element 이름과 ABAP global variable 이름이 다르면 자동 data transport가 되지 않는다.
- OK field 이름을 지정하지 않으면 user action의 function code를 안정적으로 읽을 수 없다.
- next screen 0은 화면 sequence 종료와 연결된다. 숫자 0을 단순한 빈 값처럼 취급하지 않는다.

### 정리

Screen Number는 "어느 화면인가"를 구분하는 주소이고, Screen Painter는 그 화면의 layout과 flow logic을 만드는 도구다. Dynpro 개발은 화면 layout, element list, flow logic, ABAP module 네 조각이 모두 맞아야 움직인다.

---

## CH16-L03 - 화면 요소: 입력, 버튼, 체크박스, 라디오, 드롭다운

### 왜 필요한가

사용자는 코드가 아니라 화면 요소와 상호작용한다. 공연ID를 입력칸에 넣고, 좌석 수를 숫자로 입력하고, `예매` 버튼을 누르며, 예약 상태를 dropdown에서 고른다. 개발자는 이 요소들이 ABAP 변수와 어떻게 연결되고, 어떤 요소가 PAI를 발생시키는지 알아야 한다.

CH16-L03은 Screen Painter 요소를 단순 UI 목록으로 외우는 레슨이 아니다. "이 요소는 값을 운반하는가, function code를 발생시키는가, 화면에만 보이는가"를 구분하는 레슨이다.

### 무엇인가

대표 화면 요소:

| 요소 | 역할 | ABAP 연결 |
| --- | --- | --- |
| Text Field | 고정 라벨과 안내 문구 | display 요소, 보통 변수 transport 없음 |
| Input/Output Field | 사용자 입력 또는 값 표시 | 같은 이름의 ABAP global data object |
| Checkbox | 선택/해제 | `CHAR1` 성격, 선택 `X`, 해제 blank |
| Radiobutton | 그룹 중 하나 선택 | 그룹 안에서 하나만 선택 |
| Pushbutton | 누르면 PAI 발생 | function code가 OK_CODE로 전달 |
| Dropdown Listbox | 작은 고정 목록에서 선택 | key는 dynpro field에 들어감 |
| Frame | 화면 요소 묶음 표시 | display 요소 |

ABAP 전역 변수 예:

```abap
DATA: p_conc  TYPE zconcert-concert_id,
      p_seats TYPE i,
      p_vip   TYPE c LENGTH 1,
      p_stat  TYPE c LENGTH 1,
      ok_code TYPE sy-ucomm.
```

Screen Painter에서 input field 이름을 `P_CONC`로 만들고 ABAP program에 같은 이름의 global data object가 있으면 PBO/PAI data transport가 이름 기준으로 일어난다. PBO가 끝날 때 ABAP 변수 값이 dynpro field로 나가고, 사용자가 입력한 뒤 PAI가 시작될 때 dynpro field 값이 ABAP 변수로 들어온다.

Dropdown Listbox는 F4 검색 팝업과 다르다. 목록이 작고 고정적일 때 "펼쳐서 고르는 UI"로 쓴다. 값 목록은 input help를 이용하거나 `VRM_SET_VALUES` 같은 함수로 제공할 수 있다.

```abap
DATA gt_values TYPE vrm_values.
DATA gs_value  LIKE LINE OF gt_values.

MODULE fill_status_list OUTPUT.
  CLEAR gt_values.

  gs_value-key = 'R'.
  gs_value-text = '예약'.
  APPEND gs_value TO gt_values.

  gs_value-key = 'W'.
  gs_value-text = '대기'.
  APPEND gs_value TO gt_values.

  gs_value-key = 'C'.
  gs_value-text = '취소'.
  APPEND gs_value TO gt_values.

  CALL FUNCTION 'VRM_SET_VALUES'
    EXPORTING
      id     = 'P_STAT'
      values = gt_values.
ENDMODULE.
```

위 코드는 classic 형태로 dropdown 값을 채우는 예다. CH10에서 배운 `CALL FUNCTION`을 재사용한다.

### 어떻게 확인하는가

확인할 때는 element list와 PAI 결과를 함께 본다.

1. `P_CONC` input field에 `C001`을 입력하고 Enter를 누른다.
2. PAI module breakpoint에서 ABAP 변수 `p_conc`에 값이 들어왔는지 확인한다.
3. Checkbox를 선택하고 `p_vip = 'X'`인지 본다.
4. Pushbutton `예매`를 누르고 `ok_code = 'SAVE'`인지 본다.
5. Dropdown에서 `예약`을 고르고 key 값 `R`이 `p_stat`에 들어오는지 본다.

### 체험 설계

체험 장치 이름: "화면 요소와 변수 모니터"

- 기존 embed: `CH16-L03-S01`을 사용한다.
- 데이터: `P_CONC`, `P_SEATS`, `P_VIP`, `P_STAT`, `OK_CODE`를 오른쪽 변수 모니터에 보여 준다.
- 버튼: `공연ID 입력`, `좌석 수 변경`, `VIP 체크`, `상태 선택`, `예매 버튼`, `Enter`.
- 상태 표시: 화면 요소, dynpro field 값, ABAP global variable 값, PAI 발생 여부를 분리해 보여 준다.
- 피드백: Pushbutton은 값이 아니라 function code를 보낸다는 점을 강조하고, dropdown에서 text와 key가 다를 수 있음을 표시한다.

### 실수와 주의

- Text Field는 화면 라벨이지 업무 값을 운반하는 입력 필드가 아니다.
- Pushbutton에는 function code가 있어야 PAI에서 어떤 버튼인지 판단할 수 있다.
- Checkbox와 Radiobutton은 값이 보통 `X` 또는 blank로 전달된다. Boolean처럼 말해도 실제 화면 운반 값은 character field임을 보여 준다.
- Dropdown은 검색해야 하는 긴 목록에 적합하지 않다. 많고 검색이 필요하면 F4/Search Help가 더 자연스럽다.

### 정리

Dynpro 화면 요소는 "보이는 모양"과 "ABAP으로 운반되는 값"이 다르다. Input/Output Field, Checkbox, Radiobutton, Dropdown은 값을 운반하고, Pushbutton은 function code를 발생시키며, Text Field와 Frame은 화면 이해를 돕는다. 이 구분이 되어야 PAI에서 입력을 제대로 해석할 수 있다.

---

## CH16-L04 - PBO 처리 흐름

### 왜 필요한가

사용자가 화면을 보기 전에 프로그램은 준비를 끝내야 한다. 제목과 toolbar를 붙이고, dropdown 값을 채우고, 특정 조건에서는 입력칸을 읽기 전용으로 바꿔야 한다. 이 일을 사용자가 버튼을 누른 뒤 처리하면 이미 늦다. 화면이 보이기 직전 실행되는 PBO가 이 책임을 가진다.

CH16-L04는 "화면을 그리기 직전 무엇을 준비하는가"를 다룬다.

### 무엇인가

PBO는 Process Before Output이다. Dynpro flow logic의 `PROCESS BEFORE OUTPUT` block에서 시작되고, 여기서 호출한 `MODULE ... OUTPUT` ABAP dialog module들이 실행된다.

Flow Logic:

```abap
PROCESS BEFORE OUTPUT.
  MODULE status_0100.
  MODULE fill_status_list.
  MODULE modify_screen_0100.
```

ABAP module:

```abap
DATA gs_screen TYPE screen.

MODULE status_0100 OUTPUT.
  SET PF-STATUS 'ST100'.
  SET TITLEBAR  'TB100'.
ENDMODULE.

MODULE modify_screen_0100 OUTPUT.
  LOOP AT SCREEN INTO gs_screen.
    IF gs_screen-name = 'P_SEATS' AND p_locked = 'X'.
      gs_screen-input = '0'.
      MODIFY SCREEN FROM gs_screen.
    ENDIF.
  ENDLOOP.
ENDMODULE.
```

`LOOP AT SCREEN`은 현재 dynpro의 screen element 속성을 하나씩 읽는다. `MODIFY SCREEN FROM gs_screen`을 호출해야 변경한 속성이 실제 화면에 반영된다. 공식문서 기준으로 속성 변경은 PBO마다 static property로 reset되므로, 조건이 계속 적용되어야 한다면 PBO마다 다시 설정해야 한다.

### 어떻게 확인하는가

PBO 확인은 debugger와 화면 비교로 한다.

1. `MODULE status_0100 OUTPUT`에 breakpoint를 둔다.
2. T-code로 화면 0100을 실행해 PBO breakpoint에 도착하는지 확인한다.
3. `SET PF-STATUS` 후 `sy-pfkey`가 원하는 status인지 확인한다.
4. `LOOP AT SCREEN INTO gs_screen`에서 `P_SEATS` row를 찾는다.
5. `p_locked = 'X'`일 때 `gs_screen-input = '0'`으로 바뀌고 화면에서 좌석 수 입력칸이 읽기 전용인지 본다.

### 체험 설계

체험 장치 이름: "PBO 화면 준비 스텝퍼"

- 데이터: `p_locked` on/off, `P_SEATS` screen row, GUI status `ST100`, title `TB100`을 준비한다.
- 버튼: `PBO 시작`, `PF-STATUS 설정`, `TITLEBAR 설정`, `SCREEN LOOP`, `MODIFY SCREEN`, `화면 표시`.
- 상태 표시: `sy-dynnr`, `sy-pfkey`, `sy-title`, `gs_screen-name`, `gs_screen-input`, 화면 미리보기를 보여 준다.
- 피드백: `gs_screen-input`만 바꾸고 `MODIFY SCREEN FROM gs_screen`을 누르지 않으면 미리보기가 바뀌지 않도록 해서 반영 단계를 체감하게 한다.

### 실수와 주의

- PBO에 무거운 DB 조회를 반복해서 넣으면 화면이 표시될 때마다 느려질 수 있다.
- `LOOP AT SCREEN.` 짧은 내장 structure 형식은 새 예제로 쓰지 않는다.
- `screen-active = 0`은 input/output/invisible에 함께 영향을 준다. 단순히 읽기 전용만 원하면 `input = 0`을 우선 고려한다.
- PBO에서 사용자 입력값을 매번 기본값으로 덮어쓰면 사용자가 값을 바꿔도 화면이 다시 돌아올 수 있다.

### 정리

PBO는 사용자가 보기 전에 화면을 준비하는 단계다. 여기서 GUI status, title, dropdown 목록, field 속성을 준비한다. 변경한 screen 속성은 `MODIFY SCREEN FROM gs_screen`으로 반영해야 하고, 화면 속성은 PBO마다 다시 계산된다는 점을 기억해야 한다.

---

## CH16-L05 - PAI 처리 흐름: OK_CODE와 화면 떠나기

### 왜 필요한가

사용자가 화면에서 가장 많이 하는 행동은 버튼을 누르는 것이다. `예매`, `뒤로`, `종료`, `취소`는 모두 다른 의미를 가진다. PAI는 사용자가 행동한 뒤 실행되며, 어떤 기능이 선택되었는지를 function code로 판단한다. 이 판단을 제대로 못 하면 이전 버튼 명령이 남아 잘못 저장되거나, 닫아야 할 화면이 계속 남는다.

CH16-L05는 PAI에서 `OK_CODE`를 안전하게 읽고, 화면을 떠나는 문장을 구분하는 레슨이다.

### 무엇인가

PAI는 Process After Input이다. 화면 action이 PAI를 일으키면 function code가 `sy-ucomm`과 OK field에 전달될 수 있다. 공식문서의 권장 패턴은 화면의 OK field와 같은 이름의 ABAP field를 두고, PAI 처음에 보조 변수로 복사한 뒤 OK field를 지우는 것이다.

classic 예:

```abap
DATA: ok_code TYPE sy-ucomm,
      save_ok TYPE sy-ucomm.

MODULE user_command_0100 INPUT.
  save_ok = ok_code.
  CLEAR ok_code.

  CASE save_ok.
    WHEN 'SAVE'.
      PERFORM check_booking.
    WHEN 'BACK'.
      LEAVE TO SCREEN 0.
    WHEN 'EXIT'.
      LEAVE PROGRAM.
    WHEN 'CANCEL'.
      LEAVE TO SCREEN 0.
  ENDCASE.
ENDMODULE.
```

화면을 떠나는 대표 문장:

| 문장 | 의미 | 입문자 감각 |
| --- | --- | --- |
| `LEAVE TO SCREEN 0` | next dynpro 0으로 이동해 현재 dynpro sequence 종료 | 현재 화면 흐름을 닫고 호출자로 돌아감 |
| `LEAVE PROGRAM` | 프로그램 전체 종료 | transaction 자체를 끝내는 강한 종료 |
| `SET SCREEN dynnr` | 다음 dynpro 번호를 지정 | 즉시 나가지 않음 |
| `LEAVE SCREEN` | 현재 dynpro processing을 끝내고 next dynpro 호출 | `SET SCREEN`과 함께 자주 이해 |

`SET SCREEN`은 다음 화면을 바꾸지만 현재 processing을 즉시 멈추지 않는다. "지금 바로 떠나기"가 필요하면 `LEAVE SCREEN` 또는 `LEAVE TO SCREEN`을 함께 이해해야 한다.

### 어떻게 확인하는가

확인 시나리오:

1. `SAVE` 버튼을 누르고 PAI breakpoint에서 `ok_code = 'SAVE'`인지 본다.
2. `save_ok = ok_code` 뒤 `save_ok`에 값이 보존되는지 본다.
3. `CLEAR ok_code` 뒤 `ok_code`가 비는지 본다.
4. Enter를 다시 눌렀을 때 이전 `SAVE`가 남아 반복 실행되지 않는지 확인한다.
5. `BACK`, `EXIT`, `CANCEL`을 각각 눌러 `LEAVE TO SCREEN 0`과 `LEAVE PROGRAM`의 차이를 관찰한다.

### 체험 설계

체험 장치 이름: "OK_CODE 안전 분기 실험실"

- 데이터: `OK_CODE`, `SAVE_OK`, `sy-ucomm`, next screen, 화면 stack을 보여 준다.
- 버튼: `SAVE`, `BACK`, `EXIT`, `CANCEL`, `Enter`, `CLEAR 생략`.
- 상태 표시: PAI 진입 시 function code, 보조 변수 복사 후 값, clear 후 값, 실행된 `CASE` branch를 보여 준다.
- 피드백: `CLEAR ok_code`를 생략한 상태에서 Enter를 누르면 이전 `SAVE`가 남아 재실행될 수 있다는 경고를 시뮬레이션한다.

### 실수와 주의

- `sy-ucomm`만 믿고 OK field를 관리하지 않으면 화면별 function code 흐름을 통제하기 어렵다.
- PAI에서 `ok_code`를 지우기 전에 보조 변수에 저장해야 한다.
- `LEAVE PROGRAM`은 프로그램 종료다. 단순히 한 화면 뒤로 가는 버튼에 무조건 쓰면 사용자가 transaction 전체를 잃을 수 있다.
- 저장되지 않은 변경이 있는 화면에서는 BACK/EXIT/CANCEL 전에 확인 팝업이나 상태 점검이 필요할 수 있다. CH16에서는 흐름만 배우고 팝업 설계는 확장하지 않는다.

### 정리

PAI는 사용자의 행동을 해석하는 단계다. `OK_CODE`를 보조 변수로 옮기고 바로 `CLEAR`한 뒤 `CASE`로 분기하는 패턴이 기본이다. 화면 종료와 프로그램 종료를 구분해야 사용자에게 안전한 흐름을 제공할 수 있다.

---

## CH16-L06 - PF-STATUS와 TITLEBAR

### 왜 필요한가

화면에는 입력칸만 있는 것이 아니다. 위쪽에는 메뉴바, 표준 툴바, application toolbar, function key가 있고, 사용자는 그 버튼으로 저장하거나 뒤로 가거나 도움말을 연다. 화면 제목도 사용자가 지금 어떤 업무를 하는지 알려 준다. 이 상단 UI를 제대로 설정하지 않으면 버튼이 보이지 않거나, 보이는데 PAI에서 처리할 function code와 맞지 않는다.

PF-STATUS와 TITLEBAR는 Dynpro 화면의 상단 사용자 인터페이스를 제어한다.

### 무엇인가

GUI Status, 흔히 PF-STATUS는 메뉴바, standard toolbar, application toolbar, function key의 기능 코드를 묶은 객체다. Menu Painter(SE41)에서 만들고, PBO에서 `SET PF-STATUS`로 화면에 적용한다. Titlebar도 PBO에서 `SET TITLEBAR`로 지정한다.

classic 예:

```abap
MODULE status_0100 OUTPUT.
  SET PF-STATUS 'ST100'.
  SET TITLEBAR  'TB100'.
ENDMODULE.
```

버튼을 상황에 따라 숨기려면 `EXCLUDING`을 사용한다.

```abap
DATA gt_excl TYPE STANDARD TABLE OF sy-ucomm.
DATA gv_fcode TYPE sy-ucomm.

MODULE status_0100 OUTPUT.
  CLEAR gt_excl.

  IF p_locked = 'X'.
    gv_fcode = 'SAVE'.
    APPEND gv_fcode TO gt_excl.
  ENDIF.

  SET PF-STATUS 'ST100' EXCLUDING gt_excl.
  SET TITLEBAR  'TB100' WITH p_conc.
ENDMODULE.
```

`SET TITLEBAR ... WITH`는 title placeholder에 값을 넣을 때 사용한다. 예를 들어 title text가 `공연 &1 예매`라면 `p_conc`가 &1에 들어간다.

### 어떻게 확인하는가

확인 순서:

1. PBO에서 `SET PF-STATUS 'ST100'`가 실행되는지 본다.
2. 화면 상단에 `SAVE`, `BACK`, `EXIT`, `CANCEL` 버튼이 보이는지 확인한다.
3. `sy-pfkey`에 현재 status 이름이 들어왔는지 본다.
4. `SET TITLEBAR 'TB100' WITH p_conc` 후 화면 제목과 `sy-title`을 확인한다.
5. `p_locked = 'X'`일 때 `SAVE` 버튼이 제외되는지 본다.

### 체험 설계

체험 장치 이름: "Toolbar와 Function Code 매핑판"

- 데이터: GUI status `ST100`, function codes `SAVE/BACK/EXIT/CANCEL/HELP`, 제외 목록 `gt_excl`, title `TB100`을 준비한다.
- 버튼: `PF-STATUS 적용`, `TITLEBAR 적용`, `SAVE 제외`, `버튼 누르기`, `FctCode mismatch 만들기`.
- 상태 표시: toolbar 미리보기, `sy-pfkey`, `sy-title`, `OK_CODE`, PAI `CASE` branch를 보여 준다.
- 피드백: toolbar 버튼의 function code와 PAI `CASE` 값이 다르면 "버튼은 눌렸지만 처리 branch 없음" 경고를 표시한다.

### 실수와 주의

- PF-STATUS는 PBO에서 늦지 않게 설정해야 한다. 설정하지 않으면 기대한 메뉴/툴바가 나타나지 않는다.
- Menu Painter의 function code와 ABAP `CASE save_ok` 값이 일치해야 한다.
- `EXCLUDING`에 없는 function code를 넣으면 무시될 수 있다. 오타를 조용히 지나치지 않게 점검한다.
- 제목은 장식이 아니다. 사용자가 어느 공연, 어느 업무 화면에 있는지 알려 주는 안전 장치다.

### 정리

PF-STATUS는 화면 위 버튼과 function code의 설계도이고, TITLEBAR는 현재 화면의 업무 맥락을 보여 준다. 둘 다 PBO에서 설정하고, PAI의 `OK_CODE` 처리와 같은 function code 체계로 맞춰야 한다.

---

## CH16-L07 - Custom Control, Container, Tabstrip, Subscreen, Status Icon

### 왜 필요한가

입력 화면만으로 끝나는 업무는 많지 않다. 예매 화면에는 이후 CH17에서 좌석표나 예매 목록을 ALV Grid로 보여 주고 싶다. 또 한 화면을 공연 정보, 예매자 정보, 상태 정보로 나누고 싶을 수 있다. 단순 input field만으로는 이런 구성을 만들기 어렵다.

CH16-L07은 화면 안에 "무엇을 얹을 자리"를 만드는 요소들을 다룬다. 여기서 완성 ALV를 구현하지는 않는다. CH17을 위한 자리와 구조를 이해하는 것이 목표다.

### 무엇인가

대표 확장 요소:

| 요소 | 역할 | CH16에서의 범위 |
| --- | --- | --- |
| Custom Control | 화면 안의 사각 영역 | CH17 ALV Grid를 얹을 자리 |
| Custom Container | Custom Control 영역과 control 객체를 연결 | `CL_GUI_CUSTOM_CONTAINER` 선행 사용 |
| Tabstrip | 한 화면을 여러 tab page로 분리 | tab title, function code, subscreen 연결 개념 |
| Subscreen Area | 화면 안에 다른 dynpro를 끼워 넣는 영역 | `CALL SUBSCREEN` 흐름 이해 |
| Status Icon | 상태를 icon/text/tooltip으로 표시 | 매진, 가능, 오류 상태 표시 |

Custom Control과 Container 예:

```abap
DATA go_cont TYPE REF TO cl_gui_custom_container.

MODULE create_container_0100 OUTPUT.
  IF go_cont IS INITIAL.
    CREATE OBJECT go_cont
      EXPORTING
        container_name = 'CONT100'.
  ENDIF.
ENDMODULE.
```

> [선행 사용] `TYPE REF TO`와 `CREATE OBJECT`는 CH20 OO에서 정식으로 배운다. CH16에서는 "화면의 Custom Control 이름 `CONT100`에 container 객체를 연결한다"는 블랙박스로만 다룬다.

Subscreen flow logic 예:

```abap
PROCESS BEFORE OUTPUT.
  CALL SUBSCREEN sub_area INCLUDING sy-repid '0110'.

PROCESS AFTER INPUT.
  CALL SUBSCREEN sub_area.
  MODULE user_command_0100.
```

Subscreen은 자체 OK field를 가질 수 없다. 사용자 명령은 main screen의 OK field 흐름으로 모인다.

Tabstrip은 tab title과 subscreen area를 연결한다. ABAP program에서는 `CONTROLS tab_main TYPE TABSTRIP.` 같은 선언으로 tabstrip control structure를 만들고, `tab_main-activetab`에 활성 tab function code를 보관한다.

Table Control은 이 장에서 제외한다. 공식문서에는 Table Control이 있고 내부적으로 PBO/PAI loop와 screen table 구조를 가진다. 하지만 현재 커리큘럼에서는 화면 표를 CH17 Grid ALV로 대체한다.

### 어떻게 확인하는가

확인 기준:

1. Screen Painter layout에 Custom Control 영역 `CONT100`이 있는지 본다.
2. ABAP module에서 `container_name = 'CONT100'`이 정확히 같은 이름인지 확인한다.
3. PBO에서 container가 매번 새로 생성되지 않도록 `IF go_cont IS INITIAL` 조건이 있는지 본다.
4. Subscreen area 이름과 `CALL SUBSCREEN`의 area 이름이 일치하는지 본다.
5. Tabstrip을 쓴다면 tab title function code와 `activetab` 값, 포함할 subscreen number가 맞는지 본다.

### 체험 설계

체험 장치 이름: "화면 분할과 컨테이너 설계판"

- 데이터: 화면 0100, Custom Control `CONT100`, subscreen area `SUB_MAIN`, tab titles `TAB_INFO/TAB_BOOK`, status icon field `P_ICON`을 준비한다.
- 버튼: `Custom Control 배치`, `Container 연결`, `Tab 선택`, `Subscreen 포함`, `Status Icon 변경`, `Table Control 제외 비교`.
- 상태 표시: Screen Painter 영역 이름, ABAP object 변수, active tab, included subscreen number, status icon text를 보여 준다.
- 피드백: 화면 영역 이름과 `container_name`이 다르면 "컨테이너가 붙을 화면 영역을 찾지 못함" 경고를 표시한다. Table Control을 선택하면 "CH16 범위 제외, CH17 ALV로 대체" 안내를 표시한다.

### 실수와 주의

- Custom Control은 내용물이 아니다. 사각 영역일 뿐이며, container와 실제 control을 만들어야 내용이 보인다.
- Container를 PBO마다 새로 만들면 control lifecycle 문제가 생긴다. 보통 initial check로 한 번만 생성한다.
- Subscreen에는 자체 OK field가 없다. OK_CODE 처리 책임은 main screen 흐름으로 본다.
- Tabstrip은 예쁘게 탭만 그린다고 끝나지 않는다. tab title function code, active tab, subscreen area, `CALL SUBSCREEN`이 맞아야 한다.
- Table Control을 이 장에 끌어오지 않는다. 표 형태 데이터 표시는 CH17 Grid ALV에서 한다.

### 정리

CH16-L07은 화면 확장 구조를 잡는 레슨이다. Custom Control은 CH17 ALV를 담을 자리이고, Subscreen과 Tabstrip은 화면을 나누는 구조다. OO 문법과 Grid 구현은 뒤로 미루고, 지금은 "화면 영역과 프로그램 연결"까지만 정확히 잡는다.

---

## CH16-L08 - 실습: 예매 입력 화면 만들기

### 왜 필요한가

앞 레슨들을 따로 배우면 Dynpro가 조각처럼 느껴질 수 있다. 마지막 실습에서는 실제 예매 입력 화면 0100을 만든다고 가정하고, Screen Painter 요소, PBO, PAI, OK_CODE, PF-STATUS, 검증을 하나의 흐름으로 묶는다.

이 실습의 성공 기준은 DB에 예매를 저장하는 것이 아니다. 저장은 CH24 DML과 CH25 lock에서 다룬다. CH16의 목표는 사용자가 값을 입력하고, 버튼을 누르고, 검증 메시지를 받고, 화면을 안전하게 닫는 흐름을 만드는 것이다.

### 무엇인가

실습 요구사항:

- Module Pool program을 만들고 transaction code로 화면 0100을 실행한다.
- 화면 0100에 `P_CONC`, `P_PERF`, `P_SEATS`, `P_CUST`, `P_STAT`, `OK_CODE`를 둔다.
- PBO에서 PF-STATUS와 TITLEBAR를 설정하고 dropdown 상태 목록을 채운다.
- PAI에서 `OK_CODE`를 보조 변수로 저장하고 `CLEAR ok_code`한다.
- `SAVE`일 때 CH10-L07의 `can_book` subroutine을 호출해 예매 가능 여부를 검증한다.
- `BACK`, `EXIT`, `CANCEL`일 때 화면을 닫는다.
- 실제 DB 저장은 하지 않는다.

통합 예제:

```abap
PROGRAM sapmzconcert.

DATA: p_conc  TYPE zconcert-concert_id,
      p_perf  TYPE c LENGTH 3,
      p_seats TYPE i,
      p_cust  TYPE c LENGTH 30,
      p_stat  TYPE c LENGTH 1,
      ok_code TYPE sy-ucomm,
      save_ok TYPE sy-ucomm.

DATA: gt_values TYPE vrm_values,
      gs_value  LIKE LINE OF gt_values.

PROCESS BEFORE OUTPUT.
  MODULE status_0100.
  MODULE fill_status_list.

PROCESS AFTER INPUT.
  MODULE user_command_0100.

MODULE status_0100 OUTPUT.
  SET PF-STATUS 'ST100'.
  SET TITLEBAR  'TB100' WITH p_conc.
ENDMODULE.

MODULE fill_status_list OUTPUT.
  CLEAR gt_values.

  gs_value-key = 'R'.
  gs_value-text = '예약'.
  APPEND gs_value TO gt_values.

  gs_value-key = 'W'.
  gs_value-text = '대기'.
  APPEND gs_value TO gt_values.

  CALL FUNCTION 'VRM_SET_VALUES'
    EXPORTING
      id     = 'P_STAT'
      values = gt_values.
ENDMODULE.

MODULE user_command_0100 INPUT.
  DATA lv_ok TYPE abap_bool.

  save_ok = ok_code.
  CLEAR ok_code.

  CASE save_ok.
    WHEN 'SAVE'.
      PERFORM can_book USING p_conc p_perf p_seats CHANGING lv_ok.

      IF lv_ok = abap_true.
        MESSAGE '예매 가능: 실제 저장은 CH24에서 처리합니다' TYPE 'S'.
      ELSE.
        MESSAGE '좌석이 부족합니다' TYPE 'E'.
      ENDIF.

    WHEN 'BACK' OR 'CANCEL'.
      LEAVE TO SCREEN 0.

    WHEN 'EXIT'.
      LEAVE PROGRAM.
  ENDCASE.
ENDMODULE.
```

위 예제는 교육용으로 Flow Logic과 ABAP module을 한 코드 블록에 함께 보여 준다. 실제 SAP Workbench에서는 Flow Logic은 Screen Painter에, ABAP module은 program source에 위치한다.

### 어떻게 확인하는가

실습 검증 시나리오:

| 시나리오 | 입력/행동 | 기대 결과 |
| --- | --- | --- |
| 정상 예매 검증 | `C001`, 회차 `001`, 좌석 `2`, `SAVE` | 성공 메시지, DB 저장 없음 |
| 좌석 부족 | 좌석 수 과다, `SAVE` | `MESSAGE E`, 화면 유지 |
| BACK | `BACK` | `LEAVE TO SCREEN 0`으로 화면 sequence 종료 |
| EXIT | `EXIT` | `LEAVE PROGRAM`으로 프로그램 종료 |
| 상태 선택 | Dropdown에서 `예약` 선택 | `p_stat = 'R'` |
| OK_CODE 반복 방지 | `SAVE` 후 Enter | 이전 SAVE가 남아 재실행되지 않음 |

debugger 확인 포인트:

- PBO: `status_0100`, `fill_status_list`
- PAI: `ok_code`, `save_ok`, `CLEAR ok_code`
- 검증: `lv_ok`, `MESSAGE` type
- 화면 종료: next dynpro 0 또는 program termination

### 체험 설계

체험 장치 이름: "예매 입력 Dynpro 통합 시뮬레이터"

- 데이터: 공연 `C001`, 회차 `001`, 잔여 좌석 `5`, 상태 목록 `R/W`, 사용자 입력 좌석 `2/9`를 준비한다.
- 버튼: `T-code 실행`, `PBO 준비`, `값 입력`, `SAVE`, `BACK`, `EXIT`, `좌석 과다 입력`, `Enter 반복`.
- 상태 표시: 화면 미리보기, PBO/PAI timeline, `OK_CODE/SAVE_OK`, `p_conc/p_perf/p_seats/p_stat`, 검증 결과, message area를 보여 준다.
- 피드백: 성공 시 "저장은 CH24" 배지를 표시하고, 좌석 부족 시 화면을 유지하며 `P_SEATS` 입력칸을 강조한다. `CLEAR ok_code`를 빼면 Enter 반복으로 SAVE가 다시 실행되는 위험을 보여 준다.

### 실수와 주의

- Flow Logic과 ABAP source를 같은 위치에 쓰는 것으로 오해하지 않는다. 실습 설명은 한 화면에 보여 주기 위해 합친 것이다.
- `can_book`은 CH10의 subroutine 재사용이다. 이 장에서 예매 로직을 새로 깊게 설계하지 않는다.
- 성공 메시지가 나와도 DB 저장은 하지 않는다. `INSERT`와 `COMMIT WORK`는 CH24 범위다.
- `MESSAGE E` 후 화면이 유지되는 것을 실패가 아니라 정상 검증 흐름으로 이해한다.
- `EXIT`에 `LEAVE TO SCREEN 0`을 쓸지 `LEAVE PROGRAM`을 쓸지는 업무 UX 정책에 따라 다를 수 있다. 이 실습에서는 차이를 보여 주기 위해 구분한다.

### 정리

CH16 실습은 직접 만든 화면의 생명주기를 한 번에 묶는다. PBO는 화면을 준비하고, 사용자는 값을 입력하고, PAI는 `OK_CODE`를 읽어 검증과 종료를 처리한다. 이 구조를 이해하면 CH17에서 화면 안에 Grid ALV를 얹는 이유와 위치가 자연스럽게 보인다.

---

## CH16 마무리 학습 흐름

CH16을 끝낸 학습자는 Dynpro를 "오래된 화면 기술"로만 치워 두지 않고, 기존 SAP GUI 업무 화면을 읽고 유지보수할 수 있는 최소 구조로 이해해야 한다.

다음 질문에 답할 수 있어야 한다.

1. Module Pool은 왜 T-code와 시작 화면이 필요한가.
2. Dynpro는 layout, element list, flow logic, ABAP dialog module이 어떻게 연결되는가.
3. PBO와 PAI는 각각 어떤 책임을 가지는가.
4. 화면 요소의 값은 언제 ABAP global data object와 주고받는가.
5. `OK_CODE`는 왜 보조 변수에 저장한 뒤 `CLEAR`하는가.
6. `LEAVE TO SCREEN 0`, `LEAVE SCREEN`, `LEAVE PROGRAM`, `SET SCREEN`은 어떻게 다른가.
7. PF-STATUS와 TITLEBAR는 왜 PBO에서 설정하는가.
8. Custom Control, Tabstrip, Subscreen은 CH17 이후 화면 확장의 어느 위치에 필요한가.
9. Table Control을 왜 이 커리큘럼에서 제외하고 ALV로 넘기는가.

최종 암기 문장:

```text
Dynpro는 직접 설계한 화면이고,
PBO는 보여 주기 전 준비,
PAI는 사용자가 행동한 뒤 처리,
OK_CODE는 복사하고 지운 뒤 분기,
화면 표는 Table Control이 아니라 CH17 ALV로 이어진다.
```
