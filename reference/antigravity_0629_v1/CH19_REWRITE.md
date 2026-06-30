# CH19_REWRITE - Modern ABAP SQL v1

> 목적: `content/abap/CH19`의 8개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH19 전체 설계

CH19의 한 문장 목표는 "DB 데이터와 ABAP 메모리 값의 물리적 경계를 콤마(,)와 escape 마커(@)로 명확히 분리하고, `@DATA()` 인라인 타깃 선언, SQL Expression(CASE/CAST/COALESCE)과 내장 함수형 API를 통한 DB 가공 연산, 메모리 내부 테이블을 SQL로 집계하는 `SELECT FROM @itab` 구조를 도입하여, 기존 classic 예매 조회와 집계 리포트 쿼리를 무결한 Modern SQL 패러다임으로 전면 전환하고 성능적 한계와 논리적 함정을 가드한다"이다.

IT 비전공자 입문자는 콤마와 공백을 뒤섞어 쓰거나, `@` 호스트 escape 마커를 누락하여 컴파일러의 strict 모드 경고에 부딪힌다. 또한, 조인(JOIN)한 쿼리를 `@DATA()` 인라인 타깃으로 받았다가 컴포넌트 경로가 중첩 구조체(Nested Structure - `wa-scarr-carrid`)로 꼬여서 변수를 찾지 못해 절망한다. 
이에 더해, `SELECT FROM @itab` 가동 시 String/Reference 등 딥 타입(Deep Type) 컬럼을 올려두고 영문 모를 컴파일 차단을 당하며, Outer Join 시 취소 예매 제외 조건을 `WHERE` 에 넣었다가 예약 없는 공연까지 싹 증발시키는 참사를 낸다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **물리 경계 Escape (@)**: DB 세션과 ABAP 애플리케이션 메모리 서버의 명확한 경계 긋기 $\rightarrow$ ABAP 출신 변수/상수/범위 테이블 이름 앞에 **`@`** escape 마커를 의무 장착하는 원리 규명.
2. **strict 컴파일 모드**: 콤마와 공백을 혼합하면 strict 모드가 발동해 빌드를 거부하는 가혹한 검문 규칙 분석.
3. **인라인 그릇 (@DATA)**: 미리 변수 타입을 선언할 필요 없이 쿼리가 돌아가는 즉시 그 결과를 수납할 그릇 테이블을 자동 설계하는 **`@DATA( )`** 인라인 타깃 선언.
4. **Empty Key 성능 트레드오프**: 인라인 선언으로 자동 생성된 내부 테이블은 `Standard Table with EMPTY KEY` 형태로만 빚어지므로, 이 테이블에 특정 키 필드로 READ TABLE을 연타할 때 발생하는 테이블 풀 스캔(Full Scan) 성능 트랩과 방안 제시.
5. **AS 별칭 강제 규칙**: 계산 컬럼이나 JOIN 컬럼, 단일 엘리멘트 `table_line` 조회 시 인라인 타깃이 필드 이름을 추론할 수 있게 명시적으로 칭호를 부여하는 **`AS alias`** 의무화 명세.
6. **DB 연산 이송 (CASE/CAST/COALESCE)**: 데이터를 다 긁어와 ABAP LOOP를 돌며 정돈하던 옛 방식 $\rightarrow$ DB 단에서 CASE 분기, CAST 형변환, **`COALESCE`** null 대체 연산을 완료해서 적재하는 가공 이송 기법.
7. **개념 격리 (DB Null vs ABAP Initial)**: DB가 가진 null의 부재 개념과 ABAP의 빈 값(공백, 0, 초기날짜)의 메모리 실재 개념을 명확히 격리.
8. **인덱스 시작점 격리**: 1부터 시작하는 SQL **`SUBSTRING`** 과 0부터 시작하는 ABAP **`substring`** 의 주체별 인덱싱 시작값 격리.
9. **메모리 SQL (@itab)**: DB를 재접속해 쿼리하지 않고, 메모리에 얹혀있는 내부 테이블을 소스로 SQL을 돌려 필터링하고 집계(SUM/GROUP BY)하는 **`SELECT FROM @itab`** 기법.
10. **Deep Type string 제약과 SSTRING**: `@itab` 가동 시 Deep Type(String/Ref)의 탑재 금지 제약을 해소하기 위해 ABAP Dictionary의 **`SSTRING`** 을 매핑 참조하는 물리 우회 설계 명세.
11. **종합 실습 - ON vs WHERE 배치 함정**: 콘서트 예매현황 조회를 모던 콤마 쿼리로 전환하고, 취소 예매 제외 조건(`status <> 'C'`)을 `WHERE` 에 꽂았을 때 Left Outer Join의 null 행을 소멸시키는 논리 오류를 `ON` 절 배치로 복구하여 예약 없는 공연(C003)의 0건booked를 수호하는 종합 캡스톤 튜닝 완료.

---

## CH19-L01 - Classic Open SQL과 Modern ABAP SQL 비교

### 왜 필요한가

우리가 전 챕터에서 ABAP 문법을 모던화하면서도, 데이터베이스에서 값을 긁어오는 `SELECT` 쿼리문만큼은 일부러 옛날 고전 형식을 그대로 유지했다. 
고전 SELECT는 `SELECT carrid connid FROM spfli INTO TABLE lt_flight WHERE carrid = lv_carr.` 처럼 필드를 나열할 때 아무 기호 없이 띄어쓰기(공백)로만 나눴다. 
또한 `lv_carr` 이나 `lt_flight` 같은 변수들도 그냥 아무 마킹 기호 없이 테이블 컬럼명과 똑같은 모양새로 적어두었다. 
이로 인해 코드를 읽는 개발자는 "이 단어가 DB 테이블에 들어있는 컬럼 명칭인지, 아니면 우리 ABAP 메모리에 살고 있는 변수방 이름인지" 이름 명명 규칙에 전적으로 기대어 어림짐작해야 했다. 무엇보다 컴파일러도 경계가 애매하여 SQL의 잠재적 오작동을 컴파일 시점에 미리 잡아내지 못하는 유약함이 있었다.

**DB 세계에 들어있는 컬럼과, 내 ABAP 프로그램 안에 들어있는 변수 값의 물리적 경계를 기호로 칼같이 못 박아 분리하고, 필드 사이도 콤마(,)로 명확히 끊어내어 컴파일러의 초정밀 문법 감시 모드(strict mode)를 기동시키는 기술**이 필요하다. 그것이 **Modern ABAP SQL** 의 장착이다.

### 무엇인가

#### 1. Modern SQL의 3대 외형 규칙
- **필드 사이의 쉼표(,)**: `SELECT carrid connid` 로 띄어 쓰던 목록을 **`SELECT carrid, connid`** 와 같이 쉼표로 명확하게 구획한다.
- **Escape 마커 `@`**: ABAP 프로그램 메모리에 실재하는 변수, 상수, 범위 테이블(Range Table), 그리고 결과 수령 테이블 이름 앞에 골뱅이 **`@`** 기호를 의무적으로 부착한다. (예: `@lv_carr`, `@lt_flight`).
- **INTO 절의 최하단 배치**: `INTO` 구문을 중간에 샌드위치처럼 구겨 넣지 않고, `SELECT -> FROM -> WHERE -> INTO` 순으로 읽히도록 문장의 맨 꼬리로 밀어 고정한다.

#### 2. Strict 모드 (엄격한 컴파일러 모드) 의 작동
- 쿼리 안에 콤마를 하나라도 찍거나 `@` 기호를 장착하면, 아바 컴파일러는 내부적으로 **strict 모드(엄격한 문법 검사)** 기어를 자동으로 올린다.
- 이 모드에서는 고전 아바 SQL에서 통용되던 애매하고 느슨한 문법을 허용하지 않고 컴파일 에러로 싹 거부해 내기 때문에, 개발자가 런타임에 유발할 데이터 결함을 코드 빌드 시점에 100% 잡아낼 수 있다.

