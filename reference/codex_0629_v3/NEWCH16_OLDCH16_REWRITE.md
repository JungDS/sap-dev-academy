# CH16_REWRITE - Screen Programming / Dynpro 기초

> 기준 소스: `content/abap/CH16`
> 보조 참고: `reference/codex_0625_v2/CH16_REWRITE.md`, `reference/codex_0625_v2/CH16_QA.md`, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`
> 작성 목표: IT 비전공자도 "내가 설계한 SAP GUI 화면이 어떤 순서로 뜨고, 어떤 변수로 값이 오가며, 어떤 command로 반응하는지" 빠짐없이 이해하게 만든다.

## CH16 전체 강의 설계

CH15까지는 SAP이 만들어 주는 selection screen을 중심으로 배웠다. `PARAMETERS`, `SELECT-OPTIONS`, `AT SELECTION-SCREEN`만으로도 많은 report를 만들 수 있다. 하지만 업무 화면이 항상 selection screen처럼 단순하지는 않다. 공연 예매 화면처럼 공연 ID, 회차, 좌석 수, 예매자, 예매 버튼, 취소 버튼, 상태 표시가 한 화면에 배치되어야 할 때가 있다.

CH16은 이 지점에서 Dynpro를 소개한다. Dynpro는 classic SAP GUI 화면 기술이다. 지금 새 UX 전략을 논하려는 장이 아니라, 기존 SAP GUI 업무 화면을 읽고 유지보수하고, CH17에서 화면 안에 Grid ALV를 얹기 위한 기초를 잡는 장이다.

이 장의 핵심 문장은 다음과 같다.

```text
Module Pool은 T-code로 시작하고,
Dynpro 화면은 PBO -> 화면 표시 -> 사용자 입력 -> PAI를 반복하며,
버튼 명령은 OK_CODE로 들어오고,
화면 종료는 LEAVE 문으로 제어한다.
```

학습 경계:

- Module Pool과 Dynpro는 classic SAP GUI 기술로 설명한다.
- `START-OF-SELECTION` 같은 report event를 Module Pool에 기대하지 않는다.
- Table Control은 공식 문서에는 있지만 이 커리큘럼에서는 제외한다. 화면 안의 표는 CH17 Grid ALV로 대체한다.
- `TYPE REF TO`, `CREATE OBJECT`는 CH20 OO 이전의 선행 사용이다. CH16에서는 Custom Control 영역에 container 객체를 붙이는 블랙박스로만 다룬다.
- 실제 데이터 생성, 변경, 저장, lock, LUW는 CH24와 CH25 범위다. CH16 실습은 화면 입력과 검증까지만 다룬다.

## CH16-L01 - Module Pool 프로그램 구조

### 왜 필요한가

selection screen은 정해진 틀 안에서 조건을 입력받기에 좋다. 하지만 사용자가 업무 화면처럼 느끼는 입력 화면을 만들려면 더 많은 제어가 필요하다. 예를 들어 공연 예매 화면에는 공연 ID 입력칸, 좌석 수, 예매자명, 결제 방식, 예매 버튼, 취소 버튼이 있어야 한다. 이 화면은 단순 조건 입력 화면이 아니라 사용자가 업무 행동을 수행하는 화면이다.

Module Pool은 이런 화면 중심 프로그램을 만들기 위한 classic 구조다. report가 "실행해서 결과를 본다"에 가깝다면, Module Pool은 "화면을 띄우고 사용자의 행동에 반응한다"에 가깝다.

### 무엇인가

Dynpro는 Dynamic Program의 줄임말로, SAP GUI 화면을 의미한다. Dynpro는 화면 layout, 화면 attributes, flow logic으로 구성된다. Module Pool은 이런 화면을 담고 처리하는 ABAP program 유형이다.

Report와 Module Pool의 차이:

| 구분 | Report | Module Pool |
| --- | --- | --- |
| 시작 방식 | SE38 실행, F8, report transaction | T-code로 시작 |
| 중심 | 데이터 조회와 출력 | 화면과 사용자 action |
| 흐름 | report event | Dynpro sequence |
| 대표 event | `START-OF-SELECTION` | PBO, PAI |
| 화면 설계 | selection screen 중심 | Screen Painter로 직접 설계 |
| 대표 실수 | 조회 위치 혼동 | T-code, 시작 화면, OK_CODE 누락 |

Module Pool의 기본 흐름:

```text
사용자가 T-code 실행
  -> 시작 화면 0100 호출
  -> PBO에서 화면 표시 전 준비
  -> 화면이 사용자에게 표시
  -> 사용자가 입력하고 버튼 또는 Enter
  -> PAI에서 입력과 command 처리
  -> 다음 화면 또는 다시 같은 화면의 PBO
