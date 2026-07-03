# CH22_QA · CDS View Entity 기초 검수

> 대상 산출물: `reference/codex_0629_v3/CH22_REWRITE.md`  
> 작업 단위: CH22 1개 챕터  
> 기준: `content/abap/CH22`, `.project-docs/04_CONVENTIONS.md` R6/R15, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`

## 1. 작업 범위 확인

| 항목 | 확인 |
|---|---|
| 챕터 | CH22 · CDS View Entity 기초 |
| 원본 레슨 수 | L01~L07, 총 7개 |
| 산출 파일 | `CH22_REWRITE.md`, `CH22_QA.md` |
| 주 소스 | `content/abap/CH22` |
| 보조 참고 | `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 직전 v3 CH21 품질 패턴 |
| 품질 목표 | CDS를 DB 위 재사용 모델 계층으로 이해시키는 완성 강의자료 |

CH22는 Track-1 후반의 CDS 기초 장이다. RAP, ABAP Cloud, 트랜잭션 앱, CUD, Behavior Definition, Service Binding은 CH23 이후로 보류한다.

## 2. 원본 레슨 커버리지

| 원본 | v3 반영 위치 | 반영 내용 |
|---|---|---|
| `_chapter.md` | `CH22 전체 설계`, `CH22 R15 경계`, `CH22 최종 정리` | DB 계층 모델링과 재사용이라는 챕터 목표 재정의 |
| `CH22-L01.md` | `CH22-L01 · CDS View Entity 기본 구조` | `define view entity`, DDL source, activation, Data Preview |
| `CH22-L02.md` | `CH22-L02 · Interface View와 Projection View 구분` | `ZI_`/`ZC_`, interface/projection 역할 분리 |
| `CH22-L03.md` | `CH22-L03 · Association 기초` | cardinality, `_Perf`, `$projection`, association 노출 |
| `CH22-L04.md` | `CH22-L04 · Annotation과 의미 부여` | `@EndUserText`, `@UI.lineItem`, `@Semantics`, 자기참조 semantics 오류 방지 |
| `CH22-L05.md` | `CH22-L05 · Metadata Extension 기초` | `@Metadata.allowExtensions`, `@Metadata.layer`, `annotate entity` |
| `CH22-L06.md` | `CH22-L06 · DCL / Authorization 개요` | `@MappingRole`, `define role`, `grant select`, `aspect pfcg_auth` |
| `CH22-L07.md` | `CH22-L07 · 실습: 콘서트 CDS 뷰` | `ZI_Perf`, `ZI_Concert`, `ZC_Concert`, metadata extension 실습 |

판정: 원본 7개 레슨이 모두 별도 절로 반영되었다.

## 3. 공식 문서 수동 확인

