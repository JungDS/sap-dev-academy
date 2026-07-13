# CH05_REWRITE - Structure (Local · DDIC) v1

> 목적: `content/abap/CH05`의 5개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH05 전체 설계

CH05의 한 문장 목표는 "Flat Structure 의 Contiguous Byte Block 메모리 배치와 Deep Structure 의 Pointer 참조 할당, MOVE-CORRESPONDING 의 Run-time Name Matching 탐색 오버헤드와 개별 하이픈 대입 성능 차이, .INCLUDE(DD03L 평탄화) 및 .APPEND(표준 사전 안전 확장)의 물리 구조, 그리고 구조체 CLEAR 시의 Roll Area 일괄 제로 소거 정합성을 수립하여 단일 레코드 조작 능력을 확립한다"이다.

IT 비전공자 입문자는 100만 건 대량 데이터 루프 속에서 필드명이 같은 구조체 간 데이터 복사 시 `MOVE-CORRESPONDING` 을 남발해 실시간 이름 매칭 탐색 오버헤드로 시스템 속도를 폭사시키고, SAP 표준 구조에 필드를 직접 쑤셔 넣다 시스템 업그레이드 때 커널 에러와 형상 덮어쓰기 유실 장애를 자초한다.
또한, `LIKE` 구조체 복사 선언 시 원본의 실재 값까지 함께 복사될 것이라 오인하여 전산 정합성을 파괴한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **Flat Contiguous Memory**: C, I, P 등 고정 폭 타입으로 구성되어 램 상에 연속된 바이트 블록으로 적재되어 성능이 극대화되는 Flat 구조체 매커니즘 규명.
2. **Deep Structure Pointer**: STRING 이 포함되어 내부 데이터 대신 힙의 번지 주소를 적재해 포인터 역참조 오버헤드를 유발하는 Deep 구조체 격리 분석.
3. **MOVE-CORRESPONDING 오버헤드**: 런타임 엔진의 필드명 비교 루프 탐색(Name Matching) 비용을 교육하고, 대량 처리 루프에선 하이픈 개별 대입이 성능에 압도적으로 유리함을 명세.
4. **.APPEND 표준 확장 가드**: 표준 Dictionary 원본을 건드리지 않고 꼬리에 커스텀 필드 구조를 안전하게 접착해 릴리즈 업그레이드 시 충돌을 차단하는 `.APPEND` 활용법 교육.
5. **.INCLUDE 평탄화**: 메타데이터 테이블 `DD03L` 상에 대상 구조체의 성분을 쌩 Flat 하게 복제 기입해 `ls-customer` 로 다이렉트 홉 접근하게 돕는 `.INCLUDE` 구조 해부.
6. **CLEAR 일괄 제로 포맷**: 구조체 clear 시, 아바 VM 이 Roll Area 메모리의 하위 필드 데이터 영역을 돌며 일괄 타입별 초기값(0, 공백)으로 밀어버리는 클리어 원리 정비.

---

## CH05-L01 - Local Structure (BEGIN OF ~ END OF)

### 왜 필요한가

우리가 이전 CH04 에서 구구단을 코딩할 때 `gv_dan` (단), `gv_mul` (곱하는 수), `gv_res` (곱셉 결과) 라는 세 변수를 낱개로 굴렸다.
이 세 값은 사실 '구구단 한 줄' 이라는 긴밀한 연관성을 가진 단 하나의 세트 정보다.
- " 낱개 변수 수십 개를 코드 곳곳에 흩뿌려두고 다루면, 서브루틴에 매개변수로 값을 전달하거나 변수를 한 번에 비우고자 할 때 낱개 이름을 전부 손수 적어주어야 해서 코드가 뚱뚱해지고 오타 누락이 쏟아진다."
메모리 상에 흩어진 연관 필드들을 단 하나의 덩어리로 묶고, 하이픈(-) 이름표로 파고들어 조회/수정할 수 있는 전용 복합 바구니가 필요하다.
그 복합 바구니가 바로 **Structure (구조체 / Work Area)** 다.

**C, I, P 고정 폭 타입으로 구성되어 램(RAM) Roll Area 상에 단 한 칸의 틈새도 없이 연속된 쌩 바이트 블록(Contiguous Byte Block)으로 할당되어 속도가 극대화되는 Flat 구조체의 물리적 메커니즘과, TYPES 및 LIKE 선언의 동작 차이를 규명하는 기술**이 필요하다. 그것이 **Local Structure** 의 장악이다.

### 무엇인가

