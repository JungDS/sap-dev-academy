# CH16 · Screen Programming / Dynpro 기초 — codex_0625 강의 개선·보강본

> 생성 시각: 2026-06-25-13:22 KST  
> 기준 소스: `content/abap/CH16/_chapter.md` + 해당 챕터 레슨 8개  
> 목적: 원본 `content/abap`을 덮어쓰지 않고, 이후 리빌드/강의자료 작성에 바로 사용할 수 있는 고밀도 보강안을 제공한다.

## 1. 프로젝트 분석 기준

- 학습 대상: 개발·전공 경험 없는 입문자. 설명은 압축하지 않고 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리" 순서로 풀어쓴다.
- R15 게이팅: 이미 배운 것만으로 이해할 수 있어야 한다. 후속 개념은 L1 예고까지만 허용하고, 코드나 정의를 앞당기지 않는다.
- R2 코드=체험: 코드가 1줄이라도 있으면 같은 페이지에서 조작하거나, 최소한 어떤 시뮬레이터/다이어그램/버튼 흐름으로 체험할지 명시한다.
- 참고 우선순위: 로컬 `content/abap`과 `.project-docs`가 NotebookLM보다 최신이다. NotebookLM은 큰 방향 참고로만 사용한다.

## 2. 이 챕터의 강의 목표

리포트 자동 화면을 벗어나 직접 설계한 SAP GUI 화면을 만든다.

**반드시 강화할 지점**
- Module Pool, Screen Number, PBO/PAI를 두 박자 리듬으로 설명
- OK_CODE와 BACK/EXIT/CANCEL 차이를 반드시 구분
- Screen Painter 요소와 ABAP 변수 바인딩을 나란히 보여줌
- Table Control은 제외하고 ALV로 대체한다는 실무 판단 명시

**대표 체험 설계**
- 화면 요소를 누르면 OK_CODE가 바뀌고 PAI 모듈이 실행되는 흐름을 시뮬레이터로 보여준다.

**이전/다음 연결**
- 이전: CH15 · Report Event·Selection Screen 심화
- 다음: CH17 · Grid ALV 기초

## 3. 원본 진단 요약

| 항목 | 값 |
|---|---:|
| 레슨 수 | 8 |
| 본문 총 글자(공백 제외) | 6155 |
| 코드 블록 | 16 |
| embed 지시문 | 2 |
| 용어 마킹 | 8 |
| 진단 플래그 총합 | 18 |

| 레슨 | 제목 | 본문자 | 코드 | embed | 진단 |
|---|---|---:|---:|---:|---|
| CH16-L01 | Module Pool 프로그램 구조 | 776 | 0 | 1 | 본문빈약 |
| CH16-L02 | Screen Number와 Screen Painter | 615 | 2 | 0 | R2-체험누락, 본문빈약 |
| CH16-L03 | 화면 요소 — 입력·버튼·체크박스·라디오·드롭다운 | 995 | 2 | 1 | 본문주의 |
| CH16-L04 | PBO 처리 흐름 | 647 | 4 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH16-L05 | PAI 처리 흐름 — OK_CODE와 화면 떠나기 | 918 | 2 | 0 | R2-체험누락, 본문주의 |
| CH16-L06 | PF-STATUS와 TITLEBAR | 575 | 2 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH16-L07 | Custom Control과 Container · Tabstrip · Subscreen | 804 | 2 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH16-L08 | 실습 — 예매 입력 화면 (Dynpro) | 825 | 2 | 0 | R2-체험누락, 본문빈약, 흐름압축 |

## 4. 게이팅·품질 리스크

- CH17까지는 classic-first 구간이다. inline DATA, VALUE, NEW, @ host variable, string template을 새로 끌어오지 않는다. 단 CH04의 && 예외는 허용된다.
- 코드가 있으나 embed가 없는 레슨이 있다. 본문 보강 시 코드 주변에 체험/시뮬레이터 또는 최소한 조작형 퀴즈 설명을 붙여야 한다.
- 본문이 짧은 레슨이 있다. 왜 필요한가, 실수하면 무엇이 깨지는가, 어디서 확인하는가를 별도 섹션으로 늘린다.

## 5. 레슨별 개선·보강안

### CH16-L01 · Module Pool 프로그램 구조

