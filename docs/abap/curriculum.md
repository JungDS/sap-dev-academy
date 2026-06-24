# SAP Developer Academy — ABAP 커리큘럼 전체 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **목적** — 챕터·레슨 구조 전체를 한 파일로 최신화한 단일 소스. 구글 NotebookLM 등에 업로드해 챕터/레슨별 내용을 확보·전달하는 데 쓴다.
> 📊 트랙 2 · 챕터 35 · 레슨 194
> 🕒 생성: 2026-06-22T07:11:31.759Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

## TRACK-01 · ABAP 기초

불편을 먼저 겪고, 그 해결책으로 ABAP 기본기를 익힌다.

### CH01 · 개발 환경과 첫 프로그램 _(난이도: 입문)_

> 뭐라도 돌려보고 싶다 — SAP 개발 환경에 발을 들여 첫 프로그램을 화면에 출력하고, 그 결과물을 어디에 보관하는지($TMP → 패키지)까지 익힌다.

**학습 목표**
- SAPGUI로 시스템에 로그온하고 기본 화면 구성을 익힌다.
- T-code와 SE38(ABAP Editor)로 첫 프로그램을 생성·실행한다.
- 프로그램 기본 구조와 주석을 이해한다.
- WRITE로 문자열을 화면에 출력한다.
- WRITE의 폭·정렬·색·구분선으로 출력을 보기 좋게 다듬는다.
- 프로그램을 $TMP(Local)에 저장한 뒤, 개발 패키지와 이송요청의 필요를 이해한다.

**키워드**: SAPGUI, 로그온, T-code, SE38, REPORT, WRITE, 출력서식, 주석, $TMP, 개발 패키지, 이송요청

**레슨 (6)**
- **CH01-L01 · SAPGUI 로그온과 화면 구성** _(order 1)_
  - 다룰 내용: SAP 시스템에 접속해 개발을 시작할 환경을 연다.
  - 키워드: SAPGUI, 로그온, SAP Easy Access
- **CH01-L02 · T-code와 SE38 첫 실행** _(order 2)_ · T-code: `SE38`(신규)
  - 다룰 내용: 명령창과 SE38(ABAP Editor)로 첫 프로그램을 만들고 $TMP(Local Object)에 저장한다.
  - 키워드: T-code, SE38, ABAP Editor, $TMP, Local Object
- **CH01-L03 · 프로그램 구조와 주석** _(order 3)_
  - 다룰 내용: 프로그램의 기본 뼈대와, 코드에 설명을 남기는 법을 익힌다.
  - 키워드: REPORT, 주석, 문장 종결
- **CH01-L04 · WRITE로 문자열 출력** _(order 4)_ · T-code: `SE38`(복습)
  - 다룰 내용: 첫 출력 — WRITE로 화면에 글자를 찍고, 줄바꿈·체인·리터럴을 직접 실행해 구분한다.
  - 학습 목표: WRITE로 화면에 출력하고, /(줄바꿈)·콜론(:) 체인·문자 리터럴의 동작을 직접 실행해 구분한다.
  - 키워드: WRITE, 리터럴, 출력, 줄바꿈, REPORT
- **CH01-L05 · WRITE 심화 — 정렬·폭·색·구분선** _(order 5)_ · T-code: `SE38`(복습)
  - 다룰 내용: 출력을 보기 좋게 — 폭과 정렬로 칸을 맞추고, 색·구분선으로 강조한다.
  - 학습 목표: WRITE의 폭·정렬·색·강조·구분선 옵션으로 리스트 출력을 보기 좋게 다듬는다(classic 리스트 서식).
  - 키워드: WRITE, 정렬, COLOR, ULINE, SKIP, 출력서식
- **CH01-L06 · 개발 패키지와 이송요청 입문** _(order 6)_
  - 다룰 내용: $TMP의 한계를 넘어, 개발 객체를 패키지에 보관하고 이송요청으로 관리하는 첫걸음.
  - 키워드: 개발 패키지, $TMP, 이송요청, Transport Organizer, SE09

### CH02 · 변수와 표준 타입 (+ Local Type) _(난이도: 입문)_

> 값을 따옴표에 직접 적자니 바꾸기도 재사용도 불편하다 — 어딘가 담아 두고 싶다.

**키워드**: 변수, DATA, STRING, I, C, N, P, TYPES

**레슨 (4)**
- **CH02-L01 · 변수 선언(DATA)** _(order 1)_
  - 다룰 내용: 값을 담을 그릇 — DATA로 변수를 선언한다.
  - 키워드: DATA, 변수, TYPE
- **CH02-L02 · Complete 타입(STRING·I·F·D·T)** _(order 2)_
  - 다룰 내용: 길이를 따로 안 적어도 되는 완전한 표준 타입부터.
  - 키워드: STRING, I, F, D, T, Complete 타입
