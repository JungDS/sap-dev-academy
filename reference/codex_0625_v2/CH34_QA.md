# CH34_QA - Forms / Output / PDF

## 판정

PASS. `reference/codex_0625/00_QUALITY_REVIEW.md`에서 지적한 v1의 반복 템플릿, 본문 빈약, 자동 문서 매칭 문제를 CH34 범위에서 해소했다. 산출물은 `reference/codex_0625_v2/CH34_REWRITE.md`이며, 다섯 레슨 모두 완성 강의자료 흐름으로 재집필했다.

## 입력 자료

| 구분 | 확인 내용 |
| --- | --- |
| 원본 챕터 | `content/abap/CH34/_chapter.md`, `CH34-L01.md` ~ `CH34-L05.md` |
| 기존 v1 | `reference/codex_0625/CH34_Forms-Output-PDF.md` |
| 품질 기준 | `reference/codex_0625/00_QUALITY_REVIEW.md` |
| 프로젝트 규칙 | `.project-docs/01_AI_SYNC.md`, `.project-docs/04_CONVENTIONS.md`, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, `.project-docs/CONTENT_DEPTH_AUDIT.md`, `.project-docs/TRACK2_ENRICHMENT.md` |
| 기존 체험물 | `embeds/abap/CH34-L01-S01.html` ~ `embeds/abap/CH34-L05-S01.html` |

## 재작업 기준 반영

| 요구 | 반영 결과 |
| --- | --- |
| v1의 템플릿 반복 제거 | v1의 공통 지시문을 사용하지 않고 Smart Forms, Adobe Forms, Output Control, PDF byte 처리, 운영 추적에 맞춰 새로 작성했다. |
| 완성 강의자료 수준 재집필 | 각 레슨을 실제 강의 흐름으로 풀어 쓰고, 초보자가 어느 화면/상태/로그를 확인할지까지 설명했다. |
| 입문자 흐름 | 모든 레슨에 `왜 필요한가`, `무엇인가`, `어떻게 확인하는가`, `실수와 주의`, `체험형 학습 설계`, `정리`를 배치했다. |
| 코드와 체험 연결 | Smart Forms/Adobe Forms/PDF 다운로드 코드와 CH34-L01/L02/L04 위젯의 클릭·상태·피드백을 본문에서 직접 연결했다. |
| Classic ABAP 공식문서 수동 확인 | `C:\ABAP_DOCU_HTML`에서 동적 `CALL FUNCTION`, `GUI_DOWNLOAD`, `CL_GUI_FRONTEND_SERVICES`, `xstring`, `xstrlen`, spool glossary를 직접 확인했다. |
| ABAP Cloud/Clean Core 계열 수동 확인 | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU`에서 ABAP Cloud, released API, classic ABAP 경계를 직접 확인했다. |
| 로컬에서 확인 안 되는 근거 보충 | Smart Forms/Adobe Forms/Output Management 자체는 ABAP keyword doc 영역 밖이므로 SAP Help 공식 문서로 보충했다. NotebookLM은 추가 보충 필요가 없어 사용하지 않았다. |
| R15/classic-first | CH34은 Track 2 후반이므로 CH18/19/20/30/33 이후 학습 범위 안에서 Forms/Output/PDF를 정식 도입했다. ADS 설치, BRFplus authoring, ArchiveLink/DMS, BCS 전체 구현은 범위 밖으로 제한했다. |

## 레슨별 품질 점검

| 레슨 | v1/감사 지적 | v2 보강 | 판정 |
| --- | --- | --- | --- |
| CH34-L01 | Smart Forms 구조가 압축되고 생성 FM 책임이 짧음 | Form/Page/Window/Node/Form Interface, 활성화, 생성 FM 조회, 하드코딩 금지, tree 위젯 해석 보강 | PASS |
| CH34-L02 | Adobe Forms 구조와 ADS 경계가 짧음 | Interface/Context/Layout/ADS, `FP_JOB_OPEN`~`FP_JOB_CLOSE`, PDF 반환, compare matrix 연결 보강 | PASS |
| CH34-L03 | Output Control이 개념 나열 수준 | 업무 이벤트, 조건, 양식, 채널, NAST/BRFplus 차이, 원인 위치 찾기 flow 보강 | PASS |
| CH34-L04 | PDF 다운로드 코드 설명이 짧고 실행 위치 경계 필요 | `xstring`, `xstrlen`, `solix_tab`, `BIN`, `CL_GUI_FRONTEND_SERVICES`, SAP GUI/dialog와 Cloud 경계 보강 | PASS |
| CH34-L05 | 운영 오류 추적이 bullet 수준 | 데이터, interface/context, 출력 결정, 렌더링, 전달 5단계 추적과 SP01/이송/테스트 체크리스트 보강 | PASS |

## Classic ABAP 공식 문서 수동 확인 내역

| 범위 | 확인한 파일 | v2 반영 |
| --- | --- | --- |
| 동적 function module 호출 | `C:\ABAP_DOCU_HTML\abapcall_function_dynamic.htm` | 생성 FM 이름을 변수에 담아 `CALL FUNCTION lv_fm`로 호출할 수 있다는 설명 |
| function module parameter와 `GUI_DOWNLOAD` 예 | `C:\ABAP_DOCU_HTML\abapcall_function_parameter.htm` | `GUI_DOWNLOAD`가 presentation server 파일 저장 예로 등장하며 예외와 `sy-subrc` 확인이 필요하다는 경계 |
| 동적 method와 `CL_GUI_FRONTEND_SERVICES=>GUI_DOWNLOAD` | `C:\ABAP_DOCU_HTML\abapcall_method_dynamic.htm` | `GUI_DOWNLOAD` method 호출, dynamic call 보안 주의, exception handling 경계 |
| Presentation server 접근 | `C:\ABAP_DOCU_HTML\abenfrontend_services.htm` | `CL_GUI_FRONTEND_SERVICES`는 SAP GUI dialog에서 presentation server 파일을 읽고 쓰는 class이며 `GUI_DOWNLOAD`는 파일 쓰기용이라는 설명 |
| Byte-like type | `C:\ABAP_DOCU_HTML\abenbuiltin_types_byte.htm` | `xstring`은 variable length byte string type이라는 설명 |
| `xstrlen` | `C:\ABAP_DOCU_HTML\abendescriptive_functions_binary.htm` | `xstrlen( arg )`은 byte-like argument의 byte 수를 반환한다는 설명 |
| SAP spool system | `C:\ABAP_DOCU_HTML\abensap_spool_system_glosry.htm` | SAP spool system은 sequential data stream을 spool list, printer, ArchiveLink로 관리한다는 설명 |
| spool request | `C:\ABAP_DOCU_HTML\abenspool_request_glosry.htm` | spool request는 SAP spool system으로 보내는 output request이며 spool number로 식별된다는 설명 |
| spool list | `C:\ABAP_DOCU_HTML\abenspool_list_glosry.htm` | spool list와 spool request 관계, print/spool 확인 흐름 |

## ABAP Cloud / Clean Core 경계 확인

| 범위 | 확인한 파일 | v2 반영 |
| --- | --- | --- |
| ABAP Cloud | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_CLOUD_GLOSRY.md` | ABAP Cloud는 restricted language version, released API, ADT-only, SAP GUI access 없음 |
| Released API | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENRELEASED_API_GLOSRY.md` | Cloud-ready 판단은 released API와 release contract 기준 |
| Classic ABAP | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENCLASSIC_ABAP_GLOSRY.md` | classic ABAP은 language version, tools, repository access 제한이 없는 legacy model이라는 경계 |

