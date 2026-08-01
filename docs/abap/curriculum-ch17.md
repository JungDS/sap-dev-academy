# CH17 · Grid ALV 기초 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초 — Classic 완결** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 10
> 🕒 생성: 2026-08-01T17:42:33.196Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH17 · Grid ALV 기초 _(난이도: 중급)_

> ALV를 화면에 박아 풍부하게 제어하고 싶다.

**키워드**: CL_GUI_ALV_GRID, Field Catalog, Layout, Variant

**레슨 (10)**
- **CH17-L01 · CL_GUI_CUSTOM_CONTAINER 생성** _(order 1)_
  - 다룰 내용: 화면 안 ALV가 살 자리 — Custom Control 영역을 ABAP 객체로 붙잡는다.
  - 키워드: CL_GUI_CUSTOM_CONTAINER, Custom Container, Custom Control, container_name
- **CH17-L02 · CL_GUI_ALV_GRID 생성** _(order 2)_
  - 다룰 내용: 컨테이너 위에 ALV 그리드 컨트롤 객체를 얹는다.
  - 키워드: CL_GUI_ALV_GRID, ALV Grid, i_parent, Container
- **CH17-L03 · 출력용 Internal Table 준비** _(order 3)_
  - 다룰 내용: 그리드에 보여줄 데이터를 내부 테이블에 담는다 — SELECT와 결과 확인.
  - 키워드: Internal Table, SELECT INTO TABLE, sy-subrc, sy-dbcnt, ALV 데이터
- **CH17-L04 · Field Catalog 기초** _(order 4)_
  - 다룰 내용: 데이터 필드를 사용자가 보는 컬럼으로 — 제목·너비·순서 제어.
  - 키워드: Field Catalog, LVC_T_FCAT, LVC_S_FCAT, LVC_FIELDCATALOG_MERGE, coltext
- **CH17-L05 · Layout 기본 설정** _(order 5)_
  - 다룰 내용: 표 전체의 보기 설정 — 줄무늬·선택 모드·제목·너비 최적화(LVC_S_LAYO).
  - 키워드: Layout, LVC_S_LAYO, zebra, sel_mode, cwidth_opt
- **CH17-L06 · Variant 기본 설정** _(order 6)_
  - 다룰 내용: 사용자가 표시 방식(컬럼 순서·필터)을 저장·재사용하는 Display Variant.
  - 키워드: Display Variant, DISVARIANT, is_variant, i_save, sy-repid
- **CH17-L07 · SET_TABLE_FOR_FIRST_DISPLAY** _(order 7)_
  - 다룰 내용: 데이터·fieldcat·layout·variant를 묶어 그리드를 처음 띄운다.
  - 키워드: set_table_for_first_display, EXPORTING, CHANGING, ALV display
- **CH17-L08 · Refresh와 Stable Refresh 기초** _(order 8)_
  - 다룰 내용: 데이터 변경과 화면 갱신은 별개 — refresh로 다시 그리고, stable로 위치를 지킨다.
  - 키워드: refresh_table_display, Stable Refresh, is_stable, LVC_S_STBL
- **CH17-L09 · 행 색상 기초** _(order 9)_
  - 다룰 내용: 중요한 행을 색으로 강조 — 색 코드 컬럼 + layout info_fname.
  - 키워드: 행 색상, info_fname, rowcolor, LVC_S_LAYO
- **CH17-L10 · 종합 실습 — 예매 목록 Grid ALV 완성** _(order 10)_
  - 다룰 내용: 컨테이너부터 색까지, 배운 조각을 책임별 FORM으로 나눠 하나의 화면으로 모은다.
  - 키워드: 실습, Grid ALV, 예매목록, 통합, FORM
