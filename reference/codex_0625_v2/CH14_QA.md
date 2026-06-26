# CH14_QA - codex_0625_v2 재작업 검수

> 대상 파일: `reference/codex_0625_v2/CH14_REWRITE.md`
> 판정: CH14 v2 기준 원고는 재작업 준비 산출물로 통과 대상. 실제 `content/abap/CH14` 반영과 신규 embed 구현은 아직 수행하지 않았다.

## 1. 재작업 판정 반영

`reference/codex_0625/00_QUALITY_REVIEW.md`는 v1 산출물이 완성 강의자료가 아니라 반복 템플릿형 보강안에 가깝다고 판정했다. CH14 v1도 각 레슨에 비슷한 보강 문구가 반복되었고, TMG/SM30, Help View, Maintenance View의 성격을 입문자에게 직접 설명하기보다 "보강이 필요하다"는 지시문에 머문 부분이 많았다.

v2에서는 다음 방식으로 처리했다.

| 항목 | v1 문제 | v2 처리 |
| --- | --- | --- |
| 템플릿 반복 | 레슨마다 유사한 도입, 보강, 학습수단 문구 반복 | CH14 9개 레슨을 각각 독립 강의 원고로 재작성 |
| 본문 밀도 | View 유형과 유지보수 도구 설명이 짧고 분리됨 | 왜 필요한가, 무엇인가, 확인 방법, 체험 설계, 실수와 주의, 정리 흐름으로 확장 |
| 도구 흐름 | SE11, SM30, SE16N, SE54가 단편적으로 등장 | DDIC 설정 -> maintenance dialog -> SM30 -> SE16N 확인 흐름으로 연결 |
| 공식 문서 | 자동 키워드 매칭 위험과 무관 문서 힌트 혼입 | `C:\ABAP_DOCU_HTML`에서 CH14 관련 DDIC 문서만 수동 확인 |
| 개념 정확도 | Maintenance View를 outer join 대안처럼 오해할 수 있음 | Help View의 outer join 성격과 Maintenance View의 table maintenance 목적을 분리 |
| R15 경계 | CDS, RAP, OData, modern SQL을 앞당길 위험 | CDS는 CH22 예고로만 두고 classic DDIC View 중심 유지 |
| classic-first | modern ABAP/Open SQL 구문 혼입 위험 | 모든 ABAP 예제는 CH17 이전 classic-safe 형태로 작성 |

## 2. 소스 커버리지

현재 authoritative scope는 `content/abap/CH14`의 9개 레슨이다.

| 원본 | v2 반영 위치 | 확인 |
| --- | --- | --- |
| `CH14/_chapter.md` | "CH14 전체 설계", "CH14 마무리 학습 흐름" | 반영 |
| `CH14-L01.md` | `## CH14-L01 - Database View와 Open SQL JOIN의 차이` | 반영 |
| `CH14-L02.md` | `## CH14-L02 - Projection View로 필드 노출 줄이기` | 반영 |
| `CH14-L03.md` | `## CH14-L03 - Help View와 Search Help 연결` | 반영 |
| `CH14-L04.md` | `## CH14-L04 - Maintenance View와 Foreign Key 기반 유지보수` | 반영 |
| `CH14-L05.md` | `## CH14-L05 - Table Maintenance Generator와 SM30` | 반영 |
| `CH14-L06.md` | `## CH14-L06 - View Cluster로 관련 유지보수 묶기` | 반영 |
| `CH14-L07.md` | `## CH14-L07 - SE16N Data Browser로 데이터 확인하기` | 반영 |
| `CH14-L08.md` | `## CH14-L08 - Classic View와 CDS의 경계` | 반영 |
| `CH14-L09.md` | `## CH14-L09 - 실습: 공연 등록 화면과 조회 View 연결` | 반영 |

## 3. 공식 문서 수동 근거

CH14_REWRITE에는 아래 문서만 수동 근거로 남겼다.

