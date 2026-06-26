# CH14_REWRITE - codex_0625_v2 재작업 원고

> 대상: `content/abap/CH14`
> 기준 판정: `reference/codex_0625/00_QUALITY_REVIEW.md`
> 작성 범위: CH14 1개 챕터만. 원본 `content/abap`은 수정하지 않는다.
> 목표: v1의 반복 템플릿을 제거하고, CH14를 실제 강의자료 수준의 재집필 원고로 만든다.

## CH14 전체 설계

CH14는 "테이블을 만들었다"에서 "테이블을 업무에 맞게 보여 주고, 안전하게 유지보수하게 만든다"로 넘어가는 장이다. CH07에서 학습자는 SE11로 테이블을 만들고 Create Entries로 데이터를 넣었다. CH13에서는 여러 테이블을 ABAP SQL JOIN으로 읽었다. CH14는 이 둘을 연결한다. 같은 테이블 관계라도 프로그램 코드 안에서 매번 JOIN을 쓰는 경우가 있고, Dictionary View로 조회용 구조를 등록해 두는 경우가 있으며, 업무 담당자가 직접 마스터 데이터를 관리해야 할 때는 Table Maintenance 흐름을 준비해야 한다.

이 장에서 학습자가 가져가야 할 감각은 세 가지다.

1. View는 데이터를 새로 저장하는 테이블이 아니라, 이미 있는 테이블을 다른 관점으로 보여 주는 Dictionary 객체다.
2. 조회용 View와 유지보수용 View는 목적이 다르다. Database View와 Projection View는 ABAP SQL 조회의 data source가 될 수 있지만, Help View와 Maintenance View는 그렇게 읽는 대상이 아니다.
3. SM30 같은 표준 유지보수 화면은 "거저 열리는 화면"이 아니라, DDIC 설정, 유지보수 허용 여부, Maintenance Dialog, 권한, 운송 정책이 맞아야 제대로 작동한다.

학습 경계:

- CH14는 classic-first 구간이다. ABAP 예제는 CH17 이전 기준으로 유지하고, inline declaration, constructor expression, modern Open SQL host marker, comma field list는 쓰지 않는다.
- CDS는 CH22 예고로만 다룬다. CDS 문법, annotation, access control, RAP, OData, Fiori 노출은 이 장의 학습 대상이 아니다.
- Maintenance View와 TMG는 데이터 유지보수 UI의 관점에서 설명한다. ABAP SQL 쓰기문, LUW, lock object, update task는 이 장에서 확장하지 않는다.
- SE16N은 데이터 확인 도구로만 다룬다. 운영 데이터 직접 편집 기법이나 우회 절차는 설명하지 않는다.
- 공식문서 근거는 자동 키워드 매칭이 아니라 `C:\ABAP_DOCU_HTML`에서 CH14 관련 DDIC 문서를 직접 열어 확인한 내용으로 제한한다.

수동 확인한 공식문서 근거:

| 문서 | CH14에서 쓰는 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abenabap_dictionary.htm` | ABAP Dictionary가 테이블, DDIC View, Search Help, Lock Object를 관리하는 repository임을 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_views.htm` | DDIC View가 하나 이상의 테이블 컬럼을 묶은 application-specific view이고, 데이터가 물리 저장되지 않음을 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_database_views.htm` | Database View는 여러 basis table이면 inner join이고, 활성화 시 DB object가 만들어지며 ABAP SQL로 읽을 수 있음을 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_projection_views.htm` | Projection View는 단일 basis table의 필드를 숨기는 view이고, database SQL view가 만들어지지 않음을 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_help_views.htm` | Help View는 Search Help용이고, outer join 성격을 가지며 ABAP SQL로 접근하지 않는다는 점을 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_maintenance_views.htm` | Maintenance View는 extended table maintenance를 위한 view이고, SE54 maintenance dialog, SM30, SM31과 연결됨을 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_database_tables_forkeyrel.htm` | Foreign Key dependency가 input check, input help, view 생성에서 평가되고 ABAP SQL에서는 평가되지 않음을 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_database_tables_forkey.htm` | Foreign Key, Check Table, cardinality, text table 의미를 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_database_tables_maint.htm` | Display/Maintenance 설정이 Data Browser, SE54, SM30, SM31, View Cluster Maintenance 가능 여부를 결정함을 확인 |
| `C:\ABAP_DOCU_HTML\abenddic_database_tables_delivery.htm` | Delivery Class가 table data transport와 SM30 유지보수 데이터 처리에 영향을 준다는 점을 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_dynpros_value_help_auto.htm` | Search Help, Check Table, Fixed Value가 F4 Input Help 계층에서 어떻게 쓰이는지 확인 |
| `C:\ABAP_DOCU_HTML\abendata_browser_glosry.htm` | Data Browser가 DDIC table content에 접근하는 ABAP Workbench 도구임을 확인 |
| `C:\ABAP_DOCU_HTML\abapselect_data_source.htm` | ABAP SQL `SELECT` data source로 DDIC database view와 projection view를 읽을 수 있음을 확인 |
| `C:\ABAP_DOCU_HTML\abencds_define_view_entity.htm` | CDS View Entity는 CH22 예고 범위로만 다룰 근거를 확인 |

공식문서 교정 메모:

- 기존 v1과 일부 계획 문서에는 Maintenance View를 outer join처럼 오해할 수 있는 문장이 있었다. 수동 확인 결과, outer join 성격은 Help View 설명에 명확히 붙어 있고, Maintenance View는 extended table maintenance를 위한 객체로 설명된다.
- Maintenance View 문서에는 여러 테이블 유지보수, SE54 maintenance dialog, SM30, SM31 연결이 나온다. 따라서 CH14-L04와 L05는 "outer join 조회 대안"이 아니라 "foreign key 기반 유지보수 화면 설계"로 재정렬한다.
- 공식 ABAP Keyword Documentation의 Data Browser glossary는 SE16을 언급한다. 원본 커리큘럼의 SE16N은 현업에서 자주 쓰는 데이터 확인 트랜잭션으로 다루되, 공식 근거는 Data Browser와 Display/Maintenance 설정 문서에 한정한다.

CH14에서 계속 쓰는 작은 업무 모델:

```text
zperf                          zconcert
perf_id perf_name              concert_id perf_id date        hall_id
P001    클래식 갈라            C001       P001    2026-07-01  H01
P002    재즈 나이트            C002       P002    2026-07-03  H02

zhall                          zseat_grade
hall_id hall_name              grade_id grade_name base_price
H01     블루홀                 A        VIP        120000
H02     그린홀                 B        일반        70000
```

이 데이터는 레슨마다 다른 질문으로 재사용한다.

1. 공연 목록을 볼 때 매번 `zconcert`와 `zperf`를 JOIN할 것인가, 조회용 View를 만들 것인가.
2. 사용자에게 모든 컬럼을 보여 줄 것인가, 필요한 컬럼만 보여 줄 것인가.
3. F4 도움말에는 코드만 보여 줄 것인가, 설명 텍스트도 같이 보여 줄 것인가.
4. 마스터 데이터는 개발자가 SE11에서 직접 넣을 것인가, 업무 담당자가 SM30에서 관리하게 할 것인가.
5. 관련 테이블이 여러 개일 때는 각각 따로 열 것인가, 계층형 유지보수 흐름으로 묶을 것인가.

## CH14-L01 - Database View와 Open SQL JOIN의 차이

### 왜 필요한가

CH13에서 학습자는 ABAP 프로그램 안에 JOIN을 직접 작성했다. 이 방식은 즉시 이해하기 좋지만, 같은 결합을 여러 프로그램에서 반복하면 문제가 생긴다. 공연 조회 리포트, 예매 확인 리포트, 정산 리포트가 모두 `zconcert`와 `zperf`를 같은 조건으로 붙인다면, 한 곳에서 필드명이 바뀌거나 JOIN 조건을 보강할 때 프로그램마다 수정해야 한다.

