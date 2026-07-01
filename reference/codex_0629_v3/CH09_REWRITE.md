# CH09_REWRITE - DDIC Relationships and F4 Input Help

> 기준 소스: `content/abap/CH09/_chapter.md`, `content/abap/CH09/CH09-L01.md` ~ `CH09-L09.md`
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 기존 `reference/codex_0625`, `reference/codex_0625_v2`
> 공식 문서 확인: `C:\ABAP_DOCU_HTML`의 ABAP Dictionary, Foreign Key dependency, Check Table, Domain semantic property, Value Table, Text Table, Data Element Search Help, Search Help, PARAMETERS type/value option, Dictionary F4, dynpro value-request 항목을 수동 확인

## 챕터 설계

CH08에서 학습자는 데이터베이스에 저장된 값을 `SELECT`로 다시 읽었다. 이제 문제는 한 단계 앞으로 간다. 프로그램이 값을 읽기 전에, 사용자가 애초에 올바른 값을 입력할 수 있어야 한다.

```text
없는 공연 ID를 입력하면 어떻게 막을까?
코드만 보이면 사용자가 무엇을 고르는지 어떻게 알까?
F4를 눌렀을 때 원하는 목록이 뜨게 하려면 어디에 무엇을 붙여야 할까?
```

CH09의 목표는 "DDIC에 관계와 입력 도움말을 선언해 사용자가 올바른 값을 고르게 한다"이다. ABAP 코드보다 Dictionary 설계가 중심이다. 이 장에서 학습자는 `ZCONCERT`, `ZPERF`, `ZBOOKING`이라는 콘서트 예매 모델을 시작하고, 그 모델에 Foreign Key, Check Table, Text Table, Search Help, PARAMETERS F4 연결을 붙인다.

CH09의 핵심 질문은 네 가지다.

| 질문 | DDIC에서 보는 대상 |
|---|---|
| 이 필드의 값은 어느 마스터에 있어야 하는가 | Foreign Key, Check Table |
| 후보 테이블 제안과 실제 검증은 어떻게 다른가 | Value Table vs Foreign Key |
| 코드 옆에 사람이 읽을 이름은 어디에 두는가 | Text Table |
| F4를 누르면 어떤 목록이 뜨고 어떤 값이 돌아오는가 | Search Help, PARAMETERS 연결 |

범위 경계도 분명히 둔다. CH09는 DDIC 선언과 선택화면 입력 도움말의 기초다. 선택화면 이벤트에서 직접 F4를 만드는 구현은 CH15, Dynpro flow logic의 직접 F4는 CH16, 데이터베이스 변경 처리와 transaction 책임은 CH24 이후, 성능과 SQL trace는 CH32 이후로 보낸다.

## CH09-L01 - Foreign Key와 Check Table

### 왜 필요한가

CH08까지는 이미 있는 데이터를 읽었다. 이제부터는 직접 업무 앱을 만든다. 예제는 콘서트 예매다.

처음 필요한 테이블은 세 개다.

| 테이블 | 뜻 | 대표 필드 |
|---|---|---|
| `ZCONCERT` | 공연 마스터 | `CONCERT_ID`, `ARTIST`, `VENUE`, `CAPACITY` |
| `ZPERF` | 공연 회차 | `CONCERT_ID`, `PERF_NO`, `PERF_DATE` |
| `ZBOOKING` | 예매 | `BOOKING_ID`, `CONCERT_ID`, `PERF_NO`, `CUSTOMER`, `SEATS`, `STATUS` |

여기서 가장 먼저 생기는 위험은 `ZBOOKING-CONCERT_ID`에 존재하지 않는 공연 번호가 들어가는 것이다. `ZCONCERT`에는 `C001`, `C002`만 있는데 예매 테이블에 `C999`가 들어가면, 그 예매는 어느 공연의 예매인지 설명할 수 없다. 값은 저장되어 있어도 업무적으로는 고아 데이터가 된다.

Foreign Key와 Check Table은 이 문제를 DDIC 수준에서 줄여 준다. 프로그램마다 같은 존재 확인을 반복하기 전에, "이 필드는 저 마스터 테이블에 실제로 있는 값이어야 한다"라고 선언한다.

### 무엇인가

Foreign Key는 한 테이블의 필드가 다른 테이블의 key 값을 참조한다고 선언하는 DDIC 관계다. 이때 참조 기준이 되는 테이블이 Check Table이다.

콘서트 모델에서는 이렇게 읽는다.

| 역할 | 예 | 설명 |
|---|---|---|
| Check Table | `ZCONCERT` | 실제 공연 ID 목록을 가진 마스터 |
| Foreign Key Table | `ZBOOKING` | 예매 데이터가 들어가는 상세 테이블 |
| Foreign Key Field | `ZBOOKING-CONCERT_ID` | `ZCONCERT-CONCERT_ID`에 존재해야 하는 값 |

공식 문서 기준으로 Foreign Key dependency는 Foreign Key Table과 Check Table 사이의 semantic dependency다. 이 관계는 dynpro 입력 검사, 입력 도움말, view, lock object 등에서 평가될 수 있다. 반대로 ABAP 언어 처리나 ABAP SQL 자체에서 자동 평가되는 것은 아니다. 이 경계는 L08에서 다시 다룬다.

초급자는 우선 이렇게 기억하면 된다.

```text
Foreign Key = "이 필드는 저 테이블의 실제 값만 받아야 한다"는 관계 선언
Check Table = 실제 값 목록을 가진 기준 테이블
```

### 어떻게 확인하는가

SE11에서 `ZBOOKING`을 열고 `CONCERT_ID` 필드를 선택한다. Foreign Keys 버튼을 눌러 다음을 확인한다.

