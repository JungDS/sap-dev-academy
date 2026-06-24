# CH13 · Classic DDIC View·유지보수 객체 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 6
> 🕒 생성: 2026-06-22T07:11:31.768Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH13 · Classic DDIC View·유지보수 객체 _(난이도: 중급)_

> 테이블을 더 보기 좋게 보여주고, 마스터데이터를 유지보수하고 싶다.

**키워드**: Database View, Maintenance View, Table Maintenance

**레슨 (6)**
- **CH13-L01 · Database View와 Open SQL JOIN 비교** _(order 1)_
  - 다룰 내용: JOIN을 DDIC에 박아 재사용 — Database View vs 코드 JOIN.
  - 키워드: Database View, JOIN, DDIC, SE11
- **CH13-L02 · Projection View 개념과 한계** _(order 2)_
  - 다룰 내용: 한 테이블의 일부 필드만 — Projection View와 그 한계.
  - 키워드: Projection View, DDIC, 필드 제한
- **CH13-L03 · Help View와 Search Help 연결** _(order 3)_
  - 다룰 내용: 여러 테이블에서 F4 값을 뽑는 소스 — Help View.
  - 키워드: Help View, Search Help, F4, DDIC
- **CH13-L04 · Maintenance View와 Foreign Key 관계** _(order 4)_
  - 다룰 내용: 관련 테이블을 함께 유지보수 — Maintenance View.
  - 키워드: Maintenance View, Foreign Key, 유지보수
- **CH13-L05 · Table Maintenance Generator / SM30** _(order 5)_
  - 다룰 내용: 테이블/뷰에 표준 유지보수 화면을 생성 — SM30로 운영.
  - 키워드: Table Maintenance Generator, SM30, 유지보수
- **CH13-L06 · Classic View와 CDS View Entity 비교 준비** _(order 6)_
  - 다룰 내용: 클래식 뷰의 한계와, 현대 CDS로의 다리(미리보기).
  - 키워드: Classic View, CDS, View Entity, 비교
