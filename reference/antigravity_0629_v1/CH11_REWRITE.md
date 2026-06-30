# CH11_REWRITE - SALV 1차 (간단 ALV) v1

> 목적: `content/abap/CH11`의 6개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다.

## CH11 전체 설계

CH11의 한 문장 목표는 "WRITE 리스트의 한계(수동 정렬·필터 불가)를 직면하고, `CL_SALV_TABLE=>factory( )` 정적 팩토리 메서드가 내부 테이블을 CHANGING 으로 받아 힙 메모리에 ALV 객체 인스턴스를 생성(factory)하는 단계와, `lo_alv->display( )` 인스턴스 메서드가 SAP GUI 스크린 렌더링 엔진을 격발해 그리드를 화면에 물리 투영(display)하는 단계가 별개의 독립 단계임을 규명하여, SELECT → Internal Table → SALV 3단 파이프라인으로 예매 목록을 표로 출력하는 통제력을 수립한다"이다.

IT 비전공자 입문자는 `factory( )` 를 호출하면 즉시 표가 화면에 뜬다고 오해하다가, `display( )` 누락으로 아무것도 화면에 보이지 않는 "왜 안 뜨지?" 삽질을 하거나, `TRY/CATCH` 없이 `factory` 를 열어 런타임 예외 덤프를 맞는다.
또한, `get_functions( )->set_all( )` 없이 띄우면 툴바가 텅 비어 정렬조차 안 되는 표가 나오거나, `Data Element` 라벨을 비워두어 컬럼 제목이 기술명으로 뜨는 볼품없는 결과를 낳는다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **WRITE vs SALV vs Grid ALV 비교**: 3가지 출력 도구의 위상 지형도.
2. **factory 물리 기작**: `CL_SALV_TABLE=>factory( )` 가 `CHANGING t_table` 로 내부 테이블 주소를 바인딩하고 힙 메모리에 ALV 객체를 생성하는 물리 단계. `cx_salv_msg` 예외의 TRY/CATCH 필수 포장.
3. **factory ≠ display 명확 분리**: 객체 생성(factory) 과 화면 렌더링(display) 이 분리된 2단계 구조.
4. **get_functions → set_all 툴바 켜기**: 정렬·필터·합계·엑셀 내보내기 툴바 버튼 일괄 활성화.
5. **SELECT → SALV 3단 파이프라인 완성**: DB 조회 → 내부 테이블 적재 → SALV 객체 생성 → 화면 투영.
6. **범위 경계 가드**: Grid ALV(CH17), 셀 색/Hotspot(CH21), 이벤트(CH27), 편집(CH28) 을 R15 격리.
7. **콘서트앱 캡스톤**: ZBOOKING 예매 목록 SALV 표 출력.

---

## CH11-L01 - SALV의 목적과 CL_SALV_TABLE 개요

### 왜 필요한가

CH10 에서 잔여석 계산·예매 판정 로직을 모듈로 묶었다.
이제 그 연산 결과를 사용자에게 '보기 좋은 표' 로 출력하는 도구가 장벽이다.
- " 정훈영이 WRITE 리스트로 예매 결과를 출력했다.
화면에 길게 늘어진 텍스트 줄뿐이다. 정렬을 하려 해도 헤더 클릭이 안 되고, 특정 상태만 필터링도 안 되고, 엑셀로 추출도 안 된다.
사용자에게 정렬·필터·합계·엑셀 추출이 가능한 그리드 표를 코드 몇 줄로 제공할 수 있는 방법은 없는가?"
이 불편을 해소하는 가장 빠른 해결책, **SALV(Simple ALV)의 `CL_SALV_TABLE`** 의 위상과 역할 지형도를 파악해야 합니다.

**WRITE 리스트·SALV·Grid ALV 의 3가지 출력 도구 위상을 비교하고, SALV 가 내부 테이블을 받아 코드 몇 줄로 정렬·필터·합계·엑셀 내보내기가 탑재된 읽기 전용 그리드 표를 생성하는 목적과 한계를 규명하는 기술**이 필요하다. 그것이 **SALV 개요 파악**의 완수다.

### 무엇인가

#### 1. 3가지 출력 도구 위상 지형도

```text
┌───────────────────┬─────────────────────────┬──────────────────────────────────┐
│     도구           │       특성               │         언제 쓰나                 │
├───────────────────┼─────────────────────────┼──────────────────────────────────┤
│ WRITE 리스트       │ 수동, 투박, 정적 텍스트   │ 간단한 디버그 출력, 레거시 리포트  │
│ SALV (CL_SALV_TABLE)│ 간결, 읽기 전용, 표준 기능│ 코드 최소화 조회 리포트 (현재 단계)│
│ Grid ALV (CL_GUI_ALV_GRID)│ 강력, 셀 편집 가능, 이벤트│ 복잡한 편집·이벤트 필요 시 (CH17+)│
└───────────────────┴─────────────────────────┴──────────────────────────────────┘
```

