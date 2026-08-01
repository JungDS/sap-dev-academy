# ABAP 커리큘럼 — TRACK-03 · ABAP 실무 심화

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **목적** — ABAP 실무 심화 트랙 전용 뷰. 전체는 curriculum.md.
> 📊 트랙 1 · 챕터 15 · 레슨 88
> 🕒 생성: 2026-08-01T17:42:33.184Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

## TRACK-03 · ABAP 실무 심화

현업 시나리오로 응용·고급 개발을 다룬다.

### CH25 · 실무 데이터 변경과 트랜잭션 제어 _(난이도: 중급)_

> 실제로 데이터를 바꾸고 커밋·롤백을 제어해야 한다.

**키워드**: INSERT, UPDATE, MODIFY, COMMIT WORK, LUW

**레슨 (5)**
- **CH25-L01 · INSERT / UPDATE / MODIFY / DELETE 실무 기준** _(order 1)_
  - 다룰 내용: 직접 DB를 바꾼다 — 네 가지 DML과 감사필드.
  - 키워드: INSERT, UPDATE, MODIFY, DELETE, 감사필드
- **CH25-L02 · COMMIT WORK / ROLLBACK WORK** _(order 2)_
  - 다룰 내용: 변경을 확정하거나 되돌린다 — 트랜잭션 제어.
  - 키워드: COMMIT WORK, ROLLBACK WORK, 트랜잭션
- **CH25-L03 · DB LUW와 SAP LUW 차이** _(order 3)_
  - 다룰 내용: 트랜잭션의 두 단위 — DB LUW와 SAP LUW.
  - 키워드: LUW, SAP LUW, Update Module, CALL FUNCTION IN UPDATE TASK
- **CH25-L04 · 오류 로그와 재처리 구조** _(order 4)_
  - 다룰 내용: 변경이 실패했을 때 — 기록하고 다시 처리한다.
  - 키워드: 오류 로그, 재처리, BAL, sy-subrc
- **CH25-L05 · 대량 변경 시 Package 처리** _(order 5)_
  - 다룰 내용: 수십만 건을 나눠서 — 패키지 단위 COMMIT.
  - 키워드: Package, 대량처리, COMMIT, 메모리

### CH26 · Lock Object와 동시성 제어 _(난이도: 중급)_

> 여러 사용자가 동시에 같은 데이터를 건드린다 — 잠금이 필요하다.

**키워드**: Lock Object, ENQUEUE, DEQUEUE

**레슨 (5)**
- **CH26-L01 · Lock Object 설계 기준** _(order 1)_
  - 다룰 내용: 동시 변경을 막는 장치 — Lock Object와 잠금 모드.
  - 키워드: Lock Object, SE11, 잠금 모드, ENQUEUE
- **CH26-L02 · ENQUEUE / DEQUEUE Function Module** _(order 2)_
  - 다룰 내용: 잠그고 푼다 — 자동 생성된 ENQUEUE/DEQUEUE 호출.
  - 키워드: ENQUEUE, DEQUEUE, Function Module
- **CH26-L03 · Lock 해제와 예외 처리** _(order 3)_
  - 다룰 내용: 언제 풀리나 — COMMIT/ROLLBACK과 자동 해제.
  - 키워드: DEQUEUE_ALL, foreign_lock, 자동 해제
- **CH26-L04 · 다중 사용자 변경 충돌 시나리오** _(order 4)_
  - 다룰 내용: 다중 사용자 환경에서 발생하는 데이터 수정 손실 문제와 낙관/비관적 잠금.
  - 키워드: Lost Update, Optimistic, Pessimistic, 충돌
- **CH26-L05 · Lock Object와 COMMIT/ROLLBACK 연결** _(order 5)_
  - 다룰 내용: 잠금–읽기–변경–커밋–해제의 한 흐름.
  - 키워드: Lock, COMMIT, ROLLBACK, 패턴

### CH27 · OO ABAP 고급 설계와 패턴 _(난이도: 고급)_

> 규모가 커진다 — OO 설계 패턴으로 다스리고 싶다.

**키워드**: 디자인 패턴, Factory, Singleton, 의존성

**레슨 (5)**
- **CH27-L01 · Factory Pattern** _(order 1)_
  - 다룰 내용: 객체 생성을 한 곳에 모은다 — Factory.
  - 키워드: Factory, Pattern, 생성, OO
