# CH28_REWRITE - Editable Grid ALV와 입력 검증

> 기준: `reference/codex_0625/00_QUALITY_REVIEW.md`, `reference/codex_0625/CH28_Editable-Grid-ALV와-입력-검증.md`, `content/abap/CH28/*`, `embeds/abap/CH28-L0*-S01.html`  
> 작성 범위: CH28 한 챕터. 기존 v1의 반복 템플릿을 제거하고, 레슨 본문을 완성 강의자료 수준으로 재집필한다.  
> Classic-first 경계: 이 챕터는 SAP GUI 기반 `CL_GUI_ALV_GRID`의 editable grid 수업이다. ABAP Cloud/RAP/Fiori의 입력 검증 방식으로 대체하지 않는다.

## CH28의 위치

CH17에서는 Grid ALV를 화면에 표시하는 기본 구조를 배웠다. CH21에서는 표시 품질, 색, 스타일, stable refresh를 다루었다. CH27에서는 사용자가 ALV를 클릭하거나 툴바 버튼을 누를 때 발생하는 이벤트를 처리했다. CH28은 그 다음 단계다. 이제 사용자가 ALV 셀 안에 값을 직접 입력하고, 프로그램이 그 값을 검증하고, 최종 저장 전에 데이터 무결성을 다시 확인한다.

입문자가 CH28에서 반드시 구분해야 할 것은 네 가지다.

1. **입력 가능 상태**: 어떤 컬럼이나 셀이 입력 가능한가.
2. **변경 감지**: 사용자가 셀 값을 바꾼 순간을 프로그램이 아는가.
3. **검증 피드백**: 잘못된 값을 셀 위치와 메시지로 사용자에게 돌려주는가.
4. **저장 전 최종 방어선**: 화면에서 괜찮아 보여도 DB 반영 직전 전체 규칙을 다시 확인하는가.

Editable ALV는 편리하지만 위험하다. 사용자는 표에서 바로 값을 바꿀 수 있고, 그 값은 내부 테이블과 DB 저장 흐름으로 이어질 수 있다. 따라서 CH28은 "입력칸을 열어 준다"에서 끝나지 않고, "어떤 입력을 받을지, 언제 막을지, 어디에 오류를 보여 줄지, 언제 DB에 쓸지"를 끝까지 다룬다.

## R15 게이팅과 공식 문서 근거

| 구분 | CH28에서 사용하는 범위 | 수동 확인한 로컬 문서 |
|---|---|---|
| 이벤트 핸들러 선언 | `METHODS ... FOR EVENT ... OF ... IMPORTING ...` | `C:\ABAP_DOCU_HTML\abapmethods_event_handler.htm` |
| 인스턴스 이벤트 핸들러 등록 | `SET HANDLER ... FOR oref` | `C:\ABAP_DOCU_HTML\abapset_handler_instance.htm` |
| 이벤트 파라미터 구조 | 이벤트 output parameter가 핸들러 input parameter로 이어짐 | `C:\ABAP_DOCU_HTML\abapevents.htm` |
| DB 반영 | `MODIFY dbtab FROM ...`, `sy-subrc`, `sy-dbcnt`, DB commit 전까지 rollback 가능 | `C:\ABAP_DOCU_HTML\abapmodify_dbtab.htm` |
| 트랜잭션 확정/취소 | `COMMIT WORK`, `ROLLBACK WORK`, SAP LUW 경계 | `C:\ABAP_DOCU_HTML\abapcommit.htm`, `C:\ABAP_DOCU_HTML\abaprollback.htm` |
| 사용자 메시지 | `MESSAGE`, 메시지 타입, `sy-msg*` | `C:\ABAP_DOCU_HTML\abapmessage.htm` |
| Classic GUI 경계 | GUI control은 SAP GUI와 Control Framework 기반 | `C:\ABAP_DOCU_HTML\abengui_control_glosry.htm`, `C:\ABAP_DOCU_HTML\abensap_gui_glosry.htm` |
| ABAP Cloud 경계 | ABAP Cloud는 restricted ABAP language, released API, ADT, SAP GUI 접근 없음 | `C:\ABAP_DOCU_HTML\abenabap_cloud_glosry.htm`, `C:\ABAP_DOCU_HTML\abenabap_for_cloud_dev_glosry.htm`, `C:\ABAP_DOCU_HTML\abenreleased_api_glosry.htm` |

`CL_GUI_ALV_GRID`의 `register_edit_event`, `data_changed`, `data_changed_finished`, `check_changed_data`, `CL_ALV_CHANGED_DATA_PROTOCOL`, `mt_good_cells`, `add_protocol_entry`, `display_protocol`, `LVC_T_STYL`, `mc_style_disabled`, `mc_style_enabled`는 ALV Control 클래스 API 영역이다. 이 재집필에서는 ABAP Keyword Documentation으로 ABAP 문법, 이벤트 핸들러 구조, DB/LUW, SAP GUI/Cloud 경계를 확인하고, ALV API 이름은 원본 레슨, 임베드, 프로젝트 키워드 감사의 일치 판정을 기준으로 유지한다.

R15 기준으로 CH28은 CH20 이후이므로 ABAP Objects 이벤트, `SET HANDLER`, 예외 처리, 참조 변수, inline `DATA`, `FIELD-SYMBOLS`, `VALUE #(...)`, New Open SQL의 host variable 사용을 다룰 수 있다. 다만 CH29의 Enhancement/BAdI, RAP behavior validation, Fiori/UI5 입력 검증은 이 챕터의 본문 코드로 끌어오지 않는다.

