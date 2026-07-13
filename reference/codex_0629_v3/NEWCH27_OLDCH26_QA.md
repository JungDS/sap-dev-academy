# NEWCH27_OLDCH26_QA · OO ABAP 고급 설계와 패턴 검수

> 대상 산출물: `reference/codex_0629_v3/NEWCH27_OLDCH26_REWRITE.md`
> 작업 단위: CH26 1개 챕터
> 기준: `content/abap/CH26`, `.project-docs/04_CONVENTIONS.md` R6/R15, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`

## 1. 작업 범위 확인

| 항목 | 확인 |
|---|---|
| 챕터 | CH26 · OO ABAP 고급 설계와 패턴 |
| 원본 레슨 수 | L01~L05, 총 5개 |
| 산출 파일 | `NEWCH27_OLDCH26_REWRITE.md`, `NEWCH27_OLDCH26_QA.md` |
| 주 소스 | `content/abap/CH26` |
| 보조 참고 | `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 직전 v3 CH25 품질 패턴 |
| 품질 목표 | CH20 OO 기본 이후 Factory, Singleton, Strategy, MVC, ABAP Unit을 비전공자도 설계 어휘부터 이해하도록 설명하는 완성 강의자료 |

CH26은 OO 패턴과 테스트 가능 설계 장이다. ALV 고급 이벤트, editable ALV, RAP ETag, BRF+ rule engine, ABAP Test Double Framework 상세는 후속 또는 심화 범위로 보류한다.

## 2. 원본 레슨 커버리지

| 원본 | v3 반영 위치 | 반영 내용 |
|---|---|---|
| `_chapter.md` | `CH26 전체 설계`, `CH26 R15 경계`, `CH26 최종 정리` | 규모가 커질 때 왜 OO 설계 패턴이 필요한지 문제 중심으로 재정의 |
| 신규 보강 | `CH26을 배우기 전 필요한 설계 어휘` | 책임, 의존성, 결합도, 추상화, 주입, 변경 지점, 테스트 경계 설명 |
| 신규 보강 | `CH26-L03A · FRIENDS와 ALIASES` | 캡슐화 예외 통로인 `FRIENDS`, interface component 이름을 짧게 노출하는 `ALIASES`, 단방향 권한과 alias 출처 확인법 설명 |
| `CH26-L01.md` | `CH26-L01 · Factory Pattern` | 생성 책임 집중, interface 반환, `CASE` 기반 구현, 직접 `NEW` 분산 방지 |
| `CH26-L02.md` | `CH26-L02 · Singleton Pattern` | `CREATE PRIVATE`, `CLASS-DATA`, `get_instance`, 전역 상태 남용 주의 |
| `CH26-L03.md` | `CH26-L03 · Strategy Pattern` | interface 기반 알고리즘 교체, constructor injection, OCP 관점 |
| `CH26-L04.md` | `CH26-L04 · MVC 기반 Report 구조화` | Model/View/Controller 책임 분리, report 구조화, 테스트 가능성 |
| `CH26-L05.md` | `CH26-L05 · Testable Class 설계와 ABAP Unit` | dependency injection, mock, `FOR TESTING`, `cl_abap_unit_assert` |

판정: 원본 5개 레슨이 모두 별도 절로 반영되었고, 패턴 이름 암기가 아니라 변경·테스트 관점으로 확장했다.

## 3. 공식 문서 수동 확인

