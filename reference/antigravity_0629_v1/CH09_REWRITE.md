# CH09_REWRITE - DDIC 관계와 입력도움말(F4) v1

> 목적: `content/abap/CH09`의 9개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH09 전체 설계

CH09의 한 문장 목표는 "Foreign Key 의 Database Level Referential Integrity 미지정 및 Dynpro PAI/TMG Application-level Check 물리적 격리, Value Table(DD01L 제안)과 Check Table(DD03L 강제)의 결선, Conversion Exit ALPHA 의 INPUT(0 패딩)/OUTPUT(Trim) 펑션 모듈 자동 격발 기작, Text Table(SPRAS)의 sy-langu 자동 조인, 그리고 Search Help IMP/EXP 흐름과 6단계 F4 호출 우선순위 사다리 정합성을 수립해 입력 통제 설계 역량을 완성한다"이다.

IT 비전공자 입문자는 사전의 외래키(Foreign Key) 지정이 실제 Database Level 에도 제약을 걸어 지키고 있을 거라 믿고, Open SQL DML(`INSERT ZTABLE`) 격발 시 존재하지 않는 부실 키 데이터가 장부에 그대로 쑤셔 박혀 무결성이 터지는 뇌사 현상을 겪는다.
또한, `ALPHA` 변환의 좌측 0 채움(Zero Padding) 물리 동작을 모른 채 소스 상수와 쌩 비교해 조회를 유실하고, F4 팝업 6단계 호출 우선순위를 어긋나게 걸어 엉뚱한 기본 달력이 튀어나오는 장애를 양산한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **PAI Application Check**: 외래키가 DB 상에 물리 제약으로 걸리지 않고, 오직 SAP GUI 프레젠테이션/Dynpro PAI 단이나 TMG 세션에서 커널이 선제 체크하는 제약 폭로 및 코드 수동 검증의 필요성 명세.
2. **DD01L vs DD03L Mapping**: 도메인 사전 대장 DD01L 의 제안인 Value Table 과, 실제 필드 명세 대장 DD03L 의 관계 강제인 Check Table 의 차이 분석.
3. **Conversion Exit ALPHA**: 내부 패딩용 `CONVERSION_EXIT_ALPHA_INPUT` 과 내부 트림용 `CONVERSION_EXIT_ALPHA_OUTPUT` 의 아바 VM 자동 격발 기작 명세.
4. **SPRAS sy-langu Auto-join**: 다국어 텍스트 테이블 ZCONCERT_T 적재 시, 사용자 세션 언어 레지스터 sy-langu 와 결선되어 F4 에서 묵시적 WHERE 조인되는 원리 규명.
5. **IMP/EXP Data Pipe**: 화면의 값이 SH 의 `IMP` 파라미터로 유입되어 스캔하고, 선택된 정보가 `EXP` 파라미터로 흘러나가 화면 칸에 원샷 대입되는 바인딩 흐름 설명.
6. **6단계 F4 Priority Gate**: 1단계(AT SELECTION-SCREEN ON VALUE-REQUEST 코딩) -> 2단계(MATCHCODE OBJECT) -> 3단계(DE SH) -> 4단계(Check Table 외래키) -> 5단계(Domain 고정값) -> 6단계(기본달력)의 우선순위 사다리 수립.
7. **콘서트 데이터 모델 실습**: ZCONCERT/ZPERF/ZBOOKING 3대 마스터-상세 테이블 및 ZSH_CONCERT 생성과 Create Entries 무결성 락 검증 캡스톤.

---

## CH09-L01 - Foreign Key와 Check Table

### 왜 필요한가

우리가 이전 CH08 에서 Open SQL 로 데이터를 긁어와 화면에 뿌렸다.
이제부터는 우리만의 전용 비즈니스 애플리케이션인 '콘서트 예매 앱' 을 직접 빌드하기 시작한다.
- " 예매 테이블 `ZBOOKING` 에 데이터를 인서트하는데, 존재지도 않는 유령 공연 ID 인 `'C999'` 가 조건 체크 없이 쌩 장부에 저장되는 중대 데이터 오염이 터졌다.
이 유령 데이터 유입을 SE11 데이터 사전 차원에서 선언적으로 걸러 차단하는 결선 장치는 무엇인가?"
이 데이터 입력 게이트의 물리 정합성 실체를 모르면, 100만 건 장부에 쓰레기 참조 키가 가득 차 전산 장부가 무용지물이 되는 참사를 겪는다.

**ZBOOKING 과 ZCONCERT 의 참조 관계를 이어주는 Foreign Key (외래키)와 Check Table 의 메커니즘을 파악하고, 이것이 Database 레벨의 무결성 제약이 아닌 오직 SAP GUI 프레젠테이션/Dynpro PAI 세션의 Application-level Check 로 격리 작동하는 아키텍처적 한계를 규명하는 기술**이 필요하다. 그것이 **Foreign Key 입력 통제**의 완수다.

### 무엇인가

#### 1. Foreign Key 와 Check Table
- **외래키 관계**: **특정 테이블 필드(ZBOOKING-CONCERT_ID)에 입력될 수 있는 값의 범위를, 공인 마스터 테이블(ZCONCERT)에 실재 살아 숨 쉬고 있는 CONCERT_ID 컬럼 값으로만 강력히 제한하는 선언적 바인딩 장치다. 이때 이정표가 되는 공인 마스터 테이블을 Check Table (체크 테이블)이라 선고한다.**

#### ⚠️ [ Foreign Key 의 DB Referential Integrity 미정 및 Application-level Check 명세 ]
- *모든 입문 개발자가 백프로 오해하고 넘어가는 커널 아키텍처다.*
- **아바 사전(SE11)에서 ZBOOKING 에 외래키를 걸었다고 해서, 실제 Oracle 이나 HANA 데이터베이스(DBMS) 단에 `ALTER TABLE ADD CONSTRAINT FOREIGN KEY` 물리 DDL 이 날아가지 않는다. 즉, DB 엔진 레벨에는 외래키 무결성 장벽이 아예 생성되지 않는다.**
- **동작 실체**: **외래키 검증은 오직 SAP GUI Dynpro 화면의 PAI (Process After Input) 검문 단계나 TMG(유지보수 SM30) 세션에서, 아바 커널이 선제적으로 마스터 테이블을 가볍게 SELECT 쿼리 대조하여 "이거 없는 키다!" 라고 화면 입력을 차단하는 Application-level Check 방식으로 작동한다.**
- **따라서**: **프로그램 상에서 화면을 거치지 않고 `INSERT zgugudan FROM gs_line.` 과 같이 Open SQL DML 을 다이렉트로 날려 저장하려 들면, 이 외래키 필터가 완전히 우회(Bypass)되어 쓰레기 유령 코드 `'C999'` 가 DB 장부에 아무런 경고 없이 고대로 저장되는 뇌사 현상이 터진다. 그러므로 직접 DB 에 쓸 때는 프로그램 소스 상에서 `SELECT SINGLE` 존재 여부 수동 검증(Manual Validation)을 무조건 병행 결선해 사수해야 한다.**

#### 2. Cardinality (관계의 개수)
- 마스터 1건당 자식(상세)이 몇 건이나 들러붙을 수 있는지를 표시하는 인프라 메타정보다. 예컨대 공연 1건당 예매 정보는 수십 건 엮이므로 **`1:N (1:Many)`** 관계식으로 벼려 선고한다.

### 어떻게 확인하는가

외래키 관계를 설정한 테이블의 입력 검증을 TMG 와 DML 두 채널로 비교 검증한다.

```text
[1단계] SE11 에서 ZBOOKING 테이블의 CONCERT_ID 에 Foreign Key 도킹 :
   - SE11 -> ZBOOKING -> CONCERT_ID 필드 라인 선택 -> [Foreign Key] 버튼 클릭!
   - Check Table: ZCONCERT 기입!
   - Key Fields 매핑 결선 확인: ZBOOKING-CONCERT_ID = ZCONCERT-CONCERT_ID 확인 후 [Copy]!
   - 테이블 저장 및 활성화(Ctrl+F3)!
   
[2단계] TMG 화면(SM30)을 통한 GUI Application-level Check 작동 확인 :
   - SM30 -> ZBOOKING 데이터 입력 실행!
   - CONCERT_ID 란에 마스터 ZCONCERT 에 존재하지 않는 유령 코드 'C999' 를 치고 Enter!
   - 화면 하단 상태바에 **"Entry C999 does not exist in ZCONCERT (check entry)"** 적색 PAI 차단 에러 점등 및 저장 기각 성료! (외래키 검문소 기동 성공!)
   
[3단계] 프로그램 Open SQL 직접 쓰기의 외래키 우회 폭사 확인 :
   - 아바 에디터(SE38)에서 gs_booking-booking_id = 'B001'. gs_booking-concert_id = 'C999' (유령값) 기입.
   - 'INSERT zbooking FROM gs_booking.' 쌩 DML 쿼리 실행!
   - 결과 확인: DB 락 에러 없이 sy-subrc = 0 성공 통과 및 유령코드 'C999' 가 DB 장부에 쌩 적재 완료! (화면이 없으니 검증이 우회됨!)
```