## SAP Help 공식 보충 확인

| 범위 | 공식 URL | v2 반영 |
| --- | --- | --- |
| Smart Forms 호출 | `https://help.sap.com/saphelp_aii710/helpdata/en/1c/f40c5bddf311d3b574006094192fe3/content.htm` | 생성 function module 이름은 한 시스템 안에서만 고유하므로 `SSF_FUNCTION_MODULE_NAME`으로 현재 이름을 조회해야 한다는 설명 |
| Adobe Forms 호출 | `https://help.sap.com/saphelp_scm700_ehp01/helpdata/ru/60/f8123e9c6c498084f9f2bafab32671/content.htm` | `FP_JOB_OPEN`, `FP_FUNCTION_MODULE_NAME`, generated function module, `FP_JOB_CLOSE` 호출 순서 |
| Form template call/PDF 반환 | `https://help.sap.com/doc/saphelp_scm700_ehp02/7.0.2/en-US/86/42247cbc414b2b802b3f39e7996051/content.htm` | `FP_JOB_OPEN`으로 form 반환 방식을 제어하고, 반환 form을 generated function module에서 받는다는 설명 |
| BRFplus Output Management | `https://help.sap.com/docs/sisgw/sap-ariba-cloud-integration-gateway-overview-guide/brfplus-output-management-881ff8d9b2234807a9ddd6b8ea731477` | S/4HANA on-premise에서 NAST/message control과 BRFplus output management 경계 |
| APOC/BRFplus Output Management | `https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/74742d945db64478beba8da532dd9291/1251e048456140339354662222b51b73.html` | S/4HANA Output Management 계열을 NAST와 구분하는 설명 |
| Smart Forms PDF output | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/e0ef07e1f76b4370b1baa502eace5ece/4e5636a143184f47e10000000a42189e.html` | Smart Forms에서도 generated function module 이름 조회 후 PDF output 처리가 가능하다는 보충 |

## R15 및 classic-first 점검

CH34은 Track 2 후반이며 CH33의 성능/DB pushdown 뒤에 온다.

| 항목 | 처리 |
| --- | --- |
| Modern ABAP | CH18 이후라 inline declaration, method call, `abap_true`, `REF #( )` 등 표기 이해 가능 |
| Modern SQL | CH19 이후지만 CH34는 SQL 심화가 아니라 출력 흐름이 중심 |
| OO/class | CH20 이후라 `CL_GUI_FRONTEND_SERVICES`, `CL_BCS_CONVERT` 같은 class method 표기 가능 |
| 인터페이스/연동 | CH30 이후라 파일/메일/외부 전달 개념을 출력물 처리와 연결 가능 |
| Smart Forms/Adobe Forms | CH34에서 L3 정식 도입. 이전 챕터에는 구현 문법을 당겨 쓰지 않음 |
| Output Control | CH34에서 L3 정식 도입. NAST customizing/BRFplus authoring은 심화로 제한 |
| ABAP Cloud | CH23 이후 경계로 언급 가능. 다만 CH34에서는 released API와 SAP GUI 접근 없음 정도로 제한 |

