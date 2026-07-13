# NEWCH28_OLDCH99_QA · Dynamic ABAP 검수

> 대상 산출물: `reference/codex_0629_v3/NEWCH28_OLDCH99_REWRITE.md`
> 작업 단위: 신규 CH28 1개 챕터
> 기준: `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md` P1 판정, `.project-docs/04_CONVENTIONS.md` R6/R15, CH06 typed Field Symbol 경계

## 1. 작업 범위 확인

| 항목 | 확인 |
|---|---|
| 챕터 | NEWCH28_OLDCH99 · Dynamic ABAP: Field Symbol 심화와 Generic Programming |
| 성격 | 신규 장 |
| 삽입 위치 | NEWCH27_OLDCH26 이후, NEWCH29_OLDCH99 및 기존 OLDCH27 ALV event/editing 이전 |
| 산출 파일 | `NEWCH28_OLDCH99_REWRITE.md`, `NEWCH28_OLDCH99_QA.md` |
| 주 근거 | CH06에서 보류된 generic Field Symbol, generic type, dynamic `ASSIGN`, RTTS/RTTI 소유 장 부재 |
| 품질 목표 | IT 비전공 입문자가 동적 ABAP 코드를 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리" 흐름으로 읽고, 실패 상태까지 검증할 수 있는 완성 강의자료 |

판정: CH06에 generic Field Symbol을 넣는 것은 너무 이르고, CH20/CH26에 흡수하기에는 주제가 독립적이다. 감사표의 P1 결론대로 신규 장으로 회수했다.

## 2. P1 감사 항목 회수

| P1 항목 | 반영 위치 | 반영 내용 |
|---|---|---|
| typed vs generic Field Symbol | `NEWCH28-L01` | CH06 typed `LOOP ... ASSIGNING <fs>`를 복습하고, `TYPE any`, `TYPE ANY TABLE`의 책임 차이를 설명 |
| generic type / generic formal parameter | `NEWCH28-L02` | `TYPE any`, `TYPE data`, `TYPE ANY TABLE`, method parameter에서 가능한 작업과 불가능한 작업 구분 |
| `ASSIGN`, `UNASSIGN`, `IS ASSIGNED` | `NEWCH28-L03` | Field Symbol 연결/해제, `CLEAR <fs>`와 `UNASSIGN <fs>` 차이, assignment state machine 설계 |
| `ELSE UNASSIGN`와 이전 할당 함정 | `NEWCH28-L03`, `NEWCH28-L08` | dynamic `ASSIGN` 실패 시 이전 할당이 남을 수 있음을 명시하고 `sy-subrc`와 assigned 상태를 함께 확인 |
| `ASSIGN COMPONENT` | `NEWCH28-L04`, `NEWCH28-L08` | component name/position, `sy-subrc`, whitelist, dynamic component picker, structure inspector 실습 |
| `ASSIGN (name)` | `NEWCH28-L05` | runtime name lookup, search order 감각, 구조 component 접근에는 비권장, whitelist 설계 |
| `REF TO data`, `CREATE DATA` | `NEWCH28-L06` | anonymous data object 생성, `dref->*`, `TYPE (name)`, `TYPE HANDLE` 연결 |
| RTTS/RTTI | `NEWCH28-L07`, `NEWCH28-L08` | `cl_abap_typedescr`, `cl_abap_structdescr`, `describe_by_data`, `describe_by_name`, `components`, dynamic structure inspector |
| 체험형 실습 | 모든 레슨, 특히 `NEWCH28-L08` | Pointer Board, Generic Parameter Gate, ASSIGN State Machine, Component Picker, Runtime Name Lookup Lab, Anonymous Data Factory, RTTS Type Lens, Dynamic Structure Inspector |

판정: `00_CONCEPT_GAP_AUDIT.md` section 6.1의 최소 레슨 초안을 모두 충족한다.

## 3. 공식 문서 수동 확인

자동 키워드 매칭으로 공식문서 힌트를 만들지 않고 `C:\ABAP_DOCU_HTML`에서 파일을 직접 열어 문법과 실패 동작을 확인했다.

| 주제 | 확인 문서 | QA 판단 |
|---|---|---|
| Field Symbol 선언/typing | `abapfield-symbols.htm` | angle bracket 필수, 선언 직후 unassigned, `TYPE ANY TABLE`/`TYPE any` 예시 반영 |
| `ASSIGN` 기본 | `abapassign.htm` | 성공 시 memory area 참조, dynamic 실패 시 `sy-subrc`, `ELSE UNASSIGN`, 이전 상태 유지 함정 반영 |
| `UNASSIGN` | `abapunassign.htm` | Field Symbol 연결 해제와 `CLEAR <fs>` 차이를 본문에 반영 |
| Dynamic component access | `abapassign_dynamic_components.htm` | `struc-(comp)`, `dref->(comp_name)`, `COMPONENT comp OF STRUCTURE struc`, component name/position, `sy-subrc = 4`, `ELSE UNASSIGN` 반영 |
| Dynamic data object name | `abapassign_mem_area_dynamic_dobj.htm` | `(dobj_name)` search order, "더 이상 권장되지 않음", structure component 접근에는 다른 variant 우선 반영 |
| Anonymous data object | `abapcreate_data.htm` | `CREATE DATA`가 실행 시점에 anonymous object를 만들고 reference로 접근한다는 점 반영 |
| `CREATE DATA ... TYPE HANDLE` | `abapcreate_data_handle.htm` | RTTS type description object로 data object를 만드는 연결 지점 반영 |
| RTTS/RTTI | `abenrtti.htm` | type description class 계층, `describe_by_data`, `describe_by_name`, `cl_abap_structdescr->components` 반영 |
| RTTC 예제 | `abencreate_data_via_rttc_abexa.htm` | `cl_abap_structdescr=>get`, component type description, `CREATE DATA ... TYPE HANDLE`의 경계를 본문에 반영 |

