# CH21_QA · SALV/Grid ALV 표시 제어 심화 재작성 검수

> 대상 산출물: `reference/codex_0625_v2/CH21_REWRITE.md`
> 기준 문서: `reference/codex_0625/00_QUALITY_REVIEW.md`
> 작업 단위: CH21 1개 챕터

## 1. 재작업 판정 반영

`00_QUALITY_REVIEW.md`의 핵심 판정은 기존 `codex_0625`가 실제 강의자료라기보다 챕터별 진단과 보강 지시문에 가까웠다는 것이다. CH21 v2는 다음 방식으로 재작성했다.

| 품질 이슈 | v1 문제 | v2 조치 |
|---|---|---|
| 반복 템플릿 | 모든 레슨에 유사한 "도입/핵심/체험/공식문서" 보강 지시가 반복됨 | CH21의 실제 주제인 SALV/Grid 표시 제어 흐름에 맞춰 레슨별 설명을 새로 작성 |
| 입문자 설명 부족 | `get_functions`, `ctab_fname`, `stylefname`, stable refresh가 짧은 정의와 코드로만 제시됨 | 각 레슨에 `왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 체험 설계 -> 정리` 흐름을 직접 작성 |
| 체험 설계 추상성 | "시뮬레이터 필요" 수준의 일반 제안 | 데이터, 버튼, 상태 변수, 성공/실패 피드백, 코드 연결 방식을 레슨마다 구체화 |
| 공식 문서 자동 힌트 | v1의 공식문서 힌트가 범용 키워드 기반으로 섞일 위험 | `C:\ABAP_DOCU_HTML`에서 ALV/SALV 예제, Grid ALV 예제, deep structure, 색상 상수를 수동 확인 |
| R15 위험 | CH21에서 이벤트/편집까지 과도하게 끌어올 위험 | 더블클릭/toolbar/hotspot 본격 구현은 CH27, editable grid 검증/저장은 CH28로 명시 보류 |
| 코드 정확성 | 원본 L01의 `DATA(lo_salv) = cl_salv_table=>factory(...)` 형태가 SALV factory 호출 구조를 오해하게 함 | `cl_salv_table=>factory( IMPORTING r_salv_table = DATA(lo_salv) CHANGING t_table = ... )` 형태로 교정 |

판정: CH21 v2는 v1의 보강 지시문을 반복하지 않고, SALV/Grid ALV 표시 제어를 완성 강의자료 수준으로 재작성했다.

## 2. 소스 커버리지

| 원본 | v2 반영 위치 | 비고 |
|---|---|---|
| `content/abap/CH21/_chapter.md` | `CH21의 역할`, `R15 경계`, `CH21 마무리 정리` | "색·셀 단위 표시 제어"를 콘서트 회차 상태 표시 문제로 재정의 |
| `CH21-L01.md` | `CH21-L01 · SALV Sort / Filter / Function 제어` | SALV factory 호출 교정, functions/sorts/filters, display 전 설정, 필드명 검증 |
| `CH21-L02.md` | `CH21-L02 · SALV Layout / Variant 심화` | display settings, columns, column text, layout key, save restriction, variant 확인 |
| `CH21-L03.md` | `CH21-L03 · Grid ALV Column 제어 심화` | field catalog를 화면 지시서로 설명, `no_out/do_sum/just/key/edit` 경계 |
| `CH21-L04.md` | `CH21-L04 · Deep Structure 기반 Cell Color` | `LVC_T_SCOL`, `ctab_fname`, DB flat table과 ALV deep display table 분리, `fname` 검증 |
| `CH21-L05.md` | `CH21-L05 · Deep Structure 기반 Cell Style` | `LVC_T_STYL`, `stylefname`, disabled/enabled/button style, 실제 편집 처리 CH28 보류 |
| `CH21-L06.md` | `CH21-L06 · Row / Column / Cell Color 선택 기준` | `info_fname`, fieldcat `emphasize`, `ctab_fname` 선택 기준과 퀴즈형 체험 설계 |
| `CH21-L07.md` | `CH21-L07 · Stable Refresh와 표시 상태 보존` | `LVC_S_STBL`, `refresh_table_display`, `i_soft_refresh`, 데이터 갱신과 구조 변경 구분 |
| `CH21-L08.md` | `CH21-L08 · 실습: 매진 회차 색 강조` | `ZCL_BOOKING_MANAGER->remaining( )`, `SEATS_LEFT` 셀 색, `COL_NEGATIVE/COL_TOTAL`, stable refresh 실습 |

