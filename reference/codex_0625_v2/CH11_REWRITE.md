# CH11_REWRITE - SALV 1차 (간단 ALV) v2

> 목적: `content/abap/CH11`의 6개 레슨을 기준으로, v1의 템플릿 반복을 제거하고 "WRITE 리스트의 한계를 느낀 입문자가 Internal Table을 SALV 표로 보여 주는 첫 리포트"를 완성 강의자료 수준으로 재집필한다. 이 문서는 아직 `content/abap` 원본 반영본이 아니라, 반영 전 검수 가능한 v2 재작성 산출물이다.

## CH11 전체 설계

CH11의 한 문장 목표는 "조회한 Internal Table을 사용자가 조작할 수 있는 표 형태로 보여 주는 첫 방법을 익힌다"이다.

CH06에서 학습자는 Internal Table을 만들고 `LOOP`로 행을 처리했다. CH08에서는 DB에서 데이터를 읽어 Internal Table에 담았다. 하지만 결과를 `WRITE`로 줄줄이 찍으면 개발자는 확인할 수 있어도, 사용자는 정렬, 필터, 합계, 내보내기를 할 수 없다. CH11은 이 불편을 해결하기 위해 [[ALV]](ABAP List Viewer, SAP GUI에서 표 형태 결과를 보여 주는 표준 뷰어)와 [[SALV]](Simple ALV, `CL_SALV_TABLE` 중심의 간단 ALV)를 처음 도입한다.

이 장은 OO를 깊게 가르치는 장이 아니다. `CL_SALV_TABLE`은 클래스이고 `factory`, `display`, `get_functions`는 메서드지만, 본격적인 객체 생성, 참조, 인스턴스 설계, 상속, 인터페이스, 예외 계층은 CH20에서 다룬다. CH11에서는 "이미 준비된 SAP 표 출력 도구를 정해진 순서로 호출한다"는 수준으로 제한한다.

### 범위와 금지선

CH11은 classic-first 구간이다. 코드 예제에는 inline declaration, constructor expression, object creation expression, string template, New Open SQL escape marker를 넣지 않는다. `TYPE REF TO`, `TRY ... CATCH`, `lo_alv->display( )`, `get_functions( )->set_all( )`는 SALV 호출에 필요한 최소한의 선행 사용으로 표시한다. 학습자는 이 문법을 분석하거나 암기하지 않고 "SALV 객체를 담는 변수", "실패할 수 있는 생성 호출 보호", "만들어진 ALV 객체에게 화면 표시를 부탁하는 호출" 정도로만 받아들이면 된다.

`START-OF-SELECTION`은 L04에서 프로그램의 실행 시작점을 분명히 보여 주기 위해 선행 사용한다. 정식 이벤트 블록 학습은 CH15에서 한다. L05에서 Grid ALV, SALV 표시 심화, 이벤트, 편집 ALV를 언급하지만 모두 L1 예고다. 필드 카탈로그, 컨테이너, 이벤트 핸들러, 셀 색상, 편집 검증 코드는 쓰지 않는다.

### 현재 소스 범위

`content/abap/CH11` 현재 상태는 6개 레슨이다. v2 산출물은 이 6개 레슨을 모두 다룬다.

| 레슨 | 현재 주제 | v2 재작성 초점 |
| --- | --- | --- |
| CH11-L01 | SALV 목적과 `CL_SALV_TABLE` 개요 | WRITE 리스트의 한계와 ALV/SALV의 정확한 역할 |
| CH11-L02 | `factory` 메서드로 Internal Table 출력 | `factory`는 객체 생성, `display`는 화면 표시라는 두 단계 분리 |
| CH11-L03 | 기본 Function 표시와 Display 실행 | 표준 툴바를 켜는 `get_functions( )->set_all( )`와 `display( )`의 역할 |
| CH11-L04 | Internal Table에서 SALV 미니 리포트 | classic SELECT, Internal Table, SALV를 하나의 실행 흐름으로 통합 |
| CH11-L05 | SALV 1차 범위와 심화 경계 | 지금 배우는 것과 뒤로 미루는 것을 명확히 구분 |
| CH11-L06 | 예매 목록 SALV 실습 | 콘서트 예매 목록을 SALV로 띄우고 정렬/합계/빈 결과를 확인 |

### 공식 문서 수동 확인 기준

v1은 CH11에 `WRITE` 형식 문서나 선택화면 문서 같은 자동 매칭 흔적이 섞였다. v2에서는 로컬 `C:\ABAP_DOCU_HTML`에서 아래 문서만 수동 근거로 채택한다.

- `C:\ABAP_DOCU_HTML\abenabap_lists.htm`: 표 형태 list output에는 SAP List Viewer(ALV) 클래스, 예를 들어 `CL_SALV_TABLE`을 사용한다는 근거.
- `C:\ABAP_DOCU_HTML\abenlist_guidl.htm`: production program에서는 classic lists 대신 SAP List Viewer(ALV)를 사용하라는 guideline 근거.
- `C:\ABAP_DOCU_HTML\abenabap_dynpro_list.htm`: tabular list output에 ALV 클래스가 쓰인다는 근거.
- `C:\ABAP_DOCU_HTML\abenseparation_concerns_guidl.htm`: `DATA ... TYPE REF TO cl_salv_table`, `cl_salv_table=>factory`, `IMPORTING r_salv_table`, `CHANGING t_table`, `alv->display( )`, `CATCH cx_salv_msg`가 함께 쓰인 공식 예제 근거.
- `C:\ABAP_DOCU_HTML\abapcall_method_parameters.htm`: method call의 `EXPORTING`, `IMPORTING`, `CHANGING` parameter direction 근거.
- `C:\ABAP_DOCU_HTML\abapcall_method_static_chain.htm`: chained method call 형태를 설명하는 근거. CH11에서는 `get_functions( )->set_all( )` 이해에만 사용한다.
- `C:\ABAP_DOCU_HTML\abapdata_references.htm`: `DATA ref TYPE REF TO type`가 reference variable을 선언한다는 근거.
- `C:\ABAP_DOCU_HTML\abaptry.htm`, `C:\ABAP_DOCU_HTML\abapcatch_try.htm`: `TRY ... CATCH ... ENDTRY`의 보호 구역과 exception handler 근거.
- `C:\ABAP_DOCU_HTML\abapselect.htm`: `SELECT`가 DB에서 데이터를 읽고 `sy-subrc`, `sy-dbcnt`를 설정한다는 근거.
- `C:\ABAP_DOCU_HTML\abapselect_into_target.htm`: `SELECT ... INTO TABLE`이 Internal Table target에 결과를 담는다는 근거.
- `C:\ABAP_DOCU_HTML\abapstart-of-selection.htm`: executable program의 standard processing block 근거. CH11에서는 선행 사용으로만 둔다.
- `C:\ABAP_DOCU_HTML\abenddic_data_elements.htm`, `C:\ABAP_DOCU_HTML\abenddic_data_elements_sema.htm`: Data Element의 technical/semantic properties와 field label 근거.
- `C:\ABAP_DOCU_HTML\abapmessage.htm`: 실패/빈 결과 안내용 `MESSAGE`와 message type, `DISPLAY LIKE` 근거.

