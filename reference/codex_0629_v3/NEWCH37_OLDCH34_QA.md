# NEWCH37_OLDCH34_QA - Forms / Output / PDF

## 최종 판정

PASS. `content/abap/CH34`의 다섯 레슨을 v3 파일명 규칙에 맞춰 `NEWCH37_OLDCH34_REWRITE.md`로 재집필했고, `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md`의 P3 후보였던 `BRF+ rule engine`을 CH34-L03 Output Control 경계 안에서 회수했다.

이번 재작성은 v2 산출물을 보조 자료로만 사용했다. v3 본문은 원본 CH34 구조를 유지하되, 다음 세 가지를 특히 보강했다.

1. 양식 자체와 출력 결정 층을 분리했다.
2. BRFplus를 "ABAP 문법"이 아니라 "Output Management에서 출력 결정을 돕는 business rule framework"로 설명했다.
3. 전체 BRFplus authoring은 본 Track 범위 밖임을 명시해, CH26/CH18 같은 선행 장에 억지로 끼워 넣지 않도록 경계를 세웠다.

## 입력 자료

| 구분 | 확인 내용 |
|---|---|
| 원본 챕터 | `content/abap/CH34/_chapter.md`, `CH34-L01.md` ~ `CH34-L05.md` |
| v2 보조 자료 | `reference/codex_0625_v2/CH34_REWRITE.md`, `CH34_QA.md` |
| v3 감사 기준 | `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md` |
| 프로젝트 키워드 감사 | `.project-docs/11_KEYWORD_AUDIT.md` CH34 메모 |
| 기존 체험물 메모 | `.project-docs/TRACK2_ENRICHMENT.md` CH34 embed 완료 메모 |

## 레슨별 반영 점검

| v3 레슨 | 원본 | 보강 결과 | 판정 |
|---|---|---|---|
| NEWCH37-L01 | CH34-L01 Smart Forms 기본 구조 | Form/Page/Window/Node/Form Interface, 활성화, 생성 FM 조회, `SSF_FUNCTION_MODULE_NAME`, 하드코딩 금지, tree 시뮬레이터를 완성 강의 흐름으로 확장 | PASS |
| NEWCH37-L02 | CH34-L02 Adobe Forms 기본 구조 | Interface/Context/Layout/ADS, `FP_JOB_OPEN` -> `FP_FUNCTION_MODULE_NAME` -> generated FM -> `FP_JOB_CLOSE`, ADS 오류 분리, 상태 칩 시뮬레이터 반영 | PASS |
| NEWCH37-L03 | CH34-L03 Output Control 개요 | NAST와 BRFplus Output Management 비교, BRFplus rule framework의 정체, output item/rule/channel 확인, BRFplus authoring 범위 밖 경계 반영 | PASS |
| NEWCH37-L04 | CH34-L04 PDF 생성과 다운로드 | `xstring`, `xstrlen`, `solix_tab`, `BIN`, `CL_GUI_FRONTEND_SERVICES`, dialog/background/Cloud 경계, PDF byte pipeline 반영 | PASS |
| NEWCH37-L05 | CH34-L05 양식 오류 추적과 변경 대응 | 데이터 -> interface/context -> output decision -> rendering -> delivery 5단계 추적, SP01/ADS/NAST/BRFplus rule/channel 판별, 운영 변경 통제 반영 | PASS |

## 감사 회수 점검

| 감사 항목 | 이전 상태 | v3 처리 |
|---|---|---|
| CH26 `BRF+ rule engine` | CH34가 BRF+ Output Management를 짧게 언급했지만 rule engine 자체 소유가 불명확해 P3 정밀 판정 필요 | `NEWCH37-L03`에서 BRFplus를 rule framework로 설명하고, Output Management에서 출력 조건/parameter 결정에 쓰일 수 있음을 명시했다 |
| 신규 장 필요 여부 | 독립 ABAP 장을 만들지 여부 검토 필요 | 신규 장 불필요로 확정. BRFplus full authoring은 ABAP 문법/OO Track이 아니라 별도 rule framework/모듈 설정 심화로 경계 처리 |
| 후속 영향 | CH26에서 rule engine을 함부로 다루기 어려움 | CH34가 Output Control 맥락의 BRFplus 역할을 회수하므로 CH26/CH18에는 추가 부담 없음 |