누락된 원본 레슨 없음. CH21 원본 8개 레슨을 모두 별도 절로 반영했다.

## 3. 기존 임베드 반영

`embeds/abap/`에서 CH21 전용 임베드 파일은 확인되지 않았다. 따라서 새 임베드 파일을 생성하지 않고, 각 레슨의 "체험형 학습 설계"에 구현 가능한 학습 장치를 문장으로 설계했다.

| 레슨 | 새로 설계한 학습 장치 | 핵심 상호작용 |
|---|---|---|
| L01 | SALV 초기 상태 조종 패널 | functions/sort/filter 버튼, 필드명 오타 실패, visible row count |
| L02 | Variant 저장 실험실 | 줄무늬, 폭 최적화, 컬럼 텍스트, variant 저장/초기화 |
| L03 | Field Catalog 조립대 | `no_out`, `do_sum`, `just`, `key`, 문자 합계 실패 |
| L04 | Cell Color 현미경 | `cellcolors` 내부 테이블, `ctab_fname` 연결, `fname` 오타 |
| L05 | Cell Style 스위치보드 | disabled/enabled/button style, `stylefname` 연결, 이벤트 보류 메시지 |
| L06 | 색 단위 선택 퀴즈 | 상황 카드별 행/컬럼/셀 색 선택과 피드백 |
| L07 | Refresh 흔들림 비교기 | hard refresh와 stable/soft refresh의 스크롤 유지 비교 |
| L08 | Concert ALV Color Lab | 잔여석 계산, 색 규칙 적용, 예매 추가, stable refresh, 더블클릭 맛보기 보류 |

판정: 기존 임베드가 없으므로 요구사항에 맞게 버튼, 상태, 데이터, 피드백 수준의 체험 설계를 새로 문서화했다.

## 4. 공식 문서 수동 확인 반영

자동 매칭 대신 `C:\ABAP_DOCU_HTML`에서 다음 문서를 수동 확인했다.

| 주제 | 확인 문서 | 확인 내용 | v2 반영 |
|---|---|---|---|
| ALV 사용 권장 | `abenabap_lists.htm`, `abenabap_dynpro_list.htm`, `abenlist_overview.htm`, `abenlist_guidl.htm` | tabular output에는 SAP List Viewer(ALV) 클래스, 예: `CL_SALV_TABLE` 사용 권장 | CH21 역할과 SALV/Grid ALV의 위치 설명 |
| SALV factory | `abenfree_selection_abexa.htm`, `abapset_handler_instance.htm` | `cl_salv_table=>factory( IMPORTING r_salv_table = ... CHANGING t_table = ... )`, `display( )` 예제 | L01의 잘못된 constructor-like 호출 교정 |
| Grid ALV 표시 | `abendynpro_cfw_abexa.htm`, `abapreturn.htm` | `CL_GUI_ALV_GRID`, `LVC_S_LAYO`, `set_table_for_first_display`, `is_layout`, `it_outtab` 예제 | L03~L08에서 Grid ALV layout/field catalog/표시 table 설명 |
| SALV 이벤트 맛보기 | `abapset_handler_instance.htm` | `FOR EVENT double_click OF cl_salv_events_table`, `SET HANDLER ... FOR alv->get_event( )` 예제 | L08의 더블클릭은 예고만 하고 CH27로 보류 |
| 구조 선언 | `abaptypes_struc.htm` | `TYPES BEGIN OF ... END OF`, 구조 component, table type component 가능 | L04/L05의 표시용 row type 설명 |
| deep structure | `abendata_objects_structure.htm` | internal table component를 포함한 deep structure, deep component는 실제 데이터를 참조 | L04/L05에서 `LVC_T_SCOL`, `LVC_T_STYL`이 행 안의 internal table임을 설명 |
| deep structure 제한 | `abendata_objects_structure.htm` | ABAP SQL work area의 deep component 사용 제한 | L04에서 DB flat table과 ALV 표시용 deep table 분리 경고 |
| 색상 상수 | `abapformat.htm`, `abapformat_shortref.htm`, `abenlist_format_color_abexa.htm`, `abenlist_format_color2_abexa.htm` | `COL_TOTAL`은 yellow, `COL_NEGATIVE`는 red 계열 상수 | L04/L08에서 매진 빨강, 잔여 임박 노랑 예제 |

