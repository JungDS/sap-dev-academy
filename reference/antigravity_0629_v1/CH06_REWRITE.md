# CH06_REWRITE - Internal Table v1

> 목적: `content/abap/CH06`의 6개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH06 전체 설계

CH06의 한 문장 목표는 "Table Header 와 Body 분리 메모리 아키텍처, STANDARD(순차 O(N)) / SORTED(이진 O(log N)) / HASHED(해시 O(1) 및 인덱스 불가) 탐색 구조, READ TABLE BINARY SEARCH 의 SORT 선행 조건 제약, Field Symbol ASSIGNING 의 Pointer 참조(Call-by-Reference) 성능 튜닝, 그리고 AT NEW/END OF 컨트롤레벨 기동 시 우측 필드 마스킹(별표 가림) 제약과 선행 정렬을 수립하여 다량 메모리 장표 통제력을 확립한다"이다.

IT 비전공자 입문자는 Standard 테이블에 대고 정렬(`SORT`) 없이 `BINARY SEARCH` 를 때려 데이터가 실존함에도 `sy-subrc = 4` 로 튕기는 대형 누락 버그를 내고, Hashed 테이블에 `sy-tabix` 나 `INDEX 1` 로 번호 지칭 점프를 시도해 런타임 덤프로 폭사한다.
또한, 대량 루프 내에서 구조체 복사본 수정(`INTO` + `MODIFY`)을 남발해 메모리 복제 비용을 낭비하고, `AT NEW` 블록 내부에서 우측 필드가 별표(`*`) 마스킹으로 가려지는 아바 인터프리터의 데이터 차단 특성을 몰라 코드를 망가뜨린다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **Header/Body Split Memory**: 8바이트 주소 참조부인 Table Header 와, 쌩 복사(`APPEND`) 데이터가 적재되어 clear/free 로 용량이 조율되는 Table Body 물리 배치 명세.
2. **3대 테이블 탐색 공식**: STANDARD(O(N) 순차), SORTED(이진 정렬 유지), HASHED(O(1) 해시 버킷 및 인덱스 번호 접근 불가)의 물리적 탐색 구조 수립.
3. **BINARY SEARCH 선행 SORT 제약**: 이진 쪼개기가 정확히 도킹하기 위해 조회 키와 동일 정렬 조건의 선행 `SORT` 기동을 강제하는 이진 탐색 가이드 제공.
4. **Field Symbol ASSIGNING**: 메모리 복사 비용이 제로(0)이며 직접 갱신이 체결되어 `MODIFY` 가 불필요한 `<fs>` 참조 튜닝 코딩 이식.
5. **AT NEW 우측 별표 마스킹**: 컨트롤레벨 경계 판단 시, 검사 대상 필드의 우측에 상주하는 모든 데이터가 별표(`*`)로 캐시 마스킹 처리되는 동시성 차단 규명.
6. **구구단 STANDARD 81행 축적**: 81행의 레코드를 메모리에 온전히 쥐어 결과값 역순(`DESCENDING`) 정렬 및 그룹 루프로 다각도 출력하는 캡스톤 실습.

---

## CH06-L01 - Internal Table 기초

### 왜 필요한가

우리가 이전 CH05 에서 구조체 `gs_line` 을 빚어 구구단 한 줄 정보를 다루는 데 성공했다.
하지만 이 구조체 판때기는 오직 '단 1행 (1 Record)' 만 담을 수 있는 그릇(Work Area)이다.
- "2단 3열을 다룬 뒤 2단 4열로 가기 위해 값을 채우면, 이전 3열 정보는 덮어써져 영구 유실된다.
9단까지의 전체 81행 구구단 장표를 메모리에 동시에 쌩으로 들고 있다가, 결과가 큰 순서대로 정렬하거나 필터링을 하고 싶다면?"
메모리 공간 내에 동일한 뼈대를 가진 여러 개의 행(Record)을 캐비닛 서랍처럼 차곡차곡 위로 쌓아 올려 동시에 보존할 수 있는 가상 메모리 테이블 공간이 필요하다.
그 공간이 바로 **Internal Table (내부 테이블)** 이다.

**테이블 구조를 제어하는 Table Header (참조부)와 실 데이터가 쌓이는 Table Body (본체)의 이중 메모리 분리 아키텍처를 이해하고, CLEAR/REFRESH/FREE 의 메모리 수거 차이를 규명하는 기술**이 필요하다. 그것이 **Internal Table 기초**의 장악이다.

### 무엇인가

#### 1. Internal Table (내부 테이블 ≠ Database Table)
- **메모리에만 상주**: **가장 흔한 오해다. 내부 테이블 `gt_data` 는 프로그램이 가동되는 동안에만 Application Layer(2층)의 Roll Area 램 메모리에 임시 상주하며, 프로그램이 닫히면 흔적도 없이 증발한다. 하드디스크 DB 장부에 영구 저장되는 투명 테이블(Transparent Table - CH07)과는 물리적 생존 주기가 완전히 다르다.**

#### 🧭 [ Internal Table Header 와 Body 분리 메모리 아키텍처 명세 ]
- *내부 테이블 변수를 선언하는 순간, 램 공간에서는 아래와 같이 참조와 실체 영역이 격리 배선된다.*

```text
       ┌───────── [ gt_person (Table Header - 테이블 헤더) ] ─────────┐
       │ - 메모리 용량 : 딱 8바이트 (포인터 주소지)                      │
       │ - 역할 : 실제 데이터가 적재되어 있는 램의 Body 주소를 가리킴      │
       └──────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼ ( Pointer Reference 배선 결선 )
       ┌──────────────────────────────┴───────────────────────────────┐
       │ [ Table Body (테이블 바디) ]                                 │
       │  gs_person-name='정훈영', age=30  (APPEND 시 복사되어 1행 적재) │
       │  gs_person-name='홍길동', age=25  (APPEND 시 복사되어 2행 적재) │
       │ - 메모리 용량 : 행 개수(Record size)에 비례해 동적 자동 증설   │
       └──────────────────────────────────────────────────────────────┘
```

