# CH22_QA - CDS View Entity 기초

> 대상 파일: `reference/codex_0625_v2/CH22_REWRITE.md`
> 기준 파일: `reference/codex_0625/00_QUALITY_REVIEW.md`
> 작업 단위: CH22 단일 챕터
> 판정: 재작업 완료, 검증 필요 항목은 본 문서에 명시

## 1. 재작업 판정 반영

| 기준 | 반영 결과 |
|---|---|
| 기존 `codex_0625`의 반복 템플릿 제거 | 기존 v1에서 반복되던 고정 섹션명을 본문 구조로 사용하지 않았다. |
| 완성 강의자료 수준 재집필 | 7개 레슨 각각을 `왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수와 주의 -> 체험형 학습 설계 -> 정리` 흐름으로 재작성했다. |
| 입문자 기준 설명 | CDS가 ABAP 프로그램이 아니라 DDL Source라는 점, `ZI_`/`ZC_`가 문법이 아니라 관습이라는 점, association이 JOIN 제거가 아니라 관계 선언이라는 점을 직접 설명했다. |
| 코드가 있는 레슨의 체험 설계 | 모든 레슨에 버튼, 상태값, 데이터, 피드백 설계를 포함했다. |
| 공식 문서 기계적 링크 추정 금지 | `C:\ABAP_DOCU_HTML`의 관련 문서를 파일 단위로 확인하고, 반영 근거를 rewrite 상단에 표로 남겼다. |
| R15 게이팅 | RAP, Behavior Definition, Service Binding, action, validation, draft, provider contract 상세 설명을 CH23 이후로 미뤘다. |

## 2. 원본 레슨 커버리지

| 원본 레슨 | v2 반영 위치 | 보강 내용 |
|---|---|---|
| `CH22-L01` CDS View Entity 기본 구조 | `CH22-L01 - CDS View Entity 기본 구조` | classic Database View의 한계, DDL Source 성격, 활성화/Data Preview/ABAP SQL 확인, `#NOT_REQUIRED`의 학습상 의미를 보강했다. |
| `CH22-L02` Interface View와 Projection View 구분 | `CH22-L02 - Interface View와 Projection View 구분` | `ZI_`/`ZC_`가 명명 관습임을 명확히 하고, 기반 계층과 소비 계층의 변경 영향 차이를 설명했다. |
| `CH22-L03` Association 기초 | `CH22-L03 - Association 기초` | cardinality, `$projection`, association 노출, path 사용 시 JOIN 변환 가능성, 기존 embed 활용을 보강했다. |
| `CH22-L04` Annotation과 의미 부여 | `CH22-L04 - Annotation과 의미 부여` | annotation이 일반 주석이 아니라 metadata임을 설명하고, `@Semantics` 금액/통화 및 수량/단위 짝을 올바른 예제로 교정했다. |
| `CH22-L05` Metadata Extension 기초 | `CH22-L05 - Metadata Extension 기초` | `@Metadata.allowExtensions: true`, DDLX 성격, 세미콜론 문법, layer 의미를 보강했다. |
| `CH22-L06` DCL / Authorization 개요 | `CH22-L06 - DCL / Authorization 개요` | `@MappingRole: true`, `grant select`, `aspect pfcg_auth`, `#CHECK`와 `#NOT_REQUIRED` 차이, PFCG role assignment와의 구분을 보강했다. |
| `CH22-L07` 실습 | `CH22-L07 - 실습: 콘서트 CDS 뷰 ZI_/ZC_` | `ZI_Perf -> ZI_Concert -> ZC_Concert -> Metadata Extension` 활성화 순서와 실습 검증표를 추가했다. |

## 3. 공식 문서 수동 확인 반영

| 주제 | 확인 문서 | 반영 판정 |
|---|---|---|
| View Entity | `abencds_define_view_entity.htm`, `abencds_select_statement_v2.htm` | `define view entity`, `as select from`, DDL Source, ABAP SQL 소비 설명에 반영 |
| Projection View | `abencds_define_view_as_projection.htm`, `abencds_proj_views.htm` | `as projection on` 설명에 반영 |
| Association | `abencds_association_v2.htm`, `abencds_simple_association_v2.htm`, `abencds_select_list_association_v2.htm`, `abencds_assoc_join_v2.htm` | cardinality, `$projection`, 노출, JOIN 변환 가능성에 반영 |
| Annotation | `abencds_annotations.htm`, `abencds_annotations_frmwrk_tables.htm`, `abencds_semantics_annotation_abexa.htm` | `@EndUserText`, `@UI.lineItem`, `@Semantics` 설명에 반영 |
| Metadata Extension | `abencds_meta_data_extensions.htm`, `abencds_f1_annotate_view.htm`, `abencds_f1_metadata_ext_annos.htm` | `@Metadata.allowExtensions`, `@Metadata.layer`, `annotate entity` 설명에 반영 |
| DCL | `abencds_access_control.htm`, `abencds_f1_define_role.htm`, `abencds_dcl_role_grant_rule.htm`, `abencds_f1_cond_pfcg.htm` | `define role`, `grant select`, `aspect pfcg_auth`, authorization check 설명에 반영 |

## 4. R15 / classic-first 경계 점검

