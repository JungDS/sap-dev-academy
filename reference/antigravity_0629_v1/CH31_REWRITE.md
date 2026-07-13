# CH31_REWRITE - IDoc / ALE / Gateway v1

> 목적: `content/abap/CH31`의 5개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH31 전체 설계

CH31의 한 문장 목표는 "표준 비동기 메시지 컨테이너인 IDoc 의 3층 구조(EDIDC Control, EDIDD Data, EDIDS Status)와 ALE 분배 인프라(BD64, WE20), 상태 코드(51 Inbound 에러, 53 성공, 02/26 Outbound 에러) 추적 및 BD87 재처리, 그리고 전통적인 웹 게이팅 OData SEGW 프로젝트(DPC_EXT, EntitySet)와 SQL OFFSET 페이징의 필수 정렬(`ORDER BY`) 가드선을 수립하여 대내외 시스템 데이터 연계를 설계한다"이다.

IT 비전공자 입문자는 SEGW `GET_ENTITYSET` OData 페이징 구현 시, 정렬 순서를 보장하는 `ORDER BY` 문을 빠뜨린 채 `OFFSET @iv_skip` 을 적어 컴파일 신택스 에러 덤프를 터트리고, Inbound IDoc 처리 중 업무 데이터 정합성이 깨져 에러 상태 **51** 로 굳은 문서를 모니터링 없이 방치해 오더 유실을 낸다.
또한, 비동기 네트워크 통신망 특성상 동일한 IDoc 이 여러 번 유입될 수 있음을 무시해 중복 저장을 유발하고, `BD64` 에서 ALE 분배 모델만 만들고 Partner Profile(`WE20`) 배포를 생략해 송수신 먹통을 방치한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **IDoc 3층 구조 해부**: Control(EDIDC: 주소록), Data(EDIDD: 데이터 세그먼트), Status(EDIDS: 배송 이력)의 3층 구조 규명 및 모니터 `WE02`/`WE05` 셋업.
2. **ALE 분배 인프라**: 발신/수신 계약인 `BD64` 분배 모델과, 구체적인 tRFC 포트 및 처리 함수를 매핑하는 `WE20` 파트너 프로파일 조립.
3. **Inbound 51 에러 탈출 (BD87)**: 에러 상태 51로 잠긴 IDoc 을 마스터 보정 후 즉시 재포스팅 실행하는 **`BD87`** 구출 전선 마련.
4. **EDIDC-DOCNUM 멱등성 가드**: 비동기 중복 수신 시 동일 데이터를 가드하기 위해, **`EDIDC-DOCNUM`** 고유 문서 키를 검문해 중복 저장을 바이패스 차단하는 멱등성 확보.
5. **Gateway SEGW 아키텍처**: DPC_EXT 클래스(데이터 구현)와 MPC_EXT 클래스(모델 구현)의 분할 뼈대 구성 및 서비스 관리`/IWFND/MAINT_SERVICE` 등록.
6. **OData Paging ORDER BY 가드**: `OFFSET @iv_skip` 적용 시, **`ORDER BY` 정렬 필드 선행을 의무화**해 컴파일 즉사 및 페이징 순서 파손 차단.

---

## CH31-L01 - IDoc 기본 구조

### 왜 필요한가

우리가 이전 인터페이스 챕터에서 배웠던 RFC 통신 방식은 호출자가 함수를 찌르는 순간 상대방 서버가 반드시 켜져서 연산 결과를 즉시 반환해야 하는 "실시간 동기(Synchronous) 통신" 이었다.
하지만 실무 현장에서는 이 방식에 중대한 위험이 있다.
- " 매일 저녁 대량의 주문 10만 건을 파트너사 물류 서버로 송출해야 한다. 
그런데 물류 서버가 정기 점검으로 1시간 동안 꺼져 있거나 인터넷 선이 일시 차단되었다."
동기 RFC 방식이면 첫 번째 주문 호출부터 "대상 서버 연결 안 됨" 예외를 내며 프로그램 전체가 폭사하고, 데이터 전송은 그대로 영구 실패하여 물류 트럭이 한 대도 출발하지 못하는 참극이 난다.
- "상대방 서버가 꺼져 있더라도, 일단 내 쪽에서 '표준 규격의 편지 봉투(메시지 컨테이너)' 에 주문 정보를 고이 접어 담아 우체통에 던져두면, 통신망이 복구되었을 때 알아서 차례대로 배달(비동기 통신)해 주는 안전한 장치가 필요하다."
그 표준 편지 봉투가 **Intermediate Document (IDoc)** 이다.

### 무엇인가

#### 1. IDoc (Intermediate Document)
- 시스템 간에 문서 데이터를 비동기(Asynchronous) 방식으로 안전하게 주고받기 위해 SAP 가 제정한 표준 메시지 컨테이너 규격이다. (우편 봉투 역할을 한다.)

