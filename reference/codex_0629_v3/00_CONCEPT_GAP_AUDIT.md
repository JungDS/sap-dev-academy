# 00_CONCEPT_GAP_AUDIT - R15 보류/후속 회수 1차 감사

> 작성일: 2026-07-03 KST
> 범위: `reference/codex_0629_v3/CH01_REWRITE.md` ~ `CH26_REWRITE.md`, `CH01_QA.md` ~ `CH26_QA.md`
> 목적: CH26의 `COND` 사례처럼 "선행 챕터에서 다뤘어야 하는 개념 누락"이 후속 챕터 품질을 낮추는지 1차로 전수 수집한다.
> 제한: 이 문서는 감사표다. CH별 원고 재작성은 하지 않는다.

## 1. 감사 기준

R15 기준은 "그 시점까지 배운 것만으로 이해하고 실습 가능해야 한다"이다. 따라서 후속 개념을 무조건 앞당기는 것도 오류이고, 반대로 해당 개념을 다룰 마지막 소유 챕터에서 빠뜨리는 것도 오류다.

이번 1차 감사의 판정은 다음 네 단계로 구분한다.

| 판정 | 의미 | 후속 조치 |
|---|---|---|
| 정상 회수 | 보류 사유가 명확하고 후속 CH01~CH26 안에서 실제 회수됨 | 재작업 불필요 |
| 예정 회수 | 보류 사유가 명확하고 CH27~CH36 원본/커리큘럼에 회수 위치가 있음 | 해당 후속 v3 작성 시 확인 |
| 의도 제외 | 커리큘럼에서 명시적으로 제외하거나 대체 경로를 확정함 | 재작업 불필요, 단 문서에 제외 이유 유지 |
| 정밀 판정 필요 | 후속 소유 챕터가 불명확하거나, 유일한 소유 챕터에서 빠진 가능성이 있음 | 2차 감사 또는 해당 챕터 재작업 후보 |

## 2. 사용한 근거

| 근거 | 확인 내용 |
|---|---|
| `.project-docs/04_CONVENTIONS.md` | R6 classic-first, R15 개념 노출 게이팅 |
| `.project-docs/09_CURRICULUM_LEDGER.md` | CH01~CH36 배치, CH27~CH36 후속 제목, 명시 제외 결정 |
| `.project-docs/11_KEYWORD_AUDIT.md` | 기존 키워드 감사. 단, CH18의 `COND/SWITCH/REDUCE` 보류 판단은 이번 사용자 지적으로 폐기 필요 |
| `content/abap/CH01~CH36` | 후속 회수 예정 여부 확인 |
| `reference/codex_0629_v3/CH01~CH26` | 현재 v3 산출물의 실제 보류/회수 상태 |

## 3. 챕터별 보류/후속 회수 전수 수집표

