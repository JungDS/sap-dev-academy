# 09. CURRICULUM LEDGER — 개념 원장 (리빌드 SSOT)

> 📅 최종수정: 2026-06-22 21:25 KST
> 🎯 전면 리빌드 전, 챕터/레슨 맵 + 레슨별 `introduces`/`prereq`/`prevRel`(+`foreshadow`/`advanceUse`)의 단일 근거. 본문 MD·front-matter([04 R10](04_CONVENTIONS.md))·게이팅([04 R15](04_CONVENTIONS.md)) 점검의 출처.
> 🔬 **이 판은 `check/` 정밀검증(소스 전수 + 본문 정독) 반영본** — 35챕터/194레슨/2트랙 확인, DML(구 CH23)·Lock(구 CH24) 기존 존재 확인, 세부 갭 25클러스터 판정 반영.
> ⚠️ **번호 = 신번호**(CH04 흐름제어 삽입 후). Track-02는 `(구 CHxx)` 병기. 콘텐츠 리넘버는 미실행 — 이 문서가 목표.

## 범례
`prevRel`: **ps**=pain-solution · **par**=parallel · **deep**=deepening · **next**=next-step.
게이팅: **L0** 금지 · **L1** 예고(fore) · **L2** 선행사용(adv) · **L3** 정식.
🆕 신규 · ⭐ 골든자산 · 🔶 경계주의 · 🟢 관통 학습장치.

---

## A. 리넘버 맵 (구 → 신) — **전 35→36챕터 캐스케이드**

CH03(DDIC) 뒤에 **연산·흐름 제어**를 새 **CH04**로 삽입 → **구 CH04~35 전부 +1**. Track-02(구 CH23~35)도 **신 CH24~36**으로 이동.

| 신 | 구 | track | 챕터 |
|---|---|---|---|
| CH01 | 01 | 1 | 개발 환경과 첫 프로그램 |
| CH02 | 02 | 1 | 변수·표준 타입·**상수·Text Symbol** |
| CH03 | 03 | 1 | DDIC Domain·Data Element + PARAMETERS·F4 (얕게) |
| **CH04** | 🆕 | 1 | **연산자와 흐름 제어 + 디버깅 (구구단)** |
| CH05 | 04 | 1 | Structure (Local·DDIC) |
| CH06 | 05 | 1 | Internal Table |
| CH07 | 06 | 1 | Transparent Table (SE11) |
| CH08 | 07 | 1 | Open SQL 기본 조회 (classic) |
| CH09 | 08 | 1 | DDIC 관계와 입력도움말(F4) |
| CH10 | 09 | 1 | 모듈화 기초 (OO 비포함) |
| CH11 | 10 | 1 | SALV 1차 |
| CH12 | 11 | 1 | SELECT-OPTIONS와 Range Table |
| CH13 | 12 | 1 | Open SQL 2차: JOIN·집계 |
| CH14 | 13 | 1 | Classic DDIC View·유지보수 (+SE16N) |
| CH15 | 14 | 1 | Report Event·Selection Screen 심화 (+MESSAGE) |
| CH16 | 15 | 1 | Screen Programming / Dynpro 기초 |
| CH17 | 16 | 1 | Grid ALV 기초 |
| **CH18** | 17 | 1 | Modern ABAP Syntax ⭐문법 경계 |
| **CH19** | 18 | 1 | New Open SQL / Modern ABAP SQL ⭐SQL 경계 |
| CH20 | 19 | 1 | OO ABAP 기본 설계 |
| CH21 | 20 | 1 | ALV 표시 제어 심화 (SALV-OOP 체험) |
| CH22 | 21 | 1 | CDS View Entity 기초 |
| CH23 | 22 | 1 | RAP / ABAP Cloud 입문 |
| **CH24** | **23** | 2 | **실무 데이터 변경과 트랜잭션 제어 (DML)** |
| CH25 | 24 | 2 | Lock Object와 동시성 제어 |
| CH26 | 25 | 2 | OO ABAP 고급 설계와 패턴 |
| CH27 | 26 | 2 | ALV 고급 Event 응용 |
| CH28 | 27 | 2 | Editable Grid ALV와 입력 검증 |
| CH29~CH36 | 28~35 | 2 | Enhancement·인터페이스·IDoc·성능·AMDP·Forms·운영·Capstone |

> ⚠️ **"DML은 CH23 유지"(사용자) = 신번호 CH24.** 이하 모든 참조는 신번호. Track-1 리빌드 범위 = **CH01~CH23**.

## B. 경계 (R6 — 리넘버 실행 시 [04](04_CONVENTIONS.md) 반영)
- 순수 classic 구간 = **CH01~17**.
- **New Syntax**(인라인 `DATA()`·`VALUE`·`NEW`·`+=`·`\|…\|`): CH17까지 L0 → **CH18 L3**.
- **New Open SQL**(`@`·콤마): CH18까지 L0 → **CH19 L3**. (CH08~17 Open SQL은 classic.)
- 🔶 **예외 — `&&`(문자열 잇기)는 CH04에서 조기 도입**(사용자 승인: 매우 간단·고빈도). 그 대가로 **classic `ADD`/`SUBTRACT`/`MULTIPLY`/`DIVIDE`도 CH04에서 함께** 소개(`+=`/`-=`는 CH18로 미룸).
- DDIC 코어 나선 = **CH03**(Domain·DE)·**CH05**(Structure)·**CH07**(Transparent Table).

## C. 🟢 관통 학습장치 (3종)