#### 🧭 [ IDoc 3층 구조 아키텍처 명세 ]
- *어떠한 대형 IDoc 이든 백엔드 내부에서는 무조건 아래 3가지 레코드 테이블로 칼로 자르듯 분할되어 적재된다.*

```text
[1층] Control Record (EDIDC - 주소록 레코드) :
   보내는 사람(Sender), 받는 사람(Receiver), 메시지 종류(ORDERS 등) 등 편지 봉투 겉면에 적는 핵심 헤더 정보다.
   │
[2층] Data Records (EDIDD - 데이터 세그먼트) :
   실제 편지 내용물 데이터가 얹혀가는 영역이다. 
   Basic Type (예: ORDERS05) 설계도에 맞게 머리(Header Segment), 다리(Item Segment) 구조체 리스트가 주르륵 APPEND 되어 적재된다.
   │
[3층] Status Records (EDIDS - 배송 이력 상태) :
   "01번 편지 봉투 작성됨", "30번 발송 준비", "03번 발송 완료", "51번 도착했으나 데이터 오류로 접수 거부" 등 
   배송 단계별 상태 이력이 시간 초 단위로 촘촘히 기록되는 로그 영역이다.
```

#### 2. Basic Type 과 Segment
- **Basic Type**: 이 IDoc 봉투에 어떤 모양의 데이터 칩들이 들어갈지 정의하는 설계 명세서다. (예: `ORDERS05` 주문서 기본형)
- **Segment**: 데이터를 실어 나르는 표준 구조체 상자다. (예: `E1EDK01` 주문 헤더 세그먼트, `E1EDP01` 품목 세그먼트)
- **WE02 / WE05**: IDoc 우체국 모니터링 화면이다.
- **WE60**: IDoc 의 Basic Type 에 어떤 세그먼트들이 어떤 계층(Hierarchy)으로 조립되어 있는지 구조 문서를 상세히 훑어보는 명세서 화면이다.

### 어떻게 확인하는가

WE02 모니터링 화면과 matching 되는 IDoc 수신용 Inbound 함수 파이프라인의 3층 구조 파싱 개념을 검증한다.

```abap
" 표준 Inbound IDoc 처리 함수 모듈 내부 (개념 코드)
FUNCTION zidoc_input_booking.
  " 1. [Control Record EDIDC 수령]
  " 2. [Data Record EDIDD Segment 수령]
  " TABLES 
  "   idoc_control_record TYPE TABLE OF edidc
  "   idoc_data_records   TYPE TABLE OF edidd
  
  LOOP AT idoc_data_records INTO DATA(ls_data).
    CASE ls_data-segnam.
      WHEN 'E1BOOK_HEADER'. " 예매 헤더 세그먼트를 만났을 때!
        " 날것의 1,000자 Char 텍스트 버퍼(sdata)를 정교한 헤더 구조체로 매핑 분리!
        DATA(ls_head) = CORRESPONDING zhead_struct( ls_data-sdata ).
        
      WHEN 'E1BOOK_ITEM'.   " 예매 상세 좌석 세그먼트를 만났을 때!
        DATA(ls_item) = CORRESPONDING zitem_struct( ls_data-sdata ).
    ENDCASE.
  ENDLOOP.
ENDFUNCTION.
```

