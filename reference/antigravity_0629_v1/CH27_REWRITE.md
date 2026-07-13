# CH27_REWRITE - ALV 고급 Event 응용 v1

> 목적: `content/abap/CH27`의 5개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH27 전체 설계

CH27의 한 문장 목표는 "ALV 그리드 상에서 사용자와 교류하는 4대 고급 이벤트인 더블클릭(Double Click), 핫스팟(Hotspot), 커스텀 툴바 버튼 추가(Toolbar), 사용자 명령 격발(User Command)을 학습하고, 이들을 단 하나의 통합 핸들러 클래스(`lcl_alv_handler`)로 모아 일괄 바인딩(`SET HANDLER`) 및 메모리 관리와 Null 객체 등록 덤프 방어선, 그리고 정렬/필터 꼬임 방어를 수립하여 상호작용하는 ALV 화면을 구축한다"이다.

IT 비전공자 입문자는 `SET HANDLER ... FOR go_grid` 바인딩 시 `go_grid` 발생자 인스턴스가 아직 만들어지기 전인 Null(`INITIAL`) 상태에서 호출해 즉각 `SET_HANDLER_FOR_NULL` 런타임 덤프 폭사를 내고, 더블클릭/핫스팟에서 전달해 주는 화면 인덱스 `e_row-index` 를 쌩으로 internal table 인덱스에 매핑했다가 사용자가 컬럼 정렬/필터를 때리는 순간 다른 고객의 예매를 취소해 버리는 대형 배달/예매 유실 사고를 낸다.
또한, `toolbar` 이벤트 안방 소스 안에서 직접 DML 이나 팝업 로직을 기재해 툴바를 그릴 때마다 데이터가 중복 변조되는 사고를 치고, 변경 완료 후 ALV 새로고침(`refresh_table_display`)을 빠뜨려 화면이 그대로 먹통인 채 굳어있는 버그를 유발한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **Double Click 연동**: 더블클릭 시 상세 이동 팝업을 띄우는 `FOR EVENT double_click` 메서드 설계 및 등록 시퀀스.
2. **e_row-index 정렬/필터 꼬임 방지**: 화면 줄 번호는 정렬/필터 시 영구 붕괴하므로, 반드시 그리드 맵을 거쳐 **실제 고유 업무 키(booking_id)를 추출해 비즈니스 데이터에 도킹**하는 정합성 철칙 교육.
3. **Hotspot 링크 가드**: 특정 단건 셀을 웹 브라우저 링크 밑줄처럼 기공하기 위해, Field Catalog 의 `hotspot` 속성 장착과 단일 클릭 `hotspot_click` 핸들링 조립.
4. **Toolbar 추가 격리**: 커스텀 버튼을 추가하는 `toolbar` 단계와, 실제 눌렸을 때 처리하는 `user_command` 계층의 분할(Toolbar 에서는 절대 비즈니스 DML 쿼리를 타지 않는 룰).
5. **USER_COMMAND 분기**: `e_ucomm` 코드에 따라 `CASE` 문으로 명령을 쪼개고, **선택 행이 비어 있을 시 사용자에게 친절한 정보 안내 가드**를 셋업하는 예외 수립.
6. **Refresh 필수성**: 백엔드 internal table 만 고쳐서는 시각 렌더링에 반영되지 않으므로, 반드시 **`refresh_table_display( )`** 포트 전원을 켜주는 마침표 의무화.
7. **SET HANDLER Null 방어선**: 바인딩 시 Raiser 와 Handler 인스턴스가 완벽히 메모리에 상주하는지 **`IS BOUND`** 예약 체크 가드를 물리는 안전 펜스 구축.
8. **통합 핸들러 (lcl_alv_handler)**: 4대 파편 이벤트를 단 한 개의 통합 핸들러 클래스 생성자로 쓸어 담아 일괄 배선하는 설계 기법 장착.
9. **Garbage Collector Keep-alive**: 핸들러 객체가 지역 변수로 선언되어 서브루틴 탈출 시 GC 에 의해 조기 삭제되지 않도록, 전역 참조 변수에 할당해 생명주기를 영구 유지시키는 메모리 관리 교육.

---

## CH27-L01 - Double Click Event

### 왜 필요한가

우리가 이전 SALV/Grid ALV 심화 챕터에서 이룩한 멋진 화면들은 예매 데이터들을 보기 좋은 격자 표 모양으로 **"보여주는"** 데까지는 아주 훌륭했다.
하지만 실무 업무 현장의 직원들은 단순히 목록을 구경하는 데서 그치지 않는다.
- 예약 목록 표를 스크롤하다가, 특정 수상한 예약 1행을 발견하고 마우스로 **더블클릭(Double Click)** 한다.
- 더블클릭하는 즉시 화면에 그 예약 건의 상세 결제 내역과 고객 인적사항 팝업이 촥 펼쳐지게 만들고 싶다.
여기서 입문자는 "ALV 그리드가 알아서 더블클릭을 감지하고 팝업창을 띄워줄 것" 이라 기대하지만, ALV 는 자기가 팝업을 띄울 업무 비즈니스를 전혀 알지 못한다.
ALV 는 단지 **"사용자가 몇 번 행을 더블클릭했다" 는 물리 신호(Event)** 만 조용히 백엔드로 송출해 줄 뿐이다.

