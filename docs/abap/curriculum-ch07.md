# CH07 · Open SQL 기본 조회 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 3
> 🕒 생성: 2026-06-22T07:11:31.765Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

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