#### 1. Flat Structure (평평한 구조체의 Contiguous Byte Block 할당)
- **Flat Structure (평평한 구조체)**: **구조체 내벽 컴포넌트 타입들이 C, I, P, D, T 처럼 '물리 크기가 고정된 타입' 으로만 구성된 정통 구조체다. 아바 커널은 Flat 구조체를 할당할 때 램 메모리에 파편화 없이 '연속된 바이트 블록' 형태로 주소를 촥 이어서 배정한다. 이로 인해 메모리 간 복사나 데이터베이스 전송 시 한 덩어리로 고속 카피되어 성능이 극대화된다.**
- **Work Area**: 단 1개의 데이터 행(Record)을 담아서 비즈니스 가공을 단행하는 연산용 구조체 그릇의 실무 명칭이다.

#### 2. 하이픈 ( - ) 접근자
- *아바 고유의 컴포넌트 연결 고리표다.*
- 타 언어가 도트(`.`)를 쓰는 것과 달리, 아바는 하이픈(`-`)을 콕 찔러 구조체 내벽의 필드로 진입한다 (예: `gs_line-dan`). 도트를 쓰면 문장이 끝난 것으로 아바가 오역해 컴파일 에러를 뿜는다.

#### 3. TYPES BEGIN OF ~ END OF (구조체 도면)
- 구조체의 성분 형태만 `ty_person` 으로 빚어둔 0바이트 메타 설계 도면이다. 메모리를 먹지 않고 오직 DATA 가 이 스펙대로 변수를 빚기 위해 TYPE 에 적어 소비한다.

#### ⚠️ [ LIKE 구조체 선언 시의 초기값 정합성 제약 ]
- *입문자가 백프로 혼동하는 메모리 복제 함정이다.*
- **`DATA gs_p4 LIKE gs_p1.` 은 `gs_p1` 의 구조와 크기 형틀(Descriptor)만 본뜨는 것일 뿐, `gs_p1` 이 머금고 있는 실시간 데이터 값까지 복사해 오지는 않는다.**
- **이유**: **LIKE 는 선언 구문이므로 런타임에 메모리에 새 집을 짓는 순간, `gs_p4` 내벽의 모든 필드는 타입별 초기값(정수 `0`, 문자 `공백`)으로 깨끗하게 제로 셋업된 채 시작되기 때문이다. 값을 옮기려면 선언 이후에 `=` 대입문을 따로 때려주어야 한다.**

### 어떻게 확인하는가

로컬 구조체를 선언하고 하이픈과 LIKE 복제로 데이터를 가공하는 코드를 검증한다.

```abap
REPORT zhello_structure.

" 1. [★ Flat 구조체 변수 gs_line 선언 - 램에 연속된 바이트 블록으로 정적 적재!]
DATA: BEGIN OF gs_line,
        dan    TYPE i,
        mul    TYPE i,
        result TYPE i,
      END OF gs_line.

" 2. [ 하이픈(-) 접근자로 구조체 내벽 컴포넌트 채우기 ]
gs_line-dan    = 2.
gs_line-mul    = 3.
gs_line-result = gs_line-dan * gs_line-mul.

" 3. [ LIKE 로 gs_line 구조를 그대로 본따서 gs_twin Work Area 창조! ]
"    ( 주의: gs_twin 내의 dan, mul, result 는 복제 순간 0 으로 초기화된 상태! )
DATA gs_twin LIKE gs_line. 

gs_twin-dan = 3.
gs_twin-mul = 5.
gs_twin-result = gs_twin-dan * gs_twin-mul.

WRITE: / 'gs_line 결과:', gs_line-dan, 'x', gs_line-mul, '=', gs_line-result,
       / 'gs_twin 결과:', gs_twin-dan, 'x', gs_twin-mul, '=', gs_twin-result.
```

#### 체험/시뮬레이터 설계 (Flat/Deep 메모리 격리판)
- **프로세스 플로우**:
  1. 학습자가 [Roll Area 메모리 기판] 과 [Flat 구조체 gs_line 칩] 을 본다.
  2. gs_line 칩을 꽂자, 램 기판에 4바이트(i) + 4바이트(i) + 4바이트(i) = 총 12바이트 크기의 메모리가 [단 한 칸의 빈틈도 없이 연속된 파란 블록] 으로 촥 이어서 칠해진다.
  3. [LIKE 복제 칩] 을 꽂자, 옆에 12바이트 크기의 흰색 빈방 gs_twin 이 빚어진다.
  4. 데이터 전송 버튼을 누르자 12바이트 뭉텅이가 0.00001초 만에 gs_twin 으로 초고속 슬라이딩 복사 완료되는 메모리 렌더링 피드백을 감상한다.
- **상태 및 데이터**:
  - `구조체 필드 접근 시 도트(.)를 적어 컴파일한 상태` -> 런타임 결과: `Syntax error. Statement terminated unexpectedly` 하이라이트.
- **피드백**: Flat 구조체는 연속된 바이트 블록이며 하이픈(-)만이 내벽 필드로 진입하는 정식 포트임을 인지한다.

### 실수/주의