Database View는 이런 반복 조회 구조를 DDIC에 이름 붙여 등록하는 방법이다. 프로그램은 복잡한 JOIN 구조를 매번 쓰지 않고 `zv_concert`라는 data source를 테이블처럼 읽는다. 입문자에게는 "JOIN 코드를 숨기는 마술"처럼 보일 수 있지만, 실제로는 데이터 모델에 가까운 공통 조회 관점을 하나 만든 것이다.

### 무엇인가

Database View는 하나 이상의 basis table에서 필요한 컬럼을 골라 application-specific view를 만드는 DDIC 객체다. 여러 테이블을 기준으로 만들면 inner join 조건으로 결합한다. 활성화하면 데이터베이스 쪽에도 SQL View object가 만들어지고, ABAP SQL의 `FROM` data source로 사용할 수 있다.

Database View와 프로그램 JOIN의 차이는 책임 위치다.

| 비교 | Database View | Open SQL JOIN |
| --- | --- | --- |
| 정의 위치 | SE11의 DDIC 객체 | ABAP 프로그램 소스 |
| 재사용 방식 | 여러 프로그램이 같은 View를 읽음 | 필요한 프로그램마다 JOIN 작성 |
| 결합 성격 | DDIC에 고정된 inner join | 코드에서 inner, left outer 등을 선택 |
| 변경 영향 | View를 쓰는 프로그램 전체에 영향 | 해당 프로그램 중심으로 영향 |
| 적합한 경우 | 안정적인 공통 조회 관점 | 프로그램마다 조건과 결합이 달라지는 조회 |

중요한 제한도 처음부터 알아야 한다. Database View는 데이터를 새로 저장하지 않는다. 결과는 basis table에서 읽힌다. 그리고 여러 테이블 Database View는 기본적으로 짝이 맞는 행만 남는다. 공연 코드가 있는데 공연명 마스터가 없으면 그 행은 View 결과에서 사라질 수 있다. "누락된 기준 데이터를 찾고 싶다"면 프로그램의 left outer join이나 별도 검증 리포트를 고려해야 한다.

classic Open SQL 예제:

```abap
DATA: gt_concert TYPE STANDARD TABLE OF zv_concert,
      gs_concert TYPE zv_concert.

SELECT *
  FROM zv_concert
  INTO TABLE gt_concert.

LOOP AT gt_concert INTO gs_concert.
  WRITE: / gs_concert-concert_id,
           gs_concert-perf_name,
           gs_concert-date,
           gs_concert-hall_id.
ENDLOOP.
```

이 코드는 `zv_concert`가 이미 DDIC에 정의되어 있다는 전제다. 학습자는 "프로그램이 JOIN 조건을 모르는 상태에서도 결합된 결과를 읽을 수 있다"는 점을 확인한다.

### 어떻게 확인하는가

SE11에서 Database View를 확인할 때는 네 화면을 순서대로 본다.

1. `ZV_CONCERT`를 Display한다.
2. View Fields에서 실제로 노출되는 필드가 무엇인지 확인한다.
3. Tables/Join Conditions에서 `zconcert-perf_id`와 `zperf-perf_id`가 같은 조건으로 연결되는지 확인한다.
4. Utilities의 Database Object 확인 기능으로 활성화된 database object가 만들어졌는지 확인한다.

프로그램 실행 결과는 두 번 비교한다. 먼저 CH13 방식의 JOIN 리포트를 실행하고, 다음에 `zv_concert`를 읽는 리포트를 실행한다. 같은 데이터가 나오면 "결과는 같지만 정의 위치가 다르다"는 사실이 보인다. 그 다음 `zconcert`에 존재하지만 `zperf`에 없는 `perf_id`를 가진 테스트 행을 넣어 보면, Database View 결과에서 사라지는 inner join 성격도 확인할 수 있다.

### 체험 설계

화면형 학습 도구는 "JOIN 코드 vs Database View" 비교 보드로 만든다.

버튼:

- `JOIN 코드 보기`: 왼쪽에 CH13 스타일 SELECT JOIN 의사코드를 보여 준다.
- `Database View 보기`: 오른쪽에 `ZV_CONCERT`의 basis table, join condition, view fields를 탭으로 보여 준다.
- `마스터 누락 행 추가`: `zconcert`에는 `P999`가 있지만 `zperf`에는 없는 상태를 만든다.
- `결과 비교`: 두 조회 결과의 행 수와 사라진 행을 색으로 표시한다.

상태:

- `정상`: 모든 `perf_id`가 기준 테이블에 존재한다.
- `마스터 누락`: `zconcert`에 참조값은 있으나 `zperf`에 설명 행이 없다.
- `필드 변경`: `perf_name`을 View Field에서 제거했을 때 프로그램 결과 컬럼이 줄어드는 상태.

피드백:

- 정상 상태에서는 "Database View는 반복 JOIN을 줄이는 공통 조회 관점입니다."
- 마스터 누락 상태에서는 "Database View는 여러 테이블이면 inner join입니다. 짝이 없는 행은 결과에서 빠집니다."
- 필드 변경 상태에서는 "View Field는 외부 프로그램의 구조 계약입니다. 이미 쓰는 필드를 쉽게 제거하면 사용 프로그램에 영향이 납니다."

### 실수와 주의

Database View를 "테이블 복사본"으로 이해하면 안 된다. 데이터는 View 안에 저장되지 않는다. basis table 데이터가 바뀌면 View 결과도 달라진다.

두 번째 실수는 모든 JOIN을 Database View로 바꾸려는 것이다. 조회 조건이 프로그램마다 다르거나, left outer join처럼 누락된 행도 보존해야 하거나, 계산 컬럼이 필요하면 Database View가 답이 아닐 수 있다. CH14에서는 안정적인 공통 조회 관점만 Database View 후보로 본다.

세 번째 실수는 View Field를 너무 많이 노출하는 것이다. "언젠가 필요할지도 모른다"는 이유로 모든 필드를 열면 사용자와 프로그램이 그 구조에 의존한다. View는 업무 관점이므로, 실제 읽어야 하는 필드만 노출하는 훈련이 필요하다.

### 정리

Database View는 ABAP 프로그램의 반복 JOIN을 DDIC의 공통 조회 관점으로 옮기는 도구다. 여러 테이블이면 inner join 성격을 갖고, ABAP SQL에서 테이블처럼 읽을 수 있다. 다만 저장소가 아니며, 누락 행 보존이나 복잡한 계산을 해결하는 만능 도구도 아니다. CH14의 첫 레슨은 "조회 로직을 코드에 둘 것인가, Dictionary 객체로 안정화할 것인가"라는 설계 질문을 여는 레슨이다.

## CH14-L02 - Projection View로 필드 노출 줄이기

### 왜 필요한가

초보자는 테이블을 만들면 모든 필드를 그대로 보여 주는 것이 자연스럽다고 생각한다. 하지만 실무에서는 그렇지 않다. 공연 테이블에 가격, 내부 상태, 생성자, 변경일, 비고, 기술 키가 함께 있어도, 어떤 사용자는 공연 코드와 공연명만 필요하다. 모든 필드를 보여 주면 화면이 복잡해지고, 보지 않아도 되는 정보가 노출되며, 잘못된 필드를 업무 필드로 착각할 수 있다.

Projection View는 "같은 테이블을 더 좁게 보여 주는 관점"이다. 조인도 계산도 하지 않고, 단일 basis table에서 필요한 필드만 고른다. 입문자에게 Projection View는 보안 모델 자체라기보다 UI와 프로그램이 바라볼 구조를 단순하게 만드는 첫 도구로 이해시키는 것이 좋다.

### 무엇인가

Projection View는 하나의 basis table을 대상으로 일부 필드만 보이게 하는 DDIC table view다. 공식문서 기준으로 database SQL view가 별도로 만들어지지 않고, selection condition도 지정하지 않는다. 즉 "한 테이블에서 열을 줄이는 View"다.

