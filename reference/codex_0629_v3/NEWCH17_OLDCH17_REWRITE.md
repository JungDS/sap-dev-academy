# CH17_REWRITE - Grid ALV 기초

> 기준 소스: `content/abap/CH17`
> 보조 참고: `reference/codex_0625_v2/CH17_REWRITE.md`, `reference/codex_0625_v2/CH17_QA.md`, `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`
> 작성 목표: IT 비전공자도 "화면 안에 표를 넣으려면 어떤 조각이 어떤 순서로 필요하고, 무엇을 확인해야 하는지" 조립 순서로 이해하게 만든다.

## CH17 전체 강의 설계

CH11의 SALV는 내부 테이블을 빠르게 표로 보여 주는 좋은 도구였다. 하지만 SALV만으로는 CH16에서 만든 화면 안의 특정 영역에 표를 넣고, 옆에 입력 field와 버튼을 함께 배치하고, 이후 색상과 이벤트와 편집까지 확장하는 흐름을 만들기 어렵다. CH17은 이 문제를 해결하기 위해 Grid ALV를 배운다.

입문자에게 CH17의 난점은 문법 하나가 아니라 조각이 많다는 점이다.

```text
Screen Painter의 Custom Control CONT100
  -> CL_GUI_CUSTOM_CONTAINER 객체
      -> CL_GUI_ALV_GRID 객체
          -> 출력 internal table
          -> Field Catalog
          -> Layout
          -> Variant
          -> set_table_for_first_display
          -> refresh_table_display
          -> row color
```

이 흐름을 "방, 책상, 표 자료, 컬럼 설명서, 보기 설정"으로 비유하면 쉽다.

- `CONT100`: Screen Painter에 미리 만든 빈 자리.
- `go_cont`: 그 빈 자리를 ABAP 코드가 붙잡는 container 객체.
- `go_grid`: container 안에 들어가는 실제 표 control.
- `gt_booking`: 보여 줄 데이터.
- `gt_fcat`: 컬럼 이름, 제목, 너비, 속성을 설명하는 표.
- `gs_layout`: 줄무늬, 제목, 선택 방식 같은 표 전체 설정.
- `gs_variant`: 사용자가 저장하고 다시 불러올 수 있는 보기 설정.

학습 경계:

- CH17은 classic Grid ALV 기본 조립까지다.
- `REF TO`, `CREATE OBJECT`, `->` 메서드 호출은 CH20 전 선행 사용이다. OO 이론은 여기서 확장하지 않는다.
- `NEW`, inline declaration, constructor expression은 쓰지 않는다.
- 셀 단위 색상, 셀 스타일, 툴바 확장, 클릭 반응, 편집 가능한 Grid, 값 변경 반응은 CH21, CH27, CH28에서 다룬다.
- CH17은 행 전체 색상까지만 다룬다.
- 실제 데이터 변경과 lock은 CH24, CH25 범위다.

## CH17-L01 - CL_GUI_CUSTOM_CONTAINER 생성

### 왜 필요한가

CH16에서 화면 0100에 Custom Control 영역 `CONT100`을 만들었다. 하지만 Screen Painter에 사각형을 그려 놓았다고 해서 그 안에 표가 자동으로 들어가지는 않는다. 화면의 빈 자리와 ABAP code를 연결하는 객체가 필요하다. 그 역할이 `CL_GUI_CUSTOM_CONTAINER`다.

이 레슨의 목적은 "표가 살 자리"를 코드로 붙잡는 것이다.

### 무엇인가

`CL_GUI_CUSTOM_CONTAINER`는 Dynpro 화면의 Custom Control 영역과 SAP Control Framework 객체를 연결하는 container control이다. Screen Painter에서 만든 이름을 `container_name`에 넘긴다.

```abap
DATA go_cont TYPE REF TO cl_gui_custom_container.

MODULE create_container_0100 OUTPUT.
  IF go_cont IS INITIAL.
    CREATE OBJECT go_cont
      EXPORTING
        container_name = 'CONT100'.
  ENDIF.
ENDMODULE.
```

여기서 `CONT100`은 ABAP 변수명이 아니다. Screen Painter layout에 있는 Custom Control 요소의 이름이다. 이 이름이 틀리면 container가 붙을 화면 영역을 찾지 못한다.

### 어떻게 확인하는가

1. Screen Painter에서 화면 0100의 Custom Control 이름이 `CONT100`인지 확인한다.
2. PBO module `create_container_0100`에 breakpoint를 둔다.
3. 처음 화면이 열릴 때 `go_cont IS INITIAL` 조건을 통과하는지 본다.
4. `CREATE OBJECT` 뒤 `go_cont`가 initial이 아닌지 확인한다.
5. 같은 화면이 다시 PBO를 탈 때 container가 중복 생성되지 않는지 본다.