- **CH02-L03 · Incomplete 타입(C·N·P)** _(order 3)_
  - 다룰 내용: 길이(와 소수 자릿수)를 함께 지정해야 하는 타입.
  - 키워드: C, N, P, LENGTH, DECIMALS, Incomplete 타입
- **CH02-L04 · Local Type(TYPES) 재사용** _(order 4)_
  - 다룰 내용: 같은 타입 정의를 매번 반복하지 말고, TYPES로 이름 붙여 재사용한다.
  - 키워드: TYPES, Local Type, 재사용

### CH03 · DDIC Domain·Data Element + PARAMETERS _(난이도: 입문)_

> 프로그램마다 같은 타입을 또 정의… 전역으로 공유하고 싶다.

**키워드**: Domain, Data Element, DDIC, PARAMETERS, F4

**레슨 (3)**
- **CH03-L01 · Domain(얕게)** _(order 1)_ · T-code: `SE11`(신규)
  - 다룰 내용: 전역으로 — 타입의 기술 속성(타입·길이·대소문자·허용값)을 Domain에 한 번 정의하고, 저장 → 검사 → 활성화 흐름을 직접 체험한다.
  - 학습 목표: Domain의 속성(데이터 타입·길이·출력길이·소수·대소문자·허용값)을 이해하고, DDIC 객체는 활성화해야 런타임에 쓸 수 있음을 직접 체험한다.
  - 키워드: Domain, DDIC, SE11, 데이터타입, 값 테이블, 고정값, 활성화
- **CH03-L02 · Data Element(얕게)** _(order 2)_
  - 다룰 내용: Domain에 의미와 라벨을 입혀, 필드가 참조할 단위를 만든다.
  - 키워드: Data Element, Domain, 라벨, DDIC
- **CH03-L03 · PARAMETERS로 보상(F4·라벨)** _(order 3)_
  - 다룰 내용: DDIC의 수고가 화면에서 보상받는다 — PARAMETERS의 라벨·F4.
  - 키워드: PARAMETERS, F4, Data Element, Selection Screen

### CH04 · Structure (Local · DDIC) _(난이도: 초급)_

> 낱개 변수가 난립한다 — 관련된 값을 하나로 묶고 싶다.

**키워드**: Structure, BEGIN OF, DDIC Structure, MOVE-CORRESPONDING

**레슨 (3)**
- **CH04-L01 · Local Structure(BEGIN OF~END OF)** _(order 1)_
  - 다룰 내용: 관련된 값을 하나로 — BEGIN OF ~ END OF로 구조체를 만든다.
  - 키워드: Structure, BEGIN OF, END OF, Work Area, 컴포넌트
- **CH04-L02 · DDIC Structure** _(order 2)_
  - 다룰 내용: 구조체 모양도 전역으로 — SE11에서 DDIC Structure로 공유한다.
  - 키워드: DDIC Structure, SE11, Data Element, 구조체
- **CH04-L03 · 구조체 다루기** _(order 3)_
  - 다룰 내용: 구조체 복사·초기화·동일 이름 필드 옮기기(MOVE-CORRESPONDING).
  - 키워드: MOVE-CORRESPONDING, CLEAR, 구조체, Work Area

### CH05 · Internal Table _(난이도: 초급)_

> 한 건이 아니라 여러 건(레코드)을 다뤄야 한다.

**키워드**: Internal Table, Table Type, LOOP, READ, MODIFY, Deep Structure

**레슨 (4)**
- **CH05-L01 · Internal Table 기초** _(order 1)_
  - 다룰 내용: 같은 모양의 행을 여러 개 — 내부 테이블 선언과 행 추가.
  - 키워드: Internal Table, TYPE TABLE OF, APPEND, Work Area
- **CH05-L02 · Table Type(Local·DDIC)** _(order 2)_
  - 다룰 내용: 내부 테이블의 타입도 로컬 TYPES와 전역 DDIC Table Type으로.
  - 키워드: Table Type, TYPES, DDIC, STANDARD TABLE
- **CH05-L03 · LOOP·READ·MODIFY** _(order 3)_
  - 다룰 내용: 행을 순회·단건 조회·수정·삭제하는 핵심 동작.
  - 키워드: LOOP, READ TABLE, MODIFY, DELETE, sy-subrc
- **CH05-L04 · Deep Structure 개념** _(order 4)_
  - 다룰 내용: 구조 안에 내부 테이블/문자열이 든 'Deep' 구조 — 개념 소개.
  - 키워드: Deep Structure, 중첩, Internal Table

### CH06 · Transparent Table (SE11 · SE16N) _(난이도: 초급)_

> 프로그램이 끝나면 값이 사라진다 — 영속적으로 저장하고 싶다.

**키워드**: Transparent Table, SE11, SE16N, Key, 영속

**레슨 (2)**
- **CH06-L01 · Transparent Table 생성(SE11)** _(order 1)_
  - 다룰 내용: 값을 영구히 — DB에 1:1로 대응하는 투명 테이블을 만든다.
  - 키워드: Transparent Table, SE11, Key, MANDT, Data Element