### 어떻게 확인하는가

에디터에서 classic 쿼리를 modern 콤마 및 골뱅이 쿼리로 리팩터링하여 컴파일이 통과되는 구조를 검증한다.

```abap
REPORT zch19_l01_compare.

DATA: gt_flight TYPE STANDARD TABLE OF sflight,
      gv_carr   TYPE sflight-carrid.

START-OF-SELECTION.
  gv_carr = 'LH'.

  " [ classic 쿼리 - 콤마 없고 골뱅이 없음, INTO가 중간에 위치 ]
  SELECT * FROM sflight INTO TABLE gt_flight WHERE carrid = gv_carr.

  " [ modern 쿼리 - 필드 개별 선택 시 콤마 장착, host 변수에 @ 부착, INTO 절 최하단 이동 ]
  SELECT carrid, connid, seatsmax
    FROM sflight
    WHERE carrid = @gv_carr
    INTO TABLE @gt_flight.
```

#### 체험/시뮬레이터 설계 (Classic → Modern SQL Converter)
- **프로세스 플로우**:
  1. 학습자가 좌측 패널에 [SELECT carrid connid FROM sflight WHERE carrid = lv_carr] 라는 고전 쿼리 칩 카드를 밀어 넣는다.
  2. [쉼표 콤마 장착] 버튼을 누르자, 필드 사이에 붉은색 콤마 `,` 기호가 촥 도킹된다.
  3. [골뱅이 마커 결합] 버튼을 누르자, `lv_carr` 단어 머리 위에 녹색 `@` 기호가 붙으며 "ABAP 메모리 변수 식별 완료!" 자막이 뜬다.
  4. [INTO 절 꼬리 이동]을 클릭하자, `INTO` 꼬리가 맨 밑바닥으로 스르륵 밀려 내려앉으며 strict 컴파일 전광판에 녹색 "Strict Mode Approved" 승인 배지가 뜨는 정밀 변환 애니메이션을 감상한다.
- **상태 및 데이터**:
  - `SELECT carrid, connid FROM sflight WHERE carrid = lv_carr (콤마는 썼는데 @를 누락한 과도기 상태)` -> 컴파일 경보: `When column list is comma-separated, host variables must be escaped with @`.
- **피드백**: 모던 SQL의 핵심은 콤마와 `@` 의 정합성이며, 둘 중 하나를 켜는 순간 strict 컴파일러 검문소가 동작하여 어중간한 혼용은 원천 차단당함을 인지시킨다.

### 실수/주의

- **한 SQL 쿼리 내에서 클래식과 모던의 난폭한 혼용**: "필드는 콤마 없이 공백으로 나열하고, WHERE 조건 절의 변수명 앞에는 `@` 를 붙여서 써야지" 했다가는, strict 컴파일 파서가 문법 모순 에러를 뿜으며 실행을 차단하므로, **모던 SQL을 가동할 때는 반드시 콤마와 `@` 가 완벽한 패키지로 동시 탑재**되어야 함을 엄수해야 한다.

### 정리

- Modern ABAP SQL은 **콤마(,) 구분, 골뱅이(@) 마크, INTO 절 꼬리 배치**가 3대 규격이다.
- 이 문법을 타는 순간 컴파일러는 **strict 모드**로 전환되어 잠재 결함을 색출한다.
- DB 컬럼명에는 `@` 를 절대로 붙이지 않고, **오직 ABAP 메모리 변수/상수/그릇에만** 붙인다.

---

## CH19-L02 - @ Host Variable과 Host Expression

### 왜 필요한가

모던 SQL의 기본 3대 외형을 장착했다. 
그런데 본질적인 질문이 고개를 든다. "도대체 왜 골뱅이 `@` 기호를 붙여가며 변수들을 피곤하게 귀양 보내듯이 표시(Escape)해야 하는가?"
이유는 물리적 아키텍처에 있다. 우리의 아바 프로그램 변수는 **'애플리케이션 서버 메모리'** 영역에 실재하고, `SELECT` 문을 건네받아 실제로 데이터를 끄집어내는 가공 연산은 물리적으로 분리된 **'데이터베이스(DB) 서버'** 내의 SQL 프로세스에서 집행된다. 
두 영역이 완벽히 절연되어 있기 때문에, DB 엔진에게 쿼리 팩을 넘겨줄 때 "야, 이 문장 속에서 `lv_carr` 은 너네 DB 테이블에 들어있는 컬럼 이름이 아니고, 저 멀리 아바 메모리 방에 들어있는 동적인 임시 값이니까 알아서 치환해서 실행해라" 고 꼬리표를 명확히 달아주어야 한다. 
그렇지 않으면 DB 엔진은 이를 컬럼으로 오해하여 테이블 안에서 `lv_carr` 이라는 컬럼을 찾아 헤매다 에러를 낸다.

또한, 쿼리를 던지기 전에 `lv_limit = lv_base + 100.` 처럼 아바에서 윗줄에 계산용 변수방을 또 만들고 수송하던 장황함도 걸림돌이다. **변수 선언 단계를 싹 걷어내고, 쿼리가 실행되는 바로 그 즉시 괄호 속에서 연산을 때려 그 결과물을 SQL 피연산자로 즉시 던져주는 수송 기법**이 필요하다. 그것이 **Host Variable 및 Host Expression** 이다.

### 무엇인가

#### 1. @ Host Variable (호스트 변수) 의 개념
- SQL 쿼리문 내부에서 피연산자 자리에 도킹되어 사용되는 ABAP 프로그램 출신의 데이터 개체(변수, 상수, 시스템 변수, 범위 변수)를 의미하며, 골뱅이 `@` 기호로 escape 하여 소속을 표기한다.

#### 2. @( ) Host Expression (호스트 식) 의 개념
- 변수 단독 할당을 넘어, SQL문 안에서 **`@( ABAP 연산식 )`** 의 형태로 괄호를 기입하면, **아바 엔진이 해당 괄호 내부의 계산을 먼저 수행한 뒤 그 최종 산출된 단일 값을 SQL의 대조 값으로 수송해 주는 연산 기술**이다.

#### 3. Lossless (값 손실 없는 캐스팅) 철칙
- 호스트 식 `@( lv_base + 100 )` 의 계산 결과가 DB 컬럼(예: `seatsmax` - 정수형 2바이트)과 대조될 때, 값의 범위가 찢어지거나 소수점이 뚝 떨어져 나가는 형식 불일치가 일어나서는 안 된다.
- **반드시 값의 왜곡이나 손실 없이 안전하게 변환(Lossless conversion)될 수 있는 타입 계열의 연산식만 호스트 식 괄호 내부에 올릴 수 있다.**

### 어떻게 확인하는가

호스트 변수와 호스트 식 연산을 가동하여 조건 검색을 실행하는 소스를 검증한다.

```abap
REPORT zch19_l02_host.

DATA: gt_flight TYPE STANDARD TABLE OF sflight,
      gv_base   TYPE i.

START-OF-SELECTION.
  gv_base = 100.

  " [호스트 변수 (@sy-datum) 및 호스트 식 (@( gv_base + 50 )) 의 실전 가동]
  SELECT carrid, connid, fldate, seatsmax
    FROM sflight
    WHERE fldate >= @sy-datum              " 시스템 날짜 호스트 변수 수송
      AND seatsmax > @( gv_base + 50 )      " 아바의 150 정수 연산 결과를 호스트 식으로 즉시 도킹
    INTO TABLE @gt_flight.
```

