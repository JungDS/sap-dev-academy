# CH17_REWRITE - Grid ALV 기초 v1

> 목적: `content/abap/CH17`의 10개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH17 전체 설계

CH17의 한 문장 목표는 "단독 뷰에 갇힌 간단 SALV의 한계를 깨고, Custom Container(cl_gui_custom_container) 도킹 다리와 Grid ALV(cl_gui_alv_grid) 컨트롤, 자동/수동 하이브리드 Field Catalog(LVC_T_FCAT) 조립, Layout 및 Variant 전체 셋업, 첫 디스플레이 지시 및 Stable Refresh 갱신, 그리고 행 하이라이트 색상 매핑을 책임 분할 FORM 징검다리로 구현하여, 딘프로 메인 화면 안에 위치 보존형 공연 예매 그리드를 완성한다"이다.

IT 비전공자 입문자는 엑셀 격자판이 자동으로 DB와 동기화된다고 오해하여 SELECT 누락 버그를 내고, Field Catalog 빌드 시 필드명을 소문자로 기입해 헤더를 깨트리며, 갱신 시 `set_table_for_first_display`를 매번 중복 호출해 깜박임 덤프를 터트리고, 행 색상 지정 시 Layout의 `info_fname`에 색 코드를 문자열로 직접 대입하는 오류를 범한다.
따라서 본 챕터는 다음과 같은 불편 해결의 단계적 설계로 전개한다.

1. **엑셀의 빈 유리창 뚫기**: 딘프로 화면의 좁은 컴포넌트를 넘어, 표 데이터를 넉넉히 수납할 사각 빈 공간(Custom Control)에 **`cl_gui_custom_container`** 도킹 다리를 개설하는 기술.
2. **격자판 장착 (CL_GUI_ALV_GRID)**: 빈 구역 위에 정렬, 합계, 스크롤을 탑재한 표의 실제 집행 장치인 **Grid ALV** 컨트롤을 얹고 부모 컨테이너(`i_parent`)와 묶어 바인딩.
3. **화물차 준비 (Internal Table)**: DB에서 조회한 원천 화물들을 가두는 내부 테이블 수혈과 0건 조회 결과의 정상성 분기.
4. **컬럼 번역 명세서 (Field Catalog)**: `LVC_FIELDCATALOG_MERGE`로 뼈대를 가져온 뒤, 소문자 오작동 주의 가드라인 아래에서 `coltext`와 `outputlen`을 튜닝하는 하이브리드 컬럼 셋업.
5. **스프레드시트 스킨 조율 (Layout)**: `zebra` 줄무늬, `grid_title` 제목, `cwidth_opt` 가로 폭 최적화 등 표 전체 스킨을 `LVC_S_LAYO` 구조체로 제어.
6. **사용자별 개별 서랍 (Display Variant)**: `sy-repid` 키와 `i_save = 'A'`를 물려, 사용자마다 맘대로 드래그한 컬럼 순서와 필터를Variant 서랍에 봉인 저장하는 기술.
7. **기차 출발 신호 (FIRST DISPLAY)**: 설정(EXPORTING)과 데이터(CHANGING)로 짐을 실어 **`set_table_for_first_display`** 라는 출발 스위치를 켜는 문법 정합성 수립.
8. **스크롤 사수 (Stable Refresh)**: 갱신 시 중복 호출의 폐해를 막고, **`refresh_table_display`** 의 `is_stable-row/col`을 켜서 사용자가 보던 행과 열 스크롤 자리를 칼같이 사수하는 기법.
9. **주의 환기 하이라이트 (Row Color)**: 데이터 구조 내부에 `rowcolor` 필드를 추가하고, Layout의 **`info_fname`** 에 필드명 문자열을 물려 매진 행 전체에 빨간색(`C610`) 조명을 켜는 행 하이라이팅.
10. **예매 목록 그리드 종합 실습**: PBO 1회 가동 시에만 `build_alv` (5대 FORM 체인)을 가동하고, 이후 데이터 변경 시에는 refresh로 통제하는 완성형 딘프로 예매 ALV 종합 실습.

### 범위와 금지선

- **R6 classic-first 철저 수호**: 
  - `CREATE OBJECT go_cont EXPORTING container_name = ...` 와 같이 classic 객체 생성 지시어와 명시적 데이터 오브젝트 변수 매핑을 엄수한다. modern `NEW` 나 인라인 `@DATA` 호스트 변수는 완벽히 차단한다.
- **변수 스코프 접두어**: 모든 스크립트는 전역 범위로 간주하며, 일반 변수는 `gv_`, 구조체는 `gs_`, 내부 테이블은 `gt_`, 클래스 인스턴스 참조 변수는 `go_` 접두어를 엄수한다.
- **이름 풀 준수**: 예제 이름은 지정된 이름 풀에서만 가져오며, 주인공은 항상 **정훈영**으로 통일한다.

---

## CH17-L01 - CL_GUI_CUSTOM_CONTAINER 생성

### 왜 필요한가

우리가 앞서 배웠던 `SALV`(CH11)는 화면 전체를 표 하나가 꽉 채워서 보여주는 고정식 리포트 형태였다. 
하지만 실무 업무용 딘프로 화면은 그렇게 통짜로만 생기지 않았다. 
"화면 위쪽에는 예매 대상 공연 정보 입력 필드를 배치하고, 그 바로 아랫줄 영역에만 좌석 예매 현황 표를 깔끔하게 박아두어 한눈에 입력과 조회를 병행하게 하고 싶다" 
하지만 화면을 그리는 딘프로(SE51) 자체는 복잡한 표를 렌더링할 능력이 없다. 

화면 레이아웃 상에 자를 대고 선을 긋듯 사각의 **빈자리 구역(Custom Control)**을 구획해 뚫어둔 뒤, 백엔드 아밥에서 이 구획 영역을 튼튼하게 틀어쥐고 제어할 수 있는 **물리적 도킹 다리(Container)**를 개설하여 결합해 주어야 한다. 그것이 **[[CL_GUI_CUSTOM_CONTAINER]]** (커스텀 컨테이너)이다.

### 무엇인가

#### 1. Custom Control 과 Custom Container 의 개념
- **Custom Control (화면 상의 구멍)**: Screen Painter Layout 상에 배치해 두는 **빈 사각 영역**이다. (예: 이름 `'CONT100'`). 백엔드 로직이 도킹할 자리 역할을 하는 껍데기다.
- **Custom Container (물리 도킹 다리 객체)**: 이 화면 상의 빈 구멍과 아바 소스 코드를 연결해 주는 다리 역할을 담당하는 SAP 표준 프레젠테이션 클래스(`CL_GUI_CUSTOM_CONTAINER`) 객체다. 
- *주의*: 여기서 컨테이너는 데이터를 저장하는 그릇(내부 테이블)이 아니라, 화면 UI 개체를 적재해 도킹시키는 **화면 구성용 컨테이너 구역**을 뜻한다.

#### 2. 컨테이너 생성과 바인딩의 법칙
- PBO 시점에 `CREATE OBJECT`를 가동하여 컨테이너 인스턴스를 빌드할 때, 화면 구멍 이름인 `container_name`을 파라미터 매핑으로 넘겨준다.
- **`container_name = 'CONT100'`**: 이때 이름은 단순 문자열이 아니라, Screen Painter Layout에 지정한 객체명과 **대소문자까지 100% 일치**해야 도킹에 성공한다. 이름이 어긋나면 연결되지 않고 유실된다.

### 어떻게 확인하는가

PBO 모듈 안에서 안전 가드를 설치하고 컨테이너 다리를 개설하는 구문을 확인한다.

```abap
REPORT zch17_l01_container.

" [선언 철칙] cl_gui_custom_container 인스턴스를 쥐기 위한 전역 참조 변수 선언!
DATA go_cont TYPE REF TO cl_gui_custom_container.

MODULE create_container_0100 OUTPUT.
  " [PBO 중복 생성 방어 가드 철칙] 반드시 비어있을 때만 최초 1회 생성!
  IF go_cont IS INITIAL.
    " [객체 생성 철칙] container_name 파라미터는 Layout의 이름과 대문자 100% 일치 매핑!
    CREATE OBJECT go_cont
      EXPORTING
        container_name = 'CONT100'.
  ENDIF.
ENDMODULE.
```

#### 체험/시뮬레이터 설계 (컨테이너 바인딩 스텝퍼)
- **프로세스 플로우**:
  1. 학습자가 [Screen Painter 구멍 생성] 버튼을 누른다. 폼 상에 `'CONT100'` 이라는 점선 구역이 뚫린다.
  2. 아바 코드의 `container_name` 인수에 소문자 `'cont100'` 을 적고 [컨테이너 생성 실행]을 클릭한다.
  3. 대소문자 불일치 경고등이 켜지며 `go_cont` 참조 변수가 `bound`로 승격하지 못하고 `initial` 상태로 유지되어 도킹 다리 연결이 성립되지 않는 모습을 본다.
  4. 인수를 대문자 `'CONT100'` 으로 올바르게 교체하고 실행하자, 점선 구역과 백엔드 변수 사이에 튼튼한 녹색 쇠사슬(연결 배지)이 결합되며 `go_cont`가 `bound(연결됨)` 상태로 변동하는 연출을 확인한다.