#### 2. SALV 의 핵심 가치 — '공짜' 표준 기능 번들
- **CL_SALV_TABLE** 클래스의 `factory( )` 메서드에 내부 테이블을 넘기기만 하면, 별도 코딩 없이 다음이 자동으로 탑재된다:
  - **정렬(Sorting)**: 컬럼 헤더 클릭으로 오름차순/내림차순 전환.
  - **필터(Filter)**: 특정 값 범위만 필터링.
  - **합계(Sum)**: 숫자형 컬럼 합계 집계.
  - **엑셀 내보내기(Export)**: 클릭 한 번으로 .XLSX 추출.
  - **레이아웃 저장**: 사용자별 열 순서·너비 설정 저장.

#### 3. SALV 의 의도적 한계 — '읽기 전용'
- **셀 편집 불가**: 사용자가 화면에서 직접 셀 값을 수정하는 편집 기능은 SALV 의 범위 밖이다. 편집이 필요하면 Grid ALV(CH17) 나 SALV 심화(CH28) 로 이행한다.
- **이벤트 제한적**: 더블클릭·커스텀 툴바 버튼 이벤트는 CH27(ALV 이벤트)에서 다룬다.

### 어떻게 확인하는가

같은 예매 데이터를 WRITE 리스트와 SALV 표로 번갈아 보며 차이를 직관적으로 확인한다.

```abap
REPORT zhello_write_vs_salv.

DATA: lt_book TYPE TABLE OF zbooking,
      ls_book TYPE zbooking.

" 같은 데이터를 WRITE 로 출력 (투박 버전):
SELECT * FROM zbooking INTO TABLE lt_book.

LOOP AT lt_book INTO ls_book.
  WRITE: / ls_book-booking_id, ls_book-concert_id,
           ls_book-seats, ls_book-status.
ENDLOOP.
" → 단조로운 텍스트 줄. 정렬 클릭 안 됨. 필터 없음. 엑셀 추출 없음.

" ★ 같은 데이터를 SALV 로 출력 (표 버전 — L02 에서 상세 코딩):
" → 정렬·필터·합계·엑셀 내보내기 자동 탑재된 그리드 표!
```

#### 체험/시뮬레이터 설계 (WRITE vs SALV 비교 뷰어)
- **프로세스 플로우**:
  1. 학습자가 [WRITE 출력 패널] 과 [SALV 그리드 패널] 을 나란히 본다.
  2. [정렬 시도] 버튼을 누르면, WRITE 패널에는 ❌ "정렬 불가" 가 뜨고, SALV 패널에는 ✅ 헤더 클릭으로 정렬이 즉시 된다.
  3. [엑셀 추출] 버튼을 누르면, WRITE 패널에는 ❌ "수동 복사 필요", SALV 에는 ✅ 다운로드 완료 피드백이 나온다.
  4. [셀 편집 시도] 를 누르면, SALV 패널에도 ❌ "읽기 전용 — Grid ALV(CH17) 로" 안내가 뜨며 SALV 의 한계를 인식한다.
- **상태 및 데이터**:
  - `SALV 표에서 더블클릭 이벤트를 걸려는 상태` → 런타임 결과: `Double-click event requires ALV Event handler (CH27). Not in SALV 1st scope` 하이라이트.
- **피드백**: SALV 는 조회 리포트의 빠른 표준 해결사이며, 편집·이벤트는 더 심화된 도구가 담당함을 터득한다.

### 실수/주의

- **SALV 로 셀 편집까지 구현하려고 인터넷 예제를 뒤지다가 방법이 없자 Grid ALV(CL_GUI_ALV_GRID) 코드를 SALV 와 섞어 런타임 오류 초래**:
  - 도구를 구분해야 합니다. 편집은 CH17 의 Grid ALV 로 이행하고, SALV 는 읽기 전용 리포트로만 활용합니다.

### 정리

- **`WRITE`** 는 투박한 텍스트 출력, **`SALV (CL_SALV_TABLE)`** 은 읽기 전용 그리드 표(표준 기능 번들), **`Grid ALV`** 는 편집 가능 강력 표 (CH17+).
- SALV 는 정렬·필터·합계·엑셀 내보내기를 **코드 추가 없이 공짜**로 제공한다.
- SALV 의 한계: **셀 편집 불가**, **복잡 이벤트 제한** → 각각 CH17/CH27/CH28 로 격리.

---

## CH11-L02 - FACTORY 메서드로 Internal Table 출력

### 왜 필요한가

SALV 의 위상과 목적을 파악했다.
이제 실제로 내부 테이블을 SALV 표로 만드는 `factory( )` 호출 물리 기작이 장벽이다.
- " `cl_salv_table=>factory( )` 를 호출했는데 표가 화면에 안 뜬다.
`factory( )` 가 객체를 만드는 것과 `display( )` 가 화면에 그리는 것이 왜 따로 분리되어 있는가?"
그리고, `TRY/CATCH` 없이 `factory( )` 를 열었다가 런타임 예외 덤프를 맞는 함정까지 방어해야 합니다.

**`CL_SALV_TABLE=>factory( )` 가 내부 테이블을 CHANGING 으로 바인딩하고 힙 메모리에 ALV 객체를 생성하는 물리 단계와, `cx_salv_msg` 예외를 TRY/CATCH 로 포장하는 방어 기술, 그리고 Data Element 라벨 자동 상속 기작**이 필요하다. 그것이 **SALV factory 호출**의 완수다.

### 무엇인가

#### 🧭 [ factory( ) 의 물리 기작 명세 ]

