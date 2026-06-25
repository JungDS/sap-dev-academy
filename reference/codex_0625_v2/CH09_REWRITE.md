# CH09_REWRITE - DDIC 관계와 입력도움말(F4) v2

> 목적: `content/abap/CH09`의 현재 9개 레슨을 기준으로, v1의 템플릿 반복을 제거하고 "입문자가 DDIC 관계와 F4 입력 도움말을 실제 화면 흐름으로 이해할 수 있는 완성 강의자료" 수준의 기준 원고를 만든다. 이 문서는 아직 `content/abap` 원본 반영본이 아니라, 반영 전 검수 가능한 v2 재작성 산출물이다.

## CH09 전체 설계

CH08까지 학습자는 데이터베이스에서 값을 읽는 방법을 배웠다. 그런데 실제 업무 프로그램에서 더 큰 문제는 "읽을 값이 있는가"만이 아니다. 사용자가 애초에 잘못된 값을 입력하지 않게 해야 한다. 공연 예매 화면에서 존재하지 않는 공연 번호를 입력할 수 있거나, 코드만 보이고 사람이 읽을 이름이 보이지 않거나, F4를 눌렀는데 기대한 목록이 나오지 않으면 프로그램은 초급자가 보기에 갑자기 불친절해진다.

CH09의 한 문장 목표는 "DDIC에 관계와 입력 도움말을 선언해, 사용자가 올바른 값을 고를 수 있게 한다"이다.

이 장은 ABAP 코드보다 Dictionary 설계가 중심이다. 따라서 설명의 중심은 다음 세 질문이다.

1. 이 필드에 들어갈 값은 어느 마스터에서 와야 하는가.
2. 사용자가 코드를 외우지 않아도 어떤 목록을 보고 고를 수 있는가.
3. DDIC가 해 줄 검증과 프로그램이 직접 해야 할 검증은 어디서 갈리는가.

### 범위와 금지선

CH09는 classic-first 구간이다. 코드 예제에는 inline declaration, constructor expression, string template, New Open SQL 문법을 넣지 않는다. 선택화면 이벤트와 Dynpro의 직접 F4 이벤트는 CH15/CH16에서 정식으로 다룬다. CH09-L07에서는 우선순위 사다리의 맨 위에 그런 직접 F4가 존재한다는 사실만 L1로 예고한다.

데이터 저장과 트랜잭션 제어는 CH24 이후의 주제다. CH09-L08에서는 "DDIC 화면 검증이 프로그램의 직접 처리까지 대신하지 않는다"는 책임 경계만 설명하고, 데이터 변경 문장 자체를 코드로 보여 주지 않는다.

### 현재 소스 범위

`.project-docs/09_CURRICULUM_LEDGER.md`에는 오래된 6레슨 표가 남아 있지만, `content/abap/CH09` 현재 상태와 `.project-docs/12_EXPANSION_PLAN.md`는 9레슨 구성을 반영한다. 따라서 v2의 authoritative scope는 현재 원본 폴더의 9개 레슨이다.

| 레슨 | 현재 주제 | v2 재작성 초점 |
| --- | --- | --- |
| CH09-L01 | Foreign Key와 Check Table | 아무 값이나 입력되는 문제를 관계 선언으로 막기 |
| CH09-L02 | Value Table과 Foreign Key의 차이 | 제안과 실제 검증의 차이 |
| CH09-L03 | Text Table | 코드 옆에 언어별 이름표 붙이기 |
| CH09-L04 | Elementary Search Help | 단일 소스 F4 목록 설계 |
| CH09-L05 | Collective Search Help | 여러 검색 방식을 탭으로 묶기 |
| CH09-L06 | PARAMETERS와 DDIC F4 연결 | Data Element/필드/MATCHCODE 부착 범위 |
| CH09-L07 | Input Help 호출 우선순위 | 여러 도움말 중 무엇이 뜨는가 |
| CH09-L08 | DDIC 검증과 프로그램 검증 | 선언 검증과 업무 규칙의 책임 분리 |
| CH09-L09 | 콘서트 모델 실습 | ZCONCERT/ZPERF/ZBOOKING 관계와 F4를 직접 만들기 |

### 공식 문서 수동 확인 기준

v1은 CH09에 관련 없는 제어문/반복문 문서가 붙었다. v2는 다음 파일만 수동 근거로 채택한다.

- `C:\ABAP_DOCU_HTML\abenabap_dictionary.htm`: ABAP Dictionary가 테이블, 뷰, Search Help를 관리하고 Domain fixed values, Check Table, Search Help가 F4 help에 쓰인다는 전체 근거.
- `C:\ABAP_DOCU_HTML\abenddic_database_tables_forkeyrel.htm`: Foreign Key dependency는 Foreign Key Table과 Check Table 사이의 의미 관계이며, input check와 input help에는 평가되지만 ABAP 언어/SQL 자체에서는 평가되지 않는다는 경계.
- `C:\ABAP_DOCU_HTML\abenddic_database_tables_checktab.htm`: Check Table 지정, Domain의 Value Table 기본 제안, key field 대응과 같은 기본 규칙.
- `C:\ABAP_DOCU_HTML\abenddic_database_tables_forkey.htm`: Foreign Key 정의, Cardinality, Text Table key field type, 자동 검사 경계.
- `C:\ABAP_DOCU_HTML\abenddic_domains_sema.htm`: Domain의 fixed values, Value Table, Conversion Routine, Value Table만으로는 check가 발생하지 않는다는 근거.
- `C:\ABAP_DOCU_HTML\abenvalue_table_glosry.htm`: Value Table이 Check Table의 기본값으로 쓰인다는 glossary 근거.
- `C:\ABAP_DOCU_HTML\abentext_table_glosry.htm`: Text Table의 키가 Foreign Key + language key이고 언어별 텍스트를 담는다는 근거.
- `C:\ABAP_DOCU_HTML\abenddic_data_elements_sema.htm`: Data Element에 Search Help를 붙이고, Dynpro field 자체의 Search Help가 있으면 그쪽이 우선된다는 근거.
- `C:\ABAP_DOCU_HTML\abensearch_help_glosry.htm`: Search Help는 관련 데이터를 이용해 입력값을 찾게 해 주며 Check Table과 연결될 수 있다는 근거.
- `C:\ABAP_DOCU_HTML\abapparameters_type.htm`: `PARAMETERS`가 Dictionary type을 참조할 때 F4와 value checking 지원이 따라오는 근거.
- `C:\ABAP_DOCU_HTML\abapparameters_value.htm`: `MATCHCODE OBJECT`가 selection parameter 입력 필드에 Search Help를 직접 연결한다는 근거.
- `C:\ABAP_DOCU_HTML\abendynpro_f4_help_dic_abexa.htm`: Dictionary 기반 F4의 fixed values, Data Element Search Help, Check Table Search Help, field Search Help 사례.
- `C:\ABAP_DOCU_HTML\dynpprocess.htm`: `PROCESS ON VALUE-REQUEST`가 Dictionary/system input help를 override할 수 있으나 predefined help가 충분하지 않을 때만 써야 한다는 근거.
- `C:\ABAP_DOCU_HTML\abensel_screen_f4_help_abexa.htm`: selection screen에서 직접 F4를 만드는 예는 CH15 예고용 근거.

