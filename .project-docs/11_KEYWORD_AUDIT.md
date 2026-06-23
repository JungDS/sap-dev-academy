# 11. KEYWORD AUDIT — 공식 ABAP Keyword Doc 대비 콘텐츠 감사 원장

> 📅 최종수정: 2026-06-23 09:47 KST
> 🎯 **목적:** `content/abap/**` 레슨을 **SAP 공식 ABAP Keyword Documentation 오프라인 전체본**(`C:\ABAP_DOCU_HTML`, AS ABAP Release 758)과 대조해 키워드·문법·이론의 **누락/상이/오류**를 보강. 챕터 순서대로.
> 📖 **읽을 때:** 감사 패스 **재개 시**(이어서 진행) — 이 원장이 어디까지 했는지의 단일 출처.

## 기준 (사용자 합의 2026-06-23)
- 비교 단위 = 레슨의 `introduces`/`prereq` 범위. **"정확성 + 같은 주제의 빠진 classic 하위옵션·관련문"** 까지 보강.
- **항목마다 R6/R15 게이팅 재판단** — modern(New Syntax CH18+ / New Open SQL CH19+)·미래 개념은 **여전히 제외**. classic 범위만.
- **불일치 ≠ 항상 공식 쪽 수정**: classic-first(R6)는 의도된 단순화 — 버그 아님.
- SAP 본문/코드 **verbatim 복사 금지**(저작권) — 의미만 취해 입문자 톤 재작성([04 R3]).
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
| CH06 | 🔄 진행 중 | |
| CH07~CH36 | ⬜ 대기 | |

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
- **L03**(PARAMETERS): 정확 ✓ — OBLIGATORY·DEFAULT·LOWER CASE. `AS CHECKBOX`·`RADIOBUTTON` 등은 **CH13(Selection Screens) 소유** → 게이팅상 여기 추가 안 함(의도된 단순 스코프).

### CH04 — 연산자와 흐름 제어
- **L01**(산술): 베이스라인서 우선순위·괄호·0나눗셈 보강 + **이번에 `DIV`/`MOD` 연산자 도입**(L02서 이전).
- **L02**(문자열): DIV/MOD를 "내장함수"에서 제외(연산자라 L01 소유) — CONCATENATE/&&/SPLIT/FIND/REPLACE/CONDENSE 등 정확 ✓.
- **L03**(IF): 정확 ✓ — 비교연산자 기호/영문, AND/OR/NOT·괄호, IS INITIAL, boolean 부재(C1·abap_true/false·XSDBOOL/BOOLC) 모두 공식과 일치.
- **L04**(CASE)·**L05**(DO/WHILE·EXIT/CONTINUE/CHECK·SY 변수)·**L06**(디버거 BREAK-POINT·/h·F5~F8·WATCH POINT): 정확 ✓.

### CH05 — Structure (Local · DDIC)  → **변경 없음(공식과 일치)**
- **L01**(Local `BEGIN OF/END OF`·Work Area·`-` 접근)·**L02**(DDIC Structure)·**L03**(`=` 통째 대입·CLEAR·MOVE-CORRESPONDING)·**L04**(캡스톤): 정확 ✓.
- modern `CORRESPONDING #( )`는 New Syntax(CH18+)라 의도적 미노출 — 게이팅 준수. 중첩 구조·INCLUDE는 입문 스코프상 생략(타당).