### 체험 설계

학습 장치는 "Custom Control 연결 점검판"으로 설계한다.

- 화면 왼쪽: Screen Painter의 `CONT100` 사각 영역.
- 화면 오른쪽: ABAP 변수 `go_cont` 상태.
- 버튼: `화면 영역 확인`, `PBO 실행`, `Container 생성`, `이름 틀리게 실행`.
- 상태: `CONT100` 존재 여부, `container_name` 값, `go_cont` initial 여부.
- 피드백: `container_name = 'CONT001'`처럼 틀리면 "화면에 해당 이름의 Custom Control이 없음"을 보여 준다.

### 실수와 주의

- PBO마다 container를 새로 만들면 control lifecycle 문제가 생긴다. 처음 한 번만 만든다.
- Screen Painter 이름과 `container_name`은 정확히 맞아야 한다.
- Container는 표 자체가 아니다. 표가 들어갈 자리와 ABAP 객체를 연결하는 단계다.
- 이 코드는 OO 문법을 포함하지만 CH17에서는 조립 흐름만 따라간다.

### 정리

Grid ALV의 첫 조각은 화면의 빈 자리와 ABAP program을 연결하는 container다. `CONT100`이라는 화면 이름과 `go_cont`라는 ABAP 객체가 연결되어야 다음 단계에서 Grid를 얹을 수 있다.

## CH17-L02 - CL_GUI_ALV_GRID 생성

### 왜 필요한가

Container는 자리만 준비한다. 실제 표를 그리고, 컬럼을 표시하고, 정렬과 필터와 layout 기능을 제공하는 주체는 `CL_GUI_ALV_GRID`다. CH17-L02는 빈 container 위에 Grid control 객체를 올리는 단계다.

### 무엇인가

`CL_GUI_ALV_GRID`는 SAP GUI 화면 안에서 동작하는 ALV Grid control class다. 생성할 때 `i_parent`에 부모 container를 넘긴다.

```abap
DATA go_grid TYPE REF TO cl_gui_alv_grid.

MODULE create_grid_0100 OUTPUT.
  IF go_grid IS INITIAL.
    CREATE OBJECT go_grid
      EXPORTING
        i_parent = go_cont.
  ENDIF.
ENDMODULE.
```

`i_parent = go_cont`는 "이 grid를 앞에서 만든 container 안에 넣는다"는 뜻이다.

SALV와 Grid ALV의 차이:

| 구분 | SALV | Grid ALV |
| --- | --- | --- |
| 주 용도 | 빠른 표 표시 | 화면 안 control 조립 |
| 코드량 | 적음 | 많음 |
| 화면 위치 | 독립 표시 성격 | Dynpro Custom Control 안 |
| 세밀 제어 | 제한적 | field catalog, layout, refresh, 색상, 후속 event |
| 학습 경계 | CH11 | CH17, CH21, CH27, CH28 |

### 어떻게 확인하는가

1. `go_cont`가 먼저 만들어졌는지 확인한다.
2. `CREATE OBJECT go_grid` 뒤 `go_grid`가 initial이 아닌지 본다.
3. `i_parent`에 비어 있는 container를 넘기지 않았는지 확인한다.
4. 아직 표가 보이지 않더라도 당황하지 않는다. 데이터와 field catalog와 display 호출이 아직 없으면 정상이다.

### 체험 설계

학습 장치는 "Grid 조립 상태판"으로 설계한다.

- 단계 카드: `Custom Control`, `Container`, `Grid`, `Data`, `Field Catalog`, `Display`.
- 버튼: `Container 생성`, `Grid 생성`, `부모 없이 생성`.
- 상태: `go_cont`, `go_grid`, `i_parent`.
- 피드백: 부모 container 없이 grid를 만들려고 하면 "Grid가 들어갈 부모 영역이 없음"을 보여 준다.

### 실수와 주의

- Grid 객체만 만들면 표가 보이는 것이 아니다.
- `go_cont`가 initial인 상태에서 `i_parent = go_cont`를 넘기면 조립 순서가 틀린 것이다.
- Container와 Grid 모두 PBO마다 중복 생성하지 않는다.

### 정리

CH17-L02는 실제 표 control인 `CL_GUI_ALV_GRID`를 만든다. 하지만 이 단계는 아직 표 표시가 아니라 control 객체 생성이다. 표시에는 데이터와 field catalog와 display 호출이 더 필요하다.

