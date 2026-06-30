# CH28_REWRITE - Editable Grid ALV와 입력 검증 v1

> 목적: `content/abap/CH28`의 6개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH28 전체 설계

CH28의 한 문장 목표는 "ALV 목록상에서 직접 데이터를 입력받도록 컬럼별 `edit` 필드를 구성하고, 입력 변경을 실시간 수집하는 `register_edit_event` 바인딩, 셀 변경 즉시 검증하는 `data_changed`와 파생값 재계산용 `data_changed_finished` 의 시점 격리, `LVC_T_STYL` 을 활용한 행/셀 단위 동적 입력 잠금, `add_protocol_entry`와 `display_protocol`을 결합한 에러 시각화, 그리고 저장 단추 격발 시 마지막 셀 입력 유실을 막는 `check_changed_data( )` 강제 반영과 최종 3단계 무결성 검증 파이프라인을 정립한다"이다.

IT 비전공자 입문자는 사용자가 마지막 셀을 입력 수정하고 포커스가 올려진 채 곧바로 [저장] 단추를 누를 때, 마지막 셀 데이터 버퍼가 갱신 Flush 되지 않아 이전 값 상태로 저장되는 유실 장애를 겪고, `data_changed` 와 `data_changed_finished` 의 물리 실행 시점(반영 전 검증 vs 반영 후 파생 계산)의 아키텍처 경계를 뒤섞어 finished 내벽에서 오류 검증을 태우다가 정합성 덤프를 터트린다.
또한, cell style 로 특정 셀 수정을 제어하려 들 때, 필드카탈로그에 해당 칼럼 자체의 `edit = abap_true` 선행 개방을 빼먹어 먹통을 내고, 입력값 검증 실패 시 셀 하이라이트를 생략한 채 쌩 팝업만 난사해 UX 를 파괴한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **Editable Field Catalog**: 키 필드는 보호하고, 수정 가능한 컬럼(`SEATS`)만 `edit = abap_true` 로 연 뒤 `register_edit_event` 로 변경 감지 어댑터 바인딩.
2. **mc_evt_modified vs enter**: 값을 치는 찰나에 이벤트를 격발하는 modified 와, 엔터를 누를 때 격발하는 enter 의 UX 흐름 구분.
3. **DATA_CHANGED 반영 전 검증**: 아직 데이터가 내부 테이블에 확정 적재되기 '전' 바뀐 임시 셀 후보(`mt_good_cells`)를 낚아채 정당성을 체크하는 `data_changed` 기동.
4. **숫자 형변환 예외 덤프 방어**: 사용자가 입력 필드에 '한글' 이나 '공백' 을 쳤을 때 수량 변환하다 터지는 덤프를 막기 위해, **`TRY CATCH` 변환 가드**를 씌워 `add_protocol_entry` 오류로 안전 치환.
5. **DATA_CHANGED_FINISHED 반영 후 후처리**: 변경이 테이블에 완수된 '후' 트리거되는 finished 시점에서만 **총합 계산 및 stable refresh** 를 기동하는 시점 격리 수립.
6. **Cell Style 동적 제어**: Layout 에 `stylefname = 'CELLSTYLES'` 를 매핑하고, 매진 행의 수량은 `mc_style_disabled` 로 잠그고 일반 행은 `mc_style_enabled` 로 여는 동적 제어.
7. **에러 2단 시각화**: `add_protocol_entry` 로 셀에 빨간 하이라이트를 칠하고, `display_protocol` 로 하단 오류 목록 스풀을 한 번에 노출하는 친절한 피드백 장착.
8. **check_changed_data( ) 강제 Flush**: 저장 로직 1순위에 `check_changed_data( )` 를 강격발하여 마지막 입력 중인 셀 버퍼를 안전 회수하는 가드 장착.
9. **최종 3단계 무결성 검증**: 화면 입력 편의를 넘어 DB DML / Lock / Commit 직전 전체 무결성을 최종 재스캔 판정하는 백엔드 방어선 완성.

---

## CH28-L01 - Editable Field Catalog 설정

### 왜 필요한가

우리가 이전 이벤트 챕터에서 배웠던 리포트들은 사용자가 행을 체크해 고르고 [예매 취소] 버튼을 누르는 등의 간접 제어만 지원했다.
하지만 수량이 나 예매 좌석 번호처럼 단순한 필드 한두 개를 고쳐야 하는 업무 현장에서는 이 방식이 너무 번거롭다.
- 사용자가 표의 셀을 마우스로 클릭해 **입력창처럼 쌩으로 숫자를 쳐서 고치고(Edit)** 싶어 한다.
하지만 ALV 그리드의 필드카탈로그에 아무 설정을 가하지 않으면, 모든 셀은 콘크리트 벽처럼 굳어있어 마우스 커서조차 들어가지 않는다.
이때 그렇다고 칼럼 전체를 아무 생각 없이 입력창으로 훌러덩 다 열어젖히면, 사용자가 기본키인 예매번호(`booking_id`)나 콘서트ID 같은 절대 보존 필드까지 마음대로 수정해 버려 화면 행과 백엔드 DB 레코드의 매핑 결합이 끊기는 파괴 사고가 터진다.

**절대 수정되어선 안 될 키 필드는 철저히 잠가두고, 업무상 수정이 허용된 특정 컬럼만 입력 셀로 개방하며, 화면의 변경 신호가 백엔드로 전달되도록 이벤트를 바인딩하는 기술**이 필요하다. 그것이 **Editable Field Catalog** 의 설정이다.