#### 체험/시뮬레이터 설계 (외래키 통제 게이트)
- **프로세스 플로우**:
  1. 학습자가 [ZBOOKING 입력 컨베이어 벨트] 와 [ZCONCERT 공연 검문소], 그리고 [ZGUGUDAN 디스크 장부] 를 본다.
  2. [유령 데이터 C999] 가 컨베이어 벨트를 타고 들어온다.
  3. [GUI PAI 가드레일 = ON] 상태다. 데이터가 검문소 차단바에 쿵 부딪히더니 "Entry not exist in ZCONCERT! GUI Input Blocked!" 빨간불이 켜지며 튕겨 나간다.
  4. 이번엔 [Open SQL 직접 쓰기 드릴 = RUN] 을 격발한다. 가드레일 검문소를 쌩 우회하여 [우회 터널] 을 뚫고 ZGUGUDAN 디스크 장부 안방으로 C999 데이터가 그냥 쿵 떨어져 인서트되는 정합성 훼손 피드백을 감상한다.
- **상태 및 데이터**:
  - `외래키 설정 시 자식 필드와 부모 필드의 데이터 타입을 서로 꼬아서 다르게 설정한 상태` -> 런타임 결과: `Syntax error. Key fields type compatibility check failed` 하이라이트.
- **피드백**: 외래키는 화면용 차단 가드일 뿐이며, Open SQL 직접 전송 시엔 우회되므로 반드시 소스 검증을 병행 수호해야 함을 터득한다.

### 실수/주의

- **외래키 관계를 걸 때, MANDT (클라이언트) 필드 매핑을 실수로 누락하고 결선 완료**:
  - 100번 방 예매를 검사하러 가면서 쌩 다른 200번 방의 ZCONCERT 마스터를 읽으려 하거나 데이터 격리가 붕괴되어 전사 정합성이 깨집니다.
  - **외래키 선포 시 `MANDT = ZCONCERT-MANDT` 매핑 결선을 필사적으로 수호해야 합니다.**

### 정리

- **`Foreign Key`** 는 자식 필드의 값을 **`Check Table`** 마스터의 키 내로 제한한다.
- 외래키 검증은 DB 락이 아닌, **`Application-level Check (PAI/TMG)`** 단계에서 화면 입력을 차단한다.
- 따라서 프로그램 **`Open SQL (DML) 직접 쓰기`** 시에는 외래키 검증이 완전히 **`우회`** 되어 오염 데이터가 적재된다.
- 이를 막기 위해 직접 쓰기 직전에 소스 상에서 **`SELECT SINGLE 존재 검증`** 을 무조건 수호한다.

---

## CH09-L02 - Value Table과 Foreign Key의 차이

### 왜 필요한가

외래키 검증의 물리 한계를 확인했다.
이번에는 도메인 설계 시 적어주는 'Value Table' 과, 필드에 선포하는 'Check Table' 의 아바 컴파일러 사전 매핑 차이가 장벽입니다.
- " ZDO_CONCERT 도메인에 Value Table = ZCONCERT 를 적어 활성화했다. 
그런데 왜 예매 테이블 p_id 필드에 데이터를 막 쳐 넣어도 아무런 입력 거부나 F4 도움말이 기동되지 않는가?"
그리고, 공연 코드 ID 가 입력창에서는 `'C1'` 이라 보이는데 정작 DB 쿼리로 조회하면 아무리 해도 검색 유실되는 문자열 0 채움(ALPHA)의 물리 기작을 파악하고 있어야 버그를 방어합니다.

**도메인 메타데이터 `DD01L` 의 제안 장치인 Value Table 과, 테이블 필드 메타 `DD03L` 의 강제 장치인 Check Table 의 사전 결선 구조와, Conversion Exit ALPHA 의 수문장 패딩 펑션 모듈 자동 격발 기술**이 필요합니다. 그것이 **Value Table 과 ALPHA 변환**의 완수입니다.

### 무엇인가

#### 1. Value Table (Domain 제안) vs Check Table (Field 강제)
- **Value Table (DD01L 제안)**: **도메인(ZDO_CONCERT) 수준에서 "이 도메인의 뼈대를 쓰는 녀석들은 나중에 십중팔구 ZCONCERT 테이블을 마스터로 쓸 것" 이라고 적어두는 메타데이터 제안(Proposal)이다. 도메인 속성 대장인 `DD01L` 테이블에 텍스트 값으로 단순 적재된다. 자체적으로는 0.0001% 의 외래키 입력 차단력도 발휘하지 못한다. 다만, 나중에 개발자가 필드 외래키를 정의하려 버튼을 누를 때, 아바 사전이 `DD01L` 을 참조하여 "너 체크 테이블 `ZCONCERT` 로 꽂을 거지?" 하고 마술적으로 제안창을 띄워주는 설계 보조 장치다.**
- **Check Table (DD03L 강제)**: 테이블 필드 속성 대장인 **`DD03L`** 에 외래키 관계가 최종 매핑 주입되어 활성화된 상태다. 이 상태에서 비소로 화면 PAI 입력 차단과 F4 도움말 팝업이 강제 기동된다.

#### 2. Domain 변환 루틴 (Conversion Exit ALPHA)
- 도메인에 `ALPHA` 루틴을 장착해 두면, 아바 런타임 가상머신(VM)이 화면 이벤트 시점에 아래 두 펑션 모듈을 커널 단에서 자동으로 낚아채 가동한다.
  - **`CONVERSION_EXIT_ALPHA_INPUT` (내부 저장용 0 채움 패딩)**: **사용자가 화면 입력창에 `'C42'` (또는 숫자 `'42'`)라고 적고 Enter 를 때리는 그 찰나, 이 인풋 펑션이 격발되어 앞자리에 0 을 가득 충전한 10자리 고정 바이트 내부 값 `'0000000042'` (또는 `'C000000042'`)로 램 내부 값을 변환해 DB 세션 버퍼에 박아 넣는다.**
  - **`CONVERSION_EXIT_ALPHA_OUTPUT` (화면 표시용 0 제거 트림)**: **DB 로부터 `'0000000042'` 내부 데이터를 긁어와 화면 렌더링을 격격할 때, 이 아웃풋 펑션이 즉각 기동되어 좌측의 0 들을 싹 소거(Trim)하여 사용자 눈에 직관적인 `'42'` 단어로 벼려 보여 준다.**
  - **주의**: Open SQL 소스 상에서 쌩 상수로 `WHERE concert_id = '42'` 라고만 매칭 쿼리를 쏘면, DB 에 기입된 실재 비트열 `'0000000042'` 와 일치하지 않아 데이터가 쌩뚱맞게 0건 조회 누락되는 참사를 초래한다. (쿼리 조건에도 0 패딩 내부 값을 맞춰야 한다.)

### 어떻게 확인하는가

Value Table 선언 상태와 ALPHA 변환 루틴의 내부 패딩 작동을 검증한다.

```abap
REPORT zhello_conversion_alpha.

DATA: gv_input  TYPE c LENGTH 10 VALUE '42',
      gv_output TYPE c LENGTH 10.

" 1. [★ 수동 내부 변환 루틴 ALPHA_INPUT 격발 - 화면 값 '42' 를 0 이 찬 10자리 내부 값으로 변환!]
CALL FUNCTION 'CONVERSION_EXIT_ALPHA_INPUT'
  EXPORTING
    input  = gv_input
  IMPORTING
    output = gv_output. " 결과: '0000000042'!

" 2. [★ 수동 표시 변환 루틴 ALPHA_OUTPUT 격발 - 내부 값 '0000000042' 의 0 을 떼어 '42' 로 표시!]
DATA gv_screen TYPE c LENGTH 10.

CALL FUNCTION 'CONVERSION_EXIT_ALPHA_OUTPUT'
  EXPORTING
    input  = gv_output
  IMPORTING
    output = gv_screen. " 결과: '42'!

WRITE: / '화면 입력값:', gv_input,
       / '★ 내부 저장값 (0 패딩):', gv_output,
       / '화면 표시용 (0 소거):', gv_screen.
```