#### 체험/시뮬레이터 설계 (Host Boundary Inspector)
- **프로세스 플로우**:
  1. 화면 중앙에 [AP 서버 메모리 장막] 과 [DB 서버 연산소] 가 징검다리 다리로 나뉘어 있다.
  2. 학습자가 호스트 변수 `@gv_base` 칩을 SQL에 얹는다. AP 서버의 100 이라는 값이 번쩍하며 징검다리를 건너 DB 서버의 쿼리 WHERE 조건 자리로 정상 안착한다.
  3. 이번에는 괄호 식 `@( gv_base + 50 )` 카드를 던진다. AP 서버 단에서 150 이라는 값이 먼저 덧셈 연산 완료된 뒤, 150 단일 수송 캡슐이 되어 DB 단으로 넘어가 쿼리를 통과시키는 로직을 감상한다.
- **상태 및 데이터**:
  - `@( gv_base + '문자열' ) (숫자에 문자를 더하는 손실적 식을 얹은 상태)` -> 컴파일 에러 코드 `Lossless conversion rule violation` 적색등 하이라이트.
- **피드백**: 호스트 식은 DB에서 연산되는 것이 아닌, 아바가 AP 서버 단에서 미리 연산해 주는 캡슐 수송식임을 눈으로 규명한다.

### 실수/주의

- **호스트 식 @( ) 과 SQL Expression 의 실행 주체 혼동**:
  - **`@( lv_base + 100 )`** 은 **아바 애플리케이션 서버**에서 미리 셈을 마친 뒤 값만 수송한다.
  - 반면 뒤에서 배울 **`CASE WHEN`** 이나 **`CONCAT`** 등의 SQL Expression은 **DB 서버 자체의 CPU**를 굴려 데이터베이스 단에서 가공 연산이 수행된다. 
  - 실행 주체와 물리 서버 위치가 완전히 찢어져 있으므로 이 경계를 확실히 인지하고 적정 식을 배치해야 한다.

### 정리

- **`Host Variable`** 은 골뱅이 `@` 를 머리에 얹고 AP 메모리 값을 DB 쿼리로 넘기는 전령이다.
- **`Host Expression`** 은 **`@( )`** 형식으로 묶어 아바의 선행 연산 값을 수송하는 식이다.
- 수송되는 연산 결과는 반드시 데이터 유실이나 훼손이 없는 **Lossless** 규칙을 준수해야 한다.

---

## CH19-L03 - INTO TABLE @DATA(...) Inline Target

### 왜 필요한가

호스트 식까지 정복했다. 
그런데 여전히 `SELECT` 문을 가동하기 직전에 맨 위에 `DATA lt_flight TYPE TABLE OF sflight.` 형태로 결과를 수용할 그릇(내부 테이블)의 구체적인 타입 구조를 손수 타이핑해 선언해 두는 작업이 번거롭다. 
"SELECT 문장에서 내가 3개 컬럼만 골라 왔으면, 결과 그릇도 자동으로 그 3개 컬럼 규격에 맞춰서 즉시 탄생하면 안 되는가?"
만약 수작업으로 선언하면, SELECT 컬럼을 추가할 때마다 맨 위로 스크롤하여 내부 테이블 필드 구조까지 2중으로 고쳐야 하므로 코드 동기화 누수와 스크롤 피로가 가중된다.

**결과를 받아내는 그 즉시, SELECT list에 나열된 컬럼 구조와 완벽히 동일한 자료형 규격의 임시 내부 테이블 그릇을 자동 감지하여 탄생시키는 선언 기술**이 필요하다. 그것이 **`@DATA( )` 인라인 타깃 선언**의 장착이다.

### 무엇인가

#### 1. @DATA( ) 인라인 타깃의 정의
- SQL 쿼리문의 `INTO TABLE` 이나 단건 조회의 `INTO` 자리에 개설하여, 컴파일러가 조회 필드 리스트의 구성(Schema)을 역추적해 알맞은 내부 테이블이나 구조체 방을 1:1 자동 빚어내는 인라인 선언 장치다.
- 쿼리 내부에 속해 있는 선언이므로 골뱅이 `@` 를 앞에 강제 기입하여 **`@DATA(변수명)`** 구조로 선언한다.

#### ⚠️ [INTO TABLE @DATA( ) 가 지닌 Standard EMPTY KEY 성능 트랩 명세]
- *실무 아바 아키텍처에서 가장 심각하게 다루어지는 성능적 한계 함정이다.*
- `@DATA(lt_flight)` 를 통해 탄생하는 내부 테이블은 컴퓨터가 정밀하게 키를 매겨주는 Hashed 나 Sorted 테이블이 아닌, **아무런 검색 인덱스가 박혀있지 않은 `Standard Table with EMPTY KEY` 규격으로 고정 탄생한다.**
- **성능 문제**: 이 상태에서 결과가 5만 건이 담긴 `lt_flight` 에 대고 `READ TABLE lt_flight WITH KEY connid = ...` 이나 대괄호 조회를 수없이 빈번하게 돌려대면, 아바 엔진은 인덱스가 없으므로 1번 행부터 5만 번 행까지 매번 머리부터 꼬리까지 무식하게 훑는 **풀 테이블 스캔(Full Table Scan) 오버헤드**를 타서 프로그램이 극도로 느려지는 대형 장애를 낳는다.
- **방어선**: 조회 후 키 검색을 무수히 연타해야 하는 고성능 비즈니스 마당이라면, 절대로 `@DATA()` 인라인 그릇을 쓰지 말고, 사전에 정식 Hashed Table 타입을 명시 선언하고 거기에 대입을 받아야 안전하다.

#### 2. 계산 컬럼 및 조인 컬럼의 AS alias(별칭) 의무화 규칙
- `SELECT seatsmax - seatsocc FROM sflight INTO TABLE @DATA(lt_flight)` 처럼 수식 컬럼을 쌩으로 인라인 선언에 던지면, 새로 태어날 내부 테이블의 컬럼 이름표를 컴퓨터가 작명해 줄 수 없어 컴파일러가 빌드를 멈춰 세운다.
- **해결책**: 계산식이나 조인을 먹인 기둥 우측에는 반드시 **`AS 별칭`** (예: `AS seats_free`)을 지정하여 이름표 뼈대를 넘겨주어야만 인라인 그릇 형성이 성공한다.

### 어떻게 확인하는가

인라인 타깃 선언과 AS 별칭을 장착하여 데이터를 수용하는 소스 규격을 검증한다.

```abap
REPORT zch19_l03_inline_target.

DATA gv_carr TYPE sflight-carrid.

START-OF-SELECTION.
  gv_carr = 'LH'.

  " [ AS 별칭과 @DATA 인라인 타깃 테이블 선언의 결합 ]
  SELECT carrid, connid,
         seatsmax - seatsocc AS seats_free  " 계산 기둥에 AS 별칭 명시 의무!
    FROM sflight
    WHERE carrid = @gv_carr
    INTO TABLE @DATA(lt_result).             " Standard Empty Key 테이블 자동 선언 수립
    
  " [ 단건 조회 시 구조체 수령 ]
  SELECT SINGLE carrid, connid
    FROM sflight
    WHERE carrid = @gv_carr
    INTO @DATA(ls_single).                   " Flat 구조체 자동 선언 수립
```

#### 체험/시뮬레이터 설계 (SELECT Target Type Viewer)
- **프로세스 플로우**:
  1. 학습자가 [SELECT carrid, connid AS flight_no] 카드를 꽂는다.
  2. 우측 [결과 내부 테이블 모양판]에 `carrid` 열과 `flight_no` 열 두 기둥만 세워진 새 표(Standard Empty Key)가 실시간으로 퐁 솟아오른다.
  3. 이번에는 [AS 별칭 누락 카드: seatsmax - seatsocc]를 슬롯에 끼운다.
  4. 모양판 기둥 이름에 `? ? ?` 물음표가 뜨며 "인라인 컬럼의 이름표(AS)가 없어 구조 조립이 실패했습니다!" 빨간불 사이렌 경보가 돌아가는 모션을 감상한다.
