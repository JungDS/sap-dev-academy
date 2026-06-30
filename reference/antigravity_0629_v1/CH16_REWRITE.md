# CH16_REWRITE - Screen Programming / Dynpro 기초 v1

> 목적: `content/abap/CH16`의 8개 레슨을 "IT 비전공자 입문자가 왜 필요한가부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH16 전체 설계

CH16의 한 문장 목표는 "정형화된 선택 화면의 한계를 탈피하여, Screen Painter(SE51)의 4대 요소 바인딩과 PBO/PAI 순환 주기, save_ok 패턴 및 화면 제어어(SET/LEAVE SCREEN), GUI Status/Titlebar 설정 및 동적 EXCLUDING, Custom Control 영역과 Container 개설을 활용하여 동적 상호작용이 가능한 예매 입력 수동 화면 캡스톤을 조립한다"이다.

IT 비전공자 입문자는 리포트 실행형 F8로 Module Pool을 가동하려다 "T-code가 없다"며 굳어버리고, POH/POV 시점에 다른 입력 필드의 값이 자동으로 전송되지 않는 사양 장벽에 부딪히며, PAI 내부에서 OK_CODE를 클리어하지 않아 엔터 키 연타 시 중복 저장이 발생하는 버그를 내고, SET SCREEN과 LEAVE SCREEN의 차이를 몰라 즉시 화면 이탈에 실패한다.
따라서 본 챕터는 다음과 같은 불편 해결의 단계적 설계로 전개한다.

1. **정형 템플릿의 탈피**: 아밥 시스템이 배치해 주는 수직 일렬 조건창 $\rightarrow$ 입력창 크기, 버튼 위치, 탭 구조를 개발자가 자유자재로 그리는 사용자 맞춤식 **Dynpro**와 **Module Pool** 프로그램 뼈대 학습.
2. **사중주 조립 (Screen Painter SE51)**: 화면 배치도(Layout), 화면 정보 목록(Element List), 동적 호출 뼈대(Flow Logic), 설정창(Attributes)이 맞물려 구동되는 **Screen Painter**의 연결 무결성 수립.
3. **요소의 삼색 성격**: 값을 싣는 상자(Input/Output, Checkbox), 명령을 쏘는 대포(Push Button - OK_CODE), 시각 보조용 액자(Text, Frame)로 화면 요소를 분류하는 눈빛 정립.
4. **리스트박스 수혈 (VRM)**: F4 팝업 대신 화면 내부에서 예쁘게 펼쳐지는 **Dropdown Listbox**를 PBO 시점에 **`VRM_SET_VALUES`** 함수로 공급하는 동적 리스트 기획.
5. **화면 켜기 전 단장 (PBO & Screen 제어)**: 화면이 모니터에 인쇄되기 직전마다 메뉴바와 제목을 걸어두고, `LOOP AT SCREEN` 안에서 `input = 0` (읽기 전용) 속성을 조정한 뒤 `MODIFY SCREEN`으로 인장을 찍는 **PBO 제어** 수립.
6. **PAI의 세이브 가드 (save_ok 패턴)**: 버튼 클릭 시 유입된 `ok_code`를 `save_ok`로 복사 후 **즉시 `CLEAR ok_code`** 하여 엔터 중복 저장을 막는 백엔드 표준 가드 코딩.
7. **화면 전환 3종 세트**: 다음 목적지만 예약하는 `SET SCREEN`, 즉시 탈출하는 `LEAVE SCREEN`, 둘을 합친 축약형 `LEAVE TO SCREEN` 및 프로그램 셧다운 `LEAVE PROGRAM`의 거동 차이 규명.
8. **상단 툴바와 타이틀바 (SE41)**: Menu Painter로 상단 단축 아이콘을 심고, `EXCLUDING` 목록으로 버튼을 얼리며, `WITH` 옵션으로 제목 자리표시자 `&1`에 동적 문자열을 채우는 기법.
9. **컨테이너 자리 예약 (Custom Control & Container)**: 훗날 ALV 격자판을 얹을 빈 사각 영역(Custom Control)을 개설하고 PBO 중복 생성 덤프를 막기 위해 `IS INITIAL` 가드로 **`CL_GUI_CUSTOM_CONTAINER`** 를 1회만 출산하는 도킹 룰 정비.
10. **서브스크린 (Subscreen Area)**: 메인 화면 안에 다른 화면을 액자처럼 끼워 넣는 **Subscreen**과 자체 OK_CODE 부재에 따른 메인 집중 처리 원리 이해.
11. **예매 입력 화면 종합 실습**: T-code 실행 $\rightarrow$ PBO에서 제목과 드롭다운 세팅 $\rightarrow$ PAI에서 `can_book` 모듈로 좌석 수 초과 E 메시지 검증 $\rightarrow$ BACK/EXIT/CANCEL 표준 이탈로 구성된 종합 Dynpro 캡스톤 완성.

### 범위와 금지선

- **R6 classic-first 철저 수호**: 
  - `CALL FUNCTION 'VRM_SET_VALUES' EXPORTING id = ... values = ...` 와 같이 classic host parameter와 explicit data declaration만 사용하고, modern `@` 나 `@DATA` 등은 철저히 배제한다.
  - 객체 생성 시 `CREATE OBJECT go_cont EXPORTING container_name = ...` classic 구문을 엄수하며, modern `NEW` 인스턴스 지시어는 차단한다.
- **변수 스코프 접두어**: 모든 스크립트는 전역 범위로 간주하며, 일반 변수는 `gv_`, 구조체는 `gs_`, 내부 테이블은 `gt_`, 클래스 인스턴스 참조 변수는 `go_` 접두어를 엄수한다.
- **이름 풀 준수**: 예제 이름은 지정된 이름 풀에서만 가져오며, 주인공은 항상 **정훈영**으로 통일한다.

---

## CH16-L01 - Module Pool 프로그램 구조

### 왜 필요한가

우리가 앞 장(CH15)까지 만들었던 선택 화면(Parameters)은 SAP가 설계해 놓은 정해진 수직 템플릿 안에서만 구동되었다. 
조회 조건을 단순하게 타이핑해서 검색 리포트를 띄우는 용도로는 충분하지만, "공연 예매 전용 팝업창을 띄우고, 좌석 위치도를 그림으로 그리며, [예매 완료]와 [대기 신청] 버튼을 화면 구석에 직접 예쁘게 배치하고 제어하는 입체적인 업무용 화면"을 구성하는 데는 한계가 있다. 

사용자에게 친숙한 맞춤형 GUI 입력 화면과 버튼 레이아웃을 직접 자로 재듯 그려내고, 화면 안에서 일어나는 화려한 PBO/PAI 순환 피드백을 내 뜻대로 지배하는 **화면 중심 전용 독립 프로그램 뼈대**가 필요하다. 그것이 **[[Module Pool]]** (모듈 풀) 프로그램이며, 그 화면 한 장 한 장의 실체가 **[[Dynpro]]** (딘프로)이다.

### 무엇인가

#### 1. Module Pool과 Dynpro의 정의
- **Module Pool**: 여러 개의 커스텀 화면(Dynpro)들을 소유하고 있으며, 사용자의 단축 주소([[T-code]]) 입력으로 화면을 호출받아 동작하는 화면 지향형 백엔드 프로그램이다. (`PROGRAM` 키워드로 시작).
- **Dynpro (딘프로)**: "화면의 시각적 모양(Layout)"과 그 뒤에서 숨 쉬는 "화면 흐름 로직(Flow Logic)"이 결합된 하나의 독립된 화면 객체다. 
- *최신 UI 연계 이정표*: 이 Dynpro는 classic SAP GUI 환경의 터줏대감 기술이다. 현재 신규 구축되는 SAP 웹/모바일 시스템은 최신 HTML5/JS 기술인 Fiori 및 SAPUI5(CH36에서 언급)를 근간으로 삼으나, 현업 백엔드 운영 시스템의 90% 이상이 여전히 이 Dynpro로 가동되고 있으므로 유지보수를 위한 기초 뼈대로 완벽하게 정복해야 한다.

