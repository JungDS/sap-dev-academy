# CH26_QA - OO ABAP 고급 설계와 패턴

> 대상 파일: `reference/codex_0625_v2/CH26_REWRITE.md`
> 기준 파일: `reference/codex_0625/00_QUALITY_REVIEW.md`
> 작업 단위: CH26 단일 챕터
> 판정: 재작업 완료, 사후 명령 검증 대상

## 1. 재작업 판정 반영

| 기준 | 반영 결과 |
|---|---|
| 기존 `codex_0625`의 템플릿 반복 제거 | v1의 반복 보강 문구를 본문 골격으로 사용하지 않고, 패턴별 실제 문제 상황과 변경 요구 대응 흐름으로 재작성했다. |
| 완성 강의자료 수준 재집필 | Factory, Singleton, Strategy, MVC, ABAP Unit을 "패턴 이름"이 아니라 수정 범위 축소와 테스트 가능성 관점으로 연결했다. |
| 입문자 기준 흐름 | 모든 레슨에 `왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수와 주의 -> 체험형 학습 설계 -> 정리` 흐름을 넣었다. |
| 코드가 있는 레슨의 체험 설계 | 기존 embed 기반 버튼, 상태, 코드 영역, dynamic type, reference count, assert 결과, Mock/DB 분리 피드백을 구체화했다. |
| 공식문서 자동 매칭 금지 | `C:\ABAP_DOCU_HTML`에서 ABAP Objects, interface, `NEW`, ABAP Unit, Cloud/released API 문서를 수동 확인해 rewrite 상단의 근거 표에 반영했다. |
| R15 게이팅 | CH26은 CH20 이후이므로 OO 문법을 사용할 수 있고, CH18/CH19 이후이므로 `DATA(...)`, `NEW #( )`, modern Open SQL `@`를 사용할 수 있다. 단 `COND`/`SWITCH`/`REDUCE`/`FOR` comprehension은 사용하지 않았다. |
| classic-first 경계 | 본문은 classic OO ABAP 설계와 ABAP Unit 중심이며, RAP factory action/Cloud 구현은 경계 설명으로만 처리했다. |

## 2. 원본 레슨 커버리지

| 원본 레슨 | v2 반영 위치 | 보강 내용 |
|---|---|---|
| `CH26-L01` Factory Pattern | `CH26-L01 - Factory Pattern` | 흩어진 `NEW` 문제, interface 반환, dynamic type 확인, 알 수 없는 타입 처리 정책, factory 우회/거대 factory 실수를 보강했다. |
| `CH26-L02` Singleton Pattern | `CH26-L02 - Singleton Pattern` | `CREATE PRIVATE`, `CLASS-DATA`, `get_instance( )`, reference 동일성 확인, 전역 상태 남용과 테스트/동시성 위험을 보강했다. |
| `CH26-L03` Strategy Pattern | `CH26-L03 - Strategy Pattern` | 요금 정책 분기 확장 문제, strategy interface, concrete strategy, checkout 주입, OCP 감각, 과설계 기준을 보강했다. |
| `CH26-L04` MVC 기반 Report 구조화 | `CH26-L04 - MVC 기반 Report 구조화` | Report 안의 조회/계산/표시/이벤트 섞임 문제, Model/View/Controller 책임, 변경 영향 범위 표, 과분리 기준을 보강했다. |
| `CH26-L05` Testable Class 설계와 ABAP Unit | `CH26-L05 - Testable Class 설계와 ABAP Unit` | DB 직접 의존 문제, repository interface, Mock, `FOR TESTING`, `assert_equals`, 버그 주입 실패 확인까지 확장했다. |

## 3. 공식 문서 수동 확인 반영