- **상태 및 데이터**:
  - `JOIN을 콤마 필드 리스트 없이 SELECT * 로 @DATA에 담은 상태` -> 결과 테이블 형태: `wa-scarr-carrid`, `wa-spfli-connid` 와 같이 중첩 구조체(Nested Structure)로 열 이름이 물리 분할되어 조립된 상태 시각화.
- **피드백**: 인라인 타깃은 콤팩트한 조회의 동반자이나 별칭(AS) 작명이 의무이며, 태생은 무인덱스 Standard 표라는 한계를 인지시킨다.

### 실수/주의

- **동일 구문에서 이미 선언된 외부 변수방에 @DATA( ) 를 중복 씌워 수령 시도**:
  - 만약 윗줄에 `DATA lt_result TYPE ...` 로 이미 수립해 둔 방에 쿼리 값을 받으려면 인라인 DATA를 떼고 **`INTO TABLE @lt_result`** 로 적어야 한다.
  - 여기에 습관적으로 `@DATA(lt_result)` 를 한 번 더 적으면 "변수 중복 선언 문법 위반" 에러를 맞고 컴파일이 깨지므로 1회성 창조와 대입을 철저히 격리해야 한다.

### 정리

- **`@DATA( )`** 는 쿼리가 조회해 온 구조에 딱 맞춘 내부 테이블/구조체를 즉시 조립해 준다.
- 인라인으로 조립된 표는 **Standard Category와 Empty Key** 제약을 지니므로 대량 키 검색에 주의한다.
- 수식 컬럼 및 중복 컬럼의 인라인 적재 시에는 반드시 **`AS 별칭`** 칭호를 꽂아 명명해 준다.

---

## CH19-L04 - SQL Expression — CASE / CAST / COALESCE

### 왜 필요한가

인라인 그릇까지 수립했다. 
그런데 조회해 온 데이터를 비즈니스 포맷으로 다듬는 코드가 여전히 무겁다. 
"예약 좌석이 만석이면 화면 열에 '만석(FULL)' 이라 띄우고, 자리가 남았으면 '공석(OPEN)' 이라 띄우고 싶다."
기존에는 DB에서 일단 `seatsocc` 와 `seatsmax` 숫자 열을 있는 그대로 아바 내부 테이블로 긁어온 뒤, 아래에서 `LOOP AT lt_flight` 를 돌리며 `IF seatsocc >= seatsmax. ls-status = 'FULL'. ... MODIFY.` 하듯이 아바 CPU를 갈아 넣어 2차 가공 루프 작업을 쳤다.
데이터가 10만 건이면, 10만 번 아바 LOOP가 돌아가며 메모리를 헤집고 쓰기 연산을 수행하므로 비효율적이다.

**데이터를 아바 서버로 퍼 올린 뒤 루프 노가다를 돌리지 않고, DB가 디스크에서 행을 스캔하여 읽어 올리는 그 최초의 찰나에 DB 서버의 CPU 계산기를 흔들어 상태 문자열('FULL'/'OPEN') 컬럼을 통째로 탑재해 한 번에 수송해 오는 가공 기술**이 필요하다. 그것이 **SQL Expression** 의 장착이다.

### 무엇인가

#### 1. SQL Expression (DB 가공 이송 식) 의 개념
- DB 엔진 내부에서 연산(산술, 분기 판단)을 완수해 결과 컬럼으로 도출하여 아바 서버로 넘겨주는 데이터베이스 중심의 가공 연산 구조다.

#### 2. CASE WHEN THEN ELSE END AS (조건 분기 컬럼)
- SQL 문장 속에서 아바의 IF/CASE 문처럼 데이터 조건을 검사해 가상의 텍스트나 결과 값을 생성하는 식이다.
- (예: `CASE WHEN seatsocc >= seatsmax THEN 'FULL' ELSE 'OPEN' END AS seat_status`).

#### 3. CAST (DB 데이터 형식 캐스팅)
- DB 테이블의 물리 컬럼 자료형을 임시로 형 변환하여 형변환 열을 빚어낸다. (예: 정수형 seatsmax 기둥을 5글자 텍스트 기둥인 `CHAR(5)` 로 승격: `CAST( seatsmax AS CHAR(5) )`).

#### 4. COALESCE (DB Null 전용 우회 대체 함수)
- 파라미터로 나열된 인자들 중 **"최초로 null이 아닌(Non-null) 값"** 을 솎아내어 수송하는 핵심 DB 함수다.
- Left Outer Join 등으로 매칭에 실패하여 기둥이 DB Null 상태로 누락 적재될 위험이 있을 때, `'NO ROUTE'` 나 `'0'` 같은 디폴트 구원 투수 값을 수용할 때 핵심 사용된다.

#### ⚠️ [DB Null 과 ABAP Initial(초기값)의 물리적 물리 경계 차이 격리]
- *입문자들이 DB 쿼리를 짜며 가장 난해해하는 개념 파괴 장벽이다.*
- **DB Null**: 데이터베이스 테이블 설계 상 **"값이 아예 기재조차 되지 않은 빈 공간(무존재)"** 의 진공 상태를 의미한다.
- **ABAP Initial**: 아바 메모리 공간 상에 **"물리적 변수방은 확실하게 개설되어 자리 잡고 있으나, 단지 초기값(공백 문자열 `''`, 숫자 `0`, 날짜 `'00000000'`)이 들어가 있는 상태"** 를 뜻한다.
- **결론**: `COALESCE` 함수는 오직 **DB 단의 Null** 만을 인지하여 대체한다. 이미 아바 메모리에 실재하는 빈 값(Initial)인 `0` 이나 공백은 `COALESCE` 검문소가 감지하지 못하고 그냥 통과시켜 버리므로, 둘을 명확하게 두뇌 속에서 공간 격리해야 한다.

### 어떻게 확인하는가

SELECT 안에서 CASE, CAST, COALESCE 를 도킹해 계산 열을 빚어내는 소스를 검증한다.

```abap
REPORT zch19_l04_sql_expr.

DATA: gt_result TYPE STANDARD TABLE OF zbooking,
      gv_carr   TYPE zbooking-concert_id.

START-OF-SELECTION.
  gv_carr = 'C001'.

  " [ SQL Expression CASE 및 COALESCE 실전 집행 ]
  SELECT concert_id, artist, capacity,
         " 1. [COALESCE] Null 이 감지되면 0으로 긴급 자동 치환하여 booked 기둥 수립!
         COALESCE( capacity, 0 ) AS safe_capacity,
         
         " 2. [CASE] DB 단에서 만석 판단을 마친 뒤 seat_status 가상 열로 탑재!
         CASE WHEN capacity <= 100 THEN 'SMALL'
              ELSE 'LARGE' END AS hall_size
    FROM zconcert
    INTO TABLE @DATA(lt_hall).
```

#### 체험/시뮬레이터 설계 (SQL Expression Lab)
- **프로세스 플로우**:
  1. 학습자가 [capacity 열: NULL] 값을 가진 테이블 행 카드를 준비한다.
  2. [COALESCE( capacity, -1 )] 연산 칩을 물려 쿼리를 실행한다.
  3. DB 연산기가 작동하며 NULL 구멍에 디폴트 값 `-1` 을 순식간에 메워 수송 상자에 담아 아바 쪽으로 넘겨주는 모션을 확인한다.
  4. 이어서 [CASE WHEN capacity >= 50 THEN 'OK' ELSE 'NO' END] 를 구동하자, 행마다 계산 톱니바퀴가 돌아가 상태 텍스트 열이 생성되는 흐름을 대조한다.
- **상태 및 데이터**:
  - `CASE의 THEN 'TEXT' 와 ELSE 0 (텍스트와 숫자를 짝지어 타입 조화를 깬 상태)` -> 컴파일 에러 코드 `CASE operands must have compatible types` 하이라이트.