### 무엇인가

#### 1. edit = abap_true (편집 컬럼 개방)
- Field Catalog 를 조립할 때 특정 필드에 주는 편집 개방 전원이다. 이 속성이 켜진 컬럼의 셀들만 회색 보호막이 걷히고 하얀색 입력 상자로 렌더링되어 열린다. (키 필드는 절대로 켜선 안 된다.)

#### 2. register_edit_event (편집 이벤트 어댑터 바인딩)
- *화면 입력칸 개설과 변경 감지를 이어주는 어댑터 장치다.*
- 화면에서 사용자가 키보드로 값을 타자쳐서 변경했을 때, 그 변경 격발 신호를 백엔드 그리드 런타임 엔진에 노크해 등록하는 메서드다.
- **mc_evt_modified**: 사용자가 셀에 값을 치고 다른 셀로 마우스 클릭을 이동하거나 마우스 포커스를 바꾸는 **그 즉시(실시간)** 변경을 보고하도록 등록한다.
- **mc_evt_enter**: 사용자가 값을 친 뒤 반드시 **키보드 Enter 키**를 쳐서 물리 확정을 날렸을 때에만 변경을 보고하도록 등록한다.

### 어떻게 확인하는가

특정 seats 칼럼만 edit 를 열고 modified 이벤트를 바인딩하는 소스를 검증한다.

```abap
" 1. [Field Catalog 상에서 seats 컬럼만 edit 스위치 온]
LOOP AT lt_fcat REFERENCE INTO lr_fcat.
  IF lr_fcat->fieldname = 'SEATS'.
    lr_fcat->edit = abap_true. " 이 컬럼만 하얀색 입력칸으로 해방!
  ENDIF.
ENDLOOP.

" ... set_table_for_first_display 로 그리드를 최초 렌더링한 직후 ...

" 2. [★ 편집 이벤트 바인딩 어댑터 격발]
go_grid->register_edit_event(
  EXPORTING
    i_event_id = cl_gui_alv_grid=>mc_evt_modified " 실시간 포커스 아웃 시 변경 접수!
).
```

#### 체험/시뮬레이터 설계 (Editable 컬럼 토글)
- **프로세스 플로우**:
  1. 학습자가 [예매번호, seats 필드가 모두 회색 음영으로 굳은 표]를 본다.
  2. [seats edit = ON] 레버를 당긴다. seats 줄만 하얀색 입력 필드로 촥 전환된다. 예매번호는 철저히 회색 락으로 유지된다.
  3. 값을 입력창에 적고 엔터를 친다. [register_edit_event OFF] 인 상태면 백엔드에 "무반응" 경보가 뜬다.
  4. [modified 바인딩 ON] 을 켜자, 값을 치고 옆 칸을 누르는 즉시 "변경 접수됨!" 파란 신호등이 반짝이는 피드백을 감상한다.
- **상태 및 데이터**:
  - `booking_id 키 필드까지 edit = true 로 켜서 빌드한 상태` -> 코드 리뷰 경고: `Key column edit-enabled. Primary key consistency broken danger` 적색 사이렌 작동.
- **피드백**: 키 필드는 UI 단에서 영구 잠금 상태로 수호하고, 오직 가변 업무 필드만 선별 개방하는 것이 철칙임을 인지한다.

### 실수/주의

- **필드카탈로그에 edit = true 만 열심히 세팅해 두고, register_edit_event 호출을 누락**:
  - 이 실수 시 화면에는 하얀색 입력창이 이쁘게 뚫려 사용자가 타자까지 잘 쳐지는데, 아무리 값을 고치고 쌩 쇼를 해도 백엔드 클래스 이벤트 핸들러는 변경 신호를 전혀 전달받지 못해 수정 데이터가 몽땅 증발 유실된다.
  - **입력창 개설과 이벤트 등록은 무조건 1+1 한 쌍 세트임을 수호해야 한다.**

### 정리

- Field Catalog 의 **`edit`** 필드는 특정 칼럼을 입력 상자로 개방한다.
- 키 필드는 절대 열어선 안 되며, 오직 가변 칼럼만 `edit = abap_true` 를 준다.
- **`register_edit_event`** 메서드를 쏴주어야만 화면 변경 신호가 백엔드로 이송된다.

---

## CH28-L02 - DATA_CHANGED Event

### 왜 필요한가

수정 이벤트를 바인딩했다.
근데 이번에는 입력된 값의 '즉각적인 무결성 거절' 이 문제다.
" 사용자가 좌석 수 입력창에 실수로 키보드를 잘못 눌러 '99' 나 '한글' 혹은 '0' 을 치고 Enter 를 쳤다.
그럼 그 찰나에 즉시 "야, 좌석 수는 10석이 최대고 무조건 숫자여야 해!" 라고 셀을 빨갛게 물들여 막아야 한다."
이 즉각적인 가드 없이 그냥 변경을 통과시키면, 사용자는 10개 필드를 다 엉망진창으로 쳐서 저장을 누른 뒤에야 한꺼번에 쏟아지는 오류 세례를 보고 짜증을 내며, 엉뚱한 한글 텍스트 변환 시도가 백엔드 클래스에서 형변환 덤프를 터트려 장비를 중단시킨다.

**값이 바뀐 그 찰나(DATA_CHANGED)에 난입하여, 사용자가 타이핑해 전달한 임시 버퍼 값을 1:1 선제 스캔하고, 숫자가 아니거나 범위를 넘어서면 즉각 오류 징표를 박아 저장을 차단하는 기술**이 필요하다. 그것이 **DATA_CHANGED Event** 의 장착이다.

