# CH06_REWRITE - Internal Table

> 기준 소스: `content/abap/CH06/_chapter.md`, `content/abap/CH06/CH06-L01.md` ~ `CH06-L06.md`
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 기존 `reference/codex_0625` 진단
> 공식 문서 확인: `C:\ABAP_DOCU_HTML`의 internal table, table type, table category, table key, APPEND, INSERT, READ TABLE, MODIFY, DELETE, LOOP AT, COLLECT, SORT, DESCRIBE TABLE, DELETE ADJACENT DUPLICATES, FIELD-SYMBOLS, CLEAR/REFRESH/FREE, deep structure 항목을 수동 확인

## 챕터 설계

CH05에서 학습자는 구구단 한 줄을 `ls_line`이라는 Structure로 묶었다. 하지만 Structure 하나는 한 행만 담는다. 반복문이 다음 회차로 넘어가면 같은 `ls_line`의 값이 덮어써진다. 화면에는 `WRITE` 결과가 여러 줄 남아도, 프로그램 메모리에는 구구단 81줄이 표처럼 쌓여 있지 않다.

CH06의 목표는 이 한계를 해결하는 것이다. 같은 모양의 행을 여러 개 메모리에 담는 Internal Table(내부 테이블)을 배운다.

이 장에서 학습자는 다음 흐름을 익힌다.

1. Work Area 한 건을 Internal Table에 `APPEND`로 쌓는다.
2. Internal Table의 세 속성인 line type, primary key, table kind를 구분한다.
3. 한 행을 `READ TABLE`, `MODIFY`, `DELETE`로 다룬다.
4. 여러 행을 `LOOP`, `SORT`, `COLLECT`, `DELETE ADJACENT DUPLICATES` 등으로 다룬다.
5. Deep Structure는 개념만 잡고, 구구단 81행을 Internal Table에 담아 CH07의 영속 저장 필요성으로 연결한다.

CH06의 가장 중요한 경계는 Internal Table과 Database Table의 차이다. Internal Table은 프로그램 실행 중 메모리에만 존재한다. 프로그램이 끝나면 사라진다. DB에 영구 저장하는 Transparent Table은 CH07에서 다룬다.

R15 게이팅도 유지한다. CH06은 classic-first 구간이다. table expression, inline `DATA( )`, constructor expression, modern Open SQL은 사용하지 않는다. `READ TABLE`, `LOOP AT`, `APPEND`, `MODIFY`, `DELETE` 같은 classic internal table 문장으로 설명한다.

## CH06-L01 - Internal Table 기초

### 왜 필요한가

CH05의 Structure는 한 건을 담는다.

```abap
DATA: BEGIN OF ls_line,
        dan    TYPE i,
        mul    TYPE i,
        result TYPE i,
      END OF ls_line.
```

이 구조체 하나로는 구구단 한 줄만 표현할 수 있다. 하지만 실제 업무에서는 한 건보다 여러 건을 다룬다.

| 업무 상황 | 한 건 | 여러 건 |
|---|---|---|
| 사원 | 사원 한 명 | 사원 명단 |
| 주문 | 주문 한 건 | 주문 목록 |
| 구구단 | `2 x 1 = 2` 한 줄 | 2단부터 9단까지 81줄 |

여러 건을 다루려면 같은 모양의 행을 여러 개 쌓는 그릇이 필요하다. 이것이 Internal Table이다.

### 무엇인가

Internal Table은 같은 line type(행 모양)을 가진 여러 행을 메모리에 담는 ABAP data object다. 공식 문서 기준으로 internal table은 line type, table category, table key 같은 기술 속성으로 정의된다.

입문자는 먼저 다음 그림으로 이해하면 된다.

```text
Work Area = 한 행을 담는 그릇
Internal Table = 같은 모양의 행을 여러 개 담는 메모리 표
```

코드는 보통 Work Area와 Internal Table을 짝으로 둔다.

```abap
TYPES: BEGIN OF ty_person,
         name TYPE c LENGTH 20,
         age  TYPE i,
       END OF ty_person.

DATA: ls_person TYPE ty_person,
      lt_person TYPE TABLE OF ty_person.
```

`ls_person`은 한 건이고, `lt_person`은 여러 건이다. 접두어도 관례적으로 구분한다.

| 접두어 | 의미 | 예 |
|---|---|---|
| `ls_` | local structure, 한 행 | `ls_person` |
| `lt_` | local table, 여러 행 | `lt_person` |

행을 추가할 때는 Work Area에 값을 채운 뒤 `APPEND`한다.

```abap
ls_person-name = '정훈영'.
ls_person-age  = 30.
APPEND ls_person TO lt_person.

CLEAR ls_person.
ls_person-name = '홍길동'.
ls_person-age  = 25.
APPEND ls_person TO lt_person.
```

`APPEND`는 internal table의 끝에 새 행을 붙인다. 공식 문서 기준으로 `APPEND`는 internal index table에 새 마지막 행을 만든다. 위 코드 뒤 `lt_person`에는 두 행이 있다.

행 수는 `DESCRIBE TABLE`로 확인할 수 있다.

```abap
DATA lv_count TYPE i.

DESCRIBE TABLE lt_person LINES lv_count.
WRITE: / '행 수:', lv_count.
```

Internal Table을 비우는 문장도 구분한다.

```abap
CLEAR lt_person.
REFRESH lt_person.
FREE lt_person.
```

