# CH17_REWRITE - Grid ALV 기초

> 기준: `reference/codex_0625/00_QUALITY_REVIEW.md`의 재작업 판정  
> 대상 원본: `content/abap/CH17/_chapter.md`, `content/abap/CH17/CH17-L01.md` ~ `CH17-L10.md`  
> 산출 목적: v1의 반복 템플릿을 제거하고, CH17을 실제 강의자료로 옮길 수 있는 수준의 재작성 원고로 정리한다.  
> 반영 범위: `content/abap` 원본은 수정하지 않는다. 이 문서는 CH17 재작업 준비 산출물이다.

## CH17 전체 설계

CH17의 한 문장 목표는 "CH16에서 만든 화면 안의 한 영역에 ALV 표를 직접 올리고, 데이터와 컬럼과 모양을 개발자가 조립한다"이다. CH11의 SALV는 적은 코드로 표를 띄우는 좋은 출발점이었다. 하지만 SALV는 "빨리 보여 주기"에 강하고, 화면 안 특정 영역에 붙여 버튼, 입력칸, 상태 표시와 함께 하나의 업무 화면을 만드는 데는 한계가 있다. CH16에서 Dynpro와 Custom Control 영역을 배웠으므로, 이제 그 화면 영역에 Grid ALV를 얹을 차례다.

이 장의 핵심은 암기가 아니라 조립 순서다.

```text
Screen 0100
  -> Custom Control CONT100
      -> CL_GUI_CUSTOM_CONTAINER 객체
          -> CL_GUI_ALV_GRID 객체
              -> 출력 데이터 lt_booking
              -> Field Catalog lt_fcat
              -> Layout ls_layout
              -> Variant ls_variant
              -> set_table_for_first_display
              -> refresh_table_display
```

입문자에게는 이 흐름을 "가구를 놓을 방, 방 안의 책상, 책상 위의 표 자료"처럼 설명하면 좋다. `CONT100`은 화면에 미리 그려 놓은 자리다. `go_cont`는 그 자리를 ABAP 코드가 붙잡기 위한 컨테이너 객체다. `go_grid`는 그 컨테이너 안에 들어가는 실제 표 컨트롤이다. `lt_booking`은 보여 줄 데이터이고, `lt_fcat`은 각 컬럼의 이름표와 너비와 성격을 알려 주는 설명서다. `ls_layout`과 `ls_variant`는 표 전체의 보기 방식과 사용자의 저장 가능한 보기 설정이다.

### CH17의 R15 경계

CH17은 CH01~CH17 classic-first 구간의 마지막 장이다. 따라서 예제 코드는 classic ABAP로 유지한다.

사용하는 것:

- `DATA ... TYPE ...`
- `TYPE REF TO`
- `CREATE OBJECT`
- classic Open SQL `SELECT ... INTO TABLE ... WHERE ...`
- `CALL FUNCTION ... EXPORTING ... CHANGING ...`
- `LOOP AT ... INTO ...`
- `MODIFY ... FROM ... INDEX sy-tabix`
- method call `go_grid->method_name( ... )`

주의해서 다루는 것:

- `TYPE REF TO`, `CREATE OBJECT`, method call은 CH20 객체지향의 정식 학습 전에 등장한다. CH17에서는 `[선행 사용]`으로 표기하고 "객체 이론"이 아니라 "화면 컨트롤을 만들기 위해 필요한 호출 형태"로만 설명한다.
- 셀 색상, 스타일, 합계, 이벤트, 툴바 확장, 더블클릭, 편집 가능 Grid는 CH17의 본문 주제가 아니다. 행 색상까지가 CH17 범위다.
- CH18 이후의 축약 문법, SQL host marker, constructor expression은 CH17 예제에 넣지 않는다.

### 수동 확인한 공식 근거

자동 매칭 힌트를 사용하지 않고 `C:\ABAP_DOCU_HTML`에서 직접 확인한 근거는 다음과 같다.

| 로컬 문서 | CH17에서 쓰는 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_screen.htm` | Dynpro screen element 중 Custom Control이 화면 안 컨트롤 표시 영역임을 확인 |
| `C:\ABAP_DOCU_HTML\abendynpro_custom_controls.htm` | Custom Control, SAP Control Framework, `CL_GUI_CUSTOM_CONTAINER`, container control과 application control 연결 구조 확인 |
| `C:\ABAP_DOCU_HTML\abendynpro_custom_control_abexa.htm` | PBO에서 Custom Container와 control 객체를 처음 한 번 생성하는 예제 흐름 확인 |
| `C:\ABAP_DOCU_HTML\abencontrol_framework_glosry.htm` | `CL_GUI_` 계열 Control Framework 개념 확인 |
| `C:\ABAP_DOCU_HTML\abapcreate_object.htm` | `CREATE OBJECT`가 객체를 만들고 reference variable에 할당한다는 문법 확인 |
| `C:\ABAP_DOCU_HTML\abapselect.htm` | `SELECT` 후 `sy-subrc`, `sy-dbcnt` 확인 기준 |
| `C:\ABAP_DOCU_HTML\abapselect_into_target.htm` | `SELECT ... INTO TABLE ...` 대상 내부 테이블 흐름 확인 |
| `C:\ABAP_DOCU_HTML\abapcall_function.htm` | Function Module 호출과 `sy-subrc` 기준 확인 |
| `C:\ABAP_DOCU_HTML\abapreturn.htm` | ABAP_DOCU 예제 안에서 `CL_GUI_ALV_GRID`, `i_parent`, `set_table_for_first_display`, `it_outtab` 사용 확인 |

`LVC_T_FCAT`, `LVC_S_LAYO`, `DISVARIANT`, `LVC_S_STBL`, `info_fname` 같은 ALV 세부 구조와 필드는 ABAP 키워드 문서의 독립 문법 항목이라기보다 ALV Grid/Class Builder API 영역이다. 이 문서에서는 `11_KEYWORD_AUDIT.md`의 CH17 감사 결과와 원본 커리큘럼 범위를 기준으로 유지하되, 공식문서 근거 표에는 ABAP_DOCU에서 직접 확인한 항목만 넣었다.

## CH17-L01 - CL_GUI_CUSTOM_CONTAINER 생성

### 왜 필요한가

CH16에서 우리는 화면 0100을 만들고 입력칸, 버튼, Custom Control 같은 화면 요소를 배웠다. 그런데 Custom Control을 화면에 그려 놓기만 해서는 아무것도 보이지 않는다. Screen Painter의 Custom Control은 "여기에 어떤 컨트롤을 넣을 수 있다"는 빈 직사각형 영역일 뿐이다. ABAP 코드가 그 영역을 잡아 주고, 그 위에 실제 컨트롤을 얹어야 한다.

CH17-L01의 목적은 이 빈 영역을 ABAP 코드와 연결하는 것이다. 예를 들어 화면에 `CONT100`이라는 Custom Control을 만들었다면, ABAP 프로그램에서는 `CL_GUI_CUSTOM_CONTAINER` 객체를 만들어 `CONT100`이라는 이름의 화면 영역과 연결한다. 이 연결이 되어야 다음 레슨에서 `CL_GUI_ALV_GRID`를 그 안에 넣을 수 있다.

### 무엇인가

`CL_GUI_CUSTOM_CONTAINER`는 Dynpro 화면의 Custom Control 영역을 ABAP 객체로 감싸는 컨테이너 클래스다. 여기서 컨테이너란 데이터를 담는 내부 테이블이 아니라, 화면 컨트롤을 담는 프레젠테이션 영역이다.

처음 배우는 사람에게 꼭 분리해서 설명해야 할 이름이 세 개 있다.

| 이름 | 어디에 있는가 | 의미 |
| --- | --- | --- |
| `CONT100` | Screen Painter | 화면에 그려 놓은 Custom Control의 이름 |
| `go_cont` | ABAP 전역 변수 | `CONT100` 영역을 붙잡는 object reference |
| `CL_GUI_CUSTOM_CONTAINER` | SAP 표준 클래스 | Custom Control 영역과 ABAP Control Framework를 연결하는 클래스 |

이 장에서는 `TYPE REF TO`와 `CREATE OBJECT`를 사용한다. 객체지향 이론은 CH20에서 정식으로 다룬다. 지금은 `[선행 사용]`으로 "컨트롤을 만들기 위해 표준 클래스로 객체를 하나 만든다" 정도만 이해하면 된다.

### 코드

```abap
DATA go_cont TYPE REF TO cl_gui_custom_container.

