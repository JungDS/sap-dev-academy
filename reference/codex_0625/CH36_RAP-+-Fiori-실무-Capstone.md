# CH36 · RAP + Fiori 실무 Capstone — codex_0625 강의 개선·보강본

> 생성 시각: 2026-06-25-13:22 KST  
> 기준 소스: `content/abap/CH36/_chapter.md` + 해당 챕터 레슨 7개  
> 목적: 원본 `content/abap`을 덮어쓰지 않고, 이후 리빌드/강의자료 작성에 바로 사용할 수 있는 고밀도 보강안을 제공한다.

## 1. 프로젝트 분석 기준

- 학습 대상: 개발·전공 경험 없는 입문자. 설명은 압축하지 않고 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리" 순서로 풀어쓴다.
- R15 게이팅: 이미 배운 것만으로 이해할 수 있어야 한다. 후속 개념은 L1 예고까지만 허용하고, 코드나 정의를 앞당기지 않는다.
- R2 코드=체험: 코드가 1줄이라도 있으면 같은 페이지에서 조작하거나, 최소한 어떤 시뮬레이터/다이어그램/버튼 흐름으로 체험할지 명시한다.
- 참고 우선순위: 로컬 `content/abap`과 `.project-docs`가 NotebookLM보다 최신이다. NotebookLM은 큰 방향 참고로만 사용한다.

## 2. 이 챕터의 강의 목표

그동안 배운 것을 RAP + Fiori Capstone으로 통합하고 졸업 기준을 만든다.

**반드시 강화할 지점**
- 요구사항-모델-CDS-RAP-Service-Fiori-운영을 한 줄로 연결
- 각 산출물 ZI_/ZC_/BDEF/BIMP가 어떤 책임을 갖는지 반복
- 권한, Draft, validation/action을 성공/실패 시나리오로 검증
- 완주 감성은 유지하되 실제 인수 기준을 엄격하게 둔다

**대표 체험 설계**
- Capstone 보드를 두고 완료된 객체, 실패 케이스, 권한/Draft/ATC 상태를 체크하는 졸업 점검 시뮬레이터를 둔다.

**이전/다음 연결**
- 이전: CH35 · 운영 품질과 배포 관리 (이송 심화)
- 다음: 과정 마무리

## 3. 원본 진단 요약

| 항목 | 값 |
|---|---:|
| 레슨 수 | 7 |
| 본문 총 글자(공백 제외) | 5886 |
| 코드 블록 | 18 |
| embed 지시문 | 7 |
| 용어 마킹 | 0 |
| 진단 플래그 총합 | 11 |

| 레슨 | 제목 | 본문자 | 코드 | embed | 진단 |
|---|---|---:|---:|---:|---|
| CH36-L01 | Capstone 업무 시나리오 정의 | 590 | 0 | 1 | 본문빈약 |
| CH36-L02 | ZI_* Interface View 설계 | 677 | 2 | 1 | 본문빈약, 흐름압축 |
| CH36-L03 | ZC_* Projection View 설계 | 793 | 2 | 1 | 본문빈약, 흐름압축 |
| CH36-L04 | Behavior Definition / Implementation | 1070 | 4 | 1 | 본문주의, 흐름압축 |
| CH36-L05 | Action / Validation / Determination 구현 | 973 | 6 | 1 | 본문주의 |
| CH36-L06 | Service Binding과 Fiori Elements 테스트 | 629 | 2 | 1 | 본문빈약, 흐름압축 |
| CH36-L07 | Authorization / Draft / 운영 고려사항 | 1154 | 2 | 1 | 본문주의 |

## 4. 게이팅·품질 리스크

- Track-2 실무 구간이다. 성공 예제보다 오류, 재처리, 운영 로그, 권한, 이송 리스크를 함께 다룬다.
- 본문이 짧은 레슨이 있다. 왜 필요한가, 실수하면 무엇이 깨지는가, 어디서 확인하는가를 별도 섹션으로 늘린다.

## 5. 레슨별 개선·보강안

### CH36-L01 · Capstone 업무 시나리오 정의