1. Check Table이 `ZCONCERT`인지 확인한다.
2. `ZBOOKING-CONCERT_ID`가 `ZCONCERT-CONCERT_ID`에 대응되는지 확인한다.
3. 두 필드의 타입과 길이가 맞는지 확인한다.
4. 관계를 저장하고 활성화한다.
5. 입력/유지보수 화면에서 없는 공연 ID를 입력해 거부되는지 확인한다.
6. 같은 필드에서 F4를 눌렀을 때 공연 목록이 나오는지 확인한다.

Cardinality는 관계의 개수 감각이다. 공연 1건에는 예매가 여러 건 붙을 수 있으므로 `1:n`으로 설명할 수 있다. CH09에서는 이 값을 모델링 이론으로 깊게 파지 않고 "마스터 한 건에 상세가 몇 건 붙는지 표시하는 항목"으로 이해한다.

### 체험 설계

L01에는 "관계 게이트 실험실"을 둔다.

| 영역 | 설계 |
|---|---|
| 왼쪽 | Check Table `ZCONCERT` 목록: `C001`, `C002` |
| 가운데 | 입력칸 `ZBOOKING-CONCERT_ID` |
| 오른쪽 | 검증 결과와 F4 결과 |
| 버튼 | `C001 입력`, `C999 입력`, `F4로 선택`, `관계선 보기` |
| 상태 | Foreign Key 활성화 여부, Check Table 매핑, 통과/거부 |

`C001 입력`을 누르면 초록색으로 "Check Table에 존재"를 보여 준다. `C999 입력`을 누르면 "Check Table에 없음"으로 거부한다. `F4로 선택`을 누르면 `ZCONCERT` 목록이 뜨고 선택한 공연 ID가 입력칸으로 돌아온다.

### 실수와 주의

첫 번째 실수는 key field mapping을 대충 넘기는 것이다. Check Table의 key field와 Foreign Key Table의 대응 field는 타입이 맞아야 한다.

두 번째 실수는 Foreign Key를 "모든 상황을 자동으로 막아 주는 장치"로 이해하는 것이다. Foreign Key는 DDIC와 화면 입력을 강하게 도와주지만, 프로그램 내부의 모든 업무 판단을 대신하지 않는다.

세 번째 실수는 공연 ID만 연결하고 회차 번호의 의미를 잊는 것이다. 실습에서는 공연 ID 관계부터 안정적으로 만들고, `ZPERF`와 회차 관계는 점진적으로 확장한다.

### 정리

Foreign Key는 "이 필드 값은 저 Check Table에 있어야 한다"는 선언이다. CH09의 콘서트 예매 모델에서는 `ZBOOKING-CONCERT_ID`가 `ZCONCERT-CONCERT_ID`를 참조한다. 이 관계가 있어야 존재하지 않는 공연 번호를 줄이고 F4 목록도 자연스럽게 만들 수 있다.

## CH09-L02 - Value Table과 Foreign Key의 차이

### 왜 필요한가

CH03에서 Domain을 배울 때 Value Table을 봤다. CH09-L01에서는 Foreign Key와 Check Table을 배웠다. 둘 다 "값이 어떤 테이블에서 온다"는 느낌이어서 입문자는 쉽게 헷갈린다.

가장 흔한 질문은 이것이다.

```text
"Domain에 Value Table을 적었는데 왜 입력 검증이 안 되지?"
```

이 질문을 정확히 풀어야 DDIC 설계를 제대로 할 수 있다. Value Table은 제안이고, Foreign Key는 실제 관계다.

### 무엇인가

Value Table은 Domain의 semantic property다. "이 Domain을 사용하는 값은 보통 이 테이블에서 온다"라는 기본 제안에 가깝다. 공식 문서도 Value Table은 Check Table의 default value로 사용될 수 있지만, Value Table을 지정하는 것만으로 check가 발생하지 않는다고 설명한다.

Foreign Key는 테이블 필드에 거는 실제 관계다. 특정 필드의 값이 Check Table에 존재해야 한다고 선언한다.

| 구분 | Value Table | Foreign Key |
|---|---|---|
| 정의 위치 | Domain | 테이블 필드 |
| 성격 | Check Table 후보 제안 | 실제 관계 선언 |
| 입력 검증 | 그 자체만으로는 완성되지 않음 | 화면 입력과 F4에서 활용 |
| 기억법 | "보통 여기서 온다" | "반드시 여기를 참조한다" |

두 객체는 경쟁 관계가 아니라 협력 관계다. Domain의 Value Table이 있으면 Foreign Key를 만들 때 Check Table 후보로 제안될 수 있다. 하지만 최종 검증 관계는 필드의 Foreign Key에서 완성된다.

### 어떻게 확인하는가

`ZDE_CONCERT_ID`라는 Data Element가 `ZDOM_CONCERT_ID` Domain을 참조한다고 가정한다.

1. Domain `ZDOM_CONCERT_ID`에 Value Table로 `ZCONCERT`를 지정한다.
2. `ZBOOKING-CONCERT_ID` 필드가 `ZDE_CONCERT_ID`를 쓰게 한다.
3. Foreign Key 생성 화면에서 Check Table 후보로 `ZCONCERT`가 제안되는지 본다.
4. 실제 Foreign Key를 저장하고 활성화한다.
5. 입력 화면에서 없는 공연 ID가 거부되는지 확인한다.

여기서 1번만 하고 멈추면 "제안"만 있는 상태다. 4번까지 해야 "실제 관계"가 된다.

### 보너스: Conversion Routine(ALPHA)

Domain에는 Conversion Routine도 붙을 수 있다. 대표적인 예가 ALPHA다. 사용자는 `42`처럼 입력하지만 내부 저장은 자리수를 맞춘 `0000000042` 같은 형태가 될 수 있다.

CH09에서 ALPHA를 코딩 주제로 깊게 다루지는 않는다. 다만 다음 감각은 반드시 남긴다.