- **CH06-L02 · 데이터 입력(SE16N)** _(order 2)_
  - 다룰 내용: 만든 테이블에 데이터를 넣고 확인한다(SE16N).
  - 키워드: SE16N, 데이터 입력, Transparent Table

### CH07 · Open SQL 기본 조회 _(난이도: 초급)_

> 저장한 데이터를 다시 읽어오고 싶다. (classic 구문)

**키워드**: Open SQL, SELECT, INTO TABLE, WHERE, SELECT SINGLE, classic

**레슨 (3)**
- **CH07-L01 · SELECT … INTO TABLE** _(order 1)_ · T-code: `SE16N`(신규)
  - 다룰 내용: 저장된 데이터를 다시 읽는다 — classic SELECT로 내부 테이블에 담고, 컬럼·조건을 직접 조합해 본다.
  - 학습 목표: classic SELECT로 DB 테이블의 행을 내부 테이블에 담고, 컬럼 선택(projection)·WHERE(selection)·sy-subrc를 직접 조합해 결과를 확인한다.
  - 키워드: Open SQL, SELECT, INTO TABLE, sy-subrc, classic
- **CH07-L02 · WHERE 조건(classic host 변수)** _(order 2)_
  - 다룰 내용: 조건에 맞는 행만 — classic WHERE와 host 변수.
  - 키워드: WHERE, host 변수, Open SQL, classic
- **CH07-L03 · SELECT SINGLE** _(order 3)_
  - 다룰 내용: 키로 딱 한 건 — SELECT SINGLE로 단건 조회.
  - 키워드: SELECT SINGLE, Work Area, sy-subrc, classic

### CH08 · DDIC 관계와 입력도움말(F4) _(난이도: 초급)_

> 아무 값이나 입력된다 — 올바른 값만 받도록 관계·검색도움말이 필요하다.

**키워드**: Foreign Key, Check Table, Search Help, F4

**레슨 (6)**
- **CH08-L01 · Foreign Key와 Check Table** _(order 1)_
  - 다룰 내용: 아무 값이나 막는다 — Foreign Key로 입력을 다른 테이블 값으로 제한.
  - 키워드: Foreign Key, Check Table, DDIC, 입력검증
- **CH08-L02 · Value Table과 Foreign Key의 차이** _(order 2)_
  - 다룰 내용: Domain의 Value Table은 '제안', Foreign Key는 '실제 관계'.
  - 키워드: Value Table, Foreign Key, Domain, Check Table
- **CH08-L03 · Elementary Search Help** _(order 3)_
  - 다룰 내용: F4 목록을 설계한다 — 단일 소스 Elementary Search Help.
  - 키워드: Search Help, Elementary, F4, SE11
- **CH08-L04 · Collective Search Help 기초** _(order 4)_
  - 다룰 내용: 여러 Elementary를 묶어 탭으로 — Collective Search Help.
  - 키워드: Collective Search Help, Elementary, F4
- **CH08-L05 · PARAMETERS와 DDIC F4 Help 연결** _(order 5)_
  - 다룰 내용: DDIC의 검증·F4가 PARAMETERS 화면으로 자동 연결되는 원리.
  - 키워드: PARAMETERS, F4, Search Help, Data Element
- **CH08-L06 · DDIC 검증과 프로그램 검증의 역할 분리** _(order 6)_
  - 다룰 내용: 선언적 DDIC 검증과 코드 검증의 경계 — 무엇을 어디서.
  - 키워드: 입력검증, DDIC, 비즈니스 로직, 역할 분리

### CH09 · 모듈화 기초 _(난이도: 초급)_

> 같은 코드가 여기저기 반복된다 — 묶어서 재사용하고 싶다.

**키워드**: FORM, PERFORM, Function Module, 모듈화

**레슨 (6)**
- **CH09-L01 · FORM / PERFORM 기본 호출** _(order 1)_
  - 다룰 내용: 반복 코드를 묶는 첫 도구 — 서브루틴(FORM/PERFORM).
  - 키워드: Subroutine, FORM, PERFORM, 모듈화
- **CH09-L02 · USING / CHANGING 파라미터** _(order 2)_
  - 다룰 내용: 서브루틴에 값을 주고(USING) 결과를 돌려받는다(CHANGING).
  - 키워드: USING, CHANGING, Subroutine, 파라미터
- **CH09-L03 · CALL FUNCTION 기본 구조** _(order 3)_
  - 다룰 내용: 여러 프로그램이 공유하는 재사용 단위 — Function Module.
  - 키워드: Function Module, CALL FUNCTION, SE37, EXPORTING, IMPORTING
- **CH09-L04 · Local Class 정의와 Method 호출** _(order 4)_
  - 다룰 내용: 현대 모듈화의 중심 — 로컬 클래스와 메서드(맛보기).
  - 키워드: Class, Method, 로컬 클래스, OO