공식 문서 기반으로 본문에 반영한 주요 교정:

- SALV factory를 반환값처럼 받는 잘못된 형태를 제거하고 static method의 `IMPORTING r_salv_table` 구조로 설명했다.
- ALV 세부 표시 구조가 DB 구조가 아니라 표시용 구조라는 점을 `deep structure` 공식 문서와 연결했다.
- `cellcolors TYPE lvc_t_scol`, `cellstyles TYPE lvc_t_styl`을 SQL 직접 조회 대상처럼 다루지 않도록 flat table과 display table 분리를 명시했다.
- 색상 상수 `COL_NEGATIVE`, `COL_TOTAL`의 의미를 공식 색상 문서 기반으로 설명했다.
- SALV double click 예제가 공식 문서에 있어도 CH21에서는 이벤트 구현을 하지 않고 CH27 경계를 지켰다.

확인 한계도 명시했다.

| 항목 | 처리 |
|---|---|
| `ctab_fname`, `stylefname`, `LVC_T_SCOL`, `LVC_T_STYL`, `emphasize`, `i_soft_refresh`의 세부 API reference | `C:\ABAP_DOCU_HTML`의 ABAP Keyword Documentation은 모든 GUI ALV class API를 전체 signature 레퍼런스로 싣지 않는다. v2는 이 사실을 숨기지 않고, `.project-docs/11_KEYWORD_AUDIT.md`의 CH21 공식 API 대조 결과를 보조 근거로 사용했다고 명시했다. |
| 이벤트 구현 | `abapset_handler_instance.htm`에서 SALV double click 예제를 확인했지만 CH21 본문에는 구현 코드를 넣지 않고 "맛보기/보류"로 처리했다. |

## 5. R15 및 classic-first 경계

CH21은 CH18/CH19/CH20 이후 장이므로 다음 사용은 허용된다.

- inline `DATA( )`, `VALUE #( )`, `NEW`
- modern Open SQL `@`
- OO method call `->`, static call `=>`
- `TRY/CATCH`, exception object `get_text( )`
- `CL_SALV_TABLE` object API
- `CL_GUI_ALV_GRID`와 `LVC_*` 표시 제어 구조
- CH20의 `ZCL_BOOKING_MANAGER`를 사용한 잔여석 계산

동시에 다음은 보류했다.

| 보류 항목 | 처리 |
|---|---|
| ALV double click 상세 구현 | CH27로 보류. CH21-L08에서는 preview 메시지/아이디어만 제시 |
| hotspot, toolbar, user command | CH27 ALV 고급 Event로 보류 |
| editable grid 입력값 검증/저장 | CH28 Editable Grid로 보류 |
| 실제 예매 `INSERT/UPDATE/DELETE` | CH24 DML/LUW로 보류 |
| CDS/RAP 모델링 | CH22/CH23으로 보류 |
| 대량 성능 최적화 | CH32 성능 장으로 보류. L08에서는 루프 내 manager 생성이 학습용임을 명시 |