### C-1. 구구단 thread (CH04→08)
| 챕터 | 직전 불편 | 새 개념 | 캡스톤 |
|---|---|---|---|
| CH04 | 값을 받아도 계산·반복 불가 | 연산·IF·DO/WHILE·PARAMETERS | 구구단 전체/특정 단/범위(단일 변수) |
| CH05 | 단수·배수·결과 변수 3개 따로 | Structure 3필드 | 구구단 한 줄=Structure → 한 행 한계 |
| CH06 | Structure 한 행뿐 | Internal Table | 구구단 전체 APPEND→LOOP→SORT |
| CH07 | 메모리 휘발 | Transparent Table | `ZGUGUDAN`에 Create Entries로 **2·3단 18행** 손입력 |
| CH08 | 손입력 번거로움 / 되찾기 | SELECT (읽기) | 18행을 SELECT로 되찾아 출력 + 결과없음 시 MESSAGE |

→ "메모리 itab을 **통째로 INSERT**하고 싶다"·감사필드 자동 stamp = **CH24(구 CH23) DML로 foreshadow**(L1). CH09부터 업무 데이터.

### C-2. 디버거 (관통 체험 — 자주 사용)
- **도입 = CH04**(흐름 제어 직후, 가능한 이르게). 첫 동기 = **CH03에서 입력한 PARAMETERS 값을 눈으로 확인** + 반복문에서 `sy-index` 변하는 모습.
- 범위: BREAK-POINT·`/h`·F5(Step)/F6(Execute)/F7(Return)/F8(Continue)·WATCH POINT·변수 값 확인/수정.
- **재사용 콜백:** CH05(Structure 변수의 실제 모습)·CH06(Internal Table 행들의 모습)·이후 SELECT 결과·LOOP 등 **"디버거로 들여다보기"를 반복** 배치.

### C-3. SY 시스템 변수 (점진 도입)
- **첫 framing = CH04-L05**(DO/WHILE) — `sy-index`와 함께 "SY 시스템 변수" 개념 + **유용한 SY 필드 목록을 정리·소개**(`sy-datum·sy-uzeit·sy-uname·sy-mandt·sy-langu·sy-tcode·sy-repid·sy-subrc`). 단순 나열이 아니라 **용도 예시까지**: 예) 날짜 PARAMETERS 기본값을 `sy-datum`(오늘)으로 — **데이터 저장 전용이 아님**(B2).
- 이후 **등장할 때마다** 값 변화를 그 자리에서: `sy-tabix`(CH06 LOOP·WHERE 주의)·`sy-subrc`(CH06 READ / CH08 SELECT — 핵심)·`sy-datum` 기본값 패턴(CH15 INITIALIZATION)·`sy-uname/datum/uzeit` 감사 stamp(CH24). 한곳 몰아넣기 금지.

### C-4. 업무 관통예제 — SFLIGHT(읽기) · 콘서트 예매(빌드) (CH08→23)
구구단(C-1)이 CH08에서 끝난 뒤 업무 데이터 구간을 잇는 2겹 thread. **동선: SFLIGHT로 읽기를 익혀 → 같은 구조의 콘서트 앱을 직접 빌드.**
- **B · SFLIGHT 항공**(표준 데이터·*읽기* 연습): CH08 SELECT(SCARR/SFLIGHT) → CH09 FK·검색도움말(실제 SCARR↔SPFLI↔SFLIGHT) → CH11 SALV → CH12 SELECT-OPTIONS(CARRID·FLDATE) → CH13 JOIN·집계(탑승률 SEATSOCC/SEATSMAX·DISTINCT) → CH19 modern → CH22 CDS(`ZI_Flight`).
- **C · 콘서트 예매**(자체앱·*빌드*·전체 생명주기): 모델 `ZCONCERT`(공연)·`ZPERF`(회차)·`ZBOOKING`(예매, 예매자=이름 풀 정훈영). CH09 DDIC(FK·F4) → CH10 모듈화(잔여석·예매판정) → CH11 SALV(예매목록) → CH14 View/SM30(공연등록) → CH15 선택화면·검증(없는 공연ID→`MESSAGE E`) → CH16 Dynpro(예매 입력·BACK/EXIT) → CH17 Grid ALV(좌석표) → CH18/19 modern → CH20 OO(`ZCL_BOOKING_MANAGER`·`ZCX_FULLY_BOOKED`) → CH21 색·이벤트(매진 빨강·더블클릭) → CH22 CDS(`ZI_Concert`/`ZC_Concert`) → CH23 RAP(예약/취소 action·정원초과 validation).
- 매 전이는 pain→solution(예: SALV로 예매목록 봤지만(C) → "특정 공연만"(불편) → CH12 SELECT-OPTIONS). 상세 설계=`check/RUNNING-EXAMPLES.md`.

## D. 데이터 입력 도구 아크
**SE11 Create Entries(한 건씩, CH07)** → **TMG/SM30(다건, CH14)** → **SE16N(브라우저, CH14)**. 쉬운 도구를 먼저 보이면 Maint. 가치 소멸 → SE16N은 Maint. 뒤.

## E. DML·감사필드·표준테이블 규율 = **CH24(구 CH23)로 이관**
- INSERT/UPDATE/MODIFY/DELETE·COMMIT/ROLLBACK·LUW = CH24(이미 설계). **CH08(Track-1)은 읽기 전용.**
- 감사필드(컬럼=표준 DE 재사용 + `sy-uname/datum/uzeit` 자동 stamp) = **CH24**에서 DML과 함께(자연스러움).
- "표준 테이블(SCARR 등)은 읽기 전용·직접 DML 금지(BAPI 경유)" 원칙도 CH24.
- Lock(`ENQUEUE`) = CH25(구 CH24).

