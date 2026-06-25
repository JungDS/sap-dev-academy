# CH20 · OO ABAP 기본 설계 — codex_0625 강의 개선·보강본

> 생성 시각: 2026-06-25-13:22 KST  
> 기준 소스: `content/abap/CH20/_chapter.md` + 해당 챕터 레슨 10개  
> 목적: 원본 `content/abap`을 덮어쓰지 않고, 이후 리빌드/강의자료 작성에 바로 사용할 수 있는 고밀도 보강안을 제공한다.

## 1. 프로젝트 분석 기준

- 학습 대상: 개발·전공 경험 없는 입문자. 설명은 압축하지 않고 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리" 순서로 풀어쓴다.
- R15 게이팅: 이미 배운 것만으로 이해할 수 있어야 한다. 후속 개념은 L1 예고까지만 허용하고, 코드나 정의를 앞당기지 않는다.
- R2 코드=체험: 코드가 1줄이라도 있으면 같은 페이지에서 조작하거나, 최소한 어떤 시뮬레이터/다이어그램/버튼 흐름으로 체험할지 명시한다.
- 참고 우선순위: 로컬 `content/abap`과 `.project-docs`가 NotebookLM보다 최신이다. NotebookLM은 큰 방향 참고로만 사용한다.

## 2. 이 챕터의 강의 목표

절차를 넘어 책임을 가진 객체로 설계하기 시작한다.

**반드시 강화할 지점**
- Class/Object/Reference를 설계도-실물-리모컨 비유로 분리
- Visibility, Constructor, Static/Instance를 업무 책임으로 설명
- Exception과 OO Event는 RAP/ALV 이벤트의 기반으로 연결
- CAST와 polymorphism은 쓰임새가 보일 때만 확장

**대표 체험 설계**
- ZCL_BOOKING_MANAGER 클래스 다이어그램에서 public method와 private attribute가 어떻게 협력하는지 보여준다.

**이전/다음 연결**
- 이전: CH19 · New Open SQL / Modern ABAP SQL
- 다음: CH21 · SALV/Grid ALV 표시 제어 심화

## 3. 원본 진단 요약

| 항목 | 값 |
|---|---:|
| 레슨 수 | 10 |
| 본문 총 글자(공백 제외) | 7670 |
| 코드 블록 | 38 |
| embed 지시문 | 3 |
| 용어 마킹 | 10 |
| 진단 플래그 총합 | 21 |

| 레슨 | 제목 | 본문자 | 코드 | embed | 진단 |
|---|---|---:|---:|---:|---|
| CH20-L01 | Global Class 생성과 객체 | 906 | 6 | 1 | 본문주의 |
| CH20-L02 | Attribute / Method / Visibility | 679 | 2 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH20-L03 | Constructor와 객체 초기화 | 701 | 4 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH20-L04 | Static Method와 Instance Method | 592 | 4 | 0 | R2-체험누락, 본문빈약 |
| CH20-L05 | Interface 기본 설계 | 614 | 4 | 0 | R2-체험누락, 본문빈약, 흐름압축 |
| CH20-L06 | Exception Class — TRY / CATCH / CX 계층 | 755 | 4 | 0 | R2-체험누락, 본문빈약 |
| CH20-L07 | Inheritance / Redefinition | 652 | 2 | 1 | 본문빈약, 흐름압축 |
| CH20-L08 | 다형성 — CAST와 CASE TYPE OF | 651 | 4 | 0 | R2-체험누락, 본문빈약 |
| CH20-L09 | OO 이벤트 — EVENTS / RAISE EVENT / SET HANDLER | 738 | 4 | 0 | R2-체험누락, 본문빈약 |
| CH20-L10 | 실습 — ZCL_BOOKING_MANAGER 클래스 | 1382 | 4 | 1 | 흐름압축 |

## 4. 게이팅·품질 리스크

- 코드가 있으나 embed가 없는 레슨이 있다. 본문 보강 시 코드 주변에 체험/시뮬레이터 또는 최소한 조작형 퀴즈 설명을 붙여야 한다.
- 본문이 짧은 레슨이 있다. 왜 필요한가, 실수하면 무엇이 깨지는가, 어디서 확인하는가를 별도 섹션으로 늘린다.

## 5. 레슨별 개선·보강안

### CH20-L01 · Global Class 생성과 객체

