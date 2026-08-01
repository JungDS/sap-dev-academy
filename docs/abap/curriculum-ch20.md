# CH20 · Advanced ABAP SQL — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 7
> 🕒 생성: 2026-08-01T16:40:30.509Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

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