- **상태 및 데이터**:
  - `container_name = 'CONT100'` 일 때 -> `go_cont` 변수의 런타임 디버그 상태값: `Bound`.
- **피드백**: 화면의 빈 영역 이름과 아바 소스의 컨테이너 바인딩 문자열은 한 치의 오차도 없이 맞물려야 통로가 개설됨을 시각화한다.

### 실수/주의

- **가드문 생략에 따른 덤프**: `IF go_cont IS INITIAL` 가드를 빼먹고 PBO를 돌려버리면, 사용자가 화면에서 엔터를 치거나 마우스를 조작할 때마다 `CREATE OBJECT`가 중복 가동되어 "해당 영역에 이미 동일한 컨테이너가 존재한다" 며 `OBJECT_ALREADY_EXISTS` 런타임 덤프를 터트리고 튕겨 나가므로 가드문은 필수다.

### 정리

- **`Custom Control`** 은 딘프로 화면에 뚫어놓은 빈 사각 껍데기 구역이다.
- **`CL_GUI_CUSTOM_CONTAINER`** 는 이 구역을 아바 프로그램과 결합시키는 물리 도킹 장치다.
- PBO 중복 생성을 막기 위해 반드시 **`IF ... IS INITIAL.`** 가드로 감싸 개설한다.

---

## CH17-L02 - CL_GUI_ALV_GRID 생성

### 왜 필요한가

화면 딘프로 구멍에 도킹 다리(Container)를 훌륭하게 물려 세웠다. 
하지만 다리만 놓았을 뿐, 그 다리 위에 얹어서 실제로 데이터를 엑셀처럼 표로 정렬하고, 합계를 구하고, 열 너비를 조절해 줄 **실제 스프레드시트 몸체 조종판**은 아직 존재하지 않는다. 다리는 뼈대일 뿐이고, 알맹이가 필요하다. 

다리 위에 얹혀서 사용자와 최종 상호작용(스크롤, 정렬, 필터)을 담당할 **실물 그리드 계판 컨트롤 객체**가 필요하다. 그것이 **[[CL_GUI_ALV_GRID]]** (ALV 그리드)의 생성이다.

### 무엇인가

#### 1. CL_GUI_ALV_GRID (그리드 컨트롤)의 정의
- **정의**: 화면 컨테이너 위에 도킹되어 실제로 2차원 격자 표를 렌더링하고 사용자의 클릭 이벤트를 소화해 내는 실물 ALV 지배 클래스다.
- **바인딩 규칙**: 그리드 객체를 출산(`CREATE OBJECT`)할 때, **`EXPORTING i_parent = go_cont`** 라는 생성자 매개변수를 물려주어 "이 표는 방금 세운 `go_cont` 다리 위에 정착한다" 고 부모-자식 바인딩 관계를 선언해야 한다.

#### 2. SALV(간단 ALV) vs Grid ALV(커스텀 그리드)의 확장성 차이

| 비교 관점 | SALV (cl_salv_table) | Grid ALV (cl_gui_alv_grid) |
| --- | --- | --- |
| **코딩 분량** | `factory` 호출 한 줄로 끝나서 매우 짧음 | 컨테이너, 그리드, 카탈로그 등 조립 조각이 김 |
| **화면 제어권** | 자기 혼자 화면 전체를 다 먹어 딘프로 화면 분할 불가 | **딘프로 사각 구획(Container) 안에 자유롭게 도킹** |
| **확장성** | 읽기 전용 목록에 특화, 수정/동적 색상 제어 제약 | **셀 색상, 드롭다운 입력, 실시간 편집/이벤트 제어 확장** |

#### ⚠️ [생성 완료 후 표가 보이지 않는 지연 화면 투사(Deferred Display) 성질]
- *초보자가 가장 놀라는 틈새다. `CREATE OBJECT go_grid`를 가동했는데도 화면은 여전히 하얀 빈 칸으로 남아있다.*
- **이유**: 그리드를 장착한 것은 "표 조종기를 다리 위에 얹어둔 상태" 일 뿐이다.
- 이 그리드 조종기에 실제로 보여줄 **데이터 내부 테이블**과 **컬럼 명세서(Field Catalog)**를 주입하고 **"출발 표시(`set_table_for_first_display`)"** 명령을 수동으로 전송하기 전까지는 화면에 아무 표도 렌더링되지 않고 투사를 보류하는 성질이 있다.

### 어떻게 확인하는가

PBO 내부에서 컨테이너와 그리드 객체를 짝지어 순차적으로 상속 생성하는 소스 규격을 검증한다.

```abap
REPORT zch17_l02_grid.

DATA: go_cont TYPE REF TO cl_gui_custom_container,
      go_grid TYPE REF TO cl_gui_alv_grid.

MODULE create_alv_0100 OUTPUT.
  IF go_grid IS INITIAL.
    " 1. 먼저 부모 도킹 다리 개설!
    CREATE OBJECT go_cont
      EXPORTING container_name = 'CONT100'.
      
    " 2. [바인딩 철칙] 부모 다리 go_cont의 참조 변수를 i_parent 인수로 도킹 전달!
    CREATE OBJECT go_grid
      EXPORTING
        i_parent = go_cont.
  ENDIF.
ENDMODULE.
```

#### 체험/시뮬레이터 설계 (그리드 준비 상태 체크리스트)
- **프로세스 플로우**:
  1. 학습자가 [1단계: 컨테이너 생성]을 누른다. 체크리스트 1번 `i_parent 대기` 에 불이 켜진다.
  2. [2단계: 그리드 생성]을 클릭한다. `i_parent` 가 `go_cont` 와 묶이며 체크리스트 2번 `그리드 컨트롤 장착` 에 불이 켜진다. 
  3. 이 상태에서 가상 화면을 보지만 표는 여전히 보이지 않는 빈 회색 폼이다.
  4. 학습자가 [왜 안 보이지? 안내장 열기]를 클릭하면, "데이터LT와 필드카탈로그FC가 수입되어 첫 디스플레이 명령을 쏘기 전까지는 그리드가 보이지 않는 지연 투사 상태입니다" 피드백 카드가 팝업된다.
- **상태 및 데이터**:
  - `i_parent 인수에 go_cont가 아닌 빈 초기값 변수를 대입해 빌드한 상태` -> "Parent container not bound" 덤프 에러 신호 점등.
- **피드백**: 그리드는 독립적으로 존재할 수 없고 반드시 부모 컨테이너(parent)를 집 주소로 쥐고 태어나야 함을 강조한다.

### 실수/주의

- **그리드 객체를 매 PBO마다 중복 생성**: 컨테이너와 마찬가지로 이 그리드 객체도 화면 컨트롤이므로 PBO 순환마다 계속 `CREATE OBJECT`를 치면, 매번 새로운 표 조종판이 생성되어 화면이 사정없이 깜박이고 결국 아바 커널의 CFW(Control Framework) 세션 한계 초과 에러가 나므로 반드시 `go_grid IS INITIAL` 가드문 안에서 단 1회만 태어나도록 가두어야 한다.

### 정리

- **`CL_GUI_ALV_GRID`** 는 엑셀 같은 격자 표의 실질적인 조종 장치 제어기다.
- 그리드 생성 시에는 반드시 부모 컨테이너를 **`i_parent`** 인수로 결합 지정해야 한다.
- 그리드 생성 직후에는 화면에 표가 나타나지 않으며, 데이터와 컬럼 셋이 주입되어야 투사된다.

---

## CH17-L03 - 출력용 Internal Table 준비

### 왜 필요한가

표 다리(Container)와 조종판(Grid)을 개설했다. 
이제 표에 쏟아부을 알갱이 데이터가 필요하다. 
"공연 예매 대장의 데이터가 데이터베이스(DB) 서버 하드디스크에 잠들어 있다. 이걸 화면 엑셀 창에 보여주고 싶다" 
하지만 ALV 조종기는 디비 서버 저장소에 직접 긴 빨대를 꽂아서 실시간으로 화면에 흘려보내는 마법의 장치가 아니다. DB에 보존된 원천 데이터를 아바 프로그램 메모리 방 안으로 먼저 싹 긁어다가 담아둘 **물리적인 화물 하역장(인터널 테이블)**이 최우선 준비되어야 한다. 
**사용자의 조회 조건을 인수로 삼아 DB 데이터를 아바 내부 테이블에 수령하고, 0건 조회 시의 정상 비즈니스 분기를 규명하는 화물 준비 기법**이 필요하다. 그것이 **출력용 Internal Table의 SELECT 수배**이다.

### 무엇인가

#### 1. Internal Table 과 ALV 렌더링 관계
- ALV 그리드가 화면에 로우와 컬럼을 그릴 때 읽어내는 원천 메모리 주소지는 오직 아바 프로그램의 **Internal Table(내부 테이블)**이다. (예: `lt_booking`).
- 이 내부 테이블의 컬럼 구조가 사전정의된 DDIC 테이블 구조(예: `ZBOOKING`)를 온전하게 상속 참조하고 있어야, 다음 단계의 Field Catalog가 필드 정보(자릿수, 라벨 등)를 자동으로 추출해 매핑해 줄 수 있다.

