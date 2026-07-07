# 00_CONCEPT_GAP_AUDIT - R15 보류/후속 회수 1차 감사

> 작성일: 2026-07-03 KST
> 범위: `reference/codex_0629_v3`의 OLDCH01~OLDCH26 산출물
> 파일명 규칙: 기존 원본 장 번호는 `OLDCH`, 새 커리큘럼 장 번호는 `NEWCH`로 표기한다. 기존 장은 `NEWCH##_OLDCH##_REWRITE.md`/`NEWCH##_OLDCH##_QA.md`, 신규 장은 `NEWCH##_OLDCH99_REWRITE.md`/`NEWCH##_OLDCH99_QA.md`로 명명한다.
> 현재 적용 번호: OLDCH01~OLDCH19 -> NEWCH01~NEWCH19, `NEWCH20_OLDCH99`는 Advanced ABAP SQL 신규 장 작성 완료, OLDCH20~OLDCH26 -> NEWCH21~NEWCH27, `NEWCH28_OLDCH99`는 Dynamic ABAP 신규 장 작성 완료, `NEWCH29_OLDCH99`는 Advanced String Processing and Regex 신규 장 작성 완료, OLDCH27은 `NEWCH30_OLDCH27` ALV 고급 Event 장 작성 완료, OLDCH28은 `NEWCH31_OLDCH28` Editable Grid ALV와 입력 검증 장 작성 완료, OLDCH29는 `NEWCH32_OLDCH29` Enhancement / BAdI / User Exit 장 작성 완료, OLDCH30은 `NEWCH33_OLDCH30` 인터페이스 실무 장 작성 완료, OLDCH31은 `NEWCH34_OLDCH31` IDoc / ALE / Gateway 장 작성 완료, OLDCH34는 `NEWCH37_OLDCH34` Forms/Output/PDF 장 작성 완료, OLDCH35는 `NEWCH38_OLDCH35` 운영 품질 장 작성 완료, OLDCH36은 `NEWCH39_OLDCH36` RAP + Fiori Capstone 장 작성 완료.
> 표기 주의: 본문 표의 `CH##`는 원본 커리큘럼 장 번호를 뜻한다. 실제 v3 파일을 찾을 때는 `OLDCH##`를 기준으로 파일명을 확인한다.
> 목적: CH26의 `COND` 사례처럼 "선행 챕터에서 다뤘어야 하는 개념 누락"이 후속 챕터 품질을 낮추는지 1차로 전수 수집한다.
> 제한: 이 문서는 감사표다. CH별 원고 재작성은 하지 않는다.

## 1. 감사 기준

R15 기준은 "그 시점까지 배운 것만으로 이해하고 실습 가능해야 한다"이다. 따라서 후속 개념을 무조건 앞당기는 것도 오류이고, 반대로 해당 개념을 다룰 마지막 소유 챕터에서 빠뜨리는 것도 오류다.

이번 1차 감사의 판정은 다음 네 단계로 구분한다.

| 판정 | 의미 | 후속 조치 |
|---|---|---|
| 정상 회수 | 보류 사유가 명확하고 후속 OLDCH01~OLDCH26 안에서 실제 회수됨 | 재작업 불필요 |
| 예정 회수 | 보류 사유가 명확하고 OLDCH27~OLDCH36 원본/커리큘럼에 회수 위치가 있음 | 해당 후속 v3 작성 시 확인 |
| 의도 제외 | 커리큘럼에서 명시적으로 제외하거나 대체 경로를 확정함 | 재작업 불필요, 단 문서에 제외 이유 유지 |
| 정밀 판정 필요 | 후속 소유 챕터가 불명확하거나, 유일한 소유 챕터에서 빠진 가능성이 있음 | 2차 감사 또는 해당 챕터 재작업 후보 |

## 2. 사용한 근거

