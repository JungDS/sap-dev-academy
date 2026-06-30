# CH34_REWRITE - Forms / Output / PDF v1

> 목적: `content/abap/CH34`의 5개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH34 전체 설계

CH34의 한 문장 목표는 "인쇄 및 PDF 전자 문서 발급을 위한 양식 도구의 핵심인 Smart Forms 동적 함수 매핑(`SSF_FUNCTION_MODULE_NAME`), Adobe Forms(`SFP`)의 ADS 연동 및 `FP_JOB_OPEN`/`CLOSE` 쌍 가드, BRF+ 및 NAST 기반 Output Control 작동 기작, PDF 바이트(`XSTRING`)의 바이너리(`BIN`) 다운로드 정합성 및 깨짐 방지 대책을 수립하여 실무 출력물 관리 체계를 완성한다"이다.

IT 비전공자 입문자는 Smart Forms 컴파일 시 동적 생성된 `/1BCDWB/SF00000032` 와 같은 서버 고유 함수 이름을 아바 소스에 그대로 하드코딩하여 찌르는 오류를 범해 운영 서버 배포 즉시 프로그램 폭사 덤프를 내고, Adobe Forms 격발 시 열어젖힌 `FP_JOB_OPEN` 에 대해 `FP_JOB_CLOSE` 로 닫아주지 않아 자바 ADS 서버 리소스 풀을 다운시킨다.
또한, PDF 바이트(`XSTRING`)를 로컬 PC 에 내려받는 코드를 작성할 때 파일 형식을 `ASC` 텍스트 모드로 때려 이진 바이너리를 영구 파손해 깨진 PDF 파일로 고객에게 송출하는 대형 정합성 사고를 야기한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **동적 함수 매핑**: Smart Forms 활성화 시 폼 명칭(`ZSF_TICKET`)을 매개변수로 던져 동적으로 함수명(`lv_fm`)을 구득해 기동하는 **`SSF_FUNCTION_MODULE_NAME`** 프로세스 수립.
2. **Adobe Forms ADS 연동**: LiveCycle Designer 디자인 셋업 하에서 작동하는 Adobe Forms(`SFP`)의 원리와, 자바 통신 연동 ADS(Adobe Document Services) 규명.
3. **FP_JOB_OPEN/CLOSE 쌍 가드**: Adobe Forms 세션을 여닫는 API를 1:1 트랜잭션 단위로 감싸 닫아주어 ADS 서버 세션 폭사를 안전 방어.
4. **바이너리 BIN 다운로드**: PDF `XSTRING` 바이트를 텍스트 모드로 다운받을 때 파손되는 참상을 명세하고, `xstring_to_solix` 헬퍼와 **`filetype = 'BIN'`** 을 강제하는 안전 다운로드 규정.
5. **Output Control 배선**: NAST 조건 레코드 테이블과 현대 S/4HANA 의 BRF+ Output Management 의 개념을 조율해 자동 격발 체계 구축.
6. **SP01 스풀 추적**: 출력물이 물리 인쇄 장비로 가다 락이 걸렸을 때 디버깅하는 **`SP01`** 모니터 사용법 및 이송 요청(TR) 버전 제어 수립.

---

## CH34-L01 - Smart Forms 기본 구조

### 왜 필요한가

우리가 이전 화면 제어 챕터에서 이쁘게 빚은 ALV 그리드나 `WRITE` 문장은 SAP GUI 모니터 화면상에서 개발자나 실무자가 마우스로 쳐다보라고 설계해 둔 화면 전용 출력 도구다.
그런데 실무에서는 모니터 보기를 넘어 실제 종이로 뽑는 물리 출력물 제어가 발목을 잡는다.
- " 콘서트 티켓 예매가 성공한 고객에게, 종이로 인쇄해서 우편으로 배송해 줄 '공식 콘서트 입장권 티켓' 양식을 빚어내야 한다. 
티켓에는 이쁜 사가 로고가 박혀 있고, 배경에는 표 테두리가 예쁘게 쳐져 있어야 한다."
ALV 나 WRITE 는 종이 인쇄 규격(A4, 영수증 롤지 등)에 맞게 픽셀 단위로 폰트 크기나 로고 이미지를 배치할 능력이 없다.
- "인쇄 디자이너가 준 디자인 레이아웃에 맞게, 폰트와 표 테두리를 그려두고 백엔드 데이터만 쓱 넘겨주면 인쇄용 포맷으로 빚어 배출해 주는 전용 양식 도구가 필요하다."
그 고전적인 대표 도구가 **Smart Forms** 다.

### 무엇인가

#### 1. Smart Forms (SMARTFORMS)
- 인쇄 양식(Form)의 레이아웃 디자인을 그리고 아바 데이터를 결합하여 종이 인쇄용 스풀(Spool)이나 PDF 파일로 출력할 수 있도록 제공되는 SAP 전용 클래식 양식 작성 도구다. (트랜잭션 `SMARTFORMS` 에서 실행한다.)

#### 2. Form - Page - Window - Node 4층 구조
- **Form**: 양식 전체 명세다. (예: `ZSF_TICKET` 예매 확인증)
- **Page**: 실제 종이 규격(A4, Letter 등)을 결정하고 첫 페이지, 다음 페이지의 흐름을 나눈다.
- **Window**: 페이지 종이 판판 위에 배치되는 그림 구획 창이다. 
  - **Main Window (메인 창)**: 데이터 개수에 따라 다음 페이지로 글이 넘어가며 계속 늘어나는 유동 영역이다. (예: 50행 예매 리스트)
  - **Secondary Window (보조 창)**: 종이의 특정 물리적 자리에 딱 고정되어 인쇄되는 영역이다. (예: 좌측 상단 사가 로고 이미지, 우측 하단 회사 주소)