로컬 ABAP keyword HTML에는 `CL_SALV_TABLE`의 개별 API 레퍼런스 파일이 별도로 보이지 않았다. 그래서 `factory`, `display`, `cx_salv_msg`는 위의 ALV guideline 및 separation-of-concerns 예제에서 확인한 범위만 근거로 삼는다. 프로젝트 감사 원장도 CH11 API 사용은 공식과 일치한다고 판정했지만, 이 파일에서는 자동 매칭 문서가 아니라 위 수동 확인 목록만 남긴다.

### CH11 공통 체험 장치

CH11은 표 출력의 가치를 눈으로 확인해야 한다. 각 레슨에는 다음 체험을 붙인다.

- L01: "WRITE 리스트 vs SALV 표" 비교 카드. 같은 6행 데이터를 `WRITE` 리스트와 표 화면으로 나란히 보여 주고, 정렬/필터/합계 가능 여부를 체크한다.
- L02: 기존 `embeds/abap/CH11-L02-S01.html`을 사용한다. `factory( )` 버튼을 누르면 객체 생성 상태만 바뀌고, `display( )` 버튼을 눌러야 표가 나타난다.
- L03: "툴바 스위치 패널" 설계. `set_all( abap_false )`, `set_all( abap_true )`, `display 누락` 상태를 버튼으로 바꾸어 툴바와 화면 표시 차이를 확인한다.
- L04: "SELECT -> Internal Table -> SALV" 파이프라인 스텝퍼. DB 표, Internal Table, SALV 화면을 3칸으로 놓고 `SELECT`, `DESCRIBE TABLE`, `factory`, `set_all`, `display` 순서로 상태가 이동한다.
- L05: "SALV 1차 범위 카드" 설계. 요구사항 카드를 지금 처리, CH17, CH21, CH27, CH28로 분류한다.
- L06: 기존 `embeds/abap/CH11-L06-S01.html`을 사용한다. 정상 데이터와 빈 테이블을 전환하고, 정렬과 `Sigma` 합계 버튼을 눌러 예매 목록을 업무 화면처럼 확인한다.

---

## CH11-L01 - SALV의 목적과 CL_SALV_TABLE 개요

### 왜 필요한가

입문자가 처음 ABAP을 배울 때 `WRITE`는 고마운 도구다. 값이 제대로 계산됐는지 바로 볼 수 있기 때문이다. 하지만 업무 리포트가 되면 이야기가 달라진다.

예매 목록이 6행일 때는 `WRITE`로도 볼 만하다. 600행이 되면 사용자는 "공연별로 정렬하고 싶다", "취소 상태만 빼고 보고 싶다", "좌석 수 합계를 보고 싶다", "엑셀로 내려받고 싶다"라고 말한다. `WRITE` 리스트는 이런 요구를 개발자가 하나씩 수동으로 구현해야 한다. 사용자가 표 헤더를 누르거나 필터를 거는 표준 조작도 기본으로 제공되지 않는다.

CH11-L01은 그래서 SALV를 "예쁜 출력"이 아니라 "Internal Table을 사용자 친화적인 표 화면으로 바꾸는 표준 통로"로 소개한다.

### 무엇인가

[[ALV]]는 ABAP List Viewer의 줄임말이다. 입문자에게는 "SAP GUI 안에서 데이터 표를 보여 주고, 정렬/필터/합계/내보내기 같은 표준 기능을 제공하는 화면 도구"라고 이해하면 된다.

[[SALV]]는 이 ALV를 간단히 쓰는 방식이다. CH11에서는 `CL_SALV_TABLE`이라는 SAP 표준 클래스를 사용한다. 이름을 분해하면 다음과 같다.

| 이름 | 입문자용 의미 |
| --- | --- |
| `CL_` | Class 이름이라는 신호 |
| `SALV` | Simple ALV 계열 |
| `TABLE` | 한 줄짜리 메시지가 아니라 표 데이터를 보여 주는 대상 |

중요한 전제는 "SALV가 데이터를 조회해 주는 도구가 아니다"라는 점이다. SALV는 이미 만들어진 [[Internal Table]]을 표로 보여 준다. DB에서 데이터를 읽는 일은 CH08의 `SELECT`, 행을 메모리에 담는 일은 CH06의 Internal Table이 담당한다. SALV는 그 결과를 화면에 올리는 표시 계층이다.

`WRITE` 리스트와 SALV를 비교하면 역할이 선명해진다.

| 구분 | `WRITE` 리스트 | SALV 표 |
| --- | --- | --- |
| 출력 모양 | 줄 단위 텍스트 | 행/열이 있는 표 |
| 정렬 | 직접 코딩 필요 | 표준 기능으로 제공 |
| 필터 | 직접 코딩 필요 | 표준 기능으로 제공 |
| 합계 | 직접 계산/출력 필요 | 숫자 컬럼은 표준 기능으로 가능 |
| 엑셀 내보내기 | 별도 구현 필요 | 표준 툴바에서 제공 |
| 편집 | 본래 목적 아님 | SALV 1차 범위에서는 읽기 전용 |

여기서 "읽기 전용"을 꼭 붙여야 한다. CH11의 SALV는 데이터를 깔끔히 보여 주는 장이다. 셀을 직접 고치고 저장하는 화면은 CH28의 Editable Grid ALV에서 다룬다.

### 어떻게 확인하는가

학습자는 같은 예매 데이터를 두 방식으로 바라본다.

1. `WRITE` 리스트 화면을 본다.
   - 예매번호, 공연ID, 고객명, 좌석수가 텍스트 줄로 보인다.
   - "좌석수 큰 순서로 정렬" 버튼이 없다.
   - "상태가 N인 것만 보기" 필터가 없다.
2. SALV 표 화면을 본다.
   - 같은 데이터가 행/열 표로 보인다.
   - 헤더를 눌러 정렬할 수 있다.
   - 표준 툴바에서 필터, 합계, 내보내기 같은 버튼이 보인다.
3. 학습자가 스스로 문장을 완성한다.
   - "SALV는 DB 조회 도구가 아니라, 이미 준비된 Internal Table을 표로 보여 주는 도구다."
   - "SALV 1차는 읽기 전용 표시까지다."

확인 질문은 다음처럼 낸다.