- **CH27-L02 · Singleton Pattern** _(order 2)_
  - 다룰 내용: 인스턴스를 단 하나만 — Singleton.
  - 키워드: Singleton, Pattern, 정적, OO
- **CH27-L03 · Strategy Pattern** _(order 3)_
  - 다룰 내용: 알고리즘을 갈아끼운다 — Strategy.
  - 키워드: Strategy, Pattern, Interface, 다형성
- **CH27-L04 · MVC 기반 Report 구조화** _(order 4)_
  - 다룰 내용: 화면·로직·데이터를 분리한다 — MVC.
  - 키워드: MVC, Model, View, Controller, 구조화
- **CH27-L05 · Testable Class 설계와 ABAP Unit** _(order 5)_
  - 다룰 내용: 검증 가능한 설계 — 의존성 분리와 단위 테스트.
  - 키워드: ABAP Unit, Testable, 의존성 주입, Mock

### CH28 · Dynamic ABAP: Field Symbol 심화와 Generic _(난이도: 고급)_

> 타입을 미리 모르는 데이터를 안전하게 다루고 싶다 — 동적 ABAP.

**키워드**: Field Symbol, TYPE any, ASSIGN, RTTS, CREATE DATA

**레슨 (8)**
- **CH28-L01 · typed vs generic Field Symbol** _(order 1)_
  - 다룰 내용: 이름표의 두 얼굴 — 모양을 아는 이름표와 모르는 이름표.
  - 키워드: Field Symbol, TYPE any, typed, generic
- **CH28-L02 · TYPE any · ANY TABLE 파라미터** _(order 2)_
  - 다룰 내용: 어떤 데이터든 받는 메서드 — 대신 확인 책임이 생긴다.
  - 키워드: TYPE any, ANY TABLE, generic, 파라미터
- **CH28-L03 · ASSIGN · UNASSIGN · IS ASSIGNED** _(order 3)_
  - 다룰 내용: 지금 무엇을 가리키나 — 할당 상태와 ELSE UNASSIGN 함정.
  - 키워드: ASSIGN, UNASSIGN, IS ASSIGNED, ELSE UNASSIGN, sy-subrc
- **CH28-L04 · ASSIGN COMPONENT — 필드를 실행 중에 고르기** _(order 4)_
  - 다룰 내용: 구조의 필드 이름이 실행 시점에 정해질 때의 공식 도구.
  - 키워드: ASSIGN COMPONENT, 동적 필드, whitelist, sy-subrc
- **CH28-L05 · ASSIGN (name) — 이름 문자열로 찾기** _(order 5)_
  - 다룰 내용: 문자열이 변수 이름으로 해석된다 — 강력한 만큼 위험한 문법.
  - 키워드: ASSIGN (name), 동적 이름, search order, whitelist
- **CH28-L06 · REF TO data와 CREATE DATA** _(order 6)_
  - 다룰 내용: 실행 중에 데이터를 만든다 — 이름 없는 데이터와 손잡이.
  - 키워드: CREATE DATA, REF TO data, dref->*, TYPE HANDLE
- **CH28-L07 · RTTS — 실행 중 타입 정보 읽기** _(order 7)_
  - 다룰 내용: 들어온 값의 정체를 묻는다 — 타입 설명서와 describe.
  - 키워드: RTTS, RTTI, cl_abap_typedescr, describe_by_data, components
- **CH28-L08 · 실습 — 동적 구조 검사기** _(order 8)_
  - 다룰 내용: 챕터 전부를 조립한다 — describe → 검증 → ASSIGN → 결과.
  - 키워드: 실습, 동적, 구조 검사기, RTTS, ASSIGN COMPONENT

### CH29 · 고급 문자열 처리: PCRE 정규식 _(난이도: 중급)_

> 글자 그대로가 아니라 '형식'을 찾고 싶다 — PCRE 정규식.

**키워드**: 정규식, PCRE, FIND, REPLACE, SUBMATCHES

**레슨 (8)**
- **CH29-L01 · 정규식 입문 — FIND PCRE와 형식 검증** _(order 1)_
  - 다룰 내용: substring 검색의 한계를 겪고, 패턴을 찾는 FIND PCRE로 넘어간다.
  - 키워드: 정규식, PCRE, FIND, 형식 검증, Anchor
