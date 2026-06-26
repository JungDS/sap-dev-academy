# CH27_REWRITE - ALV 고급 Event 응용

> 기준: `reference/codex_0625/00_QUALITY_REVIEW.md`, `reference/codex_0625/CH27_ALV-고급-Event-응용.md`, `content/abap/CH27/*`, `embeds/abap/CH27-L0*-S01.html`  
> 작성 범위: CH27 한 챕터. 기존 v1의 반복 템플릿을 제거하고, 레슨 본문을 완성 강의자료 수준으로 재집필한다.  
> Classic-first 경계: 이 챕터는 SAP GUI 기반 `CL_GUI_ALV_GRID` 이벤트 처리 수업이다. ABAP Cloud/RAP 방식으로 대체 설명하지 않는다.

## CH27의 위치

CH17에서는 `CL_GUI_ALV_GRID`로 표를 화면에 올리는 법을 배웠고, CH20에서는 ABAP Objects의 클래스, 메서드, 참조 변수, 이벤트, `SET HANDLER`를 배웠다. CH21에서는 표시 ALV를 조금 더 풍부하게 다루었다. CH27은 그 다음 단계다. 이제 ALV가 단순히 데이터를 보여 주는 표가 아니라, 사용자가 행을 더블클릭하고, 링크처럼 보이는 셀을 누르고, 툴바 버튼을 클릭했을 때 프로그램이 반응하는 화면이 된다.

입문자가 CH27에서 가장 자주 헷갈리는 지점은 "이벤트가 발생한 시점"과 "실제 업무 처리를 수행하는 시점"을 섞는 것이다. `toolbar` 이벤트는 버튼을 추가하는 시점이지 취소를 실행하는 시점이 아니다. `user_command`는 버튼이 눌린 뒤 명령 코드를 받아 처리하는 시점이다. `double_click`은 행이나 셀을 두 번 클릭했을 때의 반응이고, `hotspot_click`은 hotspot으로 지정된 셀을 한 번 클릭했을 때의 반응이다.

이 챕터는 다음 흐름으로 진행한다.

1. 사용자가 행을 더블클릭하면 어떤 행과 컬럼이 넘어오는지 확인한다.
2. 특정 컬럼을 링크처럼 만들고 한 번 클릭 이벤트를 처리한다.
3. ALV 툴바에 업무 버튼을 추가한다.
4. 추가한 버튼의 function code를 받아 선택 행을 처리한다.
5. 흩어진 이벤트 메서드를 하나의 핸들러 클래스로 묶고 `SET HANDLER` 배선을 한 곳에서 관리한다.

## R15 게이팅과 공식 문서 근거

| 구분 | CH27에서 사용하는 범위 | 수동 확인한 로컬 문서 |
|---|---|---|
| 이벤트 핸들러 메서드 선언 | `METHODS ... FOR EVENT ... OF ... IMPORTING ...` | `C:\ABAP_DOCU_HTML\abapmethods_event_handler.htm` |
| 인스턴스 이벤트 핸들러 등록 | `SET HANDLER handler FOR oref` | `C:\ABAP_DOCU_HTML\abapset_handler.htm`, `C:\ABAP_DOCU_HTML\abapset_handler_instance.htm` |
| 이벤트와 파라미터의 관계 | 이벤트의 output parameter가 핸들러의 input parameter가 되는 구조 | `C:\ABAP_DOCU_HTML\abapevents.htm`, `C:\ABAP_DOCU_HTML\abapevents_parameters.htm` |
| 핸들러 클래스 구조 | `CLASS ... DEFINITION`, `PUBLIC SECTION`, `PRIVATE SECTION`, `METHODS`, `DATA` | `C:\ABAP_DOCU_HTML\abapclass_definition.htm`, `C:\ABAP_DOCU_HTML\abapmethods_general.htm` |
| Classic GUI 경계 | GUI control은 SAP GUI와 Control Framework 기반 | `C:\ABAP_DOCU_HTML\abengui_control_glosry.htm`, `C:\ABAP_DOCU_HTML\abensap_gui_glosry.htm` |
| ABAP Cloud 경계 | ABAP Cloud는 ABAP for Cloud Development와 released API 제약, SAP GUI 접근 없음 | `C:\ABAP_DOCU_HTML\abenabap_cloud_glosry.htm`, `C:\ABAP_DOCU_HTML\abenabap_for_cloud_dev_glosry.htm`, `C:\ABAP_DOCU_HTML\abenreleased_api_glosry.htm` |

`CL_GUI_ALV_GRID`의 `double_click`, `hotspot_click`, `toolbar`, `user_command` 같은 구체 이벤트명과 `e_object->mt_toolbar`, `get_selected_rows`, `refresh_table_display` 같은 메서드/속성은 ALV Control 클래스 API 영역이다. 로컬 ABAP Keyword Documentation은 ABAP 문법과 개념을 설명하는 문서이므로, 이 재집필에서는 공식 키워드 문서로 OO 이벤트 문법과 SAP GUI/Cloud 경계를 확인하고, ALV API 이름은 프로젝트 키워드 감사와 기존 원본/임베드의 동일 API 사용을 기준으로 유지한다.