```text
[1단계] factory 호출 — ALV 객체 힙 생성 :
   - 문법: cl_salv_table=>factory( IMPORTING r_salv_table = lo_alv
                                   CHANGING  t_table      = lt_book ).
   - 물리 기작: 
     ① '=' 기호처럼 보이는 => 는 정적 메서드 호출 연산자다 (CH10-L05 에서 배운 것!).
     ② factory 가 CHANGING t_table 로 내부 테이블 lt_book 의 메모리 주소를 바인딩한다.
        (데이터 복사 없이 주소만 잡는다 — 메모리 효율적.)
     ③ factory 가 힙 메모리(Heap Memory)에 CL_SALV_TABLE 객체 인스턴스를 생성한다.
     ④ 이 객체의 메모리 주소를 IMPORTING r_salv_table 파라미터를 통해 lo_alv 참조 변수에 돌려준다.
   - ⚠️ 결과: 이 시점에서 화면에는 아무것도 뜨지 않는다! 오직 메모리 안에 객체만 만들어졌을 뿐!
   │
[2단계] display 호출 — SAP GUI 화면 렌더링 :
   - 문법: lo_alv->display( ).
   - 물리 기작: 
     ① -> 는 객체 참조 변수를 통한 인스턴스 메서드 호출 연산자다 (정적 => 와 다름!).
     ② display 메서드가 내부적으로 SAP GUI 스크린 렌더링 엔진(Screen Painter)을 격발한다.
     ③ 바인딩된 lt_book 내부 테이블 데이터를 읽어 그리드 UI 컴포넌트를 화면에 물리 투영한다.
   - ★ 결과: 비로소 사용자 화면에 표 그리드가 나타난다!
```

#### 2. cx_salv_msg 예외의 TRY/CATCH 필수 포장

```text
- factory( ) 실행 시 내부적으로 다음과 같은 케이스에서 cx_salv_msg 예외를 던진다:
  - 내부 테이블의 딕셔너리 타입이 SALV 가 처리할 수 없는 구조인 경우.
  - 시스템 메모리 부족으로 ALV 객체 생성 실패한 경우.
- TRY/CATCH 없이 factory 를 쌩으로 열면, cx_salv_msg 발생 시 런타임 숏덤프(Short Dump)가
  즉시 기동되어 사용자 화면이 죽어버린다.
- 따라서 factory 호출은 반드시 TRY ... CATCH cx_salv_msg ... ENDTRY 로 포장한다.
```

#### 3. Data Element 라벨 자동 상속 — CH03 수고의 보상
- **내부 테이블의 행 타입이 Data Element 로 타입팅되어 있으면**, SALV 는 각 컬럼의 헤더 제목을 Data Element 의 **Field Label(필드 레이블)** 에서 자동으로 읽어와 그리드 헤더에 표시한다.
- CH03 에서 수고스럽게 Data Element 에 한국어 라벨을 채워 둔 결과가, SALV 그리드 컬럼 제목에 자동으로 나타나는 '나선형 보상' 이다.

### 어떻게 확인하는가

```abap
REPORT zhello_salv_factory.

DATA: lt_book TYPE TABLE OF zbooking,    " ZBOOKING 예매 내부 테이블
      lo_alv  TYPE REF TO cl_salv_table. " ALV 객체 담는 참조 변수 (CH20 에서 정식 학습)

START-OF-SELECTION.
  " 1단계: DB 조회 — 예매 데이터를 내부 테이블에 적재
  SELECT * FROM zbooking INTO TABLE lt_book.

  " 2단계: SALV 객체 생성 (factory) — 화면에 아직 아무것도 안 뜸!
  TRY.
      cl_salv_table=>factory(             " ★ 정적 팩토리 메서드 호출!
        IMPORTING r_salv_table = lo_alv   " 생성된 ALV 객체 참조를 돌려받음
        CHANGING  t_table      = lt_book  " 내부 테이블 주소 바인딩 (복사 없음)
      ).

      " 3단계: 표준 툴바 켜기
      lo_alv->get_functions( )->set_all( abap_true ).

      " 4단계: 화면 렌더링 (display) — 비로소 그리드 표가 화면에 투영됨!
      lo_alv->display( ).

    CATCH cx_salv_msg.                    " ★ 생성 예외 반드시 처리!
      MESSAGE 'ALV 생성 실패' TYPE 'I'.
  ENDTRY.
```

#### 체험/시뮬레이터 설계 (factory → display 2단계 격발기)
- **프로세스 플로우**:
  1. 학습자가 [DB 서버], [lt_book 내부 테이블 RAM], [힙 메모리 ALV 객체 영역], [SAP GUI 화면 프레임] 4칸을 본다.
  2. [① factory 격발] 버튼을 누른다. lt_book 의 주소 포인터가 ALV 객체 영역으로 결선되고, 힙에 `CL_SALV_TABLE` 객체 박스가 생성된다. 그러나 화면 프레임은 여전히 텅 비어 있다. "객체만 생성됨 — 화면 아직 없음" 라벨이 뜬다.
  3. [② display 격발] 버튼을 누른다. 렌더링 엔진이 ALV 객체를 읽어 화면 프레임에 그리드 표가 찰딱 투영된다! ✅ "그리드 표 화면 투영 완료" 라벨이 뜬다.
  4. 순서를 바꿔 [display 만 먼저] 격발하면, lo_alv 참조가 비어 있어 `NULLPOINTER` 에러 빨간 피드백이 나온다.
  5. [TRY/CATCH 없이 factory] 를 격발하면, cx_salv_msg 예외가 잡히지 않고 "숏덤프 발생" 경보를 감상한다.