| 문서 | 사용 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abenabap_dictionary.htm` | ABAP Dictionary가 table, DDIC view, search help 등을 관리하는 repository임을 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_views.htm` | DDIC View의 일반 정의, 물리 저장이 아니라 basis table에서 읽는다는 점 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_database_views.htm` | Database View, basis table, inner join, ABAP SQL 접근 가능성 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_projection_views.htm` | Projection View가 단일 basis table의 필드 노출 제한용임을 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_help_views.htm` | Help View가 Search Help용이고 outer join 성격을 가진다는 점 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_maintenance_views.htm` | Maintenance View가 extended table maintenance, SE54, SM30, SM31과 연결됨을 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_database_tables_forkeyrel.htm` | Foreign Key dependency가 input check, input help, view 생성에서 평가됨을 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_database_tables_forkey.htm` | Foreign Key, Check Table, cardinality, text table 의미 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_database_tables_maint.htm` | Display/Maintenance 설정과 SE54, SM30, SM31, View Cluster Maintenance 가능 여부 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_database_tables_delivery.htm` | Delivery Class와 table data transport, SM30 유지보수 데이터 처리 관계 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_value_help_auto.htm` | Search Help, Check Table, Fixed Value의 F4 input help 계층 확인 |
| `C:\ABAP_DOCU_HTML\abendata_browser_glosry.htm` | Data Browser의 DDIC table content 조회 도구 성격 확인 |
| `C:\ABAP_DOCU_HTML\abapselect_data_source.htm` | DDIC database view와 projection view가 ABAP SQL SELECT data source가 될 수 있음을 확인 |
| `C:\ABAP_DOCU_HTML\abencds_define_view_entity.htm` | CDS View Entity를 CH22 예고로만 다룰 근거 확인 |

무관 문서 배제:

- `abapparameters.htm`
- `abapselect-options.htm`
- `abapselection-screen_definition.htm`
- `abapat_selection-screen_events.htm`

위 문서들은 CH14의 DDIC View, TMG, SM30, Search Help, Data Browser 설명 근거로 사용하지 않았다.

## 4. 공식문서 기반 교정 사항

가장 중요한 교정은 Maintenance View 설명이다.

| 항목 | v2 판정 |
| --- | --- |
| Database View | 여러 basis table이면 inner join으로 결합하고 ABAP SQL로 읽을 수 있음 |
| Projection View | 단일 basis table에서 필드 노출을 줄이며 ABAP SQL로 읽을 수 있음 |
| Help View | Search Help용이며 primary table 보존 성격을 가진 outer join 설명이 공식문서에 있음 |
| Maintenance View | extended table maintenance용이며 SE54 maintenance dialog와 SM30, SM31 흐름에 연결됨 |

따라서 CH14-L04는 "Maintenance View는 left outer 조회 대안"이라는 식으로 쓰지 않았다. 유지보수용 view, foreign key dependency, maintenance dialog, Display/Maintenance 설정의 관점으로 재작성했다.

SE16N 관련 교정:

- 공식 ABAP Keyword Documentation의 glossary는 Data Browser transaction으로 SE16을 언급한다.
- 원본 커리큘럼의 SE16N은 현업 확인 도구로 유지하되, v2에서는 "SE16N으로 운영 데이터를 직접 편집하는 방법"을 가르치지 않는다.
- 검증과 조회 역할만 설명했다.

## 5. R2 체험 장치 점검

| 레슨 | 코드 있음 | 체험 설계 | 판정 |
| --- | --- | --- | --- |
| L01 | 있음 | JOIN 코드 vs Database View 비교 보드, 마스터 누락 행 실험 | 통과 |
| L02 | 있음 | 필드 커튼 시뮬레이터, 기술 필드 숨김, key 누락 경고 | 통과 |
| L03 | 설정 예시 중심 | F4 여행 경로, selection method, import/export 실패 상태 | 통과 |
| L04 | 설정 예시 중심 | Foreign Key로 문 열기, FK 제거, input check 실패 상태 | 통과 |
| L05 | ABAP 코드 없음 | SM30 문이 열리기까지 체크리스트, TMG 생성 전후 비교 | 통과 |
| L06 | ABAP 코드 없음 | 계층 유지보수 지도, parent-child 선택과 하위 필터 | 통과 |
| L07 | ABAP 코드 없음 | 저장 후 추적기, SM30 저장과 SE16N 조건 조회 비교 | 통과 |
| L08 | ABAP 코드 없음 | 타임라인 경계 카드, CH14 대상과 CH22 대상 분리 | 통과 |
| L09 | 있음 | 공연 등록 콘솔, F4 선택, SM30 저장, SE16N 확인, View 확인 | 통과 |

R2 관점에서 중요한 개선은 모든 레슨이 "읽을 설명"에서 끝나지 않고, 버튼, 상태, 데이터, 실패 피드백을 가진 학습 장치로 연결된다는 점이다.

## 6. Classic-first 및 R15 범위 검사

수동 점검 기준:

- ABAP 예제에는 inline declaration을 넣지 않았다.
- constructor expression, object creation expression, string template을 넣지 않았다.
- modern Open SQL host marker와 comma field list를 넣지 않았다.
- CH14에서 ABAP SQL 쓰기문, LUW, update task, lock object 심화를 다루지 않았다.
- CDS View Entity는 이름과 방향만 예고하고, CDS 문법 예제는 넣지 않았다.
- RAP, OData, Fiori, annotation, access control은 CH22 이후 경계로 유지했다.
- SE16N은 조회와 검증 도구로만 설명하고 운영 편집 기법은 배제했다.
- Search Help exit과 동적 F4 제어는 후속 심화 범위로 미뤘다.

## 7. 자동 검색 결과

최종 파일 작성 후 아래 자동 검색을 실행했다.

```text
rg -n "도입 불편|단순히 실행되는 예제|필요 학습수단|공식 문서 체크 힌트|abapparameters\.htm|abapselect-options\.htm|abapselection-screen_definition\.htm|abapat_selection-screen_events\.htm" reference\codex_0625_v2\CH14_REWRITE.md

