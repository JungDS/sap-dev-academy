# CH08 · Open SQL 기본 조회 — codex_0625 강의 개선·보강본

> 생성 시각: 2026-06-25-13:22 KST  
> 기준 소스: `content/abap/CH08/_chapter.md` + 해당 챕터 레슨 7개  
> 목적: 원본 `content/abap`을 덮어쓰지 않고, 이후 리빌드/강의자료 작성에 바로 사용할 수 있는 고밀도 보강안을 제공한다.

## 1. 프로젝트 분석 기준

- 학습 대상: 개발·전공 경험 없는 입문자. 설명은 압축하지 않고 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리" 순서로 풀어쓴다.
- R15 게이팅: 이미 배운 것만으로 이해할 수 있어야 한다. 후속 개념은 L1 예고까지만 허용하고, 코드나 정의를 앞당기지 않는다.
- R2 코드=체험: 코드가 1줄이라도 있으면 같은 페이지에서 조작하거나, 최소한 어떤 시뮬레이터/다이어그램/버튼 흐름으로 체험할지 명시한다.
- 참고 우선순위: 로컬 `content/abap`과 `.project-docs`가 NotebookLM보다 최신이다. NotebookLM은 큰 방향 참고로만 사용한다.

## 2. 이 챕터의 강의 목표

DB에 저장한 데이터를 ABAP 프로그램으로 다시 읽어 온다.

**반드시 강화할 지점**
- SELECT 4요소: 어디서, 무엇을, 어떤 조건으로, 어디에 담는지
- classic Open SQL만 사용하고 modern @ 문법은 금지
- sy-subrc/sy-dbcnt를 결과 판정의 핵심으로 가르침
- ENDSELECT, SELECT SINGLE, INTO TABLE의 비용 차이까지 맛보게 함

**대표 체험 설계**
- Projection/WHERE/대상 변수를 선택하면 결과 행수와 sy-subrc가 바뀌는 SELECT 시뮬레이터를 둔다.

**이전/다음 연결**
- 이전: CH07 · Transparent Table (SE11)
- 다음: CH09 · DDIC 관계와 입력도움말(F4)

## 3. 원본 진단 요약

| 항목 | 값 |
|---|---:|
| 레슨 수 | 7 |
| 본문 총 글자(공백 제외) | 6237 |
| 코드 블록 | 34 |
| embed 지시문 | 1 |
| 용어 마킹 | 7 |
| 진단 플래그 총합 | 13 |

| 레슨 | 제목 | 본문자 | 코드 | embed | 진단 |
|---|---|---:|---:|---:|---|
| CH08-L01 | SAP 데모 테이블과 Client 종속 | 843 | 2 | 0 | R2-체험누락, 본문빈약 |
| CH08-L02 | SELECT 4요소 · `*` vs 필드 | 1108 | 4 | 1 | 본문주의 |
| CH08-L03 | SELECT 형태 — SINGLE · INTO TABLE · UP TO n ROWS | 978 | 8 | 0 | R2-체험누락, 본문주의 |
| CH08-L04 | INTO 대상 형태 | 1014 | 8 | 0 | R2-체험누락, 본문주의 |
| CH08-L05 | WHERE 상세 — 연산자와 wildcard | 818 | 6 | 0 | R2-체험누락, 본문빈약 |
| CH08-L06 | 키 필드 vs 일반 필드 · Index 기초 | 688 | 2 | 0 | R2-체험누락, 본문빈약 |
| CH08-L07 | 조회 실패와 MESSAGE (기초) | 788 | 4 | 0 | R2-체험누락, 본문빈약 |

## 4. 게이팅·품질 리스크

- CH17까지는 classic-first 구간이다. inline DATA, VALUE, NEW, @ host variable, string template을 새로 끌어오지 않는다. 단 CH04의 && 예외는 허용된다.
- 코드가 있으나 embed가 없는 레슨이 있다. 본문 보강 시 코드 주변에 체험/시뮬레이터 또는 최소한 조작형 퀴즈 설명을 붙여야 한다.
- 본문이 짧은 레슨이 있다. 왜 필요한가, 실수하면 무엇이 깨지는가, 어디서 확인하는가를 별도 섹션으로 늘린다.