#### 2. Report(실행형) vs Module Pool(화면형)의 아키텍처 차이

| 비교 관점 | Report (실행형) | Module Pool (화면형) |
| --- | --- | --- |
| **선언 키워드** | `REPORT` | `PROGRAM` |
| **가동 단추** | 개발자 에디터에서 [실행 (F8)] 가능 | F8로 가동 불가. **오직 T-code(SE93)로만 기동** |
| **화면의 출처** | PARAMETERS 선언 시 자동으로 그려지는 1000번 화면 | **Screen Painter(SE51)로 개발자가 한 땀 한 땀 디자인** |
| **흐름 제어 기어** | 생명주기 이벤트 (`START-OF-SELECTION` 등) | 화면용 두 박자 순환 주율 (**PBO / PAI**) |

#### 3. 화면의 두 박자: PBO 와 PAI
화면 중심 프로그램은 절차적으로 위에서 아래로 흐르고 끝나지 않는다. 사용자가 화면을 끄기 전까지 다음 두 단계가 끊임없이 반복 순환(Loop)한다.
1. **PBO (Process Before Output - 화면 출력 전 준비)**: 화면이 사용자 모니터에 그려져 나타나기 직전에 백엔드에서 초기값과 버튼 활성화를 세팅하는 단계.
2. **PAI (Process After Input - 입력 후 가공)**: 사용자가 키보드로 타자를 치고 버튼이나 엔터를 클릭한 순간, 그 값을 백엔드로 싣고 들어와 검증하고 화면을 넘기는 단계.

### 어떻게 확인하는가

에디터에서 PROGRAM 선언으로 뼈대를 개설하고, F8 실행 시 시스템이 화면 기동을 거부하는 한계를 검수한다.

```abap
" [선언 철칙] 리포트용 REPORT가 아닌, 화면용 PROGRAM 지시어를 엄수!
PROGRAM sapmzconcert.

" Dynpro 화면 0100번이 가동될 때 PBO/PAI를 받아낼 모듈 선언 대기!
```

#### 체험/시뮬레이터 설계 (PBO/PAI 두 박자 흐름)
- **프로세스 플로우**:
  1. 학습자가 [프로그램 실행 F8] 버튼을 누른다.
  2. "Module Pool 프로그램은 T-code 없이 F8로 직접 실행할 수 없습니다" 경고판이 뜬다.
  3. [T-code 'ZCON100' 입력 가동] 버튼을 누른다.
  4. 시각화 엔진이 `T-code` -> `0100번 Dynpro`로 날아간다. 
  5. `PBO 모듈` ( status_0100 )이 번쩍하며 화면을 조율하고 -> 화면이 출력되어 멈춘다. 
  6. 사용자가 [예매] 버튼을 누르자 `PAI 모듈` ( user_command_0100 )로 제어권이 넘어갔다가, 다시 PBO로 돌아와 순환하는 루프 지도를 감상한다.
- **상태 및 데이터**:
  - `T-code를 생성하지 않은 채 Module Pool 활성화 상태` -> 실행 시 "Transaction code is missing" 적색 경고등 점등.
- **피드백**: Module Pool은 짝꿍인 T-code가 가동 열쇠로 꼽혀야만 작동하는 화면 지향형 프로그램의 심장임을 인지시킨다.

### 실수/주의

- **Module Pool 프로그램을 생성한 뒤 습관적으로 F8 누르기**: "코드가 활성화되었으니 실행해봐야지" 하고 에디터의 F8 실행을 누르면 "실행할 수 없는 프로그램 유형" 이라며 굳어버리므로, 반드시 **SE93에서 T-code를 개설하여 해당 단축 코드로 화면을 기동**해야 한다.

### 정리

- **`Module Pool`** 은 T-code로 시작하여 독자적인 Dynpro 화면들을 흘려보내는 화면 전용 프로그램이다.
- 화면은 PBO(그리기 전)와 PAI(입력 후)라는 **두 박자 순환 주기**를 돌며 사용자와 상호작용한다.
- 실무 유지보수의 핵심이므로 classic GUI 아키텍처의 경계선을 정밀하게 학습한다.

---

## CH16-L02 - Screen Number와 Screen Painter

### 왜 필요한가

Module Pool 도면을 그렸다. 
하지만 이 프로그램 안에 예매를 입력하는 화면, 예매 성공을 축하하는 상세 카드 화면, 좌석이 찼을 때 띄우는 팝업 경고창 화면 등 서로 다른 역할을 가진 화면 여러 개를 엮으려면, 프로그램 입장에서 **"지금 고쳐서 손봐야 할 화면이 도대체 몇 번째 화면인지" 명확하게 식별하고 이름표를 붙여 구별할 수 있는 물리 주소 번호**가 있어야 한다. 
또한, 마우스로 입력 박스를 끌어다 배치하고 화면 로직을 선언하는 정교한 전용 조립 공구 세트가 필수적이다. 그것이 **[[Screen Number]]** (화면 번호)와 **[[Screen Painter]]** (스크린 페인터 - SE51)이다.

### 무엇인가

#### 1. Screen Number (화면 번호)의 약속
- **정의**: 하나의 프로그램 내에서 Dynpro 화면들을 격리 식별하기 위해 부여하는 **네 자리 숫자 번호**다 (예: 메인 화면 `0100`, 상세 화면 `0200`).
- **거동**: 각 화면 번호는 자기만의 독자적인 레이아웃 도면과 PBO/PAI 흐름 제어 로직을 캡슐화하여 독립적으로 소유한다.

#### 2. Screen Painter (SE51 - 화면 조립 도구)의 4대 핵심 구성요소
이 화면 조립실은 다음 4가지 퍼즐 조각이 에러 없이 무결성 결합을 이루어야 활성화가 성립된다.
1. **Layout (레이아웃 도면)**: WYSIWYG 마우스 드로잉 화면이다. 입력 필드, 체크박스, 푸시버튼을 화면 위에 물리적 위치로 디자인한다.
2. **Element List (요소 명세서)**: 화면에 올려둔 컴포넌트들의 기술 명세(변수명, 타입, 자릿수)와 버튼 명령을 받을 **OK field** 변수명을 매핑해 두는 표다.
3. **Flow Logic (화면 흐름 코드)**: 화면 전용 특수 문법 구획이다. PBO와 PAI 단계에서 백엔드 아밥 프로그램의 어느 처리 MODULE을 호출할지 이정표를 적어두는 곳이다.
4. **Attributes (화면 속성 세팅)**: 다음 화면 번호(Next Screen) 지정 및 이 화면이 일반 전체 화면인지 팝업용 대화상자(Modal Dialog Box)인지 화면의 기어를 맞추는 곳이다.

#### ⚠️ [화면 요소 명칭과 백엔드 전역 변수의 이름 일치 철칙]
- *초보 개발자들이 가장 흔하게 저지르는 "입력값을 쳤는데 변수에 값이 안 들어와요" 에러의 본질이다.*
- Screen Painter Layout에 배치한 입력 필드 이름이 `P_SEATS`라면,
- **백엔드 아밥 소스 코드 최상단에도 반드시 동일하게 `DATA p_seats TYPE i.` 형태로 스펠링이 100% 일치하는 전역 변수를 선언해 두어야 한다.**
- **원리**: 이름이 완벽하게 일치해야만 화면 엔진이 PAI 진입 시 화면의 글자를 변수 메모리 방으로 자동으로 실어 날라주며(Data Transport), 이름이 다르면 값이 공중 분해되어 유실된다.

### 어떻게 확인하는가

Flow Logic의 호출부와 아밥 백엔드의 정의부 간에 짝이 맞지 않을 때 시스템이 덤프를 터트리는 한계를 검수한다.