## 체험형 학습 설계 점검

| 레슨 | 체험 설계 |
| --- | --- |
| CH34-L01 | `ZSF_TICKET` tree를 펼쳐 Form Interface, Global Definitions, Pages & Windows, MAIN/HEADER, 생성 FM을 구조적으로 읽는다. |
| CH34-L02 | compare matrix 행을 클릭해 Smart Forms와 Adobe Forms의 PDF/ADS/디자이너/신규 권장 기준을 비교한다. |
| CH34-L03 | Mermaid flow에서 업무 이벤트, 출력 결정, 조건 불충족, 양식 선택, 채널 선택, 출력 완료 단계별 원인 위치를 찾는다. |
| CH34-L04 | code-anatomy에서 `/1bcdwb/formoutput`, `ls_formout-pdf`, `xstring_to_solix( )`, `filetype = 'BIN'`을 클릭해 byte 흐름을 확인한다. |
| CH34-L05 | judge quiz로 SP01/ADS/출력 결정 점검, Form Interface 입력 확인, 운영 직접 수정 금지, 샘플 테스트 출력 원칙을 판별한다. |

## 기계 점검 결과

| 점검 | 명령 | 결과 |
| --- | --- | --- |
| 레슨 수 | `rg -c "^## CH34-L0[1-5]" reference\codex_0625_v2\CH34_REWRITE.md` | 5 |
| 필수 흐름 섹션 수 | `rg -c "^### (왜 필요한가\|무엇인가\|어떻게 확인하는가\|실수와 주의\|체험형 학습 설계\|정리)$" reference\codex_0625_v2\CH34_REWRITE.md` | 30 |
| 오염 패턴 묶음 | v1 반복 문구와 잘못된 자동 문서명 패턴을 `rg`로 검색 | hit 없음 |
| 핵심 키워드 | Smart Forms, Adobe Forms, Output Control, NAST, BRFplus, `SSF_FUNCTION_MODULE_NAME`, `FP_JOB_OPEN`, `FP_FUNCTION_MODULE_NAME`, `xstring`, `xstrlen`, `GUI_DOWNLOAD`, SP01 검색 | 모두 확인 |
| whitespace | `rg -n "[ \t]+$" reference\codex_0625_v2\CH34_REWRITE.md reference\codex_0625_v2\CH34_QA.md` | hit 없음 |
| 공식문서 경로 | QA에 기록한 `C:\ABAP_DOCU_HTML` 및 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU` 근거 파일 `Test-Path` 확인 | 모두 OK |

## 남은 리스크

CH34는 reference 재작성 산출물이므로 실제 `content/abap/CH34` 빌드나 embed 구현 변경은 수행하지 않았다. Smart Forms, Adobe Forms, ADS, Output Control은 시스템 release, customizing, ADS 설치, authorization, printer, email channel, Output Management adoption 상태에 따라 실습 가능 범위가 달라진다. 실제 교육 페이지로 이식할 때는 대상 시스템에서 `SMARTFORMS`, `SFP`, ADS 연결, SP01 접근, Output Control 설정 권한, Cloud readiness 기준을 다시 맞추는 것이 좋다.