#### 2. 조회 실패(sy-subrc = 4)와 빈 화면의 업무적 격리 판정
- *초보 개발자가 실수하는 단골 경계선이다. 조회를 돌렸는데 `sy-subrc = 4` (결과 없음)가 뜨고 화면 표가 하얗게 비어있으면 "코딩 에러" 로 오해한다.*
- **판정**: 예매가 단 한 건도 없는 신규 공연(`C003`)을 조회했을 때 표가 비어있는 것은 기술적 에러가 아니라 **매우 정상적인 조회 결과**다. 
- 이를 사용자에게 명확히 알려주기 위해, `SELECT` 직후 `sy-subrc` 가 0이 아닐 때 **`MESSAGE ... TYPE 'S'`** (안내용 상태 메시지)를 뿌려 "조회 결과가 존재하지 않는 공연입니다" 라고 아동식 납득을 시키고 프로그램을 우아하게 존속시켜야 한다.

### 어떻게 확인하는가

조회용 Parameters 인수를 기이드 삼아 내부 테이블로 DB 데이터를 퍼 올리고, sy-subrc 분기 메시지를 쏘는 소스를 검증한다.

```abap
REPORT zch17_l03_data_prepare.

" 1. ZBOOKING 구조를 온전하게 복사한 내부 테이블 수하물 선언!
DATA gt_booking TYPE STANDARD TABLE OF zbooking.
DATA gv_concert TYPE zconcert-concert_id. " 사용자가 화면에 친 조회 키

START-OF-SELECTION.
  " [classic SQL 철칙] modern @ 골뱅이 금지, classic 문법 준수!
  SELECT * FROM zbooking
    INTO TABLE gt_booking
    WHERE concert_id = gv_concert.

  " 2. [분기 철칙] 기술 에러와 정상 0건 데이터 구별 가동!
  IF sy-subrc <> 0.
    " [메시지 격리] 프로그램을 멈추는 E가 아닌, 화면을 유지하는 S 타입 가동!
    MESSAGE '해당 공연의 예매 내역이 존재하지 않습니다.' TYPE 'S'.
  ELSE.
    " sy-dbcnt (시스템 조회 완료 카운터)를 확인해 건수 디버깅
    WRITE: / '조회 완료 건수:', sy-dbcnt.
  ENDIF.
```

#### 체험/시뮬레이터 설계 (공연별 데이터 준비)
- **프로세스 플로우**:
  1. 학습자가 조회 칸에 `C001` (예매가 가득 찬 공연)을 적고 [조회 SELECT]를 누른다.
  2. 기차가 출발해 DB에서 5건의 행을 긁어 `gt_booking` 방을 가득 채우고 `sy-subrc = 0`, `sy-dbcnt = 5` 청신호가 켜진다.
  3. 이어서 존재하지 않는 공연 `C999` 를 적고 조회를 누른다.
  4. DB에서 0건이 반환되며 `sy-subrc = 4` 로 신호등이 노란색으로 바뀐다.
  5. 하단 상태바에 "예매 내역이 존재하지 않습니다" 라는 친절한 상태 알림 메시지가 렌더링되며 빈 테이블 표가 안전하게 화면에 유지되는 연동을 확인한다.
- **상태 및 데이터**:
  - `조회 조건 없이 SELECT * FROM zbooking 을 호출한 상태` -> 로컬 메모리에 전체 테이블 데이터 수만 건이 유입되어 런타임 타임아웃 경고 적색등 점등.
- **피드백**: 빈 표 출력이 에러가 아닌 비즈니스 시나리오 중 하나임을 검증 지표(`sy-subrc`)로 격리해 규명함을 알린다.

### 실수/주의

- **구조가 유실된 타입 없는 익명 테이블 전달**: 내부 테이블을 선언하면서 참조 타입 없이 익명 구조로 선언하면, ALV 그리드가 각 컬럼의 크기와 형식을 인식할 수 없어 첫 디스플레이 단계에서 필드 정보 누락 덤프를 내뿜으므로, 반드시 **DDIC 테이블이나 구조체(TYPES)로 행 타입을 칼같이 규정**하여 선언해야 한다.

### 정리

- ALV 그리드가 읽는 실물 화물 데이터는 아바 프로그램 내의 **`Internal Table`** 에 수납된다.
- `SELECT` 조회 후 결과 유무는 시스템 변수 **`sy-subrc`** 와 건수 변수 **`sy-dbcnt`** 로 판정한다.
- 0건 데이터는 기술 오류가 아니므로, **`MESSAGE S`** 로 사용자에게 알린 뒤 화면을 평화롭게 유지한다.

---

## CH17-L04 - Field Catalog 기초

### 왜 필요한가

화물 데이터(Internal Table)까지 적재했다. 
이제 표를 띄우면 된다. 그런데 DB 필드명은 `SEATS` (좌석) 나 `CUST` (고객명) 처럼 영어 약자로 무미건조하게 적혀 있다. 이걸 그대로 사용자 화면에 내보내면 사용자는 "SEATS가 뭔 소리야? 좌석 정원인가? 예약한 수량인가?" 하며 혼동에 빠지게 된다. 
또한, 어떤 열은 좁게 줄이고 싶고, 어떤 열은 금액 필드라 넓게 벌리고 싶다. 

화면의 각 열마다 **"이 열의 한글 제목은 '예약석 수' 이고, 출력 너비는 8글자 크기로 맞춘다" 라고 적어두는 개별 열 설명 명세 가이드**가 절대적으로 필요하다. 그것이 **[[Field Catalog]]** (필드 카탈로그)의 수립이다.

### 무엇인가

#### 1. Field Catalog (필드 카탈로그)의 정의와 아키텍처
- **정의**: ALV 그리드의 각 열(Column)들이 화면에 어떻게 번역되어 비칠지 통제하는 **컬럼 개별 제어 명세서 테이블**이다.
- **자료형**: 내부 테이블 타입은 **`LVC_T_FCAT`**, 각 행의 개별 옵션 구조체 타입은 **`LVC_S_FCAT`** 이다.
- **핵심 컬럼 필드**:
  - `fieldname`: 데이터 내부 테이블의 물리 필드명 (예: `'SEATS'`).
  - `coltext`: 화면 상단에 인쇄할 한글 이름표 (예: `'예약석 수'`).
  - `outputlen`: 화면에 표시할 기본 열 너비 (예: `8` 글자 폭).

#### 2. LVC_FIELDCATALOG_MERGE (자동 카탈로그 생성기)의 하이브리드 가동
- 컬럼이 50개인 대형 테이블을 개발자가 수동 코딩으로 50개 다 빌드하려면 수백 줄의 코딩 노가다가 발생한다.
- **해결책**: DDIC에 실재하는 투명 테이블(예: `'ZBOOKING'`)을 매개변수로 삼아 **`LVC_FIELDCATALOG_MERGE`** 함수 모듈을 호출하면, 시스템이 50개 열의 카탈로그 명세서를 알아서 순식간에 자동으로 수집 조립해 준다.
- **하이브리드 기법**: 자동으로 머지(Merge)된 명세 테이블을 받아와, 수정이 필요한 특정 필드만 `LOOP AT` 안에서 `fieldname = 'SEATS'` 조건으로 찾아내 제목(`coltext`)과 폭(`outputlen`)을 핀포인트로 고쳐서 갱신(`MODIFY`) 적용하는 스마트 공정이 기본이다.

#### ⚠️ [fieldname 오타 및 소문자 기입 불인식 오작동 가드]
- *필드 카탈로그 개발 단계에서 입문자들이 눈물 흘리는 넘버원 실수다.*
- `fieldname = 'seats'` 처럼 소문자로 쓰거나 오타를 내면, 아바 엔진은 해당 설정을 조용히 무시해 버려 화면 제목이 번역되지 않고 원천 영문 약자로 뚫려 나오게 된다.
- **이유**: ABAP Dictionary의 모든 물리 데이터 필드는 내부 메모리 맵에 **대문자(Uppercase)** 로 기록된다. 따라서 fieldname 값을 비교하거나 설정할 때는 **반드시 대문자 `'SEATS'` 로 입력**해야만 정상 동기화 결합된다.

### 어떻게 확인하는가

LVC_FIELDCATALOG_MERGE를 가동하고 특정 열의 속성을 수동 튜닝하는 소스 규격을 검증한다.

```abap
REPORT zch17_l04_fieldcat.

DATA: lt_fcat TYPE lvc_t_fcat,
      ls_fcat TYPE lvc_s_fcat.

START-OF-SELECTION.
  " 1. [자동 머지 철칙] i_structure_name에는 변수명이 아닌 DDIC 실물 대문자 쿼테이션명 기입!
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
    MESSAGE 'Field Catalog 머지에 실패했습니다.' TYPE 'E'.
  ENDIF.

  " 2. [하이브리드 튜닝 루프 철칙] 대문자 필드 대조와 MODIFY 갱신 집행!
  LOOP AT lt_fcat INTO ls_fcat.
    " [대문자 철칙] 소문자 seats 금지!
    IF ls_fcat-fieldname = 'SEATS'.
      ls_fcat-coltext   = '예약석 수'. " 화면 이름표 교체
      ls_fcat-outputlen = 8.          " 출력 폭 조정
      
      " [반영 철칙] 수정한 행을 현재 카탈로그 내부 테이블 현재 인덱스에 쾅 갱신!
      MODIFY lt_fcat FROM ls_fcat INDEX sy-tabix.
    ENDIF.
  ENDLOOP.
```

