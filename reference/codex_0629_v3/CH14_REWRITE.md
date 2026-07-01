# CH14_REWRITE - Classic DDIC View and Maintenance Objects

> 기준 소스: `content/abap/CH14/_chapter.md`, `content/abap/CH14/CH14-L01.md` ~ `CH14-L09.md`
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, 기존 `reference/codex_0625`, `reference/codex_0625_v2`
> 공식 문서 확인: `C:\ABAP_DOCU_HTML`의 DDIC View, Database View, Projection View, Help View, Maintenance View, Foreign Key, Display/Maintenance, Data Browser, CDS View Entity 관련 항목을 수동 확인

## 챕터 설계

CH13에서 학습자는 프로그램 안에 JOIN과 GROUP BY를 직접 작성했다. 이제 질문이 바뀐다.

```text
같은 JOIN을 여러 프로그램에서 계속 써야 하나?
사용자에게 테이블의 모든 필드를 보여 줘야 하나?
F4 도움말에 코드와 설명을 같이 보여 주려면 무엇을 써야 하나?
마스터데이터를 매번 SE11 Create Entries로 넣어야 하나?
업무 담당자가 표준 화면에서 직접 유지보수하게 할 수 있나?
```

CH14는 "테이블을 만들었다"에서 "테이블을 업무에 맞게 보여 주고, 유지보수하고, 확인한다"로 넘어가는 장이다. View는 데이터를 새로 저장하는 테이블이 아니라 기존 테이블을 바라보는 관점이다. Table Maintenance Generator와 SM30은 단순한 조회 도구가 아니라 마스터데이터를 표준 화면으로 관리하게 해 주는 장치다.

이 장은 ABAP 코드 문법보다 DDIC 도구의 역할 구분이 더 중요하다. Database View, Projection View, Help View, Maintenance View는 이름이 비슷하지만 목적이 다르다. 이 차이를 놓치면 조회용 View를 유지보수 화면으로 착각하거나, F4 도움말용 View를 일반 SQL 조회 대상으로 착각한다.

CH14는 classic-first 구간이다. CDS는 CH22에서 본격적으로 다룬다. 여기서는 "Classic DDIC View가 있고, 현대 데이터 모델링은 CDS로 이동한다"는 지도만 제공한다. RAP, OData, annotation, DCL, Fiori Elements는 도입하지 않는다.

공식 문서 확인 중 중요한 교정도 반영한다. Help View는 Search Help용이며 primary table을 보존하는 outer join 성격을 갖는다고 설명된다. 반면 Maintenance View 문서는 extended table maintenance용 객체이며 foreign key 기반으로 구성되고, inner join을 구현한다고 설명한다. 따라서 CH14-L04에서는 Maintenance View를 "LEFT OUTER 조회 대안"으로 설명하지 않고, foreign key 기반 유지보수 화면 설계로 바로잡는다.

## CH14-L01 - Database View와 Open SQL JOIN 비교

### 왜 필요한가

CH13에서는 프로그램마다 JOIN을 직접 작성했다. 한두 개 프로그램에서는 괜찮다. 하지만 공연 목록, 예매 현황, 정산 리포트가 모두 `ZCONCERT`와 `ZPERF`를 같은 방식으로 붙인다면 같은 JOIN 조건이 여기저기 반복된다.

반복된 JOIN은 유지보수 위험을 만든다. 필드명이 바뀌거나 조인 조건이 보강되면 여러 프로그램을 모두 고쳐야 한다. 어떤 프로그램은 고치고 어떤 프로그램은 놓치면 같은 업무 데이터가 화면마다 다르게 보인다.

Database View는 안정적인 공통 조회 관점을 DDIC에 이름 붙여 등록하는 방법이다. 프로그램은 복잡한 JOIN을 매번 쓰지 않고 View를 테이블처럼 읽는다.

### 무엇인가

DDIC Database View는 하나 이상의 basis table에서 필요한 필드를 골라 만든 Dictionary View다. 여러 basis table이 있으면 inner join으로 결합된다. 활성화하면 database object가 생성되고, ABAP SQL에서 data source로 사용할 수 있다.