## 5. 레슨별 개선·보강안

### CH08-L01 · SAP 데모 테이블과 Client 종속

**원본 신호**
- 파일: `content/abap/CH08/CH08-L01.md`
- 방향: 풍부한 연습 데이터 — SCARR·SPFLI·SFLIGHT와 Open SQL의 client 자동 종속.
- 키워드: SCARR, SPFLI, SFLIGHT, Open SQL, MANDT, Client
- introduces: SCARR/SPFLI/SFLIGHT 구조, Open SQL의 client(MANDT) 자동 종속
- prereq: CH07
- 진단: 본문 843자 · 섹션 4개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 SAP 데모 테이블과 Client 종속를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: SAP 데모 테이블과 Client 종속의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`
- `C:/ABAP_DOCU_HTML/abapselect_aggregate.htm`

### CH08-L02 · SELECT 4요소 · `*` vs 필드

**원본 신호**
- 파일: `content/abap/CH08/CH08-L02.md`
- 방향: SELECT의 네 가지 — 어느 테이블·어느 필드·어느 행·어디에 담을지.
- 키워드: SELECT, INTO TABLE, projection, sy-subrc, classic
- introduces: SELECT 4요소, * vs 필드(projection), table~field, sy-subrc / sy-dbcnt
- prereq: CH08-L01, CH06, CH07
- 진단: 본문 1108자 · 섹션 5개 · 코드 4개 · embed 1개 · 본문주의

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 SELECT 4요소 · `*` vs 필드를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH08-L02-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: SELECT 4요소 · `*` vs 필드의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`
- `C:/ABAP_DOCU_HTML/abapselect_aggregate.htm`
- `C:/ABAP_DOCU_HTML/abapmessage.htm`
- `C:/ABAP_DOCU_HTML/abapmessage_msg.htm`
- `C:/ABAP_DOCU_HTML/abaptry.htm`

### CH08-L03 · SELECT 형태 — SINGLE · INTO TABLE · UP TO n ROWS

**원본 신호**
- 파일: `content/abap/CH08/CH08-L03.md`
- 방향: 한 건만, 여러 건, 줄여 읽기 — 결과 형태에 맞는 SELECT.
- 키워드: SELECT SINGLE, INTO TABLE, ENDSELECT, UP TO n ROWS, classic
- introduces: SELECT SINGLE, INTO TABLE(Array Fetch), SELECT…ENDSELECT, UP TO n ROWS
- prereq: CH08-L02
- 진단: 본문 978자 · 섹션 6개 · 코드 8개 · embed 0개 · R2-체험누락, 본문주의

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 SELECT 형태 — SINGLE · INTO TABLE · UP TO n ROWS를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: SELECT 형태 — SINGLE · INTO TABLE · UP TO n ROWS의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`
- `C:/ABAP_DOCU_HTML/abapselect_aggregate.htm`

### CH08-L04 · INTO 대상 형태

**원본 신호**
- 파일: `content/abap/CH08/CH08-L04.md`
- 방향: 결과를 어디에 담나 — Work Area·개별 변수·CORRESPONDING·APPENDING.
- 키워드: INTO, CORRESPONDING FIELDS, APPENDING, Work Area
- introduces: INTO wa, INTO (v1,v2), INTO CORRESPONDING FIELDS OF, APPENDING (TABLE)
- prereq: CH08-L03
- 진단: 본문 1014자 · 섹션 6개 · 코드 8개 · embed 0개 · R2-체험누락, 본문주의

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 INTO 대상 형태를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 메모리 상태 그리드. 변수/구조체/내부 테이블의 값이 실행 단계마다 어떻게 바뀌는지 스냅샷으로 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: INTO 대상 형태의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapdata.htm`
- `C:/ABAP_DOCU_HTML/abapdata_simple.htm`
- `C:/ABAP_DOCU_HTML/abapdata_referring.htm`
- `C:/ABAP_DOCU_HTML/abaptypes.htm`
- `C:/ABAP_DOCU_HTML/abenitab.htm`
- `C:/ABAP_DOCU_HTML/abapappend.htm`

