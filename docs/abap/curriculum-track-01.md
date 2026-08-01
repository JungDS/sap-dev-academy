# ABAP 커리큘럼 — TRACK-01 · ABAP 기초 — Classic 완결

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **목적** — ABAP 기초 — Classic 완결 트랙 전용 뷰. 전체는 curriculum.md.
> 📊 트랙 1 · 챕터 17 · 레슨 122
> 🕒 생성: 2026-08-01T17:42:33.182Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

## TRACK-01 · ABAP 기초 — Classic 완결

불편을 먼저 겪고, 그 해결책으로 Classic ABAP 기본기를 완결한다.

### CH01 · 개발 환경과 첫 프로그램 _(난이도: 입문)_

> 대망의 첫 번째 챕터다. 여기서는 ABAP 프로그램을 간단히 만들어 보고 실행하며, 프로그램이 어디에 보관되는지 배운다.

**학습 목표**
- SAPGUI로 시스템에 로그온하고 기본 화면 구성을 익힌다.
- T-code와 SE38(ABAP Editor)로 첫 프로그램을 생성·실행한다.
- 프로그램 기본 구조와 주석을 이해한다.
- WRITE로 문자열을 화면에 출력한다.
- WRITE의 폭·정렬·색·구분선으로 출력을 보기 좋게 다듬는다.
- 프로그램을 $TMP(Local)에 저장한 뒤, 개발 패키지와 이송요청의 필요를 이해한다.

**키워드**: SAPGUI, 로그온, T-code, SE38, REPORT, WRITE, 출력서식, 주석, $TMP, 개발 패키지, 이송요청

**레슨 (7)**
- **CH01-L01 · SAPGUI 로그온과 화면 구성** _(order 1)_
  - 다룰 내용: SAP 시스템에 접속해 개발을 시작할 환경을 연다.
  - 키워드: SAPGUI, 로그온, SAP Easy Access
- **CH01-L02 · T-code와 SE38 첫 실행** _(order 2)_ · T-code: `SE38,SE11,SE80`(신규)
  - 다룰 내용: 명령창과 SE38(ABAP Editor)로 첫 프로그램을 만들고 $TMP(Local Object)에 저장한다.
  - 키워드: T-code, SE38, ABAP Editor, $TMP, Local Object
- **CH01-L03 · 프로그램 구조와 주석** _(order 3)_
  - 다룰 내용: 프로그램의 기본 뼈대와, 코드에 설명을 남기는 법을 익힌다.
  - 키워드: REPORT, 주석, 문장 종결
- **CH01-L04 · WRITE로 문자열 출력** _(order 4)_ · T-code: `SE38`(복습)
  - 다룰 내용: WRITE로 화면에 첫 글자를 찍고, 줄바꿈·체인·리터럴을 직접 실행해 구분한다.
  - 학습 목표: WRITE로 화면에 출력하고, /(줄바꿈)·콜론(:) 체인·문자 리터럴의 동작을 직접 실행해 구분한다.
  - 키워드: WRITE, 리터럴, 출력, 줄바꿈, REPORT
- **CH01-L05 · WRITE 심화 — 정렬·폭·색·구분선** _(order 5)_ · T-code: `SE38`(복습)
  - 다룰 내용: 폭과 정렬로 칸을 맞추고, 색·구분선으로 강조해 출력을 보기 좋게 만든다.
  - 학습 목표: WRITE의 폭·정렬·색·강조·구분선 옵션으로 리스트 출력을 보기 좋게 다듬는다(classic 리스트 서식).
  - 키워드: WRITE, 정렬, COLOR, ULINE, SKIP, 출력서식
- **CH01-L06 · 개발 패키지와 이송요청 입문** _(order 6)_ · T-code: `SE80,SE21,SE09,SE10,STMS`
  - 다룰 내용: $TMP의 한계를 넘어, 개발 객체를 패키지에 보관하고 이송요청으로 관리하는 첫걸음.
  - 키워드: 개발 패키지, $TMP, 이송요청, Transport Organizer, SE09, SE10, SE80, SE21, STMS, Repository Object
- **CH01-L07 · T-code 생성 기초 (SE93)** _(order 7)_ · T-code: `SE93`(신규)
  - 다룰 내용: SE93으로 내 프로그램을 짧은 코드 하나로 실행되게 만든다.
  - 키워드: SE93, T-code, 트랜잭션 코드, 실행형

### CH02 · 변수·표준 타입·상수·Text Symbol _(난이도: 입문)_

> 값을 따옴표에 직접 적자니 바꾸기도 재사용도 불편하다. 어딘가 담아 두고 싶다.

**키워드**: 변수, DATA, TYPE, LIKE, STRING, I, C, N, P, TYPES, CONSTANTS, Text Symbol

**레슨 (6)**
- **CH02-L01 · 변수 선언(DATA)** _(order 1)_
  - 다룰 내용: DATA로 값을 담을 그릇, 변수를 선언한다.
  - 키워드: DATA, 변수, TYPE, LIKE
- **CH02-L02 · Complete 타입(STRING·I·F·D·T)** _(order 2)_
  - 다룰 내용: 길이를 따로 안 적어도 되는 완전한 표준 타입부터.
  - 키워드: STRING, I, F, D, T, Complete 타입
- **CH02-L03 · Incomplete 타입(C·N·P)** _(order 3)_
  - 다룰 내용: 길이(와 소수 자릿수)를 함께 지정해야 하는 타입.
  - 키워드: C, N, P, LENGTH, DECIMALS, Incomplete 타입, offset