- **구조체 선언 시 END OF 뒤에 엉뚱한 변수 이름을 적어 닫거나 지시어 짝을 미매칭**:
  - `END OF gs_other.` 처럼 꼬리를 닫아버리면 컴파일러는 머리 `gs_line` 과 짝이 안 맞는다며 즉각 빌드를 차단한다.
  - **머리와 꼬리의 명칭 짝을 완벽히 수호해야 한다.**

### 정리

- 구조체(Work Area)는 연관성 높은 낱개 필드를 단 하나의 변수로 묶는 메모리 그릇이다.
- 고정 폭 타입으로 구성된 **`Flat Structure`** 는 램 상에 **`연속된 바이트 블록`** 으로 배정되어 성능이 우수하다.
- 구조체 내벽 필드 접근자는 오직 **`하이픈 (-)`** 이다.
- **`LIKE`** 선언은 껍데기 구조만 복제할 뿐, **`내용물 값은 복사되지 않고 0/공백으로 초기화`** 된다.

---

## CH05-L02 - DDIC Structure

### 왜 필요한가

로컬 구조체(`BEGIN OF`)를 빚는 법을 배웠다.
이번에는 이 구조체 모양을 프로그램 하나를 넘어, 테이블 설계, 함수 파라미터, 그리고 전사 리포트 화면과 '공유(Share)' 해야 하는 아키텍처 결선이 장벽이다.
- " 회원 정보 구조(`NAME`, `AGE`, `AMT`)를 전역으로 올려서 모든 개발자가 공통으로 쓰게 배포하고 싶다.
이를 위해 SE11 에서 ZST_PERSON 구조체를 개설할 때, 왜 각 필드를 쌩 기본 타입이 아닌 Data Element 로 물려 결선해야 하는가?"
그리고, 전역 구조체를 빚어놓고 DATA 선언 시 이 뼈대를 변수 타입으로 불러다 쓸 때, 도메인(Domain)을 쌩으로 불러다 쓰는 훼손과 대조되는 DDIC 타입 통신법을 숙지해야 빌드 에러를 방어한다.

**SE11 에서 ZST_PERSON 구조체를 개설해 DD03L 메타 테이블에 등록하고, 각 컴포넌트에 Data Element 를 배선해 라벨/도움말을 통째 상속시키며, Domain 직접 사용 제한의 DDIC 명세 룰을 수호하는 기술**이 필요하다. 그것이 **DDIC Structure 의 설계**다.

### 무엇인가

#### 1. DDIC Structure (전역 구조체 - ZST_*)
- **특정 프로그램 내벽에 갇혀 있지 않고, 전사 데이터 사전(DDIC)에 활성화되어 존재함으로써 모든 테이블 필드와 프로그램 변수 타입이 가져다 쓸 수 있는 공용 전역 구조체다. (네이밍 규칙 ZST_ 나 YST_ 로 시작한다.)**

#### 2. Component 와 Data Element 결선
- **ZST_PERSON 을 빚을 때, `NAME` 필드의 타입(Typing)으로 쌩 `CHAR 20` 을 박아선 안 된다. 반드시 전역 Data Element 인 `ZDE_NAME` 을 배선해 꽂아야 한다. 그래야 나중에 이 구조체를 얹어 화면을 그릴 때 '이름' 이라는 한글/다국어 Field Label 과 F1 문서 도움말이 쌩 코딩 없이 자동으로 밀려 상속되는 정합성을 보장받는다.**

#### 🧭 [ DDIC 사용 가능 타입과 도메인 거부 명세 ]
- *DATA 변수를 선언할 때, TYPE 뒤에 적을 수 있는 사전 객체는 엄격히 분류 통제된다.*

```text
[TYPE 뒤에 적을 수 있는 합격 객체 (✅)] :
   - Data Element (ZDE_*) : 단일 필드 변수 셋업용
   - Structure (ZST_*) : 1행 복합 구조체 변수(Work Area) 셋업용
   - Transparent Table (ZTABLE) : 테이블 한 줄 뼈대를 그대로 복사해 1행 그릇 셋업용
   - Table Type (ZTTY_*) : 여러 행을 담는 내부 테이블 변수 셋업용 (CH06)
   │
[TYPE 뒤에 적는 순간 컴파일러가 강제 차단하는 기격 객체 (❌)] :
   - Domain (ZDO_*) : 도메인은 오직 Data Element 의 바닥 기술 속성일 뿐, 변수의 TYPE 뒤에 직접 적을 수 없다.
```

### 어떻게 확인하는가

SE11 에서 ZST_PERSON 전역 구조체를 개설하고 프로그램이 이를 소비하는 단계를 검증한다.