R15 기준으로 CH27은 CH20 이후이므로 `CLASS`, `METHODS`, `FOR EVENT`, `SET HANDLER`, 참조 변수, `NEW`, inline `DATA`, `FIELD-SYMBOLS`, `VALUE #(...)`를 사용할 수 있다. 다만 CH28의 editable ALV, `data_changed`, 셀 수정 검증, 변경 프로토콜은 이 챕터의 본문 실습으로 끌어오지 않는다.

## CH27-L01 - Double Click Event

### 왜 필요한가

업무 화면에서 ALV 행은 종종 "목록"이고, 사용자가 실제로 보고 싶은 것은 그 행의 상세 정보다. 예매 목록에서 한 행을 더블클릭하면 예매 상세, 고객 상세, 좌석 변경 화면으로 이동하는 식이다. 사용자가 표를 보고 있는데 화면 아래에 "상세 조회" 버튼을 따로 누르게 만들 수도 있지만, 이미 선택한 행을 더블클릭하는 흐름이 훨씬 자연스럽다.

중요한 점은 ALV가 자동으로 상세 화면을 열어 주는 것이 아니라는 점이다. ALV는 더블클릭이 발생했다는 사실과 클릭된 행/컬럼 정보를 이벤트로 알려 준다. 프로그램은 그 이벤트를 받을 메서드를 만들고, `SET HANDLER`로 ALV 객체와 연결한 뒤, 이벤트 메서드 안에서 어떤 업무 반응을 할지 결정해야 한다.

### 무엇인가

`double_click`은 `CL_GUI_ALV_GRID` 인스턴스에서 발생하는 사용자 이벤트다. 핸들러 메서드는 다음 세 가지를 갖춰야 한다.

1. 메서드 선언에 `FOR EVENT double_click OF cl_gui_alv_grid`가 있어야 한다.
2. 이벤트가 넘겨주는 `e_row`, `e_column`을 `IMPORTING`으로 받을 수 있어야 한다.
3. 실제 ALV 객체에 `SET HANDLER ... FOR go_grid`로 등록되어야 한다.

`e_row-index`는 사용자가 더블클릭한 현재 화면 행 번호다. 이 번호로 내부 테이블을 바로 읽을 수 있지만, 정렬/필터/집계가 적용된 화면에서는 내부 테이블의 물리 순서와 사용자가 보는 순서가 다를 수 있다. 그래서 초급 실습에서는 `INDEX`로 흐름을 이해하되, 실무 설계에서는 행에 들어 있는 업무 키를 중심으로 상세 조회를 해야 한다.

```abap
CLASS lcl_alv_handler DEFINITION.
  PUBLIC SECTION.
    METHODS constructor
      IMPORTING it_booking TYPE ztt_booking.

    METHODS on_double_click
      FOR EVENT double_click OF cl_gui_alv_grid
      IMPORTING e_row e_column.

  PRIVATE SECTION.
    DATA mt_booking TYPE ztt_booking.
ENDCLASS.

CLASS lcl_alv_handler IMPLEMENTATION.
  METHOD constructor.
    mt_booking = it_booking.
  ENDMETHOD.

  METHOD on_double_click.
    READ TABLE mt_booking INTO DATA(ls_booking) INDEX e_row-index.
    IF sy-subrc <> 0.
      MESSAGE '선택한 행을 찾을 수 없습니다.' TYPE 'I'.
      RETURN.
    ENDIF.

    MESSAGE |예매 { ls_booking-booking_id } 상세로 이동| TYPE 'I'.
  ENDMETHOD.
ENDCLASS.

DATA(go_handler) = NEW lcl_alv_handler( it_booking = lt_booking ).
SET HANDLER go_handler->on_double_click FOR go_grid.
```

이 예시는 학습을 위해 `ztt_booking`이라는 예매 내부 테이블 타입이 이미 있다고 가정한다. 실제 프로그램에서는 핸들러가 내부 테이블 복사본을 오래 들고 있기보다, 현재 화면 모델이나 서비스 객체를 통해 업무 키로 상세 데이터를 조회하도록 분리하는 편이 좋다.

### 어떻게 확인하는가

첫 번째 확인은 "핸들러가 실제로 호출되는가"다. 더블클릭했는데 아무 반응이 없다면 이벤트 메서드의 로직보다 먼저 `SET HANDLER`가 실행되었는지 확인해야 한다. 두 번째 확인은 "넘어온 행과 컬럼이 내가 클릭한 위치와 맞는가"다. 실습에서는 `MESSAGE` 또는 이벤트 로그에 `e_row-index`, `e_column-fieldname`을 출력해 본다.

세 번째 확인은 "행 번호를 업무 키로 바꿀 수 있는가"다. 예를 들어 `e_row-index = 3`이 넘어왔다면 내부 테이블의 3번째 행을 읽고, 그 행의 `booking_id`를 화면에 표시한다. 여기서 중요한 학습 포인트는 `3번 행` 자체가 업무 식별자가 아니라는 점이다. 3번 행은 사용자가 현재 보고 있는 위치이고, 실제 업무 처리는 `booking_id`, `customer_id`, `concert_id` 같은 키로 이어져야 한다.

::embed CH27-L01-S01 | Double Click 이벤트 - 행 더블클릭 | 460::

임베드에서는 행을 더블클릭할 때 이벤트 로그가 쌓이는지, 로그에 `double_click`, `on_double_click`, `e_row-index`가 표시되는지 확인한다. 버튼이나 입력 필드를 누른 것이 아니라 ALV 행 자체를 두 번 누르는 조작이라는 점도 함께 확인한다.