**원본 신호**
- 파일: `content/abap/CH36/CH36-L01.md`
- 방향: 배운 걸 모아 만들 것 — 콘서트 예매 풀스택 앱.
- 키워드: Capstone, 시나리오, RAP, Fiori
- introduces: Capstone 시나리오 설계
- prereq: CH23, CH22
- 진단: 본문 590자 · 섹션 4개 · 코드 0개 · embed 1개 · 본문빈약

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Capstone 업무 시나리오 정의를 제시한다.
- 핵심 설명: RAP는 파일 이름 암기가 아니라 비즈니스 객체의 생명주기다. 생성, 검증, 자동계산, 저장, 서비스 노출을 한 타임라인에 둔다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH36-L01-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Capstone 업무 시나리오 정의의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapmethods_for_rap_behv.htm`
- `C:/ABAP_DOCU_HTML/abenrap_glosry.htm`
- `C:/ABAP_DOCU_HTML/abenrap_bo_glosry.htm`

### CH36-L02 · ZI_* Interface View 설계

**원본 신호**
- 파일: `content/abap/CH36/CH36-L02.md`
- 방향: 데이터 모델의 기반 — root와 association.
- 키워드: Interface View, Association, root, CDS
- introduces: Capstone Interface View 설계
- prereq: CH36-L01, CH22-L03
- 진단: 본문 677자 · 섹션 2개 · 코드 2개 · embed 1개 · 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 ZI_* Interface View 설계를 제시한다.
- 핵심 설명: 데이터 조회 코드가 의미 있는 데이터 모델로 올라가는 과정이다. Interface View와 Projection View의 관객이 다르다는 점을 반복한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH36-L02-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: ZI_* Interface View 설계의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapmethods_for_rap_behv.htm`
- `C:/ABAP_DOCU_HTML/abenrap_glosry.htm`
- `C:/ABAP_DOCU_HTML/abenrap_bo_glosry.htm`

### CH36-L03 · ZC_* Projection View 설계

**원본 신호**
- 파일: `content/abap/CH36/CH36-L03.md`
- 방향: 화면·서비스에 맞춘 소비 모델과 UI 주석.
- 키워드: Projection View, ZC_, @UI, Fiori
- introduces: Capstone Projection View·UI 주석
- prereq: CH36-L02, CH22-L04
- 진단: 본문 793자 · 섹션 2개 · 코드 2개 · embed 1개 · 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 ZC_* Projection View 설계를 제시한다.
- 핵심 설명: 데이터 조회 코드가 의미 있는 데이터 모델로 올라가는 과정이다. Interface View와 Projection View의 관객이 다르다는 점을 반복한다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH36-L03-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: ZC_* Projection View 설계의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapmethods_for_rap_behv.htm`
- `C:/ABAP_DOCU_HTML/abenrap_glosry.htm`

### CH36-L04 · Behavior Definition / Implementation

**원본 신호**
- 파일: `content/abap/CH36/CH36-L04.md`
- 방향: 예매 앱의 동작을 선언하고 구현한다.
- 키워드: BDEF, BIMP, managed, behavior pool
- introduces: Capstone BDEF/BIMP
- prereq: CH36-L02, CH23-L05
- 진단: 본문 1070자 · 섹션 3개 · 코드 4개 · embed 1개 · 본문주의, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Behavior Definition / Implementation를 제시한다.
- 핵심 설명: RAP는 파일 이름 암기가 아니라 비즈니스 객체의 생명주기다. 생성, 검증, 자동계산, 저장, 서비스 노출을 한 타임라인에 둔다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH36-L04-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Behavior Definition / Implementation의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapmethods_for_rap_behv.htm`
- `C:/ABAP_DOCU_HTML/abenrap_glosry.htm`
- `C:/ABAP_DOCU_HTML/abenrap_bo_glosry.htm`

### CH36-L05 · Action / Validation / Determination 구현