```abap
DATA: lt_concert TYPE TABLE OF zv_concert,
      ls_concert TYPE zv_concert.

SELECT *
  FROM zv_concert
  INTO TABLE lt_concert.

LOOP AT lt_concert INTO ls_concert.
  WRITE: / ls_concert-concert_id,
           ls_concert-artist,
           ls_concert-perf_date.
ENDLOOP.
```

이 예제에서 `ZV_CONCERT`는 이미 SE11에 정의되어 있다고 가정한다. 프로그램에는 JOIN 조건이 보이지 않는다. JOIN 조건은 View 정의 안에 있다.

| 비교 | Database View | Open SQL JOIN |
|---|---|---|
| 정의 위치 | DDIC | ABAP 프로그램 |
| 재사용 | 여러 프로그램이 같은 View를 읽음 | 프로그램마다 작성 |
| 결합 성격 | 여러 테이블이면 inner join | 코드에서 inner/left 등을 선택 |
| 장점 | 공통 조회 관점 안정화 | 상황별 유연성 |
| 주의 | View 변경 영향이 넓음 | JOIN 반복과 조건 누락 위험 |

### 어떻게 확인하는가

SE11에서 Database View를 열고 다음을 확인한다.

1. View type이 Database View인지 확인한다.
2. Basis table 목록에 `ZCONCERT`, `ZPERF` 같은 테이블이 들어 있는지 본다.
3. Join Conditions에서 어떤 필드가 연결되는지 확인한다.
4. View Fields에서 외부에 노출되는 필드가 무엇인지 확인한다.
5. Utilities의 Database Object 확인으로 활성화 상태를 본다.

그 다음 같은 결과를 CH13 방식의 JOIN SELECT와 Database View SELECT로 비교한다. 결과는 같아도 책임 위치가 다르다. JOIN은 프로그램 안에 있고, Database View는 DDIC 객체 안에 있다.

### 체험 설계

L01에는 "JOIN 코드 vs Database View 비교 보드"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `JOIN 코드 보기`, `View 정의 보기`, `Basis Table 보기`, `Join Condition 보기`, `마스터 누락 실험` |
| 상태 | 코드 JOIN, View 정의, 결과 행 수, 빠진 행 |
| 데이터 | `ZCONCERT`, `ZPERF` 샘플 |
| 피드백 | 같은 결과라도 정의 위치가 다르며, Database View는 여러 테이블이면 inner join임을 표시 |

`마스터 누락 실험`은 `ZCONCERT`에는 있지만 `ZPERF`에는 없는 값이 있을 때 View 결과에서 사라지는지를 보여 준다.

### 실수와 주의

Database View를 데이터 복사본으로 이해하면 안 된다. View에 데이터가 따로 저장되는 것이 아니라 basis table을 읽은 결과가 보인다.

모든 JOIN을 Database View로 만들 필요도 없다. 프로그램마다 조건이 다르고, left outer join처럼 기준 행 보존이 필요하거나, 일회성 조회라면 코드 JOIN이 더 적절할 수 있다.

View Field를 너무 많이 노출하면 View가 공통 계약처럼 굳어진다. 업무에 필요한 필드만 노출하는 훈련이 필요하다.

### 정리

Database View는 반복 JOIN을 DDIC의 공통 조회 관점으로 올리는 도구다. 여러 basis table이면 inner join으로 결합되고, ABAP SQL에서 테이블처럼 읽을 수 있다. 다만 저장소가 아니며, 유연한 조회 조건을 모두 대신하지 않는다.

## CH14-L02 - Projection View 개념과 한계

### 왜 필요한가

큰 테이블에는 사용자가 볼 필요 없는 필드가 많다. 기술 필드, 내부 상태, 생성자, 변경일, 제어용 플래그가 모두 보이면 화면은 복잡해지고 잘못된 필드를 업무 필드로 착각하기 쉽다.

Projection View는 한 테이블을 더 좁은 관점으로 보여 주는 도구다. "행을 줄이는 것"이 아니라 "열을 줄이는 것"에 가깝다.

### 무엇인가

Projection View는 단일 basis table에서 일부 필드를 숨기는 DDIC table view다. 공식 문서 기준으로 database SQL view가 따로 생성되지 않으며, selection condition도 지정하지 않는다.

```abap
DATA: lt_basic TYPE TABLE OF zpv_concert_basic,
      ls_basic TYPE zpv_concert_basic.

SELECT *
  FROM zpv_concert_basic
  INTO TABLE lt_basic.

LOOP AT lt_basic INTO ls_basic.
  WRITE: / ls_basic-concert_id,
           ls_basic-artist.
ENDLOOP.
```

