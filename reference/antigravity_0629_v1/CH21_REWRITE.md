# CH21_REWRITE - SALV/Grid ALV 표시 제어 심화 v1

> 목적: `content/abap/CH21`의 8개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH21 전체 설계

CH21의 한 문장 목표는 "SALV 객체의 화면 기동 전 표준 툴바, 정렬(Sort), 필터(Filter) 제어와 display settings, 3대 헤더 텍스트 동시 개칭, Variant 레이아웃 저장을 수립하고, Grid ALV의 Field Catalog 제어, Deep Structure 기반 셀 색상(LVC_T_SCOL - ctab_fname) 및 셀 스타일(LVC_T_STYL - stylefname) 조립, stable refresh 위치 사수를 접목하여, 사용자 친화적이고 흔들림 없는 고품질 ALV 시각 보고서 인터페이스를 완성한다"이다.

IT 비전공자 입문자는 `set_long_text` 만 단독 개칭했다가 컬럼 폭이 좁아질 때 필드명이 원래 DDIC 텍스트로 강제 복원 롤백되는 현상을 만나 당황하고, 셀 색상 테이블의 **`fname`** 필드와 셀 스타일 테이블의 **`fieldname`** 필드의 철자 불일치 트랩에 빠져 시각 효과가 무시되는 좌절을 겪는다.
또한, 내부 테이블에 색 데이터를 잔뜩 얹어두고 Layout 연결선(`ctab_fname`/`stylefname`) 매핑을 생략하여 색상이 투사되지 않는 연결 유실 버그를 겪으며, 갱신 시 `refresh_table_display` 에 `is_stable` 가드를 태우지 않아 사용자가 보던 행 위치에서 맨 첫 로우로 강제 튕김을 당해 불만을 호소한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **FACTORY 수령 규칙**: `CL_SALV_TABLE=>FACTORY` 는 복사 생성 연산이 아니라 **`IMPORTING r_salv_table`** 로 SALV 지표를 명시 캡처받는 호출 규격 정립.
2. **시점의 철칙**: `display( )` 가 기동된 후에는 툴바 셋업이나 필터가 먹지 않으므로, 모든 조종은 **화면 투사 전(Before Display)** 에 완료되어야 함을 천명.
3. **3대 헤더 개칭 의무**: 화면 너비 변화 시 헤더명이 훼손 복원되지 않도록 `set_short_text`, `set_medium_text`, `set_long_text` 를 세트로 동시 개칭하는 가이드 장착.
4. **sy-repid 식별 키**: 사용자가 정돈한 컬럼 순서와 숨김을 개인 저장소에 Variant로 박제 저장할 수 있도록 **`sy-repid`** 현재 프로그램명을 키로 박는 `get_layout( )` 기법.
5. **Field Catalog 세밀 제어**: `no_out` 기본 숨김, `do_sum` 숫자 기둥 합산, `just` 정렬, `key` 고정 강조 속성을 통해 카탈로그를 화면 지시서로 환골탈태하는 튜닝.
6. **물리 격리 (Flat DB vs Deep UI)**: deep component(테이블 inside 행)를 가진 테이블은 SQL select 타깃이 될 수 없으므로, **DB는 납작한 Flat table로 읽고, UI 바인딩 테이블에 값을 복사하여 색/스타일을 입히는 물리 격리** 지침 수립.
7. **셀 색상 조립 (fname)**: `LVC_T_SCOL` 행에 타깃 컴포넌트명을 **`fname`** 필드로 지목해 엮고, layout의 **`ctab_fname`** 에 그릇 필드명을 매핑하는 컬러 도킹.
8. **셀 스타일 조립 (fieldname)**: `LVC_T_STYL` 행에 타깃 컴포넌트명을 **`fieldname`** 필드로 지목해 엮고, layout의 **`stylefname`** 에 그릇 필드명을 매핑하는 스타일 도킹.
9. **철자 불일치 트랩 격리**: 셀 색상의 **`fname`** 과 셀 스타일의 **`fieldname`** 의 스펠링 차이를 박제하여 오동작 격리 방어.
10. **갱신 흔들림 방어 (Stable Refresh)**: DB를 재조회하지 않고 내부 테이블 값을 선수정한 뒤, **`is_stable`**(row=X, col=X) 락을 채워 스크롤과 포커스 위치를 고정 리프레시하는 사용자 흐름 보존.
11. **종합 실습 - 매진 회차 색 강조**: 잔여석 계산(`ZCL_BOOKING_MANAGER=>remaining`) 결과를 seats_left 에 도킹하고, 0석 매진 시 빨강(col_negative), 5석 이하 임박 시 노랑(col_total) 셀 색을 도킹해 ctab_fname 으로 투사하는 캡스톤 완성.

---

## CH21-L01 - SALV Sort / Filter / Function 제어

### 왜 필요한가

우리가 앞서 배운 고속 간편 ALV인 [[SALV]](`CL_SALV_TABLE`)는 단순히 `factory` 호출 후 `display( )` 한 줄만 치면 데이터를 화면에 번개처럼 띄워 주어 매우 편리했다.
하지만 실제 현업에서 가동되는 예약 리포트 보고서는 단순히 표를 띄우는 것만으로는 반쪽짜리 화면에 불과하다. 
- 날짜순 정렬이 안 되어 뒤죽박죽 섞여 있다.
- 취소된 예매 내역까지 지저분하게 섞여서 출력된다.
- 화면 상단 툴바에 정렬이나 필터, 혹은 엑셀 내보내기 표준 아이콘 단추들이 비활성화되어 텅 비어 있다.
사용자는 매번 쿼리를 다시 돌리거나 엑셀 다운로드 단추를 찾지 못해 "덜 만든 프로그램" 이라며 불만을 터트린다.

**표를 화면에 최종 렌더링하여 띄워 올리기 직전(Before display), SALV 객체 내부의 조종간(하위 설정 객체)을 낚아채어 정렬 규칙을 강제하고, 취소 상태를 필터링해 걸러내며, 엑셀/정렬 표준 툴바 단추들을 한 번에 활성화 완료하여 표를 투사하는 제어 기술**이 필요하다. 그것이 **Sort / Filter / Function 제어** 의 장착이다.

### 무엇인가

#### 1. SALV FACTORY 수령의 특수 규칙
- *초보 개발자들이 모던 뉴 생성자 배운 뒤 가장 흔히 저지르는 컴파일 거부 함정이다.*
- `cl_salv_table` 은 `NEW` 연산자를 가동해 수동으로 빚어내는 일반 클래스가 아니다. 
- **반드시 `cl_salv_table=>factory( )` 라는 정적 팩토리 메서드를 호출하되, 결과물 객체는 리턴받는 형태가 아니라 `IMPORTING r_salv_table = DATA(lo_salv)` 절을 명시 기입하여 바인딩 받아내야 한다.**

#### 2. display( ) 시점의 선행 제약 철칙
- *SALV 제어 설계의 대원칙이다.*
- 툴바 기능을 활성화하는 `set_all( )` 이나 `add_sort( )` 같은 모든 시각 제어 지시 코드는 **무조건 `lo_salv->display( )` 를 호출하여 화면에 띄우기 "전에" 소스 코드 윗줄에 배치**해야 한다. 
- display 호출 아랫줄에 셋업 코드를 적어두면 화면이 이미 굳어 버린 상태라 어떠한 조종 신호도 접수되지 않고 씹혀 무시된다.

#### 3. 핵심 3대 하위 조종 객체
- **Functions (`get_functions( )`)**: 툴바의 정렬, 필터, 인쇄, 엑셀 전환 표준 단추들을 통제한다. `set_all( abap_true )` 로 전면 기동한다.
- **Sorts (`get_sorts( )`)**: 특정 컬럼을 기준으로 데이터를 오름/내림차순 정렬 지시한다.
- **Filters (`get_filters( )`)**: 특정 상태 조건 값을 화면에서만 일시 필터링 필터 가드를 올린다.

