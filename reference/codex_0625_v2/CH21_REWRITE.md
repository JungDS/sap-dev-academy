# CH21_REWRITE · SALV/Grid ALV 표시 제어 심화

> 기준: `reference/codex_0625/00_QUALITY_REVIEW.md`의 재작업 판정
> 원본: `content/abap/CH21/_chapter.md`, `content/abap/CH21/CH21-L01.md` ~ `CH21-L08.md`
> 목적: CH21을 반복 템플릿이 아니라, SALV와 Grid ALV의 표시 제어를 입문자가 실제로 따라갈 수 있는 완성 강의자료로 재집필한다.

## CH21의 역할

CH11에서 SALV는 "내부 테이블을 빠르게 표로 보여 주는 도구"였다. CH17에서 Grid ALV는 컨테이너, field catalog, layout, variant, refresh 같은 화면 제어의 기본 골격이었다. CH20에서 객체지향을 배웠으므로 이제 `lo_salv->get_columns( )`, `go_grid->refresh_table_display( )` 같은 객체 메서드 호출을 코드의 의미로 읽을 수 있다.

CH21은 데이터를 새로 저장하거나 업무 로직을 바꾸는 장이 아니다. 같은 데이터를 더 정확하게 보여 주는 장이다. 콘서트 예매 앱에서 "잔여석 0"이라는 숫자만 보이면 사용자는 한참 훑어야 한다. 그러나 매진 회차의 잔여석 셀만 빨간색, 잔여석이 5석 이하인 셀만 노란색으로 보이면 위험 상태가 즉시 보인다. 예매가 추가되어도 사용자가 보던 스크롤 위치가 튀지 않으면 화면이 업무 도구답게 느껴진다.

입문자는 이 챕터가 끝났을 때 다음 질문에 답할 수 있어야 한다.

- SALV에서 표준 기능, 기본 정렬, 필터, 제목, 컬럼 텍스트, layout variant를 코드로 어떻게 제어하는가?
- Grid ALV에서 field catalog는 데이터가 아니라 "화면에 표시하는 지시서"라는 점을 어떻게 확인하는가?
- 행 색, 컬럼 색, 셀 색은 각각 어떤 상황에 쓰고, 왜 셀 색에는 deep structure가 필요한가?
- `LVC_T_SCOL`과 `LVC_T_STYL`을 표시용 내부 테이블의 한 컬럼으로 넣을 때 무엇을 조심해야 하는가?
- `refresh_table_display`에서 stable refresh와 soft refresh는 사용자 경험을 어떻게 바꾸는가?
- 본격적인 ALV 이벤트, hotspot, editable grid 처리는 왜 CH27/CH28로 보류하는가?

## R15 경계

CH21은 CH18/CH19/CH20 이후 장이므로 modern syntax와 OO 호출은 사용할 수 있다. 하지만 ALV 이벤트와 편집 처리의 완성 구현을 앞당기면 CH27/CH28의 학습 경계가 무너진다.

| 구분 | CH21에서 정식 사용 | 아직 보류 |
|---|---|---|
| SALV | `CL_SALV_TABLE=>FACTORY`, `get_functions`, `get_sorts`, `get_filters`, `get_display_settings`, `get_columns`, `get_layout`, `display` | SALV 이벤트 전체 설계, toolbar command 처리 심화 |
| Grid ALV | `CL_GUI_ALV_GRID`, `LVC_T_FCAT`, `LVC_S_LAYO`, `set_table_for_first_display`, 표시용 layout/field catalog | 사용자 command, toolbar event, double click 상세 구현은 CH27 |
| 색 제어 | `info_fname`, field catalog `emphasize`, `ctab_fname`, `LVC_T_SCOL`, `COL_NEGATIVE`, `COL_TOTAL` | 색 테마 커스터마이징, 접근성/디자인 시스템 심화 |
| 스타일 제어 | `stylefname`, `LVC_T_STYL`, `mc_style_disabled`, `mc_style_enabled`, `mc_style_button` | 실제 입력값 검증, `DATA_CHANGED`, `CHECK_CHANGED_DATA`, 저장 로직은 CH28 |
| 갱신 | `refresh_table_display`, `LVC_S_STBL`, `i_soft_refresh` | 실시간 push, locking, optimistic update, 동시성 심화 |
| 콘서트 앱 | `ZCL_BOOKING_MANAGER`로 잔여석 계산 후 표시 강조 | 실제 `INSERT/UPDATE/DELETE`는 CH24, CDS/RAP는 CH22/CH23 |

> CH21의 핵심은 "업무 상태를 읽기 쉽게 보여 주기"다. 더블클릭으로 상세 목록을 띄우는 아이디어는 맛보기로만 둔다. `SET HANDLER`와 ALV 이벤트의 본격 설계는 CH27에서 학습한다.

## 공식 문서 수동 확인 근거

이번 재작성은 v1의 자동 공식문서 힌트를 그대로 쓰지 않았다. `C:\ABAP_DOCU_HTML`에서 ALV/SALV가 실제로 등장하는 문서와 CH21 코드에 필요한 ABAP 문법 문서를 수동으로 확인했다.

| 주제 | 확인한 문서 파일 | 본문 반영 포인트 |
|---|---|---|
| ALV 사용 권장 | `abenabap_lists.htm`, `abenabap_dynpro_list.htm`, `abenlist_overview.htm`, `abenlist_guidl.htm` | classic list를 직접 쓰기보다 SAP List Viewer(ALV) 클래스를 사용하라는 방향과 `CL_SALV_TABLE` 예시를 확인했다. |
| SALV 생성 | `abenfree_selection_abexa.htm`, `abapset_handler_instance.htm` | `cl_salv_table=>factory( IMPORTING r_salv_table = ... CHANGING t_table = ... )` 후 `display( )`하는 형태를 확인했다. |
| Grid ALV 표시 | `abendynpro_cfw_abexa.htm`, `abapreturn.htm` | `CL_GUI_ALV_GRID`, `LVC_S_LAYO`, `set_table_for_first_display`, `is_layout`, `it_outtab` 사용 예를 확인했다. |
| SALV 이벤트 맛보기 | `abapset_handler_instance.htm` | `FOR EVENT double_click OF cl_salv_events_table`, `SET HANDLER ... FOR alv->get_event( )` 예제가 있으나, CH21에서는 경계 설명만 하고 본격 구현은 CH27로 보류한다. |
| 구조와 deep structure | `abaptypes_struc.htm`, `abendata_objects_structure.htm` | `BEGIN OF ... END OF` 구조, table type component, internal table을 포함한 deep structure, deep component가 실제 데이터 참조라는 점을 반영했다. |
| deep structure 제한 | `abendata_objects_structure.htm` | SQL work area는 deep component 사용에 제한이 있으므로, DB 조회용 flat table과 ALV 표시용 deep table을 분리하도록 설명했다. |
| 색상 상수 | `abapformat.htm`, `abapformat_shortref.htm`, `abenlist_format_color_abexa.htm`, `abenlist_format_color2_abexa.htm` | `COL_TOTAL`이 노란색 계열, `COL_NEGATIVE`가 빨간색 계열인 색상 상수임을 확인했다. |

