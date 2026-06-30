# CH30_REWRITE - 인터페이스 실무: BAPI/RFC/BDC/File v1

> 목적: `content/abap/CH30`의 5개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH30 전체 설계

CH30의 한 문장 목표는 "외부 시스템 및 대량 파일 교류를 위해 표준 데이터 안전 통로인 BAPI(Return BAPIRET2 검사 및 BAPI_TRANSACTION_COMMIT), 다른 서버가 내 함수를 깨우는 원격 호출 RFC(DESTINATION 및 EXCEPTIONS 바인딩), BAPI 가 없을 때 화면 조작을 자동 모사하는 BDC(CALL TRANSACTION ctu_params 옵션 및 Session SM35), 로컬 PC 엑셀 업로드(gui_upload 탭 구분 SPLIT 파싱), 그리고 배치 서버 파일 핸들러(OPEN/CLOSE DATASET 최대 100개 제한 `CX_SY_TOO_MANY_FILES` 및 Directory Traversal 가드)와 재처리 로그 아키텍처를 완수한다"이다.

IT 비전공자 입문자는 BAPI 호출 후 Return 파라미터 `BAPIRET2` 내 에러(`E`/`A`) 타입 유무를 체크하지 않고 무작정 쌩 `COMMIT WORK` 를 갈겨 백엔드 표준 데이터를 훼손하고, `OPEN DATASET` 으로 서버 파일을 로드할 때 한 세션당 최대 100개 오픈 제약을 어기고 `CLOSE DATASET` 을 누락해 `CX_SY_TOO_MANY_FILES` 덤프를 터트린다.
또한, 외부 텍스트 창에 입력된 `../../etc/passwd` 경로를 정규화 검증하지 않고 쌩으로 오픈했다가 OS 보안 영역을 털리는 **Directory Traversal** 해킹 위험에 노출되고, RFC 예외 핸들링 시 `communication_failure` 뒤에 `MESSAGE` 꼬리표를 빼먹어 원격 장애의 핵심 단서를 잃는다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **BAPIRET2 에러 필터링**: BAPI 호출 후 에러(`type = 'E'` or `'A'`) 존재를 검문해 정상 시에만 커밋하는 필터링.
2. **wait = abap_true 동기 커밋**: 단순 COMMIT 이 아닌, DB 백엔드 물리 이송 완료까지 대기하는 **BAPI_TRANSACTION_COMMIT wait 옵션** 지정.
3. **Remote-Enabled FM**: SE37 에서 RFC 전원 스위치를 켜고, SM59 연결 Destination 및 원격 실패 단서(`MESSAGE lv_msg`) 수집 셋업.
4. **BDC CALL TRANSACTION ctu_params**: SHDB 녹화 뼈대를 바탕으로, `ctu_params` 옵션 구조체를 연동해 모드 'N' 과 동기 업데이트 'S' 조율.
5. **Call Transaction vs Session**: 실시간 즉각 처리는 Call, 야간 대량 처리 및 `SM35` 재처리 큐 관리는 Session 으로 상황 분할.
6. **gui_upload 탭 파싱**: PC 파일 업로드 후 `horizontal_tab` 구분자 SPLIT 및 첫 줄 헤더 스킵, 그리고 쌩 외부 데이터 무결성 체크.
7. **OPEN DATASET 파일 핸들 락**: `IN TEXT MODE ENCODING UTF-8 MESSAGE` 옵션을 장착하고, 루프 후 **`CLOSE DATASET`** 의무화로 100개 초과 `CX_SY_TOO_MANY_FILES` 방어.
8. **Directory Traversal 가드**: 파일 경로 입력 값에 대한 화이트리스트 및 파일명 정규화 검증 가이드 추가.

---

## CH30-L01 - BAPI 호출과 Return 처리

### 왜 필요한가

우리가 이전 트랜잭션 챕터에서 배웠듯, SAP 시스템 내에 고이 잠들어 있는 '고객 마스터 테이블(`KNA1`)' 이나 '판매오더 헤더 테이블(`VBAK`)' 같은 표준 테이블들은 절대로 내 맘대로 `INSERT` 나 `MODIFY` SQL 문장으로 쌩으로 수정하면 안 된다.
표준 테이블의 데이터 한 건을 조작하려면 관련 10개 테이블의 정합성과 후속 회계 전표 기동까지 함께 톱니바퀴처럼 굴러가야 하는데, 테이블 하나만 만져버리면 전표가 꼬여 회계 불일치 대형 감사 적발 장애를 낳는다.
- "표준 테이블의 유효성 검사, 후속 셋업을 완벽히 포함해 SAP 사가 공식적으로 제공하는 표준 데이터 통로 API([[BAPI]])를 경유해야 한다."
그런데 BAPI 는 일반 함수들과 달리, 호출만 했다고 해서 DB 디스크에 값이 자동으로 확정 저장되지 않는다. BAPI 실행 후 결과 보고서(Return)에 에러 마크가 없는지 한 번 돋보기로 확인하고, 수동으로 확정 신호를 보내주어야 한다.

**BAPI 호출 후 반환되는 리턴 구조체(BAPIRET2) 안방에 숨겨진 E/A 에러 마크를 촘촘히 스캔하고, 통과했을 때에만 DB 백엔드 이송 완료까지 동기 대기(wait)하는 BAPI 전용 커밋을 날리는 기술**이 필요하다. 그것이 **BAPI 호출과 Return 처리**다.

### 무엇인가