- **Form Interface**:
  - *양식으로 넘어가는 데이터의 깔때기 입구다.*
  - 프로그램에서 수집한 고객 데이터(`ls_booking`)를 양식 내부로 주입받는 파라미터 선언 창이다.

#### ⚠️ [ Smart Forms 동적 함수명 조회 및 하드코딩 금지 명세 ]
- *개발 장비 배포 후 운영기 런타임 덤프를 터트리는 입문자의 최다 단골 실수다.*
- **Smart Forms 를 빌드/활성화하면, 아바 엔진은 내부적으로 `/1BCDWB/SF00000032` 와 같이 시스템 고유의 일련번호가 달린 임시 Function Module 을 동적으로 자동 주조해 낸다.**
- **덤프 폭사**: Z프로그램에 대고 `CALL FUNCTION '/1BCDWB/SF00000032'` 라고 함수명을 소스에 대문짝만하게 박아서 호출한다. (개발에서는 잘 돈다.)
- **이유**: **이 일련번호는 각 서버(개발, QA, 운영)에 올라간 타 Z오브젝트의 개수와 활성화 순서에 따라 32번, 87번, 102번 등으로 계속 뒤바뀌기 때문이다. 번호가 틀어진 운영 서버에 올라가는 순간 "존재하지 않는 함수 호출" 덤프를 뿜으며 결제가 중단된다.**
- **방어선 (동적 조회)**: 반드시 **`SSF_FUNCTION_MODULE_NAME`** API 에 내 폼 명칭(`ZSF_TICKET`)을 던져, **그 기계가 동적으로 발급해 준 진짜 함수명(`lv_fm`)을 리턴받은 뒤, 동적 함수 지시어로 호출(`CALL FUNCTION lv_fm`)** 해야 안전이 수호된다.

### 어떻게 확인하는가

SSF_FUNCTION_MODULE_NAME 으로 임시 함수명을 조회하고 동적으로 폼을 호출하는 코드를 검증한다.

```abap
DATA: lv_fm_name TYPE rs38l_fnam,
      ls_booking TYPE zbooking.

" 1. [★ 운영기 덤프 방어: 폼 명칭으로 현재 서버가 발급한 동적 함수명 획득!]
CALL FUNCTION 'SSF_FUNCTION_MODULE_NAME'
  EXPORTING
    formname           = 'ZSF_TICKET' " 디자인해 둔 Smart Form 이름!
  IMPORTING
    fm_name            = lv_fm_name " 발급된 임시 함수명(/1BCDWB/SF...) 안착!
  EXCEPTIONS
    no_form            = 1
    no_function_module = 2
    OTHERS             = 3.

IF sy-subrc <> 0.
  MESSAGE '지정된 Smart Form 을 찾을 수 없습니다.' TYPE 'E'. RETURN.
ENDIF.

" 2. [동적으로 받아온 함수명을 격발 호출!]
CALL FUNCTION lv_fm_name " 문자열 변수 lv_fm_name 으로 동적 격발!
  EXPORTING
    is_booking     = ls_booking " Form Interface 에 선언한 파라미터 매핑!
  EXCEPTIONS
    formatting_err = 1
    internal_error = 2
    send_error     = 3
    user_canceled  = 4
    OTHERS         = 5.
```

#### 체험/시뮬레이터 설계 (Smart Forms 노드 구조 탐색기)
- **프로세스 플로우**:
  1. 학습자가 [ZSF_TICKET 양식 트리]를 본다. 
  2. [Form Interface] 에 마우스를 올리자 데이터 입구가 열린다.
  3. [Page1] 밑에 [Main Window] 와 [Secondary Window] 가 붙어 있다.
  4. 메인 윈도우 속으로 예매 50건을 밀어 넣자, Main Window 상자가 아래로 스르륵 확장되며 자동으로 Page2 를 새로 빚어내어 흘러 넘치고, 보조 윈도우(로고)는 Page2 에서도 원래 정위치 자리를 견고히 지키는 계층 비주얼을 확인한다.
- **상태 및 데이터**:
  - `동적 조회 없이 /1BCDWB/SF00000032 명칭으로 운영 장비에 배포 격발한 상태` -> 런타임 결과: `Function module /1BCDWB/SF00000032 not found. Critical System Dump!` 하이라이트.
- **피드백**: Smart Forms 는 동적으로 무작위 작명되므로, 중간 조율사인 `SSF_FUNCTION_MODULE_NAME` 을 경유하는 호출 설계가 우회할 수 없는 철칙임을 각인한다.

### 실수/주의

- **Smart Forms 내에서 텍스트 노드를 편집할 때, 텍스트 스타일(Style - 폰트, 크기)을 ZSF_STYLE 로 지정해 두고 해당 스타일을 운영 서버로 transport(이송)하지 않고 폼만 이송**:
  - 이 실수 시 운영기에서 폼이 열릴 때 ZSF_STYLE 스타일이 없어서 텍스트가 모두 뭉개지거나, 글자가 겹쳐 나와 바코드가 안 찍히는 인쇄 파손 사고를 유발한다.
  - **폼과 스타일은 무조건 하나의 이송 요청서(TR)에 짝꿍으로 묶어서 쏘아 올려야 정합성이 맞는다.**