CREATE OBJECT go_cont
  EXPORTING
    container_name = 'CONT100'.
```

이 코드는 `CONT100`이라는 화면 영역을 찾아 `go_cont`에 연결한다. `container_name`은 ABAP 변수명이 아니라 Screen Painter에 있는 Custom Control의 이름이다. 대소문자보다 중요한 것은 실제 화면 요소 이름과 정확히 맞는지다.

### 어떻게 확인하는가

확인 순서는 세 단계로 잡는다.

1. Screen Painter에서 0100 화면을 열고 Custom Control 이름이 `CONT100`인지 확인한다.
2. PBO 모듈에서 위 코드가 처음 한 번 실행되는지 디버거로 확인한다.
3. `CREATE OBJECT` 다음 줄에서 `go_cont IS INITIAL`이 아닌지 확인한다.

실습 화면에서는 "Screen Painter 이름 확인", "PBO 실행", "컨테이너 생성" 버튼을 차례로 둔다. 첫 버튼을 누르면 화면 도식에서 `CONT100` 직사각형이 강조된다. 두 번째 버튼을 누르면 PBO 타임라인의 현재 위치가 표시된다. 세 번째 버튼을 누르면 `go_cont` 상태가 `initial`에서 `bound`로 바뀐다. 실패 케이스 버튼은 `container_name = 'CONT001'`처럼 이름을 일부러 틀리게 하여 "화면에 그런 이름의 Custom Control이 없으므로 컨테이너가 붙을 수 없다"는 피드백을 보여 준다.

### 실수와 주의

가장 흔한 실수는 Screen Painter의 이름과 코드의 이름이 다르는 것이다. 화면에서는 `CC_ALV`로 만들고 코드에서는 `CONT100`을 넘기면 연결이 되지 않는다. 두 번째 실수는 PBO가 돌 때마다 컨테이너를 새로 만드는 것이다. 컨테이너와 그리드는 화면 컨트롤이므로 매 PBO마다 새로 만들면 중복 생성, 화면 깜박임, 예기치 않은 Control Framework 오류로 이어질 수 있다. 그래서 보통은 `IF go_cont IS INITIAL.` 같은 가드를 둔다.

### 정리

이 레슨은 "화면에 빈 영역을 만들었다"에서 "ABAP 코드가 그 영역을 잡았다"로 넘어가는 단계다. 아직 ALV 표는 없다. 하지만 이 단계가 없으면 다음 단계의 Grid ALV가 들어갈 자리가 없다.

## CH17-L02 - CL_GUI_ALV_GRID 생성

### 왜 필요한가

컨테이너는 자리만 준비한다. 실제로 표를 그리고, 정렬 버튼을 제공하고, 컬럼 너비를 조절하고, 나중에 색상이나 이벤트까지 다룰 주인공은 `CL_GUI_ALV_GRID`다. CH11의 SALV가 "빠르게 표 하나 보여 주기"였다면, CH17의 Grid ALV는 "업무 화면 안에 표 컨트롤을 넣고 세밀하게 제어하기"다.

따라서 L02의 질문은 "표가 어느 화면 영역에 들어갈 것인가"이다. 답은 앞 레슨에서 만든 `go_cont`다.

### 무엇인가

`CL_GUI_ALV_GRID`는 SAP GUI 화면 안에서 동작하는 ALV Grid control 클래스다. 객체를 만들 때 `i_parent`에 부모 컨테이너를 넘긴다. 이 말은 "이 그리드는 `go_cont` 안에 들어간다"는 뜻이다.

SALV와 Grid ALV의 차이를 입문자에게 다음처럼 설명한다.

| 관점 | SALV | Grid ALV |
| --- | --- | --- |
| 목적 | 빠른 목록 표시 | 화면 안 표 컨트롤 구성 |
| 시작 코드 | 상대적으로 짧음 | 컨테이너, 그리드, field catalog, layout 필요 |
| 화면 배치 | 단독 목록 화면에 적합 | Dynpro 안 특정 영역에 배치 가능 |
| 후속 확장 | 제한적 | 색상, 이벤트, 편집, 툴바 확장으로 확장 가능 |

CH17에서는 확장 가능성을 맛만 보여 준다. 이벤트는 CH27, 편집은 CH28, 세부 표시 제어는 CH21에서 다룬다.

### 코드

```abap
DATA go_grid TYPE REF TO cl_gui_alv_grid.

CREATE OBJECT go_grid
  EXPORTING
    i_parent = go_cont.
