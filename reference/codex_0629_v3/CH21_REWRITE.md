# CH21_REWRITE · SALV/Grid ALV 표시 제어 심화

> 주 소스: `content/abap/CH21/_chapter.md`, `content/abap/CH21/CH21-L01.md` ~ `CH21-L08.md`  
> 보조 참고: `reference/codex_0625_v2/CH21_REWRITE.md`, `reference/codex_0625_v2/CH21_QA.md`  
> 목표: CH21을 SALV/Grid ALV의 표시 제어를 실제 업무 화면 관점에서 이해하는 완성 강의자료로 재집필한다.

## CH21 전체 설계

CH11에서 SALV는 "내부 테이블을 빠르게 표로 보여 주는 도구"였다. CH17에서 Grid ALV는 Custom Container, Field Catalog, Layout, Variant, Refresh의 골격을 배웠다. CH20에서 OO ABAP을 배웠으므로 이제 `lo_salv->get_columns( )`, `go_grid->refresh_table_display( )` 같은 객체 메서드 호출을 단순 암기가 아니라 의미 있는 화면 제어로 읽을 수 있다.

CH21의 핵심은 데이터를 새로 저장하는 것이 아니다. 같은 데이터를 더 정확하게 보여 주는 것이다. 콘서트 회차 목록에서 잔여석 숫자만 보이면 사용자는 모든 행을 훑어야 한다. 반대로 매진 회차의 잔여석 셀은 빨강, 잔여 5석 이하 셀은 노랑으로 표시하면 위험 상태가 즉시 보인다. 예매 수량이 바뀐 뒤에도 스크롤 위치가 유지되면 화면은 실무 도구답게 느껴진다.

입문자가 CH21을 끝낸 뒤 답할 수 있어야 하는 질문은 다음이다.

| 질문 | 기대 답 |
|---|---|
| SALV에서 기능·정렬·필터는 언제 설정하는가? | `display( )` 전에 SALV 하위 설정 객체를 꺼내 설정한다. |
| SALV layout/variant는 무엇을 해결하는가? | 보기 좋은 초기 상태와 사용자별 저장 보기를 제공한다. |
| Grid ALV Field Catalog는 무엇인가? | DB 구조가 아니라 화면 표시 지시서다. |
| Cell Color에는 왜 deep structure가 필요한가? | 행마다 색 정보 internal table을 품어 특정 셀만 조건부로 칠하기 위해서다. |
| Cell Style과 Cell Color는 어떻게 다른가? | 색은 의미 강조, style은 비활성·활성·버튼 같은 모양/조작 힌트다. |
| Stable Refresh는 왜 필요한가? | 데이터 갱신 후에도 사용자가 보던 위치와 표시 상태를 최대한 유지하기 위해서다. |
| CH21에서 하지 않는 것은 무엇인가? | 본격 ALV 이벤트, editable grid 검증/저장, 실제 DML, CDS/RAP 모델링이다. |

## CH21 R15 경계

CH21은 CH18/CH19/CH20 이후이므로 modern syntax, modern SQL, OO 호출은 사용 가능하다. 그러나 CH21은 표시 제어 장이므로 후속 이벤트/편집/저장/모델링을 앞당기지 않는다.

| 구분 | CH21에서 정식 사용 | CH21에서 보류 |
|---|---|---|
| SALV | `CL_SALV_TABLE=>FACTORY`, `get_functions`, `get_sorts`, `get_filters`, `get_display_settings`, `get_columns`, `get_layout`, `display` | SALV 이벤트 전체 설계, toolbar command 처리 |
| Grid ALV | `CL_GUI_ALV_GRID`, `LVC_T_FCAT`, `LVC_S_LAYO`, `set_table_for_first_display` | double click, hotspot, toolbar event 본격 구현 |
| 색 제어 | `info_fname`, field catalog `emphasize`, `ctab_fname`, `LVC_T_SCOL`, `COL_NEGATIVE`, `COL_TOTAL` | 테마 커스터마이징, 디자인 시스템 심화 |
| 스타일 제어 | `stylefname`, `LVC_T_STYL`, `mc_style_disabled`, `mc_style_enabled`, `mc_style_button` | 입력 변경 이벤트, 저장 전 검증 |
| 갱신 | `refresh_table_display`, `LVC_S_STBL`, `i_soft_refresh` | 실시간 push, lock, 동시성 |
| 콘서트 앱 | `ZCL_BOOKING_MANAGER`로 잔여석 계산 후 표시 강조 | 실제 예약 저장·취소, 트랜잭션 제어, CDS/RAP |

## 공식 문서 수동 확인 근거

`C:\ABAP_DOCU_HTML`에서 확인 가능한 ALV/SALV 관련 공식 문서와 CH21에 필요한 ABAP 문법 문서를 수동 확인했다.

