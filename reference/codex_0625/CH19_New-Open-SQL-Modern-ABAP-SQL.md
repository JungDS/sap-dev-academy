# CH19 · New Open SQL / Modern ABAP SQL — codex_0625 강의 개선·보강본

> 생성 시각: 2026-06-25-13:22 KST  
> 기준 소스: `content/abap/CH19/_chapter.md` + 해당 챕터 레슨 8개  
> 목적: 원본 `content/abap`을 덮어쓰지 않고, 이후 리빌드/강의자료 작성에 바로 사용할 수 있는 고밀도 보강안을 제공한다.

## 1. 프로젝트 분석 기준

- 학습 대상: 개발·전공 경험 없는 입문자. 설명은 압축하지 않고 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리" 순서로 풀어쓴다.
- R15 게이팅: 이미 배운 것만으로 이해할 수 있어야 한다. 후속 개념은 L1 예고까지만 허용하고, 코드나 정의를 앞당기지 않는다.
- R2 코드=체험: 코드가 1줄이라도 있으면 같은 페이지에서 조작하거나, 최소한 어떤 시뮬레이터/다이어그램/버튼 흐름으로 체험할지 명시한다.
- 참고 우선순위: 로컬 `content/abap`과 `.project-docs`가 NotebookLM보다 최신이다. NotebookLM은 큰 방향 참고로만 사용한다.

## 2. 이 챕터의 강의 목표

Open SQL도 modern 문법으로 넘어가며 host variable과 SQL expression을 배운다.

**반드시 강화할 지점**
- @ host variable, comma list, @DATA target을 classic과 대비
- SQL expression은 DB에서 계산한다는 위치 감각을 준다
- SELECT FROM @itab은 ABAP 메모리와 SQL 사고의 접점으로 설명
- CH13 classic JOIN 지식을 기반으로 modern SQL을 정리

**대표 체험 설계**
- classic SELECT를 modern SELECT로 변환하며 @, comma, expression이 왜 필요한지 단계별 diff로 보여준다.

**이전/다음 연결**
- 이전: CH18 · Modern ABAP Syntax
- 다음: CH20 · OO ABAP 기본 설계

## 3. 원본 진단 요약

| 항목 | 값 |
|---|---:|
| 레슨 수 | 8 |
| 본문 총 글자(공백 제외) | 4735 |
| 코드 블록 | 24 |
| embed 지시문 | 0 |
| 용어 마킹 | 0 |
| 진단 플래그 총합 | 21 |

| 레슨 | 제목 | 본문자 | 코드 | embed | 진단 |
|---|---|---:|---:|---:|---|
| CH19-L01 | Classic Open SQL과 Modern ABAP SQL 비교 | 733 | 2 | 0 | R2-체험누락, 본문빈약 |
| CH19-L02 | @ Host Variable과 Host Expression | 475 | 4 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH19-L03 | INTO TABLE @DATA(...) Inline Target | 589 | 4 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH19-L04 | SQL Expression — CASE / CAST / COALESCE | 618 | 4 | 0 | R2-체험누락, 본문빈약 |
| CH19-L05 | SQL String / Date Function | 586 | 4 | 0 | R2-체험누락, 본문빈약 |
| CH19-L06 | SELECT FROM @itab 기초 | 453 | 2 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH19-L07 | ABAP SQL 정리 — 다음 단계로 | 540 | 0 | 0 | 본문빈약, 흐름압축, 시각/체험없음 |
| CH19-L08 | 실습 — 콘서트앱 모던 SQL | 741 | 4 | 0 | R2-체험누락, 본문빈약, 흐름압축 |

## 4. 게이팅·품질 리스크

- New Open SQL 첫 도입 장이다. CH08/13의 classic SELECT/JOIN 개념을 먼저 회수해야 한다.
- 코드가 있으나 embed가 없는 레슨이 있다. 본문 보강 시 코드 주변에 체험/시뮬레이터 또는 최소한 조작형 퀴즈 설명을 붙여야 한다.
- 본문이 짧은 레슨이 있다. 왜 필요한가, 실수하면 무엇이 깨지는가, 어디서 확인하는가를 별도 섹션으로 늘린다.

## 5. 레슨별 개선·보강안