| 문장 | 의미 | 입문자 해석 |
|---|---|---|
| `CLEAR lt_person` | 행을 비움. 보통 이 방식 사용 | 다시 채울 가능성이 있는 테이블 비우기 |
| `REFRESH lt_person` | internal table 행을 비움 | 옛 코드에서 많이 보이며, header line 때문에 혼동 가능 |
| `FREE lt_person` | 행을 비우고 메모리까지 반환 | 큰 테이블을 다 쓰고 더 쓰지 않을 때 |

Header Line도 알아봐야 한다. 오래된 ABAP에서는 internal table 자체에 같은 이름의 work area가 딸린 방식이 있었다. 지금 교육에서는 사용하지 않는다. 다만 레거시 코드를 읽을 때 보일 수 있으므로 "옛 단축 방식"으로만 인식한다.

Header line이 없는 지금 방식에서는 table과 work area를 명확히 나눈다.

```abap
DATA: ls_person TYPE ty_person,
      lt_person TYPE TABLE OF ty_person.
```

### 어떻게 확인하는가

다음 프로그램을 실행한다.

```abap
REPORT z_ch06_l01_itab_basic.

TYPES: BEGIN OF ty_person,
         name TYPE c LENGTH 20,
         age  TYPE i,
       END OF ty_person.

DATA: ls_person TYPE ty_person,
      lt_person TYPE TABLE OF ty_person,
      lv_count  TYPE i.

ls_person-name = '정훈영'.
ls_person-age  = 30.
APPEND ls_person TO lt_person.

CLEAR ls_person.
ls_person-name = '홍길동'.
ls_person-age  = 25.
APPEND ls_person TO lt_person.

DESCRIBE TABLE lt_person LINES lv_count.
WRITE: / '행 수:', lv_count.
```

디버거에서는 `lt_person`을 펼쳐 행이 1개에서 2개로 늘어나는 것을 본다. `APPEND` 직후마다 table body가 커진다.

확인 포인트는 다음이다.

| 확인할 것 | 관찰 |
|---|---|
| `ls_person` | 한 번에 한 사람만 담는다 |
| `APPEND` 후 `lt_person` | 행이 하나 늘어난다 |
| `CLEAR ls_person` | 다음 행을 담기 전에 work area를 비운다 |
| `DESCRIBE TABLE` | 행 수가 2로 나온다 |

### 실수와 주의

첫 번째 실수는 Internal Table을 Database Table로 착각하는 것이다. `lt_person`은 메모리에만 있다. 프로그램이 끝나면 사라진다. CH07의 Transparent Table과 다르다.

두 번째 실수는 `APPEND` 전에 Work Area를 비우지 않아 이전 값이 섞이는 것이다.

```abap
ls_person-name = '정훈영'.
ls_person-age  = 30.
APPEND ls_person TO lt_person.

" CLEAR 없이 age를 안 바꾸면 30이 남을 수 있다
ls_person-name = '홍길동'.
APPEND ls_person TO lt_person.
```

새 행을 채우기 전에 `CLEAR ls_person.`을 넣는 습관이 안전하다.

세 번째 실수는 `REFRESH`를 새 코드에서 기본으로 쓰는 것이다. 공식 문서도 header line 없는 internal table에서는 `CLEAR`와 같은 효과라고 설명하고, header line 방식은 obsolete로 본다. 새 코드에서는 `CLEAR lt_person.` 또는 메모리 반환이 필요할 때 `FREE lt_person.`을 쓴다.

### 체험 설계

L01에는 신규 "Internal Table 성장 그리드"가 적합하다.

| 요소 | 설계 |
|---|---|
| 버튼 | `첫 행 채우기`, `APPEND`, `Work Area CLEAR`, `둘째 행 APPEND`, `테이블 CLEAR`, `FREE` |
| 상태 | work area 입력 전, work area 채움, table 1행, table 2행, table 비움, 메모리 반환 |
| 데이터 | `ls_person`, `lt_person`, `lv_count` |
| 피드백 | "APPEND는 ls_person을 복사해 lt_person 끝에 새 행을 만든다" |
| 시각화 | 왼쪽 work area 카드, 오른쪽 internal table 행 목록 |

초보자에게 중요한 것은 "work area를 table 안에 넣는 것이 아니라, 현재 work area 값을 행으로 복사해 쌓는다"는 점이다. 따라서 APPEND 후 work area를 바꿔도 이미 쌓인 행이 독립적으로 남는 모습을 보여 주면 좋다.

### 정리

Internal Table은 같은 모양의 여러 행을 프로그램 메모리에 담는 표다. Work Area 한 건을 채우고 `APPEND`로 테이블에 쌓는다. `CLEAR`, `REFRESH`, `FREE`는 모두 비우기와 관련 있지만 새 코드에서는 `CLEAR`와 `FREE`를 중심으로 생각한다. Internal Table은 DB 테이블이 아니며 실행이 끝나면 사라진다.

## CH06-L02 - 내부 테이블의 3속성, 테이블 종류

### 왜 필요한가

`DATA lt_person TYPE TABLE OF ty_person.`만 보면 internal table이 단순해 보인다. 하지만 테이블이 많아지고 조회가 잦아지면 "어떤 모양의 행을 담는가", "무엇으로 찾는가", "어떤 방식으로 저장되는가"가 중요해진다.

예를 들어 이름으로 자주 찾는 명단, 입력 순서가 중요한 목록, 중복 없이 코드로 바로 찾는 표는 설계가 다를 수 있다. 이 차이를 이해하기 위해 Internal Table의 세 속성을 배운다.

### 무엇인가

Internal Table은 세 가지 속성으로 정의된다.