- **상태 및 데이터**:
  - `display( ) 호출을 빠뜨리고 factory 만 호출한 상태` → 런타임 결과: `Object created in heap but screen is blank. display( ) must be called!` 하이라이트.
- **피드백**: factory 는 객체 생성, display 는 화면 투영의 명확한 2단계 분리 구조를 각인한다.

### 실수/주의

- **`CHANGING t_table = lt_book` 에 넘길 내부 테이블이 비어 있어 빈 그리드가 뜨는 당혹감 유발**:
  - 데이터 유무는 `IF lines( lt_book ) = 0.` 으로 factory 호출 전 체크해 빈 경우 안내 메시지를 먼저 격발하는 가드를 수호합니다.

### 정리

- **`CL_SALV_TABLE=>factory( )`** 는 **정적 팩토리 메서드**로, 내부 테이블 주소를 바인딩해 힙 메모리에 ALV 객체를 생성한다.
- **`factory` (객체 생성)** 와 **`display` (화면 투영)** 는 물리적으로 분리된 2단계 — 둘 다 호출해야 표가 뜬다.
- `factory` 는 반드시 **`TRY ... CATCH cx_salv_msg`** 로 포장한다.
- **Data Element 라벨**이 채워져 있으면 컬럼 제목이 자동 상속된다.

---

## CH11-L03 - 기본 Function 표시와 Display 실행

### 왜 필요한가

factory 로 ALV 객체를 생성하는 물리 기작까지 완수했다.
이제 생성된 ALV 객체에 정렬·필터·합계·엑셀 툴바 버튼을 활성화하고 화면에 투영하는 단계가 장벽이다.
- " factory 후 display 를 불렀는데 화면에 표는 뜨는데 툴바 버튼이 하나도 없다.
정렬하고 싶은데 헤더 클릭이 안 된다.
`get_functions( )->set_all( abap_true )` 를 끼워 넣으면 된다고 하는데, 이 2개의 메서드가 연결되는 방식이 어떤 구조인가?"
메서드 체이닝(`->`) 으로 객체에서 기능 객체를 뽑아 그 기능을 켜는 1줄짜리 구조를 이해해야 합니다.

**`lo_alv->get_functions( )` 가 Function 설정 객체를 반환하고, 그 객체에 바로 `->set_all( abap_true )` 를 메서드 체이닝으로 연결해 표준 툴바를 일괄 활성화하는 구조와, `lo_alv->display( )` 화면 렌더링 기술**이 필요하다. 그것이 **툴바 활성화 + 화면 투영**의 완수다.

### 무엇인가

#### 1. get_functions( ) → set_all( ) 메서드 체이닝

```text
lo_alv->get_functions( )->set_all( abap_true ).

분해하면:
① lo_alv->get_functions( ) :
   - lo_alv 참조 변수(ALV 객체)에서 '->' 인스턴스 메서드 호출로 get_functions( ) 를 격발.
   - 이 메서드는 ALV 객체 내부에 보관된 '기능(Function) 설정 객체' 의 참조를 RETURNING 으로 돌려준다.
   - 돌려받은 기능 설정 객체 참조는 임시로 메모리에 대기한다.

② -> set_all( abap_true ) :
   - ① 에서 받은 기능 설정 객체 참조에 바로 연이어 '->' 로 set_all( ) 메서드를 격발한다.
   - set_all( abap_true ) 는 기능 설정 객체 내부의 모든 표준 기능 플래그를 True 로 켠다:
     - 정렬(SORT), 필터(FILTER), 합계(SUM), 레이아웃 저장(LAYOUT), 엑셀 내보내기(EXPORT) 등.
   - 이 한 줄로 표준 툴바 버튼 전체가 활성화된다!
```

#### 2. lo_alv->display( ) — SAP GUI 화면 렌더링

```text
lo_alv->display( ).

- lo_alv 참조 변수에서 '->' 로 display( ) 인스턴스 메서드를 격발한다.
- 이 메서드가 SAP GUI 스크린 렌더링 엔진을 기동하여, 바인딩된 내부 테이블 데이터를
  격자(Grid) UI 컴포넌트로 화면에 물리 투영한다.
- display( ) 호출 직후 제어권이 ALV 라이브러리로 넘어가, 사용자가 F3/Back 를 눌러
  화면을 닫기 전까지 ABAP 프로그램 실행이 display( ) 라인에서 대기 상태가 된다.
```

### 어떻게 확인하는가

```abap
REPORT zhello_salv_functions.

DATA: lt_book TYPE TABLE OF zbooking,
      lo_alv  TYPE REF TO cl_salv_table.

START-OF-SELECTION.
  SELECT * FROM zbooking INTO TABLE lt_book.

  TRY.
      cl_salv_table=>factory(
        IMPORTING r_salv_table = lo_alv
        CHANGING  t_table      = lt_book ).

      " ★ 1줄로 모든 표준 툴바 버튼 활성화!
      lo_alv->get_functions( )->set_all( abap_true ).

      " ★ 화면에 그리드 표 투영! (이 줄이 없으면 아무것도 안 보임)
      lo_alv->display( ).

    CATCH cx_salv_msg.
      MESSAGE 'ALV 생성 실패' TYPE 'I'.
  ENDTRY.
```