### 실수와 주의

`FOR EVENT`를 선언했는데 `SET HANDLER`를 빠뜨리면 메서드는 존재하지만 호출되지 않는다. 이벤트 수업에서 가장 흔한 오류다. 선언은 "이 메서드는 이런 이벤트를 처리할 수 있다"는 뜻이고, 등록은 "이 ALV 객체의 이벤트가 발생하면 이 메서드를 호출하라"는 뜻이다.

핸들러 객체를 너무 짧은 지역 변수로만 만들면 수명이 헷갈릴 수 있다. 공식 `SET HANDLER` 문서는 등록된 인스턴스 메서드의 객체가 런타임에 의해 참조된다는 점을 설명하지만, 화면 프로그램에서는 가독성과 제어를 위해 핸들러 참조를 전역 데이터나 컨트롤러 속성처럼 명확한 위치에 보관하는 편이 좋다. 그래야 나중에 해제, 재등록, 디버깅이 쉽다.

마지막으로 `e_row-index`를 곧바로 DB 키처럼 사용하면 안 된다. 행 번호는 화면 상태에 따라 바뀔 수 있다. 이 레슨에서는 행 번호로 내부 테이블을 읽어 이벤트 흐름을 익히고, 실제 상세 조회는 해당 행의 업무 키를 꺼내 수행한다고 이해한다.

### 체험형 학습 설계

학습 화면은 왼쪽에 예매 목록 ALV, 오른쪽에 이벤트 로그 패널을 둔다. 사용자가 첫 번째 행을 더블클릭하면 로그에 `double_click`, `row=1`, `column=BOOKING_ID`, `handler=on_double_click`이 추가된다. 두 번째 행을 더블클릭하면 상세 패널의 예매번호가 바뀌고, 로그에는 이전 이벤트 아래에 새 이벤트가 누적된다.

상태 표시 영역은 네 단계로 나눈다. `대기` 상태에서는 "행을 더블클릭하세요"만 보인다. `이벤트 발생` 상태에서는 행/컬럼 파라미터가 강조된다. `데이터 조회` 상태에서는 내부 테이블에서 읽은 업무 키가 표시된다. `피드백` 상태에서는 "상세 화면 이동 준비 완료" 또는 "행을 찾지 못했습니다"가 나타난다.

실습 버튼은 두 개면 충분하다. `SET HANDLER 끄기` 버튼을 누르면 더블클릭해도 로그가 쌓이지 않게 만들고, 학습자가 등록 누락 증상을 체험한다. `정렬 적용` 버튼은 화면 순서를 바꾼 뒤 행 번호와 업무 키를 비교하게 만든다. 이 버튼은 행 번호에 의존하는 설계가 왜 위험한지 보여 주는 장치다.

### 정리

`double_click`은 "사용자가 특정 ALV 행이나 셀을 더블클릭했다"는 신호다. `FOR EVENT`로 받을 메서드를 선언하고, `SET HANDLER`로 ALV 객체에 등록해야 호출된다. `e_row-index`는 화면 행 위치를 알려 주지만 업무 키가 아니므로, 실무 반응은 내부 테이블에서 키를 읽은 뒤 상세 조회나 화면 이동으로 이어져야 한다.

## CH27-L02 - Hotspot Click Event

### 왜 필요한가

모든 셀을 더블클릭 대상으로 만들면 사용자는 어디를 눌러야 하는지 헷갈린다. 예매 목록에서 콘서트 ID, 고객 번호, 예매 번호처럼 "눌러서 이동할 수 있는 값"은 링크처럼 보여 주는 편이 낫다. ALV에서는 이런 셀을 hotspot으로 지정하고, 사용자가 그 셀을 한 번 클릭했을 때 `hotspot_click` 이벤트를 처리할 수 있다.

이 레슨의 핵심은 "이벤트를 받기 전에 셀을 클릭 가능한 셀로 만들어야 한다"는 점이다. `hotspot_click` 핸들러만 만들면 끝이 아니다. Field Catalog에서 특정 필드의 `hotspot` 속성을 켜야 화면에서 링크처럼 보이고, 사용자의 한 번 클릭이 hotspot 이벤트로 이어진다.

### 무엇인가

Hotspot은 ALV 셀을 링크처럼 보이게 하는 표시 속성이다. 일반 셀 클릭은 hotspot 이벤트가 아니다. Field Catalog에서 특정 필드에 `hotspot = abap_true`를 지정하면 해당 컬럼의 셀이 클릭 가능한 링크처럼 보이고, 사용자가 그 셀을 한 번 클릭하면 `hotspot_click` 이벤트가 발생한다.

```abap
LOOP AT lt_fcat REFERENCE INTO DATA(lr_fcat).
  IF lr_fcat->fieldname = 'CONCERT_ID'.
    lr_fcat->hotspot = abap_true.
  ENDIF.
ENDLOOP.
```

핸들러는 클릭된 행과 컬럼을 받는다. 이때 `e_column_id-fieldname`으로 어떤 컬럼이 눌렸는지 확인하고, 의도한 hotspot 컬럼일 때만 업무 반응을 수행한다.