### 정리

- ALV 화면 출력을 넘어 종이 규격 인쇄 레이아웃을 빚을 때 **`Smart Forms`** 를 쓴다.
- Form 밑에 **`Page -> Window -> Node`** (테이블/텍스트) 계층형 레이아웃 구조를 취한다.
- 활성화 시 임시 함수명이 발급되므로 반드시 **`SSF_FUNCTION_MODULE_NAME`** 으로 동적 매핑해 호출한다.

---

## CH34-L02 - Adobe Forms 기본 구조

### ~왜 필요한가

Smart Forms 로 고전적 인쇄는 구축했다.
그런데 모던 S/4HANA 시대에 이르자, 사용자들이 인쇄를 넘어 또 다른 복잡한 디지털 문서 가공을 대량 요구하기 시작한다.
- "인쇄용 종이 출력뿐만 아니라, 이메일 첨부 파일로 내보낼 완벽한 고해상도 PDF 바이너리 전자 문서를 획득하고 싶다.
또한, 글자 수에 따라 표 높이가 자유자재로 줄어들고 늘어나는 동적(Dynamic) 레이아웃 웹 표준 PDF 를 생성해 달라."
클래식 Smart Forms 는 90년대 기술에 근간을 두고 있어, 동적 레이아웃 제어나 고해상도 PDF 파일 변환 처리가 극도로 비효율적이고 조작이 복잡하다.
- "세계적인 PDF 종가인 Adobe 사의 엔진을 백엔드에 아예 심어두고, 폰트와 데이터 맵을 현대적인 툴로 디자인해 완벽한 네이티브 PDF 전자 문서를 뿜어내는 도구가 필요하다."
그것이 **Adobe Forms (SFP)** 의 도입이다.

### 무엇인가

#### 1. Adobe Forms (SFP)
- Adobe Document Services (ADS) 라는 자바 스택 서버를 경유하여, PDF 포맷의 문서 파일 렌더링 및 동적 전자 양식을 전문적으로 빚어내는 모던 SAP 표준 양식 도구다. (트랜잭션 `SFP` 에서 작성한다.)

#### 🧭 [ Adobe Forms 3대 컴포넌트 뼈대 구조 명세 ]
- *Adobe Forms 는 화면 구성과 로직 데이터의 관심사를 완벽히 3개로 칼 분할하여 빚어낸다.*

```text
[1] Interface (인터페이스부) :
   아바 프로그램에서 폼으로 넘겨줄 아바 변수, 테이블 파라미터 구조를 정의하는 데이터 통로다.
   │
[2] Form Context (콘텍스트 매핑부) :
   인터페이스로 들어온 아바 데이터 중, 어떤 필드만 레이아웃 디자인 쪽으로 태워 보낼 것인지 
   드래그 앤 드롭으로 징검다리 매핑을 맺어주는 필터 영역이다.
   │
[3] Layout (레이아웃 디자인부) :
   Adobe LiveCycle Designer 툴이 외장 브라우저로 연동되어 열리며, 드로잉 캔버스 위에 
   Context 필드를 바인딩해 선을 긋고 표를 그리는 비주얼 디자인 영역이다.
```

#### 2. ADS (Adobe Document Services)
- **Adobe Forms 는 SAP 내부 아바 WAS 가 스스로 렌더링하지 못한다. 자바(Java) 기반으로 도는 외부 'ADS 서버 데몬' 통신망이 정상 기동되어 연결되어 있어야만 비소로 쌩 데이터가 이쁜 PDF 그림 바이트로 변환된다. (ADS 연결 통신망이 꺼지면 즉시 렌더링 덤프가 난다.)**

#### ⚠️ [ FP_JOB_OPEN 과 FP_JOB_CLOSE 세션 쌍 가드 명세 ]
- *자바 통신망 과부하로 인한 실무 양식 발송 먹통을 가드하는 세션 리소스 반환 수칙이다.*
- Adobe Forms 는 자바 ADS 데몬으로 네트워크 통신을 날려 PDF 를 공수해 오기 때문에, 트랜잭션의 문을 열고 닫는 세션 락 제어가 필수적이다.
- **오작동**: 루프를 돌며 매 예매 건마다 `FP_JOB_OPEN` 을 매번 열고 `FP_JOB_CLOSE` 도 없이 폼 호출 함수를 기격발한다.
- **이유**: **자바 ADS 통신 채널 커넥션 풀이 리소스 누수(Leak)로 고갈되어, 100건 발송을 지나자마자 ADS 서버 전체가 뇌사 상태로 다운되어 회사 내의 모든 청구서 인쇄망을 마비시키는 민폐를 유발하기 때문이다.**
- **방어선 (1:1 쌍 가드)**: 폼 격발 전 반드시 **`FP_JOB_OPEN`** 을 1회 켜고, 폼 동적 호출을 완료한 즉시 꼬리에서 **`FP_JOB_CLOSE`** 를 때려 열린 채널 문을 완전히 닫아주어 메모리를 반환해야 정합성이 통과된다.

### 어떻게 확인하는가

FP_JOB_OPEN 과 CLOSE 의 짝을 맞추고 FP_FUNCTION_MODULE_NAME 으로 동적 Adobe Form 을 격발하는 코드를 검증한다.