```

### 어떻게 확인하는가

1. SE80에서 Module Pool program을 연다.
2. 화면 0100 같은 dynpro가 있는지 확인한다.
3. 화면의 flow logic에 `PROCESS BEFORE OUTPUT`과 `PROCESS AFTER INPUT`이 있는지 확인한다.
4. SE93에서 transaction code가 Module Pool program과 시작 화면 번호를 가리키는지 확인한다.
5. 실행할 때 report처럼 F8만 누르는 것이 아니라 T-code로 시작하는지 확인한다.

### 체험 설계

학습 장치는 "PBO/PAI 두 박자 타임라인"으로 설계한다.

- 화면 왼쪽: T-code, 화면 0100, PBO, 사용자 입력, PAI, next screen을 세로 흐름으로 표시한다.
- 화면 오른쪽: `P_CONC`, `P_SEATS`, `OK_CODE`, next screen 상태를 카드로 보여 준다.
- 버튼: `T-code 실행`, `PBO 진행`, `사용자 입력`, `PAI 진행`, `다시 PBO`, `화면 종료`.
- 상태: 현재 화면 번호, 현재 박자, 누른 function code, 다음 화면 번호.
- 피드백: 사용자가 "START-OF-SELECTION에 처리"를 선택하면 "Module Pool은 report event가 아니라 PBO/PAI 흐름"이라고 알려 준다.

기존 embed `CH16-L01-S01`은 PBO와 PAI 두 박자를 보여 주는 용도로 적합하다. 강의에서는 "두 박자를 외우는 도구"가 아니라 "사용자 입력 전과 후의 책임을 나누는 도구"로 설명한다.

### 실수와 주의

- Module Pool은 T-code와 시작 화면 설정이 없으면 일반 report처럼 실행할 수 없다.
- PBO/PAI를 CH15의 selection screen event와 완전히 같은 것으로 설명하지 않는다. 비슷한 전후 감각은 있지만 구조가 다르다.
- Dynpro는 classic SAP GUI 기술이다. 기존 시스템 유지보수와 CH17 화면 기반 ALV를 위해 배운다.
- 화면 번호를 모르면 지금 어느 화면의 flow logic을 고치는지 잃어버린다.

### 정리

CH16의 출발점은 "화면 중심 프로그램은 report와 실행 방식부터 다르다"는 사실이다. Module Pool은 T-code로 시작하고, Dynpro는 PBO와 PAI를 반복한다.

## CH16-L02 - Screen Number와 Screen Painter

### 왜 필요한가

화면이 하나만 있으면 단순하다. 하지만 실제 업무 프로그램은 입력 화면, 상세 화면, 팝업 화면처럼 여러 화면을 가진다. 화면마다 번호가 있고, layout과 flow logic도 따로 있다. 화면 번호와 Screen Painter 구조를 모르면 "버튼은 눌렀는데 왜 다른 화면이 안 뜨지?", "PBO를 고쳤는데 왜 화면이 안 바뀌지?" 같은 문제가 생긴다.

### 무엇인가

Dynpro는 보통 네 자리 화면 번호를 가진다. 예를 들어 예매 입력 화면은 0100, 상세 확인 화면은 0200, 팝업성 확인 화면은 0300처럼 둔다.

Screen Painter에서 확인할 핵심 영역:

| 영역 | 의미 | 확인할 것 |
| --- | --- | --- |
| Attributes | 화면 기본 속성 | 화면 번호, normal/subscreen 여부 |
| Layout | 실제 화면 요소 배치 | 입력칸, 버튼, text, custom control |
| Element List | 화면 요소 속성 | 이름, type, function code, dropdown 여부 |
| Flow Logic | PBO/PAI 흐름 | 호출할 dialog module |

Flow Logic 예:

```abap
PROCESS BEFORE OUTPUT.
  MODULE status_0100.

PROCESS AFTER INPUT.
  MODULE user_command_0100.
```

Flow Logic의 `MODULE status_0100.`은 화면 flow logic 문장이다. 실제 ABAP 코드는 program include에 다음처럼 따로 정의한다.

```abap
MODULE status_0100 OUTPUT.
  SET PF-STATUS 'ST100'.
ENDMODULE.

MODULE user_command_0100 INPUT.
  " PAI 처리