---

# F. 레슨 단위 원장 (Track-1: CH01~23, 신번호)

## CH01 · 개발 환경과 첫 프로그램 _(입문)_
| 레슨 | introduces | prereq | prevRel | 비고 |
|---|---|---|---|---|
| L01 SAPGUI 로그온·화면구성 | SAPGUI·로그온·SAP Easy Access | — | start | |
| L02 T-code·SE38 첫 실행 | T-code·SE38·ABAP Editor·$TMP·Local Object | L01 | par | SE38🆕 · **F1 키워드 도움말·Ctrl+Space 자동완성 팁** 🆕 |
| L03 프로그램 구조·주석 | REPORT·주석·문장 종결 | L02 | par | **inactive/active 버전 의미**(활성화=덮어쓰기·복구불가, 릴리즈본만 롤백) 🆕 |
| L04 WRITE로 문자열 출력 | WRITE·리터럴·줄바꿈(/)·**NEW-LINE**·콜론(:)체인 | L03 | ps | ⭐ · **콜론=왼쪽 전체 반복**(`WRITE /: 'a','b'`) 명시 🆕 |
| L05 WRITE 심화(정렬·폭·색·구분선) | COLOR·ULINE·SKIP·출력서식·**FORMAT·EDIT MASK·CURRENCY·NO-ZERO·`WRITE TO`(변수로)** | L04 | deep | |
| L06 개발 패키지·이송요청 입문 | 개발 패키지·이송요청·Transport Organizer·SE09 | L02 | ps | |
| L07 **T-code 생성(SE93) 기초** 🆕 | SE93·실행형 T-code | L02 | par | Executable은 선택, Module Pool은 시작화면 필수(→CH16) |

**→CH02:** ps "같은 타입 또 정의 → 전역 공유".

## CH02 · 변수·표준 타입·상수·Text Symbol _(입문)_
| 레슨 | introduces | prereq | prevRel | 비고 |
|---|---|---|---|---|
| L01 변수 선언(DATA)·**TYPE/LIKE** | DATA·TYPE(Local/Global/Standard)·**LIKE(변수)** | CH01 | ps | |
| L02 Complete 타입(STRING·I·F·D·T)·**숫자 표현** | STRING·I·F·D·T·정수(123/-123)·**실수='123.45'**(`.`=문장종결→따옴표)·**암묵적 형 변환 규칙(C/N/P/I 대입·잘림)** | L01 | par | D/T 날짜·시간 산술=CH04 |
| L03 Incomplete 타입(C·N·P)·**offset/length** | C·N·P·LENGTH·DECIMALS·**`gv+off(len)` 부분접근** | L02 | par | |
| L04 Local Type(TYPES) 재사용 | TYPES·Local Type | L01 | ps | Local↔Global(CH03) 비교 예고 |
| L05 **CONSTANTS** 🆕 | CONSTANTS | L01 | par | "좋은 프로그램엔 항상 상수" |
| L06 **Text Symbol** 🆕 | Text Symbol·`TEXT-001`↔`'…'(001)` 차이·다국어 | L01·CH01(WRITE) | par | 전자=미번역 공백(누락발견)·후자=기본값(은폐); 메시지클래스와 구분 |

**→CH03:** ps(타입 전역화) · **→CH04:** ps "값을 받았지만 계산·분기·반복 불가".

## CH03 · DDIC Domain·Data Element + PARAMETERS·F4 (핵심) _(입문)_
> 📌 **"핵심"=정식 도입(L3).** 더 깊은 속성은 *나선 재방문*: **Search Help 연결·변환 루틴 → CH09** · 전체 라벨/F4 바인딩 → CH08(PARAMETERS) · Parameter ID(SPA/GPA) → Track-2. (깊게가 없는 게 아니라 맥락별로 분산 — "얕게" 표기 폐기)

| 레슨 | introduces | prereq | prevRel | 비고 |
|---|---|---|---|---|
| L01 Domain | Domain·타입·길이·출력길이·소수·대소문자·고정값·Value Table·활성화 | CH02 | ps | SE11🆕 ⭐ · 변환 루틴(ALPHA)은 개념만(심화=CH09) |
| L02 Data Element | Data Element·라벨(short/medium/long/heading) | L01 | ps | |
| L03 PARAMETERS로 보상(F4·라벨) | PARAMETERS·F4·Selection Screen | L02·CH01 | ps | 끝에 "곧 디버거로 직접 본다" 예고(→CH04 디버깅) |

**→CH04:** ps.