- **CH02-L04 · Local Type(TYPES) 재사용** _(order 4)_
  - 다룰 내용: 같은 타입 정의를 매번 반복하지 말고, TYPES로 이름 붙여 재사용한다.
  - 키워드: TYPES, Local Type, 재사용
- **CH02-L05 · CONSTANTS — 값에 이름 붙이기** _(order 5)_
  - 다룰 내용: 코드에 박힌 숫자·문자에 이름을 붙여, 뜻은 분명하게 변경은 안전하게.
  - 키워드: CONSTANTS, 상수, 매직넘버
- **CH02-L06 · Text Symbol — 화면 글자의 다국어** _(order 6)_
  - 다룰 내용: 코드에 박은 텍스트를 번호로 빼서, 언어마다 다르게 보이게 한다.
  - 키워드: Text Symbol, TEXT-001, 다국어

### CH03 · DDIC Domain·Data Element + PARAMETERS _(난이도: 입문)_

> 프로그램마다 같은 타입을 또 정의… 전역으로 공유하고 싶다.

**키워드**: Domain, Data Element, DDIC, PARAMETERS, F4

**레슨 (3)**
- **CH03-L01 · Domain — 기술 속성 정의** _(order 1)_ · T-code: `SE11`(신규)
  - 다룰 내용: 타입의 기술 속성(타입·길이·대소문자·허용값)을 Domain에 한 번 정의해 전역으로 쓰고, 저장 → 검사 → 활성화 흐름을 직접 체험한다.
  - 학습 목표: Domain의 속성(데이터 타입·길이·출력길이·소수·대소문자·허용값)을 이해하고, DDIC 객체는 활성화해야 런타임에 쓸 수 있음을 직접 체험한다.
  - 키워드: Domain, DDIC, SE11, 데이터타입, 값 테이블, 고정값, 활성화
- **CH03-L02 · Data Element — 의미·라벨 입히기** _(order 2)_
  - 다룰 내용: Domain에 의미와 라벨을 입혀, 필드가 참조할 단위를 만든다.
  - 키워드: Data Element, Domain, 라벨, DDIC
- **CH03-L03 · PARAMETERS — 라벨·F4 자동 적용** _(order 3)_
  - 다룰 내용: DDIC에서 고생한 만큼 화면 생성이 쉬워진다. PARAMETERS에 라벨·F4가 자동으로 붙는다.
  - 키워드: PARAMETERS, F4, Data Element, Selection Screen, OBLIGATORY, DEFAULT

### CH04 · 연산자와 흐름 제어 _(난이도: 입문)_

> 값을 받았지만 계산·분기·반복을 못 한다. 연산자와 흐름 제어로 프로그램에 '판단'과 '되풀이'를 넣는다.

**키워드**: 연산자, IF, CASE, DO, WHILE, 디버깅, 구구단

**레슨 (7)**
- **CH04-L01 · 산술 연산과 대입 · 날짜 산술** _(order 1)_
  - 다룰 내용: 값을 더하고 빼고 곱하고 나누고, 날짜까지 계산한다.
  - 키워드: 산술연산, ADD, SUBTRACT, MULTIPLY, DIVIDE, CLEAR, 날짜산술
- **CH04-L02 · 문자열 다루기** _(order 2)_
  - 다룰 내용: 문자열을 잇고, 자르고, 찾고, 바꾸고, 다듬는다.
  - 키워드: CONCATENATE, SPLIT, FIND, REPLACE, CONDENSE, STRLEN, &&
- **CH04-L03 · IF와 조건식** _(order 3)_
  - 다룰 내용: 조건에 따라 갈라지게 해, 프로그램에 첫 '판단'을 넣는다.
  - 키워드: IF, ELSEIF, ELSE, AND, OR, NOT, IS INITIAL, boolean, abap_bool
- **CH04-L04 · CASE 분기** _(order 4)_
  - 다룰 내용: 한 값을 여러 경우로 깔끔하게 나눈다.
  - 키워드: CASE, WHEN, OTHERS
- **CH04-L05 · DO / WHILE · 루프 제어** _(order 5)_
  - 다룰 내용: 같은 일을 되풀이하고, 멈추고, 건너뛴다.
  - 키워드: DO, WHILE, EXIT, CONTINUE, CHECK, sy-index
- **CH04-L06 · 디버깅 입문** _(order 6)_
  - 다룰 내용: 디버거를 켜, 코드가 도는 동안 변수 값을 눈으로 본다.
  - 키워드: BREAK-POINT, /h, F5, F6, F7, F8, WATCH POINT
- **CH04-L07 · 종합 실습: 구구단** _(order 7)_
  - 다룰 내용: 배운 연산·분기·반복을 모아 구구단을 만든다.
  - 키워드: 구구단, 종합실습, 중첩 DO

### CH05 · Structure (Local · DDIC) _(난이도: 초급)_

> 단일 값 변수가 난립한다. 관련된 값을 하나로 묶고 싶다.

**키워드**: Structure, BEGIN OF, DDIC Structure, MOVE-CORRESPONDING

**레슨 (5)**
- **CH05-L01 · Local Structure (BEGIN OF ~ END OF)** _(order 1)_
  - 다룰 내용: BEGIN OF ~ END OF로 Structure를 만들어 관련된 값을 하나로 묶는다.
  - 키워드: Structure, BEGIN OF, END OF, Work Area, Component, TYPES, LIKE
- **CH05-L02 · DDIC Structure** _(order 2)_
  - 다룰 내용: SE11에서 DDIC Structure를 만들어 Structure Type을 전역으로 공유한다.
  - 키워드: DDIC Structure, SE11, Data Element, Structure