- 화면 표시 형식과 내부 저장 형식은 다를 수 있다.
- ID 값 비교나 조회가 안 될 때 형식 변환 문제가 원인일 수 있다.
- Domain의 semantic property는 단순 타입 길이보다 넓은 의미를 가진다.

### 체험 설계

L02에는 "제안 vs 검증 스위치보드"를 둔다.

| Value Table | Foreign Key | `C999` 입력 | 해설 |
|---|---|---|---|
| 꺼짐 | 꺼짐 | 통과처럼 보임 | 아무 관계도 없음 |
| 켜짐 | 꺼짐 | 통과처럼 보임 | 후보 제안만 있음 |
| 꺼짐 | 켜짐 | 거부 | Check Table 직접 지정으로 실제 관계 있음 |
| 켜짐 | 켜짐 | 거부 | 제안과 실제 관계가 함께 있음 |

아래에는 ALPHA 미니 체험을 둔다. 입력값 `42`를 넣으면 표시값과 내부값이 서로 다르게 보이는 카드가 열린다. 학습자는 "같은 값처럼 보여도 내부 형식이 다를 수 있다"는 감각을 얻는다.

### 실수와 주의

Value Table만 설정하고 입력 검증이 완성됐다고 판단하면 안 된다. 실제 필드의 Foreign Key를 반드시 확인한다.

반대로 모든 Domain에 Value Table을 무조건 넣을 필요도 없다. 업무 의미상 마스터 테이블 후보가 분명한 Domain에 사용한다.

Conversion Routine은 편리하지만, 초급자는 내부값과 표시값의 차이를 반드시 기억해야 한다. 화면에 보이는 값 그대로 DB에 저장되어 있다고 단정하지 않는다.

### 정리

Value Table은 Domain 수준의 제안이고, Foreign Key는 테이블 필드 수준의 실제 관계다. 이 차이를 이해하면 "왜 Value Table만으로는 검증이 안 되는지"를 설명할 수 있다.

## CH09-L03 - Text Table: 코드 옆 이름표

### 왜 필요한가

업무 시스템은 값을 코드로 저장하는 일이 많다. `C001`, `LH`, `O` 같은 코드는 저장과 비교에는 편하지만 사람에게는 불친절하다. 사용자는 `C001`만 보고 어떤 공연인지 알기 어렵다.

또 하나의 문제가 있다. 같은 코드라도 언어에 따라 표시 이름이 다를 수 있다. 한국어 화면에서는 "아이유 콘서트", 영어 화면에서는 "IU Concert"처럼 보이고 싶다. 이때 코드를 언어별로 바꾸면 데이터가 깨진다. 코드는 하나로 유지하고, 사람이 읽는 텍스트를 언어별로 분리해야 한다.

Text Table은 이 문제를 해결한다.

### 무엇인가

Text Table은 마스터 테이블의 key에 언어 key를 더해 언어별 텍스트를 저장하는 테이블이다. 공식 glossary 기준으로 Text Table은 Check Table의 primary key와 language key로 구성되는 special foreign key table이며, Check Table 각 행에 언어 의존 텍스트를 할당한다.

콘서트 모델에서는 이렇게 나눈다.

| 테이블 | key | 담는 내용 |
|---|---|---|
| `ZCONCERT` | `MANDT`, `CONCERT_ID` | 장소, 정원, 아티스트 같은 기본 정보 |
| `ZCONCERT_T` | `MANDT`, `CONCERT_ID`, `SPRAS` | 언어별 공연명, 설명 |

`SPRAS`는 언어 key다. 같은 `CONCERT_ID = C001`이라도 `SPRAS = KO`이면 한국어 이름, `SPRAS = EN`이면 영어 이름을 담는다.

### 어떻게 확인하는가

SE11에서 Text Table을 설계할 때는 다음을 확인한다.

1. Text Table의 key가 마스터 key를 포함하는가.
2. Text Table key에 언어 key가 추가되어 있는가.
3. Text Table이 마스터 테이블과 Foreign Key로 연결되어 있는가.
4. SE11에서 해당 관계가 Text Table 관계로 인식되는가.
5. F4나 목록에서 코드 옆에 텍스트가 함께 보이는가.

예상 F4 결과는 `C001`만 보이는 것이 아니라 `C001 / 아이유 콘서트 / KSPO DOME`처럼 사용자가 선택할 이유를 알 수 있는 형태여야 한다.

### 체험 설계

L03에는 "언어별 이름표 뷰어"를 둔다.

| 영역 | 설계 |
|---|---|
| 왼쪽 | `ZCONCERT` 마스터: 공연 ID, 장소, 정원 |
| 가운데 | `ZCONCERT_T`: 공연 ID, 언어, 공연명 |
| 오른쪽 | F4 결과 목록 |
| 토글 | `로그인 언어 KO`, `로그인 언어 EN` |
| 실패 버튼 | `SPRAS 누락`, `텍스트 미등록` |

KO를 누르면 `C001 - 아이유 콘서트`, EN을 누르면 `C001 - IU Concert`처럼 보인다. `SPRAS 누락` 버튼은 같은 코드에 여러 언어 이름을 안정적으로 담을 수 없다는 경고를 보여 준다.

### 실수와 주의

Text Table의 key에서 언어 key를 빼면 언어별 텍스트를 분리할 수 없다.

마스터 테이블에 이름 필드를 직접 두는 것이 항상 틀린 것은 아니다. 아주 작은 단일 언어 실습에서는 단순하게 둘 수도 있다. 그러나 SAP 표준과 다국어 업무 모델에서는 코드와 텍스트를 나누는 패턴을 자주 만난다.

Text Table은 단순 "설명 테이블"이 아니라 DDIC가 언어별 텍스트 관계로 이해할 수 있는 구조여야 한다.

### 정리

코드는 마스터에, 사람이 읽는 이름은 Text Table에 둔다. Text Table에는 마스터 key와 언어 key가 함께 들어간다. 이 구조가 있어야 F4와 화면 목록에서 코드 옆에 사용자가 이해할 텍스트를 붙일 수 있다.