| 속성 | 의미 | 질문 |
|---|---|---|
| Line Type | 한 행의 모양 | 한 행이 숫자 하나인가, 구조체인가 |
| Primary Key | 행을 식별하는 기준 | 어떤 필드로 찾거나 중복을 판단하는가 |
| Table Kind | 저장/탐색 방식 | STANDARD, SORTED, HASHED 중 무엇인가 |

#### Line Type

Line Type은 한 행의 타입이다. 꼭 Structure일 필요는 없다.

```abap
DATA lt_num TYPE TABLE OF i.
```

이 테이블은 행 하나가 정수 하나다.

구조체 행도 가능하다.

```abap
TYPES: BEGIN OF ty_person,
         name TYPE c LENGTH 20,
         age  TYPE i,
       END OF ty_person.

DATA lt_person TYPE TABLE OF ty_person.
```

DDIC Data Element, DDIC Structure, Transparent Table의 행 모양, View의 행 모양도 line type으로 사용할 수 있다. CH05에서 배운 DDIC Structure와 같은 원리다.

#### Primary Key

Primary Key는 행을 식별하거나 탐색할 때 기준이 되는 key다. 공식 문서 기준으로 internal table은 항상 primary key를 가진다. standard table에서 명시하지 않으면 standard key가 만들어진다.

입문 단계에서는 key를 이렇게 이해한다.

```text
key = "이 행을 무엇으로 찾을 것인가"
```

예를 들어 사번이 유일하다면 사번이 key 후보가 된다. 구구단에서는 `dan`, `mul` 조합이 한 줄을 식별할 수 있다.

#### Table Kind

Table Kind는 internal table이 내부적으로 행을 관리하는 방식이다.

| 종류 | 특징 | 인덱스 접근 | 적합한 상황 |
|---|---|---|---|
| STANDARD TABLE | 입력 순서 중심, 기본 선택 | 가능 | 대부분의 입문/일반 처리 |
| SORTED TABLE | key 순서가 유지됨 | 가능 | 정렬된 상태와 key 범위 탐색이 중요 |
| HASHED TABLE | hash key로 단건 탐색 | 불가능 | 유일 key로 빠르게 한 건을 찾을 때 |

처음에는 STANDARD TABLE로 충분하다.

```abap
TYPES ty_person_tab TYPE STANDARD TABLE OF ty_person.

DATA lt_person TYPE ty_person_tab.
```

SORTED와 HASHED는 성능 문제가 실제로 드러나거나 key 설계가 분명할 때 선택한다. 초보자가 처음부터 HASHED를 쓰면 인덱스로 읽을 수 없는 이유, 중복 key 제한, 정렬 출력 방식에서 혼란이 생긴다.

SE11에서는 전역 Table Type도 만들 수 있다.

```text
SE11 -> Data Type -> Table Type -> ZTT_PERSON
Line Type: ZST_PERSON
```

프로그램에서는 다음처럼 쓴다.

```abap
DATA lt_person TYPE ztt_person.
```

### 어떻게 확인하는가

다음 세 가지 선언을 비교한다.

```abap
DATA lt_num TYPE TABLE OF i.
DATA lt_person TYPE TABLE OF ty_person.

TYPES ty_person_tab TYPE STANDARD TABLE OF ty_person.
DATA lt_person2 TYPE ty_person_tab.
```

확인 포인트는 다음이다.

| 선언 | 확인 |
|---|---|
| `lt_num` | 행 하나가 정수 하나 |
| `lt_person` | 행 하나가 구조체 |
| `ty_person_tab` | table type을 먼저 정의하고 변수 생성 |

테이블 종류 비교 체험은 다음 입력으로 한다.

| 시나리오 | 선택 |
|---|---|
| 입력한 순서대로 출력하고 가끔 LOOP | STANDARD |
| 항상 이름순으로 유지하고 범위 출력 | SORTED |
| 사번으로 한 명만 매우 자주 찾음 | HASHED |

### 실수와 주의

첫 번째 실수는 행 타입과 테이블 타입을 섞는 것이다.

```abap
DATA ls_person TYPE ty_person.          " 한 행
DATA lt_person TYPE TABLE OF ty_person. " 여러 행
```

`ty_person`은 한 행의 모양이고, `TYPE TABLE OF ty_person`은 여러 행의 모양이다.

두 번째 실수는 HASHED TABLE에 index 접근을 하려는 것이다. HASHED는 인덱스 테이블이 아니다. `READ TABLE ... INDEX 1` 같은 방식은 STANDARD/SORTED 계열에서 생각한다.

세 번째 실수는 key를 "DB primary key"와 같은 것으로 오해하는 것이다. Internal Table의 key는 메모리 안에서 행을 찾고 관리하는 기준이다. DB 제약조건과는 다르다.

네 번째 실수는 table kind를 성능 유행어처럼 고르는 것이다. table kind는 "어떻게 접근할 것인가"로 정한다. 측정 없이 무조건 HASHED를 고르는 것은 좋은 설계가 아니다.

### 체험 설계

L02에는 "Table Kind 선택 보드"가 적합하다.

| 요소 | 설계 |
|---|---|
| 입력 | 행 수, 자주 하는 작업, 중복 허용 여부, 정렬 필요 여부 |
| 버튼 | `STANDARD 추천`, `SORTED 추천`, `HASHED 추천`, `접근 방식 비교` |
| 상태 | 선택 전, 추천 결과, index 접근 가능/불가능 표시, key 필요 경고 |
| 데이터 | line type 카드, key 카드, table kind 카드 |
| 피드백 | "HASHED는 빠른 단건 key 접근에는 강하지만 index 접근은 할 수 없음" |