```abap
DATA: lv_fm_name   TYPE rs38l_fnam,
      ls_output    TYPE sfpoutputparams,
      ls_doc_out   TYPE fpformoutput.

" 1. [★ ADS 세션 오픈: 출력을 위해 문을 촥 열기!]
CALL FUNCTION 'FP_JOB_OPEN'
  CHANGING
    ie_outputparams = ls_output " 프린터 지정이나 미리보기 여부 옵션 장착!
  EXCEPTIONS
    cancel          = 1
    usage_error     = 2
    system_error    = 3
    OTHERS          = 4.

IF sy-subrc <> 0.
  MESSAGE 'ADS 세션 오픈 실패.' TYPE 'E'. RETURN.
ENDIF.

" 2. [Adobe Form 용 동적 임시 함수명 조회]
CALL FUNCTION 'FP_FUNCTION_MODULE_NAME'
  EXPORTING
    i_name     = 'ZADOBE_TICKET' " 디자인해 둔 Adobe Form 이름!
  IMPORTING
    e_funcname = lv_fm_name.

" 3. [동적 함수 격발 - 이 사이에서 실체 PDF 가 조립됨!]
CALL FUNCTION lv_fm_name
  EXPORTING
    /1bcdwb/docparams  = VALUE sfpdocparams( lLanguage = sy-langu )
    is_booking         = ls_booking " 인터페이스 데이터 바인딩!
  IMPORTING
    /1bcdwb/formoutput = ls_doc_out " 생성 완료된 PDF 바이너리가 이 상자에 담김!
  EXCEPTIONS
    usage_error        = 1
    system_error       = 2
    internal_error     = 3
    OTHERS             = 4.

" 4. [★ ADS 세션 클로즈: 열어젖힌 뚜껑을 닫아주어 자바 리소스 완벽 반환!]
CALL FUNCTION 'FP_JOB_CLOSE'
  EXCEPTIONS
    usage_error  = 1
    system_error = 2
    internal_error = 3
    OTHERS       = 4.
```

#### 체험/시뮬레이터 설계 (Adobe Forms 라이브 디자이너)
- **프로세스 플로우**:
  1. 학습자가 [Interface 영역 (booking_id)] 과 [Context 영역 (매핑선)], [Layout 캔버스] 기판을 본다.
  2. [Interface] 에서 `booking_id` 를 드래그해 [Context] 에 결선 도킹한다.
  3. [Generate] 를 누르자, [ADS 데몬 서버 게이지] 가 파랗게 작동하며 `FP_JOB_OPEN -> CALL lv_fm -> FP_JOB_CLOSE` 전류가 안전하게 순회하여 PDF 장표가 배출된다.
  4. 이번엔 [FP_JOB_CLOSE 차단 밸브] 를 잠그고 연속 호출해 본다. [ADS 데몬 게이지] 가 리소스 누수로 임계치를 초과하자 빨간 불이 번쩍이며 "ADS Server Memory Exhausted! Spool Blocked!" 렌더링 폭사 경보가 터지는 피드백을 감상한다.
- **상태 및 데이터**:
  - `ADS 서비스가 설치되지 않은 시스템에서 SFP 폼을 가동한 상태` -> 런타임 결과: `ADS connection refused. XML 렌더링 모듈을 찾을 수 없음` 하이라이트.
- **피드백**: Adobe Forms 는 비주얼 Layout 디자인, Context 데이터 매핑, 그리고 정교한 JOB 세션 클로즈 가드가 믹스 조율되어야만 안정 운영됨을 체득한다.

### 실수/주의

- **Adobe Forms 디자이너(LiveCycle Designer) 툴을 로컬 PC 에 깔지 않고, SFP Layout 탭을 클릭**:
  - 이 실수 시 화면에 "ActiveX Component 를 찾을 수 없습니다" 며 무한 모래시계 락이 걸리고 SAP GUI 에디터 전체가 강제 종료 셧다운된다.
  - **반드시 내 로컬 PC 에 Adobe Designer 공식 프론트엔드 프로그램을 사전 설치해 두어야 함을 수호해야 한다.**

### 정리

- **`Adobe Forms`** 는 PDF 파일 출력과 동적 그리드 크기 변경에 적합한 모던 표준 도구다.
- 데이터 선언은 **`Interface`**, 매핑선은 **`Context`**, 비주얼 그리기는 **`Layout`** 으로 3단 격리한다.
- **`FP_JOB_OPEN`** 과 **`FP_JOB_CLOSE`** 1:1 결선 쌍 가드로 자바 ADS 리소스 누수를 차단한다.

---

## CH34-L03 - Output Control 개요

### 왜 필요한가

양식 폼들을 빚어냈다.
그런데 이번에는 이 양식들이 "실무 비즈니스 현장에서 언제, 누구에게, 무슨 수단으로 자동으로 배송 인쇄되어 나갈 것인가" 에 대한 배송 결정이 문제다.
- " 현업 직원이 예매 등록 화면(`XX01`)에서 예매를 딱 저장하고 엔터를 쳤다.
그럼 프로그램 소스를 켜서 수정하지 않고도, 백엔드 엔진이 알아서 '저장 완료' 이벤트를 감지해 1초 만에 티켓 PDF 를 발행하고 사내 매장 프린터로 인쇄 명령을 내려보내야 한다."
만약 개발자가 매 등록 프로그램 소스 꼬리에 대고 `CALL FUNCTION 'ZADOBE_TICKET' ...` 라며 하드코딩으로 인쇄 소스를 심어두면, 훗날 "A 지점은 이메일로 쏘고, B 지점은 종이로 뽑고, C 지점은 야간에 모아서 한 번에 팩스로 쏴달라" 고 영업 조건이 바뀔 때마다 운영 소스를 수십 번 뜯어고쳐 배포해야 하는 하드코딩 헬게이트가 열린다.