- **CH09-L05 · Global Class 호출 기초** _(order 5)_
  - 다룰 내용: SE24의 전역 클래스를 가져다 쓰는 기초.
  - 키워드: Global Class, SE24, Method, 인스턴스
- **CH09-L06 · Subroutine / Function / Class 선택 기준** _(order 6)_
  - 다룰 내용: 셋 중 무엇을 — 상황별 모듈화 선택 기준.
  - 키워드: Subroutine, Function Module, Class, 모듈화

### CH10 · SALV 1차 (간단 ALV) _(난이도: 초급)_

> WRITE 리스트는 투박하다 — 표 형태로 깔끔하게 보고 싶다.

**키워드**: SALV, CL_SALV_TABLE, ALV

**레슨 (5)**
- **CH10-L01 · SALV의 목적과 CL_SALV_TABLE 개요** _(order 1)_
  - 다룰 내용: WRITE 리스트를 넘어 — 표 형태 출력 SALV(CL_SALV_TABLE).
  - 키워드: SALV, ALV, CL_SALV_TABLE
- **CH10-L02 · FACTORY 메서드로 Internal Table 출력** _(order 2)_ · T-code: `SE38`(복습)
  - 다룰 내용: factory 한 번으로 내부 테이블을 SALV 객체로 만들고, display로 띄우는 두 단계를 직접 체험한다.
  - 학습 목표: cl_salv_table=>factory( )로 내부 테이블을 ALV 객체로 만들고, factory(객체 생성)와 display(화면 표시)가 별개의 단계임을 직접 확인한다.
  - 키워드: SALV, factory, CL_SALV_TABLE, Internal Table, ALV
- **CH10-L03 · 기본 Function 표시와 Display 실행** _(order 3)_
  - 다룰 내용: 표준 툴바를 켜고 display로 화면에 띄운다.
  - 키워드: SALV, get_functions, set_all, display
- **CH10-L04 · Internal Table → SALV 미니 리포트** _(order 4)_
  - 다룰 내용: SELECT → SALV까지 한 프로그램으로 — 첫 표 리포트 완성.
  - 키워드: SALV, Open SQL, Internal Table, 미니 리포트
- **CH10-L05 · SALV 1차 범위와 심화 항목 분리** _(order 5)_
  - 다룰 내용: 지금 다루는 SALV의 범위와, 뒤로 미루는 심화의 경계.
  - 키워드: SALV, 범위, Grid ALV, 심화

### CH11 · SELECT-OPTIONS와 Range Table _(난이도: 중급)_

> 단일 값(PARAMETERS)만으론 부족 — 범위·다중 조건으로 조회하고 싶다.

**키워드**: SELECT-OPTIONS, Range Table, SIGN, OPTION

**레슨 (6)**
- **CH11-L01 · Range Table 구조** _(order 1)_
  - 다룰 내용: 범위·다중 조건을 담는 그릇 — Range Table의 4컬럼(SIGN/OPTION/LOW/HIGH).
  - 키워드: Range Table, SIGN, OPTION, LOW, HIGH
- **CH11-L02 · SELECT-OPTIONS 기본 문법** _(order 2)_
  - 다룰 내용: 화면에 범위·다중 입력칸을 만드는 SELECT-OPTIONS.
  - 키워드: SELECT-OPTIONS, Range Table, Selection Screen
- **CH11-L03 · WHERE … IN (classic range)** _(order 3)_
  - 다룰 내용: Range Table을 조회 조건으로 — classic WHERE … IN.
  - 키워드: WHERE, IN, Range Table, Open SQL, classic
- **CH11-L04 · Multiple Selection과 Include/Exclude** _(order 4)_
  - 다룰 내용: 다중 선택 팝업 — 여러 값·범위와 포함/제외(녹색/빨강).
  - 키워드: Multiple Selection, Include, Exclude, SIGN
- **CH11-L05 · EQ / BT / CP 옵션 이해** _(order 5)_
  - 다룰 내용: 비교 방식 OPTION 값 — EQ·BT·CP 등.
  - 키워드: OPTION, EQ, BT, CP, SIGN
- **CH11-L06 · Selection Table 직접 조작 기초** _(order 6)_
  - 다룰 내용: Range Table을 코드로 채우기 — 화면 없이 조건 구성.
  - 키워드: Range Table, APPEND, SIGN, OPTION

### CH12 · Open SQL 2차: JOIN·집계 _(난이도: 중급)_

> 여러 테이블을 한 번에, 집계까지 해서 보고 싶다. (classic 유지)

**키워드**: JOIN, INNER JOIN, 집계, GROUP BY, classic

**레슨 (7)**
- **CH12-L01 · INNER JOIN 기본 개념과 구현** _(order 1)_
  - 다룰 내용: 여러 테이블을 키로 합친다 — classic INNER JOIN.
  - 키워드: JOIN, INNER JOIN, Open SQL, classic