### 무엇인가

#### 1. data_changed 이벤트
- 사용자가 값을 고치고 포커스를 잃거나 엔터를 치는 그 딱 '변경 격발 찰나' 에, 실제 내부 데이터 테이블에 값이 써지기 **'직전(반영 전)'** 에 기동하는 검증 전용 이벤트다.

#### 2. er_data_changed (변경 프로토콜 컨테이너)
- *변경 전 임시 데이터와 오류 보고서를 싣고 다니는 우편차다.*
- **mt_good_cells**: 이름은 good(좋은) 이지만 아직 좋은 게 아니다. **"사용자가 화면에서 요렇게 고쳤다고 신청해 온 임시 변경 후보 리스트"** 다. 이 테이블을 스캔하며 유효성 검사를 집행한다.
- **add_protocol_entry**: 검증 실패 시, "몇 번째 줄, 무슨 칼럼에, 요런 에러 메시지를 박아달라" 고 프로토콜 상자에 오류 징표를 쑤셔 넣는 메서드다. 이 징표가 박히면 ALV 엔진은 해당 셀 테두리를 빨간색 락으로 채워 저장을 강제 홀딩한다.

#### ⚠️ [ 숫자 형변환 오류 시 터지는 런타임 덤프 예방 가드 명세]
- *입력 검증 시 비전공자나 초보들이 100% 실수하여 시스템을 셧다운시키는 형변환 덤프 장벽이다.*
- 사용자가 수량 칸에 'ABC' 나 공백을 치면, 백엔드 핸들러는 `CONV i( ls_cell-value )` 변환 연산을 타게 된다. 
- **이때 문자가 숫자로 변환되지 못하므로 아바 엔진은 즉각 예외 덤프를 터트리고 폭사한다.**
- **방어선 (TRY CATCH)**: 반드시 변조 스캔 시 **`TRY. CONV i( ... ) CATCH cx_sy_conversion_no_number.`** 가드를 씌워, 변환 에러 검출 시 덤프를 내는 대신 `add_protocol_entry` 에 "숫자만 기입해라" 고 오류 징표를 적고 `CONTINUE` 로 다음 셀로 수습 탈출해야 시스템이 살 수 있다.

### 어떻게 확인하는가

data_changed 핸들러를 정의하고 TRY CATCH 덤프 가드와 add_protocol_entry 를 엮는 소스를 검증한다.