```

`go_grid`는 표 컨트롤 객체이고, `go_cont`는 그 표가 들어갈 부모 영역이다. `go_cont`가 아직 만들어지지 않았거나 initial이면 `go_grid`를 정상적으로 화면에 붙일 수 없다.

### 어떻게 확인하는가

디버거에서 `CREATE OBJECT go_grid` 직전과 직후를 비교한다.

- 실행 전: `go_cont`는 이미 생성되어 있어야 하고, `go_grid`는 initial이다.
- 실행 후: `go_grid`가 initial이 아니어야 한다.
- 화면 결과: 아직 표가 보이지 않을 수 있다. 이것은 실패가 아니라 정상이다. 데이터, field catalog, display 호출이 아직 없기 때문이다.

체험 설계는 "컨테이너만 있음", "그리드 객체 있음", "데이터 없음" 세 상태를 분리한다. 학습자가 두 번째 단계까지 누르면 화면 오른쪽 상태 패널에 `go_cont: ready`, `go_grid: ready`, `lt_booking: empty`, `lt_fcat: empty`, `display: not called`가 보인다. 이렇게 해야 "그리드를 만들었는데 왜 표가 안 보이지?"라는 초보자의 불안을 줄일 수 있다.

### 실수와 주의

첫째, `i_parent`에 `go_cont`가 아닌 엉뚱한 reference를 넘기면 화면 영역 연결이 깨진다. 둘째, Grid 객체를 만들었다고 해서 데이터가 자동으로 표시되는 것이 아니다. Grid ALV는 컨트롤 객체이고, 실제 표 출력은 L07의 `set_table_for_first_display`에서 이루어진다. 셋째, CH20 이전에는 객체 이론을 깊게 파고들지 않는다. 여기서는 "표 컨트롤을 만드는 표준 절차"로만 익힌다.

### 정리

이 레슨은 "표가 들어갈 자리" 위에 "표를 그릴 컨트롤"을 얹는 단계다. 다음에는 그 표에 넣을 데이터를 준비한다.

## CH17-L03 - 출력용 Internal Table 준비

### 왜 필요한가

ALV는 데이터베이스 테이블을 직접 화면에 마법처럼 붙이는 도구가 아니다. 화면에 보여 줄 데이터는 먼저 ABAP 프로그램 안의 internal table에 담겨야 한다. Grid ALV는 그 internal table을 읽어 행과 열로 그린다.

실무에서는 이 단계가 매우 중요하다. 사용자가 공연 번호를 입력했는데 모든 예매가 다 나오면 안 된다. 선택한 공연의 예매만 조회해야 하고, 조회 결과가 없는 경우도 화면에서 설명할 수 있어야 한다.

### 무엇인가

`lt_booking`은 예매 목록을 담는 출력용 internal table이다. 이 장에서는 `ZBOOKING` 같은 DDIC 구조를 가진 테이블을 기준으로 설명한다. DDIC 구조를 쓰면 필드 이름, 타입, 도메인, 텍스트를 field catalog 자동 생성에 활용할 수 있다.

```abap
DATA lt_booking TYPE STANDARD TABLE OF zbooking.

SELECT * FROM zbooking INTO TABLE lt_booking
  WHERE concert_id = p_concert.
```

classic Open SQL에서는 위처럼 `SELECT ... INTO TABLE ... WHERE ...` 형태로 쓴다. CH19에서 배우는 host marker나 comma field list는 쓰지 않는다.

### 어떻게 확인하는가

조회 직후에는 반드시 세 가지를 본다.

| 확인 항목 | 의미 |
| --- | --- |
| `sy-subrc` | 조회 결과가 있었는지 확인한다. 0이면 결과가 있고, 4이면 보통 결과가 없다. |
| `sy-dbcnt` | DB에서 몇 건이 넘어왔는지 확인한다. |
| `lt_booking` 행 수 | ALV가 그릴 실제 데이터 건수를 확인한다. |

예제 원고에는 다음 확인 코드를 붙일 수 있다.

```abap
IF sy-subrc <> 0.
  MESSAGE '해당 공연의 예매 데이터가 없습니다.' TYPE 'S'.
ENDIF.
```

이 메시지는 프로그램을 종료시키기 위한 것이 아니라, 빈 그리드가 기술 오류인지 정상적인 "조회 결과 없음"인지 구분하기 위한 안내다.

체험 설계는 공연 번호를 바꾸는 입력 패널로 만든다. 버튼은 "C001 조회", "C999 조회", "조건 없이 조회하면?" 세 개를 둔다. `C001`은 4건을 보여 주고, `C999`는 0건과 `sy-subrc = 4`를 보여 준다. "조건 없이 조회하면?"은 많은 데이터가 한꺼번에 들어와 화면이 느려질 수 있다는 경고를 띄운다. 결과 패널에는 `lt_booking` 행 수와 `sy-dbcnt`가 같이 표시된다.

### 실수와 주의

`SELECT *`는 입문 예제에서는 구조를 단순하게 보여 주기 위해 쓸 수 있지만, 실무에서는 필요한 필드만 가져오는 편이 좋다. 다만 CH17은 Grid ALV 조립이 주제이므로 필드 목록 최적화는 CH19 이후 SQL 심화에서 다룬다.

또 하나의 실수는 빈 internal table을 오류로만 보는 것이다. 사용자가 존재하지 않는 공연을 조회하면 빈 표가 정상 결과일 수 있다. 그래서 `sy-subrc`, `sy-dbcnt`, 메시지, 빈 그리드 표시를 함께 설명해야 한다.

### 정리

이 레슨은 "ALV에 무엇을 보여 줄 것인가"를 준비하는 단계다. 다음 레슨에서는 이 데이터의 컬럼을 어떤 제목과 너비로 보여 줄지 정한다.

## CH17-L04 - Field Catalog 기초

### 왜 필요한가

데이터만 있으면 ALV가 어느 정도 표를 그릴 수 있다. 하지만 실무 화면은 "필드명 그대로 나오는 표"로 끝나지 않는다. `SEATS`라는 기술 필드명을 사용자에게 그대로 보여 줄 수도 있지만, "좌석수"라는 제목이 더 좋다. 어떤 컬럼은 좁게, 어떤 컬럼은 넓게, 어떤 컬럼은 숨기거나 강조해야 한다.

이 역할을 하는 것이 Field Catalog다. Field Catalog는 "표의 컬럼 설명서"다.

### 무엇인가

`LVC_T_FCAT`은 ALV Grid용 field catalog internal table 타입이다. 각 행은 하나의 컬럼 설정을 나타내며, 구조는 `LVC_S_FCAT`이다. `fieldname`은 어떤 데이터 필드와 연결되는지, `coltext`는 컬럼 제목을, `outputlen`은 출력 너비를 나타낸다.

DDIC 구조가 있으면 `LVC_FIELDCATALOG_MERGE`로 기본 field catalog를 만들 수 있다.

```abap
DATA lt_fcat TYPE lvc_t_fcat.