`ZPV_CONCERT_BASIC`이 `ZCONCERT`의 `CONCERT_ID`, `ARTIST` 같은 필드만 노출한다면, 프로그램은 그 구조만 본다.

| 항목 | Projection View |
|---|---|
| basis table 수 | 하나 |
| 목적 | 일부 필드만 노출 |
| JOIN | 없음 |
| 복잡한 계산 | 없음 |
| 행 조건 | 핵심 목적 아님 |

### 어떻게 확인하는가

SE11에서 Projection View를 열고 basis table이 하나인지 확인한다. View Fields에 어떤 필드가 남았는지 보고, 원본 테이블과 Projection View를 각각 조회해 컬럼 차이를 비교한다.

확인 질문은 다음과 같다.

```text
원본 테이블에는 기술 필드가 있는가?
Projection View에는 그 필드가 숨겨졌는가?
행 수는 원본과 같은가?
숨긴 필드의 데이터가 삭제된 것은 아닌가?
```

### 체험 설계

L02에는 "필드 커튼 시뮬레이터"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `기술 필드 숨기기`, `업무 필드만 남기기`, `Key 필드 제거 시도`, `원본과 비교` |
| 상태 | 원본 필드 목록, View Field 목록, 결과 그리드 |
| 데이터 | `ZCONCERT` 필드 전체 |
| 피드백 | Projection View는 단일 테이블의 필드 노출을 줄이는 도구임을 강조 |

`Key 필드 제거 시도`에서는 "행 식별에 필요한 필드는 남기는 것이 안전합니다"라고 안내한다.

### 실수와 주의

Projection View로 조인을 하려 하면 안 된다. 여러 테이블 결합은 Database View나 Open SQL JOIN의 영역이다.

Projection View를 보안의 전부로 생각하면 안 된다. 필드 노출을 줄이는 것은 설계의 일부일 뿐이며, 권한과 유지보수 정책은 별도다.

### 정리

Projection View는 한 테이블의 필요한 필드만 보여 주는 DDIC View다. 행을 복잡하게 가공하거나 여러 테이블을 합치는 도구가 아니다. 사용자와 프로그램이 보는 구조를 단순하게 만드는 데 의미가 있다.

## CH14-L03 - Help View와 Search Help 연결

### 왜 필요한가

사용자는 코드값을 외우지 않는다. 공연 등록 화면에서 `P001`을 직접 입력하라고 하면 업무 담당자는 어떤 공연인지 알기 어렵다. F4 도움말은 코드와 설명을 함께 보여 주어 입력 실수를 줄인다.

Search Help가 한 테이블만 읽으면 충분한 경우도 있다. 하지만 F4 목록에 여러 테이블의 보조 설명을 함께 보여 주고 싶다면 Help View가 필요할 수 있다.

### 무엇인가

Help View는 Search Help에서 selection method로 사용할 수 있는 DDIC table view다. 공식 문서 기준으로 Help View는 ABAP SQL로 직접 접근하는 대상이 아니다. Search Help용이다.

Help View는 foreign key 기반으로 테이블을 묶고, primary table의 내용을 보존하는 outer join 성격을 가진다. 설명 텍스트 같은 보조 정보가 없어도 primary table의 값은 F4 후보로 남을 수 있다.

```text
ZHV_CONCERT_HELP       Help View
  primary table: ZCONCERT
  secondary table: ZPERF

ZSH_CONCERT            Search Help
  Selection Method: ZHV_CONCERT_HELP

화면 필드
  F4 -> ZSH_CONCERT -> ZHV_CONCERT_HELP -> 값 선택
```

### 어떻게 확인하는가

SE11에서 Help View를 확인한 뒤 Search Help와 연결한다.

1. Help View의 primary table과 secondary table을 확인한다.
2. Foreign Key 기반으로 연결되는지 본다.
3. Search Help의 Selection Method에 Help View가 지정되어 있는지 확인한다.
4. Search Help parameter에서 화면에 보여 줄 필드와 반환할 필드를 확인한다.
5. 실제 입력 필드에서 F4를 눌러 목록이 의도대로 보이는지 확인한다.

