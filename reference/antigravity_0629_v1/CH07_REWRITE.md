# CH07_REWRITE - Transparent Table (SE11) v1

> 목적: `content/abap/CH07`의 3개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH07 전체 설계

CH07의 한 문장 목표는 "Transparent Table 의 DDL Processor 1:1 물리 DB 스토리지 동기화, MANDT 필드의 Open SQL Implicit Client Filtering 묵시적 자동 주입 격리, Technical Settings(APPL0/1/2 및 Initial Extent Size Category 단편화 가드)의 인프라 힌트 기작, 그리고 DD02L/DD03L 사전 정보 적재 대장의 물리 구조를 수립하여 영속성 데이터 저장 설계 능력을 완성한다"이다.

IT 비전공자 입문자는 프로그램이 종료되면 램 상에 상주하던 내부 테이블의 81행 데이터가 공중 분해되는 메모리 휘발성에 직면하여 좌절하고, 데이터베이스 테이블에 100만 건 정산 마감 데이터를 밀어 넣을 때 클라이언트(`MANDT`) 분리 세션 장치가 수동으로 걸려야 하는지 몰라 아바 멀티테넌트 장부 정합성을 해친다.
또한, 활성화되어 실시간 영업 트랜잭션이 폭주 중인 운영 DB 테이블의 컬럼 속성을 무단 변경해 DB 무결성을 파괴하고, 저장 속성에 따른 테이블스페이스 물리 공간 분배 힌트를 생략해 디스크 병목을 일으킨다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **DDL Processor 1:1 Sync**: SE11 활성화 격발 시, 아바 사전 정의를 SQL 로 번역해 물리 DB 에 디스크 레코드를 굴착하는 DDL Processor 기작 규명.
2. **Implicit Client Filtering**: `MANDT` 필드가 꽂혀 있을 때, Open SQL 번역기가 `WHERE MANDT = sy-mandt` 를 묵시적으로 강제 주입해 방(Client)별 세션을 분리하는 기작 명세.
3. **APPL0/1/2 Physical Segregation**: 마스터(APPL0), 트랜잭션(APPL1), 설정(APPL2)으로 구분하여 디스크의 물리 테이블스페이스를 격리하는 인프라 힌트 기술.
4. **DD02L/DD03L System Tables**: 데이터 사전 명세가 보존되는 DB 카탈로그 테이블 DD02L(헤더)과 DD03L(컴포넌트 리스트) 메타데이터 아카이브 해부.
5. **Table Contents Create Entries**: SE11 유틸리티 내의 데이터 삽입 기능과 TMG(유지보수 화면)를 경유한 소량 손입력 검증.
6. **Transparent vs Structure vs Table Type**: 휘발성 메모리 1행 그릇(gs), 휘발성 다행 그릇(gt) 그리고 영속성 디스크 저장소(Table) 삼각 정합성 대조.

---

## CH07-L01 - Transparent Table 생성 (SE11)

### 왜 필요한가

우리가 이전 CH06 에서 구구단 81행 전체를 내부 테이블 `gt_gugu` 에 담아 정렬하고 루프로 돌렸다.
하지만 이 gt_gugu 는 프로그램 F8 실행이 종료되는 그 찰나, 램(RAM)의 Roll Area 블록과 함께 공중분해되어 흔적도 없이 사라져 버렸다.
- " 매번 프로그램을 새로 실행할 때마다 81행을 CPU 가 새로 계산하게 하지 않고, 어제 저장해 둔 결과를 오늘 아침 출근해서 그대로 꺼내 쓰고 싶다. 
그리고 내가 계산한 구구단을 옆 자리 정훈영 대리도 함께 접속해 조회하게 하려면 어떻게 해야 하는가?"
프로그램이 꺼지더라도 전산실 중앙 하드디스크 디렉토리(Storage)에 데이터를 파일 장부 형태로 기록 보존하여 영속성을 부여해야 한다.
그 영속성의 실체이자 디스크 물리 보관소가 **Transparent Table (투명 테이블)** 이다.

