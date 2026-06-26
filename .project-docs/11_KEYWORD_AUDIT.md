# 11. KEYWORD AUDIT — 공식 ABAP Keyword Doc 대비 콘텐츠 감사 원장

> 📅 최종수정: 2026-06-26 19:02 KST
> 🎯 **목적:** `content/abap/**` 레슨을 **SAP 공식 ABAP Keyword Documentation 오프라인 전체본**(`C:\ABAP_DOCU_HTML`, AS ABAP Release 758)과 대조해 키워드·문법·이론의 **누락/상이/오류**를 보강. 챕터 순서대로.
> 📖 **읽을 때:** 감사 패스 **재개 시**(이어서 진행) — 이 원장이 어디까지 했는지의 단일 출처.

## 기준 (사용자 합의 2026-06-23)
- 비교 단위 = 레슨의 `introduces`/`prereq` 범위. **"정확성 + 같은 주제의 빠진 classic 하위옵션·관련문"** 까지 보강.
- **항목마다 R6/R15 게이팅 재판단** — modern(New Syntax CH18+ / New Open SQL CH19+)·미래 개념은 **여전히 제외**. classic 범위만.
- **불일치 ≠ 항상 공식 쪽 수정**: classic-first(R6)는 의도된 단순화 — 버그 아님.
- SAP 본문/코드 **verbatim 사용 허용**(SAP Korea 주관 강의 — 저작권 제약 없음). 단 입문자 가독성(R3) 유지: 예제 코드는 원문 그대로, 어려운 본문은 입문 톤으로 각색([04 R3]).
- 리듬: **챕터 단위**(findings 표 + diff → 승인 → 다음). 작업 단위는 레슨 1개([01]).

## 방법 (레슨 1개)
1. 레슨 MD + front-matter(`introduces`/`prereq`) 읽기.
2. `introduces` 개념의 공식 glosry/키워드 페이지 추출(`C:\ABAP_DOCU_HTML`에서 grep, [메모리 abap-keyword-doc-links]).
3. 대조: ① 사실오류 ② 폐기/개명 용어(Open SQL→ABAP SQL 등) ③ 공식 Note/Caution 치명 함정 ④ 코드 문법 ⑤ `introduces`↔본문 일치 ⑥ 같은 주제의 빠진 classic 하위옵션.
4. 게이팅 통과분만 보강. `npm run build:abap`(parity 0)·렌더 검증.

## 진행 현황
| 챕터 | 상태 | 핵심 |
|---|---|---|
| CH01 | ✅ 완료 | L05 `introduces`↔본문 불일치 교정 |
| CH02 | ✅ 완료 | L01 `DATA … VALUE` 초기값 보강 |
| CH03 | ✅ 완료 | 변경 없음 — 공식과 일치 |
| CH04 | ✅ 완료 | DIV/MOD 연산자 재배치(L02→L01) |
| CH05 | ✅ 완료 | 변경 없음 — 공식과 일치 |
| CH06 | ✅ 완료 | L03 READ INDEX·L04 LOOP FROM/TO 보강 |
| CH07 | ✅ 완료 | 변경 없음 — 공식과 일치 |
| CH08 | ✅ 완료 | 변경 없음 — classic 경계 정확 |
| CH09 | ✅ 완료 | 변경 없음 — 공식과 일치 |
| CH10 | ✅ 완료 | L03 CALL FUNCTION `CHANGING` 보강 |
| CH11 | ✅ 완료 | 변경 없음 — 공식과 일치 |
| CH12 | ✅ 완료 | L06 RANGES(레거시) 대비 보강 |
| CH13 | ✅ 완료 | L03 SELECT DISTINCT 보강 |
| CH14 | ✅ 완료 | 변경 없음 — 공식과 일치 |
| CH15 | ✅ 완료 | 변경 없음 — 공식과 일치(매우 충실) |
| CH16 | ✅ 완료 | 변경 없음 — 공식과 일치 |
| CH17 | ✅ 완료 | 변경 없음 — 공식과 일치(classic) |
| CH18 | ✅ 완료 | L02에 `VALUE #( FOR )` 정식 도입(누락 보강) · CONV/COND/SWITCH/REDUCE는 미사용이라 보류 |
| CH19 | ✅ 완료 | 변경 없음 — 공식과 일치(modern SQL) |
| CH20 | ✅ 완료 | 변경 없음 — 공식과 일치(매우 충실) |
| CH21 | ✅ 완료 | 변경 없음 — 공식 ALV API와 일치 |
| CH22 | ✅ 완료 | L04 잘못된 @Semantics 자기참조 예시 교정 |
| CH23 | ✅ 완료 | 변경 없음 — 공식 RAP BDL/EML과 일치 |
| CH24 | ✅ 완료 | 변경 없음 — 공식과 일치 |
| CH25 | ✅ 완료 | 변경 없음 — 공식과 일치 |
| CH26 | ✅ 완료 | L01 미학습 `COND`→`CASE` 게이팅 교정(CH18 갭 연계) |
| CH27 | ✅ 완료 | 변경 없음 — 공식 ALV 이벤트 API와 일치 |
| CH28 | ✅ 완료 | L04 미학습 `COND`→`IF` 게이팅 교정(CH18 갭 연계) |
| CH29 | ✅ 완료 | 변경 없음 — 공식과 일치 |
| CH30 | ✅ 완료 | L02 RFC `MESSAGE`·L03 BDC `OPTIONS FROM`·L05 OPEN DATASET 보안/MESSAGE/TRANSFER 보강 |
| CH31 | ✅ 완료 | 변경 없음 — IDoc/ALE/Gateway 툴링(doc 밖)·L05 modern SQL 절순서/OFFSET 정확 |
| CH32 | ✅ 완료 | 변경 없음 — 성능툴(doc 밖)·L04 FAE/L05 Pushdown modern SQL 정확 |
| CH33 | ✅ 완료 | L02 AMDP `OPTIONS READ-ONLY` 보강·L03 ADBC 등 정확 |
| CH34 | ✅ 완료 | 변경 없음 — 양식 도구(doc 밖)·L04 XSTRING/xstrlen/동적 CALL FUNCTION 정확 |
| CH35 | ✅ 완료 | L04 `SUBMIT VIA JOB`에 필수 `AND RETURN` 보강(나머지 운영툴은 doc 밖) |
| CH36 | ✅ 완료 | L05 실무 정석 `VALUE #( FOR )` 유지 — 누락 문법을 CH18-L02에 도입해 해소(사용자 결정) |