| 주제 | 확인 문서 | 확인한 핵심 | v2 반영 |
|---|---|---|---|
| Class 정의 | `C:\ABAP_DOCU_HTML\abapclass_definition.htm` | `CLASS ... DEFINITION`, visibility section, class component 선언 구조 | 상단 근거 표, L01/L02/L04/L05 class 예제 |
| Class option / `CREATE PRIVATE` | `C:\ABAP_DOCU_HTML\abapclass_options.htm` | `CREATE PUBLIC/PROTECTED/PRIVATE`가 instantiation 가능 범위를 정함 | L02 Singleton, L01 factory method 통제 설명 |
| Static attribute | `C:\ABAP_DOCU_HTML\abapclass-data.htm` | `CLASS-DATA`는 instance가 아니라 class 자체에 묶인 static attribute | L02 `go_instance` 설명 |
| Static method | `C:\ABAP_DOCU_HTML\abapclass-methods_general.htm` | `CLASS-METHODS`는 static method와 parameter interface 선언 | L01 factory method, L02 `get_instance( )` |
| Instance/functional method | `C:\ABAP_DOCU_HTML\abapmethods_general.htm`, `abapmethods_functional.htm` | `IMPORTING`, `RETURNING VALUE(...)`, functional method 호출 | L01/L03/L05 method interface 예제 |
| Interface 정의 | `C:\ABAP_DOCU_HTML\abapinterface.htm` | interface는 declaration section만 있고 implementation part가 없음 | L01/L03/L05 interface 설명 |
| Interface 구현 | `C:\ABAP_DOCU_HTML\abapinterfaces_class.htm` | `INTERFACES`로 구현하고 `intf~method` 형태의 component 구현이 필요 | L01/L03/L05 구현 예제 |
| Object 생성 | `C:\ABAP_DOCU_HTML\abapcreate_object_implicit.htm`, `abenconstructor_expression_new.htm` | object instance 생성과 `NEW` instance operator 동작 | L01/L02 factory/singleton 예제 |
| Method call | `C:\ABAP_DOCU_HTML\abapcall_method_static.htm` | static method call에서 `CALL METHOD`는 권장되지 않고 `oref->meth( )`/`class=>meth( )` 형식이 권장 | 모든 예제의 modern method call 표기 |
| ABAP Unit | `C:\ABAP_DOCU_HTML\abenabap_unit.htm` | ABAP Unit은 unit test framework이며 test class/test method와 `CL_ABAP_UNIT_ASSERT`를 사용 | L05 전체 구조 |
| Test class | `C:\ABAP_DOCU_HTML\abapclass_for_testing.htm` | `CLASS ... FOR TESTING`, `RISK LEVEL`, `DURATION`, test double/helper class 용도 | L05 test class와 Mock 설명 |
| Test method/assert | `C:\ABAP_DOCU_HTML\abapmethods_testing.htm` | `METHODS ... FOR TESTING`, `ASSERT_EQUALS`, production code regular exit 주의 | L05 `remaining_calc` 테스트 |
| ABAP Cloud/released API | `C:\ABAP_DOCU_HTML\abenabap_cloud_glosry.htm`, `abenabap_for_cloud_dev_glosry.htm`, `abenreleased_api_glosry.htm` | ABAP Cloud는 restricted language version, released APIs, ADT, RAP 중심 | 상단 경계, 챕터 마무리 문장 |

## 4. R15 / classic-first 경계 점검

| 항목 | 점검 결과 |
|---|---|
| CH20 선수지식 | class, method, interface, object reference, polymorphism을 전제로 사용했다. |
| CH18/CH19 이후 문법 | `DATA(...)`, `NEW #( )`, Open SQL `@`는 허용 범위로 사용했다. |
| 미학습 constructor 식 | `.project-docs/11_KEYWORD_AUDIT.md`의 CH26 게이팅 교정 이력을 반영해 `COND`, `SWITCH`, `REDUCE`, `FILTER`, `FOR` comprehension을 쓰지 않았다. |
| Design pattern 범위 | GOF 전체 목록으로 확장하지 않고 원본 5개 레슨의 Factory/Singleton/Strategy/MVC/Testability만 다뤘다. |
| MVC 범위 | UI5 MVC나 RAP projection/controller 개념으로 확장하지 않고 classic ABAP Report 구조화로 한정했다. |
| ABAP Unit 범위 | ABAP Test Double Framework 세부 API나 ATC/CI 상세는 후속 품질 챕터 범위로 넘기고, Mock class와 assert 중심으로 설명했다. |
| Cloud 경계 | classic OO ABAP 패턴을 Cloud-ready 구현이라고 말하지 않고, restricted language version과 released API 확인 필요성을 명시했다. |

## 5. 코드 예제 QA