## CH28-L01 - Editable Field Catalog 설정

### 왜 필요한가

지금까지 ALV는 주로 "조회 결과를 보여 주는 표"였다. 사용자가 값을 바꾸려면 별도 상세 화면을 열거나, 선택 행을 기준으로 팝업을 띄워야 했다. 하지만 예매 좌석 수, 계획 수량, 간단한 상태 값처럼 표에서 바로 고치면 편한 업무가 있다. 이때 ALV 셀을 입력칸으로 열어 주는 기능이 필요하다.

여기서 중요한 점은 "ALV 전체를 입력 가능하게 만든다"가 아니라 "정말 입력받아도 되는 컬럼만 열어 준다"는 것이다. 예매 번호, 고객 번호, 콘서트 ID 같은 키 컬럼을 사용자가 바꾸게 하면 데이터 연결이 깨진다. 반대로 `SEATS`처럼 업무상 조정 가능한 값은 편집 가능하게 만들 수 있다.

### 무엇인가

Editable Field Catalog는 ALV Field Catalog(컬럼별 표시/동작 설정표)에서 특정 컬럼의 `edit` 속성을 켜는 방식이다. Field Catalog는 `CL_GUI_ALV_GRID`가 내부 테이블을 화면 컬럼으로 그릴 때 참고하는 메타데이터다. 여기에 `edit = abap_true`를 지정하면 해당 컬럼은 표시 전용 셀이 아니라 입력 가능한 셀로 그려진다.

```abap
LOOP AT lt_fcat REFERENCE INTO DATA(lr_fcat).
  IF lr_fcat->fieldname = 'SEATS'.
    lr_fcat->edit = abap_true.
  ENDIF.
ENDLOOP.
```

하지만 `edit`만 켜면 "사용자가 입력할 수 있는 모양"만 생긴다. 프로그램이 변경 사실을 받으려면 Grid에 편집 이벤트도 등록해야 한다.

```abap
go_grid->register_edit_event(
  i_event_id = cl_gui_alv_grid=>mc_evt_modified
).
```

`mc_evt_modified`는 셀이 수정될 때 변경 이벤트가 발생하게 하는 설정이고, `mc_evt_enter`는 사용자가 Enter를 눌렀을 때 이벤트가 발생하게 하는 설정이다. 어떤 이벤트를 쓸지는 화면 UX에 따라 달라진다. 입력 즉시 검증이 필요하면 수정 이벤트를, 사용자가 값을 입력한 뒤 Enter로 확정하는 흐름이면 Enter 이벤트를 함께 고려한다.

### 어떻게 확인하는가

첫 번째 확인은 화면이다. 편집 모드를 켰을 때 `SEATS` 컬럼만 입력칸으로 바뀌어야 한다. `BOOKING_ID`, `CUSTOMER_ID`, `CONCERT_ID` 같은 키 컬럼은 계속 읽기전용이어야 한다. 이 차이가 보이지 않으면 Field Catalog 설정이 잘못되었거나 ALV가 다시 그려지지 않은 것이다.

두 번째 확인은 이벤트 준비다. `edit` 속성을 켰더라도 `register_edit_event`를 하지 않으면 사용자가 값을 바꾼 사실을 프로그램이 기대한 시점에 받지 못할 수 있다. L01에서는 아직 `data_changed` 핸들러를 자세히 다루지 않지만, "입력 가능 상태"와 "변경 이벤트 등록"이 둘 다 필요하다는 점을 확인한다.

::embed CH28-L01-S01 | Editable 컬럼 - 편집 모드 토글 | 360::

임베드에서는 `편집 모드` 버튼을 켜고 끄며 `SEATS` 컬럼만 input으로 바뀌는지 확인한다. 키 컬럼이 그대로 텍스트로 남는 것도 중요한 확인 포인트다. 학습자는 "입력 가능한 컬럼을 최소화한다"는 원칙을 눈으로 확인해야 한다.

### 실수와 주의

전체 Field Catalog에 일괄로 `edit = abap_true`를 주는 것은 위험하다. 사용자가 키 값을 바꾸면 기존 DB 행과 화면 행의 관계가 끊기고, 저장 시 insert처럼 동작하거나 잘못된 행을 덮어쓸 수 있다. 입력 가능 컬럼은 업무 규칙으로 허용된 값에 한정한다.

두 번째 실수는 `edit`만 켜고 편집 이벤트 등록을 빠뜨리는 것이다. 사용자는 값을 바꾸는데 프로그램은 변경 흐름을 놓친다. L02부터는 `data_changed`로 이 변경을 잡아 검증할 것이므로, L01에서는 `edit`와 `register_edit_event`를 한 쌍으로 기억한다.

마지막으로 입력칸이 보인다고 해서 값이 저장되는 것은 아니다. L01은 입력 가능한 화면을 만드는 단계다. 실제 검증은 L02/L05, 내부 테이블 반영과 저장 전 검증은 L06에서 다룬다.

### 체험형 학습 설계

학습 화면은 ALV 표와 설정 패널로 나눈다. 설정 패널에는 `SEATS 편집 가능`, `키 컬럼 보호`, `편집 이벤트 등록` 세 토글을 둔다. 기본값은 `SEATS 편집 가능=켜짐`, `키 컬럼 보호=켜짐`, `편집 이벤트 등록=켜짐`이다.