- **CH05-L03 · Structure 재사용 — 중첩 · .INCLUDE · .APPEND** _(order 3)_
  - 다룰 내용: Structure 안에 Structure를 끼워 넣고, 펼쳐 담아 재사용한다.
  - 키워드: 중첩 Structure, .INCLUDE, .APPEND, Structure 재사용
- **CH05-L04 · Structure 다루기** _(order 4)_
  - 다룰 내용: Structure 복사·초기화·동일 이름 필드 옮기기(MOVE-CORRESPONDING).
  - 키워드: MOVE-CORRESPONDING, CLEAR, Structure, Work Area
- **CH05-L05 · 구구단 한 줄 = Structure (캡스톤)** _(order 5)_
  - 다룰 내용: 구구단 한 줄을 Structure로 묶어 채우고, 디버거로 들여다본다.
  - 키워드: 구구단, Structure, Work Area, 캡스톤

### CH06 · Internal Table _(난이도: 초급)_

> 한 건이 아니라 여러 건(레코드)을 다뤄야 한다.

**키워드**: Internal Table, Table Type, LOOP, READ, MODIFY, Deep Structure

**레슨 (6)**
- **CH06-L01 · Internal Table 기초** _(order 1)_
  - 다룰 내용: 같은 모양의 행을 여러 개 — 내부 테이블 선언과 행 추가.
  - 키워드: Internal Table, TYPE TABLE OF, APPEND, Work Area, DESCRIBE TABLE
- **CH06-L02 · 내부 테이블의 3속성 · 테이블 종류** _(order 2)_
  - 다룰 내용: 내부 테이블을 정의하는 세 가지 — 행 모양·키·종류.
  - 키워드: Line Type, Primary Key, Table Kind, STANDARD, SORTED, HASHED
- **CH06-L03 · 단일 행 제어** _(order 3)_
  - 다룰 내용: 한 행을 콕 집어 넣고, 찾고, 고치고, 지운다.
  - 키워드: INSERT, READ TABLE, BINARY SEARCH, MODIFY, DELETE, sy-subrc, sy-tabix
- **CH06-L04 · 다중 행 제어** _(order 4)_
  - 다룰 내용: 여러 행을 한꺼번에 — 순회·집계·중복 제거·그룹 처리.
  - 키워드: LOOP, sy-tabix, ASSIGNING, COLLECT, AT NEW, DELETE ADJACENT DUPLICATES
- **CH06-L05 · Deep Structure 개념** _(order 5)_
  - 다룰 내용: 구조 안에 Internal Table·문자열이 든 'Deep' Structure — 개념과 분류.
  - 키워드: Deep Structure, Flat, Nested, Internal Table
- **CH06-L06 · 구구단 전체 = Internal Table (캡스톤)** _(order 6)_
  - 다룰 내용: 구구단 81줄을 내부 테이블에 쌓아 정렬·출력한다.
  - 키워드: 구구단, Internal Table, APPEND, LOOP, SORT, 캡스톤

### CH07 · Transparent Table (SE11) _(난이도: 초급)_

> 프로그램이 끝나면 값이 사라진다 — 영속적으로 저장하고 싶다.

**키워드**: Transparent Table, SE11, Create Entries, Key, 영속

**레슨 (3)**
- **CH07-L01 · Transparent Table 생성 (SE11)** _(order 1)_
  - 다룰 내용: 값을 영구히 — DB에 1:1로 대응하는 투명 테이블을 만든다.
  - 키워드: Transparent Table, SE11, Key, MANDT, Data Element
- **CH07-L02 · Create Entries로 구구단 입력 · 데이터 조회** _(order 2)_
  - 다룰 내용: 만든 테이블에 손으로 데이터를 넣고(SE11 Create Entries) 확인한다.
  - 키워드: Create Entries, SE11, Table Contents, Transparent Table
- **CH07-L03 · Transparent ↔ Structure ↔ Table Type 비교** _(order 3)_
  - 다룰 내용: 같은 DDIC 모양이 쓰임에 따라 작업영역·내부테이블·영속테이블이 된다.
  - 키워드: Transparent Table, Structure, Table Type, 영속, 비교

### CH08 · Open SQL 기본 조회 _(난이도: 초급)_

> 저장한 데이터를 다시 읽어오고 싶다. (classic 구문)

**키워드**: Open SQL, SELECT, INTO TABLE, WHERE, SELECT SINGLE, classic

**레슨 (7)**
- **CH08-L01 · SAP 데모 테이블과 Client 종속** _(order 1)_
  - 다룰 내용: 풍부한 연습 데이터 — SCARR·SPFLI·SFLIGHT와 Open SQL의 client 자동 종속.
  - 키워드: SCARR, SPFLI, SFLIGHT, Open SQL, MANDT, Client
- **CH08-L02 · SELECT 4요소 · `*` vs 필드** _(order 2)_ · T-code: `SE38`
  - 다룰 내용: SELECT의 네 가지 — 어느 테이블·어느 필드·어느 행·어디에 담을지.
  - 키워드: SELECT, INTO TABLE, projection, sy-subrc, classic
- **CH08-L03 · SELECT 형태 — SINGLE · INTO TABLE · UP TO n ROWS** _(order 3)_
  - 다룰 내용: 한 건만, 여러 건, 줄여 읽기 — 결과 형태에 맞는 SELECT.
  - 키워드: SELECT SINGLE, INTO TABLE, ENDSELECT, UP TO n ROWS, classic