#### 1. BAPI (Business API)
- SAP 표준 비즈니스 오브젝트를 조작하기 위해 제공되는 정석 표준 API 함수 모듈이다. (예: `BAPI_SALESORDER_CREATEFROMDAT2`)

#### 2. BAPIRET2 (BAPI 결과 보고서)
- BAPI 가 기동된 후 성공, 경고, 실패 내역을 고스란히 담아 돌려주는 결과 테이블 규격이다.
- **type (결과 타입)**: *가장 중요한 판단 필드다.*
  - **`S`** (Success) / **`I`** (Information): 정상 작동.
  - **`E`** (Error) / **`A`** (Abort): 중대 오류 발생. (이 타입이 단 1건이라도 존재하면 저장을 취소해야 한다.)

#### 3. BAPI_TRANSACTION_COMMIT 와 BAPI_TRANSACTION_ROLLBACK
- *BAPI 전용 확정/취소 트랜잭션 도장이다.*
- BAPI 는 내부에서 자체 커밋을 수행하지 않는 것이 글로벌 철칙이다. 밖에서 호출한 지휘관 프로그램이 Return 결과를 보고 최종 확정 결정을 지어야 한다.
- **wait = abap_true (동기 대기 옵션)**: **그냥 쌩 `COMMIT WORK` 를 날리면, DB 백엔드 버퍼가 디스크에 물리 쓰기 완료하기 전에 아바 프로그램이 다음 줄로 튕겨 넘어가 버려 '커밋 미완료 상태에서 뒤이은 데이터를 조회하다 빈 값을 읽는' 유실 현상을 초래한다. 반드시 `wait = abap_true` 옵션을 전송해 DB 안착까지 동기 대기를 완료해야 정합성이 수호된다.**

### 어떻게 확인하는가

BAPI 를 호출하고 BAPIRET2 리턴 스캔 및 wait 동기 커밋을 엮는 소스 코드를 검증한다.

```abap
DATA: lt_return TYPE TABLE OF bapiret2.

" 1. [표준 판매오더 생성 BAPI 호출]
CALL FUNCTION 'BAPI_SALESORDER_CREATEFROMDAT2'
  EXPORTING
    order_header_in = ls_header
  TABLES
    return          = lt_return. " 결과 보고서 접수!

" 2. [★ BAPIRET2 E/A 타입 검문소 기동]
" 리턴 테이블 안에 Error 나 Abort 타입이 1건이라도 존재하는지 스캔!
IF line_exists( lt_return[ type = 'E' ] ) OR 
   line_exists( lt_return[ type = 'A' ] ).
   
  " 불합격 시 표준 트랜잭션 강제 취소 롤백!
  CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
  MESSAGE 'BAPI 표준 검증 실패로 처리가 롤백 취소되었습니다.' TYPE 'I'.
  
ELSE.
  " 3. [★ 합격 시 wait 동기 커밋 집행]
  CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
    EXPORTING
      wait = abap_true. " DB 물리 이송 완료 시까지 대기! (유실 방어)
  MESSAGE '판매오더가 성공적으로 생성 및 저장되었습니다.' TYPE 'S'.
ENDIF.
```

#### 체험/시뮬레이터 설계 (BAPI Return 분기 시뮬)
- **프로세스 플로우**:
  1. 학습자가 [Header Data 입력] 과 [BAPI 컨베이어 벨트]를 본다.
  2. BAPI 기동 단추를 누르자 Return 상자에 [type = 'E', msg = '자재 재고 부족'] 카드가 담긴다.
  3. [분기 가드 OFF (쌩 COMMIT)] 모드로 돌리면, 재고가 없는데 강제 커밋이 기동해 테이블 불일치 파손 경보가 울린다.
  4. [분기 가드 ON (ROLLBACK 분기)] 를 켜자, 붉은색 E 마크를 즉시 필터링해 `BAPI_TRANSACTION_ROLLBACK` 단추가 파랗게 눌리며 안전하게 롤백 수습되는 피드백을 감상한다.
- **상태 및 데이터**:
  - `BAPI 호출 후 BAPI_TRANSACTION_COMMIT wait 옵션을 빼먹은 채 실행한 상태` -> 런타임 결과: `Commit executed asynchronously. Secondary query read NULL. Data Sync Delay` 하이라이트.
- **피드백**: BAPI 는 자체 확정을 지니지 않으므로, 호출자의 정교한 Return 분기와 동기 커밋 조율이 필수임을 학습한다.

### 실수/주의

- **일반 Z프로그램에서 DB 커밋할 때 쓰는 COMMIT WORK 문장을 BAPI 호출 꼬리에 사용**:
  - `BAPI_TRANSACTION_COMMIT` 내부에는 커밋뿐만 아니라 표준 프레임워크 전용 버퍼 클리어 및 락 해제 셋업이 패키지로 같이 묶여 기동된다. 
  - 이를 무시하고 쌩 `COMMIT WORK` 를 갈기면 메모리에 쓰레기 표준 락이 그대로 남아 다음 예매 처리 시 락 덤프를 터트린다.
  - **BAPI 호출 짝꿍 트랜잭션은 무조건 `BAPI_TRANSACTION_COMMIT` 임을 수호해야 한다.**

### 정리

- 표준 테이블은 직접 DML(INSERT 등)을 금지하고, 반드시 **`BAPI`** 를 경유해 조작한다.
- **`BAPIRET2`** 반환 테이블의 `type = 'E'` or `'A'` 존재를 철저히 검문한다.
- 통과 시에는 **`BAPI_TRANSACTION_COMMIT`** 에 **`wait = abap_true`** 옵션을 심어 동기 커밋한다.