상태 패널은 네 줄로 표시한다. `Field Catalog: SEATS-edit = abap_true`, `Grid Event: mc_evt_modified 등록`, `입력 가능 셀: SEATS`, `보호 셀: BOOKING_ID, CONCERT_ID`처럼 현재 화면 설정을 문장으로 보여 준다. 학습자가 토글을 바꾸면 상태 문장이 즉시 바뀐다.

오류 체험 버튼도 둔다. `전체 컬럼 편집 허용` 버튼을 누르면 키 컬럼까지 input으로 바뀌고, 경고 패널에 "키 컬럼은 저장 대상 식별에 필요하므로 입력 가능하게 만들면 위험합니다"가 표시된다. `이벤트 등록 해제` 버튼을 누르면 입력칸은 남지만 로그 영역에 "값 변경 감지 준비 안 됨"이 표시된다.

### 정리

Editable ALV의 출발점은 Field Catalog에서 필요한 컬럼만 `edit`로 여는 것이다. 하지만 입력칸을 만드는 것과 변경을 감지하는 것은 다르다. `edit`는 셀을 입력 가능하게 만들고, `register_edit_event`는 사용자가 값을 바꾼 사실을 프로그램이 받을 준비를 한다. 키 컬럼은 보호하고, 업무상 수정 가능한 컬럼만 열어야 한다.

## CH28-L02 - DATA_CHANGED Event

### 왜 필요한가

사용자가 ALV 셀에 값을 입력할 수 있게 되면, 다음 문제는 "잘못된 값을 언제 막을 것인가"다. 예를 들어 좌석 수는 1부터 10까지만 허용한다고 하자. 사용자가 `99`, `0`, 빈 값, 문자를 넣었는데 저장 버튼을 누를 때까지 아무 피드백이 없다면 사용자는 여러 값을 잘못 입력한 뒤 한꺼번에 오류를 맞게 된다.

`data_changed` 이벤트는 이런 문제를 줄인다. 셀 값이 바뀐 직후 변경된 셀 목록을 받고, 그 자리에서 검증한다. 잘못된 값은 ALV 변경 프로토콜에 오류로 등록해 셀을 빨갛게 표시하고, 사용자가 어느 칸을 고쳐야 하는지 즉시 알 수 있게 한다.

### 무엇인가

`data_changed`는 editable grid에서 셀 값이 바뀔 때 발생하는 이벤트다. 핸들러는 `er_data_changed`를 받는다. 이 객체는 변경 프로토콜이다. 변경 프로토콜은 "어떤 셀이 바뀌었는지", "그 변경이 유효한지", "오류가 있으면 어느 셀에 어떤 메시지를 보여 줄지"를 ALV에 알려 주는 통로다.

```abap
METHODS on_data_changed
  FOR EVENT data_changed OF cl_gui_alv_grid
  IMPORTING er_data_changed.

METHOD on_data_changed.
  LOOP AT er_data_changed->mt_good_cells INTO DATA(ls_cell).
    IF ls_cell-fieldname <> 'SEATS'.
      CONTINUE.
    ENDIF.

    TRY.
        DATA(lv_seats) = CONV i( ls_cell-value ).
      CATCH cx_sy_conversion_no_number.
        er_data_changed->add_protocol_entry(
          i_msgid     = 'ZMSG'
          i_msgty     = 'E'
          i_msgno     = '001'
          i_msgv1     = '좌석 수는 숫자여야 합니다'
          i_fieldname = ls_cell-fieldname
          i_row_id    = ls_cell-row_id
        ).
        CONTINUE.
    ENDTRY.

    IF lv_seats < 1 OR lv_seats > 10.
      er_data_changed->add_protocol_entry(
        i_msgid     = 'ZMSG'
        i_msgty     = 'E'
        i_msgno     = '002'
        i_msgv1     = '좌석 수는 1부터 10까지입니다'
        i_fieldname = ls_cell-fieldname
        i_row_id    = ls_cell-row_id
      ).
    ENDIF.
  ENDLOOP.
ENDMETHOD.
```

`mt_good_cells`라는 이름 때문에 "이미 좋은 셀만 들어 있다"고 오해하기 쉽다. 여기서는 ALV가 변경 후보로 넘긴 셀을 순회하고, 업무 규칙에 맞는지 프로그램이 다시 판단한다고 이해하면 된다. 오류가 있으면 직접 셀 색을 바꾸려고 하지 말고 `add_protocol_entry`로 ALV에 알려야 한다.

### 어떻게 확인하는가

확인은 입력값별로 나눈다. `SEATS`에 `5`를 입력하면 오류 없이 통과해야 한다. `99`를 입력하면 범위 오류가 표시되어야 한다. `0`을 입력하면 최소값 오류가 표시되어야 한다. `A`나 빈칸을 입력하면 숫자 변환 오류가 표시되어야 한다.

두 번째 확인은 이벤트 로그다. 사용자가 값을 바꿀 때 로그에는 `data_changed`, `fieldname=SEATS`, `row_id`, `value`가 표시되어야 한다. 이 로그가 없으면 L01의 `register_edit_event` 또는 L02의 `SET HANDLER` 등록을 먼저 확인한다.

::embed CH28-L02-S01 | DATA_CHANGED - 셀 변경 즉시 검증 | 460::

임베드에서는 `SEATS` 값을 바꿀 때마다 로그가 남고, 1부터 10 밖의 값은 빨간 셀로 표시된다. 학습자는 "값을 바꾼다 -> 이벤트가 발생한다 -> 변경 프로토콜에 오류가 등록된다 -> ALV가 셀에 피드백을 준다"는 순서를 따라가야 한다.

### 실수와 주의

