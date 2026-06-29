# CH30_REWRITE - 인터페이스 실무: BAPI/RFC/BDC/File

> 기준 자료: `content/abap/CH30`, `reference/codex_0625/CH30_인터페이스-실무-BAPIRFCBDCFile.md`, `reference/codex_0625/00_QUALITY_REVIEW.md`
> 재집필 목표: 외부 시스템과 데이터를 주고받는 실무 인터페이스를 "호출 성공" 중심이 아니라 메시지, 오류, 로그, 재처리, 운영 안정성 중심으로 가르친다.
> Classic-first 경계: 이 장은 Classic ABAP 실무 인터페이스인 BAPI, RFC Function Module, BDC, PC 파일 업로드, 서버 파일 인터페이스를 다룬다. ABAP Cloud와 Clean Core는 "released API와 공개 계약을 우선한다"는 경계 설명에만 사용하고, RAP 서비스 구현이나 Cloud 전용 연동 구현으로 확장하지 않는다.

## CH30 전체 강의 지도

CH29에서는 표준 SAP 기능 안에 고객 로직을 꽂는 확장 지점을 배웠다. CH30에서는 시스템 밖과 데이터를 주고받는 문제로 넘어간다. 현업에서는 "외부 쇼핑몰 주문을 SAP 판매오더로 넣어야 한다", "다른 SAP 시스템에서 예매 정보를 조회해야 한다", "표준 BAPI가 없는 오래된 트랜잭션에 대량 데이터를 넣어야 한다", "사용자가 엑셀로 준 파일을 검증해서 등록해야 한다", "서버에 쌓이는 파일을 야간 배치로 읽고 실패 건을 재처리해야 한다" 같은 요구가 계속 나온다.

인터페이스를 처음 배우는 사람은 보통 "어떻게 호출하지?"에만 집중한다. 하지만 실무에서 더 중요한 질문은 "실패하면 어디에 남는가?", "다시 처리할 수 있는가?", "중복으로 들어오면 막을 수 있는가?", "누가 어떤 원인으로 실패했는지 운영자가 볼 수 있는가?"이다. CH30의 핵심은 호출 기술보다 운영 가능한 흐름이다.

| 레슨 | 주제 | 학습 초점 | 대표 확인 지점 |
| --- | --- | --- | --- |
| CH30-L01 | BAPI 호출과 Return 처리 | 표준 API 호출 후 메시지를 보고 COMMIT/ROLLBACK 판단 | `BAPIRET2`, `BAPI_TRANSACTION_COMMIT`, `BAPI_TRANSACTION_ROLLBACK` |
| CH30-L02 | RFC Function Module 설계 | 다른 시스템에서 호출할 수 있는 함수 모듈의 계약 | `CALL FUNCTION ... DESTINATION`, `SM59`, `communication_failure`, `system_failure` |
| CH30-L03 | BDC / Batch Input | BAPI가 없을 때 화면 입력을 자동화하는 레거시 수단 | `BDCDATA`, `CALL TRANSACTION ... USING`, `OPTIONS FROM`, `SM35`, `SHDB` |
| CH30-L04 | Excel Upload 처리 | PC 파일을 읽어 내부 테이블로 만들고 검증 | `gui_upload`, `SPLIT`, header skip, row validation |
| CH30-L05 | File Interface와 재처리 | 서버 파일 기반 배치 인터페이스의 공통 구조 | `OPEN DATASET`, `READ DATASET`, `TRANSFER`, `CLOSE DATASET`, 로그, 재처리 |

수동 확인한 공식 근거는 두 묶음이다. Classic ABAP 문법은 `C:\ABAP_DOCU_HTML`에서 `abapcall_function.htm`, `abapcall_function_destination.htm`, `abapcall_function_destination_para.htm`, `abenrfc_exception.htm`, `abapcall_transaction_using.htm`, `abencall_transaction_bdc_abexa.htm`, `abapopen_dataset.htm`, `abapopen_dataset_access.htm`, `abapopen_dataset_error_handling.htm`, `abapread_dataset.htm`, `abaptransfer.htm`, `abapclose_dataset.htm`, `abapsplit.htm`, `abapcommit.htm`, `abaprollback.htm`를 직접 확인했다. ABAP Cloud와 BAPI glossary 경계는 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md\ABENBUSINESS_APP_PROG_INTER_GLOSRY.md`, `...\cloud\md\ABENBUSINESS_APP_PROG_INTER_GLOSRY.md`, `...\cloud\md\ABENABAP_CLOUD_GLOSRY.md`, `...\cloud\md\ABENABAP_FOR_CLOUD_DEV_GLOSRY.md`, `...\cloud\md\ABENRELEASED_API_GLOSRY.md`를 확인했다.

로컬 문서에서 필요한 근거가 확인되었으므로 인터넷 검색과 NotebookLM 보충은 사용하지 않았다. 특히 BAPI는 ABAP Keyword의 일반 문법이라기보다 SAP application data/process에 접근하는 predefined interface로 설명되어 있었고, BAPI는 remote-called function module로 구현되며 사용자 dialog를 이끌면 안 된다는 경계를 확인했다.

R15 기준으로 CH30은 Track 2 구간이다. CH10의 Function Module, CH16의 화면 처리, CH18의 modern ABAP 기본, CH24의 COMMIT/ROLLBACK과 재처리 관점을 이미 학습한 뒤에 온다. 따라서 `line_exists`, inline `DATA`, `BAPI_TRANSACTION_COMMIT`, RFC 예외 처리, BDC 옵션, 서버 파일 처리까지 다룰 수 있다. 다만 CH31의 IDoc/ALE/Gateway는 이 장 끝에서 이름만 예고하고 구현 세부는 다루지 않는다.

## CH30-L01 - BAPI 호출과 Return 처리

### 왜 필요한가

표준 SAP 데이터를 변경해야 할 때 가장 위험한 접근은 표준 테이블을 직접 `INSERT`, `UPDATE`, `DELETE`하는 것이다. 판매오더, 구매오더, 자재, 전표 같은 표준 객체는 단순히 한 테이블에 한 줄을 넣는 구조가 아니다. 필수값 검증, 번호 채번, 상태 변경, 관련 테이블 반영, 메시지 생성, 권한, 후속 처리까지 함께 움직인다.

BAPI(Business Application Programming Interface)는 이런 표준 업무 객체를 외부나 고객 프로그램에서 사용할 수 있도록 SAP가 제공하는 표준 interface다. 공식 glossary 기준으로 BAPI는 SAP application의 data와 process에 접근하는 predefined interface이며, Business Object Repository에 저장된다. 이름은 보통 `BAPI_<business object>_<method>` 패턴을 따르고, remote-called function module로 구현된다.

입문자가 이 레슨에서 반드시 바꿔야 할 습관은 "BAPI를 호출했으니 성공"이라고 생각하는 것이다. BAPI 호출 뒤에는 거의 항상 Return 메시지를 읽어야 한다. Return 안에 오류가 있으면 저장을 확정하지 말고 rollback해야 한다. 오류가 없을 때만 commit한다. 즉 BAPI 실무의 중심은 호출문이 아니라 `RETURN -> 판정 -> COMMIT/ROLLBACK -> 로그` 흐름이다.

### 무엇인가

`BAPIRET2`는 BAPI가 결과를 알려 줄 때 자주 쓰는 표준 메시지 구조다. 핵심 필드는 `TYPE`, `ID`, `NUMBER`, `MESSAGE`, `MESSAGE_V1`~`MESSAGE_V4` 같은 메시지 정보다. 여기서 `TYPE = 'E'`는 오류, `TYPE = 'A'`는 중단에 가까운 심각한 메시지로 본다. `S`는 성공, `W`는 경고, `I`는 정보일 수 있지만, 실제 업무에서는 BAPI별 문서를 보고 어떤 메시지를 실패로 볼지 정해야 한다.

다음 코드는 BAPI 호출의 뼈대다. 함수명과 parameter 이름은 업무 객체마다 다르지만, Return을 읽고 LUW를 끝내는 판단 흐름은 거의 같은 모양으로 반복된다.

```abap
DATA lt_return TYPE TABLE OF bapiret2.

