# CH07_REWRITE - Transparent Table in SE11

> 기준 소스: `content/abap/CH07/_chapter.md`, `content/abap/CH07/CH07-L01.md` ~ `CH07-L03.md`
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 기존 `reference/codex_0625` 진단
> 공식 문서 확인: `C:\ABAP_DOCU_HTML`의 DDIC database table, transparent table, client dependency, key fields, delivery class, technical settings, data class, size category, activation, table maintenance 항목을 수동 확인

## 챕터 설계

CH06에서 학습자는 구구단 81행을 `lt_gugu`라는 Internal Table에 담았다. 그러나 Internal Table은 프로그램 메모리에만 존재한다. 프로그램이 끝나면 행도 사라진다. 다시 실행하면 처음부터 다시 만들어야 한다.

CH07의 목표는 "값이 사라지는 문제"를 해결하는 것이다. 메모리의 임시 표가 아니라 DB에 남는 Transparent Table을 만든다. 단, 이 장은 DB 프로그래밍 장이 아니다. 프로그램으로 `INSERT`, `UPDATE`, `DELETE`, `COMMIT`하는 DML은 CH24에서 다룬다. CH07에서는 SE11에서 테이블을 정의하고, 소량 데이터를 수동으로 넣고, 메모리 객체와 영속 테이블의 차이를 정리한다.

이 장의 학습 흐름은 다음과 같다.

1. `ZGUGUDAN` Transparent Table을 설계한다.
2. `MANDT`, key, Data Element, built-in type, delivery class, technical settings를 입문자 수준으로 이해한다.
3. SE11 Create Entries로 2단과 3단 18행을 직접 입력한다.
4. Table Contents로 저장된 데이터를 확인한다.
5. Structure, Internal Table, Transparent Table의 차이를 한 번에 정리한다.

R15 경계는 중요하다. CH07에서는 Open SQL `SELECT`를 쓰지 않는다. CH08에서 조회한다. 또한 프로그램 DML도 쓰지 않는다. CH24에서 다룬다. SE16N도 CH14 뒤로 밀려 있으므로 여기서는 SE11의 Create Entries와 Table Contents만 사용한다.

## CH07-L01 - Transparent Table 생성: SE11

### 왜 필요한가

CH06의 구구단 Internal Table은 프로그램이 실행되는 동안에는 강력했다. 81행을 모아 정렬하고 출력할 수 있었다.

```text
lt_gugu
  2 x 1 = 2
  2 x 2 = 4
  ...
  9 x 9 = 81
```

하지만 프로그램을 종료하면 `lt_gugu`는 사라진다. 이것은 버그가 아니다. Internal Table의 본래 수명이 실행 중 메모리이기 때문이다.

업무 데이터는 대부분 사라지면 안 된다. 주문, 고객, 자재, 예약, 정산 결과는 프로그램이 끝나도 남아야 하고, 다른 사용자가 다시 조회할 수 있어야 한다. 이런 데이터를 저장하는 곳이 Database Table이고, ABAP Dictionary에서 정의하는 대표적인 DB 테이블이 Transparent Table이다.

### 무엇인가

Transparent Table은 ABAP Dictionary에 정의하는 DDIC database table이다. 공식 문서 기준으로 DDIC database table은 현재 standard database의 물리 database table을 ABAP Dictionary에서 설명하는 객체다. 행과 열을 가진 2차원 matrix이며, table key가 각 행을 유일하게 식별한다.

Transparent Table의 핵심은 다음이다.

| 항목 | 설명 |
|---|---|
| DDIC 정의 | SE11에서 테이블 이름, 필드, key, 기술 설정을 정의 |
| DB 물리 테이블 | 활성화 후 database에 실제 테이블이 생성됨 |
| 영속성 | 프로그램이 끝나도 데이터가 남음 |
| 공유 | 다른 프로그램과 사용자가 같은 저장 데이터를 조회 가능 |

