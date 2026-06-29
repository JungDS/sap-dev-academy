# CH31_REWRITE - IDoc / ALE / Gateway

> 기준 자료: `content/abap/CH31`, `reference/codex_0625/CH31_IDoc-ALE-Gateway.md`, `reference/codex_0625/00_QUALITY_REVIEW.md`
> 재집필 목표: IDoc/ALE와 Gateway/OData를 단순 용어 소개가 아니라 "연계 메시지를 만들고, 보내고, 실패를 추적하고, 웹 서비스로 노출하는 운영 흐름"으로 가르친다.
> Classic-first 경계: 이 장은 기존 SAP 현장에서 많이 만나는 Classic IDoc/ALE와 Classic Gateway(SEGW)를 중심으로 설명한다. ABAP Cloud와 RAP은 "신규 개발에서는 released API, RAP business service, service binding을 우선 검토한다"는 경계로만 다룬다.

## CH31 전체 강의 지도

CH30에서는 BAPI, RFC, BDC, 파일 인터페이스처럼 프로그램이 외부와 직접 주고받는 방식들을 배웠다. CH31에서는 한 단계 더 운영에 가까운 연계로 이동한다. 외부 시스템으로 주문을 통지해야 하고, 수신한 메시지가 실패했는지 매일 확인해야 하며, Fiori나 외부 웹 애플리케이션이 ABAP 데이터를 HTTP로 조회해야 하는 상황이다.

입문자는 이 장에서 두 가지 관점을 구분해야 한다. 첫째, IDoc/ALE는 "표준 메시지를 비동기로 보내고 운영자가 상태를 추적하는 방식"이다. 둘째, Gateway/OData는 "HTTP 요청에 대해 ABAP 백엔드가 데이터를 응답하는 방식"이다. 둘 다 시스템 연계지만, 하나는 메시지 중심이고 다른 하나는 서비스 호출 중심이다.

| 레슨 | 주제 | 학습 초점 | 대표 확인 지점 |
| --- | --- | --- | --- |
| CH31-L01 | IDoc 기본 구조 | 표준 메시지 컨테이너의 Control/Data/Status 구조 | `EDIDC`, `EDIDD`, `EDIDS`, `WE02`, `WE60` |
| CH31-L02 | ALE Distribution Model | 누가 누구에게 어떤 메시지를 보낼지 정하는 분배 설계 | `BD64`, `WE20`, `WE21`, `BD54`, `SM59` |
| CH31-L03 | IDoc 오류 추적과 재처리 | 상태코드로 실패를 찾고 원인 수정 후 재처리 | `WE02`, `WE05`, `BD87`, status `51`, `53` |
| CH31-L04 | Gateway SEGW 프로젝트 구조 | Classic Gateway OData 서비스의 모델, 구현, 런타임 구조 | `SEGW`, `MPC_EXT`, `DPC_EXT`, `/IWFND/MAINT_SERVICE` |
| CH31-L05 | OData V2 EntitySet 조회 구현 | `$filter`, `$top`, `$skip`을 ABAP SELECT로 매핑 | `GET_ENTITYSET`, `io_tech_request_context`, `et_entityset` |