### CH09 공통 체험 장치

CH09는 화면과 Dictionary 객체 사이의 연결이 보이지 않으면 이해가 어렵다. 각 레슨은 "선언한 객체 -> 화면의 F4/검증 -> 결과"를 같은 페이지에서 보여 주는 방식으로 설계한다.

- L01: "관계 게이트 실험실"에서 `ZBOOKING-CONCERT_ID`에 `C001`과 `C999`를 넣어 보고 Check Table `ZCONCERT` 통과/거부를 비교한다.
- L02: "제안 vs 검증 스위치보드"에서 Value Table만 설정한 경우와 Foreign Key까지 설정한 경우를 토글한다.
- L03: "언어별 이름표 뷰어"에서 로그인 언어를 KO/EN으로 바꾸면 `ZCONCERT_T`의 텍스트가 바뀌는 모습을 본다.
- L04: "Elementary Search Help 빌더"에서 Selection Method, IMP, EXP, LPos, SPos를 조립해 F4 팝업을 만든다.
- L05: "Collective Search Help 탭 시뮬레이터"에서 ID/이름/장소 검색 탭이 같은 반환 필드로 돌아오는 흐름을 본다.
- L06: "F4 부착 범위 보드"에서 Data Element, table field, structure component, `MATCHCODE OBJECT`의 영향 범위를 색으로 비교한다.
- L07: 기존 `embeds/abap/CH09-L07-S01.html`을 사용하고, 도움말 후보 토글을 붙여 가장 높은 우선순위 하나만 뜨는 원리를 확인한다.
- L08: "검증 책임 라우터"에서 존재/형식은 DDIC, 좌석 초과/상태 전이/권한은 프로그램 책임으로 분류한다.
- L09: "콘서트 모델 제작 체크리스트"에서 Domain, Data Element, Table, Foreign Key, Search Help, 테스트 데이터가 순서대로 완료되는 상태판을 제공한다.

---

## CH09-L01 - Foreign Key와 Check Table

### 왜 필요한가

CH08에서 학습자는 `SFLIGHT`나 `ZGUGUDAN`을 읽으며 "데이터베이스에 있는 값을 가져오는 법"을 배웠다. 이제 문제는 반대 방향으로 바뀐다. 사용자가 새 예매를 입력할 때, 존재하지 않는 공연 번호를 입력하면 어떻게 될까?

예를 들어 공연 마스터 `ZCONCERT`에는 `C001`, `C002`만 있는데 예매 테이블 `ZBOOKING`에 `C999`가 들어가면, 나중에 예매 목록을 읽을 때 "이 예매가 어느 공연인지" 설명할 수 없다. 데이터베이스에는 값이 들어갔지만 업무적으로는 고아 데이터가 된다.

Foreign Key와 Check Table은 이 문제를 DDIC 수준에서 막는 장치다. 프로그램마다 같은 검사를 새로 짜기 전에, "이 필드의 값은 저 테이블에 실제로 있는 값이어야 한다"라고 선언한다.

### 무엇인가

[[Foreign Key]]는 테이블 필드에 거는 실제 관계 선언이다. 이 필드의 값이 다른 테이블에 존재해야 한다는 의미를 가진다. 그 기준이 되는 테이블이 [[Check Table]]이다.

콘서트 예매 예제로 보면 관계는 이렇게 읽는다.

| 역할 | 예시 | 뜻 |
| --- | --- | --- |
| Check Table | `ZCONCERT` | 공연 마스터. 실제 공연 ID 목록을 가진다. |
| Foreign Key Table | `ZBOOKING` | 예매 테이블. 공연 ID를 참조한다. |
| Foreign Key Field | `ZBOOKING-CONCERT_ID` | 이 값은 `ZCONCERT-CONCERT_ID`에 존재해야 한다. |

초급자에게 가장 중요한 문장은 이것이다. "Foreign Key는 데이터베이스 두 테이블을 물리적으로 합치는 기능이 아니라, 값의 의미 관계를 DDIC에 선언하는 기능이다."

공식 문서 기준으로도 Foreign Key dependency는 Foreign Key Table과 Check Table 사이의 semantic dependency다. 그리고 이 관계는 input check와 input help에는 평가되지만, ABAP 언어 문장이나 ABAP SQL 자체에서 자동으로 평가되는 것은 아니다. 이 경계는 L08에서 다시 정리한다.

### 어떻게 확인하는가

SE11에서 `ZBOOKING`을 열고 `CONCERT_ID` 필드를 선택한다. Foreign Keys 버튼을 눌러 Check Table을 `ZCONCERT`로 지정한다. 그다음 key field 대응을 확인한다.

- `ZCONCERT-CONCERT_ID`가 `ZBOOKING-CONCERT_ID`와 대응되는가.
- client 필드는 시스템이 맞추는 구조인가.
- Cardinality는 공연 1건에 예매 여러 건인 `1:n` 관계로 이해할 수 있는가.
- 활성화 후 유지보수 화면이나 테스트 입력에서 존재하지 않는 공연 ID가 거부되는가.

여기서 Cardinality는 관계의 개수 감각이다. 공연 하나에는 예매가 여러 건 붙을 수 있으므로 `1:n`이라고 말할 수 있다. CH09에서는 Cardinality를 성능이나 모델링 이론으로 깊게 파지 않고, "마스터 1건에 상세가 몇 건 붙을 수 있는지 표시하는 항목"으로 이해한다.

### 체험 설계

"관계 게이트 실험실"은 세 영역으로 구성한다.

- 왼쪽: Check Table `ZCONCERT`.
  - `C001 / 아이유 콘서트 / KSPO DOME`
  - `C002 / 김연아 아이스쇼 / 잠실`