ENDMODULE.
```

중요한 구분은 두 가지다.

- Flow Logic: 화면이 어느 module을 호출할지 적는다.
- ABAP source: 호출될 `MODULE ... OUTPUT` 또는 `MODULE ... INPUT`을 정의한다.

### 어떻게 확인하는가

1. Screen Painter에서 화면 0100을 연다.
2. Layout에 `P_CONC`, `P_SEATS`, `OK_CODE` 같은 요소가 있는지 본다.
3. Element List에서 요소 이름과 function code를 확인한다.
4. Flow Logic에 PBO와 PAI block이 있는지 본다.
5. ABAP source에 같은 이름의 dialog module이 존재하는지 본다.
6. 화면과 프로그램을 함께 activate했는지 확인한다.

### 체험 설계

학습 장치는 "Screen Painter 연결 점검판"으로 설계한다.

- 왼쪽: 화면 layout 미리보기.
- 가운데: element list 표.
- 오른쪽: flow logic과 ABAP module 정의.
- 버튼: `입력칸 추가`, `OK field 지정`, `PBO MODULE 추가`, `PAI MODULE 추가`, `ABAP module 생성`, `활성화 검사`.
- 피드백: Flow Logic에는 `MODULE status_0100.`이 있는데 ABAP source에 `MODULE status_0100 OUTPUT.`이 없으면 "호출 대상 module 없음"을 표시한다.

### 실수와 주의

- 화면 요소 이름과 ABAP 전역 변수 이름이 다르면 값 transport가 기대대로 되지 않는다.
- Flow Logic에 일반 ABAP 로직을 길게 쓰지 않는다. Flow Logic은 화면 전용 문법으로 module 호출을 중심으로 둔다.
- 화면 0100을 고쳤는데 T-code 시작 화면이 0200이면 수정이 보이지 않는다.
- 화면과 program include를 모두 activate해야 한다.

### 정리

Dynpro 화면은 번호, layout, element list, flow logic, ABAP dialog module이 함께 맞아야 동작한다. Screen Painter는 단순 그림판이 아니라 화면과 program을 연결하는 설계 도구다.

## CH16-L03 - 화면 요소: 입력, 버튼, 체크박스, 라디오, 드롭다운

### 왜 필요한가

화면 요소는 "보이는 모양"만 다르지 않다. 어떤 요소는 값을 ABAP 변수로 운반하고, 어떤 요소는 command를 발생시키며, 어떤 요소는 단순 안내만 한다. 이 차이를 모르면 버튼을 눌러도 PAI에서 반응하지 않거나, 체크박스 값을 숫자처럼 다루거나, dropdown을 F4 search help처럼 오해하게 된다.

### 무엇인가

대표 화면 요소:

| 요소 | 화면에서 보이는 것 | ABAP 관점 |
| --- | --- | --- |
| Input/Output Field | 입력칸 또는 표시칸 | 같은 이름의 전역 변수와 연결 |
| Text Field | 라벨과 설명 | 값 transport 없음 |
| Push Button | 버튼 | function code를 OK field로 전달 |
| Checkbox | 켜기/끄기 | 보통 `CHAR1` 값, 체크는 `X`, 해제는 공백 |
| Radiobutton | 그룹 중 하나 선택 | 그룹 안에서 하나의 선택만 유효 |
| Dropdown/Listbox | 목록에서 선택 | VRM으로 값 목록 설정 |
| Status Icon | 상태 표시 | 상태값을 icon처럼 표시 |

예매 입력 화면의 전역 변수 예:

```abap
DATA: p_conc  TYPE zconcert-concert_id,
      p_perf  TYPE zperf-perf_id,
      p_seats TYPE i,
      p_cust  TYPE c LENGTH 30,
      p_agree TYPE c LENGTH 1,
      p_grade TYPE c LENGTH 3,
      ok_code TYPE sy-ucomm.
```

버튼은 값 입력 field와 다르다. `예매` 버튼을 누르면 버튼의 function code 예를 들어 `SAVE`가 OK field로 전달된다. 그래서 PAI module에서 `OK_CODE`를 읽어 `CASE`로 분기한다.

Dropdown은 값이 적고 고정되어 있을 때 적합하다. 예를 들어 좌석 등급이 VIP, R, S, A 네 가지라면 dropdown이 편하다. 반대로 값이 많고 검색이 필요하면 CH09의 search help가 더 적합하다.

VRM으로 dropdown 값을 채우는 기본형:

```abap
DATA: gt_values TYPE vrm_values,
      gs_value  TYPE vrm_value.

MODULE fill_grade_list OUTPUT.
  CLEAR gt_values.

  gs_value-key  = 'VIP'.
  gs_value-text = 'VIP석'.
  APPEND gs_value TO gt_values.

  gs_value-key  = 'R'.
  gs_value-text = 'R석'.
  APPEND gs_value TO gt_values.

  CALL FUNCTION 'VRM_SET_VALUES'
    EXPORTING
      id     = 'P_GRADE'
      values = gt_values.