```abap
CLASS lcl_alv_handler DEFINITION.
  PUBLIC SECTION.
    " er_data_changed 프로토콜 객체를 수령하는 data_changed 핸들러!
    METHODS on_data_changed
      FOR EVENT data_changed OF cl_gui_alv_grid
      IMPORTING er_data_changed.
ENDCLASS.

CLASS lcl_alv_handler IMPLEMENTATION.
  METHOD on_data_changed.
    " 1. [임시 변경 신청 후보 순회]
    LOOP AT er_data_changed->mt_good_cells INTO DATA(ls_cell).
      IF ls_cell-fieldname <> 'SEATS'. CONTINUE. ENDIF.

      " 2. [★ 숫자 형변환 덤프 방어선 작동]
      TRY.
          DATA(lv_seats) = CONV i( ls_cell-value ).
        CATCH cx_sy_conversion_no_number.
          " 문자를 입력했으면 덤프 내지 말고 프로토콜에 에러 박고 탈출!
          er_data_changed->add_protocol_entry(
            i_msgid     = 'ZMSG_ACAD' i_msgty = 'E' i_msgno = '009'
            i_fieldname = ls_cell-fieldname
            i_row_id    = ls_cell-row_id
          ).
          CONTINUE. " 프로그램 폭사 방지 및 다음 루프 진행!
      ENDTRY.

      " 3. [비즈니스 값 범위 가드]
      IF lv_seats < 1 OR lv_seats > 10.
        er_data_changed->add_protocol_entry(
          i_msgid     = 'ZMSG_ACAD' i_msgty = 'E' i_msgno = '010'
          i_fieldname = ls_cell-fieldname
          i_row_id    = ls_cell-row_id
        ).
      ENDIF.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (DATA_CHANGED 즉시 검증기)
- **프로세스 플로우**:
  1. 학습자가 seats 입력창에 [한글]을 적고 엔터를 친다.
  2. 백엔드에서 `CONV i` 가 작동하는 찰나 [TRY CATCH 가드 OFF] 면 덤프 폭사 번개가 친다.
  3. [가드 ON] 을 켜자, 덤프가 수습되고 seats 셀 테두리에 [빨간색 에러 라인]이 지잉 칠해지며 키보드 입력 포커스가 묶이는 피드백을 감상한다.
  4. 정상 숫자 '5' 를 적자, 빨간 테두리가 스르륵 풀려 녹색으로 수습되는 모션을 확인한다.
- **상태 및 데이터**:
  - `오류를 er_data_changed->add_protocol_entry 에 적지 않고 MESSAGE ... TYPE 'E' 로 때린 상태` -> 런타임 결과: `Error message shown in popup but cell is not red highlighted. User confused` 하이라이트.
- **피드백**: data_changed 의 생명은 `add_protocol_entry` 를 통한 오류 셀의 위치 표식 및 덤프 가드에 있음을 이해한다.

### 실수/주의

- **data_changed 이벤트 메서드 내에서 모든 예약 내역의 총합 누적 연산이나 화면 Refresh_table_display( ) 코드를 난사**:
  - 이 메서드는 사용자가 키보드 자판을 칠 때마다 임시 상태에서 도는 예민한 검문소다. 이 안에서 무거운 전체 루프 연산이나 리프레시 새로고침을 격발하면 화면 커서가 탭 칠 때마다 덜덜덜덜 떨리는 화면 지연(Lag) 버그를 낸다.
  - **이곳은 오직 바뀐 그 셀 하나만 빠르게 검사해 에러 징표만 박는 곳이며, 갱신 및 연동 계산은 다음 레슨인 `data_changed_finished` 로 넘겨야 한다.**

### 정리

- **`data_changed`** 는 값이 실제 내부 테이블에 반영되기 '전' 변경 후보를 검증한다.
- **`mt_good_cells`** 루프 순회 시 **`TRY CATCH`** 를 물려 문자/공백 변환 덤프를 방어한다.
- 오류 발견 시 **`add_protocol_entry`** 를 통해 해당 셀을 빨갛게 잠가 잠금 조치한다.

---

## CH28-L03 - DATA_CHANGED_FINISHED Event

### 왜 필요한가

data_changed 선제 검증을 달았다.
그런데 이번에는 한 셀의 값 입력이 무사히 완수된 뒤, "그 수정 수량에 맞춰 표 하단의 '총 예약 좌석 수 합계' 나 '예매 상태 파생값' 을 자동으로 다시 누적 계산해서 화면을 이쁘게 새로 고침" 하는 연동이 꼬인다.
- 이 연동 누적 재계산 로직을 방금 전 '반영 전 검증(data_changed)' 에 같이 엮었다.
사용자가 값을 치는 도중 아직 검증이 다 통과되지도 않은 임시 에러 값을 가지고 총합을 마구 더해버려, 화면 하단 총합에 0이나 999석 같은 말도 안 되는 파손 합계가 깜빡거리며 나타나 뷰를 오염시킨다.

**임시 변경 후보가 모든 검문소 가드를 무사히 통과해 '내부 테이블 데이터(mt_booking)에 안전하게 반영 완료된 직후(DATA_CHANGED_FINISHED)' 에 비로소 격발하여, 확정된 정합 데이터를 가지고 파생값 누적 재계산과 stable 리프레시를 집행하는 기술**이 필요하다. 그것이 **DATA_CHANGED_FINISHED Event** 의 격리다.

### 무엇인가

#### 1. data_changed_finished 이벤트
- 입력된 임시 데이터가 모든 검증을 마치고 내부 테이블에 **'반영 완료된 직후(반영 후)'** 에 기동하는 연동/재계산 전용 이벤트다.

#### 2. e_modified (실제 변경 발생 여부)
- *불필요한 렌더링 낭비를 줄이는 효율성 기어다.*
- 사용자가 값을 고쳤으나 이전 값과 동일하거나, 검증에 실패해 걸러져서 **실제 내부 데이터 변조가 단 1글자도 일어나지 않았다면 `abap_false` 로 분기하여 무의미한 재계산 낭비를 차단**해 준다.

#### 3. stable refresh
- **`refresh_table_display( is_stable )`**: 파생값을 다 재계산한 뒤 화면을 갱신해 줄 때, **사용자가 편집하던 그 행과 그 컬럼 스크롤 포커스가 툭 튕겨서 맨 첫 줄로 도망가지 않도록 그 자리에 꼭 묶어 고정(Stable)** 한 채 화면만 조용히 갱신해 주는 위생 셋업이다.

### 어떻게 확인하는가

data_changed_finished 수신 메서드를 짜고 e_modified 체크 후 stable refresh 를 물리는 소스를 검증한다.

```abap
CLASS lcl_alv_handler DEFINITION.
  PUBLIC SECTION.
    METHODS on_changed_finished
      FOR EVENT data_changed_finished OF cl_gui_alv_grid
      IMPORTING e_modified.
ENDCLASS.

CLASS lcl_alv_handler IMPLEMENTATION.
  METHOD on_changed_finished.
    " 1. [실제 변경 발생 검문]
    " 바뀐 게 전혀 없다면 후처리 연산을 가동하지 않고 퇴출!
    IF e_modified <> abap_true. RETURN. ENDIF.

    " 2. [파생값 누적 재계산 집행]
    " 내부 테이블 mt_booking 에 이미 seats 가 안착된 상태이므로 루프로 안전 누적!
    CLEAR gv_total_seats.
    LOOP AT mt_booking INTO DATA(ls_book).
      gv_total_seats = gv_total_seats + ls_book-seats.
    ENDLOOP.

    " 3. [★ stable refresh 포커스 고정 철칙]
    DATA(ls_stbl) = VALUE lvc_s_stbl( row = abap_true col = abap_true ).
    mo_grid->refresh_table_display(
      EXPORTING
        is_stable = ls_stbl " 내가 고치던 그 행, 그 칼럼 포커스 락 유지!
    ).
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (합계 재계산기)
- **프로세스 플로우**:
  1. 학습자가 seats 값들을 본다. 하단에 [총합 = 10석] 전광판이 있다.
  2. 2번 행 seats 를 '5' 로 고치고 엔터를 친다.
  3. [data_changed_finished] 기어가 돌며, 내부 테이블 반영을 확인하고 루프를 돌아 전광판 값을 [총합 = 13석] 으로 지잉 갱신한다.
  4. 이때 [Stable OFF] 면, 스크롤바가 휙 튕겨서 맨 첫 행으로 가버려 작업 위치를 잃는다. [Stable ON] 을 켜자 포커스가 2번 행에 자석처럼 찰딱 고정된 채 숫자만 바뀌는 유려한 피드백을 감상한다.