> ✅ **CH01~CH36 전 챕터 감사 완료 (2026-06-24).** 요약은 아래 "감사 완료 총평" 참조.

## 챕터별 findings

### CH01 — 개발 환경과 첫 프로그램
- **L01/L02/L06/L07**: GUI·툴링(로그온·SE38·T-code·$TMP·패키지·SE93) — keyword doc 영역 밖 → 감사 N/A.
- **L03**(REPORT·주석·마침표): 공식과 일치 ✓ — 주석 `*`=컬럼1 / `"`=인라인, 마침표 종결, 키워드 대소문자 무시 모두 정확.
- **L04**(WRITE·`/`·콜론 체인·리터럴): 정확 ✓ — `NEW-LINE` 언급 포함.
- **L05**(WRITE 서식): **`introduces`↔본문 불일치 교정** —
  - ➕ 추가: `FORMAT`(색을 여러 줄에 set-once → `FORMAT RESET`), `CURRENCY`(통화별 소수 자리) — 선언됐으나 본문 누락이던 것.
  - ➖ 트림: `EDIT MASK`(정확 구문 `USING EDIT MASK` — CH01엔 niche, 도입 보류), `WRITE TO`(홈 = CH04-L02, R15 중복 제거) → `introduces`에서 제외.

### CH02 — 변수·표준 타입·상수·Text Symbol
- **L01**(DATA·TYPE·LIKE): 정확 ✓ — **보강 1건**: `DATA … VALUE`(선언 초기값)가 CH02-L03·CH04-L01에서 *쓰이는데 도입이 없어* → L01에 정식 추가(공식 `DATA var TYPE … [VALUE val]`, 미지정 시 타입 기본값).
- **L02**(Complete STRING·I·F·D·T)·**L03**(Incomplete C·N·P·offset): 정확 ✓ — `X`(hex)·`int8`·`decfloat`는 게이팅상 의도적 생략(타당). 정수 반올림·`P` 금액 경고 정확.
- **L04**(TYPES)·**L05**(CONSTANTS·abap_true/false)·**L06**(Text Symbol `TEXT-001` vs `'…'(001)`): 정확 ✓.
- ⚠️ 메타 갭(감사 범위 밖, 별도 처리 권장): L01~L04 front-matter에 `introduces`/`prereq` 없음. CH02-L01은 코드블록 다수인데 `::embed` 없음(R2).

### CH03 — DDIC Domain·Data Element + PARAMETERS  → **변경 없음(공식과 일치)**
- **L01**(Domain): 정확 ✓ — DDIC 타입 매핑(CHAR→c·NUMC→n·DEC→p·INT4→i·DATS→d), 출력길이·대소문자·고정값/값테이블, "Domain은 변수 타입 직접 불가·활성화 철칙" 모두 공식과 일치.
- **L02**(Data Element): 정확 ✓ — "Domain 없이도 가능(직접 타입)"이 공식과 일치(글로서리보다 본문이 더 정밀).
- **L03**(PARAMETERS): 정확 ✓ — OBLIGATORY·DEFAULT·LOWER CASE. `AS CHECKBOX`·`RADIOBUTTON` 등은 **CH15-L09(Selection Screen UI) 소유** → 게이팅상 여기 추가 안 함(의도된 단순 스코프). *(소유 챕터 오기 교정: CH13→CH15-L09.)*

### CH04 — 연산자와 흐름 제어
- **L01**(산술): 베이스라인서 우선순위·괄호·0나눗셈 보강 + **이번에 `DIV`/`MOD` 연산자 도입**(L02서 이전).
- **L02**(문자열): DIV/MOD를 "내장함수"에서 제외(연산자라 L01 소유) — CONCATENATE/&&/SPLIT/FIND/REPLACE/CONDENSE 등 정확 ✓.
- **L03**(IF): 정확 ✓ — 비교연산자 기호/영문, AND/OR/NOT·괄호, IS INITIAL, boolean 부재(C1·abap_true/false·XSDBOOL/BOOLC) 모두 공식과 일치.
- **L04**(CASE)·**L05**(DO/WHILE·EXIT/CONTINUE/CHECK·SY 변수)·**L06**(디버거 BREAK-POINT·/h·F5~F8·WATCH POINT): 정확 ✓.

### CH05 — Structure (Local · DDIC)  → **변경 없음(공식과 일치)**
- **L01**(Local `BEGIN OF/END OF`·Work Area·`-` 접근)·**L02**(DDIC Structure)·**L03**(`=` 통째 대입·CLEAR·MOVE-CORRESPONDING)·**L04**(캡스톤): 정확 ✓.
- modern `CORRESPONDING #( )`는 New Syntax(CH18+)라 의도적 미노출 — 게이팅 준수. 중첩 구조·INCLUDE는 입문 스코프상 생략(타당).