**사전 명세를 DBMS 용 DDL 로 번역해 물리 스토리지를 굴착 도킹하는 DDL Processor 의 작동 기작과, MANDT 필드의 묵시적 클라이언트 필터링(Implicit Client Filtering), 그리고 Technical Settings 의 디스크 물리 격리 원천 기술**이 필요하다. 그것이 **Transparent Table 생성**의 완수다.

### 무엇인가

#### 1. Transparent Table (투명 테이블의 1:1 물리 매핑)
- **1:1 물리 동기화**: **아바 사전(DDIC)에 정의한 테이블 명세와, 실제 데이터베이스(HANA DB 등)에 장착되는 물리 테이블은 완전 1:1 로 동기화된다. 
- **DDL Processor 작동 원리**: SE11 에서 테이블 생성 후 '활성화(Ctrl+F3)' 를 격발하는 바로 그 찰나, 아바 커널의 DDL Processor 가 깨어나 `CREATE TABLE ZGUGUDAN ( MANDT VARCHAR(3) ... )` 이라는 SQL DDL 문을 물리 DBMS 로 번포 방출한다. DBMS 는 이를 수신해 하드디스크의 미할당 섹터 공간을 뚫어 물리 공간을 굴착 확보한다. (Structure 는 램 상에 정의만 남지만, 테이블은 하드디스크에 실재 기지가 구축된다.)**

#### 2. MANDT (Implicit Client Filtering - 묵시적 클라이언트 격리)
- *아바 커널 Open SQL 엔진이 수행하는 고수준 격리 보안 배선이다.*
- 테이블 첫 번째 키 컬럼으로 **`MANDT`** (클라이언트 - 3자리 문자) 필드를 선언해 두는 것이 전사 철칙이다. 
- **동작 원리**: **개발자가 프로그램에서 `SELECT * FROM zgugudan.` 이라고만 쿼리를 날려도, 아바 커널의 번역기가 DBMS 로 SQL 을 쏠 때 `WHERE MANDT = '현재로그인한클라이언트번호'(예: 100)` 조건절을 묵시적 자동으로 강제 주입(Implicit Client Filtering)하여 SQL 을 재구성한다. 이로 인해 개발자가 손대지 않아도 100번 방 사용자는 200번 방 데이터를 엿볼 수 없도록 논리 세션이 격리 보호된다.**

#### 🧭 [ Technical Settings 의 물리 공간 격리 명세 ]
- *테이블 활성화 전, 디스크의 단편화와 경합을 제어하기 위해 시스템에게 주는 힌트다.*

```text
[1] Data Class (데이터 클래스 - APPL0 / APPL1 / APPL2) :
   - APPL0 (Master Data) : 기준 코드나 마스터 등 변경 주기가 적은 테이블. 
     (DB 가 읽기 전용 성능에 유리한 물리 테이블스페이스 구역에 몰아넣음.)
   - APPL1 (Transaction Data) : 매출이나 전표 등 매초 인서트/딜리트가 폭주하는 테이블.
     (DB 가 쓰기 분산에 최적화된 독립 물리 디스크 영역에 배치해 경합을 방어.)
   - APPL2 (Configuration Data) : 시스템 셋업이나 환경 설정 등 정적인 테이블.
     (캐시 적재가 최우선시되는 고성능 메모리 캐시 스페이스에 도킹.)
   │
[2] Size Category (크기 범주 - 0 ~ 4) :
   - 테이블이 초기 가동 시 획득할 디스크 공간의 최소 크기인 Initial Extent (초기 세그먼트) 크기를 가이드하는 값이다.
   - 0 을 주면 작은 크기로 시작하고, 대용량 트랜잭션 테이블인데 0 을 줘버리면 데이터가 늘어날 때마다 디스크 공간을 추가 획득하는 조각화(Fragmentation)가 발생해 디스크 I/O 속도가 지연되므로, 대용량 예상 시 높은 번호를 선고해 두어야 단편화 병목이 사수된다.
```