- **CH08-L04 · INTO 대상 형태** _(order 4)_
  - 다룰 내용: 결과를 어디에 담나 — Work Area·개별 변수·CORRESPONDING·APPENDING.
  - 키워드: INTO, CORRESPONDING FIELDS, APPENDING, Work Area
- **CH08-L05 · WHERE 상세 — 연산자와 wildcard** _(order 5)_
  - 다룰 내용: 조건을 정교하게 — 비교·BETWEEN·LIKE·IN·IS NULL.
  - 키워드: WHERE, BETWEEN, LIKE, IN, IS NULL, classic
- **CH08-L06 · 키 필드 vs 일반 필드 · Index 기초** _(order 6)_
  - 다룰 내용: 무엇으로 찾느냐가 속도를 가른다 — 키와 인덱스.
  - 키워드: Primary Key, Secondary Index, 성능, SELECT
- **CH08-L07 · 조회 실패와 MESSAGE (기초)** _(order 7)_
  - 다룰 내용: 결과가 없을 때 — sy-subrc 분기와 MESSAGE 맛보기.
  - 키워드: sy-subrc, MESSAGE, 조회 실패

### CH09 · DDIC 관계와 입력도움말(F4) _(난이도: 초급)_

> 아무 값이나 입력된다 — 올바른 값만 받도록 관계·검색도움말이 필요하다.

**키워드**: Foreign Key, Check Table, Search Help, F4

**레슨 (9)**
- **CH09-L01 · Foreign Key와 Check Table** _(order 1)_
  - 다룰 내용: 아무 값이나 막는다 — Foreign Key로 입력을 다른 테이블 값으로 제한.
  - 키워드: Foreign Key, Check Table, DDIC, 입력검증
- **CH09-L02 · Value Table과 Foreign Key의 차이** _(order 2)_
  - 다룰 내용: Domain의 Value Table은 '제안', Foreign Key는 '실제 관계'.
  - 키워드: Value Table, Foreign Key, Domain, Check Table, 변환루틴
- **CH09-L03 · Text Table — 코드 옆 이름표** _(order 3)_
  - 다룰 내용: 코드만 든 마스터에 사람이 읽을 이름을 — 언어별 Text Table.
  - 키워드: Text Table, SPRAS, Foreign Key, 언어
- **CH09-L04 · Elementary Search Help** _(order 4)_
  - 다룰 내용: F4 목록을 설계한다 — 단일 소스 Elementary Search Help.
  - 키워드: Search Help, Elementary, F4, SE11
- **CH09-L05 · Collective Search Help 기초** _(order 5)_
  - 다룰 내용: 여러 Elementary를 묶어 탭으로 — Collective Search Help.
  - 키워드: Collective Search Help, Elementary, F4
- **CH09-L06 · PARAMETERS와 DDIC F4 Help 연결** _(order 6)_
  - 다룰 내용: DDIC의 검증·F4가 PARAMETERS 화면으로 자동 연결되는 원리.
  - 키워드: PARAMETERS, F4, Search Help, Data Element
- **CH09-L07 · Input Help 호출 우선순위** _(order 7)_
  - 다룰 내용: F4를 누르면 어떤 도움말이 뜨나 — 위에서부터 정해지는 순서.
  - 키워드: Input Help, F4, Search Help, 우선순위, Fixed Values
- **CH09-L08 · DDIC 검증과 프로그램 검증의 역할 분리** _(order 8)_
  - 다룰 내용: 선언적 DDIC 검증과 코드 검증의 경계 — 무엇을 어디서.
  - 키워드: 입력검증, DDIC, 비즈니스 로직, 역할 분리
- **CH09-L09 · 실습 — 콘서트 모델 만들기 (DDIC)** _(order 9)_
  - 다룰 내용: 우리 앱의 토대 — ZCONCERT·ZPERF·ZBOOKING과 FK·F4를 직접 만든다.
  - 키워드: 실습, 콘서트앱, ZCONCERT, ZBOOKING, Foreign Key

### CH10 · 모듈화 기초 _(난이도: 초급)_

> 같은 코드가 여기저기 반복된다 — 묶어서 재사용하고 싶다.

**키워드**: FORM, PERFORM, Function Module, 모듈화

**레슨 (7)**
- **CH10-L01 · FORM / PERFORM 기본 호출** _(order 1)_
  - 다룰 내용: 반복 코드를 묶는 첫 도구 — 서브루틴(FORM/PERFORM).
  - 키워드: Subroutine, FORM, PERFORM, 모듈화
- **CH10-L02 · USING / CHANGING 파라미터** _(order 2)_
  - 다룰 내용: 서브루틴에 값을 주고(USING) 결과를 돌려받는다(CHANGING).
  - 키워드: USING, CHANGING, Subroutine, 파라미터
- **CH10-L03 · CALL FUNCTION 기본 구조** _(order 3)_
  - 다룰 내용: 여러 프로그램이 공유하는 재사용 단위 — Function Module.
  - 키워드: Function Module, CALL FUNCTION, SE37, EXPORTING, IMPORTING
- **CH10-L04 · Local Class로 모듈화 — 정적 기준** _(order 4)_
  - 다룰 내용: 클래스라는 또 다른 묶음 — 객체 없이 부르는 정적 메서드부터.
  - 키워드: Class, Method, 로컬 클래스, Static
- **CH10-L05 · Global Class 호출 기초** _(order 5)_
  - 다룰 내용: 이미 만들어진 전역 클래스의 메서드를 정적으로 불러 쓴다.
  - 키워드: Global Class, SE24, Static Method, 블랙박스