#### 체험/시뮬레이터 설계 (ALPHA 0 패딩기)
- **프로세스 플로우**:
  1. 학습자가 [사용자 입력 렌즈 '42'] 와 [DB 저장 창고 ZTABLE], 그리고 중간에 장착된 [ALPHA INPUT 연산 실린더] 를 본다.
  2. [42] 구슬을 투입한다.
  3. [ALPHA INPUT 실린더] 속을 구슬이 통과하는 순간, "00000000" 이라는 투명 꼬리가 찰딱 융합 패딩되어 [0000000042] 의 긴 구슬로 사출되어 DB 창고에 박히는 물리 복제를 확인한다.
  4. 반대로 창고에서 꺼내 [ALPHA OUTPUT 실린더] 를 관과시키자 꼬리가 촥 깎여 나가 '42' 로 나오는 변환 피드백을 감상한다.
- **상태 및 데이터**:
  - `도메인에 Value Table 만 지정해 두고 필드 외래키 연결을 누락한 상태` -> 런타임 결과: `F4 help missing. No input validation enforced` 하이라이트.
- **피드백**: Value Table 은 컴파일러 제안서일 뿐이며, ALPHA 는 0 패딩 펑션 모듈의 자동 격발로 무결성을 유지함을 깨닫는다.

### 실수/주의

- **ALPHA 변환 도메인이 걸려 있는 필드에 대고, Open SQL 쿼리 시 '0000000042' 가 아닌 쌩 '42' 로 조회하여 데이터가 안 나오는 정합성 뇌사 초래**:
  - 데이터 유실 오판단으로 이어지므로, 쿼리 전 변수 값을 `CONVERSION_EXIT_ALPHA_INPUT` 펑션으로 0 충전해 매칭 쿼리를 쏴야 함을 수호해야 합니다.

### 정리

- **`Value Table`** 은 도메인(**`DD01L`**) 수준의 '제안' 이며, **`Check Table`** 은 필드(**`DD03L`**) 수준의 '실제 관계 검증' 이다.
- **`ALPHA`** 변환 루틴은 내부적으로 앞자리 0 을 쑤셔 넣는 **`INPUT`** 펑션과 0 을 떼어 보여주는 **`OUTPUT`** 펑션으로 이원화 작동한다.
- Open SQL 상수로 데이터 대조 시에는 반드시 **`0 패딩 내부 규격 값`** 으로 수호해 대조 쿼리를 쏜다.

---

## CH09-L03 - Text Table — 코드 옆 이름표

### 왜 필요한가

Value Table 과 ALPHA 변환 제어까지 완수했다.
이제 코드 옆에 명칭을 붙일 때 다국어 처리가 붕괴되는 'SPRAS 언어 키 누락' 이 장벽입니다.
- " ZCONCERT_T 라는 텍스트 테이블을 만드는데, 키 필드로 CONCERT_ID 와 함께 언어 키 SPRAS 를 결선했다. 
아바 F4 나 조회 쿼리 시, 로그인 세션 언어에 맞는 한글/영어 명칭이 어떻게 1:N 조인 관계 속에서 벼려 튀어나오는가?"
만약 이 텍스트 테이블에 언어 키 `SPRAS` 지정을 누락해 버리면, 다국어 1:N 관계가 파손되어 영문 로그인 사용자의 화면에 한글 이름표가 뭉개져 출력되는 형상 파손을 낳습니다.

**마스터 키와 언어 키(SPRAS) 복합 Primary Key 구조와, 세션 레지스터 sy-langu 의 묵시적 WHERE 조인 자동 처리 원천 기술**이 필요합니다. 그것이 **다국어 Text Table** 의 완수입니다.

### 무엇인가

#### 1. Text Table 의 SPRAS 복합 키 구조
- **다국어 격리**: **마스터 ZCONCERT 에 직접 '공연명' 컬럼을 박아선 안 된다. 다국어 지원을 위해 텍스트 테이블 ZCONCERT_T 를 찢어 분리하고, 키 구성으로 `CONCERT_ID + SPRAS` (언어키 - 1바이트) 복합 키를 꽂아 선고해야 한다. 그래야 동일한 공연 ID C001 에 대고 KO 에는 '정훈영 리사이틀', EN 에는 'JHY Recital' 로 언어별 이방인 이름표 레코드를 복수로 공존 보존할 수 있다.**

#### 2. sy-langu 의 묵시적 조인 (Implicit Text Translation)
- **세션 언어 매핑**: **사용자가 로그인할 때 아바 세션 레지스터 `sy-langu` 에는 로그인 언어('3' - 한국어, 'E' - 영어)가 적재된다. F4 도움말이나 사전 뷰어 엔진이 ZCONCERT 의 이름표를 읽어오려 텍스트 테이블과 조인(JOIN)을 쏘는 그 순간, 커널은 `WHERE SPRAS = sy-langu` 필터를 묵시적 자동으로 쿼리에 끼워 결선한다. 이로 인해 개발자가 손대지 않아도 각자의 모국어로 명칭이 찰딱 매핑 상속된다.**

### 어떻게 확인하는가

마스터와 텍스트 테이블을 Foreign Key 로 엮고 TMG로 언어별 텍스트를 적재하는 단계를 검증한다.

```text
[1단계] SE11 에서 ZCONCERT_T 텍스트 테이블 개설 :
   - Key: MANDT       -> Type: MANDT
   - Key: CONCERT_ID  -> Type: ZDE_CONCERT_ID (마스터 공유 키!)
   - Key: SPRAS       -> Type: SPRAS (표준 언어 키 결선!)
   - Field: CON_NAME  -> Type: ZDE_CON_NAME (공연명!)
   - 테이블 저장 및 활성화!
   
[2단계] Foreign Key 를 맺으며 Text Table 지정 :
   - ZCONCERT_T 의 CONCERT_ID 필드 선택 -> [Foreign Key] 클릭!
   - Check Table: ZCONCERT 기입!
   - Semantic Attributes 라디오 버튼에서 **"Key fields of a text table" (텍스트 테이블 지정)** 낙점 선고!
   - 복제 저장 및 활성화 완료! -> 이제 ZCONCERT 마스터의 공인 Text Table 로 ZCONCERT_T 가 메타 데이터 등록 완료!
   
[3단계] sy-langu 자동 필터링 테스트 :
   - KO 로그인 환경에서 ZCONCERT 조회 -> 텍스트 컬럼에 '한국 콘서트' 자동 조인 노출!
   - EN 로그인 환경에서 동일 ZCONCERT 조회 -> 텍스트 컬럼에 'ENG Concert' 자동 전환 노출 완료! (sy-langu 조인 작동 확인!)
```

#### 체험/시뮬레이터 설계 (sy-langu 번역 렌즈)
- **프로세스 플로우**:
  1. 학습자가 [ZCONCERT 마스터판] 과 [ZCONCERT_T 언어별 텍스트 판], 그리고 [F4 팝업창] 을 본다.
  2. [로그인 세션 언어 = KO] 로 설정한다. 
  3. [sy-langu 번역 렌즈] 가 활성화되더니, 텍스트 판에서 `SPRAS = '3'(KO)` 데이터만 자석처럼 낚아채어 마스터의 C001 뒤에 한글명 '공연' 을 찰딱 조인 접착해 F4 화면에 노출한다.
  4. 로그인 언어를 [EN] 으로 꺾어 스위칭하자, 렌즈 굴절이 바뀌며 영어 명칭 'Show' 가 조인 접착되는 다국어 자동 매핑 피드백을 감상한다.
- **상태 및 데이터**:
  - `텍스트 테이블 키 정의에서 SPRAS 필드를 누락해 저장한 상태` -> 런타임 결과: `Syntax error. Text table must contain language key field SPRAS` 하이라이트.
- **피드백**: 다국어 텍스트 지원의 구국 뼈대는 텍스트 테이블 찢기와 `SPRAS` 키 도킹이며, 세션의 `sy-langu` 가 이를 자동 필터링해 옴을 체득한다.

### 실수/주의

- **텍스트 테이블 Foreign Key 설정 시, 관계 속성에서 일반 1:N 이 아닌 "Key fields of a text table" 지정을 누락하여 F4 헬프 뷰어에서 코드명 옆에 한글 이름표가 안 나오는 뇌사 유발**:
  - 이 라디오 버튼을 켜주어야만 사전 엔진이 텍스트 테이블의 존재를 인식하므로 반드시 수호해 체크해야 합니다.