중요한 점은 Help View를 일반 SELECT 대상으로 테스트하지 않는 것이다. Help View의 주 무대는 F4 Search Help다.

### 체험 설계

L03에는 "F4 여행 경로"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `입력 필드 클릭`, `F4 누르기`, `Search Help 열기`, `Help View 읽기`, `값 반환` |
| 상태 | 현재 단계, selection method, 표시 필드, 반환 필드 |
| 데이터 | 공연 코드, 공연명, 회차일 |
| 피드백 | Help View는 F4 목록을 풍부하게 하는 소스이며 일반 조회 View와 다름 |

오류 상태로는 selection method 누락, 반환 필드 미지정, foreign key 관계 누락을 둔다.

### 실수와 주의

Help View를 일반 리포트 조회용 View로 쓰려 하면 안 된다. 일반 조회는 Database View나 Open SQL JOIN을 검토한다.

F4 목록이 이상하면 Search Help만 보지 말고 Help View의 primary table, join 관계, parameter mapping을 함께 확인한다.

Search Help exit이나 동적 F4 제어는 CH14 범위가 아니다. 여기서는 DDIC Help View와 Search Help 연결 흐름만 잡는다.

### 정리

Help View는 F4 Search Help의 selection method로 사용할 수 있는 DDIC View다. 여러 테이블의 보조 정보를 F4 목록에 붙이는 데 유용하지만, 일반 ABAP SQL 조회 대상은 아니다.

## CH14-L04 - Maintenance View와 Foreign Key 관계

### 왜 필요한가

마스터데이터는 조회만으로 끝나지 않는다. 업무 담당자가 표준 화면에서 데이터를 등록, 수정, 삭제해야 할 수 있다. 여러 관련 테이블을 함께 유지보수해야 하는 경우도 있다.

Maintenance View는 이런 extended table maintenance를 위한 DDIC View다. 핵심은 조회가 아니라 유지보수다.

### 무엇인가

Maintenance View는 관련 DDIC database table의 내용을 함께 유지보수하기 위한 DDIC table view다. 공식 문서 기준으로 database object로 생성되지 않고, ABAP SQL로 직접 접근하지 않는다. SE54에서 maintenance dialog를 만들고, SM30/SM31의 Table View Maintenance에서 사용한다.

여러 테이블 Maintenance View는 foreign key dependency를 따라 구성된다. first table은 primary table이고, foreign key를 통해 추가되는 테이블은 secondary table이다.

중요한 교정:

```text
Database View: 여러 basis table이면 inner join, ABAP SQL 조회 가능
Help View: Search Help용, primary table 보존 outer join 성격
Maintenance View: extended table maintenance용, foreign key 기반, 공식 문서상 inner join 구현
```

따라서 Maintenance View를 "LEFT OUTER 조회 대안"으로 배우면 안 된다. 유지보수 화면 설계 도구로 이해해야 한다.

### 어떻게 확인하는가

SE11 또는 SE54에서 Maintenance View를 확인할 때는 다음을 본다.

1. primary table이 무엇인지 확인한다.
2. secondary table이 foreign key dependency로 연결되는지 확인한다.
3. key fields가 View에 포함되어 있는지 확인한다.
4. Maintenance Status가 유지보수를 허용하는지 확인한다.
5. maintenance dialog를 생성했는지 확인한다.

Foreign Key가 약하면 Maintenance View 구성도 흔들린다. CH09에서 만든 관계가 CH14에서 다시 쓰이는 이유가 여기에 있다.

### 체험 설계

L04에는 "Foreign Key로 문 열기" 체험을 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `FK 관계 보기`, `Maintenance View 구성`, `FK 제거 실험`, `Key 필드 누락 실험` |
| 상태 | primary table, secondary table, foreign key, 생성 가능 여부 |
| 데이터 | `ZCONCERT`, `ZPERF`, `ZHALL` |
| 피드백 | Maintenance View는 관계가 명확한 테이블을 유지보수 화면으로 묶는 도구임을 표시 |

`FK 제거 실험`에서는 테이블을 아무렇게나 붙일 수 없다는 점을 보여 준다.

### 실수와 주의

Maintenance View를 일반 SELECT 대상으로 생각하지 않는다. ABAP SQL 조회는 Database View나 Projection View를 사용한다.

아무 테이블이나 묶을 수 있다고 생각하면 안 된다. Foreign Key dependency와 cardinality가 중요하다.