### 어떻게 확인하는가

팩토리에서 SALV를 수령하고 정렬 및 필터 가드를 디스플레이 전에 탑재하는 소스를 검증한다.

```abap
REPORT zch21_l01_salv_ctrl.

DATA: gt_booking TYPE STANDARD TABLE OF zbooking,
      lo_salv    TYPE REF TO cl_salv_table.

START-OF-SELECTION.
  SELECT * FROM zbooking INTO TABLE @gt_booking.

  TRY.
      " 1. [정적 팩토리 수령] IMPORTING 절로 lo_salv 인스턴스를 낚아채기!
      cl_salv_table=>factory(
        IMPORTING r_salv_table = lo_salv
        CHANGING  t_table      = gt_booking
      ).

      " [철칙] display( ) 전에 모든 셋업을 완료한다!
      " 2. [표준 툴바 기능 활성]
      lo_salv->get_functions( )->set_all( abap_true ).

      " 3. [기본 정렬 지정] 예매일자 기준 정렬!
      lo_salv->get_sorts( )->add_sort( columnname = 'BOOKING_DATE' ).

      " 4. [기본 필터 지정] 취소(C) 상태는 화면 표시에서 제외 필터링!
      lo_salv->get_filters( )->add_filter(
        columnname = 'STATUS'
        sign       = 'I'
        option     = 'NE'
        low        = 'C'
      ).

      " 5. [최종 디스플레이 투사]
      lo_salv->display( ).

    CATCH cx_salv_msg INTO DATA(lx_err).
      WRITE: / lx_err->get_text( ).
  ENDTRY.
```

#### 체험/시뮬레이터 설계 (SALV 초기 상태 조종 패널)
- **프로세스 플로우**:
  1. 학습자가 화면 중앙에 [SALV 최종 화면 상자]를 본다. 툴바가 텅 비어있고 정렬이 깨져있다.
  2. [set_all( TRUE )] 스위치를 올린다. 상단 툴바에 인쇄, 엑셀 표준 아이콘 칩들이 촥 렌더링되어 박힌다.
  3. [add_sort( 'BOOKING_DATE' )] 카드를 밀어 넣자, 뒤죽박죽이던 날짜 행들이 날짜순으로 정렬 탑재 정돈된다.
  4. [display] 버튼을 탭하자, 정돈된 화면 카드가 번쩍하며 출력되는 런타임 제어 모션을 감상한다.
- **상태 및 데이터**:
  - `display( ) 코드를 먼저 적은 뒤 아랫줄에 set_all( ) 을 배치한 상태` -> 셋업 상태: `Ignored (No effect)` 경고등 하이라이트.
- **피드백**: SALV는 화면 발사(display) 전 단계에서 하위 객체를 낚아채 셋업을 마치는 수명주기를 따름을 각인시킨다.

### 실수/주의

- **정렬/필터 컬럼명 기입 시 화면에 보이는 제목 텍스트로 적어 전달**:
  - `add_sort( '예매일자' )` 처럼 적으면 SALV는 그런 컬럼을 내부 테이블에서 찾지 못해 에러를 뿜거나 무시한다.
  - **반드시 내부 테이블(ZBOOKING)에 선언된 실제 필드 컴포넌트의 영어 이름(`'BOOKING_DATE'`) 대문자로 정밀 지목**해 주어야 바인딩된다.

### 정리

- **`factory`** 메서드는 **`IMPORTING r_salv_table`** 로 변수명을 건져내어 수령한다.
- 모든 기능 조종은 반드시 **`display( )` 가 작동하기 전에** 기재 완료해야 먹힌다.
- 필터와 정렬 지시어의 컬럼 대상명은 무조건 **실제 데이터 필드명 대문자**로 지목한다.

---

## CH21-L02 - SALV Layout / Variant 심화

### 왜 필요한가

SALV 툴바와 정렬을 먹였다. 
그런데 이번에는 컬럼 기둥들의 레이아웃 세부 비주얼이 문제다.
- `'CAPACITY'` 라는 정원 컬럼 기둥의 폭이 너무 좁게 고정되어 숫자 값이 잘린 채 샵(`###`)으로 숨어 출력된다.
- 기둥 제목 텍스트가 DDIC 물리 필드명인 `'CAPACITY'` 그대로 차갑게 노출되어 현업 사용자가 의미를 알아보지 못한다.
- 사용자가 화면을 보기 좋게 정렬하고 컬럼 순서를 마우스로 드래그해서 배치해 두었는데, 화면을 껐다 켜면 다시 초기화되어 원점으로 롤백되는 바람에 매번 레이아웃을 다시 노가다 배치해야 한다.

**화면 기동 시 데이터 길이에 맞춰 컬럼 폭을 자동 최적화하고, 컬럼 이름표를 한글 친화적인 칭호('정원')로 변경해 개칭하며, 사용자가 정돈한 화면 보기 배치를 Variant(개인 저장 포맷)로 온전히 박제해 영구 유지하는 기술**이 필요하다. 그것이 **SALV Layout / Variant 설정** 의 장착이다.

### 무엇인가

#### 1. 표 설정(Display Settings) 과 컬럼 폭 최적화
- **`get_display_settings( )`**: 표 전체 줄무늬 무늬 가동(`set_striped_pattern`) 및 상단 타이틀 타이틀 셋업을 관장한다.
- **`get_columns( )->set_optimize( abap_true )`**: 데이터 중 가장 긴 문장의 너비를 자동 계산해 컬럼 너비를 알아서 벌려주는 폭 최적화 장치다.

#### ⚠️ [ set_column 텍스트 개칭 시 3대 텍스트(short/medium/long) 동시 개칭 의무 명세]
- *초보 개발자들이 SALV 컬럼 텍스트 개칭 시 가장 흔히 범하는 롤백 함정이다.*
- SALV의 단일 컬럼 제어 객체(`get_column( 'CAPACITY' )`)는 `set_short_text`, `set_medium_text`, `set_long_text` 라는 3단 텍스트 이름표를 지닌다.
- **오동작**: 만약 귀찮다고 `set_long_text( '정원' )` 만 적어두면, 평상시에는 '정원' 으로 나오다가, **사용자가 마우스로 컬럼 폭을 강제로 좁히는 순간 SALV 엔진이 좁은 영역에 우겨넣기 위해 short_text 를 호출하여 원래 DDIC 명칭인 'CAPACITY' 로 텍스트를 강제 롤백 복원시켜 버린다.**
- **방어선**: 따라서 헤더명을 고쳐줄 때는 무조건 **`short`, `medium`, `long` 3개 텍스트를 세트로 동시에 동일 이름('정원')으로 싹 개칭**해 두어야 어떤 폭 변화에도 텍스트가 훼손되지 않는다.

#### 2. Variant 저장 레이아웃 설정
- 사용자가 GUI 화면에서 저장한 컬럼 배치 포맷을 박제 유지한다.
- **`set_key( )`** 메서드에 현재 프로그램명인 **`sy-repid`** 를 layout_key 구조체로 패킹해 등록함으로써, 이 프로그램의 소유임을 명시하고 저장 제한(`restrict_none`)을 해제해 준다.

### 어떻게 확인하는가

폭 최적화를 켜고 3대 헤더 텍스트를 동시 개칭하여 Variant 저장 키를 물리는 소스를 검증한다.