초보자는 table kind를 문법으로만 외우기 쉽다. 그래서 "이 테이블로 무엇을 자주 할 것인가"를 먼저 묻는 UI가 좋다.

### 정리

Internal Table은 line type, primary key, table kind로 정의된다. 행 모양을 먼저 정하고, 어떤 기준으로 찾을지 key를 생각하고, 접근 패턴에 맞게 STANDARD/SORTED/HASHED를 선택한다. 입문 단계에서는 STANDARD TABLE을 기본으로 사용하고, SORTED/HASHED는 필요가 분명할 때 선택한다.

## CH06-L03 - 단일 행 제어

### 왜 필요한가

Internal Table에 행을 쌓았다면 특정 한 행을 다뤄야 한다. 예를 들어 정훈영이라는 사람을 찾고, 나이를 바꾸고, 조건에 맞지 않는 행을 지워야 한다. 매번 전체를 `LOOP`로 돌며 찾을 수도 있지만, 한 행을 직접 읽고 수정하는 문장을 알아야 코드가 명확해진다.

이 레슨의 핵심은 네 가지다.

| 작업 | 문장 |
|---|---|
| 끼워 넣기 | `INSERT` |
| 찾기 | `READ TABLE` |
| 고치기 | `MODIFY` |
| 지우기 | `DELETE` |

그리고 대부분의 결과는 `sy-subrc`로 즉시 확인한다.

### 무엇인가

`APPEND`는 끝에 추가한다.

```abap
APPEND ls_person TO lt_person.
```

`INSERT ... INDEX`는 지정 위치에 끼워 넣는다.

```abap
INSERT ls_person INTO lt_person INDEX 1.
```

`INSERT ... INTO TABLE`은 table key 기준으로 넣는다. SORTED/HASHED TABLE에서는 이 형태가 중요하다.

```abap
INSERT ls_person INTO TABLE lt_person.
```

`READ TABLE`은 internal table에서 한 행을 읽는다. 공식 문서 기준으로 key, free condition, index로 행을 지정할 수 있다.

번호로 읽기:

```abap
READ TABLE lt_person INTO ls_person INDEX 1.
IF sy-subrc = 0.
  WRITE: / ls_person-name.
ENDIF.
```

값으로 읽기:

```abap
READ TABLE lt_person INTO ls_person WITH KEY name = '정훈영'.
IF sy-subrc = 0.
  WRITE: / '찾음:', ls_person-age.
ELSE.
  WRITE: / '없음'.
ENDIF.
```

정의된 table key로 읽기:

```abap
READ TABLE lt_person INTO ls_person
     WITH TABLE KEY name = '정훈영'.
```

`WITH KEY`는 free key에 가깝게 아무 필드 조합으로 찾는 느낌이고, `WITH TABLE KEY`는 정의된 table key를 사용한다. SORTED/HASHED TABLE에서 key 설계가 중요해지는 이유다.

값을 복사할 필요 없이 존재만 확인할 때는 `TRANSPORTING NO FIELDS`를 쓴다.

```abap
READ TABLE lt_person TRANSPORTING NO FIELDS
     WITH KEY name = '정훈영'.

IF sy-subrc = 0.
  WRITE: / '존재합니다.'.
ENDIF.
```

STANDARD TABLE에서 key로 자주 찾을 때 `BINARY SEARCH`를 쓸 수 있다. 단, 반드시 같은 key로 먼저 정렬해야 한다.

```abap
SORT lt_person BY name.

READ TABLE lt_person INTO ls_person
     WITH KEY name = '정훈영'
     BINARY SEARCH.
```

정렬하지 않고 `BINARY SEARCH`를 붙이면 있는 행도 못 찾는 버그가 생긴다.

수정은 `MODIFY`로 한다.

```abap
ls_person-age = 31.
MODIFY lt_person FROM ls_person INDEX 1.
```

특정 필드만 수정하려면 `TRANSPORTING`을 사용한다.

```abap
ls_person-age = 31.
MODIFY lt_person FROM ls_person INDEX 1
       TRANSPORTING age.
```

삭제는 `DELETE`다.

```abap
DELETE lt_person WHERE age < 20.
```

공식 문서 기준으로 `DELETE`는 삭제된 행이 있으면 `sy-subrc = 0`, 없으면 `sy-subrc = 4`를 세팅할 수 있다.

### 어떻게 확인하는가

다음 흐름으로 확인한다.

```abap
REPORT z_ch06_l03_single_line.

TYPES: BEGIN OF ty_person,
         name TYPE c LENGTH 20,
         age  TYPE i,
       END OF ty_person.

DATA: ls_person TYPE ty_person,
      lt_person TYPE TABLE OF ty_person.

ls_person-name = '정훈영'.
ls_person-age  = 30.
APPEND ls_person TO lt_person.

CLEAR ls_person.
ls_person-name = '홍길동'.
ls_person-age  = 25.
APPEND ls_person TO lt_person.

READ TABLE lt_person INTO ls_person WITH KEY name = '정훈영'.
IF sy-subrc = 0.
  ls_person-age = 31.
  MODIFY lt_person FROM ls_person INDEX sy-tabix
         TRANSPORTING age.
ENDIF.

DELETE lt_person WHERE age < 26.
```

디버거에서 확인할 값은 다음이다.

| 시점 | 확인 |
|---|---|
| `READ TABLE` 직후 | `sy-subrc`, `sy-tabix`, `ls_person` |
| `MODIFY` 직후 | table의 정훈영 행 age가 31인지 |
| `DELETE` 직후 | 홍길동 행이 삭제됐는지, `sy-subrc`가 0인지 |