## CH17-L03 - 출력용 Internal Table 준비

### 왜 필요한가

Grid ALV는 내부 테이블의 행을 화면의 행으로 그린다. 따라서 "무엇을 보여 줄 것인가"가 먼저 준비되어야 한다. 예매 목록 화면이라면 예매 데이터가 들어 있는 internal table이 필요하다.

### 무엇인가

출력용 internal table은 Grid에 넘길 데이터 원본이다.

```abap
DATA gt_booking TYPE TABLE OF zbooking.

FORM select_booking.
  SELECT *
    FROM zbooking
    INTO TABLE gt_booking
    WHERE concert_id = p_conc.
ENDFORM.
```

DDIC 구조를 가진 table type을 쓰면 field catalog 생성과 컬럼 text 결정에 유리하다. `ZBOOKING`의 field가 Data Element와 연결되어 있으면 컬럼 제목이나 타입 정보를 활용하기 쉽다.

데이터가 0건인 것은 반드시 오류가 아니다. 사용자가 선택한 공연에 예매가 없을 수도 있다. 따라서 "조회 실패"와 "정상적으로 조회했지만 결과가 없음"을 구분해서 설명해야 한다.

### 어떻게 확인하는가

1. `SELECT` 뒤 `sy-subrc`와 `gt_booking` row count를 확인한다.
2. `gt_booking`의 row type이 ALV에 표시할 구조를 갖는지 본다.
3. field catalog의 `fieldname`과 internal table component 이름이 맞는지 확인한다.
4. 결과가 0건일 때 덤프나 문법 오류로 설명하지 않고 빈 결과로 다룬다.

### 체험 설계

학습 장치는 "데이터 원본과 화면 행 비교판"으로 설계한다.

- 왼쪽: `gt_booking` internal table.
- 오른쪽: 아직 비어 있는 Grid preview.
- 버튼: `C001 조회`, `예매 없는 공연 조회`, `타입 없는 구조로 조회`.
- 상태: row count, field list, DDIC structure name.
- 피드백: 데이터 0건이면 "빈 그리드가 정상 업무 결과일 수 있음"을 표시한다.

### 실수와 주의

- internal table이 비어 있으면 Grid도 비어 보인다.
- field catalog가 참조하는 field name과 internal table component가 맞아야 한다.
- `SELECT *`는 교육용 예제다. 실무에서는 필요한 field 중심으로 줄이는 습관을 후속 장에서 강화한다.
- 데이터 변경은 CH17 범위가 아니다.

### 정리

Grid ALV는 internal table을 화면의 표로 그린다. 먼저 보여 줄 데이터의 구조와 row count를 확인해야 한다.

## CH17-L04 - Field Catalog 기초

### 왜 필요한가

Internal table만 있으면 Grid가 어느 정도 컬럼을 추론할 수 있지만, 실무 화면에서는 컬럼 제목, 너비, 숨김 여부, 합계 가능 여부, key 여부를 직접 조정해야 한다. Field Catalog는 Grid에게 "각 컬럼을 어떻게 보여 줄지" 알려 주는 설명서다.

### 무엇인가

Grid ALV의 field catalog는 보통 `LVC_T_FCAT` internal table로 다룬다. 각 행은 `LVC_S_FCAT` 구조를 가지며, 하나의 컬럼 설정을 의미한다.

DDIC 구조 기준 자동 생성:

```abap
DATA gt_fcat TYPE lvc_t_fcat.
DATA gs_fcat TYPE lvc_s_fcat.

FORM build_fieldcat.
  CALL FUNCTION 'LVC_FIELDCATALOG_MERGE'
    EXPORTING
      i_structure_name = 'ZBOOKING'
    CHANGING
      ct_fieldcat      = gt_fcat.

  LOOP AT gt_fcat INTO gs_fcat.
    IF gs_fcat-fieldname = 'SEATS'.
      gs_fcat-coltext   = '좌석수'.
      gs_fcat-outputlen = 8.
      MODIFY gt_fcat FROM gs_fcat.
    ENDIF.
  ENDLOOP.
ENDFORM.
```

자주 보는 field catalog 속성:

| 속성 | 의미 |
| --- | --- |
| `fieldname` | 출력 internal table의 component 이름 |
| `coltext` | 컬럼 제목 |
| `outputlen` | 표시 너비 |
| `no_out` | 처음에는 숨김 |
| `key` | key 컬럼 표시 |
| `do_sum` | 합계 가능. CH17에서는 맛보기, 심화는 CH21 |

### 어떻게 확인하는가

