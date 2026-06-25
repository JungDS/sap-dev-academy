# CH06 · Internal Table — codex_0625 강의 개선·보강본

> 생성 시각: 2026-06-25-13:22 KST  
> 기준 소스: `content/abap/CH06/_chapter.md` + 해당 챕터 레슨 6개  
> 목적: 원본 `content/abap`을 덮어쓰지 않고, 이후 리빌드/강의자료 작성에 바로 사용할 수 있는 고밀도 보강안을 제공한다.

## 1. 프로젝트 분석 기준

- 학습 대상: 개발·전공 경험 없는 입문자. 설명은 압축하지 않고 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리" 순서로 풀어쓴다.
- R15 게이팅: 이미 배운 것만으로 이해할 수 있어야 한다. 후속 개념은 L1 예고까지만 허용하고, 코드나 정의를 앞당기지 않는다.
- R2 코드=체험: 코드가 1줄이라도 있으면 같은 페이지에서 조작하거나, 최소한 어떤 시뮬레이터/다이어그램/버튼 흐름으로 체험할지 명시한다.
- 참고 우선순위: 로컬 `content/abap`과 `.project-docs`가 NotebookLM보다 최신이다. NotebookLM은 큰 방향 참고로만 사용한다.

## 2. 이 챕터의 강의 목표

한 행만 담던 Structure의 한계를 넘어 여러 행을 메모리에 다룬다.

**반드시 강화할 지점**
- Line Type, Table Kind, Key를 세 축으로 반복 설명
- STANDARD/SORTED/HASHED 선택 기준을 검색/정렬/중복 허용으로 비교
- READ/LOOP/MODIFY/DELETE는 sy-subrc와 sy-tabix까지 함께 설명
- Header Line, REFRESH 같은 옛 문법은 인식용으로만 다룸

**대표 체험 설계**
- APPEND로 lt_gugu가 1행에서 81행으로 커지고 SORT/READ/DELETE 결과가 바뀌는 상태 그리드를 쓴다.

**이전/다음 연결**
- 이전: CH05 · Structure (Local · DDIC)
- 다음: CH07 · Transparent Table (SE11)

## 3. 원본 진단 요약

| 항목 | 값 |
|---|---:|
| 레슨 수 | 6 |
| 본문 총 글자(공백 제외) | 7454 |
| 코드 블록 | 44 |
| embed 지시문 | 1 |
| 용어 마킹 | 7 |
| 진단 플래그 총합 | 7 |

| 레슨 | 제목 | 본문자 | 코드 | embed | 진단 |
|---|---|---:|---:|---:|---|
| CH06-L01 | Internal Table 기초 | 1310 | 6 | 0 | R2-체험누락 |
| CH06-L02 | 내부 테이블의 3속성 · 테이블 종류 | 1389 | 8 | 0 | R2-체험누락 |
| CH06-L03 | 단일 행 제어 | 1600 | 10 | 0 | R2-체험누락 |
| CH06-L04 | 다중 행 제어 | 1662 | 14 | 0 | R2-체험누락 |
| CH06-L05 | Deep Structure 개념 | 599 | 2 | 0 | R2-체험누락, 본문빈약 |
| CH06-L06 | 구구단 전체 = Internal Table (캡스톤) | 894 | 4 | 1 | 본문빈약 |

## 4. 게이팅·품질 리스크

- CH17까지는 classic-first 구간이다. inline DATA, VALUE, NEW, @ host variable, string template을 새로 끌어오지 않는다. 단 CH04의 && 예외는 허용된다.
- 코드가 있으나 embed가 없는 레슨이 있다. 본문 보강 시 코드 주변에 체험/시뮬레이터 또는 최소한 조작형 퀴즈 설명을 붙여야 한다.
- 본문이 짧은 레슨이 있다. 왜 필요한가, 실수하면 무엇이 깨지는가, 어디서 확인하는가를 별도 섹션으로 늘린다.

## 5. 레슨별 개선·보강안

### CH06-L01 · Internal Table 기초