수동 확인한 공식 근거는 세 묶음이다. Classic ABAP 문법은 `C:\ABAP_DOCU_HTML`에서 `abapmethod.htm`, `abapmethods.htm`, `abapmethods_redefinition.htm`, `abapselect_into_target.htm`, `abaporderby_clause.htm`, `abapselect_up_to_offset.htm`, `abapmessage.htm`, `abaptry.htm`, `abapcatch_try.htm`를 직접 확인했다. OData, Gateway, ABAP Cloud 경계는 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs`에서 `ABENODATA_GLOSRY.md`, `ABENSAP_GATEWAY_GLOSRY.md`, `ABENSERVICE_BINDING_GLOSRY.md`, `ABENBUSINESS_SERVICE_GLOSRY.md`, `ABENABAP_CLOUD_GLOSRY.md`, `ABENRELEASED_API_GLOSRY.md`를 확인했다. IDoc/ALE와 Classic Gateway 운영 개념은 로컬 ABAP Keyword Documentation의 주 범위를 벗어나므로 SAP Help Portal의 IDoc, IDoc Interface data, ALE Distribution Model, SAP Gateway method redefinition, Entity Set query option 문서를 보강 근거로 확인했다.

R15 기준으로 CH31은 Track 2 구간이다. CH18의 inline declaration과 constructor expression, CH19의 modern ABAP SQL, CH20의 class/method, CH23의 RAP 개요, CH24의 로그와 재처리, CH30의 인터페이스 운영 관점을 이미 배운 뒤다. 따라서 Gateway의 `DPC_EXT` method redefinition, OData query option, `SELECT ... INTO CORRESPONDING FIELDS OF TABLE @et_entityset UP TO @lv_top ROWS OFFSET @lv_skip` 같은 코드를 다룰 수 있다. 다만 ABAP Cloud 전용 구현으로 확장하지 않고, Classic Gateway와 RAP/service binding의 위치 차이를 경계로만 정리한다.

## CH31-L01 - IDoc 기본 구조

### 왜 필요한가

CH30에서 파일 인터페이스를 배울 때 "한 줄씩 읽고, 검증하고, 실패 건을 남긴 뒤 재처리한다"는 구조를 익혔다. 그런데 기업 간 거래나 SAP 시스템 간 표준 연계에서는 단순 파일 한 줄보다 더 많은 정보가 필요하다. 어떤 시스템이 보냈는지, 어떤 업무 메시지인지, 실제 데이터는 어떤 segment로 나뉘는지, 지금 처리 상태가 무엇인지, 실패했다면 어떤 메시지가 남았는지를 함께 들고 다녀야 한다.

IDoc(Intermediate Document)은 이 문제를 해결하는 SAP 표준 메시지 컨테이너다. 주문, 납품, 송장, 자재, 고객 같은 업무 메시지를 시스템 사이에서 비동기로 주고받을 때 사용한다. "비동기"라는 말은 상대 시스템이 즉시 응답해야만 다음 줄이 실행되는 RFC 호출과 다르다는 뜻이다. IDoc은 먼저 만들어지고, 전송되고, 상대 시스템에서 처리되고, 각 단계의 상태가 기록된다.

이 구조가 중요한 이유는 운영 때문이다. 현업에서 외부 주문 1,000건이 들어왔는데 37건이 실패했다면 개발자는 "함수가 실패했습니다"라고 말할 수 없다. 운영자는 어떤 IDoc이 실패했는지, 어느 segment 값이 문제인지, 상태 메시지가 무엇인지, 다시 처리할 수 있는지를 봐야 한다. IDoc은 이런 추적 가능한 표준 봉투를 제공한다.

### 무엇인가

IDoc은 크게 세 층으로 이해하면 된다.

| 층 | 대표 테이블 | 역할 | 입문자에게 필요한 해석 |
| --- | --- | --- | --- |
| Control Record | `EDIDC` | 발신 시스템, 수신 시스템, 메시지 타입, 방향, IDoc 번호 같은 머리 정보 | "이 메시지가 누구에게서 누구에게 가는가" |
| Data Records | `EDIDD` | 실제 업무 데이터 segment의 묶음 | "주문 헤더, 주문 품목처럼 실제 내용이 어디에 담겼는가" |
| Status Records | `EDIDS` | 처리 단계와 오류 메시지의 이력 | "지금 어디까지 처리됐고 왜 실패했는가" |

여기서 segment는 IDoc data record 안에 들어가는 데이터 조각이다. 주문 IDoc을 예로 들면 헤더 segment, 고객 segment, 품목 segment처럼 업무 구조별 조각이 있다. Basic Type은 IDoc의 구조 설계도다. 예를 들어 `ORDERS05`는 주문 IDoc이 어떤 segment 조합으로 구성되는지 정의한다. Message Type은 업무 의미다. `ORDERS`가 주문 메시지라는 의미라면, Basic Type은 그 주문 메시지의 실제 구조 버전이라고 보면 된다.

이 구분을 처음부터 분명히 해야 한다. Message Type은 "무슨 업무 메시지인가"이고, Basic Type은 "그 메시지가 어떤 segment 구조를 갖는가"이다. Control Record에는 이런 식별 정보가 들어가고, Data Records에는 실제 값이 들어가며, Status Records에는 생성, 전송, 수신, 오류, 성공 같은 처리 기록이 쌓인다.

### 어떻게 확인하는가

첫 번째 확인 지점은 `WE02` 또는 `WE05`다. 특정 IDoc 번호를 열어 Control Record에서 방향, 발신자, 수신자, Message Type, Basic Type을 본다. 입문자는 먼저 "이 IDoc은 inbound인가 outbound인가"를 말로 설명해 봐야 한다. 방향을 모르면 이후 status 해석이 틀어진다.

두 번째 확인 지점은 data record다. `WE02`에서 segment 목록을 열고 segment 이름과 반복 횟수를 확인한다. 예를 들어 헤더 segment는 한 번, 품목 segment는 여러 번 나올 수 있다. 같은 IDoc 안에서 segment가 반복되는 이유를 이해하면, 내부 테이블과 deep structure를 배운 내용이 실제 연계 데이터에서 어떻게 쓰이는지 보인다.

세 번째 확인 지점은 `WE60`이다. IDoc 문서 조회에서 Basic Type을 열어 어떤 segment가 어느 순서와 계층으로 배치되는지 확인한다. 실패한 IDoc만 보지 말고 정상 IDoc의 구조도 같이 봐야 한다. 정상 구조를 알아야 오류가 난 segment가 어느 위치의 어떤 의미인지 읽을 수 있다.

네 번째 확인 지점은 status record다. Status Records는 "현재 상태 하나"가 아니라 처리 이력이다. 어떤 시스템에서는 마지막 status만 보고 판단해도 되지만, 원인 분석에서는 이전 status 흐름이 중요하다. 예를 들어 outbound IDoc이 생성되었지만 전송되지 않았는지, 전송은 되었지만 상대 처리에서 실패했는지에 따라 담당자가 달라진다.

### 실수와 주의

가장 흔한 실수는 IDoc을 "한 개의 큰 문자열"처럼 생각하는 것이다. IDoc은 control, data, status가 분리된 구조이며, data도 segment 단위로 나뉜다. 그래서 오류를 볼 때도 "IDoc 실패"라고만 말하지 말고 "어느 status에서, 어떤 segment 값 때문에 실패했는가"까지 좁혀야 한다.

두 번째 실수는 Message Type과 Basic Type을 섞는 것이다. Message Type이 같아도 Basic Type 버전이나 extension에 따라 data record 구조가 달라질 수 있다. 운영에서 "ORDERS인데 왜 필드가 없나요?"라는 질문이 나오면 Basic Type과 extension을 확인해야 한다.

세 번째 실수는 방향을 혼동하는 것이다. Inbound는 우리 시스템이 받는 IDoc이고, Outbound는 우리 시스템이 보내는 IDoc이다. 같은 status 코드라도 방향에 따라 해석하는 화면, 담당 설정, 재처리 방식이 달라진다.

네 번째 실수는 status를 개발자만 보는 로그로 생각하는 것이다. Status Records는 운영자도 보는 업무 추적 정보다. 따라서 개발한 inbound function이나 exit에서 남기는 메시지는 원인을 설명할 수 있어야 한다. "Error occurred"처럼 모호한 메시지는 재처리 운영에 도움이 되지 않는다.

### 체험형 학습 설계

기존 체험물 `CH31-L01-S01`은 IDoc 3층 구조를 클릭 탐색하는 방식으로 사용한다. 화면에는 `EDIDC`, `EDIDD`, `EDIDS` 세 레이어가 세로로 쌓여 있고, 학습자가 각 레이어를 클릭하면 오른쪽 또는 아래 detail 영역에 "이 층에 어떤 값이 들어가는지"가 표시된다.

학습 흐름은 네 단계가 적합하다. 먼저 기본 상태에서는 `ORDERS05` 예시 IDoc 한 건이 선택되어 있고, Control Record에는 sender, receiver, message type, direction이 보인다. 학습자가 Data Records를 누르면 헤더 segment 1건과 품목 segment 3건이 펼쳐지고, segment 반복이 왜 필요한지 피드백을 준다. Status Records를 누르면 `03`, `12`, `53` 또는 오류 케이스에서는 `51` 같은 상태 이력이 시간순으로 보인다. 마지막으로 "오류 IDoc 보기" 버튼을 두면 필수 segment가 빠진 샘플로 바뀌고, data record와 status record를 연결해서 읽게 한다.

피드백 문구는 단순 설명이 아니라 판단 질문이어야 한다. 예를 들어 "이 IDoc은 inbound인가 outbound인가?", "실제 주문 품목은 어느 층에 있는가?", "실패 원인은 structure 자체인가, data value인가?"를 화면 아래에 표시한다. 학습자가 Control/Data/Status를 모두 눌렀을 때만 "WE02에서 같은 순서로 확인한다"는 정리 메시지를 보여 주면, 시각 탐색과 실제 SAP 화면 동선이 연결된다.

### 정리

IDoc은 SAP 표준 메시지 봉투다. Control Record는 누가 누구에게 어떤 메시지를 보내는지, Data Records는 실제 업무 데이터를 segment로, Status Records는 처리 이력과 오류를 담는다. `WE02`/`WE05`로 IDoc을 보고, `WE60`으로 Basic Type 구조를 확인한다. 다음 레슨에서는 이 IDoc을 어느 시스템에서 어느 시스템으로 보낼지 정하는 ALE Distribution Model을 배운다.

## CH31-L02 - ALE Distribution Model

### 왜 필요한가

IDoc 구조를 이해했다면 다음 질문은 "누가 누구에게 이 메시지를 보내는가"이다. IDoc 자체는 봉투와 내용물이다. 하지만 봉투를 어느 주소로 보낼지, 어떤 메시지 타입을 어떤 상대에게 보낼지, 전송 경로는 RFC인지 파일인지, 수신 쪽에서는 어떤 처리 함수를 실행할지 정하지 않으면 IDoc은 운영 흐름이 되지 못한다.

ALE(Application Link Enabling)는 SAP 시스템 사이에서 업무 데이터를 분산 처리하기 위한 연계 틀이다. 여기서 Distribution Model은 발신 시스템, 수신 시스템, 메시지 타입의 관계를 정의한다. 쉽게 말해 "A 시스템에서 생성된 주문 변경 메시지는 B 시스템으로 보낸다" 같은 연계 규칙을 모델로 관리한다.

이 레슨이 필요한 이유는 실무 오류의 상당수가 코드가 아니라 설정에서 발생하기 때문이다. IDoc 생성 프로그램은 정상인데 Partner Profile이 없어서 처리되지 않거나, Port가 잘못되어 다른 RFC destination으로 가거나, Logical System 이름이 client와 맞지 않아 엉뚱한 대상으로 보내는 일이 많다. ALE는 개발자도 운영 설정을 읽을 수 있어야 하는 영역이다.

### 무엇인가

ALE 연계 흐름은 다음 구성요소로 나눠서 봐야 한다.

| 구성요소 | 대표 T-code | 역할 |
| --- | --- | --- |
| Logical System | `BD54` | SAP client 또는 외부 시스템을 논리 이름으로 식별 |
| Distribution Model | `BD64` | 발신자, 수신자, Message Type 관계를 정의하고 배포 |
| Partner Profile | `WE20` | 파트너별 inbound/outbound 처리 방식, message type, process code, port 설정 |
| Port | `WE21` | 실제 전송 경로. tRFC, 파일 등 전송 방식과 목적지를 연결 |
| RFC Destination | `SM59` | tRFC port가 참조하는 원격 접속 대상 |

이 구성은 "모델, 파트너, 통로"로 기억하면 쉽다. Distribution Model은 어떤 메시지를 보낼지 정하는 설계도다. Partner Profile은 특정 파트너에게 메시지를 주고받을 때 어떤 처리 방식과 process code를 쓸지 정하는 계약이다. Port는 실제 이동 경로다. Logical System은 시스템의 주소 이름이다.

Outbound 흐름을 예로 들면, 발신 시스템에서 업무 이벤트가 발생하고 Message Type에 맞는 IDoc이 생성된다. Partner Profile이 해당 메시지의 outbound 설정을 찾고, Port를 통해 수신 시스템으로 보낸다. 수신 시스템에서는 inbound Partner Profile과 process code에 따라 처리 function 또는 처리 로직이 호출된다.

### 어떻게 확인하는가

첫 번째 확인은 Logical System이다. `BD54`에서 논리 시스템 이름을 확인하고, client에 어떤 logical system이 할당되어 있는지 확인한다. 개발 환경과 테스트 환경을 복사한 뒤 이 이름이 꼬이면 IDoc이 예상과 다른 partner로 흐를 수 있다.

두 번째 확인은 `BD64`의 Distribution Model이다. 발신자, 수신자, Message Type이 정확히 연결되어 있는지 본다. 모델을 만들기만 하고 배포하지 않으면 상대 시스템과 설정이 맞지 않는다. 따라서 "모델이 있다"와 "배포되어 양쪽이 일치한다"를 구분해서 확인해야 한다.

세 번째 확인은 `WE20` Partner Profile이다. Outbound라면 Message Type, receiver port, output mode, package size, process code 또는 관련 설정을 확인한다. Inbound라면 Message Type별 process code와 처리 function 연결을 본다. IDoc이 생성되었는데 처리되지 않는다면 Partner Profile 누락 또는 inbound parameter 누락을 먼저 의심한다.

네 번째 확인은 `WE21`과 `SM59`다. Port가 어떤 RFC destination 또는 파일 경로를 가리키는지 확인한다. RFC destination은 connection test만 볼 것이 아니라 logon, authorization, target client, user type도 함께 봐야 한다. CH30의 RFC에서 배운 통신 실패와 권한 실패가 ALE에서도 그대로 나타난다.

마지막 확인은 실제 IDoc 상태다. Outbound 테스트 후 `WE02`에서 status가 생성, 전송, 성공 또는 오류로 어떻게 바뀌는지 본다. 설정 확인은 화면만 보는 것으로 끝나지 않는다. 최소 한 건의 테스트 IDoc을 만들어 status 흐름으로 증명해야 한다.

### 실수와 주의

가장 흔한 실수는 `BD64`만 만들고 Partner Profile을 빼먹는 것이다. Distribution Model은 "보내야 한다"는 관계를 정의하지만, Partner Profile은 "어떻게 처리할 것인가"를 정한다. 둘 중 하나만 있으면 운영 흐름이 완성되지 않는다.

두 번째 실수는 Port와 RFC destination을 같은 것으로 생각하는 것이다. Port는 IDoc 전송 설정의 이름이고, RFC destination은 원격 접속 대상이다. tRFC port가 RFC destination을 참조할 수 있지만 둘은 같은 개념이 아니다. 장애 분석에서는 Port가 무엇을 가리키는지 한 단계 더 들어가야 한다.

세 번째 실수는 개발 시스템 설정을 운영 시스템에 그대로 복사하는 것이다. Logical System, RFC destination, partner number는 환경별로 달라질 수 있다. Transport로 옮길 항목과 운영에서 직접 맞춰야 할 항목을 구분해야 한다.

네 번째 실수는 모델 배포를 잊는 것이다. ALE model은 만든 뒤 distribute해야 상대 시스템과 일관성을 맞출 수 있다. "내 시스템에는 보이는데 상대 시스템에는 없다"는 상태는 실무에서 자주 발생한다.

### 체험형 학습 설계

기존 체험물 `CH31-L02-S01`은 ALE 흐름을 mermaid diagram으로 보여 준다. 발신 시스템에서 Outbound Partner Profile, Port, Inbound Partner Profile, 수신 시스템으로 이어지는 흐름 위에 Distribution Model이 점선으로 연결되어 있다.

학습 효과를 높이려면 이 흐름도를 "설정 완성도 점검판"으로 설명한다. 학습자는 먼저 발신 시스템 노드를 보고 Logical System 이름을 적는다. 다음으로 `BD64` 노드를 보고 sender, receiver, message type 조합을 확인한다. 그다음 `WE20` 노드에서 outbound parameter와 inbound parameter가 모두 있는지 확인한다. 마지막으로 `WE21`과 `SM59` 노드에서 실제 전송 경로를 확인한다.

버튼형 시뮬레이터로 확장한다면 네 개의 토글이 적합하다. `Distribution Model 있음`, `Partner Profile 있음`, `Port/RFC 정상`, `모델 배포 완료`를 켜고 끄게 한다. `IDoc 발행` 버튼을 누르면 모든 조건이 맞을 때만 "status 03/12로 전송 진행"을 보여 준다. Partner Profile이 꺼져 있으면 "IDoc은 생성될 수 있지만 처리 계약이 없어 멈춘다"는 피드백을 준다. Port가 틀리면 "통신 경로 오류이므로 WE21/SM59 확인"을 표시한다. 이런 식으로 설정 누락을 코드 오류와 분리해서 판단하게 만든다.

### 정리

ALE Distribution Model은 IDoc의 라우팅 설계다. `BD64`는 누가 누구에게 어떤 message type을 보낼지 정의하고, `WE20`은 partner별 처리 계약을, `WE21`과 `SM59`는 전송 경로를 담당한다. IDoc이 만들어졌다고 연계가 끝난 것이 아니다. 모델, partner profile, port, logical system, 실제 status까지 이어서 확인해야 한다. 다음 레슨에서는 이렇게 흘러간 IDoc이 실패했을 때 어떻게 추적하고 재처리하는지 배운다.

## CH31-L03 - IDoc 오류 추적과 재처리

### 왜 필요한가

IDoc 연계의 장점은 실패가 남는다는 것이다. 하지만 실패가 남는다는 사실만으로 운영이 안정되는 것은 아니다. 실패한 IDoc을 누가 언제 확인할지, 어떤 원인을 먼저 고칠지, 재처리를 해도 되는지, 다시 실패하면 어떻게 기록할지까지 정해져 있어야 한다.

실무에서 IDoc 오류는 단순한 개발 오류보다 업무 데이터 오류가 많다. 고객 번호가 없거나, 자재가 상대 시스템에 없거나, 단위가 맞지 않거나, partner profile의 process code가 잘못되었거나, 권한과 customizing이 맞지 않을 수 있다. 이런 오류를 해결하지 않고 재처리 버튼만 누르면 같은 실패가 반복된다.

이 레슨의 목표는 "BD87을 누르면 된다"가 아니다. 먼저 status code와 message를 읽고, 원인을 분류하고, 원인을 수정한 뒤, 재처리 결과를 확인하는 운영 루프를 익히는 것이다. CH24에서 배운 오류 로그와 재처리 구조가 IDoc 모니터링 화면에서 실제로 보이는 셈이다.

### 무엇인가

IDoc status는 처리 단계마다 기록되는 상태 코드다. 시스템마다 세부 status 사용은 다를 수 있지만, 입문자가 먼저 알아야 할 대표 코드는 다음과 같다.

| Status | 방향 | 의미 | 운영 해석 |
| --- | --- | --- | --- |
| `03` | Outbound | IDoc이 port로 전달됨 | 발신 시스템에서 전송 단계까지 진행 |
| `12` | Outbound | Dispatch successful | 전송 처리 성공으로 해석하는 대표 상태 |
| `51` | Inbound | Application document not posted | 수신 후 업무 처리 오류. 원인 수정 후 재처리 필요 |
| `53` | Inbound | Application document posted | 수신 업무 문서 생성 성공 |
| `64` | Inbound | Ready to be transferred to application | 처리 대기 상태. background job 또는 수동 처리 확인 |

`WE02`와 `WE05`는 IDoc 조회와 모니터링에 사용한다. status, message type, partner, 생성일자, 방향 등으로 필터링해 실패 건을 찾는다. `BD87`은 IDoc 재처리에 사용한다. `WE19`는 테스트 IDoc을 만들거나 기존 IDoc을 복사해 테스트할 때 사용한다.

중요한 점은 status `51` 자체가 원인이 아니라 결과라는 것이다. 원인은 status detail message, data record 값, 수신 처리 function의 메시지, customizing, master data, 권한, partner profile 중 하나에 있다. `BD87`은 원인을 고친 뒤 다시 application processing을 시도하는 도구다.

### 어떻게 확인하는가

첫 번째 확인은 `WE02`에서 실패 IDoc을 찾는 것이다. 필터는 status `51`, message type, partner, 생성일자, 방향으로 좁힌다. 목록에서 IDoc 번호를 열고 Control Record를 먼저 확인한다. 잘못된 partner나 message type이면 data 값보다 설정 문제를 먼저 의심해야 한다.

두 번째 확인은 status detail이다. Status Records에서 마지막 오류 status를 열고 message text, message class, message number를 확인한다. 오류 메시지가 "customer does not exist"라면 master data 문제이고, "no inbound process code found"라면 partner profile 또는 customizing 문제다. 메시지를 원인 분류로 번역하는 습관이 중요하다.

세 번째 확인은 data record다. 오류 메시지가 특정 필드나 segment를 가리키면 해당 segment를 열어 값을 확인한다. segment 구조가 낯설면 `WE60`에서 Basic Type 구조를 다시 확인한다. data record를 보는 목적은 "값이 들어 있다"가 아니라 "수신 처리 로직이 기대하는 의미와 형식인가"를 판단하는 것이다.

네 번째 확인은 원인 수정 후 재처리다. master data나 customizing을 고친 뒤 `BD87`에서 해당 IDoc을 선택해 재처리한다. 성공하면 status가 `53`으로 바뀌는지 확인하고, 실패하면 새 status message가 무엇인지 다시 읽는다. 한 번의 재처리로 끝나지 않을 수 있으므로 status 이력을 남기고 반복 원인을 분류해야 한다.

다섯 번째 확인은 운영 기준이다. 매일 status `51`을 조회할 담당자, 오래된 오류의 escalation 기준, 자동 재처리 대상과 수동 확인 대상, 재처리 횟수 제한, 업무팀에 전달할 메시지 형식을 정해야 한다. 그렇지 않으면 IDoc 모니터는 있어도 실제 업무 누락은 계속 발생한다.

### 실수와 주의

가장 위험한 실수는 원인을 고치지 않고 `BD87`을 반복 실행하는 것이다. 데이터 오류는 데이터가 바뀌거나 master/customizing이 고쳐져야 해결된다. 재처리는 처리 기회를 다시 주는 것이지 오류를 자동으로 고치는 기능이 아니다.

두 번째 실수는 status `03`을 최종 업무 성공으로 오해하는 것이다. Outbound에서 `03`은 발신 측 전송 단계의 상태다. 상대 시스템에서 inbound 업무 문서가 성공적으로 생성되었는지는 별도 확인이 필요하다. 특히 양방향 monitoring 기준이 없으면 발신 시스템은 성공처럼 보이는데 수신 시스템에서는 실패한 상태가 될 수 있다.

세 번째 실수는 실패 IDoc을 임의로 수정하는 것이다. 운영 시스템에서 IDoc data를 직접 바꾸는 행위는 감사와 정합성에 영향을 준다. 테스트 환경에서는 학습 목적으로 `WE19`를 사용할 수 있지만, 운영에서는 승인된 절차와 로그 없이 원본 메시지를 바꾸면 안 된다.

네 번째 실수는 대량 재처리를 한 번에 실행하는 것이다. 같은 원인으로 실패한 5,000건을 원인 확인 없이 재처리하면 시스템 부하와 반복 실패 로그만 늘어난다. 먼저 대표 샘플 몇 건으로 원인을 확인하고, 수정 후 작은 묶음으로 재처리 결과를 검증해야 한다.

### 체험형 학습 설계

기존 체험물 `CH31-L03-S01`은 IDoc status lifecycle을 직접 바꿔 보는 시뮬레이터로 사용한다. 버튼은 `전송(Outbound)`, `수신 처리(Inbound)`, `오류 주입`, `BD87 재처리`, `초기화`로 구성되어 있다.

학습자는 처음에 `전송`을 눌러 outbound 상태가 생기는 것을 본다. 이어서 `수신 처리`를 누르면 오류 주입이 꺼져 있을 때 `53` 성공으로 끝난다. 오류 주입을 켜면 수신 처리 후 `51`에 멈추고, 화면에는 "마스터 데이터 불일치" 같은 원인 메시지를 보여 준다. 이때 `BD87 재처리` 버튼은 바로 성공하지 않고, 먼저 "원인 수정 완료" 상태를 요구하는 방식으로 설계하면 더 좋다.

결과 영역은 timeline 형태가 적합하다. 각 status 옆에는 시간, 방향, 메시지, 운영자가 해야 할 다음 행동을 표시한다. 예를 들어 `51` 옆에는 "WE02 status message 확인 -> segment 값 확인 -> master/customizing 수정 -> BD87"을 보여 준다. `53`에 도달하면 "업무 문서 생성 성공. 재처리 로그와 IDoc 번호를 남긴다"는 완료 피드백을 준다.

평가 과제는 짧지만 실제 운영형이어야 한다. 학습자에게 status `51` IDoc 샘플을 주고, 원인이 data value인지 customizing인지 partner profile인지 분류하게 한다. 답은 한 단어가 아니라 "어디 화면에서 무엇을 확인했는가"로 제출하게 한다.

### 정리

IDoc 운영의 핵심은 status를 읽고 원인을 고친 뒤 재처리하는 루프다. `WE02`/`WE05`로 실패를 찾고, status detail과 data record를 읽고, `BD87`로 재처리한다. `51`은 원인이 아니라 실패 결과다. 원인을 고치지 않는 재처리는 같은 실패를 반복할 뿐이다. 다음 레슨에서는 메시지 기반 연계와 다른 축인 Classic Gateway OData 구조를 배운다.

## CH31-L04 - Gateway SEGW 프로젝트 구조

### 왜 필요한가

IDoc/ALE는 시스템 사이에서 표준 메시지를 주고받는 방식이다. 하지만 웹 화면, 모바일 앱, Fiori, 외부 서비스가 "지금 예매 목록을 조회해 달라"라고 요청할 때는 메시지 봉투보다 HTTP 서비스가 더 자연스럽다. 이때 ABAP 백엔드 데이터를 OData 서비스로 노출하는 대표적인 Classic 방식이 SAP Gateway와 `SEGW` 프로젝트다.

CH23에서 RAP을 배웠다면 "요즘은 RAP service binding으로 OData를 노출할 수 있지 않나?"라는 질문이 생긴다. 맞다. 신규 ABAP Cloud 또는 Clean Core 방향에서는 RAP, released API, service binding을 우선 검토한다. 하지만 현장에는 Classic Gateway로 만든 서비스가 매우 많다. 유지보수자는 `SEGW` 프로젝트, `DPC_EXT`, `MPC_EXT`, `/IWFND/MAINT_SERVICE`, Gateway Client, error log를 읽을 수 있어야 한다.

이 레슨의 목표는 `SEGW` 버튼을 외우는 것이 아니다. OData 서비스가 모델, 구현, 등록, 테스트, 오류 로그로 나뉘어 운영된다는 구조를 이해하는 것이다. 구조를 알아야 다음 레슨에서 `GET_ENTITYSET` 메서드를 어디에 왜 구현하는지 이해할 수 있다.

### 무엇인가

SAP Gateway는 AS ABAP을 OData 같은 표준 open protocol로 접근할 수 있게 해 주는 framework다. 로컬 ABAP glossary에서도 OData는 RESTful API를 정의하고 소비하기 위한 표준 프로토콜이며, SAP Gateway가 AS ABAP에 대해 그런 API를 제공한다고 설명한다.

Classic `SEGW` 프로젝트는 보통 다음 영역으로 나뉜다.

| 영역 | 대표 요소 | 역할 |
| --- | --- | --- |
| Data Model | `EntityType`, `EntitySet`, `Association` | 외부에 보일 데이터 모양과 관계를 정의 |
| Service Implementation | `GetEntitySet`, `GetEntity`, `Create`, `Update`, `Delete` | 각 OData operation을 어떤 ABAP 로직으로 처리할지 연결 |
| Runtime Artifacts | `*_MPC`, `*_MPC_EXT`, `*_DPC`, `*_DPC_EXT` | 생성된 provider class와 확장 class |
| Service Registration | `/IWFND/MAINT_SERVICE` | 서비스를 Gateway hub 또는 embedded system에 등록 |
| Test/Log | `/IWFND/GW_CLIENT`, `/IWFND/ERROR_LOG`, `/IWBEP/ERROR_LOG` | 요청 테스트와 오류 분석 |

`MPC`는 Model Provider Class다. EntityType, property, metadata 같은 모델 정보를 담당한다. `DPC`는 Data Provider Class다. 실제 데이터를 읽고, 만들고, 수정하고, 삭제하는 ABAP 로직이 여기에 들어간다. 생성된 base class를 직접 고치지 않고 `*_MPC_EXT`, `*_DPC_EXT` 확장 class에 구현하는 이유는 재생성 때 코드가 날아가지 않게 하기 위해서다.

EntityType과 EntitySet도 구분해야 한다. EntityType은 한 건의 구조다. 예를 들어 `Concert`가 `concert_id`, `artist`, `venue`, `capacity` 필드를 가진 한 건의 타입이라면, EntitySet인 `ConcertSet`은 그런 Concert 여러 건의 collection이다. 웹에서 `/ConcertSet`을 호출하면 여러 concert 목록을 받는 식이다.

### 어떻게 확인하는가

첫 번째 확인은 `SEGW` 프로젝트 구조다. Data Model 아래의 EntityType과 EntitySet 이름을 확인한다. 외부 URL에 노출될 이름이므로 ABAP 내부 테이블명과 다를 수 있다. property 이름, key 지정, nullable 여부, type mapping을 확인한다.

두 번째 확인은 Runtime Artifacts다. Generate Runtime Objects 후 어떤 class가 생성되었는지 본다. `*_MPC_EXT`에는 모델 보강 로직이, `*_DPC_EXT`에는 데이터 처리 로직이 들어간다. 다음 레슨의 `GET_ENTITYSET` 구현 위치는 `DPC_EXT`다.

세 번째 확인은 service registration이다. `SEGW`에서 생성했다고 바로 외부 URL로 호출되는 것이 아니다. `/IWFND/MAINT_SERVICE`에서 서비스를 등록하고 활성화해야 `/sap/opu/odata/sap/<SERVICE_NAME>/...` 형태로 호출할 수 있다. 등록 누락은 개발자가 자주 만나는 "코드는 있는데 URL이 안 된다" 유형의 오류다.

네 번째 확인은 `$metadata`다. `/IWFND/GW_CLIENT` 또는 브라우저에서 `/sap/opu/odata/sap/ZCONCERT_SRV/$metadata`를 호출해 EntityType, EntitySet, property가 예상대로 노출되는지 본다. 모델이 틀리면 데이터 조회 구현을 보기 전에 metadata부터 고쳐야 한다.

다섯 번째 확인은 error log다. HTTP 500, 403, 404 같은 오류가 나오면 ABAP dump만 볼 것이 아니라 `/IWFND/ERROR_LOG`, `/IWBEP/ERROR_LOG`, ST22, authorization trace를 함께 확인한다. Gateway 오류는 모델, 등록, 권한, 서비스 활성화, ABAP 구현, HTTP method가 섞여 나타날 수 있다.

### 실수와 주의

가장 흔한 실수는 generated base class를 직접 수정하는 것이다. `*_DPC`나 `*_MPC` base class는 재생성 시 덮일 수 있다. 업무 로직은 `*_DPC_EXT`, 모델 확장은 `*_MPC_EXT`에 둬야 한다.

두 번째 실수는 EntityType과 EntitySet을 섞는 것이다. EntityType은 한 건의 구조이고, EntitySet은 그 구조의 목록이다. `GET_ENTITY`와 `GET_ENTITYSET`이 헷갈리는 이유도 이 구분이 약하기 때문이다. 목록 조회는 EntitySet, 단건 조회는 key가 있는 Entity다.

세 번째 실수는 서비스 등록을 빼먹는 것이다. `SEGW` 프로젝트가 active이고 class가 생성되어도 `/IWFND/MAINT_SERVICE` 등록이 없으면 소비자가 호출할 endpoint가 준비되지 않는다.

네 번째 실수는 Classic Gateway와 RAP을 한 문장으로 섞어 버리는 것이다. Classic Gateway는 `SEGW`, generated provider class, method redefinition 중심이다. RAP은 CDS, behavior, service definition, service binding 중심이다. 둘 다 OData를 만들 수 있지만 개발 모델과 Cloud 적합성이 다르다. 이 장에서는 기존 SEGW 자산 이해가 목표이고, 신규 Cloud 설계는 RAP/service binding 우선이라는 경계만 기억한다.

### 체험형 학습 설계

기존 체험물 `CH31-L04-S01`은 `SEGW` 프로젝트 구조를 tree로 펼쳐 보는 방식이다. 루트에는 `ZCONCERT_SRV`가 있고, 아래에 Data Model, Service Implementation, Runtime Artifacts가 있다. 학습자는 폴더를 눌러 EntityType, EntitySet, Association, `MPC_EXT`, `DPC_EXT`를 확인한다.

학습 시나리오는 "URL 하나가 호출되기까지 필요한 구조 찾기"가 좋다. 먼저 화면 상단에 `/sap/opu/odata/sap/ZCONCERT_SRV/ConcertSet` URL을 보여 준다. 학습자가 `ConcertSet` 노드를 펼치면 이것이 EntitySet임을 알려 준다. `Concert` EntityType을 누르면 property와 key를 보여 준다. `Service Implementation`을 펼치면 `ConcertSet -> GetEntitySet` 연결을 보여 주고, `Runtime Artifacts`에서 `DPC_EXT`를 누르면 "여기에 다음 레슨의 조회 코드가 들어간다"는 피드백을 준다.

오류 케이스도 포함해야 한다. `서비스 미등록` 상태를 선택하면 URL 영역에 404 또는 service not found 유형의 메시지를 표시하고 `/IWFND/MAINT_SERVICE` 확인을 안내한다. `모델 불일치` 상태를 선택하면 `$metadata`에는 property가 없는데 응답에는 값을 채우려는 상황을 보여 준다. `DPC_EXT 미구현` 상태를 선택하면 빈 목록 또는 method not implemented 흐름을 보여 준다.

### 정리

Classic Gateway의 `SEGW` 프로젝트는 모델, 구현, 런타임 class, 서비스 등록, 테스트/로그로 나뉜다. 모델은 `MPC_EXT`, 데이터 로직은 `DPC_EXT`가 중심이다. EntityType은 한 건의 모양이고 EntitySet은 목록이다. `/IWFND/MAINT_SERVICE` 등록과 `$metadata` 확인 없이는 서비스가 완성되었다고 볼 수 없다. 다음 레슨에서는 `GET_ENTITYSET`을 재정의해 실제 목록 조회를 구현한다.

## CH31-L05 - OData V2 EntitySet 조회 구현

### 왜 필요한가

Gateway 구조를 이해했다면 이제 소비자가 실제로 데이터를 요청했을 때 어떤 일이 일어나는지 봐야 한다. 예를 들어 Fiori 화면이 공연 목록을 조회하면서 `ConcertSet?$filter=Venue eq '서울'&$top=10&$skip=20` 같은 URL을 호출할 수 있다. 이 요청을 ABAP 백엔드가 받아 database 조회로 바꾸고, 결과를 `et_entityset`에 채워 돌려주는 메서드가 `GET_ENTITYSET`이다.

입문자가 여기서 가장 경계해야 할 생각은 "SELECT 해서 전부 넘기면 되겠지"이다. 서비스는 화면과 다르다. 호출자는 많을 수 있고, 네트워크를 타고, 응답 크기가 성능에 영향을 주며, filter와 paging을 무시하면 데이터 정합성과 사용성이 깨진다. 특히 `$top`과 `$skip`은 목록 화면의 paging에 직접 연결된다. 정렬 없는 skip은 매번 다른 결과를 만들 수 있으므로 `ORDER BY`가 필요하다.

이 레슨은 CH08의 SELECT, CH19의 modern ABAP SQL, CH20의 method, CH31-L04의 `DPC_EXT` 구조를 합친다. 이미 배운 재료로 "웹 요청을 ABAP 조회로 번역하는 방법"을 만드는 것이다.

### 무엇인가

Classic Gateway에서 EntitySet 목록 조회는 보통 `*_DPC_EXT` class의 `<entityset>_GET_ENTITYSET` method를 redefine해서 구현한다. 이 method는 OData request context를 받고, 결과 table인 `et_entityset`을 채워 반환한다.

핵심 매핑은 다음과 같다.

| OData 요청 | ABAP 구현에서의 의미 |
| --- | --- |
| `/ConcertSet` | Concert 목록 전체 또는 기본 제한 목록 조회 |
| `$filter=Venue eq '서울'` | WHERE 조건 또는 range 조건 |
| `$top=10` | 최대 10건 |
| `$skip=20` | 앞의 20건 건너뛰기 |
| `$orderby=ConcertId` | 안정적인 정렬 기준 |
| response body | `et_entityset`에 채운 internal table |

아래 코드는 학습용 예시다. 실제 Gateway project의 method signature와 type 이름은 생성된 서비스에 따라 다르다. 중요한 것은 request option을 읽고, filter와 paging을 SELECT에 반영하고, 결과를 `et_entityset`에 채우는 흐름이다.

```abap
METHOD concertset_get_entityset.
  DATA lt_select_options TYPE /iwbep/t_mgw_select_option.
  DATA lr_venue          TYPE RANGE OF zconcert-venue.
  DATA lv_top            TYPE i VALUE 100.
  DATA lv_skip           TYPE i VALUE 0.

  lt_select_options =
    io_tech_request_context->get_filter( )->get_filter_select_options( ).

  IF iv_top IS NOT INITIAL AND iv_top <= 100.
    lv_top = iv_top.
  ENDIF.

  lv_skip = iv_skip.

  READ TABLE lt_select_options INTO DATA(ls_filter)
       WITH KEY property = 'Venue'.
  IF sy-subrc = 0.
    lr_venue = CORRESPONDING #( ls_filter-select_options ).
  ENDIF.

  IF lr_venue IS INITIAL.
    SELECT concert_id, artist, venue, capacity
      FROM zconcert
      ORDER BY concert_id
      INTO CORRESPONDING FIELDS OF TABLE @et_entityset
      UP TO @lv_top ROWS
      OFFSET @lv_skip.
  ELSE.
    SELECT concert_id, artist, venue, capacity
      FROM zconcert
      WHERE venue IN @lr_venue
      ORDER BY concert_id
      INTO CORRESPONDING FIELDS OF TABLE @et_entityset
      UP TO @lv_top ROWS
      OFFSET @lv_skip.
  ENDIF.