- **CH10-L06 · Subroutine / Function / Class 선택 기준** _(order 6)_
  - 다룰 내용: 셋 중 무엇을 — 상황별 모듈화 선택 기준.
  - 키워드: Subroutine, Function Module, Class, 모듈화
- **CH10-L07 · 실습 — 잔여석 계산·예매 판정 모듈화** _(order 7)_
  - 다룰 내용: 콘서트앱 2단계 — 핵심 로직을 모듈로 묶는다.
  - 키워드: 실습, 콘서트앱, 모듈화, 잔여석, FORM

### CH11 · SALV 1차 (간단 ALV) _(난이도: 초급)_

> WRITE 리스트는 투박하다 — 표 형태로 깔끔하게 보고 싶다.

**키워드**: SALV, CL_SALV_TABLE, ALV

**레슨 (6)**
- **CH11-L01 · SALV의 목적과 CL_SALV_TABLE 개요** _(order 1)_
  - 다룰 내용: WRITE 리스트를 넘어 — 표 형태 출력 SALV(CL_SALV_TABLE).
  - 키워드: SALV, ALV, CL_SALV_TABLE
- **CH11-L02 · FACTORY 메서드로 Internal Table 출력** _(order 2)_ · T-code: `SE38`(복습)
  - 다룰 내용: factory 한 번으로 내부 테이블을 SALV 객체로 만들고, display로 띄우는 두 단계를 직접 체험한다.
  - 학습 목표: cl_salv_table=>factory( )로 내부 테이블을 ALV 객체로 만들고, factory(객체 생성)와 display(화면 표시)가 별개의 단계임을 직접 확인한다.
  - 키워드: SALV, factory, CL_SALV_TABLE, Internal Table, ALV
- **CH11-L03 · 기본 Function 표시와 Display 실행** _(order 3)_
  - 다룰 내용: 표준 툴바를 켜고 display로 화면에 띄운다.
  - 키워드: SALV, get_functions, set_all, display
- **CH11-L04 · Internal Table → SALV 미니 리포트** _(order 4)_
  - 다룰 내용: SELECT → SALV까지 한 프로그램으로 — 첫 표 리포트 완성.
  - 키워드: SALV, Open SQL, Internal Table, 미니 리포트
- **CH11-L05 · SALV 기초 정리 및 이후 심화과정 소개** _(order 5)_
  - 다룰 내용: 지금 다루는 SALV의 범위와, 뒤로 미루는 심화의 경계.
  - 키워드: SALV, 범위, Grid ALV, 심화
- **CH11-L06 · 실습 — 예매 목록 SALV** _(order 6)_
  - 다룰 내용: 콘서트앱 3단계 — 예매 목록을 SALV 표로.
  - 키워드: 실습, 콘서트앱, SALV, 예매목록

### CH12 · SELECT-OPTIONS와 Range Table _(난이도: 중급)_

> 단일 값(PARAMETERS)만으론 부족 — 범위·다중 조건으로 조회하고 싶다.

**키워드**: SELECT-OPTIONS, Range Table, SIGN, OPTION

**레슨 (7)**
- **CH12-L01 · Range Table 구조** _(order 1)_
  - 다룰 내용: 범위·다중 조건을 담는 그릇 — Range Table의 4컬럼(SIGN/OPTION/LOW/HIGH).
  - 키워드: Range Table, SIGN, OPTION, LOW, HIGH, CP
- **CH12-L02 · SELECT-OPTIONS 기본 문법** _(order 2)_
  - 다룰 내용: 화면 입력칸과 Range Table을 한 번에 만드는 SELECT-OPTIONS.
  - 키워드: SELECT-OPTIONS, Range Table, Selection Screen, TABLES, FOR
- **CH12-L03 · WHERE … IN (classic range)** _(order 3)_
  - 다룰 내용: Range Table을 조회 조건으로 — classic WHERE … IN과 sy-subrc·sy-dbcnt.
  - 키워드: WHERE, IN, Range Table, Open SQL, classic, sy-subrc, sy-dbcnt
- **CH12-L04 · Multiple Selection과 Include/Exclude** _(order 4)_
  - 다룰 내용: 다중 선택 팝업 — 여러 값·범위와 포함(I)/제외(E)가 결과를 정하는 법.
  - 키워드: Multiple Selection, Include, Exclude, SIGN
- **CH12-L05 · EQ / BT / CP 옵션 이해** _(order 5)_
  - 다룰 내용: 비교 방식 OPTION — EQ(같음)·BT(범위)·CP(패턴)를 SIGN과 함께 읽기.
  - 키워드: OPTION, EQ, BT, CP, SIGN, wildcard
- **CH12-L06 · Selection Table 직접 조작 기초** _(order 6)_
  - 다룰 내용: 화면 없이 코드로 Range Table 채우기 — TYPE RANGE OF·CLEAR·APPEND.
  - 키워드: Range Table, TYPE RANGE OF, APPEND, CLEAR, RANGES
- **CH12-L07 · 실습 — 공연·상태로 예매 필터** _(order 7)_
  - 다룰 내용: 콘서트앱 — SELECT-OPTIONS로 필요한 예매만 골라 SALV로.
  - 키워드: 실습, 콘서트앱, SELECT-OPTIONS, 필터, WHERE IN

### CH13 · Open SQL 2차: JOIN·집계 _(난이도: 중급)_

> 여러 테이블을 한 번에, 집계까지 해서 보고 싶다. (classic 유지)

**키워드**: JOIN, INNER JOIN, 집계, GROUP BY, classic

