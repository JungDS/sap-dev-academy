# NEWCH32_OLDCH29_QA - Enhancement / BAdI / User Exit

## 최종 판정

PASS. `content/abap/CH29`의 다섯 레슨을 v3 파일명 규칙에 맞춰 `NEWCH32_OLDCH29_REWRITE.md`로 재집필했다. 원본의 User Exit, Customer Exit, Enhancement Point/Section, BAdI, Implicit/Explicit 판단, Clean Core 경계를 모두 유지하면서 입문자가 "표준을 직접 수정하지 않고 확장 지점을 찾는 절차"를 따라갈 수 있도록 보강했다.

이번 장은 감사표에서 CH05가 "표준 확장 심화"로 남긴 예정 회수 항목도 닫는다. `.APPEND`에서 배운 직접 수정 금지 감각을 CH29의 표준 확장 판단으로 연결했고, 신규 요구에서는 BAdI와 명시적 enhancement를 먼저 찾는 흐름을 확정했다.

## 입력 자료

| 구분 | 확인 내용 |
|---|---|
| 원본 챕터 | `content/abap/CH29/_chapter.md`, `CH29-L01.md` ~ `CH29-L05.md` |
| v2 보조 자료 | `reference/codex_0625_v2/CH29_REWRITE.md`, `CH29_QA.md` |
| v3 감사 기준 | `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md` |
| 프로젝트 키워드 감사 | `.project-docs/11_KEYWORD_AUDIT.md` CH29 메모 |
| Track 2 체험물 메모 | `.project-docs/TRACK2_ENRICHMENT.md` CH29 위젯/엔진 메모 |
| 기존 임베드 | `embeds/abap/CH29-L01-S01.html` ~ `CH29-L05-S01.html` |

## 레슨별 반영 점검

| v3 레슨 | 원본 | 보강 결과 | 판정 |
|---|---|---|---|
| NEWCH32-L01 | CH29-L01 Customer Exit / User Exit 개념 | 표준 직접 수정 금지, `CALL CUSTOMER-FUNCTION`, `FUNCTION EXIT_...`, `SMOD`, `CMOD`, activation, obsolete 경계, 디버그 확인 흐름 반영 | PASS |
| NEWCH32-L02 | CH29-L02 Enhancement Point / Section | `ENHANCEMENT-POINT`, `ENHANCEMENT-SECTION`, `ENHANCEMENT ... ENDENHANCEMENT`, Point는 추가, Section은 대체라는 책임 차이 반영 | PASS |
| NEWCH32-L03 | CH29-L03 BAdI 정의와 구현 | BAdI interface, `GET BADI`, `CALL BADI`, filter, fallback, single-use/multiple-use, `SE18`, `SE19`, activation 반영 | PASS |
| NEWCH32-L04 | CH29-L04 Implicit / Explicit Enhancement 판단 | BAdI -> Explicit Point -> Section -> Implicit -> Modification 판단 트리, implicit 위치와 위험, 선택 근거 문서화 반영 | PASS |
| NEWCH32-L05 | CH29-L05 Clean Core 관점의 확장 기준 | released API, ABAP for Cloud Development, Key User/Developer Extensibility, private API 금지, package/transport/test 문서화 반영 | PASS |

## 감사 회수 점검

| 감사 항목 | 이전 상태 | v3 처리 |
|---|---|---|
| CH05 `.APPEND` 표준 확장 심화 | CH23 Clean Core, CH29 Enhancement와 연결 가능. 예정 회수 | `NEWCH32_OLDCH29`에서 표준 직접 수정 금지, BAdI/Enhancement 우선, Clean Core 판단으로 회수 완료 |
| CH23 Clean Core 운영 관점 | 후속 장들과 연결 | L05에서 확장 기준으로 재사용 |
| CH29 원본 공식성 | `.project-docs/11_KEYWORD_AUDIT.md`에서 공식과 일치 | v3에서도 핵심 키워드 유지, 미학습 constructor expression 없음 |

## Classic ABAP 공식 문서 수동 확인 내역

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| Customer Exit | `C:\ABAP_DOCU_HTML\abapcall_customer-function.htm`, `abencustomer_exit_glosry.htm` | `CALL CUSTOMER-FUNCTION`, function exit, `SMOD`, `CMOD`, activation, obsolete 경계 |
| User Exit/Form 경계 | `C:\ABAP_DOCU_HTML\abapform_definition.htm` | FORM 기반 User Exit를 레거시 읽기 능력으로 설명 |
| Enhancement Framework | `C:\ABAP_DOCU_HTML\abenenhancement_framework.htm`, `abenenhancement_framework_glosry.htm` | source code plug-in과 BAdI가 modification 없이 확장하는 틀 |
| Explicit source enhancement | `C:\ABAP_DOCU_HTML\abapenhancement-point.htm`, `abapenhancement-section.htm`, `abenexplicit_enh_points.htm` | Point와 Section의 추가/대체 차이 |
| Implicit enhancement | `C:\ABAP_DOCU_HTML\abenimplicit_enh_points.htm` | procedure 시작/끝, include/compilation unit 조건, editor 표시 절차 |
| BAdI | `C:\ABAP_DOCU_HTML\abenbadi_glosry.htm`, `abenbadi_enhancement.htm`, `abapget_badi.htm`, `abapcall_badi.htm`, `abapinterface_definition.htm` | BAdI interface, filters, fallback, `GET BADI`, `CALL BADI`, single/multiple-use |