---

## CH30-L02 - RFC Function Module 설계

### 왜 필요한가

BAPI 로 표준 호출은 마쳤다.
이번에는 다른 시스템(예: 웹 서버, 외부 매장 키오스크, 혹은 협력사 MES 서버)과의 통신이 문제다.
- "외부 웹사이트 쇼핑몰에서 고객이 예매를 조회하는 순간, 내 SAP 백엔드에 상주하는 '실시간 예약 조회 함수' 를 원격 호출해 가져가게 만들고 싶다."
기존 일반 Function Module 은 내 SAP 서버 로컬 안방에서만 불릴 수 있어서 외부 자바나 닷넷 웹 서버가 문을 두드려도 호출할 수 없다. 
또한 외부 시스템과 연동 통신할 때는 인터넷 끊김, 네트워크 마비, 상대 서버 폭사 등의 '통신 예외(Exception)' 가 밥 먹듯 터지는데, 이 예외를 안전하게 가드해 두지 않으면 네트워크가 잠깐 지연되는 찰나에 내 SAP 프로그램까지 뇌사 상태로 다운된다.

**함수의 속성을 원격 호출 가능(Remote-Enabled)으로 해방하고, SM59 연결망(Destination)을 통해 국경을 넘어 호출하며, 통신 장애 예외(communication_failure) 뒤에 에러 단서 메시지(MESSAGE)를 바인딩해 수습하는 기술**이 필요하다. 그것이 **RFC Function Module** 의 설계다.

### 무엇인가

#### 1. RFC (Remote Function Call - 원격 함수 호출)
- 서로 다른 SAP 시스템 간, 혹은 SAP 와 Non-SAP(외부 웹/앱) 간에 국경을 넘어 실시간으로 함수를 호출하고 리턴 값을 주고받는 통신 프로토콜 기술이다.

#### 2. Remote-Enabled Function Module (원격 호출 가능 함수)
- *함수 속성 창(SE37)의 통신 스위치다.*
- Attributes 탭에서 'Remote-Enabled' 옵션을 켜두어야 비소로 외부 외부 시스템이 내 함수를 찌를 수 있는 방화벽 문이 열린다. (파라미터 전송 시 레퍼런스 주소 전달이 안 되므로 무조건 VALUE 값을 복사해 전달받아야 하는 문법 제약이 생긴다.)

#### 3. EXCEPTIONS communication_failure AND system_failure MESSAGE
- *네트워크 폭사에 대비하는 안전 방패다.*
- 원격 통신 중 연결이 툭 끊기거나 대상 서버가 뻗으면 터지는 아바 내장 통신 예외다.
- **MESSAGE lv_msg (오류 단서 획득)**: **이 예외 구문 꼬리에 `MESSAGE 변수명` 을 얹어 선언해 두면, 원격 덤프 폭사 시 아바 엔진이 "네트워크 IP 대역 충돌" 이라든지 "대상 서버 패스워드 만료" 같은 OS 단의 상세 실패 사유 텍스트를 `lv_msg` 에 알아서 고스란히 배달해 주어, 눈 가리고 아웅 하는 삽질 디버깅을 차단해 준다.**

### 어떻게 확인하는가

SM59 Destination 지정을 거쳐 EXCEPTIONS MESSAGE 로 원격 장애 단서를 회수하는 호출 코드를 검증한다.

```abap
DATA: lt_booking TYPE ztt_booking,
      lv_err_msg TYPE string.

" 1. [원격 대상 시스템 Destination 을 타고 해외 함수 호출]
CALL FUNCTION 'Z_GET_BOOKINGS_RFC'
  DESTINATION 'MOM_SHOPS_SYS' " SM59 에 공식 등록된 외부 쇼핑몰 서버 연결 키!
  EXPORTING
    iv_concert            = 'C001'
  IMPORTING
    et_booking            = lt_booking
  EXCEPTIONS
    " 2. [★ 통신 및 시스템 오류 발생 시 원인 메시지 회수 장착]
    communication_failure = 1 MESSAGE lv_err_msg " 통신망 끊김 원인이 lv_err_msg 에 안착!
    system_failure        = 2 MESSAGE lv_err_msg " 원격지 덤프 원인이 lv_err_msg 에 안착!
    OTHERS                = 3.

" 3. [예외 판정 및 단서 로깅]
IF sy-subrc <> 0.
  " 덤프로 죽지 않고 안전하게 에러 단서 수집 완료!
  WRITE: / '원격 RFC 통신 실패!',
         / '오류 상세 원인 단서:', lv_err_msg.
ELSE.
  WRITE: / '원격 데이터 조회 성공. 건수:', lines( lt_booking ).
ENDIF.
```

#### 체험/시뮬레이터 설계 (RFC 원격 호출 시뮬)
- **프로세스 플로우**:
  1. 학습자가 [MOM_SHOPS_SYS 송출 기지] 와 [RFC 케이블선]을 본다.
  2. [정상 작동] 시 단추를 누르면, 데이터가 빛의 속도로 이송되어 조회 완료된다.
  3. 이번엔 [케이블 절단 (통신 장애)] 레버를 당기고 호출한다.
  4. [EXCEPTIONS MESSAGE 가드 OFF] 면 프로그램 전광판이 깨지며 덤프가 난다.
  5. [가드 ON] 을 켜자, lv_err_msg 칸에 "Connection timed out. Target unreachable" 경고 텍스트가 노란 불로 지잉 회수 배달되는 모습을 감상한다.