#### 2. APPEND gs TO gt (행 복사 추가)
- Work Area (`gs_person`)에 적힌 Flat 연속 바이트 블록 데이터를 복제해, gt 테이블 Body 메모리의 맨 꼬리 끝 번지 자리에 한 줄 레코드로 촥 인서트 추가하는 명령이다.

#### 3. CLEAR / REFRESH / FREE (3대 램 소거)
- **`CLEAR / REFRESH gt`**: 테이블 Body 적재 행들을 모두 0으로 소거하여 껍데기만 남겨 비운다. 단, 이미 확보해 둔 메모리 캐시 한도(Capacity)는 향후 재사용을 위해 반환하지 않고 유지한다.
- **`FREE gt`**: **모든 행을 비우고, 그동안 이 테이블이 메모리 상에 점유하고 있던 램 용량(Capacity) 자체를 완전히 아바 가상머신에 도로 반환(De-allocation)해 램을 클린하게 소생시킨다.** (대량 데이터 핸들링 종결 후 권장).

### 어떻게 확인하는가

Internal Table 을 선언하고 행을 축적한 뒤 FREE 로 소거하는 단계를 검증한다.

```abap
REPORT zhello_it_basic.

TYPES: BEGIN OF ty_person,
         name TYPE string,
         age  TYPE i,
       END OF ty_person.

" 1. [ 1행 그릇 gs_person & 다행 내부 테이블 gt_person 선언 ]
DATA: gs_person TYPE ty_person,
      gt_person TYPE TABLE OF ty_person. " Standard Table 디폴트 선언!

" 2. [ 1행 채우고 APPEND 복사 기동 ]
gs_person-name = '정훈영'.
gs_person-age  = 30.
APPEND gs_person TO gt_person. " gt 의 Body 1행 적재 (Header ID 가리킴)

CLEAR gs_person. " 꼬임 방지를 위한 Work Area 제로 소거!
gs_person-name = '홍길동'.
gs_person-age  = 25.
APPEND gs_person TO gt_person. " 2행 누적 적재

" 3. [ lines 내장함수로 행 수 획득 ]
DATA(gv_lines) = lines( gt_person ). " 2행!

" 4. [ FREE 로 메모리 할당 용량까지 전원 De-allocation 반환! ]
FREE gt_person.

WRITE: / '쌓인 행 수:', gv_lines.
```

#### 체험/시뮬레이터 설계 (Header/Body 수송도)
- **프로세스 플로우**:
  1. 학습자가 [8바이트 Table Header 판] 과 [램 기판 Table Body] 를 본다.
  2. [APPEND gs_person] 을 실행하자, gs 의 데이터가 카피되어 Body 의 1번 슬롯에 촥 안착되고 Header 판에서 Body 1번지로 지잉 파란 화살표가 뻗어간다.
  3. [CLEAR gt_person] 을 누르면, Body 의 행들은 사라지나 파란색 메모리 확보 영역은 그대로 유지된다.
  4. [FREE gt_person] 스위치를 켜자, 파란 영역마저 완전히 하얗게 풀려 램으로 반환(Free memory)되는 수거 피드백을 감상한다.
- **상태 및 데이터**:
  - `APPEND 직전 CLEAR gs 를 생략하여 이전 홍길동 데이터가 섞여서 오염 기입된 상태` -> 런타임 결과: `Data pollution. Previous values mixed into new row` 하이라이트.
- **피드백**: 내부 테이블은 Header/Body 격리 주소 구조이며, 메모리 수거는 FREE 로 완수함을 체득한다.

### 실수/주의

- **구식 Header Line 방식 (DATA gt_table TYPE TABLE OF structure WITH HEADER LINE.) 으로 변수 선언**:
  - `gt_table` 이라는 똑같은 이름으로 내부 테이블과 Work Area 가 이중 공유되는 끔찍한 구식 문법(Obsolete)입니다. 이 방식은 `CLEAR gt_table` 수행 시 테이블이 아닌 작업영역만 지워져 버그를 양산하며, 모던 ABAP Cloud 에서는 컴파일 즉사 에러를 맞이합니다.
  - **무조건 `gt_` 와 `gs_` 의 이름과 물리 그릇을 명확히 쪼개는 짝꿍 선언을 수호해야 합니다.**

### 정리

- **`Internal Table`** 은 램 세션 내에만 상주하며, **`Table Header (8바이트 주소)`** 와 **`Table Body (실제 행)`** 로 이중화된다.
- **`APPEND`** 문은 Work Area 의 Flat 바이트 데이터를 테이블 본체 꼬리에 복사 누적한다.
- 행 삭제 및 물리 램 메모리 점유까지 커널에 완전 수거 반환하는 지시어는 **`FREE`** 다.
- 구식 **`Header Line`** 사용은 형상을 꼬이게 하므로 전면 금지하며, 명시적 **`INTO gs_`** 방식을 수호한다.

---

## CH06-L02 - 내부 테이블의 3속성 · 테이블 종류

### 왜 필요한가

내부 테이블과 Header/Body 격리 개념을 파악했다.
이제 테이블의 목적에 맞춘 'STANDARD, SORTED, HASHED 3대 종류(Table Kind)의 탐색 성능 차이' 가 장벽입니다.
- " 데이터가 10만 건 들어 있는 명단에서, 특정 회원 1건을 찾을 때 STANDARD 와 HASHED 는 컴퓨터 내부적으로 어떤 성능적 알고리즘으로 분기되는가?"
그리고, 1초 만에 해시로 점프하는 HASHED 테이블에 대고 `INDEX 5` 라며 인덱스 번호 조회를 날렸을 때 런타임이 에러를 뿜고 폭사하는 제약을 숙지하고 있어야 안전 정합성 설계를 완성합니다.

**STANDARD(O(N) 순차 탐색), SORTED(이진 정렬 적재 및 O(log N) 탐색), HASHED(해시 버킷 점프 및 O(1) 탐색)의 물리적 탐색 구조와, HASHED 인덱스(INDEX / sy-tabix) 금지 규칙을 수호하는 기술**이 필요합니다. 그것이 **내부 테이블 3속성 설계**의 완수입니다.

### 무엇인가