| 예제 | 점검 |
|---|---|
| Factory 예제 | `zif_booking` interface 반환, `CASE` 기반 type 선택, concrete class 구현, 호출부의 interface method call을 포함했다. |
| Singleton 예제 | `CREATE PRIVATE`, `CLASS-DATA go_instance`, `get_instance( )`, reference 동일성 확인을 포함했다. |
| Strategy 예제 | `zif_price_strategy`, standard/vip concrete strategy, `zcl_checkout` 생성자 주입, `mo_strategy->calc( )` 호출을 포함했다. |
| MVC 예제 | Model/View/Controller 책임을 분리하고 Controller가 Model 호출 후 View 표시로 조율하는 구조를 보였다. |
| ABAP Unit 예제 | repository interface, test double class, `CLASS ... FOR TESTING`, `METHODS ... FOR TESTING`, `assert_equals`를 포함했다. |
| 미학습 문법 회피 | `COND #()`, `SWITCH`, `REDUCE`, `FILTER`, `FOR ... IN` comprehension 없이 작성했다. |
| 과설계 경고 | Factory/Singleton/Strategy/MVC 각각에 "언제 쓰지 말아야 하는가"를 넣어 패턴 남용을 막았다. |

## 6. 체험형 학습 설계 QA

| 레슨 | 반영한 체험 설계 |
|---|---|
| L01 | Factory 시뮬: type 버튼, 호출부 코드 고정, concrete class 결과, interface 표시, 알 수 없는 타입 정책 피드백을 설계했다. |
| L02 | Singleton 시뮬: `get_instance( )`와 `NEW` 버튼, reference 목록, instance count, `CREATE PRIVATE` 토글, reset 흐름을 설계했다. |
| L03 | Strategy 시뮬: 전략 버튼, 좌석 수 입력, 호출부 코드 고정, 주입된 strategy class, 계산식/가격 결과를 설계했다. |
| L04 | MVC 영향 범위 시각화: 화면 교체/로직 변경/흐름 추가 버튼, 계층 highlight, 변경/유지 badge, 과분리 경고를 설계했다. |
| L05 | ABAP Unit 러너: 테스트 실행, 버그 주입 토글, test class/method 목록, `act/exp`, Mock 표시, red/green 피드백을 설계했다. |

## 7. 기존 시각 자료 반영

| 자료 | 반영 |
|---|---|
| `embeds/abap/CH26-L01-S01.html` | Factory type 선택과 concrete class 결과 체험으로 사용했다. |
| `embeds/abap/CH26-L02-S01.html` | Singleton reference count 비교 체험으로 사용했다. |
| `embeds/abap/CH26-L03-S01.html` | Strategy 교체와 가격 결과 체험으로 사용했다. |
| `embeds/abap/CH26-L04-S01.html` | MVC 계층 변경 영향 범위 체험으로 사용했다. |
| `embeds/abap/CH26-L05-S01.html` | ABAP Unit pass/fail와 버그 주입 체험으로 사용했다. |
| 새 HTML/SVG 생성 | 요청 산출물이 reference 문서이므로 새 embed 파일은 만들지 않고, 필요한 버튼/상태/데이터/피드백 설계를 글로 구체화했다. |

## 8. v1 대비 주요 정정

| v1 문제 | v2 조치 |
|---|---|
| 레슨마다 같은 "도입 불편/핵심 설명/실무 감각" 템플릿 반복 | 각 패턴의 실제 변경 고통과 확인 기준을 직접 서술했다. |
| 클래스/메서드 문서가 반복 힌트로만 붙음 | 패턴별로 필요한 ABAP Objects/ABAP Unit 공식 문서를 수동 확인하고 근거 표에 매핑했다. |
| Factory/Singleton/Strategy 남용 기준 부족 | 각 레슨에 과설계, 우회, 전역 상태, 내부 분기 같은 실수 기준을 추가했다. |
| MVC가 역할 표 수준에 가까움 | 변경 시나리오별 수정 범위와 코드 리뷰 질문으로 확장했다. |
| ABAP Unit이 테스트 코드 소개에 머묾 | 의존성 분리, repository interface, Mock, red/green 검증까지 연결했다. |
| R15 게이팅 위험 | `COND` 등 미학습 constructor 식을 사용하지 않고 `CASE`/`IF` 중심으로 유지했다. |

## 9. ABAP Cloud 경계 메모

사용자 목표의 `ABAP Cloud에 대한 공식문서 힌트는` 문장은 미완성 상태였지만, CH26의 Cloud 경계는 로컬 ABAP_DOCU에서 확인했다.

- `abenabap_cloud_glosry.htm`: ABAP Cloud는 restricted ABAP language version, released APIs, ADT, RAP transactional model 중심이다.
- `abenabap_for_cloud_dev_glosry.htm`: ABAP for Cloud Development는 restricted language scope와 released APIs 접근 제한을 가진다.
- `abenreleased_api_glosry.htm`: released API는 ABAP Cloud에서 접근 허용된 repository object 또는 그 일부다.