다음 문서를 `C:\ABAP_DOCU_HTML` 및 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main`에서 수동 확인했다.

| 주제 | 확인 문서 |
|---|---|
| View Entity | `ABENCDS_DEFINE_VIEW_ENTITY.md`, `abencds_define_view_entity.htm` |
| Projection View | `ABENCDS_DEFINE_VIEW_AS_PROJECTION.md`, `abencds_define_view_as_projection.htm` |
| Association | `ABENCDS_SIMPLE_ASSOCIATION_V2.md`, `ABENCDS_SELECT_LIST_ASSOCIATION_V2.md` |
| Annotation syntax/scope | `ABENCDS_ANNOTATIONS_SYNTAX.md`, `ABENCDS_ANNOTATIONS_SCOPES.md` |
| Semantics annotation | `ABENCDS_SEMANTICS_ANNOTATION_ABEXA.md` |
| Metadata Extension | `ABENCDS_F1_ANNOTATE_VIEW.md`, `ABENCDS_METADATA_EXTENSION_GLOSRY.md`, `ABENCDS_METADATAEXTENSION_A.md` |
| DCL | `ABENCDS_F1_DEFINE_ROLE.md`, `ABENCDS_DCL_ROLE_GRANT_RULE.md`, `ABENCDS_ACCESS_CONTROL.md` |
| ABAP Cloud/RAP 경계 | `ABENABAP_CLOUD_GLOSRY.md`, `ABENARAP_GLOSRY.md` |

확인 결과: CH22에서 사용하는 핵심 CDS DDL/DCL/DDLX 문법은 공식 문서와 정합한다.

## 4. R15 게이팅 및 경계

### CH22에서 허용한 것

| 항목 | 이유 |
|---|---|
| `define view entity` | CH22의 정식 핵심 주제 |
| `as projection on` | CH22 interface/projection 계층 주제 |
| CDS association, cardinality, `$projection` | CH22-L03 정식 주제 |
| `@EndUserText`, `@UI`, `@Semantics` | CH22-L04 annotation 주제 |
| `@Metadata.allowExtensions`, `annotate entity` | CH22-L05 metadata extension 주제 |
| `define role`, `grant select`, `aspect pfcg_auth` | CH22-L06 DCL 개요 주제 |
| ABAP SQL로 CDS 읽기 | CH19 이후 학습분이며 CDS 소비 확인에 필요 |

### CH22에서 보류한 것

| 보류 항목 | 처리 |
|---|---|
| RAP Behavior Definition / Behavior Implementation | CH23 범위 |
| Service Definition / Service Binding | CH23 범위 |
| create/update/delete, transaction, commit/rollback | CH24 범위 |
| lock/concurrency | CH25 범위 |
| advanced composition/to-parent association | RAP/Track-2 심화 범위 |
| Clean Core 운영 상세 | CH23 이후 ABAP Cloud/Clean Core 범위 |

판정: CH22의 CDS 읽기 모델 경계를 지켰고, 후속 트랜잭션/RAP 구현을 앞당기지 않았다.

## 5. 입문자 강의 흐름 점검

| 흐름 | 반영 |
|---|---|
| 왜 필요한가 | classic DDIC View와 반복 SQL의 한계를 통해 CDS 필요성을 설명 |
| 무엇인가 | View Entity, Projection, Association, Annotation, Metadata Extension, DCL을 각각 모델 계층 구성요소로 설명 |
| 어떻게 확인하는가 | ADT activation, Data Preview, association navigation, annotation 적용, DCL 사용자별 row 차이 확인 |
| 실수/주의 | DDL source와 ABAP report 혼동, 이름 불일치, association 미노출, semantics 자기참조, allowExtensions 누락, DCL 적용 오해 |
| 정리 | 각 레슨 핵심과 CH23 RAP로 이어지는 계층 관계를 요약 |

판정: 단순 문법 나열이 아니라 "왜 모델 계층이 필요한가"에서 출발해 실습 확인까지 연결했다.

## 6. 체험형 학습 설계 점검

| 레슨 | 학습 장치 | 데이터/상태/피드백 |
|---|---|---|
| L01 | CDS 활성화 관찰기 | `inactive`, `syntax error`, `active`, preview rows |
| L02 | ZI/ZC 계층 분리 보드 | interface fields, projection fields, consumer impact |
| L03 | Association 길 찾기 시뮬레이터 | source rows, target rows, exposed associations |
| L04 | Annotation 스코프 실험실 | annotation scope, value, consumer effect |
| L05 | UI Annotation 분리 리팩터링 도구 | source annotations, DDLX annotations, layer, conflict |
| L06 | 행 권한 필터 시뮬레이터 | user auth values, role active, visible rows |
| L07 | Concert CDS Model Builder | `ZI_Perf`, `ZI_Concert`, `ZC_Concert`, DDLX activation |

판정: 모든 레슨에 버튼, 상태, 데이터, 피드백 설계를 포함했다.

## 7. 코드·설계 검토

| 항목 | 검토 결과 |
|---|---|
| View Entity 기본형 | `@AccessControl.authorizationCheck`, `@EndUserText.label`, `define view entity`, `as select from` 구성 |
| Projection | `define view entity ZC_Concert as projection on ZI_Concert`로 계층 분리 |
| Association | `[0..*]`, `_Perf`, `$projection.concert_id = _Perf.concert_id`, `_Perf` 노출 |
| Annotation | view/field 위치 구분, `@UI.lineItem` array syntax 사용 |
| Semantics | 원본 감사 이슈였던 `capacity` 자기참조 예시 제거, 단위/통화 짝 필드 원칙 반영 |
| Metadata Extension | `@Metadata.allowExtensions: true`와 `@Metadata.layer: #CORE` 모두 설명 |
| DCL | `@MappingRole: true`, `define role`, `grant select on`, `aspect pfcg_auth` 구조 설명 |
| 콘서트 실습 | `ZI_Perf` 선활성화 후 `ZI_Concert` association, `ZC_Concert` projection 흐름 |

판정: 공식 문서와 프로젝트 감사 원장의 CH22 교정 사항을 반영했다.

## 8. 자동 검증 기준

작업 후 다음 검증을 수행한다.

| 검증 | 기대 |
|---|---|
| `git diff --check` | whitespace 오류 없음 |
| `rg "^## CH22-L0[1-7]"` | L01~L07 헤딩 7개 존재 |
| 반복 문구 검색 | 기존 템플릿형 고정 문구와 이전 챕터 공식문서 힌트 없음 |
| 경계 검색 | CH23/CH24 이후 코드가 CH22 본문 코드로 들어오지 않음 |
| 파일 상태 | `CH22_REWRITE.md`, `CH22_QA.md` 두 파일만 신규 |

## 9. 잔여 리스크

| 리스크 | 판단 |
|---|---|
| SAP 시스템 release별 annotation 지원 차이 | CH22는 기본 annotation과 개념 중심으로 작성했으며, 세부 Fiori annotation matrix는 후속으로 넘김 |
| DCL/PFCG 실습 환경 차이 | 사용자별 권한 결과는 시스템 권한 객체 준비가 필요하므로 시뮬레이터 설계로 보완 |
| RAP와 Projection View 경계 | provider contract와 root/composition 상세는 의도적으로 CH23으로 보류 |
| CDS association 성능 오해 | association은 관계 선언이며 사용 시 join이 생성될 수 있음을 명시 |

## 10. 최종 판정

CH22 재집필본은 다음 기준을 충족한다.

- 기존 템플릿 반복 없이 레슨별 고유 흐름으로 재작성했다.
- IT 비전공자가 CDS를 "DB 위 모델 계층"으로 이해하도록 왜 필요한가부터 설명했다.
- 공식 문서 확인 결과와 `.project-docs/11_KEYWORD_AUDIT.md`의 CH22 교정 사항을 반영했다.
- 모든 레슨에 확인 절차와 체험형 학습 설계를 포함했다.
- R15 게이팅을 지키며 RAP, Service, CUD, transaction을 후속 챕터로 보류했다.

판정: `CH22_REWRITE.md`는 v3 품질 기준으로 사용 가능하다.