#### 1. 내부 테이블의 3대 속성
- **Line Type(행 모양)**: 구조체나 단일 필드(`TYPE TABLE OF i`) 등 행의 물리 구조.
- **Primary Key(기본 키)**: 행들을 구분하고 정렬/검색의 가이드가 되는 기준 필드.
- **Table Kind(테이블 종류)**: Standard / Sorted / Hashed 삼형제다.

#### 🧭 [ 3대 내부 테이블(STANDARD / SORTED / HASHED) 성능 규격서 ]
- *세 종류의 테이블은 램 속에서 완전히 다른 방식으로 적재되고 탐색된다.*

```text
[1] STANDARD TABLE (일반 인덱스 테이블) :
   - 적재 : 들어오는 순서대로 꼬리에 쌓인다. (APPEND 사용 가능)
   - 탐색 : READ TABLE 시 1번 행부터 끝 행까지 쌩 순차 탐색(O(N))을 밟으므로 대량 조회 시 매우 느리다.
   - 특징 : INDEX 번호(INDEX n)나 sy-tabix 로 고속 조회 가능.
   │
[2] SORTED TABLE (이진 정렬 인덱스 테이블) :
   - 적재 : INSERT TABLE 시, 아바가 키의 정렬 위치를 이진 탐색해 정렬 순서대로 행을 비집고 삽입한다.
   - 탐색 : READ TABLE 시 이진 탐색(Binary Search - O(log N))을 수행해 대량 조회 시 기하급수적으로 고속 작동한다.
   - 특징 : INDEX 번호로 접근 가능.
   │
[3] HASHED TABLE (해시 초고속 테이블) :
   - 적재 : 유일 키 값을 토대로 해시 함수가 버킷 메모리 주소를 발급받아 다이렉트 배치한다. (APPEND 불가)
   - 탐색 : 키로 찾을 때 순차/이진 검색 없이, 해시 주소로 바로 점프(O(1))하므로 데이터가 100만 건이어도 0.0001초 만에 찾는다.
   - ★ 제약 : 물리적 행 번호(인덱스) 개념이 아예 없으므로, INDEX n 이나 sy-tabix 지칭 시 런타임 덤프로 즉사한다.
```

### 어떻게 확인하는가

STANDARD 및 HASHED 테이블을 정의하고 키 제약을 검증하는 코드를 구현한다.

```abap
REPORT zhello_table_kind.

TYPES: BEGIN OF ty_user,
         userid TYPE c LENGTH 10,
         name   TYPE string,
       END OF ty_user.

" 1. [ STANDARD TABLE 로컬 타입 정의 - INDEX 사용 가능 ]
TYPES ty_std_tab TYPE STANDARD TABLE OF ty_user WITH DEFAULT KEY.

" 2. [ HASHED TABLE 정의: 단건 O(1) 초고속 점프를 위해 UNIQUE KEY 지정! ]
TYPES ty_hash_tab TYPE HASHED TABLE OF ty_user WITH UNIQUE KEY userid.

DATA: gt_std  TYPE ty_std_tab,
      gt_hash TYPE ty_hash_tab,
      gs_user TYPE ty_user.

gs_user-userid = 'USER01'.
gs_user-name   = '정훈영'.

" Standard 테이블 적재
APPEND gs_user TO gt_std.

" Hashed 테이블 적재 ( Hashed 는 키 배치이므로 APPEND 불가, INSERT INTO TABLE 사용! )
INSERT gs_user INTO TABLE gt_hash.

" [ HASHED INDEX 접근 금지 제약 검증 ]
" READ TABLE gt_hash INTO gs_user INDEX 1. " <- 이 짓을 하면 "Index access not allowed" 빌드 즉사 에러!

" 3. [ HASHED 는 오직 UNIQUE KEY 를 찔러 O(1) 탐색만 수행! ]
READ TABLE gt_hash INTO gs_user WITH TABLE KEY userid = 'USER01'.

IF sy-subrc = 0.
  WRITE: / 'Hashed O(1) 탐색 성공:', gs_user-name.
ENDIF.
```

#### 체험/시뮬레이터 설계 (3대 테이블 탐색 속도 레이싱)
- **프로세스 플로우**:
  1. 학습자가 [10만 건 레코드] 기판과 [STANDARD 수송차], [SORTED 수송차], [HASHED 수송차] 를 본다.
  2. [USER99999 찾기] 깃발을 올린다.
  3. STANDARD 차는 1번 행부터 99999번까지 빌빌 기어 O(N) 순차 스캔으로 달리느라 10초가 소요된다.
  4. HASHED 차는 기어가 작동하자마자 해시 슬롯 주소로 촥 웜홀 이동해 0.01초 만에 도착 완료 피드백을 감상한다.
  5. 이때 HASHED 차에 [INDEX 1] 레버를 강제로 꺾어 물리는 순간, "Hashed Gear Crushed! No index lane!" 사이렌이 울리는 격리 제약 피드백을 확인한다.
- **상태 및 데이터**:
  - `HASHED 테이블 정의 시 UNIQUE KEY 지정을 생략한 상태` -> 런타임 결과: `Syntax error. Hashed tables must have a unique key` 하이라이트.
- **피드백**: Hashed 테이블은 독보적 고속 단건 조회의 구원투수이나 인덱스(INDEX)가 원천 금지됨을 터득한다.

### 실수/주의

- **구조체나 테이블 종류가 굳이 필요 없는 가벼운 조회 로직에 무작정 Sorted 나 Hashed 테이블을 기본값으로 난사하여 적재 성능을 훼손**:
  - Sorted 와 Hashed 는 데이터를 넣을 때(`INSERT`)마다 이진 비교 및 해시 연산을 하므로 적재 속도가 STANDARD 보다 느립니다.
  - **일반적인 쌓기 위주 작업은 무조건 STANDARD 를 표준 수호해 지정하고, 대량 단건 조회가 잦을 때만 Hashed 로 갈아타는 튜닝 룰을 밟아야 합니다.**

### 정리