## Classic ABAP 공식 문서 수동 확인 내역

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| 동적 function module 호출 | `C:\ABAP_DOCU_HTML\abapcall_function_dynamic.htm` | 생성 function module 이름을 변수에 담아 `CALL FUNCTION lv_fm`로 호출할 수 있다는 흐름 |
| function module parameter | `C:\ABAP_DOCU_HTML\abapcall_function_parameter.htm` | `EXPORTING`, `IMPORTING`, 예외 처리, parameter interface가 중요하다는 설명 |
| dynamic method / GUI download 예 | `C:\ABAP_DOCU_HTML\abapcall_method_dynamic.htm` | `CL_GUI_FRONTEND_SERVICES=>GUI_DOWNLOAD`와 동적 호출 경계 참고 |
| frontend services | `C:\ABAP_DOCU_HTML\abenfrontend_services.htm` | `CL_GUI_FRONTEND_SERVICES`는 SAP GUI dialog의 presentation server 파일 접근이라는 경계 |
| byte type | `C:\ABAP_DOCU_HTML\abenbuiltin_types_byte.htm` | `xstring`은 byte string type이라는 설명 |
| byte length | `C:\ABAP_DOCU_HTML\abendescriptive_functions_binary.htm` | `xstrlen( )`은 byte-like argument의 byte 수를 반환한다는 설명 |
| spool system | `C:\ABAP_DOCU_HTML\abensap_spool_system_glosry.htm` | SAP spool system이 출력 data stream을 spool/printer/archive 흐름으로 관리한다는 설명 |
| spool request | `C:\ABAP_DOCU_HTML\abenspool_request_glosry.htm` | spool request와 `SP01` 확인 흐름 |
| spool list | `C:\ABAP_DOCU_HTML\abenspool_list_glosry.htm` | spool list와 spool request 관계 |

## ABAP Cloud / Clean Core 경계 확인

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| ABAP Cloud | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_CLOUD_GLOSRY.md` | ABAP Cloud는 restricted language version, RAP, released API 중심이라는 경계 |
| Released API | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENRELEASED_API_GLOSRY.md` | Cloud-ready 판단은 released API와 release contract 기준 |
| Classic ABAP | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENCLASSIC_ABAP_GLOSRY.md` | classic ABAP은 legacy/on-prem 개발 모델이며 SAP GUI/레거시 도구 접근이 가능하다는 경계 |

## SAP Help 공식 보충 확인

Smart Forms, Adobe Forms, Output Control, BRFplus 자체는 ABAP keyword 문서의 독립 언어 항목이 아니므로 SAP Help 공식 문서로 보충했다.

| 범위 | 공식 URL | v3 반영 |
|---|---|---|
| Smart Forms 호출 | `https://help.sap.com/saphelp_aii710/helpdata/en/1c/f40c5bddf311d3b574006094192fe3/content.htm` | generated function module 이름은 시스템 내부 산출물이므로 `SSF_FUNCTION_MODULE_NAME`으로 현재 이름을 조회해야 한다는 설명 |
| Adobe Forms 호출 | `https://help.sap.com/saphelp_scm700_ehp01/helpdata/ru/60/f8123e9c6c498084f9f2bafab32671/content.htm` | `FP_JOB_OPEN`, `FP_FUNCTION_MODULE_NAME`, generated function module, `FP_JOB_CLOSE` 순서 |
| BRFplus Output Management | `https://help.sap.com/docs/sisgw/sap-ariba-cloud-integration-gateway-overview-guide/brfplus-output-management-881ff8d9b2234807a9ddd6b8ea731477` | NAST/message control과 BRFplus output management 경계 |
| Business Rule Framework plus | `https://help.sap.com/docs/SAP_DECISION_SERVICE_MANAGEMENT/90c77b45fd0f42febd69eea239037688/9a6b67ce7c26446483af079719edf679.html` | BRFplus는 business rules를 정의/처리하기 위한 framework라는 설명 |
| APOC/BRFplus Based Output Management | `https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/74742d945db64478beba8da532dd9291/1251e048456140339354662222b51b73.html` | S/4HANA Output Management 계열에서 BRFplus 기반 output control 설정을 확인해야 한다는 경계 |
| NAST Based Output Management | `https://help.sap.com/docs/SAP_ERP/3fd23d9ccf67436590e7d36e94f52ab6/ff58e883f35e40218f6cb68bd06dc574.html` | classic message/output management는 NAST/output type/condition record 중심으로 본다는 설명 |