### 정리

- 명칭 다국어 지원은 **`마스터 키 + SPRAS (언어키)`** 복합 키로 구성된 별도의 **`Text Table`** 을 찢어 분리한다.
- 아바 커널은 텍스트 조인 시 **`sy-langu`** 값을 묵시적 조건 검색 주입하여 로그인 언어 맞춤형 번역 명칭을 노출한다.
- 마스터와의 관계 맺기 설정 시 반드시 **`Key fields of a text table`** 라디오 단추를 사수한다.

---

## CH09-L04 - Elementary Search Help

### 왜 필요한가

다국어 텍스트 테이블까지 격리 완수했다.
이제 사용자가 F4 를 칠 때 튀어나오는 검색 팝업창 레이아웃을 직접 정밀 설계하는 'Search Help 바인딩' 이 장벽입니다.
- " ZSH_CONCERT 라는 단일 소스 Elementary Search Help 를 만들었다. 
F4 를 눌러 팝업창에서 데이터를 골랐는데, 입력창에 데이터가 쌩뚱맞게 대입되지 않고 공백으로 남아버리는 버그가 난다. 
이 팝업과 입력창 간의 데이터 파이프라인 수송선은 어디가 꼬인 것인가?"
이 IMP(가져오기)와 EXP(내보내기)의 데이터 결선 흐름을 정교하게 이해하지 못하면, 검색 헬프 팝업만 화면에 둥둥 떠다니고 실재 데이터 대입은 불통되는 장애를 맞이합니다.

**Selection Method 에서 테이블 스캔을 따서 팝업창을 그리고, 팝업 입력값 IMP(Import) 와 화면 반환값 EXP(Export) 의 1:1 데이터 파이프라인 배선 기술**이 필요합니다. 그것이 **Elementary Search Help 설계**의 완수입니다.

### 무엇인가

#### 1. Elementary Search Help (단일 소스 검색 도움말)
- **단일 소스**: 단 1개의 테이블이나 뷰(`Selection Method`)를 소스 기지로 삼아, 어떤 필드로 검색을 소화하고 목록에 어떤 레이아웃(`LPos / SPos`)으로 칼럼을 배치할지 직접 커스텀 설계하는 F4 도움말이다.

#### 🧭 [ Search Help IMP / EXP 데이터 파이프라인 흐름 명세 ]
- *F4 가 기동될 때 화면과 팝업창 간에는 아래와 같이 양방향 데이터 수송 전선이 연결된다.*

```text
       [ 화면 입력 필드 : p_concert_id = 'C001' ] ───┐
                                                     │
                                                     ▼ ( IMP - Importing 파이프 )
       ┌─────────────────────────────────────────────┴────────────────────────┐
       │ [ F4 팝업창 검색 조건부 ]                                             │
       │  - IMP 파라미터가 켜진 CONCERT_ID 칸에 화면의 'C001' 이 촥 자동 입력됨 │
       │  - 사용자가 검색 버튼 클릭 -> 'C001' 기준으로 마스터 테이블 조회       │
       └─────────────────────────────────────────────┬────────────────────────┘
                                                     │
                                                     ▼ ( 사용자가 목록 중 1행 더블 클릭! )
       ┌─────────────────────────────────────────────┴────────────────────────┐
       │ [ F4 팝업창 목록 결과부 ]                                             │
       │  - 선택된 레코드의 CONCERT_ID 값인 'C001' 이                              │
       │    EXP 파라미터(Exporting) 수송 파이프를 타고 날아감                     │
       └─────────────────────────────────────────────┬────────────────────────┘
                                                     │
                                                     ▼ ( EXP - Exporting 파이프 )
       [ 화면 입력 필드 : p_concert_id <─── 'C001' 원샷 대입 완료! ]
```

#### 2. LPos 와 SPos
- **LPos (List Position)**: 검색된 목록 리스트 화면에서 이 필드가 몇 번째 열(Column)에 나타날지 가이드하는 배치 번호다.
- **SPos (Selection Position)**: 검색 조건 입력 화면단에서 이 필드가 몇 번째 라인(Row)에 위치할지 가이드하는 배치 번호다.

### 어떻게 확인하는가

SE11 에서 ZSH_CONCERT 단일 검색 도움말을 빚고 파라미터를 배선해 검증한다.

```text
[1단계] SE11 Search Help 설계 :
   - Search Help: ZSH_CONCERT -> Create 클릭 -> [Elementary Search Help] 낙점!
   - Selection Method: ZCONCERT (공연 마스터 테이블 결선!)
   
[2단계] 파라미터 수송 배선 설계 (IMP/EXP 및 포지션) :
   - Search Help Parameter: CONCERT_ID -> IMP: [Check] -> EXP: [Check] (★ 화면 값 받아가고, 고른 값 돌려준다!) -> LPos: 1 -> SPos: 1
   - Search Help Parameter: ARTIST     -> IMP: [ ]     -> EXP: [Check] (검색 조건은 안 받고, 목록에만 보이고, 돌려주기용!) -> LPos: 2 -> SPos: 2
   - Search Help Parameter: VENUE      -> IMP: [ ]     -> EXP: [ ]     (오직 목록 3열에 표시만 하고 돌려주진 않음!) -> LPos: 3 -> SPos: 0
   - 테이블 저장 및 활성화(Ctrl+F3) 격발!
   
[3단계] F4 기동 및 EXP 반환 검증 :
   - 테스트 렌즈(F8) 클릭 -> F4 격발 -> 아티스트 '정훈영' 검색 -> 목록에서 C001 더블 클릭!
   - 결과 확인: 화면 입력 필드에 'C001' 이 찰딱 자동 대입 복귀 성료! (EXP 파이프 결선 성공!)
```

#### 체험/시뮬레이터 설계 (IMP/EXP 파이프라인)
- **프로세스 플로우**:
  1. 학습자가 [화면의 PARAMETERS 입력 필드] 와 [F4 검색 도움말 팝업창], 그리고 그 사이를 잇는 [IMP 파이프] 와 [EXP 파이프] 를 본다.
  2. 필드에 'C001' 을 치고 F4 를 누른다.
  3. [IMP 파이프] 에 파란 물약이 촥 흐르더니 팝업창의 ID 검색 칸에 'C001' 이 채워진다.
  4. 팝업에서 공연을 고르고 더블 클릭한다.
  5. [EXP 파라미터 = ON] 상태다. [EXP 파이프] 에 초록 물약이 지잉 흘러가 화면 입력 필드 안방에 값을 채워준다.
  6. 만약 [EXP 파라미터 = OFF] 로 매핑을 끊으면, 더블 클릭해도 초록 파이프가 꽉 막혀 화면 칸이 텅 비어 있는 에러 피드백을 감상한다.
- **상태 및 데이터**:
  - `돌려줄 핵심 값인 CONCERT_ID 에 EXP 체크를 누락해 활성화한 상태` -> 런타임 결과: `F4 selection works but screen field remains blank` 하이라이트.
- **피드백**: Search Help 는 IMP 로 팝업을 예비하고 EXP 로 화면에 돌려보내는 양방향 배선 구조임을 머리에 새긴다.

### 실수/주의

- **LPos 와 SPos 번호를 전부 0 으로 기입하여 활성화 완료**:
  - F4 를 눌렀을 때 검색 창과 목록 창에 해당 컬럼이 아예 노출되지 않아 투명 팝업창이 뜨는 버그를 맞이합니다.
  - **최소 목록이나 조건 중 한 곳에는 `1` 이상의 포지션 번호를 수호해 기입해야 합니다.**

### 정리

- **`Elementary Search Help`** 는 단일 테이블/뷰를 소스 삼아 F4 화면을 직접 설계한다.
- **`IMP (Importing)`** 는 화면의 기존 값을 팝업 검색창 조건으로 끌어가 수송한다.
- **`EXP (Exporting)`** 는 사용자가 고른 최종 값을 화면 필드로 돌려보내 원샷 대입한다.
- **`LPos`** 와 **`SPos`** 는 각각 목록 열 위치와 조건 행 위치 번호다.

---

## CH05-L05 - Collective Search Help 기초

### 왜 필요한가