#### 3. DD02L 과 DD03L (사전 명세 보존 테이블)
- SE11 에서 테이블을 빚을 때 적어 넣은 테이블 헤더 정보(속성 등)는 **`DD02L`** 시스템 테이블에 메타 데이터로 영구 보존되고, 각 컬럼의 구조 필드 리스트는 **`DD03L`** 테이블에 한 줄씩 인서트되어 형상 보존된다. 
- `Where-Used List` 를 격발하면, 아바 사전이 이 `DD03L` 의 필드 참조 기록을 인덱스 검색하여 상속 의존성을 추적해 낸다.

### 어떻게 확인하는가

SE11 에서 ZGUGUDAN 투명 테이블을 설계하고 활성화하여 메타데이터가 적재되는 과정을 검증한다.

```text
[1단계] SE11 테이블 생성 선언 :
   - Database Table : ZGUGUDAN 입력 -> Create 클릭!
   - Delivery Class : A (Application Data) 선고!
   - Data Browser/Table View Maint. : Display/Maintenance Allowed (TMG 허용!) 선고!
   
[2단계] 필드 배선 및 Data Element 결선 :
   - Field: MANDT  -> Key: [Check] -> Type: MANDT (표준 클라이언트 DE 결선!)
   - Field: DAN    -> Key: [Check] -> Type: ZDE_DAN (구구단 단수 DE 결선!)
   - Field: MUL    -> Key: [Check] -> Type: ZDE_MUL (곱수 DE 결선!)
   - Field: RESULT -> Key: [ ]     -> Type: ZDE_RESULT
   
[3단계] Technical Settings 입력 및 DDL 격발 :
   - 상단 [Technical Settings] 버튼 클릭!
   - Data Class : APPL1 (트랜잭션 고속 쓰기 물리 세그먼트 낙점!)
   - Size Category : 0 (초기 Extent 가볍게 낙점!) -> 저장 및 뒤로가기.
   - [활성화 (Ctrl+F3)] 클릭 -> DDL Processor 가 물리 DB 에 'CREATE TABLE ZGUGUDAN' DDL 을 송출 완료하여 하드디스크 굴착 완료!
```

#### 체험/시뮬레이터 설계 (DDL Processor 굴착 드릴)
- **Proces Flow**:
  1. 학습자가 [SE11 테이블 설계서] 와 [물리 데이터베이스 하드 디스크] 를 본다.
  2. [활성화] 버튼을 누른다.
  3. [DDL Processor 굴착기] 가 지잉 내려오더니, 설계서의 ZGUGUDAN 컴포넌트 명세를 SQL DDL 문으로 촥 번역해 물리 디스크에 실재 ZGUGUDAN 저장 세그먼트를 쿵쿵 뚫어 굴착 도킹시키는 정교한 애니메이션을 관찰한다.
  4. 이번엔 Data Class 를 [APPL1] 에서 [APPL0] 으로 변경 스위칭하자, 디스크 내부에서 테이블 보관 영역이 [쓰기 분산 블록] 에서 [마스터 고속 읽기 블록] 으로 이송되는 물리 공간 분배 피드백을 감상한다.
- **상태 및 데이터**:
  - `MANDT 필드를 첫 번째 키로 선언하는 것을 누락하고 테이블을 저장하려 한 상태` -> 런타임 결과: `Syntax check warning. Client-specific table without MANDT field` 하이라이트.
- **피드백**: Transparent Table 은 단순한 메모리 선언이 아닌, DDL Processor 가 물리 DB 스페이스를 파내는 실체적 굴착 작업임을 각인한다.

### 실수/주의

- **데이터가 100만 건 이미 적재되어 운영 서비스 중인 ZTABLE 에 대고, SE11 에서 키 필드의 길이를 바꾸거나 타입을 무단 변경해 활성화 격발**:
  - DB 레벨에서 테이블 전체 락(Table Lock)이 걸려 시스템이 마비되거나, 컬럼 바이트 변환 불일치(Conversion Error)로 인해 기존 100만 건 데이터가 쌩 소멸해 버리는 초대형 전산 재앙이 터집니다.
  - **운영 테이블 구조 수정은 반드시 데이터 백업 후 데이터 변환 이송 툴을 사용해 고도로 정교하고 안전하게 진행되어야 함을 수호해야 합니다.**