- 내부 테이블 3대 속성은 **`Line Type (행 모양)`**, **`Primary Key (기준 키)`**, **`Table Kind (종류)`** 다.
- **`STANDARD`** 는 인덱스 사용이 가능하나 순차 탐색(O(N))을 돌며, **`SORTED`** 는 이진 탐색(O(log N))을 수행한다.
- **`HASHED`** 는 해시 버킷 점프를 통해 데이터 건수 무관 초고속 **`O(1) 단건 탐색`** 을 수호한다.
- 단, HASHED 는 물리적 순번 개념이 없어 **`INDEX 접근 및 sy-tabix 활용이 불법 락 차단`** 된다.

---

## CH06-L03 - 단일 행 제어

### 왜 필요한가

테이블 종류와 적재 규칙을 익혔다.
이제 대량 Standard 테이블에서 단건 레코드를 서치하는 `READ TABLE` 의 '정렬 상태 오류' 가 장벽입니다.
- " Standard 테이블에 BINARY SEARCH 옵션을 주고 READ TABLE 을 돌렸다. 
분명히 테이블 내에 2단 4열에 해당하는 데이터가 존재하고 눈에 보임에도, 왜 sy-subrc = 4 (없음) 를 뱉고 통과해 버리는가?"
이진 쪼개기(`BINARY SEARCH`)의 내부 알고리즘 작동 원리 상, 직전 라인에 동일 키로 정렬(`SORT`)을 단행해 두지 않으면 탐색 엔진이 엉뚱한 절반 영역을 버리고 가버려 데이터를 놓치는 치명적인 정합성 파손을 낳습니다.

**READ TABLE BINARY SEARCH 기동 시의 선행 SORT 정렬 의무 제약과, 복사 비용을 0원으로 억제하는 TRANSPORTING NO FIELDS 최적화 기술**이 필요합니다. 그것이 **단일 행 제어**의 완수입니다.

### 무엇인가

#### 1. READ TABLE ... BINARY SEARCH (이진 탐색의 물리적 선결 조건)
- **정렬 누락의 해악**: **이진 탐색은 가운데 값을 찔러 "내가 찾는 것보다 크냐 작냐" 를 판정해 절반씩 영역을 날리며 찾는다. 만약 테이블이 정렬되어 있지 않다면, 50을 찔렀는데 뒤에 5가 가로막고 있어도 그 구역을 통째 버리고 반대편으로 가버린다. 이로 인해 데이터가 존재함에도 찾지 못하는 `sy-subrc = 4` 참사를 뿜는다. 따라서 반드시 직전 라인에 `SORT gt BY key.` 를 의무 수행하여 물리 정렬을 수호해야만 정확성이 100% 보증된다.**

#### 2. TRANSPORTING NO FIELDS (존재 검문 최적화)
- **복사 비용 0원**: **단지 "이 이름의 회원이 테이블에 실재하는가?" 존재 여부(성공/실패)만 알고 싶을 때, 쌩 `READ TABLE` 을 때리면 램 상에서 Work Area 로 무거운 바이트 카피가 유발된다. 꼬리에 `TRANSPORTING NO FIELDS` 를 얹어 쏘면, 복사 연산을 싹 바이패스하여 `sy-subrc` 판정 기어만 0.00001초 만에 찰딱 돌려주므로 CPU 소모가 전혀 없다.**

#### 3. INSERT INDEX vs INSERT TABLE
- **`INSERT gs INTO gt INDEX n`**: STANDARD 테이블에서 내가 지정한 n번째 줄 한복판에 강제로 끼워 넣는 물리적 순번 지정 추가다.
- **`INSERT gs INTO TABLE gt`**: SORTED/HASHED 테이블에서 순번 지칭 없이, 키 정렬 기준에 맞춰 시스템이 알아서 이진 점입하게 유도하는 모던 정석 키 추가다.

### 어떻게 확인하는가

정렬 후 이진 탐색 및 TRANSPORTING NO FIELDS 성능 가드가 조립된 코드를 검증한다.

```abap
REPORT zhello_read_table.

TYPES: BEGIN OF ty_line,
         dan    TYPE i,
         mul    TYPE i,
         result TYPE i,
       END OF ty_line.

DATA: gs_line TYPE ty_line,
      gt_gugu TYPE TABLE OF ty_line.

" 임의 데이터 쌓기
gs_line-dan = 3. gs_line-mul = 5. gs_line-result = 15. APPEND gs_line TO gt_gugu.
gs_line-dan = 2. gs_line-mul = 4. gs_line-result = 8.  APPEND gs_line TO gt_gugu.
gs_line-dan = 5. gs_line-mul = 2. gs_line-result = 10. APPEND gs_line TO gt_gugu.

" 1. [★ 중요: BINARY SEARCH 를 쏘기 전, 반드시 비교 대상 필드로 SORT 선행 정렬!]
SORT gt_gugu BY dan. " dan 기준 오름차순 정렬 수호!

" 2. [ 이진 탐색 기동: 정렬이 되어 있으므로 O(log N) 속도로 무결 탐색 성공! ]
READ TABLE gt_gugu INTO gs_line 
     WITH KEY dan = 2 BINARY SEARCH.

IF sy-subrc = 0.
  WRITE: / '찾은 구구단 결과:', gs_line-dan, 'x', gs_line-mul, '=', gs_line-result.
ENDIF.

" 3. [★ 성능 사수: 존재 여부만 체크하므로 복사 비용 0원 가드 기동!]
READ TABLE gt_gugu TRANSPORTING NO FIELDS 
     WITH KEY dan = 5 BINARY SEARCH.

IF sy-subrc = 0.
  WRITE: / '5단 데이터가 테이블 내에 실존함 확인!'.
ENDIF.
```

#### 체험/시뮬레이터 설계 (BINARY SEARCH 이진 쪼개기)
- **프로세스 플로우**:
  1. 학습자가 [뒤죽박죽 데이터 레일 gt_gugu] 와 [READ TABLE BINARY SEARCH 돋보기] 를 본다.
  2. [SORT BY dan = OFF] 인 상태에서 2단을 찾는다. 돋보기가 중간 3을 찌르더니, 2는 3보다 작으니 왼쪽 영역은 쳐다보지도 않고 우측만 훑다가 "sy-subrc = 4 데이터 없음" 붉은 경고를 뱉는다. (레일에 2가 엄연히 존재하는데도 오작동!)
  3. [SORT BY dan = ON] 스위치를 켠다. 레일 데이터가 2, 3, 5 로 정렬되어 다시 2를 찌르자, 0.01초 만에 2를 집어내 초록불이 켜지는 이진 탐색 정합성 피드백을 감상한다.