1. `LVC_FIELDCATALOG_MERGE` 뒤 `gt_fcat` row가 생겼는지 본다.
2. `fieldname` 값이 internal table component와 같은지 확인한다.
3. `SEATS` 컬럼의 `coltext`와 `outputlen`이 바뀌었는지 debugger에서 본다.
4. display 후 실제 컬럼 제목과 너비가 반영되었는지 확인한다.

### 체험 설계

학습 장치는 "컬럼 설명서 편집기"로 설계한다.

- 표 1: 출력 데이터 `gt_booking`.
- 표 2: field catalog `gt_fcat`.
- 버튼: `자동 생성`, `좌석수 제목 변경`, `컬럼 숨김`, `fieldname 오타`.
- 상태: 컬럼 반영 여부.
- 피드백: `fieldname = 'SEAT'`처럼 틀리면 "출력 데이터에 해당 component 없음"을 표시한다.

### 실수와 주의

- `i_structure_name`에는 DDIC 구조명을 넣는다. internal table 변수명을 넣는 것이 아니다.
- `fieldname`은 보통 대문자 DDIC field name으로 맞춘다.
- field catalog를 만들고 display 호출에 넘기지 않으면 화면에 반영되지 않는다.
- CH17에서는 컬럼 기본 제어까지만 다루고, 셀 스타일과 편집 속성은 뒤로 넘긴다.

### 정리

Field Catalog는 Grid ALV의 컬럼 설명서다. 데이터가 "무엇"이라면 field catalog는 "그 무엇을 어떤 컬럼으로 보여 줄지"에 대한 약속이다.

## CH17-L05 - Layout 기본 설정

### 왜 필요한가

Field Catalog가 컬럼 단위 설정이라면 Layout은 표 전체의 보기 방식이다. 줄무늬, 제목, 선택 방식, 컬럼 너비 자동 최적화 같은 설정은 사용자의 읽기 경험을 크게 바꾼다.

### 무엇인가

Grid ALV layout은 `LVC_S_LAYO` 구조로 다룬다.

```abap
DATA gs_layout TYPE lvc_s_layo.

FORM build_layout.
  gs_layout-zebra      = abap_true.
  gs_layout-sel_mode   = 'A'.
  gs_layout-grid_title = '예매 목록'.
  gs_layout-cwidth_opt = abap_true.
ENDFORM.
```

기본 속성:

| 속성 | 의미 |
| --- | --- |
| `zebra` | 행 배경을 번갈아 표시해 가독성 향상 |
| `sel_mode` | 행 선택 방식 |
| `grid_title` | Grid 상단 제목 |
| `cwidth_opt` | 컬럼 너비 자동 최적화 |
| `info_fname` | 행 색상 field 이름. L09에서 사용 |

### 어떻게 확인하는가

1. `gs_layout` 값이 채워졌는지 확인한다.
2. `set_table_for_first_display`의 `is_layout`에 전달되는지 본다.
3. 화면에서 줄무늬와 title이 보이는지 확인한다.
4. `cwidth_opt`를 켰을 때 긴 고객명 컬럼이 잘리지 않는지 비교한다.

### 체험 설계

학습 장치는 "Layout 토글 패널"로 설계한다.

- 토글: `zebra`, `cwidth_opt`, `grid_title`, `sel_mode`.
- 미리보기: 예매 목록 Grid.
- 상태: `gs_layout` 구조의 현재 값.
- 피드백: layout 값을 채웠지만 display에 넘기지 않으면 "설정은 만들었지만 Grid가 받지 못함"을 표시한다.

### 실수와 주의

- layout 구조를 채우는 것과 display 호출에 넘기는 것은 별개다.
- 처음부터 너무 많은 layout 속성을 넣으면 핵심을 놓친다.
- 행 색상용 `info_fname`은 L09에서 다룬다. 셀 색상과 style table은 CH21 이후다.

### 정리

Layout은 표 전체의 보기 설정이다. CH17에서는 줄무늬, 제목, 선택 방식, 컬럼 너비 정도만 확실히 잡는다.

## CH17-L06 - Variant 기본 설정

### 왜 필요한가

같은 예매 목록이라도 담당자마다 보고 싶은 컬럼 순서가 다르다. 운영자는 상태와 회차를 먼저 보고 싶고, 매표 담당자는 고객명과 좌석 수를 먼저 보고 싶을 수 있다. ALV Variant는 사용자가 자기 보기 방식을 저장하고 다시 불러오게 해 준다.

### 무엇인가

Display Variant는 `DISVARIANT` 구조로 다룬다.

```abap
DATA gs_variant TYPE disvariant.

FORM build_variant.
  gs_variant-report = sy-repid.
ENDFORM.
```

