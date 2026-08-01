# CH06 · Internal Table — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초 — Classic 완결** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 6
> 🕒 생성: 2026-08-01T17:42:33.188Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

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