**원본 신호**
- 파일: `content/abap/CH20/CH20-L01.md`
- 방향: SE24로 전역 클래스를 만들고 객체를 생성한다.
- 키워드: Global Class, SE24, NEW, 객체
- introduces: Global Class(SE24), DEFINITION/IMPLEMENTATION, 객체 생성(NEW/CREATE OBJECT)
- prereq: CH10, CH18
- 진단: 본문 906자 · 섹션 4개 · 코드 6개 · embed 1개 · 본문주의

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Global Class 생성과 객체를 제시한다.
- 핵심 설명: 객체는 문법 묶음이 아니라 책임 묶음이다. 속성은 상태, 메서드는 행동, visibility는 약속으로 풀어 설명한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH20-L01-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Global Class 생성과 객체의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapclass.htm`
- `C:/ABAP_DOCU_HTML/abapmethods.htm`
- `C:/ABAP_DOCU_HTML/abapcall_method_static.htm`
- `C:/ABAP_DOCU_HTML/abapinterface.htm`
- `C:/ABAP_DOCU_HTML/abapevents.htm`

### CH20-L02 · Attribute / Method / Visibility

**원본 신호**
- 파일: `content/abap/CH20/CH20-L02.md`
- 방향: 클래스가 가진 데이터와 행동, 그리고 공개 범위.
- 키워드: Attribute, Method, PUBLIC, PROTECTED, PRIVATE
- introduces: Instance/Static Attribute, Visibility(PUBLIC/PROTECTED/PRIVATE)
- prereq: CH20-L01
- 진단: 본문 679자 · 섹션 3개 · 코드 2개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Attribute / Method / Visibility를 제시한다.
- 핵심 설명: 객체는 문법 묶음이 아니라 책임 묶음이다. 속성은 상태, 메서드는 행동, visibility는 약속으로 풀어 설명한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 책임/객체 다이어그램. 파일 또는 클래스별 책임을 카드로 분리하고 호출 흐름을 화살표로 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Attribute / Method / Visibility의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapclass.htm`
- `C:/ABAP_DOCU_HTML/abapmethods.htm`
- `C:/ABAP_DOCU_HTML/abapcall_method_static.htm`
- `C:/ABAP_DOCU_HTML/abapinterface.htm`
- `C:/ABAP_DOCU_HTML/abapevents.htm`

### CH20-L03 · Constructor와 객체 초기화

**원본 신호**
- 파일: `content/abap/CH20/CH20-L03.md`
- 방향: 객체가 태어날 때 자동 실행되는 생성자.
- 키워드: CONSTRUCTOR, CLASS_CONSTRUCTOR, 초기화
- introduces: CONSTRUCTOR, CLASS_CONSTRUCTOR
- prereq: CH20-L02
- 진단: 본문 701자 · 섹션 3개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Constructor와 객체 초기화를 제시한다.
- 핵심 설명: 객체는 문법 묶음이 아니라 책임 묶음이다. 속성은 상태, 메서드는 행동, visibility는 약속으로 풀어 설명한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 책임/객체 다이어그램. 파일 또는 클래스별 책임을 카드로 분리하고 호출 흐름을 화살표로 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Constructor와 객체 초기화의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapclass.htm`
- `C:/ABAP_DOCU_HTML/abapmethods.htm`
- `C:/ABAP_DOCU_HTML/abapcall_method_static.htm`
- `C:/ABAP_DOCU_HTML/abapinterface.htm`
- `C:/ABAP_DOCU_HTML/abapevents.htm`

### CH20-L04 · Static Method와 Instance Method

**원본 신호**
- 파일: `content/abap/CH20/CH20-L04.md`
- 방향: 클래스로 직접(=>) vs 객체로(->) — 두 호출 방식.
- 키워드: Static, Instance, =>, ->, me
- introduces: Static vs Instance 멤버, me->
- prereq: CH20-L02
- 진단: 본문 592자 · 섹션 4개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Static Method와 Instance Method를 제시한다.
- 핵심 설명: 객체는 문법 묶음이 아니라 책임 묶음이다. 속성은 상태, 메서드는 행동, visibility는 약속으로 풀어 설명한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 책임/객체 다이어그램. 파일 또는 클래스별 책임을 카드로 분리하고 호출 흐름을 화살표로 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Static Method와 Instance Method의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapclass.htm`
- `C:/ABAP_DOCU_HTML/abapmethods.htm`
- `C:/ABAP_DOCU_HTML/abapcall_method_static.htm`
- `C:/ABAP_DOCU_HTML/abapinterface.htm`
- `C:/ABAP_DOCU_HTML/abapevents.htm`