- **CH29-L02 · PCRE 기본 문법 — 문자 클래스·수량자·그룹** _(order 2)_
  - 다룰 내용: 실무 초반에 실제로 쓰는 토큰만 추려 조합 감각을 만든다.
  - 키워드: PCRE, 문자 클래스, 수량자, Capture Group, greedy
- **CH29-L03 · FIND PCRE 결과 검증 — MATCH COUNT·OFFSET·LENGTH·RESULTS** _(order 3)_
  - 다룰 내용: "찾았다"에서 멈추지 않고 몇 개·어디서·얼마나를 검증한다.
  - 키워드: FIND, MATCH COUNT, MATCH OFFSET, MATCH LENGTH, RESULTS
- **CH29-L04 · SUBMATCHES — Capture Group으로 값 추출** _(order 4)_
  - 다룰 내용: 괄호 그룹의 값을 변수로 꺼내고, optional·non-capturing까지 관리한다.
  - 키워드: SUBMATCHES, Capture Group, non-capturing, RESULTS, 추출
- **CH29-L05 · REPLACE PCRE — 패턴 치환과 $1 그룹 재사용** _(order 5)_
  - 다룰 내용: 패턴으로 바꾸고, 그룹 값을 치환문에 재사용하고, 결과를 검증한다.
  - 키워드: REPLACE, PCRE, 치환, group substitution, VERBATIM
- **CH29-L06 · CL_ABAP_REGEX·CL_ABAP_MATCHER — 정규식 재사용** _(order 6)_
  - 다룰 내용: 패턴을 객체로 만들어 재사용하고, match와 find_next의 의미 차이를 가른다.
  - 키워드: CL_ABAP_REGEX, CL_ABAP_MATCHER, CREATE_PCRE, match, find_next
- **CH29-L07 · 정규식 내장 함수 — 식 안에서 쓰는 pcre 인자** _(order 7)_
  - 다룰 내용: contains·matches·count·find·match·replace의 pcre 인자를 식 안에서 쓴다.
  - 키워드: 내장 함수, contains, matches, count, replace, pcre
- **CH29-L08 · 실습 — 로그·이메일·코드 패턴 검증기** _(order 8)_
  - 다룰 내용: 챕터 전부를 조립한다 — 패턴·입력·결과·피드백을 분리한 검사기.
  - 키워드: 실습, 검증기, RESULTS, matches, word boundary

### CH30 · ALV 고급 Event 응용 _(난이도: 고급)_

> ALV에서 사용자 상호작용(이벤트)을 처리하고 싶다.

**키워드**: ALV Event, Double Click, Toolbar, User Command

**레슨 (5)**
- **CH30-L01 · Double Click Event** _(order 1)_
  - 다룰 내용: 행을 더블클릭하면 상세로 — ALV 이벤트의 시작.
  - 키워드: double_click, Event, SET HANDLER, ALV
- **CH30-L02 · Hotspot Click Event** _(order 2)_
  - 다룰 내용: 셀을 링크처럼 — 한 번 클릭으로 이동.
  - 키워드: hotspot, hotspot_click, Event
- **CH30-L03 · Toolbar Event** _(order 3)_
  - 다룰 내용: ALV 툴바에 내 버튼을 추가한다.
  - 키워드: toolbar, Event, 커스텀 버튼
- **CH30-L04 · USER_COMMAND 처리** _(order 4)_
  - 다룰 내용: 툴바 버튼이 눌리면 — 명령을 분기 처리한다.
  - 키워드: user_command, Event, 선택 행
- **CH30-L05 · ALV Event Handler Class 설계** _(order 5)_
  - 다룰 내용: 이벤트 처리를 한 클래스로 모아 깔끔하게.
  - 키워드: Event Handler, Class, 설계

### CH31 · Editable Grid ALV와 입력 검증 _(난이도: 고급)_

> ALV에서 직접 입력·수정하고 검증하고 싶다.

**키워드**: Editable ALV, Data Changed, 입력검증

**레슨 (6)**
- **CH31-L01 · Editable Field Catalog 설정** _(order 1)_
  - 다룰 내용: ALV에서 직접 입력받게 — 편집 가능 컬럼 설정.
  - 키워드: edit, Field Catalog, Editable ALV