- **상태 및 데이터**:
  - `SM59 에 없는 임의의 가짜 Destination 'FAKE_SYS' 로 호출한 상태` -> 런타임 결과: `Destination FAKE_SYS not found in SM59. System Exception triggered` 하이라이트.
- **피드백**: 원격 통신은 항상 물리 장애 가능성을 동반하므로, EXCEPTIONS 와 원인 텍스트 수집 설계가 필수 기둥임을 깨닫는다.

### 실수/주의

- **Remote-Enabled FM 을 설계하면서 IMPORTING/EXPORTING 파라미터 선언 시 Pass Value(값 전달) 체크박스를 해제**:
  - 원격 통신은 바다 건너 메모리를 직접 참조할 수 없기 때문에 무조건 값을 통째 복사해서 넘겨주어야(Pass Value) 컴파일을 허용한다. 
  - Pass Value 체크를 빠뜨리면 아바 컴파일러가 "원격 함수에선 레퍼런스 전달을 할 수 없다" 며 즉각 컴파일 에러를 뿜는다.
  - **RFC 파라미터는 무조건 Pass Value 지정을 수호해야 한다.**

### 정리

- **`RFC`** 는 타 시스템 간 국경을 넘어 실시간으로 함수를 원격 호출한다.
- SE37 속성 창에서 **`Remote-Enabled`** 라디오 버튼 전원을 켜주어야 원격 호출이 뚫린다.
- **`communication_failure`** 예외 및 **`MESSAGE`** 단서 회수를 통해 통신 덤프를 안전 가드한다.

---

## CH30-L03 - BDC / Batch Input 실무 기준

### 왜 필요한가

RFC 원격 호출까지 완료했다.
그런데 이번에는 표준 데이터 등록 시 표준 BAPI 가 아예 제공되지 않는 막막한 표준 트랜잭션이 발목을 잡는다.
- "표준 공연 예매 프로그램인 `XX01` 에 데이터를 입력해야 하는데, SAP 가 웬일인지 BAPI 를 안 만들고 숨겨놓았다."
BAPI 가 없다고 표준 테이블에 쌩 DML(`INSERT`)을 날리는 것은 절대 불법이다.
결국 사람이 화면 켜서 직접 마우스로 클릭하고, 콘서트 ID 적고, 저장 누르는 삽질 행위를 아바 프로그램이 로봇 매크로처럼 1초 만에 화면 뒤에서 똑같이 **"화면 자동 조작 모사"** 를 해 주어야 정합성이 유지된다.

**사용자가 화면을 클릭하고 입력하는 Dynpro 흐름(BDCDATA)을 SHDB 리코더로 고스란히 녹화하여 뼈대 코드를 얻고, CALL TRANSACTION 옵션(ctu_params) 구조체를 통해 화면 노출 없이 고속 동기화 저장해 내는 기술**이 필요하다. 그것이 **BDC / Batch Input** 의 완수다.

### 무엇인가

#### 1. BDC (Batch Data Communication)
- 표준 BAPI 가 부재할 때, 사용자의 화면 입력 액션을 그대로 흉내 내어 트랜잭션을 실행하고 대량 데이터를 밀어 넣는 화면 자동화 모사 기술이다.

#### 2. BDCDATA (BDC 조작 전광판)
- ALV 의 필드카탈로그처럼, "몇 번 화면(Program/Dynpro)에, 어느 입력창(Field)에, 무슨 값(Value)을 적고, 무슨 엔터 버튼(BDC_OKCODE)을 눌러라" 고 단계별 매크로 시나리오를 가득 적어두는 테이블 구조다.

#### 3. ctu_params (CALL TRANSACTION 전용 매개체 구조체)
- *BDC 기동 시 화면 노출과 갱신 속도를 통제하는 지휘관이다.*
- **dismode (화면 모드)**:
  - **`N`**: 화면을 전혀 노출하지 않고(No display) 백그라운드에서 고속으로 화면을 모사해 돌린다. (대량 배치용 필수 지정이다.)
  - **`A`**: 모든 입력 과정을 눈앞에 영화처럼 슬로우 비디오로 다 뿌려 보여준다. (개발자 디버깅용이다.)
- **updmode (갱신 모드)**:
  - **`S`**: 동기(Synchronous) 업데이트 모드다. BDC 입력이 실제 DB 에 완벽하게 써질 때까지 아바가 다음 줄로 넘어가지 않고 꼼짝 않고 대기해 주어 정합성을 사수한다.

#### 4. Session Method (SM35 배치 입력 세션)
- CALL TRANSACTION 이 즉각 기동하고 끝나는 동기형이라면, Session 은 **SM35 배치 입력 큐**에 BDC 목록을 차곡차곡 쌓아놓고 야간 배치 잡을 통해 하나씩 실행하며, 실패 건만 화면을 켜서 재처리를 수행할 수 있는 대량용 고안전 레거시 기법이다. (BDC_OPEN_GROUP, BDC_INSERT, BDC_CLOSE_GROUP)

### 어떻게 확인하는가

SHDB 녹화 뼈대로 bdcdata 를 채우고 ctu_params 옵션을 장착해 CALL TRANSACTION 을 격발하는 코드를 검증한다.

