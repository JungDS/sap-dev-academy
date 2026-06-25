# CH12 · SELECT-OPTIONS와 Range Table — codex_0625 강의 개선·보강본

> 생성 시각: 2026-06-25-13:22 KST  
> 기준 소스: `content/abap/CH12/_chapter.md` + 해당 챕터 레슨 7개  
> 목적: 원본 `content/abap`을 덮어쓰지 않고, 이후 리빌드/강의자료 작성에 바로 사용할 수 있는 고밀도 보강안을 제공한다.

## 1. 프로젝트 분석 기준

- 학습 대상: 개발·전공 경험 없는 입문자. 설명은 압축하지 않고 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리" 순서로 풀어쓴다.
- R15 게이팅: 이미 배운 것만으로 이해할 수 있어야 한다. 후속 개념은 L1 예고까지만 허용하고, 코드나 정의를 앞당기지 않는다.
- R2 코드=체험: 코드가 1줄이라도 있으면 같은 페이지에서 조작하거나, 최소한 어떤 시뮬레이터/다이어그램/버튼 흐름으로 체험할지 명시한다.
- 참고 우선순위: 로컬 `content/abap`과 `.project-docs`가 NotebookLM보다 최신이다. NotebookLM은 큰 방향 참고로만 사용한다.

## 2. 이 챕터의 강의 목표

단일 입력값의 한계를 넘어 여러 조건을 Range Table로 표현한다.

**반드시 강화할 지점**
- SELECT-OPTIONS가 자동 화면 + Range Table이라는 두 얼굴을 가진다고 설명
- SIGN/OPTION/LOW/HIGH를 한 행씩 해석
- WHERE IN과 Range Table의 연결을 시각화
- Include/Exclude가 섞였을 때 결과가 어떻게 바뀌는지 체험

**대표 체험 설계**
- 조건칩을 추가/제외하면 예매 데이터가 필터링되고 Range 행이 동시에 생성되는 필터 시뮬레이터를 둔다.

**이전/다음 연결**
- 이전: CH11 · SALV 1차 (간단 ALV)
- 다음: CH13 · Open SQL 2차: JOIN·집계

## 3. 원본 진단 요약

| 항목 | 값 |
|---|---:|
| 레슨 수 | 7 |
| 본문 총 글자(공백 제외) | 4636 |
| 코드 블록 | 10 |
| embed 지시문 | 1 |
| 용어 마킹 | 12 |
| 진단 플래그 총합 | 13 |

| 레슨 | 제목 | 본문자 | 코드 | embed | 진단 |
|---|---|---:|---:|---:|---|
| CH12-L01 | Range Table 구조 | 623 | 0 | 0 | 본문빈약 |
| CH12-L02 | SELECT-OPTIONS 기본 문법 | 798 | 2 | 0 | R2-체험누락, 본문빈약 |
| CH12-L03 | WHERE … IN (classic range) | 629 | 4 | 0 | R2-체험누락, 본문빈약 |
| CH12-L04 | Multiple Selection과 Include/Exclude | 482 | 0 | 0 | 본문빈약, 시각/체험없음 |
| CH12-L05 | EQ / BT / CP 옵션 이해 | 584 | 0 | 0 | 본문빈약 |
| CH12-L06 | Selection Table 직접 조작 기초 | 768 | 2 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH12-L07 | 실습 — 공연·상태로 예매 필터 | 752 | 2 | 1 | 본문빈약, 흐름압축 |

## 4. 게이팅·품질 리스크

- CH17까지는 classic-first 구간이다. inline DATA, VALUE, NEW, @ host variable, string template을 새로 끌어오지 않는다. 단 CH04의 && 예외는 허용된다.
- 코드가 있으나 embed가 없는 레슨이 있다. 본문 보강 시 코드 주변에 체험/시뮬레이터 또는 최소한 조작형 퀴즈 설명을 붙여야 한다.
- 본문이 짧은 레슨이 있다. 왜 필요한가, 실수하면 무엇이 깨지는가, 어디서 확인하는가를 별도 섹션으로 늘린다.

## 5. 레슨별 개선·보강안

### CH12-L01 · Range Table 구조

**원본 신호**
- 파일: `content/abap/CH12/CH12-L01.md`
- 방향: 범위·다중 조건을 담는 그릇 — Range Table의 4컬럼(SIGN/OPTION/LOW/HIGH).
- 키워드: Range Table, SIGN, OPTION, LOW, HIGH
- introduces: Range Table, SIGN, OPTION, LOW, HIGH
- prereq: CH06, CH08
- 진단: 본문 623자 · 섹션 4개 · 코드 0개 · embed 0개 · 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Range Table 구조를 제시한다.
- 핵심 설명: 단일 입력값의 한계를 넘어 여러 조건을 Range Table로 표현한다. 이 레슨은 그 큰 흐름 안에서 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수하면 어떻게 보이는가" 순서로 다시 풀어야 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 텍스트만 두지 말고, 개념 관계도 또는 의사결정 표를 넣는다. 버튼형 시뮬레이터가 과하면 "상황 카드 -> 선택 -> 해설" 구조의 미니 퀴즈로 충분하다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Range Table 구조의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapif.htm`
- `C:/ABAP_DOCU_HTML/abapcase.htm`

### CH12-L02 · SELECT-OPTIONS 기본 문법