- **CH31-L02 · DATA_CHANGED Event** _(order 2)_
  - 다룰 내용: 셀이 바뀌는 순간 검증한다 — DATA_CHANGED.
  - 키워드: data_changed, CL_ALV_CHANGED_DATA_PROTOCOL, 검증
- **CH31-L03 · DATA_CHANGED_FINISHED Event** _(order 3)_
  - 다룰 내용: 변경이 모두 반영된 뒤 — 합계·연동 갱신.
  - 키워드: data_changed_finished, 재계산, 연동
- **CH31-L04 · Cell Style 기반 입력 제어** _(order 4)_
  - 다룰 내용: 셀마다 편집 가능/불가를 동적으로 — Cell Style.
  - 키워드: Cell Style, LVC_T_STYL, 입력 제어
- **CH31-L05 · Grid 입력값 검증과 오류 표시** _(order 5)_
  - 다룰 내용: 잘못된 입력을 셀에 빨갛게 표시한다.
  - 키워드: 검증, 오류 표시, add_protocol_entry
- **CH31-L06 · 변경 데이터 DB 반영 전 검증** _(order 6)_
  - 다룰 내용: 저장 직전 최종 점검 후 DML로 반영한다.
  - 키워드: 저장 검증, check_changed_data, DML

### CH32 · Enhancement / BAdI / User Exit _(난이도: 고급)_

> 표준 기능을 건드리지 않고 확장하고 싶다.

**키워드**: BAdI, Enhancement, User Exit

**레슨 (5)**
- **CH32-L01 · Customer Exit / User Exit 개념** _(order 1)_
  - 다룰 내용: 표준을 안 건드리고 끼어드는 옛 방식들.
  - 키워드: User Exit, Customer Exit, SMOD, CMOD
- **CH32-L02 · Enhancement Point / Section** _(order 2)_
  - 다룰 내용: 표준 코드 사이에 내 코드를 끼운다.
  - 키워드: Enhancement Point, Enhancement Section, ENHANCEMENT
- **CH32-L03 · BAdI 정의와 구현** _(order 3)_
  - 다룰 내용: 객체지향 확장점 — BAdI 인터페이스 구현.
  - 키워드: BAdI, Interface, Enhancement Spot, SE18
- **CH32-L04 · Implicit / Explicit Enhancement 판단** _(order 4)_
  - 다룰 내용: 어떤 확장 수단을 쓸지 고른다.
  - 키워드: Implicit, Explicit, Enhancement, 선택
- **CH32-L05 · Clean Core 관점의 확장 기준** _(order 5)_
  - 다룰 내용: 업그레이드에 강한 확장 — Clean Core.
  - 키워드: Clean Core, Released API, Extension, ABAP Cloud

### CH33 · 인터페이스 실무: BAPI/RFC/BDC/File _(난이도: 고급)_

> 외부 시스템과 데이터를 주고받아야 한다.

**키워드**: BAPI, RFC, BDC, File, Excel

**레슨 (5)**
- **CH33-L01 · BAPI 호출과 Return 처리** _(order 1)_
  - 다룰 내용: 호출 성공이 아니라 Return 판정이 저장을 결정한다.
  - 키워드: BAPI, BAPIRET2, COMMIT, ROLLBACK, 경고 정책
- **CH33-L02 · RFC Function Module 설계** _(order 2)_
  - 다룰 내용: 원격 호출은 함수 로직이 아니라 연결·계약·예외·로그를 설계하는 일이다.
  - 키워드: RFC, Remote-Enabled, SM59, DESTINATION, communication_failure
- **CH33-L03 · BDC / Batch Input 실무 기준** _(order 3)_
  - 다룰 내용: 화면 입력을 흉내 내는 최후 수단 — 녹화·모드·메시지·재처리까지.
  - 키워드: BDC, Batch Input, CALL TRANSACTION, BDCDATA, SM35
- **CH33-L04 · Excel Upload 처리** _(order 4)_
  - 다룰 내용: 파일 읽기가 아니라 검증 관문을 만든다 — 파싱·행 검증·오류 피드백.
  - 키워드: Excel, Upload, GUI_UPLOAD, SPLIT, 검증