- 가운데: 입력 카드 `ZBOOKING-CONCERT_ID`.
  - 버튼: `C001 입력`, `C999 입력`, `F4로 고르기`.
- 오른쪽: 검증 결과.
  - `C001`: 초록색 "통과 - Check Table에 존재".
  - `C999`: 빨간색 "거부 - Check Table에 없음".
  - `F4로 고르기`: `ZCONCERT` 목록이 뜨고 선택한 값이 입력칸으로 돌아옴.

상태 패널에는 "Foreign Key Field -> Check Table key field" 연결선을 보여 준다. 사용자가 `C999`를 누르면 연결선이 끊어진 그림으로 바뀐다.

### 실수와 주의

Foreign Key를 만들었는데 검증이 안 되는 가장 흔한 이유는 key field 대응이 틀린 것이다. Check Table의 key와 Foreign Key Table의 필드가 같은 데이터 타입으로 정확히 매핑되어야 한다.

또 하나의 오해는 "Foreign Key가 있으면 모든 프로그램 처리가 자동으로 안전하다"는 생각이다. DDIC 관계는 화면 입력과 F4 같은 곳에서 강력한 도움을 주지만, 프로그램의 모든 직접 처리 책임을 없애지는 않는다. 이 경계는 L08의 핵심이다.

### 정리

L01의 결론은 "아무 값이나 입력되는 문제는 먼저 DDIC 관계로 막는다"이다. Foreign Key는 이 필드가 어느 마스터를 참조하는지 선언하고, Check Table은 실제 존재 여부를 확인할 기준이 된다.

---

## CH09-L02 - Value Table과 Foreign Key의 차이

### 왜 필요한가

초급자는 CH03에서 Domain을 배웠고, CH09-L01에서 Foreign Key를 배웠다. 둘 다 "값의 후보 테이블"처럼 보이기 때문에 곧바로 헷갈린다.

"Domain에 Value Table을 적었는데 왜 입력 검증이 안 되지?"

이 질문을 정확히 풀어야 한다. Value Table과 Foreign Key는 비슷해 보이지만 책임이 다르다. 하나는 제안이고, 다른 하나는 실제 관계다.

### 무엇인가

[[Value Table]]은 Domain 수준의 제안이다. "이 Domain을 쓰는 값은 보통 이 테이블에서 온다"라고 알려 준다. 반면 Foreign Key는 테이블 필드 수준의 실제 관계다. 특정 필드에 "이 값은 저 Check Table에 있어야 한다"라고 거는 선언이다.

| 구분 | Value Table | Foreign Key |
| --- | --- | --- |
| 정의 위치 | Domain | 테이블 필드 |
| 의미 | Check Table 후보 제안 | 실제 관계와 검증 |
| 입력 검증 강제 | 그 자체로는 아님 | 화면/입력 도움말에서 작동 |
| 초급자 기억법 | "이 도메인은 보통 여기서 온다" | "이 필드는 반드시 저 테이블을 참조한다" |

공식 문서도 Domain의 Value Table은 Check Table의 default value로 쓰일 수 있지만, Value Table만 지정한다고 check가 발생하지 않는다고 설명한다. 이 한 문장을 강의에서 반드시 강조해야 한다.

### 어떻게 확인하는가

SE11에서 Domain `ZCONCERT_ID`를 만든다고 가정한다. Domain에 Value Table로 `ZCONCERT`를 지정한다. 이때 시스템은 나중에 어떤 테이블 필드가 이 Domain 기반 Data Element를 사용할 때 Check Table 후보로 `ZCONCERT`를 제안할 수 있다.

그러나 `ZBOOKING-CONCERT_ID` 필드에 Foreign Key를 실제로 만들지 않으면 "존재하지 않는 값 거부"가 완성되지 않는다. 따라서 확인 순서는 두 단계다.

1. Domain에 Value Table이 있는지 본다.
2. 실제 테이블 필드에 Foreign Key가 생성되어 있는지 본다.

둘 중 두 번째가 실제 검증의 핵심이다.

### 보너스: Conversion Routine(ALPHA)

Domain에는 Conversion Routine도 붙을 수 있다. 대표적인 예가 ALPHA다. 사용자는 `42`라고 입력하지만 내부 저장은 `0000000042`처럼 자리수를 맞추는 방식이다.

CH09에서는 ALPHA를 깊게 코딩하지 않는다. 대신 다음 감각만 잡는다.

- 화면 표시 형식과 내부 저장 형식은 다를 수 있다.
- ID를 비교하거나 조회할 때 형식이 맞지 않으면 "분명히 있는데 없음"처럼 보일 수 있다.
- Domain에 붙은 의미 규칙은 화면과 입력 도움말, 조회 조건 해석에 영향을 줄 수 있다.

### 체험 설계

"제안 vs 검증 스위치보드"는 두 개의 토글을 둔다.

- 토글 1: Domain `ZCONCERT_ID`에 Value Table `ZCONCERT` 지정.
- 토글 2: `ZBOOKING-CONCERT_ID`에 Foreign Key 지정.

입력값은 `C001`과 `C999` 두 개다. 상태는 네 가지로 보여 준다.

| Value Table | Foreign Key | `C999` 입력 결과 | 해설 |
| --- | --- | --- | --- |
| 없음 | 없음 | 통과처럼 보임 | 아무 관계도 선언하지 않음 |
| 있음 | 없음 | 통과처럼 보임 | 후보 제안만 있고 실제 검증 없음 |
| 없음 | 있음 | Check Table 직접 지정 시 거부 | 실제 관계가 있으므로 검증 |
| 있음 | 있음 | 거부 | 제안과 실제 관계가 함께 있음 |

아래에는 ALPHA 미니 카드도 둔다. 입력 `42`를 넣으면 내부값 `0000000042`, 화면값 `42`로 바뀌는 애니메이션을 보여 준다.

### 실수와 주의

Value Table만 보고 "검증이 걸렸다"고 착각하면 안 된다. 실제 테이블 필드의 Foreign Key 설정 화면까지 확인해야 한다.

반대로 모든 필드에 Foreign Key를 무조건 걸어야 한다고 이해해도 안 된다. 업무적으로 참조 관계가 있는 필드에 걸어야 한다. 단순 분류 값은 Domain fixed values가 더 알맞을 수 있다.

### 정리

L02의 결론은 "Value Table은 후보 제안, Foreign Key는 실제 관계"이다. 이 차이를 이해하면 DDIC에서 값의 출처를 설계할 때 무엇을 어디에 설정해야 하는지 헷갈리지 않는다.