**ALV 가 던지는 더블클릭 물리 신호를 낚아채는 전용 수신 메서드를 선언하고, 이를 락처럼 연결(SET HANDLER)하여, 클릭된 줄의 데이터를 읽어 상세 이동 팝업으로 연계 기동해 내는 기술**이 필요하다. 그것이 **Double Click Event** 의 결합이다.

### 무엇인가

#### 1. cl_gui_alv_grid 의 double_click 이벤트
- 사용자가 그리드 셀 위를 마우스로 따닥 더블클릭할 때, 백엔드에 알려주기 위해 ALV 클래스가 선언해 둔 인스턴스 이벤트다.

#### 2. FOR EVENT double_click OF cl_gui_alv_grid
- "이 메서드는 단순한 일반 메서드가 아니라, **ALV 그리드 객체에서 더블클릭 신호가 격발될 때 그것을 접수해 기동하는 전용 이벤트 핸들러**다" 라고 선언하는 특수 꼬리표다.
- **e_row** 와 **e_column**: 이벤트가 격발되는 순간, ALV 가 핸들러 메서드 파라미터로 "더블클릭된 행 인덱스 정보(`e_row-index`)" 와 "클릭된 열 필드명(`e_column-fieldname`)" 을 고스란히 담아 넘겨주는 수하물 상자다.

#### ⚠️ [ e_row-index 의 화면 정렬/필터 꼬임 유실 함정 명세]
- *ALV 상호작용 개발 시 입문자들이 가장 허무하게 예약 취소 대형 사고를 내는 핵심 정합성 붕괴 영역이다.*
- 이벤트가 준 `e_row-index = 3` 은 "화면에 3번째 줄에 서 있는 행" 이라는 뜻이다.
- **오동작**: 아무 생각 없이 내 데이터 테이블에서 `READ TABLE mt_booking INTO DATA(ls) INDEX e_row-index.` 를 실행한다.
- **이유**: **사용자가 ALV 상단 헤더를 눌러 '예매 금액 순' 으로 정렬(Sort)을 때리거나 'VIP 고객만' 필터(Filter)를 때려서 화면의 순서를 뒤엎는 순간, 화면의 3번째 줄(`e_row-index`)에 서 있는 예약은 내 원래 백엔드 테이블의 3번째 줄에 서 있는 예약과 180도 다른 엉뚱한 사람의 예약으로 매핑이 어긋나 버린다.** B 씨의 예약을 상세 이동하거나 취소하려고 더블클릭했는데, 엉뚱한 A 씨의 예약 상세가 열리거나 취소 포스팅이 가동되는 참극을 겪는다.
- **방어선 (업무 키 추출)**: 행 번호 `e_row-index` 로 무작정 비즈니스 로직을 집행하지 말고, 반드시 **화면 갱신이 반영된 그리드 버퍼나 인덱스 매핑 테이블을 통해 ' booking_id (기본키)' 고유 식별자 값을 먼저 끄집어낸 뒤, 그 고유 키를 가지고 `READ TABLE ... WITH KEY booking_id = ...` 로 데이터를 재조회해 엮어야 정렬/필터 시에도 무결하게 사수**된다.

### 어떻게 확인하는가

double_click 이벤트를 수신하는 핸들러를 정의하고 SET HANDLER 로 grid 객체와 매칭하는 소스를 검증한다.