## CH09-L04 - Elementary Search Help

### 왜 필요한가

Foreign Key가 있으면 Check Table 기반 F4가 나올 수 있다. 그러나 실무에서는 더 친절한 검색 화면이 필요하다.

예를 들어 공연 ID를 모르는 사용자는 아티스트 이름이나 공연장으로 찾고 싶을 수 있다. 목록에는 공연 ID만이 아니라 아티스트, 장소, 공연명도 보여 주어야 한다. "어떤 컬럼으로 검색하게 할지", "목록에 어떤 컬럼을 보여 줄지", "선택하면 어떤 값이 입력칸으로 돌아올지"를 설계하는 객체가 Search Help다.

Elementary Search Help는 가장 기본 형태다. 하나의 selection method를 기준으로 F4 목록을 만든다.

### 무엇인가

Search Help는 ABAP Dictionary에서 유지보수되는 repository object다. 공식 glossary는 Search Help가 dynpro input field에 single-column 또는 multi-column input help를 제공하며, 사용자가 값의 정확한 철자를 몰라도 관련 데이터를 이용해 찾게 해 준다고 설명한다.

Elementary Search Help의 핵심 구성은 다음이다.

| 구성 | 입문자 설명 |
|---|---|
| Selection Method | 값을 가져올 table 또는 view |
| Parameter | F4에서 사용할 field 목록 |
| IMP | 입력값을 검색 조건으로 받을 수 있는 parameter |
| EXP | 선택한 뒤 입력칸으로 돌려줄 parameter |
| LPos | 결과 목록에서 보일 위치 |
| SPos | 검색 조건 화면에서 보일 위치 |

콘서트 예제로는 `ZSH_CONCERT`를 만들 수 있다. Selection Method는 `ZCONCERT` 또는 공연 텍스트까지 포함한 적절한 view가 될 수 있다. 목록에는 `CONCERT_ID`, `ARTIST`, `VENUE`를 보여 주고, 선택 후에는 `CONCERT_ID`를 입력칸으로 돌려준다.

### 어떻게 확인하는가

SE11에서 Search Help를 만들 때 다음 순서로 확인한다.

1. Search Help 이름을 `ZSH_CONCERT`로 만든다.
2. Type은 Elementary로 둔다.
3. Selection Method를 지정한다.
4. Parameter에 공연 ID, 아티스트, 장소를 둔다.
5. 입력칸으로 돌아와야 하는 공연 ID를 EXP로 표시한다.
6. 검색 조건으로 받을 field에는 SPos를 준다.
7. 결과 목록에 보여 줄 field에는 LPos를 준다.
8. 활성화한다.
9. 연결된 입력 필드에서 F4를 눌러 목록과 반환값을 확인한다.

확인할 때 가장 중요한 것은 EXP다. 목록은 잘 떠도 EXP가 맞지 않으면 사용자가 선택한 값이 입력칸으로 돌아오지 않는다.

### 체험 설계

L04에는 "Elementary Search Help 빌더"를 둔다.

| 단계 | 버튼 | 상태 |
|---|---|---|
| 1 | `Selection Method 선택` | `ZCONCERT` 데이터 미리보기 |
| 2 | `Parameter 추가` | 공연 ID, 아티스트, 장소 field 카드 생성 |
| 3 | `IMP/EXP 지정` | 검색 조건과 반환값 색상 구분 |
| 4 | `LPos/SPos 배치` | F4 팝업 미리보기 갱신 |
| 5 | `활성화` | 사용 가능 상태 |
| 6 | `F4 테스트` | 선택값이 입력칸으로 돌아옴 |

실패 체험도 넣는다. `EXP 빼기` 버튼을 누르면 목록에서 공연을 선택해도 입력칸이 비어 있는 상태를 보여 준다. `LPos 모두 비우기` 버튼은 결과 목록이 사용자가 고르기 어려운 상태라는 피드백을 준다.

### 실수와 주의

첫 번째 실수는 EXP를 지정하지 않는 것이다. F4는 선택값이 입력칸으로 돌아와야 의미가 있다.

두 번째 실수는 너무 큰 테이블을 아무 조건 없이 Selection Method로 쓰는 것이다. 실무에서는 적절한 view나 조건 설계가 필요하다.

세 번째 실수는 Search Help를 만들고 어디에도 붙이지 않는 것이다. Search Help 객체는 만들어진 뒤 Data Element, table field, structure component, 또는 프로그램 parameter에 연결되어야 실제 화면에서 보인다.

### 정리

Elementary Search Help는 하나의 데이터 소스를 기준으로 F4 목록을 설계하는 객체다. Selection Method, Parameter, IMP, EXP, LPos, SPos를 이해하면 "무엇으로 검색하고, 무엇을 보여 주고, 무엇을 돌려줄지"를 설계할 수 있다.

## CH09-L05 - Collective Search Help 기초

### 왜 필요한가

검색 방식이 하나라면 Elementary Search Help로 충분하다. 하지만 사용자는 같은 값을 여러 방식으로 찾고 싶어 한다.

공연 ID를 아는 사용자는 ID로 찾는다. 아티스트만 기억하는 사용자는 아티스트로 찾는다. 장소만 기억하는 사용자는 장소로 찾는다. 이 세 방식을 한 F4 안에서 탭처럼 제공하면 사용자는 자기 상황에 맞게 검색할 수 있다.

이때 사용하는 것이 Collective Search Help다.

### 무엇인가

Collective Search Help는 여러 Elementary Search Help를 하나로 묶는 상위 Search Help다.

```text
ZSH_CONCERT_ALL
  ZSH_CONCERT_BY_ID
  ZSH_CONCERT_BY_ARTIST
  ZSH_CONCERT_BY_VENUE
```