#### 체험/시뮬레이터 설계 (컬럼 설명서 편집기)
- **프로세스 플로우**:
  1. 학습자가 `fieldname` 입력 박스에 소문자 `'seats'` 를 치고 제목을 `'예약석 수'` 로 고친 뒤 [카탈로그 튜닝 적용]을 누른다.
  2. 미리보기 표의 헤더가 여전히 딱딱한 영문 대문자 `SEATS` 상태로 오작동 잔류하는 모습을 본다.
  3. [대문자 가드 작동] 칩을 누르자, 입력값이 대문자 `'SEATS'` 로 자동 변환되고 다시 적용을 누르자, 미리보기 격자판 첫 줄 헤더가 즉시 상냥한 한글 `'예약석 수'` 로 실시간 한글로 조율 렌더링되는 변화를 확인한다.
- **상태 및 데이터**:
  - `fieldname = 'SEATS'` 일 때 -> 화면 컬럼 헤더: `예약석 수`.
- **피드백**: 필드 카탈로그는 화면 번역 명세판이며, 연결 열쇠는 반드시 대문자 스펠링이 맞아야 도킹된다는 정밀 스펙을 각인시킨다.

### 실수/주의

- **머지 함수 i_structure_name 에 내부 테이블 변수명 전달**: `'lt_booking'` 이라는 아바 로컬 변수 이름을 머지 인수에 던져주면, 함수는 "Z Dictionary에서 lt_booking이라는 이름의 기성 테이블 설계도를 찾을 수 없다" 며 프로그램 에러(subrc = 2)를 터트리므로, 반드시 Dictionary 실물 테이블명인 **`'ZBOOKING'`** 을 대문자로 기입해야 한다.

### 정리

- **`Field Catalog`** (`LVC_T_FCAT`)는 각 열의 한글 제목, 폭, 숨김 여부를 담는 컬럼 개별 명세표다.
- **`LVC_FIELDCATALOG_MERGE`** 로 기본 뼈대를 수집하고, 수동 루프로 원하는 열만 튜닝한다.
- 매칭 필드명(`fieldname`)은 반드시 **대문자(Uppercase)** 로 기입해야 오작동을 피한다.

---

## CH17-L05 - Layout 기본 설정

### 왜 필요한가

열별 컬럼 설명서(Field Catalog)를 조립했다. 
그런데 표가 너무 단조롭다. 흰색 로우만 수백 개가 세로로 빽빽하게 깔려 있으니, 사용자가 화면을 보다가 몇 번째 줄을 마우스로 추적 중인지 눈이 침침해져 자꾸 줄을 놓치는 독독성 저하를 겪는다. 
또한 데이터의 글자 수가 길어서 뒤가 잘리는데도 열 폭이 고정되어 있어 사용자가 일일이 마우스로 컬럼을 벌려야 하거나, 이 표가 도대체 무엇을 나타내는 표인지 상단 제목 라벨이 없어 불만을 표출한다. 

각 열의 미시적 튜닝을 넘어, **표 전체에 기성 줄무늬 스킨을 씌우고, 데이터 길이에 따라 열 너비를 알아서 가로 자동 맞춤 정렬해 주며, 상단에 표 제목 인장을 찍어주는 거시적 표 스킨 지배 기술**이 필요하다. 그것이 **[[Layout]]** (레이아웃) 제어 기술이다.

### 무엇인가

#### 1. Layout (레이아웃 설정)의 정의
- **정의**: 표 전체의 시각적인 레이아웃 스타일, 줄무늬, 선택 메커니즘, 헤더 제목 등을 총괄 제어하는 **표 전체 공통 디자인 설정서**다.
- **자료형**: 1행짜리 기성 구조체 타입인 **`LVC_S_LAYO`** 를 사용한다.

#### 2. Layout 핵심 4대 시각적 옵션 필드
1. **`zebra = abap_true` (줄무늬 수혈)**:
   - **거동**: 홀수 행과 짝수 행의 배경색을 연한 회색과 흰색으로 번역 교차 인쇄하여 긴 엑셀 로우 추적 시 시각 피로도를 극적으로 경감시킨다.
2. **`cwidth_opt = abap_true` (열 너비 최적화)**:
   - **거동**: 컬럼 폭을 고정하지 않고, 유입된 실물 데이터(예: 정훈영 대리 - 3글자 vs 피카소 알렉산더 - 8글자) 중 **가장 긴 글자 폭에 맞추어 컬럼 넓이를 런타임에 자동으로 슬라이딩 맞춰 늘려준다.** (UX의 꽃).
3. **`grid_title = '예매 목록'` (그리드 천장 꼬리표)**:
   - **거동**: 표 전체 영역 윗마당에 뚜렷하게 한글 제목 바를 얹어서 사용자가 업무 맥락을 잃지 않게 표식을 찍는다.
4. **`sel_mode = 'A'` (행 선택 기어)**:
   - **거동**: 표 좌측 끝단 단추를 클릭했을 때 행이 한 줄만 잡힐지(`'Single'`), 컨트롤 키를 눌러 다중 로우 블록이 잡힐지(`'A' - All`) 행 선택 방식의 하드웨어 마우스 기어를 결정한다.

### 어떻게 확인하는가

LVC_S_LAYO 구조체를 정의해 디자인 옵션을 세팅하는 백엔드 소스를 검증한다.

```abap
REPORT zch17_l05_layout.

" [선언 철칙] 표 전체 옵션을 제어하는 1행 구조체 LVC_S_LAYO 선언!
DATA ls_layout TYPE lvc_s_layo.

START-OF-SELECTION.
  " 1. [zebra 철칙] 참/거짓 매핑은 하드코드 'X' 가 아닌 abap_true 표준 준수!
  ls_layout-zebra      = abap_true.
  
  " 2. [너비 철칙] 데이터 폭 자동 최적화 엔진 탑재!
  ls_layout-cwidth_opt = abap_true.
  
  " 3. [제목 철칙] 이 그리드 표가 무엇을 하는 도구인지 인장 명시!
  ls_layout-grid_title = '공연 예매현황 실시간 목록'.
  
  " 4. [선택 철칙] 복수 행 일괄 다중 선택 기어 세팅!
  ls_layout-sel_mode   = 'A'.
```

#### 체험/시뮬레이터 설계 (Layout 토글 패널)
- **프로세스 플로우**:
  1. 학습자가 가상 화면 상의 [cwidth_opt = OFF] 상태에서 표를 본다. '피카소알렉산더...' 처럼 이름 끝자리가 잘려 렌더링된 불편 상태를 확인한다.
  2. [cwidth_opt = ON] 스위치를 켠다. 컬럼 가로 폭이 글자 최대 길이에 맞춰 촥 늘어나며 잘린 텍스트가 복원되는 시각 피드백을 본다.
  3. [zebra = ON] 스위치를 켜자, 2차원 격자 로우 배경이 흰색과 회색으로 번갈아 색칠되며 엑셀 장부식 가독성으로 스위칭되는 화면을 감상한다.
- **상태 및 데이터**:
  - `ls_layout-zebra = abap_true` -> 가상 ALV 로우 스타일: `Zebra Stripe`.
- **피드백**: 레이아웃 구조체 세팅은 데이터 원본은 건드리지 않고 표의 외부 시인성(UX)을 극대화하는 물리 디자이너임을 체감시킨다.

### 실수/주의

- **구조체만 열심히 채우고 정작 display 함수에 전달 누락**: 백엔드에서 `ls_layout-zebra = abap_true.` 코드를 아무리 열심히 적어뒀어도, 훗날 딘프로 첫 화면 호출부인 `set_table_for_first_display` 의 `is_layout = ls_layout` 파라미터 매핑 인수로 넘겨 연결해주지 않으면 적용되지 않고 유실되므로, **'세팅' 과 '전송' 은 별개 공정**임을 잊지 말아야 한다.

### 정리

- **`Layout`** (`LVC_S_LAYO`)은 열 단위가 아닌 표 전체의 Zebra, 너비 자동 맞춤, 제목을 지배한다.
- **`cwidth_opt = abap_true`** 는 가로 잘림을 해결해 주는 실무 ALV 화면 기획의 기본 탑재 필드다.
- 세팅된 레이아웃 구조체는 최종 디스플레이 함수의 **`is_layout`** 인수로 흘려보내 도킹한다.

---

## CH17-L06 - Variant 기본 설정

### 왜 필요한가

줄무늬도 넣고 열 폭 최적화까지 마쳤다. 
그런데 이번에는 사용자들끼리 서로 싸운다. 
"나는 마케팅팀이라 고객명(`CUSTOMER`)을 첫 번째 열에 크게 띄워두고 보고 싶어" vs "나는 재무팀이라 좌석 단가와 총 좌석수(`SEATS`)가 무조건 맨 앞에 와야 해" 
모든 사용자의 모니터에 똑같은 컬럼 순서로만 표를 강제 고정해 내보내면, 누군가는 화면을 켤 때마다 컬럼을 마우스로 질질 끌어다 순서를 바꾸고 필터를 다시 거는 고된 반복 노가다를 겪는다. 