CALL FUNCTION 'LVC_FIELDCATALOG_MERGE'
  EXPORTING
    i_structure_name       = 'ZBOOKING'
  CHANGING
    ct_fieldcat            = lt_fcat
  EXCEPTIONS
    inconsistent_interface = 1
    program_error          = 2
    OTHERS                 = 3.

IF sy-subrc <> 0.
  MESSAGE 'Field Catalog를 생성하지 못했습니다.' TYPE 'E'.
ENDIF.
```

자동 생성 후에는 필요한 컬럼만 손으로 다듬는다.

```abap
DATA ls_fcat TYPE lvc_s_fcat.

LOOP AT lt_fcat INTO ls_fcat.
  IF ls_fcat-fieldname = 'SEATS'.
    ls_fcat-coltext   = '좌석수'.
    ls_fcat-outputlen = 8.
    MODIFY lt_fcat FROM ls_fcat INDEX sy-tabix.
  ENDIF.
ENDLOOP.
```

### 어떻게 확인하는가

디버거에서 `lt_fcat`을 열어 행 수와 특정 필드 설정을 확인한다.

- `fieldname = 'SEATS'`인 행이 있는가
- 그 행의 `coltext`가 `좌석수`로 바뀌었는가
- `outputlen`이 8로 바뀌었는가

체험 설계는 "컬럼 설명서 편집기"로 잡는다. 왼쪽에는 `lt_booking` 데이터 샘플을 보여 주고, 오른쪽에는 `lt_fcat`을 컬럼 설정표로 보여 준다. 학습자가 `SEATS` 컬럼을 선택하고 제목을 "좌석수"로 바꾸면, 미리보기 표의 헤더가 즉시 바뀐다. "fieldname 소문자 입력" 버튼을 누르면 `seats`가 실제 DDIC 필드명 `SEATS`와 맞지 않아 수정 대상이 잡히지 않는다는 피드백을 띄운다.

### 실수와 주의

Field Catalog에서 `fieldname`은 출력 데이터의 필드명과 맞아야 한다. 오타가 있으면 그 설정은 적용되지 않는다. 또 `LVC_FIELDCATALOG_MERGE`는 DDIC 구조명을 기준으로 생성하므로, `i_structure_name`에 실제 구조명이 아닌 내부 테이블 변수명을 넣으면 의도대로 동작하지 않는다.

Field Catalog를 비워 둔 채 display를 호출하면 컬럼이 기대처럼 나오지 않거나 화면 구성이 깨질 수 있다. "데이터가 있는데 표가 이상하다"면 가장 먼저 `lt_fcat`이 채워졌는지 확인한다.

### 정리

이 레슨은 "데이터 필드"를 "사용자가 보는 컬럼"으로 번역하는 단계다. 다음에는 컬럼 하나하나가 아니라 표 전체의 보기 방식을 정한다.

## CH17-L05 - Layout 기본 설정

### 왜 필요한가

Field Catalog가 컬럼별 설명서라면 Layout은 표 전체의 보기 설정이다. 같은 데이터라도 줄무늬가 있으면 읽기 쉽고, 컬럼 너비가 자동으로 맞춰지면 사용자가 가로 스크롤을 덜 하게 된다. 제목이 있으면 지금 보고 있는 목록이 무엇인지 바로 알 수 있다.

초보자는 "표가 나오면 끝"이라고 생각하기 쉽다. 하지만 업무 화면에서 표는 반복해서 읽고 비교하는 도구다. 읽기 편한 표는 사용자의 실수를 줄인다.

### 무엇인가

`LVC_S_LAYO`는 Grid ALV의 layout 구조다. 이 레슨에서는 네 가지 정도만 다룬다.

```abap
DATA ls_layout TYPE lvc_s_layo.

ls_layout-zebra      = abap_true.
ls_layout-sel_mode   = 'A'.
ls_layout-grid_title = '예매 목록'.
ls_layout-cwidth_opt = abap_true.
```

각 필드의 교육용 의미는 다음과 같다.

| 필드 | 의미 | 초보자 설명 |
| --- | --- | --- |
| `zebra` | 행 배경을 번갈아 표시 | 긴 목록에서 줄을 놓치지 않게 한다 |
| `sel_mode` | 행 선택 방식 | 사용자가 한 행 또는 여러 행을 선택하는 기준 |
| `grid_title` | 표 제목 | 이 표가 무엇을 보여 주는지 알려 준다 |
| `cwidth_opt` | 컬럼 너비 자동 조정 | 데이터 길이에 맞게 너비를 맞춘다 |

### 어떻게 확인하는가

확인은 화면 결과로 한다.

- 행 배경이 번갈아 표시되는가
- 표 위쪽 제목이 `예매 목록`으로 보이는가
- 컬럼 너비가 데이터에 맞게 조정되는가
- 행 선택이 의도한 방식으로 가능한가

체험 설계는 layout 토글 패널로 만든다. `zebra`, `cwidth_opt`, `grid_title`, `sel_mode`를 각각 켜고 끌 수 있게 하고, 오른쪽 미리보기 표가 즉시 바뀌게 한다. 피드백 영역에는 "지금 바뀐 것은 데이터가 아니라 표 전체 보기 설정입니다"라고 표시한다. `cwidth_opt`를 끄면 긴 고객명이 잘리는 모습을 보여 주고, 켜면 컬럼이 넓어지는 모습을 보여 준다.

### 실수와 주의

Layout 구조를 채워 놓고 `set_table_for_first_display`의 `is_layout`에 넘기지 않으면 아무 효과가 없다. 설정을 만들었는지와 display 호출에 실제로 전달했는지를 분리해서 확인해야 한다.

또한 처음부터 너무 많은 layout 옵션을 넣으면 학습자가 핵심을 놓친다. CH17에서는 `zebra`, `sel_mode`, `grid_title`, `cwidth_opt` 정도로 시작하고, 셀 스타일과 세부 표시 제어는 후속 챕터로 분리한다.

### 정리

이 레슨은 "표 전체를 읽기 좋게 만드는 설정"을 다룬다. 다음에는 사용자가 컬럼 배치와 필터 상태를 저장하고 다시 불러오는 Variant를 연결한다.

## CH17-L06 - Variant 기본 설정

### 왜 필요한가

현업 사용자는 같은 표를 같은 방식으로 보지 않는다. 회계 담당자는 금액 컬럼을 앞에 두고 싶고, 운영 담당자는 상태와 변경일을 먼저 보고 싶을 수 있다. 매번 컬럼을 드래그하고 필터를 다시 잡게 하면 화면은 불편한 도구가 된다. ALV의 Variant는 사용자가 자기 보기 방식을 저장하고 다시 불러오게 해 준다.

CH17에서는 Variant의 내부 저장 구조를 깊게 들어가지 않는다. "이 프로그램의 ALV 보기 설정을 저장할 수 있게 연결한다"는 수준이면 충분하다.

### 무엇인가

Grid ALV에서 Variant를 연결할 때 대표적으로 `DISVARIANT` 구조를 사용한다. 가장 중요한 필드는 `report`다.

```abap
DATA ls_variant TYPE disvariant.