각 Elementary는 자기 검색 방식을 가진다. Collective는 이들을 한 입력 도움말 안에 모은다. 중요한 것은 parameter 대응이다. 어느 탭에서 고르더라도 최종적으로 입력칸에 돌아올 값은 같은 의미의 `CONCERT_ID`여야 한다.

### 어떻게 확인하는가

SE11에서 Collective Search Help를 만들 때 다음을 확인한다.

1. 포함할 Elementary Search Help가 목적별로 나뉘어 있는가.
2. 각 Elementary의 반환 parameter가 Collective의 반환 parameter와 대응되는가.
3. 탭 이름이 사용자가 이해할 업무 언어인가.
4. 각 탭에서 선택한 값이 같은 입력칸에 제대로 돌아오는가.

Elementary 하나만 필요한 상황에 Collective를 만들면 과설계다. 반대로 검색 방식이 여러 개인데 한 Elementary에 모든 조건을 우겨 넣으면 사용자는 어떤 조건을 써야 할지 혼란스럽다.

### 체험 설계

L05에는 "Collective Search Help 탭 시뮬레이터"를 둔다.

| 탭 | 검색 조건 | 결과 목록 | 반환값 |
|---|---|---|---|
| 공연 ID로 | `CONCERT_ID` | 공연 ID, 공연명 | `CONCERT_ID` |
| 아티스트로 | `ARTIST` | 공연 ID, 아티스트, 공연명 | `CONCERT_ID` |
| 장소로 | `VENUE` | 공연 ID, 장소, 공연명 | `CONCERT_ID` |

사용자가 어느 탭에서 행을 고르든 오른쪽 입력칸에는 공연 ID가 들어간다. `parameter 대응 끊기` 버튼을 누르면 탭은 열리지만 선택값이 돌아오지 않는 실패 상태를 보여 준다.

### 실수와 주의

Collective에서 포함 객체만 추가하고 parameter 대응을 빼먹으면 F4 경험이 완성되지 않는다.

검색 방식이 하나뿐인데 Collective를 만들면 학습자와 유지보수자 모두에게 불필요한 복잡도가 생긴다.

탭 이름을 기술 필드명으로만 두면 사용자가 이해하기 어렵다. "ID로 검색", "아티스트로 검색", "장소로 검색"처럼 사용자의 찾는 방식으로 이름 붙인다.

### 정리

검색 소스와 방식이 하나면 Elementary, 여러 방식이면 Collective다. Collective의 핵심은 여러 Elementary를 모으는 것과 선택값이 같은 의미로 돌아오도록 parameter를 대응시키는 것이다.

## CH09-L06 - PARAMETERS와 DDIC F4 Help 연결

### 왜 필요한가

Search Help를 만들었다고 해서 모든 입력칸에 자동으로 뜨는 것은 아니다. 학습자는 이제 이렇게 묻는다.

```text
"내 프로그램의 PARAMETERS 입력칸에는 어떻게 F4가 연결되나요?"
```

CH03에서 Data Element를 배운 이유가 여기서 돌아온다. Data Element는 기술 타입만이 아니라 라벨, 문서, F4 연결 같은 화면 의미를 전달한다. `PARAMETERS`가 Dictionary type을 참조하면 이런 의미 정보가 선택화면으로 흘러올 수 있다.

### 무엇인가

`PARAMETERS`는 선택화면에 단일 입력 필드를 만든다. 공식 문서 기준으로 ABAP Dictionary type을 참조하는 parameter는 field help와 input help, value checking 지원에 영향을 받는다.

기본 형태는 다음과 같다.

```abap
PARAMETERS p_con TYPE zde_concert_id.
```

`zde_concert_id`가 Search Help나 Domain fixed values, 관련 DDIC 의미 정보를 갖고 있다면 선택화면의 F4가 그 정보를 사용할 수 있다.

특정 Search Help를 한 입력칸에 직접 지정하고 싶으면 `MATCHCODE OBJECT`를 쓴다.

```abap
PARAMETERS p_con TYPE zde_concert_id
  MATCHCODE OBJECT zsh_concert_all.
```

공식 문서도 `MATCHCODE OBJECT`가 selection parameter의 input field를 ABAP Dictionary의 Search Help와 연결한다고 설명한다.

### 어떻게 확인하는가

확인 순서는 다음이다.

1. `PARAMETERS`가 built-in 타입만이 아니라 업무 Data Element를 참조하는지 본다.
2. 그 Data Element나 관련 field에 Search Help가 붙어 있는지 본다.
3. 선택화면에서 F4를 눌러 기대한 목록이 뜨는지 본다.
4. 목록에서 선택한 값이 입력칸으로 돌아오는지 본다.
5. `MATCHCODE OBJECT`를 썼다면 지정한 Search Help가 우선 적용되는지 본다.

반대로 다음 코드는 화면 입력칸은 만들지만 DDIC 의미가 약하다.

```abap
PARAMETERS p_con TYPE c LENGTH 10.
```

입력칸은 있지만, 이 값이 공연 ID인지, 어떤 F4가 필요한지, 어떤 라벨과 의미를 가져야 하는지 Dictionary가 알기 어렵다.

### 부착 지점의 차이

Search Help는 어디에 붙이느냐에 따라 영향 범위가 달라진다.

| 붙이는 곳 | 영향 범위 | 적합한 상황 |
|---|---|---|
| Data Element | 그 Data Element를 쓰는 여러 필드 | 같은 의미의 값에 공통 F4 필요 |
| 테이블 필드 | 해당 필드 중심 | 같은 Domain이라도 이 필드만 다르게 |
| Structure component | 그 구조를 쓰는 화면 필드 | 특정 구조 맥락이 중요 |
| `MATCHCODE OBJECT` | 프로그램 입력칸 하나 | 이 parameter만 명시적으로 고정 |

넓게 붙이면 재사용성이 커지고, 좁게 붙이면 영향 범위를 통제하기 쉽다.

### 체험 설계