수동 확인 중 `abapassign_component.htm`, `abencl_abap_typedescr.htm`, `abencl_abap_structdescr.htm`는 독립 문서 파일로 확인되지 않았다. 본문에서는 확인된 문서명만 공식 근거로 사용했다.

## 4. R15 게이팅 및 classic-first 경계

### NEWCH28에서 허용한 것

| 항목 | 이유 |
|---|---|
| inline `FIELD-SYMBOL(<fs>)`, `DATA(...)`, `VALUE #( )`, string template | NEWCH18 이후 modern syntax가 정식 도입되었으므로 사용 가능 |
| `TYPE any`, `TYPE ANY TABLE` | CH06에서 보류된 generic typing P1 항목 회수 |
| `ASSIGN COMPONENT`, `ASSIGN (name)` | 동적 Field Symbol 심화의 공식 소유 장 |
| `REF TO data`, `CREATE DATA`, `dref->*` | dynamic data object 생성과 접근을 설명하기 위해 필요 |
| `cl_abap_typedescr`, `cl_abap_structdescr`, `describe_by_data`, `components` | RTTS/RTTI 핵심 회수 |
| `TRY...CATCH` | CH20 이후 class-based exception이 도입되었으므로 `CREATE DATA`/cast 실패 설명에 사용 가능 |

### NEWCH28에서 보류한 것

| 보류 항목 | 처리 |
|---|---|
| dynamic SQL / dynamic WHERE | 이 장의 범위가 type/memory access이므로 제외 |
| ALV field catalog 자동 생성 framework | 이후 ALV event/editing 장에서 필요 시 활용 |
| regex/SUBMATCHES | NEWCH29_OLDCH99 문자열 심화 신규 장으로 분리 |
| Enhancement spot 구현 | 기존 OLDCH29 이후 범위 |
| 무분별한 `ASSIGN ... CASTING`, offset/length memory trick | 입문자에게 위험하고 이 장의 안전한 dynamic access 목표와 맞지 않아 제외 |
| `(PROG)DOBJ` cross-program 접근 | 공식 문서상 존재는 읽기 경계로만 언급하고 사용 실습에서 제외 |
| RTTC full dynamic table generator | `TYPE HANDLE` 연결만 소개하고 framework 제작은 제외 |

판정: CH18/CH19 이후이므로 modern syntax 사용은 허용되지만, 후속 장의 dynamic SQL, ALV framework, regex를 앞당기지 않았다.

## 5. 입문자 강의 흐름 점검

| 흐름 | 반영 |
|---|---|
| 왜 필요한가 | 각 레슨이 실제 실무 불편에서 시작한다. 공통 로깅, 설정 기반 필드 선택, generic inspector, runtime type 확인 같은 상황을 제시했다. |
| 무엇인가 | Field Symbol, generic type, `ASSIGN`, data reference, RTTS를 표와 memory 모델로 분해했다. |
| 어떻게 확인하는가 | 코드 실행 후 `sy-subrc`, `<fs> IS ASSIGNED`, component 존재, type kind, cast 성공/실패를 확인하도록 구성했다. |
| 실수/주의 | unassigned 접근, 이전 할당 유지, `CLEAR <fs>` 오해, `(name)` 보안 위험, RTTS cast 실패, `CREATE DATA` 예외를 다뤘다. |
| 정리 | 각 레슨 끝에 선택 기준과 핵심 문장을 정리했다. |

판정: 비전공 학습자가 "동적"이라는 추상어를 memory box, 이름표, type description lens로 이해하도록 설계했다.

## 6. 체험형 학습 설계 점검

