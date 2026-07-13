# NEWCH21_OLDCH20_QA · OO ABAP 기본 설계 검수

> 대상 산출물: `reference/codex_0629_v3/NEWCH21_OLDCH20_REWRITE.md`
> 작업 단위: CH20 1개 챕터  
> 기준: `content/abap/CH20`, `.project-docs/04_CONVENTIONS.md` R6/R15, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`

## 1. 작업 범위 확인

| 항목 | 확인 |
|---|---|
| 챕터 | CH20 · OO ABAP 기본 설계 |
| 원본 레슨 수 | L01~L10, 총 10개 |
| 산출 파일 | `NEWCH21_OLDCH20_REWRITE.md`, `NEWCH21_OLDCH20_QA.md` |
| 주 소스 | `content/abap/CH20` |
| 보조 참고 | `reference/codex_0625_v2/CH20_REWRITE.md`, `reference/codex_0625_v2/CH20_QA.md` |
| 품질 목표 | 절차적 ABAP에서 OO ABAP으로 넘어가는 완성 강의자료 |

CH20은 OO ABAP의 정식 도입 장이다. 따라서 클래스, 객체, 속성, 메서드, visibility, 생성자, interface, 예외, 상속, casting, event는 코드와 함께 다룰 수 있다. 반대로 후속 장의 CDS/RAP, 실제 저장·취소 처리, ALV 이벤트 심화, OO 고급 패턴은 범위 밖이다.

## 2. 원본 레슨 커버리지

| 원본 | v3 반영 위치 | 반영 내용 |
|---|---|---|
| `_chapter.md` | `CH20 전체 설계`, `CH20 R15 경계`, `CH20 최종 정리` | 절차적 코드의 한계를 업무 객체로 해결하는 장으로 재정의 |
| `CH20-L01.md` | `CH20-L01 · Global Class 생성과 객체` | Global Class, `DEFINITION/IMPLEMENTATION`, `NEW`, `CREATE OBJECT`, reference |
| `CH20-L02.md` | `CH20-L02 · Attribute / Method / Visibility` | attribute/method, `DATA` vs `CLASS-DATA`, public/protected/private |
| `CH20-L03.md` | `CH20-L03 · Constructor와 객체 초기화` | `constructor`, `class_constructor`, 객체 생성 시 필수 상태 초기화 |
| `CH20-L04.md` | `CH20-L04 · Static Method와 Instance Method` | `->`, `=>`, `me->`, static/instance 선택 기준 |
| `CH20-L05.md` | `CH20-L05 · Interface 기본 설계` | `INTERFACE`, `INTERFACES`, `interface~method`, interface reference |
| `CH20-L06.md` | `CH20-L06 · Exception Class: TRY / CATCH / CX 계층` | `TRY/CATCH/CLEANUP`, `RAISE EXCEPTION`, `RAISING`, CX 계층, T100 예외 텍스트, `THROW` expression |
| `CH20-L07.md` | `CH20-L07 · Inheritance / Redefinition` | `INHERITING FROM`, `REDEFINITION`, `super->`, `ABSTRACT`, `FINAL` |
| `CH20-L08.md` | `CH20-L08 · 다형성: CAST와 CASE TYPE OF` | upcast/downcast, `CAST`, `?=`, `CASE TYPE OF ... INTO ...` |
| `CH20-L09.md` | `CH20-L09 · OO 이벤트: EVENTS / RAISE EVENT / SET HANDLER` | event 선언, 발생, handler 선언, handler 등록 |
| `CH20-L10.md` | `CH20-L10 · 실습: ZCL_BOOKING_MANAGER 클래스` | 콘서트 앱 예약 관리자, 잔여석 계산, 예외, 이벤트, 후속 저장 경계 |

판정: 원본 10개 레슨이 모두 별도 절로 반영되었다.

## 3. 기존 임베드 반영

| 임베드 | 반영 위치 | 판정 |
|---|---|---|
| `CH20-L01-S01` | L01 클래스와 객체 관계 | 유지 |
| `CH20-L07-S01` | L07 상속 계층 | 유지 |
| `CH20-L10-S01` | L10 클래스 구조 | 유지 |

임베드가 없는 레슨은 신규 파일을 만들지 않고, 구현 가능한 체험형 설계를 버튼/상태/피드백 수준으로 문서화했다.

## 4. 공식 문서 수동 확인

`C:\ABAP_DOCU_HTML`에서 다음 공식 문서 파일 존재를 수동 확인했다.

| 주제 | 확인 문서 |
|---|---|
| 클래스/인터페이스 정의 | `abenclass_interface_definition.htm`, `abapclass_definition.htm`, `abapclass_implementation.htm` |
| visibility | `abenclass_visibility.htm` |
| 속성/메서드/parameter | `abapclass-data.htm`, `abapclass-methods.htm`, `abapmethods_general.htm` |
| 생성자 | `abapmethods_constructor.htm`, `abapclass-methods_constructor.htm` |
| 객체 생성/참조 | `abapcreate_object.htm`, `abenconstructor_expression_new.htm`, `abenobject_reference_type.htm` |
| selector | `abenobject_component_selector.htm`, `abenclass_component_selector.htm`, `abapcall_method_meth_ident_stat.htm`, `abenme.htm` |
| interface | `abapinterface.htm`, `abapinterfaces.htm`, `abapinterfaces_class.htm` |
| 예외 | `abaptry.htm`, `abapcatch_try.htm`, `abapcleanup.htm`, `abapraise_exception.htm`, `abapraise_exception_class.htm`, `abapresume.htm` |
| 예외 계층/텍스트 | `abenabap_exception_classes.htm`, `abenexception_categories.htm`, `abenexception_texts.htm`, `abenexception_texts_t100.htm`, `abenif_t100_message.htm`, `abenif_t100_dyn_msg.htm`, `abapraise_exception_message.htm` |
| `THROW` expression | `abenconditional_expression_result.htm`, `abenabap_exceptions.htm` |
| 상속/재정의 | `abapclass_options.htm`, `abapmethods_redefinition.htm`, `abapcall_method_meth_super.htm`, `abensingle_inheritance_glosry.htm` |
| casting/type case | `abenconstructor_expression_cast.htm`, `abapmove_cast.htm`, `abapcase_type.htm` |
| events | `abenevents.htm`, `abenevents_overview.htm`, `abapevents.htm`, `abapraise_event.htm`, `abapset_handler.htm`, `abapmethods_event_handler.htm` |

확인 결과: 위 문서 파일이 모두 존재했다.

## 5. R15 게이팅 및 경계

### CH20에서 허용한 것

| 항목 | 이유 |
|---|---|
| `CLASS ... DEFINITION/IMPLEMENTATION` | OO ABAP L3 정식 도입 |
| `NEW`, `CREATE OBJECT`, `TYPE REF TO` | CH18 이후 modern syntax 및 CH20 객체 생성 정식 도입 |
| `PUBLIC/PROTECTED/PRIVATE` | visibility 정식 도입 |
| `DATA`, `CLASS-DATA`, `METHODS`, `CLASS-METHODS` | attribute/method 정식 도입 |
| `constructor`, `class_constructor` | 객체 초기화 정식 도입 |
| `INTERFACE`, `INTERFACES`, `interface~method` | interface 정식 도입 |
| `TRY/CATCH/CLEANUP`, `RAISE EXCEPTION`, `RAISING` | CH20 예외 정식 도입 |
| `IF_T100_MESSAGE`, `SCX_T100KEY`, `TEXTID`, `MESSAGE oref` | P2 정밀 판정에 따라 T100 기반 예외 텍스트 기본 회수 |
| `COND`/`SWITCH` 결과 위치의 `THROW` | CH18에서 경계만 둔 `THROW` expression을 CH20 예외 학습 후 회수 |
| `INHERITING FROM`, `REDEFINITION`, `super->` | 상속 정식 도입 |
| `CAST`, `?=`, `CASE TYPE OF` | 다형성·casting 정식 도입 |
| `EVENTS`, `RAISE EVENT`, `FOR EVENT`, `SET HANDLER` | OO 이벤트 정식 도입 |
| modern SQL `@`, `COALESCE`, inline `DATA( )` | CH18/CH19에서 이미 정식 도입됨 |

### CH20에서 보류한 것

| 보류 항목 | 처리 |
|---|---|
| 실제 저장·취소 처리와 트랜잭션 제어 | 후속 데이터 변경 장으로 보류 |
| CDS View Entity 코드 | CH22 범위 |
| RAP/ABAP Cloud 코드 | CH23 범위 |
| ALV 이벤트 심화 | CH21/CH27 범위 |
| OO 고급 패턴 | CH26 범위 |
| `IF_T100_DYN_MSG` 전체 활용, `USING MESSAGE`, dynamic message bridge | 기본 용도만 설명하고 실습 심화는 보류 |
| `PREVIOUS` exception chain 분석, resumable/shortdump exception 심화 | CH20에서는 존재와 제한만 설명 |
| RTTI/동적 접근 심화 | Track-2 또는 고급 범위 |

판정: CH20에서 열리는 OO 기본은 정식 사용했고, 후속 챕터 범위는 코드로 앞당기지 않았다.

## 6. 입문자 강의 흐름 점검

| 흐름 | 반영 |
|---|---|
| 왜 필요한가 | 절차적 코드 흩어짐, 불완전 초기화, 공개 상태 위험, 실패 전달, 사건 알림 등 실제 불편에서 출발 |
| 무엇인가 | Class/Object/Reference, Attribute/Method, Visibility, Constructor, Interface, Exception, Inheritance, Event를 표와 코드로 설명 |
| 어떻게 확인하는가 | 디버거, 활성화 오류, syntax check, handler 호출, exception flow 등 관찰 지점 제시 |
| 실수/주의 | initial reference, public data, static/instance 혼동, 넓은 catch, super 누락, cast 남용, handler 미등록 등 구체화 |
| 정리 | 레슨마다 핵심 요약 제공 |

판정: 단순 OO 문법 나열이 아니라 입문자가 실행 후 무엇을 확인해야 하는지 포함했다.

## 7. 체험형 학습 설계 점검

| 레슨 | 학습 장치 | 데이터/상태/피드백 |
|---|---|---|
| L01 | Class-to-Object Builder | class card, object slot, `referenceState`, `objectCount`, initial reference 오류 |
| L02 | Visibility Gate Simulator | member, caller role, visibility, `syntaxResult`, public data 경고 |
| L03 | Constructor Timeline | constructor input, object state, constructor count, ready state |
| L04 | Arrow Selector Trainer | class/object/me left side, member kind, selector 오류 |
| L05 | Contract Board | interface contract, implementing class, activation result |
| L06 | Exception Flow Console | remaining seats, requested seats, exception class, catch target, T100 key, message text, throw branch |
| L07 | Redefinition Stepper | parent/subclass, executed method, `superCalled` |
| L08 | Dynamic Type Inspector | static type, dynamic type, cast result, cast exception |
| L09 | Event Wiring Panel | event source, handler object, handler log, registration state |
| L10 | Booking Manager OO Lab | concert/booking data, object state, remaining seats, exception/event path |

판정: 모든 코드 레슨에 체험/시뮬레이터/버튼/상태/데이터/피드백 설계가 포함되었다.

## 8. 자동 점검 기준

작업 후 다음을 점검한다.

| 점검 | 기대 |
|---|---|
| `git diff --check` | whitespace 문제 없음 |
| `CH20-L01`~`CH20-L10` 헤딩 | 총 10개 존재 |
| v1 반복형 문구 | 반복 템플릿 흔적 없음 |
| 후속 모델링 코드 | CDS/RAP 선언 코드 없음 |
| 후속 데이터 변경 코드 | 실제 저장·취소 처리 코드 없음 |
| `THROW`, `IF_T100_MESSAGE`, `SCX_T100KEY`, `MESSAGE lx_booked` | L06/L10 보강 대상이므로 존재해야 함 |
| 공식 문서 파일 | QA에 적은 문서 파일 모두 존재 |

## 9. 남은 위험

| 위험 | 대응 |
|---|---|
| T100 예외 텍스트가 과밀해질 위험 | CH20에서는 `IF_T100_MESSAGE`, `SCX_T100KEY`, `TEXTID`, `MESSAGE oref` 흐름만 다루고 `IF_T100_DYN_MSG` 심화는 보류 |
| `THROW` expression 남용 위험 | 조건별 값 생성 중 실패 branch에서만 사용하고, 여러 문장 흐름은 `IF`와 `RAISE EXCEPTION`을 유지하도록 명시 |
| constructor에서 존재하지 않는 공연 처리 | CH15 입력 검증 전제를 명시, 운영 설계에서는 별도 예외 가능 |
| 상속 남용 가능성 | "is-a 관계인지 확인"과 interface 대안을 본문에 포함 |
| CAST 남용 가능성 | 공통 method/interface 우선, CAST는 제한적으로 설명 |
| 이벤트를 예외처럼 쓰는 오해 | 실패 전달은 예외, 사건 알림은 이벤트로 반복 구분 |

## 10. 최종 판정

CH20 v3 산출물은 다음 조건을 충족한다.

- `content/abap/CH20`의 10개 레슨을 모두 반영했다.
- v2는 보조 기준으로만 사용했고, v3 본문은 CH20 교육 흐름에 맞춰 다시 구성했다.
- 입문자 기준으로 왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리 흐름을 레슨별로 작성했다.
- 코드가 있는 레슨마다 체험/시뮬레이터/버튼/상태/데이터/피드백 설계를 구체화했다.
- 공식 ABAP Keyword Documentation 파일을 `C:\ABAP_DOCU_HTML`에서 수동 확인했다.
- P2 정밀 판정에서 남은 CH20 작업인 T100 기반 예외 텍스트와 `THROW` expression을 L06/L10에 반영했다.
- R15 게이팅과 CH20 OO 기본 경계를 지켰다.

판정: **통과**.