- **상태 및 데이터**:
  - `READ TABLE 실패 시 sy-subrc 를 확인하지 않고 곧장 다음 gs_line 필드를 연산에 사용한 상태` -> 런타임 결과: `Logic bug. Processing with dirty buffer data` 하이라이트.
- **피드백**: Standard 테이블 이진 검색 시 선행 SORT 는 논리적 무결성을 수호하기 위한 강제 전제 조건임을 각인한다.

### 실수/주의

- **구식 MODIFY TABLE 이나 DELETE TABLE 을 기동하면서, 구조체 Key 필드 값을 쌩 비워둔 채 쏘아 엉뚱한 행을 고치거나 삭제**:
  - TABLE 키 기반 수정/삭제는 구조체 내의 Key 컴포넌트 값을 바탕으로 탐색하므로, 키가 비어 있으면 전혀 엉뚱한 행을 훼손하거나 아무 동작도 안 한다.
  - **키 기반 제어 시에는 반드시 Key 필드 값을 채워 쏴야 함을 수호해야 한다.**

### 정리

- STANDARD 테이블에서 **`BINARY SEARCH`** (이진 탐색)를 쏠 때는, 무조건 직전 라인에 **`비교 키 기준 SORT`** 정렬을 단행한다.
- 정렬을 누락하면 이진 분기 낚시 도중 값을 놓쳐 데이터가 버젓이 존재함에도 **`sy-subrc = 4`** 실패를 뱉는다.
- 존재 판정만 소화할 때는 **`TRANSPORTING NO FIELDS`** 가드를 붙여 메모리 복사 비용을 완전히 0원으로 격리 억제한다.
- **`INDEX n`** 은 번호 기반, **`TABLE`** 은 키 기반 단일 행 수정을 명령한다.

---

## CH06-L04 - 다중 행 제어

### 왜 필요한가

단일 행의 고속 렌더링까지 완수했다.
이제 테이블의 수만 건 데이터를 순회하는 `LOOP AT` 과 그룹 소계 `AT NEW` 의 '데이터 마스킹 훼손' 이 장벽입니다.
- " LOOP AT 안에서 데이터를 고치려고 MODIFY 를 때렸는데 성능이 기어간다. 더 고속화하는 메모리 주소 포인팅 기법은 무엇인가?
그리고, AT NEW gv_field 블록을 타고 들어갔더니, 왜 gv_field 오른쪽에 적어둔 예약자명이나 금액 데이터가 쌩뚱맞은 별표(`*`)로 가려져 읽을 수 없게 차단되는가?"
`INTO gs` 루프는 데이터 복제 오버헤드를 동반하며, `AT NEW` 블록 내에서 그룹 우측 필드를 커널이 강제로 마스킹(별표 가림)하는 물리적 구조 제약을 모르면, 코드에 버그가 들어가 정산 장표가 박살 납니다.

**복사 없이 테이블 행 메모리 주소를 직접 찌르는 FIELD-SYMBOLS <fs> ASSIGNING 참조 포인팅 튜닝 기술과, AT NEW / AT END OF 컨트롤레벨 기동 시 우측 필드가 별표(*)로 강제 캐싱 마스킹되는 아바 VM 제약 해소 기술**이 필요합니다. 그것이 **다중 행 제어**의 완수입니다.

### 무엇인가

#### 1. FIELD-SYMBOLS <fs> ASSIGNING (Call-by-Reference 튜닝)
- **복사 비용 0원 직접 갱신**: **`INTO gs` 는 램에서 루프 회차마다 행 데이터를 gs 버퍼로 무겁게 복사해 오고, 수정 시 다시 `MODIFY` 문으로 테이블에 복사본을 써넣어야 한다. `ASSIGNING <fs>` 는 테이블 Body 의 실제 데이터 행 메모리 번지(Pointer Address)를 이름표(`<fs>`)에 직접 연결(Call-by-Reference)한다. 복사 비용이 1비트도 안 들며, `<fs>-field = ...` 값을 바꾸는 그 순간 테이블 본체가 즉각 다이렉트 갱신 완료되어 `MODIFY` 구문 호출 자체가 불필요하므로 속도가 극적으로 빨라진다.**

#### 2. AT NEW f / AT END OF f (컨트롤레벨의 우측 필드 마스킹 제약)
- **별표(*) 마스킹 제약**: **`AT NEW f` 블록 내벽으로 진입하는 순간, 아바 가상머신은 그룹 판단 정합성을 지키기 위해, 지정한 필드 `f` 보다 오른쪽에 정의된 모든 컴포넌트의 값을 강제로 임시 별표(`*` 또는 초기값)로 가려 조회 불가능 상태로 밀어버린다. 이 마스킹을 모른 채 블록 안에서 우측 필드를 변수에 대입하려 들면, 쓰레기 값(별표)이 전달되어 정산 덤프가 난다. (필요하다면 진입 전 전체 행을 임시 로컬 구조체에 백업해 두고 꺼내 써야 한다.)**
- **정렬 필수**: 컨트롤레벨 경계 판단을 타기 위해선 반드시 **선행 `SORT`** 가 완료되어 있어야 그룹 톱니가 깨지지 않는다.

#### 3. COLLECT gs INTO gt (자동 고속 누적기)
- 루프를 돌며 내가 쏜 구조체의 문자 필드를 '키' 로 식별하고, 숫자 필드(금액 등)는 기존 동명 키 행에 알아서 더하기(SUM)해 누적해 주는 스마트 고속 누적 장치다.

### 어떻게 확인하는가

필드 심볼과 AT NEW 마스킹 백업이 도킹된 다중 행 제어 코드를 검증한다.

