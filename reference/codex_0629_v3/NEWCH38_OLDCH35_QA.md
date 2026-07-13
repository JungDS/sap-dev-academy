# NEWCH38_OLDCH35_QA · 운영 품질과 배포 관리 검수

> 대상 파일: `NEWCH38_OLDCH35_REWRITE.md`
> 판정일: 2026-07-06 KST
> 결론: 작성 완료. OLDCH35 원본 전체를 v3 품질로 재집필했고, `00_CONCEPT_GAP_AUDIT.md`의 P2 Test Double 보강 요구를 CH35-L02A에서 회수했다.

## 1. 작업 범위

| 항목 | 내용 |
|---|---|
| 원본 챕터 | OLDCH35 · 운영 품질과 배포 관리 |
| 신규 번호 | `NEWCH38_OLDCH35` |
| 원본 레슨 | L01 ATC/Code Inspector, L02 ABAP Unit, L03 Transport, L04 Background Job, L05 Application Log |
| 신규 보강 | L02A Test Double 심화 |
| 산출물 | `NEWCH38_OLDCH35_REWRITE.md`, `NEWCH38_OLDCH35_QA.md` |
| 감사 회수 대상 | ABAP Test Double Framework, `TEST-SEAM`, `TEST-INJECTION` |

## 2. 원본 레슨 커버리지

| 원본 | v3 반영 위치 | 반영 내용 |
|---|---|---|
| `_chapter.md` | `NEWCH38 전체 설계`, `NEWCH38 마무리` | 운영 품질 체인을 개발 완료 -> 테스트 -> ATC -> 이송 -> 배치 -> 로그 흐름으로 재정의 |
| `CH35-L01.md` | `NEWCH38-L01` | ATC, Code Inspector, finding, priority, variant, exemption, transport release gate |
| `CH35-L02.md` | `NEWCH38-L02` | ABAP Unit 회귀 방지, test class/method, assert, red/green gate |
| 신규 보강 | `NEWCH38-L02A` | manual fake/mock, `CL_ABAP_TESTDOUBLE`, ABAP SQL/CDS Test Double, `TEST-SEAM`/`TEST-INJECTION` 비교 |
| `CH35-L03.md` | `NEWCH38-L03` | SE09/SE10, request/task, STMS, DEV/QAS/PRD, import log, dependency order |
| `CH35-L04.md` | `NEWCH38-L04` | SM36/SM37, job status, job log/spool, `JOB_OPEN -> SUBMIT VIA JOB AND RETURN -> JOB_CLOSE` |
| `CH35-L05.md` | `NEWCH38-L05` | BAL, SLG1, object/subobject, external number, message context, `BAL_DB_SAVE` |

판정: 원본 5개 레슨을 모두 반영했고, 감사표에서 요구한 테스트 더블 심화는 별도 L02A로 추가해 L02가 과밀해지지 않게 했다.

## 3. 공식 문서 수동 확인

Classic ABAP 문서는 `C:\ABAP_DOCU_HTML`에서 확인했다. ABAP Cloud 및 테스트 더블 보조 자료는 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU`에서 확인했다. 로컬 문서만으로 부족한 운영 화면성 자료는 SAP Help 공식 문서로 보충했다.

| 주제 | 확인 문서 |
|---|---|
| ATC | `C:\ABAP_DOCU_HTML\abenabap-testcockpit_guidl.htm`, `abenabap_test_cockpit_glosry.htm` |
| ABAP Unit | `abenabap_unit.htm`, `abapclass_for_testing.htm`, `abapmethods_testing.htm` |
| Test Double/Test Seam | `abapcreate_object_for_testing.htm`, `abentest_seams.htm`, `abaptest-seam.htm`, `abaptest-injection.htm` |
| ABAP Unit cheat sheet | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-cheat-sheets-main\14_ABAP_Unit_Tests.md` |
| SQL/CDS test double examples | `ztcl_demo_abap_unit_tdf_testcl.clas.testclasses.abap` |
| Background job ABAP syntax | `abapsubmit_via_job.htm`, `abapsubmit.htm` |
| Application Log/BAL | SAP Help Application Log Methodology, Function Module Overview |
| Job scheduling | SAP Help Scheduling Background Jobs, Specifying Job Start Conditions |
| Transport | SAP Help Transport Organizer/CTS references |

## 4. P2 감사 회수 판정

`00_CONCEPT_GAP_AUDIT.md`의 P2 후보는 "ABAP Test Double Framework, `TEST-SEAM`, `TEST-INJECTION`을 CH35에서 회수해야 하는가"였다. 이번 CH35 재집필에서 다음처럼 회수했다.

| 후보 | 반영 위치 | 판정 |
|---|---|---|
| manual fake/mock | L02A | CH26 DI 기초에서 운영 품질 테스트로 확장 |
| `CL_ABAP_TESTDOUBLE` | L02A | framework가 return/export/exception/interaction 설정을 돕는다는 개념과 제약을 설명 |
| ABAP SQL Test Double | L02A | `CL_OSQL_TEST_ENVIRONMENT`를 table/CDS view entity dependency 격리 수단으로 소개 |
| CDS Test Double | L02A | `CL_CDS_TEST_ENVIRONMENT`를 CDS entity dependency 격리 수단으로 소개 |
| `TEST-SEAM` | L02A | production code의 replaceable block으로 설명 |
| `TEST-INJECTION` | L02A | test class에서 seam을 대체하는 injection으로 설명 |
| Legacy vs new code 경계 | L02A | test seam은 legacy 보완용, 새 코드는 DI/interface 우선으로 명시 |

판정: P2 Test Double 보강 요구는 완료.