| 챕터 | 보류 또는 선행 사용 항목 | 지정된 후속/사유 | 1차 확인 | 판정 |
|---|---|---|---|---|
| CH01 | L05 변수/날짜 선행 사용 | CH02 변수, CH04 날짜 | CH02/CH04에서 회수 | 정상 회수 |
| CH01 | `EDIT MASK` | CH01 범위에서 제외 | CH04 `WRITE TO`는 회수되지만 `EDIT MASK`는 niche로 제외 | 의도 제외 |
| CH01 | `WRITE TO` | CH04-L02 문자열 처리 | CH04 문자열 처리에서 회수 | 정상 회수 |
| CH01 | selection screen, Module Pool | CH03/CH15, CH16 | 후속 배치 명확 | 정상 회수 |
| CH02 | `DATA ... VALUE`를 constructor `VALUE`로 확장하지 않음 | CH18 New Syntax | CH18에서 `VALUE #(...)` 회수 | 정상 회수 |
| CH02 | 날짜 계산, `sy-datum`, 사용자 친화 출력 | CH04 | CH04 날짜 산술과 출력 흐름에서 회수 | 정상 회수 |
| CH02 | DDIC 전역 타입 | CH03 | Domain/Data Element로 회수 | 정상 회수 |
| CH02 | boolean 조건 흐름 | CH04 | `abap_bool`, `xsdbool`, 조건문으로 회수 | 정상 회수 |
| CH02 | `MESSAGE`, message class | CH15 | CH15 message type/class에서 회수 | 정상 회수 |
| CH02 | `int8`, `decfloat`, `x`, `xstring`, generic type | 고급 타입으로 제외 | 일부 `xstring`은 CH34 PDF에서 등장 예정. 나머지는 초급 범위 밖 | 의도 제외 |
| CH03 | Value Table, Foreign Key, Search Help, ALPHA | CH09 | CH09 DDIC 관계/F4에서 회수 | 정상 회수 |
| CH03 | Parameter ID / SPA-GPA | Track-2 또는 후속 심화 | v3 CH15-L10에서 `MEMORY ID`/Parameter ID 연결 설명 확인 | 정상 회수 |
| CH03 | Selection Screen UI | CH15 | CH15에서 checkbox/radio/block/pushbutton/tabbed block 회수 | 정상 회수 |
| CH03 | `START-OF-SELECTION` 선행 사용 | CH15 | CH15 report event에서 회수 | 정상 회수 |
| CH03 | Debugger, Transparent Table | CH04, CH07 | 각각 회수 | 정상 회수 |
| CH04 | string template, compound assignment | CH18 | CH18에서 회수 | 정상 회수 |
| CH04 | regex/SUBMATCHES | 범위 밖 | 후속 소유 불명. `FIND`/`REPLACE` 기초는 CH04가 맞지만 `PCRE/REGEX`, `MATCH OFFSET/LENGTH`, `SUBMATCHES`, `CL_ABAP_REGEX`는 문자열 심화 소유가 필요 | 정밀 판정 필요 |
| CH04 | Selection screen 심화 | CH15 | 회수 | 정상 회수 |
| CH04 | Internal Table, FORM/FM/Method, TRY/CATCH | CH06, CH10/CH20 | 회수 | 정상 회수 |
| CH05 | modern `CORRESPONDING #( )` | CH18 | CH18에서 회수 | 정상 회수 |
| CH05 | Internal Table, Transparent Table | CH06, CH07 | 회수 | 정상 회수 |
| CH05 | `.APPEND` 표준 확장 심화 | 표준 확장 입구만 설명 | CH23 Clean Core, CH29 Enhancement와 연결 가능. 현재는 직접 수정 금지 경계로 충분 | 예정 회수 |
| CH06 | generic Field Symbol, generic type, dynamic `ASSIGN (name)`, `ASSIGN COMPONENT`, RTTS/RTTI | Track-2 또는 고급 | CH06-L04는 typed `LOOP ... ASSIGNING <fs>` 기초만 다루는 것이 맞다. 하지만 본격 Field Symbol 단계에서는 `TYPE any`, `ANY TABLE`, dynamic assignment, RTTS/RTTI 소유 장이 필요하다. CH20/CH26에서 회수되지 않음 | 정밀 판정 필요 |
| CH06 | Header Line | CH12 SELECT-OPTIONS/RANGES에서 회수 | CH06에서는 obsolete internal table header line 인식용이 맞지만, `SELECT-OPTIONS`와 `RANGES`는 header-line 계열 모양을 이해해야 한다. 현재 v3 CH12에서 `SELECT-OPTIONS`, `TABLES`, `RANGES`, header line 없는 `TYPE RANGE OF` 대비가 반영됨 | 정상 회수 |
| CH06 | Deep Structure DB/ALV 제약 | CH07/CH17/CH21 | 후속 장에서 데이터 저장/ALV로 확장 | 정상 회수 |
| CH06 | modern `VALUE #( FOR )` | CH18 | CH18 확장 후 회수 | 정상 회수 |
| CH07 | Open SQL `SELECT` | CH08 | 회수 | 정상 회수 |
| CH07 | DML, COMMIT/ROLLBACK | CH24 | 회수 | 정상 회수 |
| CH07 | SE16N, TMG/SM30 | CH14 | 회수 | 정상 회수 |
| CH08 | Modern Open SQL | CH19 | 회수 | 정상 회수 |
| CH08 | JOIN/GROUP/ORDER | CH13 | 회수 | 정상 회수 |
| CH08 | SELECT-OPTIONS/Range | CH12 | 회수 | 정상 회수 |
| CH08 | MESSAGE 심화 | CH15 | 회수 | 정상 회수 |
| CH08 | 성능 심화 | CH32 | 후속 원본 존재 | 예정 회수 |
| CH08 | DB 변경 | CH24 | 회수 | 정상 회수 |
| CH09 | 직접 F4 구현: selection screen value-request | CH15 | CH15 `AT SELECTION-SCREEN ON VALUE-REQUEST`와 `F4IF_INT_TABLE_VALUE_REQUEST` 회수 확인 | 정상 회수 |
| CH09 | 직접 F4 구현: dynpro `PROCESS ON VALUE-REQUEST` | CH16 | CH16 v3에서 `PROCESS ON VALUE-REQUEST` 본문 회수 확인 안 됨 | 정밀 판정 필요 |
| CH09 | DB 변경/Transaction/MESSAGE/JOIN/성능 | CH24/CH15/CH13/CH32 | 후속 배치 명확 | 정상 또는 예정 회수 |
| CH10 | 객체 생성, instance 설계, 상속, interface, class-based exception | CH20 | 회수 | 정상 회수 |
| CH10 | RFC/BAPI/update task/background | CH30, CH24, CH35 | 후속 배치 명확 | 정상 또는 예정 회수 |
| CH10 | SQL 집계 | CH13 | 회수 | 정상 회수 |
| CH11 | OO 이론, class-based exception | CH20 | 회수 | 정상 회수 |
| CH11 | Grid ALV, SALV 심화, ALV event/editing | CH17, CH21, CH27/CH28 | CH17/CH21 회수, CH27/CH28 예정 | 정상 또는 예정 회수 |
| CH11 | 범위 조건과 Selection Screen | CH12/CH15 | 회수 | 정상 회수 |
| CH12 | Selection screen 심화 옵션 | CH15 | v3 CH15-L10/L11에서 `MEMORY ID`, `MODIF ID`, `NO-EXTENSION`, `NO INTERVALS`, variant 회수 확인 | 정상 회수 |
| CH12 | Modern SQL host marker | CH19 | 회수 | 정상 회수 |
| CH12 | `TABLES`, `RANGES`, SELECT-OPTIONS selection table 모양 | classic selection screen 필수 인식 | `TABLES dbtab`은 `SELECT-OPTIONS ... FOR dbtab-field`의 Dictionary 필드 참조를 위해 읽어야 하고, `RANGES`는 화면 없이 range table을 선언하는 레거시 방식으로 `TYPE RANGE OF`와 대비해야 한다. 현재 v3 CH12에서 회수됨 | 정상 회수 |
| CH13 | SQL expression `CASE/CAST/COALESCE` | CH19 | 회수 | 정상 회수 |
| CH13 | CTE, window function, path expression, set operation, subquery | CH19 또는 고급 SQL이어야 하나 CH19에서 입문 범위 밖으로 다시 보류 | 후속 SQL 전용 챕터 없음 | 정밀 판정 필요 |
| CH13 | CDS/View Entity | CH22 | 회수 | 정상 회수 |
| CH13 | DB 변경 | CH24 | 회수 | 정상 회수 |
| CH14 | CDS DDL | CH22 | 회수 | 정상 회수 |
| CH14 | LUW, Lock Object, 복잡한 validation | CH24/CH25 | 회수 | 정상 회수 |
| CH14 | Search Help exit, 동적 F4 제어 | 후속 심화 | selection screen F4는 CH15에서 회수, dynpro value-request는 CH16에서 미회수 | 정밀 판정 필요 |
| CH14 | SE16N 운영 편집 우회 | 조회/검증 도구로만 사용 | 위험 기능이라 교육 범위 제외 타당 | 의도 제외 |
| CH15 | Dynpro 심화 | CH16 | 회수 | 정상 회수 |
| CH15 | exception 심화 | CH20 | 회수 | 정상 회수 |
| CH15 | batch job 심화 | CH35 | 후속 원본 존재 | 예정 회수 |
| CH15 | DML/Grid ALV 심화 | CH24, CH17/21/27/28 | 후속 배치 명확 | 정상 또는 예정 회수 |
| CH16 | Table Control | 커리큘럼 명시 제외, ALV로 대체 | `.project-docs/09`에서 제외 확정, CH17 ALV로 대체 | 의도 제외 |
| CH16 | `TABLES dbtab` 기반 Dynpro 화면-프로그램 데이터 교환 | Screen Programming 필수 classic 키워드 | CH12/CH15의 selection screen `TABLES`와 별개로, Screen Painter에서 Dictionary 구조 기반 화면 요소를 만들 때 program 쪽 table work area와 화면 field가 연결되는 원리를 설명해야 한다. CH16 v3 본문에서는 직접 회수 확인 안 됨 | 정밀 판정 필요 |
| CH16 | `TYPE REF TO`, `CREATE OBJECT` 선행 사용 | CH20 | 회수 | 정상 회수 |
| CH16 | 저장/lock/LUW | CH24/CH25 | 회수 | 정상 회수 |
| CH16 | Grid ALV 구현 | CH17 | 회수 | 정상 회수 |
| CH17 | modern syntax, `NEW` | CH18/CH20 | 회수 | 정상 회수 |
| CH17 | 셀 색상/style/stable refresh | CH21 | 회수 | 정상 회수 |
| CH17 | ALV event/editing | CH27/CH28 | 후속 원본 존재 | 예정 회수 |
| CH17 | 데이터 변경, lock, LUW | CH24/CH25 | 회수 | 정상 회수 |
| CH18 | SQL inline/host marker | CH19 | 회수 | 정상 회수 |
| CH18 | OO/exception 본격 | CH20 | 회수 | 정상 회수 |
| CH18 | `COND`, `SWITCH`, `REDUCE`, `FILTER`, `CONV`, `EXACT` | 원래 누락, 사용자 지적으로 CH18에 보강 | 현재 v3 CH18에서 회수 완료 | 정상 회수 |
| CH18 | `LET`, `THROW` 포함 복잡한 expression | CH18에서 읽기 가능한 기본형만 다룸 | 후속 New Syntax 전용 장 없음 | 정밀 판정 필요 |
| CH19 | OO, exception, CDS, RAP, DML, Lock | CH20, CH22, CH23, CH24, CH25 | 회수 | 정상 회수 |
| CH19 | Native SQL/ADBC | CH33 | 후속 원본 존재 | 예정 회수 |
| CH19 | window expression, CTE, set operation, 복잡한 subquery | 입문 범위 밖 | 후속 SQL 전용 장 없음. CH32/CH33은 성능/Pushdown이지 ABAP SQL 고급 문법 장이 아님 | 정밀 판정 필요 |
| CH20 | 실제 저장/취소 처리 | CH24 | 회수 | 정상 회수 |
| CH20 | CDS/RAP | CH22/CH23 | 회수 | 정상 회수 |
| CH20 | ALV event | CH21/CH27 | CH21 일부, CH27 예정 | 정상 또는 예정 회수 |
| CH20 | OO 고급 패턴 | CH26 | 회수 | 정상 회수 |
| CH20 | `FRIENDS`, `ALIASES`, RTTI/RTTC, T100 예외 텍스트 | 기본 범위 밖 | CH26에서도 회수되지 않음. 고급 OO/예외 소유 불명 | 정밀 판정 필요 |
| CH21 | ALV double click/hotspot/toolbar/user command | CH27 | 후속 원본 존재 | 예정 회수 |
| CH21 | editable grid 검증/저장 | CH28 | 후속 원본 존재 | 예정 회수 |
| CH21 | 실제 저장/취소, CDS/RAP, 성능 | CH24, CH22/23, CH32 | 후속 배치 명확 | 정상 또는 예정 회수 |
| CH22 | RAP BDEF/BIMP, Service | CH23 | 회수 | 정상 회수 |
| CH22 | CUD/transaction/lock | CH24/CH25 | 회수 | 정상 회수 |
| CH22 | advanced composition/to-parent association | RAP/Track-2 심화 | CH36 capstone에서 일부 RAP 구조 회수 가능. 명시 소유는 약함 | 정밀 판정 필요 |
| CH22 | Clean Core 운영 상세 | CH23/CH35/CH36 | 후속 배치 존재 | 예정 회수 |
| CH23 | SQL DML/LUW/Lock | CH24/CH25 | 회수 | 정상 회수 |
| CH23 | Draft, authorization master | CH36 | 후속 원본에서 Draft/Auth 회수 확인 | 예정 회수 |
| CH23 | Gateway 운영 | CH31 | 후속 원본 존재 | 예정 회수 |
| CH23 | communication arrangement, package release contract | 후속 운영/ABAP Cloud 심화 | 명확한 v3 소유 불명 | 정밀 판정 필요 |
| CH23 | unmanaged save, saver class, complex EML modify/commit | RAP 심화 | CH36에서 `MODIFY ENTITIES` 일부 회수. `COMMIT ENTITIES`/`ROLLBACK ENTITIES`와 saver/unmanaged 소유는 불명 | 정밀 판정 필요 |
| CH24 | Lock Object | CH25 | 회수 | 정상 회수 |
| CH24 | BAPI/RFC | CH30 | 후속 원본 존재 | 예정 회수 |
| CH24 | Application Log/BAL/SLG1 | CH35 | 후속 원본 존재 | 예정 회수 |
| CH24 | RAP `MODIFY/COMMIT/ROLLBACK ENTITIES` | RAP/ABAP Cloud 후속 심화 | CH36에 `MODIFY ENTITIES` 일부 존재. `COMMIT/ROLLBACK ENTITIES` 소유 불명 | 정밀 판정 필요 |
| CH24 | ALV edit event 저장 | CH28 | 후속 원본 존재 | 예정 회수 |
| CH24 | 병렬 처리/성능 튜닝 | CH32 | 후속 원본 존재 | 예정 회수 |
| CH25 | ALV edit event, BAPI/RFC, 병렬 처리 | CH28, CH30, CH32 | 후속 원본 존재 | 예정 회수 |
| CH25 | RAP ETag/BDEF lock 구현 | RAP/ABAP Cloud 심화 | CH36에 `lock master`, Draft/Auth는 있으나 ETag 회수는 확인 안 됨 | 정밀 판정 필요 |
| CH25 | enqueue server 운영, SM12 장애 복구 | 운영 심화 | CH25에서 SM12 확인은 다룸. 장애 복구/운영 정책 소유 불명 | 정밀 판정 필요 |
| CH25 | multi-table lock object 고급 설계 | CH25에서는 간접 언급 | 후속 소유 불명 | 정밀 판정 필요 |
| CH26 | `COND`, `SWITCH`, `REDUCE` | CH18 확장 후 학습분이나 패턴 설명력 때문에 사용 축소 | 이제 미학습 때문이 아니라 교수 설계 선택 | 정상 회수 |
| CH26 | ALV 고급 event/editable save | CH27/CH28 | 후속 원본 존재 | 예정 회수 |
| CH26 | DI container, reflection factory | 고급 framework 영역 | 본 커리큘럼 핵심 흐름은 아님 | 의도 제외 |
| CH26 | ABAP Test Double Framework, `TEST-SEAM`, `TEST-INJECTION` | ABAP Unit 심화 | CH35는 ABAP Unit 운영 회수지만 해당 상세 API 회수 증거 없음 | 정밀 판정 필요 |
| CH26 | BRF+ rule engine | 별도 룰 엔진/운영 범위 | CH34는 BRF+ Output Management 언급만 존재. rule engine 자체 소유 불명 | 정밀 판정 필요 |