- **상태 및 데이터**:
  - `e_modified 검사를 빼먹어 값 변경이 없는데도 리프레시를 난사한 상태` -> 런타임 결과: `Redundant screen redraws triggered. performance warning` 하이라이트.
- **피드백**: 검사 가드(`data_changed`)와 반영 후 재계산(`finished`)은 시점과 책임이 완전히 동떨어진 남남임을 각인한다.

### 실수/주의

- **data_changed_finished 내벽 안방에서 사용자의 입력 값을 다른 강제 고정 값으로 변조 수정하는 EML 이나 쿼리를 격발**:
  - 이미 내부 테이블 반영이 다 끝나서 완료된 시점인데 여기서 값을 억지로 또 비틀어버리면, 무한 루프 변경 이벤트가 순환 격발되어 백엔드 호출 스택 오버플로우 덤프가 나며 마비된다.
  - **finished 내에서는 오직 파생값(총합, 상태)의 '종속적 읽기 재계산' 만 수행해야지, 입력 필드 원본을 여기서 강격발 수정해선 안 된다.**

### 정리

- **`data_changed_finished`** 는 변경이 내부 테이블에 반영 완료된 '후' 에 도는 후처리 단상이다.
- **`e_modified`** 필터를 걸어 무의미한 헛돌기 연산과 리프레시 낭비를 격퇴한다.
- 갱신 시에는 사용자 포커스를 사수하기 위해 반드시 **`is_stable`** 구조체를 물려 리프레시한다.

---

## CH28-L04 - Cell Style 기반 입력 제어

### 왜 필요한가

data_changed_finished 연동까지 마스터했다.
그런데 이번에는 같은 컬럼 내에서의 행별 동적 입력 락 제어가 문제다.
- " seats(수량) 컬럼을 필드카탈로그에서 `edit = true` 로 열었다.
그런데 비즈니스 룰 상, '이미 매진되었거나 취소 승인 완료된 예매 행' 은 좌석 수 수정을 못 하게 셀을 철컥 잠가버려야 하고, '대기 중인 예매 행' 만 seats 수정을 허용하고 싶다."
기존 필드카탈로그 `edit` 는 컬럼 전체를 켜거나 끄는 전체 통제 기능뿐이어서, 매진된 행의 셀만 콕 찝어 잠그는 동적 행 단위 핀포인트 제어가 불가능하다. 
그렇다고 그냥 다 열어두면 매진 예약 건에 사용자가 낙서하듯 수량을 바꾸는 논리 파괴가 일어난다.

**필드카탈로그로 컬럼은 넓게 열어두되, 데이터 행마다 심어둔 스타일 테이블(LVC_T_STYL)을 훑어서 '매진 행은 mc_style_disabled (수정 불가)', '대기 행은 mc_style_enabled (수정 허용)' 로 행별 셀 잠금을 동적으로 씌우는 기술**이 필요하다. 그것이 **Cell Style 기반 동적 입력 제어**다.

### 무엇인가

#### 1. Cell Style 기반 동적 편집 제어
- [SALV/Grid ALV 표시 제어 심화](CH21-L05.html)에서 배웠던 셀 색상/스타일 구조체 기술을 입력 제어에 응용하는 기술이다.
- **cl_gui_alv_grid=>mc_style_disabled**: 해당 셀만 키보드 입력이 안 들어가게 회색 락(Read-only)을 동적으로 씌운다.
- **cl_gui_alv_grid=>mc_style_enabled**: 해당 셀만 하얗게 열어 수정 가능하게 해방한다.

#### ⚠️ [ cell style 동적 잠금 시 필드카탈로그 edit=true 선행 지정 의무 명세]
- *입문자들이 소스를 다 짜놓고 셀이 왜 안 열리냐며 좌절하는 아바 레이아웃 우선순위 제약이다.*
- **아무리 행별 cellstyles 테이블에 `mc_style_enabled` 를 심고 용을 써도, 애초에 Field Catalog 에서 해당 칼럼 전체에 `edit = abap_true` 를 열어두지 않았다면, cell style 은 무용지물이 되어 컬럼 전체가 영구 철벽 잠금으로 굳어버린다.**
- **우선순위 철칙**: 1단계로 필드카탈로그 `edit = true` 로 **칼럼 대문을 활짝 열어주는 것이 선행**되어야 하며, 2단계로 cell style 을 통해 **개별 행 단위로 disabled 락 예외**를 입히는 방식으로 조립해야 정상 작동한다.

### 어떻게 확인하는가

seats 컬럼 edit 를 열어둔 채, 매진 여부에 따라 mc_style_disabled 스타일을 심어 레이아웃 매핑하는 소스를 검증한다.