CALL FUNCTION 'BAPI_..._CREATE'
  EXPORTING
    is_header = ls_header
  TABLES
    return    = lt_return.

IF line_exists( lt_return[ type = 'E' ] )
   OR line_exists( lt_return[ type = 'A' ] ).
  CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
ELSE.
  CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
    EXPORTING
      wait = abap_true.
ENDIF.
```

`BAPI_TRANSACTION_COMMIT`은 BAPI로 만든 변경을 확정하는 표준 함수다. `wait = abap_true`는 update 처리가 끝날 때까지 기다리겠다는 뜻으로 운영 로그와 후속 확인에 유리하다. 반대로 Return에 오류가 있으면 `BAPI_TRANSACTION_ROLLBACK`으로 현재 작업 단위를 취소한다. CH24에서 배운 COMMIT/ROLLBACK 원칙이 BAPI 실무에서 그대로 살아난다.

### 어떻게 확인하는가

첫 번째 확인은 BAPI 문서와 parameter다. `SE37` 또는 BAPI Explorer에서 BAPI 이름, 필수 입력값, Return 구조, commit 필요 여부를 확인한다. 모든 BAPI가 같은 방식으로 Return을 주지는 않는다. 어떤 BAPI는 `RETURN` 단일 구조를 쓰고, 어떤 BAPI는 `RETURN` 테이블을 쓴다. 어떤 메시지 타입을 실패로 볼지도 BAPI별 설명과 업무 기준을 함께 봐야 한다.

두 번째 확인은 호출 직후 Return 내용이다. 정상 케이스와 오류 케이스를 둘 다 실행해 `TYPE`, `ID`, `NUMBER`, `MESSAGE`가 어떻게 들어오는지 확인한다. 개발 중에는 성공 데이터 한 건만 넣고 끝내면 안 된다. 고객 없음, 필수값 누락, 권한 부족, 중복 키, 기간 오류 같은 실패 데이터를 일부러 넣어 메시지 판정이 맞는지 봐야 한다.

세 번째 확인은 commit 결과다. Return에 `E` 또는 `A`가 없어서 commit을 호출했다면 실제 표준 객체가 생성되었는지 조회한다. Return이 성공처럼 보여도 후속 update 실패가 있을 수 있으므로 `wait = abap_true`를 쓰고, 필요하면 생성된 key로 재조회한다. 오류 케이스에서는 rollback 뒤 데이터가 남지 않았는지 확인한다.

네 번째 확인은 로그다. 실무 인터페이스는 화면에서 한 번 실행하고 끝나지 않는다. 입력 key, BAPI 이름, Return 메시지 전체, commit/rollback 결과, 처리 시각, 처리자 또는 job 이름을 로그 테이블이나 Application Log에 남겨야 한다. 그래야 운영자가 "왜 실패했는지"를 개발자 없이도 볼 수 있다.

### 실수와 주의

가장 흔한 실수는 Return을 확인하지 않고 commit하는 것이다. BAPI가 메시지로 오류를 알려 줬는데도 commit하면, 실패로 처리했어야 할 데이터가 일부 반영되거나 후속 처리와 맞지 않는 상태가 될 수 있다. 반대로 Return을 확인했지만 로그에 남기지 않으면 운영에서 같은 오류가 반복되어도 원인을 추적하기 어렵다.

두 번째 실수는 commit을 누락하는 것이다. 많은 BAPI는 스스로 commit하지 않는다. "함수 호출은 성공했는데 데이터가 안 보인다"는 문제의 상당수는 commit 누락이다. 단, BAPI마다 commit 정책이 다를 수 있으므로 해당 BAPI 문서를 확인해야 한다.

세 번째 실수는 warning을 무조건 성공으로 넘기는 것이다. `W` 메시지는 기술적으로 오류가 아닐 수 있지만, 업무적으로는 중단해야 하는 경고일 수도 있다. 예를 들어 "가격 조건이 기본값으로 대체됨" 같은 메시지는 주문 생성 성공처럼 보여도 운영상 문제가 될 수 있다. 인터페이스별로 허용 가능한 warning 목록을 정해야 한다.

네 번째 실수는 BAPI를 Clean Core의 만능 답으로 착각하는 것이다. Classic ABAP에서는 BAPI가 표준 테이블 직접 변경보다 안전한 공개 interface인 경우가 많다. 그러나 ABAP Cloud 관점에서는 repository object가 released API인지가 중요하다. Cloud-ready 판단이 필요한 개발에서는 released API 여부를 별도로 확인해야 한다.

### 체험형 학습 설계

`CH30-L01-S01`은 "BAPI Return 처리 - COMMIT vs ROLLBACK" 시뮬레이터다. 화면에는 `정상 입력`, `오류 입력(고객 없음·필수 누락)`, `BAPI 호출` 버튼이 있다. 학습자는 먼저 정상 입력을 선택하고 호출해 `RETURN (TABLE OF bapiret2)` 패널에 성공 메시지가 쌓이는 것을 본다. 결과 영역은 `오류 없음 -> BAPI_TRANSACTION_COMMIT`으로 판단한다.

오류 입력을 선택하면 Return 패널에 `TYPE = E` 메시지가 나타난다. 이때 결과 영역은 `오류 있음 -> BAPI_TRANSACTION_ROLLBACK`으로 바뀐다. 핵심 피드백은 "함수 호출 성공 여부가 아니라 Return 메시지의 업무 판정이 commit 여부를 결정한다"이다.

버튼과 상태는 네 가지로 설계한다. `정상 입력`은 필수값이 모두 있는 요청 상태, `오류 입력`은 고객 없음과 필수값 누락 상태, `BAPI 호출`은 Return 생성 상태, 결과 패널은 `COMMIT`, `ROLLBACK`, `판정 대기` 상태를 가진다. 데이터는 예매 생성 요청 한 건으로 두고, 정상 케이스는 `customer = 정훈영`, 오류 케이스는 `customer = blank`, `booking_date = blank`로 둔다.

피드백은 메시지별로 구체적으로 보여 준다. 성공이면 `S: Booking can be created`, 오류면 `E: Customer is missing`, `E: Booking date is required`처럼 Return row를 표시한다. 마지막에는 "이 메시지 전체를 로그에 남겨야 재처리할 수 있다"는 안내를 붙인다.

### 정리

BAPI는 표준 업무 객체를 안전하게 다루기 위한 SAP 제공 interface다. 하지만 BAPI 실무의 핵심은 호출문이 아니라 Return 처리다. `BAPIRET2` 메시지에 `E` 또는 `A`가 있는지 보고 rollback할지 commit할지 결정해야 한다.

CH30-L01을 마치면 "표준 API를 호출했다"보다 "Return을 읽고, 저장 확정 여부를 판단하고, 운영 로그를 남겼다"가 더 중요한 완료 조건이라는 감각을 가져야 한다. 다음 레슨에서는 다른 시스템이 내 함수 모듈을 부르는 RFC 구조를 배운다.

## CH30-L02 - RFC Function Module 설계

### 왜 필요한가

인터페이스에는 두 방향이 있다. 내가 SAP 안에서 BAPI를 호출해 표준 기능을 쓰는 방향이 있고, 다른 시스템이 SAP 안의 기능을 호출하는 방향이 있다. 예를 들어 외부 예매 사이트가 SAP에 "공연별 남은 좌석을 알려 달라"고 요청하거나, 다른 SAP 시스템이 "예약 번호로 예매 상태를 조회해 달라"고 요청할 수 있다.

RFC(Remote Function Call)는 이런 원격 호출을 위한 SAP의 오래된 핵심 기술이다. 호출 측 프로그램은 `CALL FUNCTION ... DESTINATION`으로 대상 시스템을 지정하고, 대상 시스템의 remote-enabled function module을 호출한다. 공식 문서 기준으로 `DESTINATION`은 RFC destination을 지정하며, 호출한 프로그램은 원격 함수가 끝난 뒤 계속 진행된다.

입문자가 알아야 할 핵심은 원격 호출은 로컬 함수 호출보다 실패 지점이 많다는 것이다. 함수 로직 오류뿐 아니라 destination 누락, 로그온 실패, 네트워크 단절, 권한 부족, 대상 시스템 dump, parameter 변환 문제가 생긴다. 그래서 RFC 설계는 "함수 하나 만들기"가 아니라 "연결, 계약, 예외, 로그를 함께 설계하기"다.

### 무엇인가

Remote-Enabled Function Module은 RFC interface로 외부에서 호출될 수 있게 설정한 함수 모듈이다. SE37에서 processing type을 remote-enabled로 설정하고, import/export/table parameter를 외부 호출에 맞게 설계한다. RFC parameter 전달은 일반 함수 호출과 비슷하지만, 공식 문서상 원격 호출에서는 일부 typing 검사가 호출 측에서 강하게 보장되지 않고, 실제 remote function module 쪽에서 처리되거나 변환된다.

호출 측 코드는 다음처럼 생긴다.

```abap
DATA lv_msg TYPE string.