ENDMODULE.
```

### 어떻게 확인하는가

1. Layout에서 각 요소의 name을 확인한다.
2. ABAP source에 같은 이름의 전역 변수가 있는지 본다.
3. Push Button에는 function code가 있는지 확인한다.
4. 체크박스를 눌렀을 때 값이 `X`와 공백으로 바뀌는지 debugger에서 본다.
5. Dropdown은 PBO에서 `VRM_SET_VALUES`가 호출된 뒤 목록이 나타나는지 확인한다.

### 체험 설계

학습 장치는 "Dynpro 요소와 변수 모니터"로 설계한다.

- 화면 왼쪽: 예매 입력 화면 미리보기.
- 화면 오른쪽: `p_conc`, `p_perf`, `p_seats`, `p_agree`, `p_grade`, `ok_code` 값 모니터.
- 버튼: `공연 입력`, `좌석 수 변경`, `약관 체크`, `좌석등급 선택`, `예매 버튼`.
- 상태: 값 transport 대상인지, command 발생 대상인지 표시한다.
- 피드백: Push Button을 값 field처럼 취급하면 "버튼은 값을 보관하지 않고 function code를 보냄"이라고 설명한다.

기존 embed `CH16-L03-S01`은 화면 요소와 연결 변수를 실시간으로 보여 주므로 이 레슨의 핵심 학습 장치로 적합하다.

### 실수와 주의

- Push Button에 function code를 지정하지 않으면 PAI에서 어떤 버튼인지 알기 어렵다.
- 체크박스는 boolean type이 아니라 보통 `X`와 공백으로 다룬다.
- Radiobutton은 그룹 단위 선택이라는 점을 잊지 않는다.
- Dropdown은 search help의 완전한 대체가 아니다. 적은 고정 목록에는 dropdown, 많은 값과 검색에는 F4가 맞다.
- 화면 field 이름과 ABAP 변수 이름은 대소문자보다 실제 이름 일치가 중요하다.

### 정리

화면 요소는 모양이 아니라 데이터와 command의 통로다. 입력 field는 값을 운반하고, 버튼은 function code를 발생시키며, dropdown은 PBO에서 목록을 준비해야 한다.

## CH16-L04 - PBO 처리 흐름

### 왜 필요한가

사용자가 화면을 보기 전에 프로그램은 준비를 끝내야 한다. 제목과 toolbar를 설정하고, dropdown 목록을 채우고, 특정 조건에서는 입력칸을 읽기 전용으로 바꾸어야 한다. 이 일을 사용자가 버튼을 누른 뒤 처리하면 이미 늦다.

PBO는 화면을 사용자에게 보내기 직전에 실행되는 준비 단계다.

### 무엇인가

PBO는 Process Before Output이다. Flow Logic의 `PROCESS BEFORE OUTPUT` block에서 호출한 `MODULE ... OUTPUT` dialog module이 실행된다.

Flow Logic:

```abap
PROCESS BEFORE OUTPUT.
  MODULE status_0100.
  MODULE fill_grade_list.
  MODULE modify_screen_0100.
```

ABAP module:

```abap
DATA gs_screen TYPE screen.

MODULE status_0100 OUTPUT.
  SET PF-STATUS 'ST100'.
  SET TITLEBAR 'TB100'.
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

`LOOP AT SCREEN`은 현재 dynpro의 screen element를 순회한다. 속성을 바꾼 뒤에는 `MODIFY SCREEN FROM gs_screen`을 호출해야 실제 화면에 반영된다. 화면 속성 변경은 현재 dynpro 표시를 위한 동적 변경이므로, 조건이 계속 적용되어야 하면 PBO마다 다시 계산한다고 이해해야 한다.

### 어떻게 확인하는가

1. `MODULE status_0100 OUTPUT`에 breakpoint를 둔다.
2. T-code로 화면 0100을 실행한다.
3. 화면이 사용자에게 보이기 전에 breakpoint가 먼저 걸리는지 확인한다.
4. `p_locked = 'X'`인 경우 `P_SEATS`의 `screen-input`이 0으로 바뀌는지 본다.
5. `MODIFY SCREEN FROM gs_screen`을 주석 처리했을 때 화면에 반영되지 않는 차이를 비교한다.

### 체험 설계

학습 장치는 "PBO 화면 준비 스텝퍼"로 설계한다.

- 단계: `PBO 시작`, `PF-STATUS 설정`, `TITLEBAR 설정`, `Dropdown 값 채움`, `SCREEN 순회`, `화면 표시`.
- 상태: 현재 screen element, input 여부, invisible 여부, active 여부.
- 버튼: `잠금 켜기`, `잠금 끄기`, `MODIFY 반영`, `MODIFY 생략`.
- 피드백: 속성만 바꾸고 `MODIFY SCREEN FROM`을 누락하면 "work area 값만 바뀌고 화면은 그대로"라고 보여 준다.

### 실수와 주의

- PBO에서 무거운 DB 조회를 반복하면 화면이 표시될 때마다 느려질 수 있다.
- PBO에서 사용자가 입력한 값을 매번 기본값으로 덮으면 사용자가 값을 고칠 수 없다.
- `MODIFY SCREEN FROM gs_screen`을 누락하면 변경이 반영되지 않는다.
- CH15 selection screen의 `AT SELECTION-SCREEN OUTPUT`과 비슷한 감각은 있지만, CH16은 Dynpro PBO와 Flow Logic 기반이다.

### 정리

PBO는 사용자가 보기 전에 화면을 준비하는 단계다. GUI status, title, dropdown 목록, field 속성 제어를 여기서 수행한다.