- **CH12-L02 · LEFT OUTER JOIN 기본 개념과 NULL 처리** _(order 2)_
  - 다룰 내용: 왼쪽은 모두 남긴다 — LEFT OUTER JOIN과 빈 값 처리.
  - 키워드: LEFT OUTER JOIN, , JOIN, classic
- **CH12-L03 · GROUP BY와 Aggregate** _(order 3)_
  - 다룰 내용: 묶어서 세고 합산한다 — GROUP BY와 집계 함수.
  - 키워드: GROUP BY, Aggregate, COUNT, SUM, classic
- **CH12-L04 · HAVING과 집계 조건** _(order 4)_
  - 다룰 내용: 집계 결과로 거른다 — WHERE와 다른 HAVING.
  - 키워드: HAVING, GROUP BY, Aggregate, classic
- **CH12-L05 · ORDER BY 정렬 조회** _(order 5)_
  - 다룰 내용: DB에서 정렬해 받는다 — ORDER BY.
  - 키워드: ORDER BY, Open SQL, 정렬, classic
- **CH12-L06 · FOR ALL ENTRIES 사용 기준** _(order 6)_
  - 다룰 내용: 내부 테이블을 조건으로 DB 조회 — FOR ALL ENTRIES의 함정과 규칙.
  - 키워드: FOR ALL ENTRIES, Open SQL, classic, 성능
- **CH12-L07 · JOIN / FAE / ABAP 처리 선택 기준** _(order 7)_
  - 다룰 내용: 합치기 방법 셋 — JOIN·FAE·ABAP 루프 중 무엇을.
  - 키워드: JOIN, FOR ALL ENTRIES, 성능, 선택 기준

### CH13 · Classic DDIC View·유지보수 객체 _(난이도: 중급)_

> 테이블을 더 보기 좋게 보여주고, 마스터데이터를 유지보수하고 싶다.

**키워드**: Database View, Maintenance View, Table Maintenance

**레슨 (6)**
- **CH13-L01 · Database View와 Open SQL JOIN 비교** _(order 1)_
  - 다룰 내용: JOIN을 DDIC에 박아 재사용 — Database View vs 코드 JOIN.
  - 키워드: Database View, JOIN, DDIC, SE11
- **CH13-L02 · Projection View 개념과 한계** _(order 2)_
  - 다룰 내용: 한 테이블의 일부 필드만 — Projection View와 그 한계.
  - 키워드: Projection View, DDIC, 필드 제한
- **CH13-L03 · Help View와 Search Help 연결** _(order 3)_
  - 다룰 내용: 여러 테이블에서 F4 값을 뽑는 소스 — Help View.
  - 키워드: Help View, Search Help, F4, DDIC
- **CH13-L04 · Maintenance View와 Foreign Key 관계** _(order 4)_
  - 다룰 내용: 관련 테이블을 함께 유지보수 — Maintenance View.
  - 키워드: Maintenance View, Foreign Key, 유지보수
- **CH13-L05 · Table Maintenance Generator / SM30** _(order 5)_
  - 다룰 내용: 테이블/뷰에 표준 유지보수 화면을 생성 — SM30로 운영.
  - 키워드: Table Maintenance Generator, SM30, 유지보수
- **CH13-L06 · Classic View와 CDS View Entity 비교 준비** _(order 6)_
  - 다룰 내용: 클래식 뷰의 한계와, 현대 CDS로의 다리(미리보기).
  - 키워드: Classic View, CDS, View Entity, 비교

### CH14 · Report Event·Selection Screen 심화 _(난이도: 중급)_

> 실행 흐름의 적절한 시점에 코드를 끼우고, 선택화면을 다듬고 싶다.

**키워드**: INITIALIZATION, AT SELECTION-SCREEN, START-OF-SELECTION

**레슨 (8)**
- **CH14-L01 · ABAP Report Event 전체 흐름** _(order 1)_ · T-code: `SE38`(복습)
  - 다룰 내용: 실행형 프로그램의 이벤트 순서 — 언제 무엇이 실행되나.
  - 키워드: Report Event, INITIALIZATION, START-OF-SELECTION, 흐름
- **CH14-L02 · INITIALIZATION 기본값 설정** _(order 2)_
  - 다룰 내용: 화면 뜨기 전 1회 — PARAMETERS/SELECT-OPTIONS 기본값.
  - 키워드: INITIALIZATION, PARAMETERS, SELECT-OPTIONS, 기본값
- **CH14-L03 · AT SELECTION-SCREEN OUTPUT 동적 화면 제어** _(order 3)_
  - 다룰 내용: 화면 그리기 직전(PBO) — 필드를 동적으로 숨김/잠금.
  - 키워드: AT SELECTION-SCREEN OUTPUT, LOOP AT SCREEN, PBO