**레슨 (8)**
- **CH13-L01 · INNER JOIN 기본 개념과 구현** _(order 1)_
  - 다룰 내용: 여러 테이블을 키로 합친다 — classic INNER JOIN.
  - 키워드: JOIN, INNER JOIN, Open SQL, classic
- **CH13-L02 · LEFT OUTER JOIN 기본 개념과 NULL 처리** _(order 2)_
  - 다룰 내용: 왼쪽은 모두 남긴다 — LEFT OUTER JOIN과 빈 값 처리.
  - 키워드: LEFT OUTER JOIN, , JOIN, classic
- **CH13-L03 · GROUP BY와 Aggregate** _(order 3)_
  - 다룰 내용: 묶어서 세고 합산한다 — GROUP BY와 집계 함수.
  - 키워드: GROUP BY, Aggregate, COUNT, SUM, classic
- **CH13-L04 · HAVING과 집계 조건** _(order 4)_
  - 다룰 내용: 집계 결과로 거른다 — WHERE와 다른 HAVING.
  - 키워드: HAVING, GROUP BY, Aggregate, classic
- **CH13-L05 · ORDER BY 정렬 조회** _(order 5)_
  - 다룰 내용: DB에서 정렬해 받는다 — ORDER BY.
  - 키워드: ORDER BY, Open SQL, 정렬, classic
- **CH13-L06 · FOR ALL ENTRIES 사용 기준** _(order 6)_
  - 다룰 내용: 내부 테이블을 조건으로 DB 조회 — FOR ALL ENTRIES의 함정과 규칙.
  - 키워드: FOR ALL ENTRIES, Open SQL, classic, 성능
- **CH13-L07 · JOIN / FAE / ABAP 처리 선택 기준** _(order 7)_
  - 다룰 내용: 합치기 방법 셋 — JOIN·FAE·ABAP 루프 중 무엇을.
  - 키워드: JOIN, FOR ALL ENTRIES, 성능, 선택 기준
- **CH13-L08 · 실습 — 공연별 예매현황 리포트** _(order 8)_
  - 다룰 내용: 콘서트앱 5단계 — JOIN·집계로 한눈에 보는 현황.
  - 키워드: 실습, 콘서트앱, JOIN, 집계, 예매현황

### CH14 · Classic DDIC View·유지보수 객체 _(난이도: 중급)_

> 테이블을 더 보기 좋게 보여주고, 마스터데이터를 유지보수하고 싶다.

**키워드**: Database View, Maintenance View, Table Maintenance

**레슨 (9)**
- **CH14-L01 · Database View와 Open SQL JOIN 비교** _(order 1)_
  - 다룰 내용: 반복되는 JOIN을 DDIC에 등록해 재사용 — Database View vs 코드 JOIN.
  - 키워드: Database View, JOIN, DDIC, SE11, inner join
- **CH14-L02 · Projection View 개념과 한계** _(order 2)_
  - 다룰 내용: 한 테이블에서 필요한 필드만 노출 — Projection View와 그 한계.
  - 키워드: Projection View, DDIC, 필드 제한
- **CH14-L03 · Help View와 Search Help 연결** _(order 3)_
  - 다룰 내용: F4 도움말을 풍부하게 — 여러 테이블을 묶는 Help View.
  - 키워드: Help View, Search Help, F4, DDIC, outer join
- **CH14-L04 · Maintenance View와 Foreign Key 관계** _(order 4)_
  - 다룰 내용: 관련 테이블을 표준 화면에서 함께 유지보수 — Maintenance View와 Foreign Key.
  - 키워드: Maintenance View, Foreign Key, 유지보수, SE54
- **CH14-L05 · Table Maintenance Generator / SM30** _(order 5)_
  - 다룰 내용: 테이블/뷰에 표준 유지보수 화면을 생성 — SM30로 운영.
  - 키워드: Table Maintenance Generator, SM30, 유지보수
- **CH14-L06 · View Cluster — 관련 뷰를 묶어 유지보수** _(order 6)_
  - 다룰 내용: 마스터+종속 테이블을 한 흐름으로 — SE54 View Cluster.
  - 키워드: View Cluster, SE54, 유지보수, 계층
- **CH14-L07 · SE16N 데이터 브라우저** _(order 7)_
  - 다룰 내용: 테이블 내용을 빠르게 조회하는 만능 브라우저 — SE16N.
  - 키워드: SE16N, 데이터 브라우저, Table Contents
- **CH14-L08 · Classic View와 CDS 비교** _(order 8)_
  - 다룰 내용: 클래식 뷰가 푼 문제와, 현대 CDS로의 경계(예고).
  - 키워드: Classic View, CDS, View Entity, 비교
- **CH14-L09 · 실습 — 공연 등록 화면 (View · SM30)** _(order 9)_
  - 다룰 내용: 콘서트앱 — 챕터의 도구를 '공연 등록과 확인' 한 흐름으로 묶기.
  - 키워드: 실습, 콘서트앱, Database View, SM30, Maintenance View, F4

### CH15 · Report Event·Selection Screen 심화 _(난이도: 중급)_

> 실행 흐름의 적절한 시점에 코드를 끼우고, 선택화면을 다듬고 싶다.

**키워드**: INITIALIZATION, AT SELECTION-SCREEN, START-OF-SELECTION

**레슨 (12)**
- **CH15-L01 · ABAP Report Event 전체 흐름** _(order 1)_ · T-code: `SE38`(복습)
  - 다룰 내용: 실행형 프로그램의 이벤트 순서 — 언제 무엇이 실행되나.
  - 키워드: Report Event, INITIALIZATION, START-OF-SELECTION, 흐름