```abap
DATA: lt_bdc  TYPE TABLE OF bdcdata,
      lt_msg  TYPE TABLE OF bdcmsgcoll,
      ls_opt  TYPE ctu_params.

" 1. [BDCDATA 시나리오 조립 - 헬퍼 서브루틴 이용]
PERFORM bdc_dynpro USING 'SAPMZACAD' '0100'. " 100번 화면 켜라!
PERFORM bdc_field  USING 'CONCERT_ID' 'C001'. " 콘서트입력창에 C001 적어라!
PERFORM bdc_field  USING 'BDC_OKCODE' '=SAVE'. " 저장 버튼 눌러라!

" 2. [★ ctu_params 지휘관 옵션 셋업]
ls_opt-dismode = 'N'. " 화면 노출 없이 은밀하고 고속으로 배치 가동!
ls_opt-updmode = 'S'. " DB 저장 안착될 때까지 대기 동기화!

" 3. [CALL TRANSACTION 실행]
CALL TRANSACTION 'XX01' USING lt_bdc
  OPTIONS FROM ls_opt " 옵션 구조체 장착!
  MESSAGES INTO lt_msg. " 화면 경고/성공 메시지 수거 스풀!
```

#### 체험/시뮬레이터 설계 (BDC 녹화 시뮬)
- **프로세스 플로우**:
  1. 학습자가 [SHDB 리코더 기계]를 본다. 
  2. [Start Recording] 을 누르자, 가상의 XX01 화면이 뜨고 학습자가 예매수 '5' 를 치고 [저장]을 누른다.
  3. 리코더 화면에 `SAPMZACAD 0100`, `SEATS = 5`, `BDC_OKCODE = =SAVE` BDCDATA 뼈대 테이블이 실시간으로 리스트 업되어 생성되는 비주얼을 확인한다.
  4. [dismode = N] 스위치를 켜고 돌리자 화면 없이 백엔드 DB 에 5석 예매 데이터가 즉각 주입 완료되는 피드백을 감상한다.
- **상태 및 데이터**:
  - `dismode = A 로 대량 1,000건 배치를 격발시킨 상태` -> 런타임 결과: `1,000 UI popups blocked. Server memory overflow danger` 적색 경보 작동.
- **피드백**: 실무 대량 배치 시에는 화면 노출 모드 'N' 과 동기 업데이트 'S' 조율이 아키텍처 생명선임을 인지한다.

### 실수/주의

- **표준 프로그램 화면에 신규 필수 필드가 추가되는 패치가 돌았는데, BDC 시나리오(BDCDATA)를 업데이트하지 않고 방치**:
  - 이 실수 시 BDC 는 예전 시나리오대로 필드를 안 적고 저장 버튼을 눌렀다가 "필수 필드를 입력하십시오" 고 화면 에러 락에 막혀 BDC 전체 배치가 먹통 폭사된다.
  - **BDC 는 화면 레이아웃 변화에 극도로 취약하므로, BAPI 가 있다면 무조건 BAPI 를 1순위로 지향해 설계해야 한다.**

### 정리

- **`BDC`** 는 BAPI 가 없을 때 사용자의 화면 조작 액션을 그대로 모사해 대량 입력한다.
- **`SHDB`** 리코더를 활용해 `BDCDATA` 화면/필드 뼈대 시나리오를 녹화 획득한다.
- **`ctu_params`** 구조체를 장착해 화면 모드 **`N`** (숨김)과 업데이트 모드 **`S`** (동기)를 조율한다.
- 대량 배치 재처리를 위해서는 **`SM35`** Session 기법으로 격리 큐를 운영한다.

---

## CH30-L04 - Excel Upload 처리

### 왜 필요한가

BDC 화면 자동화까지 이룩했다.
이번에는 실무 현장에서 매일 아침 출근한 현업 직원들이 가장 많이 사용하는 엑셀 일괄 업로드 인터페이스가 장벽이다.
- " 협력사에서 메일로 보내온 '오늘의 콘서트 예매 목록 엑셀(.xlsx) 파일' 1,000건을 SAP 화면에 드래그 앤 드롭해서 한 번에 밀어 넣고 싶다."
기존의 DB DML 이나 BAPI 는 엑셀 같은 로컬 PC 의 2진 바이너리 파일을 읽을 능력이 없다.
로컬 PC 디렉토리에 잠들어 있는 엑셀 파일을 백엔드로 안전하게 업로드(gui_upload)하고, 탭 구분자로 각 셀을 정교하게 쪼개 파싱하며, 첫 줄에 적힌 한글 타이틀 제목 헤더(Header) 줄은 로직 연산에서 스킵하는 정밀 분리 조립 기술이 필요하다.

**로컬 PC 경로에 대고 파일 수거기(gui_upload)를 기동해 텍스트 버퍼로 업로드하고, cl_abap_char_utilities=>horizontal_tab 탭 문자로 파싱 분할하며, 첫 줄 타이틀을 걷어낸 뒤, 외부 데이터 쌩 값을 BAPI 에 꽂기 전 철저히 사전 유효성 검문을 실행하는 기술**이 필요하다. 그것이 **Excel Upload 처리**다.

### 무엇인가

#### 1. cl_gui_frontend_services=>gui_upload (로컬 PC 파일 업로드)
- 사용자의 로컬 PC(C 드라이브 등) 디렉토리 경로에 접근하여, 지정된 텍스트/바이너리 파일을 읽어 아바 내부 텍스트 버퍼 테이블(`lt_raw`)에 얹어 넘겨주는 파일 이송 메서드다. (SAP GUI 세션이 켜져 있는 동안에만 기동된다.)