- **CH14-L04 · AT SELECTION-SCREEN 입력 검증** _(order 4)_
  - 다룰 내용: 사용자가 실행할 때(PAI) — 입력값을 검증하고, 화면 전체로도 필드 하나로도 막는다.
  - 키워드: AT SELECTION-SCREEN, AT SELECTION-SCREEN ON, MESSAGE, 입력검증, PAI
- **CH14-L05 · START-OF-SELECTION 조회 실행** _(order 5)_
  - 다룰 내용: 본 처리의 자리 — 조회·가공을 여기서.
  - 키워드: START-OF-SELECTION, Open SQL, 본처리
- **CH14-L06 · END-OF-SELECTION 출력 마무리** _(order 6)_
  - 다룰 내용: 본 처리 후 마무리 — 출력·요약을 정리.
  - 키워드: END-OF-SELECTION, 출력, ALV
- **CH14-L07 · Selection Screen 권한/존재 여부 검증 기초** _(order 7)_
  - 다룰 내용: 입력 단계에서 권한과 존재를 확인하는 기초.
  - 키워드: AUTHORITY-CHECK, 입력검증, 권한, AT SELECTION-SCREEN
- **CH14-L08 · Selection Screen 고급 — 블록·그룹 검증과 커스텀 F1·F4** _(order 8)_
  - 다룰 내용: 필드 하나를 넘어 — 블록/라디오그룹 검증과, 코드로 직접 만드는 F1 도움말·F4 입력 도움.
  - 키워드: AT SELECTION-SCREEN ON, ON BLOCK, ON RADIOBUTTON GROUP, ON HELP-REQUEST, ON VALUE-REQUEST, F1, F4

### CH15 · Screen Programming / Dynpro 기초 _(난이도: 중급)_

> 표준 화면 말고 내가 설계한 입력 화면이 필요하다.

**키워드**: Dynpro, PBO, PAI, Screen Painter

**레슨 (7)**
- **CH15-L01 · Module Pool 프로그램 구조** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH15-L02 · Screen Number와 Screen Painter** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH15-L03 · Input Field / Text Field / Push Button** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH15-L04 · PBO 처리 흐름** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH15-L05 · PAI 처리 흐름** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH15-L06 · PF-STATUS와 TITLEBAR** _(order 6)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH15-L07 · Custom Control과 Container 개념** _(order 7)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH16 · Grid ALV 기초 _(난이도: 중급)_

> ALV를 화면에 박아 풍부하게 제어하고 싶다.

**키워드**: CL_GUI_ALV_GRID, Field Catalog, Layout, Variant

**레슨 (9)**
- **CH16-L01 · CL_GUI_CUSTOM_CONTAINER 생성** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH16-L02 · CL_GUI_ALV_GRID 생성** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH16-L03 · 출력용 Internal Table 준비** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH16-L04 · Field Catalog 기초** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH16-L05 · Layout 기본 설정** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH16-L06 · Variant 기본 설정** _(order 6)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH16-L07 · SET_TABLE_FOR_FIRST_DISPLAY** _(order 7)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH16-L08 · Refresh와 Stable Refresh 기초** _(order 8)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH16-L09 · 컬럼 색상과 행 색상 기초** _(order 9)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH17 · Modern ABAP Syntax _(난이도: 중급)_

> 장황한 고전 구문이 번거롭다 — 현대 ABAP으로 간결하게.

**키워드**: inline DATA, VALUE, FOR, string template, CORRESPONDING

**레슨 (6)**
- **CH17-L01 · Inline Declaration** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH17-L02 · VALUE Constructor Expression** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH17-L03 · CORRESPONDING과 구조 매핑** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH17-L04 · Table Expression** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH17-L05 · String Template과 내장 함수** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH17-L06 · Legacy 코드의 Modern ABAP 리팩터링** _(order 6)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH18 · New Open SQL / Modern ABAP SQL _(난이도: 중급)_

> 고전 Open SQL이 투박하다 — @·인라인으로 현대화. ★ 여기부터 modern SQL.

**키워드**: @, @DATA, 콤마 필드리스트, host 변수 escape

**레슨 (7)**
- **CH18-L01 · Classic Open SQL과 Modern ABAP SQL 비교** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH18-L02 · @ Host Variable과 Host Expression** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH18-L03 · INTO TABLE @DATA(...) Inline Target** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH18-L04 · SQL Expression: CASE / CAST / COALESCE** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH18-L05 · SQL String / Date Function** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH18-L06 · SELECT FROM @itab 기초** _(order 6)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH18-L07 · CDS로 넘어가기 전 ABAP SQL 정리** _(order 7)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH19 · OO ABAP 기본 설계 _(난이도: 고급)_

> 절차적 코드의 한계 — 객체로 구조화하고 싶다.

**키워드**: CLASS, METHOD, 인스턴스, 상속, 인터페이스

