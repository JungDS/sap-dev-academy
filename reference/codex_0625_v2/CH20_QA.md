# CH20_QA · OO ABAP 기본 설계 재작성 검수

> 대상 산출물: `reference/codex_0625_v2/CH20_REWRITE.md`
> 기준 문서: `reference/codex_0625/00_QUALITY_REVIEW.md`
> 작업 단위: CH20 1개 챕터

## 1. 재작업 판정 반영

`00_QUALITY_REVIEW.md`의 판정은 기존 `codex_0625`가 완성 강의자료가 아니라 챕터별 진단과 보강 지시문에 가깝다는 것이다. CH20 v2는 다음 방식으로 재작성했다.

| 품질 이슈 | v1 문제 | v2 조치 |
|---|---|---|
| 반복 템플릿 | 레슨별 "도입/핵심/체험/공식문서" 형식이 지시문처럼 반복됨 | 각 레슨을 CH20의 실제 학습 흐름에 맞춰 직접 서술 |
| 입문자 설명 부족 | 클래스/객체/상속/예외/이벤트가 짧은 정의와 코드 중심 | 모든 레슨에 `왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리` 흐름 적용 |
| 체험 설계 추상성 | 기존 임베드 사용 지시와 일반적 시뮬레이터 제안에 그침 | 레슨별 데이터, 버튼, 상태, 피드백을 구현 설계 수준으로 작성 |
| 공식 문서 자동 힌트 | v1 공식문서 힌트는 범용 키워드 기반 매칭 위험 | `C:\ABAP_DOCU_HTML`에서 OO ABAP 관련 문서를 수동 확인 |
| R15 위험 | OO 완성도를 이유로 DML/CDS/RAP/고급 패턴을 끌어올 위험 | CH20 허용 범위와 CH21/22/23/24/26 이후 범위를 명시 |

판정: CH20 v2는 v1의 반복 지시문을 재사용하지 않고, OO ABAP 기본 설계 장의 완성 강의자료로 재작성했다.

## 2. 소스 커버리지

| 원본 | v2 반영 위치 | 비고 |
|---|---|---|
| `content/abap/CH20/_chapter.md` | `CH20의 역할`, `R15 경계`, `CH20 마무리 정리` | 절차적 코드의 한계를 객체 구조화로 해결하는 장으로 재정의 |
| `CH20-L01.md` | `CH20-L01 · Global Class 생성과 객체` | SE24/ADT Global Class, DEFINITION/IMPLEMENTATION, `NEW`, `CREATE OBJECT`, `REF TO` |
| `CH20-L02.md` | `CH20-L02 · Attribute / Method / Visibility` | 속성/메서드, `DATA` vs `CLASS-DATA`, public/protected/private, 캡슐화 |
| `CH20-L03.md` | `CH20-L03 · Constructor와 객체 초기화` | `constructor`, `class_constructor`, 객체 생성 시 초기 상태 보장 |
| `CH20-L04.md` | `CH20-L04 · Static Method와 Instance Method` | `METHODS`/`CLASS-METHODS`, `->`/`=>`, `me->` |
| `CH20-L05.md` | `CH20-L05 · Interface 기본 설계` | `INTERFACE`, `INTERFACES`, `intf~method`, interface reference |
| `CH20-L06.md` | `CH20-L06 · Exception Class: TRY / CATCH / CX 계층` | `TRY/CATCH/CLEANUP`, `RAISE EXCEPTION`, `RAISING`, CX 계층, `RESUME` 제한 |
| `CH20-L07.md` | `CH20-L07 · Inheritance / Redefinition` | `INHERITING FROM`, `REDEFINITION`, `super->`, `ABSTRACT`, `FINAL`, 단일 상속 |
| `CH20-L08.md` | `CH20-L08 · 다형성: CAST와 CASE TYPE OF` | upcast/downcast, `CAST`, `?=`, `CX_SY_MOVE_CAST_ERROR`, `CASE TYPE OF ... INTO` |
| `CH20-L09.md` | `CH20-L09 · OO 이벤트: EVENTS / RAISE EVENT / SET HANDLER` | 이벤트 선언/발생/handler/등록, 동기 실행, handler 순서 주의 |
| `CH20-L10.md` | `CH20-L10 · 실습: ZCL_BOOKING_MANAGER 클래스` | 콘서트 앱 예약 관리자, 잔여석 조회, 정원 초과 예외, 매진 이벤트, DML 보류 |