## R15 및 classic-first 점검

| 항목 | 점검 |
|---|---|
| Modern syntax | CH18 이후라 inline declaration과 class method call 표기는 허용된다 |
| OO/class | CH20 이후라 `cl_gui_frontend_services=>gui_download`, `cl_bcs_convert=>xstring_to_solix`를 읽을 수 있다 |
| Integration/File | CH30 이후라 파일, 이메일 첨부, 외부 전달 개념을 출력물 처리와 연결할 수 있다 |
| Smart Forms/Adobe Forms | CH34에서 정식 도입했다. 이전 장에 구현 세부를 당기지 않는다 |
| Output Control | CH34에서 정식 도입했다. NAST customizing 상세와 BRFplus authoring은 범위 밖으로 제한했다 |
| BRFplus | Output Management의 출력 결정 역할만 다룬다. ABAP 문법 장이나 OO 패턴 장으로 잘못 분산하지 않는다 |
| ABAP Cloud | Cloud-ready 설계에서는 SAP GUI `GUI_DOWNLOAD`, unreleased classic API, 레거시 output customizing을 기본값으로 두지 않는다 |

## 체험형 학습 설계 점검

| 레슨 | 체험 설계 |
|---|---|
| NEWCH37-L01 | Smart Forms tree 펼치기, Form Interface/Window/Node/Generated FM 하드코딩 오류 찾기 |
| NEWCH37-L02 | Interface/Context/Layout/ADS 상태 칩으로 데이터 문제와 렌더링 인프라 문제 분리 |
| NEWCH37-L03 | NAST 모드와 BRFplus 모드를 전환하는 Output Decision Router, output item/rule/channel 원인 위치 찾기 |
| NEWCH37-L04 | PDF byte pipeline에서 `xstring`, `xstrlen`, `solix_tab`, `BIN` 저장 결과 비교 |
| NEWCH37-L05 | 출력 장애 티켓 보드에서 데이터, 매핑, 결정, 렌더링, 전달 단계별 판별 |

## 기계 점검 기준

작성 후 다음 항목으로 검증한다.

| 점검 | 기대값 |
|---|---|
| 레슨 헤더 | `NEWCH37-L01` ~ `NEWCH37-L05` 모두 존재 |
| 감사 키워드 | `BRF+`, `BRFplus`, `Output Management`, `NAST`, `rule framework` 모두 존재 |
| 코드 핵심 | `SSF_FUNCTION_MODULE_NAME`, `FP_JOB_OPEN`, `FP_FUNCTION_MODULE_NAME`, `xstring`, `xstrlen`, `GUI_DOWNLOAD`, `BIN` 모두 존재 |
| 운영 핵심 | `SP01`, `ADS`, `output item`, `spool request`, `channel` 모두 존재 |
| 문서 품질 | Markdown fence 균형, trailing whitespace 없음, `git diff --check` 통과 |

## 남은 리스크

이 산출물은 reference 재작성 문서이며 실제 `content/abap/CH34` 파일과 embed 구현은 수정하지 않았다. Smart Forms, Adobe Forms, ADS, Output Control, BRFplus 설정은 시스템 release, 업무 영역, customizing, 권한, printer/email 설정, Output Management adoption 상태에 따라 실습 가능 범위가 달라진다.

실제 교육 페이지로 이식할 때는 대상 시스템에서 `SMARTFORMS`, `SFP`, ADS 연결, SP01 접근, Output Control/Output Management 설정 권한, ABAP Cloud/released API 정책을 다시 맞춰야 한다.
