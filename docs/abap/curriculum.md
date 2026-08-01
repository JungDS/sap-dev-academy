# SAP Developer Academy — ABAP 커리큘럼 전체 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **목적** — 챕터·레슨 구조 전체를 한 파일로 최신화한 단일 소스. 구글 NotebookLM 등에 업로드해 챕터/레슨별 내용을 확보·전달하는 데 쓴다.
> 📊 트랙 2 · 챕터 39 · 레슨 270
> 🕒 생성: 2026-08-01T16:40:30.490Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

## TRACK-01 · ABAP 기초

불편을 먼저 겪고, 그 해결책으로 ABAP 기본기를 익힌다.

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

### CH18 · Modern ABAP Syntax _(난이도: 중급)_

> 장황한 고전 구문이 번거롭다 — 현대 ABAP으로 간결하게.

**키워드**: inline DATA, VALUE, FOR, string template, CORRESPONDING

**레슨 (11)**
- **CH18-L01 · Inline Declaration** _(order 1)_
  - 다룰 내용: 선언 위치를 의도 가까이로 — DATA()/FINAL() 인라인 선언.
  - 키워드: inline, DATA(), FINAL(), declaration position, Modern
- **CH18-L02 · VALUE Constructor Expression** _(order 2)_
  - 다룰 내용: Structure·내부 테이블을 결과 모양 그대로 — VALUE
  - 키워드: VALUE #(), Constructor, Internal Table, BASE, FOR
- **CH18-L03 · CORRESPONDING과 구조 매핑** _(order 3)_
  - 다룰 내용: 이름이 같은 필드를 새 타입으로 옮긴다 — CORRESPONDING·MAPPING·EXCEPT.
  - 키워드: CORRESPONDING #(), MAPPING, EXCEPT, MOVE-CORRESPONDING
- **CH18-L04 · Table Expression** _(order 4)_
  - 다룰 내용: 한 행을 값처럼 읽는다 — tab[ ]·line_exists·line_index (짧지만 안전하게).
  - 키워드: Table Expression, line_exists, line_index, CX_SY_ITAB_LINE_NOT_FOUND
- **CH18-L05 · String Template과 내장 함수** _(order 5)_
  - 다룰 내용: 출력 문장 모양 그대로 — | … { } … | 템플릿과 함수형 문자열 함수.
  - 키워드: String Template, | |, to_upper, substring, strlen
- **CH18-L06 · CONV·EXACT 변환 표현식** _(order 6)_
  - 다룰 내용: 임시 변수 없이 그 자리에서 타입을 바꾸는 CONV, 손실을 막는 EXACT.
  - 키워드: CONV, EXACT, 타입 변환, constructor expression
- **CH18-L07 · COND·SWITCH 조건 표현식** _(order 7)_
  - 다룰 내용: 조건에 따라 값 하나를 만드는 표현식 — 흐름을 나누는 IF/CASE와 구분한다.
  - 키워드: COND, SWITCH, 조건 표현식, constructor expression
- **CH18-L08 · REDUCE·FILTER 테이블 표현식** _(order 8)_
  - 다룰 내용: 여러 행을 하나로 줄이는 REDUCE, 조건 행만 새 테이블로 뽑는 FILTER.
  - 키워드: REDUCE, FILTER, 집계, 테이블 표현식
- **CH18-L09 · LET으로 표현식 속 이름 읽기** _(order 9)_
  - 다룰 내용: 표현식 안에서만 사는 보조 이름 — LET으로 중간값을 한 번만 이름 붙인다.
  - 키워드: LET, IN, constructor expression, 보조 이름
- **CH18-L10 · Legacy 코드의 Modern ABAP 리팩터링** _(order 10)_
  - 다룰 내용: classic 코드를 모던으로 — "짧게"가 아니라 "또렷하게", 결과는 그대로. += 까지.
  - 키워드: 리팩터링, +=, Modern, before-after, 동작보존
- **CH18-L11 · 실습 — 콘서트앱 모던 리팩터** _(order 11)_
  - 다룰 내용: 콘서트앱 — classic 코드를 모던 ABAP으로, 결과는 그대로 다듬는다.
  - 키워드: 실습, 콘서트앱, 모던리팩터, 인라인, VALUE, line_exists

