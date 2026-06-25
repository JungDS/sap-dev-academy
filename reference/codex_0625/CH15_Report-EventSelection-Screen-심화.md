# CH15 · Report Event·Selection Screen 심화 — codex_0625 강의 개선·보강본

> 생성 시각: 2026-06-25-13:22 KST  
> 기준 소스: `content/abap/CH15/_chapter.md` + 해당 챕터 레슨 12개  
> 목적: 원본 `content/abap`을 덮어쓰지 않고, 이후 리빌드/강의자료 작성에 바로 사용할 수 있는 고밀도 보강안을 제공한다.

## 1. 프로젝트 분석 기준

- 학습 대상: 개발·전공 경험 없는 입문자. 설명은 압축하지 않고 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리" 순서로 풀어쓴다.
- R15 게이팅: 이미 배운 것만으로 이해할 수 있어야 한다. 후속 개념은 L1 예고까지만 허용하고, 코드나 정의를 앞당기지 않는다.
- R2 코드=체험: 코드가 1줄이라도 있으면 같은 페이지에서 조작하거나, 최소한 어떤 시뮬레이터/다이어그램/버튼 흐름으로 체험할지 명시한다.
- 참고 우선순위: 로컬 `content/abap`과 `.project-docs`가 NotebookLM보다 최신이다. NotebookLM은 큰 방향 참고로만 사용한다.

## 2. 이 챕터의 강의 목표

리포트가 실행될 때 Selection Screen과 Event가 어떤 순서로 움직이는지 배운다.

**반드시 강화할 지점**
- INITIALIZATION/PBO/PAI/START/END 흐름을 타임라인으로 고정
- MESSAGE 타입과 메시지 클래스는 여기서 정식 도입
- Selection Screen UI 옵션은 화면 요소와 변수 연결로 설명
- Variant와 다중 화면은 배치/운영으로 이어지는 다리로 둔다

**대표 체험 설계**
- 입력값 변경, 검증 에러, 조회 실행이 이벤트 타임라인에서 어느 지점에 걸리는지 클릭해 본다.

**이전/다음 연결**
- 이전: CH14 · Classic DDIC View·유지보수 객체
- 다음: CH16 · Screen Programming / Dynpro 기초

## 3. 원본 진단 요약

| 항목 | 값 |
|---|---:|
| 레슨 수 | 12 |
| 본문 총 글자(공백 제외) | 13414 |
| 코드 블록 | 46 |
| embed 지시문 | 1 |
| 용어 마킹 | 18 |
| 진단 플래그 총합 | 23 |

| 레슨 | 제목 | 본문자 | 코드 | embed | 진단 |
|---|---|---:|---:|---:|---|
| CH15-L01 | ABAP Report Event 전체 흐름 | 1623 | 0 | 1 | OK |
| CH15-L02 | INITIALIZATION 기본값 설정 | 580 | 2 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH15-L03 | AT SELECTION-SCREEN OUTPUT 동적 화면 제어 | 510 | 2 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH15-L04 | AT SELECTION-SCREEN 입력 검증 | 2217 | 8 | 0 | R2-체험누락 |
| CH15-L05 | START-OF-SELECTION 조회 실행 | 474 | 2 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH15-L06 | END-OF-SELECTION 출력 마무리 | 562 | 2 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH15-L07 | Selection Screen 권한/존재 여부 검증 기초 | 708 | 4 | 0 | R2-체험누락, 본문빈약 |
| CH15-L08 | Selection Screen 고급 — 블록·그룹 검증과 커스텀 F1·F4 | 1386 | 6 | 0 | R2-체험누락 |
| CH15-L09 | Selection Screen UI 구성 | 1728 | 8 | 0 | R2-체험누락 |
| CH15-L10 | PARAMETERS · SELECT-OPTIONS 옵션 총정리 | 1518 | 6 | 0 | R2-체험누락 |
| CH15-L11 | 여러 선택화면 — 화면번호·CALL·Variant | 1121 | 4 | 0 | R2-체험누락, 본문주의 |
| CH15-L12 | 실습 — 예매현황 리포트 (이벤트·검증) | 987 | 2 | 0 | R2-체험누락, 본문주의, 흐름압축 |

## 4. 게이팅·품질 리스크