Database View와 비교하면 목적이 다르다.

| 항목 | Database View | Projection View |
| --- | --- | --- |
| 대상 테이블 수 | 하나 이상 | 하나 |
| 핵심 목적 | 여러 테이블 컬럼 결합 | 한 테이블의 필드 노출 제한 |
| JOIN | 가능 | 없음 |
| selection condition | 가능 | 없음 |
| ABAP SQL 읽기 | 가능 | 가능 |

예를 들어 `zconcert`에는 다음 필드가 있다고 하자.

```text
concert_id, perf_id, date, hall_id, base_price, internal_status, created_by, changed_at
```

업무 담당자가 빠르게 공연 기본 목록만 조회하면 된다면 Projection View `ZPV_CONCERT_BASIC`은 아래 필드만 노출할 수 있다.

```text
concert_id, perf_id, date, hall_id
```

ABAP에서 읽는 모습은 테이블 읽기와 거의 같다.

```abap
DATA: gt_basic TYPE STANDARD TABLE OF zpv_concert_basic,
      gs_basic TYPE zpv_concert_basic.

SELECT *
  FROM zpv_concert_basic
  INTO TABLE gt_basic.

LOOP AT gt_basic INTO gs_basic.
  WRITE: / gs_basic-concert_id,
           gs_basic-perf_id,
           gs_basic-date,
           gs_basic-hall_id.
ENDLOOP.
```

### 어떻게 확인하는가

SE11에서 Projection View를 확인할 때는 "줄어든 필드 목록"을 먼저 본다. basis table이 하나인지 확인하고, View Fields에 노출된 필드만 있는지 확인한다. 그 다음 Data Browser로 원본 테이블과 Projection View를 각각 조회한다.

확인 질문은 단순하다.

- 원본 테이블에는 `internal_status`가 보이는가.
- Projection View에는 `internal_status`가 빠져 있는가.
- 같은 key의 행 수는 유지되는가.
- 필드가 빠졌다고 해서 원본 테이블 데이터가 지워졌는가.

마지막 질문이 중요하다. Projection View에서 필드가 안 보인다고 해서 데이터가 사라진 것은 아니다. 그 View를 통해 노출하지 않을 뿐이다.

### 체험 설계

체험형 도구는 "필드 커튼" 시뮬레이터로 만든다.

화면 구성:

- 왼쪽: `zconcert` 원본 필드 전체 카드.
- 가운데: `Projection View Fields` 선택 영역.
- 오른쪽: 사용자가 보게 되는 결과 그리드.

조작:

- 필드 카드의 체크박스를 켜고 끄면 오른쪽 결과 그리드 컬럼이 즉시 바뀐다.
- `기술 필드 모두 숨기기` 버튼은 `created_by`, `changed_at`, `internal_status`를 한 번에 제외한다.
- `ABAP 구조 보기` 버튼은 현재 선택된 필드만 가진 `zpv_concert_basic` 구조 미리보기를 보여 준다.

피드백:

- 필드를 너무 적게 고르면 "업무 화면에서 행을 식별할 key 필드는 남겨야 합니다."
- 기술 필드를 모두 노출하면 "Projection View는 사용자가 볼 필요 없는 컬럼을 줄이는 데 유용합니다."
- basis table을 두 개로 늘리려 하면 "Projection View는 단일 basis table용입니다. 여러 테이블 결합은 Database View나 프로그램 JOIN을 검토합니다."

### 실수와 주의

Projection View를 "조건이 들어간 필터 View"로 착각하면 안 된다. 특정 `hall_id`만 보이게 하는 행 조건은 Projection View의 핵심 역할이 아니다. 이 레슨에서는 열을 줄이는 도구로만 이해한다.

또 다른 실수는 key 필드를 빼는 것이다. 업무 화면에서 어떤 행인지 식별할 수 없으면 조회 결과가 깔끔해 보여도 사용성이 떨어진다. 최소한 업무 식별에 필요한 key와 설명 필드는 남겨야 한다.

마지막으로 Projection View는 접근 권한 설계를 대신하지 않는다. "안 보이게 했으니 보안이 끝났다"가 아니다. 권한, 테이블 유지보수 허용, 프로그램 권한 체크는 별도 주제다. CH14에서는 필드 노출 설계 관점으로만 다룬다.

### 정리

Projection View는 단일 테이블에서 필요한 필드만 드러내는 DDIC View다. 데이터를 복사하지 않고, 테이블 행을 새 조건으로 걸러 내지도 않는다. 학습자는 이 레슨을 통해 "사용자에게 필요한 컬럼만 보여 주는 것도 설계"라는 감각을 얻어야 한다.

## CH14-L03 - Help View와 Search Help 연결

### 왜 필요한가

사용자는 코드값을 외우지 않는다. 공연 등록 화면에서 `P001`을 입력하라고 하면 개발자는 당연하다고 느낄 수 있지만, 업무 담당자는 "클래식 갈라가 어느 코드인지"를 찾아야 한다. F4 도움말은 이 간격을 줄인다. 사용자는 코드 일부나 설명 일부를 검색하고, 선택한 값이 입력 필드로 돌아온다.

CH09에서 Search Help의 기본 개념을 배웠다면, CH14-L03은 "Search Help가 읽을 원천을 어떻게 더 풍부하게 만들 것인가"를 다룬다. 단일 테이블만으로 충분하면 Search Help의 selection method가 테이블이면 된다. 하지만 코드 테이블과 설명 테이블을 함께 보여 주거나 보조 정보를 붙여야 한다면 Help View가 후보가 된다.

### 무엇인가

Help View는 Search Help에서 사용할 수 있는 DDIC table view다. 공식문서 기준으로 Help View는 Search Help용이며, ABAP SQL로 직접 읽는 대상이 아니다. 또한 Help View는 foreign key 기반으로 테이블을 묶고, primary table의 전체 내용을 보존하는 outer join 성격을 가진다.

이 차이는 초보자에게 매우 중요하다.

| 질문 | Database View | Help View |
| --- | --- | --- |
| ABAP SQL에서 읽는가 | 예 | 아니오 |
| 주 사용처 | 프로그램 조회 | F4 Search Help |
| 여러 테이블 결합 | inner join | primary table 보존 |
| 누락 설명 처리 | 짝 없으면 결과에서 빠질 수 있음 | primary table 값은 남고 보조 정보가 비어 보일 수 있음 |

예를 들어 `zperf`가 공연 코드와 기본명을 가지고 있고, `zperf_text`가 언어별 상세 설명을 가진다고 하자. F4에서는 코드, 공연명, 장르, 설명을 함께 보여 주고 싶다. 이때 Help View `ZHV_PERF`를 Search Help `ZSH_PERF`의 selection method로 연결할 수 있다.

```text
Search Help ZSH_PERF
  Selection Method: ZHV_PERF
  Import Parameter: PERF_ID
  Export Parameter: PERF_ID
  Display Fields: PERF_ID, PERF_NAME, GENRE, DESCRIPTION
```

### 어떻게 확인하는가

확인은 세 단계로 한다.

1. SE11에서 Help View `ZHV_PERF`를 Display한다. primary table이 무엇인지, secondary table이 foreign key로 연결되는지 확인한다.
2. Search Help `ZSH_PERF`를 Display한다. Selection Method가 `ZHV_PERF`인지 확인하고, parameter의 import/export 설정을 확인한다.
3. 테스트 화면이나 table maintenance 화면에서 `perf_id` 필드에 F4를 누른다. 제안 목록에 코드뿐 아니라 설명 필드가 함께 표시되는지 확인한다.

F4 결과 확인은 단순히 "창이 뜬다"로 끝내면 안 된다. 사용자가 입력한 검색어가 import parameter로 들어가는지, 선택한 행의 key가 export parameter로 돌아오는지 확인해야 한다. Search Help는 보기 좋게 목록을 보여 주는 기능이면서 동시에 화면 필드와 데이터를 주고받는 인터페이스다.