| 질문 | 기대 답 |
| --- | --- |
| SALV가 없으면 `WRITE`로 무엇을 직접 구현해야 하는가? | 정렬, 필터, 합계, 내보내기 같은 사용자 조작 |
| SALV에 넘기는 데이터는 어디에 있어야 하는가? | Internal Table |
| SALV 1차에서 셀 편집을 배우는가? | 아니다. 편집은 뒤의 Grid ALV/Editable ALV 범위다. |

### 체험 설계

체험 제목은 "WRITE 리스트 vs SALV 표 비교"로 둔다.

화면 데이터는 예매 목록 6행이다.

| booking_id | concert_id | customer | seats | status |
| ---: | --- | --- | ---: | --- |
| 5001 | C001 | 정훈영 | 2 | N |
| 5002 | C001 | 손흥민 | 4 | N |
| 5003 | C001 | 아이유 | 3 | N |
| 5004 | C002 | 유재석 | 1 | C |
| 5005 | C002 | 김연아 | 2 | N |
| 5006 | C001 | 차은우 | 5 | N |

버튼과 상태는 다음처럼 설계한다.

| 버튼 | 화면 상태 | 피드백 |
| --- | --- | --- |
| `WRITE로 보기` | 데이터를 고정폭 텍스트 줄로 표시 | "값은 보이지만 사용자가 바로 정렬/필터를 할 수 없습니다." |
| `SALV로 보기` | 같은 데이터를 표로 표시하고 헤더/툴바 영역 노출 | "같은 Internal Table이 사용자 조작 가능한 표가 되었습니다." |
| `좌석수 정렬 시도` | WRITE 상태에서는 변화 없음, SALV 상태에서는 `seats` 내림차순 | "SALV의 가치는 데이터 조회가 아니라 표시 후 조작입니다." |
| `합계 보기` | SALV 상태에서 좌석수 합계 17 표시 | "개발자가 합계 라인을 직접 WRITE하지 않아도 표준 기능으로 확인합니다." |

오답/주의 피드백도 둔다.

- 학습자가 "SALV가 데이터를 읽어 온다"를 고르면: "데이터 읽기는 `SELECT`, 담는 곳은 Internal Table, 보여 주는 도구가 SALV입니다."
- 학습자가 "SALV로 셀 편집 가능"을 고르면: "CH11 SALV 1차는 읽기 전용 표시입니다. 편집은 CH28에서 다룹니다."

### 실수와 주의

가장 흔한 실수는 SALV를 만능 화면 도구로 생각하는 것이다. SALV는 빠르게 표를 보여 주는 데 강하지만, 화면 안에 고정 배치된 복잡한 컨트롤, 셀 편집, 이벤트 기반 입력 검증은 지금 범위가 아니다.

두 번째 실수는 `WRITE`를 완전히 버려야 한다고 받아들이는 것이다. 학습용 확인, 아주 작은 디버깅 출력에는 `WRITE`가 여전히 이해하기 쉽다. 다만 업무 사용자가 반복해서 볼 리포트라면 ALV 표가 더 적합하다.

세 번째 실수는 `CL_SALV_TABLE`이라는 이름을 보고 OO를 지금 전부 이해해야 한다고 느끼는 것이다. 지금은 CH10에서 본 "클래스의 정적 메서드를 호출할 수 있다" 정도의 감각이면 충분하다. 본격 OO는 CH20에서 한다.

### 정리

- [[ALV]]는 사용자가 조작할 수 있는 표준 표 출력 도구다.
- [[SALV]]는 `CL_SALV_TABLE`로 Internal Table을 간단히 ALV 표로 보여 주는 방식이다.
- SALV는 데이터를 조회하지 않는다. 조회는 `SELECT`, 저장 위치는 Internal Table, 표시는 SALV가 맡는다.
- CH11의 SALV 1차 범위는 읽기 전용 기본 표시와 표준 기능이다.
- 이제 목적을 알았으니, 다음 레슨에서는 `factory( )`와 `display( )` 두 단계로 실제 표를 띄운다.

---

## CH11-L02 - FACTORY 메서드로 Internal Table 출력

### 왜 필요한가

L01에서 SALV가 Internal Table을 표로 보여 주는 도구라는 목적을 알았다. 이제 입문자가 반드시 넘어야 하는 첫 장벽은 "어떤 호출이 표를 만들고, 어떤 호출이 화면에 띄우는가"이다.

SALV를 처음 쓰면 `cl_salv_table=>factory( )`라는 긴 호출이 먼저 나온다. 이름만 보면 이것이 바로 화면을 띄우는 것처럼 느껴진다. 하지만 `factory( )`는 화면 표시가 아니라 ALV 객체를 만드는 단계다. 만들어진 객체를 `lo_alv` 같은 reference variable에 담고, 그 객체에게 `display( )`를 호출해야 실제 표가 열린다.

따라서 이 레슨의 핵심은 코드 암기가 아니라 두 단계 구분이다.

1. `factory( )`: Internal Table을 받아 ALV 객체를 만든다.
2. `display( )`: 만들어진 ALV 객체를 화면에 표시한다.

### 무엇인가

`factory`는 "공장"이라는 이름처럼, 필요한 재료를 받아 사용할 수 있는 결과물을 만들어 준다. CH11에서는 표시할 Internal Table이 재료이고, 만들어지는 결과물이 SALV 객체다.

> [선행 사용] `TYPE REF TO`, `TRY ... CATCH`, `->` 호출은 CH20에서 정식으로 배운다. 지금은 각각 "SALV 객체를 담는 변수", "factory 실패 보호", "만들어진 객체에게 일을 시키는 호출"이라고만 이해한다.

```abap
DATA lo_alv TYPE REF TO cl_salv_table.

TRY.
    cl_salv_table=>factory(
      IMPORTING r_salv_table = lo_alv
      CHANGING  t_table      = lt_person ).
  CATCH cx_salv_msg.
    MESSAGE 'ALV 생성 실패' TYPE 'I'.
ENDTRY.

lo_alv->display( ).
```

이 코드는 호출 방향을 잘못 이해하기 쉽다. ABAP 메서드 호출에서는 호출자 입장에서 방향을 읽는다.

| 코드 | 입문자용 해석 |
| --- | --- |
| `IMPORTING r_salv_table = lo_alv` | factory가 만들어 준 ALV 객체를 호출자 쪽 `lo_alv`로 받아 온다. |
| `CHANGING t_table = lt_person` | 표시할 Internal Table을 factory에 넘긴다. SALV가 이 테이블 구조를 보고 컬럼을 만든다. |
| `CATCH cx_salv_msg` | ALV 객체를 만들다 실패하면 덤프 대신 안내 메시지로 처리한다. |
| `lo_alv->display( )` | 만들어진 ALV 객체에게 화면 표시를 요청한다. |

`factory`와 `display` 사이에 한 줄을 두고 설명해야 한다. `factory`까지 성공해도 화면에는 아직 표가 없다. `lo_alv`라는 손잡이가 준비됐을 뿐이다.