## 5. R15 게이팅

| 점검 항목 | 판정 | 근거 |
|---|---|---|
| CH26 테스트 가능 설계 이후 배치인가 | 통과 | CH35가 CH26 이후이므로 DI/mock을 전제로 test double 심화 가능 |
| CH35 범위를 Basis 운영 전체로 과확장하지 않았는가 | 통과 | CTS route customizing, ChaRM, batch server tuning, BAL customizing 전체는 보류 |
| Classic-first인가 | 통과 | ATC, ABAP Unit, SE09/SE10, STMS, SM36/SM37, BAL/SLG1 중심 |
| ABAP Cloud/Clean Core는 경계로만 다뤘는가 | 통과 | released API/cloud readiness는 ATC gate로 소개하고 세부 tenant 설정은 CH36 연결 |
| CH36 capstone을 침범하지 않는가 | 통과 | 운영 품질 기준만 만들고 RAP/Fiori 최종 앱 실습은 CH36으로 연결 |
| CH34 Output/BRF+를 침범하지 않는가 | 통과 | Application Log와 background 운영만 다루고 Output Management/BRF+ rule engine은 다루지 않음 |

## 6. 입문자 강의 흐름

각 레슨은 왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 체험 설계 -> 정리 흐름으로 작성했다.

| 레슨 | 입문자 관점 강화 |
|---|---|
| L01 | "사람 눈만으로는 놓친다"에서 자동 품질 gate 필요성 도출 |
| L02 | "고쳤더니 기존 기능이 깨졌다"에서 회귀 테스트 필요성 도출 |
| L02A | 의존성 모양별로 어떤 test double을 선택할지 비교 |
| L03 | CH01 이송요청을 운영 통제 흐름으로 확장 |
| L04 | dialog 실행과 background 운영의 차이를 상태/로그 중심으로 설명 |
| L05 | `WRITE`가 운영 로그가 아닌 이유에서 BAL/SLG1 필요성 도출 |

## 7. 체험/시뮬레이터 설계

| 레슨 | 체험 설계 | 포함 요소 |
|---|---|---|
| L01 | ATC Finding Gate Simulator | finding, priority, exemption, release gate, cloud readiness |
| L02 | ABAP Unit Release Gate | red/green, expected/actual, local/transport/CI gate |
| L02A | Test Double Decision Lab | dependency type, selected technique, isolation score, maintenance risk |
| L03 | Transport Flow Board | DEV/QAS/PRD lane, task/request release, import log, dependency order |
| L04 | Background Job State Machine | scheduled/released/active/finished/canceled, spool, job log, SLG1 link |
| L05 | SLG1 Application Log Viewer | object/subobject filter, message type, retry candidates, sensitive data warning |
| 종합 | 운영 반영 준비 보드 | ABAP Unit, ATC, Transport, QAS, Background Job, Application Log, Clean Core checklist |

## 8. 주요 실수 방지

| 실수 | 반영 위치 |
|---|---|
| ATC를 마지막 의식처럼 한 번만 돌림 | L01 |
| warning/exemption을 근거 없이 무시 | L01 |
| DB/화면 의존 테스트를 unit test로 착각 | L02-L02A |
| 새 코드에 바로 `TEST-SEAM`부터 넣음 | L02A |
| `CL_ABAP_TESTDOUBLE`이 모든 class를 대체한다고 오해 | L02A |
| transport object 누락/순서 역전 | L03 |
| PRD 직접 수정 | L03 |
| dialog report를 그대로 background job으로 실행 | L04 |
| `SUBMIT VIA JOB`에서 `AND RETURN` 규칙 누락 | L04 |
| `WRITE`나 임시 internal table을 운영 로그로 착각 | L05 |
| `BAL_DB_SAVE` 누락 | L05 |
| 민감정보를 Application Log에 기록 | L05 |

## 9. 자동 검증 기준

작업 후 다음을 확인한다.

| 검증 | 기대 |
|---|---|
| `NEWCH38_OLDCH35_REWRITE.md` 존재 | 통과 필요 |
| `NEWCH38_OLDCH35_QA.md` 존재 | 통과 필요 |
| `rg "^## NEWCH38-L0"` | L01, L02, L02A, L03, L04, L05 존재 |
| `rg "CL_ABAP_TESTDOUBLE|TEST-SEAM|TEST-INJECTION|CL_OSQL_TEST_ENVIRONMENT|CL_CDS_TEST_ENVIRONMENT"` | P2 보강 키워드 존재 |
| `git diff --check` | trailing whitespace 없음 |

## 10. 잔여 리스크

| 리스크 | 처리 |
|---|---|
| Test Double Framework API는 릴리스별 세부 차이가 있음 | L02A에서 개념 스켈레톤으로 표시하고 시스템 릴리스 문서 확인을 명시 |
| SM36/SM37/STMS 권한과 화면은 고객 시스템마다 다름 | 절차 지도와 확인 포인트 중심으로 작성 |
| BAL object/subobject customizing은 프로젝트 정책 의존 | CH35에서는 기본 로그 설계와 SLG1 조회 감각까지만 다룸 |
| gCTS/CI/CD 운영은 회사별 차이가 큼 | gate 개념만 다루고 전략 설계는 범위 밖으로 제한 |

## 11. 최종 판정

`NEWCH38_OLDCH35_REWRITE.md`는 OLDCH35 원본의 운영 품질 주제를 완성 강의자료 수준으로 재집필했다. 또한 CH26에서 보류된 ABAP Test Double Framework, `TEST-SEAM`, `TEST-INJECTION`을 CH35의 테스트 운영 맥락에서 회수했다.

최종 판정: **통과**
