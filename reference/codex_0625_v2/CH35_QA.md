# CH35_QA - 운영 품질과 배포 관리

## 판정

PASS. `reference/codex_0625/00_QUALITY_REVIEW.md`에서 지적한 v1의 반복 템플릿, 본문 빈약, 자동 문서 매칭 문제를 CH35 범위에서 해소했다. 산출물은 `reference/codex_0625_v2/CH35_REWRITE.md`이며, 다섯 레슨 모두 운영 품질 게이트 흐름으로 재집필했다.

## 입력 자료

| 구분 | 확인 내용 |
| --- | --- |
| 원본 챕터 | `content/abap/CH35/_chapter.md`, `CH35-L01.md` ~ `CH35-L05.md` |
| 기존 v1 | `reference/codex_0625/CH35_운영-품질과-배포-관리-이송-심화.md` |
| 품질 기준 | `reference/codex_0625/00_QUALITY_REVIEW.md` |
| 프로젝트 규칙 | `.project-docs/01_AI_SYNC.md`, `.project-docs/04_CONVENTIONS.md`, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/TRACK2_ENRICHMENT.md`, `.project-docs/CONTENT_DEPTH_AUDIT.md` |
| 기존 체험물 | `embeds/abap/CH35-L01-S01.html` ~ `embeds/abap/CH35-L05-S01.html` |

## 재작업 기준 반영

| 요구 | 반영 결과 |
| --- | --- |
| v1의 템플릿 반복 제거 | v1의 공통 지시문과 반복 표현을 사용하지 않고 ATC, ABAP Unit, Transport, Background Job, Application Log의 운영 맥락으로 새로 작성했다. |
| 완성 강의자료 수준 재집필 | 각 레슨을 실제 운영 품질 체인으로 풀어 쓰고, 입문자가 어떤 화면·상태·로그를 확인할지 직접 설명했다. |
| 입문자 흐름 | 모든 레슨에 `왜 필요한가`, `무엇인가`, `어떻게 확인하는가`, `실수와 주의`, `체험형 학습 설계`, `정리`를 배치했다. |
| 코드와 체험 연결 | ABAP Unit, `SUBMIT ... VIA JOB`, BAL function module 흐름을 코드 예제로 제시하고, CH35-L01~L05 위젯의 버튼·상태·데이터·피드백을 구체화했다. |
| Classic ABAP 공식문서 수동 확인 | `C:\ABAP_DOCU_HTML`에서 ABAP Unit, test class/method, `SUBMIT VIA JOB`, `JOB_OPEN`, `JOB_CLOSE` 근거를 직접 확인했다. |
| ABAP Cloud/Clean Core 계열 수동 확인 | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU`에서 ATC guideline, ATC glossary, ABAP Cloud glossary, released API glossary, cloud readiness cheat sheet를 직접 확인했다. |
| 로컬에서 확인 안 되는 근거 보충 | Application Log/BAL, SM36/SM37, CTS/STMS 화면성 근거는 SAP Help 공식 문서로 보충했다. NotebookLM은 추가 보충 필요가 없어 사용하지 않았다. |
| R15/classic-first | CH35는 Track 2 후반이므로 CH18/19/20/23/24/26 이후 학습 범위 안에서 운영 품질을 정식 도입했다. ATC central setup, CTS customizing, ChaRM, gCTS 전략, batch server tuning, BAL customizing 전체는 범위 밖으로 제한했다. |

## 레슨별 품질 점검

| 레슨 | v1/감사 지적 | v2 보강 | 판정 |
| --- | --- | --- | --- |
| CH35-L01 | ATC/SCI가 개념 나열과 generic gate 수준 | ATC variant, finding priority, exemption, transport release gate, Code Inspector와 Cloud readiness 경계 보강 | PASS |
| CH35-L02 | ABAP Unit 설명이 회귀 방지와 gate까지 충분히 이어지지 않음 | `FOR TESTING`, `CL_ABAP_UNIT_ASSERT`, test double, red/green failure, CI/gCTS/transport gate 연결 보강 | PASS |
| CH35-L03 | Transport가 DEV-QAS-PRD 흐름 위주로 짧음 | request/task, object completeness, dependency order, STMS import log, PRD 직접 변경 금지, simulator 상태 설계 보강 | PASS |
| CH35-L04 | Background Job이 상태 흐름과 `SUBMIT VIA JOB`만 압축됨 | SM36/SM37, job status, job log/spool, `JOB_OPEN -> SUBMIT -> JOB_CLOSE`, restart/duplicate prevention, failure feedback 보강 | PASS |
| CH35-L05 | Application Log가 BAL 함수 나열 수준 | object/subobject, external number, message type, SLG1 검색, sensitive data, `BAL_DB_SAVE`, SM37 연계 보강 | PASS |