```text
[ Flow Logic 화면 코드 (Screen 0100) ]
PROCESS BEFORE OUTPUT.
  MODULE status_0100.       " 1. status_0100 이라는 방을 부를게!

PROCESS AFTER INPUT.
  MODULE user_command_0100. " 2. user_command_0100 이라는 방을 부를게!
```

```abap
" [ ABAP 백엔드 코드 ]
" [정의 철칙] Flow Logic에서 부른 이름과 스펠링이 정확히 일치해야 연결 성립!
MODULE status_0100 OUTPUT.
  " PBO 화면 세팅
ENDMODULE.

MODULE user_command_0100 INPUT.
  " PAI 입력 세팅
ENDMODULE.
```

#### 체험/시뮬레이터 설계 (Screen Painter 연결 지도)
- **프로세스 플로우**:
  1. 학습자가 [Element List] 패널에서 화면 요소 `p_seats` 의 이름을 확인한다.
  2. [ABAP Source] 패널의 변수 정의를 `DATA p_seat TYPE i.` (S 누락) 로 고쳐본다.
  3. [활성화] 단추를 누른다.
  4. 연결선 빨간 배지가 깨지며 "Data object p_seats not found in main program" 에러 하이라이트 경고를 확인한다.
- **상태 및 데이터**:
  - `Flow Logic에 MODULE status_9999.` 라고 적고 아바 소스에 모듈 정의를 생략함 -> "MODULE status_9999 does not exist" 활성화 거절 에러 피드백.
- **피드백**: Screen Painter는 Layout-Element-Flow-ABAP 4개 톱니바퀴가 완벽하게 일치 맞물려야만 비로소 생명이 가동되는 체인 구조임을 알려준다.

### 실수/주의

- **Flow Logic 코드창 안에 일반 ABAP 연산 코딩 적기**: "화면 코드 창이니까 여기에 `p_seats = 5 + 3.` 같은 아밥 사칙연산을 직접 코딩해야지" 했다가는 컴파일 에러를 만나므로, Flow Logic에는 오직 **`MODULE 모듈명.` 호출 지시어**만 적고 실제 연산 코드는 아밥 에디터 파일 내부의 `MODULE ... ENDMODULE` 방안에 격리해 적어야 한다.

### 정리

- **`Screen Number`** 는 딘프로 화면을 제어하는 4자리 물리 번호 주소다.
- Dynpro는 **Layout, Element List, Flow Logic, Attributes** 4대 구성이 완전결합되어 완성된다.
- 화면 컴포넌트 이름과 **백엔드 전역 변수명은 무조건 동일하게 맞물려야** 값이 통과 운반된다.

---

## CH16-L03 - 화면 요소 — 입력·버튼·체크박스·라디오·드롭다운

### 왜 필요한가

화면 뼈대와 페인터를 장착했다. 
이제 화면 위에 실제 내용물들을 얹어야 한다. 사용자가 키보드로 값을 적는 빈 상자, 마우스로 체크하는 체크박스, 선택에 따라 하나만 켜지는 동그란 라디오 버튼, 그리고 아래로 촥 펼쳐지는 리스트박스(Dropdown) 등이 화면 설계 구성원들이다. 

만약 이 요소들이 아바 변수와 각각 어떻게 매칭되는지, 그리고 버튼을 눌렀을 때 백엔드로 날아가는 신호 체계가 무엇인지 기준을 모른다면, 개발자는 화면에 버튼을 백번 클릭해도 백엔드가 아무 반응을 보이지 않는 먹통 장애를 마주하게 된다. 
**화면의 모든 구성원들을 그 성격에 따라 3대 행동군으로 명확히 격리 분류하고, 드롭다운 목록을 코드로 실시간 수혈하여 제공하는 요소 관리 기법**이 필요하다. 그것이 **화면 요소의 3대 행동 분류**와 **[[VRM]]** 목록 주입 기술이다.

### 무엇인가

#### 1. 화면 요소의 3대 행동군 격리 분류
*화면 요소를 겉모양으로 암기하면 응용이 불가능하다. 반드시 아래 3가지 행동 메커니즘으로 격리 분류해 설계해야 한다.*

1. **🟦 값을 싣는 변수군 (Value Transport)**:
   - **멤버**: Input/Output Field (입력창), Checkbox (체크박스), Radiobutton (라디오), Dropdown (드롭다운).
   - **행동**: 사용자가 적거나 고른 실물 데이터 값 자체가 백엔드 동명 전역 변수방으로 전송된다. (체크박스는 `'X'` 또는 공백 `CHAR1` 형식).
2. **🟧 명령을 쏘는 대포군 (PAI Trigger)**:
   - **멤버**: Push Button (푸시버튼).
   - **행동**: 입력 값을 보내는 것이 아니라, 내가 클릭되었다는 **단축 명령 코드(Function Code - ucomm)** 를 `OK_CODE`라는 특수 변수 방에 쏘아 보내며 PAI 이벤트를 강제로 발생시킨다.
3. **⬜ 시각 보조용 액자군 (Display Only)**:
   - **멤버**: Text Field (텍스트 라벨), Frame (외곽 테두리).
   - **행동**: 어떠한 값도 싣지 않고 ucomm도 쏘지 않으며, 오직 사용자의 눈을 돕는 가이드용 스킨이다.

#### 2. Dropdown Listbox 목록 채우기 (VRM 엔진)
- F4 도움말은 화면 위에 별도 검색 팝업창을 띄우지만, 상태 필드(예약/대기/취소)처럼 값이 3개 내외로 소수인 경우 화면 입력 상자 아래로 목록이 촥 열리는 **Dropdown Listbox**가 최상의 UX를 선사한다.
- **원리**: 이 드롭다운 목록은 정적이 아니다. PBO 시점에 백엔드에서 **`VRM_SET_VALUES`** 함수 모듈을 호출하여, 실제 DB 코드에 대응하는 저장 키(`key`)와 화면에 보여줄 한글 이름표(`text`) 구조로 짜인 내부 테이블(`vrm_values`)을 수동 주입해 주어야 화면 리스트가 완성된다.

### 어떻게 확인하는가

PBO 모듈 내부에서 VRM 함수를 호출해 드롭다운 필드 P_STAT 에 예약/대기 고정 리스트를 주입하는 코드를 검증한다.

```abap
REPORT zch16_l03_dropdown.

" VRM 함수에 넘겨줄 표준 구조체 및 테이블 선언!
DATA: gt_values TYPE vrm_values,
      gs_value  LIKE LINE OF gt_values,
      p_stat    TYPE c LENGTH 1. " 화면의 Dropdown Listbox 필드명과 일치!

MODULE fill_status_list OUTPUT.
  CLEAR gt_values.
  
  " 1. DB 저장용 실제 물리 값 key 와 화면용 한글 text 세트 조립!
  gs_value-key = 'R'. gs_value-text = '예약완료'. APPEND gs_value TO gt_values.
  gs_value-key = 'W'. gs_value-text = '대기신청'. APPEND gs_value TO gt_values.
  
  " 2. VRM 주입기 함수 가동!
  CALL FUNCTION 'VRM_SET_VALUES'
    EXPORTING
      id     = 'P_STAT'     " 화면의 대상 드롭다운 객체 ID 대치!
      values = gt_values.   " 조립한 테이블 이송!
ENDMODULE.
```

#### 체험/시뮬레이터 설계 (요소 조작 모니터)
- **프로세스 플로우**:
  1. 학습자가 가상 화면 상의 [예매완료] 드롭다운을 켠다.
  2. [예약완료]를 선택하고 [예매] 버튼을 클릭한다.
  3. 🟦 값 수송 기차가 `p_stat` 변수에 `'R'` 을 실어 나르고, 🟧 명령 대포가 `ok_code` 변수에 `'SAVE'` 라는 문자를 쏘며 PAI 방으로 진입하는 수송 애니메이션을 감상한다.
- **상태 및 데이터**:
  - `체크박스를 선언해놓고 아바 변수 p_vip를 TYPE c LENGTH 1이 아닌 TYPE INT4로 둔 오작동 상태` -> 체크를 켰을 때 문자 'X'가 숫자로 들어가지 못해 형식 매칭 오류 덤프 발생 연출.