## 4. 정밀 판정 필요 후보

아래 항목은 1차 감사에서 "CH26의 `COND` 사례와 같은 구조적 갭이 될 수 있음"으로 분류한다. 이 문서는 확정 재작업 지시가 아니며, 다음 단계에서 후보별로 공식 문서와 전체 커리큘럼 목표를 대조해야 한다.

| 우선순위 | 후보 | 감지 위치 | 문제 형태 | 2차 확인 질문 |
|---|---|---|---|---|
| P1 | Dynpro 직접 F4 `PROCESS ON VALUE-REQUEST` | CH09가 CH16으로 넘김, CH16 v3 본문 미회수 | 후속으로 지정했지만 해당 후속 장에서 빠진 가능성 | CH16에 PAI/PBO와 함께 POV/POH를 최소 설명해야 하는가? |
| P1 | CH19 고급 Modern SQL: CTE, window expression, set operation, subquery | CH13/CH19에서 보류 | CH19가 유일한 Modern SQL 장인데 후속 SQL 전용 장이 없음 | 입문 커리큘럼에서 최소 소개 또는 "고급 제외" 명시로 충분한가? |
| P1 | RAP EML transaction: `MODIFY ENTITIES`, `COMMIT ENTITIES`, `ROLLBACK ENTITIES` | CH23/CH24 보류, CH36 일부 `MODIFY`만 존재 | RAP 입문 이후 실무 capstone 전까지 외부 EML/save 흐름 소유 불명 | CH36 또는 CH23 보강으로 `COMMIT/ROLLBACK ENTITIES` 경계를 가르쳐야 하는가? |
| P2 | CH18 `LET`, `THROW` expression | CH18에서 복잡한 expression으로 보류 | New Syntax 유일 장에서 빠질 수 있는 항목 | `COND/SWITCH/REDUCE`처럼 핵심 소개가 필요한가, 아니면 예외/과밀 표현으로 제외가 맞는가? |
| P2 | OO 고급 언어 요소: `FRIENDS`, `ALIASES`, RTTI/RTTC, T100 예외 텍스트 | CH20 보류, CH26 미회수 | OO 기본/고급 사이에 소유 장 없음 | CH26이나 별도 고급 OO 부록에 최소 설명이 필요한가? |
| P2 | ABAP Test Double Framework, `TEST-SEAM`, `TEST-INJECTION` | CH26 보류 | CH35는 ABAP Unit 운영만 회수 예정 | CH26-L05 또는 CH35-L02에서 "언제 쓰는 테스트 대체 도구인가"를 소개해야 하는가? |
| P2 | RAP Draft/Auth 고급 중 ETag/BDEF lock | CH23/CH25 보류, CH36 Draft/Auth 존재 | ETag는 CH36 원본 검색에서 회수 확인 안 됨 | CH25의 optimistic 설명과 CH36 RAP 운영 사이에 ETag 최소 설명이 필요한가? |
| P3 | Search Help exit / dynpro 동적 F4 제어 | CH14 보류, CH15 selection-screen F4만 회수 | 동적 F4의 dynpro 측 회수 불명 | P1의 `PROCESS ON VALUE-REQUEST`와 묶어 CH16 보강 여부 판단 |
| P1 | generic Field Symbol / generic type / dynamic `ASSIGN` / RTTS | CH06은 typed Field Symbol 기초만 다룸, `.project-docs/09`는 Track-2로만 표기 | 본격 Field Symbol을 가르칠 소유 챕터가 없음. `TYPE any`, `ANY TABLE`, `FIELD-SYMBOLS <fs> TYPE any`, `ASSIGN COMPONENT`, `ASSIGN (name)`, RTTS/RTTI가 한 묶음으로 남음 | 신규 장을 만들어야 하는가? 권장 위치는 CH26과 현 CH27 사이 |
| P1 | `TABLES dbtab` for Dynpro Dictionary screen fields | CH16 Screen Programming | `TABLES`가 selection screen `FOR` 참조로는 CH12에서 다뤄졌지만, Dynpro 화면과 프로그램 간 데이터 교환용 table work area 설명이 CH16에 없음 | CH16-L03 또는 신규 CH16 보강 레슨에서 Screen Painter DDIC field와 `TABLES` 연결을 설명해야 하는가? |
| P2 | regex/SUBMATCHES advanced string processing | CH04에서 FIND/REPLACE 기초 후 보류 | 후속 문자열 심화 장이 없음. PCRE/REGEX, MATCH COUNT/OFFSET/LENGTH, SUBMATCHES, RESULTS, CL_ABAP_REGEX가 실무 로그/텍스트 검증에서 필요 | 신규 문자열 심화 장을 만들거나, 동적/제네릭 ABAP 신규 장의 후반 레슨으로 묶을 것인가? |
| P3 | BRF+ rule engine | CH26 보류, CH34는 Output Management 맥락 | rule engine 자체 소유 불명 | CH34 출력 결정 설명만으로 충분한가, 별도 룰 엔진 소개가 필요한가? |
| P3 | communication arrangement, package release contract | CH23 보류 | ABAP Cloud 운영 세부 소유 불명 | CH35/CH36 운영 마감에서 최소 개념을 회수해야 하는가? |