| 주제 | 확인 문서 | 반영 포인트 |
|---|---|---|
| ALV 사용 권장 | `abenabap_lists.htm`, `abenabap_dynpro_list.htm`, `abenlist_overview.htm`, `abenlist_guidl.htm` | classic list보다 SAP List Viewer(ALV) 사용 방향을 확인했다. |
| SALV 생성 예 | `abenfree_selection_abexa.htm`, `abapset_handler_instance.htm` | `cl_salv_table=>factory( IMPORTING r_salv_table = ... CHANGING t_table = ... )` 형태를 확인했다. |
| Grid ALV 표시 예 | `abendynpro_cfw_abexa.htm`, `abapreturn.htm` | `CL_GUI_ALV_GRID`, `LVC_S_LAYO`, `set_table_for_first_display`, `it_outtab` 흐름을 확인했다. |
| SALV 이벤트 예 | `abapset_handler_instance.htm` | `SET HANDLER`와 SALV double click 예가 있으나 CH21에서는 본격 구현을 보류한다. |
| 구조/deep structure | `abaptypes_struc.htm`, `abendata_objects_structure.htm` | 구조 component와 internal table component를 포함한 deep structure 개념을 확인했다. |
| 색상 상수 | `abapformat.htm`, `abapformat_shortref.htm`, `abenlist_format_color_abexa.htm`, `abenlist_format_color2_abexa.htm` | `COL_NEGATIVE`, `COL_TOTAL` 같은 색상 상수의 의미를 확인했다. |

한계도 명확히 둔다. ABAP Keyword Documentation은 모든 SALV/Grid ALV 클래스 API의 전체 signature reference를 싣는 구조가 아니다. 따라서 `ctab_fname`, `stylefname`, `LVC_T_SCOL`, `LVC_T_STYL`, `i_soft_refresh` 같은 ALV 세부 API는 원본 CH21과 `.project-docs/11_KEYWORD_AUDIT.md`의 CH21 공식 API 대조 결과를 보조 근거로 삼는다.

## CH21-L01 · SALV Sort / Filter / Function 제어

### 왜 필요한가

CH11의 SALV는 내부 테이블을 표로 띄우는 데 충분했다. 그러나 업무 화면은 "보이기만" 해서는 부족하다. 회차 목록이 날짜순으로 정렬되지 않고, 취소 회차가 섞여 있고, 사용자가 엑셀 내보내기나 필터 기능을 찾지 못하면 화면은 덜 만든 도구처럼 느껴진다.

SALV 객체는 `display( )` 전에 기본 기능, 정렬, 필터를 코드로 설정할 수 있다. 이 레슨은 SALV를 단순 출력 도구가 아니라 초기 표시 상태를 제어할 수 있는 객체로 보는 첫 단계다.

### 무엇인가

SALV 객체는 기능별 하위 객체를 제공한다.

| 하위 객체 | 대표 호출 | 의미 |
|---|---|---|
| functions | `get_functions( )->set_all( )` | 표준 툴바 기능을 켠다. |
| sorts | `get_sorts( )->add_sort( )` | 최초 표시 정렬을 지정한다. |
| filters | `get_filters( )->add_filter( )` | 최초 표시 필터를 지정한다. |
| aggregations | `get_aggregations( )` | 숫자 컬럼의 집계 표시를 지정한다. |

SALV factory 호출은 constructor처럼 반환값으로 받는 문장이 아니다. static method의 importing parameter로 SALV 객체 reference를 받는다.

```abap
DATA lt_perf TYPE STANDARD TABLE OF zperf.

SELECT *
  FROM zperf
  WHERE concert_id = @p_concert
  INTO TABLE @lt_perf.

TRY.
    cl_salv_table=>factory(
      IMPORTING
        r_salv_table = DATA(lo_salv)
      CHANGING
        t_table      = lt_perf ).

    lo_salv->get_functions( )->set_all( abap_true ).

    lo_salv->get_sorts( )->add_sort(
      columnname = 'PERF_DATE'
      sequence   = if_salv_c_sort=>sort_up ).

    lo_salv->get_filters( )->add_filter(
      columnname = 'STATUS'
      sign       = 'I'
      option     = 'NE'
      low        = 'C' ).

    lo_salv->display( ).

  CATCH cx_salv_msg INTO DATA(lx_salv).
    MESSAGE lx_salv->get_text( ) TYPE 'E'.
ENDTRY.
```

### 어떻게 확인하는가

1. `cl_salv_table=>factory` 다음 줄에서 `lo_salv`가 object reference로 채워졌는지 본다.
2. 표준 기능 버튼들이 화면에 보이는지 확인한다.
3. `PERF_DATE` 정렬이 최초 화면에 적용되는지 확인한다.
4. `STATUS = 'C'`인 테스트 행이 표시에서 제외되는지 확인한다.
5. 컬럼명을 일부러 `PERFDATE`로 바꿔 오류를 확인한다. 화면 제목이 아니라 내부 테이블 필드명을 써야 한다.

### 실수와 주의

- 설정은 `display( )` 전에 한다.
- `add_sort`, `add_filter`의 컬럼명은 내부 테이블 component 이름이다.
- SALV filter는 DB 조회량을 줄이는 기능이 아니다. 데이터 자체를 덜 읽어야 하면 `SELECT ... WHERE`에서 제한한다.
- 표준 기능을 모두 켜면 편하지만 화면 목적이 흐릴 수 있다. 업무 화면에서는 필요한 기능만 켜는 설계도 고려한다.