`C:\ABAP_DOCU_HTML`의 ABAP Keyword Documentation은 모든 SALV/Grid ALV 클래스 API의 전체 signature를 클래스별 레퍼런스로 싣는 구조가 아니다. 따라서 `ctab_fname`, `stylefname`, `LVC_T_SCOL`, `LVC_T_STYL`, `emphasize`, `i_soft_refresh` 같은 ALV 세부 API명은 `.project-docs/11_KEYWORD_AUDIT.md`의 CH21 공식 API 대조 결과와 원본 CH21 범위를 함께 사용했다. 단, 본문에 붙이는 공식문서 근거는 위처럼 실제로 수동 확인한 항목으로만 제한했다.

## CH21-L01 · SALV Sort / Filter / Function 제어

### 왜 필요한가

CH11의 SALV는 내부 테이블을 빨리 보여 주는 데 충분했다. 그러나 실제 업무 표는 "그냥 보이기만" 하면 부족하다. 회차 목록을 열었는데 날짜가 뒤섞여 있거나, 취소된 회차가 섞여 있거나, 사용자가 엑셀 다운로드와 합계 기능을 찾을 수 없다면 보고서가 아니라 덜 만든 표처럼 느껴진다.

입문자가 여기서 잡아야 할 관점은 단순하다. SALV는 `display( )` 한 번으로 끝나는 객체가 아니다. `display( )` 전에 SALV 객체에게 "표준 기능을 켜라", "이 컬럼으로 먼저 정렬하라", "이 상태는 제외하라" 같은 표시 조건을 지시할 수 있다.

### 무엇인가

SALV 객체는 여러 하위 객체를 돌려준다.

| 하위 객체 | 대표 메서드 | 의미 |
|---|---|---|
| functions | `get_functions( )->set_all( )` | 표준 툴바 기능을 켠다. 정렬, 필터, 인쇄, 내보내기 같은 사용자 도구가 보인다. |
| sorts | `get_sorts( )->add_sort( )` | 화면이 처음 뜰 때 적용할 기본 정렬을 지정한다. |
| filters | `get_filters( )->add_filter( )` | 화면이 처음 뜰 때 적용할 기본 필터를 지정한다. |
| aggregations | `get_aggregations( )->add_aggregation( )` | 숫자 컬럼의 합계/집계를 지정할 때 사용한다. |

가장 먼저 바로잡아야 할 코드는 factory 호출이다. `CL_SALV_TABLE=>FACTORY`는 SALV 객체를 반환값처럼 받는 constructor expression이 아니라 static method 호출이다. 따라서 `IMPORTING r_salv_table = ...`로 SALV 객체 reference를 받는다.

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

이 코드는 "공연 회차를 읽고, SALV를 만들고, 표준 기능을 켜고, 공연일 기준 오름차순으로 정렬하고, 취소 상태 `C`는 제외한 뒤 표시한다"는 흐름이다. 사용자가 화면에서 필터 버튼을 눌러서 할 수 있는 일을 개발자가 초기 상태로 지정해 주는 것이다.

### 어떻게 확인하는가

확인은 화면과 디버거를 함께 본다.

1. `cl_salv_table=>factory` 다음 줄에 중단점을 둔다. `lo_salv`가 initial reference가 아니라 SALV 객체 reference로 채워졌는지 확인한다.
2. `lo_salv->get_functions( )->set_all( abap_true )`를 실행한 뒤 화면에 툴바 표준 기능이 보이는지 확인한다.
3. `add_sort`의 컬럼명을 일부러 잘못 입력해 본다. 예를 들어 `PERFDATE`처럼 실제 컬럼과 다른 이름을 쓰면 SALV가 컬럼을 찾지 못한다. 이 실패가 "화면 컬럼명은 내부 테이블 필드명과 정확히 맞아야 한다"는 증거다.
4. 정상 컬럼명으로 되돌린 뒤 실행한다. 화면 첫 표시가 공연일 기준으로 정렬되어 있으면 성공이다.
5. `STATUS = 'C'`인 테스트 데이터를 넣어 둔 뒤 필터 적용 전후 건수를 비교한다.

### 실수와 주의

- `display( )` 후에 설정하면 늦다. SALV 화면을 띄우기 전에 functions, sorts, filters, columns, layout을 설정한다.
- `add_sort`와 `add_filter`의 컬럼명은 화면 제목이 아니라 내부 테이블 component 이름이다. 일반적으로 대문자 필드명으로 맞춘다.
- 필터는 데이터를 DB에서 덜 읽는 기능이 아니다. 이미 읽은 내부 테이블을 SALV 표시 단계에서 걸러 보여 주는 기능이다. 성능 때문에 데이터 자체를 줄여야 한다면 `SELECT ... WHERE`에서 먼저 제한해야 한다.
- 표준 기능을 모두 켜면 사용자는 많은 도구를 얻지만 화면 목적이 흐려질 수 있다. 업무 화면에서는 필요한 기능만 켜는 설계도 고려한다.

### 체험형 학습 설계

이 레슨의 체험 장치는 "SALV 초기 상태 조종 패널"로 설계한다.

| 요소 | 설계 |
|---|---|
| 데이터 | `lt_perf` 8행. `PERF_DATE`, `STATUS`, `CAPACITY`, `SEATSOCC`를 포함하고 날짜는 일부러 뒤섞는다. `STATUS`는 `A`(open), `C`(cancelled), `F`(full)를 섞는다. |
| 버튼 | `기본 표시`, `표준 기능 켜기`, `PERF_DATE 정렬`, `취소 제외 필터`, `필드명 오타 실행` |
| 상태 | `functionsOn`, `sortColumn`, `filterRule`, `visibleRows`, `errorMessage` |
| 피드백 | 정렬 버튼을 누르면 행 순서가 날짜순으로 바뀐다. 필터 버튼을 누르면 `STATUS = C` 행이 흐리게 사라지고 visible row count가 줄어든다. 오타 버튼을 누르면 "컬럼 PERFDATE를 찾을 수 없습니다. 내부 필드명 PERF_DATE를 사용해야 합니다."를 보여 준다. |
| 코드 연결 | 오른쪽 코드 패널에서 현재 버튼 조합에 해당하는 `get_functions`, `add_sort`, `add_filter` 줄만 강조한다. |