가장 큰 실수는 검증 실패를 `MESSAGE '오류' TYPE 'E'`로만 처리하려는 것이다. 일반 메시지는 사용자에게 문장을 보여 줄 수 있지만, 어느 셀이 문제인지 ALV가 알기 어렵다. Editable ALV에서는 셀 위치와 메시지를 함께 전달해야 하므로 `add_protocol_entry`가 필요하다.

두 번째 실수는 매번 전체 내부 테이블을 검사하는 것이다. `data_changed`는 "지금 바뀐 셀"을 빠르게 검증하는 자리다. 전체 정원 합계, 중복, 권한, 여러 행 간 관계처럼 무거운 규칙은 L06의 저장 전 검증에서 다시 다룬다.

세 번째 실수는 문자 입력을 고려하지 않는 것이다. 화면 입력값은 사용자가 타이핑한 값이므로 숫자로 기대하더라도 변환 실패 가능성이 있다. CH20에서 배운 예외 처리를 사용해 변환 오류를 프로토콜 메시지로 바꾸면 사용자는 덤프가 아니라 셀 오류를 보게 된다.

### 체험형 학습 설계

시뮬레이터에는 `SEATS` 입력칸, 이벤트 로그, 오류 프로토콜 패널을 함께 둔다. 사용자가 값을 입력하면 로그에 `data_changed fired`가 찍히고, 오류가 있으면 프로토콜 패널에 행 번호, 필드명, 입력값, 오류 메시지가 한 줄로 추가된다.

버튼은 `정상값 넣기`, `범위 밖 값 넣기`, `문자 넣기`, `빈칸 넣기` 네 개를 둔다. 각 버튼은 특정 입력 시나리오를 자동으로 만들어 준다. 정상값 버튼은 초록 통과 피드백을, 오류 버튼들은 빨간 셀과 메시지를 보여 준다.

상태는 `대기`, `변경 감지`, `검증 통과`, `프로토콜 오류`로 나눈다. 상태가 바뀔 때마다 코드 패널에서 `mt_good_cells`, `CONV i`, `add_protocol_entry` 줄이 차례로 강조된다. 입문자가 이벤트와 코드 실행 순서를 눈으로 따라가게 하기 위한 장치다.

### 정리

`data_changed`는 셀 값이 바뀐 직후 검증하는 이벤트다. `er_data_changed->mt_good_cells`에서 변경 셀을 확인하고, 잘못된 값은 `add_protocol_entry`로 ALV 변경 프로토콜에 등록한다. 이 레슨의 목표는 저장 전에 모든 업무 규칙을 끝내는 것이 아니라, 사용자가 방금 입력한 셀에 즉시 피드백을 주는 것이다.

## CH28-L03 - DATA_CHANGED_FINISHED Event

### 왜 필요한가

값이 바뀐 순간에는 그 값이 맞는지 빠르게 확인해야 한다. 하지만 모든 후처리를 그 순간에 해서는 안 된다. 예를 들어 좌석 수를 여러 번 수정하는 중에 매 입력마다 총합, 잔여석, 할인율, 상태 텍스트를 모두 다시 계산하면 화면이 불안정해지고 이벤트가 복잡해진다.

`data_changed_finished`는 변경이 확정되어 내부 테이블에 반영된 뒤 후처리를 수행하기에 적합하다. 검증은 L02의 `data_changed`, 파생값 재계산과 화면 갱신은 L03의 `data_changed_finished`로 나누면 이벤트 역할이 선명해진다.

### 무엇인가

`data_changed_finished`는 변경 처리가 끝난 뒤 발생하는 이벤트다. 핸들러는 `e_modified`를 받아 실제 변경이 있었는지 확인할 수 있다. 변경이 있었을 때만 합계나 잔여석 같은 파생값을 다시 계산하고, ALV를 stable refresh로 갱신한다.

```abap
METHODS on_changed_finished
  FOR EVENT data_changed_finished OF cl_gui_alv_grid
  IMPORTING e_modified.

METHOD on_changed_finished.
  IF e_modified <> abap_true.
    RETURN.
  ENDIF.

  CLEAR gv_total_seats.

  LOOP AT lt_booking INTO DATA(ls_booking).
    gv_total_seats = gv_total_seats + ls_booking-seats.
  ENDLOOP.

  go_grid->refresh_table_display(
    EXPORTING
      is_stable = VALUE #( row = abap_true col = abap_true )
  ).
ENDMETHOD.
```

`is_stable`은 CH21에서 배운 stable refresh 흐름이다. 사용자가 편집하던 행과 컬럼 위치를 최대한 유지하면서 화면을 다시 그리도록 도와준다. 변경 후처리에서 화면을 갱신할 때 커서 위치가 튀면 사용자는 입력을 이어가기 어렵다.

### 어떻게 확인하는가

`SEATS` 값을 `3`에서 `5`로 바꾸고 Enter를 누르거나 다른 칸으로 이동한다. 그 순간 이벤트 로그에는 `data_changed_finished`, `e_modified=true`, `total recalculated`가 표시되어야 한다. 총 좌석 합계도 변경 전보다 2 증가해야 한다.

반대로 값을 바꾸지 않고 셀을 지나가기만 했을 때는 후처리가 실행되지 않아야 한다. `e_modified`가 false인 상황에서 불필요하게 refresh를 반복하면 화면이 흔들리고 이벤트가 복잡해진다.

::embed CH28-L03-S01 | DATA_CHANGED_FINISHED - 합계 재계산 | 460::