사용자가 자기 입맛에 맞게 조정한 "나만의 엑셀 열 배치 및 필터 정렬 설정"을 각자 서랍 속에 고스란히 저장해 두었다가, 화면을 켤 때마다 내 취향에 맞게 복원해 물려주는 **사용자 맞춤형 화면 보존 저장소 기술**이 필요하다. 그것이 **[[Display Variant]]** (디스플레이 베리언트)이다.

### 무엇인가

#### 1. Display Variant (디스플레이 베리언트)의 본질
- **본질**: 데이터(예매 데이터)를 저장하는 것이 아니라, **"컬럼의 순서, 너비, 정렬, 숨김, 필터 상태" 와 같은 화면 시각 정보(View State)를 데이터베이스에 영구 보존하는 개인화 기술**이다.
- **자료형**: 기성 구조체 타입인 **`DISVARIANT`** 를 선언해 사용한다.

#### 2. Variant 연동의 3대 필수 매개체
1. **`report = sy-repid` (출처 프로그램 태깅)**:
   - display variant 구조체 내부에 **현재 프로그램 이름(`sy-repid`)** 을 반드시 심어 매핑해 주어야 한다. 그래야 시스템이 다른 엉뚱한 프로그램 화면 설정과 꼬이지 않고 내 화면 Variant만 정확히 솎아내어 저장고에서 불 꺼내듯 불러올 수 있다.
2. **`i_save = 'A'` (저장 권한 개방 기어)**:
   - ALV 디스플레이 호출 시 이 기어를 열어주어야 사용자가 표 상단 메뉴 단추에서 [레이아웃 저장] 버튼을 마우스로 클릭해 저장할 수 있는 권한 게이트가 열린다.
   - `'U'` (User-specific): 나 혼자만 쓸 수 있는 Variant 저장 허용.
   - `'X'` (Standard): 전사 공용으로 쓸 수 있는 Variant 저장 허용.
   - **`'A'` (All)**: 개인용과 공용 두 가지 다 마음대로 골라 저장할 수 있는 마스터 기어 개방 (교육/실습 표준).

### 어떻게 확인하는가

Variant 구조체를 정의하고 기어 설정을 매핑하여 전달하는 소스를 검증한다.

```abap
REPORT zch17_l06_variant.

" [선언 철칙] 베리언트 설정을 담아낼 표준 구조체 DISVARIANT 선언!
DATA ls_variant TYPE disvariant.
DATA go_grid    TYPE REF TO cl_gui_alv_grid.
DATA gt_booking TYPE STANDARD TABLE OF zbooking.

START-OF-SELECTION.
  " 1. [repid 철칙] 내 프로그램 이름을 심어 고유 서랍 열쇠로 지정!
  ls_variant-report = sy-repid.
  
  " 2. 아래 디스플레이 함수에 EXPORTING 인수로 묶어서 물려 보내기!
  " (i_save = 'A' 마스터 세이브 권한 개방)
```

#### 체험/시뮬레이터 설계 (Display Variant 저장소)
- **프로세스 플로우**:
  1. 학습자가 [사용자 정훈영] 탭을 누르고 표 상의 `CUSTOMER` 컬럼을 1번 열로 드래그한다.
  2. [Variant 저장: 'CUST_FIRST'] 단추를 탭한다. `sy-repid` 키와 묶여 DB Variant 서랍장 카드 칸에 안착되는 모션을 본다.
  3. 이어서 [사용자 손흥민] 탭을 누르고 `SEATS` 컬럼을 1번 열로 보내고 ['SEAT_FIRST']로 저장한다.
  4. 정훈영 대리가 다시 재로그인하여 [ZCON100 실행]을 누르자, Variant DB 서랍을 열고 'CUST_FIRST' 설정이 자동으로 풀려 촥 복원 렌더링되는 통제 맵을 감상한다.
- **상태 및 데이터**:
  - `i_save 인수를 공백으로 둔 채 가동한 상태` -> 가상 ALV 상단 툴바에서 레이아웃 저장 디스켓 버튼이 회색으로 비활성화되어Variant 생성이 원천 불가능한 상태 표출.
- **피드백**: Variant는 사용자의 화면 배치 주권을 지켜주는 개인화 기술이며, repid와 i_save가 체결되어야 저장소가 개통됨을 증명한다.

### 실수/주의

- **ls_variant-report 에 임의 문자열 하드코딩**: "귀찮은데 그냥 `'PROGRAM'` 이라고 하드코딩해서 넘기자" 했다가는, 실제 런타임 환경에서 내 프로그램 이름을 찾지 못해Variant 로드 오류가 나거나 꼬이므로, 언제나 동적으로 현재 프로그램 명을 가리키는 시스템 변수 **`sy-repid`** 를 대입 매핑해야 안전하다.

### 정리

- **`Display Variant`** (`DISVARIANT`)는 화면 컬럼 정렬/필터의 개인화 상태를 저장한다.
- **`ls_variant-report = sy-repid`** 와 **`i_save = 'A'`** 는 저장소를 여는 두 개의 게이트 열쇠다.
- Variant는 데이터가 아닌 **'표의 배치 스킨'** 만 보존하는 격리 영역임을 인식한다.

---

## CH17-L07 - SET_TABLE_FOR_FIRST_DISPLAY

### 왜 필요한가

표가 들어갈 다리(Container), 조종기(Grid), 수송할 화물(Internal Table), 컬럼 명세서(Field Catalog), 표 스킨(Layout), 개인화Variant 서랍을 완벽하게 완성했다. 
모든 독립된 퍼즐 조각들이 책상 위에 나열되어 대기 중이다. 
하지만 이 조각들을 딘프로 백엔드 런타임 엔진에 실어 보내며 **"준비 완료되었으니, 지금 내 모니터 화면에 당장 이 조건으로 첫 표를 인쇄해라!"** 라고 출발 방아쇠를 당겨주지 않으면, 조각들은 평생 메모리 안에서만 겉돌고 화면은 텅 빈 회색 창으로 방치된다. 

**따로 노는 6가지 조각들을 매개변수로 물려 묶고, 화면에 실물 그리드 격자판을 런타임에 촥 출력하는 통합 출발 지시어**가 절대적으로 필요하다. 그것이 **[[SET_TABLE_FOR_FIRST_DISPLAY]]** (첫 화면 출력) 메서드 호출이다.

### 무엇인가

#### 1. set_table_for_first_display 메서드의 기능
- **기능**: 부모 컨테이너 영역 안에 그리드 인스턴스를 동기화 결합시키고, 화물 데이터 내부 테이블을 읽어 필드 카탈로그 명세대로 화면 표를 **최초 1회 드로잉(Drawing)** 해내는 실행 단추다.

#### 2. EXPORTING(설정) vs CHANGING(데이터) 파라미터의 역할 분할 명세
이 메서드는 입력과 출력 인수가 섞이지 않도록 엄격하게 파라미터 경계선을 격리한다.

1. **`EXPORTING` (표 전체의 조율 지침서 - 읽기 전용)**:
   - **`is_layout`**: 표의 줄무늬, 너비 가로 맞춤 스킨 (`ls_layout`).
   - **`is_variant`**: 프로그램 이름 Variant 열쇠 (`ls_variant`).
   - **`i_save = 'A'`**: 저장 기어 승인 문자.
2. **`CHANGING` (표의 알맹이 실물 화물 - 변동/조정 가부)**:
   - **`it_outtab`**: 렌더링할 데이터 내부 테이블 (`lt_booking`).
   - **`it_fieldcatalog`**: 컬럼 번역 카탈로그 명세표 (`lt_fcat`).
   - *이유*: 사용자가 화면에서 컬럼 너비를 드래그하거나 정렬을 바꾸면, 아바 엔진이 이 필드 카탈로그 명세 테이블의 값을 런타임에 동적으로 변경(Changing)하여 되돌려주기 때문에 CHANGING 구역에 속한다.

### 어떻게 확인하는가

조각들을 하나의 set_table_for_first_display 함수에 조립하여 최종 디스플레이를 집행하는 소스를 검증한다.

```abap
REPORT zch17_l07_display.

DATA: go_cont    TYPE REF TO cl_gui_custom_container,
      go_grid    TYPE REF TO cl_gui_alv_grid,
      lt_booking TYPE STANDARD TABLE OF zbooking,
      lt_fcat    TYPE lvc_t_fcat,
      ls_layout  TYPE lvc_s_layo,
      ls_variant TYPE disvariant.

MODULE display_alv_0100 OUTPUT.
  IF go_grid IS INITIAL.
    " 1. 컨테이너 & 그리드 생성 완료 상태라 가정!
    " 2. lt_booking 데이터와 lt_fcat 카탈로그 조립 완료 상태라 가정!
    " 3. ls_layout 및 ls_variant 세팅 완료 상태라 가정!
    
    " 4. [디스플레이 단추 집행 철칙] EXPORTING과 CHANGING 파라미터 분할 준수!
    go_grid->set_table_for_first_display(
      EXPORTING
        is_layout       = ls_layout
        is_variant      = ls_variant
        i_save          = 'A'
      CHANGING
        it_outtab       = lt_booking      " 실물 데이터 바인딩!
        it_fieldcatalog = lt_fcat         " 번역 카탈로그 바인딩!
      EXCEPTIONS
        invalid_parameter_combination = 1
        program_error                 = 2
        too_many_lines                = 3
        OTHERS                        = 4.
        
    IF sy-subrc <> 0.
      MESSAGE 'ALV 그리드 첫 출시에 실패했습니다.' TYPE 'E'.
    ENDIF.
  ENDIF.
ENDMODULE.
```