```abap
REPORT zch21_l02_layout.

DATA: gt_row  TYPE STANDARD TABLE OF zconcert,
      lo_salv TYPE REF TO cl_salv_table.

START-OF-SELECTION.
  SELECT * FROM zconcert INTO TABLE @gt_row.

  TRY.
      cl_salv_table=>factory(
        IMPORTING r_salv_table = lo_salv
        CHANGING  t_table      = gt_row
      ).

      " 1. [폭 최적화 및 줄무늬 활성]
      lo_salv->get_columns( )->set_optimize( abap_true ).
      lo_salv->get_display_settings( )->set_striped_pattern( abap_true ).

      " 2. [★ 3대 텍스트 동시 개칭 철칙]
      DATA(lo_col) = lo_salv->get_columns( )->get_column( 'CAPACITY' ).
      lo_col->set_short_text(  '공연정원' ).
      lo_col->set_medium_text( '공연정원' ).
      lo_col->set_long_text(   '공연정원' ).

      " 3. [Variant 박제 키 등록] sy-repid 식별자로 리포트 소유권 바인딩!
      lo_salv->get_layout( )->set_key(
        VALUE salv_s_layout_key( report = sy-repid )
      ).
      lo_salv->get_layout( )->set_save_restriction( if_salv_c_layout=>restrict_none ).

      lo_salv->display( ).

    CATCH cx_salv_msg cx_salv_not_found INTO DATA(lx_err).
      WRITE: / '설정 오류 발생:', lx_err->get_text( ).
  ENDTRY.
```

#### 체험/시뮬레이터 설계 (SALV Layout 실험실)
- **프로세스 플로우**:
  1. 학습자가 [long_text 만 '정원' 으로 개칭]된 가상 컬럼을 본다.
  2. [컬럼 폭 강제 축소] 슬라이더를 왼쪽으로 당긴다.
  3. 컬럼 폭이 좁아지며 글자가 줄어드는 찰나, '정원' 글자가 사라지고 원래 물리명인 'CAPACITY' 빨간 딱지로 롤백 복원되는 오작동을 확인한다.
  4. [3대 텍스트 세트 개칭 ON] 스위치를 켠다. 슬라이더를 아무리 좁혀도 꿋꿋이 '공연정원' 한글 칭호를 유지하는 모습을 감상한다.
- **상태 및 데이터**:
  - `get_column( ) 의 인자 컬럼명을 소문자 'capacity' 로 기입한 상태` -> 런타임 예외: `CX_SALV_NOT_FOUND` 적색 경보 발생.
- **피드백**: 헤더 개칭 시 3대 폭의 동시 지정이 롤백을 막는 필수 방어선이며, 타깃 기둥명 지목은 대문자가 기본임을 인지시킨다.

### 실수/주의

- **숨기기/열기 레이아웃 설정을 보안(Security) 권한 제어 수단으로 오해**:
  - 레이아웃에서 특정 민감 컬럼을 보이지 않게 감춰Variant로 셋팅해 배포했다 하더라도, 사용자는 variant 설정 변경 툴바 버튼을 눌러 언제든 그 숨겨진 기둥을 다시 꺼내볼 수 있다.
  - **보안 상 보여줘서는 안 될 예민한 개인정보 금액 필드는 애초에 SELECT 쿼리 SELECT list 단계에서 가져오지 않는 것만이 유일한 보안 경계선이다.**

### 정리

- 컬럼 폭 최적화는 **`get_columns( )->set_optimize( )`** 로 간단히 켜서 셋업한다.
- 헤더명 개칭 시에는 **short, medium, long 3대 텍스트를 세트로 동시에 개칭**한다.
- 개인 Variant 배치를 허용하려면 레이아웃에 **`sy-repid`** 를 식별 키로 필수 도킹한다.

---

## CH21-L03 - Grid ALV Column 제어 심화

### 왜 필요한가

SALV의 전체 레이아웃을 다듬었다. 
그런데 SALV보다 더 디테일하게 컨테이너 도킹 다리를 올리고 CL_GUI_ALV_GRID 컨트롤을 직접 조립하는 Grid ALV(SE51 딘프로 연동) 환경에서, 화면에 표시할 컬럼들의 세부 비주얼 지시를 튜닝하고 싶다.
- 회사 관리자 정보처럼 DB에는 있지만 화면에는 처음부터 가릴 컬럼을 디폴트 숨김 처리하고 싶다.
- 금액이나 티켓 매수 컬럼 하단에 전체 행의 '합계(Sum)' 가 자동 산출되게 엮고 싶다.
- 예약 상태 코드는 문자열 왼쪽 쏠림 대신 깔끔하게 '가운데 정렬' 로 가운데를 맞추고 싶다.
이러한 세밀한 표시 속성 지시들을 어디에 적어 넘겨야 하는지 모호하다.

**ALV 그리드에게 "이 컬럼은 처음에 숨겨라", "이 기둥은 하단에 합계를 내라", "이건 키 필드니까 고정 강조하라" 고 기둥별 속성 지시서들을 1:1 리스트로 기재해 엮어 넘겨주는 기술**이 필요하다. 그것이 **[[Field Catalog]] (필드 카탈로그) 심화 설정** 의 장착이다.

### 무엇인가

#### 1. Field Catalog (화면 표시 지시서) 의 재정립
- `LVC_T_FCAT` 테이블의 한 행 한 행은 DB 데이터 레코드가 아니며, ALV 엔진에게 전달할 **"컬럼 표시 가이드라인 지시서"** 의 역할을 수행한다.

#### 2. 핵심 4대 필드 카탈로그 지시 기둥 속성
- **`no_out = abap_true` (디폴트 숨김)**: 데이터를 내부 테이블엔 그대로 둔 채, 최초 화면 렌더링 시에만 컬럼 기둥을 보이지 않게 임시 숨김 차단한다. (Variant 설정에서 사용자가 꺼내어 열 수 있음).
- **`do_sum = abap_true` (누적 합계)**: 해당 컬럼이 정수나 금액 같은 숫자 형식일 때, ALV 리포트 맨 하단에 자동 합계 집계 요약 줄을 개설해 준다.
- **`just = 'C'` (가운데 정렬)**: 정렬 방향을 지정한다. (`'L'`: 왼쪽, `'C'`: 가운데, `'R'`: 오른쪽).
- **`key = abap_true` (키 고정 강조)**: 해당 기둥을 맨 왼쪽 영역에 고착 고정시키고 배경색을 다르게 주어 핵심 컬럼임을 강조한다.

### 어떻게 확인하는가

카탈로그 테이블을 순회하며 필드명별로 do_sum 과 no_out, key 속성을 조립하는 소스를 검증한다.

```abap
REPORT zch21_l03_fieldcat.

DATA: gt_fcat   TYPE lvc_t_fcat,
      go_grid   TYPE REF TO cl_gui_alv_grid,
      gt_outtab TYPE STANDARD TABLE OF zbooking.

START-OF-SELECTION.
  " [필드 카탈로그 머지 빌드 완료 가정] - gt_fcat 에 기둥 지시서들이 담김

  " [ 지시서 내용 튜닝 루프 구동 ]
  LOOP AT gt_fcat ASSIGNING FIELD-SYMBOL(<fc>).
    CASE <fc>-fieldname.
      WHEN 'MANDT'.
        <fc>-no_out = abap_true.     " 1. 클라이언트 코드는 화면에서 디폴트 숨김!
      WHEN 'SEATS'.
        <fc>-do_sum = abap_true.     " 2. 좌석 수 컬럼은 맨 밑바닥에 자동 누적 합계!
      WHEN 'STATUS'.
        <fc>-just   = 'C'.           " 3. 상태 코드는 보기 좋게 가운데 정렬!
      WHEN 'BOOKING_ID'.
        <fc>-key    = abap_true.     " 4. 예매 번호는 키 필드로 지정해 왼쪽에 고정 강조!
    ENDCASE.
  ENDLOOP.
```