**비즈니스 전표 저장과 출력물 매커니즘을 소스에서 격리하고, 조건 레코드(NAST)나 규칙 관리 엔진(BRF+)을 통해 "티켓 저장 시 -> 이메일 발송, 티켓 취소 시 -> PDF 취소장 발급" 규칙을 외부에서 조립 제어하는 기술**이 필요하다. 그것이 **Output Control (출력 결정)** 의 수립이다.

### 무엇인가

#### 1. Output Control (출력 결정 제어기)
- 비즈니스 전표가 생성/변경되는 이벤트가 포착될 때, 사전에 설정해 둔 규칙에 따라 '어느 시점에, 어느 양식으로, 누구에게(인쇄/이메일/EDI)' 를 자동으로 결정해 출력을 집행해 주는 표준 SAP 백엔드 프레임워크 기술이다.

#### 2. NAST (클래식 메시지 결정 절차 테이블)
- *수십 년간 SAP 표준을 지배해 온 고전 출력 관리의 상징이다.*
- 전표 저장 시 설정된 조건 레코드(`Condition Record`)를 순회 스캔하여 알맞은 출력 양식을 NAST 테이블에 **메시지(Message)** 행으로 한 줄 적재해 둔 뒤, 나중에 배치 프로그램이나 업데이트 데몬이 이를 쓱 읽어 인쇄 포트로 쏴 보낸다. (예: 트랜잭션 `VV11` 등으로 조건 입력)

#### 3. BRF+ 기반 Output Management (S/4HANA 신형 출력 제어)
- *S/4HANA 에서 채택된 현대적인 출력 조율판이다.*
- 복잡한 NAST 테이블 구조 대신, **BRF+ (Business Rule Framework plus)** 의 편리한 결정 테이블(Decision Table) 규칙에 대고 "영업 조직이 '1000' 이면 Output Channel 은 'EMAIL' 이고, Email Template 은 'ZADOBE' 다" 라고 엑셀 시트 채우듯 기입해 두면, 시스템이 이를 판정해 즉각 PDF 메일을 격발 발송한다.

### 어떻게 확인하는가

저장 시점에 맞춰 Output Control 규칙 판정이 도는 연동 시퀀스를 검증한다.

```text
[1단계] BRF+ Output 결정 규칙 조립 :
   ---------------------------------------------------------------------------------
   | 전표 유형 (Doc Type) | 수신 국가 | Output Channel | Form Template     |
   ---------------------------------------------------------------------------------
   | ZTKT (예매티켓)      | KR        | PRINT (인쇄)   | ZADOBE_TICKET     |
   | ZTKT (예매티켓)      | US        | EMAIL (메일)   | ZADOBE_TICKET_ENG |
   ---------------------------------------------------------------------------------
   
[2단계] 예매 전표 저장 격발 :
   - 정훈영 고객이 미국(US) 국가 정보로 예매 전표 'T9987' 저장 완료!
   - Output Control 엔진이 BRF+ 결정 테이블 스캔!
   - 2번째 행 조건 낙찰 -> EMAIL 채널 확정 및 ZADOBE_TICKET_ENG 양식 호출 격발!
   - 고객 메일함으로 영문 티켓 PDF 자동 이송 완료! (개발자 소스 수정 0줄 수호)
```

#### 체험/시뮬레이터 설계 (Output Control 결정기)
- **프로세스 플로우**:
  1. 학습자가 [예매 저장 버튼] 과 [Output Control 가스배관] 을 본다.
  2. 가스 배관 중앙에 [BRF+ 결정 규칙판] 이 렌더링되어 있다.
  3. [규칙: KR -> PRINT] 카드를 꽂고 저장한다. [인쇄 포트] 에서 종이가 출력된다.
  4. [규칙: US -> EMAIL] 카드로 변경 꽂고 저장한다. [메일 배송 포트] 에서 편지가 날아가는 결정 모션을 확인한다.
  5. [규칙 없음] 인 채로 저장하자, 배관이 막히며 전표는 잘 저장되었는데 아무런 후속 출력이 격발되지 않는 조용한 피드백을 감상한다.
- **상태 및 데이터**:
  - `NAST 조건 테이블 설정을 누락하여 출력이 자동 생성되지 않는 상태` -> 런타임 결과: ` 전표 저장 완료. NAST message output log: NULL` 하이라이트.
- **피드백**: 양식 폼을 열심히 개발했어도, 이들을 격발시킬 Output Control 조건 배선이 연동되어야만 실무 무인 자동화가 완성됨을 깨닫는다.

### 실수/주의

- **신규 폼을 개발한 뒤, Standard Output Control 설정(BRF+/NAST)에 내 신규 Form Template 명칭 매핑 등록을 생략**:
  - 전표를 아무리 백번 저장해도, 시스템은 예전 구형 Forms 템플릿만 읽어서 옛날 종이 양식을 인쇄해 출력하는 삐걱 버그를 겪는다.
  - **신규 양식 배포 즉시 Output 매핑 커스터마이징을 갱신 수호해야 한다.**

### 정리