## CH16-L05 - PAI 처리 흐름: OK_CODE와 화면 떠나기

### 왜 필요한가

사용자가 화면에서 가장 많이 하는 행동은 버튼을 누르는 것이다. 예매, 뒤로, 종료, 취소는 모두 다른 의미다. PAI는 사용자가 action을 일으킨 뒤 실행된다. 여기서 function code를 제대로 읽지 못하면 이전 버튼 명령이 남아 같은 처리가 반복되거나, 화면을 닫아야 하는데 계속 남아 있을 수 있다.

### 무엇인가

PAI는 Process After Input이다. Flow Logic의 `PROCESS AFTER INPUT` block에서 호출한 `MODULE ... INPUT` dialog module이 실행된다.

OK_CODE 안전 처리 패턴:

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

핵심은 `ok_code`를 바로 `CASE`에 쓰기보다 보조 변수에 복사하고 원본 OK field를 지우는 것이다. 그래야 다음 PAI에서 이전 command가 남아 오작동하는 일을 줄일 수 있다.

화면을 떠나는 문장의 차이:

| 문장 | 의미 | 대표 사용 |
| --- | --- | --- |
| `LEAVE TO SCREEN 0` | 현재 dynpro sequence를 종료하고 호출자로 돌아감 | BACK, CANCEL |
| `LEAVE PROGRAM` | program 전체 종료 | EXIT 성격 |
| `LEAVE SCREEN` | 현재 screen processing을 끝내고 다음 screen으로 진행 | `SET SCREEN`과 함께 이해 |
| `SET SCREEN nnnn` | 다음 screen 번호를 지정 | 즉시 떠나는 문장은 아님 |

`SET SCREEN`은 next dynpro를 바꾸지만 현재 processing block을 즉시 중단하지 않는다. "지금 이 화면 처리를 끝내고 이동"이 필요하면 `LEAVE SCREEN` 또는 `LEAVE TO SCREEN`과 함께 이해해야 한다.

### 어떻게 확인하는가

1. SAVE 버튼을 누르고 PAI breakpoint에서 `ok_code = 'SAVE'`인지 본다.
2. `save_ok = ok_code` 실행 뒤 두 값이 같은지 본다.
3. `CLEAR ok_code` 뒤 `ok_code`가 비어도 `save_ok`에는 command가 남아 있는지 본다.
4. Enter를 다시 눌렀을 때 이전 SAVE가 반복되지 않는지 확인한다.
5. BACK, EXIT, CANCEL을 각각 눌러 화면 종료와 프로그램 종료 차이를 관찰한다.

### 체험 설계

학습 장치는 "OK_CODE 안전 분기 실험실"로 설계한다.

- 입력: 누른 버튼 command.
- 상태: `OK_CODE`, `SAVE_OK`, `sy-ucomm`, next screen, 화면 stack.
- 버튼: `SAVE`, `BACK`, `EXIT`, `CANCEL`, `Enter 반복`.
- 피드백: `CLEAR ok_code`를 생략하면 "이전 command가 남아 다음 PAI에서 재실행될 수 있음"을 시뮬레이션한다.
- 비교: `LEAVE TO SCREEN 0`과 `LEAVE PROGRAM`을 누를 때 화면 stack이 어떻게 달라지는지 보여 준다.

### 실수와 주의

- `ok_code`를 지우기 전에 보조 변수에 복사해야 한다.
- `sy-ucomm`만 직접 의존하기보다 화면 OK field를 명시적으로 관리하는 패턴을 기본으로 가르친다.
- BACK과 EXIT를 모두 `LEAVE PROGRAM`으로 처리하면 사용자가 한 화면 뒤로 가려다 transaction 전체를 잃을 수 있다.
- 단순 화면 종료와 program 종료를 구분해야 한다.

### 정리

PAI는 사용자의 행동을 해석하는 단계다. OK_CODE는 보조 변수로 복사하고 clear한 뒤 분기한다. 화면을 떠나는 문장은 종료 범위가 다르므로 의도를 정확히 선택해야 한다.

## CH16-L06 - PF-STATUS와 TITLEBAR

### 왜 필요한가

화면에는 입력칸만 있는 것이 아니다. 위쪽에는 메뉴바, standard toolbar, application toolbar, function key가 있다. 사용자는 이 버튼으로 저장하거나 뒤로 가거나 도움말을 연다. 화면 제목도 사용자가 지금 어떤 업무 화면에 있는지 알려 준다.

이 상단 UI를 제대로 설정하지 않으면 버튼이 보이지 않거나, 보이는데 PAI의 `CASE` 분기와 function code가 맞지 않는 문제가 생긴다.

### 무엇인가

PF-STATUS는 GUI status다. Menu Painter 또는 관련 도구에서 메뉴, toolbar, function key, function code를 정의한다. Dynpro에서는 PBO에서 `SET PF-STATUS`로 적용한다. 제목은 `SET TITLEBAR`로 설정한다.

기본 예:

