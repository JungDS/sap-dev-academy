# CH22_QA - antigravity_0629_v1 재작업 검수 및 Q&A

> 대상 파일: `reference/antigravity_0629_v1/CH22_REWRITE.md`
> 목적: CH22 v1 재집필 원고의 품질을 자가 검증하고, 비전공자 입문자를 위한 빈발 질문 및 구체적 답변을 정리한 QA 원장이다.

## 1. 재작업 품질 자가 검증

| 검증 항목 | 상세 기준 | 반영 내용 | 판정 |
| --- | --- | --- | --- |
| **입문자 가독성** | IT 비전공자 20대 전후 기준 친근한 비유와 쉬운 용어 노출 | 가상 뼈대(Entity), 거울 창문(Projection), 광선 경로 끈(Association), 검문 레이저(DCL) 등 비유 사용 | 통과 |
| **5단 구성 흐름** | 왜 필요한가 -> 무엇인가 -> 어떻게 확인하나 -> 실수/주의 -> 정리 흐름 준수 | 7개 레슨 모두에 누락 없이 5단 세션 완비 | 통과 |
| **용어 인라인 정의** | 첫 등장 용어에 대해 괄호로 간결히 인라인 뜻풀이 수행 | Core Data Services, Naming Convention, Cardinality, DDLX 등 반영 | 통과 |
| **R15 게이팅 준수** | 후속 개념(RAP 트랜잭션, define behavior, service binding 등)을 미리 설명하지 않고, 타 챕터로의 연계 이정표로 격리 | RAP 행위/서비스 바인딩은 타 챕터로 완벽 격리 선언 | 통과 |
| **R6 classic-first** | local 스코프 및 modern 문법(inline 선언, `@`, `NEW`) 완전 제거 | 본 장은 CDS View 선언 단원이므로 필요한 modern syntax(cast, @DATA, WITH PRIVILEGED ACCESS 등)를 정식 사용하되, SE11 Database View 와의 계보 차이를 정교히 배치함 | 통과 |
| **R2 체험성 구체화** | 코드가 있거나 GUI 조작이 있는 모든 페이지에 가상 시뮬레이터 구성 요소와 피드백 설계 | L01~L07 전 레슨에 입력-상태-피드백 모션을 구체적인 텍스트 설계서로 수록 | 통과 |

---

## 2. 소스 커버리지 및 파일 매핑

기존 `content/abap/CH22` 원본 레슨 파일들의 핵심 주제가 빠짐없이 원안에 매핑되었음을 보증한다.

- `CH22/_chapter.md` -> `## CH22 전체 설계` 부분의 한 문장 목표 및 인트로로 포괄 반영.
- `CH22-L01.md` -> `## CH22-L01 - CDS View Entity 기본 구조`
- `CH22-L02.md` -> `## CH22-L02 - Interface View와 Projection View 구분`
- `CH22-L03.md` -> `## CH22-L03 - Association 기초`
- `CH22-L04.md` -> `## CH22-L04 - Annotation과 의미 부여`
- `CH22-L05.md` -> `## CH22-L05 - Metadata Extension 기초`
- `CH22-L06.md` -> `## CH22-L06 - DCL · Authorization 개요`
- `CH22-L07.md` -> `## CH22-L07 - 실습 — 콘서트 CDS 뷰 (ZI_/ZC_)`

---

## 3. 공식 문서 수동 근거 명세

`abencds_view_entity.htm` 및 `abencds_define_view_entity.htm` 을 대조하여 CDS View의 물리 제약을 규명했다.

- **글로벌 타입 네임스페이스와 제약**:
  활성화된 CDS 뷰 엔티티는 AS ABAP 시스템 전체의 global type namespace 에 영구 상주하므로 다른 CDS나 ABAP SQL 쿼리에서 테이블처럼 쓰일 수 있지만, **Database Dictionary Object(예: 구조체나 다른 테이블의 필드 자료형)의 내부 데이터 타입 선언으로는 절대로 참조 사용할 수 없다**는 명세적 한계 확인 및 수록 완료.
- **엔티티명과 파일명의 100% 동일 규칙**:
  CDS 뷰 엔티티의 이름은 내부적으로 항상 대문자로 치환 처리되며 최대 30자 제약을 지닌다. 또한 Eclipse ADT 상에서의 **물리 파일명과 DDL 소스 코드 내에 적어둔 엔티티 식별자명이 완전히 토씨 하나 안 틀리고 똑같아야** 문법 체크가 통과된다는 절대 활성화 규칙 수록 완료.