- CH17까지는 classic-first 구간이다. inline DATA, VALUE, NEW, @ host variable, string template을 새로 끌어오지 않는다. 단 CH04의 && 예외는 허용된다.
- 코드가 있으나 embed가 없는 레슨이 있다. 본문 보강 시 코드 주변에 체험/시뮬레이터 또는 최소한 조작형 퀴즈 설명을 붙여야 한다.
- 본문이 짧은 레슨이 있다. 왜 필요한가, 실수하면 무엇이 깨지는가, 어디서 확인하는가를 별도 섹션으로 늘린다.

## 5. 레슨별 개선·보강안

### CH15-L01 · ABAP Report Event 전체 흐름

**원본 신호**
- 파일: `content/abap/CH15/CH15-L01.md`
- 방향: 실행형 프로그램의 이벤트 순서 — 언제 무엇이 실행되나.
- 키워드: Report Event, INITIALIZATION, START-OF-SELECTION, 흐름
- introduces: Report Event, INITIALIZATION, 이벤트 흐름(4종)
- prereq: CH03, CH08
- 진단: 본문 1623자 · 섹션 5개 · 코드 0개 · embed 1개 · 중대 플래그 없음

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 ABAP Report Event 전체 흐름를 제시한다.
- 핵심 설명: 사용자가 실행 버튼을 누르기 전과 후에 어느 이벤트가 끼어드는지 시간표로 가르친다. 메시지는 사용자와 프로그램의 계약으로 다룬다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH15-L01-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: ABAP Report Event 전체 흐름의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`

### CH15-L02 · INITIALIZATION 기본값 설정

**원본 신호**
- 파일: `content/abap/CH15/CH15-L02.md`
- 방향: 화면 뜨기 전 1회 — PARAMETERS/SELECT-OPTIONS 기본값.
- 키워드: INITIALIZATION, PARAMETERS, SELECT-OPTIONS, 기본값
- introduces: INITIALIZATION
- prereq: CH15-L01
- 진단: 본문 580자 · 섹션 3개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 INITIALIZATION 기본값 설정를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: INITIALIZATION 기본값 설정의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`

### CH15-L03 · AT SELECTION-SCREEN OUTPUT 동적 화면 제어

**원본 신호**
- 파일: `content/abap/CH15/CH15-L03.md`
- 방향: 화면 그리기 직전(PBO) — 필드를 동적으로 숨김/잠금.
- 키워드: AT SELECTION-SCREEN OUTPUT, LOOP AT SCREEN, PBO
- introduces: AT SELECTION-SCREEN OUTPUT, LOOP AT SCREEN, PBO
- prereq: CH15-L01
- 진단: 본문 510자 · 섹션 3개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 AT SELECTION-SCREEN OUTPUT 동적 화면 제어를 제시한다.
- 핵심 설명: 행이 늘고 줄고 정렬되는 상태 변화를 눈으로 보여준다. 문법보다 "몇 행이 있고 어떤 키로 찾는가"를 먼저 묻는다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: AT SELECTION-SCREEN OUTPUT 동적 화면 제어의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapif.htm`
- `C:/ABAP_DOCU_HTML/abapcase.htm`

### CH15-L04 · AT SELECTION-SCREEN 입력 검증

**원본 신호**
- 파일: `content/abap/CH15/CH15-L04.md`
- 방향: 사용자가 실행할 때(PAI) — 입력값을 검증하고, 화면 전체로도 필드 하나로도 막는다.
- 키워드: AT SELECTION-SCREEN, AT SELECTION-SCREEN ON, MESSAGE, 입력검증, PAI
- introduces: AT SELECTION-SCREEN, MESSAGE 타입(I/S/W/E/A/X), 메시지 클래스(SE91), 메시지 변수(&1~&4), PAI
- prereq: CH15-L01, CH08, CH09
- 진단: 본문 2217자 · 섹션 7개 · 코드 8개 · embed 0개 · R2-체험누락

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 AT SELECTION-SCREEN 입력 검증를 제시한다.
- 핵심 설명: 값, 타입, 이름, 재사용 범위를 각각 다른 색 카드로 분리한다. 초보자가 "변수명=값"과 "타입=규칙"을 섞지 않게 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: AT SELECTION-SCREEN 입력 검증의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapdata.htm`
- `C:/ABAP_DOCU_HTML/abapdata_simple.htm`
- `C:/ABAP_DOCU_HTML/abapdata_referring.htm`
- `C:/ABAP_DOCU_HTML/abaptypes.htm`
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`

### CH15-L05 · START-OF-SELECTION 조회 실행

**원본 신호**
- 파일: `content/abap/CH15/CH15-L05.md`
- 방향: 본 처리의 자리 — 조회·가공을 여기서.
- 키워드: START-OF-SELECTION, Open SQL, 본처리
- introduces: START-OF-SELECTION
- prereq: CH15-L01, CH08
- 진단: 본문 474자 · 섹션 3개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 START-OF-SELECTION 조회 실행를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: START-OF-SELECTION 조회 실행의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`

