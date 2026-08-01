# CH22 · SALV/Grid ALV 표시 제어 심화 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-02 · Modern ABAP과 새 개발 모델** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 8
> 🕒 생성: 2026-08-01T20:47:11.025Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH22 · SALV/Grid ALV 표시 제어 심화 _(난이도: 고급)_

> ALV 표시를 색·셀 단위까지 세밀하게 제어하고 싶다.

**키워드**: Cell Color, Stable Refresh, Event, Layout 심화

**레슨 (8)**
- **CH22-L01 · SALV Sort / Filter / Function 제어** _(order 1)_
  - 다룰 내용: SALV 객체로 정렬·필터·툴바 기능을 코드로 — display 전에 지정한다.
  - 키워드: SALV, Sort, Filter, Function, FACTORY
- **CH22-L02 · SALV Layout / Variant 심화** _(order 2)_
  - 다룰 내용: 표시 설정·컬럼 텍스트·레이아웃 저장 — 개발자 기본값 + 사용자 보기.
  - 키워드: SALV, Display Settings, Columns, Layout, Variant
- **CH22-L03 · Grid ALV Column 제어 심화** _(order 3)_
  - 다룰 내용: Field Catalog로 컬럼을 숨기고·합계·정렬·키 강조 — 화면 표시 지시서.
  - 키워드: Field Catalog, Column, no_out, do_sum, just, key
- **CH22-L04 · Deep Structure 기반 Cell Color** _(order 4)_
  - 다룰 내용: 행이 아니라 셀 하나만 — 행 구조에 색 정보 테이블을 품는다.
  - 키워드: Cell Color, LVC_T_SCOL, Deep Structure, ctab_fname
- **CH22-L05 · Deep Structure 기반 Cell Style** _(order 5)_
  - 다룰 내용: 셀 단위 모양·동작 — 비활성·편집·버튼. 색과 같은 deep, 다른 연결.
  - 키워드: Cell Style, LVC_T_STYL, Deep Structure, stylefname
- **CH22-L06 · Row / Column / Cell Color 선택 기준** _(order 6)_
  - 다룰 내용: 행·컬럼·셀 — 색을 줄 단위를 상황에 맞게 고른다.
  - 키워드: Row Color, Column Color, Cell Color, info_fname, emphasize, ctab_fname
- **CH22-L07 · Stable Refresh와 표시 상태 보존** _(order 7)_
  - 다룰 내용: 갱신해도 스크롤·선택·정렬을 지킨다 — 사용자 흐름 보존.
  - 키워드: Stable Refresh, soft refresh, is_stable, refresh_table_display
- **CH22-L08 · 실습 — 매진 회차 색 강조** _(order 8)_
  - 다룰 내용: 콘서트앱 — 잔여석 계산을 셀 색으로(매진 빨강·임박 노랑).
  - 키워드: 실습, 콘서트앱, Cell Color, 매진, ctab_fname