### 실수와 주의

첫 번째 실수는 `READ TABLE` 실패 후 Work Area의 오래된 값을 쓰는 것이다.

```abap
READ TABLE lt_person INTO ls_person WITH KEY name = '없는사람'.
WRITE: / ls_person-name.   " 위험: 이전 값일 수 있음
```

항상 바로 `sy-subrc`를 확인한다.

두 번째 실수는 `BINARY SEARCH` 전에 `SORT`를 안 하는 것이다. `BINARY SEARCH`는 빠르지만 정렬이 전제다.

세 번째 실수는 `INSERT ... INTO`와 `INSERT ... INTO TABLE`을 같은 것으로 보는 것이다. `INDEX`와 함께 쓰는 위치 기반 삽입인지, table key 기반 삽입인지 구분해야 한다.

네 번째 실수는 `sy-tabix`를 오래 보관해 두고 나중에 믿는 것이다. table을 정렬하거나 삭제하면 index 의미가 바뀔 수 있다. `READ TABLE` 직후 필요한 위치에서 바로 사용한다.

### 체험 설계

L03에는 "한 행 제어 실험실"이 적합하다.

| 요소 | 설계 |
|---|---|
| 버튼 | `APPEND`, `INSERT INDEX 1`, `READ WITH KEY`, `READ INDEX`, `MODIFY`, `DELETE`, `BINARY SEARCH` |
| 상태 | 테이블 초기, 행 추가, 읽기 성공, 읽기 실패, 수정 성공, 삭제 성공 |
| 데이터 | `lt_person`, `ls_person`, `sy-subrc`, `sy-tabix` |
| 피드백 | READ 실패 시 "Work Area를 믿지 말고 sy-subrc를 확인" |
| 오류 실험 | 정렬 없이 BINARY SEARCH 실행 후 경고 표시 |

테이블 행을 화면에 번호와 함께 보여 주고, `READ TABLE ... INDEX 2`를 누르면 2번 행이 강조되게 한다. `WITH KEY name = ...`을 누르면 조건에 맞는 행이 강조되고 `sy-subrc`와 `sy-tabix`가 같이 바뀐다.

### 정리

단일 행 제어는 internal table의 한 행을 넣고, 읽고, 고치고, 지우는 기술이다. `READ TABLE` 뒤에는 반드시 `sy-subrc`를 확인한다. `BINARY SEARCH`는 정렬이 선행되어야 한다. `INDEX` 접근과 table key 접근을 구분해야 한다.

## CH06-L04 - 다중 행 제어

### 왜 필요한가

업무 데이터는 한 행만 찾고 끝나지 않는다. 여러 행을 순서대로 출력하고, 조건에 맞는 행만 훑고, 중복을 지우고, 그룹별 소계를 내야 한다. CH06-L04는 internal table을 "표 전체"로 다루는 도구를 배운다.

다만 한꺼번에 많은 문장이 나오므로, 목적별로 나누어 잡는다.

| 목적 | 문장 |
|---|---|
| 여러 행 순회 | `LOOP AT` |
| 직접 행 수정 | `LOOP ... ASSIGNING` |
| 정렬 | `SORT` |
| 합산 삽입 | `COLLECT` |
| 중복 제거 | `DELETE ADJACENT DUPLICATES` |
| 행 수 확인 | `DESCRIBE TABLE` |
| 그룹 경계 처리 | `AT FIRST`, `AT NEW`, `AT END OF`, `SUM` |

### 무엇인가

가장 기본은 `LOOP AT`이다.

```abap
LOOP AT lt_person INTO ls_person.
  WRITE: / sy-tabix, ls_person-name.
ENDLOOP.
```

`sy-tabix`는 현재 처리 중인 internal table의 index다. 단, `WHERE`를 쓰면 "반복 순서"와 "원래 table 위치"가 다를 수 있다.

조건으로 일부만 순회할 수 있다.

```abap
LOOP AT lt_person INTO ls_person WHERE age >= 20.
  WRITE: / sy-tabix, ls_person-name.
ENDLOOP.
```

행 번호 범위로도 순회할 수 있다.

```abap
LOOP AT lt_person FROM 2 TO 5 INTO ls_person.
  WRITE: / sy-tabix, ls_person-name.
ENDLOOP.
```

공식 문서의 `LOOP AT itab, cond`는 `FROM`, `TO`, `WHERE` 같은 선택 조건을 설명한다. CH06에서는 이 중 기본 범위와 조건을 다룬다.

`INTO ls_person`은 행을 Work Area로 복사한다. 복사본을 바꾼 뒤 table에 반영하려면 `MODIFY`가 필요하다. 반면 `ASSIGNING`은 행을 직접 가리킨다.

```abap
FIELD-SYMBOLS <fs_person> TYPE ty_person.

LOOP AT lt_person ASSIGNING <fs_person>.
  <fs_person>-age = <fs_person>-age + 1.
ENDLOOP.
```

Field Symbol은 `<fs_person>`처럼 angle bracket을 사용한다. 여기서는 "행을 직접 가리키는 이름표" 정도로 이해한다. 동적 할당과 고급 활용은 후속 심화로 남긴다.

정렬은 `SORT`다.

```abap
SORT lt_person BY name.
```

중복 제거는 정렬과 함께 생각한다.

```abap
SORT lt_person BY name.
DELETE ADJACENT DUPLICATES FROM lt_person COMPARING name.
```

`ADJACENT`는 인접한 중복이라는 뜻이다. 떨어져 있는 중복은 지워지지 않으므로 먼저 같은 값끼리 붙도록 정렬한다.