CALL FUNCTION 'Z_GET_BOOKINGS'
  DESTINATION 'TARGET_SYS'
  EXPORTING
    iv_concert = lv_concert_id
  IMPORTING
    et_booking = lt_booking
  EXCEPTIONS
    communication_failure = 1 MESSAGE lv_msg
    system_failure        = 2 MESSAGE lv_msg
    OTHERS                = 3.
```

`DESTINATION 'TARGET_SYS'`는 `SM59`에 등록된 연결 이름이다. `communication_failure`는 연결 수립, 통신 계층, 리소스 할당 같은 문제에서 발생할 수 있다. `system_failure`는 원격 함수 실행 중 runtime error나 A/E/X 메시지 같은 서버 측 문제와 연결된다. 공식 문서의 RFC 예외 설명은 predefined exception을 처리하라고 권고한다.

`MESSAGE lv_msg`는 실무에서 특히 중요하다. `communication_failure`나 `system_failure` 뒤에 `MESSAGE`를 붙이면 실패 원인 텍스트를 받을 수 있다. 이 텍스트는 화면 메시지, Application Log, 인터페이스 로그에 남길 핵심 단서가 된다.

### 어떻게 확인하는가

첫 번째 확인은 함수 모듈 속성이다. SE37에서 함수가 Remote-Enabled로 설정되어 있는지 확인한다. 외부에서 호출할 함수는 화면을 띄우거나 사용자 입력을 요구하면 안 된다. BAPI glossary에서도 BAPI는 user dialog를 이끌면 안 된다는 경계를 갖는다. RFC 함수도 같은 운영 원칙을 가져야 한다.

두 번째 확인은 destination이다. SM59에서 `TARGET_SYS` 같은 RFC destination이 존재하는지, connection test가 성공하는지, 로그온 정보와 권한이 맞는지 본다. destination 이름이 공백이거나 blank면 공식 문서상 `DESTINATION` addition이 무시되어 일반 local call처럼 동작할 수 있으므로, 설정 누락을 조용히 지나치지 않도록 검증해야 한다.

세 번째 확인은 parameter 계약이다. 외부 호출자는 SAP 내부 타입을 세세하게 모를 수 있다. 너무 복잡한 deep structure, 참조 변수, 내부 구현에 묶인 타입을 노출하면 호출자가 쓰기 어렵다. 입력과 출력은 의미가 명확한 구조로 만들고, 필수값과 허용값을 문서화한다.

네 번째 확인은 실패 시나리오다. 정상 호출만 테스트하지 말고 destination 누락, 통신 실패, 권한 실패, 원격 함수 dump, 업무 오류를 나눠 테스트한다. `sy-subrc`, `lv_msg`, 원격 시스템 로그, 호출 측 인터페이스 로그가 각각 어떤 값을 갖는지 확인해야 운영에서 원인을 분류할 수 있다.

### 실수와 주의

첫 번째 실수는 RFC를 로컬 함수처럼 생각하는 것이다. 로컬 함수는 같은 시스템 안에서 바로 실행되지만 RFC는 네트워크와 대상 시스템 상태에 의존한다. 그러므로 예외 처리를 생략하면 장애 때 "그냥 덤프" 또는 "그냥 실패"로 끝난다.

두 번째 실수는 `communication_failure`와 `system_failure`를 같은 오류로 뭉개는 것이다. 통신 실패는 연결이나 네트워크 문제일 가능성이 크고, system failure는 대상 시스템 내부 실행 문제일 가능성이 크다. 재처리 정책도 다를 수 있다. 통신 실패는 잠시 후 자동 재시도 후보가 될 수 있지만, system failure는 데이터나 코드 수정이 먼저 필요할 수 있다.

세 번째 실수는 원격 함수 안에서 dialog를 띄우는 것이다. 외부 시스템이 호출하는 함수에서 팝업, selection screen, 사용자 확인을 요구하면 호출자는 응답할 방법이 없다. 원격 함수는 입력 parameter를 받고, 처리 결과와 메시지를 반환하는 방식으로 설계해야 한다.

네 번째 실수는 보안과 권한을 뒤로 미루는 것이다. RFC destination에는 로그온 정보와 권한 모델이 얽힌다. 개발 시스템에서만 성공하는 계정으로 운영을 연결하거나, 과도한 권한을 주면 운영 리스크가 커진다. 누가 어떤 기능을 원격으로 실행할 수 있는지 반드시 확인해야 한다.

### 체험형 학습 설계

`CH30-L02-S01`은 "RFC 원격 호출 - DESTINATION·통신 예외" 시뮬레이터다. 화면은 왼쪽 `호출 측(로컬) 내 프로그램`, 가운데 `SM59 'TARGET_SYS'`, 오른쪽 `대상(원격) Z_GET_BOOKINGS` 흐름으로 구성된다. 학습자는 `정상 호출`, `DESTINATION 누락`, `통신 실패` 중 하나를 선택하고 `원격 호출` 버튼을 누른다.

정상 호출에서는 연결선이 활성화되고 결과 패널에 예약 목록이 표시된다. DESTINATION 누락에서는 연결 이름이 비어 있어 호출 대상이 불분명하다는 경고를 보여 준다. 통신 실패에서는 `communication_failure`와 `MESSAGE lv_msg`에 해당하는 실패 원인 텍스트를 표시한다.

상태는 `Destination found`, `Remote-enabled checked`, `Communication failure`, `System failure`, `Business success`로 나눈다. 버튼 조작의 목표는 "RFC는 함수 이름만 맞으면 되는 것이 아니라 destination, 원격 가능 속성, 예외 처리, 메시지 로그가 모두 필요하다"를 눈으로 확인하는 것이다.

데이터는 `iv_concert = C2026-001` 한 건으로 시작한다. 정상 호출 결과는 `정훈영 / 2 seats / confirmed` 같은 예매 목록으로 둔다. 통신 실패 결과는 `Connection to TARGET_SYS timed out`, system failure 예시는 `Remote runtime error in Z_GET_BOOKINGS`처럼 운영자가 구분할 수 있는 메시지로 설계한다.

### 정리

RFC는 다른 시스템이 SAP 함수 모듈을 호출하거나 SAP가 다른 SAP 시스템의 함수를 호출할 때 쓰는 원격 호출 기술이다. 핵심 문법은 `CALL FUNCTION ... DESTINATION`이고, 연결은 SM59 destination으로 관리한다.

실무에서는 정상 호출보다 실패 분류가 중요하다. `communication_failure`, `system_failure`, `MESSAGE lv_msg`, 로그 기록, 권한 확인을 반드시 설계해야 한다. 다음 레슨에서는 표준 API나 RFC 함수가 없을 때 화면 입력을 자동화하는 BDC를 다룬다.

## CH30-L03 - BDC / Batch Input 실무 기준

### 왜 필요한가

모든 표준 업무에 좋은 BAPI가 있는 것은 아니다. 오래된 모듈이나 고객별 화면 흐름에서는 표준 트랜잭션은 있는데 외부 입력용 API가 부족한 경우가 있다. 이때 실무에서 레거시 대응 수단으로 만나는 것이 BDC(Batch Data Communication)다.

BDC는 사용자가 화면에 입력하는 과정을 프로그램이 대신 수행하게 만드는 방식이다. 화면 번호, 필드 이름, 입력값, OK_CODE를 `BDCDATA`에 순서대로 넣고 `CALL TRANSACTION ... USING`으로 트랜잭션을 실행한다. 쉽게 말하면 "화면을 보는 로봇"에 가깝다.

하지만 이 비유 때문에 바로 한계도 보인다. 화면 구성이 바뀌면 BDC는 깨진다. 필드 이름이 바뀌거나, 중간 팝업이 생기거나, 권한에 따라 화면 흐름이 달라져도 실패한다. 그래서 BDC는 BAPI가 없을 때 쓰는 보조 수단이지, 표준 API보다 우선할 수단이 아니다.

### 무엇인가

`BDCDATA`는 batch input table의 한 줄 구조다. 공식 문서 기준으로 `PROGRAM`, `DYNPRO`, `DYNBEGIN`, `FNAM`, `FVAL` 같은 구성 요소를 가진다. 새 화면 시작 줄에는 program과 dynpro 번호를 넣고, 필드 입력 줄에는 field name과 field value를 넣는다.

간단한 흐름은 다음과 같다.

```abap
DATA lt_bdc TYPE TABLE OF bdcdata.
DATA lt_msg TYPE TABLE OF bdcmsgcoll.