임베드에서는 `SEATS`를 고친 뒤 확정할 때 총 좌석 합계가 바뀐다. 로그는 L02의 즉시 검증과 달리 "변경 완료 후 한 번" 실행되는 느낌을 보여 준다.

### 실수와 주의

`data_changed`와 `data_changed_finished`를 같은 목적으로 사용하면 코드가 꼬인다. `data_changed`는 변경 셀 검증, `data_changed_finished`는 변경 완료 후 후처리라고 나눈다. 검증 실패를 finished에서 늦게 처리하면 사용자는 이미 값이 들어간 것처럼 보인 뒤 오류를 보게 된다.

또 다른 실수는 후처리에서 값을 다시 바꾸고 refresh를 호출하면서 또 다른 변경 이벤트를 유발하는 것이다. 합계 표시용 변수나 파생 컬럼 갱신은 필요 최소한으로 수행하고, 사용자 입력값을 다시 덮어쓰는 코드는 조심해야 한다.

마지막으로 `e_modified`를 확인하지 않고 항상 재계산하면 성능과 UX가 나빠진다. 작은 예제에서는 차이가 없어 보여도, 실무 ALV는 행 수가 많고 후처리가 여러 서비스를 부를 수 있다.

### 체험형 학습 설계

학습 화면 상단에는 `총 좌석` 배지를 둔다. 사용자가 `SEATS`를 바꾸고 확정하면 배지가 증가/감소하고, 변경된 행은 짧게 강조된다. 로그에는 `data_changed`와 `data_changed_finished`를 다른 색으로 표시해 두 이벤트의 시점을 구분한다.

버튼은 `값 입력 중`, `Enter로 확정`, `변경 없이 이동` 세 가지 시나리오를 만든다. `값 입력 중`은 즉시 검증 로그만 보여 주고 합계는 아직 바뀌지 않게 한다. `Enter로 확정`은 합계 재계산과 stable refresh를 보여 준다. `변경 없이 이동`은 아무 후처리도 하지 않는 것이 정상임을 보여 준다.

피드백 패널에는 `내부 테이블 반영 전`, `내부 테이블 반영 후`, `화면 refresh 후` 세 상태를 차례로 표시한다. 입문자는 "화면에 타이핑한 값", "프로그램 내부 테이블 값", "다시 그린 ALV 화면"이 같은 것이 아니라 흐름을 가진다는 점을 이해해야 한다.

### 정리

`data_changed_finished`는 변경이 끝난 뒤 후처리를 하는 이벤트다. L02의 즉시 검증과 역할이 다르다. 변경이 실제로 있었는지 `e_modified`로 확인하고, 합계나 잔여석 같은 파생값을 계산한 뒤 stable refresh로 화면을 안정적으로 갱신한다.

## CH28-L04 - Cell Style 기반 입력 제어

### 왜 필요한가

L01에서는 컬럼 단위로 입력 가능 여부를 설정했다. 하지만 실무에서는 같은 컬럼이라도 행마다 규칙이 다르다. 예를 들어 `SEATS` 컬럼은 일반 예매 행에서는 수정 가능하지만, 이미 매진된 공연 회차나 취소 완료된 예매 행에서는 수정하면 안 된다.

이때 Field Catalog의 `edit`만으로는 부족하다. Field Catalog는 컬럼 전체 설정에 가깝다. 행과 셀마다 입력 가능 여부를 다르게 만들려면 Cell Style을 사용한다. 즉, 전체적으로는 `SEATS` 컬럼을 편집 가능하게 열고, 특정 행의 특정 셀만 style로 잠그는 방식이다.

### 무엇인가

Cell Style은 ALV 셀 단위의 표시/동작 속성을 담는 내부 테이블이다. 보통 출력 데이터 행 구조 안에 `LVC_T_STYL` 타입의 컴포넌트를 두고, Layout의 `stylefname`에 그 컴포넌트 이름을 지정한다. 그러면 ALV는 각 행의 style 정보를 읽어 특정 셀을 enabled 또는 disabled로 그린다.

```abap
LOOP AT lt_perf ASSIGNING FIELD-SYMBOL(<ls_perf>).
  DATA lv_style TYPE i.

  IF <ls_perf>-seatsocc >= <ls_perf>-capacity.
    lv_style = cl_gui_alv_grid=>mc_style_disabled.
  ELSE.
    lv_style = cl_gui_alv_grid=>mc_style_enabled.
  ENDIF.

  <ls_perf>-cellstyles = VALUE #(
    ( fieldname = 'SEATS' style = lv_style )
  ).
ENDLOOP.

ls_layout-stylefname = 'CELLSTYLES'.
```

여기서 중요한 구조는 두 단계다. 먼저 Field Catalog에서 `SEATS` 컬럼을 편집 가능하게 열어 둔다. 그 다음 행별 `cellstyles`에서 "이 행의 SEATS는 잠글지 열지"를 결정한다. 전체 허용과 예외 제어를 분리하는 것이다.

### 어떻게 확인하는가

매진이 아닌 행에서는 `SEATS` 셀이 입력칸이어야 한다. 매진 행에서는 같은 `SEATS` 컬럼이라도 입력칸이 잠겨야 한다. 화면에서 같은 컬럼의 어떤 행은 수정 가능하고 어떤 행은 읽기전용이면 Cell Style이 적용된 것이다.

두 번째 확인은 데이터 변경 후 style 재계산이다. 사용자가 상태를 매진으로 바꾸거나 잔여석이 0이 되는 입력을 하면, 해당 행의 `cellstyles`를 다시 계산하고 ALV를 갱신해야 한다. 데이터만 바뀌고 style을 다시 만들지 않으면 화면은 여전히 입력 가능하게 남을 수 있다.