### CH19-L01 · Classic Open SQL과 Modern ABAP SQL 비교

**원본 신호**
- 파일: `content/abap/CH19/CH19-L01.md`
- 방향: 같은 조회를 classic과 modern으로 — 무엇이 달라졌나.
- 키워드: Open SQL, ABAP SQL, modern, 콤마
- introduces: Modern ABAP SQL 개요, 콤마 필드 구분, strict 모드
- prereq: CH13, CH18
- 진단: 본문 733자 · 섹션 4개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Classic Open SQL과 Modern ABAP SQL 비교를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Classic Open SQL과 Modern ABAP SQL 비교의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`
- `C:/ABAP_DOCU_HTML/abapselect_aggregate.htm`

### CH19-L02 · @ Host Variable과 Host Expression

**원본 신호**
- 파일: `content/abap/CH19/CH19-L02.md`
- 방향: ABAP 값을 SQL에 안전하게 넣는다 — @변수와 @( 식 ).
- 키워드: @, Host Variable, Host Expression
- introduces: @ Host Variable, @( ) Host Expression
- prereq: CH19-L01
- 진단: 본문 475자 · 섹션 3개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 @ Host Variable과 Host Expression를 제시한다.
- 핵심 설명: 값, 타입, 이름, 재사용 범위를 각각 다른 색 카드로 분리한다. 초보자가 "변수명=값"과 "타입=규칙"을 섞지 않게 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 코드 실행 스텝퍼. 한 줄씩 실행하면서 입력값, 중간값, 출력값을 나란히 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: @ Host Variable과 Host Expression의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapdata.htm`
- `C:/ABAP_DOCU_HTML/abapdata_simple.htm`
- `C:/ABAP_DOCU_HTML/abapdata_referring.htm`
- `C:/ABAP_DOCU_HTML/abaptypes.htm`
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`

### CH19-L03 · INTO TABLE @DATA(...) Inline Target

**원본 신호**
- 파일: `content/abap/CH19/CH19-L03.md`
- 방향: 결과 테이블을 SELECT 자리에서 바로 선언한다.
- 키워드: @DATA, inline, INTO TABLE
- introduces: INTO TABLE @DATA( ), INTO @DATA( )
- prereq: CH19-L02, CH18
- 진단: 본문 589자 · 섹션 2개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 INTO TABLE @DATA(...) Inline Target를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 메모리 상태 그리드. 변수/구조체/내부 테이블의 값이 실행 단계마다 어떻게 바뀌는지 스냅샷으로 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: INTO TABLE @DATA(...) Inline Target의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapdata.htm`
- `C:/ABAP_DOCU_HTML/abapdata_simple.htm`
- `C:/ABAP_DOCU_HTML/abapdata_referring.htm`
- `C:/ABAP_DOCU_HTML/abaptypes.htm`
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`

### CH19-L04 · SQL Expression — CASE / CAST / COALESCE

**원본 신호**
- 파일: `content/abap/CH19/CH19-L04.md`
- 방향: SELECT 안에서 값을 계산·변환·치환한다.
- 키워드: SQL Expression, CASE, CAST, COALESCE
- introduces: SQL 산술/CASE, CAST, COALESCE
- prereq: CH19-L01
- 진단: 본문 618자 · 섹션 4개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 SQL Expression — CASE / CAST / COALESCE를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: SQL Expression — CASE / CAST / COALESCE의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapif.htm`
- `C:/ABAP_DOCU_HTML/abapcase.htm`
- `C:/ABAP_DOCU_HTML/abapdo.htm`
- `C:/ABAP_DOCU_HTML/abapwhile.htm`
- `C:/ABAP_DOCU_HTML/abaploop_at_itab.htm`
- `C:/ABAP_DOCU_HTML/abapselect.htm`

### CH19-L05 · SQL String / Date Function