### 어떻게 확인하는가

기존 시뮬레이터 `embeds/abap/CH11-L02-S01.html`을 기준으로 확인한다.

1. `정상 데이터 (6행)`을 선택한다.
2. `factory( )` 버튼을 누른다.
   - 상태 표시가 "ALV 객체 생성됨"으로 바뀐다.
   - 표는 아직 보이지 않는다.
   - `display( )` 버튼이 활성화된다.
3. `display( )` 버튼을 누른다.
   - `LT_PERSON`이 표로 나타난다.
   - 컬럼 제목이 `persid`, `name` 같은 기술명만이 아니라 "사번", "이름"처럼 보인다.
4. `빈 테이블 (0행)`을 선택하고 같은 순서로 누른다.
   - 오류가 아니라 빈 표가 나타난다.
   - 학습자는 "빈 결과는 factory 실패가 아니다"를 확인한다.

시뮬레이터 뒤에는 다음 질문을 붙인다.

| 질문 | 확인 기준 |
| --- | --- |
| `factory( )`만 누른 뒤 표가 보였는가? | 보이지 않아야 정상이다. |
| `display( )`는 무엇을 하는가? | 이미 만들어진 ALV 객체를 화면에 표시한다. |
| 빈 Internal Table이면 `cx_salv_msg`가 발생하는가? | 일반적으로 빈 표가 표시될 뿐이다. 데이터 없음과 생성 실패는 다르다. |

### 체험 설계

이 레슨은 기존 embed를 사용한다.

```text
::embed CH11-L02-S01 | SALV factory -> display 시뮬레이터::
```

체험의 핵심 상태는 4개다.

| 상태 | 화면 | 학습 피드백 |
| --- | --- | --- |
| 초기 | 코드와 Internal Table 데이터만 보임, `display( )` 비활성 | "먼저 ALV 객체를 만들어야 합니다." |
| factory 완료 | `lo_alv` 생성 상태 표시, 표는 숨김 | "`factory( )`는 화면 표시가 아니라 객체 생성입니다." |
| display 완료 | ALV 표와 툴바 표시 | "`display( )`가 실제 화면 표시 단계입니다." |
| 빈 테이블 | 컬럼은 보이고 행은 없음 | "데이터 없음은 생성 실패와 다릅니다. 조회 결과를 따로 확인해야 합니다." |

버튼 피드백은 학습자가 틀리기 쉬운 순서를 바로 잡아야 한다.

- `display( )`를 먼저 누르려 하면 버튼을 비활성화하고 "아직 `lo_alv`가 준비되지 않았습니다."라고 표시한다.
- `factory( )`를 누른 뒤 표가 안 보인다고 오답을 고르면 "정상입니다. 아직 `display( )`를 호출하지 않았습니다."라고 표시한다.
- 빈 테이블을 오류라고 고르면 "빈 표는 사용 가능한 결과입니다. 조회 조건이나 원본 데이터를 확인해야 합니다."라고 표시한다.

### 실수와 주의

첫 번째 실수는 `display( )` 누락이다. 실제 프로그램에서 `factory`까지 정상 실행됐는데 화면이 안 뜨면, 먼저 `lo_alv->display( ).`가 있는지 확인한다.

두 번째 실수는 `TRY ... CATCH`를 빼는 것이다. 지금은 예외 처리 전체를 배우는 장이 아니지만, 공식 예제에서도 `cx_salv_msg`를 잡는다. 최소한 factory 호출은 보호 구역 안에 둔다.

세 번째 실수는 `IMPORTING`과 `CHANGING` 방향을 거꾸로 이해하는 것이다. `IMPORTING r_salv_table = lo_alv`는 "내가 SALV 객체를 받아 온다"이고, `CHANGING t_table = lt_person`은 "표시할 테이블을 넘긴다"이다.

네 번째 실수는 빈 Internal Table을 SALV 오류로 오해하는 것이다. 빈 결과는 DB 조회나 조건의 문제일 수 있다. CH08에서 배운 `sy-subrc`, `sy-dbcnt`, 또는 `DESCRIBE TABLE`로 데이터 존재를 먼저 확인한다.

### 정리

- `cl_salv_table=>factory( )`는 Internal Table을 받아 ALV 객체를 만든다.
- `factory( )`만으로는 화면이 뜨지 않는다.
- `lo_alv->display( )`가 실제 화면 표시 단계다.
- `TYPE REF TO`, `TRY ... CATCH`, `->`는 CH20 전 선행 사용이므로 지금은 용도만 기억한다.
- 다음 레슨에서는 표가 뜬 뒤 사용자가 누를 수 있는 표준 기능 버튼을 켠다.

---

## CH11-L03 - 기본 Function 표시와 Display 실행

### 왜 필요한가

L02에서 표를 띄웠다. 그런데 표만 보이고 표준 기능 버튼이 충분히 보이지 않으면 사용자는 여전히 불편하다. 정렬, 필터, 합계, 레이아웃, 엑셀 내보내기 같은 기능은 ALV를 쓰는 가장 큰 이유다.

CH11-L03은 "표를 띄운다"에서 한 걸음 더 나아가 "사용자가 표를 조작할 수 있게 기본 function을 켠다"를 다룬다. 여기서 function은 ABAP Function Module이 아니라 ALV 툴바 기능 묶음이다. 이름이 비슷하므로 반드시 구분해야 한다.

### 무엇인가

SALV 객체에는 표준 기능을 관리하는 객체가 있다. 우리는 그 내부 구조를 파고들지 않고, 정해진 호출 한 줄로 기본 기능을 모두 켠다.

> [선행 사용] `lo_alv->get_functions( )->set_all( abap_true )`는 chained method call이다. CH11에서는 "SALV 객체에서 기능 담당자를 꺼내고, 그 기능 담당자에게 전체 기능을 켜라고 지시한다" 정도로만 읽는다. 메서드 체이닝과 객체 구조는 CH20 이후에 정리한다.

```abap
lo_alv->get_functions( )->set_all( abap_true ).
lo_alv->display( ).
```

두 줄의 역할은 다르다.

| 줄 | 역할 |
| --- | --- |
| `get_functions( )->set_all( abap_true )` | 표준 툴바 기능을 켠다. |
| `display( )` | 화면에 ALV 표를 표시한다. |

`set_all`을 호출하지 않아도 표는 뜰 수 있다. 하지만 사용자가 기대하는 표준 기능이 부족해 보일 수 있다. 반대로 `set_all`만 호출하고 `display`를 빼면 기능은 설정됐지만 화면이 열리지 않는다.

### 어떻게 확인하는가

이 레슨에는 "툴바 스위치 패널"을 붙인다.

확인 순서는 다음과 같다.

