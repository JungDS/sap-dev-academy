# CH11_QA - antigravity_0629_v1 재작업 검수 및 Q&A

> 대상 파일: `reference/antigravity_0629_v1/CH11_REWRITE.md`
> 목적: CH11 v1 2차 튜닝 원고의 품질을 자가 검증하고, 비전공자 입문자를 위한 빈발 질문 및 구체적 답변을 정리한 QA 원장이다.

## 1. 재작업 품질 자가 검증

| 검증 항목 | 상세 기준 | 반영 내용 | 판정 |
| --- | --- | --- | --- |
| **입문자 가독성** | IT 비전공자 20대 전후 기준 친근한 비유와 쉬운 용어 노출 | WRITE vs SALV vs Grid 위상 지형도, factory=객체생성/display=화면투영 2단계 격발기, 4노드 파이프라인 스텝퍼(DB→RAM→힙→화면), 범위 카드 분류기 등 비유 사용 | 통과 |
| **5단 구성 흐름** | 왜 필요한가 → 무엇인가 → 어떻게 확인하나 → 실수/주의 → 정리 흐름 준수 | 6개 레슨 모두에 누락 없이 5단 세션 완비 | 통과 |
| **용어 인라인 정의** | 첫 등장 용어에 대해 괄호로 간결히 인라인 뜻풀이 수행 | ALV, SALV, CL_SALV_TABLE, factory, display, cx_salv_msg, get_functions, set_all, Array Fetch, 메서드 체이닝, 힙 메모리, 인스턴스 메서드 등 반영 | 통과 |
| **R15 게이팅 준수** | 후속 개념(컬럼 세밀 제어, 셀 색, 이벤트, 편집, 컨테이너 Grid)을 미리 설명하지 않고 타 챕터로 격리 | CH21(컬럼/색), CH27(이벤트), CH28(편집), CH17(컨테이너 Grid) 로 완벽 격리 | 통과 |
| **R6 classic-first** | `@` 바인딩 modern SELECT 사용 금지 | classic `INTO TABLE lt_book` 사용. `@` 는 CH19 이전 금지 명시 | 통과 |
| **R2 체험성 구체화** | 가상 시뮬레이터 구성 요소와 피드백 설계 수록 | L01~L06 전 레슨에 입력-상태-피드백 모션을 구체적인 텍스트 설계서로 수록 | 통과 |

---

## 2. 소스 커버리지 및 파일 매핑

- `CH11/_chapter.md` → `## CH11 전체 설계` 한 문장 목표 및 인트로.
- `CH11-L01.md` → `## CH11-L01 - SALV의 목적과 CL_SALV_TABLE 개요`
- `CH11-L02.md` → `## CH11-L02 - FACTORY 메서드로 Internal Table 출력`
- `CH11-L03.md` → `## CH11-L03 - 기본 Function 표시와 Display 실행`
- `CH11-L04.md` → `## CH11-L04 - Internal Table → SALV 미니 리포트`
- `CH11-L05.md` → `## CH11-L05 - SALV 기초 정리 및 이후 심화과정 소개`
- `CH11-L06.md` → `## CH11-L06 - 실습 — 예매 목록 SALV`

---

## 3. 입문자용 단골 질문 Q&A

### Q1. `cl_salv_table=>factory( )` 를 호출했는데 왜 화면에 표가 뜨지 않나요? display( ) 와 factory( ) 는 무슨 차이가 있나요?
**A**: **`factory( )` 는 힙 메모리에 ALV 객체 인스턴스를 생성하는 단계이고, `display( )` 는 생성된 객체를 읽어 SAP GUI 스크린 렌더링 엔진을 격발해 화면에 그리드를 물리 투영하는 별개의 단계입니다. factory 만 호출하면 메모리에 객체만 만들어지고 화면에는 아무것도 나타나지 않습니다.**
- **2단계 분리의 설계 이유**:
  factory 와 display 를 분리한 이유는 **두 단계 사이에 객체 설정을 삽입할 수 있도록** 하기 위해서입니다. 예를 들어, factory 로 객체를 만든 뒤, `get_functions( )->set_all( )` 로 툴바를 켜거나, `get_columns( )` 로 컬럼 제목을 변경한 다음, 마지막에 `display( )` 로 완성된 설정 그대로 화면에 투영하는 설계가 가능합니다.
  - **`factory( )`**: `CL_SALV_TABLE=>factory( IMPORTING r_salv_table = lo_alv CHANGING t_table = lt_book )`. 정적 팩토리 메서드(`=>`)가 내부 테이블 lt_book 의 메모리 주소를 바인딩하고 힙에 객체를 생성한다. `r_salv_table` 을 통해 생성된 객체 참조(주소)를 lo_alv 참조 변수에 돌려준다.
  - **`display( )`**: `lo_alv->display( )`. 인스턴스 메서드(`->`)가 렌더링 엔진을 격발하여 바인딩된 데이터를 그리드 UI 로 화면에 투영한다. 이 호출 후 제어권이 ALV 라이브러리로 넘어가 사용자가 F3 로 닫기 전까지 ABAP 프로그램이 이 라인에서 대기한다.