#### 2. horizontal_tab (탭 문자 구분자)
- **엑셀 파일을 쌩 텍스트 메모장 형식으로 열어보면, 각 셀 사이사이가 눈에 보이지 않는 탭(Tab) 문자로 띄워져서 정렬되어 있다.** 
- **`cl_abap_char_utilities=>horizontal_tab`** 의 탭 구분표를 기준으로 `SPLIT` 구문을 가동해야 콘서트ID 와 좌석 수 칼럼을 온전히 개별 변수로 도려낼 수 있다.

#### ⚠️ [ 외부 주입 데이터 무검증 DML 장적 절대 금지 명세]
- *실무 업로드 인터페이스 구축 시 데이터베이스를 걸레짝으로 만드는 최악의 문지기 누락이다.*
- 엑셀 시트에는 사용자가 실수로 수량 칸에 '오타' 를 적었거나, 시스템에 존재하지 않는 엉터리 'C999' 공연ID 를 타이핑해 넣었을 가능성이 다분하다.
- **이 데이터를 검증하지 않고 쌩으로 BAPI 나 MODIFY 테이블에 꽂으면, DB 데이터 정합성이 영구 붕괴되는 오염이 발생한다.**
- **방어 규칙**: 업로드한 데이터는 무조건 **시스템에 존재하는 마스터 키인지(`SELECT SINGLE`), 데이터 포맷과 빈 칸이 없는지 철저히 사전 유효성 검문 루프를 돌려 에러 건은 '업로드 불합격 로그' 로 걸러내고 무결한 건만 엄선**하여 BAPI/DML 로 밀어 넣어야 안전이 수호된다.

### 어떻게 확인하는가

gui_upload 로 수거한 날것의 데이터를 탭으로 SPLIT 파싱하고 첫 줄 헤더를 거르는 업로드 코드를 검증한다.

```abap
DATA: lt_raw TYPE TABLE OF string,
      lv_file TYPE string VALUE 'C:\temp\booking.txt'.

" 1. [로컬 PC 파일 수거 업로드 기동]
cl_gui_frontend_services=>gui_upload(
  EXPORTING
    filename                = lv_file
    filetype                = 'ASC' " 아스키 텍스트 포맷 수거!
  CHANGING
    data_tab                = lt_raw
  EXCEPTIONS
    file_open_error         = 1
    file_read_error         = 2
    no_authority            = 3
    OTHERS                  = 4.

IF sy-subrc <> 0.
  MESSAGE '파일 업로드 수거에 실패했습니다.' TYPE 'E'. RETURN.
ENDIF.

" 2. [★ 첫 줄 타이틀 헤더 스킵 및 탭 파싱 순회]
LOOP AT lt_raw INTO DATA(lv_line).
  " sy-tabix = 1 은 '예약번호', '공연ID' 같은 한글 타이틀 제목줄이므로 연산 패스!
  IF sy-tabix = 1. CONTINUE. ENDIF.
  
  " 3. [horizontal_tab 탭 문자로 칼럼 쪼개기]
  SPLIT lv_line AT cl_abap_char_utilities=>horizontal_tab
    INTO DATA(lv_book_id)
         DATA(lv_concert_id)
         DATA(lv_seats_str).
         
  " 4. [★ 외부 쌩 데이터 사전 검문소 가동]
  " 날것의 콘서트ID 가 진짜 마스터 테이블에 상주하는지 검문!
  SELECT SINGLE concert_id FROM zconcert 
    INTO @DATA(lv_chk) WHERE concert_id = @lv_concert_id.
    
  IF sy-subrc <> 0.
    " 엉터리 데이터 검출 시 저장 차단 로그 박고 스킵!
    WRITE: / '오류 행 검출. 미등록 공연ID:', lv_concert_id.
    CONTINUE.
  ENDIF.
  
  " 통과자만 내부 정식 예약 테이블에 적재 완료!
ENDLOOP.
```

#### 체험/시뮬레이터 설계 (Excel 업로드 파싱기)
- **프로세스 플로우**:
  1. 학습자가 [예약 엑셀 시트 파일] 과 [gui_upload 기계]를 본다. 
  2. 첫 행에 [예매ID, 공연ID, 수량] 헤더 제목 카드가 있다. 
  3. [헤더 건너뛰기 = OFF] 면 첫 줄 한글 텍스트를 파싱하다가 수량 숫자가 아니라고 다운되는 참상을 본다.
  4. [헤더 건너뛰기 = ON] 을 켜자 첫 줄을 가볍게 패스하고 2대 데이터 행만 수집한다.
  5. 이때 엉터리 'C999' 공연 행이 주입될 때, [사전 검문 ON] 에 의해 "미등록 공연 에러 거절!" 적색 꼬리표가 붙어 스킵 탈출되는 안전 피드백을 감상한다.
- **상태 및 데이터**:
  - `horizontal_tab 이 아닌 쌩 공백(Space)으로 분리해 쪼개다 필드 꼬임이 난 상태` -> 런타임 결과: `SPLIT failed. Columns shifted. Illegal value injection` 하이라이트.
- **피드백**: 외부 엑셀 업로드는 무조건 탭 구분자 정렬 정합성을 맞추고, 쌩 값에 대한 사전 검문을 단단히 채워야 함을 배운다.

### 실수/주의

- **ALSM_EXCEL_TO_INTERNAL_TABLE 셀 단위 구형 함수를 5만 건 대량 업로드 업로드에 적용**:
  - 이 구형 함수는 셀 1칸당 1행씩 쪼개어 internal table 에 적재하므로, 5만 건 업로드 시 테이블 행수가 수십만 건으로 불어나 서버 램 메모리를 잠식하고 프로그램 타임아웃 덤프 폭사를 유발한다.
  - **대량 업로드 시에는 CSV 나 탭 텍스트 형식으로 수령해 단건 SPLIT 으로 고속 연산해야 함을 수호해야 한다.**