공식 glossary에서 transparent table은 ABAP Dictionary 정의와 같은 이름, 같은 column을 가진 DB instance가 있는 table category로 설명된다. 입문자에게는 "DDIC 설계도와 DB 실제 테이블이 1:1로 대응되는 테이블"로 이해하면 된다.

### ZGUGUDAN 설계

구구단을 저장할 테이블 이름은 `ZGUGUDAN`으로 둔다. 고객 개발 객체는 보통 `Z` 또는 `Y`로 시작한다.

필드 설계는 다음처럼 잡는다.

| Field | Key | Type 예 | 의미 |
|---|---|---|---|
| `MANDT` | Key | `MANDT` 또는 CLNT 기반 Data Element | Client |
| `DAN` | Key | `ZDE_DAN` 또는 INT4 | 단 |
| `MUL` | Key | `ZDE_MUL` 또는 INT4 | 곱하는 수 |
| `RESULT` |  | `ZDE_RESULT` 또는 INT4 | 결과 |

키는 행을 유일하게 식별하는 필드 조합이다. `DAN = 2`, `MUL = 3`인 행은 2단 3번째 줄 하나다. 여기에 client 분리용 `MANDT`까지 포함해 `MANDT + DAN + MUL`을 key로 잡는다.

공식 문서 기준으로 key field는 table structure의 시작 부분에 모여 있어야 한다. 즉 key 필드 사이에 non-key 필드가 끼면 안 된다.

### MANDT와 Client

`MANDT`는 client를 나타내는 필드다. 공식 문서 기준으로 DDIC database table의 첫 column이 built-in type `CLNT`인 key field이면 client-dependent table이다.

입문자는 client를 "같은 SAP 시스템 안의 분리된 방"으로 이해하면 된다. 같은 테이블 이름이라도 client 100과 client 200의 데이터는 분리될 수 있다. 그래서 교육 시스템에서 다른 client로 로그인하면 방금 넣은 데이터가 보이지 않을 수 있다.

일반 업무 테이블은 보통 client-dependent로 설계한다. 따라서 첫 key 필드에 `MANDT`를 둔다.

### Data Element vs Built-In Type

필드 타입은 두 방식으로 줄 수 있다.

| 방식 | 장점 | 단점 |
|---|---|---|
| Data Element | 라벨, 문서, F4/input help 연결 가능 | 먼저 DDIC 객체가 필요 |
| Built-In Type 직접 | 빠르게 만들 수 있음 | 의미/라벨/도움말이 약함 |

입문 실습에서는 `INT4` 같은 built-in type으로 빠르게 만들 수 있다. 하지만 업무 테이블에서는 Data Element가 권장된다. CH03에서 배운 것처럼 Data Element는 기술 타입뿐 아니라 의미와 라벨을 제공한다. 테이블 필드는 단순 저장 칸이 아니라 업무 의미를 가진 column이므로 Data Element를 쓰는 편이 유지보수에 좋다.

### Delivery Class와 Technical Settings

Delivery Class는 테이블 데이터가 설치, 업그레이드, client copy, transport에서 어떻게 취급되는지에 영향을 준다. 공식 문서 기준으로 delivery class `A`는 master data와 transaction data용 application table이다. 구구단 실습 테이블은 보통 application data 성격이므로 `A`로 둔다.

Technical Settings에서는 DB 저장과 관련된 기술 정보를 정한다.

| 설정 | 입문자 설명 |
|---|---|
| Data Class | 테이블 데이터 성격. 예: 마스터 데이터, 트랜잭션 데이터 |
| Size Category | 예상 행 수 규모에 대한 힌트 |
| Storage Type | HANA 등 DB 플랫폼에서 저장 방식에 영향을 줄 수 있는 설정 |

입문 실습에서는 기본값 또는 교육 시스템 안내값을 따른다. 중요한 것은 "활성화 전에 기술 설정이 필요할 수 있다"는 사실과 "이미 데이터가 들어간 운영 테이블의 구조 변경은 위험하다"는 감각이다.