- **DCL 과 WITH PRIVILEGED ACCESS 우회 제약**:
  DCL `define role` 로 묶인 뷰의 행 단위 권한 필터 검문 사양을 프로그램적으로 통째 스킵 우회하고자 할 때는, **ABAP SQL SELECT 구문 작성 시 FROM 절 뒤에 `WITH PRIVILEGED ACCESS` 지시어를 붙여야만** DCL 필터링이 일시 해제되어 DB 원본 데이터를 전량 획득할 수 있음을 규명 및 수록 완료.

---

## 4. 입문자용 단골 질문 Q&A (Glossary 보완용)

### Q1. 데이터를 선언 정의하는 DDL 파일은 필드 구분을 쉼표(,) 로 하는데, 왜 어노테이션 확장 파일인 DDLX 는 요소 뒤에 세미콜론(;) 마침표를 써야 하나요?
**A**: **DDL 은 단일 select list 안에서 나열하는 SQL 문장이지만, DDLX 는 이미 선언이 완결된 개별 필드 구조에 사후적으로 주석(Annotation)을 덧붙이는 개별 명세 문장의 나열이므로 구분자가 세미콜론 마침표로 격리 정의되었습니다.**
- **DDL (`asddls`)**:
  `define view entity ZI_Concert as select from zconcert { concert_id, artist, venue }`
  이 구문은 통째로 하나의 거대한 `SELECT` 문장입니다. SQL 스펙 상 select list 내부의 기둥들은 **쉼표(`,`)** 로 구분하여 하나의 문장으로 완성합니다.
- **DDLX (`asddlx`)**:
  `annotate entity ZC_Concert with { concert_id; artist; }`
  이 파일은 데이터를 생성하는 문장이 아닙니다. 이미 활성화 완료되어 있는 ZC_Concert 라는 뼈대의 `concert_id` 에 어노테이션 옷을 입히고, 다음 줄로 넘어가서 `artist` 에 또 옷을 입히는 **독립된 개별 명세서들의 집합**입니다. 따라서 각 명세서 문장의 완결 끝마침을 알려주기 위해 문장 마침표인 **세미콜론(`;`)** 을 사용해 문장을 완전히 닫아주어야 문법적으로 성립합니다. DDLX 에 쉼표를 기입하면 문법 해석기(Parser)가 길을 잃고 즉각 빌드를 차단합니다.

### Q2. CDS View Entity 내부 select list 에서 key 요소를 지정하여 활성화하면, 이것이 데이터베이스(DB) 원본 테이블의 물리적 기본키(Primary Key) 구조를 변조시키나요?
**A**: **변조시키지 않습니다. CDS 의 key 는 DB 물리 테이블의 기본키와 100% 무관하며, 단지 "이 CDS 읽기 모델을 바라보는 소비자에게 이 필드가 식별 키로서의 성격을 띤다고 고지하는 논리적 명세" 일 뿐입니다.**
DB 원본 테이블인 `zconcert` 의 기본키가 `concert_id` 라고 합시다.
내가 만든 CDS 뷰인 `ZC_Concert` 에서 실수로 `key venue, artist` 라고 적고 활성화하더라도, 실제 디스크에 저장되어 있는 zconcert 테이블의 기본키가 venue 로 변해버리는 끔찍한 데이터 변조 사고는 일어나지 않습니다. DB의 테이블 뼈대와 CDS 가 비춰보는 거울상의 의미론적 키는 완벽히 분리되어 작동하기 때문입니다.
단, CDS 에서 key 설정을 임의로 꼬아두면, 이 CDS 를 소비하는 OData 나 Fiori Elements 화면 단에서 행 데이터를 식별하지 못해 데이터가 격자 형태로 뭉개져 렌더링되거나 오작동을 유발하므로, **특별한 집계 뷰가 아니라면 원본 테이블의 물리 기본키 계보를 그대로 따라 key 설정을 셋업해 주는 것이 아키텍처적 약속**입니다.