```abap
CLASS lcl_alv_handler DEFINITION.
  PUBLIC SECTION.
    METHODS on_hotspot
      FOR EVENT hotspot_click OF cl_gui_alv_grid
      IMPORTING e_row_id e_column_id.
ENDCLASS.

CLASS lcl_alv_handler IMPLEMENTATION.
  METHOD on_hotspot.
    IF e_column_id-fieldname <> 'CONCERT_ID'.
      RETURN.
    ENDIF.

    READ TABLE mt_booking INTO DATA(ls_booking) INDEX e_row_id-index.
    IF sy-subrc <> 0.
      MESSAGE '클릭한 콘서트 행을 찾을 수 없습니다.' TYPE 'I'.
      RETURN.
    ENDIF.

    MESSAGE |콘서트 { ls_booking-concert_id } 상세로 이동| TYPE 'I'.
  ENDMETHOD.
ENDCLASS.
```

`double_click`과 `hotspot_click`은 둘 다 사용자 클릭을 다루지만 사용 경험이 다르다. `double_click`은 행 전체를 대상으로 상세 조회에 어울리고, hotspot은 특정 컬럼 값이 링크 역할을 한다는 것을 명확히 보여 주고 싶을 때 어울린다.

### 어떻게 확인하는가

먼저 화면에서 hotspot 컬럼이 다른 셀과 다르게 보이는지 확인한다. 학습 화면에서는 `CONCERT_ID`에 밑줄이나 링크 색을 적용해 일반 셀과 구분한다. 그 다음 해당 셀을 한 번 클릭했을 때 이벤트 로그에 `hotspot_click`이 남는지 확인한다.

확인할 파라미터는 두 가지다. `e_row_id-index`는 클릭된 행 위치이고, `e_column_id-fieldname`은 클릭된 컬럼명이다. 학습자는 `CONCERT_ID` 셀을 클릭했을 때만 상세 패널이 바뀌고, 일반 텍스트 셀을 클릭했을 때는 hotspot 반응이 없다는 차이를 확인해야 한다.

::embed CH27-L02-S01 | Hotspot 이벤트 - 링크 셀 클릭 | 460::

임베드에서는 `concert_id`가 링크처럼 보인다. 해당 셀을 한 번 클릭하면 오른쪽 로그에 `hotspot_click`, `e_row_id`, `e_column_id`가 표시되고, 어떤 콘서트 ID를 눌렀는지 피드백이 나온다.

### 실수와 주의

가장 흔한 실수는 Field Catalog에 `hotspot`을 켜지 않고 핸들러만 만드는 것이다. 이 경우 사용자는 셀이 클릭 가능한지 알 수 없고, 기대한 이벤트도 발생하지 않는다. 두 번째 실수는 `double_click`과 hotspot을 같은 컬럼에 동시에 강하게 걸어 사용자 조작을 애매하게 만드는 것이다. 같은 값에서 한 번 클릭과 더블클릭이 서로 다른 업무를 수행하면 화면은 빠르게 혼란스러워진다.

`e_row_id-index`도 L01의 `e_row-index`와 같은 이유로 업무 키가 아니다. 행 위치로 내부 테이블을 읽더라도 실제 이동은 `concert_id` 같은 업무 키를 사용한다. 또한 hotspot은 "편집"이 아니라 "탐색"에 적합하다. 셀 값을 바꾸는 입력 이벤트는 CH28에서 다룬다.

### 체험형 학습 설계

시뮬레이터는 세 개의 컬럼을 보여 준다. `BOOKING_ID`는 일반 텍스트, `CONCERT_ID`는 hotspot, `STATUS`는 일반 상태 값이다. 사용자가 각 셀을 클릭하면 상태 패널에 서로 다른 메시지가 나온다. 일반 텍스트는 "hotspot 아님", `CONCERT_ID`는 "hotspot_click 발생", 상태 값은 "표시 전용"이라고 보여 준다.

설정 패널에는 `CONCERT_ID hotspot 켜기/끄기` 토글을 둔다. 토글을 끄면 링크 스타일이 사라지고 클릭 로그도 남지 않는다. 이 장치는 Field Catalog 설정과 이벤트 발생이 연결되어 있다는 사실을 눈으로 확인하게 해 준다.

피드백 영역에는 `클릭 횟수`, `클릭 컬럼`, `읽은 업무 키`, `다음 동작`을 분리해 보여 준다. 예를 들어 `CONCERT_ID=C-1003`을 클릭하면 다음 동작은 "콘서트 상세 조회"로 표시하고, 실제 DB 변경은 일어나지 않게 한다. CH27의 목적이 UI 탐색 이벤트임을 유지하기 위해서다.

### 정리

Hotspot은 특정 ALV 셀을 링크처럼 보이게 하고, 한 번 클릭으로 `hotspot_click` 이벤트를 발생시키는 방식이다. Field Catalog에서 `hotspot`을 켜고, 핸들러에서는 `e_row_id`와 `e_column_id`를 받아 클릭 위치를 확인한다. 더블클릭은 행 중심 탐색, hotspot은 컬럼 값 중심 탐색에 어울린다.

## CH27-L03 - Toolbar Event

### 왜 필요한가