### CH06 — Internal Table
- **L01**(TYPE TABLE OF·APPEND·CLEAR/REFRESH/FREE·헤더라인 경고)·**L02**(Line Type·Key·STANDARD/SORTED/HASHED·Index Table)·**L05**(Deep)·**L06**(캡스톤): 정확 ✓ — 매우 충실.
- **L03**(단일행): **보강** `READ TABLE … INDEX n`(번호로 행 읽기) 추가 — 기본 classic 접근인데 누락이던 것. (APPEND/INSERT·WITH KEY/TABLE KEY·BINARY SEARCH·MODIFY·TRANSPORTING·DELETE는 정확.)
- **L04**(집단행): **보강** `LOOP … FROM n TO m`(번호 범위) 추가 — introduces가 `LOOP(FROM/TO·WHERE)` 선언·본문도 "조건·범위"라 했으나 범위 코드 누락이던 갭. (ASSIGNING `<fs>`·COLLECT·컨트롤레벨·DELETE ADJACENT DUPLICATES·DESCRIBE 정확.)

### CH07 — Transparent Table (SE11)  → **변경 없음(공식과 일치)**
- **L01**(생성·Key·MANDT·Delivery Class A·Data Element vs Built-In)·**L02**(Create Entries·Table Contents)·**L03**(Structure/Internal/Transparent 비교): 정확 ✓.
- pooled/cluster(폐기)·버퍼링 등은 입문 스코프상 생략(타당). 투명 테이블=DB 물리 테이블 1:1 정의 공식과 일치.

### CH08 — Open SQL 기본 조회 (classic)  → **변경 없음(공식과 일치)**
- **L01**(데모 SCARR/SPFLI/SFLIGHT·client 자동 종속)~**L07**(sy-subrc 분기·MESSAGE 맛보기): 정확 ✓ — classic 공백구분(콤마 ✕) 경계 철저.
- SELECT SINGLE/INTO TABLE/ENDSELECT/UP TO·INTO 형태(wa·(v1,v2)·CORRESPONDING·APPENDING)·WHERE(BETWEEN/LIKE/IN/IS NULL)·키vs인덱스 정확.
- `ORDER BY`·`DISTINCT`·`GROUP BY`·`INNER JOIN`은 **CH13으로 의도 배치**(grep 확인) → CH08 생략은 설계대로(갭 아님). modern escape(`@`)는 CH19.

### CH09 — DDIC 관계와 입력도움말(F4)  → **변경 없음(공식과 일치)**
- **L01**(Foreign Key·Check Table)·**L02**(Value Table↔FK 구분·ALPHA 변환루틴)·**L03**(Elementary Search Help·IMP/EXP/LPos/SPos)·**L04**(Collective)·**L05**(`MATCHCODE OBJECT`·F4 3경로)·**L06**(DDIC검증 vs 코드검증: FK는 화면레벨·직접 INSERT 미적용)·**L07**(콘서트 모델 실습): 정확 ✓.
- Search Help는 DDIC 툴이라 keyword doc 직접 항목 적음 — 개념(FK/Check Table/Value Table)은 글로서리 검증분과 일치.

### CH10 — 모듈화 기초
- **L01**(FORM/PERFORM·**obsolete 명시**)·**L02**(USING/CHANGING·by Value/Ref/Value-Result·RETURN·STATICS)·**L04**(Local Class·CLASS-METHODS·`=>`)·**L05**(Global Class 정적호출·[선행사용])·**L06**(선택기준)·**L07**(실습): 정확 ✓ — subroutine=obsolete 공식과 일치, OO 본격은 CH20 유보(게이팅).
- **L03**(CALL FUNCTION): **보강** `CHANGING`(입출력) 파라미터 종류 추가 — EXPORTING/IMPORTING/TABLES/EXCEPTIONS만 있어 빠졌던 표준 파라미터(introduces도 갱신).

### CH11 — SALV 1차 (간단 ALV)  → **변경 없음(공식과 일치)**
- **L01~L06**(`cl_salv_table=>factory`·`get_functions()->set_all`·`display`·`cx_salv_msg` TRY/CATCH·Data Element 라벨 자동·미니 리포트·실습): 정확 ✓ — SALV API 공식과 일치.
- 의도적 최소 스코프(읽기전용+표준기능). 심화(컬럼/색/이벤트/편집)는 CH17/21/27/28로 **명시 분리**(L05) → 추가 보강은 R15 위반이라 안 함. `REF TO`/`TRY`는 `[선행 사용]`로 CH20 게이팅 준수.

### CH12 — SELECT-OPTIONS와 Range Table
- **L01**(4컬럼 SIGN/OPTION/LOW/HIGH)·**L02**(`SELECT-OPTIONS … FOR`·TABLES)·**L03**(`WHERE … IN` classic)·**L04**(Include/Exclude I/E)·**L05**(OPTION EQ/BT/CP… · **CP 와일드카드 `*`/`+`**가 LIKE `%`/`_`와 구분 — 정확)·**L07**(실습): 정확 ✓.
- **L06**(코드 직접 조작): **보강** 레거시 `RANGES r FOR field.`(헤더라인식) 한 줄 대비 추가 — introduces가 RANGES 선언했으나 본문 부재이던 갭(현재식은 `TYPE RANGE OF`).

### CH13 — Open SQL 2차: JOIN·집계 (classic)
- **L01**(INNER JOIN·`~`·AS·ON·카테시안 경고)·**L02**(LEFT OUTER JOIN·NULL→초기값)·**L04**(HAVING·절 순서)·**L05**(ORDER BY·PRIMARY KEY·vs SORT)·**L06**(FAE·IS NOT INITIAL 필수·중복 자동제거)·**L07**(JOIN/FAE/ABAP 선택·LOOP+SELECT 안티패턴)·**L08**(실습): 정확 ✓ — classic 경계 철저.
- **L03**(GROUP BY·집계): **보강** `SELECT DISTINCT`(중복 행 제거) 추가 — introduces가 DISTINCT 선언했으나 본문 부재이던 갭. (COUNT/SUM/MIN/MAX/AVG·비집계컬럼 규칙은 정확.)