### 체험형 학습 설계

**SALV 초기 상태 조종 패널**

데이터:
- `lt_perf` 8행.
- 필드: `PERF_DATE`, `STATUS`, `CAPACITY`, `SEATSOCC`.
- 날짜는 일부러 뒤섞고, `STATUS`는 `A`, `C`, `F`를 섞는다.

버튼:
- `기본 표시`
- `표준 기능 켜기`
- `PERF_DATE 정렬`
- `취소 제외 필터`
- `필드명 오타 실행`

상태/피드백:
- `functionsOn`, `sortColumn`, `filterRule`, `visibleRows`, `errorMessage`
- 필드명 오타 시 "컬럼 PERFDATE를 찾을 수 없습니다. 내부 필드명 PERF_DATE를 사용해야 합니다."라고 표시한다.

### 정리

SALV는 `display( )` 한 번으로 끝나는 도구가 아니다. 표시 전에 기능, 정렬, 필터를 설정해 사용자가 처음 보는 화면을 업무 흐름에 맞게 준비할 수 있다.

## CH21-L02 · SALV Layout / Variant 심화

### 왜 필요한가

정렬과 필터가 맞아도 화면이 읽기 어렵다면 실무 도구로 부족하다. 컬럼 폭이 좁아 값이 잘리고, 컬럼 제목이 기술명처럼 보이고, 사용자가 매번 같은 컬럼 순서를 다시 맞춰야 한다면 사용 경험이 나쁘다.

SALV layout과 variant는 개발자가 좋은 기본 보기 상태를 제공하고, 사용자가 자기 업무 방식에 맞춘 보기를 저장할 수 있게 한다.

### 무엇인가

SALV 표시 설정은 크게 세 층이다.

| 층 | 객체 | 역할 |
|---|---|---|
| 전체 표 | `get_display_settings( )` | 줄무늬, list header 등 |
| 컬럼 | `get_columns( )` | 컬럼 폭 최적화, 컬럼 텍스트 |
| layout 저장 | `get_layout( )` | variant 저장 key와 저장 제한 |

```abap
DATA(lo_display) = lo_salv->get_display_settings( ).
lo_display->set_striped_pattern( abap_true ).
lo_display->set_list_header( '회차별 예매 현황' ).

DATA(lo_columns) = lo_salv->get_columns( ).
lo_columns->set_optimize( abap_true ).

TRY.
    DATA(lo_capacity) = lo_columns->get_column( 'CAPACITY' ).
    lo_capacity->set_short_text( '정원' ).
    lo_capacity->set_medium_text( '정원' ).
    lo_capacity->set_long_text( '정원' ).

  CATCH cx_salv_not_found.
    MESSAGE 'CAPACITY 컬럼을 찾을 수 없습니다.' TYPE 'E'.
ENDTRY.

DATA(lo_layout) = lo_salv->get_layout( ).
lo_layout->set_key( VALUE salv_s_layout_key( report = sy-repid ) ).
lo_layout->set_save_restriction( if_salv_c_layout=>restrict_none ).
```

`set_key`는 저장된 variant가 어떤 report에 속하는지 알려 주는 식별자다. `sy-repid`를 사용하면 현재 프로그램 기준으로 variant를 묶는다.

### 어떻게 확인하는가

1. 줄무늬를 켜고 끄며 행 구분이 쉬워지는지 비교한다.
2. list header가 화면 제목으로 표시되는지 확인한다.
3. `set_optimize( abap_true )`를 주석 처리해 컬럼 폭 차이를 확인한다.
4. `get_column( 'CAPACITY' )`를 잘못된 이름으로 바꿔 `cx_salv_not_found`를 확인한다.
5. variant를 저장하고 프로그램을 다시 실행해 저장된 보기 상태를 불러올 수 있는지 확인한다.

### 실수와 주의

- `set_long_text`만 바꾸면 화면에서 기대한 제목이 안 보일 수 있다. short/medium/long text를 함께 맞추면 혼란이 줄어든다.
- layout variant는 표시 설정 저장이지 권한 제어가 아니다. 민감한 컬럼은 숨김이 아니라 조회 자체를 제한해야 한다.
- variant 저장에는 key가 필요하다.
- 사용자가 저장한 variant가 개발자가 정한 기본 보기와 다를 수 있음을 고려한다.

### 체험형 학습 설계

**Variant 저장 실험실**

데이터:
- 회차 6행.
- 컬럼: `CONCERT_ID`, `PERF_DATE`, `CAPACITY`, `SEATSOCC`, `STATUS`, `CREATED_BY`.

버튼:
- `줄무늬 토글`
- `폭 최적화`
- `정원 텍스트 적용`
- `Variant 저장`
- `Variant 초기화`
- `컬럼명 오타`

상태/피드백:
- `striped`, `optimized`, `columnTexts`, `layoutKey`, `savedVariant`, `columnOrder`
- 컬럼명 오타 시 내부 필드명 기준이라는 피드백을 준다.

### 정리