### 정리

- **`gui_upload`** 는 SAP GUI 세션을 타고 로컬 PC 의 파일을 날것으로 수거해 온다.
- **`cl_abap_char_utilities=>horizontal_tab`** 의 탭 문자를 구분자로 쪼개 분리한다.
- 타이틀 헤더 줄 스킵(`sy-tabix = 1`)과 **`외부 주입 데이터 사전 검증`** 은 데이터 오염을 막는 방패다.

---

## CH30-L05 - File Interface와 재처리

### 왜 필요한가

로컬 PC 파일 업로드까지 완성했다.
이제 인터페이스의 최종 끝판왕인 '야간 자동 배치 서버 파일 연동(Application Server Interface)' 과 '장애 재처리 구조' 를 마주한다.
- " 매일 밤 새벽 2시, 우리 서버에 연결된 은행 전산망 디스크 폴더(`/usr/sap/interfaces/`)에 자동으로 놓여 있는 '당일 결제 정산 텍스트 파일' 을 아바 프로그램이 스케줄러로 조용히 깨어나 열어서 결제를 정산 완료하고 싶다."
앞서 배운 `gui_upload` 는 화면 SAP GUI 가 켜져 있고 사용자가 마우스로 클릭해야만 도는 '로컬 PC 용' 인터페이스여서, 새벽 2시 화면 없는 야간 배치 세션에선 "화면 연결 끊김" 에러를 뿜으며 기동 자체가 거부된다.
또한, 서버 파일 경로를 쌩으로 여는 과정에서 해커가 상위 디렉토리 이동 명령어(`../`)를 비집고 들어와 OS 내부 비공개 시스템 패스워드 파일을 털어가는 **Directory Traversal** 보안 취약점이 도사리고, 동시에 여러 파일을 열어두었다가 OS 핸들 락 초과로 시스템이 폭사한다.

**화면 GUI 가 없어도 백엔드 OS 디스크에 직접 읽고 쓰는 서버 파일 전용 명령어(OPEN DATASET)를 탑재하고, 다 쓴 뒤엔 반드시 뚜껑을 닫아(CLOSE DATASET) 100개 제한 덤프를 방어하며, 파일 경로의 정규화 보안 검증과 함께 실패 건을 따로 모아 재처리하는 잡 아키텍처 기술**이 필요하다. 그것이 **File Interface와 재처리** 의 완수다.

### 무엇인가

#### 1. Application Server File Interface (서버 파일 처리)
- 화면 SAP GUI 와 상관없이, SAP 백엔드 인스턴스가 상주하는 Unix/Windows 서버 OS 디렉토리 디스크 상에 파일을 직접 열고 쓰고 닫는 기술이다.
- **FOR INPUT** / **FOR OUTPUT** / **FOR APPENDING**:
  - `FOR INPUT`: 서버 파일을 순수 읽기 모드로 오픈한다.
  - `FOR OUTPUT`: 서버 파일을 새로 쓰기(기존 파일 삭제 덮어쓰기) 모드로 오픈한다.
  - `FOR APPENDING`: 기존 파일 꼬리에 데이터를 이어 붙여 쓰기 모드로 오픈한다.
- **TRANSFER** 와 **READ DATASET**:
  - `READ DATASET`: 서버 파일에서 텍스트 1줄을 읽어 아바 변수에 적재한다.
  - `TRANSFER`: 아바 변수의 데이터를 서버 파일 디스크에 1줄씩 출력해 쓴다.

#### ⚠️ [ OPEN DATASET 최대 100개 제한 및 CLOSE DATASET 의무 명세]
- *야간 배치 프로그램 구동 시 서버 메모리를 셧다운시키는 주요 핸들 누수 덤프 제약이다.*
- **아바 내부 세션당 동시에 열어놓고 상주할 수 있는 파일 핸들 개수는 최대 100개(Up to 100 files)로 엔진 상에서 하드코딩 격리 제약되어 있다.**
- **이유**: 만약 루프를 돌며 파일을 수시로 열어젖히는데 다 쓴 뒤 **`CLOSE DATASET lv_path.`** 를 빼먹어 파일 핸들을 닫아주지 않으면, 101번째 파일을 여는 순간 즉시 캐치 예외인 **`CX_SY_TOO_MANY_FILES` 캐시 덤프**를 내뱉고 배치 잡 전체가 뻗어버리는 장애를 겪는다. 다 쓴 파일은 즉시 Close 수호하는 것이 의무다.

#### ⚠️ [ 파일 경로 외부 주입 시 Directory Traversal 보안 가드 명세]
- *SAP 시스템 해킹 및 정보 유출 사고를 막는 최우선 보안 필수 가드라인이다.*
- 외부 사용자가 파일명 입력칸에 `../../etc/passwd` 와 같이 상대 경로 상위 폴더 이동 기호를 섞어 날리면, 아바 프로그램은 아무 생각 없이 `/usr/sap/interfaces/../../etc/passwd` 즉, `/etc/passwd` 시스템 패스워드 파일을 열어서 바깥으로 전송해 주는 이적 행위를 자행한다.
- **방어선 (정규화)**: 반드시 파일명을 접수받으면 **`cl_fs_path_section` 이나 파일 경로 정규화 함수(FILE_VALIDATE_NAME 등)를 경유해 상위 디렉토리 탈출 시도가 없는 화이트리스트 지정 절대 경로 내의 안전한 텍스트 파일인지 물리 정규화 검문을 통과한 파일만 오픈**해야 정합성이 수호된다.