```abap
CLASS lcl_alv_handler DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING it_booking TYPE ztt_booking.
    " 1. [더블클릭 이벤트 전용 핸들러 선언]
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
    " 2. [★ 정렬/필터 꼬임 방어선 작동]
    " e_row-index 화면 줄 번호를 거쳐 일단 booking_id 키를 안전 획득!
    READ TABLE mt_booking INTO DATA(ls_screen) INDEX e_row-index.
    IF sy-subrc <> 0. RETURN. ENDIF.

    " 화면 줄 번호로 DML 을 직접 치지 않고, 꺼내온 고유 booking_id 키로 안전 재식별!
    READ TABLE mt_booking INTO DATA(ls_real) 
         WITH KEY booking_id = ls_screen-booking_id.
         
    IF sy-subrc = 0.
      MESSAGE |예약번호 { ls_real-booking_id } (고객: { ls_real-customer }) 상세 팝업 가동.| TYPE 'I'.
    ENDIF.
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (double_click 이벤트 시뮬)
- **프로세스 플로우**:
  1. 학습자가 [예약 테이블 리스트]가 뿌려진 ALV 화면을 본다.
  2. 마우스로 [정렬 (금액순)] 을 누른다. 10번 예약(정훈영)이 1번째 줄로 순간 이동한다.
  3. [인덱스 직접 매핑 모드 (OFF)] 상태에서 10번 예약을 더블클릭한다. 백엔드가 `INDEX 1` 을 쌩으로 읽어 엉뚱한 1번 예약(홍길동) 상세 팝업을 띄우는 에러가 난다.
  4. [업무 키 추출 가드 (ON)] 을 켠다. 10번 예약을 더블클릭하자 `INDEX 1` 에서 `booking_id = 'B010'` 고유 키를 먼저 낚아채어, 정훈영 고객 상세 팝업이 안전하게 솟아오르는 통과 피드백을 감상한다.
- **상태 및 데이터**:
  - `SET HANDLER go_handler->on_double_click FOR go_grid 바인딩을 빼먹은 채 더블클릭을 시도한 상태` -> 런타임 결과: `Mouse double click triggered but no response from handler class` 먹통 표시.
- **피드백**: 핸들러 메서드 선언(`FOR EVENT`)과 실제 grid 객체로의 바인딩(`SET HANDLER`)의 두 세트가 체결되어야 이벤트 배선이 통함을 이해한다.

### 실수/주의

- **double_click 이벤트 핸들러 메서드만 클래스 안에 멋지게 구현해 두고, 소스 하단에서 SET HANDLER 등록 단추를 누락**:
  - 이 실수 시 컴파일 오류는 안 나지만, 사용자가 화면에서 마우스가 부서져라 더블클릭을 때려도 백엔드는 묵묵부답 뇌사 상태로 굳어 있어 최다 빈발 버그 문의가 접수된다.
  - **이벤트 핸들러를 정의했다면 잊지 말고 `SET HANDLER ... FOR go_grid` 바인딩을 얹어야 함을 수호해야 한다.**

### 정리

- **`double_click`** 은 사용자가 ALV 행을 더블클릭했음을 백엔드 클래스에 알려주는 신호다.
- **`FOR EVENT double_click OF cl_gui_alv_grid`** 문법으로 핸들러 메서드를 개설한다.
- 정렬/필터 시 줄 번호가 꼬이므로 `e_row-index` 에서 무조건 **`고유 업무 Key`** 를 먼저 분리한다.

---

## CH27-L02 - Hotspot Click Event

### 왜 필요한가

더블클릭 이벤트로 상세 연계를 완성했다.
그런데 이번에는 사용성이 문제다.
" 화면 예약 행 전체(예약 일자, 좌석 수, 지폐 단위 등)에 더블클릭 상세 이동을 퉁치고 걸어두었다.
사용자가 특정 텍스트를 마우스 드래그 복사하려다 마우스가 조금 흔들려 더블클릭이 작동하는 바람에 원치 않는 상세 팝업창이 수시로 튀어나와 화면을 가려 업무에 짜증을 유발한다."
화면 상에서 어떤 칼럼 글자를 클릭해야 다른 상세 정보(예: 공연ID 를 누르면 공연 정보로, 고객번호를 누르면 고객 대장으로)로 파도타기 탐색이 가능한지 '시각적 링크 꼬리표' 가 없어 화면이 답답해진다.

**특정 단건 칼럼 셀에만 웹 브라우저 하이퍼링크 밑줄 링크(밑줄 파란 글씨)를 그어 시각적 마우스 클릭 영역을 좁게 한정하고, 더블클릭이 아닌 '마우스 단 1번 클릭' 으로 즉시 연계 화면을 호출하는 기술**이 필요하다. 그것이 **Hotspot (핫스팟)** 의 장착이다.

### 무엇인가

#### 1. Hotspot (핫스팟)
- 특정 칼럼 셀의 텍스트 밑에 밑줄 링크를 쳐서, 마우스 커서가 올라가면 손가락 모양 링크 아이콘으로 변하고 한 번 클릭 시 연계 동작을 타게 돕는 시각 속성이다.

#### 2. Field Catalog 의 lr_fcat->hotspot = abap_true
- *핫스팟의 물리적 전원 스위치다.*
- **아무리 백엔드 클래스에 hotspot_click 핸들러 코드를 열심히 짜놓아도, 필드카탈로그 조립 시 해당 칼럼의 `hotspot` 필드 전원을 켜주지 않으면 링크 밑줄도 안 생기고 클릭 신호 자체가 아예 기동하지 않는다.**

#### 3. hotspot_click 이벤트
- 핫스팟이 켜진 셀을 사용자가 단건 클릭했을 때 격발하는 ALV 고유 이벤트다. `e_row_id-index` 와 `e_column_id-fieldname` 을 리턴하여 마우스 클릭 지점을 정교하게 알려준다.

### 어떻게 확인하는가

필드카탈로그에 핫스팟을 켜고 hotspot_click 수신 핸들러를 조립하는 소스를 검증한다.

```abap
" 1. [필드카탈로그 조립 시 콘서트ID 에 핫스팟 링크 스위치 켜기]
LOOP AT lt_fcat REFERENCE INTO DATA(lr_fcat).
  IF lr_fcat->fieldname = 'CONCERT_ID'.
    lr_fcat->hotspot = abap_true. " 이 컬럼에만 하이퍼링크 장착!
  ENDIF.
ENDLOOP.
```

```abap
" 2. [hotspot_click 이벤트 수신용 핸들러 조립]
CLASS lcl_alv_handler DEFINITION.
  PUBLIC SECTION.
    METHODS on_hotspot_click
      FOR EVENT hotspot_click OF cl_gui_alv_grid
      " e_row_id 와 e_column_id 로 클릭된 위치 접수!
      IMPORTING e_row_id e_column_id.
ENDCLASS.