### CH19 · New Open SQL / Modern ABAP SQL _(난이도: 중급)_

> 고전 Open SQL이 투박하다 — @·인라인으로 현대화. ★ 여기부터 modern SQL.

**키워드**: @, @DATA, 콤마 필드리스트, host 변수 escape

**레슨 (8)**
- **CH19-L01 · Classic Open SQL과 Modern ABAP SQL 비교** _(order 1)_
  - 다룰 내용: 같은 조회를 classic과 modern으로 — 무엇이, 왜 달라졌나.
  - 키워드: Open SQL, ABAP SQL, modern, 콤마, @, strict
- **CH19-L02 · @ Host Variable과 Host Expression** _(order 2)_
  - 다룰 내용: ABAP 값을 SQL에 안전하게 넣는다 — @변수와 @( 식 ).
  - 키워드: @, Host Variable, Host Expression, lossless
- **CH19-L03 · INTO TABLE @DATA(...) Inline Target** _(order 3)_
  - 다룰 내용: 결과 테이블을 SELECT 자리에서 바로 선언한다.
  - 키워드: @DATA, inline, INTO TABLE, AS alias, empty key
- **CH19-L04 · SQL Expression — CASE / CAST / COALESCE** _(order 4)_
  - 다룰 내용: SELECT 안에서 값을 계산·변환·치환한다 — DB가 직접.
  - 키워드: SQL Expression, CASE, CAST, COALESCE, AS alias
- **CH19-L05 · SQL String / Date Function** _(order 5)_
  - 다룰 내용: SELECT 안에서 문자열·날짜를 다루는 SQL 함수 — 단, ABAP 함수와 헷갈리지 않기.
  - 키워드: SQL Function, CONCAT, SUBSTRING, UPPER, DATS_ADD_DAYS
- **CH19-L06 · SELECT FROM @itab 기초** _(order 6)_
  - 다룰 내용: 내부 테이블을 SQL 소스처럼 조회한다 — DB 왕복 없이.
  - 키워드: SELECT FROM @itab, Internal Table, SQL, GROUP BY
- **CH19-L07 · ABAP SQL 정리 — 다음 단계로** _(order 7)_
  - 다룰 내용: 모던 ABAP SQL을 "언제 무엇을 쓸지"로 정리하고, 코드 구조의 OO로 넘어간다.
  - 키워드: ABAP SQL, 정리, 의사결정, CDS, OO
- **CH19-L08 · 실습 — 콘서트앱 모던 SQL** _(order 8)_
  - 다룰 내용: 콘서트앱 — 조회를 @·콤마·@DATA로 현대화하되, 업무 결과를 검증한다.
  - 키워드: 실습, 콘서트앱, 모던SQL, @DATA, COALESCE, LEFT OUTER JOIN

### CH20 · Advanced ABAP SQL _(난이도: 고급)_

> modern SQL 기본으론 벅찬 질문 — 데이터베이스에 '질문을 설계'하고 싶다.

**키워드**: CTE, WITH, Subquery, EXISTS, Window, UNION

**레슨 (7)**
- **CH20-L01 · 고급 SQL은 언제 필요한가** _(order 1)_
  - 다룰 내용: modern SQL 기본을 넘는 네 도구를 언제 꺼내는지 — 문법보다 판단.
  - 키워드: 고급 SQL, CTE, Subquery, Set operation, Window
- **CH20-L02 · WITH와 CTE — 중간 결과에 이름 붙이기** _(order 2)_
  - 다룰 내용: 복잡한 SELECT를 "중간 표를 만든다 → 다시 읽는다"로 나누기.
  - 키워드: CTE, WITH, 중간 결과, LEFT OUTER JOIN, COALESCE
- **CH20-L03 · Subquery와 EXISTS — 조건 안에서 다시 묻기** _(order 3)_
  - 다룰 내용: JOIN이 행을 붙인다면, 조건 안 SELECT는 존재·포함을 묻는다.
  - 키워드: Subquery, EXISTS, IN, correlated, NOT EXISTS