단일 소스 검색 도움말 설계를 완료했다.
이번에는 "공연 ID 로 찾고 싶거나, 아티스트 이름으로 찾고 싶거나, 콘서트 홀 장소로 찾고 싶을 때" 겪는 '다각도 F4 검색 요구' 가 장벽입니다.
- " 사용자가 F4 를 칠 때 검색 팝업창 하나에 탭(Tab)이 3개 나와서, 각각 다른 조건으로 검색하게 묶어주고 싶다.
이 여러 개의 Elementary SH 를 하나로 포장하는 Collective SH 의 파라미터 매핑 룰은 무엇인가?"
이 탭과 대장(Collective) 간의 파라미터 결선 대응을 완성해 주어야만, 사용자가 어느 탭에서 검색하든 간에 최종 타깃 값 `'CONCERT_ID'` 가 화면 필드로 정밀 복귀하는 결선을 장착합니다.

**복수 Elementary SH 를 탭 묶음으로 포장하는 Collective Search Help 구조와, Collective ↔ Elementary 간의 Parameter 매핑 결선 기술**이 필요합니다. 그것이 **Collective Search Help 탭 결선**의 완수입니다.

### 무엇인가

#### 1. Collective Search Help (복합 검색 도움말)
- **탭 포장지**: **자체적으로는 데이터를 긁어오지 않는 빈 껍데기 포장지다. 대신 이미 만든 여러 개의 Elementary SH 들을 구성원으로 삼아 F4 팝업창 내에 '탭 (Tab)' 비주얼로 정돈 배포하는 전산 묶음 장치다.**

#### 2. Collective Parameter 매핑 결선 (상속 배선)
- F4 팝업 탭에서 사용자가 2번 탭(아티스트 검색)을 골라 아티스트명 '정훈영' 을 쳤다. 
- 2번 탭 Elementary 가 ZCONCERT 에서 긁어온 `'C001'` 이, 대장인 Collective 의 `CONCERT_ID` 파라미터로 상속 대입되고, 그것이 최종 화면 필드로 복귀해야 한다.
- **해소**: Collective 정의 화면의 **`Parameter Assignment`** 단추를 클릭하여, 대장 `CONCERT_ID` 와 자식 `CONCERT_ID` 간의 **매핑 배선 (Assignment)** 을 1:1 로 연결해 주어야만 탭 간 통신 장벽이 뚫린다.

### 어떻게 확인하는가

Collective Search Help 를 생성하고 Elementary 들을 조립해 매핑을 검증한다.

```text
[1단계] SE11 Collective SH 선포 :
   - Search Help: ZSH_CONCERT_COLL -> Create 클릭 -> [Collective Search Help] 선택!
   - Parameter 정의 단에: CONCERT_ID (IMP/EXP 체크) 기입 완료!
   
[2단계] 자식 Elementary SH 탑재 :
   - [Included Search Helps] 탭으로 이동!
   - 1열: ZSH_CONCERT (공연 ID 로 찾는 자식)
   - 2열: ZSH_ARTIST (아티스트로 찾는 자식)
   - 3열: ZSH_VENUE (장소로 찾는 자식) 기입 완료!
   
[3단계] ★ 핵심: Parameter Assignment 상속 배선 체결 :
   - ZSH_CONCERT 라인 클릭 -> [Parameter Assignment] 클릭 -> Collective 의 CONCERT_ID 와 자식의 CONCERT_ID 가 1:1 선 연결되었음을 확인 후 [Copy]!
   - ZSH_ARTIST 라인 클릭 -> 동일 Assignment 1:1 선 연결 완료!
   - ZSH_VENUE 라인 클릭 -> 동일 Assignment 선 연결 완료!
   - 저장 및 활성화(Ctrl+F3) 격발! -> 이제 F4 치면 3개 탭이 기동되며 어느 탭이든 동일 ID 복귀 성공!
```

#### 체험/시뮬레이터 설계 (Collective Search Help 탭 시뮬레이터)
- **프로세스 플로우**:
  1. 학습자가 [ZSH_CONCERT_COLL Collective 대장] 과 [Included SH 3형제 (ID, 아티스트, 장소)], 그리고 [3탭 F4 팝업판] 을 본다.
  2. [아티스트 탭] 을 누르고 정훈영을 찾아 클릭한다.
  3. 자식의 `CONCERT_ID = C001` 데이터가 [Assignment 전선] 을 타고 지잉 흐르더니, Collective 대장의 `CONCERT_ID` 방으로 모이고, 그것이 다시 화면 필드로 원샷 도킹되는 상속 흐름을 본다.
  4. 이때 [ZSH_ARTIST 의 Assignment 전선 = CUT] 스위치를 때리자, 아티스트 탭에서 더블 클릭해도 대장 방으로 값이 안 올라가고 F4 창이 먹통이 되는 에러 피드백을 감상한다.
- **상태 및 데이터**:
  - `Included Search Helps 에 등록만 하고 Parameter assignment 매핑을 귀찮아서 생략한 상태` -> 런타임 결과: `F4 tab is rendered but double click returns no value to screen` 하이라이트.
- **피드백**: Collective 는 자식들의 탭 포장지며, Parameter Assignment 가 상속 통신의 생명선임을 터득한다.

### 실수/주의

- **Collective SH 에 자식 Elementary 들을 물려두면서, 자식 SH 들 중 하나가 활성화(Active)되어 있지 않은 상태로 묶어 올림**:
  - Collective 를 활성화할 때 하위 자식 링크가 깨졌다며 빨간 에러를 뿜고 활성화가 통째 차단 기각됩니다.
  - **자식 Elementary 들을 먼저 SE11 에서 완벽하게 활성화시킨 뒤 Collective 에 접착해야 합니다.**

### 정리

- **`Collective Search Help`** 는 복수의 Elementary SH 들을 하나의 F4 팝업창 내에 **`탭 (Tab)`** 으로 묶어 포장 배포한다.
- 자식 SH 가 긁어온 값을 화면에 넘기기 위해선 반드시 **`Parameter Assignment (매핑 결선)`** 을 상속 연결해 주어야 한다.
- 검색 소스가 단일 규격이면 **`Elementary`**, 다각도 탭 제공 필요시 **`Collective`** 로 아키텍처링한다.

---

## CH09-L06 - PARAMETERS와 DDIC F4 Help 연결

### 왜 필요한가

Collective SH 탭 결선까지 완수했다.
이제 내가 수고스럽게 설계한 Search Help 가 실제 아바 프로그램의 입력창(`PARAMETERS`)에 '자동으로 물려 나타나는 연결 범위' 가 장벽입니다.
- " ZSH_CONCERT 를 빚었다. 이걸 프로그램의 PARAMETERS p_id TYPE zde_concert_id 에 대고 F4 도움말로 작동시키려 한다.
F4 의 영향 범위를 넓게 전사로 공유해 재사용할 때와, 특정 필드 한 곳에만 콕 지정해 묶을 때의 부착 지점(Attach Point) 설정은 어떻게 다른가?"
그리고, 타입에 표준 Element 를 준 상태에서 내 전용 커스텀 Search Help 로 이 필드의 F4 목록만 즉석 변경하고 싶을 때 꽂아야 하는 명시 지시어를 알아야 합니다.

**Data Element 에 부착하는 전사 광범위 상속과, 테이블/구조체 필드 단위의 좁은 부착, 그리고 프로그램 입력창에 콕 짚어 선언하는 MATCHCODE OBJECT 배선 기술**이 필요합니다. 그것이 **Search Help 부착 지점 제어**의 완수입니다.

### 무엇인가

#### 1. F4 부착 지점 (Attach Points) 과 재사용 범위
- **Data Element 에 부착 (전사 광범위 상속)**: **ZDE_CONCERT_ID 데이터 엘리먼트 정의 화면(SE11)에 Search Help ZSH_CONCERT 를 꽂아 활성화한다. 이제 이 데이터 엘리먼트를 타입으로 상속받아 코딩되는 전사의 수백 개 테이블 컬럼 및 프로그램 `PARAMETERS p_id TYPE zde_concert_id.` 입력칸 전체에 F4 를 누르면 일제히 이 서치 헬프가 공통 기동된다. (재사용성이 극대화되고 유지보수가 편리하다.)**
- **테이블 필드 / 구조체 컴포넌트에 부착**: 해당 ZTABLE 이나 ZSTRUCTURE 안방의 그 필드 한 곳에만 Search Help 를 락온해 부착한다.
- **MATCHCODE OBJECT (프로그램 1칸 명시 저격)**: **`PARAMETERS p_id TYPE zde_concert_id MATCHCODE OBJECT zsh_concert_coll.` 처럼 소스 상에 명시적으로 지시어를 달아 꽂는다. 데이터 엘리먼트에 기본으로 걸려 있던 다른 도움말을 쌩 무시하고, 오직 이 한 칸의 입력창만 내가 원하는 커스텀 SH 로 F4 도움말을 교체해 저격(Override)하는 실무 최고 빈발 연결 장치다.**