---

## CH09-L03 - Text Table: 코드 옆 이름표

### 왜 필요한가

업무 데이터는 코드로 저장되는 경우가 많다. 공연 ID `C001`, 항공사 코드 `LH`, 상태 코드 `O`처럼 짧은 값은 저장과 비교에는 좋지만 사람이 읽기에는 불친절하다. 목록에 `C001`만 보이면 사용자는 "이게 무슨 공연이지?"라고 다시 찾아봐야 한다.

더 큰 문제는 언어다. 같은 공연이라도 한국어 화면에서는 "아이유 콘서트", 영어 화면에서는 "IU Concert"처럼 보이고 싶을 수 있다. 코드 자체를 언어별로 바꾸면 데이터가 깨진다. 그래서 코드는 마스터에 두고, 사람이 읽을 이름은 언어별 Text Table에 둔다.

### 무엇인가

[[Text Table]]은 마스터 테이블의 코드에 붙는 언어별 이름표 테이블이다. 공식 glossary 기준으로도 Text Table은 Foreign Key와 language key를 포함하고, Check Table의 각 행에 언어 의존 텍스트를 할당한다.

콘서트 모델에서는 이렇게 나눈다.

| 테이블 | 키 | 담는 것 |
| --- | --- | --- |
| `ZCONCERT` | `MANDT`, `CONCERT_ID` | 공연의 기본 정보: 장소, 정원, 사용 여부 |
| `ZCONCERT_T` | `MANDT`, `CONCERT_ID`, `SPRAS` | 공연명, 설명 같은 언어별 텍스트 |

`SPRAS`는 언어 키다. 같은 `CONCERT_ID = C001`이라도 `SPRAS = KO`이면 한국어 이름, `SPRAS = EN`이면 영어 이름을 담는다.

### 어떻게 확인하는가

SE11에서 Text Table 구조를 볼 때는 필드 수보다 키 구성을 먼저 본다.

1. 마스터 테이블의 키가 Text Table 키에 포함되어 있는가.
2. 추가 언어 키가 있는가.
3. Text Table이 마스터 테이블과 Foreign Key로 연결되어 있는가.
4. SE11에서 이 관계가 Text Table로 인식되는가.

그다음 F4나 표시 화면에서 코드 옆에 텍스트가 같이 보이는지 확인한다. 예를 들어 `C001`만 보이는 것이 아니라 `C001 - 아이유 콘서트`처럼 보여야 사용자가 선택할 수 있다.

### 체험 설계

"언어별 이름표 뷰어"는 세 칸으로 나눈다.

- 왼쪽: `ZCONCERT` 마스터.
  - `C001 / KSPO DOME / 15000`
  - `C002 / 잠실 / 12000`
- 가운데: `ZCONCERT_T` Text Table.
  - `C001 / KO / 아이유 콘서트`
  - `C001 / EN / IU Concert`
  - `C002 / KO / 김연아 아이스쇼`
  - `C002 / EN / Yuna Kim Ice Show`
- 오른쪽: F4 결과 목록.

상단에 `로그인 언어: KO / EN` 토글을 둔다. KO를 누르면 F4 목록의 이름이 한국어로, EN을 누르면 영어로 바뀐다. `SPRAS 누락` 버튼을 누르면 같은 코드의 텍스트가 하나로 덮이거나 언어별 표시가 불가능하다는 경고를 보여 준다.

### 실수와 주의

Text Table의 키에서 언어 키를 빠뜨리면 다국어 텍스트를 담을 수 없다. 단순히 `CONCERT_ID`와 `NAME`만 둔 테이블은 이름표 테이블일 수는 있지만, SAP DDIC가 기대하는 Text Table 구조로 보기 어렵다.

마스터 테이블에 이름을 직접 넣는 방식이 항상 틀린 것은 아니다. 다국어가 필요 없고 이름도 하나뿐인 작은 실습에서는 단순하게 둘 수 있다. 그러나 SAP 표준과 실무 모델에서는 코드와 언어별 텍스트를 분리하는 패턴을 자주 만난다.

### 정리

L03의 결론은 "코드는 마스터에, 사람이 읽을 이름은 Text Table에"이다. 이 구조를 알면 F4 목록에서 코드 옆에 이름이 붙는 이유와 로그인 언어에 따라 텍스트가 달라지는 이유를 이해할 수 있다.

---

## CH09-L04 - Elementary Search Help

### 왜 필요한가

Foreign Key만으로도 F4 목록이 생길 수 있다. 하지만 실무에서는 그 목록이 충분하지 않을 때가 많다. 사용자는 공연 ID만 보고 고르는 것이 아니라 아티스트, 장소, 공연명, 날짜 같은 단서를 보고 찾고 싶어 한다.

Elementary Search Help는 "F4 팝업을 어떻게 보여 줄 것인가"를 직접 설계하는 DDIC 객체다. 단일 테이블이나 뷰를 기준으로 검색 조건, 결과 목록, 반환 값을 정한다.

### 무엇인가

[[Search Help]]는 사용자가 입력값의 정확한 철자를 몰라도 관련 데이터로 값을 찾게 해 주는 입력 도움말이다. 가장 기본 형태가 Elementary Search Help다. 한 검색 도움말이 하나의 Selection Method를 기준으로 동작한다고 이해하면 된다.

Elementary Search Help의 핵심 요소는 네 가지다.

| 항목 | 의미 | 초급자 설명 |
| --- | --- | --- |
| Selection Method | 값을 가져올 테이블/뷰 | F4 목록의 원천 |
| Parameter | F4에 쓰일 필드 | 보여 주거나 검색하거나 돌려줄 값 |
| IMP | Import | 입력칸의 기존 값을 검색 조건으로 가져옴 |
| EXP | Export | 사용자가 고른 값을 입력칸으로 돌려줌 |
| LPos | List Position | 결과 목록에서 보이는 순서 |
| SPos | Selection Position | 검색 조건 영역에서 보이는 순서 |

### 어떻게 확인하는가

SE11에서 Elementary Search Help `ZSH_CONCERT`를 만든다고 가정한다.

- Selection Method: `ZCONCERT`
- Parameter:
  - `CONCERT_ID`: IMP, EXP, LPos 1, SPos 1
  - `ARTIST`: LPos 2, SPos 2
  - `VENUE`: LPos 3, SPos 3