**원본 신호**
- 파일: `content/abap/CH36/CH36-L05.md`
- 방향: 예매 비즈니스 로직을 RAP 핸들러로 구현한다.
- 키워드: Action, Validation, Determination, RAP
- introduces: Capstone 비즈니스 로직 구현
- prereq: CH36-L04, CH23-L07
- 진단: 본문 973자 · 섹션 4개 · 코드 6개 · embed 1개 · 본문주의

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Action / Validation / Determination 구현를 제시한다.
- 핵심 설명: RAP는 파일 이름 암기가 아니라 비즈니스 객체의 생명주기다. 생성, 검증, 자동계산, 저장, 서비스 노출을 한 타임라인에 둔다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH36-L05-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Action / Validation / Determination 구현의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapmethods_for_rap_behv.htm`
- `C:/ABAP_DOCU_HTML/abenrap_glosry.htm`
- `C:/ABAP_DOCU_HTML/abenrap_bo_glosry.htm`

### CH36-L06 · Service Binding과 Fiori Elements 테스트

**원본 신호**
- 파일: `content/abap/CH36/CH36-L06.md`
- 방향: OData로 노출하고 Fiori 화면으로 확인한다.
- 키워드: Service Definition, Service Binding, Fiori Elements, OData V4
- introduces: Capstone 서비스 노출·Fiori 미리보기
- prereq: CH36-L03, CH23-L06
- 진단: 본문 629자 · 섹션 3개 · 코드 2개 · embed 1개 · 본문빈약, 흐름압축

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Service Binding과 Fiori Elements 테스트를 제시한다.
- 핵심 설명: RAP는 파일 이름 암기가 아니라 비즈니스 객체의 생명주기다. 생성, 검증, 자동계산, 저장, 서비스 노출을 한 타임라인에 둔다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH36-L06-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Service Binding과 Fiori Elements 테스트의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapparameters.htm`
- `C:/ABAP_DOCU_HTML/abapselect-options.htm`
- `C:/ABAP_DOCU_HTML/abapselection-screen_definition.htm`
- `C:/ABAP_DOCU_HTML/abapat_selection-screen_events.htm`
- `C:/ABAP_DOCU_HTML/abapmethods_for_rap_behv.htm`
- `C:/ABAP_DOCU_HTML/abenrap_glosry.htm`

### CH36-L07 · Authorization / Draft / 운영 고려사항

**원본 신호**
- 파일: `content/abap/CH36/CH36-L07.md`
- 방향: 권한·초안·운영까지 — 그리고 여정의 마무리.
- 키워드: Authorization, Draft, 운영, Clean Core
- introduces: Capstone 권한·Draft·운영 마무리
- prereq: CH36-L04, CH22-L06, CH35
- 진단: 본문 1154자 · 섹션 6개 · 코드 2개 · embed 1개 · 본문주의

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 Authorization / Draft / 운영 고려사항를 제시한다.
- 핵심 설명: RAP는 파일 이름 암기가 아니라 비즈니스 객체의 생명주기다. 생성, 검증, 자동계산, 저장, 서비스 노출을 한 타임라인에 둔다.
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- 기존 위젯 `CH36-L07-S01`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: Authorization / Draft / 운영 고려사항의 목적을 한 문장으로 설명하게 한다. / 정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다. / 다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.

**공식 문서 체크 힌트**
- `C:/ABAP_DOCU_HTML/abapmethods_for_rap_behv.htm`
- `C:/ABAP_DOCU_HTML/abenrap_glosry.htm`
- `C:/ABAP_DOCU_HTML/abenrap_bo_glosry.htm`
- `C:/ABAP_DOCU_HTML/abapauthority-check.htm`


## 6. 이 챕터를 감탄나는 자료로 만들기 위한 마무리 체크

- 각 레슨 도입부는 "무엇을 배운다"가 아니라 "지금 무엇이 불편한가"로 시작한다.
- 레슨 끝에는 다음 레슨이 진짜 해결책일 때만 pain -> solution으로 연결한다. 병렬/심화 관계는 억지 불편을 만들지 않는다.
- ABAP 고유 용어는 영어 원문을 살리고 괄호로 쉬운 풀이를 붙인다.
- 코드 예제는 짧은 한 줄 설명, 실행 전 예상, 실행 후 결과 해석, 실패 케이스 순서로 닫는다.
- 공식 문서는 로컬 ABAP_DOCU 파일명으로 재확인하고, 예제는 프로젝트의 관통 예제(구구단, SFLIGHT, 콘서트 예매, 정훈영)를 우선 사용한다.
