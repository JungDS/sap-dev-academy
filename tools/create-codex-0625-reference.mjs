import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content', 'abap');
const OUT_DIR = path.join(ROOT, 'reference', 'codex_0625');
const ABAP_DOCU_DIR = 'C:/ABAP_DOCU_HTML';
let docFileSet = new Set();

const nowKst = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}).format(new Date()).replace(/\. /g, '-').replace('.', '').replace(' ', ' ');

const profiles = {
  CH01: {
    arc: '개발자가 SAP에 접속해 "작성-활성화-실행" 루프를 처음 몸에 익히는 장이다.',
    must: ['SAPGUI와 서버 구조를 그림으로 분리', 'SE38 루프를 버튼 흐름으로 체험', 'WRITE는 출력 장난이 아니라 결과 확인의 첫 도구로 설명', '$TMP와 패키지/이송요청의 차이를 운영 관점으로 연결'],
    lab: '가상 SAPGUI 명령창, SE38 생성 화면, 활성화 램프, F8 실행 버튼을 한 줄 워크플로로 보여준다.',
  },
  CH02: {
    arc: '값을 화면에만 찍던 단계에서, 값을 이름 붙여 보관하고 재사용하는 단계로 넘어간다.',
    must: ['DATA/TYPE/LIKE의 기준점을 메모리 칸 비유로 고정', 'Complete vs Incomplete 타입을 길이와 검증의 차이로 설명', '상수와 Text Symbol을 유지보수와 다국어 관점으로 연결', '암묵적 형변환은 편의가 아니라 위험으로 다룬다'],
    lab: '변수 카드에 값을 넣고 타입을 바꾸면 잘림/패딩/오류가 어떻게 달라지는지 비교한다.',
  },
  CH03: {
    arc: '로컬 타입을 벗어나 전역 의미를 가진 DDIC 타입으로 이동한다.',
    must: ['Domain-Data Element-Parameter의 계층을 한 장 그림으로 고정', '고정값/Value Table/Search Help의 경계를 절대 섞지 않음', 'SE11 저장-검사-활성화 실패 흐름까지 보여줌', 'F4는 마법이 아니라 Dictionary 메타데이터의 결과로 설명'],
    lab: 'Domain Builder 시뮬레이터로 타입/길이/고정값을 바꿔 검사 메시지를 확인한다.',
  },
  CH04: {
    arc: '값을 받아도 계산, 분기, 반복을 못 하던 불편을 해결하고 디버거를 얻는 장이다.',
    must: ['산술/문자열/조건/반복을 구구단 하나로 이어감', 'SY 필드는 암기가 아니라 실행 흔적으로 소개', 'IF와 CASE의 선택 기준을 상황으로 비교', '디버거 F5-F8을 변수 변화 관찰 도구로 체화'],
    lab: '구구단 계산 과정을 한 줄씩 실행하며 sy-index와 결과 값이 변하는 것을 타임라인으로 본다.',
  },
  CH05: {
    arc: '흩어진 값 여러 개를 하나의 의미 있는 행으로 묶는다.',
    must: ['Structure를 단순 문법이 아니라 업무 한 건의 모양으로 설명', 'Local Structure와 DDIC Structure의 책임 차이 명확화', '.INCLUDE/.APPEND는 확장 안정성 관점으로 다룸', '구구단 한 줄이 왜 다음 장의 Internal Table을 요구하는지 연결'],
    lab: '단수/배수/결과 세 값을 구조체 카드 하나로 묶고 디버거에서 컴포넌트를 펼쳐 본다.',
  },
  CH06: {
    arc: '한 행만 담던 Structure의 한계를 넘어 여러 행을 메모리에 다룬다.',
    must: ['Line Type, Table Kind, Key를 세 축으로 반복 설명', 'STANDARD/SORTED/HASHED 선택 기준을 검색/정렬/중복 허용으로 비교', 'READ/LOOP/MODIFY/DELETE는 sy-subrc와 sy-tabix까지 함께 설명', 'Header Line, REFRESH 같은 옛 문법은 인식용으로만 다룸'],
    lab: 'APPEND로 lt_gugu가 1행에서 81행으로 커지고 SORT/READ/DELETE 결과가 바뀌는 상태 그리드를 쓴다.',
  },
  CH07: {
    arc: '메모리에서 사라지던 데이터를 DB 테이블로 영속화한다.',
    must: ['Transparent Table과 Internal Table의 목적 차이를 반복', 'MANDT, Key, Data Element 사용 기준을 필수로 다룸', 'Technical Settings와 활성 후 변경 위험을 초보자 언어로 설명', 'Create Entries는 DML 전의 수동 입력 도구로만 한정'],
    lab: '메모리 표와 DB 표를 나란히 두고 프로그램 종료 후 무엇이 남는지 비교한다.',
  },
  CH08: {
    arc: 'DB에 저장한 데이터를 ABAP 프로그램으로 다시 읽어 온다.',
    must: ['SELECT 4요소: 어디서, 무엇을, 어떤 조건으로, 어디에 담는지', 'classic Open SQL만 사용하고 modern @ 문법은 금지', 'sy-subrc/sy-dbcnt를 결과 판정의 핵심으로 가르침', 'ENDSELECT, SELECT SINGLE, INTO TABLE의 비용 차이까지 맛보게 함'],
    lab: 'Projection/WHERE/대상 변수를 선택하면 결과 행수와 sy-subrc가 바뀌는 SELECT 시뮬레이터를 둔다.',
  },
  CH09: {
    arc: '테이블끼리 관계를 맺고 사용자가 값을 안전하게 고르게 한다.',
    must: ['Foreign Key, Check Table, Value Table을 오개념 방지 표로 분리', 'Text Table은 코드 옆 이름표로 설명', 'Search Help와 Input Help 우선순위를 계단식으로 보여줌', 'DDIC 검증과 프로그램 검증의 책임선을 명확히 함'],
    lab: 'F4를 눌렀을 때 POV, Search Help, Check Table, Fixed Value가 어떤 순서로 후보를 만드는지 사다리로 체험한다.',
  },
  CH10: {
    arc: '길어진 코드를 이름 붙인 처리 단위로 나누는 장이다.',
    must: ['FORM은 초보용 분리 도구, Function Module은 재사용 단위, Class는 설계 단위로 구분', 'USING/CHANGING의 데이터 이동 방향을 그림으로 설명', 'classic 구간이므로 NEW/inline DATA 금지', '잔여석 계산 같은 업무 규칙을 모듈화 예제로 통일'],
    lab: '입력값이 FORM으로 들어가고 CHANGING 값이 되돌아오는 호출 스택을 단계별로 보여준다.',
  },
  CH11: {
    arc: 'WRITE 리스트의 한계를 느끼고 ALV 표 출력의 가치를 체감한다.',
    must: ['Internal Table이 이미 있어야 SALV가 의미 있음을 강조', 'factory-display 두 단계와 cx_salv_msg 처리 흐름을 분리', 'SALV와 Grid ALV의 경계를 선명하게 둠', '예매 목록을 정렬/합계/필터로 확인하는 업무 화면으로 연결'],
    lab: 'lt_booking을 SALV에 넘기면 컬럼, 정렬, 합계 버튼이 생기는 화면 변화를 시뮬레이션한다.',
  },
  CH12: {
    arc: '단일 입력값의 한계를 넘어 여러 조건을 Range Table로 표현한다.',
    must: ['SELECT-OPTIONS가 자동 화면 + Range Table이라는 두 얼굴을 가진다고 설명', 'SIGN/OPTION/LOW/HIGH를 한 행씩 해석', 'WHERE IN과 Range Table의 연결을 시각화', 'Include/Exclude가 섞였을 때 결과가 어떻게 바뀌는지 체험'],
    lab: '조건칩을 추가/제외하면 예매 데이터가 필터링되고 Range 행이 동시에 생성되는 필터 시뮬레이터를 둔다.',
  },
  CH13: {
    arc: '여러 테이블을 같이 읽고 DB 쪽에서 요약하게 만든다.',
    must: ['JOIN 조건 누락이 왜 행 뻥튀기를 만드는지 실제 행으로 보여줌', 'INNER/LEFT OUTER의 차이를 없는 예매 데이터로 설명', 'GROUP BY/HAVING/ORDER BY를 단계별 SQL 처리 순서로 정리', 'FOR ALL ENTRIES는 빈 테이블 함정과 성능 기준을 반드시 포함'],
    lab: '공연-회차-예매 테이블을 토글하며 LEFT/INNER, GROUP BY, SUM 결과를 비교한다.',
  },
  CH14: {
    arc: '반복되는 JOIN과 유지보수 화면을 DDIC 객체로 끌어올린다.',
    must: ['Classic View와 CDS의 세대 차이를 예고 수준으로만 다룸', 'Database/Projection/Help/Maintenance View의 목적을 분리', 'TMG/SM30은 다건 유지보수 도구로 CH07 Create Entries와 비교', 'SE16N은 조회 도구이며 유지보수 가치를 해치지 않는 위치에서 소개'],
    lab: '같은 공연 데이터를 JOIN 코드, Database View, SM30 유지보수 화면으로 각각 처리하는 비교 흐름을 제시한다.',
  },
  CH15: {
    arc: '리포트가 실행될 때 Selection Screen과 Event가 어떤 순서로 움직이는지 배운다.',
    must: ['INITIALIZATION/PBO/PAI/START/END 흐름을 타임라인으로 고정', 'MESSAGE 타입과 메시지 클래스는 여기서 정식 도입', 'Selection Screen UI 옵션은 화면 요소와 변수 연결로 설명', 'Variant와 다중 화면은 배치/운영으로 이어지는 다리로 둔다'],
    lab: '입력값 변경, 검증 에러, 조회 실행이 이벤트 타임라인에서 어느 지점에 걸리는지 클릭해 본다.',
  },
  CH16: {
    arc: '리포트 자동 화면을 벗어나 직접 설계한 SAP GUI 화면을 만든다.',
    must: ['Module Pool, Screen Number, PBO/PAI를 두 박자 리듬으로 설명', 'OK_CODE와 BACK/EXIT/CANCEL 차이를 반드시 구분', 'Screen Painter 요소와 ABAP 변수 바인딩을 나란히 보여줌', 'Table Control은 제외하고 ALV로 대체한다는 실무 판단 명시'],
    lab: '화면 요소를 누르면 OK_CODE가 바뀌고 PAI 모듈이 실행되는 흐름을 시뮬레이터로 보여준다.',
  },
  CH17: {
    arc: 'Dynpro 컨테이너 위에 Grid ALV를 얹어 더 강한 표 UI를 만든다.',
    must: ['Custom Container, Grid 객체, Field Catalog, Layout을 조립 순서로 설명', 'SALV보다 많은 제어가 가능하지만 복잡도가 오른다는 tradeoff 설명', 'Refresh와 Stable Refresh는 화면 상태 보존 문제로 연결', '행색은 여기, 셀색/스타일은 CH21로 게이팅'],
    lab: 'container-grid-fcat-set_table_for_first_display 조립 단계를 버튼으로 켜며 표가 완성되는 과정을 보여준다.',
  },
  CH18: {
    arc: 'classic 문법을 이해한 뒤 modern syntax로 같은 의도를 더 짧게 쓴다.',
    must: ['Modern은 대체가 아니라 리팩터링 도구라는 태도 유지', 'inline DATA, VALUE, CORRESPONDING, Table Expression, String Template을 전후 비교', 'NEW 객체 생성은 OO 본격 범위와 충돌하지 않게 통제', '가독성과 릴리스 호환성 기준을 함께 다룸'],
    lab: 'classic 코드와 modern 코드를 줄 단위로 연결해 어떤 의도가 줄었는지 hover로 비교한다.',
  },
  CH19: {
    arc: 'Open SQL도 modern 문법으로 넘어가며 host variable과 SQL expression을 배운다.',
    must: ['@ host variable, comma list, @DATA target을 classic과 대비', 'SQL expression은 DB에서 계산한다는 위치 감각을 준다', 'SELECT FROM @itab은 ABAP 메모리와 SQL 사고의 접점으로 설명', 'CH13 classic JOIN 지식을 기반으로 modern SQL을 정리'],
    lab: 'classic SELECT를 modern SELECT로 변환하며 @, comma, expression이 왜 필요한지 단계별 diff로 보여준다.',
  },
  CH20: {
    arc: '절차를 넘어 책임을 가진 객체로 설계하기 시작한다.',
    must: ['Class/Object/Reference를 설계도-실물-리모컨 비유로 분리', 'Visibility, Constructor, Static/Instance를 업무 책임으로 설명', 'Exception과 OO Event는 RAP/ALV 이벤트의 기반으로 연결', 'CAST와 polymorphism은 쓰임새가 보일 때만 확장'],
    lab: 'ZCL_BOOKING_MANAGER 클래스 다이어그램에서 public method와 private attribute가 어떻게 협력하는지 보여준다.',
  },
  CH21: {
    arc: 'ALV 표시 제어를 실무 수준으로 다듬는다.',
    must: ['Sort/Filter/Layout/Variant를 사용자 경험 관점으로 설명', 'Cell Color/Style은 deep structure가 필요한 이유를 반드시 시각화', 'Stable Refresh는 사용자가 보던 위치를 잃지 않는 문제로 설명', '본격 ALV Event는 CH27로 미룬다'],
    lab: '매진 회차 행/셀 강조, 상태 보존 refresh, layout variant 저장 흐름을 미니 그리드로 체험한다.',
  },
  CH22: {
    arc: 'Classic View를 넘어 의미 기반 CDS View Entity를 만든다.',
    must: ['ZI_ Interface View와 ZC_ Projection View의 역할을 분리', 'Association은 JOIN을 숨긴 마법이 아니라 관계 탐색 모델로 설명', 'Annotation과 Metadata Extension은 UI/서비스 의미 부여로 연결', 'DCL은 보안 장식이 아니라 데이터 노출 범위 제어'],
    lab: '공연-회차-예매 association 관계도를 펼치고 projection으로 외부 노출 필드를 줄이는 흐름을 보여준다.',
  },
  CH23: {
    arc: 'CDS와 OO 위에 RAP 비즈니스 객체와 서비스를 세운다.',
    must: ['RAP 아키텍처를 Entity-Behavior-Service 세 층으로 고정', 'BDEF/BIMP/Service Definition/Binding을 파일 역할로 구분', 'Validation/Determination/Action은 성공/오류 케이스로 나눠 체험', 'ABAP Cloud와 Clean Core는 원칙만 소개하고 실무 세부는 뒤로 연결'],
    lab: '예매 생성 action을 누르면 validation, determination, save 흐름이 어떤 순서로 실행되는지 상태도로 보여준다.',
  },
  CH24: {
    arc: '읽기 전용 세계를 넘어 DB 변경과 트랜잭션 책임을 배운다.',
    must: ['INSERT/UPDATE/MODIFY/DELETE의 의도 차이를 실패 케이스와 함께 설명', 'COMMIT/ROLLBACK을 버튼 하나가 아니라 LUW 경계로 체득', '표준 테이블 직접 변경 금지와 BAPI/API 기준을 명시', '오류 로그/재처리/패키지 처리까지 운영 기준 포함'],
    lab: '성공, 중간 실패, rollback, 재처리 큐를 타임라인으로 조작하는 DML 플레이그라운드를 둔다.',
  },
  CH25: {
    arc: '두 사용자가 같은 데이터를 동시에 바꿀 때 생기는 충돌을 제어한다.',
    must: ['Lost Update를 먼저 체험하고 Lock Object 필요성을 도입', 'ENQUEUE/DEQUEUE와 lock mode를 행 잠금 시나리오로 설명', 'COMMIT/ROLLBACK과 lock 해제의 연결을 명확히 함', '잠금 실패 예외 처리는 사용자 메시지와 재시도 UX까지 포함'],
    lab: '두 세션 카드가 같은 예매를 수정하려 할 때 누가 잠금을 얻고 누가 대기/실패하는지 보여준다.',
  },
  CH26: {
    arc: 'OO를 문법이 아니라 유지보수 가능한 설계 패턴으로 다룬다.',
    must: ['Factory/Singleton/Strategy는 남용 금지 기준까지 설명', 'MVC는 리포트 구조 분리의 실제 설계안으로 제시', 'ABAP Unit은 테스트 가능한 설계의 결과로 연결', '패턴 이름 암기가 아니라 변경 요구 대응 능력으로 평가'],
    lab: '결제/할인 전략을 바꿔도 호출부가 변하지 않는 Strategy 시뮬레이터를 둔다.',
  },
  CH27: {
    arc: 'Grid ALV 사용자의 행동을 이벤트로 받아 처리한다.',
    must: ['Double Click, Hotspot, Toolbar, USER_COMMAND의 발생 지점 분리', 'Event Handler Class의 SET HANDLER 연결을 시각화', '데이터 변경이 아닌 UI 반응과 업무 이동을 중심으로 설명', 'Editable Grid 변경 이벤트는 CH28로 넘긴다'],
    lab: 'ALV 셀을 클릭하면 이벤트 객체와 handler method가 어떤 값을 받는지 배선도로 보여준다.',
  },
  CH28: {
    arc: '사용자가 그리드에서 직접 입력한 값을 검증하고 DB 반영 전 통제한다.',
    must: ['Editable Field Catalog와 Cell Style의 책임 분리', 'DATA_CHANGED/DATA_CHANGED_FINISHED 차이 명확화', '오류 표시와 변경 로그를 사용자 경험으로 설명', 'DB 반영은 CH24 트랜잭션 기준을 재사용'],
    lab: '그리드 셀을 편집하면 변경 프로토콜에 에러/경고가 쌓이고 저장 버튼 전 검증이 일어나는 흐름을 체험한다.',
  },
  CH29: {
    arc: '표준을 고치지 않고 고객 요구를 꽂아 넣는 확장 지점을 배운다.',
    must: ['User Exit/Customer Exit/BAdI/Enhancement의 세대와 책임 구분', 'Clean Core 관점에서 수정과 확장의 위험 비교', 'SPRO/SE18/SE19 같은 탐색 루트를 실무적으로 안내', '업그레이드 안정성을 의사결정 체크리스트에 포함'],
    lab: '표준 코드 슬롯에 고객 로직을 꽂는 before/after 구조와 금지해야 할 직접 수정 사례를 비교한다.',
  },
  CH30: {
    arc: '외부/내부 시스템과 데이터를 주고받는 인터페이스 기술을 다룬다.',
    must: ['BAPI/RFC/BDC/File/Excel의 목적과 실패 복구 기준을 분리', 'BAPIRET2 메시지 처리를 성공보다 중요하게 다룸', 'RFC destination과 권한/네트워크 실패를 운영 관점으로 설명', 'BDC는 레거시 대응 수단이며 남용 금지'],
    lab: '호출 요청, 반환 메시지, 재처리 큐를 연결한 인터페이스 플로우를 보여준다.',
  },
  CH31: {
    arc: 'IDoc과 Gateway/OData로 엔터프라이즈 메시지와 서비스 노출을 연결한다.',
    must: ['IDoc control/data/status record를 구조로 설명', 'WE02/WE19/BD87 같은 모니터링 흐름을 운영 실습으로 포함', 'Gateway/OData는 HTTP 리소스와 ABAP 백엔드의 연결로 설명', 'RAP OData와 classic Gateway의 위치 차이를 정리'],
    lab: 'IDoc 상태가 03, 51, 53으로 변하는 과정과 재처리 버튼을 상태 머신으로 보여준다.',
  },
  CH32: {
    arc: '느린 프로그램을 감으로 고치지 않고 측정하고 원인을 좁힌다.',
    must: ['ST05/SAT/SQLM/ATC를 언제 쓰는지 역할 분리', 'SELECT in LOOP, 불필요한 SELECT *, 키 없는 검색을 실제 비용으로 보여줌', 'Internal Table 종류 선택과 DB pushdown 기준을 연결', '최적화 전후 수치를 남기는 습관을 강조'],
    lab: 'trace 결과에서 비싼 SELECT를 찾고 JOIN/FAE/itab 처리로 바꾼 뒤 비용이 줄어드는 그래프를 둔다.',
  },
  CH33: {
    arc: 'DB 가까이 내려가는 AMDP/ADBC를 다루되 남용하지 않는 기준을 배운다.',
    must: ['Open SQL로 충분한 경우와 Native/AMDP가 필요한 경우 구분', 'SQLScript는 ABAP 문법이 아니라 DB 실행 영역임을 강조', '권한, DB 종속성, 테스트 난이도를 반드시 언급', '성능 장점과 유지보수 비용을 균형 있게 설명'],
    lab: 'ABAP loop 처리와 DB pushdown 처리의 데이터 이동량 차이를 파이프라인으로 비교한다.',
  },
  CH34: {
    arc: 'Forms와 출력 관리를 통해 업무 문서를 생성하고 추적한다.',
    must: ['Smart Forms/Adobe Forms/Output Management의 세대와 목적 구분', '데이터 추출-양식 매핑-스풀/프린트 흐름을 단계화', '한글/폰트/바코드/이메일 전송 같은 실무 함정을 포함', '양식 로직과 비즈니스 로직 분리 원칙 강조'],
    lab: '예매 확인서 데이터를 양식 필드에 매핑하고 preview/spool/email로 나뉘는 출력을 보여준다.',
  },
  CH35: {
    arc: '운영 품질을 지키는 테스트, 로그, 배치, 이송, 점검 기준을 익힌다.',
    must: ['ABAP Unit, ATC, Application Log, Background Job을 운영 사슬로 연결', '실패를 숨기지 않고 추적 가능한 메시지로 남기는 법 설명', '이송 전 점검과 품질 게이트를 체크리스트화', '개발 완료와 운영 가능의 차이를 분명히 함'],
    lab: '테스트 실패, ATC finding, SLG1 로그, 배치 잡 결과를 하나의 운영 대시보드로 묶는다.',
  },
  CH36: {
    arc: '그동안 배운 것을 RAP + Fiori Capstone으로 통합하고 졸업 기준을 만든다.',
    must: ['요구사항-모델-CDS-RAP-Service-Fiori-운영을 한 줄로 연결', '각 산출물 ZI_/ZC_/BDEF/BIMP가 어떤 책임을 갖는지 반복', '권한, Draft, validation/action을 성공/실패 시나리오로 검증', '완주 감성은 유지하되 실제 인수 기준을 엄격하게 둔다'],
    lab: 'Capstone 보드를 두고 완료된 객체, 실패 케이스, 권한/Draft/ATC 상태를 체크하는 졸업 점검 시뮬레이터를 둔다.',
  },
};