판정: CH21의 표시 제어 심화는 충분히 다루되, 이벤트/편집/저장/모델링 후속 개념을 앞당기지 않았다.

## 6. 체험형 학습 설계 점검

| 레슨 | 데이터 구체성 | 버튼/조작 | 상태 변수 | 피드백 |
|---|---|---|---|---|
| L01 | 날짜와 상태가 섞인 `lt_perf` 8행 | 기본 표시, 기능 켜기, 정렬, 필터, 필드명 오타 | `functionsOn`, `sortColumn`, `filterRule`, `visibleRows` | 정렬 순서 변경, 취소 행 제외, 컬럼명 오류 |
| L02 | 회차 6행과 여러 표시 컬럼 | 줄무늬, 폭 최적화, 텍스트 적용, variant 저장/초기화 | `striped`, `optimized`, `savedVariant`, `columnOrder` | 저장된 보기와 현재 보기 비교 |
| L03 | output table과 field catalog 행 목록 | 숨김, 합계, 가운데 정렬, 키 지정, 문자 합계 실패 | `fieldCatalogRows`, `visibleColumns`, `sumColumns` | field catalog 변경과 화면 결과 연결 |
| L04 | 매진/임박/정상 회차와 `cellcolors` 내부 테이블 | 색 계산, `ctab_fname` 연결, `fname` 오타 | `cellcolorsByRow`, `layoutCtabFname`, `paintedCells` | 색 데이터는 있으나 layout 연결 전에는 미표시 |
| L05 | 정상/매진/관리자/상세 버튼 상태 | disabled, enabled, button, `stylefname` 연결 끊기 | `styleRows`, `layoutStylefname`, `styledCells` | 버튼 style은 보이지만 이벤트는 CH27 보류 |
| L06 | 상황 카드 5개 | 행/컬럼/셀/색 없음 선택 | `scenario`, `selectedColorUnit`, `recommendedUnit` | 선택 단위가 부적절한 이유 설명 |
| L07 | 100행 회차 목록과 스크롤 위치 | hard, stable, soft+stable refresh | `scrollRow`, `scrollColumn`, `refreshMode` | hard refresh는 튐, stable은 위치 유지 |
| L08 | 회차 6행과 booking manager 계산값 | 잔여석 계산, 색 규칙, 예매 추가, stable refresh | `rows`, `managerCalls`, `cellcolors`, `layoutCtabFname` | 잔여 5석 노랑, 0석 빨강, `ctab_fname` 끄면 색 미표시 |

판정: 모든 레슨에 구현자가 위젯으로 옮길 수 있는 수준의 데이터, 버튼, 상태, 피드백을 작성했다.

## 7. 코드·설계 검토

| 항목 | 검토 결과 |
|---|---|
| SALV factory | static method 호출 구조로 교정. `IMPORTING r_salv_table`, `CHANGING t_table` 사용 |
| SALV display 전 설정 | functions/sorts/filters/display settings/columns/layout 모두 `display( )` 전에 설정하도록 설명 |
| Variant 저장 | `salv_s_layout_key( report = sy-repid )`와 `if_salv_c_layout=>restrict_none` 사용 예로 저장 key와 제한을 설명 |
| Field catalog | `LVC_T_FCAT`의 `no_out`, `do_sum`, `just`, `key`, `edit`를 표시 지시서 관점으로 설명 |
| Cell color | `LVC_T_SCOL`, `lvc_s_scol`, `fname`, `color-col`, `COL_NEGATIVE`, `COL_TOTAL`, `ctab_fname` 연결 설명 |
| Cell style | `LVC_T_STYL`, `lvc_s_styl`, `fieldname`, `mc_style_disabled/enabled/button`, `stylefname` 연결 설명 |
| Deep structure | DB 조회용 flat data와 ALV 표시용 deep data 분리 경고 포함 |
| Stable refresh | output table 갱신 후 `refresh_table_display`, `LVC_S_STBL`, `i_soft_refresh` 설명 |
| 이벤트 경계 | `double_click`은 공식 예제가 있어도 CH21 본문에서 구현하지 않음 |
| 실습 통합 | CH20 `ZCL_BOOKING_MANAGER`의 `remaining( )`을 사용하고 실제 DML은 하지 않음 |

