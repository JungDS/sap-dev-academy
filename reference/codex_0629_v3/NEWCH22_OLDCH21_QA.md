# CH21_QA · SALV/Grid ALV 표시 제어 심화 검수

> 대상 산출물: `reference/codex_0629_v3/CH21_REWRITE.md`  
> 작업 단위: CH21 1개 챕터  
> 기준: `content/abap/CH21`, `.project-docs/04_CONVENTIONS.md` R6/R15, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`

## 1. 작업 범위 확인

| 항목 | 확인 |
|---|---|
| 챕터 | CH21 · SALV/Grid ALV 표시 제어 심화 |
| 원본 레슨 수 | L01~L08, 총 8개 |
| 산출 파일 | `CH21_REWRITE.md`, `CH21_QA.md` |
| 주 소스 | `content/abap/CH21` |
| 보조 참고 | `reference/codex_0625_v2/CH21_REWRITE.md`, `reference/codex_0625_v2/CH21_QA.md` |
| 품질 목표 | SALV/Grid ALV 표시 제어를 입문자 기준 완성 강의자료로 재작성 |

CH21은 표시 제어 심화 장이다. 데이터 저장·취소, 트랜잭션 제어, CDS/RAP 모델링, 본격 ALV 이벤트/편집 검증은 후속 장으로 보류한다.

## 2. 원본 레슨 커버리지

| 원본 | v3 반영 위치 | 반영 내용 |
|---|---|---|
| `_chapter.md` | `CH21 전체 설계`, `CH21 R15 경계`, `CH21 최종 정리` | ALV를 단순 출력에서 업무 화면으로 끌어올리는 장으로 재정의 |
| `CH21-L01.md` | `CH21-L01 · SALV Sort / Filter / Function 제어` | SALV factory, functions, sort, filter, display 전 설정 |
| `CH21-L02.md` | `CH21-L02 · SALV Layout / Variant 심화` | display settings, columns, column text, layout key, variant |
| `CH21-L03.md` | `CH21-L03 · Grid ALV Column 제어 심화` | field catalog 속성, `no_out`, `do_sum`, `just`, `key`, `edit` 경계 |
| `CH21-L04.md` | `CH21-L04 · Deep Structure 기반 Cell Color` | `LVC_T_SCOL`, `ctab_fname`, deep display table |
| `CH21-L05.md` | `CH21-L05 · Deep Structure 기반 Cell Style` | `LVC_T_STYL`, `stylefname`, disabled/enabled/button style |
| `CH21-L06.md` | `CH21-L06 · Row / Column / Cell Color 선택 기준` | `info_fname`, `emphasize`, `ctab_fname` 선택 기준 |
| `CH21-L07.md` | `CH21-L07 · Stable Refresh와 표시 상태 보존` | `refresh_table_display`, `LVC_S_STBL`, `i_soft_refresh` |
| `CH21-L08.md` | `CH21-L08 · 실습: 매진 회차 색 강조` | `ZCL_BOOKING_MANAGER`, `SEATS_LEFT` 셀 색, stable refresh |

판정: 원본 8개 레슨이 모두 별도 절로 반영되었다.

## 3. 공식 문서 수동 확인

`C:\ABAP_DOCU_HTML`에서 다음 문서 파일 존재를 수동 확인했다.

| 주제 | 확인 문서 |
|---|---|
| ALV 사용 권장 | `abenabap_lists.htm`, `abenabap_dynpro_list.htm`, `abenlist_overview.htm`, `abenlist_guidl.htm` |
| SALV 생성 예 | `abenfree_selection_abexa.htm`, `abapset_handler_instance.htm` |
| Grid ALV 표시 예 | `abendynpro_cfw_abexa.htm`, `abapreturn.htm` |
| 구조/deep structure | `abaptypes_struc.htm`, `abendata_objects_structure.htm` |
| 색상 상수 | `abapformat.htm`, `abapformat_shortref.htm`, `abenlist_format_color_abexa.htm`, `abenlist_format_color2_abexa.htm` |

확인 결과: 위 14개 파일이 모두 존재했다.

주의: ABAP Keyword Documentation은 모든 GUI ALV 클래스 API를 전체 signature reference로 싣지는 않는다. 따라서 `LVC_T_SCOL`, `LVC_T_STYL`, `ctab_fname`, `stylefname`, `i_soft_refresh` 등은 원본 CH21과 `.project-docs/11_KEYWORD_AUDIT.md`의 CH21 감사 결과를 보조 근거로 사용했다.

## 4. R15 게이팅 및 경계

### CH21에서 허용한 것

| 항목 | 이유 |
|---|---|
| inline `DATA( )`, `VALUE #( )`, modern SQL `@` | CH18/CH19에서 정식 도입됨 |
| OO method call `->`, static call `=>`, `TRY/CATCH` | CH20에서 정식 도입됨 |
| `CL_SALV_TABLE` object API | CH11 이후, CH21에서 심화 |
| `CL_GUI_ALV_GRID`, `LVC_T_FCAT`, `LVC_S_LAYO` | CH17 이후, CH21에서 표시 심화 |
| `LVC_T_SCOL`, `ctab_fname` | CH21 cell color 주제 |
| `LVC_T_STYL`, `stylefname` | CH21 cell style 주제 |
| `LVC_S_STBL`, `refresh_table_display` | CH21 stable refresh 주제 |
| `ZCL_BOOKING_MANAGER->remaining( )` | CH20 실습에서 정식 도입된 업무 객체 |

### CH21에서 보류한 것