**원본 신호**
- 파일: `content/abap/CH06/CH06-L01.md`
- 방향: 같은 모양의 행을 여러 개 — 내부 테이블 선언과 행 추가.
- 키워드: Internal Table, TYPE TABLE OF, APPEND, Work Area
- introduces: Internal Table, TYPE TABLE OF, APPEND, Work Area, CLEAR/REFRESH/FREE, Header Line(인식용)
- prereq: CH05
- 진단: 본문 1310자 · 섹션 5개 · 코드 6개 · embed 0개 · R2-체험누락

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Internal Table 기초를 제시한다.
- 핵심 설명: 값, 타입, 이름, 재사용 범위를 각각 다른 색 카드로 분리한다. 초보자가 "변수명=값"과 "타입=규칙"을 섞지 않게 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 메모리 상태 그리드. 변수/구조체/내부 테이블의 값이 실행 단계마다 어떻게 바뀌는지 스냅샷으로 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Internal Table 기초의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapdata.htm`
- `C:/ABAP_DOCU_HTML/abapdata_simple.htm`
- `C:/ABAP_DOCU_HTML/abapdata_referring.htm`
- `C:/ABAP_DOCU_HTML/abaptypes.htm`
- `C:/ABAP_DOCU_HTML/abenitab.htm`
- `C:/ABAP_DOCU_HTML/abapappend.htm`

### CH06-L02 · 내부 테이블의 3속성 · 테이블 종류

**원본 신호**
- 파일: `content/abap/CH06/CH06-L02.md`
- 방향: 내부 테이블을 정의하는 세 가지 — 행 모양·키·종류.
- 키워드: Line Type, Primary Key, Table Kind, STANDARD, SORTED, HASHED
- introduces: Line Type, Primary Key, Table Kind, STANDARD/SORTED/HASHED, Index Table, Local/Global Table Type
- prereq: CH06-L01, CH03
- 진단: 본문 1389자 · 섹션 6개 · 코드 8개 · embed 0개 · R2-체험누락

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 내부 테이블의 3속성 · 테이블 종류를 제시한다.
- 핵심 설명: 값, 타입, 이름, 재사용 범위를 각각 다른 색 카드로 분리한다. 초보자가 "변수명=값"과 "타입=규칙"을 섞지 않게 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 메모리 상태 그리드. 변수/구조체/내부 테이블의 값이 실행 단계마다 어떻게 바뀌는지 스냅샷으로 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 내부 테이블의 3속성 · 테이블 종류의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapdata.htm`
- `C:/ABAP_DOCU_HTML/abapdata_simple.htm`
- `C:/ABAP_DOCU_HTML/abapdata_referring.htm`
- `C:/ABAP_DOCU_HTML/abaptypes.htm`
- `C:/ABAP_DOCU_HTML/abenitab.htm`
- `C:/ABAP_DOCU_HTML/abapappend.htm`

### CH06-L03 · 단일 행 제어

**원본 신호**
- 파일: `content/abap/CH06/CH06-L03.md`
- 방향: 한 행을 콕 집어 넣고, 찾고, 고치고, 지운다.
- 키워드: INSERT, READ TABLE, BINARY SEARCH, MODIFY, DELETE, sy-subrc
- introduces: INSERT vs INSERT INTO TABLE, READ TABLE WITH KEY vs WITH TABLE KEY, BINARY SEARCH, MODIFY / MODIFY TABLE, TRANSPORTING, DELETE, sy-subrc
- prereq: CH06-L02
- 진단: 본문 1600자 · 섹션 5개 · 코드 10개 · embed 0개 · R2-체험누락

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 단일 행 제어를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 메모리 상태 그리드. 변수/구조체/내부 테이블의 값이 실행 단계마다 어떻게 바뀌는지 스냅샷으로 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 단일 행 제어의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abenitab.htm`
- `C:/ABAP_DOCU_HTML/abapappend.htm`

### CH06-L04 · 다중 행 제어

**원본 신호**
- 파일: `content/abap/CH06/CH06-L04.md`
- 방향: 여러 행을 한꺼번에 — 순회·집계·중복 제거·그룹 처리.
- 키워드: LOOP, sy-tabix, ASSIGNING, COLLECT, AT NEW, DELETE ADJACENT DUPLICATES
- introduces: LOOP (FROM/TO·WHERE), sy-tabix, LOOP ASSIGNING <fs>(Field Symbol 기초), COLLECT, DELETE ADJACENT DUPLICATES, 컨트롤레벨(AT FIRST/LAST·AT NEW/END OF·SUM), DESCRIBE, APPEND/INSERT LINES OF
- prereq: CH06-L01
- 진단: 본문 1662자 · 섹션 6개 · 코드 14개 · embed 0개 · R2-체험누락

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 다중 행 제어를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 다중 행 제어의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapif.htm`
- `C:/ABAP_DOCU_HTML/abapcase.htm`
- `C:/ABAP_DOCU_HTML/abapdo.htm`
- `C:/ABAP_DOCU_HTML/abapwhile.htm`
- `C:/ABAP_DOCU_HTML/abaploop_at_itab.htm`
- `C:/ABAP_DOCU_HTML/abenitab.htm`