const docRules = [
  { re: /\bWRITE\b|출력|ULINE|SKIP|\bFORMAT\b|\bCOLOR\b/i, docs: ['abapwrite-.htm', 'abapwrite_to.htm', 'abenwrite_formats.htm'] },
  { re: /\bDATA\b|변수|\bTYPE\b|\bLIKE\b|\bTYPES\b|\bCONSTANTS?\b|상수|Text Symbol/i, docs: ['abapdata.htm', 'abapdata_simple.htm', 'abapdata_referring.htm', 'abaptypes.htm'] },
  { re: /\bPARAMETERS\b|Selection Screen|SELECT-OPTIONS|화면|Variant|MODIF|RADIO|CHECKBOX/i, docs: ['abapparameters.htm', 'abapselect-options.htm', 'abapselection-screen_definition.htm', 'abapat_selection-screen_events.htm'] },
  { re: /\bIF\b|\bCASE\b|\bDO\b|\bWHILE\b|\bLOOP\b|\bCHECK\b|\bCONTINUE\b|\bEXIT\b|조건|반복/i, docs: ['abapif.htm', 'abapcase.htm', 'abapdo.htm', 'abapwhile.htm', 'abaploop_at_itab.htm'] },
  { re: /Internal Table|APPEND|READ TABLE|SORT|COLLECT|DELETE ADJACENT|sy-tabix/i, docs: ['abenitab.htm', 'abapappend.htm', 'abapread_table.htm', 'abaploop_at_itab.htm', 'abapcollect.htm'] },
  { re: /\bSELECT\b|Open SQL|\bJOIN\b|GROUP BY|HAVING|ORDER BY|FOR ALL ENTRIES|\bWHERE\b/i, docs: ['abapselect.htm', 'abapselect_join.htm', 'abapselect_aggregate.htm', 'abapselect_for_all_entries.htm', 'abapwhere_logexp.htm'] },
  { re: /CDS|View Entity|Interface View|Projection View|Annotation|Metadata|DCL|Association|ZI_|ZC_/i, docs: ['abenddic_cds_views.htm', 'abenddicddl_define_view.htm', 'abenddicddl_association.htm', 'abenddicddl_annotations.htm'] },
  { re: /RAP|Behavior|BDEF|BIMP|Draft|Service Binding|\bAction\b|Determination|Validation/i, docs: ['abapmethods_for_rap_behv.htm', 'abenrap_glosry.htm', 'abenrap_bo_glosry.htm'] },
  { re: /MESSAGE|SE91|sy-subrc|오류|예외|\bTRY\b|\bCATCH\b|\bRAISE\b/i, docs: ['abapmessage.htm', 'abapmessage_msg.htm', 'abaptry.htm', 'abapcatch.htm', 'abapraise_exception.htm'] },
  { re: /\bCLASS\b|\bClass\b|\bMETHOD\b|\bMethod\b|OO ABAP|Local Class|Global Class|Interface 기본|Constructor|Inheritance|EVENTS|SET HANDLER|CAST/i, docs: ['abapclass.htm', 'abapmethods.htm', 'abapcall_method_static.htm', 'abapinterface.htm', 'abapevents.htm'] },
  { re: /\bCOMMIT\b|\bROLLBACK\b|\bINSERT\b|\bUPDATE\b|\bMODIFY\b|\bDELETE\b|LUW|DML/i, docs: ['abapcommit.htm', 'abaprollback.htm', 'abapinsert_dbtab.htm', 'abapupdate.htm', 'abapdelete_dbtab.htm'] },
  { re: /ENQUEUE|DEQUEUE|Lock/i, docs: ['abenenqueue_glosry.htm', 'abapcall_function.htm'] },
  { re: /AUTHORITY|DCL|권한/i, docs: ['abapauthority-check.htm', 'abenddicddl_dcl.htm'] },
];

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