| 보류 항목 | 처리 |
|---|---|
| 본격 ALV double click/hotspot/toolbar/user command 구현 | CH27 범위 |
| editable grid 입력값 검증/저장 | CH28 범위 |
| 실제 예매 저장·취소 처리와 트랜잭션 제어 | CH24 범위 |
| CDS View Entity | CH22 범위 |
| RAP/ABAP Cloud | CH23 범위 |
| 대량 성능 최적화 | CH32 범위 |

판정: CH21의 표시 제어 심화는 충분히 다루되 후속 이벤트/편집/저장/모델링을 앞당기지 않았다.

## 5. 입문자 강의 흐름 점검

| 흐름 | 반영 |
|---|---|
| 왜 필요한가 | "그냥 표가 보이는 것"과 "업무 상태가 즉시 읽히는 것"의 차이에서 출발 |
| 무엇인가 | SALV 하위 설정 객체, Field Catalog, deep structure, cell color/style, refresh 옵션을 표와 코드로 설명 |
| 어떻게 확인하는가 | 화면 변화, 디버거 내부 테이블, layout 연결 on/off, 컬럼명 오타, refresh 전후 스크롤 비교 |
| 실수/주의 | display 전 설정, 내부 필드명, 숨김과 보안 구분, `ctab_fname`/`stylefname` 혼동, 이벤트/편집 경계 |
| 정리 | 레슨별 핵심 요약 제공 |

판정: 문법 요약이 아니라 화면에서 무엇을 확인해야 하는지까지 포함했다.

## 6. 체험형 학습 설계 점검

| 레슨 | 학습 장치 | 데이터/상태/피드백 |
|---|---|---|
| L01 | SALV 초기 상태 조종 패널 | functions, sort, filter, visible rows, 컬럼명 오타 오류 |
| L02 | Variant 저장 실험실 | 줄무늬, 폭 최적화, 컬럼 텍스트, saved variant |
| L03 | Field Catalog 조립대 | field catalog rows, visible columns, sum columns |
| L04 | Cell Color 현미경 | `cellcolors`, `layoutCtabFname`, `paintedCells` |
| L05 | Cell Style 스위치보드 | `cellstyles`, `layoutStylefname`, style 적용 셀 |
| L06 | 색 단위 선택 퀴즈 | scenario, selected/recommended unit, preview table |
| L07 | Refresh 흔들림 비교기 | scroll row/column, refresh mode, table/layout changed |
| L08 | Concert ALV Color Lab | manager calls, seats left, cellcolors, stable refresh |

판정: 모든 레슨에 데이터, 버튼, 상태, 피드백 설계가 포함되었다.

## 7. 코드·설계 검토

| 항목 | 검토 결과 |
|---|---|
| SALV factory | `IMPORTING r_salv_table`, `CHANGING t_table` 형태로 작성 |
| SALV 설정 시점 | `display( )` 전 설정을 반복 강조 |
| SALV variant | `salv_s_layout_key( report = sy-repid )`, 저장 제한 설명 포함 |
| Field Catalog | 화면 지시서로 설명, `no_out`과 보안 구분 포함 |
| Cell Color | `LVC_T_SCOL`, `lvc_s_scol`, `fname`, `color-col`, `ctab_fname` 연결 설명 |
| Cell Style | `LVC_T_STYL`, `lvc_s_styl`, `fieldname`, style constant, `stylefname` 연결 설명 |
| Deep Structure | DB 조회용 flat data와 ALV 표시용 deep data 구분 |
| Refresh | output table 변경 후 `refresh_table_display` 호출 흐름 설명 |
| 콘서트 실습 | `ZCL_BOOKING_MANAGER` 사용, 실제 저장은 후속 장으로 보류 |

## 8. 자동 점검 기준

작업 후 다음을 점검한다.

| 점검 | 기대 |
|---|---|
| `git diff --check` | whitespace 문제 없음 |
| `CH21-L01`~`CH21-L08` 헤딩 | 총 8개 존재 |
| v1 반복형 문구 | 반복 템플릿 흔적 없음 |
| 후속 이벤트/편집 코드 | CH27/CH28 본격 코드 없음 |
| 후속 저장/모델링 코드 | CH24/CH22/CH23 본격 코드 없음 |
| 공식 문서 파일 | QA에 적은 문서 파일 모두 존재 |

## 9. 남은 위험

| 위험 | 대응 |
|---|---|
| ALV 세부 API가 Keyword Doc에 전부 있지 않음 | 확인 가능한 공식 문서와 keyword audit 보조 근거를 분리 기록 |
| 색만으로 상태 전달 | 숫자/상태 텍스트 보완 필요성을 본문에 포함 |
| style을 업무 검증으로 오해 | 화면 style은 검증/보안이 아니라고 반복 명시 |
| 루프 안 manager 생성 성능 | 학습용이며 대량 성능은 CH32로 보류 |
| 이벤트 맛보기 과도 확장 | double click/hotspot/user command를 CH27로 명시 보류 |

## 10. 최종 판정

CH21 v3 산출물은 다음 조건을 충족한다.

- `content/abap/CH21`의 8개 레슨을 모두 반영했다.
- v2는 보조 기준으로만 사용했고, v3 본문은 CH21 교육 흐름에 맞춰 다시 구성했다.
- 입문자 기준으로 왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리 흐름을 레슨별로 작성했다.
- 코드가 있는 레슨마다 체험/시뮬레이터/버튼/상태/데이터/피드백 설계를 구체화했다.
- 공식 ABAP Keyword Documentation 파일을 `C:\ABAP_DOCU_HTML`에서 수동 확인했다.
- R15 게이팅과 CH21 표시 제어 경계를 지켰다.

판정: **통과**.
