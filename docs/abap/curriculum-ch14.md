# CH14 · Classic DDIC View·유지보수 객체 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초 — Classic 완결** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 9
> 🕒 생성: 2026-08-01T17:42:33.194Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH14 · Classic DDIC View·유지보수 객체 _(난이도: 중급)_

> 테이블을 더 보기 좋게 보여주고, 마스터데이터를 유지보수하고 싶다.

**키워드**: Database View, Maintenance View, Table Maintenance

**레슨 (9)**
- **CH14-L01 · Database View와 Open SQL JOIN 비교** _(order 1)_
  - 다룰 내용: 반복되는 JOIN을 DDIC에 등록해 재사용 — Database View vs 코드 JOIN.
  - 키워드: Database View, JOIN, DDIC, SE11, inner join
- **CH14-L02 · Projection View 개념과 한계** _(order 2)_
  - 다룰 내용: 한 테이블에서 필요한 필드만 노출 — Projection View와 그 한계.
  - 키워드: Projection View, DDIC, 필드 제한
- **CH14-L03 · Help View와 Search Help 연결** _(order 3)_
  - 다룰 내용: F4 도움말을 풍부하게 — 여러 테이블을 묶는 Help View.
  - 키워드: Help View, Search Help, F4, DDIC, outer join
- **CH14-L04 · Maintenance View와 Foreign Key 관계** _(order 4)_
  - 다룰 내용: 관련 테이블을 표준 화면에서 함께 유지보수 — Maintenance View와 Foreign Key.
  - 키워드: Maintenance View, Foreign Key, 유지보수, SE54
- **CH14-L05 · Table Maintenance Generator / SM30** _(order 5)_
  - 다룰 내용: 테이블/뷰에 표준 유지보수 화면을 생성 — SM30로 운영.
  - 키워드: Table Maintenance Generator, SM30, 유지보수
- **CH14-L06 · View Cluster — 관련 뷰를 묶어 유지보수** _(order 6)_
  - 다룰 내용: 마스터+종속 테이블을 한 흐름으로 — SE54 View Cluster.
  - 키워드: View Cluster, SE54, 유지보수, 계층
- **CH14-L07 · SE16N 데이터 브라우저** _(order 7)_
  - 다룰 내용: 테이블 내용을 빠르게 조회하는 만능 브라우저 — SE16N.
  - 키워드: SE16N, 데이터 브라우저, Table Contents
- **CH14-L08 · Classic View와 CDS 비교** _(order 8)_
  - 다룰 내용: 클래식 뷰가 푼 문제와, 현대 CDS로의 경계(예고).
  - 키워드: Classic View, CDS, View Entity, 비교
- **CH14-L09 · 실습 — 공연 등록 화면 (View · SM30)** _(order 9)_
  - 다룰 내용: 콘서트앱 — 챕터의 도구를 '공연 등록과 확인' 한 흐름으로 묶기.
  - 키워드: 실습, 콘서트앱, Database View, SM30, Maintenance View, F4