- **CH15-L02 · INITIALIZATION 기본값 설정** _(order 2)_
  - 다룰 내용: 화면 뜨기 전 1회 — 좋은 출발점 제안(매번 강제 아님).
  - 키워드: INITIALIZATION, PARAMETERS, SELECT-OPTIONS, 기본값
- **CH15-L03 · AT SELECTION-SCREEN OUTPUT 동적 화면 제어** _(order 3)_
  - 다룰 내용: 화면 그리기 직전(PBO) — 필드를 동적으로 숨김/잠금.
  - 키워드: AT SELECTION-SCREEN OUTPUT, LOOP AT SCREEN, MODIFY SCREEN, PBO
- **CH15-L04 · AT SELECTION-SCREEN 입력 검증** _(order 4)_
  - 다룰 내용: 사용자가 실행할 때(PAI) — 입력값을 검증하고, 화면 전체로도 필드 하나로도 막는다.
  - 키워드: AT SELECTION-SCREEN, AT SELECTION-SCREEN ON, MESSAGE, 입력검증, PAI
- **CH15-L05 · START-OF-SELECTION 조회 실행** _(order 5)_
  - 다룰 내용: 검증을 통과한 뒤 본 처리(DB 조회·가공)를 시작하는 표준 자리.
  - 키워드: START-OF-SELECTION, Open SQL, sy-subrc, 본처리
- **CH15-L06 · END-OF-SELECTION의 위치와 경계** _(order 6)_
  - 다룰 내용: 신규 리포트의 표준 마무리가 아니다 — legacy/LDB 이벤트로 정확히 자리매김.
  - 키워드: END-OF-SELECTION, Logical Database, legacy, obsolete
- **CH15-L07 · Selection Screen 권한/존재 여부 검증 기초** _(order 7)_
  - 다룰 내용: 입력 단계에서 "있는 값인가"와 "볼 수 있는 사용자인가"를 분리해 막는다.
  - 키워드: AUTHORITY-CHECK, SELECT SINGLE, 존재검증, 권한검증, AT SELECTION-SCREEN
- **CH15-L08 · Selection Screen 고급 — 블록·그룹 검증과 커스텀 F1·F4** _(order 8)_
  - 다룰 내용: 필드 하나를 넘어 — 블록/라디오그룹 검증과, 코드로 직접 만드는 F1 도움말·F4 입력 도움.
  - 키워드: AT SELECTION-SCREEN ON, ON BLOCK, ON RADIOBUTTON GROUP, ON HELP-REQUEST, ON VALUE-REQUEST, F1, F4
- **CH15-L09 · Selection Screen UI 구성** _(order 9)_
  - 다룰 내용: 입력 조건을 업무 단위로 — 블록·체크박스·라디오·버튼·탭·툴바.
  - 키워드: SELECTION-SCREEN, BLOCK, CHECKBOX, RADIOBUTTON, PUSHBUTTON, SSCRFIELDS
- **CH15-L10 · PARAMETERS · SELECT-OPTIONS 옵션 총정리** _(order 10)_
  - 다룰 내용: 입력 항목에 붙이는 옵션들을 한자리에 — 필수·기본값·대소문자·복수선택·화면제어.
  - 키워드: PARAMETERS, SELECT-OPTIONS, OBLIGATORY, MEMORY ID, MODIF ID, LOWER CASE
- **CH15-L11 · 여러 선택화면 — 화면번호·CALL·Variant** _(order 11)_
  - 다룰 내용: 선택화면을 여러 개 두고 골라 부른다 — 화면번호·팝업 호출·입력값 저장.
  - 키워드: SELECTION-SCREEN, CALL SELECTION-SCREEN, Variant, 화면번호, sy-subrc
- **CH15-L12 · 실습 — 예매현황 리포트 (이벤트·검증)** _(order 12)_
  - 다룰 내용: 이벤트·검증 종합 — 기본값·화면제어·입력/존재/권한 검증·조회·표시를 이벤트마다 제자리에.
  - 키워드: 실습, 콘서트앱, INITIALIZATION, AT SELECTION-SCREEN, AUTHORITY-CHECK, START-OF-SELECTION

### CH16 · Screen Programming / Dynpro 기초 _(난이도: 중급)_

> 표준 화면 말고 내가 설계한 입력 화면이 필요하다.

**키워드**: Dynpro, PBO, PAI, Screen Painter

**레슨 (10)**
- **CH16-L01 · Module Pool 프로그램 구조** _(order 1)_
  - 다룰 내용: 화면 중심 프로그램의 뼈대 — Module Pool과 PBO/PAI 두 박자.
  - 키워드: Module Pool, Dynpro, PBO, PAI, SE80, T-code
- **CH16-L02 · Screen Number와 Screen Painter** _(order 2)_
  - 다룰 내용: 화면에 번호를 붙이고, Screen Painter의 네 조각으로 화면을 그린다.
  - 키워드: Screen Number, Screen Painter, Flow Logic, MODULE, SE51
- **CH16-L03 · 화면 요소 — 입력·버튼·체크박스·라디오·드롭다운** _(order 3)_
  - 다룰 내용: 화면 요소를 세 가지 행동(값 운반·function code·표시)으로 구분해 변수와 잇는다.
  - 키워드: Input Field, Push Button, Checkbox, Radiobutton, Dropdown, VRM
- **CH16-L04 · Dictionary 화면 필드와 TABLES 운반** _(order 4)_
  - 다룰 내용: DDIC 필드를 화면에 얹고, 같은 이름의 TABLES work area로 값을 나른다.
  - 키워드: TABLES, table work area, Dictionary field, dynpro field, 운반