| 근거 | 확인 내용 |
|---|---|
| `.project-docs/04_CONVENTIONS.md` | R6 classic-first, R15 개념 노출 게이팅 |
| `.project-docs/09_CURRICULUM_LEDGER.md` | OLDCH01~OLDCH36 배치, OLDCH27~OLDCH36 후속 제목, 명시 제외 결정 |
| `.project-docs/11_KEYWORD_AUDIT.md` | 기존 키워드 감사. 단, CH18의 `COND/SWITCH/REDUCE` 보류 판단은 이번 사용자 지적으로 폐기 필요 |
| `content/abap/CH01~CH36` | 후속 회수 예정 여부 확인. 이 경로의 `CH##`는 원본 장 번호다 |
| `reference/codex_0629_v3/NEWCH##_OLDCH##` | 현재 v3 산출물의 실제 보류/회수 상태 |

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
| CH04 | regex/SUBMATCHES | 범위 밖 | `FIND`/`REPLACE` 기초는 CH04가 맞고, `PCRE/REGEX`, `MATCH OFFSET/LENGTH`, `SUBMATCHES`, `RESULTS`, `CL_ABAP_REGEX`는 `NEWCH29_OLDCH99` Advanced String Processing and Regex 신규 장에서 회수 완료 | 정상 회수 |
| CH04 | Selection screen 심화 | CH15 | 회수 | 정상 회수 |
| CH04 | Internal Table, FORM/FM/Method, TRY/CATCH | CH06, CH10/CH20 | 회수 | 정상 회수 |
| CH05 | modern `CORRESPONDING #( )` | CH18 | CH18에서 회수 | 정상 회수 |
| CH05 | Internal Table, Transparent Table | CH06, CH07 | 회수 | 정상 회수 |
| CH05 | `.APPEND` 표준 확장 심화 | 표준 확장 입구만 설명 | CH23 Clean Core 원칙을 거쳐 `NEWCH32_OLDCH29`에서 User Exit/Customer Exit, Enhancement Point/Section, BAdI, implicit/explicit 판단, Clean Core 기준으로 표준 직접 수정 금지와 공식 확장점 우선 원칙을 회수 완료 | 정상 회수 |
| CH06 | generic Field Symbol, generic type, dynamic `ASSIGN (name)`, `ASSIGN COMPONENT`, RTTS/RTTI | Track-2 또는 고급 | CH06-L04는 typed `LOOP ... ASSIGNING <fs>` 기초만 다루는 것이 맞다. 본격 Field Symbol 단계의 `TYPE any`, `ANY TABLE`, dynamic assignment, RTTS/RTTI는 `NEWCH28_OLDCH99` Dynamic ABAP 신규 장에서 회수 완료 | 정상 회수 |
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
| CH10 | RFC/BAPI/update task/background | CH30, CH24, CH35 | RFC/BAPI는 `NEWCH33_OLDCH30`에서 회수 완료. update task는 CH24, background job은 `NEWCH38_OLDCH35`에서 회수 완료 | 정상 회수 |
| CH10 | SQL 집계 | CH13 | 회수 | 정상 회수 |
| CH11 | OO 이론, class-based exception | CH20 | 회수 | 정상 회수 |
| CH11 | Grid ALV, SALV 심화, ALV event/editing | CH17, CH21, CH27/CH28 | CH17/CH21 회수, ALV event는 `NEWCH30_OLDCH27`에서 회수 완료, editable grid는 `NEWCH31_OLDCH28`에서 회수 완료 | 정상 회수 |
| CH11 | 범위 조건과 Selection Screen | CH12/CH15 | 회수 | 정상 회수 |
| CH12 | Selection screen 심화 옵션 | CH15 | v3 CH15-L10/L11에서 `MEMORY ID`, `MODIF ID`, `NO-EXTENSION`, `NO INTERVALS`, variant 회수 확인 | 정상 회수 |
| CH12 | Modern SQL host marker | CH19 | 회수 | 정상 회수 |
| CH12 | `TABLES`, `RANGES`, SELECT-OPTIONS selection table 모양 | classic selection screen 필수 인식 | `TABLES dbtab`은 `SELECT-OPTIONS ... FOR dbtab-field`의 Dictionary 필드 참조를 위해 읽어야 하고, `RANGES`는 화면 없이 range table을 선언하는 레거시 방식으로 `TYPE RANGE OF`와 대비해야 한다. 현재 v3 CH12에서 회수됨 | 정상 회수 |
| CH13 | SQL expression `CASE/CAST/COALESCE` | CH19 | 회수 | 정상 회수 |
| CH13 | CTE, window function, path expression, set operation, subquery | CH19 또는 고급 SQL이어야 하나 CH19에서 입문 범위 밖으로 다시 보류 | CTE/window/set/subquery는 `NEWCH20_OLDCH99` Advanced ABAP SQL에서 회수. path expression은 CDS/association 맥락으로 CH22 이후 경계 유지 | 정상 회수 |
| CH13 | CDS/View Entity | CH22 | 회수 | 정상 회수 |
| CH13 | DB 변경 | CH24 | 회수 | 정상 회수 |
| CH14 | CDS DDL | CH22 | 회수 | 정상 회수 |
| CH14 | LUW, Lock Object, 복잡한 validation | CH24/CH25 | 회수 | 정상 회수 |
| CH14 | Search Help exit, 동적 F4 제어 | 후속 심화 | selection screen F4는 CH15에서 회수, dynpro value-request는 CH16에서 미회수 | 정밀 판정 필요 |
| CH14 | SE16N 운영 편집 우회 | 조회/검증 도구로만 사용 | 위험 기능이라 교육 범위 제외 타당 | 의도 제외 |
| CH15 | Dynpro 심화 | CH16 | 회수 | 정상 회수 |
| CH15 | exception 심화 | CH20 | 회수 | 정상 회수 |
| CH15 | batch job 심화 | CH35 | `NEWCH38_OLDCH35` L04에서 Background Job, SM36/SM37, `JOB_OPEN`, `SUBMIT ... VIA JOB ... AND RETURN`, `JOB_CLOSE` 흐름으로 회수 완료 | 정상 회수 |
| CH15 | DML/Grid ALV 심화 | CH24, CH17/21/27/28 | DML은 CH24, Grid ALV 표시/이벤트는 CH17/21/`NEWCH30_OLDCH27`, editable grid 입력/저장은 `NEWCH31_OLDCH28`에서 회수 완료 | 정상 회수 |
| CH16 | Table Control | 커리큘럼 명시 제외, ALV로 대체 | `.project-docs/09`에서 제외 확정, CH17 ALV로 대체 | 의도 제외 |
| CH16 | `TABLES dbtab` 기반 Dynpro 화면-프로그램 데이터 교환 | Screen Programming 필수 classic 키워드 | CH12/CH15의 selection screen `TABLES`와 별개로, Screen Painter에서 Dictionary 구조 기반 화면 요소를 만들 때 program 쪽 table work area와 화면 field가 연결되는 원리를 설명해야 한다. CH16 v3 본문에서는 직접 회수 확인 안 됨 | 정밀 판정 필요 |
| CH16 | `TYPE REF TO`, `CREATE OBJECT` 선행 사용 | CH20 | 회수 | 정상 회수 |
| CH16 | 저장/lock/LUW | CH24/CH25 | 회수 | 정상 회수 |
| CH16 | Grid ALV 구현 | CH17 | 회수 | 정상 회수 |
| CH17 | modern syntax, `NEW` | CH18/CH20 | 회수 | 정상 회수 |
| CH17 | 셀 색상/style/stable refresh | CH21 | 회수 | 정상 회수 |
| CH17 | ALV event/editing | CH27/CH28 | ALV event는 `NEWCH30_OLDCH27`에서 double click/hotspot/toolbar/user command로 회수 완료. editable grid는 `NEWCH31_OLDCH28`에서 `data_changed`, Cell Style, `check_changed_data`로 회수 완료 | 정상 회수 |
| CH17 | 데이터 변경, lock, LUW | CH24/CH25 | 회수 | 정상 회수 |
| CH18 | SQL inline/host marker | CH19 | 회수 | 정상 회수 |
| CH18 | OO/exception 본격 | CH20 | 회수 | 정상 회수 |
| CH18 | `COND`, `SWITCH`, `REDUCE`, `FILTER`, `CONV`, `EXACT` | 원래 누락, 사용자 지적으로 CH18에 보강 | 현재 v3 CH18에서 회수 완료 | 정상 회수 |
| CH18 | `LET`, `THROW` 포함 복잡한 expression | `LET`은 CH18에서 expression 독해 기본형으로 회수, `THROW`는 CH20 예외 처리에서 회수 | 후속 New Syntax 전용 장 없음 | 정상 회수 |
| CH19 | OO, exception, CDS, RAP, DML, Lock | CH20, CH22, CH23, CH24, CH25 | 회수 | 정상 회수 |
| CH19 | Native SQL/ADBC | CH33 | 후속 원본 존재 | 예정 회수 |
| CH19 | window expression, CTE, set operation, 복잡한 subquery | 입문 범위 밖 | `NEWCH20_OLDCH99` Advanced ABAP SQL 신규 장에서 CTE/WITH, subquery/EXISTS, UNION/INTERSECT/EXCEPT, window expression 회수 완료 | 정상 회수 |
| CH20 | 실제 저장/취소 처리 | CH24 | 회수 | 정상 회수 |
| CH20 | CDS/RAP | CH22/CH23 | 회수 | 정상 회수 |
| CH20 | ALV event | CH21/CH27 | CH21 일부 체험 뒤 `NEWCH30_OLDCH27`에서 `FOR EVENT`, `SET HANDLER`, handler class로 본격 회수 완료 | 정상 회수 |
| CH20 | OO 고급 패턴 | CH26 | 회수 | 정상 회수 |
| CH20 | T100 예외 텍스트, `THROW` expression | CH20 예외 레슨에서 회수 | CH20 보강 완료 | 정상 회수 |
| CH20 | `FRIENDS`, `ALIASES`, RTTI/RTTC | 기본 범위 밖 | `FRIENDS`/`ALIASES`는 CH26, RTTI/RTTC는 `NEWCH28_OLDCH99` Dynamic ABAP 신규 장에서 회수 완료 | 정상 회수 |
| CH21 | ALV double click/hotspot/toolbar/user command | CH27 | `NEWCH30_OLDCH27`에서 `double_click`, `hotspot_click`, `toolbar`, `user_command`, `get_selected_rows`, `refresh_table_display` 회수 완료 | 정상 회수 |
| CH21 | editable grid 검증/저장 | CH28 | `NEWCH31_OLDCH28`에서 `fieldcat edit`, `register_edit_event`, `data_changed`, `add_protocol_entry`, `display_protocol`, `check_changed_data`, 저장 전 검증으로 회수 완료 | 정상 회수 |
| CH21 | 실제 저장/취소, CDS/RAP, 성능 | CH24, CH22/23, CH32 | 후속 배치 명확 | 정상 또는 예정 회수 |
| CH22 | RAP BDEF/BIMP, Service | CH23 | 회수 | 정상 회수 |
| CH22 | CUD/transaction/lock | CH24/CH25 | 회수 | 정상 회수 |
| CH22 | advanced composition/to-parent association | RAP/Track-2 심화 | `NEWCH39_OLDCH36` L02에서 root, composition, to-parent association 구조 지도로 회수 완료 | 정상 회수 |
| CH22 | Clean Core 운영 상세 | CH23/CH35/CH36 | `NEWCH39_OLDCH36` L09에서 released API, release contract, ATC 운영 체크리스트로 회수 완료 | 정상 회수 |
| CH23 | SQL DML/LUW/Lock | CH24/CH25 | 회수 | 정상 회수 |
| CH23 | Draft, authorization master | CH36 | `NEWCH39_OLDCH36` L04/L08에서 `with draft`, draft table, `authorization master`, DCL/BDEF 권한 분리로 회수 완료 | 정상 회수 |
| CH23 | Gateway 운영 | CH31 | `NEWCH34_OLDCH31`에서 Classic Gateway `SEGW`, `MPC_EXT`, `DPC_EXT`, `/IWFND/MAINT_SERVICE`, `$metadata`, `/IWFND/GW_CLIENT`, error log, `GET_ENTITYSET`/query option mapping으로 회수 완료 | 정상 회수 |
| CH23 | communication arrangement, package release contract | 후속 운영/ABAP Cloud 심화 | `NEWCH39_OLDCH36` L09에서 communication scenario/system/user/arrangement, released API, C0/C1/C2 release contract, ATC contract check로 회수 완료 | 정상 회수 |
| CH23 | unmanaged save, saver class, complex EML modify/commit | RAP 심화 | `NEWCH24_OLDCH23`에 consumer/provider, transactional buffer, `MODIFY ENTITIES` -> `COMMIT ENTITIES`/`ROLLBACK ENTITIES` 지도 보강 완료. unmanaged saver 상세는 심화로 유지 | 정상 회수 |
| CH24 | Lock Object | CH25 | 회수 | 정상 회수 |
| CH24 | BAPI/RFC | CH30 | `NEWCH33_OLDCH30`에서 BAPI Return/commit/rollback, RFC destination/communication_failure/system_failure/logging으로 회수 완료 | 정상 회수 |
| CH24 | Application Log/BAL/SLG1 | CH35 | `NEWCH38_OLDCH35` L05에서 BAL/SLG1, object/subobject, external number, message/context, 저장/조회 흐름으로 회수 완료 | 정상 회수 |
| CH24 | RAP `MODIFY/COMMIT/ROLLBACK ENTITIES` | RAP/ABAP Cloud 후속 심화 | CH23에서 개념 지도 보강 완료. `NEWCH39_OLDCH36` L06에서 외부 EML consumer 실행 실습으로 회수 완료 | 정상 회수 |
| CH24 | ALV edit event 저장 | CH28 | `NEWCH31_OLDCH28` L06에서 저장 직전 `check_changed_data`, 전체 검증, `MODIFY`, `COMMIT WORK`/`ROLLBACK WORK` 경계로 회수 완료 | 정상 회수 |
| CH24 | 병렬 처리/성능 튜닝 | CH32 | 후속 원본 존재 | 예정 회수 |
| CH25 | ALV edit event, BAPI/RFC, 병렬 처리 | CH28, CH30, CH32 | ALV edit event는 `NEWCH31_OLDCH28`에서 회수 완료. BAPI/RFC는 `NEWCH33_OLDCH30`에서 회수 완료. 병렬 처리/성능은 CH32 후속 원본에서 계속 회수 예정 | 정상 또는 예정 회수 |
| CH25 | RAP ETag/BDEF lock 구현 | RAP/ABAP Cloud 심화 | `NEWCH39_OLDCH36` L04/L08에서 `lock master`, `lock dependent`, `etag master`, `etag dependent`, `total etag`, Draft Resume optimistic phase로 회수 완료 | 정상 회수 |
| CH25 | enqueue server 운영, SM12 장애 복구 | 운영 심화 | CH25에서 SM12 확인은 다룸. 장애 복구/운영 정책 소유 불명 | 정밀 판정 필요 |
| CH25 | multi-table lock object 고급 설계 | CH25에서는 간접 언급 | 후속 소유 불명 | 정밀 판정 필요 |
| CH26 | `COND`, `SWITCH`, `REDUCE` | CH18 확장 후 학습분이나 패턴 설명력 때문에 사용 축소 | 이제 미학습 때문이 아니라 교수 설계 선택 | 정상 회수 |
| CH26 | ALV 고급 event/editable save | CH27/CH28 | ALV 고급 event 설계는 `NEWCH30_OLDCH27`에서 회수 완료. editable save는 `NEWCH31_OLDCH28`에서 회수 완료 | 정상 회수 |
| CH26 | DI container, reflection factory | 고급 framework 영역 | 본 커리큘럼 핵심 흐름은 아님 | 의도 제외 |
| CH26 | ABAP Test Double Framework, `TEST-SEAM`, `TEST-INJECTION` | ABAP Unit 심화 | `NEWCH38_OLDCH35` L02A에서 manual fake/mock, `CL_ABAP_TESTDOUBLE`, ABAP SQL/CDS Test Double Framework, `TEST-SEAM`/`TEST-INJECTION` 경계로 회수 완료 | 정상 회수 |
| CH26 | BRF+ rule engine | 별도 룰 엔진/운영 범위 | `NEWCH37_OLDCH34` L03에서 BRFplus를 Output Management의 rule framework 역할로 회수 완료. 전체 BRFplus authoring은 본 Track 범위 밖으로 명시 | 정상 회수 |