- **CH33-L05 · File Interface와 재처리** _(order 5)_
  - 다룰 내용: 서버 파일 입출력과 운영 구조 — 로그·재처리·멱등성까지가 인터페이스다.
  - 키워드: File Interface, OPEN DATASET, 재처리, 멱등성, 서버 파일

### CH34 · IDoc / ALE / Gateway _(난이도: 고급)_

> 표준 메시지(IDoc)·게이트웨이로 시스템을 연계하고 싶다.

**키워드**: IDoc, ALE, Gateway, OData

**레슨 (5)**
- **CH34-L01 · IDoc 기본 구조** _(order 1)_
  - 다룰 내용: 표준 메시지 봉투 — Control(송장)·Data(내용물)·Status(배송 이력) 3층을 읽는다.
  - 키워드: IDoc, Control Record, Segment, Status, WE02
- **CH34-L02 · ALE Distribution Model** _(order 2)_
  - 다룰 내용: 배송망 설계 — 주소록·배포 규칙·계약서·통로가 다 맞아야 흐른다.
  - 키워드: ALE, Distribution Model, Partner Profile, Port, BD64
- **CH34-L03 · IDoc 오류 추적과 재처리** _(order 3)_
  - 다룰 내용: 상태는 결과다 — 원인을 고친 뒤에만 재처리가 성공한다.
  - 키워드: IDoc, Status, BD87, 재처리, 상태코드
- **CH34-L04 · Gateway SEGW 프로젝트 구조** _(order 4)_
  - 다룰 내용: URL 하나가 열리기까지 — 메뉴판·주방·창구 등록·시식·불만 접수의 연결.
  - 키워드: Gateway, SEGW, OData, EntityType, DPC_EXT
- **CH34-L05 · OData V2 EntitySet 조회 구현** _(order 5)_
  - 다룰 내용: URL 쿼리를 SELECT로 번역한다 — $filter·$top·$skip과 OFFSET 페이징.
  - 키워드: OData, GET_ENTITYSET, $filter, 페이징, OFFSET

### CH35 · 성능 분석과 튜닝 _(난이도: 고급)_

> 느리다 — 어디가 병목인지 찾아 튜닝하고 싶다.

**키워드**: SAT, ST05, SQL Trace, 성능

**레슨 (5)**
- **CH35-L01 · ST05 SQL Trace** _(order 1)_
  - 다룰 내용: 감이 아니라 측정 — 한 실행의 DB 대화를 기록해 병목을 분류한다.
  - 키워드: ST05, SQL Trace, 측정, 병목, 재측정
- **CH35-L02 · SAT Runtime Analysis** _(order 2)_
  - 다룰 내용: 전신 촬영 — 시간이 ABAP·DB·외부 중 어디서 새는지 가른다.
  - 키워드: SAT, Runtime Analysis, Hit List, 프로파일링
- **CH35-L03 · SQL Monitor / SQLM** _(order 3)_
  - 다룰 내용: 건강검진 통계 — 운영 전체에서 무엇부터 고칠지 우선순위를 정한다.
  - 키워드: SQLM, SQL Monitor, SWLT, 우선순위, 인덱스
- **CH35-L04 · SELECT in LOOP 제거** _(order 4)_
  - 다룰 내용: 1+N 왕복 폭발을 잡는다 — 키 모으기·한 번에 읽기·메모리에서 찾기.
  - 키워드: SELECT in LOOP, FOR ALL ENTRIES, JOIN, BINARY SEARCH
- **CH35-L05 · 대량 데이터 처리와 Package 설계** _(order 5)_
  - 다룰 내용: 수백만 건은 속도가 아니라 설계 — 푸시다운·패키지·재시작·병렬 기준.
  - 키워드: 대량처리, Package, Code Pushdown, 병렬, 재시작

### CH36 · AMDP / ADBC / Pushdown _(난이도: 고급)_

> DB 가까이에서 연산을 밀어넣어 가속하고 싶다.

**키워드**: AMDP, ADBC, Code Pushdown, HANA

**레슨 (6)**
- **CH36-L01 · Code Pushdown과 수단 선택** _(order 1)_
  - 다룰 내용: 무엇을 내릴지는 배웠다 — 이제 무엇으로 내릴지 고른다.
  - 키워드: Code Pushdown, Code-to-Data, HANA, 수단 선택