```text
[1단계] SE11 Data Type 전역 기지 진입 :
   - Data Type : ZST_PERSON (ZST_ 네임스페이스 규칙 수호!) -> Create 클릭!
   - 팝업창에서 [Structure] 선택 낙찰!
   
[2단계] 컴포넌트 데이터 엘리먼트 배선 :
   - Component : PER_ID   -> Typing : zde_perid (인간의 식별 Data Element 결선!)
   - Component : NAME     -> Typing : zde_name
   - Component : AMOUNT   -> Typing : zde_amount
   - [저장] 클릭 -> 메타데이터가 DB 시스템 테이블 DD03L (Structure 성분 대장) 에 Inactive 적재 완료!
   
[3단계] 활성화 및 프로그램 소비 :
   - [활성화 (Ctrl+F3)] 격발 -> 'Active' 점등 완료!
   - 아바 에디터(SE38) 소스에서 `DATA gs_p TYPE zst_person.` 선언 격발 -> 에러 없이 8바이트 압축 10진수 및 문자 구조체 생성 성공!
```

#### 체험/시뮬레이터 설계 (Flat/Deep 메모리 격리판)
- **프로세스 플로우**:
  1. 학습자가 [ZST_PERSON 구조체 판넬] 과 [DD03L 테이블 목록] 을 본다.
  2. 판넬에 `PER_ID`, `NAME` 필드를 얹자, [DD03L 테이블] 에 두 필드 성분이 기입된다.
  3. 이때 PER_ID 의 타입을 도메인 [ZDO_PERID] 로 직접 꽂으려 대자, [Domain direct usage blocked] 적색 불이 켜지며 거부된다.
  4. [ZDE_PERID Data Element] 로 칩을 교환해 꽂자, 런타임 캐시가 회전하며 Active 초록등이 들어오는 타입 결선 피드백을 감상한다.
- **상태 및 데이터**:
  - `구조체 컴포넌트 타입을 지정하면서 활성화를 누락하고 프로그램을 돌린 상태` -> 런타임 결과: `Syntax error. Structure ZST_PERSON is not active` 하이라이트.
- **피드백**: 전역 구조체는 SE11 에서 Data Element 를 매칭해 활성화해야 비소로 프로그램이 안전 상속할 수 있음을 체득한다.

### 실수/주의

- **구조체 컴포넌트 명칭을 ZTABLE 의 필드명과 완전히 다르게 맘대로 지어두고, 나중에 배울 DB 저장 시 matching 에러를 뿜으며 소스가 깨지는 훼손 유발**:
  - **실무에서 테이블에 인서트할 버퍼 구조체를 빚을 때는, ZTABLE 의 필드 물리 명칭과 1:1 완벽하게 철자 매칭시켜 설계하는 것이 무조건적인 안전 룰이다.**

### 정리

- 여러 프로그램이 공용하는 구조 타입은 **`DDIC Structure (ZST_*)`** 로 빚어 올린다.
- 각 필드는 라벨과 F1 문서를 물려받도록 반드시 **`Data Element`** 로 결선한다.
- 구조체 성분 정보는 사전 시스템 테이블인 **`DD03L`** 에 적재 보존된다.
- **`Domain`** 은 컴파일러 제약 상 변수 선언 시 TYPE 지시어 뒤에 직접 기재가 차단된다.

---

## CH05-L03 - 구조 재사용 — 중첩 · .INCLUDE · .APPEND

### 왜 필요한가

전역 구조체 셋업을 완수했다.
이번에는 "생성자 ID, 생성일자, 생성시간" 이라는 공통 감사 필드(Audit fields) 세트를 모든 테이블과 구조체에 매번 반복 코딩해야 하는 '형상 중복' 이 장벽입니다.
- " 공통 필드 세트를 다른 구조체 안에 끼워 넣으려 한다. 
중첩 구조(Nested)와 `.INCLUDE` 로 펼쳐 담는 것은 접근 시 `-` 하이픈 사용과 램 적재 구조에서 어떤 물리적 차이가 있는가?"
그리고, SAP 이 제공하는 표준 테이블(예: SFLIGHT)에 내 커서 필드를 얹어 확장하고 싶은데, 원본을 그냥 도려내 고치려다 형상 덮어쓰기로 소스가 소멸하는 대형 참사를 예방해야 합니다.

**중첩 구조의 2단 하이픈 접근자와, MTE 확장인 `.INCLUDE` 의 `DD03L` 평탄화 적재 원리, 그리고 표준을 다치지 않고 안전 확장하는 `.APPEND` (Append Structure) 방패 기술**이 필요합니다. 그것이 **구조 재사용**의 완수입니다.

### 무엇인가

#### 1. Nested Structure (중첩 구조체 - 구조 속의 구조)
- **Deep Structure (깊은 구조체 - Pointer 참조)**: **구조체 내벽 컴포넌트 타입에 다른 구조체(ZST_ADDR)를 통째로 할당한 구조다. 램 상에 바이트가 연속 배정되지 않고, 내부 ZST_ADDR 의 데이터가 저장된 힙의 포인터 번지(Pointer Reference) 주소 값을 적재하므로, 접근 시 `gs_order-head-customer` 처럼 2단 하이픈(`-` 2번)으로 파고들어야 하는 물리적 오버헤드를 동반한다.**