### CH14 — Classic DDIC View·유지보수 객체  → **변경 없음(공식과 일치)**
- **L01**(Database View)·**L02**(Projection View·한계)·**L03**(Help View)·**L04**(Maintenance View)·**L05**(TMG/SM30)·**L06**(SE16N·운영편집 주의)·**L07**(Classic↔CDS 전환 미리보기)·**L08**(실습): 정확 ✓.
- DDIC 툴 영역이라 keyword doc 직접 비교 항목 적음. classic 뷰 폐기 흐름은 L07이 "신규=CDS·유지보수 뷰는 유효"로 균형있게 처리 — 과도한 obsolete 플래그 불필요. CDS 본격은 CH22 게이팅.

### CH15 — Report Event·Selection Screen 심화  → **변경 없음(공식과 일치, 매우 충실)**
- **L01~L10**(전 10레슨): Report Event 흐름(LOAD-OF-PROGRAM·INITIALIZATION·AT SELECTION-SCREEN OUTPUT(PBO)·AT SELECTION-SCREEN(PAI)·START/END-OF-SELECTION), LOOP AT SCREEN·MODIFY SCREEN, AT SELECTION-SCREEN ON(전체vs필드·오류시 동작 차이), **MESSAGE 6타입(I/S/W/E/A/X)·메시지클래스 SE91·`&1~&4`**, AUTHORITY-CHECK, ON BLOCK/RADIOBUTTON GROUP/HELP·VALUE-REQUEST, SELECTION-SCREEN UI(BLOCK·COMMENT·ULINE·SKIP·AS CHECKBOX·RADIOBUTTON GROUP·PUSHBUTTON·TABBED BLOCK·FUNCTION KEY·SSCRFIELDS) — 전부 공식과 일치 ✓.
- ⚠️ 글롭 주의: `CHxx-L0*`는 L10 누락(이 챕터 10레슨) → 이후 `CHxx-L*` 사용.

### CH16 — Screen Programming / Dynpro 기초  → **변경 없음(공식과 일치)**
- **L01~L08**: Module Pool(T-code 필수)·PBO/PAI·Flow Logic(`PROCESS BEFORE OUTPUT`/`AFTER INPUT`·MODULE)·화면요소·OK_CODE/SY-UCOMM·`CLEAR ok_code`·LEAVE TO SCREEN 0/LEAVE PROGRAM/LEAVE SCREEN·SET PF-STATUS/TITLEBAR/EXCLUDING·LOOP AT SCREEN(screen-input/invisible·MODIFY SCREEN)·Custom Container(`cl_gui_custom_container`·CREATE OBJECT)·Tabstrip/Subscreen 전부 공식과 일치 ✓.
- Table Control·CALL SCREEN(다중화면 네비)은 의도적 스코프 제외(화면 표는 ALV로 대체 명시 — CH17). `REF TO`/`CREATE OBJECT`는 `[선행 사용]`로 CH20 게이팅 준수.

### CH17 — Grid ALV 기초 (classic)  → **변경 없음(공식과 일치)**
- **L01~L10**: `CL_GUI_CUSTOM_CONTAINER`·`CL_GUI_ALV_GRID`(CREATE OBJECT·i_parent), Field Catalog(`LVC_T_FCAT`·`LVC_FIELDCATALOG_MERGE`·coltext/outputlen), Layout(`LVC_S_LAYO`·zebra/sel_mode/cwidth_opt), Variant(`DISVARIANT`·sy-repid·i_save), `set_table_for_first_display`·`refresh_table_display`+Stable(`LVC_S_STBL`), 행색상(`info_fname`·`Cxyz`) 전부 공식 API와 일치 ✓.
- classic `CREATE OBJECT` 유지(NEW=CH18+). 셀색/이벤트/편집은 CH21/27/28 분리, `do_sum`은 CH21 맛보기. `REF TO`는 `[선행 사용]` CH20 게이팅.

### CH18 — Modern ABAP Syntax  → **문법 정확 · `VALUE #( FOR )` 누락 보강(2026-06-24 사용자 결정)**
- **L01~L07**: `DATA()`/`FINAL()` 인라인·`VALUE #()`/BASE·`CORRESPONDING #()`/MAPPING/EXCEPT·Table Expression `lt[ ]`(`CX_SY_ITAB_LINE_NOT_FOUND`·`line_exists()`/`line_index()`)·String Template `|{ }|`·서식·함수형 문자열함수·`+= -= *= /=` 전부 공식과 일치 ✓. SELECT 인라인(@)은 CH19 유보(정확).
- **L02 보강**: `VALUE #( FOR … )`(table comprehension)를 정식 도입 — ① 숫자범위 `FOR i = 1 WHILE i <= 9 ( … )`(구구단 전체 생성으로 기존 예제와 연결) ② 테이블순회 `FOR line IN lt_gugu ( … )`(변환). FOR 변수 수명 주의 포함. chapter keywords에 이미 `FOR`가 선언돼 있었으나 본문 부재이던 갭을 메움. CH36-L05의 RAP `VALUE #( FOR )`가 이제 학습분 위에서 동작.
- 남은 `CONV`/`SWITCH`/`REDUCE`/`FILTER`/`COND`(constructor)는 현재 **사용처 없음**(grep 0; CH26/28은 CASE/IF) → 도입 보류(필요 시 확장 단계). `check/CH18.md` 참조.