### 정리

SALV는 `display( )`만 호출하는 간단한 표 도구에서 끝나지 않는다. `display( )` 전에 SALV 객체의 하위 설정 객체를 꺼내면 초기 기능, 정렬, 필터, 집계를 코드로 정할 수 있다. 단, 이 설정은 표시 단계의 제어이므로 DB 조회 조건과 혼동하지 않는다.

## CH21-L02 · SALV Layout / Variant 심화

### 왜 필요한가

정렬과 필터를 지정해도 표가 읽기 어렵다면 사용자는 여전히 불편하다. 긴 숫자 컬럼이 잘리고, 컬럼 제목이 DDIC 기술명 그대로 나오고, 매번 사용자가 같은 컬럼 순서를 다시 저장해야 한다면 보고서는 실무 도구로 부족하다.

SALV layout과 variant는 이 불편을 줄인다. 개발자는 초기 제목, 줄무늬, 컬럼 폭, 컬럼 텍스트를 정하고, 사용자는 자기에게 맞는 표시 variant를 저장할 수 있다. 즉 개발자는 "처음 보기에 좋은 기본값"을 제공하고, 사용자는 "내 업무 방식에 맞춘 보기"를 저장한다.

### 무엇인가

SALV 표시 설정은 크게 세 층으로 나뉜다.

| 층 | 객체 | 역할 |
|---|---|---|
| 전체 표 | `get_display_settings( )` | list header, striped pattern 같은 표 전체의 표시 속성 |
| 컬럼 묶음 | `get_columns( )` | 전체 컬럼 폭 최적화, 특정 컬럼 객체 접근 |
| variant 저장 | `get_layout( )` | report별 layout key와 저장 허용 범위 |

대표 코드는 다음과 같다.

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

`set_key`의 핵심은 "이 variant가 어느 리포트의 layout인지" 식별하는 것이다. `sy-repid`를 key로 주면 현재 실행 프로그램 기준으로 저장 variant가 묶인다. 저장 제한은 시스템 릴리스와 정책에 따라 조정될 수 있지만, 학습 예제에서는 `restrict_none`처럼 저장을 허용하는 형태로 이해하면 된다.

### 어떻게 확인하는가

1. 줄무늬 설정을 켜고 끄며 화면 가독성을 비교한다.
2. `set_list_header` 값을 바꾸고 화면 상단 제목이 바뀌는지 확인한다.
3. `set_optimize( abap_true )`를 주석 처리한 뒤 긴 컬럼이 잘리는지 비교한다.
4. `get_column( 'CAPACITY' )`를 `get_column( 'CAP' )`로 바꿔 실패를 확인한다. 컬럼 객체 접근은 내부 필드명과 정확히 맞아야 한다.
5. variant 저장 버튼을 눌러 컬럼 순서나 숨김 상태를 저장하고, 프로그램을 다시 실행했을 때 해당 variant를 불러올 수 있는지 확인한다.

### 실수와 주의

- `set_long_text`만 바꿨는데 화면 제목이 그대로일 수 있다. SALV는 상황에 따라 short, medium, long text를 선택하므로 세 텍스트를 함께 맞추면 초보자 혼란이 줄어든다.
- variant key가 없으면 저장 대상이 모호하다. layout 저장을 다룰 때는 `set_key`를 먼저 생각한다.
- 사용자 variant는 "사용자별 보기"이지 "데이터 변경"이 아니다. 컬럼 숨김, 순서, 폭 같은 표시 설정만 저장된다.
- 보안상 숨기면 안 되는 데이터는 화면에서 `no_out` 또는 variant로 숨기는 것이 아니라 애초에 조회하지 않아야 한다. ALV 숨김은 편의 기능이지 권한 제어가 아니다.

### 체험형 학습 설계

이 레슨의 체험 장치는 "Variant 저장 실험실"로 설계한다.

| 요소 | 설계 |
|---|---|
| 데이터 | 회차 6행, 컬럼 `CONCERT_ID`, `PERF_DATE`, `CAPACITY`, `SEATSOCC`, `STATUS`, `CREATED_BY` |
| 버튼 | `줄무늬 토글`, `폭 최적화`, `정원 텍스트 적용`, `Variant 저장`, `Variant 초기화`, `컬럼명 오타` |
| 상태 | `striped`, `optimized`, `columnTexts`, `layoutKey`, `savedVariant`, `currentVariant`, `columnOrder` |
| 피드백 | 폭 최적화를 누르면 잘리던 `CONCERT_ID`가 보인다. Variant 저장 후 컬럼 순서를 바꾸고 초기화하면 저장 전/후 차이를 표 위에 "저장된 보기: 내 회차 점검용"으로 보여 준다. |
| 실패 피드백 | 컬럼명 오타 버튼은 `cx_salv_not_found` 상황을 시각화하고 "화면 제목이 아니라 내부 필드명 CAPACITY를 사용해야 합니다."를 표시한다. |

### 정리

SALV layout은 "예쁜 표"만 만드는 기능이 아니다. 개발자가 읽기 쉬운 초기 상태를 제공하고, 사용자가 자기 업무 방식에 맞춘 variant를 저장할 수 있게 하는 사용자 경험 기능이다. 표시 설정은 반드시 `display( )` 전에 준비하고, 컬럼 접근은 내부 필드명을 기준으로 한다.

## CH21-L03 · Grid ALV Column 제어 심화

### 왜 필요한가

SALV는 빠르고 편하지만, 세밀한 화면 제어에서는 Grid ALV가 더 직접적이다. CH17에서 field catalog를 만들고 Grid ALV를 띄웠다면, 이제 field catalog가 단순한 "컬럼 목록"이 아니라 각 컬럼의 표시 지시서라는 점을 분명히 이해해야 한다.

예를 들어 `MANDT`는 기술 필드라 사용자가 볼 필요가 없고, `SEATS`는 합계를 볼 가치가 있으며, `STATUS`는 짧은 코드라 가운데 정렬이 읽기 쉽다. 이 판단은 DB 테이블 구조가 아니라 화면 설계의 판단이다. Field catalog는 바로 그 판단을 ALV에게 전달한다.

### 무엇인가

`LVC_T_FCAT`은 Grid ALV field catalog의 internal table type이다. 각 행은 한 컬럼의 표시 규칙을 담는다.