#### 체험/시뮬레이터 설계 (Field Catalog 조립대)
- **프로세스 플로우**:
  1. 학습자가 [FIELD CAT: SEATS] 지시 카드를 조립대 위에 둔다.
  2. [do_sum = TRUE] 스위치를 올린다. 가상 그리드 화면 하단에 점선 합계 라인이 촥 그어지며 숫자들의 총계가 계산되어 도출되는 모습을 본다.
  3. [MANDT] 카드를 올리고 [no_out = TRUE] 를 누르자, MANDT 기둥이 화면에서 지워지며 숨겨지지만, 내부 데이터 테이블에는 MANDT 값이 얌전히 유지되는 흐름을 대조한다.
- **상태 및 데이터**:
  - `문자형 컬럼 'CUSTOMER' 에 do_sum = TRUE 를 강제 적용한 상태` -> 런타임 상태: `Sum function disabled for non-numeric field` 경보 감상.
- **피드백**: 필드 카탈로그는 컬럼의 시각적 운명을 결정하는 조종 테이블이며, 형식을 맞춰 기입해야 함을 규명한다.

### 실수/주의

- **no_out 과 카탈로그 내 레코드 완전 삭제(Delete)의 구별 실패**:
  - **`no_out`** 은 카탈로그 정보는 ALV가 알고 있되 화면에만 디폴트로 안 띄울 뿐이므로, 사용자가 툴바에서 선택해 다시 열 수 있다.
  - 만약 아예 사용자가 영원히 툴바에서도 꺼내 보지 못하게 차단하고 싶다면, `DELETE gt_fcat WHERE fieldname = ...` 으로 **카탈로그 지시서 테이블에서 행 자체를 완전히 찢어 삭제**해 버려야 한다.

### 정리

- 필드 카탈로그(`LVC_T_FCAT`)는 컬럼별 시각 지침을 기재해 넘기는 **표시 지시서**다.
- **`no_out`** 은 기본 화면 숨김, **`do_sum`** 은 하단 합계, **`just`** 는 정렬, **`key`** 는 고정 강조다.
- 카탈로그 속성명 대조 시 변수 대조 필드명은 무조건 **실제 데이터 컴포넌트 대문자**다.

---

## CH21-L04 - Deep Structure 기반 Cell Color

### 왜 필요한가

필드 카탈로그까지 정복했다. 
그런데 화면 ALV의 색상 강조를 입힐 때 심각한 비주얼적 장벽을 만난다. 
"앞 장에서 배운 행 색상(`info_fname`)은 예약 취소된 로우 전체를 회색으로 칠하는 데는 아주 훌륭했다. 
하지만 이번에는 행 전체가 아니라, '잔여석 수' 라는 특정 한 칸의 셀 값만 좌석이 부족해서 위험하다고 빨간색 경고등을 켜고 싶다. 
행 전체를 다 빨간색으로 칠해버리면, 옆에 있는 정상적인 공연 번호나 아티스트명까지 다 시뻘겋게 가려져서 가독성이 훼손되고 사용자가 시각 공해를 호소한다."

**행 단위가 아니라, 엑셀 표의 특정 행, 특정 열이 크로싱되는 핀포인트 셀 딱 한 칸만 조준 조명하듯이 안전하게 조건부 색을 입히는 정밀 시각 기술**이 필요하다. 그것이 **Deep Structure 기반 Cell Color** 이다.

### 무엇인가

#### 1. Cell Color (셀 개별 색상) 의 물리적 아키텍처
- 행 전체가 같은 색이 아니므로, 행 내부 테이블의 각 로우(Row) 안방 안에 **"어느 열 컬럼명에 무슨 색 코드를 매핑할지"** 를 적어둔 또 하나의 작은 미니 리스트 테이블을 자식으로 품어야 한다.
- **Deep Structure (중첩 구조)**: 이처럼 구조체 방 내부에 단순 값 변수만 있는 것이 아니라, 내부 테이블 형식의 자식 방을 통째로 포함하는 구조를 뜻한다.
- **`LVC_T_SCOL`**: 셀의 좌표와 색상 코드를 엮어 적는 자식 테이블의 정식 자료형이다.

#### ⚠️ [DB 조회용 Flat Table 과 ALV 바인딩용 Deep Table 의 완벽한 물리 격리]
- *프로그램 튜닝 시 컴파일러가 조회를 거부하는 치명적인 SQL-ALV 충돌 트랩이다.*
- `cellcolors TYPE lvc_t_scol` 이라는 자식 테이블을 품은 Deep 구조체는 데이터베이스 쿼리 `SELECT * INTO TABLE` 의 수용 그릇으로 직접 사용할 수 없다. DB 세션은 이렇게 복잡한 입체적인 중첩 공간 구조를 1:1 평평하게 수납할 수 없기 때문이다.
- **해결 공식 (Flat-Deep 격리)**: 반드시 **DB 조회용으로는 평평한 고전 Flat 구조의 테이블(`gt_db`)을 가동해 select 완료한 뒤, 표시용으로 개설한 Deep 구조의 ALV 테이블(`gt_alv`)로 값을 루프 복사 이송하고, 그 2차 가공 단계에서 자식 색상 테이블을 채워 조립하는 2단계 격리 공정을 거쳐야 무결하다.**

#### 2. Layout ctab_fname 연결선 체결 규칙
- 자식 방에 `fname = 'SEATS'` 라고 색 정보를 가득 채웠어도, ALV 그리드에게 **"야, 이 행 내부의 5번째 구석방인 cellcolors 라는 필드명이 바로 셀 색상 정보가 들어있는 좌표지다"** 라고 연동선을 체결해 주지 않으면 색이 그냥 데이터 쓰레기로 묻혀서 안 보인다.
- **연결선**: Layout 구조체에 **`ls_layout-ctab_fname = 'CELLCOLORS'.`** 지시어를 명시해 색상 방 이름을 매핑해 주어야 비로소 화면에 칼라 렌더링이 가동된다.

### 어떻게 확인하는가

표시용 deep 구조를 정의하고 2단계 가공을 통해 cellcolors 를 채워 layout에 매핑하는 소스를 검증한다.

```abap
REPORT zch21_l04_cell_color.

" 1. [ALV 표시용 Deep 구조체 정의]
TYPES: BEGIN OF ty_alv,
         concert_id TYPE zconcert-concert_id,
         seats_left TYPE i,
         cellcolors TYPE lvc_t_scol, " <-- 색상 자식 테이블을 품은 deep 컴포넌트!
       END OF ty_alv.
DATA gt_alv TYPE STANDARD TABLE OF ty_alv.

DATA ls_layout TYPE lvc_s_layo.

START-OF-SELECTION.
  " [ DB에서 Flat 테이블로 먼저 SELECT 완료했다고 가정하고 2차 이송 루프 작동 ]
  
  LOOP AT gt_alv ASSIGNING FIELD-SYMBOL(<row>).
    CLEAR <row>-cellcolors.
    
    " 2. [조건부 셀 색상 조립] 잔여석이 0석 이하로 빵꾸나면 빨간색 조준 격발!
    IF <row>-seats_left <= 0.
      APPEND VALUE lvc_s_scol(
        fname     = 'SEATS_LEFT'          " 색을 칠할 타깃 컬럼명 대문자 지목!
        color-col = col_negative         " 빨간색 계열 코드
        color-int = abap_true            " 강한 강조 여부
      ) TO <row>-cellcolors.
    ENDIF.
  ENDLOOP.

  " 3. [연결선 체결 철칙] ctab_fname 에 자식 필드명을 문자열 대문자로 매핑!
  ls_layout-ctab_fname = 'CELLCOLORS'.
```