## CH04 · 연산자와 흐름 제어 + 디버깅 (구구단) _(입문)_ 🆕
| 레슨 | introduces | prereq | prevRel | 비고 |
|---|---|---|---|---|
| L01 산술 연산과 대입·**날짜 산술** | `+ - * /`·`**`·**`ADD`/`SUBTRACT`/`MULTIPLY`/`DIVIDE`**·`=`(MOVE는 legacy)·`CLEAR`·**날짜/시간(D/T) 산술·일수 계산** | CH02 | ps | `+=`/`-=`는 CH18 · COMPUTE는 obsolete |
| L02 문자열 다루기 | CONCATENATE·SPLIT·**FIND·REPLACE·CONDENSE·SHIFT·TRANSLATE·OVERLAY·`WRITE TO`**·STRLEN·offset·내장함수(strlen·mod·abs·sqrt·ipow…)·🔶**`&&`(조기)** | CH02 | par | `SEARCH`는 obsolete(FIND 사용)·regex/SUBMATCHES 후속·`\|…\|`는 CH18 |
| L03 IF와 조건식 | 비교연산자·**AND/OR/NOT·괄호**·IS INITIAL·IF/ELSEIF/ELSE·**ABAP boolean 처리(타입 없음·`abap_true`/`abap_false`·`'X'`/공백·`BOOLC`/`XSDBOOL`)** | L01 | ps | 비교/논리식=IF 조건 · boolean: CH10서 `abap_true` 선사용됨 |
| L04 CASE 분기 | CASE…WHEN | L03 | par | |
| L05 DO/WHILE·루프 제어 | DO·WHILE·EXIT·CONTINUE·CHECK·🟢**`sy-index`+유용한 SY 필드 목록·용도(예: `sy-datum` 기본값)** | L03 | par | DO↔WHILE 형제 |
| L06 **디버깅 입문** 🆕🟢 | BREAK-POINT·`/h`·F5~F8·WATCH POINT·변수 확인/수정 | L05·CH03(PARAMETERS) | par | 첫 예제=PARAMETERS 값 확인·sy-index 추적; 이후 관통 사용 |
| L07 종합 실습: 구구단 | (적용) | L01·L03·L05·L06 | — | 전체/특정 단/범위 + 디버거로 변수 관찰 |

**→CH05:** ps "단수·배수·결과 변수 3개 따로"(구구단).

## CH05 · Structure (Local·DDIC) _(초급)_
| 레슨 | introduces | prereq | prevRel | 비고 |
|---|---|---|---|---|
| L01 Local Structure(BEGIN OF~END OF)·**`-` 컴포넌트 접근** | Structure·BEGIN/END OF·Work Area·컴포넌트 | CH02·CH04 | ps | 도입=구구단 단일변수 불편 |
| L02 DDIC Structure·**Local↔Global 비교** | DDIC Structure | L01·CH03 | par | SE11 |
| L03 구조체 다루기 | MOVE-CORRESPONDING·CLEAR | L01 | deep | |
| (캡스톤) 구구단 한 줄=Structure | (적용) | L01 | — | 🟢 **디버거로 Structure 변수 모습 확인**; 한 행 한계 강조 |

**→CH06:** ps "한 행뿐 → 81행 못 담음".

## CH06 · Internal Table _(초급)_ — **깊이 보강**
| 레슨 | introduces | prereq | prevRel | 비고 |
|---|---|---|---|---|
| L01 Internal Table 기초·선언 | Internal Table·`TYPE TABLE OF`(→STANDARD·empty key 설명)·APPEND·Work Area·**CLEAR/REFRESH/FREE 차이(Header Line 유무별)·Header Line 단축 문법(인식용)** | CH05 | ps | FREE·Header Line(B6) |
| L02 **3속성·테이블 종류** | **Line Type(=Structure 아니어도 됨·elementary 가능)·Primary Key·Table Kind**·STANDARD/SORTED/HASHED 비교·언제 쓰나·Index/Index Tables·Local/Global Table Type | L01·CH03 | par | 🆕 깊이(grep 0였음) |
| L03 단일행 접근 | APPEND·INSERT·**`INSERT … INTO TABLE` 차이**·READ TABLE **`WITH KEY` vs `WITH TABLE KEY`**·**BINARY SEARCH(SORT 선행 필수)**·MODIFY·MODIFY TABLE·DELETE·sy-subrc | L02 | deep | 🆕 깊이 |
| L04 집단행·순회·**컨트롤레벨** | LOOP(**FROM/TO·WHERE**)·🟢`sy-tabix`(**WHERE면 첫 반복도 ≠1**)·**`LOOP … ASSIGNING <fs>`(Field Symbol 기초)**·**COLLECT·DELETE ADJACENT DUPLICATES·컨트롤레벨(AT FIRST/LAST·AT NEW/END OF + SUM)·DESCRIBE**·`APPEND/INSERT LINES OF`·`SORT`·대량 DELETE | L01 | deep | SORT 기존(D8)·`ON CHANGE OF`→AT·`REFRESH`→CLEAR(obsolete)·본격 Field Symbol=§H |
| L05 Deep Structure 개념 | Deep Structure·중첩 | L01·CH05 | deep | |
| (캡스톤) 구구단 전체=Internal Table | (적용) | L01·L04 | — | 🟢 **디버거로 행들 모습 확인**; SORT(배수/결과 내림차순) |

**→CH07:** ps "끝나면 사라짐 → 영속".

## CH07 · Transparent Table (SE11) _(초급)_
| 레슨 | introduces | prereq | prevRel | 비고 |
|---|---|---|---|---|
| L01 Transparent Table 생성(SE11) | Transparent Table·Key·MANDT·**필드 타입=Data Element(권장) vs Built-In·차이** | CH03·CH06 | ps | SE11(복습) |
| L02 Create Entries로 구구단 입력·**SE11 데이터 조회** | SE11 Create Entries·Utilities→Table Contents 조회 | L01 | par | **2·3단 18행 손입력**; CH06 81행(프로그램)과 대비 |
| L03 **Transparent↔Structure↔Table Type 비교** 🆕 | 같은 DDIC를 TYPE로=Work Area·`TABLE OF`로=Internal Table·**Transparent 본래 목적=영속** | L01·CH05·CH06 | deep | 변수 모양 비교 |