### 어떻게 확인하는가

보안 가드 검문을 거쳐 UTF-8 텍스트 모드로 OPEN 하고 에러를 lv_msg 로 잡아 CLOSE 로 닫는 코드를 검증한다.

```abap
DATA: lv_rec     TYPE string,
      lv_msg     TYPE string,
      lv_path    TYPE string VALUE '/usr/sap/interfaces/booking.txt'.

" 1. [★ Directory Traversal 해킹 방어선 작동]
" 외부 주입 경로가 화이트리스트 논리 경로에 부합하는지 정규화 검문!
CALL FUNCTION 'FILE_VALIDATE_NAME'
  EXPORTING
    logical_filename           = 'ZBOOK_INT_DIR' " 사전에 정의해 둔 안전 격리 폴더명!
  CHANGING
    physical_filename          = lv_path " 수입된 파일 경로!
  EXCEPTIONS
    name_not_valid             = 1 " 상위 경로(../) 탈출 시도 검출 시 즉각 거부!
    OTHERS                     = 2.

IF sy-subrc <> 0.
  MESSAGE '보안 위배: 허용되지 않은 상위 경로 파일에 대한 접근이 거부되었습니다.' TYPE 'E'.
  RETURN.
ENDIF.

" 2. [서버 파일 UTF-8 인코딩 모드 오픈 및 OS 에러 메시지 바인딩]
OPEN DATASET lv_path FOR INPUT IN TEXT MODE ENCODING UTF-8
  MESSAGE lv_msg. " OS 권한 부족이나 경로 누락 실패 시 원인 텍스트가 lv_msg 에 도킹!

IF sy-subrc <> 0.
  WRITE: / 'OS 파일 오픈 실패! 원인:', lv_msg.
  RETURN.
ENDIF.

" 3. [1줄씩 순회 읽기]
DO.
  READ DATASET lv_path INTO lv_rec.
  IF sy-subrc <> 0.
    EXIT. " 파일 끝(EOF)에 도달하면 루프 탈출!
  ENDIF.
  " 파싱 및 비즈니스 적재 가동...
ENDDO.

" 4. [★ 파일 핸들 누수 방지 CLOSE DATASET 의무 지정]
CLOSE DATASET lv_path. " 열어젖힌 뚜껑을 닫아주어 100개 제한 덤프 방어 완료!
```

#### 체험/시뮬레이터 설계 (서버 파일 배치 처리기)
- **프로세스 플로우**:
  1. 학습자가 [Unix 서버 디렉토리 /usr/sap/] 와 [배치 잡 스케줄러]를 본다.
  2. 파일명 칸에 [../../../etc/shadow] 카드를 꽂고 구동한다. [보안 가드 OFF] 면 리눅스 계정 파일이 터져 나와 해킹 유출된다.
  3. [보안 가드 ON] 을 켜자 `FILE_VALIDATE_NAME` 단속반이 카드를 압수해 던지고 에러 거절을 띄우는 모습을 본다.
  4. 이번에는 파일 101개를 [CLOSE DATASET OFF] 한 채 연속 오픈한다. 101번째 파일에서 `CX_SY_TOO_MANY_FILES` 덤프 폭발음과 함께 프로그램이 즉사한다.
  5. [CLOSE DATASET ON] 스위치를 켜자, 1건씩 열고 파싱 후 촥 닫혀 파일 핸들 락이 0개로 무결하게 유지되는 피드백을 감상한다.
- **상태 및 데이터**:
  - `OPEN DATASET 시 ENCODING UTF-8 지정을 누락해 한글이 깨져 기입된 상태` -> 런타임 결과: `Broken encoding character detected. Input parsed as garbage value` 경고 하이라이트.
- **피드백**: 서버 파일 인터페이스는 화면이 없는 야간 원격 상황이므로, OS 단의 예외 메시지 캡처와 리소스 반환(CLOSE), 그리고 보안 경로 정규화가 생명임을 각인한다.

### 실수/주의

- **OPEN DATASET 을 수행하는 야간 배치 프로그램에 cl_gui_frontend_services=>gui_upload 함수를 섞어서 개발**:
  - 이 실수 시 낮에 개발할 때는 GUI 가 켜져 있어 잘 돌다가, 새벽 2시 배치 스케줄러가 돌아 GUI 세션이 없을 때 함수 호출 시 "Frontend 서비스 이용 불가" 덤프를 내며 배치가 뻗어 정산이 빵꾸나는 불상사를 초래한다.
  - **야간 배치에는 절대 GUI 텍스트/화면 연동 함수를 섞어선 안 되며 오직 OPEN DATASET 계열로만 순수하게 설계해야 함을 수호해야 한다.**

### 정리

- 배치 서버 파일 처리는 GUI 가 없으므로 **`OPEN DATASET`** 과 **`CLOSE DATASET`** 으로 집행한다.
- 동시에 열 수 있는 파일은 **`최대 100개`** 이며, CLOSE 누락 시 `CX_SY_TOO_MANY_FILES` 덤프가 난다.
- 외부 경로 주입 시 **`FILE_VALIDATE_NAME`** 등을 통해 Directory Traversal 해킹을 원천 봉쇄한다.
- *참고로 이 파일 인터페이스 기술은 클래식 파일 IO 이며 Cloud 에선 Released 파일 클래스나 API 로 전환된다.*