L06에는 "F4 부착 범위 보드"를 둔다.

| 버튼 | 화면 피드백 |
|---|---|
| `Data Element에 붙이기` | 같은 Data Element를 쓰는 여러 입력칸이 함께 초록색 |
| `테이블 필드에 붙이기` | 특정 field 기반 입력칸만 초록색 |
| `Structure component에 붙이기` | 해당 구조 사용 입력칸만 초록색 |
| `MATCHCODE OBJECT 지정` | `p_con` 하나만 지정 Search Help로 고정 |

상태 패널은 "영향받는 입력칸 수", "재사용 범위", "우선순위 위험"을 보여 준다. 사용자가 너무 넓은 위치에 붙이면 "여러 화면에 동시에 영향을 줄 수 있음"을 경고한다.

### 실수와 주의

F4가 안 뜰 때는 먼저 타입을 본다. built-in 타입으로만 선언하면 DDIC 의미 정보가 연결되지 않을 수 있다.

여러 곳에 Search Help를 겹쳐 붙이면 어느 것이 뜨는지 헷갈린다. 이 문제는 L07의 우선순위 사다리로 확인한다.

Data Element에 붙인 Search Help는 편하지만 영향 범위가 넓다. 공통 의미로 안정적인 경우에 사용한다.

### 정리

DDIC의 F4는 Data Element, field, structure, `MATCHCODE OBJECT` 같은 연결 지점을 통해 선택화면으로 흘러온다. CH09-L06의 결론은 "F4는 화면에서 갑자기 생기는 것이 아니라 DDIC 의미 정보가 입력칸에 연결된 결과"라는 점이다.

## CH09-L07 - Input Help 호출 우선순위

### 왜 필요한가

한 입력칸에 도움말 후보가 여러 개 있을 수 있다. Domain fixed values, Check Table, Search Help, `MATCHCODE OBJECT`, 나중에 배울 직접 F4 이벤트가 겹칠 수 있다. 그런데 사용자는 F4를 한 번만 누른다.

이때 SAP은 모든 후보를 동시에 보여 주지 않는다. 정해진 순서로 가장 우선순위가 높은 하나를 선택한다. 이 순서를 모르면 "왜 내가 붙인 Search Help가 안 뜨지?" 같은 문제를 해결할 수 없다.

### 무엇인가

CH09에서는 우선순위를 다음 사다리로 설명한다.

```text
1. 코드로 직접 만든 F4
2. Search Help
3. Check Table, Text Table, fixed values
4. 타입 기본 도움
```

핵심 문장은 "위가 있으면 아래는 안 본다"이다.

코드로 직접 만든 F4는 선택화면 value-request나 Dynpro value-request에서 구현한다. 공식 dynpro 문서도 value-request processing block이 system/DDIC input help를 override할 수 있다고 설명한다. 하지만 CH09에서는 구현하지 않는다. CH15/CH16에서 배울 항목이라는 배지만 붙인다.

### 어떻게 확인하는가

기존 `embeds/abap/CH09-L07-S01.html`을 사용한다. 이 embed는 F4 우선순위 사다리를 시각화한다.

추가 상황 카드는 다음처럼 둔다.

| 상황 | 예상 결과 |
|---|---|
| `MATCHCODE OBJECT`가 지정된 parameter | 지정한 Search Help가 뜸 |
| Search Help는 없고 Check Table만 있음 | Check Table 기반 목록이 뜸 |
| Domain fixed values만 있음 | fixed values 목록이 뜸 |
| 아무 DDIC 도움말이 없는 날짜 field | 달력 같은 타입 기본 도움 |
| 직접 F4 이벤트가 있음 | 직접 만든 F4가 최우선. 구현은 CH15/16 |

### 체험 설계

L07에는 기존 사다리에 "우선순위 토글 실험"을 붙인다.

| 토글 | 의미 |
|---|---|
| 직접 F4 있음 | 최상위 후보 |
| Search Help 있음 | 설계형 F4 |
| Check Table 있음 | 마스터 값 목록 |
| fixed values 있음 | 짧은 코드 목록 |
| 타입 기본 도움 있음 | 달력, 시계 등 기본 도움 |

`F4 누르기` 버튼을 누르면 켜진 후보 중 가장 높은 하나만 팝업으로 표시한다. 예를 들어 Search Help와 Check Table이 모두 켜져 있으면 Search Help가 뜬다. Search Help를 끄면 그제야 Check Table 목록이 뜬다.

상태 메시지는 이렇게 쓴다.

```text
2단계 Search Help가 존재하므로 3단계 Check Table은 평가하지 않습니다.
상위 도움말이 없어서 타입 기본 도움으로 내려왔습니다.
```

### 실수와 주의

여러 도움말을 겹쳐 붙이면 의도와 다른 목록이 뜰 수 있다. F4가 예상과 다르면 사다리를 위에서부터 점검한다.

Data Element에 붙인 Search Help는 여러 화면에 영향을 줄 수 있다. 특정 입력칸만 바꾸고 싶다면 `MATCHCODE OBJECT` 같은 좁은 연결을 고려한다.

직접 F4 이벤트는 강력하지만 CH09의 구현 대상이 아니다. 지금은 "최상위에 존재한다"는 우선순위만 기억한다.

### 정리

F4는 여러 후보 중 우선순위가 가장 높은 하나만 보여 준다. 예상과 다른 목록이 뜨면 직접 F4, Search Help, Check Table/Text Table/fixed values, 타입 기본 도움 순서로 점검한다.

## CH09-L08 - DDIC 검증과 프로그램 검증의 역할 분리

### 왜 필요한가

Foreign Key, fixed values, Search Help를 배우면 DDIC가 모든 검증을 대신한다고 생각하기 쉽다. 하지만 실무 규칙은 더 넓다.