누락된 레슨 없음. CH20 원본 10개 레슨을 모두 별도 절로 반영했다.

## 3. 기존 임베드 반영

| 임베드 | 원본 위치 | v2 반영 | 판정 |
|---|---|---|---|
| `CH20-L01-S01` | 클래스와 객체 관계 | L01의 "어떻게 확인하는가" 뒤에 배치 | 유지 |
| `CH20-L07-S01` | 상속 계층 | L07의 개념 설명 뒤에 배치 | 유지 |
| `CH20-L10-S01` | 클래스 구조 | L10의 완성 구조 설명 앞에 배치 | 유지 |

기존 임베드는 모두 CH20의 핵심 시각 자료로 유지했다. 임베드가 없는 L02~L06, L08~L09는 새 파일을 생성하지 않고, 구현 가능한 체험형 설계를 문서화했다.

## 4. 공식 문서 수동 확인 반영

자동 매칭 대신 `C:\ABAP_DOCU_HTML`에서 다음 문서를 수동 확인했다.

| 주제 | 확인 문서 | 반영 내용 |
|---|---|---|
| Global/Local class와 interface | `abenclass_interface_definition.htm` | Global class/interface는 repository class library에 저장되고 Class Builder/ADT에서 편집됨 |
| 클래스 definition | `abapclass_definition.htm` | `CLASS ... DEFINITION`, `PUBLIC/PROTECTED/PRIVATE SECTION`, components 구조 |
| 클래스 implementation | `abapclass_implementation.htm` | 선언한 instance/static/interface/redefined method를 implementation part에 구현 |
| visibility | `abenclass_visibility.htm` | public/protected/private 접근 범위와 하위 클래스 접근 차이 |
| static attribute | `abapclass-data.htm` | `CLASS-DATA`는 인스턴스가 아니라 클래스 자체에 묶인 static attribute |
| static method | `abapclass-methods.htm` | `CLASS-METHODS`, `class_constructor`, `FOR EVENT` variant |
| method parameter/raising | `abapmethods_general.htm` | `IMPORTING`, `RETURNING`, `RAISING`, `CX_STATIC_CHECK/DYNAMIC/NO_CHECK` 선언 규칙 |
| constructor | `abapmethods_constructor.htm`, `abapclass-methods_constructor.htm` | instance constructor와 static constructor 구분 |
| object creation | `abapcreate_object.htm`, `abenconstructor_expression_new.htm` | `CREATE OBJECT`와 `NEW`가 객체를 만들고 constructor를 호출 |
| object/class selector | `abenobject_component_selector.htm`, `abenclass_component_selector.htm`, `abapcall_method_meth_ident_stat.htm`, `abenme.htm` | `->`, `=>`, `me->` 호출 규칙 |
| interface | `abapinterface.htm`, `abapinterfaces.htm`, `abapinterfaces_class.htm` | `INTERFACE`, `INTERFACES`, interface component selector `~` |
| exception handling | `abaptry.htm`, `abapcatch_try.htm`, `abapcleanup.htm`, `abapraise_exception.htm`, `abapresume.htm` | `TRY/CATCH/CLEANUP`, CATCH 순서, `RAISE EXCEPTION`, `RESUME` 조건 |
| exception classes | `abenabap_exception_classes.htm`, `abenexception_categories.htm`, `abenexception_texts.htm` | CX 계층, checked/no-check 차이, `get_text( )` 설명 |
| inheritance | `abapclass_options.htm`, `abapmethods_redefinition.htm`, `abapcall_method_meth_super.htm`, `abensingle_inheritance_glosry.htm` | `INHERITING FROM`, 단일 상속, `REDEFINITION`, `super->` |
| casting | `abenconstructor_expression_cast.htm`, `abapmove_cast.htm`, `abapcase_type.htm` | `CAST`, `?=`, `CX_SY_MOVE_CAST_ERROR`, `CASE TYPE OF ... WHEN TYPE ... INTO` |
| events | `abenevents.htm`, `abenevents_overview.htm`, `abapevents.htm`, `abapraise_event.htm`, `abapset_handler.htm`, `abapmethods_event_handler.htm` | `EVENTS`, `RAISE EVENT`, `SET HANDLER`, `FOR EVENT`, 동기 실행과 등록 필요성 |
| SQL 보조 | `abapselect.htm`, `abensql_coalesce.htm` | CH20-L10의 잔여석 계산에서 CH19 학습분 `COALESCE`와 aggregate 사용 |