### CH20-L05 · Interface 기본 설계

**원본 신호**
- 파일: `content/abap/CH20/CH20-L05.md`
- 방향: 여러 클래스가 같은 규약을 따르게 한다 — Interface.
- 키워드: Interface, INTERFACES, 다형성
- introduces: INTERFACE 정의, INTERFACES 구현
- prereq: CH20-L02
- 진단: 본문 614자 · 섹션 3개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Interface 기본 설계를 제시한다.
- 핵심 설명: 객체는 문법 묶음이 아니라 책임 묶음이다. 속성은 상태, 메서드는 행동, visibility는 약속으로 풀어 설명한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 코드 실행 스텝퍼. 한 줄씩 실행하면서 입력값, 중간값, 출력값을 나란히 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Interface 기본 설계의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapclass.htm`
- `C:/ABAP_DOCU_HTML/abapmethods.htm`
- `C:/ABAP_DOCU_HTML/abapcall_method_static.htm`
- `C:/ABAP_DOCU_HTML/abapinterface.htm`
- `C:/ABAP_DOCU_HTML/abapevents.htm`

### CH20-L06 · Exception Class — TRY / CATCH / CX 계층

**원본 신호**
- 파일: `content/abap/CH20/CH20-L06.md`
- 방향: 오류를 객체로 다룬다 — 예외 클래스와 TRY/CATCH.
- 키워드: Exception, TRY/CATCH, RAISE EXCEPTION, CX_ROOT
- introduces: TRY/CATCH/CLEANUP, RAISE EXCEPTION, CX 계층, RESUME
- prereq: CH20-L01
- 진단: 본문 755자 · 섹션 5개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Exception Class — TRY / CATCH / CX 계층를 제시한다.
- 핵심 설명: 객체는 문법 묶음이 아니라 책임 묶음이다. 속성은 상태, 메서드는 행동, visibility는 약속으로 풀어 설명한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 책임/객체 다이어그램. 파일 또는 클래스별 책임을 카드로 분리하고 호출 흐름을 화살표로 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Exception Class — TRY / CATCH / CX 계층의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapmessage.htm`
- `C:/ABAP_DOCU_HTML/abapmessage_msg.htm`
- `C:/ABAP_DOCU_HTML/abaptry.htm`
- `C:/ABAP_DOCU_HTML/abapraise_exception.htm`
- `C:/ABAP_DOCU_HTML/abapclass.htm`
- `C:/ABAP_DOCU_HTML/abapmethods.htm`

### CH20-L07 · Inheritance / Redefinition

**원본 신호**
- 파일: `content/abap/CH20/CH20-L07.md`
- 방향: 기존 클래스를 물려받아 확장·재정의한다.
- 키워드: Inheritance, INHERITING FROM, REDEFINITION, super
- introduces: INHERITING FROM, REDEFINITION, super->, ABSTRACT/FINAL
- prereq: CH20-L02
- 진단: 본문 652자 · 섹션 3개 · 코드 2개 · embed 1개 · 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Inheritance / Redefinition를 제시한다.
- 핵심 설명: 객체는 문법 묶음이 아니라 책임 묶음이다. 속성은 상태, 메서드는 행동, visibility는 약속으로 풀어 설명한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH20-L07-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Inheritance / Redefinition의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapclass.htm`
- `C:/ABAP_DOCU_HTML/abapmethods.htm`
- `C:/ABAP_DOCU_HTML/abapcall_method_static.htm`
- `C:/ABAP_DOCU_HTML/abapinterface.htm`
- `C:/ABAP_DOCU_HTML/abapevents.htm`

### CH20-L08 · 다형성 — CAST와 CASE TYPE OF

**원본 신호**
- 파일: `content/abap/CH20/CH20-L08.md`
- 방향: 부모 타입에 담긴 객체를 실제 타입으로 다룬다.
- 키워드: CAST, CASE TYPE OF, 다형성, ?=
- introduces: CAST( ), ?=, CASE TYPE OF
- prereq: CH20-L05, CH20-L07
- 진단: 본문 651자 · 섹션 4개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 다형성 — CAST와 CASE TYPE OF를 제시한다.
- 핵심 설명: 값, 타입, 이름, 재사용 범위를 각각 다른 색 카드로 분리한다. 초보자가 "변수명=값"과 "타입=규칙"을 섞지 않게 한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 메모리 상태 그리드. 변수/구조체/내부 테이블의 값이 실행 단계마다 어떻게 바뀌는지 스냅샷으로 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 다형성 — CAST와 CASE TYPE OF의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapdata.htm`
- `C:/ABAP_DOCU_HTML/abapdata_simple.htm`
- `C:/ABAP_DOCU_HTML/abapdata_referring.htm`
- `C:/ABAP_DOCU_HTML/abaptypes.htm`
- `C:/ABAP_DOCU_HTML/abapif.htm`
- `C:/ABAP_DOCU_HTML/abapcase.htm`

