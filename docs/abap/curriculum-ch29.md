# CH29 · 고급 문자열 처리: PCRE 정규식 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-03 · ABAP 실무 심화** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 8
> 🕒 생성: 2026-08-01T17:42:33.205Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

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