### CH19 — New Open SQL / Modern ABAP SQL  → **변경 없음(공식과 일치)**
- **L01~L08**: 콤마 필드·`@` host var/`@( )` host expr·strict·`@DATA()` 인라인 대상·SQL식(CASE/CAST/COALESCE)·SQL 문자/날짜 함수(CONCAT/SUBSTRING/UPPER/`DATS_ADD_DAYS`)·`SELECT FROM @itab` 전부 공식과 일치 ✓. "ABAP SQL" 현행 명칭 사용 정확.
- `CAST( x AS CHAR )`는 공식 `CHAR [ ( len ) ]`(길이 선택)이라 유효(오류 아님). 고급 SQL(UNION/서브쿼리/윈도우)은 입문 스코프 외(합리적).

### CH20 — OO ABAP 기본 설계  → **변경 없음(공식과 일치, 매우 충실)**
- **L01~L10**: Global Class(DEFINITION/IMPLEMENTATION·NEW/CREATE OBJECT)·Attribute/Method/Visibility(DATA vs CLASS-DATA)·CONSTRUCTOR/CLASS_CONSTRUCTOR·Static/Instance(`=>`/`->`·me->)·INTERFACE/INTERFACES(`~`)·예외(TRY/CATCH/CLEANUP·RAISE EXCEPTION·CX_STATIC/DYNAMIC/NO_CHECK·CX_ROOT·get_text·RESUME)·Inheritance(INHERITING FROM·REDEFINITION·super->·ABSTRACT/FINAL)·다형성(CAST/`?=`·CX_SY_MOVE_CAST_ERROR·CASE TYPE OF)·OO 이벤트(EVENTS/RAISE EVENT/SET HANDLER) 전부 공식과 일치 ✓.
- 앞 챕터 `[선행 사용]`(REF TO/CREATE OBJECT/TRY)이 여기서 정식 도입 — 게이팅 정합. ALIASES·FRIENDS·CREATE PRIVATE 등 고급은 "기본 설계" 스코프 외(합리적).

### CH21 — SALV/Grid ALV 표시 제어 심화  → **변경 없음(공식과 일치)**
- **L01~L08**: SALV(`get_functions/get_sorts(add_sort)/get_filters`·`get_display_settings/get_columns/get_layout`)·Field Catalog 속성(`no_out/do_sum/just/key/edit`)·Cell Color(`LVC_T_SCOL`·`ctab_fname`·`col_negative/col_total`)·Cell Style(`LVC_T_STYL`·`stylefname`·`mc_style_disabled/enabled/button`)·색 단위(`info_fname`/`emphasize`/`ctab_fname`)·Stable/Soft Refresh 전부 공식 ALV API와 일치 ✓.
- 이벤트→CH27·편집→CH28로 분리(정확). modern(VALUE/FIELD-SYMBOL 인라인) 적절.

### CH22 — CDS View Entity 기초
- **L01~L07**: `define view entity … as select from`·`as projection on`(ZI_/ZC_)·`association [0..*] … on $projection.…`·Annotation(`@EndUserText/@UI.lineItem/@AccessControl`)·Metadata Extension(`annotate entity … with`·`@Metadata.layer`)·DCL(`define role … grant select … aspect pfcg_auth`) 전부 공식 CDS DDL/DCL과 일치 ✓.
- **L04**: **교정** `@Semantics.quantity.unitOfMeasure: 'CAPACITY'`를 정수 `capacity`에 자기참조로 단 예시 제거(단위 필드 참조 필수 → 그대로면 활성화 실패) + "수량/금액 의미는 단위·통화 짝 필드 필요" 설명 보강.

### CH23 — RAP / ABAP Cloud 입문  → **변경 없음(공식 RAP BDL/EML과 일치)**
- **L01~L09**: RAP 계층·managed/unmanaged·`define root view entity`·`provider contract transactional_query`·BDEF(`managed implementation in class … unique`·`persistent table … lock master`·create/update/delete·`field ( readonly )`·mapping)·Behavior Pool(`cl_abap_behavior_handler`·`FOR VALIDATE ON SAVE IMPORTING keys FOR …`)·Service Def/Binding(`define service … expose`)·Validation/Determination/Action(`validation … on save`·`determination … on modify`·`action … result [1] $self`)·EML(`READ ENTITIES … IN LOCAL MODE … WITH CORRESPONDING #( keys ) RESULT`·failed/reported)·ABAP Cloud/Released API/Clean Core 전부 공식과 일치 ✓.
- Track-1(CH01~23) 완료. CH24+ = Track-2 실무 디테일.

### CH24 — 실무 데이터 변경과 트랜잭션 제어 (Track-2)  → **변경 없음(공식과 일치)**
- **L01~L05**: DML(`INSERT/UPDATE SET/MODIFY upsert/DELETE`·`FROM TABLE @itab`·감사필드·**표준테이블 직접 DML 금지→BAPI**)·COMMIT/ROLLBACK WORK·`AND WAIT`·DB LUW vs SAP LUW·`CALL FUNCTION … IN UPDATE TASK`·`PERFORM … ON COMMIT`·오류로깅(BAL/SLG1→CH35)·멱등성·패키지 단위 COMMIT 전부 공식과 일치 ✓. modern `@` escape 적절.
- `UPDATE … FROM @wa`/`DELETE … FROM TABLE` 등 변형은 미수록이나 핵심 패턴(SET/FROM TABLE)은 보여줘 실무 스코프 적정.