- **피드백**: SQL 식은 DB에서 값을 다 조각내어 완제품 컬럼 상태로 이송해 주는 초고속 필터링 공정임을 체험한다.

### 실수/주의

- **동일 SELECT 구문 내에서 선언한 AS 별칭을 옆에 기입한 다른 수식에서 즉시 호출 시도**:
  - `SUM( seats ) AS booked, CASE WHEN booked >= 10 ...` 처럼 앞에서 작명한 별칭 `booked` 를 같은 줄에 서식하는 다른 `CASE` 문 내부에서 변수처럼 호출할 수 없다. 
  - 아직 쿼리가 끝나기 전이라 해당 별칭 열이 아바 메모리에 탄생하지 않았기 때문이다. 
  - **방어선**: 이 경우 어쩔 수 없이 `CASE WHEN SUM( seats ) >= 10 ...` 처럼 **원본 계산식을 2번 중복하여 기입해 주어야 정상 구동**한다.

### 정리

- **`SQL Expression`** 은 DB 단에서 계산을 완수해 완성품 결과 컬럼으로 넘겨주는 식이다.
- **`CASE`** 는 조건에 따라 가상의 열을 빌드하고, **`CAST`** 는 형 변환을 집행한다.
- **`COALESCE`** 는 **DB Null** 을 가로채어 우회 디폴트 값을 메워주는 파수꾼이다.

---

## CH19-L05 - SQL String / Date Function

### via 왜 필요한가

SQL 식까지 정복했다. 
이번에는 문자열 연결이나 날짜를 가공하는 코드가 번거롭다. 
"항공사 코드 `LH` 와 편명 `0400` 을 붙여서 `LH0400` 이라는 통합 루트 코드를 만들거나, 예매 날짜에서 정확히 일주일(7일) 뒤가 몇 년 몇 월 며칠인지 만기 예정 날짜 컬럼을 뽑아내고 싶다."
이전에는 DB에서 날짜와 코드를 그대로 가져온 뒤, 아바 내부 루프에서 `CONCATENATE` 를 치고 날짜 변수에 `fldate + 7` 을 연산해 내부 테이블 필드에 다시 채워주는 장황한 수동 사후 가공을 수행했다.

**루프 조작 없이, SELECT 목록 자체에 `CONCAT` 이나 `DATS_ADD_DAYS` 함수를 도킹하여, 최종 합본 문자열과 7일 뒤의 계산 날짜 컬럼을 DB에서 즉시 산출 완료하여 적재하는 가공 기술**이 필요하다. 그것이 **SQL 문자열/날짜 내장 함수** 의 장착이다.

### 무엇인가

#### 1. SQL 내장 함수의 정의
- DB 서버 단의 SQL 파서가 내장하여 제공하는 문자 다듬기 및 날짜 가중치 연산 고속 기능 군이다.

#### 2. 핵심 문자열 함수군
- **`CONCAT( a, b )`**: 두 컬럼 문자열을 하나로 접착해 결합한다.
- **`UPPER( )` / `LOWER( )`**: 영문 대/소문자 통일 변환.
- **`SUBSTRING( 컬럼, 시작위치, 길이 )`**: 문자의 특정 영역 슬라이스 추출.

#### ⚠️ [SQL SUBSTRING(1-기반)과 ABAP substring(0-기반)의 시작 인덱스 격리]
- *코딩 테스트와 실무 구현 시 인덱스 하나 차이로 삐끗해 엉뚱한 문자를 파내는 다발성 버그 지점이다.*
- **SQL `SUBSTRING( connid, 1, 2 )`**: DB 엔진은 첫 번째 글자의 출발 기준 인덱스를 **`1`** 로 잡는다. 즉, 앞 2글자를 떼고 싶을 때 시작값은 **1**이다.
- **ABAP `substring( val = ... off = 0 len = 2 )`**: 아바 엔진의 오프셋 시작값은 컴퓨터 기본 배열 룰을 따라 **`0`** 부터 출발한다.
- **해결 공식**: 똑같은 앞 머리 글자를 솎아낼 때, **SQL 시작값 `pos` 는 아바 시작값 `off` 에 무조건 `+ 1` 을 더한 위치 지정**이 기본 경계 공식임을 암기 격리해야 한다.

#### 3. 핵심 날짜 함수군
- **`DATS_ADD_DAYS( 날짜컬럼, 더할일수 )`**: 날짜 컬럼 값에 7일, 30일 등 특정 정수 날짜를 계산 가산하여 유효한 `YYYYMMDD` 미래 날짜를 반환한다.
- **`DATS_DAYS_BETWEEN( 시작일, 종료일 )`**: 두 날짜 컬럼 간의 물리적 간격 일수(정수)를 도출한다. (예: 오늘 날짜 `@sy-datum` 과 예매일의 간격 산출).

### 어떻게 확인하는가

SELECT 내부에서 문자열 결합과 DATS 날짜 덧셈 함수를 가동하는 소스 규격을 검증한다.

```abap
REPORT zch19_l05_sql_func.

DATA: gt_spfli TYPE STANDARD TABLE OF spfli,
      gv_carr  TYPE spfli-carrid.

START-OF-SELECTION.
  gv_carr = 'LH'.

  " [ SQL 문자열 접착 및 DATS 날짜 함수 가동 ]
  SELECT carrid, connid,
         CONCAT( carrid, connid )          AS route_code,  " LH + 0400 -> LH0400 조립
         SUBSTRING( connid, 1, 2 )         AS prefix_no,   " 1번 인덱스(첫글자)부터 2칸 슬라이스
         UPPER( cityfrom )                 AS city_upper   " 대문자 승격
    FROM spfli
    WHERE carrid = @gv_carr
    INTO TABLE @DATA(lt_route).
```

#### 체험/시뮬레이터 설계 (SQL Function Workbench)
- **프로세스 플로우**:
  1. 학습자가 문장 `'SEOUL'` 카드를 들고 [ABAP substring off=0 len=2] 와 [SQL SUBSTRING pos=1 len=2] 두 가상 머신 슬롯을 본다.
  2. 아바 머신을 돌리자 오프셋 0 기반으로 작동해 `'SE'` 가 출력된다.
  3. SQL 머신에 pos=0 을 주자 "SQL 시작점은 1부터입니다!" 에러 경보가 울린다. pos=1 을 입력하자 동일한 `'SE'` 를 뿜어내는 오프셋 인덱스 번호 동기화 시각 자료를 감상한다.
  4. 날짜 `'20260626'` 에 `DATS_ADD_DAYS( 7 )` 을 물리자 달력이 넘어가며 `'20260703'` 으로 달 교체 연산이 자동으로 수행되는 모션을 본다.
- **상태 및 데이터**:
  - `SUBSTRING에 0번 시작 인덱스를 인자로 주입한 상태` -> 런타임 SQL 에러 유발 하이라이트.
- **피드백**: 아바와 SQL의 내장 함수는 이름과 기능은 유사하나 시작 인덱스가 0과 1로 명확히 찢어져 작동함을 각인시킨다.

### 실수/주의

- **String Template의 문자 조작과 SQL String 함수의 혼동**:
  - SQL 문자 함수는 오직 **DB 테이블에 존재하는 물리 데이터 기둥을 긁어올 때** 실시간 변환 적재하기 위해 사용된다.
  - 이미 아바 내부 테이블 메모리 속에 얌전하게 담겨있는 텍스트 데이터를 사용자에게 보여주기 위해 결합할 때는, 절대 SQL 함수를 호출할 수 없고, 앞 장에서 배운 **`|... { } ...|`** String Template 조립기를 굴려야 한다.

### 정리