### 어떻게 확인하는가

부착 지점을 다각도로 조립하여 PARAMETERS 화면에 F4 가 바인딩되는 단계를 검증한다.

```abap
REPORT zhello_f4_binding.

" 1. [ ZDE_CONCERT_ID Data Element 에 ZSH_CONCERT 가 전역 부착된 상태 ]
"    ( p_con1 은 별도 지시어가 없어도 F4 가 자동으로 ZSH_CONCERT Elementary SH 로 기동! )
PARAMETERS p_con1 TYPE zde_concert_id. 

" 2. [★ 명시적 저격 MATCHCODE OBJECT 기동: 데이터 엘리먼트 전역 설정을 override!]
"    ( p_con2 입력칸은 전역 기본 도움말 대신, ZSH_CONCERT_COLL Collective SH 탭이 기동! )
PARAMETERS p_con2 TYPE zde_concert_id 
  MATCHCODE OBJECT zsh_concert_coll.

START-OF-SELECTION.
  WRITE: / 'F4 부착 범위 결선 완료.'.
```

#### 체험/시뮬레이터 설계 (F4 부착 범위 보드)
- **프로세스 플로우**:
  1. 학습자가 [ZSH_CONCERT 검색칩] 과 [ZDE_CONCERT_ID Data Element 소켓], [ZBOOKING-CONCERT_ID 테이블 필드 소켓], [p_con2 프로그램 입력칸 소켓] 을 본다.
  2. [검색칩] 을 [Data Element 소켓] 에 꽂는다. [전사 연결망] 에 초록불이 촥 들어오더니 이 타입을 상속받은 모든 소켓에 F4 가 자동으로 상속 결선되는 걸 본다. (광범위).
  3. [MATCHCODE OBJECT 칩] 을 p_con2 에 직접 납땜해 꽂는다. 전사망 링크가 찰칵 꺾여 끊기고, 오직 p_con2 한 칸만 Collective 서치 헬프 탭으로 저격 결선되는 핀포인트 튜닝 피드백을 감상한다.
- **상태 및 데이터**:
  - `MATCHCODE OBJECT 뒤에 Search Help 가 아닌 Domain 명칭을 잘못 기입해 컴파일한 상태` -> 런타임 결과: `Syntax error. Search help "ZDO_CONCERT" not active or incorrect type` 하이라이트.
- **피드백**: F4 연결은 Data Element 부착이 재사용의 왕이며, 프로그램 단의 오버라이드는 `MATCHCODE OBJECT` 가 해결사임을 체득한다.

### 실수/주의

- **MATCHCODE OBJECT 를 쏠 때, 검색 도움말 이름으로 Z 가 아닌 표준 SAP SH 명칭을 Z접두어 없이 적어서 이송 시 컴파일 에러를 뿜으며 빌드가 차단되는 실수**:
  - 커스텀 개체는 무조건 **`Z`** 나 **`Y`** 로 작명해 꽂아야 함을 수호해야 합니다.

### 정리

- **`Data Element`** 에 Search Help 를 부착하면, 이를 참조하는 전사의 모든 필드에 F4 가 **`광범위 자동 상속`** 된다.
- **`MATCHCODE OBJECT [SH이름]`** 지시어는 프로그램 입력창에 커스텀 Search Help 를 **`명시적으로 콕 지정 오버라이드`** 한다.
- F4 가 결선되는 경로는 **`고정값`**, **`Foreign Key`**, **`Search Help`** 의 3축이다.

---

## CH09-L07 - Input Help 호출 우선순위

### 왜 필요한가

부착 범위와 MATCHCODE 최적화까지 완수했다.
이제 한 입력 필드에 고정값, 외래키, 서치 헬프 등이 복합 배선되어 충돌할 때 터지는 '엉뚱한 목록 출력 버그' 가 장벽입니다.
- " 한 개 입력 필드에 Domain 고정값도 걸려 있고 Check Table 외래키도 걸려 있다.
F4 를 누르는 순간, 내 의도와는 다른 쌩뚱맞은 도메인 고정값 2개만 달랑 팝업에 나타나는 이유는 SAP 커널의 우선순위 사다리가 어떻게 작동하기 때문인가?"
이 6단계 우선순위 사다리(Priority Ladder)의 작동 원리를 모르면, 여러 장치를 덧칠해 걸어두고 "왜 팝업에 이게 나오지?" 하며 디버거만 붙들고 삽질하는 뇌사 현상을 겪습니다.

**F4 격발 시 1단계(코딩) -> 2단계(MATCHCODE) -> 3단계(DE SH) -> 4단계(Check Table) -> 5단계(Domain 고정값) -> 6단계(달력/계산기)의 6단계 우선순위 사다리 게이팅 수호 기술**이 필요합니다. 그것이 **F4 우선순위 장악**의 완수입니다.

### 무엇인가

#### 🧭 [ 6단계 Input Help (F4) 호출 우선순위 사다리 명세 ]
- *F4 단추를 때리는 그 찰나, 아바 커널은 위에서부터 한 단계씩 검사해 있으면 아래는 거들떠보지도 않고 채택 격발한다.*

```text
[1단계] 코드로 직접 만든 F4 (AT SELECTION-SCREEN ON VALUE-REQUEST) [최우선 (🥇)] :
   - 프로그램 이벤트 단에 개발자가 쌩 ABAP 코드로 F4_FILENAME_GET 이나 F4IF_INT_TABLE_VALUE_REQUEST 펑션 모듈을 쑤셔 넣어 짠 경우다. 사전 설정을 전부 쌩 무시하고 이 로직이 1순위로 격발된다.
   │
[2단계] MATCHCODE OBJECT 명시 지정 :
   - PARAMETERS 선언 우측에 명시 선포한 Search Help 가 2순위로 격발된다.
   │
[3단계] Table Field / Data Element 에 부착된 Search Help :
   - 데이터 엘리먼트 정의에 꽂아둔 ZSH_* 검색 도움말이 3순위로 당선된다.
   │
[4단계] Check Table & Text Table (Foreign Key 외래키) :
   - 외래키 관계가 맺어짐으로써 기동되는 체크 테이블의 마스터 키 리스트와 텍스트 명칭 조인이 4순위로 뜬다.
   │
[5단계] Domain 고정값 (Fixed Values) :
   - 도메인 정의단에 콕 박아둔 값 목록(예: status 필드의 'A:승인', 'B:대기')이 5순위로 격발된다.
   │
[6단계] 타입 기본 도움말 [최하위 (🥉)] :
   - 아무것도 안 걸었어도, D 타입이면 달력, T 면 시계, I 면 계산기가 뜬다.
```

### 어떻게 확인하는가

F4 호출 사다리를 한 단계씩 토글 갱신하며 우선순위가 동작하는지 확인한다.

```text
[1단계] 우선순위 충전 (5단계와 4단계 충돌 테스트) :
   - ZDE_STATUS Data Element 도메인 ZDO_STATUS 에 Fixed Values 'A', 'B' 기입 (5단계)
   - ZBOOKING-STATUS 필드에 Check Table ZTSTATUS 연결 (4단계 외래키)
   - [결과]: F4 격발 시 5단계 고정값이 아닌, 4순위인 Check Table 마스터 리스트가 팝업으로 격발 완료! (우선순위 게이트 작동 성공!)
   
[2단계] 3단계 도입에 의한 4단계 밀어내기 :
   - ZDE_STATUS 에 Search Help ZSH_STATUS 를 새로 부착 (3단계)
   - [결과]: F4 격발 시 4단계 체크 테이블 대신, 3순위인 ZSH_STATUS 커스텀 검색창이 점등 완료! (상위 사다리 채택!)
   
[3단계] 2단계 지정에 의한 3단계 밀어내기 :
   - PARAMETERS p_stat TYPE zde_status MATCHCODE OBJECT zsh_other_sh. (2단계)
   - [결과]: F4 격발 시 3단계 ZSH_STATUS 가 쌩 오버라이트되고, 2순위인 zsh_other_sh 가 최종 팝업창으로 찰딱 격발 완료!
```