ls_variant-report = sy-repid.
```

`sy-repid`는 현재 실행 중인 프로그램 이름이다. Variant를 프로그램별로 구분하려면 이 값이 필요하다. display 호출에서는 `is_variant`와 `i_save`를 함께 넘긴다.

```abap
go_grid->set_table_for_first_display(
  EXPORTING
    is_variant = ls_variant
    i_save     = 'A'
    is_layout  = ls_layout
  CHANGING
    it_outtab       = lt_booking
    it_fieldcatalog = lt_fcat ).
```

`i_save = 'A'`는 저장을 허용하는 교육용 설정으로 설명한다. 실제 운영 정책에서는 사용자별, 전역, 권한 기준을 프로젝트 규칙에 맞춰 정해야 한다.

### 어떻게 확인하는가

화면에서 ALV 툴바의 layout 또는 variant 관련 버튼을 확인한다. 사용자가 컬럼 순서를 바꾸고 저장한 뒤, 화면을 다시 열었을 때 저장한 보기 방식이 나타나는지 본다. 디버거에서는 `ls_variant-report`가 현재 프로그램명인지 확인한다.

체험 설계는 "사용자 A와 사용자 B의 보기"로 만든다. 사용자 A는 `CUSTOMER`, `SEATS` 순서로 저장하고, 사용자 B는 `STATUS`, `BOOKING_ID`를 앞에 둔다. "Variant 저장" 버튼을 누르면 왼쪽에는 저장된 컬럼 순서가 카드 형태로 남고, "다시 열기" 버튼을 누르면 그 순서가 복원된다. 실패 케이스로 `report`를 비워 두면 "어느 프로그램의 variant인지 기준이 약해져 저장/조회가 꼬일 수 있다"는 메시지를 보여 준다.

### 실수와 주의

Variant는 개발자가 기본 화면을 만드는 기능이면서 동시에 사용자가 자신의 보기 방식을 저장하는 기능이다. 그래서 운영 환경에서는 저장 범위를 함부로 열면 안 된다. 전역 variant를 아무나 바꿀 수 있게 하면 모든 사용자의 화면이 바뀌었다고 느낄 수 있다.

초보자에게는 "Variant는 데이터 저장이 아니다"라고 강조한다. 예매 데이터가 저장되는 것이 아니라, 컬럼 순서, 필터, 정렬 같은 표시 방식이 저장된다.

### 정리

이 레슨은 "사용자가 표를 자기 방식으로 다시 볼 수 있게 하는 장치"를 연결한다. 다음에는 지금까지 만든 데이터, field catalog, layout, variant를 한 번에 넘겨 실제 표를 띄운다.

## CH17-L07 - SET_TABLE_FOR_FIRST_DISPLAY

### 왜 필요한가

L01부터 L06까지는 조각을 만들었다. 자리, 그리드 객체, 데이터, 컬럼 설명서, 표 전체 모양, variant가 각각 준비되었다. 하지만 조각이 준비되었다고 화면에 표가 자동으로 나타나지는 않는다. Grid ALV에게 "이 데이터와 이 컬럼 설명서와 이 layout으로 처음 표를 그려라"라고 말하는 호출이 필요하다.

그 호출이 `set_table_for_first_display`다.

### 무엇인가

`set_table_for_first_display`는 Grid ALV를 처음 화면에 표시할 때 사용하는 대표 메서드다. `EXPORTING`에는 layout, variant, 저장 옵션처럼 설정 성격의 값을 넘기고, `CHANGING`에는 화면과 연결되어 표시될 internal table과 field catalog를 넘긴다.

```abap
go_grid->set_table_for_first_display(
  EXPORTING
    is_layout       = ls_layout
    is_variant      = ls_variant
    i_save          = 'A'
  CHANGING
    it_outtab       = lt_booking
    it_fieldcatalog = lt_fcat
  EXCEPTIONS
    invalid_parameter_combination = 1
    program_error                 = 2
    too_many_lines                = 3
    OTHERS                        = 4 ).

IF sy-subrc <> 0.
  MESSAGE 'ALV Grid를 처음 표시하지 못했습니다.' TYPE 'E'.