## 4. 정밀 판정 필요 후보

아래 항목은 1차 감사에서 "CH26의 `COND` 사례와 같은 구조적 갭이 될 수 있음"으로 분류한다. 이 문서는 확정 재작업 지시가 아니며, 다음 단계에서 후보별로 공식 문서와 전체 커리큘럼 목표를 대조해야 한다.

| 우선순위 | 후보 | 감지 위치 | 문제 형태 | 2차 확인 질문 |
|---|---|---|---|---|
| P1 | Dynpro 직접 F4 `PROCESS ON VALUE-REQUEST` | CH09가 CH16으로 넘김, CH16 v3 본문 미회수 | 후속으로 지정했지만 해당 후속 장에서 빠진 가능성 | CH16에 PAI/PBO와 함께 POV/POH를 최소 설명해야 하는가? |
| P1 | CH19 고급 Modern SQL: CTE, window expression, set operation, subquery | CH13/CH19에서 보류 | `NEWCH20_OLDCH99` Advanced ABAP SQL 신규 장으로 회수 완료 | 재작업 완료. 후속 작업 시 CH19와 NEWCH21 사이 연결만 유지 |
| P1 | RAP EML transaction: `MODIFY ENTITIES`, `COMMIT ENTITIES`, `ROLLBACK ENTITIES` | CH23/CH24 보류, CH36 일부 `MODIFY`만 존재 | CH23 개념 지도 보강 완료. `NEWCH39_OLDCH36` L06에서 외부 consumer 실행 실습 회수 완료 | 재작업 완료. 일반 ABAP consumer 관점의 `MODIFY` + `COMMIT` + 실패 시 `ROLLBACK` 흐름을 반영 |
| P2 | CH18 `LET`, `THROW` expression | CH18에서 복잡한 expression으로 보류 | New Syntax 유일 장에서 빠질 수 있는 항목 | `COND/SWITCH/REDUCE`처럼 핵심 소개가 필요한가, 아니면 예외/과밀 표현으로 제외가 맞는가? |
| P2 | OO 고급 언어 요소: `FRIENDS`, `ALIASES`, RTTI/RTTC, T100 예외 텍스트 | CH20 보류 | `FRIENDS`/`ALIASES`는 `NEWCH27_OLDCH26` CH26 보강으로 회수 완료. RTTI/RTTC는 `NEWCH28_OLDCH99`, T100 예외 텍스트는 CH20 예외 보강에서 회수 완료 | 재작업 완료. 후속 CH35 test double 보강과는 별도 |
| P2 | ABAP Test Double Framework, `TEST-SEAM`, `TEST-INJECTION` | CH26 보류 | `NEWCH38_OLDCH35` L02A에서 ABAP Unit 운영 장의 테스트 대체 도구로 회수 완료 | 재작업 완료. CH26은 테스트 가능한 설계와 연결만 두고, CH35가 실제 도구 선택과 코드 확인을 맡는다 |
| P2 | RAP Draft/Auth 고급 중 ETag/BDEF lock | CH23/CH25 보류, CH36 Draft/Auth 존재 | `NEWCH39_OLDCH36` L04/L08에서 ETag/BDEF lock/Draft/Auth 회수 완료 | 재작업 완료. CH25 classic lock과 CH36 RAP 운영 사이의 pessimistic/optimistic 경계를 연결 |
| P3 | Search Help exit / dynpro 동적 F4 제어 | CH14 보류, CH15 selection-screen F4만 회수 | 동적 F4의 dynpro 측 회수 불명 | P1의 `PROCESS ON VALUE-REQUEST`와 묶어 CH16 보강 여부 판단 |
| P1 | generic Field Symbol / generic type / dynamic `ASSIGN` / RTTS | CH06은 typed Field Symbol 기초만 다룸, `.project-docs/09`는 Track-2로만 표기 | `NEWCH28_OLDCH99` Dynamic ABAP 신규 장으로 회수 완료. `TYPE any`, `ANY TABLE`, `FIELD-SYMBOLS <fs> TYPE any`, `ASSIGN COMPONENT`, `ASSIGN (name)`, `CREATE DATA`, RTTS/RTTI를 한 장으로 묶음 | 재작업 완료. 후속 NEWCH29 regex 신규 장과 기존 OLDCH27 ALV event 장 사이 연결만 유지 |
| P1 | `TABLES dbtab` for Dynpro Dictionary screen fields | CH16 Screen Programming | `TABLES`가 selection screen `FOR` 참조로는 CH12에서 다뤄졌지만, Dynpro 화면과 프로그램 간 데이터 교환용 table work area 설명이 CH16에 없음 | CH16-L03 또는 신규 CH16 보강 레슨에서 Screen Painter DDIC field와 `TABLES` 연결을 설명해야 하는가? |
| P2 | regex/SUBMATCHES advanced string processing | CH04에서 FIND/REPLACE 기초 후 보류 | `NEWCH29_OLDCH99` Advanced String Processing and Regex 신규 장으로 회수 완료. PCRE/REGEX, MATCH COUNT/OFFSET/LENGTH, SUBMATCHES, RESULTS, CL_ABAP_REGEX가 실무 로그/텍스트 검증에서 필요하다는 판단을 반영 | 재작업 완료. 이후 OLDCH27 ALV event 장과의 번호 연결만 유지 |
| P3 | BRF+ rule engine | CH26 보류, CH34는 Output Management 맥락 | `NEWCH37_OLDCH34`에서 Output Management의 출력 결정 역할로 회수 완료 | 재작업 완료. 독립 ABAP 장은 만들지 않고 CH34-L03 경계로 처리 |
| P3 | communication arrangement, package release contract | CH23 보류 | `NEWCH39_OLDCH36` L09에서 ABAP Cloud/서비스 운영 마감으로 회수 완료 | 재작업 완료. communication scenario/system/user/arrangement와 release contract 운영 체크리스트를 반영 |