- SQL 내장 함수는 DB 단에서 문자 결합 및 날짜 연산을 완료해서 적재하는 가속기다.
- **SQL `SUBSTRING` 의 시작 인덱스는 1**이며, **아바 `substring` 의 오프셋 시작은 0**이다.
- **`DATS_ADD_DAYS`** 및 **`DATS_DAYS_BETWEEN`** 은 월말/윤년 연산을 자동 보정해 주는 날짜 함수다.

---

## CH19-L06 - SELECT FROM @itab 기초

### 왜 필요한가

SQL 내장 함수까지 마스터했다. 
그런데 가끔 이런 실무적 장벽을 만난다. "이미 텍스트 파일이나 외부 엑셀 업로드를 통해 읽어 들여서 프로그램 메모리 내부 테이블(`gt_excel`)에 고이 보관하고 있는 이 데이터들에 대해, 특정 공항 코드만 필터링하거나 금액별로 오름차순 정렬하고, 도시별로 몇 건씩 들어있는지 개수를 합산하고 싶다."
기존 클래식 아바라면, 메모리 테이블의 정렬을 위해 `SORT gt_excel BY price.` 를 치고, 그룹별 집계를 위해 `LOOP AT gt_excel` 을 돌며 `COLLECT` 문을 구동하는 등 구구절절 절차형 연산 코딩을 장황하게 쳐야 했다. 
조회 조건이 바뀌면 이 짓을 또 새로 짜야 하니 메모리 핸들링 피로가 크다.

**데이터베이스 서버에 노크하여 값을 긁어올 때만 쓰던 편리한 SELECT 쿼리 문법(WHERE, ORDER BY, GROUP BY, SUM)을, 이미 컴퓨터 RAM 메모리에 올라와서 숨 쉬고 있는 일반 내부 테이블(Internal Table) 객체에 그대로 도킹시켜 고속 필터 집계해 내는 쿼리 기술**이 필요하다. 그것이 **`SELECT FROM @itab`** 의 장착이다.

### 무엇인가

#### 1. SELECT FROM @itab 의 정의와 작동
- 데이터베이스 하드디스크가 아닌, **아바 애플리케이션 서버 RAM 메모리에 개설되어 있는 내부 테이블(Internal Table)을 FROM 절의 원천 소스로 삼아** 마치 DB 테이블 조회하듯 SELECT 를 집행하는 기술이다.
- 원천 내부 테이블은 아바 변수이므로 골뱅이 `@` 를 테이블명 앞에 부착해야 한다 (예: `FROM @lt_excel`).
- 이 쿼리는 **네트워크를 타고 물리 DB 서버로 넘어가지 않고 아바 서버 내부의 메모리 고속 SQL 엔진에서 100% 로컬 처리**되므로 트래픽 비용이 Zero에 수렴한다.

#### ⚠️ [SELECT FROM @itab 가 지닌 Deep Type(String/Ref) 컬럼 탑재 금지 함정 명세]
- *실무 아바 가동 시 가장 많은 불합격 컴파일 적색 라인을 뿜는 초정밀 제약 함정이다.*
- `@itab` 소스 쿼리를 가동할 때, 대상 내부 테이블의 컬럼 타입 중에 **가변 문자열인 `string` 이나 클래스 참조형 변수(`REF TO`), 혹은 중첩 테이블 타입이 단 1개라도 포함되어 있으면 아바 엔진은 문법 위반으로 즉시 컴파일을 셧다운시킨다.**
- **원리**: 메모리 SQL 엔진은 구조적이고 길이가 고정된 평평한 플랫(Flat) 형식의 물리 구조 데이터만 1:1 바인딩 매핑할 수 있기 때문이다.
- **방어선 (SSTRING 참조 우회)**: 만약 텍스트 컬럼을 꼭 살려두고 싶다면, 일반 `string` 타입 선언을 포기하고, **ABAP Dictionary의 문자 타입인 `SSTRING` 또는 고정 길이 `c` 타입을 참조하여 텍스트 필드를 정의**해 주어야 메모리 엔진의 제약 검문을 무사히 통과한다.

#### 2. table_line pseudo component 및 별칭 AS 강제
- 내부 테이블의 구성이 구조체 행이 아니라 단순 문자 1열(`TABLE OF string`)이나 정수 1열(`TABLE OF i`)로 구성된 테이블일 경우, 이 열의 물리 식별 이름은 컴파일러 상에서 **`table_line`** 으로 강제 번역된다.
- 이 단일 열 테이블을 SELECT 하여 인라인 타깃 `@DATA(result)` 로 받으려면, 내부 필드 조립을 위해 **`SELECT table_line AS 별칭`** 처럼 의무적으로 칭호를 꽂아 명명해 주어야 에러 없이 빌드가 통과한다.

### 어떻게 확인하는가

메모리 내부 테이블을 SELECT 소스로 삼아 SUM 과 GROUP BY 집계를 수행하는 소스를 검증한다.

```abap
REPORT zch19_l06_select_itab.

" [ SSTRING 을 참조하여 Deep String 에러 제약을 원천 방어한 구조 선언 ]
TYPES: BEGIN OF ty_excel,
         carrid   TYPE sflight-carrid,
         connid   TYPE sflight-connid,
         seatsocc TYPE sflight-seatsocc,
         note     TYPE sstring,            " string 대신 DDIC SSTRING 참조하여 deep type 에러 회피!
       END OF ty_excel.
TYPES ty_excel_tab TYPE STANDARD TABLE OF ty_excel WITH EMPTY KEY.

DATA(gt_excel) = VALUE ty_excel_tab(
  ( carrid = 'LH' connid = '0400' seatsocc = 120 note = 'First' )
  ( carrid = 'LH' connid = '0401' seatsocc = 80  note = 'Second' )
  ( carrid = 'AA' connid = '0017' seatsocc = 50  note = 'Third' )
).

START-OF-SELECTION.
  " [ 메모리 내부 테이블 gt_excel 을 소스로 SELECT FROM 집계 개시 ]
  SELECT f~carrid,
         SUM( f~seatsocc ) AS total_seats  " 집계 필드 AS 별칭 의무화
    FROM @gt_excel AS f                    " host 변수 마킹 @ 및 alias 별칭 f 필수 부여
    GROUP BY f~carrid                      " carrid 기준으로 그룹화
    INTO TABLE @DATA(lt_summary).          " 결과를 인라인 타깃에 자동 적재
```

#### 체험/시뮬레이터 설계 (Internal Table SQL Console)
- **프로세스 플로우**:
  1. 학습자가 화면 왼쪽에 3개 로우가 담긴 [gt_excel 메모리 판]을 둔다.
  2. [FROM @gt_excel SELECT] 명령 줄을 콘솔에 타이핑한다.
  3. AP 서버 램 내부에서 톱니바퀴가 윙 돌아가며, DB로 전송되는 트래픽 선로가 꺼진 채로, LH 두 건의 예약 좌석 합계 `200` 을 번개 속도로 묶어 결과 카드로 조립 출력하는 흐름을 확인한다.
  4. 이번에는 컬럼에 `REF TO` 클래스 참조가 포함된 딥 테이블 카드를 슬롯에 집어넣는다.
  5. 콘솔에 "SELECT FROM @itab does not support deep type components!" 컴파일 경고 문구가 도배되는 모션을 감상한다.
- **상태 및 데이터**:
  - `@gt_excel 소스 앞에 @ 골뱅이를 누락해 FROM gt_excel 로 적은 상태` -> 컴파일 오류: `Table gt_excel not found in Database` 하이라이트.
- **피드백**: 메모리 SQL은 DB 왕복 없이 집계 연산을 짧게 치는 혁신이지만, Deep Type 원천 차단이라는 물리 바인딩 사양이 존재함을 증명한다.

### 실수/주의