따라서 CH26 v2는 다음 경계를 둔다.

- Factory/Singleton/Strategy/MVC는 classic OO ABAP 설계 패턴으로 설명한다.
- RAP factory action은 이름이 비슷해도 CH26의 Factory Pattern과 같은 주제로 가르치지 않는다.
- Cloud-ready 여부는 사용한 class/API가 released API인지, language version에서 허용되는지 확인해야 한다고만 설명한다.
- ABAP Unit은 Cloud에서도 중요한 설계 관점이지만, 이 문서에서는 classic ABAP Unit 기본 구조 중심으로 다룬다.

## 10. 잔여 리스크와 의도적 보류

| 항목 | 처리 |
|---|---|
| 실제 DDIC 타입 | `zbooking`, `zbooking_id`, `ztt_booking`, `zconcert_id`는 교육용 관통 예시다. 실제 시스템에서는 타입명을 맞춰야 한다. |
| ABAP Test Double Framework | 공식 문서에서 존재를 확인했지만 CH26 본문은 입문자용 Mock class 구현 중심으로 제한했다. |
| thread-safe Singleton | ABAP internal session, shared memory, 병렬 처리 상세는 CH26 범위 밖이다. Singleton 남용 경고까지만 다뤘다. |
| full GOF/SOLID 이론 | 원본 5개 레슨 범위를 넘어가므로 확장하지 않았다. |
| MVC의 실제 ALV event wiring | CH27 ALV 이벤트 심화로 이어지므로 L04에서는 구조화와 영향 범위 판단까지만 다뤘다. |
| embed 내부 스타일/문구 | reference 문서 산출 범위에서는 embed 파일을 수정하지 않았다. |

## 11. 최종 수동 점검 체크리스트

- [x] CH26 단일 챕터만 작업했다.
- [x] `reference/codex_0625_v2/CH26_REWRITE.md`를 생성했다.
- [x] `reference/codex_0625_v2/CH26_QA.md`를 생성했다.
- [x] 원본 5개 레슨을 모두 반영했다.
- [x] 기존 `codex_0625` 반복 템플릿을 제거했다.
- [x] 각 레슨에 입문자용 흐름을 넣었다.
- [x] 코드가 있는 레슨에 체험형 설계를 넣었다.
- [x] Classic ABAP 공식 문서를 `C:\ABAP_DOCU_HTML`에서 수동 확인했다.
- [x] ABAP Cloud 경계를 로컬 ABAP_DOCU Cloud/released API 문서로 확인했다.
- [x] R15 게이팅과 classic-first 경계를 지켰다.

## 12. 사후 검증 기록

아래 항목은 파일 생성 후 명령으로 추가 점검했다.

| 검증 | 결과 |
|---|---|
| 반복 템플릿 문구 검색 | 완료. `CH26_REWRITE.md`에서 v1 고정 문구(`도입 불편`, `실무 감각`, `필요 학습수단`, `공식 문서 체크 힌트`)가 검출되지 않음. |
| 레슨별 흐름 섹션 개수 | 완료. `왜 필요한가/무엇인가/어떻게 확인하는가/실수와 주의/체험형 학습 설계/정리` 섹션이 30개로 확인됨(5레슨 x 6섹션). |
| 레슨 수 확인 | 완료. `## CH26-L01` ~ `## CH26-L05` 총 5개 레슨 확인. |
| 미학습 constructor 식 코드 사용 검사 | 완료. 코드 블록 내부에서 `COND`, `SWITCH`, `REDUCE`, `FILTER`, `FOR ... IN` comprehension 패턴이 검출되지 않음. |
| 잘못된 자동 매칭 문서 힌트 제거 | 완료. Selection Screen, parameter, event 일반 문서 파일명 패턴 검색 결과 없음. |
| CH26 핵심 키워드 반영 검색 | 완료. `Factory`, `Singleton`, `Strategy`, `MVC`, `ABAP Unit`, `Mock`, `CREATE PRIVATE`, `CLASS-DATA`, `zif_booking`, `zif_price_strategy`, `assert_equals`, Cloud 경계 키워드 반영 확인. |
| 공식 문서 파일명 반영 검색 | 완료. class definition/options, class-data, class-methods, methods, interface, `NEW`, ABAP Unit, test class/method, ABAP Cloud/released API 문서 파일명 반영 확인. |
| trailing whitespace 검사 | 완료. `git diff --check -- reference/codex_0625_v2/CH26_REWRITE.md reference/codex_0625_v2/CH26_QA.md` 통과. |