**fore:** SM30 다건 → CH14(장거리) · 통째 INSERT·감사필드 → **CH24**.
**→CH08:** ps "다시 읽고 싶다". **SE16N 제거**(→CH14).

## CH08 · Open SQL 기본 조회 (classic) _(초급)_ — **읽기 전용·대폭 확장(2차 점검)**
| 레슨 | introduces | prereq | prevRel | 비고 |
|---|---|---|---|---|
| L01 SAP 데모 테이블 구조 + client 종속 🆕 | SCARR/SPFLI/SFLIGHT 구조·**Open SQL의 client(MANDT) 자동 종속** | CH07 | ps | 풍부한 예제·JOIN의 기반 |
| L02 SELECT 4요소·`*` vs 필드 | 테이블/필드/행/보관·projection·`*`↔필드별 INTO 모양·`table~field`·🟢sy-subrc·sy-dbcnt·classic | L01·CH06·CH07(ZGUGUDAN) | par | SE38 ⭐ · **SE16N 배지 제거** |
| L03 SELECT 형태(결과/기록) | `SELECT SINGLE`(단/단)·`INTO TABLE`(다/다·**Array Fetch**)·`SELECT…ENDSELECT`(다/단)·**`UP TO n ROWS`(행 제한)**·**ENDSELECT 지양·중첩 절대금지** | L02 | par | 왜 ENDSELECT가 비효율인지 |
| L04 INTO 대상 형태 | `INTO wa`·`INTO (v1,v2)`·`INTO (gs-f1,…)`·`INTO CORRESPONDING FIELDS OF (wa/TABLE)`·`APPENDING (TABLE)` | L03 | deep | |
| L05 WHERE 상세 | 연산자 EQ/NE/LT/GT/LE/GE/**BETWEEN/LIKE(`_`·`%`)/IN/IS NULL**·AND/OR/NOT·단일값 vs Range `IN` | L02 | deep | classic host 변수 |
| L06 키필드 vs 일반필드·Index 기초 | 키 검색 vs 일반필드 속도·**Secondary Index 개념·S/4HANA 권장X+이유** | L02 | deep | 심화=CH32(perf) |
| L07 조회 실패와 MESSAGE(기초) 🆕 | sy-subrc 분기·`MESSAGE`(S/I 맛보기) | L02 | deep | 정식 타입=CH15 |

**fore:** DML·트랜잭션·감사 stamp·통째 INSERT → **CH24**.
**→CH09:** par(업무 데이터 전환). **경계:** classic 전용·modern SQL=L0. **🔴 INSERT/UPDATE/DELETE 미포함**(CH24).

## CH09 · DDIC 관계와 입력도움말(F4) _(초급)_
| 레슨 | introduces | prereq | prevRel |
|---|---|---|---|
| L01 Foreign Key·Check Table | Foreign Key·Check Table | CH07·CH08 | ps |
| L02 Value Table vs Foreign Key | Value Table | L01·CH03 | par |
| L03 Elementary Search Help | Search Help(Elementary)·F4 | CH07 | par |
| L04 Collective Search Help 기초 | Collective Search Help | L03 | par |
| L05 PARAMETERS-DDIC F4 연결 | (연결 원리) | L03·CH03 | deep |
| L06 DDIC 검증 vs 프로그램 검증 역할분리 | 선언/코드 검증 경계 | L01 | deep |

**fore:** AT SEL-SCREEN 검증 → CH15. **챕터:** par. 업무 데이터 시작.

## CH10 · 모듈화 기초 (OO 비포함) _(초급)_ — **깊이 보강·D9 교정**
> 축 = Local↔Global 모듈화. OO 개념 0. **현 CH09-L04의 `NEW`·인라인·인스턴스 우선은 R6 위반(D9) → 전면 재작성.**

| 레슨 | introduces | prereq | prevRel | 비고 |
|---|---|---|---|---|
| L01 FORM/PERFORM | Subroutine·FORM·PERFORM·**로컬 변수(복귀 시 소멸)·전역 변수 차이·서브루틴에서 전역변수만 쓰지 않기**·타 프로그램 Subroutine 호출 금지 | CH04 | ps | Method/Function 내부 변수는 프로그램에서 접근 불가(스코프) |
| L02 USING/CHANGING·**파라미터 모드** | USING·CHANGING·**Call by Value/Value-Result/Reference**·**타입 명시 안전성**·**OPTIONAL/DEFAULT 파라미터·RETURN·STATICS** | L01 | deep | D10 보강 |
| L03 CALL FUNCTION | Function Module·CALL FUNCTION·SE37(생성)·EXPORTING/IMPORTING(매핑·Import은 CALL의 EXPORTING)·**classic EXCEPTIONS(왜·핸들링)**·Function 전역변수(TOP)·Pattern·Ctrl+Space | L01 | par | Global 절차 |
| L04 Local Class로 모듈화 🔴재작성 | **ATTRIBUTE·METHOD·PUBLIC/PRIVATE(PROTECTED 생략)·Class↔Object(설계도/쿠키틀)·Static-first(`=>`)·인스턴스 간략(`->`)** | L01 | par | **`NEW`·인라인 금지**(classic). "보통 Subroutine, 특수 시 Local Class" |
| L05 Global Class 호출 기초 | Global Class 호출(static 우선) | L03·L04 | par | adv: oo-method-call(블랙박스) |
| L06 Subroutine/Function/Class 선택 기준 | (선택 기준) | L01·L03·L04 | par | |

**fore:** 본격 OO(인스턴스·상속·visibility 전체) → CH20. **→CH11:** ps "WRITE 리스트 투박".

## CH11 · SALV 1차 _(초급)_
| 레슨 | introduces | prereq | prevRel | 비고 |
|---|---|---|---|---|
| L01 SALV 목적·CL_SALV_TABLE | SALV·CL_SALV_TABLE·ALV | CH06·CH08 | ps | 동기=**내부 테이블 `LOOP`+`WRITE`의 번거로움**(CH06 체험). classic 인터랙티브 리스트(AT LINE-SELECTION/HIDE 등)는 **완전 제외**(결정 나 — Table Control처럼 ALV로 대체) |
| L02 FACTORY 메서드 출력 | factory·display | L01·CH06 | deep | SE38 ⭐ · adv:oo호출 · classic `DATA REF TO`(인라인 금지) |
| L03 기본 Function·Display | get_functions·set_all·display | L02 | deep | |
| L04 Internal Table→SALV 미니리포트 | (통합) | L02·CH08 | deep | |
| L05 SALV 범위·심화 분리 | (범위 경계) | L01 | par | fore: Grid ALV→CH17 · 심화→CH21 |

**→CH12:** ps "단일 값만으론 부족".

## CH12 · SELECT-OPTIONS와 Range Table _(중급)_
| 레슨 | introduces | prereq | prevRel |
|---|---|---|---|
| L01 Range Table 구조 | Range Table·SIGN·OPTION·LOW·HIGH | CH06·CH08 | ps |
| L02 SELECT-OPTIONS 문법 | SELECT-OPTIONS·Selection Screen | L01·CH03 | ps |
| L03 WHERE … IN (classic range) | WHERE IN | L01·CH08 | deep |
| L04 Multiple Selection·Include/Exclude | Multiple Selection·Include·Exclude | L02 | deep |
| L05 EQ/BT/CP 옵션 | OPTION 값 | L01 | par |
| L06 Selection Table 직접 조작·**SELECT-OPTIONS vs RANGES** | 코드로 Range 채우기(`TYPE RANGE OF`/`RANGES`)·SELECT-OPTIONS(변수만·자동 화면)와 차이 | L01·CH06 | deep |

**→CH13:** ps "여러 테이블·집계".

## CH13 · Open SQL 2차: JOIN·집계 (classic) _(중급)_
| 레슨 | introduces | prereq | prevRel |
|---|---|---|---|
| L01 INNER JOIN | JOIN·INNER JOIN·**`table~field`·`AS` 별칭**·**classic=Inner/Left만**(Right/Full→CH19)·잘못된 조인조건 경고 | CH08 | ps |
| L02 LEFT OUTER JOIN·NULL | LEFT OUTER JOIN·NULL | L01 | par |
| L03 GROUP BY·Aggregate·**DISTINCT** | GROUP BY·COUNT/SUM/MIN/MAX·**DISTINCT(+count로 종류 세기)**·**집계 특수(집계만→sy-subrc=0 · COUNT만→INTO 생략·sy-dbcnt)** | CH08 | deep |
| L04 HAVING | HAVING | L03 | deep |
| L05 ORDER BY | ORDER BY | CH08 | deep |
| L06 FOR ALL ENTRIES | FOR ALL ENTRIES·성능함정 | L01·CH06 | deep |
| L07 JOIN/FAE/ABAP 선택 기준 | (선택 기준) | L01·L06 | par |

**경계:** classic. **→CH14:** ps "코드 JOIN 반복 + 마스터 유지보수".

## CH14 · Classic DDIC View·유지보수 (+SE16N) _(중급)_
| 레슨 | introduces | prereq | prevRel | 비고 |
|---|---|---|---|---|
| L01 Database View vs JOIN | Database View | CH13 | **ps**(코드JOIN 반복) | SE11 |
| L02 Projection View | Projection View | L01 | deep | |
| L03 Help View·Search Help | Help View | CH09 | deep | |
| L04 Maintenance View·Foreign Key | Maintenance View | CH09 | deep | |
| L05 TMG/SM30 | TMG·SM30 | CH07 | **ps**(CH07 한건씩→다건) | SM30 |
| L06 SE16N 데이터 브라우저 | SE16N | L05·CH07 | deep | SE16N🆕(Maint. 뒤) |
| L07 Classic View vs CDS 비교 준비 | (없음) | L01 | par | **fore: CDS→CH22** |

**→CH15:** par/약pain.

## CH15 · Report Event·Selection Screen 심화 (+MESSAGE) _(중급)_
| 레슨 | introduces | prereq | prevRel | 비고 |
|---|---|---|---|---|
| L01 Report Event 전체 흐름 | Report Event·INITIALIZATION·START-OF-SELECTION·흐름 | CH03·CH08 | ps | SE38 ⭐ · 이벤트 4종=parallel |
| L02 INITIALIZATION 기본값 | INITIALIZATION | L01 | par | |
| L03 AT SELECTION-SCREEN OUTPUT | AT SEL-SCREEN OUTPUT·LOOP AT SCREEN·PBO | L01 | par | |
| L04 AT SELECTION-SCREEN 입력 검증·**MESSAGE 정식** | AT SEL-SCREEN·**MESSAGE 타입(I/S/W/E/A/X)·메시지 클래스(SE91)·변수(&1~&4·WITH·INTO·RAISING)**·PAI | L01·CH08(MESSAGE 맛보기)·CH09 | par | I/S/E가 적절히 쓰이는 자리 |
| L05 START-OF-SELECTION 조회 | START-OF-SELECTION | L01·CH08 | deep | |
| L06 END-OF-SELECTION 마무리 | END-OF-SELECTION | L01·CH11 | par | |
| L07 권한/존재 검증 기초 | AUTHORITY-CHECK | L04 | deep | |
| L08 Selection Screen 고급(블록·그룹·F1·F4) | ON BLOCK·ON RADIOBUTTON GROUP·ON HELP/VALUE-REQUEST | L04 | deep | 구 CH14-L08 예약 |
| L09 🆕 **Selection Screen UI 구성** | BLOCK·COMMENT·PUSHBUTTON(본문 버튼)·**`PARAMETERS AS CHECKBOX`·`RADIOBUTTON GROUP`**·**TABBED BLOCK**·ULINE/SKIP·🆕**애플리케이션 툴바 버튼: `SELECTION-SCREEN FUNCTION KEY 1~5`(FC01~FC05)·`TABLES SSCRFIELDS`·`FUNCTXT`(INITIALIZATION 텍스트)·`SSCRFIELDS-UCOMM`(AT SELECTION-SCREEN서 `CASE` 분기)** | CH12·L02·L04 | par | 본문 PUSHBUTTON ≠ 툴바 FUNCTION KEY |

**→CH16:** ps "내가 설계한 입력 화면".

## CH16~CH23 (골격 — 신번호)
- **CH16 Dynpro 기초**(9+): Module Pool·Screen Painter·**화면 요소(Input/Output/Text/Push/Checkbox/Radiobutton/Dropdown)**·**Tabstrip·Subscreen Area·Status Icon**(🔶Table Control 제외=ALV로 대체)·PBO·**PAI(OK_CODE·BACK/EXIT/CANCEL·`LEAVE TO SCREEN 0` vs `LEAVE PROGRAM`(EXIT 종료) vs `LEAVE SCREEN`)**·PF-STATUS·Custom Container·**T-code 생성(Module Pool 기준·시작화면 지정)**(B7). fore:Container→CH17. **→CH17 ps**(SALV 위치 한계).
- **CH17 Grid ALV 기초**(9): Container·CL_GUI_ALV_GRID·Field Catalog·Layout·Variant·Refresh·**L09 행색만**(셀색=CH21). prereq CH11·CH16. **→CH18 ps**.
- **CH18 Modern Syntax**(6) ⭐문법경계: inline DATA·VALUE·CORRESPONDING·Table Expr·**`\|…\|`·`+=`**·리팩터링. 🔶`NEW`(객체)·OO 제외.
- **CH19 Modern SQL**(7) ⭐SQL경계: `@`·`@DATA`·콤마·SQL식·SELECT FROM @itab. prereq CH13·CH18.
- **CH20 OO 기본**(9+): Class·Visibility·Constructor·Static/Instance·Interface·Inheritance·**OO 이벤트(EVENTS/RAISE EVENT/SET HANDLER)**·**예외 TRY/CATCH/CLEANUP·RAISE EXCEPTION·CX 계층(ROOT/STATIC/DYNAMIC/NO_CHECK)·RESUME**·**CAST(`?=`)·CASE TYPE OF**·참조변수(`REF TO`/`CREATE DATA`). **CH10 adv·CH18의 정식 도입지.** **→CH21 deep/applies**(OO 이벤트가 ALV 이벤트 CH21/27의 기반).
- **CH21 ALV 표시 심화(SALV-OOP 체험)**(7): SALV-OOP 이벤트(맛보기)·Cell Color/Style·Stable Refresh. prereq CH17·CH20. 🔶 **본격 이벤트는 CH27(구 CH26)** — 여기선 OOP 체험 수준만(D4).
- **CH22 CDS 기초**(6): View Entity·Association·Annotation·Metadata Ext·DCL. prereq CH14·CH19·CH20. (CH14·CH19 fore 도입지)
- **CH23 RAP 입문**(8): RAP·ZI_*/ZC_*·BDEF/BIMP·Service·ABAP Cloud. prereq CH20·CH22. next.

