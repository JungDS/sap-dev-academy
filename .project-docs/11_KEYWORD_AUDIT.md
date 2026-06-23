# 11. KEYWORD AUDIT — 공식 ABAP Keyword Doc 대비 콘텐츠 감사 원장

> 📅 최종수정: 2026-06-23 09:38 KST
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
| CH01 | ✅ 1차 완료(리뷰 대기) | L05 `introduces`↔본문 불일치 교정 |
| CH02~CH36 | ⬜ 대기 | |

## 챕터별 findings

### CH01 — 개발 환경과 첫 프로그램
- **L01/L02/L06/L07**: GUI·툴링(로그온·SE38·T-code·$TMP·패키지·SE93) — keyword doc 영역 밖 → 감사 N/A.
- **L03**(REPORT·주석·마침표): 공식과 일치 ✓ — 주석 `*`=컬럼1 / `"`=인라인, 마침표 종결, 키워드 대소문자 무시 모두 정확.
- **L04**(WRITE·`/`·콜론 체인·리터럴): 정확 ✓ — `NEW-LINE` 언급 포함.
- **L05**(WRITE 서식): **`introduces`↔본문 불일치 교정** —
  - ➕ 추가: `FORMAT`(색을 여러 줄에 set-once → `FORMAT RESET`), `CURRENCY`(통화별 소수 자리) — 선언됐으나 본문 누락이던 것.
  - ➖ 트림: `EDIT MASK`(정확 구문 `USING EDIT MASK` — CH01엔 niche, 도입 보류), `WRITE TO`(홈 = CH04-L02, R15 중복 제거) → `introduces`에서 제외.

## 선반영 노트 (다른 챕터에서 미리 발견)
- **CH04**: `DIV`/`MOD`는 산술 **연산자**(공식 `abenarith_operators.htm` 우선순위 2)인데 CH04-L02가 "내장함수"로 분류. → CH04 감사 때 **L01로 이전 + L02에서 제외**(개념당 L3 한 곳, R15). *(구 background 칩 task_fca1391b를 이 노트로 대체.)*
- **CH04-L01**: 베이스라인 커밋(`882f63c`)에서 연산 우선순위·괄호·0나눗셈 주의 이미 보강됨 — CH04 감사 때 중복 점검 불필요.