SALV layout은 표를 보기 좋게 만드는 초기 설정이고, variant는 사용자가 자기 업무 방식에 맞춰 저장하는 보기다. 둘 다 데이터 변경이 아니라 표시 경험을 제어한다.

## CH21-L03 · Grid ALV Column 제어 심화

### 왜 필요한가

SALV가 편리한 표라면 Grid ALV는 더 세밀한 화면 제어 도구다. CH17에서 Field Catalog를 만들었다면, CH21에서는 이것을 단순 컬럼 목록이 아니라 "화면 표시 지시서"로 이해해야 한다.

예를 들어 `MANDT`는 기술 필드라 숨기고, `SEATS`는 합계를 켜고, `STATUS`는 가운데 정렬하는 식이다. 이 판단은 DB 테이블 구조가 아니라 화면 설계 판단이다.

### 무엇인가

`LVC_T_FCAT`은 Grid ALV field catalog의 internal table type이다. 각 행은 한 컬럼의 표시 규칙을 담는다.

| 속성 | 의미 | 예 |
|---|---|---|
| `fieldname` | 적용할 output table 필드명 | `STATUS` |
| `no_out` | 기본 화면에서 숨김 | `MANDT` 숨김 |
| `do_sum` | 숫자 컬럼 합계 | `SEATS` 합계 |
| `just` | 정렬 방향 | `L`, `C`, `R` |
| `key` | 키 컬럼 표시 | `PERF_NO` |
| `edit` | 입력 가능 표시 | 실제 편집 처리는 CH28 |

```abap
LOOP AT lt_fcat ASSIGNING FIELD-SYMBOL(<fc>).
  CASE <fc>-fieldname.
    WHEN 'MANDT'.
      <fc>-no_out = abap_true.

    WHEN 'SEATS'.
      <fc>-do_sum = abap_true.

    WHEN 'STATUS'.
      <fc>-just = 'C'.

    WHEN 'PERF_NO'.
      <fc>-key = abap_true.
  ENDCASE.
ENDLOOP.
```

### 어떻게 확인하는가

1. Grid 표시 전에 `lt_fcat`을 디버거로 확인한다.
2. `MANDT-no_out`을 켠 뒤 화면에서 기본 숨김이 되는지 본다.
3. `SEATS-do_sum`을 켠 뒤 숫자 합계가 표시되는지 확인한다.
4. 문자 컬럼에 `do_sum`을 켜서 부적합한 설정을 확인한다.
5. `no_out`과 field catalog에서 아예 제거하는 것의 차이를 비교한다.

### 실수와 주의

- `fieldname`은 output table component 이름과 정확히 맞아야 한다.
- `do_sum`은 숫자 성격 컬럼에만 의미가 있다.
- `no_out`은 숨김이지 보안이 아니다. 사용자가 다시 표시할 수 있다.
- `edit = abap_true`는 입력 가능 표시일 뿐이다. 변경 이벤트와 저장 검증은 CH28에서 다룬다.

### 체험형 학습 설계

**Field Catalog 조립대**

데이터:
- output table 5행.
- field catalog row 목록을 왼쪽 패널에 표시한다.

버튼:
- `MANDT 숨김`
- `SEATS 합계`
- `STATUS 가운데`
- `PERF_NO key`
- `문자 합계 실패`

상태/피드백:
- `fieldCatalogRows`, `visibleColumns`, `sumColumns`, `alignmentMap`
- 문자 합계 시 "숫자 컬럼에만 합계가 의미 있습니다."라고 표시한다.

### 정리

Field Catalog는 DB 구조가 아니라 ALV 화면 지시서다. 어떤 컬럼을 숨기고, 합계 내고, 정렬하고, 강조할지 결정하는 화면 설계 문서로 읽어야 한다.

## CH21-L04 · Deep Structure 기반 Cell Color

### 왜 필요한가

CH17에서 행 전체 색을 봤다면, CH21에서는 특정 셀만 칠한다. 콘서트 회차에서 전체 행이 나쁜 것은 아니지만 `SEATS_LEFT = 0`인 칸만 위험할 수 있다. 이때 행 전체를 빨갛게 칠하면 정보가 거칠고, 셀 색은 문제 지점을 정확히 보여 준다.

### 무엇인가

셀 색은 행 구조 안에 색 정보 internal table을 품는 방식이다. 이것이 Deep Structure(내부에 참조형/테이블형 component를 품은 구조)다.

```abap
TYPES: BEGIN OF ty_perf_alv,
         concert_id TYPE zconcert-concert_id,
         perf_no    TYPE zbooking-perf_no,
         seatsocc   TYPE i,
         capacity   TYPE i,
         cellcolors TYPE lvc_t_scol,
       END OF ty_perf_alv.

DATA lt_perf_alv TYPE STANDARD TABLE OF ty_perf_alv.
```

각 행의 특정 셀에 색을 지정한다.

```abap
LOOP AT lt_perf_alv ASSIGNING FIELD-SYMBOL(<perf>).
  CLEAR <perf>-cellcolors.

  IF <perf>-seatsocc >= <perf>-capacity.
    APPEND VALUE lvc_s_scol(
      fname     = 'SEATSOCC'
      color-col = col_negative
      color-int = abap_true ) TO <perf>-cellcolors.
  ENDIF.
ENDLOOP.

DATA ls_layout TYPE lvc_s_layo.
ls_layout-ctab_fname = 'CELLCOLORS'.
```