| 레슨 | 학습 장치 | 데이터 | 버튼/상태/피드백 |
|---|---|---|---|
| L01 | Field Symbol Pointer Board | `ls_booking` 구조 | `Assign typed`, `Assign generic`, `Assign component`, `Unassign`; `typedAssigned`, `genericAssigned`, `sourceStatus` |
| L02 | Generic Parameter Gate | `lt_booking`, `lt_customer`, `lt_message`, `lv_text` | `Pass structure`, `Pass table`, `Try direct component`, `Use RTTS check`; `inputKind`, `allowedOperations` |
| L03 | ASSIGN State Machine | `STATUS`, `UNKNOWN_FIELD` | `Assign STATUS`, `Assign UNKNOWN without ELSE`, `Assign UNKNOWN with ELSE`, `CLEAR`, `UNASSIGN`; `sySubrc`, `fsAssigned` |
| L04 | Dynamic Component Picker | `BOOKING_ID`, `CONCERT_ID`, `SEATS`, `STATUS` | `Assign by name`, `Assign by position`, `Try unknown`, `Use ELSE UNASSIGN`; `allowedByWhitelist` |
| L05 | Runtime Name Lookup Lab | local/global/system field/structure examples | `Assign by name`, `Apply whitelist`, `Show search order`, `Prefer component mode`; `foundScope`, `riskLevel` |
| L06 | Anonymous Data Factory | `TY_BOOKING`, `SYST`, `UNKNOWN_TYPE` | `CREATE DATA`, `ASSIGN dref->*`, `Show type`, `Assign component`; `createOk`, `referenceInitial` |
| L07 | RTTS Type Lens | elementary/structure/table cards | `describe_by_data`, `Cast to struct`, `Show components`, `Create data by handle`; `typeKind`, `componentCount` |
| L08 | Dynamic Structure Inspector Simulator | `ty_booking`, requested field list | `Describe Type`, `Cast Struct`, `Validate Names`, `Assign Component`, `Display Result`; `assignSubrc`, `metadataFound` |

판정: 코드가 있는 레슨마다 프로세스 플로우, 체험/시뮬레이터, 버튼, 상태, 데이터, 피드백 설계가 포함되었다.

## 7. 내용상 주요 보강

| 보강 | 이유 |
|---|---|
| Field Symbol을 "값 상자"가 아니라 "원본 memory area에 붙는 이름표"로 설명 | 비전공자가 alias/reference 감각을 이해해야 이후 동적 할당을 따라갈 수 있음 |
| `TYPE any`가 자유 이용권이 아니라 확인 책임이라는 점 강조 | generic type 오해 방지 |
| `ELSE UNASSIGN`과 이전 할당 유지 함정 반복 설명 | 동적 ABAP의 대표 버그 예방 |
| `CLEAR <fs>`와 `UNASSIGN <fs>` 차이 설명 | 원본 데이터 삭제와 연결 해제 혼동 방지 |
| `ASSIGN COMPONENT`를 `ASSIGN (name)`보다 우선하는 구조 component 접근으로 배치 | 공식 문서의 권장 경계와 유지보수성 반영 |
| `ASSIGN (name)` search order와 whitelist 설계 | 보안/캡슐화/유지보수 위험을 입문자 수준으로 설명 |
| `CREATE DATA`를 anonymous data object, data reference, Field Symbol 연결로 분해 | heap/reference 개념을 과도하게 추상화하지 않고 이해시키기 위함 |
| RTTS를 "타입 설명서"로 설명 | `lo_struct->components`가 실제 값이 아니라 metadata라는 점을 구분 |
| Dynamic Structure Inspector 실습 | 모든 핵심 문법을 안전한 실패 처리 흐름으로 통합 |

## 8. 자동 점검 기준

작업 후 다음 검색으로 범위 이탈과 산출물 존재를 점검한다.

| 점검 | 기대 |
|---|---|
| 신규 파일 존재 | `NEWCH28_OLDCH99_REWRITE.md`, `NEWCH28_OLDCH99_QA.md` 존재 |
| forbidden 후속 주제 | dynamic SQL, regex 구현, ALV framework 구현이 본문 실습 코드로 등장하지 않음 |
| 핵심 키워드 회수 | `TYPE any`, `ANY TABLE`, `ASSIGN COMPONENT`, `ASSIGN (name)`, `CREATE DATA`, `TYPE HANDLE`, `describe_by_data`, `components` 존재 |
| 실패 처리 | `ELSE UNASSIGN`, `sy-subrc`, `IS ASSIGNED`, `TRY...CATCH` 설명 존재 |
| 감사표 반영 | `00_CONCEPT_GAP_AUDIT.md`에 NEWCH28 완료 로그 반영 |

## 9. 후속 연결 확인

| 후속 | 상태 |
|---|---|
| NEWCH29_OLDCH99 Advanced String Processing and Regex | 작성 완료. NEWCH28에서 regex를 병합하지 않고 독립 장으로 분리한 정책이 유지되었다. |
| 기존 OLDCH27 ALV event/editing 이후 번호 정책 | 반영 완료. OLDCH27은 `NEWCH30_OLDCH27`로 이동했고, 이후 OLDCH28~OLDCH36도 `NEWCH31`~`NEWCH39`로 정리되었다. |
| CH36 RAP capstone EML 실행 실습 | 회수 완료. `NEWCH39_OLDCH36` L06에서 외부 EML consumer 실행 흐름으로 반영되었다. |

## 10. 최종 판정

NEWCH28은 P1 정밀 판정의 핵심 공백인 generic Field Symbol, generic type, dynamic `ASSIGN`, RTTS/RTTI를 신규 장으로 회수했다. CH06에는 typed Field Symbol 경계를 유지하고, CH26 이후에 고급 언어 도구로 독립 배치했으므로 R15 게이팅도 지킨다.

판정: 작성 완료.