1. `factory 완료` 상태에서 시작한다.
2. `툴바 끄기`를 선택한다.
   - 표는 뜨지만 툴바 버튼이 없거나 제한적으로 보인다.
   - 피드백: "표시와 기능 설정은 별개입니다."
3. `set_all( abap_true )`를 선택한다.
   - 정렬, 필터, 합계, 엑셀, 인쇄 같은 버튼 영역이 나타난다.
   - 피드백: "표준 기능을 직접 하나하나 만들지 않고 켰습니다."
4. `display 누락`을 선택한다.
   - 코드에는 `set_all`까지 표시되지만 표는 나타나지 않는다.
   - 피드백: "`display( )`가 없으면 화면 출력이 없습니다."

확인 질문은 짧게 둔다.

| 질문 | 기대 답 |
| --- | --- |
| `set_all`은 데이터를 조회하는가? | 아니다. 표준 기능을 켠다. |
| `display` 없이 `set_all`만 하면 화면이 뜨는가? | 아니다. |
| `function`이라는 말은 Function Module인가? | 아니다. 여기서는 ALV 툴바 기능이다. |

### 체험 설계

L03은 원본에 코드가 있지만 embed가 없으므로 R2 보강이 필요하다. 신규 학습수단은 다음처럼 설계한다.

체험 제목: "SALV 표준 기능 스위치"

데이터는 L02의 `LT_PERSON` 6행을 재사용한다. 화면은 코드 영역, 툴바 미리보기, 표 영역, 피드백 영역으로 나눈다.

| 버튼 | 코드 강조 | 화면 상태 | 피드백 |
| --- | --- | --- | --- |
| `기능 끄고 표시` | `lo_alv->display( ).`만 강조 | 표는 보이고 툴바 버튼은 최소화 | "표시는 됐지만 사용자의 조작 기능이 제한됩니다." |
| `set_all 켜기` | `lo_alv->get_functions( )->set_all( abap_true ).` 강조 | 정렬/필터/합계/엑셀 버튼 표시 | "표준 기능 묶음을 켰습니다." |
| `display 빼기` | `display( )` 줄을 흐리게 처리 | 표 영역에 "아직 화면 표시 안 됨" | "기능 설정은 화면 표시가 아닙니다." |
| `합계 누르기` | 툴바의 `Sigma` 버튼 강조 | salary 합계 표시 | "숫자 컬럼은 표준 기능으로 합계 확인이 가능합니다." |

오답 피드백은 다음처럼 둔다.

- "set_all이 표를 띄운다"를 고르면: "`set_all`은 기능을 켜고, `display`가 화면을 엽니다."
- "function은 Function Module이다"를 고르면: "CH11-L03의 function은 ALV 표준 버튼 기능입니다. CH10의 Function Module과 다릅니다."
- "툴바는 개발자가 직접 그린다"를 고르면: "SALV 기본 기능은 표준으로 제공됩니다. 그래서 SALV가 입문 리포트에 좋습니다."

### 실수와 주의

첫 번째 실수는 `display( )`를 마지막에 빼먹는 것이다. L02와 L03에서 반복해서 강조하는 이유는 실제로 가장 자주 나는 실수이기 때문이다.

두 번째 실수는 `set_all( abap_true )`를 데이터 처리 코드로 오해하는 것이다. 이 줄은 데이터를 바꾸지 않는다. 사용자가 누를 수 있는 기능을 켤 뿐이다.

세 번째 실수는 `get_functions( )->set_all( )`를 지금 완전히 분석하려 드는 것이다. 지금은 체이닝의 내부 원리를 외우지 않는다. "SALV 객체에서 기능 담당자를 꺼내 전체 기능을 켠다"라는 업무적 의미만 남긴다.

### 정리

- `get_functions( )->set_all( abap_true )`는 SALV 표준 툴바 기능을 켠다.
- `display( )`는 화면 표시다. `set_all`과 역할이 다르다.
- CH11에서 function은 ALV 버튼 기능을 뜻한다. Function Module과 혼동하지 않는다.
- 다음 레슨에서는 `SELECT`, Internal Table, `factory`, `set_all`, `display`를 하나의 미니 리포트로 이어 붙인다.

---

## CH11-L04 - Internal Table에서 SALV 미니 리포트

### 왜 필요한가

지금까지는 SALV 조각을 따로 봤다. 하지만 실제 업무 리포트는 조각으로 실행되지 않는다. DB에서 데이터를 읽고, Internal Table에 담고, SALV 객체를 만들고, 툴바를 켜고, 화면에 표시하는 흐름이 한 프로그램 안에서 이어져야 한다.

CH11-L04는 첫 "쓸 만한 표 리포트"를 완성하는 레슨이다. 이 레슨의 성공 기준은 코드가 길어 보이지 않는 것이 아니라, 학습자가 각 줄이 어느 단계에 속하는지 설명할 수 있는 것이다.

### 무엇인가

미니 리포트는 5단계 파이프라인이다.

| 단계 | 역할 | 확인할 것 |
| --- | --- | --- |
| 1. DB 조회 | `SELECT ... INTO TABLE` | `sy-subrc`, 조회 행 수 |
| 2. 행 수 확인 | `DESCRIBE TABLE ... LINES` | 빈 결과인지 아닌지 |
| 3. SALV 객체 생성 | `cl_salv_table=>factory` | `lo_alv`가 준비됐는지 |
| 4. 표준 기능 설정 | `get_functions( )->set_all( abap_true )` | 툴바 기능 |
| 5. 화면 표시 | `display( )` | 사용자가 보는 표 |

> [선행 사용] `START-OF-SELECTION`은 CH15에서 정식으로 다룬다. 여기서는 실행되는 본문을 한곳에 모아 "프로그램이 실제 일을 시작하는 구역"으로만 사용한다.

```abap
REPORT zch11_l04_salv_person.

DATA: lt_person TYPE TABLE OF ztperson,
      lv_count  TYPE i,
      lo_alv    TYPE REF TO cl_salv_table.

START-OF-SELECTION.
  SELECT * FROM ztperson INTO TABLE lt_person.

  DESCRIBE TABLE lt_person LINES lv_count.
  IF lv_count = 0.
    MESSAGE '조회된 데이터가 없습니다' TYPE 'I'.
  ENDIF.

  TRY.
      cl_salv_table=>factory(
        IMPORTING r_salv_table = lo_alv
        CHANGING  t_table      = lt_person ).

      lo_alv->get_functions( )->set_all( abap_true ).
      lo_alv->display( ).
    CATCH cx_salv_msg.
      MESSAGE 'ALV 생성 실패' TYPE 'I'.
  ENDTRY.
```

`SELECT *`는 입문 예제를 짧게 만들기 위한 형태다. 실제 업무에서는 필요한 컬럼만 고르는 습관이 중요하다. 다만 CH11의 초점은 SELECT 최적화가 아니라 "조회 결과를 SALV로 표시하는 흐름"이다.