`cellcolors`에 색 데이터를 채우는 것만으로는 부족하다. `ls_layout-ctab_fname = 'CELLCOLORS'`로 ALV layout에 "이 component가 셀 색 정보다"라고 알려 줘야 한다.

### 어떻게 확인하는가

1. `lt_perf_alv`의 한 행에서 `cellcolors` 내부 테이블이 비어 있는지 확인한다.
2. 매진 조건을 만족하는 행에서 `fname = 'SEATSOCC'`, `color-col = col_negative`가 들어가는지 본다.
3. `ctab_fname`을 주석 처리하고 실행한다. 색 데이터는 있어도 화면에 반영되지 않아야 한다.
4. `fname`을 실제 컬럼명과 다르게 바꿔 색이 적용되지 않는지 확인한다.
5. DB 조회용 flat table과 ALV 표시용 deep table을 분리했는지 확인한다.

### 실수와 주의

- `ctab_fname`을 지정하지 않으면 색 정보가 무시된다.
- `fname`은 field catalog의 fieldname과 정확히 맞아야 한다.
- DB table에 `LVC_T_SCOL` 같은 deep component를 넣는다고 생각하면 안 된다. 이것은 ALV 표시용 internal table 구조다.
- 색만으로 상태를 전달하지 않는다. 숫자, 상태 텍스트, 아이콘 같은 보조 정보도 함께 고려한다.

### 체험형 학습 설계

**Cell Color 현미경**

데이터:
- 정상/임박/매진 회차 5행.
- 각 행을 펼치면 `cellcolors` 내부 테이블을 볼 수 있다.

버튼:
- `색 계산`
- `ctab_fname 연결`
- `fname 오타`
- `DB flat/display deep 비교`

상태/피드백:
- `cellcolorsByRow`, `layoutCtabFname`, `paintedCells`
- 색 데이터가 있는데 layout 연결이 없으면 "색 정보는 있지만 ALV가 어디를 봐야 할지 모릅니다."라고 표시한다.

### 정리

Cell Color는 특정 행의 특정 셀만 조건부로 강조하는 기술이다. 표시용 행 구조에 `LVC_T_SCOL` component를 두고, layout의 `ctab_fname`으로 연결해야 화면에 나타난다.

## CH21-L05 · Deep Structure 기반 Cell Style

### 왜 필요한가

색은 "주의해야 한다"는 의미를 전달한다. 그러나 어떤 셀은 조작 가능성 자체를 다르게 보여 줘야 한다. 매진 회차의 좌석 입력 칸은 비활성처럼 보여야 하고, 상세 보기 칸은 버튼처럼 보여야 할 수 있다.

Cell Style은 색이 아니라 셀의 모양과 조작 가능성 힌트를 제어한다.

### 무엇인가

Cell Style도 행 구조 안에 style 정보 internal table을 둔다.

```abap
TYPES: BEGIN OF ty_perf_alv,
         concert_id TYPE zconcert-concert_id,
         perf_no    TYPE zbooking-perf_no,
         seatsocc   TYPE i,
         capacity   TYPE i,
         cellstyles TYPE lvc_t_styl,
       END OF ty_perf_alv.
```

```abap
LOOP AT lt_perf_alv ASSIGNING FIELD-SYMBOL(<perf>).
  CLEAR <perf>-cellstyles.

  IF <perf>-seatsocc >= <perf>-capacity.
    APPEND VALUE lvc_s_styl(
      fieldname = 'SEATSOCC'
      style     = cl_gui_alv_grid=>mc_style_disabled ) TO <perf>-cellstyles.
  ENDIF.
ENDLOOP.

DATA ls_layout TYPE lvc_s_layo.
ls_layout-stylefname = 'CELLSTYLES'.
```

대표 style constant:

| constant | 의미 | CH21 해석 |
|---|---|---|
| `mc_style_disabled` | 비활성 표시 | 매진 회차 셀을 더 이상 조작하지 못하는 것처럼 표시 |
| `mc_style_enabled` | 활성 표시 | 조건부 입력 가능 표시. 실제 처리 CH28 |
| `mc_style_button` | 버튼처럼 표시 | 클릭 이벤트 처리는 CH27/CH28 |

### 어떻게 확인하는가

1. `cellstyles`가 없는 상태로 화면을 본다.
2. 매진 행의 `cellstyles`에 `fieldname = 'SEATSOCC'`, disabled style이 들어가는지 확인한다.
3. `stylefname`을 layout에 지정한 뒤 셀 모양이 바뀌는지 본다.
4. `stylefname`을 제거하면 style 데이터가 있어도 화면이 바뀌지 않는지 확인한다.
5. button style을 적용하되 클릭 처리는 하지 않는다. 본격 이벤트는 CH27 범위다.

### 실수와 주의