rg -n "DATA\(|@DATA|@\w|VALUE #|NEW |\+=|FINAL\(" reference\codex_0625_v2\CH14_REWRITE.md

rg -n "\b(INSERT|UPDATE|MODIFY|COMMIT|ROLLBACK|CREATE OBJECT)\b" reference\codex_0625_v2\CH14_REWRITE.md

rg -n "[ \t]+$" reference\codex_0625_v2\CH14_REWRITE.md

rg -c "^## CH14-L" reference\codex_0625_v2\CH14_REWRITE.md

rg -c "^### 왜 필요한가" reference\codex_0625_v2\CH14_REWRITE.md
rg -c "^### 무엇인가" reference\codex_0625_v2\CH14_REWRITE.md
rg -c "^### 어떻게 확인하는가" reference\codex_0625_v2\CH14_REWRITE.md
rg -c "^### 체험 설계" reference\codex_0625_v2\CH14_REWRITE.md
rg -c "^### 실수와 주의" reference\codex_0625_v2\CH14_REWRITE.md
rg -c "^### 정리" reference\codex_0625_v2\CH14_REWRITE.md
```

실행 결과:

| 검사 | 결과 |
| --- | --- |
| v1 반복 문구와 잘못된 자동 문서 힌트 | 0건 |
| modern ABAP/Open SQL 금지 패턴 | 0건 |
| 범위 밖 쓰기/트랜잭션 키워드 | 0건 |
| trailing whitespace | 0건 |
| CH14 레슨 heading | 9개 |
| 공식문서 근거 | `C:\ABAP_DOCU_HTML` 문서 14개 |
| 핵심 섹션 카운트 | 왜 필요한가 9개, 무엇인가 9개, 어떻게 확인하는가 9개, 체험 설계 9개, 실수와 주의 9개, 정리 9개 |
| 파일 크기 | `CH14_REWRITE.md` 57372 bytes |

## 8. 남은 작업

현재 산출물은 CH14를 실제 강의자료로 바꾸기 위한 v2 기준 원고다. 다음 단계에서 사용자가 진행을 승인하면 아래 중 하나를 선택해야 한다.

| 다음 작업 | 설명 |
| --- | --- |
| content 반영 | `content/abap/CH14`의 각 lesson 파일에 v2 원고를 반영 |
| embed 설계 구체화 | L01, L03, L05, L09 중심으로 체험형 HTML 위젯 사양 작성 |
| 공식문서 링크 카드화 | CH14 lesson 페이지에 공식문서 근거를 강사용 note 형태로 연결 |
| 교정 이슈 전파 | Maintenance View outer join 오해를 관련 계획 문서나 후속 챕터 QA에 반영 |

CH14 v2의 핵심 가치는 "View 종류를 외우는 자료"가 아니라 "조회 관점, F4 도움말, 표준 유지보수, 데이터 확인 흐름을 한 업무 시나리오로 설명하는 강의자료"로 바꾼 점이다.