| field catalog 속성 | 의미 | 예 |
|---|---|---|
| `fieldname` | 적용할 내부 테이블 필드명 | `STATUS` |
| `no_out` | 기본 화면에서 숨김 | `MANDT` 숨김 |
| `do_sum` | 숫자 컬럼 합계 | `SEATS` 합계 |
| `just` | 정렬 방향 | `L`, `C`, `R` |
| `key` | 키 컬럼처럼 고정/강조 | `PERF_NO` |
| `edit` | 입력 가능한 표시 | CH21에서는 맛보기, 실제 처리 CH28 |

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

여기서 중요한 점은 `lt_fcat`을 바꾼다고 DB 테이블 구조가 바뀌지 않는다는 것이다. Field catalog는 화면 표시 규칙이다. `MANDT`를 `no_out`으로 숨겨도 내부 테이블에는 값이 남아 있다. `SEATS`에 `do_sum`을 켜도 DB에 합계 행이 생기지 않는다.

### 어떻게 확인하는가

1. `lt_fcat`을 Grid ALV에 넘기기 전 디버거에서 `MANDT`, `SEATS`, `STATUS`, `PERF_NO` 행을 찾는다.
2. `MANDT-no_out = abap_true`를 확인하고 화면에서 `MANDT`가 기본 표시되지 않는지 본다.
3. `SEATS-do_sum = abap_true`를 확인하고 합계 표시 기능을 실행한다. 문자 컬럼에 `do_sum`을 줬을 때 의미가 없거나 오류가 나는지도 비교한다.
4. `STATUS-just = 'C'`를 `R`로 바꿔 정렬 방향이 화면에서 바뀌는지 확인한다.
5. `no_out`과 "field catalog에서 아예 삭제"를 비교한다. `no_out`은 사용자가 다시 표시할 수 있는 숨김이고, 삭제는 ALV가 그 컬럼을 모르는 상태다.

### 실수와 주의

- `fieldname`은 반드시 output table의 component 이름과 맞아야 한다. DDIC 설명 텍스트나 화면 제목을 쓰면 적용되지 않는다.
- `do_sum`은 숫자 성격의 컬럼에만 의미가 있다. 상태 코드, 이름, 날짜 같은 컬럼에 합계를 기대하지 않는다.
- `edit = abap_true`는 "입력 가능한 모양"의 시작일 뿐이다. 입력값 반영, 검증, 저장, 변경 이벤트 처리는 CH28의 editable grid 주제다.
- 숨김은 권한 제어가 아니다. 사용자가 variant나 layout에서 다시 보이게 할 수 있는 항목은 민감 정보로 취급하면 안 된다.

### 체험형 학습 설계

이 레슨의 체험 장치는 "Field Catalog 조립대"로 설계한다.

| 요소 | 설계 |
|---|---|
| 데이터 | 왼쪽에는 output table 미리보기, 오른쪽에는 field catalog 행 목록을 둔다. 컬럼은 `MANDT`, `CONCERT_ID`, `PERF_NO`, `SEATS`, `STATUS` |
| 버튼 | `MANDT 숨김`, `SEATS 합계`, `STATUS 가운데`, `PERF_NO 키 지정`, `문자 컬럼 합계 시도`, `fieldname 오타` |
| 상태 | `fieldCatalogRows`, `visibleColumns`, `sumColumns`, `alignmentMap`, `warningList` |
| 피드백 | 각 버튼을 누르면 field catalog 행의 속성이 먼저 바뀌고, 그 결과가 표 화면에 반영된다. 문자 컬럼 합계 시도는 "STATUS는 숫자 컬럼이 아니므로 합계 대상이 아닙니다."를 표시한다. |
| 학습 포인트 | 화면 변화보다 field catalog row 변화가 먼저 보이게 한다. 입문자가 "field catalog가 ALV에게 주는 지시서"라는 구조를 시각적으로 이해한다. |

### 정리

Grid ALV에서 컬럼 제어는 output table을 직접 바꾸는 일이 아니다. `LVC_T_FCAT`에 각 컬럼의 표시 지시를 적고, ALV가 그 지시를 보고 화면을 구성한다. 숨김, 합계, 정렬, 키 강조는 모두 field catalog의 역할이며, 편집 처리는 CH28까지 선을 지킨다.

## CH21-L04 · Deep Structure 기반 Cell Color

### 왜 필요한가

CH17에서 배운 행 색은 "이 줄 전체가 중요하다"는 신호를 줄 때 좋다. 하지만 실제 업무에서는 한 줄 전체가 아니라 한 칸만 강조해야 할 때가 많다. 콘서트 회차 행에서 공연명, 날짜, 정원은 정상인데 잔여석만 위험하다면 행 전체를 빨갛게 칠하는 것보다 잔여석 셀만 칠하는 편이 정확하다.

셀 단위 색은 입문자에게 처음에는 이상하게 보인다. 왜 색 정보를 별도 테이블에 담고, 그 테이블을 다시 행 안에 넣어야 할까? 이유는 한 행 안에서도 여러 셀에 각각 다른 색이 붙을 수 있기 때문이다. 한 행의 색 정보는 단일 값이 아니라 "어느 컬럼에 어떤 색을 줄지"의 목록이다.

### 무엇인가

Grid ALV의 cell color는 표시용 output table의 각 행에 `LVC_T_SCOL` 타입의 internal table component를 추가하는 방식으로 구성한다. internal table을 component로 가진 구조는 deep structure다.

중요한 경계부터 잡아야 한다. 이 구조는 DB 테이블 구조가 아니라 ALV 표시용 구조다. Deep component를 포함한 work area는 SQL에서 제한이 있으므로, DB 조회용 flat data와 ALV 표시용 deep data를 분리하는 습관이 안전하다.

```abap
TYPES: BEGIN OF ty_perf_alv,
         concert_id TYPE zperf-concert_id,
         perf_no    TYPE zperf-perf_no,
         perf_date  TYPE zperf-perf_date,
         seatsocc   TYPE i,
         capacity   TYPE i,
         cellcolors TYPE lvc_t_scol,
       END OF ty_perf_alv.

DATA lt_perf_alv TYPE STANDARD TABLE OF ty_perf_alv.
```

색을 채울 때는 각 행의 `cellcolors`에 "어느 필드명에 어떤 색을 줄지"를 append한다.

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

마지막 줄이 중요하다. `cellcolors` 컬럼을 행에 넣기만 하면 ALV가 자동으로 읽는 것이 아니다. `ls_layout-ctab_fname = 'CELLCOLORS'`로 "이 컬럼이 셀 색상 테이블입니다"라고 알려야 한다.