### 정리

- **`Transparent Table`** 은 사전 명세와 DB 실체가 **`1:1 물리 동기화`** 되는 디스크 저장 기지다.
- SE11 활성화 격발 시, **`DDL Processor`** 가 물리 DDL 문을 DBMS 에 전송해 저장 공간을 개설한다.
- 첫 키로 배선하는 **`MANDT`** 필드는 Open SQL 번역 단계에서 **`Implicit Client Filtering (묵시적 조건 자동 주입)`** 처리되어 세션 격리를 완성한다.
- **`Technical Settings`** 의 Data Class(APPL0/1/2)는 디스크 I/O 분산을 위해 **`물리 테이블스페이스 격리`** 를 결정한다.

---

## CH07-L02 - Create Entries로 구구단 입력 · 데이터 조회

### 왜 필요한가

하드디스크에 구구단 영구 기지 개설을 완료했다.
이제 테이블의 무결성을 수호하기 위해 키 중복 데이터를 밀어 넣으려 할 때 터지는 '데이터베이스 고유의 물리 락' 이 장벽입니다.
- " SE11 Create Entries 나 TMG 화면을 통해 구구단 데이터를 한 건씩 입력한다. 
이미 2단 3열 = 6 이라는 데이터가 저장되어 있는데, 또다시 2단 3열 = 9 라는 데이터를 억지로 넣으려 밀어붙이면, DB 내부적으로 어떤 제약이 격발되는가?"
이 유일 키 제약(Primary Key Constraint)의 물리 동작을 이해하고 있어야만, 프로그램 단에서 DB 저장을 제어할 때 무분별한 중복 데이터 강제 삽입으로 인한 런타임 폭사 사고를 미연에 차단할 수 있습니다.

**Unique Key 제약에 의한 물리적 Primary Key Duplicate Error 덤프 정합성과, SM30 TMG(Table Maintenance Generator) 유지보수 뷰 생성 및 Client Dependent 격리 작동 확인 기술**이 필요합니다. 그것이 **Create Entries 와 데이터 무결성 검증**의 완수입니다.

### 무엇인가

#### 1. Unique Key 중복 차단 및 DB 레벨의 무결성 제약 (Constraint)
- **Primary Key Constraint (기본 키 무결성 제약)**: **디스크 물리 테이블 ZGUGUDAN 에 지정한 키 `MANDT + DAN + MUL` 은 DBMS 엔진이 강제 관리하는 절대 고유값(Unique Index)이다. 
- **물리 락 격발**: 이미 2단 3열 레코드가 존재하는 상태에서 또 2단 3열을 삽입(`INSERT`)하려 대면, DB 커널은 테이블 물리 인덱스 트리 충돌을 감지해 `Duplicate Key Error` 를 격발하며 즉각 입력을 차단 기각한다. 프로그램 단에서 이를 가드 없이 강제 주입하면 `CX_SY_OPEN_SQL_DB` 예외로 덤프 사망한다.**

#### 2. Table Maintenance Generator (TMG - 유지보수 뷰)
- *손으로 한 건씩 치는 원시 SE11 방식을 넘어선 실무용 단기 입력 툴이다.*
- SE11 메뉴의 **`Table Maintenance Generator`** 를 통해 자동 화면 생성 단추를 누르면, 백엔드에서 전용 화면군(Screen Group)과 유지보수 뷰 로직이 기동되어, 트랜잭션 **`SM30`** 에 테이블 명칭만 치면 엑셀처럼 여러 행을 손쉽게 대량 추가/삭제할 수 있는 표준 TMG 툴이 생성 완료된다.

#### 3. Client Dependent 데이터 격리 동작
- 100번 클라이언트 방에 로그인하여 `Create Entries` 로 2단 3열을 넣었다. 
- 이후 200번 클라이언트 방에 재접속하여 동일 테이블을 조회하면 화면에 **데이터가 쌩뚱맞게 0건**으로 보인다. 
- **이유**: `MANDT` 필드가 룸을 격리하고 있어, 아바 커널이 200번 방의 묵시적 필터링을 걸고 디스크를 긁어오기 때문이다. 데이터는 100번 방 서랍에 엄연히 안전 보존되어 있다.

