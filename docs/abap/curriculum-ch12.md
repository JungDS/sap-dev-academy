# CH12 · Open SQL 2차: JOIN·집계 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 7
> 🕒 생성: 2026-06-22T07:11:31.768Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

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