### CH08-L05 · WHERE 상세 — 연산자와 wildcard

**원본 신호**
- 파일: `content/abap/CH08/CH08-L05.md`
- 방향: 조건을 정교하게 — 비교·BETWEEN·LIKE·IN·IS NULL.
- 키워드: WHERE, BETWEEN, LIKE, IN, IS NULL, classic
- introduces: WHERE 연산자(EQ/NE/LT/GT/LE/GE), BETWEEN, LIKE(_ %), IN, IS NULL, AND/OR/NOT
- prereq: CH08-L02
- 진단: 본문 818자 · 섹션 5개 · 코드 6개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 WHERE 상세 — 연산자와 wildcard를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: WHERE 상세 — 연산자와 wildcard의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapdata.htm`
- `C:/ABAP_DOCU_HTML/abapdata_simple.htm`
- `C:/ABAP_DOCU_HTML/abapdata_referring.htm`
- `C:/ABAP_DOCU_HTML/abaptypes.htm`
- `C:/ABAP_DOCU_HTML/abapif.htm`
- `C:/ABAP_DOCU_HTML/abapcase.htm`

### CH08-L06 · 키 필드 vs 일반 필드 · Index 기초

**원본 신호**
- 파일: `content/abap/CH08/CH08-L06.md`
- 방향: 무엇으로 찾느냐가 속도를 가른다 — 키와 인덱스.
- 키워드: Primary Key, Secondary Index, 성능, SELECT
- introduces: 키 검색 vs 일반필드 검색 속도, Secondary Index 개념
- prereq: CH08-L02
- 진단: 본문 688자 · 섹션 4개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 키 필드 vs 일반 필드 · Index 기초를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 키 필드 vs 일반 필드 · Index 기초의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`
- `C:/ABAP_DOCU_HTML/abapselect_aggregate.htm`

### CH08-L07 · 조회 실패와 MESSAGE (기초)

**원본 신호**
- 파일: `content/abap/CH08/CH08-L07.md`
- 방향: 결과가 없을 때 — sy-subrc 분기와 MESSAGE 맛보기.
- 키워드: sy-subrc, MESSAGE, 조회 실패
- introduces: sy-subrc 분기, MESSAGE(S/I 맛보기)
- prereq: CH08-L02
- 진단: 본문 788자 · 섹션 4개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 조회 실패와 MESSAGE (기초)를 제시한다.
- 핵심 설명: 사용자가 실행 버튼을 누르기 전과 후에 어느 이벤트가 끼어드는지 시간표로 가르친다. 메시지는 사용자와 프로그램의 계약으로 다룬다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 이벤트 타임라인. 실행 버튼, 검증 오류, PBO/PAI, MESSAGE 표시 위치를 클릭식으로 추적한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 조회 실패와 MESSAGE (기초)의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`
- `C:/ABAP_DOCU_HTML/abapselect_aggregate.htm`
- `C:/ABAP_DOCU_HTML/abapmessage.htm`
- `C:/ABAP_DOCU_HTML/abapmessage_msg.htm`
- `C:/ABAP_DOCU_HTML/abaptry.htm`


## 6. 이 챕터를 감탄나는 자료로 만들기 위한 마무리 체크

- 각 레슨 도입부는 "무엇을 배운다"가 아니라 "지금 무엇이 불편한가"로 시작한다.
- 레슨 끝에는 다음 레슨이 진짜 해결책일 때만 pain -> solution으로 연결한다. 병렬/심화 관계는 억지 불편을 만들지 않는다.
- ABAP 고유 용어는 영어 원문을 살리고 괄호로 쉬운 풀이를 붙인다.
- 코드 예제는 짧은 한 줄 설명, 실행 전 예상, 실행 후 결과 해석, 실패 케이스 순서로 닫는다.
- 공식 문서는 로컬 ABAP_DOCU 파일명으로 재확인하고, 예제는 프로젝트의 관통 예제(구구단, SFLIGHT, 콘서트 예매, 정훈영)를 우선 사용한다.