### 어떻게 확인하는가

SE11 Create Entries 와 TMG 화면을 생성해 무결성과 격리를 검증하는 단계를 수행한다.

```text
[1단계] SE11 Create Entries 데이터 입력 및 무결성 락 검증 :
   - SE11 -> ZGUGUDAN -> Utilities -> Table Contents -> Create Entries 기동!
   - 입력란 : DAN = 2, MUL = 3, RESULT = 6 입력 후 [Save] 클릭 -> "Database record created successfully" 점등! (18바이트 적재 완료)
   - 이어서 동일 화면에 DAN = 2, MUL = 3, RESULT = 9 입력 후 [Save] 다시 클릭!
   - 하단 상태 표시줄에 **"Key duplicate. Entry already exists in database"** 적색 에러 점등 및 입력 기각 완료! (무결성 락 작동 성공!)
   
[2단계] TMG 유지보수 뷰 생성 기동 :
   - SE11 -> ZGUGUDAN 상단 메뉴 Utilities -> Table Maintenance Generator 기동!
   - Authorization Group: &NC& (권한 없음 프리 패스!)
   - Function Group: ZFG_GUGUDAN (TMG 가 탑재될 서브 프로그램 이름 지정)
   - Maintenance Screens: [One Step] 선고 -> 화면 번호 9000 자동 획득!
   - [생성 (Ctrl+F3)] 클릭 -> TMG 화면 그룹 컴파일 성료!
   
[3단계] SM30 실제 데이터 유지보수 :
   - SM30 실행 -> Table/View : ZGUGUDAN 기입 후 [Maintain] 클릭!
   - 엑셀 같은 고밀도 화면에서 2×4=8, 2×5=10 등을 마우스 드래그 및 추가 기입해 일괄 저장 완료!
```

#### 체험/시뮬레이터 설계 (MANDT 묵시적 수문장)
- **프로세스 플로우**:
  1. 학습자가 [100번 클라이언트 서랍] 과 [200번 클라이언트 서랍], 그리고 [ZGUGUDAN 디스크 장부] 를 본다.
  2. [MANDT 묵시적 수문장] 이 지키고 서 있다.
  3. 100번 사용자가 2×3=6 데이터를 장부에 넣자, 수문장이 100번 꼬표를 붙여 [100번 서랍] 에 안전히 적재한다.
  4. 200번 사용자가 "조회!" 를 외치자 수문장이 200번 꼬표가 붙은 서랍만 긁어 오는데 200번 방은 텅 비어 있어 "0건 조회 완료" 흰 화면을 비추는 물리 격리 피드백을 감상한다.
  5. 100번 사용자가 동일한 2×3=9 키 데이터를 밀어 넣자, [Unique Key 락] 톱니바퀴가 덜커덩 걸리며 입력을 기각하는 무결성 피드백을 관찰한다.
- **상태 및 데이터**:
  - `TMG Function Group 에 쌩뚱맞은 권한 그룹을 잘못 배정해 화면 기동이 차단된 상태` -> 런타임 결과: `Authority check fail. Maintenance access denied` 하이라이트.
- **피드백**: Unique Key 는 DB 레벨의 무결성 철퇴며, MANDT 는 룸 세션을 가르는 물리적 도킹 벽임을 인지한다.

### 실수/주의

- **TMG 생성 시 Function Group 을 개설하지 않고 쌩 이름만 적어서 빌드 에러를 뿜으며 TMG 조립에 실패**:
  - TMG 화면은 결국 하나의 서브 프로그램이어서 둥지가 될 **함수 그룹 (Function Group)** 이 미리 생성되거나 활성화되어 있어야 컴파일이 뚫립니다.
  - **반드시 빈 함수 그룹을 SE80 에서 먼저 개설 활성화한 뒤 TMG 에 결선 수호해야 합니다.**

### 정리