```abap
REPORT zhello_loop_control.

TYPES: BEGIN OF ty_sales,
         region TYPE c LENGTH 10,
         item   TYPE string,
         amount TYPE p LENGTH 8 DECIMALS 2,
       END OF ty_sales.

DATA: gs_sales TYPE ty_sales,
      gt_sales TYPE TABLE OF ty_sales,
      gs_backup TYPE ty_sales.

" 가상 매출 데이터 쌓기
gs_sales-region = 'SEOUL'. gs_sales-item = 'TICKET'. gs_sales-amount = '50000.00'. APPEND gs_sales TO gt_sales.
gs_sales-region = 'SEOUL'. gs_sales-item = 'GOODS'.  gs_sales-amount = '10000.00'. APPEND gs_sales TO gt_sales.
gs_sales-region = 'BUSAN'. gs_sales-item = 'TICKET'. gs_sales-amount = '45000.00'. APPEND gs_sales TO gt_sales.

" 1. [★ 중요: 컨트롤레벨 가동을 위해 그룹 필드인 region 기준 선행 정렬!]
SORT gt_sales BY region.

" 2. [★ 성능 사수: 복사 비용이 없는 FIELD-SYMBOLS 참조 포인팅 루프 가동!]
FIELD-SYMBOLS <fs_sales> TYPE ty_sales.

LOOP AT gt_sales ASSIGNING <fs_sales>.
  
  " [★ 마스킹 우회 수호: AT NEW 진입 전, 우측 필드 유실을 막기 위해 현재 행을 통째 백업!]
  gs_backup = <fs_sales>. 

  AT NEW region.
    " 이 블록 안에서는 <fs_sales>-item 과 amount 는 커널에 의해 '*' 로 마스킹되어 읽을 수 없음!
    " 따라서 백업해 둔 gs_backup 을 경유해 비즈니스 명칭 가공 처리!
    WRITE: / '★ 지역 그룹 개시:', gs_backup-region.
  ENDAT.

  WRITE: / ' - 품목:', <fs_sales>-item, '금액:', <fs_sales>-amount.

  AT END OF region.
    SUM. " 현재 region 그룹의 amount 합계를 계산해 <fs_sales>-amount 에 자동 대입!
    WRITE: / ' 소계합:', <fs_sales>-amount.
  ENDAT.

ENDLOOP.
```

#### 체험/시뮬레이터 설계 (Field Symbol 번지 점프)
- **프로세스 플로우**:
  1. 학습자가 [Table Body 메모리 기판] 과 [gs_sales 버퍼 상자], 그리고 [필드심볼 <fs_sales> 집게] 를 본다.
  2. [INTO gs_sales] 루프를 돌린다. 기판 1번 행 데이터가 상자로 촥 복제 이동해 담기고, 수정 시 상자 값을 바꾸고 다시 기판으로 밀어 넣는(MODIFY) 2단 모션이 가동된다. (느림).
  3. [ASSIGNING <fs_sales>] 로 스위칭한다. 집게가 기판 1번 행 메모리 주소를 찰딱 집어 올리고, 집게 조작 즉시 기판 비트가 초고속 다이렉트 갱신되는 O(1) 포인터 피드백을 감상한다.
- **상태 및 데이터**:
  - `AT NEW region 블록 안에서 마스킹된 <fs_sales>-item (값 = '*') 을 그대로 WRITE 렌더링에 사용한 상태` -> 런타임 결과: `Output dirty. Item name rendered as asterisks` 하이라이트.
- **피드백**: Field Symbol 은 복사 비용 0원 직접 갱신 튜닝의 기둥이며, AT NEW 내벽 우측 필드는 별표 마스킹 가드가 걸리므로 선 백업이 수호 장치임을 체득한다.

### 실수/주의

- **정렬 SORT 를 단행하지 않고 DELETE ADJACENT DUPLICATES 를 쏘아 중복 제거가 무시되고 레코드가 그대로 잔존**:
  - 이 중복 제거문은 오직 '바로 이웃(Adjacent)' 에 맞닿아 있는 레코드끼리만 대조하므로, 정렬이 풀려 있으면 중복이 거르지 않고 생 지나쳐 데이터를 오염시킨다.
  - **중복 제거 전에는 무조건 `SORT` 를 선행 수호해야 한다.**

### 정리

- **`FIELD-SYMBOLS <fs> ASSIGNING`** 루프는 메모리 복사 비용 0원이며 **`Call-by-Reference`** 직접 수정을 단행한다.
- **`AT NEW f`** / **`AT END OF f`** 경계 판단 전에는 그룹 키 기준 **`선행 SORT`** 를 칼 수호한다.
- AT NEW 블록 내부에서는 기준 필드 우측 컴포넌트가 **`별표 (*)`** 로 마스킹되므로, **`진입 전 로컬 구조체 백업`** 으로 해소한다.
- 인접 중복 제거는 **`DELETE ADJACENT DUPLICATES`** 로 격리 소거한다.

---

## CH06-L05 - Deep Structure 개념

### 왜 필요한가

다중 행 제어 스키마까지 완수했다.
이제 1개 주문 머리 행 밑에 N개 아이템 행 리스트가 딸리는 '중첩 내부 테이블(Deep)' 의 물리 이해가 장벽입니다.
- " 구조체 ZST_ORDER 를 정의하는데, 그 컴포넌트 중 하나가 또 다른 내부 테이블 gt_items 통째인 형태를 빚었다.
이 Deep 구조가 램에 올라갈 때, Flat 구조체처럼 쌩 바이트 복사(Contiguous Memory Copy)가 불가능한 물리 주소 락 원인은 무엇인가?"
이 Deep 구조체 데이터를 쌩 DB 테이블(`ZTABLE`)에 곧장 세이브하려 들다 "Deep 구조체는 데이터베이스 물리 테이블 컬럼으로 직접 매핑 적재할 수 없다" 고 커널 컴파일 폭사를 맞이한다.

**Deep 구조체가 내부 가변 STRING 이나 내부 테이블 번지(Pointer Reference) 주소지 락을 쥐고 힙(Heap)에 분할 할당되는 물리 아키텍처와, DB 투명 테이블 1:1 매핑 제한 기술**이 필요합니다. 그것이 **Deep Structure 개념의 장악**입니다.

### 무엇인가