### CH06-L05 · Deep Structure 개념

**원본 신호**
- 파일: `content/abap/CH06/CH06-L05.md`
- 방향: 구조 안에 내부 테이블/문자열이 든 'Deep' 구조 — 개념 소개.
- 키워드: Deep Structure, 중첩, Internal Table
- introduces: Deep Structure, 중첩 테이블
- prereq: CH06-L01, CH05
- 진단: 본문 599자 · 섹션 4개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Deep Structure 개념를 제시한다.
- 핵심 설명: 실행 전 예측 -> 한 줄 실행 -> 변수 변화 확인 -> 왜 그렇게 됐는지 설명하는 디버거 루프를 고정한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 메모리 상태 그리드. 변수/구조체/내부 테이블의 값이 실행 단계마다 어떻게 바뀌는지 스냅샷으로 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Deep Structure 개념의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abenitab.htm`
- `C:/ABAP_DOCU_HTML/abapappend.htm`
- `C:/ABAP_DOCU_HTML/abapread_table.htm`
- `C:/ABAP_DOCU_HTML/abaploop_at_itab.htm`
- `C:/ABAP_DOCU_HTML/abapcollect.htm`

### CH06-L06 · 구구단 전체 = Internal Table (캡스톤)

**원본 신호**
- 파일: `content/abap/CH06/CH06-L06.md`
- 방향: 구구단 81줄을 내부 테이블에 쌓아 정렬·출력한다.
- 키워드: 구구단, Internal Table, APPEND, LOOP, SORT, 캡스톤
- introduces: 미선언
- prereq: CH06-L01, CH06-L04
- 진단: 본문 894자 · 섹션 5개 · 코드 4개 · embed 1개 · 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 구구단 전체 = Internal Table (캡스톤)를 제시한다.
- 핵심 설명: 행이 늘고 줄고 정렬되는 상태 변화를 눈으로 보여준다. 문법보다 "몇 행이 있고 어떤 키로 찾는가"를 먼저 묻는다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH06-L06-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 구구단 전체 = Internal Table (캡스톤)의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapwrite-.htm`
- `C:/ABAP_DOCU_HTML/abapwrite_to.htm`
- `C:/ABAP_DOCU_HTML/abenwrite_formats.htm`
- `C:/ABAP_DOCU_HTML/abapif.htm`
- `C:/ABAP_DOCU_HTML/abapcase.htm`
- `C:/ABAP_DOCU_HTML/abapdo.htm`


## 6. 이 챕터를 감탄나는 자료로 만들기 위한 마무리 체크

- 각 레슨 도입부는 "무엇을 배운다"가 아니라 "지금 무엇이 불편한가"로 시작한다.
- 레슨 끝에는 다음 레슨이 진짜 해결책일 때만 pain -> solution으로 연결한다. 병렬/심화 관계는 억지 불편을 만들지 않는다.
- ABAP 고유 용어는 영어 원문을 살리고 괄호로 쉬운 풀이를 붙인다.
- 코드 예제는 짧은 한 줄 설명, 실행 전 예상, 실행 후 결과 해석, 실패 케이스 순서로 닫는다.
- 공식 문서는 로컬 ABAP_DOCU 파일명으로 재확인하고, 예제는 프로젝트의 관통 예제(구구단, SFLIGHT, 콘서트 예매, 정훈영)를 우선 사용한다.