```abap
MODULE status_0100 OUTPUT.
  SET PF-STATUS 'ST100'.
  SET TITLEBAR 'TB100'.
ENDMODULE.
```

특정 버튼을 상황에 따라 숨기는 예:

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
  SET TITLEBAR 'TB100' WITH p_conc.
ENDMODULE.
```

`EXCLUDING`은 지정한 function code를 현재 status에서 제외하는 용도다. 예를 들어 이미 마감된 공연이면 SAVE 버튼을 숨기거나 비활성화하는 정책을 구현할 수 있다.

### 어떻게 확인하는가

1. PBO에서 `SET PF-STATUS 'ST100'`가 실행되는지 확인한다.
2. 화면 상단에 의도한 toolbar button이 보이는지 확인한다.
3. 버튼을 눌렀을 때 PAI에서 `OK_CODE`가 status의 function code와 같은지 확인한다.
4. `EXCLUDING` 목록에 넣은 function code가 화면에서 제외되는지 확인한다.
5. `SET TITLEBAR ... WITH p_conc`로 제목 변수 값이 표시되는지 확인한다.

### 체험 설계

학습 장치는 "Toolbar와 Function Code 매핑판"으로 설계한다.

- 화면 위: toolbar button 미리보기.
- 화면 아래: PF-STATUS의 function code 목록.
- 오른쪽: PAI `CASE save_ok` branch.
- 버튼: `SAVE 추가`, `BACK 추가`, `SAVE 제외`, `제목 변수 적용`.
- 피드백: toolbar의 function code와 PAI branch가 다르면 "버튼은 눌렸지만 처리 branch 없음"을 표시한다.

### 실수와 주의

- PF-STATUS는 PBO에서 설정해야 한다.
- PF-STATUS의 function code와 PAI의 `CASE` 값이 정확히 맞아야 한다.
- Titlebar text도 화면 맥락을 설명하는 중요한 UI다.
- `EXCLUDING`은 버튼을 없애는 화면 정책이고, 권한 검증이나 업무 검증을 대신하지 않는다.

### 정리

PF-STATUS는 화면 위 버튼과 function code의 설계도다. TITLEBAR는 현재 화면의 업무 맥락을 보여 준다. 둘 다 PBO에서 설정하고 PAI의 OK_CODE 처리와 맞춰야 한다.

## CH16-L07 - Custom Control, Container, Tabstrip, Subscreen, Status Icon

### 왜 필요한가

CH17에서는 화면 안에 Grid ALV를 넣어 좌석표나 예매 목록을 보여 준다. 그런데 ALV는 그냥 화면에 자동으로 생기지 않는다. 먼저 Dynpro layout에 control이 들어갈 사각 영역을 만들어야 한다. 이 영역이 Custom Control이다. ABAP program에서는 이 영역에 container 객체를 연결한다.

또 화면이 커지면 한 화면 안을 tab이나 subscreen으로 나누어야 한다. CH16-L07은 "화면 안에 더 복잡한 구조를 넣을 자리"를 이해하는 레슨이다.

### 무엇인가

대표 구조:

| 요소 | 의미 | CH16에서의 위치 |
| --- | --- | --- |
| Custom Control | 화면 안의 사각 영역 | CH17 ALV가 들어갈 자리 |
| Custom Container | Custom Control 영역과 control 객체 연결 | `CL_GUI_CUSTOM_CONTAINER` 선행 사용 |
| Tabstrip | 한 화면을 여러 tab으로 분리 | tab title, function code, active tab |
| Subscreen Area | 화면 안에 다른 dynpro를 끼워 넣는 영역 | 공통 영역 재사용 |
| Status Icon | 상태를 아이콘처럼 표시 | 예매 가능, 마감, 오류 같은 상태 |

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

이 코드는 CH20 OO 문법을 정식으로 배우기 전의 선행 사용이다. 여기서 중요한 것은 객체 지향 설계가 아니라 "Screen Painter에서 만든 Custom Control 이름 `CONT100`과 ABAP container가 같은 이름으로 연결된다"는 점이다.

Tabstrip과 subscreen의 큰 구조:

```abap
CONTROLS tab_main TYPE TABSTRIP.

PROCESS BEFORE OUTPUT.
  MODULE set_tab_0100.
  CALL SUBSCREEN sub_main INCLUDING sy-repid '0110'.

PROCESS AFTER INPUT.
  CALL SUBSCREEN sub_main.
  MODULE user_command_0100.