- 테이블 Unique Key 조합에 중복 값을 재인서트하려 들면 DB 층의 **`Primary Key Constraint (무결성 제약)`** 이 격발되어 입력을 기각한다.
- 트랜잭션 **`SM30 TMG 유지보수 뷰`** 를 생성해 두면 대량 레코드 편집이 Fiori 느낌의 화면군으로 제공된다.
- **`Client Dependent`** 테이블의 레코드는 다른 클라이언트 세션 환경에서는 묵시적 조건 검색으로 인해 **`원천적으로 보이지 않는다`**.

---

## CH07-L03 - Transparent ↔ Structure ↔ Table Type 비교

### 왜 필요한가

데이터 무결성 검증까지 완료했다.
이제 동일 구조 명칭을 공유하는 'Structure(gs), Internal Table(gt), Transparent Table(Table)' 의 아키텍처적 삼각 포지셔닝이 최종 장벽입니다.
- " zst_line 이라는 전역 DDIC Structure 를 하나 빚었다.
이걸 가져다가 프로그램에서 DATA gs TYPE zst_line, gt TYPE TABLE OF zst_line 으로 썼고, SE11 에서 ZGUGUDAN DB 테이블도 이 모양으로 만들었다.
이 셋은 램 메모리와 디스크 공간 상에서 구체적으로 어떤 수명(Life-cycle)과 물리적 차이를 겪는가?"
이 삼각 축의 메모리-디스크 수명 주기 정합성을 명확히 비교 정리해 두어야만, 프로그램 종료 시 날아가는 메모리 풍선과 디스크 장부를 혼동해 데이터 유실 장애를 내는 사고를 원천 방제할 수 있습니다.

**휘발성 메모리 1건 버퍼 gs (Work Area), 휘발성 메모리 다건 캐시 gt (Internal Table), 그리고 영속성 디스크 장부 ZTABLE 의 수명 주기 대조 기술**이 필요합니다. 그것이 **삼각 개체 아키텍처 비교**의 완수입니다.

### 무엇인가

#### 🧭 [ Structure ↔ Internal Table ↔ Transparent Table 삼각 격리 비교 명세 ]
- *모양(Shape)은 공유하되, 물리 보관소와 수명은 완전히 갈라진다.*

```text
[1] Structure ( gs_line - Work Area ) :
   - 물리 공간 : Application Server 램 메모리 (Roll Area)
   - 수명 주기 : 휘발성 (프로그램 실행 스레드가 꺼지는 찰나 메모리 소거)
   - 보관 한계 : 오직 1건 (1 Row) 레코드. 새 값이 오면 무조건 덮어쓰기 유실!
   │
[2] Internal Table ( gt_line - 캐시 명단 ) :
   - 물리 공간 : Application Server 램 메모리 (Roll Area)
   - 수명 주기 : 휘발성 (프로그램 종료 시 8바이트 Header 와 Body 전 영역 FREE 소거)
   - 보관 한계 : 100만 건 이상 다건 적재 가능하나, 램 세션 안에서만 유효함!
   │
[3] Transparent Table ( ZGUGUDAN - DB 테이블 ) :
   - 물리 공간 : Database Server 하드 디스크 (HDD / SSD Persistent Storage)
   - 수명 주기 : 영속성 (프로그램이 수백 번 꺼지고 컴퓨터가 부팅되어도 데이터 영구 보존!)
   - 보관 한계 : 디스크 용량 한도 내에서 수억 건의 전사 데이터 보존 및 전체 공유!
```

#### 2. 전역 도면(ZST_LINE)을 활용한 선언 공유의 이점
- SE11 에서 **`ZST_LINE`** 구조체 도면을 1개 전역 개설해 둔다.
- 이 도면 하나로 리포트 프로그램에서 `gs_line TYPE zst_line.` (1행) 및 `gt_line TYPE TABLE OF zst_line.` (다행)을 동시 셋업한다.
- 이로 인해 프로그램과 사전 명세 간 데이터 전송 시 타입 불일치(Type Conflict) 에러가 원천 차단되고, 필드 확장 시 도면만 수정하면 결선 소스들이 일제 자동 릴리즈 업데이트되어 Basis 형상 제어 관리가 최적화된다.