유지보수 가능 여부는 View 정의만으로 끝나지 않는다. maintenance dialog 생성, 권한, delivery class, transport 정책까지 확인해야 실제 운영 흐름이 맞다.

### 정리

Maintenance View는 foreign key 기반의 유지보수용 DDIC View다. Help View와 달리 F4 목록용이 아니고, Database View와 달리 일반 SQL 조회용도 아니다. 목적은 관련 테이블의 표준 유지보수 흐름을 준비하는 것이다.

## CH14-L05 - Table Maintenance Generator / SM30

### 왜 필요한가

CH07에서 Create Entries로 데이터를 넣는 경험을 했다. 하지만 실무 마스터데이터를 매번 개발자가 SE11에서 한 건씩 넣는 것은 좋지 않다. 업무 담당자가 표준 화면에서 목록을 보고, 행을 추가하고, 수정하고, 저장할 수 있어야 한다.

Table Maintenance Generator는 테이블이나 Maintenance View에 표준 유지보수 화면을 만들어 준다. 생성한 뒤에는 SM30에서 데이터를 유지보수한다.

### 무엇인가

흐름은 다음과 같다.

```text
SE11 테이블/뷰
  -> Utilities
  -> Table Maintenance Generator
  -> Authorization Group, Function Group, Screen Number, Maintenance Type 지정
  -> Maintenance Dialog 생성
  -> SM30에서 Maintain
```

Maintenance Type은 화면 흐름을 정한다.

| 유형 | 의미 | 적합한 경우 |
|---|---|---|
| One Step | 목록 화면에서 바로 입력/수정 | 필드가 적은 단순 테이블 |
| Two Step | 목록 화면과 상세 화면 분리 | 필드가 많거나 상세 편집이 필요한 테이블 |

SM30은 생성된 maintenance dialog를 사용하는 운영 트랜잭션이다. Generator 없이 SM30만 실행하면 유지보수 화면이 열리지 않는다.

### 어떻게 확인하는가

확인 순서:

1. SE11에서 `ZCONCERT`의 Display/Maintenance 설정을 확인한다.
2. Table Maintenance Generator가 생성되어 있는지 확인한다.
3. Authorization Group과 Function Group을 확인한다.
4. One Step 또는 Two Step 화면 번호가 지정되어 있는지 본다.
5. SM30에서 `ZCONCERT`를 입력하고 Maintain을 실행한다.
6. 행 추가, 수정, 삭제 버튼이 보이는지 확인한다.
7. 저장 시 transport 요청이 필요한지 확인한다.

### 체험 설계

L05에는 "SM30 문이 열리기까지 체크리스트"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `TMG 없음`, `TMG 생성`, `SM30 열기`, `행 추가`, `저장`, `권한 오류` |
| 상태 | maintenance dialog 존재 여부, 화면 유형, 권한 그룹, 저장 가능 여부 |
| 데이터 | 공연 마스터 3건 |
| 피드백 | Generator 전에는 SM30이 열리지 않고, Generator 후에 표준 유지보수 화면이 열림 |

`권한 오류` 상태는 권한 그룹이 왜 필요한지 보여 준다.

### 실수와 주의

Generator 없이 SM30을 먼저 열면 유지보수 불가 오류를 만날 수 있다. 순서는 TMG 생성 후 SM30이다.

권한 그룹을 대충 두면 운영에서 누가 데이터를 바꿀 수 있는지 통제하기 어렵다.

SM30은 단순 마스터데이터에 강하지만 복잡한 검증과 업무 로직이 많은 화면에는 부족할 수 있다. 그런 경우에는 CH16 이후의 Dynpro나 전용 프로그램을 검토한다.

### 정리

Table Maintenance Generator는 테이블/뷰에 표준 유지보수 화면을 생성하고, SM30은 그 화면을 실행해 데이터를 관리하는 트랜잭션이다. CH14의 핵심은 "데이터 입력 화면도 DDIC 설정과 권한, transport 흐름을 가진다"는 점이다.

## CH14-L06 - View Cluster로 관련 뷰 묶기

### 왜 필요한가