#### 체험/시뮬레이터 설계 (Cell Color 현미경)
- **프로세스 플로우**:
  1. 학습자가 좌측의 [1번 행: 잔여석 0] 데이터 판을 본다.
  2. [ctab_fname 연결 스위치 OFF] 상태에서 화면을 그린다. 색 필드가 단순 글자로 조접하게 노출되어 출력된다.
  3. [ctab_fname = 'CELLCOLORS'] 연결선을 끌어다 레이아웃 매핑 슬롯에 도킹한다.
  4. 데이터 열이 화면 뒤로 숨고, 잔여석 0이 들어있는 그 특정한 셀 칸만 번쩍하며 시뻘건 빨간색 경고등이 켜지는 정밀 칼라 렌더링 피드백을 감상한다.
- **상태 및 데이터**:
  - `fname 타깃명을 소문자 'seats_left' 로 기입한 상태` -> 렌더링 상태: `Color ignored (Field seats_left not found)` 회색 무반응 하이라이트.
- **피드백**: 셀 색상은 deep 자식 테이블의 정밀 기입과 Layout 매핑이라는 양방향 선로가 체결되어야 완성됨을 규명한다.

### 실수/주의

- **색상이 담긴 cellcolors 컬럼을 그대로 화면에 방치해 노출**:
  - `CELLCOLORS` 는 ALV 가 시각적으로 해독하기 위한 백엔드 기술용 deep 필드이므로, 필드 카탈로그 셋업 시 **`<fc>-tech = abap_true.`** 속성을 지정해 화면 밖으로 깔끔하게 숨겨주어야 표가 지저분해지지 않는다.

### 정리

- Cell Color 는 행 내부에 **`LVC_T_SCOL`** 자식 테이블을 품는 Deep Structure 기반이다.
- 자식 행 내부의 **`fname`** 필드에는 색을 입힐 타깃 컬럼명을 대문자로 적는다.
- Layout 의 **`ctab_fname`** 에 해당 자식 필드 이름을 대문자 문자열로 도킹 연결한다.

---

## CH21-L05 - Deep Structure 기반 Cell Style

### 왜 필요한가

셀 색상까지 정복했다. 
이번에는 셀의 단순 색깔이 아니라, 셀의 **'행동과 물리적 모양새'** 를 특정 셀만 조건부 제어하고 싶다.
- 이미 예약 만석이 되어 닫힌 행의 '예약 신청석' 셀 칸만 마우스를 대거나 키보드 타이핑을 칠 수 없게 회색으로 먹통 비활성화(`disabled`)시키고 싶다.
- 상태가 오픈된 정상 행의 신청 칸만 하얗게 활성화시켜 편집 가능하게 열고 싶다.
- 특정 로우의 '상세보기' 열 칸만 마우스로 탭할 수 있게 이쁜 '버튼(Button)' 모양으로 렌더링해 띄우고 싶다.
행 전체를 딘프로 속성 제어로 묶어버리면, 이미 들어있는 완료 예매 정보까지 락이 걸려 훼손되므로, 셀 단위의 미세한 동작 격리가 막막하다.

**행 내부 구조에 스타일 지시서 자식 테이블(`LVC_T_STYL`)을 도킹시켜, 특정 기둥 한 칸만 비활성 락을 걸고, 특정 칸만 편집 모드를 켜며, 특정 칸만 버튼 형상으로 교체하는 기술**이 필요하다. 그것이 **Deep Structure 기반 Cell Style** 이다.

### 무엇인가

#### 1. Cell Style (셀 개별 모양/행동) 의 매커니즘
- 셀 색상과 동일하게 Deep Structure 방식으로 자식 테이블인 **`LVC_T_STYL`** 을 행 안에 품는다.
- 이 자식 방에 타깃 컬럼명과 ALV 그리드 클래스가 제공하는 표준 상수 스타일 코드를 조립해 채워 넣는다.

#### 2. 핵심 3대 스타일 제어 상수
- **`cl_gui_alv_grid=>mc_style_disabled`**: 셀을 먹통 회색 비활성으로 묶어 수정을 차단한다.
- **`cl_gui_alv_grid=>mc_style_enabled`**: 셀을 조건부로 하얗게 뚫어 에디트 편집 모드로 승격한다.
- **`cl_gui_alv_grid=>mc_style_button`**: 셀 모양을 누르고 싶게 만드는 입체 버튼 형상으로 교체한다.

#### ⚠️ [ LVC_T_SCOL(fname) 과 LVC_T_STYL(fieldname)의 물리 철자 불일치 함정 명세]
- *실무 화면 튜닝 시 개발자를 미치게 만드는 SAP 표준 구조의 뒤통수 함정이다.*
- **셀 색상 자식 테이블(`LVC_T_SCOL`)의 타깃 컬럼 필드명은 `fname` (5글자) 입니다.**
- **반면, 셀 스타일 자식 테이블(`LVC_T_STYL`)의 타깃 컬럼 필드명은 `fieldname` (9글자) 입니다.**
- **오류**: 아무 생각 없이 스타일 테이블을 채울 때 `fname = 'SEATS'` 라고 적으면 컴파일러는 "스타일 구조체에는 fname 이라는 필드가 없다" 며 빌드를 멈추고 굳어버리며, 반대로 색상에 `fieldname` 을 쓰면 동작이 씹힌다. 이 미묘한 철자 어긋남을 두뇌 속에서 명확히 공간 격리해 암기 수립해 두어야 뒤통수를 안 맞는다.

### 어떻게 확인하는가

스타일 자식 테이블을 정의하고 mc_style_disabled 상수를 조립해 layout stylefname 에 매핑하는 소스를 검증한다.

```abap
REPORT zch21_l05_cell_style.

TYPES: BEGIN OF ty_alv,
         concert_id TYPE zconcert-concert_id,
         seats_left TYPE i,
         cellstyles TYPE lvc_t_styl, " <-- 스타일 자식 테이블을 품은 deep 컴포넌트!
       END OF ty_alv.
DATA gt_alv TYPE STANDARD TABLE OF ty_alv.

DATA ls_layout TYPE lvc_s_layo.

START-OF-SELECTION.
  LOOP AT gt_alv ASSIGNING FIELD-SYMBOL(<row>).
    CLEAR <row>-cellstyles.
    
    " [조건부 셀 스타일 조립] 좌석이 0 이하 매진이면 입력 칸을 disabled 먹통 락 걸기!
    IF <row>-seats_left <= 0.
      APPEND VALUE lvc_s_styl(
        fieldname = 'SEATS_LEFT' " ★ 주의! ctab의 fname 과 달리 여기는 fieldname 9글자 풀네임!
        style     = cl_gui_alv_grid=>mc_style_disabled " 비활성 락 상수 도킹
      ) TO <row>-cellstyles.
    ENDIF.
  ENDLOOP.

  " [연결선 체결] stylefname 에 자식 필드명을 대문자로 매핑!
  ls_layout-stylefname = 'CELLSTYLES'.
```

#### 체험/시뮬레이터 설계 (Cell Style 스위치보드)
- **프로세스 플로우**:
  1. 학습자가 [seats_left 칸]을 보고 [mc_style_button] 버튼을 탭한다.
  2. 표 안의 단순 숫자 칸이 누르고 싶게 생긴 입체 단추 모양으로 스르륵 변신 렌더링된다.
  3. [mc_style_disabled] 단추를 누르자, 회색 철창 락이 걸리며 마우스 커서가 금지 기호로 바뀌는 모션을 감상한다.
  4. 이때 코드가 `fieldname = ...` 이 아닌 `fname = ...` 으로 어긋나 삐걱대자, "스타일 구조체 필드 에러!" 경보기가 우는 피드백을 감상한다.
- **상태 및 데이터**:
  - `stylefname 연결을 layout에 누락한 상태` -> 렌더링 상태: `Style deactivated` 무변화 하이라이트.