Display 호출에서는 variant와 저장 옵션을 함께 넘긴다.

```abap
go_grid->set_table_for_first_display(
  EXPORTING
    is_variant = gs_variant
    i_save     = 'A'
    is_layout  = gs_layout
  CHANGING
    it_outtab       = gt_booking
    it_fieldcatalog = gt_fcat ).
```

`gs_variant-report = sy-repid`는 이 variant가 어떤 program 기준인지 알려 주는 값이다. `i_save`는 사용자가 layout을 저장할 수 있는 범위와 관련된다. 실제 운영 환경에서는 전역 variant 저장 권한을 너무 쉽게 열지 않도록 정책이 필요하다.

### 어떻게 확인하는가

1. `gs_variant-report`가 현재 program 이름인지 확인한다.
2. display 호출에 `is_variant`가 전달되는지 본다.
3. ALV toolbar에서 layout 저장 또는 선택 기능이 보이는지 확인한다.
4. 컬럼 순서를 바꾸고 variant를 저장한 뒤 다시 열었을 때 복원되는지 확인한다.

### 체험 설계

학습 장치는 "사용자별 보기 저장 시뮬레이터"로 설계한다.

- 사용자 A: 고객명, 좌석 수 중심 variant.
- 사용자 B: 상태, 공연 ID 중심 variant.
- 버튼: `컬럼 순서 변경`, `Variant 저장`, `다시 열기`, `report 비우기`.
- 상태: `gs_variant-report`, 저장된 컬럼 순서, 적용된 variant.
- 피드백: report가 비어 있으면 "어느 program의 보기인지 기준이 약함"을 표시한다.

### 실수와 주의

- `report`를 설정하지 않으면 variant 저장과 조회가 꼬일 수 있다.
- 전역 variant를 아무나 바꾸게 하면 다른 사용자 화면에도 영향을 줄 수 있다.
- Variant는 데이터 필터링 로직을 대신하지 않는다. 보기 방식 저장 기능이다.

### 정리

Variant는 사용자가 표를 자기 방식으로 다시 볼 수 있게 하는 장치다. CH17에서는 `DISVARIANT`, `report`, `i_save` 연결까지만 확실히 잡는다.

## CH17-L07 - SET_TABLE_FOR_FIRST_DISPLAY

### 왜 필요한가

지금까지는 조각을 만들었다. Container, Grid, 데이터, Field Catalog, Layout, Variant가 준비되었다. 하지만 Grid에게 "이 조각들로 처음 표를 그려라"라고 말하지 않으면 화면에는 표가 나오지 않는다.

### 무엇인가

`set_table_for_first_display`는 Grid ALV를 처음 화면에 표시할 때 사용하는 대표 method다.

```abap
go_grid->set_table_for_first_display(
  EXPORTING
    is_layout       = gs_layout
    is_variant      = gs_variant
    i_save          = 'A'
  CHANGING
    it_outtab       = gt_booking
    it_fieldcatalog = gt_fcat ).
```

역할로 나누면 이해하기 쉽다.

| Parameter | 역할 |
| --- | --- |
| `is_layout` | 표 전체 모양 |
| `is_variant` | 사용자 layout 저장과 복원 기준 |
| `i_save` | variant 저장 허용 범위 |
| `it_outtab` | 화면에 그릴 데이터 |
| `it_fieldcatalog` | 컬럼 설명서 |

`EXPORTING`에는 Grid가 참고할 설정이 들어가고, `CHANGING`에는 Grid와 연결되어 표시될 데이터와 field catalog가 들어간다고 설명하면 입문자가 덜 헷갈린다.

### 어떻게 확인하는가

1. `go_cont`가 만들어졌는지 확인한다.
2. `go_grid`가 만들어졌는지 확인한다.
3. `gt_booking`에 row가 있는지 확인한다.
4. `gt_fcat`에 컬럼 설정이 있는지 확인한다.
5. `gs_layout`, `gs_variant`가 display 호출에 전달되는지 확인한다.
6. 화면에서 컬럼 제목, 데이터 row, 줄무늬, variant 버튼이 보이는지 확인한다.

### 체험 설계

기존 embed `CH17-L07-S01`을 주 학습 장치로 사용한다. 추가로 실패 토글을 둔다.

- 토글: `Container 없음`, `Grid 없음`, `Data 0건`, `Field Catalog 비움`, `Layout 미전달`.
- 버튼: `처음 표시 호출`.
- 상태: 각 조각 준비 여부.
- 피드백: 데이터 0건은 빈 결과일 수 있지만, field catalog가 비어 있으면 컬럼 정의 누락이라는 점을 구분한다.