- **`Output Control`** 은 전표 저장 이벤트를 낚아채어 조건에 맞게 양식을 자동 격발한다.
- 클래식은 **`NAST`** 조건 테이블, 모던 S/4HANA 는 **`BRF+ 기반 Output Management`** 규칙을 쓴다.
- 소스 코드에 인쇄 로직을 직접 박지 않는 **`비즈니스 규칙 격리`** 가 실무의 핵심 아키텍처다.

---

## CH34-L04 - PDF 생성과 다운로드

### 왜 필요한가

자동 출력 결정 배선까지 마쳤다.
이번에는 생성된 고화질 PDF 폼의 실체 데이터 바이트를 로컬 PC 의 파일로 내보내거나 백엔드 메일함에 첨부하는 데이터 이송 가드가 장벽이다.
- " 생성된 티켓 PDF 문서를 'ticket.pdf' 라는 실체 파일로 내 로컬 PC 의 `C:\temp\` 폴더에 깔끔하게 내려받아 저장해 두고 싶다."
앞서 Adobe Forms 렌더링 함수(`lv_fm`)가 돌면 반환 값 상자 `/1bcdwb/formoutput` 안에 **XSTRING (바이너리 16진수 문자열)** 형태의 쌩 데이터 바이트가 담겨 날라온다.
이 데이터를 PC 다운로더(`gui_download`)에 그대로 넘길 때, 파일 형식을 쌩 텍스트(`ASC`) 모드로 전송해 버리면, OS 가 개행 특수 바이트를 자기 맘대로 변조하여 "손상된 파일 포맷이라 열 수 없다" 며 하얀 화면만 뿜어대는 텅 빈 쓰레기 PDF 파일이 저장된다.

**PDF XSTRING 바이트를 BCS 바이너리 컨버터를 통해 solix_tab 이진 배열 테이블로 정밀 형변환하고, gui_download 에 filetype = 'BIN' 옵션을 장착하여 날것의 이진 데이터를 1비트의 뭉개짐도 없이 수송해 저장하는 기술**이 필요하다. 그것이 **PDF 생성과 다운로드** 다.

### 무엇인가

#### 1. XSTRING (바이너리 바이트 형식)
- 데이터 크기를 가늠할 수 없는 이미지, PDF, ZIP 압축파일 등의 날것의 2진수 데이터 바이트를 담아 나르는 아바 전용 가변 길이 16진수 변수 타입이다.

#### 2. cl_bcs_convert=>xstring_to_solix (바이너리 배열 변환기)
- **1덩어리의 XSTRING 바이너리를, SAP 파일 전송기가 한 번에 실어 나르기 좋은 255바이트 단위의 격자 이진 배열 테이블(`solix_tab`)로 정밀 슬라이스 쪼개어 형변환해 주는 필수 헬퍼 클래스다.**

#### ⚠️ [ PDF 다운로드 시 BIN 모드 강제 및 TEXT 다운로드 금지 명세 ]
- *전송 도중 바이너리가 파손되어 깨진 파일을 양산하는 주요 정합성 붕괴 영역이다.*
- PDF 는 일반 텍스트 문서가 아니라 압축된 이미지와 글꼴 바이트가 얽힌 2진 바이너리 파일이다.
- **오작동**: `gui_download` 시 `filetype = 'ASC'` 나 `'DAT'` 로 전송한다.
- **이유**: **텍스트 모드는 OS 에 따라 개행 문자(`CRLF`)를 만나면 바이트를 마음대로 변조(Unicode encoding 변환 등)해 전송하므로, 수신된 PDF 의 내부 파일 헤더 오프셋이 뒤틀려 PDF 파일 자체가 물리 파손(Corrupt)되어 영구히 열리지 않기 때문이다.**
- **방어선 (BIN 지정)**: 반드시 다운로드 시 **`filetype = 'BIN'`** 을 얹고, 다운로드 바이트 크기 **`bin_filesize`** 에 내 원래 PDF XSTRING 의 실제 바이트 길이(`xstrlen`)를 한 치의 오차도 없이 1:1 명시하여 쏴주어야 안전이 수호된다.

### 어떻게 확인하는가

xstring_to_solix 로 쪼갠 뒤 filetype = 'BIN' 과 bin_filesize 를 장착해 다운받는 코드를 검증한다.

```abap
DATA: lv_pdf_data TYPE xstring, " Adobe Form 호출로 공수된 PDF 바이트!
      lt_solix    TYPE solix_tab,
      lv_size     TYPE i.

" [가정: Adobe Form 호출 완료되어 lv_pdf_data 에 PDF 바이트가 안착됨]
lv_pdf_data = ls_formout-pdf. 

" 1. [★ PDF 원본 바이트의 물리 길이 획득!]
lv_size = xstrlen( lv_pdf_data ).

" 2. [XSTRING 을 255바이트 이진 배열 테이블로 슬라이스 변환]
lt_solix = cl_bcs_convert=>xstring_to_solix( iv_xstring = lv_pdf_data ).

" 3. [★ 로컬 PC 파일 쓰기 격발 - filetype = BIN 의무 지정!]
cl_gui_frontend_services=>gui_download(
  EXPORTING
    filename                  = 'C:\temp\ticket.pdf'
    filetype                  = 'BIN' " 텍스트 변조가 없는 바이너리 모드로 전송!
    bin_filesize              = lv_size " 실제 바이트 길이 한치 오차 없이 선고!
  CHANGING
    data_tab                  = lt_solix " 쪼개진 이진 테이블!
  EXCEPTIONS
    file_write_error          = 1
    no_authority              = 2
    OTHERS                    = 3.

IF sy-subrc <> 0.
  MESSAGE 'PDF 파일 로컬 저장에 실패했습니다.' TYPE 'E'.
ELSE.
  MESSAGE 'PDF 티켓이 C:\temp\ticket.pdf 에 안전하게 저장되었습니다.' TYPE 'S'.
ENDIF.
```

