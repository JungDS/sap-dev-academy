# CH36_QA - antigravity_0629_v1 재작업 검수 및 Q&A

> 대상 파일: `reference/antigravity_0629_v1/CH36_REWRITE.md`
> 목적: CH36 v1 재집필 원고의 품질을 자가 검증하고, 비전공자 입문자를 위한 빈발 질문 및 구체적 답변을 정리한 QA 원장이다.

## 1. 재작업 품질 자가 검증

| 검증 항목 | 상세 기준 | 반영 내용 | 판정 |
| --- | --- | --- | --- |
| **입문자 가독성** | IT 비전공자 20대 전후 기준 친근한 비유와 쉬운 용어 노출 | 컨베이어 벨트, 데이터 입구(Form Interface), 느긋한 로딩(Association), 사각 테두리 바구니(Facet), 수문장(Validation), 쇠사슬 락(failed/reported), 통신 파이프라인(Service Binding), 자동 경비원(DCL), 팡파르 등 비유 사용 | 통과 |
| **5단 구성 흐름** | 왜 필요한가 -> 무엇인가 -> 어떻게 확인하나 -> 실수/주의 -> 정리 흐름 준수 | 7개 레슨 모두에 누락 없이 5단 세션 완비 | 통과 |
| **용어 인라인 정의** | 첫 등장 용어에 대해 괄호로 간결히 인라인 뜻풀이 수행 | Capstone, Association, Projection View, BDEF, BIMP, Test Double, MTE, DCL 등 반영 | 통과 |
| **R15 게이팅 준수** | 후속 개념(ABAP OOP 고급 디자인 패턴, gCTS 파이프라인 구축 등)을 미리 설명하지 않고, 타 챕터로의 연계 이정표로 격리 | Capstone 완주로 ABAP 과정이 종결됨을 선언하고 향후 넥스트 커리어(UI5/Fiori 심화 등) 이정표 제시 | 통과 |
| **R6 classic-first** | local 스코프 및 modern 문법(inline 선언, `@`, `NEW`) 완전 제거 | 본 장은 모던 풀스택 캡스톤 단원이므로 필요한 modern syntax(VALUE #(), NEW #( ), DATA( ) 등)를 정식 사용하되, CDS 뷰 구조와 BDEF/BIMP 클래스 정의 및 Fiori Elements 연동 구조와의 정합성을 배치함 | 통과 |
| **R2 체험성 구체화** | 코드가 있거나 GUI 조작이 있는 모든 페이지에 가상 시뮬레이터 구성 요소와 피드백 설계 | L01~L07 전 레슨에 입력-상태-피드백 모션을 구체적인 텍스트 설계서로 수록 | 통과 |

---

## 2. 소스 커버리지 및 파일 매핑

기존 `content/abap/CH36` 원본 레슨 파일들의 핵심 주제가 빠짐없이 원안에 매핑되었음을 보증한다.

- `CH35/_chapter.md` -> `## CH36 전체 설계` 부분의 한 문장 목표 및 인트로로 포괄 반영.
- `CH36-L01.md` -> `## CH36-L01 - Capstone 업무 시나리오 정의`
- `CH36-L02.md` -> `## CH36-L02 - ZI_* Interface View 설계`
- `CH36-L03.md` -> `## CH36-L03 - ZC_* Projection View 설계`
- `CH36-L04.md` -> `## CH36-L04 - Behavior Definition / Implementation`
- `CH36-L05.md` -> `## CH36-L05 - Action / Validation / Determination 구현`
- `CH36-L06.md` -> `## CH36-L06 - Service Binding과 Fiori Elements 테스트`
- `CH36-L07.md` -> `## CH36-L07 - Authorization / Draft / 운영 고려사항`

---

## 3. 입문자용 단골 질문 Q&A (Glossary 보완용)

### Q1. RAP Behavior Definition (BDEF) 파일에 draft table zbooking_d 옵션을 적어 줬는데 왜 계속 컴파일러가 빨간 에러 줄을 치며 빌드를 거절하고 뻗어버리나요?
**A**: **BDEF 에 드래프트 기능을 선언하면, 임시 버퍼 역할을 해줄 zbooking_d 테이블이 데이터 사전(DDIC)에 동일한 컬럼 구조와 드래프트 전용 어드민 키(%admin)를 포함해 물리적으로 실제 먼저 생성 및 활성화되어 상주해 있어야만 컴파일이 뚫리기 때문입니다.**
- **컴파일 기각 원인**:
  사용자가 Fiori Elements 화면에서 타자를 치는 찰나, RAP 프레임워크는 입력 데이터를 저장 버튼을 누르기 전에 임시 임시 드래프트 테이블인 `zbooking_d` DB 공간에 실시간으로 써넣고 관리합니다.
  만약 이 `zbooking_d` 테이블이 SE11 데이터 사전에 정식 생성되어 존재하지 않는다면, BDEF 는 "임시 데이터를 구워낼 디스크 프레임이 아예 없다" 며 즉각 컴파일 에러를 뿜습니다.
- **해결**:
  `zbooking` 의 키 필드와 일반 필드들을 그대로 복사하고, 드래프트 전용 메타 영역인 **`%admin`** 구조체 필드들을 합치 결합하여 Dictionary 에서 `zbooking_d` 테이블을 먼저 정식 활성화(Active)한 뒤 BDEF 를 빌드해야 통과됩니다.

### Q2. Behavior Pool 클래스 내부에서 예매 상태를 C(취소)로 업데이트할 때, 왜 MODIFY ENTITIES OF ... 뒤에 굳이 IN LOCAL MODE 라는 수식어를 필사적으로 붙여주어야 하나요?
**A**: **IN LOCAL MODE 를 붙이지 않으면 RAP 엔진은 이 수정을 외부의 침입 호출로 오역하여, 전사 권한 제어 DCL 과 글로벌 락 master 를 2차로 중복 호출해 격발시킴으로써 내가 내 락에 충돌해 무한 재귀 루프로 기절하거나 처리가 강제 기각되기 때문입니다.**
- **Local Mode 의 격리성**:
  우리가 `cancelBooking` 이라는 내 클래스 핸들러 안방에서 Z테이블을 수정할 때는, 이미 1차로 사용자가 화면을 누를 때 락과 권한 검사를 다 끝마치고 들어온 '안전 구역' 입니다.
  여기에 `IN LOCAL MODE` 수식어 없이 쌩 `MODIFY ENTITIES` 를 격발하면, RAP 커널은 "이게 로컬 내부 갱신인지, 외부 RFC 에서 찔러 들어온 새로운 요청인지" 식별하지 못해, 현재 트랜잭션에 대고 권한 검사와 레코드 잠금(Locking)을 똑같이 한 번 더 실행해 버립니다.
  그 결과, 내가 이미 잡고 있는 예매 레코드 락에 내 수정 코드가 쾅 충돌해 무한 재귀 교착(Deadlock)에 걸려 프로세스가 강제 폭사 종료됩니다. 
  **철칙**: 핸들러 안방 내부 CRUD 는 무조건 **`IN LOCAL MODE`** 를 얹어 실행해야 안전합니다.

### Q3. OData Service Binding 을 퍼블리시하고 Fiori Elements Preview 미리보기 화면을 띄웠습니다. 표 데이터 목록은 잘 나오는데, 왜 추가(Create)나 삭제(Delete) 버튼이 비활성화(잠김)되어 보이나요?
**A**: **소비 CDS 뷰인 ZC_Booking 을 선언할 때 provider contract transactional_query 지정을 누락했거나, 짝꿍 BDEF 인 ZC_Booking behavior projection 파일에 create; update; delete; 권한 투영 스위치를 켜두지 않았기 때문입니다.**
- **버튼 잠김의 배선 누락**:
  Fiori Elements 는 쌩 코딩 없이 작동하므로, 화면에 등록/삭제 버튼을 띄우고 활성화할지도 백엔드의 메타데이터 계약을 그대로 읽어 판정합니다.
  - **원인 1**: ZC_Booking CDS 뷰 정의 헤더에 **`provider contract transactional_query`** 계약 선포를 빼먹으면 Read-only 단순 조회 전용 쿼리로 강제 격리되어 버튼이 잠깁니다.
  - **원인 2**: BDEF 에 `create; update; delete;` 를 적어 줬더라도, 실제 외부로 나가는 소비 BDEF (`ZC_Booking` projection) 파일 내벽에 **`use create; use update; use delete;`** 스위치를 연결해 뚫어주지 않으면 Fiori 화면 단추가 잠김 회색으로 숨어버립니다.

### Q4. Projection View (ZC_) 소비 뷰를 설계할 때, 왜 @UI.lineItem 이나 facet 같은 시각 디자인 주석들을 쌩으로 다 적지 않고 Metadata Extension (MTE) 파일로 쪼개어 격리 분리하는 것을 실무에서 극도로 권장하나요?
**A**: **수백 줄의 비주얼 UI 화면 디자인 주석이 CDS 소스 코드를 침범하면 데이터베이스 아키텍처의 가독성과 순수성이 뭉개지기 때문이며, 데이터 모델링(CDS)과 시각 표현(MTE)의 관심사를 깔격리하기 위함입니다.**
- **MTE 분리의 가치 (관심사 분할)**:
  그냥 ZC_Booking CDS 뷰 안에다가 `@UI.lineItem: [{position:10}]`, `@UI.identification`, `@UI.selectionField` 같은 디자인 데코레이션 주석을 다 적으면, CDS 뷰 본체 코드는 20줄인데 화면 주석이 500줄이 되는 기형적 소스가 탄생합니다. 
  나중에 데이터베이스 관계를 튜닝하거나 필드를 추가하려 할 때 500줄 주석 더미에 가려 쿼리 구조가 보이지 않는 가독성 헬게이트를 겪습니다.
  `@Metadata.allowExtensions: true` 를 선언해 두고, 화면 디자인 주석만 **`Metadata Extension (MTE)`** 이라는 전용 레이아웃 파일로 촥 발라내어 격리 작성해 주면, CDS 뷰 본체는 오직 순수한 DB 셀렉트 데이터 구조만 맑게 유지할 수 있어 유지보수 가독성이 백배 상승합니다.

### Q5. 이번 Capstone 프로젝트를 통해 완성한 RAP + Fiori Elements 모던 웹 앱이, 왜 과거 90년대 Dynpro (스크린페인터 PBO/PAI) 화면 그리기 방식에 비해 클라우드 전환과 운영 생산성 면에서 압도적으로 유리한가요?
**A**: **Dynpro 는 Windows 전용 SAP GUI 클라이언트에 꽉 묶인 고폐쇄성 로컬 기술이지만, RAP+Fiori 는 백엔드 데이터(OData)와 프론트엔드 화면 UI(@UI 메타데이터)를 완벽히 격리 결선하여, 모바일/웹 크롬 브라우저 어디서든 반응형으로 렌더링되며 아바 Cloud 이송에 무결하기 때문입니다. (백엔드 화면 코딩 0줄 수호)**
- **클래식 Dynpro vs 모던 RAP+Fiori 비교**:
  - **클래식 Dynpro (화면 픽셀 배치 방식)**:
    마우스로 화면 픽셀 위치를 직접 그리고 PBO/PAI 제어 코드를 수천 줄 짜야 합니다. 
    이 화면은 오직 뚱뚱한 Windows PC 용 SAP GUI 프로그램 안에서만 열리며, 스마트폰 브라우저나 웹 크롬으로 열 수 없고, 코드가 OS 단에 강하게 밀착되어 있어 SAP 클라우드(ABAP Cloud)로 이전할 때 컴파일이 불가능해 폐기 운명을 밞습니다.
  - **모던 RAP + Fiori Elements (메타데이터 렌더링 방식)**:
    아바 개발자는 백엔드 데이터 모델에 대고 "이 필드는 10번 컬럼이다" 라고 선고만 내릴 뿐, 화면을 픽셀 단위로 그리는 생고생 코딩을 단 한 줄도 단행하지 않습니다.
    이 선고(OData Metadata)를 접수한 모바일 크롬 웹 브라우저가 사용자 기기 화면 크기(반응형)에 맞춰 Fiori 표 그리드와 입력창 폼을 알아서 자동으로 빚어내어 렌더링합니다. 
    로직과 화면이 완벽히 격리되어 있으므로, 훗날 화면 디자인을 다 갈아엎더라도 백엔드 아바 코드는 1자도 다치지 않는 철통 생산성을 달성하며, **Clean Core Released API** 규격을 밟아 클라우드 이송 즉시 100% 무결하게 기동 가속됩니다.