ALV를 업무 화면으로 쓰다 보면 표 위쪽에 "예매 취소", "메일 발송", "상세 조회", "엑셀 다운로드" 같은 화면 고유 기능을 놓고 싶어진다. 표 밖에 별도 버튼을 배치할 수도 있지만, 사용자가 표 데이터를 선택한 뒤 곧바로 실행할 기능이라면 ALV 툴바 안에 버튼을 두는 편이 흐름이 좋다.

`toolbar` 이벤트는 바로 이 지점에서 필요하다. ALV가 툴바를 구성할 때 프로그램이 끼어들어 버튼을 추가할 수 있다. 다만 이 이벤트에서 업무 처리를 실행하는 것은 아니다. `toolbar`는 버튼을 "만드는" 이벤트이고, 버튼을 "눌렀을 때 처리하는" 이벤트는 다음 레슨의 `user_command`다.

### 무엇인가

`toolbar` 이벤트 핸들러는 `e_object`를 받는다. 이 객체 안의 `mt_toolbar` 테이블에 버튼 정보를 추가하면 ALV 툴바에 버튼이 나타난다. 버튼에서 가장 중요한 값은 `function`이다. 사용자가 버튼을 누르면 이 function code가 `user_command` 이벤트의 `e_ucomm`으로 넘어간다.

```abap
METHODS on_toolbar
  FOR EVENT toolbar OF cl_gui_alv_grid
  IMPORTING e_object.

METHOD on_toolbar.
  APPEND VALUE #(
    function  = 'ZCANCEL'
    icon      = icon_delete
    text      = '예매 취소'
    quickinfo = '선택한 예매를 취소합니다'
    butn_type = 0
  ) TO e_object->mt_toolbar.
ENDMETHOD.
```

이 코드는 버튼을 추가할 뿐이다. `ZCANCEL`이라는 문자열은 아직 취소 로직이 아니다. 사용자가 버튼을 눌렀을 때 `user_command` 이벤트가 발생하고, 그때 `e_ucomm = 'ZCANCEL'`인지 확인해 취소 로직으로 분기한다.

동적으로 툴바 구성이 바뀌는 화면에서는 `go_grid->set_toolbar_interactive( )` 같은 갱신 처리가 필요할 수 있다. 하지만 입문 단계에서는 먼저 "툴바 이벤트에서 버튼을 추가한다"와 "버튼 클릭 처리는 별도 이벤트로 넘어간다"를 분리해 이해하는 것이 더 중요하다.

### 어떻게 확인하는가

첫 번째 확인은 버튼이 실제 툴바에 나타나는지다. `toolbar` 핸들러가 등록되지 않았거나 `function` 값이 빠지면 원하는 버튼 흐름을 확인할 수 없다. 두 번째 확인은 버튼의 `function` 값이 다음 이벤트로 전달될 준비가 되었는지다. 버튼 텍스트는 사용자에게 보이는 이름이고, `function`은 프로그램이 분기할 내부 명령 코드다.

::embed CH27-L03-S01 | Toolbar 이벤트 - 커스텀 버튼 추가 | 440::

임베드에서는 파란색 `예매 취소` 버튼이 툴바에 추가되는 모습을 확인한다. 로그는 "버튼 추가" 단계까지만 보여 준다. 아직 선택 행 취소나 화면 갱신이 일어나지 않는 것이 정상이다. 그 처리는 L04에서 이어진다.

### 실수와 주의

`toolbar`에서 바로 DB 삭제나 취소 처리를 수행하면 안 된다. 툴바는 여러 번 다시 그려질 수 있고, 그때마다 업무 처리가 반복되면 치명적이다. `toolbar`에서는 버튼 정의만 추가하고, 실제 처리는 `user_command`에서 해야 한다.

`function` 값은 명확하고 충돌이 적게 정한다. SAP 표준 기능 코드와 헷갈리지 않게 예제에서는 `ZCANCEL`처럼 커스텀 명령임을 드러낸다. 버튼의 `text`와 `quickinfo`는 사용자에게 보이는 설명이고, `function`은 코드에서 분기하는 키라는 점을 분리한다.

버튼이 보이지 않는 문제는 보통 세 곳에서 난다. `SET HANDLER` 누락, `e_object->mt_toolbar`에 append하지 않음, 동적 툴바 갱신 누락이다. 학습자는 이 세 가지를 순서대로 확인하는 습관을 가져야 한다.

### 체험형 학습 설계

시뮬레이터는 ALV 상단에 기본 버튼 영역과 커스텀 버튼 영역을 나누어 표시한다. `toolbar 이벤트 실행` 버튼을 누르면 `e_object->mt_toolbar` 테이블에 한 줄이 추가되는 애니메이션을 보여 주고, 그 결과 툴바에 `예매 취소` 버튼이 생긴다.

오른쪽에는 버튼 정의 테이블을 보여 준다. 컬럼은 `function`, `icon`, `text`, `quickinfo`, `butn_type`으로 구성한다. 사용자가 각 값을 바꾸면 버튼 표시가 어떻게 달라지는지 즉시 확인하게 한다. 단, `function`이 비어 있으면 버튼은 빨간 경고 상태가 되고, "다음 `user_command`에서 분기할 수 없습니다"라는 피드백을 준다.

또 하나의 토글은 `업무 처리 실행 금지`다. 이 토글은 항상 켜져 있고 끌 수 없게 설계한다. 학습 의도는 명확하다. `toolbar`는 버튼을 만드는 시점이지, 취소를 수행하는 시점이 아님을 UI 자체가 보여 주어야 한다.