- **피드백**: 셀 스타일은 Disabled와 Button 등의 기품있는 동작 제어를 셀 단위로 집행하는 최고급 시각 튜닝임을 깨닫게 한다.

### 실수/주의

- **스타일로 화면에서 enabled/disabled 를 켰다고 백엔드 최종 유효성 검증을 생략**:
  - 화면에서 스타일 락으로 비활성화를 시켜두었어도, 악의적인 해킹 트래픽이나 비정상 메모리 우회 기어 작용을 타면 저장 버튼 클릭 시 락이 우회되어 비정상 값이 넘어올 수 있다.
  - **화면 비주얼 제어와 상관없이, 데이터를 DB에 쏘기 직전 백엔드 아바 비즈니스 로직(ZCL_BOOKING_MANAGER)에서 잔여석 크로스 검증을 2중으로 집행해야 무결한 보안 경계선이 수립된다.**

### 정리

- Cell Style 은 행 내부에 **`LVC_T_STYL`** 자식 테이블을 품는 Deep Structure 기반이다.
- 자식 행 내부의 타깃 지칭 필드명은 ctab의 fname 과 달리 **`fieldname`** 이다.
- Layout 의 **`stylefname`** 에 해당 자식 필드 이름을 대문자 문자열로 도킹 연결한다.

---

## CH21-L06 - Row / Column / Cell Color 선택 기준

### 왜 필요한가

행 색상, 컬럼 색상, 셀 색상까지 ALV 가 제공하는 모든 삼총사 칼라 기법을 정복했다.
하지만 실무 개발을 개시하면 "색상이 다재다능하니까, 중요해 보이는 모든 칸과 모든 행에 노랑, 빨강, 파랑 무지개색을 빼곡하게 다 입혀서 화려하게 보고서를 제출해야지" 했다가 최악의 디자인 참사를 겪는다.
사방이 알록달록 색상 공해로 도배되어 정작 1초 안에 낚아채야 할 진짜 긴급 경고("매진") 셀이 눈에 들어오지 않는다. 
또한 굳이 안 써도 될 자리에 성능이 무거운 deep cell color 연산을 때려 서버 리소스 비용을 낭비하는 악수를 둔다.

**표시하고자 하는 데이터의 비즈니스적 본질이 "행 전체" 인지, "특정 열 전체" 인지, 아니면 "행마다 달라지는 단 1개의 셀" 인지 명확히 구분하여, 가장 단순하고 성능 비용이 저렴한 단위의 칼라 무기를 선택 결합하는 정제 가이드**가 필요하다. 그것이 **Color Decision** 의 수립이다.

### 무엇인가

#### 🎨 상황별 칼라 단위 의사결정 매트릭스 명세

| 내가 마주한 상황 | 선택해야 할 칼라 무기 | 기술적 타당성과 비용 근거 |
| --- | --- | --- |
| **"이 회차 예약은 취소되었으니 행 전체가 무의미하다"** | **`info_fname` (행 색상)** | 한 로우 전체의 사멸 상태를 고지하며, flat 구조라 성능 비용이 가장 저렴함 |
| **"잔여석 컬럼은 언제나 중요하니 기둥을 항상 조명하겠다"** | **`emphasize` (컬럼 색상)** | 필드 카탈로그에 'C500' 마크만 적으면 작동해 루프 연산 자체가 0에 수렴함 |
| **"공연 정보는 정상인데, 오직 잔여석이 0석인 그 셀 한 칸만 긴급 경고하겠다"** | **`ctab_fname` (셀 색상)** | 행마다 한 칸만 조건부 핀포인트 강조하므로 deep 구조 연산 비용 값을 지불할 가치가 있음 |

#### 🧭 색상 결정 다이어그램 (Color Choice Flow)
```text
[Q] 강조하고자 하는 상태의 의미가 행 전체에 걸쳐 동일한가?
     예  → layout-info_fname (행 색상 탑재 - 최단 단순)
     아니오 → 특정 기둥 컬럼이 프로그램 기동 내내 항상 강조되어야 하는가?
                예  → fieldcat-emphasize (컬럼 색상 탑재 - 단순)
                아니오 → 행마다 유동적으로 엇갈리는 단 1개의 조건부 셀 강조인가?
                           예  → layout-ctab_fname + LVC_T_SCOL (셀 색상 - 세밀 고성능)
```

### 어떻게 확인하는가

가장 단순한 행 색상과 정밀한 셀 색상 코드를 상황에 맞춰 엮어 조립하는 규격을 검증한다.

```abap
" [ 1단계: 취소된 예매 내역은 행 전체를 회색칠(C100) 처리 - 행 색상 가동 ]
ls_layout-info_fname = 'LINE_COLOR'. " 1층 flat 행 색상 가이드 매핑

" [ 2단계: 특정 잔여석 컬럼만은 핀포인트 조건부 셀 색상 처리 - 셀 색상 가동 ]
ls_layout-ctab_fname = 'CELL_COLOR'. " 2층 deep 셀 색상 가이드 매핑
```

#### 체험/시뮬레이터 설계 (색 단위 선택 퀴즈)
- **프로세스 플로우**:
  1. 학습자가 [상황: 취소된 회차 전체를 알림] 퀴즈를 만난다.
  2. [셀 색상 ctab_fname]을 드래그해 오답 칸에 얹는다. 경고음과 함께 "성능 낭비! 한 줄 전체면 info_fname 이 최적입니다!" 피드백이 뜬다.
  3. [행 색상 info_fname] 카드를 도킹하자, 회색 줄무늬가 리포트 줄에 이쁘게 안착하며 녹색 백점 판정이 나오는 모션을 감상한다.
- **상태 및 데이터**:
  - `전체 행 색상이 켜진 상태에서 모든 셀에 개별 LVC_T_SCOL 루프 연산을 적용한 상태` -> 런타임 성능 상태: `Redundant Deep Operation Warning`.
- **피드백**: 비주얼 튜닝의 품격은 색상의 화려함이 아닌, 단위의 단순함과 정확성에서 도출됨을 알게 한다.

### 실수/주의

- **적색/녹색 색맹 등의 사용자를 위해 오직 '색깔' 만으로 업무 합불 상태를 전달하는 무책임한 UI 설계**:
  - 화면 테마가 어둡거나, 색약이 있는 사용자 모니터에서는 빨강과 초록이 같은 톤의 회색으로 뭉개져 보여 업무 판정 장애가 난다.
  - **반드시 예매 성공/실패 여부를 색뿐만 아니라, `STATUS_TEXT` 열에 '매진', '오픈' 이라는 명확한 텍스트 한글 단어를 함께 적어 2중으로 시각 접근성을 구제해 주어야 한다.**

### 정리

- 행 전체 상태 강조는 **`info_fname`**, 특정 기둥 상시 강조는 **`emphasize`** 를 쓴다.
- 핀포인트 조건부 셀 한 칸만 강조할 때 비로소 **`ctab_fname`** deep 연산을 개설한다.
- 색상 외에 **명확한 텍스트 한글 단어**를 동시에 배치해 시각적 2중 접근성을 엄수한다.

---

## CH21-L07 - Stable Refresh와 표시 상태 보존

### 왜 필요한가

색상 의사결정까지 정복했다. 
이제 화면에서 새로고침(Refresh)을 기동할 때의 사용자 사용 피로가 장벽이다.
"사용자가 화면 스크롤 바를 밑으로 길게 내려 80번째 줄에 서식하는 '정훈영 밴드 콘서트' 회차를 유심히 지켜보고 있었다. 
이때 새로운 예약이 들어와 잔여석을 갱신하기 위해 `refresh_table_display` 갱신 메서드를 기동했다. 
그 순간, 보고서 화면이 미세하게 번쩍이더니, 스크롤 포커스가 툭 풀리면서 맨 첫 번째 줄(1번 행)로 튕겨 올라가 버린다. 
사용자는 자기가 보고 있던 80번째 줄을 다시 찾기 위해 스크롤을 또 어지럽게 내려 헤매야 한다."
데이터가 갱신될 때마다 화면이 위아래로 미친 듯이 튀며 사용 흐름을 파괴하니 사용자 불만이 폭주한다.