PERFORM fill_bdc USING 'X' 'SAPMXXXX' '0100'.
PERFORM fill_bdc USING ' ' 'FIELD-X'  '값'.
PERFORM fill_bdc USING ' ' 'BDC_OKCODE' '=SAVE'.

CALL TRANSACTION 'XX01' USING lt_bdc
  MODE 'N'
  UPDATE 'S'
  MESSAGES INTO lt_msg.
```

`MODE`는 화면 표시 방식을 정한다. `A`는 모든 화면 표시, `E`는 오류가 날 때만 화면 표시, `N`은 화면 없이 처리다. 공식 문서에는 `P`도 있지만 입문 실무에서는 보통 디버깅과 대량 처리 관점에서 `A`, `E`, `N`을 먼저 익힌다. `UPDATE 'S'`는 synchronous update로, update 처리가 끝날 때까지 기다리는 방식이다.

실무에서는 `MODE`와 `UPDATE`를 따로 쓰는 대신 `OPTIONS FROM opt`를 쓰기도 한다. 이때 `opt`는 `CTU_PARAMS` 타입 구조이며, `DISMODE`, `UPMODE`, `DEFSIZE`, `RACOMMIT` 같은 제어 값을 담는다. `MESSAGES INTO`는 처리 중 발생한 메시지를 `BDCMSGCOLL` 형태의 내부 테이블에 모아 준다.

### 어떻게 확인하는가

첫 번째 확인은 API 우선순위다. 같은 업무를 처리하는 BAPI나 공개 API가 있으면 BDC보다 그쪽을 우선 검토한다. BDC는 화면 변화에 취약하므로 장기 운영 관점에서 비용이 크다.

두 번째 확인은 화면 녹화다. SHDB(Transaction Recorder)로 실제 트랜잭션을 한 번 수행해 화면 번호, 필드 이름, OK_CODE 흐름을 기록한다. 녹화 결과를 그대로 믿지 말고, 필요 없는 화면 이동이나 사용자별 값이 들어갔는지 정리한다. 권한이나 customizing에 따라 화면이 달라질 수 있는지도 확인한다.

세 번째 확인은 실행 모드다. 개발 중에는 `MODE 'A'` 또는 `E`로 화면을 보며 흐름을 확인하고, 배치 처리에서는 `MODE 'N'`을 쓴다. 대량 데이터를 `A`로 돌리면 화면이 계속 떠서 처리 시간이 길어지고 운영 배치에 맞지 않는다.

네 번째 확인은 메시지와 재처리다. `CALL TRANSACTION`의 `sy-subrc`와 `MESSAGES INTO lt_msg`를 함께 본다. 성공 건과 실패 건을 분리하고, 실패 건은 입력 데이터와 메시지를 함께 저장해야 한다. Session 방식은 `BDC_OPEN_GROUP`, `BDC_INSERT`, `BDC_CLOSE_GROUP`으로 큐를 만들고 SM35에서 실행·재처리할 수 있다.

### 실수와 주의

첫 번째 실수는 BDC를 신규 개발의 기본 수단으로 쓰는 것이다. BDC는 레거시 대응 수단이다. BAPI나 released API, 명시적 인터페이스가 있으면 그쪽이 먼저다.

두 번째 실수는 화면 흐름이 항상 같다고 가정하는 것이다. 같은 트랜잭션도 사용자 권한, 회사코드, customizing, SAP GUI 설정, 메시지 팝업에 따라 흐름이 달라질 수 있다. 그래서 BDC는 테스트 케이스를 다양하게 잡아야 한다.

세 번째 실수는 메시지를 버리는 것이다. BDC는 화면 자동화라 실패 원인이 화면 메시지로 돌아오는 경우가 많다. `MESSAGES INTO`를 쓰지 않으면 실패한 이유를 잃는다. 메시지 ID, 번호, 변수 값을 저장해 나중에 사람이 해석할 수 있게 해야 한다.

네 번째 실수는 commit과 update timing을 이해하지 않고 대량 처리하는 것이다. `UPDATE 'S'`, `UPDATE 'A'`, `OPTIONS FROM`, `RACOMMIT` 같은 설정은 처리 완료 시점과 재처리 가능성에 영향을 준다. 특히 대량 처리에서는 실패 건만 따로 재처리할 수 있는 구조가 필요하다.

### 체험형 학습 설계

`CH30-L03-S01`은 "BDC 녹화 - BDCDATA 채우기" 시뮬레이터다. 화면에는 `다음 동작`, `CALL TRANSACTION`, `초기화` 버튼이 있다. 학습자가 `다음 동작`을 누를 때마다 `lt_bdc (TABLE OF bdcdata)` 테이블에 화면 시작 줄과 필드 입력 줄이 하나씩 쌓인다.

처음에는 `PROGRAM`, `DYNPRO`, `DYNBEGIN`이 있는 화면 시작 줄이 들어간다. 다음에는 `FIELD-X = 값`, 그다음에는 `BDC_OKCODE = =SAVE` 같은 입력 줄이 들어간다. 필요한 줄이 모두 들어가기 전에는 `CALL TRANSACTION` 버튼이 비활성화되어 있다가, 녹화가 끝나면 활성화된다.

실행하면 결과 패널에 `CALL TRANSACTION 'XX01' USING lt_bdc MODE 'N' UPDATE 'S'`와 처리 메시지가 표시된다. 성공 케이스는 `S: document created`, 실패 케이스는 `E: required field missing` 같은 메시지를 보여 준다. 이 메시지는 `BDCMSGCOLL`에 모아져 재처리 로그로 이어진다는 설명을 붙인다.

상태는 `Recording`, `Ready to execute`, `Executed`, `Message collected`, `Reset`으로 나눈다. 이 시뮬레이터의 목적은 BDC가 마법이 아니라 "화면과 필드 입력을 순서대로 담은 table을 실행하는 방식"임을 체감시키는 것이다.

### 정리

BDC는 BAPI가 없거나 레거시 트랜잭션을 자동 입력해야 할 때 쓰는 화면 기반 인터페이스 수단이다. `BDCDATA`에 화면과 필드 값을 채우고 `CALL TRANSACTION ... USING`으로 실행한다.

하지만 화면에 의존하므로 깨지기 쉽다. BAPI가 있으면 BAPI가 우선이고, BDC를 쓴다면 SHDB 녹화, `MODE`, `UPDATE`, `OPTIONS FROM`, `MESSAGES INTO`, SM35 재처리까지 함께 설계해야 한다. 다음 레슨에서는 외부 사용자가 준 Excel 또는 텍스트 파일을 읽어 내부 테이블로 만드는 흐름을 다룬다.

## CH30-L04 - Excel Upload 처리

### 왜 필요한가

현업 사용자는 대량 데이터를 엑셀로 주는 일이 많다. 신규 고객 목록, 예매 내역, 가격 조건, 재고 조정, 행사 참가자 명단 같은 데이터가 메일 첨부 파일로 오고, 개발자는 그것을 SAP에 넣어 달라는 요청을 받는다.

여기서 중요한 점은 "파일을 읽었다"가 끝이 아니라는 것이다. 외부 파일은 신뢰할 수 없다. 헤더가 있을 수 있고, 빈 줄이 있을 수 있고, 숫자 칸에 문자가 들어갈 수 있고, 날짜 형식이 다를 수 있고, 같은 키가 두 번 들어갈 수 있다. 따라서 Excel Upload의 핵심은 업로드보다 검증이다.

Classic ABAP에서 흔한 방식은 엑셀을 CSV 또는 탭 구분 텍스트로 저장한 뒤 PC 파일을 읽어 한 줄씩 parsing하는 것이다. 원본 레슨은 `cl_gui_frontend_services=>gui_upload`와 `SPLIT`을 사용한다. CH04에서 배운 문자열 처리와 CH06의 Internal Table이 실무 파일 처리로 연결되는 지점이다.

### 무엇인가

PC 파일 업로드는 사용자의 프론트엔드에 있는 파일을 ABAP 프로그램으로 가져오는 처리다. 원본 예시는 `cl_gui_frontend_services=>gui_upload`로 텍스트 파일을 읽고, `SPLIT`으로 한 줄을 컬럼으로 나눈다.

```abap
DATA lt_raw TYPE TABLE OF string.