### 실수와 주의

- `set_table_for_first_display`를 PBO마다 반복 호출하지 않는다.
- 이미 표시된 뒤 데이터만 바뀌면 L08의 refresh를 쓴다.
- `it_outtab`과 `it_fieldcatalog`를 준비하지 않고 호출하면 화면이 기대와 다르게 보인다.
- `EXPORTING`과 `CHANGING` 위치를 섞지 않는다.

### 정리

`set_table_for_first_display`는 준비한 조각들을 Grid에게 넘겨 처음 표를 그리게 하는 호출이다. 이 호출은 "처음 한 번"이라는 감각이 중요하다.

## CH17-L08 - Refresh와 Stable Refresh 기초

### 왜 필요한가

사용자가 화면을 열어 둔 동안 내부 테이블의 값이 바뀔 수 있다. 예를 들어 예매 상태가 바뀌거나 선택 조건을 다시 적용할 수 있다. 이때 internal table만 바꾸고 Grid를 다시 그리지 않으면 debugger에서는 데이터가 바뀌었는데 화면은 그대로라서 사용자는 오류처럼 느낀다.

### 무엇인가

이미 표시된 Grid는 `refresh_table_display`로 다시 그린다.

```abap
FORM refresh_grid.
  go_grid->refresh_table_display( ).
ENDFORM.
```

스크롤 위치와 선택 위치를 가능한 유지하려면 stable refresh를 사용한다.

```abap
DATA gs_stable TYPE lvc_s_stbl.

FORM refresh_grid_stable.
  gs_stable-row = abap_true.
  gs_stable-col = abap_true.

  go_grid->refresh_table_display(
    EXPORTING
      is_stable = gs_stable ).
ENDFORM.
```

핵심 구분:

| 상황 | 호출 |
| --- | --- |
| Grid를 처음 표시 | `set_table_for_first_display` |
| 이미 표시된 Grid의 데이터 반영 | `refresh_table_display` |
| 사용자의 위치를 유지하며 반영 | `refresh_table_display` with stable |

### 어떻게 확인하는가

1. Grid를 처음 표시한다.
2. `gt_booking`의 값을 변경하거나 다시 조회했다고 가정한다.
3. refresh를 호출하지 않고 화면이 그대로인지 본다.
4. `refresh_table_display` 호출 뒤 화면이 바뀌는지 확인한다.
5. 중간 행으로 스크롤한 뒤 일반 refresh와 stable refresh를 비교한다.

### 체험 설계

학습 장치는 "데이터와 화면 상태 비교판"으로 설계한다.

- 왼쪽: internal table 현재 값.
- 오른쪽: Grid 화면 값.
- 버튼: `내부 테이블 변경`, `일반 Refresh`, `Stable Refresh`, `스크롤 중간으로 이동`.
- 상태: row position, column position, selected row.
- 피드백: internal table만 바꾼 상태에서는 "데이터와 화면이 아직 동기화되지 않음"을 표시한다.

### 실수와 주의

- 데이터만 바꾸고 refresh를 호출하지 않으면 화면은 갱신되지 않을 수 있다.
- 모든 상황에서 처음 display를 다시 호출하지 않는다.
- stable refresh도 만능은 아니다. 정렬이나 row 구성 자체가 크게 바뀌면 완벽히 같은 위치를 유지하기 어렵다.

### 정리

Display는 처음 표시, refresh는 이후 갱신이다. 실무 화면에서는 stable refresh를 기본 후보로 고려해야 사용자가 보던 위치를 덜 잃는다.

## CH17-L09 - 행 색상 기초

### 왜 필요한가

업무 표에서 모든 행이 같은 색이면 중요한 상태를 놓치기 쉽다. 예매 목록이라면 매진, 취소, 확인 필요 같은 상태를 한눈에 구분할 수 있어야 한다. CH17에서는 가장 단순한 행 전체 색상만 다룬다.

### 무엇인가

행 색상은 출력 데이터 행 안에 색상 코드 field를 두고, layout의 `info_fname`에 그 field 이름을 알려 주는 방식이다.

```abap
TYPES: BEGIN OF ty_perf,
         concert_id TYPE zperf-concert_id,
         perf_id    TYPE zperf-perf_id,
         capacity   TYPE i,
         seatsocc   TYPE i,
         rowcolor   TYPE c LENGTH 4,
       END OF ty_perf.

DATA gt_perf TYPE TABLE OF ty_perf.
DATA gs_perf TYPE ty_perf.
DATA gs_layout TYPE lvc_s_layo.

LOOP AT gt_perf INTO gs_perf.
  IF gs_perf-seatsocc >= gs_perf-capacity.
    gs_perf-rowcolor = 'C610'.
    MODIFY gt_perf FROM gs_perf.
  ENDIF.
ENDLOOP.

gs_layout-info_fname = 'ROWCOLOR'.
```