function safeName(name) {
  return String(name ?? '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[·,()]/g, '')
    .slice(0, 60);
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function readMarkdown(file) {
  const raw = await fs.readFile(file, 'utf8');
  const parsed = parseFrontMatter(raw);
  return {
    file,
    rel: rel(file),
    raw,
    data: parsed.data,
    body: parsed.content.trim(),
  };
}

function parseFrontMatter(raw) {
  if (!raw.startsWith('---')) return { data: {}, content: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { data: {}, content: raw };
  const yaml = raw.slice(3, end).trim();
  const content = raw.slice(end + 4).replace(/^\r?\n/, '');
  return { data: parseSimpleYaml(yaml), content };
}

function parseSimpleYaml(yaml) {
  const data = {};
  const lines = yaml.split(/\r?\n/);
  let currentKey = null;
  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, '  ');
    if (!line.trim()) continue;
    const listMatch = line.match(/^\s{2,}-\s+(.*)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(parseScalar(listMatch[1]));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, value] = kv;
    currentKey = key;
    data[key] = value === '' ? [] : parseScalar(value);
  }
  return data;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return splitInlineArray(inner).map(parseScalar);
  }
  if (/^-?\d+$/.test(trimmed)) return Number(trimmed);
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  return trimmed;
}

function splitInlineArray(value) {
  const items = [];
  let token = '';
  let quote = null;
  for (const ch of value) {
    if ((ch === '"' || ch === "'") && quote === null) {
      quote = ch;
      token += ch;
      continue;
    }
    if (ch === quote) {
      quote = null;
      token += ch;
      continue;
    }
    if (ch === ',' && quote === null) {
      items.push(token.trim());
      token = '';
      continue;
    }
    token += ch;
  }
  if (token.trim()) items.push(token.trim());
  return items;
}