- **CH20-L04 · UNION · INTERSECT · EXCEPT — 결과 집합 다루기** _(order 4)_
  - 다룰 내용: JOIN이 컬럼을 옆으로 붙인다면, 집합 연산은 행을 위아래로 합·교·차.
  - 키워드: Set operation, UNION, UNION ALL, INTERSECT, EXCEPT
- **CH20-L05 · Window Expression — 행을 유지하며 그룹 계산** _(order 5)_
  - 다룰 내용: GROUP BY는 행을 접지만, window는 상세 행을 두고 합계·순번을 붙인다.
  - 키워드: Window, OVER, PARTITION BY, ROW_NUMBER, RANK
- **CH20-L06 · 선택 기준과 멈춤 기준** _(order 6)_
  - 다룰 내용: SQL로 되느냐보다 읽기 쉽고 검증 가능하냐를 먼저 묻는다.
  - 키워드: 선택 기준, JOIN, EXISTS, CTE, Window
- **CH20-L07 · 실습 — 콘서트 Advanced SQL** _(order 7)_
  - 다룰 내용: CTE·EXISTS·EXCEPT·Window를 한 콘서트 조회에 모아 결과를 검증한다.
  - 키워드: 실습, 콘서트, CTE, EXISTS, EXCEPT, Window

### CH21 · OO ABAP 기본 설계 _(난이도: 고급)_

> 절차적 코드의 한계 — 객체로 구조화하고 싶다.

**키워드**: CLASS, METHOD, 인스턴스, 상속, 인터페이스

**레슨 (10)**
- **CH21-L01 · Global Class 생성과 객체** _(order 1)_
  - 다룰 내용: SE24로 전역 클래스를 만들고 객체를 생성한다 — 흩어진 로직을 한 덩어리로.
  - 키워드: Global Class, SE24, NEW, CREATE OBJECT, 객체, REF TO
- **CH21-L02 · Attribute / Method / Visibility** _(order 2)_
  - 다룰 내용: 클래스가 가진 데이터와 행동, 그리고 공개 범위 — 캡슐화는 방어선.
  - 키워드: Attribute, Method, PUBLIC, PROTECTED, PRIVATE, CLASS-DATA
- **CH21-L03 · Constructor와 객체 초기화** _(order 3)_
  - 다룰 내용: 객체가 태어날 때 자동 실행되는 생성자 — 바로 쓸 수 있는 상태로.
  - 키워드: CONSTRUCTOR, CLASS_CONSTRUCTOR, 초기화, IMPORTING
- **CH21-L04 · Static Method와 Instance Method** _(order 4)_
  - 다룰 내용: 클래스로 직접(=>) vs 객체로(->) — 객체 상태가 필요한가로 가른다.
  - 키워드: Static, Instance, =>, ->, me
- **CH21-L05 · Interface 기본 설계** _(order 5)_
  - 다룰 내용: 같은 부모가 아니라 같은 약속으로 묶는다 — Interface와 다형성.
  - 키워드: Interface, INTERFACES, 다형성, intf~method
- **CH21-L06 · Exception Class — TRY / CATCH / CX 계층** _(order 6)_
  - 다룰 내용: 오류를 메시지·숫자코드가 아니라 객체로 다룬다 — 예외 클래스와 TRY/CATCH.
  - 키워드: Exception, TRY/CATCH, RAISE EXCEPTION, RAISING, CX_ROOT
- **CH21-L07 · Inheritance / Redefinition** _(order 7)_
  - 다룰 내용: 공통은 부모에, 차이만 자식에 — 물려받아 확장·재정의한다.
  - 키워드: Inheritance, INHERITING FROM, REDEFINITION, super, ABSTRACT, FINAL
- **CH21-L08 · 다형성 — CAST와 CASE TYPE OF** _(order 8)_
  - 다룰 내용: 부모 타입으로 다루되, 정말 필요할 때만 실제 타입을 확인한다.
  - 키워드: CAST, CASE TYPE OF, 다형성, ?=, CX_SY_MOVE_CAST_ERROR