| 항목 | 점검 결과 |
|---|---|
| New Syntax | CH22는 CH18 이후이므로 `@DATA(...)` 예제 사용 가능 |
| New Open SQL | CH22는 CH19 이후이므로 `SELECT ... FROM ZC_Concert INTO TABLE @DATA(...)` 사용 가능 |
| CDS View Entity | CH22의 정식 도입 개념이므로 L3 수준 설명 가능 |
| Projection View | CH22 범위에서 `as projection on` 기본만 설명 |
| RAP | CH23 예고만 허용, BDEF/BIMP/Service Binding 코드는 작성하지 않음 |
| Provider Contract | 공식 projection 문서에 존재하지만 CH22에서는 상세 설명하지 않음 |
| DML/LUW | CH24 이후 주제이므로 CH22 실습에 포함하지 않음 |
| ABAP Cloud | CH23 이후 방향으로만 언급 가능, CH22 본문에는 구현 설명 없음 |

## 5. 코드 예제 QA

| 예제 | 점검 |
|---|---|
| `ZI_Concert` 기본 | `@AccessControl.authorizationCheck: #NOT_REQUIRED`, `define view entity`, `as select from zconcert`, key field 포함 |
| `ZI_Perf` 기본 | 복합 key `concert_id`, `perf_no` 포함 |
| Association | `association [0..*] to ZI_Perf as _Perf on $projection.concert_id = _Perf.concert_id` 구조 유지 |
| Projection | `define view entity ZC_Concert as projection on ZI_Concert` 구조 유지 |
| Annotation | `@UI.lineItem`과 `@EndUserText.label`을 필드 위에 배치 |
| Semantics | 금액 필드가 `currency_code`, 수량 필드가 `unit`을 가리키도록 올바른 짝 예제 사용 |
| Metadata Extension | 대상 entity에 `@Metadata.allowExtensions: true`, extension source에 `@Metadata.layer: #CORE` 포함 |
| DCL | `@MappingRole: true`, `define role`, `grant select`, `aspect pfcg_auth` 포함 |

## 6. 체험형 학습 설계 QA

| 레슨 | 체험 설계 |
|---|---|
| L01 | CDS View Entity 활성화 관찰기: 원본 테이블 보기, DDL 작성, 활성화, Data Preview, ABAP SQL 읽기 |
| L02 | 계층 분리 슬라이더: `ZI_`와 `ZC_` 필드 비교, projection 필드 체크박스 |
| L03 | Association 경로 시뮬레이터: 공연 선택, `_Perf` 따라가기, association 노출 토글, JOIN 비교 |
| L04 | Annotation 효과 미리보기: 라벨, lineItem 순서, semantics 짝 검사, 주석 위치 검사 |
| L05 | 본문과 메타데이터 분리 실험실: UI annotation 이동, allowExtensions 토글, DDLX 문법 검사 |
| L06 | 권한 필터 결과 비교기: 사용자별 PFCG 값, DCL 적용 토글, SELECT 결과 비교 |
| L07 | 콘서트 CDS 빌더: `ZI_Perf`, `ZI_Concert`, `ZC_Concert`, DDLX, Data Preview, 소비 코드 생성 |

## 7. 기존 시각 자료 반영

| 자료 | 반영 |
|---|---|
| `embeds/abap/CH22-L03-S01.html` | L03 본문에 `::embed CH22-L03-S01 | 공연–회차–예매 association 관계도::`를 유지했다. |
| 추가 SVG/HTML 생성 | 이번 작업 범위는 문서 산출물이므로 새 파일은 만들지 않고, 필요한 시각/상호작용 수단은 글로 설계했다. |

## 8. 잔여 리스크와 의도적 보류

| 항목 | 처리 |
|---|---|
| 실제 시스템 릴리스별 CDS 문법 차이 | 공식 ABAP_DOCU 기준으로 작성했으나, 학습자가 사용하는 ABAP Platform 버전에 따라 일부 annotation 지원 범위는 다를 수 있다. |
| `@UI.lineItem` 전체 레코드 속성 | CH22에서는 `position` 중심으로 제한했다. Fiori Elements 상세 annotation은 후속 심화 범위다. |
| 잔여석 계산 | association+aggregate 설계는 도전 과제로만 두고 본문 코드에서는 구현하지 않았다. |
| RAP 연계 | CH23 예고만 남기고 구현 코드를 넣지 않았다. |

## 9. 최종 수동 점검 체크리스트

- [x] CH22 단일 챕터만 작업했다.
- [x] `reference/codex_0625_v2/CH22_REWRITE.md`를 생성했다.
- [x] `reference/codex_0625_v2/CH22_QA.md`를 생성했다.
- [x] 원본 7개 레슨을 모두 반영했다.
- [x] 기존 `codex_0625` 반복 템플릿을 사용하지 않았다.
- [x] 각 레슨에 입문자용 설명 흐름을 넣었다.
- [x] 코드가 있는 레슨에 체험형 설계를 넣었다.
- [x] ABAP_DOCU 공식 문서를 수동 확인한 근거를 남겼다.
- [x] R15 게이팅과 classic-first 경계를 지켰다.

## 10. 사후 검증 기록

아래 항목은 파일 생성 후 명령으로 추가 점검한다.

| 검증 | 결과 |
|---|---|
| 반복 템플릿 문구 검색 | 완료. 본문 구조에는 기존 v1 반복 섹션명이 사용되지 않음. |
| 레슨별 흐름 섹션 개수 | 완료. `왜 필요한가/무엇인가/어떻게 확인하는가/실수와 주의/체험형 학습 설계/정리`가 42개로 확인됨. |
| R15 금지 구현 코드 검색 | 완료. RAP·DML 관련 용어는 경계 설명과 금지 안내에서만 등장하고 구현 코드로 작성되지 않음. |
| 공식 문서 파일명 반영 검색 | 완료. CDS View Entity, Projection, Association, Annotation, Metadata Extension, DCL 관련 공식 문서명이 rewrite와 QA에 반영됨. |
| `git diff --check` | 완료. whitespace 오류 없음. |