ENDIF.
```

입문자에게는 `EXPORTING`과 `CHANGING`을 어려운 문법 설명으로만 밀어붙이지 말고 역할로 나눈다. `is_layout`, `is_variant`, `i_save`는 "어떻게 보일지"에 가깝다. `it_outtab`, `it_fieldcatalog`는 "무엇을 어떤 컬럼으로 그릴지"에 가깝다.

### 어떻게 확인하는가

기존 위젯 `CH17-L07-S01`을 중심 체험 장치로 사용한다.

위젯의 버튼 흐름은 다음과 같이 해석시킨다.

| 단계 | 학습자가 보는 변화 | 연결 코드 |
| --- | --- | --- |
| 1 | `CONT100` 컨테이너가 준비된다 | `CREATE OBJECT go_cont` |
| 2 | Grid 객체가 컨테이너에 붙는다 | `CREATE OBJECT go_grid` |
| 3 | `lt_fcat` 컬럼 설명서가 만들어진다 | `LVC_FIELDCATALOG_MERGE` |
| 4 | 실제 표가 나타난다 | `set_table_for_first_display` |

확인 포인트는 "표가 보인다"에서 끝내지 않는다.

- 컬럼 제목이 field catalog와 맞는가
- 데이터 건수가 `lt_booking`과 같은가
- layout의 제목과 줄무늬가 적용되었는가
- variant 저장 버튼이 보이는가
- `sy-subrc`가 0인가

실패 케이스 체험에는 네 개의 토글을 둔다. "컨테이너 없음", "field catalog 비움", "데이터 0건", "layout 미전달"이다. 각 토글을 켜고 display를 누르면 화면의 어떤 부분이 달라지는지 보여 준다. 특히 데이터 0건은 오류가 아니라 빈 결과일 수 있고, field catalog 비움은 설정 누락이라는 점을 구분한다.

### 실수와 주의

첫 번째 실수는 `set_table_for_first_display`를 PBO마다 반복 호출하는 것이다. 이 메서드는 처음 표시할 때 쓰고, 이미 표시된 뒤 데이터만 바뀌면 L08의 refresh를 쓴다. 두 번째 실수는 `it_outtab`과 `it_fieldcatalog`를 준비하지 않고 호출하는 것이다. 세 번째 실수는 `EXPORTING`과 `CHANGING` 위치를 섞는 것이다.

### 정리

이 레슨은 CH17의 첫 번째 완성 순간이다. 데이터가 화면의 Grid ALV로 바뀐다. 다음에는 데이터가 바뀐 뒤 화면을 다시 그리는 방법을 배운다.

## CH17-L08 - Refresh와 Stable Refresh 기초

### 왜 필요한가

한 번 띄운 ALV 표는 자동으로 계속 최신 상태가 되지 않는다. 프로그램의 internal table을 바꿨다면, 화면에 이미 떠 있는 Grid에도 다시 그리라고 알려야 한다. 예매 취소, 상태 변경, 재조회 같은 업무 화면에서는 이 차이가 중요하다.

초보자는 internal table이 바뀌면 화면도 바로 바뀐다고 생각하기 쉽다. 하지만 화면 컨트롤은 이미 그려진 상태다. 데이터 변경과 화면 갱신은 별개의 단계다.

### 무엇인가

`refresh_table_display`는 이미 표시된 Grid ALV를 다시 그리는 메서드다.

```abap
go_grid->refresh_table_display( ).
```

그러나 단순 refresh는 사용자가 보고 있던 위치를 잃게 만들 수 있다. 예를 들어 사용자가 200번째 행 근처를 보고 있었는데 refresh 후 맨 위로 튀면 매우 불편하다. Stable Refresh는 행과 컬럼 위치를 가능한 유지하면서 다시 그리도록 요청한다.

```abap
DATA ls_stable TYPE lvc_s_stbl.

ls_stable-row = abap_true.
ls_stable-col = abap_true.

go_grid->refresh_table_display(
  EXPORTING
    is_stable = ls_stable
  EXCEPTIONS
    finished  = 1
    OTHERS    = 2 ).

IF sy-subrc <> 0.
  MESSAGE 'ALV Grid 새로고침 중 문제가 발생했습니다.' TYPE 'S'.
ENDIF.
```

### 어떻게 확인하는가

확인은 반드시 "데이터가 바뀌었는가"와 "화면이 바뀌었는가"를 나눠서 한다.

1. 디버거에서 `lt_booking`의 특정 행 상태를 바꾼다.
2. refresh를 호출하지 않고 화면을 본다. 화면은 아직 예전 값일 수 있다.
3. `refresh_table_display`를 호출한다. 화면 값이 바뀌는지 확인한다.
4. 스크롤을 중간으로 옮긴 뒤 stable 없이 refresh한다.
5. 다시 스크롤을 중간으로 옮긴 뒤 stable refresh를 호출한다.

체험 설계는 두 개의 표를 나란히 둔다. 왼쪽은 internal table 상태, 오른쪽은 화면 Grid 상태다. "예약 상태 변경" 버튼을 누르면 왼쪽만 바뀐다. "일반 Refresh" 버튼을 누르면 오른쪽도 바뀌지만 스크롤 위치가 맨 위로 이동한다. "Stable Refresh" 버튼을 누르면 오른쪽이 바뀌면서 현재 행과 컬럼 위치가 유지된다. 피드백 영역에는 "데이터 변경", "화면 갱신", "위치 보존" 세 체크 표시를 분리해서 보여 준다.

### 실수와 주의

가장 큰 실수는 internal table만 바꾸고 refresh를 부르지 않는 것이다. 이 경우 디버거에서는 데이터가 바뀌었는데 사용자는 화면이 안 바뀌었다고 느낀다.

두 번째 실수는 모든 상황에서 처음 display를 다시 호출하는 것이다. 이미 Grid가 만들어진 뒤에는 display 재호출보다 refresh가 맞다. 처음 구성과 갱신을 분리해야 화면이 안정적이다.

Stable Refresh도 만능은 아니다. 데이터 정렬이 크게 바뀌거나 행 자체가 삭제되면 사용자가 보던 행과 정확히 같은 위치를 유지하기 어렵다. 그래도 실무 화면에서는 일반 refresh보다 훨씬 친절한 기본값이다.

### 정리

이 레슨은 "이미 띄운 표를 다시 그리는 방법"을 다룬다. display는 처음, refresh는 이후 갱신이다. 다음에는 특정 행을 색으로 강조한다.

## CH17-L09 - 행 색상 기초

### 왜 필요한가

업무 표에서 모든 행이 같은 무게로 보이면 사용자는 중요한 상태를 놓치기 쉽다. 예매 목록이라면 매진된 회차, 취소가 많은 회차, 확인이 필요한 회차가 눈에 먼저 들어와야 한다. 색상은 데이터를 바꾸는 기능이 아니라 사용자의 주의를 올바른 곳으로 보내는 표시 기능이다.

CH17에서는 행 전체 색상만 다룬다. 셀 하나만 색칠하거나 아이콘, 스타일을 넣는 것은 후속 표시 제어 범위다.

### 무엇인가

Grid ALV의 행 색상은 출력 internal table의 각 행에 색상 코드 필드를 두고, layout의 `info_fname`에 그 필드명을 알려 주는 방식으로 설명한다.

교육용 예시는 공연 회차 목록이다. 매진된 회차는 행 전체를 강조한다.

```abap
TYPES: BEGIN OF ty_perf_alv,
         concert_id TYPE zperf-concert_id,
         perf_date  TYPE zperf-perf_date,
         seatsocc   TYPE zperf-seatsocc,
         capacity   TYPE zperf-capacity,
         rowcolor   TYPE c LENGTH 4,
       END OF ty_perf_alv.

DATA: lt_perf TYPE STANDARD TABLE OF ty_perf_alv,
      ls_perf TYPE ty_perf_alv.