### CH25 — Lock Object와 동시성 제어 (Track-2)  → **변경 없음(공식과 일치)**
- **L01~L05**: Lock Object(SE11·`EZ_`·Primary Table·Lock Argument)·잠금 모드(E/S/X)·`ENQUEUE_/DEQUEUE_` 함수·`foreign_lock` 예외·표준 패턴(잠금→읽기→변경→COMMIT→해제)·`DEQUEUE_ALL`·자동 해제·Lost Update·Optimistic(타임스탬프)/Pessimistic 전부 공식과 일치 ✓. 잠금 소유자 sy 변수 미보장 주의도 정확.
- ROLLBACK의 잠금 해제는 `_SCOPE` 의존이라 미묘하나 레슨이 "(보통)"으로 적절히 hedge — 오류 아님(check 기록).

### CH26 — OO ABAP 고급 설계와 패턴 (Track-2)
- **L01**(Factory): **게이팅 교정** — `COND #()`(constructor 식)는 CH18 미도입(구조적 갭)이라 P11 위반 → 이미 배운 `CASE`로 교체. (CH18에 COND 정식 도입 결정 시 되돌릴 수 있음.)
- **L02**(Singleton·`CREATE PRIVATE`)·**L03**(Strategy·OCP)·**L04**(MVC)·**L05**(ABAP Unit `FOR TESTING DURATION/RISK LEVEL`·`cl_abap_unit_assert`·DI·Mock): 정확 ✓.

### CH27 — ALV 고급 Event 응용 (Track-2)  → **변경 없음(공식과 일치)**
- **L01~L05**: `FOR EVENT double_click/hotspot_click/toolbar/user_command OF cl_gui_alv_grid`(OO 이벤트=CH20-L09 학습분, constructor FOR 아님)·`SET HANDLER`·`e_row-index`/`e_column-fieldname`·fieldcat `hotspot`·`e_object->mt_toolbar`(`VALUE #()`)·`get_selected_rows`·`refresh_table_display`·핸들러 클래스 통합 전부 공식 ALV API와 일치 ✓. 미학습 constructor 식 없음.

### CH28 — Editable Grid ALV와 입력 검증 (Track-2)
- **L04**(Cell Style): **게이팅 교정** — `COND i()`(CH18 미도입)는 P11 위반 → 이미 배운 `IF`로 교체(CH26-L01과 동일 패턴).
- **L01~L03·L05·L06**: fieldcat `edit`·`register_edit_event(mc_evt_modified/enter)`·`FOR EVENT data_changed/data_changed_finished`·`mt_good_cells`·`add_protocol_entry`/`display_protocol`·`stylefname`/`mc_style_*`·`check_changed_data`·저장 전 최종 검증·`MODIFY … COMMIT` 전부 공식과 일치 ✓.

### CH29 — Enhancement / BAdI / User Exit (Track-2)  → **변경 없음(공식과 일치)**
- **L01~L05**: User Exit(FORM)·Customer Exit(`FUNCTION EXIT_…`·SMOD/CMOD)·Enhancement Point/Section(`ENHANCEMENT…ENDENHANCEMENT`·Implicit)·BAdI(`GET BADI`/`CALL BADI`·SE18/SE19·필터)·확장 우선순위(BAdI>Explicit>Implicit>Modification)·Clean Core(Released API·Key User/Developer Extensibility) 전부 공식 개념과 일치 ✓. 미학습 constructor 식 없음.

### CH30 — 인터페이스 실무: BAPI/RFC/BDC/File (Track-2)
- **L01**(BAPI·BAPIRET2·`BAPI_TRANSACTION_COMMIT`): 정확 ✓ — "BAPI는 스스로 COMMIT 안 함→명시 COMMIT", Return type E/A 확인 모두 공식 패턴과 일치. (BAPI/BAPIRET2는 표준 객체라 keyword doc 직접 항목 아님 — 개념 검증.) `line_exists`·테이블식·인라인 `DATA()`는 CH18+ 도입분이라 게이팅 OK.
- **L02**(RFC `CALL FUNCTION … DESTINATION`): **보강** — 공식 RFC 특수예외 구문 `communication_failure = n [MESSAGE m]`·`system_failure = n [MESSAGE m]`에 맞춰 `MESSAGE lv_msg` 추가(실패 원인 텍스트 수신). `DESTINATION`·SM59·Remote-Enabled 제약은 공식과 일치 ✓.
- **L03**(BDC `CALL TRANSACTION … USING`): **보강** — 공식 구문 `{[MODE][UPDATE]} | [OPTIONS FROM opt]`의 대안 `OPTIONS FROM <ctu_params>`를 실무 노트로 1줄 추가. MODE A/E/N·`MESSAGES INTO`·Session(`BDC_OPEN/INSERT/CLOSE_GROUP`·SM35)·SHDB·BDCDATA 구조 모두 정확 ✓.
- **L04**(GUI 업로드·`SPLIT`·`ALSM_EXCEL_TO_INTERNAL_TABLE`): 정확 ✓ — 변경 없음.
- **L05**(`OPEN/READ/CLOSE DATASET`): **보강 3건** — ① 공식 Security Hint **Directory Traversal**(외부 주입 경로 검증) 경고 추가 ② 공식 권고 `OPEN DATASET … MESSAGE m` + OPEN의 `sy-subrc` 확인 ③ `FOR INPUT/OUTPUT/APPENDING` + 쓰기 `TRANSFER` 1줄(intro "읽고 쓴다"와 본문 일치). 전부 classic·게이팅 안전.