### 체험 설계

체험형 도구는 "F4 여행 경로"로 설계한다.

화면:

- 위쪽: 입력 필드 `공연 ID`.
- 가운데: Search Help 설정 패널.
- 아래쪽: F4 결과 팝업 시뮬레이션.

버튼:

- `F4 누르기`: Search Help selection method를 따라 Help View 결과를 팝업으로 보여 준다.
- `설명 테이블 누락`: secondary table 설명 행을 일부 제거한다.
- `Export 끄기`: 선택해도 입력 필드가 채워지지 않는 상태를 만든다.
- `Selection Method 바꾸기`: 단일 테이블과 Help View 결과를 비교한다.

상태와 피드백:

- 정상: "사용자는 설명을 보고 고르지만, 화면에는 key가 돌아옵니다."
- 설명 누락: "Help View는 F4용 보조 정보를 붙이는 데 유리합니다. primary table 값은 유지되고 보조 설명은 비어 보일 수 있습니다."
- Export 꺼짐: "F4 목록을 보는 것과 선택값을 화면에 돌려주는 것은 별도 설정입니다."
- 단일 테이블: "코드만 충분하면 Help View가 필요하지 않습니다. 설명과 보조 조건이 필요할 때 후보가 됩니다."

### 실수와 주의

Help View를 프로그램 조회용으로 쓰려고 하면 안 된다. 공식문서 기준으로 Help View는 ABAP SQL data source가 아니다. 프로그램에서 조회해야 하면 Database View, Projection View, 또는 ABAP SQL JOIN을 검토한다.

또 하나의 실수는 Search Help의 parameter를 대충 두는 것이다. 표시 필드가 많아도 export parameter가 맞지 않으면 사용자가 선택한 값이 화면에 돌아오지 않는다. import parameter가 잘못되면 사용자가 입력한 일부 조건이 검색에 반영되지 않는다.

마지막으로 F4 도움말을 너무 복잡하게 만들면 사용자가 더 헤맨다. 처음에는 코드, 대표명, 상태 정도로 충분하다. search help exit, 동적 제어, 권한별 목록 변경은 후속 심화 범위다.

### 정리

Help View는 F4 Search Help를 풍부하게 만들기 위한 View다. Database View처럼 프로그램에서 읽는 조회 View가 아니며, primary table을 기준으로 보조 정보를 붙여 사용자의 선택을 돕는다. 학습자는 "F4는 단순 팝업이 아니라 DDIC와 화면 필드가 연결된 데이터 흐름"이라는 감각을 가져야 한다.

## CH14-L04 - Maintenance View와 Foreign Key 기반 유지보수

### 왜 필요한가

마스터 데이터를 한 테이블씩 따로 관리하면 처음에는 단순해 보인다. 하지만 공연장, 좌석 등급, 가격 조건처럼 서로 연결된 데이터를 다룰 때는 한 테이블을 수정한 뒤 다른 테이블을 또 열어야 한다. 사용자는 어느 순서로 열어야 하는지, 어떤 key가 이어지는지 기억해야 하고, 잘못된 조합을 만들 가능성도 커진다.

Maintenance View는 관련 테이블을 하나의 유지보수 관점으로 묶기 위한 도구다. 핵심은 "조회용으로 예쁘게 합치는 것"이 아니라 "foreign key로 연결된 테이블의 내용을 표준 유지보수 흐름에서 일관되게 다루는 것"이다. 이 레슨은 Database View와 Maintenance View를 목적부터 분리한다.

### 무엇인가

Maintenance View는 extended table maintenance를 위한 DDIC table view다. 공식문서 기준으로 Maintenance View는 ABAP SQL로 읽는 대상이 아니며, SE54에서 maintenance dialog를 만들고 SM30, SM31 같은 Table View Maintenance 흐름에서 사용할 수 있다.

Maintenance View는 foreign key dependency가 특히 중요하다. 여러 테이블을 아무 조건으로나 마음대로 붙이는 것이 아니라, foreign key 관계를 통해 연결한다. primary table과 secondary table의 관계, cardinality, key field 포함 여부가 유지보수 가능성에 영향을 준다.

Database View와 Maintenance View를 분리해서 기억한다.

| 구분 | Database View | Maintenance View |
| --- | --- | --- |
| 핵심 목적 | 프로그램 조회용 공통 관점 | 표준 유지보수용 관점 |
| ABAP SQL 읽기 | 가능 | 대상 아님 |
| 연결 근거 | join condition | foreign key dependency |
| 사용 화면 | SELECT, Data Browser 등 | SE54, SM30, SM31 maintenance dialog |
| 설계 질문 | 어떤 필드를 읽을 것인가 | 어떤 데이터를 같이 관리할 것인가 |

예시:

```text
zconcert
  concert_id
  perf_id
  hall_id

zhall
  hall_id
  hall_name

foreign key
  zconcert-hall_id -> zhall-hall_id
```

공연 유지보수 화면에서 `hall_id`를 입력할 때 존재하지 않는 공연장 코드를 넣지 않게 하려면 foreign key와 input check가 필요하다. 더 나아가 관련 설명을 함께 보며 유지보수하려면 Maintenance View 설계를 검토할 수 있다.

### 어떻게 확인하는가

먼저 foreign key를 확인한다. SE11에서 foreign key table의 필드를 열고 Check Table과 field assignment를 본다. `zconcert-hall_id`가 `zhall-hall_id`를 참조하는지, data element와 type이 맞는지 확인한다.

그 다음 Maintenance View를 확인한다.

1. SE11에서 Maintenance View를 Display한다.
2. primary table과 secondary table을 확인한다.
3. join condition이 직접 입력된 임의 조건이 아니라 foreign key에서 온 조건인지 확인한다.
4. 모든 key field가 유지보수에 필요한 방식으로 포함되어 있는지 확인한다.
5. Maintenance Status가 실제 유지보수 목적과 맞는지 확인한다.

마지막으로 SM30 또는 SM31에서 maintenance dialog를 통해 열 수 있는지 확인한다. 열리지 않는다면 "View가 틀렸다"만 보지 말고, Display/Maintenance 설정, maintenance dialog 생성 여부, 권한, 활성화 상태를 함께 본다.

### 체험 설계

체험형 도구는 "Foreign Key로 문 열기"로 만든다.

화면:

- 왼쪽: `zconcert`와 `zhall` 테이블 카드.
- 가운데: foreign key 연결선.
- 오른쪽: Maintenance View 유지보수 화면 미리보기.

버튼:

- `FK 연결`: `zconcert-hall_id`와 `zhall-hall_id` 사이에 선을 만든다.
- `FK 제거`: 유지보수 View 생성 가능성을 낮추고 오류 메시지를 보여 준다.
- `존재하지 않는 Hall 입력`: input check 실패 상태를 보여 준다.
- `유지보수 화면 열기`: 설정이 모두 맞을 때만 SM30형 그리드를 활성화한다.

피드백:

- FK가 없으면 "Maintenance View는 테이블을 그냥 붙이는 도구가 아닙니다. DDIC의 관계 정보가 설계의 기준입니다."
- key field가 빠지면 "표준 유지보수는 어느 행을 바꿀지 알아야 합니다. 식별 필드가 빠지면 유지보수 안정성이 깨집니다."
- 화면이 열리면 "조회 View가 아니라 유지보수 흐름이 만들어졌습니다. 이제 입력, 변경, 삭제 가능 범위는 설정과 권한을 함께 봐야 합니다."

### 실수와 주의

가장 큰 실수는 Maintenance View를 left outer join 조회 대안으로 설명하는 것이다. CH14 v2에서는 이 설명을 쓰지 않는다. 수동 확인한 공식문서 기준으로 Help View가 Search Help에서 outer join 성격을 가지며, Maintenance View는 extended table maintenance를 위한 객체다.