**내부 테이블의 데이터 값만 조용히 갱신하되, 사용자가 지켜보고 있던 현재의 세로 스크롤 높이, 가로 스크롤 컬럼 위치, 그리고 선택해 둔 포커스 락(Lock)을 런타임에 온전히 보존하여 튕김 없이 평화롭게 화면을 리프레시하는 기술**이 필요하다. 그것이 **Stable Refresh** (위치 고정 갱신) 이다.

### 무엇인가

#### 1. Stable Refresh 의 정의와 매커니즘
- 갱신이 일어날 때 세로/가로 행과 열의 스크롤 위치를 본드로 붙여 고정한 듯이 그 자리에 정지시켜 리프레시하는 기능이다.
- **`is_stable = VALUE lvc_s_stbl( row = abap_true col = abap_true )`** 옵션을 리프레시 메서드 인자로 강제 도킹해 가동한다.

#### 2. i_soft_refresh (가벼운 소프트 갱신)
- 화면의 컬럼 기둥이나 필드 카탈로그 레이아웃 뼈대 자체를 뜯어고치지 않고, **오직 내부 테이블 알맹이의 '값 변경(금액, 잔여석)' 만 가볍게 동기화**하여 드로잉 속도를 비약적으로 높이는 기법이다.

#### ⚠️ [내부 테이블 데이터 선 수정 후 화면 리프레시 호출의 2단계 순서 규칙]
- *초보 개발자들이 가장 많이 착각하여 헤매는 순서 누수 함정이다.*
- `refresh_table_display` 는 "스스로 DB를 뒤져 다시 Select 해오는 자동 재조회 장치" 가 아니다.
- **오동작**: DB 테이블 값만 고친 뒤 이 리프레시 메서드를 백날 호출해 봤자, ALV 가 붙들고 있는 화면 내부 테이블 버퍼의 알맹이 값이 그대로이므로 화면은 0.001% 도 바뀌지 않는다.
- **해결 철칙 (2단계 공정)**: 
  - **1단계**: 먼저 코드로 내 아바 내부 테이블의 80번째 행 레코드 값(`seats_left`)을 직접 계산 갱신해 바꾼다.
  - **2단계**: 그 후에 `refresh_table_display( stable = ... )` 을 호출해야 화면에 바뀐 내부 테이블 데이터가 튕김 없이 부드럽게 반영 투사된다.

### 어떻게 확인하는가

내부 테이블을 먼저 수정하고 stable refresh 를 가동하여 화면을 부드럽게 갱신하는 소스를 검증한다.

```abap
REPORT zch21_l07_refresh.

DATA: gt_alv  TYPE STANDARD TABLE OF zconcert,
      go_grid TYPE REF TO cl_gui_alv_grid.

START-OF-SELECTION.
  " [ go_grid 와 gt_alv 가 화면에 표시되어 돌아가고 있는 상태라 가정 ]

  " 1단계: [내부 테이블 알맹이 선 수정] 80번째 행의 잔여석 값을 먼저 아바 단에서 갱신!
  READ TABLE gt_alv ASSIGNING FIELD-SYMBOL(<row>) WITH KEY concert_id = 'C001'.
  IF sy-subrc = 0.
    <row>-capacity = 120. " 정원을 120으로 직접 수정 완료!
  ENDIF.

  " 2단계: [stable 및 soft 락 탑재 갱신 기동]
  " (사용자가 보던 스크롤 포커스가 튕기지 않고 제자리를 평화롭게 사수)
  go_grid->refresh_table_display(
    EXPORTING
      is_stable      = VALUE lvc_s_stbl( row = abap_true col = abap_true ) " 위치 잠금 락!
      i_soft_refresh = abap_true                                          " 소프트 갱신 기동
  ).
```

#### 체험/시뮬레이터 설계 (Refresh 흔들림 비교기)
- **프로세스 플로우**:
  1. 학습자가 스크롤을 80% 아래로 내려 [LH0400 행]을 지켜본다.
  2. [일반 Refresh 작동] 단추를 누른다. 화면 전체가 미세하게 떨리며 포커스가 강제로 맨 상단 1번 행으로 튕겨 올라가는 충격을 본다.
  3. 다시 스크롤을 내린 뒤, [Stable Refresh ON] 스위치를 켠다.
  4. 리프레시를 때리자, 화면 흔들림도 없고 스크롤 위치도 본드를 붙인 듯 굳건히 고정된 채, 잔여석 숫자만 '2' 에서 '1' 로 부드럽게 깜빡이며 변경 적재되는 모습을 감상한다.
- **상태 및 데이터**:
  - `내부 테이블 수정 단계를 빠뜨린 채 리프레시만 기동한 상태` -> 렌더링 상태: `No value changed` 무변화 하이라이트.
- **피드백**: 리프레시는 선 수정 후 락 가드(`is_stable`) 체결의 2단계 철칙이 수반되어야 무결한 사용자 흐름을 지킬 수 있음을 깨닫게 한다.

### 실수/주의

- **새로고침을 할 때마다 CREATE OBJECT go_grid 로 그리드 컨트롤을 계속 중복 생성**:
  - 리프레시를 한답시고 화면 PBO 돌 때마다 `CREATE OBJECT` 를 매번 가동해 그리드를 새로 빚으면, stable 락이고 뭐고 화면 도킹이 파괴되어 기존에 띄워둔 메모리가 전부 좀비 좀비로 누수 폭사하므로, **최초 1회 생성 가드(`IF go_grid IS INITIAL.`) 안에서 한 번만 만들고, 이후 변경은 오직 `refresh_table_display` 메서드 단독 호출로만 집행해야 한다.**

### 정리

- **`refresh_table_display`** 는 내부 테이블 버퍼가 먼저 갱신되어 있어야 화면을 고쳐 그린다.
- **`is_stable`** 의 row 와 col 락을 켜서 스크롤 튕김을 철저히 제압한다.
- 뼈대 구조가 아닌 값만 바뀔 때는 **`i_soft_refresh = abap_true`** 를 얹어 가속 리프레시를 한다.

---

## CH21-L08 - 실습 — 매진 회차 색 강조

### 왜 필요한가

정렬, 필터, 툴바 제어, 3대 헤더 개칭 세트, 필드 카탈로그 조립, Cell Color 좌표 엮기, Cell Style 락 걸기, 그리고 Stable Refresh 고정 제어까지 우리가 공부한 표시 제어의 모든 대형 무기들을 완전히 섭렵했다.

이제 이 기능들을 **🎫 하나의 완결된 실무 캡스톤인 '콘서트 회차 리포트 색 제어'** 에 투사하여 시각 제어를 완성할 순간이다.
단순히 색칠 공부 코드가 아니라, 예약 비즈니스 코어 클래스(`ZCL_BOOKING_MANAGER`)와 실시간 도킹하여 잔여석을 산출하고, 남은 좌석이 0석인 매진 회차 셀은 빨간색(`col_negative`), 5석 이하인 예매 임박 셀은 노란색(`col_total`)으로 정확하게 조준 형광 강조해 내는 **강건하고 정밀한 실무 ALV 시각 보고서**를 완성해 내야 한다.

### 무엇인가

#### 🎫 콘서트 리포트 정밀 Cell Color 설계 명세
우리는 콘서트 회차 정보 화면의 비주얼을 다음과 같이 4단계로 유기적 연결 튜닝한다.