- **피드백**: 화면 요소들은 각자 값 수송과 명령 발송이라는 고유한 역할 분배가 완료되어 움직임을 시각적으로 증명한다.

### 실수/주의

- **Dropdown Listbox를 수백 개의 마스터 데이터에 남용**: "공연장 목록이 100개인데 펼쳐서 고르게 해야지" 하고 드롭다운을 걸면, 화면을 켤 때마다 100개 데이터 렌더링 부하로 굳어버리고 사용자는 스크롤을 하느라 고통받으므로, **길고 가변적인 목록은 무조건 Search Help (F4)** 로 우회 설계해야 한다.

### 정리

- 화면 요소는 **값을 운반(변수)하는가**, **ucomm을 발송(버튼)하는가**, **눈만 돕는가** 3가지로 나뉜다.
- 소수의 선택지는 F4 대신 VRM 함수(**`VRM_SET_VALUES`**)를 가동해 드롭다운 리스트박스로 수혈한다.
- 체크박스는 반드시 **`CHAR1`** 자료형으로 백엔드 변수를 매치하여 설계한다.

---

## CH16-L04 - PBO 처리 흐름

### 왜 필요한가

화면 요소들을 잘 배치했다. 
하지만 사용자가 화면을 마주하는 바로 그 첫 순간부터 디테일이 살아있어야 한다. 
"로그인한 사용자 등급에 따라 VIP 체크박스를 처음부터 아예 비활성화해서 읽기 전용으로 막아두고 싶고, 상단 타이틀바에 '공연 C001 예매 화면' 이라고 오늘 날짜와 코드가 동적으로 적혀서 뜨길 원한다" 
이것을 사용자가 버튼을 클릭한 뒤인 PAI 구획에 적어두면, 화면이 이미 다 뜬 다음에 늦게 동작하므로 아무 소용이 없다. 
**화면이 모니터 화소로 인쇄되어 사용자 눈에 닿기 직전 0.001초 찰나에, 백엔드 변수 값을 화면 상자로 이동시키고 필드들의 쓰기 권한을 조절해 단장해두는 최종 렌더링 전 작업장**이 필요하다. 그것이 **[[PBO]]** (화면 출력 전 시점)이다.

### 무엇인가

#### 1. PBO (Process Before Output)의 정의와 임무
- **정의**: 화면이 사용자 눈에 표출되기 직전에 아밥 런타임 시스템이 자동으로 기동해 주는 화면 출력 전 처리 이벤트 영역이다. (`PROCESS BEFORE OUTPUT` Flow Logic 구획과 매칭).
- **주요 임무**: 
  - 화면 상단 제목바(`SET TITLEBAR`) 및 툴바 메뉴(`SET PF-STATUS`) 셋업.
  - 드롭다운 VRM 리스트 주입.
  - 화면 입력창의 활성/비활성 동적 속성 조율.

#### 2. LOOP AT SCREEN INTO gs_screen 속성 지배 규칙
- 화면이 켜지기 직전, 필드를 동적으로 잠그려면 `LOOP AT SCREEN` 을 가동한다.
- **`input = '0'` (읽기 전용)**: 사용자가 글자를 타이핑해 넣을 수 없도록 입력 구멍을 막아 얼려버린다. (글자는 또렷하게 보이므로 읽기 전용에 완벽히 부합).
- **`active = '0'` (숨김)**: 사용자의 눈에서 컴포넌트 자체를 증발시켜 숨겨버린다. (읽기 전용을 하겠답시고 active를 0으로 두면 화면에서 필드가 통째로 사라지는 참사를 마주하게 되므로 둘의 용도를 엄격히 격리한다).
- **[매회 리셋 생명주기 제약]**: 화면의 속성은 **PBO가 매번 실행될 때마다 기본 Active 상태로 강제 리셋**된다. 따라서 특정 조건 동안 계속 읽기 전용을 유지하고 싶다면, 조건문 분기를 태워 PBO 모듈 내부에 항상 `input = 0` 과 `MODIFY SCREEN` 코드가 매번 재실행되도록 보존 설계해야 한다.

### 어떻게 확인하는가

PBO 모듈 내에서 P_SEATS 필드를 잠금 조건에 따라 읽기 전용으로 화면에 반영하는 소스를 검증한다.

```abap
REPORT zch16_l04_pbo_control.

DATA: p_seats  TYPE i,
      p_locked TYPE c LENGTH 1. " 잠금 플래그
DATA gs_screen TYPE screen.

MODULE modify_screen_0100 OUTPUT.
  " [PBO 매번 루프 철칙] 화면 그리기 전 구성 요소를 한 건씩 꺼내기!
  LOOP AT SCREEN INTO gs_screen.
    " [대문자 매치 철칙] 필드명은 반드시 대문자로 대조!
    IF gs_screen-name = 'P_SEATS' AND p_locked = 'X'.
      " [속성 격리 철칙] 숨기는 active가 아닌, 읽기전용인 input을 0으로 세팅!
      gs_screen-input = '0'.
      " [반영 철칙] 수정한 스킨 정보를 화면 객체에 쾅 갱신!
      MODIFY SCREEN FROM gs_screen.
    ENDIF.
  ENDLOOP.
ENDMODULE.
```

#### 체험/시뮬레이터 설계 (PBO 화면 준비 스텝퍼)
- **프로세스 플로우**:
  1. 학습자가 [PBO 시작] 버튼을 누른다.
  2. 기차가 `SET TITLEBAR` 역을 지나며 상단 제목에 '공연 예매'가 찍히고,
  3. `LOOP AT SCREEN` 가동 공장으로 들어간다.
  4. `P_SEATS` 필드를 찾아내 `input = '0'` 으로 스킨 값을 변경한다.
  5. 학습자가 [MODIFY SCREEN 실행] 버튼을 클릭하는 순간, 가상 렌더링 폼 상의 좌석 수 입력 슬롯 배경이 회색으로 어둡게 질려 비활성화되는 락 모션을 확인한다.
- **상태 및 데이터**:
  - `MODIFY SCREEN을 누락하고 PBO 모듈을 마친 상태` -> 메모리 상의 input 속성은 0이 되었지만 실제 미리보기 입력 슬롯은 계속 하얗게 열려 타이핑이 가능한 오작동 하이라이트.
- **피드백**: PBO 단계는 화면이 모니터로 송출되기 직전의 마지막 뷰티숍 단계이며, 모든 변형은 MODIFY SCREEN을 거쳐야만 물리적 실체로 구체화됨을 깨닫게 한다.

### 실수/주의

- **PBO 모듈 내부에서 수천만 건의 무거운 DB SELECT 쿼리 반복 실행**: "화면이 뜨기 전이니까 매번 DB에서 실시간 좌석을 긁어와서 변수에 넣어야지" 했다가는, 사용자가 화면에서 엔터를 치거나 클릭을 할 때마다 PAI $\rightarrow$ PBO가 왕복으로 돌며 매번 무거운 쿼리가 새로 폭발해 화면이 버벅거리다 다운되므로, 무거운 조회는 앞단의 1회성 로직이나 PAI 특정 시점에 가두고 PBO에서는 가벼운 속성 조율만 남겨두어야 한다.

### 정리

- **`PBO`** 는 화면이 표출되기 직전에 백엔드에서 제목, 메뉴, 화면 필드 상태를 튜닝하는 시점이다.
- 읽기 전용 잠금은 active = 0이 아닌 **`input = '0'`** 을 사용하여 필드를 보존하며 락을 건다.
- 모든 스킨 조정은 루프 안에서 **`MODIFY SCREEN`** 지시어로 마무리 갱신해야 효력이 발생한다.

---

## CH16-L05 - PAI 처리 흐름 — OK_CODE와 화면 떠나기

### 왜 필요한가