### 정리

`toolbar` 이벤트는 ALV 툴바를 구성할 때 커스텀 버튼을 추가하는 지점이다. `e_object->mt_toolbar`에 버튼 정의를 append하고, 그 버튼의 `function` 값을 다음 단계의 명령 코드로 사용한다. 실제 업무 처리는 `toolbar`가 아니라 `user_command`에서 수행한다.

## CH27-L04 - USER_COMMAND 처리

### 왜 필요한가

L03에서 버튼을 만들었다면 이제 사용자가 그 버튼을 눌렀을 때 프로그램이 반응해야 한다. 예매 취소 버튼을 눌렀는데 아무 일도 없으면 버튼은 장식일 뿐이다. 반대로 버튼을 누르자마자 어떤 행을 대상으로 처리할지 확인하지 않고 취소를 수행하면 위험하다.

`user_command`는 ALV 툴바의 커스텀 버튼을 눌렀을 때 명령 코드를 받아 업무 흐름으로 분기하는 이벤트다. 이 레슨에서는 `ZCANCEL` 버튼을 눌렀을 때 선택된 행을 가져오고, 학습용 상태를 취소로 바꾼 뒤 ALV를 새로 고치는 흐름을 다룬다.

### 무엇인가

`user_command` 핸들러는 `e_ucomm`을 받는다. `e_ucomm`은 사용자가 누른 버튼의 function code다. L03에서 버튼을 만들 때 `function = 'ZCANCEL'`로 지정했다면, 버튼 클릭 시 `e_ucomm` 값으로 `ZCANCEL`이 들어온다.

```abap
METHODS on_user_command
  FOR EVENT user_command OF cl_gui_alv_grid
  IMPORTING e_ucomm.

METHOD on_user_command.
  CASE e_ucomm.
    WHEN 'ZCANCEL'.
      mo_grid->get_selected_rows(
        IMPORTING et_index_rows = DATA(lt_rows)
      ).

      IF lt_rows IS INITIAL.
        MESSAGE '먼저 취소할 행을 선택하세요.' TYPE 'I'.
        RETURN.
      ENDIF.

      LOOP AT lt_rows INTO DATA(ls_row).
        READ TABLE mt_booking ASSIGNING FIELD-SYMBOL(<ls_booking>)
          INDEX ls_row-index.
        IF sy-subrc = 0.
          <ls_booking>-status = 'CANCELLED'.
        ENDIF.
      ENDLOOP.

      mo_grid->refresh_table_display( ).
  ENDCASE.
ENDMETHOD.
```

이 코드는 화면 실습용이다. 실제 예매 취소라면 CH24의 DML, CH25의 잠금, 권한 확인, 오류 메시지, 커밋/롤백 경계를 함께 설계해야 한다. CH27에서는 그 전체를 새로 가르치지 않고, ALV 이벤트에서 "어느 행을 대상으로 어떤 업무 서비스로 넘길지"를 연결하는 데 집중한다.

### 어떻게 확인하는가

확인은 네 단계로 나누면 좋다. 먼저 행을 선택하지 않고 `예매 취소` 버튼을 눌러 본다. 이때 "먼저 행을 선택하세요"라는 피드백이 나와야 한다. 다음으로 한 행을 선택하고 버튼을 누른다. 로그에는 `user_command`, `e_ucomm=ZCANCEL`, `selected_rows=1`이 남아야 한다.

세 번째로 여러 행을 선택하고 버튼을 누른다. 선택 행 수가 로그에 표시되고, 각 행의 상태가 `CANCELLED`로 바뀌어야 한다. 네 번째로 화면 갱신을 확인한다. 내부 테이블 값만 바뀌고 ALV가 새로 그려지지 않으면 사용자는 변경 결과를 볼 수 없다. 그래서 처리 후 `refresh_table_display( )`가 필요하다.

::embed CH27-L04-S01 | USER_COMMAND - 선택 행 취소·갱신 | 480::

임베드에서는 행을 체크한 뒤 `예매 취소` 버튼을 누른다. 로그는 `e_ucomm` 값과 선택 행 목록을 보여 주고, 표의 상태 컬럼이 취소 상태로 바뀐 뒤 새로 고침되는 흐름을 보여 준다.

### 실수와 주의

`user_command`에서 `CASE e_ucomm` 없이 바로 처리하면 나중에 버튼이 늘어날 때 위험하다. 명령 코드는 반드시 분기하고, 알 수 없는 명령은 무시하거나 로그로 남긴다.

선택 행이 없을 때의 피드백은 필수다. 사용자는 버튼을 눌렀는데 아무 반응이 없으면 프로그램이 멈춘 것으로 생각한다. 반대로 선택 행이 없는데 전체 행을 대상으로 처리하면 더 위험하다. "선택 없음"은 업무 오류가 아니라 사용자 조작 미완료이므로 친절한 정보 메시지로 돌려보낸다.

행 번호 기반 처리는 화면 정렬/필터와 충돌할 수 있다. 이 레슨의 코드는 이벤트 흐름을 보여 주기 위해 index를 사용하지만, 실제 취소 처리는 선택 행에서 `booking_id` 같은 키를 읽고 서비스나 DB 처리로 넘기는 구조가 되어야 한다. 또한 이 레슨은 표시 ALV 이벤트다. 셀을 직접 수정하고 변경 이벤트를 검증하는 흐름은 CH28에서 다룬다.