F4에서 사용자가 `아이유`를 검색하면 목록에는 공연 ID, 아티스트, 장소가 보인다. 사용자가 한 행을 선택하면 EXP로 지정된 `CONCERT_ID`가 입력칸으로 돌아간다.

초급자는 여기서 "보여 주는 값"과 "돌려주는 값"을 구분해야 한다. 공연명과 장소를 보여 주더라도 실제 입력칸에 들어갈 값은 공연 ID일 수 있다.

### 체험 설계

"Elementary Search Help 빌더"는 사용자가 F4를 조립하는 화면이다.

- 1단계: Selection Method 선택.
  - 버튼: `ZCONCERT`, `ZCONCERT_T`, `잘못된 빈 테이블`.
- 2단계: Parameter 역할 선택.
  - 체크박스: `CONCERT_ID = EXP`, `ARTIST = 검색 조건`, `VENUE = 목록 표시`.
- 3단계: 위치 지정.
  - 드래그로 `CONCERT_ID`, `ARTIST`, `VENUE`의 LPos 순서를 바꾼다.
- 4단계: F4 미리보기.
  - 검색 조건 영역과 결과 목록을 실제 팝업처럼 보여 준다.

오류 케이스도 둔다. EXP를 하나도 체크하지 않으면 "선택해도 입력칸으로 돌아갈 값이 없습니다"라는 피드백을 띄운다. Selection Method가 비어 있으면 "목록의 원천이 없습니다"라고 표시한다.

### 실수와 주의

EXP를 빠뜨리면 사용자가 행을 선택해도 입력 필드로 값이 돌아오지 않는다. L04에서는 이 실수를 반드시 체험시킨다.

Selection Method가 너무 넓으면 사용자는 거대한 목록을 받는다. CH09에서는 성능 최적화까지 다루지 않지만, 검색 조건과 표시 컬럼을 사용자 업무에 맞게 설계해야 한다는 감각은 준다.

### 정리

L04의 결론은 "Elementary Search Help는 단일 소스 F4 팝업 설계도"이다. 사용자가 무엇으로 찾고, 무엇을 보고, 무엇을 입력칸에 돌려받을지 명확히 정하는 것이 핵심이다.

---

## CH09-L05 - Collective Search Help 기초

### 왜 필요한가

하나의 검색 방식만으로는 부족할 때가 있다. 공연을 찾는 사용자는 공연 ID를 알고 있을 수도 있고, 아티스트 이름만 기억할 수도 있고, 장소만 알고 있을 수도 있다. 이때 모든 조건을 한 Elementary Search Help에 억지로 넣으면 화면이 복잡해진다.

Collective Search Help는 여러 Elementary Search Help를 하나의 F4 안에 탭처럼 묶는 방식이다. 사용자는 "ID로 검색", "아티스트로 검색", "장소로 검색" 중 자기 상황에 맞는 탭을 고른다.

### 무엇인가

[[Collective Search Help]]는 여러 Elementary Search Help를 포함하는 상위 Search Help다. 각 Elementary는 자기 검색 방식과 목록을 갖고, Collective는 이들을 하나의 F4 경험으로 묶는다.

예시는 다음과 같다.

```text
ZSH_CONCERT_ALL
  ZSH_CONCERT_BY_ID
  ZSH_CONCERT_BY_ARTIST
  ZSH_CONCERT_BY_VENUE
```

여기서 중요한 것은 포함만이 아니다. Collective의 parameter와 각 Elementary의 parameter가 서로 대응되어야 한다. 그래야 어느 탭에서 골라도 최종적으로 같은 입력칸에 `CONCERT_ID`가 돌아온다.

### 어떻게 확인하는가

SE11에서 Collective Search Help를 열고 다음을 확인한다.

- 포함된 Elementary Search Help가 목적별로 나뉘어 있는가.
- 각 Elementary의 반환 parameter가 Collective의 반환 parameter와 연결되어 있는가.
- 탭 이름이 사용자가 이해할 수 있는 업무 언어인가.
- 같은 입력 필드에 어느 탭에서 선택하든 동일한 값이 돌아오는가.

초급자에게는 "Collective는 검색 도움말 여러 개를 모아 놓은 폴더"라고 설명할 수 있다. 다만 폴더 안 파일들이 같은 출력 규칙을 공유해야 제대로 동작한다.

### 체험 설계

"Collective Search Help 탭 시뮬레이터"는 실제 F4 팝업을 세 탭으로 보여 준다.

- 탭 1: `공연 ID로 검색`.
  - 검색 조건: `CONCERT_ID`.
  - 결과: ID, 공연명.
- 탭 2: `아티스트로 검색`.
  - 검색 조건: `ARTIST`.
  - 결과: ID, 아티스트, 공연명.
- 탭 3: `장소로 검색`.
  - 검색 조건: `VENUE`.
  - 결과: ID, 장소, 공연명.

각 탭에서 어떤 행을 선택해도 오른쪽 입력칸에는 `CONCERT_ID`만 돌아온다. `parameter 매핑 끊기` 버튼을 누르면 탭은 열리지만 선택값이 입력칸으로 돌아오지 않는 실패 상태를 보여 준다.

### 실수와 주의

검색 방식이 하나뿐이면 Collective는 과설계다. Elementary 하나로 충분한데 Collective를 만들면 관리할 객체만 늘어난다.

반대로 검색 방식이 여러 개인데 하나의 Elementary에 모든 조건을 밀어 넣으면 초급 사용자는 어떤 조건을 써야 할지 모른다. Collective는 사용자의 찾는 방식을 분리해 주는 UI 설계이기도 하다.

### 정리

L05의 결론은 "검색 방식이 여러 개면 Collective로 탭을 나눈다"이다. 핵심은 여러 Elementary를 포함하는 것과 parameter 대응을 정확히 맞추는 것이다.

---

## CH09-L06 - PARAMETERS와 DDIC F4 Help 연결

### 왜 필요한가

CH09-L04와 L05에서 Search Help를 만들었다. 그런데 학습자는 곧 묻는다.

"그걸 만들면 내 프로그램 입력칸에는 어떻게 뜨나요?"

ABAP의 `PARAMETERS` 입력칸은 타입을 어떻게 주느냐에 따라 DDIC의 라벨, F1, F4, 값 검증을 이어받을 수 있다. CH03에서 Data Element를 배우며 "라벨과 의미를 담는다"고 했던 이유가 여기서 보상으로 돌아온다.

### 무엇인가