## 8. 수동 점검 체크리스트

| 체크 | 결과 |
|---|---|
| 원본 CH21 8개 레슨이 모두 반영되었는가 | 통과 |
| v1의 반복 템플릿 문구를 재사용하지 않았는가 | 통과 |
| 각 레슨에 필요성, 정의, 확인, 실수/주의, 정리 흐름이 있는가 | 통과 |
| 코드가 있는 레슨에 체험/시뮬레이터 설계가 구체적인가 | 통과 |
| `C:\ABAP_DOCU_HTML` 수동 확인 결과를 본문과 QA에 분리 기록했는가 | 통과 |
| R15에 따라 CH27/CH28/CH24/CH22/CH23 개념을 앞당기지 않았는가 | 통과 |
| classic-first 경계를 위반하지 않았는가 | 통과. CH21은 CH18/19/20 이후라 modern syntax와 OO 사용 가능 |
| 공식 문서에서 확인되지 않은 LVC 세부 API를 확인된 것처럼 쓰지 않았는가 | 통과. keyword audit 보조 근거임을 명시 |

## 9. 검색 검증 결과

| 검증 | 명령 | 결과 |
|---|---|---|
| whitespace 검증 | `git diff --check -- reference\codex_0625_v2\CH21_REWRITE.md reference\codex_0625_v2\CH21_QA.md` | 통과. 출력 없음 |
| 파일 생성 확인 | `git status --short -- reference\codex_0625_v2\CH21_REWRITE.md reference\codex_0625_v2\CH21_QA.md` | 두 파일 모두 신규 산출물로 확인 |
| 반복 템플릿 검색 | `rg -n "도입 불편|실무 감각|필요 학습수단|구체적으로 설명한다|자동 매칭|abapparameters\.htm" ...` | v1 반복 템플릿 문구 없음. `자동 매칭`은 "자동 매칭 대신 수동 확인"이라는 QA 설명에서만 등장 |
| 레슨 구조 확인 | `rg -c "^### 왜 필요한가|^### 무엇인가|^### 어떻게 확인하는가|^### 실수와 주의|^### 체험형 학습 설계|^### 정리" CH21_REWRITE.md` | 48개. 8개 레슨 × 6개 하위 흐름 일치 |
| R15 후속 개념 검색 | `rg -n "DATA_CHANGED|CHECK_CHANGED_DATA|INSERT|UPDATE|DELETE|DEFINE VIEW|RAP|behavior definition|hotspot_click|user_command|SET HANDLER" CH21_REWRITE.md` | 검색 결과는 모두 CH27/CH28/CH24/CH22/CH23 보류 또는 공식문서 근거 설명 맥락 |

## 10. 최종 판정

CH21 v2는 `codex_0625`의 품질 점검 결과에 따라 재작업이 필요한 챕터를 실제 강의자료로 재작성한 산출물이다. SALV 표시 제어, Grid ALV 컬럼 제어, cell color/style, 색 단위 선택, stable refresh, 콘서트 앱 적용 실습을 모두 다루며, 코드와 체험 설계가 본문 설명과 연결되어 있다.

보류 경계도 명확하다. CH21은 표시 제어 심화 장이고, 본격 ALV 이벤트는 CH27, editable grid 처리는 CH28, 실제 DML은 CH24, CDS/RAP는 CH22/CH23으로 넘겼다.

판정: CH21 재작성 완료. 검색 검증에서도 반복 템플릿 흔적과 R15 경계 위반은 확인되지 않았다.