#### 체험/시뮬레이터 설계 (SALV 표준 기능 스위치)
- **프로세스 플로우**:
  1. 학습자가 [ALV 객체] 와 [기능 설정 객체 (Function Setting)], 그리고 [화면 그리드] 를 본다.
  2. [set_all 없이 display 격발] → 그리드는 뜨는데 툴바 버튼이 텅 비어 있다. 헤더 클릭을 눌러도 정렬이 안 된다.
  3. [set_all( abap_true ) 추가 격발] → 툴바에 정렬·필터·합계·엑셀 버튼이 일제히 켜지는 피드백을 본다.
  4. [display 없이 set_all 만] → 기능 플래그는 켜졌지만 화면은 여전히 텅 비어 있다. "display 없으면 화면 투영 불가" 라벨이 뜬다.
- **상태 및 데이터**:
  - `set_all( abap_false ) 로 모든 기능을 꺼버린 상태` → 런타임 결과: `Toolbar rendered but all buttons disabled. Standard functions locked.` 하이라이트.
- **피드백**: set_all(abap_true) 한 줄로 표준 툴바 전체가 켜지고, display 가 없으면 화면 투영이 안 됨을 체득한다.

### 실수/주의

- **`lo_alv->get_functions( )->set_all( abap_true ).` 를 `display( )` 이후에 배치하여 이미 화면이 렌더링된 뒤 툴바 설정을 시도**:
  - display( ) 호출 이후에는 ALV 화면 제어권이 라이브러리로 넘어가 더 이상 설정 변경이 반영되지 않습니다. `get_functions( )` 는 반드시 `display( )` **이전**에 호출을 수호해야 합니다.

### 정리

- **`lo_alv->get_functions( )->set_all( abap_true )`** 1줄로 정렬·필터·합계·엑셀 내보내기 툴바 버튼이 일괄 활성화된다.
- **`get_functions( )` 는 display( ) 이전**에 호출해야 설정이 반영된다.
- **`lo_alv->display( )`** 가 SAP GUI 스크린 렌더링 엔진을 격발해 그리드를 화면에 투영한다.

---

## CH11-L04 - Internal Table → SALV 미니 리포트

### 왜 필요한가

factory + get_functions + display 의 3단 패턴까지 완수했다.
이제 이 조각들을 하나의 완성된 프로그램으로 연결하는 'SELECT → 내부 테이블 → SALV 3단 파이프라인' 통합이 장벽이다.
- " 각 단계는 알겠는데, 실제 DB 에서 데이터를 읽어 SALV 표로 출력하는 완성된 미니 리포트를 한 프로그램으로 짜는 전체 흐름이 어색하다."
이 파이프라인 전체를 손에 익히면 '첫 쓸 만한 리포트' 가 완성된다.

**DB 조회(SELECT INTO TABLE) → 내부 테이블 적재 → SALV 객체 생성(factory) → 툴바 활성화(set_all) → 화면 투영(display) 의 5단 파이프라인을 하나의 완성 프로그램으로 조립하는 기술**이 필요하다. 그것이 **SALV 미니 리포트 완성**의 완수다.

### 무엇인가

#### 🧭 [ SELECT → SALV 3단 데이터 파이프라인 명세 ]

```text
[1단계] DB 디스크 → 내부 테이블 RAM :
   SELECT * FROM zbooking INTO TABLE lt_book.
   - DB 에서 데이터를 Array Fetch(Array Fetch — CH08)로 한 방에 적재.
   - classic Open SQL 문법 사용 (@ 없음, CH19 이전).
   │
[2단계] 내부 테이블 RAM → ALV 객체 힙 :
   cl_salv_table=>factory( IMPORTING r_salv_table = lo_alv
                            CHANGING  t_table      = lt_book ).
   - lt_book 주소를 ALV 객체에 바인딩 (복사 없음).
   - 힙 메모리에 CL_SALV_TABLE 객체 인스턴스 생성.
   │
[3단계] ALV 객체 힙 → SAP GUI 화면 :
   lo_alv->get_functions( )->set_all( abap_true ).  " 툴바 켜기
   lo_alv->display( ).                               " 화면 렌더링
   - 바인딩된 lt_book 데이터를 그리드 UI 로 화면에 물리 투영.
```

### 어떻게 확인하는가

```abap
REPORT zsalv_booking.

DATA: lt_book TYPE TABLE OF zbooking,
      lo_alv  TYPE REF TO cl_salv_table.

START-OF-SELECTION.

  " ①  DB 조회 — classic Open SQL
  SELECT * FROM zbooking INTO TABLE lt_book.

  " ② 빈 결과 사전 가드
  IF lines( lt_book ) = 0.
    MESSAGE '예매 데이터가 없습니다.' TYPE 'S'.
    RETURN.
  ENDIF.

  " ③ SALV 객체 생성
  TRY.
      cl_salv_table=>factory(
        IMPORTING r_salv_table = lo_alv
        CHANGING  t_table      = lt_book ).

      " ④ 툴바 활성화
      lo_alv->get_functions( )->set_all( abap_true ).

      " ⑤ 화면 투영
      lo_alv->display( ).

    CATCH cx_salv_msg.
      MESSAGE 'ALV 생성 실패' TYPE 'I'.
  ENDTRY.
```