```abap
" 1. [필드카탈로그 seats edit = true 선행 개방 철칙!]
lr_fcat->fieldname = 'SEATS'. lr_fcat->edit = abap_true. APPEND lr_fcat TO lt_fcat.

" 2. [행별 데이터 순회 돌며 매진 행에 disabled 락 장착]
LOOP AT lt_perf ASSIGNING FIELD-SYMBOL(<ls_perf>).
  DATA: lt_style TYPE lvc_t_styl,
        lv_mode  TYPE i.
        
  IF <ls_perf>-seatsocc >= <ls_perf>-capacity.
    " 만석이면 수정 못 하게 disabled 락 지정!
    lv_mode = cl_gui_alv_grid=>mc_style_disabled.
  ELSE.
    " 여유가 있으면 수정 가능하게 enabled 해방!
    lv_mode = cl_gui_alv_grid=>mc_style_enabled.
  ENDIF.

  " cellstyles 딥 구조체에 seats 필드 타깃 스타일 삽입!
  APPEND VALUE #( fieldname = 'SEATS' style = lv_mode ) TO lt_style.
  <ls_perf>-cellstyles = lt_style.
ENDLOOP.

" 3. [레이아웃에 cellstyles 필드명 연동 낙찰!]
ls_layout-stylefname = 'CELLSTYLES'.
```

#### 체험/시뮬레이터 설계 (Cell Style 동적 잠금판)
- **프로세스 플로우**:
  1. 학습자가 [1번 행 (잔여석 0 - 매진)] 과 [2번 행 (잔여석 10 - 여유)] seats 컬럼을 본다.
  2. [Field Catalog edit = OFF] 인 채로 시뮬레이션한다. 두 행의 seats 가 전부 회색으로 굳어 입력이 거부된다.
  3. [Field Catalog edit = ON] 을 켠다. 
  4. [Cell Style 적용] 을 가동하자, 1번 행 seats 만 회색 음영 락(`mc_style_disabled`)이 씌워져 잠기고, 2번 행 seats 은 하얀색 입력칸(`mc_style_enabled`)으로 해방되어 깜빡거리는 개별 행 핀포인트 제어 비주얼 피드백을 감상한다.
- **상태 및 데이터**:
  - `매진 상태가 바뀐 뒤 cellstyles 테이블 재계산을 누락한 상태` -> 런타임 결과: `Seats sold out but input field remains open. Logical violation` 하이라이트.
- **피드백**: 데이터의 변화가 생기면 cell style 테이블도 즉시 재계산해 리프레시해주어야 화면 락과 데이터 락이 싱크됨을 체득한다.

### 실수/주의

- **Cell Style 을 걸어두고 든든하다고 느껴서, 뒷단 저장 로직의 무결성 검증을 전면 생략**:
  - Cell Style 은 어디까지나 화면 화면에서 편리하게 여닫는 **'UI 단 프론트엔드 제어'** 일 뿐이다. 
  - 해커나 악의적인 사용자가 RFC 함수를 쌩으로 찌르거나 디버거로 값을 변조해 들어오면 UI 락은 맥없이 우회 붕괴되므로, **최종 저장 PAI 로직에는 반드시 이와 별개로 백엔드 무결성 검사 가드를 2중으로 단단히 채워야 안전**하다.

### 정리

- Field Catalog `edit` 은 **컬럼 전체**를 열고, Cell Style 은 **셀 단위** 예외를 제어한다.
- **`cl_gui_alv_grid=>mc_style_disabled`** 를 심어 특정 행 셀만 회색으로 잠근다.
- Layout 에 **`stylefname`** 변수명을 테이블 스타일 칼럼명과 도킹 결합한다.

---

## CH28-L05 - Grid 입력값 검증과 오류 표시

### 왜 필요한가

동적 잠금까지 마스터했다.
그런데 이번에는 여러 개의 입력 오류가 사방에서 터졌을 때 사용자에게 알리는 피드백 UX 가 엉망이다.
- " 사용자가 5개 행의 수량을 전부 '0' 이나 '999' 로 엉터리 수정했다."
이때 1번째 에러를 검출하자마자 `MESSAGE '수량 오류!' TYPE 'E'` 쌩 팝업 경고창을 쾅 띄우고 강제 정지해 버리면, 사용자는 팝업을 닫고 고치고 엔터 치면 2번째 팝업이 또 쾅 뜨고, 닫고 치면 3번째가 또 뜨는 등 '끝없는 팝업창 지옥' 에 갇혀 모니터를 부수고 싶어진다.
정확히 어느 줄의 어느 칼럼 칸이 왜 틀렸는지 **셀 테두리를 빨갛게 하이라이트** 칠하고, **오류 메시지들을 예쁘게 스풀 목록으로 모아서** 화면 하단에 촥 제공해 주어야 사용자가 한눈에 훑어보고 고치기 편하다.

**틀린 셀의 칼럼명과 행 위치를 에러 내용과 결합해 누적 프로토콜(add_protocol_entry)에 담고, 검문이 완료되면 오류 스풀 판넬(display_protocol)을 하단에 한 번에 노출하여 다중 에러를 유려하게 피드백하는 기술**이 필요하다. 그것이 **Grid 입력 오류 표시** 다.

### 무엇인가

#### 1. add_protocol_entry (오류 누적 도장)
- er_data_changed 프로토콜 상자에 오류 행 인덱스(`i_row_id`), 에러 칼럼 필드명(`i_fieldname`), 그리고 메시지 클래스 ID 와 에러 텍스트를 정밀 타격하여 기록하는 메서드다. (여기에 담긴 셀은 ALV 가 알아서 빨간 테두리를 칠하고 입력 고정을 건다.)

#### 2. display_protocol( ) (오류 스풀 노출 전원)
- **프로토콜 상자에 누적 적재한 모든 다중 에러 메시지 목록을 화면 하단에 깔끔한 전용 스풀 트레이(Error Spool) 판넬로 한 번에 개방 노출해 주는 최종 렌더링 스위치다.**