## ABAP Cloud / Clean Core 경계 확인

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| ABAP Cloud | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_CLOUD_GLOSRY.md` | cloud-ready, upgrade-stable, restricted ABAP language version 경계 |
| Released API | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENRELEASED_API_GLOSRY.md` | released API는 release contract와 restricted language visibility가 있는 객체 또는 일부라는 설명 |
| ABAP for Cloud Development | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_FOR_CLOUD_DEV_GLOSRY.md` | restricted language scope와 released API 접근 |
| Key User Extensibility | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_FOR_KEY_USERS_GLOSRY.md` | 제한된 확장 접근으로 L05 판단 기준에만 사용 |
| Developer Extensibility | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENDEV_EXTENSIBILITY_GLOSRY.md` | ADT와 released API 기반 upgrade-stable custom code |
| Classic ABAP | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENCLASSIC_ABAP_GLOSRY.md` | Classic ABAP은 legacy solution model이며 이 장의 primary context임을 명시 |

## R15 및 classic-first 점검

| 항목 | 점검 |
|---|---|
| Function Module | CH10 이후이므로 Customer Exit의 function module 흐름 설명 가능 |
| OO/interface | CH20 이후이므로 BAdI interface, implementation class, polymorphic call 설명 가능 |
| Clean Core | CH23 이후이므로 L05에서 standard modification 금지와 released API 판단 연결 가능 |
| DML/LUW | CH24/CH25 이후이므로 extension 안의 임의 commit/update/lock 우회 위험 설명 가능 |
| ABAP Cloud | L05에서 판단 기준으로만 사용하고 RAP/Fiori 구현으로 확장하지 않음 |
| 후속 연동 장 | RFC/BAPI/IDoc/Gateway/RAP 구현 세부는 CH30 이후로 유지 |

## 체험형 학습 설계 점검

| 레슨 | 체험 설계 |
|---|---|
| NEWCH32-L01 | 표준 흐름, 고객 exit slot, CMOD activation, 표준 소스 변경 0줄, 디버그 흐름 |
| NEWCH32-L02 | Point 추가와 Section 대체 비교, 활성화, 표준 줄 변경 카운터, 테스트 범위 배지 |
| NEWCH32-L03 | SE18 정의, SE19 구현, filter 전환, implementation on/off, multiple-use 호출 로그 |
| NEWCH32-L04 | 요구 카드 기반 decision tree, 위험도 색상, 선택 근거 체크리스트 |
| NEWCH32-L05 | Clean Core 카드 분류 퀴즈, 채점, 개선 제안, Classic 허용성과 Cloud-ready 비교 |

## 기계 점검 기준

작성 후 다음 항목으로 검증한다.

| 점검 | 기대값 |
|---|---|
| 레슨 헤더 | `NEWCH32-L01` ~ `NEWCH32-L05` 모두 존재 |
| Customer Exit | `CALL CUSTOMER-FUNCTION`, `FUNCTION EXIT_`, `SMOD`, `CMOD` 존재 |
| Enhancement | `ENHANCEMENT-POINT`, `ENHANCEMENT-SECTION`, `ENHANCEMENT`, `ENDENHANCEMENT`, `implicit` 존재 |
| BAdI | `GET BADI`, `CALL BADI`, `SE18`, `SE19`, `filter`, `single-use`, `multiple-use` 존재 |
| Clean Core | `Clean Core`, `released API`, `Key User Extensibility`, `Developer Extensibility` 존재 |
| 경계 | RAP/Fiori/RFC/BAPI/IDoc 구현으로 확장하지 않음 |
| 문서 품질 | Markdown fence 균형, trailing whitespace 없음, `git diff --check` 통과 |

## 남은 리스크

이 산출물은 reference 재작성 문서이며 실제 `content/abap/CH29` 파일과 embed 구현은 수정하지 않았다. 실제 교육 페이지로 이식할 때는 대상 시스템의 release, Enhancement Framework 사용 가능 여부, BAdI definition, filter 조건, implementation activation, package/transport 정책을 다시 확인해야 한다.

Customer Exit, implicit enhancement, modification은 시스템 정책과 운영 규정에 따라 허용 범위가 크게 다를 수 있다. 이 문서는 초급에서 고급으로 넘어가는 학습자가 판단 흐름을 갖추도록 돕는 강의자료이며, 실제 운영 변경은 프로젝트 governance와 함께 결정해야 한다.