**원본 신호**
- 파일: `content/abap/CH12/CH12-L02.md`
- 방향: 화면에 범위·다중 입력칸을 만드는 SELECT-OPTIONS.
- 키워드: SELECT-OPTIONS, Range Table, Selection Screen
- introduces: SELECT-OPTIONS, Selection Screen
- prereq: CH12-L01, CH03
- 진단: 본문 798자 · 섹션 4개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 SELECT-OPTIONS 기본 문법를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: SELECT-OPTIONS 기본 문법의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`

### CH12-L03 · WHERE … IN (classic range)

**원본 신호**
- 파일: `content/abap/CH12/CH12-L03.md`
- 방향: Range Table을 조회 조건으로 — classic WHERE … IN.
- 키워드: WHERE, IN, Range Table, Open SQL, classic
- introduces: WHERE IN(classic range)
- prereq: CH12-L01, CH08
- 진단: 본문 629자 · 섹션 4개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 WHERE … IN (classic range)를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: WHERE … IN (classic range)의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapif.htm`
- `C:/ABAP_DOCU_HTML/abapcase.htm`

### CH12-L04 · Multiple Selection과 Include/Exclude

**원본 신호**
- 파일: `content/abap/CH12/CH12-L04.md`
- 방향: 다중 선택 팝업 — 여러 값·범위와 포함/제외(녹색/빨강).
- 키워드: Multiple Selection, Include, Exclude, SIGN
- introduces: Multiple Selection, Include, Exclude
- prereq: CH12-L02
- 진단: 본문 482자 · 섹션 4개 · 코드 0개 · embed 0개 · 본문빈약, 시각/체험없음

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Multiple Selection과 Include/Exclude를 제시한다.
- 핵심 설명: 단일 입력값의 한계를 넘어 여러 조건을 Range Table로 표현한다. 이 레슨은 그 큰 흐름 안에서 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수하면 어떻게 보이는가" 순서로 다시 풀어야 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 텍스트만 두지 말고, 개념 관계도 또는 의사결정 표를 넣는다. 버튼형 시뮬레이터가 과하면 "상황 카드 -> 선택 -> 해설" 구조의 미니 퀴즈로 충분하다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Multiple Selection과 Include/Exclude의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`

### CH12-L05 · EQ / BT / CP 옵션 이해

**원본 신호**
- 파일: `content/abap/CH12/CH12-L05.md`
- 방향: 비교 방식 OPTION 값 — EQ·BT·CP 등.
- 키워드: OPTION, EQ, BT, CP, SIGN
- introduces: OPTION 값(EQ/BT/CP)
- prereq: CH12-L01
- 진단: 본문 584자 · 섹션 4개 · 코드 0개 · embed 0개 · 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 EQ / BT / CP 옵션 이해를 제시한다.
- 핵심 설명: 단일 입력값의 한계를 넘어 여러 조건을 Range Table로 표현한다. 이 레슨은 그 큰 흐름 안에서 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수하면 어떻게 보이는가" 순서로 다시 풀어야 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 텍스트만 두지 말고, 개념 관계도 또는 의사결정 표를 넣는다. 버튼형 시뮬레이터가 과하면 "상황 카드 -> 선택 -> 해설" 구조의 미니 퀴즈로 충분하다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: EQ / BT / CP 옵션 이해의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`

### CH12-L06 · Selection Table 직접 조작 기초

**원본 신호**
- 파일: `content/abap/CH12/CH12-L06.md`
- 방향: Range Table을 코드로 채우기 — 화면 없이 조건 구성.
- 키워드: Range Table, APPEND, SIGN, OPTION
- introduces: TYPE RANGE OF/RANGES, SELECT-OPTIONS vs RANGES
- prereq: CH12-L01, CH06
- 진단: 본문 768자 · 섹션 3개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Selection Table 직접 조작 기초를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Selection Table 직접 조작 기초의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapdata.htm`
- `C:/ABAP_DOCU_HTML/abapdata_simple.htm`
- `C:/ABAP_DOCU_HTML/abapdata_referring.htm`
- `C:/ABAP_DOCU_HTML/abaptypes.htm`
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`

### CH12-L07 · 실습 — 공연·상태로 예매 필터

**원본 신호**
- 파일: `content/abap/CH12/CH12-L07.md`
- 방향: 콘서트앱 4단계 — SELECT-OPTIONS로 필요한 예매만.
- 키워드: 실습, 콘서트앱, SELECT-OPTIONS, 필터
- introduces: 미선언
- prereq: CH12-L02, CH11-L06
- 진단: 본문 752자 · 섹션 3개 · 코드 2개 · embed 1개 · 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 실습 — 공연·상태로 예매 필터를 제시한다.
- 핵심 설명: SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH12-L07-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 실습 — 공연·상태로 예매 필터의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapselect.htm`
- `C:/ABAP_DOCU_HTML/abapselect_join.htm`


## 6. 이 챕터를 감탄나는 자료로 만들기 위한 마무리 체크

- 각 레슨 도입부는 "무엇을 배운다"가 아니라 "지금 무엇이 불편한가"로 시작한다.
- 레슨 끝에는 다음 레슨이 진짜 해결책일 때만 pain -> solution으로 연결한다. 병렬/심화 관계는 억지 불편을 만들지 않는다.
- ABAP 고유 용어는 영어 원문을 살리고 괄호로 쉬운 풀이를 붙인다.
- 코드 예제는 짧은 한 줄 설명, 실행 전 예상, 실행 후 결과 해석, 실패 케이스 순서로 닫는다.
- 공식 문서는 로컬 ABAP_DOCU 파일명으로 재확인하고, 예제는 프로젝트의 관통 예제(구구단, SFLIGHT, 콘서트 예매, 정훈영)를 우선 사용한다.
