# CH07 · Transparent Table (SE11) — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초 — Classic 완결** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 3
> 🕒 생성: 2026-08-01T17:42:33.189Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH07 · Transparent Table (SE11) _(난이도: 초급)_

> 프로그램이 끝나면 값이 사라진다 — 영속적으로 저장하고 싶다.

**키워드**: Transparent Table, SE11, Create Entries, Key, 영속

**레슨 (3)**
- **CH07-L01 · Transparent Table 생성 (SE11)** _(order 1)_
  - 다룰 내용: 값을 영구히 — DB에 1:1로 대응하는 투명 테이블을 만든다.
  - 키워드: Transparent Table, SE11, Key, MANDT, Data Element
- **CH07-L02 · Create Entries로 구구단 입력 · 데이터 조회** _(order 2)_
  - 다룰 내용: 만든 테이블에 손으로 데이터를 넣고(SE11 Create Entries) 확인한다.
  - 키워드: Create Entries, SE11, Table Contents, Transparent Table
- **CH07-L03 · Transparent ↔ Structure ↔ Table Type 비교** _(order 3)_
  - 다룰 내용: 같은 DDIC 모양이 쓰임에 따라 작업영역·내부테이블·영속테이블이 된다.
  - 키워드: Transparent Table, Structure, Table Type, 영속, 비교