### 어떻게 확인하는가

1. 디버거에서 `lt_perf_alv`의 한 행을 펼친다. `cellcolors`가 빈 internal table인지 확인한다.
2. 매진 조건을 만족하는 행에서 `cellcolors` 안에 한 줄이 append되는지 확인한다.
3. 그 줄의 `fname`이 실제 화면 컬럼명 `SEATSOCC`와 같은지 확인한다.
4. `ls_layout-ctab_fname`을 일부러 주석 처리하고 실행한다. `cellcolors`에 값이 있어도 화면 색이 바뀌지 않는지 확인한다.
5. 다시 `ctab_fname`을 넣고 실행한다. 매진 행의 `SEATSOCC` 셀만 빨간색 계열로 보이면 성공이다.

### 실수와 주의

- DB 조회를 deep structure에 직접 하려 하지 않는다. 먼저 flat table로 읽고, 표시용 internal table로 옮긴 뒤 색상 deep component를 채운다.
- `fname`은 컬럼 제목이 아니라 output table component 이름이다. `잔여석` 같은 한글 제목을 쓰면 ALV가 어떤 셀인지 찾을 수 없다.
- `ctab_fname`을 지정하지 않으면 색상 테이블은 그냥 보이지 않는 데이터일 뿐이다.
- 자동 field catalog 생성 시 `CELLCOLORS` 같은 deep component가 화면 컬럼으로 노출되면 안 된다. field catalog에서 기술 컬럼으로 숨기거나 표시 대상에서 제외한다.
- 셀 색은 강력하지만 남용하면 화면이 읽기 어려워진다. 위험, 경고, 확정 같은 제한된 의미에만 사용한다.

### 체험형 학습 설계

이 레슨의 체험 장치는 "Cell Color 현미경"으로 설계한다.

| 요소 | 설계 |
|---|---|
| 데이터 | 회차 5행. `SEATSOCC`, `CAPACITY`를 두고 2행은 매진, 1행은 임박, 2행은 정상으로 구성한다. 각 행 아래에 접히는 `cellcolors` 내부 테이블 뷰를 둔다. |
| 버튼 | `색 계산`, `ctab_fname 연결`, `fname 오타`, `색 초기화`, `매진 조건 변경` |
| 상태 | `selectedRow`, `cellcolorsByRow`, `layoutCtabFname`, `paintedCells`, `fieldNameError` |
| 피드백 | `색 계산`만 누르면 내부 테이블에는 색 줄이 생기지만 화면은 아직 칠해지지 않는다. `ctab_fname 연결`을 눌러야 화면 셀이 칠해진다. |
| 오답 경험 | `fname 오타`를 누르면 `SEATS_OCC`로 색 줄이 들어가지만 화면은 그대로이고, "색 정보는 있으나 해당 컬럼이 없습니다."를 표시한다. |
| 시각 설명 | 한 행을 펼치면 `cellcolors[1]-fname = 'SEATSOCC'`, `color-col = COL_NEGATIVE`가 표 셀과 선으로 연결된다. |

### 정리

셀 색상은 "한 행 안에 색상 지시 목록을 품는" deep structure 방식이다. `LVC_T_SCOL`은 색상 목록이고, `ctab_fname`은 그 목록이 들어 있는 component 이름을 ALV layout에 알려 주는 연결선이다. DB 구조와 표시용 구조를 분리하고, `fname`과 실제 컬럼명을 정확히 맞추는 것이 핵심이다.

## CH21-L05 · Deep Structure 기반 Cell Style

### 왜 필요한가

색은 "주의해서 보라"는 신호다. 그러나 어떤 셀은 색만으로 부족하다. 매진 회차의 좌석 수는 더 이상 바꿀 수 없게 비활성처럼 보여야 할 수 있고, 특정 셀은 버튼처럼 보여 사용자가 눌러야 할 수도 있다. 즉 셀에는 색뿐 아니라 모양과 동작 힌트가 필요하다.

Cell style은 이 요구를 처리한다. 색상과 비슷하게 행 안에 스타일 목록을 넣고, layout에 그 목록의 이름을 알려 준다. 다만 CH21에서는 표시와 모양의 원리까지만 다룬다. 사용자가 실제로 값을 바꾸고, 변경 이벤트를 받고, 저장하는 처리는 CH28에서 배운다.

### 무엇인가

Cell style은 `LVC_T_STYL` internal table component로 표현한다.

```abap
TYPES: BEGIN OF ty_perf_alv,
         concert_id TYPE zperf-concert_id,
         perf_no    TYPE zperf-perf_no,
         seatsocc   TYPE i,
         capacity   TYPE i,
         cellcolors TYPE lvc_t_scol,
         cellstyles TYPE lvc_t_styl,
       END OF ty_perf_alv.

DATA lt_perf_alv TYPE STANDARD TABLE OF ty_perf_alv.
```

스타일도 행마다 채운다.

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

자주 보는 style constant는 다음처럼 읽으면 된다.

| constant | 의미 | CH21에서의 해석 |
|---|---|---|
| `cl_gui_alv_grid=>mc_style_disabled` | 셀 비활성 표시 | 매진 회차의 좌석 입력 칸을 더 이상 건드리지 못하게 보이기 |
| `cl_gui_alv_grid=>mc_style_enabled` | 셀 활성 표시 | 조건부로 입력 가능하게 보이기. 실제 입력 처리는 CH28 |
| `cl_gui_alv_grid=>mc_style_button` | 버튼처럼 표시 | 클릭 이벤트 처리는 CH27/CH28과 연결 |

### 어떻게 확인하는가

1. `cellstyles`가 없는 상태로 Grid ALV를 띄워 기본 셀 모양을 본다.
2. 매진 행에서 `cellstyles`에 `fieldname = 'SEATSOCC'`, `style = mc_style_disabled`가 들어가는지 디버거로 확인한다.
3. `ls_layout-stylefname = 'CELLSTYLES'`를 넣고 실행해 해당 셀의 표시가 바뀌는지 확인한다.
4. `stylefname`을 주석 처리하고 실행한다. 스타일 테이블이 있어도 화면에 반영되지 않는지 확인한다.
5. `mc_style_button`을 적용해 셀이 버튼처럼 보이는지 확인하되, 버튼 클릭 처리 코드는 작성하지 않는다. 클릭 이벤트는 CH27 경계로 둔다.

### 실수와 주의