두 번째 실수는 foreign key를 단순한 문서용 선으로 보는 것이다. 공식문서 기준으로 foreign key dependency는 input check, input help, view 생성에서 평가된다. 반대로 ABAP SQL 자체에서는 foreign key를 자동으로 평가하지 않는다. 즉 DDIC 화면과 표준 도구에서 강한 의미를 갖지만, SELECT 조건이 자동으로 안전해지는 것은 아니다.

세 번째 실수는 유지보수 가능 범위를 권한 없이 판단하는 것이다. Maintenance View와 dialog가 있어도 현재 사용자의 authorization이 부족하면 화면을 열거나 저장할 수 없다. 수업에서는 권한 상세 설계로 들어가지 않고, "표준 유지보수는 설정과 권한이 함께 필요하다"까지만 고정한다.

### 정리

Maintenance View는 조회 편의보다 유지보수 흐름을 위해 존재한다. foreign key로 연결된 테이블을 표준 Table View Maintenance에서 함께 다룰 수 있게 만들며, ABAP SQL의 일반 data source로 읽는 View가 아니다. 이 레슨의 핵심은 "View라는 이름이 같아도 목적이 다르면 완전히 다른 도구"라는 점이다.

## CH14-L05 - Table Maintenance Generator와 SM30

### 왜 필요한가

개발자가 SE11의 Create Entries로 마스터 데이터를 직접 넣는 방식은 학습 초반에는 편하다. 하지만 실무에서는 개발자가 매번 운영 값을 대신 넣어 줄 수 없다. 부서 코드, 공연장 코드, 가격 구간, 상태 코드처럼 업무 담당자가 관리해야 하는 기준 데이터는 표준 화면으로 유지보수할 수 있어야 한다.

Table Maintenance Generator, 흔히 TMG라고 부르는 절차는 테이블이나 유지보수 View에 대해 표준 유지보수 화면을 생성하는 과정이다. 사용자는 SM30에서 객체 이름을 입력하고 Maintain을 눌러 데이터를 관리한다. 이 레슨은 "SM30은 마법 주소가 아니라, DDIC 설정과 생성된 maintenance dialog가 있어야 열리는 표준 통로"라는 점을 확실히 만든다.

### 무엇인가

TMG는 테이블 또는 유지보수 View의 표준 maintenance dialog를 생성하는 절차다. SE11에서 Utilities 경로로 들어가거나 SE54 관련 기능을 통해 관리한다. 생성 과정에서 Authorization Group, Function Group, Screen Number, Maintenance Type 같은 항목을 정한다.

입문자가 먼저 이해해야 하는 항목은 다음이다.

| 항목 | 의미 | 초보자 확인 질문 |
| --- | --- | --- |
| Authorization Group | 누가 유지보수할 수 있는지 묶는 기준 | 이 값이 비어도 되는 교육용 상황인가 |
| Function Group | 생성 화면과 로직이 들어갈 그룹 | 같은 업무군으로 묶는가 |
| Screen Number | 생성될 유지보수 화면 번호 | one step, two step에 맞게 생성됐는가 |
| Maintenance Type | 목록과 상세를 한 화면 또는 분리 화면으로 볼지 | 데이터가 단순한가, 상세가 필요한가 |
| Recording Routine | 변경 데이터가 transport request로 잡힐지 | customizing 성격인가, local 성격인가 |

One Step과 Two Step은 화면 경험 차이다.

- One Step: 목록 그리드에서 바로 입력하고 수정한다. 코드성 데이터처럼 필드가 적을 때 적합하다.
- Two Step: 먼저 목록을 보고, 선택한 행의 상세 화면으로 들어간다. 필드가 많거나 설명을 길게 관리할 때 적합하다.

### 어떻게 확인하는가

TMG 확인은 "생성 전", "생성 중", "생성 후"로 나눈다.

생성 전:

- 테이블이 활성화되어 있는가.
- Delivery Class와 Display/Maintenance 설정이 유지보수 목적과 맞는가.
- key field와 외래키가 올바른가.
- 테스트 데이터가 업무적으로 구분 가능한가.

생성 중:

- Authorization Group을 교육용으로 둘 것인지 실제 그룹으로 둘 것인지 확인한다.
- Function Group 이름이 기존 객체와 충돌하지 않는지 확인한다.
- One Step 또는 Two Step이 데이터 형태와 맞는지 확인한다.

생성 후:

- SM30에서 테이블 또는 View 이름을 입력하고 Maintain을 실행한다.
- 새 행을 만들고 저장했을 때 메시지와 데이터 반영을 확인한다.
- 다시 SM30으로 들어가 저장된 행이 보이는지 확인한다.
- Data Browser에서 행이 실제 테이블에 반영되었는지 조회한다.

### 체험 설계

체험형 도구는 "SM30 문이 열리기까지" 체크리스트 시뮬레이터로 만든다.

상단 상태 막대:

```text
Table Active -> Display/Maintenance Allowed -> TMG Generated -> Authorization OK -> SM30 Open
```

버튼:

- `테이블 활성화`: 첫 단계 체크.
- `유지보수 허용`: Display/Maintenance 설정을 켠다.
- `TMG 생성`: Function Group, Screen Number, Maintenance Type 입력 패널을 연다.
- `SM30 실행`: 모든 조건이 맞을 때 유지보수 그리드를 보여 준다.
- `권한 실패`: 같은 설정에서 현재 사용자의 권한만 실패시킨다.

데이터:

```text
hall_id hall_name capacity
H01     블루홀    300
H02     그린홀    180
```

피드백:

- TMG 전 SM30 실행: "SM30은 표준 유지보수 dialog가 있어야 제대로 열립니다."
- 유지보수 허용 꺼짐: "DDIC의 Display/Maintenance 설정이 표준 도구 사용 가능성을 결정합니다."
- 권한 실패: "객체 설정이 맞아도 사용자 권한이 부족하면 유지보수할 수 없습니다."
- 저장 성공: "업무 담당자는 ABAP 프로그램 없이도 표준 화면에서 기준 데이터를 관리할 수 있습니다."

### 실수와 주의

첫 번째 실수는 개발 시스템에서 되는 것을 운영에서도 당연히 된다고 보는 것이다. 운영에서는 권한, 클라이언트, transport 정책, table logging 정책이 다를 수 있다. CH14에서는 운영 직접 변경 절차를 가르치지 않고, 표준 유지보수 화면의 구조만 다룬다.

두 번째 실수는 Delivery Class와 Recording Routine을 무시하는 것이다. customizing table처럼 시스템 간 이동이 필요한 데이터와 local data처럼 이동하지 않는 데이터는 관리 정책이 다르다. 공식문서에서도 Delivery Class가 table data transport와 extended table maintenance에 영향을 준다고 설명한다.

세 번째 실수는 TMG를 만들고 끝내는 것이다. 반드시 SM30에서 열어 보고, 저장해 보고, 다시 조회해야 한다. 생성 성공 메시지와 실제 유지보수 가능 여부는 같은 말이 아니다.

### 정리

TMG와 SM30은 업무 담당자가 기준 데이터를 표준 화면에서 관리하게 해 주는 classic DDIC 유지보수 흐름이다. 핵심은 화면을 생성하는 절차 자체가 아니라, 테이블 활성화, 유지보수 허용 설정, 생성된 dialog, 권한, transport 정책이 함께 맞아야 한다는 점이다.

## CH14-L06 - View Cluster로 관련 유지보수 묶기

### 왜 필요한가

테이블 하나만 관리할 때는 SM30 하나로 충분하다. 하지만 공연 업무를 생각하면 공연장, 공연장별 좌석 등급, 등급별 가격, 공연별 좌석 배정이 서로 이어진다. 사용자가 테이블 이름을 네 개 외우고, 각각 다른 순서로 열어야 한다면 유지보수 실수가 늘어난다.