#### 3. SE91 메시지 클래스 연동
- 하드코딩 텍스트가 아닌, 시스템에 공식 등록된 메시지 클래스(`i_msgid`)와 에러 번호(`i_msgno`) 및 동적 변수(`i_msgv1`)를 바인딩하여 체계적인 에러 사양을 전송한다.

### 어떻게 확인하는가

SE91 메시지를 엮어 add_protocol_entry 에 담고 display_protocol 을 격발하는 검증 코드를 검증한다.

```abap
CLASS lcl_alv_handler IMPLEMENTATION.
  METHOD on_data_changed.
    LOOP AT er_data_changed->mt_good_cells INTO DATA(ls_cell).
      IF ls_cell-fieldname <> 'SEATS'. CONTINUE. ENDIF.
      
      DATA(lv_seats) = CONV i( ls_cell-value ).
      
      IF lv_seats < 1.
        " [ 1단계: 프로토콜 상자에 에러 누적 마킹 ]
        er_data_changed->add_protocol_entry(
          EXPORTING
            i_msgid     = 'ZMSG_ACAD'     " SE91 메시지 클래스 지명!
            i_msgty     = 'E'             " 에러 타입 지정!
            i_msgno     = '101'           " 메시지 번호 지명!
            i_msgv1     = '최소 1석 필요'  " &1 자리에 박힐 텍스트!
            i_fieldname = ls_cell-fieldname " 빨갛게 칠할 에러 컬럼 조준!
            i_row_id    = ls_cell-row_id    " 빨갛게 칠할 에러 행 조준!
        ).
      ENDIF.
    ENDLOOP.
    
    " 2. [★ 오류 목록 스풀 판넬 격발]
    " 누적 적재된 모든 에러들을 화면 하단에 촥 모아서 시각 개방!
    er_data_changed->display_protocol( ).
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (오류 셀 목록 스풀)
- **프로세스 플로우**:
  1. 학습자가 seats 에 각각 [0], [99] 를 적고 엔터를 친다.
  2. 두 셀 모두 [빨간 테두리]가 칠해진다.
  3. 동시에 화면 하단에서 [오류 판넬 트레이]가 쓱 솟아오른다. 
  4. 판넬 안에 [1행 seats: 최소 1석 필요], [3행 seats: 좌석수 한도 초과] 두 에러 한글 메시지가 행별로 가지런히 나열된 스풀 비주얼 피드백을 감상한다.
- **상태 및 데이터**:
  - `i_fieldname 과 i_row_id 셋업을 빈칸으로 누락해 등록한 상태` -> 런타임 결과: `Error messages shown in spool but cells are not highlighted. User cannot find which cells failed` 적색 경고 작동.
- **피드백**: 프로토콜 등록 시에는 반드시 에러가 발생한 좌표(행/열 필드명)를 1:1 정밀 결합해 주어야 화면과 에러 목록이 체결됨을 배운다.

### 실수/주의

- **오류 메시지 문구를 "입력값 이상함" 과 같이 추상적으로 성의 없이 작성**:
  - 이따위 문구는 사용자가 "그래서 0을 넣으라는 건지, 문자를 넣으라는 건지, 뭘 어떻게 고쳐야 하는지" 갈피를 못 잡게 만들어 업무 지연을 유발한다.
  - **에러 피드백 라벨에는 무조건 "좌석 수는 1부터 10사이 숫자만 입력 가능합니다" 처럼 '다음에 사용자가 취해야 할 구체적인 보정 행동 지침' 을 직관적으로 담아야 한다.**

### 정리

- **`add_protocol_entry`** 는 에러 메시지 클래스와 에러 셀의 행/열 좌표를 묶어 누적한다.
- **`display_protocol( )`** 은 누적된 다중 에러 메시지들을 화면 하단 스풀에 촥 오픈한다.
- 오류 라벨은 사용자가 취할 **구체적인 보정 행동**을 친절히 기입한다.

---

## CH28-L06 - 변경 데이터 DB 반영 전 검증

### 왜 필요한가

오류 표시와 스풀 노출까지 마스터했다.
이제 사용자가 입력을 마치고 최종 [저장] 단추를 누르는 마지막 3단계 DB 반영 세션의 문턱에 도달했다.
- " 사용자가 5번 행 seats 입력창에 기존 2석을 지우고 5석으로 멋지게 타자 친 뒤, 엔터(Enter)도 안 치고 마우스로 다른 칸을 찍지도 않은 채, 그 입력 커서가 깜빡거리는 초긴장 상태에서 화면 우측 상단의 [저장] 버튼을 마우스로 쿡 클릭했다."
ALV 그리드 버퍼는 마지막에 입력 중이던 5석 데이터를 미처 회수 완료하지 못해 백엔드에 갱신 보고를 누락하고, 결국 원래 테이블에 들어있던 옛날 2석 데이터 그대로 DB 에 저장 완료 포스팅이 가동되어 예약 데이터가 공중 분해되는 유실 참사가 난다.

**저장 버튼 격발 PAI 1순위에 강격발하는 버퍼 회수 신호(check_changed_data)를 쏴서 마지막 미확정 셀 값을 강제로 Flush 적재하고, 여러 행을 합쳐야만 판정할 수 있는 전체 무결성 검증을 완수한 뒤에만, 비소로 DML(MODIFY)과 트랜잭션 커밋을 집행하는 최종 가드 기술**이 필요하다. 그것이 **변경 데이터 DB 반영 전 최종 검증**이다.

### 무엇인가

#### 🧭 저장 버튼 클릭 시 작동하는 3단계 최종 무결성 파이프라인 명세
우리는 아래와 같이 3단계 최종 검문 레일을 엄격하게 순차 배선해 저장을 사수한다.

```text
[1단계] check_changed_data( ) (마지막 셀 강제 회수) :
   사용자가 엔터 안 치고 저장 버튼을 눌러도, 입력 중이던 버퍼 값을 강제로 Flush 해 내부 테이블(mt_booking)에 적재 완료!
   │