### CH31 — IDoc / ALE / Gateway (Track-2)  → **변경 없음(공식과 일치)**
- **L01~L03**(IDoc 3층 EDIDC/EDIDD/EDIDS·Basic Type/Segment·WE02/WE05/WE60·상태코드 53/51/03/12/02/26·BD87 재처리)·**L02**(ALE Distribution Model BD64·Partner Profile WE20·Port WE21·Logical System BD54)·**L04**(Gateway SEGW·EntityType/EntitySet/Association·DPC_EXT/MPC_EXT·/IWFND/MAINT_SERVICE): IDoc/ALE/Gateway **툴링·프레임워크 설정** → ABAP keyword doc 영역 밖(CH01류 N/A). 개념 서술은 일관.
- **L05**(`GET_ENTITYSET` 구현·modern Open SQL): **정확 ✓** — 절 순서 `SELECT-list→FROM→ORDER BY→INTO→UP TO ROWS→OFFSET`가 공식 규칙(INTO=마지막 query 절, UP TO/OFFSET은 INTO 뒤, OFFSET은 ORDER BY 필수)과 정확히 일치. `@` escape·host expr·`INTO CORRESPONDING FIELDS OF TABLE` 모두 정상. CH31>CH19라 modern SQL 게이팅 OK. 메서드 체이닝(CH20)·인라인 `DATA()`(CH18+)도 도입 완료분. 미학습 constructor 식 없음.

### CH32 — 성능 분석과 튜닝 (Track-2)  → **변경 없음(공식과 일치)**
- **L01~L03**(ST05 SQL Trace·Identical Selects / SAT(구 SE30) Runtime Analysis·Hit List / SQLM·SWLT·Secondary Index 판단·S/4HANA 인덱스 제한): 성능 **분석 도구/T-code** → keyword doc 영역 밖(CH01류 N/A). 개념 서술 일관.
- **L04**(SELECT-in-LOOP 제거): **정확 ✓** — ❌안티패턴(`LOOP … SELECT SINGLE`)↔✅`FOR ALL ENTRIES`+`SORT`+`READ … BINARY SEARCH` 수정. 공식 대조: FAE 배치(`FROM → FOR ALL ENTRIES IN @itab → WHERE`) 정확, **빈 드라이버 테이블→전체 조회** 치명 함정도 본문이 정확히 경고("비었으면 건너뛴다"). FAE 중복 자동제거는 홈(CH13-L06) 참조 — 중복 안 함(R15). 미학습식 없음.
- **L05**(대량처리·Code Pushdown): **정확 ✓** — `SELECT carrid, SUM( seatsocc ) AS occ … GROUP BY carrid INTO TABLE @DATA()` modern 집계 SQL 정상. 패키지/병렬(aRFC)/Pushdown(CDS·AMDP=CH33 예고 L1) 게이팅 OK. CH32>CH19라 modern SQL 정당.

### CH33 — AMDP / ADBC / Pushdown (Track-2)
- **L01**(Code-to-Data 패러다임·Pushdown 우선순위 SQL>CDS>AMDP>Native): 정확 ✓ — 변경 없음.
- **L02**(AMDP `BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT USING`·`if_amdp_marker_hdb`): **보강** — 공식 메서드 구문 `METHOD … BY DATABASE PROCEDURE FOR db LANGUAGE lang [OPTIONS db_options] [USING entities]` 및 선언부 `AMDP OPTIONS [READ-ONLY]`에 따라, 순수 SELECT인 `get_stats` 선언에 **`AMDP OPTIONS READ-ONLY`** 추가(읽기 전용→병렬·읽기복제본 가속, 쓰기 혼입 시 문법검사 차단). 메서드 선언·SQLScript 본문·`:param`·USING은 공식과 일치 ✓.
- **L03**(ADBC `cl_sql_statement`·`execute_query`·`set_param_table( REF #( ) )`·`next_package`·`cx_sql_exception`): 정확 ✓ — "옛 `EXEC SQL`의 현대판" 설명 맞음. client 자동종속 없음·구문검사 없음·SQL injection 주의 모두 공식 Caution과 일치. `NEW`/`REF #( )`/`|…|`/인라인 `DATA()`는 CH18+ 도입분(CH33>CH18 게이팅 OK).
- **L04**(푸시다운 수단 선택)·**L05**(DB 종속성·디버깅·검증약함·클라우드 제약 리스크): 정확 ✓ — 변경 없음. 미학습 constructor 식 없음.

### CH34 — Forms / Output / PDF (Track-2)  → **변경 없음(공식과 일치)**
- **L01**(Smart Forms `SMARTFORMS`·Form/Page/Window/Form Interface·생성FM `/1BCDWB/SF…`·`SSF_FUNCTION_MODULE_NAME`)·**L02**(Adobe Forms `SFP`·Interface/Context/Layout·`FP_JOB_OPEN`/`FP_JOB_CLOSE`·ADS)·**L03**(Output Control NAST↔BRF+ Output Management)·**L05**(SP01 스풀·이송·변경 운영): **양식 디자인 도구·표준 FM·프레임워크** → ABAP keyword doc 영역 밖(CH31류 N/A). 개념 서술 일관.
- **L04**(PDF 바이트 처리): **정확 ✓** — `XSTRING`(PDF 바이너리)·`xstrlen( )`(공식 built-in, 공식 예제와 일치)·`cl_bcs_convert=>xstring_to_solix`·`gui_download(… filetype='BIN' bin_filesize=xstrlen(…))` 모두 정상. "PDF=바이너리→BIN 모드" 경고 정확. 동적 `CALL FUNCTION lv_fm`(변수 FM명, 공식 확인)·인라인 `DATA()`(CH18+, CH34>CH18 게이팅 OK). 미학습 constructor 식 없음.