### SE11 생성 절차

절차는 다음과 같다.

1. `SE11` 실행
2. Database Table 선택
3. `ZGUGUDAN` 입력
4. Create
5. Short Description 입력
6. Delivery Class 선택
7. Fields 탭에서 필드 입력
8. `MANDT`, `DAN`, `MUL`을 key로 지정
9. 각 필드 타입 지정
10. Technical Settings 유지보수
11. Check
12. Activate

활성화가 끝나면 DDIC runtime object가 만들어지고, DB에도 테이블이 생성된다. 공식 문서의 DDIC activation 설명도 활성화 시 소비자가 사용할 수 있는 runtime object가 만들어진다고 설명한다.

### 어떻게 확인하는가

다음을 확인한다.

| 확인 위치 | 확인 내용 |
|---|---|
| SE11 Fields | `MANDT`, `DAN`, `MUL`, `RESULT`가 있는지 |
| Key checkbox | `MANDT`, `DAN`, `MUL`이 key인지 |
| Field order | key 필드가 앞에 모여 있는지 |
| Delivery Class | `A` 또는 교육 시스템 안내값인지 |
| Technical Settings | 유지보수 후 저장됐는지 |
| Activation log | 오류 없이 active 상태인지 |

가장 중요한 확인은 active 상태다. 저장만 하고 활성화하지 않으면 실제 사용 가능한 테이블이 아니다.

### 실수와 주의

첫 번째 실수는 key를 지정하지 않는 것이다. DB 테이블은 행을 식별할 기준이 필요하다. 공식 문서도 적어도 하나의 key field가 필요하다고 설명한다.

두 번째 실수는 `MANDT`를 빼고 client-dependent 업무 테이블을 만들려는 것이다. 교육 시스템에서는 대부분 업무 테이블 첫 필드에 `MANDT`를 둔다.

세 번째 실수는 모든 필드를 built-in type으로 빠르게 만들고 끝내는 것이다. 실습은 가능하지만 업무 테이블에서는 라벨과 의미 재사용을 위해 Data Element를 우선 고려한다.

네 번째 실수는 활성화 후 필드 타입과 길이를 가볍게 바꾸는 것이다. 이미 데이터가 들어간 테이블의 구조 변경은 데이터 변환, 잠금, 이송, 운영 장애와 연결될 수 있다. 운영 변경은 CH35의 품질/이송 관리와 함께 다룬다.

다섯 번째 실수는 CH07에서 프로그램으로 DB에 넣으려는 것이다. 프로그램 DML은 아직 배우지 않았다. 지금은 SE11 수동 입력까지만 한다.

### 체험 설계

L01에는 "SE11 Table Builder 시뮬레이터"가 적합하다.

| 요소 | 설계 |
|---|---|
| 입력 | 테이블 이름, short description, delivery class, 필드 목록 |
| 버튼 | `필드 추가`, `Key 지정`, `Technical Settings`, `Check`, `Activate`, `Where-Used 보기` |
| 상태 | 신규, 필드 누락, key 누락, 기술 설정 필요, 검사 통과, 활성화 완료 |
| 데이터 | `ZGUGUDAN`, field list, key list, data element/built-in 선택 |
| 피드백 | key 미지정 시 "행을 유일하게 식별할 기준이 없음" |

시각화는 DDIC 설계도와 DB 물리 테이블을 나란히 보여 주면 좋다. 활성화 전에는 DB 쪽이 회색이고, `Activate` 버튼 후 DB 테이블이 생성된 것처럼 표시한다.

### 정리

Transparent Table은 ABAP Dictionary에서 정의하고 DB에 실제로 생성되는 영속 테이블이다. `MANDT`, key, field type, delivery class, technical settings, activation을 이해해야 한다. CH07에서는 테이블을 만들고 수동으로 데이터를 넣는 데 집중한다. 프로그램으로 DB를 변경하는 DML은 뒤에서 다룬다.