View Cluster는 관련 유지보수 객체를 계층으로 묶어 사용자가 업무 구조대로 따라가게 하는 방법이다. 이 레슨은 "데이터 모델의 관계를 유지보수 화면의 탐색 구조로 바꾼다"는 관점에서 설명한다.

### 무엇인가

View Cluster는 여러 maintenance view 또는 table maintenance 객체를 논리적 계층으로 묶어 관리하게 하는 classic 유지보수 구성이다. 관련 객체가 parent-child 구조를 가질 때 유용하다. 공식문서의 Display/Maintenance 설정 설명에서도 maintenance dialogs가 View Cluster Maintenance와 연결될 수 있음을 확인할 수 있다.

공연 예시는 다음 구조로 표현할 수 있다.

```text
공연장 ZHALL
  좌석등급 ZSEAT_GRADE
    등급별가격 ZGRADE_PRICE
```

사용자는 먼저 공연장을 고르고, 그 공연장 아래의 좌석 등급을 보며, 선택한 좌석 등급의 가격을 관리한다. 테이블을 따로 여는 것보다 업무 흐름에 가깝다.

View Cluster가 필요한 경우와 아닌 경우를 구분한다.

| 상황 | View Cluster 후보 |
| --- | --- |
| 단일 코드 테이블 하나만 관리 | 아님 |
| parent table을 고른 뒤 child table을 관리 | 후보 |
| 세 개 이상 유지보수 객체가 계층으로 이어짐 | 후보 |
| 조회만 필요하고 유지보수는 하지 않음 | 아님 |
| 사용자가 테이블 이름을 몰라도 업무 순서로 따라가야 함 | 후보 |

### 어떻게 확인하는가

SE54에서 View Cluster를 확인할 때는 객체 목록만 보지 않는다. 계층 구조와 navigation dependency를 본다.

확인 순서:

1. root maintenance object가 무엇인지 확인한다.
2. 하위 object가 어떤 foreign key 또는 key 관계로 연결되는지 확인한다.
3. 각 object의 maintenance dialog가 생성되어 있는지 확인한다.
4. View Cluster Maintenance 실행 시 상위 행을 선택해야 하위 목록이 좁혀지는지 확인한다.
5. 하위 데이터를 저장한 뒤 각 원본 테이블에 반영되는지 확인한다.

입문자에게는 "상위에서 선택한 값이 하위 유지보수 화면의 자동 조건이 된다"는 경험이 중요하다. 이것이 단순히 여러 SM30 링크를 모아 둔 것과 View Cluster의 차이다.

### 체험 설계

체험형 도구는 "계층 유지보수 지도"로 만든다.

화면:

- 왼쪽 트리: 공연장 -> 좌석등급 -> 가격.
- 오른쪽 패널: 선택한 노드의 유지보수 그리드.
- 아래 로그: 현재 선택 key와 하위 필터 조건.

버튼:

- `H01 선택`: 하위 좌석등급이 H01 기준으로 좁혀진다.
- `등급 추가`: 선택된 공연장 아래에 새 등급을 추가한다.
- `부모 없이 하위 추가`: 부모 key가 없어 실패하는 상태를 보여 준다.
- `단일 SM30 모드`: 각 테이블을 따로 열 때 사용자가 직접 key를 입력해야 하는 모습을 보여 준다.

피드백:

- 부모 선택 전 하위 추가: "View Cluster는 업무 계층을 따라 유지보수합니다. 하위 데이터는 상위 key 맥락이 필요합니다."
- 단일 SM30 모드: "테이블 이름과 key를 사용자가 기억해야 하므로 오류 가능성이 커집니다."
- 정상 저장: "유지보수 화면의 트리는 데이터 관계를 사용자가 따라가기 쉬운 순서로 바꿉니다."

### 실수와 주의

View Cluster를 모든 테이블에 적용하면 오히려 복잡해진다. 단일 코드성 테이블 하나라면 SM30이 더 단순하다. View Cluster는 관련 객체가 여러 개이고 사용자가 상위에서 하위로 내려가는 업무 흐름을 가질 때 의미가 있다.

두 번째 실수는 foreign key나 key 설계를 대충 하고 화면 계층만 만들려는 것이다. 화면이 계층으로 보여도 데이터 관계가 약하면 잘못된 하위 데이터가 생길 수 있다. View Cluster는 데이터 모델의 질을 감추지 못한다.

세 번째 실수는 View Cluster를 조회 리포트 대체물로 생각하는 것이다. View Cluster는 유지보수 경험을 묶는 도구다. 분석, 통계, 출력 리포트는 ABAP 프로그램, Database View, CDS 같은 별도 선택지가 있다.

### 정리

View Cluster는 관련 유지보수 객체를 업무 계층으로 묶는다. 사용자는 상위 데이터를 고르고 하위 데이터를 좁혀 가며 관리한다. 이 레슨의 핵심은 "테이블 구조를 사용자 작업 순서로 번역하는 유지보수 설계"다.

## CH14-L07 - SE16N Data Browser로 데이터 확인하기

### 왜 필요한가

SM30에서 데이터를 저장했다면 반드시 확인해야 한다. 초보자는 저장 성공 메시지만 보고 끝내기 쉽다. 하지만 실제로 어떤 테이블에 어떤 값이 들어갔는지, View에서 어떻게 보이는지, key가 중복되지 않았는지, foreign key 값이 예상대로 들어갔는지 확인해야 한다.

SE16N은 현업에서 자주 쓰는 데이터 확인 도구다. CH14에서는 SE16N을 "데이터를 빠르게 보는 도구"로만 다룬다. 유지보수 화면의 대체물이 아니며, 운영 데이터 직접 편집 방법을 가르치는 장도 아니다.

### 무엇인가

Data Browser 계열 도구는 DDIC database table content를 확인하는 ABAP Workbench 도구다. 공식 ABAP Keyword Documentation의 glossary는 Data Browser를 SE16으로 설명한다. 원본 커리큘럼의 SE16N은 많은 시스템에서 더 자주 접하는 화면이므로, 이 레슨에서는 SE16N을 데이터 조회 경험의 대표로 다룬다.

SE16N에서 학습자가 확인해야 할 기본 요소는 네 가지다.

| 화면 요소 | 의미 | 확인 질문 |
| --- | --- | --- |
| Table | 조회할 DDIC table 또는 일부 view 이름 | 정확한 객체명을 입력했는가 |
| Selection Criteria | 조회 조건 | 전체 조회가 필요한가, key로 좁힐 것인가 |
| Number of Entries | 행 수 제한 | 너무 많은 데이터를 가져오지 않는가 |
| Output List | 결과 그리드 | key, 설명, 생성 값이 예상과 맞는가 |

### 어떻게 확인하는가

SM30에서 `ZHALL`에 `H03` 공연장을 추가했다고 하자. SE16N 확인 절차는 다음과 같다.

1. SE16N을 실행한다.
2. Table에 `ZHALL`을 입력한다.
3. Selection Criteria에 `hall_id = H03`을 넣는다.
4. Execute로 결과를 확인한다.
5. `hall_name`, `capacity`가 SM30에서 저장한 값과 같은지 확인한다.
6. 이어서 `ZV_CONCERT` 같은 Database View도 조회해, join 결과에서 해당 공연장이 어떻게 보이는지 확인한다.

확인 결과가 없으면 바로 "저장이 안 됐다"라고 결론 내리지 않는다. 클라이언트, selection condition, key 오타, transport/client 차이, 권한에 따른 표시 제한을 순서대로 본다.

### 체험 설계

체험형 도구는 "저장 후 추적기"로 만든다.

화면:

- 왼쪽: SM30 저장 화면.
- 가운데: 저장 로그.
- 오른쪽: SE16N 조회 화면.

버튼:

- `SM30에서 H03 저장`: 원본 테이블에 새 행을 만든다.
- `조건 없이 조회`: 전체 목록과 경고 배지를 보여 준다.
- `Key로 조회`: `hall_id = H03` 조건을 적용한다.
- `View로 확인`: `ZV_CONCERT`에서 관련 행이 어떻게 보이는지 보여 준다.
- `오타 조건`: `H30`으로 조회해 0건 상태를 만든다.

피드백:

- 조건 없이 조회: "학습 환경에서는 가능하지만 실무에서는 필요한 조건으로 좁히는 습관이 중요합니다."
- 0건: "0건은 저장 실패, 조건 오타, 클라이언트 차이, 권한 문제 중 하나일 수 있습니다. 바로 단정하지 않습니다."
- View 조회: "원본 테이블과 View 결과는 같은 질문이 아닙니다. View는 결합 조건에 따라 행이 달라질 수 있습니다."

### 실수와 주의

SE16N을 유지보수 화면으로 가르치면 안 된다. CH14의 유지보수 주 흐름은 TMG와 SM30이다. SE16N은 확인용으로 제한한다.

두 번째 실수는 전체 조회를 습관화하는 것이다. 작은 학습 테이블에서는 문제가 없어 보여도, 운영 테이블 전체 조회는 성능과 보안 면에서 위험하다. 항상 key나 날짜 조건으로 좁히는 습관을 만든다.

세 번째 실수는 View 결과만 보고 원본 데이터를 판단하는 것이다. Database View는 inner join 조건 때문에 원본에 있는 행이 결과에서 빠질 수 있다. "원본 테이블 확인"과 "View 확인"을 분리해야 한다.

### 정리

SE16N은 저장 후 데이터를 빠르게 확인하는 실무 친화 도구다. 하지만 CH14에서는 조회와 검증에만 사용한다. 표준 유지보수는 SM30, 관계형 유지보수는 Maintenance View와 View Cluster, 빠른 확인은 SE16N이라는 역할 구분을 세운다.

## CH14-L08 - Classic View와 CDS의 경계

### 왜 필요한가

학습자가 Database View, Projection View, Help View, Maintenance View를 배우고 나면 "현업에서는 CDS를 쓴다던데 이건 낡은 건가요?"라는 질문이 나온다. 이 질문을 피하면 학습자는 classic DDIC View를 배우는 이유를 잃고, 너무 빨리 CDS로 넘어가면 CH14의 기초가 흐려진다.

이 레슨은 CDS를 자세히 가르치지 않는다. 대신 classic DDIC View가 어떤 문제를 해결했고, CDS가 나중에 어떤 방향으로 확장되는지 경계만 잡는다. 초보자에게 필요한 것은 최신 용어를 많이 듣는 것이 아니라, 지금 배우는 도구가 어디까지 유효하고 언제 다음 도구를 만나는지 아는 것이다.

### 무엇인가

Classic DDIC View는 SE11 중심의 Dictionary 객체다. Database View와 Projection View는 ABAP SQL data source로 읽을 수 있고, Help View와 Maintenance View는 각각 Search Help와 Table View Maintenance 쪽 목적을 가진다.

CDS View Entity는 CDS DDL로 정의되는 현대적 데이터 모델링 객체다. 공식문서 기준으로 CDS View Entity는 select statement로 구현되고, DDL source code에서 관리된다. 하지만 CH14에서는 문법을 쓰지 않는다. CH22에서 CDS를 다룰 때, classic View와 CDS의 차이를 다시 체계적으로 비교한다.

경계 비교:

| 항목 | Classic DDIC View | CDS View Entity |
| --- | --- | --- |
| 학습 시점 | CH14 | CH22 |
| 주요 도구 | SE11, SE54, SM30 | ADT와 CDS DDL |
| 기본 감각 | 테이블 구조를 DDIC에서 보여 주거나 유지보수 | 데이터 모델을 소스 기반으로 선언 |
| 표현력 | classic Dictionary 범위 | association, annotation 등 확장 가능 |
| CH14 사용 범위 | 실제 학습 대상 | 이름과 방향만 예고 |

### 어떻게 확인하는가

CH14에서는 CDS 객체를 만들지 않는다. 대신 아래 확인 질문으로 경계를 고정한다.

- 지금 만드는 객체가 SE11의 Dictionary View인가.
- ABAP SQL로 읽는 대상인가, Search Help나 Maintenance Dialog에 쓰는 대상인가.
- CDS 문법을 쓰지 않아도 현재 레슨 목표를 달성할 수 있는가.
- CDS 설명이 필요하다면 CH22에서 다시 다룰 내용인가.

강의자는 학습자가 CDS를 질문하면 짧게 답한다. "맞습니다. 현대 ABAP 데이터 모델링에서는 CDS가 중요합니다. 다만 지금은 classic DDIC View가 어떤 문제를 해결했는지 먼저 잡고, CH22에서 CDS를 정식으로 들어갑니다."

### 체험 설계

체험형 도구는 "타임라인 경계 카드"로 만든다.

카드:

- `CH13 Open SQL JOIN`: 프로그램 안에서 결합한다.
- `CH14 Database View`: DDIC에 공통 조회 관점을 만든다.
- `CH14 TMG/SM30`: 표준 유지보수 화면을 만든다.
- `CH22 CDS`: 소스 기반 데이터 모델링으로 확장한다.

버튼:

- `지금 해야 할 일`: CH14 학습 대상 카드만 밝게 표시한다.
- `나중에 배울 일`: CDS, RAP, OData, Fiori 카드를 잠금 상태로 표시한다.
- `경계 위반 보기`: CH14 실습에 CDS 문법을 끼워 넣으면 경고를 보여 준다.

피드백:

- "CDS는 중요하지만 CH14의 목표는 classic DDIC View와 표준 유지보수 흐름입니다."
- "미래 개념을 한 문장으로 예고할 수는 있지만, 코드와 실습은 해당 챕터에서 다룹니다."

### 실수와 주의

첫 번째 실수는 classic View를 배우는 시간을 "옛날 것 암기"로 만드는 것이다. CH14의 진짜 목적은 테이블 관계, view field, 유지보수 허용, foreign key, F4, standard maintenance라는 기초 감각을 만드는 것이다. 이 감각은 CDS를 배울 때도 사라지지 않는다.

두 번째 실수는 CDS를 너무 일찍 코드로 보여 주는 것이다. annotation, association, access control, RAP 같은 단어가 한꺼번에 나오면 CH14 학습자는 현재 레슨의 핵심을 놓친다. CH14에서는 CDS를 "나중에 더 강력한 모델링 방식으로 만난다"까지만 둔다.

세 번째 실수는 모든 classic View를 CDS로 대체한다고 단순화하는 것이다. 시스템 릴리스, 기존 자산, 표준 유지보수 화면, Search Help, 운영 정책에 따라 classic 객체는 계속 이해해야 한다.

### 정리

CH14는 classic DDIC View와 유지보수 객체의 장이다. CDS는 CH22에서 정식으로 다룰 현대적 데이터 모델링 도구다. 이 레슨의 핵심은 "지금 배울 것과 나중에 배울 것을 구분해 학습 부하를 줄이는 것"이다.

## CH14-L09 - 실습: 공연 등록 화면과 조회 View 연결

### 왜 필요한가

지금까지 배운 내용을 각각 따로 알면 실무 감각이 생기지 않는다. Database View는 조회에 쓰이고, Projection View는 필드 노출을 줄이며, Help View는 F4를 돕고, Maintenance View와 TMG는 유지보수 화면을 만든다. L09는 이 도구들을 "공연 등록과 확인"이라는 하나의 흐름으로 묶는다.

학습자는 이 실습에서 개발자가 직접 데이터를 만지는 흐름에서 벗어나, 업무 담당자가 표준 화면에서 공연을 등록하고, 개발자는 View와 조회 프로그램으로 그 결과를 확인하는 구조를 경험한다.