#### 체험/시뮬레이터 설계 (F4 우선순위 핀볼)
- **프로세스 플로우**:
  1. 학습자가 [F4 기계 핀볼 레일] 과 [1~6단계 게이트], 그리고 [F4 격발 볼] 을 본다.
  2. [5단계: Domain 고정값 = ON] 과 [4단계: Check Table = ON] 스위치를 켠다.
  3. F4 볼이 굴러 떨어진다. 1~3단계 게이트는 비어 있어 통과하고, [4단계 Check Table 게이트] 에 부딪혀 팅 하며 팝업창을 격발하고 아래로 흐르지 않는다. (5단계 고정값은 거들떠보지도 않음).
  4. [2단계: MATCHCODE = ON] 스위치를 켠다. F4 볼이 구르자마자 2단계 게이트에서 즉시 낚여 격발되는 핀볼 사다리 피드백을 감상한다.
- **상태 및 데이터**:
  - `상위 1단계 코드가 걸려 있는데 사전의 3단계 Search Help 가 왜 안 나오는지 헤맨 상태` -> 런타임 결과: `Logic check. Code-driven F4 has absolute priority over DDIC` 하이라이트.
- **피드백**: F4 는 철저한 6단계 우선순위 지배 룰을 타며, 상위 레벨이 채택되면 하위는 즉시 기각 차단됨을 각인한다.

### 실수/주의

- **도메인 고정값 Fixed Values 가 팝업에 나와야 하는데, 데이터 엘리먼트에 실수로 걸어둔 미사용 Search Help 가 3순위로 먼저 낚여 엉뚱한 검색창이 나오는 실수**:
  - 3순위 SH 가 5순위 고정값을 밀어버렸기 때문이므로, 사용하지 않는 데이터 엘리먼트 단의 SH 연결 링크를 SE11 에서 제거 수호해야 합니다.

### 정리

- Input Help (F4) 격발 시 아바 커널은 **`6단계 우선순위 사다리`** 를 짚어 한 곳만 띄운다.
- 최우선은 **`AT SELECTION-SCREEN ON VALUE-REQUEST 코딩`** 이며, 최하위는 **`타입 기본 도움 (달력 등)`** 이다.
- 선언적 우선권은 **`MATCHCODE OBJECT (2순위)`** 와 **`Search Help (3순위)`** 가 **`Check Table (4순위)`** 및 **`고정값 (5순위)`** 을 오버라이트 밀어낸다.

---

## CH09-L08 - DDIC 검증과 프로그램 검증의 역할 분리

### 왜 필요한가

우선순위 사다리 통제까지 완수했다.
이제 테이블 무결성을 지키기 위한 검증 수립 시 '선언적 DDIC 검증과 프로그램 코드 검증의 역할 경계 붕괴' 가 장벽입니다.
- " Foreign Key 로 입력 제한을 걸었다. 
그런데 왜 사용자가 쌩 리포트를 돌릴 때, 1,000만 원 한도 초과 거래처 데이터가 아무 에러 없이 테이블 장부에 인서트되는가?"
외래키나 도메인 고정값은 오직 화면(GUI/TMG)의 검문소일 뿐이며, 비즈니스 규칙(한도, 권한, 상태 전이)은 코드가 수동으로 책임져야 하는 경계를 모르면, 시스템에 중대 회계 정합성 파손 에러가 침투합니다.

**존재/형식 무결성을 전담하는 DDIC 선언적 검증과, 한도/권한/상태전이를 조율하는 프로그램 코드 검증의 역할 분리 원칙과 직접 DB 쓰기 시의 검증 우회 방어 기술**이 필요합니다. 그것이 **검증 역할 분리**의 완수입니다.

### 무엇인가

#### 🧭 [ DDIC 선언적 검증 vs 프로그램 코드 검증 역할 분리 명세 ]
- *무엇을 어디서 검증할지 선을 그어야 소스 스파게티 화와 무결성 붕괴를 막는다.*

```text
[1] DDIC 선언적 검증 (존재 / 형식 무결성 전담 - SE11) :
   - 대상 : 국가코드 'KR' 이 실제 존재하는가? 공연 ID 가 ZCONCERT 에 진짜 사나?
   - 기작 : Foreign Key, Domain 고정값, DataType 길이 체크.
   - 장점 : 화면에서 쌩 코딩 없이 커널이 선제 차단하며, 전사 재사용성이 극대화됨.
   - ★ 제약 : 직접 DB 쓰기 (INSERT ZTABLE) 시에는 이 검증이 완전히 우회됨!
   │
[2] 프로그램 코드 검증 (비즈니스 임계값 / 동적 제어 전담 - SE38) :
   - 대상 : 예매 정원이 초과(SEATS > CAPACITY)했는가? 퇴직한 사원인가? 권한이 있나?
   - 기작 : SELECT SINGLE + IF 조건판단 + MESSAGE E 격발.
   - 역할 : 직접 DB 쓰기 직전에 존재 무결성을 한 번 더 SELECT 검증해 우회 데이터 오염 차단!
```

#### 2. 원칙 : 중복 검증 배제와 무결성 사수
- 국가코드 존재 여부 같이 DDIC 가 해줄 수 있는 1차 관문은 무조건 도메인/외래키로 위임해 프로그램 소스 라인을 낭비하지 않는다.
- 반면, 시간과 상태에 따라 변하는 동적 비즈니스 규칙은 프로그램 코드 내에서 **`SELECT SINGLE ... IF sy-subrc <> 0.`** 수문장을 세워 최종 검증을 완성한다.

### 어떻게 확인하는가

DDIC 검증을 우회하는 직접 쓰기를 코드로 검증해 차단하는 로직을 검증한다.

```abap
REPORT zhello_validation_gate.

DATA: gs_booking TYPE zbooking,
      gv_dummy   TYPE zconcert-concert_id.

gs_booking-booking_id = 'B999'.
gs_booking-concert_id = 'C999'. " ZCONCERT 에 없는 유령 공연 코드!

" 1. [★ 직접 쓰기(INSERT) 전에, DDIC 외래키 우회를 방어하기 위한 수동 존재 검증 격발!]
SELECT SINGLE concert_id 
  FROM zconcert
  INTO gv_dummy
  WHERE concert_id = gs_booking-concert_id.

" 2. [ 3. 존재하지 않는다면 가차 없이 에러를 방출하고 DB 인서트 기각! ]
IF sy-subrc <> 0.
  MESSAGE 'ZCONCERT 마스터에 등록되지 않은 공연이므로 예매 저장이 기각됩니다.' TYPE 'S'.
  " EXIT/RETURN
ELSE.
  " 4. [ 통과 시에만 실제 디스크 장부에 인서트 실행! ]
  INSERT zbooking FROM gs_booking.
ENDIF.
```

#### 체험/시뮬레이터 설계 (검증 책임 라우터)
- **프로세스 플로우**:
  1. 학습자가 [국가코드 존재 체크], [정원 초과 여부], [퇴직 사원 여부], [타입 크기 일치] 4개 핀볼을 본다.
  2. [DDIC 분기] 와 [프로그램 코드 분기] 레일이 열려 있다.
  3. [국가코드] 와 [타입 크기] 볼을 굴리면, [DDIC 레일] 로 찰딱 굴러 들어가 쌩 코딩 없이 가볍게 정렬 통과된다.
  4. [정원 초과] 와 [퇴직 사원] 볼을 굴리자, 복합 연산이 필요해 [프로그램 코드 레일] 로 굴러 들어가 SELECT SINGLE 집게와 IF 조건망을 통과하는 역할 분배 피드백을 감상한다.
- **상태 및 데이터**:
  - `금액 한도 체크 같은 동적 비즈니스 룰을 도메인 고정값에 억지로 집어넣으려 한 상태` -> 런타임 결과: `Syntax error. Dynamic comparison rules not supported in Fixed Values` 하이라이트.
- **피드백**: 형식/존재는 DDIC 로 위임하되, 직접 DB 쓰기 시 외래키가 우회되므로 소스 상의 수동 존재 검증은 프로그램의 몫임을 명확히 인지한다.

### 실수/주의

- **국가코드 체크 같은 단순 존재 검증을, 굳이 외래키를 생략한 채 모든 프로그램마다 SELECT SINGLE 로 중복 중복 수동 코딩해 두어 소스를 복잡하게 만듬**:
  - 나중에 체크 테이블이 바뀌면 수십 개 프로그램을 다 수정하는 훼손을 낳습니다.
  - **단순 존재는 무조건 외래키로 이관 수호해야 합니다.**

### 정리