#### 체험/시뮬레이터 설계 (첫 화면 디스플레이 기차)
- **프로세스 플로우**:
  1. 학습자가 [기차 준비창]을 본다. 객차에 `lt_booking(데이터)`과 `lt_fcat(컬럼)`이 차례대로 실린다.
  2. 기관실 조종석에 `is_layout(줄무늬)` 과 `is_variant` 지침서가 도킹된다.
  3. [set_table_for_first_display 출발 버튼]을 클릭한다.
  4. 기차가 런타임 터널을 지나 화면 출구로 나아가는 순간, 가상 모니터 영역에 줄무늬와 한글 컬럼을 완벽하게 갖춘 알록달록한 예매 현황 표 격자판이 촥 렌더링되며 합계/정렬 마우스 조작 단추들이 켜지는 연출을 감상한다.
- **상태 및 데이터**:
  - `it_fieldcatalog 테이블을 의도적으로 비운 채로 display를 호출한 상태` -> 격자판은 그려졌으나 컬럼 제목과 데이터 줄이 아예 출력되지 않아 유령 빈 창만 덩그러니 남는 오작동 표출.
- **피드백**: 디스플레이 메서드는 독립된 모든 부품들을 한곳에 바인딩 결합해 물리 UI로 띄우는 화룡점정의 종합 스위치임을 인지한다.

### 실수/주의

- **EXPORTING 과 CHANGING 인수 묶음 스와핑(Swapping) 오류**: 데이터 테이블인 `it_outtab`을 `EXPORTING`에 기입하고 레이아웃인 `is_layout`을 `CHANGING` 구역에 적으면, 문법 컴파일러가 "인터페이스 파라미터 타입 불일치" 에러를 내며 빨간 줄을 긋고 컴파일을 거부하므로 **`설정은 EXPORTING, 데이터/카탈로그는 CHANGING`** 공식 구조를 엄수해야 한다.

### 정리

- **`set_table_for_first_display`** 는 표 조종기 인스턴스를 구동해 화면에 첫 드로잉을 집행한다.
- **`EXPORTING`** 은 보기 설정을 넘기고, **`CHANGING`** 은 데이터 테이블과 카탈로그를 매핑해 싣는다.
- 반드시 `go_grid IS INITIAL` 가드문 내부에서 **최초 1회만 기동**되도록 구조를 설계한다.

---

## CH17-L08 - Refresh와 Stable Refresh 기초

### 왜 필요한가

첫 화면 디스플레이(`FIRST_DISPLAY`)에 성공했다. 
이제 사용자가 화면 상단의 [공연 조회] 검색 키를 `C001`에서 `C002`로 바꾸고 [조회] 단추를 다시 꾹 눌렀다. 
백엔드 로직이 돌며 `lt_booking` 내부 테이블 데이터는 `C002` 예매 내역 10건으로 정상 교체 완료되었다. 
그런데 모니터 화면 속의 ALV 표는 여전히 옛날 `C001` 데이터 5건만 고집스럽게 붙잡고 꿈쩍도 하지 않는다. 사용자는 "조회를 눌렀는데 왜 화면 표가 안 바뀝니까? 프로그램 에러네요" 라고 화를 낸다. 

왜 이런 일이 발생할까? 데이터 내부 테이블 변수는 백엔드 메모리 방에 있고, 화면에 렌더링된 격자판은 화면 엔진(Presentation Layer)에 그려져 얼어붙은 상태이기 때문이다. 
**내부 데이터가 변경되었음을 화면 조종기에게 노크하듯 알려주어 화면을 실시간으로 갱신(Redraw)하되, 사용자가 200번째 로우를 구경 중이던 스크롤바의 눈금 위치를 잃지 않고 그 자리에 딱 붙잡아 갱신해 주는 스크롤 사수 기술**이 필요하다. 그것이 **[[Stable Refresh]]** (위치 보존 새로고침) 이다.

### 무엇인가

#### 1. 데이터 변경(Memory) ≠ 화면 갱신(UI)의 격리
- 백엔드 내부 테이블(`lt_booking`)의 값을 아무리 수정하고 주무르더라도, 화면 그리드는 그 변경을 자동으로 감지하지 못한다.
- **해결책**: 데이터 처리를 다 마친 순간, 반드시 그리드의 새로고침 메서드인 **`refresh_table_display( )`** 를 명시적으로 호출해 주어야만 화면 엔진이 내부 테이블의 새 데이터를 읽어가 화면을 동기화 갱신한다.

#### 2. Stable Refresh (위치 보존 새로고침) 의 스크롤 방어막
- 아무 옵션 없이 일반 `refresh_table_display( )` 를 가동하면, 새로고침이 도는 순간 스크롤바가 화면 맨 꼭대기(1번 로우)로 튄다. 200번째 행을 더블클릭해서 상태만 예약에서 대기로 변경한 사용자는, 화면이 리프레시되면서 맨 위로 튕겨버려 자신이 보던 200번째 줄을 다시 찾기 위해 스크롤을 내리는 극심한 화면 피로도를 겪는다.
- **해결책**: 새로고침 시 **`is_stable`** (자료형 `LVC_S_STBL`) 이라는 락 옵션을 활성화하여 전달한다.
  - **`ls_stable-row = abap_true`**: 새로고침이 돌아도 내가 보던 세로 줄 **행 스크롤 위치 보존**.
  - **`ls_stable-col = abap_true`**: 새로고침이 돌아도 내가 보던 가로 줄 **열 스크롤 위치 보존**.

### 어떻게 확인하는가

Stable Refresh 옵션을 충족하여 화면을 리프레시 갱신하는 백엔드 소스를 검증한다.

```abap
REPORT zch17_l08_refresh.

DATA: go_grid    TYPE REF TO cl_gui_alv_grid,
      lt_booking TYPE STANDARD TABLE OF zbooking,
      ls_stable  TYPE lvc_s_stbl. " 스크롤 보존용 구조체 선언!

FORM refresh_alv.
  " 1. [stable 철칙] 행과 열의 보존 락 스위치를 abap_true로 세팅!
  ls_stable-row = abap_true.
  ls_stable-col = abap_true.

  " 2. [리프레시 집행 철칙] display 중복 호출 금지, refresh_table_display 가동!
  go_grid->refresh_table_display(
    EXPORTING
      is_stable = ls_stable " 스크롤 보존 락 송신!
    EXCEPTIONS
      finished  = 1
      OTHERS    = 2 ).

  IF sy-subrc <> 0.
    MESSAGE '그리드 새로고침에 실패했습니다.' TYPE 'S'.
  ENDIF.
ENDFORM.
```

#### 체험/시뮬레이터 설계 (refresh vs stable)
- **프로세스 플로우**:
  1. 학습자가 가상 ALV 목록을 아래로 스크롤하여 [15번째 줄 손흥민 고객 행]에 멈춰 선다.
  2. [데이터 수정: 예약 완료] 버튼을 누른다. 백엔드 lt_booking의 값만 수정된다. 화면은 미동도 없다.
  3. [일반 REFRESH 실행] 단추를 누른다. 15번째 줄 텍스트가 업데이트되지만, 스크롤바가 순간 맨 위 1번째 줄로 사정없이 튕겨 올라가는 짜증 상황을 확인한다.
  4. 학습자가 다시 15번째 줄로 내려가서 [STABLE REFRESH 실행] 단추를 클릭한다. 화면 값만 깜박임 없이 자연스럽게 업데이트되고 스크롤은 15번째 위치에 접착제로 붙은 듯 조용히 지키고 있는 쾌적한 UX를 감상한다.
- **상태 및 데이터**:
  - `ls_stable-row = abap_true` -> 새로고침 후 가상 화면 스크롤 포커스: `보존 유지`.
- **피드백**: 데이터 변경과 화면 갱신은 별개 공정이며, Stable 옵션은 사용자 시선을 지켜주는 사방 가드임을 이해시킨다.

### 실수/주의

- **데이터가 바뀔 때마다 set_table_for_first_display 를 재차 반복 호출**: "새 데이터가 들어왔으니 화면에 처음 띄우는 함수(`display`)를 한 번 더 실행하면 되겠지?" 했다가는, 화면 다리 컨테이너 내부 세션이 다 찢어지며 화면이 사정없이 깜박이고 결국 커널 런타임 덤프가 발생하므로, **최초 드로잉은 단 1회 `FIRST_DISPLAY`로 끝내고, 데이터 교체 후에는 무조건 `refresh_table_display`만 가동**해야 한다.

### 정리

- 내부 테이블의 데이터 변경과 화면 격자판의 투사 갱신은 **엄격하게 분리된 물리적 절차**다.
- 데이터 갱신 시에는 display 재호출이 아닌 **`refresh_table_display`** 를 가동한다.
- 스크롤 튐을 방지하기 위해 **`is_stable`** 의 row/col 락을 활성화하여 리프레시한다.

---

## CH17-L09 - 행 색상 기초

### 왜 필요한가