#### 1. Deep Structure (깊은 구조체의 힙 분할 메모리)
- **주소지 락**: **Flat 구조체와 달리, 내부에 가변 STRING 이나 내부 테이블(`TABLE OF`)을 포함하는 순간, 구조체 본체는 고정 폭 바이트가 붕괴된다. 아바 가상머신은 이 Deep 구조체를 연속 바이트로 램에 얹지 못하고, 가변 데이터가 실제 저장되어 있는 힙(Heap) 메모리 공간의 '시작 주소 포인터(Pointer Reference)' 값만 구조체 자리에 락 걸어 저장한다. (데이터를 다룰 때마다 번번이 포인터를 역참조해 힙을 파고드는 메모리 탐색 연산 비용이 유발된다.)**

#### 2. Deep 의 DB 투명 테이블 매핑 원천 차단 제약
- *데이터베이스 장부 보존의 절대적인 물리 제약이다.*
- DB 테이블(`ZTABLE`)의 각 컬럼은 디스크 디렉토리에 고정 크기 물리 바이트 세그먼트로 보존되어야 한다. 
- 따라서 **ZTABLE 의 컴포넌트로 Deep 구조체나 내부 테이블 타입을 직접 쑤셔 넣으려 들면, 데이터 사전(SE11) 컴파일러가 "가변 구조는 DB 테이블 컬럼으로 기입할 수 없다" 고 빨간 에러를 뿜으며 활성화를 기각한다.** (DB 저장은 오직 Flat 구조체 뼈대만 허용된다.)

### 어떻게 확인하는가

Deep Structure 의 뼈대를 선포하고 Flat 과의 메모리 적재 차이를 검증한다.

```abap
REPORT zhello_deep_structure.

" 1. [ 내부 테이블 표준 타입 정의 ]
TYPES: ty_items_tab TYPE STANDARD TABLE OF sflight WITH DEFAULT KEY.

" 2. [★ 구조체 컴포넌트 items 가 내부 테이블을 통째 품음 - Deep Structure 창조!]
TYPES: BEGIN OF ty_order,
         order_id TYPE i,
         customer TYPE string,       " STRING 도 가변이므로 Deep!
         items    TYPE ty_items_tab, " 내부 테이블 삼켰으므로 Deep!
       END OF ty_order.

DATA gs_order TYPE ty_order. " Deep 구조체 변수 생성! (주소 포인터 락 작동)

" [ DB 테이블 세이브 불가 제약 지점 ]
" ZTABLE 에 ty_order 구조를 그대로 컬럼으로 박으려 하면 Dictionary 활성화 차단 발생!

WRITE: / 'Deep Structure 도면 셋업 완료.'.
```

#### 체험/시뮬레이터 설계 (Flat/Deep 메모리 격리판)
- **프로세스 플로우**:
  1. 학습자가 [연속 램 기판] 과 [가변 힙 Heap 기지] 를 본다.
  2. [Deep Structure 칩] 을 꽂자, 램 기판에는 데이터가 안 담기고 [8바이트 포인터 주소 안테나] 만 딱 락 걸려 꽂힌다.
  3. 안테나가 레이저를 쏴서 [힙 기지] 에 가변 크기로 지어 올린 실제 items 테이블 주소를 가리킨다.
  4. 이 칩을 [DB 저장 수송기] 에 올리자, "Deep layout cannot be serialized to DB columns! Blocked!" 적색 불이 켜지며 수송 벨트가 멈추는 물리 제약 피드백을 감상한다.
- **상태 및 데이터**:
  - `Deep 구조체를 ALV 화면 레이아웃에 직접 바인딩하려 기동한 상태` -> 런타임 결과: `ALV display error. Deep structures not supported by classic grid` 하이라이트.
- **피드백**: Deep 구조체는 힙 포인터 참조를 타서 유연하나, DB 투명 테이블 컬럼으로는 직접 삽입이 영구 불가함을 터득한다.

### 실수/주의

- **Deep Structure 를 선언하고, CLEAR gs_order 를 때리면 내부 테이블 items 필드 안방의 행 데이터는 안 지워지고 껍데기 포인터만 날아갈 것이라 오인**:
  - `CLEAR` 를 때리면 아바 커널이 포인터 추적기를 깨워 힙의 참조 데이터를 다 쫓아가 흔적도 없이 삭제 소거하고 빈 테이블 상태로 무결 포맷해 준다.
  - **안심하고 `CLEAR` 를 쏘아 수호하면 된다.**

### 정리

- 가변 STRING 이나 내부 테이블을 품은 구조체는 **`Deep Structure (깊은 구조)`** 라 부른다.
- Deep 은 램 상에 데이터를 직접 쓰지 않고, 힙(Heap) 메모리 주소를 가리키는 **`포인터 참조`** 방식으로 작동한다.
- **`DB 투명 테이블`** 은 디스크 세그먼트 고정 제약으로 인해 Deep 구조체를 컬럼 타입으로 직접 사용이 **`원천 금지`** 된다.

---

## CH06-L06 - 구구단 전체 = Internal Table (캡스톤)

### 왜 필요한가

Deep 구조체 개념까지 완수했다.
이제 아카데미의 1단원 캡스톤 종합으로서 '구구단 81행 전체를 Standard 테이블에 축적하고 큰 순서대로 DESCENDING 정렬 출력' 하는 실전 코딩이 최종 장벽입니다.
- " 구구단 81행을 `gt_gugu` 테이블에 APPEND 로 차곡차곡 모았다. 
이 81행 전체를 결과물 크기 순서로 내림차순 정렬하여, LOOP AT 으로 2단부터 9단까지 정돈 출력하는 정합성 캡스톤 코드는 어떻게 완수하는가?"
이 다량 테이블 축적을 실습해 보아야만, 다음 7장에서 배울 '이 메모리 gt_gugu 데이터를 디스크 장부에 영구 인서트하는 Open SQL' 로 도약할 수 있습니다.

**중첩 DO 루프에서 sy-index 를 캐시 변수 gv_dan 에 격리 백업하며 81행을 gt_gugu STANDARD TABLE 에 APPEND 하고, SORT BY result DESCENDING 으로 물리 정렬해 LOOP AT 으로 순회 방출하는 종합 캡스톤 기술**이 필요합니다. 그것이 **구구단 Internal Table 캡스톤**의 완수입니다.