- **CH36-L02 · AMDP 기본 구조** _(order 2)_
  - 다룰 내용: ABAP 클래스 메서드 안에 DB 프로시저를 담는다 — 만들고, 부르고, 체이닝한다.
  - 키워드: AMDP, SQLScript, BY DATABASE PROCEDURE, IF_AMDP_MARKER_HDB
- **CH36-L03 · ADBC Native SQL** _(order 3)_
  - 다룰 내용: DB 고유 SQL을 문자열로 직접 실행한다 — 보호막 없이.
  - 키워드: ADBC, Native SQL, CL_SQL_STATEMENT, SQL injection
- **CH36-L04 · 푸시다운 수단 비교와 선택** _(order 4)_
  - 다룰 내용: 속도 순위가 아니라 책임 순위로 고른다.
  - 키워드: Open SQL, CDS, AMDP, ADBC, 선택 기준
- **CH36-L05 · CDS Table Function과 AMDP Function** _(order 5)_
  - 다룰 내용: AMDP 함수의 결과를 CDS 뷰처럼 읽는 다리를 잇는다.
  - 키워드: CDS Table Function, BY DATABASE FUNCTION, FOR TABLE FUNCTION, AMDP
- **CH36-L06 · 운영 리스크와 DB 종속성** _(order 6)_
  - 다룰 내용: 강한 수단을 운영에 들이는 조건 — 책임의 목록을 만든다.
  - 키워드: DB 종속성, SQL injection, client, Clean Core, 운영 리스크

### CH37 · Forms / Output / PDF _(난이도: 중급)_

> 출력 양식(PDF·폼)을 만들어야 한다.

**키워드**: Smart Forms, OTF, PDF, Output

**레슨 (5)**
- **CH37-L01 · Smart Forms 기본 구조** _(order 1)_
  - 다룰 내용: 화면 출력이 아니라 "문서"를 만든다 — 전통 양식의 구조와 호출.
  - 키워드: Smart Forms, SMARTFORMS, Form Interface, SSF_FUNCTION_MODULE_NAME
- **CH37-L02 · Smart Forms에서 PDF로 — OTF와 변환** _(order 2)_
  - 다룰 내용: 인쇄 대화상자 대신 출력의 원형(OTF)을 받아 CONVERT_OTF로 PDF 데이터를 만든다.
  - 키워드: OTF, CONVERT_OTF, getotf, SSFCTRLOP
- **CH37-L03 · Output Control 개요** _(order 3)_
  - 다룰 내용: 양식과 출력 결정은 다른 층이다 — 언제·무엇을·누구에게·어떤 채널로.
  - 키워드: Output Control, NAST, BRFplus, Output Management
- **CH37-L04 · PDF 바이트와 다운로드** _(order 4)_
  - 다룰 내용: PDF는 글자가 아니라 바이트다 — xstring으로 받아 BIN으로 저장한다.
  - 키워드: PDF, xstring, xstrlen, GUI_DOWNLOAD
- **CH37-L05 · 양식 오류 추적과 변경 대응** _(order 5)_
  - 다룰 내용: "안 나와요" 티켓을 다섯 단계로 좁힌다 — 그리고 양식도 코드처럼 이송한다.
  - 키워드: 양식 오류, SP01, Spool, 변경 통제

### CH38 · 운영 품질과 배포 관리 (이송 심화) _(난이도: 고급)_

> 코드가 돈다에서 멈추지 않는다 — 자동 검사·회귀 방어·안전한 이송·무인 실행·표준 로그로 운영을 지킨다. (CH01-L06 이송요청의 2단 심화)

**키워드**: ATC, ABAP Unit, Test Double, Transport, Background Job, Application Log

**레슨 (6)**
- **CH38-L01 · ATC / Code Inspector — 자동 품질 게이트** _(order 1)_
  - 다룰 내용: 사람 눈이 놓치는 것을 기계가 잡는다 — 출시 전 자동 검사와 release gate.
  - 키워드: ATC, Code Inspector, SCI, Finding, Exemption
- **CH38-L02 · ABAP Unit 운영 — 회귀를 막는 게이트** _(order 2)_
  - 다룰 내용: 고친 코드가 기존 약속을 깨지 않았는가 — 테스트를 운영 게이트로 쓴다.
  - 키워드: ABAP Unit, 회귀, Regression, Release Gate