### Q2. `cl_salv_table=>factory( )` 호출 시 TRY/CATCH cx_salv_msg 로 감싸지 않으면 어떤 위험이 생기나요?
**A**: **`cx_salv_msg` 예외를 잡지 않은 상태에서 factory 내부에서 예외가 던져지면, 아바 런타임이 이를 처리할 핸들러를 찾지 못해 즉시 런타임 숏덤프(Short Dump — ABAP 프로그램 비정상 종료 에러 화면)를 기동하여 사용자 화면이 폭사합니다.**
- **cx_salv_msg 가 던져지는 조건**:
  1. 내부 테이블의 라인 타입이 SALV 가 처리할 수 없는 비정규 구조일 때.
  2. 시스템 메모리가 부족하여 힙에 ALV 객체를 생성하지 못할 때.
  3. CHANGING t_table 에 전달된 테이블이 유효하지 않을 때.
- **방어 패턴 (반드시 수호)**:
  ```abap
  TRY.
      cl_salv_table=>factory( ... ).
      lo_alv->get_functions( )->set_all( abap_true ).
      lo_alv->display( ).
    CATCH cx_salv_msg.
      MESSAGE 'ALV 생성 실패' TYPE 'I'.  " 사용자에게 안내 후 안전 종료
  ENDTRY.
  ```

### Q3. `lo_alv->get_functions( )->set_all( abap_true )` 에서 `->` 가 두 번 연속 나오는 구조는 어떻게 읽나요?
**A**: **`get_functions( )` 가 기능 설정 객체의 참조(메모리 주소)를 RETURNING 으로 돌려주고, 그 돌아온 참조를 즉시 연결한 `->` 로 `set_all( )` 메서드를 호출하는 메서드 체이닝(Method Chaining) 구조입니다. 중간 단계의 임시 참조 변수를 선언하지 않아도 한 줄에 연결해 쓸 수 있습니다.**
- **분해 독해법**:
  ```text
  lo_alv->get_functions( )->set_all( abap_true ).
  
  단계 ①: lo_alv->get_functions( )
           → lo_alv 참조(ALV 객체)에서 get_functions( ) 인스턴스 메서드를 호출.
           → 내부 기능 설정 객체(CL_SALV_FUNCTIONS_LIST)의 참조를 돌려줌.
  
  단계 ②: [돌아온 기능 설정 객체 참조]->set_all( abap_true )
           → 기능 설정 객체에서 set_all( ) 메서드를 호출.
           → 정렬·필터·합계·엑셀 등 모든 표준 기능 플래그를 abap_true(켜짐) 로 설정.
  ```
  중간 단계의 임시 변수 없이 한 줄에 연결할 수 있어 코드가 간결해지는 Clean ABAP 의 메서드 체이닝 패턴입니다.

### Q4. SALV 그리드의 컬럼 제목이 왜 자동으로 한국어로 나오나요? 내가 따로 설정하지 않았는데?
**A**: **SALV 가 내부 테이블의 라인 타입을 분석해 각 필드의 Data Element 를 읽고, 그 Data Element 에 등록된 Field Label(필드 레이블)을 컬럼 헤더 제목으로 자동 상속하기 때문입니다. CH03 에서 Data Element 에 한국어 라벨을 등록한 결과가 여기서 보상받는 나선형 학습의 연결 고리입니다.**
- **자동 상속 물리 기작**:
  SALV factory 가 내부 테이블 lt_book 의 라인 타입 `ZBOOKING` 을 분석합니다.
  각 필드 `BOOKING_ID`, `CONCERT_ID`, `SEATS`, `STATUS` 의 메타데이터에서 연결된 Data Element 이름을 읽습니다.
  Data Element 의 `Field Labels` 탭에 등록된 Long Text / Medium Text / Short Text 값을 SALV 렌더링 엔진이 컬럼 헤더로 표시합니다.
  만약 Data Element 가 아닌 표준 빌트인 타입(`TYPE c LENGTH 4` 등)으로 직접 타입팅하면, SALV 는 컬럼 제목을 필드 기술명(BOOKING_ID) 으로 표시합니다. 이것이 볼품없어 보이는 이유이고, **CH03 에서 Data Element 를 창조한 진짜 이유**입니다.

### Q5. SALV 가 읽기 전용이면, 사용자가 그리드에서 셀을 직접 수정하게 하려면 어떻게 해야 하나요?
**A**: **SALV(CL_SALV_TABLE)는 설계 원칙상 읽기 전용 조회 리포트 도구이므로 셀 직접 편집이 불가하며, 편집이 필요하면 CH28 의 Editable Grid ALV(CL_GUI_ALV_GRID)로 이행해야 합니다.**
- **SALV vs Grid ALV 편집 차이의 기술적 실체**:
  SALV 는 `CL_SALV_TABLE` 클래스가 내부적으로 `CL_GUI_ALV_GRID` 를 래핑(Wrapping)하여 간소화한 상위 레벨 추상 클래스입니다. 래핑 과정에서 편집 기능의 세밀한 제어 인터페이스가 의도적으로 제거되어, 셀 편집을 켜는 방법이 공개 API 로 제공되지 않습니다.
  - **SALV(CH11)**: 조회 전용, 코드 최소화, 표준 기능 번들(정렬·필터·합계·엑셀). 3~4줄로 완성.
  - **Editable Grid ALV(CH28)**: `EDITABLE` 속성 설정, 셀 편집 이벤트, 수정 후 DB 저장 로직 등. 수십 줄의 추가 코드 필요.
  - **현재 단계(CH11)**: 조회 리포트 = SALV. 편집 기능은 CH28 에서 필요가 생길 때 배운다.