핵심 조건:

1. 출력 internal table에 색상 field가 있어야 한다.
2. 각 행의 색상 field에 ALV 색상 코드가 들어가야 한다.
3. `gs_layout-info_fname`에 색상 field 이름을 알려 줘야 한다.
4. display 또는 refresh가 호출되어야 한다.

색상 코드 `C610`은 임의 RGB 값이 아니라 ALV color code 형식이다.

### 어떻게 확인하는가

1. 매진 행의 `rowcolor` 값이 `C610`인지 본다.
2. 매진이 아닌 행은 비어 있는지 본다.
3. `gs_layout-info_fname = 'ROWCOLOR'`인지 확인한다.
4. display 또는 refresh 뒤 화면에서 행 색상이 보이는지 확인한다.

### 체험 설계

학습 장치는 "매진 판정 색상 실험실"로 설계한다.

- 입력: `capacity`, `seatsocc`.
- 버튼: `매진 판정`, `색 코드 쓰기`, `Layout 연결`, `Refresh`.
- 상태: `rowcolor`, `info_fname`, 화면 색상.
- 실패 버튼: `info_fname = 'ROW_COLOR'`, `rowcolor 비움`, `refresh 생략`.
- 피드백: 색이 안 보이면 네 조건 중 무엇이 빠졌는지 표시한다.

### 실수와 주의

- `info_fname`에는 색상 값이 아니라 색상 값이 들어 있는 field 이름을 넣는다.
- `info_fname = 'C610'`은 잘못된 이해다.
- CH17은 행 색상까지만 다룬다.
- 셀 하나만 색칠하는 cell color, style table, button style, edit style은 CH21 이후로 넘긴다.

### 정리

행 색상은 중요한 업무 상태를 사용자가 놓치지 않게 하는 표시 기능이다. 데이터 행의 색상 field와 layout의 `info_fname` 연결이 함께 있어야 한다.

## CH17-L10 - 종합 실습: 예매 목록 Grid ALV 완성

### 왜 필요한가

CH17의 조각을 따로 배우면 "코드는 많은데 왜 필요한지"가 흐려질 수 있다. 마지막 실습은 조각을 하나의 PBO 흐름으로 묶는다. 처음 PBO에서는 ALV를 조립하고, 이후 PBO에서는 refresh만 한다. 이 구분이 CH17의 핵심이다.

### 무엇인가

전제:

- Module Pool 화면 0100이 있다.
- 화면 0100에 Custom Control `CONT100`이 있다.
- PBO Flow Logic에서 `MODULE status_0100.`을 호출한다.

전체 골격:

```abap
DATA: go_cont    TYPE REF TO cl_gui_custom_container,
      go_grid    TYPE REF TO cl_gui_alv_grid,
      gt_booking TYPE TABLE OF zbooking,
      gt_fcat    TYPE lvc_t_fcat,
      gs_layout  TYPE lvc_s_layo,
      gs_variant TYPE disvariant,
      gs_stable  TYPE lvc_s_stbl.

MODULE status_0100 OUTPUT.
  IF go_grid IS INITIAL.
    PERFORM build_alv.
  ELSE.
    PERFORM refresh_alv.
  ENDIF.
ENDMODULE.

FORM build_alv.
  PERFORM select_booking.
  PERFORM create_container_and_grid.
  PERFORM build_fieldcat.
  PERFORM build_layout.
  PERFORM build_variant.
  PERFORM display_grid.
ENDFORM.

FORM select_booking.
  SELECT *
    FROM zbooking
    INTO TABLE gt_booking
    WHERE concert_id = p_conc.
ENDFORM.

FORM create_container_and_grid.
  CREATE OBJECT go_cont
    EXPORTING
      container_name = 'CONT100'.

  CREATE OBJECT go_grid
    EXPORTING
      i_parent = go_cont.
ENDFORM.

FORM build_fieldcat.
  CALL FUNCTION 'LVC_FIELDCATALOG_MERGE'
    EXPORTING
      i_structure_name = 'ZBOOKING'
    CHANGING
      ct_fieldcat      = gt_fcat.
ENDFORM.

FORM build_layout.
  gs_layout-zebra      = abap_true.
  gs_layout-cwidth_opt = abap_true.
  gs_layout-grid_title = '예매 목록'.
ENDFORM.

FORM build_variant.
  gs_variant-report = sy-repid.
ENDFORM.

FORM display_grid.
  go_grid->set_table_for_first_display(
    EXPORTING
      is_layout       = gs_layout
      is_variant      = gs_variant
      i_save          = 'A'
    CHANGING
      it_outtab       = gt_booking
      it_fieldcatalog = gt_fcat ).
ENDFORM.

FORM refresh_alv.
  gs_stable-row = abap_true.
  gs_stable-col = abap_true.

  go_grid->refresh_table_display(
    EXPORTING
      is_stable = gs_stable ).
ENDFORM.
```