- **CH38-L03 · Test Double 심화 — 의존성을 끊는 도구들** _(order 3)_
  - 다룰 내용: DB·CDS·legacy 의존을 어떻게 끊나 — 의존성 모양별 test double 선택.
  - 키워드: Test Double, CL_ABAP_TESTDOUBLE, TEST-SEAM, SQL Test Double
- **CH38-L04 · Transport 관리 — DEV에서 PRD까지** _(order 4)_
  - 다룰 내용: 검증된 변경만, 올바른 순서로 — 이송요청의 2단 심화(release·import·의존).
  - 키워드: Transport, STMS, SE09, Import, Return Code
- **CH38-L05 · Background Job 운영 — 무인 실행** _(order 5)_
  - 다룰 내용: 사람이 없는 시간의 실행 — SUBMIT과 잡 스케줄, 상태와 증거.
  - 키워드: Background Job, SM36, SM37, SUBMIT
- **CH38-L06 · Application Log — 운영 표준 로그** _(order 6)_
  - 다룰 내용: "실패했다"가 아니라 "무엇이 왜"를 남긴다 — BAL 기록과 SLG1 조회.
  - 키워드: Application Log, BAL, SLG1, BAL_DB_SAVE

### CH39 · RAP + Fiori 실무 Capstone (RAP 심화) _(난이도: 고급)_

> 배운 전부를 하나의 운영 가능한 앱으로 — 예매 RAP BO에 Draft·Lock·ETag·권한·EML·통신 설정까지 얹어 완성한다.

**키워드**: RAP, Draft, ETag, EML, Fiori Elements, Communication Arrangement

**레슨 (9)**
- **CH39-L01 · Capstone 업무 시나리오 정의** _(order 1)_
  - 다룰 내용: 마지막 장은 축하가 아니라 조립이다 — 요구를 계층 책임으로 번역한다.
  - 키워드: Capstone, 시나리오, RAP, 계층 책임
- **CH39-L02 · ZI_* Interface View 심화 — 관계와 변경 추적** _(order 2)_
  - 다룰 내용: CH24의 뼈대에 운영급 재료를 — association 노출·ETag 후보 필드·composition 지도.
  - 키워드: Interface View, Association, Composition, 변경 추적 필드
- **CH39-L03 · ZC_* Projection View와 UI Annotation 심화** _(order 3)_
  - 다룰 내용: 소비자 계약을 의도적으로 — provider contract·@UI 배치·Metadata Extension.
  - 키워드: Projection View, provider contract, @UI, Metadata Extension
- **CH39-L04 · BDEF 심화 — Draft·Lock·ETag·권한 계약** _(order 4)_
  - 다룰 내용: CH24의 계약에 운영 조항을 얹는다 — with draft·lock master·total etag·authorization master.
  - 키워드: BDEF, Draft, lock master, total etag, authorization master
- **CH39-L05 · Action / Validation / Determination 구현 완성** _(order 5)_
  - 다룰 내용: 계약이 약속한 판단을 채운다 — 다건 안전·failed/reported·action result.
  - 키워드: Validation, Determination, Action, failed/reported
- **CH39-L06 · 외부 EML Consumer — MODIFY에서 COMMIT까지** _(order 6)_
  - 다룰 내용: 화면 밖에서 RAP BO를 다룬다 — buffer·save sequence·FAILED/REPORTED 실전.
  - 키워드: EML, MODIFY ENTITIES, COMMIT ENTITIES, ROLLBACK ENTITIES
- **CH39-L07 · Service Binding과 Fiori Elements Preview** _(order 7)_
  - 다룰 내용: 계약이 화면이 되는 순간 — OData V4 노출과 Preview 검증 체크리스트.
  - 키워드: Service Definition, Service Binding, Fiori Elements, OData V4
- **CH39-L08 · Draft · Lock · ETag · Authorization 심화** _(order 8)_
  - 다룰 내용: 여럿이 같은 데이터를 만질 때 — 네 장치의 역할 분담과 충돌 시나리오.
  - 키워드: Draft, Lock, ETag, Authorization
- **CH39-L09 · Communication Arrangement와 운영 마감** _(order 9)_
  - 다룰 내용: 화면 너머의 소비자 — 통신 설정·release contract·최종 릴리스 보드.
  - 키워드: Communication Arrangement, Release Contract, Released API, Clean Core

---