## CH07-L02 - Create Entries로 구구단 입력과 데이터 조회

### 왜 필요한가

`ZGUGUDAN`이라는 그릇을 만들었다. 하지만 빈 테이블은 조회해도 아무것도 나오지 않는다. CH07에서는 프로그램 DML을 쓰지 않으므로, SE11의 Create Entries 기능으로 소량 데이터를 직접 넣는다.

이 실습은 일부러 손으로 한다. 손으로 18행만 넣어 봐도 "테이블에 행을 만든다", "key 중복이 막힌다", "client가 다르면 안 보일 수 있다", "대량 입력은 손으로 하기 힘들다"는 감각을 얻을 수 있다.

### 무엇인가

Create Entries는 SE11에서 테이블 데이터를 직접 입력하는 도구다. 교육용 소량 데이터 확인에 적합하다.

이번 실습에서는 2단과 3단만 넣는다.

| DAN | MUL | RESULT |
|---:|---:|---:|
| 2 | 1 | 2 |
| 2 | 2 | 4 |
| 2 | 3 | 6 |
| ... | ... | ... |
| 2 | 9 | 18 |
| 3 | 1 | 3 |
| ... | ... | ... |
| 3 | 9 | 27 |

총 18행이다. CH06에서 프로그램으로 81행을 만들었던 것과 비교하면 손입력은 금방 번거로워진다. 그래서 소량 검증은 수동으로, 대량 생성과 변경은 나중에 프로그램 DML로 배운다.

### 입력 절차

절차는 다음과 같다.

1. `SE11` 실행
2. Database Table에 `ZGUGUDAN` 입력
3. Display
4. 메뉴 `Utilities -> Table Contents -> Create Entries`
5. `DAN`, `MUL`, `RESULT` 입력
6. Save
7. 다음 행 반복 입력

`MANDT`는 시스템이 현재 client를 채우거나 화면 설정에 따라 보일 수 있다. 교육 시스템 안내를 따른다.

조회 절차는 다음과 같다.

1. `SE11`에서 `ZGUGUDAN` 표시
2. `Utilities -> Table Contents -> Display`
3. 조건 입력 화면에서 `DAN = 2` 같은 조건 지정
4. Execute
5. 입력한 행이 보이는지 확인

### 어떻게 확인하는가

확인 포인트는 다음이다.

| 확인 | 기대 |
|---|---|
| 2단 9행 입력 | `DAN = 2` 조건 조회 시 9행 |
| 3단 9행 입력 | `DAN = 3` 조건 조회 시 9행 |
| 전체 조회 | 총 18행 |
| 같은 `DAN`, `MUL` 재입력 | key 중복으로 저장 불가 |
| 다른 client 로그인 | 데이터가 안 보일 수 있음 |

키 중복 실험은 학습에 좋다. `DAN = 2`, `MUL = 1`을 이미 넣은 뒤 같은 값을 다시 넣어 저장하면, key가 같은 행을 두 번 만들 수 없다는 사실을 확인한다.

### 실수와 주의

첫 번째 실수는 테이블이 active가 아닌 상태에서 입력하려는 것이다. 먼저 CH07-L01의 활성화 상태를 확인한다.

두 번째 실수는 client를 혼동하는 것이다. client-dependent table의 데이터는 client별로 분리된다. 다른 client에서 넣은 데이터는 현재 client에서 안 보일 수 있다.

세 번째 실수는 key 값을 잘못 넣는 것이다. `DAN = 2`, `MUL = 2`인데 `RESULT = 5`처럼 업무적으로 틀린 데이터도 수동 입력에서는 들어갈 수 있다. DB key는 중복을 막아 주지만, 결과값 계산이 맞는지는 별도 검증이 필요하다. 이런 업무 검증은 후속 장에서 프로그램 로직과 함께 배운다.