#### 2. `.INCLUDE` (펼쳐 담기 - 평탄화 기작)
- **Flat 평탄화**: **DDIC Structure 에 대고 다른 구조체를 `.INCLUDE` 로 포함하면, 포함 대상 구조체의 모든 필드가 현재 구조체(`DD03L`) 상에 직접 타이핑해 넣은 것처럼 평평하게(Flat) 펴진 채 복제 적재된다.**
- **접근**: 복잡한 2단 `-` 가 필요 없이, `gs_order-customer` 로 다이렉트 1단 접근하여 힙 포인터 역참조 비용 없이 Flat 구조체 고속 연산에 기여한다.

#### ⚠️ [ .APPEND Structure 표준 확장 락 회피 명세 ]
- *SAP 표준을 튜닝하는 Basis 형상의 절대적 방패 장치다.*
- **Append Structure (.APPEND)**: **표준 테이블(SFLIGHT)이나 표준 구조체의 꼬리에 내 전용 Z필드들을 덧붙이는 전용 확장 개체다. 표준 원본 DB 카탈로그를 직접 편집하여 필드를 쑤셔 넣으면, 매년 단행되는 SAP 패키지 시스템 업그레이드(Upgrade) 시 원본이 쌩 덮어쓰여 내 수정이 영구 삭제되고 DB 정합성이 깨져 전산망이 폭사한다. Z로 시작하는 `.APPEND` 구조체를 따로 빚어 표준 꼬리에 도킹 장착해 두면, 업그레이드가 원본을 덮어쓰더라도 내 접착 부착물은 100% 무결 보존되어 형상 충돌이 영구 차단된다.**

### 어떻게 확인하는가

중첩 구조와 .INCLUDE, .APPEND 가 빚어진 물리 단계를 검증한다.

```abap
REPORT zhello_nested.

" 1. [ 로컬 Nested 중첩 구조체 선언 ]
"    gs_order 내벽에 head 라는 컴포넌트가 다른 구조체 zst_person 을 통째 삼킴!
DATA: BEGIN OF gs_order,
        head TYPE zst_person, " 중첩(Nested) 발생!
        qty  TYPE i,
      END OF gs_order.

" 2. [ 2단 하이픈(-) 포인터 역참조 진입으로 값 기입 ]
gs_order-head-name = '정훈영'. 
gs_order-qty       = 5.

" 3. [ .INCLUDE 로 평탄화된 전역 구조체 zde_booking 선언을 가정 ]
"    ( zde_booking 안에 .INCLUDE zde_audit 이 녹아 있어 1단으로 바로 접근! )
DATA gs_book TYPE zbooking. 

gs_book-customer   = '정훈영'.
gs_book-created_by = sy-uname. " gs_book-audit-created_by 가 아님! 1단 통과!

WRITE: / '중첩 접근 고객:', gs_order-head-name,
       / 'INCLUDE 접근 생성자:', gs_book-created_by.
```

#### 체험/시뮬레이터 설계 ( .APPEND 확장 가드 기어)
- **프로세스 플로우**:
  1. 학습자가 [SAP 표준 SFLIGHT 테이블 철궤] 와 [내 커스텀 Z필드 칩] 을 본다.
  2. [Z필드 칩] 을 철궤 본체에 직접 용접하려 대자, "Standard DB modify blocked! Risk of source overwrite during upgrade!" 적색 자물쇠가 걸려 차단된다.
  3. [Append Structure 만들기] 레버를 당겨 `ZAP_SFLIGHT` 라는 [접착 확장 가드 기어] 를 생성한다.
  4. 커스텀 칩을 기어에 장착하고 철궤 꼬리에 접착 도킹하자, 표준 철궤를 다치지 않고 100% 무결 결선되어 초록불이 들어오는 확장 피드백을 감상한다.
- **상태 및 데이터**:
  - `Nested 구조체에서 하이픈을 1단 gs_order-customer 로만 적어 접근을 시도한 상태` -> 런타임 결과: `Syntax error. Component "CUSTOMER" is unknown in gs_order` 하이라이트.
- **피드백**: 중첩 구조는 2단 하이픈으로 주소를 파고들며, 표준 확장은 시스템 생존을 위해 `.APPEND` 방패가 의무임을 터득한다.

### 실수/주의

- **표준 테이블 확장 시 .APPEND 구조체 내부에, 하필이면 SAP 사가 나중에 표준 패키지에 신규 추가할 동일한 이름의 필드(예: discount)를 Z접두어 없이 그대로 작명해 삽입**:
  - 나중에 SAP 업그레이드 시 동일 필드명이 충돌해 전체 SFLIGHT DB 테이블 활성화가 차단되고 시스템이 뇌사 덤프 상태에 빠진다.
  - **.APPEND 구조체의 모든 필드명은 무조건 `ZZ` 나 `YY` 접두어(예: ZZDISCOUNT)를 매겨 작명하는 것이 충돌을 피하는 철칙 규칙이다.**