사용자가 화면에서 데이터를 열심히 입력하고 [저장 (SAVE)] 이나 [뒤로가기 (BACK)] 단추를 눌렀습니다. 
PAI 구획이 돌며 예매를 성공시키거나 화면을 닫는 처리까지는 순조롭게 끝났다. 
그런데 사용자가 실수로 빈 화면에서 키보드 [엔터 (Enter)] 키를 툭 쳤더니, **방금 전에 성공했던 예매 저장 로직이 화면 아래에 다시 한번 폭발하며 똑같은 예약이 2번 중복 생성되는 무서운 중복 적재 버그**가 터진다. 
이유인즉슨, 버튼을 클릭했을 때 변수 방에 유입된 `'SAVE'` 라는 명령 글씨가 사용자가 지우기 전까지 변수 메모리 방안에 여전히 그대로 고여있다가, 엔터를 치자 컴퓨터가 "오라? 방에 SAVE가 들어있네? 저장을 한 번 더 돌리자!" 하고 오해했기 때문이다. 

**버튼 명령을 수신하자마자 1초 만에 백업 복사한 뒤 변수 방을 완전히 깨끗하게 비워(Clear) 중복 연타 사고를 막는 세이브 가드 장치와, 화면을 닫고 프로그램을 안전하게 폭파하는 화면 이탈 제어 기술**이 필요하다. 그것이 **`save_ok` 복사 소멸 패턴**과 **화면 이탈 지시어**다.

### 무엇인가

#### 1. OK_CODE 유실 및 중복 연타 예방: save_ok 패턴
사용자가 버튼을 클릭하면 그 단축 명령(ucomm)은 화면 명세서(Element List)에 정의된 **`ok_code`** 전역 변수 방으로 총알처럼 날아와 꽂힌다. 이 값을 처리할 때 아래의 **3단계 세이브 가드 패턴**을 엄수해야 한다.
1. **1단계: 대피 복사**: 들어온 `ok_code` 값을 로컬 백업 변수인 `save_ok` 에 안전하게 대입해 옮긴다.
2. **2단계: 즉시 소멸 (`CLEAR ok_code`)**: **원천 `ok_code` 변수 방을 `CLEAR` 지시어로 즉시 텅 빈 공백으로 지워버린다.** (이로써 다음 엔터 클릭 시 이전 명령이 재발동하는 중복 연타 사고를 원천 가드한다).
3. **3단계: 백업본 분기**: 대피해 둔 `save_ok` 값을 비교해 `CASE` 문으로 비즈니스 연산을 가동한다.

#### 2. 화면을 안전하게 탈출하는 3대 명령 기어
PAI 분기 처리 중 화면을 닫거나 종료할 때 쓰는 키워드는 물리 거동이 완전히 다르다.
- **`LEAVE TO SCREEN 0`**:
  - **거동**: 현재 돌고 있는 화면 시퀀스(Sequence)를 안전하게 끝마치고, 나를 호출했던 이전 부모 화면(메인 리포트 등)으로 복귀한다. (화면 닫기 표준).
- **`LEAVE PROGRAM`**:
  - **거동**: 아예 프로그램 트랜잭션 자체를 셧다운하고 SAP 첫 메인 화면(Easy Access)으로 완전히 튕겨 나가 종료한다. (프로그램 종료 표준).
- **`SET SCREEN <번호>` 와 `LEAVE SCREEN`**:
  - `SET SCREEN 0200` 은 "다음 화면은 0200번이다" 라고 예약 명표만 꽂아둘 뿐, 즉시 떠나지 않고 PAI 모듈 끝까지 다 돈 뒤에 이동한다.
  - 만약 예약을 꽂자마자 뒷 코드를 실행하지 않고 즉시 날아가고 싶다면, `LEAVE SCREEN.` 을 즉시 후속 호출하여 PAI를 중도 중단하고 순간이동 시켜야 한다.

### 어떻게 확인하는가

PAI 모듈 내부에서 save_ok 패턴을 이식하고 화면 탈출을 제어하는 소스 규격을 검증한다.

```abap
REPORT zch16_l05_pai_control.

DATA: ok_code TYPE sy-ucomm,
      save_ok TYPE sy-ucomm.

MODULE user_command_0100 INPUT.
  " [1단계 철칙] 들어온 총알을 안전 백업방으로 대피!
  save_ok = ok_code.
  " [2단계 철칙] 중복 연타 재실행 방지를 위해 원천 방을 즉시 소멸!
  CLEAR ok_code.

  " [3단계 분기] 백업 변수로 흐름을 쪼개기!
  CASE save_ok.
    WHEN 'SAVE'.
      " 예매 처리 집행
    WHEN 'BACK' OR 'CANCEL'.
      " [탈출 철칙] 화면 시퀀스를 닫고 호출자로 평화롭게 복귀!
      LEAVE TO SCREEN 0.
    WHEN 'EXIT'.
      " [종료 철칙] 프로그램 트랜잭션 전체를 즉시 셧다운!
      LEAVE PROGRAM.
  ENDCASE.
ENDMODULE.
```

#### 체험/시뮬레이터 설계 (OK_CODE 안전 분기 실험실)
- **프로세스 플로우**:
  1. 학습자가 [CLEAR ok_code 코드 제거] 토글을 켠다.
  2. [저장(SAVE)] 버튼을 클릭한다. PAI가 돌며 "예매 완료" 가 뜬다.
  3. 이어서 화면 빈자리에서 [Enter 키보드 클릭] 버튼을 누른다. 
  4. 변수 ok_code 방에 여전히 고여있던 `'SAVE'` 문자열이 다시 엔진을 타서 "예매 완료"가 한 번 더 발생하여 데이터가 뻥튀기 중복 적재되는 오작동을 확인한다.
  5. [L05 save_ok 패턴 복원] 토글을 켠다. SAVE 클릭 즉시 ok_code 방이 `CLEAR` 되어 하얗게 비워지고, 엔터를 쳐도 아무 부작용이 일어나지 않는 완벽한 방어막을 감상한다.
- **상태 및 데이터**:
  - `EXIT 분기 조건에서 LEAVE PROGRAM 대신 LEAVE TO SCREEN 0을 기입한 상태` -> EXIT를 클릭했음에도 프로그램 전체가 꺼지지 않고 단지 이전 한 단계 화면만 닫혀 흐름이 꼬이는 관례 위배 연출.
- **피드백**: save_ok 대피와 CLEAR 소멸은 엔터 연타 버그를 방어하는 백엔드 아키텍처의 필수 위생 수칙임을 알려준다.

### 실수/주의

- **LEAVE SCREEN 단독 사용**: "화면을 즉시 종료하고 싶으니 `LEAVE SCREEN.` 만 적어야지" 했다가는, 다음 화면 예약(`SET SCREEN`)을 하지 않은 상태라, statically 정의되어 있는 기본 next screen(보통 자기 자신 0100번)이 다시 로드되어 제자리에서 굳어버리게 되므로, 종료 복귀 시에는 단독 `LEAVE SCREEN` 이 아니라 반드시 **`LEAVE TO SCREEN 0`** 지시어로 0번(시퀀스 종료)을 명시해야 한다.

### 정리

- **`PAI`** 는 PUSHBUTTON 등을 눌러 들어온 `ok_code` 값을 대조하여 명령을 분기하는 시점이다.
- 중복 저장을 막기 위해 **`save_ok = ok_code.` 복사 후 즉시 `CLEAR ok_code.`** 패턴을 엄수한다.
- 호출자 복귀는 **`LEAVE TO SCREEN 0`**, 전체 셧다운은 **`LEAVE PROGRAM`** 으로 명확하게 기어 분할 설계한다.

---

## CH16-L06 - PF-STATUS와 TITLEBAR

### 왜 필요한가

딘프로 화면의 내부 구성을 다 갖췄다. 
이제 화면 맨 위쪽 천장을 채워야 한다. 사용자가 뒤로 가고, 저장하고, 취소할 수 있도록 SAP 표준 녹색/노란색/빨간색 화살표 아이콘을 띄워야 하고, 현재 사용자가 어느 트랜잭션을 가동 중인지 제목 표시줄에 이름표를 붙여주어야 한다. 