#### 체험/시뮬레이터 설계 (SELECT → 내부 테이블 → SALV 파이프라인 스텝퍼)
- **프로세스 플로우**:
  1. 학습자가 [DB 서버], [lt_book RAM 버퍼], [ALV 객체 힙], [SAP GUI 화면] 4개 노드를 파이프라인으로 연결된 상태로 본다.
  2. [① SELECT 격발] → 예매 데이터 6건이 DB 서버에서 lt_book RAM 버퍼로 Array Fetch 방식으로 촥 흘러 들어온다.
  3. [② factory 격발] → lt_book 의 주소 포인터가 ALV 객체 힙으로 결선되고 객체 박스가 생성된다.
  4. [③ set_all 격발] → 객체 내부 기능 플래그들이 초록불로 일제히 켜진다.
  5. [④ display 격발] → 렌더링 엔진이 격발되어 SAP GUI 화면 노드에 예매 목록 그리드 표가 투영되는 최종 완성 파이프라인 피드백을 감상한다.
  6. 단계를 건너뛰면 "②번을 먼저 해야 합니다" 안내가 뜬다.
- **상태 및 데이터**:
  - `조회 결과가 0건인 상태` → 런타임 결과: `lt_book is empty. ALV renders blank grid. Add lines() guard before factory.` 하이라이트.
- **피드백**: SELECT → factory → set_all → display 의 4단 파이프라인이 하나의 완성 미니 리포트를 만드는 표준 패턴임을 체득한다.

### 실수/주의

- **classic SELECT 대신 modern `INTO @lt_book` 형식으로 쓰면 CH19 이전 단계 에러 혼동**:
  - 이 시점(CH19 이전)은 `INTO TABLE lt_book` 의 classic Open SQL 을 사용해야 합니다. `@` 바인딩은 CH19(Modern Open SQL) 이후 규격입니다.

### 정리

- **`SELECT * FROM ... INTO TABLE lt_book`** (classic Open SQL) → **`factory`** → **`set_all`** → **`display`** 의 4단 파이프라인이 SALV 미니 리포트의 표준 골격이다.
- 조회 결과 0건 여부는 **`lines( lt_book ) = 0`** 으로 factory 전에 선제 가드한다.
- `factory` 는 **`TRY/CATCH cx_salv_msg`** 로 반드시 포장한다.

---

## CH11-L05 - SALV 기초 정리 및 이후 심화과정 소개

### 왜 필요한가

SELECT → SALV 3단 파이프라인 미니 리포트까지 완수했다.
이제 학습자가 "SALV 로 더 많은 것을 하고 싶다" 는 욕구와, "어디까지 지금 배워야 하나?" 라는 범위 혼란이 장벽이다.
- " 컬럼 제목을 바꾸고 싶다. 셀 색상을 넣고 싶다. 더블클릭 이벤트를 달고 싶다.
이것들을 지금 다 배워야 하나?"
나선형 학습의 원칙에 따라, 지금의 불편만 해결하고 심화는 명확히 격리하는 범위 경계 게이팅이 필요합니다.

**SALV 1차 범위(factory·set_all·display 읽기 전용 기본 표시)와, 컬럼 제목 세밀 제어(CH21)·셀 색(CH21)·이벤트(CH27)·편집(CH28)·컨테이너 Grid ALV(CH17) 의 심화 격리 경계 기술**이 필요하다. 그것이 **범위 경계 게이팅**의 완수다.

### 무엇인가

#### SALV 1차(지금) vs 심화(나중) 경계 지형도

```text
┌─────────────────────────────────────────────────────────────────┐
│ ✅ SALV 1차 — 지금(CH11) 범위                                     │
│   - factory( ) 로 내부 테이블 ALV 객체 생성                        │
│   - get_functions( )->set_all( ) 로 표준 툴바 일괄 활성화           │
│   - display( ) 로 화면 렌더링                                     │
│   - Data Element 라벨 자동 상속 컬럼 제목                          │
├─────────────────────────────────────────────────────────────────┤
│ ⏩ 심화 격리 — 나중(각 챕터)에서                                   │
│   - 컬럼 제목·너비·통화/수량 포맷 세밀 제어  → SALV 표시 심화 (CH21)│
│   - 셀 색·Hotspot·줄 색                   → CH21                 │
│   - 더블클릭·커스텀 툴바 버튼 이벤트         → ALV 이벤트 (CH27)    │
│   - 셀 직접 편집(Editable)                 → Grid ALV (CH28)      │
│   - 화면에 박는 컨테이너형 Grid ALV          → CH17                │
└─────────────────────────────────────────────────────────────────┘
```

#### 나선형 학습 원칙 — 왜 지금 다 안 가르치나
- **압도 방지**: 처음부터 ALV 의 모든 기능(컬럼 포맷, 색상, 이벤트, 편집)을 던지면 학습자가 압도되어 포기한다.
- **불편 기반 학습**: "표 출력이 투박하다" 는 현재의 불편을 SALV 로 해결한다. "컬럼 제목을 바꾸고 싶다", "더블클릭을 달고 싶다" 는 불편은 각자의 챕터에서 그 불편이 생길 때 배운다.