LOOP AT lt_perf INTO ls_perf.
  IF ls_perf-seatsocc >= ls_perf-capacity.
    ls_perf-rowcolor = 'C610'.
    MODIFY lt_perf FROM ls_perf INDEX sy-tabix.
  ENDIF.
ENDLOOP.

ls_layout-info_fname = 'ROWCOLOR'.
```

핵심은 두 가지다. 첫째, 데이터 행 안에 색상 코드가 있어야 한다. 둘째, layout이 그 필드명을 알아야 한다. 둘 중 하나라도 빠지면 색이 보이지 않는다.

### 어떻게 확인하는가

디버거에서 먼저 `lt_perf`를 확인한다.

- 매진 행의 `rowcolor`가 `C610`인지
- 매진이 아닌 행의 `rowcolor`가 비어 있는지
- `ls_layout-info_fname`이 `ROWCOLOR`인지

화면에서는 매진 행 전체가 색상으로 강조되는지 확인한다. 이때 "색이 안 보인다"면 원인을 세 가지로 나눠 추적한다.

1. 색상 코드가 행에 들어갔는가
2. `info_fname`이 정확한 필드명을 가리키는가
3. display 또는 refresh가 호출되었는가

체험 설계는 "매진 판정 슬라이더"로 만든다. `capacity`와 `seatsocc` 값을 바꾸면 행 상태가 `여유`, `임박`, `매진`으로 바뀐다. "색 코드 쓰기" 버튼을 누르면 internal table의 `rowcolor` 컬럼이 채워지고, "layout에 연결" 버튼을 누르면 실제 표에 색이 입혀진다. 일부러 `info_fname = 'ROW_COLOR'`처럼 틀린 값을 선택하는 실패 버튼도 둔다. 피드백은 "색 코드 존재", "필드명 일치", "화면 갱신" 세 조건 중 무엇이 빠졌는지 알려 준다.

### 실수와 주의

색상 코드는 임의 RGB 값이 아니다. CH17에서는 `C610` 같은 ALV 색상 코드 형식으로만 다룬다. 그리고 `info_fname`은 "색상 코드 값"이 아니라 "색상 코드가 들어 있는 필드명"이다. 이 차이를 모르면 `ls_layout-info_fname = 'C610'`처럼 잘못 쓰게 된다.

또 하나의 경계는 행 색상과 셀 색상을 섞지 않는 것이다. CH17의 목표는 행 전체 강조다. 셀 하나만 색칠하는 구조, 스타일 테이블, 버튼 이벤트와 연결한 동적 반응은 CH21 이후로 넘긴다.

### 정리

이 레슨은 "중요한 행을 사용자가 놓치지 않게 표시하는 방법"을 다룬다. 데이터 행의 색상 필드와 layout의 `info_fname`이 함께 있어야 한다.

## CH17-L10 - 종합 실습: 예매 목록 Grid ALV 완성

### 왜 필요한가

지금까지는 조각을 하나씩 배웠다. 하지만 실무에서는 조각이 아니라 하나의 화면이 필요하다. 사용자가 공연 번호를 입력하고, 화면 0100 안의 `CONT100` 영역에서 예매 목록을 보고, 새로고침해도 화면이 안정적으로 유지되어야 한다.

L10의 목표는 CH17의 전체 흐름을 하나의 프로그램 골격으로 합치는 것이다.

### 완성 골격

이 예제는 화면 0100에 Custom Control `CONT100`이 있다고 가정한다. PBO의 `status_0100` 모듈에서 처음 한 번은 ALV를 만들고, 이후에는 refresh만 한다.

```abap
DATA: go_cont    TYPE REF TO cl_gui_custom_container,
      go_grid    TYPE REF TO cl_gui_alv_grid,
      lt_booking TYPE STANDARD TABLE OF zbooking,
      lt_fcat    TYPE lvc_t_fcat,
      ls_layout  TYPE lvc_s_layo,
      ls_variant TYPE disvariant.

MODULE status_0100 OUTPUT.
  IF go_grid IS INITIAL.
    PERFORM build_alv.
  ELSE.
    PERFORM refresh_alv.
  ENDIF.
ENDMODULE.

FORM build_alv.
  PERFORM select_booking.
  PERFORM create_grid.
  PERFORM build_fieldcat.
  PERFORM build_layout.
  PERFORM display_grid.
ENDFORM.

FORM select_booking.
  SELECT * FROM zbooking INTO TABLE lt_booking
    WHERE concert_id = p_concert.

  IF sy-subrc <> 0.
    MESSAGE '해당 공연의 예매 데이터가 없습니다.' TYPE 'S'.
  ENDIF.
ENDFORM.

FORM create_grid.
  CREATE OBJECT go_cont
    EXPORTING
      container_name = 'CONT100'.

  CREATE OBJECT go_grid
    EXPORTING
      i_parent = go_cont.
ENDFORM.

FORM build_fieldcat.
  DATA ls_fcat TYPE lvc_s_fcat.

  CALL FUNCTION 'LVC_FIELDCATALOG_MERGE'
    EXPORTING
      i_structure_name       = 'ZBOOKING'
    CHANGING
      ct_fieldcat            = lt_fcat
    EXCEPTIONS
      inconsistent_interface = 1
      program_error          = 2
      OTHERS                 = 3.

  IF sy-subrc <> 0.
    MESSAGE 'Field Catalog를 생성하지 못했습니다.' TYPE 'E'.
  ENDIF.

  LOOP AT lt_fcat INTO ls_fcat.
    IF ls_fcat-fieldname = 'SEATS'.
      ls_fcat-coltext   = '좌석수'.
      ls_fcat-outputlen = 8.
      MODIFY lt_fcat FROM ls_fcat INDEX sy-tabix.
    ENDIF.
  ENDLOOP.
ENDFORM.

FORM build_layout.
  ls_layout-zebra      = abap_true.
  ls_layout-sel_mode   = 'A'.
  ls_layout-grid_title = '예매 목록'.
  ls_layout-cwidth_opt = abap_true.

  ls_variant-report = sy-repid.
ENDFORM.

FORM display_grid.
  go_grid->set_table_for_first_display(
    EXPORTING
      is_layout       = ls_layout
      is_variant      = ls_variant
      i_save          = 'A'
    CHANGING
      it_outtab       = lt_booking
      it_fieldcatalog = lt_fcat
    EXCEPTIONS
      invalid_parameter_combination = 1
      program_error                 = 2
      too_many_lines                = 3
      OTHERS                        = 4 ).

  IF sy-subrc <> 0.
    MESSAGE 'ALV Grid를 처음 표시하지 못했습니다.' TYPE 'E'.
  ENDIF.