**원본 신호**
- 파일: `content/abap/CH16/CH16-L01.md`
- 방향: 화면 중심 프로그램의 뼈대 — Module Pool과 PBO/PAI.
- 키워드: Module Pool, Dynpro, PBO, PAI, SE80
- introduces: Module Pool, Dynpro, PBO/PAI 개요, Module Pool T-code(필수)
- prereq: CH15
- 진단: 본문 776자 · 섹션 4개 · 코드 0개 · embed 1개 · 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Module Pool 프로그램 구조를 제시한다.
- 핵심 설명: 화면 이름을 외우게 하지 말고, 명령창 입력 -> 객체 생성 -> 저장 -> 활성화 -> 실행의 손동작으로 기억시킨다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH16-L01-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Module Pool 프로그램 구조의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`

### CH16-L02 · Screen Number와 Screen Painter

**원본 신호**
- 파일: `content/abap/CH16/CH16-L02.md`
- 방향: 화면에 번호를 붙이고, Screen Painter로 레이아웃을 그린다.
- 키워드: Screen Number, Screen Painter, Flow Logic, SE51
- introduces: Screen Number, Screen Painter, Flow Logic
- prereq: CH16-L01
- 진단: 본문 615자 · 섹션 4개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Screen Number와 Screen Painter를 제시한다.
- 핵심 설명: 화면 출력(PBO)과 사용자 입력 처리(PAI)를 두 박자 리듬으로 반복시켜 암기 없이 흐름을 잡게 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 이벤트 타임라인. 실행 버튼, 검증 오류, PBO/PAI, MESSAGE 표시 위치를 클릭식으로 추적한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Screen Number와 Screen Painter의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`

### CH16-L03 · 화면 요소 — 입력·버튼·체크박스·라디오·드롭다운

**원본 신호**
- 파일: `content/abap/CH16/CH16-L03.md`
- 방향: 화면에 올리는 기본 요소들과 변수 연결.
- 키워드: Input Field, Push Button, Checkbox, Radiobutton, Dropdown
- introduces: Input/Output Field, Text Field, Push Button, Checkbox, Radiobutton, Dropdown
- prereq: CH16-L02
- 진단: 본문 995자 · 섹션 4개 · 코드 2개 · embed 1개 · 본문주의

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 화면 요소 — 입력·버튼·체크박스·라디오·드롭다운를 제시한다.
- 핵심 설명: 값, 타입, 이름, 재사용 범위를 각각 다른 색 카드로 분리한다. 초보자가 "변수명=값"과 "타입=규칙"을 섞지 않게 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH16-L03-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 화면 요소 — 입력·버튼·체크박스·라디오·드롭다운의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapdata.htm`
- `C:/ABAP_DOCU_HTML/abapdata_simple.htm`
- `C:/ABAP_DOCU_HTML/abapdata_referring.htm`
- `C:/ABAP_DOCU_HTML/abaptypes.htm`
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`

### CH16-L04 · PBO 처리 흐름

**원본 신호**
- 파일: `content/abap/CH16/CH16-L04.md`
- 방향: 화면을 그리기 직전 — 상태·초기값·필드 속성 준비.
- 키워드: PBO, MODULE, LOOP AT SCREEN, SET PF-STATUS
- introduces: PROCESS BEFORE OUTPUT, MODULE OUTPUT, LOOP AT SCREEN
- prereq: CH16-L02
- 진단: 본문 647자 · 섹션 3개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 PBO 처리 흐름를 제시한다.
- 핵심 설명: 행이 늘고 줄고 정렬되는 상태 변화를 눈으로 보여준다. 문법보다 "몇 행이 있고 어떤 키로 찾는가"를 먼저 묻는다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 메모리 상태 그리드. 변수/구조체/내부 테이블의 값이 실행 단계마다 어떻게 바뀌는지 스냅샷으로 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: PBO 처리 흐름의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapif.htm`
- `C:/ABAP_DOCU_HTML/abapcase.htm`

### CH16-L05 · PAI 처리 흐름 — OK_CODE와 화면 떠나기

**원본 신호**
- 파일: `content/abap/CH16/CH16-L05.md`
- 방향: 버튼을 누른 뒤 — OK_CODE 분기와 BACK/EXIT/CANCEL·LEAVE.
- 키워드: PAI, OK_CODE, BACK, EXIT, LEAVE TO SCREEN 0
- introduces: PROCESS AFTER INPUT, OK_CODE, BACK/EXIT/CANCEL, LEAVE TO SCREEN 0, LEAVE PROGRAM, LEAVE SCREEN
- prereq: CH16-L02, CH04
- 진단: 본문 918자 · 섹션 4개 · 코드 2개 · embed 0개 · R2-체험누락, 본문주의

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 PAI 처리 흐름 — OK_CODE와 화면 떠나기를 제시한다.
- 핵심 설명: 화면 출력(PBO)과 사용자 입력 처리(PAI)를 두 박자 리듬으로 반복시켜 암기 없이 흐름을 잡게 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 이벤트 타임라인. 실행 버튼, 검증 오류, PBO/PAI, MESSAGE 표시 위치를 클릭식으로 추적한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: PAI 처리 흐름 — OK_CODE와 화면 떠나기의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapif.htm`
- `C:/ABAP_DOCU_HTML/abapcase.htm`