## 4.1 P1 정밀 판정 결과

> 시작일: 2026-07-03 KST
> 범위: section 4의 P1 후보만 판정. P2/P3는 이 단계에서 확정하지 않는다.

P1은 단순 "나중에 언급하면 좋음"이 아니라, 공식 문서상 독립 키워드와 실행 모델이 있고 현재 커리큘럼 안에서 소유 위치가 없거나 후속 장에서 빠진 항목이다. 따라서 P1 판정은 "본문 보강 필요", "신규 장 필요", "명시 제외 가능" 중 하나로 확정한다.

| P1 후보 | 공식문서 수동 확인 | 정밀 판정 | 필요한 조치 |
|---|---|---|---|
| Dynpro 직접 F4 `PROCESS ON VALUE-REQUEST` | `C:\ABAP_DOCU_HTML\abenabap_dynpros_value_help.htm`, `abenabap_dynpros_value_help_mod.htm`, `abenabap_dynpros_field_help.htm`, `abenabap_dynpro_call_dialog_mod.htm` 확인 | **보강 필요**. CH09/CH14가 CH16으로 넘긴 것이 맞고, CH16이 Screen Programming 장이므로 여기서 회수해야 한다. 신규 장은 불필요 | CH16에 신규 레슨 또는 L03/L04 보강. `PROCESS ON VALUE-REQUEST`, `PROCESS ON HELP-REQUEST`, `FIELD field MODULE mod`, Dictionary F4와 직접 F4의 우선순위, POV 시점의 화면값 읽기/반영 주의(`DYNP_VALUES_READ`/`DYNP_VALUES_UPDATE` 또는 F4 FM 호출 설계)를 다룬다 |
| CH19 고급 Modern SQL: CTE, window expression, set operation, subquery | `C:\ABAP_DOCU_HTML\abapwith.htm`, `abapwith_subquery.htm`, `abapunion.htm`, `abenwhere_logexp_subquery.htm`, `abenwhere_logexp_exists.htm`, `abenwhere_logexp_operand_in.htm`, `abapselect_over.htm`, `abensql_win_func.htm` 확인. `abapwindow.htm`은 Classic List `WINDOW` 문서라 공식 근거에서 제외 | **신규 고급 SQL 장 필요 -> 작성 완료**. CH19 마지막에 "고급 SQL 지도"만 넣는 것은 가능하지만, CTE/window/set/subquery를 충분히 가르치기에는 CH19가 과밀해진다 | `NEWCH20_OLDCH99` Advanced ABAP SQL 작성 완료. 위치는 **CH19와 현 CH20 사이**로 확정했다. 반영 레슨: CTE/WITH, subquery/EXISTS, UNION/INTERSECT/EXCEPT, window expression, SQL식 성능/가독성 경계, 콘서트 Advanced SQL 실습 |
| RAP EML transaction: `MODIFY ENTITIES`, `COMMIT ENTITIES`, `ROLLBACK ENTITIES` | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md\ABAPMODIFY_ENTITY_ENTITIES.md`, `ABAPCOMMIT_ENTITIES.md`, `ABAPROLLBACK_ENTITIES.md`, `ABAPEML_RESPONSE.md`, `ABAPIN_LOCAL_MODE.md`, `ABENRAP_SAVE_SEQ_GLOSRY.md` 확인 | **분담 보강 완료**. RAP 입문과 capstone 사이에서 반드시 회수해야 하는 항목을 CH23 개념 지도와 CH36 실행 실습으로 나누었다 | `NEWCH24_OLDCH23`에는 consumer/provider, `IN LOCAL MODE`, transactional buffer, `FAILED`/`REPORTED`, `MODIFY ENTITIES` -> `COMMIT ENTITIES`/`ROLLBACK ENTITIES` 개념 지도를 반영했다. `NEWCH39_OLDCH36` L06에는 일반 ABAP consumer 관점의 실행 실습을 넣었다. Behavior pool 내부에서 `COMMIT/ROLLBACK ENTITIES`를 호출하지 않는 경계는 CH23에 반영 완료 |
| generic Field Symbol / generic type / dynamic `ASSIGN` / RTTS | `C:\ABAP_DOCU_HTML\abapfield-symbols.htm`, `abapassign_dynamic_components.htm`, `abapassign_mem_area_dynamic_dobj.htm`, `abapcreate_data.htm`, `abapcreate_data_handle.htm`, `abenrtti.htm`, `abencreate_data_via_rttc_abexa.htm` 확인 | **신규 장 필수 -> 작성 완료**. CH06은 typed Field Symbol 기초만 다루는 것이 맞고, CH20/CH26도 이 주제를 흡수하기 어렵다 | `NEWCH28_OLDCH99` Dynamic ABAP 작성 완료. 위치는 **CH26과 현 CH27 사이**로 확정했다. 반영 레슨: typed/generic Field Symbol, generic formal parameter, `ASSIGN`/`UNASSIGN`/`ELSE UNASSIGN`, `ASSIGN COMPONENT`, `ASSIGN (name)`, `REF TO data`/`CREATE DATA`, RTTI/RTTS, 동적 구조 검사기 실습 |
| `TABLES dbtab` for Dynpro Dictionary screen fields | `C:\ABAP_DOCU_HTML\abaptables.htm`, `abenabap_dynpros_fields.htm`, `abenabap_dynpros_processing.htm` 확인 | **보강 필요**. CH12의 `SELECT-OPTIONS ... FOR`용 `TABLES`와 다른 목적이다. Screen Painter에서 Dictionary 기반 화면 요소를 만들면 program 쪽 table work area와 화면 field 연결을 이해해야 한다 | CH16-L03 또는 신규 CH16 레슨에서 `TABLES dbtab`이 Dictionary structure와 같은 모양의 table work area를 선언한다는 점, 화면 field 이름과 프로그램 data object 연결, PBO/PAI 전송 감각, class 안에서는 쓰지 않는 classic 경계를 설명한다 |

P1 정밀 판정의 결론은 다음과 같다.

1. CH16은 **두 가지 보강**이 필요하다: Dynpro POV/POH와 Dynpro용 `TABLES dbtab`.
2. CH19는 고급 SQL을 모두 흡수하기 어렵다. **CH19와 현 CH20 사이에 고급 ABAP SQL 신규 장**을 두는 것으로 확정했고, `NEWCH20_OLDCH99`로 작성 완료했다.
3. RAP EML transaction은 신규 장보다 **CH23 개념 지도 + CH36 capstone 실습**으로 회수하는 것이 맞다. CH23 개념 지도는 `NEWCH24_OLDCH23`에 반영 완료했고, CH36 실행 실습은 `NEWCH39_OLDCH36` L06으로 회수 완료했다.
4. generic Field Symbol과 RTTS/RTTI는 **CH26과 현 CH27 사이 신규 장**으로 확정했고, `NEWCH28_OLDCH99` 작성으로 회수 완료했다.

## 4.2 P2 정밀 판정 결과

> 시작일: 2026-07-03 KST
> 범위: section 4의 P2 후보만 판정. P1 판정은 section 4.1을 따른다.

P2는 P1처럼 즉시 치명적인 선행 누락은 아니지만, 그대로 두면 "알고 있어야 읽을 수 있는데 배운 적은 없는" 빈칸이 된다. 특히 CH18 이후 New Syntax 전용 장이 없고, CH35/CH36이 테스트와 RAP 운영을 마감하는 장이므로, 여기서 소유권을 확정하지 않으면 후속 챕터 작성 때 같은 보류가 반복된다.

| P2 후보 | 공식문서 수동 확인 | 정밀 판정 | 필요한 조치 |
|---|---|---|---|
| CH18 `LET`, `THROW` expression | `C:\ABAP_DOCU_HTML\abaplet.htm`, `abenlet_abexa.htm`, `abenvalue_itab_let_abexa.htm`, `abenconditional_expression_result.htm`, `abenabap_exceptions.htm`, `abapraise_exception_message.htm` 확인 | **분할 보강 완료**. `LET`은 CH18의 constructor expression 독해 범위에서 소개했고, `THROW`는 CH20 예외 학습 후 회수했다 | CH18에는 `LET ... IN`을 `VALUE`/`COND`/`REDUCE` 안 보조 변수로 읽는 법, 평가 순서, 이름 충돌, 과밀 표현 주의를 반영했다. CH20에는 `COND`/`SWITCH`의 `ELSE THROW cx_...( )` 형태와 `RAISE EXCEPTION`과의 차이를 반영했다 |
| OO 고급 언어 요소: `FRIENDS`, `ALIASES`, RTTI/RTTC, T100 예외 텍스트 | `C:\ABAP_DOCU_HTML\abenfriends.htm`, `abapclass_local_friends.htm`, `abapaliases.htm`, `abenrtti.htm`, `abencase_type_of_rtti_abexa.htm`, `abencreate_data_via_rttc_abexa.htm`, `abenexception_texts_t100.htm`, `abenif_t100_message.htm` 확인 | **분할 보강 완료**. 하나의 "고급 OO" 장으로 묶지 않고 소유 개념별로 회수했다. RTTI/RTTC는 P1의 Dynamic ABAP 신규 장에서 회수했고, T100 예외 텍스트는 CH20 예외 실무성 보강으로 회수했다. `FRIENDS`/`ALIASES`는 CH26에서 읽기용 고급 OO 키워드로 보강 완료했다 | CH20에 `IF_T100_MESSAGE`, `SCX_T100KEY`, 메시지 클래스 기반 예외 텍스트, `MESSAGE oref` 감각을 반영했다. `NEWCH28_OLDCH99`에는 RTTI/RTTS, `CREATE DATA ... TYPE HANDLE`, dynamic structure inspector를 배치했다. `NEWCH27_OLDCH26`에는 `FRIENDS`가 캡슐화 예외 통로이고 남용 위험이 크다는 점, `ALIASES`가 interface component 이름을 짧게 노출하는 문법이라는 점을 읽기용 보강 레슨으로 정리했다 |
| ABAP Test Double Framework, `TEST-SEAM`, `TEST-INJECTION` | `C:\ABAP_DOCU_HTML\abenabap_unit.htm`, `abentest_seams.htm`, `abaptest-seam.htm`, `abaptest-injection.htm`, `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_UNIT.md`, `abap-cheat-sheets-main\14_ABAP_Unit_Tests.md` 확인 | **CH35 보강 완료**. CH26은 Dependency Injection과 테스트 가능한 설계를 말하는 장이라 개념 예고만 맡기고, 실제 도구 비교와 테스트 코드 작성은 ABAP Unit 운영 장인 `NEWCH38_OLDCH35`가 맡도록 정리했다 | `NEWCH38_OLDCH35` L02A에 manual fake/mock, `CL_ABAP_TESTDOUBLE`, ABAP SQL/CDS Test Double Framework, `TEST-SEAM`/`TEST-INJECTION`의 차이와 사용 조건을 비교했다. 특히 test seam은 공식 문서상 legacy code 보완용이며 신규 코드에서는 DI/인터페이스 분리를 우선한다는 경계를 넣었다 |
| RAP Draft/Auth 고급 중 ETag/BDEF lock | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENBDL_ETAG.md`, `ABENBDL_LOCKING.md`, `ABENBDL_DRAFT_HANDLING.md`, `ABENBDL_AUTHORIZATION.md`, `abap-cheat-sheets-main\36_RAP_Behavior_Definition_Language.md` 확인 | **CH36 보강 완료**. CH25의 classic lock 설명만으로 RAP ETag를 대체할 수 없어서 `NEWCH39_OLDCH36`에서 Draft/Auth/Capstone 마감 장의 BDEF lock, ETag, total ETag, authorization master/dependent를 한 흐름으로 회수했다 | `NEWCH39_OLDCH36` L04/L08에 `lock master`/`lock dependent`, `etag master`/`etag dependent`, draft의 mandatory `total etag`, Draft `Resume` 시 optimistic phase, managed/unmanaged에서 구현 책임이 달라지는 지점을 실습 전 체크리스트로 추가했다 |
| regex/SUBMATCHES advanced string processing | `C:\ABAP_DOCU_HTML\abapfind_pattern.htm`, `abapfind_options.htm`, `abapreplace_pattern.htm`, `abapreplace_options.htm`, `abenregex_pcre_syntax.htm`, `abenregex_system_classes.htm`, `abenstring_functions_regex.htm` 확인 | **신규 장 필요 -> 작성 완료**. CH04의 `FIND`/`REPLACE` 기초로는 `PCRE`, `REGEX`, `SUBMATCHES`, `RESULTS`, `CL_ABAP_REGEX`를 회수할 수 없어 독립 장으로 분리했다 | `NEWCH29_OLDCH99` Advanced String Processing and Regex 작성 완료. 위치는 P1 신규 Dynamic ABAP 장 바로 뒤, OLDCH27 ALV event 장 앞이다. 반영 레슨은 PCRE 기초, `FIND PCRE`, `MATCH COUNT/OFFSET/LENGTH`, `SUBMATCHES`, `RESULTS`, `REPLACE PCRE`, `CL_ABAP_REGEX`/`CL_ABAP_MATCHER`, regex string functions, 로그/이메일/코드 패턴 검증 실습이다 |