공식 문서 기반으로 본문에 반영한 주요 교정:

- `CASE TYPE OF` 예시는 단순 `WHEN TYPE`만 두지 않고 공식 문서의 `INTO DATA(...)` 형태를 포함했다.
- `RESUME`은 일반 예외 복구 방식이 아니라 `CATCH BEFORE UNWIND`와 `RESUMABLE` 조건이 필요한 특수 문장으로 제한 설명했다.
- `CLEANUP`을 일반 finally처럼 단순화하지 않고 예외 context 정리 시점의 후처리로 설명했다.
- `SET HANDLER`는 이벤트 선언/handler 선언과 별개로 동적 등록이 필요하다는 점을 강조했다.
- ABAP 클래스 단일 상속과 interface 다중 규약의 차이를 분리했다.
- `CREATE OBJECT`와 `NEW`를 같은 객체 생성 개념으로 연결하되 CH20 이후 modern 사용을 허용했다.

## 5. R15 및 classic-first 경계

CH20은 OO ABAP 기본의 정식 도입 장이므로 다음을 사용했다.

- `CLASS ... DEFINITION/IMPLEMENTATION`
- `PUBLIC/PROTECTED/PRIVATE SECTION`
- `DATA`, `CLASS-DATA`, `METHODS`, `CLASS-METHODS`
- `constructor`, `class_constructor`
- `TYPE REF TO`, `CREATE OBJECT`, `NEW`
- `->`, `=>`, `me->`, `super->`
- `INTERFACE`, `INTERFACES`, `intf~method`
- `TRY/CATCH/CLEANUP`, `RAISE EXCEPTION`, `RAISING`
- `INHERITING FROM`, `REDEFINITION`, `ABSTRACT`, `FINAL`
- `CAST`, `?=`, `CASE TYPE OF`
- `EVENTS`, `RAISE EVENT`, `FOR EVENT`, `SET HANDLER`
- CH18/CH19 학습분인 inline `DATA( )`, string template, modern SQL `@`, `COALESCE`

동시에 다음은 보류했다.

| 보류 항목 | 처리 |
|---|---|
| 실제 예약 `INSERT`/취소 `UPDATE` | CH24 DML/LUW로 명시 보류 |
| CDS View Entity | CH22 예고만 가능, 코드 없음 |
| RAP/ABAP Cloud | CH23 이후 개념으로 보류 |
| SALV/ALV 이벤트 심화 | CH21/CH27에서 다룸 |
| OO 고급 패턴 | CH26으로 보류 |
| 예외 T100 텍스트/프레임워크 심화 | CH20에서는 `get_text( )`와 계층 중심 |
| `FRIENDS`, `ALIASES`, `CREATE PRIVATE`, RTTI 심화 | 기본 설계 범위 밖 |

판정: CH20에서 열리는 OO 개념은 적극적으로 사용했고, 후속 챕터 개념은 코드로 앞당기지 않았다.

## 6. 체험형 학습 설계 점검

| 레슨 | 설계한 학습 장치 | 데이터 | 버튼/상태/피드백 구체성 |
|---|---|---|---|
| L01 | Class-to-Object Builder | 클래스 카드, 객체 슬롯, 메서드 카드 | `NEW`, classic 생성, book 호출, 참조 초기화. `referenceState`, `objectCount` 상태 |
| L02 | Visibility Gate Simulator | member, caller role, visibility | public/private/protected 이동, 외부/자식 접근, syntax result |
| L03 | Constructor Timeline | constructor 입력, DB capacity, 객체 상태 | 객체 생성, class method 호출, 초기화 누락 비교, constructor count |
| L04 | Arrow Selector Trainer | class/object left side, static/instance member | `=>`, `->`, `me->`, 호출 검사, selector 오류 피드백 |
| L05 | Contract Board | interface, 구현 클래스, method 약속 | 규약 만들기, 구현 선언, 구현 누락, interface reference 호출 |
| L06 | Exception Flow Console | seats, remaining, exception class | 정상 예약, 정원 초과, CATCH 순서, RAISING 제거, cleanup 관찰 |
| L07 | Redefinition Stepper | parent/subclass, method, static/dynamic type | 부모/자식 객체 생성, upcast, book 실행, super 호출 on/off |
| L08 | Dynamic Type Inspector | reference static/dynamic type, cast target | 일반/VIP 객체 담기, CAST, `?=`, CASE TYPE OF, 공통 메서드 비교 |
| L09 | Event Wiring Panel | raiser, handler, event params | 이벤트 선언, handler 선언, SET HANDLER, 매진 발생, 다중 handler |
| L10 | Booking Manager OO Lab | `zconcert`, `zbooking`, object state | 객체 생성, 잔여석 계산, can_book, book, handler 등록, DML 경계 |