[[PARAMETERS]]는 실행 시 선택화면에 입력 필드 한 칸을 만드는 문장이다. 이 입력 필드의 타입을 [[Data Element]]로 주면, Data Element와 Domain, 연결된 Search Help의 의미 정보가 화면으로 이어질 수 있다.

기본형은 다음과 같다.

```abap
PARAMETERS p_con TYPE zcon_de_concert_id.
```

여기서 `zcon_de_concert_id`가 Search Help나 Domain fixed values, Foreign Key 기반 정보를 갖고 있으면 F4에 반영될 수 있다.

특정 Search Help를 이 입력칸에 직접 못 박고 싶으면 `MATCHCODE OBJECT`를 쓴다.

```abap
PARAMETERS p_con TYPE zcon_de_concert_id
  MATCHCODE OBJECT zsh_concert_all.
```

공식 문서 기준으로 `MATCHCODE OBJECT`는 selection parameter의 입력 필드를 ABAP Dictionary의 Search Help와 연결한다. 이름에 matchcode가 남아 있는 이유는 Search Help의 전신이 Matchcode Object였기 때문이다.

### 어떻게 확인하는가

확인은 세 단계로 한다.

1. `PARAMETERS p_con TYPE zcon_de_concert_id.`처럼 Data Element를 통해 타입을 주었는가.
2. 그 Data Element 또는 관련 필드에 Search Help가 연결되어 있는가.
3. 선택화면에서 F4를 눌렀을 때 기대한 목록이 뜨는가.

만약 표준 타입으로만 `PARAMETERS p_con TYPE c LENGTH 10.`처럼 만들면 Dictionary 의미 정보가 거의 없다. 화면은 입력칸을 만들 수 있지만, 업무적으로 어떤 값을 골라야 하는지 도와주지 못한다.

### 부착 지점의 차이

Search Help는 어디에 붙이느냐에 따라 영향 범위가 달라진다.

| 부착 지점 | 영향 범위 | 언제 적합한가 |
| --- | --- | --- |
| Data Element | 그 Data Element를 쓰는 많은 필드 | 같은 의미의 값에 공통 F4를 주고 싶을 때 |
| 테이블 필드 | 해당 필드 중심 | 같은 Domain이라도 이 필드만 다른 도움말이 필요할 때 |
| Structure 컴포넌트 | 그 구조를 쓰는 화면 필드 | 화면/구조 맥락이 중요할 때 |
| `MATCHCODE OBJECT` | 그 프로그램 입력칸 하나 | 이번 입력칸만 명시적으로 고정하고 싶을 때 |

### 체험 설계

"F4 부착 범위 보드"는 같은 입력칸 `p_con`을 네 방식으로 만든다.

- `Data Element 부착` 버튼: 같은 DE를 쓰는 `p_con`, `p_ref_con` 둘 다 같은 F4를 받는다.
- `테이블 필드 부착` 버튼: `ZBOOKING-CONCERT_ID` 기반 화면에서만 F4가 바뀐다.
- `Structure 컴포넌트 부착` 버튼: 특정 구조를 쓰는 화면 필드에만 적용된다.
- `MATCHCODE OBJECT` 버튼: `p_con` 하나만 `ZSH_CONCERT_ALL`로 고정된다.

결과 영역에는 "영향을 받는 입력칸"을 초록색으로 표시한다. 넓게 붙일수록 여러 칸이 동시에 바뀌고, 좁게 붙일수록 해당 칸만 바뀐다.

### 실수와 주의

F4가 안 뜰 때는 먼저 타입을 확인한다. Built-in 타입으로 직접 선언하면 DDIC 의미 정보가 따라오지 않을 수 있다. 가능하면 업무 의미가 담긴 Data Element를 사용한다.

여러 곳에 Search Help를 겹쳐 붙이면 어느 것이 뜨는지 헷갈릴 수 있다. 이 문제는 다음 L07에서 우선순위로 정리한다.

### 정리

L06의 결론은 "DDIC에 붙인 의미는 Data Element와 부착 지점을 통해 화면으로 흘러온다"이다. F4는 코드 한 줄의 문제가 아니라, Dictionary 설계와 화면 입력칸의 연결 문제다.

---

## CH09-L07 - Input Help 호출 우선순위

### 왜 필요한가

한 입력칸에 도움말 후보가 여러 개 걸려 있으면 사용자는 F4를 한 번만 누른다. 그러면 SAP은 무엇을 띄울까? 모든 후보를 한꺼번에 보여 주는 것이 아니라, 정해진 우선순위에 따라 하나를 고른다.

이 우선순위를 모르면 "왜 내가 붙인 Search Help가 안 뜨지?" 같은 문제를 해결할 수 없다. L07은 F4 문제를 디버깅하는 지도다.

### 무엇인가

CH09에서는 우선순위를 다음 사다리로 설명한다.

1. 코드로 직접 만든 F4: 선택화면과 Dynpro 이벤트에서 직접 만드는 도움말. CH15/CH16에서 정식으로 배운다. 지금은 존재만 안다.
2. Search Help: Data Element, 필드, 구조, `MATCHCODE OBJECT` 등에 연결된 설계형 도움말.
3. Check Table, Text Table, Domain fixed values: DDIC 관계와 값 목록에서 자동으로 나오는 도움말.
4. 타입 기본 도움: 날짜의 달력, 시간의 시계, 숫자형 보조 등 타입이 제공하는 기본 도움.

기억할 문장은 "위가 있으면 아래는 안 본다"이다. 직접 F4가 있으면 Dictionary Search Help보다 우선할 수 있고, 명시 Search Help가 있으면 더 아래 자동 목록은 보이지 않을 수 있다.

### 어떻게 확인하는가

기존 embed `embeds/abap/CH09-L07-S01.html`을 사용한다. 학습자는 사다리를 위에서 아래로 읽고, 각 단계가 없을 때만 다음 단계로 내려간다는 점을 확인한다.

추가로 다음 상황 카드를 붙인다.

- 카드 A: `MATCHCODE OBJECT`가 지정된 `PARAMETERS`.
  - 예상: 지정한 Search Help가 뜬다.
- 카드 B: Search Help는 없고 Foreign Key만 있는 필드.
  - 예상: Check Table 기반 목록이 뜬다.
- 카드 C: 아무 DDIC 도움말이 없는 날짜 필드.
  - 예상: 타입 기본 달력이 뜬다.
- 카드 D: 직접 F4 이벤트가 있는 화면.
  - 예상: 직접 만든 F4가 최우선이다. 단 CH09에서는 코드 분석하지 않는다.

### 체험 설계