- 색은 `ctab_fname`, 스타일은 `stylefname`이다.
- `LVC_T_SCOL`은 `fname`, `LVC_T_STYL`은 `fieldname`을 쓴다.
- disabled처럼 보여도 서버 검증은 필요하다. 화면 style은 보안이나 업무 검증이 아니다.
- 편집 가능 표시와 실제 편집 처리/저장은 다르다. CH28에서 다룬다.

### 체험형 학습 설계

**Cell Style 스위치보드**

데이터:
- 정상, 매진, 관리자만 수정 가능, 상세 버튼 필요 상태 4행.

버튼:
- `매진 셀 비활성`
- `관리자 셀 활성`
- `상세 버튼 스타일`
- `stylefname 연결 끊기`
- `색/스타일 비교`

상태/피드백:
- `styleRows`, `layoutStylefname`, `styledCells`, `deferredEventNotice`
- 버튼 style을 누르면 "버튼처럼 보이지만 클릭 이벤트 처리는 CH27에서 구현합니다."라고 표시한다.

### 정리

Cell Style은 셀의 모양과 조작 가능성 힌트를 제어한다. 구조는 Cell Color와 비슷하지만 `LVC_T_STYL`과 `stylefname`을 사용한다. 실제 입력 처리와 이벤트는 후속 장의 책임이다.

## CH21-L06 · Row / Column / Cell Color 선택 기준

### 왜 필요한가

색을 배운 뒤 가장 흔한 실수는 모든 것을 색으로 해결하려는 것이다. 매진 행 전체를 빨강, 잔여석 셀도 빨강, 중요 컬럼도 파랑, 키 컬럼도 다른 색으로 칠하면 화면은 화려하지만 정보는 흐려진다.

좋은 ALV 화면은 색을 많이 쓰는 화면이 아니라 색의 단위가 정확한 화면이다.

### 무엇인가

색 제어는 세 단위로 나눈다.

| 단위 | 방법 | 적합한 상황 | 예 |
|---|---|---|---|
| 행 색 | `info_fname` | 행 전체 상태가 중요 | 취소 회차 전체 회색 |
| 컬럼 색 | field catalog `emphasize` | 특정 컬럼이 항상 중요 | `SEATS_LEFT` 컬럼 강조 |
| 셀 색 | `ctab_fname` + `LVC_T_SCOL` | 행마다 특정 셀만 조건부 강조 | 잔여석 0인 셀만 빨강 |

판단 흐름:

```text
행 전체가 같은 의미인가?
  예: 행 색
  아니오: 특정 컬럼이 항상 중요한가?
    예: 컬럼 색
    아니오: 행마다 달라지는 한 칸 조건인가?
      예: 셀 색
```

### 어떻게 확인하는가

1. 같은 회차 데이터를 행 색 화면, 컬럼 색 화면, 셀 색 화면으로 나누어 본다.
2. "매진 회차 찾기"에는 행 색이 빠른지 확인한다.
3. "잔여석 위험 칸 찾기"에는 셀 색이 더 정확한지 확인한다.
4. 같은 의미를 행 색과 셀 색으로 중복 표시했을 때 화면이 과해지는지 비교한다.
5. 색을 모두 제거하고 숫자만 볼 때 판단 시간이 늘어나는지 확인한다.

### 실수와 주의

- 빨강/노랑/초록 같은 색 의미를 화면마다 일관되게 유지한다.
- 색만으로 상태를 전달하지 않는다. 상태 텍스트나 아이콘도 함께 고려한다.
- 셀 색은 가장 세밀하지만 deep structure와 계산이 필요하다. 행/컬럼 색으로 충분하면 단순한 쪽을 선택한다.
- `emphasize`와 row color의 실제 색감은 SAP GUI 테마에 따라 달라질 수 있다.

### 체험형 학습 설계

**색 단위 선택 퀴즈**

데이터:
- 상황 카드: 회차 전체 취소, 잔여석 3석, 예매자 이름 컬럼 중요, 정원 초과 오류, VIP 전용 회차.

버튼:
- `행 색`
- `컬럼 색`
- `셀 색`
- `색 쓰지 않기`

상태/피드백:
- `scenario`, `selectedColorUnit`, `recommendedUnit`, `reason`, `previewTable`
- 잔여석 3석에 행 색을 고르면 "행 전체가 나쁜 것이 아니라 잔여석 셀만 주의 대상입니다."라고 표시한다.

### 정리

색 단위 선택은 화면 설계다. 행 전체 상태는 행 색, 항상 중요한 열은 컬럼 색, 조건부 한 칸은 셀 색을 쓴다. 색을 많이 쓰는 것보다 정확한 단위를 고르는 것이 중요하다.

## CH21-L07 · Stable Refresh와 표시 상태 보존

### 왜 필요한가

업무 화면은 갱신된다. 예매가 추가되면 잔여석이 바뀌고, 취소가 들어오면 상태가 바뀐다. 그런데 갱신할 때마다 사용자가 보던 스크롤 위치와 선택 행이 초기화되면 화면은 불편하다.

Stable Refresh는 데이터는 갱신하되 사용자가 보던 위치를 가능한 유지하는 기술이다.

### 무엇인가

Grid ALV 갱신은 `refresh_table_display`로 한다.