`COLLECT`는 같은 key의 행이 있으면 숫자 component를 합산하고, 없으면 새 행을 넣는다.

```abap
COLLECT ls_sales INTO lt_sales.
```

입문자는 `COLLECT`를 "키가 같은 행은 숫자를 누적하는 특수 APPEND"로 이해하면 된다. 다만 key와 숫자 필드 구성에 영향을 받으므로 무작정 쓰면 안 된다.

컨트롤레벨은 정렬된 table에서 그룹의 시작과 끝을 처리한다.

```abap
SORT lt_sales BY region.

LOOP AT lt_sales INTO ls_sales.
  AT NEW region.
    WRITE: / '지역:', ls_sales-region.
  ENDAT.

  WRITE: / ls_sales-amount.

  AT END OF region.
    SUM.
    WRITE: / '소계:', ls_sales-amount.
  ENDAT.
ENDLOOP.
```

컨트롤레벨은 정렬이 전제다. `AT NEW region`은 region 값이 새로 시작되는 지점, `AT END OF region`은 그 region 그룹의 마지막 지점이다. `SUM`은 해당 control level의 숫자 component 합계를 만든다.

행 수는 `DESCRIBE TABLE`로 확인한다.

```abap
DATA lv_count TYPE i.

DESCRIBE TABLE lt_person LINES lv_count.
WRITE: / lv_count.
```

두 internal table의 행을 이어 붙일 수도 있다.

```abap
APPEND LINES OF lt_a TO lt_b.
```

### 어떻게 확인하는가

다음 순서로 실험한다.

1. `lt_person`에 5행을 넣는다.
2. `LOOP AT`으로 전체 출력한다.
3. `LOOP AT ... WHERE age >= 20`으로 일부만 출력한다.
4. `LOOP AT ... FROM 2 TO 4`로 범위만 출력한다.
5. `SORT BY name` 후 중복 제거를 실행한다.
6. `DESCRIBE TABLE`로 행 수 변화를 본다.

`sy-tabix` 확인은 중요하다.

| 상황 | `sy-tabix` 해석 |
|---|---|
| 전체 LOOP | 현재 행 번호와 반복 순서가 대체로 일치 |
| WHERE LOOP | 조건에 맞은 첫 행이 원래 3번이면 첫 반복에서도 `sy-tabix = 3` |
| FROM 2 TO 5 | 첫 반복에서 `sy-tabix = 2` |
| HASHED TABLE | index 개념과 다르게 접근해야 함 |

### 실수와 주의

첫 번째 실수는 `WHERE`를 쓴 LOOP에서 `sy-tabix`를 "몇 번째 반복"으로 오해하는 것이다. `sy-tabix`는 table index다.

두 번째 실수는 `DELETE ADJACENT DUPLICATES` 전에 정렬하지 않는 것이다. 이 문장은 인접한 중복만 제거한다.

세 번째 실수는 control level 전에 정렬하지 않는 것이다. `AT NEW`, `AT END OF`는 정렬된 그룹 경계가 맞아야 의미가 있다.

네 번째 실수는 Field Symbol이 직접 수정이라는 사실을 잊는 것이다. `ASSIGNING <fs_person>` 안에서 값을 바꾸면 table 행 자체가 바뀐다. 실수로 원본을 바꿀 수 있으므로 의도가 분명할 때 사용한다.

다섯 번째 실수는 `COLLECT`를 단순 append로 착각하는 것이다. `COLLECT`는 같은 key가 있으면 숫자를 합산한다. 그냥 뒤에 붙이고 싶으면 `APPEND`다.

### 체험 설계

L04에는 "다중 행 조작 보드"가 필요하다.

| 요소 | 설계 |
|---|---|
| 버튼 | `전체 LOOP`, `WHERE LOOP`, `FROM/TO LOOP`, `SORT`, `중복 제거`, `COLLECT`, `DESCRIBE` |
| 상태 | 원본 테이블, 필터 순회, 정렬 후, 중복 제거 후, 집계 후 |
| 데이터 | `lt_person`, `lt_sales`, `ls_person`, `sy-tabix`, `lv_count` |
| 피드백 | `WHERE` 첫 반복에서 `sy-tabix`가 1이 아닐 수 있음을 표시 |
| 시각화 | table 행 번호와 반복 순서를 서로 다른 색으로 표시 |

특히 `sy-tabix` 체험은 "반복 순서 번호"와 "원래 행 번호"를 분리해서 보여 줘야 한다. 예를 들어 3번 행과 5번 행만 `WHERE`에 걸리면, 화면 왼쪽에는 반복 1회차/2회차를, 오른쪽에는 실제 index 3/5를 표시한다.

### 정리

다중 행 제어는 internal table을 표 전체로 다루는 기술이다. `LOOP AT`으로 돌고, `WHERE`와 `FROM/TO`로 범위를 좁히고, `SORT`와 `DELETE ADJACENT DUPLICATES`로 정리하고, `COLLECT`와 control level로 집계한다. `sy-tabix`는 실제 table index라는 점을 항상 주의한다.

## CH06-L05 - Deep Structure 개념

### 왜 필요한가

지금까지의 Structure는 대부분 flat했다. 한 행 안의 component들이 숫자, 문자, 날짜처럼 단순 값이었다.

하지만 실제 업무에서는 한 건 안에 또 여러 건이 들어가는 경우가 있다.

```text
주문 한 건
  주문번호
  고객
  주문 항목 여러 줄
```

주문 헤더 한 건 안에 주문 항목 internal table이 들어가야 하는 구조다. 이런 개념이 Deep Structure다.