function statsFor(body) {
  const code = (body.match(/```[a-zA-Z0-9_-]*\n/g) ?? []).length;
  const embeds = (body.match(/::embed\b/g) ?? []).length;
  const sections = (body.match(/^##\s+/gm) ?? []).length;
  const tables = (body.match(/^\|.+\|$/gm) ?? []).length > 1 ? 1 : 0;
  const terms = (body.match(/\[\[[^\]]+\]\]/g) ?? []).length;
  const chars = body.replace(/\s+/g, '').length;
  return { chars, code, embeds, sections, tables, terms };
}

function flagStats(s) {
  const flags = [];
  if (s.code > 0 && s.embeds === 0) flags.push('R2-체험누락');
  if (s.chars < 900) flags.push('본문빈약');
  else if (s.chars < 1200) flags.push('본문주의');
  if (s.sections <= 3) flags.push('흐름압축');
  if (s.code === 0 && s.embeds === 0 && s.tables === 0) flags.push('시각/체험없음');
  return flags;
}

function docHints(lesson, chapter) {
  const hay = `${chapter.data.title ?? ''} ${lesson.data.title ?? ''} ${lesson.data.direction ?? ''} ${(lesson.data.keywords ?? []).join(' ')} ${(lesson.data.introduces ?? []).join(' ')}`;
  const docs = [];
  for (const rule of docRules) {
    if (rule.re.test(hay)) docs.push(...rule.docs);
  }
  return [...new Set(docs)].filter((doc) => docFileSet.size === 0 || docFileSet.has(doc)).slice(0, 6);
}

function lessonTeachingMove(lesson, chapterProfile) {
  const hay = `${lesson.data.title ?? ''} ${lesson.data.direction ?? ''} ${(lesson.data.keywords ?? []).join(' ')} ${(lesson.data.introduces ?? []).join(' ')}`;
  const rules = [
    [/SAPGUI|SE38|T-code|SE93/i, '화면 이름을 외우게 하지 말고, 명령창 입력 -> 객체 생성 -> 저장 -> 활성화 -> 실행의 손동작으로 기억시킨다.'],
    [/\bWRITE\b|FORMAT|ULINE|SKIP/i, '출력문은 문법 암기가 아니라 "프로그램이 살아 있음을 확인하는 가장 작은 피드백"으로 다룬다. 출력 결과를 먼저 보여주고 코드를 거꾸로 해석한다.'],
    [/\bSELECT\b|Open SQL|\bJOIN\b|GROUP BY|HAVING|ORDER BY|FOR ALL ENTRIES|\bWHERE\b|\bINTO\b|CORRESPONDING FIELDS|APPENDING|\bLIKE\b|BETWEEN|IS NULL/i, 'SQL은 문장 순서보다 데이터가 줄고 합쳐지는 흐름으로 가르친다. 결과 행수, sy-subrc, sy-dbcnt를 매번 확인한다.'],
    [/\bDATA\b|\bTYPE\b|\bLIKE\b|\bTYPES\b|\bCONSTANTS?\b|Text Symbol|변수/i, '값, 타입, 이름, 재사용 범위를 각각 다른 색 카드로 분리한다. 초보자가 "변수명=값"과 "타입=규칙"을 섞지 않게 한다.'],
    [/Domain|Data Element|DDIC|PARAMETERS|F4|Search Help|Foreign Key|Text Table/i, 'Dictionary 객체는 계층도를 먼저 보여준 뒤 한 객체씩 클릭해 의미가 어디서 화면으로 흘러가는지 추적한다.'],
    [/산술|문자열|IF|CASE|DO|WHILE|디버그|sy-index|boolean/i, '실행 전 예측 -> 한 줄 실행 -> 변수 변화 확인 -> 왜 그렇게 됐는지 설명하는 디버거 루프를 고정한다.'],
    [/Structure|BEGIN OF|\.INCLUDE|\.APPEND/i, '한 업무 행의 모양을 먼저 그린 뒤, 각 컴포넌트가 어떤 타입과 의미를 갖는지 펼쳐 보인다.'],
    [/Internal Table|APPEND|READ|LOOP|SORT|COLLECT|BINARY SEARCH/i, '행이 늘고 줄고 정렬되는 상태 변화를 눈으로 보여준다. 문법보다 "몇 행이 있고 어떤 키로 찾는가"를 먼저 묻는다.'],
    [/Transparent Table|SE11|MANDT|Technical Settings/i, '메모리 표와 DB 표를 나란히 놓고, 프로그램 종료 후에도 남는지와 키/클라이언트가 왜 필요한지 설명한다.'],
    [/FORM|FUNCTION|USING|CHANGING|CALL FUNCTION|모듈/i, '긴 코드를 함수 상자로 접어 넣는 느낌을 준다. 입력, 출력, 바뀌는 값, 사라지는 지역 변수를 화살표로 분리한다.'],
    [/SALV|ALV|Grid|Field Catalog|Layout|Variant|Refresh/i, 'Internal Table이 화면 표로 변환되는 순간을 보여준다. 표시 편의, 사용자 조작, 개발 복잡도 사이의 균형을 설명한다.'],
    [/Selection Screen|INITIALIZATION|AT SELECTION|MESSAGE|AUTHORITY/i, '사용자가 실행 버튼을 누르기 전과 후에 어느 이벤트가 끼어드는지 시간표로 가르친다. 메시지는 사용자와 프로그램의 계약으로 다룬다.'],
    [/Dynpro|PBO|PAI|OK_CODE|PF-STATUS|Screen Painter/i, '화면 출력(PBO)과 사용자 입력 처리(PAI)를 두 박자 리듬으로 반복시켜 암기 없이 흐름을 잡게 한다.'],
    [/Inline|VALUE|CORRESPONDING|Table Expression|String Template|Modern/i, '같은 classic 코드를 먼저 읽게 한 뒤 modern 코드가 줄인 중복만 표시한다. "새 문법이 더 낫다"가 아니라 "의도가 더 선명하다"로 설명한다.'],
    [/CDS|View Entity|Interface View|Projection View|Association|Annotation|Metadata|DCL|ZI_|ZC_/i, '데이터 조회 코드가 의미 있는 데이터 모델로 올라가는 과정이다. Interface View와 Projection View의 관객이 다르다는 점을 반복한다.'],
    [/RAP|Behavior|Service|Draft|Validation|Determination|Action/i, 'RAP는 파일 이름 암기가 아니라 비즈니스 객체의 생명주기다. 생성, 검증, 자동계산, 저장, 서비스 노출을 한 타임라인에 둔다.'],
    [/\bClass\b|\bObject\b|\bMethod\b|Interface 기본|Constructor|Inheritance|Exception|EVENTS|OO/i, '객체는 문법 묶음이 아니라 책임 묶음이다. 속성은 상태, 메서드는 행동, visibility는 약속으로 풀어 설명한다.'],
    [/INSERT|UPDATE|MODIFY|DELETE|COMMIT|ROLLBACK|LUW|DML/i, '성공 코드보다 실패했을 때 어디까지 되돌릴 수 있는지를 먼저 묻는다. 트랜잭션 경계를 색으로 표시한다.'],
    [/Lock|ENQUEUE|DEQUEUE|동시성/i, '두 사용자가 같은 데이터를 잡아당기는 장면부터 시작한다. 잠금은 기술이 아니라 약속된 순서 만들기다.'],
    [/BAPI|RFC|BDC|IDoc|Gateway|OData|Interface|Excel|File/i, '인터페이스는 "보냈다"가 끝이 아니다. 요청, 응답, 상태, 재처리, 로그를 한 묶음으로 설계하게 한다.'],
    [/Performance|ST05|SAT|ATC|AMDP|ADBC|SQLScript/i, '성능은 느낌이 아니라 측정이다. 실행 전 추정, Trace 결과, 수정 후 수치를 나란히 남기게 한다.'],
    [/Forms|Output|Smart Forms|Adobe|Spool/i, '양식은 화면이 아니라 업무 문서다. 데이터 추출, 레이아웃, 출력 채널, 재발행 기준을 분리한다.'],
    [/Application Log|ABAP Unit|Background Job|Transport|운영/i, '운영 가능하다는 것은 실패를 추적하고 다시 실행할 수 있다는 뜻이다. 개발 완료와 운영 준비를 체크리스트로 나눈다.'],
  ];
  const hit = rules.find(([re]) => re.test(hay));
  return hit ? hit[1] : `${chapterProfile.arc} 이 레슨은 그 큰 흐름 안에서 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수하면 어떻게 보이는가" 순서로 다시 풀어야 한다.`;
}

function visualPlan(lesson, stats, availableEmbeds) {
  const id = lesson.data.id;
  const hay = `${lesson.data.title ?? ''} ${(lesson.data.keywords ?? []).join(' ')} ${(lesson.data.introduces ?? []).join(' ')}`;
  if (availableEmbeds.has(`${id}-S01`)) {
    return `기존 위젯 \`${id}-S01\`을 중심에 둔다. 본문은 위젯 앞에서 조작 목표를 3단계로 제시하고, 위젯 뒤에서 결과 해석과 흔한 실수를 회수한다.`;
  }
  if (stats.code > 0) {
    if (/SELECT|JOIN|WHERE|SQL/i.test(hay)) return '필요 학습수단: SELECT/JOIN 시뮬레이터. 필드 선택, 조건, 조인 방식, 결과 행수, sy-subrc를 버튼으로 바꾸게 한다.';
    if (/DATA|TYPE|Structure|Internal Table|APPEND|READ|LOOP/i.test(hay)) return '필요 학습수단: 메모리 상태 그리드. 변수/구조체/내부 테이블의 값이 실행 단계마다 어떻게 바뀌는지 스냅샷으로 보여준다.';
    if (/MESSAGE|Selection Screen|PBO|PAI|Dynpro/i.test(hay)) return '필요 학습수단: 이벤트 타임라인. 실행 버튼, 검증 오류, PBO/PAI, MESSAGE 표시 위치를 클릭식으로 추적한다.';
    if (/Class|Method|RAP|CDS|Service|Behavior/i.test(hay)) return '필요 학습수단: 책임/객체 다이어그램. 파일 또는 클래스별 책임을 카드로 분리하고 호출 흐름을 화살표로 보여준다.';
    return '필요 학습수단: 코드 실행 스텝퍼. 한 줄씩 실행하면서 입력값, 중간값, 출력값을 나란히 보여준다.';
  }
  return '텍스트만 두지 말고, 개념 관계도 또는 의사결정 표를 넣는다. 버튼형 시뮬레이터가 과하면 "상황 카드 -> 선택 -> 해설" 구조의 미니 퀴즈로 충분하다.';
}

function assessmentPlan(lesson) {
  const title = lesson.data.title ?? lesson.data.id;
  return [
    `${title}의 목적을 한 문장으로 설명하게 한다.`,
    '정상 케이스 1개와 실패/주의 케이스 1개를 구분하게 한다.',
    '다음 레슨에서 왜 이 지식이 필요한지 스스로 연결하게 한다.',
  ];
}

function chapterRisk(chapterId, lessons) {
  const num = Number(chapterId.slice(2));
  const risks = [];
  if (num <= 17) risks.push('CH17까지는 classic-first 구간이다. inline DATA, VALUE, NEW, @ host variable, string template을 새로 끌어오지 않는다. 단 CH04의 && 예외는 허용된다.');
  if (num === 18) risks.push('Modern Syntax 첫 도입 장이다. classic 대비 없이 새 문법만 던지면 R15의 "왜 지금 배우는가"가 무너진다.');
  if (num === 19) risks.push('New Open SQL 첫 도입 장이다. CH08/13의 classic SELECT/JOIN 개념을 먼저 회수해야 한다.');
  if (num >= 24) risks.push('Track-2 실무 구간이다. 성공 예제보다 오류, 재처리, 운영 로그, 권한, 이송 리스크를 함께 다룬다.');
  if (lessons.some((l) => l.flags.includes('R2-체험누락'))) risks.push('코드가 있으나 embed가 없는 레슨이 있다. 본문 보강 시 코드 주변에 체험/시뮬레이터 또는 최소한 조작형 퀴즈 설명을 붙여야 한다.');
  if (lessons.some((l) => l.flags.includes('본문빈약'))) risks.push('본문이 짧은 레슨이 있다. 왜 필요한가, 실수하면 무엇이 깨지는가, 어디서 확인하는가를 별도 섹션으로 늘린다.');
  return risks;
}

function mdList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function writeChapterDoc(chapter, lessons, allChapters, availableEmbeds) {
  const profile = profiles[chapter.data.id] ?? {
    arc: `${chapter.data.title} 장의 핵심 개념을 선후수 흐름에 맞게 확장한다.`,
    must: ['입문자 불편을 먼저 제시', '공식 용어를 한 줄 풀이로 고정', '코드가 나오면 조작형 체험 설명 추가', '후속 개념 선노출 방지'],
    lab: '개념 관계도와 단계별 실행 추적 위젯을 설계한다.',
  };
  const chapterStats = lessons.reduce((acc, lesson) => {
    for (const [k, v] of Object.entries(lesson.stats)) acc[k] = (acc[k] ?? 0) + v;
    acc.flags += lesson.flags.length;
    return acc;
  }, { chars: 0, code: 0, embeds: 0, sections: 0, tables: 0, terms: 0, flags: 0 });
  const prev = allChapters[allChapters.findIndex((c) => c.data.id === chapter.data.id) - 1];
  const next = allChapters[allChapters.findIndex((c) => c.data.id === chapter.data.id) + 1];
  const sourceRows = lessons.map((lesson) => `| ${lesson.data.id} | ${lesson.data.title ?? ''} | ${lesson.stats.chars} | ${lesson.stats.code} | ${lesson.stats.embeds} | ${lesson.flags.join(', ') || 'OK'} |`).join('\n');
  const lessonBlocks = lessons.map((lesson) => {
    const docs = docHints(lesson, chapter);
    const teachingMove = lessonTeachingMove(lesson, profile);
    const visual = visualPlan(lesson, lesson.stats, availableEmbeds);
    const goals = Array.isArray(lesson.data.goals) ? lesson.data.goals : [];
    const introduces = Array.isArray(lesson.data.introduces) ? lesson.data.introduces : [];
    const prereq = Array.isArray(lesson.data.prereq) ? lesson.data.prereq : [];
    const keywordLine = Array.isArray(lesson.data.keywords) ? lesson.data.keywords.join(', ') : String(lesson.data.keywords ?? '');
    return `### ${lesson.data.id} · ${lesson.data.title ?? '(제목 없음)'}

**원본 신호**
- 파일: \`${lesson.rel}\`
- 방향: ${lesson.data.direction ?? 'front matter direction 없음'}
- 키워드: ${keywordLine || '없음'}
- introduces: ${introduces.length ? introduces.join(', ') : '미선언'}
- prereq: ${prereq.length ? prereq.join(', ') : '미선언'}
- 진단: 본문 ${lesson.stats.chars}자 · 섹션 ${lesson.stats.sections}개 · 코드 ${lesson.stats.code}개 · embed ${lesson.stats.embeds}개 · ${lesson.flags.join(', ') || '중대 플래그 없음'}

**개선 강의안**
- 도입 불편: 학습자가 이 레슨 직전에 어떤 답답함을 느꼈는지 먼저 묻고, 그 답답함의 해결책으로 ${lesson.data.title ?? lesson.data.id}를 제시한다.
- 핵심 설명: ${teachingMove}
- 초보자 보호: 새 용어는 첫 등장 한 줄 풀이로 잡고, 이번 레슨의 주제 개념은 한 줄로 끝내지 말고 필요성, 정의, 구조, 확인 방법까지 풀어쓴다.
- 실무 감각: 단순히 실행되는 예제에서 끝내지 말고, 실패했을 때 어떤 화면, sy-subrc, 메시지, 로그, 권한 문제가 나타나는지 한 가지 이상 붙인다.

**예제·시각·상호작용 학습수단 설명**
- ${visual}
- 버튼/상태 설계: "입력 준비" -> "실행" -> "결과 확인" -> "오류 케이스" 4단 버튼 흐름을 기본으로 하고, 결과 영역에는 학습자가 방금 바꾼 값이 무엇인지 강조한다.
- 평가 과제: ${assessmentPlan(lesson).join(' / ')}

**공식 문서 체크 힌트**
${docs.length ? docs.map((d) => `- \`${ABAP_DOCU_DIR}/${d}\``).join('\n') : '- 이 레슨은 주로 프로젝트 커리큘럼/실습 맥락을 따른다. 관련 키워드가 추가되면 ABAP_DOCU sitemap에서 문서명을 확인한다.'}
`;
  }).join('\n');

  const riskList = chapterRisk(chapter.data.id, lessons);
  return `# ${chapter.data.id} · ${chapter.data.title} — codex_0625 강의 개선·보강본

> 생성 시각: ${nowKst} KST  
> 기준 소스: \`${chapter.rel}\` + 해당 챕터 레슨 ${lessons.length}개  
> 목적: 원본 \`content/abap\`을 덮어쓰지 않고, 이후 리빌드/강의자료 작성에 바로 사용할 수 있는 고밀도 보강안을 제공한다.

## 1. 프로젝트 분석 기준

- 학습 대상: 개발·전공 경험 없는 입문자. 설명은 압축하지 않고 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리" 순서로 풀어쓴다.
- R15 게이팅: 이미 배운 것만으로 이해할 수 있어야 한다. 후속 개념은 L1 예고까지만 허용하고, 코드나 정의를 앞당기지 않는다.
- R2 코드=체험: 코드가 1줄이라도 있으면 같은 페이지에서 조작하거나, 최소한 어떤 시뮬레이터/다이어그램/버튼 흐름으로 체험할지 명시한다.
- 참고 우선순위: 로컬 \`content/abap\`과 \`.project-docs\`가 NotebookLM보다 최신이다. NotebookLM은 큰 방향 참고로만 사용한다.

## 2. 이 챕터의 강의 목표

${profile.arc}

**반드시 강화할 지점**
${mdList(profile.must)}

**대표 체험 설계**
- ${profile.lab}

**이전/다음 연결**
- 이전: ${prev ? `${prev.data.id} · ${prev.data.title}` : '과정 시작'}
- 다음: ${next ? `${next.data.id} · ${next.data.title}` : '과정 마무리'}

## 3. 원본 진단 요약

| 항목 | 값 |
|---|---:|
| 레슨 수 | ${lessons.length} |
| 본문 총 글자(공백 제외) | ${chapterStats.chars} |
| 코드 블록 | ${chapterStats.code} |
| embed 지시문 | ${chapterStats.embeds} |
| 용어 마킹 | ${chapterStats.terms} |
| 진단 플래그 총합 | ${chapterStats.flags} |

| 레슨 | 제목 | 본문자 | 코드 | embed | 진단 |
|---|---|---:|---:|---:|---|
${sourceRows}

## 4. 게이팅·품질 리스크

${riskList.length ? mdList(riskList) : '- 큰 구조 리스크는 낮다. 그래도 각 레슨의 introduces/prereq와 본문 실제 설명이 일치하는지 확인한다.'}

## 5. 레슨별 개선·보강안

${lessonBlocks}

## 6. 이 챕터를 감탄나는 자료로 만들기 위한 마무리 체크

- 각 레슨 도입부는 "무엇을 배운다"가 아니라 "지금 무엇이 불편한가"로 시작한다.
- 레슨 끝에는 다음 레슨이 진짜 해결책일 때만 pain -> solution으로 연결한다. 병렬/심화 관계는 억지 불편을 만들지 않는다.
- ABAP 고유 용어는 영어 원문을 살리고 괄호로 쉬운 풀이를 붙인다.
- 코드 예제는 짧은 한 줄 설명, 실행 전 예상, 실행 후 결과 해석, 실패 케이스 순서로 닫는다.
- 공식 문서는 로컬 ABAP_DOCU 파일명으로 재확인하고, 예제는 프로젝트의 관통 예제(구구단, SFLIGHT, 콘서트 예매, 정훈영)를 우선 사용한다.
`;
}

async function main() {
  try {
    const docEntries = await fs.readdir(ABAP_DOCU_DIR);
    docFileSet = new Set(docEntries.filter((name) => name.endsWith('.htm') || name.endsWith('.html')));
  } catch {
    docFileSet = new Set();
  }

  const chapterDirs = (await fs.readdir(CONTENT_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^CH\d{2}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  const embedDir = path.join(ROOT, 'embeds', 'abap');
  const availableEmbeds = new Set();
  if (await exists(embedDir)) {
    for (const name of await fs.readdir(embedDir)) {
      if (/^CH\d{2}-L\d{2}-S\d{2}\.html$/.test(name)) {
        availableEmbeds.add(name.replace(/\.html$/, ''));
      }
    }
  }

  const chapters = [];
  for (const dir of chapterDirs) {
    const chapterFile = path.join(CONTENT_DIR, dir, '_chapter.md');
    const chapter = await readMarkdown(chapterFile);
    const lessonFiles = (await fs.readdir(path.join(CONTENT_DIR, dir)))
      .filter((name) => /^CH\d{2}-L\d{2}.*\.md$/.test(name))
      .sort();
    const lessons = [];
    for (const name of lessonFiles) {
      const lesson = await readMarkdown(path.join(CONTENT_DIR, dir, name));
      lesson.stats = statsFor(lesson.body);
      lesson.flags = flagStats(lesson.stats);
      lessons.push(lesson);
    }
    lessons.sort((a, b) => Number(a.data.order ?? 0) - Number(b.data.order ?? 0) || a.rel.localeCompare(b.rel));
    chapters.push({ ...chapter, lessons });
  }
  chapters.sort((a, b) => Number(a.data.order ?? 0) - Number(b.data.order ?? 0));

  await fs.mkdir(OUT_DIR, { recursive: true });

  const totals = chapters.reduce((acc, chapter) => {
    acc.chapters += 1;
    acc.lessons += chapter.lessons.length;
    for (const lesson of chapter.lessons) {
      for (const [k, v] of Object.entries(lesson.stats)) acc[k] = (acc[k] ?? 0) + v;
      if (lesson.flags.includes('R2-체험누락')) acc.r2 += 1;
      if (lesson.flags.includes('본문빈약')) acc.weak += 1;
      if (lesson.flags.includes('시각/체험없음')) acc.noVisual += 1;
    }
    return acc;
  }, { chapters: 0, lessons: 0, chars: 0, code: 0, embeds: 0, sections: 0, tables: 0, terms: 0, r2: 0, weak: 0, noVisual: 0 });

  const chapterOutputs = [];
  for (const chapter of chapters) {
    const fileName = `${chapter.data.id}_${safeName(chapter.data.title)}.md`;
    const outPath = path.join(OUT_DIR, fileName);
    const doc = writeChapterDoc(chapter, chapter.lessons, chapters, availableEmbeds);
    await fs.writeFile(outPath, doc, 'utf8');
    chapterOutputs.push({ id: chapter.data.id, title: chapter.data.title, lessons: chapter.lessons.length, fileName });
  }

  const index = `# codex_0625 산출물 인덱스

> 생성 시각: ${nowKst} KST  
> 요청: \`content/abap\` 모든 챕터를 읽고 강의 품질을 개선·보강한 참고 파일 생성  
> 기준: \`.project-docs/00_INDEX.md\`, \`01_AI_SYNC.md\`, \`04_CONVENTIONS.md\`, \`05_PITFALLS.md\`, \`09_CURRICULUM_LEDGER.md\`, \`12_EXPANSION_PLAN.md\`, 로컬 \`content/abap\`, \`${ABAP_DOCU_DIR}/index.htm\`, NotebookLM 조회 결과(보조)

## 빠른 결론

- 로컬 기준 챕터: **${totals.chapters}개**
- 로컬 기준 레슨: **${totals.lessons}개**
- 생성된 챕터별 보강본: **${chapterOutputs.length}개**
- 별도 프로젝트 분석 문서: \`00_PROJECT_ANALYSIS.md\`
- 생성 매니페스트: \`99_GENERATION_MANIFEST.json\`

## 읽는 순서

1. \`00_PROJECT_ANALYSIS.md\` — 프로젝트 구조, 실제 범위, NotebookLM/ABAP_DOCU 사용 방식, 전체 진단.
2. 아래 챕터별 파일 — 각 장의 원본 진단, 강의 목표, 레슨별 보강안, 시각/상호작용 학습수단 설명.
3. \`99_GENERATION_MANIFEST.json\` — 기계 확인용 파일 목록과 집계.

## 챕터별 파일

| 챕터 | 제목 | 레슨 수 | 파일 |
|---|---|---:|---|
${chapterOutputs.map((item) => `| ${item.id} | ${item.title} | ${item.lessons} | [${item.fileName}](./${item.fileName}) |`).join('\n')}

## 산출물 사용 원칙

- 이 폴더는 \`content/abap\` 원본을 대체하지 않는 참고/리빌드 설계 산출물이다.
- 실제 소스 반영 시에는 한 번에 한 레슨씩 \`content/abap/**.md\`에 적용하고, R2/R12/R15 검증을 다시 수행한다.
- 코드 예제가 새로 들어가는 레슨은 반드시 \`::embed\` 또는 해당 레슨에서 조작 가능한 체험 수단을 동반한다.
`;

  const analysis = `# codex_0625 프로젝트 분석

> 생성 시각: ${nowKst} KST

## 1. 읽은 프로젝트 문서와 결론

- \`.project-docs/00_INDEX.md\`: 자동 로드 문서와 필요 시 문서를 구분한다. 이번 작업에는 01, 04, 05, 09, 10, 12가 직접 관련된다.
- \`.project-docs/01_AI_SYNC.md\`: 사이트 목표는 "개발자 시선으로 0부터"이며, 완전 입문자에게 압축 없이 동기와 체험을 제공해야 한다.
- \`.project-docs/04_CONVENTIONS.md\`: R2 코드=체험, R3 입문자 작성법, R6 classic-first 경계, R10 front matter, R12 glossary, R15 선수지식 잠금이 핵심이다.
- \`.project-docs/05_PITFALLS.md\`: file:// 미리보기, docs 직접수정, dark code block, 후속 개념 선노출이 반복 함정이다.
- \`.project-docs/09_CURRICULUM_LEDGER.md\`: 현재 로컬 목표 구조는 CH01~CH36이며, CH18/19가 modern 문법/SQL 경계다.
- \`.project-docs/12_EXPANSION_PLAN.md\`: 51항목 기반 확장과 신규 레슨 승격이 이미 반영되어, 실제 로컬 콘텐츠는 237레슨이다.

## 2. 실제 콘텐츠 범위

| 항목 | 값 |
|---|---:|
| 챕터 | ${totals.chapters} |
| 레슨 | ${totals.lessons} |
| 코드 블록 | ${totals.code} |
| embed 지시문 | ${totals.embeds} |
| 용어 마킹 | ${totals.terms} |
| R2 체험누락 후보 | ${totals.r2} |
| 본문 빈약 후보 | ${totals.weak} |
| 시각/체험 없음 후보 | ${totals.noVisual} |

## 3. NotebookLM 사용 결과와 로컬 우선 판단

NotebookLM 노트북 \`ad0e9cde-4dca-451e-b455-de200a9ed7b7\`에 전체 보강 방향을 질의했다. 응답은 classic-first, 선후수 잠금, 코드=체험, 운영 실패 케이스 강화라는 큰 원칙을 확인하는 데 유용했다.

다만 NotebookLM은 v5.4 기준 34챕터/205레슨 소스를 근거로 답했고, 현재 로컬 저장소는 CH01~CH36, 237레슨이다. 따라서 이 산출물은 **로컬 \`content/abap\`과 \`.project-docs\`를 우선 기준**으로 삼고 NotebookLM은 보조 방향으로만 반영했다.

## 4. ABAP_DOCU 사용 방식

로컬 Classic ABAP 문서는 \`${ABAP_DOCU_DIR}/index.htm\`에 있으며 SAP ABAP Keyword Documentation 7.58 HTML 세트다. 챕터별 파일에는 관련 키워드가 있을 때 \`abapdata.htm\`, \`abapselect.htm\`, \`abapread_table.htm\`, \`abapmessage.htm\`, \`abapmethods_for_rap_behv.htm\` 같은 로컬 파일명을 공식 확인 힌트로 붙였다.

이 산출물은 공식 문서를 길게 복사하지 않는다. 이후 실제 본문 작성자가 해당 파일을 열어 문법 세부와 예외를 확인할 수 있게 연결점만 남긴다.

## 5. 전역 보강 전략

1. **초반 CH01~08**: "실행 루프 -> 값 -> 타입 -> 구조 -> 테이블 -> DB -> SELECT"의 손맛을 유지한다. 지나친 실무 세부는 뒤로 보내고, 실행 결과를 직접 보는 체험을 늘린다.
2. **중반 CH09~17**: DDIC 관계, 모듈화, SALV, Selection Screen, Dynpro, Grid ALV는 화면/데이터 흐름이 복잡하므로 이벤트 타임라인과 관계도를 의무적으로 붙인다.
3. **경계 CH18~19**: modern 문법과 new Open SQL은 classic 지식을 대체하는 것이 아니라 리팩터링/표현력 강화 도구로 가르친다.
4. **후반 CH20~23**: OO, CDS, RAP는 파일명 암기가 아니라 책임 분리와 비즈니스 객체 생명주기로 설명한다.
5. **실무 CH24~36**: 성공 예제보다 실패, 재처리, 권한, 로그, 성능, 이송, 운영 품질을 같이 다룬다.

## 6. 생성 파일의 성격

각 챕터 파일은 다음을 포함한다.

- 원본 소스 진단: 본문 길이, 코드 수, embed 수, R2/빈약/압축 후보.
- 챕터 강의 목표: 그 장이 전체 커리큘럼에서 해결하는 불편.
- 레슨별 개선안: 도입 불편, 핵심 설명 방식, 초보자 보호, 실무 감각, 체험/시각화 설계, 공식문서 체크 힌트.

실제 \`content/abap\`에 반영할 때는 이 보강본을 그대로 붙여 넣기보다, 한 레슨씩 기존 front matter와 glossary/embedded widget 상태를 확인해 적용해야 한다.
`;

  await fs.writeFile(path.join(OUT_DIR, '00_INDEX.md'), index, 'utf8');
  await fs.writeFile(path.join(OUT_DIR, '00_PROJECT_ANALYSIS.md'), analysis, 'utf8');
  await fs.writeFile(path.join(OUT_DIR, '99_GENERATION_MANIFEST.json'), JSON.stringify({
    generatedAtKst: nowKst,
    outputDir: rel(OUT_DIR),
    totals,
    chapters: chapterOutputs,
    sourcePriority: [
      '.project-docs/00_INDEX.md',
      '.project-docs/01_AI_SYNC.md',
      '.project-docs/04_CONVENTIONS.md',
      '.project-docs/05_PITFALLS.md',
      '.project-docs/09_CURRICULUM_LEDGER.md',
      '.project-docs/12_EXPANSION_PLAN.md',
      'content/abap/**',
      'C:/ABAP_DOCU_HTML/index.htm',
      'NotebookLM ad0e9cde-4dca-451e-b455-de200a9ed7b7 (supplemental)',
    ],
  }, null, 2), 'utf8');

  console.log(`Generated ${chapterOutputs.length + 3} files in ${rel(OUT_DIR)}`);
  console.log(`Chapters: ${totals.chapters}, lessons: ${totals.lessons}, R2 candidates: ${totals.r2}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