P2 정밀 판정의 결론은 다음과 같다.

1. CH18은 `LET` 보강을 완료했고, CH20은 `THROW` expression 회수를 완료했다.
2. CH20은 T100 기반 예외 텍스트 보강을 완료했다.
3. CH26은 `NEWCH27_OLDCH26`에서 `FRIENDS`/`ALIASES`를 읽기용 고급 OO 키워드로 보강 완료했고, test double은 CH35로 연결만 둔다.
4. CH35는 `NEWCH38_OLDCH35`에서 ABAP Unit 심화 도구로 `CL_ABAP_TESTDOUBLE`, SQL/CDS test double, `TEST-SEAM`/`TEST-INJECTION` 비교를 보강 완료했다.
5. CH36은 `NEWCH39_OLDCH36`에서 RAP `lock master`, ETag, total ETag, authorization master/dependent를 Draft/Auth 운영 흐름으로 보강 완료했다.
6. regex/SUBMATCHES는 별도 신규 장인 `NEWCH29_OLDCH99`로 작성 완료했으며, Dynamic ABAP 신규 장 직후 배치했다.

## 4.3 P3 정밀 판정 결과

> 시작일: 2026-07-03 KST
> 범위: section 4의 P3 후보만 판정. P1/P2 판정은 section 4.1/4.2를 따른다.