---

## G. Track-2 다운스트림 경계 (CH24~36, 구 CH23~35) — 리빌드가 침범 금지
| 신(구) | 챕터 | Track-1과의 관계 |
|---|---|---|
| CH24(23) | 실무 데이터 변경·트랜잭션(DML) | CH08 읽기 → 여기 쓰기. **감사 stamp·통째 INSERT·표준테이블 규율** |
| CH25(24) | Lock·동시성 | CH24와 짝 |
| CH26(25) | OO 고급 패턴 | CH20 기본 → 심화 |
| CH27(26) | ALV 고급 Event | CH21 OOP체험 → **본격 이벤트**(D4 경계) |
| CH28(27) | Editable Grid ALV | CH17 → 입력 |
| CH29~36 | Enhancement·인터페이스·IDoc·성능·AMDP·Forms·운영·Capstone(구 CH28~35) | 실무 |

## H. 미해결·후속 (리빌드 중 확정) · check/ 참조
- **확정 반영됨:** DML→CH24 · SORT 기존(D8) · 디버거 관통 · MESSAGE(CH08 맛보기/CH15 정식) · SY 점진 · `&&` 조기·`ADD/SUBTRACT` · CONSTANTS/Text Symbol=CH02.
- **레슨 수 원칙(확정 B5):** 레슨 수를 제한·고정하지 않는다 — 주제에 맞으면 언제든 추가, 주제와 안 맞는 내용을 한 레슨에 욱여넣지 않는다. (현재 CH01=7·CH02=6·CH04=7·CH06=5는 자연 증가) · CH04 디버깅 슬롯=L06 권고.
- **세부 갭 acceptance 목록 = [check/coverage-checklist.md] §5 + [check/coverage-checklist-2-opensql.md]**(리빌드 레슨별 요구사항).
- **2차 점검(Open SQL 38항목) 반영:** CH08 **7레슨 확장**(데모테이블+client / 4요소·`*`vs필드 / SELECT 형태(SINGLE·ENDSELECT·INTO TABLE) / INTO 대상형태 / WHERE 연산자+wildcard / 키vs일반+Index / 실패 MESSAGE) · CH13 DISTINCT·집계특수·`table~`/`AS`·classic Inner-Left만 · CH07 필드타입·SE11조회·비교 · CH12 RANGES 명시 · CH06 Header Line·Line Type≠Structure.
- **프로그램 이동·메모리(확정):** SUBMIT·CALL TRANSACTION·LEAVE TRANSACTION·SAP/ABAP Memory = **Track-2**(Track-1 신규 챕터 안 만듦). **`LEAVE PROGRAM`·`LEAVE TO SCREEN 0`·`LEAVE SCREEN` + BACK/EXIT/CANCEL 버튼 = CH16(Dynpro) PAI**(EXIT로 프로그램 종료 맥락). · flight model=CH08-L01(구구단 thread 병행) · Secondary Index=CH08 기초+CH32 perf 심화.
- **3차 점검(Domain深·Field Symbol·화면요소) 반영:** CH03 "얕게"→**"핵심"**(깊은 속성=CH09/CH08/Track-2 분산)·**변환 루틴(ALPHA)=CH09 추가** · CH04-L02 **FIND/REPLACE 기초** · CH06-L04 **Field Symbol 기초(`LOOP ASSIGNING`)** · CH15-L09 **Selection Screen UI(CHECKBOX·RADIO·COMMENT·PUSHBUTTON·TABBED)** · CH16 **화면요소 확장(Checkbox/Radio/Dropdown + Tabstrip/Subscreen/Table Control/Status Icon)**.
- **3차 결정(확정):** ① Field Symbol 기초=CH06-L04 · **참조변수(`REF TO`/`CREATE DATA`)=CH20(OO)** · **동적 접근(`ASSIGN (name)`·dynamic SELECT/WHERE·RTTS)=Track-2**. ② **Table Control 제외**(Screen Table Control은 ALV로 대체·실무 거의 안 씀) — CH16은 Tabstrip·Subscreen·Status Icon만.
- **4차 점검(ABAP 공식 키워드 문서 전수 대조) 반영:** OO 이벤트(EVENTS/RAISE EVENT/SET HANDLER)=CH20 · 예외 TRY/CATCH/CLEANUP·CX 계층=CH20 · 날짜연산(D/T)=CH04-L01 · CONDENSE/SHIFT/TRANSLATE/OVERLAY/`WRITE TO`=CH04-L02 · COLLECT·컨트롤레벨 AT/SUM·DELETE ADJACENT DUPLICATES·DESCRIBE=CH06-L04 · `UP TO n ROWS`=CH08-L03 · WRITE 서식(FORMAT/edit mask/CURRENCY)=CH01-L05 · 암묵적 형변환=CH02 · MESSAGE 변수=CH15-L04 · OPTIONAL/DEFAULT·RETURN·STATICS=CH10-L02 · CAST(`?=`)/CASE TYPE OF=CH20. obsolete 프레이밍(SEARCH→FIND·REFRESH→CLEAR·MOVE→`=`·ON CHANGE OF→AT·CATCH SYSTEM-EXCEPTIONS→TRY/CATCH). 상세=[check/coverage-checklist-4-official.md].
- **4차 결정(확정):** classic 인터랙티브 리스트(AT LINE-SELECTION/HIDE/AT USER-COMMAND/TOP-OF-PAGE) = **완전 제외(나)** — Table Control처럼 ALV로 대체. 내부 테이블 `LOOP`+`WRITE`의 번거로움만으로 ALV 동기 충분. → **미결정 = 없음.**
- **4차 본문 정독(CH01~14 전 레슨 line-by-line) 발견:** ① **ABAP boolean 처리=CH04-L03**(현 CH10 `abap_true` 선사용) · ② **R10 `advanceUse` 선언 필요:** `START-OF-SELECTION`(CH03/08/09 예제→정식 CH15)·`TRY/CATCH cx_salv_msg`(CH10-L02/CH11/CH14 SALV→정식 CH20) · ③ **`TABLES` 문**(SELECT-OPTIONS `FOR` 참조용)은 CH12서 사용·유지.
- **소스 버그(리빌드 시 교정):** R9 'Kim/Lee'(D11)·SE16N 배지(D5)·CH34 stale 참조(D7)·**CH01-L05→L06 stale 참조(CH01-L02·CH13-L05 등 다수)**·**inline `DATA()`의 classic 구간 침투(CH09-L04/L05·CH11-L02 → R6 위반, `LIKE LINE OF`로 정리)**.
- **Track-02(CH24~36)**는 본 원장 범위 밖(경계 참조용만).