::embed CH28-L04-S01 | Cell Style - 매진 행 입력 잠금 | 360::

임베드에서는 행의 매진/여석 상태를 토글하면 `SEATS` 셀이 잠기거나 풀린다. 학습자는 컬럼 하나가 아니라 "행의 상태에 따라 셀 하나가 달라진다"는 점을 확인한다.

### 실수와 주의

Cell Style을 쓰면서 Field Catalog의 `edit`를 꺼 두면 입력 제어가 기대처럼 보이지 않을 수 있다. 기본적으로 편집 가능한 컬럼을 열어 두고, 예외 셀을 disabled로 덮는 흐름을 잡는 것이 이해하기 쉽다.

두 번째 실수는 style 정보를 한 번만 만들고 끝내는 것이다. 행의 상태가 바뀌면 style도 바뀌어야 한다. 예를 들어 잔여석이 0이 되었는데 style을 다시 계산하지 않으면 사용자는 여전히 좌석 수를 고칠 수 있다고 느낀다.

세 번째 실수는 셀 잠금을 보안으로 착각하는 것이다. Cell Style은 사용자 입력을 막는 UI 제어다. 저장 전에는 L06처럼 전체 규칙을 다시 검증해야 한다. 악의적 조작, 동시 변경, 다른 프로그램에서의 변경은 UI 잠금만으로 막을 수 없다.

### 체험형 학습 설계

시뮬레이터는 회차 목록을 보여 주고 각 행에 `매진 토글` 버튼을 둔다. 사용자가 토글을 누르면 해당 행의 `SEATS` 셀이 disabled로 바뀌며, 상태 패널에 `mc_style_disabled`가 표시된다. 다시 여석 상태로 바꾸면 `mc_style_enabled`로 바뀐다.

화면 오른쪽에는 현재 행의 style 테이블을 보여 준다. 예를 들어 `fieldname=SEATS`, `style=mc_style_disabled` 한 줄이 나타나면, 아래 ALV에서 같은 행의 `SEATS` 셀이 잠긴다. 이렇게 데이터 구조와 화면 결과를 나란히 보여 준다.

진단 버튼은 `stylefname 누락`과 `style 재계산 누락` 두 개를 둔다. `stylefname 누락`을 누르면 style 테이블은 존재하지만 화면에 적용되지 않는 상태를 보여 준다. `style 재계산 누락`은 상태 값은 매진으로 바뀌었는데 셀은 그대로 열려 있는 모순을 보여 준다.

### 정리

Field Catalog의 `edit`는 컬럼 단위 입력 허용이고, Cell Style은 셀 단위 예외 제어다. 같은 `SEATS` 컬럼이라도 매진 행은 disabled, 일반 행은 enabled로 만들 수 있다. 데이터 상태가 바뀌면 style도 다시 계산해야 하며, UI 잠금은 저장 전 검증을 대신하지 않는다.

## CH28-L05 - Grid 입력값 검증과 오류 표시

### 왜 필요한가

L02에서는 변경 즉시 검증의 기본을 배웠다. L05에서는 사용자 경험을 더 구체화한다. 잘못된 입력을 막는 것만으로는 충분하지 않다. 사용자는 "어느 행, 어느 셀, 어떤 이유로 틀렸는지"를 알아야 고칠 수 있다. 특히 editable ALV는 여러 셀을 빠르게 고치는 화면이므로 오류가 한 곳이 아닐 수 있다.

오류 표시의 목표는 사용자를 혼내는 것이 아니라 다음 행동을 분명히 알려 주는 것이다. 셀은 빨갛게 표시하고, 오류 목록에는 메시지를 모아 보여 주고, 정상값으로 고치면 오류가 사라지는 흐름을 만들어야 한다.

### 무엇인가

Grid 입력값 검증은 `data_changed` 핸들러 안에서 변경 셀을 검사하고, 오류가 있으면 변경 프로토콜에 메시지를 등록하는 방식이다. `add_protocol_entry`는 오류 셀의 위치와 메시지 정보를 함께 넘긴다. `display_protocol`은 누적된 오류 목록을 사용자에게 보여 주는 데 사용한다.

```abap
METHOD on_data_changed.
  LOOP AT er_data_changed->mt_good_cells INTO DATA(ls_cell).
    IF ls_cell-fieldname <> 'SEATS'.
      CONTINUE.
    ENDIF.

    TRY.
        DATA(lv_seats) = CONV i( ls_cell-value ).
      CATCH cx_sy_conversion_no_number.
        er_data_changed->add_protocol_entry(
          i_msgid     = 'ZMSG'
          i_msgty     = 'E'
          i_msgno     = '003'
          i_msgv1     = '숫자를 입력하세요'
          i_fieldname = ls_cell-fieldname
          i_row_id    = ls_cell-row_id
        ).
        CONTINUE.
    ENDTRY.

    IF lv_seats < 1 OR lv_seats > 10.
      er_data_changed->add_protocol_entry(
        i_msgid     = 'ZMSG'
        i_msgty     = 'E'
        i_msgno     = '004'
        i_msgv1     = '1부터 10까지 입력하세요'
        i_fieldname = ls_cell-fieldname
        i_row_id    = ls_cell-row_id
      ).
    ENDIF.
  ENDLOOP.

  er_data_changed->display_protocol( ).
ENDMETHOD.
```