## Classic ABAP 공식 문서 수동 확인 내역

| 범위 | 확인한 파일 | v2 반영 |
| --- | --- | --- |
| ABAP Unit 개요 | `C:\ABAP_DOCU_HTML\abenabap_unit.htm` | ABAP Unit은 unit test framework이며 local test class와 test method로 작성하고 ATC/ABAP Unit Browser 등으로 대량 실행 가능하다는 설명 |
| Test class | `C:\ABAP_DOCU_HTML\abapclass_for_testing.htm` | `CLASS ... DEFINITION FOR TESTING`, risk level, duration, fixture method, test double은 test class에 두어야 한다는 설명 |
| Test method/assert | `C:\ABAP_DOCU_HTML\abapmethods_testing.htm` | `METHODS ... FOR TESTING`, `CL_ABAP_UNIT_ASSERT=>ASSERT_EQUALS` 등 assert method 설명 |
| `SUBMIT VIA JOB` | `C:\ABAP_DOCU_HTML\abapsubmit_via_job.htm` | `VIA JOB`은 `AND RETURN`과 함께만 사용 가능하며 job number는 `JOB_OPEN`에서 받아야 한다는 설명 |
| `SUBMIT` 문맥 | `C:\ABAP_DOCU_HTML\abapsubmit.htm` | executable program 호출과 report scheduling 문맥 |
| Background glossary | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md\ABENBACKROUND_PROCESSING_GLOSRY.md` | background processing은 사용자 dialog 없이 별도 background session에서 실행된다는 설명 |
| CTS glossary | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENCTS_GLOSRY.md` | CTS는 repository object 등을 AS ABAP 시스템 사이에서 관리·이송하며 package로 연결된다는 설명 |

## ABAP Cloud / Clean Core 경계 확인

| 범위 | 확인한 파일 | v2 반영 |
| --- | --- | --- |
| ATC guideline | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md\ABENABAP-TESTCOCKPIT_GUIDL.md` | ATC는 ABAP Workbench/ADT, Transport Organizer에 통합된 검사 프레임워크이며 transport release에 통합할 수 있다는 설명 |
| ATC glossary | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENATC_GLOSRY.md` | ATC는 repository object 검사·평가 프레임워크이며 ADT/CTS와 연결된다는 설명 |
| ABAP Cloud | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_CLOUD_GLOSRY.md` | ABAP Cloud는 restricted language version, released API, ADT 중심 개발이라는 경계 |
| Released API | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENRELEASED_API_GLOSRY.md` | Cloud-ready 판단은 released API와 release contract 기준 |
| Cloud readiness ATC | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-cheat-sheets-main\19_ABAP_for_Cloud_Development.md` | classic ABAP에서 `ABAP_CLOUD_READINESS` ATC variant로 cloud readiness를 점검할 수 있다는 경계 |

## SAP Help 공식 보충 확인

| 범위 | 공식 URL | v2 반영 |
| --- | --- | --- |
| Application Log/BAL | `https://help.sap.com/docs/SAP_NETWEAVER_AS_ABAP_FOR_SOH_740/addb96cd90c945dfb3182865363bbc47/4e23b1720771417fe10000000a15822b.html?locale=en-US&state=PRODUCTION&version=7.40.21` | `BAL_LOG_CREATE`, `BAL_LOG_MSG_ADD`, `BAL_DB_SAVE`, `BAL_DB_SEARCH`, SLG1 display profile 흐름 |
| Application Log methodology | `https://help.sap.com/docs/SUPPORT_CONTENT/abap/3353524098.html` | `BAL_LOG_CREATE`와 SLG1 조회, filtering 관점 보충 |
| Background job scheduling | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/b07e7195f03f438b8e7ed273099d74f3/4b2b2954365474fee10000000a421937.html` | SM36에서 background job을 정의·스케줄링하는 설명 |
| Job start conditions | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/b07e7195f03f438b8e7ed273099d74f3/4b2b2b4a365474fee10000000a421937.html` | SM36 job start condition 확인 흐름 |
| Background job administration t-codes | `https://help.sap.com/docs/SUPPORT_CONTENT/basis/3354611684.html` | SM36 define, SM37 overview 등 job administration 화면 확인 |
| ATC transport Q-Gate | `https://help.sap.com/docs/SAP_NETWEAVER_750/ba879a6e2ea04d9bb94c7ccd7cdac446/73473fd593fc417ba7a6367423f1e535.html?version=7.5.29` | ATC automatic transport checking은 transport release 시점 Q-Gate로 작동한다는 설명 |
| CTS roles/tools | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/864321b9b3dd487d94c70f6a007b0397/3145ef39521e3314e10000000a11402f.html` | Transport Organizer SE01/SE09, STMS 관련 권한과 도구 확인 |
| CTS transaction overview | `https://help.sap.com/docs/SUPPORT_CONTENT/abap/3353523988.html` | SE09/SE10은 Transport Organizer라는 t-code 확인 |