- 색은 `ctab_fname`, 스타일은 `stylefname`이다. 두 layout 속성을 혼동하면 값은 채웠는데 화면이 바뀌지 않는다.
- `LVC_T_SCOL`의 컬럼명 필드는 `fname`, `LVC_T_STYL`의 컬럼명 필드는 `fieldname`이다. 이름이 비슷하지만 구조가 다르다.
- 스타일을 켰다고 업무 검증이 끝난 것이 아니다. 비활성처럼 보여도 저장 전에 반드시 서버 로직에서 검증해야 한다.
- 편집 가능 표시를 실습에서 보여 줄 수는 있지만, 입력값 변경 이벤트와 저장은 CH28이다. CH21에서 억지로 완성하지 않는다.

### 체험형 학습 설계

이 레슨의 체험 장치는 "Cell Style 스위치보드"로 설계한다.

| 요소 | 설계 |
|---|---|
| 데이터 | 회차 4행. 정상, 매진, 관리자만 수정 가능, 상세 버튼 필요 상태를 섞는다. 각 행에 `cellstyles` 내부 테이블을 접이식으로 표시한다. |
| 버튼 | `매진 셀 비활성`, `관리자 셀 활성`, `상세 버튼 스타일`, `stylefname 연결 끊기`, `색/스타일 비교` |
| 상태 | `styleRows`, `layoutStylefname`, `styledCells`, `activeMode`, `deferredEventNotice` |
| 피드백 | 버튼 스타일을 적용하면 셀은 버튼처럼 보이지만 클릭하면 "클릭 이벤트 처리는 CH27에서 구현합니다."라는 경계 메시지를 띄운다. |
| 비교 화면 | 같은 셀에 색만 적용한 상태와 disabled style을 적용한 상태를 나란히 보여 준다. 색은 의미 강조, style은 조작 가능성 힌트라는 차이를 설명한다. |

### 정리

Cell style은 셀의 모양과 조작 가능성 힌트를 제어한다. 구조는 cell color와 비슷하지만 `LVC_T_STYL`과 `stylefname`을 사용한다. CH21에서는 표시 원리를 이해하고, 실제 편집 처리와 클릭 이벤트는 후속 장으로 넘긴다.

## CH21-L06 · Row / Column / Cell Color 선택 기준

### 왜 필요한가

색을 배운 뒤 초보자가 자주 하는 실수는 모든 것을 색으로 해결하려는 것이다. 매진은 행 빨강, 잔여 적음은 셀 노랑, 중요 컬럼은 컬럼 파랑, 키는 또 다른 색으로 칠하면 화면은 화려해지지만 정보는 흐려진다.

좋은 ALV 화면은 색을 많이 쓰는 화면이 아니라 색의 단위가 정확한 화면이다. "이 행 전체의 상태인가?", "이 컬럼은 항상 중요한가?", "이 셀만 조건부로 문제인가?"를 먼저 묻고 방법을 고른다.

### 무엇인가

Grid ALV 색 제어는 크게 세 단위로 나눈다.

| 단위 | 대표 방법 | 적합한 상황 | 콘서트 앱 예 |
|---|---|---|---|
| 행 색 | layout `info_fname` | 한 행 전체의 상태가 중요할 때 | 취소된 회차 전체를 회색 계열로 표시 |
| 컬럼 색 | field catalog `emphasize` | 특정 컬럼 자체가 항상 중요할 때 | `SEATS_LEFT` 컬럼을 항상 강조 |
| 셀 색 | layout `ctab_fname` + `LVC_T_SCOL` | 행마다 특정 셀만 조건부 강조할 때 | 잔여석 0인 `SEATS_LEFT` 셀만 빨강 |

선택 기준은 다음처럼 잡는다.

```text
행 전체가 같은 의미인가?
  예  -> info_fname
  아니오 -> 특정 컬럼이 항상 중요한가?
             예  -> fieldcat-emphasize
             아니오 -> 행마다 달라지는 한 칸 조건인가?
                        예  -> ctab_fname + LVC_T_SCOL
```

예시를 코드 관점으로 축약하면 다음과 같다.

```abap
" 행 색: output table에 행 색 코드용 component를 두고 layout에 이름을 알려 준다.
ls_layout-info_fname = 'LINE_COLOR'.

" 컬럼 색: field catalog의 특정 컬럼 행에 강조 코드를 둔다.
<fc>-fieldname = 'SEATS_LEFT'.
<fc>-emphasize = 'C500'.

" 셀 색: 행 안의 LVC_T_SCOL component와 ctab_fname을 연결한다.
ls_layout-ctab_fname = 'CELLCOLORS'.
```

### 어떻게 확인하는가

1. 같은 회차 데이터를 세 화면으로 나눠 본다. 첫 화면은 행 색, 둘째는 컬럼 색, 셋째는 셀 색만 적용한다.
2. "매진 회차를 찾기" 과제를 준다. 행 색은 전체 상태 파악이 빠르지만 어느 수치가 문제인지는 덜 구체적이다.
3. "잔여석이 위험한 칸 찾기" 과제를 준다. 셀 색이 가장 정확하다.
4. 행 색과 셀 색을 동시에 같은 의미로 적용해 본다. 강조가 중복되어 화면이 무거워지는지 확인한다.
5. 색을 모두 제거하고 숫자만 보여 준다. 색이 없으면 사용자가 어떤 행부터 봐야 하는지 느리게 판단한다는 점을 비교한다.

### 실수와 주의

- 색은 의미가 있어야 한다. 빨강은 오류/위험, 노랑은 경고, 초록은 정상처럼 일관된 규칙을 유지한다.
- 같은 의미를 행 색과 셀 색으로 중복 강조하지 않는다. 정말 전체 행이 문제인지, 특정 셀만 문제인지 결정한다.
- `emphasize`와 row color는 classic ALV 색 코드 문자열을 쓰는 경우가 많다. 시스템 테마에 따라 보이는 색감은 달라질 수 있으므로 의미를 텍스트나 아이콘과 함께 보완하는 것이 좋다.
- 접근성을 생각하면 색만으로 상태를 전달하지 않는다. `STATUS_TEXT`, 아이콘, tooltip 같은 보조 정보가 필요할 수 있다.

### 체험형 학습 설계

이 레슨의 체험 장치는 "색 단위 선택 퀴즈"로 설계한다.

| 요소 | 설계 |
|---|---|
| 상황 카드 | `회차 전체 취소`, `잔여석 3석`, `예매자 이름 컬럼 중요`, `정원 초과 오류`, `VIP 전용 회차` |
| 선택 버튼 | `행 색`, `컬럼 색`, `셀 색`, `색 쓰지 않기` |
| 상태 | `scenario`, `selectedColorUnit`, `recommendedUnit`, `reason`, `previewTable` |
| 피드백 | 사용자가 `잔여석 3석`에 행 색을 고르면 "행 전체가 나쁜 것이 아니라 잔여석 셀만 주의 대상입니다. 셀 색이 더 정확합니다."를 보여 준다. |
| 결과 화면 | 선택한 단위에 따라 같은 데이터가 어떻게 다르게 보이는지 즉시 preview한다. |