### 체험형 학습 설계

시뮬레이터는 세 가지 상태를 갖는다. `선택 없음`, `선택 있음`, `처리 완료`다. `선택 없음`에서 취소 버튼을 누르면 버튼은 흔들림 효과를 보이고 상태 패널에 "대상 행 없음"이 표시된다. `선택 있음`에서 버튼을 누르면 선택된 행이 노란색으로 잠시 강조되고, 처리 후 회색 취소 상태로 바뀐다.

이벤트 로그는 최소 다섯 줄을 보여 준다. `toolbar에서 ZCANCEL 버튼이 등록됨`, `user_command 발생`, `e_ucomm=ZCANCEL`, `get_selected_rows 결과`, `refresh_table_display 호출`이다. 각 줄은 실행 순서대로 나타나야 한다. 학습자가 버튼 생성과 버튼 실행을 다른 이벤트로 분리해서 기억하게 하기 위함이다.

피드백 설계에는 `실제 DB 반영 아님` 배지를 둔다. CH27 실습은 화면 데이터의 상태를 바꾸어 이벤트 흐름을 이해하는 단계다. 배지를 누르면 "실제 취소 저장은 CH24 DML, CH25 Lock, 트랜잭션 처리를 함께 설계해야 합니다"라는 설명 패널이 열린다.

### 정리

`user_command`는 툴바 버튼의 function code를 받아 실제 반응으로 분기하는 이벤트다. L03에서 추가한 `ZCANCEL` 버튼은 L04에서 `e_ucomm`으로 확인된다. 선택 행을 가져오고, 대상이 없으면 피드백을 주고, 처리 후 ALV를 새로 고치는 흐름이 기본 골격이다.

## CH27-L05 - ALV Event Handler Class 설계

### 왜 필요한가

레슨 1부터 4까지는 이벤트를 하나씩 배웠다. 하지만 실제 화면에는 더블클릭, hotspot, 툴바 버튼, user command가 동시에 존재한다. 이벤트 메서드와 `SET HANDLER`가 프로그램 곳곳에 흩어지면 "어떤 이벤트가 어디로 연결되는지" 추적하기 어렵다. 초급자는 이 상태에서 버튼 하나가 안 먹히면 화면 생성 문제인지, 핸들러 등록 문제인지, 메서드 내부 로직 문제인지 구분하지 못한다.

그래서 CH27의 마지막 레슨은 이벤트 핸들러 클래스를 설계한다. 목표는 거대한 클래스를 만드는 것이 아니라, ALV 사용자 이벤트의 배선을 한 곳에서 보이게 만드는 것이다. 어떤 이벤트가 어떤 메서드로 연결되는지, 그 메서드가 어떤 화면 상태를 읽고 어떤 업무 서비스로 넘기는지 구조를 잡는다.

### 무엇인가

핸들러 클래스는 ALV 이벤트 메서드를 모아 둔 객체다. 보통 생성자에서 ALV Grid 참조와 화면 데이터 참조를 받고, 생성자 안에서 `SET HANDLER`를 한 번에 수행한다. 이렇게 하면 화면 초기화 코드에서는 핸들러 객체를 생성하기만 해도 이벤트 배선이 완료된다.

```abap
CLASS lcl_alv_handler DEFINITION.
  PUBLIC SECTION.
    METHODS constructor
      IMPORTING
        io_grid    TYPE REF TO cl_gui_alv_grid
        it_booking TYPE ztt_booking.

    METHODS on_double_click
      FOR EVENT double_click OF cl_gui_alv_grid
      IMPORTING e_row e_column.

    METHODS on_hotspot
      FOR EVENT hotspot_click OF cl_gui_alv_grid
      IMPORTING e_row_id e_column_id.

    METHODS on_toolbar
      FOR EVENT toolbar OF cl_gui_alv_grid
      IMPORTING e_object.

    METHODS on_user_command
      FOR EVENT user_command OF cl_gui_alv_grid
      IMPORTING e_ucomm.

  PRIVATE SECTION.
    DATA mo_grid TYPE REF TO cl_gui_alv_grid.
    DATA mt_booking TYPE ztt_booking.
ENDCLASS.

CLASS lcl_alv_handler IMPLEMENTATION.
  METHOD constructor.
    mo_grid = io_grid.
    mt_booking = it_booking.

    SET HANDLER me->on_double_click
                me->on_hotspot
                me->on_toolbar
                me->on_user_command
      FOR mo_grid.
  ENDMETHOD.

  METHOD on_double_click.
    " 상세 조회 또는 화면 이동으로 위임
  ENDMETHOD.

  METHOD on_hotspot.
    " 링크형 컬럼 클릭 처리로 위임
  ENDMETHOD.

  METHOD on_toolbar.
    " 커스텀 버튼 정의 추가
  ENDMETHOD.

  METHOD on_user_command.
    " function code별 업무 반응 분기
  ENDMETHOD.
ENDCLASS.

DATA(go_handler) = NEW lcl_alv_handler(
  io_grid    = go_grid
  it_booking = lt_booking
).
```