[2단계] 전체 비즈니스 룰 2차 검증 (백엔드 방어선) :
   단건 셀 검사를 넘어 "총 예약석 합계가 공연 정원을 초과했는가", "중복 예약인가" 등 다중 행 결합 무결성 최종 검문!
   │
   ├── [에러 검출 시] : 저장 세션을 즉각 EXIT 차단! DB DML 근처에도 못 가게 통제!
   │
[3단계] DB DML 적재 및 커밋 (최종 확정) :
   모든 검문을 무사 통과한 경우에만 MODIFY TABLE 실행 및 COMMIT WORK 영구 확정! (DML 실패 시 ROLLBACK!)
```

### 어떻게 확인하는가

check_changed_data 를 격발하고 3단계 검문을 거쳐 MODIFY 커밋을 집행하는 최종 저장 소스 코드를 검증한다.

```abap
REPORT zch28_l06_save.

START-OF-SELECTION.
  " 사용자가 [저장] 버튼을 누른 PAI 세션 진입 가정!

  " [ 1단계: ★ 마지막 입력 셀 강제 회수 철칙 격발 ]
  " 이 메서드가 돌며, 입력 중이던 seats = 5 버퍼가 내부 테이블 mt_booking 으로 강제 이송 완료!
  go_grid->check_changed_data( ).

  " [ 2단계: 백엔드 전체 무결성 2차 검문소 가동 ]
  DATA: lv_err TYPE abap_bool VALUE abap_false.
  
  LOOP AT mt_booking INTO DATA(ls_book).
    " 좌석 수 최종 범위 재검문!
    IF ls_book-seats < 1 OR ls_book-seats > 10.
      lv_err = abap_true. EXIT.
    ENDIF.
  ENDLOOP.

  IF lv_err = abap_true.
    " 불합격 시 저장 프로세스를 단호하게 차단하고 복귀!
    MESSAGE '비정상적인 입력값이 검출되었습니다. 저장할 수 없습니다.' TYPE 'I'.
    RETURN.
  ENDIF.

  " [ 3단계: 통과자 전용 DB 적재 및 커밋 ]
  MODIFY zbooking FROM TABLE @mt_booking.
  
  IF sy-subrc = 0.
    COMMIT WORK.
    MESSAGE '예약 변경 내역이 안전하게 DB에 확정 저장되었습니다.' TYPE 'S'.
  ELSE.
    ROLLBACK WORK.
    MESSAGE 'DB 적재 실패로 데이터가 롤백 취소되었습니다.' TYPE 'E'.
  ENDIF.
```

#### 체험/시뮬레이터 설계 (저장 전 검증 흐름판)
- **프로세스 플로우**:
  1. 학습자가 [seats = 5 입력 중인 상태 (커서 깜빡)] 을 본다. 
  2. [check_changed_data OFF] 인 상태로 [저장]을 누른다. 백엔드로 옛날 seats = 2 가 날아가 저장되며 5석 입력은 유실되는 오류 모션을 확인한다.
  3. [check_changed_data ON] 을 켠다. [저장]을 누르자 5석 버퍼가 촥 흡수 수집되어 내부 테이블에 얹힌다.
  4. 2차 전체 검증기가seats = 5 가 안전범위(1~10)임을 초록불 승인하고, `MODIFY` 가 작동해 DB 로 안전 커밋되는 최종 세션 시퀀스 피드백을 감상한다.
- **상태 및 데이터**:
  - `검증 실패임에도 MODIFY TABLE 을 우회해 강제 실행해 버린 상태` -> 런타임 결과: `Database corrupted with illegal seats = 999. Integrity Broken` 사이렌 사이렌 경보.
- **피드백**: 화면 셀 검증은 편의일 뿐이며, 진짜 무결성 최후 방어선은 저장 PAI 단추를 누르는 찰나의 3단계 파이프라인에 있음을 각인한다.

### 실수/주의

- **저장 로직 PAI 진두에 check_changed_data( ) 메서드 기재를 깜빡 누락**:
  - 사용자가 입력을 다 쳤는데도 마지막 셀 값이 이전 엉뚱한 값으로 되돌아가 저장되는 '마지막 셀 유실 버그' 로 현업의 잦은 튜닝 요청에 시달리게 된다.
  - **저장 단추 이벤트의 최상단 1순위 줄에는 무조건 이 메서드를 강제 쏴주어야 무결함을 수호해야 한다.**

### 정리

- 저장 PAI 1순위 단독 명령줄로 **`check_changed_data`** 를 날려 마지막 입력 셀을 Flush 수집한다.
- 화면 단 셀 검사와 별개로, 저장 직전 **`전체 비즈니스 룰 2차 검증`** 을 백엔드 단에서 반드시 재수행한다.
- 통과 인스턴스만 **`MODIFY`** DML 을 태우고 최종 **`COMMIT WORK`** 지장 도장을 찍는다.
- *참고로 이 ALV Editable/검증 기술은 클래식 GUI 스펙이므로 Cloud 패러다임에선 RAP BDEF validation(on save)으로 진화 계승된다.*