### 어떻게 확인하는가

전역 구조를 타입 참조하여 메모리 gs/gt 에 담고, 최종 Transparent Table 로 도킹 준비하는 코드를 검증한다.

```abap
REPORT zhello_model_compare.

" 1. [★ 전역 ZST_LINE 구조체 도면을 상속받아 메모리 1행 그릇 선언]
DATA gs_work TYPE zst_line. 

" 2. [★ 동일 전역 도면을 상속받아 메모리 다행 캐시 캐비닛 선언]
DATA gt_cache TYPE TABLE OF zst_line. 

" 3. [ 램 버퍼에 임시 적재 ]
gs_work-dan    = 4.
gs_work-mul    = 2.
gs_work-result = 8.
APPEND gs_work TO gt_cache.

" [★ 영속성 비교 지점]
" gt_cache 에 든 4*2=8 데이터는 이 프로그램 실행 창(F8)을 닫는 찰나 램에서 증발 소멸함!
" 영구히 남기려면 'INSERT zgugudan FROM gs_work.' 쿼리를 쏴서 
" Database Server 디스크의 Transparent Table ZGUGUDAN 으로 촥 도킹 인서트 시켜야 함!

WRITE: / 'Structure & Internal Table 메모리 셋업 성료. 디스크 도킹 준비 완료.'.
```

#### 체험/시뮬레이터 설계 (영속성 수명 대조기)
- **프로세스 플로우**:
  1. 학습자가 [Application Server 램 방] 과 [Database Server 하드디스크] 를 본다.
  2. 램 방에는 gs_work 와 gt_cache 가 떠 있고, 하드디스크에는 ZGUGUDAN 테이블이 고정 박혀 있다.
  3. [프로그램 실행(F8)] 을 격발하자, 램 방에 파란색 데이터가 차오른다.
  4. [종료(Close)] 버튼을 누르는 순간, [램 방] 에 불이 꺼지며 gs, gt 데이터가 먼지처럼 공중 분해되어 소멸하는 비주얼을 감상한다.
  5. 다시 기동 후, [DB Save] 스위치를 때리자 램 데이터가 [하드디스크 ZGUGUDAN 세그먼트] 로 내려가 쇠철창처럼 단단히 고정 잠금된다.
  6. 종료 단추를 클릭해 램이 다 꺼진 상태에서도 하드디스크 속 쇠철창 구구단은 금빛 찬란하게 무결 보존되어 있는 수명 대조 피드백을 감상한다.
- **상태 및 데이터**:
  - `내부 테이블 gt_cache 에 1만 건 데이터를 넣고 DB 테이블 저장을 생략한 채 PC를 강제 부팅한 상태` -> 런타임 결과: `Data lost. Volatile memory wiped on restart` 하이라이트.
- **피드백**: Structure 와 IT 는 램 상의 임시 제어 톱니바퀴며, 오직 Transparent Table 만이 영속적인 전산 자산 보존소임을 머리에 각인한다.

### 실수/주의

- **데이터 수명이 영구히 유지되어야 하는 거래처 마스터 정보를, DB 저장 쿼리(INSERT) 송출을 빠뜨린 채 내부 테이블 gt_data 에만 APPEND 해 두고 프로그램을 그냥 끝마치는 실수**:
  - 사용자 화면에는 등록 완료라 나왔으나, 데이터베이스 실제 장부엔 0건도 안 남아 다음 날 조회가 안 되는 전산 유실 장애를 낸다.
  - **영속 마무리는 무조건 DB 인서트로 체결 수호해야 한다.**

###. 정리

- **`Structure`** 는 램 상의 **`1건 (Work Area)`** 휘발성 버퍼다.
- **`Internal Table`** 은 램 상의 **`다건`** 휘발성 캐시 영역이다.
- **`Transparent Table`** 은 Database Server 하드디스크에 저장되는 유일한 **`영속성 (Persistent)`** 중앙 보관소다.
- 전역 구조 도면 **`ZST_*`** 를 공통 상속 결선하여 쓰면, 타입 충돌이 차단되고 형상 수호가 최적화된다.