CLASS lcl_alv_handler IMPLEMENTATION.
  METHOD on_hotspot_click.
    " 3. [★ 컬럼 분기 검문소 작동]
    " 핫스팟 이벤트는 핫스팟이 켜진 여러 칼럼에서 혼합 유입되므로 칼럼명 분기가 철칙!
    IF e_column_id-fieldname <> 'CONCERT_ID'.
      RETURN. " 의도하지 않은 다른 핫스팟 칼럼 클릭 시엔 무시하고 퇴출!
    ENDIF.
    
    " 고유 키 분리 및 비즈니스 연계 가동
    MESSAGE '공연 마스터 정보 상세 뷰로 이동합니다.' TYPE 'I'.
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (Hotspot 이벤트 시뮬)
- **프로세스 플로우**:
  1. 학습자가 [CONCERT_ID] 필드에 밑줄이 없는 밋밋한 표를 본다.
  2. [Field Catalog -> hotspot = ON] 레버를 올리고 빌드한다. [CONCERT_ID] 칼럼 값들 밑에 파란색 밑줄 하이퍼링크가 생기고 마우스가 올라가면 손가락 모양으로 렌더링된다.
  3. [단건 클릭]을 때린다. 더블클릭을 치지 않았는데도 `hotspot_click` 신호가 고속 기동되어 즉시 공연 팝업이 켜지는 피드백을 감상한다.
- **상태 및 데이터**:
  - `e_column_id-fieldname 분기 필터를 누락해 둔 상태` -> 런타임 결과: `Any hotspot column click triggers same concert detail popup. Logic collision warning` 사이렌 작동.
- **피드백**: Hotspot 은 특정 텍스트 링크에 특화된 1초 단건 기동 장치이므로, 칼럼 분기 검문이 수반되어야 함을 배운다.

### 실수/주의

- **double_click 과 hotspot_click 이벤트를 하나의 동일한 칼럼에 중첩으로 다 기재해 적용**:
  - 한 컬럼에 마우스를 더블클릭할 때와 단건 클릭할 때의 로직을 뒤섞어버리면, 사용자가 더블클릭을 따닥 누르는 과정에서 첫 번째 1클릭이 감지되어 hotspot_click 이 팝업을 띄우고 두 번째 클릭이 더블클릭 팝업을 띄우는 등 두 이벤트가 개싸움을 벌여 화면이 마비된다.
  - **한 컬럼은 무조건 단건 클릭 핫스팟 링크이거나, 아니면 행 전체 더블클릭 상세이거나 둘 중 하나만 선택 기재해야 한다.**

### 정리

- **`Hotspot`** 은 특정 셀을 하이퍼링크 손가락 모양으로 빚어 단건 클릭을 낚아챈다.
- 필드카탈로그에 **`hotspot = abap_true`** 옵션 전원을 켜주어야 활성화된다.
- 핸들러 내벽에서 **`e_column_id-fieldname`** 칼럼 필터를 걸어 엉뚱한 칼럼 반응을 차단한다.

---

## CH27-L03 - Toolbar Event

### 왜 필요한가

더블클릭과 핫스팟으로 셀 연동을 완료했다.
그런데 이번에는 표 위 영역에 고유 기능 버튼을 꽂고 싶다.
" 사용자가 예약 목록 행을 체크박스로 다량 고른 뒤, 이들을 한 번에 [일괄 예매 취소] 하거나 [이메일 발송] 하는 커스텀 업무 버튼을 가동하고 싶다."
이 버튼들을 ALV 표 바깥 우측 쌩 화면에 뚱딴지같이 흩뿌려 배치하면, 사용자의 시선이 표 안과 밖으로 오가며 업무 피로도가 올라가고 화면 낭비가 심해진다.
ALV Grid 가 머리맡에 제공하는 표준 단추 바(Toolbar)의 빈 공간에 자연스럽게 내 [예매 취소] 커스텀 단추를 끼워 넣어 유려한 디자인을 뽑아내고 싶다.

**ALV 표준 툴바가 렌더링되어 올라가는 이벤트 타이밍(Toolbar Event)에 조용히 난입하여, 내 버튼의 아이콘, 명령 텍스트를 기입해 툴바 리스트에 살며시 APPEND 탑재하는 기술**이 필요하다. 그것이 **Toolbar Event (툴바 이벤트)** 이다.

### 무엇인가

#### 1. cl_gui_alv_grid 의 toolbar 이벤트
- ALV Grid 가 화면을 로드하며 상단 표준 툴바 단추 목록을 빚어 렌더링하는 시점에 격발하는 이벤트다.

#### 2. e_object->mt_toolbar (툴바 컨테이너 상자)
- ALV 가 표준 단추들을 가득 실어 렌더링 대기 중인 툴바 테이블이다. 이 테이블에 내 커스텀 버튼 구조체를 **`APPEND VALUE #()`** 로 욱여넣으면 화면 툴바에 내 단추가 렌더링되어 올라간다.
- **function (내부 명령 코드)**: *툴바 버튼의 심장이다.* 버튼이 눌렸을 때 다음 단계로 던질 고유 명령 ID 코드(예: **`ZCANCEL`**)다. 표준 예약 단추 코드들과의 충돌을 격리하기 위해 무조건 **`Z`** 접두어로 명세해야 한다.