### 어떻게 확인하는가

실행 전에는 학습자에게 예상표를 먼저 채우게 한다.

| 코드 줄 | 실행 후 기대 상태 |
| --- | --- |
| `SELECT * ... INTO TABLE lt_person` | DB 결과가 `lt_person`에 들어간다. |
| `DESCRIBE TABLE ... LINES lv_count` | `lv_count`가 행 수를 가진다. |
| `factory` | `lo_alv`에 ALV 객체가 준비된다. 표는 아직 안 보인다. |
| `set_all` | 표준 기능이 켜진다. 표는 아직 안 보일 수 있다. |
| `display` | ALV 표가 화면에 나타난다. |

실행 후에는 다음을 확인한다.

1. 정상 데이터가 있을 때
   - `lv_count`가 0보다 크다.
   - ALV 표가 보인다.
   - 표준 툴바가 보인다.
2. 데이터가 없을 때
   - `MESSAGE '조회된 데이터가 없습니다' TYPE 'I'.`가 표시된다.
   - 이후에도 SALV는 빈 표를 띄울 수 있다.
   - 학습자는 "빈 결과"와 "ALV 생성 실패"를 구분한다.
3. `display( )` 줄을 주석 처리한 상태
   - 조회와 factory가 실행돼도 화면이 뜨지 않는다.
   - 원인은 데이터가 아니라 화면 표시 호출 누락이다.

### 체험 설계

L04는 원본에 코드가 있지만 체험이 없으므로 "SELECT -> Internal Table -> SALV 파이프라인" 스텝퍼를 설계한다.

화면은 3개의 큰 칸으로 구성한다.

```text
[DB Table: ZTPERSON] -> [Internal Table: LT_PERSON] -> [SALV 화면]
```

버튼과 상태는 다음과 같다.

| 버튼 | DB 칸 | Internal Table 칸 | SALV 칸 | 피드백 |
| --- | --- | --- | --- | --- |
| `SELECT 실행` | 6행 강조 | `lt_person`에 6행 복사 | 비어 있음 | "`SELECT`는 화면이 아니라 메모리 표를 채웁니다." |
| `행 수 확인` | 변화 없음 | `lv_count = 6` 표시 | 비어 있음 | "표시 전에 데이터 유무를 확인합니다." |
| `factory 실행` | 변화 없음 | `lt_person` 연결선 강조 | `lo_alv 생성됨` 배지 | "객체가 준비됐지만 아직 화면은 열리지 않았습니다." |
| `set_all 실행` | 변화 없음 | 변화 없음 | 툴바 예정 아이콘 표시 | "사용자 조작 기능을 켰습니다." |
| `display 실행` | 변화 없음 | 변화 없음 | ALV 표 표시 | "사용자가 보는 화면은 마지막 호출에서 열립니다." |
| `빈 결과 시나리오` | 조건에 맞는 행 0개 | `lv_count = 0` | 빈 표 또는 안내 메시지 | "데이터 없음과 ALV 실패를 구분합니다." |

학습자가 일부 단계를 건너뛰면 명확한 피드백을 준다.

- `factory` 전에 `display`를 누르면: "`lo_alv`가 아직 없습니다. 먼저 `factory`가 필요합니다."
- `SELECT` 없이 `factory`를 누르면: "표시할 Internal Table이 비어 있습니다. 빈 표가 나올 수 있습니다."
- `set_all` 없이 `display`를 누르면: "표는 뜨지만 표준 기능이 제한될 수 있습니다."

### 실수와 주의

첫 번째 실수는 `SELECT` 결과를 확인하지 않고 SALV 문제로 몰아가는 것이다. 표가 비어 있으면 먼저 DB 조회 결과를 확인해야 한다. CH08에서 배운 것처럼 `SELECT`는 `sy-subrc`와 `sy-dbcnt`를 설정한다. 코드에서는 입문자가 눈으로 보기 쉽게 `DESCRIBE TABLE`로 행 수를 확인한다.

두 번째 실수는 classic/modern Open SQL을 섞는 것이다. CH11은 classic-first 구간이다. 예제에는 host variable escape marker, inline declaration, comma-separated field list를 넣지 않는다.

세 번째 실수는 예외 처리 장을 앞당기는 것이다. `cx_salv_msg`는 "SALV 생성 실패를 잡기 위한 이름"으로만 사용한다. 예외 클래스의 계층, `RAISE EXCEPTION`, `CLEANUP`, 재시도 처리는 CH20 이후 범위다.

네 번째 실수는 빈 결과를 에러로 처리하는 것이다. 사용자가 조건을 너무 좁게 넣으면 빈 표도 정상 결과일 수 있다. 업무 화면에서는 "조회된 데이터가 없습니다"를 친절히 알려 주는 편이 좋다.

### 정리

- 첫 SALV 리포트는 `SELECT -> Internal Table -> factory -> set_all -> display` 흐름이다.
- 조회 결과가 비어 있는지 먼저 확인하면 문제 원인을 빨리 찾을 수 있다.
- `factory`는 객체 생성, `set_all`은 표준 기능 설정, `display`는 화면 표시다.
- CH11 예제는 classic Open SQL을 유지한다.
- 다음 레슨에서는 지금까지 배운 SALV 1차 범위와 뒤로 미룰 심화 범위를 명확히 나눈다.

---

## CH11-L05 - SALV 기초 정리 및 이후 심화과정 소개

### 왜 필요한가

입문자가 SALV를 처음 성공시키면 바로 더 많은 질문이 나온다.

- 컬럼 제목을 마음대로 바꿀 수 있나?
- 특정 컬럼을 숨길 수 있나?
- 매진 행을 빨간색으로 칠할 수 있나?
- 더블클릭하면 상세 화면으로 갈 수 있나?
- 셀을 직접 수정해서 저장할 수 있나?

이 질문들은 자연스럽지만, 전부 CH11에서 해결하려 하면 학습 순서가 무너진다. CH11-L05의 목적은 "지금 할 수 있는 것"과 "뒤에서 배울 것"을 구분해 학습자의 불안을 줄이는 것이다.

### 무엇인가

SALV 1차의 범위는 다음 3개다.

1. Internal Table을 `factory`로 SALV 객체에 연결한다.
2. `get_functions( )->set_all( abap_true )`로 기본 표준 기능을 켠다.
3. `display( )`로 읽기 전용 표를 보여 준다.

뒤로 미루는 것은 다음과 같다.