### CH15-L06 · END-OF-SELECTION 출력 마무리

**원본 신호**
- 파일: `content/abap/CH15/CH15-L06.md`
- 방향: 본 처리 후 마무리 — 출력·요약을 정리.
- 키워드: END-OF-SELECTION, 출력, ALV
- introduces: END-OF-SELECTION
- prereq: CH15-L01, CH11
- 진단: 본문 562자 · 섹션 3개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 END-OF-SELECTION 출력 마무리를 제시한다.
- 핵심 설명: Internal Table이 화면 표로 변환되는 순간을 보여준다. 표시 편의, 사용자 조작, 개발 복잡도 사이의 균형을 설명한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: END-OF-SELECTION 출력 마무리의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapwrite-.htm`
- `C:/ABAP_DOCU_HTML/abapwrite_to.htm`
- `C:/ABAP_DOCU_HTML/abenwrite_formats.htm`
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`

### CH15-L07 · Selection Screen 권한/존재 여부 검증 기초

**원본 신호**
- 파일: `content/abap/CH15/CH15-L07.md`
- 방향: 입력 단계에서 권한과 존재를 확인하는 기초.
- 키워드: AUTHORITY-CHECK, 입력검증, 권한, AT SELECTION-SCREEN
- introduces: AUTHORITY-CHECK
- prereq: CH15-L04
- 진단: 본문 708자 · 섹션 4개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Selection Screen 권한/존재 여부 검증 기초를 제시한다.
- 핵심 설명: 사용자가 실행 버튼을 누르기 전과 후에 어느 이벤트가 끼어드는지 시간표로 가르친다. 메시지는 사용자와 프로그램의 계약으로 다룬다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Selection Screen 권한/존재 여부 검증 기초의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapif.htm`
- `C:/ABAP_DOCU_HTML/abapcase.htm`

### CH15-L08 · Selection Screen 고급 — 블록·그룹 검증과 커스텀 F1·F4

**원본 신호**
- 파일: `content/abap/CH15/CH15-L08.md`
- 방향: 필드 하나를 넘어 — 블록/라디오그룹 검증과, 코드로 직접 만드는 F1 도움말·F4 입력 도움.
- 키워드: AT SELECTION-SCREEN ON, ON BLOCK, ON RADIOBUTTON GROUP, ON HELP-REQUEST, ON VALUE-REQUEST, F1, F4
- introduces: ON BLOCK, ON RADIOBUTTON GROUP, ON HELP/VALUE-REQUEST
- prereq: CH15-L04
- 진단: 본문 1386자 · 섹션 5개 · 코드 6개 · embed 0개 · R2-체험누락

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Selection Screen 고급 — 블록·그룹 검증과 커스텀 F1·F4를 제시한다.
- 핵심 설명: Dictionary 객체는 계층도를 먼저 보여준 뒤 한 객체씩 클릭해 의미가 어디서 화면으로 흘러가는지 추적한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Selection Screen 고급 — 블록·그룹 검증과 커스텀 F1·F4의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapcall_function.htm`

### CH15-L09 · Selection Screen UI 구성