### CH16-L06 · PF-STATUS와 TITLEBAR

**원본 신호**
- 파일: `content/abap/CH16/CH16-L06.md`
- 방향: 화면 위 메뉴·툴바·기능키와 제목을 단다.
- 키워드: PF-STATUS, TITLEBAR, GUI Status, SE41
- introduces: GUI Status, SET PF-STATUS, SET TITLEBAR
- prereq: CH16-L04
- 진단: 본문 575자 · 섹션 3개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 PF-STATUS와 TITLEBAR를 제시한다.
- 핵심 설명: 화면 출력(PBO)과 사용자 입력 처리(PAI)를 두 박자 리듬으로 반복시켜 암기 없이 흐름을 잡게 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 코드 실행 스텝퍼. 한 줄씩 실행하면서 입력값, 중간값, 출력값을 나란히 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: PF-STATUS와 TITLEBAR의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`

### CH16-L07 · Custom Control과 Container · Tabstrip · Subscreen

**원본 신호**
- 파일: `content/abap/CH16/CH16-L07.md`
- 방향: 화면 안에 ALV·트리를 박을 자리 — Container와 화면 분할 요소.
- 키워드: Custom Container, Tabstrip, Subscreen, Status Icon
- introduces: Custom Container, Tabstrip, Subscreen Area, Status Icon
- prereq: CH16-L02
- 진단: 본문 804자 · 섹션 3개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Custom Control과 Container · Tabstrip · Subscreen를 제시한다.
- 핵심 설명: Internal Table이 화면 표로 변환되는 순간을 보여준다. 표시 편의, 사용자 조작, 개발 복잡도 사이의 균형을 설명한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 코드 실행 스텝퍼. 한 줄씩 실행하면서 입력값, 중간값, 출력값을 나란히 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Custom Control과 Container · Tabstrip · Subscreen의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`

### CH16-L08 · 실습 — 예매 입력 화면 (Dynpro)

**원본 신호**
- 파일: `content/abap/CH16/CH16-L08.md`
- 방향: 콘서트앱 8단계 — 공연·좌석을 입력받아 검증하는 화면.
- 키워드: 실습, 콘서트앱, Dynpro, PAI, 검증
- introduces: 미선언
- prereq: CH16-L05, CH10-L07
- 진단: 본문 825자 · 섹션 3개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 실습 — 예매 입력 화면 (Dynpro)를 제시한다.
- 핵심 설명: 화면 출력(PBO)과 사용자 입력 처리(PAI)를 두 박자 리듬으로 반복시켜 암기 없이 흐름을 잡게 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 이벤트 타임라인. 실행 버튼, 검증 오류, PBO/PAI, MESSAGE 표시 위치를 클릭식으로 추적한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 실습 — 예매 입력 화면 (Dynpro)의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`


## 6. 이 챕터를 감탄나는 자료로 만들기 위한 마무리 체크

- 각 레슨 도입부는 "무엇을 배운다"가 아니라 "지금 무엇이 불편한가"로 시작한다.
- 레슨 끝에는 다음 레슨이 진짜 해결책일 때만 pain -> solution으로 연결한다. 병렬/심화 관계는 억지 불편을 만들지 않는다.
- ABAP 고유 용어는 영어 원문을 살리고 괄호로 쉬운 풀이를 붙인다.
- 코드 예제는 짧은 한 줄 설명, 실행 전 예상, 실행 후 결과 해석, 실패 케이스 순서로 닫는다.
- 공식 문서는 로컬 ABAP_DOCU 파일명으로 재확인하고, 예제는 프로젝트의 관통 예제(구구단, SFLIGHT, 콘서트 예매, 정훈영)를 우선 사용한다.