- **CH21-L09 · OO 이벤트 — EVENTS / RAISE EVENT / SET HANDLER** _(order 9)_
  - 다룰 내용: 객체가 사건을 알리고, 등록된 다른 객체가 반응한다 — 결합도를 낮추는 구조.
  - 키워드: EVENTS, RAISE EVENT, SET HANDLER, FOR EVENT, 이벤트
- **CH21-L10 · 실습 — ZCL_BOOKING_MANAGER 클래스** _(order 10)_
  - 다룰 내용: 콘서트앱 — 예약 로직을 객체로 종합 설계(상태·검증·예외·이벤트).
  - 키워드: 실습, 콘서트앱, 클래스, 예외, 이벤트, ZCX_FULLY_BOOKED

### CH22 · SALV/Grid ALV 표시 제어 심화 _(난이도: 고급)_

> ALV 표시를 색·셀 단위까지 세밀하게 제어하고 싶다.

**키워드**: Cell Color, Stable Refresh, Event, Layout 심화

**레슨 (8)**
- **CH22-L01 · SALV Sort / Filter / Function 제어** _(order 1)_
  - 다룰 내용: SALV 객체로 정렬·필터·툴바 기능을 코드로 — display 전에 지정한다.
  - 키워드: SALV, Sort, Filter, Function, FACTORY
- **CH22-L02 · SALV Layout / Variant 심화** _(order 2)_
  - 다룰 내용: 표시 설정·컬럼 텍스트·레이아웃 저장 — 개발자 기본값 + 사용자 보기.
  - 키워드: SALV, Display Settings, Columns, Layout, Variant
- **CH22-L03 · Grid ALV Column 제어 심화** _(order 3)_
  - 다룰 내용: Field Catalog로 컬럼을 숨기고·합계·정렬·키 강조 — 화면 표시 지시서.
  - 키워드: Field Catalog, Column, no_out, do_sum, just, key
- **CH22-L04 · Deep Structure 기반 Cell Color** _(order 4)_
  - 다룰 내용: 행이 아니라 셀 하나만 — 행 구조에 색 정보 테이블을 품는다.
  - 키워드: Cell Color, LVC_T_SCOL, Deep Structure, ctab_fname
- **CH22-L05 · Deep Structure 기반 Cell Style** _(order 5)_
  - 다룰 내용: 셀 단위 모양·동작 — 비활성·편집·버튼. 색과 같은 deep, 다른 연결.
  - 키워드: Cell Style, LVC_T_STYL, Deep Structure, stylefname
- **CH22-L06 · Row / Column / Cell Color 선택 기준** _(order 6)_
  - 다룰 내용: 행·컬럼·셀 — 색을 줄 단위를 상황에 맞게 고른다.
  - 키워드: Row Color, Column Color, Cell Color, info_fname, emphasize, ctab_fname
- **CH22-L07 · Stable Refresh와 표시 상태 보존** _(order 7)_
  - 다룰 내용: 갱신해도 스크롤·선택·정렬을 지킨다 — 사용자 흐름 보존.
  - 키워드: Stable Refresh, soft refresh, is_stable, refresh_table_display
- **CH22-L08 · 실습 — 매진 회차 색 강조** _(order 8)_
  - 다룰 내용: 콘서트앱 — 잔여석 계산을 셀 색으로(매진 빨강·임박 노랑).
  - 키워드: 실습, 콘서트앱, Cell Color, 매진, ctab_fname

### CH23 · CDS View Entity 기초 _(난이도: 고급)_

> DB 계층에서 모델링하고 재사용하고 싶다.

**키워드**: CDS, View Entity, Association, Annotation

**레슨 (7)**
- **CH23-L01 · CDS View Entity 기본 구조** _(order 1)_
  - 다룰 내용: DB 계층의 현대적 읽기 모델 — define view entity.
  - 키워드: CDS, View Entity, define view entity, DDL, Data Preview, Calculated Element, ZI_Flight
- **CH23-L02 · Interface View와 Consumption View 계층** _(order 2)_
  - 다룰 내용: 재사용 기반 뷰 위에 소비용 뷰를 쌓는다 — nesting(ZI_/ZC_).
  - 키워드: Interface View, Consumption View, ZI_, ZC_, as select from, Nesting