#### 체험/시뮬레이터 설계 (IDoc 3층 구조 탭 탐색기)
- **프로세스 플로우**:
  1. 학습자가 [ORDERS05 IDoc 문서 번호 #100827] 을 본다.
  2. [Control 탭] 을 클릭하면 `Sender = ERP_SYS, Receiver = WMS_SYS, MessageType = ORDERS` 봉투 겉면 주소가 렌더링된다.
  3. [Data 탭] 을 누르면 `E1EDK01 (헤더 세그먼트 - 주문자: 정훈영)` 과 그 밑에 들여 쓰기 된 `E1EDP01 (품목 세그먼트 - 수량: 3)` 계층형 상자들이 촥 펼쳐진다.
  4. [Status 탭] 을 누르면 `50 (IDoc 접수됨) -> 30 (발송 대기) -> 03 (성공 발송)` 시간대별 생애주기 로그가 계단식으로 렌더링되는 시각 피드백을 감상한다.
- **상태 및 데이터**:
  - `데이터 세그먼트 순회 시 segnam 철자를 대소문자 무시하고 마음대로 매핑한 상태` -> 런타임 결과: `Segment name match failed. Segment skipped. Missing data in import` 경고 하이라이트.
- **피드백**: IDoc 은 데이터를 문자열 버퍼(`sdata`)에 싣고 가므로, 명세서(`WE60`)에 부합하는 세그먼트명 1:1 결합 파싱이 생명임을 깨닫는다.

### 실수/주의

- **IDoc Basic Type 구조를 설계할 때, 부모 세그먼트와 자식 세그먼트의 계층 순서를 뒤틀어 수신 함수에 전달**:
  - 부모 세그먼트가 나오기 전에 자식 세그먼트가 먼저 날라오면, 수신부 엔진이 계층 불일치 오류를 터트리며 IDoc 전체를 상태 56(구조 에러)으로 파사 덤프를 때려 막는다.
  - **WE60 의 계층 설계서 순서 룰을 준수해 순차 APPEND 해야 함을 수호해야 한다.**

### 정리

- **`IDoc`** 은 시스템 간에 대량 비동기 데이터 통신을 수행하기 위해 제정된 표준 봉투다.
- **`EDIDC`** (Control: 헤더), **`EDIDD`** (Data: 실데이터 세그먼트), **`EDIDS`** (Status: 로그) 3층으로 빚어진다.
- 모니터링은 **`WE02`** / **`WE05`** 에서 수행하며, 구조 명세 확인은 **`WE60`** 을 활용한다.

---

## CH31-L02 - ALE Distribution Model

### 왜 필요한가

IDoc 편지 봉투 3층 구조는 마스터했다.
그런데 이번에는 이 편지 봉투가 날아갈 배송 우체국 망의 배선 설계가 문제다.
- "ERP 시스템에서 콘서트 예매가 확정되면, 이 정보를 홍길동 매장 시스템과 임꺽정 물류 서버 양쪽에 비동기로 쏴주고 싶다."
프로그램 하드코딩으로 `CALL FUNCTION ... DESTINATION 'HONG'` , `CALL FUNCTION ... DESTINATION 'LIM'` 와 같이 전송 경로 주소를 소스 코드 곳곳에 박아 넣기 시작하면, 나중에 협력사 물류 서버 컴퓨터 이름이 바뀌거나 IP 가 이전될 때마다 운영 프로그램 수십 개를 찾아서 소스 코드를 도려내 고쳐야 하는 끔찍한 결합도 헬게이트가 열린다.

**송수신 시스템 연결망(SM59)과 논리 서버 명칭(BD54)을 프로그램 바깥 전산 관리판에서 배선 조립하고(BD64), 파트너별 포트와 처리용 함수 바인딩 계약(WE20)을 맺어두어, 코드는 단 1자도 안 바꾸고 라우팅 경로만 스위칭하는 기술**이 필요하다. 그것이 **ALE Distribution Model (분배 모델)** 의 셋업이다.

### 무엇인가

#### 1. ALE (Application Link Enabling)
- 여러 SAP 및 Non-SAP 시스템 간에 IDoc 메시지가 안전하게 물 흐르듯 라우팅되고 분산 분배되도록 조율해 주는 SAP 전용 미들웨어 아키텍처 프레임워크다.

#### 2. BD64 (Distribution Model - 분배 모델 설계서)
- *ALE 분배망의 종합 지도다.*
- "어떤 논리 송신 시스템(`Sender`)이 어떤 논리 수신 시스템(`Receiver`)에 어떤 메시지 타입(`ORDERS` 등)을 뿌려줄 것인가" 의 **연계 경로 지도를 물리 프로그램 밖에서 설계 정의**해 두는 트랜잭션 화면이다.

#### 3. BD54 (Logical System - 논리 시스템)
- 실제 물리 서버 컴퓨터 IP 대신, SAP 안에서 가상으로 징표 지어 부르는 논리적 시스템 닉네임 명세다. (예: `ERP_DEV_100`, `WMS_LIVE_200`)

#### 4. WE20 (Partner Profile - 파트너 계약 프로파일)
- *실제 IDoc 의 송수신 최종 관문 스위치다.*
- **아무리 BD64 에 분배 지도를 그리고 BD54 논리 시스템을 뚫어두어도, 정작 수신처 파너트 프로파일(`WE20`)에 대고 "이 ORDERS 메시지가 오면 백엔드의 ZIDOC_INPUT_BOOKING 함수 모듈을 격발해 처리하라" 고 수신 공증 배치를 빼먹으면 IDoc 은 우체국 관문에 걸려 정지한 채 썩어 들어간다.**

#### 5. WE21 (Port)
- IDoc 이 흘러 나갈 구체적인 통신 파이프라인 형태(tRFC, File 디렉토리 등)를 SM59 연결망과 묶어 정의하는 포트다.

### 어떻게 확인하는가

BD54 논리 시스템을 거쳐 BD64 모델 배포와 WE20 파트너 프로파일이 체결된 ALE 배선 흐름을 검증한다.

```text
[1단계] BD54 논리 시스템 선언 완료 :
   - 본사 ERP : ERP_CLNT_100
   - 협력사 WMS : WMS_CLNT_200
   
[2단계] BD64 분배 모델 배선 완료 :
   - Sender   : ERP_CLNT_100
   - Receiver : WMS_CLNT_200
   - Message  : ORDERS (주문 메시지)
   
[3단계] WE20 파트너 프로파일 체결 완료 :
   - 파트너 번호 : WMS_CLNT_200 (Partner Type = LS)
   - Inbound Parameters 에 ORDERS 메시지 등록!
   - Process Code 에 'ZORDE' (ZIDOC_INPUT_BOOKING 함수와 결합된 코드) 매핑 낙찰!
```

#### 체험/시뮬레이터 설계 (ALE 분배선 배선판)
- **프로세스 플로우**:
  1. 학습자가 [ERP 송신포트] 와 우측의 [WMS 수신포트], [MES 수신포트] 소켓 단자를 본다.
  2. [BD64 모델 설계 펜]으로 ERP -> WMS 연결 선을 긋는다.
  3. [예매 발생] 버튼을 누른다. IDoc 이 생성되지만 관문에서 빨간 불이 난다.
  4. [WE20 파트너 프로파일 ORDERS 매핑 = 완료] 스위치를 켠다.
  5. IDoc 이 WMS 소켓 속으로 촥 빨려 들어가 Inbound 함수가 격발 기동하며 성공등이 켜지는 유기적인 우편 이송 피드백을 감상한다.
- **상태 및 데이터**:
  - `BD64 분배 지도를 그린 뒤 상대 시스템으로 모델 배포(Distribute)를 생략한 상태` -> 런타임 결과: `Distribution model out of sync. Outbound routing rejected` 하이라이트.
- **피드백**: ALE 인프라는 분배 모델 설계, 파트너 계약 및 배포의 3자 조합이 싱크되어야만 비동기 통신로가 성립함을 체득한다.

### 실수/주의

- **개발 장비에서 WE20 파트너 프로파일을 수동으로 열심히 셋업해 두고, 운영 서버 이전 시 transport (운송) 누락**:
  - **WE20 파트너 프로파일은 커스터마이징 전송(TR)을 타지 않는 '각 클라이언트별 개별 마스터 데이터 속성' 이다.** 
  - 이를 인지하지 못하고 운영 서버 배포 후 WE20 셋업을 수동으로 똑같이 채워 넣지 않으면, 운영기 예약 이송 시 즉각 Partner Profile 에러를 내며 배송망 전체가 마비된다.
  - **운영 배포 시 WE20 은 무조건 운영 기계 각 클라이언트에서 수동 공증 확인 셋업해야 함을 수호해야 한다.**

### 정리

- **`ALE`** 는 시스템 간 IDoc 메시지의 경로 배선 및 분배를 총괄 지휘하는 인프라다.
- **`BD64`** 분배 모델 지도를 통해 하드코딩 없이 비동기 라우팅 경로를 사수한다.
- **`WE20`** 파트너 프로파일에 ORDERS 메시지와 Process Code(수신 함수 연동)를 의무 지정한다.
- Partner Profile 은 TR 을 타지 않으므로 클라이언트별 **`수동 공증 확인`** 이 필수다.

---

## CH31-L03 - IDoc 오류 추적과 재처리

### 왜 필요한가

ALE 배선망까지 완성했다.
이제 비동기 수신 과정에서 수백 건씩 터지는 데이터 정합성 실패(오류 고착) 수습이 문제다.
- "협력사에서 예매 IDoc 100건을 쐈다. 
그런데 그중 3건의 예매 문서가 '콘서트ID 존재하지 않음' 유효성 가드에 걸려 DB 저장이 거절되고 멈춰 섰다."
이 실패한 비동기 문서들을 그냥 에러 메시지 뿜고 공중 분해시켜 삭제해 버리면, 협력사는 돈을 보냈는데 우리 서버에는 예매 장부가 누락되는 심각한 대외 분쟁 금융 유실 사고를 겪는다.
실패한 IDoc 을 버리지 않고 큐에 **'에러 상태 51'** 마크를 채워 안전하게 보관해 두고, 백그라운드에서 마스터 코드 셋업을 보정한 뒤, **해당 IDoc 번호만 저격해 다시 재포스팅(BD87)** 해서 성공으로 이행시켜 유실을 방어해야 한다.

**오류 단계별 상태 코드(51 Inbound 에러, 53 Inbound 성공, 02/26 Outbound 에러)의 이력을 추적(WE02)하고, 멱등성 DOCNUM 키 가드를 물려 중복 저장을 방어하며, BD87 전산실을 통해 실패 IDoc 을 재포스팅 구출하는 기술**이 필요하다. 그것이 **IDoc 오류 추적과 재처리** 다.

### 무엇인가

#### 1. IDoc 상태 코드 (배송 단계 이력 명세)
- *IDoc 모니터링 시 가장 핵심적인 징표 코드 필드다.*
- **53 (Inbound 성공)**: Inbound 수신 함수가 정합성 검사를 모두 끝마치고 DB 테이블 적재 및 커밋까지 무결하게 완료했음을 보증하는 최고 존엄 마크다.
- **51 (Inbound 오류)**: 데이터 포맷 오류, 마스터 미등록, 마스터 락 등으로 인해 **DB 적재를 즉각 거부하고 임시 큐에 비활성 상태로 강제 홀딩**해 보관 중인 적색 에러 마크다.
- **03 / 12 (Outbound 성공 발송)**: 내 서버에서 문서를 빚어 외부 포트 밖으로 무사히 발송 전송 완료했음을 뜻한다.
- **02 / 26 (Outbound 오류)**: 포트 락이나 tRFC 연결망 다운으로 발송 자체가 취소된 에러 상태다.

#### 2. BD87 (IDoc 재처리 전산실)
- *실패한 IDoc 의 구출 센터다.*
- **에러 상태 51 로 멈춰 서 있는 불쌍한 IDoc 들을 저격 선택하여, 오류 원인(마스터 등록 등)을 백엔드에서 조용히 해결해 준 뒤 [Process] 버튼을 클릭해 '원본 그대로 다시 수신 함수를 격발 기동' 시켜 53번 성공으로 유인 승격시키는 재처리 트랜잭션 화면이다.**

#### ⚠️ [ 비동기 중복 수신 방지(멱등성)를 위한 EDIDC-DOCNUM 키 가드 명세]
- *동일 데이터 중복 적재 대형 전표 사고를 차단하는 정합성 철칙이다.*
- 비동기 우편 배달은 네트워크 지연 시 "배달 안 된 줄 알고 우체국이 똑같은 편지를 2번 연속 발송" 하는 중복 유입 가능성을 내포한다.
- **방어선 (Idempotency)**: 수신 함수 내방 1순위 줄에서 **`EDIDC-DOCNUM` (고유 우편 IDoc 번호)** 이나 비즈니스 고유 예약 ID 가 이미 내 로그 테이블에 성공 적재(53)되어 돌았는지 `SELECT SINGLE` 검문하여, **이미 처리 완료된 번호면 두 번째 유입 편지는 쌩 까고 바이패스 차단(Status 53 으로 유연 유도)해 주어야 중복 결제 적재를 막는다.**

### 어떻게 확인하는가

상태 51 문서를 WE02 에서 확인하고, 멱등성 검문 후 BD87 로 53 승격을 연동하는 프로세스를 검증한다.

```abap
" 1. [Inbound 수신 함수 내벽 - 멱등성 중복 가드 조립]
METHOD process_inbound_idoc.
  " EDIDC 에서 고유 우편 번호(docnum) 획득
  DATA(lv_docnum) = is_control-docnum.
  
  " 내 중복 방지 로그 테이블에서 이미 성공(53) 처리된 이력 검문!
  SELECT SINGLE docnum FROM zlog_idoc_success 
    INTO @DATA(lv_exist) WHERE docnum = @lv_docnum.
    
  IF sy-subrc = 0.
    " 이미 어제 처리 완료된 우편물이므로 더 이상 DB DML 을 타지 않고 조용히 퇴출!
    rv_status = '53'. " 중복 저장을 방어하고, 정상 완료 마크만 리턴!
    RETURN.
  ENDIF.

  " 비즈니스 DML 수행... 
  " 성공 시 zlog_idoc_success 에 docnum 기록!
ENDMETHOD.
```

#### 체험/시뮬레이터 설계 (IDoc 상태 라이프사이클)
- **프로세스 플로우**:
  1. 학습자가 [오류 IDoc #50012 (상태 51 - 마스터 미등록)] 문서를 본다.
  2. [DB 예매 테이블] 에는 데이터가 누락되어 있다.
  3. 학습자가 [zconcert 마스터에 공연 ID 등록 완료] 셋업을 한다.
  4. [BD87 전산실] 에 들어가 #50012 에 대고 [Process] 를 클릭한다.
  5. 톱니바퀴가 돌며 수신 함수가 재기동하고, 멱등성 검문을 무사 통과해 상태 코드가 `51 -> 53 (성공)` 으로 지잉 갱신되며, 예매 테이블에 한 줄이 안전하게 적재되는 구출 피드백을 감상한다.
- **상태 및 데이터**:
  - `마스터 보정 없이 BD87 재처리를 난사한 상태` -> 런타임 결과: `Process failed again. Status remains 51. Unresolved error` 하이라이트.
- **피드백**: 재처리는 무작정 누르는 요술 단추가 아니라, 근본 에러 원인을 해소한 뒤에 53 승격 통로를 밟아야 함을 인지한다.

### 실수/주의

- **상태 51 에러 로그를 메신저나 모니터링 이메일 알림 없이 방치**:
  - 이 실수 시 물류나 예매 문서 누락이 며칠 동안 누적되어 협력사와의 계약 파기 소송으로까지 이어지는 정산 빵꾸 사고가 터진다.
  - **오류 발생 시 백엔드 스케줄러를 통해 메일이나 대시보드 경보를 날리는 파수꾼 모니터링을 상시 구성해야 한다.**

### 정리

- IDoc 은 배송 상태를 **`Status`** 코드(53 성공, 51 오류, 03 Outbound 송신)로 보고한다.
- **`BD87`** 재처리 전산실에서 원인을 해결한 뒤 IDoc 을 다시 재포스팅 프로세싱한다.
- 비동기 중복 저장을 막기 위해 **`EDIDC-DOCNUM`** 고유 편지 번호로 **`멱등성 가드`** 를 쳐 방어한다.

---

## CH31-L04 - Gateway SEGW 프로젝트 구조

### 왜 필요한가

IDoc 비동기 연동까지 완성했다.
이제 modern 웹 어플리케이션 및 모바일 Fiori UI5 와의 실시간 통신을 위한 게이트웨이(Gateway) 연동의 문턱에 도달했다.
- " 사용자가 모바일 스마트폰 Fiori 앱 화면에서 [실시간 공연 예약 목록 조회] 버튼을 쿡 눌렀다.
그럼 모바일 웹 브라우저가 HTTP RESTful OData API 프로토콜을 타고 내 SAP 백엔드 클래스 메서드를 직접 원격 격발해 데이터를 JSON 형태로 수령해 가게 만들고 싶다."
기존 GUI 화면이나 IDoc 은 웹 브라우저가 해석할 수 없는 SAP 전용 폐쇄 규격이어서 웹 상에선 무용지물이다.
웹 브라우저가 친숙하게 부를 수 있는 표준 주소 규격(OData)을 제공하고, 백엔드의 데이터 프로바이더 클래스(DPC_EXT)를 조립해 웹과 DB 를 이어주는 다리가 필요하다. 그것이 **Gateway SEGW 프로젝트 구조화** 다.

### 무엇인가

#### 1. SAP Gateway 와 OData
- SAP 백엔드의 데이터를 웹 표준 RESTful 프로토콜인 **OData (Open Data Protocol)** 규격의 URL 주소로 노출해 주는 중간 다리(Gateway) 연계 기술이다. (SEGW 화면에서 정의한다.)

#### 2. EntityType 과 EntitySet
- **EntityType**: OData 에서 다루는 데이터 구조 명세서다. (예: `Concert` 구조체 - ID, artist, venue 등 필드)
- **EntitySet**: EntityType 구조체들이 가득 담겨 흘러 다닐 격자 데이터 컬렉션이다. (예: `ConcertSet` 테이블)

#### 🧭 [ Gateway SEGW 자동 생성 MPC/DPC 클래스 구조 명세 ]
- *SEGW 에서 프로젝트를 빚고 'Generate' 기어를 돌리면, 아바 엔진은 아래와 같이 데이터와 모델의 2대 클래스 껍데기를 자동으로 주조해 배출한다.*

```text
[1] MPC 클래스 (Model Provider Class) :
   EntityType 과 EntitySet 등 주소록 모델의 외형 뼈대 구조를 XML/OData 스펙으로 자동 정의하는 영역이다.
   ( MPC_EXT 는 이 모델 규격을 수동 커스텀 보강할 때만 상속해서 쓰며, 거의 건드리지 않는다. )
   │
[2] DPC 클래스 (Data Provider Class) :
   실제 DB SELECT 쿼리를 날려 값을 수 채워 수송하는 비즈니스 실구현 영역이다.
   ( DPC_EXT 클래스의 내벽 안방 메서드들을 상속/재정의(Redefine)하여 SELECT 문장을 짜 넣는다. )
```

#### 3. /IWFND/MAINT_SERVICE (서비스 정식 등록)
- **아무리 SEGW 에서 빌드 성공하고 클래스를 짰어도, 게이트웨이 정식 서비스 등록 트랜잭션인 `/IWFND/MAINT_SERVICE` 에 들어가 내 프로젝트 URL 주소 스위치를 켜주지 않으면 외부 웹 브라우저가 URL 을 두드릴 때 "404 Not Found" 에러를 뿜으며 방화벽에 가로막힌다.**

### 어떻게 확인하는가

EntityType 을 정의하고 DPC_EXT 클래스를 엮어 MAINT_SERVICE 에 등록하는 게이트웨이 시퀀스를 검증한다.

```text
[1단계] SEGW 트랜잭션 가동 :
   - 프로젝트명 : ZCONCERT_GW_SRV
   - EntityType : Concert (concert_id, artist, venue) 필드 선언!
   - EntitySet  : ConcertSet 테이블 선언!
   
[2단계] Generate Class 주조 완료 :
   - 모델 정의 클래스 : ZCL_ZCONCERT_GW_MPC_EXT
   - 데이터 구현 클래스 : ZCL_ZCONCERT_GW_DPC_EXT (여기에 SELECT 재정의 예정!)
   
[3단계] /IWFND/MAINT_SERVICE 서비스 등록 완료 :
   - 서비스명 : ZCONCERT_GW_SRV 등록!
   - URL 확인 : /sap/opu/odata/sap/ZCONCERT_GW_SRV/ConcertSet 격발 확인!
```

#### 체험/시뮬레이터 설계 (SEGW 데이터/모델 클래스 배선판)
- **프로세스 플로우**:
  1. 학습자가 [SEGW 프로젝트 기판] 을 본다.
  2. [EntityType 선언 = Concert] 카드를 장착하고 [Generate] 톱니바퀴를 돌린다.
  3. 기판에서 `MPC_EXT` 와 `DPC_EXT` 두 개의 클래스 칩이 자동으로 촥 사출 성형되어 조립되는 모습을 본다.
  4. 웹 브라우저 창에 OData URL 주소를 치자, [MAINT_SERVICE 등록 = OFF] 상태여서 `404 HTTP Error` 적색 경보가 울린다.
  5. [MAINT_SERVICE 등록 = ON] 스위치를 올리자, URL 관문이 초록색으로 열리며 백엔드로 OData 신호 케이블이 찰딱 결선 매칭되는 피드백을 감상한다.
- **상태 및 데이터**:
  - `비즈니스 로직 SELECT 를 DPC_EXT 가 아닌 MPC_EXT 클래스 내벽에 때려 넣은 상태` -> 런타임 결과: `Architecture Violation. Model class must not contain data query logic` 적색 경고 작동.
- **피드백**: 모델 구조 규격은 MPC, 실체 데이터 SELECT 연산은 DPC_EXT 로 칼 격리하는 관심사 분할이 게이트웨이의 약속임을 배운다.

### 실수/주의

- **SEGW 프로젝트 설정을 고친 뒤, 'Generate runtime objects' 톱니바퀴 생성 버튼 누락**:
  - EntityType 에 필드를 추가해 두고 이 생성 버튼을 누르지 않은 채 `/IWFND/MAINT_SERVICE` 리프레시만 주구장창 때리면, 외부 Fiori 앱은 신규 필드를 전혀 렌더링하지 못해 헤맨다.
  - **SEGW 프로젝트 정의를 바꿨다면 잊지 말고 Generate 격발을 수호해야 한다.**

### 정리

- **`SAP Gateway`** 는 백엔드 ABAP 데이터와 비즈니스를 웹 표준 **`OData`** HTTP URL 로 연결한다.
- 데이터 모델의 외형 셋업은 **`MPC`**, 실제 DB SELECT 연산은 **`DPC_EXT`** 클래스로 이원화 격리한다.
- 웹에 URL 주소를 개방 노출하기 위해 반드시 **`/IWFND/MAINT_SERVICE`** 에 서비스를 등록한다.

---

## CH31-L05 - OData V2 EntitySet 조회 구현

### 왜 필요한가

SEGW 프로젝트 뼈대 구성과 서비스 등록까지 마쳤다.
이제 OData 의 꽃인 '실제 목록 조회(GET_ENTITYSET) 메서드 구현' 과 '웹 페이징 가드선' 구축을 수행한다.
- "웹 Fiori 화면에서 스크롤을 내릴 때마다 10건씩 예약 리스트를 야금야금 SELECT 해서 화면에 부드럽게 뿌려주고 싶다.
이를 위해 웹 브라우저가 `$top = 10` (10건만 줘) 과 `$skip = 20` (앞에 20건 건너뛰고 21번째부터 10건 줘) 페이징 OData 쿼리를 날려왔다."
이 OData 쿼리를 접수해서 백엔드 SELECT 에 페이징 락을 걸어야 하는데, SQL 의 OFFSET 페이징 구문을 짤 때 데이터 정렬을 지정해 주는 **`ORDER BY`** 구문을 생략해 버리면, 아바 컴파일러가 신택스 에러를 내뿜고 시스템을 먹통으로 폭사시킨다.

**io_tech_request_context OData 쿼리(filter, top, skip)를 ABAP 조건으로 안전 수령하고, OFFSET 페이징 SQL 을 짤 때 ORDER BY 정렬 필드를 무조건 의무 선행 기재하여 페이징을 수호하는 기술**이 필요하다. 그것이 **OData V2 EntitySet 조회 구현** 이다.

### 무엇인가

#### 1. concertset_get_entityset (목록 조회 재정의 메서드)
- OData URL 로 `/ConcertSet` 목록을 호출할 때 웹 백엔드가 알아서 깨워 격발해 주는 DPC_EXT 클래스의 핵심 목록 조회 메서드다. 이 안방에 SELECT 를 기술한다.

#### 2. io_tech_request_context (OData 요청 분석기)
- 웹이 보내온 온갖 OData 쿼리 파라미터(`$filter` 조건, `$orderby` 정렬 지시 등)를 1:1 수령해 가이드하는 분석 제어 구조체다.

#### ⚠️ [ SQL OFFSET 페이징 적용 시 ORDER BY 정렬 선행 의무 명세]
- *OData 페이징 구현 시 입문자들이 100% 문법 컴파일 에러를 맞고 컴파일 장벽에 부딪히는 구문 제약이다.*
- 대량의 데이터를 웹 Fiori 그리드에 쪼개 뿌리기 위해 SQL 에 **`UP TO @iv_top ROWS`** 와 **`OFFSET @iv_skip`** 을 심어야 한다.
- **문법 에러 유발**: **정렬을 보장하는 `ORDER BY concert_id` 같은 정렬 필드 선언을 SELECT 구문 꼬리에 누락하고 `OFFSET` 만 단독으로 기재해 돌리면, 아바 SQL 엔진은 "정렬 순서가 보증되지 않은 상태에서는 어디부터 건너뛰어(OFFSET) 데이터를 수령할지 물리적으로 결정할 수 없다" 며 즉시 컴파일을 거절하고 신택스 에러를 때린다.**
- **철칙**: `OFFSET` 페이징 구문을 칠 때는 **무조건 `ORDER BY` 정렬 구문을 1순위로 선행 기입**해야 정합성이 통과된다.

### 어떻게 확인하는가

io_tech_request_context 로 필터를 수령하고 ORDER BY 와 OFFSET 을 결합해 et_entityset 에 적재하는 코드를 검증한다.

```abap
METHOD concertset_get_entityset.
  " 1. [OData $filter 쿼리 정보 수령]
  DATA(lt_filter) = io_tech_request_context->get_filter( )->get_filter_select_options( ).
  
  " 2. [OData $top / $skip 페이징 정보 수령]
  " (iv_top = 웹이 요청한 개수, iv_skip = 건너뛸 개수)
  
  " 3. [★ ORDER BY 정렬 + OFFSET 페이징 결합 SQL 격발]
  SELECT concert_id, artist, venue, capacity
    FROM zconcert
    INTO CORRESPONDING FIELDS OF TABLE @et_entityset " 최종 et_entityset 테이블에 적재!
    UP TO @iv_top ROWS
    " [★ 철칙: OFFSET 앞줄에 반드시 ORDER BY 가 선행되어야 함!]
    ORDER BY concert_id " 정렬 보장 의무 지정!
    OFFSET @iv_skip. " 페이징 건너뛰기 장착!
ENDMETHOD.
```

#### 체험/시뮬레이터 설계 (OData 쿼리 페이징 조작기)
- **프로세스 플로우**:
  1. 학습자가 [Fiori 웹 브라우저 URL 입력창] 을 본다.
  2. URL 꼬리에 `$top=5&$skip=0` 을 치고 요청을 보낸다. 1~5번 공연이 렌더링된다.
  3. `$top=5&$skip=5` 로 스크롤 동작을 날린다. 6~10번 공연이 렌더링되는 페이징을 확인한다.
  4. 이때 [ORDER BY 정렬 OFF] 상태로 소스 칩을 꽂아본다. 아바 SQL 전광판에 "Syntax Error! OFFSET requires ORDER BY" 컴파일 경고등이 요란하게 켜지는 비주얼 피드백을 감상한다.
- **상태 및 데이터**:
  - `$filter 수신 매핑을 생략하고 SELECT 에 쌩 쿼리를 때려 넣은 상태` -> 런타임 결과: `Filter ignored. Server memory capacity warning` 하이라이트.
- **피드백**: OData 목록 조회는 $filter 와 페이징($top/$skip)의 백엔드 SQL 매핑이 철저히 수반되어야 시스템 성능이 사수됨을 체득한다.

### 실수/주의

- **OData GET_ENTITYSET 내에서 $filter 조건을 SELECT 의 WHERE 절에 엮어주는 매핑 루프를 누락**:
  - 사용자는 화면에서 'BTS' 콘서트만 조회해 달라고 필터를 걸어 쐈는데, 백엔드가 필터를 씹고 10만 건 콘서트 전체를 SELECT 해 리턴해 주는 성능 먹통 대재앙을 유발한다.
  - **`get_filter_select_options( )` 의 필터 값을 WHERE 절에 바인딩 수호해야 한다.**

### 정리

- **`GET_ENTITYSET`** 은 OData V2 목록 조회를 위해 DPC_EXT 에서 재정의(Redefine)하는 핵심 포트다.
- OData 쿼리 파라미터는 **`io_tech_request_context`** 를 경유해 안전 획득한다.
- **`OFFSET`** 페이징을 구현할 때는 **`ORDER BY`** 정렬 지정을 무조건 1순위 선행 지정한다.
- *참고로 이 SEGW OData 기술은 클래식 게이트웨이 기술이며, Cloud 환경에선 RAP(RESTful Application Programming) 서비스 바인딩으로 자동 주조된다.*