## R15 및 classic-first 점검

CH35는 Track 2 후반이며 운영 품질·배포·배치·로그를 묶는 장이다.

| 항목 | 처리 |
| --- | --- |
| Modern ABAP | CH18 이후라 inline declaration, constructor expression, class method 표기 가능 |
| Modern SQL | CH19 이후라 ATC 성능 finding에서 SQL 품질 경고를 언급 가능 |
| OO/class | CH20 이후라 ABAP Unit test class와 production class 분리 설명 가능 |
| 예외/품질 기초 | CH23 이후라 오류 처리와 품질 gate 언어를 사용할 수 있음 |
| 배치/로그 기초 | CH24 이후라 background job과 log를 운영 관점으로 확장 가능 |
| 테스트 기초 | CH26 이후라 ABAP Unit을 회귀 gate로 확장 가능 |
| ABAP Cloud | CH23 이후 경계로 언급 가능. 다만 CH35는 classic-first로 ATC cloud readiness와 released API 여부만 제한적으로 언급 |

## 체험형 학습 설계 점검

| 레슨 | 체험 설계 |
| --- | --- |
| CH35-L01 | ATC finding dashboard에서 P1/P2/P3 finding, `수정 후 재검사`, exemption drawer, release gate 상태 변화를 확인한다. |
| CH35-L02 | ABAP Unit runner에서 `테스트 실행`, `버그 주입`, expected/actual feedback, local/transport/CI gate 차이를 확인한다. |
| CH35-L03 | DEV-QAS-PRD transport simulator에서 task release, request release, import, dependency error, import log를 확인한다. |
| CH35-L04 | Background job state machine에서 release/start/finish/fail/restart, SM37 status, job log, spool, SLG1 연결을 확인한다. |
| CH35-L05 | SLG1 viewer simulator에서 전체/오류/경고/성공 필터, external number, 재처리 후보, 민감정보 검사를 확인한다. |

## 기계 점검 결과

| 점검 | 명령 | 결과 |
| --- | --- | --- |
| 레슨 수 | `rg -c "^## CH35-L0[1-5]" reference\codex_0625_v2\CH35_REWRITE.md` | 5 |
| 필수 흐름 섹션 수 | `rg -c "^### (왜 필요한가\|무엇인가\|어떻게 확인하는가\|실수와 주의\|체험형 학습 설계\|정리)$" reference\codex_0625_v2\CH35_REWRITE.md` | 30 |
| 오염 패턴 묶음 | v1 반복 문구와 잘못된 자동 문서명 패턴을 `rg`로 검색 | hit 없음 |
| 핵심 키워드 | ATC, Code Inspector, ABAP Unit, `FOR TESTING`, Transport, SE09, SE10, STMS, SM36, SM37, `SUBMIT`, `VIA JOB`, `AND RETURN`, BAL, SLG1 검색 | 모두 확인 |
| whitespace | `rg -n "[ \t]+$" reference\codex_0625_v2\CH35_REWRITE.md reference\codex_0625_v2\CH35_QA.md` | hit 없음 |
| 공식문서 경로 | QA에 기록한 `C:\ABAP_DOCU_HTML` 및 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU` 근거 파일 `Test-Path` 확인 | 모두 OK |

## 남은 리스크

CH35는 reference 재작성 산출물이므로 실제 `content/abap/CH35` 빌드나 embed 구현 변경은 수행하지 않았다. ATC variant, transport release gate, CTS route, SM36/SM37 권한, BAL object/subobject customizing, background server capacity, Cloud readiness 기준은 고객 시스템과 release 정책에 따라 달라진다. 실제 교육 페이지로 이식할 때는 대상 시스템의 ATC policy, CTS/STMS landscape, batch 운영 표준, SLG1 권한과 보존 정책을 다시 맞추는 것이 좋다.