```

Tabstrip은 단순히 예쁜 탭 제목이 아니다. tab title function code, active tab, subscreen area, `CALL SUBSCREEN`이 연결되어야 한다.

Table Control은 이 장에서 제외한다. 공식 문서에는 존재하지만, 현재 커리큘럼은 화면 표를 CH17 Grid ALV로 대체한다.

### 어떻게 확인하는가

1. Screen Painter layout에 Custom Control `CONT100`이 있는지 본다.
2. ABAP code의 `container_name = 'CONT100'`와 이름이 같은지 확인한다.
3. PBO에서 container가 매번 새로 생성되지 않도록 initial check가 있는지 본다.
4. Tabstrip을 쓰면 tab title function code와 active tab 값이 맞는지 본다.
5. Subscreen area와 포함할 subscreen 번호가 맞는지 확인한다.
6. Table Control을 쓰려는 요구가 있으면 CH17 ALV로 대체할 수 있는지 판단한다.

### 체험 설계

학습 장치는 "화면 분할과 컨테이너 설계판"으로 설계한다.

- 화면 구성: main screen 0100, Custom Control `CONT100`, subscreen area `SUB_MAIN`, tab title 두 개, status icon field.
- 버튼: `Custom Control 배치`, `Container 연결`, `Tab 선택`, `Subscreen 포함`, `Status Icon 변경`, `Table Control 제외 비교`.
- 상태: control 이름, container 이름, active tab, subscreen number, status icon value.
- 피드백: control 영역 이름과 `container_name`이 다르면 "컨테이너가 붙을 화면 영역을 찾지 못함"을 표시한다.

### 실수와 주의

- Custom Control은 내용물이 아니라 자리다. 실제 내용은 container와 control 객체가 붙어야 보인다.
- PBO마다 container를 새로 만들면 lifecycle 문제가 생긴다. 보통 initial check로 한 번만 만든다.
- Subscreen은 main screen의 flow에 포함되는 영역이다. OK_CODE 처리 책임을 어디에 둘지 명확히 해야 한다.
- Tabstrip은 tab title, active tab, subscreen area, flow logic이 함께 맞아야 한다.
- Table Control을 이 장에 끌어오지 않는다. 화면 표는 CH17 Grid ALV로 이어진다.

### 정리

CH16-L07은 화면 확장 구조를 잡는 레슨이다. Custom Control은 CH17 ALV를 담을 자리이고, Tabstrip과 Subscreen은 화면을 나누는 구조다. OO와 Grid 구현은 뒤로 미루고, 지금은 화면 영역과 프로그램 연결을 정확히 잡는다.

## CH16-L08 - 실습: 예매 입력 화면 만들기

### 왜 필요한가

앞 레슨들을 따로 배우면 Dynpro가 조각처럼 느껴질 수 있다. 마지막 실습에서는 예매 입력 화면 0100을 만든다고 가정하고 Screen Painter, PBO, PAI, OK_CODE, PF-STATUS, 검증을 하나의 흐름으로 묶는다.

이 실습의 목표는 데이터 저장이 아니다. 사용자가 값을 입력하고, 예매 버튼을 누르고, PAI에서 검증하고, 잘못된 값이면 message로 막고, 뒤로 가기와 종료를 처리하는 것이다.

### 무엇인가

실습 설계:

| 구성 | 내용 |
| --- | --- |
| Program | Module Pool `SAPMZBOOK` |
| T-code | `ZBOOK_DYN` |
| Screen | 0100 |
| Field | `P_CONC`, `P_PERF`, `P_SEATS`, `P_CUST`, `P_GRADE`, `OK_CODE` |
| PBO | status, titlebar, dropdown list |
| PAI | OK_CODE 복사와 clear, SAVE/BACK/EXIT/CANCEL 처리 |
| 검증 | CH10의 `can_book` subroutine 재사용 |
| 경계 | 실제 데이터 생성은 CH24 |

Flow Logic:

```abap
PROCESS BEFORE OUTPUT.
  MODULE status_0100.
  MODULE fill_grade_list.

PROCESS AFTER INPUT.
  MODULE user_command_0100.
```

ABAP code:

```abap
DATA: p_conc  TYPE zconcert-concert_id,
      p_perf  TYPE zperf-perf_id,
      p_seats TYPE i,
      p_cust  TYPE c LENGTH 30,
      p_grade TYPE c LENGTH 3,
      ok_code TYPE sy-ucomm,
      save_ok TYPE sy-ucomm,
      gv_ok   TYPE abap_bool.

MODULE status_0100 OUTPUT.
  SET PF-STATUS 'ST100'.
  SET TITLEBAR 'TB100' WITH p_conc.
ENDMODULE.

MODULE fill_grade_list OUTPUT.
  " Dropdown 목록 준비는 CH16-L03의 VRM_SET_VALUES 패턴 사용
ENDMODULE.

MODULE user_command_0100 INPUT.
  save_ok = ok_code.
  CLEAR ok_code.

  CASE save_ok.
    WHEN 'SAVE'.
      PERFORM can_book USING p_conc p_perf p_seats CHANGING gv_ok.

      IF gv_ok = abap_true.
        MESSAGE '예매 가능 - 실제 저장은 CH24에서 처리합니다' TYPE 'S'.
      ELSE.
        MESSAGE '좌석이 부족합니다' TYPE 'E'.
      ENDIF.

    WHEN 'BACK'.
      LEAVE TO SCREEN 0.

    WHEN 'EXIT'.
      LEAVE PROGRAM.

    WHEN 'CANCEL'.
      LEAVE TO SCREEN 0.
  ENDCASE.