### 어떻게 확인하는가

요구사항 카드를 "지금(CH11) 해결 가능" vs "나중 챕터로" 분류하는 체험을 통해 경계를 체득한다.

```text
[지금(CH11) 해결 가능 카드]:
- ✅ 예매 목록을 표로 보여줘
- ✅ 헤더 클릭으로 정렬되게
- ✅ 엑셀로 추출되게
- ✅ 컬럼 제목을 Data Element 라벨로 자동

[나중 챕터로 격리 카드]:
- ⏩ 상태(STATUS) 컬럼 배경을 빨간색으로 (CH21)
- ⏩ 행을 더블클릭하면 상세 팝업 (CH27)
- ⏩ 그리드에서 좌석수를 직접 수정 (CH28)
- ⏩ 화면 내 특정 위치에 그리드를 박기 (CH17)
```

#### 체험/시뮬레이터 설계 (SALV 1차 범위 카드 분류기)
- **프로세스 플로우**:
  1. 학습자가 요구사항 카드 8장을 본다.
  2. 각 카드를 [지금(CH11)] 또는 [나중(CH17/21/27/28)] 레인에 드래그해 분류한다.
  3. [정답 확인] 을 누르면 바르게 분류된 카드는 초록, 잘못된 카드는 빨강으로 표시되고, 잘못된 이유 설명이 뜬다.
- **상태 및 데이터**:
  - `'컬럼 색상 제어' 카드를 지금(CH11) 에 배치한 상태` → 결과: `❌ 컬럼 색상은 CH21 SALV 심화 범위입니다. 지금은 읽기 전용 기본 표시만!` 하이라이트.
- **피드백**: 지금 범위를 명확히 인식하여 과잉 설계 충동을 방지한다.

### 실수/주의

- **SALV 로 셀 편집까지 구현하려고 무리하게 SALV 내부 클래스를 해킹하다가 런타임 오류 초래**:
  - 셀 편집이 필요하면 CH28 의 Grid ALV(Editable) 로 이행해야 합니다. SALV 는 읽기 전용 범위를 수호합니다.

### 정리

- **`SALV 1차`** 범위는 factory·set_all·display **읽기 전용 기본 표시** 까지다.
- 컬럼 세밀 제어(CH21), 셀 색(CH21), 이벤트(CH27), 편집(CH28), 컨테이너 Grid(CH17) 는 **심화 챕터로 격리**한다.
- 나선형 학습: **현재의 불편만 해결**하고, 다음 불편이 생길 때 그 챕터에서 심화를 배운다.

---

## CH11-L06 - 실습 — 예매 목록 SALV

### 왜 필요한가

SALV 1차 범위와 심화 경계까지 완수했다.
이제 콘서트 예매 앱의 3단계 캡스톤으로서 ZBOOKING 예매 데이터를 SELECT 해 SALV 표로 깔끔히 출력하는 실습이 최종 관문이다.
- " CH09 에서 구축한 ZBOOKING 테이블에 정훈영의 예매 데이터 3건이 적재되어 있다.
이것을 SALV 그리드 표로 출력하고, Data Element 라벨이 컬럼 제목으로 자동 상속되는지 확인하고, 정렬·합계·엑셀 추출이 코딩 없이 작동하는 것을 직접 확인해야 한다."
이 캡스톤을 완수해야만 다음 12장에서 '특정 공연만·특정 상태만' 필터링하는 선택 조건 SELECT-OPTIONS 로 도약할 수 있습니다.

**ZBOOKING 예매 데이터를 classic SELECT 로 조회하여 SALV 표로 출력하는 완성 리포트 빌드와, Data Element 라벨 자동 상속·표준 툴바 검증, 그리고 `get_columns( )` 로 STATUS 컬럼 제목을 직접 변경하는 도전 기술**이 필요하다. 그것이 **콘서트 예매 SALV 캡스톤**의 완수다.

### 무엇인가

#### 1. 예매 목록 SALV 리포트 완성

```abap
REPORT zcon_booking_list.

DATA: lt_book TYPE TABLE OF zbooking,
      lo_alv  TYPE REF TO cl_salv_table.

START-OF-SELECTION.

  " ① 예매 데이터 classic SELECT 조회
  SELECT * FROM zbooking INTO TABLE lt_book.

  " ② 빈 결과 가드
  IF lines( lt_book ) = 0.
    MESSAGE '조회된 예매 데이터가 없습니다.' TYPE 'S'.
    RETURN.
  ENDIF.

  " ③ SALV 객체 생성 + 툴바 + 화면 투영
  TRY.
      cl_salv_table=>factory(
        IMPORTING r_salv_table = lo_alv
        CHANGING  t_table      = lt_book ).

      lo_alv->get_functions( )->set_all( abap_true ).
      lo_alv->display( ).

    CATCH cx_salv_msg.
      MESSAGE 'ALV 생성 실패' TYPE 'I'.
  ENDTRY.
```

#### 2. Data Element 라벨 자동 상속 검증 체크포인트