만약 이 상단 단축 메뉴들의 코드 체계가 백엔드 PAI 분기문과 어긋나 있다면, 사용자가 저축(SAVE) 아이콘을 아무리 마우스로 클릭해 봐야 신호가 전달되지 않아 무반응으로 굳게 된다. 
**Menu Painter(SE41) 도구로 상단 천장 단축키 메뉴판을 빚어내어 백엔드 PAI의 ucomm 체계와 1:1로 결합하고, 특정 상황에 따라 버튼을 실시간으로 얼려 끄거나 켜며, 제목에 라이브 변수 값을 채워주는 천장 연동 기술**이 필요하다. 그것이 **[[GUI Status]]** (PF-STATUS) 와 **[[TITLEBAR]]** (타이틀바) 이다.

### 무엇인가

#### 1. GUI Status (PF-STATUS - 천장 메뉴판)의 정의
- **정의**: 화면 최상단의 메뉴바, 표준 툴바, 어플리케이션 단축키 툴바를 SE41 도구에서 정의하여 딘프로 화면에 장착하는 상단 단축키 조종판 세트다.
- **가동**: PBO 시점 모듈 내부에서 **`SET PF-STATUS '상태명'.`** 명령어를 가동하여 켜둔다. 버튼이 눌리면 지정해 둔 Function Code가 PAI의 `ok_code`로 도킹되어 전달된다.

#### 2. EXCLUDING 동적 버튼 차단
- 권한이 없는 계정이거나 마감된 공연 데이터인 경우, 상단의 [저장 (SAVE)] 버튼을 아예 클릭하지 못하도록 툴바에서 숨기거나 얼려두어야 한다.
- **원리**: PBO 모듈 내부에 제외 대상 ucomm 문자열들을 담을 표준 내부 테이블(`gt_excl`)을 선언하고, `'SAVE'` 코드를 적재해 **`SET PF-STATUS '상태명' EXCLUDING gt_excl.`** 형태로 제외 테이블을 파라미터 매핑하여 전달하면, 화면이 렌더링되면서 해당 저장 아이콘 버튼만 알아서 비활성화되어 굳게 된다.

#### 3. TITLEBAR ... WITH 동적 제목 조율
- 제목은 박제된 텍스트가 아니다. "공연 C001 예매 화면" 처럼 현재 사용자가 만지는 변수 값에 따라 유동적으로 문구가 요동쳐야 한다.
- **원리**: SE41 제목창에 **`공연 &1 예매 화면`** 이라고 자리표시자 `&1`을 심어둔 뒤, PBO 모듈에서 **`SET TITLEBAR '제목명' WITH p_conc.`** 지시어로 쏴주면, `&1` 자리에 변수 값 `C001`이 자동으로 치환 합체되어 사용자 타이틀 창에 안착 노출된다.

### 어떻게 확인하는가

PBO 내부에서 잠금 플래그 조건에 따라 SAVE 버튼을 제외하고, 타이틀바에 값을 주입하는 소스를 검증한다.

```abap
REPORT zch16_l06_gui_status.

DATA: p_conc   TYPE zconcert-concert_id,
      p_locked TYPE c LENGTH 1,
      gt_excl  TYPE STANDARD TABLE OF sy-ucomm,
      gv_fcode TYPE sy-ucomm.

MODULE status_0100 OUTPUT.
  CLEAR gt_excl.
  
  " 1. 잠금 플래그 작동 시 제외 목록 테이블에 'SAVE' 탑재!
  IF p_locked = 'X'.
    gv_fcode = 'SAVE'.
    APPEND gv_fcode TO gt_excl.
  ENDIF.

  " 2. PF-STATUS 가동 및 제외 테이블 매핑 송신!
  SET PF-STATUS 'ST100' EXCLUDING gt_excl.
  
  " 3. 타이틀바 가동 및 자리표시자 변수 수혈 송신!
  SET TITLEBAR 'TB100' WITH p_conc.
ENDMODULE.
```

#### 체험/시뮬레이터 설계 (Toolbar와 Function Code 매핑판)
- **프로세스 플로우**:
  1. 학습자가 [p_locked = 'X'] 토글을 켠다.
  2. 상단 가상 툴바의 디스켓 모양 [저장] 아이콘 위로 희뿌연 금지망이 씌워지며 비활성 회색 상태로 얼어붙는 모션을 본다.
  3. [p_conc 값에 'C003' 입력]을 누른다.
  4. 타이틀바 텍스트의 `&1` 영역이 라이브로 `C003` 문자로 촥 치환되면서 제목 창이 '공연 C003 예매' 로 실시간 교체 완료되는 연동 피드백을 감상한다.
- **상태 및 데이터**:
  - `EXCLUDING 테이블 값에 대문자 'SAVE'가 아닌 소문자 'save'를 적고 전달한 상태` -> ucomm 대조 엔진이 소문자를 감지하지 못해 저장 버튼이 차단되지 않고 계속 활성화되어 뚫려있는 오작동 노출.
- **피드백**: GUI Status의 제외 테이블과 PAI 비교 코드는 모두 대문자(Uppercase) ucomm 표준으로 통일 매칭되어야 맥이 통한다는 점을 상기시킨다.

### 실수/주의

- **PF-STATUS 생성 시 표준 뒤로가기(BACK) 단축 키 매핑 누락**: 입문자가 Menu Painter에서 내 버튼만 만들고 깜빡 잊고 표준 툴바의 초록색 화살표(BACK)에 FctCode `'BACK'` 지정을 빼먹으면, 사용자가 화면에서 아무리 백 화살표를 눌러도 PAI로 아무 ucomm도 날아가지 않는 먹통 툴바 버그를 겪게 되므로, **표준 3대 아이콘(BACK, EXIT, CANCEL) 매핑은 PF-STATUS 개설 시의 절대적 의무**이다.

### 정리

- **`PF-STATUS`** (GUI 상태)는 화면의 상단 메뉴 조종판이며, **`TITLEBAR`** 는 제목 이름표다.
- PBO 모듈 내에서 **`SET PF-STATUS ... EXCLUDING`** 으로 특정 버튼을 동적으로 비활성화한다.
- 제목의 자리표시자 `&1`~`&9` 는 **`SET TITLEBAR ... WITH`** 지시어로 실시간 관람 변수 값을 투사해 채운다.

---

## CH16-L07 - Custom Control과 Container · Tabstrip · Subscreen

### 왜 필요한가

화면에 단순 텍스트 입력창과 툴바 버튼을 훌륭하게 장착했다. 
하지만 실제 예매 리포트 화면 기획은 훨씬 더 입체적이고 다차원적이다. 
"화면 정중앙 넓은 영역에 격자 모양의 좌석 현황 ALV 표를 큼직하게 얹어두어 실시간 모니터링을 시키고 싶고, 화면 좌측에는 예매자 정보 탭, 우측에는 가격 정보 탭으로 나누어 탭스트립(Tabstrip) 구조를 짜주고 싶다" 
하지만 Dynpro 에디터(SE51)는 엑셀 격자판이나 복잡한 탭 연산 엔진을 내장하고 있지 않다. 
**화면의 한 구석을 빈 사각 영역으로 기획해 구획(Custom Control)을 뚫어두고, 백엔드에서 1회성 객체 컨테이너(Custom Container)를 출산해 연결하여, 그 위에 훗날 ALV나 트리 같은 대형 조작 객체를 도킹할 수 있게 다리를 놓아주는 화면 분할 구조 설계 기술**이 필요하다. 그것이 **Custom Control 과 Container** 의 도킹 레이아웃 기획이다.

### 무엇인가

#### 1. Custom Control 과 Custom Container
- **Custom Control (화면 상의 사각 구멍)**:
  - Screen Painter Layout 상에 그리는 **"빈 사각지대 영역"** (예: `CONT100` 이름 지정)이다. 
  - 그 자체로는 아무 기능이 없고, 오직 "이 자리에 대형 컨트롤을 얹겠다" 는 자리 표시 구역계다.