**레슨 (7)**
- **CH19-L01 · Global Class 생성과 구조** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH19-L02 · Attribute / Method / Visibility** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH19-L03 · Constructor와 객체 초기화** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH19-L04 · Static Method와 Instance Method** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH19-L05 · Interface 기본 설계** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH19-L06 · Exception Class 기초** _(order 6)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH19-L07 · Inheritance / Redefinition 맛보기** _(order 7)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH20 · SALV/Grid ALV 표시 제어 심화 _(난이도: 고급)_

> ALV 표시를 색·셀 단위까지 세밀하게 제어하고 싶다.

**키워드**: Cell Color, Hotspot, Event, Layout 심화

**레슨 (7)**
- **CH20-L01 · SALV Sort / Filter / Function 제어** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH20-L02 · SALV Layout / Variant 심화** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH20-L03 · Grid ALV Column 제어 심화** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH20-L04 · Deep Structure 기반 Cell Color** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH20-L05 · Deep Structure 기반 Cell Style** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH20-L06 · Row Color / Column Color / Cell Color 선택 기준** _(order 6)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH20-L07 · Stable Refresh와 표시 상태 보존** _(order 7)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH21 · CDS View Entity 기초 _(난이도: 고급)_

> DB 계층에서 모델링하고 재사용하고 싶다.

**키워드**: CDS, View Entity, Association, Annotation

**레슨 (6)**
- **CH21-L01 · CDS View Entity 기본 구조** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH21-L02 · Interface View와 Projection View 구분** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH21-L03 · Association 기초** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH21-L04 · Annotation과 의미 부여** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH21-L05 · Metadata Extension 기초** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH21-L06 · DCL / Authorization 개요** _(order 6)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH22 · RAP / ABAP Cloud 입문 _(난이도: 고급)_

> 현대 SAP 표준 — 트랜잭션 앱을 RAP로 짓고 싶다.

**키워드**: RAP, Behavior Definition, ABAP Cloud, Fiori

**레슨 (8)**
- **CH22-L01 · RAP 아키텍처 개요** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH22-L02 · Interface View ZI_* 설계** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH22-L03 · Projection View ZC_* 설계** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH22-L04 · Behavior Definition 기초** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH22-L05 · Behavior Implementation 기초** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH22-L06 · Service Definition / Service Binding** _(order 6)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH22-L07 · Validation / Determination / Action 개요** _(order 7)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH22-L08 · ABAP Cloud와 Released API 원칙** _(order 8)_
  - 다룰 내용: (골격 — 본문 작성 예정)

---

## TRACK-02 · ABAP 실무

현업 시나리오로 응용·고급 개발을 다룬다.

### CH23 · 실무 데이터 변경과 트랜잭션 제어 _(난이도: 중급)_

> 실제로 데이터를 바꾸고 커밋·롤백을 제어해야 한다.

**키워드**: INSERT, UPDATE, MODIFY, COMMIT WORK, LUW

**레슨 (5)**
- **CH23-L01 · INSERT / UPDATE / MODIFY / DELETE 실무 기준** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH23-L02 · COMMIT WORK / ROLLBACK WORK** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH23-L03 · DB LUW와 SAP LUW 차이** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH23-L04 · 오류 로그와 재처리 구조** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH23-L05 · 대량 변경 시 Package 처리** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH24 · Lock Object와 동시성 제어 _(난이도: 중급)_

> 여러 사용자가 동시에 같은 데이터를 건드린다 — 잠금이 필요하다.

**키워드**: Lock Object, ENQUEUE, DEQUEUE

**레슨 (5)**
- **CH24-L01 · Lock Object 설계 기준** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH24-L02 · ENQUEUE / DEQUEUE Function Module** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH24-L03 · Lock 해제와 예외 처리** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH24-L04 · 다중 사용자 변경 충돌 시나리오** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH24-L05 · Lock Object와 COMMIT/ROLLBACK 연결** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH25 · OO ABAP 고급 설계와 패턴 _(난이도: 고급)_

> 규모가 커진다 — OO 설계 패턴으로 다스리고 싶다.

**키워드**: 디자인 패턴, Factory, Singleton, 의존성

**레슨 (5)**
- **CH25-L01 · Factory Pattern** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH25-L02 · Singleton Pattern** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH25-L03 · Strategy Pattern** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH25-L04 · MVC 기반 Report 구조화** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH25-L05 · Testable Class 설계** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH26 · ALV 고급 Event 응용 _(난이도: 고급)_

> ALV에서 사용자 상호작용(이벤트)을 처리하고 싶다.

**키워드**: ALV Event, Double Click, Toolbar, User Command

**레슨 (5)**
- **CH26-L01 · Double Click Event** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH26-L02 · Hotspot Click Event** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH26-L03 · Toolbar Event** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH26-L04 · USER_COMMAND 처리** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH26-L05 · ALV Event Handler Class 설계** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH27 · Editable Grid ALV와 입력 검증 _(난이도: 고급)_

> ALV에서 직접 입력·수정하고 검증하고 싶다.