**원본 신호**
- 파일: `content/abap/CH19/CH19-L05.md`
- 방향: SELECT 안에서 문자열·날짜를 다루는 SQL 함수.
- 키워드: SQL Function, CONCAT, SUBSTRING, DATS_ADD_DAYS
- introduces: SQL 문자열 함수, SQL 날짜 함수
- prereq: CH19-L04
- 진단: 본문 586자 · 섹션 4개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 SQL String / Date Function를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: SQL String / Date Function의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`
- `C:/ABAP_DOCU_HTML/abapselect_aggregate.htm`

### CH19-L06 · SELECT FROM @itab 기초

**원본 신호**
- 파일: `content/abap/CH19/CH19-L06.md`
- 방향: 내부 테이블을 SQL 소스처럼 조회한다.
- 키워드: SELECT FROM @itab, Internal Table, SQL
- introduces: SELECT FROM @itab
- prereq: CH19-L03, CH06
- 진단: 본문 453자 · 섹션 3개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 SELECT FROM @itab 기초를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: SELECT FROM @itab 기초의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abenitab.htm`
- `C:/ABAP_DOCU_HTML/abapappend.htm`
- `C:/ABAP_DOCU_HTML/abapread_table.htm`
- `C:/ABAP_DOCU_HTML/abaploop_at_itab.htm`
- `C:/ABAP_DOCU_HTML/abapcollect.htm`
- `C:/ABAP_DOCU_HTML/abapselect.htm`

### CH19-L07 · ABAP SQL 정리 — 다음 단계로

**원본 신호**
- 파일: `content/abap/CH19/CH19-L07.md`
- 방향: 모던 ABAP SQL을 정리하고, 코드 구조의 OO로 넘어간다.
- 키워드: ABAP SQL, 정리, CDS, OO
- introduces: 미선언
- prereq: CH19-L01
- 진단: 본문 540자 · 섹션 3개 · 코드 0개 · embed 0개 · 본문빈약, 흐름압축, 시각/체험없음

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 ABAP SQL 정리 — 다음 단계로를 제시한다.
- 핵심 설명: 데이터 조회 코드가 의미 있는 데이터 모델로 올라가는 과정이다. Interface View와 Projection View의 관객이 다르다는 점을 반복한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 텍스트만 두지 말고, 개념 관계도 또는 의사결정 표를 넣는다. 버튼형 시뮬레이터가 과하면 "상황 카드 -> 선택 -> 해설" 구조의 미니 퀴즈로 충분하다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: ABAP SQL 정리 — 다음 단계로의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`
- `C:/ABAP_DOCU_HTML/abapselect_aggregate.htm`

### CH19-L08 · 실습 — 콘서트앱 모던 SQL

**원본 신호**
- 파일: `content/abap/CH19/CH19-L08.md`
- 방향: 콘서트앱 — 조회를 @·콤마·@DATA로 현대화.
- 키워드: 실습, 콘서트앱, 모던SQL, @DATA
- introduces: 미선언
- prereq: CH19-L01, CH19-L03, CH13-L08
- 진단: 본문 741자 · 섹션 3개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 실습 — 콘서트앱 모던 SQL를 제시한다.
- 핵심 설명: 값, 타입, 이름, 재사용 범위를 각각 다른 색 카드로 분리한다. 초보자가 "변수명=값"과 "타입=규칙"을 섞지 않게 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 실습 — 콘서트앱 모던 SQL의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapdata.htm`
- `C:/ABAP_DOCU_HTML/abapdata_simple.htm`
- `C:/ABAP_DOCU_HTML/abapdata_referring.htm`
- `C:/ABAP_DOCU_HTML/abaptypes.htm`
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`


## 6. 이 챕터를 감탄나는 자료로 만들기 위한 마무리 체크

- 각 레슨 도입부는 "무엇을 배운다"가 아니라 "지금 무엇이 불편한가"로 시작한다.
- 레슨 끝에는 다음 레슨이 진짜 해결책일 때만 pain -> solution으로 연결한다. 병렬/심화 관계는 억지 불편을 만들지 않는다.
- ABAP 고유 용어는 영어 원문을 살리고 괄호로 쉬운 풀이를 붙인다.
- 코드 예제는 짧은 한 줄 설명, 실행 전 예상, 실행 후 결과 해석, 실패 케이스 순서로 닫는다.
- 공식 문서는 로컬 ABAP_DOCU 파일명으로 재확인하고, 예제는 프로젝트의 관통 예제(구구단, SFLIGHT, 콘서트 예매, 정훈영)를 우선 사용한다.