ENDMODULE.
```

`abap_true`는 CH04에서 ABAP boolean 처리로 다룬 값을 재사용한다. `PERFORM can_book`은 CH10 모듈화 실습의 예매 가능 여부 판단을 가져온다. 저장 단계는 아직 하지 않는다.

### 어떻게 확인하는가

1. SE80에서 Module Pool과 screen 0100을 만든다.
2. SE93에서 T-code가 program과 시작 screen 0100을 가리키는지 확인한다.
3. PBO breakpoint에서 PF-STATUS와 TITLEBAR가 설정되는지 본다.
4. dropdown 목록이 화면에 보이는지 확인한다.
5. SAVE 버튼을 눌러 PAI에서 `save_ok = 'SAVE'`인지 확인한다.
6. 좌석 수를 과하게 입력해 `MESSAGE TYPE 'E'`가 발생하는지 본다.
7. BACK은 `LEAVE TO SCREEN 0`, EXIT는 `LEAVE PROGRAM` 흐름인지 확인한다.
8. SAVE 후 Enter를 다시 눌러 이전 command가 반복되지 않는지 본다.

### 체험 설계

학습 장치는 "예매 입력 Dynpro 통합 시뮬레이터"로 설계한다.

- 화면 1: 실제 예매 입력 화면 wireframe.
- 화면 2: PBO/PAI timeline.
- 화면 3: 변수와 command monitor.
- 버튼: `T-code 실행`, `PBO 준비`, `값 입력`, `SAVE`, `BACK`, `EXIT`, `좌석 과다 입력`, `Enter 반복`.
- 상태: `P_CONC`, `P_PERF`, `P_SEATS`, `P_CUST`, `P_GRADE`, `OK_CODE`, `SAVE_OK`, `GV_OK`, message area.
- 데이터: 공연 C001, 회차 P001, 남은 좌석 5개, 사용자가 입력한 좌석 수.
- 피드백: SAVE 뒤 OK_CODE clear를 생략하면 Enter 반복 시 이전 SAVE가 다시 실행되는 모습을 보여 준다.

### 실수와 주의

- 화면 field와 ABAP variable 이름을 맞추지 않으면 값 transport가 깨진다.
- PBO에서 매번 사용자의 입력값을 초기화하지 않는다.
- PAI에서 `ok_code` clear를 빠뜨리지 않는다.
- SAVE에서 실제 데이터 생성을 하지 않는다. 데이터 변경은 CH24 범위다.
- EXIT 처리 정책은 업무마다 다를 수 있다. 이 실습에서는 BACK과 EXIT의 차이를 보여 주기 위해 `LEAVE TO SCREEN 0`과 `LEAVE PROGRAM`을 구분한다.

### 정리

CH16 실습은 직접 만든 화면의 생명주기를 한 번에 묶는다. PBO는 화면을 준비하고, 사용자는 값을 입력하고, PAI는 OK_CODE를 읽어 검증과 종료를 처리한다. 이 구조를 이해하면 CH17에서 화면 안에 Grid ALV를 얹는 이유와 위치가 자연스럽게 보인다.

## CH16 마무리 체크리스트

학습자는 CH16을 마친 뒤 다음 질문에 답할 수 있어야 한다.

1. Module Pool은 왜 T-code와 시작 화면이 필요한가?
2. Dynpro 화면 번호와 Screen Painter layout은 어떤 관계인가?
3. Flow Logic의 `MODULE` 호출과 ABAP source의 `MODULE ... ENDMODULE` 정의는 어떻게 다른가?
4. PBO와 PAI는 각각 어떤 책임을 가지는가?
5. 화면 field와 ABAP 전역 변수 이름은 왜 맞아야 하는가?
6. Push Button은 왜 값을 보관하지 않고 function code를 보내는가?
7. OK_CODE는 왜 보조 변수로 복사하고 clear하는가?
8. `LEAVE TO SCREEN 0`, `LEAVE SCREEN`, `LEAVE PROGRAM`, `SET SCREEN`은 어떻게 다른가?
9. PF-STATUS와 TITLEBAR는 왜 PBO에서 설정하는가?
10. Custom Control은 왜 CH17 Grid ALV의 준비 단계인가?
11. Table Control을 왜 이 커리큘럼에서 제외하는가?
12. CH16 실습에서 실제 데이터 생성이 아니라 화면과 검증까지만 다루는 이유는 무엇인가?

핵심 문장:

```text
PBO는 보여 주기 전 준비,
PAI는 사용자가 행동한 뒤 처리,
OK_CODE는 복사하고 지운 뒤 분기,
화면 표는 Table Control이 아니라 CH17 Grid ALV로 이어진다.
```