한 테이블만 관리하면 SM30으로 충분하다. 하지만 공연, 회차, 좌석등급처럼 늘 함께 관리하는 여러 테이블이 있으면 화면을 매번 오가야 한다. 상위 공연을 고르고, 그 공연의 회차를 보고, 다시 회차별 좌석등급을 관리하는 흐름이 필요하다.

View Cluster는 여러 maintenance object를 하나의 계층 흐름으로 묶는 도구다.

### 무엇인가

View Cluster는 관련 테이블이나 maintenance view를 계층적으로 묶어 유지보수하게 하는 설정이다. 보통 SE54에서 정의한다.

```text
공연
  -> 회차
      -> 좌석등급
```

상위에서 공연 하나를 선택하면 하위에는 그 공연에 연결된 회차가 보이고, 다시 회차를 선택하면 좌석등급이 보이는 식이다.

### 어떻게 확인하는가

SE54에서 View Cluster를 열고 다음을 확인한다.

1. cluster에 포함된 maintenance object 목록을 본다.
2. 상위와 하위의 dependency를 확인한다.
3. 각 object에 TMG 또는 maintenance dialog가 준비되어 있는지 본다.
4. 테스트 실행에서 상위 선택이 하위 목록을 제한하는지 확인한다.

### 체험 설계

L06에는 "계층 유지보수 지도"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `공연 선택`, `회차로 이동`, `좌석등급으로 이동`, `단일 SM30 비교`, `관계 끊기` |
| 상태 | 현재 계층, 선택된 상위 key, 하위 필터 상태 |
| 데이터 | 공연 2건, 회차 4건, 좌석등급 여러 건 |
| 피드백 | View Cluster는 여러 관련 유지보수 화면을 업무 흐름으로 묶는 도구임을 표시 |

`단일 SM30 비교`는 테이블을 따로따로 열 때의 불편함을 보여 준다.

### 실수와 주의

단일 테이블에 View Cluster를 쓰는 것은 과하다. 한 테이블이면 TMG와 SM30이면 충분하다.

Foreign Key 관계가 불명확하면 계층 유지보수도 불안정해진다. 먼저 데이터 모델 관계를 정리한다.

View Cluster는 편리하지만 설정이 복잡하다. 정말 관련 테이블을 항상 함께 관리하는지 확인하고 도입한다.

### 정리

View Cluster는 여러 유지보수 객체를 계층형 업무 흐름으로 묶는 도구다. 단일 테이블에는 과하고, 마스터와 종속 테이블을 함께 관리할 때 효과가 있다.

## CH14-L07 - SE16N 데이터 브라우저

### 왜 필요한가

개발 중에는 "지금 테이블에 실제로 어떤 값이 들어갔는가"를 빠르게 확인해야 한다. SM30은 유지보수 화면이고, Database View는 조회 관점이다. 개발자에게는 아무 테이블이나 조건을 넣어 빠르게 확인하는 Data Browser가 필요하다.

원본 커리큘럼은 현업에서 자주 쓰는 SE16N을 다룬다. 공식 문서의 Data Browser 근거는 SE16 계열 설명에 가깝지만, 학습 관점에서는 SE16N을 빠른 조회 도구로 소개한다.

### 무엇인가

SE16N은 테이블 내용을 빠르게 조회하는 데이터 브라우저다.

```text
SE16N
  -> Table Name 입력
  -> Selection 조건 입력
  -> Execute
  -> 결과 행 확인
```

SM30과 역할이 다르다.

| 도구 | 목적 |
|---|---|
| SM30 | 유지보수 화면으로 데이터 등록/수정/삭제 |
| SE16N | 개발자/운영자가 테이블 내용을 빠르게 조회 |
| SE11 | Dictionary 객체 정의와 기술 정보 확인 |

### 어떻게 확인하는가

CH14 실습 흐름에서는 다음처럼 확인한다.

1. SM30으로 `ZCONCERT`에 공연을 추가한다.
2. SE16N에서 `ZCONCERT`를 조회한다.
3. 방금 저장한 행이 보이는지 확인한다.
4. 조건에 `CONCERT_ID = C001`을 넣어 한 건만 조회한다.
5. 레이아웃에서 필요한 컬럼만 보이게 조정한다.

### 체험 설계