#### ⚠️ [ toolbar 이벤트 메서드 내부에서 직접 DB DML/업무 수정 금지 명세]
- *초보 개발자들이 가장 흔하게 멍청이 코드를 짜서 백엔드 정합성을 조지는 이벤트 착각 경계다.*
- **`toolbar` 이벤트는 사용자가 툴바를 스크롤하거나, 그리드를 리사이즈하거나, 화면이 리프레시될 때마다 시도 때도 없이 수십 번 연속 격발(Redraw)된다.**
- **이유**: **만약 이 toolbar 메서드 소스 안방 내부에서 직접 '예약 상태를 C 로 취소하는 DB UPDATE 쿼리' 같은 업무 DML 을 적어두면, 사용자가 화면 크기를 조금 늘이거나 줄일 때마다 예매 취소 쿼리가 수십 번 연속 실행되는 끔찍한 성능 덤프를 유발하기 때문이다.**
- **철칙**: `toolbar` 이벤트 내부에서는 **오직 "예매 취소 버튼을 화면에 그린다" 는 UI 징표 APPEND 추가 정의 작업만** 수행하고, 실제 그 단추가 눌렸을 때 실행할 진짜 비즈니스 쿼리는 다음 레슨인 **`user_command`** 이벤트 층으로 완벽 격리해야 안전하다.

### 어떻게 확인하는가

toolbar 이벤트를 수신하여 e_object->mt_toolbar 에 커스텀 단추 구조체를 APPEND 장착하는 소스를 검증한다.

```abap
CLASS lcl_alv_handler DEFINITION.
  PUBLIC SECTION.
    METHODS on_toolbar
      FOR EVENT toolbar OF cl_gui_alv_grid
      IMPORTING e_object.
ENDCLASS.

CLASS lcl_alv_handler IMPLEMENTATION.
  METHOD on_toolbar.
    " [★ toolbar 내벽 업무 DML 쿼리 작성 절대 엄금! 오직 단추 그리기 셋업만!]
    APPEND VALUE #(
      function  = 'ZCANCEL'     " 버튼 클릭 시 던질 고유 커스텀 명령 코드!
      icon      = icon_delete   " SAP 표준 휴지통 아이콘 탑재!
      text      = '예매 취소'    " 버튼에 인쇄할 한글 라벨 텍스트!
      quickinfo = '선택한 예약을 일괄 취소합니다.' " 툴팁 말풍선 정보!
      butn_type = 0             " 일반 푸시 버튼 단추 타입 지정!
    ) TO e_object->mt_toolbar.
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (Toolbar 추가 시뮬)
- **프로세스 플로우**:
  1. 학습자가 [기존 표준 필터, 정렬 단추만 있는 툴바]를 본다.
  2. [ZCANCEL APPEND 코드] 칩을 슬롯에 꽂는다.
  3. [그리드 리렌더링] 버튼을 누르자, 표준 단추 맨 우측 옆에 빨간 휴지통 아이콘과 함께 [예매 취소] 라는 예쁜 단추가 실시간으로 솟아오른다.
  4. 단추를 탭하자 "ZCANCEL 명령이 격발되었습니다! (아직 취소 코드는 구현 안 됨)" 노란 경보가 울리며 대기하는 모습을 감상한다.
- **상태 및 데이터**:
  - `APPEND 할 function 코드를 표준단추인 '&FIND' 와 중복되게 작성한 상태` -> 런타임 결과: `System command conflict. Custom toolbar button disabled` 하이라이트.
- **피드백**: Toolbar 는 오직 "버튼 그리기" 용 결계이며, 실제 처리는 명령 코드를 통해 다음 레이어로 넘어감을 인지한다.

### 실수/주의

- **동적으로 버튼 활성화 상태를 제어한 뒤, grid->set_toolbar_interactive( ) 호출을 생략**:
  - 예약 1건을 체크해야만 툴바 버튼을 켜주려고 내부 플래그를 고쳤는데, 그리드에 "툴바 다시 그려라" 고 지시하는 **`set_toolbar_interactive( )`** 메서드를 쏴주지 않으면 툴바는 옛 회색 잠금 상태로 굳어 있어 UI 렌더링 꼬임 버그를 겪는다.

### 정리

- **`toolbar`** 이벤트는 ALV 헤더 툴바에 내 단추를 얹기 위해 APPENDIX 셋업을 장착한다.
- **`e_object->mt_toolbar`** 테이블에 아이콘, text, function 코드를 APPEND 한다.
- 이 이벤트 내에서는 **절대로 DB 데이터를 건드리거나 팝업을 찌르지 않는다.**

---

## CH27-L04 - USER_COMMAND 처리

### 왜 필요한가

툴바 이벤트로 이쁜 버튼을 툴바에 탑재했다.
그런데 버튼을 클릭하는 순간 먹통이다.
" 사용자가 예매 취소 단추([예매 취소])를 힘차게 클릭했다. 
하지만 툴바 이벤트는 그저 단추 그림을 그린 껍데기일 뿐이므로, 버튼을 누르는 순간 붕 뜬 명령 신호가 공중분해되며 화면은 아무런 갱신 반응도 없는 장식용 모형 상태를 드러낸다."
사용자가 체크박스로 고른 행들의 줄 번호를 정확히 파악하여, "선택이 빈 값일 때는 경고로 돌려보내고, 선택된 행이 있다면 백엔드 값을 취소로 고친 뒤, 화면 새로고침 전원(Refresh)" 까지 유기적인 흐름 배선을 완성해야 한다.

**버튼 클릭 시 송출되는 명령 코드(e_ucomm)를 낚아채어 내 ZCANCEL 명령과 매칭 분기하고, 선택된 줄을 수집해 상태를 CANCELLED 로 변조한 뒤, ALV 화면을 갱신 새로 고쳐내는 기술**이 필요하다. 그것이 **USER_COMMAND (사용자 명령 처리)** 의 완수다.

### 무엇인가

#### 1. user_command 이벤트
- 사용자가 툴바의 커스텀 버튼을 누를 때, 해당 버튼에 묶어둔 `function` 내부 명령 코드를 수하물 **`e_ucomm`** 에 실어 백엔드로 격발하는 지휘 이벤트다.

#### 2. mo_grid->get_selected_rows (선택 수집기)
- *어떤 녀석들을 처리할지 골라내는 필수 검문소다.*
- 사용자가 ALV 좌측 체크박스로 V 체크해 둔 화면 행 인덱스 목록(`et_index_rows`)을 벌크로 회수해 주는 그리드 전용 메서드다.
- **빈 선택 가드**: `et_index_rows` 가 `INITIAL` (선택 없음) 일 때, 아무 안내 없이 쌩 까면 사용자는 멈춘 줄 오해하므로 **"먼저 대상을 선택하고 버튼을 누르십시오" 고 정보 메시지로 돌려세워 방어해야 한다.**

#### 3. refresh_table_display (그리드 새로고침 전원)
- **내부 메모리 테이블(`mt_booking`)의 값을 백날 'CANCELLED' 로 고쳐 보았자, 이 새로고침 전원 메서드를 grid 에 대고 쏴주지 않으면 뷰 화면은 옛 '정상' 상태를 그대로 고수하며 시각 갱신 락에 걸린다.** 화면을 갱신하는 최종 렌더링 트리거다.

### 어떻게 확인하는가

user_command 이벤트를 수령하여 e_ucomm 을 CASE 로 쪼개고 선택 수집 후 리프레시하는 소스를 검증한다.

```abap
CLASS lcl_alv_handler DEFINITION.
  PUBLIC SECTION.
    METHODS on_user_command
      FOR EVENT user_command OF cl_gui_alv_grid
      IMPORTING e_ucomm.