ENDFORM.

FORM refresh_alv.
  DATA ls_stable TYPE lvc_s_stbl.

  ls_stable-row = abap_true.
  ls_stable-col = abap_true.

  go_grid->refresh_table_display(
    EXPORTING
      is_stable = ls_stable
    EXCEPTIONS
      finished  = 1
      OTHERS    = 2 ).

  IF sy-subrc <> 0.
    MESSAGE 'ALV Grid 새로고침 중 문제가 발생했습니다.' TYPE 'S'.
  ENDIF.
ENDFORM.
```

이 골격은 길지만 의도적으로 나누어져 있다. 입문자에게 긴 코드를 한 덩어리로 보여 주면 어느 줄이 어떤 책임인지 놓친다. `select_booking`, `create_grid`, `build_fieldcat`, `build_layout`, `display_grid`, `refresh_alv`로 나누면 CH17의 조립 순서가 함수 이름에 드러난다.

### 어떻게 확인하는가

기존 위젯 `CH17-L10-S01`을 종합 실습의 중심에 둔다. 위젯의 "다음 단계" 버튼은 완성 프로그램을 다음 순서로 쌓아 올린다.

1. 데이터 선언과 `SELECT`
2. Custom Container 생성
3. ALV Grid 객체 생성
4. Field Catalog와 Layout 구성
5. `set_table_for_first_display`로 출력

실제 강의에서는 위젯 앞에 "오늘 완성할 화면" 다이어그램을 둔다.

```text
[Screen 0100]
-------------------------------------------------
| 공연번호 p_concert: C001      [조회] [뒤로]    |
|                                               |
| [Custom Control CONT100]                      |
|   BOOKING_ID | CUSTOMER | SEATS | STATUS       |
|   5001       | 정훈영   | 2     | N            |
|   5002       | 손흥민   | 4     | N            |
-------------------------------------------------
```

위젯 뒤에는 체크리스트를 둔다.

| 체크 | 질문 |
| --- | --- |
| 화면 영역 | 0100 화면에 `CONT100`이 있는가 |
| 생성 가드 | `go_grid IS INITIAL`일 때만 build하는가 |
| 데이터 | `lt_booking` 행 수와 화면 행 수가 맞는가 |
| 컬럼 | `lt_fcat` 변경이 화면 컬럼 제목에 반영되는가 |
| 모양 | zebra, title, width 설정이 반영되는가 |
| 갱신 | 두 번째 PBO부터 display가 아니라 refresh가 호출되는가 |

### 체험 과제

CH17 범위 안에서 가능한 과제만 낸다.

1. 공연 번호를 바꿔 조회했을 때 `lt_booking` 행 수와 화면 행 수를 비교한다.
2. `SEATS` 컬럼 제목을 `좌석수`에서 `예약 좌석`으로 바꾸고 field catalog 반영을 확인한다.
3. `ls_layout-cwidth_opt`를 끄고 켠 뒤 컬럼 너비 변화를 비교한다.
4. 데이터 변경 후 일반 refresh와 stable refresh의 차이를 비교한다.
5. L09 방식으로 매진 행 전체 색상을 연결한다.

합계 버튼, 셀 단위 색상, 툴바 이벤트, 더블클릭, 편집 가능 컬럼은 과제로 내지 않는다. 해당 기능은 후속 챕터에서 정식으로 다룬다.

### 실수와 주의

L10에서 가장 중요한 실수는 "처음 구성"과 "이후 갱신"을 섞는 것이다. `set_table_for_first_display`는 처음 한 번, `refresh_table_display`는 이후 갱신이라는 원칙을 화면 흐름 안에 고정해야 한다.

두 번째 실수는 Custom Control 이름을 화면과 코드에서 다르게 쓰는 것이다. 세 번째 실수는 `LVC_FIELDCATALOG_MERGE`가 실패했는데도 `lt_fcat`을 확인하지 않고 display로 넘어가는 것이다. 네 번째 실수는 예매 데이터가 0건인 상황을 덤프나 코드 오류처럼 설명하는 것이다. 조회 결과 없음은 정상 업무 상황일 수 있다.

### 정리

CH17은 "표를 보여 주는 코드"가 아니라 "화면 안 표 컨트롤을 조립하는 코드"다. 컨테이너, 그리드, 데이터, field catalog, layout, variant, display, refresh가 각각 맡은 책임을 알아야 이후 CH21의 표시 제어, CH27의 이벤트, CH28의 편집 Grid를 흔들리지 않고 배울 수 있다.

## CH17 마무리 학습 흐름

학습자가 CH17을 마치면 다음 질문에 답할 수 있어야 한다.

| 질문 | 기대 답변 |
| --- | --- |
| SALV와 Grid ALV의 차이는 무엇인가 | SALV는 빠른 목록 표시, Grid ALV는 Dynpro 화면 안 세밀 제어에 적합하다 |
| Custom Control과 Custom Container는 같은가 | 아니다. Custom Control은 화면 영역이고, Custom Container는 그 영역을 ABAP 코드와 연결한 객체다 |
| Grid 객체만 만들면 표가 보이는가 | 아니다. 데이터, field catalog, layout, display 호출이 필요하다 |
| Field Catalog는 왜 필요한가 | 컬럼 제목, 너비, 속성처럼 데이터 필드를 화면 컬럼으로 번역하기 위해 필요하다 |
| Layout은 무엇을 바꾸는가 | 표 전체의 줄무늬, 선택 모드, 제목, 너비 자동 조정 같은 보기 방식을 바꾼다 |
| Variant는 데이터를 저장하는가 | 아니다. 사용자의 보기 방식과 레이아웃 설정을 저장한다 |
| 처음 표시와 갱신은 무엇이 다른가 | 처음은 `set_table_for_first_display`, 이후 데이터 변경 반영은 `refresh_table_display`다 |
| 행 색상이 안 보이면 무엇을 확인하는가 | 색상 필드 값, `info_fname` 필드명, display 또는 refresh 호출 여부를 확인한다 |

강의 마지막에는 CH18로 넘어가기 전에 classic 코드가 길어지는 이유를 인정해 준다. CH17의 긴 코드는 실패가 아니다. 컨테이너, 데이터, 컬럼, 모양, 사용자 variant, 갱신을 각각 직접 제어하기 때문에 길다. CH18에서는 이런 classic 코드를 더 간결하게 쓰는 문법을 배우지만, CH17에서 조립 순서를 이해하지 못하면 짧아진 문법도 의미가 없다.