메시지 클래스는 CH15에서 배운 사용자 메시지 체계와 연결된다. ALV 프로토콜은 메시지 ID, 타입, 번호, 변수, 필드명, 행 ID를 받아 "어디가 왜 틀렸는지"를 화면에 표시한다. 단순한 `MESSAGE`보다 셀 기반 입력 화면에 적합한 이유가 여기에 있다.

### 어떻게 확인하는가

정상값과 오류값을 번갈아 입력한다. `5`를 입력하면 오류 목록이 비어 있어야 한다. `0`을 입력하면 최소값 오류가 보여야 한다. `11`을 입력하면 최대값 오류가 보여야 한다. `ABC`를 입력하면 숫자 형식 오류가 보여야 한다.

오류가 발생했을 때 확인할 것은 세 가지다. 셀이 빨갛게 보이는가, 오류 목록에 메시지가 추가되는가, 행/필드 위치가 맞는가. 오류 목록만 있고 셀 위치 표시가 없으면 사용자는 많은 행 중 어디를 고쳐야 할지 찾기 어렵다.

::embed CH28-L05-S01 | 입력 검증 - 오류 셀·목록 | 480::

임베드에서는 잘못된 값을 넣으면 오류 셀이 빨갛게 바뀌고 오류 목록에 메시지가 쌓인다. 정상값으로 고치면 오류 상태가 해소되는 흐름도 함께 확인한다.

### 실수와 주의

오류 메시지가 너무 추상적이면 사용자는 고칠 수 없다. "입력 오류"보다 "좌석 수는 1부터 10까지 입력하세요"가 낫다. 메시지는 사용자가 다음에 해야 할 행동을 포함해야 한다.

두 번째 실수는 오류를 등록하고도 저장 버튼을 그대로 통과시키는 것이다. L05의 프로토콜은 화면 단계의 피드백이고, L06에서는 저장 전에 다시 전체 검증을 해야 한다. 같은 규칙이 중복처럼 보이더라도 역할이 다르다. L05는 사용자 입력 편의, L06은 데이터 무결성 방어선이다.

세 번째 실수는 오류 목록을 무조건 팝업으로 띄워 입력 흐름을 방해하는 것이다. 화면 성격에 따라 하단 패널, 상태바, 팝업을 선택한다. 많은 셀을 연속 편집하는 화면에서는 하단 오류 목록이 더 편할 수 있다.

### 체험형 학습 설계

학습 화면은 ALV, 오류 목록, 선택된 오류 상세 패널로 구성한다. 오류 목록의 한 줄을 클릭하면 해당 ALV 셀로 포커스가 이동하고, 셀 테두리가 강조된다. 이렇게 "오류 메시지"와 "수정할 위치"를 연결한다.

버튼은 `0 입력`, `11 입력`, `문자 입력`, `정상값으로 수정`, `오류 목록 열기`를 둔다. 각 버튼은 프로토콜 항목의 생성과 제거를 보여 준다. 오류 카운터는 `0건`, `1건`, `2건 이상`으로 바뀌고, 저장 버튼은 오류가 있을 때 비활성 상태로 보이게 한다.

피드백 문구는 상태별로 다르게 한다. 오류 없음은 "저장 전 최종 검증으로 진행할 수 있습니다", 셀 오류는 "표시된 셀을 먼저 수정하세요", 형식 오류는 "숫자로 변환할 수 없는 값입니다"처럼 구체적으로 제공한다.

### 정리

Editable ALV의 검증은 사용자가 어느 셀을 어떻게 고쳐야 하는지 알려 주어야 한다. `add_protocol_entry`는 오류 메시지와 셀 위치를 함께 등록하고, `display_protocol`은 오류 목록을 보여 준다. L05의 목표는 사용자 입력을 친절하게 고치게 하는 것이며, 최종 저장 가능 여부는 L06에서 다시 판단한다.

## CH28-L06 - 변경 데이터 DB 반영 전 검증

### 왜 필요한가

화면에서 모든 셀이 정상처럼 보여도 DB에 바로 쓰면 안 된다. 사용자가 마지막 셀을 입력한 뒤 Enter를 누르지 않았을 수 있고, 다른 사용자가 같은 데이터를 먼저 바꿨을 수 있으며, 여러 행을 합쳐야만 알 수 있는 규칙이 있을 수 있다. 예를 들어 개별 행의 좌석 수는 1부터 10 사이지만, 전체 예약 좌석 합계가 공연 정원을 넘으면 저장하면 안 된다.

그래서 저장 버튼은 마지막 방어선이다. 저장 직전에 편집 중인 값을 내부 테이블로 반영하고, 전체 규칙을 다시 검증하고, 잠금과 DML, commit 경계를 명확히 처리해야 한다. CH28의 마지막 레슨은 화면 검증과 저장 검증을 분리하는 감각을 만드는 데 목적이 있다.

### 무엇인가

저장 전 흐름은 네 단계로 나눈다.

1. `check_changed_data( )`로 아직 셀에 머물러 있는 편집값을 내부 테이블에 반영한다.
2. 내부 테이블 전체를 대상으로 최종 업무 규칙을 검증한다.
3. 오류가 있으면 DB에 쓰지 않고 사용자에게 오류를 보여 준다.
4. 통과하면 CH24/CH25에서 배운 DML, 잠금, commit/rollback 경계에 따라 저장한다.