| 요구사항 | 지금 처리 여부 | 배울 위치 | 지금 설명 수준 |
| --- | --- | --- | --- |
| 컬럼 제목/너비를 세밀하게 바꾸기 | 미룸 | CH21 | "표시 제어 심화"라는 이름만 기억 |
| 특정 컬럼 숨김, 정렬 고정, 레이아웃 저장 | 미룸 | CH21 | 코드 없음 |
| 행/셀 색상 | 미룸 | CH21 | 코드 없음 |
| 더블클릭, Hotspot, 툴바 이벤트 | 미룸 | CH27 | 코드 없음 |
| 화면 안에 ALV 컨테이너 배치 | 미룸 | CH17 | 코드 없음 |
| 셀 편집과 저장 전 검증 | 미룸 | CH28 | 코드 없음 |

이 구분은 학습자를 제한하기 위한 것이 아니다. 오히려 지금 단계에서 성공 경험을 확실히 만들기 위한 장치다. CH11의 목표는 "내가 조회한 데이터가 업무용 표처럼 보인다"까지다.

### 어떻게 확인하는가

학습자는 요구사항 카드를 보고 어디에 둘지 분류한다.

| 카드 | 정답 | 해설 |
| --- | --- | --- |
| "예매 목록을 표로 보여 주고 정렬하고 싶다" | CH11 지금 처리 | SALV 1차 범위다. |
| "STATUS 컬럼 제목을 '상태'로 직접 바꾸고 싶다" | CH21 | 표시 제어 심화다. CH11에서는 Data Element 라벨 확인까지만 한다. |
| "매진 행을 빨간색으로 칠하고 싶다" | CH21 | 색상 제어는 심화다. |
| "ALV 행을 더블클릭하면 상세로 이동하고 싶다" | CH27 | 이벤트 응용이다. |
| "좌석 수를 셀에서 바로 수정하고 저장하고 싶다" | CH28 | Editable Grid ALV 범위다. |
| "화면 중앙 영역에 ALV를 박아 넣고 싶다" | CH17 | container 기반 Grid ALV 기초다. |

이 분류를 통해 학습자는 "내가 모르는 것이 많다"가 아니라 "지금은 여기까지가 정확한 범위다"라고 느끼게 된다.

### 체험 설계

L05는 코드가 없는 판단 레슨이므로 카드 분류형 체험이 적합하다.

체험 제목: "이 요구사항은 지금인가, 나중인가?"

화면은 왼쪽 카드 더미, 오른쪽 분류 영역으로 구성한다.

| 분류 영역 | 의미 |
| --- | --- |
| `CH11 지금 가능` | factory, set_all, display, 기본 정렬/필터/합계 |
| `CH17 Grid ALV` | 화면 컨테이너와 Grid ALV 기초 |
| `CH21 표시 심화` | 컬럼, 색, 레이아웃 같은 표시 세부 제어 |
| `CH27 이벤트` | 더블클릭, Hotspot, toolbar event |
| `CH28 편집` | 셀 편집, 저장 전 입력 검증 |

사용자가 카드를 놓으면 즉시 피드백을 준다.

- 정답이면: "맞습니다. 이 요구는 지금 배운 SALV 1차 범위입니다."
- 너무 앞선 영역을 `CH11 지금 가능`에 놓으면: "표시는 가능하지만 이 수준의 제어는 CH21/CH27/CH28에서 다룹니다. 지금은 이름만 예고합니다."
- SALV 기본 표시를 심화로 놓으면: "Internal Table을 읽기 전용 표로 보여 주는 것은 CH11의 핵심입니다."

### 실수와 주의

첫 번째 실수는 L06 실습에서 `get_columns( )` 같은 표시 제어를 지금 코드로 밀어 넣는 것이다. 원본 L06의 도전 과제는 흥미롭지만 R15 관점에서는 CH21로 넘기는 편이 안전하다. CH11에서는 Data Element 라벨이 자동으로 보이는지 확인하는 데서 멈춘다.

두 번째 실수는 SALV와 Grid ALV를 섞어 설명하는 것이다. CH11은 SALV 1차다. `CL_GUI_ALV_GRID`, container, field catalog, event handler는 CH17 이후에 둔다.

세 번째 실수는 "읽기 전용"이라는 경계를 흐리는 것이다. 사용자가 표에서 데이터를 바로 고치고 저장하려는 요구는 별도의 학습 단계가 필요하다. CH11에서 편집을 기대하게 만들면 뒤의 학습 흐름이 무너진다.

### 정리

- CH11의 SALV 1차 범위는 `factory`, `set_all`, `display` 중심의 읽기 전용 표 출력이다.
- 컬럼 세부 제어와 색상은 CH21, 화면 컨테이너형 Grid ALV는 CH17, 이벤트는 CH27, 편집은 CH28이다.
- 나중에 배울 내용을 지금 코드로 당겨오지 않는다.
- 이제 마지막 실습에서 콘서트 예매 목록을 SALV 표로 띄워 업무 화면처럼 확인한다.

---

## CH11-L06 - 실습: 예매 목록 SALV

### 왜 필요한가

지금까지 예제는 `lt_person` 같은 일반 데이터였다. 하지만 프로젝트의 관통 예제는 콘서트 예매 앱이다. CH09에서 예매 테이블과 관계를 만들고, CH10에서 잔여석 계산을 모듈화했다. 이제 예매 목록을 사람이 읽기 좋은 표로 보여 줄 차례다.

업무 담당자는 "예매 데이터가 DB에 있다"만으로 일을 할 수 없다. 목록을 보고, 특정 공연의 예매가 얼마나 많은지 정렬하고, 좌석 수 합계를 확인하고, 취소 상태를 구분해야 한다. CH11-L06은 SALV를 관통 예제에 연결해 "내가 만든 데이터가 화면이 된다"는 감각을 완성한다.

### 무엇인가

실습 프로그램의 흐름은 L04와 같지만 데이터가 `zbooking`으로 바뀐다.

> [선행 사용] `TYPE REF TO`, `TRY ... CATCH`, `->`는 L02와 동일한 선행 사용이다. CH11에서는 SALV 호출을 위해 필요한 최소 문장으로만 사용한다.

```abap
REPORT zch11_l06_booking_salv.

DATA: lt_book TYPE TABLE OF zbooking,
      lv_count TYPE i,
      lo_alv   TYPE REF TO cl_salv_table.

START-OF-SELECTION.
  SELECT * FROM zbooking INTO TABLE lt_book.

  DESCRIBE TABLE lt_book LINES lv_count.
  IF lv_count = 0.
    MESSAGE '예매 데이터가 없습니다' TYPE 'I'.
  ENDIF.

  TRY.
      cl_salv_table=>factory(
        IMPORTING r_salv_table = lo_alv
        CHANGING  t_table      = lt_book ).

      lo_alv->get_functions( )->set_all( abap_true ).
      lo_alv->display( ).
    CATCH cx_salv_msg.
      MESSAGE '예매 목록 ALV 생성 실패' TYPE 'I'.
  ENDTRY.
```

이 실습에서 확인할 컬럼은 최소한 다음과 같다.