- **Custom Container (물리 도킹 장치 - `CL_GUI_CUSTOM_CONTAINER`)**:
  - 이 빈 구멍 영역과 실제 백엔드 ALV 객체를 물리적으로 단단히 이어 붙여 결합해주는 다리(Bridge) 인스턴스다.
  - *가드레일*: 객체 참조(`REF TO`) 및 생성(`CREATE OBJECT`) OO 문법은 훗날 **CH20**에서 정식으로 마스터한다. 지금은 "화면 구획 이름과 `container_name` 파라미터를 묶어 다리를 개설하는 연결 메커니즘" 으로만 이해하고 수용한다.
- **⚠️ [PBO 매회 중복 생성 방어 가드 철칙]**:
  - *초보 개발자들이 가장 많이 화면을 켜자마자 시스템 덤프를 유발하는 중대 함정이다.*
  - PBO는 화면에 뭔가가 감지될 때마다 끊임없이 반복 구동된다.
  - 만약 `CREATE OBJECT go_cont` 문장을 가드 없이 방치하면, PBO가 돌 때마다 똑같은 물리 도킹 다리 객체를 수백 번 중복 생성하여 메모리 충돌 덤프(`OBJECT_ALREADY_EXISTS`)를 내고 뻗어버린다.
  - **반드시 `IF go_cont IS INITIAL.` (참조 변수가 비어있을 때만 작동) 이라는 1회성 가드 스위치로 감싸서, 프로그램 생명주기 통틀어 오직 단 1회만 인스턴스를 출산하도록 설계해야 한다.**

#### 2. Subscreen Area 와 Flow Logic CALL
- **Subscreen (끼워 넣기 액자)**: 메인 화면의 일부분에 완전히 다른 화면 번호(예: `0110`번)를 프레임 액자처럼 끼워 넣는 기술이다.
- **Flow Logic 제어**: PBO와 PAI 양쪽 Flow Logic 코드창 내부에 반드시 **`CALL SUBSCREEN 영역명 INCLUDING sy-repid '화면번호'.`** 명령어를 대칭으로 징검다리 선언해주어야 정상 투사된다.
- **자체 OK_CODE 부재 제약**: Subscreen 내부의 버튼을 클릭하더라도 서브 화면 단독으로는 ucomm을 해독하지 못한다. **모든 단축키 명령(ucomm)은 메인 화면의 `OK_CODE` 변수 방으로 통합 유입**되므로, 메인 PAI의 user_command 모듈에서 일괄 제어 책임 선을 쥐어야 한다.

### 어떻게 확인하는가

PBO 모듈 내부에서 IS INITIAL 가드를 세워 안전하게 Custom Container 객체를 1회만 빌드하는 소스를 검증한다.

```abap
REPORT zch16_l07_container.

" [변수 선언 철칙] 클래스 cl_gui_custom_container 인스턴스를 담을 참조 변수!
DATA go_cont TYPE REF TO cl_gui_custom_container.

MODULE create_container_0100 OUTPUT.
  " [중복 생성 방어 가드 철칙] 반드시 비어있을 때만 최초 1회 생성하도록 차단!
  IF go_cont IS INITIAL.
    " [객체 생성 철칙] container_name은 Layout에 뚫어둔 구멍명 'CONT100' 과 대문자 일치 매핑!
    CREATE OBJECT go_cont
      EXPORTING
        container_name = 'CONT100'.
  ENDIF.
ENDMODULE.
```

#### 체험/시뮬레이터 설계 (화면 분할과 컨테이너 설계판)
- **프로세스 플로우**:
  1. 학습자가 [1회차 PBO 실행]을 누른다.
  2. `IF go_cont IS INITIAL` 가드문 통과 녹색등이 켜지고 `go_cont` 참조 변수가 노란색으로 충전되며 도킹 다리가 안전하게 개설 완료된다.
  3. 이어서 [2회차 PBO 재실행] 버튼을 클릭한다.
  4. 가드문 검사 단계에서 `IS INITIAL` 판정이 **거짓(False)** 으로 바뀌어 우회 통과(Bypass) 신호가 켜지고, 추가 생성을 철저히 회피하는 평화로운 생명주기 렌더링을 확인한다.
- **상태 및 데이터**:
  - `IS INITIAL 가드문을 고의로 주석 해제하고 2회차 실행을 기동한 상태` -> "Container ZCONT already exists" 붉은 덤프 폭발 아이콘과 함께 시스템이 충돌 종료되는 사고 피드백 표출.
- **피드백**: Custom Control은 빈 영역일 뿐이며, PBO의 중복 생성 지뢰밭을 피하기 위해서는 반드시 IS INITIAL 가드가 수반되어야 함을 알려준다.

### 실수/주의

- **Subscreen 화면 Attributes 설정 누락**: Screen Painter에서 subscreen으로 쓸 딘프로 화면(예: 0110번)을 생성해 두고, 그 화면의 Attributes 세팅에서 Screen Type을 **`Subscreen`** 으로 수동 변경해주지 않으면, 메인 화면에서 로드하려 할 때 화면 타입 불일치 덤프를 터트리므로 subscreen 지정은 절대 필수다.

### 정리

- **`Custom Control`** 은 훗날 ALV 격자판을 도킹할 빈 사각 구획 구역이며, **`CL_GUI_CUSTOM_CONTAINER`** 다리를 통해 실체화한다.
- 중복 생성 덤프를 방어하기 위해 반드시 **`IF ... IS INITIAL.`** 1회성 가드로 묶어 인스턴스를 빌드한다.
- Subscreen Area는 자체 OK_CODE를 가질 수 없으며, 모든 단축 명령 ucomm은 **메인 화면 `OK_CODE`로 통합 수납**된다.

---

## CH16-L08 - 실습 — 예매 입력 화면 (Dynpro)

### 왜 필요한가

우리가 배운 딘프로 화면의 4대 속성, PBO의 화면 성형, PAI의 save_ok 안전 가드, VRM 드롭다운 목록 수혈, GUI Status의 단축 아이콘 셋업, Custom Control 도킹 기획을 각개전투로 학습했다. 

이제 이 파편화된 기술들을 **🎫 하나의 흐름으로 묶은 종합 '예매 입력 Dynpro 프로그램'** 으로 탄생시킬 시간이다. T-code를 치고 메인 화면에 들어가면 라이브 제목과 드롭다운 예약 상태 목록이 촥 세팅되어 있고(PBO), 사용자가 좌석 수를 치고 [저장 (SAVE)] 버튼을 클릭하면 백엔드 검증 모듈(`can_book`)이 가동되어 잔여석 초과 시 에러 메시지로 입력창을 사수하며, 종료 버튼 클릭 시 ok_code 클리어 및 안전한 화면 복귀(PAI)가 가동되는 **완벽한 종합 사용자 인터페이스 양식**의 내재화가 필수적이다.

### 무엇인가

#### 🎫 종합 예매 입력 Dynpro 프로그램 전체 아키텍처 명세
우리는 하나의 Module Pool 프로그램(`PROGRAM sapmzconcert`)을 설계하고, Screen Painter를 통해 0100번 화면을 개설해 다음 4단계를 동기화한다.

1. **상단 천장 및 드롭다운 세팅 (`PBO - status_0100 / fill_status_list`)**:
   - `SET PF-STATUS 'ST100'` 및 `SET TITLEBAR 'TB100' WITH p_conc` 로 화면 조종 조율.
   - 드롭다운 `p_stat` 에 `VRM_SET_VALUES` 함수를 동적 호출하여 `R` (예약) 과 `W` (대기) 코드 목록을 주입해 수혈.
2. **명령어 세이브 가드 (`PAI - user_command_0100 1단계`)**:
   - 버튼 입력 ucomm 수신 즉시 `save_ok = ok_code.` 대피 후 **`CLEAR ok_code.`** 를 즉각 집행하여 엔터 중복 저장 원천 가드.