P3는 "모르면 바로 다음 챕터를 읽을 수 없는 선행 개념"보다는, 실무에서 마주칠 가능성이 있으나 본 커리큘럼의 중심축과는 거리가 있는 항목이다. 따라서 P3 판정은 무리한 신규 장 생성보다, 이미 있는 장의 경계 설명과 후속 심화 위치를 확정하는 데 초점을 둔다.

| P3 후보 | 공식문서/근거 확인 | 정밀 판정 | 필요한 조치 |
|---|---|---|---|
| Search Help exit / dynpro 동적 F4 제어 | `C:\ABAP_DOCU_HTML\abenabap_dynpros_value_help.htm`, `abenabap_dynpros_value_help_mod.htm`, `abenabap_dynpros_value_help_dynp.htm`, `abendynpro_f4_help_dic_abexa.htm`, `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-cheat-sheets-main\18_Dynpro.md` 확인 | **CH16 보강에 흡수**. dynpro 동적 F4는 P1의 `PROCESS ON VALUE-REQUEST`와 같은 보강 묶음이다. Search Help exit는 DDIC Search Help를 확장하는 고급 기법이므로 CH16에서 구현까지 다루지는 않는다 | CH16 보강 시 "F4 우선순위: DDIC Search Help -> dynpro field binding -> Search Help exit 고려 -> POV 직접 구현" 흐름을 설명한다. 본문 실습은 `PROCESS ON VALUE-REQUEST`, `F4IF_INT_TABLE_VALUE_REQUEST`, `DYNP_VALUES_READ/UPDATE`까지만 작성한다. Search Help exit는 "DDIC Search Help 자체를 강화하는 고급 확장"으로 경계만 둔다 |
| BRF+ rule engine | 로컬 ABAP Keyword 문서에는 독립 ABAP 언어 항목으로 존재하지 않음. SAP Help `Business Rule Framework plus (BRFplus)`와 S/4HANA Output Management/BRFplus 문서, `content/abap/CH34/CH34-L03.md`, `.project-docs/11_KEYWORD_AUDIT.md`의 CH34 Output Control 메모 확인 | **CH34 보강 완료**. BRF+는 ABAP 문법/OO 패턴 장에서 가르칠 주제가 아니라 별도 rule framework다. 다만 CH34 Output Control에서 "BRF+ 기반 Output Management"가 이미 등장하므로, `NEWCH37_OLDCH34` L03에서 규칙 엔진이라는 정체성과 어디까지 배우는지 경계를 회수했다 | `NEWCH37_OLDCH34` L03에서 NAST와 BRF+ Output Management를 비교하고, BRF+가 조건/결정 테이블/규칙으로 출력 결정을 수행하는 rule framework라는 점을 설명했다. BRF+ Application, Function, Ruleset, Decision Table을 직접 만드는 전체 실습은 본 Track의 범위 밖으로 명시했다 |
| communication arrangement, package release contract | SAP Help `Communication Management`/`Communication Arrangements` 문서 확인. 로컬 ABAP Cloud 문서 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_RELEASE_CONTRACTS.md`, `ABENC0_CONTRACT_GLOSRY.md`, `ABENC1_CONTRACT_GLOSRY.md`, `ABENRELEASED_API_GLOSRY.md`, `ABENRELEASED_APIS.md`, `ABENRESTRICTED_APIS_ATC_CHECKS.md` 확인 | **CH36 보강 완료**. communication arrangement는 ABAP Cloud/서비스 운영의 배포·연결 설정이고, package release contract는 Clean Core/released API 안정성의 실무판이다. `NEWCH39_OLDCH36`에서 RAP/Fiori Capstone 운영 마감으로 통합 회수했다 | `NEWCH39_OLDCH36` L09에 서비스 노출 후 communication scenario, communication system, communication user, communication arrangement가 어떤 순서로 등장하는지 운영 체크리스트를 넣었다. release contract C0/C1/C2, released API, ATC contract check도 함께 반영했다. 실제 tenant별 설정 화면 세부 클릭 절차는 환경 의존이므로 본문은 절차 지도와 확인 포인트 중심으로 작성했다 |

P3 정밀 판정의 결론은 다음과 같다.

1. Search Help exit는 CH16에서 구현하지 않는다. 다만 dynpro 동적 F4 보강 시 "왜 직접 POV보다 Search Help/exit를 먼저 고려하는가"를 설명한다.
2. BRF+ rule engine은 신규 장을 만들지 않는다. `NEWCH37_OLDCH34` L03에서 BRF+ 기반 Output Management의 역할과 범위 보강을 완료했다.
3. communication arrangement와 package release contract는 `NEWCH39_OLDCH36` L09에서 서비스 운영 체크리스트와 Clean Core/released API 운영 기준으로 회수 완료했다.
4. P3 확정 후에도 즉시 보강 우선순위는 P1이다. 특히 CH16 보강은 P1의 `PROCESS ON VALUE-REQUEST`/`TABLES dbtab`와 P3의 Search Help exit 경계를 한 번에 반영해야 한다.

## 5. 현재 기준으로 재작업 불필요한 대표 항목

| 항목 | 이유 |
|---|---|
| CH26 `COND`, `SWITCH`, `REDUCE` 미사용 | CH18 확장 후 미학습 문제가 해소됐다. CH26에서 `CASE`를 유지하는 것은 문법 누락이 아니라 패턴 설명력 우선 선택이다. |
| Table Control | `.project-docs/09_CURRICULUM_LEDGER.md`에서 "ALV로 대체, 제외"가 확정되어 있다. |
| classic interactive list | 원장상 완전 제외 결정이 있다. ALV 동기만으로 충분하다는 정책이다. |
| `EDIT MASK` | CH01 입문 출력 범위에서는 niche로 제외했다. `WRITE TO`는 CH04에서 회수되어 구조적 누락이 아니다. |
| `int8`, `decfloat` | 초급 타입 장에서 제외할 수 있다. 금액과 정밀도 주의는 CH02/CH04에서 이미 다룬다. |
| BAPI/RFC, Application Log, AMDP/ADBC, Forms/Output | BAPI/RFC는 `NEWCH33_OLDCH30`, Application Log는 `NEWCH38_OLDCH35`, Forms/Output은 `NEWCH37_OLDCH34`에서 작성 완료했다. AMDP/ADBC는 CH33 후속 원본 장으로 남아 있다. |

## 6. 1차 결론

CH01~CH26 v3의 R15 보류는 대체로 정상적으로 회수되었다. 특히 CH01~CH17 classic-first 구간에서 금지된 modern syntax, modern SQL, OO 본격 개념은 CH18~CH20에서 순차 회수되며, CH21~CH26의 실무 주제도 CH27~CH36 후속 원본 장으로 연결된다.

다만 CH26의 `COND` 사례와 같은 구조적 갭 가능성이 남은 항목이 있다. 1차 감사 기준 최우선 후보는 다음 항목이다.

1. generic Field Symbol, generic type, dynamic `ASSIGN`, `ASSIGN COMPONENT`, RTTS/RTTI를 담당할 신규 advanced language 장은 `NEWCH28_OLDCH99`로 작성 완료했다. 위치는 CH26과 현 CH27 사이이다.
2. CH16 Screen Programming에서 `TABLES dbtab` 기반 Dictionary screen field와 program data object 연결 설명이 빠졌을 가능성이 있다.
3. CH09/CH14에서 후속으로 넘긴 Dynpro value-request가 CH16 v3에서 회수되지 않은 가능성.
4. CH19가 유일한 Modern SQL 장인데 CTE/window/set operation/subquery를 모두 "입문 범위 밖"으로 보류한 문제는 `NEWCH20_OLDCH99` 작성으로 해소했다.
5. RAP EML의 `MODIFY/COMMIT/ROLLBACK ENTITIES`는 CH23 개념 지도와 `NEWCH39_OLDCH36` L06 외부 consumer 실행 실습으로 회수 완료했다. Draft/ETag 경계도 `NEWCH39_OLDCH36` L04/L08에서 회수했다.

P2 정밀 판정 후 추가로 확정된 보강 축은 다음과 같다.

1. CH18/CH20 사이에서 `LET`과 `THROW` expression의 소유권은 분리했고, 두 보강 모두 완료했다.
2. CH20은 class-based exception뿐 아니라 T100 message 기반 exception text까지 최소 실무 형태로 회수했다.
3. CH26은 `FRIENDS`와 `ALIASES`를 고급 OO 코드 읽기용 보강 레슨으로 회수 완료했다.
4. CH35는 `NEWCH38_OLDCH35`에서 ABAP Unit 마감 장으로서 Test Double Framework와 test seam의 사용 경계를 보강 완료했다.
5. CH36은 `NEWCH39_OLDCH36`에서 RAP Draft/Auth 장으로서 BDEF lock, ETag, total ETag의 동시성 제어 흐름을 보강 완료했다.
6. regex/SUBMATCHES는 `NEWCH29_OLDCH99` 신규 문자열 심화 장으로 독립 배치 완료했다.

P3 정밀 판정 후 추가로 확정된 보강/경계 축은 다음과 같다.

1. CH16은 P1 보강 때 Search Help exit와 직접 POV 구현의 경계를 함께 설명해야 한다.
2. CH34는 `NEWCH37_OLDCH34`에서 BRF+ rule engine 전체를 가르치지 않고, Output Management에서 BRF+가 맡는 출력 결정 역할만 보강 완료했다.
3. CH36은 `NEWCH39_OLDCH36` L09에서 communication arrangement와 release contract를 서비스 운영 체크리스트로 회수 완료했다.

## 6.1 신규 장 배치 검토 메모

사용자 추가 검토 결과, 신규 장이 가장 필요한 항목은 "generic Field Symbol + generic type + dynamic assignment + RTTS/RTTI"이다. CH02는 표준 타입 입문이므로 generic type을 넣기에는 너무 이르다. CH06은 internal table을 배우는 시점이라 typed `LOOP ... ASSIGNING <fs>`까지만 다루는 것이 맞다. 하지만 이후 본격 Field Symbol을 가르치지 않으면 `TYPE any`, `ANY TABLE`, dynamic `ASSIGN`, RTTS/RTTI가 영구 누락된다.

권장 위치는 **OLDCH26과 OLDCH27 사이**이다. 단, P1 판정으로 Advanced ABAP SQL 신규 장이 OLDCH19와 OLDCH20 사이에 먼저 들어갔으므로, 새 파일명 기준 Dynamic ABAP은 `NEWCH28_OLDCH99`가 된다.

| 후보 위치 | 판단 | 이유 |
|---|---|---|
| OLDCH06 직후 | 부적합 | internal table 직후의 학습자는 generic typing, runtime type, dynamic assignment를 받아들이기 어렵다. OLDCH06에는 typed Field Symbol 경계만 둔다. |
| OLDCH20 직후 | 가능하나 차선 | `REF TO`, `CREATE DATA`, exception, class 기반 문맥을 배운 뒤라 기술적으로 가능하다. 다만 OLDCH21~OLDCH23의 ALV/CDS/RAP Track-1 마무리 흐름을 끊는다. |
| OLDCH26과 OLDCH27 사이 | 권장 | OLDCH20 OO 기본, OLDCH24 DML, OLDCH25 Lock, OLDCH26 OO 고급 설계를 지나 고급 언어 도구를 다룰 준비가 된다. 이후 ALV event/editing, enhancement, interface, file/BDC 실무에서 동적 코드와 generic 처리의 필요성을 이해하기 좋다. |

권장 신규 장 초안:

| 신규 장 | 제목 후보 | 핵심 레슨 |
|---|---|---|
| NEWCH28_OLDCH99 | Dynamic ABAP: Field Symbol 심화와 Generic Programming | 작성 완료. L01 typed vs generic Field Symbol, L02 `TYPE any`/`ANY TABLE`/generic formal parameter, L03 `ASSIGN`/`UNASSIGN`/`IS ASSIGNED`, L04 `ASSIGN COMPONENT`, L05 `ASSIGN (name)`과 보안/덤프 위험, L06 `REF TO data`와 `CREATE DATA`, L07 RTTS/RTTI로 구조와 타입 읽기, L08 실습: 동적 구조 검사기 |

regex/SUBMATCHES는 P2 정밀 판정 결과 별도 신규 장을 권장했다. 두 가지 선택지를 검토했으나, 최종 권고는 독립 장이었고 `NEWCH29_OLDCH99`로 작성 완료했다.

| 선택지 | 판단 |
|---|---|
| NEWCH29_OLDCH99 `Advanced String Processing and Regex` | 작성 완료. `FIND PCRE`, `REPLACE PCRE`, `MATCH COUNT/OFFSET/LENGTH`, `SUBMATCHES`, `RESULTS`, `CL_ABAP_REGEX`, regex string functions, 로그/이메일/코드 패턴 검증을 체계적으로 다룬다. |
| 신규 Dynamic ABAP 장의 후반 레슨으로 통합 | 장 수 증가를 줄일 수 있다. 다만 regex는 type/dynamic programming과 성격이 달라 한 장 안에서 초점이 흐려질 수 있다. |

현재 감사 기준 권고 중 **동적/제네릭 ABAP 신규 장은 `NEWCH28_OLDCH99`로 작성 완료**했고, regex/SUBMATCHES는 **`NEWCH29_OLDCH99` 별도 문자열 심화 장으로 작성 완료**했다. CH27 ALV 고급 Event 장은 `NEWCH30_OLDCH27`로 작성하여 ALV double click/hotspot/toolbar/user command 회수 항목을 반영했다. CH28 Editable Grid ALV 장은 `NEWCH31_OLDCH28`로 작성하여 `data_changed`, `data_changed_finished`, Cell Style, 입력 오류 protocol, `check_changed_data`, 저장 전 DML/LUW 회수 항목을 반영했다. CH29 Enhancement / BAdI / User Exit 장은 `NEWCH32_OLDCH29`로 작성하여 CH05에서 보류된 표준 확장 심화와 Clean Core 확장 판단을 회수했다. CH30 인터페이스 실무 장은 `NEWCH33_OLDCH30`으로 작성하여 BAPI/BAPIRET2, BAPI commit/rollback, RFC destination/예외, BDC/Excel/File interface, 로그/재처리/멱등성 회수 항목을 반영했다. CH31 IDoc / ALE / Gateway 장은 `NEWCH34_OLDCH31`로 작성하여 IDoc Control/Data/Status, ALE Distribution Model, IDoc status/BD87 재처리, Classic Gateway SEGW 구조, `GET_ENTITYSET`/OData query option, Gateway 운영 회수 항목을 반영했다. CH34 Forms/Output/PDF 장은 `NEWCH37_OLDCH34`로 작성하여 BRF+ Output Management 경계를 반영했고, CH35 운영 품질 장은 `NEWCH38_OLDCH35`로 작성하여 ABAP Unit, Test Double, Background Job, Application Log 회수 항목을 반영했다.

이 문서는 1차 후보 수집 결과이며, P1은 section 4.1, P2는 section 4.2, P3는 section 4.3에서 정밀 판정을 확정했다. 다음 단계는 실제 보강 작업이다. 실행 순서는 P1부터 시작한다.

## 6.2 보강 진행 로그

| 날짜 | 대상 | 처리 |
|---|---|---|
| 2026-07-03 | `NEWCH16_OLDCH16_REWRITE.md`, `NEWCH16_OLDCH16_QA.md` | CH16 P1/P3 보강 완료. `TABLES dbtab` 기반 Dictionary dynpro field transport, `PROCESS ON VALUE-REQUEST`/`PROCESS ON HELP-REQUEST`, DDIC Search Help 우선순위, Search Help exit 경계, `DYNP_VALUES_READ/UPDATE`, `F4IF_FIELD_VALUE_REQUEST`, `F4IF_INT_TABLE_VALUE_REQUEST`를 반영했다. |
| 2026-07-03 | `NEWCH20_OLDCH99_REWRITE.md`, `NEWCH20_OLDCH99_QA.md` | Advanced ABAP SQL 신규 장 작성 완료. CH19에서 보류된 CTE/WITH, subquery/EXISTS, UNION/INTERSECT/EXCEPT, window expression, SQL식 성능/가독성 경계, 콘서트 Advanced SQL Lab을 반영했다. |
| 2026-07-06 | `NEWCH24_OLDCH23_REWRITE.md`, `NEWCH24_OLDCH23_QA.md` | CH23 RAP EML transaction 개념 지도 보강 완료. consumer/provider 경계, transactional buffer, `IN LOCAL MODE`, `FAILED`/`REPORTED`, 외부 consumer의 `MODIFY ENTITIES` -> `COMMIT ENTITIES`/`ROLLBACK ENTITIES`, Behavior Pool 내부 commit/rollback 금지를 반영했다. CH36 capstone 실행 실습은 `NEWCH39_OLDCH36` L06으로 회수 완료했다. |
| 2026-07-06 | `NEWCH28_OLDCH99_REWRITE.md`, `NEWCH28_OLDCH99_QA.md` | Dynamic ABAP 신규 장 작성 완료. CH06에서 보류된 generic Field Symbol, `TYPE any`, `ANY TABLE`, dynamic `ASSIGN`, `ASSIGN COMPONENT`, `ASSIGN (name)`, `REF TO data`, `CREATE DATA`, RTTS/RTTI, 동적 구조 검사기 실습을 반영했다. |
| 2026-07-06 | `NEWCH29_OLDCH99_REWRITE.md`, `NEWCH29_OLDCH99_QA.md` | Advanced String Processing and Regex 신규 장 작성 완료. CH04에서 보류된 PCRE/REGEX, `MATCH COUNT/OFFSET/LENGTH`, `SUBMATCHES`, `RESULTS`, `REPLACE PCRE`, `CL_ABAP_REGEX`/`CL_ABAP_MATCHER`, regex string functions, 로그/이메일/코드 패턴 검증 실습을 반영했다. |
| 2026-07-06 | `NEWCH27_OLDCH26_REWRITE.md`, `NEWCH27_OLDCH26_QA.md` | CH26 고급 OO 키워드 보강 완료. P2에서 미회수로 남았던 `FRIENDS`와 `ALIASES`를 L03A 보강 레슨으로 추가하고, friendship의 단방향 권한/캡슐화 위험, interface component alias의 출처 확인법, OO Access Boundary Inspector 실습을 반영했다. |
| 2026-07-06 | `NEWCH38_OLDCH35_REWRITE.md`, `NEWCH38_OLDCH35_QA.md` | CH35 운영 품질 장 작성 완료. ATC/Code Inspector, ABAP Unit, Test Double 심화(`CL_ABAP_TESTDOUBLE`, `CL_OSQL_TEST_ENVIRONMENT`, `CL_CDS_TEST_ENVIRONMENT`, `TEST-SEAM`/`TEST-INJECTION`), Transport, Background Job, Application Log/BAL/SLG1을 반영했다. |
| 2026-07-06 | `NEWCH39_OLDCH36_REWRITE.md`, `NEWCH39_OLDCH36_QA.md` | CH36 RAP + Fiori Capstone 장 작성 완료. 외부 EML consumer의 `MODIFY ENTITIES` -> `COMMIT ENTITIES`/`ROLLBACK ENTITIES`, Draft, `lock master`/`lock dependent`, `etag master`/`etag dependent`, `total etag`, authorization master, communication arrangement, release contract, released API/ATC 운영 체크리스트를 반영했다. |
| 2026-07-07 | `NEWCH37_OLDCH34_REWRITE.md`, `NEWCH37_OLDCH34_QA.md` | CH34 Forms/Output/PDF 장 작성 완료. Smart Forms, Adobe Forms, Output Control, NAST vs BRF+ Output Management, PDF `xstring`/`BIN`, SP01/ADS/output-item troubleshooting, BRF+ rule-framework 경계를 반영했다. |
| 2026-07-07 | `NEWCH30_OLDCH27_REWRITE.md`, `NEWCH30_OLDCH27_QA.md` | CH27 ALV 고급 Event 장 작성 완료. `double_click`, `hotspot_click`, `toolbar`, `user_command`, `SET HANDLER`, `get_selected_rows`, `refresh_table_display`, handler class 배선, CH28 editable grid 경계를 반영했다. |
| 2026-07-07 | `NEWCH31_OLDCH28_REWRITE.md`, `NEWCH31_OLDCH28_QA.md` | CH28 Editable Grid ALV와 입력 검증 장 작성 완료. `fieldcat edit`, `register_edit_event`, `data_changed`, `data_changed_finished`, `CL_ALV_CHANGED_DATA_PROTOCOL`, `add_protocol_entry`, `display_protocol`, `LVC_T_STYL`, `stylefname`, `check_changed_data`, 저장 전 검증/DML/LUW 경계를 반영했다. |
| 2026-07-07 | `NEWCH32_OLDCH29_REWRITE.md`, `NEWCH32_OLDCH29_QA.md` | CH29 Enhancement / BAdI / User Exit 장 작성 완료. `CALL CUSTOMER-FUNCTION`, `SMOD`/`CMOD`, `ENHANCEMENT-POINT`, `ENHANCEMENT-SECTION`, `GET BADI`, `CALL BADI`, `SE18`/`SE19`, filter, implicit/explicit 판단, Clean Core/released API 경계를 반영했다. |
| 2026-07-07 | `NEWCH33_OLDCH30_REWRITE.md`, `NEWCH33_OLDCH30_QA.md` | CH30 인터페이스 실무 장 작성 완료. BAPI/BAPIRET2, `BAPI_TRANSACTION_COMMIT`/`BAPI_TRANSACTION_ROLLBACK`, RFC `DESTINATION`/SM59/`communication_failure`/`system_failure MESSAGE`, BDC `BDCDATA`/`CALL TRANSACTION`/`OPTIONS FROM`/`MESSAGES INTO`/SHDB/SM35, Excel Upload/`gui_upload`/`SPLIT`, `OPEN DATASET`/`READ DATASET`/`TRANSFER`/`CLOSE DATASET`, 경로 보안, 로그/재처리/멱등성을 반영했다. |
| 2026-07-07 | `NEWCH34_OLDCH31_REWRITE.md`, `NEWCH34_OLDCH31_QA.md` | CH31 IDoc / ALE / Gateway 장 작성 완료. `EDIDC`/`EDIDD`/`EDIDS`, Basic Type/Segment/Message Type, `WE02`/`WE05`/`WE60`, `BD64`/`WE20`/`WE21`/`BD54`/`SM59`, status `51`/`53`/`64`/`03`, `BD87`, `SEGW`, `EntityType`/`EntitySet`, `MPC_EXT`/`DPC_EXT`, `/IWFND/MAINT_SERVICE`, `$metadata`, `/IWFND/GW_CLIENT`, `GET_ENTITYSET`, `$filter`/`$top`/`$skip`/`$orderby`를 반영했다. |

## 7. 검증 메모

다음 검색을 수행해 감사표를 만들었다.

```text
rg R15/보류/후속/경계 후보 in reference/codex_0629_v3 OLDCH01~OLDCH26 산출물
rg 후보 키워드 in content/abap CH27~CH36, .project-docs, reference/codex_0625_v2
Get-ChildItem content/abap CH01~CH36 _chapter.md title 추출
rg --files / targeted rg in C:\ABAP_DOCU_HTML for P1 official docs
rg --files / targeted rg in C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU for RAP EML official docs
rg --files / targeted rg in C:\ABAP_DOCU_HTML for P2 LET/THROW/FRIENDS/ALIASES/RTTI/T100/test seam/regex official docs
rg --files / targeted rg in C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU for P2 ABAP Unit Test Double and RAP ETag/BDL lock official docs
rg --files / targeted rg in C:\ABAP_DOCU_HTML for P3 dynpro value help/Search Help official docs
rg --files / targeted rg in C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU for P3 release contract/released API/ATC official docs
SAP Help web lookup for P3 BRFplus and Communication Management/Communication Arrangement docs
```

감사 중 확인한 중요한 현재 상태:

- `reference/codex_0629_v3`에는 OLDCH01~OLDCH26의 `REWRITE`/`QA`가 `NEWCH##_OLDCH##_*` 규칙으로 존재한다.
- `content/abap`에는 CH27~CH36 원본 챕터가 존재한다.
- 기존 `.project-docs/11_KEYWORD_AUDIT.md`의 CH18 `COND/SWITCH/REDUCE` 보류 판단은 현재 v3 상태와 맞지 않는다. CH18 v3에서 이미 보강되었으므로 이후 감사에서는 현재 v3를 우선해야 한다.