```abap
" 1) 마지막 편집값을 내부 테이블에 반영
go_grid->check_changed_data( ).

" 2) 저장 전 전체 규칙 검증
DATA(lv_has_error) = abap_false.

LOOP AT lt_booking INTO DATA(ls_booking).
  IF ls_booking-seats < 1 OR ls_booking-seats > 10.
    lv_has_error = abap_true.
    MESSAGE '좌석 수는 1부터 10까지 입력하세요.' TYPE 'I'.
    EXIT.
  ENDIF.
ENDLOOP.

IF lv_has_error = abap_true.
  RETURN.
ENDIF.

" 3) 통과한 경우에만 DB 반영
MODIFY zbooking FROM TABLE @lt_booking.

IF sy-subrc = 0.
  COMMIT WORK.
  MESSAGE '변경 데이터가 저장되었습니다.' TYPE 'S'.
ELSE.
  ROLLBACK WORK.
  MESSAGE '저장 중 오류가 발생했습니다.' TYPE 'E'.
ENDIF.
```

이 코드는 저장 흐름의 뼈대다. 실제 업무에서는 저장 대상 행만 추려야 하고, CH25에서 배운 잠금, 권한 확인, 동시 변경 처리, 오류 로그, 재조회 정책이 필요하다. 이 레슨에서는 그 모든 주제를 새로 깊게 확장하지 않고, editable ALV에서 DB 반영 직전 반드시 거쳐야 하는 순서를 익힌다.

### 어떻게 확인하는가

첫 번째 확인은 마지막 셀 편집값이다. 사용자가 `SEATS`에 값을 입력하고 커서가 아직 그 셀에 있는 상태에서 저장을 누른다. `check_changed_data( )`가 있으면 그 값이 내부 테이블에 반영되어 검증 대상이 된다. 없으면 마지막 입력이 빠진 채 저장될 수 있다.

두 번째 확인은 오류 저장 거부다. `SEATS=99` 같은 잘못된 값이 있으면 저장 버튼을 눌러도 `MODIFY`가 실행되지 않아야 한다. 오류 패널이나 메시지에는 어느 규칙이 깨졌는지 표시되어야 한다.

세 번째 확인은 정상 저장 흐름이다. 모든 값이 정상일 때만 `MODIFY`가 실행되고, `sy-subrc = 0`이면 `COMMIT WORK`로 확정한다. 실패하면 `ROLLBACK WORK`로 현재 LUW의 변경 요청을 취소하고 오류 메시지를 보여 준다.

::embed CH28-L06-S01 | 저장 전 검증 - 거부 vs MODIFY+COMMIT | 520::

임베드에서는 잘못된 값을 입력한 뒤 저장하면 거부 로그가 남고, 올바른 값으로 수정한 뒤 저장하면 `check_changed_data -> 전체 검증 -> MODIFY -> COMMIT` 흐름이 로그로 표시된다.

### 실수와 주의

가장 흔한 실수는 `check_changed_data( )`를 저장 버튼 앞에서 호출하지 않는 것이다. 사용자는 마지막 셀에 값을 입력했다고 생각하지만, 프로그램 내부 테이블에는 이전 값이 남아 있을 수 있다. 저장 직전에는 반드시 편집 중인 값을 반영한다.

두 번째 실수는 화면 검증을 최종 검증으로 착각하는 것이다. L02/L05의 검증은 사용자의 입력을 빨리 고치게 돕는다. 저장 검증은 전체 데이터 무결성을 지키는 마지막 단계다. 여러 행 합계, 중복, 권한, 잠금, DB 최신 상태는 저장 직전에 다시 확인해야 한다.

세 번째 실수는 `COMMIT WORK`를 너무 쉽게 호출하는 것이다. 공식 문서 기준으로 `COMMIT WORK`는 현재 SAP LUW를 닫고 변경 요청을 확정한다. 한 번 확정한 뒤에는 사용자가 화면에서 "취소"를 눌렀다고 DB 변경이 자동으로 되돌아가지 않는다. 따라서 검증, 잠금, DML 결과 확인이 끝난 뒤에만 commit한다.

### 체험형 학습 설계

시뮬레이터는 저장 버튼을 중심으로 다섯 단계 로그를 보여 준다. `check_changed_data 호출`, `마지막 편집값 내부 테이블 반영`, `전체 규칙 검증`, `오류면 저장 거부`, `정상이면 MODIFY+COMMIT` 순서다. 각 단계는 완료되면 체크 표시가 붙고, 실패 지점은 빨간색으로 멈춘다.

상태 패널은 `화면 값`, `내부 테이블 값`, `DB 반영 예정 값`을 나란히 보여 준다. 사용자가 셀에 값을 입력했지만 아직 확정하지 않은 상태에서는 화면 값과 내부 테이블 값이 다르게 보이게 한다. 저장 버튼을 누르면 `check_changed_data` 이후 두 값이 같아지는 것을 보여 준다.

버튼은 `오류값 저장 시도`, `정상값 저장`, `잠금 실패 시뮬레이션`, `DML 실패 시뮬레이션`을 둔다. 잠금 실패와 DML 실패는 CH25/CH24의 상세 내용으로 연결하되, 이 화면에서는 commit 전 실패를 어떻게 사용자에게 알려 주고 rollback 또는 저장 거부로 마무리하는지 보여 준다.

### 정리

Editable ALV의 저장은 입력칸에서 끝나지 않는다. 저장 직전에 `check_changed_data( )`로 마지막 편집값을 내부 테이블에 반영하고, 전체 규칙을 다시 검증한 뒤, 통과한 경우에만 `MODIFY`와 `COMMIT WORK`로 DB에 반영한다. 오류가 있으면 DB에 쓰지 않고 사용자에게 수정할 정보를 제공한다. 화면 검증은 편의이고, 저장 검증은 무결성의 마지막 방어선이다.