Classic ABAP 문서는 `C:\ABAP_DOCU_HTML`에서 직접 확인했고, Markdown 사본은 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md`에서 대조했다.

| 주제 | 확인 문서 |
|---|---|
| Class options | `abapclass_options.htm`, `ABAPCLASS_OPTIONS.md` |
| Friends | `abenfriends.htm`, `abapclass_options.htm`, `abapclass_local_friends.htm` |
| Static methods | `abapclass-methods.htm`, `ABAPCLASS-METHODS.md` |
| Interface declaration | `abapinterface.htm`, `ABAPINTERFACE.md` |
| Interface implementation | `ABAPINTERFACES_CLASS.md` |
| Aliases | `abapaliases.htm`, `abapinterfaces_class.htm` |
| ABAP Unit overview | `abenabap_unit.htm`, `ABENABAP_UNIT.md` |
| Test class | `abapclass_for_testing.htm`, `ABAPCLASS_FOR_TESTING.md` |
| Test method/assert | `abapmethods_testing.htm`, `ABAPMETHODS_TESTING.md` |

확인 결과: CH26에서 사용하는 `CREATE PRIVATE`, `FRIENDS`, `LOCAL FRIENDS`, `ALIASES`, `CLASS-METHODS`, `INTERFACE`, `INTERFACES`, `CLASS ... FOR TESTING`, `METHODS ... FOR TESTING`, `CL_ABAP_UNIT_ASSERT` 설명은 공식 문서와 정합한다.

## 4. 공식 문서 반영 사항

| 항목 | 반영 |
|---|---|
| `CREATE PRIVATE` | class 자신 또는 friends에서만 instantiate 가능하다는 설명을 Singleton에 반영 |
| `FRIENDS` | 지정 class/interface가 granting class의 모든 component에 visibility와 관계없이 접근할 수 있다는 점, 단방향 권한과 범위 확장 위험을 L03A에 반영 |
| `LOCAL FRIENDS` | local test class가 global/local class의 private component를 테스트할 때 등장할 수 있지만 public behavior 검증을 우선한다는 경계를 반영 |
| `ALIASES` | `ALIASES alias FOR intf~comp`가 새 method가 아니라 interface component의 다른 이름이라는 점을 L03A에 반영 |
| `CLASS-METHODS` | Factory와 Singleton의 static factory/getter method 근거로 반영 |
| interface | interface declaration은 implementation part가 없고, class가 `INTERFACES`로 구현한다는 점을 Strategy/DI에 반영 |
| `FOR TESTING` class | test class, risk level, duration을 ABAP Unit 레슨에 반영 |
| `METHODS ... FOR TESTING` | 테스트 method 선언과 실행 단위 설명에 반영 |
| `CL_ABAP_UNIT_ASSERT` | `assert_equals` 예제로 기대값 검증 설명 |
| test double/helper | 테스트 double과 helper class는 test class 영역에 두어 production code에서 접근하지 않도록 반영 |

## 5. R15 게이팅 및 경계

### CH26에서 허용한 것

| 항목 | 이유 |
|---|---|
| `NEW` | CH20/CH18 이후 정식 학습분 |
| interface reference와 다형성 | CH20 정식 학습분 |
| `CASE`, `IF` | 기존 학습분이며 CH26 감사 교정 기준 |
| `CLASS-METHODS`, `CLASS-DATA` | Factory/Singleton 구현 핵심 |
| `CREATE PRIVATE` | CH26-L02 Singleton 핵심 |
| `FRIENDS`/`LOCAL FRIENDS` | CH20 이후 visibility, private section, class 관계를 배운 상태에서 읽기용 고급 OO 키워드로 허용 |
| `ALIASES` | CH20 이후 interface implementation을 배운 상태에서 interface component 이름 읽기 보조로 허용 |
| constructor injection | CH20 constructor와 interface 기반 설계 응용 |
| `CLASS ... FOR TESTING`, `METHODS ... FOR TESTING` | CH26-L05 핵심 |
| `cl_abap_unit_assert=>assert_equals` | ABAP Unit 결과 검증 핵심 |

### CH26에서 보류한 것

| 보류 항목 | 처리 |
|---|---|
| `COND`, `SWITCH`, `REDUCE` | CH18 확장으로 학습분이 되었지만, CH26 예제는 패턴 설명력 우선으로 과밀 expression을 피함 |
| DI container, reflection factory | 고급 framework 영역 |
| ABAP Test Double Framework 상세 | ABAP Unit 심화 범위 |
| `TEST-SEAM`, `TEST-INJECTION` 상세 | 테스트 심화 범위 |
| ALV 고급 이벤트 | CH27 범위 |
| editable ALV 저장 이벤트 | CH28 범위 |
| BRF+ rule engine | 별도 룰 엔진/운영 범위 |

판정: CH26은 CH20 이후의 OO 설계 응용에 집중했고, 미학습 constructor expression과 후속 ALV/RAP/테스트 심화로 확장하지 않았다.

## 6. 입문자 강의 흐름 점검

| 흐름 | 반영 |
|---|---|
| 왜 필요한가 | 흩어진 `NEW`, 단일 상태 분산, 긴 정책 분기, 캡슐화 예외/alias 오해, 화면/로직 혼합, DB 의존 테스트 문제에서 출발 |
| 무엇인가 | 책임, 의존성, 결합도, 추상화, 주입 같은 설계 어휘를 먼저 설명한 뒤 Factory, Singleton, Strategy, `FRIENDS`/`ALIASES`, MVC, DI/Mock/ABAP Unit을 연결 |
| 어떻게 확인하는가 | 직접 `NEW` 검색, `CREATE PRIVATE` 확인, interface reference 확인, `FRIENDS` 권한 방향 확인, `ALIASES` target 확인, MVC 의존성 검색, ABAP Unit 실행 흐름 확인 |
| 실수/주의 | factory 우회, Singleton 남용, strategy 내부 분기, friend 남용, alias 출처 은폐, MVC 과분리, mock의 production 유입, test risk level 오용 |
| 정리 | 각 패턴과 고급 OO 키워드를 변경 위치 축소, 캡슐화 경계, 테스트 가능성 관점으로 요약 |

판정: IT 비전공자가 패턴을 이름으로 외우지 않고 "어떤 문제를 줄이는가"로 이해하도록 구성했다.

## 7. 체험형 학습 설계 점검

| 레슨 | 학습 장치 | 데이터/상태/피드백 |
|---|---|---|
| L01 | Factory 생성 라우터 | selected type, created class, caller changed count, direct `NEW` 탐지 |
| L02 | Singleton 인스턴스 추적기 | object id, `go_instance`, external creation allowed, test pollution flag |
| L03 | Strategy 교체 실험실 | selected strategy, calculated price, checkout unchanged |
| L03A | OO Access Boundary Inspector | granting class, friend class, access allowed/denied, alias target, visible name list |
| L04 | MVC 영향 범위 시각화 | affected layers, changed files, dependency violation |
| L05 | ABAP Unit 러너와 Mock 주입 실험 | injected dependency, expected/actual, test result, risk level |

판정: 모든 레슨에 버튼, 상태, 데이터, 피드백 설계를 포함했다.

## 8. 코드·설계 검토

| 항목 | 검토 결과 |
|---|---|
| Factory | `CASE` 기반으로 구체 class 선택, 반환 type은 `REF TO zif_booking` |
| Singleton | `PUBLIC FINAL CREATE PRIVATE`, `CLASS-DATA go_instance`, `get_instance` 최초 1회 생성 |
| Strategy | `zif_price_strategy`, 구현 class, checkout의 constructor injection 구조 |
| `FRIENDS` | friend 지정 방향, private 접근 허용 효과, test class에서의 예외적 사용과 남용 위험 |
| `ALIASES` | `ALIASES calc_price FOR zif_price_strategy~calc`, alias가 새 method가 아니라 interface component의 다른 이름이라는 설명 |
| MVC | controller가 model/view interface를 주입받아 흐름 조율 |
| Testable design | repository interface, production manager, local mock, ABAP Unit test class 구성 |
| ABAP Unit | `FOR TESTING DURATION SHORT RISK LEVEL HARMLESS`, `assert_equals` 사용 |
| syntax 선택 | CH18 확장 후에도 Factory 예제는 설명력 우선으로 `CASE` 유지 |
| 설계 어휘 | 책임, 의존성, 결합도, 추상화, 주입, 변경 지점, 테스트 경계 추가 |
| 패턴 선택 기준 | Factory/Singleton/Strategy/MVC/DI 적용 상황 표 추가 |
| 고급 OO 키워드 읽기 | `FRIENDS`는 캡슐화 예외 통로, `ALIASES`는 interface component 이름 보조로 설명 |

판정: 원본의 짧은 패턴 소개를 실무 설계와 테스트 가능성 중심으로 보강했다.

## 9. 자동 검증 기준

작업 후 다음 검증을 수행한다.

| 검증 | 기대 |
|---|---|
| `git diff --check` | whitespace 오류 없음 |
| `rg "^## CH26-L0[1-5]|^## CH26-L03A"` | L01~L05와 보강 레슨 L03A 존재 |
| 반복 문구 검색 | 기존 템플릿형 고정 문구와 이전 챕터 공식문서 힌트 없음 |
| 과밀 expression 검색 | CH26 본문 코드가 패턴 설명을 흐릴 정도로 `COND/SWITCH/REDUCE` 중심으로 바뀌지 않음 |
| 경계 검색 | ALV `DATA_CHANGED`, RAP `COMMIT ENTITIES`, BRF+ 상세 구현 없음 |
| 파일 상태 | `NEWCH27_OLDCH26_REWRITE.md`, `NEWCH27_OLDCH26_QA.md` 두 파일만 변경 |

## 10. 잔여 리스크

| 리스크 | 판단 |
|---|---|
| 패턴 과설계 | 각 레슨에 "언제 과한가"를 명시해 보완 |
| Singleton의 세션 범위 오해 | cross-session/shared-memory singleton은 범위 밖이라고 명시 |
| `FRIENDS` 남용 | 캡슐화를 여는 강한 권한이며 public behavior 테스트를 우선한다고 명시 |
| `ALIASES` 오해 | 새 method가 아니라 `intf~comp`의 다른 이름이라고 명시 |
| ABAP Test Double Framework 미상세 | CH26은 mock과 DI 기초에 집중하고 framework 상세는 보류 |
| MVC의 ABAP GUI/ALV 구체 구현 차이 | CH26은 구조화 사고 중심이며 ALV 이벤트와 편집은 CH27/CH28로 보류 |

## 11. 최종 판정

CH26 재집필본은 다음 기준을 충족한다.

- 원본 L01~L05를 모두 독립 절로 반영했다.
- Factory, Singleton, Strategy, `FRIENDS`/`ALIASES`, MVC, ABAP Unit을 변경 용이성, 캡슐화 경계, 테스트 가능성 관점으로 설명했다.
- Classic ABAP 공식 문서를 `C:\ABAP_DOCU_HTML`에서 직접 확인하고 핵심 OO/ABAP Unit 문법을 반영했다.
- CH18 확장 이후에도 CH26 Factory 예제는 설명력 우선으로 `CASE`를 유지했다.
- 비전공자가 패턴 전에 이해해야 할 설계 어휘와 패턴 선택 기준을 추가했다.
- P2 정밀 판정에서 요구한 `FRIENDS`/`ALIASES` 읽기용 고급 OO 키워드 보강을 반영했다.
- 모든 레슨에 확인 절차와 체험형 학습 설계를 포함했다.
- R15 게이팅을 지키며 ALV 이벤트, editable ALV, RAP/BRF+/테스트 심화로 확장하지 않았다.

판정: `NEWCH27_OLDCH26_REWRITE.md`는 v3 품질 기준으로 사용 가능하다.