그리드 새로고침과 스크롤 사수까지 마쳤다. 
그런데 이번에는 현업에서 새로운 까다로운 요구사항이 떨어졌다. 
"공연 회차 목록 중에서 예매 좌석수(`seatsocc`)가 전체 정원(`capacity`)과 같거나 커서 자리가 꽉 찬 **'매진 회차'** 데이터들이 있습니다. 사용자가 수백 개 회차 목록 중에서 매진된 공연을 한눈에 식별해서 발라낼 수 있게, 해당되는 행 전체의 배경색을 붉은색 경고 조명으로 칠해서 내보내 주세요" 
이걸 개발자가 수작업으로 딘프로 화면 필드 속성을 돌리는 식으로는 구현이 불가능하다. 

**원천 데이터 레코드 한 행마다 색상 속성 코드값을 달아주고, 레이아웃 조종판에게 '이 색 코드 컬럼 명칭을 참고해 행 전체에 하이라이트 조명을 쏴라' 고 매핑 결합해 주는 조건부 행 색칠 기술**이 필요하다. 그것이 **행 색상 (`info_fname`)** 바인딩 기술이다.

### 무엇인가

#### 1. 행 색상 지정의 2단계 결합 아키텍처
행 전체에 색을 입히기 위해서는 반드시 데이터와 레이아웃 설정이 다음 2단계로 맞물려야 한다.

- **1단계: 데이터 테이블 내에 색 코드 전용 방(Column) 개설**:
  - 보여줄 내부 테이블 구조 정의 최하단에 색상 코드를 저장할 전용 4자리 문자 필드를 추가한다. (예: `rowcolor TYPE c LENGTH 4`).
  - 루프를 돌며 매진인 행에만 이 방에 클래식 색상 코드값 **`'C610'`** 을 주입해 둔다.
- **2단계: Layout에 색 코드 컬럼명 전달 (`info_fname`)**:
  - 표 전체 레이아웃 구조체 필드인 **`ls_layout-info_fname`** 에, 방금 만든 색상 전용 필드명인 **`'ROWCOLOR'`** 라는 대문자 이름을 문자열로 대입한다.
  - **원리**: ALV 그리드는 표를 그릴 때 레이아웃의 `info_fname`에 지정된 필드명을 찾아가, 그 칸에 적혀있는 색 코드가 `C610`이면 그 행 전체에 붉은 칠을 해준다.

#### 2. Classic 색상 코드 `C610` 구조 분석
아밥 클래식 색상 코드는 마음대로 RGB를 쓰는 게 아니라, 4자리 약속된 기호를 따른다.
- **`C`** (Color의 약자 - 고정).
- **`6`** (색상 고유 번호 - 1: 파랑, 2: 연회색, 3: 노랑, 4: 청록, 5: 초록, **6: 빨강**, 7: 주황).
- **`1`** (Intensified - 1: 진하게 강조, 0: 기본 두께).
- **`0`** (Inverse - 1: 글자색과 배경색 반전 토글, 0: 표준 배경 칠).

#### ⚠️ [ls_layout-info_fname 에 색상 코드 값을 직접 대입하는 실수]
- *행 색상 구현 시 10명 중 9명이 반드시 미끄러지는 단골 함정이다.*
- `ls_layout-info_fname = 'C610'` 이라고 색 코드 값 자체를 레이아웃에 직접 대입하면 화면에 아무 색도 나오지 않는다.
- **이유**: `info_fname` 은 색 코드 값을 받는 칸이 아니라, **"색 코드를 저장하고 있는 컬럼 필드 이름" 을 이정표로 낚아채는 칸**이기 때문이다. 따라서 반드시 컬럼 명칭 문자열인 **`'ROWCOLOR'`** (대문자)를 적어주어야 한다.

### 어떻게 확인하는가

데이터 구조에 색 필드를 선언하고, 조건에 따라 색 코드를 부여하여 info_fname에 도킹하는 백엔드 소스를 검증한다.

```abap
REPORT zch17_l09_rowcolor.

" 1. [구조체 선언 철칙] 색상 정보 C4 4자리를 보관할 컬럼 필드를 구조체에 추가!
TYPES: BEGIN OF ty_perf_alv,
         concert_id TYPE zperf-concert_id,
         perf_date  TYPE zperf-perf_date,
         seatsocc   TYPE zperf-seatsocc,
         capacity   TYPE zperf-capacity,
         rowcolor   TYPE c LENGTH 4, " 색상 정보 보관용 방!
       END OF ty_perf_alv.

DATA: gt_perf   TYPE STANDARD TABLE OF ty_perf_alv,
      gs_perf   LIKE LINE OF gt_perf,
      ls_layout TYPE lvc_s_layo.

FORM set_row_color.
  " 2. [데이터 루프 철칙] 조건에 맞는 행에 색상 코드(C610 - 진한빨강) 입력!
  LOOP AT gt_perf INTO gs_perf.
    IF gs_perf-seatsocc >= gs_perf-capacity.
      gs_perf-rowcolor = 'C610'. " 매진 회차는 진한 빨간색 기입!
    ELSE.
      CLEAR gs_perf-rowcolor.   " 기본 회차는 공백(기본색) 기입!
    ENDIF.
    MODIFY gt_perf FROM gs_perf INDEX sy-tabix.
  ENDLOOP.

  " 3. [레이아웃 지정 철칙] 색 코드가 아닌, 색 필드명 'ROWCOLOR'를 대문자로 도킹!
  ls_layout-info_fname = 'ROWCOLOR'. " 소문자 rowcolor 금지, 대문자 엄수!
ENDFORM.
```

#### 체험/시뮬레이터 설계 (매진 판정과 행 색상)
- **프로세스 플로우**:
  1. 학습자가 Layout `info_fname` 인수창에 색상 코드 값 `'C610'` 을 직접 기입하고 [색상 적용 가동]을 누른다.
  2. 미리보기 표의 매진 행에 아무런 색 변화도 없이 무채색 흰색으로 방치되는 오작동을 본다.
  3. 인수를 색 필드명인 `'ROWCOLOR'` 로 올바르게 정정하고 가동한다.
  4. 미리보기 ALV 리스트의 매진 로우(정원 초과행) 전체가 붉은색(`C610`) 하이라이트 조명으로 촥 도배 렌더링되며 시각적 경고 효과가 발휘되는 피드백을 감상한다.
- **상태 및 데이터**:
  - `ls_layout-info_fname = 'ROWCOLOR'` 이고 `rowcolor = 'C610'` 일 때 -> 매진 로우 배경색: `진한 빨강`.
- **피드백**: 행 색칠은 컬럼 매핑 구조이며, 색 코드가 아닌 필드명 전달이 톱니바퀴의 맞물림임을 알려준다.

### 실수/주의

- **필드명 ROWCOLOR의 소문자 입력 오동작**: `info_fname = 'rowcolor'` 처럼 소문자로 필드명을 적으면, 아바 Dictionary와 내부 테이블 메모리 주소록의 대문자 규격 필드를 런타임에 찾지 못해 색칠 연산이 조용히 무시되므로, layout에 필드명을 넘겨줄 때는 **무조건 대문자 `'ROWCOLOR'` 를 쿼테이션으로 체결**해야 한다.

### 정리

- 행 전체 색상을 제어하려면 데이터 테이블 구조에 4자리 **`c`** 형식 색 필드를 개설한다.
- 매진 조건에 따라 **`'C610'`** (빨강 진하게) 등 4자리 클래식 코드를 로우에 기입한다.
- **`ls_layout-info_fname = '필드명'`** (대문자)을 매핑하여 그리드에 최종 송신한다.

---

## CH17-L10 - 종합 실습 — 예매 목록 Grid ALV 완성

### 왜 필요한가

우리가 배운 표의 도킹 다리 개설, 그리드 조종기 장착, 내부 테이블 조회, 필드 카탈로그 머지 튜닝, 레이아웃 줄무늬 스킨, Variant 서랍 개방, 첫 디스플레이 지시, Stable Refresh 갱신, 행 색상 하이라이팅을 단편적 조각으로 각각 체득했다. 

이제 이 파편들을 **🎫 하나의 완결된 '공연 예매 목록 실시간 조회 그리드 프로그램'** 캡스톤으로 완성할 때다. 사용자가 공연 코드를 치고 [조회]를 누르면 첫 실행 시에만 컨테이너와 그리드를 개설해 표를 첫 렌더링하고(build_alv), 두 번째 조회 시부터는 새로 빚지 않고 스크롤 포커스를 지킨 채 데이터만 자연스럽게 새로고침하여 표를 갈아 끼우는(refresh_alv) **실무 아키텍처에 완벽히 부합하는 완성형 리포트 제어 골격**을 내 손으로 구축해야 한다.

### 무엇인가

#### 🎫 종합 예매 목록 그리드 전체 책임 분할 아키텍처
우리는 딘프로 화면 `0100` 내부에 Custom Control 영역 `CONT100` 을 뚫고, 백엔드 아바 소스코드를 **책임별로 완전히 격리 분할된 FORM 서브루틴 체인**으로 조립하여 완성한다.