이 구조에서 `mo_grid`는 선택 행 조회나 화면 갱신에 필요하다. `mt_booking`은 학습용 예제에서 화면 데이터를 읽기 위해 둔다. 실제 프로그램에서는 핸들러가 모든 업무 규칙을 직접 갖기보다, 화면 컨트롤러나 서비스 객체에 위임하는 구조가 더 유지보수하기 쉽다.

### 어떻게 확인하는가

가장 먼저 확인할 것은 생성자 한 곳에 모든 `SET HANDLER`가 모였는지다. `on_double_click`만 등록하고 `on_user_command`를 빠뜨리면 더블클릭은 되지만 버튼은 반응하지 않는다. 체크리스트로는 이벤트 이름, 핸들러 메서드 이름, `SET HANDLER` 등록 여부, 필요한 파라미터 이름을 나란히 놓고 본다.

두 번째 확인은 이벤트 발생 순서다. `toolbar`는 화면이 툴바를 만들 때 먼저 발생하고, 사용자가 추가 버튼을 누른 뒤에 `user_command`가 발생한다. `double_click`과 `hotspot_click`은 사용자의 클릭 조작에서 직접 발생한다. 이 네 가지를 같은 "클릭 이벤트"로 뭉뚱그리면 흐름을 잘못 설계하게 된다.

::embed CH27-L05-S01 | 핸들러 배선 - 이벤트 -> 메서드 | 460::

임베드는 왼쪽의 ALV 이벤트 목록과 오른쪽의 핸들러 메서드 목록을 선으로 연결해 보여 준다. `SET HANDLER`가 배선 역할을 한다는 점을 시각적으로 확인하고, 이벤트가 늘어나도 배선 위치를 한 곳에서 추적하는 경험을 제공한다.

### 실수와 주의

핸들러 클래스에 모든 업무 로직을 밀어 넣으면 금방 비대해진다. 핸들러는 "사용자 이벤트를 받아 화면 상태와 업무 서비스를 연결하는 층"으로 두는 편이 좋다. 예매 취소의 잠금, DB 변경, 커밋 제어, 오류 복구는 CH24/CH25에서 배운 별도 책임으로 분리한다.

생성자에서 `SET HANDLER`를 수행하는 방식은 배선을 한 곳에 모으는 장점이 있지만, 재등록이 필요한 동적 화면에서는 해제와 재등록 정책도 함께 생각해야 한다. 같은 이벤트에 같은 핸들러를 중복 등록하려 하면 `SET HANDLER` 결과나 런타임 동작을 확인해야 한다. 공식 문서에서도 등록과 해제, 이미 등록된 핸들러의 의미를 별도로 설명한다.

ABAP Cloud 경계도 명확히 둔다. `CL_GUI_ALV_GRID`와 SAP GUI Control Framework는 Classic ABAP/SAP GUI 화면의 기술이다. ABAP Cloud는 ABAP for Cloud Development, released API, ADT, RAP 중심의 제약을 갖고 SAP GUI 접근이 없다. 따라서 이 챕터를 Cloud에서 그대로 실행 가능한 패턴으로 소개하지 않는다. Cloud 맥락에서는 RAP/Fiori/UI5의 이벤트와 액션 설계로 넘어가야 하며, 이 챕터에서는 Classic ALV 이벤트 학습에 머문다.

### 체험형 학습 설계

최종 시뮬레이터는 "이벤트 배선판" 형태가 좋다. 왼쪽에는 `double_click`, `hotspot_click`, `toolbar`, `user_command`가 있고, 오른쪽에는 `on_double_click`, `on_hotspot`, `on_toolbar`, `on_user_command`가 있다. 가운데에는 `SET HANDLER` 배선 선이 보인다. 학습자가 각 이벤트를 누르면 해당 선이 강조되고, 아래 코드 패널에서 등록 문장이 강조된다.

상태 데이터는 세 덩어리로 분리해 보여 준다. `Grid 상태`에는 선택 행과 클릭 컬럼이 표시된다. `Handler 상태`에는 현재 호출된 메서드와 받은 파라미터가 표시된다. `Business 상태`에는 상세 조회 준비, 링크 이동 준비, 취소 대상 수, 화면 갱신 여부가 표시된다. 이 분리는 UI 이벤트, 핸들러, 업무 반응을 섞지 않게 돕는다.

진단 버튼도 포함한다. `핸들러 하나 해제` 버튼을 누르면 특정 이벤트의 선이 끊어지고, 해당 조작을 해도 로그가 남지 않는다. `function 코드 변경` 버튼은 툴바 버튼의 `function`을 `ZVOID`로 바꾸어 `CASE e_ucomm`에서 처리되지 않는 상태를 보여 준다. `CH28 경계 보기` 버튼은 editable ALV의 `data_changed`는 다음 챕터임을 안내하고, 현재 화면에서는 셀 입력 검증을 열지 않는다.

### 정리

CH27의 완성 형태는 이벤트 메서드를 많이 아는 것이 아니라, 이벤트 발생 시점과 핸들러 배선을 안정적으로 설명할 수 있는 것이다. `double_click`은 행/셀 더블클릭, `hotspot_click`은 링크형 셀 한 번 클릭, `toolbar`는 버튼 추가, `user_command`는 버튼 클릭 후 명령 처리다. 이 네 가지를 하나의 핸들러 클래스에서 `SET HANDLER`로 연결하면 ALV 화면의 사용자 반응 구조가 선명해진다.