L07에는 "SM30 저장 후 SE16N 추적기"를 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `SM30 저장`, `SE16N 조회`, `조건 추가`, `레이아웃 변경`, `편집 시도 경고` |
| 상태 | 저장된 행, 조회 조건, 결과 행 수, 편집 권한 상태 |
| 데이터 | `ZCONCERT`, `ZPERF` |
| 피드백 | SE16N은 빠른 확인 도구이며 정식 입력 화면을 대체하지 않음 |

`편집 시도 경고`는 운영 데이터 직접 편집 위험을 강조한다.

### 실수와 주의

SE16N을 정식 사용자 입력 화면으로 쓰면 안 된다. 사용자 입력은 SM30, Maintenance View, 전용 화면, 또는 후속 애플리케이션에서 처리한다.

운영 데이터 직접 편집 방법을 학습 목표로 삼지 않는다. 검증, 권한, 이력, transport 정책을 우회할 수 있기 때문이다.

조회 조건 없이 큰 테이블을 실행하면 부담이 클 수 있다. 필요한 조건을 넣고 조회하는 습관을 만든다.

### 정리

SE16N은 테이블 내용을 빠르게 확인하는 Data Browser 성격의 도구다. SM30은 유지보수, SE16N은 확인, SE11은 정의 확인으로 역할을 나누어 이해한다.

## CH14-L08 - Classic View와 CDS 비교

### 왜 필요한가

Classic DDIC View는 오래된 시스템에서 여전히 중요하다. 하지만 현대 ABAP 데이터 모델링은 CDS로 이동했다. 초급자가 여기서 CDS 문법까지 배우면 범위가 무너진다. 대신 "왜 나중에 CDS를 배우는가"를 이해할 필요가 있다.

### 무엇인가

Classic View와 CDS View Entity의 차이는 정의 방식과 표현력이다.

| 항목 | Classic DDIC View | CDS View Entity |
|---|---|---|
| 정의 위치 | SE11 GUI | ADT의 DDL source |
| 주요 용도 | classic DDIC 조회/유지보수/F4 기반 | 현대 데이터 모델링 |
| 표현력 | 제한적 | annotation, association, expression 등 풍부 |
| 후속 연계 | classic report 중심 | OData/Fiori/RAP 친화 |
| 본격 학습 | CH14 | CH22 |

공식 DDIC View 문서도 CDS entities가 DDIC View보다 고급 모델링 기능을 제공한다고 안내한다. 다만 이것이 "Classic View가 모두 쓸모없다"는 뜻은 아니다. 특히 Maintenance View, SM30, 기존 시스템의 DDIC View는 여전히 읽고 관리할 줄 알아야 한다.

### 어떻게 확인하는가

학습자는 현재 장의 대상과 후속 장의 대상을 구분한다.

```text
CH14에서 할 일:
SE11 View 종류 구분
SM30 유지보수 흐름 이해
SE16N으로 확인

CH22에서 할 일:
CDS View Entity 문법
Association
Annotation
DCL
Fiori/RAP 연결의 기초
```

### 체험 설계

L08에는 "Classic vs CDS 경계 카드"를 둔다.

| 요소 | 설계 |
|---|---|
| 카드 | `SM30 유지보수`, `F4 Help View`, `OData 노출`, `Annotation`, `기존 Database View 조회`, `RAP Query` |
| 선택지 | CH14 Classic, CH22 CDS, 후속 RAP |
| 상태 | 현재 학습 가능 여부, 선행 개념 |
| 피드백 | 지금 배울 것과 나중에 배울 것을 분리 |

### 실수와 주의

CDS를 지금 깊이 들어가면 CH14의 목적을 잃는다. CH14는 classic DDIC View와 유지보수 객체의 역할을 이해하는 장이다.

Classic View를 무조건 낡은 것으로 무시하면 안 된다. 기존 시스템을 읽고 유지보수하려면 반드시 알아야 한다.

CDS가 강력하다고 해서 SM30 유지보수 흐름을 대체한다고 단순화하지 않는다. 목적이 다르다.

### 정리

CH14는 Classic DDIC View와 유지보수 도구를 다룬다. CDS View Entity는 CH22에서 본격적으로 배운다. 지금은 "Classic을 읽을 줄 알고, 현대 모델링은 CDS로 확장된다"는 지도만 갖는다.

## CH14-L09 - 실습: 공연 등록 화면과 조회 View 연결

### 왜 필요한가

