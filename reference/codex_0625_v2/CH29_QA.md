# CH29_QA - Enhancement / BAdI / User Exit

## 판정

PASS. `reference/codex_0625/00_QUALITY_REVIEW.md`에서 지적한 v1의 진단 템플릿 반복, 본문 빈약, 자동 문서 매칭 문제를 CH29 범위에서 해소했다. 산출물은 `reference/codex_0625_v2/CH29_REWRITE.md`이며, 각 레슨은 입문자 기준으로 왜 필요한가, 무엇인가, 어떻게 확인하는가, 실수와 주의, 체험형 학습 설계, 정리 흐름을 가진다.

## 입력 자료

| 구분 | 확인 내용 |
| --- | --- |
| 원본 챕터 | `content/abap/CH29/_chapter.md`, `CH29-L01.md` ~ `CH29-L05.md` |
| 기존 v1 | `reference/codex_0625/CH29_Enhancement-BAdI-User-Exit.md` |
| 품질 기준 | `reference/codex_0625/00_QUALITY_REVIEW.md` |
| 프로젝트 규칙 | `.project-docs/01_AI_SYNC.md`, `.project-docs/04_CONVENTIONS.md`, `.project-docs/11_KEYWORD_AUDIT.md`, `.project-docs/CONTENT_DEPTH_AUDIT.md`, `.project-docs/TRACK2_ENRICHMENT.md` |
| 기존 체험물 | `embeds/abap/CH29-L01-S01.html` ~ `embeds/abap/CH29-L05-S01.html` |

## 재작업 기준 반영

| 요구 | 반영 결과 |
| --- | --- |
| v1의 템플릿 반복 제거 | v1의 진단 문장과 반복 형식을 옮기지 않고 CH29 본문을 새로 구성했다. |
| 완성 강의자료 수준 재집필 | 다섯 레슨 모두 개념 도입, 확인 절차, 위험 판단, 실습 설계까지 포함했다. |
| 입문자 흐름 | 각 레슨에 `왜 필요한가`, `무엇인가`, `어떻게 확인하는가`, `실수와 주의`, `체험형 학습 설계`, `정리`를 배치했다. |
| 코드가 있는 레슨의 체험 설계 | L01~L03은 코드 흐름과 버튼, 상태, 데이터, 피드백을 명시했다. L04~L05는 판단 트리와 퀴즈형 상호작용을 구체화했다. |
| 공식문서 수동 확인 | `C:\ABAP_DOCU_HTML`에서 관련 파일을 직접 열어 확인했고, 임의 자동 매칭 문서명은 넣지 않았다. |
| R15 게이팅 | CH29 이전에 학습한 함수 모듈, 인터페이스, 품질 관점을 전제로 삼고, RAP/연동 구현 세부는 경계 처리했다. |
| classic-first | User Exit, Customer Exit, Enhancement Framework, BAdI를 먼저 설명하고 ABAP Cloud는 Clean Core 판단 기준으로만 다뤘다. |

## 레슨별 품질 점검

| 레슨 | v1/감사 지적 | v2 보강 | 판정 |
| --- | --- | --- | --- |
| CH29-L01 | Customer Exit와 User Exit 설명이 짧고 흐름이 압축됨 | 표준 호출 시점, `CALL CUSTOMER-FUNCTION`, `FUNCTION EXIT_...`, `SMOD`/`CMOD`, activation, obsolete 경계, 실습 상태를 분리해 설명 | PASS |
| CH29-L02 | Enhancement Point/Section 본문이 빈약함 | Point는 추가, Section은 대체라는 책임 차이를 코드와 확인 절차, 시뮬레이터 상태로 분리 | PASS |
| CH29-L03 | BAdI 설명이 키워드 중심으로 압축됨 | `GET BADI`, `CALL BADI`, interface contract, filter, single/multiple-use, SE18/SE19 확인 흐름을 완성 | PASS |
| CH29-L04 | 판단 기준이 짧고 체험 연결이 부족함 | BAdI > Explicit Point > Explicit Section > Implicit > Modification 우선순위를 decision tree로 설명 | PASS |
| CH29-L05 | Clean Core가 주의 문장 수준으로 머묾 | Released API, ABAP for Cloud Development, Key User/Developer Extensibility 경계를 수동 문서 근거로 정리하고 퀴즈형 판별 설계 추가 | PASS |

## 공식 문서 수동 확인 내역