1. **표시용 Deep 구조체 정의**:
   - 내부 테이블 `lt_row` 의 한 행 구조 안에, 셀 색상 정보를 핀포인트로 담을 자식 테이블인 **`cellcolors TYPE lvc_t_scol`** deep 필드를 수립 장착한다.
2. **비즈니스 상태와 2차 이송 루프의 결합**:
   - DB에서 읽은 Flat 데이터에서 회차별 객체를 생성(`NEW zcl_booking_manager`)하여 `remaining( )` 업무 연산을 동기 가동해 남은 좌석(`seats_left`) 값을 수집한다.
   - 루프를 돌며, 수집된 seats_left 가 0 이하이면 **`fname = 'SEATS_LEFT'`** 낚시줄을 매달아 빨간색 코드를 APPEND하고, 5 이하이면 노란색 코드를 APPEND하여 자식 방을 정밀 패킹한다.
3. **Layout ctab_fname 연결 배선 연결**:
   - Layout 구조체에 **`ls_layout-ctab_fname = 'CELLCOLORS'`** 를 매핑 도킹하여, ALV가 각 행의 색상 방 주소를 스스로 찾아 해독하도록 통로를 개설한다.
4. **기술 필드 tech 숨김 가드**:
   - 필드 카탈로그 루프를 돌며, 색상이 적혀있는 deep 필드인 `CELLCOLORS` 기둥에는 **`<fc>-tech = abap_true.`** 가드를 씌워 화면 밖으로 완벽하게 감춘다.

### 어떻게 확인하는가

리팩터링을 마친 후 C001, C002, C003 테스트 데이터를 활용해 색상 투사 무결성을 검수한다.

1. `/nSE38` 을 실행하고 리팩터링 완료된 회차 보고서 프로그램을 실행한다.
2. 예매가 꽉 차서 잔여석이 0석인 회차 셀 칸만 눈에 띄는 빨간색으로 이쁘게 하이라이트 투사되어 나오는지 확인한다. (매진 빨강 검수).
3. 잔여석이 3석 남은 예약 임박 회차 셀 칸만 주의를 끄는 노란색으로 하이라이트 투사되어 나오는지 확인한다. (임박 노랑 검수).
4. 예약 취소를 날려 잔여석이 6석에서 5석으로 줄어드는 순간, Stable Refresh 가 작동하여 **화면 튕김 스크롤 흔들림이 전혀 없이** 해당 셀 칸만 회색에서 노란색으로 부드럽게 리프레시되는지 확인한다. (Stable Refresh 결합 검수 - 최고 중요).

```abap
" [ 콘서트 회차별 잔여석 정밀 색강조 리포트 ]
REPORT zch21_l08_concert_color.

" 1. [ ALV 표시용 Deep 구조 선언 ]
TYPES: BEGIN OF ty_row,
         concert_id TYPE zconcert-concert_id,
         perf_no    TYPE zbooking-perf_no,
         capacity   TYPE i,
         seats_left TYPE i,
         cellcolors TYPE lvc_t_scol, " <-- 셀 색상 자식 테이블을 품은 deep 컴포넌트!
       END OF ty_row.
DATA: lt_row  TYPE STANDARD TABLE OF ty_row,
      lt_fcat TYPE lvc_t_fcat,
      go_grid TYPE REF TO cl_gui_alv_grid.

DATA: ls_layout TYPE lvc_s_layo.

START-OF-SELECTION.
  " [ DB SELECT 가 완료되어 lt_row 에 적재되었다고 가정 ]

  " 2. [비즈니스 코어와 색상 자식 테이블의 조립 루프 기동]
  LOOP AT lt_row ASSIGNING FIELD-SYMBOL(<r>).
    " 업무 코어 클래스 생성자 기동
    DATA(lo_mgr) = NEW zcl_booking_manager(
      iv_concert = <r>-concert_id iv_perf = <r>-perf_no
    ).
    <r>-seats_left = lo_mgr->remaining( ). " 잔여석 업무 연산 접수!
    
    CLEAR <r>-cellcolors.
    
    " 조건부 셀 좌표 색칠 APPEND 집행!
    IF <r>-seats_left <= 0.
      APPEND VALUE lvc_s_scol(
        fname     = 'SEATS_LEFT' " 타깃 컬럼 대문자 지목
        color-col = col_negative " 매진 빨강
        color-int = abap_true
      ) TO <r>-cellcolors.
    ELSEIF <r>-seats_left <= 5.
      APPEND VALUE lvc_s_scol(
        fname     = 'SEATS_LEFT' " 타깃 컬럼 대문자 지목
        color-col = col_total    " 임박 노랑
        color-int = abap_true
      ) TO <r>-cellcolors.
    ENDIF.
  ENDLOOP.

  " --------------------------------------------------
  " ③ [카탈로그 tech 가드 및 Layout ctab_fname 연결]
  " --------------------------------------------------
  " [필드 카탈로그 머지 빌드 완료 가정]
  LOOP AT lt_fcat ASSIGNING FIELD-SYMBOL(<fc>).
    IF <fc>-fieldname = 'CELLCOLORS'.
      <fc>-tech = abap_true. " deep 색상 정보 열은 화면 밖으로 숨김 가드!
    ENDIF.
  ENDLOOP.

  ls_layout-ctab_fname = 'CELLCOLORS'. " 레이아웃과 컬러 필드명 문자열 결합!

  " --------------------------------------------------
  " ④ [첫화면 투사 가동]
  " --------------------------------------------------
  " go_grid->set_table_for_first_display...
```

#### 체험/시뮬레이터 설계 (Concert ALV Color Lab)
- **프로세스 플로우**:
  1. 학습자가 잔여석 3석인 [임박 행]을 쳐다본다. 셀 색이 노란색으로 정갈하게 강조되어 있다.
  2. [예약 +1석 기동]을 누른다.
  3. 내부 예약 처리(`ZCL_BOOKING_MANAGER`)를 거쳐 잔여석이 2석이 되고, Stable Refresh 갱신 코드가 가동된다.
  4. 화면 전체의 깜빡임이나 스크롤 튕김 흔들림이 전혀 없이, 해당 seats_left 노란색 셀 안의 숫자만 '3' 에서 '2' 로 부드럽게 교체되는 물리 상태 적재 애니메이션을 감상한다.
- **상태 및 데이터**:
  - `ctab_fname 과 tech 가드를 동시에 누락한 상태` -> 렌더링 상태: `Raw table data exposed with no color` 테이블 깨짐 시각화.
- **피드백**: 알차고 기품있는 화면 제어는 비즈니스 로직(ZCL)의 계산 결과 데이터가 UI 의 deep 좌표 색상과 레이아웃 매핑선으로 물 흐르듯 결합될 때 성립함을 각인시킨다.

### 실수/주의

- **cellcolors 에 색을 밀어 넣을 때 fname 타깃 기둥의 대소문자를 seats_left 처럼 기재**:
  - 대소문자 어긋남은 컴파일러가 잡아내지 못하는 문자열의 늪이라, 런타임에 에러 덤프도 없이 그냥 색상 투사만 묵살되어 회색으로 죽어 나오므로, **반드시 지칭 필드명은 `SEATS_LEFT` 와 같이 쌩 대문자 하이픈 준수로 적어 도킹해야 함을 엄수**해야 한다.

### 정리

- **`LVC_T_SCOL`** 행에 색을 APPEND 할 때, **`fname = 'SEATS_LEFT'`** 대문자 칭호를 꽂는다.
- Layout 의 **`ctab_fname`** 에 자식 필드명 문자열을 매핑해 화면 연결선을 결합한다.
- 필드 카탈로그에서 색상 그릇 열은 **`tech = abap_true`** 속성으로 격리 숨김 처리한다.