**키워드**: Editable ALV, Data Changed, 입력검증

**레슨 (6)**
- **CH27-L01 · Editable Field Catalog 설정** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH27-L02 · DATA_CHANGED Event** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH27-L03 · DATA_CHANGED_FINISHED Event** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH27-L04 · Cell Style 기반 입력 제어** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH27-L05 · Grid 입력값 검증과 오류 표시** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH27-L06 · 변경 데이터 DB 반영 전 검증** _(order 6)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH28 · Enhancement / BAdI / User Exit _(난이도: 고급)_

> 표준 기능을 건드리지 않고 확장하고 싶다.

**키워드**: BAdI, Enhancement, User Exit

**레슨 (5)**
- **CH28-L01 · Customer Exit / User Exit 개념** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH28-L02 · Enhancement Point / Section** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH28-L03 · BAdI 정의와 구현** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH28-L04 · Implicit / Explicit Enhancement 판단** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH28-L05 · Clean Core 관점의 확장 기준** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH29 · 인터페이스 실무: BAPI/RFC/BDC/File _(난이도: 고급)_

> 외부 시스템과 데이터를 주고받아야 한다.

**키워드**: BAPI, RFC, BDC, File, Excel

**레슨 (5)**
- **CH29-L01 · BAPI 호출과 Return 처리** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH29-L02 · RFC Function Module 설계** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH29-L03 · BDC / Batch Input 실무 기준** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH29-L04 · Excel Upload 처리** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH29-L05 · File Interface와 재처리** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH30 · IDoc / ALE / Gateway _(난이도: 고급)_

> 표준 메시지(IDoc)·게이트웨이로 시스템을 연계하고 싶다.

**키워드**: IDoc, ALE, Gateway, OData

**레슨 (5)**
- **CH30-L01 · IDoc 기본 구조** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH30-L02 · ALE Distribution Model** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH30-L03 · IDoc 오류 추적과 재처리** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH30-L04 · Gateway SEGW 프로젝트 구조** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH30-L05 · OData V2 EntitySet 조회 구현** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH31 · 성능 분석과 튜닝 _(난이도: 고급)_

> 느리다 — 어디가 병목인지 찾아 튜닝하고 싶다.

**키워드**: SAT, ST05, SQL Trace, 성능

**레슨 (5)**
- **CH31-L01 · ST05 SQL Trace** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH31-L02 · SAT Runtime Analysis** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH31-L03 · SQL Monitor / SQLM** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH31-L04 · SELECT in LOOP 제거** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH31-L05 · 대량 데이터 처리와 Package 설계** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH32 · AMDP / ADBC / Pushdown _(난이도: 고급)_

> DB 가까이에서 연산을 밀어넣어 가속하고 싶다.

**키워드**: AMDP, ADBC, Code Pushdown, HANA

**레슨 (5)**
- **CH32-L01 · DB Pushdown 판단 기준** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH32-L02 · AMDP 기본 구조** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH32-L03 · ADBC Native SQL** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH32-L04 · AMDP와 CDS/Open SQL 비교** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH32-L05 · 운영 리스크와 DB 종속성** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH33 · Forms / Output / PDF _(난이도: 중급)_

> 출력 양식(PDF·폼)을 만들어야 한다.

**키워드**: SmartForms, Adobe Form, SAPscript, Output

**레슨 (5)**
- **CH33-L01 · Smart Forms 기본 구조** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH33-L02 · Adobe Forms 기본 구조** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH33-L03 · Output Control 개요** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH33-L04 · PDF 생성과 다운로드** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH33-L05 · 양식 오류 추적과 변경 대응** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH34 · 운영 품질과 배포 관리 (이송 심화) _(난이도: 고급)_

> 개발물을 안전하게 운영으로 배포·관리해야 한다. (CH01-L05 이송요청의 2단 심화)

**키워드**: Transport, Release, Import, CTS, Code Inspector

**레슨 (5)**
- **CH34-L01 · ATC / Code Inspector** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH34-L02 · ABAP Unit과 회귀 방지** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH34-L03 · Transport 관리** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH34-L04 · Background Job 운영** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH34-L05 · Application Log와 오류 추적** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH35 · RAP + Fiori 실무 Capstone _(난이도: 고급)_

> 배운 걸 모아 RAP+Fiori로 실전 앱을 완성한다.

**키워드**: RAP, Fiori, Capstone, Full-Stack

**레슨 (7)**
- **CH35-L01 · Capstone 업무 시나리오 정의** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH35-L02 · ZI_* Interface View 설계** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH35-L03 · ZC_* Projection View 설계** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH35-L04 · Behavior Definition / Implementation** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH35-L05 · Action / Validation / Determination 구현** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH35-L06 · Service Binding과 Fiori Elements 테스트** _(order 6)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH35-L07 · Authorization / Draft / 운영 고려사항** _(order 7)_
  - 다룰 내용: (골격 — 본문 작성 예정)

---