- **DB SELECT 쿼리를 흉내 내어 대량 DB 데이터를 메모리에 다 퍼 올린 뒤 루프 정렬**:
  - "SELECT FROM @itab 가 되니까, DB 조건 검색을 치지 말고 그냥 DB 테이블 100만 건을 아바로 다 퍼 올린 다음에, 메모리에서 SELECT itab 로 필터링해서 써야지" 했다가는, 
  - 네트워크 대역폭 폭발과 AP 서버 메모리 오버플로우로 시스템 전체가 마비되는 **최악의 안티 패턴(Anti-Pattern)** 장애를 낸다.
  - **대량의 필터와 집계는 무조건 1차적으로 물리 DB 서버 단에서 select 문으로 걸러내고**, `@itab` 은 이미 올라와 있는 불가피한 로컬 엑셀 데이터 등의 **2차 가공 용도로만 바운더리를 쳐서 제한 사용**해야 한다.

### 정리

- **`SELECT FROM @itab`** 은 RAM 메모리 테이블을 SQL 문법으로 재수색 집계하는 장치다.
- 원천 내부 테이블에는 String/Reference 등의 **Deep Type 컬럼 배치가 원천 금지**된다.
- 텍스트 형식을 유지하려면 무조건 ABAP Dictionary 의 **`SSTRING`** 을 매핑 참조한다.

---

## CH19-L07 - ABAP SQL 정리 — 다음 단계로

### 왜 필요한가

우리는 콤마, escape 골뱅이, 인라인 그릇, CASE/CAST/COALESCE 분기, DATS 문자 날짜 함수, 그리고 SELECT FROM @itab 메모리 쿼리까지 Modern ABAP SQL의 온갖 정밀 무기를 손에 쥐었다.
하지만 실무에 나가면 기술의 화려함에 눈이 멀어, 굳이 안 써도 될 자리에 억지로 복잡한 쿼리를 구겨 넣어 유지보수를 파괴하거나, 정렬과 집계의 주체를 거꾸로 잡아 성능을 폭망시키는 설계 미스를 자주 범한다.

**각 문법 조각의 물리적 장단점과 실행 서버 위치를 명확히 이해하고, "이 상황에서는 이 도구를 빼내어 도킹하고, 저 상황에서는 일반 코드로 선언하겠다" 는 명확한 아키텍처 의사결정 매트릭스**가 필요하다. 그것이 **SQL Decision 의 수립**이다.

### 무엇인가

#### 🧭 상황별 Modern SQL 의사결정 매트릭스 명세

| 내가 마주한 상황 | 선택해야 할 무기 | 기술적 근거와 이유 |
| --- | --- | --- |
| **컬럼명과 아바 변수의 경계 모호** | **`@` Host Variable** | 컴파일러에게 소속을 알려 strict 모드를 기동 |
| **단순 매진 여부 등 상태 컬럼 필요** | **SQL `CASE`** | DB 단에서 가상 열로 가공해 가져와 아바 루프 생략 |
| **Join 시 매칭 누락으로 Null 우려** | **`COALESCE`** | DB Null 상태를 디폴트 값 `'0'` 이나 `'NO'` 로 가공 수송 |
| **날짜 간격 및 미래 기한 산출** | **`DATS` 날짜 함수** | 윤년과 월말을 DB 가 알아서 환산해 계산 열 적재 |
| **결과를 특정 Key로 빈번하게 재조회** | **명시 타입 + Key 지정 선언** | 인라인 `@DATA()` 는 Empty Key Standard 형이라 풀 스캔 성능 폭락 |
| **메모리 데이터의 복잡한 정렬/합산** | **`SELECT FROM @itab`** | LOOP와 COLLECT 절차 코딩 없이 SQL식으로 간결 집계 |
| **복잡한 비즈니스 조건 판단** | **ABAP 코드 분기** | SQL 식에 가공 로직을 과적하면 튜닝 및 디버깅 불가 |

### 어떻게 확인하는가

의사결정 카드를 통해 각 쿼리의 배치 성능을 시뮬레이션한다.

```abap
" [ 1. 단순 단건 조회 및 인라인 타깃 가동 - 최적합 ]
SELECT SINGLE carrid, carrname
  FROM scarr
  WHERE carrid = 'LH'
  INTO @DATA(ls_carr).

" [ 2. 고속 키 조회가 필요한 대형 데이터 수령 - 인라인 금지, Sorted Key 명시 선언 ]
TYPES: BEGIN OF ty_scarr,
         carrid   TYPE scarr-carrid,
         carrname TYPE scarr-carrname,
       END OF ty_scarr.
DATA: gt_carr TYPE SORTED TABLE OF ty_scarr WITH UNIQUE KEY carrid.

SELECT carrid, carrname
  FROM scarr
  INTO TABLE @gt_carr. " 5만건 적재 시, 이후 READ TABLE gt_carr WITH KEY carrid... 가 이진 검색(Binary Search)으로 0.001초만에 통과됨을 보증
```

#### 체험/시뮬레이터 설계 (SQL Decision Cards)
- **프로세스 플로우**:
  1. 학습자에게 [상황: 10만 건 결과 테이블 수령 후, 루프 내부에서 예매번호로 수만 번 조회 예정] 카드가 제시된다.
  2. 학습자가 [INTO TABLE @DATA(lt_info)] 칩을 얹는다.
  3. 경고등이 돌며 "Standard Empty Key 테이블에 READ가 5만 번 가동되어 5만 x 10만 = 50억 번 비교 연산 유발! 서버 다운 경보!" 성능 빨간불이 렌더링된다.
  4. 학습자가 카드를 [Sorted Table gt_info WITH UNIQUE KEY] 로 교체 도킹한다.
  5. 이진 탐색 기어가 활성화되며 수식 속도 게이지가 초고속 녹색 통과로 꺾이는 시각 변화를 감상한다.
- **상태 및 데이터**:
  - `Strict mode 위반 상태 (콤마는 썼는데 @를 안 붙인 쿼리)` -> 빌드 상태: `Compile Error`.
- **피드백**: 모던 문법의 도입은 편리함의 획득이지만, 그 이면에 EMPTY KEY 성능 저하 같은 아키텍처 비용이 숨어있으므로 의식적인 설계 분기가 필요함을 각인시킨다.

### 실수/주의

- **SQL 식(Expression)이 다재다능하다고 모든 비즈니스 가공을 쿼리 한 줄에 구겨 넣기**:
  - `CASE WHEN ... THEN (CASE WHEN ...)` 과 같이 3중 중첩 CASE 문을 SQL 리스트에 박아두면, 데이터베이스 파서의 로드를 늘릴 뿐만 아니라 차후 업무 요건 변경 시 SQL 전체를 뜯어고쳐야 하므로 유지보수가 파괴된다.
  - **단순 상태 분류와 Null 대체 정도만 SQL 식에 위임하고, 복잡한 비즈니스 룰은 아바 제어문으로 격리**해야 한다.

### 정리

- Modern ABAP SQL 의 무기들은 **성능적 장단점과 실행 주체**를 의식하고 꺼내 써야 한다.
- `@DATA()` 선언은 간편하지만 **EMPTY KEY** 규격이므로 이후 고성능 Key 검색 시 정식 선언으로 선회한다.
- 쿼리 가공은 **단순 열 변환에만 집중**시키고, 복잡한 룰은 아바 코드 격리 수호 원칙을 지킨다.

---

## CH19-L08 - 실습 — 콘서트앱 모던 SQL

### 왜 필요한가

모든 개별 Modern ABAP SQL 의 정교한 기능들을 손에 넣었다. 
이제 이 무기들을 **🎫 하나의 살아있는 실무 관문인 '공연별 예매 현황 리포트'** 에 장착해 classic 쿼리를 전면 리팩터링해야 한다. 
단순 SELECT 필드 교체가 아니라, Left Outer Join 시 취소 예매 필터 조건(`status <> 'C'`)을 `ON` 절에 배치하는지, 아니면 `WHERE` 절에 배치하는지에 따라 **"예약이 단 1건도 없는 신규 공연 C003 UI5 Night" 이 목록에서 싹 유실 소멸되어 리포트에서 누락되는 치명적인 데이터 정합성 버그**를 잡아내는 실무 캡스톤 코드를 수립해야 한다.