ENDCLASS.

CLASS lcl_alv_handler IMPLEMENTATION.
  METHOD on_user_command.
    " 1. [명령 코드 분기 필터]
    CASE e_ucomm.
      WHEN 'ZCANCEL'. " 내가 만든 취소 명령이 격발되었을 때!
        " 2. [선택된 행들 회수]
        mo_grid->get_selected_rows(
          IMPORTING et_index_rows = DATA(lt_rows)
        ).
        
        " 3. [선택 없음 빈 가드 철칙]
        IF lt_rows IS INITIAL.
          MESSAGE '취소 대상 예약 건을 왼쪽에서 먼저 1건 이상 체크하십시오.' TYPE 'I'.
          RETURN. " 로직 진행 즉각 거절 차단!
        ENDIF.
        
        " 4. [메모리 값 변조]
        LOOP AT lt_rows INTO DATA(ls_row).
          READ TABLE mt_booking ASSIGNING FIELD-SYMBOL(<ls_book>) INDEX ls_row-index.
          IF sy-subrc = 0.
            <ls_book>-status = 'C'. " 취소 마킹!
          ENDIF.
        ENDLOOP.
        
        " 5. [★ 화면 갱신 철칙 전원 켜기]
        mo_grid->refresh_table_display( ).
        MESSAGE '선택 건 예약이 성공적으로 취소 갱신되었습니다.' TYPE 'S'.
    ENDCASE.
  ENDMETHOD.