- **CH16-L05 · 화면에서 F1·F4 직접 만들기** _(order 5)_
  - 다룰 내용: DDIC 도움이 먼저, 그래도 부족할 때만 flow logic로 직접 F4를 만든다.
  - 키워드: PROCESS ON VALUE-REQUEST, PROCESS ON HELP-REQUEST, F4, F1, DYNP_VALUES_READ, 입력 도움
- **CH16-L06 · PBO 처리 흐름** _(order 6)_
  - 다룰 내용: 화면을 그리기 직전 — 상태·제목·목록·필드 속성을 준비한다.
  - 키워드: PBO, MODULE OUTPUT, LOOP AT SCREEN, MODIFY SCREEN
- **CH16-L07 · PAI 처리 흐름 — OK_CODE와 화면 떠나기** _(order 7)_
  - 다룰 내용: 버튼을 누른 뒤 — OK_CODE를 안전하게 읽고, 화면/프로그램 종료를 구분한다.
  - 키워드: PAI, OK_CODE, SAVE_OK, LEAVE TO SCREEN, LEAVE PROGRAM, SET SCREEN
- **CH16-L08 · PF-STATUS와 TITLEBAR** _(order 8)_
  - 다룰 내용: 화면 위 메뉴·툴바·기능키와 제목을 달고, function code를 PAI와 맞춘다.
  - 키워드: PF-STATUS, TITLEBAR, GUI Status, EXCLUDING, SE41
- **CH16-L09 · Custom Control과 Container · Tabstrip · Subscreen** _(order 9)_
  - 다룰 내용: 화면 안에 ALV·트리를 박을 자리와 화면 분할 구조를 잡는다.
  - 키워드: Custom Control, Custom Container, Tabstrip, Subscreen, Status Icon
- **CH16-L10 · 실습 — 예매 입력 화면 (Dynpro)** _(order 10)_
  - 다룰 내용: Module Pool 종합 — 화면 준비(PBO)·입력 처리(PAI)·검증·종료를 한 흐름으로.
  - 키워드: 실습, 콘서트앱, Dynpro, PBO, PAI, OK_CODE, 검증

### CH17 · Grid ALV 기초 _(난이도: 중급)_

> ALV를 화면에 박아 풍부하게 제어하고 싶다.

**키워드**: CL_GUI_ALV_GRID, Field Catalog, Layout, Variant

**레슨 (10)**
- **CH17-L01 · CL_GUI_CUSTOM_CONTAINER 생성** _(order 1)_
  - 다룰 내용: 화면 안 ALV가 살 자리 — Custom Control 영역을 ABAP 객체로 붙잡는다.
  - 키워드: CL_GUI_CUSTOM_CONTAINER, Custom Container, Custom Control, container_name
- **CH17-L02 · CL_GUI_ALV_GRID 생성** _(order 2)_
  - 다룰 내용: 컨테이너 위에 ALV 그리드 컨트롤 객체를 얹는다.
  - 키워드: CL_GUI_ALV_GRID, ALV Grid, i_parent, Container
- **CH17-L03 · 출력용 Internal Table 준비** _(order 3)_
  - 다룰 내용: 그리드에 보여줄 데이터를 내부 테이블에 담는다 — SELECT와 결과 확인.
  - 키워드: Internal Table, SELECT INTO TABLE, sy-subrc, sy-dbcnt, ALV 데이터
- **CH17-L04 · Field Catalog 기초** _(order 4)_
  - 다룰 내용: 데이터 필드를 사용자가 보는 컬럼으로 — 제목·너비·순서 제어.
  - 키워드: Field Catalog, LVC_T_FCAT, LVC_S_FCAT, LVC_FIELDCATALOG_MERGE, coltext
- **CH17-L05 · Layout 기본 설정** _(order 5)_
  - 다룰 내용: 표 전체의 보기 설정 — 줄무늬·선택 모드·제목·너비 최적화(LVC_S_LAYO).
  - 키워드: Layout, LVC_S_LAYO, zebra, sel_mode, cwidth_opt
- **CH17-L06 · Variant 기본 설정** _(order 6)_
  - 다룰 내용: 사용자가 표시 방식(컬럼 순서·필터)을 저장·재사용하는 Display Variant.
  - 키워드: Display Variant, DISVARIANT, is_variant, i_save, sy-repid
- **CH17-L07 · SET_TABLE_FOR_FIRST_DISPLAY** _(order 7)_
  - 다룰 내용: 데이터·fieldcat·layout·variant를 묶어 그리드를 처음 띄운다.
  - 키워드: set_table_for_first_display, EXPORTING, CHANGING, ALV display
- **CH17-L08 · Refresh와 Stable Refresh 기초** _(order 8)_
  - 다룰 내용: 데이터 변경과 화면 갱신은 별개 — refresh로 다시 그리고, stable로 위치를 지킨다.
  - 키워드: refresh_table_display, Stable Refresh, is_stable, LVC_S_STBL
- **CH17-L09 · 행 색상 기초** _(order 9)_
  - 다룰 내용: 중요한 행을 색으로 강조 — 색 코드 컬럼 + layout info_fname.
  - 키워드: 행 색상, info_fname, rowcolor, LVC_S_LAYO
- **CH17-L10 · 종합 실습 — 예매 목록 Grid ALV 완성** _(order 10)_
  - 다룰 내용: 컨테이너부터 색까지, 배운 조각을 책임별 FORM으로 나눠 하나의 화면으로 모은다.
  - 키워드: 실습, Grid ALV, 예매목록, 통합, FORM

---