### 정리

- 구조체를 컴포넌트로 품는 **`중첩 구조 (Nested)`** 는 주소 포인터 참조를 타며 **`2단 하이픈 (-)`** 으로 접근한다.
- **`.INCLUDE`** 는 포함된 구조 성분을 `DD03L` 상에 다 평평하게 펼쳐 얹어 **`1단 다이렉트 접근`** 을 제공한다.
- 표준 테이블/구조체의 커스텀 확장은 형상 유실 예방을 위해 무조건 **`.APPEND` (Append Structure)** 방패를 꼬리에 도킹한다.
- APPEND 필드는 미래 표준 충돌을 막기 위해 **`ZZ`** 나 **`YY`** 접두어로 이름을 짓는다.

---

## CH05-L04 - 구조체 다루기

### 왜 필요한가

구조체의 재사용 배선까지 완료했다.
이제 동일 명칭 필드를 매핑하는 '구조체 간 복사' 와 '메모리 일괄 포맷' 의 성능이 마지막 장벽입니다.
- " 소스 구조체 `gs_source` 의 필드 정보를 타깃 구조체 `gs_target` 으로 복사하려 한다.
동명 필드를 알아서 긁어다 넣어주는 편리한 `MOVE-CORRESPONDING` 은 내부적으로 어떤 성능 탐색 오버헤드가 발생하며, 루프 안에서 개별 하이픈 대입과 연산 속도가 구체적으로 어떻게 차이 나는가?"
동명 필드가 5개뿐인 구조체 복사를 대량 루프 10만 건 안에서 편리하다는 이유로 `MOVE-CORRESPONDING` 으로 도배하면, 아바 런타임 엔진이 매 회차마다 필드명 일치 여부를 메타 대조하느라 CPU 리소스를 낭비해 프로세스를 고사시킨다.

**MOVE-CORRESPONDING 의 Run-time Name Matching 탐색 오버헤드 물리적 실체와, 개별 하이픈 대입 복사 권장 규칙 및 CLEAR 를 통한 구조체 일괄 초기화(Roll Area 제로 소거) 기술**이 필요합니다. 그것이 **구조체 데이터 핸들링**의 완수입니다.

### 무엇인가

#### 1. MOVE-CORRESPONDING gs_source TO gs_target (실시간 이름 매칭 복사)
- **Run-time Name Matching (실시간 이름 매칭 탐색)**: **이 구문은 편리해 보이지만, 런타임 엔진이 매번 `gs_source` 의 컴포넌트 명칭 테이블과 `gs_target` 의 명칭 테이블을 실시간 루프 대조하여 '동일 철자 이름' 을 가진 필드를 하나하나 서치해 매칭하는 무거운 문자열 탐색 오버헤드를 수반한다. 필드가 3개로 적더라도, 10만 건 루프 내에서 난사하면 CPU 연산 시간이 개별 대입보다 최대 10배 이상 치솟아 성능 병목을 일으킨다.**
- **해결**: 필드 이름이 1:1 매칭되는 실무 코딩에서는 귀찮더라도 **`gs_target-name = gs_source-name`** 처럼 하이픈 개별 대입을 적는 것이 컴파일 타임에 물리 메모리 주소지가 직접 바인딩되어 백배 고속 실행된다.

#### 2. 구조체 CLEAR (Roll Area 일괄 제로 포맷)
- **`CLEAR gs_person.` 을 쏘면, 아바 VM 은 구조체 내벽의 필드 주소 영역을 차례대로 돌며, 각 필드의 타입에 규격화된 초기값(정수 `0`, 문자 `공백`, P는 `0.00`)으로 바이트 데이터를 포맷 소거한다.** (내부 필드 구조가 깨지지 않고 맑게 초기화 상태로 복구된다.)

### 어떻게 확인하는가

MOVE-CORRESPONDING 과 하이픈 개별 대입의 비교 검증 및 CLEAR 소거 단계를 확인한다.

```abap
REPORT zhello_structure_move.

TYPES: BEGIN OF ty_src,
         id    TYPE i,
         name  TYPE string,
         phone TYPE c LENGTH 15,
       END OF ty_src.

TYPES: BEGIN OF ty_tgt,
         name  TYPE string,
         id    TYPE i,
         email TYPE string,
       END OF ty_tgt.

DATA: gs_source TYPE ty_src,
      gs_target TYPE ty_tgt.

gs_source-id    = 1001.
gs_source-name  = '정훈영'.
gs_source-phone = '010-1234-5678'.

" 1. [★ 실시간 이름 매칭 복사 격발 - id 와 name 만 복사되고 phone/email 은 무시됨!]
"    (주의: 대량 루프 내에서는 탐색 오버헤드가 발생함!)
MOVE-CORRESPONDING gs_source TO gs_target.

" 2. [★ 고속 처리 권장: 컴파일러가 주소를 직접 바인딩하는 하이픈 개별 대입]
"    (대량 루프 내에서는 이 쌩 대입이 O(1) 로 압도적 속도 우위 수호!)
" gs_target-id   = gs_source-id.
" gs_target-name = gs_source-name.

WRITE: / 'Target ID:', gs_target-id,
       / 'Target Name:', gs_target-name,
       / 'Target Email:', gs_target-email. " Source 에 없어서 초기값 공백 상태 유지!

" 3. [구조체 일괄 제로 포맷 소거 기동]
CLEAR gs_target. " ID=0, Name='', Email='' 복구 완료!
```