| 컬럼 | 확인할 의미 |
| --- | --- |
| `BOOKING_ID` | 예매 한 건을 구분하는 번호 |
| `CONCERT_ID` | 어떤 공연의 예매인지 |
| `PERF_NO` | 공연 회차 |
| `CUSTOMER` | 예매자 |
| `SEATS` | 예매 좌석 수, 합계 확인 대상 |
| `STATUS` | 정상/취소 같은 상태 구분 |

컬럼 제목은 Data Element 라벨 영향을 받는다. CH03에서 Data Element의 field label을 성실히 넣었다면 SALV 표에서 사람이 읽기 쉬운 제목이 보인다. 라벨이 비어 있거나 부적절하면 표도 기술명 위주로 보일 수 있다.

### 어떻게 확인하는가

기존 시뮬레이터 `embeds/abap/CH11-L06-S01.html`을 사용한다.

확인 순서는 다음과 같다.

1. `정상 데이터 (6행)`을 선택한다.
2. `lt_book 데이터 보기`를 펼쳐 예매 원본을 확인한다.
3. `factory( )`를 누른다.
   - 예매 목록을 담을 SALV 객체가 준비된다.
   - 표는 아직 나타나지 않는다.
4. `display( )`를 누른다.
   - `LT_BOOK` ALV 표가 나타난다.
   - 예매번호, 공연, 회차, 고객, 좌석수, 상태 컬럼이 보인다.
5. `정렬`을 눌러 첫 컬럼 정렬 변화를 확인한다.
6. `Sigma 합계`를 눌러 좌석수 합계를 확인한다.
7. `빈 테이블 (0행)`을 선택해 데이터 없음 상태를 확인한다.

실습 후 질문은 다음처럼 둔다.

| 질문 | 기대 답 |
| --- | --- |
| `factory( )` 후 바로 표가 보였는가? | 아니다. `display( )`가 필요하다. |
| 좌석수 합계는 개발자가 직접 계산했는가? | 아니다. SALV 표준 기능으로 확인했다. |
| 컬럼 제목이 이상하면 어디를 먼저 의심하는가? | Data Element field label |
| 빈 테이블은 ALV 생성 실패인가? | 아니다. 조회 결과가 0행인 정상 상태일 수 있다. |

### 체험 설계

이 레슨은 기존 embed를 사용한다.

```text
::embed CH11-L06-S01 | 데이터를 SALV로 띄워 정렬·합계를 눌러 보기::
```

체험의 버튼과 피드백은 업무 시나리오에 맞춘다.

| 버튼 | 데이터/상태 | 피드백 |
| --- | --- | --- |
| `정상 데이터 (6행)` | 예매 6건, 좌석수 합계 17 | "업무 담당자가 볼 목록이 준비됐습니다." |
| `빈 테이블 (0행)` | 행 없음 | "표가 비어 있으면 조회 조건이나 원본 데이터를 확인합니다." |
| `factory( )` | `lo_alv` 준비, 표 숨김 | "예매 목록을 표시할 ALV 객체를 만들었습니다." |
| `display( )` | ALV 표 표시 | "이제 사용자가 정렬/합계를 누를 수 있습니다." |
| `정렬` | 첫 컬럼 기준 오름/내림 변경 | "데이터를 다시 SELECT하지 않고 화면에서 정렬합니다." |
| `Sigma 합계` | `SEATS` 합계 표시/숨김 | "좌석수 합계를 표준 기능으로 확인합니다." |
| `행 클릭` | readout에 현재 행 표시 | "사용자가 어느 예매를 보고 있는지 화면 피드백을 줍니다." |

원본 L06의 도전 과제였던 `get_columns( )`로 STATUS 컬럼 제목을 바꾸는 내용은 CH21로 이동하는 것이 좋다. CH11 실습에서는 다음 문장만 남긴다.

> 컬럼 제목을 직접 바꾸는 기능은 SALV 표시 심화(CH21)에서 배운다. 지금은 Data Element 라벨이 표 제목에 반영되는지 확인한다.

### 실수와 주의

첫 번째 실수는 `zbooking`에 데이터가 없는데 SALV가 안 된다고 판단하는 것이다. 먼저 `DESCRIBE TABLE lt_book LINES lv_count.`로 행 수를 확인한다.

두 번째 실수는 빈 `CATCH cx_salv_msg.`를 두고 넘어가는 것이다. 원본 실습은 짧게 보여 주기 위해 비워 두었지만, 강의자료에서는 최소한 안내 메시지를 넣어야 한다. 입문자는 실패했을 때 화면에서 아무 반응이 없는 상태를 가장 어려워한다.

세 번째 실수는 상태 컬럼 의미를 설명하지 않는 것이다. `STATUS = 'N'`, `STATUS = 'C'` 같은 값은 업무 규칙과 연결되어야 한다. 다만 상태값 도메인과 고정값 관리는 CH03/CH09의 DDIC 복습으로만 연결하고, 여기서 새 DDIC 설계를 늘리지 않는다.

네 번째 실수는 "엑셀 내보내기"를 보고 파일 처리나 프론트엔드 다운로드 구현으로 이야기를 확장하는 것이다. CH11에서는 SALV 표준 기능이 제공한다는 체감까지만 다룬다.

### 정리

- 콘서트 예매 목록도 `SELECT -> Internal Table -> SALV` 흐름으로 표가 된다.
- `factory`와 `display`의 분리는 마지막 실습에서도 그대로 중요하다.
- SALV 표준 기능으로 정렬과 좌석수 합계를 확인할 수 있다.
- 컬럼 제목 품질은 Data Element 라벨과 연결된다.
- 다음 CH12에서는 "전체 예매 목록은 보이는데, 특정 공연/상태만 보고 싶다"는 불편을 `SELECT-OPTIONS`로 해결한다.

---

## CH11 마무리 학습 흐름

CH11을 끝낸 학습자는 다음 문장을 스스로 말할 수 있어야 한다.

1. "SALV는 DB 조회 도구가 아니라 Internal Table을 사용자 친화적인 표로 보여 주는 도구다."
2. "`factory( )`는 ALV 객체 생성이고, `display( )`는 화면 표시다."
3. "`get_functions( )->set_all( abap_true )`는 표준 툴바 기능을 켠다."
4. "빈 표가 나오면 SALV 실패라고 단정하지 말고 SELECT 결과와 Internal Table 행 수를 확인한다."
5. "CH11 SALV 1차는 읽기 전용 기본 표시까지이고, 컬럼 세부 제어/색/이벤트/편집은 뒤에서 배운다."

다음 CH12로 넘어갈 때의 자연스러운 불편은 "예매 목록 전체를 볼 수는 있지만, 특정 공연만 또는 특정 상태만 보고 싶다"이다. 이 불편은 선택 조건과 Range Table을 다루는 CH12의 `SELECT-OPTIONS`로 연결한다.