### CH20-L09 · OO 이벤트 — EVENTS / RAISE EVENT / SET HANDLER

**원본 신호**
- 파일: `content/abap/CH20/CH20-L09.md`
- 방향: 객체가 사건을 알리고, 다른 객체가 반응한다.
- 키워드: EVENTS, RAISE EVENT, SET HANDLER, 이벤트
- introduces: EVENTS, RAISE EVENT, SET HANDLER
- prereq: CH20-L02
- 진단: 본문 738자 · 섹션 4개 · 코드 4개 · embed 0개 · R2-체험누락, 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 OO 이벤트 — EVENTS / RAISE EVENT / SET HANDLER를 제시한다.
- 핵심 설명: 객체는 문법 묶음이 아니라 책임 묶음이다. 속성은 상태, 메서드는 행동, visibility는 약속으로 풀어 설명한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 필요 학습수단: 코드 실행 스텝퍼. 한 줄씩 실행하면서 입력값, 중간값, 출력값을 나란히 보여준다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: OO 이벤트 — EVENTS / RAISE EVENT / SET HANDLER의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapmessage.htm`
- `C:/ABAP_DOCU_HTML/abapmessage_msg.htm`
- `C:/ABAP_DOCU_HTML/abaptry.htm`
- `C:/ABAP_DOCU_HTML/abapraise_exception.htm`
- `C:/ABAP_DOCU_HTML/abapclass.htm`
- `C:/ABAP_DOCU_HTML/abapmethods.htm`

### CH20-L10 · 실습 — ZCL_BOOKING_MANAGER 클래스

**원본 신호**
- 파일: `content/abap/CH20/CH20-L10.md`
- 방향: 콘서트앱 9단계 — 예약 로직을 객체로 설계한다.
- 키워드: 실습, 콘서트앱, 클래스, 예외, ZCX_FULLY_BOOKED
- introduces: 미선언
- prereq: CH20-L01, CH20-L06, CH10-L07
- 진단: 본문 1382자 · 섹션 3개 · 코드 4개 · embed 1개 · 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 실습 — ZCL_BOOKING_MANAGER 클래스를 제시한다.
- 핵심 설명: 객체는 문법 묶음이 아니라 책임 묶음이다. 속성은 상태, 메서드는 행동, visibility는 약속으로 풀어 설명한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH20-L10-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: 실습 — ZCL_BOOKING_MANAGER 클래스의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapmessage.htm`
- `C:/ABAP_DOCU_HTML/abapmessage_msg.htm`
- `C:/ABAP_DOCU_HTML/abaptry.htm`
- `C:/ABAP_DOCU_HTML/abapraise_exception.htm`
- `C:/ABAP_DOCU_HTML/abapclass.htm`
- `C:/ABAP_DOCU_HTML/abapmethods.htm`


## 6. 이 챕터를 감탄나는 자료로 만들기 위한 마무리 체크

- 각 레슨 도입부는 "무엇을 배운다"가 아니라 "지금 무엇이 불편한가"로 시작한다.
- 레슨 끝에는 다음 레슨이 진짜 해결책일 때만 pain -> solution으로 연결한다. 병렬/심화 관계는 억지 불편을 만들지 않는다.
- ABAP 고유 용어는 영어 원문을 살리고 괄호로 쉬운 풀이를 붙인다.
- 코드 예제는 짧은 한 줄 설명, 실행 전 예상, 실행 후 결과 해석, 실패 케이스 순서로 닫는다.
- 공식 문서는 로컬 ABAP_DOCU 파일명으로 재확인하고, 예제는 프로젝트의 관통 예제(구구단, SFLIGHT, 콘서트 예매, 정훈영)를 우선 사용한다.