### 정리

행 색, 컬럼 색, 셀 색은 우열 관계가 아니라 목적이 다르다. 행 전체 상태는 `info_fname`, 늘 중요한 컬럼은 `emphasize`, 조건부 한 칸은 `ctab_fname`을 고른다. CH21의 좋은 화면 설계는 색을 많이 쓰는 것이 아니라 색의 단위를 정확히 고르는 것이다.

## CH21-L07 · Stable Refresh와 표시 상태 보존

### 왜 필요한가

업무 화면은 한 번 띄우고 끝나지 않는다. 예매가 추가되면 잔여석이 바뀌고, 취소가 들어오면 상태가 바뀐다. 이때 Grid ALV를 매번 처음부터 다시 만들면 사용자가 보던 위치, 가로 스크롤, 정렬 상태가 흔들린다. 특히 많은 회차 목록에서 80번째 줄을 보던 사용자가 갱신 후 다시 첫 줄로 튕기면 화면은 불편한 도구가 된다.

Stable refresh는 이 문제를 줄인다. 데이터는 새로 보여 주되, 사용자가 보고 있던 행/열 위치를 가능한 유지한다. Soft refresh는 구조를 다시 짜지 않고 표시 데이터 중심으로 가볍게 갱신할 때 사용한다.

### 무엇인가

Grid ALV 갱신의 기본 형태는 `refresh_table_display`다.

```abap
DATA ls_stable TYPE lvc_s_stbl.
ls_stable-row = abap_true.
ls_stable-col = abap_true.

go_grid->refresh_table_display(
  EXPORTING
    is_stable      = ls_stable
    i_soft_refresh = abap_true ).
```

각 옵션의 의미는 다음처럼 이해한다.

| 항목 | 의미 | 초보자식 해석 |
|---|---|---|
| `is_stable-row` | 행 위치 안정화 | 세로 스크롤이 불필요하게 튀지 않게 한다. |
| `is_stable-col` | 열 위치 안정화 | 가로 스크롤/컬럼 위치가 불필요하게 튀지 않게 한다. |
| `i_soft_refresh` | 표시 데이터 중심의 가벼운 갱신 | field catalog나 layout 구조를 다시 짜는 갱신이 아니라 현재 표시 상태를 최대한 유지한다. |

갱신 전에는 ALV가 참조하는 output table의 값이 먼저 바뀌어 있어야 한다. `refresh_table_display`는 DB를 다시 읽는 메서드가 아니다. "내부 테이블이 바뀌었으니 화면을 다시 그려라"에 가깝다.

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

1. 회차 100행을 준비하고 70번째 행 근처까지 스크롤한다.
2. stable 옵션 없이 refresh를 실행한다. 화면 위치가 튀는지 본다.
3. `is_stable-row`, `is_stable-col`을 켜고 같은 갱신을 실행한다. 위치가 유지되는지 비교한다.
4. field catalog를 바꾸는 변경과 단순 데이터 값 변경을 비교한다. 구조가 바뀌는 경우에는 soft refresh만으로 충분하지 않을 수 있다.
5. 선택 행 보존이 중요한 화면이라면 refresh 전 선택 행 key를 저장하고 refresh 후 다시 선택하는 별도 처리가 필요한지 확인한다.

### 실수와 주의

- `refresh_table_display`는 내부 테이블을 자동으로 새로 조회하지 않는다. 먼저 데이터를 갱신하고 refresh한다.
- Grid 객체를 매번 새로 만들면 stable refresh의 의미가 사라진다. 같은 `go_grid`와 같은 output table 흐름을 유지한다.
- `i_soft_refresh = abap_true`는 구조 변경까지 해결하는 만능 옵션이 아니다. 컬럼 구성, field catalog, layout 자체가 바뀌면 초기 표시를 다시 구성해야 할 수 있다.
- 정렬/필터가 걸린 상태에서 데이터가 바뀌면 사용자가 기대하는 재정렬 방식과 soft refresh 결과가 다를 수 있다. 업무 화면에서는 "값만 바뀌는 갱신"인지 "정렬/필터 재평가가 필요한 갱신"인지 구분한다.

### 체험형 학습 설계

이 레슨의 체험 장치는 "Refresh 흔들림 비교기"로 설계한다.

| 요소 | 설계 |
|---|---|
| 데이터 | 100행 회차 목록. 사용자는 70번째 행까지 스크롤한 상태에서 예매 수량 변경을 실행한다. |
| 버튼 | `Hard Refresh`, `Stable Refresh`, `Soft + Stable Refresh`, `데이터만 변경`, `컬럼 구조 변경` |
| 상태 | `scrollRow`, `scrollColumn`, `selectedKey`, `refreshMode`, `tableChanged`, `layoutChanged` |
| 피드백 | Hard refresh는 화면이 첫 줄로 이동하는 애니메이션을 보여 준다. Stable refresh는 현재 줄 주변을 유지한다. 구조 변경 후 soft refresh를 누르면 "컬럼 구조 변경은 재초기화가 필요할 수 있습니다."를 표시한다. |
| 코드 연결 | `is_stable`의 row/col 체크박스를 켜고 끌 때 코드의 `VALUE lvc_s_stbl( row = ... col = ... )`가 함께 바뀐다. |

### 정리

Refresh는 단순히 화면을 다시 그리는 기술이 아니라 사용자 흐름을 지키는 기술이다. 데이터 갱신 후 같은 Grid에 `refresh_table_display`를 호출하고, `is_stable`과 `i_soft_refresh`를 상황에 맞게 사용한다. 구조 변경과 값 변경을 구분하는 판단이 중요하다.

## CH21-L08 · 실습: 매진 회차 색 강조

### 왜 필요한가

지금까지 배운 내용을 콘서트 앱에 적용한다. 사용자는 회차 목록에서 남은 좌석을 빠르게 판단해야 한다. 숫자를 일일이 읽는 화면은 느리고, 색으로 상태를 드러내는 화면은 빠르다. 하지만 색은 업무 계산과 연결되어야 한다. "잔여석 0이면 빨강", "잔여석 5 이하이면 노랑"처럼 코드의 조건이 화면의 색으로 이어져야 한다.