#### 체험/시뮬레이터 설계 (PDF 다운로드 전송 버퍼)
- **프로세스 플로우**:
  1. 학습자가 [XSTRING 16진수 스트림 데이터] 와 [gui_download 전송 파이프] 를 본다.
  2. [filetype = ASC (텍스트 모드)] 로 파이프를 가동한다. 전송 도중 바이트 문자열이 Unicode 로 제멋대로 변환되어 뭉개지고, 내려받은 PDF 아이콘을 열자 "Corrupted File Error! (포맷 깨짐)" 경고 붉은 불이 뿜어진다.
  3. [filetype = BIN (바이너리 모드)] 및 [bin_filesize 지정 = ON] 으로 스위치를 바꾼다.
  4. 2진수 팩이 1비트의 왜곡도 없이 깔끔하게 수송되어 통과하고, 다운로드된 PDF 아이콘을 더블 클릭하자 콘서트 예매 티켓 장표가 모니터 상에 선명하게 렌더링되어 합격 초록불이 켜지는 피드백을 감상한다.
- **상태 및 데이터**:
  - `bin_filesize 파라미터를 누락하고 BIN 다운로드를 실행한 상태` -> 런타임 결과: `Download warning: Zero byte written. Missing filesize indicator` 하이라이트.
- **피드백**: 바이너리 문서를 파일화할 때는 무조건 이진 규격(BIN)과 실제 크기(`xstrlen`)를 정확히 채우는 것이 아키텍처 생명임을 배운다.

### 실수/주의

- **이메일 첨부(BCS)로 PDF 를 쏠 때, 메일 클래스에 파일의 MIME TYPE 지정을 'text/plain' 으로 설정해 첨부**:
  - 이 실수 시 메일을 받은 고객이 이메일의 첨부파일 ticket.pdf 를 열었을 때, 아크로뱃 뷰어가 켜지는 대신 쌩 16진수 외계어 텍스트 글자가 메일 본문에 주르륵 흘러나오는 비주얼 테러를 야기한다.
  - **이메일 첨부 시에는 MIME TYPE 을 반드시 `'application/pdf'` 로 지정해 선고해야 함을 수호해야 한다.**

### 정리

- 폼 출력 결과물인 PDF 는 16진수 날것의 가변 바이너리 데이터인 **`XSTRING`** 에 얹혀 나온다.
- XSTRING 은 **`cl_bcs_convert=>xstring_to_solix`** 를 통해 255바이트 배열로 슬라이스 쪼갠다.
- PC 파일 기입 시 텍스트 파손을 막기 위해 반드시 **`filetype = 'BIN'`** 과 **`bin_filesize = xstrlen`** 을 단단히 결선한다.

---

## CH34-L05 - 양식 오류 추적과 변경 대응

### 왜 필요한가

PDF 생성과 다운로드까지 완성했다.
이제 인쇄망 운영 현장에서 매일 접수되는 "티켓 인쇄가 안 나온다" 는 인쇄 사고 추적과 양식 변경 대응을 마주한다.
- " 마케팅 부서에서 입장권 로고를 BTS 새 앨범 로고로 변경하고, 법적 환불 규정 폰트를 빨간색으로 키워달라고 긴급 요청해 왔다."
성능과 화면 코드 수정처럼 양식도 버전 관리와 이송 체계(TR)를 정확히 밟아야 한다.
무엇보다 화면 GUI 와 달리 인쇄 양식은 눈앞에 에러 코드를 바로 뿌려주지 않고 프린터가 꼼짝 않고 침묵해 버리는 '시각적 사각지대' 가 많아, 어디가 막혔는지 추적하는 전산 모니터 징검다리를 꿰차지 못하면 며칠 동안 애꿎은 프린터 전원만 껐다 켜는 삽질을 반복한다.

**인쇄 문서 보관실인 스풀(SP01)에 대고 출력 상태를 추적하고, ADS 자바 연결 로그를 뒤져 렌더링 뇌사 여부를 판정하며, 양식 변경 요청을 이송 요청서(TR)에 묶어 안전하게 운영계로 버전 이송하는 기술**이 필요하다. 그것이 **양식 오류 추적과 변경 대응**의 완수다.

### 무엇인가

#### 1. SP01 (Spool Controller - 스풀 모니터)
- *양식 디버깅의 최전선 전산망이다.*
- 아바 프로그램이 폼을 격발하면 1차로 **스풀(Spool)** 이라는 임시 인쇄 대기 문서 파일이 발행된다.
- **`SP01`** 에 들어가서 "상태가 `Error` 인지, `Complete` (프린터 전송됨)인지, 아예 스풀 생성 조차 안 되었는지" 를 보면, **프로그램 로직 문제(스풀 없음)인지, 아니면 프린터 장비 선이 빠진 문제(스풀은 Complete 나 종이가 안 나옴)인지 단 3초 만에 시각적 책임 한계를 칼로 자르듯 판별**해 낸다.