공연 ID가 실제로 존재하는지는 DDIC가 잘 도와준다. 하지만 "잔여석보다 많이 예매할 수 없다", "이미 취소된 예매는 다시 취소할 수 없다", "관리자만 특정 상태를 바꿀 수 있다" 같은 업무 규칙은 DDIC 관계만으로 표현하기 어렵다.

L08의 목표는 검증 책임을 나누는 것이다.

### 무엇인가

검증은 크게 두 계층으로 나눌 수 있다.

| 검증 | 주 담당 | 예 |
|---|---|---|
| 존재와 형식 | DDIC | 공연 ID가 마스터에 있는가, 상태 코드가 허용값인가 |
| 업무 규칙 | 프로그램 | 잔여석이 충분한가, 상태 전이가 가능한가, 권한이 있는가 |

Foreign Key 공식 문서의 경계도 이 생각을 뒷받침한다. Foreign Key dependency는 input check와 input help에서 평가되지만, ABAP 언어 처리나 SQL 처리 자체에서 자동 평가되지 않는다.

따라서 원칙은 다음이다.

```text
DDIC로 표현 가능한 존재/형식 검증은 DDIC에 둔다.
상황에 따라 달라지는 업무 규칙은 프로그램에서 판단한다.
```

### 어떻게 확인하는가

존재 검증은 DDIC에서 확인한다. `ZBOOKING-CONCERT_ID`에 Foreign Key가 있고, 유지보수/입력 화면에서 없는 공연 ID가 거부되면 DDIC 검증이 작동한 것이다.

프로그램 흐름 안에서 특정 값을 확인해야 한다면 읽기 조회로 존재 여부를 판단할 수 있다. CH09에서는 변경 처리를 보여 주지 않고, 읽기 확인만 보여 준다.

```abap
REPORT zch09_l08_check_concert.

PARAMETERS p_con TYPE zde_concert_id.

DATA lv_concert_id TYPE zconcert-concert_id.

SELECT SINGLE concert_id
  FROM zconcert
  INTO lv_concert_id
  WHERE concert_id = p_con.

IF sy-subrc = 0.
  WRITE: / '공연 마스터에 존재하는 값입니다:', lv_concert_id.
ELSE.
  WRITE: / '공연 마스터에 없는 값입니다.'.
ENDIF.
```

이 코드는 DDIC를 대체하자는 뜻이 아니다. 프로그램 흐름에서 사용자의 입력값을 다시 확인해야 하는 지점이 있을 수 있다는 감각을 주기 위한 읽기 전용 예제다. 정식 선택화면 검증과 message 처리 구조는 CH15에서 다룬다.

### 체험 설계

L08에는 "검증 책임 라우터"를 둔다.

| 카드 | 정답 바구니 |
|---|---|
| 공연 ID가 마스터에 존재하는가 | DDIC |
| 상태 코드가 허용값 중 하나인가 | DDIC |
| 잔여석보다 많이 신청했는가 | 프로그램 |
| 사용자가 취소 권한을 갖는가 | 프로그램 |
| 공연일이 이미 지났는가 | 프로그램 |

두 번째 탭은 실행 흐름 비교다.

| 버튼 | 피드백 |
|---|---|
| `화면 입력` | DDIC Foreign Key가 먼저 도움을 주는 그림 |
| `프로그램 확인` | 업무 규칙을 프로그램이 판단하는 그림 |
| `모든 것을 코드로` | 재사용성과 일관성 손실 경고 |
| `모든 것을 DDIC로` | 업무 규칙 누락 경고 |

### 실수와 주의

모든 검증을 코드로만 만들면 DDIC가 제공하는 재사용성과 일관성을 잃는다. 같은 의미의 필드가 여러 화면에서 제각각 검증될 수 있다.

반대로 DDIC만 믿고 업무 규칙을 생략하면 실제 업무 사고를 막지 못한다. DDIC는 존재와 형식에는 강하지만, 상황별 판단은 프로그램이 책임져야 한다.

CH09에서는 데이터베이스 변경 코드와 transaction 처리를 앞당기지 않는다. 읽기 확인과 책임 분리만 다룬다.

### 정리

DDIC는 존재와 형식, 프로그램은 업무 규칙을 담당한다. 이 경계를 알면 SAP 개발에서 검증을 어디에 둘지 판단할 수 있다.

## CH09-L09 - 실습: 콘서트 모델 만들기(DDIC)

### 왜 필요한가

CH09의 개념은 하나씩 들으면 이해되지만, 실제 객체로 묶어 보지 않으면 오래가지 않는다. 이제 콘서트 예매 모델을 직접 만든다.

이 실습에서 만든 `ZCONCERT`, `ZPERF`, `ZBOOKING`은 이후 장에서 계속 사용된다. CH10에서는 잔여석 계산과 예매 판정 로직을 모듈화하고, CH11에서는 예매 목록을 ALV로 보여 주고, 뒤 장에서는 화면과 서비스로 확장한다. 따라서 CH09-L09는 단순 실습이 아니라 이후 과정의 데이터 토대를 놓는 단계다.

### 무엇인가

세 테이블은 다음 역할을 나눈다.

| 테이블 | 역할 | key | 주요 field |
|---|---|---|---|
| `ZCONCERT` | 공연 마스터 | `MANDT`, `CONCERT_ID` | `ARTIST`, `VENUE`, `CAPACITY` |
| `ZPERF` | 공연 회차 | `MANDT`, `CONCERT_ID`, `PERF_NO` | `PERF_DATE` |
| `ZBOOKING` | 예매 | `MANDT`, `BOOKING_ID` | `CONCERT_ID`, `PERF_NO`, `CUSTOMER`, `SEATS`, `STATUS` |

`ZCONCERT`는 공연 자체, `ZPERF`는 날짜별 회차, `ZBOOKING`은 누가 어떤 회차를 몇 석 예매했는지를 담는다. 예매자 이름 예제에는 이름 풀 기준으로 정훈영을 사용한다.