### 무엇인가

#### 🎫 콘서트 리포트 모던 SQL 리팩터링 핵심 3대 타깃 명세
우리는 기존에 가동되던 공연 리포트 프로그램의 SQL 영역을 다음과 같이 모던 콤마 쿼리로 튜닝 개설한다.

1. **Range 범위 대조 호스트 escape 마커 장착 (`IN @s_conc`)**:
   - 셀렉션 스크린에서 들어온 범위 테이블 변수 `s_conc` 가 SQL 내에서 원천 아바 소속임을 명시적으로 규명하기 위해 골뱅이를 결합: `IN @s_conc`.
2. **COALESCE 와 CASE 의 DB 연산 이송**:
   - 예매가 0건이라 NULL이 들어오는 누적 좌석 합계를 감지해 `0` 으로 원천 대체 적재: `COALESCE( SUM( b~seats ), 0 ) AS booked`.
   - capacity 수용력을 초과했는지 여부를 DB CPU 단에서 미리 판단해 만석 문구 열로 자동 적재: `CASE WHEN ... >= c~capacity THEN 'FULL' ELSE 'OPEN' END AS seat_status`.
3. **취소 예매 제외 필터의 ON 절 고정 (가장 중요)**:
   - Left Outer Join 실행 시, 우측 예매 테이블의 취소 제외 필터(`status <> 'C'`)를 `WHERE` 에 꽂으면, Join이 완료된 결과 행 중 booked가 null인 미예매 공연 행들까지 `WHERE` 가 'Null은 status <> C 가 아니다' 라며 싹 지워버려 목록 유실 장애가 난다.
   - **반드시 우측 테이블의 조건은 `ON` 조인 결합 절 내부에 교착 고정(`AND b~status <> 'C'`)시켜서 결합 단계에서만 거르게 해야 booked가 0인 미예매 공연 C003가 소멸되지 않고 정상 적재된다.**

### 어떻게 확인하는가

리팩터링을 마친 후 C001, C002, C003 테스트 데이터를 주입하여 무결성을 수동 검수한다.

1. `/nSE38` 을 실행하고 리팩터링 완료 보고서를 작동한다.
2. C003 (예매가 0건인 신규 공연)이 화면 목록에 booked = 0, seat_status = 'OPEN' 으로 실종되지 않고 똑바로 출력되어 나오는지 확인한다. (ON 절 취소 가드 검수).
3. C002 (예약 50건이 capacity 50과 꽉 찬 공연)가 seat_status = 'FULL' 로 DB 연산 판단을 거쳐 정상 인쇄되는지 확인한다. (CASE 문 검수).
4. C001 (예약 중 취소 1건이 섞여 있는 공연)의 총 누적 booked 좌석이 취소 1건을 뺀 알맹이 좌석 수만 정상 계산되어 수송되는지 확인한다. (SUM 합산 검수).

```abap
" [ 콘서트별 예매 현황 리포트 모던 SQL 완성본 ]
REPORT zch19_l08_concert_sql.

" Selection Screen 개설 가정!
SELECT-OPTIONS s_conc FOR zconcert-concert_id.

START-OF-SELECTION.
  " --------------------------------------------------
  " [ 모던 SQL 집계 및 Join 쿼리 리팩터링 완료본 ]
  " --------------------------------------------------
  SELECT c~concert_id, c~artist, c~capacity,
         
         " ① [COALESCE] 예매 0건 시 NULL -> 0 으로 고속 교체 적재!
         COALESCE( SUM( b~seats ), 0 ) AS booked,
         
         " ② [CASE] 별칭 booked는 동일 list 내부식에서 재활용 불가하므로 수식 중복 명시 준수!
         CASE WHEN COALESCE( SUM( b~seats ), 0 ) >= c~capacity THEN 'FULL'
              ELSE 'OPEN' END AS seat_status
              
    FROM zconcert AS c
    
    " ③ [Left Join & ON 가드] 오른쪽 테이블의 취소 필터 status <> 'C' 는 반드시 ON 절에 결합 고정!
    " WHERE 절로 빼면 미예매 공연 C003이 Null 삭제 오작동으로 실종 소멸됨을 경계 차단!
    LEFT OUTER JOIN zbooking AS b
      ON  b~concert_id = c~concert_id
      AND b~status <> 'C'
      
    WHERE c~concert_id IN @s_conc      " 호스트 범위 테이블 마킹 @s_conc 장착
    
    GROUP BY c~concert_id, c~artist, c~capacity
    
    INTO TABLE @DATA(lt_report).       " Standard Empty Key 결과 테이블 인라인 즉시 선언
    
  " --------------------------------------------------
  " ④ 출력부 - String Template 적용 렌더링
  " --------------------------------------------------
  LOOP AT lt_report INTO DATA(ls_stat).
    WRITE: / |공연코드: { ls_stat-concert_id } | &
             |아티스트: { ls_stat-artist } | &
             |예약상황: { ls_stat-booked }/{ ls_stat-capacity }석 | &
             |상태: { ls_stat-seat_status }|.
  ENDLOOP.
```

#### 체험/시뮬레이터 설계 (Concert Modern SQL Lab)
- **프로세스 플로우**:
  1. 학습자가 취소 필터 슬라이더를 [WHERE b~status <> 'C'] 위치로 잡아둔다.
  2. 쿼리 빔을 쏘자, 예매 데이터가 없던 C003 UI5 Night 공연 행이 WHERE 필터 검문에서 Null 불합격 판정을 받아 빗자루로 쓸려 소멸 삭제되는 장면이 연출된다.
  3. 학습자가 취소 필터 슬라이더를 [ON AND b~status <> 'C'] 절 내로 즉시 재배치한다.
  4. 쿼리를 재작동하자, C003은 조인 결합 단계에서만 누락 통과되고, 최종 리포트 보드에는 booked = 0 을 머리에 얹고 떳떳이 한 줄 기둥으로 살아남아 출력되는 대수학 복구 과정을 감상한다.
- **상태 및 데이터**:
  - `취소 조건을 WHERE 에 둔 상태` -> 런타임 결과: C003 누락 실종 (Report Failure).
  - `취소 조건을 ON 에 둔 상태` -> 런타임 결과: C003 정상 복구 (Report Success).
- **피드백**: Outer Join 시 오른쪽 테이블의 필터링 조건은 WHERE에 배치하면 Inner Join과 동일하게 행 유실을 내므로, ON 절에 굳게 박아야 데이터 정합성이 사수됨을 명세한다.

### 실수/주의

- **계산식 중복 기입 회피를 위해 CASE 문 안에서 booked 별칭을 그대로 호출**:
  - `CASE WHEN booked >= c~capacity ...` 로 적으면 "booked is unknown column" 컴파일 거부 에러가 떨어지므로,
  - 쿼리 목록 안에서는 귀찮고 길더라도 원래 공식인 `COALESCE( SUM( b~seats ), 0 )` 을 CASE 내부에 똑같이 통째로 한 번 더 받아 적어 컴파일러의 식 해독 한계를 수호해 주어야 한다.

### 정리

- Outer Join 시 오른쪽 종속 테이블의 필터링은 무조건 **`ON` 절 내부에 도킹 결합**시킨다.
- 인라인 타깃 `@DATA( )` 를 먹은 Join 쿼리의 결과 구조는 중첩 구조가 될 수 있으므로 컬럼 별칭 작명을 확실히 꽂아준다.
- 범위 테이블 조건 대조 시에는 반드시 머리에 골뱅이 **`@`** 마커를 에스케이프 해준다.