#### 2. ADS 통신망 진단 (Adobe Forms 디버깅)
- Adobe Forms 가 에러로 안 뿜어질 때, `/IWFND/` 이나 ADS 연결 RFC Destination인 `ADS` (`SM59` 에서 G타입 HTTP 연결) 의 Connection Test 를 찔러 자바 데몬 서버의 심장박동을 진단하는 디버깅 경로다.

#### 3. 변경 관리와 이송(TR)의 철칙
- *운영 데이터 무단 파손을 방지하는 정합성 가이드라인이다.*
- **양식 레이아웃이나 법적 문구 변경은 단순 문서 수정이 아닌 '아바 Z코드 수정' 과 동일한 등급의 중대 변경 사안이다.**
- **방어선**: 절대 운영 장비에 대고 직접 양식을 수정하지 않으며, 반드시 **개발기에서 수정 및 버전 관리 등록을 필하고, 테스트 인쇄(샘플 출력 검증)를 통해 바코드가 정상 리딩되는지 인쇄 스캔 검사를 통과한 뒤, 공식 이송 요청(TR)을 승인받아 운영계로 안전 배포**해야 정합성이 수호된다.

### 어떻게 확인하는가

SP01 스풀 추적과 이송 변경 시퀀스를 검증한다.

```text
[1단계] 현업 긴급 에러 발생 접수 : "티켓 인쇄 버튼을 눌렀는데 프린터가 꼼짝도 안 합니다!"
[2단계] SP01 스풀 진단 작동 :
   - SP01 실행 -> 내 사용자 ID 로 조회!
   - Spool No. 1008272 발견 -> Status = 'Compl.' (Complete 완료) 확인!
   - 판정 : 아바 프로그램과 ADS 서버는 PDF 를 무결하게 구워 프린터 큐로 넘겼음!
            프린터 기기의 물리적 용지 걸림이나 IP 충돌 장애로 책임 격리 판정 완료! 
            (개발팀 쿼리 튜닝 소스 분석 작업 원천 방어 탈출!)
            
[3단계] Layout 변경 및 TR 이송 집행 :
   - 요청: 하단에 "환불 불가" 문구 빨간색 추가!
   - 개발기 SFPLayout 에서 텍스트 빨간색 변경 완료 -> Form Interface 활성화!
   - TR 요청서 'EK0K900182' 에 ZADOBE_TICKET 폼 개체 등록 완료!
   - QA 기계로 이송 배포 -> 샘플 스풀 테스트 인쇄 스캔 합격!
   - 운영기 최종 배포 배송 낙찰! (인쇄망 정합성 무결성 수호 완료)
```

#### 체험/시뮬레이터 설계 (양식 인쇄 큐 스풀 모니터)
- **프로세스 플로우**:
  1. 학습자가 [예매 프로그램 인쇄 버튼] 과 우측의 [실물 캐논 프린터], 그리고 중앙의 [SP01 스풀 전산실]을 본다.
  2. [인쇄 격발] 을 지른다. 프린터는 움직이지 않는다.
  3. [SP01] 창을 켠다. 스풀 번호가 안 떠 있다. [판정: 아바 소스 에러!] 임을 빨간 불로 확인한다.
  4. 이번엔 스풀 번호가 `Compl.` 로 파랗게 떠 있다. [판정: 프린터 용지 없음!] 힌트가 들어오고 프린터에 종이를 채우자 인쇄물이 촥 뿜어져 나오며 최종 합격 초록등이 번쩍이는 흐름 제어 피드백을 감상한다.
- **상태 및 데이터**:
  - `테스트 출력 검증 없이 운영 양식을 직접 열어 수정하다 레이아웃 좌표가 꼬인 채 배포된 상태` -> 런타임 결과: `Layout broken. Form label overlap. Barcode illegible` 하이라이트.
- **피드백**: 인쇄 인터페이스는 시각 확인 사각지대이므로, SP01 스풀 격리와 정교한 테스트 샘플 인쇄 검증이 운영 안전의 생명줄임을 깨닫는다.

### 실수/주의

- **Form Interface 구조(예: zbooking 테이블 컬럼 추가)를 변경해 두고, 상응하는 아바 Z프로그램의 EXPORTING 인자 매핑을 갱신하지 않은 채 폼만 활성화배포**:
  - 프로그램 실행 시 "함수 인터페이스 파라미터 불일치" 덤프를 터트리며 예매 결제 버튼을 누르는 순간 예약 프로그램이 즉사한다.
  - **인터페이스 스키마를 고쳤다면 호출자 프로그램의 매핑 라인도 반드시 동시에 수정해 짝을 맞춰 활성화해 주어야 함을 수호해야 한다.**

### 정리

- 인쇄가 막혔을 때는 **`SP01`** 스풀 모니터에서 상태(Complete vs Error)를 조회해 책임 영역을 격리한다.
- Adobe Forms 의 렌더링 에러 시에는 **`ADS`** 통신 커넥션 테스트(`SM59`)를 통해 자바 데몬 상태를 점검한다.
- 양식의 변경은 코드와 같으므로 개발기 수정, **`샘플 테스트 출력 검증`**, 그리고 **`TR 이송`** 절차를 절대 엄수한다.
- *Forms 출력 기술은 실무 영수증/티켓의 필수이며, S/4HANA Cloud 환경에선 PDF 기반 Adobe Forms 가 단일 표준 폼 기술로 계승 채택된다.*