### 무엇인가

실습 목표는 세 가지다.

1. `ZCONCERT`를 SM30으로 유지보수할 수 있게 한다.
2. `ZV_CONCERT` Database View로 공연과 공연명 정보를 함께 조회한다.
3. `PERF_ID` 입력에는 Search Help 또는 F4 흐름을 연결해 코드 입력 실수를 줄인다.

실습 데이터 모델:

```text
ZPERF
  perf_id
  perf_name

ZCONCERT
  concert_id
  perf_id
  date
  hall_id

ZV_CONCERT
  ZCONCERT joined with ZPERF by perf_id
  fields: concert_id, perf_id, perf_name, date, hall_id
```

classic ABAP 확인 리포트:

```abap
DATA: gt_concert TYPE STANDARD TABLE OF zv_concert,
      gs_concert TYPE zv_concert.

SELECT concert_id perf_id perf_name date hall_id
  FROM zv_concert
  INTO CORRESPONDING FIELDS OF TABLE gt_concert.

LOOP AT gt_concert INTO gs_concert.
  WRITE: / gs_concert-concert_id,
           gs_concert-perf_id,
           gs_concert-perf_name,
           gs_concert-date,
           gs_concert-hall_id.
ENDLOOP.
```

이 코드는 CH14의 경계에 맞게 단순 조회만 한다. 데이터 생성과 유지보수는 SM30 흐름에서 수행하고, 리포트는 결과 확인만 담당한다.

### 어떻게 확인하는가

실습 확인은 성공 경로와 실패 경로를 모두 둔다.

성공 경로:

1. `ZPERF`에 `P001`, `클래식 갈라`가 존재하는지 확인한다.
2. `ZCONCERT`의 TMG가 생성되어 있는지 확인한다.
3. SM30에서 `ZCONCERT`를 열고 `C001`, `P001`, 날짜, 공연장을 입력한다.
4. 저장 후 SE16N에서 `ZCONCERT`를 key 조건으로 조회한다.
5. `ZV_CONCERT`를 조회해 `perf_name`이 함께 보이는지 확인한다.
6. ABAP 확인 리포트를 실행해 같은 데이터가 출력되는지 확인한다.

실패 경로:

1. `P999`처럼 존재하지 않는 `perf_id`를 입력한다.
2. foreign key input check 또는 F4 선택 흐름이 이를 막는지 확인한다.
3. 강제로 기준 정보가 누락된 상태를 만들었다면 `ZV_CONCERT` 결과에서 행이 사라질 수 있음을 관찰한다.
4. SM30이 열리지 않으면 TMG 생성 여부, Display/Maintenance 설정, 권한을 순서대로 확인한다.

### 체험 설계

최종 실습 시뮬레이터는 "공연 등록 콘솔"로 만든다.

탭:

- `기준 데이터`: `ZPERF`, `ZHALL` seed 데이터를 보여 준다.
- `SM30 등록`: `ZCONCERT` 유지보수 화면을 모사한다.
- `F4 선택`: `perf_id` 입력 시 Search Help 팝업을 보여 준다.
- `SE16N 확인`: 원본 테이블 결과를 key 조건으로 보여 준다.
- `View 확인`: `ZV_CONCERT` 결과를 보여 준다.
- `ABAP 출력`: classic SELECT 리포트 결과를 보여 준다.

버튼:

- `F4로 공연 선택`: 공연 코드 직접 입력 대신 목록에서 선택한다.
- `저장`: `ZCONCERT`에 행을 반영하고 저장 메시지를 보여 준다.
- `원본 확인`: SE16N 탭으로 이동해 key 조회를 수행한다.
- `View 확인`: Database View 결과에서 공연명이 붙는지 확인한다.
- `기준 삭제`: `ZPERF` 기준 데이터를 제거해 inner join 누락 상황을 만든다.
- `TMG 미생성`: SM30이 열리지 않는 오류 흐름을 보여 준다.

데이터 상태:

```text
state.ready
  ZPERF has P001
  ZCONCERT is empty
  TMG generated

state.saved
  ZCONCERT has C001/P001
  ZV_CONCERT shows C001 with perf_name

state.missing_master
  ZCONCERT has C009/P999
  ZV_CONCERT does not show C009

state.no_tmg
  ZCONCERT exists
  SM30 maintain button disabled
```

피드백:

- F4 선택 성공: "사용자는 설명을 보고 고르고, 시스템은 key를 저장합니다."
- 저장 성공: "SM30은 업무 담당자용 표준 유지보수 통로입니다. 개발자는 확인 리포트로 결과를 검증합니다."
- View 누락: "Database View는 여러 테이블이면 inner join입니다. 기준 데이터가 없으면 조회 결과에서 사라질 수 있습니다."
- TMG 미생성: "테이블이 있다고 SM30이 자동으로 준비되는 것은 아닙니다. maintenance dialog 생성과 설정을 확인합니다."

### 실수와 주의

첫 번째 실수는 실습을 "화면 클릭 순서"로만 끝내는 것이다. 클릭 순서보다 중요한 것은 데이터가 어디에 저장되고, 어떤 View에서 어떻게 보이며, 어떤 설정이 없을 때 어디서 막히는지 설명할 수 있는 능력이다.

두 번째 실수는 View 결과만 보고 저장 성공을 판단하는 것이다. View는 inner join 조건 때문에 원본 테이블의 일부 행을 숨길 수 있다. 저장 확인은 원본 테이블과 View를 따로 해야 한다.

세 번째 실수는 F4를 편의 기능으로만 보는 것이다. F4는 사용자가 잘못된 코드를 입력하지 않도록 돕고, 설명을 보고 정확한 key를 선택하게 해 주는 데이터 품질 장치다.

### 정리

CH14 최종 실습은 DDIC View와 표준 유지보수 흐름을 하나로 묶는다. 업무 담당자는 SM30으로 기준 데이터를 관리하고, F4로 올바른 key를 선택하며, 개발자는 SE16N과 ABAP 확인 리포트로 결과를 검증한다. 이 실습을 끝낸 학습자는 "테이블을 만드는 것"을 넘어 "테이블을 업무 화면과 조회 구조로 연결하는 것"을 설명할 수 있어야 한다.

## CH14 마무리 학습 흐름

CH14의 전체 흐름은 다음 문장으로 정리된다.

```text
테이블 관계를 이해한다
-> 조회 관점은 Database View 또는 Projection View로 정리한다
-> F4 선택 경험은 Search Help와 Help View로 보강한다
-> 업무 데이터 유지보수는 TMG, SM30, Maintenance View로 준비한다
-> 관련 유지보수는 View Cluster로 묶는다
-> 저장 결과는 SE16N과 확인 리포트로 검증한다
-> CDS는 CH22에서 modern data modeling으로 확장한다
```

학습자가 CH14를 끝내고 답할 수 있어야 하는 질문:

1. Database View와 Open SQL JOIN은 언제 선택이 갈리는가.
2. Projection View는 왜 단일 테이블 필드 노출 제한에 적합한가.
3. Help View는 왜 ABAP SQL 조회용이 아니라 Search Help용인가.
4. Maintenance View는 왜 foreign key와 maintenance dialog가 중요한가.
5. SM30이 열리지 않을 때 무엇을 순서대로 확인해야 하는가.
6. View Cluster가 단순 SM30 모음과 다른 이유는 무엇인가.
7. SE16N으로 확인할 때 왜 조건 조회와 원본/View 분리 확인이 필요한가.
8. CDS를 CH14에서 깊게 다루지 않는 이유는 무엇인가.

CH14의 성공 기준은 화면 이름을 외우는 것이 아니다. 학습자가 "이 데이터는 누가 관리하고, 어떤 화면에서 관리하며, 어떤 View로 조회하고, 어떤 도구로 확인할 것인가"를 스스로 설명할 수 있으면 이 장의 목표를 달성한 것이다.