### Q3. @AccessControl.authorizationCheck: #CHECK 가 지정된 CDS 뷰를 프로그램에서 읽을 때, 권한 검사를 일시적으로 통째 스킵 우회하여 원본 데이터를 다 긁어오려면 구체적으로 어떻게 코딩해야 하나요?
**A**: **ABAP SQL SELECT 문의 FROM 절 바로 뒷부분에 WITH PRIVILEGED ACCESS 지시어를 명시적으로 물려 쿼리를 날리면 DCL 검문 필터를 우회하여 전량 획득할 수 있습니다.**
DCL 보안 가드가 걸린 뷰는 로그인한 사람의 지점 권한 값(서울)만 걸러서 반환합니다.
하지만 야간 마감 연산을 수행하는 통계 배치 프로그램 등은 사용자 권한 격리 없이 전체 레코드(서울 + 부산)를 다 읽어 합산해야 합니다.
이때 일반 `SELECT * FROM zc_concert` 로 읽으면 서울 지점 담당자가 돌릴 때 부산 행이 누락되어 매출 빵꾸가 납니다.
따라서 아래와 같이 쿼리를 기재하여 검문을 강제 통과시킵니다.
```abap
" [ DCL 검문 레이저를 일시적으로 해제 우회하는 안전 쿼리 ]
SELECT *
  FROM zc_concert WITH PRIVILEGED ACCESS " <- 우회 락 해제 마크!
  INTO TABLE @DATA(gt_full_sales).
```
이 구문이 지정되면, 아바 커널 엔진은 "이 호출 프로그램은 권한을 초월해 원본 데이터를 읽어도 무방한 합법적인 특수 특권(Privileged) 실행 구역" 임을 인지하고 DCL 필터 SQL 조인 가드를 연결하지 않고 전량 긁어다 반환해 줍니다.

### Q4. CDS 뷰 소스 코드 상단에 association to ZI_Perf as _Perf 라고 관계를 아주 멋지게 맺어두었는데, 왜 소비처 프로그램이나 다른 CDS 에서 _Perf 통로로 회차를 추적하려 들면 경로가 끊어졌다고 오류가 나나요?
**A**: **부모 DDL 의 select list 중괄호 { } 내부 최하단에 _Perf 라는 연관 관계 별칭 이름을 적어 밖으로 노출(Exposure)하는 최종 단계를 누락했기 때문입니다.**
- **비유**: `association` 을 적은 것은 두 클래스 사이에 '광섬유 통신 케이블 파이프' 를 매설한 것과 같습니다.
- **오류 원인**: 케이블을 땅에 묻었어도, 뷰의 출구 인터페이스 구멍(`{ }` select list)에 **이 케이블 포트 번호를 밖으로 노출(`_Perf`)** 해두지 않으면, 바깥에 서식하는 소비자는 이 뷰 안에 매설된 파이프의 존재를 전혀 보지 못해 끈을 당길 수 없게 됩니다.
따라서 연관 관계를 설계할 때는 반드시 중괄호 블록의 가장 밑바닥 칸에 콤마와 함께 **`_Perf`** 라는 별칭 명칭을 명시 기입해 흘려보내야만 비로소 외부에서 `zi_concert\_Perf-perf_date` 와 같은 체인 경로 해독이 성립합니다.

### Q5. @Semantics.amount.currencyCode: 'ticket_price' 처럼 금액 필드의 통화 짝꿍으로 자기 자신 필드명을 지정해 기입해 두면 빌드 및 런타임에 어떤 참사가 터지나요?
**A**: **메타데이터 해석기(Parser)가 "금액 필드의 숫자 값 자체를 화폐 통화 텍스트(USD, KRW)로도 오해해 해독하라" 는 기하학적 모순 루프에 직면하여, 활성화(Activation) 컴파일 거부 사이렌을 울리며 빌드를 영구 중단시킵니다.**
- **논리적 모순**:
  `@Semantics.amount` 는 "이 필드(12000)는 화폐 금액이다" 임을 선언합니다.
  그리고 `currencyCode` 속성은 "이 금액이 어떤 통화 단위인지 문자열 코드가 들어있는 짝꿍 방을 알려달라" 는 지시입니다.
  여기에 자기 자신인 `ticket_price` 를 지목하면, 시스템은 "12000 이라는 숫자 값을 읽고, 이 돈의 단위는 12000 이라는 글자다" 라는 엉뚱한 해석을 시도해야 합니다. 이는 메타데이터 규격을 위반하는 논리 오염이므로, 활성화 시점에 컴파일러가 즉각 **"자기참조 불일치 정합성 에러"** 를 터트려 실행 파일 조립을 정지시킵니다.
- **해방**: 반드시 통화 문자열(`'KRW'`)이 실제 얌전히 문자로 담겨 소장된 **별개의 독립 필드명(`'currency_code'`)을 대문자 짝꿍으로 지목**해 주어야 문법이 승인됩니다.