이 예제는 일부러 subroutine으로 나누었다. 입문자에게 긴 Grid ALV 코드를 한 덩어리로 보여 주면 순서가 보이지 않는다. `select_booking`, `create_container_and_grid`, `build_fieldcat`, `build_layout`, `build_variant`, `display_grid`, `refresh_alv`로 나누면 각 조각의 책임이 이름에 드러난다.

### 어떻게 확인하는가

1. 첫 PBO에서 `go_grid IS INITIAL`이 참인지 확인한다.
2. `build_alv`에서 데이터, container, grid, field catalog, layout, variant, display가 순서대로 실행되는지 본다.
3. 화면에 예매 목록이 표시되는지 확인한다.
4. 같은 화면이 다시 PBO를 탈 때 `build_alv`가 아니라 `refresh_alv`가 호출되는지 본다.
5. field catalog가 비어 있지 않은지, layout이 전달되는지, variant report가 채워졌는지 확인한다.
6. 데이터가 0건일 때 빈 Grid가 정상적으로 표시되는지 확인한다.

### 체험 설계

기존 embed `CH17-L10-S01`을 종합 실습 장치로 사용한다. 추가로 "조각 누락 진단" 패널을 둔다.

- 단계: 데이터 조회, container 생성, grid 생성, field catalog, layout, display.
- 버튼: `다음 단계`, `처음부터`, `Field Catalog 누락`, `Layout 누락`, `Refresh 생략`.
- 상태: `go_cont`, `go_grid`, row count, field catalog row count, layout title, display 호출 여부.
- 피드백: 화면이 비었을 때 "데이터 0건", "field catalog 누락", "display 미호출"을 구분해 알려 준다.

### 실수와 주의

- 처음 구성과 이후 갱신을 섞지 않는다.
- `set_table_for_first_display`는 처음 한 번, `refresh_table_display`는 이후 갱신이다.
- Container와 Grid를 PBO마다 중복 생성하지 않는다.
- Custom Control 이름과 `container_name`이 다르면 Grid가 붙지 않는다.
- `LVC_FIELDCATALOG_MERGE` 뒤 `gt_fcat`이 비어 있는지 확인해야 한다.
- 조회 결과 0건은 오류가 아니라 정상 업무 상황일 수 있다.

### 정리

CH17은 "표를 보여 주는 코드"가 아니라 "화면 안 표 control을 조립하는 코드"다. Container, Grid, 데이터, Field Catalog, Layout, Variant, Display, Refresh, Row Color가 각각 맡은 책임을 알아야 CH21의 표시 제어, CH27의 이벤트, CH28의 편집 Grid를 흔들리지 않고 배울 수 있다.

## CH17 마무리 체크리스트

학습자는 CH17을 마친 뒤 다음 질문에 답할 수 있어야 한다.

1. SALV와 Grid ALV는 왜 다른가?
2. Custom Control `CONT100`과 `CL_GUI_CUSTOM_CONTAINER`는 어떤 관계인가?
3. `CL_GUI_ALV_GRID` 생성 시 `i_parent`는 왜 필요한가?
4. Grid 객체만 만들면 표가 보이는가?
5. 출력 internal table과 field catalog는 각각 어떤 역할인가?
6. `LVC_FIELDCATALOG_MERGE`는 무엇을 자동으로 만들어 주는가?
7. Layout과 Variant는 어떻게 다른가?
8. `set_table_for_first_display`는 언제 호출하는가?
9. 이후 데이터가 바뀌면 왜 `refresh_table_display`를 쓰는가?
10. Stable refresh는 어떤 사용자 불편을 줄이는가?
11. 행 색상이 안 보이면 무엇을 확인해야 하는가?
12. 셀 색상, 이벤트, 편집 Grid는 왜 CH17에서 확장하지 않는가?

핵심 문장:

```text
CH17은 Grid ALV 조립 순서를 배우는 장이다.
처음은 set_table_for_first_display,
이후 갱신은 refresh_table_display,
행 강조는 info_fname,
이벤트와 편집은 후속 장으로 넘긴다.
```