ENDMETHOD.
```

로컬 ABAP 문서 기준으로 `METHOD ... ENDMETHOD`는 class implementation part에서 method 기능을 구현하는 문법이다. `METHODS ... REDEFINITION`은 subclass에서 상속받은 instance method를 다시 구현하는 문법이다. `SELECT ... INTO target`은 result set을 work area나 internal table 같은 target에 쓰며, `UP TO n ROWS`와 `OFFSET o`는 읽을 row 수와 건너뛸 row 수를 제한한다. `OFFSET`은 `ORDER BY`가 있어야 사용할 수 있고, `ORDER BY`가 없으면 결과 순서는 정의되지 않는다. 그래서 paging 조회에서는 안정적인 `ORDER BY`가 핵심이다.

### 어떻게 확인하는가

첫 번째 확인은 `$metadata`다. `ConcertSet`이라는 EntitySet이 실제로 metadata에 있는지, property 이름이 `ConcertId`, `Artist`, `Venue`, `Capacity`처럼 외부 이름으로 어떻게 노출되는지 확인한다. ABAP 필드명과 OData property 이름이 다르면 filter property 매핑도 달라질 수 있다.

두 번째 확인은 Gateway Client다. `/IWFND/GW_CLIENT`에서 다음과 같은 요청을 순서대로 실행한다.

```text
/sap/opu/odata/sap/ZCONCERT_SRV/ConcertSet
/sap/opu/odata/sap/ZCONCERT_SRV/ConcertSet?$filter=Venue eq '서울'
/sap/opu/odata/sap/ZCONCERT_SRV/ConcertSet?$filter=Venue eq '서울'&$top=3
/sap/opu/odata/sap/ZCONCERT_SRV/ConcertSet?$filter=Venue eq '서울'&$top=3&$skip=3
```

각 요청에서 HTTP status가 `200`인지, 응답 건수가 예상과 맞는지, `$top`을 바꾸면 건수가 바뀌는지, `$skip`을 바꾸면 다음 page가 나오는지 확인한다. 같은 요청을 두 번 실행했을 때 row 순서가 흔들리면 `ORDER BY`가 부족한 것이다.

세 번째 확인은 ABAP debugger다. `GET_ENTITYSET`에 breakpoint를 걸고 `io_tech_request_context`에서 filter select options가 어떻게 들어오는지 본다. property 이름이 예상과 다르면 metadata와 Gateway model mapping을 다시 확인한다.

네 번째 확인은 오류 로그다. HTTP 500이면 `/IWFND/ERROR_LOG`, `/IWBEP/ERROR_LOG`, ST22를 확인한다. 403이면 권한, 404이면 service 등록과 URL, 400이면 query option 문법이나 property 이름을 먼저 의심한다. Gateway 오류는 브라우저 메시지만으로 판단하지 말고 backend log와 함께 봐야 한다.

다섯 번째 확인은 성능이다. filter 없는 전체 조회, `$top` 없는 대량 조회, 정렬 없는 paging은 운영에서 위험하다. ST05 SQL trace나 runtime analysis로 실제 SELECT가 기대한 WHERE, ORDER BY, row limit을 사용하고 있는지 확인한다.

### 실수와 주의

가장 큰 실수는 `$filter`를 무시하고 전체 데이터를 반환하는 것이다. 처음에는 화면에 데이터가 보여서 성공처럼 보이지만, 데이터가 많아지면 응답이 느려지고 사용자가 다른 조건을 선택해도 결과가 바뀌지 않는다. 서비스는 요청 option을 계약으로 받아들여야 한다.

두 번째 실수는 `$top`과 `$skip`을 무시하는 것이다. 목록 화면은 page 단위로 데이터를 요청한다. 서버가 항상 전체 데이터를 보내면 network, memory, response time이 모두 나빠진다. 특히 mobile이나 Fiori list report에서는 paging이 사용자 경험과 직결된다.

세 번째 실수는 `OFFSET`을 쓰면서 안정적인 `ORDER BY`를 두지 않는 것이다. ABAP 문서에서도 `ORDER BY`가 없으면 row 순서는 정의되지 않으며, `OFFSET`은 `ORDER BY` clause가 있어야 사용할 수 있다. paging에서 순서가 흔들리면 같은 데이터가 다른 page에 중복되거나 빠질 수 있다.

네 번째 실수는 OData property 이름과 ABAP field 이름을 혼동하는 것이다. 외부 요청은 OData metadata의 property 이름을 사용한다. ABAP 내부 필드와 이름이 다르면 filter mapping에서 변환이 필요하다.

다섯 번째 실수는 generated class를 직접 수정하는 것이다. L04와 같은 원칙이다. 조회 구현은 `DPC_EXT`의 redefined method에 둔다. base class를 고치면 재생성 때 사라질 수 있다.

### 체험형 학습 설계

기존 체험물 `CH31-L05-S01`은 OData query option을 직접 조작하는 시뮬레이터로 사용한다. 화면에는 `Venue` select box, `$top` number input, `$skip` number input이 있고, 값이 바뀔 때마다 URL과 결과 table이 갱신된다.

학습자는 먼저 filter 없이 전체 목록을 본다. 다음으로 `Venue = 서울`을 선택하면 URL에 `$filter=Venue eq '서울'`이 붙고 결과가 서울 공연만으로 줄어든다. `$top = 3`을 입력하면 최대 3건만 표시된다. `$skip = 3`을 입력하면 같은 조건의 다음 page로 이동한다. 결과 영역에는 "현재 조건으로 DB에서 몇 건을 읽었고, 응답에는 몇 건을 돌려주는가"를 함께 표시한다.

오류 케이스는 세 가지가 좋다. 첫째, `$filter` 미반영 모드에서는 Venue를 바꿔도 결과가 바뀌지 않게 하고 "filter를 ABAP WHERE로 매핑하지 않았다"는 피드백을 준다. 둘째, `ORDER BY 없음` 모드에서는 page 이동 때 row 순서가 흔들리는 예를 보여 준다. 셋째, `$top` 미제한 모드에서는 결과가 너무 많아지는 경고를 보여 준다.

코드 연결 영역에는 지금 선택한 option이 ABAP 코드의 어느 줄과 대응되는지 표시한다. `Venue`는 filter select options와 `WHERE venue IN @lr_venue`, `$top`은 `UP TO @lv_top ROWS`, `$skip`은 `OFFSET @lv_skip`, 정렬은 `ORDER BY concert_id`에 연결된다. 이렇게 해야 학습자가 URL, Gateway context, ABAP SQL, response table을 하나의 흐름으로 이해한다.

### 정리

`GET_ENTITYSET`은 OData 목록 요청을 ABAP 조회로 바꾸는 지점이다. `$filter`는 WHERE 조건, `$top`은 row limit, `$skip`은 offset, `$orderby`는 안정적인 정렬로 연결된다. 결과는 `et_entityset`에 채운다. Classic Gateway에서는 `DPC_EXT`에 구현하고, 서비스 등록과 `$metadata`, Gateway Client, error log로 확인한다. 신규 Cloud 중심 개발에서는 RAP business service와 service binding을 우선 검토하지만, 기존 SEGW 자산을 유지보수하려면 이 구조를 읽을 수 있어야 한다.

## CH31 마무리

CH31의 핵심은 시스템 연계가 "보내는 코드"만으로 끝나지 않는다는 점이다. IDoc/ALE는 표준 메시지와 운영 status를 중심으로 설계하고, Gateway/OData는 HTTP 요청을 ABAP 조회와 응답으로 매핑한다. 둘 다 실패 확인 지점이 명확해야 한다. IDoc은 `WE02`, `BD87`, status record가 중심이고, Gateway는 `$metadata`, Gateway Client, error log, `DPC_EXT` 구현이 중심이다.

CH32에서는 이렇게 만든 연계와 조회가 느려졌을 때 어떻게 성능을 분석하고 튜닝할지 배운다. CH31까지는 "연계가 동작하는가"가 질문이었다면, CH32부터는 "동작하지만 충분히 빠르고 안정적인가"가 질문이 된다.