판정: 구현자가 실제 위젯/시뮬레이터로 옮길 수 있도록 데이터, 버튼, 상태, 피드백을 레슨마다 구체화했다.

## 7. 코드·설계 검토

| 항목 | 검토 결과 |
|---|---|
| Global Class skeleton | `PUBLIC CREATE PUBLIC`, public method, private state 구조로 작성 |
| Constructor | 필수 상태 `mv_concert`, `mv_perf`, `mv_cap` 초기화 흐름 명시 |
| SQL | CH19 이후라 `@`, inline `DATA`, `COALESCE` 사용 허용 |
| Exception | `ZCX_FULLY_BOOKED`를 `CX_STATIC_CHECK` 상속으로 가정, `RAISING`/`TRY CATCH` 연결 |
| Event | `sold_out` 선언, `RAISE EVENT`, `FOR EVENT`, `SET HANDLER` 모두 포함 |
| Inheritance | `REDEFINITION`, `super->book( )`, 단일 상속 설명 포함 |
| Polymorphism | parent reference에 child object, `CAST`, `?=`, `CASE TYPE OF` 실패 모델 포함 |
| DML 경계 | `book( )` 안에 실제 `INSERT` 없음, CH24로 주석과 본문에서 보류 |

주의로 남긴 사항:

- `ZCX_FULLY_BOOKED` 예외 클래스의 T100 텍스트 설계는 CH20 기본 범위 밖이라 자세한 class definition 코드를 넣지 않았다.
- 존재하지 않는 공연 ID 처리는 CH15 선택화면 검증 전제를 두었다. 실제 운영 설계에서는 별도 `ZCX_CONCERT_NOT_FOUND` 예외가 적합할 수 있음을 본문에 명시했다.
- `cancel( )` 구현은 상태 변경이므로 CH24 DML 전까지 코드로 제공하지 않았다.

## 8. 자동 점검 기록

작업 후 다음 점검을 수행했다.

| 점검 | 기대 결과 |
|---|---|
| v1 반복 템플릿 흔적 검색 | 본문에는 v1 반복형 "도입 불편/예제 시나리오/abapparameters" 문구 없음. QA의 품질 이슈 설명에만 `템플릿`, `공식문서 힌트`라는 단어가 의도적으로 등장 |
| 후속 개념 조기 코드 검색 | CDS/RAP/BDEF/EML/ABAP Cloud/INSERT/UPDATE/DELETE는 경계 설명 또는 주석에서만 등장. 실제 CDS/RAP/DML 실행 코드는 없음 |
| CH20 레슨 헤딩 검색 | `CH20-L01` ~ `CH20-L10` 총 10개 확인 |
| 공식 문서 파일 존재 확인 | QA에 기재한 ABAP_DOCU 파일 모두 `C:\ABAP_DOCU_HTML`에서 존재 확인 |
| Markdown whitespace 검사 | `git diff --check -- reference\codex_0625_v2\CH20_REWRITE.md reference\codex_0625_v2\CH20_QA.md` 통과 |

## 9. 최종 판정

CH20 v2는 `00_QUALITY_REVIEW.md`의 재작업 필요 판정을 반영해 작성되었다.

- 기존 v1의 반복 지시문 구조를 제거했다.
- CH20 원본 10개 레슨을 모두 완성 강의자료 흐름으로 재서술했다.
- 모든 레슨에 실행 확인 지점과 실수/주의 케이스를 포함했다.
- 공식 ABAP Keyword Documentation을 수동 확인한 OO 문법 근거를 반영했다.
- CH20에서 허용되는 OO 기본과 후속 챕터 경계를 분리했다.
- 체험형 학습 장치를 버튼/상태/데이터/피드백 수준으로 구체화했다.
- 자동 검색과 whitespace 검증을 통과했다.

판정: **통과**.
