# CH05 · Internal Table — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 4
> 🕒 생성: 2026-06-22T07:11:31.763Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

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