```abap
DATA ls_stable TYPE lvc_s_stbl.
ls_stable-row = abap_true.
ls_stable-col = abap_true.

go_grid->refresh_table_display(
  EXPORTING
    is_stable      = ls_stable
    i_soft_refresh = abap_true ).
```

| 옵션 | 의미 |
|---|---|
| `is_stable-row` | 세로 위치를 가능한 유지 |
| `is_stable-col` | 가로 위치를 가능한 유지 |
| `i_soft_refresh` | 현재 표시 상태를 최대한 유지하며 가볍게 갱신 |

중요한 점은 refresh가 DB를 다시 읽지 않는다는 것이다. 먼저 ALV가 바라보는 output table의 값을 바꾼 뒤 refresh해야 한다.

```abap
READ TABLE lt_perf_alv ASSIGNING FIELD-SYMBOL(<perf>)
  WITH KEY concert_id = p_concert
           perf_no    = p_perf.

IF sy-subrc = 0.
  <perf>-seatsocc = <perf>-seatsocc + p_new_seats.
  <perf>-seats_left = <perf>-capacity - <perf>-seatsocc.
  PERFORM fill_cell_color CHANGING <perf>.
ENDIF.

go_grid->refresh_table_display(
  EXPORTING
    is_stable      = VALUE lvc_s_stbl( row = abap_true col = abap_true )
    i_soft_refresh = abap_true ).
```

### 어떻게 확인하는가

1. 100행짜리 회차 목록을 띄우고 70번째 행 근처까지 스크롤한다.
2. stable 옵션 없이 refresh를 실행해 위치가 튀는지 본다.
3. `is_stable-row`, `is_stable-col`을 켠 뒤 같은 갱신을 실행해 위치 유지 여부를 비교한다.
4. 단순 값 변경과 field catalog 변경을 구분한다. 구조 변경은 soft refresh만으로 충분하지 않을 수 있다.
5. 선택 행 보존이 중요하면 refresh 전 key 저장과 refresh 후 재선택이 필요한지 확인한다.

### 실수와 주의

- refresh 전에 output table을 먼저 갱신한다.
- Grid 객체를 매번 새로 만들면 stable refresh의 의미가 사라진다.
- `i_soft_refresh`는 모든 구조 변경을 해결하는 만능 옵션이 아니다.
- 정렬/필터가 걸린 상태에서 값이 바뀌면 재정렬이 필요한지 업무 기준으로 판단해야 한다.

### 체험형 학습 설계

**Refresh 흔들림 비교기**

데이터:
- 100행 회차 목록.
- 사용자는 70번째 행 근처를 보고 있는 상태에서 예매 수량 변경을 실행한다.

버튼:
- `Hard Refresh`
- `Stable Refresh`
- `Soft + Stable Refresh`
- `데이터만 변경`
- `컬럼 구조 변경`

상태/피드백:
- `scrollRow`, `scrollColumn`, `selectedKey`, `refreshMode`, `tableChanged`, `layoutChanged`
- hard refresh는 첫 줄로 튀는 모습을 보여 주고, stable refresh는 현재 줄 주변을 유지한다.

### 정리

Stable Refresh는 사용자 흐름을 지키는 표시 기술이다. 먼저 internal table 값을 바꾸고, 같은 Grid 객체에 `refresh_table_display`를 호출하며, `is_stable`과 `i_soft_refresh`를 상황에 맞게 사용한다.

## CH21-L08 · 실습: 매진 회차 색 강조

### 왜 필요한가

마지막 실습은 콘서트 앱 회차 목록에 CH21 표시 제어를 적용한다. 목표는 "색이 예쁜 표"가 아니라 "업무 상태가 즉시 읽히는 표"다. 잔여석 0은 빨강, 5석 이하는 노랑으로 보여 주면 사용자는 위험 회차를 바로 찾을 수 있다.

이 실습은 CH20의 `ZCL_BOOKING_MANAGER`로 잔여석을 계산하고, CH21-L04의 Cell Color로 `SEATS_LEFT` 셀을 강조한다.

### 무엇인가

표시용 row type을 만든다. `cellcolors`는 DB 저장 필드가 아니라 ALV 표시용 deep component다.

```abap
TYPES: BEGIN OF ty_row,
         concert_id TYPE zconcert-concert_id,
         perf_no    TYPE zbooking-perf_no,
         perf_date  TYPE zperf-perf_date,
         capacity   TYPE i,
         seats_left TYPE i,
         cellcolors TYPE lvc_t_scol,
       END OF ty_row.

DATA lt_row TYPE STANDARD TABLE OF ty_row.
```

잔여석 계산 후 색 정보를 채운다.