네 번째 실수는 손입력 도구를 대량 데이터 유지보수 도구로 생각하는 것이다. 18행도 번거롭다. CH14에서는 TMG/SM30 같은 유지보수 도구를 보고, CH24에서는 프로그램 DML을 배운다.

### 체험 설계

L02에는 "Create Entries 입력 훈련기"가 적합하다.

| 요소 | 설계 |
|---|---|
| 입력 | `DAN`, `MUL`, `RESULT` |
| 버튼 | `새 행`, `저장`, `중복 저장 시도`, `DAN=2 조회`, `전체 조회`, `client 전환 보기` |
| 상태 | 빈 행, 입력 중, 저장 성공, key 중복 오류, 조회 결과 0행/9행/18행 |
| 데이터 | 현재 client, key 조합, table contents |
| 피드백 | `RESULT`가 `DAN * MUL`과 다르면 업무값 오류 경고 |

실제 SAP에서는 key 중복 메시지나 권한 메시지가 시스템마다 다를 수 있다. 웹 체험에서는 메시지 문구를 고정하기보다 "저장 실패: 같은 key 조합이 이미 있음"처럼 원인을 설명하는 피드백을 제공한다.

### 정리

Create Entries는 만든 Transparent Table에 소량 데이터를 손으로 넣어 확인하는 학습 도구다. CH07에서는 2단과 3단 18행을 입력하고 Table Contents로 확인한다. key 중복, client 분리, 수동 입력의 번거로움을 경험하면 CH08의 조회와 CH24의 DML 필요성이 자연스럽게 보인다.

## CH07-L03 - Transparent Table, Structure, Table Type 비교

### 왜 필요한가

CH05, CH06, CH07을 지나며 비슷한 모양이 반복됐다.

```text
dan
mul
result
```

이 모양은 Structure에도 있고, Internal Table의 line type에도 있고, Transparent Table에도 있다. 초보자는 여기서 "셋이 같은 것 아닌가?"라고 헷갈리기 쉽다. 같은 모양을 쓸 수는 있지만, 사는 곳과 수명이 다르다.

### 무엇인가

세 객체를 한 번에 비교하자.

| 구분 | 예 | 사는 곳 | 담는 양 | 수명 | 목적 |
|---|---|---|---|---|---|
| Structure / Work Area | `DATA ls_line TYPE zst_line.` | 메모리 | 한 건 | 실행 중 | 한 행 작업 |
| Internal Table | `DATA lt_line TYPE TABLE OF zst_line.` | 메모리 | 여러 건 | 실행 중 | 여러 행 처리 |
| Transparent Table | `ZGUGUDAN` | DB 디스크 | 여러 건 | 영속 | 저장과 공유 |

Structure와 Internal Table은 프로그램 data object다. 실행이 끝나면 사라진다. Transparent Table은 DB에 저장되는 DDIC database table이다. 데이터가 남고, 다른 프로그램이 나중에 다시 읽을 수 있다.

같은 DDIC Structure를 프로그램에서 한 건과 여러 건으로 사용할 수 있다.

```abap
DATA ls_line TYPE zst_line.
DATA lt_line TYPE TABLE OF zst_line.
```

이 코드는 DB 테이블을 만드는 코드가 아니다. `zst_line` 모양을 가진 work area와 internal table을 메모리에 만드는 코드다.

반대로 `ZGUGUDAN`은 SE11에서 만든 DB 테이블이다. 프로그램에서 읽고 쓰려면 Open SQL이나 DML을 배워야 한다. 조회는 CH08, 변경은 CH24에서 다룬다.

### 어떻게 확인하는가

다음 질문에 답할 수 있어야 한다.