- **`존재 / 형식`** 검증은 선언적이고 재사용이 용이한 **`DDIC (외래키, 고정값)`** 계층으로 위임한다.
- **`동적 비즈니스 룰`** (한도, 권한, 상태 전이 등)은 **`프로그램 코드`** 가 책임진다.
- 직접 DB 쓰기(`INSERT/MODIFY`)는 DDIC 외래키를 **`우회`** 하므로, 쓰기 직전 소스 내의 **`SELECT SINGLE 존재 검증`** 수문장은 프로그램의 의무다.

---

## CH09-L09 - 실습 — 콘서트 모델 만들기 (DDIC)

### 왜 필요한가

역할 분리 원칙까지 완수했다.
이제 아카데미의 두 번째 졸업 이정표로서 '공연(ZCONCERT), 회차(ZPERF), 예매(ZBOOKING) 테이블 3각 뼈대를 SE11 에서 개설하고 외래키와 서치 헬프 ZSH_CONCERT 를 엮는 캡스톤 실습' 완수가 최종 관문입니다.
- " ZCONCERT, ZPERF, ZBOOKING 테이블을 빚고 공연 2개, 회차 3개, 예매 3건을 TMG 로 인서트했다.
이 캡스톤 환경에서 없는 공연 ID 를 기입해 무결성 PAI 락을 터트리고, F4 팝업을 기동해 ZSH_CONCERT 의 EXP 파이프를 통해 값이 대입되는 최종 정합성을 어떻게 점검하는가?"
이 콘서트 모델을 완벽히 구축해 두어야만, 다음 10장에서 배울 '잔여석 계산 및 예매 승인 연산 펑션 모듈' 로 도약할 수 있습니다.

**ZCONCERT/ZPERF/ZBOOKING 복합 키 테이블 아키텍처링과, ZSH_CONCERT 검색 도움말 결선 및 TMG 데이터 인서트 완료 후 F4 팝업을 통한 최종 입력 무결성 검증 기술**이 필요합니다. 그것이 **콘서트 모델 빌드 캡스톤**의 완수입니다.

### 무엇인가

#### 1. 콘서트 예매 앱 3대 마스터-상세 모델 구축
- **`ZCONCERT` (마스터)**: 공연 정보를 담는 기지. 키 필드 `MANDT + CONCERT_ID`.
- **`ZPERF` (상세)**: 공연의 날짜별 회차 정보. 키 필드 `MANDT + CONCERT_ID + PERF_NO`. (마스터의 `CONCERT_ID` 를 물고 늘어지는 구조).
- **`ZBOOKING` (예매 실적)**: 예매 거래 내역. 키 필드 `MANDT + BOOKING_ID`. 마스터의 `CONCERT_ID` 와 `PERF_NO` 를 외래키로 수호하는 결선 구조.

#### 2. ZSH_CONCERT (공연 검색 팝업) 결선
- F4 팝업 격발 시 `ZCONCERT` 마스터로부터 `CONCERT_ID`, `ARTIST`, `VENUE` 를 스캔해 리스트를 예쁘게 렌더링하고, 더블 클릭 시 `CONCERT_ID` 가 `ZBOOKING-CONCERT_ID` 화면 입력 필드로 **`EXP`** 찰딱 대입 복귀하도록 도킹한다.

#### ⚠️ [ 10장 함수 모듈 연계 징검다리 명세 ]
- **현재의 콘서트 모델은 데이터 보관함만 뚫렸을 뿐, 비즈니스 계산기(로직)가 없다.**
- **불편 직면**: **예매를 저장하려는데 '공연 정원 CAPACITY 가 100석인데 이미 예매된 좌석이 95석이어서, 신규 10석 예매는 초과 거절되어야 한다' 는 복합 업무 판단은 이 사전(DDIC) 테이블 뼈대만으로는 처리할 수 없다.**
- **도약**: **이 잔여석 집계 연산과 승인 판단을 공용 모듈로 포장하여 모든 프로그램이 나누어 쓰게 통제하려면, 다음 10장의 Function Module (함수 모듈)과 Subroutine 의 단위 모듈화 세계로 넘어가 연산 로직을 빌드해야 함을 입증한다.**

### 어떻게 확인하는가

콘서트 모델 테이블과 서치 헬프를 조립 기동하고 데이터를 검수한다.

```text
[1단계] SE11 에서 3대 콘서트 테이블 굴착 완료 :
   - ZCONCERT, ZPERF, ZBOOKING 생성 및 Technical Settings Data Class APPL1 지정 활성화!
   - ZBOOKING-CONCERT_ID 에 Check Table ZCONCERT 외래키 매핑 완료!
   
[2단계] ZSH_CONCERT Search Help 개설 및 ZBOOKING 필드 도킹 :
   - SE11 -> ZSH_CONCERT Elementary SH 생성 (Selection Method: ZCONCERT)
   - 파라미터 CONCERT_ID 에 IMP/EXP 결선 배선 완료!
   - ZBOOKING 테이블 Edit 화면 진입 -> CONCERT_ID 필드에 ZSH_CONCERT 서치 헬프 명시 부착 활성화!
   
[3단계] TMG 데이터 적재 및 입력 락 작동 검수 성료 :
   - SM30 ZCONCERT 진입 -> C001 (정훈영 클래식, 정원 100), C002 (손흥민 토크쇼, 정원 50) 적재!
   - SM30 ZPERF 진입 -> C001/01/20260701, C001/02/20260702 적재!
   - SM30 ZBOOKING 진입 -> CONCERT_ID 에 유령 키 'C999' 기입하고 Enter -> PAI 외래키 락 격발되어 입력 기각 확인!
   - F4 단추 클릭 -> ZSH_CONCERT 팝업창 점등 -> 'C001' 더블 클릭 -> 입력창에 'C001' 이 EXP 파이프를 타고 찰딱 대입 복귀 성공! (캡스톤 무결성 검수 성공!)
```

#### 체험/시뮬레이터 설계 (콘서트 모델 제작 체크리스트)
- **프로세스 플로우**:
  1. 학습자가 [ZCONCERT (공연)], [ZPERF (회차)], [ZBOOKING (예매)] 3대 테이블 연결 기어와 [ZSH_CONCERT 팝업창] 을 본다.
  2. [1. 테이블 개설] 스위치를 켜자 기어 3개가 회전하기 시작한다.
  3. [2. 외래키 결선] 전선을 ZBOOKING 과 ZCONCERT 사이에 물린다.
  4. 없는 공연 ID 기입 테스트를 단행하자, [외래키 차단 밸브] 가 덜컥 닫히며 C999 구슬을 차단하는 모션을 본다.
  5. [3. 서치 헬프 F4] 를 누르자 [ZSH_CONCERT 팝업판] 이 날아와 C001 구슬을 낚아 EXP 파이프를 타고 입력 필드로 촥 복귀 대입하는 최종 결선 완료 피드백을 감상한다.
- **상태 및 데이터**:
  - `TMG Function Group 에 쌩뚱맞은 권한 그룹을 잘못 배정해 화면 기동이 차단된 상태` -> 런타임 결과: `Authority check fail. Maintenance access denied` 하이라이트.
- **피드백**: 콘서트 예매 앱의 3대 데이터 뼈대는 정교한 외래키와 서치 헬프가 접착되어야 무결성을 수호하며, 잔여석 계산을 위해선 다음 10장 함수 모듈이 징검다리임을 체득한다.

### 실수/주의

- **ZPERF (회차) 복합 키 구성 시, CONCERT_ID 와 PERF_NO 두 필드를 전부 Key 체크하지 않고 PERF_NO 만 Key 체크해 2개 공연에 회차 번호가 중복 입력되는 뇌사 초래**:
  - 공연별 회차가 독립 저장되지 못하고 뒤섞이는 대재앙을 낳으므로 복합 키 구성을 정교하게 수호해 체크해야 합니다.

### 정리

- 콘서트 예매 데이터 모델은 **`ZCONCERT (공연마스터)`**, **`ZPERF (회차상세)`**, **`ZBOOKING (예매실적)`** 의 3축 관계 구조로 구축한다.
- **`ZSH_CONCERT`** Elementary SH 를 엮어 화면 필드에 **`EXP 파라미터 대입`** 을 완성한다.
- TMG 화면에서 없는 공연 코드 입력 시 **`외래키 무결성 PAI 락`** 이 정상 격발됨을 확인한다.
- 테이블 뼈대 구축을 넘어 정원 초과 계산 등의 동적 비즈니스 연산을 빌드하기 위해선 다음 **`CH10 Function Module (함수 모듈)`** 로 진입해야 함을 명세한다.