"우선순위 토글 실험"을 기존 사다리 아래에 붙인다.

- 토글: `직접 F4 있음`, `Search Help 있음`, `Check Table 있음`, `Fixed Values 있음`, `타입 기본 도움 있음`.
- 실행 버튼: `F4 누르기`.
- 결과: 가장 높은 우선순위 하나만 팝업으로 표시.

예를 들어 `Search Help 있음`과 `Check Table 있음`이 모두 켜져 있으면 결과는 Search Help다. 사용자가 `Search Help 있음`을 끄면 그제서야 Check Table 목록이 뜬다.

상태 메시지는 이렇게 쓴다.

- "2단계 Search Help가 존재하므로 3단계 Check Table은 평가하지 않습니다."
- "상위 도움말이 없어서 타입 기본 도움으로 내려왔습니다."

### 실수와 주의

우선순위를 모르고 여러 도움말을 겹쳐 붙이면, 사용자는 의도와 다른 목록을 보게 된다. 넓게 공유되는 Data Element에 Search Help를 붙이면 여러 화면이 동시에 영향을 받을 수 있으므로 영향 범위를 확인해야 한다.

`PROCESS ON VALUE-REQUEST`나 selection screen의 value-request 이벤트는 강력하지만, CH09에서 구현하지 않는다. 지금은 "사다리의 맨 위에 직접 만든 F4가 있다"는 사실만 기억한다.

### 정리

L07의 결론은 "F4는 여러 후보 중 우선순위가 가장 높은 하나만 보여 준다"이다. F4가 예상과 다르면 사다리를 위에서부터 점검하면 된다.

---

## CH09-L08 - DDIC 검증과 프로그램 검증의 역할 분리

### 왜 필요한가

Foreign Key, fixed values, Search Help를 배우면 초급자는 DDIC가 모든 입력 문제를 해결한다고 생각하기 쉽다. 하지만 실무 규칙은 더 복잡하다.

공연 ID가 존재하는지는 DDIC가 잘 도와줄 수 있다. 하지만 "이미 매진된 회차는 예매할 수 없다", "정훈영은 한 번에 4석까지만 예매할 수 있다", "관리자만 취소할 수 있다" 같은 규칙은 DDIC 관계만으로 표현하기 어렵다. 이런 규칙은 프로그램 로직이 책임져야 한다.

### 무엇인가

검증 책임은 두 계층으로 나눈다.

| 검증 종류 | 주 담당 | 예 |
| --- | --- | --- |
| 존재와 형식 | DDIC | 공연 ID가 마스터에 존재하는가, 상태 코드가 고정값 중 하나인가 |
| 업무 규칙 | 프로그램 | 잔여석이 충분한가, 상태 전이가 허용되는가, 사용자 권한이 있는가 |

공식 문서의 Foreign Key dependency 설명도 이 경계를 뒷받침한다. Foreign Key는 input check와 input help에서 평가되지만, ABAP 언어 처리나 SQL 처리 자체에서 자동으로 평가되는 것은 아니다.

### 어떻게 확인하는가

존재 검증은 DDIC로 확인한다. `ZBOOKING-CONCERT_ID`에 Foreign Key가 있고, 유지보수 화면에서 없는 공연 ID를 넣었을 때 거부되면 DDIC 검증이 작동한 것이다.

업무 규칙은 프로그램에서 확인한다. 예를 들어 선택된 공연 ID가 실제로 존재하는지 읽어 보고, 없으면 다음 처리를 하지 않는 식이다. CH09에서는 읽기 전용 확인만 보여 준다.