- **CH23-L03 · Association 기초** _(order 3)_
  - 다룰 내용: 뷰끼리 관계를 선언하고 경로로 따라간다 — Association.
  - 키워드: Association, _Perf, $projection, cardinality, CDS
- **CH23-L04 · Annotation과 의미 부여** _(order 4)_
  - 다룰 내용: 뷰·필드에 업무 의미를 단다 — @Annotation.
  - 키워드: Annotation, @EndUserText, @UI.lineItem, @Semantics
- **CH23-L05 · Metadata Extension 기초** _(order 5)_
  - 다룰 내용: UI 주석을 본문에서 분리한다 — annotate entity (DDLX).
  - 키워드: Metadata Extension, annotate entity, @Metadata.allowExtensions, @Metadata.layer
- **CH23-L06 · DCL / Authorization 개요** _(order 6)_
  - 다룰 내용: 누가 어떤 행을 볼 수 있나 — CDS 접근 제어(DCL).
  - 키워드: DCL, Access Control, define role, aspect pfcg_auth
- **CH23-L07 · 실습 — 콘서트 CDS 뷰 (ZI_/ZC_)** _(order 7)_
  - 다룰 내용: 콘서트앱 — 데이터 모델을 재사용 가능한 CDS 계층으로.
  - 키워드: 실습, 콘서트앱, CDS, ZI_Concert, ZC_Concert, Association

### CH24 · RAP / ABAP Cloud 입문 _(난이도: 고급)_

> 현대 SAP 표준 — 트랜잭션 앱을 RAP로 짓고 싶다.

**키워드**: RAP, Behavior Definition, ABAP Cloud, Fiori

**레슨 (9)**
- **CH24-L01 · RAP 아키텍처 개요** _(order 1)_
  - 다룰 내용: 현대 SAP 트랜잭션 앱의 표준 — RAP의 큰 그림.
  - 키워드: RAP, ABAP Cloud, managed, unmanaged, OData
- **CH24-L02 · Interface View ZI_* 설계 (Root)** _(order 2)_
  - 다룰 내용: RAP의 토대 — 트랜잭션 단위를 정하는 root Interface View.
  - 키워드: Interface View, root entity, define root view entity, RAP
- **CH24-L03 · Projection View ZC_* 설계** _(order 3)_
  - 다룰 내용: 서비스·화면에 노출할 소비용 뷰 — transactional projection.
  - 키워드: Projection View, ZC_, provider contract, transactional_query
- **CH24-L04 · Behavior Definition 기초** _(order 4)_
  - 다룰 내용: 무엇을 할 수 있나 — create·update·delete를 선언한다.
  - 키워드: Behavior Definition, BDEF, managed, create/update/delete, lock master
- **CH24-L05 · Behavior Implementation 기초** _(order 5)_
  - 다룰 내용: 동작의 실제 코드 — Behavior Pool과 집합 지향 handler.
  - 키워드: Behavior Implementation, BIMP, behavior pool, FOR VALIDATE ON SAVE, keys
- **CH24-L06 · Service Definition / Service Binding** _(order 6)_
  - 다룰 내용: 앱을 OData 서비스로 노출한다 — Definition + Binding.
  - 키워드: Service Definition, Service Binding, OData, expose, Fiori
- **CH24-L07 · Validation / Determination / Action 개요** _(order 7)_
  - 다룰 내용: 검증·자동결정·액션 — RAP의 비즈니스 로직 셋.
  - 키워드: Validation, Determination, Action, RAP
- **CH24-L08 · ABAP Cloud와 Released API 원칙** _(order 8)_
  - 다룰 내용: 클라우드 준비된 개발 — Released API·restricted scope·Clean Core.
  - 키워드: ABAP Cloud, Released API, Clean Core, ABAP for Cloud Development
- **CH24-L09 · 실습 — 예매 RAP 동작 구현** _(order 9)_
  - 다룰 내용: 콘서트 예매 RAP — 정원 validation·취소 action·상태 determination.
  - 키워드: 실습, 콘서트앱, RAP, Validation, Determination, Action

---

## TRACK-02 · ABAP 실무

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