cl_gui_frontend_services=>gui_upload(
  EXPORTING
    filename = lv_path
    filetype = 'ASC'
  CHANGING
    data_tab = lt_raw
  EXCEPTIONS
    OTHERS   = 1 ).

LOOP AT lt_raw INTO DATA(lv_line).
  SPLIT lv_line AT cl_abap_char_utilities=>horizontal_tab
    INTO DATA(lv_concert) DATA(lv_customer) DATA(lv_seats).

  " Validate required values, numeric seats, duplicate keys, and date format.
ENDLOOP.
```

`SPLIT` 공식 문서 기준으로 문자열은 구분자 기준으로 segment로 나뉘어 target field나 internal table에 들어간다. 고정 길이 target이 부족하면 오른쪽이 잘릴 수 있고 `sy-subrc = 4`가 될 수 있다. 그래서 파일 parsing에서는 target 길이, 컬럼 수, 빈 컬럼, trailing blank를 신경 써야 한다.

Excel을 직접 `.xls`로 읽는 오래된 함수인 `ALSM_EXCEL_TO_INTERNAL_TABLE`도 현장에서 볼 수 있다. 다만 이 장에서는 원본처럼 CSV 또는 탭 구분 텍스트로 변환해 읽는 흐름을 기본으로 삼는다. 이유는 단순하다. 텍스트 파일은 구조가 눈에 보이고, parsing과 검증을 입문자가 이해하기 쉽다.

### 어떻게 확인하는가

첫 번째 확인은 파일 형식이다. 실제 파일이 CSV인지, 탭 구분인지, 첫 줄이 header인지, 문자 인코딩이 무엇인지 확인한다. 구분자가 쉼표인데 탭으로 split하면 한 줄 전체가 첫 컬럼에 들어간다. 반대로 데이터 안에 쉼표가 포함될 수 있으면 CSV parsing 규칙이 더 복잡해진다.

두 번째 확인은 행 단위 검증이다. 헤더는 건너뛰고, 빈 줄은 제외하고, 필수값 누락을 찾고, 숫자 컬럼이 숫자인지 확인하고, 날짜 형식을 통일한다. 검증 실패 행은 버리지 말고 line number, 원본 row, 오류 메시지를 함께 보관한다.

세 번째 확인은 중복과 업무 검증이다. 파일 안에서 같은 key가 두 번 들어왔는지, 이미 SAP에 존재하는 데이터인지, 좌석 수가 허용 범위인지, 고객이 존재하는지 확인한다. 이 단계에서 BAPI나 조회 API가 필요할 수 있다.

네 번째 확인은 등록과 로그다. 검증 통과 행만 BAPI나 DML 단계로 넘긴다. 실패 행은 "업로드 실패"로 끝내지 말고 사용자에게 수정 가능한 오류 목록으로 돌려줘야 한다. 성공 행과 실패 행의 수, 파일명, 업로드 사용자, 처리 시각도 로그에 남긴다.

### 실수와 주의

첫 번째 실수는 헤더 행을 데이터로 등록하는 것이다. `CONCERT_ID`, `CUSTOMER`, `SEATS` 같은 컬럼명이 실제 데이터처럼 들어가면 숫자 변환 오류나 잘못된 key가 생긴다. 첫 줄이 header인지 반드시 정한다.

두 번째 실수는 업로드 직후 바로 등록하는 것이다. 외부 데이터는 항상 의심해야 한다. 필수값, 타입, 범위, 중복, 참조 데이터 존재 여부를 확인하지 않고 BAPI를 호출하면 Return 오류가 대량 발생하거나 일부만 성공하는 상태가 된다.

세 번째 실수는 파일 위치를 혼동하는 것이다. `gui_upload`는 사용자의 PC 파일을 읽는다. 서버 배치에서 자동으로 읽을 파일은 CH30-L05의 `OPEN DATASET` 대상이다. 대화형 업로드와 서버 파일 인터페이스를 구분하지 않으면 운영 배치 설계가 꼬인다.

네 번째 실수는 Excel 표시 형식을 실제 데이터라고 믿는 것이다. 사용자가 보는 날짜, 앞자리 0, 금액 소수점, 큰 숫자는 엑셀 표시 형식 때문에 실제 텍스트와 다를 수 있다. 업로드 전 저장 형식과 parsing 규칙을 정하고 샘플 파일을 고정해야 한다.

### 체험형 학습 설계

`CH30-L04-S01`은 "Excel 업로드 - 파싱·검증" 시뮬레이터다. 화면에는 원본 파일 미리보기와 `업로드(gui_upload + SPLIT)`, `초기화` 버튼이 있다. 원본 파일은 탭 구분 텍스트로 보이며 첫 줄은 header다.

학습자가 업로드 버튼을 누르면 시뮬레이터는 첫 줄을 header로 건너뛰고, 나머지 줄을 `SPLIT ... AT horizontal_tab`으로 나눈다. 정상 행은 내부 테이블 패널에 표시하고, 오류 행은 오류 패널에 분리한다. 예를 들어 `seats = ABC`인 행은 "좌석 수가 숫자가 아님"으로 표시한다.

상태는 `Raw file`, `Header skipped`, `Parsed rows`, `Valid rows`, `Rejected rows`로 나눈다. 피드백은 행 번호를 반드시 보여 준다. 운영자가 사용자의 파일을 다시 고치게 하려면 "몇 번째 줄이 왜 틀렸는지"가 필요하기 때문이다.

데이터는 공연 ID, 고객명, 좌석 수 세 컬럼으로 둔다. 정상 행에는 `C2026-001 / 정훈영 / 2`, 오류 행에는 `C2026-002 / 홍길동 / ABC` 같은 값을 넣는다. 마지막 결과는 "등록 대상 1건, 오류 1건"처럼 요약한다.

### 정리

Excel Upload는 파일을 읽는 기술이 아니라 외부 데이터를 SAP에 넣기 전 검증하는 관문이다. `gui_upload`로 PC 파일을 읽고, `SPLIT`으로 컬럼을 나누고, header, 필수값, 타입, 중복, 업무 규칙을 확인해야 한다.

이 레슨을 마치면 "파일을 읽었다"보다 "정상 행과 오류 행을 분리하고, 오류 행을 사용자가 고칠 수 있게 설명했다"가 완료 기준이 되어야 한다. 다음 레슨에서는 사용자 PC 파일이 아니라 서버 파일을 배치로 읽고 재처리하는 공통 구조를 다룬다.

## CH30-L05 - File Interface와 재처리

### 왜 필요한가

Excel Upload는 사용자가 화면에서 파일을 고르고 실행하는 대화형 처리다. 하지만 실무 인터페이스에는 사람이 매번 버튼을 누르지 않는 배치 흐름이 많다. 외부 시스템이 서버 폴더에 파일을 떨어뜨리고, SAP 배치 job이 새벽마다 그 파일을 읽어 등록하고, 실패 건을 로그에 남긴 뒤 재처리하는 구조가 대표적이다.

서버 파일 인터페이스의 핵심은 `OPEN DATASET`, `READ DATASET`, `TRANSFER`, `CLOSE DATASET` 같은 ABAP File Interface 문법이다. 그러나 이 레슨의 진짜 목표는 파일 문법 암기가 아니다. BAPI, RFC, BDC, Excel, File 모두에 공통으로 필요한 "수신 -> 검증 -> 등록 -> 로그 -> 재처리" 구조를 설계하는 것이다.

인터페이스는 실패를 전제로 설계해야 한다. 파일이 없을 수 있고, 권한이 없을 수 있고, 인코딩이 틀릴 수 있고, 중간 행만 오류일 수 있고, 같은 파일이 두 번 들어올 수 있다. 좋은 인터페이스는 실패하지 않는 인터페이스가 아니라 실패를 남기고 다시 처리할 수 있는 인터페이스다.

### 무엇인가

`OPEN DATASET`은 application server의 파일을 연다. 공식 문서 기준으로 `FOR INPUT`은 읽기, `FOR OUTPUT`은 새로 쓰기, `FOR APPENDING`은 이어쓰기다. 파일을 열 때는 `MESSAGE lv_msg`를 붙여 OS 오류 원인을 받아야 한다. 공식 문서도 파일을 열 수 없는 이유를 찾기 위해 `MESSAGE` addition을 항상 사용하라고 안내한다.

```abap
DATA lv_msg TYPE string.