ENDCLASS.
```

#### 체험/시뮬레이터 설계 (user_command 선택 행 취소 시뮬)
- **프로세스 플로우**:
  1. 학습자가 [3개 행 예약 내역] ALV 와 [예매 취소 버튼]을 본다.
  2. 아무 선택도 안 하고 버튼을 쿡 누른다. "체크하고 누르라" 는 메시지 방어창이 뜨고 로직이 거절된다.
  3. 2번 행을 체크하고 버튼을 누른다. 백엔드 메모리의 status 가 'C' 로 바뀐다.
  4. [refresh_table_display OFF] 인 상태로 시뮬레이션하면, 메모리는 'C' 로 바뀌었는데 화면 표에는 계속 정상 'N' 으로 음영 잠김 현상을 본다.
  5. [refresh 전원 ON] 을 켜자, 2번 행 상태가 화면 리스트 상에서도 'C' 로 지잉 갱신 렌더링되는 마침표 모션을 감상한다.
- **상태 및 데이터**:
  - `CASE e_ucomm 분기 필터를 누락해 둔 상태` -> 런타임 결과: `Any system command triggers the cancellation logic. presentation crash` 하이라이트.
- **피드백**: 명령 분기, 선택 검문, 그리고 새로고침(`refresh`)의 3종 콤보가 물려야 툴바 버튼 상호작용이 성립함을 배운다.

### 실수/주의

- **user_command 내에서 데이터 상태를 고쳤으나 refresh_table_display( ) 호출을 생략**:
  - 이 실수 시 사용자는 "예약 취소 버튼을 눌렀는데 화면에 아무것도 안 바뀌고 그대로다. 취소가 안 된 모양이다" 고 생각하고 단추를 수십 번 중복 난사하여 백엔드 DB 버퍼를 꼬이게 만드는 원인을 준다.
  - **상태를 바꿨다면 최종 refresh 신호를 반드시 격발 수호해야 한다.**

### 정리

- **`user_command`** 는 버튼에 심어둔 function 명령 코드 **`e_ucomm`** 을 수령해 분기한다.
- **`get_selected_rows`** 로 선택된 행을 수집해 오되, 빈 값은 예외 거절한다.
- 처리가 완료되면 반드시 **`refresh_table_display`** 를 때려 화면을 새로 고침 한다.

---

## CH27-L05 - ALV Event Handler Class 설계

### 왜 필요한가

더블클릭, 핫스팟, 툴바 개설, 유저 커맨드 분기 및 리프레시 새로고침까지 ALV 상호작용의 4대 톱니바퀴 이벤트를 완벽하게 섭렵했다.

그런데 실제 실무 화면 프로그램은 이 4가지 기능을 전부 종합하여 한 화면에 동시에 제공한다.
" 이 개별 이벤트 펑션과 `SET HANDLER` 등록 코드를 프로그램 PBO, PAI, 서브루틴 여기저기에 파편화해 흩뿌려 기재했다.
나중에 더블클릭 상세 기능이 무반응을 뿜어 에러를 튜닝하려는데, 락 배선이 어디서 묶이고 꼬였는지 소스 수만 라인을 다 뒤져도 배선도를 찾지 못해 디버깅 포기 지경에 빠진다."
클래식 가비지 컬렉터(Garbage Collector)의 참조 수명 주기를 잘못 엮어두면, 화면이 켜지자마자 내 핸들러 객체가 메모리에서 강제로 강제 킬(Kill)되어 버튼이 모조리 회색 뇌사 상태로 죽어버리는 재앙이 난다.

**이 흩어진 모든 4대 이벤트 수신 메서드들을 단 하나의 깔끔한 '전용 핸들러 통합 클래스(lcl_alv_handler)' 로 모으고, 생성자 한 곳에서 'SET HANDLER' 배선도를 1:1 완벽 정렬 조립해 메모리 주소를 보존하는 기술**이 필요하다. 그것이 **ALV Event Handler Class 통합 설계** 다.

### 무엇인가

#### 🧭 전용 핸들러 통합 클래스 (lcl_alv_handler) 의 조립 명세
우리는 아래와 같이 3대 배선 통합 룰을 밟아 화면 상호작용을 완성한다.

1. **이벤트 핸들러 전원 소집**:
   - 한 클래스 정의부 안에 `on_double_click`, `on_hotspot`, `on_toolbar`, `on_user_command` 를 나란히 가지런히 정렬 선언한다.
2. **생성자(Constructor) 일괄 바인딩**:
   - `SET HANDLER me->on_double_click me->on_hotspot ... FOR mo_grid.` 
   - **이벤트 배선 묶음을 생성자 내방 1군데에 모조리 단 한 줄로 몰아 기재함으로써, 배선 누락이나 결선 오류를 눈으로 한눈에 스캔 검수해 내도록 조립한다.**
3. **Garbage Collector Keep-alive 수명 보존**:
   - *실무 이벤트 코딩 시 초보들이 100% 당하고 멘붕하는 메모리 증발 제약이다.*
   - **아바 엔진은 `SET HANDLER` 에 의해 등록된 핸들러 인스턴스 객체를 메모리에서 강제 수집 소멸되지 않게 꽉 붙잡아 생명을 보존(Keep-alive)하는 고마운 메모리 래퍼 성질을 보증한다.**
   - 단, 핸들러를 쥐어 조립해 생성하는 메인 셸의 참조 변수(`go_handler`)는 서브루틴 탈출 시 사라지지 않도록 명확한 전역(Global) 범위나 컨트롤러 클래스의 속성(Attribute)에 이쁘게 안착 저장해 주어야 락 세션이 안정되게 지속된다.

### 어떻게 확인하는가

4대 이벤트를 단일 클래스 생성자에 일괄 배선해 바인딩하는 최종 통합 소스 코드를 검증한다.

```abap
REPORT zch27_l05_handler.