#### 체험/시뮬레이터 설계 (MOVE-CORRESPONDING 이름 매칭 레이서)
- **프로세스 플로우**:
  1. 학습자가 [gs_source 필드판] 과 [gs_target 필드판] 을 본다.
  2. [MOVE-CORRESPONDING 칩] 을 구동한다. [실시간 검색 돋보기] 가 켜지더니 target 의 id 가 source 의 어디에 매칭되는지 철자를 하나하나 훑으며 O(N) 서치를 단행해 복사하느라 시간이 걸리는 렌더링을 본다.
  3. [하이픈 개별 대입 칩] 으로 교체한다. 돋보기 스캔 없이, [메모리 전선] 이 주소끼리 다이렉트로 찰딱 연결되어 데이터를 순간 이동 복사 완료하는 고속 피드백을 감상한다.
- **상태 및 데이터**:
  - `동일하지 않은 구조체끼리 MOVE-CORRESPONDING 대신 일반 gs_target = gs_source 통째 대입을 시도한 상태` -> 런타임 결과: `Syntax error. Structures are not compatible` 하이라이트.
- **피드백**: 이름 복사는 편리함 뒤에 실시간 탐색 비용이 상주하므로, 대량 루프에서는 하이픈 개별 결선이 성능의 답임을 깨닫는다.

### 실수/주의

- **구조체 내의 필드 중 일부만 비우고 싶어서 CLEAR gs_target-name 을 해야 하는데, 통째 CLEAR gs_target 을 갈겨서 엄뚱한 ID 와 결제 금액까지 다 초기화 소거해 버리는 실수**:
  - 다른 필드 값이 증발해 전산 대조 시 합산이 펑크 나는 버그를 낳는다.
  - **특정 필드만 비울 때는 반드시 하이픈 지칭 지점을 정교하게 쪼개어 수호해야 한다.**

### 정리

- **`MOVE-CORRESPONDING`** 은 이름이 같은 필드만 찾아 매핑 복사해 주지만, **`실시간 이름 매칭 탐색`** 비용이 발생한다.
- 대량 루프 정산 연산 속에서는 이 탐색 오버헤드를 억제하기 위해 **`하이픈 개별 대입`** 을 사용해야 성능을 사수한다.
- 구조체 전체 메모리를 타입별 초기값으로 소거할 때는 **`CLEAR`** 구문으로 포맷한다.

---

## CH05-L05 - 구구단 한 줄 = Structure (캡스톤)

### 왜 필요한가

구조체의 핸들러 기작까지 완수했다.
이제 배운 지식을 종합하여, 구구단 3대 변수를 'gs_line' 구조체 1개로 포장하는 캡스톤 실습 완수가 최종 관문입니다.
- " 구구단 연산 시 낱개 변수 gv_dan, gv_mul, gv_res 를 쓰던 것들을 gs_line 구조체로 교체해 묶었다. 
이 캡스톤 코드를 돌릴 때, 디버거 화면에서 gs_line 을 올바르게 펼치고, 반복 루프마다 구조체 내벽 필드가 갱신되는 정합성을 어떻게 점검하는가?"
이 구조체 캡스톤을 완수해 보아야만, 다음 6장에서 배울 '구구단 전체 판때기를 메모리에 동시에 쌓는 그릇(Internal Table)' 으로 나아가는 징검다리를 이해할 수 있습니다.

**구구단 세 변수를 단일 구조체 gs_line (Work Area) 으로 묶어 루프 연산 처리하고, BREAK-POINT 를 걸어 디버거 세션 락 상태에서 gs_line 컴포넌트 3칸이 함께 갱신되는 비주얼을 확인하는 기술**이 필요합니다. 그것이 **구구단 Structure 캡스톤**의 완수입니다.

### 무엇인가

#### 1. 구구단 Structure 캡스톤
- 기존에 분리 낱개로 놀던 세 변수(`gv_dan`, `gv_mul`, `gv_res`)를 단 하나의 구조체 **`gs_line` (Work Area)** 묶음으로 엮음으로써, 코드가 "구구단 한 줄" 이라는 정교한 레코드 엔티티를 다룬다는 객체 지향적(Object-like) 가독성과 모듈 구조의 무결성을 획득한다.