## 4.1 P1 정밀 판정 결과

> 시작일: 2026-07-03 KST
> 범위: section 4의 P1 후보만 판정. P2/P3는 이 단계에서 확정하지 않는다.

P1은 단순 "나중에 언급하면 좋음"이 아니라, 공식 문서상 독립 키워드와 실행 모델이 있고 현재 커리큘럼 안에서 소유 위치가 없거나 후속 장에서 빠진 항목이다. 따라서 P1 판정은 "본문 보강 필요", "신규 장 필요", "명시 제외 가능" 중 하나로 확정한다.

| P1 후보 | 공식문서 수동 확인 | 정밀 판정 | 필요한 조치 |
|---|---|---|---|
| Dynpro 직접 F4 `PROCESS ON VALUE-REQUEST` | `C:\ABAP_DOCU_HTML\abenabap_dynpros_value_help.htm`, `abenabap_dynpros_value_help_mod.htm`, `abenabap_dynpros_field_help.htm`, `abenabap_dynpro_call_dialog_mod.htm` 확인 | **보강 필요**. CH09/CH14가 CH16으로 넘긴 것이 맞고, CH16이 Screen Programming 장이므로 여기서 회수해야 한다. 신규 장은 불필요 | CH16에 신규 레슨 또는 L03/L04 보강. `PROCESS ON VALUE-REQUEST`, `PROCESS ON HELP-REQUEST`, `FIELD field MODULE mod`, Dictionary F4와 직접 F4의 우선순위, POV 시점의 화면값 읽기/반영 주의(`DYNP_VALUES_READ`/`DYNP_VALUES_UPDATE` 또는 F4 FM 호출 설계)를 다룬다 |
| CH19 고급 Modern SQL: CTE, window expression, set operation, subquery | `C:\ABAP_DOCU_HTML\abapwith_subquery.htm`, `abapwindow.htm`, `abapunion.htm`, `abenwhere_logexp_subquery.htm`, `abenselect_cte_hierarchy.htm` 확인 | **신규 고급 SQL 장 필요**. CH19 마지막에 "고급 SQL 지도"만 넣는 것은 가능하지만, CTE/window/set/subquery를 충분히 가르치기에는 CH19가 과밀해진다 | 권장 신규 장은 `Advanced ABAP SQL`. 위치는 **CH19와 현 CH20 사이**가 가장 자연스럽다. CH19에서 Modern SQL 기본 문법을 배운 직후, OO로 넘어가기 전에 SQL 고급 표현을 정리한다. 최소 레슨: CTE/WITH, subquery/EXISTS, UNION/INTERSECT/EXCEPT, window expression, SQL식 성능/가독성 경계, 실습 |
| RAP EML transaction: `MODIFY ENTITIES`, `COMMIT ENTITIES`, `ROLLBACK ENTITIES` | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABAPMODIFY_ENTITY_ENTITIES.md`, `ABAPCOMMIT_ENTITIES.md`, `ABAPROLLBACK_ENTITIES.md`, `ABAPEML_RESPONSE.md`, `ABENRAP_SAVE_SEQ_GLOSRY.md` 확인 | **보강 필요**. RAP 입문과 capstone 사이에서 반드시 회수해야 한다. 별도 신규 장보다는 CH23/CH36 분담이 적절 | CH23에는 consumer/provider, `IN LOCAL MODE`, transactional buffer, `FAILED`/`REPORTED` 개념을 최소 지도화한다. CH36 capstone에는 일반 ABAP consumer 관점의 `MODIFY ENTITIES` + `COMMIT ENTITIES` + 실패 시 `ROLLBACK ENTITIES` 흐름을 실습으로 넣는다. Behavior pool 내부에서 `COMMIT/ROLLBACK ENTITIES`를 호출하지 않는 경계도 명시한다 |
| generic Field Symbol / generic type / dynamic `ASSIGN` / RTTS | `C:\ABAP_DOCU_HTML\abapfield-symbols.htm`, `abapassign_dynamic_components.htm`, `abapassign_mem_area_dynamic_dobj.htm`, `abapcreate_data.htm`, `abapcreate_data_handle.htm`, `abenrtti.htm`, `abencase_type_of_rtti_abexa.htm` 확인 | **신규 장 필수**. CH06은 typed Field Symbol 기초만 다루는 것이 맞고, CH20/CH26도 이 주제를 흡수하기 어렵다 | 신규 장 위치는 **CH26과 현 CH27 사이**. 제목 후보는 `Dynamic ABAP: Field Symbol 심화와 Generic Programming`. 기존 CH27~CH36 번호는 삽입 정책에 따라 뒤로 밀리는 것을 전제로 검토한다 |
| `TABLES dbtab` for Dynpro Dictionary screen fields | `C:\ABAP_DOCU_HTML\abaptables.htm`, `abenabap_dynpros_fields.htm`, `abenabap_dynpros_processing.htm` 확인 | **보강 필요**. CH12의 `SELECT-OPTIONS ... FOR`용 `TABLES`와 다른 목적이다. Screen Painter에서 Dictionary 기반 화면 요소를 만들면 program 쪽 table work area와 화면 field 연결을 이해해야 한다 | CH16-L03 또는 신규 CH16 레슨에서 `TABLES dbtab`이 Dictionary structure와 같은 모양의 table work area를 선언한다는 점, 화면 field 이름과 프로그램 data object 연결, PBO/PAI 전송 감각, class 안에서는 쓰지 않는 classic 경계를 설명한다 |

P1 정밀 판정의 결론은 다음과 같다.

1. CH16은 **두 가지 보강**이 필요하다: Dynpro POV/POH와 Dynpro용 `TABLES dbtab`.
2. CH19는 고급 SQL을 모두 흡수하기 어렵다. **CH19와 현 CH20 사이에 고급 ABAP SQL 신규 장**을 두는 것이 가장 자연스럽다.
3. RAP EML transaction은 신규 장보다 **CH23 개념 지도 + CH36 capstone 실습**으로 회수하는 것이 맞다.
4. generic Field Symbol과 RTTS/RTTI는 **CH26과 현 CH27 사이 신규 장**이 필요하다.

## 5. 현재 기준으로 재작업 불필요한 대표 항목

| 항목 | 이유 |
|---|---|
| CH26 `COND`, `SWITCH`, `REDUCE` 미사용 | CH18 확장 후 미학습 문제가 해소됐다. CH26에서 `CASE`를 유지하는 것은 문법 누락이 아니라 패턴 설명력 우선 선택이다. |
| Table Control | `.project-docs/09_CURRICULUM_LEDGER.md`에서 "ALV로 대체, 제외"가 확정되어 있다. |
| classic interactive list | 원장상 완전 제외 결정이 있다. ALV 동기만으로 충분하다는 정책이다. |
| `EDIT MASK` | CH01 입문 출력 범위에서는 niche로 제외했다. `WRITE TO`는 CH04에서 회수되어 구조적 누락이 아니다. |
| `int8`, `decfloat` | 초급 타입 장에서 제외할 수 있다. 금액과 정밀도 주의는 CH02/CH04에서 이미 다룬다. |
| BAPI/RFC, Application Log, AMDP/ADBC, Forms/Output | CH30, CH35, CH33, CH34 후속 원본 장이 명확하다. |

## 6. 1차 결론

CH01~CH26 v3의 R15 보류는 대체로 정상적으로 회수되었다. 특히 CH01~CH17 classic-first 구간에서 금지된 modern syntax, modern SQL, OO 본격 개념은 CH18~CH20에서 순차 회수되며, CH21~CH26의 실무 주제도 CH27~CH36 후속 원본 장으로 연결된다.

다만 CH26의 `COND` 사례와 같은 구조적 갭 가능성이 남은 항목이 있다. 1차 감사 기준 최우선 후보는 다음 항목이다.

1. generic Field Symbol, generic type, dynamic `ASSIGN`, `ASSIGN COMPONENT`, RTTS/RTTI를 담당할 신규 advanced language 장이 필요하다. 권장 위치는 CH26과 현 CH27 사이이다.
2. CH16 Screen Programming에서 `TABLES dbtab` 기반 Dictionary screen field와 program data object 연결 설명이 빠졌을 가능성이 있다.
3. CH09/CH14에서 후속으로 넘긴 Dynpro value-request가 CH16 v3에서 회수되지 않은 가능성.
4. CH19가 유일한 Modern SQL 장인데 CTE/window/set operation/subquery를 모두 "입문 범위 밖"으로 보류한 문제.
5. RAP EML의 `MODIFY/COMMIT/ROLLBACK ENTITIES`와 unmanaged/saver/Draft/ETag 경계가 CH23, CH24, CH25, CH36 사이에서 충분히 회수되는지 불명확한 문제.

## 6.1 신규 장 배치 검토 메모

사용자 추가 검토 결과, 신규 장이 가장 필요한 항목은 "generic Field Symbol + generic type + dynamic assignment + RTTS/RTTI"이다. CH02는 표준 타입 입문이므로 generic type을 넣기에는 너무 이르다. CH06은 internal table을 배우는 시점이라 typed `LOOP ... ASSIGNING <fs>`까지만 다루는 것이 맞다. 하지만 이후 본격 Field Symbol을 가르치지 않으면 `TYPE any`, `ANY TABLE`, dynamic `ASSIGN`, RTTS/RTTI가 영구 누락된다.

권장 위치는 **CH26과 현 CH27 사이**이다.

| 후보 위치 | 판단 | 이유 |
|---|---|---|
| CH06 직후 | 부적합 | internal table 직후의 학습자는 generic typing, runtime type, dynamic assignment를 받아들이기 어렵다. CH06에는 typed Field Symbol 경계만 둔다. |
| CH20 직후 | 가능하나 차선 | `REF TO`, `CREATE DATA`, exception, class 기반 문맥을 배운 뒤라 기술적으로 가능하다. 다만 CH21~CH23의 ALV/CDS/RAP Track-1 마무리 흐름을 끊는다. |
| CH26과 현 CH27 사이 | 권장 | CH20 OO 기본, CH24 DML, CH25 Lock, CH26 OO 고급 설계를 지나 고급 언어 도구를 다룰 준비가 된다. 이후 ALV event/editing, enhancement, interface, file/BDC 실무에서 동적 코드와 generic 처리의 필요성을 이해하기 좋다. |

권장 신규 장 초안:

| 신규 장 | 제목 후보 | 핵심 레슨 |
|---|---|---|
| 신규 CH27 | Dynamic ABAP: Field Symbol 심화와 Generic Programming | L01 typed vs generic Field Symbol, L02 `TYPE any`/`ANY TABLE`/generic formal parameter, L03 `ASSIGN`/`UNASSIGN`/`IS ASSIGNED`, L04 `ASSIGN COMPONENT`, L05 `ASSIGN (name)`과 보안/덤프 위험, L06 `REF TO data`와 `CREATE DATA`, L07 RTTS/RTTI로 구조와 타입 읽기, L08 실습: 동적 구조 검사기 |

regex/SUBMATCHES는 두 가지 선택지가 있다.

| 선택지 | 판단 |
|---|---|
| 신규 CH28 `Advanced String Processing and Regex` | 가장 깔끔하다. `FIND PCRE`, `REPLACE PCRE`, `MATCH COUNT/OFFSET/LENGTH`, `SUBMATCHES`, `RESULTS`, `CL_ABAP_REGEX`, 로그/이메일/코드 패턴 검증을 체계적으로 다룰 수 있다. |
| 신규 Dynamic ABAP 장의 후반 레슨으로 통합 | 장 수 증가를 줄일 수 있다. 다만 regex는 type/dynamic programming과 성격이 달라 한 장 안에서 초점이 흐려질 수 있다. |

현재 감사 기준 권고는 **동적/제네릭 ABAP 신규 장은 필수**, regex/SUBMATCHES는 **별도 문자열 심화 장을 우선 검토**이다.

이 문서는 1차 후보 수집 결과이며, P1은 section 4.1에서 정밀 판정을 시작했다. 다음 단계는 P1 판정에 따른 실제 챕터 재설계 지시서를 만들고, P2/P3 후보도 같은 방식으로 "보강 필요", "명시 제외", "후속 v3 작성 시 확인" 중 하나로 확정하는 것이다.

## 7. 검증 메모

다음 검색을 수행해 감사표를 만들었다.

```text
rg R15/보류/후속/경계 후보 in reference/codex_0629_v3 CH01~CH26
rg 후보 키워드 in content/abap CH27~CH36, .project-docs, reference/codex_0625_v2
Get-ChildItem content/abap CH01~CH36 _chapter.md title 추출
rg --files / targeted rg in C:\ABAP_DOCU_HTML for P1 official docs
rg --files / targeted rg in C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU for RAP EML official docs
```

감사 중 확인한 중요한 현재 상태:

- `reference/codex_0629_v3`에는 CH01~CH26의 `REWRITE`/`QA`가 존재한다.
- `content/abap`에는 CH27~CH36 원본 챕터가 존재한다.
- 기존 `.project-docs/11_KEYWORD_AUDIT.md`의 CH18 `COND/SWITCH/REDUCE` 보류 판단은 현재 v3 상태와 맞지 않는다. CH18 v3에서 이미 보강되었으므로 이후 감사에서는 현재 v3를 우선해야 한다.