```abap
LOOP AT lt_row ASSIGNING FIELD-SYMBOL(<row>).
  DATA(lo_mgr) = NEW zcl_booking_manager(
    iv_concert = <row>-concert_id
    iv_perf    = <row>-perf_no ).

  <row>-seats_left = lo_mgr->remaining( ).
  CLEAR <row>-cellcolors.

  IF <row>-seats_left <= 0.
    APPEND VALUE lvc_s_scol(
      fname     = 'SEATS_LEFT'
      color-col = col_negative
      color-int = abap_true ) TO <row>-cellcolors.

  ELSEIF <row>-seats_left <= 5.
    APPEND VALUE lvc_s_scol(
      fname     = 'SEATS_LEFT'
      color-col = col_total
      color-int = abap_true ) TO <row>-cellcolors.
  ENDIF.
ENDLOOP.

DATA ls_layout TYPE lvc_s_layo.
ls_layout-ctab_fname = 'CELLCOLORS'.
```

Grid에 표시할 때 layout과 field catalog를 함께 넘긴다.

```abap
go_grid->set_table_for_first_display(
  EXPORTING
    is_layout       = ls_layout
  CHANGING
    it_outtab       = lt_row
    it_fieldcatalog = lt_fcat ).
```

`CELLCOLORS`는 화면에 보일 업무 컬럼이 아니므로 field catalog에서 기술용으로 숨긴다.

```abap
LOOP AT lt_fcat ASSIGNING FIELD-SYMBOL(<fc>).
  IF <fc>-fieldname = 'CELLCOLORS'.
    <fc>-tech = abap_true.
  ENDIF.
ENDLOOP.
```

### 어떻게 확인하는가

1. 잔여석이 `0`, `3`, `12`인 회차를 각각 준비한다.
2. `remaining( )` 결과가 `seats_left`에 들어가는지 확인한다.
3. `seats_left = 0`이면 `COL_NEGATIVE`, `seats_left <= 5`이면 `COL_TOTAL`이 들어가는지 본다.
4. `ctab_fname`을 제거해 색이 사라지는지 확인한다.
5. `fname = 'LEFT'`처럼 필드명을 틀리게 해서 색이 적용되지 않는지 확인한다.
6. 예매가 추가되어 6석에서 5석으로 바뀌는 상황을 만들고 stable refresh 후 노랑으로 바뀌는지 확인한다.

### 실수와 주의

- `fname`은 output table component 이름 `SEATS_LEFT`와 정확히 맞아야 한다.
- 루프 안에서 manager 객체를 매번 만드는 코드는 학습용으로 이해하기 쉽다. 대량 데이터 성능은 CH32에서 다시 본다.
- 색은 표시 결과다. 진짜 업무 검증은 `ZCL_BOOKING_MANAGER` 같은 서버 로직에서 해야 한다.
- 더블클릭으로 예매 목록을 띄우는 아이디어는 맛보기로만 둔다. `double_click`, `hotspot_click`, `user_command`는 CH27에서 정식 구현한다.

### 체험형 학습 설계

**Concert ALV Color Lab**

데이터:
- 회차 6행.
- `capacity`, `booked`, `seats_left`를 보여 준다.
- `seats_left`는 `ZCL_BOOKING_MANAGER` 카드의 계산 결과와 연결한다.

버튼:
- `잔여석 계산`
- `색 규칙 적용`
- `예매 1건 추가`
- `예매 5건 추가`
- `ctab_fname 끄기`
- `fname 오타`
- `Stable Refresh`

상태/피드백:
- `rows`, `managerCalls`, `cellcolors`, `layoutCtabFname`, `refreshMode`, `selectedPerfNo`
- 잔여석이 5가 되면 노랑, 0이 되면 빨강으로 바뀐다.
- `ctab_fname`을 끄면 내부 색 데이터는 남지만 화면 색은 사라진다.

### 정리

CH21-L08의 완성 기준은 업무 계산, 표시용 deep component, layout 연결이 모두 이어지는 것이다. `remaining( )`으로 상태를 계산하고, `cellcolors`에 조건부 색을 채우고, `ctab_fname`으로 ALV에 연결해야 매진 상태가 즉시 보이는 화면이 된다.

## CH21 최종 정리

CH21은 ALV를 단순 출력에서 업무 화면으로 끌어올리는 장이다.

| 주제 | 핵심 |
|---|---|
| SALV functions/sort/filter | `display( )` 전에 초기 기능과 표시 조건을 설정한다. |
| SALV layout/variant | 좋은 기본 보기와 사용자 저장 보기를 제공한다. |
| Field Catalog | output table을 화면에 어떻게 보여 줄지 정하는 지시서다. |
| Cell Color | `LVC_T_SCOL` deep component와 `ctab_fname`으로 특정 셀을 강조한다. |
| Cell Style | `LVC_T_STYL` deep component와 `stylefname`으로 셀 모양/조작 힌트를 제어한다. |
| Color 단위 | 행 전체, 컬럼 전체, 특정 셀 중 의미에 맞는 단위를 고른다. |
| Stable Refresh | 데이터 갱신 후 사용자의 위치와 표시 상태를 최대한 지킨다. |
| 콘서트 실습 | `ZCL_BOOKING_MANAGER` 결과를 ALV 색 강조로 연결한다. |

다음 CH22에서는 콘서트 데이터를 CDS View Entity로 모델링한다. CH21이 ABAP 내부 테이블을 잘 보여 주는 기술이었다면, CH22는 데이터 모델 자체를 재사용 가능한 뷰로 정의하는 기술이다.