" [ 1단계: 4대 상호작용 통합 핸들러 클래스 선언 ]
CLASS lcl_alv_handler DEFINITION.
  PUBLIC SECTION.
    METHODS constructor
      IMPORTING io_grid    TYPE REF TO cl_gui_alv_grid
                it_booking TYPE ztt_booking.
                
    METHODS on_double_click
      FOR EVENT double_click OF cl_gui_alv_grid IMPORTING e_row e_column.
      
    METHODS on_hotspot
      FOR EVENT hotspot_click OF cl_gui_alv_grid IMPORTING e_row_id e_column_id.
      
    METHODS on_toolbar
      FOR EVENT toolbar OF cl_gui_alv_grid IMPORTING e_object.
      
    METHODS on_user_command
      FOR EVENT user_command OF cl_gui_alv_grid IMPORTING e_ucomm.

  PRIVATE SECTION.
    DATA mo_grid    TYPE REF TO cl_gui_alv_grid.
    DATA mt_booking TYPE ztt_booking.
ENDCLASS.

CLASS lcl_alv_handler IMPLEMENTATION.
  METHOD constructor.
    mo_grid    = io_grid.
    mt_booking = it_booking.
    
    " 2. [★ 생성자 일괄 배선 철칙 지정]
    " 4대 락을 단 한 줄로 1:1 결선 바인딩하여 가독성 극대화!
    SET HANDLER me->on_double_click
                me->on_hotspot
                me->on_toolbar
                me->on_user_command
      FOR mo_grid.
  ENDMETHOD.

  METHOD on_double_click.   " 더블클릭 상세이동 위임...
  ENDMETHOD.
  METHOD on_hotspot.        " 핫스팟 링크 이동 위임...
  ENDMETHOD.
  METHOD on_toolbar.        " 툴바 예매취소 단추 그리기 APPEND...
  ENDMETHOD.
  METHOD on_user_command.   " 단추 클릭 ZCANCEL 분기, 선택 검문, refresh...
  ENDMETHOD.
ENDCLASS.

" [ 3단계: 메인 PBO 기동부 ]
" go_handler 참조 변수를 전역(Global Data) 슬롯에 지정하여 GC 소멸 방어!
DATA go_handler TYPE REF TO lcl_alv_handler.

FORM init_alv.
  " 그리드 생성 및 display 로직 가동...
  " 핸들러 생성자 기동과 동시에 4대 락 배선이 0.1초 만에 깔끔히 완료!
  go_handler = NEW lcl_alv_handler( io_grid = go_grid it_booking = lt_booking ).
ENDFORM.
```

#### 체험/시뮬레이터 설계 (통합 핸들러 배선판)
- **프로세스 플로우**:
  1. 학습자가 좌측의 [물리 신호 4개: 더블클릭, 핫스팟, 툴바, 유저커맨드] 와 우측의 [lcl_alv_handler 수신 단자 4개]를 본다.
  2. [생성자 SET HANDLER 일괄 배선] 플러그를 쿡 꽂는다. 네 가닥의 광선 케이블이 한 번에 촥 정렬 배선 완료되는 모습을 확인한다.
  3. [핸들러 go_handler 변수를 Local Data 로 선언 테스트] 해 본다. 서브루틴을 나가자마자 GC 집게손가락이 나타나 go_handler 상자를 쓱 수거해가 버려 툴바가 먹통이 되는 모습을 본다.
  4. [Global Data 슬롯 도킹] 으로 주소를 이송하자, GC 가 회수해 가지 못하고 락 상호작용이 100% 철통 보장 가동되는 메모리 피드백을 감상한다.
- **상태 및 데이터**:
  - `SET HANDLER 등록 대상 Raiser(mo_grid)가 INITIAL Null 인 상태에서 등록한 상태` -> 런타임 결과: `SET_HANDLER_FOR_NULL Crash Dump occurred` 사이렌 경보 작동.
- **피드백**: 바인딩 전에 락 대상 grid 객체가 완벽히 `IS BOUND` 상태인지 검문하고, 핸들러 수명 주기를 보존해야 비로소 이벤트 아키텍처가 완성됨을 인지한다.

### 실수/주의

- **SET HANDLER 대상인 grid(mo_grid)가 아직 생성(CREATE OBJECT) 조차 되지 않은 Null 상태인데 마음만 급해서 SET HANDLER 배선부터 때리기**:
  - **이 순서 어긋남 시 아바 엔진은 Null 참조 에러를 뿜으며 예외 통과도 못 하고 즉각 `SET_HANDLER_FOR_NULL` 런타임 덤프를 터트려 시스템을 폭사시킨다.**
  - 락을 얹기 전에 무조건 발생자 grid 객체 인스턴스가 올바르게 `IS BOUND` 상태인 것을 수동 체크 가드하거나 생성 순서를 안전하게 선행 완료해야 한다.

### 정리

- **`lcl_alv_handler`** 통합 전용 클래스로 4대 이벤트를 수집 관리한다.
- **`생성자`** 내에 모든 `SET HANDLER` 문을 일괄 배치해 가독성과 배선 점검을 쉽게 유도한다.
- 핸들러 객체가 GC 에 조기 회수당하지 않게 **`전역 범위`** 나 클래스 속성에 고정 보존한다.
- 바인딩 전 grid 가 Null 상태인지 **`IS BOUND`** 검문을 걸어 덤프 폭사를 영구 방어한다.
- *참고로 cl_gui_alv_grid 는 클래식 GUI 기술이므로 현대 S/4HANA Cloud 신규 개발에선 Fiori/RAP 이벤트 모델로 진화 교체된다.*