**원본 신호**
- 파일: `content/abap/CH15/CH15-L09.md`
- 방향: 선택화면을 보기 좋게 — 블록·체크박스·라디오·버튼·탭·툴바.
- 키워드: SELECTION-SCREEN, BLOCK, CHECKBOX, RADIOBUTTON, PUSHBUTTON
- introduces: SELECTION-SCREEN BLOCK, COMMENT, PUSHBUTTON, PARAMETERS AS CHECKBOX, RADIOBUTTON GROUP, TABBED BLOCK, FUNCTION KEY(SSCRFIELDS)
- prereq: CH12, CH15-L02, CH15-L04
- 진단: 본문 1728자 · 섹션 6개 · 코드 8개 · embed 0개 · R2-체험누락

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Selection Screen UI 구성를 제시한다.
- 핵심 설명: Dictionary 객체는 계층도를 먼저 보여준 뒤 한 객체씩 클릭해 의미가 어디서 화면으로 흘러가는지 추적한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Selection Screen UI 구성의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapcall_function.htm`

### CH15-L10 · PARAMETERS · SELECT-OPTIONS 옵션 총정리

**원본 신호**
- 파일: `content/abap/CH15/CH15-L10.md`
- 방향: 입력 항목에 붙이는 옵션들을 한자리에 — 필수·기본값·메모리·소수·표시제어.
- 키워드: PARAMETERS, SELECT-OPTIONS, OBLIGATORY, MEMORY ID, MODIF ID
- introduces: PARAMETERS 옵션 총정리, SELECT-OPTIONS 옵션 총정리, MEMORY ID, MODIF ID
- prereq: CH15-L09, CH12
- 진단: 본문 1518자 · 섹션 5개 · 코드 6개 · embed 0개 · R2-체험누락

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 PARAMETERS · SELECT-OPTIONS 옵션 총정리를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: PARAMETERS · SELECT-OPTIONS 옵션 총정리의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`

### CH15-L11 · 여러 선택화면 — 화면번호·CALL·Variant

**원본 신호**
- 파일: `content/abap/CH15/CH15-L11.md`
- 방향: 선택화면을 여러 개 두고 골라 부른다 — 화면번호·팝업 호출·입력값 저장.
- 키워드: SELECTION-SCREEN, CALL SELECTION-SCREEN, Variant, 화면번호
- introduces: 선택화면 번호(기본 1000), CALL SELECTION-SCREEN, Selection Screen Variant
- prereq: CH15-L09, CH15-L08
- 진단: 본문 1121자 · 섹션 5개 · 코드 4개 · embed 0개 · R2-체험누락, 본문주의

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 여러 선택화면 — 화면번호·CALL·Variant를 제시한다.
- 핵심 설명: Internal Table이 화면 표로 변환되는 순간을 보여준다. 표시 편의, 사용자 조작, 개발 복잡도 사이의 균형을 설명한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 여러 선택화면 — 화면번호·CALL·Variant의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`

### CH15-L12 · 실습 — 예매현황 리포트 (이벤트·검증)

**원본 신호**
- 파일: `content/abap/CH15/CH15-L12.md`
- 방향: 콘서트앱 7단계 — 기본값·검증·조회·출력을 이벤트로 엮는다.
- 키워드: 실습, 콘서트앱, INITIALIZATION, MESSAGE, START-OF-SELECTION
- introduces: 미선언
- prereq: CH15-L02, CH15-L04, CH13-L08
- 진단: 본문 987자 · 섹션 3개 · 코드 2개 · embed 0개 · R2-체험누락, 본문주의, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 실습 — 예매현황 리포트 (이벤트·검증)를 제시한다.
- 핵심 설명: 사용자가 실행 버튼을 누르기 전과 후에 어느 이벤트가 끼어드는지 시간표로 가르친다. 메시지는 사용자와 프로그램의 계약으로 다룬다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 실습 — 예매현황 리포트 (이벤트·검증)의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapwrite-.htm`
- `C:/ABAP_DOCU_HTML/abapwrite_to.htm`
- `C:/ABAP_DOCU_HTML/abenwrite_formats.htm`
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`


## 6. 이 챕터를 감탄나는 자료로 만들기 위한 마무리 체크

- 각 레슨 도입부는 "무엇을 배운다"가 아니라 "지금 무엇이 불편한가"로 시작한다.
- 레슨 끝에는 다음 레슨이 진짜 해결책일 때만 pain -> solution으로 연결한다. 병렬/심화 관계는 억지 불편을 만들지 않는다.
- ABAP 고유 용어는 영어 원문을 살리고 괄호로 쉬운 풀이를 붙인다.
- 코드 예제는 짧은 한 줄 설명, 실행 전 예상, 실행 후 결과 해석, 실패 케이스 순서로 닫는다.
- 공식 문서는 로컬 ABAP_DOCU 파일명으로 재확인하고, 예제는 프로젝트의 관통 예제(구구단, SFLIGHT, 콘서트 예매, 정훈영)를 우선 사용한다.