| 질문 | 답 |
|---|---|
| `ls_line`은 프로그램 종료 후 남는가 | 남지 않음 |
| `lt_line`은 프로그램 종료 후 남는가 | 남지 않음 |
| `ZGUGUDAN`에 저장한 행은 프로그램 종료 후 남는가 | 남음 |
| `TYPE TABLE OF zst_line`은 DB 저장인가 | 아님. 메모리 internal table |
| `ZGUGUDAN`은 여러 프로그램에서 볼 수 있는가 | 권한과 client가 맞으면 가능 |

기존 임베드 `embeds/abap/CH07-L03-S01.html`은 이 비교를 시각화한다. 왼쪽은 메모리, 오른쪽은 디스크로 나누고 같은 `dan`, `mul`, `result` 모양이 어디에 있는지 보여 준다.

### 실수와 주의

첫 번째 실수는 Internal Table에 담으면 저장됐다고 생각하는 것이다. `lt_gugu`는 메모리다.

두 번째 실수는 Transparent Table을 Structure처럼 한 건 변수로 생각하는 것이다. Transparent Table은 DB에 있는 여러 행의 저장소다.

세 번째 실수는 `TYPE TABLE OF zst_line`과 SE11 Table Type, Transparent Table을 섞는 것이다. Table Type은 internal table의 타입 설계도이고, Transparent Table은 DB 저장소다.

네 번째 실수는 CH07에서 곧바로 `SELECT`나 `INSERT` 코드를 쓰려는 것이다. 조회는 CH08, DB 변경은 CH24에서 단계적으로 배운다.

### 체험 설계

기존 임베드 `CH07-L03-S01`을 중심으로 다음 흐름을 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `프로그램 시작`, `Internal Table 채우기`, `프로그램 종료`, `DB 테이블 보기`, `다시 조회` |
| 상태 | 메모리 비어 있음, 메모리 채워짐, 종료 후 메모리 사라짐, 디스크 데이터 유지 |
| 데이터 | `ls_line`, `lt_gugu`, `ZGUGUDAN` |
| 피드백 | "같은 모양이라도 메모리 객체는 휘발, Transparent Table은 영속" |
| 시각화 | 메모리 영역은 전원 끄기 아이콘 후 사라지고, 디스크 영역은 남음 |

추가 퀴즈는 "이 값은 어디에 살아 있는가?" 형태가 좋다. `ls_line`, `lt_gugu`, `ZGUGUDAN`, `ZTT_GUGUDAN` 같은 카드를 메모리/타입/DB 영역으로 끌어다 놓게 한다.

### 정리

Structure는 한 건 작업용 메모리 객체, Internal Table은 여러 건 처리용 메모리 객체, Transparent Table은 영속 저장용 DB 테이블이다. 같은 모양을 공유할 수 있지만 목적과 수명이 다르다. CH08에서는 이제 `ZGUGUDAN`에 저장한 데이터를 ABAP 프로그램에서 다시 읽는 방법, 즉 Open SQL 기본 조회를 배운다.

## CH07 마무리

CH07을 끝내면 학습자는 다음을 설명할 수 있어야 한다.

| 기준 | 할 수 있어야 하는 일 |
|---|---|
| Transparent Table | DDIC 정의와 DB 물리 테이블이 1:1 대응되는 영속 테이블이라고 설명 |
| MANDT | client-dependent table의 첫 key field 역할 설명 |
| Key | 행을 유일하게 식별하는 필드 조합 설명 |
| Data Element | 필드 타입에 의미와 라벨을 부여하는 이유 설명 |
| Delivery Class | application table에는 보통 `A`를 사용한다는 수준으로 이해 |
| Technical Settings | data class, size category가 DB 저장 힌트임을 이해 |
| Create Entries | 소량 데이터를 SE11에서 직접 넣고 Table Contents로 확인 |
| 비교 | Structure, Internal Table, Transparent Table의 수명과 목적 구분 |

다음 CH08에서는 손으로 넣은 18행을 프로그램에서 다시 읽는다. 그때 처음으로 Open SQL `SELECT`를 배운다.