### 어떻게 확인하는가

실습 순서는 다음과 같다.

1. Domain과 Data Element를 만든다.
   - 공연 ID, 회차 번호, 예매 ID, 상태, 좌석 수의 의미를 나눈다.
   - 상태 Domain에는 필요한 fixed values를 둔다.
2. `ZCONCERT`를 만든다.
   - 공연 ID, 아티스트, 장소, 정원을 정의하고 활성화한다.
3. `ZPERF`를 만든다.
   - 공연 ID와 회차 번호를 key로 잡고, 공연 날짜를 둔다.
4. `ZBOOKING`을 만든다.
   - 예매 ID를 key로 잡고, 공연 ID, 회차 번호, 예매자, 좌석 수, 상태를 둔다.
5. Foreign Key를 만든다.
   - `ZBOOKING-CONCERT_ID`가 `ZCONCERT-CONCERT_ID`를 참조하게 한다.
   - `ZPERF-CONCERT_ID`도 `ZCONCERT`와 연결해 공연 없는 회차가 생기지 않게 한다.
6. Search Help `ZSH_CONCERT`를 만든다.
   - Selection Method는 `ZCONCERT` 또는 적절한 view로 둔다.
   - 공연 ID, 아티스트, 장소를 목록에 보여 준다.
   - 공연 ID를 EXP로 돌려준다.
7. 테스트 데이터를 넣고 확인한다.
   - 공연 2개, 회차 3개, 예매 3건을 만든다.
   - 예매자 중 하나는 정훈영으로 한다.
   - 없는 공연 ID를 입력해 거부되는지 본다.
   - F4를 눌러 공연 목록이 뜨는지 본다.

### 체험 설계

L09에는 "콘서트 모델 제작 체크리스트"를 둔다.

| 카드 | 상태 |
|---|---|
| Domain | 미작성, 작성, 활성화 |
| Data Element | 미작성, 작성, 활성화 |
| `ZCONCERT` | 미작성, 작성, 활성화, 테스트 데이터 있음 |
| `ZPERF` | 미작성, 작성, 활성화, 테스트 데이터 있음 |
| `ZBOOKING` | 미작성, 작성, 활성화, 테스트 데이터 있음 |
| Foreign Key | 미설정, 설정, 활성화, 거부 테스트 통과 |
| Search Help | 미설정, 설정, 활성화, F4 테스트 통과 |

오른쪽에는 현재까지 만든 객체 관계도를 보여 준다.

```text
ZCONCERT
  -> ZPERF
  -> ZBOOKING
```

하단 테스트 버튼은 다음 네 개다.

| 버튼 | 기대 피드백 |
|---|---|
| `정상 공연 ID 입력` | 통과 |
| `없는 공연 ID 입력` | 거부 |
| `F4 누르기` | 공연 ID, 아티스트, 장소 목록 표시 |
| `정훈영 예매 확인` | `ZBOOKING`에서 정훈영 예매 행 강조 |

### 실수와 주의

활성화를 빼먹으면 객체가 만들어진 것처럼 보여도 실제 화면에서 동작하지 않는다. 테이블, Foreign Key, Search Help는 작성 후 active 상태를 확인한다.

Built-in 타입만 쓰면 라벨, fixed values, Search Help 같은 의미 정보가 재사용되지 않는다. 실습에서는 가능한 한 Data Element를 사용한다.

`ZPERF`와 `ZBOOKING`의 관계는 공연 ID뿐 아니라 회차 번호까지 고려해야 한다. 초급 실습에서는 공연 ID 관계부터 안정적으로 만들고, 회차 조합 관계는 확장 과제로 둔다.

### 정리

CH09-L09의 결론은 "DDIC 관계와 F4는 실제 업무 모델에서 함께 완성된다"이다. 콘서트 모델을 만들고, 관계를 걸고, F4로 고르고, 잘못된 값을 거부하는 경험까지 해야 CH10의 로직 설계로 넘어갈 준비가 된다.

## CH09 마무리

CH09를 마치면 학습자는 다음을 설명할 수 있어야 한다.

| 기준 | 할 수 있어야 하는 일 |
|---|---|
| Foreign Key | Foreign Key Table field가 Check Table key를 참조한다고 설명 |
| Check Table | 실제 허용값 목록을 가진 기준 테이블이라고 설명 |
| Value Table | Domain 수준의 후보 제안이며 실제 검증은 Foreign Key에서 완성됨을 설명 |
| Text Table | 마스터 key와 언어 key로 언어별 텍스트를 담는 구조 설명 |
| Elementary Search Help | 하나의 selection method로 F4 목록을 설계 |
| Collective Search Help | 여러 검색 방식을 한 F4 안에 탭처럼 묶음 |
| PARAMETERS 연결 | Data Element와 `MATCHCODE OBJECT`로 F4가 선택화면에 연결됨을 설명 |
| F4 우선순위 | 상위 도움말이 있으면 하위 도움말을 보지 않는다고 설명 |
| 검증 책임 | 존재/형식은 DDIC, 업무 규칙은 프로그램으로 분리 |
| 콘서트 모델 | `ZCONCERT`, `ZPERF`, `ZBOOKING`의 역할과 관계 설명 |

최종 과제는 다음 기준으로 확인한다.

1. `ZBOOKING-CONCERT_ID`가 `ZCONCERT`를 참조하는 Foreign Key를 갖는다.
2. 없는 공연 ID가 입력/유지보수 화면에서 거부된다.
3. F4를 누르면 사용자가 고를 수 있는 설명 column이 함께 보인다.
4. Search Help에서 선택한 값이 실제 입력칸으로 돌아온다.
5. 학습자가 "Value Table은 제안, Foreign Key는 실제 관계"를 말로 설명할 수 있다.

이 과제를 통과하면 CH10에서 잔여석 계산과 예매 판정 로직을 모듈로 묶을 준비가 된다.