| 범위 | 확인한 `C:\ABAP_DOCU_HTML` 파일 | v2 반영 |
| --- | --- | --- |
| Customer Exit | `abapcall_customer-function.htm`, `abencustomer_exit_glosry.htm` | `CALL CUSTOMER-FUNCTION`, `EXIT_...`, `SMOD`, `CMOD`, activation, obsolete 경계 |
| User Exit/Form 경계 | `abapform_definition.htm` | FORM 기반 User Exit를 레거시 읽기 능력으로 설명 |
| Enhancement Framework | `abenenhancement_framework.htm`, `abenenhancement_framework_glosry.htm` | source code plug-in과 BAdI가 modification 없이 확장하는 프레임워크임을 반영 |
| Explicit source enhancement | `abapenhancement-point.htm`, `abapenhancement-section.htm`, `abenexplicit_enh_points.htm` | Point는 삽입, Section은 대체라는 차이를 반영 |
| Implicit enhancement | `abenimplicit_enh_points.htm` | procedure 시작·끝 등 암시적 option 위치와 표시 절차를 반영 |
| BAdI | `abenbadi_glosry.htm`, `abenbadi_enhancement.htm`, `abapget_badi.htm`, `abapcall_badi.htm`, `abapinterface_definition.htm` | BAdI interface, filter, object plug-in, `GET BADI`, `CALL BADI`, single/multiple-use 주의 반영 |
| ABAP Cloud/Clean Core 경계 | `abenabap_cloud_glosry.htm`, `abenabap_for_cloud_dev_glosry.htm`, `abenabap_for_key_users_glosry.htm`, `abenreleased_api_glosry.htm`, `abendev_extensibility_glosry.htm` | restricted language version, released API, Key User/Developer Extensibility를 L05 판단 기준으로만 반영 |

## R15 및 classic-first 점검

CH29는 CH10의 함수 모듈, CH18~CH20의 객체지향과 인터페이스, CH23의 품질 관점 이후에 위치한다. 따라서 BAdI interface, implementation class, filter, Clean Core 판단을 다룰 수 있다.

ABAP Cloud 관련 내용은 L05에서 Clean Core 판단 기준으로만 사용했다. RAP behavior, EML, Gateway, RFC, BAPI, IDoc, file interface 구현은 이 장의 학습 범위로 확장하지 않았다. `CH29_REWRITE.md`에 등장하는 RAP/연동 용어는 경계 설명 목적이다.

## 체험형 학습 설계 점검

| 레슨 | 체험 설계 |
| --- | --- |
| CH29-L01 | exit 활성화 토글, 표준 흐름, 고객 slot, `표준 소스 변경 0줄`, CMOD activation 상태, 디버그 흐름 |
| CH29-L02 | Point 추가와 Section 대체 비교, plug-in 활성화, 표준 줄 변경 카운터, 실행 순서 시각화 |
| CH29-L03 | SE18 정의, SE19 구현, filter 선택, implementation on/off, 호출 로그, multiple-use 상태 |
| CH29-L04 | 확장 수단 선택 트리, 요구 카드, 위험도 색상, 결과별 체크리스트 |
| CH29-L05 | Clean Core 카드 분류 퀴즈, 채점, 개선 제안, Classic 허용성과 Cloud-ready 비교 |

## 기계 점검 결과

| 점검 | 명령 | 결과 |
| --- | --- | --- |
| 레슨 수 | `rg -c "^## CH29-L0[1-5]" reference\codex_0625_v2\CH29_REWRITE.md` | 5 |
| 필수 흐름 섹션 수 | `rg -c "^### (왜 필요한가|무엇인가|어떻게 확인하는가|실수와 주의|체험형 학습 설계|정리)$" reference\codex_0625_v2\CH29_REWRITE.md` | 30 |
| 오염 패턴 묶음 | v1 반복 문구와 잘못된 자동 문서명 패턴을 `rg`로 검색 | hit 없음 |
| 핵심 키워드 | `CALL CUSTOMER-FUNCTION`, `SMOD`, `CMOD`, `ENHANCEMENT-POINT`, `ENHANCEMENT-SECTION`, `GET BADI`, `CALL BADI`, `SE18`, `SE19`, `Clean Core`, `Released API` 검색 | 모두 확인 |

## 남은 리스크

이 산출물은 Markdown 강의자료 재집필이며, 실제 embed HTML을 수정하지 않았다. 기존 `CH29-L01-S01` ~ `CH29-L05-S01` 체험물은 본문에서 설계 수준으로 확장 설명했지만, 실제 UI 동작을 새 설계에 맞춰 개편하려면 별도 작업 단위가 필요하다.