```text
[검증 포인트 1] ZBOOKING 의 각 필드가 Data Element 로 타입팅되어 있는가?
   → SE11 ZBOOKING → 각 필드 → Data Element 이름 확인 (ZDE_BOOKING_ID 등)
   → 해당 Data Element 에 Field Label(한국어) 이 채워져 있는가?
   → ✅ 채워져 있으면 SALV 그리드 헤더에 한국어 제목 자동 출력됨!

[검증 포인트 2] 표준 툴바 정렬·합계·엑셀 추출 동작 확인
   → 그리드 헤더 클릭 → 정렬 오름차순/내림차순 전환 ✅
   → SEATS 컬럼 합계(Σ) 버튼 클릭 → 전체 좌석 수 합계 ✅
   → 엑셀 내보내기 버튼 클릭 → .XLSX 다운로드 ✅
```

#### 3. (도전) get_columns( ) 로 STATUS 컬럼 제목 직접 변경

```abap
" SALV 심화(CH21) 의 맛보기 — 컬럼 제목 직접 제어:
DATA lo_cols TYPE REF TO cl_salv_columns_table.
DATA lo_col  TYPE REF TO cl_salv_column_table.

lo_cols = lo_alv->get_columns( ).
TRY.
    lo_col ?= lo_cols->get_column( 'STATUS' ).
    lo_col->set_long_text( '예매상태' ).
    lo_col->set_medium_text( '예매상태' ).
    lo_col->set_short_text( '상태' ).
  CATCH cx_salv_not_found.
    " STATUS 컬럼 없음 — 무시
ENDTRY.
```

#### ⚠️ [ 12장 SELECT-OPTIONS 징검다리 명세 ]
- **현재의 리포트는 ZBOOKING 전체 예매 데이터를 한꺼번에 다 가져온다.**
- **불편 직면**: **공연 C001 의 예매만 보고 싶거나, 상태 'A'(승인) 인 것만 필터링해서 보고 싶다. 이 선택 조건 입력창을 ABAP 에서 어떻게 제공하는가?**
- **도약**: **다음 12장의 SELECT-OPTIONS 선택 조건 입력창으로 진입해 사용자가 공연 코드와 상태를 직접 입력해 필터링하는 리포트로 완성도를 높인다.**

### 어떻게 확인하는가

실습 체크리스트를 순서대로 밟아 완성 리포트를 검증한다.

```text
[1단계] ZBOOKING 에 데이터 적재 확인 :
   - SM30 → ZBOOKING → C001 공연 회차 01 에 정훈영 예매 3건, 이훈영 예매 1건 적재 확인.

[2단계] zcon_booking_list 리포트 실행 (F8) :
   - 예매 목록 SALV 그리드 표 출력 확인 ✅
   - BOOKING_ID, CONCERT_ID, SEATS, STATUS 컬럼 제목이 Data Element 라벨로 출력 확인 ✅

[3단계] 표준 툴바 동작 검증 :
   - SEATS 헤더 클릭 → 오름차순 정렬 ✅
   - Σ 합계 버튼 → SEATS 전체 합산 ✅
   - 엑셀 내보내기 버튼 → .XLSX 다운로드 ✅

[4단계] (도전) STATUS 컬럼 제목 '예매상태' 로 변경 후 재실행 확인 ✅
```

#### 체험/시뮬레이터 설계 (예매 목록 SALV 출력 + 정렬·합계 체험)
- **프로세스 플로우**:
  1. 학습자가 [zcon_booking_list 실행 버튼] 을 누른다.
  2. ZBOOKING 에서 데이터 6건이 SELECT → lt_book 에 적재, factory → ALV 객체 생성, display → 그리드 표 투영 파이프라인이 단계별 애니메이션으로 기동된다.
  3. 그리드 표가 화면에 나타난다. 컬럼 제목이 한국어 라벨로 뜨는지 확인한다.
  4. [SEATS 헤더 클릭] → 오름차순 정렬 즉시 반영 ✅.
  5. [Σ 합계 버튼] → 전체 예매 좌석 합산 숫자 등장 ✅.
  6. [STATUS 컬럼 제목 변경 도전] → '예매상태' 로 제목이 바뀌는 것 확인 ✅.
- **상태 및 데이터**:
  - `SELECT 조회 결과 0건인 상태` → 런타임 결과: `조회된 예매 데이터가 없습니다. RETURN 가드 작동` 하이라이트.
- **피드백**: SELECT → SALV 파이프라인이 완전히 손에 익었고, 전체 조회 vs 조건 필터링의 한계를 인지해 12장 SELECT-OPTIONS 로 도약 의지를 품는다.

### 실수/주의

- **ZBOOKING 테이블이 활성화되지 않아 SELECT 시 런타임 예외 발생**:
  - CH09 실습 때 ZCONCERT/ZPERF/ZBOOKING 이 모두 SE11 에서 활성화(Active) 상태임을 사전 체크해 수호합니다.

### 정리

- **`zcon_booking_list`** = SELECT → factory → set_all → display **4단 파이프라인** 완성 리포트.
- **`Data Element 라벨`** 자동 상속으로 컬럼 제목이 한국어로 자동 출력된다(CH03 보상).
- **표준 툴바** 정렬·합계·엑셀은 set_all 한 줄로 코딩 없이 공짜 제공된다.
- **12장 SELECT-OPTIONS** 로 도약하여 사용자 입력 조건으로 필터링하는 리포트를 완성한다.