#### 2. 디버거 내벽의 Structure 펼치기
- **SE38 에디터에서 `BREAK-POINT.` 를 쏘아 디버거를 기동하고, Variable 창에 `gs_line` 을 더블 클릭해 올리면, 단순 텍스트가 아닌 `dan` / `mul` / `result` 의 3칸짜리 물리 테이블 서랍장 비주얼이 열려, F5 단계마다 서랍 속 데이터 비트가 요동치는 정합성을 눈으로 직접 스캔할 수 있다.**

#### ⚠️ [ Work Area 의 1행 한계와 다음 챕터 징검다리 ]
- **`gs_line` 은 오직 '한 행 (1 Record)' 만 담을 수 있는 얇은 판때기(Work Area)다.**
- **동작 한계**: **구구단 루프가 1바퀴 돌 때마다, 이전 회차에 구워둔 구구단 2*3=6 정보는 2*4=8 정보로 덮어쓰여 메모리 상에서 영구 소멸한다.**
- **불편 직면**: **만약 구구단 81줄 결과 전체를 메모리에 덮어쓰지 않고 동시에 쌩으로 들고 있다가, 내림차순 정렬하거나 출력 필터링을 하고 싶다면? 이 판때기 구조체(gs_line)만으로는 불가능하며, 동일한 뼈대를 가진 판때기를 여러 개(수천 행) 램에 적재할 수 있는 특수 다행 그릇인 Internal Table (내부 테이블 - CH06)로 승격되어야만 해결됨을 입증한다.**

### 어떻게 확인하는가

구조체로 포장된 구구단 코드를 기동하고 디버거로 검증한다.

```abap
REPORT zhello_structure_capstone.

" 1. [★ 구구단 한 줄 엔티티 gs_line 구조체 선언]
DATA: BEGIN OF gs_line,
        dan    TYPE i,
        mul    TYPE i,
        result TYPE i,
      END OF gs_line.

gs_line-dan = 2. " 2단 선고

DO 9 TIMES.
  gs_line-mul    = sy-index.
  gs_line-result = gs_line-dan * gs_line-mul.
  
  " 2. [★ 디버거 격발 BREAK-POINT: F5 돌며 dan/mul/result 갱신 Watch!]
  " BREAK-POINT. 
  
  WRITE: / gs_line-dan, 'x', gs_line-mul, '=', gs_line-result.
ENDDO.
```

#### 체험/시뮬레이터 설계 (gs_line 구조체 확장 시뮬레이션)
- **프로세스 플로우**:
  1. 학습자가 [gs_line 서랍장 (3칸)] 과 [Fiori Elements 장표] 를 본다.
  2. [F5] 를 치자, `gs_line-mul` 칸이 1에서 2로 변하고 `result` 칸이 4로 계산되어 들어온다.
  3. 다음 바퀴를 돌리자, 서랍 안의 2*2=4 정보가 싹 지워지고 2*3=6 으로 덮어쓰여 교체된다.
  4. 이때 "어? 이전 2*2=4 데이터가 다 날아갔네?" 라는 팝업 문구와 함께 [다중 적재 캐비닛 Internal Table = OFF] 경고등이 번쩍이며 다음 6장으로 이정표를 안내하는 정합성 피드백을 감상한다.
- **상태 및 데이터**:
  - `구조체 필드 값을 WRITE 시점에 gs_line-result 가 아닌 쌩 gv_res 변수로 적어 빌드한 상태` -> 런타임 결과: `Syntax error. The name "gv_res" is unknown` 하이라이트.
- **피드백**: 구조체는 단 1행(Work Area)만을 조작하는 단위이며, 다행 축적을 위해선 Internal Table 로 가야 함을 뼈저리게 인식한다.

### 실수/주의

- **구구단 구조체 연산 시 gv_dan 캐시를 생략한 채 gs_line-dan 에 직접 sy-index 를 얹어 안쪽 루프를 구동하다 데이터가 덮어씌워져 파손되는 루프 뇌사**:
  - 앞 4장에서 배운 **`sy-index` 덮어쓰기 유실 제약**은 구조체 컴포넌트를 쓸 때도 똑같이 작동하므로, 중첩 시에는 반드시 단수 정보를 별도 백업 캐싱 수호해야 한다.

### 정리

- **`gs_line`** 구조체 묶음 설계를 통해, 구구단 3대 변수를 '한 줄 레코드' 의미로 포장 완료한다.
- 디버거 variable 모니터를 통해 구조체 내부 필드들이 **`서랍장 구조`** 로 묶여 요동치는 램 상태를 직시할 수 있다.
- 구조체(Work Area)는 **`단 1행의 한계`** 가 있어, 이전 루프 정보는 덮어써져 영구 소멸된다.
- 81줄 전체를 보존하고 다량 핸들링하기 위해서는 다음 챕터의 **`Internal Table (내부 테이블)`** 로 진입해야 함을 명세한다.