OPEN DATASET lv_path FOR INPUT IN TEXT MODE ENCODING UTF-8
  MESSAGE lv_msg.

IF sy-subrc <> 0.
  MESSAGE lv_msg TYPE 'E'.
ENDIF.

DO.
  READ DATASET lv_path INTO DATA(lv_record).
  IF sy-subrc <> 0.
    EXIT.
  ENDIF.

  " Parse, validate, post, and log each record.
ENDDO.

CLOSE DATASET lv_path.
```

`READ DATASET`은 열린 파일에서 현재 위치의 데이터를 읽는다. text file에서 더 읽을 줄이 없으면 `sy-subrc = 4`가 될 수 있다. `TRANSFER`는 열린 파일에 데이터를 쓴다. 쓰려면 파일이 `FOR OUTPUT`, `FOR APPENDING`, `FOR UPDATE` 같은 쓰기 가능한 access type으로 열려 있어야 한다. `CLOSE DATASET`은 파일을 닫고, 운영체제 버퍼에 남은 데이터가 있으면 닫기 전에 기록한다.

서버 파일 인터페이스의 공통 구조는 다음과 같다. 파일을 수신하고, 행을 검증하고, BAPI나 DML로 등록하고, 결과를 로그에 남기고, 실패 건은 다시 처리할 수 있게 보관한다. 여기에 멱등성(idempotency), 즉 같은 파일이나 같은 메시지가 두 번 들어와도 중복 등록되지 않게 하는 설계가 붙는다.

### 어떻게 확인하는가

첫 번째 확인은 경로와 권한이다. `OPEN DATASET`은 사용자의 PC가 아니라 application server의 파일을 연다. 따라서 AL11 같은 서버 경로 확인, 배치 user의 파일 권한, 운영체제 경로, 파일명 규칙을 점검해야 한다. 외부에서 받은 파일명을 그대로 경로에 붙이면 directory traversal 위험이 있으므로 whitelist나 정규화가 필요하다.

두 번째 확인은 파일 열기 결과다. `OPEN DATASET ... MESSAGE lv_msg`를 사용하고 `sy-subrc`를 확인한다. `sy-subrc = 8`이면 운영체제가 파일을 열지 못한 것이다. 이때 `lv_msg`를 로그에 남겨야 권한 문제인지, 경로 문제인지, 파일 없음인지 추적할 수 있다.

세 번째 확인은 행 처리와 오류 분리다. 파일 전체를 하나의 성공/실패로만 보지 말고 record 단위로 상태를 남긴다. 어떤 행은 성공하고 어떤 행은 실패할 수 있다. 실패 행에는 원본 line number, 원본 text, parsing 결과, 오류 메시지, 재처리 가능 여부를 남긴다.

네 번째 확인은 재처리와 중복 방지다. 실패 건을 고친 뒤 다시 처리할 수 있어야 한다. 동시에 같은 파일이 두 번 들어오거나 같은 메시지 ID가 다시 들어와도 중복 등록을 막아야 한다. 파일명, business key, source system, message ID 같은 값을 조합해 멱등성 key를 설계한다.

### 실수와 주의

첫 번째 실수는 `CLOSE DATASET`을 가볍게 보는 것이다. 프로그램이 끝나면 열린 파일이 닫힐 수 있지만, 명시적으로 닫아야 자원 사용과 쓰기 버퍼 처리를 예측할 수 있다. 특히 여러 파일을 처리하는 배치에서는 파일 핸들을 오래 열어 두지 않아야 한다.

두 번째 실수는 파일 경로를 외부 입력 그대로 사용하는 것이다. 공식 문서도 외부에서 주입된 file name은 심각한 보안 위험이 될 수 있으며 directory traversal을 확인해야 한다고 경고한다. `../` 같은 상위 경로 이동, 허용되지 않은 디렉터리, 예상 밖 확장자를 막아야 한다.

세 번째 실수는 오류가 난 파일을 그냥 버리는 것이다. 인터페이스 실패는 반드시 다시 볼 수 있어야 한다. 실패 파일을 error 폴더로 옮기거나, 실패 row를 로그 테이블에 저장하거나, 재처리 queue를 만들어야 한다. 재처리가 없으면 일시 오류가 영구 누락이 된다.

네 번째 실수는 COMMIT 단위를 정하지 않는 것이다. 파일 전체를 한 번에 commit하면 중간 실패 때 전체 rollback이 될 수 있고, 행마다 commit하면 성능과 일관성이 흔들릴 수 있다. 업무 기준에 따라 파일 단위, 패키지 단위, 건 단위를 정하고 로그 구조를 그에 맞춰야 한다.

### 체험형 학습 설계

`CH30-L05-S01`은 "인터페이스 공통 흐름도"다. Mermaid 흐름으로 `① 수신(파일/메시지) -> ② 검증 통과? -> ③ 등록(BAPI/DML) -> ④ 인터페이스 로그 기록 -> ⑤ 재처리 잡`을 보여 준다. 검증 실패는 `오류 로그 + 실패분 보관`으로 빠지고, 원인 해결 후 재처리 job이 다시 수신 단계로 돌려보낸다.

이 위젯은 버튼형 실행보다 구조 이해가 중심이다. 본문에서는 여기에 추가로 구현할 상호작용을 구체화한다. `정상 파일`, `파일 없음`, `권한 오류`, `3번째 행 오류`, `중복 파일` 시나리오 버튼을 두고, 각 버튼이 흐름도의 어느 단계에서 멈추는지 색으로 표시한다.

상태는 `Received`, `Open failed`, `Validated`, `Posted`, `Logged`, `Queued for retry`, `Duplicate blocked`로 나눈다. 데이터는 파일 `booking_20260629_001.tsv`에 세 행이 들어오는 상황으로 둔다. 1행은 정상, 2행은 고객 없음, 3행은 좌석 수 오류로 설계하면 행 단위 로그와 재처리 필요성을 보여 주기 좋다.

피드백 패널은 성공 건 수, 실패 건 수, 재처리 대상 수, 중복 차단 수를 표시한다. 실패 건을 클릭하면 원본 행, 오류 메시지, 제안 조치를 보여 준다. 예를 들어 "2행: customer_id가 존재하지 않음 -> 고객 마스터 확인 후 재처리"처럼 운영자가 움직일 수 있는 문장으로 반환한다.

### 정리

서버 파일 인터페이스는 `OPEN DATASET`, `READ DATASET`, `TRANSFER`, `CLOSE DATASET`으로 application server 파일을 읽고 쓴다. 파일을 열 때는 `MESSAGE`와 `sy-subrc`로 원인을 확인하고, 외부 입력 경로는 directory traversal 위험 때문에 반드시 검증한다.

CH30 전체의 결론은 하나다. BAPI, RFC, BDC, Excel, File은 기술 이름은 다르지만 운영 구조는 같다. 수신하고, 검증하고, 등록하고, 메시지와 로그를 남기고, 실패 건을 재처리할 수 있어야 한다. 다음 장 CH31에서는 표준 메시지 기반 연계인 IDoc/ALE와 Gateway로 넘어가지만, 구현 세부는 다음 장에서 다룬다.