### CH35 — 운영 품질과 배포 관리 (이송 심화, Track-2)
- **L01**(ATC/Code Inspector `SCI`)·**L02**(ABAP Unit `cl_abap_unit_assert=>assert_equals`·Mock·CI/gCTS)·**L03**(Transport DEV→QAS→PRD·`SE09`/`SE10`/`STMS`·순서/의존)·**L05**(Application Log BAL·`SLG1`·`BAL_LOG_CREATE`/`MSG_ADD`/`DB_SAVE`): 품질·배포·로그 **도구/표준 FM** → keyword doc 영역 밖(CH31류). `assert_equals` 시그니처(act/exp)·메시지 타입(I/S/W/E) 정확.
- **L04**(Background Job): **보강** — `SUBMIT … VIA JOB job NUMBER n` 공식 구문 일치. 단 공식 필수 규칙 **"VIA JOB은 AND RETURN과 함께만 사용 가능"** 을 주석 스켈레톤이 빠뜨려(산문엔 있음) → 주석에 `AND RETURN` 추가 + 필수 페어링 1줄 명시. `SM36/SM37` 툴은 doc 밖. 미학습 constructor 식 없음.

### CH36 — RAP + Fiori 실무 Capstone (Track-2, 7레슨)
- **L01**(시나리오 통합 지도)·**L02**(`ZI_Booking` Interface View·`association [1..1]`·`$projection`·`@Semantics.user.createdBy`)·**L03**(`ZC_Booking` Projection·`provider contract transactional_query`·`@UI.lineItem/identification/facet`·`@Metadata.allowExtensions`)·**L04**(BDEF `managed … unique`·`persistent/draft table`·`lock master`·`determination/validation/action`·BIMP 핸들러 `FOR DETERMINE ON MODIFY`/`FOR VALIDATE ON SAVE`/`FOR MODIFY … FOR ACTION`)·**L06**(`define service … expose`·Service Binding OData V4·Fiori Elements)·**L07**(`draft table`·DCL+BDEF `authorization master ( global, instance )`·Clean Core): CDS DDL·RAP BDL 모두 공식 문법과 일치 ✓. `READ/MODIFY ENTITIES … IN LOCAL MODE`·`%tky`·`WITH CORRESPONDING #( keys )`도 공식(derived types) 확인.
- **L05**(비즈니스 로직 구현): **게이팅 교체** — `MODIFY ENTITIES … WITH VALUE #( FOR b IN bks ( … ) )` 2곳이 **커리큘럼 유일** FOR-comprehension(미학습, CH18 구조적 갭). CH23-L07이 확립한 RAP 관용구(`READ ENTITIES → LOOP AT … INTO`)에 맞춰 `LOOP`+단일 `VALUE #()`+`TYPE TABLE FOR UPDATE`로 교체(이미 배운 문법만). CH26/CH28 게이팅 교정과 동일 원칙. → 이로써 **커리큘럼 전체에서 미학습 constructor 식 0**.

---

## 🏁 감사 완료 총평 (CH01~CH36, 2026-06-24)
**전 36챕터·231레슨**을 SAP 공식 ABAP Keyword Documentation(오프라인 758)과 대조 완료.

- **보강한 챕터(12)**: CH01(WRITE 서식 introduces 정합)·CH02(`DATA VALUE`)·CH04(DIV/MOD 재배치)·CH06(READ INDEX·LOOP FROM/TO)·CH10(CALL FUNCTION `CHANGING`)·CH12(RANGES)·CH13(SELECT DISTINCT)·CH22(@Semantics 자기참조 교정)·CH30(RFC MESSAGE·BDC OPTIONS FROM·OPEN DATASET 보안/MESSAGE/TRANSFER)·CH33(AMDP `OPTIONS READ-ONLY`)·CH35(`SUBMIT VIA JOB … AND RETURN`).
- **게이팅 교정(2)**: CH26-L01(`COND`→`CASE`)·CH28-L04(`COND`→`IF`). (CASE/IF가 입문에 더 명료 — 유지.)
- **누락 문법 보강(1, 사용자 결정 2026-06-24)**: `VALUE #( FOR )`(table comprehension)는 New Syntax에서 진작 다뤘어야 할 누락 → **CH18-L02에 정식 도입**(숫자범위 `FOR i = 1 WHILE`·테이블순회 `FOR x IN itab`). 이에 따라 CH36-L05는 임시 LOOP 교체를 되돌려 **실무 정석 `VALUE #( FOR )`** 로 복원. → 커리큘럼 전체 미학습 constructor 식 0(FOR는 이제 정식 학습분).
- **무변경/정확(21)**: CH03·05·07·08·09·11·14·15·16·17·19·20·21·23·24·25·27·29·31·32·34. (Track-2 후반 CH31/34는 IDoc/Gateway·양식 등 **툴링이라 keyword doc 영역 밖** — 코드 정확성만 확인.)
- **구조적 갭(부분 해소)**: **CH18** — `FOR`-comprehension은 위와 같이 **해소(L02 도입)**. 남은 `CONV`/`COND`/`SWITCH`/`REDUCE`는 현재 커리큘럼 어디에서도 *사용처가 없어*(CH26/28은 CASE/IF로 충분) 정식 도입을 **보류** — 필요 시 확장 단계에서 판단(`check/CH18.md`).
- **총평**: classic-first(R6) 경계·R15 게이팅은 전반적으로 **잘 지켜짐**. 사실오류는 드물고(@Semantics 자기참조 1건), 대부분 "같은 주제의 빠진 classic 하위옵션"(MESSAGE·OPTIONS FROM·READ-ONLY·AND RETURN 등) 보강. Track-2 실무 챕터는 keyword doc 밖 툴링이 많아 N/A 비중이 큼.
- **다음**: `.project-docs/12_EXPANSION_PLAN.md`(51항목 콘텐츠 확장)로 전환 — 별도 지시 대기.