### 무엇인가

#### 1. 구구단 Internal Table 캡스톤
- 단일 행만 소화하고 덮어씌워지던 CH05 구조체의 한계를 돌파하여, 구구단 81행 전체를 메모리에 동시 상주시키고, 정렬(`SORT`) 및 루프(`LOOP`)의 전산 조작을 가해 최종 리포트로 변환 렌더링하는 다중 행 제어의 꽃이다.

#### 2. SORT gt_gugu BY result DESCENDING (내림차순 정렬 격발)
- **STANDARD 테이블의 81행 메모리 블록을, result 필드 값이 가장 큰 녀석부터 맨 위 1번 인덱스로 오도록 램 상에서 줄을 세워 물리 인덱스를 전면 재정치하는 엔진 작동이다.**

#### ⚠️ [ Internal Table 의 휘발성 한계와 다음 7장 징검다리 ]
- **`gt_gugu` 는 오직 램 메모리(Internal Session) 상에만 가설된 휘발성 풍선이다.**
- **동작 한계**: **프로그램 실행이 끝나고 F8 화면을 닫고 나가는 그 찰나, gt_gugu 가 점유하던 램의 Roll Area 블록은 전산실 커널에 의해 전원 소거(FREE)되어 영구 공중분해된다.**
- **불편 직면**: **내일 출근해서 프로그램을 다시 켜도 어제 계산한 구구단 결과가 고스란히 남아 있게 하려면? 램이 아니라 전산실 하드디스크 장부에 영구 저장(DB Insert)을 쏴야만 하며, 이를 위해 다음 7장의 Transparent Table (투명 테이블)과 SQL 의 세계로 확장되어야 함을 증명한다.**

### 어떻게 확인하는가

81행을 축적하고 정렬해서 순회 방출하는 캡스톤 코드를 기동해 검증한다.

```abap
REPORT zhello_gugudan_it.

TYPES: BEGIN OF ty_line,
         dan    TYPE i,
         mul    TYPE i,
         result TYPE i,
       END OF ty_line.

DATA: gs_line TYPE ty_line,
      gt_gugu TYPE TABLE OF ty_line. " 81행을 담을 캐비닛 내부 테이블 선언!

START-OF-SELECTION.

  " 1. [ 중첩 DO 문 기동: sy-index 덮어쓰기 유실 가드 장착! ]
  DO 8 TIMES.
    gs_line-dan = sy-index + 1. " 2단 ~ 9단 백업
    
    DO 9 TIMES.
      gs_line-mul    = sy-index.
      gs_line-result = gs_line-dan * gs_line-mul.
      
      " 2. [★ 매 회차마다 구조체의 Contiguous Byte Block 을 테이블 Body 꼬리에 복사 누적!]
      APPEND gs_line TO gt_gugu. 
    ENDDO.
  ENDDO.

  " 3. [★ 구구단 결과가 큰 순서대로 내림차순(DESCENDING) 물리 재정치 정렬 격발!]
  SORT gt_gugu BY result DESCENDING dan ASCENDING.

  WRITE: / '★ 구구단 결과 큰 순 정렬 출력 ★', / sy-uline.

  " 4. [ LOOP AT 순회 가동: 정렬된 인덱스 순서대로 81행 방출! ]
  LOOP AT gt_gugu INTO gs_line.
    WRITE: / gs_line-dan, 'x', gs_line-mul, '=', gs_line-result.
  ENDLOOP.
```

#### 체험/시뮬레이터 설계 (구구단 전체 = Internal Table)
- **프로세스 플로우**:
  1. 학습자가 [gt_gugu 캐비닛 (81칸 서랍)] 과 [gs_line 단일 서랍] 을 본다.
  2. 구구단 기어가 돌며 gs_line 에 한 줄이 완성될 때마다, [APPEND 수송 로봇] 이 데이터를 집어 gt_gugu 캐비닛의 1번 서랍, 2번 서랍으로 착착 쌓아 81칸을 다 채우는 모션을 관찰한다.
  3. [SORT result DESCENDING] 을 클릭하자, 캐비닛 내부 서랍들의 물리 위치가 지이잉 셔플되어 결과값 `81` 이 든 서랍이 맨 위 1번 칸으로 촥 정렬 재배치된다.
  4. LOOP AT 기차를 타자, 1번 서랍부터 차례대로 문이 열리며 화면 렌더링 판넬에 9*9=81 부터 큰 순으로 그려지는 졸업 피드백을 감상한다.
- **상태 및 데이터**:
  - `APPEND gs_line 구문을 빼먹고 루프만 돌린 상태` -> 런타임 결과: `gt_gugu is empty. lines = 0. Output NULL` 하이라이트.
- **피드백**: 내부 테이블은 메모리에 다량의 레코드를 보존해 정렬/루프 조작을 가하는 강력한 병기이며, 휘발성을 깨기 위해선 DB 테이블(7장)로 진입해야 함을 각인한다.

### 실수/주의

- **LOOP AT gt_gugu INTO gs_line 을 돌리면서, 루프 내벽 안방에서 APPEND gs_line TO gt_gugu 를 무단 격발**:
  - 루프가 돌면서 테이블 크기를 계속 실시간으로 늘리는 무한 루프 락에 걸려, 램 메모리가 폭사하고 프로세스가 강제 정지당한다.
  - **LOOP 순회 중인 동일 테이블에 대고 APPEND/INSERT 를 가하는 행위는 절대 금지령임을 수호해야 한다.**

### 정리

- **`Internal Table (gt_*)`** 은 동일한 구조의 행(Work Area)을 다량으로 메모리에 적재 보존하는 캐비닛이다.
- **`SORT gt BY field DESCENDING`** 은 램 블록의 행 인덱스 물리 위치를 내림차순 재배치한다.
- **`LOOP AT gt INTO gs`** 를 통해 누적된 다량 레코드를 순차 방출하여 화면에 렌더링한다.
- 내부 테이블은 메모리 휘발성 그릇이므로, 영구 보존을 위해선 다음 7장의 **`Transparent Table (DB 테이블)`** 로 도킹 이전해야 한다.