```abap
REPORT zch09_l08_check_concert.

PARAMETERS p_con TYPE zcon_de_concert_id.

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

이 코드는 "DDIC를 대체하자"는 뜻이 아니다. 프로그램 흐름 안에서도 필요할 때는 읽기 확인을 해야 한다는 감각을 주기 위한 예다. 실제 업무 검증 구조, 오류 메시지의 정식 처리, 화면 이벤트 검증은 CH15 이후에 더 정교하게 배운다.

### 체험 설계

"검증 책임 라우터"는 상황 카드를 DDIC와 프로그램 두 바구니로 끌어다 놓는 활동이다.

- 카드: "공연 ID가 존재하는가" -> DDIC.
- 카드: "상태 코드가 O 또는 C인가" -> DDIC.
- 카드: "잔여석보다 많이 신청했는가" -> 프로그램.
- 카드: "예매자가 취소 권한이 있는가" -> 프로그램.
- 카드: "이미 종료된 공연인가" -> 프로그램.

두 번째 탭은 실행 흐름 비교다.

- `화면 입력` 버튼: DDIC Foreign Key 검증이 먼저 작동하는 그림을 보여 준다.
- `프로그램 처리` 버튼: 프로그램이 필요한 업무 규칙을 직접 확인하는 그림을 보여 준다.
- `책임 혼동` 버튼: 모든 것을 코드로만 검사하거나, 모든 것을 DDIC에 맡기는 두 실패 사례를 보여 준다.

### 실수와 주의

모든 검증을 코드로만 만들면 DDIC가 제공하는 재사용성과 일관성을 버리는 것이다. 같은 필드를 쓰는 여러 화면에서 검증이 제각각이 된다.

반대로 DDIC만 믿고 업무 규칙을 생략하면 실제 업무 흐름을 막지 못한다. DDIC는 값의 존재와 형식에는 강하지만, 상황에 따라 달라지는 업무 판단은 프로그램이 담당해야 한다.

### 정리

L08의 결론은 "DDIC는 존재와 형식, 프로그램은 업무 규칙"이다. 이 책임 분리를 알면 SAP 개발에서 같은 검증을 어디에 둘지 판단할 수 있다.

---

## CH09-L09 - 실습: 콘서트 모델 만들기(DDIC)

### 왜 필요한가

CH09의 개념을 머리로만 이해하면 오래가지 않는다. 이제 하나의 작은 업무 모델을 직접 만든다. 이 실습에서 만든 `ZCONCERT`, `ZPERF`, `ZBOOKING`은 이후 CH10의 모듈화, CH11의 ALV 표시, CH15의 선택화면 검증, CH23의 RAP 흐름으로 이어지는 관통 예제의 토대가 된다.

L09의 목표는 "내가 만든 테이블이 서로 관계를 맺고, F4로 값을 고르게 되는 경험"을 완성하는 것이다.

### 무엇인가

콘서트 예매 모델은 세 테이블로 시작한다.

| 테이블 | 역할 | 키 | 주요 필드 |
| --- | --- | --- | --- |
| `ZCONCERT` | 공연 마스터 | `MANDT`, `CONCERT_ID` | `ARTIST`, `VENUE`, `CAPACITY` |
| `ZPERF` | 공연 회차 | `MANDT`, `CONCERT_ID`, `PERF_NO` | `PERF_DATE`, `PERF_TIME` |
| `ZBOOKING` | 예매 | `MANDT`, `BOOKING_ID` | `CONCERT_ID`, `PERF_NO`, `CUSTOMER`, `SEATS`, `STATUS` |

`ZCONCERT`는 공연 자체를 담고, `ZPERF`는 공연의 날짜별 회차를 담고, `ZBOOKING`은 누가 어떤 회차를 몇 석 예매했는지 담는다. 예매자 예제 이름은 이름 풀 기준 첫 번째인 정훈영을 사용한다.

### 어떻게 확인하는가

실습 순서는 다음과 같다.

1. Domain과 Data Element를 만든다.
   - 공연 ID, 회차 번호, 예매 ID, 상태, 좌석 수의 의미를 나눈다.
   - 상태 Domain에는 필요한 경우 fixed values를 둔다.
2. `ZCONCERT`를 만든다.
   - 공연 ID, 아티스트, 장소, 정원을 정의하고 활성화한다.
3. `ZPERF`를 만든다.
   - 공연 ID와 회차 번호를 키로 잡고, 공연 날짜와 시간을 둔다.
4. `ZBOOKING`을 만든다.
   - 예매 ID를 키로 잡고, 공연 ID, 회차 번호, 예매자, 좌석 수, 상태를 둔다.
5. Foreign Key를 만든다.
   - `ZBOOKING-CONCERT_ID`가 `ZCONCERT-CONCERT_ID`를 참조하게 한다.
   - 가능하면 `ZPERF`도 `ZCONCERT`와 연결해 공연 없는 회차가 생기지 않게 한다.
6. Search Help `ZSH_CONCERT`를 만든다.
   - Selection Method는 `ZCONCERT`.
   - 공연 ID, 아티스트, 장소를 목록에 보여 준다.
   - 공연 ID를 EXP로 돌려준다.
7. 테스트 데이터를 넣고 확인한다.
   - 공연 2개, 회차 3개, 예매 3건을 만든다.
   - 예매자 중 하나는 정훈영으로 한다.
   - 없는 공연 ID를 입력해 보고 거부되는지 확인한다.
   - F4를 눌러 공연 목록이 뜨는지 확인한다.

### 체험 설계

"콘서트 모델 제작 체크리스트"는 실습 단계를 상태판으로 보여 준다.

- 단계 카드: Domain, Data Element, `ZCONCERT`, `ZPERF`, `ZBOOKING`, Foreign Key, Search Help, 테스트 데이터.
- 각 카드 상태: `미작성`, `작성`, `활성화`, `검증 완료`.
- 오른쪽 미리보기: 현재까지 만든 객체 관계도.
- 하단 테스트 버튼:
  - `정상 공연 ID 입력`: 통과.
  - `없는 공연 ID 입력`: 거부.
  - `F4 누르기`: 공연 ID, 아티스트, 장소 목록 표시.
  - `정훈영 예매 확인`: 예매 테이블에서 정훈영 행 강조.

실패 피드백은 구체적으로 둔다.

- Foreign Key 미활성화: "관계가 선언되지 않아 없는 공연 ID를 막지 못합니다."
- Search Help EXP 누락: "목록은 뜨지만 선택값이 입력칸으로 돌아가지 않습니다."
- Data Element 미사용: "라벨과 F4 의미 정보가 재사용되지 않습니다."

### 실수와 주의

활성화를 빼먹으면 객체가 만들어진 것처럼 보여도 실제 화면에서 동작하지 않는다. 테이블, Foreign Key, Search Help를 만든 뒤에는 반드시 활성화 상태를 확인한다.

필드 타입을 Built-in 타입으로만 만들면 라벨, fixed values, Search Help 같은 의미 정보가 이어지지 않는다. 실습에서는 가능한 한 Data Element를 사용해 "타입 + 의미 + 화면 도움"이 함께 흐르는 구조를 만든다.

`ZPERF`와 `ZBOOKING`의 관계는 공연 ID뿐 아니라 회차 번호까지 고려해야 한다. 초급 실습에서는 공연 ID Foreign Key부터 안정적으로 만들고, 회차 관계는 심화 과제로 둔다.

### 정리

L09의 결론은 "DDIC 관계와 F4는 실제 업무 모델에서 함께 완성된다"이다. 이 실습을 끝내면 학습자는 단순 테이블 생성자가 아니라, 올바른 값을 고르게 하는 데이터 모델의 첫 설계자가 된다.

---

## CH09 마무리 학습 흐름

CH09를 마친 학습자는 다음 질문에 답할 수 있어야 한다.

- Foreign Key와 Check Table은 어떤 관계인가.
- Value Table만으로 입력 검증이 완성되지 않는 이유는 무엇인가.
- Text Table의 키에 언어가 들어가는 이유는 무엇인가.
- Elementary Search Help에서 Selection Method, IMP, EXP, LPos, SPos는 각각 무엇을 담당하는가.
- Collective Search Help가 필요한 상황은 언제인가.
- Data Element에 붙인 Search Help와 `MATCHCODE OBJECT`의 영향 범위는 어떻게 다른가.
- F4 후보가 여러 개일 때 어떤 우선순위로 하나가 선택되는가.
- DDIC가 맡을 검증과 프로그램이 맡을 검증은 어떻게 나누는가.
- 콘서트 예매 모델에서 `ZCONCERT`, `ZPERF`, `ZBOOKING`은 어떤 역할을 나누는가.

최종 과제는 다음 기준으로 채점한다.

1. `ZBOOKING-CONCERT_ID`가 `ZCONCERT`를 참조하는 Foreign Key를 갖는다.
2. 없는 공연 ID가 유지보수/입력 화면에서 거부된다.
3. F4를 누르면 공연 ID만이 아니라 사용자가 고를 수 있는 설명 컬럼이 함께 보인다.
4. Search Help에서 반환되는 값이 실제 입력칸에 들어갈 key 값이다.
5. 학습자가 "Value Table은 제안, Foreign Key는 실제 관계"를 말로 설명할 수 있다.

이 과제를 통과하면 CH10에서 잔여석 계산과 예매 판정 로직을 모듈화할 준비가 된다.