3. **비즈니스 정합성 검증 (`PAI - user_command_0100 2단계`)**:
   - `save_ok = 'SAVE'` 이면, 서브루틴 `can_book` 을 호출하여 잔여석 유효 검사 집행.
   - 불합격 시 **`MESSAGE ... TYPE 'E'`** 를 뿜어 딘프로 화면을 그대로 유지하고 입력 필드를 다시 사수.
4. **표준 이탈 기어 (`PAI - user_command_0100 3단계`)**:
   - `save_ok = 'BACK'` 또는 `'CANCEL'` 이면 **`LEAVE TO SCREEN 0`** 으로 화면 시퀀스를 닫고 복귀.
   - `save_ok = 'EXIT'` 이면 **`LEAVE PROGRAM`** 으로 전체 셧다운 이탈.

### 어떻게 확인하는가

T-code를 기동하여 5대 시나리오에 따라 Dynpro 프로그램의 종합 정합성을 수동 검수한다.

1. `SE93` 을 켜고 단축 코드 `ZCON100` 을 입력해, 대상 프로그램 `sapmzconcert` 와 시작 화면 번호 `0100`을 물려 T-code를 개설한다.
2. `/nZCON100` 을 명령창에 기입하고 실행한다. -> 타이틀바에 공연 코드가 라이브로 매칭되며 화면이 안전하게 기동되는지 확인한다. (1문 T-code 게이트 검수).
3. 예약 상태 드롭다운 상자를 눌러 `예약`, `대기` 2개 선택 목록이 동적으로 수혈되어 잘 펼쳐지는지 확인한다. (2문 VRM 목록 검수).
4. 좌석 수에 9999석(잔여석 초과)을 기입하고 [저장] 단추를 누른다. -> PAI 검증 모듈이 작동해 "좌석이 부족합니다 (E)" 에러를 내며 저장을 거부하고 화면을 그대로 살려두는지 확인한다. (3문 PAI 검증 검수).
5. 올바른 좌석 수 입력 후 [저장]을 눌러 성공한 상태에서, 키보드 [엔터] 키를 마구 연타한다. -> save_ok 패턴으로 ok_code 방이 이미 비워졌기 때문에, 중복 저장이 재발동하지 않고 고요하게 유지되는지 확인한다. (4문 중복 연타 가드 검수).
6. 툴바의 초록색 화살표 [BACK]을 클릭하여, 호출자 화면으로 평화롭게 복귀 종료되는지 확인한다. (5문 LEAVE TO SCREEN 0 이탈 검수).

```abap
" [ ABAP 프로그램 메인 소스 파일 ]
PROGRAM sapmzconcert.

" 화면 바인딩 전역 변수 선언!
DATA: p_conc  TYPE zconcert-concert_id,
      p_perf  TYPE c LENGTH 3,
      p_seats TYPE i,
      p_cust  TYPE c LENGTH 30,
      p_stat  TYPE c LENGTH 1,
      ok_code TYPE sy-ucomm,
      save_ok TYPE sy-ucomm.

DATA: gt_values TYPE vrm_values,
      gs_value  LIKE LINE OF gt_values.

" ----------------------------------------------------
" PBO 구획: 화면이 사용자 눈에 뿌려지기 직전 단장!
" ----------------------------------------------------
MODULE status_0100 OUTPUT.
  SET PF-STATUS 'ST100'.
  SET TITLEBAR  'TB100' WITH p_conc.
ENDMODULE.

MODULE fill_status_list OUTPUT.
  CLEAR gt_values.
  gs_value-key = 'R'. gs_value-text = '예약완료'. APPEND gs_value TO gt_values.
  gs_value-key = 'W'. gs_value-text = '대기신청'. APPEND gs_value TO gt_values.
  CALL FUNCTION 'VRM_SET_VALUES'
    EXPORTING id = 'P_STAT' values = gt_values.
ENDMODULE.

" ----------------------------------------------------
" PAI 구획: 사용자가 행동을 완료하고 들어오는 시점!
" ----------------------------------------------------
MODULE user_command_0100 INPUT.
  DATA lv_ok TYPE abap_bool.

  " [대피 및 비우기 세트 철칙] ucomm 유실 및 연타 방지!
  save_ok = ok_code.
  CLEAR ok_code.

  CASE save_ok.
    WHEN 'SAVE'.
      " 잔여석 체크 서브루틴 가동!
      PERFORM can_book USING p_conc p_perf p_seats CHANGING lv_ok.
      IF lv_ok = abap_true.
        MESSAGE '예매가 가능합니다. (저장은 트랜잭션 장에서)' TYPE 'S'.
      ELSE.
        MESSAGE '좌석이 부족합니다' TYPE 'E'. " 화면을 잠그고 억류 복귀!
      ENDIF.
    WHEN 'BACK' OR 'CANCEL'.
      LEAVE TO SCREEN 0. " 화면 시퀀스 종료
    WHEN 'EXIT'.
      LEAVE PROGRAM.     " 프로그램 셧다운
  ENDCASE.
ENDMODULE.
```

#### 체험/시뮬레이터 설계 (예매 입력 Dynpro 통합 시뮬레이터)
- **프로세스 플로우**:
  1. 학습자가 [ZCON100 단축키 클릭]을 누른다.
  2. 0100번 딘프로 조종반 화면이 로드된다.
  3. 학습자가 좌석 수에 `100석` 을 타이핑하고 [저장(SAVE)] 버튼을 탭한다.
  4. PAI 기차가 출발해 `save_ok` 에 SAVE를 옮기고 `ok_code` 통을 하얗게 비운 뒤, `can_book` 연산 모듈을 거친다.
  5. 잔여석 합격 파란불이 들어오고, "예매가 가능합니다" 상태 메시지가 뜨며, 엔터를 다시 쳐도 ok_code가 비워졌기 때문에 2중 저장이 차단되는 방어막 작동 비주얼을 확인한다.
- **상태 및 데이터**:
  - `좌석 수에 9999석(불합격)을 친 후 SAVE 클릭` -> 붉은색 에러 차단막이 켜지며 "좌석이 부족합니다" 가 출력되고, 화면 입력창 정보가 지워지지 않은 채 그대로 유지되어 재입력을 유도하는 억류 상태 피드백 표출.
- **피드백**: "딘프로 프로그램의 생명주기는 PBO의 단장으로 문을 열고, PAI의 save_ok 가드와 화면 복귀어(LEAVE)로 문을 닫는 완결된 데이터 순환 체인" 임을 마지막 캡스톤 완료 배지와 함께 보여준다.

### 실수/주의

- **PAI 검증 에러(MESSAGE E) 발생 시 화면 필드 값이 지워진다고 착각**: MESSAGE E가 발생하면 화면 제어 엔진은 **사용자가 친 데이터를 고스란히 살려둔 채 화면을 억류 복귀**시킨다. 이는 사용자가 처음부터 다시 칠 필요 없이 오타 난 부분만 마우스로 고쳐 쓰게 돕는 딘프로 표준 설계이므로 당황하지 않고 재입력을 유도하면 된다.

### 정리

- **`T-code 생성` $\rightarrow$ `PBO status/VRM 세팅` $\rightarrow$ `PAI save_ok 대피 및 CLEAR` $\rightarrow$ `can_book 검증` $\rightarrow$ `LEAVE 화면 복귀`** 로 이어지는 모듈 풀 전체 라이프사이클을 완성한다.
- `ok_code`를 읽은 후 즉시 **`CLEAR`** 해주는 패턴은 엔터 중복 저장을 막는 필수 아키텍처다.
- 화면은 임의로 끝나지 않으므로, 사용자 이탈 시 **`LEAVE TO SCREEN 0`** (시퀀스 복귀) 과 **`LEAVE PROGRAM`** (프로그램 셧다운)을 목적에 맞게 도킹 설계한다.