```text
[ build_alv - 첫 구동 시 5단계 조립 FORM 체인 ]
1. select_booking    : DB에서 조회 조건을 가이드로 lt_booking 내부 테이블 데이터 준비.
2. create_grid       : CONT100 구멍과 묶어 go_cont 다리 개설 및 go_grid 그리드 조종기 장착.
3. build_fieldcat    : ZBOOKING 구조 머지 후 'SEATS' 열을 '좌석수' 한글 이름표 및 폭 8자로 튜닝.
4. build_layout      : 줄무늬 zebra 및 너비 자동 맞춤, sy-repid variant 서랍 지정.
5. display_grid      : EXPORTING(설정)과 CHANGING(데이터)을 묶어 set_table_for_first_display 집행.
```

- **PBO 런타임 제어 게이트**:
  PBO 모듈이 가동될 때마다 이 조립 체인을 매번 새로 구동시키면 중복 빌드로 서버 덤프가 난다. 
  **반드시 `IF go_grid IS INITIAL.` 가드로 감싸 최초 1회만 `build_alv` 를 가동하고, 2회차 PBO부터는 `ELSE.` 분기를 타서 오직 `refresh_alv` 만을 우회 호출하도록 라이프사이클 분기 기어를 칼같이 설계해야 한다.**

### 어떻게 확인하는가

T-code를 실행하여 5단계 완성 체크리스트에 따라 예매 목록 Grid ALV의 동작을 종합 검수한다.

1. T-code `ZCON100` 을 실행하여 0100번 화면을 기동한다. -> 최초 PBO가 가동되며 `build_alv` 체인이 돌고 화면 한가운데에 한글 컬럼과 줄무늬를 먹은 정갈한 예매 ALV 표가 첫 탄생하는지 확인한다. (1문 첫 빌드 검수).
2. 표 상단의 정렬 단추와 합계 단추를 클릭해 ALV가 정상 작동하는지 만져본다. (2문 그리드 활성 검수).
3. 공연 코드를 `C002` 로 바꾸고 [조회] 단추를 누른다. -> PBO의 `ELSE` 분기가 발동되어 컨테이너 재생성 없이 `refresh_alv` 가 돌며 스크롤 위치를 고정한 채 C002 데이터 10건으로 표 알맹이만 안전하게 갱신되는지 확인한다. (3문 Stable Refresh 검수).
4. 표 상단 레이아웃 설정 단추를 눌러 컬럼 순서를 맘대로 바꾸고 Variant 저장을 실행해 본다. -> repid 키에 묶여 Variant 개인 보존이 활성화되는지 확인한다. (4문 Variant 검수).
5. 매진 회차 과제를 코딩해 넣어, 정원이 초과된 행 전체에 진한 빨간색 조명(`C610`)이 info_fname 매핑대로 시각적으로 들어오는지 확인한다. (5문 행 색상 검수).

```abap
" [ 통합 완성 소스 원안 ]
PROGRAM sapmzconcert.

" 1. 글로벌 참조 및 데이터 방 선언!
DATA: go_cont    TYPE REF TO cl_gui_custom_container,
      go_grid    TYPE REF TO cl_gui_alv_grid,
      lt_booking TYPE STANDARD TABLE OF zbooking,
      lt_fcat    TYPE lvc_t_fcat,
      ls_layout  TYPE lvc_s_layo,
      ls_variant TYPE disvariant.

DATA: p_concert  TYPE zconcert-concert_id. " 화면의 조회 입력 필드

MODULE status_0100 OUTPUT.
  SET PF-STATUS 'ST100'.
  SET TITLEBAR 'TB100'.

  " [PBO 라이프사이클 게이트 철칙] 그리드가 없을 때만 빌드, 있으면 리프레시만!
  IF go_grid IS INITIAL.
    PERFORM build_alv.
  ELSE.
    PERFORM refresh_alv.
  ENDIF.
ENDMODULE.

" ----------------------------------------------------
" 2. 책임 분할 FORM 서브루틴 체인 조립!
" ----------------------------------------------------
FORM build_alv.
  PERFORM select_booking. " 1단계: 데이터 획득
  PERFORM create_grid.    " 2단계: 다리 개설 + 그리드 조종기 장착
  PERFORM build_fieldcat. " 3단계: 컬럼 번역 조립
  PERFORM build_layout.   " 4단계: 스킨 & Variant 열쇠 조립
  PERFORM display_grid.   " 5단계: 첫 화면 인쇄 집행
ENDFORM.

FORM select_booking.
  SELECT * FROM zbooking INTO TABLE lt_booking
    WHERE concert_id = p_concert.
  IF sy-subrc <> 0.
    MESSAGE '예매 내역이 존재하지 않습니다.' TYPE 'S'.
  ENDIF.
ENDFORM.

FORM create_grid.
  CREATE OBJECT go_cont EXPORTING container_name = 'CONT100'.
  CREATE OBJECT go_grid EXPORTING i_parent = go_cont.
ENDFORM.

FORM build_fieldcat.
  DATA ls_fcat TYPE lvc_s_fcat.
  CALL FUNCTION 'LVC_FIELDCATALOG_MERGE'
    EXPORTING i_structure_name = 'ZBOOKING'
    CHANGING  ct_fieldcat      = lt_fcat
    EXCEPTIONS OTHERS          = 1.
  IF sy-subrc <> 0.
    MESSAGE '카탈로그 머지에 실패했습니다.' TYPE 'E'.
  ENDIF.
  LOOP AT lt_fcat INTO ls_fcat.
    IF ls_fcat-fieldname = 'SEATS'.
      ls_fcat-coltext = '예약석 수'. ls_fcat-outputlen = 8.
      MODIFY lt_fcat FROM ls_fcat INDEX sy-tabix.
    ENDIF.
  ENDLOOP.
ENDFORM.

FORM build_layout.
  ls_layout-zebra      = abap_true.
  ls_layout-cwidth_opt = abap_true.
  ls_layout-grid_title = '실시간 공연 예매 명단'.
  ls_variant-report    = sy-repid.
ENDFORM.

FORM display_grid.
  go_grid->set_table_for_first_display(
    EXPORTING is_layout  = ls_layout
              is_variant = ls_variant
              i_save     = 'A'
    CHANGING  it_outtab       = lt_booking
              it_fieldcatalog = lt_fcat
    EXCEPTIONS OTHERS   = 1 ).
  IF sy-subrc <> 0.
    MESSAGE 'ALV 첫 출력에 실패했습니다.' TYPE 'E'.
  ENDIF.
ENDFORM.

FORM refresh_alv.
  DATA ls_stable TYPE lvc_s_stbl.
  ls_stable-row = abap_true.
  ls_stable-col = abap_true.
  
  " 이미 데이터 lt_booking은 select_booking FORM을 타고 갱신된 상태임!
  go_grid->refresh_table_display(
    EXPORTING is_stable = ls_stable
    EXCEPTIONS OTHERS   = 1 ).
ENDFORM.
```

#### 체험/시뮬레이터 설계 (종합 캡스톤 렌더러)
- **프로세스 플로우**:
  1. 학습자가 조회란에 `C001` 을 기입하고 [조회 실행]을 누른다.
  2. PBO의 `IF go_grid IS INITIAL` 문이 참을 감지해 `build_alv` 공장이 돌며 격자판이 첫 렌더링 완성된다.
  3. 이어서 `C002` 를 입력하고 [조회 실행]을 클릭한다.
  4. PBO 게이트가 `ELSE` 방향 노란 신호를 켜며 `refresh_alv` 공장으로 바로 흘러간다.
  5. 스크롤바 눈금 락 배지가 켜진 채로 C002 예매 내역 데이터 10건으로 격자판 안쪽만 부드럽고 매끄럽게 교체 갱신 완료되는 최종 순환 애니메이션을 확인한다.
- **상태 및 데이터**:
  - `조회 조건을 바꿀 때마다 build_alv가 매번 재호출되도록 구조를 짠 상태` -> 가상 딘프로 화면 하단에 "Object already exists" 덤프 팝업과 함께 화면이 회색으로 블러(Blur) 처리되며 다운되는 연출.
- **피드백**: 이로써 9가지 조각들을 책임별 서브루틴으로 정돈하고, 1회 빌드-이후 리프레시 룰을 관통하여 강건한 예매 그리드 리포트를 소화해 내었음을 보증 마크와 함께 체험시킨다.

### 실수/주의

- **두 번째 PBO 실행 시 select_booking 호출 누락**: "refresh_alv 안에는 새로고침 지시어(`refresh`)만 있으니까 DB 조회는 안 해도 되겠지?" 하고 `select_booking` 호출을 빼먹으면, 내부 테이블 `lt_booking` 값은 옛날 그대로 멈춰있는 채로 화면만 껍데기 새로고침이 일어나 데이터 갱신이 누락되므로, **조회가 발생할 때는 무조건 내부 테이블을 SELECT로 채워 교체한 뒤 리프레시**를 먹여야 한다.

### 정리

- 복잡하고 긴 그리드 코드는 **책임별 FORM 서브루틴**으로 정교하게 쪼개어 가독성을 확보한다.
- **`go_grid IS INITIAL`** 게이트를 켜서 1회성 빌드와 2회차 이후 리프레시를 안전하게 격리한다.
- 조회 데이터를 갈아 끼울 때는 **`SELECT` 로 내부 테이블 교체 $\rightarrow$ `refresh_table_display` 로 화면 갱신** 순서로 순환 집행한다.