### 무엇인가

Flat Structure는 component들이 고정 길이 기본값 중심으로 이루어진 구조다.

```abap
TYPES: BEGIN OF ty_line,
         dan    TYPE i,
         mul    TYPE i,
         result TYPE i,
       END OF ty_line.
```

Deep Structure는 component 중에 string, internal table, reference처럼 deep component가 들어간 구조다. 공식 glossary 기준 deep structure는 적어도 하나의 deep structure component를 포함하는 구조다.

예를 들어 주문 한 건 안에 item table을 둘 수 있다.

```abap
TYPES: BEGIN OF ty_item,
         matnr TYPE c LENGTH 18,
         qty   TYPE i,
       END OF ty_item.

TYPES ty_item_tab TYPE TABLE OF ty_item.

TYPES: BEGIN OF ty_order,
         order_id TYPE c LENGTH 10,
         customer TYPE c LENGTH 20,
         items    TYPE ty_item_tab,
       END OF ty_order.
```

`ty_order`는 `items` component가 internal table이므로 deep structure다.

### 어떻게 확인하는가

CH06에서는 Deep Structure를 깊게 구현하지 않는다. 개념 확인만 한다.

| 구조 | 판정 |
|---|---|
| `dan`, `mul`, `result`가 모두 `i` | Flat |
| `name TYPE string` 포함 | Deep 가능성 있음 |
| `items TYPE ty_item_tab` 포함 | Deep |
| DB Transparent Table의 한 행 | 기본 입문 범위에서는 flat하게 설계 |

디버거 관찰 관점에서는 deep component가 펼쳐질 때 하위 테이블이나 가변 데이터가 별도로 보일 수 있다는 점만 기억한다.

### 실수와 주의

첫 번째 실수는 Deep Structure를 CH06에서 과하게 구현하려는 것이다. 지금 목표는 Internal Table 기본 처리다. Deep Structure의 표시, 복사, DB 저장 제약은 후속 장에서 다시 나온다.

두 번째 실수는 Transparent Table의 필드로 internal table을 넣을 수 있다고 생각하는 것이다. DB 테이블 한 행은 입문 설계에서 flat한 DB 필드들로 구성해야 한다. Internal Table을 그대로 DB 컬럼에 넣는 방식으로 생각하면 CH07에서 혼란이 생긴다.

세 번째 실수는 Deep Structure와 nested structure를 완전히 같은 것으로 보는 것이다. 중첩 구조는 구조 안에 구조가 있는 형태이고, Deep Structure는 그 안에 internal table, string, reference 같은 deep component가 포함되는 경우를 말한다.

### 체험 설계

L05에는 "Flat vs Deep 구조 카드"가 적합하다.

| 요소 | 설계 |
|---|---|
| 버튼 | `Flat 보기`, `String 포함`, `Internal Table 포함`, `DB 저장 가능성 보기` |
| 상태 | flat, deep-string, deep-itab, DB 설계 경고 |
| 데이터 | `ty_line`, `ty_order`, `ty_item_tab` |
| 피드백 | "행 안에 또 행 목록이 들어가면 deep 구조가 됨" |
| 시각화 | flat은 한 장 카드, deep은 카드 안에 접힌 table 카드 표시 |

이 체험의 핵심은 구현보다 분류다. 학생이 어떤 구조를 보고 flat인지 deep인지 판단할 수 있으면 충분하다.

### 정리

Deep Structure는 구조 안에 internal table, string, reference 같은 deep component가 들어간 구조다. CH06에서는 개념만 잡는다. 지금의 핵심은 여러 행을 Internal Table로 다루는 것이며, deep 구조의 제약과 활용은 후속 장에서 재방문한다.

## CH06-L06 - 구구단 전체 = Internal Table

### 왜 필요한가

CH05에서는 구구단 한 줄만 구조체로 담았다. CH06에서는 같은 모양의 줄을 81개 쌓아야 한다. 그래야 출력 전에 정렬하거나, 특정 결과를 찾거나, 나중에 DB 저장 후보로 넘길 수 있다.

이 실습은 CH06 전체의 결론이다.

| CH06 개념 | 구구단에서의 역할 |
|---|---|
| Line Type | `dan`, `mul`, `result` 구조 |
| Work Area | 현재 만들고 있는 한 줄 |
| Internal Table | 81줄을 담는 `lt_gugu` |
| APPEND | 한 줄씩 쌓기 |
| SORT | 결과 기준으로 재정렬 |
| LOOP | 쌓인 81줄 출력 |

### 무엇인가

먼저 한 줄의 모양을 타입으로 만든다.

```abap
TYPES: BEGIN OF ty_line,
         dan    TYPE i,
         mul    TYPE i,
         result TYPE i,
       END OF ty_line.
```

그 타입으로 work area와 internal table을 만든다.

```abap
DATA: ls_line TYPE ty_line,
      lt_gugu TYPE TABLE OF ty_line.
```

중첩 `DO`로 2단부터 9단까지 만든다.

```abap
DO 8 TIMES.
  ls_line-dan = sy-index + 1.

  DO 9 TIMES.
    ls_line-mul    = sy-index.
    ls_line-result = ls_line-dan * ls_line-mul.
    APPEND ls_line TO lt_gugu.
  ENDDO.
ENDDO.
```

이제 `lt_gugu`에는 81행이 들어 있다.

정렬 후 출력한다.

```abap
SORT lt_gugu BY result DESCENDING.

LOOP AT lt_gugu INTO ls_line.
  WRITE: / ls_line-dan, 'x', ls_line-mul, '=', ls_line-result.
ENDLOOP.
```