콘서트 앱은 이제 테이블, 관계, 조회, SALV, 조건, 집계를 배웠다. 하지만 마스터데이터를 어떻게 등록하고 확인할지 흐름이 필요하다.

CH14-L09의 목표는 `ZCONCERT` 공연 마스터를 표준 유지보수 화면으로 관리하고, 공연과 회차를 View로 조회하는 것이다.

### 무엇인가

실습 흐름은 세 단계다.

```text
1. ZCONCERT에 Table Maintenance Generator 생성
2. SM30으로 공연 마스터 등록
3. Database View ZV_CONCERT로 공연 + 회차 조회
```

예시 조회 코드:

```abap
DATA: lt_view TYPE TABLE OF zv_concert,
      ls_view TYPE zv_concert.

SELECT *
  FROM zv_concert
  INTO TABLE lt_view.

LOOP AT lt_view INTO ls_view.
  WRITE: / ls_view-concert_id,
           ls_view-artist,
           ls_view-perf_date.
ENDLOOP.
```

### 어떻게 확인하는가

1. SE11에서 `ZCONCERT`의 TMG가 생성되어 있는지 확인한다.
2. SM30에서 `ZCONCERT`를 열고 공연 2건을 추가한다.
3. F4가 필요한 필드에서 CH09의 Search Help나 Foreign Key 도움말이 동작하는지 확인한다.
4. SE16N으로 `ZCONCERT`를 조회해 저장 결과를 확인한다.
5. `ZV_CONCERT` Database View를 조회해 공연과 회차 정보가 함께 보이는지 확인한다.
6. `ZPERF`에 없는 회차를 참조하는 데이터가 있으면 Database View에서 어떻게 보이는지 확인한다.

### 체험 설계

L09에는 "공연 마스터 운영 콘솔"을 둔다.

| 요소 | 설계 |
|---|---|
| 버튼 | `TMG 생성 확인`, `SM30 열기`, `공연 추가`, `F4 선택`, `저장`, `SE16N 확인`, `View 조회` |
| 상태 | TMG 존재, 저장된 공연 수, F4 성공 여부, View 조회 행 수 |
| 데이터 | 공연 마스터, 회차, 공연+회차 View |
| 피드백 | 등록은 SM30, 확인은 SE16N, 결합 조회는 Database View로 역할 분리 |

오류 상태:

| 오류 | 피드백 |
|---|---|
| TMG 없음 | 먼저 Table Maintenance Generator를 생성해야 합니다 |
| F4 미동작 | Foreign Key/Search Help 설정을 확인합니다 |
| View 행 누락 | Database View는 inner join이므로 조인 상대가 없는 행은 빠질 수 있습니다 |

### 실수와 주의

SM30이 열리지 않으면 테이블이 없는 것이 아니라 TMG가 없거나 유지보수 설정이 맞지 않을 수 있다.

Database View의 조인 조건을 대충 만들면 중복이나 누락이 생긴다. CH13에서 배운 JOIN 조건 점검을 다시 적용한다.

SE16N에서 보인다고 해서 업무 담당자에게 SE16N을 입력 화면으로 주면 안 된다. 운영 입력은 SM30이나 전용 화면으로 설계한다.

### 정리

CH14-L09는 공연 마스터를 표준 유지보수 화면으로 등록하고, SE16N으로 확인하고, Database View로 결합 조회하는 실습이다. CH14 전체의 목적은 DDIC 객체와 표준 도구를 사용해 데이터를 더 안전하고 재사용 가능하게 다루는 것이다.

## CH14 마무리

CH14를 마치면 다음을 말할 수 있어야 한다.

```text
Database View는 반복 JOIN을 DDIC 조회 관점으로 만든다.
Projection View는 단일 테이블의 필드 노출을 줄인다.
Help View는 Search Help용이고 일반 SQL 조회 대상이 아니다.
Maintenance View는 foreign key 기반 유지보수용 View다.
TMG가 있어야 SM30 표준 유지보수 화면을 사용할 수 있다.
View Cluster는 관련 유지보수 객체를 계층으로 묶는다.
SE16N은 빠른 데이터 확인 도구이지 정식 입력 화면이 아니다.
CDS는 CH22에서 본격적으로 배운다.
```

다음 CH15에서는 selection screen과 report event 흐름을 정식으로 배워, 조회 리포트에 기본값, 검증, 메시지, 권한 확인을 더한다.