이 실습은 CH20의 `ZCL_BOOKING_MANAGER`를 사용해 잔여석을 계산하고, CH21-L04의 cell color를 사용해 `SEATS_LEFT` 셀을 강조한다.

### 무엇인가

표시용 row type을 먼저 만든다. `cellcolors`는 DB에 저장되는 필드가 아니라 ALV 표시를 위한 deep component다.

```abap
TYPES: BEGIN OF ty_row,
         concert_id  TYPE zconcert-concert_id,
         perf_no     TYPE zperf-perf_no,
         perf_date   TYPE zperf-perf_date,
         capacity    TYPE i,
         seats_left  TYPE i,
         cellcolors  TYPE lvc_t_scol,
       END OF ty_row.

DATA lt_row TYPE STANDARD TABLE OF ty_row.
```

잔여석을 계산하고 색을 채운다.

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

Grid ALV에 표시할 때 layout과 field catalog를 함께 넘긴다.

```abap
go_grid->set_table_for_first_display(
  EXPORTING
    is_layout       = ls_layout
  CHANGING
    it_outtab       = lt_row
    it_fieldcatalog = lt_fcat ).
```

field catalog를 자동 생성했다면 `CELLCOLORS`는 화면에 보일 컬럼이 아니다. 기술용 component로 숨긴다.

```abap
LOOP AT lt_fcat ASSIGNING FIELD-SYMBOL(<fc>).
  IF <fc>-fieldname = 'CELLCOLORS'.
    <fc>-tech = abap_true.
  ENDIF.
ENDLOOP.
```

### 어떻게 확인하는가

1. 테스트 데이터에 잔여석이 `0`, `3`, `12`인 회차를 최소 1개씩 둔다.
2. `zcl_booking_manager->remaining( )` 결과가 `seats_left`에 들어가는지 디버거로 확인한다.
3. `seats_left = 0`인 행에는 `COL_NEGATIVE`, `seats_left <= 5`인 행에는 `COL_TOTAL`이 `cellcolors`에 들어가는지 확인한다.
4. `ctab_fname`을 제거하고 실행해 색이 사라지는지 본다. 다시 넣으면 색이 돌아와야 한다.
5. `fname = 'LEFT'`처럼 실제 필드명과 다르게 바꿔 본다. `SEATS_LEFT` 셀 색이 적용되지 않는지 확인한다.
6. 예매 1건을 추가해 `seats_left`가 6에서 5로 바뀌는 테스트를 만들고, refresh 후 셀이 노란색으로 바뀌는지 확인한다.

### 실수와 주의

- `seats_left` 같은 표시용 필드명과 `fname` 값을 정확히 맞춘다. 원본 예제처럼 `LEFT`라는 짧은 이름을 쓰는 경우에도 output table component 이름과 대문자 field catalog 이름이 일치해야 한다.
- `ZCL_BOOKING_MANAGER`를 루프 안에서 매번 새로 만드는 코드는 학습용으로 이해하기 쉽다. 대량 데이터에서는 CH32 성능 장에서 다룰 batch 조회나 집계 방식으로 바꿔야 한다.
- 색은 표시 결과다. 매진 여부의 진짜 업무 검증은 `ZCL_BOOKING_MANAGER` 같은 서버 로직에서 해야 한다.
- 더블클릭으로 예매 목록을 띄우는 과제는 아이디어만 둔다. `double_click`, `hotspot_click`, `user_command` 처리는 CH27에서 정식 구현한다.

### 체험형 학습 설계

이 레슨의 체험 장치는 "Concert ALV Color Lab"으로 설계한다.

| 요소 | 설계 |
|---|---|
| 데이터 | 회차 6행. `capacity`, `booked`, `seats_left`를 보여 주고, `seats_left`는 `ZCL_BOOKING_MANAGER` 카드에서 계산된 값으로 연결한다. |
| 버튼 | `잔여석 계산`, `색 규칙 적용`, `예매 1건 추가`, `예매 5건 추가`, `ctab_fname 끄기`, `fname 오타`, `Stable Refresh` |
| 상태 | `rows`, `managerCalls`, `cellcolors`, `layoutCtabFname`, `refreshMode`, `selectedPerfNo`, `feedbackMessage` |
| 피드백 | 예매 추가 후 잔여석이 5가 되면 해당 셀이 노란색으로 바뀐다. 0이 되면 빨간색으로 바뀐다. `ctab_fname`을 끄면 내부 색 데이터는 남아 있지만 화면 색은 사라진다. |
| 더블클릭 맛보기 | 행을 더블클릭하면 실제 목록을 열지 않고 "CH27에서 double_click 이벤트로 예매 목록을 연결합니다."라는 preview 메시지만 보여 준다. |
| 코드 연결 | 왼쪽에는 ALV 표, 오른쪽에는 `cellcolors` 내부 테이블, 아래에는 `ctab_fname` layout 연결선을 보여 준다. |

### 정리

CH21 실습의 완성 기준은 "색이 예쁘게 보인다"가 아니다. 업무 계산(`remaining`)이 표시용 필드(`seats_left`)에 들어가고, 표시용 deep component(`cellcolors`)가 조건에 따라 채워지고, layout(`ctab_fname`)이 그 component를 ALV에 연결해야 한다. 이 세 단계가 이어질 때 콘서트 회차 상태가 사용자에게 즉시 보이는 화면이 된다.

## CH21 마무리 정리

CH21은 ALV를 단순 출력에서 업무 화면으로 끌어올리는 장이다.

- SALV는 `display( )` 전에 functions, sort, filter, display settings, columns, layout을 설정한다.
- Grid ALV의 field catalog는 output table을 화면에 어떻게 보여 줄지 정하는 지시서다.
- 행 색, 컬럼 색, 셀 색은 강조 단위가 다르며, 셀 색은 `LVC_T_SCOL` deep component와 `ctab_fname` 연결이 필요하다.
- Cell style은 `LVC_T_STYL` deep component와 `stylefname`으로 셀의 모양과 조작 가능성 힌트를 제어한다.
- Stable refresh는 사용자가 보던 위치를 가능한 지키며 데이터를 갱신하는 사용자 경험 기술이다.
- 더블클릭, hotspot, toolbar command, editable grid의 입력 검증과 저장은 CH27/CH28에서 정식으로 다룬다.

다음 CH22에서는 같은 콘서트 데이터를 CDS View Entity로 모델링한다. CH21이 "ABAP 내부 테이블을 ALV로 잘 보여 주는 기술"이었다면, CH22는 "데이터 모델 자체를 재사용 가능한 뷰로 정의하는 기술"로 넘어간다.