CH05와 다른 점은 명확하다. CH05는 계산하면서 바로 출력했다. CH06은 먼저 메모리에 모아 두고, 정렬한 뒤 출력한다.

### 어떻게 확인하는가

전체 프로그램은 다음과 같다.

```abap
REPORT z_ch06_l06_gugu_itab.

TYPES: BEGIN OF ty_line,
         dan    TYPE i,
         mul    TYPE i,
         result TYPE i,
       END OF ty_line.

DATA: ls_line  TYPE ty_line,
      lt_gugu  TYPE TABLE OF ty_line,
      lv_count TYPE i.

DO 8 TIMES.
  ls_line-dan = sy-index + 1.

  DO 9 TIMES.
    ls_line-mul    = sy-index.
    ls_line-result = ls_line-dan * ls_line-mul.
    APPEND ls_line TO lt_gugu.
  ENDDO.
ENDDO.

DESCRIBE TABLE lt_gugu LINES lv_count.
WRITE: / '행 수:', lv_count.

SORT lt_gugu BY result DESCENDING.

LOOP AT lt_gugu INTO ls_line.
  WRITE: / ls_line-dan, 'x', ls_line-mul, '=', ls_line-result.
ENDLOOP.
```

확인 포인트는 다음이다.

| 확인할 것 | 기대 |
|---|---|
| `DESCRIBE TABLE` | 81행 |
| `lt_gugu` 디버거 | 2단부터 9단까지 행이 쌓임 |
| `SORT BY result DESCENDING` | 결과가 큰 행부터 출력 |
| 프로그램 종료 후 | `lt_gugu`는 사라짐 |

마지막 줄이 중요하다. Internal Table은 메모리다. 프로그램이 끝나면 81행은 사라진다. 영구히 남기려면 DB에 저장해야 한다. 이것이 CH07의 동기다.

### 실수와 주의

첫 번째 실수는 바깥 `sy-index`와 안쪽 `sy-index`를 혼동하는 것이다.

```abap
DO 8 TIMES.
  ls_line-dan = sy-index + 1.

  DO 9 TIMES.
    ls_line-mul = sy-index.
  ENDDO.
ENDDO.
```

안쪽 루프에 들어가면 `sy-index`는 안쪽 회차다. 그래서 바깥 단수는 안쪽 루프 전에 `ls_line-dan`에 저장한다.

두 번째 실수는 `APPEND` 위치를 잘못 두는 것이다. `APPEND`는 `mul`과 `result`가 채워진 뒤 실행되어야 한다.

세 번째 실수는 정렬하면 원래 입력 순서가 유지된다고 생각하는 것이다. `SORT lt_gugu BY result DESCENDING` 후에는 table 순서가 바뀐다. 원래 순서가 필요하면 정렬 전에 별도 기준을 보존해야 한다.

네 번째 실수는 Internal Table에 담았으니 저장됐다고 착각하는 것이다. 메모리에 담긴 것과 DB에 저장된 것은 다르다.

### 체험 설계

기존 임베드 `embeds/abap/CH06-L06-S01.html`은 구구단 internal table 성장 스냅샷이다.

| 요소 | 설계 |
|---|---|
| 상태 | 첫 APPEND 1행, 2단 완료 9행, 전체 완료 81행, 정렬 후 |
| 데이터 | `lt_gugu`의 index, `dan`, `mul`, `result` |
| 시각화 | 새로 추가된 행은 초록색, 정렬 후 이동한 행은 강조 |
| 피드백 | "모아 두었기 때문에 SORT로 재배열 가능" |
| 확장 버튼 | `1행 보기`, `9행 보기`, `81행 보기`, `정렬 후 보기` |

브라우저 체험은 실제 81행 전체를 다 보여 주기보다, 행 수가 늘어나는 대표 장면을 보여 주는 편이 좋다. 초보자에게 핵심은 "출력 줄이 아니라 메모리 행이 늘어난다"는 사실이다.

### 정리

구구단 전체를 Internal Table에 담으면 81행을 메모리에서 한꺼번에 다룰 수 있다. 그래서 정렬, 검색, 반복 출력이 가능하다. 하지만 프로그램이 끝나면 사라진다. 다음 CH07에서는 이 데이터를 영구히 저장하기 위한 Transparent Table을 배운다.

## CH06 마무리

CH06의 핵심은 "여러 행을 메모리에 담고 다루는 능력"이다.

| 기준 | 할 수 있어야 하는 일 |
|---|---|
| Internal Table 개념 | Structure 한 건과 Internal Table 여러 건을 구분 |
| 선언 | `TYPE TABLE OF`로 table을 만들고 work area와 짝지어 사용 |
| 비우기 | `CLEAR`, `REFRESH`, `FREE` 차이를 설명 |
| 3속성 | line type, primary key, table kind를 설명 |
| 단일 행 | `READ TABLE`, `INSERT`, `MODIFY`, `DELETE`, `sy-subrc` 확인 |
| 다중 행 | `LOOP`, `WHERE`, `FROM/TO`, `sy-tabix`, `SORT`, `COLLECT`, 중복 제거 |
| Deep Structure | flat/deep을 구분하고 deep은 개념 수준으로 설명 |
| 캡스톤 | 구구단 81행을 `lt_gugu`에 담고 `SORT` 후 `LOOP` 출력 |

다음 CH07에서는 "메모리에 있는 여러 행은 프로그램이 끝나면 사라진다"는 불편을 해결한다. 같은 구구단 데이터를 Transparent Table에 저장하는 방향으로 넘어간다.
